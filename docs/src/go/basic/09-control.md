# 控制结构

## if-else 结构

if 是用于测试某个条件（布尔型或逻辑型）的语句，如果该条件成立，则会执行 if 后由大括号括起来的代码块，否则就忽略该代码块继续执行后续的代码。

```go
if condition {
 // do something 
}
```

如果存在第二个分支，则可以在上面代码的基础上添加 `else` 关键字以及另一代码块，这个代码块中的代码只有在条件不满足时才会执行。`if` 和 `else` 后的两个代码块是相互独立的分支，只可能执行其中一个。

```go
if condition {
 // do something 
} else {
 // do something 
}
```

如果存在第三个分支，则可以使用下面这种三个独立分支的形式：

```go
if condition1 {
 // do something 
} else if condition2 {
 // do something else 
} else {
 // catch-all or default
}
```

else-if 分支的数量是没有限制的，但是为了代码的可读性，还是不要在 `if` 后面加入太多的 else-if 结构。如果你必须使用这种形式，则把尽可能先满足的条件放在前面。

这里举一些有用的例子：

1. 判断一个字符串是否为空：

   ```go
   if str == "" { ... }
   if len(str) == 0 {...}
   ```

2. 判断运行 Go 程序的操作系统类型，这可以通过常量 `runtime.GOOS` 来判断。

   ```go
   if runtime.GOOS == "windows"  {
    . ..
   } else { // Unix-like
    . ..
   }
   ```

   这段代码一般被放在 `init()` 函数中执行。这儿还有一段示例来演示如何根据操作系统来决定输入结束的提示：

   ```go
   var prompt = "Enter a digit, e.g. 3 "+ "or %s to quit."
   
   func init() {
    if runtime.GOOS == "windows" {
     prompt = fmt.Sprintf(prompt, "Ctrl+Z, Enter")  
    } else { //Unix-like
     prompt = fmt.Sprintf(prompt, "Ctrl+D")
    }
   }
   ```

3. 函数 `Abs()` 用于返回一个整型数字的绝对值:

   ```go
   func Abs(x int) int {
   if x < 0 {
    return -x
   }
   return x 
   }
   ```

4. `isGreater` 用于比较两个整型数字的大小:

   ```go
   func isGreater(x, y int) bool {
    if x > y {
     return true 
    }
    return false
   }
   ```

在第四种情况中，`if` 可以包含一个初始化语句（如：给一个变量赋值）。这种写法具有固定的格式（在初始化语句后方必须加上分号）：

```go
if initialization; condition {
 // do something
}
```

例如:

```go
val := 10
if val > max {
 // do something
}
```

你也可以这样写:

```go
if val := 10; val > max {
 // do something
}
```

但要注意的是，使用简短方式 `:=` 声明的变量的作用域只存在于 `if` 结构中（在 `if` 结构的大括号之间，如果使用 if-else 结构则在 `else` 代码块中变量也会存在）。如果变量在 `if` 结构之前就已经存在，那么在 `if` 结构中，该变量原来的值会被隐藏。最简单的解决方案就是不要在初始化语句中声明变量。

## switch 结构

相比较 C 和 Java 等其它语言而言，Go 语言中的 `switch` 结构使用上更加灵活。它接受任意形式的表达式：

```go
switch var1 {
 case val1:
  ...
 case val2:
  ...
 default:
  ...
}
```

变量 `var1` 可以是任何类型，而 `val1` 和 `val2` 则可以是同类型的任意值。类型不被局限于常量或整数，但必须是相同的类型；或者最终结果为相同类型的表达式。前花括号 `{` 必须和 `switch` 关键字在同一行。

每一个 `case` 分支都是唯一的，从上至下逐一测试，直到匹配为止。（ Go 语言使用快速的查找算法来测试 `switch` 条件与 `case` 分支的匹配情况，直到算法匹配到某个 `case` 或者进入 `default` 条件为止。）

一旦成功地匹配到某个分支，在执行完相应代码后就会退出整个 `switch` 代码块，也就是说您不需要特别使用 `break` 语句来表示结束。

因此，程序也不会自动地去执行下一个分支的代码。如果在执行完每个分支的代码后，还希望继续执行后续分支的代码，可以使用 `fallthrough` 关键字来达到目的。

```go
switch i {
 case 0: // 空分支，只有当 i == 0 时才会进入分支
 case 1:
  f() // 当 i == 0 时函数不会被调用
}

switch i {
 case 0: fallthrough
 case 1:
  f() // 当 i == 0 时函数也会被调用
}
```

`switch` 语句的第二种形式是不提供任何被判断的值（实际上默认为判断是否为 `true`），然后在每个 `case` 分支中进行测试不同的条件。当任一分支的测试结果为 `true` 时，该分支的代码会被执行。这看起来非常像链式的 if-else 语句，但是在测试条件非常多的情况下，提供了可读性更好的书写方式。

```go
switch {
 case i < 0:
  f1()
 case i == 0:
  f2()
 case i > 0:
  f3()
}
```

任何支持进行相等判断的类型都可以作为测试表达式的条件，包括 `int`、`string`、指针等。

switch 语句的第三种形式是包含一个初始化语句：

```go
switch result := calculate(); {
 case result < 0:
  ...
 case result > 0:
  ...
 default:
  // 0
}
```

## for 结构

如果想要重复执行某些语句，Go 语言中您只有 `for` 结构可以使用。不要小看它，这个 `for` 结构比其它语言中的更为灵活。

**注意事项** 其它许多语言中也没有发现和 do-while 完全对等的 `for` 结构，可能是因为这种需求并不是那么强烈。

### 基于计数器的迭代

基本形式

```go
for 初始化语句; 条件语句; 修饰语句 {}
```

这三部分组成的循环的头部，它们之间使用分号 `;` 相隔，但并不需要括号 `()` 将它们括起来。例如：`for (i = 0; i < 10; i++) { }`，这是无效的代码！

您还可以在循环中同时使用多个计数器：

```go
for i, j := 0, N; i < j; i, j = i+1, j-1 {}
```

这得益于 Go 语言具有的平行赋值的特性。

### 基于条件判断的迭代

for 结构的第二种形式是没有头部的条件判断迭代（类似其它语言中的 while 循环），

基本形式

```go
for 条件语句 {}
```

您也可以认为这是没有初始化语句和修饰语句的 for 结构，因此 `;;` 便是多余的了。

```go
package main

import "fmt"

func main() {
 var i int = 5

 for i >= 0 {
  i = i - 1
  fmt.Printf("The variable i is now: %d\n", i)
 }
}
```

### 无限循环

如果 for 循环的头部没有条件语句，那么就会认为条件永远为 true，因此循环体内必须有相关的条件判断以确保会在某个时刻退出循环。

想要直接退出循环体，可以使用 break 语句或 return 语句直接返回。

但这两者之间有所区别，break 只是退出当前的循环体，而 return 语句提前对函数进行返回，不会执行后续的代码。

```go
for {}
```

### for-range 结构

这是 Go 特有的一种的迭代结构，您会发现它在许多情况下都非常有用。它可以迭代任何一个集合（包括数组和 `map`）。语法上很类似其它语言中的 `foreach` 语句，但您依旧可以获得每次迭代所对应的索引。

基本形式

```go
for idx, val := range coll { }
```

要注意的是，`val` 始终为集合中对应索引的值拷贝，因此它一般只具有只读性质，对它所做的任何修改都不会影响到集合中原有的值（**译者注：如果 `val` 为指针，则会产生指针的拷贝，依旧可以修改集合中的原值**）。一个字符串是 Unicode 编码的字符（或称之为 `rune`）集合，因此您也可以用它迭代字符串：

```go
for pos, char := range str {
...
}
```

## break 与 continue

关键字 `break` 的作用范围为该语句出现后的最内部的结构，它可以被用于任何形式的 `for` 循环（计数器、条件判断等）。但在 `switch` 或 `select` 语句中，`break` 语句的作用结果是跳过整个代码块，执行后续的代码。

```go
package main

func main() {
 for i:=0; i<3; i++ {
  for j:=0; j<10; j++ {
   if j>5 {
       break   
   }
   print(j)
  }
  print("  ")
 }
}

// 输出
012345 012345 012345
```

关键字 `continue` 忽略剩余的循环体而直接进入下一次循环的过程，但不是无条件执行下一次循环，执行之前依旧需要满足循环的判断条件。

```go
package main

func main() {
 for i := 0; i < 10; i++ {
  if i == 5 {
   continue
  }
  print(i)
  print(" ")
 }
}

// 输出
0 1 2 3 4 6 7 8 9
```

>关键字 `continue` 只能被用于 `for` 循环中。

## 标签与 goto

`for`、`switch` 或 `select` 语句都可以配合标签 (label) 形式的标识符使用，即某一行第一个以冒号 (`:`) 结尾的单词（gofmt 会将后续代码自动移至下一行）。

标签的名称是大小写敏感的，为了提升可读性，一般建议使用全部大写字母。

```go
package main

import "fmt"

func main() {

LABEL1:
 for i := 0; i <= 5; i++ {
  for j := 0; j <= 5; j++ {
   if j == 4 {
    continue LABEL1
   }
   fmt.Printf("i is: %d, and j is: %d\n", i, j)
  }
 }

}

// 输出
i is: 0, and j is: 0
i is: 0, and j is: 1
i is: 0, and j is: 2
i is: 0, and j is: 3
i is: 1, and j is: 0
i is: 1, and j is: 1
i is: 1, and j is: 2
i is: 1, and j is: 3
i is: 2, and j is: 0
i is: 2, and j is: 1
i is: 2, and j is: 2
i is: 2, and j is: 3
i is: 3, and j is: 0
i is: 3, and j is: 1
i is: 3, and j is: 2
i is: 3, and j is: 3
i is: 4, and j is: 0
i is: 4, and j is: 1
i is: 4, and j is: 2
i is: 4, and j is: 3
i is: 5, and j is: 0
i is: 5, and j is: 1
i is: 5, and j is: 2
i is: 5, and j is: 3
```

本例中，`continue` 语句指向 `LABEL1`，当执行到该语句的时候，就会跳转到 `LABEL1` 标签的位置。

您可以看到当 `j==4` 和 `j==5` 的时候，没有任何输出：标签的作用对象为外部循环，因此 `i` 会直接变成下一个循环的值，而此时 `j` 的值就被重设为 `0`，即它的初始值。如果将 `continue` 改为 `break`，则不会只退出内层循环，而是直接退出外层循环了。另外，还可以使用 `goto` 语句和标签配合使用来模拟循环。

```go
package main

func main() {
 i := 0
HERE:
 print(i)
 i++
 if i == 5 {
  return
 }
 goto HERE
}

// 输出
01234
```

>使用标签和 `goto` 语句是不被推荐的：它们会很快导致非常糟糕的程序设计，而且总有更加可读的替代方案来实现相同的需求。
