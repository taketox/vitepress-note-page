# HashMap

## 简介

`HashMap`采用`key/value`存储结构，每个`key`对应唯一的`value`，查询和修改的速度都很快，能达到O(1)的平均时间复杂度。它是非线程安全的，且不保证元素存储的顺序。

`HashMap`是一个散列表(数组和链表)，它存储的内容是键值对(`key-value`)映射，能在查询和修改方便继承了数组的线性查找和链表的寻址修改。

## 历史版本

本文`HashMap`源码基于`JDK8`。不同版本`HashMap`的变化还是比较大的，在`1.8`之前，`HashMap`没有引入红黑树，也就是说`HashMap`的桶(桶即`hashmap`数组的一个索引位置)单纯的采取链表存储。这种结构虽然简单，但是当`Hash`冲突达到一定程度，链表长度过长，会导致时间复杂度无限向O(n)靠近。比如向`HashMap`中插入如下元素，你会神奇的发现，在`HashMap`的下标为`1`的桶中形成了一个链表。

```java
map.put(1, 1);
map.put(17, 17);
map.put(33, 33);
map.put(49, 49);
map.put(65, 65);
map.put(81, 81);
map.put(97, 97);
//...
map.put(16^n + 1, 16^n + 1);
```

为了解决这种简单的底层存储结构带来的性能问题，引入了红黑树，在一定程度上缓解了链表存储带来的性能问题。引入红黑树之后当桶中链表长度超过`8`将会树化即转为红黑树(`put`方法触发)，当红黑树元素少于`6`会转为链表(`remove`方法触发)。

在这里还有一个很重要的知识点，树化和链表化的阈值不一样？想一个极端情况，假设阈值都是`8`，一个桶中链表长度为`8`时，此时继续向该桶中`put`会进行树化，然后`remove`又会链表化。如果反复`put`和`remove`。每次都会进行极其耗时的数据结构转换。如果是两个阈值，将会形成一个缓冲带，减少这种极端情况发生的概率。上面这种极端情况也被称之为**复杂度震荡**。类似的复杂度震荡问题`ArrayList`也存在。

## 源码分析

先来看看`hashmap`的结构。

![An image](/img/java/container/09.png)

### 属性

```java
// 初始容量默认16(这个容量不是说map能装多少个元素，而是桶的个数)
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; 

// 最大容量值
static final int MAXIMUM_CAPACITY = 1 << 30; 

// 默认负载因子
static final float DEFAULT_LOAD_FACTOR = 0.75f;

// 树化阈值 一个桶链表长度超过8进行树化
static final int TREEIFY_THRESHOLD = 8;

// 链表化阈值 一个桶中红黑树元素少于6从红黑树变成链表
static final int UNTREEIFY_THRESHOLD = 6;

// 最小树化容量，当容量未达到64，即使链表长度大于8，也不会树化，而是进行扩容。
static final int MIN_TREEIFY_CAPACITY = 64;

// 桶数组，bucket. 这个也就是hashmap的底层结构。
transient Node<K, V>[] table;

// 数量，即hashmap中的元素数量
transient int size;

// hashmap进行扩容的阈值
// 这个表示的元素多少，可不是桶被用了多少，比如阈值是16，当有16个元素就进行扩容，而不是说当桶被用了16个
// threshold = capacity * loadFactor
int threshold;

// 当前负载因子，默认是DEFAULT_LOAD_FACTOR=0.75
final float loadFactor;
```

`HashMap`的实例有两个参数影响其性能：”**初始容量**”和“**加载因子**”。

- **初始容量**：是哈希表在创建时的容量，即桶的个数，**`HashMap`初始容量是`16`**。最大为`2`的`30`次方，当容量达到`64`时才可以树化。
- **加载因子**：是哈希表在其容量自动增加之前可以达到多满的一种尺度。**默认加载因子是`0.75`**。

当哈希表中的条目数超出了**加载因子与当前容量的乘积**时，则要对该哈希表进行扩容(`rehash`)操作(即重建内部数据结构)，从而哈希表将具有大约**`2倍`**的桶数。

默认加载因子是`0.75`，这是在时间和空间成本上寻求一种折衷。加载因子过高虽然减少了空间开销，但同时也增加了查询成本(在大多数`HashMap`类的操作中，包括`get`和`put`操作，都反映了这一点)。在设置初始容量时应该考虑到映射中所需的条目数及其加载因子，以便最大限度地减少`rehash`操作次数。如果初始容量大于最大条目数除以加载因子，则不会发生`rehash`操作。

### 内部类

桶的两种数据结构：`JDK1.8`的`HashMap`采用的是**链表/红黑树**。

#### 链表结构Node

`Node`是一个典型的单链表节点，其中，`hash`用来存储`key`计算得来的`hash`值。

```java
static class Node<K, V> implements Map.Entry<K, V> {
    final int hash;
    final K key;
    V value;
    Node<K, V> next;
    
    Node(int hash, K key, V value, Node<K, V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }    
}
```

#### 红黑树结构TreeNode

继承自`LinkedHashMap`中的`Entry`类，关于`LinkedHashMap.Entry`请参考[LinkedHashMap](/java/container/linkedhashmap/)。

`TreeNode`是一个典型的树型节点，其中，`prev`是链表中的节点，用于在删除元素的时候可以快速找到它的前置节点。

```java
// 位于HashMap中
static final class TreeNode<K, V> extends LinkedHashMap.Entry<K, V> {
    TreeNode<K, V> parent;  // red-black tree links
    TreeNode<K, V> left;
    TreeNode<K, V> right;
    TreeNode<K, V> prev;    // needed to unlink next upon deletion
    boolean red;
    
    TreeNode(int hash, K key, V val, Node<K, V> next) {
        super(hash, key, val, next);
    }    
}

// 位于LinkedHashMap中，典型的双向链表节点
static class Entry<K, V> extends HashMap.Node<K, V> {
    Entry<K, V> before, after;
    Entry(int hash, K key, V value, Node<K, V> next) {
        super(hash, key, value, next);
    }
}
```

### 构造函数

`HashMap`有四个构造函数

```java
public HashMap(int initialCapacity, float loadFactor) { //1，初始化容量2，负载因子
    // 检查传入的初始容量是否合法
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)  // 不能大于最大容量
        initialCapacity = MAXIMUM_CAPACITY;
    // 检查装载因子是否合法
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
    this.loadFactor = loadFactor;
    // 计算扩容门槛
    this.threshold = tableSizeFor(initialCapacity); //总要保持初始容量为2的整数次幂
}

public HashMap(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}

public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}

public HashMap(Map<? extends K, ? extends V> m) {
    this.loadFactor = DEFAULT_LOAD_FACTOR;
    putMapEntries(m, false);
}

static final int tableSizeFor(int cap) {
    // 扩容门槛为传入的初始容量往上取最近的2的n次方
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

`tableSizeFor`该方法大意：如果`cap`不是`2`的`n`次方则取大于`cap`的最小的2的`n`次方的值。当然这个值不能超过`MAXIMUM_CAPACITY`。

### 插入元素 - put

```java
public V put(K key, V value) {
    // 调用hash(key)计算出key的hash值
    return putVal(hash(key), key, value, false, true);
}

static final int hash(Object key) {
    int h;
    // 如果key为null，则hash值为0，否则调用key的hashCode()方法
    // 并让高16位与整个hash异或，这样做是为了使计算出的hash更分散
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
    Node<K, V>[] tab; Node<K, V> p; int n, i;
    //put1，懒加载，第一次put的时候初始化table(node数组)
    if ((tab = table) == null || (n = tab.length) == 0)
        //resize中会进行table的初始化即hashmap数组初始化。
        n = (tab = resize()).length;
    //put2，(n - 1) & hash：计算下标。
    if ((p = tab[i = (n - 1) & hash]) == null) // put3，判空，为空即没hash碰撞。直接放入桶中
        //将数据放入桶中
        tab[i] = newNode(hash, key, value, null);
    else {//put4，有hash碰撞
        Node<K, V> e; K k;
        //如果key已经存在，覆盖旧值
        if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        //put4-3：如果是红黑树直接插入
        else if (p instanceof TreeNode)
            e = ((TreeNode<K, V>)p).putTreeVal(this, tab, hash, key, value);
        else {//如果桶是链表，存在两种情况，超过阈值转换成红黑树，否则直接在链表后面追加
            for (int binCount = 0; ; ++binCount) {
                //put4-1：在链表尾部追加
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        //put4-2：链表长度超过8，树化(转化成红黑树)
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    //如果key已经存在，覆盖旧值
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        //put5：当key已经存在，执行覆盖旧值逻辑。
        if (e != null) { // existing mapping for key 
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)//put6，当size > threshold，进行扩容。
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

其实上面`put`的逻辑还算是比较清晰的。总结一下`put`的过程大致分为以下`6`步。

1. 懒汉式，第一次`put`才初始化`table`桶数组。(节省内存，时间换空间)
2. 计算`key`的`hash`及桶下标。
3. 未发生`hash`碰撞，直接放入桶中。
4. 发生碰撞
   4.1. 如果是链表，迭代插入到链表尾部。
   4.2. 如果链表长度超过`8`，树化即转换为红黑树。(当数组长度小于64时，进行扩容而不是树化)
   4.3. 如果是红黑树，插入到红黑树中。
5. 如果在以上过程中发现`key`已经存在，覆盖旧值。
6. 如果`size > threshold`进行扩容。

#### 扰动函数 - hash算法的实现

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

计算桶下标方法

```java
(n - 1) & hash; //n表示HashMap的容量。相当于取模运算。等同于hash % n。
```

`n`其实就是`HashMap`底层数组的长度。`(n-1) & hash`这个与运算，等同于`hash % n`。`hash()`方法，只是`key`的`hashCode`的再散列，使`key`更加散列。而元素究竟存在哪个桶中。还是 **(n - 1) & hash**结果决定的。综合一下如下，在`hashmap`中计算桶索引的方法如下所示。

```java
public static int index(Object key, Integer length) {
    int h;
    h = (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    return (length - 1) & h;
}
```

假设当前`hashmap`桶个数即数组长度为`16`，现在插入一个元素`key`。

![An image](/img/java/container/10.png)

计算过程如上图所示。得到了桶的索引位置。在上面计算过程中，只有一步是比较难以理解的。也就是为什么不直接拿**key.hashcode() & (n - 1)** ，为什么要用**key.hashcode() ^ (key.hashcode() >>> 16)**为什么要多一步呢？后面问题总结会详细介绍。

#### 树化treeifyBin()方法

在`put`方法中，当链表长度超过`8`进行树化，执行树化方法**treeifyBin(tab, hash)**。但是在该方法中还有一步判断，也就是当数组长度小于`64`。并不会进行树化，而是进行扩容。

假如容量为`16`，链表插入了`7`个元素，如果这时进行树化，树化本身就是一个耗时的过程。时间复杂度会增加，性能下降，不如直接进行扩容，空间换时间。

```java
final void treeifyBin(Node<K, V>[] tab, int hash) {
    int n, index; Node<K, V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        // 如果桶数量小于64，直接扩容而不用树化
        // 因为扩容之后，链表会分化成两个链表，达到减少元素的作用
        // 当然也不一定，比如容量为4，里面存的全是除以4余数等于3的元素
        // 这样即使扩容也无法减少链表的长度
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K, V> hd = null, tl = null;
        // 把所有节点换成树节点    
        do {
            TreeNode<K, V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        // 如果进入过上面的循环，则从头节点开始树化    
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

TreeNode.treeify()方法，真正树化的方法。

```java
final void treeify(Node<K, V>[] tab) {
    TreeNode<K, V> root = null;
    for (TreeNode<K, V> x = this, next; x != null; x = next) {
        next = (TreeNode<K, V>) x.next;
        x.left = x.right = null;
        // 第一个元素作为根节点且为黑节点，其它元素依次插入到树中再做平衡
        if (root == null) {
            x.parent = null;
            x.red = false;
            root = x;
        } else {
            K k = x.key;
            int h = x.hash;
            Class<?> kc = null;
            // 从根节点查找元素插入的位置
            for (TreeNode<K, V> p = root; ; ) {
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

                // 如果最后没找到元素，则插入
                TreeNode<K, V> xp = p;
                if ((p = (dir <= 0) ? p.left : p.right) == null) {
                    x.parent = xp;
                    if (dir <= 0)
                        xp.left = x;
                    else
                        xp.right = x;
                    // 插入后平衡，默认插入的是红节点，在balanceInsertion()方法里
                    root = balanceInsertion(root, x);
                    break;
                }
            }
        }
    }
    // 把根节点移动到链表的头节点，因为经过平衡之后原来的第一个元素不一定是根节点了
    moveRootToFront(tab, root);
}
```

1. 从链表的第一个元素开始遍历；
2. 将第一个元素作为根节点；
3. 其它元素依次插入到红黑树中，再做平衡；
4. 将根节点移到链表第一元素的位置(因为平衡的时候根节点会改变)；

#### TreeNode.putTreeVal()方法

插入元素到红黑树中的方法。

```java
final TreeNode<K, V> putTreeVal(HashMap<K, V> map, Node<K, V>[] tab,
                                int h, K k, V v) {
    Class<?> kc = null;
    // 标记是否找到这个key的节点
    boolean searched = false;
    // 找到树的根节点
    TreeNode<K, V> root = (parent != null) ? root() : this;
    // 从树的根节点开始遍历
    for (TreeNode<K, V> p = root; ; ) {
        // dir=direction，标记是在左边还是右边
        // ph=p.hash，当前节点的hash值
        int dir, ph;
        // pk=p.key，当前节点的key值
        K pk;
        if ((ph = p.hash) > h) {
            // 当前hash比目标hash大，说明在左边
            dir = -1;
        }
        else if (ph < h)
            // 当前hash比目标hash小，说明在右边
            dir = 1;
        else if ((pk = p.key) == k || (k != null && k.equals(pk)))
            // 两者hash相同且key相等，说明找到了节点，直接返回该节点
            // 回到putVal()中判断是否需要修改其value值
            return p;
        else if ((kc == null &&
                // 如果k是Comparable的子类则返回其真实的类，否则返回null
                (kc = comparableClassFor(k)) == null) ||
                // 如果k和pk不是同样的类型则返回0，否则返回两者比较的结果
                (dir = compareComparables(kc, k, pk)) == 0) {
            // 这个条件表示两者hash相同但是其中一个不是Comparable类型或者两者类型不同
            // 比如key是Object类型，这时可以传String也可以传Integer，两者hash值可能相同
            // 在红黑树中把同样hash值的元素存储在同一颗子树，这里相当于找到了这颗子树的顶点
            // 从这个顶点分别遍历其左右子树去寻找有没有跟待插入的key相同的元素
            if (!searched) {
                TreeNode<K, V> q, ch;
                searched = true;
                // 遍历左右子树找到了直接返回
                if (((ch = p.left) != null &&
                        (q = ch.find(h, k, kc)) != null) ||
                        ((ch = p.right) != null &&
                                (q = ch.find(h, k, kc)) != null))
                    return q;
            }
            // 如果两者类型相同，再根据它们的内存地址计算hash值进行比较
            dir = tieBreakOrder(k, pk);
        }

        TreeNode<K, V> xp = p;
        if ((p = (dir <= 0) ? p.left : p.right) == null) {
            // 如果最后确实没找到对应key的元素，则新建一个节点
            Node<K, V> xpn = xp.next;
            TreeNode<K, V> x = map.newTreeNode(h, k, v, xpn);
            if (dir <= 0)
                xp.left = x;
            else
                xp.right = x;
            xp.next = x;
            x.parent = x.prev = xp;
            if (xpn != null)
                ((TreeNode<K, V>) xpn).prev = x;
            // 插入树节点后平衡
            // 把root节点移动到链表的第一个节点
            moveRootToFront(tab, balanceInsertion(root, x));
            return null;
        }
    }
}
```

1. 寻找根节点；
2. 从根节点开始查找；
3. 比较`hash`值及`key`值，如果都相同，直接返回，在`putVal()`方法中决定是否要替换`value`值；
4. 根据`hash`值及`key`值确定在树的左子树还是右子树查找，找到了直接返回；
5. 如果最后没有找到则在树的相应位置插入元素，并做平衡；

在`put`逻辑中还有最重要的一个过程也就是扩容。

### 扩容方法 - resize

#### 扩容

```java
final Node<K, V>[] resize() {
    // 旧数组
    Node<K, V>[] oldTab = table;
    // 旧容量
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    // 旧扩容门槛
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        // 大于最大容量，不进行扩容(桶数量固定)
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        //扩容为原来的两倍，<< 位运算
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY && 
                oldCap >= DEFAULT_INITIAL_CAPACITY)
            //threshold不在重新计算，同样直接扩容为原来的两倍
            newThr = oldThr << 1; 
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        // 如果旧容量为0且旧扩容门槛大于0，则把新容量赋值为旧门槛
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        // 如果旧容量旧扩容门槛都是0，说明还未初始化过，则初始化容量为默认容量，扩容门槛为默认容量*默认装载因子
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        // 如果新扩容门槛为0，则计算为容量*装载因子，但不能超过最大容量
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float) MAXIMUM_CAPACITY
                   ? (int) ft 
                   : Integer.MAX_VALUE);
    }
    // 赋值扩容门槛为新门槛
    threshold = newThr;
    //创建新的桶(原来的两倍)
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K, V>[] newTab = (Node<K, V>[])new Node[newCap];
    // 把桶赋值为新数组
    table = newTab;
    // 如果旧数组不为空，则搬移元素
    if (oldTab != null) {
        // 遍历旧数组
        for (int j = 0; j < oldCap; ++j) {//一共oldCap个桶
            Node<K, V> e;
            if ((e = oldTab[j]) != null) {//如果第j个桶没元素就不管了
                oldTab[j] = null;
                // 只有一个元素，直接移到新的桶中(为什么不先判断是不是TreeNode？
                // 很简单，因为TreeNode没有next指针，在此一定为null，也能证明是一个元素。
                // 对于大多数没有hash冲突的桶，减少了判断，处处充满着智慧)
                if (e.next == null)
                    // 计算桶下标，e.hash & (newCap - 1)是newCap哦
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K, V>)e).split(this, newTab, j, oldCap);
                else { // rehash  源码很经典
                    Node<K, V> loHead = null, loTail = null; // 下标保持不变的桶
                    Node<K, V> hiHead = null, hiTail = null; // 下标扩容两倍后的桶
                    Node<K, V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) { // 判断成立，说明该元素不用移动
                            if (loTail == null)  // 尾空，头插
                                loHead = e;
                            else//尾不空，尾插
                                loTail.next = e;
                            loTail = e;
                        } else { // 判断不成立，说明该元素要移位到(j + oldCap)位置
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead; //j即oldIndex
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead; //j + oldCap即newIndex
                    }
                }
            }
        }
    }
    return newTab;
}
```

在以上过程中，我们着重介绍链表的元素移动。首先，我们看其中

```java
Node<K, V> loHead = null, loTail = null; // 下标保持不变的桶
Node<K, V> hiHead = null, hiTail = null; // 下标扩容两倍后的桶
```

`loHead`和`loTail`分别对应经过`rehash`后下标保持不变的元素形成的链表头和尾。
`hiHead`和`hiTail`分别对应经过`rehash`后下标变为原来(`oldIndex` + `n`)后的链表头和尾。

经过上面变量，我们不难发现，桶中的数据只有两个去向。

- `oldIndex`：保持原位置不动
- `oldIndex` + `n`：散列原索引 + 扩容的长度

**接下来我们思考一个问题。为什么经过`rehash`，一个桶中的元素只有两个去向？**

以下过程很烧脑，但是看懂了保证会收获很多。更会体会到**源码之美**。大致画一下图，如下所示。

![An image](/img/java/container/11.png)

`HashMap`的容量总是2的`n`次方(`n <= 32`)。

假设扩容前桶个数为`16`。

![An image](/img/java/container/12.png)

看扩容前后的结果。观察扩容前后可以发现，唯一影响索引位的是`hash`的低第`5`位。所以分为两种情况`hash`低第`5`位为`0`或者`1`。

![An image](/img/java/container/13.png)

```text
当低第5位为0: newIndex = oldIndex
当低第5位为1: newIndex = oldIndex + oldCap
```

以上过程也就说明了为什么`rehash`后一个桶中的元素只有两个去向。为什么在这里详细介绍这个呢？因为这个很重要，不懂这个就看不懂以上`rehash`代码，也很难体会到`JDK`源码的经典之处。给`ConcurrentHashMap` `rehash`时的锁打一个基础。

```java
if ((e.hash & oldCap) == 0)
```

**这个判断成立，则说明该元素在`rehash`后下标不变，还在原来的索引位置的桶中。为什么？**

我们先看一下**(e.hash & oldCap)**

![An image](/img/java/container/14.png)

看结果，如果判断**if((e.hash & oldCap) == 0)**成立，也就是说`hash`的低第5位为0。在上个问题我们推导桶中元素的两个去向的时候，发现低第`5`位的两种情况决定了该元素的去向。再观察上面问题推导中的`hash`的第一种情况当*为`0`；

![An image](/img/java/container/15.png)

当`hash`低`5`位为`0`时，其新索引为依然为`oldIndex`。当然了这一切巧妙的设计都是建立在`hashmap`桶的数量总是`2`的`n`次方。

回到源码，将新的两个链表分别放到`newTab`的`oldIndex`位置和`newIndex`位置，正如我们上面推导的那样。

```java
if (loTail != null) {
    loTail.next = null;
    newTab[j] = loHead;//j 即oldIndex
}
if (hiTail != null) {
    hiTail.next = null;
    newTab[j + oldCap] = hiHead; //j + oldCap即newIndex
}
```

总结一下扩容的过程：

1. 创建一个两倍于原来(`oldTab`)容量的数组(`newTab`)。
2. 遍历`oldTab`
   2.1 如果当前桶没有元素直接跳过。
   2.2 如果当前桶只有一个元素，直接移动到`newTab`中的索引位。(e.hash & (newCap - 1))
   2.3 如果当前桶为红黑树，在`split()`方法中进行元素的移动。
   2.4 如果当前桶为链表，执行链表的元素移动逻辑。

当然`resize`过程在并发环境下还是存在一定问题的，接下来继续往下看。

#### Jdk7并发环境扩容问题—循环链表

先看源码

```java
//将当前所有的哈希表数据复制到新的哈希表
void transfer(Entry[] newTable, boolean rehash) {
    int newCapacity = newTable.length;
    //遍历旧的哈希表
    for (Entry<K, V> e : table) {
        while(null != e) {
            //保存旧的哈希表对应的链表头的下一个结点
            Entry<K, V> next = e.next;
            if (rehash) {
                e.hash = null == e.key ? 0 : hash(e.key);
            }
            //因为哈希表的长度变了，需要重新计算索引
            int i = indexFor(e.hash, newCapacity);
            //第一次循环的newTable[i]为空，赋值给当前结点的下一个元素，
            e.next = newTable[i];
            //将结点赋值到新的哈希表
            newTable[i] = e;
            e = next;
        }
    }
}
```

`Jdk7`的`hashmap`采用的是头插法，也就是每`put`一个元素，总是插入到链表的头部。相对于`JDK8`尾插法，插入操作时间复杂度更低。看上面`transfer`方法。假设扩容前数组长度为`2`，扩容后即长度为`4`。过程如下。

![An image](/img/java/container/16.png)

第一步：处理节点`5`，`resize`后还在原来位置。
第二步：处理节点`9`，`resize`后还在原来位置。头插，`node(9).next = node(5);`
第三步：处理节点`11`，`resize`后在索引位置`3`处。移动到新桶中。

**并发环境下的问题：**

假设此时有两个线程同时`put`并同时触发`resize`操作。

![An image](/img/java/container/17.png)

线程1执行到，只改变了旧的链表的链表头，使其指向下一个元素9，此时线程1因为分配的时间片已经用完了。

紧接着线程2完成了整个`resize`过程。线程1再次获得时间片，继续执行。解释下图，因为节点本身是在堆区。两个线程栈只是调整链表指针的指向问题。

当线程2执行结束后，`table`这个变量将不是我们关注的重点，因为`table`是两个线程的共享变量，线程2已经将`table`中的变量搬运完了。但是由于线程1停止的时间如上，线程1的工作内存中依然有一个变量`next`是指向9节点的。明确了这一点继续往下看。

当线程2执行结束。线程1继续执行，`newTable[1]`位置是指向节点5的。如下图。

![An image](/img/java/container/18.png)

如上图线程1的第一次`while`循环结束后，注意**e = next**这行代码。经过第一次循环后，e指向9。如下图所示。

![An image](/img/java/container/19.png)

按理来说此时如果线程1也结束了也没啥事了，但是经过线程2的`resize`，9节点时指向5节点的，如上图。所以线程1按照代码逻辑来说，依然没有处理完。然后再将5节点插入到`newTable`中，5节点继续指向9节点，这层循环因为节点5.next==null，所以循环结束(自己看代码逻辑哦，e是在while之外的，所以这里不会死循环)。如下图所示，循环链表形成。

![An image](/img/java/container/20.png)

然后在你下一次进行`get`的时候，会进入死循环。
最后想一下`JDK7`会出现死循环的根源在哪里？很重要哦这个问题，根源就在于`JDK7`用的是头插法，而`resize`又是从头开始`rehash`，也就是在老的`table`中本来是头的，到新`table`中便成为了尾，改变了节点的指向。`

#### JDK8的数据丢失问题

上面介绍了`JDK7`中循环链表的形成，然后想想`JDK8`中的`resize`代码，`JDK8`中的策略是将`oldTab`中的链表拆分成两个链表然后再将两个链表分别放到`newTab`中即新的数组中。在`JDK8`会出现丢失数据的现象(很好理解，在这里就不画图了，感兴趣的自己画一下)，但是不会出现循环链表。丢数据总比形成死循环好吧。另外一点`JDK8`的这种策略也间接的保证了节点间的相对顺序。好吧，还是说说`JDK8`的丢数据问题吧。

```java
do {
    next = e.next;
    if ((e.hash & oldCap) == 0) { // 判断成立，说明该元素不用移动
        if (loTail == null)//尾空，头插
            loHead = e;
        else // 尾不空，尾插
            loTail.next = e;
        loTail = e;
    }
    else { // 判断不成立，说明该元素要移位到(j + oldCap)位置
        if (hiTail == null)
            hiHead = e;
        else
            hiTail.next = e;
        hiTail = e;
    }
} while ((e = next) != null);
if (loTail != null) {
    loTail.next = null;
    newTab[j] = loHead; //j即oldIndex
}
if (hiTail != null) {
    hiTail.next = null;
    newTab[j + oldCap] = hiHead; //j + oldCap即newIndex
}
```

假设两个线程，根据代码逻辑，线程1执行了4次循环让出时间片，如下图所示。

![An image](/img/java/container/21.png)

此时链表table索引1位置的桶如下所示

![An image](/img/java/container/22.png)

如果此时线程2也进行`resize`。此时线程2看到的`oldTab`是如上图所示的。很明显，接下来线程1执行完成，并顺利将两个链表放到了`newTab`中。

此时线程2又获取时间片并继续执行以下操作相当于之前线程1的`resize`结果被线程2覆盖了。此时就发生了数据的丢失。

### 获取元素

```java
public V get(Object key) {
    Node<K, V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value; // get1，计算hash
}

final Node<K, V> getNode(int hash, Object key) {
    Node<K, V>[] tab; Node<K, V> first, e; int n; K k;
    // 如果桶的数量大于0并且待查找的key所在的桶的第一个元素不为空
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {// get2，(n - 1) & hash计算下标
        // 检查第一个元素是不是要查的元素，如果是直接返回
        if (first.hash == hash && // get3-1，首先检查第一个元素(头元素)，如果是目标元素，直接返回
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        if ((e = first.next) != null) {
            // 如果第一个元素是树节点，则按树的方式查找
            if (first instanceof TreeNode)//get3-2，红黑树
                return ((TreeNode<K, V>)first).getTreeNode(hash, key);
            // 否则就遍历整个链表查找该元素
            do {// get3-3，链表
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

看完了`put`的源码，会发现`get`过程是何其简单，大致过程如下

1. 计算`hash`；
2. 计算下标；
3. 获取桶的头节点，如果头结点`key`等于目标`key`直接返回。
   3.1 如果是链表，执行链表迭代逻辑，找到目标节点返回。
   3.2 如果是红黑树，执行红黑树迭代逻辑，找到目标节点返回。

#### TreeNode.getTreeNode()方法

```java
final TreeNode<K, V> getTreeNode(int h, Object k) {
    // 从树的根节点开始查找
    return ((parent != null) ? root() : this).find(h, k, null);
}

final TreeNode<K, V> find(int h, Object k, Class<?> kc) {
    TreeNode<K, V> p = this;
    do {
        int ph, dir;
        K pk;
        TreeNode<K, V> pl = p.left, pr = p.right, q;
        if ((ph = p.hash) > h)
            // 左子树
            p = pl;
        else if (ph < h)
            // 右子树
            p = pr;
        else if ((pk = p.key) == k || (k != null && k.equals(pk)))
            // 找到了直接返回
            return p;
        else if (pl == null)
            // hash相同但key不同，左子树为空查右子树
            p = pr;
        else if (pr == null)
            // 右子树为空查左子树
            p = pl;
        else if ((kc != null ||
                (kc = comparableClassFor(k)) != null) &&
                (dir = compareComparables(kc, k, pk)) != 0)
            // 通过compare方法比较key值的大小决定使用左子树还是右子树
            p = (dir < 0) ? pl : pr;
        else if ((q = pr.find(h, k, kc)) != null)
            // 如果以上条件都不通过，则尝试在右子树查找
            return q;
        else
            // 都没找到就在左子树查找
            p = pl;
    } while (p != null);
    return null;
}
```

经典二叉查找树的查找过程，先根据`hash`值比较，再根据`key`值比较决定是查左子树还是右子树。

### 移除元素

```java
public V remove(Object key) {
    Node<K, V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null 
            ? null 
            : e.value;
}

final Node<K, V> removeNode(int hash, Object key, Object value,
                            boolean matchValue, boolean movable) {
    Node<K, V>[] tab;
    Node<K, V> p;
    int n, index;
    // 如果桶的数量大于0且待删除的元素所在的桶的第一个元素不为空
    if ((tab = table) != null && (n = tab.length) > 0 &&
            (p = tab[index = (n - 1) & hash]) != null) {
        Node<K, V> node = null, e;
        K k;
        V v;
        if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
            // 如果第一个元素正好就是要找的元素，赋值给node变量后续删除使用
            node = p;
        else if ((e = p.next) != null) {
            if (p instanceof TreeNode)
                // 如果第一个元素是树节点，则以树的方式查找节点
                node = ((TreeNode<K, V>) p).getTreeNode(hash, key);
            else {
                // 否则遍历整个链表查找元素
                do {
                    if (e.hash == hash &&
                            ((k = e.key) == key ||
                                    (key != null && key.equals(k)))) {
                        node = e;
                        break;
                    }
                    p = e;
                } while ((e = e.next) != null);
            }
        }
        // 如果找到了元素，则看参数是否需要匹配value值，
        // 如果不需要匹配直接删除，如果需要匹配则看value值是否与传入的value相等
        if (node != null && (!matchValue || (v = node.value) == value ||
                (value != null && value.equals(v)))) {
            if (node instanceof TreeNode)
                // 如果是树节点，调用树的删除方法(以node调用的，是删除自己)
                ((TreeNode<K, V>) node).removeTreeNode(this, tab, movable);
            else if (node == p)
                // 如果待删除的元素是第一个元素，则把第二个元素移到第一的位置
                tab[index] = node.next;
            else
                // 否则删除node节点
                p.next = node.next;
            ++modCount;
            --size;
            // 删除节点后置处理
            afterNodeRemoval(node);
            return node;
        }
    }
    return null;
}
```

1. 先查找元素所在的节点；
2. 如果找到的节点是树节点，则按树的移除节点处理；
3. 如果找到的节点是桶中的第一个节点，则把第二个节点移到第一的位置；
4. 否则按链表删除节点处理；
5. 修改`size`，调用移除节点后置处理等。

#### TreeNode.removeTreeNode()方法

```java
final void removeTreeNode(HashMap<K, V> map, Node<K, V>[] tab,
                          boolean movable) {
    int n;
    // 如果桶的数量为0直接返回
    if (tab == null || (n = tab.length) == 0)
        return;
    // 节点在桶中的索引
    int index = (n - 1) & hash;
    // 第一个节点，根节点，根左子节点
    TreeNode<K, V> first = (TreeNode<K, V>) tab[index], root = first, rl;
    // 后继节点，前置节点
    TreeNode<K, V> succ = (TreeNode<K, V>) next, pred = prev;

    if (pred == null)
        // 如果前置节点为空，说明当前节点是根节点，则把后继节点赋值到第一个节点的位置，相当于删除了当前节点
        tab[index] = first = succ;
    else
        // 否则把前置节点的下个节点设置为当前节点的后继节点，相当于删除了当前节点
        pred.next = succ;

    // 如果后继节点不为空，则让后继节点的前置节点指向当前节点的前置节点，相当于删除了当前节点
    if (succ != null)
        succ.prev = pred;

    // 如果第一个节点为空，说明没有后继节点了，直接返回
    if (first == null)
        return;

    // 如果根节点的父节点不为空，则重新查找父节点
    if (root.parent != null)
        root = root.root();

    // 如果根节点为空，则需要反树化(将树转化为链表)
    // 如果需要移动节点且树的高度比较小，则需要反树化
    if (root == null
            || (movable
            && (root.right == null
            || (rl = root.left) == null
            || rl.left == null))) {
        tab[index] = first.untreeify(map);  // too small
        return;
    }

    // 分割线，以上都是删除链表中的节点，下面才是直接删除红黑树的节点(因为TreeNode本身即是链表节点又是树节点)

    // 删除红黑树节点的大致过程是寻找右子树中最小的节点放到删除节点的位置，然后做平衡，此处不过多注释
    TreeNode<K, V> p = this, pl = left, pr = right, replacement;
    if (pl != null && pr != null) {
        TreeNode<K, V> s = pr, sl;
        while ((sl = s.left) != null) // find successor
            s = sl;
        boolean c = s.red;
        s.red = p.red;
        p.red = c; // swap colors
        TreeNode<K, V> sr = s.right;
        TreeNode<K, V> pp = p.parent;
        if (s == pr) { // p was s's direct parent
            p.parent = s;
            s.right = p;
        } else {
            TreeNode<K, V> sp = s.parent;
            if ((p.parent = sp) != null) {
                if (s == sp.left)
                    sp.left = p;
                else
                    sp.right = p;
            }
            if ((s.right = pr) != null)
                pr.parent = s;
        }
        p.left = null;
        if ((p.right = sr) != null)
            sr.parent = p;
        if ((s.left = pl) != null)
            pl.parent = s;
        if ((s.parent = pp) == null)
            root = s;
        else if (p == pp.left)
            pp.left = s;
        else
            pp.right = s;
        if (sr != null)
            replacement = sr;
        else
            replacement = p;
    } else if (pl != null)
        replacement = pl;
    else if (pr != null)
        replacement = pr;
    else
        replacement = p;
    if (replacement != p) {
        TreeNode<K, V> pp = replacement.parent = p.parent;
        if (pp == null)
            root = replacement;
        else if (p == pp.left)
            pp.left = replacement;
        else
            pp.right = replacement;
        p.left = p.right = p.parent = null;
    }

    TreeNode<K, V> r = p.red ? root : balanceDeletion(root, replacement);

    if (replacement == p) {  // detach
        TreeNode<K, V> pp = p.parent;
        p.parent = null;
        if (pp != null) {
            if (p == pp.left)
                pp.left = null;
            else if (p == pp.right)
                pp.right = null;
        }
    }
    if (movable)
        moveRootToFront(tab, r);
}
```

1. `TreeNode`本身既是链表节点也是红黑树节点；
2. 先删除链表节点；
3. 再删除红黑树节点并做平衡；

## 总结

1. `HashMap`为非线程安全的容器，是一种散列表，采用(数组 + 链表 / 红黑树)的存储结构；
2. `HashMap`的默认初始容量为`16`(1<<4)，默认装载因子为`0.75f`，扩容阈值当前容量的2倍，容量总是`2`的`n`次方；
3. 当桶的数量小于`64`时不会进行树化，只会扩容，当桶的数量大于`64`且单个桶中元素的数量大于`8`时，进行树化；
4. 当单个桶中元素数量小于`6`时，红黑树退化为链表；
5. `HashMap`查找添加元素的时间复杂度都为O(1)。

## 拓展

### 为什么hashmap的容量必须是2的n次方

回顾一下计算下标的方法。即计算`key`在数组中的索引位。

```java
hash&(n - 1)
```

其中`n`就是`hashmap`的容量也就是数组的长度。

![An image](/img/java/container/23.png)

假设`n`是奇数。则`n`-1就是偶数。偶数二进制中最后一位一定是0。所以如上图所示，**hash&(n - 1)** 最终结果二进制中最后一位一定是0，也就意味着结果一定是偶数。这会导致数组中只有偶数位被用了，而奇数位就白白浪费了。无形中浪费了内存，同样也增加了`hash`碰撞的概率。
其中n是2的n次方保证了(两个n不一样哦，别较真)`hash`更加散列，节省了内存。

难道不能是偶数吗？为啥偏偏是`2`的`n`次方？

`2`的`n`次方能保证`(n - 1)`低位都是`1`，能使`hash`低位的特征得以更好的保留，也就是说当`hash`低位相同时两个元素才能产生`hash`碰撞。换句话说就是使`hash`更散列。

两层含义：

1. 从奇偶数来解释。
2. 从`hash`低位的1能使得`hash`本身的特性更容易得到保护方面来说。(很类似源码中`hash`方法中 <<< 16的做法)

### 解决hash冲突的方法

`hashmap`中解决`hash`冲突采用的是链地址法，其实就是有冲突了，在数组中将冲突的元素放到链表中。

一般有以下四种解决方案：

1. 链地址法
2. 开放地址法
3. 再哈希法
4. 建立公共溢出区

### HashMap、HashTable、ConcurrentHashMap区别

`HashMap`是不具备线程安全性的，键和值都可以为`null`。
`Hashtable`是通过`Synchronized`关键字修饰每一个方法达到线程安全的。键和值都不能为`null`，性能很低，不建议使用。
`ConcurrentHashMap`采用分段锁，减少锁的粒度。

### 如何保证HashMap的同步

```java
Map map = Collections.synchronizedMap(new HashMap());
```

其实就是给`HashMap`的每一个方法加`Synchronized`关键字，性能远不如`ConcurrentHashMap`，不建议使用。

### 为什么引入红黑树

因为红黑树的时间复杂度表现更好为O(logN)，而链表为O(N)。

因为大多数情况下`hash`碰撞导致的单个桶中的元素不会太多，太多也扩容了。只是极端情况下，当链表太长会大大降低`HashMap`的性能。所以为了应付这种极端情况才引入的红黑树。

当桶中元素很少比如小于`8`，维护一个红黑树是比较耗时的，因为红黑树需要左旋右旋等，也很耗时。在元素很少的情况下的表现不如链表。

一般的`HashMap`的时间复杂度用平均时间复杂度来分析。除了极端情况链表对`HashMap`整体时间复杂度的表现影响比较小。

### 为什么树转链表和链表转树阈值不同

其实上文中已经介绍了，因为复杂度震荡。详情请参考上文。

### 为什么默认的负载因子loadFactor = 0.75

```java
* Because TreeNodes are about twice the size of regular nodes, we
 * use them only when bins contain enough nodes to warrant use
 * (see TREEIFY_THRESHOLD). And when they become too small (due to
 * removal or resizing) they are converted back to plain bins.  In
 * usages with well-distributed user hashCodes, tree bins are
 * rarely used.  Ideally, under random hashCodes, the frequency of
 * nodes in bins follows a Poisson distribution
 * (http://en.wikipedia.org/wiki/Poisson_distribution) with a
 * parameter of about 0.5 on average for the default resizing
 * threshold of 0.75, although with a large variance because of
 * resizing granularity. Ignoring variance, the expected
 * occurrences of list size k are (exp(-0.5) * pow(0.5, k) /
 * factorial(k)). The first values are:
 *
 * 0:    0.60653066
 * 1:    0.30326533
 * 2:    0.07581633
 * 3:    0.01263606
 * 4:    0.00157952
 * 5:    0.00015795
 * 6:    0.00001316
 * 7:    0.00000094
 * 8:    0.00000006
 * more: less than 1 in ten million
```

上文大意是说:

> 因为`TreeNodes`是普通节点占用空间的`2`倍，仅当有足够的节点时才会适当地将普通节点转为`TreeNodes`。当桶的元素变得很少时又转回普通的`Node`。当`hashCode`离散型很好的时候，树型`bin`很少概率被用到。因为数据均匀分布在每个桶中，几乎不会有`bin`中链表长度达到阈值。但是在随机的`hashCode`的情况下，离散型可能会变差，然而`jdk`又不能阻止用户实现这种不好的`hash`算法，因此就可能导致不均匀的数据分布。理想的情况下，随机`hashCode`算法下所有`bin`中的节点分布频率会遵循泊松分布，从数据中可以看到，当一个`bin`中的链表长度达到`8`个元素时概率为`0.00000006`，几乎是不可能事件。所以选`8`是根据概率统计决定的。
>
> `hashmap`默认的`loadFactor`是0.75，官网解释是说泊松分布算出来的，其实不然，这里泊松分布算出来的树出现的概率，当树化的阈值是8，加载系数是0.75的时候出现树化的概率为0.00000006，`jdk`开发设计`hashmap`的时候，为了平衡树和链表的性能(树比链表遍历快，但是树的结点是链表结点大小的两倍，所以当树出现的概率比较小的时候的性价比就高了，所以取加载系数的时候平衡了下性能取0.75)。平衡性能其实就是"空间利用率"和"时间复杂度"之间的折衷。
>
> - 原注释的内容和目的都是为了解释在java8 HashMap中引入Tree Bin(也就是放入数据的每个数组bin从链表node转换为red-black tree node)的原因
> - 原注释：Because TreeNodes are about twice the size of regular nodes, we use them only when bins contain enough nodes to warrant use(see TREEIFY_THRESHOLD).
> - TreeNode虽然改善了链表增删改查的性能，但是其节点大小是链表节点的两倍
> - 虽然引入TreeNode但是不会轻易转变为TreeNode(如果存在大量转换那么资源代价比较大)，根据泊松分布来看转变是小概率事件，性价比是值得的
> - 泊松分布是二项分布的极限形式，两个重点：事件独立、有且只有两个相互对立的结果
> - 泊松分布是指一段时间或空间中发生成功事件的数量的概率
> - 对HashMap table[]中任意一个bin来说，存入一个数据，要么放入要么不放入，这个动作满足二项分布的两个重点概念
> - 对于HashMap.table[].length的空间来说，放入0.75*length个数据，某一个bin中放入节点数量的概率情况如上图注释中给出的数据(表示数组某一个下标存放数据数量为0~8时的概率情况)
>   - 举个例子说明，HashMap默认的table[].length=16，在长度为16的HashMap中放入12(0.75*length)个数据，某一个bin中存放了8个节点的概率是0.00000006
>   - 扩容一次，16*2=32，在长度为32的HashMap中放入24个数据，某一个bin中存放了8个节点的概率是0.00000006
>   - 再扩容一次，32*2=64，在长度为64的HashMap中放入48个数据，某一个bin中存放了8个节点的概率是0.00000006

所以，当某一个`bin`的节点大于等于`8`个的时候，就可以从链表`node`转换为`treenode`，其性价比是值得的。具体可以参考[`HashMap`的`loadFactor`为什么是0.75](https://www.jianshu.com/p/64f6de3ffcc1)

### HashMap中为什么用位运算而不是取模运算

主要是位运算在底层计算速度更快。简单证明一下

```java
long s1 = System.nanoTime();
System.out.println(2147483640 % 16);//8
long e1 = System.nanoTime();
long s2 = System.nanoTime();
System.out.println(2147483640 & 15);//8
long e2 = System.nanoTime();
System.out.println("取模时间：" + (e1 - s1));//取模时间：134200
System.out.println("与运算时间：" + (e2 - s2));//与运算时间：15800
```

题外话：还有一个刷`leetcode`题，二分法计算中心点。总结的经验，用除法会导致部分算法题超时。

```java
long s1 = System.nanoTime();
System.out.println(1 + (2147483640 - 1) / 2);//1073741820
long e1 = System.nanoTime();
long s2 = System.nanoTime();
System.out.println(1 + (2147483640 - 1) >> 1);//1073741820
long e2 = System.nanoTime();
System.out.println("除法时间：" + (e1 - s1));//除法时间：20100
System.out.println("位运算时间：" + (e2 - s2));//位运算时间：15700
```

注意：一般二分法用`left + (right - left)/2;`因为如果用`(right+left)/2;right + left`容易`>Integer.MAX_VALUE`;

### hashmap并发下的问题

在`JDK1.8`中并发下使用线程非安全的`HashMap`，会产生死循环的问题，`put`时数据丢失问题，容量`size`的不准确，重`Hash`问题。

1、死循环问题描述

在`1.8`中，引入了红黑树优化数组链表，同时改成了尾插，按理来说是不会有环了，但是还是会出现死循环的问题，在链表转换成红黑数的时候无法跳出等多个地方都会出现这个问题。

2、put数据丢失描述

线程已经拿到了头结点和`hash`桶，若此时`cpu`挂起，重新进入执行前，这个`hash`桶已经被其他线程更改过，那么在该线程重入后，他将持有一个过期的桶和头结点，并且覆盖之前其他线程的记录，造成了数据丢失。

3、size不准确描述

`size`只是用了`transient`(不参与序列化)关键字修饰，在各个线程中的`size`不会及时同步，在多个线程操作的时候，`size`将会被覆盖。
