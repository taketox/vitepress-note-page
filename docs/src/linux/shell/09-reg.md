# 正则表达式

## 正则表达式基础

> shell 脚本中成功运用 `sed` 和 `gawk` 的关键在于**熟练掌握**正则表达式。

### 定义

> 正则表达式是一种可供 Linux 工具**过滤文本**的自定义模板。

- 正则表达式模式使用**元字符**（指那些在正则表达式中具有**特殊意义的专用字符**）来描述数据流中的一个或多个字符。
- Linux 中有很多场景可以使用特殊字符来**描述具体内容不确定的数据**。
- 可以使用**通配符** `*` 列出满足特定条件的文件。例如：

```shell
# 1.列出以t为起始的文件。
[root@localhost testdir]# ll t*
-rwxr--r-- 1 root shared 46 Jun 24 08:55 test.sh
-rw-r--r-- 1 root shared 12 Jun 27 16:36 test.txt
[root@localhost testdir]# 
```

### 正则表达式的类型

> 使用正则表达式最大的问题在于有**不止一种类型**的正则表达式。

- 在 Linux 中，不同的应用程序可能使用**不同类型**的正则表达式。其中包括**编程语言**（比如 Java、Perl 和 Python）、Linux 工具（比如 `sed`、`gawk` 和 `grep`）以及**主流应用程序**（比如 MySQL 数据库服务器和 PostgreSQL 数据库服务器）。

- 正则表达式是由**正则表达式引擎**实现的。（这是一种底层软件，负责**解释**正则表达式并用这些模式进行文本匹配。）

- **最流行的**正则表达式引擎有以下**两种**：

  - POSIX **基础**正则表达式（basic regular expression，BRE）引擎。
  - POSIX **扩展**正则表达式（extended regular expression，ERE）引擎。

- 由于正则表达式的**实现方法众多**，因此**很难用一种简洁的描述**来**涵盖所有可能**的正则表达式。

## 定义BRE模式

> 最基本的 BRE 模式是匹配数据流中的文本字符。

### 普通文本

- **应用示例**：

```shell
# 1.匹配存在的单词have。
[root@localhost testdir]# echo "I have a dream." | gawk '/have/{print $0}'
I have a dream.
[root@localhost testdir]# 

# 2.匹配部分存在的单词hav。
[root@localhost testdir]# echo "I have a dream." | gawk '/hav/{print $0}'
I have a dream.

# 3.匹配不存在的单词has。
[root@localhost testdir]# echo "I have a dream." | gawk '/has/{print $0}'
[root@localhost testdir]# 

# 4.匹配大写的单词HAVE。（正则表达式区分大小写。）
[root@localhost testdir]# echo "I have a dream." | gawk '/HAVE/{print $0}'
[root@localhost testdir]# 

# 5.匹配带空格字符的单词。（在正则表达式中，空格和其他的字符没有什么区别。）
[root@localhost testdir]# echo "I have a dream." | gawk '/  have/{print $0}'
[root@localhost testdir]# 
[root@localhost testdir]# echo "I have a dream." | gawk '/have /{print $0}'
I have a dream.
[root@localhost testdir]#
```

### 特殊字符

- 正则表达式**能识别的特殊字符**如下所示：

```shell
.*[]^${}\+?|()
```

- 如果要将某个特殊字符视为普通字符，则必须将其**转义**。（需要在前面**加上反斜线**（`\`）。
- **应用示例**：

```shell
# 1.未对普通字符反斜线进行转义。
[root@localhost testdir]# echo "\ yes." | gawk '/\/{print $0}'
gawk: cmd. line:1: /\/{print $0}
gawk: cmd. line:1:  ^ unterminated regexp

# 2.对反斜线转义后再次匹配。
[root@localhost testdir]# echo "\ yes." | gawk '/\\/{print $0}'
\ yes.
[root@localhost testdir]# 

# 3.尽管正斜线（/）不属于正则表达式的特殊字符。
[root@localhost testdir]# echo "6/2=3" | gawk '///{print $0}'
gawk: cmd. line:1: ///{print $0}
gawk: cmd. line:1:    ^ syntax error

# 4.但使用正斜线也需要进行转义。
[root@localhost testdir]# echo "6/2=3" | gawk '/\//{print $0}'
6/2=3
[root@localhost testdir]# 
```

### 锚点字符

> 有两个特殊字符可以用来将模式锁定在数据流中的**行首**或**行尾**。

- **脱字符**（`^`）可以指定位于数据流中文本行**行首**的模式。
- 特殊字符**美元符号**（`$`）定义了**行尾**锚点。
- **锚定行首**：

```shell
# 1.检查单词this在行首。
[root@localhost testdir]# echo "this is a test" | gawk '/^this/{print $0}'
this is a test

# 2.检查单词test在行首。
[root@localhost testdir]# echo "this is a test" | gawk '/^test/{print $0}'
[root@localhost testdir]# 

# 3.如果在正则表达式中先指定脱字符，随后还有其他文本，那就必须在脱字符前用转义字符（作为普通字符处理）。
[root@localhost testdir]# echo "this is a ^ test" | gawk '/^ test/{print $0}'
[root@localhost testdir]# 
[root@localhost testdir]# echo "this is a ^ test" | gawk '/\^ test/{print $0}'
this is a ^ test
[root@localhost testdir]# 
```

- **锚定行尾**：

```shell
# 1.检查单词test在行尾。
[root@localhost testdir]# echo "this is a test" | gawk '/test$/{print $0}'
this is a test

# 2.检查单词this在行尾。
[root@localhost testdir]# echo "this is a test" | gawk '/this$/{print $0}'
[root@localhost testdir]# 
```

- **组合锚点**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
line 1

line 3

line 5
line 6
[root@localhost testdir]#

# 2.查找只含有特定文本模式的数据行。
[root@localhost testdir]# gawk '/^line 3$/{print $0}' data.txt 
line 3
[root@localhost testdir]#

# 3.过滤出数据流中的空行。->（^$）常用于匹配文档中的空行进行删除。
[root@localhost testdir]# gawk '/^$/{print $0}' data.txt 


[root@localhost testdir]# 
```

### 点号字符

> 点号字符（`.`）可以匹配除换行符之外的**任意单个**字符。

- 点号字符**必须匹配一个字符**，如果在点号字符的位置**没有**可匹配的字符，那么模式就**不成立**。
- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
this is a test.
ok, this is a test.
----this is a test.
[root@localhost testdir]# 

# 2.点号（.）能匹配包含空格的任意字符。
[root@localhost testdir]# gawk '/.th/{print $0}' data.txt 
ok, this is a test.
----this is a test.
[root@localhost testdir]# 
```

### 字符组

> 如果想要**限定**要匹配的**具体字符**，可以使用**字符组**。

- **方括号**（`[` `]`）用于定义字符组。
- 在方括号中加入你**希望出现**在该字符组中的所有字符，就可以在正则表达式中像其他特殊字符一样使用字符组了。
- **应用示例**：

```shell
# 1.涵盖了3个字符位置含有大小写的情况。
[root@localhost testdir]# echo "Yes" | gawk '/[Yy][Ee][Ss]/{print $0}'
Yes
[root@localhost testdir]# 

# 2.字符组并非只能含有字母，也可以在其中使用数字。
[root@localhost testdir]# cat data.txt 
line 1
line 2
line 3
line 4
[root@localhost testdir]# 
[root@localhost testdir]# gawk '/[23]/{print $0}' data.txt 
line 2
line 3
[root@localhost testdir]# 
```

- 可以将多个字符组组合在一起，以**检查数字**是否具备正确的格式，比如**电话号码**和**邮政编码**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat number.txt 
111
222
1111
[root@localhost testdir]# 

# 2.只定义了3个字符组，结果4位数的数字也被保留了。（记住，正则表达式可以匹配数据流中任何位置的文本。）
[root@localhost testdir]# gawk '/[12][12][12]/{print $0}' number.txt 
111
222
1111
[root@localhost testdir]# 

# 3.如果只保留3位数，就必须将其与其他字符分开，要么用空格，要么像下面例子中那样，指明要匹配数字的起止位置。
[root@localhost testdir]# gawk '/^[12][12][12]$/{print $0}' number.txt 
111
222
[root@localhost testdir]# 
```

- 字符组的一种极其**常见的用法**是**解析拼错的单词**，比如用户表单输入的数据：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
They have completely differant tastes in music.
They have completely different tastes in music.
[root@localhost testdir]# 

# 2.既能检查出拼写正确的单词，也能检查出拼写错误的单词。
[root@localhost testdir]# gawk '/differ[ae]nt/{print $0}' data.txt 
They have completely differant tastes in music.
They have completely different tastes in music.
[root@localhost testdir]# 
```

### 排除型字符组

> 在正则表达式中，你也可以**反转**字符组的作用：**匹配**字符组中**没有的字符**。为此，只需在**字符组的开头**添加**脱字符**（`^`）即可。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
They have completely differant tastes in music.
They have completely different tastes in music.
[root@localhost testdir]# 

# 2.匹配除a之外的任何字符以及文本模式。
[root@localhost testdir]# gawk '/differ[^a]nt/{print $0}' data.txt 
They have completely different tastes in music.
[root@localhost testdir]# 
```

### 区间

> 可以用**单连字符**（`-`）在字符组中表示字符**区间**。只需指定区间的第一个字符、连字符以及区间的最后一个字符即可。

- **应用示例**：

```shell
# 1.原文件数据。
[root@localhost testdir]# cat data.txt 
123
35
99

abc
cd
yz
[root@localhost testdir]# 

# 2.每个字符组会匹配0 ~ 5之间的任意数字。
[root@localhost testdir]# gawk '/^[0-5][0-5]$/{print $0}' data.txt 
35
[root@localhost testdir]# 

# 3.每个字符组会匹配a ~ h之间的任意字母。
[root@localhost testdir]# gawk '/^[a-h][a-h]$/{print $0}' data.txt 
cd
[root@localhost testdir]# 
```

### 特殊的字符组

> 除了定义自己的字符组，BRE 还**提供了**一些**特殊的字符组**，以用来匹配特定类型的字符。

- **BRE** **特殊字符组**：

|   字符组    | 描述                                                         |
| :---------: | :----------------------------------------------------------- |
| [[:alpha:]] | 匹配任意字母字符，无论是大写还是小写。                       |
| [[:alnum:]] | 匹配任意字母数字字符，0~9、A~Z 或 a~z。                      |
| [[:blank:]] | 匹配空格或制表符。                                           |
| [[:digit:]] | 匹配 0~9 中的数字。                                          |
| [[:lower:]] | 匹配小写字母字符 a~z。                                       |
| [[:print:]] | 匹配任意可打印字符。                                         |
| [[:punct:]] | 匹配标点符号。                                               |
| [[:space:]] | 匹配任意空白字符：空格、制表符、换行符、分页符（formfeed）、垂直制表符和回车符。 |
| [[:upper:]] | 匹配任意大写字母字符 A~Z。                                   |

- **应用示例**：

```shell
# 1.匹配数字。
[root@localhost testdir]# echo "123" | gawk '/[[:digit:]]/{print $0}'
123
[root@localhost testdir]# 

# 2.匹配字母。
[root@localhost testdir]# echo "abc" | gawk '/[[:alpha:]]/{print $0}'
abc
[root@localhost testdir]# 
```

### 星号

> 在字符后面放置**星号**（`*`）表明该字符**必须**在匹配模式的文本中**出现** **0** **次**或**多次**。

- **应用示例**：

```shell
# 1.匹配任意字符出现多次。
[root@localhost testdir]# echo "abbc" | gawk '/a*c/{print $0}'
abbc
[root@localhost testdir]# 
[root@localhost testdir]# echo "abbbbbbc" | gawk '/a*c/{print $0}'
abbbbbbc
[root@localhost testdir]# 

# 2.点号字符和星号字符组合。（能够匹配任意数量的任意字符，通常用在数据流中两个可能相邻或不相邻的字符串之间。）
[root@localhost testdir]# echo "this is a test." | gawk '/is.*t/{print $0}'
this is a test.
[root@localhost testdir]# 
[root@localhost testdir]# echo "this is a test." | gawk '/as.*t/{print $0}'
[root@localhost testdir]# 
```

## 扩展正则表达式

> POSIX ERE 模式提供了一些可供 Linux 应用程序和工具使用的额外符号。`gawk` **支持** ERE 模式，但 `sed` **不支持**。

- 记住，`sed` 和 `gawk` 的正则表达式引擎之间是**有区别的**。
- `gawk` 可以使用大多数扩展的正则表达式符号，并且能够提供了一些 `sed` 所不具备的**额外过滤功能**。
- 正因如此，`gawk` 在处理数据时**往往比较慢**。

### 问号

> **问号**（`?`）表明前面的字符可以出现 **0** **次或** **1** **次**，仅此而已，它不会匹配多次出现的该字符。

- **应用示例**：

```shell
# 1.字符组的字母b出现零次。
[root@localhost testdir]# echo "ac" | gawk '/a[b]?c/{print $0}'
ac
[root@localhost testdir]# 

# 2.字符组的字母b出现一次。
[root@localhost testdir]# echo "abc" | gawk '/a[b]?c/{print $0}'
abc
[root@localhost testdir]# 

# 3.字符组的字母b出现两次。
[root@localhost testdir]# echo "abbc" | gawk '/a[b]?c/{print $0}'
[root@localhost testdir]# 
```

### 加号

> **加号**（`+`）表明前面的字符可以出现 **1** **次或多次**，但**必须至少出现** **1** **次**。

- **应用示例**：

```shell
# 1.字符组的字母e出现一次。
[root@localhost testdir]# echo "def" | gawk '/d[e]+f/{print $0}'
def
[root@localhost testdir]# 

# 2.字符组的字母e出现一次以上。
[root@localhost testdir]# echo "deef" | gawk '/d[e]+f/{print $0}'
deef
[root@localhost testdir]# 

# 3.字符组的字母e没有出现。
[root@localhost testdir]# echo "df" | gawk '/d[e]+f/{print $0}'
[root@localhost testdir]# 
[root@localhost testdir]# echo "dxf" | gawk '/d[e]+f/{print $0}'
[root@localhost testdir]# 
```

### 花括号

> ERE 中的**花括号**（`{` `}`）允许为正则表达式指定具体的**可重复次数**，这通常称为**区间**。

- 可以用两种格式来指定区间：

  - m：正则表达式恰好**出现** ***m*** **次**。
  - m, n：正则表达式**至少出现** ***m*** **次**，**至多出现** ***n*** **次**。

- 这个特性可以**精确指定**字符（或字符组）在模式中具体**出现的次数**。

- **注意事项**：在**默认情况下**，`gawk` **不识别**正则表达式**区间**，**必须指定** `gawk` 的命令行选项 **--re-interval** 才行。

- **应用示例**：

```shell
# 1.字符y固定出现四次。
[root@localhost testdir]# echo "xyyyyz" | gawk --re-interval '/xy{4}z/{print $0}' 
xyyyyz
[root@localhost testdir]# 

# 2.字符y固定出现三次。
[root@localhost testdir]# echo "xyyyyz" | gawk --re-interval '/xy{3}z/{print $0}' 
[root@localhost testdir]# 

# 3.字符y最少出现一次，最多出现两次。
[root@localhost testdir]# echo "xz" | gawk --re-interval '/xy{1,2}z/{print $0}' 
[root@localhost testdir]#
[root@localhost testdir]# echo "xyz" | gawk --re-interval '/xy{1,2}z/{print $0}' 
xyz
[root@localhost testdir]# 
[root@localhost testdir]# echo "xyyz" | gawk --re-interval '/xy{1,2}z/{print $0}' 
xyyz
[root@localhost testdir]# 
[root@localhost testdir]# echo "xyyyz" | gawk --re-interval '/xy{1,2}z/{print $0}' 
[root@localhost testdir]# 
```

### 竖线符号

> **竖线符号**（`|`）允许在检查数据流时，以逻辑 **OR** 方式指定正则表达式引擎要使用的**两个或多个模式**。

- 如果其中**任何一个**模式匹配了数据流文本，就**视为匹配**。如果**没有**模式匹配，则**匹配失败**。
- **应用示例**：

```shell
# 1.通过逻辑或进行匹配。（命中任意一个就成功，否则匹配失败。）
[root@localhost testdir]# echo "this is a snake" | gawk '/cat|dog/{print $0}'
[root@localhost testdir]# 
[root@localhost testdir]# echo "this is a snake" | gawk '/cat|snake/{print $0}'
this is a snake
[root@localhost testdir]# 
```

- **注意事项**：正则**表达式**和**竖线**符号之间**不能有空格**，**否则**竖线符号**会被认为**是正则表达式**模式的一部分**。

### 表达式分组

> 也可以用**圆括号**（`(` `)`）对正则表达式进行**分组**。

- 分组之后，**每一组**会被视为**一个整体**，可以像对普通字符一样对该组应用特殊字符。
- **应用示例**：

```shell
# 1.结尾的(urday)分组和问号使得该模式能够匹配 Saturday 的全写或 Sat 缩写。
[root@localhost testdir]# echo "Sat" | gawk '/Sat(urday)?/{print $0}'
Sat
[root@localhost testdir]# 
[root@localhost testdir]# echo "Saturday" | gawk '/Sat(urday)?/{print $0}'
Saturday
[root@localhost testdir]# 
```

- 将**分组**和**竖线符号结合**起来创建**可选的模式**匹配组是很常见的做法：

```shell
# 1.正则表达式(c|b)a(b|t)匹配的模式是第一组中任意字母、a 以及第二组中任意字母的各种组合。
[root@localhost testdir]# echo "cat" | gawk '/(c|b)a(b|t)/{print $0}'
cat
[root@localhost testdir]# 
[root@localhost testdir]# echo "bat" | gawk '/(c|b)a(b|t)/{print $0}'
bat
[root@localhost testdir]# 
[root@localhost testdir]# echo "cab" | gawk '/(c|b)a(b|t)/{print $0}'
cab
[root@localhost testdir]# 
[root@localhost testdir]# echo "xab" | gawk '/(c|b)a(b|t)/{print $0}'
[root@localhost testdir]# 
[root@localhost testdir]# echo "cax" | gawk '/(c|b)a(b|t)/{print $0}'
[root@localhost testdir]# 
```
