# 配置解析—组织身份文件

## 组织身份文件解析

### 1. 概述

Fabric 网络通过证书和密钥来管理和认证成员身份，经常需要生成证书文件。通常这些操作可以使用 PKI 服务（如 Fabric-CA）或者 OpenSSL 工具来实现（针对单个证书的签发）。

为了方便批量管理组织证书，Fabric 基于 Go 语言的标准 crypto 库提供了 `cryptogen`（crypto generator）工具。cryptogen 可以根据指定配置批量生成所需要的密钥和证书文件，或查看配置模板信息。

### 2. cryptogen 工具

```sh
usage: cryptogen [<flags>] <command> [<args> ...]

Utility for generating Hyperledger Fabric key material

Flags:
  --help  Show context-sensitive help (also try --help-long and --help-man).

Commands:
  help [<command>...]
    Show help.

  generate [<flags>]
    Generate key material

  showtemplate
    Show the default configuration template

  version
    Show version information

  extend [<flags>]
    Extend existing network
```

| 命令         | 参数                                                         | 作用             |
| ------------ | ------------------------------------------------------------ | ---------------- |
| generate     | --output (生成的身份信息文件存放目录，默认为 crypto-config) ， --config (使用的 crypto-config.yaml 文件路径) | N/A              |
| showtemplate | N/A                                                          | 显示默认配置模板 |
| extend       | --input (身份信息文件存放目录，默认为 crypto-config) ， --config (使用的 crypto-config.yaml 文件路径) | N/A              |
| version      | N/A                                                          | 查看版本信息     |

`showtemplate` 会展示一个 `crypto-config.yaml` 配置文件模板，一般情况下，配置文件中会指定网络的拓扑结构，还可以指定两类组织的信息：

● OrdererOrgs，构成 Orderer 集群的节点所属组织。

● PeerOrgs，构成 Peer 集群的节点所属组织。

> 使用下面命令将 `showtemplate` 命令输出的内容输出到一个文件中:

```sh
cryptogen showtemplate > crypto-config.yaml
```

### 3. crypto-config.yaml

| 配置项           | 作用                                                         | 默认值 |
| ---------------- | ------------------------------------------------------------ | ------ |
| name             | 组织的名称                                                   | N/A    |
| domain           | 组织的域名                                                   | N/A    |
| EnableNodeOUs    | 是否启用 NodeOU，指定是否根据证书中的 OU 域来判断持有者角色  | false  |
| CA               | 组织的 CA 地址，包括 Hostname 域                             |        |
| Specs.Hostname   | 可以直接用 Hostname 多次指定若干节点                         | N/A    |
| Specs.CommonName | (可选配置) 指定 CN 的模板或显式覆盖。                      | N/A    |
| Specs.SANS       | 这里可以配置节点支持的多个域名或者 IP                        | N/A    |
| Template         | 指定自动生成节点的个数                                       | 1      |
| Users.Count      | 顺序生成指定个数的普通用户（除默认的 Admin 用户外）          | 1      |

> SAN (Subject Alternative Name) 是 SSL 标准 x509 中定义的一个扩展。使用了 SAN 字段的 SSL 证书，可以扩展此证书支持的域名，使得一个证书可以支持多个不同域名的解析。SAN SSL 证书使您可以通过在注册时添加到 SAN 字段来确保域名和子域，本地主机名和 IP 地址的安全性，证书的安装过程和管理也更易于管理，也就是我们常说的多域名 SSL 证书。

- crypto-config.yam 文件示例

::: details

```yaml

# ---------------------------------------------------------------------------
# "OrdererOrgs" - Definition of organizations managing orderer nodes
# ---------------------------------------------------------------------------
OrdererOrgs:
  # ---------------------------------------------------------------------------
  # Orderer
  # ---------------------------------------------------------------------------
  - Name: Orderer
    Domain: example.com
    EnableNodeOUs: false

    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete description
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer

# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org1
  # ---------------------------------------------------------------------------
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: false

    # ---------------------------------------------------------------------------
    # "CA"
    # ---------------------------------------------------------------------------
    # Uncomment this section to enable the explicit definition of the CA for this
    # organization.  This entry is a Spec.  See "Specs" section below for details.
    # ---------------------------------------------------------------------------
    # CA:
    #    Hostname: ca # implicitly ca.org1.example.com
    #    Country: US
    #    Province: California
    #    Locality: San Francisco
    #    OrganizationalUnit: Hyperledger Fabric
    #    StreetAddress: address for org # default nil
    #    PostalCode: postalCode for org # default nil

    # ---------------------------------------------------------------------------
    # "Specs"
    # ---------------------------------------------------------------------------
    # Uncomment this section to enable the explicit definition of hosts in your
    # configuration.  Most users will want to use Template, below
    #
    # Specs is an array of Spec entries.  Each Spec entry consists of two fields:
    #   - Hostname:   (Required) The desired hostname, sans the domain.
    #   - CommonName: (Optional) Specifies the template or explicit override for
    #                 the CN.  By default, this is the template:
    #
    #                              "{{.Hostname}}.{{.Domain}}"
    #
    #                 which obtains its values from the Spec.Hostname and
    #                 Org.Domain, respectively.
    #   - SANS:       (Optional) Specifies one or more Subject Alternative Names
    #                 to be set in the resulting x509. Accepts template
    #                 variables {{.Hostname}}, {{.Domain}}, {{.CommonName}}. IP
    #                 addresses provided here will be properly recognized. Other
    #                 values will be taken as DNS names.
    #                 NOTE: Two implicit entries are created for you:
    #                     - {{ .CommonName }}
    #                     - {{ .Hostname }}
    # ---------------------------------------------------------------------------
    # Specs:
    #   - Hostname: foo # implicitly "foo.org1.example.com"
    #     CommonName: foo27.org5.example.com # overrides Hostname-based FQDN set above
    #     SANS:
    #       - "bar.{{.Domain}}"
    #       - "altfoo.{{.Domain}}"
    #       - "{{.Hostname}}.org6.net"
    #       - 172.16.10.31
    #   - Hostname: bar
    #   - Hostname: baz

    # ---------------------------------------------------------------------------
    # "Template"
    # ---------------------------------------------------------------------------
    # Allows for the definition of 1 or more hosts that are created sequentially
    # from a template. By default, this looks like "peer%d" from 0 to Count-1.
    # You may override the number of nodes (Count), the starting index (Start)
    # or the template used to construct the name (Hostname).
    #
    # Note: Template and Specs are not mutually exclusive.  You may define both
    # sections and the aggregate nodes will be created for you.  Take care with
    # name collisions
    # ---------------------------------------------------------------------------
    Template:
      Count: 1
      # Start: 5
      # Hostname: {{.Prefix}}{{.Index}} # default
      # SANS:
      #   - "{{.Hostname}}.alt.{{.Domain}}"

    # ---------------------------------------------------------------------------
    # "Users"
    # ---------------------------------------------------------------------------
    # Count: The number of user accounts _in addition_ to Admin
    # ---------------------------------------------------------------------------
    Users:
      Count: 1

  # ---------------------------------------------------------------------------
  # Org2: See "Org1" for full specification
  # ---------------------------------------------------------------------------
  - Name: Org2
    Domain: org2.example.com
    EnableNodeOUs: false
    Template:
      Count: 1
    Users:
      Count: 1
      
```

:::

### 4. 生成网络身份信息文件

- **组织**（例如：org1.example.com/） 相关身份文件目录 ：

| 目录            | 存放文件说明                                                 |
| --------------- | ------------------------------------------------------------ |
| ca              | 存放组织的 CA 根证书和对应的私钥文件，默认采用 ECDSA 算法，证书为自签名。组织内的实体将该根证书作为证书根 |
| msp             | 存放代表该组织的身份信息，有时还存放中间层证书和运维证书     |
| msp/admincerts  | 组织管理员的身份验证证书，被根证书签名                       |
| msp/cacerts     | 组织信任的 CA 根证书，同 ca 目录下文件                       |
| msp/tlscacerts  | 用于 TLS 验证的信任的 CA 证书，自签名                        |
| msp/config.yaml | 指定是否开启 OU（OrganizationalUnit），以及存放组织根证书路径和 OU 识别关键字 |
| users/Admin     | 管理员用户的信息，包括其 MSP 证书和 TLS 证书                 |
| users/Admin/msp | 存放代表身份的相关证书和私钥文件                             |
| users/Admin/tls | 存放与 tls 相关的证书和私钥                                  |

> 其他用户身份文件目录和 Admin 类似。

- **组织节点**（例如：org1.example.com/peers/peer0.org1.example.com/ ） 相关身份文件目录 ：

| 目录           | 存放文件说明                                                 |
| -------------- | ------------------------------------------------------------ |
| msp            | 存放代表身份的相关证书和私钥文件                             |
| msp/admincerts | 该 Peer 认可的管理员的身份证书。Peer 将基于这里的证书来认证交易签署者是否为管理员身份。这里默认存放有组织 Admin 用户的身份证书。 |
| msp/cacerts    | 存放组织的 CA 根证书                                         |
| msp/keystore   | 节点的身份私钥，用来签名                                     |
| msp/signcerts  | 验证本节点签名的证书，被组织根证书签名                       |
| msp/tlscacerts | TLS 连接用的 CA 证书，默认只有组织 TLSCA 证书                |
| msp/ig.yaml    | 指定是否开启 OU，以及存放组织根证书路径和 OU 识别关键字      |
| tls            | 存放与 tls 相关的证书和私钥                                  |
| tls/ca.crt     | 组织的 TLS CA 证书                                           |
| tls/server.crt | 验证本节点签名的证书，被组织根证书签名                       |
| tls/server.key | 本节点的 TLS 私钥，用来签名                                  |

> 命令

```sh
./cryptogen generate --config crypto-config.yaml --output crypto-config
```

crypto-config 目录结构：

::: details

```sh
crypto-config
├── ordererOrganizations
│   └── example.com
│       ├── ca
│       │   ├── ca.example.com-cert.pem
│       │   └── priv_sk
│       ├── msp
│       │   ├── admincerts
│       │   │   └── Admin@example.com-cert.pem
│       │   ├── cacerts
│       │   │   └── ca.example.com-cert.pem
│       │   └── tlscacerts
│       │       └── tlsca.example.com-cert.pem
│       ├── orderers
│       │   └── orderer.example.com
│       │       ├── msp
│       │       │   ├── admincerts
│       │       │   │   └── Admin@example.com-cert.pem
│       │       │   ├── cacerts
│       │       │   │   └── ca.example.com-cert.pem
│       │       │   ├── keystore
│       │       │   │   └── priv_sk
│       │       │   ├── signcerts
│       │       │   │   └── orderer.example.com-cert.pem
│       │       │   └── tlscacerts
│       │       │       └── tlsca.example.com-cert.pem
│       │       └── tls
│       │           ├── ca.crt
│       │           ├── server.crt
│       │           └── server.key
│       ├── tlsca
│       │   ├── priv_sk
│       │   └── tlsca.example.com-cert.pem
│       └── users
│           └── Admin@example.com
│               ├── msp
│               │   ├── admincerts
│               │   │   └── Admin@example.com-cert.pem
│               │   ├── cacerts
│               │   │   └── ca.example.com-cert.pem
│               │   ├── keystore
│               │   │   └── priv_sk
│               │   ├── signcerts
│               │   │   └── Admin@example.com-cert.pem
│               │   └── tlscacerts
│               │       └── tlsca.example.com-cert.pem
│               └── tls
│                   ├── ca.crt
│                   ├── client.crt
│                   └── client.key
└── peerOrganizations
    ├── org1.example.com
    │   ├── ca
    │   │   ├── ca.org1.example.com-cert.pem
    │   │   └── priv_sk
    │   ├── msp
    │   │   ├── admincerts
    │   │   │   └── Admin@org1.example.com-cert.pem
    │   │   ├── cacerts
    │   │   │   └── ca.org1.example.com-cert.pem
    │   │   └── tlscacerts
    │   │       └── tlsca.org1.example.com-cert.pem
    │   ├── peers
    │   │   └── peer0.org1.example.com
    │   │       ├── msp
    │   │       │   ├── admincerts
    │   │       │   │   └── Admin@org1.example.com-cert.pem
    │   │       │   ├── cacerts
    │   │       │   │   └── ca.org1.example.com-cert.pem
    │   │       │   ├── keystore
    │   │       │   │   └── priv_sk
    │   │       │   ├── signcerts
    │   │       │   │   └── peer0.org1.example.com-cert.pem
    │   │       │   └── tlscacerts
    │   │       │       └── tlsca.org1.example.com-cert.pem
    │   │       └── tls
    │   │           ├── ca.crt
    │   │           ├── server.crt
    │   │           └── server.key
    │   ├── tlsca
    │   │   ├── priv_sk
    │   │   └── tlsca.org1.example.com-cert.pem
    │   └── users
    │       ├── Admin@org1.example.com
    │       │   ├── msp
    │       │   │   ├── admincerts
    │       │   │   │   └── Admin@org1.example.com-cert.pem
    │       │   │   ├── cacerts
    │       │   │   │   └── ca.org1.example.com-cert.pem
    │       │   │   ├── keystore
    │       │   │   │   └── priv_sk
    │       │   │   ├── signcerts
    │       │   │   │   └── Admin@org1.example.com-cert.pem
    │       │   │   └── tlscacerts
    │       │   │       └── tlsca.org1.example.com-cert.pem
    │       │   └── tls
    │       │       ├── ca.crt
    │       │       ├── client.crt
    │       │       └── client.key
    │       └── User1@org1.example.com
    │           ├── msp
    │           │   ├── admincerts
    │           │   │   └── User1@org1.example.com-cert.pem
    │           │   ├── cacerts
    │           │   │   └── ca.org1.example.com-cert.pem
    │           │   ├── keystore
    │           │   │   └── priv_sk
    │           │   ├── signcerts
    │           │   │   └── User1@org1.example.com-cert.pem
    │           │   └── tlscacerts
    │           │       └── tlsca.org1.example.com-cert.pem
    │           └── tls
    │               ├── ca.crt
    │               ├── client.crt
    │               └── client.key
    └── org2.example.com
        ├── ca
        │   ├── ca.org2.example.com-cert.pem
        │   └── priv_sk
        ├── msp
        │   ├── admincerts
        │   │   └── Admin@org2.example.com-cert.pem
        │   ├── cacerts
        │   │   └── ca.org2.example.com-cert.pem
        │   └── tlscacerts
        │       └── tlsca.org2.example.com-cert.pem
        ├── peers
        │   └── peer0.org2.example.com
        │       ├── msp
        │       │   ├── admincerts
        │       │   │   └── Admin@org2.example.com-cert.pem
        │       │   ├── cacerts
        │       │   │   └── ca.org2.example.com-cert.pem
        │       │   ├── keystore
        │       │   │   └── priv_sk
        │       │   ├── signcerts
        │       │   │   └── peer0.org2.example.com-cert.pem
        │       │   └── tlscacerts
        │       │       └── tlsca.org2.example.com-cert.pem
        │       └── tls
        │           ├── ca.crt
        │           ├── server.crt
        │           └── server.key
        ├── tlsca
        │   ├── priv_sk
        │   └── tlsca.org2.example.com-cert.pem
        └── users
            ├── Admin@org2.example.com
            │   ├── msp
            │   │   ├── admincerts
            │   │   │   └── Admin@org2.example.com-cert.pem
            │   │   ├── cacerts
            │   │   │   └── ca.org2.example.com-cert.pem
            │   │   ├── keystore
            │   │   │   └── priv_sk
            │   │   ├── signcerts
            │   │   │   └── Admin@org2.example.com-cert.pem
            │   │   └── tlscacerts
            │   │       └── tlsca.org2.example.com-cert.pem
            │   └── tls
            │       ├── ca.crt
            │       ├── client.crt
            │       └── client.key
            └── User1@org2.example.com
                ├── msp
                │   ├── admincerts
                │   │   └── User1@org2.example.com-cert.pem
                │   ├── cacerts
                │   │   └── ca.org2.example.com-cert.pem
                │   ├── keystore
                │   │   └── priv_sk
                │   ├── signcerts
                │   │   └── User1@org2.example.com-cert.pem
                │   └── tlscacerts
                │       └── tlsca.org2.example.com-cert.pem
                └── tls
                    ├── ca.crt
                    ├── client.crt
                    └── client.key
```

:::
