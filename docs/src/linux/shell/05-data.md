# 数据呈现

## 理解输入和输出

> 了解 Linux 如何处理输入和输出有助于将脚本输出送往所需的位置。

### 标准文件描述符

> Linux 用文件描述符来**标识**每个**文件对象**。

- 文件描述符是一个**非负整数**，唯一会标识的是会话中打开的文件。
- 每个进程一次**最多可以**打开 **9** **个**文件描述符。
- 出于特殊目的，bash shell 保留了**前** **3** **个**文件描述符。（**0**、**1** 和 **2**）
- **Linux** **的标准文件描述符如下**：

| 文件描述符 | 缩写   | 描述     |
| :--------- | :----- | :------- |
| 0          | STDIN  | 标准输入 |
| 1          | STDOUT | 标准输出 |
| 2          | STDERR | 标准错误 |

------

#### STDIN

> STDIN 文件描述符代表 shell 的标准**输入**。

- 对终端界面来说，标准输入就是**键盘**。
- 在使用**输入重定向符**（<）时，Linux 会用重定向指定的文件**替换**标准输入文件描述符。
- 许多 bash 命令能从 STDIN **接收输入**，**尤其是**在命令行中**没有指定文件**的情况下。
- 举个例子，使用 `cat` 命令来**处理**来自 STDIN 的**输入**：

```shell
# 1.cat命令从STDIN接收输入，输入一行，显示一行。
[root@VM-8-11-centos ~]# cat 
one
one
two
two
^Z
[2]+  Stopped                 cat
```

- 也可以通过**输入重定向符强制** `cat` 命令**接收**来自 STDIN 之外的**文件输入**：

```shell
# 1.cat命令现在从info.txt文件中获取输入。
[root@VM-8-11-centos testdir]# cat < info.txt 
This is the first line.
This is the second line.
This is the third line.
```

- 可以使用这种技术**将数据导入**任何能从 STDIN 接收数据的 shell **命令中**。

------

#### STDOUT

> STDOUT 文件描述符代表 shell 的标准**输出**。

- 在终端界面上，标准输出就是终端**显示器**。
- 在默认情况下，大多数 bash 命令会将**输出**送往 STDOUT 文件描述符，以用输出重定向来更改此设置：

```shell
# 1.将原本应该在屏幕上显示的输出内容，重定向到指定文件。
[root@VM-8-11-centos tmp]# ls -l > test.txt

# 2.查看被重定向的文件内容。
[root@VM-8-11-centos tmp]# cat test.txt 
total 8
-rw-rw-r--+ 1 root root    0 Jun 14 16:21 a.txt
-rw-rw-r--+ 1 root root    0 Jun 14 16:21 b.txt
-rw-rw-r--+ 1 root root    0 Jun 14 16:21 c.txt
drwxrwxr-x+ 2 root root 4096 Jun 14 16:21 dir1
drwxrwxr-x+ 2 root root 4096 Jun 14 16:21 dir2
-rw-rw-r--+ 1 root root    0 Jun 20 10:29 test.txt
```

- **也可以**使用 **>>** 将数据**追加**到某个文件。
- 但是，如果**对脚本使用**标准输出重定向，就**会遇到一个问题**：

```shell
# 1.将错误消息重定向到指定文件。（错误消息依然显示在屏幕上。）
[root@VM-8-11-centos tmp]# ls -lh badfile > test.txt 
ls: cannot access badfile: No such file or directory

# 2.但是，目标文件的内容没有记录错误消息。
[root@VM-8-11-centos tmp]# cat test.txt 
[root@VM-8-11-centos tmp]# 
```

- shell 对于**错误消息**的处理是**跟普通输出分开的**。

------

#### STDERR

> STDERR 文件描述符代表 shell 的标准**错误输出**。

- shell 或运行在 shell 中的程序和脚本报错时，生成的**错误消息**都会被送往这个位置。
- 在**默认情况下**，STDERR 和 STDOUT **指向同一个地方**（尽管二者的文件描述符索引值不同），也就是说，所有的错误消息也都**默认会被送往显示器**。
- STDERR **并不会**随着 STDOUT 的重定向发生改变。

------

### 重定向错误

> 想重定向错误，只需要在使用重定向符时指定 **STDERR** **文件描述符**就可以了。以下是**两种实现**方法。

#### 只重定向错误

- STDERR 的**文件描述符**为 **2**。
- 可以将该文件描述符索引值放在**重定向符号之前**，**只重定向错误消息**。
- **注意，两者必须紧挨着，否则无法正常工作**：

```shell
# 1.正常输出被送至显示器，错误消息被重定向（`2>`）到了文件。
[root@VM-8-11-centos tmp]# ls -lh a.txt badfile 2> test.txt 
-rw-rw-r--+ 1 root root 0 Jun 14 16:21 a.txt

# 2.目标文件只记录了错误。
[root@VM-8-11-centos tmp]# cat test.txt 
ls: cannot access badfile: No such file or directory
```

------

#### 重定向错误消息和正常输出

- 如果想**重定向错误**消息和**正常**输出，则**必须使用**两个重定向符号。
- 对输出进行**区分后**重定向：

```shell
# 1.将命令执行的错误重定向到error.log；将正常输出重定向到info.log。
[root@VM-8-11-centos tmp]# ls a.txt b.txt badfile 2>error.log 1>info.log

# 2.查看记录错误的日志。
[root@VM-8-11-centos tmp]# cat error.log 
ls: cannot access badfile: No such file or directory

# 3.查看记录正常输出的日志。
[root@VM-8-11-centos tmp]# cat info.log 
a.txt
b.txt
```

- 也可以将 STDERR 和 STDOUT 的输出**重定向到同一个文件**。为此，bash shell提供了特殊的**重定向符** &>：

```shell
# 1.将命令生成的所有输出都重定向至同一个文件。
[root@VM-8-11-centos tmp]# ls a.txt b.txt badfile &> service.log

# 2.查看文件。（错误消息展示在前。）
[root@VM-8-11-centos tmp]# cat service.log 
ls: cannot access badfile: No such file or directory
a.txt
b.txt
```

- **提示**：**为了避免**错误消息**散落**在输出文件中，相较于标准输出，bash shell 自动赋予了**错误消息更高的优先级**。

------

## 在脚本中重定向输出

> 在**脚本中重定向输出**的方法有**两种**：
>
> - **临时**重定向每一行。
> - **永久**重定向脚本中的所有命令。

### 临时重定向

> 如果你有意在脚本中生成错误消息，可以将**单独的一行**输出重定向到 STDERR。

- 在重定向到文件描述符时，**必须**在**文件描述符索引值之前**加一个 &。
- **应用示例**：

```shell
# 1.脚本内容。（`>&2`生成错误消息。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
echo "error msg." >&2
echo "normal output."

# 2.执行脚本。（当前看不出任何区别。）
[root@VM-8-11-centos testdir]# ./test.sh 
error msg.
normal output.

# 3.执行脚本。（STDOUT正常显示，而STDERR描述符2，将错误消息进行了重定向。）
[root@VM-8-11-centos testdir]# ./test.sh 2> error.log
normal output.

# 4.查看目标日志。（成功地只记录了错误消息。）
[root@VM-8-11-centos testdir]# cat error.log 
error msg.
```

- 这种方法非常适合在**脚本中生成**错误消息。

### 永久重定向

> 如果脚本中有**大量数据**需要重定向，那么逐条重定向所有的 `echo` 语句**会很烦琐**。这时**可以用** `exec` 命令，它会告诉 shell 在脚本**执行期间**重定向某个特定文件描述符。

- **应用示例**：

```shell
# 1.脚本内容。（使用exec命令进行重定向。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
#
exec 2>error.log
exec 1>info.log
#
echo "error msg."  >&2
echo "normal output."

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 

# 3.均成功记录输出。
[root@VM-8-11-centos testdir]# cat error.log 
error msg.
[root@VM-8-11-centos testdir]# cat info.log 
normal output.
```

- 当**只想**将脚本的**部分输出**重定向到**其他位置**（比如错误日志）时，这个特性用起来非常方便。

## 在脚本中重定向输入

> 在 Linux 系统中，`exec` 命令允许将 STDIN 重定向为文件。

- **应用示例**：

```shell
# 1.脚本内容。（当read命令试图从STDIN读入数据时，就会到文件中而不是键盘上检索数据。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
exec 0<data.txt
count=1
#
while read line; do
    echo "#$count: $line"
    count=$((count+1))
done
#
exit

# 1.被读文件内容。
[root@VM-8-11-centos testdir]# cat data.txt 
A
B
C
D
E

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 
#1: A
#2: B
#3: C
#4: D
#5: E
```

- 这是完成**从**日志文件中**读取并处理数据**的最简单办法。

## 创建自己的重定向

> 在脚本中重定向输入和输出时，并**不局限于**这 3 个默认的文件描述符。

### 创建输出文件描述符

> 可以用 `exec` 命令**分配**用于输出的文件描述符。

- **应用示例**：

```shell
# 1.脚本内容。（使用文件描述符3进行重定向。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
exec 3>other.log
#
echo "hello."
echo "msg." >&3
echo "hello."
#
exit

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 
hello.
hello.

# 3.成功记录重定向内容。
[root@VM-8-11-centos testdir]# cat other.log 
msg.
```

- **注意事项**：在重定向时，**如果**使用**大于** **9** 的文件描述符，那么**一定要小心**，**因为有可能会与 shell 内部使用的文件描述符发生冲突**。

### 创建输入文件描述符

> 可以将另一个文件描述符**分配**给标准文件描述符，反之亦可。

- 在重定向到文件之前，先将 STDIN 指向的位置**保存到另一个**文件描述符，然后在读取完文件**之后**将  STDIN **恢复到原先的位置**。
- **应用示例**：

```shell
# 1.脚本内容。（使用另一个 read 命令来测试 STDIN 是否恢复原位，这次 read 会等待键盘的输入。）
# --------------------------------
# 具体执行步骤如下：
# 文件描述符 6 用于保存 STDIN 指向的位置。
# 然后脚本将 STDIN 重定向到一个文件。
# read 命令的所有输入都来自重定向后的 STDIN。
# 在读完所有行之后，脚本会将 STDIN 重定向到文件描述符 6，恢复 STDIN 原先的位置。
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
exec 6<&0
exec 0<data.txt
#
count=1
while read line; do
    echo "#$count: $line"
    count=$((count + 1))
done
#
exec 0<&6
#
read -p "Are you done now? "
case "$REPLY" in
y | Y)
    echo "Goodbye."
    ;;
n | N)
    echo "Sorry, this is the end."
    ;;
*)
    echo "Invalid input."
    ;;
esac
#
exit

# 2.执行脚本。（STDIN 成功恢复。）
[root@VM-8-11-centos testdir]# ./test.sh 
#1: A
#2: B
#3: C
#4: D
#5: E
Are you done now? y
Goodbye.
```

### 创建读/写文件描述符

> 你也可以打开**单个**文件描述符**兼做输入**和**输出**，这样就能用同一个文件描述符对文件进行读和写两种操作了。

- 由于这是对一个文件进行读和写两种操作，因此 shell 会维护**一个内部指针**，指明该文件的当前位置。
- **任何读或写**都会从文件指针**上次的位置开始**。
- 因此，使用这种方法时要**特别小心**！
- **应用示例**：

```shell
# 1.脚本内容。（通过文件描述符 3 操作文件的读和写。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
exec 3<>data.txt
#
while read line <&3; do
    echo "read: $line"
done
echo "write something..." >&3
#
exit

# 2.当前读写操作文件的内容。
[root@VM-8-11-centos testdir]# cat data.txt 
A
B
C

# 3.执行脚本。（读成功。）
[root@VM-8-11-centos testdir]# ./test.sh 
read: A
read: B
read: C

# 4.操作之后的文件内容变化。（写成功。）
[root@VM-8-11-centos testdir]# cat data.txt 
A
B
C
write something...
```

- **提示**：如果粗心的话，会产生一些令人意外的结果！因此，**慎用！！！**

### 关闭文件描述符

> 在一些情况下，需要在**脚本结束前**手动**关闭**文件描述符。

- 要**关闭**文件描述符，只需将其重定向到特殊符号 **&-** 即可。
- **应用示例**：

```shell
# 1.脚本内容。（写入-关闭-再写入。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
exec 3>data.txt
echo "AAA" >&3
#
exec 3>&-
#
echo "BBB" >&3
exit 

# 2.执行脚本。（一旦关闭了文件描述符，就不能在脚本中向其写入任何数据，否则 shell 会发出错误消息。）
[root@VM-8-11-centos testdir]# ./test.sh
./test.sh: line 7: 3: Bad file descriptor

# 3.重定向文件。（只写入了关闭前的内容。）
[root@VM-8-11-centos testdir]# cat data.txt 
AAA
```

- 在使用关闭文件描述符时，还**需要注意**：如果随后你在脚本中**打开了同一个输出文件**，那么 shell 就会用一个**新文件来替换已有文件**。（意味着如果你输出数据，它就**会覆盖**已有文件。）

## 五、列出打开的文件描述符

> 有时要记住哪个文件描述符**被重定向到了哪里**就没那么容易了。

- `lsof` 命令会列出整个 Linux 系统**打开的所有文件描述符**，这包括所有后台进程以及登录用户打开的文件。
- 有大量的命令行选项和参数可用于过滤 `lsof` 的输出。
- `lsof` **常用命令选项**：

| 选项 | 描述                                                   |
| :--: | :----------------------------------------------------- |
| `-p` | 指定进程 ID（PID）。                                   |
| `-d` | 指定要显示的文件描述符编号（多个编号之间以逗号分隔）。 |
| `-a` | 用于对另外两个选项的结果执行 AND 运算。                |

- 要想知道**进程的当前** **PID**，可以使用**特殊环境变量** $$（shell 会将其设为当前 PID）。
- **应用示例**：

```shell
[root@VM-8-11-centos testdir]# lsof -a -p $$ -d 0,1,2
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
bash    31680 root    0u   CHR  136,1      0t0    4 /dev/pts/1
bash    31680 root    1u   CHR  136,1      0t0    4 /dev/pts/1
bash    31680 root    2u   CHR  136,1      0t0    4 /dev/pts/1
```

- 结果显示了当前进程（bash shell）的默认文件描述符（0、1 和 2）。
- `lsof` 的默认输出**列信息**如下：

|   列    | 描述                                                         |
| :-----: | :----------------------------------------------------------- |
| COMMAND | 进程对应的命令名的前 9 个字符。                              |
|   PID   | 进程的 PID。                                                 |
|  USER   | 进程属主的登录名。                                           |
|   FD    | 文件描述符编号以及访问类型。（r 代表读，w 代表写，u 代表读/写。） |
|  TYPE   | 文件的类型。（CHR 代表字符型，BLK 代表块型，DIR 代表目录，REG 代表常规文件。） |
| DEVICE  | 设备号（主设备号和从设备号）。                               |
|  SIZE   | 如果有的话，表示文件的大小。                                 |
|  NODE   | 本地文件的节点号。                                           |
|  NAME   | 文件名。                                                     |

## 抑制命令输出

> 如果在后台运行的脚本**出现错误消息**，那么 shell 就会将其通过邮件发送给进程属主。这**会很麻烦**，**尤其**是当运行的脚本**生成很多烦琐的小错误时**。

- 要解决这个问题，可以将 **STDERR** **重定向到**一个名为 **null** **文件**的特殊文件。
- shell 输出到 **null** **文件**的**任何数据都不会被保存**，全部会被丢弃。
- 在 Linux 系统中，null 文件的**标准位置**是 /dev/null。
- **应用示例**：

```shell
# 1.重定向执行。（/dev/null 不会保存任何数据。）
[root@VM-8-11-centos testdir]# ls -al > /dev/null 
[root@VM-8-11-centos testdir]# cat /dev/null 
[root@VM-8-11-centos testdir]# 
```

- 也可以在输入重定向中将 /dev/null **作为输入**文件。
- 通常用它来**快速清除现有文件中的数据**，这样就**不用**先删除文件再**重新创建**了：

```shell
# 1.原文件内容。
[root@VM-8-11-centos testdir]# cat data.txt 
AAA

# 2.使用 /dev/null 作为输入，进行快速清除。
[root@VM-8-11-centos testdir]# cat /dev/null > data.txt 

# 3.目标文件内容被成功清除。
[root@VM-8-11-centos testdir]# cat data.txt 
[root@VM-8-11-centos testdir]# 
```

- 这是**清除日志文件的常用方法**，因为日志文件必须时刻等待应用程序操作。

## 使用临时文件

> Linux 系统有一个专供临时文件使用的特殊目录 `/tmp`，其中存放那些**不需要永久保留的文件**。系统中的**任何用户**都有权限**读写** `/tmp` 目录中的文件。

### 创建本地临时文件

- 专门用于创建临时文件的命令 `mktemp`，该命令可以直接在 `/tmp` 目录中创建**唯一的**临时文件。
- 在**默认情况下**，`mktemp` 会在**本地目录中创建**一个文件。
- 在使用 `mktemp` 命令时，只需**指定一个文件名模板**即可。
- 模板可以包含**任意文本字符**，同时在文件名**末尾**要加上 **6** **个** X：

```shell
# 1.mktemp 命令会任意地将 6 个 X 替换为同等数量的字符，以保证文件名在目录中是唯一的。
[root@VM-8-11-centos testdir]# mktemp testing.XXXXXX
testing.WkMvVu
[root@VM-8-11-centos testdir]# mktemp testing.XXXXXX
testing.0HQESu

# 2.查看当前目录创建的临时文件。
[root@VM-8-11-centos testdir]# ls -al testing.*
-rw------- 1 root shared 0 Jun 20 16:24 testing.0HQESu
-rw------- 1 root shared 0 Jun 20 16:24 testing.WkMvVu
```

- **应用示例**：

```shell
# 1.脚本内容。（创建本地临时文件->重定向输出内容->关闭操作符->显示内容->删除本地临时文件。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
tmpfile=$(mktemp test99.XXXXXX)
exec 3>"$tmpfile"
#
echo "writes to temp file $tmpfile"
echo "hello" >&3
echo "world" >&3
#
exec 3>&-
#
echo "write finish,the temp file contents are: "
cat "$tmpfile"
rm -f "$tmpfile"
echo "remove $tmpfile successfully!"
#
exit

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 
writes to temp file test99.PvEpUs
write finish,the temp file contents are: 
hello
world
remove test99.PvEpUs successfully!
```

### 在 `/tmp` 目录中创建临时文件

> -t 选项会强制 `mktemp` 命令在**系统的临时目录**中创建文件。

- **应用示例**：

```shell
# 1.脚本内容。（与上一个脚本逻辑一致。只不过在创建临时文件时使用了 -t 选项，它会返回一个完整的路径名。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
tmpfile=$(mktemp -t tmp.XXXXXX)
exec 3>"$tmpfile"
#
echo "writes to temp file $tmpfile"
echo "hello" >&3
echo "world" >&3
#
exec 3>&-
#
echo "write finish ,the temp file contents are: "
cat "$tmpfile"
rm -f "$tmpfile"
echo "remove $tmpfile successfully!"
#
exit

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 
writes to temp file /tmp/tmp.0zhdS0
write finish ,the temp file contents are: 
hello
world
remove /tmp/tmp.0zhdS0 successfully!
```

- 在创建临时文件时，`mktemp` 会将**全路径名**返回给环境变量。这样就能在**任何命令中使用该值**来引用临时文件了。

### 创建临时目录

> -d 选项会告诉 `mktemp` 命令创建一个**临时目录**。

- **应用示例**：

```shell
# 1.脚本内容。（创建临时目录，再在该目录下创建两个临时文件，分别写入不同的内容。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
tmpdir=$(mktemp -d tmpdir.XXXXXX)
cd $tmpdir
tmpfile1=$(mktemp test01.XXXXXX)
tmpfile2=$(mktemp test02.XXXXXX)
#
exec 3>$tmpfile1
exec 4>$tmpfile2
#
echo "Sending data to directory $tmpdir"
#
echo "writes to temp file $tmpfile1"
echo "file 1" >&3
echo "writes to temp file $tmpfile2"
echo "file 2" >&4
#
exit

# 2.执行脚本。
[root@VM-8-11-centos testdir]# ./test.sh 
Sending data to directory tmpdir.nlMgmz
writes to temp file test01.Gmh5Ao
writes to temp file test02.mSNKA1

# 2.对应的临时文件写入成功。
[root@VM-8-11-centos testdir]# cat tmpdir.nlMgmz/test01.Gmh5Ao 
file 1
[root@VM-8-11-centos testdir]# cat tmpdir.nlMgmz/test02.mSNKA1 
file 2
```

## 记录消息

> 有时候，也确实需要将输出**同时送往**显示器和文件。

- `tee` 命令就像是连接管道的 T 型接头，它能将来自 STDIN 的数据**同时送往两处**（STDOUT 及 文件）。
- 注意，在**默认情况下**，`tee` 命令会在**每次使用时覆盖**指定文件的原先内容。
- 如果想将数据**追加**到指定文件中，就必须使用 **-a** 选项。
- **应用示例**：

```shell
# 1.脚本内容。（既保存数据到文件，又将其显示在屏幕上。）
[root@VM-8-11-centos testdir]# cat test.sh 
#!/bin/bash
file=test.txt
echo "AAA" | tee $file
echo "BBB" | tee -a $file
echo "CCC" | tee -a $file
exit

# 2.执行脚本。（成功显示。）
[root@VM-8-11-centos testdir]# ./test.sh 
AAA
BBB
CCC

# 3.查看目标文件。（成功写入。）
[root@VM-8-11-centos testdir]# cat test.txt 
AAA
BBB
CCC
```

- 现在，你可以在为用户**显示输出**的**同时再永久保存**一份输出内容了。
