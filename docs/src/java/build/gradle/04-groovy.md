# Groovy

## 概念

在某种程度上，Groovy 可以被视为 Java 的一种脚本化改良版，Groovy 也是运行在 JVM 上，它可以很好地与 Java 代码及其相关库进行交互操作。它是一种成熟的面向对象编程语言，既可以面向对象编程，又可以用作纯粹的脚本语言。大多数有效的 Java 代码也可以转换为有效的 Groovy 代码，Groovy 和 Java 语言的主要区别是：完成同样的任务所需的Groovy 代码比 Java 代码更少。

**Groovy特点：**

- 功能强大，例如提供了动态类型转换、闭包和元编程（metaprogramming）支持
- 支持函数式编程，不需要 main 函数
- 默认导入常用的包
- 类不支持 default 作用域，且默认作用域为 public。
- Groovy 中基本类型也是对象，可以直接调用对象的方法。
- 支持 DSL（Domain Specific Languages 领域特定语言）和其它简洁的语法，让代码变得易于阅读和维护。
- Groovy 是基于 Java 语言的，所以完全兼容 Java 语法，所以对于 java 程序员学习成本较低。

详细了解请参考：[Groovy官方文档](http://www.groovy-lang.org/documentation.html)

## 基本语法

### 字符串

在Groovy中，单引号和双引号都可以定义一个字符串常量(Java里单引号定义一个字符)，不同的是单引号标记的是纯粹的字符串常量，而不是对字符串里的表达式做运算，但是双引号可以。

**打印字符串类型：**

```groovy
task printStringClass {
    def str1 = '单引号'
    def str2 = "双引号"

    println "单引号定义的字符串类型" + str1.getClass().name
    println "双引号定义的字符串类型" + str2.getClass().name
}

// 输出
单引号定义的字符串类型java.lang.String
双引号定义的字符串类型java.lang.String
```

**执行任务：**

```sh
# -q 表示只输出任务的标准输出
.\gradlew.bat -q printString 
```

**打印字符串：**

```groovy
task printStringVar {
    def name = '张三'

    println '单引号的变量技术 ${name}'
    println "双引号的变量技术 ${name}"
}

// 输出
单引号的变量技术 ${name}                                                                
双引号的变量技术 张三
```

从程序中可以看到，双引号标记的表达式输出了我们想要的结果，但是单引号没有。所以大家应记住，单引号没有运算能力，它里面的所有表达式都是常量字符串。

双引号可以直接进行表达式计算的这个能力非常好用，我们可以用这种方式进行字符串连接运算，再也不用Java中烦琐的“+”号了。

### 集合

集合也是我们在Java中经常用到的。Groovy完全兼容了Java的集合，并且进行了扩展，使得声明一个集合，迭代一个集合，查找集合的元素等操作变得非常容易。常见的集合有List、Set、Map和Queue。

#### List

创建集合

```groovy
task printList {
    // 创建集合
    def numList = [1, 2, 3, 4, 5]

    // 打印类型名称
    println numList.getClass().name
    // 输出第一个元素
    println numList[0]
    // 输出倒数第一个元素
    println numList[-1]
    // 输出第二个元素
    println numList[1]
    // 输出倒数第二个元素
    println numList[-2]
}

// 输出
java.util.ArrayList
1
5
2
4
```

遍历集合

```groovy
task printList {
    def numList = [1, 2, 3, 4, 5]

    numList.each {
        println it
    }
}

// 输出
1
2
3
4
5
```

> `it`：代表正在迭代的元素

**常用操作：**

- add()：添加某个元素
- plus()：添加某个 list 集合
- remove()：删除指定下标的元素
- removeElement()：删除某个指定的元素
- removeAll()：移除某个集合中的元素
- pop()：弹出 list 集合中最后一个元素
- putAt()：修改指定下标的元素
- each()：遍历
- size()：获取 list 列表中元素的个数
- contains()：判断列表中是否包含指定的值，则返回 true

#### Map

Map用法和List很像，只不过它的值是一个`K:V`键值对。

```groovy
task printMap {
    def map = ['width': 1024, 'height': 78]

    println(map.getClass().name)
    println(map['width'])
    println(map.height)
}

// 输出
java.util.LinkedHashMap
1024
78
```

遍历Map

```groovy
task printMap {
    def map = ['width': 1024, 'height': 78]

    map.each {
        println("key: ${it.key}, value: ${it.value}")
    }
}

// 输出
key: width, value: 1024
key: height, value: 78
```

**常用操作：**

- `put()`：向 map 中添加元素
- `remove()`：根据某个键做移除，或者移除某个键值对
- `+、-`：支持 map 集合的加减操作
- `each()`：遍历 map 集合

### 方法

**括号可以省略：**

我们在Java中调用一个方法都是用`invokeMethod(parm1, parm2)`，非常规范，Java就是这么中规中矩的语言。在Groovy中就要灵活得多，可以省略`()`，变成`invokeMethod parm1,parm2`。这样，是不是觉得非常简洁，这在定义DSL的时候非常有用

```groovy
task invokeMethod() {
    method(1, 2)
    method 1, 2
}

def method(int a, int b) {
    println(a + b)
}

// 输出
3
3
```

**return可以不写：**

在Groovy中，我们定义有返回值的方法时，return语句不是必需的。当没有return的时候，Groovy会把方法执行过程中的最后一句代码作为其返回值。

```groovy
task invokeMethod() {
    def num = method 1, 2
    println(num)
}

def method(int a, int b) {
    if (a > b) {
        a
    } else {
        b
    }
}

// 输出
2
```

**代码块可以作为参数传递：**

代码块是一段被花括号包围的代码，其实就是我们后面要讲的闭包。Groovy是允许其作为参数传递的，但是结合我们上面讲的方法特性来用，最后的基于闭包的方法调用就会非常优雅、易读。以集合的each方法为例，它接受的参数其实就是一个闭包：

```groovy
    numList.each({
        println it
    })
    // Groovy规定：如果方法最后一个参数是闭包，可以放到方法外面
    numList.each() {
        println it
    }
    // 方法括号可以省略
    numList.each {
        println it
    }
```

### 类型及权限修饰符

**Groovy中的类型有：**

- 原生数据类型及包装类：boolean、char、short、int、long、float、double
- 类、内部类、抽象类、接口
- 注解
- Trait：可以看成是带有方法实现的接口

**权限修饰符有：**

- public
- protected
- private

**Groovy类与Java类之间的主要区别是：**

1. 没有可见性修饰符的类或方法自动是公共的（可以使用一个特殊的注释来实现包的私有可见性）。
2. 没有可见性修饰符的字段将自动转换为属性，不需要显式的 getter 和 setter 方法。
3. 如果属性声明为 final，则不会生成 setter。
4. 一个源文件可能包含一个或多个类（但是如果一个文件不包含类定义的代码，则将其视为脚本)。脚本只是具有一些特殊约定的类，它们的名称与源文件相同(所以不要在脚本中包含与脚本源文件名相同的类定义）。

### JavaBean

JavaBean是一个非常好的概念，你现在看到的组件化、插件化、配置集成等都是基于JavaBean。

在Java中为了访问和修改JavaBean的属性，我们不得不重复生成 `getter` 和 `setter` 方法，并且使用它们，太烦琐，这在Groovy中得到很大的改善：

```groovy
task printJavaBean() {
    Person p = new Person()

    println "名字：${p.name}"
    p.name = '张三'
    println "名字：${p.name}"
    // 只能获取不能修改，没有定义setter
    println "年龄：${p.age}"
}

class Person{
    private String name

    public int getAge(){
        12
    }
}

// 输出
名字：null
名字：张三
年龄：12
```

通过上面例子，我们发现，在Groovy中可以非常容易地访问和修改JavaBean的属性值，而不用借助 `getter` 和 `setter` 方法，这是因为Groovy都帮我们搞定了一些功能。

在Groovy中，并不是一定要定义成员变量才能作为类的属性访问，我们直接用 `getter` 和 `setter` 方法，也一样可以当作属性访问。

在Gradle中你会见到很多这种写法，开始会以为这是该对象的一个属性，其实只是因为该对象里定义了相应的getter/setter方法而已。

### 类导入

Groovy 遵循 Java 允许 import 语句解析类引用的概念。

```groovy
import groovy.xml.MarkupBuilder

def xml = new MarkupBuilder() 

assert xml != null
```

**Groovy 语言默认提供的导入：**

- `import java.lang.*`
- `import java.util.*`
- `import java.io.*`
- `import java.net.*`
- `import groovy.lang.*`
- `import groovy.util.*`
- `import java.math.BigInteger`
- `import java.math.BigDecimal`

> 这样做是因为这些包中的类最常用，减少了样板代码。

### 异常处理

Groovy 中的异常处理和 java 中的异常处理是一样的。

```groovy
    def z
    try {
        def i = 7, j = 0
        try {
            def k = i / j
            assert false
        }
        finally {
            z = 'reached here'
        }
    } catch (e) {
        assert e in ArithmeticException
        assert z == 'reached here'
    }
```

### 注意点

**总结：**

![An image](/img/java/build/gradle/05.png)

**类型转换：**

类型之间会自动发生类型转换，字符串（String）、基本类型(如 int) 和类型的包装类 (如 Integer)

**类说明：**

如果在一个 groovy 文件中没有任何类定义，它将被当做 script 来处理，也就意味着这个文件将被透明的转换为一个 Script 类型的类，这个自动转换得到的类将使用原始的 groovy 文件名作为类的名字。groovy 文件的内容被打包进 `run` 方法，另外在新产生的类中被加入一个 main 方法以进行外部执行该脚本。

**分号说明：**

在Groovy中，分号不是必需的。相信很多用Java的读者都习惯了每一行的结束必须有分号，但是Groovy没这个强制规定，所以，你看到的Gradle脚本很多都没有分号，这是Groovy的特性，而不是Gradle的。

## 闭包

**自定义闭包：**

前面我们讲过，闭包其实就是一段代码块，下面我们就一步步实现自己的闭包，了解闭包的it变量的由来。集合的each方法我们已经非常熟悉了，我们就以其为例，实现一个类似的闭包功能：

```groovy
task closure {
    // 使用自定义闭包
    customEach {
        println it
    }

}

def customEach(closure) {
    // 模拟元素，迭代
    for (i in 1..10) {
        closure(i)
    }
}

// 输出
1
...
10
```

在上面的例子中我们定义了一个方法`customEach`，它只有一个参数，用于接收一个闭包(代码块)。那么这个闭包如何执行呢？很简单，跟一对括号就是执行了。会JavaScript的读者是不是觉得这种情况的应用很熟悉，把它当作一个方法调用，括号里的参数就是该闭包接收的
参数，如果只有一个参数，那么就是我们的`it`变量了。

**向闭包传递参数：**

当闭包有一个参数时，默认就是`it`。当有多个参数时，`it` 就不能表示，我们需要把参数一一列出。

```groovy
task closure {
    // 多个参数
    customEach { k, v ->
        println "${k}, ${v}"
    }

}

def customEach(closure) {
    def map = ["name": "张三", "age": 18]
    map.each {
        closure(it.key, it.value)
    }
}

// 输出
name, 张三
age, 18
```

### 闭包委托

Groovy闭包的强大之处在于它支持闭包方法的委托。Groovy的闭包有`thisObject`、`owner`、`delegate`三个属性，当你在闭包内调用方法时，由它们来确定使用哪个对象来处理。

默认情况下 `delegate` 和 `owner` 是相等的，但是 `delegate` 是可以被修改的，这个功能是非常强大的，Gradle中的闭包的很多功能都是通过修改 `delegate` 实现的：

```groovy
task delegate {
    doLast {
        new Delegate().test {
            println "thisObject: ${thisObject.getClass()}"
            println "owner: ${owner.getClass()}"
            println "delegate: ${delegate.getClass()}"
            method()
            it.method()
        }
    }
}

def method() {
    println "Context this: ${this.getClass()} in root"
    println "method in root"
}

class Delegate {
    def method() {
        println "Delegate this: ${this.getClass()} in Delegate"
        println "method in Delegate"
    }

    def test(Closure<Delegate> closure) {
        closure(this)
    }
}

// 输出
thisObject: class build_567un8jpehzwdukv0yh1bf0nx
owner: class build_567un8jpehzwdukv0yh1bf0nx$_run_closure4$_closure6
delegate: class build_567un8jpehzwdukv0yh1bf0nx$_run_closure4$_closure6
Context this: class build_567un8jpehzwdukv0yh1bf0nx in root
method in root
Delegate this: class Delegate in Delegate
method in Delegate
```

通过上面的例子我们发现，`thisObject` 的优先级最高，默认情况下，优先使用 `thisObject` 来处理闭包中调用的方法，如果有则执行。从输出中我们也可以看到，这个 `thisObject` 其实就是这个构建脚本的上下文，它和脚本中的 `this` 对象是相等的。

从例子中也证明了 `delegate` 和 `owner` 是相等的，它们两个的优先级是：`owner` 要比 `delegate` 高。所以闭包内方法的处理顺序是：`thisObject > owner > delegate`。

在DSL中，比如Gradle，我们一般会指定 `delegate` 为当前的 `it` ，这样我们在闭包内就可以对该 `it` 进行配置，或者调用其方法：

```groovy
task configclosure {
    person {
        personName = "张三"
        personAge = 20
        dumpPerson()
    }
}

class Person {
    String personName
    int personAge

    def dumpPerson() {
        println "name is ${personName}, age is ${personAge}"
    }
}

def person(Closure<Person> closure) {
    Person p = new Person()
    closure.delegate = p
    //委托模式优先
    closure.setResolveStrategy(Closure.DELEGATE_FIRST);
    closure(p)
}

// 输出
name is 张三, age is 20
```

例子中我们设置了委托对象为当前创建的Person实例，并且设置了委托模式优先，所以，我们在使用person方法创建一个Person的实例时，可以在闭包里直接对该Person实例配置。

有没有发现和我们在Gradle中使用 `task` 创建一个Task的用法很像，其实在Gradle中有很多类似的用法，在Gradle中也基本上都是使用`delegate` 的方式使用闭包进行配置等操作。
