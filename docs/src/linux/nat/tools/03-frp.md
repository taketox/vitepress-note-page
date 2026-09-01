# Frp

## 介绍

### frp 是什么？

frp 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议，且支持 P2P 通信。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。

### 为什么使用 frp？

通过在具有公网 IP 的节点上部署 frp 服务端，可以轻松地将内网服务穿透到公网，同时提供诸多专业的功能特性，这包括：

- 客户端服务端通信支持 TCP、QUIC、KCP 以及 Websocket 等多种协议。
- 采用 TCP 连接流式复用，在单个连接间承载更多请求，节省连接建立时间，降低请求延迟。
- 代理组间的负载均衡。
- 端口复用，多个服务通过同一个服务端端口暴露。
- 支持 P2P 通信，流量不经过服务器中转，充分利用带宽资源。
- 多个原生支持的客户端插件（静态文件查看，HTTPS/HTTP 协议转换，HTTP、SOCK5 代理等），便于独立使用 frp 客户端完成某些工作。
- 高度扩展性的服务端插件系统，易于结合自身需求进行功能扩展。
- 服务端和客户端 UI 页面。

## 安装

### 下载安装包

```sh
wget https://github.com/fatedier/frp/releases/download/v0.51.3/frp_0.51.3_linux_amd64.tar.gz
```

### 启动

```sh
# 先启动服务端
./frps -c ./frps.ini

# 启动客户端
./frpc -c ./frpc.ini
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
vim /etc/systemd/system/frps.service
```

写入内容

```ini
[Unit]
# 服务名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frps的命令，需修改为您的frps的安装路径
ExecStart = /path/to/frps -c /path/to/frps.ini

[Install]
WantedBy = multi-user.target
```

使用 `systemd` 命令，管理 frps

```sh
# 启动frp
systemctl start frps
# 停止frp
systemctl stop frps
# 重启frp
systemctl restart frps
# 查看frp状态
systemctl status frps
# 开机启动
systemctl enable frps
```

## 配置详解

### 服务端配置

| 参数                 | 类型   | 说明                               | 默认值 | 可选值 | 备注                               |
| -------------------- | ------ | ---------------------------------- | ------ | ------ | ---------------------------------- |
| bind_port            | int    | 服务端监听端口                     | 7000   |        | 接收 frpc 的连接                   |
| token                | string | 鉴权使用的 token 值                |        |        | 客户端需要设置一样的值才能鉴权通过 |
| allow_ports          | string | 允许代理绑定的服务端端口           |        |        | 格式为 1000-2000,2001,3000-4000    |
| max_pool_count       | int    | 最大连接池大小                     | 5      |        |                                    |
| max_ports_per_client | int    | 限制单个客户端最大同时存在的代理数 | 0      |        | 0 表示没有限制                     |
| tls_only             | bool   | 只接受启用了 TLS 的客户端连接      | false  |        |                                    |
| tls_cert_file        | string | TLS 服务端证书文件路径             |        |        |                                    |
| tls_key_file         | string | TLS 服务端密钥文件路径             |        |        |                                    |
| tls_trusted_ca_file  | string | TLS CA 证书路径                    |        |        |                                    |

### 客户端配置

| 参数          | 类型   | 说明                   | 默认值  | 可选值 | 备注                                 |
| :------------ | :----- | :--------------------- | :------ | :----- | :----------------------------------- |
| server_addr   | string | 连接服务端的地址       | 0.0.0.0 |        |                                      |
| server_port   | int    | 连接服务端的端口       | 7       |        |                                      |
| token         | string | 鉴权使用的 token 值    |         |        | 需要和服务端设置一样的值才能鉴权通过 |
| tls_enable    | bool   | 启用 TLS 协议加密连接  | true    |        |                                      |
| tls_cert_file | string | TLS 客户端证书文件路径 |         |        |                                      |
| tls_key_file  | string | TLS 客户端密钥文件路径 |         |        |                                      |

### 代理配置

| 参数            | 类型   | 说明             | 是否必须 | 默认值    | 可选值                                          | 备注                                                         |
| :-------------- | :----- | :--------------- | :------- | :-------- | :---------------------------------------------- | :----------------------------------------------------------- |
| type            | string | 代理类型         | 是       | tcp       | tcp, udp, http, https, stcp, sudp, xtcp, tcpmux |                                                              |
| use_encryption  | bool   | 是否启用加密功能 | 否       | false     |                                                 | 启用后该代理和服务端之间的通信内容都会被加密传输             |
| use_compression | bool   | 是否启用压缩功能 | 否       | false     |                                                 | 启用后该代理和服务端之间的通信内容都会被压缩传输             |
| local_ip        | string | 本地服务 IP      | 是       | 127.0.0.1 |                                                 | 需要被代理的本地服务的 IP 地址，可以为所在 frpc 能访问到的任意 IP 地址 |
| local_port      | int    | 本地服务端口     | 是       |           |                                                 | 配合 local_ip                                                |
| remote_port     | int    | 服务端绑定的端口 | 是       |           |                                                 | 用户访问此端口的请求会被转发到 local_ip:local_port           |

### 其他配置

参考官方文档

[Frp 官方配置文档](https://gofrp.org/docs/reference/server-configures/)

## 通过 SSH 访问内网机器

1. 在具有公网 IP 的机器上部署 frps，修改 frps.ini 文件，这里使用了最简化的配置，设置了 frp 服务器用户接收客户端连接的端口：

    ```ini
    [common]
    bind_port = 7000
    token = #尽可能复杂，需要和客户端保持一致
    ```

2. 在需要被访问的内网机器上（SSH 服务通常监听在 22 端口）部署 frpc，修改 frpc.ini 文件，假设 frps 所在服务器的公网 IP 为 x.x.x.x：

    ```ini
    [common]
    server_addr = x.x.x.x
    server_port = 7000
    token = #尽可能复杂，需要和服务端保持一致

    [ssh]
    type = tcp
    local_ip = 127.0.0.1
    local_port = 22
    remote_port = 6000
    ```

3. `local_ip` 和 `local_port` 配置为本地需要暴露到公网的服务地址和端口。`remote_port` 表示在 frp 服务端监听的端口，访问此端口的流量将会被转发到本地服务对应的端口。
4. 分别启动服务端和客户端
5. 通过 SSH 访问内网机器，假设用户名为 test

```sh
# frp 会将请求 x.x.x.x:6000 的流量转发到内网机器的 22 端口。
ssh -oPort=6000 test@x.x.x.x
```
