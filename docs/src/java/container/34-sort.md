# 集合排序

## 概述

对于`Java`中的对象，我们只能使用基本运算符`==`、`!=`来判断一下地址是否相等，不能使用`>`、`<`来比较大小。但是在实际的开发中，我们需要对对象进行排序，也就是比较大小，那么应该如何实现呢？

确定两个对象之间的大小关系及排列顺序称为比较，能实现这个比较功能的类或方法称之为比较器，在`java`中有两种比较器。

- 内部比较器：`Comparable`是排序接口，自然排序。
- 外部比较器：`Comparator`是比较器接口，定制排序。

`Comparable`和`Comparator`区别如下：

| 参数     | `Comparable`                             | `Comparator`                         |
| :------- | :--------------------------------------- | :----------------------------------- |
| 排序逻辑 | 必须在待排序对象的类中，故称之为自然排序 | 排序逻辑在另一个实现                 |
| 排序方法 | `compareTo(T o)`                         | `compare(T o1, T o2)`                |
| 触发排序 | `Collections.sort(List)`                 | `Collections.sort(List, Comparator)` |
| 所在包   | `java.lang.Comparable`                   | `java.util.Comparator`               |

## Comparable接口

### 概述

`Comparable`是一个基于排序接口，它是自然排序。该接口中只有一个方法`compareTo(T o)`，用于给一个类的多个实例比较大小，进而完成排序。

也就是说某个类实现了`Comparable`接口，就意味着该类支持排序。通过实现类重写`compareTo(T o)`方法，从而规定多个实例的自然顺序，然后使用`Arrays.sort`或`Collections.sort`方法对数组对象或`List`对象进行排序。

> 简单点说就是把比较器写在类的内部，一旦实现了`Comparable`接口，就说明这个类支持排序。

### compareTo方法

先看看`Comparable`接口，它的定义如下：

```java
public interface Comparable<T> {
    int compareTo(T o);
}
```

用`String`举一个简单的例子：

```java
public class CompareTest {
    public static void main(String[] args) {
        String[] str = new String[]{"AA", "EE", "DD", "CC", "FF", "BB"};
        Arrays.sort(str);
        System.out.println(Arrays.toString(str));
    }
}
```

运行结果为：

```text
[AA, BB, CC, DD, EE, FF]
```

可以发现，在使用`Arrays.sort(str)`之后就完成了排序，但是我们并没有调用`compareTo(T o)`方法。这是因`为String`源码中实现了`Comparable`接口并且重写了该接口的方法，在使用`Arrays.sort(str)`时`sort`方法内部间接的调用了`String`的`compareTo(T o)`方法，所以我们直接就看到了排序的结果。像`String`、包装类等都实现了`Comparable`接口，重写了`compareTo`方法，都清晰的给出了比较两个对象的方式。但是在重写`compareTo(T o)`方法时都需要遵循这三个规则：

1. 如果比较者(即`this`当前对象)大于被比较者(即`compareTo`方法里面的形参)(即前者大于后者)，则返回正整数。
2. 如果比较者小于被比较者(即前者小于后者)，那么返回负整数。
3. 如果比较者等于被比较者(即前者等于后者)，那么返回零。

自定义的类是无法排序的，但是通过实现`Comparable`接口之后就可以实现，然后通过`Arrays.sort`或`Collections.sort`方法排序。我们来看一个自己定义的类怎么使用`Comparable`接口进行排序：

```java
@Data
@AllArgsConstructor
public class Person implements Comparable {
    
    private String name;
    private int age;

    // 按名字排序
    @Override
    public int compareTo(Object o) {
        if (o instanceof Person) {
            Person p = (Person) o;
            // name是String类型，这里直接调用String的compareTo
            if (this.name.compareTo(p.name) > 0) {
                return 1;
            } else if (this.name.compareTo(p.name) < 0) {
                return -1;
            } else {
                return 0;
            }
        } else {
            throw new RuntimeException("传入数据类型不一致...");
        }
    }

    public static void main(String[] args) {
        Person[] p = new Person[5];
        p[0] = new Person("Jack", 23);
        p[1] = new Person("Marry", 13);
        p[2] = new Person("Tom", 18);
        p[3] = new Person("John", 33);
        p[4] = new Person("Thomas", 41);
        System.out.println("排序前------------");
        for (Person person : p) {
            System.out.println(person.getName() + ": " + person.getAge());
        }
        System.out.println("排序后------------");
        Arrays.sort(p);
        for (Person person : p) {
            System.out.println(person.getName() + ": " + person.getAge());
        }
    }
}
```

运行结果为：

```text
排序前------------
Jack:23
Marry:13
Tom:18
John:33
Thomas:41
排序后------------
Jack:23
John:33
Marry:13
Thomas:41
Tom:18
```

在`Person`类中实现了`Comparable`接口并且重写`compareTo(T o)`方法，然后我们按照名字排序，可以发现它默认的排序方式是升序，如果要降序则可以在返回值前面加一个负号。

## Comparator接口

### 概述

`Comparator`也是一个排序接口，它和`Comparable`功能是一样的，但是它是**定制排序**。怎么来理解定制排序呢？

如果某个类没有实现`Comparable`接口，那么该类本身是不支持排序的，我们就可以使用`Comparator`来进行排序，或者我们自定义类实现了`Comparable`接口后，但是自定义类的代码不能再更改了，这时需要改变`compareTo(T o)`方法中排序的方式，此时也可以选择定制排序`Comparator`。

### compare方法

`Comparator`接口中有一个`compare(T o1, T o2)`方法，这个方法和`compareTo(T o)`类似，这个称作**外部比较器**，定义排序的规则是一样的：

- o1 > o2 (前者大于后者)，返回值为正整数。
- o1 < o2 (前者小于后者)，返回值为负整数。
- o1 = o2 (前者等于后者)，返回值为零。

同样使用`String`简单举例：

```java
public class CompareTest {
   public static void main(String[] args) {
       String[] str = new String[]{"AA", "EE", "DD", "CC", "FF", "BB"};
       // 使用匿名内部类直接创建
       Arrays.sort(str, new Comparator<String>() {
           @Override
           public int compare(String o1, String o2) {
               if (o1.compareTo(o2) > 0) {
                   return 1;
                } else if (o1.compareTo(o2) < 0) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });
        System.out.println(Arrays.toString(str));
    }
}
```

我们知道接口是不能被实例化的，这里是匿名内部类的知识，可以自行去度娘寻找答案。

自定义类使用`Comparator`进行排序：

```java
@Data
@AllArgsConstructor
public class Person {
    private String name;
    private int age;

    public static void main(String[] args) {
        Person[] p = new Person[5];
        p[0] = new Person("Jack", 23);
        p[1] = new Person("Marry", 13);
        p[2] = new Person("Tom", 18);
        p[3] = new Person("John", 33);
        p[4] = new Person("Thomas", 41);
        System.out.println("排序前------------");
        for (Person person : p) {
            System.out.println(person.getName() + ": " + person.getAge());
        }
        System.out.println("排序后------------");
        Arrays.sort(p, new Comparator<Person>() {
            // 按照年龄默认排序，如果年龄相同则按照名字默认排序
            @Override
            public int compare(Person o1, Person o2) {
                if (o1 instanceof Person && o2 instanceof Person) {
                    if (o1.age > o2.age) {
                        return 1;
                    } else if (o1.age < o2.age) {
                        return -1;
                    } else {
                        return o1.name.compareTo(o2.name);
                    }
                } else {
                    throw new RuntimeException("传入数据类型不一致...");
                }
            }
        });
        for (Person person : p) {
            System.out.println(person.getName() + ": " + person.getAge());
        }
    }
}
```

程序运行结果：

```text
排序前------------
Jack: 23
Marry: 13
Tom: 18
John: 33
Thomas: 41
排序后------------
Marry: 13
Tom: 18
Jack: 23
John: 33
Thomas: 41
```

这样就使用`Comparator`定制排好序了。

### 函数式方法

在`jdk1.8`之后又增加了很多静态和默认的新方法，用于函数式编程。

#### reversed

`reversed`是`Java`比较器功能接口的默认方法。`reversed`返回一个比较器，该比较器强制执行反向排序。

```java
default Comparator<T> reversed()
```

要使用`reversed`方法，我们需要实例化我们的比较器并调用该方法。

`reversed`将返回新的比较器实例，该实例将强加该比较器的反向排序。

#### reverseOrder/naturalOrder

`reverseOrder`是一个静态方法，返回比较器，对对象集合进行反向自然排序。

对于自然排序，一个类需要实现`Comparable`并定义`compareTo`方法。

一个对象集合根据自然排序中的`compareTo`进行排序。

```java
public static <T extends Comparable<? super T>> Comparator<T> reverseOrder() {
    return Collections.reverseOrder();
}
```

它在内部调用`Collections.reverseOrder()`并返回比较器实例。`Comparator.reverseOrder`反转了自然排序。

像`Integer`、`String`和`Date`这样的`Java`类实现了`Comparable`接口，并覆盖了其`compareTo`方法，它们以词汇表(`lexicographic-order`)排序。

> reverseOrder为反向，naturalOrder为正向。

#### nullsFirst/nullsLast

`nullsFirst`是比较器功能接口的静态方法。

`Comparator.nullsFirst`方法返回一个对`null`友好的比较器，它认为`null`小于非`null`。

```java
static <T> Comparator<T> nullsFirst(Comparator<? super T> comparator);
```

找到由`nullsFirst`方法返回的比较器工作原理。

1. 空元素被认为是小于非空元素的。
2. 当两个元素都是空的时候，那么它们就被认为是相等的。
3. 当两个元素都是非空的时候，指定的比较器决定了顺序。
4. 如果指定的比较器是空的，那么返回的比较器认为所有非空的元素是相等的。

> `nullsLast`和`nullsFirst`相反。

#### comparing

`comparing`是比较器功能接口的静态方法。

`Comparator.comparing`接受一个函数，该函数从给定的类型中提取一个可比较的排序键，并返回一个通过该排序键进行比较的比较器。

`Comparator.comparing`有两种形式。

```java
static <T,U extends Comparable<? super U>> Comparator<T> comparing(Function<? super T,
        ? extends U> keyExtractor);

static <T,U> Comparator<T> comparing(Function<? super T,? extends U> keyExtractor,
        Comparator<? super U> keyComparator);
```

我们需要传递一个函数，它将从一个类型T中提取一个可比较的排序键，并返回一个通过该排序键进行比较的比较器。

我们需要传递一个函数和一个比较器。

该方法将从一个类型T中提取一个排序键，并返回一个比较器，使用指定的比较器对该排序键进行比较。

对于`int`、`long`和`double`数据类型的排序键，比较器分别有`comparingInt`、`comparingLong`和`comparingDouble`方法。

#### thenComparing

`thenComparing`是比较器功能接口的默认方法。

`Comparator.thenComparing`返回一个词表顺序(`lexicographic-order`)的比较器，该比较器被一个比较器实例调用，使用一组排序键对项目进行排序。

当这个比较器比较两个元素相等时，`thenComparing`方法决定了顺序。

我们可以多次使用`Comparator.thenComparing`。

当我们想通过排序键组来确定元素的顺序时，要用到它。

```java
default Comparator<T> thenComparing(Comparator<? super T> other);

default <U extends Comparable<? super U>> Comparator<T> thenComparing(Function<? super T,
        ? extends U> keyExtractor);
```

对于`int`、`long`和`double`数据类型的排序键，比较器分别有`thenComparingInt`、`thenComparingLong`和`thenComparingDouble`默认方法。

## 总结

总结一下`Comparable`和`Comparator`的使用和区别：

- `Comparable`是排序接口，若一个类实现了`Comparable`接口，就意味着“该类支持排序”。而`Comparator`是比较器，我们若需要控制某个类的次序，可以建立一个“该类的比较器”来进行排序。
- `Comparable`是`java.lang`包下的，而`Comparator`是`java.util`包下的。
- `Comparable`可以看做是内部比较器，而`Comparator`是外部比较器。
- `Comparable`是自然排序，`Comparator`是定制排序。
- 如果某个类没有实现`Comparable`接口，而该类本身是不支持排序的，那么我们就可以使用`Comparator`来进行定制排序。
- 或者我们自定义类实现了`Comparable`接口后，但是自定义类的代码不能再更改了，这时需要改变`compareTo(T o)`方法中排序的方式，此时也可以选择定制排序`Comparator`。

这两种方法各有优劣：某个类实现了`Comparable`接口后，在任何地方都可以比较大小，但是有时候需要修改其比较的方式，则需要修原有的代码。而用`Comparator`的好处就是不需要修改原有代码，而是另外实现一个比较器，当某个自定义的对象需要作比较的时候，把比较器和对象一起传递过去就可以比大小了，并且在`Comparator`里面用户可以自己实现复杂的可以通用的逻辑，使其可以匹配一些比较简单的对象，那样就可以节省很多重复劳动了。
