# 枚举

在Java中，枚举（Enumeration）是一种特殊的数据类型，用于定义一组具有固定值的常量。Java的枚举与其他编程语言中的枚举类似，但它们在语法上略有不同。

## 基本使用

1. 定义枚举类型：在Java中，可以通过使用`enum`关键字来定义一个枚举类型。

   例如，定义一个表示星期几的枚举类型：

    ```java
    package com.java.enumTest;

    public enum Weekday {
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY,
        SUNDAY
    }
    ```

    > 赋予枚举常量有意义的名称：在上述例子中，我们为每个星期赋予了有意义的名称，使用大写字母命名，这是Java中枚举常量的命名约定。

2. 使用枚举常量：一旦定义了枚举类型，你可以在程序中使用它们来表示相关的常量。

    ```java
    package com.java.enumTest;

    public class Main {
        public static void main(String[] args) {
            Weekday today = Weekday.SUNDAY;
            
            if (today == Weekday.SUNDAY) {
                System.out.println("It's SUNDAY, time to party!");
            } else {
                System.out.println("It's not SUNDAY, just a regular day.");
            }
        }
    }
    ```

    > 在上面的示例中，我们声明了一个`Weekday`类型的变量`today`，并将其赋值为`Weekday.TUESDAY`。然后，我们可以使用`if`语句检查`today`的值是否为`Weekday.FRIDAY`，从而输出不同的消息。

3. 遍历枚举类型：在Java中，可以使用增强型的`for`循环来遍历枚举类型的所有常量

```java
package com.java.enumTest;

public class Main {
    public static void main(String[] args) {
        for (Weekday day : Weekday.values()) {
            System.out.println("day is " + day);
        }
    }
}
```

> 使用`Weekday.values()`可以获取`Weekday`枚举类型的所有常量，并通过增强型`for`循环遍历输出每个常量的值。

总结：在Java中，枚举是一种特殊的数据类型，用于定义一组具有固定值的常量。通过为每个常量赋予有意义的名称，枚举可以使代码更具可读性和可维护性。

## 枚举是如何实现的

在Java中，枚举是通过特殊的类来实现的。在Java 5及以后的版本中，引入了枚举类型（Enumeration type）的支持，使得创建和使用枚举变得更加简单和安全。

Java中枚举的实现方式：

1. 使用`enum`关键字：在Java中，你可以使用`enum`关键字来定义一个枚举类型。当你使用`enum`定义枚举时，实际上你在创建一个类，并且编译器会自动添加一些特性，以确保该类是一个枚举类型。
2. 预定义枚举常量：在枚举内部，你可以列出枚举常量。每个枚举常量都是该枚举类型的一个实例，并且是这个枚举类的对象。这些枚举常量通常用大写字母表示，**并以逗号分隔**。
3. 自动添加构造函数：编译器会自动为枚举常量添加构造函数，以便在定义枚举常量时传递参数。
4. 自动添加方法：编译器会自动添加一些有用的方法，例如`values()`方法用于返回枚举常量数组，`valueOf()`方法用于将字符串转换为对应的枚举常量。

```java
package com.java.enumTest;

enum Weekday {
    MONDAY("Start of the workweek"),
    TUESDAY("Second workday"),
    WEDNESDAY("Midweek"),
    THURSDAY("Almost there"),
    FRIDAY("End of the workweek"),
    SATURDAY("Weekend"),
    SUNDAY("Weekend");

    private final String description;

    Weekday(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

> 我们定义了一个枚举类型`Weekday`，它有七个枚举常量，每个常量都有一个相关的描述。编译器会自动生成构造函数和`values()`方法，使得我们可以轻松地遍历所有枚举常量并获取它们的描述。

## 枚举如何比较

在Java中，枚举的比较可以使用普通的比较运算符（例如`==`和`equals()`方法）进行。由于枚举常量是单例的，因此可以使用这些方法来比较枚举常量的值或引用。

```java
enum Color {
    RED, GREEN, BLUE
}
```

### ==运算符

在Java中，`==`运算符用于比较两个对象的引用是否相等，对于枚举常量来说也是如此。

```java
public static void main(String[] args) {
    Color color1 = Color.RED;
    Color color2 = Color.RED;
    Color color3 = Color.GREEN;

    System.out.println(color1 == color2); // true
    System.out.println(color1 == color3); // false
}
```

> 如果两个枚举常量是同一个对象的引用，它们将被认为是相等的。在上面的例子中，`color1`和`color2`都是`Color.RED`枚举常量的引用，因此它们相等。然而，`color1`和`color3`是不同枚举常量的引用，因此它们不相等。

### equals()方法

枚举类默认继承自`java.lang.Enum`，而`java.lang.Enum`类已经实现了`equals()`方法，用于比较枚举常量。

与`==`运算符不同，`equals()`方法将比较枚举常量的值是否相等。

```java
public static void main(String[] args) {
    Color color1 = Color.RED;
    Color color2 = Color.RED;
    Color color3 = Color.GREEN;

    System.out.println(color1.equals(color2)); // true
    System.out.println(color1.equals(color3)); // false
}
```

> 在上述示例中，`color1`和`color2`都是`Color.RED`枚举常量的引用，因此它们的值相等，`equals()`方法返回`true`。然而，`color1`和`color3`是不同枚举常量，它们的值不相等，`equals()`方法返回`false`。

在Java中，枚举的比较可以使用`==`运算符来比较枚举常量的引用是否相等，以及使用`equals()`方法来比较枚举常量的值是否相等。对于枚举常量来说，比较通常应该使用`equals()`方法，以便进行值的比较。

## switch使用枚举

在Java中，`switch`语句对枚举的支持是非常好的。Java从JDK 7开始，对`switch`语句进行了改进，使其可以支持枚举类型作为`switch`表达式的一种选项。

在使用`switch`语句处理枚举类型时，可以直接在`switch`表达式中使用枚举常量，而无需在每个`case`中使用枚举类型的名称。这使得代码更简洁、更易读。

```java
enum DayOfWeek {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

public static void main(String[] args) {
    DayOfWeek today = DayOfWeek.WEDNESDAY;

    switch (today) {
        case MONDAY:
            System.out.println("It's Monday.");
            break;
        case TUESDAY:
            System.out.println("It's Tuesday.");
            break;
        case WEDNESDAY:
            System.out.println("It's Wednesday.");
            break;
        case THURSDAY:
            System.out.println("It's Thursday.");
            break;
        case FRIDAY:
            System.out.println("It's Friday.");
            break;
        case SATURDAY:
            System.out.println("It's Saturday.");
            break;
        case SUNDAY:
            System.out.println("It's Sunday.");
            break;
        default:
            System.out.println("Invalid day.");
    }
}
```

我们把鼠标移到case上，你会发现`MONDAY`显示来源于`com.java.enumTest.switchTest.DayOfWeek`。

我们原本要使用`MONDAY`，只能通过 `DayOfWeek.MONDAY`,但是在`switch`里它却可以自己识别。

**其实在`switch`语句中，我们直接使用了枚举常量（如`MONDAY`、`TUESDAY`等），而无需再使用`DayOfWeek.MONDAY`、`DayOfWeek.TUESDAY`等。这是Java对枚举类型的改进，使得`switch`语句更加简洁和易用。**

## 枚举与单例

为什么说枚举是实现单例最好的方式？

接下来，我们用枚举来实现单例，先创建一个枚举：

```java
enum Singleton {
    INSTANCE;

    public void output() {
        System.out.println("调用的单例方法");
    }
}
```

> 为什么要这么写呢？因为枚举在类加载的时候会被初始化，哪怕是多线程的环境下，它的实例只会被加载一次，因此对于枚举的操作，是线程安全的。

在Java语言规范中明确指定了枚举的初始化是线程安全的，这意味着多个线程在访问枚举类的时候不会出现竞争条件。

枚举还不能被反射机制创建，防止住了反射攻击，而且枚举默认实现了`Serializable`，因此在序列化和反序列化过程中保证了一致性。因此，无论多少线程并发访问枚举常量，都不会破坏单例模式的唯一性和线程安全性。

```java
public static void main(String[] args) {
    Singleton instance1 = Singleton.INSTANCE;
    Singleton instance2 = Singleton.INSTANCE;

    // 输出为 "true"
    System.out.println(instance1 == instance2);

    instance1.output(); // 输出: "调用的单例方法"
}
```

在多线程情况下

```java
enum Singleton {
    INSTANCE;

    // 添加一些逻辑
    private int value;

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}

public static void main(String[] args) {
    // 线程1创建并使用单例
    Thread thread1 = new Thread(() -> {
        Singleton instance = Singleton.INSTANCE;
        instance.setValue(42);
        System.out.println(Thread.currentThread().getName() + ": " + instance.getValue());
    });

    // 线程2创建并使用单例
    Thread thread2 = new Thread(() -> {
        Singleton instance = Singleton.INSTANCE;
        instance.setValue(99);
        System.out.println(Thread.currentThread().getName() + ": " + instance.getValue());
    });

    thread1.start();
    thread2.start();
}
// 输出
Thread-0：42
Thread-1：42
```

> 这个输出说明了在多线程环境下，两个线程都共享同一个`Singleton.INSTANCE`实例，并且它们的输出值是相同的。

枚举之所以被认为是实现单例模式的最好方式，主要有以下几个原因：

1. 线程安全：枚举在Java中是线程安全的。在多线程环境下，枚举的实例只会被加载一次，并且是在类加载阶段进行初始化，保证了线程安全。
2. 防止反射攻击：枚举在Java中具有天然的反射安全性。即使使用反射机制尝试创建新的枚举实例，也会导致`IllegalArgumentException`异常，从而防止了反射攻击。
3. 防止序列化问题：枚举默认实现了`java.io.Serializable`接口，因此在序列化和反序列化过程中保证了单例的一致性。
4. 简洁性和可读性：使用枚举来实现单例模式更加简洁，无需编写复杂的单例模式的代码，也无需考虑线程安全等问题。同时，枚举常量的名称本身就是单例的实例，使代码更加易读和易懂。

## 枚举的序列化实现

在Java中，枚举的序列化是由Java编译器和Java运行时库自动处理的。Java的枚举默认实现了`java.io.Serializable`接口，这意味着枚举类型的实例可以被序列化和反序列化。

当你将一个枚举类型的实例写入到输出流中（例如文件、网络等），或从输入流中读取枚举实例时，Java运行时库会负责将枚举实例转换为其序列化的表示形式，并在反序列化时将其还原为原始的枚举常量。

```java
package com.java.Serializable;
import java.io.*;

enum Color {
    RED, GREEN, BLUE
}


public static void main(String[] args) {
    // 序列化枚举实例到文件
    try (ObjectOutputStream outputStream = new ObjectOutputStream(new FileOutputStream("color.ser"))) {
        Color color = Color.GREEN;
        outputStream.writeObject(color);
        System.out.println("Serialized: " + color);
    } catch (IOException e) {
        e.printStackTrace();
    }

    // 反序列化枚举实例
    try (ObjectInputStream inputStream = new ObjectInputStream(new FileInputStream("color.ser"))) {
        Color color = (Color) inputStream.readObject();
        System.out.println("Deserialized: " + color);
    } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
    }
}

// 输出
Serialized: GREEN
Deserialized: GREEN
```

> 从代码可知，我们将枚举常量`Color.GREEN`序列化到文件`color.ser`中，然后再从文件中反序列化得到一个新的枚举实例。通过序列化和反序列化过程，枚举常量的值得到了正确的保持。

枚举的序列化是由Java运行时库自动处理的。枚举默认实现了`java.io.Serializable`接口，这使得枚举类型的实例可以轻松地进行序列化和反序列化。

在进行序列化时，枚举实例被转换为其序列化的表示形式，反序列化时将其还原为原始的枚举常量。这使得枚举在分布式系统中的传输和存储变得更加方便。

## 总结

1. 枚举是一种特殊的类：在Java中，枚举是一种特殊的类，使用`enum`关键字定义。它允许你创建一组固定的常量，这些常量在整个程序中保持不变。
2. 枚举常量：在枚举内部，你可以列出枚举常量。每个枚举常量是该枚举类型的一个实例，并且是这个枚举类的对象。
3. 枚举的属性和方法：你可以在枚举中定义属性和方法，使枚举常量更具有表现力和功能性。
4. 枚举的用途：枚举常用于表示一组相关的常量，例如表示一周中的每一天、颜色、状态等。
5. 枚举的比较：在Java中，枚举的比较可以使用`==`运算符来比较枚举常量的引用是否相等，也可以使用`equals()`方法来比较枚举常量的值是否相等。
6. 枚举和`switch`语句：Java的`switch`语句对枚举有很好的支持，你可以直接在`switch`表达式中使用枚举常量，使得代码更加简洁易读。
7. 枚举实现单例模式：枚举是实现单例模式最好的方式之一，因为它天然保证了线程安全、反射安全和序列化安全，且代码简洁易读。
8. 枚举的序列化：枚举默认实现了`java.io.Serializable`接口，这使得枚举类型的实例可以轻松地进行序列化和反序列化。
