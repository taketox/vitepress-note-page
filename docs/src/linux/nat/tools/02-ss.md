# Shadowsocks

## 什么是shadowsocks？

[ShadowSocks](https://github.com/shadowsocks/shadowsocks-windows) 是由@clowwindy 所开发的一个开源 Socks5 代理。如其官网所言 ，它是 “Asecure socks5 proxy， designed to protect your Internet traffic” （一个安全的 Socks5 代理）。用于搭建私密网络连接。

同时对比其他的VPN搭建技术，影梭(shadowsocks)有着代码开源。客户端配置简单。(配置时只需要填写 IP /域名、端口号，密码，然后选择加密方式即可)。客户端绿色小巧。(Windows 版本的客户端只有 200 多 k，免安装，解压即可使用。)等等诸多优点.

## 什么是socks5协议？

SOCKS5 是一个代理协议，它在使用TCP/IP协议通讯的前端机器和服务器机器之间扮演一个中介角色，使得内部网中的前端机器变得能够访问Internet网中的服务器，或者使通讯更加安全。

### 协议流程

从流程上来说，SOCKS5  是一个C/S 交互的协议，交互大概分为这么几步：

1. 客户端发送认证协商

2. 代理服务器就认证协商进行回复（如拒绝则本次会话结束）

   1. 如需GSSAPI或用户名/密码认证，客户端发送认证信息
   2. 代理服务器就对应项进行鉴权，并进行回复或拒绝

3. 客户端发送希望连接的目标信息

4. 代理服务器就连接信息进行确认或拒绝

5. 【非协议内容】：代理服务器连接目标并 pipe 到客户端

## 环境依赖

| 名称               | 环境                | 版本      | 备注 |
| ------------------ | ------------------- | --------- | ---- |
| 操作系统（服务端） | Ubuntu              | 20.04     |      |
| 服务端             | shadowsocks-server  | 2.8.2     |      |
| 客户端             | shadowsocks-windows | 4.3.3.170 |      |

## 环境搭建

### 安装依赖

```sh
# 安装pip3
sudo apt install python3-pip
# pip3版本
pip3 -V
# pip 20.0.2 from /usr/lib/python3/dist-packages/pip (python 3.8)

# 安装ss
sudo pip3 install shadowsocks
# ss版本
ss -v
#ss utility, iproute2-ss200127
```

### 配置文件

| 配置名称      | 介绍          |
| ------------- | ------------- |
| server        | 服务地址      |
| server_port   | 端口          |
| local_address | 本地地址      |
| local_port    | 本地端口      |
| password      | 密码          |
| timeout       | 等待超时      |
| method        | 加密方式      |
| fast_open     | true 或 false |
| workers       | 工作线程数    |

> fast_open：如果你的服务器 Linux 内核在3.7+，可以开启 fast_open 以降低延迟。
>
> 开启方法： echo 3 > /proc/sys/net/ipv4/tcp_fastopen
>
> 开启之后，将 fast_open 的配置设置为 true 即可

```sh
# 创建配置文件
vim /etc/shadowsocks.json

# 写入配置
{
    "server": "0.0.0.0",
    "server_port": 8989,
    "local_address": "127.0.0.1",
    "local_port": 1080,
    "password": "*******",
    "timeout": 300,
    "method": "aes-256-cfb"
}
```

### 启动

```sh
ssserver -c /etc/shadowsocks.json start
```

### 配置systemd管理

如Linux服务端上没有安装 `systemd`，可以使用 `yum` 或 `apt` 等命令安装 `systemd`。

```sh
# yum
yum install systemd
# apt
apt install systemd
```

使用文本编辑器，如 `vim` 创建并编辑 `frps.service` 文件。

```sh
vim /etc/systemd/system/ssserver.service
```

写入内容

```ini
[Unit]
# 服务名称，可自定义
Description = Shadowsocks server
After = network.target
Wants = network.target

[Service]
Type = simple
User=root
Group=root
ExecStart=/usr/bin/ssserver -c /etc/shadowsocks.json start

[Install]
WantedBy = multi-user.target
```

使用 `systemd` 命令，管理 shadowsocks

```sh
# 启动frp
systemctl start ssserver
# 停止frp
systemctl stop ssserver
# 重启frp
systemctl restart ssserver
# 查看frp状态
systemctl status ssserver
# 开机启动
systemctl enable ssserver
```

## 客户端连接

### 下载客户端

[Releases · shadowsocks/shadowsocks-windows (github.com)](https://github.com/shadowsocks/shadowsocks-windows/releases)

### 连接客户端

![An image](/img/linux/nat/20.png)

## 问题解决

### 不支持aes-256-gcm加密方式

问题

```sh
# 启动失败，报错aes-256-gcm not supported
ssserver -c ./config.json  start
INFO: loading config from ./config.json
2023-10-07 18:01:16 ERROR    method aes-256-gcm not supported
```

解决方案

```sh
# 安装完成后，重新启动
pip install https://github.com/shadowsocks/shadowsocks/archive/master.zip -U
```
