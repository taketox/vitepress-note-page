# 区块的定义

## 区块的定义

区块其实就是一种数据结构，内含变量和属性，这些变量和属性可由开发人员自行定义。

在以太坊的1.8.11-Golang版本代码中，给出了如下的区块定义：

```go
type Block struct {
    header  *Header
    uncles  []*Header //这个是保存叔块头部信息的数组变量
    transactions Transactions
    //缓存
    hash atomic.Value
    size atomic.Value
    //Td是核心模块core用来存储当前区块被挖出后，区块的总难度
    td *big.Int
    
    ReceivedAt time.Time  //区块被接收的时间
    ReceivedFrom interface{} //记录该区块是从哪个P2P网络传过来的
}
```

有关上面的区块结构，建议重点了解以下部分：

- **Header**：区块的头部结构体。
- **Transactions**：当前该区块所有打包的交易记录的结构体数组。
- **Hash**：区块的哈希值，这个值的计算是比较复杂的，是将当前的区块头(Header内的数据)整体地进行哈希算法运算之后所得出的哈希值，一旦区块头中某一个成员变量的数据值改变了，该哈希值就会随之改变。
- **Uncles**：叔块。

下面我们再来看一下最主要的区块Header结构体的组成部分。

```go
type Header struct {
    ParentHash common.Hash
    UncleHash common.Hash
    Coinbase common.Address
    Root common Hash
    TxHash common.Hash
    ReceiptHash common.Hash
    Bloom Bloom
    Difficulty *big.Int
    Number *big.Int
    `GasLimit` uint64
    `GasUsed` uint64
    Time *big.Int
    Extra []byte
    MixDigest common.Hash
    Nonce BlockNonce
}
```

有关上面的Header结构，建议重点了解以下部分：

- **ParentHash**：这是当前区块的上一个区块的哈希值。请回忆一下区块的链状结构，也正是因为有这个变量的存在，后一个区块的数据里面才有了上一个区块的哈希值，从而在上下连接的层次上，体现出区块链的特点。
- **Coinbase**：当节点首次启动时默认配给当前节点的一个钱包地址，以太坊节点使用PoW共识算法挖矿产生的ETH代币奖励会被打入该地址。如果想使挖矿奖励进入其他账户，可以进行设置。另外，在节点控制台中直接发起交易的时候，充当From的也是它。
- **Root、TxHash、ReceiptHash**：代表的都是一棵以太坊默克尔前缀(MPT)树的根节点哈希。
- **Difficulty**：以太坊部分代码在基于PoW共识情况下的挖矿难度系数，代表了区块被挖出矿的难度，这个系数会根据出块速度来进行调整。以太坊第一个区块的难度系数是131072，后面区块的难度系数会根据前面区块的出块速度进行调整，快高慢低。
- **Number**：区块号，不能理解为区块的id，因为Number并不是完全唯一的。例如，在几个私有节点中，每个节点会各自挖出自己节点网络中Number顺序递增的区块，此时的Number就会在不同的节点网络中出现一样的情况，而区块的id，一般我们认为是它的区块哈希值(bock
  hash)。另外，当前子区块的Number，在关系方面等于在它父区块的Number上加1。
- **Time**：区块的生成时间。请注意，这个时间不是区块真正生成的精确时间，这个时间可能是父区块的生成时间加上N秒，把它称为区块的大概生成时间比较准确。
- **GasLimit**：区块Header中的`GasLimit`和交易中的`GasLimit`的含义不同，请注意区分。Header里的`GasLimit`是单个区块允许的最多交易加起来的`GasLimit`总量，即区块 `GasLimit` ≥ 当前区块所有的Transaction(交易)的`GasLimit`之和。假设有5笔交易，Transaction的`GasLimit`分别是10、20、30、40和50。如果区块的`GasLimit`是100，那么前4笔交易就能被成功打包进入这个区块，因为矿工有权决定将那些交易打包进区块；另一个矿工也可以选择打包最后两笔交易进入这个区块(50+40)，然后将第一笔交易打包(10)。如果我们尝试将一个使用超过当前区块`GasLimit`的交易打包，这笔交易将会被网络拒绝，客户端也会收到`GasLimit`类的错误信息反馈。
- **GasUsed**：表示这个区块中所有的打包交易Transaction实际消耗的Gas总量，它和`GasLimit`的关系可以表示为公式：`GasUsed` ≤ `GasLimit`。也就是说，`GasLimit`虽然表示了一个总的限制值，但是实际共占了多少还是要看`GasUsed`的值。
- **Extra**：该变量用于为当前区块的创建者保留附属信息。例如，节点A产生了区块1，然后A向Extra中加上附属信息：这是节点A产生的区块。
- **Nonce**：英文解释是`临时工`，但它所表示的作用和`临时工`无半点类似。注意，Header的Nonce和交易中的Nonce代表的含义是不一样的，Header的Nonce主要用于PoW共识情况下的挖矿，用于记录在该区块的矿工做了多少次哈希才成功计算出胜出区块B，例如区块B的Nonce是200。而交易中的Nonce才是重点。
