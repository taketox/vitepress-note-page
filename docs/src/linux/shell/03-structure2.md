# 结构化语法(下)

## for 命令

> 需要**重复**多个命令**直至达到某个特定条件**，比如处理目录下的所有文件、系统中的所有用户或是文本文件中的所有行。bash shell 提供了 for 命令，以允许创建**遍历**一系列值的循环。

- **语句格式如下**：

```shell
for var in list
do
    commands
done
```

- 在**每次迭代**中，变量 `var` 会包含**列表中的当前值**。
- do 语句和 done 语句之间的 *commands* 可以是一个或多个标准的 bash shell 命令。在这些命令中，$*var* 变量包含着**此次迭代**对应的列表中的当前值。

### 读取列表中的值

> for 命令最基本的用法是遍历其自身所定义的一系列值。

- **应用示例**：

```shell
# 1.脚本内容。（遍历读取值。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for name in jack lucy rose tom 
do
    echo "the next name is $name."
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
the next name is jack.
the next name is lucy.
the next name is rose.
the next name is tom.
```

### 读取列表中的复杂值

> 有的时候，会遇到**难处理**的数据。

- **问题一**（读取**单引号**的值）：

```shell
# 1.脚本内容。（内容中有单引号的数据。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for test in I don't know if this'll work
do
    echo "word:$test"
done

# 2.执行脚本。（单引号丢失，输出与期望不符合。）
[root@localhost testdir]# ./test.sh 
word:I
word:dont know if thisll
word:work
```

- 有**两种方法**可以解决这个问题：

  - 使用**转义字符**（反斜线）将单引号转义。
  - 使用**双引号**来定义含有单引号的值。

- **问题一解决**：

```shell
# 1.脚本内容。（分别使用转义字符和双引号来解决该问题。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for test in I don\'t know if "this'll" work
do
    echo "word:$test"
done

# 2.执行脚本。（输出内容符合预期。）
[root@localhost testdir]# ./test.sh 
word:I
word:don't
word:know
word:if
word:this'll
word:work
```

- **问题二**（读取含有**空格**的值）：

```shell
# 1.脚本内容。（内容中有多个单词。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for place in New York New Hampshire New Mexico
do
    echo "now going to $place"
done

# 2.执行脚本。（空格被分隔，输出与期望不符合。）
[root@localhost testdir]# ./test.sh 
now going to New
now going to York
now going to New
now going to Hampshire
now going to New
now going to Mexico
```

- **问题二解决**：

```shell
# 1.脚本内容。（如果某个值含有空格，则必须将其放入双引号内。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for place in "New York" "New Hampshire" "New Mexico"
do
    echo "now going to $place"
done

# 2.执行脚本。（输出内容符合预期。）
[root@localhost testdir]# ./test.sh 
now going to New York
now going to New Hampshire
now going to New Mexico
```

### 从变量中读取值列表

> 在 shell 脚本中经常遇到的情况是，你将一系列值**集中保存在**了**一个变量**中，然后需要**遍历该变量**中的整个值列表。

- **应用示例**：

```shell
# 1.脚本内容。（$list变量包含了用于迭代的值列表。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
list="A B C D"
list=$list" E"
#
for value in $list
do
    echo "value=$value"
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
value=A
value=B
value=C
value=D
value=E
```

- **提示**：脚本中还使用了另一个赋值语句向 $list 变量包含的值列表中**追加**（或者说是**拼接**）了一项。这是向变量中已有的**字符串尾部添加文本**的一种常用方法。

### 从命令中读取值列表

> 生成值列表的**另一种途径**是使用命令的输出。你可以用**命令替换**来执行任何能产生输出的命令，然后在 for 命令中**使用该命令的输出**。

- **应用示例**：

```shell
# 1.脚本内容。（对cat命令输出的文件内容进行遍历。）
# 提示：由于data.txt文件和脚本在同一目录则可以直接通过文件名读取，否则需要加上文件路径。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
file=data.txt
for value in $(cat $file)
do
    echo "value=$value"
done

# 2.数据文件内容。（注意文件中每个值各占一行，而不是以空格分隔。）
[root@localhost testdir]# cat data.txt 
A
B
C
D
E

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 
value=A
value=B
value=C
value=D
value=E
```

- for 命令仍然以**每次一行**的方式遍历 `cat` 命令的输出。但这**并没有解决数据中含有空格**的问题。如果你列出了一个含有空格的值，则 for 命令**仍然会用空格来分隔值**。
- **空格分隔问题**：

```shell
# 1.数据文件内容。（D所在行添加空格及值X。）
[root@localhost testdir]# cat data.txt 
A
B
C
D X
E

# 2.执行脚本。（D和X没有视为同一行，输出结果不符合预期。）
[root@localhost testdir]# ./test.sh 
value=A
value=B
value=C
value=D
value=X
value=E
```

### 更改字段分隔符

> 造成这个问题的原因是特殊的环境变量 IFS（ *internal field separator*，**内部字段分隔符**）。IFS 环境变量定义了 bash shell 用作字段分隔符的一系列字符。在**默认情况下**，bash shell 会将**下列字符**视为字段分隔符。
>
> - **空格**
> - **制表符**
> - **换行符**

- 如果 bash shell 在数据中看到了这些字符中的**任意一个**，那么它就**会认为**这是列表中的**一个新字段的开始**。
- 但是，在处理可能含有空格的数据（比如文件名）时，就会很麻烦了。
- **解决方法**：在 shell 脚本中**临时更改** IFS 环境变量的值来**限制**被 bash shell **视为字段分隔符的字符**。
- 如果想要告诉 bash shell **忽略**数据中的**空格和制表符**，使其**只能识别换行符**，则需要：

```shell
IFS=$'\n' 
```

- **应用示例**：

```shell
# 1.脚本内容。（IFS=$'\n'表示只识别换行符作为分隔符。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
file=data.txt
#
IFS=$'\n'
#
for value in $(cat $file)
do
    echo "value=$value"
done

# 2.数据文件内容。（D所在行添加了空格及值X。）
[root@localhost testdir]# cat data.txt 
A
B
C
D X
E

# 3.执行脚本。（只按换行符分隔，输出结果符合预期。）
[root@localhost testdir]# ./test.sh 
value=A
value=B
value=C
value=D X
value=E
```

- **注意事项**：在处理代码量较大的脚本时，可能在一个地方需要修改 IFS 的值，然后再将其恢复原状，而脚本的其他地方则继续沿用 IFS 的默认值。
- 一种**安全的做法**是在修改 IFS 之前**保存原来的** IFS 值，**之后再恢复它**（这就保证了在脚本的后续操作中使用的是 IFS 的默认值。）：

```shell
old=$IFS 
IFS=$'\n' 
# <在代码中使用新的 IFS 值> 
IFS=$old
```

- 如果要遍历文件中以**冒号分隔**的值（比如 `/etc/passwd` 文件），则只需将 IFS 的值设为冒号即可：

```shell
IFS=:
```

- 如果要**指定多个** IFS 字符，则只需在赋值语句中将这些字符**写在一起即可**：

```shell
# 该语句会将换行符、冒号、分号和双引号作为字段分隔符。
IFS=$'\n:;"'
```

- **如何使用** IFS 字符解析数据**没有任何限制**。

### 使用通配符读取目录

> 最后，还可以用 for 命令来自动**遍历目录中的文件**。为此，**必须在文件名或路径名中使用通配符**，这会**强制** shell 使用文件名通配符匹配（ *file globbing* ）。

- **文件名通配符匹配**是生成与指定通配符匹配的文件名或路径名的过程。
- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
path1=/home/tmp/*
path2=/home/tmp/AAA.log
#
for file in $path1 $path2
do
    #
    if [ -d $file ]
    then
        echo "$file is directory."
    #
    elif [ -f $file ]
    then
        echo "$file is file."
    #
    else
        echo "$file doesn't exist"
    fi
    #
done

# 2.脚本中指定的路径存在哪些文件和目录。
[root@localhost testdir]# ls -F /home/tmp/
a.txt  b.txt  c.txt  dir1/  dir2/

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 
/home/tmp/a.txt is file.
/home/tmp/b.txt is file.
/home/tmp/c.txt is file.
/home/tmp/dir1 is directory.
/home/tmp/dir2 is directory.
/home/tmp/AAA.log doesn't exist
```

- **注意事项**：可以在值列表中**放入任何**东西。**即使**文件或目录**不存在**，for 语句**也会尝试**把列表**处理完**。如果是和文件或目录打交道，那就要出问题了。**你无法知道正在遍历的目录是否存在，最好在处理之前先测试一下文件或目录。**

## C 语言风格的 for 命令

> bash shell 脚本中**可以使用**仿 C 语言的 for 命令。

### C 语言中的 for 命令

> C 语言中的 for 命令包含循环**变量初始化**、**循环条件**以及**每次迭代时修改变量的方法**。

- **C** **语言 for 代码**：

```shell
for (i = 0; i < 10; i++) 
{ 
    printf("The next number is %d\n", i); 
}
```

- bash 中**仿** **C** **语言的** **for** **循环**的**基本格式**如下：

```shell
for (( variable assignment ; condition ; iteration process ))

# 举个例子：
for (( a = 1; a < 10; a++ ))
```

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( i=1; i<=10; i++ ))
do
    echo "num=$i"
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
num=1
num=2
num=3
num=4
num=5
num=6
num=7
num=8
num=9
num=10
```

- **注意事项**：**有些地方**与 bash shell 标准的 for 命令**并不一致**：

  - 变量赋值可以有空格。
  - 迭代条件中的变量不以美元符号开头。
  - 迭代过程的算式不使用 `expr` 命令格式。

### 使用多个变量

> 仿 C 语言的 for 命令也允许为迭代**使用多个变量**。循环会**单独处理**每个变量，你可以为每个变量**定义不同的迭代过程**。尽管可以使用多个变量，**但只能**在 for **循环中定义一种迭代条件**。

- **应用示例**：

```shell
# 1.脚本内容。（同时迭代两个变量：a自增，b自减。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( a=1,b=10; a<=10; a++,b-- ))
do
    echo "a=$a - b=$b"
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
a=1 - b=10
a=2 - b=9
a=3 - b=8
a=4 - b=7
a=5 - b=6
a=6 - b=5
a=7 - b=4
a=8 - b=3
a=9 - b=2
a=10 - b=1
```

## while 命令

> while 命令允许定义一个要测试的命令，只要该命令返回的**退出状态码为** **0**，**就循环**执行一组命令。

### while 的基本格式

- **while** **命令的格式如下**：

```shell
while test command
do
    commands
done
```

- while 命令中定义的 *test command* 与 if-then 语句中的格式一模一样。
- while 命令的关键在于所指定的 *test command* 的**退出状态码必须随着循环中执行的命令而改变**。**如果**退出状态码**不发生变化**，那 while 循环**就成了死循环**。
- *test command* 最常见的用法是使用**方括号**来检查循环命令中用到的 shell 变量值。
- **应用示例**：

```shell
# 1.脚本内容。（判断条件：变量大于0就循环；迭代条件：变量每次自减1）。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num=3
while [ $num -gt 0 ]
do
    echo "num=$num"
    #
    num=$[ $num -1 ]
    #
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
num=3
num=2
num=1
```

### 使用多个测试命令

> while 命令允许在 while 语句行**定义多个测试命令**。**只有最后一个**测试命令的退出状态码会被用于**决定是否结束循环**。如果你不小心，这可能会导致一些有意思的结果。

- **应用示例**：

```shell
# 1.脚本内容。（while 语句中定义了两个测试命令，一是显示当前变量值；二是判断变量的值。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num=3
while echo "num=$num"
      [ $num -gt 0 ]
do
    echo " -> inside the loop."
    #
    num=$[ $num -1 ]
    #
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
num=3
 -> inside the loop.
num=2
 -> inside the loop.
num=1
 -> inside the loop.
num=0
```

- **注意事项**：

  - 含有多个命令的 while 语句中，在**每次**迭代时所有的测试命令**都会被执行，包括最后一个测试命令失败的末次迭代。**
  - 要把每个测试命令都**单独放在一行中**。

## until 命令

> **与** **while** **命令**工作的方式**完全相反**，until 命令要求指定一个返回非 0 退出状态码的测试命令。**一旦**测试命令**返回了**退出状态码 **0**，**循环就结束了**。

- **until** **命令的格式如下**：

```shell
until test command
do
    commands
done
```

- **应用示例**：

```shell
# 1.脚本内容。（直到变量值为0时循环停止。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num=100
until [ $num -eq 0 ]
do
    #
    echo "num=$num"
    #
    num=$[ $num -25 ]
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
num=100
num=75
num=50
num=25
```

- 与 while 命令类似，你**可以**在 until 命令语句中**放入多个** *test command*。
- **最后一个**命令的**退出状态码决定**了 bash shell **是否执行**已定义的其他 *commands*。
- **应用示例**：

```shell
# 1.脚本内容。（变量每次自减25，直到等于0。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num=100
until echo "num=$num"
      [ $num -eq 0 ]
do
    #
    echo " -> inside the loop."
    #
    num=$[ $num -25 ]
done

# 2.执行脚本。（仅当最后一个命令成立时才停止。）
[root@localhost testdir]# ./test.sh 
num=100
 -> inside the loop.
num=75
 -> inside the loop.
num=50
 -> inside the loop.
num=25
 -> inside the loop.
num=0
```

## 嵌套循环

> 循环语句可以在循环内使用任意类型的命令，包括其他循环命令，这称为**嵌套循环**。注意，在使用嵌套循环时是在迭代中再进行迭代，**命令运行的次数是乘积关系**。

- **嵌套** **for** **循环** - **应用示例**：

```shell
# 1.脚本内容。（外层循环两次，各内层循环两次。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( a=1; a<3; a++ ))
do
    echo "outer -> $a"
    #
    for (( b=1; b<3; b++ ))
    do
        echo -e "\t inside -> $b"
    done
    #
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
outer -> 1
  inside -> 1
  inside -> 2
outer -> 2
  inside -> 1
  inside -> 2
```

- 这个被嵌套的循环（也称为**内层循环**）会在**外部**循环的**每次**迭代中遍历一遍它所有的值。
- 还可以**混用循环**，比如 while 循环内部放置 for 循环：

```shell
# 1.脚本内容。（控制外层循环的变量每次自减5；控制内层循环的变量自减1。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash

a=10

while [ $a -gt 0 ]
do
    echo "outer -> $a"
    #
    for (( b=1; b<3; b++ ))
    do
        echo -e "\t inside -> $b"
    done
    #
    a=$[ $a -5 ]
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
outer -> 10
  inside -> 1
  inside -> 2
outer -> 5
  inside -> 1
  inside -> 2
```

- 同理，**也可以混用** until 循环。

## 循环处理文件数据

> 你经常需要**遍历文件中保存的数据**。这要求综合运用以下两种技术：
>
> - 使用嵌套循环。
> - 修改 IFS 环境变量。

- 通过**修改** **IFS** **环境变量**，能**强制** for 命令将文件中的**每一行**都作为**单独的条目**来处理，即便数据中有空格也是如此。
- 从文件中提取出单独的行后，可能还得**使用循环**来**提取**行中的**数据**。
- **应用示例**：

```shell
# 1.脚本内容。（这里使用了两个不同的 IFS 值来解析数据。第一个 IFS 值解析出/etc/passwd 文件中的各行。内层 for 循环接着将 IFS 的值修改为冒号，以便解析出/etc/passwd 文件各行中的字段。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash

path=/etc/passwd
old=$IFS
IFS=$'\n'

#
for entry in $(cat $path)
do
    echo "entry -> $entry"
    #
    IFS=:
    #
    for value in $entry
    do
        echo -e "\t $value"
    done
    #
done
#
IFS=$old

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
entry -> root:x:0:0:root:/root:/bin/bash
  root
  x
  0
  0
  root
  /root
  /bin/bash
...
```

## 循环控制

> 有**两个**命令可以**控制循环的结束时机**：
>
> - break 命令。
> - continue 命令。

### break 命令

> 你可以用 break 命令**退出任意类型的循环**，包括 while 循环和 until 循环。

- **跳出单个循环 - 应用示例**：

```shell
# 1.脚本内容。（变量自增到3的时候退出循环。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( i=0; i<10; i++ ))
do
    echo "i=$i"
    #
    if [ $i -eq 3 ]
    then
        break;
    fi
    #
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
i=0
i=1
i=2
i=3
```

- **跳出内层循环 - 应用示例**：

```shell
# 1.脚本内容。（控制内层循环次数。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( a=1; a<3; a++ ))
do
    echo "outer->$a"
    #
    for (( b=1; b<100; b++ ))
    do
        echo -e "\t inside->$b"
        #
        if [ $b -eq 2 ]
        then
            break
        fi
        #
    done
    #
done

# 2.执行脚本。（内层循环最多只执行两次。）
[root@localhost testdir]# ./test.sh 
outer->1
  inside->1
  inside->2
outer->2
  inside->1
  inside->2
```

- **提示**：即使 break 命令结束了内层循环，外层循环**依然会**继续执行。
- 有时你位于内层循环，但**需要结束外层循环**。break 命令接受单个命令行参数：

```shell
break n
```

- n 指定了要跳出的循环层级。
- 在**默认情况**下，n 为 1（表明跳出的是**当前**循环），如果将 n 设置为 **2**，那么 break 命令就会**停止下一级**的外层循环。
- **跳出外层循环 - 应用示例**：

```shell
# 1.脚本内容。（将break设置为2，进入逻辑则终止外层循环。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( a=1; a<3; a++ ))
do
    echo "outer->$a"
    #
    for (( b=1; b<100; b++ ))
    do
        echo -e "\t inside->$b"
        #
        if [ $b -eq 2 ]
        then
            break 2
        fi
        #
    done
    #
done

# 2.执行脚本。（外层循环只执行了一次。）
[root@localhost testdir]# ./test.sh 
outer->1
  inside->1
  inside->2
```

### continue 命令

> continue 命令可以提前**中止某次**循环，但**不会结束整个**循环。

- **应用示例**：

```shell
# 1.脚本内容。（跳过10以内的偶数。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
for (( i=0; i<10; i++ ))
do
    evenNum=$[$i % 2]
    #
    if [ $evenNum -eq 0 ]
    then
        continue
    fi
    #
    echo "$i"
done

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
1
3
5
7
9
```

- 和 break 命令一样，continue 命令也允许通过命令行参数指定**要继续执行哪一级循环**：

```shell
continue n
```

- 其中 *n* 定义了要继续的**循环层级**。

## 处理循环的输出

> 在 shell 脚本中，**可以**对循环的输出**进行重定向**或进行**管道操作**。

- **对循环输出进行重定向 - 应用示例**：

```shell
# 1.脚本内容。（遍历目标目录的文件，将输出信息重定向至新文本。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
files=/home/tmp/*
#
for file in $files
do
    #
    if [ -f $file ]
    then
        echo "$file is file. "
    fi
    #
done > output.txt
#

# 2.列出指定目录的文件有哪些。
[root@localhost testdir]# ls -F /home/tmp/
a.txt  b.txt  c.txt  dir1/  dir2/

# 3.执行脚本。
[root@localhost testdir]# ./test.sh 

# 4.查看生成的重定向文本。
[root@localhost testdir]# cat output.txt 
/home/tmp/a.txt is file. 
/home/tmp/b.txt is file. 
/home/tmp/c.txt is file.
```

- **使用管道符操作循环输出 - 应用示例**：

```shell
# 1.脚本内容。（将元素通过管道符传给sort命令进行排序输出。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
list="D B A C"
for val in $list
do
    echo "$val"
done | sort

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 
A
B
C
D
```
