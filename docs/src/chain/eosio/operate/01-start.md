# 快速开始

## 系统介绍

**EOSIO核心组件**

**nodeos** : 在每个[EOSIO](https://developers.eos.io/manuals/eos/latest/nodeos/index)节点上运行的核心服务守护程序。

**cleos** : 与区块链交互和管理钱包的命令行界面。

**keosd** : 用于存储私钥和签署数字消息的密钥管理器服务守护进程。

**eosio.cdt** : 合约开发工具包是一套用于构建EOSIO合约的工具。

**eosio.contracts** : 提供EOSIO区块链的一些基本功能的智能合约。

### 系统要求

**EOSIO 版本**

| **Component**   | **Version** |
| --------------- | ----------- |
| eosio           | 2.1.0       |
| eosio.cdt       | 1.8.0       |
| eosio.contracts | 1.9.0       |
| eosjs           | 22.0        |

**支持的操作系统**

- Amazon Linux 2
- CentOS Linux 8.x
- CentOS Linux 7.x
- Ubuntu 20.04
- Ubuntu 18.04
- macOS 10.14 (Mojave)
- macOS 10.15 (Catalina)

### 安装 EOSIO

为了尽快开始，我们建议使用EOSIO预构建的二进制文件。您还有一个从源代码构建的高级选项，但这将花费一个小时或更多时间。

以下命令将下载相应操作系统的二进制文件。

**Ubuntu 20.04 Package Install**

```sh
wget https://github.com/eosio/eos/releases/download/v2.1.0/eosio_2.1.0-1-ubuntu-20.04_amd64.deb
sudo apt install ./eosio_2.1.0-1-ubuntu-20.04_amd64.deb
```

**Ubuntu 18.04 Package Install**

```sh
wget https://github.com/eosio/eos/releases/download/v2.1.0/eosio_2.1.0-1-ubuntu-18.04_amd64.deb
sudo apt install ./eosio_2.1.0-1-ubuntu-18.04_amd64.deb
```

**CentOS 7 RPM Package Install**

```sh
wget https://github.com/eosio/eos/releases/download/v2.1.0/eosio-2.1.0-1.el7.x86_64.rpm
sudo yum install ./eosio-2.1.0-1.el7.x86_64.rpm
```

**CentOS 8 RPM Package Install**

```sh
wget https://github.com/eosio/eos/releases/download/v2.1.0/eosio-2.1.0-1.el8.x86_64.rpm
sudo yum install ./eosio-2.1.0-1.el8.x86_64.rpm
```

注意：

在安装过程将安装nodeos、cleos和keosd，它们是运行区块链并与区块链交互所需的组件。

### **安装 EOSIO.CDT 开发包**

EOSIO合同开发工具包（简称CDT）是一组与合同编译相关的工具。后续教程主要使用CDT来编译合约和生成ABI。

从1.3.x开始，CDT支持Mac OS x brew、Linux Debian和RPM软件包。

如果您有eosio的版本。系统上安装了1.3.0之前的cdt，请在继续之前卸载

#### **Ubuntu (Debian)**

**Install**

```sh
wget https://github.com/eosio/eosio.cdt/releases/download/v1.8.0/eosio.cdt_1.8.0-1-ubuntu-18.04_amd64.deb

sudo apt install ./eosio.cdt_1.8.0-1-ubuntu-18.04_amd64.deb
```

**Uninstall**

```sh
sudo apt remove eosio.cdt
```

#### **CentOS/Redhat (RPM)**

**Install**

```sh
wget https://github.com/eosio/eosio.cdt/releases/download/v1.8.0/eosio.cdt-1.8.0-1.el7.x86_64.rpm

sudo yum install ./eosio.cdt-1.8.0-1.el7.x86_64.rpm
```

**Uninstall**

```sh
$ sudo yum remove eosio.cdt
```

## 创建开发钱包

私钥本地存储在Keosd中。私钥是非对称加密使用的公私密钥对的一半。相应的公钥存储在区块链上并与账户关联。正是这些密钥用于保护帐户和签署交易。

使用Cleos在区块链上运行命令，并通过钱包和其他命令与账户和密钥交互。

### Step 1: 创建钱包

第一步是创建一个钱包。使用cleos wallet create创建一个新的“默认”钱包。如果在生产中最好使用cleos命令创建，这样您的钱包密码就不会出现在bash历史记录中。出于开发目的，由于这些是开发密钥，而不是生产密钥，因此不会对安全造成威胁。

```sh
cleos wallet create --to-console
```

cleos将返回私钥密码，请保管好密码。

```sh
Creating wallet: default
Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
"PW5Kewn9L76X8Fpd....................t42S9XCw2"
```

**关于钱包**

加密货币中关于钱包的一个常见误解是它们存储代币。然而，在现实中，钱包用于将私钥存储在加密文件中，以签署交易。钱包不作为代币的存储介质。

用户通常通过接口构建交易对象，将该对象发送到要签名的钱包，然后钱包返回带有签名的交易对象，然后将该签名广播到网络。当/如果网络确认交易有效，则该交易将包含在区块链上的区块中。

### Step 2: 开启钱包

启动keosd实例时，钱包默认关闭。要开始，请运行以下命令

```sh
cleos wallet open
```

查看钱包列表：default 钱包锁定、default*钱包解锁

```sh
cleos wallet list
```

and it will return

```sh
Wallets:
[
  "default"
]
```

### Step 3: 解锁钱包

钱包解锁，需要刚才保存的密钥。

```sh
cleos wallet unlock

cleos wallet list

Wallets:
[
  "default *"
]
```

### Step 4: 密钥导入钱包

生成私钥，cleos有一个命令可以完成。

```sh
cleos wallet create_key
```

It will return something like..

```sh
Created new private key with a public key of: "EOS8PEJ5FM42xLpHK...X6PymQu97KrGDJQY5Y"
```

### Step 5: 导入开发密钥

每个新的EOSIO链都有一个名为“EOSIO”的默认“系统”用户。该账户用于通过加载规定EOSIO链治理和共识的系统合同来设置链。每个新的EOSIO链都有一个开发密钥，**这个密钥是相同的**。加载此密钥以代表系统用户（eosio）签署交易

```sh
cleos wallet import
```

系统会提示您输入私钥，输入下面提供的 EOSIO 开发密钥

```sh
5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
```

**Important**

永远不要将开发密钥用于生产帐户！这样做肯定会导致无法访问您的帐户，因为该私钥是公开的。

## 启动节点和钱包

### Step 1: 启动 keosd

To start keosd:

```sh
keosd &
```

You should see some output that looks like this:

```sh
info  2018-11-26T06:54:24.789 thread-0  wallet_plugin.cpp:42          plugin_initialize    ] initializing wallet plugin
info  2018-11-26T06:54:24.795 thread-0  http_plugin.cpp:554           add_handler          ] add api url: /v1/keosd/stop
info  2018-11-26T06:54:24.796 thread-0  wallet_api_plugin.cpp:73      plugin_startup       ] starting wallet_api_plugin
info  2018-11-26T06:54:24.796 thread-0  http_plugin.cpp:554           add_handler          ] add api url: /v1/wallet/create
info  2018-11-26T06:54:24.796 thread-0  http_plugin.cpp:554           add_handler          ] add api url: /v1/wallet/create_key
info  2018-11-26T06:54:24.796 thread-0  http_plugin.cpp:554           add_handler          ] add api url: /v1/wallet/get_public_keys
```

**Troubleshooting 故障排除**

```sh
"3120000 wallet_exception: Wallet exception Failed to lock access to wallet directory; is another keosd running?"
```

这是因为keosd进程的另一个实例可能正在后台运行。通过**pkill keosd**杀死所有实例，然后重新运行keosd&。

### Step 2: 启动节点

Start nodeos now:

```sh
nodeos -e -p eosio \
--plugin eosio::producer_plugin \
--plugin eosio::producer_api_plugin \
--plugin eosio::chain_api_plugin \
--plugin eosio::http_plugin \
--plugin eosio::history_plugin \
--plugin eosio::history_api_plugin \
--filter-on="*" \
--access-control-allow-origin='*' \
--contracts-console \
--http-validate-host=false \
--verbose-http-errors >> nodeos.log 2>&1 &
```

```sh
nodeos -e -p eosio \
--plugin eosio::producer_plugin \
--plugin eosio::producer_api_plugin \
--plugin eosio::chain_api_plugin \
--plugin eosio::http_plugin \
--plugin eosio::history_plugin \
--plugin eosio::history_api_plugin \
--filter-on="*" \
--access-control-allow-origin='*' \
--contracts-console \
--http-validate-host=false \
--verbose-http-errors \
--http-server-address=ip:port >> nodeos.log 2>&1 &
```

- 运行Nodeos。该命令加载所有基本插件，设置服务器地址，启用CORS，并添加一些合约调试和日志记录。

- 启用无限制的CORS（*）和开发日志

在上述配置中，CORS仅为*启用，仅用于开发目的，不应在可公开访问的节点上为*启用CORS！

**故障排除**

启动nodeos后，如果您看到类似于“数据库脏标志设置（可能是由于未清理关机）：需要重播”的错误消息，请尝试使用--replay区块链启动nodeos。有关nodeos故障排除的更多详细信息，请参阅此处。

### Step 3: 验证节点

检查nodeos是否正在生成块

```sh
tail -f nodeos.log
```

您应该在控制台中看到一些如下所示的输出:

```sh
1929001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366974ce4e2a... #13929 @ 2018-05-23T16:32:09.000 signed by eosio [trxs: 0, lib: 13928, confirmed: 0]
1929502ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366aea085023... #13930 @ 2018-05-23T16:32:09.500 signed by eosio [trxs: 0, lib: 13929, confirmed: 0]
1930002ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366b7f074fdd... #13931 @ 2018-05-23T16:32:10.000 signed by eosio [trxs: 0, lib: 13930, confirmed: 0]
1930501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366cd8222adb... #13932 @ 2018-05-23T16:32:10.500 signed by eosio [trxs: 0, lib: 13931, confirmed: 0]
1931002ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366d5c1ec38d... #13933 @ 2018-05-23T16:32:11.000 signed by eosio [trxs: 0, lib: 13932, confirmed: 0]
1931501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366e45c1f235... #13934 @ 2018-05-23T16:32:11.500 signed by eosio [trxs: 0, lib: 13933, confirmed: 0]
1932001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366f98adb324... #13935 @ 2018-05-23T16:32:12.000 signed by eosio [trxs: 0, lib: 13934, confirmed: 0]
1932501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 00003670a0f01daa... #13936 @ 2018-05-23T16:32:12.500 signed by eosio [trxs: 0, lib: 13935, confirmed: 0]
1933001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 00003671e8b36e1e... #13937 @ 2018-05-23T16:32:13.000 signed by eosio [trxs: 0, lib: 13936, confirmed: 0]
1933501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000367257fe1623... #13938 @ 2018-05-23T16:32:13.500 signed by eosio [trxs: 0, lib: 13937, confirmed: 0]
```

### Step 4: 检查节点端口

将以下地址复制并粘贴到浏览器地址栏中

```sh
curl http://localhost:8888/v1/chain/get_info
```

![An image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/G1wvqr35N57eOako/img/317f1408-be27-4020-b504-f7f6b2d7564d.png)

### Step 5: 停止节点

```sh
pkill -SIGTERM nodeos
```

## 创建开发账户

账户是授权的集合；账户存储在区块链上；帐户标识个人用户。一些账户识别智能合约；将智能合约部署到帐户；一个帐户只能有一个智能合约。

EOSIO帐户具有灵活的授权结构，可根据权限配置方式由个人或个人组（multisig）控制。向区块链发送或接收有效交易需要账户

### 创建测试用户

```sh
cleos create account eosio zhangp EOS526BMeJQKPB2x7hEwFdfrE88bzu8o6Bhfs7S2kCgNERHKyVa9X
```

![An image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/G1wvqr35N57eOako/img/9a1e7d5b-360a-4e34-8885-d6510e76754e.png)

### Public Key

注意：在cleos命令中，公钥与帐户zhangp关联。每个EOSIO帐户都与一个公钥关联。

帐户名称是所有权的唯一标识符。您可以更改公钥，但不会更改EOSIO帐户的所有权。

使用cleos get account 检查与zhangp关联的公钥

```sh
cleos get account zhangp
```

实际上zhangp拥有所有者和活动公钥。EOSIO具有独特的授权结构，为您的帐户增加了安全性。您可以通过将所有者密钥存储在冷钱包中，同时使用与您的活动权限相关联的密钥，最大限度地减少帐户的暴露。这样，如果您的活动密钥被泄露，您可以使用所有者密钥重新控制您的帐户。

在授权方面，如果您拥有所有者权限，则可以更改活动权限的私钥。但你不能反过来做。

## Hello World 合约

您可以在区块链上部署和执行智能合约。每个交易的记录都不可变地存储在区块链上，智能合约存储并更新区块链上的状态。区块链应用程序由调用智能合约动作的客户端代码组成。智能合约动作在区块链上执行。

让我们从一个简单的智能合约开始，它生成传统的Hello World。

本教程介绍了以下关键概念：

- [EOSIO合约开发工具包](https://developers.eos.io/manuals/eosio.cdt/latest/index): 用于构建智能合约的工具链和库

- [Webassembly](https://developers.eos.io/welcome/latest/glossary/index#webassembly) (WASM): 用于执行可移植二进制代码格式的虚拟机，托管在nodeos中

- [应用程序二进制接口](https://developers.eos.io/manuals/eosio.cdt/latest/best-practices/abi/understanding-abi-files) (ABI): 定义如何将数据封送至webassembly虚拟机或从WebAssembry虚拟机封送数据的接口

- [智能合约](https://developers.eos.io/welcome/latest/glossary/index/#smart-contract): 定义可在区块链上执行的动作和交易的代码

### EOS合约开发工具

使用C++编程语言创建EOSIO智能合约。EOSIO合同开发工具包或EOSIO。CDT提供构建智能合约所需的库和工具。见EOSIO。有关如何开始使用EOSIO.CDT的更多详细信息，请参阅CDT手册。

要将智能合约部署到区块链，首先使用eosio cpp工具编译智能合约。编译构建了一个webassembly文件和相应的应用程序二进制接口（ABI）文件。

webassembly或.wasm文件是区块链中WebAssemblyEngine执行的二进制代码。webassembly引擎或wasm引擎托管在nodeos守护进程中，并执行智能合约代码。应用程序二进制接口或.abi文件定义了如何将数据封送至wasm引擎和从wasm引擎封送数据。

### 创建智能合约

按照以下步骤创建Hello World智能合约。通常，您创建两个文件 头文件 或 .hpp文件，其中包含智能合约类的声明；和.cpp文件，其包含智能合约操作的实现。在这个简单的示例中，您只使用了一个.cpp文件。

#### 创建 hello.cpp

创建一个名为 hello 的新目录来存储您的智能合约文件:

```sh
mkdir hello

cd hello

touch hello.cpp
```

#### 编写智能合约代码:

按照这四个步骤，将此代码添加到hello.cpp文件。

使用include指令导入eosio基本库。添加以下行：

```sh
#include <eosio/eosio.hpp>
```

The eosio.hpp contains classes required to write a smart contract, including eosio::contract. Create a standard C++11 class and inherit from the eosio::contract class. Use the [[eosio::contract]] attribute to inform the EOSIO.CDT compiler this is a smart contract.

Add the line:

```sh
class [[eosio::contract]] hello : public eosio::contract {};
```

The EOSIO.CDT compiler automatically generates the main dispatcher and the ABI file. The dispatcher routes action calls to the correct smart contract action. The compiler will create one when using the eosio::contract attribute. Advanced programmers can customize this behaviour by defining their own dispatcher.

Add a public access specifier and a using-declaration to introduce base class members from eosio::contract. You can now use the default base class constructor.

Add these lines:

```sh
public:
	using eosio::contract::contract;
```

Add a hi public action. This action accepts an eosio::name parameter, and prints Hello concatenated with the eosio::name parameter.

Add these lines:

```sh
[[eosio::action]] void hi( eosio::name user ) {
		print( "Hello, ", user);
	}
```

The [[eosio::action]] attribute lets the compiler know this is an action.

The hello.cpp file should now look like this:

```sh
#include <eosio/eosio.hpp>
class [[eosio::contract]] hello : public eosio::contract {
  public:
      using eosio::contract::contract;
      [[eosio::action]] void hi( eosio::name user ) {
         print( "Hello, ", user);
      }
};
```

eosio::print is included by eosio/eosio.hpp. The smart contract uses this function to print Hello and concatenate the string Hello with the passed in user.

### 编译和部署

智能合约已成功创建，请按照本节编译并将智能合约部署到区块链。使用EOSIO。CDT eosio cpp命令来构建.wasm文件和相应的.abi文件。

使用eosio cpp命令编译hello。cpp文件。在与hello相同的文件夹中运行eosio cpp命令。cpp文件（或引用具有绝对或相对路径的文件）

```sh
eosio-cpp -abigen -o hello.wasm hello.cpp
```

编译后生成两个新文件，hello.wasm和hello.abi

将编译好的 hello.wasm 和 hello.abi 文件部署到区块链上的 hello 帐户。

```sh
cleos set contract hello ./hello -p hello@active
taketo@ubantu:~/contracts$ cleos create account eosio hello EOS5EPi1jAsyHZ128ysEtALWvozzjhoK1aHbMe7MTRrpSdtam9DGq
executed transaction: e38514d87c9fd5e6973f519d370946172472791866da01922f8e66a9c45343a3  200 bytes  158 us
#         eosio <= eosio::newaccount            {"creator":"eosio","name":"hello","owner":{"threshold":1,"keys":[{"key":"EOS5EPi1jAsyHZ128ysEtALWvoz...
warning: transaction executed locally, but may not be confirmed by the network yet         ] 

taketo@ubantu:~/contracts$ cleos set contract hello ./hello -p hello@active
Reading WASM from /home/taketo/contracts/hello/hello.wasm...
Publishing contract...
executed transaction: bd55d2524a2396997a1c3124f71188c1815340e65bb34ffe92db1f87a40bdaa6  14360 bytes  29874 us
#         eosio <= eosio::setcode               {"account":"hello","vmtype":0,"vmversion":0,"code":"0061736d0100000001d4012260000060037f7f7f017f6003...
#         eosio <= eosio::setabi                {"account":"hello","abi":"0e656f73696f3a3a6162692f312e32000102686900010475736572046e616d650100000000...
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

#### 调用智能合约操作

一旦智能合约成功部署，请按照本节将智能合约动作推送到区块链并测试 hi 方法。

使用cleos工具发送交易:

```sh
cleos push action hello hi '["zhangp"]' -p zhangp@active
```

控制台显示:

```sh
taketo@ubantu:~/contracts$ cleos push action hello hi '["zhangp"]' -p zhangp@active
executed transaction: efc91a7b6d6311956796ea1c6ad7e94728c622d3a263c41d4d6571f9b0a33a53  104 bytes  317 us
#         hello <= hello::hi                    {"user":"zhangp"}
>> Hello, zhangp
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

合同允许任何帐户调用 hi 操作，使用其他帐户推送操作：

```sh
cleos push action hello hi '["fanfan"]' -p fanfan@active
```

This should produce:

```sh
taketo@ubantu:~/contracts$ cleos push action hello hi '["fanfan"]' -p fanfan@active
executed transaction: b8b36087fb29a61cf46f952ebed38205b7464fa9ac4bd5f9d02335a73694c0b5  104 bytes  183 us
#         hello <= hello::hi                    {"user":"fanfan"}
>> Hello, fanfan
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

此版本的 hello world 智能合约是一个简单的示例，hi 操作可以由任何用户调用，如果要提高智能合约安全性，应该添加授权操作，这会强制智能合约检查调用操作的帐户。

### Authorization 授权

EOSIO区块链使用非对称加密技术来验证推送交易的帐户是否已使用匹配的私钥签署了交易，EOSIO区块链使用帐户权限表来检查帐户是否具有执行操作所需的权限。使用授权是保护智能合约的第一步。

将require_auth添加到智能合约中，require-auth函数检查授权，并确保name参数与执行和授权操作的用户匹配。

#### 增加授权

Update the "hi" action in the hello.cpp to use require_auth:

```sh
void hi( name user ) {
   require_auth( user );
   print( "Hello, ", name{user} );
}
```

重新编译合约:

```sh
eosio-cpp -abigen -o hello.wasm hello.cpp
```

将更新后的智能合约重新部署到区块链:

```sh
cleos set contract hello ./hello -p hello@active
```

再次调用该操作，但这次授权不匹配，此命令告诉该操作 fanfan 正在打招呼，而 alice 正在签署交易

使用zhangp去和fanfan打招呼

```sh
cleos push action hello hi '["fanfan"]' -p zhangp@active
```

require_auth 会中断交易并显示:

```sh
Error 3090004: Missing required authority
Ensure that you have the related authority inside your transaction!;
If you are currently using 'cleos push action' command, try to add the relevant authority using -p option.
Error Details:
missing authority of fanfan
pending console output: 
```

合同现在验证提供的用户名是否与授权用户相同。

```sh
cleos push action hello hi '["zhangp"]' -p zhangp@active
```

现在应该在控制台显示:

```sh
taketo@ubantu:~/contracts$ cleos push action hello hi '["zhangp"]' -p zhangp@active
executed transaction: 9578ffe85e45051e004fe861615d646618acfff5f65e5a2fca831715b937b4cd  104 bytes  158 us
#         hello <= hello::hi                    {"user":"zhangp"}
>> Hello, zhangp
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

在检查调用该操作的帐户具有与传递给该操作的用户名相同的授权帐户后，该操作应成功执行。