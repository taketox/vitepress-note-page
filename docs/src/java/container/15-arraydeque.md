# ArrayDeque

## 简介

双端队列是一种特殊的队列，它的两端都可以进出元素，故而得名双端队列。

`ArrayDeque`是一种以**数组方式**实现的双端队列，内部使用数组进行元素存储，不允许存储`null`值，可以高效的进行元素查找和尾部插入取出，是用作队列、双端队列、栈的绝佳选择，性能比`LinkedList`还要好，它是非线程安全的。

## 案例

```java
public class DequeTest {
    public static void main(String[] args) {
        // 初始化容量为4
        ArrayDeque<String> arrayDeque = new ArrayDeque<>(4);
        // 添加元素
        arrayDeque.add("A");
        arrayDeque.add("B");
        arrayDeque.add("C");
        arrayDeque.add("D");
        arrayDeque.add("E");
        arrayDeque.add("F");
        arrayDeque.add("G");
        arrayDeque.add("H");
        arrayDeque.add("I");
        System.out.println(arrayDeque);

        // 获取元素
        String a = arrayDeque.getFirst();
        String a1 = arrayDeque.pop();
        String b = arrayDeque.element();
        String b1 = arrayDeque.removeFirst();
        String c = arrayDeque.peek();
        String c1 = arrayDeque.poll();
        String d = arrayDeque.pollFirst();
        String i = arrayDeque.pollLast();
        String e = arrayDeque.peekFirst();
        String h = arrayDeque.peekLast();
        String h1 = arrayDeque.removeLast();
        System.out.printf("a = %s, a1 = %s, b = %s, b1 = %s, c = %s, c1 = %s, d = %s," +
                " i = %s, e = %s, h = %s, h1 = %s", a, a1, b, b1, c, c1, d, i, e, h, h1);
        System.out.println();
        
        // 添加元素
        arrayDeque.push(e);
        arrayDeque.add(h);
        arrayDeque.offer(d);
        arrayDeque.offerFirst(i);
        arrayDeque.offerLast(c);
        arrayDeque.offerLast(h);
        arrayDeque.offerLast(c);
        arrayDeque.offerLast(h);
        arrayDeque.offerLast(i);
        arrayDeque.offerLast(c);
        System.out.println(arrayDeque);

        // 移除第一次出现的C
        arrayDeque.removeFirstOccurrence(c);
        System.out.println(arrayDeque);

        // 移除最后一次出现的C
        arrayDeque.removeLastOccurrence(c);
        System.out.println(arrayDeque);
    }
}
```

输出如下：

```text
[A, B, C, D, E, F, G, H, I]
a = A, a1 = A, b = B, b1 = B, c = C, c1 = C, d = D, i = I, e = E, h = H, h1 = H
[I, E, E, F, G, H, D, C, H, C, H, I, C]
[I, E, E, F, G, H, D, H, C, H, I, C]
[I, E, E, F, G, H, D, H, C, H, I]
```

可以看到，从`ArrayDeque`中取出元素的姿势可谓是五花八门，不过别慌，稍后会对这些方法进行一一讲解。

- `get`、`peek`、`element`方法都是获取元素，但是不会将它移除；
- `pop`、`poll`、`remove`都会将元素移除并返回；
- `add`、`push`、`offer`都是插入元素，它们的不同点在于插入元素的位置以及插入失败后的结果。

## 源码分析

### 继承体系

![An image](/img/java/container/38.png)

通过继承体系可以看，`ArrayDeque`实现了`Deque`接口，`Deque`接口继承自`Queue`接口，它是对`Queue`的一种增强。`Queue`是队列，而`Deque`是双端队列，也就是可以从前或者从后插入或者取出元素，也就是比队列存取更加方便一点，单向队列只能从一头插入，从另一头取出。

```java
public interface Deque<E> extends Queue<E> {

    // 添加元素到队列头
    void addFirst(E e);
    // 添加元素到队列尾
    void addLast(E e);

    // 添加元素到队列头
    boolean offerFirst(E e);
    // 添加元素到队列尾
    boolean offerLast(E e);

    // 从队列头移除元素
    E removeFirst();
    // 从队列尾移除元素
    E removeLast();

    // 从队列头移除元素
    E pollFirst();
    // 从队列尾移除元素
    E pollLast();

    // 查看队列头元素
    E getFirst();
    // 查看队列尾元素
    E getLast();

    // 查看队列头元素
    E peekFirst();
    // 查看队列尾元素
    E peekLast();

    // 从队列头向后遍历移除指定元素
    boolean removeFirstOccurrence(Object o);
    // 从队列尾向前遍历移除指定元素
    boolean removeLastOccurrence(Object o);

    // ********************** 队列中的方法 **********************
    
    // 添加元素，等于addLast(e)
    boolean add(E e);
     // 添加元素，等于offerLast(e)
    boolean offer(E e);

    // 移除元素，等于removeFirst()
    E remove();
    // 移除元素，等于pollFirst()
    E poll();

    // 查看元素，等于getFirst()
    E element();
    // 查看元素，等于peekFirst()
    E peek();

    // ********************** 栈方法 **********************

    // 入栈，等于addFirst(e)
    void push(E e);
    // 出栈，等于removeFirst()
    E pop();

    // ********************** Collection中的方法 **********************
    
    // 删除指定元素，等于removeFirstOccurrence(o)
    boolean remove(Object o);
    // 检查是否包含某个元素
    boolean contains(Object o);
    // 元素个数
    public int size();
    // 迭代器
    Iterator<E> iterator();
    // 反向迭代器
    Iterator<E> descendingIterator();
}
```

**方法的区别，如下**：

1. add()和offer()

- `add()`: 添加元素，如果添加成功则返回`true`，如果队列是满的，则抛出异常。
- `offer()`: 添加元素，如果添加成功则返回`true`，如果队列是满的，则返回`false`。

区别：对于一些有容量限制的队列，当队列满的时候，用`add()`方法添加元素，则会抛出异常，用`offer()`添加元素，则返回`false`。

1. remove()和poll()

- `remove()`: 移除队列头的元素并且返回，如果队列为空则抛出异常。
- `poll()`: 移除队列头的元素并且返回，如果队列为空则返回`null`。

区别：在移除队列头元素时，当队列为空的时候，用`remove()`方法会抛出异常，用`poll()`方法则会返回`null`。

1. element()和peek()

- `element()`: 返回队列头元素但不移除，如果队列为空，则抛出异常。
- `peek()`: 返回队列头元素但不移除，如果队列为空，则返回`null`。

区别 ：在取出队列头元素时，如果队列为空，用`element()`方法则会抛出异常，用`peek()`方法则会返回`null`。

> 因此，增加推荐使用`add`，移除推荐使用`poll`，获取元素推荐使用`peek`。

### 主要属性

```java
// 存储元素的数组
transient Object[] elements; // 非private访问限制，以便内部类访问

// 队列头位置
transient int head;
// 队列尾位置
transient int tail;

// 最小初始容量，必须是2的幂
private static final int MIN_INITIAL_CAPACITY = 8;
```

从属性我们可以看到，`ArrayDeque`元素都存储在`Object`数组中，`head`记录首节点的序号，`tail`记录尾节点后一个位置的序号，队列的容量最小为`8`，而且必须为`2`的幂。

### 构造方法

```java
// 默认构造方法，初始容量为16
public ArrayDeque() {
    elements = new Object[16];
}
// 指定元素个数初始化
public ArrayDeque(int numElements) {
    allocateElements(numElements);
}
// 将集合c中的元素初始化到数组中
public ArrayDeque(Collection<? extends E> c) {
    allocateElements(c.size());
    addAll(c);
}
// 初始化数组
private void allocateElements(int numElements) {
    elements = new Object[calculateSize(numElements)];
}
// 计算容量，这段代码的逻辑是算出大于numElements的最接近的2的n次方且不小于8
// 比如，3算出来是8，9算出来是16，33算出来是64
private static int calculateSize(int numElements) {
    int initialCapacity = MIN_INITIAL_CAPACITY;
    // Find the best power of two to hold elements.
    // Tests "<=" because arrays aren't kept full.
    if (numElements >= initialCapacity) {
        initialCapacity = numElements;
        initialCapacity |= (initialCapacity >>>  1);
        initialCapacity |= (initialCapacity >>>  2);
        initialCapacity |= (initialCapacity >>>  4);
        initialCapacity |= (initialCapacity >>>  8);
        initialCapacity |= (initialCapacity >>> 16);
        initialCapacity++;

        if (initialCapacity < 0)   // Too many elements, must back off
            initialCapacity >>>= 1;// Good luck allocating 2 ^ 30 elements
    }
    return initialCapacity;
}
```

通过构造方法，我们知道默认初始容量是`16`，最小容量是`8`。

`calculateSize`扩容算法和[`HashMap`](/java/container/hashmap/)的构造中`tableSizeFor`算法相似。

### 入队

入队有很多方法，我们这里主要分析两个，`addFirst(e)`和`addLast(e)`。

```java
// 从队列头入队
public void addFirst(E e) {
    // 不允许null元素
    if (e == null)
        throw new NullPointerException();
    // 将head指针减1并与数组长度减1取模
    // 这是为了防止数组到头了边界溢出
    // 如果到头了就从尾再向前
    // 相当于循环利用数组
    elements[head = (head - 1) & (elements.length - 1)] = e;
    // 如果头尾挨在一起了，就扩容
    // 扩容规则也很简单，直接两倍
    if (head == tail)
        doubleCapacity();
}

// 从队列尾入队
public void addLast(E e) {
    // 不允许null元素
    if (e == null)
        throw new NullPointerException();
    // 在尾指针的位置放入元素
    // 可以看到tail指针指向的是队列最后一个元素的下一个位置
    elements[tail] = e;
    // tail指针加1，如果到数组尾了就从头开始
    if ( (tail = (tail + 1) & (elements.length - 1)) == head)
        doubleCapacity();
}
```

1. 入队有两种方式，从队列头或者从队列尾；
2. 如果容量不够了，直接扩大为两倍；
3. 通过取模的方式让头尾指针在数组范围内循环；
4. `x & (len - 1) = x % len`，使用&的方式更快；

### 扩容

```java
private void doubleCapacity() {
    assert head == tail;
    // 头指针的位置
    int p = head;
    // 旧数组长度
    int n = elements.length;
    // 头指针离数组尾的距离
    int r = n - p; // number of elements to the right of p
    // 新长度为旧长度的两倍
    int newCapacity = n << 1;
    // 判断是否溢出
    if (newCapacity < 0)
        throw new IllegalStateException("Sorry, deque too big");
    // 新建新数组
    Object[] a = new Object[newCapacity];
    // 将旧数组head之后的元素拷贝到新数组中
    System.arraycopy(elements, p, a, 0, r);
    // 将旧数组下标0到head之间的元素拷贝到新数组中
    System.arraycopy(elements, 0, a, r, p);
    // 赋值为新数组
    elements = a;
    // head指向0，tail指向旧数组长度表示的位置
    head = 0;
    tail = n;
}
```

扩容这里迁移元素可能有点绕，请看下面这张图来理解。

![An image](/img/java/container/39.png)

### 出队

出队同样有很多方法，我们主要看两个，`pollFirst()`和`pollLast()`。

```java
// 从队列头出队
public E pollFirst() {
    int h = head;
    @SuppressWarnings("unchecked")
    // 取队列头元素
    E result = (E) elements[h];
    // 如果队列为空，就返回null
    if (result == null)
        return null;
    // 将队列头置为空
    elements[h] = null;     // Must null out slot
    // 队列头指针右移一位
    head = (h + 1) & (elements.length - 1);
    // 返回取得的元素
    return result;
}

// 从队列尾出队
public E pollLast() {
    // 尾指针左移一位
    int t = (tail - 1) & (elements.length - 1);
    @SuppressWarnings("unchecked")
    // 取当前尾指针处元素
    E result = (E) elements[t];
    // 如果队列为空返回null
    if (result == null)
        return null;
    // 将当前尾指针处置为空
    elements[t] = null;
    // tail指向新的尾指针处
    tail = t;
    // 返回取得的元素
    return result;
}
```

1. 出队有两种方式，从队列头或者从队列尾；
2. 通过取模的方式让头尾指针在数组范围内循环；
3. 出队之后没有缩容。

### 栈

前面我们介绍`Deque`的时候说过，`Deque`可以直接作为栈来使用，那么`ArrayDeque`是怎么实现的呢？

```java
public void push(E e) {
    addFirst(e);
}

public E pop() {
    return removeFirst();
}
```

是不是很简单，入栈出栈只要都操作队列头就可以了。

## 总结

1. `ArrayDeque`是采用数组方式实现的双端队列；
2. `ArrayDeque`的出队入队是通过头尾指针循环利用数组实现的；
3. `ArrayDeque`容量不足时是会扩容的，每次扩容容量增加一倍；
4. `ArrayDeque`可以直接作为栈使用。

## 拓展

### 双端队列与双重队列区别？

双端队列(`Deque`)是指队列的两端都可以进出元素的队列，里面存储的是实实在在的元素。

双重队列(`Dual Queue`)是指一种队列有两种用途，里面的节点分为数据节点和非数据节点，它是`LinkedTransferQueue`使用的数据结构。

### Queue和Deque对比

|      | Queue   | Deque                           |
| :--- | :------ | :------------------------------ |
| 增加 | add     | add、addFirst、addLast          |
|      | offer   | offer、offerFirst、offerLast    |
| 移除 | remove  | remove、removeFirst、removeLast |
|      | poll    | pop、poll、pollFirst、pollLast  |
| 获取 | element | element、getFirst、getLast      |
|      | peek    | peek、peekFirst、peekLast       |

### ArrayDeque与LinkedList的区别

`ArrayDeque`和`LinkedList`都实现了`Deque`接口，两者都具有队列的功能，但两者有什么区别呢？

- `ArrayDeque`是基于可变长的数组和双指针来实现，而`LinkedList`则通过链表来实现；
- `ArrayDeque`不支持存储`NULL`数据，但`LinkedList`支持；
- `ArrayDeque`是在`JDK1.6`才被引入的，而`LinkedList`早在`JDK1.2`时就已经存在；
- `ArrayDeque`插入时可能存在扩容过程，不过均摊后的插入操作依然为O(1)�(1)。虽然`LinkedList`不需要扩容，但是每次插入数据时均需要申请新的堆空间，均摊性能相比更慢。

从性能的角度上，选用`ArrayDeque`来实现队列要比`LinkedList`更好。此外，`ArrayDeque`也可以用于实现栈。
