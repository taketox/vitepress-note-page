# 应用示例

## 目录/路径获取

- 获取脚本所在文件夹的绝对路径

```sh
#!/bin/bash
SHELL_FOLDER=$(cd $(dirname $0);pwd)

# 输出
/home/taketo/shell-test
```

- 获取当前文件夹的名称

```sh
#!/bin/bash
CURDIRNAME=${PWD##*/}

# 执行
taketo@ubuntu:~$ bash shell-test/test.sh
# 输出
taketo
```

- 获取脚本所在文件夹的名称

```sh
#!/bin/bash
SHELL_FOLDER=$(cd $(dirname $0);pwd)
CURDIRNAME=${SHELL_FOLDER##*/}

# 执行
taketo@ubuntu:~$ bash shell-test/test.sh
# 输出
shell-test
```

- 获取脚本所在目录所有文件夹名称

```sh
#!/bin/bash
SHELL_FOLDER=$(cd $(dirname $0);pwd)

DIRS=($(ls -l ${SHELL_FOLDER} | awk '/^d/ {print $NF}'))

for DIRECTORY in ${DIRS[*]}; do
    echo $DIRECTORY
done

# 执行
taketo@ubuntu:~/shell-test$ bash test.sh 
# 输出
dir1
dir2
```

## Shell中命令执行

- 启动程序，保存pid到文件

```sh
#!/bin/bash  
./my_program > output.log &  
pid=$!  
echo $pid > pid.txt
```

- 关闭程序，删除pid文件

```sh
if [ -f "pid.txt" ]; then
    pid=$(cat "pid.txt")
    echo $pid
    kill $pid
    rm -r "pid.txt"
    echo -ne "Stoping Node"
    while true; do
        [ ! -d "/proc/$pid/fd" ] && break
        echo -ne "."
        sleep 1
    done
    echo -ne "\rStopped. \n"
fi
```

- 调用子脚本(子脚本中包含read -p)

  - 父脚本

  ```shell
  #!/bin/bash  
    
  # 定义要运行的子脚本路径
  child_script="/path/to/child_script.sh"  
    
  # expect 工具运行子脚本并传递输入
  # 使用 spawn 命令启动子脚本
  # 使用 expect 命令等待子脚本的特定输出
  # 使用 send 命令将输入发送给子脚本，\n 模拟回车
  # 使用 expect 命令eof 等待子脚本完成
  expect <<EOF
  spawn "$child_script"
  expect "Enter your name: "
  send "Take To\n"
  expect eof
  EOF
  
  # 输出结果  
  echo "Hello, Take To!"
  ```

  - 子脚本

  ```shell
  #!/bin/bash  
    
  read -p "Enter your name: " name  
  echo "Hello, $name!"
  ```

## 检查

- 检查命令是否存在

```sh
check_command(){
    command -v "$1" >/dev/null
    if [ $? -ne 0 ]; then  
        echo "Command not found, please install $1 command and try again."  
        exit 1  
    fi  
}

# 使用
check_command Command
```

- 检查命令执行是否成功

```sh
check_succeed(){
    # 执行命令并获取其返回值
    eval "$1"
    # 根据返回值判断执行结果
    if [ $? -eq 0 ]; then
        return 0
    else
        echo "Command $1 Execution failed"
        exit 1
    fi
}

# 使用
check_succeed Command
```

- 失败重试

```sh
retry_command() {
    for i in {1..3}; do
        eval "$1"
        if [ $? -eq 0 ]; then
            return 0
        else
            echo "Command $1 Execution failed"
            echo "retrying $i ..."
            sleep 1
        fi
    done
    
    echo "Command execution failed, retry failed !"
    exit 1
}

# 使用
retry_command Command
```

## 获取信息

- 获取系统信息

```sh
cat /etc/os-release | grep -oE "(CentOS|Ubuntu|Debian|Alpine)" | head -1
```

- 获取系统信息和版本信息

```sh
cat /etc/os-release | grep -oE "(CentOS|Ubuntu|Debian|Alpine).*[^\"]"|sort | head -1
```

- 获取系统类型

```sh
get_os_type() {
    if [ "$(uname)" == "Darwin" ]; then
      echo "this is Mac"
    elif [ "$(uname)" == "Linux" ];then
      echo "this is Linux"
    else
      echo "unknown"
    fi
}
```

- 获取系统架构

```sh
get_arch() {
    local arch=`arch`
    if [[ $arch =~ "x86_64" ]];then
        echo "this is x86_64"
    elif [[ $arch =~ "aarch64" ]];then
        echo "this is arm64"
    elif [[ $arch =~ "mips64" ]];then
        echo "this is mips64"
    else
        echo "unknown"
    fi
}
```

## 日志/打印

- 日志输出

```sh
LOG_INFO() {
    local content=${1}
    local date=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "\033[32m$date [INFO] ${content}\033[0m"
}

LOG_ERROR() {
    local content=${1}
    local date=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "\033[31m$date [ERROR] ${content}\033[0m"
}

# 使用
LOG_INFO Content

LOG_ERROR Content
```

## 定时任务

- 定时执行脚本

在 Unix 和类 Unix 系统中，定时任务通常使用 cron 实现。Cron 是一个时间基础的任务调度器，可以定期执行脚本或命令。
下面是如何在 Unix 或类 Unix 系统中设置定时任务的步骤：

```sh
# 确认cron服务开启
systemctl status cron

# 输入 crontab -e 命令来编辑 cron 文件。

# 在编辑器中，你可以添加你的定时任务。Cron 文件的格式如下：
*     *     *   *    *        command to be executed  
-     -     -   -    -  
|     |     |   |    |  
|     |     |   |    +----- day of the week (0 - 6) (Sunday=0)  
|     |     |   +------- month (1 - 12)  
|     |     +--------- day of the month (1 - 31)  
|     +----------- hour (0 - 23)  
+------------- min (0 - 59)

# 在你编辑完成后，保存并退出编辑器。这将自动创建或更新你的 cron 文件。

# 要查看你的 cron 任务列表，可以输入 crontab -l。
```

::: tip
输入 crontab -e 命令来编辑 cron 文件

如果这是你第一次运行这个命令，它可能会问你选择一个编辑器（比如 vim，nano 等）。

如果后面想更改编辑器（比如 vim），可以添加环境变量实现。

```sh
export EDITOR=/usr/bin/vim
```
:::

## 等待状态显示

- 处于"/"旋转

```sh
#!/bin/sh
sleep 10 &
pid=$! # Process Id of the previous running command

spin='-\|/'

i=0
while kill -0 $pid 2>/dev/null; do
    i=$(((i + 1) % 4))
    printf "\r[${spin:$i:1}]"
    sleep .1
done
```

- 进度条前进状态

```sh
#!/bin/sh
j=''
for ((i=0;$i<=100;i+=2))
do
    printf "progress:[%-50s]%d%%\r" $j $i
    sleep 0.1
    j=#$j
done
echo
```

- 进度条前进+处于"/"旋转

```sh
#!/bin/bash
i=0
j='#'
k=('|' '\' '-' '/')
l=0
while [ $i -le 25 ]; do
    printf "progress:[%-25s][%d%%][%c]\r" $j $(($i * 4)) ${k[$l]}
    j+='#'
    let i++
    let l=i%4
    sleep 0.1
done
printf "\n"
```
