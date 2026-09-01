# 配置解析—Order配置文件

## Order 配置解析

排序节点在 Fabric 网络中为 Peer 提供排序服务。与 Peer 节点类似，排序节点支持从命令行参数、环境变量或配置文件中读取配置信息。环境变量中配置需要以 ORDERER_前缀开头，例如，配置文件中的 general.ListenAddress 项，对应到环境变量 ORDERER_GENERAL_LISTENADDRESS。

排序节点默认的配置文件读取路径为 `$FABRIC_CFG_PATH` 中定义的路径；如果没找到，则尝试查找当前目录；如果还没有找到，则尝试查找默认的 `/etc/hyperledger/fabric` 路径。

在结构上，`orderer.yaml` 文件中一般包括 `General` 、`FileLedger` 、`RAMLedger` 、`Kafka` 、`Debug` 、`Operations` 、`Metrics` 和 `Consensus` 八大部分.

------

### General 部分

> 这一部分主要是一些通用配置，如账本类型、服务信息、配置路径等。这些配置影响到服务的主要功能，十分重要.

| 配置项                      | 作用                                                         | 默认值         |
| --------------------------- | ------------------------------------------------------------ | -------------- |
| ListenAddress               | 服务绑定的监听地址，一般需要指定为所服务的特定网络接口的地址或全网（0.0.0.0） | 127.0.0.1      |
| ListenPort                  | 服务绑定的监听端口                                           | 7050           |
| TLS.Enabled                 | 启用 TLS 时的相关配置                                        | false          |
| TLS.PrivateKey              | Orderer 签名私钥                                             | tls/server.key |
| TLS.Certificate             | Orderer 身份证书                                             | tls/server.crt |
| TLS.RootCAs                 | 信任的根证书                                                 | tls/ca.crt     |
| TLS.ClientAuthRequired      | 是否对客户端也进行认证                                       | false          |
| TLS.ClientRootCAs           | 信任的客户端根证书列表                                       | N/A            |
| Keepalive.ServerMinInterval | 允许其他客户端 ping 消息的最小间隔，超时则断开连接           | 60s            |
| Keepalive.ServerInterval    | 到客户端的 ping 消息的间隔                                   | 7200s          |
| Keepalive.ServerTimeout     | 关闭连接前等待响应的时间                                     | 20s            |
| MaxRecvMsgSize              | GRPC 服务器和客户端可以接收的最大消息大小 (以字节为单位)     | 104857600      |
| MaxSendMsgSize              | GRPC 服务器和客户端可以发送的最大消息大小 (以字节为单位)     | 104857600      |
| Cluster                     | raft 模式下的集群配置                                        | N/A            |
| Cluster.SendBufferSize      | 发送缓冲区的最大长度                                         | 10             |
| Cluster.ClientCertificate   | 双向 TLS 认证时，作为客户端证书的文件路径，如果没设置会使用 TLS.Certificate | N/A            |
| Cluster.ClientPrivateKey    | 双向 TLS 认证时，作为客户端私钥的文件路径，如果没设置会使用 TLS.PrivateKey | N/A            |
| Cluster.ListenPort          | 监听端口默认使用 gRPC 相同的端口                             | N/A            |
| Cluster.ListenAddress       | 监听地址默认使用 gRPC 相同的地址                             | N/A            |
| Cluster.ServerCertificate   | 双向 TLS 认证时，作为服务端证书的文件路径                    | N/A            |
| Cluster.ServerPrivateKey    | 双向 TLS 认证时，作为服务端私钥的文件路径                    | N/A            |
| BootstrapMethod             | 获取引导块的方法，2.x 版本中仅支持 file 或 none              | file           |
| BootstrapFile               | 系统通道初始区块或最新配置区块文件路径                       | N/A            |
| LocalMSPDir                 | 本地 MSP 文件路径                                            | msp            |
| LocalMSPID                  | MSP ID                                                       | SampleOrg      |
| Profile                     | 是否启用 Go profiling , 开启会影响性能                       | N/A            |
| BCCSP                       | 密码库机制等，可以为 SW（软件实现）或 PKCS11 (硬件安全模块)  | SW             |
| Authentication.TimeWindow   | 如果客户端和服务端时钟差异超过窗口指定值，则拒绝消息         | 15m            |

------

### FileLedger 部分

| 配置项   | 作用                                                         | 默认值                              |
| -------- | ------------------------------------------------------------ | ----------------------------------- |
| Location | 指定存放区块文件的位置，一般为 /var/hyperledger/production/orderer。该目录下面包括 chains 子目录，存放各个 chain 的区块；index 目录，存放索引文件 | /var/hyperledger/production/orderer |

------

### Kafka 部分

> 因为不推荐使用了，暂时不关注

------

### Debug 部分

> Debug 部分主要用于对排序节点进行调试和差错时的追踪配置。

| 配置项            | 作用               | 默认值 |
| ----------------- | ------------------ | ------ |
| BroadcastTraceDir | 广播请求的追踪路径 | N/A    |
| DeliverTraceDir   | 交付请求的追踪路径 | N/A    |

------

### Operations 部分

> Operations 部分与 Peer 相关配置类似，主要设置运行时对外的 RESTful 管理服务，包括监听的地址和 TLS 安全配置.

| 配置项                 | 作用                                                     | 默认值         |
| ---------------------- | -------------------------------------------------------- | -------------- |
| ListenAddress          | RESTful 管理服务的监听地址                               | 127.0.0.1:8443 |
| TLS.Enabled            | 是否启用 TLS 保护                                        | false          |
| TLS.Certificate        | 服务端使用证书文件路径                                   | N/A            |
| TLS.PrivateKey         | 服务端使用私钥文件路径                                   | N/A            |
| TLS.ClientAuthRequired | 是否开启客户端验证以限定访问的客户端，默认关闭，推荐开启 | false          |
| TLS.ClientRootCAs      | 开启客户端验证时，信任的客户端根证书路径列表             | []             |

------

### Metrics 部分

> Metrics 部分与 Peer 相关配置类似，负责配置统计服务

| 配置项               | 作用                                                         | 默认值         |
| -------------------- | ------------------------------------------------------------ | -------------- |
| provider             | 统计服务类型，可以为 statsd (推送模式)，prometheus (拉取模式)，disabled | disabled       |
| statsd.network       | 网络协议类型，tcp 或 udp                                     | udp            |
| statsd.address       | 修改为外部 statsd 的服务地址                                 | 127.0.0.1:8125 |
| statsd.writeInterval | 推送统计汇报到 statsd 的时间间隔                             | 10s            |
| statsd.prefix        | 为所有统计推送添加前缀                                       | N/A            |

> 注意 `statsd` 和 `prometheus` 都是流行的开源监控数据收集软件。

------

### Consensus 部分

> 共识为 Raft 模式时的日志存储配置

| 配置项            | 作用                                                         | 默认值                                                |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| WALDir            | 预写日志的存储位置，每个通道独占一个同名的子目录             | /var/hyperledger/production/orderer/etcdraft/wal      |
| SnapDir           | 快照文件的存储位置，每个通道独占一个同名的子目录             | /var/hyperledger/production/orderer/etcdraft/snapshot |
| EvictionSuspicion | 节点怀疑被从通道移除，触发从其他节点获取区块来确认的等待时间。隐藏参数 | 10m                                                   |
