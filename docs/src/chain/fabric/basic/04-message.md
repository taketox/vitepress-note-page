# 消息协议

## 消息协议

Fabric 中大量采用了 gRPC 消息在不同组件之间进行通信交互，主要包括如下几种情况：客户端访问 Peer 节点，客户端和 Peer 节点访问排序节点，链码容器与 Peer 节点交互，以及多个 Peer 节点之间的 Gossip 交互。

### 消息结构

除了 Peer 节点之间的 Gossip 通信外，大多都采用了信封（Envelope）结构来对消息进行封装.

![An image](/img/chain/fabric/09.webp)

普通信封结构并不复杂，包括一个载荷（Payload）域存放数据，以及对载荷域中内容进行签名的签名（Signature）域。载荷域中又包括头部（Header）域记录类型、版本、签名者信息等元数据，以及数据（Data）域，记录消息内容。

头部域是一个通用的结构。包括两种头部：通道头（ChannelHeader）和签名头（Signature-Header）。通道头中记录了如下与通道和交易相关的很多信息。

- Type：int32 类型，代表了结构体（如 Envelope）的类型。结构体消息根据类型不同，其 Payload 可以解码为不同的结构。类型可以为 `MESSAGE`、`CONFIG`、`CONFIG_UPDATE`、`ENDORSER_TRANSACTION`、`ORDERER_TRANSACTION`、`DELIVER_SEEK_INFO`、`CHAINCODE_PACKAGE`、`PEER_ADMIN_OPERATION` 等。
- Version：int32 类型，版本号记录了消息协议的版本，一般为 0。
- Timestamp：*google_protobuf.Timestamp 类型，消息创建的时间。
- ChannelID：string 类型，消息所关联的通道 ID。
- TxID：string 类型，交易的 ID，由交易发起者创建。
- Epoch：uint64 类型，所属的世代，目前指定为所属区块的高度。
- Extension：[] byte 类型，扩展域。
- TlsCertHash：[] byte 类型。如果启用了双向 TLS 认证，则此处为客户端 TLS 证书的 Hash 值。

签名头中主要记录签名者的身份信息。

### 客户端访问 Peer 节点

客户端通过 SDK 和 Endorser Peer 进行交互，执行链码相关操作（安装、实例化、升级链码以及调用），加入、列出应用通道和监听事件操作等。

除监听事件外，大部分消息都采用了 SignedProposal 结构（定义在 fabric-protos-go 项目的 peer/chaincode.pb.go 文件），消息中 ChannelHeader.Type 为 ENDORSER_TRANSACTION 或 CONFIG，发往的 gRPC 服务地址为 /protos.Endorser/ProcessProposal。监听事件则通过 DeliverClient 接口类型来实现，包括 Deliver、DeliverFiltered、DeliverWithPrivateData 三种方法。

![An image](/img/chain/fabric/10.webp)

SignedProposal 消息结构中包括 Proposal 和对其的签名。Proposal 消息结构中同样包括 Header 域、Payload 域，以及扩展域。其中，Payload 域和扩展域如何解码都取决于 Channel-Header 中的 Type 指定的类型。

### 客户端、Peer 节点访问 Orderer

客户端通过 SDK 和 Orderer 进行交互，执行链码实例化、调用和升级，应用通道创建和更新，以及区块结构获取等操作。Peer 节点可以直接向 Orderer 请求获取区块结构。两者采用了同样的获取接口。

请求消息都采用了 Envelope 结构，并且都发往 /orderer.AtomicBroadcast/Broadcast gRPC 服务地址。从 Orderer 获取信息时，则发往 /orderer.AtomicBroadcast/Deliver gRPC 服务地址。

![An image](/img/chain/fabric/11.webp)

### 链码和 Peer 节点交互

对于原生链码，在链码容器启动后，会向 Peer 节点进行注册，gRPC 地址为 /protos.ChaincodeSupport/Register。对于外部链码，在其启动后，Peer 节点会主动发起连接请求，gRPC 地址为 /protos.Chaincode/Connect。

链码和 Peer 之间的交互消息为 ChaincodeMessage 结构其中，Payload 域中可以包括各种 Chaincode 操作消息，如 GetHistoryForKey、GetQueryResult、PutStateInfo、GetStateByRange 等。

![An image](/img/chain/fabric/12.webp)

注册完成后，双方建立起双工通道，通过更多消息类型实现多种交互.

### Peer 节点之间 Gossip 交互

Peer 之间可以通过 Gossip 协议来完成邻居探测、Leader 选举、区块分发、私密数据同步等过程，主要原理为通过 GossipClient 客户端的 GossipStream 双向流进行通信，发送 Signed-GossipMessage 消息结构，gRPC 服务地址主要为 /gossip.Gossip/GossipStream。

此外，Peer 可通过单独的 Ping 服务对远端节点在线状态进行探测，gRPC 服务地址为 /gossip.Gossip/Ping。

#### Gossip 交互过程

总结 Gossip 交互过程如图 14-16 所示。利用不同的消息体，完成 Peer 之间的信息同步。

![An image](/img/chain/fabric/13.webp)

#### Gossip 消息结构

Gossip 采用签名信封结构（SignedGossipMessage）用来封装 Gossip 消息（GossipMessage）和对应的信封结构（Envelope）。

![An image](/img/chain/fabric/14.webp)

#### Gossip 消息标签

GossipMessage 为核心的数据结构。其可能的标签值（GossipMessage_Tag）如下所示，这些标签默认带有 GossipMessage 前缀。

- `UNDEFINED`：标签未定义，当标签为空时返回该值。
- `EMPTY`：空标签，用于建立连接、心跳、请求和响应成员消息。
- `ORG_ONLY`：仅限组织内消息，如私密数据。
- `CHAN_ONLY`：仅限通道内消息。
- `CHAN_AND_ORG`：限通道内同一组织内，如获取区块数据。
- `CHAN_OR_ORG`：限通道内或限组织内，如状态信息。

#### Gossip 消息内容结构

GossipMessage 通过消息内容类型来应用到不同场景。合法的消息内容结构（isGossipMessage_Content）下面详细介绍，这些结构默认带有 GossipMessage 前缀。

（1）成员消息适用于邻居发现场景，定期维护存活的邻居信息，不局限在通道内，主要由 gossip/discovery 模块实现。

![An image](/img/chain/fabric/15.webp)

（2）拉取消息

适用于从远程节点拉取身份或区块数据，主要数据结构为：gossip/gossip/pull/pullstore.go#Mediator 和 gossip/gossip/algo/pull.go#PullEngine。包括如下两种消息类型：

- `PullMsgType_IDENTITY_MSG`，获取对方的身份信息，消息标签为 EMPTY，不局限在通道内。
- `PullMsgType_BLOCK_MSG`，获取区块数据。消息标签为 CHAN_AND_ORG，局限在通道内的同一组织内。

![An image](/img/chain/fabric/16.webp)

（3）数据消息

适用于从远程节点同步区块或私密数据。

![An image](/img/chain/fabric/17.webp)

（4）状态消息

适用于与远程节点同步账本状态。

![An image](/img/chain/fabric/18.webp)

（5）其他消息

其他消息包括连接消息、选举 Leader 消息和空消息。

![An image](/img/chain/fabric/19.webp)
