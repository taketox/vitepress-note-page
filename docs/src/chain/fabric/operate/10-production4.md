# 生产网络—部署合约并调用

## 生产网络—部署合约并调用

### 一、前期准备

#### 1. 规划网络拓扑

| 节点       | 宿主机 IP     | hosts                  | 端口                    |
| ---------- | ------------- | ---------------------- | ----------------------- |
| cli        | 192.168.88.22 | N/A                    | N/A                     |
| orderer0   | 192.168.88.22 | orderer0.example.com   | 7050，8443，9443        |
| orderer1   | 192.168.88.22 | orderer1.example.com   | 8050，8444，9444        |
| orderer2   | 192.168.88.22 | orderer2.example.com   | 9050，8445，9445        |
| org1-peer0 | 192.168.88.22 | peer0.org1.example.com | 7051，7052，9446，8125  |
| org1-peer1 | 192.168.88.22 | peer1.org1.example.com | 8051，7053，9447，8126  |
| org2-peer0 | 192.168.88.22 | peer0.org2.example.com | 9051，7054，9448，8127  |
| org2-peer1 | 192.168.88.22 | peer1.org2.example.com | 10051，7055，9449，8128 |

#### 2. 生成身份文件

#### 3. 部署Orderer节点

#### 4. 部署Peer节点

#### 5. 准备链码

### 二、创建并加入通道

#### 1. 创建通道

```sh
# 声明MSPID
export CORE_PEER_LOCALMSPID=Org1MSP
# 声明MSP路径
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp

# 创建通道
./peer channel create -o orderer0.example.com:7050 -c businesschannel -f "/root/fabric/channel-artifacts/businesschannel.tx" --timeout "30s" --tls --cafile /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

> 创建成功后会在当前路径下生成 `businesschannel.block` 文件。

```sh
mv businesschannel.block /root/fabric/channel-artifacts/
```

#### 2. 加入通道

##### 2.1 org1-peer0 加入通道

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

# 加入通道
./peer channel join -b /root/fabric/channel-artifacts/businesschannel.block
```

> 加入成功可以看到如下输出：

```sh
2022-12-04 08:51:18.210 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 08:51:18.236 EST 0002 INFO [channelCmd] executeJoin -> Successfully submitted proposal to join channel
```

##### 2.2 org1-peer1 加入通道

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer1.org1.example.com:8051

# 加入通道
./peer channel join -b /root/fabric/channel-artifacts/businesschannel.block
```

> 加入成功可以看到如下输出：

```sh
2022-12-04 08:53:06.332 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 08:53:06.356 EST 0002 INFO [channelCmd] executeJoin -> Successfully submitted proposal to join channel
```

##### 2.3 org2-peer0加入通道

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051

# 加入通道
./peer channel join -b /root/fabric/channel-artifacts/businesschannel.block
```

> 加入成功可以看到如下输出：

```sh
2022-12-04 08:55:09.413 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 08:55:09.439 EST 0002 INFO [channelCmd] executeJoin -> Successfully submitted proposal to join channel
```

##### 2.4 org2-peer1加入通道

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer1.org2.example.com:10051

# 加入通道
./peer channel join -b /root/fabric/channel-artifacts/businesschannel.block
```

> 加入成功可以看到如下输出：

```sh
2022-12-04 08:56:36.230 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 08:56:36.254 EST 0002 INFO [channelCmd] executeJoin -> Successfully submitted proposal to join channel
```

#### 3. 查看 peer 节点加入的通道

```sh
./peer channel list
```

> 输出如下：

```sh
2022-12-04 08:57:21.337 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
Channels peers has joined: 
businesschannel
```

### 三、更新锚节点

​锚节点配置更新后，同一通道内不同组织之间的 Peer 也可以进行 Gossip 通信，共同维护通道账本。后续，用户可以通过智能合约使用通道账本。

​锚节点其实我们在`configtx.yaml`已经定义过了，但是还需要更新后才能生效。

```yaml
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
        AnchorPeers:	#锚节点
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
        AnchorPeers:	#锚节点
            - Host: peer0.org2.example.com
              Port: 9051
```

#### org1 更新锚节点

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

# 更新锚节点
./peer channel update -o orderer0.example.com:7050 -c businesschannel -f /root/fabric/channel-artifacts/Org1MSPanchors.tx --tls --cafile /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

> 更新锚节点成功可以看到如下输出：

```sh
2022-12-04 10:48:14.289 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 10:48:14.295 EST 0002 INFO [channelCmd] update -> Successfully submitted channel update
```

#### org2 更新锚节点

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/root/fabric/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/fabric/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051

# 更新锚节点
./peer channel update -o orderer0.example.com:7050 -c businesschannel -f /root/fabric/channel-artifacts/Org2MSPanchors.tx --tls --cafile /root/fabric/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

> 更新锚节点成功可以看到如下输出：

```sh
2022-12-04 10:51:11.019 EST 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
2022-12-04 10:51:11.025 EST 0002 INFO [channelCmd] update -> Successfully submitted channel update
```

### 四、安装链码

#### 1. 上传链码

- 创建链码文件夹

```sh
cd /root/fabric
mkdir -p chaincode/fabhouse
cd chaincode/fabhouse
```

- 上传链码

```sh
rz chaincode.jar
```

#### 2. 将bin目录中二进制文件添加到CLI路径

所需格式的链码包可以使用 `peer CLI` 创建，使用以下命令将这些二进制文件添加到你的 `CLI` 路径。

```sh
export PATH=${PWD}/bin:$PATH
```

#### 3. 设置FABRIC_CFG_PATH为指向fabric-samples中的core.yaml文件

```sh
export FABRIC_CFG_PATH=$PWD/config/
```

#### 4. 创建链码包

```sh
peer lifecycle chaincode package fabhouse.tar.gz --path /root/fabric/chaincode/fabhouse --lang java --label fabhouse_1
```

> 命令解释：此命令将在当前目录中创建一个名为 fabcar.tar.gz的软件包。
>
> –lang：标签用于指定链码语言，
>
> –path：标签提供智能合约代码的位置，该路径必须是标准路径或相对于当前工作目录的路径，
>
> –label：标签用于指定一个链码标签，该标签将在安装链码后对其进行标识。（建议您的标签包含链码名称和版本）

现在，我们已经创建了链码包，我们可以在测试网络的对等节点上安装链码。

#### 5. 安装链码包

​打包  `fabhouse` 智能合约后，我们可以在peer节点上安装链码。需要在将认可交易的每个 `peer` 节点上安装链码。因为背书策略要求来自 `Org1` 和 `Org2` 的背书，所以我们需要在两个组织的peer节点上安装链码：`peer0.org1.example.com`和`peer0.org2.example.com`

##### 5.1 在Org1 peer 节点上安装链码

设置以下环境变量，以 `Org1` 管理员的身份操作 `peer CLI` 。

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
```

使用 `peer lifecycle chaincode install` 命令在 `peer` 节点上安装链码。

```sh
peer lifecycle chaincode install fabhouse.tar.gz
```

看到以下结果，表示链码安装成功。

```sh
2022-12-05 09:53:04.401 EST 0001 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Installed remotely: response:<status:200 payload:"\nKfabhouse_1:6af77aa824c7979d211a4ad0516dbb9ec9479593968e3534109f54b89b00adb4\022\nfabhouse_1" > 
2022-12-05 09:53:04.402 EST 0002 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Chaincode code package identifier: fabhouse_1:6af77aa824c7979d211a4ad0516dbb9ec9479593968e3534109f54b89b00adb4
```

##### 5.2 在Org2 peer 节点上安装链码

设置以下环境变量，以 `Org2` 管理员的身份操作`peer CLI`。

```sh
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
```

使用 `peer lifecycle chaincode install` 命令在 `peer` 节点上安装链码。

```sh
peer lifecycle chaincode install fabhouse.tar.gz
```

> 注意：
>
> 安装链码时，链码由peer节点构建。如果智能合约代码有问题，install命令将从链码中返回所有构建错误。 因为安装 java 链码的时候需要经过 maven 构建以及下载依赖包的过程这个过程有可能会较慢，所以 install 命令有可能会返回一个超时错误:。但是其实链码的 docker 容器内此时还在执行构建任务没有完成。等到构建成功了链码包也就安装成功了。

#### 6. 批准链码定义

​安装链码包后，需要通过组织的链码定义。该定义包括链码管理的重要参数，例如名称，版本和链码认可策略。

​如果组织已在其`peer`节点上安装了链码，则他们需要在其组织通过的链码定义中包括包ID。包ID用于将`peer`节点上安装的链码与通过的链码定义相关联，并允许组织使用链码来认可交易。

##### 6.1 查询包ID

```sh
peer lifecycle chaincode queryinstalled
```

包ID是链码标签和链码二进制文件的哈希值的组合。每个`peer`节点将生成相同的包ID。你应该看到类似于以下内容的输出：

```sh
Installed chaincodes on peer:
Package ID: fabhouse_1:6af77aa824c7979d211a4ad0516dbb9ec9479593968e3534109f54b89b00adb4, Label: fabhouse_1
```

将包ID声明为环境变量。

```sh
export CC_PACKAGE_ID=fabhouse_1:6af77aa824c7979d211a4ad0516dbb9ec9479593968e3534109f54b89b00adb4
```

##### 6.2 Org2 批准链码定义

因为已经设置了环境变量为`peer CLI`作为`Org2`管理员进行操作，所以我们可以以`Org2`组织级别将 `fabhouse` 的链码定义通过。使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o orderer0.example.com:7050 --ordererTLSHostnameOverride orderer0.example.com --channelID businesschannel --name fabhouse --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

##### 6.3 Org1 批准链码定义

设置以下环境变量以 `Org1` 管理员身份运行：

```sh
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
```

使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o orderer0.example.com:7050 --ordererTLSHostnameOverride orderer0.example.com --channelID businesschannel --name fabhouse --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

#### 7. 将链码定义提交到通道

使用 `peer lifecycle chaincode checkcommitreadiness` 命令来检查通道成员是否已批准相同的链码定义：

```sh
peer lifecycle chaincode checkcommitreadiness --channelID businesschannel --name fabhouse --version 1.0 --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
```

该命令将生成一个JSON映射，该映射显示通道成员是否批准了 `checkcommitreadiness` 命令中指定的参数：

```json
{
        "approvals": {
                "Org1MSP": true,
                "Org2MSP": true
        }
}
```

​由于作为通道成员的两个组织都同意了相同的参数，因此链码定义已准备好提交给通道。你可以使用`peer lifecycle chaincode commit`命令将链码定义提交到通道。`commit`命令还需要由组织管理员提交。

```sh
peer lifecycle chaincode commit -o orderer0.example.com:7050 --ordererTLSHostnameOverride orderer0.example.com --channelID businesschannel --name fabhouse --version 1.0 --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles ${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles ${PWD}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

可以使用`peer lifecycle chaincode querycommitted`命令来确认链码定义已提交给通道。

```sh
peer lifecycle chaincode querycommitted --channelID businesschannel --name fabhouse --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

如果将链码成功提交给通道，该`querycommitted`命令将返回链码定义的顺序和版本:

```sh
Committed chaincode definition for chaincode 'fabhouse' on channel 'businesschannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

#### 8. 调用链码

​链码定义提交到通道后，链码将在加入安装链码的通道的对等节点上启动。`Fabcar` 链码现在已准备好由客户端应用程序调用。使用以下命令在账本上创建一组初始房子。

> 注意：调用命令需要针对足够数量的对等节点以满足链码背书策略。

```sh
peer chaincode invoke -o orderer0.example.com:7050 --ordererTLSHostnameOverride orderer0.example.com --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C businesschannel -n fabhouse --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles ${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles ${PWD}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"initLedger","Args":[]}'
```

如果命令成功，您应该能够收到类似于以下内容的响应：

```sh
2022-12-05 10:23:51.160 EST 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200 
```

我们可以使用查询函数来读取由链码创建的房屋列表：

```sh
peer chaincode query -C businesschannel -n fabhouse -c '{"Args":["queryHouse","house-1"]}'
```

响应返回指定房屋信息：

```sh
{"owner":"zhangsan","area":300,"name":"house-1","category":"villa"}
```
