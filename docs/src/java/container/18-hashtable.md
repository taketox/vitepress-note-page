# Hashtable

## 概述

`Hashtable`是一个比较古老的`Map`实现类，从它的名称就可以看得出来，因为没有遵循`Java`的语言规范。它和`HashMap`很像，同属于散列表，有以下特性：

- 线程安全，这也估计算是唯一一个优于`HashMap`的特性了吧；
- `Hashtable`不允许`key`或者`value`为`null`；
- 自从`JDK1.2`开始，`Hashtable`实现了`Map`接口，成为了`Map`容器中的一员。看样子最开始是不属于`Map`容器的。
- 不建议使用，以后说不定哪天就废掉了。连官方文档也说了，如果在非线程安全的情况下使用，建议使用`HashMap`替换，如果在线程安全的情况下使用，建议使用`ConcurrentHashMap`替换。

> 配置文件类Properties就是Hashtable的子类。

## 案例

```java
public class HashtableTest {
    public static void main(String[] args) {
        // 初始化随机种子
        Random r = new Random();
        // 新建Hashtable
        Hashtable<String, Integer> table = new Hashtable<>();
        // 添加操作
        table.put("one", r.nextInt(10));
        table.put("two", r.nextInt(10));
        table.put("three", r.nextInt(10));

        // 打印出table
        System.out.println("table:" + table);

        // 通过Iterator遍历key-value
        Iterator iter = table.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry entry = (Map.Entry) iter.next();
            System.out.println("next: " + entry.getKey() + " - " + entry.getValue());
        }

        // Hashtable的键值对个数
        System.out.println("size:" + table.size());

        // containsKey(Object key): 是否包含键key
        System.out.println("contains key two : " + table.containsKey("two"));
        System.out.println("contains key five : " + table.containsKey("five"));

        // containsValue(Object value): 是否包含值value
        System.out.println("contains value 0 : " + table.containsValue(new Integer(0)));

        // remove(Object key): 删除键key对应的键值对
        table.remove("three");

        System.out.println("table:" + table);

        // clear(): 清空Hashtable
        table.clear();

        // isEmpty(): Hashtable是否为空
        System.out.println(table.isEmpty() ? "table is empty" : "table is not empty");
    }
}
```

输出：

```text
table:{two=5, one=0, three=6}
next : two - 5
next : one - 0
next : three - 6
size:3
contains key two : true
contains key five : false
contains value 0 : true
table:{two=5, one=0}
table is empty
```

## 源码分析

### 继承体系

**Hashtable和Map之间关系图：**

![An image](/img/java/container/41.png)

Hashtable的定义如下：

```java
public class Hashtable<K,V>
    extends Dictionary<K,V>
    implements Map<K,V>, Cloneable, java.io.Serializable {

    //...
}
```

从中可以看出Hashtable继承Dictionary类，实现Map接口。其中Dictionary类是任何可将键映射到相应值的类(如Hashtable)的抽象父类。每个键和每个值都是一个对象。在任何一个Dictionary对象中，每个键至多与一个值相关联。Map是"key-value键值对"接口。

> Dictionary类，顾名思义，就是字典类，算是早期的Map，不过该类基本上已经废弃了。为什么废弃呢，大致看下Dictionary的源码就知道了。除了常规的get，put请求外，还提供了一些遍历的方法，返回的是Enumeration类型。而Enumeration接口其实算是被Iterator替换了，因为Iterator提供的功能更多，更方便。

### 成员变量

```java
// 定义存放键值对的Entry[]数组，每一个Entry代表了一个键值对
private transient Entry<?, ?>[] table;
 
// Hashtable的大小，注意这个大小并不是Hashtable的容器大小，而是他所包含Entry键值对的数量
private transient int count;
 
// 阈值，用于判断是否需要调整Hashtable的容量。threshold = 容量 * 加载因子
private int threshold;
 
// 加载因子
private float loadFactor;

// 被修改或者删除的次数总数
private transient int modCount = 0;
 
// 为了序列化时保持版本的兼容性。
private static final long serialVersionUID = 1421746759512286392L;
```

Hashtable采用"拉链法"实现哈希表，它定义了几个重要的参数：

- table：为一个Entry[]数组类型，Entry代表了“拉链”的节点，每一个Entry代表了一个键值对，哈希表的"key-value键值对"都是存储在Entry数组中的。
- count：Hashtable的大小，注意这个大小并不是Hashtable的容器大小，而是他所包含Entry键值对的数量。
- threshold：Hashtable的阈值，用于判断是否需要调整Hashtable的容量。threshold的值="容量 * 加载因子"。
- loadFactor：加载因子。
- modCount：用来实现“fail-fast”机制的(也就是快速失败)。所谓快速失败就是在并发集合中，其进行迭代操作时，若有其他线程对其进行结构性的修改，这时迭代器会立马感知到，并且立即抛出ConcurrentModificationException异常，而不是等到迭代完成之后才告诉你。

### 构造方法

```java
// 默认构造函数
public Hashtable() {
    this(11, 0.75f);
}

// 指定“容量大小”的构造函数
public Hashtable(int initialCapacity) {
    this(initialCapacity, 0.75f);
}

// 指定“容量大小”和“加载因子”的构造函数
public Hashtable(int initialCapacity, float loadFactor) {
    // 验证初始容量
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
    // 验证加载因子        
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal Load: " + loadFactor);

    if (initialCapacity==0)
        initialCapacity = 1;
    this.loadFactor = loadFactor;
    // 初始化table，获得大小为initialCapacity的table数组
    table = new Entry<?, ?>[initialCapacity];
    // 计算阀值
    threshold = (int)Math.min(initialCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
}

// 包含“子Map”的构造函数
public Hashtable(Map<? extends K, ? extends V> t) {
    this(Math.max(2 * t.size(), 11), 0.75f);
    putAll(t);
}
```

`Hashtable`和`HashMap`的初始容量有所不同，`HashMap`是`16`，而`Hashtable`使用的是`11`，扩容逻辑是乘`2 + 1`，保证是素数。

### 添加元素

添加元素时，Hashtable与HashMap有3点区别：

1. Hashtable的key-value都不允许为null。
2. Hashtable是在链表头部插入(和之前链表反过来)，HashMap是在尾部插入。
3. Hashtable是先判断是否需要扩容，再插入元素；jdk8HashMap是先插入元素再判断是否需要扩容。

```java
public synchronized V put(K key, V value) {
    // Make sure the value is not null
    if (value == null) {
        // value为空，会抛出空指针异常
        throw new NullPointerException();
    }

    // Makes sure the key is not already in the hashtable.
    Entry<?,?> tab[] = table;
    int hash = key.hashCode();
    int index = (hash & 0x7FFFFFFF) % tab.length;
    @SuppressWarnings("unchecked")
    Entry<K,V> entry = (Entry<K,V>)tab[index];
    for(; entry != null; entry = entry.next) {
        if ((entry.hash == hash) && entry.key.equals(key)) {
            // 该key已经存在，直接替换原值
            V old = entry.value;
            entry.value = value;
            return old;
        }
    }
    // 添加元素
    addEntry(hash, key, value, index);
    return null;
}

private void addEntry(int hash, K key, V value, int index) {
    modCount++;

    Entry<?,?> tab[] = table;
    if (count >= threshold) {   // 判断是否元素数量是否达到阈值，如果达到先进行扩容处理
        // Rehash the table if the threshold is exceeded
        // 扩容
        rehash();

        tab = table;
        hash = key.hashCode();
        index = (hash & 0x7FFFFFFF) % tab.length;
    }

    // Creates the new entry.
    @SuppressWarnings("unchecked")
    Entry<K,V> e = (Entry<K,V>) tab[index];
    // 插入元素是在链表头部插入
    tab[index] = new Entry<>(hash, key, value, e);
    count++;
}
```

put方法的整个处理流程是：计算key的hash值，根据hash值获得key在table数组中的索引位置，然后迭代该key处的Entry链表，若该链表中存在一个这个的key对象，那么就直接替换其value值即可，否则在将改key-value节点插入该index索引位置处。如下：假设我们现在Hashtable的容量为5，已经存在了(5,5)，(13,13)，(16,16)，(17,17)，(21,21)这 5 个键值对，目前他们在Hashtable中的位置如下：

![An image](/img/java/container/42.png)

现在，我们插入一个新的键值对，put(16,22)，假设key=16的索引为1，但现在索引1的位置有两个Entry了，所以程序会对链表进行迭代。迭代的过程中，发现其中有一个Entry的key和我们要插入的键值对的key相同，所以现在会做的工作就是将newValue=22替换oldValue=16，然后返回oldValue=16.

![An image](/img/java/container/43.png)

然后我们现在再插入一个，put(33,33)，key=33的索引为3，并且在链表中也不存在key=33的Entry，所以将该节点插入链表的第一个位置。

![An image](/img/java/container/44.png)

#### 扩容

Hashtable的扩容操作，在put方法中，如果需要向table[]中添加Entry元素，会首先进行容量校验，如果容量已经达到了阀值，Hashtable就会进行扩容处理rehash()，如下:

```java
protected void rehash() {
    int oldCapacity = table.length;
    // 元素
    Entry<K,V>[] oldMap = table;

    // 新容量=旧容量 * 2 + 1
    int newCapacity = (oldCapacity << 1) + 1;
    if (newCapacity - MAX_ARRAY_SIZE > 0) {
        if (oldCapacity == MAX_ARRAY_SIZE)
            return;
        newCapacity = MAX_ARRAY_SIZE;
    }

    // 新建一个size = newCapacity 的Hashtable
    Entry<K,V>[] newMap = new Entry[];

    modCount++;
    // 重新计算阀值
    threshold = (int)Math.min(newCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
    // 重新计算hashSeed
    boolean rehash = initHashSeedAsNeeded(newCapacity);

    table = newMap;
    // 将原来的元素拷贝到新的Hashtable中
    for (int i = oldCapacity; i-- > 0;) {
        for (Entry<K,V> old = oldMap[i]; old != null; ) {
            Entry<K,V> e = old;
            old = old.next;

            if (rehash) {
                e.hash = hash(e.key);
            }
            int index = (e.hash & 0x7FFFFFFF) % newCapacity;
            e.next = newMap[index];
            newMap[index] = e;
        }
    }
}
```

在这个rehash()方法中我们可以看到容量扩大两倍+1，同时需要将原来Hashtable中的元素一一复制到新的Hashtable中，这个过程是比较消耗时间的，同时还需要重新计算hashSeed的，毕竟容量已经变了。这里对阀值啰嗦一下：比如初始值 `11`、加载因子默认 `0.75`，那么这个时候阀值 `threshold=8`，当容器中的元素达到 `8` 时，Hashtable进行一次扩容操作，容量 = `8 * 2 + 1 =17`，而阀值 `threshold=17*0.75 = 13`，当容器元素再一次达到阀值时，Hashtable还会进行扩容操作，以此类推。

**在计算索引位置index时，Hashtable进行了一个与运算过程(hash & 0x7FFFFFFF)，为什么需要做一步操作，这么做有什么好处？**

这是因为在计算hash值得时候可能是负数因此采用了和0X7FFFFFFF相与的操作保证为正数，这个涉及到计算机的二进制数存放正数负数是如何存放的一个逻辑基础知识，正数很容易，负数的存放是采用负数的绝对值取反得到反码然后+1 得到补码然后进行的存放，因此和0X7FFFFFFF相与可保证只改变符号位而不改变其它位。

### 获取元素

相比较于put方法，get方法则简单很多。

```java
public synchronized V get(Object key) {
    Entry tab[] = table;
    int hash = hash(key);
    int index = (hash & 0x7FFFFFFF) % tab.length;
    for (Entry<K,V> e = tab[index]; e != null; e = e.next) {
        if ((e.hash == hash) && e.key.equals(key)) {
            return e.value;
        }
    }
    return null;
}
```

其过程就是首先通过hash()方法求得key的哈希值，然后根据hash值得到index索引(上述两步所用的算法与put方法都相同)。然后迭代链表，返回匹配的key的对应的value；找不到则返回null。

### 遍历方式

```java
// 1、使用keys()
Enumeration<String> en1 = table.keys();
    while(en1.hasMoreElements()) {
    en1.nextElement();
}

// 2、使用elements()
Enumeration<String> en2 = table.elements();
    while(en2.hasMoreElements()) {
    en2.nextElement();
}

// 3、使用keySet()
Iterator<String> it1 = table.keySet().iterator();
    while(it1.hasNext()) {
    it1.next();
}

// 4、使用entrySet()
Iterator<Entry<String, String>> it2 = table.entrySet().iterator();
    while(it2.hasNext()) {
    it2.next();
}
```

## 总结

1. Hashtable底层是通过数组加链表实现的，这点和JDK1.8之前的HashMap差不多。
2. Hashtable是不允许key或者value为null的。
3. Hashtable的计算索引方法，默认容量大小，扩容方法都与HashMap不太一样。
4. 线程安全，大部分方法都是使用了synchronized关键字，虽然JDK优化了synchronized，但在方法上使用该关键字，无疑仍旧是效率低下的操作。

## 拓展

### Hashtable与HashMap的区别

HashMap和Hashtable都实现了Map接口，但决定用哪一个之前先要弄清楚它们之间的分别。主要的区别有：线程安全性，同步(synchronization)，以及速度。

1. HashMap几乎可以等价于Hashtable，除了HashMap是非synchronized的，并可以接受null(HashMap可以接受为null的键值(key)和值(value)，而Hashtable则不行)。
2. HashMap是非synchronized，而Hashtable是synchronized，这意味着Hashtable是线程安全的，多个线程可以共享一个Hashtable；而如果没有正确的同步的话，多个线程是不能共享HashMap的。Java 5提供了ConcurrentHashMap，它是Hashtable的替代，比Hashtable的扩展性更好。
3. 另一个区别是HashMap的迭代器(Iterator)是fail-fast迭代器，而Hashtable的enumerator迭代器不是fail-fast的。所以当有其它线程改变了HashMap的结构(增加或者移除元素)，将会抛出ConcurrentModificationException，但迭代器本身的remove()方法移除元素则不会抛出ConcurrentModificationException异常。但这并不是一个一定发生的行为，要看JVM。这条同样也是Enumeration和Iterator的区别。
4. 由于Hashtable是线程安全的也是synchronized，所以在单线程环境下它比HashMap要慢。如果你不需要同步，只需要单一线程，那么使用HashMap性能要好过Hashtable。

HashMap不能保证随着时间的推移Map中的元素次序是不变的。

我们能否让HashMap同步？

HashMap可以通过下面的语句进行同步：Map m = Collections.synchronizeMap(hashMap);

**结论:**

Hashtable和HashMap有几个主要的不同：线程安全以及速度。仅在你需要完全的线程安全的时候使用Hashtable，而如果你使用Java5或以上的话，请使用ConcurrentHashMap。

### Hashtable和ConcurrentHashMap区别

1. 底层数据结构：

    JDK1.7的ConcurrentHashMap底层采用的是分段的数组和链表实现，JDK1.8之后数组 +链表/红黑二叉数。

    Hashtable底层采用的是数据+链表，数组是HashMap的主体，链表则是为了解决哈希冲突而存在的；

2. 实现线程的安全方式：

    在JDK1.7的时候，ConcurrentHashMap(分段锁)，对整个桶数组进行分割分段(Segment)，每一把锁只锁容器其中一部分数据，多线程访问容器里不同数据段的数据，就不会存在锁竞争，提高并发访问率。
    JDK1.8,已经摒弃了Segment概念，而是直接使用Node数组+链表/红黑树的数据结构来实现，并发控制使用synchronized和CAS来操作(JDK1.6对synchronized做了很多优化)。整体看起来就像优化过且线程安全的HashMap,虽然在JDK1.8中还能看到Segment的数据结构，但是已经简化了属性，只是为了兼顾旧版本。
    HashTable(同一把锁)：使用synchronized来保证线程安全，效率非常低下，当多个线程同时访问同步方法时，可能会进入阻塞或轮训状态，如使用put添加元素，另一个线程就不嗯呢该使用put添加元素，也不能get，竞争就会越来越激烈。
