# 简介概览

## 概述

`Java`集合框架主要包括两种类型的容器，一种是集合（`Collection`），存储一个元素集合，另一种是图（`Map`），存储键/值对映射。`Collection`接口又有`3`种子类型，`List`、`Set`和`Queue`，再下面是一些抽象类，最后是具体实现类，常用的有`ArrayList`、`LinkedList`、`HashSet`、`LinkedHashSet`、`HashMap`、`LinkedHashMap`等等。

![An image](/img/java/container/01.png)

集合框架是一个用来代表和操纵集合的统一架构。所有的集合框架都包含如下内容：

- 接口：是代表集合的抽象数据类型。例如`Collection`、`List`、`Set`、`Map`等。之所以定义多个接口，是为了以不同的方式操作集合对象。
- 实现（类）：是集合接口的具体实现。从本质上讲，它们是可重复使用的数据结构，例如：`ArrayList`、`LinkedList`、`HashSet`、`HashMap`。
- 算法：是实现集合接口的对象里的方法执行的一些有用的计算，例如：搜索和排序。这些算法被称为多态，那是因为相同的方法可以在相似的接口上有着不同的实现。

`Java`不考虑多线程并发的情况下，容器类一般使用`ArrayList`、`HashMap`等线程不安全的类，效率更高。在并发场景下，常会用到`ConcurrentHashMap`、`ArrayBlockingQueue`等线程安全的容器类，虽然牺牲了一些效率，但却得到了安全。

List、Set、Queue、Map四者的区别？

- `List`(对付顺序的好帮手): 存储的元素是有序的、可重复的。
- `Set`(注重独一无二的性质): 存储的元素是无序的、不可重复的。
- `Queue`(实现排队功能的叫号机): 按特定的排队规则来确定先后顺序，存储的元素是有序的、可重复的。
- `Map`(用`key`来搜索的专家): 使用键值对（`key-value`）存储，`key`是无序的、不可重复的，`value`是无序的、可重复的，每个键最多映射到一个值。

## 常用容器

标准集合类汇总于下表：

| 容器                                                         | 简述                                       |
| :----------------------------------------------------------- | :----------------------------------------- |
| [ArrayList](/java/container/arrayList/) | 有序可重复(基于动态数组)                   |
| [LinkedList](/java/container/linkedlist/) | 有序可重复(基于双向链表)                   |
| [HashSet](/java/container/hashset/)   | 无序不重复                                 |
| [LinkedHashSet](/java/container/linkedhashset/) | 有序不重复HashSet(基于数组 + 双向链表)     |
| [TreeSet](/java/container/treeset/)   | 有序HashSet(基于红黑树)                    |
| [EnumSet](/java/container/enumset/)   | 添加枚举类元素的专用集合类                 |
| [HashMap](/java/container/hashmap/)   | 键值对(基于数组 + 链表/红黑树)             |
| [TreeMap](/java/container/treemap/)   | 有序HashMap(基于红黑树)                    |
| [WeakHashMap](/java/container/weakhashmap/) | 弱键HashMap(基于数组 + 链表)               |
| [LinkedHashMap](/java/container/linkedhashmap/) | 有序HashMap(继承HashMap，双向链表实现排序) |
| [IdentityHashMap](/java/container/identityhashmap/) | 允许键重复的HashMap(基于数组)              |
| [EnumMap](/java/container/enummap/)   | key是Enum类型的HashMap(基于数组)           |
| [PriorityQueue](/java/container/priorityqueue/) | 队列(基于链表)                             |
| [ArrayDeque](/java/container/arraydeque/) | 队列(基于双向链表)                         |

## 同步容器

为了方便编写出线程安全的程序，`Java`里面提供了一些线程安全类和并发工具，比如：同步容器、并发容器、阻塞队列、`Synchronizer`（比如`CountDownLatch`）。

```java
List list = Collections.synchronizedList(new ArrayList());
Set set = Collections.synchronizedSet(new HashSet());
Map map = Collections.synchronizedMap(new HashMap());
```

上面提到的这些经过包装后线程安全容器，都是基于`synchronized`这个同步关键字实现，所以也被称为同步容器，`Java`提供的同步容器还有`Vector`、`Stack`和`Hashtable`，这三个容器并不是基于包装类实现，但同样是基于`synchronized`实现的，对这三个容器的遍历，同样要加锁保证互斥。

| 容器                                                         | 简述                        |
| :----------------------------------------------------------- | :-------------------------- |
| [Vector](/java/container/vector/)    | 同步版ArrayList             |
| [Stack](/java/container/stack/)     | 继承Vector(后进先出)        |
| [Hashtable](/java/container/hashtable/) | 同步版HashMap               |
| Properties                                                   | 继承Hashtable(键值都字符串) |

## 并发容器

`Java`在`1.5`版本之前所谓的线程安全的容器，主要指的就是同步容器。不过同步容器有个最大的问题，那就是性能差，所有方法都用`synchronized`来保证互斥，串行度太高了。因此`Java`在`1.5`及之后版本提供了性能更高的容器，我们一般称为并发容器。

![An image](/img/java/container/02.png)

| 容器                                                         | 简述                   |
| :----------------------------------------------------------- | :--------------------- |
| [CopyOnWriteArrayList](/java/container/copyonwritearraylist/) | 并发版ArrayList        |
| [ConcurrentHashMap](/java/container/concurrenthashmap/)(重要) | 并发版HashMap          |
| [ConcurrentSkipListMap](/java/container/concurrentskiplistmap/) | 基于跳表的并发Map      |
| [ConcurrentSkipListSet](/java/container/concurrentskiplistset/) | 基于跳表的并发Set      |
| [CopyOnWriteArraySet](/java/container/copyonwritearrayset/) | 并发Set                |
| [LinkedBlockingDeque](/java/container/linkedblockingdeque/) | 阻塞队列(基于双向链表) |
| [ArrayBlockingQueue](/java/container/arrayblockingqueue/) | 阻塞队列(基于数组)     |
| [LinkedBlockingQueue](/java/container/linkedblockingqueue/) | 阻塞队列(基于链表)     |
| [SynchronousQueue](/java/container/synchronousqueue/) | 读写成对的队列         |
| [LinkedTransferQueue](/java/container/linkedtransferqueue/) | 基于链表的数据交换队列 |
| [PriorityBlockingQueue](/java/container/priorityblockingqueue/) | 线程安全的优先队列     |
| [DelayQueue](/java/container/delayqueue/) | 延时队列               |
| [ConcurrentLinkedQueue](/java/container/concurrentlinkedqueue/) | 并发队列(基于链表)     |
| [ConcurrentLinkedDeque](/java/container/concurrentlinkeddeque/) | 并发队列(基于双向链表) |

## 容器的内部设计

- [迭代器Iterator](/java/container/iterator/)
- [枚举器Enumeration](/java/container/enumeration/)
- [错误机制fail-fast](/java/container/failfast/)
- [集合排序Comparable和Comparator](/java/container/sort/)
