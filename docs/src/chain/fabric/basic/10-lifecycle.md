# 管理链码

## 管理链码

链上代码（Chaincode）简称链码，包括系统链码和用户链码。系统链码（System Chaincode）指的是 Fabric Peer 中负责系统配置、查询、背书、验证等平台功能的代码逻辑，运行在 Peer 进程内。用户链码指的是用户编写的用来实现智能合约的应用代码。如无特殊说明，链码一般指的就是用户链码。

链码被部署在 Peer 节点上，运行在独立的沙盒（目前为 Docker 容器）中，并通过 gRPC 协议与相应的 Peer 节点进行交互。用户可以通过命令行或 SDK 调用链码方法，链码被调用时，会按照链码内预定逻辑来计算账本状态的更新集合（读写集合）。

### 链码操作命令

```sh
Operate a chaincode: install|instantiate|invoke|package|query|signpackage|upgrade|list.

Usage:
  peer chaincode [command]

Available Commands:
  install     Install a chaincode.
  instantiate Deploy the specified chaincode to the network.
  invoke      Invoke the specified chaincode.
  list        Get the instantiated chaincodes on a channel or installed chaincodes on a peer.
  package     Package a chaincode
  query       Query using the specified chaincode.
  signpackage Sign the specified chaincode package
  upgrade     Upgrade chaincode.

Flags:
      --cafile string                       Path to file containing PEM-encoded trusted certificate(s) for the ordering endpoint
      --certfile string                     Path to file containing PEM-encoded X509 public key to use for mutual TLS communication with the orderer endpoint
      --clientauth                          Use mutual TLS when communicating with the orderer endpoint
      --connTimeout duration                Timeout for client to connect (default 3s)
  -h, --help                                help for chaincode
      --keyfile string                      Path to file containing PEM-encoded private key to use for mutual TLS communication with the orderer endpoint
  -o, --orderer string                      Ordering service endpoint
      --ordererTLSHostnameOverride string   The hostname override to use when validating the TLS connection to the orderer
      --tls                                 Use TLS when communicating with the orderer endpoint
      --tlsHandshakeTimeShift duration      The amount of time to shift backwards for certificate expiration checks during TLS handshakes with the orderer endpoint
      --transient string                    Transient map of arguments in JSON encoding

Use "peer chaincode [command] --help" for more information about a command.
```

最简单的操作链码的方式是使用命令行。Fabric 自 2.0 版本开始正式启用新的生命周期系统链码（位于 core/chaincode/lifecycle）来管理链码（需开启应用能力 V2_0），客户端通过新的 `peer lifecycle chaincode` 子命令（位于 internal/peer/lifecycle）对链码进行打包、安装、批注和提交等生命周期管理，取代 1.x 中的 `peer chaincode` 命令。

相对 1.x 版本中的模式，新的链码管理从单个组织升级为通道范畴。例如，链码的背书策略可由通道内多个组织来商定，部署和升级也作为通道层面的操作，这些都提高了链码生命周期的安全性。如果要对链码进行调用或查询，仍可以使用原有的 peer `chaincode invoke` 和 `peer chaincode query` 命令。

![An image](/img/chain/fabric/28.webp)

![An image](/img/chain/fabric/29.webp)

> 如果要使用 1.x 版本中的链码生命周期管理（peer chaincodeinstall/instantaite/upgrade/list 等命令），需要将通道的应用能力版本设置为兼容的低版本，如 V1_4_2。当通道启用了应用能力 V2_0 后，将无法再部署或升级原有模式下的链码。

链码生命周期：

![An image](/img/chain/fabric/30.webp)

链码操作支持全局命令选项：

| 全局选项                     | 类型     | 含义                                                 |
| ---------------------------- | -------- | ---------------------------------------------------- |
| --cafile                     | string   | 信任的排序服务的 TLS CA 的证书（PEM 编码格式）路径   |
| --certfile                   | string   | 与排序服务进行双向 TLS 认证时使用的本地证书文件路径  |
| --clientauth                 | bool     | 与排序服务通信时是否启用双向 TLS 认证                |
| --connTimeout                | duration | 客户端连接超时，默认为 3 秒                          |
| --keyfile                    | string   | 与排序服务双向 TLS 认证时使用的本地私钥文件路径      |
| -o,--orderer                 | string   | Orderer 服务地址                                     |
| --ordererTLSHostnameOverride | string   | 验证 Orderer TLS 时覆盖所校验的主机名                |
| --tls                        | bool     | 连接到 Orderer 服务时是否启用 TLS                    |
| --transient                  | string   | 调用链码时传递的临时信息，其他 peer 将无法获取该信息 |

### 打包链码

`package` 子命令可以封装链码相关的数据，将其打包为.tar.gz 安装包，供安装使用。

```sh
Package a chaincode and write the package to a file.

Usage:
  peer chaincode package [outputfile] [flags]

Flags:
  -s, --cc-package                  create CC deployment spec for owner endorsements instead of raw CC deployment spec
  -c, --ctor string                 Constructor message for the chaincode in JSON format (default "{}")
  -h, --help                        help for package
  -i, --instantiate-policy string   instantiation policy for the chaincode
  -l, --lang string                 Language the chaincode is written in (default "golang")
  -n, --name string                 Name of the chaincode
  -p, --path string                 Path to chaincode
  -S, --sign                        if creating CC deployment spec package for owner endorsements, also sign it with local MSP
  -v, --version string              Version of the chaincode specified in install/instantiate/upgrade commands

Global Flags:
      --cafile string                       Path to file containing PEM-encoded trusted certificate(s) for the ordering endpoint
      --certfile string                     Path to file containing PEM-encoded X509 public key to use for mutual TLS communication with the orderer endpoint
      --clientauth                          Use mutual TLS when communicating with the orderer endpoint
      --connTimeout duration                Timeout for client to connect (default 3s)
      --keyfile string                      Path to file containing PEM-encoded private key to use for mutual TLS communication with the orderer endpoint
  -o, --orderer string                      Ordering service endpoint
      --ordererTLSHostnameOverride string   The hostname override to use when validating the TLS connection to the orderer
      --tls                                 Use TLS when communicating with the orderer endpoint
      --tlsHandshakeTimeShift duration      The amount of time to shift backwards for certificate expiration checks during TLS handshakes with the orderer endpoint
      --transient string                    Transient map of arguments in JSON encoding
```

其中，生成的打包文件中包括 Chaincode-Package-Metadata.json、Code-Package.tar.gz 两个文件。Chaincode-Package-Metadata.json 内容包括链码路径、类型、标签等信息.Code-Package.tar.gz 内容包括链码的源码包结构，如 src/examples/chaincode/go/testcc/ 路径以及内容，但不能包括对目录以外路径的引用。

> 注意：自 2.0 版本起，编译链码的 ccenv 镜像不再包括 shim 层。链码需要自行包括 github.com/hyperledger/fabric-chaincode-go/shim 和其他所需要的依赖包。

### 安装链码

打包后的链码安装包文件，可以使用 install 命令安装到运行链码的各个 Peer。

```sh
Install a chaincode on a peer. This installs a chaincode deployment spec package (if provided) or packages the specified chaincode before subsequently installing it.

Usage:
  peer chaincode install [flags]

Flags:
      --connectionProfile string       Connection profile that provides the necessary connection information for the network. Note: currently only supported for providing peer connection information
  -c, --ctor string                    Constructor message for the chaincode in JSON format (default "{}")
  -h, --help                           help for install
  -l, --lang string                    Language the chaincode is written in (default "golang")
  -n, --name string                    Name of the chaincode
  -p, --path string                    Path to chaincode
      --peerAddresses stringArray      The addresses of the peers to connect to
      --tlsRootCertFiles stringArray   If TLS is enabled, the paths to the TLS root cert files of the peers to connect to. The order and number of certs specified should match the --peerAddresses flag
  -v, --version string                 Version of the chaincode specified in install/instantiate/upgrade commands

Global Flags:
      --cafile string                       Path to file containing PEM-encoded trusted certificate(s) for the ordering endpoint
      --certfile string                     Path to file containing PEM-encoded X509 public key to use for mutual TLS communication with the orderer endpoint
      --clientauth                          Use mutual TLS when communicating with the orderer endpoint
      --connTimeout duration                Timeout for client to connect (default 3s)
      --keyfile string                      Path to file containing PEM-encoded private key to use for mutual TLS communication with the orderer endpoint
  -o, --orderer string                      Ordering service endpoint
      --ordererTLSHostnameOverride string   The hostname override to use when validating the TLS connection to the orderer
      --tls                                 Use TLS when communicating with the orderer endpoint
      --tlsHandshakeTimeShift duration      The amount of time to shift backwards for certificate expiration checks during TLS handshakes with the orderer endpoint
      --transient string                    Transient map of arguments in JSON encoding
```

| 参数                | 类型        | 含义                                           |
| ------------------- | ----------- | ---------------------------------------------- |
| --connectionProfile | string      | 网络访问信息文件路径，目前仅支持 peer 连接信息 |
| --peerAddresses     | stringArray | 请求所发往的 peer 地址列表                     |
| --tlsRootCertFiles  | stringArray | 所连接的 peer 的信任 TLS 根证书                |

Peer 会尝试编译链码，如果编译成功，则将安装包以二进制的形式储存到指定路径的 chaincodes 子目录下，并利用元数据标签和安装包生成的 SHA256 值作为文件名。

Peer 会尝试编译链码，如果编译成功，则将安装包以二进制的形式储存到指定路径的 chaincodes 子目录下，并利用元数据标签和安装包生成的 SHA256 值作为文件名。

> 注意，安装操作需要是 Peer 认可的组织管理员身份（证书在 Peer 的 admincerts 目录下存在）。

### 查询和批准链码

通道内组织在部署链码前需要足够多的组织管理员对链码定义进行投票批准。链码定义包括链码名称、版本、序列号、背书和验证参数、是否需要初始化、链码包 Id，以及可能带有的私密数据集合配置等。操作涉及 `queryinstalled`、`getinstalled-package`、`approveformyorg`、`checkcommitrea-diness` 四个链码生命周期子命令。

`queryinstalled` 子命令可以查询目标 Peer 上已经安装的链码信息。支持的参数包括：

- --connectionProfile (string)，网络访问信息文件路径，目前仅支持 Peer 连接信息。
- -O,--output (string)，结果输出的格式，目前支持格式化为 json 格式。
- --peerAddresses (stringArray)，请求所发往的 Peer 地址列表。
- --tlsRootCertFiles (stringArray)，所连接的 Peer 的信任的 TLS 根证书。

`getinstalledpackage` 子命令可以获取指定的链码安装包（与发送给 Peer 的安装包内容相同）。支持参数包括：

- --connectionProfile (string)，网络访问信息文件路径，目前仅支持 Peer 连接信息。
- --output-directory (string)，将获取到的链码安装包保存到指定路径，默认为当前路径。
- --package-id (string)，所要获取的链码安装包的 ID。
- --peerAddresses (stringArray)，请求所发往的 Peer 地址列表。
- --tlsRootCertFiles (stringArray)，所连接的 Peer 的信任的 TLS 根证书。

`approveformyorg` 子命令允许用户将链码的定义发送给 Peer 进行背书，通过后发给 Orderer 进行排序和确认。所有需要执行链码的组织都需要完成此步骤。默认情况下，只有通道内大多数组织（通道内的 Channel/Application/LifecycleEndorsement 策略指定，默认为通道内大多数成员）都批准了链码定义，对应链码才能在通道内部署运行。支持的参数包括：

- --channel-config-policy (string)，指定链码的背书策略名称，该策略名称需要提前存储在通道策略配置中，默认为 Channel/Application/Endorsement 策略（默认为通道内大多数成员组织背书）。
- -C,--channelID (string)，执行命令面向的通道名称。
- --collections-config (string)，启用私密数据功能时，指定集合文件的路径。
- --connectionProfile (string)，网络访问信息文件路径，目前仅支持 Peer 连接信息。
- -E,--endorsement-plugin (string)，链码所使用的背书插件的名称。
- --init-required，是否需要调用 Init 方法对链码进行初始化。
- -n,--name (string)，链码名称。
- --package-id (string)，链码安装包的名称。
- --peerAddresses (stringArray)，所连接的 Peer 节点列表。
- --sequence (int)，通道内对链码进行定义的序列号（默认为 1），每次更新链码定义则需要递增。
- --signature-policy (string)，指定链码的（基于签名的）背书策略，默认采用 Channel/Application/Endorsement 指定的策略（默认为通道内大多数成员组织背书），不能与 --channel-config-policy 同时使用。
- --tlsRootCertFiles (stringArray)，连接 Peer 启用 TLS 时，所信任的 TLS 根证书列表（注意与 Peer 地址顺序匹配）。
- -V,--validation-plugin (string)，链码所使用的校验系统插件名称。
- --waitForEvent，是否等待事件以确认交易在各个 Peer 提交（默认开启）。
- --waitForEventTimeout (duration)，等待事件的时间（默认为 30s）。

`checkcommitreadiness` 子命令可以获取指定的链码安装包当前的批准状态，调用_lifecycle 链码 CheckCommitReadiness 方法（位于 core/chaincode/lifecycle/scc.go）。支持参数与 approveformyorg 子命令类似。

### 提交链码并查询状态

通道内链码得到足够多的组织批准后，将成为可以合法运行的链码。此时，任意通道内组织可以使用 commit 子命令发起提交操作。链码定义被成功提交到通道后，通道内成员可以使用链码（如进行调用）。支持的参数包括：

- --channel-config-policy (string)，指定链码的背书策略名称，该策略名称需要提前存储在通道策略配置中，默认为 Channel/Application/Endorsement 策略（默认为通道内大多数成员组织背书）。
- -C,--channelID (string)，执行命令面向的通道名称。
- --collections-config (string)，启用私密数据功能时，指定集合文件的路径。
- --connectionProfile (string)，网络访问信息文件路径，目前仅支持 Peer 连接信息。
- -E,--endorsement-plugin (string)，链码所使用的背书插件的名称。
- --init-required，是否需要调用 Init 方法对链码进行初始化。
- -n,--name (string)，链码名称。
- --package-id (string)，链码安装包的名称。
- --peerAddresses (stringArray)，所连接的 Peer 节点列表。
- --sequence (int)，通道内对链码进行定义的序列号（默认为 1），每次更新链码定义则需要递增。
- --signature-policy (string)，指定链码的（基于签名的）背书策略，默认采用 Channel/Application/Endorsement 指定的策略（默认为通道内大多数成员组织背书），不能与 --channel-config-policy 同时使用。
- --tlsRootCertFiles (stringArray)，连接 Peer 启用 TLS 时，所信任的 TLS 根证书列表（注意与 Peer 地址顺序匹配）。
- -V,--validation-plugin (string)，链码所使用的校验系统插件名称。
- --waitForEvent，是否等待事件以确认交易在各个 Peer 提交（默认开启）。
- --waitForEventTimeout (duration)，等待事件的时间（默认为 30s）。
- -C,--channelID (string)，执行命令的通道名称。
- --connectionProfile (string)，网络访问信息文件路径，目前仅支持 Peer 连接信息。
- -n,--name (string)，链码名称。
- -O,--output (string)，结果输出的格式，目前支持 json 格式。
- --peerAddresses (stringArray)，所连接的 Peer 地址列表。
- --tlsRootCertFiles (stringArray)，连接 Peer 启用 TLS 时，所信任的 TLS 根证书列表（注意与 Peer 地址顺序匹配）。

> 首先使用 commit 子命令提交已经得到批准的链码定义，然后使用 querycommitted 子命令查询提交状态

### 使用私有数据

在批准和提交链码定义时，可以通过 `--collections-config collection.json` 来指定与私密数据相关的集合配置（Fabric v1.1.0 开始支持），可以实现在同一通道内私密数据的调用只有部分成员共享。如果不指定该参数则默认不启用该特性，意味着通道内所有成员都可以看到链码调用结果。

`collections_config.json` 配置文件示例 :

```json
[
 {
   "name": "collection1", // 集合名称
   "policy": "OR('Org1MSP.member')", // 集合成员
   "requiredPeerCount": 0, // 背书之前至少扩散私有数据到的节点数
   "maxPeerCount": 3, // 背书之前尝试扩散最多节点个数, 不能小于 requiredPeerCount
   "blockToLive": 1000000, // 私有数据保存时长 0 意味着永不过期
   "memberOnlyRead": true, // 是否只允许集合成员来读取私有数据
   "memberOnlyWrite": true,// 是否只允许集合成员来发起对私有数据的写交易
   "endorsementPolicy": "OR('Org1MSP.member')" ,// 指定对私有数据写操作时的背书策略
   "signaturePolicy": "OR('Org1MSP.member')" // 指定使用签名策略
},
 {
   "name": "collection2",
   "policy": "OR('Org2MSP.member')",
   "requiredPeerCount": 0,
   "maxPeerCount": 3,
   "blockToLive": 1,
   "memberOnlyRead": true
 }
]
```

其中，collection.json 中定义了 collection1 和 collection2 两个集合，其成员分别为 Org1、Org2 两个组织。当在链码逻辑中指定某个键值属于特定集合时，只有集合内成员能看到明文的读写集合，非集合成员即使在同一通道内也无法获取私密数据。对应 policy 只支持 OR 语法，指定哪些组织可以看到私密数据集合。

requiredPeerCount 和 maxPeerCount 指定了在执行背书过程中尝试扩散数据到其他合法节点的个数，避免因背书节点的突然故障而导致私密数据丢失。背书阶段未获取私密数据的合法节点，在提交阶段会尝试从其他节点来拉取私密数据。

------

### 调用链码

通过 `peer chaincode invoke` 命令（实现位于 internal/peer/chaincode）可以调用运行中链码定义的方法，所指定的函数名和参数会被传到链码的 Invoke () 方法进行处理。调用链码操作需要同时与 Peer 和 Orderer 打交道。

```sh
Invoke the specified chaincode. It will try to commit the endorsed transaction to the network.

Usage:
  peer chaincode invoke [flags]

Flags:
  -C, --channelID string               The channel on which this command should be executed
      --connectionProfile string       Connection profile that provides the necessary connection information for the network. Note: currently only supported for providing peer connection information
  -c, --ctor string                    Constructor message for the chaincode in JSON format (default "{}")
  -h, --help                           help for invoke
  -I, --isInit                         Is this invocation for init (useful for supporting legacy chaincodes in the new lifecycle)
  -n, --name string                    Name of the chaincode
      --peerAddresses stringArray      The addresses of the peers to connect to
      --tlsRootCertFiles stringArray   If TLS is enabled, the paths to the TLS root cert files of the peers to connect to. The order and number of certs specified should match the --peerAddresses flag
      --waitForEvent                   Whether to wait for the event from each peer's deliver filtered service signifying that the 'invoke' transaction has been committed successfully
      --waitForEventTimeout duration   Time to wait for the event from each peer's deliver filtered service signifying that the 'invoke' transaction has been committed successfully (default 30s)

Global Flags:
      --cafile string                       Path to file containing PEM-encoded trusted certificate(s) for the ordering endpoint
      --certfile string                     Path to file containing PEM-encoded X509 public key to use for mutual TLS communication with the orderer endpoint
      --clientauth                          Use mutual TLS when communicating with the orderer endpoint
      --connTimeout duration                Timeout for client to connect (default 3s)
      --keyfile string                      Path to file containing PEM-encoded private key to use for mutual TLS communication with the orderer endpoint
  -o, --orderer string                      Ordering service endpoint
      --ordererTLSHostnameOverride string   The hostname override to use when validating the TLS connection to the orderer
      --tls                                 Use TLS when communicating with the orderer endpoint
      --tlsHandshakeTimeShift duration      The amount of time to shift backwards for certificate expiration checks during TLS handshakes with the orderer endpoint
      --transient string                    Transient map of arguments in JSON encoding
```

> 注意，invoke 是异步操作，invoke 成功只能保证交易已经进入 Orderer 进行排序，但无法保证最终写到账本中（例如交易未通过 Committer 验证而被拒绝）。需要通过事件监听或主动查询等方式来进行确认交易是否最终写到账本上。

------

### 查询链码

查询链码可以通过 `peer chaincode query` 子命令。

该子命令实际上是 invoke 操作与 Peer 打交道的部分，即将签名后的 Proposal 发给指定的 Peer 节点的 ProcessProposal () gRPC 接口。最终将 - c 指定的命令参数发送给了链码中的 Invoke () 方法执行。

query 操作与 invoke 操作的区别在于，query 操作用来查询 Peer 上账本状态（需要链码支持查询逻辑），不生成交易，也不需要与 Orderer 打交道。同时，query 命令默认只返回第一个 Peer 的查询结果。

```sh
Get endorsed result of chaincode function call and print it. It won't generate transaction.

Usage:
  peer chaincode query [flags]

Flags:
  -C, --channelID string               The channel on which this command should be executed
      --connectionProfile string       Connection profile that provides the necessary connection information for the network. Note: currently only supported for providing peer connection information
  -c, --ctor string                    Constructor message for the chaincode in JSON format (default "{}")
  -h, --help                           help for query
  -x, --hex                            If true, output the query value byte array in hexadecimal. Incompatible with --raw
  -n, --name string                    Name of the chaincode
      --peerAddresses stringArray      The addresses of the peers to connect to
  -r, --raw                            If true, output the query value as raw bytes, otherwise format as a printable string
      --tlsRootCertFiles stringArray   If TLS is enabled, the paths to the TLS root cert files of the peers to connect to. The order and number of certs specified should match the --peerAddresses flag

Global Flags:
      --cafile string                       Path to file containing PEM-encoded trusted certificate(s) for the ordering endpoint
      --certfile string                     Path to file containing PEM-encoded X509 public key to use for mutual TLS communication with the orderer endpoint
      --clientauth                          Use mutual TLS when communicating with the orderer endpoint
      --connTimeout duration                Timeout for client to connect (default 3s)
      --keyfile string                      Path to file containing PEM-encoded private key to use for mutual TLS communication with the orderer endpoint
  -o, --orderer string                      Ordering service endpoint
      --ordererTLSHostnameOverride string   The hostname override to use when validating the TLS connection to the orderer
      --tls                                 Use TLS when communicating with the orderer endpoint
      --tlsHandshakeTimeShift duration      The amount of time to shift backwards for certificate expiration checks during TLS handshakes with the orderer endpoint
      --transient string                    Transient map of arguments in JSON encoding
```

------

### 升级链码

链码升级过程需要重复 `peer lifecycle chaincode` 相关命令，来执行完整的生命周期，具体步骤如下：

1. 更新旧版本链码的源代码，并重新打包链码包。
2. 将新的链码包再次安装到 Peer，获取新的包 Id。注意，相对旧版本要递增版本号。
3. 按照策略，通道内足够多组织都要重新对新版本的链码定义进行批准。注意，序列号要递增。
4. 通道内足够多组织批准定义后，可以提交新版本链码定义到通道。
5. 再次调用链码，确保链码已经自动更新为新的版本。
