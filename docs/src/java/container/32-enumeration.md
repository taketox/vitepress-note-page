# Enumeration

## 简介

`Enumeration`(列举)，本身是一个接口，不是一个类。`Enumeration`接口本身不是一个数据结构。但是，对其他数据结构非常重要。`Enumeration`接口定义了从一个数据结构得到连续数据的手段。实现`Enumeration`接口的对象，它生成一系列元素，一次生成一个。连续调用`nextElement`方法将返回一系列的连续元素。

例如，要输出`Vector<E> v`的所有元素，可使用以下方法：

```java
for (Enumeration<E> e = v.elements(); e.hasMoreElements();){
    System.out.println(e.nextElement());
}
```

## 源码

它的源码如下：

```java
package java.util;

public interface Enumeration<E> {
    
    boolean hasMoreElements();

    E nextElement();
}
```

`Enumeration`接口提供了一套标准的方法，主要通过向量的元素、哈希表的键以及哈希表中的值进行枚举。由于`Enumeration`是一个接口，它的角色局限于为数据结构提供方法协议,实现该接口的对象由一系列的元素组成，可以连续地调用`nextElement()`方法来得到Enumeration枚举对象中的元素。

`Enumertion`接口中仅定义了下面两个方法：

1. hasMoreElements()，测试此枚举是否包含更多的元素。当且仅当此枚举对象至少还包含一个可提供的元素时，才返回`true`；否则返回`false`。
2. E nextElement()，如果此枚举对象至少还有一个可提供的元素，则返回此枚举的下一个元素。

## 案例

使用Enumeration遍历Vector集合

```java
import java.util.Enumeration;
import java.util.Vector;  
  
public class EnumerationTest {
    public static void main(String[] args) {
    
        Vector<String> vector = new Vector<String>();
        vector.addElement("Monday");
        vector.addElement("Tuesday");
        vector.addElement("Wednesday");
        vector.addElement("Thursday");
        
        Enumeration<String> elements = vector.elements();
        while (elements.hasMoreElements()) {
            System.out.println(elements.nextElement());
        }
    }
}
```

输出的结果为：

```text
Monday
Tuesday
Wednesday
Thursday
```

使用Enumeration遍历HashTable（使用枚举获取key的值）

```java
import java.util.Enumeration;
import java.util.Hashtable;  
     
public class EnumerationTest {
   public static void main(String[] args) {

        Hashtable<String, String> table = new Hashtable<String, String>();
        table.put("星期一", "Monday");
        table.put("星期二", "Tuesday");
        table.put("星期三", "Wednesday");
        table.put("星期四", "Thursday");
        
        Enumeration<String> keys = table.keys();
        while (keys.hasMoreElements()) {
            String element= keys.nextElement();
            System.out.println(element);
        }
    }
}
```

输出的结果为：

```text
星期三
星期二
星期四
星期一
```

使用Enumeration遍历HashTable（使用枚举获取value值）

```java
import java.util.Enumeration;
import java.util.Hashtable;  
     
public class EnumerationTest {
    public static void main(String[] args) {

        Hashtable<String, String> table = new Hashtable<String, String>();
        table.put("星期一", "Monday");
        table.put("星期二", "Tuesday");
        table.put("星期三", "Wednesday");
        table.put("星期四", "Thursday");
        
        Enumeration<String> values= table.elements();
        while (values.hasMoreElements()) {
            String element= values.nextElement();
            System.out.println(element);
        }
    }
}
```

输出的结果为：

```text
Wednesday
Tuesday
Thursday
Monday
```

## 总结

`Enumeration`接口是`JDK 1.0`时推出的。使用到它的函数包括`Vector`、`Hashtable`等类，这些类都是`JDK 1.0`中加入的，`Enumeration`存在的目的就是为它们提供遍历接口。

`Enumeration`本身并没有支持同步，而在`Vector`、`Hashtable`实现`Enumeration`时，添加了同步。在`JDK1.5`之后为`Enumeration`接口进行了扩充，增加了泛型的操作应用。

为什么还要使用`Enumeration`？这是因为`java`的发展经历了很长时间，一些比较古老的系统或者类库中的方法还在使用`Enumeration`接口，因此为了兼容，还是需要使用`Enumeration`。已知的对于`Vector`和`Hashtable`的遍历还可能会使用`Enumeration`。

而`Iterator`是`JDK 1.2`才添加的接口，`Iterator`迭代器取代了`Enumeration`的功能，同时增添了删除元素的方法，并且对方法的名称进行了改进。它也是为了`HashMap`、`ArrayList`等集合提供遍历接口。`Iterator`是支持`fail-fast`机制的：当多个线程对同一个集合的内容进行操作时，就可能会产生`fail-fast`事件。

`iterator`是快速失败的，当你在遍历的时候，如果另起一个线程来修改它（集合的内容）的结构，这时迭代器会立马感知到，引起快速失败，抛出`ConcurrentModificationException`异常。
