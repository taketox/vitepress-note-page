# LinkedBlockingDeque

## 简介

`LinkedBlockingDeque`来自于`JDK1.5`的`JUC`包，是一个支持并发操作的有界阻塞队列，底层数据结构是一个双链表，可以看作`LinkedList`的并发版本！

`LinkedBlockingDeque`实现了`BlockingDeque`接口，而`BlockingDeque`继承了`BlockingQueue`并对其进行了扩展，这使得`LinkedBlockingDeque`不再局限于`FIFO`的传统队列元素存取模式，而是可以从队列的两端任意进行插入和移除元素，因此更加的灵活。

除了`BlockingQueue`的一套方法之外，额外增加了一套以`First`结尾的方法比如`addFirst`、`removeFirst`、`getFirst`等用于针对队列头部的插入、移除和检查操作，额外增加了一套以`Last`结尾的方法比如`addLast`、`removeLast`、`getLast`等用于针对队列尾部的插入、移除和检查操作。

和`LinkedBlockingQueue`一样，`LinkedBlockingDeque`同样作为有界队列，默认元素个数就是最大容量，即`Integer.MAX_VALUE`，也可以指定最大容量。

实现了`Serializable`接口，支持序列化，没有实现`Cloneable`，不支持克隆！

不支持`null`元素！

## 源码分析

### 主要属性

由于采用链表结构来保存数据，因此具有头、尾结点的引用`first`、`last`，链表结点类型是内部类`Node`类型。由于是一个有界队列，容量使用`capacity`变量来保存，`capacity`是`int`类型的，因此`LinkedBlockingDeque`的容量最大是`Integer.MAX_VALUE`。使用一个`int`类型的`count`来作为元素计数器。

具有一把`ReentrantLock`类型的锁`lock`，生产和消费线程都需要获取同一个锁。具有两个条件变量，`notEmpty`条件变量用于消费线程的阻塞和唤醒，`notFull`条件变量用于生产线程的阻塞和唤醒！

```java
/**
 * 头结点，可以为null
 */
transient Node<E> first;

/**
 * 尾结点，可以为null
 */
transient Node<E> last;

/**
 * 队列元素计数器
 */
private transient int count;

/**
 * 队列的容量，初始化之后就不能变了
 */
private final int capacity;

/**
 * 生产、消费都需要获取的锁
 */
final ReentrantLock lock = new ReentrantLock();

/**
 * notEmpty条件对象，当队列为空时用于挂起消费线程
 */
private final Condition notEmpty = lock.newCondition();

/**
 * notFull条件对象，当队列已满时用于挂起生产线程
 */
private final Condition notFull = lock.newCondition();

/**
 * 双端队列的结点实现类
 */
static final class Node<E> {
    /**
     * 值域，如果结点被删除则item为null
     */
    E item;

    /**
     * 结点的前驱
     */
    Node<E> prev;

    /**
     * 结点的后继
     */
    Node<E> next;

    /**
     * 构造器
     *
     * @param x 元素值
     */
    Node(E x) {
        item = x;
    }
}
```

### 构造器

```java
/**
 * 创建一个容量为 Integer.MAX_VALUE 的 LinkedBlockingDeque。
 */
public LinkedBlockingDeque() {
    //调用另一个构造器，参数为Integer.MAX_VALUE
    this(Integer.MAX_VALUE);
}

/**
 * 创建一个具有指定容量的 LinkedBlockingDeque。
 *
 * @param capacity 指定容量
 * @throws IllegalArgumentException 如果 capacity 小于1，则抛出IllegalArgumentException。
 */
public LinkedBlockingDeque(int capacity) {
    //capacity大小的校验
    if (capacity <= 0) throw new IllegalArgumentException();
    //capacity初始化为指定值
    this.capacity = capacity;
}

/**
 * 创建一个容量是Integer.MAX_VALUE的LinkedBlockingDeque，
 * 包含指定集合的全部元素，元素按该集合迭代器的遍历顺序添加。
 *
 * @param c 指定集合
 * @throws NullPointerException 如果指定集合为或任意元素为null
 */
public LinkedBlockingDeque(Collection<? extends E> c) {
    //调用另一个构造器，初始化容量为Integer.MAX_VALUE
    this(Integer.MAX_VALUE);
    final ReentrantLock lock = this.lock;
    //这里和LinkedBlockingQueue是一样的，需要加锁来保证数据的可见性，因为头、尾结点没有使用volatile修饰
    //获取锁
    lock.lock(); // Never contended, but necessary for visibility
    try {
        //遍历指定集合
        for (E e : c) {
            //null校验
            if (e == null)
                throw new NullPointerException();
            //调用linkLast将指定集合的元素添加到队列尾部
            if (!linkLast(new Node<E>(e)))
                //如果linkLast返回false，说明集合元素数量达到了最大容量，因此抛出异常
                throw new IllegalStateException("Deque full");
        }
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

创建一个容量是`Integer.MAX_VALUE`的`LinkedBlockingDeque`，包含指定集合的全部元素，元素按该集合迭代器的遍历顺序添加。

如果指定集合为或任意元素为`null`，则抛出`NullPointerException`。如果指定集合元素数量超过`Integer.MAX_VALUE`，那么抛出`IllegalStateException`。

### 入队操作

#### 入队尾

`put`、`offer`、`add`、`offer`等方法都是在队列的尾部添加元素。它们将核心实现委托给`putLast`、`offerLast`实现

```java
public void put(E e) throws InterruptedException {
    //内部直接调用putLast方法
    putLast(e);
}

public boolean offer(E e) {
    return offerLast(e);
}
public boolean add(E e) {
    addLast(e);
    return true;
}
public boolean offer(E e, long timeout, TimeUnit unit)
    throws InterruptedException {
    return offerLast(e, timeout, unit);
}
```

##### putLast(e)方法

将指定的元素插入此队列的尾部，如果该队列已满，则线程等待。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。另外，如果指定元素为`null`则抛出`NullPointerException`异常。

```java
public void putLast(E e) throws InterruptedException {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取生产者锁，即不响应中断
    lock.lock();
    try {
        //循环调用linkLast尝试将node结点加入队尾
        while (!linkLast(node))
            //如果失败，表示队列满了，那么该线程在notFull条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并循环判断
            notFull.await();
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

大概步骤为：

1. 指定元素`e`的`null`检测，通过之后新建`Node`结点传入指定元素`e`。
2. 不可中断的等待获取锁，即不响应中断，获取不到就在该锁的同步队列中等待被唤醒，等待时被中断之后会继续尝试获取锁；
3. 获取到锁之后，循环调用`linkLast`尝试将`node`结点加入队尾。如果`linkLast`返回`false`，表示队列满了加入失败，那么该线程在`notFull`条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并继续循环调用`linkLast`。
4. 如果`linkLast`返回`true`，表示加入成功，那么循环结束。
5. 无论过程中发生了什么，最后的`finally`中解锁。

##### offerLast(e)方法

将指定的元素插入到此队列的尾部。在成功时返回`true`，如果此队列已满，则不阻塞，则立即返回`false`。

如果指定元素`e`为`null`，则抛出`NullPointerException`异常。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已满，则立即返回`false`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

相比于`putLast`方法，内部仅仅会调用一次`linkLast`方法，无论成功还是失败。

```java
public boolean offerLast(E e) {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //仅仅调用一次linkLast方法，返回linkLast的返回值，无论成功还是失败
        return linkLast(node);
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### offer(e)方法

将指定的元素插入到此队列的尾部。在成功时返回`true`，如果此队列已满，则不阻塞，则立即返回`false`。

如果指定元素`e`为`null`，则抛出`NullPointerException`异常。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已满，则立即返回`false`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

内部就是调用的`offerLast(e)`方法。

```java
public boolean offer(E e) {
    //内部直接调用offerLast方法
    return offerLast(e);
}
```

##### offerLast(e, timeout, unit)方法

将指定的元素插入此队列的尾部，如果该队列已满，则在到达指定的等待时间之前等待可用的空间。如果插入成功，则返回`true`；如果在空间可用前超过了指定的等待时间，则返回`false`。

如果因为获取不到锁而在同步队列中等待的时候被中断则抛出`InterruptedException`，即响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。另外，如果指定元素`e`为`null`则抛出`NullPointerException`异常。

相比于`putLast`，并不是无限循环，而是循环指定的时间。

```java
public boolean offerLast(E e, long timeout, TimeUnit unit)
        throws InterruptedException {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    //计算超时时间纳秒
    long nanos = unit.toNanos(timeout);
    final ReentrantLock lock = this.lock;
    //可中断的等待获取锁，即响应中断
    lock.lockInterruptibly();
    try {
        //循环调用linkLast尝试将node结点加入队尾
        while (!linkLast(node)) {
            //如果加入失败，判断剩余超时时间是否小于等于0，即是否超时
            if (nanos <= 0)
                //如果超时，那么直接返回false
                return false;
            //如果没有超时，该线程在notFull条件队列中等待nanos时间
            //被唤醒或者中断之后，将会返回剩余的等待时间，随后继续循环
            nanos = notFull.awaitNanos(nanos);
        }
        //如果加入成功，那么返回true
        return true;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

#### 入队头

##### putFirst(e)方法

将指定的元素插入此双端队列的头部，如果该队列已满，则线程等待。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。另外，如果指定元素为`null`则抛出`NullPointerException`异常。

很简单，大概步骤为：

1. 指定元素`e`的`null`检测，通过之后新建`Node`结点传入指定元素`e`。
2. 不可中断的等待获取锁，即不响应中断，获取不到就在该锁的同步队列中等待被唤醒，等待时被中断之后会继续尝试获取锁；
3. 获取到锁之后，循环调用`linkFirst`尝试将`node`结点加入队头。如果`linkFirst`返回`false`，表示队列满了加入失败，那么该线程在`notFull`条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并继续循环调用`linkFirst`。
4. 如果`linkFirst`返回`true`，表示加入成功，那么循环结束。
5. 无论过程中发生了什么，最后的`finally`中解锁。

```java
public void putFirst(E e) throws InterruptedException {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //循环调用linkFirst尝试将node结点加入队头
        while (!linkFirst(node))
            //如果失败，表示队列满了，那么该线程在notFull条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并循环判断
            notFull.await();
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

**linkFirst链接尾结点：**

`linkFirst`用于将指定`node`结点链接到队列头部成为新的头结点，原理很简单就是在原头结点`first`指向的结点前面新添加一个`node`结点，同时建立`prev`和`next`的引用关系。如果最开始队列为空，那么`head`和`last`都指向该`node`结点。

如果队列满了，那么直接返回`false`，如果链接成功，那么将会唤醒一个在`notEmpty`等待的消费线程，并返回`true`。

```java
/**
 * 将指定结点链接到队列头部成为新的头结点
 */
private boolean linkFirst(Node<E> node) {
    // assert lock.isHeldByCurrentThread();
    //如果队列满了，那么直接返回false
    if (count >= capacity)
        return false;
    //队列未满
    //f变量保存此时的first队头结点，可能为null
    Node<E> f = first;
    //新结点的前驱设置为f
    node.next = f;
    //first指向新结点
    first = node;
    //如果last也为null，说明队列为空
    if (last == null)
        //那么last也指向该结点
        last = node;
        //否则说明队列不为空，f也肯定不为null
    else
        //f的前驱指向新结点
        f.prev = node;
    //计数器自增1
    ++count;
    //添加了元素结点之后，唤醒在notEmpty等待的消费线程
    notEmpty.signal();
    //返回true
    return true;
}
```

##### offerFirst(e)方法

将指定的元素插入到此队列的头部。在成功时返回`true`，如果此队列已满，则不阻塞，则立即返回`false`。

如果指定元素`e`为`null`，则抛出`NullPointerException`异常。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已满，则立即返回`false`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

相比于`putFirst`方法，内部仅仅会调用一次`linkFirst`方法，无论成功还是失败。

```java
public boolean offerFirst(E e) {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //仅仅调用一次linkFirst方法，返回linkFirst的返回值，无论成功还是失败
        return linkFirst(node);
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### offerFirst(e, timeout, unit)方法

将指定的元素插入此队列的头部，如果该队列已满，则在到达指定的等待时间之前等待可用的空间。如果插入成功，则返回`true`；如果在空间可用前超过了指定的等待时间，则返回`false`。

如果因为获取不到锁而在同步队列中等待的时候被中断则抛出`InterruptedException`，即响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。另外，如果指定元素`e`为`null`则抛出`NullPointerException`异常。

相比于`putFirst`，并不是无限循环，而是循环指定的时间。

```java
public boolean offerFirst(E e, long timeout, TimeUnit unit)
        throws InterruptedException {
    //e的校验
    if (e == null) throw new NullPointerException();
    //新建Node结点
    Node<E> node = new Node<E>(e);
    //计算超时时间纳秒
    long nanos = unit.toNanos(timeout);
    final ReentrantLock lock = this.lock;
    //可中断的等待获取锁，即响应中断
    lock.lockInterruptibly();
    try {
        //循环调用linkFirst尝试将node结点加入队头
        while (!linkFirst(node)) {
            //如果加入失败，判断剩余超时时间是否小于等于0，即是否超时
            if (nanos <= 0)
                //如果超时，那么直接返回false
                return false;
            //如果没有超时，该线程在notFull条件队列中等待nanos时间
            //被唤醒或者中断之后，将会返回剩余的等待时间，随后继续循环
            nanos = notFull.awaitNanos(nanos);
        }
        //如果加入成功，那么返回true
        return true;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### addFirst(e)方法

将指定元素插入此队列头部。成功时返回`true`，如果当前没有可用的空间，则抛出`IllegalStateException`，如果`e`元素为`null`则抛出`NullPointerException`异常。当使用有容量限制的队列时，通常首选`offerFirst`方法。

如果因为获取不到锁而在同步队列中等待的时候被中断也会继续等待获取锁，即不响应中断。如果`e`元素为`null`则抛出`NullPointerException`异常。

内部实际上就是调用的`offerFirst`方法，并根据`offerFirst`方法的返回值判断是否需要抛出异常！

```java
public void addFirst(E e) {
    //实际上调用的offerFirst方法
    if (!offerFirst(e))
        //如果插入失败直接抛出IllegalStateException异常
        throw new IllegalStateException("Deque full");
}
```

### 出队操作

#### 出队头

##### takeFirst()方法

获取并移除此双端队列的头部元素，如果该队列已空，则线程等待。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

很简单，大概步骤为：

1. 不可中断的等待获取锁，即不响应中断，获取不到就在该锁的同步队列中等待被唤醒，等待时被中断之后会继续尝试获取锁；
2. 获取到锁之后，循环调用`unlinkFirst`尝试移除队头。如果`unlinkFirst`返回`null`，表示队列空了加移除失败，那么该线程在`notEmpty`条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并继续循环调用`unlinkFirst`。
3. 如果`unlinkFirst`返回值`x`不为`null`，表示加入成功，那么循环结束，返回`x`。
4. 无论过程中发生了什么，最后的`finally`中解锁。

```java
public E takeFirst() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        E x;
        //循环调用unlinkFirst尝试将头结点出队并返回结点的item值x
        while ((x = unlinkFirst()) == null)
            //如果x为null，表示队列空了，那么该线程在notEmpty条件队列中等待并释放锁，
            //  被唤醒之后会继续尝试获取锁、并循环判断
            notEmpty.await();
        //x不为null，表示出队成功，结束循环，返回x
        return x;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

**unlinkFirst移除队头：**

`unlinkFirst`用于移除链表头结点并将其后继作为新的头结点，原理很简单就是移除原头结点`first`和其后继的`prev`和`next`的引用关系。如果移除之后队列为空，那么`head`和`last`都指向`null`。

如果队列空了，那么直接返回`null`，如果移除成功，那么将会唤醒一个在`notFull`等待的生产线程，并返回头结点的`item`值。

另外，这里被移除的头结点会将`next`的引用指向自己，除了能够正常的被`GC`回收之外，同时用于迭代器辨认是该结点被删除了而不是到达了队列末尾，因为迭代器中以后继为`null`表示迭代完毕，在迭代器的`succ`方法部分会讲到！

```java
/**
 * 尝试将头结点出队并返回结点的item值x
 *
 * @return 不为null 出队成功；null 队列已空
 */
private E unlinkFirst() {
    // assert lock.isHeldByCurrentThread();
    //f变量保存此时的first队头结点，可能为null
    Node<E> f = first;
    //如果f为null，表示队列为空，直接返回null
    if (f == null)
        return null;
    //获取f的后继结点n
    Node<E> n = f.next;
    //获取f结点的item值item
    E item = f.item;
    //f的item置空
    f.item = null;
    //f的后继指向自己，结点出队列，同时用于迭代器辨认是该结点被删除了而不是到达了队列末尾，
    //  因为迭代器中以后继为null表示迭代完毕，在迭代器的succ方法部分会讲到
    f.next = f; // help GC
    //first指向f的后继n
    first = n;
    //如果n为null
    if (n == null)
        //那么last指向null
        last = null;
        //如果n不为null
    else
        //n的前驱置空
        n.prev = null;
    //计数器自减1
    --count;
    //出队成功之后，唤醒在notFull等待的生产线程
    notFull.signal();
    //返回item
    return item;
}
```

##### take()方法

获取并移除此双端队列的头部元素，如果该队列已空，则线程等待。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

内部就是调用的`takeFirst()`方法。

```java
public E take() throws InterruptedException {
    //内部直接调用takeFirst方法
    return takeFirst();
}
```

##### pollFirst()方法

获取并移除此双端队列的头部元素，如果该队列已空，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已空，则立即返回 `null`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

相比于`takeFirst`方法，内部仅仅会调用一次`unlinkFirst`方法，无论返回什么。

```java
public E pollFirst() {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //仅仅调用一次unlinkFirst方法，返回unlinkFirst的返回值，无论成功还是失败
        return unlinkFirst();
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### poll()方法

获取并移除此双端队列的头部元素，如果该队列已空，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已空，则立即返回`null`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

内部就是调用的`pollFirst()`方法。

```java
public E poll() {
    //内部就是调用的pollFirst()方法。
    return pollFirst();
}
```

##### pollFirst(timeout, unit)方法

获取并移除此双端队列的头部元素，如果该队列已空，则在到达指定的等待时间之前等待队列非空。如果移除成功，则返回被移除的头部元素；如果在队列非空前超过了指定的等待时间，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则抛出`InterruptedException`，即响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

相比于`takeFirst`方法，并不是无限循环，而是循环指定的时间。

```java
public E pollFirst(long timeout, TimeUnit unit)
        throws InterruptedException {
    //计算超时时间纳秒
    long nanos = unit.toNanos(timeout);
    final ReentrantLock lock = this.lock;
    //可中断的等待获取锁，即响应中断
    lock.lockInterruptibly();
    try {
        E x;
        //循环调用unlinkFirst尝试将头结点出队并返回结点的item值x
        while ((x = unlinkFirst()) == null) {
            //如果出队失败，判断剩余超时时间是否小于等于0，即是否超时
            if (nanos <= 0)
                //如果超时，那么直接返回null
                return null;
            //如果没有超时，该线程在notEmpty条件队列中等待nanos时间
            //被唤醒或者中断之后，将会返回剩余的等待时间，随后继续循环
            nanos = notEmpty.awaitNanos(nanos);
        }
        //如果出队成功，那么返回true
        return x;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### poll(timeout, unit)方法

获取并移除此双端队列的头部元素，如果该队列已空，则在到达指定的等待时间之前等待队列非空。如果移除成功，则返回被移除的头部元素；如果在队列非空前超过了指定的等待时间，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则抛出`InterruptedException`，即响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

内部就是调用的`pollFirst(timeout`, `unit)`方法。

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
    //内部就是调用的pollFirst(timeout, unit)方法。
    return pollFirst(timeout, unit);
}
```

##### removeFirst()方法

获取并移除此双端队列的头部元素。此方法与`pollFirst`唯一的不同在于如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`pollFirst`方法，并根据`pollFirst`方法的返回值判断是否需要抛出异常！

```java
public E removeFirst() {
    //实际上调用的pollFirst方法
    E x = pollFirst();
    //如果返回值为null，那么抛出NoSuchElementException
    if (x == null) throw new NoSuchElementException();
    //返回x
    return x;
}
```

##### remove()方法

获取并移除此双端队列的头部元素。此方法与`pollFirst`唯一的不同在于如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`removeFirst`方法。

```java
public E remove() {
    //内部实际上就是调用的removeFirst方法。
    return removeFirst();
}
```

#### 出队尾

##### takeLast()方法

获取并移除此双端队列的尾部元素，如果该队列已空，则线程等待。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

很简单，大概步骤为：

1. 不可中断的等待获取锁，即不响应中断，获取不到就在该锁的同步队列中等待被唤醒，等待时被中断之后会继续尝试获取锁；
2. 获取到锁之后，循环调用`unlinkLast`尝试移除队尾。如果`unlinkLast`返回`null`，表示队列空了移除失败，那么该线程在`notEmpty`条件队列中等待并释放锁，被唤醒之后会继续尝试获取锁、并继续循环调用`unlinkLast`。
3. 如果`unlinkLast`返回值`x`不为`null`，表示加入成功，那么循环结束，返回`x`。
4. 无论过程中发生了什么，最后的`finally`中解锁。

```java
public E takeLast() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        E x;
        //循环调用unlinkLast尝试将尾结点出队并返回结点的item值x
        while ((x = unlinkLast()) == null)
            //如果x为null，表示队列空了，那么该线程在notEmpty条件队列中等待并释放锁，
            //      被唤醒之后会继续尝试获取锁、并循环判断
            notEmpty.await();
        //x不为null，表示出队成功，结束循环，返回x
        return x;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### pollLast()方法

获取并移除此双端队列的尾部元素，如果该队列已空，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则会继续等待，即不响应中断。这里的“不会阻塞”是说的获取锁之后如果发现此队列已空，则立即返回`null`，而不会阻塞在条件队列上！因此如果该锁被其他线程获取了，当前调用`offer`方法的线程还是会因为获取不到锁而被阻塞在`lock`的同步队列中！

相比于`takeLast`方法，内部仅仅会调用一次`unlinkLast`方法，无论返回什么。

```java
public E pollLast() {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //仅仅调用一次unlinkLast方法，返回unlinkLast的返回值，无论成功还是失败
        return unlinkLast();
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### pollLast(timeout, unit)方法

获取并移除此双端队列的尾部元素，如果该队列已空，则在到达指定的等待时间之前等待队列非空。如果移除成功，则返回被移除的尾部元素；如果在队列非空前超过了指定的等待时间，则返回`null`。

如果因为获取不到锁而在同步队列中等待的时候被中断则抛出`InterruptedException`，即响应中断，如果因为队列满了在条件队列中等待的时候在其他线程调用`signal`、`signalAll`方法唤醒该线程之前就因为中断而被唤醒了，也会抛出`InterruptedException`。

相比于`takeLast`方法，并不是无限循环，而是循环指定的时间。

```java
public E pollLast(long timeout, TimeUnit unit)
        throws InterruptedException {
    //计算超时时间纳秒
    long nanos = unit.toNanos(timeout);
    final ReentrantLock lock = this.lock;
    //可中断的等待获取锁，即响应中断
    lock.lockInterruptibly();
    try {
        E x;
        //循环调用unlinkLast尝试将尾结点出队并返回结点的item值x
        while ((x = unlinkLast()) == null) {
            //如果出队失败，判断剩余超时时间是否小于等于0，即是否超时
            if (nanos <= 0)
                //如果超时，那么直接返回null
                return null;
            //如果没有超时，该线程在notEmpty条件队列中等待nanos时间，
            //   被唤醒或者中断之后，将会返回剩余的等待时间，随后继续循环
            nanos = notEmpty.awaitNanos(nanos);
        }
        //如果出队成功，那么返回true
        return x;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### removeLast()方法

获取并移除此双端队列的尾部元素。此方法与`pollLast`唯一的不同在于如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`pollLast`方法，并根据`pollLast`方法的返回值判断是否需要抛出异常！

```java
public E removeLast() {
    //实际上调用的pollFirst方法
    E x = pollLast();
    //如果返回值为null，那么抛出NoSuchElementException
    if (x == null) throw new NoSuchElementException();
    //返回x
    return x;
}
```

#### remove(o)方法

从此队列中移除指定元素的单个实例（如果存在）。如果移除成功则返回`true`；没有找到指定元素或者指定元素为`null`则返回`false`。

从队列头开始遍历队列，查找和具有和指定元素`o`使用`equals`比较返回`true`的`item`值的元素`p`，然后调用`unlink`移除`p`结点！

```java
public boolean remove(Object o) {
    //内部调用removeFirstOccurrence方法
    return removeFirstOccurrence(o);
}

/**
 * 移除第一次出现的指定元素
 *
 * @param o 指定元素
 * @return 如果移除成功则返回 true；没有找到指定元素或者指定元素为null则返回false。
 */
public boolean removeFirstOccurrence(Object o) {
    //如果o为null，直接返回null
    if (o == null) return false;
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取锁，即不响应中断
    lock.lock();
    try {
        //重头到尾遍历整个链表，查找与具有指定元素o相等的item值的结点
        for (Node<E> p = first; p != null; p = p.next) {
            //使用equals比较
            if (o.equals(p.item)) {
                //将该结点移除队列
                unlink(p);
                //返回true
                return true;
            }
        }
        //没找到，返回false
        return false;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### unlink移除指定结点

这里被移除的结点如果是中间结点，会将`item`置为`null`，并且它的前驱后继直接关联，但是它自己的前驱后继关系并没有移除，除了表示该结点出队列之外，同时用于迭代器辨认是该中间结点是否被删除了，因为可能存在迭代器正在迭代这个中间结点，此时迭代器就可以跳过这个结点，在迭代器的`succ`方法部分会讲到。

```java
/**
 * 移除指定结点x
 */
void unlink(Node<E> x) {
    // assert lock.isHeldByCurrentThread();
    //获取x的前驱p
    Node<E> p = x.prev;
    //获取x的后继n
    Node<E> n = x.next;
    //如果p为null，那么相当于移除头结点，直接调用unlinkFirst方法即可
    if (p == null) {
        unlinkFirst();
    }
    //否则，如果n为null，那么相当于移除尾结点，直接调用unlinkLast方法即可
    else if (n == null) {
        unlinkLast();
    }
    //否则，表示移除中间结点
    else {
        //p的后继设置为n
        p.next = n;
        //n的前驱设置为p
        n.prev = p;
        //x结点的item值置为null
        x.item = null;
        //这里没有将x的prev和next引用置空，因为可能存在迭代器正在迭代这个结点，在迭代器的succ方法部分会讲到。
        //计数器之间一
        --count;
        //出队成功之后，唤醒在notFull等待的生产线程
        notFull.signal();
    }
}
```

### 检查操作

#### 检查队头

##### peekFirst()方法

获取但不移除此队列的头；如果此队列为空，则返回`null`。

```java
public E peekFirst() {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取消费者锁，即不响应中断
    lock.lock();
    try {
        //如果first为null，那么返回null，否则返回first的item值
        return (first == null) ? null : first.item;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### peek()方法

获取但不移除此队列的头；如果此队列为空，则返回`null`。

内部直接调用`peekFirst`方法。

```java
public E peek() {
    //内部直接调用peekFirst方法
    return peekFirst();
}
```

##### getFirst()方法

获取但不移除此队列的头；此方法与`peekFirst`唯一的不同在于：如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`peekFirst`方法，并根据`peekFirst`方法的返回值判断是否需要抛出异常！

```java
public E getFirst() {
    //内部调用peekFirst方法获取返回值x
    E x = peekFirst();
    //如果x不为null，那么返回x；否则抛出NoSuchElementException异常
    if (x == null) throw new NoSuchElementException();
    return x;
}
```

##### element()方法

获取但不移除此队列的头；此方法与`peek`的不同之处在于：如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`getFirst`方法！

```java
public E element() {
    //内部实际上就是调用getFirst方法
    return getFirst();
}
```

#### 检查队尾

##### peekLast()方法

获取但不移除此队列的尾；如果此队列为空，则返回`null`。

```java
public E peekLast() {
    final ReentrantLock lock = this.lock;
    //不可中断的等待获取消费者锁，即不响应中断
    lock.lock();
    try {
        //如果last为null，那么返回null，否则返回last的item值
        return (last == null) ? null : last.item;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

##### getLast()方法

获取但不移除此队列的尾；此方法与`peekLast`唯一的不同在于：如果此双端队列为空，它将抛出一个`NoSuchElementException`异常。

内部实际上就是调用的`peekLast`方法，并根据`peekLast`方法的返回值判断是否需要抛出异常！

```java
public E getLast() {
    //内部调用peekLast方法获取返回值x
    E x = peekLast();
    //如果x不为null，那么返回x；否则抛出NoSuchElementException异常
    if (x == null) throw new NoSuchElementException();
    return x;
}
```

## 总结

`LinkedBlockingDeque`可以看作`LinkedList`集合的线程安全的实现，可以在队头和队尾对元素做出队和入队操作，而`LinkedBlockingQueue`只能在队尾入队列，在队头出队列。`LinkedBlockingDeque`相比于`LinkedBlockingQueue`，可操作的方法和方式更加多样。

但是我们也看到`LinkedBlockingDeque`内部只有一个锁，出队、入队、`size`、迭代等操作都需要获取该锁。而`LinkedBlockingQueue`则有两把锁，分别对队尾的生产者线程和队头的消费者线程应用不同的锁，因此`LinkedBlockingQueue`的并发度比`LinkedBlockingDeque`更高，带来的问题是迭代等需要遍历整个队列的操作需要同时获取两把锁。
