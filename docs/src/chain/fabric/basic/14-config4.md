# 配置解析—Peer配置文件

## Peer 配置解析

在 Fabric 网络中，用户可以设定 Peer 节点、排序节点、CA 节点的行为，以及管理通道、组织身份等多种资源，这都涉及网络内配置。

Fabric 节点在启动时可通过加载本地配置文件或环境变量等方式获取配置信息，同时结合少量命令行参数。

通常用户需要提前编写配置文件，供服务启动时使用；也可以仅在配置文件中指定部分默认值，使用环境变量动态指定可以实现更灵活的配置加载。

默认情况下，Fabric 节点的主配置路径为 `FABRIC_CFG_PATH` 环境变量所指向路径（默认为 /etc/hyperledger/fabric）。在不显式指定配置路径时，会尝试从主配置路径下查找相关的配置文件。

| 节点      | 默认配置文件路径                                    | 主要功能                    |
| --------- | --------------------------------------------------- | --------------------------- |
| Peer 节点 | $FABRIC_CFG_PATH/core.yaml                          | 指定 peer 节点运行时参数    |
| Orderer   | $FABRIC_CFG_PATH/orderer.yaml                       | 指定 orderer 节点运行时参数 |
| CA 节点   | $FABRIC_CA_SERVER_HOME/fabric-ca-server-config.yaml | 指定 CA 节点运行时参数      |

除了各节点配置文件，Fabric 还在每个通道内通过配置区块来维护通道范围的配置信息，通道配置可由 `configtx.yaml` 文件设定。

这些配置需要使用特定工具进行管理，这些工具包括 `cryptogen` 、`configtxgen` 和 `configtxlator`

| 工具          | 默认配置文件路径             | 主要功能                                                     |
| ------------- | ---------------------------- | ------------------------------------------------------------ |
| cryptogen     | 命令行参数 --config 指定     | 负责生成网络中组织结构和身份文件                             |
| configtxgen   | 命令行参数 --configPath 指定 | 利用 configtx.yaml 文件生成通道初始配置；创建配置更新交易    |
| configtxlator | N/A                          | 将通道配置在二进制和 JSON 格式之间进行转换，并计算配置更新量 |

------

### Peer 配置剖析

::: warning
**当 Peer 节点启动时，会按照优先级从高到低的顺序依次尝试从命令行参数、环境变量和配置文件中读取配置信息。**

**当从环境变量中读入配置信息时候，除了日志使用单独的 FABRIC_LOGGING_SPEC 环境变量进行指定，其他都需要以 CORE_前缀开头。例如，配置文件中的 peer.id 项，对应环境变量 CORE_PEER_ID。**> **当从环境变量中读入配置信息时候，除了日志使用单独的 FABRIC_LOGGING_SPEC 环境变量进行指定，其他都需要以 CORE_前缀开头。例如，配置文件中的 peer.id 项，对应环境变量 CORE_PEER_ID。**

**Peer 节点默认的配置文件读取路径为 $FABRIC_CFG_PATH/core.yaml；如果没找到，则尝试查找当前目录下的./core.yaml 文件；如果还没有找到，则尝试查找默认的 /etc/hyperledger/fabric/core.yaml 文件。**

**在结构上，core.yaml 文件中包括 peer、vm、chaincode、ledger、operations、metrics 六大部分。**
:::

------

### peer 部分

peer 部分包括与服务直接相关的核心配置，内容比较多。除了一些常规配置，还包括 keepalive、Gossip、TLS、BCCSP、handler、discover 等多个配置部分。

| 配置项                                                    | 类型       | 作用                                                         | 默认值                                                       |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| id                                                        | 常规配置   | Peer 在网络中的 ID 信息，用于辨识不同的节点                  | N/A                                                          |
| networkId                                                 | 常规配置   | 网络自身的 ID，逻辑上可以通过 ID 指定多个隔离的网络          | N/A                                                          |
| listenAddress                                             | 常规配置   | 服务监听的本地地址，本地有多个网络接口时可指定仅监听某个接口 | 0.0.0.0:7051                                                 |
| address                                                   | 常规配置   | 对同组织内其他节点的监听连接地址。当服务在 NAT 设备上运行时，该配置可以指定服务对外宣称的可访问地址。如果是客户端，则作为其连接的 Peer 服务地址 | 0.0.0.0:7051                                                 |
| addressAutoDetect                                         | 常规配置   | 是否自动探测服务地址。当 Peer 服务运行环境的地址是动态时，该配置可以进行自动探测，探测将内部地址作为服务地址。默认情况下关闭。注意启用 TLS 时候最好关闭，以免与指定的域名冲突造成认证失败 | false                                                        |
| fileSystemPath                                            | 常规配置   | 本地数据存放路径，包括账本、链码等                           | /var/hyperledger/production                                  |
| mspConfigPath                                             | 常规配置   | MSP 目录所在的路径，可以为绝对路径，或相对配置目录的路径，一般建议为 /etc/hyperledger/fabric/msp | msp                                                          |
| localMspId                                                | 常规配置   | Peer 所关联的 MSP ID，一般为所属组织名称，需要与通道配置内名称一致 | SampleOrg                                                    |
| deliveryclient                                            | 常规配置   | 到排序服务连接的配置。值得注意的是 addressOverrides 域。当 Peer 加入通道时会从初始区块提取排序服务信息，此时排序节点地址或证书可能已经发生变化。使用此处配置可以映射到新版本排序服务，避免出现无法加入通道的情况 | N/A                                                          |
| limits                                                    | 常规配置   | 对访问频率进行限制，可以限定 endorserService ， deliverService ， gatewayService 服务处理的并发数 | endorserService=2500 , deliverService=2500 , gatewayService=2500 |
| keepalive.interval                                        | 保活消息   | 如果服务端发现客户端在指定时间内未有任何消息，则主动发送 gRPC Ping 进行探测 | 7200s                                                        |
| keepalive.timeout                                         | 保活消息   | 服务端发送 Ping 消息后，如果客户端在指定时间内未响应，则断开连接 | 20s                                                          |
| keepalive.minInterval                                     | 保活消息   | 允许其他人发送保活消息的最小时间间隔，太快的消息会导致连接中断，以避免 DoS 攻击 | 60s                                                          |
| keepalive.client                                          | 保活消息   | 作为客户端连接其他 Peer 节点时发送消息的间隔和超时时间       | interval: 60s , timeout: 20s                                 |
| keepalive.deliveryClient                                  | 保活消息   | 作为客户端连接排序节点时发送消息的间隔和超时时间             | interval: 60s , timeout: 20s                                 |
| gossip.bootstrap                                          | 启动和连接 | 节点启动后向组织内指定节点发起 Gossip 连接，以加入网络。bootstrap 节点会答复自己所知的邻居信息 | 127.0.0.1:7051                                               |
| gossip.endpoint                                           | 启动和连接 | 本节点在同一组织内的 gossip id                               | peer.address                                                 |
| gossip.maxBlockCountToStore                               | 启动和连接 | 保存到内存中的区块个数上限，超过则丢弃                       | 10                                                           |
| gossip.skipBlockVerification                              | 启动和连接 | 是否对区块消息进行校验                                       | false                                                        |
| gossip.dialTimeout                                        | 启动和连接 | gRPC 连接拨号的超时时间                                      | 3s                                                           |
| gossip.connTimeout                                        | 启动和连接 | 建立连接的超时时间                                           | 2s                                                           |
| gossip.aliveTimeInterval                                  | 启动和连接 | 定期发送 Alive 心跳消息的时间间隔                            | 5s                                                           |
| gossip.aliveExpirationTimeout                             | 启动和连接 | Alive 心跳消息的超时时间                                     | 25s                                                          |
| gossip.reconnectInterval                                  | 启动和连接 | 断线后重连的时间间隔                                         | 25s                                                          |
| gossip.externalEndpoint                                   | 启动和连接 | 节点向组织外节点公开的服务地址，默认为空，代表不被其他组织所感知 | N/A                                                          |
| gossip.membershipTrackerInterval                          | 邻居发现   | 定期探测当前邻居状态是否变更的时间间隔                       | 5s                                                           |
| gossip.maxPropagationBurstLatency                         | 邻居发现   | 保存消息的最大时间，超过则转发给其他节点                     | 10ms                                                         |
| gossip.maxPropagationBurstSize                            | 邻居发现   | 保存的最大消息个数，超过则转发给其他节点                     |                                                              |
| gossip.propagateIterations                                | 邻居发现   | 消息转发的次数                                               | 1                                                            |
| gossip.propagatePeerNum                                   | 邻居发现   | 推送消息给指定个数的节点                                     | 3                                                            |
| gossip.pullInterval                                       | 邻居发现   | 触发拉取消息的时间间隔，发送 Hello 消息收到对方摘要，更新摘要字典后发送拉取请求等待对方响应，应该比 digestWaitTime+requestWaitTime 长 | 4s                                                           |
| gossip.pullPeerNum                                        | 邻居发现   | 从指定个数的节点拉取消息                                     | 3                                                            |
| gossip.requestStateInfoInterval                           | 邻居发现   | 从节点拉取状态信息（StateInfo）消息的时间间隔                | 4s                                                           |
| gossip.publishStateInfoInterval                           | 邻居发现   | 向其他节点推动状态信息消息的时间间隔                         | 4s                                                           |
| gossip.stateInfoRetentionInterval                         | 邻居发现   | 状态信息消息的超时时间                                       | N/A                                                          |
| gossip.publishCertPeriod                                  | 邻居发现   | 启动后在心跳消息中包括证书的等待时间                         | 10s                                                          |
| gossip.recvBuffSize                                       | 邻居发现   | 收取消息的缓冲大小                                           | 20                                                           |
| gossip.sendBuffSize                                       | 邻居发现   | 发送消息的缓冲大小                                           | 200                                                          |
| gossip.digestWaitTime                                     | 邻居发现   | 拉取消息方发送 Hello 消息后等待对方返回摘要（开始更新摘要字典）的时间，之后发送 Req 消息 | 1s                                                           |
| gossip.requestWaitTime                                    | 邻居发现   | 被拉取方收到 Hello 消息，发送摘要，等待接收拉取请求的超时    | 1500ms                                                       |
| gossip.responseWaitTime                                   | 邻居发现   | 拉取方发送拉取请求后等待收到响应的超时                       | 2s                                                           |
| gossip.nonBlockingCommitMode                              | 邻居发现   | 是否启用非阻塞模式提交区块到本地，默认关闭。是隐藏参数       | N/A                                                          |
| gossip.useLeaderElection                                  | 选举       | 是否允许节点之间动态进行组织的代表（leader）节点选举，通常情况下推荐开启 | false                                                        |
| gossip.orgLeader                                          | 选举       | 本节点是否指定为组织的代表节点。与 useLeaderElection 不能同时指定为 true | true                                                         |
| gossip.election.startupGracePeriod                        | 选举       | 代表成员选举等待的时间                                       | 15s                                                          |
| gossip.election.membershipSampleInterval                  | 选举       | 查成员稳定性的采样间隔                                       | 1s                                                           |
| gossip.election.leaderAliveThreshold                      | 选举       | Peer 尝试进行选举的等待超时                                  | 10s                                                          |
| gossip.election.leaderElectionDuration                    | 选举       | Peer 宣布自己为代表节点的等待时间                            | 5s                                                           |
| gossip.pvtData.pullRetryThreshold                         | 私有数据   | 拉取区块相关私密数据的最长等待时间，超过则忽略而直接提交区块 | 60s                                                          |
| gossip.pvtData.transientstoreMaxBlockRetention            | 私有数据   | 私密数据临时保存在本地临时数据库，在清除前等待的最大新区块个数。超过则会被从本地临时数据库删除。默认为 1000，意味着每当 1000 的整数倍区块提交时，与当前区块差异超过 1000 的旧区块关联的私密数据将从临时数据库删除 | 1000                                                         |
| gossip.pvtData.pushAckTimeout                             | 私有数据   | 背书环节中推送消息到其他 Peer 的等待响应时间                 | 3s                                                           |
| gossip.pvtData.btlPullMargin                              | 私有数据   | 只获取在给定的区块数内不超时的私密数据                       | 10                                                           |
| gossip.pvtData.reconcileBatchSize                         | 私有数据   | 协同时单次拉取的最多私密数据个数                             | 10                                                           |
| gossip.pvtData.reconcileSleepInterval                     | 私有数据   | 协同的间隔                                                   | 1m                                                           |
| gossip.pvtData.reconciliationEnabled                      | 私有数据   | 启用协同                                                     | true                                                         |
| gossip.pvtData.skipPullingInvalidTransactionsDuringCommit | 私有数据   | 在本地提交时，跳过对非法交易私密数据的获取                   | false                                                        |
| gossip.pvtData.implicitCollectionDisseminationPolicy      | 私有数据   | 指定对等体自己的隐式集合的传播策略。当对等端认可一个写到它自己的隐式集合的提议时，下面的值将覆盖用于传播私有数据的默认值。注意，它适用于对等体已加入的所有通道。这意味着 requiredPeerCount 必须小于来自组织的对等体数量最低的通道中的对等体数量 | requiredPeerCount: 0 , maxPeerCount: 1                       |
| gossip.state.enabled                                      | 状态转移   | 是否开启允许通过状态传递（state transfer）快速追踪到最新区块 | false                                                        |
| gossip.state.checkInterval                                | 状态转移   | 检查是否触发状态传递的时间间隔                               | 10s                                                          |
| gossip.state.responseTimeout                              | 状态转移   | 回复的等待超时                                               | 3s                                                           |
| gossip.state.batchSize                                    | 状态转移   | 通过状态传递获得的区块数                                     | 10                                                           |
| gossip.state.blockBufferSize                              | 状态转移   | Peer 缓存收到的待排序区块的个数，最大不超过配置的两倍        | 20                                                           |
| gossip.state.maxRetries                                   | 状态转移   | 状态传递请求的重试次数                                       | 3                                                            |
| gossip.state.channelSize                                  | 状态转移   | 为每个通道缓冲的状态请求消息个数，超过指定阈值则忽略，是隐藏参数 | N/A                                                          |
| tls.enabled                                               | TLS 配置   | 开启 server 端 TLS 检查                                      | false                                                        |
| tls.clientAuthRequired                                    | TLS 配置   | 要求入站连接的客户端证书 / 相互 TLS                          | false                                                        |
| tls.cert.file                                             | TLS 配置   | server 端使用的 TLS 证书路径                                 | tls/server.crt                                               |
| tls.key.file                                              | TLS 配置   | server 端使用的 TLS 私钥路径                                 | tls/server.key                                               |
| tls.rootcert.file                                         | TLS 配置   | server 端使用的根 CA 的证书，签发服务端的 TLS 证书           | tls/ca.crt                                                   |
| tls.clientRootCAs.files                                   | TLS 配置   | 用于校验客户端身份时，所使用的根 CA 证书列表                 | tls/ca.crt                                                   |
| tls.clientKey.file                                        | TLS 配置   | 作为客户端连接其他服务时所用的 TLS 私钥，如果不指定，默认使用 tls.key | tls.key                                                      |
| tls.clientCert.file                                       | TLS 配置   | 作为客户端连接其他服务时所用的 TLS 证书，如果不指定，默认使用 tls.key | tls.cert                                                     |
| BCCSP                                                     | BSSCP      | 负责抽象密码库相关处理，配置算法类型、文件路径等             | SW                                                           |
| BCCSP.SW.Hash                                             | BSSCP      | Hash 算法类型，目前仅支持 SHA2                               | SHA2                                                         |
| BCCSP.SW.FileKeyStore.KeyStore                            | BSSCP      | 本地私钥文件路径，默认指向 mspConfigPath/keystore            | mspConfigPath/keystore                                       |
| BCCSP.PKCS11                                              | BSSCP      | PKCS11 相关配置                                              | N/A                                                          |
| handlers.authFilters                                      | handlers   | 自定义的权限过滤插件，对消息权限进行校验                     | DefaultAuth ， ExpirationCheck                               |
| handlers.decorators                                       | handlers   | 自定义修饰插件 ，对发给链码的数据添加额外处理                | DefaultDecorator                                             |
| handlers.endorsers                                        | handlers   | 自定义背书插件，负责背书过程处理                             | DefaultEndorsement                                           |
| handlers.validators                                       | handlers   | 自定义验证插件，提交前进行验证                               | DefaultValidation                                            |
| discovery.enabled                                         | 服务发现   | 开启服务发现，服务发现功能为客户端提供了快速查询网络中拓扑、节点相关信息的功能 | true                                                         |
| discovery.authCacheEnabled                                | 服务发现   | 是否启用对认证的缓存机制                                     | true                                                         |
| discovery.authCacheMaxSize                                | 服务发现   | 最大缓存个数                                                 | 1000                                                         |
| discovery.authCachePurgeRetentionRatio                    | 服务发现   | 缓存清理后保存的比列                                         | 0.75                                                         |
| discovery.orgMembersAllowedAccess                         | 服务发现   | 是否允许普通成员进行通道范围之外的信息查询，默认仅限 Admin   | false                                                        |

------

### vm 部分

对链码运行环境的配置，目前仅支持 Docker 容器服务。

| 配置项                        | 作用                                            | 默认值                                                     |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| endpoint                      | docker daemon 地址                              | [unix:///var/run/docker.sock](unix:///var/run/docker.sock) |
| docker.tls                    | docker daemon 启用 TLS 时相关证书和密钥文件配置 | false                                                      |
| docker.attachStdout           | 是否启用连接到标准输出                          | false                                                      |
| docker.hostConfig.NetworkMode | 运行链码容器的网络模式                          | host                                                       |
| docker.hostConfig.Dns         | 容器使用的 DNS 服务器列表                       | N/A                                                        |
| docker.hostConfig.LogConfig   | 日志配置                                        | N/A                                                        |
| docker.hostConfig.Memory      | 内存限制大小，-1 表示无限制                     | 2147483648                                                 |

------

### chaincode 部分

| 配置项             | 作用                                                       | 默认值                                                       |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ |
| id                 | 动态标记链码的信息，该信息会以环境变量标签形式传给链码容器 | N/A                                                          |
| builder            | 通用 docker 镜像编译环境                                   | $(DOCKER_NS)/fabric-ccenv:$(TWO_DIGIT_VERSION)               |
| pull               | 实例化链码时是否从仓库拉取基础镜像                         | false                                                        |
| golang.runtime     | go 语言链码部署生成镜像的基础 docker 镜像                  | $(DOCKER_NS)/fabric-baseos:$(TWO_DIGIT_VERSION)              |
| golang.dynamicLink | 链码编译过程是否进行动态链接                               | false                                                        |
| java               | java 语言链码部署生成镜像的基础 docker 镜像                | $(DOCKER_NS)/fabric-javaenv:$(TWO_DIGIT_VERSION)             |
| node               | nodejs 链码的运行容器                                      | $(DOCKER_NS)/fabric-nodeenv:$(TWO_DIGIT_VERSION)             |
| externalBuilders   | 指定外部的链码编译和运行插件的路径列表                     | N/A                                                          |
| installTimeout     | 等待链码编译和安装完成的超时时间                           | 300s                                                         |
| startuptimeout     | 启动链码容器的超时时间                                     | 300s                                                         |
| executetimeout     | 调用链码执行超时时间                                       | 30s                                                          |
| mode               | 执行链码的模式                                             | net                                                          |
| keepalive          | peer 和链码之间的心跳超时，小于或等于 0 意味着关闭         | 0                                                            |
| system             | 系统链码配置，所有启用的链码都必须在这里注册               | _lifecycle: enable ， cscc: enable ， lscc: enable ， qscc: enable |
| logging            | 链码容器日志相关配置                                       | N/A                                                          |

------

### ledger 部分

| 配置项                                           | 作用                                            | 默认值                                |
| ------------------------------------------------ | ----------------------------------------------- | ------------------------------------- |
| blockchain                                       | 暂未使用                                        | N/A                                   |
| state.stateDatabase                              | 状态数据库类型（goleveldb ， CouchDB）          | goleveldb                             |
| state.totalQueryLimit                            | 每次链码查询最大返回记录数                      | 100000                                |
| state.couchDBConfig.couchDBAddress               | couchdb 连接地址                                | 127.0.0.1:5984                        |
| state.couchDBConfig.username                     | couchdb 用户名                                  | N/A                                   |
| state.couchDBConfig.password                     | couchdb 密码                                    | N/A                                   |
| state.couchDBConfig.maxRetries                   | 出错后重试次数                                  | 3                                     |
| state.couchDBConfig.maxRetriesOnStartup          | 启动出错重试次数                                | 10                                    |
| state.couchDBConfig.requestTimeout               | 请求超时时间                                    | 35s                                   |
| state.couchDBConfig.internalQueryLimit           | 链码内单个逻辑查询返回的最大记录数              | 1000                                  |
| state.couchDBConfig.maxBatchUpdateSize           | 批量更新的最大记录数                            | 1000                                  |
| state.couchDBConfig.createGlobalChangesDB        | 是否创建 _global_changes 系统库，会追踪全局修改 | false                                 |
| state.couchDBConfig.cacheSize                    | 最大分配的缓存大小，需要为 32MB 的整数倍        | 64                                    |
| history.enableHistoryDatabase                    | 是否启用历史数据库                              | true                                  |
| pvtdataStore.collElgProcMaxDbBatchSize           | 提交一批私有数据的最大个数                      | 5000                                  |
| pvtdataStore.collElgProcDbBatchesInterval        | 提交一批私有数据的最短时间间隔，单位毫秒        | 1000                                  |
| pvtdataStore.deprioritizedDataReconcilerInterval | N/A                                             | 1000                                  |
| snapshots.rootDir                                | 存储分类账快照的文件系统上的路径                | /var/hyperledger/production/snapshots |

------

### operations 部分

| 配置项        | 作用                       | 默认值         |
| ------------- | -------------------------- | -------------- |
| listenAddress | RESTful 管理服务的监听地址 | 127.0.0.1:9443 |

------

### metrics 部分

| 配置项               | 作用                                                         | 默认值         |
| -------------------- | ------------------------------------------------------------ | -------------- |
| provider             | 统计服务类型，可以为 statsd (推送模式)，prometheus (拉取模式)，disabled | disabled       |
| statsd.network       | 网络协议类型，tcp 或 udp                                     | udp            |
| statsd.address       | 修改为外部 statsd 的服务地址                                 | 127.0.0.1:8125 |
| statsd.writeInterval | 推送统计汇报到 statsd 的时间间隔                             | 10s            |
| statsd.prefix        | 为所有统计推送添加前缀                                       | N/A            |

> 注意 `statsd` 和 `prometheus` 都是流行的开源监控数据收集软件。
