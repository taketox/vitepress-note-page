# 基本使用

## 管理实例

### 创建实例

```sh
$ multipass launch
```

这条命令将启动创建一个新实例，实例名称随机。系统版本为，参数为：

### 创建自定义实例

- 查看镜像列表

```sh
$ multipass find
Image                       Aliases           Version          Description
core                        core16            20200818         Ubuntu Core 16
core18                                        20211124         Ubuntu Core 18
core20                                        20230119         Ubuntu Core 20
core22                                        20230119         Ubuntu Core 22
20.04                       focal             20230811         Ubuntu 20.04 LTS
22.04                       jammy,lts         20230814         Ubuntu 22.04 LTS
23.04                       lunar             20230810         Ubuntu 23.04
appliance:adguard-home                        20200812         Ubuntu AdGuard Home Appliance
appliance:mosquitto                           20200812         Ubuntu Mosquitto Appliance
appliance:nextcloud                           20200812         Ubuntu Nextcloud Appliance
appliance:openhab                             20200812         Ubuntu openHAB Home Appliance
appliance:plexmediaserver                     20200812         Ubuntu Plex Media Server Appliance

Blueprint                   Aliases           Version          Description
anbox-cloud-appliance                         latest           Anbox Cloud Appliance
charm-dev                                     latest           A development and testing environment for charmers
docker                                        0.4              A Docker environment with Portainer and related tools
jellyfin                                      latest           Jellyfin is a Free Software Media System that puts you in control of managing and streaming your media.
minikube                                      latest           minikube is local Kubernetes
ros-noetic                                    0.1              A development and testing environment for ROS Noetic.
ros2-humble                                   0.1              A development and testing environment for ROS 2 Humble.
```

- 创建指定镜像的实例

```sh
$ multipass launch 20.04
```

- 创建自定义名称实例

```sh
$ multipass launch 20.04 --name ubuntu
```

- 创建自定义配置实例

```sh
$ multipass launch 20.04 --name ubuntu --cpus 4 --disk 20G --memory 6G
```

> cpu：4核，硬盘：20G，内存8G

- 创建多个网络接口的实例

> Multipass 可以通过该选项启动具有其他网络接口的实例
>
> - `name`— 唯一必需的值，它标识要将实例的设备连接到的主机网络（有关可能的值，请参阅[`网络`](https://multipass.run/docs/networks-command)）
> - `mode`— （默认值）或 ;使用 ，实例将尝试自动网络配置`auto``manual``auto`
> - `mac`— 用于设备的自定义 MAC 地址

```sh
$ multipass launch --network en0 --network name=bridge0,mode=manual

$ multipass exec upbeat-whipsnake -- ip -br address show scope global
```

- 路由

```sh
$ multipass exec upbeat-whipsnake -- ip route
default via 10.0.2.2 dev enp0s3 proto dhcp src 10.0.2.15 metric 100
default via 192.168.1.1 dev enp0s8 proto dhcp src 192.168.1.146 metric 200
10.0.2.0/24 dev enp0s3 proto kernel scope link src 10.0.2.15
10.0.2.2 dev enp0s3 proto dhcp scope link src 10.0.2.15 metric 100
192.168.1.0/24 dev enp0s8 proto kernel scope link src 192.168.1.146
192.168.1.1 dev enp0s8 proto dhcp scope link src 192.168.1.146 metric 200

$ multipass exec upbeat-whipsnake -- ip route get 91.189.88.181
91.189.88.181 via 10.0.2.2 dev enp0s3 src 10.0.2.15 uid 1000
    cache

$ multipass exec upbeat-whipsnake -- ip route get 192.168.1.13
192.168.1.13 dev enp0s8 src 192.168.1.146 uid 1000
    cache
```

- 网桥

在 Linux 上，当尝试将实例网络连接到主机上的以太网设备时，Multipass 将提供创建所需

```sh
$ multipass networks
Name             Type      Description
eth0             ethernet  Ethernet device
lxdbr0           bridge    Network bridge
mpbr0            bridge    Network bridge for Multipass
virbr0           bridge    Network bridge

$ multipass launch --network eth0
Multipass needs to create a bridge to connect to eth0.
This will temporarily disrupt connectivity on that interface.

Do you want to continue (yes/no)?
```

然而，multipass 需要在未安装 ubuntu 服务器的安装上实现此目的，用户仍然可以通过其他方式创建桥并将其传递给 multipass，例如此配置片段通过以下方式实现：

```yaml
network:
  bridges:
    mybridge:
      dhcp4: true
      interfaces:
        - eth0
```

成功后将显示带有命令的新桥，并且实例可以连接到它

```sh
multipass launch --network mybridge
```

- 使用自定义DNS创建实例

在某些情况下，使用系统提供的 DNS 的默认值是不够的。在这种情况下，您可以使用启动命令的选项，或在实例启动后修改网络配置。

要在实例中使用自定义 DNS，您可以使用以下云初始化代码段：

```sh
$ multipass launch --cloud-init systemd-resolved.yaml
```

- netplan.io 方法

实例启动后，您可以修改文件，添加条目：`/etc/netplan/50-cloud-init.yaml`

```yaml
network:
  ethernets:
    ens3:
      dhcp4: true
      match:
        macaddress: 52:54:00:fe:52:ee
     set-name: ens3
     nameservers:
       search: [mydomain]
       addresses: [8.8.8.8]
```

### 修改实例

- 设置实例的CPU、内存和硬盘

> 若要修改此属性之一，请先停止实例

```sh
$ multipass stop ubuntu
$ multipass set local.ubuntu.cpus=4
$ multipass set local.ubuntu.disk=60G
$ multipass set local.ubuntu.memory=7G
```

> 可以使用命令查阅这些属性。实例不必为此停止。

```sh
$ multipass get local.ubuntu.cpus
4
$ multipass get local.ubuntu.disk
60.0GiB
$ multipass get local.ubuntu.memory
7.0GiB
```

### 使用实例

- 打开实例shell命令行

```sh
$ multipass shell ubuntu
```

- 在实例内执行命令

```sh
$ multipass exec ubuntu -- pwd
```

- 启动实例

```sh
$ multipass start ubuntu
```

- 启动多个实例

```sh
$ multipass start ubuntu ubuntu1 ubuntu2
```

- 启动所有实例

```sh
$ multipass start --all
```

- 暂停实例

```sh
$ multipass suspend ubuntu
```

- 暂停多个实例

```sh
$ multipass suspend ubuntu ubuntu1 ubuntu2
```

- 暂停所有实例

```sh
$ multipass suspend --all
```

- 停止实例

```sh
$ multipass stop ubuntu
```

- 停止多个实例

```sh
$ multipass stop ubuntu ubuntu1 ubuntu2
```

- 停止所有实例

```sh
$ multipass stop --all
```

### 使用主实例

Multipass 提供了一个快速的 Ubuntu 实例。当使用`multipass launch`或者点击GUI的`open shell`会自动创建或启动主实例。

- 设置主实例

```sh
multipass set client.primary-name=ubuntu
```

- 进入主实例

```sh
multipass shell
```

- 启动主实例

```sh
multipass start
```

- 暂停主实例

```sh
multipass suspend
```

- 停止主实例

```sh
multipass stop
```

- 重启主实例

```sh
multipass restart
```

### 设置实例命令别名

- 创建别名

```sh
# multipass alias 主机名:命令 别名
$ multipass alias ubunru:ls uls
```

- 查看别名

```sh
$ multipass aliases
```

- 执行别名

```sh
$ multipass aliases uls
```

- 删除别名

```sh
$ multipass unalias uls
```

### 共享数据

- 使用挂载

```sh
# multipass launch --mount 主机路径:实例路径

$ multipass launch --mount /some/local/path:/some/instance/path
```

- 数据传输

```sh
# multipass transfer 主机名:文件A 主机名:文件B 目标路径

$ multipass transfer keen-yak:/etc/crontab keen-yak:/etc/fstab /home/michal
```

### 删除实例

- 删除实例到回收站

```sh
$ multipass delete ubuntu
```

- 删除所有实例到回收站

```sh
$ multipass delete --all
```

- 恢复回收站中的实例

```sh
$ multipass recover ubuntu
```

- 永久删除实例

```sh
# 临时删除
$ multipass delete ubuntu
# 永久删除
$ multipass purge ubuntu

# 也可以这样写
$ multipass delete --purge ubuntu
```

### 配置静态IP

使用此方法，实例将获得一个额外的 IP，该 IP 不会随着重新启动而改变。

1. 打开Hyper-V管理器

> 打开虚拟交换机管理器 => 新建虚拟网络交换机 => 选择外部 => 创建虚拟交换机
>
> 填写虚拟交换机名称 => 选择外部网络(网卡) => 运行管理操作系统共享此网络适配器

2. 查看本机IP

```sh
ipconfig

Windows IP Configuration


Ethernet adapter vEthernet (Default Switch):

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::a66:d3f2:811c:c413%48
   IPv4 Address. . . . . . . . . . . : 172.25.208.1
   Subnet Mask . . . . . . . . . . . : 255.255.240.0
   Default Gateway . . . . . . . . . :

Ethernet adapter vEthernet (EXT-SWITCH):

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::ea9c:4239:b2f9:4f6e%25
   IPv4 Address. . . . . . . . . . . : 192.168.100.14
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.100.1
```

> 可以看到我们新增的虚拟交换机：Ethernet adapter vEthernet (EXT-SWITCH)

3. 创建实例

```sh
# 设置名称为ubuntu, CPU 4核, 硬盘 20G, 内存 6G
multipass launch 20.04 --name ubuntu --cpus 4 --disk 20G --memory 6G

# 设置为主实例
multipass set client.primary-name=ubuntu
```

4. 新增虚拟网卡

> 打开虚拟交换机管理器 => 选择实例 => 右键设置
>
> 添加硬件 => 网络适配器 => 添加
>
> 网络设配器配置 => 虚拟交换机选择 => 选择上面创建的虚拟交换机

还可以修改原有网络适配器的虚拟交换机

> 打开虚拟交换机管理器 => 选择实例 => 右键设置
>
> 选择网络适配器 => 修改虚拟机交换机为上面新建的虚拟交换机

5. 配置网卡

```sh
# 进入实例
multipass shell

# 修改网络配置
sudo vi /etc/netplan/50-cloud-init.yaml

# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        eth0:
            dhcp4: true
            match:
                macaddress: 52:54:00:7e:86:e3
            set-name: eth0
        eth1:
            dhcp4: no
            addresses: [192.168.100.10/24]
    version: 2

# 更新配置
sudo netplan apply
```

6. 确认配置成功

```sh
C:\Users\64531>multipass info ubuntu
Name:           ubuntu
State:          Running
IPv4:           172.25.217.30
                172.25.221.92
                192.168.100.10
Release:        Ubuntu 20.04.6 LTS
Image hash:     5e8c2914c5f0 (Ubuntu 20.04 LTS)
CPU(s):         4
Load:           0.00 0.00 0.00
Disk usage:     1.5GiB out of 19.3GiB
Memory usage:   242.3MiB out of 5.8GiB
Mounts:         --
```

## 管理Multipass

### 设置驱动程序

- Windows

```sh
# 设置驱动为virtualbox
$ multipass set local.driver=virtualbox

# 设置驱动为hyperv
$ multipass set local.driver=hyperv
```

### 设置身份验证

- 设置密码

```sh
$ multipass set local.passphrase
Please enter passphrase:
Please re-enter passphrase:

$ multipass set local.passphrase=foo
```

- 身份验证

设置密码后，需要进行身份验证才可以使用实例

```sh
$ multipass authenticate
Please enter passphrase:

$ multipass authenticate foo
```

## 其他

### 修改ubuntu密码

通过 multipass 创建的实例，是没有指定密码的，所以我们要重置密码，我这里的用户为 `ubuntu` :

```sh
ubuntu@ubuntu:~$ sudo passwd ubuntu
New password:
Retype new password:
passwd: password updated successfully
```
