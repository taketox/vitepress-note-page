# LinkedList

## 概述

`LinkedList`是一个继承于`AbstractSequentialList`的双向链表。它也可以被当作堆栈、队列或双端队列进行操作。双向链表结构，有一个头结点和一个尾结点，意味着我们可以从头开始正向遍历，或者是从尾开始逆向遍历，并且可以针对头部和尾部进行相应的操作。

> `LinkedList`的方法都是双向链表方法，`peek`和`poll`具体可以查看双向链表。

## 案例

```java
import java.util.LinkedList;

public class LinkedListDemo {
    public static void main(String[] args) {

        LinkedList<String> linkedList = new LinkedList<>();
        linkedList.addFirst("a");
        linkedList.addFirst("b");
        linkedList.addFirst("c");
        // 插入到列表第一个位置
        linkedList.addFirst("d");
        // 插入到列表最后一个位置
        linkedList.addLast("e");

        //打印删除之后剩余元素
        System.out.println("列表：" + linkedList);
        
        //获取第一个元素
        System.out.println("获取第一个元素: " + linkedList.getFirst());

        //获取最后一个元素
        System.out.println("获取最后一个元素: " + linkedList.getLast());

        //删除第一个元素
        System.out.println("删除第一个元素: " + linkedList.removeFirst());

        //删除最后一个元素
        System.out.println("删除最后一个元素: " + linkedList.removeLast());

        //打印删除之后剩余元素
        System.out.println("删除之后剩余元素是：" + linkedList);

        //查找指定索引的元素
        System.out.println("1索引所对应的元素是：" + linkedList.get(1));
        
        // 弹出第一个元素
        System.out.println("弹出第一个元素：" + linkedList.pop());
    }
}
```

输出：

```text
列表：[d, c, b, a, e]
获取第一个元素: d
获取最后一个元素: e
删除第一个元素: d
删除最后一个元素: e
删除之后剩余元素是：[c, b, a]
1索引所对应的元素是：b
弹出第一个元素：c
弹出之后剩余元素是：[b, a]
```

## 源码分析

主要方法

| 方法               | 描述                                     |
| :----------------- | :--------------------------------------- |
| void addFirst(E e) | 在此列表的开始处插入指定的元素。         |
| void addLast(E e)  | 将指定的元素列表的结束。                 |
| E getFirst()       | 返回此列表中的第一个元素。               |
| E getLast()        | 返回此列表中的最后一个元素。             |
| E removeFirst()    | 移除并返回此列表中的第一个元素。         |
| E removeLast()     | 移除并返回此列表中的最后一个元素。       |
| E peek()           | 检索，但不删除，此列表的头(第一个元素)。 |
| E poll()           | 检索并删除此列表的头(第一个元素)。       |
| E pop()            | 从这个列表所表示的堆栈中弹出一个元素。   |

### 继承关系

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {
    
}
```

`LinkedList`实现`List`接口，能对它进行队列操作。
`LinkedList`实现`Deque`接口，即能将`LinkedList`当作双端队列使用。
`LinkedList`实现了`Cloneable`接口，即覆盖了函数`clone()`，能克隆。
`LinkedList`实现`java.io.Serializable`接口，这意味着`LinkedList`支持序列化，能通过序列化去传输。
`LinkedList`是非同步的。

> 说明：着重要看是`Deque`接口，`Deque`接口表示是一个双端队列，那么意味着`LinkedList`是双端队列的一种实现，所以，基于双端队列的操作在`LinkedList`中全部有效。

### 内部类

```java
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

说明：内部类`Node`就是实际的结点，用于存放实际元素的地方。

### 属性

```java
/**
 * LinkedList 双向链表的长度
 */
transient int size = 0;

/**
 * Pointer to first node.
 * Invariant: (first == null && last == null) ||
 *            (first.prev == null && first.item != null)
 * 指针，指向双向链表的首结点，初始值为null
 */
transient Node<E> first;

/**
 * Pointer to last node.
 * Invariant: (first == null && last == null) ||
 *            (last.next == null && last.item != null)
 * 指针，指向双向链表的尾结点，初始值为null
 */
transient Node<E> last;

/**
 * 记录双向链表添加、删除结点的次数，这个属性继承自直接父类AbstractSequentialList的父类AbstractList，
 * 用于在并发环境下，同时读、写双向链表时保护数据安全
 */
protected transient int modCount = 0;
```

说明：`LinkedList`的属性非常简单，一个头结点、一个尾结点、一个表示链表中实际元素个数的变量。注意，头结点、尾结点都有`transient`关键字修饰，这也意味着在序列化时该域是不会序列化的。

### 构造函数

```java
public LinkedList() {
} 

public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);//添加集合所有元素
}

/**
 * 按照指定集合的迭代器返回的顺序，将指定集合中的所有元素追加到此列表的末尾。
 * 如果在操作进行期间修改了指定的集合，则此操作的行为未定义。
 * (请注意，如果指定的集合是此列表，并且它是非空的，则会发生这种情况。)
 */
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}

/**
 * 从指定位置开始，将指定集合中的所有元素插入此列表。
 * 将当前位于该位置的元素(如果有)和任何后续元素向右移动(增加其索引)。
 * 新元素将按指定集合的迭代器返回的顺序出现在列表中。
 */
public boolean addAll(int index, Collection<? extends E> c) {
    //判断传进来的参数是否合法
    checkPositionIndex(index);
    //将集合转为数组
    Object[] a = c.toArray();
    //新建个遍历存储数组长度
    int numNew = a.length;
    //如果待添加集合为空，直接返回。
    if (numNew == 0)
        return false;
    
    //插入位置的前节点和后续节点
    Node<E> pred, succ;
    //如果插入位置索引大小等于链表大小，那么就是在最后插入元素
    if (index == size) {
        // 最后插入元素没有后续节点
        succ = null;
        // 前一个节点就是之前的最后一个节点
        pred = last;
    } else {
        //查找到索引为index 的节点
        succ = node(index);
        //获取前一个节点
        pred = succ.prev;
    }
    
    //遍历数组中的每个元素
    for (Object o : a) {
        @SuppressWarnings("unchecked") E e = (E) o;
        //每次遍历都新建一个节点，每个节点存储都是a的值，
        //该节点的前节点prev用来存储pred节点
        //next置为null
        Node<E> newNode = new Node<>(pred, e, null);
        //如果前一个节点是null，那么第一个节点就是新的节点
        if (pred == null)
            //把当前节点设置为头节点
            first = newNode;
        else
            //否则pred的next置为新节点
            pred.next = newNode;
        //最后把pred指向当前节点
        pred = newNode;
    }
    //如果插入位置没有后续节点，也就是succ为null
    if (succ == null) {
        //最后一个节点也就是pred，刚刚插入的新节点
        last = pred;
    } else {
        //加入所有元素之后的最后一个节点的下一个节点指向succ(后续元素)
        pred.next = succ;
        //插入位置的后续元素的上一个节点引用指向pred
        succ.prev = pred;
    }

    size += numNew;
    modCount++;
    return true;
}

//如果索引位置在后面一半，就从后往前遍历查找，否则从前往后遍历。
Node<E> node(int index) {
    // assert isElementIndex(index);
   // size>>1 表示除以2，相当于index小于size的一半
    if (index < (size >> 1)) {
        // 从前面开始遍历，取出first节点，因为中间过程引用会变化，所以不可直接操作first
        Node<E> x = first;
        // 通过循环计数来查找
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        // 取出最后一个元素
        Node<E> x = last;
        // 从后往前遍历
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}

private void checkPositionIndex(int index) {
    if (!isPositionIndex(index))
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}

private boolean isPositionIndex(int index) {
    return index >= 0 && index <= size;
}
```

`LinkedList`有两个构造函数，分别是空构造方法、使用已有集合创建链表的构造方法。会调用无参构造函数，并且会把集合中所有的元素添加到`LinkedList`中。

### 查找

#### 查找首位元素

```java
//获取集合中的第一个元素
public E getFirst() {
    //保存第一个元素为f
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}
```

#### 查找末位元素

```java
//获取集合中的最后一个元素
public E getLast() {
    //保存第一个元素为l
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}
```

#### 查找元素

```java
//获取集合中指定索引的元素
public E get(int index) {
    //检查索引是否越界
    checkElementIndex(index);
    return node(index).item;
}

private void checkElementIndex(int index) {
    if (!isElementIndex(index))
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}

private boolean isElementIndex(int index) {
    return index >= 0 && index < size;
}

private String outOfBoundsMsg(int index) {
    return "Index: " + index + ", Size: " + size;
}

//如果索引位置在后面一半，就从后往前遍历查找，否则从前往后遍历。
Node<E> node(int index) {
    // assert isElementIndex(index);
   // size>>1 表示除以2，相当于index小于size的一半
    if (index < (size >> 1)) {
        // 从前面开始遍历，取出first节点，因为中间过程引用会变化，所以不可直接操作first
        Node<E> x = first;
        // 通过循环计数来查找
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        // 取出最后一个元素
        Node<E> x = last;
        // 从后往前遍历
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

#### 查找某一个元素的索引位置

```java
public int indexOf(Object o) {
    int index = 0;
    // 如果需要查找null元素
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null)
                return index;
            index++;
        }
    } else {
        // 查找元素不为空
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item))
                return index;
            index++;
        }
    }
    return -1;
}
```

#### 倒叙查找

```java
//跟上面的indexOf差不多,就是倒过来查找
public int lastIndexOf(Object o) {
    int index = size;
    if (o == null) {
        for (Node<E> x = last; x != null; x = x.prev) {
            index--;
            if (x.item == null)
                return index;
        }
    } else {
        for (Node<E> x = last; x != null; x = x.prev) {
            index--;
            if (o.equals(x.item))
                return index;
        }
    }
    return -1;
}
```

### 添加头部

#### 添加头部元素

```java
//将元素添加到第一个节点
public void addFirst(E e) {
    linkFirst(e);
}

private void linkFirst(E e) {
    //保存第一个节点
    final Node<E> f = first;
    //初始化新节点 prev 为空,item 为 e, next为 f (之前的第一个节点)
    final Node<E> newNode = new Node<>(null, e, f);
    //更新first节点
    first = newNode;
    //如果前面的第一个节点为空,那就说明那么就说明里面是空的，没有元素
    if (f == null)
        //最后一个元素也是新加入的元素
        last = newNode;
    else
        //f的prev前置节点的引用更新为新的节点
        f.prev = newNode;
    size++;
    modCount++;
}
```

#### 添加尾部元素

```java
//在集合的尾部添加元素
public boolean add(E e) {
    linkLast(e);//这里就只调用了这一个方法
    return true;
}

/**
 * Appends the specified element to the end of this list.
 *
 * <p>This method is equivalent to {@link #add}.
 *
 * @param e the element to add
 */
public void addLast(E e) {
    linkLast(e);
}

//链接e作为最后一个元素。
void linkLast(E e) {
    //指向链表的尾部
    final Node<E> l = last;
    //以尾部为前驱节点创建一个新节点
    final Node<E> newNode = new Node<>(l, e, null);
    //更新最后一个节点
    last = newNode;
    //如果之前的最后一个节点为空,说明链表是空的,就将新的节点指向first
    if (l == null)
        first = newNode;
    else
        //l的后置节点的引用跟新为新的节点
        l.next = newNode;
    size++;
    modCount++;
}
```

#### 在指定位置添加元素

```java
//在指定索引位置添加指定元素
public void add(int index, E element) {
    //索引越界校验
    checkPositionIndex(index);
    //当索引等于链表长度,就说明直接在链表尾部添加元素
    if (index == size)
        linkLast(element);
    else
        //在某个节点前插入元素
        linkBefore(element, node(index));
}

void linkBefore(E e, Node<E> succ) {
    // assert succ != null;
    //保存当前索引的前置节点
    final Node<E> pred = succ.prev;
    //新建节点
    final Node<E> newNode = new Node<>(pred, e, succ);
    //更新当前索引的前置节点为 新建节点
    succ.prev = newNode;
    //如果当前所引的前置节点为空,就讲first更新为 新建节点
    if (pred == null)
        first = newNode;
    else
        //前置节点的next为 新建节点
        pred.next = newNode;
    size++;
    modCount++;
}

//如果索引位置在后面一半，就从后往前遍历查找，否则从前往后遍历。
Node<E> node(int index) {
    // assert isElementIndex(index);
   // size>>1 表示除以2，相当于index小于size的一半
    if (index < (size >> 1)) {
        // 从前面开始遍历，取出first节点，因为中间过程引用会变化，所以不可直接操作first
        Node<E> x = first;
        // 通过循环计数来查找
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        // 取出最后一个元素
        Node<E> x = last;
        // 从后往前遍历
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

#### 添加集合元素

添加集合元素首先是检测当前链表中的长度，然后将集合转换成数组，如果传入的插入位置等于链表长度，那就说明在链表尾部添加元素。否则就是以集合为基础构建一个新的链表。

```java
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}
public boolean addAll(int index, Collection<? extends E> c) {
    // 检测index是否越界
    checkPositionIndex(index);
    // 集合转变数组
    Object[] a = c.toArray();
    int numNew = a.length;
    // 如果长度为零说明集合为空，直接返回false
    if (numNew == 0)
        return false;

    Node<E> pred, succ;
    // 如果index等于链表长度，从链表尾部进行添加元素
    if (index == size) {
        succ = null;
        pred = last;
    } else {
        // 如果不等于，查找对于位置的节点，然后从这个节点开始插入元素
        succ = node(index);
        pred = succ.prev;
    }
    // 遍历元素并将元素添加进链表里
    for (Object o : a) {
        @SuppressWarnings("unchecked") E e = (E) o;
        Node<E> newNode = new Node<>(pred, e, null);
        // 如果后继为空，说明链表为空。
        if (pred == null)
        // 头节点指向新创建的节点
            first = newNode;
        else
        // 否则后继节点的next指针指向新创建的节点
            pred.next = newNode;
         // pred节点移动到下一个节点。
        pred = newNode;
    }

    if (succ == null) {
        last = pred;
    } else {
        pred.next = succ;
        succ.prev = pred;
    }

    size += numNew;
    modCount++;
    return true;
}
```

### 删除

#### 删除头部元素

```java
//删除第一个节点
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

private E unlinkFirst(Node<E> f) {
    // assert f == first && f != null;
    //获取元素
    final E element = f.item;
    //保存f的下一个节点
    final Node<E> next = f.next;
    //将元素值和元素的next节点置空，有利于GC
    f.item = null;
    f.next = null; // help GC
    //首节点更新
    first = next;
    //如果首届点为空,链表就没有元素了,最后一个元素也就是空
    if (next == null)
        last = null;
    else
        //如果不为空,就将下一个结点的前置节点置为空
        next.prev = null;
    size--;
    modCount++;
    return element;
}
```

#### 删除尾部元素

```java
//移除为节点,并返回删除元素
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

private E unlinkLast(Node<E> l) {
    // assert l == last && l != null;
    //获取元素值
    final E element = l.item;
    //将元素的前置节点保存
    final Node<E> prev = l.prev;
    //将元素的前置和元素值置空
    l.item = null;
    l.prev = null; // help GC
    //更新最后一个节点
    last = prev;
    //如果最后一个节点为空,那么链表为空
    if (prev == null)
        first = null;
    else
        //不为空,将前置节点的next置空
        prev.next = null;
    size--;
    modCount++;
    return element;
}
```

#### 删除指定元素

```java
//移除一个指定元素(链表后续还有相同元素是不会移除的)
public boolean remove(Object o) {
    //判断元素是否为空
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

E unlink(Node<E> x) {
    // assert x != null;
    //保存元素的值和前后节点
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;
    //如果前置节点为空,那么头节点就是当前节点
    if (prev == null) {
        first = next;
    } else {
        //前一个节点的next置为next
        prev.next = next;
        //该节点的前节点置空
        x.prev = null;
    }
    
    //如果后置节点为空,那么上一个节点就是最后一个节点
    if (next == null) {
        last = prev;
    } else {
        //next的上一个节点引用指向prev
        next.prev = prev;
        //被删除的节点的next置为空
        x.next = null;
    }
    // item置空
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

#### 清空链表

为了让`GC`更快可以回收放置的元素，需要将`node`之间的引用关系赋空。

```java
//删除链表的所有元素
public void clear() {
    // 清除节点之间的所有"非不要"的链接，如果丢弃的节点超过一代，
    // 则有助于分代GC垃圾回收。 即使存在可到达的迭代，也肯定会释放内存
    for (Node<E> x = first; x != null; ) {
        // 遍历每一个节点，将所有的节点的值全部赋值为null值，帮助java虚拟机进行垃圾回收
        Node<E> next = x.next;
        x.item = null;
        x.next = null;
        x.prev = null;
        x = next;
    }
    // 首节点和尾节点全部置null
    first = last = null;
    size = 0;
    modCount++;
}
```

#### 删除指定位置元素

```java
//移除指定索引的元素。先通过索引找到节点，再移除指定的节点
public E remove(int index) {.
    //检查是否越界
    checkElementIndex(index);
    //先找到节点，再移除指定节点
    return unlink(node(index));
}

//如果索引位置在后面一半，就从后往前遍历查找，否则从前往后遍历。
Node<E> node(int index) {
    // assert isElementIndex(index);
    // size>>1 表示除以2，相当于index小于size的一半
    if (index < (size >> 1)) {
        // 从前面开始遍历，取出first节点，因为中间过程引用会变化，所以不可直接操作first
        Node<E> x = first;
        // 通过循环计数来查找
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        // 取出最后一个元素
        Node<E> x = last;
        // 从后往前遍历
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}

private void checkElementIndex(int index) {
    if (!isElementIndex(index))
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}

private boolean isElementIndex(int index) {
    return index >= 0 && index < size;
}

private String outOfBoundsMsg(int index) {
    return "Index: "+index+", Size: "+size;
}
```

### 元素赋值

```java
//更新指定索引的位置的元素,返回旧值的元素
public E set(int index, E element) {
    //检查索引是否越界
    checkElementIndex(index);
    //找到对应的节点
    Node<E> x = node(index);
    //记录旧值
    E oldVal = x.item;
    //修改元素
    x.item = element;
    return oldVal;
}

//如果索引位置在后面一半，就从后往前遍历查找，否则从前往后遍历。
Node<E> node(int index) {
    // assert isElementIndex(index);
    // size>>1 表示除以2，相当于index小于size的一半
    if (index < (size >> 1)) {
        // 从前面开始遍历，取出first节点，因为中间过程引用会变化，所以不可直接操作first
        Node<E> x = first;
        // 通过循环计数来查找
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        // 取出最后一个元素
        Node<E> x = last;
        // 从后往前遍历
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

### 队列方法

#### Queue方法

```java
//返回头部元素但不删除
public E peek() {
    final Node<E> f = first;
    return (f == null) ? null : f.item;
}

//检索但不删除此列表的头部(第一个元素)
public E element() {
    return getFirst();
}

//返回头部元素并删除
public E poll() {
    final Node<E> f = first;
    return (f == null) ? null : unlinkFirst(f);
}

//返回并删除头部元素
public E remove() {
    return removeFirst();
}

//添加指定元素作为此列表的尾部(最后一个元素)
public boolean offer(E e) {
    return add(e);
}
```

#### Deque方法

```java
//在此列表的前面插入指定的元素。
public boolean offerFirst(E e) {
    addFirst(e);
    return true;
}

//在此列表的末尾插入指定的元素。
public boolean offerLast(E e) {
    addLast(e);
    return true;
}

//检索但不删除此列表的第一个元素，如果此列表为空，则返回 null。
public E peekFirst() {
    final Node<E> f = first;
    return (f == null) ? null : f.item;
 }

//检索但不删除此列表中的最后一个元素，如果此列表为空，则返回null
public E peekLast() {
    final Node<E> l = last;
    return (l == null) ? null : l.item;
}

//检索并删除此列表的第一个元素，如果此列表为空，则返回null。
public E pollFirst() {
    final Node<E> f = first;
    return (f == null) ? null : unlinkFirst(f);
}

//检索并删除此列表的最后一个元素，如果此列表为空，则返回 null。
public E pollLast() {
    final Node<E> l = last;
    return (l == null) ? null : unlinkLast(l);
}

//将元素推送到此列表表示的堆栈上。换句话说，在这个列表的前面插入元素。
public void push(E e) {
    addFirst(e);
}

//从此列表表示的堆栈中弹出一个元素。换句话说，删除并返回此列表的第一个元素。
public E pop() {
    return removeFirst();
}

//删除此列表中第一次出现的指定元素(从头到尾遍历列表时)。如果列表不包含该元素，则它不变。
public boolean removeFirstOccurrence(Object o) {
    return remove(o);
}

//删除此列表中指定元素的最后一次出现(从头到尾遍历列表时)。如果列表不包含该元素，则它不变。
public boolean removeLastOccurrence(Object o) {
    if (o == null) {
        for (Node<E> x = last; x != null; x = x.prev) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        for (Node<E> x = last; x != null; x = x.prev) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}
```

## LinkedList的使用场景

`LinkedList`作为链表结构的特性，可以保证其在端点操作：如插入以及删除等，速度比`ArrayList`快，道理很简单，`ArrayList`在删除后，每次都要把后面的元素往前移(虽然采用的是拷贝方法)，而`LinkedList`只要重新维护前后元素的关系就可以了。

引用`Java`编程思想里的话：

> 最佳的做法可能是将`ArrayList`作为默认选择，只有需要使用额外的功能(个人理解为对`Queue`的操作)，或者当程序的性能因为经常从表中间进行插入和删除而变差的时候，才去选择`LinkedList`。

## 总结

不管是单向队列还是双向队列还是栈，其实都是对链表的头结点和尾结点进行操作，它们的操作和`linkBefore()`和`unlink()`类似，只不过一个是对链表两端操作，一个是对链表中间操作。可以说这四个方法都是`linkBefore()`和`unlink()`方法的特殊情况，因此不难理解它们的内部实现，对全文中的重点做个总结：

1. `LinkedList`是基于双向链表实现的，不论是增删改查方法还是队列和栈的实现，都可通过操作结点实现；
2. `LinkedList`无需提前指定容量，因为基于链表操作，集合的容量随着元素的加入自动增加；
3. `LinkedList`删除元素后集合占用的内存自动缩小，无需像`ArrayList`一样调用`trimToSize()`方法；
4. `LinkedList`的所有方法没有进行同步，因此它也不是线程安全的，应该避免在多线程环境下使用；
5. 以上分析基于`JDK1.8`，其他版本会有些出入，因此不能一概而论。

## 拓展(与ArrayList比较)

### 性能比较

1. `ArrayList`是实现了基于动态数组的数据结构，而`LinkedList`是基于链表的数据结构；
2. 对于随机访问`get`和`set`，`ArrayList`要优于`LinkedList`，因为`LinkedList`要移动指针；
3. 对于添加和删除操作`add`和`remove`，一般大家都会说`LinkedList`要比`ArrayList`快，因为`ArrayList`要移动数据。但是实际情况并非这样，对于添加或删除，`LinkedList`和`ArrayList`并不能明确说明谁快谁慢；
4. 查找操作`indexOf`，`lastIndexOf`，`contains`等，两者差不多；
5. 随机查找指定节点的操作`get`，`ArrayList`速度要快于`LinkedList`。

### 空间比较

以下是`ArrayList`和`LinkedList`空间占用图

![An image](/img/java/container/07.png)

这三个图，可以看到，`LinkedList`的空间占用，要远超`ArrayList`。`LinkedList`的线更陡，随着`List`长度的扩大，所占用的空间要比同长度的`ArrayList`大得多。因为`ArrayList`的数组变量是用`transient`关键字修饰的，如果集合本身需要做序列化操作的话，`ArrayList`这部分多余的空间不会被序列化。

**内存分配：**

首先，`LinkedList`是通过双向链表来实现列表的，其元素在内存地址上，并不需要存在特定的组合关系。所以，即使存在一个可设定初始容量的构造方法，也无需在堆中为其预先分配内存。

`ArrayList`和`LinkedList`则不同，是基于动态数组实现的，它需要在堆中为元素预留相应大小的连续空间。所以，最好指定初始容量，可将分配空间的动作提前，这样，只要后续的操作，不使`ArrayList`中的元素超过初始容量，就不需要重新分配空间。

在使用`ArrayList`时，最好是能够根据预估的容量，为其设置一个合适的初始容量，以使其尽量不去做重新分配空间的动作，因为，这个动作在内存操作上的开销，相对来说太大了。
