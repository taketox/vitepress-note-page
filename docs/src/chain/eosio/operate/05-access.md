# 账户体系

## EOS 账户

EOS 账户，顾名思义就是你在EOS网络中的身份ID，类似于你在银行系统中的银行卡号，微信号或者支付宝账号等。

**EOS 账户模型与比特币、以太坊的区别**

了解数字货币或者说比特币、以太坊的小伙伴们应该都清楚，比特币和以太坊并没有所谓账户概念，而是以地址的形式呈现在大众面前：

比特币地址：1Ffiii1cGYRiq5JTJRA4N3jDQDZjaQzuBx

以太坊地址：0x7950461b4336a1f00b5151599635d3f58eb3c9f66a03b2c7b62d707762533c74*

EOS账户：betdicelucky

**传统系统中账户**

账户是一个中心化的概念，诸如上面所说：银行系统中的银行卡号，微信号或者支付宝账号等，这些都是典型的账户概念，因为用户的账户数据是保存在各个系统的中心化服务器里的，在这些形形色色账户的世界里用户对自身账户是没有支配权的，因为一旦这些系统发生故障或者被人为冻结，那么用户能做的其实只有逆来顺受。

**区块链系统账户**

以太坊和比特币没有账户的概念，每个进入数字货币的人都会获得一对密钥：公钥和私钥，公钥类似于账户，私钥类似账户密码，私钥对公钥有至高无上的控制权，除了私钥之外任何人都没有权利对保存于公钥（账号）的资产进行冻结、盗用或者转移的操作。

### EOS账户特点

在EOS的账户模型里，有公钥、私钥和账户的概念，也就是账户和公钥地址是解耦的，而以太坊没有所谓账号的概念，因为地址即账号。

EOS 账号<--公钥地址<--私钥

以太坊地址<--私钥

#### EOS 账号人类可读

我们仍然以以太坊来做对比，当我们创建以太坊地址时，是不支持用户自定义的，系统会随机给你分配一对秘钥，而且这对秘钥对用户非常不友好，诚如上面看到的它是一串16进制的64位字符串，这样的账户名既不容易记忆也不利于核对，如果让你每天使用这样的账户名做登录、转账操作会不会觉得很崩溃？也许这是数字货币还没能广泛进入大众视野的部分原因吧。

EOS和以太坊 的公钥和私钥都是通过一系列数学加密算法（哈希）计算得到的，最终呈现出来的都是一串难以记忆的字符，那么如果想要账户通俗易懂且能自定义，就必须把账户和地址解耦，也就是在地址之上套上一层马甲，把难记的地址隐藏起来而把容易记忆的账户开放出来。通过地址与账号的映射关系还可以实现账户的自定义，这样就可以极大的方便用户使用，**为EOS进入大众提供了可能。**

#### 账号与地址解耦

我们知道，被解耦的东西就意味着可以分拆，比如很久以前诺基亚手机的充电线是一体的（插头和线是不可分割的），但是现在的手机的充电线是解耦的，也就是说插头和线是可以分开的。插头和线的解耦使得我们可以保留插头只更换线，同样的EOS账号和地址的解耦意味着可以保留账号更换地址。

**这使得账号的转移成为可能**

如果有人跟我说，他可以把他的以太坊账号/地址卖给我，我一定会觉得这人要么根本不懂以太坊，要么他就是想骗我钱。

因为即使你把公钥地址对应的私钥卖给我，你也不能保证你会彻底销毁私钥，所以所谓出售以太坊私钥简直天方夜谭。

**EOS是怎么实现转移的呢**

EOS账户有 Active 公钥地址和Owner 公钥地址，EOS的账户就是被这两种地址所控制的：

Active 公钥地址：管理员地址，它具有对账户的转账、投票等操作权限

Owner 公钥地址：拥有者地址，即有账户，可以管理Active 公钥地址，对其进行修改操作。

通过对Active 公钥地址和Owner 公钥地址的修改，可以做到：

1. 当我需要把账号托管给其他人进行管理时（例如：老婆要接管你的财政大权），就可以把Active 地址更换为老婆的地址
2. 当我需要把账号出售给其他人进行管理时（例如：账号交易），就可以把Active和Owner 地址更换为买方的地址

#### 支持域的概念

EOS的账户支持域的概念，也就意味着 **com** 这个账户的持有者，是唯一能够创建 baidu.com 、alibaba.com 等账号用户

## EOS 账户权限

### EOS 账户权限的目标

EOS技术白皮书对权限目标的定义

> **Permission Mapping**
>
> EOS.IO software allows each account to define a mapping between a Named Message Handler Group of any account and their own Named Permission Level. For example, an account holder could map the account holder's social media application to the account holder's "Friend" permission group. With this mapping, any friend could post as the account holder on the account holder's social media. Even though they would post as the account holder, they would still use their own keys to sign the message. This means it is always possible to identify which friends used the account and in what way.

白皮书这段话明确了 EOS.IO  允许账户所有者可以让度部分权限给他人，同时权限接受者需要使用自身的私钥对账户的相关操作进行签名，以便明确区分操作行为是由谁授权的。

既然账户是通过让度部分权限给他人进行使用，那么这部分权限就应该是可以定义的并且是有多种类型的

> 解释：这就好比银行金库，通常会有**管理员**权限，这个权限授权给某人以后，他就可以自由进出金库甚至动用黄金。

### EOS 账户权限类型

EOS账户权限可以分为**预置权限**和**自定义权限**

**预置权限** 是每个账户在创建时默认都具备的，分别为**Owner**和**Active**权限

- **Owner权限：**可以理解为拥有者权限，代表账户的所有权，是账户的最高权限，可以修改其它权限。只有少数操作需要这种权限。一般建议，所有者冷存储（离线保存），不与任何人共享。
- **Active权限：**可以理解为管理者权限，一般业务都是由Active权限来完成，例如转账、投票、进行其他高级账户更改等操作。

**自定义权限**

预置权限对账户可以进行的操作进行了一般性定义，如果用户想要更加个性化和自由的权限控制（例如：增加访问者权限等）就需要使用：自定义权限，它可以进一步扩展帐户管理的灵活性。

**思考**

说到这里，我们就需要继续思考：**假如我具备了金库的管理者权限，那么万一我监守自盗怎么办？**因为在上述权限模型下，只要我具备了管理员权限就没有人能够对我进行限制。

如何解决？

很简单，大家很快会想到，只要在金库大门上多上几把锁就好了并将钥匙分配给不同的管理员，只有当所有钥匙都开门时，才可以打开金库大门，那么任何一个管理员在金库进行任何操作都会被其他管理员知道，这样可以大大降低风险

同样的，EOS为了解决这个问题，EOS账户权限引入了权重和阈值的概念

**EOS的权重和阈值**

**权重（weight）**

权限拥有者在整个权限中的相对重要程度

**阈值（threshold）**

能够成功执行事务所需要的最低权重值

>只有当权重值大于等于阈值时,才能正常使用权限

### EOS 账户权限操作

#### 为权限设置新的密钥

```sh
cleos set account permission ${account} ${permission} ${authority} ${parent}
```

- account: 设置/删除权限的帐户
- permission: 设置/删除权限的权限名称
- authority: [delete] NULL、[create/update] 公钥、JSON字符串或定义权限的文件名
- parent: [create]此权限的父权限名（默认为“Active”)

示例:

```sh
cleos set account permission test1 active EOS8CVfjatAAfG6e35adx9BzuFNcLHDanZcGAifGhC2ZgtqbgrxS2 owner -p test1@owner
```

#### 将帐户设置为权限

```sh
cleos set account permission ${account} ${permission} ${authority} ${parent}
```

- account: 设置/删除权限的帐户
- permission: 设置/删除权限的权限名称
- authority: [delete] NULL、[create/update] 公钥、JSON字符串或定义权限的文件名
- parent: [create]此权限的父权限名（默认为“Active”)

示例:

```sh
cleos set account permission test1 active '{"threshold": 1, "keys":[],"accounts":[{"permission":{"actor":"test2","permission":"active","weight":1}}]}' -p test1@owner
```

#### 设置权限的权重和阈值

```sh
cleos set account permission ${account} ${permission} ${authority} ${parent}
```

- account: 设置/删除权限的帐户
- permission: 设置/删除权限的权限名称
- authority: [delete] NULL、[create/update] 公钥、JSON字符串或定义权限的文件名
- parent: [create]此权限的父权限名（默认为“Active”)

```json
authority:
{
  "threshold"       : 100,    /*An integer that defines cumulative signature weight required for authorization*/
  "keys"            : [],     /*An array made up of individual permissions defined with an EOSIO-style PUBLIC KEY*/
  "accounts"        : []      /*An array made up of individual permissions defined with an EOSIO-style ACCOUNT*/
}
```

示例

```sh
cleos set account permission testaccount active '{"threshold" : 100, "keys" : [], "accounts" : [{"permission":{"actor":"user1","permission":"active"},"weight":25}, {"permission":{"actor":"user2","permission":"active"},"weight":75}]}' owner -p testaccount@owner
```

### EOS账户权限操作示例

```sh
# 创建三个钱包
wallet: default
[[
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",	# eosio
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
  ],[
    "EOS7fnCqZS9qFacU6sxyKwshx6oToFHXBdNWgVfekfQws9egQMKmb",	# did
    "5J9ZACSxKpPs7Rc1h3UdtE7EVqbPFJTsLPdgtULM8isx5iHfCAa"
  ],[
    "EOS7hhsMhr5BgPrMSempWw6nDAxuMfDPTKXxCeKcrLg22SyRPzLtj",	# test1
    "5KThbcxbfae7kXLypsv1nphgcATweLCDuAQgrsL9GWgv7GAzFQF"
  ],[
    "EOS8CVfjatAAfG6e35adx9BzuFNcLHDanZcGAifGhC2ZgtqbgrxS2",	# test2
    "5KWtawAaCFQJC3iNfbKpCoi4LkWWBuaYeDtciasASyvKKu2EzQj"
  ]
]

wallet: test1
[[
    "EOS7hhsMhr5BgPrMSempWw6nDAxuMfDPTKXxCeKcrLg22SyRPzLtj",	# test1
    "5KThbcxbfae7kXLypsv1nphgcATweLCDuAQgrsL9GWgv7GAzFQF"
  ]
]

wallet: test2
[[
    "EOS8CVfjatAAfG6e35adx9BzuFNcLHDanZcGAifGhC2ZgtqbgrxS2",	# test2
    "5KWtawAaCFQJC3iNfbKpCoi4LkWWBuaYeDtciasASyvKKu2EzQj"
  ]
]

# 创建用户did
cleos create account eosio did EOS7fnCqZS9qFacU6sxyKwshx6oToFHXBdNWgVfekfQws9egQMKmb
# 创建用户test1
cleos create account eosio test1 EOS7hhsMhr5BgPrMSempWw6nDAxuMfDPTKXxCeKcrLg22SyRPzLtj
# 创建用户test2
cleos create account eosio test2 EOS8CVfjatAAfG6e35adx9BzuFNcLHDanZcGAifGhC2ZgtqbgrxS2
# 部署did合约
cleos set contract did contracts/did/

1.在did账户下创建名为invoke的自定义权限，权限授权给test1账户的active权限
cleos set account permission did invoke '{"threshold": 1, "keys":[],"accounts":[{"permission":{"actor":"test1","permission":"active","weight":1}}]}' -p did@active

2.给予自定义权限invoke调用did合约中createdid方法的权限
cleos set action permission did did createdid invoke -p did@active

3.关闭default钱包,打开test1钱包,通过invoke权限调用createdid方法
cleos push action did createdid ['d1','didinfo1'] -p did@invoke
# 成功
注：因为第一条命令将invoke权限授权给test账户的active权限。所以此处只需要拥有test@active的权限即可调用did合约。

4.删除自定义权限invoke调用did合约中createdid方法的权限
cleos set action permission did did createdid NULL -p did@active

5.通过invoke权限调用createdid方法
cleos push action did createdid ['d1','didinfo1'] -p did@invoke
# 失败：
Error 3090005: Irrelevant authority included
Please remove the unnecessary authority from your action!
```

## EOS 账户权限应用

### 多重签名

我们知道中心化交易所最大的风险并不在于外部攻击，而在于交易所本身，曾经世界上最大的比特币交易所 Mt.Gox 宣布被盗并破产，但业内人士的普遍看法是Mt.Gox  “监守自盗” 。对于避免这种做法，最有效措施就是将资产控制权限进行分散，也即：对账户资产转移权限进行多重签名，并由多个可信方掌握私钥，这样可以极大的避免此类情况的发生。

### 账号交易

EOS 账户与地址解耦，这使得 EOS 账户靓号转移成为可能，对于EOS账户所有权转移而言仅需要将Owner权限进行变更即可。

EOS 账户交易目前在EOS生态已然兴起，如果EOS生态能够进一步壮大并扩展到更大的人群，那么EOS 靓号会不会像手机靓号、QQ靓号、网站域名一样备受追捧呢，我们拭目以待。

### 合约去中心化

主要围绕两点

1. EOS 合约支持更新

2. EOS 合约账户与普通账户相同，可以被私钥控制

以上两个问题，直接导致了EOS智能合约的去中心化沦为笑柄. 那么，EOS的设计机制里面有什么方式可以避免这两个问题呢？

当然，是可以的

我们回到上述两个问题：

第一，EOS合约支持更新的根本原因是因为：EOS智能合约是通过在EOS账户上部署合约代码并通过私钥签名完成的，也就是说合约私钥被账户所有者控制，导致智能合约的中心化问题发生

第二，EOS 合约账户与普通账户相同，可以被私钥控制。从这段描述内容，我们可以发现，第二个问题其实与第一个问题本质上可以被归为同一个问题

即：EOS合约账户的控制权的中心化导致了EOS合约的中心化问题

**如果把EOS合约的控制权去中心化，就可以解决问题**

我们先来回顾下以太坊是怎么做到合约控制权的去中心化的

1. 合约地址与外部地址不共用，在部署合约时按既定规则自动生成

2. 合约地址没有私钥，只由代码控制

第一点，决定了以太坊的合约地址不属于任何人

第二点，决定了以太坊合约的完全去中心化特性

那么，EOS 合约如何做到将控制权去中心化呢？

所谓去中心化，就是将决定权交给多方共同决定，那么EOS合约的去中心化自然很容易想到，将合约账户的控制权交由多方共同决定

即：**合约部署的多重签名制**

多重签名制部署合约，可以有效降低合约的中心化问题

> PS:正如以太坊和EOS的共识机制一样，EOS的DPOS机制就可以看做一个多重签名的机制，这种机制可以提高效率，但是仍然存在中心化的风险，因为多重签名方存在协同作恶的可能，但是这不失为一种妥协方式。

如果要做到类似以太坊的完全去中心化，该如何办？

也简单，当然是完全放弃控制权，但是这话说起来容易，却要怎么实现？

> 比如以太坊，我拥有一个以太坊地址和私钥，我跟别人说我要放弃我的地址的控制权，把私钥给别人，别人也根本会信我，因为我可以备份一个私钥，私底下仍然控制这个地址。

在EOS 账户模型中，**账户和地址是解耦的**，**账户可以被多个Active地址控制**，这就为实现EOS账户控制权的去中心化奠定了基础。

地址对账户的控制是与权重和阈值息息相关的，权重代表行使EOS账户权力时所具有的分量，阈值代表账户被执行相关操作时需要的最低权重值。

<table>
	<tr>
	    <th colspan="4">EOS账户</th>
	</tr>
	<tr>
	    <td>权限</td>
	    <td>公钥</td>
	    <td>权重</td>
        <td>阈值</td>  
	</tr>
	<tr>
	    <td rowspan="2">owner</td>
	    <td>@老公</td>
        <td>1</td>
        <td rowspan="2">1</td>
	</tr>
	<tr>
        <td>@老婆</td>
        <td>1</td>
	</tr>
	<tr>
	    <td rowspan="3">active</td>
	    <td>@老公</td>
        <td>1</td>
        <td rowspan="3">2</td>
	</tr>
	<tr>
	    <td>@老婆</td>
        <td>1</td>
	</tr>
	<tr>
	    <td>@小三</td>
        <td>1</td>
	</tr>
</table>

> 例如：@老公 想要部署一个合约，需要获得Active授权，由于Active的阈值为2，所以@老公 必须同时获得 @老婆 或者 @小三 的授权，才能执行部署合约的操作
>
> 通过这种方式，可以有效提升 @老公 的作恶成本，提升合约的安全性

**所以EOS合约开发者，可以通过将合约账户的Active权限开放给多个受信账户，可以有效提升EOS合约的可信程度，降低用户信任风险。**

但，这种方式并不能完全消除用户的顾虑

最可信的方式，应该是类似于以太坊将控制权完全剔除，即：**做到合约不可更新**

如何实现呢？

将账户私钥去除这种操作，受人的主观意识控制，并不可信。有没有一种方式可以实现私钥的完全失效？

此时，我们可以使用 Owner 权限

如果EOS合约开发者可以将合约账户的 Owner 权限移交给一个未知私钥的账户地址，就可以实现合约永不可更新，也就是实现完全可信。

> 我们知道，在以太坊合约里，有一个地址：0x0000000000000000000000000000000000000000，这个地址没有私钥，可以用于销毁ETH

EOS 也有这样一种公钥：EOS1111111111111111111111111111111114T1Anm，这个公钥的私钥没有任何人知道

所以，开发者如果为了自证清白，可以将合约账户的owner权限转移给这个公钥，这样就没有任何人可以更新合约账户代码或者卷钱跑路了。

但是，这样也会有人问，如果合约代码出了bug如何处理？这就考验合约开发者的代码功力了。

### 总结

为了实现EOS合约的去中心化，我们有两种方式

1. 将合约账户的Active权限授权给多方，合约的更新由多方共同签名后发起。但是这种方式仍然存在一定的协同作恶风险

2. 将合约账户的Owner权限转移给未知私钥的公钥，这样可以实现合约的完全信任。但是这种方式存在一定的代码漏洞风险并无法修复。
