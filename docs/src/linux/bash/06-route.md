# 路由配置

## 基本概念

- 路由：  跨越从源主机到目标主机的一个互联网络来转发数据包的过程
- 路由器：能够将数据包转发到正确的目的地，并在转发过程中选择最佳路径的设备
- 路由表：在路由器中维护的路由条目，路由器根据路由表做路径选择
- 直连路由：当在路由器上配置了接口的IP地址，并且接口状态为up的时候，路由表中就出现直连路由项
- 静态路由：是由管理员手工配置的，是单向的。
- 默认路由：当路由器在路由表中找不到目标网络的路由条目时，路由器把请求转发到默认路由接口。

## 特点

静态路由

- 路由表是手工设置的；
- 除非网络管理员干预，否则静态路由不会发生变化；
- 路由表的形成不需要占用网络资源；
- 适用环境：一般用于网络规模很小、拓扑结构固定的网络中。

默认路由

- 在所有路由类型中，默认路由的优先级最低
- 适用环境：一般应用在只有一个出口的末端网络中或作为其他路由的补充

浮动静态路由

- 路由表中存在相同目标网络的路由条目时，根据路由条目优先级的高低，将请求转发到相应端口；
- 链路冗余的作用；

## 命令详解

### route

```sh
[root@dev ~]# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
192.168.1.17    0.0.0.0         255.255.255.255 UH    0      0        0 ppp0
10.1.32.14      0.0.0.0         255.255.255.255 UH    0      0        0 tun0
10.1.32.12      0.0.0.0         255.255.255.255 UH    0      0        0 tun0
10.4.8.2        192.168.9.254   255.255.255.255 UGH   0      0        0 eth0
10.4.9.0        0.0.0.0         255.255.255.0   U     0      0        0 tun0
192.168.9.0     0.0.0.0         255.255.255.0   U     1      0        0 eth0
10.2.0.0        0.0.0.0         255.255.0.0     U     0      0        0 tun0
10.0.0.0        0.0.0.0         255.255.0.0     U     0      0        0 tun0
10.1.0.0        0.0.0.0         255.255.0.0     U     0      0        0 tun0
192.168.0.0     0.0.0.0         255.255.0.0     U     0      0        0 tun0
0.0.0.0         192.168.9.254   0.0.0.0         UG    0      0        0 eth0
```

- Destination：目标网络或目标主机。Destination 为 default（`0.0.0.0`）时，表示这个是默认网关，所有数据都发到这个网关
- Gateway：网关地址，`*` 表示目标是本主机所属的网络，不需要路由，`0.0.0.0` 表示当前记录对应的 Destination 跟本机在同一个网段，通信时不需要经过网关
- Genmask：网络掩码，Destination 是主机时需要设置为 `255.255.255.255`，是默认路由时会设置为 `0.0.0.0`
- Flags：标记
  - U：路由是活动的
  - H：表示目标是具体主机，而不是网段
  - G：路由指向网关
  - R：恢复动态路由产生的表项
  - D：由路由的后台程序动态地安装
  - M：由路由的后台程序修改
  - ！：拒绝路由
- Metric：路由距离，到达指定网络所需的中转数，是大型局域网和广域网设置所必需的 （不在Linux内核中使用。）
- Ref： 路由项引用次数 （不在Linux内核中使用。）
- Use： 此路由项被路由软件查找的次数
- Iface： 网卡名字，例如 `eth0`

## 路由类型

### 主机路由

主机路由是路由选择表中指向**单个IP地址或主机名**的路由记录，主机路由的Flags字段为H。

例：本地主机通过IP地址`192.168.1.1`的路由器到达IP地址为`10.0.0.10`的主机。

```sh
Destination    Gateway       Genmask        Flags     Metric    Ref    Use    Iface
-----------    -------     -------            -----     ------    ---    ---    -----
10.0.0.10     192.168.1.1    255.255.255.255   UH       0    0      0    eth0
```

### 网络路由

网络路由是代表主机可以到达的**网络（网段）**，网络路由的Flags字段为N。

例如：本地主机将发送到网络`192.19.12`的数据包转发到IP地址为`192.168.1.1`的路由器。

```sh
estination    Gateway       Genmask      Flags    Metric    Ref     Use    Iface
-----------    -------     -------         -----    -----   ---    ---    -----
192.19.12     192.168.1.1    255.255.255.0      UN      0       0     0    eth0
```

### 默认路由

当主机**不能**在路由表中查找到目标主机的IP地址或网络路由时，数据包就被发送到默认路由（默认网关）上，默认路由的Flags字段为G。

例：默认路由是IP地址为`192.168.1.1`的路由器

```sh
Destination    Gateway       Genmask    Flags     Metric    Ref    Use    Iface
-----------    -------     ------- -----      ------    ---    ---    -----
default       192.168.1.1     0.0.0.0    UG       0        0     0    eth0
```

## 路由配置

```sh
Usage: inet_route [-vF] del {-host|-net} Target[/prefix] [gw Gw] [metric M] [[dev] If]
       inet_route [-vF] add {-host|-net} Target[/prefix] [gw Gw] [metric M]
                              [netmask N] [mss Mss] [window W] [irtt I]
                              [mod] [dyn] [reinstate] [[dev] If]
       inet_route [-vF] add {-host|-net} Target[/prefix] [metric M] reject
       inet_route [-FC] flush      NOT supported
       
#参数详解
# add           添加一条路由规则
# del           删除一条路由规则
# -net          目的地址是一个网络
# -host         目的地址是一个主机
# target        目的网络或主机
# netmask       目的地址的网络掩码
# gw            路由数据包通过的网关
# dev           为路由指定的网络接口
```

### 示例

```sh
# 添加到主机的路由
route add -host 192.168.1.2 dev eth0:0
route add -host 10.20.30.148 gw 10.20.30.40
  
# 添加到网络的路由
route add -net 10.20.30.40 netmask 255.255.255.248 eth0
route add -net 10.20.30.48 netmask 255.255.255.248 gw 10.20.30.41
route add -net 192.168.1.0/24 eth1
  
# 添加默认路由
route add default gw 192.168.1.1
  
#删除路由
route del -host 192.168.1.2 dev eth0:0
route del -host 10.20.30.148 gw 10.20.30.40
route del -net 10.20.30.40 netmask 255.255.255.248 eth0
route del -net 10.20.30.48 netmask 255.255.255.248 gw 10.20.30.41
route del -net 192.168.1.0/24 eth1
route del default gw 192.168.1.1
# 删除所有的默认路由
route del default   
 
# 添加一条默认路由
route add default gw 10.0.0.1      # 默认只在内存中生效
# 开机自启动可以追加到/etc/rc.local文件里
echo "route add default gw 10.0.0.1" >>/etc/rc.local
 
# 添加一条静态路由
route add -net 192.168.2.0/24 gw 192.168.2.254
# 要永久生效的话要这样做：
echo "any net 192.168.2.0/24 gw 192.168.2.254" >>/etc/sysconfig/static-routes
 
# 添加到一台主机的静态路由
route add -host 192.168.2.2 gw 192.168.2.254
# 要永久生效的话要这样做：
echo "any  host 192.168.2.2 gw 192.168.2.254 " >>/etc/sysconfig/static-routes

# 注：Linux 默认没有这个文件 ，得手动创建一个
```

### 静态路由配置

```sh
ip route [destination_network] [mask] [next-hop_address] administrative_distance]
# 参数解析：
# ip route                   用于创建静态路由的命令。
# Destination_network        需要发布到路由表中的网段。
# Mask                       在这一网络上使用的子网掩码。
# Next-hop_address           下一跳路由器的地址。
# administrative_distance    默认时，静态路由有一个取值为1 的管理性距离。在这个命令的尾部添加管理权来修改这个默认值。
 
# 例如
ip route 172.16.1.0 255.255.255.0 172.16.2.1
```

## 设置包转发

```sh
# 临时开启路由功能：
echo 1 > /proc/sys/net/ipv4/ip_forward
# 或者
sysctl -w net.ipv4.ip_forward=1

# 永久开启路由功能
vim /etc/sysctl.conf
# 写入以下内容
net.ipv4.ip_forward = 1
```

## 实例

```tex
A(1.2) <--> (1.1)B(2.1) <--> (2.2)C(3.1) <--> (3.2)D(4.1) <--> (4.2)E
```

使用A主机`192.168.1.2`能够ping通E主机`192.168.4.2`，这两台机能够通信。

操作思路：

1. 在主机B上设置默认路由下一跳为192.168.2.2，并开启路由转发功能；
2. 在主机C上设置2条静态路由，分别去192.168.1.0/24网段的下一跳为192.168.2.1，去192.168.4.0/24网段的下一跳为192.168.3.2，并开启路由转发功能；
3. 在主机D上设置默认路由下一跳为192.168.3.1，并开启路由转发功能。

```sh
# 可以在一块网卡上设置两个ip，比如是eth0，eth0:0
ifconfig eth0:0 192.168.3.1
# 清除ip，重启网络服务即可

# A主机上操作：ip为192.168.1.2，设置网关为192.168.1.1
route add default gw 192.168.1.1
 
# B主机上操作：第一块网卡为192.168.1.1，第二块网卡为192.168.2.1
ifconfig eth0 192.168.1.1
ifconfig eth1 192.168.2.1
 
# B主机设置默认路由，下一跳为192.168.2.2
route add default gw 192.168.2.2
 
# B主机开启路由转发功能
echo 1 > /proc/sys/net/ipv4/ip_forward   # 临时转发
 
# C主机上操作：第一块网卡为192.168.2.2，第二块网卡为192.168.3.1
ifconfig eth0 192.168.2.2
ifconfig eth1 192.168.3.1   
 
# C主机设置2条默认路由
route add -net 192.168.1.0/24 gw 192.168.2.1
route add -net 192.168.4.0/24 gw 192.168.3.2
 
# C主机开启路由转发功能
echo 1 > /proc/sys/net/ipv4/ip_forward
 
# D主机上操作：第一块网卡为192.168.3.2，第二块网卡为192.168.4.1
ifconfig eth0 192.168.3.2
ifconfig eth1 192.168.4.1
 
# D主机设置默认路由，下一跳为192.168.3.1
route add default gw 192.168.3.1
 
# D主机开启路由转发功能
echo 1 > /proc/sys/net/ipv4/ip_forward
 
# E主机上操作：ip为192.168.4.2，设置网关为192.168.4.1
route add default gw 192.168.4.1
```
