# 合约标准

## 合约标准

我们知道，动物是生物的一个种类，在动物的大范围下又分人类、猫类、鱼类等。

类似地，以太坊智能合约也是一个对合约的统称，在此合约下，又有特别针对一类合约的标准，例如标准的代币合约标准：ERC20代币标准、ERC721标准等。

这里主要介绍两种广泛使用且代表性比较强的合约标准：ERC20与ERC721。

### ERC20标准

ERC的全称是`Ethereum Request for Comments`，中文含义为`以太坊征询意见`。后缀添加的数字（例如20、223等）是版本号。

[ERC20标准的官方解析](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md)

ERC20标准的诞生起因于以太坊的应用本质，由于以太坊目前几乎都是被应用于虚拟货币中，包括以太坊本身也有代表它自己的虚拟货币：ETH。因此，几乎所有使用以太坊智能合约在以太坊上部署的合约都是代表虚拟货币的智能合约。

作为货币，它自然有货币的属性，例如货币名称、货币发行量及货币的唯一标识等。为什么名称不是唯一标识？这是因为以太坊限定了进行唯一标识的只有哈希值，所以虚拟货币的名称是允许重复的，比如两份不同的ERC20标准合约，它们代码中的name或symbol变量都可设置为ETH2。货币除拥有上面的属性外，还必须允许用户查询余额和转账，这些都是货币所拥有的基本特点。

对于代表虚拟货币的智能合约来说，为方便虚拟货币的发布，催生了ERC20标准，该标准现在已经被专门用来发布虚拟货币，标准中包括了成员变量、函数和事件等，以方便开发者调用。

ERC20标准是一种软性强制的标准，因而并不是发布虚拟货币都必须遵照这个标准，这标准里面的一些属性和函数，开发者可以遵循也可以自己创新。但是，请注意，目前很多的以太坊钱包软件在设定进行代币转账时，默认使用ERC20标准的函数名称和传参类型。所以，如果你的代币不遵循该标准发行，就有可能导致钱包软件转账失败。

下面我们根据官方文档对ERC20标准的成员变量、函数和事件进行讲解。

#### 标准的成员变量

ERC20标准规定了智能合约在使用Solidity语言编程时可以通过下述形式来定义成员变量：

- string public name;
- string public symbol;
- uint8 public decimals;
- uint256 public totalSupply;

说明：

string用来定义name和symbol为字符串类型的变量，uint8表示decimals是8位(bit)的无符号整型数字，uint256定义变量totalSupply是256位(bit)的无符号整型数字。无符号的整型数字可取的正数范围变大了，其最小值是0，但不能取负数。

name一般表示当前代币的名称，例如My First Token。

symbol表示当前代币的符号，代表的是一种简称，例如可以取name的3个首字母来设置，My First Token的3个首字母是MFT。

对于symbol，请注意以下两点：

我们一般口头上说一个代币的时候，说的都是symbol符号。例如，LRC就是一个symbol符号。

symbol不能唯一标识一个代币。symbol是可以重复的，只有代币的合约地址才能唯一标识代币，所以不要以symbol来唯一标识一个代币。

一般来说，name和symbol都可以任意设置，也可以设置为同一个字符串，但要正规地表示一个代币，还是要进行妥善设置，因为这些合约的代码都能在`区块链浏览器`被搜索并且浏览的。

decimals表示将代币单位精确到小数点后多少位，比如总量初始化为1000，decimals为1(即代币单位精确到小数点后1位，也就是0.1)，则实际是100个代币(100X10=1000，即有1000个0.1)，此时如果你要从钱包软件中向别人发送1个代币，在钱包里不能写1，而是要写10，因为写1表示发送0.1个代币（因为精确到0.1），通过交易可以查看到实际发送的就是0.1，所以如果你要发行1000个代币，那么在智能合约中的初始设置应该是total=1000X10 decimals(即要乘上10的decimals次方)。

发行的数量需要相对代币小数点后的位数来设置。例如，如果精确到小数点后的位数是0，而你要发行1000个代币，那么发行数量的值是1000，因为代表单位精确到1。但是，如果代币单位精确到小数点后的位数是18位，你要发行1000个代币，那么发行数量的值就是1000000000000000000000(1000后面加上18个0)，因为代币单位精确到小数点后18位。

totalSupply代表当前代币的总发行量，留意到它对应的是uint256整型数字，即256位的无符号整型数字，而不是8位，就知道这个数字表示的范围是很大的。假设decimals是18，然后我们发行量是100亿个代币，那么此时totalSupply的真实数值是totalSupply=100X10 18次方。这个数字非常之大，一般整型会溢出，所以要按照标准的规则来定义好你的变量，以避免出现数据溢出的错误。

以上我们介绍了4个标准的成员变量，那么是不是一定要按照标准必须使用这4个变量呢？

不是的，请记住，智能合约中的代码可以不按照标准写，例如代币的名称，标准中要求使用name来表示，但是你想换个变量来表示，比如换成tokenName，那么需要在合约中编写特定的函数，以便合约调用者可以访问到这个tokenName变量。

#### 标准的函数

ERC20标准规定了智能合约须具备并实现下面的函数及事件(Event)：

```solidity
contract ERC20 {
    function totalSupply() constant returns (uint256 totalSupply);
    function balanceof(address _owner) constant returns (uint256 balance);
    function transfer(address _to,uint256 _value) returns (bool success);
    function transferFrom(address _from,address _to,uint256 _value) returns(bool success);
    function approve (address _spender,uint256 _value) returns (bool success);
    function allowance (address _owner,address _spender) constant returns(uint256 ret);
    event Transfer(address indexed _from,address indexed _to,uint256 _value);
    event Approval(address indexed _owner,address indexed _spender,uint256 _value);
}
```

以上ERC20标准中的各个函数都要求使用代码来实现，具体怎么实现，标准并不关心，只需要返回每个函数所规定的参数类型即可。例如，balanceOf函数的功能是查询钱包地址的代币余额，只要结果返回余额的值即可。

下面我们对上述标准中的各个函数分别进行说明。

totalSupply：返回代币发行量的函数

```solidity
function totalSupply() constant returns (uint256 totalSupply);
```

这个函数要求返回当前代币的总发行量，返回的值就是totalSupply的数值。

如果你不明确地在智能合约中写出返回totalSupply的函数，但是定义了totalSupply变量，那么EVM虚拟机在编译的时候会自动帮你加上返回totalSupply的函数。例如，下面的这个函数是在定义了totalSupply变量但没有明确写出totalSupply这个函数时EVM自动加上的。

```solidity
function totalSupply() constant returns (uint256 totalSupply){
    return 1000000000000000000000 // 己经自动乘上了decima1s的格式
}
```

balanceOf：返回代币余额的函数

```solidity
function balanceof(address owner) constant returns (uint256 balance);
```

balanceOf的作用是返回一个钱包地址所拥有当前代币的余额，供查询余额所用，只需要传入一个钱包地址，address类型代表的就是地址类型，最后返回的是代币的余额，其结果也是乘上了decimals后的数字格式。

transfer：转账函数

```solidity
function transfer(address _to,uint256 _value) returns (bool success);
```

transfer的作用，顾名思义就是转移，即用于转移代币的转账函数。

入参：接收代币的以太坊地址to，以及要转多少的数值value。

> 你可能想到了，为什么没有from？从哪个地址转出呢？答案是这个函数内部的实现一般都是把下面的两种地址角色作为默认的转账地址：
>
> 1. 当前调用这个转账函数的地址msg.sender，它是函数代码中的一个变量。
> 2. 合约创建时所设置的最初的收币地址。

关于上面的第二点，这里举例做一个说明。

假设钱包地址XXX是合约A此刻transfer的调用者，这时A的调用者msg.sender就是XXX，然后在智能合约代码里的transfer函数实现的时候要写明从地址YYY中转出，如下代码所示：

```solidity
function transfer(address _to,uint256 _value) returns (bool success){
    ....
    balanceof [ YYY ] -= value; //注意这行的YYY作为默认转出地址
    balanceof [ _to] += value;
    ...
}
```

转账相关的函数还有transferFrom，它和transfer一样，也用于实现转账的功能。

```solidity
function transferFrom(address _from,address _to,uint256 _value) returns(bool success);
```

不同的地方在于转账的形式：transferFrom是从某个钱包地址from向to转账，_from是传参进来的，这就意味着我们可以设置任何钱包地址为转出地址。这里要注意的是，使用这个转账函数的前提是必须获得授权。

approve：授权函数

```solidity
function approve (address _spender,uint256 _value) returns (bool success);
```

在使用transferFrom前要对传入transferFrom中的from地址进行它所在当前代币的授权值的判断，只有这个授权值满足了给定值才能使用transferFrom函数。

> 那么，为什么要授权呢？我们通过一个例子来了解一下原因，这和你委托你的一个朋友去帮你转账给另外一个人的情况是一样的。例如，A叫B帮A转账人民币100元给C，这个时候由于B只是一个帮忙转账的人，它是没有A的银行卡和密码的，只有在得到A的授权后才能操作，而且授权也是有一个数值的，例如100元。那么A就先向银行D授权自己的转账权限给B，允许B代替A转账给C共100元。

以上就是approve的授权流程，首先合约A的调用者msg.sender在合约A中授权给spender，允许spender能够代替自己转账value个数值的代币。此后，spender就能在合约A中调用transferFrom从from中转账value个代币给to，注意这时的from就是当初调用approve的msg.sender。为了加深理解approve和transferFrom，下面再提供一个流程图，如下图所示。

![An image](/img/chain/eth/41.png)

一般来说，transferFrom的内部实现都会对授权值进行判断，当然，你也可以不判断，但这就不是标准的做法了。如果做了判断，发现当前调用transferFrom的msg.sender还没有授权值，就会报错。这种错误统称为合约层的非编译时错误，只能通过查看智能合约代码来分析错误原因。下面是approve和transferFrom判断授权值的实现代码示例：

```solidity
function transferFrom(address from,address to,uint256 value) public returns (bool success) {
    uint256 allowance = allowed[_from] [msg.sender]; // 取出数值
    ... //进行数值判断，成功后额度数值减去转出部分等
    return true;
}
function approve (address spender,uint256 value)public returns (bool success){
    allowed[msg.sender] [_spender] = _value; // 进行授权值设置
    ...
    return true;
}
```

allowance：授权额度查看函数

```solidity
function allowance (address _owner,address _spender) constant returns(uint256 ret);
```

allowance所对应的是approve所授权的额度查询，它会返回owner地址到当前代币合约XX中，方便查询owner给spender授权了多少个XX代币的数值，也是我们在开发过程中经常使用的函数。

#### 标准的事件

事件是Solidity编程语言语法中的一类特性，其作用是当该事件的代码被EVM虚拟机调用触发时能够以消息方式响应调用者前端，类似于Java语言中的回调函数(callback)。

也就是说，我们可以自己在代码中定义想要的事件(Event)。在ERC20标准中，规定了在编写转账、授权函数代码时，必须在成功转账后触发转账事件。我们首先介绍转账的事件event。

```solidity
event Transfer(address indexed _from,address indexed _to,uint256 _value);
```

Transfer事件需要在transfer和transferFrom函数内触发。如果你留意这两个函数的返回值，就会发现返回的都是bool(布尔)类型。但是，请注意，在真实调用的时候，并不是直接通过RPC接口调用这两个函数，而是通过以太坊的交易接口来调用智能合约的转账函数。

在调用以太坊的交易接口时，以太坊会返回一个TxHash值，也就是交易的哈希凭据值。此时客户端也就是调用者还不能马上知道交易结果，之前的内容提到过，以太坊的交易需要矿工打包到区块中，所以需要等待交易被矿工打包到区块后才能得知最终的结果。

等待时间的长短是不确定的，在这种情况下就需要一个event(事件)来通知，待交易被矿工打包到区块后，EVM虚拟机会执行智能合约的转账函数，最后触发event(事件)，随后客户端就能在监听代码中处理最终的结果。下面是web3.js的一个例子。

```solidity
//实例化代币的智能合约对象
var contract = new web3.eth.Contract(TokenABI,TokenAddress);
//发起转账，txHash是能够马上被返回的
var txHash = contract.sendCoin.sendTransaction(To, 100, {from:From});
//获取事件对象
var myEvent = contract.Transfer();
//监听事件，监听到事件后会执行回调函数
myEvent.watch(function(err, result) {
    if (!err) {
        console.log(result);
    }else{
        console.log(err);
        myEvent.stopWatching();
    }
})；
```

此外，在event事件中，存在一个有着特殊意义的变量关键字，即`indexed`。在以太坊的事件机制中，对于成功触发的事件，以太坊会对事件进行数据层面的存储，方便开发者用筛选器(Filter)查找，所存储事件的数据区域对应的术语是`Event Log`(事件日志)。`Event Log`分两部分，分别是：

Topic部分（主题部分）：在智能合约函数中凡是被定义为`indexed`类型的参数值都会被保存到这个主题部分。

Data部分（数据部分）：没有被定义为`indexed`类型的参数值会被保存到这个数据部分。

一个event(事件)中最多可以对3个参数添加`indexed`属性标签，添加了indexed的参数值会存到日志结构的Topic部分，便于快速查找，而未加indexed的参数值会被保存在Data部分，成为原始日志。需要注意的是，如果添加`indexed`属性的是数组类型（包括string和bytes），那么只会在Topic部分存储对应数据的 web3.sha3 哈希值，将不会再保存原始数据。因为Topic部分是用于快速查找的，不能保存任意长度的数据，所以通过Topic部分实际保存的是数组这种非固定长度数据的哈希值。如下图所示，查询某笔交易记录的`Event Logs`(事件日志)时得到的结果。

![An image](/img/chain/eth/42.png)

和transfer事件一样，ERC20标准在代币授权成功后也有一个对应的授权事件触发。

```solidity
event Approval(address indexed _owner,address indexed _spender,uint256 _value);
```

以太坊结合Solidity语言中事件机制，它的最为重要的作用就是能够给调用者客户端一个回调功能，即异步回调，这样才能处理交易或授权的结果。试想一下，我们转了一笔账，却不知道交易的结果是怎样的，转账的时候只有一个交易哈希值拿到手，要想知道结果，只能不断地使用这个哈希值去调用以太坊的接口进行查询，或者手动去区块链浏览器中查询。这样无论是从编写代码层面还是用户在应用层面的体验来说都不那么友好，特别是批量交易的应用场景，所以事件的回调机制在一定程度上解决了这个问题。

捕获交易结果除了使用事件回调监听形式，还可通过遍历区块解析其过程来达到目的。

### ERC721标准

以上我们认识了专门为代币而设置的ERC20标准，但是在现实的开发中，除了使用智能合约来发布代币之外，更多的是实现和生活中实业相结合的智能合约应用。

想象一下，现实生活中，人与物理资产的对应关系都是一对一的，例如你买了一辆车，这个车有一个唯一的车牌号，且所有权归你，这就是一对一的关系。如果要把这种关系使用智能合约映射到区块链上，就需要制定一类合约标准来专门规范这种一对一的资产关系。

于是，ERC721标准诞生了。ERC721的官方解释是`Non-Fungible Tokens`，简写为NFTs，翻译为非同质代币，或不可替换的代表。

什么是非同质代币呢？关于这个名词的解析，我们可以从ERC20和ERC721的区别来进行。ERC20标准是专门为发布虚拟货币（即代币）制定的，货币的发行有发行量，例如共10万枚代币，这些代币都是一样的，没有唯一的标识，假设这个虚拟货币的symbol符号XXX，ERC标准就把这10万枚代币统称为XXX币。而在EC721标准中，它把个体唯一化了，同样是10万枚代币，假设使用ERC721标准发布这份智能合约，那么这10万枚代币的每一枚都会单独有一个ID，也就是说，10万枚中每一枚都各自有唯一的标识，彼此互不相同，单位为1，且无法再分割。

以上就是ERC20和ERC721最为核心的区别，主要表现在合约所表示的物质的个体化与一类化方面。ERC721的这个特点一所表示的物质（代币）独一无二，使其更具有价值。该标准很好地映射了现实生活中一对一的关系。例如，生活中每辆车的车牌号是独一无二的，我们所养的宠物的基因也是独一无二的，等等。

2017年，有一款基于ERC721标准开发的DApp游戏一CryptoKitties(加密猫)，又称以太猫。这款游戏中的猫对象就是独一无二的，每只猫相当于一个代币，都拥有一个唯一标识的D。

如果把物理世界的资产与区块链智能合约结合起来看，ERC721合约显然拥有更广泛的应用场景。但在DApp开发中，究竟使用哪一种合约标准，要根据项日的需要来决定。

#### 标准的函数

合约的函数和事件也和ERC20的大部分一样，如下所示：

```solidity
interface ERC721 is ERC165 {
    // Required methods
    function totalSupply() public view returns (uint256 total);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerof(uint256 _tokenId) external view returns (address owner);
    function approve (address _to, uint256 _tokenId) external;
    function transfer(address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    
    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);

    // Events
    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);
    
    // Optional可选实现
    function name() public view returns (string name);
    function symbol() public view returns (string symbol);
    function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds);
    function tokenMetadata (uint256 _tokenId, string _preferredTransport) public view returns (string infoUrl);
}
```

相比ERC20标准，在必须实现的函数中，ERC21标准多了ownerOf函数与supportsInterface函数。

```solidity
function ownerof(uint256 _tokenId) external view returns (address owner);
```

ownerOf的入参只有一个tokenId，作用是返回当前拥有这个tokenld的代币的拥有者的地址。

```solidity
function supportsInterface(bytes4 _interfaceID) external view returns (bool);
```

supportsInterface是ERC165标准的函数，ERC721标准也会用到这个函数。

ERC165标准的原型是：

```solidity
interface ERC165{
    // @notice Query if a contract implements an interface
    // @param interfaceID The interface identifier, as specified in ERC-165
    // @dev Interface identification is specified in ERC-165. This function uses less than 30,000 gas.
    // @return 'true' if the contract implements 'interfaceID'and 'interfaceID'is not 0xffffffff,'false'otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (boo1);
}
```

根据官方对ERC165标准的注释，该标准主要的作用是用来检测当前智能合约实现了哪些接口，可根据interfacelD来查询接口ID，存在就返回true，否则返回false。该标准函数还会消耗Gas(燃料)，至少消耗30000Gas。

下面举例加以说明。

假设一个ERC721智能合约里面有一个函数的名称是`getName`，先计算出该函数的bytes4类型的ID：

```solidity
bytes4 constant InterfaceSignature_ERC721 = bytes4(keccak256(getName()))
```

supportsInterface的内部实现如下：

```solidity
function supportsInterface(bytes4 interfaceID) external view returns (bool){
    return _interfaceID == InterfaceSignature_ERC721;
}
```

当interfacelD传参后，直接进行bytes4类型的等值判断。

上面的supportsInterface函数是必须实现的。此外，ERCl65标准在可选的实现函数中还有一个看起来比较难理解的函数：tokenMetadata。

```solidity
function tokenMetadata (uint256 _tokenId, string _preferredTransport) public view returns (string infoUrl);
```

tokenMetadata的作用主要是返回代币的元数据(Metadata)，内部返回的是我们自定义的个字符串。元数据是什么意思呢？就是基础信息，例如合约里的name和symbol就是基础数据，就好像一个人有名字、年龄和性别一样，这个函数的作用就是返回这些基础数据。一般来说，tokenMetadata可以用来返回当前智能合约的创建日期是什么时候、名称是什么等这些基础数据，然后将这些基础数据拼接成一个字符串返回。

在事件机制方面，ERC721和ERC20是完全一样的。
