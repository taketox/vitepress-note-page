# 环境变量

## 什么是环境变量

> Linux 环境变量能帮你提升 Linux shell 的使用体验。很多程序和脚本**通过环境变量**来获取**系统信息**、**存储临时数据**和**配置信息**。在 Linux 系统中，有很多地方可以设置环境变量，了解去哪里设置相应的环境变量很重要。

- bash shell 使用**环境变量**来存储 shell 会话和工作环境的相关信息（这也是被称作环境变量的原因）。
- 环境变量允许在**内存**中存储数据，以便 shell 中运行的**程序或脚本能够轻松访问**到这些数据。
- 这也是存储持久数据的一种简便方法。
- bash shell 中有**两种**环境变量：**全局变量**与**局部变量**。

### 全局环境变量

> **全局**环境变量对于 shell 会话和**所有生成的**子 shell 都是可见的。**局部**环境变量则**只对创建它的** shell 可见。

- 系统环境变量基本上会使用**全大写字母**，以区别于用户自定义的环境变量。
- 可以使用 `env` 命令或 `printenv` 命令来查看全局变量：

```sh
[root@localhost ~]# printenv
XDG_SESSION_ID=351727
HOSTNAME=localhost
TERM=xterm
SHELL=/bin/bash
HISTSIZE=3000
...
```

- 可以 `printenv` 命令或 `echo` 命令显示个别环境变量的值：

```sh
# 1.使用printenv显示。
[root@localhost ~]# printenv XDG_SESSION_ID
351727

# 2.使用echo显示。
[root@localhost ~]# echo $XDG_SESSION_ID
351727
```

### 局部环境变量

> 局部环境变量只能在定义它的进程中可见。尽管是局部的，但是局部环境变量的重要性丝毫不输全局环境变量。

- `set` 命令查看局部环境变量：

```sh
[root@localhost ~]# set
BASH=/bin/bash
BASH_ARGC=()
BASH_ARGV=()
BASH_LINENO=()
BASH_SOURCE=()
BASH_VERSINFO=([0]="3" [1]="00" [2]="15" [3]="1" [4]="release" [5]="i386-redhat-linux-gnu")
BASH_VERSION='3.00.15(1)-release'
COLORS=/etc/DIR_COLORS.xterm
COLUMNS=99
DIRSTACK=()
EUID=0
GROUPS=()
G_BROKEN_FILENAMES=1
HISTFILE=/root/.bash_history
HISTFILESIZE=1000
HISTSIZE=1000
HOME=/root
HOSTNAME=hnlinux
HOSTTYPE=i386
IFS=$' '
INPUTRC=/etc/inputrc
KDEDIR=/usr
LANG=zh_CN.GB2312
...
```

- **注意事项**：`set` 命令可以**显示特定进程的所有环境变量**，既包括局部变量、全局变量，也包含用户自定义变量及局部 shell 函数，还会按照字母顺序对结果进行排序。

## 设置用户自定义变量

### 设置局部用户自定义变量

> 启动 bash shell（或者执行 shell 脚本）之后，就能创建仅对该 shell 进程可见的局部用户自定义变量。可以使用**等号为变量赋值**，值可以是数值或字符串。

- **应用示例**：

```sh
# 1.自定义变量及值（如果赋值的字符串包含空格，则必须用单引号或者双引号来界定该字符串的起止）。
[root@localhost ~]# my_variable="Hello World"

# 2.显示定义好的局部用户自定义变量。
[root@localhost ~]# echo $my_variable 
Hello World
```

- **注意事项**：

  - **自己定义的**局部变量用的是**小写字母**，而**系统环境**变量用的都是**大写字母**。这么做是为了**避免由于不小心与系统环境变量同名可能带来的问题。**
  - 在变量名、等号和值之间**没有空格**，这一点非常重要。
  - 如果在子进程中设置一个局部变量，那么**一旦退出子进程**，该局部变量就不能用了。

### 设置全局环境变量

> 全局环境变量在设置该变量的父进程所创建的子进程中都是可见的。创建全局环境变量的方法是**先创建局部变量**，然后**再将其导出**到全局环境中。

- `export` 命令：

```sh
# 1.先创建局部变量。
[root@localhost ~]# my_variable="I am Global now"

# 2.使用export导出到全局环境。
[root@localhost ~]# export my_variable

# 3.显示定义好的全局环境变量。
[root@localhost ~]# echo $my_variable 
I am Global now
```

- **简写方式**：

```sh
[root@localhost ~]# export my_var="I am Global now"
[root@localhost ~]# echo $my_var
I am Global now
```

## 删除环境变量

> 既然可以创建新的环境变量，自然也能**删除**已有的环境变量。可以使用 `unset` 命令来完成这个操作。

- **应用示例**：

```sh
# 1.设置全局环境变量并显示。
[root@localhost ~]# export my_variable="Hello"
[root@localhost ~]# echo $my_variable 
Hello

# 2.删除该环境变量。
[root@localhost ~]# unset my_variable 
[root@localhost ~]# echo $my_variable 
```

## 设置 PATH 环境变量

> PATH 环境变量定义了用于查找命令和程序的目录。

- **应用示例**：

```sh
# PATH中的目录之间以冒号分隔，shell 会在其中查找命令和程序。
[root@localhost ~]# echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
```

- 应用程序的可执行文件目录有时**不在** PATH 环境变量所包含的目录中（执行时，shell 会提示 **command not found**）。
- 解决方法是保证 PATH 环境变量**包含所有存放应用程序的目录**。
- 有些脚本编写使用 `#!/usr/bin/env bash` 作为脚本第一行。这种方法的优点在于 `env` 会在 `$PATH` 中搜索 bash ，使脚本具备**更好的可移植性**。
- 可以把新的搜索目录**添加**到现有的 `PATH` 环境变量中（将该目录加入到 PATH 环境变量之后，就可以在虚拟目录结构的**任意位置执行**这个程序了）：

```sh
# 1.使用冒号:绝对路径。
[root@localhost ~]# PATH=$PATH:/home/scripts
```

## 定位系统环境变量

> 通过上面的步骤，已经知道如何修改系统环境变量，也知道如何创建自己的变量。接下来就是怎样让环境变量作用**持久化**。

- 当登录 Linux 系统启动 bash shell 时，默认情况下 bash 会在几个文件中查找命令，这些文件称为 **启动文件** 或 **环境文件**。bash 进程的启动文件取决于你启动 bash shell 的方式，其中有以下 **3 种**方式：

  - 登录时作为**默认登录** shell；
  - 作为**交互式** shell ，通过生成子 shell 启动；
  - 作为**运行脚本的非交互式** shell。

### 登录 shell

> 当你登录 Linux 系统时，bash shell 会作为登录 shell 启动。登录 shell 通常会从 **5 个**不同的启动文件种读取命令。

- `/etc/profile`
- `$HOME/.bash_profile`
- `$HOME/.bashrc`
- `$HOME/.bash_login`
- `$HOME/.profile`
- 说明：`/etc/profile` 文件是系统中**默认的** bash shell 的**主启动文件**。系统中的每个用户登录时都会执行这个启动文件。而另外 4 个启动文件是**针对用户的**，位于用户主目录中，可根据个人具体需求定制。

#### `/etc/profile` 文件

- 查看 `/etc/profile` 文件内容（此处可能根据系统版本不同而有所区别）：

```sh
[root@localhost my]# cat /etc/profile
# /etc/profile

# System wide environment and startup programs, for login setup
# Functions and aliases go in /etc/bashrc

# It's NOT a good idea to change this file unless you know what you
# are doing. It's much better to create a custom.sh shell script in
# /etc/profile.d/ to make custom changes to your environment, as this
# will prevent the need for merging in future updates.

pathmunge () {
    case ":${PATH}:" in
        *:"$1":*)
            ;;
        *)
            if [ "$2" = "after" ] ; then
                PATH=$PATH:$1
            else
                PATH=$1:$PATH
            fi
    esac
}


if [ -x /usr/bin/id ]; then
    if [ -z "$EUID" ]; then
        # ksh workaround
        EUID=`/usr/bin/id -u`
        UID=`/usr/bin/id -ru`
    fi
    USER="`/usr/bin/id -un`"
    LOGNAME=$USER
    MAIL="/var/spool/mail/$USER"
fi

# Path manipulation
if [ "$EUID" = "0" ]; then
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
else
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
fi

HOSTNAME=`/usr/bin/hostname 2>/dev/null`
if [ "$HISTCONTROL" = "ignorespace" ] ; then
    export HISTCONTROL=ignoreboth
else
    export HISTCONTROL=ignoredups
fi

export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL

# By default, we want umask to get set. This sets it for login shell
# Current threshold for system reserved uid/gids is 200
# You could check uidgid reservation validity in
# /usr/share/doc/setup-*/uidgid file
if [ $UID -gt 199 ] && [ "`/usr/bin/id -gn`" = "`/usr/bin/id -un`" ]; then
    umask 002
else
    umask 022
fi

for i in /etc/profile.d/*.sh /etc/profile.d/sh.local ; do
    if [ -r "$i" ]; then
        if [ "${-#*i}" != "$-" ]; then 
            . "$i"
        else
            . "$i" >/dev/null
        fi
    fi
done

unset i
unset -f pathmunge
```

- 上面 `/etc/profile` 使用到了 `for` 语句来迭代 `/etc/profile.d` 目录下的所有文件。
- 这为 Linux 系统提供了一个放置特定应用程序启动文件和/或管理员自定义启动文件的地方，shell 会在用户登录时执行这些文件。
- 查看 `/etc/profile.d` 目录下的文件：

```sh
[root@localhost my]# ls /etc/profile.d/
256term.csh  abrt-console-notification.sh  colorgrep.csh  colorls.csh  csh.local  lang.sh   less.sh           mpi-selector.sh  vim.csh  which2.csh
256term.sh   bash_completion.sh            colorgrep.sh   colorls.sh   lang.csh   less.csh  mpi-selector.csh  sh.local         vim.sh   which2.sh
```

#### `$HOME` 目录下的启动文件

> 大多数 Linux 发行版**只用**这 4 个启动文件中的**一两个**。注意这些文件都以点号开头，说明属于**隐藏文件**（不能直接使用 `ls` 命令看到）。

- `$HOME/.bash_profile`
- `$HOME/.bashrc`
- `$HOME/.bash_login`
- `$HOME/.profile`
- 查看当前 CentOS Linux 系统中的 `.bash_profile` 文件内容如下：

```sh
[root@localhost ~]# cat $HOME/.bash_profile
# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
 . ~/.bashrc
fi

# User specific environment and startup programs

PATH=$PATH:$HOME/bin

export PATH
```

### 交互式 shell 进程

> 如果**不是在登录系统时启动的** bash shell（ 比如在命令行输入 `bash` ），那么这时的 shell 称作交互式 shell 。与登录 shell 一样，交互式 shell **提供了命令行提示符供用户输入命令**。而作为交互式 shell 启动的 bash 并**不处理** `/etc/profile` 文件，**只检查用户** $HOME 目录中的 `.bashrc` 文件。

- 查看当前 CentOS Linux 系统中的 `.bashrc` 文件内容如下：

```sh
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
```

- `.bashrc` 文件会做两件事：首先，**检查** `/etc`目录下的通用`bashrc`文件；其次，为用户**提供一个定制自己的命令别名和脚本函数**。

### 非交互式 shell

> 最后一种 shell 是非交互式 shell 。**系统执行** shell 脚本时用的就是这种 shell 。不同之处在于它**没有命令行提示符**。当你希望能够运行一些特定的启动命令时，bash shell 提供了 BASH_ENV 环境变量。如果有指定的文件，则 shell 会执行该文件里的命令，这通常包括 shell 脚本变量设置。

- 查看当前 BASH_ENV 变量设置：

```sh
# 1.如果变量未设置，则会显示一个空行。
[root@localhost ~]# echo $BASH_ENV
```

- **提示**：

  - 有些 shell 脚本时通过**启动一个子** shell 来执行的。子 shell 会**继承** 父 shell 的**导出变量**。
  - 对于那些**不启动子** shell 的脚本，变量**已经存在于**当前 shell 中了。**就算没有设置** BASH_ENV，**也可以使用**当前 shell 的局部变量和全局变量。

### 环境变量持久化

- 最好在 `/etc/profile.d` 目录中创建一个以 `.sh` 结尾的文件。把**所有新的或修改过的**全局环境变量设置都放在这个文件中。
- 在大多数发行版中，保存**个人用户永久性** bash shell 变量的最佳地点是 `$HOME/.bashrc` 文件，这适用于所有类型的 shell 进程。
- 如果设置了 BASH_ENV 变量，请记住：**除非值为** `$HOME/.bashrc` ，**否则**，应该将**非交互式** shell 的用户变量存放到别的地方。
- `alias` 命令设置**无法持久生效**，可以把个人的 `alias` 设置放在 `$HOME/.bashrc` 启动文件中，**使其效果永久化**。

## 数组变量

> 数组是能够**存储多个值**的变量。这些值既可以单独引用，也可以整体引用。

- 要为某个环境变量设置多个值，可以把值放在**圆括号**中，值与值之间以**空格分隔**。
- **应用示例**：

```sh
# 1.设置多个值。
[root@localhost ~]# my_var=(zero one two three)

# 2.引用单个数组元素（索引都是从 0 开始）。
[root@localhost ~]# echo ${my_var[2]}
two

# 3.显示整个数组变量。
[root@localhost ~]# echo ${my_var[*]}
zero one two three

# 4.改变某个索引位置上的值。
[root@localhost ~]# my_var[2]=six
[root@localhost ~]# echo ${my_var[2]}
six

# 5.使用unset删除数组中的单个元素。
[root@localhost ~]# unset my_var[2]
[root@localhost ~]# echo ${my_var[*]}
zero one three
[root@localhost ~]# echo ${my_var[2]}

# 6.使用unset删除整个数组变量。
[root@localhost ~]# unset my_var
[root@localhost ~]# echo ${my_var[*]}
```

- **提示：有时候，数组变量只会把事情搞得更复杂，所以在 shell 脚本编程时并不常用。**
