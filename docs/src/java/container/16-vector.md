# Vector

## 简述

`Vector`的操作单线安全，加入了同步代码块，多线程安全(但不绝对)，可以看成线程安全版本的`ArrayList`(其实也不绝对，在使用还是会加锁操作)。

相比于`ArrayList`其效率低，因为加入了`synchronized`操作。

## 源码分析

### 成员变量

在`Vector`的源码中，其成员变量并不多，所以在此把它们都一一列出。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {

    // 序列化唯一表示 UID
    private static final long serialVersionUID = -2767605614048989439L;

    // 保存Vector中数据的数组
    protected Object[] elementData;

    // 实际数据的数量
    protected int elementCount;

    // 容量增长系数
    protected int capacityIncrement;

    /**
     * 最大容量，也就是一维数组长度的最大值
     * 为什么要“-8”操作？
     * 因为在要分配的数组的最大大小时，vm会在一维数组中会保留一些。
     * 尝试分配更大的数组可能会导致OutOfMemoryError:请求的数组大小超过VM限制
     */
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    //...

}
```

继承了`AbstractList`抽象类，实现了`List`接口，实现了`RandomAccess`，`Cloneable`，`java.io.Serializable`接口，所以支持快速访问、复制(拷贝)、序列化。

### 构造函数

`Vector`有三个不同的构造函数。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {

    //...

    /**
     * 无参构造函数
     */
    public Vector() {
        // 调用有一个参数传值的有参构造函数，默认容量为10
        this(10);
    }

    /**
     * 有参构造函数
     *
     * @param initialCapacity 数组容量
     * @throws IllegalArgumentException 不合法的参数异常
     */
    public Vector(int initialCapacity) {
        this(initialCapacity, 0);
    }

    /**
     * 有参构造函数
     *
     * @param initialCapacity 数组容量
     * @param capacityIncrement 增长系数
     * @throws IllegalArgumentException 不合法的参数异常
     */
    public Vector(int initialCapacity, int capacityIncrement) {
        super();
        // 如果initialCapacity不合法，抛出异常
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
        // 设置新的数组，并且设置好数组容量
        this.elementData = new Object[initialCapacity];
        // 赋值增长系数
        this.capacityIncrement = capacityIncrement;
    }

    /**
     * 有参构造函数
     * 构造包含指定元素的列表集合
     *
     * @param c 集合元素
     * @throws NullPointerException 如果集合c为null，则抛出空指针异常
     * @since 1.2
     */
    public Vector(Collection<? extends E> c) {
        // 将集合转换为数组
        elementData = c.toArray();
        // 设置数组的真实长度
        elementCount = elementData.length;
        // 判断其是不是Object对象，如果不是将其转换为Object对象数组
        if (elementData.getClass() != Object[].class)
            elementData = Arrays.copyOf(elementData, elementCount, Object[].class);
    }

    //...
}
```

### 增加元素

`Vector`的增加操作有两种实现，分别为`add(E e)`和`add(int index, E element)`，下面我们来分析其两种实现。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {

    //...

    /**
     * 将元素e添加到列表中
     *
     * @param e 元素e
     * @return 返回true标识添加成功
     */
    public synchronized boolean add(E e) {
        modCount++;
        ensureCapacityHelper(elementCount + 1);
        elementData[elementCount++] = e;
        return true;
    }

    /**
     * 将元素element添加到指定的索引位置
     *
     * @param index 要插入指定元素的索引
     * @param element 要插入的元素
     * @throws IndexOutOfBoundsException 如果索引角标不合法，则抛出索引越界异常
     */
    public synchronized void add(int index, E element) {
        insertElementAt(element, index);
    }

    /**
     * 看是否需要进行扩容操作
     *
     * @param minCapacity 容积，其实就是数组的容量大小
     */
    private void ensureCapacityHelper(int minCapacity) {
        // 当if成立时，说明当前数组(容器)的空间不够了，需要扩容，所以调用grow()方法
        if (minCapacity - elementData.length > 0)
            grow(minCapacity);
    }

    /**
     * 增加容量以确保它至少可以容纳由最小容量参数指定的元素数目
     *
     * @param minCapacity 容积，其实就是数组的容量大小
     */
    private void grow(int minCapacity) {
        // 获取原始容积
        int oldCapacity = elementData.length;
        // 这里就是扩容到原始容量的2倍
        int newCapacity = oldCapacity + ((capacityIncrement > 0) ?
                capacityIncrement : oldCapacity);
        // 如果扩容2倍后还不满足，则直接赋值到其所需的容量
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        // 如果扩容的容量大于整型的最大值，则进行异常处理或者赋值为整型最大值
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // 调用arrays.copyOf()创建一个新的数组并将数据拷贝到新数组中，最后让elementData进行引用
        elementData = Arrays.copyOf(elementData, newCapacity);
    }

    /**
     * 判断 minCapacity 是否溢出
     *
     * @param minCapacity 容积，其实就是数组的容量大小
     */
    private static int hugeCapacity(int minCapacity) {
        // 判断minCapacity是否小于零，小于则抛出异常
        if (minCapacity < 0)
            throw new OutOfMemoryError();
        // 判断minCapacity是否超过前边设置的默认成员变量的值，超过整型的边界值从而进行赋值
        return (minCapacity > MAX_ARRAY_SIZE) ?
                Integer.MAX_VALUE :
                MAX_ARRAY_SIZE;
    }

    //...
}
```

### 删除元素

`Vector`的删操作有两种实现，分别是`remove(int index)`和`remove(Object o)`，下面我们来分析其两种实现。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {

    //...

    /**
     * 删除索引为index的元素并返回
     *
     * @param index 要删除的索引
     * @return 返回删除的元素
     * @throws IndexOutOfBoundsException 抛出索引角标越界异常
     */
    public synchronized E remove(int index) {
        // 这是Vector的父类AbstractList中定义了一个int型的属性
        // 在此用来记录了Vector结构性变化的次数
        modCount++;
        // 判断索引是否合法性
        if (index >= size)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
        // 获取要删除的元素
        E oldValue = (E) elementData[index];

        // 在执行删除操作时数组需要移动的元素个数
        int numMoved = size - index - 1;
        // (numMoved > 0)成立则将数组进行前移copy
        if (numMoved > 0)
            System.arraycopy(elementData, index + 1, elementData, index, numMoved);
        // 因为数组有可能进行了整个前移1位，所以将最后一个索引对应的值置空，从而降低GC
        elementData[--size] = null;
        // 返回要删除的元素
        return oldValue;
    }

    /**
     * 删除元素o，并且返回是否有效删除
     *
     * @param o 元素将从此列表中删除(如果存在)
     * @return 如果存在该元素将其删除并返回true，否则返回false
     */
    public boolean remove(Object o) {
        return removeElement(o);
    }

    /**
     * 删除元素obj，并且返回是否有效删除
     *
     * @param obj 元素将从此列表中删除(如果存在)
     * @return 如果存在该元素将其删除并返回true，否则返回false
     */
    public synchronized boolean removeElement(Object obj) {
        // 用来记录了Vector结构性变化的次数
        modCount++;
        // 获取当前元素obj的索引位置
        int i = indexOf(obj);
        // 索引大于等于0代表该元素存在，否则不存在
        if (i >= 0) {
            removeElementAt(i);
            return true;
        }
        return false;
    }

    /**
     * 检索元素o的索引坐标
     *
     * @param o 元素 o
     * @return 返回元素o的索引坐标，如若不存在则返回-1
     */
    public int indexOf(Object o) {
        return indexOf(o, 0);
    }

    /**
     * 检索元素o的索引坐标
     *
     * @param o 元素 o
     * @param index 从什么位置开始检索
     * @return 返回元素o的索引坐标，如若不存在则返回-1
     */
    public synchronized int indexOf(Object o, int index) {
        // 这里把空和非空进行区分，空的话用“==”判断，非空用“equals”判断
        if (o == null) {
            for (int i = index; i < elementCount; i++)
                if (elementData[i] == null)
                    return i;
        } else {
            for (int i = index; i < elementCount; i++)
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    /**
     * 删除元素obj，并且返回是否有效删除
     *
     * @param index 元素索引
     * @return 如果存在该元素将其删除并返回true，否则返回false
     */
    public synchronized void removeElementAt(int index) {
        // 用来记录Vector结构性变化的次数
        modCount++;
        // 判断索引位置是否合法，不合法抛出异常
        if (index >= elementCount) {
            throw new ArrayIndexOutOfBoundsException(index + " >= " + elementCount);
        } else if (index < 0) {
            throw new ArrayIndexOutOfBoundsException(index);
        }
        // 在执行删除操作时数组需要移动的元素个数
        int j = elementCount - index - 1;
        if (j > 0) {
            System.arraycopy(elementData, index + 1, elementData, index, j);
        }
        // 因为数组有可能进行了整个前移1位，所以将最后一个索引对应的值置空，从而降低GC
        elementCount--;
        elementData[elementCount] = null;
    }

    //...
}
```

### 修改元素

`Vector`的修改操作有一种实现，对应的是`set(int index, E element)`，下面我们来分析这种实现。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {

    //...

    /**
     * 修改索引角标为index的元素值
     *
     * @param index 要修改的索引坐标
     * @param element 修改后存储的元素值
     * @return 返回修改前的元素值
     * @throws IndexOutOfBoundsException 抛出索引角标越界异常
     */
    public synchronized E set(int index, E element) {
        // 判断索引是否合法性
        if (index >= elementCount)
            throw new ArrayIndexOutOfBoundsException(index);

        // 获取原本index的元素值
        E oldValue = elementData(index);
        // 将其替换成新的元素值
        elementData[index] = element;
        // 返回修改前的元素值
        return oldValue;
    }

    //...
}
```

### 查询元素

`Vector`的查操作有一种实现，对应的是`get(int index)`，下面我们来分析这种实现。

```java
public class Vector<E> extends AbstractList<E> implements List<E>,
        RandomAccess, Cloneable, java.io.Serializable {
    //...

    /**
     * 查找索引角标为index的元素值
     *
     * @param index 要修改的索引坐标
     * @return 返回查找到的索引为index的元素值
     * @throws IndexOutOfBoundsException 抛出索引角标越界异常
     */
    public synchronized E get(int index) {
        // 判断索引是否合法性
        if (index >= elementCount)
            throw new ArrayIndexOutOfBoundsException(index);
        // 返回查找到的索引为index的元素值
        return elementData(index);
    }

    //...
}
```

## 总结

同步容器直接保证单个操作的线程安全性，但是无法保证复合操作的线程安全，遇到这种情况时，必须要通过主动加锁的方式来实现。

除此之外，同步容易由于对其所有方法都加了锁，这就导致多个线程访问同一个容器的时候，只能进行顺序访问，即使是不同的操作，也要排队，如`get`和`add`要排队执行。这就大大的降低了容器的并发能力。

## 拓展

### Vector所有操作一定是线程安全的吗？

`Vector`容器的所有公有方法全都是`synchronized`的，也就是说，我们可以在多线程场景中放心的**单独**使用这些方法，因为这些方法本身的确是线程安全的。

> 请注意上面这句话中，有一个比较关键的词：单独

因为，虽然同步容器的所有方法都加了锁，但是对这些容器的复合操作无法保证其线程安全性。需要客户端通过主动加锁来保证。

简单举一个例子，我们定义如下删除`Vector`中最后一个元素方法：

```java
public Object deleteLast(Vector v){
    int lastIndex  = v.size() - 1;
    v.remove(lastIndex);
}
```

上面这个方法是一个复合方法，包括`size()`和`remove()`，乍一看上去好像并没有什么问题，无论是`size()`方法还是`remove()`方法都是线程安全的，那么整个`deleteLast`方法应该也是线程安全的。

但是，如果多线程调用该方法的过程中，`remove`方法有可能抛出`ArrayIndexOutOfBoundsException`。

```text
Exception in thread "Thread-1" java.lang.ArrayIndexOutOfBoundsException: Array index out of range: 879
at java.util.Vector.remove(Vector.java:834)
at com.hollis.Test.deleteLast(EncodeTest.java:40)
at com.hollis.Test$2.run(EncodeTest.java:28)
at java.lang.Thread.run(Thread.java:748)
```

**分析：**

根据`remove`的源码，我们可以分析得出：当`index >= elementCount`时，会抛出`ArrayIndexOutOfBoundsException`，也就是说，当当前索引值不再有效的时候，将会抛出这个异常。

因为`deleteLast`方法，有可能被多个线程同时执行，当线程`2`通过`index()`获得索引值为`10`，在尝试通过`remove()`删除该索引位置的元素之前，线程1把该索引位置的值删除掉了，这时线程一在执行时便会抛出异常。

![An image](/img/java/container/40.png)

为了避免出现类似问题，可以尝试加锁：

```java
public void deleteLast() {
    synchronized (v) {
        int index = v.size() - 1;
        v.remove(index);
    }
}
```

如上，我们在`deleteLast`中，对`v`进行加锁，即可保证同一时刻，不会有其他线程删除掉`v`中的元素。

另外，如果以下代码会被多线程执行时，也要特别注意：

```java
for (int i = 0; i < v.size(); i++) {
    v.remove(i);
}
```

由于，不同线程在同一时间操作同一个`Vector`，其中包括删除操作，那么就同样有可能发生线程安全问题。

所以，在使用同步容器的时候，如果涉及到多个线程同时执行删除操作，就要考虑下是否需要加锁。
