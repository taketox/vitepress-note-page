# Iterator

## 简介

`Iterator`(迭代器)取代了`Java Collections Framework`（Java集合框架）中的`Enumeration`，迭代器与枚举有两点不同：

- 迭代器允许调用者利用定义良好的语义在迭代期间从迭代器所指向的`collection`移除元素。
- 方法名称得到了改进。

## 源码

```java
package java.util;

import java.util.function.Consumer;

public interface Iterator<E> {

    //返回迭代器刚迭代过的元素的引用，返回值是Object，需要强制转换成自己需要的类型
    boolean hasNext();

    //判断容器内是否还有可供访问的元素,返回值是E
    E next();
    
    //删除迭代器刚迭代过的元素
    default void remove() {
        throw new UnsupportedOperationException("remove");
    }

    default void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
}
```

1. `hasNext()`，如果仍有元素可以迭代(`next`返回了元素而不是抛出异常)，则返回`true`。
2. `next()`，返回迭代的下一个元素。
3. `remove()`，从迭代器指向的`collection`中移除迭代器返回的最后一个元素（可选操作）。每次调用`next`只能调用一次此方法。如果进行迭代时用调用此方法之外的其他方式修改了该迭代器所指向的`collection`，则迭代器的行为是不确定的。如果迭代器不支持`remove`操作，抛出`UnsupportedOperationException`。如果尚未调用`next`方法，或者在上一次调用`next`方法之后已经调用了`remove`方法，抛出`IllegalStateException`。

## 案例

这里使用`Iterator`遍历`list`单列集合，对于`map`多列集合，在调用`keySet()`方法或者是`entrySet()`方法之后同样也是相当于单列集合了。

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorTest {

    public static void main(String[] args) {
        
        List<String> list = new ArrayList<String>();
        list.add("Monday");
        list.add("Tuesday");
        list.add("Wednesday");
        
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}
```

输出结果为：

```text
Monday
Tuesday
Wednesday
```

调用`Iterator`的`remove()`方法：

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorTest {

    public static void main(String[] args) {
        
        List<String> list = new ArrayList<String>();
        list.add("Monday");
        list.add("Tuesday");
        list.add("Wednesday");
        
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            if ("Wednesday".equals(iterator.next())) {
                iterator.remove();
            }
            System.out.println(list);
        }
    }
}
```

输出的结果：

```text
[Monday, Tuesday, Wednesday]
[Monday, Tuesday, Wednesday]
[Monday, Tuesday]
```

注意：每次循环中最好只使用一次`next()`方法，因为使用一次，指针就会往下走一个，如果在一个循环中使用了两次`next()`方法，可能会出现**NoSuchElementException**的异常，例如：

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorTest {

    public static void main(String[] args) {
        
        List<String> list = new ArrayList<String>();
        list.add("Monday");
        list.add("Tuesday");
        list.add("Wednesday");
        
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            if (iterator.next() != null && !"".equals(iterator.next())) {
                // 逻辑处理
            }
        }
    }
}
```

上面代码，循环一次，指针向后移动两位，这样在第二次循环时，第二个`iterator.next()`会抛异常。

同样需要注意`remove()`方法，每次调用只能够在调用了`next()`方法的前提下才可以移除响应元素。如果调用了多个`next()`方法后再调用`remove()`方法，则移除的时最后一次调用`next()`方法返回的元素。例如：

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorTest {

    public static void main(String[] args) {
        
        List<String> list = new ArrayList<String>();
        list.add("Monday");
        list.add("Tuesday");
        list.add("Wednesday");
        list.add("Thursday");
        
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            if (iterator.next() != null && !"".equals(iterator.next())) {
                iterator.remove();
            }
            System.out.println(list);
        }
    }
}
```

输出的结果为：

```text
[Monday, Wednesday, Thursday]
[Monday, Wednesday]
```

## 总结

`Enumeration`接口是`JDK 1.0`时推出的。使用到它的函数包括`Vector`、`Hashtable`等类，这些类都是`JDK 1.0`中加入的，`Enumeration`存在的目的就是为它们提供遍历接口。

`Enumeration`本身并没有支持同步，而在`Vector`、`Hashtable`实现`Enumeration`时，添加了同步。在`JDK1.5`之后为`Enumeration`接口进行了扩充，增加了泛型的操作应用。

为什么还要使用`Enumeration`？这是因为`java`的发展经历了很长时间，一些比较古老的系统或者类库中的方法还在使用`Enumeration`接口，因此为了兼容，还是需要使用`Enumeration`。已知的对于`Vector`和`Hashtable`的遍历还可能会使用`Enumeration`。

而`Iterator`是`JDK 1.2`才添加的接口，`Iterator`迭代器取代了`Enumeration`的功能，同时增添了删除元素的方法，并且对方法的名称进行了改进。它也是为了`HashMap`、`ArrayList`等集合提供遍历接口。`Iterator`是支持`fail-fast`机制的：当多个线程对同一个集合的内容进行操作时，就可能会产生`fail-fast`事件。

`iterator`是快速失败的，当你在遍历的时候，如果另起一个线程来修改它（集合的内容）的结构，这时迭代器会立马感知到，引起快速失败，抛出`ConcurrentModificationException`异常。
