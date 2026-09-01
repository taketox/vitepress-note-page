# 输入处理

## 传递参数

> 向 shell 脚本传递数据的最基本方法是使用**命令行参数**。

- 命令行参数允许**运行脚本时**在命令行中添加数据，举个例子：

```shell
# 表示传递了两个命令行参数（10和30）。
./test.sh 10 30
```

- 脚本会通过**特殊的变**量来处理命令行参数。

### 读取参数

> bash shell 会将所有的命令行参数都指派给称作**位置参数**（ *positional parameter* ）的特殊变量。这也包括 shell 脚本名称。

- **位置变量的名称都是标准数字**：

  - **$0** 对应**脚本名**；
  - **$1** 对应**第一个命令**；
  - **$2** 对应**第二个命令行参数**；
  - 以此类推，直到 **$9**。

- **提示**：如果需要输入更多的命令行参数，则参数之间**必须用空格分开**。

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo "num=$1"
echo "num=$2"
echo "str=$3"

# 2.执行脚本。（位置参数分别传入数值、字符串。）
[root@localhost testdir]# ./test.sh 1 2 "hello world."
num=1
num=2
str=hello world.
```

- **注意事项**：

  - 要想在**参数值中加入空格**，**必须使用引号**（单引号或双引号均可）。
  - 将**文本字符串**作为参数传递时，引号**并不是**数据的一部分，**仅用于表明数据的起止位置。**

- 如果脚本需要的命令行参数**不止** 9 个，则仍**可以继续加入更多的参数**，但是需要稍微修改一下位置变量名。

- 在第 9 个位置变量**之后**，必须在**变量名**两侧**加上花括号**，比如 ${10}。

- **举个例子**：

```shell
# 1.脚本内容。（在第10和第12位置的变量相乘。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
var=$[ ${10} * ${12} ]
echo "${10}x${12}=$var"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 1 2 3 4 5 6 7 8 9 10 11 17 13 
10x17=170
```

- 这样你就可以根据需要向脚本中**添加任意多的**命令行参数了。

### 读取脚本名

> 可以使用位置变量 `$0` ，**获取**在命令行中运行的 shell **脚本名**。

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo "this script name is $0"

# 2.执行脚本。
[root@localhost testdir]# bash test.sh 
this script name is test.sh
```

- **潜在问题**：

```shell
# 1.执行脚本。（命令运行时，命令名会和脚本名混在一起。）
[root@localhost testdir]# ./test.sh 
this script name is ./test.sh

# 1.执行脚本。（通过绝对路径运行时，变量会包含整个绝对路径。）
[root@localhost testdir]# /home/scripts/test.sh 
this script name is /home/scripts/test.sh
```

- `basename` 命令可以返回**不包含路径**的脚本名：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
name=$(basename $0)
echo "this script name is $name"

# 2.执行脚本。（脚本名不再包含命令。）
[root@localhost testdir]# ./test.sh 
this script name is test.sh

# 2.执行脚本。（脚本名不再包含完整路径。）
[root@localhost testdir]# /home/scripts/test.sh 
this script name is test.sh
```

### 参数测试

> 在 shell 脚本中使用命令行参数时要当心。**如果**运行脚本时**没有指定所需的参数**，则**可能会出问题**。

- **参数缺失问题**：

```shell
# 1.脚本内容。（接受一个变量和100相乘。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
var=$[ 100 * $1 ]
echo "100x$1=$var"

# 2.执行脚本。（不指定所需的参数，运行报错。）
[root@localhost testdir]# ./test.sh 
./test.sh: line 2: 100 *  : syntax error: operand expected (error token is "*  ")
100x=
```

- **优化示例**：

```shell
# 1.脚本内容。（-n 测试来检查命令行参数$1中是否为空。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if [ -n "$1" ]
then
    var=$[ 100 * $1 ]
    echo "100x$1=$var"
else
    echo "You did not provide a parameter."
fi

# 2.执行脚本。（不指定所需的参数，运行时不再报错。）
[root@localhost testdir]# ./test.sh 
You did not provide a parameter.

# 2.执行脚本。（传入所需参数，结果符合预期。）
[root@localhost testdir]# ./test.sh 2
100x2=200
```

## 特殊参数变量

> 在 bash shell 中有一些**跟踪命令行参数**的特殊变量。

### 参数统计

> 在脚本中使用命令行参数之前应该**检查一下位置变量**。对使用多个命令行参数的脚本来说，这有点儿麻烦。bash shell 为此提供了一个特殊变量， `$#` 表示含有脚本运行时携带的**命令行参数的个数**。

- **应用示例**：

```shell
# 1.脚本内容。（参数个数等于2就执行计算，否则提示。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if [ $# -eq 2 ]
then
    var=$[ $1 + $2 ]
    echo "$1+$2=$var"
else
    echo "Usage: $(basename $0) parameter1 parameter2"
fi

# 2.执行脚本。（只传一个参数。）
[root@localhost testdir]# ./test.sh 100
Usage: test.sh parameter1 parameter2

# 2.执行脚本。（传两个参数。）
[root@localhost testdir]# ./test.sh 100 200
100+200=300
```

- **${!#}** 会**返回**命令行中**最后一个**参数，**若没有任何参数则返回脚本名**：

```shell
# 1.脚本内容。（返回最后一个参数值。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo "the last parameter is ${!#}"

# 2.执行脚本。（传入多个参数。）
[root@localhost testdir]# bash test.sh 1 2 3 4
the last parameter is 4

# 2.执行脚本。（没有传入任何参数。）
[root@localhost testdir]# bash test.sh 
the last parameter is test.sh
```

### 2.2 获取所有的数据

> **$\*** 变量和 **$@** 变量可以轻松**访问所有参数**，它们各自包含了所有的命令行参数。

- **$\*** 变量会将所有的命令行参数**视为一个单词**，这个单词含有命令行中出现的每一个参数。（即视为一个整体，而不是一系列个体。）
- **$@** 变量会将所有的命令行参数**视为**同一字符串中的**多个独立的**单词，以便你能**遍历并处理**全部参数。
- **应用示例**：

```shell
# 1.脚本内容。（分别对两种变量的参数内容及个数进行输出。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
count=1
#
echo "\$* = $*"
#
for param in "$*"
do
    echo "\$* param #$count = $param"
    count=$[ $count + 1 ]
done
#
echo -e "\n==========\n"
#
count=1
#
echo "\$@ = $@"
#
for param in "$@"
do
    echo "\$@ param #$count = $param"
    count=$[ $count + 1 ]
done
#
exit

# 2.执行脚本。（$*将参数视作整体，$@将参数视作独立。）
[root@localhost testdir]# ./test.sh jan tom rose
$* = jan tom rose
$* param #1 = jan tom rose

==========

$@ = jan tom rose
$@ param #1 = jan
$@ param #2 = tom
$@ param #3 = rose
```

## 移动参数

> `shift` 命令会根据命令行参数的**相对位置进行移动**。

- 在使用 `shift` 命令时，**默认情况**下会将每个位置的变量值都**向左移动一个**位置。
- 因此，变量 的值会移入2，变量 的值会移入1，而变量 $1 的值则**会被删除**（注意，**变量** **$0** 的值，也就**是脚本名**，**不会改变**）。
- **应用示例**：

```shell
# 1.脚本内容。（将参数移动两位。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo "parameters: $*"
echo "first parameter = $1"
echo "shifting 2..."
#
shift 2
#
echo "new first parameter = $1"
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh one two three four
parameters: one two three four
first parameter = one
shifting 2...
new first parameter = three
```

- **注意事项**：使用 `shift` 命令时**要小心**。**如果某个参数被移出，那么它的值就被丢弃了，无法再恢复。**

## 处理选项

> **选项**是在**连字符之后出现的单个字母**（比如：-a，-d，...）或者**双连字符紧跟着一个字符串**（比如：--max-depth，...），能够**改变命令的行为**。

### 查找选项

> 如果愿意，可以像处理命令行参数一样处理命令行选项。

#### 处理简单选项

- **应用示例**：

```shell
# 1.脚本内容。（使用shift命令来依次处理脚本的命令行参数，过程中判断某个参数是否为选项。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
while [ -n "$1" ]; do
    case "$1" in
    -a)
        echo "found -a option"
        ;;
    -b)
        echo "found -b option"
        ;;
    -c)
        echo "found -c option"
        ;;
    *)
        echo "$1 is not an option"
        ;;
    esac
    #
    shift
    #
done
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh -a -c -d -b
found -a option
found -c option
-d is not an option
found -b option
```

#### 分离参数和选项

- 可能经常碰到需要**同时使用**选项和参数的情况。
- 在 Linux 中，处理这个问题的标准做法是**使用双连字符（--）将两者分开**，该字符会告诉脚本**选项何时结束**，普通**参数何时开始**。
- **要检查双连字符**，只需在 case 语句中**加一项即可**。
- **应用示例**：

```shell
# 1.脚本内容。（区分参数和选项。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
while [ -n "$1" ]; do
    case "$1" in
    -a)
        echo "found -a option"
        ;;
    -b)
        echo "found -b option"
        ;;
    -c)
        echo "found -c option"
        ;;
    --)
        shift
        break
        ;;
    *)
        echo "$1 is not an option"
        ;;
    esac
    #
    shift
    #
done
#
echo -e "\n=======\n"
#
count=1
#
for param in "$@"; do
    echo "parameter #$count: $param"
    count=$((count+1))
done
#
exit

# 2.执行脚本。（未使用双连字符区分选项和参数。）
[root@localhost testdir]# ./test.sh  -a -b -c test1 test2 test3
found -a option
found -b option
found -c option
test1 is not an option
test2 is not an option
test3 is not an option

=======

# 2.执行脚本。（使用双连字符区分选项和参数。）
[root@localhost testdir]# ./test.sh  -a -b -c -- test1 test2 test3
found -a option
found -b option
found -c option

=======

parameter #1: test1
parameter #2: test2
parameter #3: test3
```

- 当脚本**遇到双连字符**时，便会**停止处理选项**，将剩下的部分**作为命令行参数**。

#### 处理含值的选项

- **有些选项需要一个额外的参数值**。在这种情况下，命令行看起来像下面这样：

```shell
[root@localhost testdir]# ./test.sh -a test1 -b -c -d test2
```

- **应用示例**：

```shell
# 1.脚本内容。（-b选项需要额外的参数值。）
# 由于要处理的选项位于$1。因此，额外的参数值就应该位于$2（因为所有的参数在处理完之后都会被移出）。
# 这个选项占用了两个位置，所以还需要使用shift命令多移动一次。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
while [ -n "$1" ]; do
    case "$1" in
    -a)
        echo "found -a option"
        ;;
    -b)
        param=$2
        echo "found -b option with parameter value = $param"
        shift
        ;;
    -c)
        echo "found -c option"
        ;;
    --)
        shift
        break
        ;;
    *)
        echo "$1 is not an option"
        ;;
    esac
    #
    shift
    #
done
#
echo -e "\n=======\n"
#
count=1
#
for param in "$@"; do
    echo "Parameter #$count: $param"
    count=$((count+1))
done
#
exit

# 2.执行脚本。（处理结果符合预期。）
[root@localhost testdir]# ./test.sh -a -b BValue -d
found -a option
found -b option with parameter value = BValue
-d is not an option

=======
```

- 现在 shell 脚本已经拥有了处理命令行选项的基本能力，但**还有一些局限**。
- 当你想**合并多个选项**时，脚本就不管用了：

```shell
[root@localhost testdir]# ./test.sh -ac
-ac is not an option

=======
```

### 使用 `getopt` 命令

> `getopt` 命令在处理命令行选项和参数时非常方便。它能够**识别命令行参数**，**简化解析过程**。

#### 命令格式

- `getopt` 命令可以接受一系列**任意形式**的命令行选项和参数，并**自动**将其转换成**适当的格式**。
- `getopt` 的**命令格式如下**：

```shell
getopt optstring parameters
```

- `optstring` 是这个过程的**关键所在**。它定义了有效的**命令行选项字母**，还定义了哪些选项字母**需要参数值**。
- 首先，在 `optstring` 中**列出**要在脚本中用到的每个命令行**选项字母**。
- 然后，在**每个需要参数值的**选项字母后面**加一个冒号**。
- `getopt` **工作过程说明**：

```shell
[root@localhost testdir]# getopt ab:cd -a -b BValue -cd test1 test2

# 1.optstring 定义了 4 个有效选项字母：a、b、c 和 d；

# 2.冒号（:）被放在了字母 b 后面，因为 b 选项需要一个参数值。

# 3.当 getopt 命令运行时，会检查参数列表（-a -b BValue -cd test1 test2），并基于提供的 optstring 进行解析。

# 4.注意，它会自动将-cd 分成两个单独的选项，并插入双连字符来分隔命令行中额外的参数。
```

- `getopt` **使用提示**：

```shell
# 如果 optstring 未包含你指定的选项，则在默认情况下，getopt 命令会产生一条错误消息：
[root@localhost testdir]# getopt ab:cd -a -b BValue -cde test1 test2
getopt: invalid option -- 'e' 
 -a -b BValue -c -d -- test1 test2
 
# 如果想忽略这条错误消息，可以使用 getopt 的-q 选项。
[root@localhost testdir]# getopt -q ab:cd -a -b BValue -cde test1 test2
 -a -b 'BValue' -c -d -- 'test1' 'test2'
```

- **注意事项**：`getopt` 命令选项**必须出现在** `optstring` **之前**。

#### 在脚本中使用 `getopt`

- 要使用 `getopt` 命令生成的格式化版本替换已有的命令行选项和参数，**得求助于** `set` 命令。
- `set` 命令有一个选项是双连字符（--），可以将位置**变量的值替换成** `set` 命令所**指定的值**。
- 用 `getopt` 格式化后的命令行参数来**替换原始的**命令行参数，如下所示：

```shell
set -- $(getopt -q ab:cd "$@")
```

- 现在，位置变量原先的值会被 `getopt` 命令的输出替换掉，后者**已经**为我们**格式化好了**命令行参数。
- **应用示例**：

```shell
# 1.脚本内容。（只加入了getopt命令，来帮助格式化命令行参数。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
set -- $(getopt -q ab:cd "$@")
#
while [ -n "$1" ]; do
    case "$1" in
    -a)
        echo "found -a option"
        ;;
    -b)
        param=$2
        echo "found -b option with parameter value $param"
        shift
        ;;
    -c)
        echo "found -c option"
        ;;
    --)
        shift
        break
        ;;
    *)
        echo "$1 is not an option"
        ;;
    esac
    #
    shift
    #
done
#
echo -e "\n=======\n"
#
count=1
#
for param in "$@"; do
    echo "Parameter #$count: $param"
    count=$((count+1))
done
#
exit

# 2.执行脚本。（解析合并选项。）
[root@localhost testdir]# ./test.sh -ac
found -a option
found -c option

=======

# 2.执行脚本。（复测之前的功能是否正常。）
[root@localhost testdir]# ./test.sh  -c -d -b BValue -a test1 test2
found -c option
-d is not an option
found -b option with parameter value 'BValue'
found -a option

=======

Parameter #1: 'test1'
Parameter #2: 'test2'
```

- 但是，`getopt` 命令中仍然**隐藏着一个小问题**。看看这个例子：

```shell
# 1.执行脚本。（部分参数中含有空格和引号。）
[root@localhost testdir]# ./test.sh -c -d -b BValue -a "test1 test2" test3
found -c option
-d is not an option
found -b option with parameter value 'BValue'
found -a option

=======

Parameter #1: 'test1
Parameter #2: test2'
Parameter #3: 'test3'
```

- `getopt` 命令并**不擅长处理带空格**和**引号的参数值**，它**会将空格**当作参数**分隔符**，而不是根据双引号将二者当作一个参数。

### 使用 `getopts` 命令

> `getopt` 与 `getopts`（注意是**复数**） 的**不同之处在于**，前者在将命令行中选项和参数处理后只生成一个输出，而**后者能够**和已有的 shell **位置变量配合默契**。

- `getopts` 每次**只处理一个**检测到的命令行参数。
- `getopts` 的**命令格式如下**：

```shell
getopts optstring variable
```

- `optstring` 值与 `getopt` 命令中使用的值**类似**：

  - 有效的选项字母会在 `optstring` 中列出，如果选项字母要求**有参数值**，就在**其后**加一个**冒号**。
  - **不想显示错误消息**的话，可以在 `optstring` **之前**加一个**冒号**。
  - `getopts` 命令会将当前参数**保存在**命令行中定义的 *variable* 中

- `getopts` 命令要用到**两个环境变量**：

  - 如果选项需要加带参数值，那么 OPTARG 环境变量**保存的就是这个值**。
  - OPTIND 环境变量保存着参数列表中 `getopts` **正在处理的参数位置**。

- **应用示例 - 使用到 OPTARG**：

```shell
# 1.脚本内容。
# while语句定义了getopts命令，指定要查找哪些命令行选项，以及每次迭代时存储它们的变量名opt。
# 在解析命令行选项时，getopts命令会移除起始的连字符，所以在case 语句中不用连字符。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
while getopts :ab:c opt; do
    #
    case "$opt" in
    a)
        echo "Found the -a option"
        ;;
    b)
        echo "Found the -b option with parameter value = $OPTARG"
        ;;
    c)
        echo "Found the -c option"
        ;;
    *)
        echo "Unknown option: $opt"
        ;;
    esac
    #
done
#
exit

# 2.执行脚本。（解析合并选项及参数值，结果符合预期。）
[root@localhost testdir]# ./test.sh -ab BValue -c
Found the -a option
Found the -b option with parameter value = BValue
Found the -c option

# 2.执行脚本。（解析带空格的参数，结果符合预期。）
[root@localhost testdir]# ./test.sh -b "BValue1 BValue2" -a
Found the -b option with parameter value = BValue1 BValue2
Found the -a option

# 2.执行脚本。（解析字母和参数值写在一起，结果符合预期。）
[root@localhost testdir]# ./test.sh -abBValue
Found the -a option
Found the -b option with parameter value = BValue

# 2.执行脚本。（解析未定义的选项，统一输出为问号。）
[root@localhost testdir]# ./test.sh -d
Unknown option: ?
[root@localhost testdir]# ./test.sh -ade
Found the -a option
Unknown option: ?
Unknown option: ?
```

- 在处理每个选项时，`getopts` 会将 OPTIND 环境变量值增 1。
- **处理完选项后**，**可以**使用 `shift` 命令和 OPTIND 值来**移动参数**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
while getopts :ab:cd opt; do
    #
    case "$opt" in
    a)
        echo "Found the -a option"
        ;;
    b)
        echo "Found the -b option with parameter value $OPTARG"
        ;;
    c)
        echo "Found the -c option"
        ;;
    d)
        echo "Found the -d option"
        ;;
    *)
        echo "Unknown option: $opt"
        ;;
    esac
    #
done
#
shift $((OPTIND - 1))
echo
count=1
for param in "$@"; do
    echo "parameter $count: $param"
    count=$((count + 1))
done
#
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh  -db BValue test1 test2
Found the -d option
Found the -b option with parameter value BValue

parameter 1: test1
parameter 2: test2
```

- 现在就就拥有了一个能在所有 shell 脚本中使用的**全功能**命令行选项和参数处理工具。

## 选项标准化

> 在编写 shell 脚本时，一切尽在你的控制中。选用哪些选项字母以及选项的具体用法，完全由你掌握。但在 Linux 中，**有些**选项字母在某种程度上已经有了**标准含义**。

- **常用的 Linux 命令行选项**：

| 选项 | 描述                           |
| :--: | :----------------------------- |
| `-a` | 显示所有对象。                 |
| `-c` | 生成计数。                     |
| `-d` | 指定目录。                     |
| `-e` | 扩展对象。                     |
| `-f` | 指定读入数据的文件。           |
| `-h` | 显示命令的帮助信息。           |
| `-i` | 忽略文本大小写。               |
| `-l` | 产生长格式输出。               |
| `-n` | 使用非交互模式。（批处理）     |
| `-o` | 将所有输出重定向至指定的文件。 |
| `-q` | 以静默模式运行。               |
| `-r` | 递归处理目录和文件。           |
| `-s` | 以静默模式运行。               |
| `-v` | 生成详细输出。                 |
| `-x` | 排除某个对象。                 |
| `-y` | 对所有问题回答 yes。           |

- 如果你的脚本选项也**遵循同样的含义**，那么用户在使用的时候就不用再查手册了。

## 获取用户输入

> 有时候脚本还需要**更多的交互性**。你可能想要在脚本运行时询问用户并**等待用户回答**。为此，bash shell 提供了 `read` 命令。

### 基本的读取

> `read` 命令从标准输入（键盘）或另一个文件描述符中**接受输入**。

- 获取**输入**后，`read` 命令会将数据**存入变量**。
- **应用示例**：

```shell
# 1.脚本内容。（输入年纪计算大概的天数。）
# read命令的-p选项，允许直接指定提示符（即在输入前打印提示信息）。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
read -p "Please enter your age: " age
days=$((age * 365))
echo "That means you are over $days days old!"
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Please enter your age: 18
That means you are over 6570 days old!
```

- 也**可以**在 `read` 命令中**不指定任何变量**，所有数据都放进**特殊环境变量** REPLY 中：

```shell
# 1.脚本内容。（使用环境变量。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
read -p "Enter your name:" 
echo "Hello $REPLY"
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Enter your name:jan
Hello jan
```

- REPLY 环境变量包含**输入的所有数据**，其可以在 shell 脚本中像其他变量一样使用。

### 超时

> 如果**不管是否有数据输入**，脚本都**必须继续执行**，你可以用-t 选项来指定一个**计时器**。

- -t 选项会指定 `read` 命令等待输入的秒数。
- **应用示例**：

```shell
# 1.脚本内容。（等待3秒）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if read -t 3 -p "Enter your name:"; then
    echo "Hello $REPLY"
else
    echo
    echo "Sorry, no longer waiting for name."
fi
#
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Enter your name:jan
Hello jan

# 2.执行脚本。（超时未输入。）
[root@localhost testdir]# ./test.sh 
Enter your name:
Sorry, no longer waiting for name.
```

- **也可以不对输入过程计时**，**而是**让 `read` 命令**统计输入的字符数**：

```shell
# 1.脚本内容。（接收到单个字符后退出。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
read -n 1 -p "Do you want to continue [Y/N]? "
#
case "$REPLY" in
Y | y)
    echo
    echo "Okay. Continue on..."
    ;;
N | n)
    echo
    echo "Okay. Goodbye"
    exit
    ;;
*)
    echo
    echo "Invalid input"
    exit
    ;;
esac
#
echo "This is the end of the script."
exit

# 2.执行脚本。（输入Y）
[root@localhost testdir]# ./test.sh 
Do you want to continue [Y/N]? Y
Okay. Continue on...
This is the end of the script.

# 2.执行脚本。（输入n）
[root@localhost testdir]# ./test.sh 
Do you want to continue [Y/N]? n
Okay. Goodbye
```

- 只要按下单个字符进行应答，`read` 命令就会接受输入并将其传给变量，**无须**按 Enter 键。

### 无显示读取

> 有时你需要从脚本用户处得到输入，但又**不想在屏幕上显示**输入信息。典型的例子就是输入密码，但除此之外还有很多种**需要隐藏的数据**。

- -s 选项可以避免在 `read` 命令中输入的数据出现在屏幕上（其实数据**还是会被显示**，**只不过** `read` 命令将文本颜色设成了跟**背景色一样**）。
- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
read -s -p "Enter your password: "
echo
echo "Your password is $REPLY"
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Enter your password: 
Your password is 123456
```

- 屏幕上不会显示输入的数据，但这些数据**会被赋给变量**，以便在脚本中使用。

### 从文件中读取

> 也可以使用 `read` 命令**读取文件**。

- 每次调用 `read` 命令都会从指定文件中**读取一行**文本。
- 当文件中**没有内容可读时**，`read` 命令会退出**并返回非** **0** 退出状态码。
- 其中麻烦的地方是将文件数据传给 `read` 命令。
- 最常见的方法是对文件使用 `cat` 命令，将结果通过管道直接传给含有 `read` 命令的 while 命令：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
count=1
file=/home/tmp/test.txt
#
cat $file | while read line; do
    echo "Line $count: $line"
    count=$((count + 1))
done
#
echo "Finished processing the file."
exit

# 2.被读取文件的内容。
[root@localhost testdir]# cat /home/tmp/test.txt
AAA
BBB
CCC

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 
Line 1: AAA
Line 2: BBB
Line 3: CCC
Finished processing the file.
```

- while 循环会**持续**通过 `read` 命令处理文件中的各行，**直到** `read` 命令以**非** **0** **退出状态码退出**。
