# Sed高级用法

## 多行命令

> 有时候，你需要对跨多行的数据执行特定的操作。

- `sed` 编辑器提供了 **3** **个**可用于处理多行文本的特殊命令：

  - **N**：加入数据流中的下一行，创建一个**多行组**进行处理。
  - **D**：**删除**多行组中的一行。
  - **P**：**打印**多行组中的一行。

### next 命令

> 在讲解多行 next（**N**）命令之前，首先需要知道**单行版**本的 next 命令是如何工作的，这样一来，理解**多行版**本的 next 命令的用法就容易多了。

#### 单行 next 命令

> 单行 next（n）命令会告诉 `sed` 编辑器**移动到数据流中的下一行**，不用再返回到命令列表的最开始位置。

- 假如，有一个包含 5 行文本的数据文件，其中有 2 行是空的。我们的**目标**是**只保留下末行之前**的空行：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 

Data Line -1

End of Data Lines
[root@localhost testdir]# 

# 2.使用锚定字符删除空行。（结果是 2 个空行都会被删掉，这不符合预期。）
[root@localhost testdir]# sed '/^$/d' data.txt 
Header Line 
Data Line -1
End of Data Lines
[root@localhost testdir]# 

# 3.使用单行（next）命令删除空行。
##  3.1 先用脚本查找含有单词 Header 的那一行，找到之后，单行（next）命令会让 sed 编辑器移动到文本的下一行，也就是我们想删除的空行。
##  3.2 sed 编辑器会继续执行命令列表，即使用删除命令删除空行。
##  3.3 sed 编辑器在执行完命令脚本后会读取数据流中下一行文本，并从头开始执行脚本。
##  3.4 因为 sed 编辑器再也找不到包含单词 Header 的行了，所以也不会再有其他行被删除。
[root@localhost testdir]# sed '/Header/{n ; d}' data.txt 
Header Line 
Data Line -1

End of Data Lines
[root@localhost testdir]# 
```

------

#### 合并文本行

- **单行** next 命令会将数据流中的下一行**移入** `sed` 编辑器的工作空间。（称为**模式空间**。）
- **多行** next（N）命令则是将下一行**添加**到模式空间中已有文本之后。（将数据流中的两行文本合并到同一个模式空间中。）
- 文本行之间仍然用换行符分隔，但 `sed` 编辑器现在会将两行文本**当成一行**来处理。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]#

# 2.sed 编辑器脚本先查找含有单词 First 的那行文本，找到该行后，使用（N）命令将下一行与该行合并，然后用替换命令将换行符（\n）替换成空格。
[root@localhost testdir]# sed '/First/{N ; s/\n/ / }' data.txt 
Header Line 
First Data Line  Second Data Line 
End of Data Lines
[root@localhost testdir]# 
```

- 如果要在数据文件中查找一个可能会**分散在两行**中的文本短语，那么这是一个很管用的方法：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
..., System
Admin ...
... System Admins ...
[root@localhost testdir]# 

# 2.可以在 sed 编辑器脚本中用两个替换命令。
## 2.1 将单行编辑命令放到（N）命令前面，将多行编辑命令放到（N）命令后面。
## 2.2 这样确保查找单行中短语的替换命令在数据流的最后一行也能正常工作，（N）命令则负责短语出现在数据流中间的情况。
[root@localhost testdir]# sed '
> s/System Admin/DevOps Engineer/
> N
> s/System\nAdmin/DevOps\nEngineer/
> ' data.txt
..., DevOps
Engineer ...
... DevOps Engineers ...
[root@localhost testdir]# 
```

------

### 多行删除命令

> `sed` 编辑器提供了**多行删除**（**D**）命令，该命令**只会**删除模式空间中的第一行，即删除该行中的换行符及其之前的所有字符。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
..., System
Admin ...
... System Admins ...
[root@localhost testdir]# 

# 2.单行删除命令会在不同的行中查找单词 System 和 Admin，然后在模式空间中将两行都删掉。这未必是你想要的结果。
[root@localhost testdir]# sed 'N ; /System\nAdmin/d' data.txt 
... System Admins ...
[root@localhost testdir]# 

# 3.sed 编辑器提供了多行删除（D）命令，该命令只会删除模式空间中的第一行，即删除该行中的换行符及其之前的所有字符。
[root@localhost testdir]# sed 'N ; /System\nAdmin/D' data.txt 
Admin ...
... System Admins ...
[root@localhost testdir]# 
```

- 如果需要删除目标数据字符串**所在行的前一行**，那么 **D** 命令就能派上用场了：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 

Header Line 
First Data Line 

End of Data Lines
[root@localhost testdir]# 

# 2.sed 编辑器脚本会查找空行，然后用（N）命令将下一行加入模式空间。如果模式空间中含有单词 Header，则（D）命令会删除模式空间中的第一行。（如果不结合使用（N）命令和（D）命令，则无法做到在不删除其他空行的情况下只删除第一个空行。）
[root@localhost testdir]# sed '/^$/{N ; /Header/D}' data.txt 
Header Line 
First Data Line 

End of Data Lines
[root@localhost testdir]# 
```

### 多行打印命令

> 多行打印命令（**P**）它**只打印**模式空间中的第一行，即打印模式空间中换行符及其之前的所有字符。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
..., System
Admin ...
... System Admins ...
[root@localhost testdir]# 

# 2.当出现多行匹配时，（P）命令只打印模式空间中的第一行。
[root@localhost testdir]# sed -n 'N ; /System\nAdmin/P' data.txt 
..., System
[root@localhost testdir]# 
```

- 该命令的**强大之处**体现在其和 N 命令及 D 命令**配合使用**的时候
- D 命令的独特之处在于其删除模式空间中的第一行之后，会强制 `sed` 编辑器**返回**到脚本的**起始处**，对当前模式空间中的内容**重新执行**此命令（D 命令不会从数据流中读取新行）。
- 在脚本中加入 N 命令，就能单步扫过（ *single-step through* ）整个模式空间，对**多行进行匹**配。
- 接下来，先使用 P 命令打印出第一行，然后用 D 命令删除第一行并绕回到脚本的起始处，接着 N 命令会读取下一行文本并重新开始此过程。
- 这个循环会一直持续到数据流结束。
- **下面有个示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line#
@
Data Line #1
Data Line #2#
@
End of Data Lines#
@
[root@localhost testdir]# 

# 2.数据文件被破坏了，在一些行的末尾有#，接着在下一行有@。
## 2.1 为了解决这个问题，可以使用 sed 将 Header Line#行载入模式空间，然后用（N）命令载入第二行（@），将其附加到模式空间内的第一行之后。
## 2.2 替换命令用空值替换来删除违规数据（#\n@），然后（P）命令只打印模式空间中已经清理过的第一行。
## 2.3（D）命令将第一行从模式空间中删除，并返回到脚本的开头，下一个（N）命令将第三行（Data Line #1）文本读入模式空间，继续进行编辑循环。
[root@localhost testdir]# sed -n '
> N
> s/#\n@//
> P
> D
> ' data.txt
Header Line
Data Line #1
Data Line #2
End of Data Lines
[root@localhost testdir]# 
```

## 保留空间

> `sed` 编辑器还有另一块称作**保留空间**（ *hold space* ）的缓冲区。

- 当你在处理模式空间中的某些行时，可以用保留空间临时**保存部分行**。
- `sed` **编辑器的保留空间命令**：

| 命令 | 描述                           |
| :--: | :----------------------------- |
| `h`  | 将模式空间复制到保留空间。     |
| `H`  | 将模式空间附加到保留空间。     |
| `g`  | 将保留空间复制到模式空间。     |
| `G`  | 将保留空间附加到模式空间。     |
| `x`  | 交换模式空间和保留空间的内容。 |

- **通常**，在使用 h 命令或 H 命令将字符串**移入保留空间**后，**最终**还是要用 g 命令、G 命令或 x 命令将保存的字符串**移回模式空间**（否则，一开始就不用考虑保存的问题）。
- 这里举个例子演示如何用 h 命令和 g 命令在缓冲空间之间**移动数据**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.演示移动数据的过程（接下来拆解代码进行说明）：
## 2.1 sed 脚本使用正则表达式作为地址，过滤出含有单词 First 的行。
## 2.2 当出现含有单词 First 的行时，{}中的第一个命令（h）会将该行复制到保留空间。这时，模式空间和保留空间中的内容是一样的。
## 2.3（p）命令会打印出模式空间的内容（First Data Line），也就是被复制进保留空间中的那一行。
## 2.4（n）命令会提取数据流中的下一行（Second Data Line），将其放入模式空间。现在，模式空间和保留空间的内容就不一样了。
## 2.5（p）命令会打印出模式空间的内容（Second Data Line）。
## 2.6（g）命令会将保留空间的内容（First Data Line）放回模式空间，替换模式空间中的当前文本。模式空间和保留空间的内容现在又相同了。
## 2.7（p）命令会打印出模式空间的当前内容（First Data Line）。
[root@localhost testdir]# sed -n '/First/ {
> h ; p ;
> n ; p ;
> g ; p }
> ' data.txt
First Data Line 
Second Data Line 
First Data Line 
[root@localhost testdir]# 

# 3.如果去掉第一个（p）命令，则可以将这两行以相反的顺序输出。
[root@localhost testdir]# sed -n '/First/ {
> h ;
> n ; p
> g ; p }
> ' data.txt
Second Data Line 
First Data Line 
[root@localhost testdir]# 
```

- 可以**结合**接下来提到的**排除特性**创建一个 `sed` 脚本，**反转**整个文件的各行文本。

## 排除命令

> 也可以指示命令**不应用**于数据流中的特定地址或地址区间。

- 感叹号（!）命令用于排除（negate）命令，也就是**让**原本会起作用的**命令失效**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.输出了反转后的文本文件。
## 2.1 （-n）选项：抑制过程输出，不想在处理行的时候打印。
## 2.2 （1!G）命令：不想将保留空间的文本附加到要处理的第一行文本之后。
## 2.3 （h）命令：将新的模式空间（包含已反转的文本行）放入保留空间。
## 2.4 （$p）命令：将模式空间中的所有文本行都反转之后，只需打印结果。
[root@localhost testdir]#  sed -n '{1!G ; h ; $p }' data.txt 
End of Data Lines
Second Data Line 
First Data Line 
Header Line 
[root@localhost testdir]# 
```

- **提示**：有一个**现成的** bash shell **命令**可以实现同样的效果，`tac` 命令会以**倒序显示**文本文件，它的功能正好和 `cat` 命令相反。

## 改变执行流程

> `sed` 编辑器提供了一种方法，可以改变脚本的执行流程，其效果与结构化编程类似。

### 分支

> `sed` 编辑器还提供了一种方法，这种方法可以基于地址、地址模式或地址区间**排除一整段**命令。允许你只对数据流中的特定行**执行部分**命令。

- **分支**（**b**）**命令的格式如下**：

```shell
# address 参数决定了哪些行会触发分支命令。

# label 参数定义了要跳转到的位置。

# 如果没有 label 参数，则跳过触发分支命令的行，继续处理余下的文本行。

[address]b [label]
```

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.排除第二行和第三行执行替换操作。
[root@localhost testdir]# sed '{2,3b ;
> s/Line/Replacement/
> }' data.txt
Header Replacement 
First Data Line 
Second Data Line 
End of Data Replacements
[root@localhost testdir]# 
```

- 如果**不想跳到脚本末尾**，可以定义 label 参数，**指定**分支命令要**跳转到的位置**。
- 标签以**冒号开始**，**最多**可以有 **7** **个字符**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.文本行中出现了 First，则程序应该跳到标签为（:jump）的脚本行。
[root@localhost testdir]# sed '{/First/b jump ;
> s/Line/Replacement/
> :jump
> s/Line/Jump Replacement/
> }' data.txt
Header Replacement 
First Data Jump Replacement 
Second Data Replacement 
End of Data Replacements
[root@localhost testdir]# 
```

### 测试

> 与分支命令类似，**测试**（**t**）**命令**也可以**改变** `sed` 编辑器脚本的**执行流程**。

- 测试命令会**根据先前替换命令的结果**跳转到某个 label 处，**而不是**根据 address 进行跳转。
- 如果替换命令**成功匹配并完成了替换**，测试命令就会**跳转到**指定的**标签**。否则，不跳转。
- 测试命令的**格式**与分支命令**相同**：

```shell
[address]t [label]
```

- 测试命令提供了一种**低成本**的方法来对数据流中的文本**执行基本的** **if-then** **语句**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.查找模式文本 First。匹配则直接替换文本，否则执行后面的替换命令。
[root@localhost testdir]# sed '{s/First/Matched/ ; t
> s/Line/Replacement/
>  }' data.txt
Header Replacement 
Matched Data Line 
Second Data Replacement 
End of Data Replacements
[root@localhost testdir]# 
```

## 模式替换

> 在使用模式时，很难知道到底匹配了哪些文本。

- **假如**你想为行中**匹配的单词加上引号**。如果只是要匹配某个单词，那非常简单：

```shell
# 1.只对cat加上引号。
[root@localhost testdir]# echo "The cat sleeps in his hat." |
>     sed 's/cat/"cat"/'
The "cat" sleeps in his hat.
[root@localhost testdir]# 
```

- 但如果在模式中用点号（`.`）来**匹配多个单词**呢？

```shell
# 1.无法通过点号来匹配多个单词。
[root@localhost testdir]# echo "The cat sleeps in his hat. " |
>     sed 's/.at/".at"/g'
The ".at" sleeps in his ".at". 
[root@localhost testdir]# 
```

- **遗憾的是**，用于替换的字符串**无法指定**点号已匹配到的字符。

### & 符号

> `&` 符号可以**代表**替换命令中的**匹配模式**。

- **不管**模式匹配到的是**什么样的文本**，都可以使用 `&` 符号代表这部分内容。
- 这样就能处理匹配模式的任何单词了：

```shell
# 1.成功匹配多个单词并加上了双引号。
[root@localhost testdir]# echo "The cat sleeps in his hat. " |
>     sed 's/.at/"&"/g'
The "cat" sleeps in his "hat". 
[root@localhost testdir]# 
```

### 替换单独的单词

> `&` 符号代表替换命令中指定模式所匹配的字符串。**但有时候**，你**只想获取**该字符串的**一部分**。

- `sed` 编辑器使用**圆括号**来**定义**替换模式中的**子模式**。
- 随后使用特殊的字符组合来引用每个子模式匹配到的文本。由反向引用由**反斜线**和**数字组成**。
- 数字表明子模式的**序号**，第一个子模式为 \1，第二个子模式为 \2，以此类推。
- **注意**：在替换命令中**使用圆括号时**，**必须使用转义字符**，以此表明这不是普通的圆括号，而是用于**划分子模式**。
- **如果需要**用**一个单词来替换一个短语**，而这个**单词**刚好又**是该短语的子串**，但在**子串**中**用到了特殊的模式字符**，那么这时使用**子模式**会方便很多。在正则表达式中，这称作“**反向引用**”（ *back reference* ）。
- **具体操作如下**：

```shell
# 1.将子串的单词.at，替换整个furry...at短语。
# 在这种情况下，不能用（&）符号，因为它代表的是整个模式所匹配到的文本。
# 而反向引用则允许将某个子模式匹配到的文本作为替换内容。
[root@localhost testdir]# echo "That furry cat is pretty." |
>     sed 's/furry \(.at\)/\1/'
That cat is pretty.
[root@localhost testdir]# 
[root@localhost testdir]# echo "That furry hat is pretty." |
>     sed 's/furry \(.at\)/\1/'
That hat is pretty.
[root@localhost testdir]# 
```

- 当需要在两个或多个**子模式间插入文本时**，这个特性尤其有用。
- 比如，本使用子模式在**大数**（ *long number* ）**中插入逗号**：

```shell
# 1.这个脚本将匹配模式分成了两个子模式：（.*[0-9]）以及（[0-9]{3}）。
## 1.1 第一个子模式是以数字结尾的任意长度的字符串。第二个子模式是 3 位数字。
## 1.2 如果匹配到了相应的模式，就在两者之间加一个逗号，每个子模式都通过其序号来标示。
## 1.3 使用测试命令来遍历这个大数，直到所有的逗号都插入完毕。
[root@localhost testdir]# echo "1234567" |
>     sed '{
>     :start
>     s/\(.*[0-9]\)\([0-9]\{3\}\)/\1,\2/
>     t start
> }'
1,234,567
[root@localhost testdir]# 
```

## 在脚本中使用 sed

### 使用包装器

> 编写 `sed` **编辑**器脚本的**过程很烦琐**，**尤其**是当**脚本很长**的时候。

- 可以将 `sed` 编辑器命令**放入** **shell** **脚本包装器**，这样**就不用每次**使用时都**重新键入**整个脚本。
- **应用示例**：

```shell
# 1.脚本内容。（将位置变量作为输入，反转数据流中的文本行。）
[root@localhost testdir]# cat reverse.sh 
#!/bin/bash
#
sed -n '{1!G; h; $p}' "$1"
#
exit
[root@localhost testdir]# 

# 2.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 3.执行脚本。（成功完成内容反转。）
[root@localhost testdir]# ./reverse.sh data.txt 
End of Data Lines
Second Data Line 
First Data Line 
Header Line 
[root@localhost testdir]# 
```

### 重定向 sed 的输出

> 在 shell 脚本中，可以用 `$()` 将 sed 编辑器命令的输出**重定向到**一个**变量**中，以备后用。

- 下面的例子使用 `sed` 脚本为数值计算（阶乘）结果**添加逗号**：

```shell
# 1.脚本内容。（计算输入数的阶乘，将结果根据正则分段并插入逗号。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
num=$1
factorial=1
counter=1
#
while [ $counter -le "$num" ]; do
    factorial=$((factorial * counter))
    counter=$((counter + 1))
done
#
result=$(echo $factorial |
    sed '{
            :start
            s/\(.*[0-9]\)\([0-9]\{3\}\)/\1,\2/
            t start
        }')
#
echo "result=$result"
exit
[root@localhost testdir]# 

# 2.执行脚本。
[root@localhost testdir]# ./test.sh 20
result=2,432,902,008,176,640,000
[root@localhost testdir]# 
```

- 把冗长的 `sed` 脚本放在 bash shell 脚本中，以后使用的时候就**无须**一遍遍地重新输入 `sed` 命令。

## 创建 sed 实用工具

### 加倍行间距

- G 命令将保留空间内容**附加**到模式空间内容之后（**保留空间的默认值**）。
- 当**启动** `sed` 编辑器时，保留空间只有一个空行。将它附加到已有行之后，就**创建出了空行**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 
Second Data Line 
End of Data Lines
[root@localhost testdir]# 

# 2.使用（G）命令对所有行插入空行。
[root@localhost testdir]# sed 'G' data.txt 
Header Line 

First Data Line 

Second Data Line 

End of Data Lines

[root@localhost testdir]# 

# 3.# 2.使用（$!G）命令，在非最后一行中插入空行。
[root@localhost testdir]# sed '$!G' data.txt 
Header Line 

First Data Line 

Second Data Line 

End of Data Lines
[root@localhost testdir]# 
```

### 对可能含有空行的文件加倍行间距

> 如果文本文件已经有一些空行，但你想给所有行加倍行间距，怎么办呢？

- 如果**沿用前面的**脚本，有些区域会有太多的空行，因为已有的**空行**也**会被加倍**。
- **解决办法**：首先**删除**数据流中的**所有空行**，然后用 G 命令在每行之后**插入新的空行**。
- 要删除已有的空行，需要将 d 命令和一个匹配空行（^$）的模式一起使用：

```shell
# 1.原文件数据（已有分布不均的空行）。
[root@localhost testdir]# cat data.txt 
Header Line 
First Data Line 

Second Data Line 


End of Data Lines
[root@localhost testdir]# 

# 2.先删除所有空行，再进行插入空行操作。
[root@localhost testdir]# sed '/^$/d ; $!G' data.txt 
Header Line 

First Data Line 

Second Data Line 

End of Data Lines
[root@localhost testdir]# 
```

### 给文件中的行编号

- **应用示例**：

```shell
# 1.用等号可以显示数据流中行的行号。（但是，行号出现在了实际行的上方。）
[root@localhost testdir]# sed '=' data.txt 
1
Header Line 
2
First Data Line 
3
Second Data Line 
4
End of Data Lines
[root@localhost testdir]# 

# 2.将行号和文本放在同一行。
## 2.1 在获得了等号命令的输出之后，可以通过管道将输出传给另一个 sed 编辑器脚本。
## 2.2 后者使用 N 命令来合并这两行。还需使用替换命令将换行符更换成空格或制表符。
[root@localhost testdir]# sed '=' data.txt | sed 'N ; s/\n/ /'
1 Header Line 
2 First Data Line 
3 Second Data Line 
4 End of Data Lines
[root@localhost testdir]# 
```

- 在查看错误消息的行号时，这是一个很好用的小工具。

### 打印末尾行

> 如果**只需**处理长输出（比如日志文件）中的**末尾几行**，该怎么办？

- **创建滚动窗口**（ *rolling window* ）：滚动窗口通过 N 命令将行合并，是一种检查模式空间中文本行块的常用方法。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Line1 
Line2 
Line3 
Line4 
Line5 
Line6 
Line7 
Line1 
Line2 
Line3 
Line4 
Line5 
Line6 
Line7 
Line8 
Line9 
Line10 
Line11 
Line12 
Line13 
Line14 
Line15
[root@localhost testdir]# 

# 2.只显示文件最后 10 行。
## 2.1 该脚本首先检查当前行是否为数据流中的最后一行。
## 2.2 如果是，则退出命令会停止循环（$q），（N）命令会将下一行附加到模式空间中的当前行之后。
## 2.3 如果当前行在第 10 行之后，则 11,（$D）命令会删除模式空间中的第 1 行。
## 2.4 这就在模式空间中创造了滑动窗口的效果。
[root@localhost testdir]# sed '{
>     :start
>     $q ; N ; 11,$D
>     b start
> }' data.txt
Line6 
Line7 
Line8 
Line9 
Line10 
Line11 
Line12 
Line13 
Line14 
Line15
[root@localhost testdir]# 
```

### 删除行

> 删除数据流中的所有空行很容易，但要**选择性地删除空行**，就得花点儿心思了。

- **删除连续的空行**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Line one.


Line two.
 
Line three. 




Line four.
[root@localhost testdir]# 

# 2.不管文件的数据行之间出现了多少空行，在输出中只保留行间的一个空行。
## 2.1 删除连续空行的关键在于创建包含一个非空行和一个空行的地址区间。（如果 sed 编辑器遇到了这个区间，它不会删除行。但对于不属于该区间的行（两个或更多的空行），则执行删除操作。）
## 2.2 指定的区间是/./到/^$/。区间的开始地址会匹配任何至少含有一个字符的行。
## 2.3 区间的结束地址会匹配一个空行。在这个区间内的行不会被删除。
[root@localhost testdir]#  sed '/./,/^$/!d' data.txt 
Line one.

Line two.

Line three. 

Line four.
[root@localhost testdir]# 
```

- **删除开头的空行**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 


Line one.
Line two.

Line three. 
Line four.
[root@localhost testdir]#

# 2.删除开头的两个空行，同时保留数据中的空行。
## 2.1 这个脚本用地址区间来决定要删除哪些行。这个区间从含有字符的行开始，一直到数据流结束。
## 2.2 在这个区间内的任何行都不会从输出中删除。这意味着含有字符的第一行之前的任何行都会被删除。
[root@localhost testdir]# sed '/./,$!d' data.txt 
Line one.
Line two.

Line three. 
Line four.
[root@localhost testdir]# 
```

- **删除结尾的空行**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
Line one.
Line two.

Line three. 
Line four.


[root@localhost testdir]# 

# 2.删除结尾的两个空行，同时保留数据中的空行。
## 2.1 花括号内的花括号为命令分组。而命令分组会被应用于指定的地址模式。
## 2.2 该地址模式能够匹配只含一个换行符的行。
## 2.3 如果找到了这样的行，而且还是最后一行，删除命令就会将它删除。
## 2.4 如果不是最后一行，那么（N）命令会将下一行附加到它后面，然后分支命令会跳到循环起始位置重新开始。
[root@localhost testdir]# sed '{
>     :start
>     /^\n*$/{$d; N; b start}
> }' data.txt
Line one.
Line two.

Line three. 
Line four.
[root@localhost testdir]# 
```

### 删除 HTML 标签

> 有时下载的文本夹杂了用于格式化数据的 HTML 标签。如果只想查看数据，这会是个问题。

- HTML 标签由小于号和大于号来标识。大多数 HTML 标签是成对出现的：一个起始标签（比如 <b> 用来加粗）和一个闭合标签（比如 </b> 用来结束加粗）。
- 需要让 `sed` 编辑器忽略任何嵌入原始标签中的大于号。为此，可以使用**字符组**来排除大于号：

```shell
# 1.原文件数据。 
[root@localhost testdir]# cat test.html 
<html>
 <head>
  <title>This is the page title</title>
 </head>
 <body>
  <p>
   This is the <b>first</b> line in the Web page.
   This should provide some <i>useful</i>
   information to use in our sed script.
 </body>
</html>
[root@localhost testdir]# 

# 2.让 sed 编辑器忽略任何嵌入原始标签中的大于号。
[root@localhost testdir]# sed 's/<[^>]*>//g'  test.html 

 
  This is the page title
 
 
  
   This is the first line in the Web page.
   This should provide some useful
   information to use in our sed script.
 

[root@localhost testdir]# 

# 3.可以去除多余的空行。
## 3.1 -e选项用于指定要执行的命令，我们在这里使用了两个命令。
## 3.2 第一个命令（'s/<[^>]>//g'）用于删除所有的HTML标签，它会匹配任何以"<"开头，紧接着任意字符（除了">"）并以">"结尾的字符串，并将其替换为空。
## 3.3 第二个命令（'/^\s$/d'）用于删除空行，它会匹配任何只包含空白字符（包括空格、制表符等）的行，并将其删除。（\s是一个预定义的字符类，用于匹配空白字符。）
[root@localhost testdir]# sed -e 's/<[^>]*>//g' -e '/^\s*$/d' test.html 
  This is the page title
   This is the first line in the Web page.
   This should provide some useful
   information to use in our sed script.
[root@localhost testdir]# 
```
