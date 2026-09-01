# Debian

## vi命令错乱

在Debian系统，使用vi修改文件，上下作用键变成ABCD，这是因为系统预装的是vim tiny版本，安装vim full版本。

```sh
# 切换到root账户
su
# 卸载vim tiny版本
apt remove vim-common
# 安装vim full版本
apt install vim
```

## 安装sudo

新装的Debian系统，默认没有安装sudo命令，报错：-bash: sudo: command not found。

```sh
# 切换到root账户
su
# 安装sudo
apt install sudo
# 添加权限
vi /etc/sudoers
# 配置User privilege specification，添加以下内容
# user ALL=(ALL:ALL) ALL
# User privilege specification
root    ALL=(ALL:ALL) ALL
taketo  ALL=(ALL:ALL) ALL
```

## 配置静态ip

查看网口名称

```sh
ip addr
```

修改网络配置文件

```sh
# 修改网络配置文件
sudo vi /etc/network/interfaces
# 配置内容
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
#allow-hotplug ens32
#iface ens32 inet dhcp

# static ip configuration
auto ens32
iface ens32 inet static
  address 192.168.10.171
  netmask 255.255.255.0
  gateway 192.168.10.1
  dns-nameservers 114.114.114.114 8.8.8.8
```

配置说明

```sh
# dhcp配置
allow-hotplug ens32
iface ens32 inet dhcp

# static配置
auto ens32
iface ens32 inet static
  address 192.168.10.171
  netmask 255.255.255.0
  gateway 192.168.10.1
  dns-nameservers 114.114.114.114 8.8.8.8
```

重启网络服务

```sh
sudo systemctl restart networking
```

> 重启失败，出现RTNETLINK answers: File exists
>
> ```sh
> ip addr flush dev ens32
> systemctl restart networking
> ```

## 更换国内源

先备份源文件

```sh
cp /etc/apt/sources.list /etc/apt/sources.list.bak
```

一般情况下，将 /etc/apt/sources.list 文件中 Debian 默认的源地址 `http://deb.debian.org/` 替换为 `http://mirrors.ustc.edu.cn` 即可。

可以使用如下命令：

```sh
sudo sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list
```

当然也可以直接编辑 /etc/apt/sources.list 文件（需要使用 sudo）。以下是 Debian Stable 参考配置内容：

```sh
deb http://mirrors.ustc.edu.cn/debian stable main contrib non-free non-free-firmware
# deb-src http://mirrors.ustc.edu.cn/debian stable main contrib non-free non-free-firmware
deb http://mirrors.ustc.edu.cn/debian stable-updates main contrib non-free non-free-firmware
# deb-src http://mirrors.ustc.edu.cn/debian stable-updates main contrib non-free non-free-firmware

# deb http://mirrors.ustc.edu.cn/debian stable-proposed-updates main contrib non-free non-free-firmware
# deb-src http://mirrors.ustc.edu.cn/debian stable-proposed-updates main contrib non-free non-free-firmware
```

> 从 Debian 12 (bookworm) 开始，仓库添加了非自由固件组件 non-free-firmware。 如果正在使用 bookworm, testing 或 sid，并且需要使> 用非自由固件，则在编辑配置时需要添加 non-free-firmware。 其中以上参考配置已经添加。

## 禁止默认休眠

```sh
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

## 关闭合盖休眠

```sh{19,21,25,28}
vim /etc/systemd/logind.conf

[Login]
#NAutoVTs=6
#ReserveVT=6
#KillUserProcesses=no
#KillOnlyUsers=
#KillExcludeUsers=root
#InhibitDelayMaxSec=5
#UserStopDelaySec=10
#HandlePowerKey=poweroff
#HandlePowerKeyLongPress=ignore
#HandleRebootKey=reboot
#HandleRebootKeyLongPress=poweroff
#HandleSuspendKey=suspend
#HandleSuspendKeyLongPress=hibernate
#HandleHibernateKey=hibernate
#HandleHibernateKeyLongPress=ignore
HandleLidSwitch=ignore
#HandleLidSwitchExternalPower=suspend
HandleLidSwitchDocked=ignore
#PowerKeyIgnoreInhibited=no
#SuspendKeyIgnoreInhibited=no
#HibernateKeyIgnoreInhibited=no
LidSwitchIgnoreInhibited=yes
#RebootKeyIgnoreInhibited=no
#HoldoffTimeoutSec=30s
IdleAction=ignore
#IdleActionSec=30min
#RuntimeDirectorySize=10%
#RuntimeDirectoryInodesMax=
#RemoveIPC=yes
#InhibitorsMax=8192
#SessionsMax=8192
#StopIdleSessionSec=infinity
```
