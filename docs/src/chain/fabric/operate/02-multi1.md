# Fabric 1.4.6 多机部署

## Hyperledger Fabric 1.4.6 多机环境搭建

### 1. 节点描述

|    节点    |       IP       |   说明   | 所在组织 |
| :--------: | :------------: | :------: | :------: |
|   order    | 192.168.30.67  | 排序节点 |   独立   |
| peer0.org1 | 192.168.30.67  | 普通节点 |   org1   |
| peer1.org1 | 192.168.30.98  | 普通节点 |   org1   |
| peer0.org2 | 192.168.30.201 | 普通节点 |   org2   |
| peer1.org2 | 192.168.30.203 | 普通节点 |   org2   |

### 2. 准备环境

|       平台       |  CentOS 7.9  |
| :--------------: | :----------: |
|       环境       |    物理机    |
|       容器       |    docker    |
|  fabric-samples  |    1.4.6     |
|      fabric      |    1.4.6     |
|    fabric ca     |    1.4.6     |
| fabric-zookeeper |    0.4.18    |
|   fabric-kafka   |    0.4.18    |
|  fabric-couchdb  |    0.4.18    |
|  fabric-baseos   | amd64-0.4.18 |

### 3. First-network

#### 3.1 精简 first-network 文件夹

- 进入fabric-samples目录，精简 first-network 文件夹，并打包。

```sh
# 进入fabric-samples目录
cd fabric-samples

# 拷贝first-network文件夹
cp -r first-network/ network

# 精简network
[root@orderer fabric-samples-1.4.6]# tree network/
network/
├── base
│   ├── docker-compose-base.yaml
│   └── peer-base.yaml
├── channel-artifacts
├── configtx.yaml
├── crypto-config.yaml
├── docker-compose-cli.yaml
├── docker-compose-couch.yaml
└── docker-compose-e2e-template.yaml

2 directories, 7 files
```

#### 3.2 修改端口

- fabric官方提供的docker-compose，默认单机搭建。各个节点使用不同的端口，若多机器搭建，则建议使用统一端口。

##### 3.2.1 network/configtx.yaml

```sh
# 修改configtx.yaml
# bash
vi configtx.yaml

# content
        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer0.org2.example.com
              Port: 7051 #修改此处
```

##### 3.2.2 network/base/docker-compose-base.yaml

```sh
# 修改docker-compose-base.yaml
# order节点，使用7050端口
# 4个peer节点，除了CHAINCODEADDRESS=7052，CHAINCODELISTENADDRESS=7052以外，其他端口统一使用7051。
# bash
vi base/docker-compose-base.yaml
```

- content

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

services:

  orderer.example.com:
    container_name: orderer.example.com
    extends:
      file: peer-base.yaml
      service: orderer-base
    volumes:
        - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
        - ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp:/var/hyperledger/orderer/msp
        - ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/:/var/hyperledger/orderer/tls
        - orderer.example.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050

  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer0.org1.example.com
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:7051
      - CORE_PEER_CHAINCODEADDRESS=peer0.org1.example.com:7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer1.org1.example.com:8051	#修改此处7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls:/etc/hyperledger/fabric/tls
        - peer0.org1.example.com:/var/hyperledger/production
    ports:
      - 7051:7051

  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer1.org1.example.com
      - CORE_PEER_ADDRESS=peer1.org1.example.com:8051	#修改此处7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:8051	#修改此处7051
      - CORE_PEER_CHAINCODEADDRESS=peer1.org1.example.com:8052	#修改此处7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:8052	#修改此处7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org1.example.com:8051	#修改此处7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls:/etc/hyperledger/fabric/tls
        - peer1.org1.example.com:/var/hyperledger/production

    ports:
      - 8051:8051	#修改此处7051:7051

  peer0.org2.example.com:
    container_name: peer0.org2.example.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer0.org2.example.com
      - CORE_PEER_ADDRESS=peer0.org2.example.com:9051	#修改此处7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:9051	#修改此处7051
      - CORE_PEER_CHAINCODEADDRESS=peer0.org2.example.com:9052	#修改此处7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:9052	#修改此处7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org2.example.com:9051	#修改此处7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer1.org2.example.com:10051	#修改此处7051
      - CORE_PEER_LOCALMSPID=Org2MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls:/etc/hyperledger/fabric/tls
        - peer0.org2.example.com:/var/hyperledger/production
    ports:
      - 9051:9051	#修改此处7051:7051

  peer1.org2.example.com:
    container_name: peer1.org2.example.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer1.org2.example.com
      - CORE_PEER_ADDRESS=peer1.org2.example.com:10051	#修改此处7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:10051	#修改此处7051
      - CORE_PEER_CHAINCODEADDRESS=peer1.org2.example.com:10052	#修改此处7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:10052	#修改此处7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org2.example.com:10051	#修改此处7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org2.example.com:9051	#修改此处7051
      - CORE_PEER_LOCALMSPID=Org2MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls:/etc/hyperledger/fabric/tls
        - peer1.org2.example.com:/var/hyperledger/production
    ports:
      - 10051:10051	#修改此处7051:7051
```

#### 3.3 制作身份证书

本小节使用到的脚本，如：**cryptogen** 。可在 **hyperledger-fabric-linux-amd64-1.4.6.tar** 中获得。

```sh
[root@orderer fabric-samples]# tree bin/
bin/
├── configtxgen
├── configtxlator
├── cryptogen
├── discover
├── fabric-ca-client
├── fabric-ca-server
├── idemixgen
├── orderer
└── peer
```

- cryptogen工具通过读取crypto-config.yaml配置文件，来生成组织结构与身份证书

```sh
# 进入network
cd fabric-sample/network
# 生成组织结构与身份证书
# bash
../bin/cryptogen generate --config=./crypto-config.yaml

# resp
org1.example.com
org2.example.com
```

#### 3.4 生成创世区块

-  configtxgen 工具通过读取 configtx.yaml 配置文件，来生成网络启动的配置文件

```sh
## 声明 FABRIC_CFG_PATH 变量
export FABRIC_CFG_PATH=$PWD

## 生成创世区块
# bash
../bin/configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

# resp
2022-11-02 16:37:24.144 CST [common.tools.configtxgen] main -> WARN 001 Omitting the channel ID for configtxgen for output operations is deprecated.  Explicitly passing the channel ID will be required in the future, defaulting to 'testchainid'.
2022-11-02 16:37:24.144 CST [common.tools.configtxgen] main -> INFO 002 Loading configuration
2022-11-02 16:37:24.372 CST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 003 orderer type: solo
2022-11-02 16:37:24.372 CST [common.tools.configtxgen.localconfig] Load -> INFO 004 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:37:24.577 CST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 005 orderer type: solo
2022-11-02 16:37:24.577 CST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 006 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:37:24.580 CST [common.tools.configtxgen] doOutputBlock -> INFO 007 Generating genesis block
2022-11-02 16:37:24.580 CST [common.tools.configtxgen] doOutputBlock -> INFO 008 Writing genesis block
```

#### 3.5 生成通道配置文件

创建一个mychannel的通道，并生成通道配置文件channel.tx，其保存在 network/channel-artifacts 目录下。

```sh
# 声明 CHANNEL_NAME 变量
# bash
export CHANNEL_NAME=mychannel && ../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

# resp
2022-11-02 16:40:07.618 CST [common.tools.configtxgen] main -> INFO 001 Loading configuration
2022-11-02 16:40:07.839 CST [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:40:08.062 CST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 003 orderer type: solo
2022-11-02 16:40:08.062 CST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 004 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:40:08.062 CST [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 005 Generating new channel configtx
2022-11-02 16:40:08.064 CST [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 006 Writing new channel tx

[root@orderer network]#  ll channel-artifacts/
总用量 24
-rw-r--r--. 1 root root   348 11月  2 16:40 channel.tx
-rw-r--r--. 1 root root 17488 11月  2 16:37 genesis.block
```

#### 3.6 生成2个组织的锚节点文件

```sh
# bash
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP

# resp
2022-11-02 16:41:49.667 CST [common.tools.configtxgen] main -> INFO 001 Loading configuration
2022-11-02 16:41:49.895 CST [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:41:50.122 CST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 003 orderer type: solo
2022-11-02 16:41:50.122 CST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 004 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:41:50.123 CST [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 005 Generating anchor peer update
2022-11-02 16:41:50.123 CST [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 006 Writing anchor peer update

# bash
../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP

# resp
2022-11-02 16:42:02.992 CST [common.tools.configtxgen] main -> INFO 001 Loading configuration
2022-11-02 16:42:03.216 CST [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:42:03.434 CST [common.tools.configtxgen.localconfig] completeInitialization -> INFO 003 orderer type: solo
2022-11-02 16:42:03.434 CST [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 004 Loaded configuration: /root/test/fabric/fabric-samples-1.4.6/network/configtx.yaml
2022-11-02 16:42:03.434 CST [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 005 Generating anchor peer update
2022-11-02 16:42:03.434 CST [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 006 Writing anchor peer update
```

#### 3.7 打包network

- 将 **network** 文件夹打包，发送到其他机器上。

```sh
# 打包
tar -czvf network.tar network/

# 使用scp发送文件
scp network.tar root@192.168.31.98:/root/fabric-samples
scp network.tar root@192.168.31.201:/root/fabric-samples
scp network.tar root@192.168.31.203:/root/fabric-samples

# 解压
tar -zxvf network.tar
```

### 4. 设置 /etc/hosts

- peer0.org1，peer1.org1，peer0.org2，peer1.org2这5台主机都需要配置/etc/hosts

```sh
# 修改/etc/hosts,添加5个域名解析
vi /etc/hosts

# content
192.168.31.67 orderer.example.com
192.168.31.67 peer0.org1.example.com
192.168.31.98 peer1.org1.example.com
192.168.31.201 peer0.org2.example.com
192.168.31.203 peer1.org2.example.com

# 重启网络
systemctl restart network
```

### 5. 设置配置文件

#### 5.1 order节点配置

- 复制docker-compose-cli.yaml，并重命名为docker-compose-orderer.yaml

```sh
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-cli.yaml docker-compose-orderer.yaml
```

- docker-compose-orderer.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  orderer.example.com:

networks:
  byfn:

services:

  orderer.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer.example.com
    container_name: orderer.example.com
    networks:
      - byfn
```

#### 5.2 peer0.org1节点配置

- 复制docker-compose-cli.yaml，并重命名为docker-compose-peer0-Org1.yaml

```sh
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-cli.yaml docker-compose-peer0-Org1.yaml
```

- docker-compose-peer0-Org1.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  peer0.org1.example.com:


networks:
  byfn:

services:

  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org1.example.com
    networks:
      - byfn
    extra_hosts:  ##填写与该结点相连的其他节点IP
      - "orderer.example.com:192.168.31.67"
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"     


  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - SYS_CHANNEL=$SYS_CHANNEL
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- FABRIC_LOGGING_SPEC=DEBUG
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - peer0.org1.example.com
    networks:
      - byfn
    extra_hosts:  ##填写所有的节点IP
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"     
```

#### 5.3 peer1.org1节点配置

- 复制docker-compose-cli.yaml，并重命名为docker-compose-peer1-Org1.yaml

```sh
# 在peer1.org1节点上操作，192.168.31.98
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-cli.yaml docker-compose-peer1-Org1.yaml
```

- docker-compose-peer1-Org1.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  peer1.org1.example.com:


networks:
  byfn:

services:

  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org1.example.com
    networks:
      - byfn
    extra_hosts:  ##填写与该结点相连的其他节点IP
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"   


  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - SYS_CHANNEL=$SYS_CHANNEL
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- FABRIC_LOGGING_SPEC=DEBUG
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer1.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - peer1.org1.example.com
    networks:
      - byfn
    extra_hosts:  ##填写所有的节点IP
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"       
```

#### 5.4 peer0.org2节点配置

- 复制docker-compose-cli.yaml，并重命名为docker-compose-peer0-Org2.yaml

```sh
# 在peer0.org2节点上操作，192.168.31.201
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-cli.yaml docker-compose-peer0-Org2.yaml
```

- docker-compose-peer0-Org2.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  peer0.org2.example.com:


networks:
  byfn:

services:

  peer0.org2.example.com:
    container_name: peer0.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org2.example.com
    networks:
      - byfn
    extra_hosts:  
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer1.org2.example.com:192.168.31.203"   


  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - SYS_CHANNEL=$SYS_CHANNEL
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- FABRIC_LOGGING_SPEC=DEBUG
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org2.example.com:7051
      - CORE_PEER_LOCALMSPID=Org2MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - peer0.org2.example.com
    networks:
      - byfn
    extra_hosts:  
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"     
```

#### 5.5 peer1.org2节点配置

- 复制docker-compose-cli.yaml，并重命名为docker-compose-peer1-Org2.yaml

```sh
# 在peer1.org2节点上操作，192.168.31.203
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-cli.yaml docker-compose-peer1-Org2.yaml
```

- docker-compose-peer1-Org2.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  peer1.org2.example.com:


networks:
  byfn:

services:

  peer1.org2.example.com:
    container_name: peer1.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org2.example.com
    networks:
      - byfn
    extra_hosts:  
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201" 
   


  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - SYS_CHANNEL=$SYS_CHANNEL
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- FABRIC_LOGGING_SPEC=DEBUG
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer1.org2.example.com:7051
      - CORE_PEER_LOCALMSPID=Org2MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - peer1.org2.example.com
    networks:
      - byfn
    extra_hosts:  
      - "orderer.example.com:192.168.31.67"
      - "peer0.org1.example.com:192.168.31.67" 
      - "peer1.org1.example.com:192.168.31.98"
      - "peer0.org2.example.com:192.168.31.201"
      - "peer1.org2.example.com:192.168.31.203"    
```

#### 5.6 peer0.org1的CouchDB配置

- 复制docker-compose-couch.yaml，并重命名为docker-compose-peer0-Org1-couch.yaml

```sh
# 在peer0.org1节点上操作，192.168.31.67
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-couch.yaml docker-compose-peer0-Org1-couch.yaml
```

- docker-compose-peer0-Org1-couch.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

networks:
  byfn:

services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
    networks:
      - byfn

  peer0.org1.example.com: ##指定节点域名
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    depends_on:
      - couchdb0
```

#### 5.7 peer1.org1的CouchDB配置

- 复制docker-compose-couch.yaml，并重命名为docker-compose-peer1-Org1-couch.yaml

```sh
# 在peer1.org1节点上操作，192.168.31.98
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-couch.yaml docker-compose-peer1-Org1-couch.yaml
```

- docker-compose-peer1-Org1-couch.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

networks:
  byfn:

services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
    networks:
      - byfn

  peer1.org1.example.com: ##指定节点域名
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    depends_on:
      - couchdb0
```

#### 5.8 peer0.org2的CouchDB配置

- 复制docker-compose-couch.yaml，并重命名为docker-compose-peer0-Org2-couch.yaml

```sh
# 在peer0.org2节点上操作，192.168.31.201
# 进入目录
cd /root/fabric-samples/network
# 复制
cp docker-compose-couch.yaml docker-compose-peer0-Org2-couch.yaml
```

- docker-compose-peer0-Org2-couch.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

networks:
  byfn:

services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
    networks:
      - byfn

  peer0.org2.example.com:
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    depends_on:
      - couchdb0
```

#### 5.9 peer1.org2的CouchDB配置

-  复制docker-compose-couch.yaml，并重命名为docker-compose-peer1-Org2-couch.yaml

```sh
cp docker-compose-couch.yaml docker-compose-peer1-Org2-couch.yaml
```

- docker-compose-peer1-Org2-couch.yaml

```yaml
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

networks:
  byfn:

services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
    networks:
      - byfn

  peer1.org2.example.com:
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    depends_on:
      - couchdb0
```

#### 5.10 节点的目录结构

- 192.168.31.67

```sh
drwxr-xr-x. 2 root root    60 11月  2 16:24 base
drwxr-xr-x. 2 root root   111 11月  2 16:42 channel-artifacts
-rw-r--r--. 1 root root 18003 11月  2 14:43 configtx.yaml
drwxr-xr-x. 4 root root    59 11月  2 16:35 crypto-config
-rw-r--r--. 1 root root  4039 11月  2 14:31 crypto-config.yaml
-rw-r--r--. 1 root root  3006 11月  2 14:31 docker-compose-cli.yaml
-rw-r--r--. 1 root root  4560 11月  2 14:31 docker-compose-couch.yaml
-rw-r--r--. 1 root root  2883 11月  2 14:31 docker-compose-e2e-template.yaml
-rw-r--r--. 1 root root   345 11月  2 16:56 docker-compose-orderer.yaml
-rw-r--r--. 1 root root  1257 11月  2 17:13 docker-compose-peer0-Org1-couch.yaml
-rw-r--r--. 1 root root  2568 11月  2 16:59 docker-compose-peer0-Org1.yaml
```

- 192.168.31.98

```sh
drwxr-xr-x. 2 root root    60 11月  2 16:24 base
drwxr-xr-x. 2 root root   111 11月  2 16:42 channel-artifacts
-rw-r--r--. 1 root root 18003 11月  2 14:43 configtx.yaml
drwxr-xr-x. 4 root root    59 11月  2 16:35 crypto-config
-rw-r--r--. 1 root root  4039 11月  2 14:31 crypto-config.yaml
-rw-r--r--. 1 root root  3006 11月  2 14:31 docker-compose-cli.yaml
-rw-r--r--. 1 root root  4560 11月  2 14:31 docker-compose-couch.yaml
-rw-r--r--. 1 root root  2883 11月  2 14:31 docker-compose-e2e-template.yaml
-rw-r--r--. 1 root root  1257 11月  2 17:13 docker-compose-peer1-Org1-couch.yaml
-rw-r--r--. 1 root root  2566 11月  2 17:03 docker-compose-peer1-Org1.yaml
```

- 192.168.31.201

```sh
drwxr-xr-x 2 root root    60 11月  2 16:24 base
drwxr-xr-x 2 root root   111 11月  2 16:42 channel-artifacts
-rw-r--r-- 1 root root 18003 11月  2 14:43 configtx.yaml
drwxr-xr-x 4 root root    59 11月  2 16:35 crypto-config
-rw-r--r-- 1 root root  4039 11月  2 14:31 crypto-config.yaml
-rw-r--r-- 1 root root  3006 11月  2 14:31 docker-compose-cli.yaml
-rw-r--r-- 1 root root  4560 11月  2 14:31 docker-compose-couch.yaml
-rw-r--r-- 1 root root  2883 11月  2 14:31 docker-compose-e2e-template.yaml
-rw-r--r-- 1 root root  1236 11月  2 17:14 docker-compose-peer0-Org2-couch.yaml
-rw-r--r-- 1 root root  2498 11月  2 17:14 docker-compose-peer0-Org2.yaml
```

- 192.168.31.203

```sh
drwxr-xr-x 2 root root    60 11月  2 16:24 base
drwxr-xr-x 2 root root   111 11月  2 16:42 channel-artifacts
-rw-r--r-- 1 root root 18003 11月  2 14:43 configtx.yaml
drwxr-xr-x 4 root root    59 11月  2 16:35 crypto-config
-rw-r--r-- 1 root root  4039 11月  2 14:31 crypto-config.yaml
-rw-r--r-- 1 root root  3006 11月  2 14:31 docker-compose-cli.yaml
-rw-r--r-- 1 root root  4560 11月  2 14:31 docker-compose-couch.yaml
-rw-r--r-- 1 root root  2883 11月  2 14:31 docker-compose-e2e-template.yaml
-rw-r--r-- 1 root root  1236 11月  2 17:15 docker-compose-peer1-Org2-couch.yaml
-rw-r--r-- 1 root root  2499 11月  2 17:14 docker-compose-peer1-Org2.yaml
```

### 6. 启动order和peer节点

#### 6.1 启动order 和 peer0.org1

```sh
# 在192.168.31.67上操作
docker-compose -f docker-compose-orderer.yaml -f docker-compose-peer0-Org1.yaml -f docker-compose-peer0-Org1-couch.yaml up
```

#### 6.2 启动peer1.org1

```sh
# 在192.168.31.98上操作
docker-compose -f docker-compose-peer1-Org1.yaml -f docker-compose-peer1-Org1-couch.yaml up
```

#### 6.3 启动peer0.org2

```sh
# 在192.168.31.201上操作
docker-compose -f docker-compose-peer0-Org2.yaml -f docker-compose-peer0-Org2-couch.yaml up
```

#### 6.4 启动peer1.org2

```sh
# 在192.168.31.203上操作
docker-compose -f docker-compose-peer1-Org2.yaml -f docker-compose-peer1-Org2-couch.yaml up
```

### 7. 创建通道文件

- 通道文件，保存了通道里的组织个数，它只需要创建一次，把拷贝到各个peer节点即可。这里从peer0.org1节点创建通道文件mychannel.block，然后把它拷贝到peer0.org2、peer1.org1、peer1.org2节点里。具体如下：

#### 7.1 生成 mychannel.block

```sh
# 进入 cli 容器
docker exec -it cli bash
# 声明环境，并创建通道文件
export CHANNEL_NAME=mychannel
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# bash
peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile $ORDERER_CA

# resp
2022-11-02 14:22:56.284 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2022-11-02 14:22:56.318 UTC [cli.common] readBlock -> INFO 002 Received block: 0

# 生成 mychannel.block
root@74f99a70d9bc:/opt/gopath/src/github.com/hyperledger/fabric/peer# ll
total 24
drwxr-xr-x. 5 root root    83 Nov  2 14:22 ./
drwxr-xr-x. 3 root root    18 Nov  2 14:21 ../
drwxr-xr-x. 2 root root   111 Nov  2 13:38 channel-artifacts/
drwxr-xr-x. 4 root root    59 Nov  2 13:37 crypto/
-rw-r--r--. 1 root root 20549 Nov  2 14:22 mychannel.block
drwxr-xr-x. 2 root root     6 Nov  2 13:44 scripts/
# 将mychannel.block文件，拷贝peer0.org2、peer1.org1、peer.org2的peer目录里
```

#### 7.2 分发mychannel.block

```sh
# 在192.168.31.67上操作
# 进入network
cd fabric-sample/network
mkdir myblock
# 将docker中mychannel.block文件拷贝出来
docker cp cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/mychannel.block ./myblock

# 在192.168.31.98上操作
mkdir -p fabric-sample/network/myblock
# 在192.168.31.201上操作
mkdir -p fabric-sample/network/myblock
# 在192.168.31.203上操作
mkdir -p fabric-sample/network/myblock

# 分发mychannel.block
scp myblock/mychannel.block root@192.168.31.98:~/fabric-sample/network/myblock/
scp myblock/mychannel.block root@192.168.31.201:~/fabric-sample/network/myblock/
scp myblock/mychannel.block root@192.168.31.203:~/fabric-sample/network/myblock/

# 把mychannel.block拷贝到docker中
# 在192.168.31.98上操作
docker cp ./myblock/mychannel.block cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/
# 在192.168.31.201上操作
docker cp ./myblock/mychannel.block cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/
# 在192.168.31.203上操作
docker cp ./myblock/mychannel.block cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/
```

### 8. 加入通道，并设置锚节点

#### 8.1 将4个peer节点加入通道

```sh
# 在192.168.31.67，192.168.31.98，192.168.31.201，192.168.31.203上分别操作
# 进入docker
docker exec -it cli bash
# 声明变量
export CHANNEL_NAME=mychannel
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
# 加入通道
peer channel join -b mychannel.block

#resp
2022-11-02 14:41:50.370 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2022-11-02 14:41:50.444 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```

#### 8.2 设置锚节点，并安装链码

- 将peer0.org1设为组织org1的锚节点，同时安装链码

```sh
# 在192.168.31.67上操作，设置锚节点
# bash
peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile $ORDERER_CA
#resp
2022-11-02 14:45:53.627 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2022-11-02 14:45:53.644 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update

# 安装链码
# bash
peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
#resp
2022-11-02 14:47:17.514 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2022-11-02 14:47:17.515 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2022-11-02 14:47:17.907 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 
```

-  将peer0.org2设为组织org2的锚节点，同时安装链码

```sh
# 在192.168.31.201上操作，设置锚节点
# bash
peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile $ORDERER_CA
#resp

# 安装链码
# bash
peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
#resp
2022-11-02 14:50:44.156 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2022-11-02 14:50:44.157 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2022-11-02 14:50:44.511 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 
```

### 9. 实例化链码，并测试

#### 9.1 实例化

```sh
# bash
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
# resp
2022-11-02 14:52:44.348 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2022-11-02 14:52:44.349 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```

#### 9.2 查询

```sh
# bash
peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
# resp
100
```

#### 9.3 调用

```sh
# bash
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["invoke","a","b","10"]}'
```

### 10. 关闭并清空fabric网络

- 当不需要使用fabric时，请关闭fabric网络

#### 10.1 关闭并清空order和peer0-Org1

```sh
docker-compose -f docker-compose-orderer.yaml -f docker-compose-peer0-Org1.yaml -f docker-compose-peer0-Org1-couch.yaml down
docker-compose -f docker-compose-orderer.yaml -f docker-compose-peer0-Org1.yaml -f docker-compose-peer0-Org1-couch.yaml down --volumes 
```

#### 10.2 关闭并清空peer1-Org1

```sh
docker-compose -f docker-compose-peer1-Org1.yaml -f docker-compose-peer1-Org1-couch.yaml down
docker-compose -f docker-compose-peer1-Org1.yaml -f docker-compose-peer1-Org1-couch.yaml down --volumes 
```

#### 10.3 关闭并清空peer0-Org2

```sh
docker-compose -f docker-compose-peer0-Org2.yaml -f docker-compose-peer0-Org2-couch.yaml down
docker-compose -f docker-compose-peer0-Org2.yaml -f docker-compose-peer0-Org2-couch.yaml down --volumes 
```

#### 10.4 关闭并清空peer1-Org2

```sh
docker-compose -f docker-compose-peer1-Org2.yaml -f docker-compose-peer1-Org2-couch.yaml down
docker-compose -f docker-compose-peer1-Org2.yaml -f docker-compose-peer1-Org2-couch.yaml down --volumes 
```



### 故障排除

```sh
# 报错信息
Error: got unexpected status: BAD_REQUEST -- error validating channel creation transaction for new channel 'mychannel', could not succesfully apply update to template configuration: error authorizing update: error validating DeltaSet: policy for [Group]  /Channel/Application not satisfied: implicit policy evaluation failed - 0 sub-policies were satisfied, but this policy requires 1 of the 'Admins' sub-policies to be satisfied

# 删除证书配置文件
参考 10. 关闭并清空fabric网络
docker volume rm $(docker volume ls)

# 停用全部运行中的容器
docker stop $(docker ps -q)
# 删除全部容器
docker rm $(docker ps -aq)
# 删除所有镜像
docker rmi -f $(docker images -qa)
```
