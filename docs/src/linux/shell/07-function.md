# 函数创建

## 脚本函数基础

> **函数**是一段脚本代码块，你可以为其命名并在脚本中的任何位置**重复使用**，从而避免重复编写相同的代码。

### 1.1 创建函数

> bash shell 脚本中创建函数的语法有**两种**。

- 第一种，使用**关键字** **function**：

```shell
# name：定义了该函数的唯一名称。脚本中的函数名不能重复。

# commands：是组成函数的一个或多个 bash shell 命令。

function name {
    commands
}
```

- 第二种，**接近其他编程语言中定义函数的方式**：

```shell
# 函数名后的空括号表明正在定义的是一个函数。
name() {
    commands
}
```

### 使用函数

> 要在脚本中使用函数，只需像其他 shell 命令一样**写出函数名即可**。

- **应用示例**：

```shell
# 1.脚本内容。（分别调用两种不同方式定义的函数。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
function sayHi() {
    echo "hi!"
}
#
sayHello() {
    echo "hello!"
}
#
sayHi
sayHello

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
hi!
hello!
[root@localhost testdir]# 
```

- **注意事项**：

  - **函数名必须是唯一的**，否则就会出问题。（如果定义了同名函数，那么新定义就会**覆盖**函数原先的定义，而这一切**不会有任何错误消息**。）
  - **函数必须先定义后调用。**

## 函数返回值

> bash shell 把函数视为一个小型脚本，运行结束时会返回一个退出状态码。有 **3** **种**方法能为**函数生成退出状态码**。

### 默认的退出状态码

> 在默认情况下，函数的退出状态码是函数中最后一个命令返回的退出状态码。

- 函数执行结束后，可以使用**标准变量** $? 来确定函数的退出状态码。
- **使用**函数的**默认退出状态码**是一种**危险的做法**：

```shell
# 1.脚本内容。（$? 得到的是最后一个命令执行的状态。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    ls -l badfile
}

func1
echo "status is: $?"

# 2.执行脚本。（此时返回退出状态码是2。）
[root@localhost testdir]# ./test.sh 
ls: cannot access badfile: No such file or directory
status is: 2

# 3.修改脚本内容。（在调用函数后加一句echo。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    ls -l badfile
}

func1
#
echo
#
echo "status is: $?"

# 4.再次执行脚本。（返回退出状态码变为了0。）
[root@localhost testdir]# ./test.sh 
ls: cannot access badfile: No such file or directory

status is: 0
```

- 函数中的**最后一个**命令执行**失败**了。**但你无法知道**该函数中的**其他命令是否执行成功**。

### 使用 return 命令

> return 命令允许**指定**一个**整数值**作为函数的退出状态码，从而提供了一种简单的编程设定方式。

- **应用示例**：

```shell
# 1.脚本内容。（将输入值作为退出状态码。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    read -p "Enter a value: " value
    return "$value"
}

func1
echo "status is: $?"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Enter a value: 200
status is: 200
```

- 当用这种方法从函数中返回值时，**一定要小心**。为了避免出问题，**牢记以下两个技巧**：

  - **函数执行一结束就立刻读取返回值**。（ $? 变量提取函数返回值之前执行了其他命令，那么函数的**返回值会丢失。**）
  - **退出状态码必须介于 0~255**。（大于 255 的任何数值都会产生**错误的值。**）

- 如果需要返回**较大的整数值**或**字符串**，就**不能使用** return 方法。

### 使用函数输出

> 正如可以将命令的输出保存到 shell 变量中一样，也可以将函数的输出**保存到** **shell** **变量中**。

- **应用示例**：

```shell
# 1.脚本内容。（将输出保存到变量。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    read -p "Enter a value: " value
    echo "$value"
}

result=$(func1)
echo "status is: $result"

# 2.执行脚本。（得到字符串类型的返回值。）
[root@localhost testdir]# ./test.sh 
Enter a value: 1000
status is: 1000
```

- 该脚本会**获取** func1 **函数的输出**，而**不是查看退出状态码**。
- 这种方法还可以返回**浮点值**和**字符串**，这使其成为一种获取函数返回值的强大方法。

## 在函数中使用变量

### 向函数传递参数

> bash shell 会将函数当作小型脚本来对待。这意味着你可以像普通脚本那样向函数传递参数。

- 函数**可以使用**标准的**位置变量**（ 、1、...、$#。）来表示在命令行中**传给函数的任何参数**。
- 在脚本中调用函数时，**必须**将**参数**和**函数名放在同一行**，**然后**函数可以用**位置变量来获取参数值**。
- **脚本内部调用函数时，传入位置参数**：

```shell
# 1.脚本内容。（参数个数为2作加法，否则返回-1。）
# 调用函数时，传入位置变量。（第一次调用传入5和6，第二次调用不传值。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
add() {
    if [ $# -eq 2 ]; then
        result=$(($1 + $2))
        echo "$1+$2=$result"
    else
        echo -1
    fi
}

value=$(add 5 6)
echo "$value"
#
value=$(add)
echo "$value"

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
5+6=11
-1
```

- **运行脚本时，传入位置参数**：

```shell
# 1.脚本内容。（检查调用脚本时传入的位置参数，两个就调用add()方法，否则返回-1。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
add() {
    result=$(($1 + $2))
    echo "$1+$2=$result"
}
#
if [ $# -eq 2 ]; then
    value=$(add $1 $2)
    echo "$value"
else
    echo -1
fi

# 2.执行脚本。（不传位置参数进行调用。）
[root@localhost testdir]# ./test.sh 
-1

# 3.执行脚本。（传正确个数的位置参数进行调用。）
[root@localhost testdir]# ./test.sh 10 10
10+10=20
```

### 在函数中处理变量

> 函数有**两种类型**的变量：
>
> - 全局变量。
> - 局部变量。

#### 全局变量

> **全局变量**是在 shell **脚本内任何地方都有效**的变量。

- 在**默认情况下**，在脚本中定义的任何变量**都是**全局变量。
- 在**函数外定义**的变量可在**函数内正常访问**。
- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    temp=$((value + 1))
}
#
temp=0
value=3
#
echo "before: temp:$temp , value:$value"
func1
echo "after: temp:$temp , value:$value"

# 2.执行脚本。（函数中用到了$temp 变量，因此它的值在脚本中使用时受到了影响。）
[root@localhost testdir]# ./test.sh 
before: temp:0 , value:3
after: temp:4 , value:3
```

- 如果变量**在函数内被赋予了新值**，那么在脚本中引用该变量时，新值仍可用。
- 这种情况其实**很危险**，尤其是想在**不同的** shell 脚本中**使用函数的时候**，因为这**要求你清清楚楚地知道**函数中具体使用了哪些变量，包括那些用来计算非返回值的变量。

------

#### 局部变量

> 无须在函数中使用全局变量，任何在**函数内部使用的**变量都可以被声明为**局部变量**。

- 只需在变量**声明之前**加上 **local** **关键字**即可：
- local 关键字保证了变量**仅在该函数中有效**。
- 如果函数之外有**同名变量**，那么 shell 会保持这两个变量的值**互不干扰**。
- 意味着你可以轻松地将**函数变量**和**脚本变量分离**开，**只共享需要共享的变量**。
- **应用示例**：

```shell
# 1.脚本内容。（使用local关键字修饰局部变量。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
func1() {
    local temp=$((value + 1))
}

temp=0
value=3
#
echo "before: temp:$temp , value:$value"
func1
echo "after: temp:$temp , value:$value"

# 2.执行脚本。（函数中用到了$temp 变量，但没有影响到全局的值。）
[root@localhost testdir]# ./test.sh 
before: temp:0 , value:3
after: temp:0 , value:3
```

------

## 数组变量和函数

### 向函数传递数组

- 如果试图将数组变量作为函数参数进行传递，则函数**只会提取**数组变量的**第一个元素**。
- 要解决这个问题，**必须**先将数组变量**拆解成多个数组元素**，然后将这些数组元素**作为函数参数传递**。
- **应用示例**：

```shell
# 1.脚本内容。（newArray将所有的参数重新组合成一个新的数组变量，之后进行遍历累加。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
addArray() {
    local sum=0
    local newArray
    newArray=("$@")
    #
    for value in "${newArray[@]}"; do
        sum=$((sum + value))
    done
    #
    echo $sum
}
#
args=(1 2 3 4 5)
reslut=$(addArray "${args[@]}")
echo "reslut=$reslut"
#
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
reslut=15
```

### 从函数返回数组

> 函数向 shell 脚本**返回数组**变量也采用类似的方法。

- **应用示例**：

```shell
# 1.脚本内容。（将原始数组的值翻倍后赋值给新数组，并返回新的数组。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
elementDoubling() {
    local origArray=("$@")
    local newArray=("$@")
    local length=$(($# - 1))
    for ((i = 0; i <= length; i++)); do
        newArray[i]=$((origArray[i] * 2))
    done
    echo "${newArray[*]}"
}
#
args=(1 2 3 4 5)
reslut=$(elementDoubling "${args[@]}")
echo "reslut=$reslut"
#
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
reslut=2 4 6 8 10
```

## 函数递归

> 局部函数变量的一个特性是**自成体系**（ *self-containment* ）。

- 这个特性使得函数可以**递归**地调用，也就是说**函数可以调用自己**来得到结果。
- 递归函数通常有一个最终可以迭代到的基准值。
- 许多高级数学算法通过递归对复杂的方程进行**逐级规约**，**直到基准值**。
- 递归算法的经典例子是**计算阶乘**。（一个数的阶乘是该数之前的所有数乘以该数的值。）
- **应用示例**：

```shell
# 1.脚本内容。（输入一个数，计算该数的阶乘。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
factorial() {
    inputValue=$1
    if [ $inputValue -eq 1 ]; then
        echo 1
    else
        local temp=$(($inputValue - 1))
        local result=$(factorial $temp)
        echo $((result * $inputValue))
    fi
}
#
read -p "Enter value: "
result=$(factorial "$REPLY")
echo "The factorial of $REPLY is: $result"
#
exit

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
Enter value: 5
The factorial of 5 is: 120
```

## 创建库

> bash shell 允许创建函数库文件，然后在**多个脚本**中**引用**此库文件。

- 使用函数库的关键在于 `source` 命令（别名，称作**点号操作符**）。
- `source` 命令会在**当前** **shell** 的上下文中执行命令，而不是创建新的 shell 并在其中执行命令。
- 可以用 `source` 命令在脚本中**运行库文件**。这样脚本就可以使用库中的函数了。
- **应用示例**：

```shell
# 1.脚本内容。（可以通过source或者点号引入库文件。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
lib_path="/home/lib/myfuncs.sh"
#source "$lib_path"
. "$lib_path"
#
sayHello
exit

# 2.自定义的库文件内容。
[root@localhost testdir]# cat /home/lib/myfuncs.sh
#!/bin/bash
sayHello() {
    echo "hello world!"
}

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 
hello world!
```

## 在命令行中使用函数

> 就像在 shell 脚本中**将脚本函数当作命令使用**一样，在**命令行**界面中**也可以**这样做。

### 在命令行中创建函数

- 因为 shell 会**解释用户输入**的命令，所以可以在命令行中**直接定义**一个函数。
- **应用示例**：

```shell
# 1.单行定义。（命令行中定义函数时，必须在每个命令后面加个分号，这样 shell 就能知道哪里是命令的起止了。）
[root@localhost testdir]# sayHi(){ echo "hi"; echo "hello"; }
[root@localhost testdir]# sayHi
hi
hello

# 2.多行定义。（使用这种方法，无须在每条命令的末尾放置分号，只需按下回车键即可。）
# 当输入函数尾部的花括号后，shell 就知道你已经完成函数的定义了。
[root@localhost testdir]# sayHello() {
> echo "hello"
> }
[root@localhost testdir]# sayHello
hello
```

- **注意事项**：在**命令行创建函数**时要**特别小心**。如果给函数起了一个跟内建命令或另一个命令**相同的名字，那么函数就会覆盖原来的命令。**

### 在 .bashrc 文件中定义函数

> 在**命令行中直接定义** shell 函数的一个明显**缺点**是，在**退出** **shell** 时，**函数也会消失**。将函数定义在每次新 shell **启动时**都会重新**读取**该函数的地方。.bashrc 文件就是**最佳位置**。

- **直接定义函数**：

```shell
# 1.可以直接在用户主目录的.bashrc 文件中定义函数。
# 大多数 Linux 发行版已经在该文件中定义了部分内容，注意不要误删，只需将函数放在文件末尾即可。
# 该函数会在下次启动新的 bash shell 时生效。
[root@localhost testdir]# cat $HOME/.bashrc
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
 . /etc/bashrc
fi

# ----------user defined-----------

sayYes() {
    echo "yes."
}

[root@localhost testdir]# 

# 2.开启新的bash会话。（或者重启终端。）
[root@localhost testdir]# bash

# 3.调用函数。
[root@localhost testdir]# sayYes
yes.

# 4.退出临时会话。
[root@localhost testdir]# exit
exit
[root@localhost testdir]# 
```

- **源引函数文件**：

```shell
# 1.只要是在 shell 脚本中，就可以用 source 命令（或者其别名，即点号操作符）将库文件中的函数添加到.bashrc 脚本中。
[root@localhost ~]# cat $HOME/.bashrc
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
 . /etc/bashrc
fi

# ----------user defined-----------

. /home/lib/myfuncs.sh

# 2.引入的库文件内容。
[root@localhost ~]# cat /home/lib/myfuncs.sh
#!/bin/bash
sayHello() {
    echo "------------"
    echo "hello world!"
    echo "------------"
}

# 3.开启新的bash会话。（或者重启终端。）
[root@localhost ~]# bash

# 4.命令行调用函数。
[root@localhost ~]# sayHello
------------
hello world!
------------

# 4.退出临时会话。
[root@localhost ~]# exit
exit
[root@localhost ~]# 
```

- **脚本中引入** **.bashrc** **文件**：

```shell
# 1.启动文件.bashrc源引函数。
[root@localhost testdir]# cat $HOME/.bashrc
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
 . /etc/bashrc
fi

# ----------user defined-----------

. /home/lib/myfuncs.sh

# 2.脚本内容。（脚本中引入.bashrc文件。）
# 这么做的好处：方便统一维护。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
. $HOME/.bashrc
#
sayHello
exit

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 
------------
hello world!
------------
```
