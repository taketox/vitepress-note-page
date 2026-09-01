# 访问控制

## 访问控制

访问控制是区块链网络十分重要的功能，负责控制某个身份在某个场景下是否允许采取某个操作（如读写某个资源）。

常见的访问控制模型包括强制访问控制（Mandatory Access Control）、自主访问控制（Discretionary Access Control）、基于角色的访问控制（Role BasedAccess Control）和基于属性的访问控制（Attribute Based Access Control）。功能越强大的模型，实现起来往往越复杂。

Fabric 通过权限策略和访问控制列表（ACL）机制实现了基于角色的访问控制模型，可以满足通道内资源访问、背书控制或链码调用控制等多个场景下的需求。

### 应用场景

访问场景包括采用不同策略（如通道策略、节点策略、背书策略等），按照访问控制列表（如要求身份为 Admins、Writers 等）对某资源的特定操作进行限制。

![An image](/img/chain/fabric/20.webp)

![An image](/img/chain/fabric/21.webp)

### 身份证书

实现权限策略的基础是身份，身份的实现依赖证书机制。通过基于 PKI 的成员身份管理，Fabric 网络可以对网络内的资源和接入用户的各种能力进行限制。

Fabric 最初设计中考虑了三种类型的证书：登记证书（Enrollment Certificate）、交易证书（Transaction Certif icate），以及保障通信链路安全的 TLS 证书。证书的默认签名算法为 ECDSA，Hash 算法为 SHA-256。

- 登记证书（ECert）：颁发给提供了注册凭证的用户或节点等实体，代表网络中身份。可以长期有效。
- 交易证书（TCert）：颁发给用户，控制每个交易的权限，不同交易可以不同，实现匿名性，短期有效。暂未实现。
- 通信证书（TLSCert）：控制对网络层的接入访问，可以对远端实体身份进行校验，防止窃听。可以长期有效。

目前，在实现上，主要通过 ECert 来对实体身份进行检验，通过检查签名来实现权限管理。TCert 功能暂未实现，用户可以使用 idemix 机制来实现部分匿名性。

### 身份集合

基于证书机制，Fabric 设计了身份集合（MSPPrincipal）来灵活标记一组拥有特定身份的个体.

![An image](/img/chain/fabric/22.webp)

对应的 MSPPrincipal 的数据结构:

![An image](/img/chain/fabric/23.webp)

身份集合支持从以下不同维度对身份进行分类。

- Role：根据证书角色来区分，如 Member、Admin、Client、Peer、Orderer 等。
- OrganizationUnit：根据身份证书中指定的 OU 信息来区分。
- Identity：具体指定某个个体的证书，只有完全匹配才认为合法。
- Anonymity：证书是否是匿名的，用于 idemix 类型的 MSP。
- Combined：由其他多个子身份集合组成，需要符合所有的子集合才认为合法。

基于不同维度可以灵活指定符合某个身份的个体，例如，某个 MSP 的特定角色（如成员或管理员），或某个 MSP 的特定单位（OrganizationUnit），当然也可以指定为某个特定个体。

注意，目前对不同角色的认可采取不同方法。对于管理员角色，会认可本地 msp/admincerts 路径下的证书列表或证书带有代表管理员角色的 OU 信息；Client、Peer、Orderer 等角色则需要查看证书是否带有对应的 OU 域；对于成员角色，则需要证书是由对应组织根证书签发。

### 权限策略的实现

权限策略指定了可以执行某项操作的身份集合。以通道相关的策略为例，一般包括对读操作（例如获取通道的交易、区块等数据）、写操作（例如向通道发起交易）、管理操作（例如加入通道、修改通道的配置信息）等进行权限限制。对策略配置自身的修改是通过额外指定的修改策略（mod_policy）来实现的。

操作者在发起操作时，其请求中签名组合只有满足策略指定的身份规则，才允许执行。实现上，每种策略结构都要实现 Policy 接口。对于给定的一组签名数据或身份，按照给定规则进行检验，看是否符合约定的条件。符合则说明满足了该策略；反之则拒绝。

#### 数据结构

策略相关的数据结构定义在 fabric-protos-go 项目的 common/policies.pb.go 文件中，其中主要包括 Policy、SignaturePolicyEnvelope（内嵌 SignaturePolicy 结构）和 ImplicitMetaPolicy 三种数据结构，如图 14-20 所示。

![An image](/img/chain/fabric/24.webp)

其中，Type 的数值代表策略的类型，具体含义为：

- UNKNOWN，保留值，用于初始化。
- SIGNATURE，通过匹配基于签名的组合，如某个 MSP 中至少有三个签名。
- MSP，代表策略必须匹配某 MSP 下的指定身份，如 MSP 的管理员身份。
- IMPLICIT_META，隐式类型，包括若干子策略，并通过 Rule 来指定具体的规则，包括 ANY、ALL、MAJORITY 三种，仅用于通道配置内标记通道规则。

目前已经实现支持的策略类型主要包括 SIGNATURE 策略和 IMPLICIT_META 策略两种。

#### SIGNATURE 策略

SIGNATURE 策略指定通过签名来对数据进行认证，例如，必须满足给定身份的签名组合

![An image](/img/chain/fabric/25.webp)

其中，SignaturePolicy 结构体代表了一个策略规则（rule）。支持指定某个特定签名，或者满足给定策略集合中的若干个（NOutOf）即可。NOutOf 用法十分灵活，基于它可以递归地构建任意复杂的策略语义，指定多个签名规则的与、或组合关系。

SignaturePolicyEnvelope 结构体代表了一个完整的策略，包括版本号（version）、策略规则（rule）和策略关联的身份集合（identities）。

例如，某个策略要求满足 MP1 身份集合签名，或者 MP2 集合和 MP3 集合同时签名，则可以表达为 MP1||(MP2&&MP3)。对应的策略结构如下：

```go
SignaturePolicyEnvelope{
    version: 0,
    rule: SignaturePolicy{
        n_out_of: NOutOf{
            N: 1,
            rules: [
                SignaturePolicy{ signed_by: 0 },
                SignaturePolicy{
                    n_out_of: NOutOf{
                        N: 2,
                        rules: [
                            SignaturePolicy{ signed_by: 1 },
                            SignaturePolicy{ signed_by: 2 },
                        ],
                    },
                },
            ],
        },
    },
    identities: [MP1, MP2, MP3] // 身份集合列表
}
// github.com/hyperledger/fabric-protos-go/common/policies.pb.go
type ImplicitMetaPolicy struct {
    SubPolicy string // 子策略类型名称，如 Readers、Writers、Admins
    Rule ImplicitMetaPolicy_Rule // 子策略的匹配条件，可以为 ANY、ALL、MAJORITY
}
ImplicitMetaPolicy{
    sub_policy: "Readers",
    rule: ANY,
}
```

需要注意，对签名策略的匹配过程是顺序敏感的（参考 FAB-4749）。进行策略检查时，给定的多个签名会按照策略顺序依次与身份集合进行匹配，签名一旦匹配则会被消耗掉，再检查下一个签名。例如上述例子中，假如 MP1 代表组织 A 的管理员，MP2 代表组织 B 的成员，MP3 代表组织 B 的管理员，那么对于签名组合 [S1={组织 B 的管理员}，S2={组织 B 的成员}]，并不会匹配成功。因为，S1 在匹配 MP2 后会被消耗掉，剩下的 S2 在匹配 MP3 时会失败。为了避免这种情况，进行签名时要将优先级较低的签名放到前面，比如代表成员身份的签名应当放到管理员身份前。同时，对于策略的身份集合列表，则应该将高优先级的放到前面。

#### IMPLICIT_META 策略

IMPLICIT_META 策略用于通道配置，它并不直接进行签名检查，而是通过引用其他子策略（最终还是通过 SIGNATURE 策略）来实现。检查结果通过策略规则进行约束。

![An image](/img/chain/fabric/26.webp)

### 通道策略

权限策略的主要应用场景之一便是通道策略。通道策略采用了层级化树形结构，最上层为 / Channel 组，下面是各级子组。在每一级别都可以指定策略，作为本层级的默认策略。

通道配置可以包括联盟组（仅当系统通道，包括联盟组织信息）、应用组（一般仅当应用通道，包含使用通道的组织信息）和排序组（包括排序组织信息）等不同的元素。

一个典型的应用通道的例子如图 14-23 所示，包括一个排序组和一个应用组。

![An image](/img/chain/fabric/27.webp)

默认情况下，通道内的策略使用的角色定义如下：

```sh
# 通道全局策略
/Channel/Readers: ImplicitMetaPolicy-ANY Readers
/Channel/Writers: ImplicitMetaPolicy-ANY Writers
/Channel/Admins : ImplicitMetaPolicy-MAJORITY Admins
# 通道内应用组默认策略（仅当应用通道），需要从应用组织中推断
/Channel/Application/Readers: ImplicitMetaPolicy-ANY Readers
/Channel/Application/Writers: ImplicitMetaPolicy-ANY Writers
/Channel/Application/Admins : ImplicitMetaPolicy-MAJORITY Admins
/Channel/Application/Endorsement: ImplicitMetaPolicy-MAJORITY Endorsement
/Channel/Application/LifecycleEndorsement: ImplicitMetaPolicy-MAJORITY 
LifecycleEndorsement
# 通道内应用组各组织的默认策略（仅当应用通道）
/Channel/Application/Org/Readers: SignaturePolicy for 1 of Org Member
/Channel/Application/Org/Writers: SignaturePolicy for 1 of Org Member
/Channel/Application/Org/Admins : SignaturePolicy for 1 of Org Admin
/Channel/Application/Org/Endorsement: SignaturePolicy for 1 of Org Member
# 通道内排序组的默认策略，需要从排序组织中推断
/Channel/Orderer/Readers: ImplicitMetaPolicy-ANY Readers
/Channel/Orderer/Writers: ImplicitMetaPolicy-ANY Writers
/Channel/Orderer/Admins : ImplicitMetaPolicy-MAJORITY Admins
/Channel/Orderer/BlockValidation: ImplicitMetaPolicy-ANY Writers
# 通道内排序组中各组织的默认策略
/Channel/Orderer/Org/Readers: SignaturePolicy for 1 of Org Member
/Channel/Orderer/Org/Writers: SignaturePolicy for 1 of Org Member
/Channel/Orderer/Org/Admins : SignaturePolicy for 1 of Org Admin
# 通道内联盟组的默认策略（仅当系统通道）
/Channel/Consortiums/Admins: SignaturePolicy for ANY
# 通道内联盟组中某联盟的默认通道创建策略（仅当系统通道）
/Channel/Consortiums/Consortium/ChannelCreationPolicy: ImplicitMetaPolicy-ANY 
for Admin
# 通道内联盟组中某联盟组织的默认策略（仅当系统通道）
/Channel/Consortiums/Consortium/Org/Readers: SignaturePolicy for 1 of Org Member: 
 ImplicitMetaPolicy-ANY for Admin
/Channel/Consortiums/Consortium/Org/Writers: SignaturePolicy for 1 of Org Member
/Channel/Consortiums/Consortium/Org/Admins : SignaturePolicy for 1 of Org Admin
```

其中，通道内的元素，默认对其进行修改的策略（mod_policy）为 Admins；与排序相关的配置的修改策略则指定为 / Channel/Orderer/Admins，主要包括系统通道内相关配置，如 Orderer-Addresses、Consortiums 和具体的联盟配置。

另外，应用通道的策略会考虑最新配置中的 Orderer 组和 Application 组；系统通道的策略会考虑最新配置中的 Orderer 组和 Consortiums 组。新建应用通道时，用户需要指定 Application 组配置，如果不指定 Orderer 组配置，会自动从系统通道中继承过来。

### 通道访问控制

目前，Fabric 中大多数的访问权限通过通道访问控制列表来指定。访问控制列表位于通道配置中，被通道内所有成员认可。可以在新建通道时利用 conf igtx.yaml 指定，也可以后期通过配置更新进行变更。访问控制列表配置示例如下，包括访问控制列表和其引用的策略：

```yaml
Application: &ApplicationDefaults
    ACLs: &ACLsDefault
        # Lifecycle 方法调用权限：CheckCommitReadiness()、CommitChaincodeDefinition()、 
QueryChaincodeDefinition()、QueryChaincodeDefinitions()
        _lifecycle/CheckCommitReadiness: /Channel/Application/Writers
        _lifecycle/CommitChaincodeDefinition: /Channel/Application/Writers
        _lifecycle/QueryChaincodeDefinition: /Channel/Application/Readers
        _lifecycle/QueryChaincodeDefinitions: /Channel/Application/Readers
        # LSCC 方法调用权限：getid()、getdepspec()、getccdata()、getchaincodes()
        lscc/ChaincodeExists: /Channel/Application/Readers
lscc/GetDeploymentSpec: /Channel/Application/Readers
        lscc/GetChaincodeData: /Channel/Application/Readers
        lscc/GetInstantiatedChaincodes: /Channel/Application/Readers
        # QSCC 方法调用权限：GetChainInfo()、GetBlockByNumber()、GetBlockByHash()、
GetTransactionByID()、GetBlockByTxID()
        qscc/GetChainInfo: /Channel/Application/Readers
        qscc/GetBlockByNumber: /Channel/Application/Readers
        qscc/GetBlockByHash: /Channel/Application/Readers
        qscc/GetTransactionByID: /Channel/Application/Readers
        qscc/GetBlockByTxID: /Channel/Application/Readers
        # CSCC 方法调用权限：GetConfigBlock()
        cscc/GetConfigBlock: /Channel/Application/Readers
        # 通道内链码调用权限（向 Peer 发送背书请求）
        peer/Propose: /Channel/Application/Writers
        # 通道内跨链码调用权限
        peer/ChaincodeToChaincode: /Channel/Application/Readers
        # 接收区块事件权限
        event/Block: /Channel/Application/Readers
        # 接收过滤区块事件权限
        event/FilteredBlock: /Channel/Application/Readers
    # 默认应用通道内组织成员为空
    Organizations:
    # 通道内相关的策略，可被 ACL 中引用，用户也可以自定义全局策略
    Policies: &ApplicationDefaultPolicies
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
    # 引用应用通道默认的能力集合
    Capabilities:
        <<: *ApplicationCapabilities
```

目前通道配置支持的资源访问权限总结如表:

| 资源访问                                     | 权限          | 功能                     |
| -------------------------------------------- | ------------- | ------------------------ |
| Lifecycle/InstallChaincode                   | 本 MSP Admins | 安装链码                 |
| Lifecycle/QueryInstalledChaincode            | 本 MSP Admins | 查询已安装的链码信息     |
| Lifecycle/GetInstalledChaincodePackage       | 本 MSP Admins | 获取链码安装包           |
| Lifecycle/QueryInstalledChaincodes           | 本 MSP Admins | 查询所有已安装链码列表   |
| Lifecycle/ApproveChaincodeDefinitionForMyOrg | 本 MSP Admins | 本 MSP Admins            |
| Lifecycle/CommitChaincodeDefinition          | 通道 Writers  | 提交链码定义             |
| Lifecycle/QueryChaincodeDefinition           | 通道 Writers  | 查询指定的已提交链码定义 |
| Lifecycle/CheckCommitReadiness               | 通道 Writers  | 检查链码定义提交状态     |
| Lscc/Install                                 | 本 MSP Admins | 传统安装链码             |
| Lscc/GetInstalledChaincodes                  | 本 MSP Admins | 传统获取安装链码列表     |
| Lscc/Deploy                                  | 通道 Writers  | 传统实例化链码           |
| Lscc/Upgrade                                 | 通道 Writers  | 传统升级链码             |
| Lscc/ChaincodeExists                         | 通道 Readers  | 检查链码是否安装         |
| Lscc/GetDeploymentSpec                       | 通道 Readers  | 获取安装包               |
| Lscc/GetChaincodeData                        | 通道 Readers  | 获取链码完整数据包       |
| Lscc/GetInstantiatedChaincodes               | 通道 Readers  | 获取已实例化链码列表     |
| Lscc/GetCollectionsConfig                    | 通道 Readers  | 获取私有数据集合配置     |
| Qscc/GetChainInfo                            | 通道 Readers  | 查询通道信息             |
| Qscc/GetBlockByNumber                        | 通道 Readers  | 获取指定序号区块         |
| Qscc/GetBlockByHash                          | 通道 Readers  | 获取指定 hash 区块       |
| Qscc/GetTransactionByID                      | 通道 Readers  | 获取指定 ID 交易         |
| Qscc/GetBlockByTxID                          | 通道 Readers  | 获取包括指定交易的区块   |
| Qscc/JoinChain                               | 通道 Readers  | 加入通道                 |
| Qscc/GetChannels                             | 通道 Readers  | 获取已加入的通道列表     |
| Qscc/GetConfigBlock                          | 通道 Readers  | 获取配置区块             |
| Peer/Propose                                 | 通道 Writers  | 调用链码                 |
| Peer/ChaincodeToChaincode                    | 通道 Writers  | 跨链码调用               |
| Event/Block                                  | 通道 Readers  | 监听完整区块事件         |
| Event/FilteredBlock                          | 通道 Readers  | 监听过滤区块事件         |

### 背书策略

#### 链码背书策略

用户在批准执行链码（2.0 版本之前为实例化链码）时，可以指定调用该链码需要满足的背书策略（Endorsement Policy）并存放到链码定义中。当对链码的调用交易被提交时，Peer 会检查是否交易携带了符合指定背书策略的签名信息。

背书策略可以采用 SignaturePolicy 或 ChannelConf igPolicy 两种方式进行指定，构建十分灵活的策略组合。SignaturePolicy 方式指定使用特定身份签名组合来进行背书。例如，指定某几个组织内的任意成员身份进行背书，或者至少有一个管理员身份进行背书等。

语法上，背书策略通过 - P 指定需要哪些 SignaturePolicy；通过 - T 指定所需要的 Signature-Policy 个数。目前，客户端已经实现了对背书策略的初步支持，通过 - P 来指定通过 AND、OR、OutOf 组合的身份角色（包括 admin、member、peer、client）集合。

下面的策略指定要么 Org1 的管理员进行背书，要么 Org2 和 Org3 的 peer 节点同时进行背书：

```sh
OR('Org1.admin', AND('Org2.peer', 'Org3.peer'))
```

下面的策略指定三个组织中至少两个组织的成员进行背书：

```sh
OutOf(2, 'Org1.member', 'Org2.member', 'Org3.member')
```

ChannelConf igPolicy 方式则引用通道配置内的已有策略名，使用对应的身份进行背书。

例如，如果不显式指定背书策略，则会使用通道配置中的 Channel/Application/Endorsement 策略，其默认为通道内的大多数成员。

#### 键值背书策略

除了面向链码（该链码的所有状态）的背书策略外，自 1.3.0 版本开始，Fabric 支持基于特定状态（键值）的更细粒度的背书策略。用户可以指定要修改某个指定状态时所需的背书策略。

包括如下的 shim 层 API，可以在链码内使用。

- GetStateValidationParameter (collection,key string)([] byte,error)：获取指定集合对指定键值的背书策略。
- SetStateValidationParameter (collection,key string,ep [] byte) error：指定某个键值所绑定的背书策略。
- GetPrivateDataValidationParameter (collection,key string)([] byte,error)：获取指定集合对指定私密键值的背书策略。
- SetPrivateDataValidationParameter (collection,key string,ep [] byte) error：指定某个私密键值对应的背书策略。

Peer 在提交区块阶段会对背书策略进行检查.

#### 私有数据集合背书策略

自 2.0 版本起，用户也可以为每个私密数据集合指定对应的背书策略。当用户对私密数据集合内的键值进行写或修改操作时，需要满足指定的背书策略。此时，链码的整体背书策略会被忽略。发起写请求的用户不必为私密数据集合的成员。使用私密数据集合背书策略，可以限制对私密数据的写操作，实现更为安全的链码访问保护。

类似于链码背书策略，私密数据集合背书策略支持 SignaturePolicy 或 ChannelConf igPolicy 两种方式。例如，可以在集合配置文件 collection.json 中指定 signaturePolicy 或 channelConf ig-Policy 背书策略，示例代码如下：

```json
[
 {
     "name": "collection1",     　　// 集合名称
     "policy": "OR('Org1MSP.member', 'Org2MSP.member')", // 集合成员
     "requiredPeerCount": 1, // 背书之前至少扩散私密数据到的节点数
     "maxPeerCount": 3,      // 背书之前尝试扩散最多节点个数，不能小于 requiredPeerCount
     "blockToLive":99999,    // 私密数据保存时长。0 意味着永不过期
     "memberOnlyRead": true, // 是否只允许集合成员（如客户端）来读取私密数据，v1.4 开始支持
     "memberOnlyWrite": true,// 是否只允许集合成员（如客户端）来发起对私密数据的写交易，v2.0  
         // 开始支持
     "endorsementPolicy": {  // 指定对私密数据进行写操作时的背书策略，会取代链码的背书策略
      "signaturePolicy": "OR('Org1MSP.member')" // 指定使用签名策略
    }
},
{
     "name": "collection2",
     "policy": "OR('Org1MSP.member')",
     "requiredPeerCount": 1,
     "maxPeerCount": 3,
     "blockToLive":3,
     "memberOnlyRead": true,
     "memberOnlyWrite": true,
     "endorsementPolicy": {
      "channelConfigPolicy": "Channel/Application/Writers" // 指定使用通道配置内已 
              // 有策略
    }
}
]
```

### 基于证书属性的链码访问控制

另外，用户也可以在自己的链码内通过基于证书属性的链码访问控制，实现自定义的控制逻辑。例如，可在方法入口处先检测调用者身份证书，过滤某些特定身份调用者，以实现基于键值或其他条件的细粒度的控制。

```go
// github.com/hyperledger/fabric-chaincode-go/pkg/cid/cid.go
// 获取根据证书主题生成的唯一标识
func GetID() (string, error) 
// 获取 MSP ID
func GetMSPID() (string, error) 
// 获取证书某个属性的值
func GetAttributeValue(attrName string) (value string, found bool, err error)
// 检查证书中某个属性是给定值
func AssertAttributeValue(attrName, attrValue string) error 
// 获取调用者的 X509 证书
func GetX509Certificate() (*x509.Certificate, error)
// 判断调用者是否属于给定 OU
func HasOUValue(stub ChaincodeStubInterface, OUValue string) (bool, error)
```

用户可以使用这些方法在链码方法中对调用者身份进行访问控制。

例如，在证书的 extension 域中设置自定义的属性 "abac."+role，并在链码方法中判断只有证书带有该属性的用户才可以调用该方法，示例代码如下：

```go
import "github.com/hyperledger/fabric-chaincode-go/pkg/cid"
 func (t *TestChaincode) Access(stub shim.ChaincodeStubInterface, role string)  
    pb.Response {
    // 根据属性值来判断是否允许访问方法
    err := cid.AssertAttributeValue(stub, "abac."+role, "true")
    if err != nil {
        return shim.Error("Not allowed with missed attribution"+err.Error())
    }
    ...
}
```

### 实例化策略

实例化策略（Instantiation Policy）仅在 2.0 版本之前生效，负责对链码的实例化情况进行控制。Committer 在确认阶段利用 VSCC 对网络中进行链码部署的操作进行权限检查。

目前，实例化策略同样采用了 SignaturePolicy 结构进行指定，可以基于身份集合结构构建复杂的签名校验组合。

默认情况下，会以当前 MSP 的管理员身份作为默认策略，即只有当前 MSP 管理员可以进行链码实例化操作。这可以避免链码被通道中其他组织成员私自在其他通道内进行实例化。

实例化策略的检查发生在 Peer 的背书阶段。
