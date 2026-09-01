# 接口

## 概述

接口，是Java语言中一种引用类型，是方法的集合，如果说类的内部封装了成员变量、构造方法和成员方法。

那么接口的内部主要就是**封装了方法**，包含抽象方法（JDK 7及以前），默认方法和静态方法（JDK 8），私有方法（JDK 9）。 

接口的定义，它与定义类方式相似，但是使用 interface 关键字。它也会被编译成.class文件，但一定要明确它并 不是类，而是另外一种引用数据类型。 

接口的使用，它不能创建对象，但是可以被实现（ implements ，类似于被继承）。

一个实现接口的类（可以看做是接口的子类），需要实现接口中所有的抽象方法，创建该类对象，就可以调用方法了，否则它必须是一个抽象 类。

## 定义

```java
public interface 接口名称 {
    // 抽象方法
    // 默认方法
    // 静态方法
    // 私有方法 
}
```

### 含有抽象方法

抽象方法：使用 abstract 关键字修饰，可以省略，没有方法体。该方法供子类实现使用。

```java
public interface InterFaceName {
    public abstract void method(); 
}
```

### 含有默认方法和静态方法

默认方法：使用 default 修饰，不可省略，供子类调用或者子类重写。

静态方法：使用 static 修饰，供接口直接调用。

```java
public interface InterFaceName {
    public default void method() {
        // 执行语句 
    }
    public static void method2() {
        // 执行语句 
    } 
}
```

### 含有私有方法和私有静态方法

私有方法：使用 private 修饰，供接口中的默认方法或者静态方法调用。

```java
public interface InterFaceName {
    private void method() {
        // 执行语句 
    }
    private static void method2() {
        // 执行语句 
    } 
}
```

## 基本实现

类与接口的关系为实现关系，即**类实现接口**，该类可以称为接口的实现类，也可以称为接口的子类。

实现的动作类似继承，格式相仿，只是关键字不同，实现使用 `implements` 关键字。

非抽象子类实现接口：

1. 必须重写接口中所有抽象方法。

2. 继承了接口的默认方法，即可以直接调用，也可以重写。

```java
class 类名 implements 接口名 {
    // 重写接口中抽象方法【必须】 
    // 重写接口中默认方法【可选】 
}
```

### 抽象方法

必须全部实现

```java
public interface LiveAble {
    // 定义抽象方法 
    public abstract void eat();
    public abstract void sleep();
}

public class Animal implements LiveAble {
    @Override 
    public void eat() {
        System.out.println("吃东西"); 
    }
    @Override
    public void sleep() {
        System.out.println("晚上睡"); 
    } 
}

public static void main(String[] args) { 
    // 创建子类对象 
    Animal a = new Animal(); 
    // 调用实现后的方法 
    a.eat();
    a.sleep(); 
} 

// 输出
吃东西 晚上睡
```

### 默认方法

可以继承，可以重写，二选一，但是只能通过实现类的对象来调用。

继承默认方法

```java
public interface LiveAble {
    public default void fly(){
        System.out.println("天上飞"); 
    } 
}

public class Animal implements LiveAble {
    // 继承，什么都不用写，直接调用 
}

public static void main(String[] args) {
    // 创建子类对象 
    Animal a = new Animal(); 
    // 调用默认方法 
    a.fly();
}
```

重写默认方法

```java
public interface LiveAble {
    public default void fly(){
        System.out.println("天上飞");
    } 
}

public class Animal implements LiveAble {
    @Override
    public void fly() {
        System.out.println("自由自在的飞"); 
    } 
}

public static void main(String[] args) {
    // 创建子类对象
    Animal a = new Animal();
    // 调用重写方法 
    a.fly(); 
}

// 输出
自由自在的飞
```

### 静态方法的使用

**静态与.class 文件相关，只能使用接口名调用，不可以通过实现类的类名或者实现类的对象调用。**

```java
public interface LiveAble {
    public static void run(){
        System.out.println("跑起来~~~"); 
    } 
}

public class Animal implements LiveAble {
    // 无法重写静态方法 
}

public class InterfaceDemo {
    public static void main(String[] args) {
        //Animal.run(); // 【错误】无法继承方法,也无法调用 
        LiveAble.run();
    } 
}
// 输出
跑起来~~~
```

### 私有方法的使用

私有方法：只有默认方法可以调用。

私有静态方法：默认方法和静态方法可以调用。

如果一个接口中有多个默认方法，并且方法中有重复的内容，那么可以抽取出来，封装到私有方法中，供默认方法去调用。从设计的角度讲，私有的方法是对默认方法和静态方法的辅助。

```java
public interface LiveAble {
    default void func(){
        func1();
        func2();
    }
    private void func1(){
        System.out.println("跑起来~~~");
    }
    private void func2(){ 
        System.out.println("跑起来~~~");
    }
}
```

## 接口的多实现

在继承体系中，一个类只能继承一个父类。而对于接口而言，一个类是可以实现多个接口的，这叫做接口的**多实现**。

并且，一个类能继承一个父类，同时实现多个接口。

```java
class 类名 [extends 父类名] implements 接口名1,接口名2,接口名3... {
    // 重写接口中抽象方法【必须】
    // 重写接口中默认方法【不重名时可选】 
}
```

### 抽象方法

接口中，有多个抽象方法时，实现类必须重写所有抽象方法**。如果抽象方法有重名的，只需要重写一次。**代码如下：

```java
interface A {
    public abstract void showA();
    public abstract void show();
}
interface B {
    public abstract void showB();
    public abstract void show(); 
}

public class C implements A,B{
    @Override
    public void showA() {
        System.out.println("showA");
    }
    @Override 
    public void showB() {
        System.out.println("showB"); 
    }@Override 
    public void show() {
        System.out.println("show");
    } 
}
```

### 默认方法

接口中，有多个默认方法时，实现类都可继承使用。**如果默认方法有重名的，必须重写一次。**

```java
interface A {
    public default void methodA(){}
    public default void method(){}
}
interface B {
    public default void methodB(){}
    public default void method(){} 
}

public class C implements A,B{
    @Override 
    public void method() {
        System.out.println("method"); 
    } 
}
```

### 静态方法

接口中，存在同名的静态方法并不会冲突，原因是只能通过各自接口名访问静态方法。

**优先级的问题：**

当一个类，既继承一个父类，又实现若干个接口时，父类中的成员方法与接口中的默认方法重名，子类就近选择执行父类的成员方法。

```java
interface A {
    public default void methodA(){
        System.out.println("AAAAAAAAAAAA"); 
    } 
}

class D {
    public void methodA(){
        System.out.println("DDDDDDDDDDDD"); 
    } 
}

class C extends D implements A {
    // 未重写methodA方法 
}


public static void main(String[] args) { 
    C c = new C(); c.methodA(); 
} 

// 输出
DDDDDDDDDDDD
```

## 接口的多继承

一个接口能继承另一个或者多个接口，这和类之间的继承比较相似。接口的继承使用 extends 关键字，子接口继

承父接口的方法。**如果父接口中的默认方法有重名的，那么子接口需要重写一次。**

```java
interface A {
    public default void method(){
        System.out.println("AAAAAAAAAAAAAAAAAAA"); 
    } 
}

interface B {
    public default void method(){
        System.out.println("BBBBBBBBBBBBBBBBBBB"); 
    } 
}

interface D extends A,B{
    @Override
    public default void method() {
        System.out.println("DDDDDDDDDDDDDD"); 
    } 
}
```

>子接口重写默认方法时，default关键字可以保留。
>
>子类重写默认方法时，default关键字不可以保留。

## 其他成员特点

- 接口中，无法定义成员变量，但是可以定义常量，其值不可以改变，默认使用public static final修饰。
- 接口中，没有构造方法，不能创建对象。
- 接口中，没有静态代码块。
