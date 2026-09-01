# 消息同步

## 数据刷写

在Linux系统中，当我们把数据写入文件系统之后，其实数据在操作系统的PageCache（页缓冲）里面，并没有刷到磁盘上。如果操作系统挂了，数据就丢失了。一方面，应用程序可以调用fsync这个系统调用来强制刷盘，另一方面，操作系统有后台线程，定时刷盘。频繁调用fsync会影响性能，需要在性能和可靠性之间进行权衡。实际上，Kafka提供了参数进行数据的刷写

- `log.flush.interval.messages` ：达到消息数量时，会将数据flush到日志文件中。
- `log.flush.interval.ms` ：间隔多少时间(ms)，执行一次强制的flush操作。
- `flush.scheduler.interval.ms`：所有日志刷新到磁盘的频率

`log.flush.interval.messages` 和 `log.flush.interval.ms` 无论哪个达到，都会flush。官方不建议通过上述的三个参数来强制写盘，数据的可靠性应该通过replica来保证，而强制flush数据到磁盘会对整体性能产生影响。

## 副本同步

Kafka中，分区的某个副本会被指定为 Leader，负责响应客户端的读写请求。分区中的其他副本自动成为 Follower，主动拉取（同步）Leader 副本中的数据，写入自己本地日志，确保所有副本上的数据是一致的。

![An image](/img/dev/kafka/037.png)

### 副本同步流程

**启动数据同步线程：**

Kafka创建主题时，会根据副本分配策略向指定的Broker节点发出请求，将不同的副本节点设定为Leader或Follower。一旦某一个Broker节点设定为Follower节点，那么Follower节点会启动数据同步线程ReplicaFetcherThread，从Leader副本节点同步数据。

线程运行后，会不断重复两个操作：截断（truncate）和抓取（fetch）。

- 截断：为了保证分区副本的数据一致性，当分区存在Leader Epoch值时，会将副本的本地日志截断到Leader Epoch对应的最新位移处.如果分区不存在对应的 Leader Epoch 记录，那么依然使用原来的高水位机制，将日志调整到高水位值处。
- 抓取：向Leader同步最新的数据。

**生成数据同步请求：**

启动线程后，需要周期地向Leader节点发送FETCH请求，用于从Leader获取数据。等待Leader节点的响应的过程中，会阻塞当前同步数据线程。

**处理数据响应：**

当Leader副本返回响应数据时，其中会包含多个分区数据，当前副本会遍历每一个分区，将分区数据写入数据文件中。

**更新数据偏移量：**

当Leader副本返回响应数据时，除了包含多个分区数据外，还包含了和偏移量相关的数据HW和LSO，副本需要根据场景对Leader返回的不同偏移量进行更新。

### 偏移量更新策略

#### Offset

Kafka的每个分区的数据都是有序的，所谓的数据偏移量，指的就是Kafka在保存数据时，用于快速定位数据的标识，类似于Java中数组的索引，从0开始。

Kafka的数据文件以及数据访问中包含了大量和偏移量的相关的操作。

#### LSO

起始偏移量（Log Start Offset），每个分区副本都有起始偏移量，用于表示副本数据的起始偏移位置，初始值为0。

LSO一般情况下是无需更新的，但是如果数据过期，或用户手动删除数据时，Leader的Log Start Offset可能发生变化，Follower副本的日志需要和Leader保持严格的一致，因此，如果Leader的该值发生变化，Follower自然也要发生变化保持一致。

#### LEO

日志末端位移（Log End Offset），表示下一条待写入消息的offset，每个分区副本都会记录自己的LEO。对于Follower副本而言，它能读取到Leader副本 LEO 值以下的所有消息。

#### HW

高水位值（High Watermark），定义了消息可见性，标识了一个特定的消息偏移量（offset），消费者只能拉取到这个水位offset之前的消息，同时这个偏移量还可以帮助Kafka完成副本数据同步操作。

## 数据一致性

Kafka的设计目标是：高吞吐、高并发、高性能。为了做到以上三点，它必须设计成分布式的，多台机器可以同时提供读写，并且需要为数据的存储做冗余备份。

![An image](/img/dev/kafka/038.jpg)

图中的主题有3个分区，每个分区有3个副本，这样数据可以冗余存储，提高了数据的可用性。并且3个副本有两种角色，Leader和Follower，Follower副本会同步Leader副本的数据。

一旦Leader副本挂了，Follower副本可以选举成为新的Leader副本， 这样就提升了分区可用性，但是相对的，在提升了分区可用性的同时，也就牺牲了数据的一致性。

我们来看这样的一个场景：一个分区有3个副本，一个Leader和两个Follower。Leader副本作为数据的读写副本，所以生产者的数据都会发送给leader副本，而两个follower副本会周期性地同步leader副本的数据，但是因为网络，资源等因素的制约，同步数据的过程是有一定延迟的，所以3个副本之间的数据可能是不同的。具体如下图所示：

![An image](/img/dev/kafka/039.jpg)

此时，假设leader副本因为意外原因宕掉了，那么Kafka为了提高分区可用性，此时会选择2个follower副本中的一个作为Leader对外提供数据服务。此时我们就会发现，对于消费者而言，之前leader副本能访问的数据是D，但是重新选择leader副本后，能访问的数据就变成了C，这样消费者就会认为数据丢失了，也就是所谓的数据不一致了。

![An image](/img/dev/kafka/040.jpg)

为了提升数据的一致性，Kafka引入了高水位（HW ：High Watermark）机制，Kafka在不同的副本之间维护了一个水位线的机制（其实也是一个偏移量的概念），消费者只能读取到水位线以下的的数据。**这就是所谓的木桶理论：木桶中容纳水的高度，只能是水桶中最短的那块木板的高度**。这里将整个分区看成一个木桶，其中的数据看成水，而每一个副本就是木桶上的一块木板，那么这个分区（木桶）可以被消费者消费的数据（容纳的水）其实就是数据最少的那个副本的最后数据位置（木板高度）。

也就是说，消费者一开始在消费Leader的时候，虽然Leader副本中已经有a、b、c、d 4条数据，但是由于高水位线的限制，所以也只能消费到a、b这两条数据。

![An image](/img/dev/kafka/041.jpg)

这样即使leader挂掉了，但是对于消费者来讲，消费到的数据其实还是一样的，因为它能看到的数据是一样的，也就是说，消费者不会认为数据不一致。

![An image](/img/dev/kafka/042.jpg)

不过也要注意，因为follower要求和leader的日志数据严格保持一致，所以就需要根据现在Leader的数据偏移量值对其他的副本进行数据截断（truncate）操作。

![An image](/img/dev/kafka/043.jpg)

### HW在副本之间的传递

HW高水位线会随着follower的数据同步操作，而不断上涨，也就是说，follower同步的数据越多，那么水位线也就越高，那么消费者能访问的数据也就越多。接下来，我们就看一看，follower在同步数据时HW的变化。

首先，初始状态下，Leader和Follower都没有数据，所以和偏移量相关的值都是初始值0，而由于Leader需要管理follower，所以也包含着follower的相关偏移量（LEO）数据。

![An image](/img/dev/kafka/044.jpg)

生产者向Leader发送两条数据，Leader收到数据后，会更新自身的偏移量信息。

```sh
Leader副本偏移量更新
LEO=LEO+2=2
```

![An image](/img/dev/kafka/045.jpg)

接下来，Follower开始同步Leader的数据，同步数据时，会将自身的LEO值作为参数传递给Leader。此时，Leader会将数据传递给Follower，且同时Leader会根据所有副本的LEO值更新HW。

![An image](/img/dev/kafka/046.png)

```bash
Leader副本偏移量更新：
HW = Math.max[HW, min(LeaderLEO，F1-LEO，F2-LEO)]=0
```

![An image](/img/dev/kafka/047.png)

由于两个Follower的数据拉取速率不一致，所以Follower-1抓取了2条数据，而Follower-2抓取了1条数据。Follower再收到数据后，会将数据写入文件，并更新自身的偏移量信息。

```sh
Follower-1副本偏移量更新：
LEO=LEO+2=2
HW = Math.min[LeaderHW, LEO]=0
Follower-2副本偏移量更新：
LEO=LEO+1=1
HW = Math.min[LeaderHW, LEO]=0
```

![An image](/img/dev/kafka/048.jpg)

接下来Leader收到了生产者的数据C，那么此时会根据相同的方式更新自身的偏移量信息

```sh
Leader副本偏移量更新：
LEO=LEO+1=3
```

![An image](/img/dev/kafka/049.jpg)

follower接着向Leader发送Fetch请求，同样会将最新的LEO作为参数传递给Leader。Leader收到请求后，会更新自身的偏移量信息。

```sh
Leader副本偏移量更新：
HW = Math.max[HW, min(LeaderLEO，F1-LEO，F2-LEO)]=0
```

![An image](/img/dev/kafka/050.jpg)

此时，Leader会将数据发送给Follower，同时也会将HW一起发送。

![An image](/img/dev/kafka/051.jpg)

![An image](/img/dev/kafka/052.jpg)

Follower收到数据后，会将数据写入文件，并更新自身偏移量信息

```sh
Follower-1副本偏移量更新：
LEO=LEO+1=3
HW = Math.min[LeaderHW, LEO]=1
Follower-2副本偏移量更新：
LEO=LEO+1=2
HW = Math.min[LeaderHW, LEO]=1
```

![An image](/img/dev/kafka/053.jpg)

![An image](/img/dev/kafka/054.jpg)

因为Follower会不断重复Fetch数据的过程，所以前面的操作会不断地重复。最终，follower副本和Leader副本的数据和偏移量是保持一致的。

![An image](/img/dev/kafka/055.jpg)

上面演示了副本列表ISR中Follower副本和Leader副本之间HW偏移量的变化过程，但特殊情况是例外的。比如当前副本列表ISR中，只剩下了Leader一个副本的场合下，是不需要等待其他副本的，直接推高HW即可。

### ISR（In-Sync Replicas）伸缩

在Kafka中，一个Topic（主题）包含多个Partition（分区），Topic是逻辑概念，而Partition是物理分组。一个Partition包含多个Replica（副本），副本有两种类型Leader Replica/Follower Replica，Replica之间是一个Leader副本对应多个Follower副本。注意：分区数可以大于节点数，但副本数不能大于节点数。因为副本需要分布在不同的节点上，才能达到备份的目的。

Kafka的分区副本中只有Leader副本具有数据写入的功能，而Follower副本需要不断向Leader发出申请，进行数据的同步。这里所有同步的副本会形成一个列表，我们称之为同步副本列表（**In-Sync Replicas**），也可以简称**ISR**，除了**ISR**以外，还有已分配的副本列表（**Assigned Replicas**），简称**AR。**这里的AR其实不仅仅包含ISR，还包含了没有同步的副本列表（**Out-of-Sync Replicas**），简称**OSR**

生产者Producer生产数据时，ACKS应答机制如果设置为all（-1），那此时就需要保证同步副本列表ISR中的所有副本全部接收完毕后，Kafka才会进行确认应答。

数据存储时，只有ISR中的所有副本LEO数据都更新了，才有可能推高HW偏移量的值。这就可以看出，ISR在Kafka集群的管理中是非常重要的。

在Broker节点中，有一个副本管理器组件（ReplicaManager），除了读写副本、管理分区和副本的功能之外，还有一个重要的功能，那就是管理ISR。这里的管理主要体现在两个方面：

周期性地查看 ISR 中的副本集合是否需要收缩。这里的收缩是指，把ISR副本集合中那些与Leader差距过大的副本移除的过程。

![An image](/img/dev/kafka/056.png)

相对的，有收缩，就会有扩大，在Follower抓取数据时，判断副本状态，满足扩大ISR条件后，就可以提交分区变更请求。完成ISR列表的变更。

向集群Broker传播ISR的变更。ISR发生变化（包含Shrink和Expand）都会执行传播逻辑。`ReplicaManager`每间隔`2500`毫秒就会根据条件，将ISR变化的结果传递给集群的其他Broker。

![An image](/img/dev/kafka/057.png)
