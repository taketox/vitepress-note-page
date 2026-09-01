# ConcurrentSkipListMap

## 概述

在学习`ConcurrentSkipListMap`之前，我们需要来了解一种随机化的数据结构：跳跃表（skip list）。

`ConcurrentSkipListMap`是一个基于`skip list`实现的线程安全的有序存储的`Map`，默认情况下根据`key`的自然顺序进行排序，或者根据在`Map`进行创建时提供的比较器进行排序。同样，该类不允许`key`或者`value`为`null`。

## 源码分析

### 继承结构

```java
public class ConcurrentSkipListMap<K,V> extends AbstractMap<K,V>
    implements ConcurrentNavigableMap<K,V>, Cloneable, Serializable {
    
}
```

`ConcurrentSkipListMap`继承了`AbstractMap`，该抽象类提供了接口的一些常规实现；而继承了`ConcurrentNavigableMap`接口，该接口可以获取`Map`的某一部分元素或者子元素；另外，该类支持克隆和序列化操作。

### 属性

来看一下它的常用属性：

```java
/**
 * 最底层的头节点的索引
 */
private static final Object BASE_HEADER = new Object();

/**
 * 最顶层头节点索引
 */
private transient volatile HeadIndex<K,V> head;

/**
 * 比较器，如果使用自然排序，该值为null
 */
final Comparator<? super K> comparator;

/** key集合 */
private transient KeySet<K> keySet;

/** entry集合 */
private transient EntrySet<K,V> entrySet;

/** value集合 */
private transient Values<V> values;

/** 降序键集合 */
private transient ConcurrentNavigableMap<K,V> descendingMap;
```

其中比较重要的是比较器，因为`ConcurrentSkipListMap`会根据`key`进行排序，如果传为`null`，则表示是根据元素的自然顺序进行排序。

### 内部类

`ConcurrentSkipListMap`中有三个比较重要的内部类，分别是**Node**，**Index**，**HeadIndex**这三个类。

- `Node`表示最底层的链表节点
- `Index`类表示基于`Node`类的索引层
- 而`HeadIndex`则是用来维护索引的层次。

先来看下`Node`类：

```java
static final class Node<K,V> {
    final K key;
    volatile Object value;
    volatile Node<K,V> next;
}
```

可以看到，`Node`这个类中包含了`Map`的`key`和`value`，还包含了一个指向下一节点的指针`next`，并且这里使用的是单链表结构。然后再来看下`Index`这个类：

```java
static class Index<K,V> {
    // Node节点的引用
    final Node<K,V> node;
    // 下层Index的引用
    final Index<K,V> down;
    // 右侧Index的引用
    volatile Index<K,V> right;
}
```

可以看出，`Index`类作为索引节点，共包含了三个属性，一个是`Node`节点的引用，一个是指向下一层的索引节点的引用，一个是指向右侧索引节点的引用。

接下来再来看下`HeadIndex`这个类：

```java
static final class HeadIndex<K,V> extends Index<K,V> {
    final int level;
    HeadIndex(Node<K,V> node, Index<K,V> down, Index<K,V> right, int level) {
        super(node, down, right);
        this.level = level;
    }
}
```

可以看出，`HeadIndex`继承自`Index`，扩展了一个`level`属性，表示当前索引节点`Index`的层级。

### 构造方法

`ConcurrentSkipListMap`共包含了4个构造方法，我们来简单看下：

```java
public ConcurrentSkipListMap() {
    this.comparator = null;
    initialize();
}

public ConcurrentSkipListMap(Comparator<? super K> comparator) {
    this.comparator = comparator;
    initialize();
}
```

这两个构造方法，一个是默认的方法，表示按照自然顺序进行排序（也就是key必须实现了Comparable接口）；另一个是按照给定的比较器进行排序的构造方法；

```java
public ConcurrentSkipListMap(Map<? extends K, ? extends V> m) {
    this.comparator = null;
    initialize();
    putAll(m);
}
```

这个构造方法表示从给定的Map构造一个ConcurrentSkipListMap对象，并按照key的自然顺序进行排序；

```java
public ConcurrentSkipListMap(SortedMap<K, ? extends V> m) {
    this.comparator = m.comparator();
    initialize();
    buildFromSorted(m);
}
```

这个构造方法表示从给定的Map构造一个ConcurrentSkipListMap对象，而顺序则是按照SortedMap的顺序来进行排序。

------

这里都调用到了`initialize`这个方法来初始化对象，我们来看下：

```java
private void initialize() {
    keySet = null;
    entrySet = null;
    values = null;
    descendingMap = null;
    // 构造跳跃表的头节点head
    head = new HeadIndex<K,V>(new Node<K,V>(null, BASE_HEADER, null),
                              null, null, 1);
}
```

可以看到，这里构造了跳跃表的头节点head，构造完成之后，大概如下：

![An image](/img/java/container/58.png)

### 方法

由于该类的方法比较多，所以这里只介绍几个常用的方法。

#### put方法

```java
public V put(K key, V value) {
    // value不能为空
    if (value == null)
        throw new NullPointerException();
    return doPut(key, value, false);
}
```

可以看到，put方法内部调用的是`doPut`方法，在看doPut方法前，我们先来看下该方法中调用到的另一个方法：`findPredecessor`。

**findPredecessor**方法表示查询key应该插入位置的前驱节点（如果遇到需要删除的节点，那么进行辅助性删除），从最高层的head节点一直向右方向进行遍历，知道右侧的节点为null或者Node的key大于当前key为止，然后再向下寻找，依次重复该过程，直到down为null，这时候就找到了前驱节点。

```java
private Node<K,V> findPredecessor(Object key, Comparator<? super K> cmp) {
    if (key == null)
        throw new NullPointerException(); // don't postpone errors
    for (;;) {
        // 从head节点开始遍历，q和r作为临时的head节点和head的右节点
        for (Index<K,V> q = head, r = q.right, d;;) {
            // 如果head节点的右节点存在
            if (r != null) {
                // 获取head节点的右节点
                Node<K,V> n = r.node;
                // 获取右节点的key
                K k = n.key;
                // 如果右节点的value为空，说明右侧已经没节点了，该节点已经被删除了
                if (n.value == null) {
                    // 通过unlink方法移除该节点
                    if (!q.unlink(r))
                        break;           // restart
                    // 如果unlink方法返回了false，也就是head的右节点已经有值了
                    // 那就重新赋值，重新操作
                    r = q.right;         // reread r
                    continue;
                }
                // 通过比较器对key进行比较，如果key大于r节点的key，则继续向后遍历
                if (cpr(cmp, key, k) > 0) {
                    // 节点后移，q和r整体后移
                    q = r;
                    r = r.right;
                    continue;
                }
            }
            // 如果q.down == null，表示指针已经到最下层了，直接返回该节点
            if ((d = q.down) == null)
                return q.node;
            // 进入下层遍历
            q = d;
            r = d.right;
        }
    }
}
```

接下来，我们来看下doPut方法：

```java
private V doPut(K key, V value, boolean onlyIfAbsent) {
    Node<K,V> z;             // added node
    // key不能为空
    if (key == null)
        throw new NullPointerException();
    // 获取到比较器
    Comparator<? super K> cmp = comparator;
    // 无限循环
    outer: for (;;) {
        // 先找到应该插入位置的前驱节点，b表示待插入位置的前驱节点，n是前驱节点的后继节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            if (n != null) {
                Object v; int c;
                Node<K,V> f = n.next;
                // 防止多线程下数据已经修改
                if (n != b.next)               // inconsistent read
                    break;
                // 如果节点n已经逻辑删除，这里进行辅助性物理删除
                if ((v = n.value) == null) {   // n is deleted
                    n.helpDelete(b, f);
                    break;
                }
                // 如果b已经被删除，结束本层查询
                if (b.value == null || v == n) // b is deleted
                    break;
                // 如果节点key 大于 n节点的key，继续往后遍历
                if ((c = cpr(cmp, key, n.key)) > 0) {
                    b = n;
                    n = f;
                    continue;
                }
                // 如果节点key与n节点的key相等
                if (c == 0) {
                    // 比较并交换值，也就是替换值
                    if (onlyIfAbsent || n.casValue(v, value)) {
                        @SuppressWarnings("unchecked") V vv = (V)v;
                        return vv;
                    }
                    // 如果竞争失败，重试
                    break; // restart if lost race to replace value
                }
                // else c < 0; fall through
            }
            // 新创建一个节点，next指向n
            z = new Node<K,V>(key, value, n);
            // 比较并交换，也就是插入节点；如果竞争失败，重试；成功，则跳出循环
            if (!b.casNext(n, z))
                break;         // restart if lost race to append to b
            break outer;
        }
    }
    // 获取随机种子
    int rnd = ThreadLocalRandom.nextSecondarySeed();
    // 测试最低和最高位，用于判断是否需要添加level
    if ((rnd & 0x80000001) == 0) { // test highest and lowest bits
        int level = 1, max;
        // 确定level的级别
        while (((rnd >>>= 1) & 1) != 0)
            ++level;
        Index<K,V> idx = null;
        HeadIndex<K,V> h = head;
        // 如果level小于最大层，就在对应层次以及小于该level的层次进行节点新增处理
        if (level <= (max = h.level)) {
            for (int i = 1; i <= level; ++i)
                // 为节点生成对应的Index节点，并从下往上依次赋值，并且赋值了Index节点的down节点
                idx = new Index<K,V>(z, idx, null);
        }
        // 否则，需要新增一层
        else { // try to grow by one level
            level = max + 1; // hold in array and later pick the one to use
            // 使用数组来保存Index节点
            @SuppressWarnings("unchecked")Index<K,V>[] idxs =
                (Index<K,V>[])new Index<?,?>[level+1];
            for (int i = 1; i <= level; ++i)
                // 从下往上生成Index结点，并赋值down节点，这里数组的第一个值idxs[0]应该是没用到
                idxs[i] = idx = new Index<K,V>(z, idx, null);
            for (;;) {
                // 保存头节点
                h = head;
                // 保存之前的level
                int oldLevel = h.level;
                // 如果线程发生了竞争失败（其他线程改变了该跳跃表），重新来过
                if (level <= oldLevel) // lost race to add level
                    break;
                HeadIndex<K,V> newh = h;
                Node<K,V> oldbase = h.node;
                // 为新生成的一层 生成一个新的头节点
                for (int j = oldLevel+1; j <= level; ++j)
                    newh = new HeadIndex<K,V>(oldbase, newh, idxs[j], j);
                if (casHead(h, newh)) {
                    // 更新head节点，比较并替换
                    // h赋值为最高层的头节点
                    h = newh;
                    // idx赋值为之前层级的头结点x，并将level赋值为之前的层级
                    idx = idxs[level = oldLevel];
                    break;
                }
            }
        }
        // find insertion points and splice in
        // 上述操作只是生成了对应的索引节点，但是并没有将这些节点插入到对应的层之中，下面这些代码是插入Index节点
        // 从level层开始操作
        splice: for (int insertionLevel = level;;) {
            // 保存新表的层级
            int j = h.level;
            for (Index<K,V> q = h, r = q.right, t = idx;;) {
                // 如果头结点或者idx结点为空，跳出这层循环
                if (q == null || t == null)
                    break splice;
                // 如果头节点右侧节点不为空
                if (r != null) {
                    Node<K,V> n = r.node;
                    // compare before deletion check avoids needing recheck
                    // key进行比较
                    int c = cpr(cmp, key, n.key);
                    // 需要删除的节点
                    if (n.value == null) {
                        if (!q.unlink(r))
                            break;
                        r = q.right;
                        continue;
                    }
                    // 大于0，向右继续查找
                    if (c > 0) {
                        q = r;
                        r = r.right;
                        continue;
                    }
                }
                // 找到节点进行插入的位置，这里准备进行插入
                if (j == insertionLevel) {
                    // 插入，也就是将r结点插入到q与t之间；失败重试
                    if (!q.link(r, t))
                        break; // restart
                    if (t.node.value == null) {
                        findNode(key);
                        break splice;
                    }
                    // 如果到达最底层，跳出循环
                    if (--insertionLevel == 0)
                        break splice;
                }
                // 向下进入其他层进行查找
                if (--j >= insertionLevel && j < level)
                    t = t.down;
                q = q.down;
                r = q.right;
            }
        }
    }
    return null;
}
```

doPut方法内容比较多，我们来梳理下该方法的操作流程：

- 根据key从跳跃表的左上方开始，向右或者向下查找到需要插入位置的前驱Node节点，查找过程中会删除一些已经标记为删除状态的节点；
- 然后判断跳跃表中是否已经存在了该key，如果存在比较并替换；然后生成节点，插入到最底层链表中；
- 然后根据随机值来判断是否生成索引层以及生成索引层的层次；
- 如果需要创建索引层，则判断索引层是否超过最大的level，如果大于，需要创建HeadIndex索引层；否则只需要创建Index索引层即可；
- 从head开始进行遍历，将每一层的新添加的Index插入到对应的位置；

可以看出，该方法还是比较复杂的，大家有时间可以多看两遍。

#### get方法

get方法内部调用doGet方法，还有一个**getOrDefault**方法也是类似的：

```java
public V get(Object key) {
    return doGet(key);
}

public V getOrDefault(Object key, V defaultValue) {
    V v;
    return (v = doGet(key)) == null ? defaultValue : v;
}
```

接下来主要来看下doGet方法的实现：

```java
private V doGet(Object key) {
    // key不为空
    if (key == null)
        throw new NullPointerException();
    // 获取比较器
    Comparator<? super K> cmp = comparator;
    outer: for (;;) {
        // 同样还是先找到对应的前驱节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            Object v; int c;
            if (n == null)
                break outer;
            Node<K,V> f = n.next;
            // 跳跃表发生了变化，重试
            if (n != b.next)                // inconsistent read
                break;
            // 物理删除对应的节点
            if ((v = n.value) == null) {    // n is deleted
                n.helpDelete(b, f);
                break;
            }
            // 如果b已经被删除，结束本层查询
            if (b.value == null || v == n)  // b is deleted
                break;
            // 查找到返回
            if ((c = cpr(cmp, key, n.key)) == 0) {
                @SuppressWarnings("unchecked") V vv = (V)v;
                return vv;
            }
            // 小于说明不存在该值，结束循环
            if (c < 0)
                break outer;
            // 向右接着遍历（有可能其他线程添加了数据）
            b = n;
            n = f;
        }
    }
    return null;
}
```

相比`doPut`方法，`doGet`方法就比较简单了。先找到对应的前驱节点，然后一直向右查找即可，中间如果有某个节点需要删除，顺手删除即可。当然如果发现跳跃表数据结构被其它线程改变，会重新尝试获取其前驱。

#### remove方法

`remove`有两个重载方法，一个是根据`key`进行删除，另一个是根据`key`和`value`一并进行删除，当然内部调用的都是`doRemove`方法：

```java
public boolean remove(Object key, Object value) {
    if (key == null)
        throw new NullPointerException();
    return value != null && doRemove(key, value) != null;
}

public V remove(Object key) {
    return doRemove(key, null);
}
```

接下来我们来看下`doRemove`方法：

```java
final V doRemove(Object key, Object value) {
    if (key == null)
        throw new NullPointerException();
    Comparator<? super K> cmp = comparator;
    outer: for (;;) {
        // 先获取前驱节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            Object v; int c;
            if (n == null)
                break outer;
            Node<K,V> f = n.next;
            if (n != b.next)                    // inconsistent read
                break;
            if ((v = n.value) == null) {        // n is deleted
                n.helpDelete(b, f);
                break;
            }
            // 如果b已经被删除，结束本层查询
            if (b.value == null || v == n)      // b is deleted
                break;
            // 如果不存在该key，结束循环
            if ((c = cpr(cmp, key, n.key)) < 0)
                break outer;
            // 向右进行查找
            if (c > 0) {
                b = n;
                n = f;
                continue;
            }
            // 判断完key之后，再判断value是否相等，value不相等，退出
            if (value != null && !value.equals(v))
                break outer;
            // 将v进行比较并设置为null(逻辑删除)，如果多线程下失败，则重试
            if (!n.casValue(v, null))
                break;
            // 先添加一个用于删除标记的节点，然后比较并更新b的next节点
            if (!n.appendMarker(f) || !b.casNext(n, f))
                findNode(key);                  // retry via findNode
            else {
                // 调用该方法 辅助清除key对应的索引层
                findPredecessor(key, cmp);      // clean index
                // 如果该层已经没有节点，删除该层
                if (head.right == null)
                    tryReduceLevel();
            }
            @SuppressWarnings("unchecked") V vv = (V)v;
            return vv;
        }
    }
    return null;
}
```

`doRemove`方法也不是太难，我们来简单梳理下它的流程：

- 先查找到对应的前驱节点，并且查找过程中会删除一些已经标记为删除状态的节点；
- 查询到要删除的节点，通过`CAS`操作把`value`设置为`null`（这样其他线程可以感知到这个节点状态，协助完成删除工作），然后在该节点后面添加一个marker节点作为删除标志位，若添加成功，则将该结点的前驱的后继设置为该结点之前的后继（也就是删除该节点操作），这样可以避免丢失数据；
- 如果该层已经没有了其他节点，调用`tryReduceLevel`方法移除该层；

> 这里可能需要说明下，因为ConcurrentSkipListMap是支持并发操作的，因此在删除的时候可能有其他线程在该位置上进行插入，这样有可能导致数据的丢失。在ConcurrentSkipListMap中，会在要删除的节点后面添加一个特殊的节点进行标记，然后再进行整体的删除，如果不进行标记，那么如果正在删除的节点，可能其它线程正在此节点后面添加数据，造成数据丢失。

这个方法中间涉及到了两个小方法，首先是`helpDelete`方法，用于帮助删除节点的方法，来简单看下：

```java
void helpDelete(Node<K,V> b, Node<K,V> f) {
    /*
     * Rechecking links and then doing only one of the
     * help-out stages per call tends to minimize CAS
     * interference among helping threads.
     */
    if (f == next && this == b.next) {
        // 如果没有添加删除标记节点，那么添加删除标记
        if (f == null || f.value != f) // not already marked
            casNext(f, new Node<K,V>(f));
        else
            // 执行删除操作
            b.casNext(this, f.next);
    }
}
```

另外，是减少层级的方法`tryReduceLevel`方法：

```java
private void tryReduceLevel() {
    HeadIndex<K,V> h = head;
    HeadIndex<K,V> d;
    HeadIndex<K,V> e;
    if (h.level > 3 &&
        (d = (HeadIndex<K,V>)h.down) != null &&
        (e = (HeadIndex<K,V>)d.down) != null &&
        e.right == null &&
        d.right == null &&
        h.right == null &&
        casHead(h, d) && // try to set
        h.right != null) // recheck
        casHead(d, h);   // try to backout
}
```

这个方法，是针对最上面的三层进行操作，如果最上面的三层`HeadIndex`的`right`节点都为空，则减少`level`的层数，并设置`head`为之前`head`的下一层；然后再判断之前的`head`的`right`域是否为`null`，这里是重新校验下，如果为`null`，则减少层级成功，否则再次将`head`设置为`h`（这里为什么是三层，可以看下这个方法的注释介绍）。

#### containsValue方法

由于该类的方法特别多，这里我们分析了常用的增加，修改，删除方法外，再随便找个containsValue方法来看下：

```java
public boolean containsValue(Object value) {
    if (value == null)
        throw new NullPointerException();
    // 查找最底层链表的第一个元素
    for (Node<K,V> n = findFirst(); n != null; n = n.next) {
        // 获取值并进行比较
        V v = n.getValidValue();
        if (v != null && value.equals(v))
            return true;
    }
    return false;
}
```

这里调用了**findFirst**方法获取Map中第一个元素，然后获取到后就一直往右侧进行遍历比较操作，比较简单，再来简单看下findFirst方法：

```java
final Node<K,V> findFirst() {
    for (Node<K,V> b, n;;) {
        // 获取第一个保存实际元素的节点，也就是BASE_HEADER节点之后的第一个节点
        if ((n = (b = head.node).next) == null)
            return null;
        if (n.value != null)
            return n;
        // 帮助删除
        n.helpDelete(b, n.next);
    }
}
```

> 不过可能需要注意的是，ConcurrentSkipListMap的size方法与大多数集合不同，它的size方法不是常量操作，因为它并没有维护一个全局变量来统计元素的个数，而是每次调用该方法的时候都需要去遍历，因此如果在遍历期间该集合发生了修改（也就是多线程情况下），则可能出现不准确的情况。

## 使用场景

`ConcurrentHashMap`不保证其操作的运行时作为其合约的一部分。它还允许调整某些加载因子（粗略地说，同时修改它的线程数）。

另一方面，`ConcurrentSkipListMap`保证在各种操作上的平均O（log（n））性能。它也不支持为并发而调整。`ConcurrentSkipListMap`还有一些`ConcurrentHashMap`不支持的操作：ceilingEntry / Key，floorEntry / Key等。它还保持sorting顺序，如果使用的是`ConcurrentHashMap`，则sorting顺序必须被计算（值得注意）。

基本上，针对不同的使用情况提供了不同的实现。如果您需要快速单键/值对添加和快速单键查找，请使用`HashMap`。如果您需要更快的顺序遍历，并且可以承担额外的插入成本，请使用`SkipListMap`。

## 总结

`ConcurrentSkipListMap`是一个线程安全的基于跳跃表实现的非阻塞的`Map`，它要求`Map`中的`key`和`value`都不能为`null`，并且可以通过`key`来进行排序。内部的实现则是通过多层有序链表来实现的，它使用空间换时间的方式，使得链表也能实现类似二分查找的功能。

而它的应用场景，Redis中的有序集合`SortedSet`就是基于散列表和跳跃表来实现的。
