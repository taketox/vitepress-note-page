# 结构化语法(上)

## 使用 if-then 语句

> 有一类命令允许脚本**根据条件**跳过部分命令，**改变执行流程**。这样的命令通常被称为**结构化命令**（ *structured command* ）。其中**最基本的**结构化命令是 **if-then** 语句。

- **语句格式如下**：

```shell
if command
then
 commands
fi
```

- bash shell 的 if 语句**会运行 if 之后**的命令。
- 如果该命令的退出**状态码为 0** （命令成功运行），那么位于 **then** 部分的命令**就会被执行**。
- 如果退出**状态码是其他值**，则 **then** 部分的命令**不会被执行**，bash shell 会**接着处理**脚本中的**下一条命令**。
- **fi** 语句用来表示 if-then **语句到此结束**。
- **应用示例**：

```shell
# 1.脚本内容。（这里第一个if块使用了存在的命令；第二个if块使用不存在的命令。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if whoami
then
    echo "ok"
fi

echo -e "\n============\n"

if notCommand
then
    echo "ok"
fi

# 2.执行脚本。（第一个if块顺利执行then；第二个if块未执行then。）
[root@localhost testdir]# ./test.sh 
root
ok

============

./test.sh: line 9: notCommand: command not found
```

## if-then-else 语句

> 当 if 语句中的命令返回**非 0 退出状态码**时，bash shell 会执行 **else** 部分中的命令。

- **语句格式如下**：

```shell
if command
then
 commands
else
    commands
fi
```

- **应用示例**：

```shell
# 1.脚本内容。（if块使用不存在的命令。）
[root@localhost testdir]# cat ./test.sh 
#!/bin/bash
if notCommand
then
    echo "ok"
else
    echo "use the correct command!"
fi

# 2.执行脚本。（if退出码非0，执行else块。）
[root@localhost testdir]# ./test.sh 
./test.sh: line 2: notCommand: command not found
use the correct command!
```

- 跟 then 部分一样，else 部分**可以包含多条命令**。
- **fi** 语句说明 **else** **部分结束**。

## 嵌套 if 语句

> 有时需要在脚本中检查**多种条件**。对此，可以使用**嵌套**的 if-then 语句。

- **语句格式如下**：

```shell
if command1
then
    commands
elif command2
then
    commands
else
    commands
fi
```

- elif 语句提供了另一个要测试的命令，这**类似于原始的** **if** **语句行**。
- 每个代码块会根据命令是否返回退出**状态码** **0** 来执行。
- 记住，bash shell 会**依次执行** if 语句，**只有第一个**返回退出**状态码** **0** 的语句中的 **then** **部分会被执行**。
- **应用示例**：

```shell
# 1.脚本内容。（if不成立，elif都成立。 -> 提示：依次执行，只有第一个退出状态码0的then语句才会被执行。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if notCommand
then
    echo "if block"
elif whoami
then
    echo "elif1 block"
elif pwd
then
    echo "elif2 block"
else
    echo "else block"
fi

# 2.执行脚本。（只有第一个elif的then被执行到了。 -> 提示：如果if和elif退出状态码都非0，才会执行else）
[root@localhost testdir]# ./test.sh 
./test.sh: line 2: notCommand: command not found
root
elif1 block
```

## test 命令

> `test` 命令可以在 if-then 语句中**测试不同的条件**。如果 `test` 命令中列出的条件**成立**，那么就会退出并**返回退出状态码** **0** 。

- **当用在 if-then 语句中时，格式如下**：

```shell
if test condition
then
    commands
else
    commands
fi
```

- 如果**不写** `test` 命令的 **condition** **部分**，则它会以非 0 的退出状态码退出并**执行** **else** 代码块语句。
- 如果**加入了条件**，则 `test` 命令**会测试**该条件。
- bash shell 提供了**另一种**条件测试方法，**无须**在 if-then 语句中**写明** `test` 命令：

```shell
if [ condition ]
then
 commands
fi
```

- 方括号**定义了**测试条件。
- **注意事项**：第一个方括号**之后**和第二个方括号**之前必须留有空格**，否则就会报错。

### 数值比较

> 使用 `test` 命令最常见的情形是对两个数值进行比较。

- `test` **命令的数值比较功能**：

| 比较      | 描述                        |
| :-------- | :-------------------------- |
| n1 -eq n2 | 检查 n1 是否等于 n2。       |
| n1 -ge n2 | 检查 n1 是否大于或等于 n2。 |
| n1 -gt n2 | 检查 n1 是否大于 n2。       |
| n1 -le n2 | 检查 n1 是否小于或等于 n2。 |
| n1 -lt n2 | 检查 n1 是否小于 n2。       |
| n1 -ne n2 | 检查 n1 是否不等于 n2       |

- **应用示例**：

```shell
# 1.脚本内容。（定义两个整数值进行测试比较。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=10
num2=11
#
if [ $num1 -gt 5 ]
then
    echo "$num1 is greater than 5."
fi
#
if [ $num1 -eq $num2 ]
then
    echo "The values are equal."
else
    echo "The values are different."
fi

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
10 is greater than 5.
The values are different.
```

- **注意事项**：**对于测试条件**，bash shell **只能处理整数**。尽管可以将浮点值用于某些命令（ 比如 `echo` ），但它们在条件测试下无法正常工作。

### 字符串比较

> 测试条件还允许**比较字符串值**。

- `test` **命令的字符串比较功能**：

| 比较         | 描述                         |
| :----------- | :--------------------------- |
| str1 = str2  | 检查 str1 是否和 str2 相同。 |
| str1 != str2 | 检查 str1 是否和 str2 不同。 |
| str1 < str2  | 检查 str1 是否小于 str2 。   |
| str1 > str2  | 检查 str1 是否大于 str2。    |
| -n str1      | 检查 str1 的长度是否不为 0。 |
| -z str1      | 检查 str1 的长度是否为 0。   |

#### 字符串相等性

> 字符串的相等或不等条件不言自明。

- **应用示例**：

```shell
# 1.脚本内容。（比较两个字符串是否相同。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
str1="hello"
#
if [ "hello" = $str1 ]
then
    echo "euqal."
else
    echo "not equal."
fi

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
euqal.
```

- **注意事项**：在比较字符串的相等性时，比较测试会将**所有的标点和大小写情况都考虑在内。**

#### 字符串顺序

> 要测试一个字符串是否大于或小于另一个字符串就开始变得棘手了。

- 使用测试条件的大于或小于功能时，会出现**两个经常困扰的问题**：

  - **大于号**或**小于号必须转义**，**否则** shell 会将其**视为重定向符**，将字符串值当作文件名。
  - 大于和小于**顺序于** `sort` 命令所采用的**不同**。

- **问题一**：

```shell
# 1.脚本内容。（比较时，没有对大于号进行转义。）
[root@localhost testdir]# cat test.sh
#!/bin/bash
str1=soccer
str2=zorbfootball
#
if [ $str1 > $str2 ]
then
    echo "$str1 is greater than $str2 ."
else
    echo "$str1 is less than $str2 ."
fi

# 2.执行脚本。（比较结果不符合预期，并且把大于号当作了重定向符号生成了新文件。）
[root@localhost testdir]# ./test.sh 
soccer is greater than zorbfootball .
[root@localhost testdir]# ls z*
zorbfootball
```

- **问题一 正确使用示例**：

```shell
# 1.移除文件。
[root@localhost testdir]# rm -rf zorbfootball 

# 2.修改脚本内容。（添加转义。）
[root@localhost testdir]# vim test.sh 
[root@localhost testdir]# cat test.sh 
#!/bin/bash
str1=soccer
str2=zorbfootball
#
if [ $str1 \> $str2 ]
then
    echo "$str1 is greater than $str2 ."
else
    echo "$str1 is less than $str2 ."
fi

# 3.执行脚本。（比较结果符合预期。）
[root@localhost testdir]# ./test.sh 
soccer is less than zorbfootball .

# 4.是否又重定向生成了新的文件。
[root@localhost testdir]# ls z*
ls: cannot access z*: No such file or directory
```

- **问题二**：

```shell
# 1.sort排序时，优先出现小写字母。
[root@localhost testdir]# cat 1.txt 
Soccer
soccer
[root@localhost testdir]# sort 1.txt 
soccer
Soccer
[root@localhost testdir]# vim test.sh 
[root@localhost testdir]# cat test.sh 
#!/bin/bash
str1=Soccer
str2=soccer
#
if [ $str1 \> $str2 ]
then
    echo "$str1 is greater than $str2 ."
else
    echo "$str1 is less than $str2 ."
fi

# 2.执行脚本。（在比较测试中，大写字母被认为是小于小写字母的。）
[root@localhost testdir]# ./test.sh 
Soccer is less than soccer .
```

- **比较测试**中使用的是标准的 **Unicode** **顺序**，根据每个字符的 Unicode 编码值来决定排序结果。
- `sort` 命令使用的是**系统的语言环境设置中定义的排序顺序**。对于英语，语言环境设置指定了在排序顺序中**小写**字母**出现在大写字母之前**。
- **注意事项**：`test` 命令和测试表达式使用标准的**数学比较符号来表示字符串比较**。而用**文本代码来表示数值比较**。

#### 字符串大小

> -n 和 -z 可以很方便地用于检查一个变量是否为空。

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
str1=""
#
if [ -z "$str1" ]
then
    echo "$str1 is empty."
else
    echo "$str1 is not empty."
fi
#
if [ -n "$str1" ]
then
    echo "$str1 is not empty."
else
    echo "$str1 is empty."
fi

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
 is empty.
 is empty.
```

- **注意事项**：**空变量和未初始化的变量会对 shell 脚本测试造成灾难性的影响**。**如果不确定**变量的内容，那么**最好**在将其用于数值或字符串**比较之前先通过** -n 或 -z 来测试以下**变量是否为空**。
- **个人踩坑备注**（-n 判断空字符串时，未加双引号引用变量，导致结果不符合预期。）：

```shell
在shell中，引用变量时，加不加双引号是有区别的：

1.如果不加双引号，shell会将变量展开为其值，并将其作为一个单词处理。这意味着，如果变量的值包含空格或其他特殊字符，这些字符会被解释为单词分隔符或特殊字符，可能会导致意外的结果。
  例如，假设有一个变量`var="hello world"`，如果不加双引号，使用`echo $var`命令输出的结果将是两个单词`hello`和`world`，而不是一个单词`hello world`。

2.如果加上双引号，shell会将变量展开为其值，并将其作为一个整体处理。这意味着，变量的值中的空格和其他特殊字符会被保留，不会被解释为单词分隔符或特殊字符。
  例如，使用`echo "$var"`命令输出的结果将是一个单词`hello world`，而不是两个单词`hello`和`world`。

结论：因此，为了避免意外的结果，建议在引用变量时加上双引号。
```

### 文件比较

> 最后一类比较测试很有可能是 shell 编程中最为强大且用得最多得比较形式。它允许**测**试 Linux 文件系统中**文件和目录的状态**。

- `test` **命令的文本比较功能**：

|        比较         | 描述                                         |
| :-----------------: | :------------------------------------------- |
|      -d *file*      | 检查 *file* 是否存在且为目录。               |
|      -e *file*      | 检查 *file* 是否存。                         |
|      -f *file*      | 检查 *file* 是否存在且为文件。               |
|      -r *file*      | 检查 *file* 是否存在且可读。                 |
|      -s *file*      | 检查 *file* 是否存在且非空。                 |
|      -w *file*      | 检查 *file* 是否存在且可写。                 |
|      -x *file*      | 检查 *file* 是否存在且可执行。               |
|      -O *fil*       | 检查 *file* 是否存在且属当前用户所有。       |
|      -G *file*      | 检查 *file* 是否存在且默认组与当前用户相同。 |
| *file1* -nt *file2* | 检查 *file1* 是否比 *file2* 新。             |
| *file1* -ot *file2* | 检查 *file1* 是否比 *file2* 旧。             |

- **应用示例**：

```shell
# 1.脚本内容。（需求：如果目标文件为空则进行删除。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
# Check if a file is empty.
fileName=/home/tmp/1.txt
#
echo
echo "checking if $fileName file is empty... "
# if exists
if [ -f $fileName ]
then
    # is empty.
    if [ -s $fileName ]
    then
        echo "$fileName file exists and has data in it."
        echo "will not remove this file."
    else
        echo "$fileName file exists, but is empty."
        echo "deleting this file..."
        rm -rf $fileName
        echo "$fileName file, successfully deleted!"
    fi
    #
else
    echo "The $fileName file does not exist."
fi

# 2.被操作文件为非空文件。
[root@localhost testdir]# ls -sh /home/tmp/1.txt
4.0K /home/tmp/1.txt

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 

checking if /home/tmp/1.txt file is empty... 
/home/tmp/1.txt file exists and has data in it.
will not remove this file.
```

## 复合条件测试

> if-then 语句允许使用**布尔逻辑**将测试条件组合起来。

- 布尔运算符 AND 来组合两个条件（**都必须满足**）：[ *condition* ] && [ *condition* ]
- 布尔运算符 OR 来组合两个条件（**任意条件满足**）：[ *condition* ] || [ *condition* ]
- **应用示例**：

```shell
# 1.脚本内容。（如果$HOME目录存在且该目录下有名为newfile的可写文件，则提示写入。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
if [ -d $HOME ] && [ -w $HOME/newfile ]
then
    echo "the file exists and you can write to it."
else
    echo "you cannot write to the file."
fi

# 2.当前无此文件。
[root@localhost testdir]# ls -l $HOME/newfile
ls: cannot access /root/newfile: No such file or directory
[root@localhost testdir]# ./test.sh 
you cannot write to the file.

# 3.创建文件，再次执行脚本测试。
[root@localhost testdir]# touch $HOME/newfile
[root@localhost testdir]# ls -l $HOME/newfile
-rw-r--r-- 1 root root 0 Jun 11 10:32 /root/newfile
[root@localhost testdir]# ./test.sh 
the file exists and you can write to it.

# 4.清理操作。
[root@localhost testdir]# rm -rf $HOME/newfile
```

## if-then 的高级特性

> bash shell 还提供了 **3** 个可在 if-then 语句中使用的**高级特性**。

- 在**子shell中执行命令**的**单括号**。
- 用于**数学表达式**的**双括号**。
- 用于**高级字符串处理**功能的**双方括号**。

### 使用单括号

> **单括号允许**在 **if** **语句中使用子** **shell**。

- 在 bash shell 执行命令之前，会先创建一个子 shell ，然后在其中执行命令。
- 如果命令成功结束，则退出状态码会被设为 0 ，then 部分就会被执行。否则，不执行 then 部分的命令。
- **应用示例**：

```shell
# 1.脚本内容。（使用子shell进行测试。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo $BAHS_SUBSHELL
#
if (echo $BASH_SUBSHELL)
then
    echo "successsfully."
else
    echo "not successfully."
fi

# 2.执行脚本。（1表示使用了子shell。）
[root@localhost testdir]# ./test.sh 

1
successsfully.
```

### 使用双括号

> **双括号**命令允许在比较过程中使用**高级数学表达式**。相较于 `test` 命令进行比较时，双括号命令提供了**更多的数学符号**。

- **除了** `test` 命令使用的标准数学运算符，**还有**：

| 符号     | 描述         |
| :------- | :----------- |
| *val* ++ | 后增。       |
| *val* -- | 后减。       |
| ++ *val* | 先增。       |
| -- *val* | 先减。       |
| !        | 逻辑求反。   |
| ~        | 位求反。     |
| **       | 幂运算。     |
| <<       | 左位移。     |
| >>       | 右位移。     |
| &        | 位布尔 AND。 |
| \|       | 位布尔 OR。  |
| &&       | 逻辑 AND。   |
| \|\|     | 逻辑 OR。    |

- 双括号命令**既可以**在 if 语句中使用，**也可以**在脚本中的普通命令里用来赋值。
- **应用示例**：

```shell
# 1.脚本内容。（num1的平方是否大于90，并将该值的平方赋值给num2）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num1=10
#
if (( $num1 ** 2 > 90 ))
then
    (( num2=$num1 ** 2))
    echo "the suqare of $num1 is $num2."
    echo "which is greater than 90."
fi

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
the suqare of 10 is 100.
which is greater than 90.
```

- **注意事项**：双括号中表达式的**大于号不用转义**。这是双括号命令的又一个优越性的体现。

### 使用双方括号

> **双方括号**命令提供了**针对字符串比较的高级特性**。

- **除了** `test` 命令使用的标准字符串比较，还提供了 `test` 命令所不具备的另一个特性——**模式匹配**。
- 在进行模式匹配时，可以定义**通配符**或**正则表达式**来匹配字符串。
- **应用示例**：

```shell
# 1.脚本内容。（通配符匹配）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
echo $BASH_VERSION
#
if [[ $BASH_VERSION == 4.* ]]
then
    echo "using version 4 series."
fi

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
4.2.46(2)-release
using version 4 series.
```

- **注意事项**：双方括号在 bash shell 中运行良好。不过要小心，**不是所有的** **shell** **都支持双方括号**。

## case 命令

> 尝试计算一个变量的值，在一组可能的值中寻找特定值。case 命令会采用**列表格式**来**检查变量的多个值**，就**无须再写大量的** **elif** **语句**来检查同一个变量的值了。

- **语句格式如下**：

```shell
case 值 in
模式1)
    command1
    command2
    ...
    commandN
    ;;
模式2)
    command1
    command2
    ...
    commandN
    ;;
esac
```

- case 命令会将指定变量**与不同模式**进行比较。如果变量与模式**匹配**，那么 shell 就会**执行为该模式指定的命令**。
- 可以通过**竖线运算符**在一行中**分隔出多个模式**。
- **星号**会捕获所有**与已知模式不匹配**的值。
- **应用示例**：

```shell
# 1.脚本内容。（判断当前用户类型。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
case $USER in
"jan" | "lucy")
    echo "$USER is a ordinary user."
    ;;
"root")
    echo "$USER is the administrator."
    ;;
*)
    echo "$USER It's a different type of account."
esac

#  2.执行脚本。
[root@localhost testdir]# ./test.sh 
root is the administrator.
```
