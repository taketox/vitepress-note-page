# CentOS

## 配置静态ip

1.查看网口名称

```sh
ip addr
```

2.修改网络配置文件

```sh
# 修改网络配置文件
vi /etc/sysconfig/network-scripts/ifcfg-ens32
# 配置内容
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="static"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens32"
UUID="a03f07e8-70a5-4cce-9851-b18cbcb5c464"
DEVICE="ens32"
ONBOOT="yes"
# 添加以下内容
IPADDR=192.168.100.10
NETMASK=255.255.255.0
GATEWAY=192.168.100.1
DNS1=8.8.8.8
DNS2=114.114.114.114
```

3.重启网络服务

```sh
systemctl restart network
```

## Centos7 防火墙配置

::: tip

[CentOS开放端口的方法](https://blog.csdn.net/songdongdong6/article/details/120015984)

:::

### 常用命令

```sh
# 启动防火墙
systemctl start firewalld

# 禁用防火墙
systemctl stop firewalld

# 设置开机启动
systemctl enable firewalld

# 停止并禁用开机启动
systemctl disable firewalld

# 重启防火墙
firewall-cmd --reload

# 拒绝所有包
firewall-cmd --panic-on
注：该操作会导致sshd断开。

# 取消拒绝状态
firewall-cmd --panic-off

# 查看是否拒绝
firewall-cmd --query-panic
```

#### 查看信息

```sh
# 查看状态
[root@localhost ~]# systemctl status firewalld
● firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2022-10-10 22:00:18 EDT; 2min 6s ago
     Docs: man:firewalld(1)
 Main PID: 2430 (firewalld)
   CGroup: /system.slice/firewalld.service
           └─2430 /usr/bin/python2 -Es /usr/sbin/firewalld --nofork --nopid

# 查看状态
[root@localhost ~]# firewall-cmd --state
running

# 查看版本
firewall-cmd --version

# 查看帮助
firewall-cmd --help
```

#### 防火墙区域

```sh
# 查看区域信息
[root@localhost ~]# firewall-cmd --get-active-zones
public
  interfaces: ens32

# 查看指定接口所属区域信息
[root@localhost ~]# firewall-cmd --get-zone-of-interface=ens32
public

# 将接口添加到区域(默认接口都在public)
# 永久生效再加上 --permanent 然后reload防火墙
firewall-cmd --zone=public --add-interface=eth0

# 设置默认接口区域
# 立即生效，无需重启
firewall-cmd --set-default-zone=public

# 更新防火墙规则
firewall-cmd --reload
或
firewall-cmd --complete-reload
#两者的区别
#第一个无需断开连接，就是firewalld特性之一动态添加规则
#第二个需要断开连接，类似重启服务

# 查看指定区域所有打开的端口
firewall-cmd --zone=public --list-ports

# 在指定区域打开端口（记得重启防火墙）
firewall-cmd --zone=public --add-port=80/tcp
#永久生效再加上 --permanent
#例：永久开启80端口
firewall-cmd --zone=public --add-port=80/tcp --permanent
```

注：
> –zone 作用域
>
> –add-port=8080/tcp 添加端口，格式为：端口/通讯协议
>
> –permanent #永久生效，没有此参数重启后失效
