# WOL唤醒脚本

## WOL开机启动脚本

::: tip
Linux系统需要支持`wakeonlan`命令，启动成功仅代表机器网络联通。不代表SSH可以正常链接。因为目标服务器加载启动项需要时间。
:::

```sh
#!/bin/bash

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

check_command() {
    command -v "$1" >/dev/null
    if [ $? -ne 0 ]; then
        LOG_ERROR "未找到命令, 请安装 $1 后再试."
        exit 1
    fi
}

check_server_start() {
    local server_ip=$1
    local date=$(date +"%Y-%m-%d %H:%M:%S")
    # 获取开始时间
    local start_time=$(date +%s.%N)
    # 等待标志
    local spin='-\|/'
    local i=0

    is_online=""

    while [ -z "$is_online" ]; do
        # 输出
        i=$(((i + 1) % 4))
        printf "\r\033[32m$date [INFO] server: $server_ip 正在启动 [${spin:$i:1}]"

        is_online=$(ping -c 1 -w 2 $server_ip 2>&1 | grep "1 received")

        # 两秒请求一次
        sleep 2
    done

    # 获取结束时间
    local end_time=$(date +%s.%N)
    # 计算花费时间
    local execution_time=$(echo "$end_time - $start_time" | bc -l)
    # 保留一位小数
    local execution_time=$(echo "$execution_time" | cut -c 1-5)
    echo -e "\r"
    LOG_INFO "server: $server_ip 启动成功, 启动时间: $execution_time 秒"
}

SERVER_IP=("192.168.100.100" "192.168.100.101" "192.168.100.102")
SERVER_MAC=("ff:ff:ff:ff:ff:ff" "ff:ff:ff:ff:ff:ff" "ff:ff:ff:ff:ff:ff")

echo "(0): ${SERVER_IP[0]}"
echo "(1): ${SERVER_IP[1]}"
echo "(2): ${SERVER_IP[2]}"
read -p "请输入需要唤醒的机器编号：" SERVER_ID

if [ -z "$SERVER_ID" ]; then
    LOG_ERROR "机器编号不能为空!"
    exit 1
fi

TARGET_SERVER_IP=${SERVER_IP[$SERVER_ID]}
TARGET_SERVER_MAC=${SERVER_MAC[$SERVER_ID]}

if [ -z "$TARGET_SERVER_IP" ]; then
    LOG_ERROR "请输入正确的机器编号!"
    exit 1
fi

# 检查wakeonlan是否安装
check_command wakeonlan

# 发送魔术包，唤醒机器
wakeonlan $TARGET_SERVER_MAC

# 检查系统启动
check_server_start $TARGET_SERVER_IP
```
