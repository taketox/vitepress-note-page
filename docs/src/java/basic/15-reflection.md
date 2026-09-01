# 反射

## 什么是反射？

反射 (Reflection) 是 Java 的特征之一，它允许运行中的 Java 程序获取自身的信息，并且可以操作类或对象的内部属性。

通过反射，我们可以在运行时获得程序或程序集中每一个类型的成员和成员的信息。程序中一般的对象的类型都是在编译期就确定下来的，而 Java 反射机制可以动态地创建对象并调用其属性，这样的对象的类型在编译期是未知的。所以我们可以通过反射机制直接创建对象，即使这个对象的类型在编译期是未知的。

反射的核心是 JVM 在运行时才动态加载类或调用方法/访问属性，它不需要事先（写代码的时候或编译期）知道运行对象是谁。

Java 反射主要提供以下功能：

- 在运行时判断任意一个对象所属的类；
- 在运行时构造任意一个类的对象；
- 在运行时判断任意一个类所具有的成员变量和方法（通过反射甚至可以调用private方法）；
- 在运行时调用任意一个对象的方法

重点：**是运行时而不是编译时**

## 主要用途

**反射最重要的用途就是开发各种通用框架**。很多框架（比如 Spring）都是配置化的（比如通过 XML 文件配置 Bean），为了保证框架的通用性，它们可能需要根据配置文件加载不同的对象或类，调用不同的方法，这个时候就必须用到反射，运行时动态加载需要加载的对象。

## 类加载机制

在Java程序启动时，JVM会将一部分类（class文件）先加载（并不是所有的类都会在一开始加载），通过ClassLoader将类加载，在加载过程中，会将类的信息提取出来（存放在元空间中，JDK1.8之前存放在永久代），同时也会生成一个Class对象存放在内存（堆内存），**注意此Class对象只会存在一个，与加载的类唯一对应！**

**如果我们手动创建一个与JDK包名一样，同时类名也保持一致，那么JVM会加载这个类吗？**

实际上我们的类最开始是由`BootstarpClassLoader`进行加载，`BootstarpClassLoader`用于加载JDK提供的类，而我们自己编写的类实际上是`AppClassLoader`，只有`BootstarpClassLoader`都没有加载的类，才会让`AppClassLoader`来加载，因此我们自己编写的同名包同名类不会被加载，而实际要去启动的是真正的类。

![An image](/img/java/base/03.png)

**通过下面的程序可以更好的理解，由于BootstarpClassLoader是C++编写的，所以打印出来的结果是null。**

```java
public void test(){
    // 查看当前类的类加载器
    System.out.println(Test.class.getClassLoader());
    // 父加载器
    System.out.println(Test.class.getClassLoader().getParent());
    // 爷加载器
    System.out.println(Test.class.getClassLoader().getParent().getParent());
    // String类加载器
    System.out.println(String.class.getClassLoader());
}

// 输出
sun.misc.Launcher$AppClassLoader@18b4aac2
sun.misc.Launcher$ExtClassLoader@2ff4acd0
null
null
```

## 反射实例

### 获取Class对象

1. 每个类（**包括包装类**）都有对应的Class对象，可以通过class关键字获取

2. 使用Class类静态方法`forName(Sting className)`，通过包名.类名获取，注意返回值是`Class<?>`

3. Object类中的`getClass`方法

```java
public void test() throws ClassNotFoundException {
    // 使用class关键字获取
    Class<String> clazz1 = String.class;
    // 使用Class静态方法forName()获取
    Class<?> clazz2 = Class.forName("java.lang.String");
    // 通过实例对象获取
    Class<? extends String> clazz3 = new String("zz").getClass();

    System.out.println(clazz1 == clazz2);
    System.out.println(clazz2 == clazz3);
}
// 输出
true
true
```

通过比较验证了一开始的结论，在JVM中每个类始终只存在一个Class对象，无论通过什么方法获取，都是一样的。

### 创建类对象

1. 通过使用`newInstance()`方法来创建对应类型的实例

    ```java
    public class Student {
        public Student() {
        }
        public void test(){
            System.out.println("test");
        }
    }

    public static void main(String[] args) throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        Class<?> clazz = Class.forName("cc.taketo.reflect.Student");  //获取对应的Class对象
        Student student = (Student) clazz.newInstance();  //通过反射创建了对象
        student.test();
    }
    // 输出
    test
    ```

    注意：`newInstance()`只适用于默认无参构造。

    - 当类默认的构造方法被带参构造覆盖时，会出现InstantiationException异常
    - 当默认无参构造的权限不是public时，会出现IllegalAccessException异常

2. 通过获取构造器`getConstructor()`来实例化对象

`getConstructor(Class<?>... parameterTypes)`的作用是根据参数类型（可变参数）来获取公共的构造器`Constructor[]（public)`。

通过这个方法获取到类的构造方法后，使用`newInstance`填入参数即可实例化对象

```java
public class Student {
    private String name;
    public Student(String name) {
        this.name = name;    
    }
    public void test(){
        System.out.println("name = " + this.name);
    }
}

public static void main(String[] args) throws InstantiationException, IllegalAccessException,ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
    Class<?> clazz = Class.forName("cc.taketo.reflect.Student");  //获取对应的Class对象
    Student student = (Student) clazz.getConstructor(String.class).newInstance("taketo");
    student.test();
}

// 输出
name = taketo
```

当访问权限不足时，会无法找到此构造方法（NoSuchMethodException）。

使用`getDeclaredConstructor()`方法可以找到类中的所有构造方法。在修改访问权限后，就可以使用非`public`方法了。

```java
public class Student {
    private String name;
    private Student(String name) {
        this.name = name;    
    }
    public void test(){
        System.out.println("this.name = " + this.name);
    }
}

public static void main(String[] args) throws InstantiationException, IllegalAccessException,ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
    Class<?> clazz = Class.forName("cc.taketo.reflect.Student");  //获取对应的Class对象
    // 必须使用getDeclaredConstructor才能获取到私钥构造器
    Constructor<?> constructor = clazz.getDeclaredConstructor(String.class);
    // 关闭安全检查
    constructor.setAccessible(true);
    Student student = (Student) constructor.newInstance("taketo");
    student.test();
}

// 输出
name = taketo
```

### 调用类方法

1. 通过调用`getMethod()`方法可以获取到类中所有声明为public的方法，得到一个Method对象。

   当出现非public方法时，我们可以通过反射来无视权限修饰符，通过`getDeclaredMethod()`获取非public方法。

2. 通过Method对象的`invoke()`方法来调用执行已经获取到的方法，注意传参。

```java
public class Student {
    private void test(String str ,Integer num){
        System.out.println("Tom str = " + str);
        System.out.println("Tom num = " + num);
    }

    protected String study(String str){
        System.out.println("Tom study " + str);
        return str;
    }

    public void run(){
        System.out.println("Tom is running");
    }
}

public static void main(String[] args) throws InstantiationException, IllegalAccessException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
    // 获取对应的Class对象
    Class<?> clazz = Class.forName("cc.taketo.reflect.Student");
    // 创建出学生对象
    Object student = constructor.newInstance();
    // 通过方法名和形参类型获取类中的方法
    Method test = clazz.getDeclaredMethod("test", String.class, Integer.class);
    // 关闭安全检查
    test.setAccessible(true);
    // 通过Method对象的invoke方法来调用方法
    test.invoke(student, "book", 1);

    Method study = clazz.getDeclaredMethod("study", String.class);
    // 关闭安全检查
    study.setAccessible(true);
    // 返回值就是方法的返回值
    String result = (String) study.invoke(student, "English");
    System.out.println(result);
}
// 输出
Tom str = book
Tom num = 1
Tom study English
English
```

### 修改类的属性

1. 通过`getField()`方法来获取一个类定义的指定成员字段修改一个类的对象中的成员字段值。
2. 当访问private字段时，同样可以按照上面的操作进行越权访问。

```java
public class Student {
    private String name;
    
    private String age;

    public String getName() {
        return name;
    }

    private void setName(String name) {
        this.name = name;
    }

    public String getAge() {
        return age;
    }

    private void setAge(String age) {
        this.age = age;
    }
}

public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException, NoSuchFieldException {
        Class<?> clazz = Class.forName("cc.taketo.reflect.Student");  //获取对应的Class对象
        Constructor<?> constructor = clazz.getConstructor();
        // 创建出学生对象
        Student student = (Student)constructor.newInstance();
        // 根据名称获取属性
        Field name = clazz.getDeclaredField("name");
        // 关闭安全检查
        name.setAccessible(true);
        name.set(student,"taketo");
        System.out.println("name = " + student.getName());

        // 获取全部属性
        Field[] fields = clazz.getDeclaredFields();
        // 关闭安全检查
        fields[1].setAccessible(true);
        fields[1].set(student,18);
        System.out.println("age = " + student.getAge());
}
// 输出
name = taketo
age = 18
```

## Java反射机制利用

### forname()

`forname`静态方法有两种用法，如下：

```java
//指定类名
public static Class<?> forName(String className)throws ClassNotFoundException  

//指定类名、是否初始化及指定类加载器
public static Class<?> forName(String name, boolean initialize,ClassLoader loader)throws ClassNotFoundException
```

示例

```java
public class TrainPrint {
    {
        System.out.printf("Empty block initial %s\n", this.getClass());
    }
    static {
        System.out.printf("Static initial %s\n", TrainPrint.class);
    }
    public TrainPrint() {
        System.out.printf("Initial %s\n", this.getClass());
    }
}

// 输出
Static initial class com.kinyoobi.Reflect.TrainPrint
Empty block initial class com.kinyoobi.Reflect.TrainPrint
Initial class com.kinyoobi.Reflect.TrainPrint
```

可以看出先调用的是静态代码块,然后是普通代码块，最后是构造方法。

值得注意的是：**forname方法加载类时会自动初始化该类对象**。

也就是说，如果forname的参数可控，那么可以通过构造对应的恶意类，在恶意类的static()内编写恶意代码，这样当forname()执行时就会执行对应的恶意代码。

### newInstance()

newInstance()和new的区别

1. newInstance()是一个方法，而new是一个关键字。
2. 创建对象的方式不一样，newInstance()是使用类加载机制 ,new是创建一个新类。
3. 使用newInstance()方法时必须保证这个类已经加载过且已经连接了，而new创建类时这个类可以没有被加载。
4. newInstance()只适用于默认无参构造。

在写漏洞利用方法的时候最常见的一个例子：

```java
Class clazz = Class.forName("java.lang.Runtime");
clazz.getMethod("exec", String.class).invoke(clazz.newInstance(), "id");
```

因为Runtime的构造方法是私有的，newInstance()无法将其实例化，只能通过Runtime.getRuntime()来获取Runtime对象。

修改后的payload如下：

```java
Class clazz = Class.forName("java.lang.Runtime");
//通过clazz.getMethod("getRuntime").invoke(clazz)实例化对象
clazz.getMethod("exec",String.class).invoke(clazz.getMethod("getRuntime").invoke(clazz),"calc.exe")
```

### getConstructor()

如果一个类中没有无参构造方法，也没有静态的获取对象方法，即当newinstance()和method().invoke()都用不上了，不妨考虑用获取构造器getConstructor()来实例化对象。

```java
Class clazz = Class.forName("java.lang.ProcessBuilder");
clazz.getMethod("start").invoke(clazz.getConstructor(List.class).newInstance(Arrays.asList("calc.exe")));
```

也相当于写成：

```java
Class clazz = Class.forName("java.lang.ProcessBuilder");
((ProcessBuilder)clazz.getConstructor(List.class).newInstance(Arrays.asList("calc.exe"))).start();
```

## 优缺点

**反射的优点：**

**可扩展性** ：应用程序可以利用全限定名创建可扩展对象的实例，来使用来自外部的用户自定义类。

**类浏览器和可视化开发环境** ：⼀个类浏览器需要可以枚举类的成员。可视化开发环境（如 IDE）可以从利用反射中可用的类型信息中受益，以帮助程序员编写正确的代码。

**调试器和测试⼯具** ： 调试器需要能够检查⼀个类里的私有成员。测试⼯具可以利用反射来自动地调用类里定义的可被发现的 API 定义，以确保⼀组测试中有较高的代码覆盖率。

**反射的缺点：**

尽管反射非常强大，但也不能滥用。如果⼀个功能可以不用反射完成，那么最好就不用。在我们使用反射技术时，下⾯⼏条内容应该牢记于心。

**性能开销** ：反射涉及了动态类型的解析，所以 JVM 无法对这些代码进行优化。因此，反射操作的效率要比那些非反射操作低得多。我们应该避免在经常被执行的代码或对性能要求很高的程序中使用反射。

**安全限制** ：使用反射技术要求程序必须在⼀个没有安全限制的环境中运行。如果⼀个程序必须在有安全限制的环境中运行，如 Applet，那么这就是个问题了。

**内部暴露** ：由于反射允许代码执行⼀些在正常情况下不被允许的操作（比如访问私有的属性和方法），所以使用反射可能会导致意料之外的副作用，这可能导致代码功能失调并破坏可移植性。反射代码破坏了抽象性，因此当平台发生改变的时候，代码的行为就有可能也随着变化。
