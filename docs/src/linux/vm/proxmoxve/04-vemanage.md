# 系统管理

## 网络配置

Proxmox VE 使用的是Linux的网络栈，这提供了很大的灵活性。可以通过 GUI 或手动编辑文件 `/etc/network/interfaces`

设置Proxmox VE 节点上网络。

### 应用网络更改

Proxmox VE 不会将更改直接写入 `/etc/network/interfaces`。实际上，网络配置变更首先会写入一个名为 `/etc/network/interfaces.new` 的临时文件，这样你 可以一次进行许多相关的更改。这也允许确保你的改变 在应用之前是正确的，因为错误的网络配置可能会无法呈现节点。

如果直接对 `/etc/network/interfaces` 文件进行了手动更改，则 可以通过运行 `ifreload -a` 来应用它们。

> 确保已安装 *ifupdown2*：apt install ifupdown2

### 网络配置规划

你需要根据当前的网络规划以及可用资源，决定具体采用的网络配置模式。可选模式包括网桥、路由以及地址转换三种类型。

**Proxmox VE服务器位于内部局域网，通过外部网关与互联网连接**

这种情况下最适宜采用网桥模式。这也是新安装Proxmox VE服务器默认采用的模式。该模式下，所有虚拟机通过虚拟网卡与Proxmox VE虚拟网桥连接。其效果类似于虚拟机网卡直接连接在局域网交换机上，而Proxmox VE服务器就扮演了这个交换机的角色。

**Proxmox VE托管于主机供应商，并分配有一段互联网公共IP地址**

这种情况下，可根据主机供应商分配的资源和权限，选择网桥模式或路由模式。

**Proxmox VE托管于主机供应商，但只有一个互联网公共IP地址**

这种情况下，虚拟机访问外部互联网的唯一办法就是通过地址转换。如果外部网络需要访问虚拟机，还需要配置端口转发。

为日后维护使用方便，可以配置VLANs（IEEE 802.1q）和网卡绑定，也就是“链路聚合”。这样就可以灵活地建立复杂虚拟机网络结构。

#### 基于网桥的默认配置

网桥相当于一个软件实现的物理交换机。所有虚拟机共享一个网桥，在多个域的网络环境中，也可以创建多个网桥以分别对应不同网络域。理论上，每个Proxmox VE最多可以支持4094个网桥。

![An image](/img/linux/vm/10.png)

Proxmox VE安装程序会创建一个名为`vmbr0`的网桥，并和检测到的服务器第一块网卡桥接。配置文件`/etc/network/interfaces`中的对应配置信息如下：

```sh
auto lo
iface lo inet loopback

iface eno1 inet manual

auto vmbr0
iface vmbr0 inet static
        address 192.168.10.2/24
        gateway 192.168.10.1
        bridge-ports eno1
        bridge-stp off
        bridge-fd 0
```

在基于网桥的默认配置下，虚拟机看起来就和直接接入物理网络一样。尽管所有虚拟机共享一根网线接入网络，但每台虚拟机都使用自己独立的MAC地址访问网络。

#### 路由配置

但大部分IPC服务器供应商并不支持基于网桥的默认配置方式，出于网络安全的考虑，一旦发现网络接口上有多个MAC地址出现，他们会立刻禁用相关网络端口。

你可以用配置“路由”的方式让多个虚拟机共享一个网络端口，这样就可以避免上面提到的问题。这种方式可以确保所有的对外网络通信都使用同一个MAC地址。

![An image](/img/linux/vm/11.png)

常见的应用场景是，你有一个可以和外部网络通信的IP地址（假定为192.51.100.5），还有一个供虚拟机使用的IP地址段（203.0.113.16/29）。针对该场景，我们推荐使用如下配置：

```sh
auto lo
iface lo inet loopback

auto eno0
iface eno0 inet static
        address  198.51.100.5/29
        gateway  198.51.100.1
        post-up echo 1 > /proc/sys/net/ipv4/ip_forward
        post-up echo 1 > /proc/sys/net/ipv4/conf/eno0/proxy_arp


auto vmbr0
iface vmbr0 inet static
        address  203.0.113.17/28
        bridge-ports none
        bridge-stp off
        bridge-fd 0
```

#### 基于iptables的网络地址转换配置（NAT）

利用地址转换技术，所有虚拟机可以使用内部私有IP地址，并通过Proxmox VE服务器的IP来访问外部网络。Iptables将改写虚拟机和外部网络通信数据包，对于虚拟机向外部网络发出的数据包，将源IP地址替换成服务器IP地址，对于外部网络返回数据包，将目的地址替换为对应虚拟机IP地址。

```sh
auto lo
iface lo inet loopback

auto eno1
#real IP address
iface eno1 inet static
        address  198.51.100.5/24
        gateway  198.51.100.1

auto vmbr0
#private sub network
iface vmbr0 inet static
        address  10.10.10.1/24
        bridge-ports none
        bridge-stp off
        bridge-fd 0

        post-up   echo 1 > /proc/sys/net/ipv4/ip_forward
        post-up   iptables -t nat -A POSTROUTING -s '10.10.10.0/24' -o eno1 -j MASQUERADE
        post-down iptables -t nat -D POSTROUTING -s '10.10.10.0/24' -o eno1 -j MASQUERADE
```

#### Linux多网口绑定

多网口绑定（也称为网卡组或链路聚合）是一种将多个网卡绑定成单个网络设备的技术。利用该技术可以实现某个或多个目标，例如提高网络链路容错能力，增加网络通信性能等。

类似光纤通道和光纤交换机这样的高速网络硬件的价格一般都非常昂贵。利用链路聚合技术，将两个物理网卡组成一个逻辑网卡，能够将网络传输速度加倍。大部分交换机设备都已经支持Linux内核的这个特性。如果你的服务器有多个以太网口，你可以将这些网口连接到不同的交换机，以便将故障点分散到不同的网络设备，一旦有物理线路故障或网络设备故障发生，多网卡绑定会自动将通信流量从故障线路切换到正常线路。

链路聚合技术可以有效减少虚拟机在线迁移的时延，并提高Proxmox VE集群服务器节点之间的数据复制速度。

目前一共有7种网口绑定模式：

- 轮询模式（blance-rr）：网络数据包将按顺序从绑定的第一个网卡到最后一个网卡轮流发送。这种模式可以同时实现负载均衡和链路容错效果。
- 主备模式（active-backup）：该模式下网卡组中只有一个网卡活动。只有当活动的网卡故障时，其他网卡才会启动并接替该网卡的工作。整个网卡组使用其中一块网卡的MAC地址作为对外通信的MAC地址，以避免网络交换机产生混乱。这种模式仅能实现链路容错效果。
- 异或模式（balance-xor）：网络数据包按照异或策略在网卡组中选择一个网卡发送（[源MAC地址 XOR 目标MAC地址] MOD 网卡组中网卡数量）。对于同一个目标MAC地址，该模式每次都选择使用相同网卡通信。该模式能同时实现负载均衡和链路容错效果。
- 广播模式（broadcast）：网络数据包会同时通过网卡组中所有网卡发送。该模式能实现链路容错效果。
- IEEE 802.3ad动态链路聚合模式（802.3ad）（LACP）：该模式会创建多个速度和双工配置一致的聚合组。并根据802.3ad标准在活动聚合组中使用所有网卡进行通信。
- 自适应传输负载均衡模式（balance-tlb）：该Linux网卡绑定模式无须交换机支持即可配置使用。根据当前每块网卡的负载情况（根据链路速度计算的相对值），流出的网络数据包流量会自动进行均衡。流入的网络流量将由当前指定的一块网卡接收。如果接收流入流量的网卡故障，会自动重新指定一块网卡接收网络数据包，但该网卡仍沿用之前故障网卡的MAC地址。
- 自适应负载均衡模式（均衡的IEEE 802.3ad动态链路聚合模式（802.3ad）（LACP）:-alb）：该模式是在blance-tlb模式的基础上结合了IPV4网络流量接收负载均衡（rlb）特性，并且无须网络交换机的专门支持即可配置使用。网络流量接收负载均衡基于ARP协商实现。网卡组驱动将自动截获本机的ARP应答报文，并使用网卡组中其中一块网卡的MAC地址覆盖ARP报文中应答的源MAC地址，从而达到不同的网络通信对端和本机不同MAC地址通信的效果。

在网络交换机支持LACP（IEEE 802.3ad）协议的情况下，推荐使用LACP绑定模式（802.3ad），其他情况建议使用active-backup模式。

对于Proxmox集群网络的网卡绑定，目前仅支持active-backup模式，其他模式均不支持。

下面所列的网卡绑定配置示例可用于分布式/共享存储网络配置。其主要优势是能达到更高的传输速度，同时实现网络链路容错的效果。

**基于固定IP地址的多网卡绑定**

![An image](/img/linux/vm/12.png)

```sh
auto lo
iface lo inet loopback

iface eno1 inet manual

iface eno2 inet manual

iface eno3 inet manual

auto bond0
iface bond0 inet static
      bond-slaves eno1 eno2
      address  192.168.1.2/24
      bond-miimon 100
      bond-mode 802.3ad
      bond-xmit-hash-policy layer2+3

auto vmbr0
iface vmbr0 inet static
        address  10.10.10.2/24
        gateway  10.10.10.1
        bridge-ports eno3
        bridge-stp off
        bridge-fd 0
```

**利用多网卡绑定配置网桥端口**

```sh
auto lo
iface lo inet loopback

iface eno1 inet manual

iface eno2 inet manual

auto bond0
iface bond0 inet manual
      bond-slaves eno1 eno2
      bond-miimon 100
      bond-mode 802.3ad
      bond-xmit-hash-policy layer2+3

auto vmbr0
iface vmbr0 inet static
        address  10.10.10.2/24
        gateway  10.10.10.1
        bridge-ports bond0
        bridge-stp off
        bridge-fd 0
```

### 禁用 IPv6

Proxmox VE 在所有环境中都能正常工作，无论 IPv6 是否 部署与否。我们建议将所有设置保留为提供的默认值。

如果您仍需要在节点上禁用对 IPv6 的支持，请通过以下方式执行此操作

添加 /etc/sysctl.d/disable-ipv6.conf 并添加以下内容：

```sh
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
```

> 此方法优于在[内核命令行](https://www.kernel.org/doc/Documentation/networking/ipv6.rst)上禁用 IPv6 模块的加载。
