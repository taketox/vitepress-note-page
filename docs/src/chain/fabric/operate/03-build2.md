# Fabric 2.2.5 环境搭建

## Hyperledger Fabric 2.2.5 环境搭建

### 一、 下载 Fabric 安装包

直接在GitHub下载：

- 源码：fabric-2.2.5
- fabric-samples-2.2.5
- hyperledger-fabric-linux-amd64-2.2.5.tar.gz

```sh
https://github.com/hyperledger/fabric/tree/v2.2.5

https://github.com/hyperledger/fabric-samples/tree/v2.2.5

https://github.com/hyperledger/fabric/releases/tag/v2.2.5
```

或者通过git 拉取：

```sh
git clone https://github.com/hyperledger/fabric.git && cd fabric

git checkout -b v2.2.5

git clone https://github.com/hyperledger/fabric-samples.git && cd fabric-samples

git checkout -b v2.2.5
```

### 二、安装Fabric

解压所有压缩包：

```sh
[root@localhost ~]# ll
-rw-rw-rw-.  1 root root 29064586 Nov 22 03:43 fabric-2.2.5.zip
-rw-rw-rw-.  1 root root  1575601 Nov 22 03:43 fabric-samples-2.2.5.zip
-rw-rw-rw-.  1 root root 65409772 Jan 28  2022 hyperledger-fabric-linux-amd64-2.2.5.tar.gz
```

```sh
unzip fabric-2.2.5.zip

unzip fabric-samples-2.2.5.zip

tar -xvf hyperledger-fabric-linux-amd64-2.2.5.tar.gz

#修改名称（可选）
mv fabric-2.2.5/ fabric
mv fabric-samples-2.2.5/ fabric-samples
```

全部文件：

```sh
[root@localhost ~]# ll
drwxr-xr-x.  2 1001 1001      123 Jan 28  2022 bin
drwxr-xr-x.  2 1001 1001       64 Jan 28  2022 config
drwxr-xr-x. 25 root root     4096 Jan 27  2022 fabric-2.2.5
-rw-rw-rw-.  1 root root 29064586 Nov 22 03:43 fabric-2.2.5.zip
drwxr-xr-x. 25 root root     4096 Nov 22 04:27 fabric-samples-2.2.5
-rw-rw-rw-.  1 root root  1575601 Nov 22 03:43 fabric-samples-2.2.5.zip
-rw-rw-rw-.  1 root root 65409772 Jan 28  2022 hyperledger-fabric-linux-amd64-2.2.5.tar.gz
```

### 三、拉取Fabric镜像

进入 **/fabric/scripts** 目录

```sh
cd fabric/scripts/

#备份
cp bootstrap.sh bootstrap.sh.back
```

修改 **bootstrap.sh** 脚本

```sh
vi bootstrap.sh
```

注释掉 **cloneSamplesRepo** 和 **pullBinaries** 

```shell
if [ "$SAMPLES" == "true" ]; then
    echo
    echo "Clone hyperledger/fabric-samples repo"
    echo
#    cloneSamplesRepo
fi
if [ "$BINARIES" == "true" ]; then
    echo
    echo "Pull Hyperledger Fabric binaries"
    echo
#    pullBinaries
fi
if [ "$DOCKER" == "true" ]; then
    echo
    echo "Pull Hyperledger Fabric docker images"
    echo
    pullDockerImages
fi
```

运行脚本拉取镜像：

```sh
[root@localhost scripts]# ./bootstrap.sh
```

查看拉取的镜像

```sh
[root@localhost scripts]# docker images
REPOSITORY                   TAG       IMAGE ID       CREATED         SIZE
busybox                      latest    9d5226e6ce3f   5 days ago      1.24MB
hyperledger/fabric-tools     2.2       754df4def0cf   9 months ago    442MB
hyperledger/fabric-tools     2.2.5     754df4def0cf   9 months ago    442MB
hyperledger/fabric-tools     latest    754df4def0cf   9 months ago    442MB
hyperledger/fabric-peer      2.2       94f45b88b26a   9 months ago    51MB
hyperledger/fabric-peer      2.2.5     94f45b88b26a   9 months ago    51MB
hyperledger/fabric-peer      latest    94f45b88b26a   9 months ago    51MB
hyperledger/fabric-orderer   2.2       c25c16d51e1e   9 months ago    34.7MB
hyperledger/fabric-orderer   2.2.5     c25c16d51e1e   9 months ago    34.7MB
hyperledger/fabric-orderer   latest    c25c16d51e1e   9 months ago    34.7MB
hyperledger/fabric-ccenv     2.2       7cce5e687fe7   9 months ago    516MB
hyperledger/fabric-ccenv     2.2.5     7cce5e687fe7   9 months ago    516MB
hyperledger/fabric-ccenv     latest    7cce5e687fe7   9 months ago    516MB
hyperledger/fabric-baseos    2.2       ab5f045ec622   9 months ago    6.94MB
hyperledger/fabric-baseos    2.2.5     ab5f045ec622   9 months ago    6.94MB
hyperledger/fabric-baseos    latest    ab5f045ec622   9 months ago    6.94MB
hyperledger/fabric-ca        1.5       24a7c19a9fd8   20 months ago   70.8MB
hyperledger/fabric-ca        1.5.2     24a7c19a9fd8   20 months ago   70.8MB
hyperledger/fabric-ca        latest    24a7c19a9fd8   20 months ago   70.8MB
```

### 四、Fabric-samples

将 **bin** 和 **config** 复制到 **fabric-samples** 目录下：

```sh
[root@localhost ~]# cp -r bin/ fabric-samples/

[root@localhost ~]# cp -r config/ fabric-samples/
```

### 五、Fabric网络搭建

#### 1. 运行测试网络：

您可以在`fabric-samples`代码库的`test-network`目录中找到启动网络的脚本。 使用以下命令导航至测试网络目录：

```sh
cd fabric-samples/test-network
```

在此目录中，您可以找到带注释的脚本`network.sh`，该脚本在本地计算机上使用Docker镜像建立Fabric网络。 你可以运行`./network.sh -h`以打印脚本帮助文本：

```sh
Usage:
  network.sh <Mode> [Flags]
    Modes:
      up - bring up fabric orderer and peer nodes. No channel is created
      up createChannel - bring up fabric network with one channel
      createChannel - create and join a channel after the network is created
      deployCC - deploy the asset transfer basic chaincode on the channel or specify
      down - clear the network with docker-compose down
      restart - restart the network

    Flags:
    -ca <use CAs> -  create Certificate Authorities to generate the crypto material
    -c <channel name> - channel name to use (defaults to "mychannel")
    -s <dbtype> - the database backend to use: goleveldb (default) or couchdb
    -r <max retry> - CLI times out after certain number of attempts (defaults to 5)
    -d <delay> - delay duration in seconds (defaults to 3)
    -ccn <name> - the short name of the chaincode to deploy: basic (default),ledger, private, secured
    -ccl <language> - the programming language of the chaincode to deploy: go (default), java, javascript, typescript
    -ccv <version>  - chaincode version. 1.0 (default)
    -ccs <sequence>  - chaincode definition sequence. Must be an integer, 1 (default), 2, 3, etc
    -ccp <path>  - Optional, chaincode path. Path to the chaincode. When provided the -ccn will be used as the deployed name and not the short name of the known chaincodes.
    -cci <fcn name>  - Optional, chaincode init required function to invoke. When provided this function will be invoked after deployment of the chaincode and will define the chaincode as initialization required.
    -i <imagetag> - the tag to be used to launch the network (defaults to "latest")
    -cai <ca_imagetag> - the image tag to be used for CA (defaults to "latest")
    -verbose - verbose mode
    -h - print this message

 Possible Mode and flag combinations
   up -ca -c -r -d -s -i -verbose
   up createChannel -ca -c -r -d -s -i -verbose
   createChannel -c -r -d -verbose
   deployCC -ccn -ccl -ccv -ccs -ccp -cci -r -d -verbose

 Taking all defaults:
   network.sh up

 Examples:
   network.sh up createChannel -ca -c mychannel -s couchdb -i 2.0.0
   network.sh createChannel -c channelName
   network.sh deployCC -ccn basic -ccl javascript
```

在`test-network`目录中，运行以下命令删除先前运行的所有容器或工程：

```bash
./network.sh down
```

然后，您可以通过执行以下命令来启动网络。如果您尝试从另一个目录运行脚本，则会遇到问题：

```bash
./network.sh up
```

此命令创建一个由两个对等节点和一个排序节点组成的Fabric网络。 运行`./network.sh up`时没有创建任何channel。 如果命令执行成功，您将看到已创建的节点的日志：

```sh
Creating network "net_test" with the default driver
Creating volume "net_orderer.example.com" with default driver
Creating volume "net_peer0.org1.example.com" with default driver
Creating volume "net_peer0.org2.example.com" with default driver
Creating orderer.example.com    ... done
Creating peer0.org2.example.com ... done
Creating peer0.org1.example.com ... done
CONTAINER ID        IMAGE                               COMMAND             CREATED             STATUS                  PORTS                              NAMES
8d0c74b9d6af        hyperledger/fabric-orderer:latest   "orderer"           4 seconds ago       Up Less than a second   0.0.0.0:7050->7050/tcp             orderer.example.com
ea1cf82b5b99        hyperledger/fabric-peer:latest      "peer node start"   4 seconds ago       Up Less than a second   0.0.0.0:7051->7051/tcp             peer0.org1.example.com
cd8d9b23cb56        hyperledger/fabric-peer:latest      "peer node start"   4 seconds ago       Up 1 second             7051/tcp, 0.0.0.0:9051->9051/tcp   peer0.org2.example.com
```

#### 2. 创建一个通道

现在我们的机器上正在运行对等节点和排序节点， 我们可以使用脚本创建用于在Org1和Org2之间进行交易的Fabric通道。 通道是特定网络成员之间的专用通信层。通道只能由被邀请加入通道的组织使用，并且对网络的其他成员不可见。 每个通道都有一个单独的区块链账本。被邀请的组织“加入”他们的对等节点来存储其通道账本并验证交易。

您可以使用`network.sh`脚本在Org1和Org2之间创建通道并加入他们的对等节点。 运行以下命令以创建一个默认名称为“ mychannel”的通道：

```sh
./network.sh createChannel
```

如果命令成功执行，您将看到以下消息打印在您的日志：

```sh
Channel 'mychannel' created
Joining org1 peer to the channel...
Anchor peer set for org 'Org1MSP' on channel 'mychannel'
Anchor peer set for org 'Org2MSP' on channel 'mychannel'
Channel 'mychannel' joined
```

您也可以使用channel标志创建具有自定义名称的通道。 作为一个例子，以下命令将创建一个名为`channel1`的通道：

```sh
./network.sh createChannel -c channel1
```

通道标志还允许您创建多个不同名称的多个通道。 创建`mychannel`或`channel1`之后，您可以使用下面的命令创建另一个名为`channel2`的通道：

```sh
./network.sh createChannel -c channel2
```

如果您想一步建立网络并创建频道，则可以使用`up`和`createChannel`模式一起：

```sh
./network.sh up createChannel
```

#### 3. 在通道启动一个链码

使用`network.sh`创建频道后，您可以使用以下命令在通道上启动链码：

注意：go代理

```sh
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go
```

`deployCC`子命令将在`peer0.org1.example.com`和`peer0.org2.example.com`上安装 **asset-transfer (basic)** 链码。 然后在使用通道标志（或`mychannel`如果未指定通道）的通道上部署指定的通道的链码。 如果您第一次部署一套链码，脚本将安装链码的依赖项。默认情况下，脚本安装Go版本的 asset-transfer (basic) 链码。 但是您可以使用语言便签 `-l`，用于安装 Java 或 javascript 版本的链码。 您可以在 `fabric-samples` 目录的 `asset-transfer-basic` 文件夹中找到 asset-transfer (basic) 链码。 此目录包含作为案例和用来突显 Fabric 特征的样本链码。

```sh
Chaincode definition committed on channel 'mychannel'
Using organization 1
Querying chaincode definition on peer0.org1 on channel 'mychannel'...
Attempting to Query committed status on peer0.org1, Retry after 3 seconds.
+ peer lifecycle chaincode querycommitted --channelID mychannel --name basic
+ res=0
Committed chaincode definition for chaincode 'basic' on channel 'mychannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
Query chaincode definition successful on peer0.org1 on channel 'mychannel'
Using organization 2
Querying chaincode definition on peer0.org2 on channel 'mychannel'...
Attempting to Query committed status on peer0.org2, Retry after 3 seconds.
+ peer lifecycle chaincode querycommitted --channelID mychannel --name basic
+ res=0
Committed chaincode definition for chaincode 'basic' on channel 'mychannel':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
Query chaincode definition successful on peer0.org2 on channel 'mychannel'
Chaincode initialization is not required
```

#### 4. 与网络交互

在您启用测试网络后，可以使用`peer` CLI与您的网络进行交互。 `peer` CLI允许您调用已部署的智能合约，更新通道，或安装和部署新的智能合约。

确保您正在从`test-network`目录进行操作。 您可以在`fabric-samples`代码库的`bin`文件夹中找到`peer`二进制文件。 使用以下命令将这些二进制文件添加到您的CLI路径：

```sh
export PATH=${PWD}/../bin:$PATH
```

您还需要将`fabric-samples`代码库中的`FABRIC_CFG_PATH`设置为指向其中的`core.yaml`文件：

```sh
export FABRIC_CFG_PATH=$PWD/../config/
```

现在，您可以设置环境变量，以允许您作为Org1操作`peer` CLI：

```sh
# Environment variables for Org1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

`CORE_PEER_TLS_ROOTCERT_FILE`和`CORE_PEER_MSPCONFIGPATH`环境变量指向Org1的`organizations`文件夹中的的加密材料。 如果您使用 `./network.sh deployCC -ccl go` 安装和启动 asset-transfer (basic) 链码，您可以调用链码（Go）的 `InitLedger` 方法来赋予一些账本上的初始资产（如果使用 typescript 或者 javascript，例如 `./network.sh deployCC -l javascript`，你会调用相关链码的 `initLedger` 功能）。 运行以下命令用一些资产来初始化账本：

```sh
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
```

如果命令成功，您将观察到类似以下的输出：

```sh
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
```

现在你可以用你的 CLI 工具来查询账本。运行以下指令来获取添加到通道账本的资产列表：

```sh
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
```

如果成功，您将看到以下输出：

```sh
[{"ID":"asset1","color":"blue","size":5,"owner":"Tomoko","appraisedValue":300},{"ID":"asset2","color":"red","size":5,"owner":"Brad","appraisedValue":400},{"ID":"asset3","color":"green","size":10,"owner":"Jin Soo","appraisedValue":500},{"ID":"asset4","color":"yellow","size":10,"owner":"Max","appraisedValue":600},{"ID":"asset5","color":"black","size":15,"owner":"Adriana","appraisedValue":700},{"ID":"asset6","color":"white","size":15,"owner":"Michel","appraisedValue":800}]
```

当一个网络成员希望在账本上转一些或者改变一些资产，链码会被调用。使用以下的指令来通过调用 asset-transfer (basic) 链码改变账本上的资产所有者：

```sh
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'
```

如果命令成功，您应该看到以下响应：

```sh
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
```

因为 asset-transfer (basic) 链码的背书策略需要交易同时被 Org1 和 Org2 签名，链码调用指令需要使用 `--peerAddresses` 标签来指向 `peer0.org1.example.com` 和 `peer0.org2.example.com`。因为网络的 TLS 被开启，指令也需要用 `--tlsRootCertFiles` 标签指向每个 peer 节点的 TLS 证书。

调用链码之后，我们可以使用另一个查询来查看调用如何改变了区块链账本的资产。因为我们已经查询了 Org1 的 peer，我们可以把这个查询链码的机会通过 Org2 的 peer 来运行。设置以下的环境变量来操作 Org2：

```sh
# Environment variables for Org2

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

你可以查询运行在 `peer0.org2.example.com` asset-transfer (basic) 链码：

```sh
peer chaincode query -C mychannel -n basic -c '{"Args":["ReadAsset","asset6"]}'
```

结果显示 `"asset6"` 转给了 Christopher:

```sh
{"ID":"asset6","color":"white","size":15,"owner":"Christopher","appraisedValue":800}
```

#### 5. 关停网络

使用完测试网络后，您可以使用以下命令关闭网络：

```sh
./network.sh down
```

该命令将停止并删除节点和链码容器，删除组织加密材料，并从Docker Registry移除链码镜像。 该命令还删除之前运行的通道项目和docker卷。如果您遇到任何问题，还允许您再次运行`./ network.sh up`。

## 故障排除

如果您对本教程有任何疑问，请查看以下内容：

- 您应该始终重新启动网络。 您可以使用以下命令删除先前运行的工件，加密材料，容器，卷和链码镜像：

  ```sh
  ./network.sh down
  ```

  如果您不删除旧的容器，镜像和卷，将看到报错。

- 如果您看到Docker错误，请先检查您的Docker版本([Prerequisites](https://hyperledger-fabric.readthedocs.io/zh_CN/release-2.2/prereqs.html))， 然后尝试重新启动Docker进程。 Docker的问题是经常无法立即识别的。 例如，您可能会看到您的节点无法访问挂载在容器内的加密材料导致的错误。

  如果问题仍然存在，则可以删除镜像并从头开始：

  ```sh
   docker rm -f $(docker ps -aq)
   docker rmi -f $(docker images -q)
  ```

- 如果您在创建，批准，提交，调用或查询命令时发现错误，确保您已正确更新通道名称和链码名称。 提供的示例命令中有占位符值。

- 如果您看到以下错误：

  ```sh
  Error: Error endorsing chaincode: rpc error: code = 2 desc = Error installing chaincode code mycc:1.0(chaincode /var/hyperledger/production/chaincodes/mycc.1.0 exits)
  ```

  您可能有先前运行中链码镜像（例如`dev-peer1.org2.example.com-asset-transfer-1.0`或 `dev-peer0.org1.example.com-asset-transfer-1.0`）。 删除它们并再次尝试。

  ```sh
  docker rmi -f $(docker images | grep dev-peer[0-9] | awk '{print $3}')
  ```

- 如果您看到以下错误：

  ```sh
  [configtx/tool/localconfig] Load -> CRIT 002 Error reading configuration: Unsupported Config Type ""
  panic: Error reading configuration: Unsupported Config Type ""
  ```

  那么您没有正确设置环境变量`FABRIC_CFG_PATH`。configtxgen工具需要此变量才能找到configtx.yaml。 返回执行`export FABRIC_CFG_PATH=$PWD/configtx/configtx.yaml`，然后重新创建您的通道工件。

- 如果看到错误消息指出您仍然具有“active endpoints”，请清理您的Docker网络。 这将清除您以前的网络，并以全新环境开始：

  ```sh
  docker network prune
  ```

  您将看到一下信息：

  ```sh
  WARNING! This will remove all networks not used by at least one container.
  Are you sure you want to continue? [y/N]
  ```

  选 `y`。

- 如果您看到类似下面的错误：

  ```sh
  /bin/bash: ./scripts/createChannel.sh: /bin/bash^M: bad interpreter: No such file or directory
  ```

  确保有问题的文件（在此示例中为**createChannel.sh**）为以Unix格式编码。 这很可能是由于未在Git配置中将`core.autocrlf`设置为`false`（查看[Windows Extras](https://hyperledger-fabric.readthedocs.io/zh_CN/release-2.2/prereqs.html#windows-extras)）。 有几种解决方法。 如果你有例如vim编辑器，打开文件：

  ```sh
  vim ./fabric-samples/test-network/scripts/createChannel.sh
  ```

  然后通过执行以下vim命令来更改其格式：

  ```sh
  :set ff=unix
  ```

- 如果您的排序者在创建时退出，或者您看到由于无法连接到排序服务创建通道命令失败， 请使用`docker logs`命令从排序节点读取日志。 你可能会看到以下消息：

  ```sh
  PANI 007 [channel system-channel] config requires unsupported orderer capabilities: Orderer capability V2_0 is required but not supported: Orderer capability V2_0 is required but not supported
  ```

  当您尝试使用Fabric 1.4.x版本docker镜像运行网络时，会发生这种情况。 测试网络需要使用Fabric 2.x版本运行。