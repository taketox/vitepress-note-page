# 基础语法

## 使用多个命令

> shell 可以将**多个命令串联**起来，一次性执行完。

- 如果想让两个命令一起执行，可以将起**放在同一行**中，彼此用**分号隔开**：

```shell
# 1.date命令显示当前日期和时间，whoami显示当前登录用户名。
[root@localhost ~]# date; whoami
Sun Jul 30 11:27:51 EDT 2023
root
```

- **提示**：通过这种方式，可以将**任意多个**命令**串联使用**，**只要不超过**命令行**最大字符数 255** 就行。
- **缺点**：每次执行前**必须**在命令提示符处**输入整个命令**。
- 我们可以将这些**命令组合成**一个简单的**文本文件**，这样就**无须再手动输入**了。在需要执行这些命令时，只需执行这个文本即可。

## 创建 shell 脚本文件

> 要将 shell 命令放到文本文件中，首先要用文本编辑器**创建一个文件**，然后在其中**输入命令**。

- 在创建 shell 脚本文件时，必须在文件的**第一行指定**要使用的 shell ，格式如下：

```shell
#!/bin/bash
```

- 在普通的 shell 脚本中，`#` 用作**注释行**。shell 并不会处理 shell 脚本中的注释行。然而，shell 脚本文件的**第一行是个例外**。#后面的惊叹号会告诉 shell **用哪个 shell 来执行脚本**。
- 在指明了 shell 之后，可以在文件的各行输入命令，**每行末尾**加一个**换行**符。
- **应用示例**：

```shell
# 1.编辑脚本。
[root@localhost testdir]# vim test.sh

# 2.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
date
whoami

# 3.尝试执行脚本。（提示无执行权限）
[root@localhost testdir]# ./test.sh
-bash: ./test.sh: Permission denied

# 4.查看权限。
[root@localhost testdir]# ls -l test.sh 
-rw-r--r-- 1 root shared 24 Jun  6 22:13 test.sh

# 5.为当前用户添加可执行权限。
[root@localhost testdir]# chmod u+x test.sh 
[root@localhost testdir]# ls -l test.sh 
-rwxr--r-- 1 root shared 24 Jun  6 22:13 test.sh

# 6.成功执行脚本。
[root@localhost testdir]# ./test.sh 
Sun Jul 30 11:27:51 EDT 2023
root
```

- **提示**：之后的示例脚本都会**省略**添加可执行权限的步骤。

## 显示消息

> 很多时候，你可能想添加自己的文本消息来**告诉用户脚本正在做什么**，可以通过 `echo` 命令来实现这一点。它是 shell 脚本中同用户交互的重要工具，会经常用它来**显示脚本中变量的值**。

- **应用示例**：

```shell
# 1.脚本内容。（追加echo显示）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
date
echo "=========="
whoami

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Wed Jun  7 21:54:02 CST 2023
==========
root
```

## 使用变量

> **变量**允许在 shell 脚本中**临时存储信息**，以便同脚本中的其他命令一起使用。

### 环境变量

> shell 维护着一组用于**记录特定的系统信息的环境变量**，比如系统名称、已登录系统的用户名、用户的系统ID（也称 UID）、用户的默认主目录以及 shell 查找程序的搜索路径。

- 可以使用 `set` 或者 `printenv` 命令查看环境变量。
- 在脚本中可以在环境变量名之前**加上 $ 符号**来**引用**这些环境变量。
- **应用示例**：

```shell
# 1.脚本内容。（显示环境变量）
[root@localhost testdir]# cat test01.sh 
#!/bin/bash
echo "USER=$USER"
echo "UID=$UID"
echo "HOME=$HOME"

# 2.执行脚本。（成功引用环境变量）
[root@localhost testdir]# ./test01.sh 
USER=root
UID=0
HOME=/root
```

- **注意事项**：只要脚本双引号中看到 $ ，就会以为你在引用变量。**反斜线允许** shell 脚本按照**字面意思解释** $ ，**而不是引用变量**。

```shell
[root@localhost testdir]# echo "cost $15"
cost 5

# 1.加上反斜线进行转义。
[root@localhost testdir]# echo "cost \$15"
cost $15
```

### 用户自定义变量

> 除了环境变量，shell 脚本还允许用户在**脚本中定义和使用自己的变量**。定义变量允许在脚本中临时存储并使用数据，从而使 shell 脚本看起来更像一个真正的计算机程序。

- 用户自定义变量的名称可以是任何由**字母**、**数字**或**下划线组成**的字符串，长度**不能超过 20 个字符**。
- 变量名**区分大小写**。
- 使用**等号**为变量**赋值**。（在变量、等号和值之间***\*不能出现空格\**！**）
- 脚本会以**字符串的形式存储**所有的变量值，脚本中的**各个命令可以自行决定变量值的数据类型**。
- 脚本中定义的**变量**在脚本的整个生命周期里会一直保持着它们的**值**，在**脚本结束时会被删除**。
- 与系统变量类似，用户自定义变量可以**通过 $ 引用**。
- **应用示例**：

```shell
# 1.脚本内容。（自定义变量并使用）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
my_var="hello world!"
echo $my_var

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
hello world!
```

- **注意事项**：

  - **引用**变量值时**要加** $（少了符号，shell 会将变量名解释成普通的字符串。）；
  - 对变量**赋值**时**不加** $。

### 命令替换

> shell 脚本中最有用的特性之一是可以从**命令输出中提取信息并将其赋值给变量**。把输出赋给变量之后，就可以随意在脚本中使用了。在**脚本中处理数据**时，这个特性显得尤为方便。

- 有**两种方法**可以将命令输出赋值给变量：

  - 反引号（ ` ）
  - $ ( ) 格式

- **应用示例**：

```shell
# 1.脚本内容。（分别使用两种方法，将命令输出赋值给变量）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
user1=`whoami`
echo "$user1"

user2=$(whoami)
echo "$user2"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
root
root
```

## 重定向输入和输出

> 有时候，你想要**保存命令的输出**而不只是在屏幕上显示。bash shell 提供了几个运算符，它们可以将命令的输出重定向到其他位置（比如文件）。重定向既可用于输入，也可以用于输出。

### 输出重定向

> 最基本的重定向会将**命令**的**输出发送至文件**。

- bash shell 使用**大于号**（ > ）来实现输出重定向操作。
- **提示**：如果输出**文件已存在**，则重定向运算符**会用新数据覆盖**已有文件。
- **应用示例**：

```shell
# 1.输出重定向。
[root@localhost testdir]# whoami > test01.txt 
[root@localhost testdir]# cat test01.txt 
root

# 2.再次重定向到相同文件。（覆盖）
[root@localhost testdir]# date > test01.txt 
[root@localhost testdir]# cat test01.txt 
Fri Jun  9 16:03:28 CST 2023
```

- 有时，你可能并**不想覆盖**文件原有内容，而是想将命令输出追加到已有文件中。例如，日志文件记录等。在这种情况下，可以使用**双大于号**（ >> ）来**追加数据**。
- **应用示例**：

```shell
# 1.原文件内容。
[root@localhost testdir]# cat test01.txt 
Fri Jun  9 16:14:13 CST 2023

# 2.追加新的数据内容。
[root@localhost testdir]# whoami >> test01.txt 
[root@localhost testdir]# cat test01.txt 
Fri Jun  9 16:14:13 CST 2023
root
```

### 输入重定向

> **输入**重定向和**输出**重定向**正好相反**。输入重定向**会将文件的内容重定向至命令**。

- 输入重定向运算符是**小于号**（ < ）。
- 简单的记忆方法：在命令行中，**命令总是在左侧**，而重定向运算符“**指向**“数据流动的方向。（小于号说明数据正在从输入文件流向命令）
- **应用示例**：

```shell
# 1.文件内容。
[root@localhost testdir]# cat test01.txt 
Fri Jun  9 16:14:13 CST 2023
root

# 2.使用wc命令对文本内容进行统计。（输出信息分别为：行数、单词数、字节数。）
[root@localhost testdir]# wc < test01.txt 
 2  7 34
```

- 还有另一种输入重定向的方法，称为**内联输入重定向**（ *inline input redirection* ）。这种方法**无须使用文件**进行重定向，只需要在命令行中指定用于输入重定向的数据即可。
- 内联输入重定向运算符是**双小于号**（ << ）。除了这个符号，还必须指定一个**文本标记**来划分**输入数据的起止**。
- **任何字符串**都可以作为文本标记，但在数据**开始**和**结尾**的**文本标记必须一致**。
- **应用示例**：

```shell
# 1.EOF命令是END Of File的缩写，表示自定义终止符。（划分输入数据的起止）
# 2.wc命令对输入内容进行统计。（输出信息分别为：行数、单词数、字节数。）
[root@localhost testdir]# wc << EOF
> hello world
> aaa
> bbb
> EOF
# 行数、单词数、字节数
 3  4 20
```

## 管道

> **无须**将命令输出**重定向**至文件，可以将其**直接传给另一个命令**。这个过程称为**管道连接**（ *piping* ）

- 管道操作符由**两个竖线组成**，一个在上，一个在下。然而，其印刷体往往**看起来更像是单个竖线**（ | ）。
- 管道被置于**命令之间**，将一个命令的输出传入另一个命令。
- 可**别以为**由管道串联起来的两个命令会**依次执行**。**实际上**，Linux 系统**会同时运行**这两个命令，在系统内部将二者连接起来。
- 管道操作是**实时化**的，并且数据传输**不会用到**任何**中间文件**或**缓冲区**。
- 管道可以串联的**命令数量没有限制**。可以**持续地**将命令输出通过管道传给其他命令来**细化操作**。
- **应用示例**：

```shell
# 1.rpm -qa显示已安装包的列表，再查找包名含有"python3"的包并对其排序显示。
[root@localhost testdir]# rpm -qa | grep "python3" | sort
python3-3.6.8-18.el7.x86_64
python3-libs-3.6.8-18.el7.x86_64
python3-pip-9.0.3-8.el7.noarch
python3-setuptools-39.2.0-10.el7.noarch
```

- 管道**最常见的用法之一**是将命令产生的**大量输出**传送给 `more` 命令。

## 执行数学运算

> 在 shell 脚本中，执行数学运算有**两种方式**。

### expr 命令

> `expr` 命令可在**命令行中执行**数学运算，用于在 Unix / Linux 下求表达式变量的值，一般用于**整数值**，也可用于**字符串**。

- **注意事项**：

  - 用**空格隔开**每个项；
  - 许多 `expr` 命令运算符在 shell 中另有他意（ 比如 * ），所以要用**反斜杠**（  \ ） 放在 shell **特定的字符前面**；
  - 对包含**空格**和**其他特殊字符**的字符串要用**引号括起来**。

- **应用示例**：

```shell
# 1.整数运算。（使用乘号时，必须用反斜线屏蔽其特定含义，因为shell可能会误解显示星号的意义。）
[root@localhost ~]# expr 30 \* 3
90

# 2.计算字符串长度。
[root@localhost ~]# expr length "hello world"
11
```

### 使用方括号

> 在 bash 中，要将数学**运算结果赋给变量**，可以使用 **$** 和 方括号（ **$[ \*operation\* ]** ）。

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
var1=$[1 + 5]
echo "1+5=$var1"

num1=10
num2=20
var2=$[$num1 * ($num2 - $num1)]
echo "10*(20-10)=$var2"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
1+5=6
10*(20-10)=100
```

- 在使用**方括号**执行数学运算时，**无须担心** shell 会**误解乘号**（shell 清楚方括号的星号不是通配符）**或其他符号**。
- bash shell 的数学运算符**只支持整数运算**。
- **应用示例**：

```shell
# 1.脚本内容。（整数相除）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=100
num2=45
var1=$[$num1 / $num2]
echo "100/45=$var1"

# 2.计算结果精度丢失。
[root@localhost testdir]# ./test.sh 
100/45=2
```

### 浮点数解决方案

> 有几种解决方案能够克服 bash 只支持整数运算的限制。最常见的做法是使用**内建的 bash 计算器** `bc` 。

- bash 计算器实际上是一种**编程语言**，允许在命令行中输入浮点表达式，然后解释并计算该表达式，最后返回结果。

- bash 计算器**能够识别以下内容**：

  - 数字（整数和浮点数）；
  - 变量（简单变量和数组）；
  - 注释（以# 或 C语言中的 /**/ 开始的行）；
  - 表达式；
  - 编程语句（比如 if-then 语句）；
  - 函数。

- 浮点数运算是由**内建变量** *scale* 控制的。你必须将该变量的值**设置为希望**在计算结果中**保留的小数位数**，否则无法得到期望的结果（ *scale* 变量的默认值是 0 ）。

- **bc 的基本用法 - 应用示例**：

```shell
# 1.bc命令访问bash计算器。（要退出计算器必须输入quit）
[root@localhost testdir]# bc
bc 1.06.95
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006 Free Software Foundation, Inc.
This is free software with ABSOLUTELY NO WARRANTY.
For details type `warranty'. 
12 * 5
60
0.1 * (1 + 9)
1.0
quit

# 2.-q选项表示不显示冗长的欢迎信息，通过scale变量设置保留的小数位数。
[root@localhost testdir]# bc -q
3.44 / 5
0
scale=4
3.44 / 5
.6880
quit
```

- 可以用**命令替换**来**运行** `bc` 命令，将输出**赋给变量**，基本**格式为**： *variable*=$(`echo` "*option*; *expression*" | `bc`)。
- **在脚本中使用 bc - 应用示例**：

```shell
# 1.脚本内容。（通过命令替换运行bc计算器）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=100
num2=45
var1=$(echo "scale=4; $num1 / $num2" | bc)
echo "100/45=$var1"

# 2.执行脚本。（小数保留4位。）
[root@localhost testdir]# ./test.sh 
100/45=2.2222
```

- 如果要进行**大量运算**，那么一个命令行中列出**多个表达式容易让人犯晕**。这种情况，最好的解决办法是**使用内联输入重定向**，它允许直接在命令行中重定向数据。在 shell 脚本中，可以将输出赋给一个变量。
- **通过内联输入进行计算 - 应用示例**：

```shell
# 1.使用内联重定向。（不通过表达式格式进行计算）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=100
num2=45

var1=$(bc << EOF
scale = 4
$num1 / $num2
EOF
)
echo "100/45=$var1"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
100/45=2.2222
```

- 将选项和表达式放在脚本的不同行中可以让**处理过程变得更清晰**并**提高易读性**。

- **注意事项**：

  - 可以在 bash 计算器中为变量赋值；
  - 在 bash **计算器中创建的变量仅在**计算器中有效，不能在 shell 脚本中使用。

## 退出脚本

> shell 中运行的每个命令都使用**退出状态码**来告诉 shell 自己已经**运行完毕**。退出状态码是一个 **0 ~ 255** 的整数值，在命令结束运行时由其传给 shell。你可以获取这个值并在脚本中使用。

### 查看退出状态码

> Linux 提供了专门的变量 `$?` 来保存**最后一个已执行**命令的退出状态码。**对于需要进行检查的命令**，**必须**在其运行完毕后**立刻查看**或使用 `$?` 变量。这是因为该变量的值会**随时变成**由 shell 执行的最后一个命令的退出状态码。

- Linux 退出状态码：

| 状态码  | 描述                               |
| :-----: | :--------------------------------- |
|    0    | 命令成功结束。                     |
|    1    | 一般性未知错误。                   |
|    2    | 不适合的 shell 命令。              |
|   126   | 命令无法执行。                     |
|   127   | 没找到命令。                       |
|   128   | 无效的退出参数。                   |
| 128+*x* | 与 Linux 信号 *x* 相关的严重错误。 |
|   130   | 通过 Ctrl + C 终止的命令。         |
|   255   | 正常范围之外的退出状态码。         |

- **应用示例**：

```shell
# 1.查看文件权限。
[root@localhost testdir]# ls -l 1.sh 
-rw-r--r-- 1 root shared 0 Jun 10 06:47 1.sh

# 2.无执行权限。
[root@localhost testdir]# ./1.sh
-bash: ./1.sh: Permission denied

# 3.状态码为126。
[root@localhost testdir]# echo $?
126
```

### exit 命令

> 在**默认情况**下，shell 脚本会以脚本中的**最后一个**命令的退出状态码退出。而 `exit` 命令允许在脚本结束时**指定一个退出状态码**。

- **应用示例**：

```shell
# 1.脚本内容。（指定退出状态码）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=100
num2=45

var1=$[$num1 + $num2]
echo "100+45=$var1"
exit 7

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
100+45=145

# 3.成功使用指定的退出状态码。
[root@localhost testdir]# echo $?
7
```

- **可以使用变量**作为 `exit` 命令的参数。
- 使用这个功能时要小心，因为退出状态码**最大只能是 255**。
- **应用示例**：

```shell
# 1.变量赋值给状态码。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=10
num2=30

var1=$[$num1 * $num2]
echo "10*30=$var1"
exit $var1

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
10*30=300

# 3.状态码数值被缩减。
[root@localhost testdir]# echo $?
44
```

- **示例说明**：退出状态码被缩减到了 0 ~ 255 的区间。shell 通过**模运算**得到这个结果。一个值的**模就是被除后的余数**。最终的结果是**指定的数值除以 256** 后得到的余数。在这个例子中，指定的返回值是 300 ，余数是 44 ，因此这个**余数就成了最后的退出状态码**。
