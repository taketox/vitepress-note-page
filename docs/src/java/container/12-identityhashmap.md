# IdentityHashMap

## 概述

`IdentityHashMap`利用哈希表实现`Map`接口，比较键（和值）时使用引用相等性代替对象相等性。换句话说，在`IdentityHashMap`中，当且仅当(`k1==k2`)时，才认为两个键`k1`和`k2`相等（在正常`Map`实现（如`HashMap`）中，当且仅当满足下列条件时才认为两个键`k1`和`k2`相等：`(k1==null ? k2==null : e1.equals(e2))`）。

此类不是通用`Map`实现！此类实现`Map`接口时，它有意违反`Map`的常规协定，该协定在比较对象时强制使用`equals`方法。此类设计仅用于其中需要引用相等性语义的罕见情况。

## 源码分析

### 属性

```java
/**
 * 无参数构造函数使用的初始容量。一定是2的幂。
 * 值32对应于（指定的）预期最大大小21，给定的负载系数为2/3。
 */
private static final int DEFAULT_CAPACITY = 32;

/**
 * 最小容量，如果隐式指定一个较低的值，则使用
 * 由两个带有参数的构造函数组成。给定2/3的负载系数，值4对应于预期的最大大小2。必须是2的幂。
 */
private static final int MINIMUM_CAPACITY = 4;

/**
 * 最大容量，如果隐式指定了更高的值，则使用的最大容量
 * 由任何一个带参数的构造函数。必须是2的幂且 <= 1<<29。
 *
 * 事实上，该Map最多只能有MAXIMUM_CAPACITY-1个元素，因为它必须有一个key等于null的位置，
 * 这是为了避免get,put,remove方法的无限循环
 */
private static final int MAXIMUM_CAPACITY = 1 << 29;

/**
 * 对象数组table，根据需要调整大小。 长度必须始终为2的幂。
 * 注意：是Object对象数组；其他的 Map 都是Entry<K,V>或者Node<K,V>的类结构
 */
transient Object[] table; // non-private to simplify nested class access

/**
 * map中键值对的数量
 */
int size;

/**
 * 修改的数量，以支持fast-fail的迭代器
 */
transient int modCount;

/**
 * 存储键为null的key，如果键为null，实际用NULL_KEY存储
 */
static final Object NULL_KEY = new Object();
```

有趣的是之前分析的其它`map`中的`table`，要么是`Entry<K,V>[]`数组，要么是`Node<K,V>[]`数组，但在`IdentityHashMap`中使用的是`Object[]`对象数组。这就决定它内部`put`、`get`方法存、取键值对时，会比较特殊一些（`table`数组索引为偶数存储的是键`key`，索引为奇数存储的是值`value`）。

注意：`IdentityHashMap`的加载因子为`2/3`。

### 构造方法

```java
// 默认构造函数，容量为32，加载因子为2/3，最多可存储32*2/3=21个键值对
public IdentityHashMap() {
    init(DEFAULT_CAPACITY);
}

// 根据指定容量构造
public IdentityHashMap(int expectedMaxSize) {
    if (expectedMaxSize < 0)
        throw new IllegalArgumentException("expectedMaxSize is negative: "
                                           + expectedMaxSize);
    init(capacity(expectedMaxSize));
}

// 返回一个介于MINIMUM_CAPACITY和MAXIMUM_CAPACITY，且大于3*expectedMaxSize/2的值
// 如果该值不存在，返回MAXIMUM_CAPACITY
private static int capacity(int expectedMaxSize) {
    // assert expectedMaxSize >= 0;
    return
        (expectedMaxSize > MAXIMUM_CAPACITY / 3) ? MAXIMUM_CAPACITY :
        (expectedMaxSize <= 2 * MINIMUM_CAPACITY / 3) ? MINIMUM_CAPACITY :
        Integer.highestOneBit(expectedMaxSize + (expectedMaxSize << 1));
}

// 初始化内部存储数组table，table数组大小为参数initCapacity的两倍
// 为何是两倍？因为这是包括了键和值，刚好两倍
private void init(int initCapacity) {
    table = new Object[2 * initCapacity];
}

// 通过指定map初始化
public IdentityHashMap(Map<? extends K, ? extends V> m) {
    this((int) ((1 + m.size()) * 1.1));
    putAll(m);
}
```

### put()方法

该方法将指定的`key-value`对添加到`table`数组中，如果对应`key`已经存在，则更新对应的`value`。该方法返回该`key`之前对应的`value`。

```java
/**
 * 在此标识哈希映射中关联指定值与指定键。如果映射以前包含了一个此键的映射关系，那么将替换旧值。
 *
 * @param key 要将指定值关联到的键
 * @param value 要关联到指定键的值
 * @return 返回与key相关联的先前值，如果key没有映射关系，则返回null（返回null可能还表示映射以前将null与指定键关联）
 */
public V put(K key, V value) {
    // key = null的处理
    final Object k = maskNull(key);
    // retryAfterResize是java label标签，用于循环代码块之前
    retryAfterResize: for (;;) {
        final Object[] tab = table;
        final int len = tab.length;
        // 计算键在数组中的位置,结果一定是偶数
        int i = hash(k, len);

        for (Object item; (item = tab[i]) != null;
            // 线性探测法 解决hash冲突;每次递增2
            // 找到下一个key的位置，即(i + 2 < len ? i + 2 : 0)
            i = nextKeyIndex(i, len)) {
            // 使用 == 比较键对象，如果为true，新值替换旧值
            if (item == k) {
                @SuppressWarnings("unchecked")
                V oldValue = (V) tab[i + 1];
                tab[i + 1] = value;
                return oldValue;
            }
        }
        // 键值对数量加1
        final int s = size + 1;
        // Use optimized form of 3 * s.使用3 * s的优化形式。
        // Next capacity is len, 2 * current capacity.
        // 如果map中键值对的数目size * 3 大于 table数组的长度len，则触发扩容操作
        if (s + (s << 1) > len && resize(len))
            continue retryAfterResize;
        // 修改次数+1
        modCount++;
        tab[i] = k;
        tab[i + 1] = value;
        size = s;
        return null;
    }
}
```

该方法查找`key`对应的键值对，如果已经存在，替换并返回老的`value`。添加键值对之前先判断是否需要重新分配数组的大小。如果需要，则重新分配。

`IdentityHashMap`的`putAll`方法其实是循环调用了`put`方法，不再说明。

#### hash()方法

```java
// 返回对象x的在table数组中的索引位置，结果一定是偶数。
private static int hash(Object x, int length) {
    int h = System.identityHashCode(x);
    // Multiply by -127, and left-shift to use least bit as part of hash
    return ((h << 1) - (h << 8)) & (length - 1);
}
```

调用`System`类的`identityHashCode()`方法

```java
// 无论给定对象的类是否覆盖hashCode()，都为给定对象返回与默认方法hashCode()返回的哈希码相同的哈希码。
public static native int identityHashCode(Object x);
```

#### nextKeyIndex()方法

```java
// 返回当前键索引的下一个索引，如果越过数组大小，返回数组位置0
private static int nextKeyIndex(int i, int len) {
    return (i + 2 < len ? i + 2 : 0);
}
```

#### resize()方法

```java
private boolean resize(int newCapacity) {
    // 新数组的大小为参数的两倍
    int newLength = newCapacity * 2;
    Object[] oldTable = table;
    int oldLength = oldTable.length;
    if (oldLength == 2 * MAXIMUM_CAPACITY) { 
        if (size == MAXIMUM_CAPACITY - 1)
            throw new IllegalStateException("Capacity exhausted.");
        return false;
    }
    if (oldLength >= newLength)
        return false;
    Object[] newTable = new Object[newLength];
    // 将老数组的元素复制到新的数组
    for (int j = 0; j < oldLength; j += 2) {
        Object key = oldTable[j];
        if (key != null) {
            Object value = oldTable[j+1];
            // let gc
            oldTable[j] = null;
            oldTable[j+1] = null;
            // 找到key在新数组的索引
            int i = hash(key, newLength);
            // 找到不为空的索引位置
            while (newTable[i] != null)
                i = nextKeyIndex(i, newLength);
            // 存储到新数组的位置
            newTable[i] = key;
            newTable[i + 1] = value;
        }
    }
    table = newTable;
    return true;
}
```

`resize`方法首先确定新数组的大小，然后将老数组的元素复制到新的数组。

### get()方法

该方法返回键对应的值。

```java
public V get(Object key) {
    // 如果key为null，取null键对应的key
    Object k = maskNull(key);
    Object[] tab = table;
    int len = tab.length;
    // 获取key在table数组中的索引
    int i = hash(k, len);
    while (true) {
        Object item = tab[i];
        // 相等，返回数组下一个位置存储的值
        if (item == k)
            return (V) tab[i + 1];
        // 下一个key的索引位置为null，意味着当前map中所有键对象均已被遍历，没有找到对应key
        if (item == null)
            return null;
        // 遍历下一个key的索引位置
        i = nextKeyIndex(i, len);
    }
}
```

通过该方法可以发现`IdentityHashMap`的存储原理，将键值对存储到内部的`Object[]`数组中，相邻两个位置处分别是`key`和`value`。查找过程中，如果发现当前位置存储的不是要查找的键，则轮询下一个(`i + 2`)位置，这也是`IdentityHashMap`解决冲突的方法。

`IdentityHashMap`的`containsKey`、`containsMapping`方法实现和`get`实现基本相同，不再说明。

### containsValue()方法

该方法判断是否存在指定的值。

```java
public boolean containsValue(Object value) {
    Object[] tab = table;
    for (int i = 1; i < tab.length; i += 2)
        if (tab[i] == value && tab[i - 1] != null)
            return true;
    return false;
}
```

该方法实现很简单，`table`中第一个存储`value`的位置是`1`，因此从`1`开始查找，步长为`2`。引用相等并且该`value`对应的的`key`不为`null`的情况下，返回`true`。

### remove()方法

因为采用线性探测解决`hash`碰撞，数据都是连续存储的，所以当从中删除一个键时，需要更新维护线性探测关系。

```java
public V remove(Object key) {
    Object k = maskNull(key);
    Object[] tab = table;
    int len = tab.length;
    int i = hash(k, len);

    while (true) {
        Object item = tab[i];
        if (item == k) {
            modCount++;
            size--;
            @SuppressWarnings("unchecked")
            V oldValue = (V) tab[i + 1];
            tab[i + 1] = null;
            tab[i] = null;
            // 该位置的键值对移除了，空出了位置，看后面是否有键值对要填补这个位置(有些键值对是因为线性探测导致其位置偏离了其hash值)
            // 维持put、get等方法依赖的线性探测关系
            closeDeletion(i);
            return oldValue;
        }
        if (item == null)
            return null;
        i = nextKeyIndex(i, len);
    }
}
```

这里主要看下`closeDeletion`方法的用处。`closeDeletion`方法在删除某个键值对后调用，比如位置`i`处的元素删除了，调用`closeDeletion`方法更新该位置之后的元素，减少地址冲突。复杂点就是要考虑`table`是循环数组，线性探测的下一个键位置可能会在当前空出来的键位置的前面：

#### closeDeletion()方法

```java
private void closeDeletion(int d) {
    // Adapted from Knuth Section 6.4 Algorithm R
    Object[] tab = table;
    int len = tab.length;
 
    Object item;
    // d 是当前空出来的键值对位置
    // i 是当前处理的键值对位置
    // 循环遍历，当key为null时退出循环
    for (int i = nextKeyIndex(d, len); (item = tab[i]) != null;
         i = nextKeyIndex(i, len) ) {

        /**
         * 以下测试会触发插槽i中的项目（散列在插槽r中）是否应占据d腾出的位置。 
         * 如果是这样，我们将其交换，然后在新腾出的i处继续d。当我们在此运行结束时点击空插槽时，此过程将终止。 
         * 因为table是循环数组，需要注意i<r的情况。
         */
        int r = hash(item, len);
        if ((i < r && (r <= d || d <= i)) || (r <= d && d <= i)) {
            tab[d] = item;
            tab[d + 1] = tab[i + 1];
            tab[i] = null;
            tab[i + 1] = null;
            d = i;
        }
    }
}
```

`IdentityHashMap`的`removeMapping`方法和该方法的实现类似，不再说明。

### clear()方法

`clear`方法很简单，遍历`table`数组并将数组元素值设置为`null`。

```java
public void clear() {
    modCount++;
    Object[] tab = table;
    for (int i = 0; i < tab.length; i++)
        tab[i] = null;
    size = 0;
}
```

### 迭代器-IdentityHashMapIterator

`IdentityHashMap`的迭代器是由抽象内部类`IdentityHashMapIterator`实现的

```java
private abstract class IdentityHashMapIterator<T> implements Iterator<T> {
    // 当前位置
    int index = (size != 0 ? 0 : table.length); 
    // 迭代器的快速失败机制
    int expectedModCount = modCount; 
    // 最后一个返回的位置，删除的时候也是删除该位置的值
    int lastReturnedIndex = -1; 
    // 这个参数是为了避免无效计算
    boolean indexValid; 
    Object[] traversalTable = table; 

    // 哈希表是否还有下一个元素
    public boolean hasNext() {
        Object[] tab = traversalTable;
        for (int i = index; i < tab.length; i+=2) {
            Object key = tab[i];
            if (key != null) {
                // 更新当前位置并返回true
                index = i;
                return indexValid = true;
            }
        }
        // 到这，说明已经没有更多元素了
        index = tab.length;
        return false;
    }
    // 返回下一个索引
    protected int nextIndex() {
        // 迭代器的快速失败机制，说明有其他线程并发修改了该哈希表
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
        if (!indexValid && !hasNext())
            throw new NoSuchElementException();
        // 调用nextIndex方法后，设置indexValid为不可用，也就是说，不能连续调用nextIndex方法
        indexValid = false;
        lastReturnedIndex = index;
        index += 2;
        return lastReturnedIndex;
    }
    // 删除当前位置的键值对后，重新调整后面的元素，减少冲突
    public void remove() {
        if (lastReturnedIndex == -1)
            throw new IllegalStateException();
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();

        expectedModCount = ++modCount;
        int deletedSlot = lastReturnedIndex;
        lastReturnedIndex = -1;
        index = deletedSlot;
        indexValid = false;
        Object[] tab = traversalTable;
        int len = tab.length;
        int d = deletedSlot;
        Object key = tab[d];
        tab[d] = null;      
        tab[d + 1] = null;
        if (tab != IdentityHashMap.this.table) {
            IdentityHashMap.this.remove(key);
            expectedModCount = modCount;
            return;
        }

        size--;

        Object item;
        for (int i = nextKeyIndex(d, len); (item = tab[i]) != null;
             i = nextKeyIndex(i, len)) {
            int r = hash(item, len);
            if ((i < r && (r <= d || d <= i)) ||
              (r <= d && d <= i)) {

                if (i < deletedSlot && d >= deletedSlot &&
                    traversalTable == IdentityHashMap.this.table) {
                    int remaining = len - deletedSlot;
                    Object[] newTable = new Object[remaining];
                    System.arraycopy(tab, deletedSlot,
                             newTable, 0, remaining);
                    traversalTable = newTable;
                    index = 0;
                }

                tab[d] = item;
                tab[d + 1] = tab[i + 1];
                tab[i] = null;
                tab[i + 1] = null;
                d = i;
            }
        }
    }
}
```

## 总结

1. 对于要保存的`key`，`k1`和`k2`，当且仅当`k1 == k2`的时候，`IdentityHashMap`才会相等，而对于`HashMap`来说，相等的条件则是：对比两个`key`的`hashCode`和`equals`。

2. `IdentityHashMap`不是`Map`的通用实现，它有意违反了`Map`的常规协定。并且`IdentityHashMap`允许`key`和`value`都为`null`。

3. 同`HashMap`，`IdentityHashMap`也是无序的，并且该类不是线程安全的，如果要使之线程安全，可以调用`Collections.synchronizedMap(new IdentityHashMap(…))`方法来实现。
