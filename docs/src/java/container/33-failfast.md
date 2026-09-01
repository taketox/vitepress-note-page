# fail-fast

## 概述

`fail-fast`机制是`java`集合中的一种错误机制。首先我们看下维基百科中关于`fail-fast`的解释：

> In systems design, a fail-fast system is one which immediately reports at its interface any condition that is likely to indicate a failure. Fail-fast systems are usually designed to stop normal operation rather than attempt to continue a possibly flawed process. Such designs often check the system's state at several points in an operation, so any failures can be detected early. The responsibility of a fail-fast module is detecting errors, then letting the next-highest level of the system handle them.
>
> 大概意思是：在系统设计中，快速失效系统一种可以立即报告任何可能表明故障的情况的系统。快速失效系统通常设计用于停止正常操作，而不是试图继续可能存在缺陷的过程。这种设计通常会在操作中的多个点检查系统的状态，因此可以及早检测到任何故障。快速失败模块的职责是检测错误，然后让系统的下一个最高级别处理错误。

其实，这是一种理念，说白了就是在做系统设计的时候先考虑异常情况，一旦发生异常，直接停止并上报。

集合的错误检测机制包含以下两种：

1. **快速失败**：当使用迭代器遍历集合对象时，如果遍历过程中对集合的内容进行修改(增加、删除、修改)，则抛出`ConcurrentModificationException`异常。这种修改有可能是其它线程的修改，也有可能是当前线程自己的修改导致的，比如迭代的过程中直接调用`remove()`删除元素等。
   - **原理**：迭代器在遍历时直接访问集合中的内容，并且在遍历过程中使用一个`modCount`变量。集合在被遍历期间如果内容发生变化，就会改变`modCount`的值。每当迭代器使用`hashNext()/next()`遍历下一个元素之前，都会检测`modCount`变量是否与`expectedmodCount`值一致，是的话就返回遍历；否则抛出`ConcurrentModificationException`异常，终止遍历。
   - **注意：**这里异常的抛出条件是检测到`modCount != expectedmodCount`这个条件。如果集合发生变化时修改`modCount`值刚好又设置为了`expectedmodCount`值，则异常不会抛出。因此，不能依赖于这个异常是否抛出而进行并发操作的编程，这个异常只建议用于检测并发修改的`bug`。
   - **场景：**`java.util`包下的集合类都是快速失败的，不能在多线程下发生并发修改（迭代过程中被修改）。
2. **安全失败**：采用安全失败机制的集合容器，在遍历时不是直接在集合内容上访问的，而是先复制原有集合内容，在拷贝的集合上进行遍历。
   - **原理**：由于迭代时是对原集合的拷贝进行遍历，所以在遍历过程中对原集合所作的修改并不能被迭代器检测到，所以不会触发`ConcurrentModificationException`。
   - **缺点：**基于拷贝内容的优点是避免了`ConcurrentModificationException`，但同样地，迭代器并不能访问到修改后的内容，即：迭代器遍历的是开始遍历那一刻拿到的集合拷贝，在遍历期间原集合发生的修改迭代器是不知道的。这也就是他的缺点，同时，由于是需要拷贝的，所以比较吃内存。
   - **场景：**`java.util.concurrent`包下的容器都是安全失败，可以在多线程下并发使用，并发修改。

## fail-fast问题

```java
private static List<String> init() {
    List<String> userNames = new ArrayList<String>() {{
        add("Doug Lea");
        add("Josh Bloch");
        add("James Goslin");
        add("Rod Johnson");
    }};
    return userNames;
}

public static void main(String[] args) {
    List<String> userNames = init();
    for (String userName : userNames) {
        if (userName.equals("Doug Lea")) {
            userNames.remove(userName);
        }
    }
    System.out.println(userNames);
}
```

以上代码，使用增强`for`循环遍历元素，并尝试删除其中的`Doug Lea`字符串元素。运行以上代码，会抛出以下异常：

```text
Exception in thread "main" java.util.ConcurrentModificationException
    at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:911)
    at java.util.ArrayList$Itr.next(ArrayList.java:861)
    at com.test.Test.main(Test.java:22)
```

同样的，可以尝试下在增强`for`循环中使用`add`方法添加元素，结果也会同样抛出该异常。

## fail-fast产生原因

增强`for`循环其实是`Java`提供的一个语法糖，我们将代码反编译后可以看到增强`for`循环其实是用的是`Iterator`迭代器。

```java
public static void main(String[] args) {
    // 初始化一个List
    List<String> userNames = init();

    Iterator iterator = userNames.iterator();
    do {
        if (!iterator.hasNext())
            break;
        String userName = (String) iterator.next();
        if (userName.equals("Doug Lea"))
            userNames.remove(userName);
    } while (true);
    
    System.out.println(userNames);
}
```

通过以上代码的异常堆栈，我们可以跟踪到真正抛出异常的代码是：

```java
java.util.ArrayList$Itr.checkForComodification(ArrayList.java:911)
```

该方法是在`iterator.next()`方法中调用的。我们看下该方法的实现：

```java
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```

如上，在该方法中对`modCount`和`expectedModCount`进行了比较，如果二者不想等，则抛出`CMException`。

- `modCount`是`ArrayList`中的一个成员变量，表示该集合实际被修改的次数。当使用`init`方法初始化集合之后该变量就有了。初始值为`0`。
- `expectedModCount`是`ArrayList`中的一个内部类——`Itr`中的成员变量，表示这个迭代器预期该集合被修改的次数。

```java
Iterator iterator = userNames.iterator();
```

以上代码，即可得到一个`Itr`类，该类实现了`Iterator`接口。`expectedModCount`值随着`Itr`被创建而初始化。只有通过迭代器对集合进行操作，该值才会改变。

那么，接着我们看下`userNames.remove(userName);`方法里面做了什么事情，为什么会导致`expectedModCount`和`modCount`的值不一样。通过翻阅代码，我们也可以发现，`remove`方法核心逻辑如下：

```java
private void fastRemove(int index) {
    modCount++;
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
    elementData[--size] = null; // clear to let GC do its work
}
```

可以看到，它只修改了`modCount`，并没有对`expectedModCount`做任何操作。所以导致产生异常的原因是：`remove`和`add`操作会导致`modCount`和迭代器中的`expectedModCount`不一致。

## fail-fast解决办法

至此，我们介绍清楚了不能在`foreach`循环体中直接对集合进行`add/remove`操作的原因。但是，很多时候，我们是有需求需要过滤集合的，比如删除其中一部分元素，那么应该如何做呢？有几种方法可供参考：

### 使用普通for循环进行操作

我们说不能在`foreach`中进行，但是使用普通的`for`循环还是可以的，因为普通`for`循环并没有用到`Iterator`的遍历，所以压根就没有进行`fail-fast`的检验。

```java
List<String> userNames = init();

for (int i = 0; i < 1; i++) {
    if (userNames.get(i).equals("Doug Lea")) {
        userNames.remove(i);
    }
}
System.out.println(userNames);
```

这种方案其实存在一个问题，那就是`remove`操作会改变`List`中元素的下标，可能存在漏删的情况。

### 使用Iterator进行操作

除了直接使用普通`for`循环以外，我们还可以直接使用`Iterator`提供的`remove`方法。

```java
List<String> userNames = init();

Iterator iterator = userNames.iterator();

while (iterator.hasNext()) {
    if (iterator.next().equals("Doug Lea")) {
        iterator.remove();
    }
}
System.out.println(userNames);
```

如果直接使用`Iterator`提供的`remove`方法，那么就可以修改到`expectedModCount`的值。那么就不会再抛出异常了。其实现代码如下：

```java
public void remove() {
    if (lastRet < 0)
        throw new IllegalStateException();
    checkForComodification();

    try {
        ArrayList.this.remove(lastRet);
        cursor = lastRet;
        lastRet = -1;
        expectedModCount = modCount;
    } catch(IndexOutOfBoundsException ex) {
        throw new ConcurrentModificationException();
    } 
}
```

### 使用Java 8中filter过滤

`Java 8`中可以把集合转换成流，对于流有一种`filter`操作，可以对原始`Stream`进行某项测试，通过测试的元素被留下来生成一个新`Stream`。

```java
List<String> userNames = init();

userNames = userNames.stream().filter(userName -> !userName.equals("Doug Lea"))
                .collect(Collectors.toList());
System.out.println(userNames);
```

### 使用增强for循环

如果，我们非常确定在一个集合中，某个即将删除的元素只包含一个的话，比如对`Set`进行操作，那么其实也是可以使用增强`for`循环的，只要在删除之后，立刻结束循环体，不要再继续进行遍历就可以了，也就是说不让代码执行到下一次的`next`方法。

```java
List<String> userNames = init();

for (String userName : userNames) {
    if (userName.equals("Doug Lea")) {
        userNames.remove(userName);
        break;
    }
}
System.out.println(userNames);
```

### 使用fail-safe集合类

在`Java`中，除了一些普通的集合类以外，还有一些采用了`fail-safe`机制的集合类。这样的集合容器在遍历时不是直接在集合内容上访问的，而是先复制原有集合内容，在拷贝的集合上进行遍历。

由于迭代时是对原集合的拷贝进行遍历，所以在遍历过程中对原集合所作的修改并不能被迭代器检测到，所以不会触发`ConcurrentModificationException`。

```java
CopyOnWriteArrayList<String> userNames = new CopyOnWriteArrayList<String>() {{
    add("Doug Lea");
    add("Josh Bloch");
    add("James Goslin");
    add("Rod Johnson");
}};

for (String userName : userNames) {
    if (userName.equals("Doug Lea")) {
        userNames.remove();
    }
}
```

基于拷贝内容的优点是避免了`ConcurrentModificationException`，但同样地，迭代器并不能访问到修改后的内容，即：迭代器遍历的是开始遍历那一刻拿到的集合拷贝，在遍历期间原集合发生的修改迭代器是不知道的。

`java.util.concurrent`包下的容器都是安全失败，可以在多线程下并发使用，并发修改。

## fail-safe实现原理

以`CopyOnWriteArrayList`为例。

`CopyOnWriteArrayList`是`ArrayList`的一个线程安全的变体，其中所有可变操作(`add`、`set`等等)都是通过对底层数组进行一次新的复制来实现的。该类产生的开销比较大，但是在两种情况下，它非常适合使用。

1. 在不能或不想进行同步遍历，但又需要从并发线程中排除冲突时。
2. 当遍历操作的数量大大超过可变操作的数量时。

遇到这两种情况使用`CopyOnWriteArrayList`来替代`ArrayList`再适合不过了。那么为什么`CopyOnWriterArrayList`可以替代`ArrayList`呢？

1. `CopyOnWriterArrayList`无论从数据结构、定义都和`ArrayList`一样。和`ArrayList`一样实现`List`接口，底层使用数组实现。在方法上也包含`add`、`remove`、`clear`、`iterator`等方法。
2. `CopyOnWriterArrayList`根本就不会产生`ConcurrentModificationException`异常，也就是它使用迭代器完全不会产生`fail-fast`机制。

```JAVA
private static class COWIterator<E> implements ListIterator<E> {
    
    //...

    public E next() {
        if (! hasNext())
            throw new NoSuchElementException();
        return (E) snapshot[(cursor++)];
    }
}
```

`CopyOnWriterArrayList`的方法根本就没有像`ArrayList`中使用`checkForComodification`方法来判断`expectedModCount`与`modCount`是否相等。它为什么会这么做？我们以`add`方法为例：

```java
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        newElements[i] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}

final void setArray(Object[] a) {
    array = a;
}
```

`CopyOnWriterArrayList`的`add`方法与`ArrayList`的`add`方法有一个最大的不同点就在于，下面三句代码：

```java
Object[] newElements = Arrays.copyOf(elements, len + 1);
newElements[i] = e;
setArray(newElements);
```

就是这三句代码使得`CopyOnWriterArrayList`不会抛`ConcurrentModificationException`异常。原因就在于`copy`原来的`array`，再在`copy`数组上进行add操作，这样做就完全不会影响`COWIterator`中的`array`了。

所以`CopyOnWriterArrayList`所代表的核心概念就是：任何对`array`在结构上有所改变的操作(`add`、`remove`、`clear`等)，`CopyOnWriterArrayList`都会`copy`现有的数据，再在`copy`的数据上修改，这样就不会影响`COWIterator`中的数据了，修改完成之后改变原有数据的引用即可。同时这样造成的代价就是产生大量的对象，同时数组的`copy`也是相当有损耗的。

## 总结

我们使用的增强`for`循环，其实是`Java`提供的语法糖，其实现原理是借助`Iterator`进行元素的遍历。但是如果在遍历过程中，不通过`Iterator`，而是通过集合类自身的方法对集合进行添加/删除操作。那么在`Iterator`进行下一次的遍历时，经检测发现有一次集合的修改操作并未通过自身进行，那么可能是发生了并发被其他线程执行的，这时候就会抛出异常，来提示用户可能发生了并发修改，这就是所谓的`fail-fast`机制。当然还是有很多种方法可以解决这类问题的，比如使用普通`for`循环、使用`Iterator`进行元素删除、使用`Stream`的`filter`、使用`fail-safe`的类等。
