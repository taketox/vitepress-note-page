# derper

## STUN 是什么

Tailscale 的终极目标是让两台**处于网络上的任何位置**的机器建立**点对点连接**（直连），但现实世界是复杂的，大部份情况下机器都位于 NAT 和防火墙后面，这时候就需要通过打洞来实现直连，也就是 NAT 穿透。

NAT 按照 **NAT 映射行为**和**有状态防火墙行为**可以分为多种类型，但对于 NAT 穿透来说根本不需要关心这么多类型，只需要看 **NAT 或者有状态防火墙是否会严格检查目标 Endpoint**，根据这个因素，可以将 NAT 分为 **Easy NAT** 和 **Hard NAT**。

- **Easy NAT** 及其变种称为 “Endpoint-Independent Mapping” (**EIM，终点无关的映射**)  
  这里的 Endpoint 指的是目标 Endpoint，也就是说，有状态防火墙只要看到有客户端自己发起的出向包，就会允许相应的入向包进入，**不管这个入向包是谁发进来的都可以**。
  
- **hard NAT** 以及变种称为 “Endpoint-Dependent Mapping”（**EDM，终点相关的映射**）  
  这种 NAT 会针对每个目标 Endpoint 来生成一条相应的映射关系。 在这样的设备上，如果客户端向某个目标 Endpoint 发起了出向包，假设客户端的公网 IP 是 2.2.2.2，那么有状态防火墙就会打开一个端口，假设是 4242。那么只有来自该目标 Endpoint 的入向包才允许通过 `2.2.2.2:4242`，其他客户端一律不允许。这种 NAT 更加严格，所以叫 Hard NAT。
  
对于 Easy NAT，我们只需要提供一个第三方的服务，它能够告诉客户端“它看到的客户端的公网 ip:port 是什么”，然后将这个信息以某种方式告诉通信对端（peer），后者就知道该和哪个地址建连了！这种服务就叫 **STUN** (Session Traversal Utilities for NAT，NAT会话穿越应用程序)。它的工作流程如下图所示：

- 笔记本向 STUN 服务器发送一个请求：“从你的角度看，我的地址什么？”
- STUN 服务器返回一个响应：“我看到你的 UDP 包是从这个地址来的：`ip:port`”。

![An image](/img/linux/nat/74.png)

## 中继是什么

对于 **Hard NAT** 来说，STUN 就不好使了，即使 STUN 拿到了客户端的公网 `ip:port` 告诉通信对端也于事无补，因为防火墙是和 STUN 通信才打开的缺口，这个缺口只允许 STUN 的入向包进入，其他通信对端知道了这个缺口也进不来。通常企业级 NAT 都属于 Hard NAT。

这种情况下打洞是不可能了，但也不能就此放弃，可以选择一种折衷的方式：创建一个中继服务器（relay server），客户端与中继服务器进行通信，中继服务器再将包中继（relay）给通信对端。

至于中继的性能，那要看具体情况了：

- 如果能直连，那显然没必要用中继方式；
- 但如果无法直连，而中继路径又非常接近双方直连的真实路径，并且带宽足够大，那中继方式并不会明显降低通信质量。延迟肯定会增加一点，带宽会占用一些，但**相比完全连接不上，还是可以接受的**。

事实上对于大部分网络而言，Tailscale 都可以通过各种黑科技打洞成功，只有极少数情况下才会选择中继，中继只是一种 fallback 机制。

## 中继协议简介

中继协议有多种实现方式。

### TURN

TURN 即 Traversal Using Relays around NAT，这是一种经典的中继实现方式，核心理念是：

- **用户**（人）先去公网上的 TURN 服务器认证，成功后后者会告诉你：“我已经为你分配了 ip:port，接下来将为你中继流量”，
- 然后将这个 ip:port 地址告诉对方，让它去连接这个地址，接下去就是非常简单的客户端/服务器通信模型了。

与 STUN 不同，这种协议没有真正的交互性，不是很好用，因此 Tailscale 并没有采用 TURN 作为中继协议。

### DERP

DERP 即 Detoured Encrypted Routing Protocol，这是 Tailscale 自研的一个协议：

- 它是一个**通用目的包中继协议，运行在 HTTP 之上**，而大部分网络都是允许 HTTP 通信的。
- 它根据目的公钥（destination’s public key）来中继加密的流量（encrypted payloads）。

![An image](/img/linux/nat/75.png)

Tailscale 使用的算法很有趣，**所有客户端之间的连接都是先选择 DERP 模式（中继模式），这意味着连接立即就能建立（优先级最低但 100% 能成功的模式），用户不用任何等待**。然后开始并行地进行路径发现，通常几秒钟之后，我们就能发现一条更优路径，然后将现有连接透明升级（upgrade）过去，变成点对点连接（直连）。

因此，DERP 既是 Tailscale 在 NAT 穿透失败时的保底通信方式（此时的角色与 TURN 类似），也是在其他一些场景下帮助我们完成 NAT 穿透的旁路信道。 换句话说，它既是我们的保底方式，也是有更好的穿透链路时，帮助我们进行连接升级（upgrade to a peer-to-peer connection）的基础设施。

## 自建DERPER服务

Tailscale 的私钥只会保存在当前节点，因此 DERP server 无法解密流量，它只能和互联网上的其他路由器一样，呆呆地将加密的流量从一个节点转发到另一个节点，只不过 DERP 使用了一个稍微高级一点的协议来防止滥用。

Tailscale 开源了 DERP 服务器的代码，如果你感兴趣，可以阅读 DERP 的[源代码](https://github.com/tailscale/tailscale/tree/main/derp)。

Tailscale 官方内置了很多 DERP 服务器，分步在全球各地，惟独不包含中国大陆，原因你懂得。这就导致了一旦流量通过 DERP 服务器进行中继，延时就会非常高。而且官方提供的 DERP 服务器是万人骑，存在安全隐患。

为了实现低延迟、高安全性，我们可以参考 Tailscale 官方文档自建私有的 DERP 服务器。有两种部署模式，一种是基于域名，另外一种不需要域名，可以直接使用 IP，不过需要一点黑科技。我们先来看最简单的使用域名的方案。

### 使用域名

需要满足以下几个条件：

- 要有自己的域名，并且申请了 SSL 证书
- 需要准备一台或多台云主机
- 如果服务器在国内，域名需要备案
- 如果服务器在国外，则不需要备案

直接使用docker部署

```yaml
  derper:
    container_name: derper
    image: fredliang/derper
    restart: always
    volumes:
      # ssl证书，需要和域名保持一致
      - /home/nginx/cert:/app/certs
      - /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock
    ports:
      - 3478:3478/udp
      - 8443:8443
    environment:
      # derper server hostname
      DERP_DOMAIN: xxx.xxx.com
      # listening server address
      DERP_ADDR: ":8443"
      # manual or letsencrypt
      DERP_CERT_MODE: manual
      # directory to store LetsEncrypt certs
      DERP_CERT_DIR: /app/certs
      # verify clients to this DERP server through a local tailscaled instance
      DERP_VERIFY_CLIENTS: "true"
```

部署好 derper 之后，就可以修改 Headscale 的配置来使用自定义的 DERP 服务器了。Headscale 可以通过两种形式的配置来使用自定义 DERP：

- 一种是在线 URL，格式是 `JSON`，与 Tailscale 官方控制服务器使用的格式和语法相同。
- 另一种是本地文件，格式是 `YAML`。

我们可以直接使用本地的 YAML 配置文件，内容如下：

```yaml
regions:
  900:
    regionid: 900
    regioncode: nj
    regionname: Chain Nj
    nodes:
      - name: 900a
        regionid: 900
        hostname: xxx
        stunport: 3478
        stunonly: false
        derpport: 443
  901:
    regionid: 901
    regioncode: gz
    regionname: Chain GZ
    nodes:
      - name: 901a
        regionid: 901
        hostname: xxx
        stunport: 8743
        stunonly: false
        derpport: 10234
```

配置说明：

- `regions` 是 YAML 中的**对象**，下面的每一个对象表示一个**可用区**，每个**可用区**里面可设置多个 DERP 节点，即 `nodes`。
- 每个可用区的 `regionid` 不能重复。
- 每个 `node` 的 `name` 不能重复。
- `regionname` 一般用来描述可用区，`regioncode` 一般设置成可用区的缩写。
- `ipv4` 字段不是必须的，如果你的域名可以通过公网解析到你的 DERP 服务器地址，这里可以不填。如果你使用了一个二级域名，而这个域名你并没有在公共 DNS server 中添加相关的解析记录，那么这里就需要指定 IP（前提是你的证书包含了这个二级域名，这个很好支持，搞个泛域名证书就行了）。
- `stunonly: false` 表示除了使用 STUN 服务，还可以使用 DERP 服务。
- 上面的配置中域名和 IP 部分我都打码了，你需要根据你的实际情况填写

接下来还需要修改 Headscale 的配置文件，引用上面的自定义 DERP 配置文件。需要修改的配置项如下：

```yaml
# /etc/headscale/config.yaml
derp:
  # List of externally available DERP maps encoded in JSON
  urls:
  #  - https://controlplane.tailscale.com/derpmap/default

  # Locally available DERP map files encoded in YAML
  #
  # This option is mostly interesting for people hosting
  # their own DERP servers:
  # https://tailscale.com/kb/1118/custom-derp-servers/
  #
  # paths:
  #   - /etc/headscale/derp-example.yaml
  paths:
    - /etc/headscale/derp.yaml

  # If enabled, a worker will be set up to periodically
  # refresh the given sources and update the derpmap
  # will be set up.
  auto_update_enabled: true

  # How often should we check for DERP updates?
  update_frequency: 24h
```

可以把 Tailscale 官方的 DERP 服务器禁用，来测试自建的 DERP 服务器是否能正常工作。

```sh
# tailscale netcheck
Report:
        * UDP: true
        * IPv4: yes, xxxxxxxx
        * IPv6: no, but OS has support
        * MappingVariesByDestIP: false
        * PortMapping: UPnP, NAT-PMP, PCP
        * CaptivePortal: false
        * Nearest DERP: Chain Nj
        * DERP latency:
```

### 使用IP

大部分人是没有自己的域名的。再退一步，就算有自己的域名，如果没有备案，也是没办法部署在国内服务器上使用的。

我们直接使用大佬编译好的容器

[yangchuansheng/ip_derper: 无需域名的 derper](https://github.com/yangchuansheng/ip_derper)

```yaml
version: "3.8"

services:
  derper:
    container_name: derper
    image: yangchuansheng/ip_derper:latest
    restart: always
    volumes:
      - /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock
    ports:
      - 8743:3478/udp
      - 10234:10234
    environment:
      # listening server address
      DERP_ADDR: ":10234"
      # manual or letsencrypt
      DERP_CERT_MODE: manual
      # directory to store LetsEncrypt certs
      DERP_CERT_DIR: /app/certs
      # verify clients to this DERP server through a local tailscaled instance
      DERP_VERIFY_CLIENTS: "true"
```

除了 derper 之外，Tailscale 客户端还需要**跳过域名验证**，这个需要在 DERP 的配置中设置。而 Headscale 的本地 YAML 文件目前还不支持这个配置项，所以没办法，咱只能使用在线 URL 了。JSON 配置内容如下：

```json
{
  "Regions": {
    "901": {
      "RegionID": 901,
      "RegionCode": "gz",
      "RegionName": "China gz",
      "Nodes": [
        {
          "Name": "901a",
          "RegionID": 901,
          "DERPPort": 10234,
          "STUNPort": 8743,
          "HostName": "xxx.xxx.xxx.xxx",
          "IPv4": "xxx.xxx.xxx.xxx",
          "InsecureForTests": true
        }
      ]
    }
  }
}
```

配置解析：

- `HostName` 直接填 derper 的公网 IP，即和 `IPv4` 的值相同。
- `InsecureForTests` 一定要设置为 true，以跳过域名验证。

现在需要把这个 JSON 文件变成 Headscale 服务器可以访问的 URL，类似[controlplane.tailscale.com/derpmap/default](https://controlplane.tailscale.com/derpmap/default)

比如在 Headscale 主机上搭个 Nginx，或者上传到对象存储（比如阿里云 OSS）。

我们这里使用Nginx将配置文件放到网页上。

```json
    location /derper.json {
        # 配置文件位置
        alias  /usr/share/nginx/html/derper/derper.json;
        # 设置响应类型为 JSON
        default_type application/json;
        # 启用目录索引（如果请求的是目录，会列出目录内容）
        autoindex on;
    }
```

接下来还需要修改 Headscale 的配置文件，引用上面的自定义 DERP 的 URL。需要修改的配置项如下：

```yaml
# /etc/headscale/config.yaml
derp:
  # List of externally available DERP maps encoded in JSON
  urls:
    - https://xxx.xxx.xxx/derper.json
    - https://controlplane.tailscale.com/derpmap/default

  # Locally available DERP map files encoded in YAML
  #
  # This option is mostly interesting for people hosting
  # their own DERP servers:
  # https://tailscale.com/kb/1118/custom-derp-servers/
  #
  # paths:
  #   - /etc/headscale/derp-example.yaml

  # If enabled, a worker will be set up to periodically
  # refresh the given sources and update the derpmap
  # will be set up.
  auto_update_enabled: true

  # How often should we check for DERP updates?
  update_frequency: 24h
```

测试连通性

```yaml
# tailscale netcheck
Report:
        * UDP: true
        * IPv4: yes, xxx.xxx.xxx:xxxx
        * IPv6: no, but OS has support
        * MappingVariesByDestIP: false
        * HairPinning: false
        * PortMapping: UPnP, NAT-PMP, PCP
        * CaptivePortal: false
        * Nearest DERP: China gz
        * DERP latency:
```

## 开启Derper验证

默认情况下 DERP 服务器是可以被白嫖的，只要别人知道了你的 DERP 服务器的地址和端口，就可以为他所用。如果你的服务器是个小水管，用的人多了可能会把你撑爆，因此我们需要修改配置来防止被白嫖。

>特别声明：只有使用域名的方式才可以通过认证防止被白嫖，使用纯 IP 的方式无法防白嫖，你只能小心翼翼地隐藏好你的 IP 和端口，不能让别人知道。

只需要做两件事情：

1、在 DERP 服务器上安装 Tailscale。

在 DERP 服务所在的主机上安装 Tailscale 客户端，**启动 tailscaled 进程**。如果使用Docker搭建需要将进程挂载进容器中。

```yaml
    volumes:
      - /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock
```

2、Derper启动参数中 `DERP_VERIFY_CLIENTS` 改为`true`

```yaml
      # verify clients to this DERP server through a local tailscaled instance
      DERP_VERIFY_CLIENTS: "true"
```

## 反向代理

### Nginx

```json
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
        proxy_pass https://127.0.0.1:8443;
        
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # 加上这 2 行配置即可解决
        proxy_ssl_server_name on;
        proxy_ssl_name $host;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_redirect http:// https://;
    }
}
```
