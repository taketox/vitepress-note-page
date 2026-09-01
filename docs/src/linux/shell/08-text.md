# 文本处理

> 如果想在 shell 脚本中处理各种数据，则**必须熟悉** Linux 中的 `sed` 和 `gawk`。这两款工具能够极大地**简化数据处理**任务。

- 有时候你会发现自己想要**即时处理**文本文件中的文本，但又不想动用全副武装的交互式文本编辑器。

- 在这种情况下，有一个可以自动格式化、插入、修改或删除文本元素的简单的**命令行编辑器**就方便多了。

- 有**两款**常见工具兼具上述功能：

  - `sed`
  - `gawk`

## sed 编辑器

> `sed` 编辑器被称作**流编辑器**。（ *stream editor* ）

- 在**交互式文本编辑器**（比如 `Vim`）中，可以用**键盘命令**交互式地插入、删除或替换文本数据。

- **流编辑器**则是根据事先设计好的一组**规则编辑**数据流。

- `sed` 编辑器可以执行**下列操作**：

  - 从输入中**读取**一行数据。
  - 根据所提供的编辑器命令**匹配**数据。
  - 按照命令**修改**数据流中的数据。
  - 将新的数据**输出**到 STDOUT。

- 在流编辑器匹配并针对**一行**数据**执行所有命令**之后，会读取**下一行**数据并**重复**这个过程。

- 在流编辑器**处理完**数据流中的**所有行**后，就**结束运行**。

- 由于命令是按**顺序逐行执行**的，因此 `sed` 编辑器**只需对数据流处理一遍**（ *one pass through* ）即可完成编辑操作。

- `sed` 编辑器要比交互式编辑器**快得多**，并且可以快速完成对数据的**自动修改**。

- `sed` **命令的格式如下**：

```shell
# options 参数允许修改 sed 命令的行为。

# script 参数指定了应用于流数据中的单个命令。

# 如果需要多个命令，则要么使用-e 选项在命令行中指定，要么使用-f 选项在单独的文件中指定。

sed options script file
```

- `sed` **常用命令选项**：

|     选项      | 描述                                                   |
| :-----------: | :----------------------------------------------------- |
| -e *commands* | 在处理输入时，加入额外的 `sed` 命令。                  |
|   -f *file*   | 在处理输入时，将 file 中指定的命令添加到已有的命令中。 |
|      -n       | 不产生命令输出，使用 p（print）命令完成输出。          |

------

### 在命令行中定义编辑器命令

- 在**默认情况下**，`sed` 编辑器会将指定的命令**应用于** **STDIN** 输入流中。
- 因此，可以直接将数据通过**管道传入** `sed` 编辑器**进行处理**：

```shell
# 1.使用sed命令将输入流的"green"替换为"blue"，处理完成后输出。
# 格式说明：'s/替换前的字符串/替换后的字符串/' 
[root@localhost testdir]# echo "This is green." | sed 's/green/blue/' 
This is blue.
```

- 你可以**同时**对数据做出**多处修改**，所消耗的时间差不过刚够一些交互式编辑器启动而已。
- `sed` 编辑器**并不会修改文本文件的数据**。它只是将**修改后**的数据**发送到** STDOUT：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
AAA
AAA
AAA

# 2.使用sed，将内容的"AAA"批量替换为"BBB"。
[root@localhost testdir]# sed 's/AAA/BBB/' data.txt 
BBB
BBB
BBB

# 3.替换完成，但是原文件数据不变。
[root@localhost testdir]# cat data.txt 
AAA
AAA
AAA
```

------

### 在命令行中使用多个编辑器命令

- 如果要在 `sed` 命令行中**执行多个命令**，可以使用 **-e** 选项：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
AAA
AAA
BBB
BBB

# 2.命令之间必须以分号（;）分隔，并且在命令末尾和分号之间不能出现空格。
[root@localhost testdir]# sed -e 's/AAA/CCC/ ; s/BBB/DDD/' data.txt 
CCC
CCC
DDD
DDD

# 3.如果不想用分号，那么也可以用 bash shell 中的次提示符来分隔命令。
# 注意：必须记住，要在闭合单引号所在行结束命令。bash shell 一旦发现了闭合单引号，就会执行命令。
[root@localhost testdir]# sed -e '
> s/AAA/CCC/
> s/BBB/DDD/' data.txt
CCC
CCC
DDD
DDD
```

------

### 从文件中读取编辑器命令

- 如果有**大量**要执行的 `sed` 命令，那么将其**放进单独的文件**通常会更方便一些。
- 可以在 `sed`命令中用 **-f** 选项来指定文件：

```shell
# 1.sed脚本内容。
[root@localhost testdir]# cat replace.sed 
s/AAA/CCC/
s/BBB/DDD/

# 2.原文件数据。
[root@localhost testdir]# cat data.txt 
AAA
AAA
BBB
BBB

# 3.执行脚本。
[root@localhost testdir]# sed -f replace.sed data.txt 
CCC
CCC
DDD
DDD
```

- 使用这种方式，**不用**在每条命令后面**加分号**。
- **提示**：`sed` 编辑器脚本文件容易与 bash shell 脚本**文件混淆**。为了**避免这种情况**，可以**使用** **.**`sed` 作为 `sed` 脚本**文件的扩展名**。

------

## gawk 编辑器

> `sed` 编辑器非常**方便**，可以即时修改文本文件，**但**其自身**也存在一些局限**。这个时候可以使用**更高级**的文本文件处理工具 `gawk` 。

- `gawk` 是 Unix 中最初的 `awk` 的 GNU 版本。

- 它提供了一种编程语言，而**不仅仅是**编辑器**命令**。

- 在 `gawk` 编程语言中，可以实现以下操作：

  - 定义变量来**保存数据**。
  - 使用**算术**和**字符串运算符**来**处理数据**。
  - 使用**结构化编程概念**（比如 if-then 语句和循环）为数据处理添加处理逻辑。
  - 提取文件中的数据将其重新排列组合，最后**生成格式化报告**。（ `gawk` 能够从日志文件中过滤出所需的数据，将其格式化，以便让重要的数据更易于阅读。）

------

### gawk 命令格式

- `gawk` **命令的格式如下**：

```shell
gawk options program file
```

- `gawk` **常用命令选项**：

| 选项           | 描述                               |
| :------------- | :--------------------------------- |
| -F *fs*        | 指定行中划分数据字段的字段分隔符。 |
| -f *file*      | 从指定文件中读取 gawk 脚本代码。   |
| -v *var=value* | 定义 gawk 脚本中的变量及其默认值。 |
| -L [*keyword*] | 指定 gawk 的兼容模式或警告级别。   |

- `gawk` 的**强大之处在于脚本**。你可以编写脚本来**读取**文本行中的数据，然后对其进行**处理并显示**，形成各种**输出报告**。

------

### 从命令行读取 gawk 脚本

- `gawk` 必须将**脚本命令**放到一对**花括号**（{}）**之间**。
- 由于 `gawk` 命令行**假定脚本是单个文本字符串**，因此还必须将脚本放到**单引号中**。
- 这里举一个简单的 `gawk` 程序脚本：

```shell
# 输入一行文本并按下 Enter 键，则 gawk 会对这行文本执行一遍脚本。
# 可以使用Ctrl+D的组合键，终止这个 gawk 程序，必须表明数据流已经结束了。
[root@localhost testdir]# gawk '{print "Hello World!"}'

Hello World!

Hello World!
```

------

### 使用数据字段变量

- `gawk` 的主要特性之一是**处理**文本文件中的**数据**。

- 它会自动为每一行的**各个数据**元素**分配一个变量**。

- 在**默认情况下**，`gawk` 会将下列**变量分配**给文本行中的**数据字段**：

  - $0 代表**整个**文本行。
  - $n 代表文本行中的**第** ***n*** **个**数据字段。

- 文本行中的数据字段是通过**字段分隔符**来**划分**的。

- 在**默认情况下**，字段分隔符是任意的**空白字符**（比如空格或制表符）。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
One line of test text. 
Two lines of test text. 
Three lines of test text.

# 2.（$1）字段变量来显示每行文本的第一个数据字段。
[root@localhost testdir]# gawk '{print $1}' data.txt 
One
Two
Three

# 3.（-F:）表示指定冒号分隔。
[root@localhost testdir]# gawk -F: '{print $1}' /etc/passwd
root
bin
daemon
...
```

------

### 在脚本中使用多条命令

- `gawk` 编程语言允许将多条命令组合成一个常规的脚本。
- 要在命令行指定的脚本中**使用多条**命令，只需在命令之间加入**分号**即可：

```shell
# 1.第一条命令会为字段变量 $4 赋值。第二条命令会打印整个文本行。
[root@localhost testdir]# echo "My name is Tom" | gawk '{$4="TakeTo" ; print $0}'
My name is TakeTo

# 2.也可以通过次提示符进行输入。（单引号表示了起止。）
[root@localhost testdir]# echo "My name is Tom" | gawk '{
> $4="TakeTo"
> print $0 }'
My name is TakeTo
```

------

### 从文件中读取脚本

- **应用示例**：

```shell
# 1.脚本内容。打印/etc/passwd 文件的用户名数据字段（字段变量$1），以及主目录数据字段（字段变量$6）。
[root@localhost testdir]# cat userHome.gawk 
{
    text = "'s home directory is "
    print $1 text $6
}

# 2.（-F:）指定冒号分隔符；（-f）指定脚本。
[root@localhost testdir]# gawk -F: -f userHome.gawk /etc/passwd
root's home directory is /root
bin's home directory is /bin
daemon's home directory is /sbin
...
```

- **注意事项**：在 `gawk` 脚本中，**引用变量**值时**无须**像 shell 脚本那样**使用美元符号**。

------

### 在处理数据前运行脚本

- 有时候，可能需要在**处理数据前先运行**脚本，比如要为报告创建一个标题。
- **BEGIN** 关键字会强制 `gawk` 在**读取数据前**执行 BEGIN 关键字之后指定的脚本：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat data.txt 
One line of test text. 
Two lines of test text. 
Three lines of test text.

# 2.gawk 执行了 BEGIN 脚本后，会用第二段脚本来处理文件数据。
# 这两段脚本仍会被视为 gawk 命令行中的一个文本字符串，所以需要相应地加上单引号。
[root@localhost testdir]# gawk 'BEGIN {print "Contents:"}
> {print $0}' data.txt
Contents:
One line of test text. 
Two lines of test text. 
Three lines of test text.
```

------

### 在处理数据后运行脚本

- 和 BEGIN 关键字类似，**END** 关键字允许指定一段脚本，`gawk` 会在**处理完数据后**执行这段脚本。
- 这里可以结合上面的知识点，编写一个小型的脚本：

```shell
# 1.脚本内容。
# （BEGIN）负责创建标题、（END）生成页脚。
# （\t）：表示制表符，进行格式化缩进。
# （FS）：指定分隔符，无需再通过命令行指定。
[root@localhost testdir]# cat temp.gawk 
BEGIN {
    print "The latest list of users and shells" 
    print "UserID \t Shell" 
    print "------- \t -------"
    FS=":"
}

{
    print $1 " \t " $7
}

END {
    print "This concludes the listing"
}

# 2.执行脚本。
[root@localhost testdir]# gawk -f temp.gawk /etc/passwd
The latest list of users and shells
UserID   Shell
-------   -------
root   /bin/bash
bin   /sbin/nologin
daemon   /sbin/nologin
adm   /sbin/nologin
lp   /sbin/nologin
...
This concludes the listing
```

------

## sed 编辑器基础命令

### 更多的替换选项

#### 替换标志

- **命令替换问题**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
AAA AAA AAA
AAA

# 替换命令在替换多行中的文本时也能正常工作，但在默认情况下它只替换每行中出现的第一处匹配文本。
[root@localhost testdir]# sed 's/AAA/BBB/' data.txt 
BBB AAA AAA
BBB
```

- 要想替换每行中**所有的**匹配文本，必须使用**替换标志**（ *substitution flag* ）。
- **命令的格式如下**：

```shell
s/pattern/replacement/flags
```

- 有 **4** **种**可用的替换标志：

  - **数字**，指明新文本将替换**行中的第几处**匹配。
  - **g**，指明新文本将替换行中**所有的**匹配。
  - **p**，指明**打印**出替换后的行。
  - **w** *file*，将替换的结果**写入文件**。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
AAA AAA AAA
AAA
CCC
DDD

# 2.替换行中第3处的匹配值。
[root@localhost testdir]# sed 's/AAA/BBB/3' data.txt 
AAA AAA BBB
AAA
CCC
DDD

# 3.替换行所有匹配值。
[root@localhost testdir]# sed 's/AAA/BBB/g' data.txt 
BBB BBB BBB
BBB
CCC
DDD

# 4.（p）通常和（-n）搭配使用。
# -n 选项会抑制 sed 编辑器的输出，而替换标志 p 会输出替换后的行。
[root@localhost testdir]# sed -n 's/AAA/BBB/p' data.txt 
BBB AAA AAA
BBB

# 5.替换标志（w）会产生同样的输出，不过会将输出保存到指定文件中。
[root@localhost testdir]# sed 's/AAA/BBB/w data_replace.txt' data.txt 
BBB AAA AAA
BBB
CCC
DDD

# 6.被写入的文件。（只有那些包含匹配模式的行才会被保存在指定的输出文件中。）
[root@localhost testdir]# cat data_replace.txt 
BBB AAA AAA
BBB
```

------

#### 替代字符

> 有时候，你会在字符串中遇到一些不太方便在替换模式中使用的字符。

- Linux 中一个**常见**的例子是**正斜线**（/）。
- 如果想将 /etc/passwd 文件中的 bash shell 替换为 C shell，则必须这么做：

```shell
$sed 's/\/bin\/bash/\/bin\/csh/' /etc/passwd
```

- 由于正斜线被用作替换命令的分隔符，因此它在匹配模式和替换文本中出现时，必须使用反斜线来转义。这**很容易造成混乱和错误**。
- 为了解决这个问题，`sed` 编辑器允许选择**其他字符**作为替换命令的**替代分隔符**：

```shell
$sed 's!/bin/bash!/bin/csh!' /etc/passwd
```

- 在这个例子中，感叹号（!）被用作替换命令的分隔符，这样就**更容易阅读和理解**其中的路径了。

### 使用地址

> 在**默认情况下**，在 `sed` 编辑器中使用的命令会**应用于所有的文本行**。如果只想将命令应用于**特定的**某一行或某些行，则必须使用**行寻址**。

- 在 `sed` 编辑器中有**两种形式**的行寻址：

  - 以数字形式表示的行区间。
  - 匹配行内文本的模式。

- 以上两种形式使用**相同的格式**来指定地址：

```shell
[address]command

# 也可以将针对特定地址的多个命令分组：
address { 
 command1 
 command2 
 command3 
}
```

- `sed` 编辑器会将指定的各个**命令应用于**匹配**指定地址的文本行**。

------

#### 数字形式的行寻址

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.

# 2.只修改第3行文本。
[root@localhost testdir]# sed '3s/dog/cat/' data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy dog.

# 3.修改第2至第3行文本。
[root@localhost testdir]# sed '2,3s/dog/cat/' data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy dog.

# 4.修改从第2行到结束行（$）的文本。
# 有可能不知道文本中到底有多少行，所以美元符号用起来往往很方便。
[root@localhost testdir]# sed '2,$s/dog/cat/' data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy cat. 
```

------

#### 使用文本模式过滤

- `sed` 编辑器允许指定**文本模式**来过滤出命令所应用的行，其**格式如下**：

```shell
/pattern/command
```

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy pig.
The quick brown fox jumps over the lazy duck.

# 2.只修改cat的。（sed 编辑器会将该命令应用于包含匹配模式的行。）
[root@localhost testdir]# sed '/cat/s/lazy/happy/' data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the happy cat.
The quick brown fox jumps over the lazy pig.
The quick brown fox jumps over the lazy duck.
```

------

#### 命令组

- 如果需要在**单行中执行多条命令**，可以用**花括号**将其组合在一起，`sed` 编辑器会执行匹配地址中列出的所有命令：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy pig.
The quick brown fox jumps over the lazy duck.

# 2.花括号将多条命令进行组合。
[root@localhost testdir]# sed '2,${
> s/fox/toad/
> s/lazy/sleeping/}' data.txt
The quick brown fox jumps over the lazy dog.
The quick brown toad jumps over the sleeping cat.
The quick brown toad jumps over the sleeping pig.
The quick brown toad jumps over the sleeping duck.
```

- `sed` 编辑器会将所有命令应用于该区间内的**所有行**。

### 删除行

> 如果需要**删除**文本流中的**特定行**，可以使用删除（**d**）命令。

- 删除命令很简单，它会删除匹配指定模式的所有行。
- 使用该命令时要特别小心，如果**忘记加入寻址模式**，则流中的**所有文本行都会被删除**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.删除行区间。
[root@localhost testdir]# sed '2,3d' data.txt 
line 1
line 4

# 3.删除第2到最后一行。
[root@localhost testdir]# sed '2,$d' data.txt 
line 1

# 4.不加寻址模式，则会删除所有。
[root@localhost testdir]# sed 'd' data.txt 

# 5.最后再查看下原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4
```

- 记住，`sed` 编辑器**不会修改原始文件**。
- 你删除的行只是从 `sed` 编辑器的**输出中消失**了。原始文件中仍然包含那些“被删掉”的行。

### 插入和附加文本

> `sed` 编辑器也可以向数据流中**插入**和**附加**文本行。

- **插入**（ *insert* ）（**i**）命令会在指定**行前**增加一行。
- **附加**（ *append* ）（**a**）命令会在指定**行后**增加一行。
- 这两条命令不能在单个命令行中使用。**必须指定**是将行插入还是附加到另一行，其格式如下：

```shell
# new line 中的文本会出现在你所指定的 sed 编辑器的输出位置。
sed '[address]command\
new line'
```

- 要插入或**附加多行文本**，**必须**在要插入或附加的每行新文本**末尾使用反斜线**。（\）
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.第3行插入。（目标行之前。）
[root@localhost testdir]# sed '3i\
> hello\
> world' data.txt
line 1
line 2
hello
world
line 3
line 4

# 3.第3行附加。（目标行之后。）
[root@localhost testdir]# sed '3a\
> hello\
> world' data.txt
line 1
line 2
line 3
hello
world
line 4

# 4.附加到数据流的末尾。
[root@localhost testdir]# sed '$a\
> Bye.' data.txt
line 1
line 2
line 3
line 4
Bye.
```

### 修改行

> **修改**（**c**）命令允许修改数据流中整行文本的内容。

- 它跟插入和附加命令的工作机制一样，必须在 `sed` 命令中单独指定一行。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.修改第2行。
[root@localhost testdir]# sed '2c\
> hello' data.txt
line 1
hello
line 3
line 4

# 3.可以在修改命令中使用寻址区间。（注意：会直接替换，而不是逐一修改。）
[root@localhost testdir]# sed '2,$c\
> hello' data.txt
line 1
hello
```

### 转换命令

> **转换**（**y**）命令是唯一可以**处理单个**字符的 `sed` 编辑器命令。

- **该命令格式如下所示**：

```shell
# 转换命令会对 inchars 和 outchars 进行一对一的映射。

# inchars 中的第一个字符会被转换为 outchars 中的第一个字符，inchars 中的第二个字符会被转换成 outchars 中的第二个字符。

# 这个映射过程会一直持续到处理完指定字符。

# 如果 inchars 和 outchars 的长度不同，会产生一条错误消息。

[address]y/inchars/outchars/
```

- 转换命令是一个全局命令，它会对文本行中**匹配到**的所有指定字符**进行转换**，**不考虑**字符**出现的位置**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.对单个字符进行映射转换。
[root@localhost testdir]# sed 'y/1234/5678/' data.txt 
line 5
line 6
line 7
line 8
```

### 再探打印

- 有 **3** **个**命令也能打印数据流中的信息：

  - 打印（**p**）命令用于打印**文本行**。
  - 等号（=）命令用于打印**行号**。（行号由数据流中的**换行符**决定。）
  - 列出（**l**）命令用于**列出行**。（列出命令可以打印数据流中的文本和**不可打印字符**。）

- **打印文本行**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.查找包含数字 3 的行，然后执行两条命令。
#   首先，脚本用打印命令打印出原始行。
#   然后用替换命令替换文本并通过（p）标志打印出替换结果。
#   输出同时显示了原始的文本行和新的文本行。
# 用（-n）选项可以抑制其他行的输出，只打印包含匹配文本模式的行。
[root@localhost testdir]# sed -n '/3/{
> p
> s/line/test/p
> '} data.txt
line 3
test 3
```

- **打印行号**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4

# 2.同上面目的一致，只是将打印文本行，变为打印行号。
[root@localhost testdir]# sed -n '/3/{
> =
> s/line/test/p
> '} data.txt
3
test 3
```

- **列出行**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1 AAA
line 2
line 3
line 4

# 2.列出了不可打印的字符。
[root@localhost testdir]# sed -n 'l' data.txt 
line 1\tAAA$
line 2$
line 3$
line 4$
```

### 使用 sed 处理文件

> 替换命令包含一些文件处理标志。一些常规的 `sed` 编辑器命令也可以让你无须替换文本即可完成此操作。

- **写入文件**：

```shell
# 写入（w）命令用来向文件写入行。
# 该命令格式：[address]w filename

# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1 AAA
CCC line 2
DDD line 3
AAA line 4

# 2.包含AAA的文本行写出到指定文件。
# 用（-n）选项可以抑制其他行的输出，只打印包含匹配文本模式的行。
[root@localhost testdir]# sed -n '/AAA/w test.txt' data.txt 

# 3.写出后的文件内容。
[root@localhost testdir]# cat test.txt 
line 1 AAA
AAA line 4
```

- **从文件读取数据**：

```shell
# 读取（r）命令允许将一条独立文件中的数据插入数据流。
# 读取命令的格式：[address]r filename
# 读取命令中无法使用地址区间，只能指定单个行号或文本模式地址。
# sed 编辑器会将文件内容插入指定地址之后。

# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1 AAA
CCC line 2
DDD line 3
AAA line 4

# 2.待插入的数据。
[root@localhost testdir]# cat test.txt 
hello
world

# 3.将test.txt内容插入到data.txt的尾行。
[root@localhost testdir]# sed '$r test.txt' data.txt 
line 1 AAA
CCC line 2
DDD line 3
AAA line 4
hello
world
```

- **补充示例**

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
title

USERS

end
[root@localhost testdir]# cat users.txt 
jan
tom
rose

# 2.替换占位文本`USERS`，并删除占位文本。
[root@localhost testdir]# sed '/USERS/{
> r users.txt
> d
> }' data.txt
title

jan
tom
rose

end

# 2.也可以单行多命令完成这个需求。
[root@localhost testdir]# sed -e '/USER/ r users.txt' -e '/USER/ d' data.txt 
title

jan
tom
rose

end
```
