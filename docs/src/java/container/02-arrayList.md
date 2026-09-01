# ArrayList

## 概述

`ArrayList`是一种变长的集合类，基于定长数组实现，所以其可以保证在O(1)复杂度下完成随机查找操作。

`ArrayList`允许空值和重复元素，当往`ArrayList`中添加的元素数量大于其底层数组容量时，其会通过扩容机制重新生成一个更大的数组。`ArrayList`是非线程安全类，并发环境下，多个线程同时操作`ArrayList`，会引发不可预知的错误。

`ArrayList`是最为常用的集合类，作为一个变长集合类，其核心是**扩容机制**。

## 源码分析

### 属性

```java
/**
 * 默认容量
 */
private static final int DEFAULT_CAPACITY = 10;

/**
 * 空数组，如果传入的容量为0时使用
 */
private static final Object[] EMPTY_ELEMENTDATA = {};

/**
 * 空数组，传入容量时使用，添加第一个元素的时候会重新初始为默认容量大小
 */
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

/**
 * 存储元素的数组
 */
transient Object[] elementData;

/**
 * 集合中元素的个数
 */
private int size;
```

1. DEFAULT_CAPACITY
   默认容量为`10`，也就是通过`new ArrayList()`创建时的默认容量。
2. EMPTY_ELEMENTDATA
   空的数组，这种是通过`new ArrayList(0)`创建时用的是这个空数组。
3. DEFAULTCAPACITY_EMPTY_ELEMENTDATA
   也是空数组，这种是通过`new ArrayList()`创建时用的是这个空数组，与`EMPTY_ELEMENTDATA`的区别是在添加第一个元素时使用这个空数组的会初始化为`DEFAULT_CAPACITY(10)`个元素。
4. elementData
   真正存放元素的地方，使用`transient`是为了不序列化这个字段。
5. size
   真正存储元素的个数，而不是`elementData`数组的长度。

### 构造方法

`ArrayList`有两个构造方法，一个是无参，另一个需传入初始容量值。大家平时最常用的是无参构造方法，相关代码如下：

```csharp
//指定容量的空List
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        // 如果传入的初始容量大于0，就新建一个数组存储元素
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        // 如果传入的初始容量等于0，使用空数组EMPTY_ELEMENTDATA
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        // 如果传入的初始容量小于0，抛出异常
        throw new IllegalArgumentException("Illegal Capacity: "+ initialCapacity);
    }
}

//空List
public ArrayList() {
    // 如果没有传入初始容量，则使用空数组DEFAULTCAPACITY_EMPTY_ELEMENTDATA
    // 使用这个数组是在添加第一个元素的时候会扩容到默认大小10
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

//指定集合元素的列表
public ArrayList(Collection<? extends E> c) {
    //将参数中的集合转化为数组赋给elementData
    elementData = c.toArray();
    //参数集合是否是空
    if ((size = elementData.length) != 0) {
        // 如果elementData类型不是Object数组
        if (elementData.getClass() != Object[].class)
            // 不为Object数组的话就进行复制
            elementData = Arrays.copyOf(elementData, size, Object[].class);
    } else {
        // 初始化elementData为空数组
        this.elementData = EMPTY_ELEMENTDATA;
    }
}
```

上面的代码比较简单，前两个构造方法做的事情并不复杂，目的都是初始化底层数组`elementData`。区别在于无参构造方法会将`elementData`初始化一个空数组，插入元素时，扩容将会按默认值重新初始化数组。而有参的构造方法则会将`elementData`初始化为参数值大小(>= 0)的数组。一般情况下，我们用默认的构造方法即可。倘若在可知道将会向`ArrayList`插入多少元素的情况下，应该使用有参构造方法。按需分配，避免浪费。

第三个是集合参数构造函数，将参数中的集合转化为数组赋给`elementData`。

### 插入

对于数组(线性表)结构，插入操作分为两种情况。一种是在元素序列尾部插入，另一种是在元素序列其他位置插入。`ArrayList`的源码里也体现了这两种插入情况，如下：

```java
/** 在元素序列尾部插入 */
public boolean add(E e) {
    //检测是否需要扩容
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    //将新元素插入序列尾部
    elementData[size++] = e;
    return true;
}

/** 在元素序列index位置处插入 */
public void add(int index, E element) {
    //检查是否越界
    rangeCheckForAdd(index);

    //检测是否需要扩容
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    //将index及其之后的所有元素都向后移一位
    System.arraycopy(elementData, index, elementData, index + 1, size - index);
    //将新元素插入至index的位置
    elementData[index] = element;
    size++;
}
```

对于在元素序列尾部插入，这种情况比较简单，只需两个步骤即可：

1. 检测数组是否有足够的空间插入
2. 将新元素插入至序列尾部

如下图：

![An image](/img/java/container/03.png)

如果是在元素序列指定位置(假设该位置合理)插入，则情况稍微复杂一点，需要三个步骤：

1. 检测数组是否有足够的空间
2. 将`index`及其之后的所有元素向后移一位
3. 将新元素插入至`index`处

如下图：

![An image](/img/java/container/04.png)

从上图可以看出，将新元素插入至序列指定位置，需要先将该位置及其之后的元素都向后移动一位，为新元素腾出位置。这个操作的时间复杂度为O(N)，频繁移动元素可能会导致效率问题，特别是集合中元素数量较多时。在日常开发中，若非所需，我们应当尽量避免在大集合中调用第二个插入方法。

#### 扩容(重要)

以上是`ArrayList`插入相关的分析，上面的分析以及配图均未体现扩容机制。那么下面就来简单分析一下`ArrayList`的扩容机制。对于变长数据结构，当结构中没有空余空间可供使用时，就需要进行扩容。在`ArrayList`中，当空间用完，其会按照原数组空间的`1.5`倍进行扩容。相关源码如下：

```java
/** 扩容的入口方法 */
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}

/** 计算最小容量 */
private static int calculateCapacity(Object[] elementData, int minCapacity) {
    // 如果是空数组DEFAULTCAPACITY_EMPTY_ELEMENTDATA，就初始化为默认大小10
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    return minCapacity;
}

private void ensureExplicitCapacity(int minCapacity) {
    modCount++;

    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        // 扩容
        grow(minCapacity);
}

/** 扩容的核心方法 */
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    // 新容量为旧容量的1.5倍
    // newCapacity = oldCapacity + oldCapacity / 2 = oldCapacity * 1.5
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    // 如果新容量发现比需要的容量还小，则以需要的容量为准
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    // 如果新容量已经超过最大容量了，则使用最大容量
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // 以新容量拷贝出来一个新数组
    elementData = Arrays.copyOf(elementData, newCapacity);
}

private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    // 如果最小容量超过MAX_ARRAY_SIZE，则将数组容量扩容至Integer.MAX_VALUE
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

关于`grow`方法

1. 检查是否需要扩容；

2. 如果`elementData`等于`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`则初始化容量大小为`DEFAULT_CAPACITY`；

3. 新容量是老容量的`1.5`倍(`oldCapacity + (oldCapacity >> 1)`)，如果扩容后的容量比需要的容量还小，则以需要的容量为准；

4. 创建新容量的数组并把老数组拷贝到新数组；

### 删除

不同于插入操作，`ArrayList`没有无参删除方法。所以其只能删除指定位置的元素或删除指定元素，这样就无法避免移动元素(除非从元素序列的尾部删除)。相关代码如下：

```java
/** 删除指定位置的元素 */
public E remove(int index) {
    rangeCheck(index);

    modCount++;
    // 返回被删除的元素值
    E oldValue = elementData(index);

    int numMoved = size - index - 1;
    if (numMoved > 0)
        // 将index + 1及之后的元素向前移动一位，覆盖被删除值
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
    // 将最后一个元素置空，并将size值减1
    elementData[--size] = null; // clear to let GC do its work

    return oldValue;
}

E elementData(int index) {
    return (E) elementData[index];
}

/** 删除指定元素，若元素重复，则只删除下标最小的元素 */
public boolean remove(Object o) {
    if (o == null) {
        for (int index = 0; index < size; index++)
            if (elementData[index] == null) {
                fastRemove(index);
                return true;
            }
    } else {
        // 遍历数组，查找要删除元素的位置
        for (int index = 0; index < size; index++)
            if (o.equals(elementData[index])) {
                fastRemove(index);
                return true;
            }
    }
    return false;
}

/** 快速删除，不做边界检查，也不返回删除的元素值 */
private void fastRemove(int index) {
    modCount++;
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
    elementData[--size] = null; // clear to let GC do its work
}
```

上面的删除方法并不复杂，这里以第一个删除方法为例，删除一个元素步骤如下：

1. 获取指定位置`index`处的元素值
2. 将`index + 1`及之后的元素向前移动一位
3. 将最后一个元素置空，并将`size`值减`1`
4. 返回被删除值，完成删除操作

如下图：

![An image](/img/java/container/05.png)

上面就是删除指定位置元素的分析，并不是很复杂。

现在，考虑这样一种情况。我们往`ArrayList`插入大量元素后，又删除很多元素，此时底层数组会空闲处大量的空间。因为`ArrayList`没有自动缩容机制，导致底层数组大量的空闲空间不能被释放，造成浪费。对于这种情况，`ArrayList`也提供了相应的处理方法，如下：

```java
/** 将数组容量缩小至元素数量 */
public void trimToSize() {
    modCount++;
    if (size < elementData.length) {
        elementData = (size == 0)
          ? EMPTY_ELEMENTDATA
          : Arrays.copyOf(elementData, size);
    }
}
```

通过上面的方法，我们可以手动触发`ArrayList`的缩容机制。这样就可以释放多余的空间，提高空间利用率。

![An image](/img/java/container/06.png)

### 遍历

`ArrayList`实现了`RandomAccess`接口(该接口是个标志性接口)，表明它具有随机访问的能力。`ArrayList`底层基于数组实现，所以它可在常数阶的时间内完成随机访问，效率很高。对`ArrayList`进行遍历时，一般情况下，我们喜欢使用`foreach`循环遍历，但这并不是推荐的遍历方式。`ArrayList`具有随机访问的能力，如果在一些效率要求比较高的场景下，更推荐下面这种方式：

```java
for (int i = 0; i < list.size(); i++) {
    list.get(i);
}
```

至于原因也不难理解，`foreach`最终会被转换成迭代器遍历的形式，效率不如上面的遍历方式。

#### 关于遍历时删除

遍历时删除是一个不正确的操作，即使有时候代码不出现异常，但执行逻辑也会出现问题。关于这个问题，阿里巴巴`Java`开发手册里也有所提及。这里引用一下：

> 【强制】不要在`foreach`循环里进行元素的`remove/add`操作。`remove`元素请使用`Iterator`方式，如果并发操作，需要对`Iterator`对象加锁。

相关代码(稍作修改)如下：

```java
List<String> a = new ArrayList<String>();
a.add("1");
a.add("2");
for (String temp : a) {
    System.out.println(temp);
    if ("1".equals(temp)) {
        a.remove(temp);
    }
}
```

相信有些朋友应该看过这个，并且也执行过上面的程序。上面的程序执行起来虽不会出现异常，但代码执行逻辑上却有问题，只不过这个问题隐藏的比较深。我们把`temp`变量打印出来，会发现只打印了数字`1`，`2`没打印出来。初看这个执行结果确实很让人诧异，不明原因。如果死抠上面的代码，我们很难找出原因，此时需要稍微转换一下思路。我们都知道`Java`中的`foreach`是个语法糖，编译成字节码后会被转成用迭代器遍历的方式。所以我们可以把上面的代码转换一下，等价于下面形式：

```java
List<String> a = new ArrayList<>();
a.add("1");
a.add("2");
Iterator<String> it = a.iterator();
while (it.hasNext()) {
    String temp = it.next();
    System.out.println("temp: " + temp);
    if ("1".equals(temp)) {
        a.remove(temp);
    }
}
```

这个时候，我们再去分析一下`ArrayList`的迭代器源码就能找出原因。

```java
private class Itr implements Iterator<E> {
    int cursor;       // index of next element to return
    int lastRet = -1; // index of last element returned; -1 if no such
    int expectedModCount = modCount;

    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        // 并发修改检测，检测不通过则抛出异常
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }

    // 省略不相关的代码
}
```

我们一步一步执行一下上面的代码，第一次进入`while`循环时，一切正常，元素`1`也被删除了。但删除元素`1`后，就无法再进入`while`循环，此时`it.hasNext()`为`false`。原因是删除元素`1`后，元素计数器`size = 1`，而迭代器中的`cursor`也等于`1`，从而导致`it.hasNext()`返回`false`。归根结底，上面的代码段没抛异常的原因是，循环提前结束，导致`next`方法没有机会抛异常。不信的话，大家可以把代码稍微修改一下，即可发现问题：

```java
List<String> a = new ArrayList<>();
a.add("1");
a.add("2");
a.add("3");
Iterator<String> it = a.iterator();
while (it.hasNext()) {
    String temp = it.next();
    System.out.println("temp: " + temp);
    if("1".equals(temp)){
        a.remove(temp);
    }
}
```

以上是关于遍历时删除的分析，在日常开发中，我们要避免上面的做法。正确的做法使用迭代器提供的删除方法，而不是直接删除。

## 应用

### 分片

```java
import java.util.Arrays;
import java.util.List;

/**
 * list分片
 * 1. 使用Google的Guava框架实现分片；
 * 2. 使用Apache的commons框架实现分片；
 * 3. 使用国产神级框架Hutool实现分片；
 * 4. 使用JDK 8中提供Stream实现分片；
 * 5. 自定义分片。
 */
public class PartitionExample {
    // 原集合
    private static final List<Integer> oldList = Arrays.asList(1, 2, 3, 4);

    public static void main(String[] args) {
        // 集合分片

        // 以下1,2,3集合长度
        // 1. 使用Google的Guava框架实现分片；
        List<List<String>> newList = Lists.partition(oldList, 3);
        // 2. 使用Apache的commons框架实现分片；
        List<List<String>> newList = ListUtils.partition(oldList, 3);
        // 3. 使用国产神级框架Hutool实现分片；
        List<List<String>> newList = ListUtil.partition(oldList, 3);

        // 4. 使用JDK8中提供Stream实现分片；
        // 集合分片：将大于3和小于等于3的数据分别分为两组
        Map<Boolean, List<Integer>> newMap = oldList.stream().collect(
                Collectors.partitioningBy(i -> i > 3)
        );

        //5. 自定义分片
        List<String> list = oldList.subList(0, 3);
    }
}
```

### 排序

```java
/**
 * 排序
 * 1. 使用Comparable排序；
 * 2.1. 使用Comparator排序；
 * 2.2. 使用匿名比较器排序;
 * 3.1. 使用Stream流排序；
 * 3.2. 排序字段为null值
 */
public class ListSortExample {
    // 创建并初始化List
    List<Person> list = new ArrayList<Person>() {{
        add(new Person(1, 30, "北京"));
        add(new Person(2, 20, "西安"));
        add(new Person(3, 40, "上海"));
    }};

    public static void main(String[] args) {
        // 1. 使用Comparable自定的规则进行排序
        Collections.sort(list);

        // 2.1 使用Comparator比较器排序
        Collections.sort(list, new PersonComparator());

        // 2.2. 使用匿名比较器排序
        // Person类不用实现其他排序接口
        Collections.sort(list, new Comparator<Person>() {
            @Override
            public int compare(Person p1, Person p2) {
                return p2.getAge() - p1.getAge();
            }
        });

        // 3.1 使用Stream流排序
        list = list.stream().sorted(Comparator.comparing(Person::getAge).reversed())
                .collect(Collectors.toList());

        // 3.2 排序字段为null值
        // 按照[年龄]正序，但年龄中有一个null值
        list = list.stream().sorted(Comparator.comparing(Person::getAge,
                Comparator.nullsFirst(Integer::compareTo)))
                .collect(Collectors.toList());
    }
}

//1.使用Comparable自定的规则进行排序
@Data
@AllArgsConstructor
class Person implements Comparable<Person> {
    private int id;
    private int age;
    private String name;

    @Override
    public int compareTo(Person p) {
        return p.getAge() - this.getAge();
    }
}

//2. Comparator
class PersonComparator implements Comparator<Person> {
    @Override
    public int compare(Person p1, Person p2) {
        return p2.getAge() - p1.getAge();
    }
}

@Data
@AllArgsConstructor
class Person {
    private int id;
    private int age;
    private String name;
}
```

### 去重

```java
public class ListDistinctExample {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<Integer>() {{
            add(1);
            add(3);
            add(5);
            add(2);
            add(1);
            add(3);
            add(7);
            add(2);
        }};
        method(list);
    }

    /**
     * 1. 自定义去重
     * @param list
     */
    public static void method(List<Integer> list) {
        // 新集合
        List<Integer> newList = new ArrayList<>(list.size());
        list.forEach(i -> {
            if (!newList.contains(i)) { // 如果新集合中不存在则插入
                newList.add(i);
            }
        });
        System.out.println("去重集合:" + newList);
    }

    /**
     * 2. 使用迭代器去重
     * @param list
     */
    public static void method(List<Integer> list) {
        Iterator<Integer> iterator = list.iterator();
        while (iterator.hasNext()) {
            // 获取循环的值
            Integer item = iterator.next();
            // 如果存在两个相同的值
            if (list.indexOf(item) != list.lastIndexOf(item)) {
                // 移除最后那个相同的值
                iterator.remove();
            }
        }
        System.out.println("去重集合:" + list);
    }

    /**
     * 3. 使用HashSet/LinkedHashSet/TreeSet去重
     * LinkedHashSet：保持添加顺序
     * TreeSet：按照自然排序(a-z或0-9)
     * @param list
     */
    public static void method(List<Integer> list) {
        HashSet<Integer> set = new HashSet<>(list);
        //LinkedHashSet<Integer> set = new LinkedHashSet<>(list);
        //TreeSet<Integer> set = new TreeSet<>(list);
        System.out.println("去重集合:" + set);
    }

    /**
     * 4. 使用Stream去重
     * @param list
     */
    public static void method(List<Integer> list) {
        list = list.stream().distinct().collect(Collectors.toList());
        System.out.println("去重集合:" + list);
    }
}
```

## 总结

1. `ArrayList`内部使用数组存储元素，当数组长度不够时进行扩容，每次加一半的空间，`ArrayList`不会进行缩容；`ArrayList`支持随机访问，通过索引访问元素极快，时间复杂度为O(1)�(1)；
2. `ArrayList`添加元素到尾部极快，平均时间复杂度为O(1)�(1)，添加元素到中间比较慢，因为要搬移元素，平均时间复杂度为`O(n)`
3. `ArrayList`从尾部删除元素极快，时间复杂度为O(1)�(1)；从中间删除元素比较慢，因为要搬移元素，平均时间复杂度为`O(n)`；
4. 支持求并集、求交集、求单向差集。

## 拓展

### 序列化

`elementData`设置成了`transient`，那`ArrayList`是怎么把元素序列化的呢

> transient是一个关键字，它的作用为：在不需要序列化的属性前添加transient，每当序列化对象的时候，这个属性就**不会被序列化**(序列化即是能够解析成字节码)。**即不管数组有多大，都不会解析成字节码，不开括空间。**

`ArrayList`里重写了`writeObject`和`readObject`方法：

```java
private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException {
    // 防止序列化期间有修改
    int expectedModCount = modCount;
    // 写出非transient非static属性(会写出size属性)
    s.defaultWriteObject();

    // 写出元素个数
    s.writeInt(size);

    for (int i = 0; i < size; i++) {
        s.writeObject(elementData[i]);
    }

    if (modCount != expectedModCount) {
        throw new ConcurrentModificationException();
    }
}

private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
    
    elementData = EMPTY_ELEMENTDATA;

    // Read in size, and any hidden stuff
    s.defaultReadObject();

    // Read in capacity
    s.readInt(); // ignored

    if (size > 0) {
        // be like clone(), allocate array based upon size not capacity
        int capacity = calculateCapacity(elementData, size);
        SharedSecrets.getJavaOISAccess().checkArray(s, Object[].class, capacity);
        ensureCapacityInternal(size);

        Object[] a = elementData;
        // Read in all elements in the proper order.
        for (int i = 0; i < size; i++) {
            a[i] = s.readObject();
        }
    }
}
```

`ArrayList`在序列化的时候会调用`writeObject`，直接将`size`和`element`写入`ObjectOutputStream`；反序列化时调用`readObject`，从`ObjectInputStream`获取`size`和`element`，再恢复到`elementData`。

为什么不直接用`elementData`来序列化，而采用上诉的方式来实现序列化呢？原因在于`elementData`定义为`transient`会根据`size`序列化真实的元素，而不是根据数组的长度序列化元素，减少了空间占用。

### 慎用subList方法

在阿里巴巴Java开发手册(终极版)中，提及：

> 2.【强制】ArrayList的subList结果不可强转成ArrayList，否则会抛出ClassCastException异常，
> 即java.util.RandomAccessSubList cannot be cast to java.util.ArrayList.
>
> 说明：subList返回的是ArrayList的内部类SubList，并不是ArrayList，而是ArrayList的一个视图，对于SubList子列表
> 的所有操作最终会反映到原列表上。
>
> 3.【强制】在subList场景中，高度注意对原集合元素个数的修改，会导致子列表的遍历、增加、删除均会产生ConcurrentModificationException异常。

`subList`的源码如下：

```java
public List<E> subList(int fromIndex, int toIndex) {
    subListRangeCheck(fromIndex, toIndex, size);
    return new SubList(this, 0, fromIndex, toIndex);
}
```

可以看到，它调用了`SubList`类的构造函数，该构造函数的源码如下所示：

```java
private class SubList extends AbstractList<E> implements RandomAccess {
    private final AbstractList<E> parent;
    private final int parentOffset;
    private final int offset;
    int size;

    SubList(AbstractList<E> parent, int offset, int fromIndex, int toIndex) {
        this.parent = parent;
        this.parentOffset = fromIndex;
        this.offset = offset + fromIndex;
        this.size = toIndex - fromIndex;
        this.modCount = ArrayList.this.modCount;
   }
}
```

可以看出，`SubList`类是`ArrayList`的内部类，该构造函数中也并没有重新创建一个新的`ArrayList`，所以修改原集合或者子集合的元素的值，是会相互影响的。

### 慎用Arrays.asList方法

`Arrays`类提供的静态方法`asList`源码：

```java
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}
```

返回的是`ArrayList`，但是这个`ArrayList`不是我们常使用的`ArrayList`，而是`Arrays`的内部类`ArrayList`，它也继承了`AbstractList`类，重写了很多方法，比如我们上面使用的`contains`方法，但是却没有重写`add`方法，所以我们在调用`add`方法时才会抛出`java.lang.UnsupportedOperationException`异常。

在阿里巴巴Java开发手册(终极版)中，提及：

> 5.【强制】使用工具类Arrays.asList()把数组转换成集合时，不能使用其修改集合相关的方法，它的add/remove/clear方法会抛出UnsupportedOperationException异常。
>
> 说明：asList的返回对象是一个Arrays内部类，并没有实现集合的修改方法。Arrays.asList体现的是适配器模式，只是转换接口，后台的数据仍是数组。
>
> String[] str = new String[] { "you", "wu" };
> List list = Arrays.asList(str);
>
> 第一种情况：list.add("yangguanbao"); 运行时异常。
> 第二种情况：str[0] = "gujin"; 那么list.get(0)也会随之修改。
