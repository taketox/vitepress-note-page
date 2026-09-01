# ConcurrentLinkedDeque

## 简介

由于`LinkedBlockingDeque`作为双端队列的实现，采用了单锁的保守策略使其不利于多线程并发情况下的使用，故`ConcurrentLinkedDeque`应运而生。

它是一种**基于链表的无界的同时支持`FIFO`、`LIFO`的非阻塞并发双端队列**，当许多线程共享对公共集合的访问时，`ConcurrentLinkedDeque`是一个合适的选择，类比`ConcurrentLinkedQueue`是针对`LinkedBlockingQueue`对高并发情况的一种解决方案，`ConcurrentLinkedDeque`也是同样的地位，都是采用 `CAS`来替代加锁，甚至`ConcurrentLinkedDeque`再实现上也与`ConcurrentLinkedQueue`有很多相似的地方，其中最值得提及的就是，它采用了与`ConcurrentLinkedQueue`一样的松弛阀值设计（松弛阀值都是`1`），即`head`、`tail`并不总是指向队列的第一个、最后一个节点，而是保持`head/tail`距离`第一个/最后一个节点`的距离不超过`1`个节点的距离，从而减少了更新`head/tail`指针的`CAS`次数。`Java Doc`指出理解`ConcurrentLinkedQueue`的实现是理解该类实现的先决条件，所以最好先理解了`ConcurrentLinkedQueue`再来理解该类。

`ConcurrentLinkedDeque`另外还使用了两种方法来减少`volatile`写的次数：一是使用单次`CAS`操作来一次性使多次连续的`CAS`生效；二是将对同一块内存地址的`volatile`写与普通写混合。它的节点类与`LinkedBlockingDeque`的属性一致都是数据`item`、`prev`、`next`，只是多了一些`CAS`操作方法。与`ConcurrentLinkedQueue`一样，只有那些数据`item`不为空的节点才被认为是活动的节点，当将`item`置为`null`时，意味着从队列中逻辑删除掉了。

与`LinkedBlockingDeque`一样，任何时候，队列的第一个节点"first"的前驱`prev`为`null`，队列的最后一个节点"tail"的`next`后继为`null`。“first”和“last”节点可能是活动的，也可能不是活动的。“first”和“last”节点总是相互可达的。通过将第一个或最后一个节点的空前驱或后继`CAS`引用到包含指定元素的新节点，实现原子性地添加一个新元素，从而元素的节点在那时原子性地变成“活动的”，如果一个节点是活动的（`item`不为`null`）或者它是`first/last`节点，我们都称为是有效节点。`ConcurrentLinkedDeque`同样采用了“自链接（`p.prev = p`或`p.next = p`）”的方式使节点断开与队列的链接，有效活动节点不会有自链接的情况。

前面说了`ConcurrentLinkedDeque`有两个不总是指向第一个/最后一个节点的`head`、`tail`指针，所以它并没有像`LinkedBlockingDeque`那样设计`first`、`tail`属性，但是`first`、`tail`总是可以通过`head`、`tail`在`O(1)`时间内找到。

`ConcurrentLinkedDeque`删除节点分三个阶段：

1. `logical deletion`(逻辑删除)：通过`CAS`将数据`item`置为`null`，使该节点满足解除链接（`unlinking`）的条件。
2. `unlinking`(解除链接)：该阶段使队列中的活动节点无法到达该节点，但是保留该节点到队列中活动节点的链接，从而最终可由`GC`回收。此阶段典型的就是被迭代器使用的时候，使迭代器可以继续往下迭代。
3. `gc-unlinking`：该阶段进一步解除被删除节点到队列中活动节点的链接，使其更容易被GC回收，通过让节点自链接或链接到终止节点（`PREV_TERMINATOR`或`NEXT_TERMINATOR`）来实现。这一步是为了使数据结构保持`GC`健壮性(`gc-robust`)，消除使用保守式`GC`（`conservative GC`，目前已经很少使用）对内存无限期滞留的风险，并提高了分代`GC`的性能。

由于删除节点的第二、三阶段都不是保证数据正确性必须的，仅仅是对迭代器与内存的优化，故适当的减少这些操作的次数对性能是一种提高。所以`ConcurrentLinkedDeque`不仅设计了同`ConcurrentLinkedQueue`一样针对`head`、`tail`节点的松弛阈值，而且还提供了针对解除删除节点链接的阈值`HOPS`，也就是只有当逻辑删除的节点个数达到一定数量才会触发`unlinking` 和`gc-unlinking`，这样也是对性能的一种优化。

下面开始分析`ConcurrentLinkedDeque`的源码，`ConcurrentLinkedDeque`和`ConcurrentLinkedQueue`并没有继承相应的`BlockingQueue/BlockingQueue`，容量又是无界的，所以不存在阻塞方法。

## 源码分析

### 属性

```java
/**
 * A node from which the first node on list (that is, the unique node p
 * with p.prev == null && p.next != p) can be reached in O(1) time.
 *  可以在O(1)时间内从列表中的第一个节点到达的节点(即具有p.prev == null && p.next！= p的唯一节点p)
 * 
 * Invariants: 不变性
 * - the first node is always O(1) reachable from head via prev links
 *      第一个节点总是可从head通过prev链接在O(1)时间内访问到
 * - all live nodes are reachable from the first node via succ() 
 *      所有活动节点都可以从第一个节点通过succ()访问
 * - head != null
 *      head不为空
 * - (tmp = head).next != tmp || tmp != head  
 * - head is never gc-unlinked (but may be unlinked).
 *      head永远不会gc-unlinked(但可能是unlinked)
 *
 * Non-invariants: 可变性
 * - head.item may or may not be null                                           
 *      head的数据项可以为空
 * - head may not be reachable from the first or last node, or from tail.
 *      head可能无法从第一个或最后一个节点或从tail到达。
 */
private transient volatile Node<E> head;

/**
 * A node from which the last node on list (that is, the unique node p
 * with p.next == null && p.prev != p) can be reached in O(1) time.
 * 可以在O(1)时间内从列表中的最后一个节点到达的节点(即具有p.next == null && p.prev！= p的唯一节点p)

 * Invariants: 不变性
 * - the last node is always O(1) reachable from tail via next links。
 *      最后一个节点始终可以通过下一个链接从tail访问在O(1)时间内访问到
 * - all live nodes are reachable from the last node via pred() 。
 *      所有活动节点都可以从最后一个节点通过pred()访问
 * - tail != null
 *      tail不为空
 * - tail is never gc-unlinked (but may be unlinked)
 *     tail永远不会gc-unlinked(但可能是unlinked)
 *
 * Non-invariants: 可变性
 * - tail.item may or may not be null
 *      tail的数据项可以为空
 * - tail may not be reachable from the first or last node, or from head
 *      tail可能无法从第一个或最后一个节点或从head访问到。
 */
private transient volatile Node<E> tail;

/**指示出队节点的终结节点*/
private static final Node<Object> PREV_TERMINATOR, NEXT_TERMINATOR;

@SuppressWarnings("unchecked")
Node<E> prevTerminator() { //从对头出队节点的前向终结节点
    return (Node<E>) PREV_TERMINATOR;
}

@SuppressWarnings("unchecked")
Node<E> nextTerminator() { //从对尾出队节点的后继终结节点
    return (Node<E>) NEXT_TERMINATOR;
}

static final class Node<E> {
    volatile Node<E> prev;
    volatile E item;
    volatile Node<E> next;

    Node() {  // default constructor for NEXT_TERMINATOR, PREV_TERMINATOR
    }

    /**
     * Constructs a new node.  Uses relaxed write because item can
     * only be seen after publication via casNext or casPrev.
     */
    Node(E item) {
        UNSAFE.putObject(this, itemOffset, item);
    }

    boolean casItem(E cmp, E val) {
        return UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
    }

    void lazySetNext(Node<E> val) {
        UNSAFE.putOrderedObject(this, nextOffset, val);
    }

    boolean casNext(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }

    void lazySetPrev(Node<E> val) {
        UNSAFE.putOrderedObject(this, prevOffset, val);
    }

    boolean casPrev(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, prevOffset, cmp, val);
    }

    // Unsafe mechanics
    private static final sun.misc.Unsafe UNSAFE;
    private static final long prevOffset;
    private static final long itemOffset;
    private static final long nextOffset;

    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = Node.class;
            prevOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("prev"));
            itemOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("item"));
            nextOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}

//针对被删除节点进行unlinking/GC-unlinking的阈值
private static final int HOPS = 2;

private boolean casHead(Node<E> cmp, Node<E> val) {
    return UNSAFE.compareAndSwapObject(this, headOffset, cmp, val);
}

private boolean casTail(Node<E> cmp, Node<E> val) {
    return UNSAFE.compareAndSwapObject(this, tailOffset, cmp, val);
}

// Unsafe mechanics
private static final sun.misc.Unsafe UNSAFE;
private static final long headOffset;
private static final long tailOffset;
static {
    PREV_TERMINATOR = new Node<Object>();
    PREV_TERMINATOR.next = PREV_TERMINATOR;
    NEXT_TERMINATOR = new Node<Object>();
    NEXT_TERMINATOR.prev = NEXT_TERMINATOR;
    try {
        UNSAFE = sun.misc.Unsafe.getUnsafe();
        Class<?> k = ConcurrentLinkedDeque.class;
        headOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("head"));
        tailOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("tail"));
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

同`ConcurrentLinkedQueue`一样，`ConcurrentLinkedDeque`也对`head`、`tail`设定了如下的一些不变与可变性约束：

`head/tail`的不变性：

1. 第一个节点总是可从`head`通过`prev`链接在`O(1)`时间复杂度内访问到。
2. 最后一个节点总是可以从`tail`通过`next`链接在`O(1)`时间复杂度内访问到。
3. 所有活动节点`(item`不为`null)`都可以从第一个节点通过`succ()`访问。
4. 所有活动节点`(item`不为`null)`都可以从最后一个节点通过`pred()`访问。
5. `head`和`tail`都不会为`null`。
6. `head`节点的`next`不会指向自身形成自连接。
7. `head/tail`不会是`GC-unlinked`节点（但它可能是`unlink`节点）。

`head/tail`的可变性：

1. `head`、`tail`的数据`item`可以为`null`，也可以不为`null`。
2. `head`可能无法从第一个或最后一个节点或从`tail`到达。
3. `tail`可能无法从第一个或最后一个节点或从`head`到达。

### 构造方法

```java
/**
 * Constructs an empty deque. 默认构造方法，head、tail都指向同一个item为null的节点
 */
public ConcurrentLinkedDeque() {
    head = tail = new Node<E>(null);
}

/**
 * Constructs a deque initially containing the elements of
 * the given collection, added in traversal order of the
 * collection's iterator.
 *
 * @param c the collection of elements to initially contain
 * @throws NullPointerException if the specified collection or any
 *         of its elements are null
 */
public ConcurrentLinkedDeque(Collection<? extends E> c) {
    // Copy c into a private chain of Nodes
    Node<E> h = null, t = null;
    for (E e : c) {
        checkNotNull(e);
        Node<E> newNode = new Node<E>(e);
        if (h == null)
            h = t = newNode;
        else {
            t.lazySetNext(newNode);
            newNode.lazySetPrev(t);
            t = newNode;
        }
    }
    initHeadTail(h, t);
}

/**
 * Initializes head and tail, ensuring invariants hold.
 * 初始化head和tail，确保它们的不变性
 */
private void initHeadTail(Node<E> h, Node<E> t) {
    if (h == t) { //队列为空，或者只有一个元素
        if (h == null)
            h = t = new Node<E>(null);//队列为空，head、tail都指向同一个item为null的节点
        else { 
            // 只有一个元素，重新构造一个节点指向tail，避免head、tail都指向同一个非null节点
            // Avoid edge case of a single Node with non-null item.
            Node<E> newNode = new Node<E>(null);
            t.lazySetNext(newNode);
            newNode.lazySetPrev(t);
            t = newNode;
        }
    }
    head = h;
    tail = t;
}
```

节点内部类和`LinkedBlockingDeque`一样都是`prev`、`tail`、`item`，空队列情况下，`head`、`tail`都指向一个`item`为`null`的节点。`PREV_TERMINATOR`、`NEXT_TERMINATOR`分别是从对头/队尾出队节点的前向/后继终止节点。`ConcurrentLinkedDeque`是无界的。

### 入队实现

#### 头部入队

```java
/**
 * Links e as first element. 在头节点入队
 */
private void linkFirst(E e) {
    checkNotNull(e);
    final Node<E> newNode = new Node<E>(e);

    restartFromHead:
    for (;;)
        //从head节点往前（左）寻找first节点
        for (Node<E> h = head, p = h, q;;) {
            if ((q = p.prev) != null &&     //前驱不为null
                (q = (p = q).prev) != null) //前驱的前驱也不为null(有线程刚刚从对头入队了一个节点，还没修改head)
                // Check for head updates every other hop.
                // If p == q, we are sure to follow head instead.
                p = (h != (h = head)) ? h : q; //head被更新了就重新取head，否则取前驱的前驱
            else if (p.next == p) // PREV_TERMINATOR   p是第一个节点，但是是自链接，表示出队了，重新开始
                continue restartFromHead;
            else {
                // p是第一个节点
                newNode.lazySetNext(p); // p成为新节点的后继节点
                if (p.casPrev(null, newNode)) { //新节点成为p的前驱节点
                    //成功将e入队
                    if (p != h) // 松弛阀值超过1，更新head
                        casHead(h, newNode);  // Failure is OK.
                    return;
                }
                // 失败，可能被其它线程抢先入队，重新找前驱
            }
        }
}
```

同`LinkedBlockingDeque`一样，`linkFirst`是从对头入队新节点的具体逻辑实现（被其它入队方法调用），看起来很简单：从`head`节点往对头寻找第一个节点`p`（不论`item`是不是`null`），找到之后将新节点链接到它的前驱，同时当`head`的松弛阈值超过`1`时更新`head`。`linkFirst`分别被`offerFirst`、`addFirst`、`push`方法直接或间接调用。

#### 尾部入队

队尾入队的逻辑基本上和`linkFirst`一样，不同的是它是从`tail`节点往后寻找最后一个节点，把新节点链接到它的后继，同时维护`tail`的松弛阈值。`linkLast`分别被`offerLast`、`addLast`、`add`、`offer`方法直接或间接调用。

入队的逻辑流程图如下（`ABC`分别从队尾入队，`DE`从对头入队）；

![An image](/img/java/container/64.png)

------

![An image](/img/java/container/65.png)

### 出队

这里以`pollFirst`出队方法为例，其他方法逻辑都一样，先通过`first()`拿到队列头部的第一个节点，如果是活动节点（`item`不为`null`），则直接将`item`置为`null`，即完成了删除节点的第一步逻辑删除，然后执行`unlink`方法执行删除节点的第二`unlinking`、第三步`GC-unlinking`，`unlink`方法针对节点在不同的位置按不同的逻辑处理，

1. 如果出队的节点是队列的第一个节点，则执行`unlinkFirst`；
2. 如果是队列的最后一个节点，则执行`unlinkLast`，
3. 否则表示是内部节点，执行`unlink`本身的通用节点逻辑。

`unlinkFirst`的逻辑其实就分两个部分：

1. 实现从被移除节点`p`开始往后（队尾）找到第一个有效节点，直到找到或者到达队列的最后一个节点为止，并把`p`的直接后继指向该有效节点（如果本身不是其后继节点的话），其中的`skipDeletedPredecessors`方法实现将刚刚找到的后继节点的前驱也指向节点`p`，即完成它们的互联，这一步就是所谓的`unlinking`，使队列的活动节点无法访问被删除的节点；
2. 第二部分就是实现`GC-unlinking`了，通过`updateHead`、`updateTail`使被删除的节点无法从`head/tail`可达，最后让被删除节点后继自连接，前驱指向前向终结节点。

如果是内部节点出队，执行`unlink`本身：先找到被删除节点`x`的有效前驱和后继节点，并记录它们中间的已经被逻辑删除的节点个数，如果已经积累了超过阈值的节点个数，或者是内部节点删除，我们需要进一步处理`unlink/gc-unlink`，

1. 首先使被删除节点的有效前驱节点和后继节点互联，就相当于导致活动节点不会访问到中间已经被逻辑删除的节点（`unlinking`）；
2. 若第1步导致重新链接到了对头或队尾，则通过`updateHead`、`updateTail`使被删除的节点无法从`head/tail`可达，最后让被删除节点自连接或者执行终结节点（`GC-unlinking`）。

如果是队尾节点出队则由`unlinkLast`，`unlinkLast`的源码其实与`unlinkFirst`基本一致，只不过是从被删除节点`p`往前寻找一个有效节点，并把`p`的直接前驱节点指向该有效节点（如果本身不是其前驱节点的话），其中`skipDeletedSuccessors`则让刚刚找到的前驱节点的后继也指向节点`p`，即完成它们的互联，这一步就是所谓的`unlinking`，使队列的活动节点无法访问被删除的节点；第二部分就是实现`GC-unlinking`了，通过`updateHead`、`updateTail`使被删除的节点无法从`head/tail`可达，最后让被删除节点前驱自连接，后继指向后继终结节点。`unlinkLast`的源码就不贴了。

可以看见，`ConcurrentLinkedDeque`在实现的时候，其实对头队尾相关的方法都是对称的，所以理解了一端的方法，另一端的方法就是对称的。

出队的方法主要就是`unlink + unlinkFirst + unlinkLast`实现，它被`ConcurrentLinkedDeque`的其他方法调用，例如：`pollFirst`、`removeFirst`、`remove(`包括迭代器`)`、`clear`、`poll`、`pollLast`、`removeLast`、`removeFirstOccurrence(Object o)`、`removeLastOccurrence(Object o)`等大量方法直接或间接调用。

### 其它方法

- `peekFirst/peekLast`方法从对头/队尾开始找第一个活动节点（`item`不为空），找到一个立即返回`item`数据，否则直到到达队列的另一端都没找到返回`null`。这两个方法分别还会被`peek/getFirst/isEmpty/getLast`方法调用。例如`isEmpty`方法调用`peekFirst`只要返回不为`null`就表示队列非空，
- `size()`，返回当前时刻队列中`item`不为空的节点个数，但如果超过`Integer.MAX_VALUE`，则就返回`Integer.MAX_VALUE`。
- `addAll(Collection c)`, 将指定的集合组成一个临时双端队列，然后把该临时队列拼接到当前`ConcurrentLinkedDeque`队列的队尾。指定的参数集合不能是`ConcurrentLinkedDeque`本身，不然将抛出`IllegalArgumentException`异常。
- `toArray/toArray(T[] a)`，从队头开始依次将`item`不为空的节点数据添加到一个`ArrayList`集合中，最后再通过`toArray`方法将其转换成数组，注意该方法并不会将数据从队列中移除，仅仅是拷贝`item`的引用，所以返回的数组可以任意操作而不会对队列本身造成任何影响。

### 迭代器

`ConcurrentLinkedDeque`的迭代器实现思想与`LinkedBlockingDeque`一致，也支持正向和逆向的两种迭代器，分别是方法`iterator`、`descendingIterator`：

```java
//按正确的顺序返回deque中元素的迭代器。元素将按从第一个(head)到最后一个(tail)的顺序返回。
//返回的迭代器是弱一致的。
public Iterator<E> iterator() {
    return new Itr();
}
     
//以相反的顺序返回deque中元素的迭代器。元素将按从最后(tail)到第一个(head)的顺序返回。
//返回的迭代器是弱一致的。
public Iterator<E> descendingIterator() {
    return new DescendingItr();
}
```

它们的逻辑主要是由一个内部抽象类`AbstractItr`来实现，而`iterator`和`descendingIterator`仅仅实现了`AbstractItr`的抽象方法，用来指示迭代器的开始位置和迭代方向，为了保证迭代器的弱一致性，迭代器在创建实例的时候就已经拿到了第一个节点`next`和其节点数据，为了实现迭代器的`remove`方法，迭代器还保留了迭代的上一个节点`lastRet`，用于获取迭代器的下一个节点的主要逻辑由`advance`方法实现：

可见迭代器会排除那些被移除的无效节点，迭代器在使用`Itr.remove()`删除节点的时候实际上调用了`ConcurrentLinkedDeque`的`unlink`方法，该方法上面已经解析过了，其它方法都很简单就不一一列举了。

#### 可拆分迭代器Spliterator

`ConcurrentLinkedDeque`的可拆分迭代器由内部类`CLDSpliterator`实现，它不像普通迭代器那样可以支持正向和反向迭代，可拆分迭代器仅支持正向的拆分迭代：

```java
public Spliterator<E> spliterator() {
      return new CLDSpliterator<E>(this);
}
```

`ConcurrentLinkedDeque`的可拆分迭代器实现基本上和`LinkedBlockingDeque`一样，不过它不是使用锁而是`CAS`实现，可拆分迭代器会对节点的数据`item`进行`null`值判断，只对`item`不为空的数据做处理，`tryAdvance`从对头开始查找获取队列中第一个`item`不为空的数据节点的数据做指定的操作，`forEachRemaining`从队头开始循环遍历当前队列中`item`不为空的数据节点的数据做指定的操作源码都很简单，就不贴代码了，至于它的拆分方法`trySplit`，其实和`ConcurrentLinkedQueue/LinkedBlockingDeque`拆分方式是一样的，代码都几乎一致，它不是像`ArrayBlockingQueue`那样每次分一半，而是第一次只拆一个元素，第二次拆`2`个，第三次拆三个，依次内推，拆分的次数越多，拆分出的新迭代器分的得元素越多，直到一个很大的数`MAX_BATCH`（`33554432`） ，后面的迭代器每次都分到这么多的元素，拆分的实现逻辑很简单，每一次拆分结束都记录下拆分到哪个元素，下一次拆分从上次结束的位置继续往下拆分，直到没有元素可拆分了返回`null`。

## 总结

`ConcurrentLinkedDeque`是双端队列家族中对`LinkedBlockingDeque`的一种高并发优化，因为`LinkedBlockingDeque`采用的是保守的单锁实现，在多线程高并发下效率极其低下，所以`ConcurrentLinkedDeque`采用了`CAS`的方法来处理所以的竞争问题，保留了双端队列的所有特性，可以从对头、对尾两端插入和移除元素，它的内部实现非常精妙，既采用了`ConcurrentLinkedQueue`实现中用到过松弛阈值处理（即并不每一次都更新`head/tail`指针），又独特的针对队列中被逻辑删除节点的进行了淤积阀值合并处理和分三个阶段的节点删除步骤，同时还针对多次`volatile`写、普通写，多次连续的`CAS`操作单次生效等一系列的措施减少`volatile`写和`CAS`的次数，提高`ConcurrentLinkedDeque`的运行效率。

当许多线程共享对公共集合（双端队列）的访问时，`ConcurrentLinkedDeque`是一个合适的选择，如果不需要用到双端队列的特性，完全可以使用`ConcurrentLinkedQueue`来完成高并发对公共集合的高效使用。注意`ConcurrentLinkedDeque`，`ConcurrentLinkedQueue`都没有继承`BlockingDeque`、`BlockingQueue`，所以它们没有阻塞等待的相关方法。
