# SoftEther + Frp

## 概览

### 介绍

[SoftEtherVPN (opens new window)](https://www.softether.org/)是开源跨平台，多重协议的虚拟专用网方案，是openvpn最佳替代方案，比openvpn要快，其L2TP VPN与windows、mac、ios和android高度兼容。SoftEtherVPN本身还具有ssl-vpn协议，可以穿透任何类型的防火墙。

[Frp](https://gofrp.org/) 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议，且支持 P2P 通信。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。

### 原理

SoftEtherVPN创建VPN服务，通过frp做端口映射，实现内网穿透。

## 环境依赖

| 名称       | 环境                  | 版本                       | 备注                   |
| ---------- | --------------------- | -------------------------- | ---------------------- |
| 内网服务器 | Ubuntu                | 20.04                      | 局域网服务器           |
| 外网服务器 | Ubuntu                | 20.04                      | 阿里云服务器（公网IP） |
| 服务端     | SoftEther VPN Server  | Ver 4.39, Build 9772, beta |                        |
| 管理端     | SoftEther VPN Manager | Ver 4.39, Build 9772, beta | 配置SoftEther VPN界面  |
| 访问终端   | Windows               | 11                         | Windows自带VPN         |

## 环境搭建

1. 在内网服务器安装SoftEtherVPN并配置隧道拆分

    具体步骤可以参考

    [SoftEtherVPN 安装及配置](/linux/nat/softether/)

    [SoftEtherVPN 隧道拆分](/linux/nat/softetherroute/)

    > 不配置隧道拆分会导致终端访问的所有流量都经过外网服务器转发，从而导致外网服务器压力过大

2. 在内网服务器和外网服务器上安装Frp服务端和客户端

    具体步骤可以参考

    [Frp 安装及配置](/linux/nat/frp/)

    服务端配置文件

    ```ini
    [common]
    bind_port = 7000
    token = ************************
    ```

    客户端配置文件

    ```ini
    [common]
    server_addr = #公网ip
    server_port = 7000
    token = ************************

    [udp500]
    type = udp
    remote_port = 500
    local_ip = 127.0.0.1
    local_port = 500
    use_encryption = true
    use_compression = true

    [udp4500]
    type = udp
    remote_port = 4500
    local_ip = 127.0.0.1
    local_port = 4500
    use_encryption = true
    use_compression = true
    ```

    > 需要开放服务器防火墙7000，500，4500端口，阿里云防火墙7000，500，4500端口（出入规则都需要开放）
