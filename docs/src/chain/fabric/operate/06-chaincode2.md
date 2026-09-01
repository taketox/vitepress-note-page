# Fabric 2.4.7 链码操作

## 安装链码

### 步骤

- 第一步：打包智能合约
- 第二步：安装链码包
- 第三步：批准链码定义
- 第四步：将链码定义提交到通道
- 第五步：调用链码

### 1. 打包智能合约

上传合约文件，下载相关依赖，配置环境变量。

```sh
# 下载安装链码相关依赖
./gradlew installDist
# 返回到test-network所在目录，以便可以将链码与其他网络部件打包在一起。
cd ../../test-network
# 所需格式的链码包可以使用 peer CLI 创建，使用以下命令将这些二进制文件添加到你的 CLI 路径。
export PATH=${PWD}/../bin:$PATH
# 设置FABRIC_CFG_PATH为指向fabric-samples中的core.yaml文件
export FABRIC_CFG_PATH=$PWD/../config/
```

创建链码包

```sh
peer lifecycle chaincode package fabcar.tar.gz --path ../chaincode/fabcar/java/build/install/fabcar --lang java --label fabcar_1
```

> 命令解释：此命令将在当前目录中创建一个名为 fabcar.tar.gz的软件包。
>
> –lang：标签用于指定链码语言，
>
> –path：标签提供智能合约代码的位置，该路径必须是标准路径或相对于当前工作目录的路径，
>
> –label：标签用于指定一个链码标签，该标签将在安装链码后对其进行标识。（建议您的标签包含链码名称和版本）

现在，我们已经创建了链码包，我们可以在测试网络的对等节点上安装链码。

### 2. 安装链码包

打包  `fabcar` 智能合约后，我们可以在peer节点上安装链码。需要在将认可交易的每个 `peer` 节点上安装链码。因为背书策略要求来自 `Org1` 和 `Org2` 的背书，所以我们需要在两个组织的peer节点上安装链码：`peer0.org1.example.com`和`peer0.org2.example.com`

**在Org1 peer 节点上安装链码**

设置以下环境变量，以 `Org1` 管理员的身份操作 `peer CLI` 。

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# 使用 peer lifecycle chaincode install 命令在 peer 节点上安装链码。
peer lifecycle chaincode install fabcar.tar.gz

# 看到以下结果，表示链码安装成功。
2022-11-26 06:25:13.083 EST 0001 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Installed remotely: response:<status:200 payload:"\nIfabcar_1:4dfe43a71a0fdbf1a36bb425774caac8a25209a4c13726fd1476328c1b256845\022\010fabcar_1" > 
2022-11-26 06:25:13.083 EST 0002 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Chaincode code package identifier: fabcar_1:4dfe43a71a0fdbf1a36bb425774caac8a25209a4c13726fd1476328c1b256845
```

**在Org2 peer 节点上安装链码**

设置以下环境变量，以 `Org2` 管理员的身份操作`peer CLI`。

```sh
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

# 使用 peer lifecycle chaincode install 命令在 peer 节点上安装链码。
peer lifecycle chaincode install fabcar.tar.gz
```

> 注意：
>
> 安装链码时，链码由peer节点构建。如果智能合约代码有问题，install命令将从链码中返回所有构建错误。 因为安装 java 链码的时候需要经过 maven 构建以及下载依赖包的过程这个过程有可能会较慢，所以 install 命令有可能会返回一个超时错误:。但是其实链码的 docker 容器内此时还在执行构建任务没有完成。等到构建成功了链码包也就安装成功了。

### 3. 批准链码定义

安装链码包后，需要通过组织的链码定义。该定义包括链码管理的重要参数，例如名称，版本和链码认可策略。

如果组织已在其`peer`节点上安装了链码，则他们需要在其组织通过的链码定义中包括包ID。包ID用于将`peer`节点上安装的链码与通过的链码定义相关联，并允许组织使用链码来认可交易。

```sh
# 查询包ID
peer lifecycle chaincode queryinstalled
# 包ID是链码标签和链码二进制文件的哈希值的组合。每个`peer`节点将生成相同的包ID。你应该看到类似于以下内容的输出：
Installed chaincodes on peer:
Package ID: fabcar_1:4dfe43a71a0fdbf1a36bb425774caac8a25209a4c13726fd1476328c1b256845, Label: fabcar_1
```

将包ID声明为环境变量。

```sh
export CC_PACKAGE_ID=fabcar_1:4dfe43a71a0fdbf1a36bb425774caac8a25209a4c13726fd1476328c1b256845
```

**Org2 批准链码定义**

因为已经设置了环境变量为`peer CLI`作为`Org2`管理员进行操作，所以我们可以以`Org2`组织级别将 `fabcar` 的链码定义通过。使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

**Org1 批准链码定义**

设置以下环境变量以 `Org1` 管理员身份运行：

```sh
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051
```

使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

### 4. 将链码定义提交到通道

使用 `peer lifecycle chaincode checkcommitreadiness` 命令来检查通道成员是否已批准相同的链码定义：

```sh
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name fabcar --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
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

由于作为通道成员的两个组织都同意了相同的参数，因此链码定义已准备好提交给通道。你可以使用`peer lifecycle chaincode commit`命令将链码定义提交到通道。`commit`命令还需要由组织管理员提交。

```sh
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

可以使用`peer lifecycle chaincode querycommitted`命令来确认链码定义已提交给通道。

```sh
peer lifecycle chaincode querycommitted --channelID mychannel --name fabcar --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

如果将链码成功提交给通道，该`querycommitted`命令将返回链码定义的顺序和版本:

```sh
Committed chaincode definition for chaincode 'fabcar' on channel 'mychannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

### 5. 调用链码

链码定义提交到通道后，链码将在加入安装链码的通道的对等节点上启动。`Fabcar` 链码现在已准备好由客户端应用程序调用。使用以下命令在账本上创建一组初始汽车。

> 注意：调用命令需要针对足够数量的对等节点以满足链码背书策略。

```sh
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"initLedger","Args":[]}'
```

如果命令成功，您应该能够收到类似于以下内容的响应：

```sh
2022-11-26 06:29:00.771 EST 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200 
```

我们可以使用查询函数来读取由链码创建的汽车列表：

```sh
peer chaincode query -C mychannel -n fabcar -c '{"Args":["queryAllCars"]}'
```

响应返回汽车列表：

```sh
[{"key":"CAR1","record":{"color":"red","make":"Ford","model":"Mustang","owner":"Brad"}},{"key":"CAR2","record":{"color":"green","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"key":"CAR3","record":{"color":"yellow","make":"Volkswagen","model":"Passat","owner":"Max"}},{"key":"CAR4","record":{"color":"black","make":"Tesla","model":"S","owner":"Adrian"}},{"key":"CAR5","record":{"color":"purple","make":"Peugeot","model":"205","owner":"Michel"}},{"key":"CAR6","record":{"color":"white","make":"Chery","model":"S22L","owner":"Aarav"}},{"key":"CAR7","record":{"color":"violet","make":"Fiat","model":"Punto","owner":"Pari"}},{"key":"CAR8","record":{"color":"indigo","make":"Tata","model":"nano","owner":"Valeria"}},{"key":"CAR9","record":{"color":"brown","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```

## 升级链码

### 步骤

- 第一步：打包新版本智能合约
- 第二步：安装链码包
- 第三步：批准链码定义
- 第四步：将链码定义提交到通道
- 第五步：调用链码

### 1. 打包新版本智能合约

上传新版本合约文件，下载相关依赖，配置环境变量。

```sh
# 下载安装链码相关依赖
./gradlew installDist
# 返回到 test-network 所在目录，以便可以将链码与其他网络部件打包在一起。
cd ../../test-network
# 所需格式的链码包可以使用 peer CLI 创建，使用以下命令将这些二进制文件添加到你的 CLI 路径。
export PATH=${PWD}/../bin:$PATH
# 设置FABRIC_CFG_PATH为指向fabric-samples中的core.yaml文件
export FABRIC_CFG_PATH=$PWD/../config/
```

**创建链码包**

修改链码标签：`fabcar_2`

```sh
peer lifecycle chaincode package fabcar.tar.gz --path ../chaincode/fabcar/java/build/install/fabcar --lang java --label fabcar_2
```

> 命令解释：此命令将在当前目录中创建一个名为 fabcar.tar.gz的软件包。
>
> –lang：标签用于指定链码语言，
>
> –path：标签提供智能合约代码的位置，该路径必须是标准路径或相对于当前工作目录的路径，
>
> –label：标签用于指定一个链码标签，该标签将在安装链码后对其进行标识。（建议您的标签包含链码名称和版本）

现在，我们已经创建了链码包，我们可以在测试网络的对等节点上安装链码。

### 2.安装链码包

打包  `fabcar` 智能合约后，我们可以在peer节点上安装链码。需要在将认可交易的每个 `peer` 节点上安装链码。因为背书策略要求来自 `Org1` 和 `Org2` 的背书，所以我们需要在两个组织的peer节点上安装链码：`peer0.org1.example.com`和`peer0.org2.example.com`

**在Org1 peer 节点上安装链码**

设置以下环境变量，以 `Org1` 管理员的身份操作 `peer CLI` 。

```sh
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

使用 `peer lifecycle chaincode install` 命令在 `peer` 节点上安装链码。

```sh
peer lifecycle chaincode install fabcar.tar.gz

# 看到以下结果，表示链码安装成功。
2022-11-26 07:41:45.647 EST 0001 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Installed remotely: response:<status:200 payload:"\nIfabcar_2:3377b6a6377064a0e7c59e4f2c9e7a3c9759097d352b4d6815aa3e0a4db9f2ca\022\010fabcar_2" > 
2022-11-26 07:41:45.647 EST 0002 INFO [cli.lifecycle.chaincode] submitInstallProposal -> Chaincode code package identifier: fabcar_2:3377b6a6377064a0e7c59e4f2c9e7a3c9759097d352b4d6815aa3e0a4db9f2ca
```

**在Org2 peer 节点上安装链码**

设置以下环境变量，以 `Org2` 管理员的身份操作`peer CLI`。

```sh
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

使用 `peer lifecycle chaincode install` 命令在 `peer` 节点上安装链码。

```sh
peer lifecycle chaincode install fabcar.tar.gz
```

> 注意：
>
> 安装链码时，链码由peer节点构建。如果智能合约代码有问题，install命令将从链码中返回所有构建错误。 因为安装 java 链码的时候需要经过 maven 构建以及下载依赖包的过程这个过程有可能会较慢，所以 install 命令有可能会返回一个超时错误:。但是其实链码的 docker 容器内此时还在执行构建任务没有完成。等到构建成功了链码包也就安装成功了。

### 3.批准链码定义

安装链码包后，需要通过组织的链码定义。该定义包括链码管理的重要参数，例如名称，版本和链码认可策略。

如果组织已在其`peer`节点上安装了链码，则他们需要在其组织通过的链码定义中包括包ID。包ID用于将`peer`节点上安装的链码与通过的链码定义相关联，并允许组织使用链码来认可交易。

**查询包ID**

```sh
peer lifecycle chaincode queryinstalled

# 包ID是链码标签和链码二进制文件的哈希值的组合。每个 peer 节点将生成相同的包ID。你应该看到类似于以下内容的输出：
Installed chaincodes on peer:
Package ID: fabcar_1:4dfe43a71a0fdbf1a36bb425774caac8a25209a4c13726fd1476328c1b256845, Label: fabcar_1
Package ID: fabcar_2:3377b6a6377064a0e7c59e4f2c9e7a3c9759097d352b4d6815aa3e0a4db9f2ca, Label: fabcar_2
# 将包ID声明为环境变量。
export CC_PACKAGE_ID=fabcar_2:3377b6a6377064a0e7c59e4f2c9e7a3c9759097d352b4d6815aa3e0a4db9f2ca
```

**Org2批准链码定义**

因为已经设置了环境变量为`peer CLI`作为`Org2`管理员进行操作，所以我们可以以`Org2`组织级别将 `fabcar` 的链码定义通过。使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 2.0 --package-id $CC_PACKAGE_ID --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

**Org1 批准链码定义**

设置以下环境变量以 `Org1` 管理员身份运行：

```sh
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051
```

使用 `peer lifecycle chaincode approveformyorg`命令批准链码定义：

```sh
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 2.0 --package-id $CC_PACKAGE_ID --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

### 4.将链码定义提交到通道

使用 `peer lifecycle chaincode checkcommitreadiness` 命令来检查通道成员是否已批准相同的链码定义：

```sh
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name fabcar --version 2.0 --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
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

由于作为通道成员的两个组织都同意了相同的参数，因此链码定义已准备好提交给通道。你可以使用`peer lifecycle chaincode commit`命令将链码定义提交到通道。`commit`命令还需要由组织管理员提交。

```sh
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name fabcar --version 2.0 --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

可以使用`peer lifecycle chaincode querycommitted`命令来确认链码定义已提交给通道。

```sh
peer lifecycle chaincode querycommitted --channelID mychannel --name fabcar --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

如果将链码成功提交给通道，该`querycommitted`命令将返回链码定义的顺序和版本:

```sh
Committed chaincode definition for chaincode 'fabcar' on channel 'mychannel':
Version: 2.0, Sequence: 2, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

### 5.调用链码

链码定义提交到通道后，链码将在加入安装链码的通道的对等节点上启动。`Fabcar` 链码现在已准备好由客户端应用程序调用。使用以下命令在账本上创建一组初始汽车。

> 注意：调用命令需要针对足够数量的对等节点以满足链码背书策略。

```sh
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"initLedger","Args":[]}'
```

如果命令成功，您应该能够收到类似于以下内容的响应：

```sh
2022-11-26 06:29:00.771 EST 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200 
```

我们可以使用查询函数来读取由链码创建的汽车列表：

```sh
peer chaincode query -C mychannel -n fabcar -c '{"Args":["queryAllCars"]}'
```

响应返回汽车列表：

```sh
[{"key":"CAR1","record":{"color":"red","make":"Ford","model":"Mustang","owner":"Brad"}},{"key":"CAR2","record":{"color":"green","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"key":"CAR3","record":{"color":"yellow","make":"Volkswagen","model":"Passat","owner":"Max"}},{"key":"CAR4","record":{"color":"black","make":"Tesla","model":"S","owner":"Adrian"}},{"key":"CAR5","record":{"color":"purple","make":"Peugeot","model":"205","owner":"Michel"}},{"key":"CAR6","record":{"color":"white","make":"Chery","model":"S22L","owner":"Aarav"}},{"key":"CAR7","record":{"color":"violet","make":"Fiat","model":"Punto","owner":"Pari"}},{"key":"CAR8","record":{"color":"indigo","make":"Tata","model":"nano","owner":"Valeria"}},{"key":"CAR9","record":{"color":"brown","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```
