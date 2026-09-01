# 生产网络—生成身份文件

## 生产网络—生成身份文件

### 一、前期准备

#### 1. 下载`hyperledger-fabric-linux-amd64-2.4.7.tar.gz`

```sh
# 创建fabric文件夹
mkdir /root/fabric
# 解压
tar -zxvf hyperledger-fabric-linux-amd64-2.4.7.tar.gz -C /root/fabric
```

- 文件结构

```sh
├── bin
│   ├── configtxgen
│   ├── configtxlator
│   ├── cryptogen
│   ├── discover
│   ├── ledgerutil
│   ├── orderer
│   ├── osnadmin
│   └── peer
├── builders
│   └── ccaas
│       └── bin
│           ├── build
│           ├── detect
│           └── release
└── config
    ├── configtx.yaml
    ├── core.yaml
    └── orderer.yaml
```

#### 2. 规划网络拓扑

>3 个 orderer 节点；2个组织节点org1和org2；
>
>org1 下有两个 peer 节点， peer0 和 peer1;
>
>org2 下有两个 peer 节点， peer0 和 peer1;

### 二、准备 crypto-config.yaml 配置文件

使用bin目录下的`cryptogen`生成`crypto-config.yaml`模板文件

```sh
./cryptogen showtemplate > ../crypto-config.yaml
```

修改`crypto-config.yaml`模板文件

```sh
vi crypto-config.yaml
```

#### `crypto-config.yaml`模板文件

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
    EnableNodeOUs: false	#修改为true

    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete description
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer	#添加其他orderer

# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org1
  # ---------------------------------------------------------------------------
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: false	#修改为true

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
      Count: 1	#根据实际情况修改
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
    EnableNodeOUs: false	#修改为true
    Template:
      Count: 1	#根据实际情况修改
    Users:
      Count: 1
```

:::

#### 按照规划的网络拓扑修改后的`crypto-config.yaml`文件

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
    EnableNodeOUs: true

    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete description
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer0
      - Hostname: orderer1
      - Hostname: orderer2

# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org1
  # ---------------------------------------------------------------------------
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: true

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
      Count: 2
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
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

:::

### 三、生成组织身份文件

根据 `crypto-config.yaml` 配置文件生成组织身份文件并保存在 ../crypto-config 目录下。

```sh
./cryptogen generate --config=../crypto-config.yaml --output ../crypto-config
```

用户修改配置后，还可以通过 extend 子命令来更新 `crypto-config` 目录:

```sh
./cryptogen extend --config=../crypto-config.yaml --input ../crypto-config
```

得到的 `crypto-config` 目录结构如下：

::: details

```tex
crypto-config
├── ordererOrganizations
│   └── example.com
│       ├── ca
│       │   ├── ca.example.com-cert.pem
│       │   └── priv_sk
│       ├── msp
│       │   ├── admincerts
│       │   ├── cacerts
│       │   │   └── ca.example.com-cert.pem
│       │   ├── config.yaml
│       │   └── tlscacerts
│       │       └── tlsca.example.com-cert.pem
│       ├── orderers
│       │   ├── orderer0.example.com
│       │   │   ├── msp
│       │   │   │   ├── admincerts
│       │   │   │   ├── cacerts
│       │   │   │   │   └── ca.example.com-cert.pem
│       │   │   │   ├── config.yaml
│       │   │   │   ├── keystore
│       │   │   │   │   └── priv_sk
│       │   │   │   ├── signcerts
│       │   │   │   │   └── orderer0.example.com-cert.pem
│       │   │   │   └── tlscacerts
│       │   │   │       └── tlsca.example.com-cert.pem
│       │   │   └── tls
│       │   │       ├── ca.crt
│       │   │       ├── server.crt
│       │   │       └── server.key
│       │   ├── orderer1.example.com
│       │   │   ├── msp
│       │   │   │   ├── admincerts
│       │   │   │   ├── cacerts
│       │   │   │   │   └── ca.example.com-cert.pem
│       │   │   │   ├── config.yaml
│       │   │   │   ├── keystore
│       │   │   │   │   └── priv_sk
│       │   │   │   ├── signcerts
│       │   │   │   │   └── orderer1.example.com-cert.pem
│       │   │   │   └── tlscacerts
│       │   │   │       └── tlsca.example.com-cert.pem
│       │   │   └── tls
│       │   │       ├── ca.crt
│       │   │       ├── server.crt
│       │   │       └── server.key
│       │   └── orderer2.example.com
│       │       ├── msp
│       │       │   ├── admincerts
│       │       │   ├── cacerts
│       │       │   │   └── ca.example.com-cert.pem
│       │       │   ├── config.yaml
│       │       │   ├── keystore
│       │       │   │   └── priv_sk
│       │       │   ├── signcerts
│       │       │   │   └── orderer2.example.com-cert.pem
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
│               │   ├── cacerts
│               │   │   └── ca.example.com-cert.pem
│               │   ├── config.yaml
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
    │   │   ├── cacerts
    │   │   │   └── ca.org1.example.com-cert.pem
    │   │   ├── config.yaml
    │   │   └── tlscacerts
    │   │       └── tlsca.org1.example.com-cert.pem
    │   ├── peers
    │   │   ├── peer0.org1.example.com
    │   │   │   ├── msp
    │   │   │   │   ├── admincerts
    │   │   │   │   ├── cacerts
    │   │   │   │   │   └── ca.org1.example.com-cert.pem
    │   │   │   │   ├── config.yaml
    │   │   │   │   ├── keystore
    │   │   │   │   │   └── priv_sk
    │   │   │   │   ├── signcerts
    │   │   │   │   │   └── peer0.org1.example.com-cert.pem
    │   │   │   │   └── tlscacerts
    │   │   │   │       └── tlsca.org1.example.com-cert.pem
    │   │   │   └── tls
    │   │   │       ├── ca.crt
    │   │   │       ├── server.crt
    │   │   │       └── server.key
    │   │   └── peer1.org1.example.com
    │   │       ├── msp
    │   │       │   ├── admincerts
    │   │       │   ├── cacerts
    │   │       │   │   └── ca.org1.example.com-cert.pem
    │   │       │   ├── config.yaml
    │   │       │   ├── keystore
    │   │       │   │   └── priv_sk
    │   │       │   ├── signcerts
    │   │       │   │   └── peer1.org1.example.com-cert.pem
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
    │       │   │   ├── cacerts
    │       │   │   │   └── ca.org1.example.com-cert.pem
    │       │   │   ├── config.yaml
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
    │           │   ├── cacerts
    │           │   │   └── ca.org1.example.com-cert.pem
    │           │   ├── config.yaml
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
        │   ├── cacerts
        │   │   └── ca.org2.example.com-cert.pem
        │   ├── config.yaml
        │   └── tlscacerts
        │       └── tlsca.org2.example.com-cert.pem
        ├── peers
        │   ├── peer0.org2.example.com
        │   │   ├── msp
        │   │   │   ├── admincerts
        │   │   │   ├── cacerts
        │   │   │   │   └── ca.org2.example.com-cert.pem
        │   │   │   ├── config.yaml
        │   │   │   ├── keystore
        │   │   │   │   └── priv_sk
        │   │   │   ├── signcerts
        │   │   │   │   └── peer0.org2.example.com-cert.pem
        │   │   │   └── tlscacerts
        │   │   │       └── tlsca.org2.example.com-cert.pem
        │   │   └── tls
        │   │       ├── ca.crt
        │   │       ├── server.crt
        │   │       └── server.key
        │   └── peer1.org2.example.com
        │       ├── msp
        │       │   ├── admincerts
        │       │   ├── cacerts
        │       │   │   └── ca.org2.example.com-cert.pem
        │       │   ├── config.yaml
        │       │   ├── keystore
        │       │   │   └── priv_sk
        │       │   ├── signcerts
        │       │   │   └── peer1.org2.example.com-cert.pem
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
            │   │   ├── cacerts
            │   │   │   └── ca.org2.example.com-cert.pem
            │   │   ├── config.yaml
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
                │   ├── cacerts
                │   │   └── ca.org2.example.com-cert.pem
                │   ├── config.yaml
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

### 四、生成系统通道初始区块

> 可以使用 `configtxgen` 工具生成，生成过程依赖 `configtx.yaml` 配置文件，`configtx.yaml` 配置文件定义了整个网络中的相关配置和拓扑结构信息 。

#### `configtx.yaml` 配置文件

::: details

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

---
################################################################################
#
#   ORGANIZATIONS
#
#   This section defines the organizational identities that can be referenced
#   in the configuration profiles.
#
################################################################################
Organizations:

    # SampleOrg defines an MSP using the sampleconfig. It should never be used
    # in production but may be used as a template for other definitions.
    #定义排序节点名称
    - &SampleOrg
        # Name is the key by which this org will be referenced in channel
        # configuration transactions.
        # Name can include alphanumeric characters as well as dots and dashes.
        #定义排序节点名称
        Name: SampleOrg

        # SkipAsForeign can be set to true for org definitions which are to be
        # inherited from the orderer system channel during channel creation.  This
        # is especially useful when an admin of a single org without access to the
        # MSP directories of the other orgs wishes to create a channel.  Note
        # this property must always be set to false for orgs included in block
        # creation.
        SkipAsForeign: false

        # ID is the key by which this org's MSP definition will be referenced.
        # ID can include alphanumeric characters as well as dots and dashes.
        #OrdererMSP
        ID: SampleOrg

        # MSPDir is the filesystem path which contains the MSP configuration.
        #指定crypto-config/ordererOrganizations/example.com/msp
        MSPDir: msp

        # Policies defines the set of policies at this level of the config tree
        # For organization policies, their canonical path is usually
        #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
        Policies: &SampleOrgPolicies
            Readers:
                Type: Signature
                #与上面ID一致
                Rule: "OR('SampleOrg.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.peer', 'SampleOrg.client')"
            Writers:
                Type: Signature
                #与上面ID一致
                Rule: "OR('SampleOrg.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.client')"
            Admins:
                Type: Signature
                #与上面ID一致
                Rule: "OR('SampleOrg.admin')"
            Endorsement:
                Type: Signature
                #与上面ID一致
                Rule: "OR('SampleOrg.member')"

        # OrdererEndpoints is a list of all orderers this org runs which clients
        # and peers may to connect to to push transactions and receive blocks respectively.
        OrdererEndpoints:
        #根据实际情况修改
            - "127.0.0.1:7050"

        # AnchorPeers defines the location of peers which can be used for
        # cross-org gossip communication.
        #
        # NOTE: this value should only be set when using the deprecated
        # `configtxgen --outputAnchorPeersUpdate` command. It is recommended
        # to instead use the channel configuration update process to set the
        # anchor peers for each organization.
        #定义锚节点，orderer不需要
        AnchorPeers:
            - Host: 127.0.0.1
              Port: 7051

################################################################################
#
#   CAPABILITIES
#
#   This section defines the capabilities of fabric network. This is a new
#   concept as of v1.1.0 and should not be utilized in mixed networks with
#   v1.0.x peers and orderers.  Capabilities define features which must be
#   present in a fabric binary for that binary to safely participate in the
#   fabric network.  For instance, if a new MSP type is added, newer binaries
#   might recognize and validate the signatures from this type, while older
#   binaries without this support would be unable to validate those
#   transactions.  This could lead to different versions of the fabric binaries
#   having different world states.  Instead, defining a capability for a channel
#   informs those binaries without this capability that they must cease
#   processing transactions until they have been upgraded.  For v1.0.x if any
#   capabilities are defined (including a map with all capabilities turned off)
#   then the v1.0.x peer will deliberately crash.
#
################################################################################
Capabilities:
    # Channel capabilities apply to both the orderers and the peers and must be
    # supported by both.
    # Set the value of the capability to true to require it.
    Channel: &ChannelCapabilities
        # V2.0 for Channel is a catchall flag for behavior which has been
        # determined to be desired for all orderers and peers running at the v2.0.0
        # level, but which would be incompatible with orderers and peers from
        # prior releases.
        # Prior to enabling V2.0 channel capabilities, ensure that all
        # orderers and peers on a channel are at v2.0.0 or later.
        V2_0: true

    # Orderer capabilities apply only to the orderers, and may be safely
    # used with prior release peers.
    # Set the value of the capability to true to require it.
    Orderer: &OrdererCapabilities
        # V1.1 for Orderer is a catchall flag for behavior which has been
        # determined to be desired for all orderers running at the v1.1.x
        # level, but which would be incompatible with orderers from prior releases.
        # Prior to enabling V2.0 orderer capabilities, ensure that all
        # orderers on a channel are at v2.0.0 or later.
        V2_0: true

    # Application capabilities apply only to the peer network, and may be safely
    # used with prior release orderers.
    # Set the value of the capability to true to require it.
    Application: &ApplicationCapabilities
        # V2.0 for Application enables the new non-backwards compatible
        # features and fixes of fabric v2.0.
        # Prior to enabling V2.0 orderer capabilities, ensure that all
        # orderers on a channel are at v2.0.0 or later.
        V2_0: true

################################################################################
#
#   APPLICATION
#
#   This section defines the values to encode into a config transaction or
#   genesis block for application-related parameters.
#
################################################################################
Application: &ApplicationDefaults
    ACLs: &ACLsDefault
        # This section provides defaults for policies for various resources
        # in the system. These "resources" could be functions on system chaincodes
        # (e.g., "GetBlockByNumber" on the "qscc" system chaincode) or other resources
        # (e.g.,who can receive Block events). This section does NOT specify the resource's
        # definition or API, but just the ACL policy for it.
        #
        # Users can override these defaults with their own policy mapping by defining the
        # mapping under ACLs in their channel definition

        #---New Lifecycle System Chaincode (_lifecycle) function to policy mapping for access control--#

        # ACL policy for _lifecycle's "CheckCommitReadiness" function
        _lifecycle/CheckCommitReadiness: /Channel/Application/Writers

        # ACL policy for _lifecycle's "CommitChaincodeDefinition" function
        _lifecycle/CommitChaincodeDefinition: /Channel/Application/Writers

        # ACL policy for _lifecycle's "QueryChaincodeDefinition" function
        _lifecycle/QueryChaincodeDefinition: /Channel/Application/Writers

        # ACL policy for _lifecycle's "QueryChaincodeDefinitions" function
        _lifecycle/QueryChaincodeDefinitions: /Channel/Application/Writers

        #---Lifecycle System Chaincode (lscc) function to policy mapping for access control---#

        # ACL policy for lscc's "getid" function
        lscc/ChaincodeExists: /Channel/Application/Readers

        # ACL policy for lscc's "getdepspec" function
        lscc/GetDeploymentSpec: /Channel/Application/Readers

        # ACL policy for lscc's "getccdata" function
        lscc/GetChaincodeData: /Channel/Application/Readers

        # ACL Policy for lscc's "getchaincodes" function
        lscc/GetInstantiatedChaincodes: /Channel/Application/Readers

        #---Query System Chaincode (qscc) function to policy mapping for access control---#

        # ACL policy for qscc's "GetChainInfo" function
        qscc/GetChainInfo: /Channel/Application/Readers

        # ACL policy for qscc's "GetBlockByNumber" function
        qscc/GetBlockByNumber: /Channel/Application/Readers

        # ACL policy for qscc's  "GetBlockByHash" function
        qscc/GetBlockByHash: /Channel/Application/Readers

        # ACL policy for qscc's "GetTransactionByID" function
        qscc/GetTransactionByID: /Channel/Application/Readers

        # ACL policy for qscc's "GetBlockByTxID" function
        qscc/GetBlockByTxID: /Channel/Application/Readers

        #---Configuration System Chaincode (cscc) function to policy mapping for access control---#

        # ACL policy for cscc's "GetConfigBlock" function
        cscc/GetConfigBlock: /Channel/Application/Readers

        # ACL policy for cscc's "GetChannelConfig" function
        cscc/GetChannelConfig: /Channel/Application/Readers

        #---Miscellaneous peer function to policy mapping for access control---#

        # ACL policy for invoking chaincodes on peer
        peer/Propose: /Channel/Application/Writers

        # ACL policy for chaincode to chaincode invocation
        peer/ChaincodeToChaincode: /Channel/Application/Writers

        #---Events resource to policy mapping for access control###---#

        # ACL policy for sending block events
        event/Block: /Channel/Application/Readers

        # ACL policy for sending filtered block events
        event/FilteredBlock: /Channel/Application/Readers

    # Organizations lists the orgs participating on the application side of the
    # network.
    Organizations:

    # Policies defines the set of policies at this level of the config tree
    # For Application policies, their canonical path is
    #   /Channel/Application/<PolicyName>
    Policies: &ApplicationDefaultPolicies
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Endorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"

    # Capabilities describes the application level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *ApplicationCapabilities

################################################################################
#
#   ORDERER
#
#   This section defines the values to encode into a config transaction or
#   genesis block for orderer related parameters.
#
################################################################################
Orderer: &OrdererDefaults

    # Orderer Type: The orderer implementation to start.
    # Available types are "solo", "kafka" and "etcdraft".
    OrdererType: solo

    # Addresses used to be the list of orderer addresses that clients and peers
    # could connect to.  However, this does not allow clients to associate orderer
    # addresses and orderer organizations which can be useful for things such
    # as TLS validation.  The preferred way to specify orderer addresses is now
    # to include the OrdererEndpoints item in your org definition
    Addresses:
        # - 127.0.0.1:7050

    # Batch Timeout: The amount of time to wait before creating a batch.
    BatchTimeout: 2s

    # Batch Size: Controls the number of messages batched into a block.
    # The orderer views messages opaquely, but typically, messages may
    # be considered to be Fabric transactions.  The 'batch' is the group
    # of messages in the 'data' field of the block.  Blocks will be a few kb
    # larger than the batch size, when signatures, hashes, and other metadata
    # is applied.
    BatchSize:

        # Max Message Count: The maximum number of messages to permit in a
        # batch.  No block will contain more than this number of messages.
        MaxMessageCount: 500

        # Absolute Max Bytes: The absolute maximum number of bytes allowed for
        # the serialized messages in a batch. The maximum block size is this value
        # plus the size of the associated metadata (usually a few KB depending
        # upon the size of the signing identities). Any transaction larger than
        # this value will be rejected by ordering.
        # It is recommended not to exceed 49 MB, given the default grpc max message size of 100 MB
        # configured on orderer and peer nodes (and allowing for message expansion during communication).
        AbsoluteMaxBytes: 10 MB

        # Preferred Max Bytes: The preferred maximum number of bytes allowed
        # for the serialized messages in a batch. Roughly, this field may be considered
        # the best effort maximum size of a batch. A batch will fill with messages
        # until this size is reached (or the max message count, or batch timeout is
        # exceeded).  If adding a new message to the batch would cause the batch to
        # exceed the preferred max bytes, then the current batch is closed and written
        # to a block, and a new batch containing the new message is created.  If a
        # message larger than the preferred max bytes is received, then its batch
        # will contain only that message.  Because messages may be larger than
        # preferred max bytes (up to AbsoluteMaxBytes), some batches may exceed
        # the preferred max bytes, but will always contain exactly one transaction.
        PreferredMaxBytes: 2 MB

    # Max Channels is the maximum number of channels to allow on the ordering
    # network. When set to 0, this implies no maximum number of channels.
    MaxChannels: 0

    Kafka:
        # Brokers: A list of Kafka brokers to which the orderer connects. Edit
        # this list to identify the brokers of the ordering service.
        # NOTE: Use IP:port notation.
        Brokers:
            - kafka0:9092
            - kafka1:9092
            - kafka2:9092

    # EtcdRaft defines configuration which must be set when the "etcdraft"
    # orderertype is chosen.
    EtcdRaft:
        # The set of Raft replicas for this network. For the etcd/raft-based
        # implementation, we expect every replica to also be an OSN. Therefore,
        # a subset of the host:port items enumerated in this list should be
        # replicated under the Orderer.Addresses key above.
        Consenters:
            - Host: raft0.example.com
              Port: 7050
              ClientTLSCert: path/to/ClientTLSCert0
              ServerTLSCert: path/to/ServerTLSCert0
            - Host: raft1.example.com
              Port: 7050
              ClientTLSCert: path/to/ClientTLSCert1
              ServerTLSCert: path/to/ServerTLSCert1
            - Host: raft2.example.com
              Port: 7050
              ClientTLSCert: path/to/ClientTLSCert2
              ServerTLSCert: path/to/ServerTLSCert2

        # Options to be specified for all the etcd/raft nodes. The values here
        # are the defaults for all new channels and can be modified on a
        # per-channel basis via configuration updates.
        Options:
            # TickInterval is the time interval between two Node.Tick invocations.
            TickInterval: 500ms

            # ElectionTick is the number of Node.Tick invocations that must pass
            # between elections. That is, if a follower does not receive any
            # message from the leader of current term before ElectionTick has
            # elapsed, it will become candidate and start an election.
            # ElectionTick must be greater than HeartbeatTick.
            ElectionTick: 10

            # HeartbeatTick is the number of Node.Tick invocations that must
            # pass between heartbeats. That is, a leader sends heartbeat
            # messages to maintain its leadership every HeartbeatTick ticks.
            HeartbeatTick: 1

            # MaxInflightBlocks limits the max number of in-flight append messages
            # during optimistic replication phase.
            MaxInflightBlocks: 5

            # SnapshotIntervalSize defines number of bytes per which a snapshot is taken
            SnapshotIntervalSize: 16 MB

    # Organizations lists the orgs participating on the orderer side of the
    # network.
    Organizations:

    # Policies defines the set of policies at this level of the config tree
    # For Orderer policies, their canonical path is
    #   /Channel/Orderer/<PolicyName>
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        # BlockValidation specifies what signatures must be included in the block
        # from the orderer for the peer to validate it.
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"

    # Capabilities describes the orderer level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *OrdererCapabilities

################################################################################
#
#   CHANNEL
#
#   This section defines the values to encode into a config transaction or
#   genesis block for channel related parameters.
#
################################################################################
Channel: &ChannelDefaults
    # Policies defines the set of policies at this level of the config tree
    # For Channel policies, their canonical path is
    #   /Channel/<PolicyName>
    Policies:
        # Who may invoke the 'Deliver' API
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        # Who may invoke the 'Broadcast' API
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        # By default, who may modify elements at this config level
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"


    # Capabilities describes the channel level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *ChannelCapabilities

################################################################################
#
#   PROFILES
#
#   Different configuration profiles may be encoded here to be specified as
#   parameters to the configtxgen tool. The profiles which specify consortiums
#   are to be used for generating the orderer genesis block. With the correct
#   consortium members defined in the orderer genesis block, channel creation
#   requests may be generated with only the org member names and a consortium
#   name.
#
################################################################################
Profiles:

    # SampleSingleMSPSolo defines a configuration which uses the Solo orderer,
    # and contains a single MSP definition (the MSP sampleconfig).
    # The Consortium SampleConsortium has only a single member, SampleOrg.
    SampleSingleMSPSolo:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *SampleOrg
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *SampleOrg

    # SampleSingleMSPKafka defines a configuration that differs from the
    # SampleSingleMSPSolo one only in that it uses the Kafka-based orderer.
    SampleSingleMSPKafka:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            OrdererType: kafka
            Organizations:
                - *SampleOrg
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *SampleOrg

    # SampleInsecureSolo defines a configuration which uses the Solo orderer,
    # contains no MSP definitions, and allows all transactions and channel
    # creation requests for the consortium SampleConsortium.
    SampleInsecureSolo:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
        Consortiums:
            SampleConsortium:
                Organizations:

    # SampleInsecureKafka defines a configuration that differs from the
    # SampleInsecureSolo one only in that it uses the Kafka-based orderer.
    SampleInsecureKafka:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            OrdererType: kafka
        Consortiums:
            SampleConsortium:
                Organizations:

    # SampleDevModeSolo defines a configuration which uses the Solo orderer,
    # contains the sample MSP as both orderer and consortium member, and
    # requires only basic membership for admin privileges. It also defines
    # an Application on the ordering system channel, which should usually
    # be avoided.
    SampleDevModeSolo:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Consortiums:
            SampleConsortium:
                Organizations:
                    - <<: *SampleOrg
                      Policies:
                          <<: *SampleOrgPolicies
                          Admins:
                              Type: Signature
                              Rule: "OR('SampleOrg.member')"

    # SampleDevModeKafka defines a configuration that differs from the
    # SampleDevModeSolo one only in that it uses the Kafka-based orderer.
    SampleDevModeKafka:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            OrdererType: kafka
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Consortiums:
            SampleConsortium:
                Organizations:
                    - <<: *SampleOrg
                      Policies:
                          <<: *SampleOrgPolicies
                          Admins:
                              Type: Signature
                              Rule: "OR('SampleOrg.member')"

    # SampleSingleMSPChannel defines a channel with only the sample org as a
    # member. It is designed to be used in conjunction with SampleSingleMSPSolo
    # and SampleSingleMSPKafka orderer profiles.   Note, for channel creation
    # profiles, only the 'Application' section and consortium # name are
    # considered.
    SampleSingleMSPChannel:
        <<: *ChannelDefaults
        Consortium: SampleConsortium
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - <<: *SampleOrg

    # SampleDevModeEtcdRaft defines a configuration that differs from the
    # SampleDevModeSolo one only in that it uses the etcd/raft-based orderer.
    SampleDevModeEtcdRaft:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            OrdererType: etcdraft
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Consortiums:
            SampleConsortium:
                Organizations:
                    - <<: *SampleOrg
                      Policies:
                          <<: *SampleOrgPolicies
                          Admins:
                              Type: Signature
                              Rule: "OR('SampleOrg.member')"

    # SampleAppChannelInsecureSolo defines an application channel configuration
    # which uses the Solo orderer and contains no MSP definitions.
    SampleAppChannelInsecureSolo:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
        Application:
            <<: *ApplicationDefaults

    # SampleAppChannelEtcdRaft defines an application channel configuration
    # that uses the etcd/raft-based orderer.
    SampleAppChannelEtcdRaft:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            OrdererType: etcdraft
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - <<: *SampleOrg
                  Policies:
                      <<: *SampleOrgPolicies
                      Admins:
                          Type: Signature
                          Rule: "OR('SampleOrg.member')"
```

:::

#### 修改后的`configtx.yaml`文件

::: details

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

---
################################################################################
#
#   ORGANIZATIONS
#
#   This section defines the organizational identities that can be referenced
#   in the configuration profiles.
#
################################################################################
Organizations:

    # SampleOrg defines an MSP using the sampleconfig. It should never be used
    # in production but may be used as a template for other definitions.
    - &OrdererOrg
        # Name is the key by which this org will be referenced in channel
        # configuration transactions.
        # Name can include alphanumeric characters as well as dots and dashes.
        Name: OrdererOrg

        # SkipAsForeign can be set to true for org definitions which are to be
        # inherited from the orderer system channel during channel creation.  This
        # is especially useful when an admin of a single org without access to the
        # MSP directories of the other orgs wishes to create a channel.  Note
        # this property must always be set to false for orgs included in block
        # creation.
        SkipAsForeign: false

        # ID is the key by which this org's MSP definition will be referenced.
        # ID can include alphanumeric characters as well as dots and dashes.
        ID: OrdererMSP

        # MSPDir is the filesystem path which contains the MSP configuration.
        MSPDir: /root/fabric/crypto-config/ordererOrganizations/example.com/msp

        # Policies defines the set of policies at this level of the config tree
        # For organization policies, their canonical path is usually
        #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
        Policies: 
            Readers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.peer', 'SampleOrg.client')"
            Writers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.client')"
            Admins:
                Type: Signature
                Rule: "OR('OrdererMSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"

        # OrdererEndpoints is a list of all orderers this org runs which clients
        # and peers may to connect to to push transactions and receive blocks respectively.
        OrdererEndpoints:
        #    - "127.0.0.1:7050"
            - "orderer0.example.com:7050"
            - "orderer1.example.com:8050"
            - "orderer2.example.com:9050"
            

        # AnchorPeers defines the location of peers which can be used for
        # cross-org gossip communication.
        #
        # NOTE: this value should only be set when using the deprecated
        # `configtxgen --outputAnchorPeersUpdate` command. It is recommended
        # to instead use the channel configuration update process to set the
        # anchor peers for each organization.
        # AnchorPeers:
        #     - Host: 127.0.0.1
        #       Port: 7051

    - &Org1

        Name: Org1MSP
        ID: Org1MSP
        MSPDir: /root/fabric/crypto-config/peerOrganizations/org1.example.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('Org1MSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('Org1MSP.peer')"
        AnchorPeers:
            - Host: peer0.org1.example.com
              Port: 7051


    - &Org2

        Name: Org2MSP
        ID: Org2MSP
        MSPDir: /root/fabric/crypto-config/peerOrganizations/org2.example.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('Org2MSP.admin', 'Org2MSP.peer', 'Org2MSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('Org2MSP.admin', 'Org2MSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('Org2MSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('Org2MSP.peer')"
        AnchorPeers:
            - Host: peer0.org2.example.com
              Port: 9051

################################################################################
#
#   CAPABILITIES
#
#   This section defines the capabilities of fabric network. This is a new
#   concept as of v1.1.0 and should not be utilized in mixed networks with
#   v1.0.x peers and orderers.  Capabilities define features which must be
#   present in a fabric binary for that binary to safely participate in the
#   fabric network.  For instance, if a new MSP type is added, newer binaries
#   might recognize and validate the signatures from this type, while older
#   binaries without this support would be unable to validate those
#   transactions.  This could lead to different versions of the fabric binaries
#   having different world states.  Instead, defining a capability for a channel
#   informs those binaries without this capability that they must cease
#   processing transactions until they have been upgraded.  For v1.0.x if any
#   capabilities are defined (including a map with all capabilities turned off)
#   then the v1.0.x peer will deliberately crash.
#
################################################################################
Capabilities:
    # Channel capabilities apply to both the orderers and the peers and must be
    # supported by both.
    # Set the value of the capability to true to require it.
    Channel: &ChannelCapabilities
        # V2.0 for Channel is a catchall flag for behavior which has been
        # determined to be desired for all orderers and peers running at the v2.0.0
        # level, but which would be incompatible with orderers and peers from
        # prior releases.
        # Prior to enabling V2.0 channel capabilities, ensure that all
        # orderers and peers on a channel are at v2.0.0 or later.
        V2_0: true

    # Orderer capabilities apply only to the orderers, and may be safely
    # used with prior release peers.
    # Set the value of the capability to true to require it.
    Orderer: &OrdererCapabilities
        # V1.1 for Orderer is a catchall flag for behavior which has been
        # determined to be desired for all orderers running at the v1.1.x
        # level, but which would be incompatible with orderers from prior releases.
        # Prior to enabling V2.0 orderer capabilities, ensure that all
        # orderers on a channel are at v2.0.0 or later.
        V2_0: true

    # Application capabilities apply only to the peer network, and may be safely
    # used with prior release orderers.
    # Set the value of the capability to true to require it.
    Application: &ApplicationCapabilities
        # V2.0 for Application enables the new non-backwards compatible
        # features and fixes of fabric v2.0.
        # Prior to enabling V2.0 orderer capabilities, ensure that all
        # orderers on a channel are at v2.0.0 or later.
        V2_0: true

################################################################################
#
#   APPLICATION
#
#   This section defines the values to encode into a config transaction or
#   genesis block for application-related parameters.
#
################################################################################
Application: &ApplicationDefaults
    ACLs: &ACLsDefault
        # This section provides defaults for policies for various resources
        # in the system. These "resources" could be functions on system chaincodes
        # (e.g., "GetBlockByNumber" on the "qscc" system chaincode) or other resources
        # (e.g.,who can receive Block events). This section does NOT specify the resource's
        # definition or API, but just the ACL policy for it.
        #
        # Users can override these defaults with their own policy mapping by defining the
        # mapping under ACLs in their channel definition

        #---New Lifecycle System Chaincode (_lifecycle) function to policy mapping for access control--#

        # ACL policy for _lifecycle's "CheckCommitReadiness" function
        _lifecycle/CheckCommitReadiness: /Channel/Application/Writers

        # ACL policy for _lifecycle's "CommitChaincodeDefinition" function
        _lifecycle/CommitChaincodeDefinition: /Channel/Application/Writers

        # ACL policy for _lifecycle's "QueryChaincodeDefinition" function
        _lifecycle/QueryChaincodeDefinition: /Channel/Application/Writers

        # ACL policy for _lifecycle's "QueryChaincodeDefinitions" function
        _lifecycle/QueryChaincodeDefinitions: /Channel/Application/Writers

        #---Lifecycle System Chaincode (lscc) function to policy mapping for access control---#

        # ACL policy for lscc's "getid" function
        lscc/ChaincodeExists: /Channel/Application/Readers

        # ACL policy for lscc's "getdepspec" function
        lscc/GetDeploymentSpec: /Channel/Application/Readers

        # ACL policy for lscc's "getccdata" function
        lscc/GetChaincodeData: /Channel/Application/Readers

        # ACL Policy for lscc's "getchaincodes" function
        lscc/GetInstantiatedChaincodes: /Channel/Application/Readers

        #---Query System Chaincode (qscc) function to policy mapping for access control---#

        # ACL policy for qscc's "GetChainInfo" function
        qscc/GetChainInfo: /Channel/Application/Readers

        # ACL policy for qscc's "GetBlockByNumber" function
        qscc/GetBlockByNumber: /Channel/Application/Readers

        # ACL policy for qscc's  "GetBlockByHash" function
        qscc/GetBlockByHash: /Channel/Application/Readers

        # ACL policy for qscc's "GetTransactionByID" function
        qscc/GetTransactionByID: /Channel/Application/Readers

        # ACL policy for qscc's "GetBlockByTxID" function
        qscc/GetBlockByTxID: /Channel/Application/Readers

        #---Configuration System Chaincode (cscc) function to policy mapping for access control---#

        # ACL policy for cscc's "GetConfigBlock" function
        cscc/GetConfigBlock: /Channel/Application/Readers

        # ACL policy for cscc's "GetChannelConfig" function
        cscc/GetChannelConfig: /Channel/Application/Readers

        #---Miscellaneous peer function to policy mapping for access control---#

        # ACL policy for invoking chaincodes on peer
        peer/Propose: /Channel/Application/Writers

        # ACL policy for chaincode to chaincode invocation
        peer/ChaincodeToChaincode: /Channel/Application/Writers

        #---Events resource to policy mapping for access control###---#

        # ACL policy for sending block events
        event/Block: /Channel/Application/Readers

        # ACL policy for sending filtered block events
        event/FilteredBlock: /Channel/Application/Readers

    # Organizations lists the orgs participating on the application side of the
    # network.
    Organizations:

    # Policies defines the set of policies at this level of the config tree
    # For Application policies, their canonical path is
    #   /Channel/Application/<PolicyName>
    Policies: &ApplicationDefaultPolicies
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Endorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"

    # Capabilities describes the application level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *ApplicationCapabilities

################################################################################
#
#   ORDERER
#
#   This section defines the values to encode into a config transaction or
#   genesis block for orderer related parameters.
#
################################################################################
Orderer: &OrdererDefaults

    # Orderer Type: The orderer implementation to start.
    # Available types are "solo", "kafka" and "etcdraft".
    OrdererType: etcdraft

    # Addresses used to be the list of orderer addresses that clients and peers
    # could connect to.  However, this does not allow clients to associate orderer
    # addresses and orderer organizations which can be useful for things such
    # as TLS validation.  The preferred way to specify orderer addresses is now
    # to include the OrdererEndpoints item in your org definition
    Addresses:
    #    - 127.0.0.1:7050
        - "orderer0.example.com:7050"
        - "orderer1.example.com:8050"
        - "orderer2.example.com:9050"

    # Batch Timeout: The amount of time to wait before creating a batch.
    BatchTimeout: 2s

    # Batch Size: Controls the number of messages batched into a block.
    # The orderer views messages opaquely, but typically, messages may
    # be considered to be Fabric transactions.  The 'batch' is the group
    # of messages in the 'data' field of the block.  Blocks will be a few kb
    # larger than the batch size, when signatures, hashes, and other metadata
    # is applied.
    BatchSize:

        # Max Message Count: The maximum number of messages to permit in a
        # batch.  No block will contain more than this number of messages.
        MaxMessageCount: 500

        # Absolute Max Bytes: The absolute maximum number of bytes allowed for
        # the serialized messages in a batch. The maximum block size is this value
        # plus the size of the associated metadata (usually a few KB depending
        # upon the size of the signing identities). Any transaction larger than
        # this value will be rejected by ordering.
        # It is recommended not to exceed 49 MB, given the default grpc max message size of 100 MB
        # configured on orderer and peer nodes (and allowing for message expansion during communication).
        AbsoluteMaxBytes: 10 MB

        # Preferred Max Bytes: The preferred maximum number of bytes allowed
        # for the serialized messages in a batch. Roughly, this field may be considered
        # the best effort maximum size of a batch. A batch will fill with messages
        # until this size is reached (or the max message count, or batch timeout is
        # exceeded).  If adding a new message to the batch would cause the batch to
        # exceed the preferred max bytes, then the current batch is closed and written
        # to a block, and a new batch containing the new message is created.  If a
        # message larger than the preferred max bytes is received, then its batch
        # will contain only that message.  Because messages may be larger than
        # preferred max bytes (up to AbsoluteMaxBytes), some batches may exceed
        # the preferred max bytes, but will always contain exactly one transaction.
        PreferredMaxBytes: 2 MB

    # Max Channels is the maximum number of channels to allow on the ordering
    # network. When set to 0, this implies no maximum number of channels.
    MaxChannels: 0

    Kafka:
        # Brokers: A list of Kafka brokers to which the orderer connects. Edit
        # this list to identify the brokers of the ordering service.
        # NOTE: Use IP:port notation.
        Brokers:
            - kafka0:9092
            - kafka1:9092
            - kafka2:9092

    # EtcdRaft defines configuration which must be set when the "etcdraft"
    # orderertype is chosen.
    EtcdRaft:
        # The set of Raft replicas for this network. For the etcd/raft-based
        # implementation, we expect every replica to also be an OSN. Therefore,
        # a subset of the host:port items enumerated in this list should be
        # replicated under the Orderer.Addresses key above.
        Consenters:
            - Host: orderer0.example.com
              Port: 7050
              ClientTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.crt
              ServerTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.crt
            - Host: orderer1.example.com
              Port: 8050
              ClientTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/server.crt
              ServerTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/server.crt
            - Host: orderer2.example.com
              Port: 9050
              ClientTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
              ServerTLSCert: /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt

        # Options to be specified for all the etcd/raft nodes. The values here
        # are the defaults for all new channels and can be modified on a
        # per-channel basis via configuration updates.
        Options:
            # TickInterval is the time interval between two Node.Tick invocations.
            TickInterval: 500ms

            # ElectionTick is the number of Node.Tick invocations that must pass
            # between elections. That is, if a follower does not receive any
            # message from the leader of current term before ElectionTick has
            # elapsed, it will become candidate and start an election.
            # ElectionTick must be greater than HeartbeatTick.
            ElectionTick: 10

            # HeartbeatTick is the number of Node.Tick invocations that must
            # pass between heartbeats. That is, a leader sends heartbeat
            # messages to maintain its leadership every HeartbeatTick ticks.
            HeartbeatTick: 1

            # MaxInflightBlocks limits the max number of in-flight append messages
            # during optimistic replication phase.
            MaxInflightBlocks: 5

            # SnapshotIntervalSize defines number of bytes per which a snapshot is taken
            SnapshotIntervalSize: 16 MB

    # Organizations lists the orgs participating on the orderer side of the
    # network.
    Organizations:

    # Policies defines the set of policies at this level of the config tree
    # For Orderer policies, their canonical path is
    #   /Channel/Orderer/<PolicyName>
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        # BlockValidation specifies what signatures must be included in the block
        # from the orderer for the peer to validate it.
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"

    # Capabilities describes the orderer level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *OrdererCapabilities

################################################################################
#
#   CHANNEL
#
#   This section defines the values to encode into a config transaction or
#   genesis block for channel related parameters.
#
################################################################################
Channel: &ChannelDefaults
    # Policies defines the set of policies at this level of the config tree
    # For Channel policies, their canonical path is
    #   /Channel/<PolicyName>
    Policies:
        # Who may invoke the 'Deliver' API
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        # Who may invoke the 'Broadcast' API
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        # By default, who may modify elements at this config level
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"


    # Capabilities describes the channel level capabilities, see the
    # dedicated Capabilities section elsewhere in this file for a full
    # description
    Capabilities:
        <<: *ChannelCapabilities

################################################################################
#
#   PROFILES
#
#   Different configuration profiles may be encoded here to be specified as
#   parameters to the configtxgen tool. The profiles which specify consortiums
#   are to be used for generating the orderer genesis block. With the correct
#   consortium members defined in the orderer genesis block, channel creation
#   requests may be generated with only the org member names and a consortium
#   name.
#
################################################################################
Profiles:

    TwoOrgsOrdererGenesis:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Org1
                    - *Org2

    TwoOrgsChannel:
        Consortium: SampleConsortium
        <<: *ChannelDefaults
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
                - *Org2
            Capabilities:
                <<: *ApplicationCapabilities
```

:::

### 五、生成channel-artifacts相关文件

#### 1. 生成创世区块

```sh
# 通道名 fabric-channel
# bash
./configtxgen -configPath ../config  -profile TwoOrgsOrdererGenesis -channelID fabric-channel -outputBlock ../channel-artifacts/orderer.genesis.block

# resp
2022-12-04 04:19:44.799 EST 0001 INFO [common.tools.configtxgen] main -> Loading configuration
2022-12-04 04:19:44.809 EST 0002 INFO [common.tools.configtxgen.localconfig] completeInitialization -> orderer type: etcdraft
2022-12-04 04:19:44.809 EST 0003 INFO [common.tools.configtxgen.localconfig] Load -> Loaded configuration: ../config/configtx.yaml
2022-12-04 04:19:44.810 EST 0004 INFO [common.tools.configtxgen] doOutputBlock -> Generating genesis block
2022-12-04 04:19:44.810 EST 0005 INFO [common.tools.configtxgen] doOutputBlock -> Creating system channel genesis block
2022-12-04 04:19:44.810 EST 0006 INFO [common.tools.configtxgen] doOutputBlock -> Writing genesis block
```

#### 2. 生成通道文件

```sh
# bash
./configtxgen -configPath ../config  -profile TwoOrgsChannel  -channelID businesschannel -outputCreateChannelTx ../channel-artifacts/businesschannel.tx

# resp
2022-12-04 04:20:00.374 EST 0001 INFO [common.tools.configtxgen] main -> Loading configuration
2022-12-04 04:20:00.383 EST 0002 INFO [common.tools.configtxgen.localconfig] Load -> Loaded configuration: ../config/configtx.yaml
2022-12-04 04:20:00.383 EST 0003 INFO [common.tools.configtxgen] doOutputChannelCreateTx -> Generating new channel configtx
2022-12-04 04:20:00.384 EST 0004 INFO [common.tools.configtxgen] doOutputChannelCreateTx -> Writing new channel tx
```

#### 3. 生成锚节点配置更新文件

```sh
# bash
./configtxgen -configPath ../config  -profile TwoOrgsChannel -channelID businesschannel -asOrg Org1MSP -outputAnchorPeersUpdate ../channel-artifacts/Org1MSPanchors.tx

# resp
2022-12-04 04:20:17.428 EST 0001 INFO [common.tools.configtxgen] main -> Loading configuration
2022-12-04 04:20:17.437 EST 0002 INFO [common.tools.configtxgen.localconfig] Load -> Loaded configuration: ../config/configtx.yaml
2022-12-04 04:20:17.437 EST 0003 INFO [common.tools.configtxgen] doOutputAnchorPeersUpdate -> Generating anchor peer update
2022-12-04 04:20:17.438 EST 0004 INFO [common.tools.configtxgen] doOutputAnchorPeersUpdate -> Writing anchor peer update

# bash
./configtxgen -configPath ../config  -profile TwoOrgsChannel -channelID businesschannel -asOrg Org2MSP -outputAnchorPeersUpdate ../channel-artifacts/Org2MSPanchors.tx

# resp
2022-12-04 04:20:22.683 EST 0001 INFO [common.tools.configtxgen] main -> Loading configuration
2022-12-04 04:20:22.693 EST 0002 INFO [common.tools.configtxgen.localconfig] Load -> Loaded configuration: ../config/configtx.yaml
2022-12-04 04:20:22.693 EST 0003 INFO [common.tools.configtxgen] doOutputAnchorPeersUpdate -> Generating anchor peer update
2022-12-04 04:20:22.694 EST 0004 INFO [common.tools.configtxgen] doOutputAnchorPeersUpdate -> Writing anchor peer update
```

#### 4. 文件结构

```tex
channel-artifacts/
├── businesschannel.tx
├── orderer.genesis.block
├── Org1MSPanchors.tx
└── Org2MSPanchors.tx
```
