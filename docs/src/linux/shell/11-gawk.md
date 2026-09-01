# Gawk高级用法

## 使用变量

> 所有编程语言共有的一个重要特性是使用变量来存取值。`gawk` 编程语言**支持两类变量**。
>
> - 内建变量。
> - 自定义变量。

### 内建变量

> `gawk` 脚本使用**内建变量**来引用一些特殊的功能。

#### 字段和记录分隔符变量

- 数据字段由字段**分隔符**划定。
- 在**默认情况下**，字段分隔符是一个**空白字符**，也就是空格或者制表符。
- 使用命令行选项 -F，或是在 `gawk` 脚本中使用特殊内建变量 FS **修改**字段分隔符。
- `gawk` **数据字段和记录变量**：

|    变量     | 描述                                                 |
| :---------: | :--------------------------------------------------- |
| FIELDWIDTHS | 由空格分隔的一列数字，定义了每个数据字段的确切宽度。 |
|     FS      | 输入字段分隔符。                                     |
|     RS      | 输入记录分隔符。                                     |
|     OFS     | 输出字段分隔符                                       |
|     ORS     | 输出记录分隔符。                                     |

- 变量 **FS** 定义记录中的字段分隔符，变量 **OFS** 具备**相同的功能**，只不过是用于 print 命令的输出。
- 在**默认情况下**，`gawk` 会将 **OFS** 变量的值设置为一个**空格**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
data11,data12,data13,data14,data15 
data21,data22,data23,data24,data25 
data31,data32,data33,data34,data35
[root@localhost testdir]# 

# 2.根据逗号分隔，并打印前三个数据字段。
[root@localhost testdir]# gawk 'BEGIN{FS=","} {print $1,$2,$3}' data.txt
data11 data12 data13
data21 data22 data23
data31 data32 data33
[root@localhost testdir]# 

# 3.通过设置（OFS）变量，可以在输出中用任意字符串来分隔字段。
[root@localhost testdir]# gawk 'BEGIN{FS="," ; OFS="-"} {print $1,$2,$3}' data.txt 
data11-data12-data13
data21-data22-data23
data31-data32-data33
[root@localhost testdir]# 
```

- 有些应用程序**并没有使用字段分隔符**，而是将数据放置在记录中的**特定列**。
- 在这种情况下，**必须**设定 FIELDWIDTHS 变量来匹配数据在记录中的位置。
- **一旦设置了** **FIELDWIDTHS 变量**，`gawk` 就**会忽略** FS 变量，并根据提供的**字段宽度**来计算字段：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
1005.3247596.37 
115-2.349194.00 
05810.1298100.1
[root@localhost testdir]# 

# 2.（FIELDWIDTHS）变量定义了 4 个数据字段，每个记录中的数字串会根据已定义好的字段宽度来分割。
[root@localhost testdir]# gawk 'BEGIN{FIELDWIDTHS="3 5 2 5"} {print $1,$2,$3,$4}' data.txt 
100 5.324 75 96.37
115 -2.34 91 94.00
058 10.12 98 100.1
[root@localhost testdir]#
```

- **注意事项**：一旦设定了 FIELDWIDTHS 变量的值，就**不能再改动了**。这种方法并**不适用于变长的数据字段**。
- 在**默认情况下**，`gawk` 会将 **RS** 和 **ORS** 设置为**换行符**。
- 有时，你会在数据流中碰到占据**多行的记录**，典型的例子是在包含地址和电话号码的数据中，地址和电话号码各占一行：

```shell
Zhang San
SiChuan ChengDu
158-xxxx-xxxx
```

- 如果用默认的 FS 变量和 RS 变量值来读取这组数据，`gawk` 就会把每一行作为一条**单独的记录**来读取，并将其中的空格作为字段分隔符，提取的结果可能**不符合预期**。
- 要**解决**这个问题，需要把 **FS** 变量设置成**换行符**。再把 **RS** 变量设置成**空字符串**，然后在**数据记录之间留一个空行**。`gawk` 会把每一个空行都视为记录分隔符：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Zhang San
SiChuan ChengDu
158-xxxx-xxxx

Li Si
HuNan ChangSha
137-xxxx-xxxx
[root@localhost testdir]# 

# 2.将每一行都视为一个字段，将空行作为记录分隔符。
[root@localhost testdir]# gawk 'BEGIN{FS="\n" ; RS=""} {print $1,$3}' data.txt
Zhang San 158-xxxx-xxxx
Li Si 137-xxxx-xxxx
[root@localhost testdir]# 
```

------

#### 数据变量

> `gawk` 还提供了一些**其他的内建变量**以帮助你了解数据发生了什么变化，并提取 shell 环境的信息。

- **更多的** `gawk` **内建变量**：

|    变量    | 描述                                                         |
| :--------: | :----------------------------------------------------------- |
|    ARGC    | 命令行参数的数量。                                           |
|   ARGIND   | 当前处理的文件在 ARGV 中的索引。                             |
|    ARGV    | 包含命令行参数的数组。                                       |
|  CONVFMT   | 数字的转换格式（参见 printf 语句），默认值为%.6g。           |
|  ENVIRON   | 当前 shell 环境变量及其值组成的关联数组。                    |
|   ERRNO    | 当读取或关闭输入文件发生错误时的系统错误号。                 |
|  FILENAME  | 用作 gawk 输入的数据文件的名称。                             |
|    FNR     | 当前数据文件中的记录数。                                     |
| IGNORECASE | 设成非 0 值时，忽略 gawk 命令中出现的字符串的大小写。        |
|     NF     | 数据文件中的字段总数。                                       |
|     NR     | 已处理的输入记录数。                                         |
|    OFMT    | 数字的输出显示格式。默认值为%.6g.，以浮点数或科学计数法显示，以较短者为准，最多使用 6 位小数。 |
|  RLENGTH   | 由 match 函数所匹配的子串的长度。                            |
|   RSTART   | 由 match 函数所匹配的子串的起始位置。                        |

- **提示**：跟 shell 变量不同，在**脚本中引用** `gawk` 变量时，变量名前**不用加美元符号**。
- **应用示例**：

```shell
# 1.（ENVIRON）分别提取HOME和PATH环境变量的值。
[root@localhost testdir]# gawk 'BEGIN{
>     print ENVIRON["HOME"]
>     print ENVIRON["PATH"]
> }'
/root
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
[root@localhost testdir]# 

# 2.（NF）变量可以让你在不知道具体位置的情况下引用记录中的最后一个数据字段。
# 提示：（$NF）是一种特殊的语法用法，用于引用每一行的最后一个字段的值。而（NF）变量则表示每一行的字段数。
[root@localhost testdir]# cat data.txt 
Jan SiChuan ChengDu 158-xxxx-xxxx
Rose HuNan ChangSha 137-xxxx-xxxx
[root@localhost testdir]# 
[root@localhost testdir]# gawk 'BEGIN{FS=" " ; OFS=":"} {print $1,$NF}' data.txt 
Jan:158-xxxx-xxxx
Rose:137-xxxx-xxxx
[root@localhost testdir]# 
[root@localhost testdir]# gawk 'BEGIN{FS=" " ; OFS=":"} {print NF}' data.txt 
4
4
[root@localhost testdir]# 
```

------

### 自定义变量

> 跟其他典型的编程语言一样，`gawk` 允许你在脚本中定义自己的变量。

- `gawk` 自定义变量的名称由任意数量的字母、数字和下划线组成，但**不能以数字开头**。
- 还有一点，`gawk` 变量名**区分大小写**，这很重要。
- **在脚本中给变量赋值**：

```shell
# 1.gawk 变量可以保存数值或文本值。
## gawk 编程语言包含了用来处理数值的标准算术运算符，其中包括求余运算符（%）和幂运算符（^或**）。
[root@localhost testdir]# gawk 'BEGIN{
>     str="hello world!"
>     print str
>     num=1 + 1
>     print num
> }'
hello world!
2
[root@localhost testdir]# 
```

- **在命令行中给变量赋值**：

```shell
# 1.（-v var="..."）表示给变量var赋值为"..."。然后，（BEGIN）块中的代码会被执行，其中（print var）用于打印量的值。
[root@localhost testdir]# gawk -v var="hello world" 'BEGIN {print var}'
hello world
[root@localhost testdir]# 
```

## 处理数组

> `gawk` 编程语言使用**关联数组**来提供数组功能。

- 与数字型数组（ *numerical array* ）不同，关联数组的**索引**可以是**任意文本字符串**。你不需要用连续的数字来标识数组元素。
- 每个索引字符串都必须能够**唯一地标识**出分配给它的数组元素。
- 这跟**哈希表**和**字典**是**同一个概念**。

### 定义数组变量

> 可以用标准赋值语句来定义数组变量。

- 数组变量**赋值**的格式如下：

```shell
# （var）是变量名，（index）是关联数组的索引值，（element）是数组元素值。
var[index] = element
```

- **应用示例**：

```shell
# 1.在引用数组变量时，必须包含索引，以便提取相应的数组元素值。
[root@localhost testdir]# gawk 'BEGIN{
>     student["jan"]="Jan have a excellent grades."
>     print student["jan"]
>     num[1]=10
>     num[2]=18
>     print num[1] + num[2]
> }'
Jan have a excellent grades.
28
[root@localhost testdir]# 
```

### 遍历数组变量

- 要在 `gawk` 脚本中**遍历**关联数组，可以用 for 语句的一种特殊形式：

```shell
for (var in array) 
{ 
 statements
}
```

- **应用示例**：

```shell
# 1.遍历操作。
[root@localhost testdir]# gawk 'BEGIN{
>     elements["a"]=1
>     elements["b"]=2
>     elements["c"]=3
>     for (key in elements){
>         print "key:"key "\t" "value:"elements[key]
>     }
> }'
key:a value:1
key:b value:2
key:c value:3
[root@localhost testdir]# 
```

- **注意事项**：索引值**没有特定的返回顺序**，但它们都能够指向对应的数组元素值。

### 删除数组变量

- 从关联数组中**删除**数组元素要使用一个特殊的命令：

```shell
delete array[index]
```

- **应用示例**：

```shell
# 1.删除数组变量，对比前后结果。
[root@localhost testdir]# gawk 'BEGIN{
>     elements["a"]=1
>     elements["b"]=2
>     print "------before:------"
>     for (key in elements){
>         print "key:"key "\t" "value:"elements[key]
>     }
>     delete elements["a"]
>     print "------after:------"
>     for (key in elements){
>         print "key:"key "\t" "value:"elements[key]
>     }
> }'
------before:------
key:a value:1
key:b value:2
------after:------
key:b value:2
[root@localhost testdir]# 
```

- **注意事项**：**一旦**从关联数组中**删除索引值**，**就不能**再用它来**提取**数组元素值了。

## 使用模式

> 关键字 BEGIN 和 END 可以在读取数据流之前或之后执行命令的特殊模式。同样，你可以创建其他模式，在数据流中出现匹配数据时执行命令。

### 正则表达式

> 你可以用基础正则表达式（BRE）或扩展正则表达式（ERE）来筛选脚本要作用于数据流中的哪些行。

- 在使用正则表达式时，它**必须出现在**与其对应脚本的**左花括号前**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Jan SiChuan ChengDu 158-xxxx-xxxx
Rose HuNan ChangSha 137-xxxx-xxxx
[root@localhost testdir]# 

# 2.匹配有158的行。
[root@localhost testdir]# gawk 'BEGIN{FS=" "} /158.*/{print $0}' data.txt 
Jan SiChuan ChengDu 158-xxxx-xxxx
[root@localhost testdir]# 
```

### 匹配操作符

> 匹配操作符（~）能将正则表达式**限制**在记录的特定数据字段。

- 可以指定匹配操作符、数据字段变量以及要匹配的正则表达式，举个例子：

```shell
# 该表达式会过滤出第一个数据字段以文本 data 开头的所有记录。
$1 ~ /^data/
```

- **应用示例**：

```shell
# 1.不加操作符，匹配/etc/passwd含有root的行。（匹配到了两条记录。）
[root@localhost testdir]# gawk 'BEGIN{FS=":"} /root/{print $0}' /etc/passwd
root:x:0:0:root:/root:/bin/bash
operator:x:11:0:operator:/root:/sbin/nologin
[root@localhost testdir]# 

# 2.加操作符，限定第一个数据字段为root进行匹配。（只匹配到了一条记录。）
[root@localhost testdir]# gawk 'BEGIN{FS=":"} $1 ~ /root/{print $0}' /etc/passwd
root:x:0:0:root:/root:/bin/bash
[root@localhost testdir]# 
```

- 也可以用**感叹号**（!）符号来**排除**正则表达式的匹配：

```shell
# 如果在记录中没有找到匹配正则表达式的文本，就对该记录执行脚本。
$1 !~ /expression/
```

### 数学表达式

> 除了正则表达式，也可以在匹配模式中使用数学表达式。这个功能在匹配数据字段中的数值时非常方便。

- 数学表达式**必须完全匹配**。
- **常见的数学比较表达式**：

| 表达式 | 描述                    |
| :----: | :---------------------- |
| x == y | x 的值等于 y 的值。     |
| x <= y | x 的值小于等于 y 的值。 |
| x < y  | x 的值小于 y 的值。     |
| x >= y | x 的值大于等于 y 的值。 |
| x > y  | x 的值大于 y 的值。     |

- **应用示例**：

```shell
# 1.匹配/etc/passwd第一个数据字段等于"root"的行。（存在）
[root@localhost testdir]# gawk 'BEGIN{FS=":"} $1 == "root"{print $0}' /etc/passwd
root:x:0:0:root:/root:/bin/bash

# 2.匹配/etc/passwd第一个数据字段等于"root999"的行。（不存在）
[root@localhost testdir]# gawk 'BEGIN{FS=":"} $1 == "root999"{print $0}' /etc/passwd
[root@localhost testdir]# 
```

## 结构化命令

> `gawk` 编程语言支持常见的结构化编程命令。

### if 语句

- **格式如下所示**：

```shell
# 条件为TRUE则执行，为FALSE则跳过该语句。

if (condition) {
   # 执行操作1
} else if (condition) {
   # 执行操作2
} else {
   # 执行操作3
}
```

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat temp.awk 
BEGIN{
    if(num == 0){
        print "0"
    }else if (num > 0){
        print num " > 0"
    }else{
        print num " < 0"
    }
}
[root@localhost testdir]# 

# 2.变量设置为10，执行脚本。
[root@localhost testdir]# gawk -v num=10 -f temp.awk 
10 > 0
[root@localhost testdir]# 

# 3.变量设置为-1，执行脚本。
[root@localhost testdir]# gawk -v num=-1 -f temp.awk 
-1 < 0
[root@localhost testdir]# 

# 4.变量设置为0，执行脚本。
[root@localhost testdir]# gawk -v num=0 -f temp.awk 
0
[root@localhost testdir]# 
```

### while 语句

- **格式如下所示**：

```shell
while (condition) 
{ 
    statements 
}
```

- **应用示例**：

```shell
# 1.脚本内容。（求10以内数之和。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
    num=0
    total=0
    while(num < 100){
        if(num == 11){
            break
        }
        total += num
        num ++
    }
    print "result=" total
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
result=55
[root@localhost testdir]# 
```

- `gawk` 编程语言支持在 while 循环中使用 break 语句和 continue 语句，允许从循环中跳出。

### do-while 语句

- **格式如下所示**：

```shell
# statements 会在条件被求值之前至少执行一次。

do {
    statements
}while(condition)
```

- **应用示例**：

```shell
# 1.脚本内容。（sum大于零就执行循环。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
    sum=0
    do{
        print "sum=" sum
        sum --
    }while(sum > 0)
}
[root@localhost testdir]# 

# 2.执行脚本。（do语句块至少会被执行一次。）
[root@localhost testdir]# gawk -f temp.awk 
sum=0
[root@localhost testdir]# 
```

### for 语句

> `gawk` 编程语言支持 C 风格的 for 循环。

- **格式如下所示**：

```shell
for( variable assignment; condition; iteration process)
```

- **应用示例**：

```shell
# 1.脚本内容。（打印 0 ~ 2。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
    for(i=0 ; i<3 ; i++){
        print i
    }
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
0
1
2
[root@localhost testdir]# 
```

## 格式化打印

> 可以使用**格式化**打印命令 printf。

- **printf** **命令的格式如下**：

```shell
printf "format string", var1, var2
```

- format string 是格式化输出的**关键**。它会用文本元素和**格式说明符**（ *format specifier* ）来具体指定如何呈现格式化输出。
- 格式说明符是一种特殊的代码，可以**指明**显示**什么类型**的变量以及**如何显示**。
- `gawk` 脚本会将每个格式说明符作为**占位符**，供命令中的每个变量使用。
- **格式说明符的格式如下**：

```shell
# modifier 定义了可选的格式化特性。

# control-letter 是一个单字符代码，用于指明显示什么类型的数据。

%[modifier]control-letter
```

- **格式说明符的控制字母**：

| 控制字母 | 描述                                         |
| :------: | :------------------------------------------- |
|   `c`    | 将数字作为 ASCII 字符显示。                  |
|   `d`    | 显示整数值。                                 |
|   `i`    | 显示整数值。（和 d 一样）                    |
|   `e`    | 用科学计数法显示数字。                       |
|   `f`    | 显示浮点值。                                 |
|   `g`    | 用科学计数法或浮点数显示。（较短的格式优先） |
|   `o`    | 显示八进制值。                               |
|   `s`    | 显示字符串。                                 |
|   `x`    | 显示十六进制值。                             |
|   `X`    | 显示十六进制值，但用大写字母 A~F。           |

- **应用示例**：

```shell
# 1.脚本内容。（格式化打印字符串和数值类型的值。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
    str="hello world!"
    num= 1 + 1
    printf "str=%s,num=%d\n",str,num 
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
str=hello world!,num=2
[root@localhost testdir]# 
```

- 除了控制字母，还有 **3** **种**修饰符可以**进一步控制输出**：
- **width**：指定输出字段的最小宽度。如果输出短于这个值，则 printf 会将**文本右对齐**，并用**空格进行填充**。如果输出比指定的宽度长，则按照实际长度输出。

```shell
# 1.字段宽度修饰符：%10s，用于指定输出的字段宽度为10个字符。如果输出的字符串长度小于10个字符，则在左侧补空格。
[root@localhost testdir]# echo "Hello" | gawk '{ printf "Value: %10s\n", $1 }'
Value:      Hello
[root@localhost testdir]# 
```

- **prec**：指定浮点数中**小数点**右侧的**位数**或者**字符串**中显示的**最大字符数**。

```shell
# 1.精度修饰符：%.2f，用于保留浮点数类型的值的小数点后两位。
[root@localhost testdir]# echo "3.1415926" | gawk '{ printf "Value: %.2f\n", $1 }'
Value: 3.14
[root@localhost testdir]# 

# 2.通过设置prec参数为5，限制字符串的输出长度为最多5个字符。结果输出为 "Hello"。
[root@localhost testdir]# echo "Hello, World" | gawk '{ printf "%.*s\n", 5, $0 }'
Hello
[root@localhost testdir]# 
```

- **-（减号）**：指明**格式化空间**（formatted space）中的数据采用**左对齐**而非右对齐。

```shell
# 1.字符串"Hello"被格式化为一个10个字符宽的字段，并且左对齐。
[root@localhost testdir]# echo | gawk '{ printf "%-10s\n", "Hello" }'
Hello     
[root@localhost testdir]# 

# 2.不使用"-"修饰，则是按照默认右对齐。
[root@localhost testdir]# echo | gawk '{ printf "%10s\n", "Hello" }'
     Hello
[root@localhost testdir]# 
```

## 内建函数

> `gawk` 编程语言提供了不少**内置函数**，以用于执行一些常见的**数学**、**字符串**以及**时间运算**。

### 数学函数

- `gawk` **数学函数**：

|      函数       | 描述                                        |
| :-------------: | :------------------------------------------ |
| atan2(*x*, *y*) | *x*/*y* 的反正切，*x* 和 *y* 以弧度为单位。 |
|    cos(*x*)     | *x* 的余弦，*x* 以弧度为单位。              |
|   e*x*p(*x*)    | *x* 的指数。                                |
|    int(*x*)     | *x* 的整数部分，取靠近 0 一侧的值。         |
|    log(*x*)     | *x* 的自然对数。                            |
|     rand( )     | 比 0 大且比 1 小的随机浮点值。              |
|    sin(*x*)     | *x* 的正弦，*x* 以弧度为单位。              |
|    sqrt(*x*)    | *x* 的平方根。                              |
|   srand(*x*)    | 为计算随机数指定一个种子值。                |

- **应用示例**：

```shell
# 1.脚本内容。（执行10次循环，每次返回一个 0~9（包括 0 和 9）的随机整数值。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
 for(i=0; i<10; i++){
        x = int(10 * rand())
        printf "value=%d \n",x
 }
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
value=2 
value=2 
value=8 
value=1 
value=5 
value=1 
value=8 
value=1 
value=4 
value=1 
[root@localhost testdir]# 
```

- 除了标准数学函数，`gawk` 还支持一些**按位操作数据的函数**：

  - and(*v1*, *v2*)：对 *v1* 和 *v2* 执行按位 AND 运算。
  - compl(*val*)：对 *val* 执行补运算。
  - lshift(*val*, *count*)：将 *val* 左移 count 位。
  - or(*v1*, *v2*)：对 *v1* 和 *v2* 执行按位 OR 运算。
  - rshift(*val*, *count*)：将 *val* 右移 count 位。
  - xor(*v1*, *v2*)：对 *v1* 和 *v2* 执行按位 XOR 运算。

### 字符串函数

- `gawk` **字符串函数**：

|              函数              | 描述                                                         |
| :----------------------------: | :----------------------------------------------------------- |
|       asort(*s* [,*d*])        | 将数组 *s* 按照数组元素值排序。索引会被替换成表示新顺序的连续数字。另外，如果指定了 *d*，则排序后的数组会被保存在数组 *d* 中。 |
|       asorti(*s* [,*d*])       | 将数组 *s* 按索引排序。生成的数组会将索引作为数组元素值，用连续数字索引表明排序顺序。另外，如果指定了 *d*，则排序后的数组会被保存在数组 *d* 中。 |
|  gensub(*r*, *s*, *h* [,*t*])  | 针对变量 $0 或目标字符串 *t*（如果提供了的话）来匹配正则表达式 *r*。如果 *h* 是一个以 *g* 或 *G* 开头的字符串，就用 *s* 替换匹配的文本。如果 *h* 是一个数字，则表示要替换 *r* 的第 *h* 处匹配。 |
|     gsub(*r*, *s* [,*t*])      | 针对变量 $0 或目标字符串 *t*（如果提供了的话）来匹配正则表达式 *r*。如果找到了，就将所有的匹配之处全部替换成字符串 *s*。 |
|        index(*s*, *t*)         | 返回字符串 *t* 在字符串 *s* 中的索引位置；如果没找到，则返回 0。 |
|         length([*s*])          | 返回字符串 *s* 的长度；如果没有指定，则返回 $0 的长度。      |
|     match(*s*, *r* [,*a*])     | 返回正则表达式 *r* 在字符串 *s* 中匹配位置的索引。如果指定了数组 *a*，则将 *s* 的匹配部分保存在该数组中。 |
|     split(*s*, *a* [,*r*])     | 将 *s* 以 FS（字段分隔符）或正则表达式 *r*（如果指定了的话）分割并放入数组 *a* 中。返回分割后的字段总数。 |
| sprintf(*format*, *variables*) | 用提供的 *format* 和 *variables* 返回一个类似于 printf 输出的字符串。 |
|      sub(*r*, *s* [,*t*])      | 在变量$0 或目标字符串 *t* 中查找匹配正则表达式 *r* 的部分。如果找到了，就用字符串 *s* 替换第一处匹配。 |
|    substr(*s*, *i* [,*n*])     | 返回 *s* 中从索引 *i* 开始、长度为 *n* 的子串。如果未提供 *n*，则返回 *s* 中剩下的部分。 |
|          tolower(*s*)          | 将 *s* 中的所有字符都转换成小写。                            |
|          toupper(*s*)          | 将 *s* 中的所有字符都转换成大写。                            |

- **应用示例**：

```shell
# 1.获取字符串长度。
[root@localhost testdir]# gawk 'BEGIN{ str="aaa" ; print "len=" length(str)}'
len=3
[root@localhost testdir]# 

# 2.将字母转化为大写。
[root@localhost testdir]# gawk 'BEGIN{ str="aaa" ; print "uppercase=" toupper(str)}'
uppercase=AAA
[root@localhost testdir]# 
```

### 时间函数

- 时间函数多用于处理日志文件。日志文件中通常含有需要进行比较的日期。
- `gawk` **的时间函数**：

|                函数                | 描述                                                         |
| :--------------------------------: | :----------------------------------------------------------- |
|         mktime(*datespec*)         | 将一个按 YYYY MM DD HH MM SS [DST]格式指定的日期转换成时间戳。 |
| strftime(*format* [, *timestamp*]) | 将当前时间的时间戳或 timestamp（如果提供了的话）转化为格式化日期。（采用 shell 命令 date 的格式） |
|             systime()              | 返回当前时间的时间戳。                                       |

- **应用示例**：

```shell
# 1.脚本内容。（将当前时间戳格式化为日期。）
[root@localhost testdir]# cat temp.awk 
BEGIN{
    now=systime()
    today=strftime("%A, %B %d, %Y",now)
    printf "today is :%s \n",today
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
today is :Saturday, July 08, 2023 
[root@localhost testdir]# 
```

## 自定义函数

> 除了 `gawk` 中的内建函数，还可以在 `gawk` 脚本中**创建自定义函数**。

### 定义函数

- 要定义自己的函数，**必须使用** **function** **关键字**：

```shell
function name([variables]) 
{ 
 statements
}
```

- **函数名**必须能够**唯一**标识函数。
- 你可以在调用该函数的 `gawk` 脚本中向其传入**一个或多个**变量。
- **举个例子**：

```shell
# 1.定义一个有返回值的函数。
function myrand(limit) 
{ 
 return int(limit * rand()) 
}

# 2.返回值赋给变量x。
x = myrand(100)
```

### 使用自定义函数

> 在**定义函数**时，它**必须出现在所有代码块之前**（包括 BEGIN 代码块）。

- **应用示例**：

```shell
# 1.脚本内容。（定义一个函数，并在BEGIN块完成调用。）
[root@localhost testdir]# cat temp.awk 
function hello(){
    return "hello world"
}

BEGIN{
 value=hello()
    printf "value=%s \n",value
}
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.awk 
value=hello world 
[root@localhost testdir]# 
```

### 创建函数库

> `gawk` 提供了一种方式以将多个函数**放入单个库文件中**，这样就可以在**所有的** `gawk` 脚本中**使用**了。

- 要使用库，只要创建好 `gawk` 脚本文件，然后在**命令行**中同时**指定库文件**和**脚本文件**即可。
- **应用示例**：

```shell
# 1.创建函数库。
[root@localhost testdir]# cat myfunclib.awk 
function hello(){
    return "hello world"
}
[root@localhost testdir]# 

# 2.脚本直接调用函数。
[root@localhost testdir]# cat temp.awk 
BEGIN{
    value=hello()
    printf "value=%s \n",value
}
[root@localhost testdir]# 

# 3.执行时通过多个（-f）选项指定文件。
[root@localhost testdir]# gawk -f myfunclib.awk -f temp.awk 
value=hello world 
[root@localhost testdir]# 
```
