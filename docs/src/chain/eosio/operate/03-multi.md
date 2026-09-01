# 多节点环境部署

## 部署环境

|   平台    |             CentOS Linux release 7.9.2009 (Core)             |
| :-------: | :----------------------------------------------------------: |
|   环境    |                            虚拟机                            |
|   eosio   |                eosio-2.0.13-1.el7.x86_64.rpm                 |
| eosio.cdt |               eosio.cdt-1.8.0-1-el7.x86_64.rpm               |
| eosio节点 |                        192.168.10.151                        |
|  BP节点   | firstnode：192.168.10.152<br>secondnode：192.168.10.153<br>thirdnode：192.168.10.154 |

## 部署流程

### 1. 在四个节点上安装Centos7环境

### 2. 在四个节点上安装Eosio环境

```sh
#eosio
yum install eosio-2.0.13-1.el7.x86_64.rpm
#eosio.cdt
yum install eosio.cdt-1.8.0-1-el7.x86_64.rpm
```

### 3. 将四个节点上的keosd和nodeos运行起来

```sh
#keosd
keosd &
#nodeos
nodeos >> nodeos.log 2>&1 &
```

### 4. 在Eosio节点上创建钱包并导入eosio密钥

- 创建钱包

```sh
#创建钱包，保存密码
cleos wallet create --to-console >> eosio-wallet/wallet-pwd.txt
```

- 导入eosio密钥

```sh
#key
cleos wallet import --private-key=5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
#sign
cleos wallet import --private-key=5K463ynhZoCDDa4RDcr63cUwWLTnKqmdcoTKTHBjqoKfv4u5V7p
```

- 查看密钥

```sh
[root@localhost ~]# cleos wallet keys
[
  "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
  "EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr"
]
```

### 5. 为BP节点生成公私钥

- 创建公私钥

```sh
#firstnode
[root@localhost ~]# cleos wallet create_key
warn  2022-10-11T03:25:20.257 keosd     wallet.cpp:219                save_wallet_file     ] saving wallet to file /root/eosio-wallet/./default.wallet
Created new private key with a public key of: "EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT"
#secondnode
[root@localhost ~]# cleos wallet create_key
warn  2022-10-11T03:25:24.012 keosd     wallet.cpp:219                save_wallet_file     ] saving wallet to file /root/eosio-wallet/./default.wallet
Created new private key with a public key of: "EOS5hkJnANyzLgRT2C3mMTXE7NRn4TSx11tXA4CodLZvWfWvt2ECk"
#thirdnode
[root@localhost ~]# cleos wallet create_key
warn  2022-10-11T03:25:27.824 keosd     wallet.cpp:219                save_wallet_file     ] saving wallet to file /root/eosio-wallet/./default.wallet
Created new private key with a public key of: "EOS5xVidfrQdjaUVMKHCvmNNHdtRD53XNgabHc4oxxrHPUF3mqGKD"
```

- 查看公私钥

```sh
#查看公私钥
[root@localhost ~]# cleos wallet private_keys
password: [[
    "EOS5hkJnANyzLgRT2C3mMTXE7NRn4TSx11tXA4CodLZvWfWvt2ECk",		#secondnode
    "5KLEtRMGLewidUHHJVcatvEcVWsccPGwoiygrWCPN39odjJVTwB"
  ],[
    "EOS5xVidfrQdjaUVMKHCvmNNHdtRD53XNgabHc4oxxrHPUF3mqGKD",		#thirdnode
    "5JawbmVBCEsDSEJgPBEC5B6E4fGBThBkfZbnrRCHbaZWXqbLmxN"
  ],[
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",		#key
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
  ],[
    "EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT",		#firstnode
    "5Kia43muvXhyxwAND1uaXrW9L66ajiLYeNrtkWfndtw9LyQPFtY"
  ],[
    "EOS8cbqdwyPF36Z38Uc8V64AAFTSNwGYxhAnN284Yz6YozqNpxcX8",		#sign
    "5JUcHArZiyeKmZG964APmRpNBgBSmBdD3xAkBiJPKARVPfeUvFR"
  ]
]
```

### 6. 修改四个节点的nodeos的配置文件

#### 1. 产生nodeos的配置文件config.ini

第一次运行 **nodeos** 时，会自动生成 **config.ini** 文件。

nodoes的config.ini文件默认位置在 **/root/.local/share/eosio/nodeos/config/config.ini**

#### 2. 各节点config.ini配置

- **eosio**节点config.ini

```sh
enable-stale-production = true

plugin = eosio::chain_api_plugin
plugin = eosio::producer_plugin
plugin = eosio::producer_api_plugin
plugin = eosio::db_size_api_plugin
plugin = eosio::net_api_plugin
plugin = eosio::history_api_plugin 	#这个是记录事务的插件

filter-on = * 	#这个是与history_api_plugin有关，是收集所有的账户的事务

producer-name = eosio
agent-name = "EOS Master BP Node"	#无影响
max-transaction-time = 1000 #设置事务的时间，对eosio.system部署时间长有用

http-validate-host = false

p2p-listen-endpoint = 192.168.10.151:9876
p2p-server-address = 192.168.10.151:9876
http-server-address = 192.168.10.151:8889
p2p-peer-address = 192.168.10.152:9876
p2p-peer-address = 192.168.10.153:9876
p2p-peer-address = 192.168.10.154:9876

contracts-console = true 	#可将智能合约的输出结果输出到命令行，可用于判断执行结果

signature-provider=EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV=KEY:5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
```

- **firstnode**节点config.ini

```sh
plugin = eosio::chain_api_plugin
plugin = eosio::producer_plugin
plugin = eosio::db_size_api_plugin
plugin = eosio::net_api_plugin
plugin = eosio::history_api_plugin 	#这个是记录事务的插件

filter-on = * 	#这个是与history_api_plugin有关，是收集所有的账户的事务

producer-name = firstnode
signature-provider = EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT=KEY:5Kia43muvXhyxwAND1uaXrW9L66ajiLYeNrtkWfndtw9LyQPFtY

agent-name = "EOS Master BP Node"
max-transaction-time = 1000

http-validate-host = false

enable-stale-production = true

p2p-listen-endpoint = 192.168.10.152:9876
p2p-server-address = 192.168.10.152:9876
http-server-address = 192.168.10.152:8889
p2p-peer-address = 192.168.10.151:9876
p2p-peer-address = 192.168.10.153:9876
p2p-peer-address = 192.168.10.154:9876

contracts-console = true #可将智能合约的输出结果输出到命令行，可用于判断执行结果
```

- **secondnode**节点config.ini

```sh
plugin = eosio::chain_api_plugin
plugin = eosio::producer_plugin
plugin = eosio::db_size_api_plugin
plugin = eosio::net_api_plugin
plugin = eosio::history_api_plugin 	#这个是记录事务的插件

filter-on = * 	#这个是与history_api_plugin有关，是收集所有的账户的事务

producer-name = secondnode
signature-provider = EOS5hkJnANyzLgRT2C3mMTXE7NRn4TSx11tXA4CodLZvWfWvt2ECk=KEY:5KLEtRMGLewidUHHJVcatvEcVWsccPGwoiygrWCPN39odjJVTwB

agent-name = "EOS Master BP Node"
max-transaction-time = 1000

http-validate-host = false

enable-stale-production = true

p2p-listen-endpoint = 192.168.10.153:9876
p2p-server-address = 192.168.10.153:9876
http-server-address = 192.168.10.153:8889
p2p-peer-address = 192.168.10.151:9876
p2p-peer-address = 192.168.10.152:9876
p2p-peer-address = 192.168.10.154:9876

contracts-console = true #可将智能合约的输出结果输出到命令行，可用于判断执行结果
```

- **thirdnode**节点config.ini

```sh
plugin = eosio::chain_api_plugin
plugin = eosio::producer_plugin
plugin = eosio::db_size_api_plugin
plugin = eosio::net_api_plugin
plugin = eosio::history_api_plugin 	#这个是记录事务的插件

filter-on = * 	#这个是与history_api_plugin有关，是收集所有的账户的事务

producer-name = thirdnode
signature-provider = EOS5xVidfrQdjaUVMKHCvmNNHdtRD53XNgabHc4oxxrHPUF3mqGKD=KEY:5JawbmVBCEsDSEJgPBEC5B6E4fGBThBkfZbnrRCHbaZWXqbLmxN

agent-name = "EOS Master BP Node"
max-transaction-time = 1000

http-validate-host = false

enable-stale-production = true

p2p-listen-endpoint = 192.168.10.154:9876
p2p-server-address = 192.168.10.154:9876
http-server-address = 192.168.10.154:8889
p2p-peer-address = 192.168.10.151:9876
p2p-peer-address = 192.168.10.152:9876
p2p-peer-address = 192.168.10.153:9876

contracts-console = true #可将智能合约的输出结果输出到命令行，可用于判断执行结果
```

**注：**

​在BP节点中**enable-stale-production**也要设为**true**,否则在投票后，BP节点上的胜选的用户无法生产区块，日志会一直显示如下的信息：

```sh
info  2022-10-11T04:03:25.890 net-1     net_plugin.cpp:3091           connection_monitor   ] p2p client connections: 0/25, peer connections: 1/1
```

#### 3. 启动nodeos

```sh
#启动节点
nodeos --verbose-http-errors >> nodeos.log 2>&1 &
#查看日志
tail -f nodeos.log
#如果节点没有退出，先停止节点。
pkill -SIGTERM nodeos
```

#### 4. 测试两个节点是否可以同步

- 需要开放节点与节点之间通信的接口，本文为9876

  ```sh
  #centos7 开放端口
  firewall-cmd --zone=public --add-port=9876/tcp --permanent
  #或者直接关闭防火墙(不推荐)
  systemctl stop firewalld
  ```

- 根据其中出现的信息来确认两个节点是否区块同步

  ```tex
  1. 根据其出块速度以及块的序号相同则两个节点已经同步
  2. 如果出现了forkout这样的分叉信息，说明由于之前两个节点都是分别生产区块的，所以可以将BP节点上的区块全部删除(在BP节点上)，然后它就会同步Eosio节点上的区块。
  ```

## 协议部署

### 1. 部署eosio.bios协议

**这是重要的一步，需要先激活，才能部署eosio.bios协议**

原因：EOSIO 2.0以上的版本之后, 部署`eosio.bios`或`eosio.system`会报错 `Error 3070000: WASM Exception \ Error Details: \ env.set_proposed_producers_ex unresolveable` 的问题

- v1.8和v2.0中引入的所有协议升级功能首先都需要 `PREACTIVATE_FEATURE` 激活特殊的协议功能
- 此版本中包含的`eosio.system`和`eosio.bios`合同只能在激活 `WTMSIG_BLOCK_SIGNATURES` 共识协议升级后才能部署在EOSIO区块链上

1.激活特殊协议 **PREACTIVATE_FEATURE**： (注意, nodeos需要先开启 **eosio::producer_api_plugin** 插件)

```sh
[root@localhost contracts]# curl -X POST http://192.168.10.151:8889/v1/producer/schedule_protocol_feature_activations -d '{"protocol_features_to_activate": ["0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd"]}'
#response
{"result":"ok"}
```

2.部署**add-boot-contract**分支的 **eosio.boot** 系统合约

```sh
[root@localhost contracts]# cleos -u http://192.168.10.151:8889 set contract eosio ./eosio.boot -p eosio@active
Reading WASM from /root/contracts/eosio.boot/eosio.boot.wasm...
Publishing contract...
executed transaction: 5173b85f54c671d0ba43c35141ac663450bb2da6294ed22c08672d3bad7ba4bc  2752 bytes  1600 us
#         eosio <= eosio::setcode               {"account":"eosio","vmtype":0,"vmversion":0,"code":"0061736d01000000013e0c60000060027f7f0060017e0060...
#         eosio <= eosio::setabi                {"account":"eosio","abi":"0e656f73696f3a3a6162692f312e32001008616374697661746500010e666561747572655f...
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

3.激活 **WTMSIG_BLOCK_SIGNATURES** 协议

```sh
cleos -u http://192.168.10.151:8889 push transaction '{"delay_sec":0,"max_cpu_usage_ms":0,"actions":[{"account":"eosio","name":"activate","data":{"feature_digest":"299dcb6af692324b899b39f16d5a530a33062804e41f09dc97e9f156b4476707"},"authorization":[{"actor":"eosio","permission":"active"}]}]}'
```

4.最后查询下**PREACTIVATE_FEATURE**和**WTMSIG_BLOCK_SIGNATURES**是否已成功激活

```sh
curl -X POST http://192.168.10.151:8889/v1/chain/get_activated_protocol_features -d '{}'
```

```sh
{
  "activated_protocol_features": [
    {
      "feature_digest": "0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd",
      "activation_ordinal": 0,
      "activation_block_num": 4318,
      "description_digest": "64fe7df32e9b86be2b296b3f81dfd527f84e82b98e363bc97e40bc7a83733310",
      "dependencies": [
        
      ],
      "protocol_feature_type": "builtin",
      "specification": [
        {
          "name": "builtin_feature_codename",
          "value": "PREACTIVATE_FEATURE"	#看value是否为PREACTIVATE_FEATURE
        }
      ]
    },
    {
      "feature_digest": "299dcb6af692324b899b39f16d5a530a33062804e41f09dc97e9f156b4476707",
      "activation_ordinal": 1,
      "activation_block_num": 5080,
      "description_digest": "ab76031cad7a457f4fd5f5fca97a3f03b8a635278e0416f77dcc91eb99a48e10",
      "dependencies": [
        
      ],
      "protocol_feature_type": "builtin",
      "specification": [
        {
          "name": "builtin_feature_codename",
          "value": "WTMSIG_BLOCK_SIGNATURES"	#看value是否为WTMSIG_BLOCK_SIGNATURES
        }
      ]
    }
  ]
}
```

5.部署**eosio.bios**协议

```sh
[root@localhost contracts]# cleos -u http://192.168.10.151:8889 set contract eosio ./eosio.bios -p eosio@active
Reading WASM from /root/contracts/eosio.bios/eosio.bios.wasm...
Publishing contract...
executed transaction: 32f391e34c7d04ca1a400914bafbbfd793a2cd3ffdb735a1b31b66e4196cea8b  9080 bytes  1189 us
#         eosio <= eosio::setcode               {"account":"eosio","vmtype":0,"vmversion":0,"code":"0061736d0100000001b5011d60000060037f7e7f0060027f...
#         eosio <= eosio::setabi                {"account":"eosio","abi":"0e656f73696f3a3a6162692f312e310117626c6f636b5f7369676e696e675f617574686f72...
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

### 2. 激活eosio一些的特性，这对于多节点部署无影响

```sh
# GET_SENDER
cleos -u http://192.168.10.151:8889 push action eosio activate '["f0af56d2c5a48d60a4a5b5c903edfb7db3a736a94ed589d0b797df33ff9d3e1d"]' -p eosio

# FORWARD_SETCODE
cleos -u http://192.168.10.151:8889 push action eosio activate '["2652f5f96006294109b3dd0bbde63693f55324af452b799ee137a81a905eed25"]' -p eosio

# ONLY_BILL_FIRST_AUTHORIZER
cleos -u http://192.168.10.151:8889 push action eosio activate  '["8ba52fe7a3956c5cd3a656a3174b931d3bb2abb45578befc59f283ecd816a405"]' -p eosio

# RESTRICT_ACTION_TO_SELF
cleos -u http://192.168.10.151:8889 push action eosio activate  '["ad9e3d8f650687709fd68f4b90b41f7d825a365b02c23a636cef88ac2ac00c43"]' -p eosio

# DISALLOW_EMPTY_PRODUCER_SCHEDULE
cleos -u http://192.168.10.151:8889 push action eosio activate '["68dcaa34c0517d19666e6b33add67351d8c5f69e999ca1e37931bc410a297428"]' -p eosio

# FIX_LINKAUTH_RESTRICTION
cleos -u http://192.168.10.151:8889 push action eosio activate  '["e0fb64b1085cc5538970158d05a009c24e276fb94e1a0bf6a528b48fbc4ff526"]' -p eosio

# REPLACE_DEFERRED
cleos -u http://192.168.10.151:8889 push action eosio activate  '["ef43112c6543b88db2283a2e077278c315ae2c84719a8b25f25cc88565fbea99"]' -p eosio

# NO_DUPLICATE_DEFERRED_ID
cleos -u http://192.168.10.151:8889 push action eosio activate '["4a90c00d55454dc5b059055ca213579c6ea856967712a56017487886a4d4cc0f"]' -p eosio

# ONLY_LINK_TO_EXISTING_PERMISSION
cleos -u http://192.168.10.151:8889 push action eosio activate '["1a99a59d87e06e09ec5b028a9cbb7749b4a5ad8819004365d02dc4379a8b7241"]' -p eosio

# RAM_RESTRICTIONS
cleos -u http://192.168.10.151:8889 push action eosio activate '["4e7bf348da00a945489b2a681749eb56f5de00b900014e137ddae39f48f69d67"]' -p eosio 
```

### 3.  创建系统用户

为了方便执行系统命令(直接使用eosio的sign的公钥)

```sh
cleos -u http://192.168.10.151:8889 create account eosio  eosio.bpay EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.token EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.msig EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.names EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.ram EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.ramfee EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.saving EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.stake EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.vpay EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.wrap EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
cleos -u http://192.168.10.151:8889 create account eosio  eosio.rex EOS8Znrtgwt8TfpmbVpTKvA2oB8Nqey625CLN8bCN3TEbgx86Dsvr
```

注：

​一定不要将账户名称输错，每一个账户名在`eosio.system`系统智能合约中都有相应的用处，没有相对应个账户存在就会报错。

### 4. 部署协议发行代币

1.部署eosio.token协议

```sh
cleos -u http://192.168.10.151:8889  set contract eosio.token contracts/eosio.token
```

2.发行10亿代币

```sh
cleos -u http://192.168.10.151:8889 push action eosio.token create '["eosio","1000000000.0000 SYS"]' -p eosio.token@active
```

3.将10亿 SYS Token 切换到流通的状态

```sh
cleos -u http://192.168.10.151:8889 push action eosio.token issue '["eosio","1000000000.0000 SYS","memo"]' -p eosio@active
```

4.部署eosio.msig协议

```sh
cleos -u http://192.168.10.151:8889 set contract eosio.msig contracts/eosio.msig

cleos -u http://192.168.10.151:8889  push action eosio setpriv '["eosio.msig",1]' -p eosio 
```

5.部署eosio.system协议

```sh
cleos -u http://192.168.10.151:8889 set contract eosio contracts/eosio.system
```

6.部署eosio.wrap协议

```sh
cleos -u http://192.168.10.151:8889 set contract eosio.wrap contracts/eosio.wrap

cleos -u http://192.168.10.151:8889 push action eosio setpriv '["eosio.wrap",1]' -p eosio 
```

7.初始化

```sh
#4理解为SYS的精度
cleos -u http://192.168.10.151:8889 push action eosio init '[0,"4,SYS"]' -p eosio@active 
```

## 多节点部署

### 1. 创建普通用户

**注**：

​刚开始发行了10亿SYS，eosio规定需要至少15%的货币参与投票才能使eosio停止出块，被投票数最高的21位节点生产区块。

1.创建firstnode账户，并预设一些资源

```sh
#创建firstnode账户
cleos --url http://192.168.10.151:8889 system newaccount --transfer eosio firstnode EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT --stake-net "100000000.0000 SYS" --stake-cpu "100000000.0000 SYS" --buy-ram "20000.0000 SYS"

#转账
cleos --url http://192.168.10.151:8889 transfer eosio firstnode "20000.0000 SYS"
```

2.创建secondnode账户，并预设一些资源

```sh
#创建secondnode账户
cleos --url http://192.168.10.151:8889 system newaccount --transfer eosio secondnode EOS5hkJnANyzLgRT2C3mMTXE7NRn4TSx11tXA4CodLZvWfWvt2ECk --stake-net "100000000.0000 SYS" --stake-cpu "100000000.0000 SYS" --buy-ram "20000.0000 SYS"

#转账
cleos --url http://192.168.10.151:8889 transfer eosio secondnode "20000.0000 SYS"
```

3.创建thirdnode账户，并预设一些资源

```sh
#创建thirdnode账户
cleos --url http://192.168.10.151:8889 system newaccount --transfer eosio thirdnode EOS5xVidfrQdjaUVMKHCvmNNHdtRD53XNgabHc4oxxrHPUF3mqGKD --stake-net "100000000.0000 SYS" --stake-cpu "100000000.0000 SYS" --buy-ram "20000.0000 SYS"

#转账
cleos --url http://192.168.10.151:8889 transfer eosio thirdnode "20000.0000 SYS"
```

### 2. 注册节点候选人

```sh
#firstnode
cleos --url http://192.168.10.151:8889  system regproducer firstnode EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT

#secondnode
cleos --url http://192.168.10.151:8889  system regproducer secondnode EOS5hkJnANyzLgRT2C3mMTXE7NRn4TSx11tXA4CodLZvWfWvt2ECk

#thirdnode
cleos --url http://192.168.10.151:8889  system regproducer thirdnode EOS5xVidfrQdjaUVMKHCvmNNHdtRD53XNgabHc4oxxrHPUF3mqGKD
```

### 3. 查看节点候选人

```sh
cleos --url http://192.168.10.151:8889 system listproducers
```

### 4. 给创建的账户转账

```sh
#firstnode
cleos --url http://192.168.10.151:8889 push action eosio.token transfer '["eosio", "firstnode","1000.0000 SYS","vote"]' -p eosio

#secondnode
cleos --url http://192.168.10.151:8889 push action eosio.token transfer '["eosio", "secondnode","1000.0000 SYS","vote"]' -p eosio

#thirdnode
cleos --url http://192.168.10.151:8889 push action eosio.token transfer '["eosio", "thirdnode","1000.0000 SYS","vote"]' -p eosio
```

### 5. 使用命令进行投票（自己给自己投票）

所有代币的15%进行投票后eosio会停止出块，主网会自动启动。在这里我们的代币数据数量总共是10亿，那么我们的主网启动需要1.5亿质押的代币进行投票后才能启动，质押的代币计算方式：staked = cpu + net：

```sh
#firstnode
cleos --url http://192.168.10.151:8889 system voteproducer prods firstnode firstnode

#secondnode
cleos --url http://192.168.10.151:8889 system voteproducer prods secondnode secondnode

#thirdnode
cleos --url http://192.168.10.151:8889 system voteproducer prods thirdnode thirdnode
```

### 查看运行日志

EOSIO创世用户不再出块，由选举出来的各个节点轮流出块，创世节点不出块，只同步块。

```sh
info  2022-10-11T09:47:58.405 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 49077913dea8cbd6... #25967 @ 2022-10-11T09:47:58.500 signed by thirdnode [trxs: 0, lib: 25921, conf: 0, latency: -94 ms]
info  2022-10-11T09:47:58.906 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 91cda7d4c948909a... #25968 @ 2022-10-11T09:47:59.000 signed by thirdnode [trxs: 0, lib: 25921, conf: 0, latency: -93 ms]
info  2022-10-11T09:47:59.305 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 5bd86b086bdcec4f... #25969 @ 2022-10-11T09:47:59.500 signed by thirdnode [trxs: 0, lib: 25921, conf: 0, latency: -194 ms]
info  2022-10-11T09:47:59.901 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block f1c12fc7a1cb0155... #25970 @ 2022-10-11T09:48:00.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 24]
info  2022-10-11T09:48:00.400 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 1998115caa95381c... #25971 @ 2022-10-11T09:48:00.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:00.900 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block f3ea55a62a904ddb... #25972 @ 2022-10-11T09:48:01.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:01.400 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block cdf4cf86c7a931b4... #25973 @ 2022-10-11T09:48:01.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:01.900 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 50e7616332195beb... #25974 @ 2022-10-11T09:48:02.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:02.400 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 3597b41d457ac896... #25975 @ 2022-10-11T09:48:02.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:02.901 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block ba27163bca876fa8... #25976 @ 2022-10-11T09:48:03.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:03.400 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 220d5f902a6affe5... #25977 @ 2022-10-11T09:48:03.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:03.900 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 64fee841e27b74a1... #25978 @ 2022-10-11T09:48:04.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:04.400 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block cea457f2c8068231... #25979 @ 2022-10-11T09:48:04.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:04.900 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block 63ccd8679b2db652... #25980 @ 2022-10-11T09:48:05.000 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:05.300 nodeos    producer_plugin.cpp:2293      produce_block        ] Produced block fd89ee7c1c344e98... #25981 @ 2022-10-11T09:48:05.500 signed by firstnode [trxs: 0, lib: 25933, confirmed: 0]
info  2022-10-11T09:48:05.909 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block b0213f763ba70d61... #25982 @ 2022-10-11T09:48:06.000 signed by secondnode [trxs: 0, lib: 25945, conf: 24, latency: -90 ms]
info  2022-10-11T09:48:06.409 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 15f2bed07635daee... #25983 @ 2022-10-11T09:48:06.500 signed by secondnode [trxs: 0, lib: 25945, conf: 0, latency: -90 ms]
info  2022-10-11T09:48:06.908 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 42e813c8c10ece70... #25984 @ 2022-10-11T09:48:07.000 signed by secondnode [trxs: 0, lib: 25945, conf: 0, latency: -91 ms]
info  2022-10-11T09:48:07.410 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 36566e5f331a6591... #25985 @ 2022-10-11T09:48:07.500 signed by secondnode [trxs: 0, lib: 25945, conf: 0, latency: -89 ms]
info  2022-10-11T09:48:07.908 nodeos    producer_plugin.cpp:379       on_incoming_block    ] Received block 929afd3d724dbb6c... #25986 @ 2022-10-11T09:48:08.000 signed by secondnode [trxs: 0, lib: 25945, conf: 0, latency: -91 ms]
```

### 部署合约

1.创建hello

```sh
cleos --url http://192.168.10.151:8889 system newaccount --transfer eosio hello EOS7EDvq1zuYNf9qmEaoUGsxaWJy6FBg4KXYZeadD8RrsJ4umsPjT --stake-net "100.0000 SYS" --stake-cpu "100.0000 SYS" --buy-ram "1000.0000 SYS"
```

2.部署合约

```sh
cleos --url http://192.168.10.151:8889 set contract hello ./hello/ -p hello@active
```

3.调用合约

```sh
[root@localhost ~]# cleos --url http://192.168.10.151:8889 push action hello hi '["123"]' -p hello@active
executed transaction: 8ffdabe4281d5d28d658395458cc535ef3c423269e90b24b374be0aaf17c044e  96 bytes  141 us
#         hello <= hello::hi                    {"user":"123"}
>> Hello, 123
```
