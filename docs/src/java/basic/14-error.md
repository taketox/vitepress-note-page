# 异常

## 概览

在Java程序中经常会出现两种问题，一种是`java.lang.Exception`，一种是`java.lang.Error`，都用来表示出现了异常情况。

`java.Lang.Throwable`：类是Java语言中所有错误或异常的超类。

`Exception`：编译期异常，进行编译（写代码）java程序出现的问题

`RuntimeException`：运行期异常，java程序运行过程中出现的问题

> 异常就相当于程序得了一个小毛病（感冒，发烧），把异常处理掉，程序可以继续执行（吃点药，继续革命工作）

`Error`：错误

错误就相当于程序得了一个无法治煎的毛病（非典，艾滋），必须修改源代码，程序才能继续执行。

`Error`用来表示 JVM 无法处理的错误，Exception 分为两种：

受检异常 ：需要用 try...catch... 语句捕获并进行处理，并且可以从异常中恢复;

非受检异常 ：是程序运行时错误，例如除 0 会引发 Arithmetic Exception，此时程序崩溃并且无法恢复。

## Throwable

Throwable类是Java语言中所有`错误(errors)`和异常`(exceptions)`的父类。只有继承于Throwable的类或者其子类才能够被抛出，还有一种方式是带有Java中的`@throw`注解的类也可以抛出。

Exception位于`java.lang`包下，它是一种顶级接口，继承于Throwable类，Exception类及其子类都是Throwable的组成条件，是程序出现的合理情况。

在Java规范中

> The *unchecked exception classes* are the run-time exception classes and the error classes.
>
> The *checked exception classes* are all exception classes other than the unchecked exception classes. That is, the checked exception classes are Throwable and all its subclasses other than RuntimeException and its subclasses and Error and its subclasses.

也就是说，除了`RuntimeException`和其子类，以及error和其子类，其它的所有异常都是`checkedException`。

![An image](/img/java/base/01.png)

Throwable类中常用的属性和方法

```java
// 返回抛出异常的详细信息
public string getMessage();
public string getLocalizedMessage();
// 返回异常发生时的简要描述
public public String toString();

// 打印异常信息到标准输出流上
public void printStackTrace();
public void printStackTrace(PrintStream s);
public void printStackTrace(PrintWriter s)
// 记录栈帧的当前状态
public synchronized Throwable fillInStackTrace();
```

此外，因为Throwable的父类也是Object,所以常用的方法还有继承其父类的getClass()和getName()方法。

## 常见的Exception

下面我们回到Exception的探讨上来，现在你知道了Exception的父类是Throwable，并且Exception有两种异常，一种是`RuntimeException`；一种是`CheckedException`，**这两种异常都应该去捕获**。

下面列出了一些Java中常见的异常及其分类

### RuntimeException

| 异常名称                       | 异常描述         |
| ------------------------------ | ---------------- |
| ArraylndexOutOfBoundsException | 数组越界异常     |
| NullPointerException           | 空指针异常       |
| lllegalArgumentException       | 非法参数异常     |
| NegativeArraySizeException     | 数组长度为负异常 |
| lllegalStateException          | 非法状态异常     |
| ClassCastException             | 类型转换异常     |

### CheckedException

| 异常名称               | 异常描述                         |
| ---------------------- | -------------------------------- |
| NoSuchFieldException   | 表示该类没有指定名称抛出来的异常 |
| NoSuchMethodException  | 表示该类没有指定方法抛出来的异常 |
| lllegalAccessException | 不允许访问某个类的异常           |
| ClassNotFoundException | 类没有找到抛出异常               |

## Exception相关的关键字

在Java中有这几个关键字throws、throw、try、finally、catch

### throw

作用：可以使用throw关键字在指定的方法中出指定的异常

使用格式：

```java
throw new xxxException("异常产生的原因");
```

注意：

> throw关键字必须写在方法的内部
>
> throw关键字后边new的对象必须是Exception或者Exception的子类对象

### throws

作用：编译时异常当方法内部抛出异常对象的时候，那么我们就必须处理这个异常对象。

可以使用throws关键字处理异常对象，会把异常对象声明抛出给方法的调用者处理（自己不处理，给别人处理），最终交给JVM处理-->中断处理。

使用格式：

```java
修饰符 返回值类型 方法名（参数列表）throws AAAExcepiton,BBBExcepiton... {
    throw new AAAExcepiton("产生原因");
    throw new BBBExcepiton("产生原因");
    ...
}
```

注意：

1. throws关键字必须写在方法声处

2. throws关键字后边声明的异常必须是Exception或者是Exception的子类

3. 方法内部如果抛出了多个异常对象，那么throws,后边必须也声明多个异常，如果抛出的多个异常对象有子父类关系，那么直接声明父类异常即可。

4. 调用了一个声明出异常的方法，我们就必须的处理声明的异常。要么继续使用throws声明出，交给方法的调用者处理，最终交给JVM。要么try...catch自己处理异常。

### try、finally和catch

这三个关键字主要有下面几种组合方式try...catch、try...finally、try...catch...finally。

try...catch表示对某一段代码可能抛出异常进行的捕获

```java
static void cacheException() throws Exception{
    try {
        System.out.println("1");
    }catch (Exception e){
        e.printStackTrace();
    }
}
```

try...finally表示对一段代码不管执行情况如何，都会走finally中的代码

```java
static void cacheException() throws Exception{
    for (int i = 0; i < 5; i++) {
        System.out.println("enter: i=" + i);
        try {
            System.out.println("execute: i=" + i);
            continue;
        } finally {
            System.out.println("leave: i=" + i);
        }
    }
}
```

try...catch...finally也是一样的，表示对异常捕获后，再走finally中的代码逻辑。

## 自定义异常类

java提供的异常类，不够我们使用，需要自己定义一些异常类

格式：

```java
public class XXXExcepiton extends Exception RuntimeException{
    添加一个空参数的构造方法
    添加一个带异常信息的构造方法
}
```

注意：

1. 自定义异常类一般都是以Exception结尾，说明该类是一个异常类。

2. 自定义异常类，必须的继承Exceptiong或者RuntimeException。

**继承Exception**：那么自定义的异常类就是一个编译期异常，如果方法内部抛出了编译期异常，就必须处理这个异常，要么throws,要么try...catch。

**继承RuntimeException**：那么自定义的异常类就是一个运行期异常，无需处理，交给虚拟机处理（中断处理）。

示例：

```java
public class RegisterException extends Exception {
    //添加一个空参数的构造方法
    public RegisterException() {
        super();
    }
    /*添加一个带异常信息的构造方法
    查看源码发现，所有的异常类都会有一个带异常信息的构造方法，
    方法内部会调用父类带异常信息的构造方法，让父类来处理这个异常信息
    */
    public RegisterException(String message){ 
        super(message);
    }
}
```

## Error

Error是程序无法处理的错误，表示运行应用程序中较严重问题。大多数错误与代码编写者执行的操作无关，而表示代码运行时JVM(Jva虚拟机)出现的问题。这些错误是不可检查的，因为它们在应用程序的控制和处理能力之外，而且绝大多数是程序运行时不允许出现的状况，比如`OutOfMemoryError`和`StackOverflowError`异常的出现会有几种情况。

![An image](/img/java/base/02.png)

其中包括两部分，由所有线程共享的数据区和线程隔离的数据区组成，在上面的Java内存模型中，只有程序计数器是不会发生`OutofMemoryError`情况的区域，程序计数器控制着计算机指令的分支、循环、跳转、异常处理和线程恢复，并且程序计数器是每个线程私有的。

> 线程私有：表示的就是各条线程之间互不影响，独立存储的内存区域。

如果应用程序执行的是Java方法，那么这个计数器记录的就是虚拟机字节码指令的地址；如果正在执行的是Native方法，这个计数器值则为空(Undefined)。

除了程序计数器外，其他区域：方法区(Method Area)、虚拟机栈(VM Stack)、本地方法栈(Native Method Stack)和堆(Heap)都是可能发生`OutOfMemoryError`的区域。

- 虚拟机栈：如果线程请求的栈深度大于虚拟机栈所允许的深度，将会出现`StackOverflowError`异常；如果虚拟机动态扩展无法申请到足够的内存，将出现`OutOfMemoryError`。
- 本地方法栈和虚拟机栈一样
- 堆：Java堆可以处于物理上不连续，逻辑上连续，就像我们的磁盘空间一样，如果堆中没有内存完成实例分配，并且堆无法扩展时，将会抛出`OutOfMemoryError`。
- 方法区：方法区无法满足内存分配需求时，将抛出`OutOfMemoryError`异常。
