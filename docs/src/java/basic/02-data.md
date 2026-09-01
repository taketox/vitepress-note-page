# 数据类型

## 基本类型

在Java中，数据类型只有四类八种。

| 数据类型  | 内存 | 默认值 |
| --------- | ---- | ------ |
| `byte`    | 8位  | 0      |
| `short`   | 16位 | 0      |
| `int`     | 32位 | 0      |
| `long`    | 64位 | 0L     |
| `float`   | 32位 | 0.0f   |
| `double`  | 64位 | 0.0d   |
| `char`    | 16位 | \u0000 |
| `boolean` | 8位  | false  |

### 整数型

整数型：`byte`、`short`、`int`、`long`

- `byte`：也就是字节，1byte=8bits，byte的默认值是0；
- `shot`：占用两个字节，也就是16位，1 short=16bits，它的默认值也是0；
- `int`：占用四个字节，也就是32位，1int=32bits，默认值是0；
- `long`：占用八个字节，也就是64位，1long=64bits，默认值是0L;

所以整数型的占用字节大小空间为`long > int > short > byte`。

### 浮点型

浮点型：`float`、`double`

- `float`是单精度浮点型，占用4位，1 float=32bits，默认值是0.0f；
- `double`是双精度浮点型，占用8位，1 double=64bits，默认值是0.0d；

### 字符型

字符型：`char`

- `char`：一个单一的16位Unicode字符。

最小值是`\uO000`（也就是0），最大值是`\uffff`（即为65535），char数据类型可以存储任何字符。

### 布尔型

布尔型：`boolean`

`boolean`：只有两种值，`true`或者`false`，只表示1位，默认值是false。

JVM 会在编译时期将 `boolean` 类型的数据转换为 `int`，使用 1 来表示 true，0 表示 false。

JVM ⽀持` boolean `数组，但是是通过读写 `byte` 数组来实现的。

## 包装类型

因为 Java 是一种面向对象语言， 很多地方都需要使用对象而不是基本数据类型。

比如， 在集合类中， 我们是无法将 `int`、 `double` 等类型放进去的。 因为集合的容器要求元素是 Object 类型。

为了让基本类型也具有对象的特征， 就出现了包装类型， 它相当于将基本类型“ 包装起来” ， 使得它具有了对象的性质， 并且为其添加了属性和方法， 丰富了基本类型的操作。

| 基本数据类型 | 包装类    |
| ------------ | --------- |
| byte         | Byte      |
| boolean      | Boolean   |
| short        | Short     |
| char         | Character |
| int          | Integer   |
| long         | Long      |
| float        | Float     |
| double       | Double    |

### 拆箱与装箱

有了基本数据类型和包装类， 肯定有些时候要在他们之间进行转换。 比如把一个基本数据类型的`int`转换成一个包装类型的 `Integer` 对象。

```java
Integer i = new Integer(10);
```

### 自动拆箱与自动装箱

```java
//int 的自动装箱都是通过 Integer.valueOf()方法来实现的， 
//Integer 的自动拆箱都是通过 integer.intValue 来实现的。

//装箱
Integer integer = 1;
//拆箱
int i= integer;
```

**自动装箱**: 将基本数据类型自动转换成对应的包装类。

**自动拆箱**： 将包装类自动转换成对应的基本数据类型。

> 包装对象的数值比较， 不能简单的使用==， 虽然-128 到 127 之间的数字可以， 但是这个范围之外还是需要使用 equals 比较。
> 前面提到， 有些场景会进行自动拆装箱， 同时也说过， 由于自动拆箱， 如果包装类对象为 null， 那么自动拆箱时就有可能抛出 空指针异常。

### 缓存池

new Integer(123) 与 Integer.valueOf(123) 的区别在于：

- new Integer(123) 每次都会新建⼀个对象；
- Integer.valueOf(123) 会使用缓存池中的对象，多次调用会取得同⼀个对象的引用。

```java
Integer x = new Integer(123);
Integer y = new Integer(123);
System.out.println(x == y); // false

Integer z = Integer.valueOf(123);
Integer k = Integer.valueOf(123);
System.out.println(z == k); // true
```

valueOf() 方法的实现比较简单，就是先判断值是否在缓存池中，如果在的话就直接返回缓存池的内容。

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
    return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

编译器会在自动装箱过程调用 valueOf() 方法，因此多个值相同且值在缓存池范围内的 Integer 实例使用自动装箱来创建，那么就会引用相同的对象。

```java
Integer m = 123;
Integer n = 123;
System.out.println(m == n); // true
```

基本类型对应的缓冲池如下：

- boolean values true and false
- all byte values
- short values between -128 and 127
- int values between -128 and 127
- char in the range \u0000 to \u007F

在使用这些基本类型对应的包装类型时，如果该数值范围在缓冲池范围内，就可以直接使用缓冲池中的对象。

> 在 jdk 1.8 所有的数值类缓冲池中，Integer 的缓冲池 IntegerCache 很特殊，这个缓冲池的下界是 -128，上界默认是 127。
> 但是这个上界是可调的，在启动 jvm 的时候，通过 `-XX:AutoBoxCacheMax=<size>` 来指定这个缓冲池的大⼩，该选项在 JVM 初始化的时候会设定⼀个名为java.lang.IntegerCache.high 系统属性，然后 IntegerCache 初始化的时候就会读取该系统属性来决定上界。

## 数组

**容器**：是将多个数据存储到一起，每个数据称为该容器的元素。

**数组概念**：数组就是存储数据长度固定的容器，保证多个数据的数据类型要一致。

### 定义

```java
// 方式一
数组存储的数据类型[] 数组名字 = new 数组存储的数据类型[长度];
int[] arr = new int[3];

// 方式二
数据类型[] 数组名 = new 数据类型[]{元素1,元素2,元素3...};
int[] arr = new int[]{1,2,3,4,5};

// 方式三
数据类型[] 数组名 = {元素1,元素2,元素3...};
int[] arr = {1,2,3,4,5};
```

**索引：** 每一个存储到数组的元素，都会自动的拥有一个编号，从0开始，这个自动编号称为**数组索引(index)**，可以通过数组的索引访问到数组中的元素。

```java
数组名[索引]
```

**数组的长度属性：** 每个数组都具有长度，而且是固定的。

Java中赋予了数组的一个属性，可以获取到数组的长度语句为：`数组名.length`，属性`length`的执行结果是数组的长度，int类型结果。

## 数据类型转换

Java程序中要求参与的计算的数据，必须要保证数据类型的一致性，如果数据类型不一致将发生类型的转换。

### 自动转换

一个 `int` 类型变量和一个 `byte` 类型变量进行加法运算， 结果会是什么数据类型？

运算结果，变量的类型将是 `int` 类型，这就是出现了数据类型的自动类型转换现象。

**自动转换**：将 取值范围小的类型 自动提升为取值范围大的类型 。

`byte` 类型内存占有1个字节，在和 `int` 类型运算时会提升为`int` 类型 ，自动补充3个字节，因此计算后的结果还是 `int` 类

型。

同样道理，当一个 `int` 类型变量和一个 double 变量运算时， `int` 类型将会自动提升为 double 类型进行运算。

```java
public static void main(String[] args) {
    int i = 1;
    double d = 2.5;
    //int类型和double类型运算，结果是double类型 
    //int类型会提升为double类型 
    double e = d+i; 
    System.out.println(e); 
}
```

### 转换规则

范围小的类型向范围大的类型提升， `byte`、`short`、`char` 运算时直接提升为 `int` 。

```java
byte、short、char‐‐>int‐‐>long‐‐>float‐‐>double
```

### 强制转换

将 1.5 赋值到 `int` 类型变量会发生什么？产生编译失败，肯定无法赋值。

```java
int i = 1.5; // 编译错误
```

`double` 类型内存8个字节， `int` 类型内存4个字节。 1.5 是 `double` 类型，取值范围大于`int` 。

**强制类型转换**：将 取值范围大的类型 强制转换成 取值范围小的类型 。

### 转换格式

```java
数据类型 变量名 = （数据类型）被转数据值；
```

> 浮点转成整数，直接取消小数点，可能造成数据损失精度。
>
> `int` 强制转成 `short` 砍掉2个字节，可能造成数据丢失。
