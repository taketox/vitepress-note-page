# ConcurrentHashMap

## 简介

并发编程实践中，`ConcurrentHashMap`是一个经常被使用的数据结构，相比于`Collections.synchronizedMap()`以及`Hashtable`，`ConcurrentHashMap`在线程安全的基础上提供了更好的写并发能力，但同时降低了对读一致性的要求。

`ConcurrentHashMap`的设计与实现非常精巧，大量的利用了`volatile`，`final`，`CAS`等`lock-free`技术来减少锁竞争对于性能的影响。

## 历史版本

### 设计思路

在`JDK 1.8`之前，`ConcurrentHashMap`采用了分段锁的设计，只有在同一个分段内才存在竞态关系，不同的分段锁之间没有锁竞争。相比于对整个`Map`加锁的设计，分段锁大大的提高了高并发环境下的处理能力。

但同时，由于不是对整个`Map`加锁，导致一些需要扫描整个`Map`的方法(如`size()`,`containsValue()`)需要使用特殊的实现，另外一些方法(如`clear()`)甚至放弃了对一致性的要求，`ConcurrentHashMap`是弱一致性的。

![An image](/img/java/container/46.png)

`ConcurrentHashMap`中的分段锁称为`Segment`，它即类似于`HashMap`([Jdk7与Jdk8中HashMap的实现](http://my.oschina.net/hosee/blog/618953))的结构，即内部拥有一个`Entry`数组，数组中的每个元素又是一个链表；同时又是一个`ReentrantLock`(`Segment`继承了`ReentrantLock`)。

`ConcurrentHashMap`中的`HashEntry`相对于`HashMap`中的`Entry`有一定的差异性：`HashEntry`中的`value`以及`next`都被`volatile`修饰，这样在多线程读写过程中能够保持它们的可见性，代码如下：

```java
static final class HashEntry<K,V> {
    final int hash;
    final K key;
    volatile V value;
    volatile HashEntry<K,V> next;
}
```

### 并发度(Concurrency Level)

并发度可以理解为程序运行时能够同时更新`ConccurentHashMap`且不产生锁竞争的最大线程数，实际上就是`ConcurrentHashMap`中的分段锁个数，即`Segment[]`的数组长度。

`ConcurrentHashMap`默认的并发度为`16`，但用户也可以在构造函数中设置并发度。当用户设置并发度时，`ConcurrentHashMap`会使用大于等于该值的最小`2`幂指数作为实际并发度（假如用户设置并发度为`17`，实际并发度则为`32`）。

运行时通过将`key`的高`n`位（`n = 32 – segmentShift`）和并发度减`1`（`segmentMask`）做位与运算定位到所在的`Segment`。`segmentShift`与`segmentMask`都是在构造过程中根据`concurrency level`被相应的计算出来。

如果并发度设置的过小，会带来严重的锁竞争问题；如果并发度设置的过大，原本位于同一个`Segment`内的访问会扩散到不同的`Segment`中，`CPU cache`命中率会下降，从而引起程序性能下降。（文档的说法是根据你并发的线程数量决定，太多会导性能降低）

> Segment的个数一旦初始化就不能改变。

### 创建分段锁

和`JDK6`不同，`JDK7`中除了第一个`Segment`之外，剩余的`Segments`采用的是延迟初始化的机制：每次`put`之前都需要检查`key`对应的`Segment`是否为`null`，如果是则调用`ensureSegment()`以确保对应的`Segment`被创建。

`ensureSegment`可能在并发环境下被调用，但与想象中不同，`ensureSegment`并未使用锁来控制竞争，而是使用了`Unsafe`对象的`getObjectVolatile()`提供的原子读语义结合`CAS`来确保`Segment`创建的原子性。代码段如下：

```java
if ((seg = (Segment<K,V>) UNSAFE.getObjectVolatile(ss, u)) == null) { // recheck
    Segment<K,V> s = new Segment<K,V>(lf, threshold, tab);
    while ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) {
        if (UNSAFE.compareAndSwapObject(ss, u, null, seg = s))
            break;
     }
}
```

### put/putIfAbsent/putAll

和`JDK6`一样，`ConcurrentHashMap`的`put`方法被代理到了对应的`Segment`（定位`Segment`的原理之前已经描述过）中。与`JDK6`不同的是，`JDK7`版本的`ConcurrentHashMap`在获得`Segment`锁的过程中，做了一定的优化 - 在真正申请锁之前，`put`方法会通过`tryLock()`方法尝试获得锁，在尝试获得锁的过程中会对对应`hashcode`的链表进行遍历，如果遍历完毕仍然找不到与`key`相同的`HashEntry`节点，则为后续的`put`操作提前创建一个`HashEntry`。当`tryLock`一定次数后仍无法获得锁，则通过`lock`申请锁。

需要注意的是，由于在并发环境下，其他线程的`put`，`rehash`或者`remove`操作可能会导致链表头结点的变化，因此在过程中需要进行检查，如果头结点发生变化则重新对表进行遍历。而如果其他线程引起了链表中的某个节点被删除，即使该变化因为是非原子写操作（删除节点后链接后续节点调用的是`Unsafe.putOrderedObject()`，该方法不提供原子写语义）可能导致当前线程无法观察到，但因为不影响遍历的正确性所以忽略不计。

之所以在获取锁的过程中对整个链表进行遍历，主要目的是希望遍历的链表被`CPU cache`所缓存，为后续实际put过程中的链表遍历操作提升性能。

在获得锁之后，`Segment`对链表进行遍历，如果某个`HashEntry`节点具有相同的`key`，则更新该`HashEntry`的`value`值，否则新建一个`HashEntry`节点，将它设置为链表的新`head`节点并将原头节点设为新`head`的下一个节点。新建过程中如果节点总数（含新建的`HashEntry`）超过`threshold`，则调用`rehash()`方法对`Segment`进行扩容，最后将新建`HashEntry`写入到数组中。

`put`方法中，链接新节点的下一个节点（`HashEntry.setNext()`）以及将链表写入到数组中（`setEntryAt()`）都是通过`Unsafe`的`putOrderedObject()`方法来实现，这里并未使用具有原子写语义的`putObjectVolatile()`的原因是：`JMM`会保证获得锁到释放锁之间所有对象的状态更新都会在锁被释放之后更新到主存，从而保证这些变更对其他线程是可见的。

### rehash

相对于`HashMap`的`resize`，`ConcurrentHashMap`的`rehash`原理类似，但是`Doug Lea`为`rehash`做了一定的优化，避免让所有的节点都进行复制操作：由于扩容是基于`2`的幂指来操作，假设扩容前某`HashEntry`对应到`Segment`中数组的`index`为`i`，数组的容量为`capacity`，那么扩容后该`HashEntry`对应到新数组中的`index`只可能为`i`或者`i + capacity`，因此大多数`HashEntry`节点在扩容前后`index`可以保持不变。基于此，`rehash`方法中会定位第一个后续所有节点在扩容后`index`都保持不变的节点，然后将这个节点之前的所有节点重排即可。这部分代码如下：

```java
private void rehash(HashEntry<K,V> node) {
    HashEntry<K,V>[] oldTable = table;
    int oldCapacity = oldTable.length;
    int newCapacity = oldCapacity << 1;
    threshold = (int)(newCapacity * loadFactor);
    HashEntry<K,V>[] newTable =
        (HashEntry<K,V>[]) new HashEntry[newCapacity];
    int sizeMask = newCapacity - 1;
    for (int i = 0; i < oldCapacity ; i++) {
        HashEntry<K,V> e = oldTable[i];
        if (e != null) {
            HashEntry<K,V> next = e.next;
            int idx = e.hash & sizeMask;
            if (next == null)   // Single node on list
                newTable[idx] = e;
            else { // Reuse consecutive sequence at same slot
                HashEntry<K,V> lastRun = e;
                int lastIdx = idx;
                for (HashEntry<K,V> last = next;
                     last != null;
                     last = last.next) {
                    int k = last.hash & sizeMask;
                    if (k != lastIdx) {
                        lastIdx = k;
                        lastRun = last;
                    }
                }
                newTable[lastIdx] = lastRun;
                // Clone remaining nodes
                for (HashEntry<K,V> p = e; p != lastRun; p = p.next) {
                    V v = p.value;
                    int h = p.hash;
                    int k = h & sizeMask;
                    HashEntry<K,V> n = newTable[k];
                    newTable[k] = new HashEntry<K,V>(h, p.key, v, n);
                }
            }
        }
    }
    int nodeIndex = node.hash & sizeMask; // add the new node
    node.setNext(newTable[nodeIndex]);
    newTable[nodeIndex] = node;
    table = newTable;
}
```

### remove

和`put`类似，`remove`在真正获得锁之前，也会对链表进行遍历以提高缓存命中率。

### get与containsKey

`get`与`containsKey`两个方法几乎完全一致：他们都没有使用锁，而是通过`Unsafe`对象的`getObjectVolatile()`方法提供的原子读语义，来获得`Segment`以及对应的链表，然后对链表遍历判断是否存在`key`相同的节点以及获得该节点的`value`。但由于遍历过程中其他线程可能对链表结构做了调整，因此`get`和`containsKey`返回的可能是过时的数据，这一点是`ConcurrentHashMap`在弱一致性上的体现。如果要求强一致性，那么必须使用`Collections.synchronizedMap()`方法。

### size、containsValue

这些方法都是基于整个`ConcurrentHashMap`来进行操作的，他们的原理也基本类似：首先不加锁循环执行以下操作：循环所有的`Segment`（通过`Unsafe`的`getObjectVolatile()`以保证原子读语义），获得对应的值以及所有`Segment`的`modcount`之和。如果连续两次所有`Segment`的`modcount`和相等，则过程中没有发生其他线程修改`ConcurrentHashMap`的情况，返回获得的值。

当循环次数超过预定义的值时，这时需要对所有的`Segment`依次进行加锁，获取返回值后再依次解锁。值得注意的是，加锁过程中要强制创建所有的`Segment`，否则容易出现其他线程创建`Segment`并进行`put`，`remove`等操作。代码如下：

```java
for(int j =0; j < segments.length; ++j)

ensureSegment(j).lock();// force creation
```

一般来说，应该避免在多线程环境下使用`size`和`containsValue`方法。

> 注1：`modcount`在`put`, `replace`, `remove`以及`clear`等方法中都会被修改。
> 注2：对于`containsValue`方法来说，如果在循环过程中发现匹配`value`的`HashEntry`，则直接返回`true`。

最后，与`HashMap`不同的是，`ConcurrentHashMap`并不允许`key`或者`value`为`null`，按照`Doug Lea`的说法，这么设计的原因是在`ConcurrentHashMap`中，一旦`value`出现`null`，则代表`HashEntry`的`key/value`没有映射完成就被其他线程所见，需要特殊处理。

在`JDK6`中，`get`方法的实现中就有一段对`HashEntry.value == null`的防御性判断。但`Doug Lea`也承认实际运行过程中，这种情况似乎不可能发生。

## 源码分析

`ConcurrentHashMap`在`JDK8`中进行了巨大改动，摒弃了`Segment`（锁段）的概念，而是启用了一种全新的方式实现，利用`CAS`算法。它沿用了与它同时期的`HashMap`版本的思想，底层依然由“数组”+链表+红黑树的方式思想([JDK7与JDK8中HashMap的实现](http://my.oschina.net/hosee/blog/618953))，但是为了做到并发，又增加了很多辅助的类，例如`TreeBin`，`Traverser`等对象内部类。

### 属性

首先来看几个重要的属性，这里重点解释一下`sizeCtl`这个属性。可以说它是`ConcurrentHashMap`中出镜率很高的一个属性，因为它是一个控制标识符，在不同的地方有不同用途，而且它的取值不同，也代表不同的含义。

- 负数代表正在进行初始化或扩容操作，-1代表正在初始化，-N表示有N-1个线程正在进行扩容操作
- 正数或0代表`hash`表还没有被初始化，这个数值表示初始化或下一次进行扩容的大小，这一点类似于扩容阈值的概念。还后面可以看到，它的值始终是当前`ConcurrentHashMap`容量的`0.75`倍，这与`loadfactor`是对应的。

```java
//存储所有元素，采用懒加载方式，知道第一次插入数据才进行初始化。长度总是为2的幂次方
transient volatile Node<K,V>[] table;

//过渡的table表，扩容时使用，平时都是null，只有在扩容时才使用
private transient volatile Node<K,V>[] nextTable;

//该属性用于控制table数组的大小，根据是否初始化和是否正在扩容有几种情况
//负数: -1表示正在初始化，-N表示当前正有N-1个线程进行扩容操作。
//正数: 如果当前数组为null，表示正在初始化，该变量表示新建数组的长度
//     如果已经初始化，表示当前table数组可用容量，也可以理解为临界值(插入节点数超过该临界值就需要扩容)
//     具体值为数组的长度 * 负载因子(loadFactor)
//0: 即数组长度为默认初始值 
private transient volatile int sizeCtl; 

//以下两个是用来控制扩容的时候 单线程进入的变量
private static int RESIZE_STAMP_BITS = 16;

private static final int RESIZE_STAMP_SHIFT = 32 - RESIZE_STAMP_BITS;

static final int MOVED     = -1; //hash值是-1，表示这是一个forwardNode节点
static final int TREEBIN   = -2; //hash值是-2  表示这时一个TreeBin节点
```

### 内部类

#### Node类

`Node`是最核心的内部类，它包装了`key-value`键值对，所有插入`ConcurrentHashMap`的数据都包装在这里面。它与`HashMap`中的定义很相似，但是有一些差别它对`value`和`next`属性设置了`volatile`同步锁(与`JDK7`的`Segment`相同)，它不允许调用`setValue`方法直接改变`Node`的`value`域，它增加了`find`方法辅助`map.get()`方法。

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;

    Node(int hash, K key, V val, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.val = val;
        this.next = next;
    }
}
```

#### TreeNode类

树节点类，另外一个核心的数据结构。当链表长度过长的时候，会转换为`TreeNode`。但是与`HashMap`不相同的是，它并不是直接转换为红黑树，而是把这些结点包装成`TreeNode`放在`TreeBin`对象中，由`TreeBin`完成对红黑树的包装。而且`TreeNode`在`ConcurrentHashMap`集成自`Node`类，而并非`HashMap`中的集成自`LinkedHashMap.Entry<K,V>`类，也就是说`TreeNode`带有`next`指针，这样做的目的是方便基于`TreeBin`的访问。

```java
static final class TreeNode<K,V> extends Node<K,V> {
    TreeNode<K,V> parent;  // red-black tree links
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;    // needed to unlink next upon deletion
    boolean red;

    TreeNode(int hash, K key, V val, Node<K,V> next,
             TreeNode<K,V> parent) {
        super(hash, key, val, next);
        this.parent = parent;
    }
}
```

#### TreeBin类

这个类并不负责包装用户的`key`、`value`信息，而是包装的很多`TreeNode`节点。它代替了`TreeNode`的根节点，也就是说在实际的`ConcurrentHashMap`“数组”中，存放的是`TreeBin`对象，而不是`TreeNode`对象，这是与`HashMap`的区别。另外这个类还带有了读写锁。

```java
static final class TreeBin<K,V> extends Node<K,V> {
    TreeNode<K,V> root;
    volatile TreeNode<K,V> first;
    volatile Thread waiter;
    volatile int lockState;
    // values for lockState
    static final int WRITER = 1; // set while holding write lock
    static final int WAITER = 2; // set when waiting for write lock
    static final int READER = 4; // increment value for setting read lock

    TreeBin(TreeNode<K,V> b) {
        super(TREEBIN, null, null, null);
        this.first = b;
        TreeNode<K,V> r = null;
        for (TreeNode<K,V> x = b, next; x != null; x = next) {
            next = (TreeNode<K,V>)x.next;
            x.left = x.right = null;
            if (r == null) {
                x.parent = null;
                x.red = false;
                r = x;
            }
            else {
                K k = x.key;
                int h = x.hash;
                Class<?> kc = null;
                for (TreeNode<K,V> p = r;;) {
                    int dir, ph;
                    K pk = p.key;
                    if ((ph = p.hash) > h)
                        dir = -1;
                    else if (ph < h)
                        dir = 1;
                    else if ((kc == null &&
                            (kc = comparableClassFor(k)) == null) ||
                            (dir = compareComparables(kc, k, pk)) == 0)
                        dir = tieBreakOrder(k, pk);
                    TreeNode<K,V> xp = p;
                    if ((p = (dir <= 0) ? p.left : p.right) == null) {
                        x.parent = xp;
                        if (dir <= 0)
                            xp.left = x;
                        else
                            xp.right = x;
                        r = balanceInsertion(r, x);
                        break;
                    }
                }
            }
        }
        this.root = r;
        assert checkInvariants(root);
    }
}
```

这里仅贴出它的构造方法。可以看到在构造`TreeBin`节点时，仅仅指定了它的`hash`值为`TREEBIN`常量，这也就是个标识位。同时也看到我们熟悉的红黑树构造方法。

#### ForwardingNode类

一个用于连接两个`table`的节点类。它包含一个`nextTable`指针，用于指向下一张表。而且这个节点的`key`、`value`、`next`指针全部为`null`，它的`hash`值为`-1`。这里面定义的`find`的方法是从`nextTable`里进行查询节点，而不是以自身为头节点进行查找。

```java
static final class ForwardingNode<K,V> extends Node<K,V> {
    final Node<K,V>[] nextTable;
    ForwardingNode(Node<K,V>[] tab) {
        super(MOVED, null, null, null);
        this.nextTable = tab;
    }

    Node<K,V> find(int h, Object k) {
        // loop to avoid arbitrarily deep recursion on forwarding nodes
        outer: for (Node<K,V>[] tab = nextTable;;) {
            Node<K,V> e; int n;
            if (k == null || tab == null || (n = tab.length) == 0 ||
                    (e = tabAt(tab, (n - 1) & h)) == null)
                return null;
            for (;;) {
                int eh; K ek;
                if ((eh = e.hash) == h &&
                        ((ek = e.key) == k || (ek != null && k.equals(ek))))
                    return e;
                if (eh < 0) {
                    if (e instanceof ForwardingNode) {
                        tab = ((ForwardingNode<K,V>)e).nextTable;
                        continue outer;
                    }
                    else
                        return e.find(h, k);
                }
                if ((e = e.next) == null)
                    return null;
            }
        }
    }
}
```

### Unsafe与CAS

在`ConcurrentHashMap`中，随处可以看到`U`，大量使用了`U.compareAndSwapXXX`的方法，这个方法是利用一个`CAS`算法实现无锁化的修改值的操作，他可以大大降低锁代理的性能消耗。这个算法的基本思想就是不断地去比较当前内存中的变量值与你指定的一个变量值是否相等，如果相等，则接受你指定的修改的值，否则拒绝你的操作。因为当前线程中的值已经不是最新的值，你的修改很可能会覆盖掉其他线程修改的结果。这一点与乐观锁，`SVN`的思想是比较类似的。

#### unsafe静态块

`unsafe`代码块控制了一些属性的修改工作，比如最常用的`SIZECTL`。在这一版本的`concurrentHashMap`中，大量应用来的`CAS`方法进行变量、属性的修改工作。利用`CAS`进行无锁操作，可以大大提高性能。

```java
private static final sun.misc.Unsafe U;
private static final long SIZECTL;
private static final long TRANSFERINDEX;
private static final long BASECOUNT;
private static final long CELLSBUSY;
private static final long CELLVALUE;
private static final long ABASE;
private static final int ASHIFT;

static {
    try {
        U = sun.misc.Unsafe.getUnsafe();
        Class<?> k = ConcurrentHashMap.class;
        SIZECTL = U.objectFieldOffset(k.getDeclaredField("sizeCtl"));
        TRANSFERINDEX = U.objectFieldOffset(k.getDeclaredField("transferIndex"));
        BASECOUNT = U.objectFieldOffset(k.getDeclaredField("baseCount"));
        CELLSBUSY = U.objectFieldOffset(k.getDeclaredField("cellsBusy"));
        Class<?> ck = CounterCell.class;
        CELLVALUE = U.objectFieldOffset(ck.getDeclaredField("value"));
        Class<?> ak = Node[].class;
        ABASE = U.arrayBaseOffset(ak);
        int scale = U.arrayIndexScale(ak);
        if ((scale & (scale - 1)) != 0)
            throw new Error("data type scale not a power of two");
        ASHIFT = 31 - Integer.numberOfLeadingZeros(scale);
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

#### 三个核心方法

`ConcurrentHashMap`定义了三个原子操作，用于对指定位置的节点进行操作。正是这些原子操作保证了`ConcurrentHashMap`的线程安全。

```java
//获得在i位置上的Node节点
static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
    return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
}

//利用CAS算法设置i位置上的Node节点。之所以能实现并发是因为他指定了原来这个节点的值是多少
//在CAS算法中，会比较内存中的值与你指定的这个值是否相等，如果相等才接受你的修改，否则拒绝你的修改
//因此当前线程中的值并不是最新的值，这种修改可能会覆盖掉其他线程的修改结果有点类似于SVN
static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,
                                    Node<K,V> c, Node<K,V> v) {
    return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
}

//利用volatile方法设置节点位置的值
static final <K,V> void setTabAt(Node<K,V>[] tab, int i, Node<K,V> v) {
    U.putObjectVolatile(tab, ((long)i << ASHIFT) + ABASE, v);
}
```

### 构造函数

```java
//没有维护任何变量的操作，如果调用该方法，数组长度默认是16
public ConcurrentHashMap() {
}

//传递进来一个初始容量，ConcurrentHashMap会基于这个值计算一个比这个值大的2的幂次方数作为初始容量
public ConcurrentHashMap(int initialCapacity) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException();
    //判断是否超过了允许的最大值，超过了话则取最大值，否则再对该值进一步处理
    int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ?
               MAXIMUM_CAPACITY :
               tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));
    this.sizeCtl = cap;
}

//调用四个参数的构造
public ConcurrentHashMap(int initialCapacity, float loadFactor) {
    this(initialCapacity, loadFactor, 1);
}

//计算一个大于或者等于给定的容量值，该值是2的幂次方数作为初始容量
public ConcurrentHashMap(int initialCapacity,
                         float loadFactor, int concurrencyLevel) {
    if (!(loadFactor > 0.0f) || initialCapacity < 0 || concurrencyLevel <= 0)
        throw new IllegalArgumentException();
    if (initialCapacity < concurrencyLevel)   // Use at least as many bins
        initialCapacity = concurrencyLevel;   // as estimated threads
    long size = (long)(1.0 + (long)initialCapacity / loadFactor);
    int cap = (size >= (long)MAXIMUM_CAPACITY) ?
        MAXIMUM_CAPACITY : tableSizeFor((int)size);
    this.sizeCtl = cap;
}

//基于一个Map集合，构建一个ConcurrentHashMap
//初始容量为16
public ConcurrentHashMap(Map<? extends K, ? extends V> m) {
    this.sizeCtl = DEFAULT_CAPACITY;
    putAll(m);
}
```

`ConcurrentHashMap`的构造函数并不是很复杂, 其中需要注意的是`tableSizeFor`方法, 该方法与`HashMap`中的实现是一致的, 此处不再复述。

另外需要注意的是，调用构造器方法的时候并未构造出`table`数组（可以理解为`ConcurrentHashMap`的数据容器），只是算出`table`数组的长度，当第一次向`ConcurrentHashMap`插入数据的时候才真正的完成初始化创建`table`数组的工作。

### 初始化方法initTable

对于`ConcurrentHashMap`来说，调用它的构造方法仅仅是设置了一些参数而已。而整个`table`的初始化是在向`ConcurrentHashMap`中插入元素的时候发生的。如调用`put`、`computeIfAbsent`、`compute`、`merge`等方法的时候，调用时机是检查`table==null`。

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    //判断数组是否为null或长度为0
    while ((tab = table) == null || tab.length == 0) {
        //sizeCtl表示有其他线程正在进行初始化操作，把线程挂起。
        //对于table的初始化工作，保证只能有一个线程在进行。
        if ((sc = sizeCtl) < 0)
            Thread.yield(); // lost initialization race; just spin
        //利用CAS方法把sizeCtl的值置为-1 表示本线程正在进行初始化
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                //重复检查是否为空
                if ((tab = table) == null || tab.length == 0) {
                    //计算数组需要的大小
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    //此处才开始初始化数组
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    //设置一个扩容的阈值，相当于0.75*n
                    //n - (n >>> 2) = n - (1/4)n = (3/4)n
                    sc = n - (n >>> 2);
                }
            } finally {
                //把sc赋值给sizeCtl
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

初始化方法主要应用了关键属性`sizeCtl`如果这个值`<0`，表示其他线程正在进行初始化，就放弃这个操作。在这也可以看出`ConcurrentHashMap`的初始化只能由一个线程完成。如果获得了初始化权限，就用`CAS`方法将`sizeCtl`置为`-1`，防止其他线程进入。初始化数组后，将`sizeCtl`的值改为`0.75*n`。

### put方法

前面的所有的介绍其实都为这个方法做铺垫。`ConcurrentHashMap`最常用的就是`put`和`get`两个方法。现在来介绍`put`方法，这个`put`方法依然沿用`HashMap`的`put`方法的思想，根据`hash`值计算这个新插入的点在`table`中的位置`i`，如果`i`位置是空的，直接放进去，否则进行判断，如果`i`位置是树节点，按照树的方式插入新的节点，否则把`i`插入到链表的末尾。但是有一个最重要的不同点就是`ConcurrentHashMap`不允许`key`或`value`为`null`值。

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

//第三个参数onlyIfAbsent用于控制是否覆盖已有的旧值
final V putVal(K key, V value, boolean onlyIfAbsent) {
    //不允许key或value为null(原因看底下拓展)
    if (key == null || value == null) throw new NullPointerException();
    //计算hash值，高低位异或扰动hashcode，使元素在数组上面的分布更加均匀
    int hash = spread(key.hashCode());
    //binCount表示链表的节点数
    int binCount = 0;
    //死循环 何时插入成功 何时跳出
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        //情况1：如果table为空则初始化table
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        //情况2：根据hash值计算出在table里面的位置
        //      如果目标对象下标为null，直接放进去
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            //重点：不需要加锁，采用CAS插入
            if (casTabAt(tab, i, null,
                         new Node<K,V>(hash, key, value, null)))
                break;           // no lock when adding to empty bin
        }
        //情况3：数组正在扩容，迁移数据到新的数组
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        //情况4：直接对节点进行加锁，插入数据
        else {
            V oldVal = null;
            //结点上锁  这里的结点可以理解为hash值相同组成的链表的头结点
            synchronized (f) {
                //重复检查一下刚刚获取的对象有没有发生变化
                if (tabAt(tab, i) == f) {
                    //fh > 0 说明这个节点是一个链表的节点 不是树的节点
                    if (fh >= 0) {
                        binCount = 1;
                        //遍历链表所有的结点
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            //如果hash值和key值相同 则修改对应结点的value值
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                //判断是否需要更新数值
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            //如果遍历到了最后一个结点，那么就证明新的节点需要插入 就把它插入在链表尾部
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    //如果这个节点是树节点，就按照树的方式插入值
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key, value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            //判断是否需要转化为红黑树，和返回旧数值
            if (binCount != 0) {
                //如果链表长度已经达到临界值8 就需要把链表转换为树结构
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    //将当前ConcurrentHashMap的元素数量+1
    addCount(1L, binCount);
    return null;
}
```

另外由于涉及到多线程，`put`方法就要复杂一点。在多线程中可能有以下两个情况：

1. 如果一个或多个线程正在对`ConcurrentHashMap`进行扩容操作，当前线程也要进入扩容的操作中。这个扩容的操作之所以能被检测到，是因为`transfer`方法中在空结点上插入`forward`节点，如果检测到需要插入的位置被`forward`节点占有，就帮助进行扩容；
2. 如果检测到要插入的节点是非空且不是`forward`节点，就对这个节点加锁，这样就保证了线程安全。尽管这个有一些影响效率，但是还是会比`hashTable`的`synchronized`要好得多。

**整体流程：**

1. 首先定义不允许`key`或`value`为`null`，对于每一个放入的值，首先利用`spread`方法对`key`的`hashcode`进行一次`hash`计算，由此来确定这个值在`table`中的位置。

2. 如果这个位置是空的，那么直接放入，而且不需要加锁操作。

3. 如果这个位置存在结点，说明发生了

   hash碰撞，首先判断这个节点的类型。

   - 如果是链表节点(`fh > 0`)，则得到的结点就是`hash`值相同的节点组成的链表的头节点。需要依次向后遍历确定这个新加入的值所在位置。

   - 如果遇到`hash`值与`key`值都与新加入节点是一致的情况，则只需要更新`value`值即可。
   - 否则依次向后遍历，直到链表尾插入这个结点。

   - 如果加入这个节点以后链表长度大于`8`，就把这个链表转换成红黑树。

   - 如果这个节点的类型已经是树节点的话，直接调用树节点的插入方法进行插入新的值。

我们可以发现`JDK8`中的实现也是锁分离的思想，只是锁住的是一个`Node`，而不是`JDK7`中的`Segment`，而锁住`Node`之前的操作是无锁的并且也是线程安全的，建立在之前提到的`3`个原子操作上。

#### helpTransfer方法

这是一个协助扩容的方法。这个方法被调用的时候，当前`ConcurrentHashMap`一定已经有了`nextTable`对象，首先拿到这个`nextTable`对象，调用`transfer`方法。回看上面的`transfer`方法可以看到，当本线程进入扩容方法的时候会直接进入复制阶段。

```java
final Node<K,V>[] helpTransfer(Node<K,V>[] tab, Node<K,V> f) {
    Node<K,V>[] nextTab; int sc;
    //如果tab已经初始化了，并且对应的槽位为ForwardingNode，并且新table不为null
    if (tab != null && (f instanceof ForwardingNode) &&
        (nextTab = ((ForwardingNode<K,V>)f).nextTable) != null) {
        //扩容对应的时间戳
        int rs = resizeStamp(tab.length);
        //如果sc<0说明还在扩容
        while (nextTab == nextTable && table == tab &&
               (sc = sizeCtl) < 0) {
            //校验是否已经扩容完成或者已经推进到0，则不需要帮忙扩容
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;
            //尝试让让sc+1并帮忙扩容
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                transfer(tab, nextTab);
                break;
            }
        }
        //返回扩容之后的数组
        return nextTab;
    }
    //若数组尚未初始化或节点非ForwardingNode，返回原数组
    return table;
}
```

#### putTreeVal方法

插入红黑树

```java
//该方法如果发现要插入的位置为null，则直接插入，如果目标位置已经有值，则将该旧节点返回给调用者
final TreeNode<K,V> putTreeVal(int h, K k, V v) {
    Class<?> kc = null;
    boolean searched = false;
    for (TreeNode<K,V> p = root;;) {
        int dir, ph; K pk;
        //如果红黑树根节点为null，则直接将该新节点设置为红黑树根节点
        if (p == null) {
            first = root = new TreeNode<K,V>(h, k, v, null, null);
            break;
        }
        else if ((ph = p.hash) > h)
            dir = -1;
        else if (ph < h)
            dir = 1;
        else if ((pk = p.key) == k || (pk != null && k.equals(pk)))
            return p;
        else if ((kc == null && (kc = comparableClassFor(k)) == null) 
                || (dir = compareComparables(kc, k, pk)) == 0) {
            if (!searched) {
                TreeNode<K,V> q, ch;
                searched = true;
                if (((ch = p.left) != null && (q = ch.findTreeNode(h, k, kc)) != null) 
                    || ((ch = p.right) != null && (q = ch.findTreeNode(h, k, kc)) != null))
                    return q;
            }
            dir = tieBreakOrder(k, pk);
        }
 
        TreeNode<K,V> xp = p;
        if ((p = (dir <= 0) ? p.left : p.right) == null) {
            TreeNode<K,V> x, f = first;
            first = x = new TreeNode<K,V>(h, k, v, f, xp);
            if (f != null)
                f.prev = x;
            if (dir <= 0)
                xp.left = x;
            else
                xp.right = x;
            if (!xp.red)
                x.red = true;
            else {
                //不符合红黑树结构要求，需要进行插入自平衡操作，操作前需要进行加锁操作，
                //调用lockRoot方法争夺写锁，具体实现请看上文对红黑树锁的介绍
                lockRoot();
                try {
                    root = balanceInsertion(root, x);
                } finally {
                    //红黑树进行平衡重构后释放持有的写锁
                    unlockRoot();
                }
            }
            break;
        }
    }
    //最后使用递归方法进行红黑树结构检查，检查修改过后的树是否依旧符合红黑树结构要求
    assert checkInvariants(root);
    return null;
}
```

#### treeifyBin方法

这个方法用于将过长的链表转换为`TreeBin`对象。但是他并不是直接转换，而是进行一次容量判断，如果容量没有达到转换的要求，直接进行扩容操作并返回；如果满足条件才链表的结构抓换为`TreeBin`，这与`HashMap`不同的是，它并没有把`TreeNode`直接放入红黑树，而是利用了`TreeBin`这个小容器来封装所有的`TreeNode`。

```java
private final void treeifyBin(Node<K,V>[] tab, int index) {
    Node<K,V> b; int n, sc;
    if (tab != null) {
        //MIN_TREEIFY_CAPACITY为64
        //如果数组长度小于64的时候，会进行数组扩容
        if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
            //后面我们再详细分析这个方法
            tryPresize(n << 1);
        //b 是头结点
        else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {
            //加锁
            synchronized (b) {
                if (tabAt(tab, index) == b) {
                    //下面就是遍历链表，建立一颗红黑树
                    TreeNode<K,V> hd = null, tl = null;
                    for (Node<K,V> e = b; e != null; e = e.next) {
                        TreeNode<K,V> p = new TreeNode<K,V>(e.hash, e.key, e.val, null, null);
                        if ((p.prev = tl) == null) hd = p;
                        else tl.next = p;
                        tl = p;
                    }
                    //将红黑树设置到数组相应位置中
                    setTabAt(tab, index, new TreeBin<K,V>(hd));
                }
            }
        }
    }
}
```

#### tryPresize扩容方法

这里的扩容也是做翻倍扩容的，扩容后数组容量为原来的2倍。

```java
//首先要说明的是，方法参数size传进来的时候就已经翻了倍了
private final void tryPresize(int size) {
    //c: size的1.5倍，再加1，再往上取最近的2的n次方。
    int c = (size >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY :
        tableSizeFor(size + (size >>> 1) + 1);
    int sc;
    while ((sc = sizeCtl) >= 0) {
        Node<K,V>[] tab = table; int n;
        //这个if分支和之前说的初始化数组的代码基本上是一样的，在这里，我们可以不用管这块代码
        if (tab == null || (n = tab.length) == 0) {
            n = (sc > c) ? sc : c;
            if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                try {
                    if (table == tab) {
                        @SuppressWarnings("unchecked")
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = nt;
                        sc = n - (n >>> 2); // 0.75 * n
                    }
                } finally {
                    sizeCtl = sc;
                }
            }
        }
        else if (c <= sc || n >= MAXIMUM_CAPACITY) break;
        else if (tab == table) {
            int rs = resizeStamp(n);
            if (sc < 0) {
                Node<K,V>[] nt;
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                //2. 用CAS将sizeCtl加1，然后执行transfer方法
                //此时nextTab不为null
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt);
            }
            //1. 将sizeCtl设置为(rs << RESIZE_STAMP_SHIFT) + 2)
            //调用transfer方法，此时nextTab参数为null
            else if (U.compareAndSwapInt(this, SIZECTL, sc, (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);
        }
    }
}
```

这个方法的核心在于`sizeCtl`值的操作，首先将其设置为一个负数，然后执行`transfer(tab, null)`，再下一个循环将`sizeCtl`加1，并执行`transfer(tab, nt)`，之后可能是继续`sizeCtl`加1，并执行`transfer(tab, nt)`。

所以，可能的操作就是执行1次transfer(tab, null) + 多次transfer(tab, nt)，这里怎么结束循环的需要看完transfer源码才清楚。

#### addCount方法

在`put`方法结尾处调用了`addCount`方法，把当前`ConcurrentHashMap`的元素个数`+1`这个方法一共做了两件事，更新`baseCount`的值，检测是否进行扩容。

```java
private final void addCount(long x, int check) {
    CounterCell[] as; long b, s;
    //利用CAS方法更新baseCount的值 
    if ((as = counterCells) != null ||
        !U.compareAndSwapLong(this, BASECOUNT, b = baseCount, s = b + x)) {
        CounterCell a; long v; int m;
        //表示没发生竞争
        boolean uncontended = true;
        //这里有以下情况会进入fullAddCount方法：
        //1. 数组为null且直接修改basecount失败
        //2. hash后的数组下标CounterCell对象为null
        //3. CAS修改CounterCell对象失败
        if (as == null || (m = as.length - 1) < 0 ||
            (a = as[ThreadLocalRandom.getProbe() & m]) == null ||
            !(uncontended =
              U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))) {
            //该方法保证完成更新，重点方法！！
            fullAddCount(x, uncontended);
            return;
        }
        //如果长度<=1不需要扩容
        if (check <= 1)
            return;
        s = sumCount();
    }
    //如果check值大于等于0则需要检验是否需要进行扩容操作
    if (check >= 0) {
        Node<K,V>[] tab, nt; int n, sc;
        while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {
            int rs = resizeStamp(n);
            //
            if (sc < 0) {
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                 //如果已经有其他线程在执行扩容操作
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt);
            }
            //当前线程是唯一的或是第一个发起扩容的线程，此时nextTable=null
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                         (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);
            s = sumCount();
        }
    }
}
```

#### fullAddCount方法

前面源码尝试直接修改`basecount`失败后，就会进入`fullAddCount`方法：

```java
private final void fullAddCount(long x, boolean wasUncontended) {
    int h;
    //如果当前线程随机数为0，强制初始化一个线程随机数
    //这个随机数的作用就类似于hashcode，不过他不需要被查找
    //下面每次循环都重新获取一个随机数，不会让线程都堵在同一个地方
    if ((h = ThreadLocalRandom.getProbe()) == 0) {
        ThreadLocalRandom.localInit();      
        h = ThreadLocalRandom.getProbe();
        //wasUncontended表示没有竞争
        //如果为false表示之前CAS修改CounterCell失败，需要重新获取线程随机数
        wasUncontended = true;
    }
    
    //直译为碰撞，如果他为true，则表示需要进行扩容
    boolean collide = false;      
    
    //下面分为三种大的情况：
    //1. 数组不为null，对应的子情况为CAS更新CounterCell失败或者countCell对象为null
    //2. 数组为null，表示之前CAS更新baseCount失败，需要初始化数组
    //3. 第二步获取不到锁，再次尝试CAS更新baseCount
    for (;;) {
        CounterCell[] as; CounterCell a; int n; long v;
        
        //第一种情况：数组不为null
        if ((as = counterCells) != null && (n = as.length) > 0) {
            //对应下标的CounterCell为null的情况
            if ((a = as[(n - 1) & h]) == null) {
                //判断当前锁是否被占用
                //cellsBusy是一个自旋锁，0表示没被占用
                if (cellsBusy == 0) {    
                    //创建CounterCell对象
                    CounterCell r = new CounterCell(x); 
                    //尝试获取锁来添加一个新的CounterCell对象
                    if (cellsBusy == 0 &&
                        U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
                        boolean created = false;
                        try {               
                            CounterCell[] rs; int m, j;
                            //recheck一次是否为null
                            if ((rs = counterCells) != null &&
                                (m = rs.length) > 0 &&
                                rs[j = (m - 1) & h] == null) {
                                rs[j] = r;
                                //created=true表示创建成功
                                created = true;
                            }
                        } finally {
                            //释放锁
                            cellsBusy = 0;
                        }
                        //创建成功也就是+1成功，直接返回
                        if (created)
                            break;
                        //拿到锁后发现已经有别的线程插入数据了
                        //继续循环，重来一次
                        continue;          
                    }
                }
                //到达这里说明想创建一个对象，但是锁被占用
                collide = false;
            }
            //之前直接CAS改变CounterCell失败，重新获取线程随机数，再循环一次
            else if (!wasUncontended)       // CAS already known to fail
                wasUncontended = true;      // Continue after rehash
            //尝试对CounterCell进行CAS
            else if (U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))
                break;
            //如果发生过扩容或者长度已经达到虚拟机最大可以核心数，直接认为无碰撞
            //因为已经无法再扩容了
            //所以并发线程数的理论最高值就是NCPU
            else if (counterCells != as || n >= NCPU)
                collide = false;            // At max size or stale
            //如果上面都是false，说明发生了冲突，需要进行扩容
            else if (!collide)
                collide = true;
            //获取自旋锁，并进行扩容
            else if (cellsBusy == 0 &&
                     U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
                try {
                    if (counterCells == as) {// Expand table unless stale
                        //扩大数组为原来的2倍
                        CounterCell[] rs = new CounterCell[n << 1];
                        for (int i = 0; i < n; ++i)
                            rs[i] = as[i];
                        counterCells = rs;
                    }
                } finally {
                    //释放锁
                    cellsBusy = 0;
                }
                collide = false;
                //继续循环
                continue;                   
            }
            
            //这一步是重新hash，找下一个CounterCell对象
            //上面每一步失败都会来到这里获取一个新的随机数
            h = ThreadLocalRandom.advanceProbe(h);
        }
        
        //第二种情况：数组为null，尝试获取锁来初始化数组
        else if (cellsBusy == 0 && counterCells == as &&
                 U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
            boolean init = false;
            try {
                //recheck判断数组是否为null
                if (counterCells == as) {
                    //初始化数组
                    CounterCell[] rs = new CounterCell[2];
                    rs[h & 1] = new CounterCell(x);
                    counterCells = rs;
                    init = true;
                }
            } finally {
                //释放锁
                cellsBusy = 0;
            }
            //如果初始化完成，直接跳出循环，
            //因为初始化过程中也包括了新建CounterCell对象
            if (init)
                break;
        }
        
        //第三种情况：数组为null，但是拿不到锁，意味着别的线程在新建数组，尝试直接更新baseCount
        else if (U.compareAndSwapLong(this, BASECOUNT, v = baseCount, v + x))
            //更新成功直接返回
            break;                         
    }
}
```

源码的整体思路跟我们前面讲的是差不多的，细节上使用了很多的`CAS+自旋锁`来保证线程安全。还有多线程同时更新的思路，配合`CAS`和自旋锁，在高并发环境下极大提高了性能。

如果说把一个变量拆分成多个子变量，利用多线程协作是一个很神奇的思路，那么多个线程同时协作完成扩容操作会不会更加神奇？`ConcurrentHashMap`不仅避开了并发的性能消耗，甚至利用上了并发的优势，多个线程一起帮忙完成一件事。那接下来就来看看`ConcurrentHashMap`的扩容方案。

#### 小结

1. 集合还未初始化：进行集合的初始化操作，该操作会将设置一个全局的初始化标识`sizeCtl = -1`，当其他线程检测到`sizeCtl`的值为`-1`时就会使用`Thread.yield()`方法让出`CPU`资源，让初始化线程能够更快完成初始化操作，同时也保证了只能有一条线程对集合进行初始化。
2. 定位到的目标位置在数组上，并且该位置的值为`null`：为了避免线程安全问题，使用`CAS`方式将元素直接设置到该数组位置上。
3. 定位到的目标位置在数组上，并且该位置的值为`ForwardingNode`节点：说明此时集合在扩容中，并且当前定位到的节点的hash桶已经迁移完毕，此时执行put操作的线程会优先加入到扩容大军里面去，加速扩容速度，待扩容完成后再继续循环插入新元素。
4. 定位到的目标位置在数组上，并且该位置已经有其他值：先锁住位于数组上的头结点。如果节点类型是普通链表节点，使用尾插法在末尾拼接上新的节点。如果节点类型是TreeBin节点，调用`TreeBin`的`putTreeVal`方法。`putTreeVal`方法具体做法为，如果目标位置为`null`，则直接添加进去元素，如果目标位置已经有值，则返回旧值，根据`onlyIfAbsent`属性决定是否覆盖该红黑树上面的旧值。

### 扩容核心方法transfer(重要)

当`ConcurrentHashMap`容量不足的时候，需要对`table`进行扩容。这个方法的基本思想跟`HashMap`是很像的，但是由于它是支持并发扩容的，所以要复杂的多。原因是它支持多线程进行扩容操作，而并没有加锁。我想这样做的目的不仅仅是为了满足`concurrent`的要求，而是希望利用并发处理去减少扩容带来的时间影响。因为在扩容的时候，总是会涉及到从一个“数组”到另一个“数组”拷贝的操作，如果这个操作能够并发进行，那么扩容的性能肯定会提升不少。

```java
//tab旧桶数组，nextTab新桶数组
private final void transfer(Node<K,V>[] tab, Node<K,V>[] nextTab) {
    //stride在单核下直接等于n，多核模式下为(n>>>3)/NCPU，最小值是16
    //stride可以理解为”步长“，有n个位置是需要进行迁移的，
    int n = tab.length, stride;
    //将这n个任务分为多个任务包，每个任务包有stride个任务
    if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
        stride = MIN_TRANSFER_STRIDE; // subdivide range
    //如果新的数组还未创建，则创建新数组
    //只有一个线程能进行创建数组
    if (nextTab == null) {            // initiating
        try {
            //构造一个nextTable对象，容量是原来的两倍
            @SuppressWarnings("unchecked")
            Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n << 1];
            nextTab = nt;
        } catch (Throwable ex) {      // try to cope with OOME
            //扩容失败出现OOM，直接把阈值改成最大值
            sizeCtl = Integer.MAX_VALUE;
            return;
        }
        //更改concurrentHashMap的内部变量nextTable
        nextTable = nextTab;
        //迁移的起始值为数组长度
        transferIndex = n;
    }
    int nextn = nextTab.length;
    //构造一个连节点指针 用于标志位
    ForwardingNode<K,V> fwd = new ForwardingNode<K,V>(nextTab);
    //并发扩容的关键属性 如果等于true 说明这个节点已经处理过
    //advance表示当前线程是否要前进
    //finish表示迁移是否结束
    boolean advance = true;
    boolean finishing = false; // to ensure sweep before committing nextTab
    //i表示当前线程迁移数据的下标，bound表示下限，从后往前迁移
    for (int i = 0, bound = 0;;) {
        Node<K,V> f; int fh;
        //这个循环主要是判断是否需要前进，如果需要则CAS更改下个bound和i
        while (advance) {
            int nextIndex, nextBound;
            //如果还未到达下限或者已经结束了，advance=false
            if (--i >= bound || finishing)
                advance = false;
            //每一轮循环更新transferIndex的下标
            //如果下一个下标是0，表示已经无需继续前进          
            else if ((nextIndex = transferIndex) <= 0) {
                i = -1;
                advance = false;
            }
            //利用CAS更改bound和i继续前进迁移数据
            else if (U.compareAndSwapInt
                     (this, TRANSFERINDEX, nextIndex,
                      nextBound = (nextIndex > stride ?
                                   nextIndex - stride : 0))) {
                bound = nextBound;
                i = nextIndex - 1;
                advance = false;
            }
        }
        //i已经达到边界，说明当前线程的任务已经完成，无需继续前进
        //如果是第一个线程需要更新table引用
        //协助的线程需要将sizeCtl减一再退出
        if (i < 0 || i >= n || i + n >= nextn) {
            int sc;
            //如果已经更新完成，则更新table引用
            if (finishing) {
                //如果所有的节点都已经完成复制工作 就把nextTable赋值给table 清空临时对象nextTable
                nextTable = null;
                table = nextTab;
                //同时更新sizeCtl为阈值
                //扩容阈值设置为原来容量的1.5倍 相当于现在容量的0.75倍
                sizeCtl = (n << 1) - (n >>> 1);
                return;
            }
            //利用CAS方法更新这个扩容阈值，在这里面sizectl值减一，说明新加入一个线程参与到扩容操作
            if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                //这里sc-2不等于校验码，说明此线程不是最后一个线程，还有其他线程正在扩容
                //那么就直接返回，他任务已经完成了
                //最后一个线程需要重新把整个数组再扫描一次，看看有没有遗留的
                if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                    return;
                //finish设置为true表示已经完成
                //这里把i设置为n，重新把整个数组扫描一次
                finishing = advance = true;
                i = n; // recheck before commit
            }
        }
        //如果遍历到的节点为空，表示迁移完成，设置为标志节点
        else if ((f = tabAt(tab, i)) == null)
            advance = casTabAt(tab, i, null, fwd);
        //如果遍历到ForwardingNode节点，表示迁移完成，继续前进
        else if ((fh = f.hash) == MOVED)
            advance = true; // already processed
        else {
            //节点上锁，进行迁移
            synchronized (f) {
                //上锁之后再判断一次看该节点是否还是原来那个节点
                //如果不是则重新循环
                if (tabAt(tab, i) == f) {
                    Node<K,V> ln, hn;
                    //hash值大于等于0表示该节点是普通链表节点
                    if (fh >= 0) {
                        int runBit = fh & n;
                        //以下的部分在完成的工作是构造两个链表，一个是原链表，另一个是原链表的反序排列
                        Node<K,V> lastRun = f;
                        //ConcurrentHashMap并不是直接把整个链表分为两个
                        //而是先把尾部迁移到相同位置的一段先拿出来
                        //例如：该节点迁移后的位置可能为1或5，而链表的情况是：
                        //1 -> 5 -> 1 -> 5 -> 5 -> 5
                        //那么concurrentHashMap会先把最后的三个5拿出来，lastRun指针指向倒数第三个5
                        for (Node<K,V> p = f.next; p != null; p = p.next) {
                            int b = p.hash & n;
                            if (b != runBit) {
                                runBit = b;
                                lastRun = p;
                            }
                        }
                        //判断尾部整体迁移到的位置
                        if (runBit == 0) {
                            ln = lastRun;
                            hn = null;
                        }
                        else {
                            hn = lastRun;
                            ln = null;
                        }
                        for (Node<K,V> p = f; p != lastRun; p = p.next) {
                            int ph = p.hash; K pk = p.key; V pv = p.val;
                            //这个node节点是改造过的
                            //相当于使用头插法插入到链表中
                            //这里的头插法不须担心链表环，因为已经加锁了
                            if ((ph & n) == 0)
                                ln = new Node<K,V>(ph, pk, pv, ln);
                            else
                                hn = new Node<K,V>(ph, pk, pv, hn);
                        }
                        //在nextTable的i位置上插入一个链表
                        setTabAt(nextTab, i, ln);
                        //在nextTable的i+n的位置上插入另一个链表
                        setTabAt(nextTab, i + n, hn);
                        //在table的i位置上插入forwardNode节点  表示已经处理过该节点
                        setTabAt(tab, i, fwd);
                        //设置advance为true 返回到上面的while循环中 就可以执行i--操作
                        advance = true;
                    }
                    //对TreeBin对象进行处理  与上面的过程类似
                    else if (f instanceof TreeBin) {
                        TreeBin<K,V> t = (TreeBin<K,V>)f;
                        TreeNode<K,V> lo = null, loTail = null;
                        TreeNode<K,V> hi = null, hiTail = null;
                        int lc = 0, hc = 0;
                        //构造正序和反序两个链表
                        for (Node<K,V> e = t.first; e != null; e = e.next) {
                            int h = e.hash;
                            TreeNode<K,V> p = new TreeNode<K,V>
                                (h, e.key, e.val, null, null);
                            if ((h & n) == 0) {
                                if ((p.prev = loTail) == null)
                                    lo = p;
                                else
                                    loTail.next = p;
                                loTail = p;
                                ++lc;
                            }
                            else {
                                if ((p.prev = hiTail) == null)
                                    hi = p;
                                else
                                    hiTail.next = p;
                                hiTail = p;
                                ++hc;
                            }
                        }
                        //如果扩容后已经不再需要tree的结构 反向转换为链表结构
                        ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                            (hc != 0) ? new TreeBin<K,V>(lo) : t;
                        hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                            (lc != 0) ? new TreeBin<K,V>(hi) : t;
                        //在nextTable的i位置上插入一个链表    
                        setTabAt(nextTab, i, ln);
                        //在nextTable的i+n的位置上插入另一个链表
                        setTabAt(nextTab, i + n, hn);
                        //在table的i位置上插入forwardNode节点  表示已经处理过该节点
                        setTabAt(tab, i, fwd);
                        //设置advance为true 返回到上面的while循环中 就可以执行i--操作
                        advance = true;
                    }
                }
            }
        }
    }
}
```

整个扩容操作分为两个部分

- 第一部分是构建一个`nextTable`，它的容量是原来的两倍，这个操作是单线程完成的。这个单线程的保证是通过`RESIZE_STAMP_SHIFT`这个常量经过一次运算来保证的，这个地方在后面会有提到；
- 第二个部分就是将原来`table`中的元素复制到`nextTable`中，这里允许多线程进行操作。

先来看一下单线程是如何完成的：

它的大体思想就是遍历、复制的过程。首先根据运算得到需要遍历的次数`i`，然后利用`tabAt`方法获得`i`位置的元素：

- 如果这个位置为空，就在原`table`中的`i`位置放入`forwardNode`节点，这个也是触发并发扩容的关键点；
- 如果这个位置是`Node`节点（fh>=0），如果它是一个链表的头节点，就构造一个反序链表，把他们分别放在`nextTable`的`i`和`i+n`的位置上
- 如果这个位置是`TreeBin`节点（fh<0），也做一个反序处理，并且判断是否需要`untreefi`，把处理的结果分别放在`nextTable`的`i`和`i+n`的位置上
- 遍历过所有的节点以后就完成了复制工作，这时让`nextTable`作为新的`table`，并且更新`sizeCtl`为新容量的`0.75`倍，完成扩容。

再看一下多线程是如何完成的：

在代码的有一个判断`else if ((f = tabAt(tab, i)) == null)`，如果遍历到的节点是`forward`节点，就向后继续遍历，再加上给节点上锁的机制，就完成了多线程的控制。多线程遍历节点，处理了一个节点，就把对应点的值`set`为`forward`，另一个线程看到`forward`，就向后遍历。这样交叉就完成了复制工作。而且还很好的解决了线程安全的问题。

![An image](/img/java/container/47.jpg)

#### 扩容过程图解

触发扩容的操作

![An image](/img/java/container/48.png)

1. 元素个数达到扩容阈值。
2. 调用 putAll 方法，但目前容量不足以存放所有元素时。
3. 某链表长度达到8，但数组长度却小于64时。

**CPU核数与迁移任务hash桶数量分配的关系：**

![An image](/img/java/container/49.png)

**单线程下线程的任务分配与迁移操作：**

![An image](/img/java/container/50.png)

**多线程如何分配任务？**

![An image](/img/java/container/51.png)

**普通链表如何迁移？**

在`ConcurrentHashMap`中，对于数组的桶上的链表结构，扩容时需要拆分成两条新的链表。

![An image](/img/java/container/52.png)

迁移过程中，通过`ph & n`，即`e.hash & oldCap`计算新数组的索引位置。这部分的思想与`HashMap`是一样的。

**什么是lastRun节点？**

`ConcurrentHashMap`采用`lastRun`节点来辅助拆分两条新链表，而`HashMap`采用首尾指针来拆分两条新链表。

![An image](/img/java/container/53.png)

`ConcurrentHashMap`中的链表迁移之后，`LastRun`节点及之后的节点的顺序与旧链表相同，其余节点都是倒序的。这是由于`ConcurrentHashMap`迁移桶上链表的时候，加了锁，因此迁移前后顺序不一致没有问题。

而`HashMap`中的链表迁移算法，使用了高低位的首尾指针，迁移前后节点的顺序都是一致的，可以避免在并发情况下链表出现环的问题。

**红黑树如何迁移？**

红黑树的迁移算法与`HashMap`中的是一样的，利用了`TreeNode`的链表特性，采用了高低位的首尾指针来拆分两条新链表。

![An image](/img/java/container/54.png)

**hash桶迁移中以及迁移后如何处理存取请求？**

![An image](/img/java/container/55.png)

**多线程迁移任务完成后的操作!**

![An image](/img/java/container/56.png)

------

![An image](/img/java/container/57.png)

#### 小结

1. 单线程新建`nextTable`，新容量一般为原`table`容量的两倍。
2. 每个线程增/删元素时，如果访问的桶是`ForwardingNode`节点，则表明当前正处于扩容状态，协助一起扩容完成后再完成相应的数据更改操作。
3. 扩容时将原`table`的所有桶倒序分配，每个线程每次最小分配`16`个桶，防止资源竞争导致的效率下降。单个桶内元素的迁移是加锁的，但桶范围处理分配可以多线程，在没有迁移完成所有桶之前每个线程需要重复获取迁移桶范围，直至所有桶迁移完成。
4. 一个旧桶内的数据迁移完成但不是所有桶都迁移完成时，查询数据委托给`ForwardingNode`结点查询`nextTable`完成。
5. 迁移过程中`sizeCtl`用于记录参与扩容线程的数量，全部迁移完成后`sizeCtl`更新为新`table`容量的`0.75`倍。

### get方法

`get`方法比较简单，给定一个`key`来确定`value`的时候，必须满足两个条件`key`相同`hash`值相同，对于节点可能在链表或树上的情况，需要分别去查找。

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    //计算hash值
    int h = spread(key.hashCode());
    //根据hash值确定节点位置
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        //如果搜索到的节点key与传入的key相同且不为null，直接返回这个节点
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        //如果 eh < 0 可能能有两种情况：
        //  (1)该节点是TreeBin节点(红黑树代理节点，其hash值固定为：-2);
        //  (2)ConcurrentHashMap正在扩容当中，并且该hash桶已迁移完毕，该位置被放置了FWD节点;
        //1、如果是TreeBin节点，调用TreeBin类的find方法，具体是以链表方式遍历还是红黑树方式遍历视情况而定(后面细说)
        //2、如果正在扩容中，则跳转到扩容后的新数组上去查找，TreeBin和Node节点都有对应的find方法，
        //   具体什么节点类型则调用对应节点类型的find方法
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        //说明该hash桶上面连接的是普通链表结构，使用while循环去遍历该链表节点，找到对应的值并返回
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

接下来我们来看看非扩容情况下`eh < 0`这种情况：

1. 如果`e`节点为`TreeBin`节点，则使用`TreeBin`节点的`find`操作，该操作在下面的第`2`种情况中讲解。
2. 如果`e`节点为`ForwardingNode`节点，遇到查询操作时直接将get操作转发到扩容后的新数组`nextTable`上去，接下来就是两种节点的`find`操作。

`nextTable`上对应位置的节点为普通`Node`节点

```java
//使用do...while循环遍历普通链表，查找到则返回，找不到返回null，比较简单
Node<K,V> find(int h, Object k) {
    Node<K,V> e = this;
    if (k != null) {
        do {
            K ek;
            if (e.hash == h && ((ek = e.key) == k || (ek != null && k.equals(ek))))
                return e;
        } while ((e = e.next) != null);
    }
    return null;
}
```

`nextTable`上对应位置的节点为`TreeBin`节点：

```java
final Node<K,V> find(int h, Object k) {
    if (k != null) {
        //使用 for 循环遍历红黑树，如果在以链表方式遍历遍历红黑树的过程中，
        //发现锁状态变为0或者READER(即对红黑树的改动已经完成)。
        //则放弃使用链表方式遍历红黑树，而改为使用红黑树遍历，即便在原来已经使用链表方式遍历了一部分的情况下
        for (Node<K,V> e = first; e != null; ) {
            int s; K ek;
            
            //volatile int lockState; -->  lockState不为0则说明该红黑树处于锁定状态
            //lockState的3种数值状态含义： 
            //    1 - (WRITER) - 二进制 001  --> 写锁
            //    2 - (WAITER) - 二进制 010  --> 等待写锁
            //    4 - (READER) - 二进制 100  --> 读锁
            
            //如果当前处于加锁状态，即有线程正在对红黑树进行写操作或者等待写操作，
            //为了减少锁的竞争以便写操作尽快完成，查找操作将会以链表的方式去遍历红黑树节点
            if (((s = lockState) & (WAITER|WRITER)) != 0) {
                if (e.hash == h && ((ek = e.key) == k || (ek != null && k.equals(ek))))
                    return e;
                e = e.next;
            }
            //如果当前没有加锁(写锁/等待写锁)，则先将 lockState + 4(READER)，
            //也就是读锁的值叠加，然后以红黑树方式去遍历红黑树节点
            else if (U.compareAndSwapInt(this, LOCKSTATE, s, s + READER)) {
                TreeNode<K,V> r, p;
                try {
                    p = ((r = root) == null ? null : r.findTreeNode(h, k, null));
                } finally {
                    //进入该else if分支的每条线程在查找结束后将 lockState - 4(READER)
                    //U.getAndAddInt(this, LOCKSTATE, -READER)这个操作是：LOCKSTATE=lockState-READER;
                    //内部使用do...while不断循环更新，直到更新成功为止，更新成功后返回更新之前的旧值。
                    //如果：U.getAndAddInt(this, LOCKSTATE, -READER) == (READER|WAITER)
                    //说明：当前线程是最后一条读线程|有线程持有等待锁 并且有等待写线程被阻塞着，
                    //则唤醒该等待线程，让阻塞的写线程去竞争写锁
                    Thread w;
                    if (U.getAndAddInt(this, LOCKSTATE, -READER) == (READER|WAITER) 
                              && (w = waiter) != null)
                        //这里唤醒的是contendedLock方法中因获取不到锁而使用LockSupport.park方法阻塞起来的线程
                        LockSupport.unpark(w);
                }
                return p;
            }
        }
    }
    return null;
}
```

说明：上面我们说到了在调用`TreeBin`节点的`find`方法时，通过对当前`TreeBin`内部自己实现的锁的状态判断，从而选择相应的遍历方式的做法，总结起来就是如下两种情况：

1. 当`get`操作遇到`WAITER`或者`WRITER`锁时直接以链表的方式去遍历查找目标元素，如果在查找期间`WAITER`和`WRITER`锁全部被释放掉了，则放弃使用链表方式遍历红黑树，而改为使用红黑树遍历，即便在原来已经使用链表方式遍历了一部分链表节点的情况下。
2. 当`get`操作遇到没有`WAITER`和`WRITER`锁时，直接将`lockState`叠加上`4(READER)`的值，期间可能会有多个读线程在执行`get`操作，而当这些读取操作全部完成后，如果发现有等待写的线程被阻塞的话，该度线程会负责将等待写线程唤醒，让阻塞的写线程去竞争写锁。

`WAITER`(等待写锁)/`WRITER`(写锁)：在`find`方法中线程如何对红黑树进行`READER`也就是读锁的设置，里面还涉及到了另外两个锁，那就是`WAITER`和`WRITER`，下面我们来详细了解一下这两个锁是在什么情况下被设置的，以及他们之间有哪些互斥的关系 。

```java
//该方法用于设置写锁(WRITER)，也就是在红黑树需要重构的情况下
private final void lockRoot() {
    //使用CAS方式设置lockState的值，设置成功则该方法执行完毕，如果设置失败则说明当前红黑树的锁的状态不为0，
    //有线程持有读锁或者等待写锁(这里不存在写-写竞争，因为数组上的同步锁已经过滤掉这种情况)
    if (!U.compareAndSwapInt(this, LOCKSTATE, 0, WRITER))
        //尝试占有写锁失败后调用contendedLock方法进行后续循环尝试获取写锁的动作
        contendedLock(); // offload to separate method
}
```

说明：该`lockRoot`方法看名字就知道他的目的是将红黑树的`root`节点锁住，该方法在两个地方被调用到；

一是：`putTreeVal`红黑树插入元素后需要自平衡时，需要调用该方法将红黑树根节点锁住，然后再重新调整红黑树从而重新达到平衡状态。
二是：`removeTreeNode`对红黑树元素进行删除时需要将根节点锁住，再进行删除操作。

接下来我们继续看`contendedLock`方法：

```java
//遇到设置写锁失败时才进入到该方法(不存在**写-写**阻塞，只存在**读-写**阻塞，
//因为数组上hash桶的修改操作已经使用synchronized同步锁互斥)，通过for死循环继续尝试获取写锁
private final void contendedLock() {
    boolean waiting = false;
    //该循环是个死循环，只能通过内部第一个if分支的return退出，也就是直到获取到写锁才会退出，否则一直循环以及阻塞
    for (int s;;) {
        //WAITER 二进制为：010，所以~WAITER 二进制为：101
        //所以((s = lockState) & ~WAITER) == 0 意思为当前红黑树没有任何线程对其持有**读锁和写锁**，
        //此时可以与其他线程竞争**写锁**
        if (((s = lockState) & ~WAITER) == 0) {
            //竞争**写锁**，如果竞争成功，拿到写锁将等待线程对象设置为null，获取写锁成功，退出方法，否则继续循环
            if (U.compareAndSwapInt(this, LOCKSTATE, s, WRITER)) {
                //如果之前有设置等待线程，则将其设置为null
                if (waiting)
                    waiter = null;
                return;
            }
        }
        //如果竞争写锁失败，并且当前红黑树黑没有等待写的线程，则尝试将当前线程设置为等待线程
        //(s & WAITER) == 0：lockState & 010 = 000；
        //说明lockState不能存在3位二进制的中间数值等于1的情况，也就是目前还没有线程持有等待锁
        else if ((s & WAITER) == 0) {
            //竞争等待锁，如果获取到等待锁则将当前线程设置为等待线程并将等待标识设置为true
            //(s | WAITER)：这里可能出现两种情况的或运算：001|010=011; 100|010=110; 
            //根据运算结果可知其实际上为一个lockState数值的叠加操作
            if (U.compareAndSwapInt(this, LOCKSTATE, s, s | WAITER)) {
                waiting = true;
                waiter = Thread.currentThread();
            }
        }
        //如果当前线程之前已经设置为了等待线程，并且经过循环后依旧未能竞争到写锁，
        //为了避免一直循环耗费不必要的CPU资源，使用park方法使当前线程阻塞
        else if (waiting)
            //使线程进入阻塞状态，与这里相对应的是TreeBin中的find方法里面的LockSupport.unpark唤醒方法
            LockSupport.park(this);
    }
}
```

说明：线程在`lockRoot`方法设置**写锁**失败后进入该`contendedLock`方法继续死循环进行获取**写锁**的操作，直至获取到**写锁**才会退出该死循环。进入该方法后首先进行`if`分支判断尝试获取**写锁**。如果获取失败则尝试进行第二个操作，设置为等待锁，如果当前红黑树已经有等待线程存在，则继续循环，直到获取到等待锁(或者写锁)，如果获取到等待锁，将当前线程设置为等待线程，并继续循环，如果循环后依旧未能竞争到写锁，为了避免一直循环耗费不必要的`CPU`资源，使用`LockSupport.park`方法使当前线程进入阻塞状态。该阻塞状态的解除为上面说过的`find`方法中的`LockSupport.unpark(w)`操作。

注意：因为红黑树内部不存在**写-写**互斥，只存在**读-写**互斥，所以`LockSupport.unpark`方法只需要在读相关的方法(例如：`find`)中存在即可，也就是只需要在读相关的方法中唤醒被阻塞的线程，而不需要在写的方法中存在(例如：putTreeVal)。

最后我们看一下`unlockRoot`方法：

```java
//将lockState设置为0即可释放锁
private final void unlockRoot() {
    lockState = 0;
}
```

说明：该方法是伴随着`lockRoot`成对出现的，也就意味着该方法释放的是写锁，同样也是在`putTreeVal`和`removeTreeNode`方法中有调用到。

总结一下，`get`方法总共会遇到如下`3`种情形：

1. 非扩容情况下：遇到`get`操作，通过计算`(n - 1) & h`定位到具体的hash桶位置，如果数组上的`hash`桶就是目标元素则直接返回即可。
   如果当前`hash`桶为普通`Node`节点链表，则使用普通链表方式去遍历该链表查找目标元素。如果定位到的`hash`桶为`TreeBin`节点，则根据`TreeBin`内部维护的红黑树锁来确定具体采用哪种方式遍历查找元素，如果红黑树锁的状态为**写锁/等待写锁**，则使用链表方式去遍历查找目标元素，而反之红黑树锁状态为**无锁/读锁**，则使用红黑树方式去遍历查找目标元素，红黑树锁只存在**读-写**互斥而不存在**写-写**互斥。
2. 集合正在扩容并且当前`hash`桶正在迁移中：遇到`get`操作，在扩容过程期间会形成`hn`和`ln`链，形成这两条中间链是使用的类似于复制引用的方式，也就是说`ln`和`hn`链是复制出来的，而非原`hash`桶的链表剪切过去的，所以原来`hash`桶上的链表并没有受到影响，因此从迁移开始到迁移结束这段时间都是可以正常访问原数组`hash`桶上面的链表，具体访问方式同上面的(1)点。
3. 集合扩容还未结束但是当前`hash`桶已经迁移完成：遇到`get`操作，每迁移完一个`hash`桶后当前`hash`桶的位置都会被替换成`ForwardingNode`节点，遇到`get`操作时直接将查找操作转发到新的数组上去，也就是直接到新数组上面查找目标元素，具体的查找方式依旧跟上面的(1)点相同。

### size相关的方法

对于`ConcurrentHashMap`来说，这个`table`里到底装了多少东西其实是个不确定的数量，因为不可能在调用`size()`方法的时候像`GC`的“stop the world”一样让其他线程都停下来让你去统计，因此只能说这个数量是个估计值。对于这个估计值，`ConcurrentHashMap`也是大费周章才计算出来的。

#### 辅助定义

为了统计元素个数，`ConcurrentHashMap`定义了一些变量和一个内部类

```java
@sun.misc.Contended static final class CounterCell {
    volatile long value;
    CounterCell(long x) { value = x; }
}

/*****************************************/  

//实际上保存的是hashmap中的元素个数  利用CAS锁进行更新
//但它并不用返回当前hashmap的元素个数 
private transient volatile long baseCount;

//标识当前cell数组是否在初始化或扩容中的CAS标志位
private transient volatile int cellsBusy;

//counterCells数组，总数值的分值分别存在每个cell中
private transient volatile CounterCell[] counterCells;
```

#### mappingCount与size方法

`mappingCount`与`size`方法的类似，从注释来看，应该使用`mappingCount`代替`size`方法，两个方法都没有直接返回`basecount`而是统计一次这个值，而这个值其实也是一个大概的数值，因此可能在统计的时候有其他线程正在执行插入或删除操作。

```java
public int size() {
    //调用sumCount()计算元素个数
    long n = sumCount();
    return ((n < 0L) ? 0 
            : (n > (long)Integer.MAX_VALUE) 
                ? Integer.MAX_VALUE
                : (int)n);
}

public long mappingCount() {
    long n = sumCount();
    return (n < 0L) ? 0L : n; // ignore transient negative values
}

final long sumCount() {
    //计算CounterCell所有段及baseCount的数量之和
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null) {
        for (int i = 0; i < as.length; ++i) {
            if ((a = as[i]) != null)
                sum += a.value;//所有counter的值求和
        }
    }
    return sum;
}
```

## 总结

`JDK6, 7`中的`ConcurrentHashmap`主要使用`Segment`来实现减小锁粒度，把`HashMap`分割成若干个`Segment`，在`put`的时候需要锁住`Segment`，`get`时候不加锁，使用`volatile`来保证可见性，当要统计全局时（比如`size`），首先会尝试多次计算`modCount`来确定，这几次尝试中，是否有其他线程进行了修改操作，如果没有，则直接返回`size`。如果有，则需要依次锁住所有的`Segment`来计算。

`JDK7`中`ConcurrentHashmap`中，当长度过长碰撞会很频繁，链表的增改删查操作都会消耗很长的时间，影响性能。所以，`DK8`中完全重写了`ConcurrentHashMap`，代码量从原来的`1000`多行变成了`6000`多行，实现上也和原来的分段式存储有很大的区别。

主要设计上的变化有以下几点:

1. 不采用`segment`而采用`node`，锁住`node`来实现减小锁粒度。
2. 设计了`MOVED`状态，当`resize`的过程中线程`2`还在`put`数据，线程`2`会帮助`resize`。
3. 使用`3`个`CAS`操作来确保`node`的一些操作的原子性，这种方式代替了锁。
4. `sizeCtl`的不同值来代表不同含义，起到了控制的作用。

## 拓展

### 为什么使用synchronized而不是ReentrantLock？

1. 减少内存开销

    假设使用可重入锁来获得同步支持，那么每个节点都需要通过继承`AQS`来获得同步支持。但并不是每个节点都需要获得同步支持的，只有链表的头节点(红黑树的根节点)需要同步，这无疑带来了巨大内存浪费。

2. 获得JVM的支持

    可重入锁毕竟是`API`这个级别的，后续的性能优化空间很小。`synchronized`则是`JVM`直接支持的，`JVM`能够在运行时作出相应的优化措施：锁粗化、锁消除、锁自旋等等。这就使得`synchronized`能够随着`JDK`版本的升级而不改动代码的前提下获得性能上的提升。

### 能完全替代Hashtable吗?

`Hashtable`虽然性能上不如`ConcurrentHashMap`，但并不能完全被取代，两者的迭代器的一致性不同的。`Hashtable`的迭代器是强一致性的，而`ConcurrentHashMap`是弱一致性的。

`ConcurrentHashMap`的`get`，`clear`，`iterator`都是弱一致性的。往`ConcurrentHashMap`里`put`一个元素，短时间`get`不到这个元素。

### 为什么不允许插入空值或空键

对于`ConcurrentHashMap`不允许插入`null`值的问题，有人问过`ConcurrentHashMap`的作者`DougLea`，以下是他回复的邮件内容：

> The main reason that nulls aren’t allowed in ConcurrentMaps (ConcurrentHashMaps, ConcurrentSkipListMaps) is that ambiguities that may
> be just barely tolerable in non-concurrent maps can’t be accommodated. The main one is that if map.get(key) returns null, you can’t
> detect whether the key explicitly maps to null vs the key isn’t mapped.
>
> In a non-concurrent map, you can check this via map.contains(key), but in a concurrent one, the map might have changed between calls.
> Further digressing: I personally think that allowing nulls in Maps (also Sets) is an open invitation for programs to contain errors
> that remain undetected until they break at just the wrong time. (Whether to allow nulls evenin non-concurrent Maps/Sets is one of
> the few design issues surroundingCollections that Josh Bloch and I have long disagreed about.)It is very difficult to check for
> null keys and values in my entire application.
>
> Would it be easier to declare somewhere
> static final Object NULL = new Object();
> and replace all use of nulls in uses of maps with NULL?
>
> -Doug

以上信件的主要意思是，`DougLea`认为这样设计最主要的原因是：不容忍在并发场景下出现歧义！

**二义性问题：**

所谓的二义性问题是指含义不清或不明确。

我们假设`ConcurrentHashMap`允许插入`null`，那么此时就会有二义性问题，它的二义性含义有两个：

1. 值没有在集合中，所以返回`null`。
2. 值就是`null`，所以返回的就是它原本的`null`值。

可以看出这就是`ConcurrentHashMap`的二义性问题，那为什么`HashMap`就不怕二义性问题呢？

**可证伪的HashMap：**

上面说到`HashMap`是不怕二义性问题的，为什么呢？

这是因为`HashMap`的设计是给单线程使用的，所以如果查询到了`null`值，我们可以通过`hashMap.containsKey(key)`的方法来区分这个`null`值到底是存入的`null`？还是压根不存在的`null`？这样二义性问题就得到了解决，所以`HashMap`不怕二义性问题。

**不可证伪的ConcurrentHashMap：**

而`ConcurrentHashMap`就不一样了，因为`ConcurrentHashMap`使用的场景是多线程，所以它的情况更加复杂。

我们假设`ConcurrentHashMap`可以存入`null`值，有这样一个场景，现在有一个线程`A`调用了`concurrentHashMap.containsKey(key)`，我们期望返回的结果是`false`，但在我们调用`concurrentHashMap.containsKey(key)`之后，未返回结果之前，线程`B`又调用了`concurrentHashMap.put(key,null)`存入了`null`值，那么线程`A`最终返回的结果就是`true`了，这个结果和我们之前预想的`false`完全不一样。

也就是说，多线程的状况非常复杂，我们没办法判断某一个时刻返回的`null`值，到底是值为`null`，还是压根就不存在，也就是二义性问题不可被证伪，所以`ConcurrentHashMap`才会在源码中这样设计，直接杜绝`key`或`value`为`null`的歧义问题。
