# 内部类

Java 类中不仅可以定义变量和方法，还可以定义类，这样定义在类内部的类就被称为内部类。

根据定义的方式不同，内部类分为**静态内部类，成员内部类，局部内部类，匿名内部类**四种。

## 概述

将一个类A定义在另一个类B里面，里面的那个类A就称为**内部类**，B则称为**外部类**。

## 静态内部类

定义在类内部的静态类，就是静态内部类。

```java
public class Out {
    private static int a;
    private int b;
    public static class Inner {
        public void print() {
            System.out.println(a);
        }
    }
}
```

1. 静态内部类可以访问外部类所有的静态变量和方法，即使是 private 的也一样。

2. 静态内部类和一般类一致，可以定义静态变量、方法，构造方法等。

3. 其它类使用静态内部类需要使用“外部类.静态内部类”方式，如下所示：

    ```java
    Out.Inner inner = new Out.Inner();inner.print();
    ```

4. Java集合类`HashMap`内部就有一个静态内部类Entry。Entry是`HashMap`存放元素的抽象，`HashMap` 内部维护 Entry 数组用了存放元素，但是 Entry 对使用者是透明的。像这种和外部类关系密切的，且不依赖外部类实例的，都可以使用静态内部类。

## 成员内部类

定义在类内部的非静态类，就是成员内部类。**成员内部类不能定义静态方法和变量（final 修饰的除外）**。

这是因为成员内部类是非静态的，类初始化的时候先初始化静态成员，如果允许成员内部类定义静态变量，那么成员内部类的静态变量初始化顺序是有歧义的。

```java
class 外部类 {
    class 内部类{
    }
}
```

在描述事物时，若一个事物内部还包含其他事物，就可以使用内部类这种结构。

### 访问特点

- 内部类可以直接访问外部类的成员，包括私有成员。
- 外部类要访问内部类的成员，必须要建立内部类的对象。

创建内部类对象格式

```java
外部类名.内部类名 对象名 = new 外部类型().new 内部类型()；
```

访问演示

```java
public class Person {
    private boolean live = true;
    
    class Heart {
        public void jump() {
            // 直接访问外部类成员
            if (live) {
                System.out.println("心脏在跳动"); 
            } else {
                System.out.println("心脏不跳了"); 
            } 
        }
    }
    
    public boolean isLive() {
        return live;
    }
    
    public void setLive(boolean live) {
        this.live = live;
    } 
}

public static void main(String[] args) {
    // 创建外部类对象
    Person p = new Person();
    // 创建内部类对象
    Heart heart = p.new Heart();
    // 调用内部类方法 
    heart.jump();
    // 调用外部类方法
    p.setLive(false);
    // 调用内部类方法 
    heart.jump();
}
// 输出
心脏在跳动
心脏不跳了
```

>内部类仍然是一个独立的类，在编译之后会内部类会被编译成独立的.class文件，但是前面冠以外部类的类名和$符号 。
>
>比如，Person$Heart.class

## 局部内部类

**局部内部类**：定义在方法中的类，就是局部内部类。"局部"：只有当前所属的方法才能使用它，出了这个方法外面就不能用了。

定义：

```java
修饰符 class 外部类名称{
    修饰符 返回值类型 外部类方法名称 (参数列表){
        class 局部内部类名称{
            // ...
        }
    }
}
```

示例：

```java
public class Out {
    private static int a;
    private int b;
    
    public void test(final int c) {
        final int d = 1;
        class Inner {
            public void print() {
                System.out.println(c);
            }
        }
    }
}
```

局部内部类，如果希望访问所在方法的局部变量，那么这个变量必须是【有效final的】。

从Java8开始，只要局部变量事实不变，那么final关键字可以省略。

示例：

```java
public class MyOuter{
    public void methodOuter(){
        //所在方法的局部变量
        int num=10;
        class MyInner{
            public void methodInner()
            System.out.println(num);
        }
    }
}
```

**为什么局部内部类在访问所在方法的局部变量是必须是有效final的？**

因为生命周期不一致，局部变量和方法一样在栈内存中，运行结束立刻出栈（消失）。new出来的对象会在堆当中持续存在，如果对象存在，局部变量已经消失，就会导致对象无法访问局部变量。所以局部变量必须事实不变，即使消失，对象还可以问局部变量的"copy"。

方法结束，方法里new出来的对象还是存在的。方法运行在栈中，运行时new出来的对象会在堆中持续存在，方法运行完之后会出栈，但是已经创建的对象不会在堆中消失

## 匿名内部类

如果接口的实现类（或者是父类的子类）只需要使用唯一的一次。那么这种情祝下就可以省略掉该类的定义，而改为使用【匿名内部类】。

使用匿名内部类，就不需要在单独创建一个实现类impl来调用接口。

### 概述

**匿名内部类**：是内部类的简化写法。它的本质是一个**带具体实现的父类或者父接口的匿名的子类对象**。

开发中，最常用到的内部类就是匿名内部类了。

1. 定义子类

2. 重写接口中的方法

3. 创建子类对象

4. 调用重写后的方法

**前提**：匿名内部类必须**继承一个父类**或者**实现一个父接口**。

### 格式

```java
new 父类名或者接口名(){
    // 方法重写
    @Override 
    public void method() {
        // 执行语句 
    } 
};
```

### 使用

创建匿名内部类，并调用：

```java
public abstract class FlyAble{
    public abstract void fly(); 
}

public static void main(String[] args) {
    //1.等号右边:是匿名内部类，定义并创建该接口的子类对象 
    //2.等号左边:是多态赋值,接口类型引用指向子类对象
    FlyAble f = new FlyAble(){
        public void fly() {
            System.out.println("我飞了~~~"); 
        } 
    };
    //调用 fly方法,执行重写后的方法 
    f.fly(); 
}
```

通常在方法的形式参数是接口或者抽象类时，也可以将匿名内部类作为参数传递。代码如下：

```java
// 使用形式二
public static void showFly(FlyAble f) {
    f.fly();
}

// 创建匿名内部类后传递匿名对象
public static void main(String[] args) {
    // 1.等号右边:定义并创建该接口的子类对象
    // 2.等号左边:是多态,接口类型引用指向子类对象
    FlyAble f = new FlyAble(){
        public void fly() {
            System.out.println("我飞了~~~"); 
        } 
    };
    // 将f传递给showFly方法中 
    showFly(f); 
}
```

以上两步，也可以简化为一步

```java
// 创建匿名内部类,直接传递给showFly
public static void main(String[] args) {
    // 创建匿名内部类,直接传递给showFly(FlyAble f)
    showFly( 
        new FlyAble(){
            public void fly() {
                System.out.println("我飞了~~~"); 
            } 
    }); 
}
```

对格式`new接口名称(){...}`进行解析：

1. new代表创建对象的动作

2. 接口名称就是匿名内部类需要实现哪个接口

3. {...}这才是匿名内部类的内容

另外还要注意几点问题：

1. 匿名内部类，在【创建对象】的时候，只能使用唯一一次。如果希望多次创建对象，而且类的内容一样的话，那么就必须使用单独定义的实现类了。

2. 匿名对象，在【调用方法】的时候，只能调用唯一一次。如果希望同一个对象，调用多次方法，那么必须给对象起个名字。

3. 匿名内部类是省略了【实现类/子类名称】，但是匿名对象是省略了【对象名称】

强调：匿名内部类和匿名对象不是一回事！！！使用了匿名内部类，而且省略了对象名称，也是匿名对象
