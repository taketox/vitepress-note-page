# 网页GM搭建

## 获取源码

```sh
git clone https://gitee.com/take_to/dnf-console.git
```

## 配置修改

在 `dist/config` 中`server.json` 配置项:

更改 DNF 服务器 IP地址

- 将 `host` 改为 `dnf服务器IP`（允许数据库连接得上）

```json
{
  "api": {
    "cors": true
  },
  "auth": {
    "realm": "test zone",
    "secret": "f450a7bdbde3416d22474b9fdc2a3636",
    "id_key": "username",
    "timeout": 43200,
    "max_refresh": 3600
  },
  "game_db": {
    "enable": true,
    "mysql": [
      {
        "key": "d_taiwan",
        "user": "game",
        "password": "123456",
        "host": "10.0.0.111",
        "port": 3306,
        "db": "d_taiwan",
        "charset": "utf8",
        "timeout": 5,
        "multi_statements": false,
        "debug": false
      },
      {
        "key": "taiwan_cain",
        "user": "game",
        "password": "123456",
        "host": "10.0.0.111",
        "port": 3306,
        "db": "taiwan_cain",
        "charset": "utf8",
        "timeout": 5,
        "multi_statements": false,
        "debug": false
      },
      {
        "key": "taiwan_cain_2nd",
        "user": "game",
        "password": "123456",
        "host": "10.0.0.111",
        "port": 3306,
        "db": "taiwan_cain_2nd",
        "charset": "utf8",
        "timeout": 5,
        "multi_statements": false,
        "debug": false
      },
      {
        "key": "taiwan_billing",
        "user": "game",
        "password": "123456",
        "host": "10.0.0.111",
        "port": 3306,
        "db": "taiwan_billing",
        "charset": "utf8",
        "timeout": 5,
        "multi_statements": false,
        "debug": false
      },
      {
        "key": "taiwan_login",
        "user": "game",
        "password": "123456",
        "host": "10.0.0.111",
        "port": 3306,
        "db": "taiwan_login",
        "charset": "utf8",
        "timeout": 5,
        "multi_statements": false,
        "debug": false
      }
    ]
  },
  "service": {
    "pid_file": "console.pid",
    "daemon_log": "daemon.log"
  }
}
```

## 启动步骤

### windows

第一次运行：

```sh
main.exe -i  #初始化数据,只需要执行一次，后续只需要启停

// 输出
start
stop
success: sync db schema
```

后续：

```sh
main.exe -x #debug 程序跑，小白这样跑就行了

#### 下面 比较复杂，非小白 只需要 -x 就跑起来了
main.exe -k install # windows 安装服务
main.exe -k start # 启动 deamon 服务
main.exe -k stop # 停止 deamon 服务
main.exe -k uninstall # windows 卸妆服务
```

### linux

linux需要自行编译，首先安装go语言

```go
// 构建可执行文件
go build main.go
```

运行

```sh
# 初始化
./main -i

# 启动
./main -k start

# 停止
./main -k stop

# 状态
./main -k status
```

### 配置systemd管理

如Linux服务端上没有安装 `systemd`，可以使用 `yum` 或 `apt` 等命令安装 `systemd`。

```sh
# yum
yum install systemd
# apt
apt install systemd
```

使用文本编辑器，如 `vim` 创建并编辑 `dnf.service` 文件。

```sh
vim /etc/systemd/system/dnf.service
```

写入内容

```ini
# 服务的描述
[Unit]
Description = dnf server
# 服务依赖—在什么服务之后启动，一般为在网络服务启动后启动
After = network.target syslog.target mysql.service
Wants = network.target

[Service]
Type = simple
# 启动命令
ExecStart = /usr/local/dnf/main -p /usr/local/dnf/config/server.json -x

[Install]
WantedBy = multi-user.target
```

使用 `systemd` 命令，管理 dnf

```sh
# 启动frp
systemctl start dnf
# 停止frp
systemctl stop dnf
# 重启frp
systemctl restart dnf
# 查看frp状态
systemctl status dnf
# 开机启动
systemctl enable dnf
```

## 最终效果

打开网页，访问地址：http://10.0.0.111:8088（注：确保你的端口未被占用）

默认登录：

用户名：admin 密码：123

登录页

![An image](/img/linux/nas/003.png)

首页

![An image](/img/linux/nas/004.png)
