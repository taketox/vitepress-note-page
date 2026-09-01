# Fabric 1.4.6 环境搭建

## Hyperledger Fabric 1.4.6 环境搭建

### 一、 环境准备

#### 1.  安装 docker

安装docker依赖库：

```sh
#安装yum-utils包
yum install -y yum-utils device-mapper-persistent-data lvm2
```

添加Docker CE的软件源信息：

```sh
#建议国内使用阿里云镜像加速器
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

#更新yum软件包索引
yum makecache fast
```

安装最新版docker：

```sh
yum install -y docker-ce
```

启动docker：

```sh
systemctl start docker
```

查看docker版本信息：

```sh
[root@localhost ~]# docker -v
Docker version 20.10.18, build b40c2f6
```

#### 2.  安装 docker-compose

下载：

```sh
# 最低版本要求1.27.4
curl -L https://get.daocloud.io/docker/compose/releases/download/1.29.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

赋予权限：

```sh
chmod +x /usr/local/bin/docker-compose
```

查看docker-compose版本信息：

```sh
[root@localhost ~]# docker-compose version
docker-compose version 1.29.2, build 8a1c60f6
docker-py version: 4.1.0
CPython version: 3.7.5
OpenSSL version: OpenSSL 1.1.0l  10 Sep 2019
```

#### 3. 安装 go

```sh
# 安装wget
yum -y install wget
# 下载go安装包
wget https://golang.google.cn/dl/go1.18.7.linux-amd64.tar.gz

# 卸载原有的go
rm -rf /usr/local/go
# 压缩，安装，配置环境变量
tar -xzf go1.18.7.linux-amd64.tar.gz -C /usr/local
ln -s /usr/local/go/bin/* /usr/bin/
go version
mkdir -p $HOME/go-work/src
mkdir -p $HOME/go-work/pkg
mkdir -p $HOME/go-work/bin
echo "export GOROOT=/usr/local/go">>$HOME/.bashrc
echo "export GOPATH=$HOME/go-work">>$HOME/.bashrc
echo "export PATH=$PATH:$GOROOT/bin:$GOPATH/bin">>$HOME/.bashrc
source $HOME/.bashrc
go env
```

- 配置go代理

```sh
export GOPROXY=https://goproxy.cn,direct
# 或者
go env -w GOPROXY=https://goproxy.cn,direct
```

#### 4. 安装 git

```sh
yum install -y git
```

查看git版本信息：

```sh
[root@localhost ~]# git version
git version 1.8.3.1
```

### 二、 下载 Fabric 安装包

直接在GitHub下载：

- 源码：fabric-1.4.6
- fabric-samples-1.4.6
- hyperledger-fabric-ca-linux-amd64-1.4.6.tar
- hyperledger-fabric-linux-amd64-1.4.6.tar

```sh
https://github.com/hyperledger/fabric/releases/tag/v1.4.6

https://github.com/hyperledger/fabric-samples/releases/tag/v1.4.6

https://github.com/hyperledger/fabric-ca/releases/download/v1.4.6/hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz

https://github.com/hyperledger/fabric/releases/download/v1.4.6/hyperledger-fabric-linux-amd64-1.4.6.tar.gz
```

或者通过git 拉取：

```sh
git clone https://github.com/hyperledger/fabric.git && cd fabric

git checkout -b v1.4.6

git clone https://github.com/hyperledger/fabric-samples.git && cd fabric-samples

git checkout -b v1.4.6
```

### 三、安装Fabric

解压所有压缩包：

```sh
[root@localhost ~]# ll
total 219556
-rw-------. 1 root root     1222 Oct  8 02:38 anaconda-ks.cfg
-rw-rw-rw-. 1 root root 24562504 Oct  8 03:41 fabric-1.4.6.zip
-rw-rw-rw-. 1 root root  1029011 Oct  8 23:34 fabric-samples-1.4.6.zip
-rw-rw-rw-. 1 root root 24446703 Oct  8 22:44 hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz
-rw-rw-rw-. 1 root root 83495162 Oct  8 03:40 hyperledger-fabric-linux-amd64-1.4.6.tar.gz
```

```sh
unzip fabric-1.4.6.zip

unzip fabric-samples-1.4.6.zip

tar -xvf hyperledger-fabric-linux-amd64-1.4.6.tar.gz

tar -xvf hyperledger-fabric-ca-linux-amd64-1.4.6.tar.gz

#修改名称（可选）
mv fabric-1.4.6/ fabric
mv fabric-samples-1.4.6/ fabric-samples
```

全部文件：

```sh
[root@localhost ~]# ll
total 12
-rw-------.  1 root root   1222 Oct  8 02:38 anaconda-ks.cfg
drwxrwxr-x.  2 1000   1000  171 Mar 28  2020 bin
drwxr-xr-x.  2 1001 docker   64 Feb 25  2020 config
drwxr-xr-x. 27 root root   4096 Feb 25  2020 fabric
drwxr-xr-x. 14 root root   4096 Jan 24  2020 fabric-samples
drwxr-xr-x.  2 root root    201 Oct  9 03:40 package
```

### 四、拉取Fabric镜像

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

注释掉 **samplesInstall()** 和 **binariesInstall()** 

```sh
    220 if [ "$SAMPLES" == "true" ]; then
    221   echo
    222   echo "Installing hyperledger/fabric-samples repo"
    223   echo
    224 #  samplesInstall
    225 fi
    226 if [ "$BINARIES" == "true" ]; then
    227   echo
    228   echo "Installing Hyperledger Fabric binaries"
    229   echo
    230 #  binariesInstall
```

运行脚本拉取镜像：

```sh
[root@localhost scripts]# ./bootstrap.sh
```

查看拉取的镜像

```sh
[root@localhost scripts]# docker images
REPOSITORY                     TAG       IMAGE ID       CREATED       SIZE
hyperledger/fabric-javaenv     1.4.6     68914607b3a5   2 years ago   1.68GB
hyperledger/fabric-javaenv     latest    68914607b3a5   2 years ago   1.68GB
hyperledger/fabric-ca          1.4.6     3b96a893c1e4   2 years ago   150MB
hyperledger/fabric-ca          latest    3b96a893c1e4   2 years ago   150MB
hyperledger/fabric-tools       1.4.6     0f9743ac0662   2 years ago   1.49GB
hyperledger/fabric-tools       latest    0f9743ac0662   2 years ago   1.49GB
hyperledger/fabric-ccenv       1.4.6     191911f4454f   2 years ago   1.36GB
hyperledger/fabric-ccenv       latest    191911f4454f   2 years ago   1.36GB
hyperledger/fabric-orderer     1.4.6     84eaba5388e7   2 years ago   120MB
hyperledger/fabric-orderer     latest    84eaba5388e7   2 years ago   120MB
hyperledger/fabric-peer        1.4.6     5a52faa5d8c2   2 years ago   128MB
hyperledger/fabric-peer        latest    5a52faa5d8c2   2 years ago   128MB
hyperledger/fabric-zookeeper   0.4.18    ede9389347db   2 years ago   276MB
hyperledger/fabric-zookeeper   latest    ede9389347db   2 years ago   276MB
hyperledger/fabric-kafka       0.4.18    caaae0474ef2   2 years ago   270MB
hyperledger/fabric-kafka       latest    caaae0474ef2   2 years ago   270MB
hyperledger/fabric-couchdb     0.4.18    d369d4eaa0fd   2 years ago   261MB
hyperledger/fabric-couchdb     latest    d369d4eaa0fd   2 years ago   261MB
```

### 五、Fabric-samples

将 **bin** 和 **config** 复制到 **fabric-samples** 目录下：

```sh
[root@localhost ~]# cp -r bin/ fabric-samples/

[root@localhost ~]# cp -r config/ fabric-samples/
```

将 **fabric-samples** 的 **bin** 加入路径PATH：

```sh
vi /etc/profile

#/root/fabric-samples/bin
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin:/root/fabric-samples/bin

source /etc/profile
```

### 六、Fabric网络搭建

#### 1. 生成Fabric网络：

```sh
#进入first-network目录
cd fabric-samples/first-network/

#自动化脚本 byfn.sh 可以自动帮我们创建网络环境运行时所需的所有内容，但在一些特定情况之下，我们根据不同的需求需要自定义一些设置。
./byfn.sh -m generate
```

#### 2. 生成组织结构与身份证书

```sh
[root@localhost first-network]# ../bin/cryptogen generate --config=./crypto-config.yaml
org1.example.com
org2.example.com
```

配置文件 **crypto-config.yaml** 生成 **Hyperledger Fabric** 网络环境中所需的组织结构及身份证书信息，组织中的成员提供节点服务，相应的证书代表身份，可以在实体间进行通信以及交易时进行签名与验证。
crypto-config.yaml，其配置文件包含如下内容：

```yaml
OrdererOrgs:
  - Name: Orderer    # Orderer的名称
    Domain: Example Domain    # 域名
    Specs:
      - Hostname: orderer    # hostname + Domain的值组成Orderer节点的完整域名

PeerOrgs:
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: true      # 在msp下生成config.yaml文件
    Template:
      Count: 2
    Users:
      Count: 1

  - Name: Org2
    Domain: org2.example.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

该配置文件指定了 OrdererOrgs 及 PeerOrgs 两个组织信息。在 PeerOrgs 配置信息中指定了 Org1 与 Org2 两个组织。每个组织使用Template属性下的 Count 指定了两个节点，Users属性下的 Count 指定了一个用户。

证书和密钥（即MSP材料）将被输出到当前一个名为 crypto-config 的目录中，该目录下有两个子目录：

```sh
[root@localhost first-network]# cd crypto-config
[root@localhost crypto-config]# ll
total 0
drwxr-xr-x. 3 root root 25 Oct  9 04:00 ordererOrganizations
drwxr-xr-x. 4 root root 54 Oct  9 04:00 peerOrganizations
```

注：
ordererOrganizations：子目录下包括构成 Orderer 组织(1个 Orderer 节点)的身份信息；
peerOrganizations：子目录下为所有的 Peer 节点组织(2个组织，4个节点)的相关身份信息。其中最关键的是 MSP 目录，代表了实体的身份信息。

#### 3. 生成初始区块

在 fabric-samples/first-network 目录下创建 Orderer 服务启动初始区，指定使用configtx.yaml 文件中定义的TwoOrgsOrdererGenesis 模板，生成 Orderer 服务系统通道的初始区块文件。

```sh
[root@localhost first-network]# ../bin/configtxgen -profile TwoOrgsOrdererGenesis-outputBlock ./channel-artifacts/genesis.block
2022-10-09 04:08:08.961 EDT [common.tools.configtxgen] main -> INFO 001 Loading configuration
2022-10-09 04:08:09.025 EDT [common.tools.configtxgen.localconfig] completeInitialization -> INFO 002 orderer type: solo
2022-10-09 04:08:09.025 EDT [common.tools.configtxgen.localconfig] LoadTopLevel -> INFO 003 Loaded configuration: /root/fabric-samples/first-network/configtx.yaml
```

注：configtx.yaml 文件用于创建服务启动初始区块及应用通道交易配置文件，同时指定了指定 Orderer 服务的相关配置以及当前的联盟信息

其中，Orderer部分指定了Orderer节点的信息：

OrdererType 指定了共识排序服务的实现方式，有两种选择（solo 及 Kafka）；
1、Addresses 指定了 Orderer 节点的服务地址与端口号；
2、BatchSize 指定了批处理大小，如最大交易数量，最大字节数及建议字节数。

Profiles 部分指定了两个模板：
1、TwoOrgsOrdererGenesis 模板用来生成Orderer服务的初始区块文件；
2、TwoOrgsChannel 模板用来生成应用通道交易配置文件。

#### 4. 启动first-network

进入fabric-samples目录下的first-network后，执行byfn.sh脚本

```sh
[root@localhost first-network]# ./byfn.sh up
```

出现以下标识，则表示搭建完成。

```sh
===================== Query successful on peer1.org2 on channel 'mychannel' ===================== 

========= All GOOD, BYFN execution completed =========== 


 _____   _   _   ____   
| ____| | \ | | |  _ \  
|  _|   |  \| | | | | | 
| |___  | |\  | | |_| | 
|_____| |_| \_| |____/  
```

使用top命令可以查看到会有4个peer节点进程。

```sh
 PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                                   
 15451 root      20   0  938756 105888  14012 S   1.7  5.7   0:03.31 peer                                   
 15546 root      20   0  938756 150076  13976 S   1.7  8.1   0:03.26 peer                                   
 15601 root      20   0  870912  95552  13112 S   1.7  5.1   0:02.46 peer                                   
 15407 root      20   0  938436 136668  13924 S   1.3  7.3   0:03.29 peer                                   
```

查看docker

```sh
[root@localhost first-network]# docker ps
CONTAINER ID   IMAGE                                                                                                  COMMAND                  CREATED         STATUS         PORTS                                           NAMES
760db2f61f99   dev-peer1.org2.example.com-mycc-1.0-26c2ef32838554aac4f7ad6f100aca865e87959c9a126e86d764c8d01f8346ab   "chaincode -peer.add…"   2 minutes ago   Up 2 minutes                                                   dev-peer1.org2.example.com-mycc-1.0
a71a66dfd855   dev-peer0.org1.example.com-mycc-1.0-384f11f484b9302df90b453200cfb25174305fce8f53f4e94d45ee3b6cab0ce9   "chaincode -peer.add…"   2 minutes ago   Up 2 minutes                                                   dev-peer0.org1.example.com-mycc-1.0
26c48aa70177   dev-peer0.org2.example.com-mycc-1.0-15b571b3ce849066b7ec74497da3b27e54e0df1345daff3951b94245ce09c42b   "chaincode -peer.add…"   3 minutes ago   Up 3 minutes                                                   dev-peer0.org2.example.com-mycc-1.0
b2a022564431   hyperledger/fabric-tools:latest                                                                        "/bin/bash"              3 minutes ago   Up 3 minutes                                                   cli
57cbf112f744   hyperledger/fabric-orderer:latest                                                                      "orderer"                3 minutes ago   Up 3 minutes   0.0.0.0:7050->7050/tcp, :::7050->7050/tcp       orderer.example.com
41b1804746d1   hyperledger/fabric-peer:latest                                                                         "peer node start"        3 minutes ago   Up 3 minutes   0.0.0.0:8051->8051/tcp, :::8051->8051/tcp       peer1.org1.example.com
ac8745a6047f   hyperledger/fabric-peer:latest                                                                         "peer node start"        3 minutes ago   Up 3 minutes   0.0.0.0:7051->7051/tcp, :::7051->7051/tcp       peer0.org1.example.com
3f3af62939e2   hyperledger/fabric-peer:latest                                                                         "peer node start"        3 minutes ago   Up 3 minutes   0.0.0.0:10051->10051/tcp, :::10051->10051/tcp   peer1.org2.example.com
6ebbeb5a5f1a   hyperledger/fabric-peer:latest                                                                         "peer node start"        3 minutes ago   Up 3 minutes   0.0.0.0:9051->9051/tcp, :::9051->9051/tcp       peer0.org2.example.com
```

#### 5. 关闭first-network

```sh
[root@localhost first-network]# ./byfn.sh down
```
