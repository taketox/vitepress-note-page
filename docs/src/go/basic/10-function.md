# 函数

## 定义

每一个程序都包含很多的函数：函数是基本的代码块。

Go是编译型语言，所以函数编写的顺序是无关紧要的；鉴于可读性的需求，最好把 `main()` 函数写在文件的前面，其他函数按照一定逻辑顺序进行编写（例如函数被调用的顺序）。

编写多个函数的主要目的是将一个需要很多行代码的复杂问题分解为一系列简单的任务（那就是函数）来解决。而且，同一个任务（函数）可以被调用多次，有助于代码重用。

当函数执行到代码块最后一行（`}` 之前）或者 `return` 语句的时候会退出，其中 `return` 语句可以带有零个或多个参数；这些参数将作为返回值供调用者使用。简单的 `return` 语句也可以用来结束 `for` 死循环，或者结束一个协程 (goroutine)。

Go 里面有三种类型的函数：  

- 普通的带有名字的函数
- 匿名函数或者lambda函数
- 方法（Methods）

除了 `main()`、`init()` 函数外，其它所有类型的函数都可以有参数与返回值。函数参数、返回值以及它们的类型被统称为函数签名。

### 函数声明

```go
func SquaresOfSumAndDiff(a int64, b int64) (s int64, d int64) {
 x, y := a + b, a - b
 s = x * x
 d = y * y
 return // <=> return s, d
}
```

1. 第一部分是`func`关键字。
2. 第二部分是函数名称。函数名称必须是一个标识符。 这里的函数名称是`SquareOfSumAndDiff`。
3. 第三部分是输入参数列表。输入参数声明列表必须用一对小括号括起来。 输入参数声明有时也称为形参声明（对应后面将介绍的函数调用中的实参）。
4. 第四部分是输出结果声明列表。在Go中，一个函数可以有多个返回值。 比如上面这个例子就有两个返回值。 当一个函数的输出结果声明列表为空或者只包含一个匿名结果声明时，此列表可以不用一对小括号括起来；否则，小括号是必需的。
5. 最后一部分是函数体。函数体必须用一对大括号括起来。 一对大括号和它其间的代码形成了一个显式代码块。 在一个函数体内，`return`关键字可以用来结束此函数的正常向前执行流程并进入此函数的退出阶段。

### 函数调用

一个声明的函数可以通过它的名称和一个实参列表来调用之。 一个实参列表必须用小括号括起来。 实参列表中的每一个单值实参对应着（或称被传递给了）一个形参。

```go
pack1.Function(arg1, arg2, …, argn)
```

`Function` 是 `pack1` 包里面的一个函数，括号里的是被调用函数的实参 (argument)：这些值被传递给被调用函数的**形参**（parameter）。

::: warning

函数被调用的时候，这些实参将被复制（简单而言）然后传递给被调用函数。函数一般是在其他函数里面被调用的，这个其他函数被称为调用函数 (calling function)。

函数能多次调用其他函数，这些被调用函数按顺序（简单而言）执行，理论上，函数调用其他函数的次数是无穷的（直到函数调用栈被耗尽）。

函数可以将其他函数调用作为它的参数，只要这个被调用函数的返回值个数、返回值类型和返回值的顺序与调用函数所需求的实参是一致的。

函数重载 (function overloading) 指的是可以编写多个同名函数，只要它们拥有不同的形参/或者不同的返回值，在 Go 里面函数重载是不被允许的。没有重载意味着只是一个简单的函数调度，所以你需要给不同的函数使用不同的名字。

:::

如果需要申明一个在外部定义的函数，你只需要给出函数名与函数签名，不需要给出函数体：

```go
func flushICache(begin, end uintptr) // implemented externally
```

**函数也可以以申明的方式被使用，作为一个函数类型**，就像：

```go
type binOp func(int, int) int
```

在这里，不需要函数体 `{}`。

## 参数与返回值

函数能够接收参数供自己使用，也可以返回零个或多个值（我们通常把返回多个值称为返回一组值）。

我们通过 `return` 关键字返回一组值。事实上，任何一个有返回值（单个或多个）的函数都必须以 `return` 或 `panic`结尾。

### 值传递

Go 默认使用按值传递来传递参数，也就是传递参数的副本。

函数接收参数副本之后，在使用变量的过程中可能对副本的值进行更改，但不会影响到原来的变量。

### 引用传递

如果你希望函数可以直接修改参数的值，而不是对参数的副本进行操作，你需要将参数的地址（变量名前面添加 `&` 符号，比如 `&variable`）传递给函数，这就是按引用传递。

比如 `Function(&arg1)`，此时传递给函数的是一个指针。如果传递给函数的是一个指针，指针的值（一个地址）会被复制，但指针的值所指向的地址上的值不会被复制；我们可以通过这个指针的值来修改这个值所指向的地址上的值。（**译者注：指针也是变量类型，有自己的地址和值，通常指针的值指向一个变量的地址。所以，按引用传递也是按值传递。**）

几乎在任何情况下，传递指针（一个32位或者64位的值）的消耗都比传递副本来得少。

```go
package main

import "fmt"

func main() {
 fmt.Printf("Multiply 2 * 5 * 6 = %d\n", MultiPly3Nums(2, 5, 6))
}

func MultiPly3Nums(a int, b int, c int) int {
 return a * b * c
}

// 输出
Multiply 2 * 5 * 6 = 60
```

如果一个函数需要返回四到五个值，我们可以传递一个切片给函数（如果返回值具有相同类型）或者是传递一个结构体（如果返回值具有不同的类型）。因为传递一个指针允许直接修改变量的值，消耗也更少。

### 命名的返回值

命名返回值作为结果形参 (result parameters) 被初始化为相应类型的零值，当需要返回的时候，我们只需要一条简单的不带参数的 `return` 语句。

```go
package main

import "fmt"

var num int = 10
var numx2, numx3 int

func main() {
    numx2, numx3 = getX2AndX3(num)
    PrintValues()
    numx2, numx3 = getX2AndX3_2(num)
    PrintValues()
}

func PrintValues() {
    fmt.Printf("num = %d, 2x num = %d, 3x num = %d\n", num, numx2, numx3)
}

func getX2AndX3(input int) (int, int) {
    return 2 * input, 3 * input
}

func getX2AndX3_2(input int) (x2 int, x3 int) {
    x2 = 2 * input
    x3 = 3 * input
    // return x2, x3
    return
}

// 输出
num = 10, 2x num = 20, 3x num = 30    
num = 10, 2x num = 20, 3x num = 30 
```

> 尽量使用命名返回值：会使代码更清晰、更简短，同时更加容易读懂。

### 空白符

空白符用来匹配一些不需要的值，然后丢弃掉。

```go
package main

import "fmt"

func main() {
 var i1 int
 var f1 float32
 i1, _, f1 = ThreeValues()
 fmt.Printf("The int: %d, the float: %f \n", i1, f1)
}

func ThreeValues() (int, int, float32) {
 return 5, 6, 7.5
}

// 输出
The int: 5, the float: 7.500000
```

### 改变外部变量

传递指针给函数不但可以节省内存（因为没有复制变量的值），而且赋予了函数直接修改外部变量的能力，所以被修改的变量不再需要使用 `return` 返回。

如下的例子，`reply` 是一个指向 `int` 变量的指针，通过这个指针，我们在函数内修改了这个 `int` 变量的数值。

```go
package main

import (
 "fmt"
)

// this function changes reply:
func Multiply(a, b int, reply *int) {
 *reply = a * b
}

func main() {
 n := 0
 reply := &n //0xc0000aa058
 fmt.Print(*reply)
 Multiply(10, 5, reply)
 fmt.Println("Multiply:", *reply) // Multiply: 50
}
```

## 传递变长参数

如果函数的最后一个参数是采用 `...type` 的形式，那么这个函数就可以处理一个变长的参数，这个长度可以为 0，这样的函数称为变参函数。

基本格式

```go
func myFunc(a, b, arg ...int) {}
```

函数示例

```go
// 函数声明
func Greeting(prefix string, who ...string)
// 函数调用
Greeting("hello:", "Joe", "Anna", "Eileen")
```

​ 在 `Greeting()` 函数中，变量 `who` 的值为 `[]string{"Joe", "Anna", "Eileen"}`。

### 使用结构

一个接受变长参数的函数可以将这个参数作为其它函数的参数进行传递：

```go
func F1(s ...string) {
 F2(s...)
 F3(s)
}

func F2(s ...string) { }
func F3(s []string) { }
```

> `...`：是一个特殊的语法，称为"ellipsis"，其中`F2(s...)`，实际上是将参数 `s`切片展开为一系列单独的参数。

定义一个结构类型，假设它叫 `Options`，用以存储所有可能的参数：

```go
type Options struct {
 par1 type1,
 par2 type2,
 ...
}
```

函数 `F1()` 可以使用正常的参数 `a` 和 `b`，以及一个没有任何初始化的 `Options` 结构： `F1(a, b, Options {})`。如果需要对选项进行初始化，则可以使用 `F1(a, b, Options {par1:val1, par2:val2})`。

### 使用空接口

如果一个变长参数的类型没有被指定，则可以使用默认的空接口 `interface{}`，这样就可以接受任何类型的参数。

该方案不仅可以用于长度未知的参数，还可以用于任何不确定类型的参数。

一般而言我们会使用一个 for-range 循环以及 `switch` 结构对每个参数的类型进行判断：

```go
func typecheck(values ...interface{}) {
 for _, value := range values {
        // 匿名变量
  switch value.(type) {
  case int:
   fmt.Print("int")
  case float32:
   fmt.Print("float32")
  case string:
   fmt.Print("string")
  case bool:
   fmt.Print("bool")
  default:
   fmt.Print("unknown")
  }
  fmt.Println()
 }
}
```

## defer 和追踪

关键字 `defer` 允许我们推迟到函数返回之前（或任意位置执行 `return` 语句之后）一刻才执行某个语句或函数（为什么要在返回之后才执行这些语句？因为 `return` 语句同样可以包含一些操作，而不是单纯地返回某个值）。

关键字 `defer` 的用法类似于面向对象编程语言 Java 和 C# 的 finally 语句块，它一般用于释放某些已分配的资源。

```go
package main

import "fmt"

func main() {
 function1()
}

func function1() {
 fmt.Printf("In function1 at the top\n")
 defer function2()
 fmt.Printf("In function1 at the bottom!\n")
}

func function2() {
 fmt.Printf("Function2: Deferred until the end of the calling function!")
}

// 输出
In function1 at the top
In function1 at the bottom!
Function2: Deferred until the end of the calling function!
```

使用 `defer` 的语句同样可以接受参数，下面这个例子就会在执行 `defer` 语句时打印 `0`：

```go
func a() {
 i := 0
 defer fmt.Println(i)
 i++
 return
}

// 输出
0
```

当有多个 `defer` 行为被注册时，它们会以逆序执行（类似栈，即后进先出）：

```go
func f() {
 for i := 0; i < 5; i++ {
  defer fmt.Printf("%d ", i)
 }
}

// 输出
4 3 2 1 0 
```

## 内置函数

Go 语言拥有一些不需要进行导入操作就可以使用的内置函数。它们有时可以针对不同的类型进行操作，例如：`len()`、`cap()` 和 `append()`，或必须用于系统级的操作，例如：`panic()`。因此，它们需要直接获得编译器的支持。

以下是一个简单的列表，我们会在后面的章节中对它们进行逐个深入的讲解。

| 名称                             | 说明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `close()`                        | 用于管道通信                                                 |
| `len()`                          | `len()` 用于返回某个类型的长度或数量（字符串、数组、切片、`map` 和管道）； |
| `cap()`                          | `cap()` 是容量的意思，用于返回某个类型的最大容量（只能用于数组、切片和管道，不能用于 `map`） |
| `new()`、`make()`                | `new()` 和 `make()` 均是用于分配内存：`new()` 用于值类型和用户定义的类型，如自定义结构，`make` 用于内置引用类型（切片、`map` 和管道）。它们的用法就像是函数，但是将类型作为参数：`new(type)`、`make(type)`。`new(T)` 分配类型 `T` 的零值并返回其地址，也就是指向类型 `T` 的指针。它也可以被用于基本类型：`v := new(int)`。`make(T)` 返回类型 `T` 的初始化之后的值，因此它比 `new()` 进行更多的工作。**`new()` 是一个函数，不要忘记它的括号**。 |
| `copy()`、`append()`             | 用于复制和连接切片                                           |
| `panic()`、`recover()`           | 两者均用于错误处理机制                                       |
| `print()`、`println()`           | 底层打印函数，在部署环境中建议使用 `fmt` 包                  |
| `complex()`、`real ()`、`imag()` | 用于创建和操作复数                                           |

## 递归函数

当一个函数在其函数体内调用自身，则称之为递归。最经典的例子便是计算斐波那契数列，即前两个数为 1，从第三个数开始每个数均为前两个数之和。

在使用递归函数时经常会遇到的一个重要问题就是栈溢出：一般出现在大量的递归调用导致的程序栈内存分配耗尽。这个问题可以通过一个名为 [懒惰求值](https://zh.wikipedia.org/wiki/惰性求值) 的技术解决，在 Go 语言中，我们可以使用管道 (channel) 和 `goroutine` 来实现。

Go 语言中也可以使用相互调用的递归函数：多个函数之间相互调用形成闭环。因为 Go 语言编译器的特殊性，这些函数的声明顺序可以是任意的。

```go
package main

import (
 "fmt"
)

func main() {
     // 16 is even: is true
 fmt.Printf("%d is even: is %t\n", 16, even(16))
    // 17 is odd: is true
 fmt.Printf("%d is odd: is %t\n", 17, odd(17))
 // 18 is odd: is false
 fmt.Printf("%d is odd: is %t\n", 18, odd(18))
}

func even(nr int) bool {
 if nr == 0 {
  return true
 }
 return odd(RevSign(nr) - 1)
}

func odd(nr int) bool {
 if nr == 0 {
  return false
 }
 return even(RevSign(nr) - 1)
}

func RevSign(nr int) int {
 if nr < 0 {
  return -nr
 }
 return nr
}

// 输出
16 is even: is true
17 is odd: is true
18 is odd: is false
```

## 回调函数

函数可以作为其它函数的参数进行传递，然后在其它函数内调用执行，一般称之为回调。

```go
package main

import (
 "fmt"
)

func main() {
 callback(1, Add)
}

func Add(a, b int) {
 fmt.Printf("The sum of %d and %d is: %d\n", a, b, a+b)
}

func callback(y int, f func(int, int)) {
 f(y, 2) // this becomes Add(1, 2)
}

// 输出
The sum of 1 and 2 is: 3
```

## 匿名函数

当我们不希望给函数起名字的时候，可以使用匿名函数。

```go
// 这样的一个函数不能够独立存在
func(x, y int) int {
    return x + y 
}
// 编译器会返回错误：non-declaration statement outside function body

// 但可以被赋值于某个变量，即保存函数的地址到变量中
fplus := func(x, y int) int {
    return x + y 
}

//通过变量名对函数进行调用
fplus(3, 4) //7
```

当然，也可以直接对匿名函数进行调用

```go
func(x, y int) int {
    return x + y
}(3, 4)
```

表示参数列表的第一对括号必须紧挨着关键字 `func`，因为匿名函数没有名称。花括号 `{}` 涵盖着函数体，最后的一对括号表示对该匿名函数的调用。

## 函数执行时间

有时候，能够知道一个计算执行消耗的时间是非常有意义的，尤其是在对比和基准测试中。最简单的一个办法就是在计算开始之前设置一个起始时间，再记录计算结束时的结束时间，最后计算它们的差值，就是这个计算所消耗的时间。

想要实现这样的做法，可以使用 `time` 包中的 `Now()` 和 `Sub()` 函数：

```go
// 记录开始时间
start := time.Now()
// 执行函数
longCalculation()
// 记录结束时间
end := time.Now()
// 消耗时间
delta := end.Sub(start)
fmt.Printf("longCalculation took this amount of time: %s\n", delta)
```
