# Tailscale

## 介绍

Tailscale 是一个基于 WireGuard 的现代 VPN（虚拟专用网络）解决方案，旨在简化设备之间的安全连接。它通过点对点（P2P）技术，让用户能够轻松地在不同设备之间建立加密的网络连接，而无需复杂的配置或管理。Tailscale 特别适合个人用户、开发团队和企业，用于远程访问、跨设备协作以及安全地连接分布式基础设施。

## 传统 VPN 与 Tailscale 的对比

### 传统 VPN 的问题

- **高延迟**：用户通过位于远距离的中央网关连接，导致高延迟。
- **瓶颈效应**：流量集中化可能导致瓶颈，进一步减慢连接速度。

### Tailscale 的优势

- **低延迟**：Tailscale 允许设备之间直接连接，从而降低延迟。例如，查尔斯顿的用户可以直接连接到纽约市的计算机。
- **去中心化**：Tailscale 尽可能避免集中化，从而提高吞吐量和降低延迟，同时增强稳定性和可靠性，减少单点故障。

## 主要优势

### 安全与隐私

Tailscale 提供设备之间的安全私有连接，采用现代、经过验证的技术和最佳实践，如端到端加密和零信任架构。其核心使用 WireGuard，这是一种以安全性和性能著称的先进 VPN 协议。Tailscale 还通过访问控制策略和 tailnet 锁定等功能进一步增强安全性。

### 灵活的网络拓扑

Tailscale 的网络架构灵活，能够根据组织需求无缝扩展。无论是从小团队扩展到大型企业，还是跨多个地理位置扩展，Tailscale 都能保持其性能和安全性。其分布式架构意味着添加新设备或用户不会像传统 VPN 解决方案那样造成瓶颈。

### 简化设置

Tailscale 高度可配置，但上手非常简单。与传统 VPN 需要大量配置、服务器设置和网络专业知识不同，您可以在几分钟内部署 Tailscale 网络（tailnet）。创建账户后，验证两个或更多设备会自动创建一个具有合理默认访问策略的 tailnet。
Tailscale 的连接在防火墙和网络地址转换（NAT）之间无缝工作，无需端口转发或复杂的防火墙规则。这种“零配置”方法大大降低了实施安全网络的技术门槛，使其对技术用户和非技术用户都易于使用。

### 跨平台与基础设施无关

Tailscale 支持多种平台，且与基础设施无关，具有高度可配置性和丰富的功能与集成。

## 快速开始

### 下载客户端

访问[Download | Tailscale](https://tailscale.com/download)下载客户端

Linux：

```sh
curl -fsSL https://tailscale.com/install.sh | sh
```

window：

```sh
https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe
```

### 常用命令

#### 命令列表

```sh
tailscale --help
SUBCOMMANDS
  up          Connect to Tailscale, logging in if needed # 连接到 Tailscale 网络。如果还没有登录，会提示你登录。
  down        Disconnect from Tailscale # 断开与 Tailscale 网络的连接。
  set         Change specified preferences # 修改 Tailscale 的配置选项。
  login       Log in to a Tailscale account # 登录到你的 Tailscale 账户。
  logout      Disconnect from Tailscale and expire current node key # 退出当前 Tailscale 账户，并断开连接。
  switch      Switches to a different Tailscale account # 切换到另一个 Tailscale 账户。
  configure   [ALPHA] Configure the host to enable more Tailscale features
  netcheck    Print an analysis of local network conditions # 检查本地网络状况，看看是否有问题影响 Tailscale 连接。
  ip          Show Tailscale IP addresses # 显示当前设备在 Tailscale 网络中的 IP 地址。
  dns         Diagnose the internal DNS forwarder # 诊断 Tailscale 内部的 DNS 服务。
  status      Show state of tailscaled and its connections # 查看当前 Tailscale 的连接状态，包括已连接的设备。
  ping        Ping a host at the Tailscale layer, see how it routed # 测试与另一台 Tailscale 设备的网络连通性。
  nc          Connect to a port on a host, connected to stdin/stdout # 通过 Tailscale 网络连接到另一台设备的指定端口。
  ssh         SSH to a Tailscale machine # 通过 Tailscale 网络 SSH 连接到另一台设备。
  funnel      Serve content and local servers on the internet # 将本地服务暴露到互联网，让外部用户访问。
  serve       Serve content and local servers on your tailnet # 在 Tailscale 网络中共享本地服务。
  version     Print Tailscale version # 显示当前安装的 Tailscale 版本。
  web         Run a web server for controlling Tailscale
  file        Send or receive files # 通过 Tailscale 网络发送或接收文件。
  bugreport   Print a shareable identifier to help diagnose issues # 生成一个报告，用于帮助诊断 Tailscale 的问题。
  cert        Get TLS certs # 获取 TLS 证书，用于加密通信。
  lock        Manage tailnet lock # 管理 Tailscale 网络的安全锁定功能。
  licenses    Get open source license information
  exit-node   Show machines on your tailnet configured as exit nodes # 查看或设置 Tailscale 网络中的出口节点（用于访问外部网络）。
  update      Update Tailscale to the latest/different version # 更新 Tailscale 到最新版本。
  whois       Show the machine and user associated with a Tailscale IP (v4 or v6) # 查看某个 Tailscale IP 地址对应的设备和用户信息。
  drive       Share a directory with your tailnet
  completion  Shell tab-completion scripts # 生成 Shell 自动补全脚本，方便命令行使用。

FLAGS
  --socket value
        path to tailscaled socket (default /var/run/tailscale/tailscaled.sock)
```

#### 基本命令

`tailscale login`：启动 Tailscale 并连接到网络。

```sh
tailscale login --login-server https://xxx.xxx
```

`tailscale down`：断开 Tailscale 连接并停止服务。

`tailscale status`:：查看当前 Tailscale 网络中的设备及其连接状态。

`tailscale netcheck`:：查看当前 Tailscale 网络中的节点。

`tailscale ping`：测试与 Tailscale 网络中其他设备的连接。

`tailscale logout`：从当前设备注销 Tailscale 账户。

`tailscale switch`：切换 Tailscale 账户。

`tailscale set`：配置设备属性。

`tailscale dns`：配置DNS

```sh
tailscale set --accept-dns=false
```

`tailscale version`：查看 Tailscale 客户端版本。

## 访问权限控制

Tailscale/Headscale 的默认访问规则是 default deny，也就是黑名单模式，只有在访问规则明确允许的情况下设备之间才能通信。所以 Tailscale/Headscale 默认会使用 allowall 访问策略进行初始化，该策略允许加入到 Tailscale 网络的所有设备之间可以相互访问。

Tailscale/Headscale 通过使用 group 这种概念，可以只用非常少的规则就能表达大部分安全策略。除了 group 之外，还可以为设备打 tag 来进一步扩展访问策略。结合 group 和 tag 就可以构建出强大的基于角色的访问控制（RBAC）策略。

### ACL语法

Tailscale ACL 需要保存为 HuJSON 格式，也就是 human JSON。HuJSON 是 JSON 的超集，允许添加注释以及结尾处添加逗号。这种格式更易于维护，对人类和机器都很友好。

Headscale 的 ACL 策略主要包含以下几个部分：

- `acls`：ACL 策略定义。
- `groups`：用户的集合。Tailscale 官方控制器的“用户”指的是登录名，必须是邮箱格式。而 Headscale 的用户就是 namesapce。
- `hosts`：定义 IP 地址或者 CIDR 的别名。
- `tagOwners`：指定哪些用户有权限给设备打 tag。
- `autoApprovers`：允许哪些用户不需要控制端确认就可以宣告 Subnet 路由和 Exit Node。

#### ACL规则

acls 部分是 ACL 规则主体，每个规则都是一个 HuJSON 对象，它授予从一组访问来源到一组访问目标的访问权限。

所有的 ACL 规则最终表示的都是允许从特定源 IP 地址到特定目标 IP 地址和端口的流量。虽然可以直接使用 IP 地址来编写 ACL 规则，但为了可读性以及方便维护，建议使用用户、Group 以及 tag 来编写规则，Tailscale 最终会将其转换为具体的 IP 地址和端口。

每一个 ACL 访问规则长这个样子：

```yaml
  - action: accept
    src:
      - xxx
      - xxx
      - ...
    dst:
      - xxx
      - xxx
      - ...
    proto: protocol # 可选参数

```

Tailscale/Headscale 的默认访问规则是 default deny，也就是黑名单模式，只有在访问规则明确允许的情况下设备之间才能通信。所以 ACL 规则中的 action 值一般都写 accept，毕竟默认是 deny 嘛。

`src` 字段表示访问来源列表，该字段可以填的值都在这个表格里：

| 类型                                                       | 示例              | 含义                               |
| ---------------------------------------------------------- | ----------------- | ---------------------------------- |
| Any                                                        | *                 | 无限制（即所有来源）               |
| 用户(Namespace)                                            | dev1              | Headscale namespace 中的所有设备   |
| Group [(ref)](https://tailscale.com/kb/1018/acls#groups)   | group:example     | Group 中的所有用户                 |
| Tailscale IP                                               | 100.101.102.103   | 拥有给定 Tailscale IP 的设备       |
| Subnet CIDR [(ref)](https://tailscale.com/kb/1019/subnets) | 192.168.1.0/24    | CIDR 中的任意 IP                   |
| Hosts [(ref)](https://tailscale.com/kb/1018/acls#hosts)    | my-host           | `hosts` 字段中定义的任意 IP        |
| Tags [(ref)](https://tailscale.com/kb/1068/tags)           | tag:production    | 分配指定 tag 的所有设备            |
| Tailnet members                                            | autogroup:members | Tailscale 网络中的任意成员（设备） |

proto 字段是可选的，指定允许访问的协议。如歌不指定，默认可以访问所有 TCP 和 UDP 流量。

proto 可以指定为 IANA IP 协议编号 1-255（例如 16）或以下命名别名之一（例如 sctp）：

| 协议                                        | proto          | IANA 协议编号 |
| ------------------------------------------- | -------------- | ------------- |
| Internet Group Management (IGMP)            | igmp           | 2             |
| IPv4 encapsulation                          | ipv4, ip-in-ip | 4             |
| Transmission Control (TCP)                  | tcp            | 6             |
| Exterior Gateway Protocol (EGP)             | egp            | 8             |
| Any private interior gateway                | igp            | 9             |
| User Datagram (UDP)                         | udp            | 17            |
| Generic Routing Encapsulation (GRE)         | gre            | 47            |
| Encap Security Payload (ESP)                | esp            | 50            |
| Authentication Header (AH)                  | ah             | 51            |
| Stream Control Transmission Protocol (SCTP) | sctp           | 132           |

只有 TCP、UDP 和 SCTP 流量支持指定端口，其他协议的端口必须指定为 `*`。

dst 字段表示访问目标列表，列表中的每个元素都用 `hosts:ports` 来表示。hosts 的取值范围如下：

| 类型                                                         | 示例               | 含义                                                     |
| ------------------------------------------------------------ | ------------------ | -------------------------------------------------------- |
| Any                                                          | *                  | 无限制（即所有访问目标）                                 |
| 用户（Namespace）                                            | dev1               | Headscale namespace 中的所有设备                         |
| Group [(ref)](https://tailscale.com/kb/1018/acls#groups)     | group:example      | Group 中的所有用户                                       |
| Tailscale IP                                                 | 100.101.102.103    | 拥有给定 Tailscale IP 的设备                             |
| Hosts [(ref)](https://tailscale.com/kb/1018/acls/#hosts)     | my-host            | `hosts` 字段中定义的任意 IP                              |
| Subnet CIDR [(ref)](https://tailscale.com/kb/1019/subnets)   | 192.168.1.0/24     | CIDR 中的任意 IP                                         |
| Tags [(ref)](https://tailscale.com/kb/1068/acl-tags)         | tag:production     | 分配指定 tag 的所有设备                                  |
| Internet access [(ref)](https://tailscale.com/kb/1103/exit-nodes) | autogroup:internet | 通过 Exit Node 访问互联网                                |
| Own devices                                                  | autogroup:self     | 允许 src 中定义的来源访问自己（不包含分配了 tag 的设备） |
| Tailnet devices                                              | autogroup:members  | Tailscale 网络中的任意成员（设备）                       |

`ports` 的取值范围：

| 类型     | 示例      |
| -------- | --------- |
| Any      | *         |
| Single   | 22        |
| Multiple | 80,443    |
| Range    | 1000-2000 |

### Groups

groups 定义了一组用户的集合，YAML 格式示例配置如下

```yaml
groups:
  group:admin:
    - "admin1"
  group:dev:
    - "dev1"
    - "dev2"
```

huJSON 格式：

```json
"groups": {
  "group:admin": ["admin1"],
  "group:dev": ["dev1", "dev2"],
},
```

每个 Group 必须以 `group:` 开头，Group 之间也不能相互嵌套。

### Autogroups

autogroup 是一个特殊的 group，它自动包含具有相同属性的用户或者访问目标，可以在 ACL 规则中调用 autogroup。

| Autogroup          | 允许在 ACL 的哪个字段调用 | 含义                                                         |
| ------------------ | ------------------------- | ------------------------------------------------------------ |
| autogroup:internet | dst                       | 用来允许任何用户通过任意 Exit Node 访问你的 Tailscale 网络   |
| autogroup:members  | src 或者 dst              | 用来允许 Tailscale 网络中的任意成员（设备）访问别人或者被访问 |
| autogroup:self     | dst                       | 用来允许 src 中定义的来源访问自己                            |

示例配置：

```yaml
acls:
  # 允许所有员工访问自己的设备
  - action: accept
    src:
      - "autogroup:members"
    dst:
      - "autogroup:self:*"
  # 允许所有员工访问打了标签 tag:corp 的设备
  - action: accept
    src:
      - "autogroup:members"
    dst:
      - "tag:corp:*"
```

### Hosts

Hosts 用来定义 IP 地址或者 CIDR 的别名，使 ACL 可读性更强。示例配置：

```yaml
hosts:
  example-host-1: "100.100.100.100"
  example-network-1: "100.100.101.100/24
```

### Tag Owners

`tagOwners` 定义了哪些用户有权限给设备分配指定的 tag。示例配置：

```yaml
tagOwners:
  tag:webserver:
    - group:engineering
  tag:secure-server:
    - group:security-admins
    - dev1
  tag:corp:
    - autogroup:members
```

这里表示的是允许 Group `group:engineering` 给设备添加 tag `tag:webserver`；允许 Group `group:security-admins` 和用户（也就是 namespace）dev1 给设备添加 tag `tag:secure-server`；允许 Tailscale 网络中的任意成员（设备）给设备添加 tag `tag:corp`。

每个 tag 名称必须以 `tag:` 开头，每个 tag 的所有者可以是用户、Group 或者 `autogroup:members`。

### Auto Approvers

`autoApprovers` 定义了**无需 Headscale 控制端批准即可执行某些操作**的用户列表，包括宣告特定的子网路由或者 Exit Node。

当然了，即使可以通过 `autoApprovers` 自动批准，Headscale 控制端仍然可以禁用路由或者 Exit Node，但不推荐这种做法，因为控制端只能临时修改，`autoApprovers` 中定义的用户列表仍然可以继续宣告路由或 Exit Node，所以正确的做法应该是修改 `autoApprovers` 中的用户列表来控制宣告的路由或者 Exit Node。

autoApprovers 示例配置：

```yaml
autoApprovers:
  exitNode:
    - "default"
    - "tag:bar"
  routes:
    "10.0.0.0/24":
      - "group:engineering"
      - "dev1"
      - "tag:foo"
```

这里表示允许 `default` namespace 中的设备（以及打上标签 `tag:bar` 的设备）将自己宣告为 Exit Node；允许 Group `group:engineering` 中的设备（以及 dev1 namespace 中的设备和打上标签 `tag:foo` 的设备）宣告子网 `10.0.0.0/24` 的路由。

## 反向代理

### Nginx

```nginx
map $http_upgrade $connection_upgrade {
    default      keep-alive;
    'websocket'  upgrade;
    ''           close;
}

server {
    listen 80;
    listen [::]:80;

    listen 443      ssl;
    listen [::]:443 ssl;

    server_name xxx.xxx.xxx;

    ssl_certificate /usr/local/nginx/cert/xxx.xxx.xxx.crt;
    ssl_certificate_key /usr/local/nginx/cert/xxx.xxx.xxx.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $server_name;
        proxy_redirect http:// https://;
        proxy_buffering off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;
    }
}
```

## 子网路由

### 什么是子网路由？

Tailscale 是一个基于 WireGuard 的零配置 VPN，通常我们希望在每个设备上都安装 Tailscale 客户端，这样可以确保端到端加密通信，无需额外配置。
然而，在以下情况下，我们无法或不想在每个设备上安装客户端：

1. **不支持安装的设备**：如打印机、老旧网络设备等。
2. **大型网络集成**：如将整个 AWS VPC 加入 Tailscale 网络。
3. **逐步迁移**：将传统网络逐步接入 Tailscale。

在这些情况下，我们可以使用 **子网路由器（Subnet Router）**，它可以将物理子网接入到 Tailscale 网络中，使网络中的所有设备都可以通过子网路由器进行访问。

### **工作原理**

子网路由器作为网关，将 Tailnet（Tailscale 网络）和物理子网连接起来。
 默认情况下，子网路由器使用 **SNAT（源网络地址转换）**，这意味着子网设备通过路由器访问外部时，源地址会显示为路由器地址。
 如果禁用 SNAT，则可以保留设备的原始 IP 地址，但需要手动配置返回路由。

### 配置子网路由

**启用 IP 转发：**

在 Linux 上启用 IP 转发

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf

# 或者
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf
```

**广播子网路由：**

使用 `tailscale up` 命令广播子网

```bash
sudo tailscale up --accept-routes --accept-dns=false --advertise-routes=192.168.1.0/24,10.0.0.0/24 --login-server=https://xxx.xxx.com
```

**启用路由：**

这里使用 `headscale` 配置

```bash
headscale route enable -r ID
```

### 禁用 SNAT（可选）

在默认情况下，Tailscale 子网路由器会启用 SNAT，这会导致：

1. **来源 IP 变化**：从子网内设备发出的流量，源 IP 地址会被替换为子网路由器的 IP。
2. **对流量来源的识别困难**：接收方无法知道真实的来源设备，只能看到子网路由器的 IP。

禁用 SNAT 后，子网设备访问外部 Tailscale 设备时，**原始设备 IP 会被保留**，这在以下场景中尤为重要：

1. **日志追踪和审计**：需要准确记录哪个设备发起了请求。
2. **基于 IP 的访问控制**：外部系统可以根据设备的原始 IP 做访问限制或过滤。
3. **网络故障排查**：可以直接看到具体设备的流量来源，定位问题更方便。

**禁用 SNAT 的配置：**

```bash
sudo tailscale up --snat-subnet-routes=false
```

>禁用 SNAT 后，子网设备的流量会保留原始 IP，因此：
>
>1. 返回流量的路由配置：
>   - 由于外部设备收到的来源 IP 是子网内设备的 IP，因此需要在子网内部配置返回路由，让回包通过子网路由器返回原始设备。
>   - 可以通过在本地设备、VPC 设置或 DHCP 服务器上配置返回路由：
>     - 网络：`100.64.0.0/10`（Tailscale IP 范围）
>     - 下一跳（网关）：子网路由器的本地 IP
>2. 复杂性增加：
>   - 需要确保所有子网设备正确配置路由，避免因缺少返回路由导致无法通信。

## 常见问题

### UDP 吞吐量优化

**提示信息：**

```bash
Warning: UDP GRO forwarding is suboptimally configured on enp1s0, UDP forwarding throughput capability will increase with a configuration change.
See https://tailscale.com/s/ethtool-config-udp-gro
```

**原因：**

Tailscale **1.54 或更高版本**，配合 **Linux 6.2 或更高版本内核**，支持使用**传输层卸载**（Transport Layer Offloads）来提升 UDP 吞吐量。
 如果你的 Linux 设备作为**出口节点**或**子网路由器**，请确保按照以下步骤配置网络设备，以获得最佳性能。

```bash
# 1. 启用 UDP 吞吐量优化
NETDEV=$(ip -o route get 8.8.8.8 | cut -f 5 -d " ")
sudo ethtool -K $NETDEV rx-udp-gro-forwarding on rx-gro-list off

# - `NETDEV=$(ip -o route get 8.8.8.8 | cut -f 5 -d " ")`：自动检测到达 `8.8.8.8` 的网络接口名称。
# - `ethtool -K`：配置指定网络接口的内核参数。
#  - `rx-udp-gro-forwarding on`：开启 UDP 转发聚合，减少内核处理包的数量，提升性能。
#  - `rx-gro-list off`：禁用通用接收聚合列表，避免某些驱动程序导致的吞吐量下降。

# 2. 配置持久化（防止重启丢失）
sudo mkdir -p /etc/networkd-dispatcher/routable.d/
printf '#!/bin/sh\n\nethtool -K %s rx-udp-gro-forwarding on rx-gro-list off \n' "$(ip -o route get 8.8.8.8 | cut -f 5 -d " ")" | sudo tee /etc/networkd-dispatcher/routable.d/50-tailscale
sudo chmod 755 /etc/networkd-dispatcher/routable.d/50-tailscale

# 创建一个脚本文件 /etc/networkd-dispatcher/routable.d/50-tailscale。
# 脚本内容是设置网络设备的优化参数。
# 设置脚本权限为 755，即所有者可读写执行，其他用户可读执行。

# 3. 测试脚本
sudo /etc/networkd-dispatcher/routable.d/50-tailscale
test $? -eq 0 || echo 'An error occurred.'

# 验证脚本是否正确运行，如果出现错误则输出提示。
```
