# 脚本控制

## 处理信号

> Linux 利用**信号**与系统中的**进程进行通信**。可以通过对脚本进行编程，使其在**收到特定信号**时执行某些命令，从而**控制** shell **脚本的操作**。

### Linux 信号

> Linux 系统和应用程序可以产生超过 30 个信号。

- **常见的** **Linux** **系统信号**：

| 信号 | 值      | 描述                                |
| :--- | :------ | :---------------------------------- |
| 1    | SIGHUP  | 挂起（hang up）进程。               |
| 2    | SIGINT  | 中断（interrupt）进程。             |
| 3    | SIGQUIT | 停止（stop）进程。                  |
| 9    | SIGKILL | 无条件终止（terminate）进程。       |
| 15   | SIGTERM | 尽可能终止进程。                    |
| 18   | SIGCONT | 继续运行停止的进程。                |
| 19   | SIGSTOP | 无条件停止，但不终止进程。          |
| 20   | SIGTSTP | 停止或暂停（pause），但不终止进程。 |

- 在**默认情况**下，bash shell 会**忽略**收到的任何 SIGQUIT(**3**) 信号和 SIGTERM(**15**) 信号（因此交互式 shell 才不会被意外终止）。

- bash shell 会**处理**收到的所有 SIGHUP(**1**) 信号和 SIGINT(**2**) 信号。

- **处理 SIGHUP(1) 信号**：

  - 如果**收到**了 SIGHUP(**1**) 信号（比如在离开交互式 shell 时），bash shell 就会**退出**。
  - 但在**退出之前**，它会将 SIGHUP(**1**) **信号传给**所有由该 shell 启动的**进程**，包括正在运行的 shell **脚本**。

- **处理 SIGHUP(2) 信号**：

  - 随着**收到** SIGINT(**2**) 信号，shell 会被**中断**。
  - Linux 内核将**不再**为 shell **分配** **CPU** 处理时间。
  - 当出现这种情况时，shell 会将 SIGINT(**2**) **信号传给**由其启动的所有**进程**，以此**告知**出现的**状况**。

- shell 会将这些信号传给 shell 脚本来处理。而 shell **脚本**的**默认**行为是**忽略这些信号**，因为可能**不利于脚本运行**。

- 要**避免**这种情况，可以在**脚本**中**加入识别信号的代码**，**并做相应的处理**。

### 产生信号

> bash shell 允许使用**键盘上的组合键**来生成**两种**基本的 Linux 信号。这个特性在需要**停止**或**暂停**失控脚本时非常方便。

#### 中断进程

- **Ctrl+C** 组合键会发送 SIGINT 信号，**终止** shell 中当前运行的**进程**。
- **应用示例**：

```shell
# 1.指定睡眠1800秒。（通过ctrl+c提前终止sleep命令。）
[root@localhost testdir]# sleep 1800
^C
[root@localhost testdir]#
```

------

#### 暂停进程

- 也可以暂停进程，而不是将其终止。
- 它往往可以在**不终止进程的情况下**，使你能够**深入脚本内部**一窥究竟。
- **Ctrl+Z** 组合键会生成 SIGTSTP 信号，**停止** shell 中运行的任何**进程**。
- **停止**（ *stopping* ）进程跟**终止**（ *terminating* ）进程**不同**，**前者**让程序**继续驻留在内存中**，还能从上次停止的位置**继续运行**。
- **应用示例**：

```shell
# 1.通过ctrl+z终止sleep进程。
[root@localhost testdir]# sleep 1800
^Z
[1]+  Stopped                 sleep 1800

# 2.通过ctrl+z终止sleep进程。（这里进程方括号中的作业号会加1。）
[root@localhost testdir]# sleep 1800
^Z
[2]+  Stopped                 sleep 1800

# 3.查看已停止的作业。（在s列，已停止作业的状态显示为T。）
[root@localhost testdir]# ps -l
F S   UID   PID  PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD
0 T     0  4267 32284  0  80   0 - 27014 do_sig pts/0    00:00:00 sleep
0 T     0  4372 32284  0  80   0 - 27014 do_sig pts/0    00:00:00 sleep
0 R     0  4407 32284  0  80   0 - 38332 -      pts/0    00:00:00 ps
4 S     0 32284 32128  0  80   0 - 29170 do_wai pts/0    00:00:00 bash

# 4.可以用 kill 命令发送 SIGKILL(9) 信号将其终止。
[root@localhost testdir]# kill -9 4267
[1]-  Killed                  sleep 1800
[root@localhost testdir]# kill -9 4372
[2]+  Killed                  sleep 1800

# 5.成功停止sleep进程。
[root@localhost testdir]# ps -l
F S   UID   PID  PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD
0 R     0  4641 32284  0  80   0 - 38324 -      pts/0    00:00:00 ps
4 S     0 32284 32128  0  80   0 - 29170 do_wai pts/0    00:00:00 bash
[root@localhost testdir]# 
```

- **注意事项**：**有时这么做是比较危险的**。（比如，脚本打开了一个关键的系统文件的文件锁。）

------

### 捕获信号

> 你也可以用其他命令在信号出现时**将其捕获**，而不是忽略信号。

- `trap` 命令可以**指定** shell 脚本需要**侦测并拦截**的 Linux **信号**。
- 如果**脚本收到了** `trap` 命令中列出的信号，则该信号不再由 shell 处理，而是**由本地处理**。
- `trap` 命令的格式如下：

```shell
trap commands signals
```

- 在 `trap` 命令中，需要在 *commands* 部分列出想要 shell 执行的**命令**，在 *signals* 部分列出**想要捕获的信号**（多个信号之间以**空格分隔**）。
- 指定信号的时候，**可以使用**信号的**值**或**信号名**。
- **应用示例**：

```shell
# 1.脚本内容。（使用 trap 命令捕获 SIGINT 信号并控制脚本的行为。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
trap "echo ' ctrl+c : termination failure! '" SIGINT
#
count=1
until [ $count -gt 5 ]; do
    echo "loop - $count"
    sleep 3
    count=$((count + 1))
done
#
exit

# 2.执行脚本。（每次使用 Ctrl+C 组合键，脚本都会执行 trap 命令中指定的 echo 语句，而不是忽略信号并让 shell 停止该脚本。）
[root@localhost testdir]# ./test.sh 
loop - 1
^C ctrl+c : termination failure! 
loop - 2
^C ctrl+c : termination failure! 
loop - 3
loop - 4
loop - 5
[root@localhost testdir]# 
```

- **注意事项**：

  - 如果脚本中的命令被信号中断，使用带有指定命令的 `trap` **未必能**让被中断的命令继续执行。
  - 为了**保证**脚本中的**关键操作不被打断**，请使用带有**空操作命令**的 `trap` 以**及要捕获的信号列表**。
  - 例如：`trap` "" SIGINT
  - 这种形式的 `trap` 命令允许脚本**完全忽略** SIGINT 信号，**继续执行重要的工作**。

### 捕获脚本退出

> 可以在 shell 脚本**退出时**捕获信号。

- 要捕获 shell 脚本的退出，只需在 `trap` 命令后**加上** **EXIT** 信号即可。
- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
trap "echo ' Goodbye... '" EXIT
#
count=1
until [ $count -gt 5 ]; do
    echo "loop - $count"
    sleep 3
    count=$((count + 1))
done
#
exit

# 2.执行脚本。（运行到正常的退出位置时，触发了 EXIT。）
[root@localhost testdir]# ./test.sh 
loop - 1
loop - 2
loop - 3
loop - 4
loop - 5
 Goodbye... 
 
 # 2.执行脚本。（提前退出脚本，则依然能捕获到 EXIT。）
[root@localhost testdir]# ./test.sh 
loop - 1
loop - 2
^C Goodbye... 
```

### 修改或移除信号捕获

> 要想在脚本中的**不同位置**进行**不同的信号捕获**处理，只需**重新使用**带有新选项的 `trap` 命令。

- **修改信号捕获 - 应用示例**：

```shell
# 1.脚本内容。（增加trap）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
trap "echo ' trap 1 '" SIGINT
#
count=1
until [ $count -gt 3 ]; do
    echo "loop[1] - $count"
    sleep 2
    count=$((count + 1))
done
#
trap "echo ' trap 2 '" SIGINT
#
count=1
until [ $count -gt 3 ]; do
    echo "loop[2] - $count"
    sleep 2
    count=$((count + 1))
done
#
exit

# 2.执行脚本。（如果信号是在捕获被修改前接收到的，则脚本仍然会根据原先的 trap 命令处理该信号。）
[root@localhost testdir]# ./test.sh 
loop[1] - 1
loop[1] - 2
^C trap 1 
loop[1] - 3
loop[2] - 1
^C trap 2 
loop[2] - 2
loop[2] - 3
```

- 也可以**移除**已设置好的信号捕获。
- 在 `trap` 命令与希望**恢复默认行为**的信号列表之间加上**两个连字符**即可。
- **移除信号捕获 - 应用示例**：

```shell
# 1.脚本内容。（trap -- SIGINT 移除信号。）
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
trap "echo ' Sorry...Ctrl-C is trapped. '" SIGINT
#
count=1
until [ $count -gt 3 ]; do
    echo "loop[1] - $count"
    sleep 2
    count=$((count + 1))
done
#
trap -- SIGINT
echo "The trap is now removed."
#
count=1
until [ $count -gt 3 ]; do
    echo "loop[2] - $count"
    sleep 2
    count=$((count + 1))
done
#
exit

# 2.执行脚本。（捕获移除前，忽略终止信号；捕获移除后，按照默认处理，终止信号生效。）
[root@localhost testdir]# ./test.sh 
loop[1] - 1
loop[1] - 2
^C Sorry...Ctrl-C is trapped. 
loop[1] - 3
The trap is now removed.
loop[2] - 1
^C
[root@localhost testdir]# 
```

## 以后台模式运行脚本

> 有些脚本可能要**执行很长一段时间**。此时，直接在命令行界面运行 shell 脚本就不怎么方便了。

### 后台运行脚本

> 以后台模式运行 shell 脚本非常简单，只需在**脚本名后面**加上 **&** 即可。

- **应用示例**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo
count=1
until [ $count -gt 5 ]; do
    echo "loop - $count"
    sleep 2
    count=$((count + 1))
done
#
exit

# 2.执行脚本。
# 方括号中的数字（2）是 shell 分配给后台进程的作业号。
# 之后的数字（18698）是 Linux 系统为进程分配的进程 ID（PID）。
# Linux 系统中的每个进程都必须有唯一的 PID。
[root@localhost testdir]# ./test.sh &
[2] 18698
[root@localhost testdir]# 
loop - 1
loop - 2
loop - 3
loop - 4
loop - 5
^C
[2]-  Done                    ./test.sh
```

- **提示**：当后台进程运行时，它**仍然会**使用终端显示器来**显示** **STDOUT** 和 **STDERR** **消息**。
- **最好是将**后台脚本的 STDOUT 和 STDERR 进行**重定向**，**避免**这种**杂乱的输出**：

```shell
# 1.执行脚本。（将消息重定向，不在终端显示。）
[root@localhost testdir]# ./test.sh &> service.log
[root@localhost testdir]# 

# 2.日志记录信息。
[root@localhost testdir]# cat service.log 

loop - 1
loop - 2
loop - 3
loop - 4
loop - 5
```

### 运行多个后台作业

> 在使用命令行提示符的情况下，可以**同时启动多个**后台作业。

- 通过 `ps` 命令可以看到，所有**脚本都处于运行状态**：

```shell
# 1.每次启动新作业时，Linux 系统都会为其分配新的作业号和 PID。
[root@localhost testdir]# ps
  PID TTY          TIME CMD
22493 pts/0    00:00:00 vim
27305 pts/0    00:00:00 test.sh
27381 pts/0    00:00:00 test.sh
27441 pts/0    00:00:00 sleep
27450 pts/0    00:00:00 sleep
27451 pts/0    00:00:00 ps
32284 pts/0    00:00:00 bash
```

- **注意事项**：在 `ps` 命令的输出中，**每一个后台进程**都和终端会话（pts/0）**终端关联**在一起。
- **如果终端会话退出**，那么**后台进程也会随之退出。**

## 在非控制台下运行脚本

> 有时候，**即便退出了终端会话**，你也想在终端会话中启动 shell 脚本，让脚本一直以后台模式运行到结束。

- `nohup` 命令能**阻断**发给特定进程的 SIGHUP 信号。当退出终端会话时，这可以**避免进程退出**。
- `nohup` **命令的格式如下**：

```shell
nohup command
```

- 下面的例子使用一个**后台脚本**作为 *command* :

```shell
# 1.非控制台运行脚本。（和普通后台进程一样，shell 会给 command 分配一个作业号，Linux 系统会为其分配一个 PID号。）
[root@localhost testdir]# nohup ./test.sh &
[2] 520
[root@localhost testdir]# nohup: ignoring input and appending output to ‘nohup.out’
```

- 由于 `nohup` 命令会**解除终端**与**进程**之间的**关联**，因此进程不再同 STDOUT 和 STDERR 绑定在一起。
- 为了保存该命令产生的输出，`nohup` 命令会**自动**将 STDOUT 和 STDERR 产生的消息**重定向到**一个名为  **nohup.out** 的**文件中**。
- nohup.out 文件**包含**了原本要发送到终端显示器上的**所有输出**：

```shell
[root@localhost testdir]# cat nohup.out 

loop - 1
loop - 2
loop - 3
loop - 4
loop - 5
[root@localhost testdir]# 
```

- **提示**：nohup.out 文件**一般在当前工作目录**中创建，否则会在 $HOME 目录中创建。

- **注意事项**：

  - 如果使用 `nohop` **运行了另一个命令**，那么该命令的输出**会被追加到**已有的 nohup.out 文件中。
  - 当运行位于**同一目录中的多个命令时**，一定要当心，因为所有的命令输出都会***\*发送到同一个\**** nohup.out 文件中，**结果会让人摸不着头脑**。

## 作业控制

> 作业控制包括**启动**、**停止**、“**杀死**”以及**恢复**作业。

### 查看作业

> `jobs` 是作业控制中的关键命令，该命令允许用户**查看** shell 当前**正在处理的作业**。

- **应用示例**：

```shell
# 1.脚本内容。
# 脚本用$$变量来显示 Linux 系统分配给该脚本的 PID。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
echo "Script Process ID: $$"
#
count=1
until [ $count -gt 5 ]; do
    echo "loop - $count"
    sleep 10
    count=$((count + 1))
done
#
echo "End of script..."
#
exit

# 2.执行脚本。（使用 Ctrl+Z 组合键停止脚本。）
[root@localhost testdir]# ./test.sh 
Script Process ID: 11379
loop - 1
^Z
[2]+  Stopped                 ./test.sh

# 3.利用 & 将另一个作业作为后台进程启动。
[root@localhost testdir]# ./test.sh > test.out &
[3] 11585

# 4.通过 jobs 命令可以查看分配给 shell 的作业。
# jobs 命令显示了一个`已停止`的作业和一个`运行中`的作业，以及两者的作业号和作业`使用的命令`。
# 带有`加号`的作业为`默认作业`，如果作业控制命令没有指定作业号，则引用的就是该作业。
# 带有`减号`的作业会在默认作业结束之后成为`下一个默认作业`。
# 任何时候，不管 shell 中运行着多少作业，带加号的作业`只能有一个`，带减号的作业`也只能有一个`。
[root@localhost testdir]# jobs
[1]-  Stopped                 vim test.
[2]+  Stopped                 ./test.sh
[3]   Running                 ./test.sh > test.out &
```

- `jobs` **常用命令选项**：

| 选项 | 描述                                            |
| :--: | :---------------------------------------------- |
| `-l` | 列出进程的 PID 以及作业号。                     |
| `-n` | 只列出上次 shell 发出通知后状态发生改变的作业。 |
| `-p` | 只列出作业的 PID。                              |
| `-r` | 只列出运行中的作业。                            |
| `-s` | 只列出已停止的作业。                            |

### 重启已停止的作业

> 在 bash 作业控制中，可以将**已停止的**作业作为**后台**进程或**前台**进程**重启**。

- **前台进程**会**接管当前使用的终端**，因此在使用该特性时**要小心**。
- 要以**后台模式**重启作业，可以使用 `bg` 命令：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
sleep 1800

# 2.执行脚本。（使用 Ctrl+Z 组合键停止脚本。）
[root@localhost testdir]# ./test.sh 
^Z
[1]+  Stopped                 ./test.sh

# 3.使用 bg 命令就可以将其以后台模式重启。
# 注意，当作业被转入后台模式时，并不会显示其 PID。
[root@localhost testdir]# bg
[1]+ ./test.sh &

# 4.状态变为Running，重启成功。
[root@localhost testdir]# jobs
[1]+  Running                 ./test.sh &
```

- 如果**存在多个作业**，则需要在 `bg` 命令后**加上作业号**，以便于控制：

```shell
# 1.查看当前作业。
[root@localhost testdir]# jobs
[root@localhost testdir]# 

# 2.执行脚本。（使用 Ctrl+Z 组合键停止脚本。）
[root@localhost testdir]# ./test.sh 
^Z
[1]+  Stopped                 ./test.sh
[root@localhost testdir]# 

# 3.执行脚本。（使用 Ctrl+Z 组合键停止脚本。）
[root@localhost testdir]# ./test.sh 
^Z
[2]+  Stopped                 ./test.sh
[root@localhost testdir]# 

# 4.bg 2 命令用于将第二个作业置于后台模式。
[root@localhost testdir]# bg 2
[2]+ ./test.sh &

# 5.当使用 jobs 命令时，它列出了作业及其状态，即便默认作业当前并未处于后台模式。
[root@localhost testdir]# jobs
[1]+  Stopped                 ./test.sh
[2]-  Running                 ./test.sh &
```

- 要以**前台模式**重启作业，可以使用带有作业号的 `fg` 命令：

```shell
# 1.查看当前作业。
[root@localhost testdir]# jobs
[1]+  Stopped                 ./test.sh
[2]-  Running                 ./test.sh &

# 2.将第二个作业置于前台模式。
[root@localhost testdir]# fg 2
./test.sh
^C
[root@localhost testdir]# 
```

## 调整谦让度

> 在多任务操作系统（比如 Linux）中，内核负责为每个运行的进程分配 CPU 时间。

- **调度优先级**［也称为**谦让度**（ *nice value* ）］是指内**核为进程分配的** **CPU** **时间**（相对于其他进程）。
- 在 Linux 系统中，由 shell 启动的所有进程的调度优先级**默认都是相同的**。
- 调度优先级是一个**整数值**，取值范围从-20（**最高**优先级）到+19（**最低**优先级）。
- 在**默认情况下**，bash shell 以**优先级** **0** 来启动所有进程。

### nice 命令

> `nice` 命令允许在**启动命令**时设置其调度**优先级**。

- `nice` 命令的 -n 选项指定**新的优先级**：

```shell
# 1.指定优先级为10。
[root@localhost testdir]# nice -n 10 ./test.sh > test.out &
[2] 15884

# 2.谦让度（NI列）已经调整到了 10。
[root@localhost testdir]# ps -p 15884 -o pid,ppid,ni,cmd
  PID  PPID  NI CMD
15884 32284  10 /bin/bash ./test.sh
```

- **提示**：

  - `nice` 命令**只有** **root** **用户**或者**特权用户**才能**提高**作业的**优先级**。
  - 即便**提高**其优先级的操作**没有成功**，指定的**命令依然可以运行**。

### renice 命令

> 有时候，你想修改系统中**已运行命令**的**优先级**。

- `renice` 命令，通过**指定**运行进程的 **PID** 来**改变其优先级**：

```shell
# 1.启动。
[root@localhost testdir]# ./test.sh > test.out &
[1] 27793

# 2.查看当前运行中的进程谦让度（NI列）。
[root@localhost testdir]# ps -p 27793 -o pid,ppid,ni,cmd
  PID  PPID  NI CMD
27793 32284   0 /bin/bash ./test.sh

# 3.修改谦让度。
[root@localhost testdir]# renice -n 10 -p 27793
27793 (process ID) old priority 0, new priority 10

# 4.谦让度（NI列）已经调整到了 10。
[root@localhost testdir]# ps -p 27793 -o pid,ppid,ni,cmd
  PID  PPID  NI CMD
27793 32284  10 /bin/bash ./test.sh
[root@localhost testdir]# 
```

- 和 `nice` 命令一样，`renice` 命令**对于非特权用户也有一些限制**：只能对**属主为自己的进程**使用 `renice` 且**只能降低调度优先级**。
- **root** **用户**和**特权用户**可以使用 `renice` 命令对任意进程的**优先级做任意调整**。

## 定时运行作业

> 在使用脚本时，你也许希望脚本能在以后某个你无法亲临现场的时候运行。

### 使用 at 命令调度作业

> `at` 命令允许指定 Linux 系统何时运行脚本。

- `at` 的守护进程 `atd` 在后台运行，在作业队列中**检查待运行的作业**。
- `atd` 守护进程会检查系统的一个特殊目录（ 通常位于 `/var/spool/at` 或 `/var/spool/cron/atjobs` ），从中获取 `at` 命令提交的作业。
- 在**默认情况下**，`atd` 守护进程每隔 **60** **秒**检查一次这个目录。
- 如果其中有作业，那么 `atd` 守护进程就会查看此作业的运行时间。
- 如果**时间跟当前时间一致**，**就运行**此作业。

------

#### at 命令的格式

```shell
# 在默认情况下，at 命令会将 STDIN 的输入放入队列。

# 用 -f 选项指定用于从中读取命令（脚本文件）的文件名。

# time 选项指定了你希望何时运行该作业。

# 如果指定的时间已经过去，那么 at 命令会在第二天的同一时刻运行指定的作业。

at [-f filename] time
```

- `at` 命令能识别**多种时间格式**：

  - 标准的**小时和分钟**：比如 10:15。
  - **AM/PM** 指示符：比如 10:15 PM。
  - 特定的**时间名称**：比如 now、noon、midnight 或者 teatime（4:00 p.m.）。
  - **标准日期**：比如 MMDDYY、MM/DD/YY 或 DD.MM.YY。
  - **文本日期**：比如 Jul 4 或 Dec 25，加不加年份均可。
  - **时间增量**：比如：Now + 25 minutes ；10:15 PM tomorrow；10:15 + 7 days 。

- 针对不同优先级，有 52 种作业队列。

- 作业队列通常用小写字母 a~z 和大写字母 A~Z 来指代，A 队列和 a 队列是两个不同的队列。

- 作业队列的**字母排序越高**，此队列中的作业运行**优先级就越低**（谦让度更大）。

- 在**默认情况下**，`at` 命令提交的作业会被放入 **a** **队列**。

- 如果想以较低的优先级运行作业，可以用 **-q** 选项**指定其他的队列**。

- 如果相较于其他进程你希望你的作业**尽可能少地占用** **CPU**，可以将其放入 **z** **队列**。

------

#### 获取作业的输出

- 当在 Linux 系统中运行 `at` 命令时，显示器并**不会关联**到该作业。
- Linux 系统反而会将提交该作业的**用户** **email** 地址作为 STDOUT 和 STDERR。
- 任何送往 STDOUT 或 STDERR 的输出**都会通过邮件系统**传给该用户。
- **使用 email** ：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
echo "hello!"
sleep 5
echo "This is the script's end."
#
exit

# 2.at 命令会显示分配给作业的作业号以及为作业安排的运行时间。（now 指示 at 命令立刻执行该脚本。）
[root@localhost testdir]# at -f test.sh now
job 2 at Wed Jun 21 17:34:00 2023
```

- `at` 命令通过 sendmail 应用程序发送 email。
- **如果**系统中**没有安装** sendmail，那就**无法获得任何输出**。
- **因此**在使用 `at` 命令时，**最好**在**脚本中**对 STDOUT 和 STDERR 进行**重定向**：

```shell
# 1.脚本内容。
[root@localhost testdir]# cat test.sh 
#!/bin/bash
#
outfile=test.out
exec 3>$outfile
#
echo "hello!" >&3
echo "This is the script's end." >&3
#
exit

# 2.执行at命令。
[root@localhost testdir]# at -f test.sh now
job 6 at Wed Jun 21 17:44:00 2023

# 3.查看重定向输出。
[root@localhost testdir]# cat test.out 
hello!
This is the script's end.
```

------

#### 6.1.3 列出等待的作业

- `atq` 命令可以查看系统中有**哪些作业在等待**：

```shell
# 1.启动三个不同时间点执行的作业。
[root@localhost testdir]# at -f test.sh tomorrow
job 10 at Thu Jun 22 17:54:00 2023
[root@localhost testdir]# at -f test.sh 20:30
job 11 at Wed Jun 21 20:30:00 2023
[root@localhost testdir]# at -f test.sh now+1hour
job 12 at Wed Jun 21 18:54:00 2023
[root@localhost testdir]# 

# 2.查看哪些作业在等待。
[root@localhost testdir]# atq
11 Wed Jun 21 20:30:00 2023 a root
10 Thu Jun 22 17:54:00 2023 a root
12 Wed Jun 21 18:54:00 2023 a root
```

- 作业列表中显示了**作业号**、系统**运行该作业的日期和时间**，以及该作业**所在的作业队列**。

------

#### 6.1.4 删除作业

- 可以用 `atrm` 命令**删除等待中的**作业。
- **应用示例**：

```shell
# 1.查看当前等待中的作业。
[root@localhost testdir]# atq
11 Wed Jun 21 20:30:00 2023 a root
10 Thu Jun 22 17:54:00 2023 a root
12 Wed Jun 21 18:54:00 2023 a root

# 2.通过作业号进行移除。
[root@localhost testdir]# atrm 11
[root@localhost testdir]# 

# 3.剩下的等待作业。
[root@localhost testdir]# atq
10 Thu Jun 22 17:54:00 2023 a root
12 Wed Jun 21 18:54:00 2023 a root
[root@localhost testdir]# 
```

- **提示**：**只能删除自己提交的作业**，不能删除其他人的。

------

### 调度需要定期运行的脚本

> 如果需要脚本在每天、每周或每月的同一时间运行。这时候**与其频繁使用** `at` 命令，不如利用 Linux 系统的**另一个特性**。

- Linux 系统使用 **cron** 程序调度需要**定期执行**的作业。
- `cron` 在**后台运行**，并会**检查**一个特殊的表（**cron** **时间表**），从中获知已安排执行的作业。

------

#### `cron` 时间表

- `cron` 时间表通过一种**特别的格式**指定作业何时运行：

```shell
minutepasthour hourofday dayofmonth month dayofweek command
```

- `cron` 时间表允许使用**特定值**、**取值范围**（比如 1~5）或者**通配符**（星号）来指定各个字段。
- 如果想在**每天的** **10:15** 运行一个命令，可以使用如下 `cron` 时间表字段：

```shell
# dayofmonth、month 以及 dayofweek 字段中的通配符表明，cron 会在每天 10:15 执行该命令。
15 10 * * * command
```

- 要指定一条在**每周一的下午** **4:15**（4:15 p.m.）执行的命令，可以使用**军事时间**（1:00 p.m.是 13:00，2:00 p.m.是 14:00，3:00 p.m.是 15:00，以此类推），如下所示：

```shell
15 16 * * 1 command
```

- 可以使用三字符的文本值（mon、tue、wed、thu、fri、sat、sun）或数值（0 或 7 代表周日，6 代表周六）来指定 `dayofweek` 字段。
- 要想在**每月第一天的中午** **12** **点**执行命令，可以使用下列字段：

```shell
00 12 1 * * command
```

- 因为无法设置一个 `dayofmonth` 值，涵盖所有**月份的最后一天**。常用的解决方法是**加一个** **if-then** 语句，在其中使用 `date` 命令**检查明天的日期是不是某个月份的第一天**（01）：

```shell
# 这行脚本会在每天中午 12 点检查当天是不是当月的最后一天（28~31），如果是，就由cron 执行 command。
00 12 28-31 * *
if [ "$(date +%d -d tomorrow)" = 01 ]; then
    command
fi
```

- 命令列表**必须指定**要运行的**命令**或**脚本的完整路径**。
- 你**可以**像在命令行中那样，**添加所需的任何选项**和**重定向符**：

```shell
15 10 * * * /home/christine/backup.sh > backup.out
```

- **提示**：`cron` 程序会以**提交作业的用户**身份**运行**该脚本，因此你**必须有**访问该脚本（或命令）以及输出文件的**合理权限**。

------

#### 构建 `cron` 时间表

> Linux 提供了 `crontab` 命令来处理 `cron` 时间表。

- **列出**已有的 `cron` 时间表：

```shell
[root@localhost ~]# crontab -l
```

- 在**默认情况下**，用户的 `cron` 时间表**文件并不存在**。
- 可以使用 **-e** 选项向 `cron` 时间表**添加字段**。

------

#### 浏览`cron` 目录

- 如果创建的脚本对于执行时间的**精确性要求不高**，则用**预配置的** `cron` 脚本目录会更方便。
- 预配置的**基础目录共有** **4** **个**：hourly、daily、monthly 和 weekly：

```shell
# 1.列出预配置目录。（如果你的脚本需要每天运行一次，那么将脚本复制到 daily 目录，cron 就会每天运行它。）
[root@localhost ~]# ls /etc/cron.*ly
/etc/cron.daily:
logrotate  man-db.cron  mlocate

/etc/cron.hourly:
0anacron

/etc/cron.monthly:

/etc/cron.weekly:
[root@localhost ~]# 
```

------

#### `anacron` 程序

> `cron` 程序**唯一的问题**是它**假定** Linux **系统**是 **7×24** **小时运行**的。除非你的 Linux 运行在服务器环境，否则这种假设未必成立。

- 如果某个作业在 `cron` 时间表中设置的**运行时间已到**，但这时候 Linux **系统处于关闭状态**，那么该作业就**不会运行**。
- 当**再次启动**系统时，`cron` 程序**不会**再去**运行**那些**错过的作业**。
- **`anacron`** 判断出某个作业**错过了**设置的运行时间，它会**尽快运行**该作业。（如果 Linux 系统关闭了几天，等到再次启动时，原计划在关机期间运行的作业会自动运行。）
- 有了 `anacron`，就能确保作业**一定能运行**，这正是通常使用 `anacron` 代替 `cron` 调度作业的原因。
- `anacron` 程序**只处理位于** `cron` **目录的程序**。
- 它通过**时间戳**来判断作业是否在正确的计划间隔内运行了。
- 每个 `cron` 目录都有一个时间戳文件，该文件位于 `/var/spool/anacron` ：

```shell
# 1.列出anacron下的文件。
[root@localhost ~]# ls /var/spool/anacron/
cron.daily  cron.monthly  cron.weekly

# 2.查看cron.daily文件内容。
[root@localhost ~]# cat /var/spool/anacron/cron.daily 
20230622
[root@localhost ~]# 

# 3.anacron 程序使用自己的时间表（通常位于/etc/anacrontab）来检查作业目录。
[root@localhost ~]# cat /etc/anacrontab 
# /etc/anacrontab: configuration file for anacron

# See anacron(8) and anacrontab(5) for details.

SHELL=/bin/sh
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
# the maximal random delay added to the base delay of the jobs
RANDOM_DELAY=45
# the jobs will be started during the following hours only
START_HOURS_RANGE=3-22

#period in days   delay in minutes   job-identifier   command
1 5 cron.daily  nice run-parts /etc/cron.daily
7 25 cron.weekly  nice run-parts /etc/cron.weekly
@monthly 45 cron.monthly  nice run-parts /etc/cron.monthly
[root@localhost ~]# 
```

- anacron 时间表的**基本格式**和 cron 时间表**略有不同**：

```shell
# period 字段定义了作业的运行频率（以天为单位）

# delay 字段指定了在系统启动后，anacron 程序需要等待多少分钟再开始运行错过的脚本。

# identifier 字段是一个独特的非空字符串，比如 cron.weekly。它唯一的作用是标识出现在日志消息和错误 email 中的作业。

# command 字段包含了 run-parts 程序和一个 cron 脚本目录名。run-parts 程序负责运行指定目录中的所有脚本。

period delay identifier command
```

------

## 使用新 shell 启动脚本

> 如果每次用户**启动新的** **bash** **shell** 时**都能运行**相关的脚本（哪怕是特定用户启动的 bash shell），那将会非常方便。

- 当用户登录 bash shell 时要运行的**启动文件**，如下（基本上，以下所列文件中的**第一个**文件会被**运行**，**其余**的则会**被忽略**）：

  - `$HOME/.bash_profile`
  - `$HOME/.bash_login`
  - `$HOME/.profile`

- 因此，应该将需要在登录时运行的**脚本放在上述第一个文件中**。

- 每次**启动新** **shell**，bash shell **都会运行** **.bashrc** **文件**，对此我们可以**验证**：

```shell
# 1.对.bashrc文件加入一条echo语句。
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
echo "I'm in a new shell!"
[root@localhost ~]# 

# 2.启动一个新 shell。
[root@localhost ~]# bash
I'm in a new shell!
[root@localhost ~]# 

# 3.验证完成后退出。
[root@localhost ~]# exit
exit
[root@localhost ~]# 
```
