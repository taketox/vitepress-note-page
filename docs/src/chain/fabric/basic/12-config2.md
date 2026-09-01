# 配置解析—通道配置文件

## 通道配置文件解析

### 1.概述

Fabric 网络是分布式系统，采用通道配置（Channel Configuration）来定义共享账本的各项行为。通道配置的管理对于网络功能至关重要。

通道配置一般包括通道全局配置、排序配置和应用配置等多个层级，这些配置都存放在通道的配置区块内。通道全局配置定义该通道内全局的默认配置，排序配置和应用配置分别管理与排序服务相关配置和与应用组织相关配置。

用户可采用 `configtx.yaml` 文件初始化通道配置，使用配置更新交易更新通道配置。

`configtx.yaml` 配置文件一般包括若干字段：Organizations、Capabilities、Channel、Orderer、Application 和 Profiles。用户可指定直接使用其中某个 Profile，自动引用其他字段中的定义。

| 配置项        | 作用                                                         |
| ------------- | ------------------------------------------------------------ |
| Organizations | 一系列组织的结构定义，包括名称、MSP 路径、读写和管理权限、锚节点等，可被 Profiles 等部分引用 |
| Capabilities  | 一系列能力定义，如通道、排序服务、应用等的能力，可被 Channel 等部分引用 |
| Channel       | 定义通道相关的默认配置，包括读写和管理权限、能力等，可被 Prof iles 等部分引用 |
| Orderer       | 与排序服务相关的配置，包括排序服务类型、地址、切块时间和大小、参与排序服务的组织、权限和能力，可被 Profiles 等部分引用 |
| Application   | 与应用通道相关的配置，主要包括默认访问控制权限、参与应用网络的组织、权限和能力，可被 Prof iles 等部分引用 |
| Profiles      | 一系列的配置定义，包括指定排序服务配置、应用配置和联盟配置等，直接被 configtxgen 工具指定使用 |

### 2. Organizations 部分

| 配置项               | 作用                                                         |
| -------------------- | ------------------------------------------------------------ |
| Name                 | 组织名称                                                     |
| SkipAsForeign        | 指定在创建新通道时是否从系统通道内继承该组织，configtxgen 会忽略从本地读取 |
| ID                   | MSP 的 ID                                                    |
| MSPDir               | MSP 文件本地路径                                             |
| Policies.Readers     | 读角色                                                       |
| Policies.Writers     | 写角色                                                       |
| Policies.Admins      | 管理角色                                                     |
| Policies.Endorsement | 背书策略                                                     |
| OrdererEndpoints     | 排序节点地址列表                                             |
| AnchorPeers          | 锚节点地址，用于跨组织的 gossip 信息交换                     |

::: details

```yaml
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
    - &SampleOrg
        # Name is the key by which this org will be referenced in channel
        # configuration transactions.
        # Name can include alphanumeric characters as well as dots and dashes.
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
        ID: SampleOrg

        # MSPDir is the filesystem path which contains the MSP configuration.
        MSPDir: msp

        # Policies defines the set of policies at this level of the config tree
        # For organization policies, their canonical path is usually
        #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
        Policies: &SampleOrgPolicies
            Readers:
                Type: Signature
                Rule: "OR('SampleOrg.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.peer', 'SampleOrg.client')"
            Writers:
                Type: Signature
                Rule: "OR('SampleOrg.member')"
                # If your MSP is configured with the new NodeOUs, you might
                # want to use a more specific rule like the following:
                # Rule: "OR('SampleOrg.admin', 'SampleOrg.client')"
            Admins:
                Type: Signature
                Rule: "OR('SampleOrg.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('SampleOrg.member')"

        # OrdererEndpoints is a list of all orderers this org runs which clients
        # and peers may to connect to to push transactions and receive blocks respectively.
        OrdererEndpoints:
            - "127.0.0.1:7050"

        # AnchorPeers defines the location of peers which can be used for
        # cross-org gossip communication.
        #
        # NOTE: this value should only be set when using the deprecated
        # `configtxgen --outputAnchorPeersUpdate` command. It is recommended
        # to instead use the channel configuration update process to set the
        # anchor peers for each organization.
        AnchorPeers:
            - Host: 127.0.0.1
              Port: 7051
```

:::

### 3. Capabilities 部分

> Capabilities 字段主要定义一系列能力模板，分为通道能力、排序服务能力和应用能力三种类型，可被其他部分引用.

| 配置项      | 作用             |
| ----------- | ---------------- |
| Channel     | 通道范围能力版本 |
| Orderer     | 排序服务能力版本 |
| Application | 应用范围能力版本 |

::: details

```yaml
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
```

:::

### 4. Channel 部分

> 默认的通道配置模板，包括读写和管理权限、能力等。主要被其他部分引用。完整的通道配置应该还包括应用和排序字段。

| 配置项           | 作用                                   |
| ---------------- | -------------------------------------- |
| Policies.Readers | 通道读角色权限，可获取通道内信息和数据 |
| Policies.Writers | 通道写角色权限，可以向通道内发送交易   |
| Policies.Admins  | 通道管理员角色权限，可修改配置         |
| Capabilities     | 引用通道默认的能力集合                 |

::: details

```yaml
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
```

:::

### 5. Orderere 部分

> ​Orderer 字段定义与排序服务相关的配置，包括排序服务类型、地址、切块时间和大小、最大通道数、参与排序服务的组织、权限和能力。

| 配置项                                | 作用                                                         | 默认值                   |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------ |
| OrdererType                           | 要启动的 orderer 类型，支持 solo , kafka ， etcdraft         | solo                     |
| Addresses                             | 排序服务地址列表                                             | N/A                      |
| BatchTimeout                          | 切块最大超时时间                                             | 2s                       |
| BatchSize                             | 控制写入区块交易个数                                         | N/A                      |
| BatchSize.MaxMessageCount             | 一批消息最大个数                                             | 500                      |
| BatchSize.AbsoluteMaxBytes            | batch 最大字节数，任何时候不能超过                           | 10 MB                    |
| BatchSize.PreferredMaxBytes           | 通常情况下切块大小，极端情况下（比如单个消息就超过）允许超过 | 2 MB                     |
| MaxChannels                           | 最大支持的应用通道数，0 表示无限                             | 0                        |
| Kafka                                 | 采用 Kafka 类型共识时相关配置，仅在 1.x 版本中使用           | N/A                      |
| EtcdRaft                              | 采用 EtcdRaft 类型共识时相关配置，推荐在 2.x 版本中使用      |                          |
| EtcdRaft.Consenters                   | 共识节点地址                                                 | N/A                      |
| EtcdRaft.Options.TickInterval         | etcd 集群当作一次 tick 的时间，心跳或选举都以 tick 为基本单位 | 500ms                    |
| EtcdRaft.Options.ElectionTick         | follower 长时间收不到 leader 消息后，开始新一轮选举的时间间隔 | 10                       |
| EtcdRaft.Options.HeartbeatTick        | 两次心跳之间的间隔，必须小于选举时间                         | 1                        |
| EtcdRaft.Options.MaxInflightBlocks    | 复制过程中最大的传输中的区块消息个数                         | 5                        |
| EtcdRaft.Options.SnapshotIntervalSize | 每次快照间隔的大小                                           | 16 MB                    |
| Organizations                         | 维护排序服务组织，默认为空，可以在 Profile 中自行定义        | N/A                      |
| Capabilities                          | 引用排序服务默认的能力集合                                   | <<: *OrdererCapabilities |

::: details

```yaml
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
```

:::

### 6. Application 部分

> 定义了与应用通道相关的配置，包括默认访问控制权限、参与应用网络的组织、权限和能力。可被 Profiles 部分引用.

| 配置项     | 作用                                                         |
| ---------- | ------------------------------------------------------------ |
| _lifecycle | 指定新的 _lifecycle 系统链码的提交，查询方法的默认策略       |
| lscc       | lscc (Lifecycle System Chaincode) 系统链码的方法调用权限     |
| qscc       | qscc (Query System Chaincode) 系统链码的方法调用权限         |
| cscc       | cscc (Configuration System Chaincode) 系统链码的方法调用权限 |
| peer       | 通道内链码调用权限                                           |
| event      | 接收区块事件权限                                             |

::: details

```yaml
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
```

:::

### 7. Profiles 部分

`Profiles` 字段定义了一系列的配置模板，每个模板代表了特定应用场景下的自定义的通道配置，可以用来创建系统通道或应用通道。配置模板中可以包括 `Application`、`Capabilities`、`Consortium`、`Consortiums`、`Policies`、`Orderer` 等配置字段，根据使用目的不同，一般只包括部分字段。

除了通道默认的配置，创建系统通道初始区块的模板一般需要包括 `Orderer`、`Consortiums` 字段信息（也可以包括 `Applicaion` 字段定义初始应用通道配置）：

● Orderer，指定 Orderer 系统通道自身的配置信息。包括排序服务配置（类型、地址、批处理限制、Kafka 信息、最大应用通道数目等），参与此 Orderer 的组织信息。网络启动时，必须首先创建 Orderer 系统通道。

● Consortiums，Orderer 所服务的联盟列表。每个联盟中组织彼此使用相同的通道创建策略，可以彼此创建应用通道。

应用通道模板中一般至少包括 Application、Consortium 字段信息（Orderer 信息从系统通道自动复制）：

● Application，指定属于应用通道的配置信息。主要包括属于通道的组织、能力、ACL 和策略信息。

● Consortium，该应用通道所关联的联盟信息，可以包括一系列组织。

一般建议将 Prof ile 分为 Orderer 系统通道配置（至少包括指定 Orderers 和 Consortiums）和应用通道配置（至少包括指定 Applications 和 Consortium）两种。

> 注意：在 YAML 文件中，&KEY 所定位的字段信息，可以通过 `<<:KEY` 语法来引用，相当于导入定位部分的内容。

::: details

```yaml
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
