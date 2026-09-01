# Fabric 1.4.6 链码操作

## 安装链码

### 1. 进入CLI容器

进入 `CLI` 客户端容器，`CLI` 客户端默认以 `Admin.org1` 身份连接 `peer0.org1` 节点：

```sh
docker exec -it cli bash
```

检查当前节点`（peer0.org1.example.com）`以加入哪些通道：

```sh
peer channel list
```

执行结果返回

```sh
Channels peers has joined: 
mychannel
```

说明当前节点已经加入通道 `mychannel`

### 2. 安装链码

使用 `install`命令安装链码：

- **-n：** 指定要安装的链码的名称
- **-v：** 指定链码的版本
- **-p：** 指定要安装的链码源代码的所在路径

```sh
peer chaincode install -n vote -l java -v 1.0 -p /opt/gopath/src/github.com/chaincode/voting-system-contract-gradle/
```

> 注意：
>
> ​链码需要根据指定的背书策略安装在需要背书的所有 peer 节点中。未安装链码的节点不能执行链码逻辑，但仍可以验证交易并提交到账本中。

### 3. 实例化链码

设置通道名称的环境变量：

```sh
export CHANNEL_NAME=mychannel
```

设置 orderer 节点的证书路径的环境变量：

```sh
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

使用 `instantiate` 命令进行链码的实例化

```sh
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n vote -l java -v 1.0 -c '{"Args":["initLedger"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
```

- **-o：** 指定 Oderer 服务节点地址
- **--tls：** 开启 TLS 验证
- **--cafile：** 指定了 Orderer 的根证书路径，用于验证 TLS 握手
- **-n：** 指定要实例化的链码名称，必须与安装时指定的链码名称相同
- **-v：** 指定要实例化的链码的版本号，必须与安装时指定的链码版本号相同
- **-C：** 指定通道名称
- **-c：** 实例化链码时指定的参数
- **-P：** 指定背书策略

> 背书策略的背书实体一般表示为：`MSP.ROLE`，其中 `MSP` 是 `MSP ID`，ROLE 支持 `client`、`peer`、`admin` 和 `member` 四种角色。 例如： `Org1MSP.admin` 表示 `Org1` 这个 `MSP` 下的任意管理员; `Org1MSP.member` 表示 `Org1` 这个 `MSP` 下的任意成员。

**注意：链码需要安装在多个背书的 Peer 节点中，但实例化只需执行一次。**

### 4. 使用链码

#### 4.1 调用链码

客户端发起交易，对账本数据进行更改，需要将背书之后的交易发送给排序节点上链。因此，需要开启 TLS 验证并指定对应的 orderer 证书路径。

需要注意，链码执行查询操作和执行事务（改变账本数据）操作的流程是不同的：

- 链码查询操作：客户端接收到背书节点的交易提案响应后不会将交易请求提交给 Orderer 节点，即查询操作不需要上链，任选一个背书节点进行链码查询操作即可；
- 链码事务操作：客户端先需要根据指定背书策略收集到足够的交易提案的背书签名，再将背书后的交易提交给 Orderer 节点，即事务操作的交易需要成块上链。

使用 `invoke` 命令调用链码：

```sh
peer chaincode invoke -o orderer.example.com:7050  --tls --cafile $ORDERER_CA  -C $CHANNEL_NAME -n vote -c '{"Args":["projectInit","t1","test","同意","不同意","test","true","user1","user2","user3","user4","user5"]}'
```

- **-o：** 指定orderer节点地址
- **--tls：** 开启TLS验证
- **--cafile：** 指定了 Orderer 的根证书路径，用于验证 TLS 握手
- **-n:** 指定链码名称
- **-C：** 指定通道名称
- **-c：** 指定调用链码的所需参数

>​如果交易需要多个背书节点的背书，可以使用 `--peerAddresses` 标志指定节点。例如：交易需要 `peer0.org1` 和 `peer0.org2` 的共同背书：

#### 4.2 查询链码

链码部署成功之后，可以通过特定的命令调用链码，从而发起交易或查询请求，对账本数据进行操作。

使用 `query`命令查询链码：

```sh
peer chaincode query -C $CHANNEL_NAME -n vote  -c '{"Args":["getVoteResult","t1","false"]}'
```

- **-n：** 指定要调用的链码名称
- **-C：** 指定通道名称
- **-c** 指定调用链码时所需要的参数
