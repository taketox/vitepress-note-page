# 关键字

## 权限修饰符

### 概述

在Java中提供了四种访问权限，使用不同的访问权限修饰符修饰时，被修饰的内容会有不同的访问权限。

- public：公共的
- protected：受保护的
- default：默认的
- private：私有的

### 不同权限的访问能力

|          | public | protected | default | private |
| -------- | ------ | --------- | ------- | ------- |
| 同一个类 | √      | √         | √       | √       |
| 同一个包 | √      | √         | √       |         |
| 子父类   | √      | √         |         |         |
| 不同包   | √      |           |         |         |

**由此可见，public具有最大权限。private则是最小权限。**

编写代码时，如果没有特殊的考虑，建议这样使用权限：

- 成员变量使用 private ，隐藏细节。
- 构造方法使用 public ，方便创建对象。
- 成员方法使用 public ，方便调用方法。

> 不加权限修饰符，其访问能力与default修饰符相同

## final

### 概述

子类继承父类后，子类可以在父类的基础上改写父类内容，比如，方法重写。那么我们能不能随意的继承 API中提供的类，改写其内容呢？显然这是不合适的。

为了避免这种随意改写的情况，Java提供了 final 关键字， 用于修饰不可改变内容

**final**： 不可改变。可以用于修饰类、方法和变量。

- 类：被修饰的类，不能被继承。
- 方法：被修饰的方法，不能被重写。
- 变量：被修饰的变量，不能被重新赋值。

### 使用

#### 修饰类

```java
final class 类名 {
    
}
```

#### 修饰方法

```java
修饰符 final 返回值类型 方法名(参数列表){
    //方法体 
}
```

重写被 final 修饰的方法，编译时就会报错。

#### 局部变量——基本类型

基本类型的局部变量，被`final`修饰后，只能赋值一次，不能再更改。

```java
public static void main(String[] args) { 
    // 声明变量，使用final修饰 
    final int a; 
    // 第一次赋值 
    a = 10;
    // 第二次赋值
    a = 20; // 报错,不可重新赋值 
    
    // 声明变量，直接赋值，使用final修饰 
    final int b = 10; 
    // 第二次赋值 
    b = 20; // 报错,不可重新赋值
}
```

#### 局部变量——引用类型

引用类型的局部变量，被`final`修饰后，只能指向一个对象，地址不能再更改。但是不影响对象内部的成员变量值的修改。

```java
public static void main(String[] args) {
    // 创建 User 对象
    final User u = new User();
    // 创建 另一个 User对象
    u = new User();// 报错，指向了新的对象，地址值改变。 
    // 调用setName方法
    u.setName("张三"); // 可以修改 
}
```

#### 成员变量

成员变量涉及到初始化的问题，初始化方式有两种，只能二选一

**显示初始化：**

```java
public class User {
    final String USERNAME = "张三"; 
    private int age; 
}
```

**构造方法初始化：**

```java
public class User {
    final String USERNAME;
    private int age;
    
    public User(String username, int age) {
        this.USERNAME = username; 
        this.age = age; 
    } 
}
```

> 被final修饰的常量名称，一般都有书写规范，所有字母都**大写**

## static

### 概述

关于 `static` 关键字的使用，它可以用来修饰的成员变量和成员方法，被修饰的成员是**属于类**的，而不是单单是属于某个对象的。

也就是说，既然属于类，就可以不靠创建对象来调用了。

`static`修饰的内容：

- 是随着类的加载而加载的，且只加载一次。
- 存储于一块固定的内存区域（静态区），所以，可以直接被类名调用。
- 它优先于对象存在，所以可以被所有对象共享。

### 使用

#### 静态变量

静态变量：⼜称为类变量，**也就是说这个变量属于类的，类所有的实例都共享静态变量，可以直接通过类名来访问它**。静态变量在内存中只存在⼀份。

实例变量：每创建⼀个实例就会产生⼀个实例变量，它与该实例同生共死。

定义格式：

```java
static 数据类型 变量名；
```

示例：

```java
public class A {
    private int x; // 实例变量
    private static int y; // 静态变量
    public static void main(String[] args) {
        A a = new A();
        int x = a.x;
        // 通过类名访问
        int y = A.y;
    }
}
```

#### 静态方法

当 `static` 修饰成员方法时，该方法称为**类方法** 。静态方法在声明中有 static ，建议使用类名来调用，而不需要创建类的对象。

定义格式：

```java
修饰符 static 返回值类型 方法名 (参数列表){
    // 执行语句 
}
```

示例：

```java
public abstract class A {
    public static void func1(){
    }
    // public abstract static void func2();
    // abstract 和 static 不能同时出现
}
```

**注意事项** ：

- 静态方法可以直接访问类变量和静态方法。
- 静态方法**不能直接访问**普通成员变量或成员方法。反之，成员方法可以直接访问类变量或静态方法。
- 静态方法中，不能使用**this**关键字。

> 静态方法只能访问所属类的静态字段和静态方法
>
> 方法中不能有 this 和 super 关键字，因此这两个关键字与具体对象关联。

#### 静态代码块

静态代码块在类初始化时运行⼀次。

```java
public class A {
    static {
        System.out.println("123");
    }
    public static void main(String[] args) {
        A a1 = new A();
        A a2 = new A();
    }
}
// 输出
123
```

#### 静态内部类

非静态内部类依赖于外部类的实例，也就是说需要先创建外部类实例，才能用这个实例去创建非静态内部类。⽽静态内部类不需要。

```java
public class OuterClass {
    class InnerClass {
    }
    
    static class StaticInnerClass {
    }
    
    public static void main(String[] args) {
        // 无法从静态上下文中引用
        // InnerClass innerClass = new InnerClass(); // 'OuterClass.this'

        OuterClass outerClass = new OuterClass();
        InnerClass innerClass = outerClass.new InnerClass();
        StaticInnerClass staticInnerClass = new StaticInnerClass();
    }
}
```

> 静态内部类不能访问外部类的非静态的变量和方法。

#### 静态导包

在使用静态变量和方法时不用再指明 `ClassName`，从⽽简化代码，但可读性大大降低。

```java
import static com.xxx.ClassName.*
```

#### 初始化顺序

静态变量和静态语句块优先于实例变量和普通语句块，静态变量和静态语句块的初始化顺序取决于它们在代码中的顺序。

```java
// 静态变量 >> 静态语句块 >> 实例变量 >> 普通语句块 >> 构造函数

public static String staticField = "静态变量";

static {
    System.out.println("静态语句块");
}

public String field = "实例变量";

{
    System.out.println("普通语句块");
}

public InitialOrderTest() {
    System.out.println("构造函数");
}
```

存在继承的情况下，初始化顺序为：

- ⽗类（静态变量、静态语句块）
- ⼦类（静态变量、静态语句块）
- ⽗类（实例变量、普通语句块）
- ⽗类（构造函数）
- ⼦类（实例变量、普通语句块）
- ⼦类（构造函数）

## this

### 概述

this 是用来访问本类实例属性和方法的，它会先从本类中找，如果本类中找不到则在父类中找。

this 最常见的用法是用来赋值本类属性的，比如常见的 setter 方法

```java
class Person {
    private String name;
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
}
public class ThisExample {
    public static void main(String[] args) {
        Person p = new Person();
        p.setName("zz");
        System.out.println(p.getName());
    }
}
// 输出
null
```

上述代码中 this.name 表示 Person 类的 name 属性，**此处的 this 关键字不能省略**，如果省略就相当于给当前的局部变量 name 赋值 name，自己给自己赋值了。

### 使用

```java
// 本类的成员变量
this.成员变量

// 本类的成员方法
this.成员方法名()

// 本类的构造方法
this(...)
```

> this() 方法和 super() 方法的使用规则一样，如果显示的调用，只能放在方法的首行。
>
> this 是可以访问到父类中的方法的，this 会先从本类中找，如果找不到则会去父类中找。

## super

### 概述

super 是用来访问父类实例属性和方法的。

每个实例类如果没有显示的指定构造方法，那么它会生成一个隐藏的无参构造方法。对于 super() 方法也是类似，如果没有显示指定 super() 方法，那么子类会生成一个隐藏的 super() 方法，用来调用父类的无参构造方法。

```java
// 父类
class Father {
    public Father() {
        System.out.println("执行父类的构造方法");
    }
}

// 子类
class Son extends Father {
}

// 测试方法
public static void main(String[] args) {
    Son son = new Son();
}

//输出
执行父类的构造方法
```

从结果可以看出，子类 Son 在没有显示指定 super() 方法的情况下，竟然调用了父类的无参构造方法，这样从侧面验证了，**如果子类没有显示指定 super() 方法，那么它也会生成一个隐藏的 super() 方法**。

### 使用

```java
// 父类的成员变量
super.成员变量

// 父类的成员方法
super.成员方法名()

// 父类的构造方法
super(...)
```

>显示使用 super()  方法，那么 super() 方法必须放在构造方法的首行，否则编译器会报错。
>
>这是因为，只要将 super() 方法放在首行，那么在实例化子类时才能确保父类已经被先初始化了。

### 总结

this 和 super 都是 Java 中的关键字，都起指代作用，当显示使用它们时，都需要将它们放在方法的首行（否则编译器会报错）。

this 表示当前对象，super 用来指代父类对象，它们有四点不同：指代对象、查找访问、本类属性赋值和 synchronized 的使用不同。

1. 指代的对象不同

   > super 指代的是父类，是用来访问父类的；而 this 指代的是当前类。

2. 查找范围不同

   > super 只能查找父类，而 this 会先从本类中找，如果找不到则会去父类中找。

3. 本类属性赋值不同

   > this 可以用来为本类的实例属性赋值，而 super 则不能实现此功能。

4. this 可用于 synchronized

   > 因为 this 表示当前对象，所以this 可用于 synchronized(this){....} 加锁，而 super 则不能实现此功能。
