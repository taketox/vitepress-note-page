# 核心机制

## Controller选举

Controller，是Apache Kafka的核心组件。它的主要作用是在Apache Zookeeper的帮助下管理和协调控制整个Kafka集群。

集群中的任意一台Broker都能充当Controller的角色，但是，在整个集群运行过程中，只能有一个Broker成为Controller。也就是说，每个正常运行的Kafka集群，在任何时刻都有且只有一个Controller。

![An image](/img/dev/kafka/090.jpg)

最先在Zookeeper上创建临时节点`/controller`成功的Broker就是Controller。Controller重度依赖Zookeeper，依赖zookeepr保存元数据，依赖zookeeper进行服务发现。Controller大量使用Watch功能实现对集群的协调管理。如果此时，作为Controller的Broker节点宕掉了。那么zookeeper的临时节点`/controller`就会因为会话超时而自动删除。而监控这个节点的Broker就会收到通知而向ZooKeeper发出创建`/controller`节点的申请，一旦创建成功，那么创建成功的Broker节点就成为了新的Controller。

![An image](/img/dev/kafka/091.jpg)

有一种特殊的情况，就是Controller节点并没有宕掉，而是因为网络的抖动，不稳定，导致和ZooKeeper之间的会话超时，那么此时，整个Kafka集群就会认为之前的Controller已经下线（退出）从而选举出新的Controller，而之前的Controller的网络又恢复了，以为自己还是Controller了，继续管理整个集群，那么此时，整个Kafka集群就有两个controller进行管理，那么其他的broker就懵了，不知道听谁的了，这种情况，我们称之为**脑裂现象**，为了解决这个问题，Kafka通过一个**任期**（epoch:纪元）的概念来解决，也就是说，每一个Broker当选Controller时，会告诉当前Broker是第几任Controller，一旦重新选举时，这个任期会自动增1，那么不同任期的Controller的epoch值是不同的，那么旧的controller一旦发现集群中有新任controller的时候，那么它就会完成退出操作（清空缓存，中断和broker的连接，并重新加载最新的缓存），让自己重新变成一个普通的Broker。

## Broker上线下线

Controller 在初始化时，会利用 ZK 的 watch 机制注册很多不同类型的监听器，当监听的事件被触发时，Controller 就会触发相应的操作。Controller 在初始化时，会注册多种类型的监听器，主要有以下几种：

- 监听 `/admin/reassign_partitions` 节点，用于分区副本迁移的监听
- 监听 `/isr_change_notification` 节点，用于 `Partition ISR` 变动的监听
- 监听 `/admin/preferred_replica_election` 节点，用于需要进行 `Partition` 最优 `leader` 选举的监听
- 监听 `/brokers/topics` 节点，用于 `Topic` 新建的监听
- 监听 `/brokers/topics/TOPIC_NAME` 节点，用于 `Topic Partition` 扩容的监听
- 监听 `/admin/delete_topics` 节点，用于 `Topic` 删除的监听
- 监听 `/brokers/ids` 节点，用于 `Broker` 上下线的监听。

每台 Broker 在上线时，都会与ZK建立一个建立一个session，并在 `/brokers/ids`下注册一个节点，节点名字就是`broker id`，这个节点是临时节点，该节点内部会有这个 Broker 的详细节点信息。Controller会监听 `/brokers/ids` 这个路径下的所有子节点，如果有新的节点出现，那么就代表有新的Broker上线，如果有节点消失，就代表有broker下线，Controller会进行相应的处理，Kafka就是利用ZK的这种watch机制及临时节点的特性来完成集群 Broker的上下线。无论Controller监听到的哪一种节点的变化，都会进行相应的处理，同步整个集群元数据

## 数据偏移量定位

分区是一个逻辑工作单元，其中记录被顺序附加分区上 **（kafka只能保证分区消息的有序性，而不能保证消息的全局有序性）**。但是分区不是存储单元，分区进一步划分为**Segment （段）**，这些段是文件系统上的实际文件。为了获得更好的性能和可维护性，可以创建多个段，而不是从一个巨大的分区中读取，消费者现在可以更快地从较小的段文件中读取。创建具有分区名称的目录，并将该分区的所有段作为各种文件进行维护。在理想情况下，数据流量分摊到各个Parition中，实现了负载均衡的效果。在分区日志文件中，你会发现很多类型的文件，比如： `.index`、`.timeindex`、`.log`等

每个数据日志文件会对用一个`LogSegment`对象，并且都有一个基准偏移量，表示当前 `LogSegment` 中第一条消息的偏移量 `offset`。

![An image](/img/dev/kafka/092.jpg)

偏移量是一个 64 位的长整形数，固定是20位数字，长度未达到，用 0 进行填补，索引文件和日志文件都由该作为文件名命名规则：

**00000000000000000000.index**：索引文件，记录偏移量映射到 `.log` 文件的字节偏移量，此映射用于从任何特定偏移量读取记录

**0000000000000000000.timeindex**：时间戳索引文件，此文件包含时间戳到记录偏移量的映射，该映射使用 `.index` 文件在内部映射到记录的字节偏移量。这有助于从特定时间戳访问记录

**00000000000000000000.log**：此文件包含实际记录，并将记录保持到特定偏移量,文件名描述了添加到此文件的起始偏移量，如果日志文件名为  `00000000000000000004.log` ，则当前日志文件的第一条数据偏移量就是4（偏移量从 0 开始）

![An image](/img/dev/kafka/093.jpg)

多个数据日志文件在操作时，只有最新的日志文件处于活动状态，拥有文件写入和读取权限，其他的日志文件只有只读的权限。

偏移量索引文件用于记录消息偏移量与物理地址之间的映射关系。时间戳索引文件则根据时间戳查找对应的偏移量。Kafka 中的索引文件是以稀疏索引的方式构造消息的索引，并不保证每一个消息在索引文件中都有对应的索引项。每当写入一定量的消息时，偏移量索引文件和时间戳索引文件分别增加一个偏移量索引项和时间戳索引项。通过修改 `log.index.interval.bytes` 的值，改变索引项的密度。

数据位置索引保存在index文件中，log日志**默认每写入4K**（log.index.interval.bytes设定的），会写入一条索引信息到index文件中，因此索引文件是稀疏索引，它不会为每条日志都建立索引信息，索引文件的数据结构则是由相对`offset（4byte）+position（4byte）`组成，由于保存的是相对第一个消息的相对offset，只需要4byte就可以，节省空间，实际查找后还需要计算回实际的offset，这对用户是不可见的。

如果消费者想要消费某一个偏移量的数据，那么Kafka会通过Kafka 中存在一个  `ConcurrentSkipListMap`（跳跃表）定位到`00000000000000000000.index` 索引文件 ，通过二分法在偏移量索引文件中找到不大于指定偏移量的最大索引项，然后从日志分段文件中的物理位置开始顺序查找偏移量为指定值的消息。

## Topic删除

kafka删除topic消息的三种方式：

方法一：快速配置删除法（确保topic数据不要了）

```SH
# kafka启动之前，在server.properties配置delete.topic.enable=true

# 执行命令 或者使用kafka-manager集群管理工具删除
bin/kafka-topics.sh --delete --topic test --zookeeper zk:2181
```

>如果kafka启动之前没有配置 `delete.topic.enable=true`，topic只会标记为`marked for deletion`。加上配置，重启kafka，之前的topick就真正删除了。

方法二：设置删除策略（确保topic数据不要了）

方法三：手动删除法（不推荐）（确保topic数据不要了）

```sh
# 删除zk下面topic（test）
# 启动bin/zkCli.sh
ls /brokers/topics
rmr /brokers/topics/test
ls /brokers/topics
#查topic是否删除
bin/kafka-topics.sh --list --zookeeper zk:2181
```

## 日志清理和压缩

Kafka软件的目的本质是用于传输数据，而不是存储数据，但是为了均衡生产数据速率和消费者的消费速率，所以可以将数据保存到日志文件中进行存储。默认的数据日志保存时间为7天，可以通过调整如下参数修改保存时间：

- `log.retention.hours`：小时（默认：7天，最低优先级）
- `log.retention.minutes`：分钟
- `log.retention.ms`：毫秒（最高优先级）
- `log.retention.check.interval.ms`：负责设置检查周期，默认5分钟。

日志一旦超过了设置的时间，Kafka中提供了两种日志清理策略：`delete` 和 `compact`。

**delete将过期数据删除：**

- `log.cleanup.policy = delete`（所有数据启用删除策略）

  - 基于时间：默认打开。以segment中所有记录中的最大时间戳作为该文件时间戳。

  - 基于大小：默认关闭。超过设置的所有日志总大小，删除最早的segment。
    - `log.retention.bytes`，默认等于-1，表示无穷大。

**如果一个segment中有一部分数据过期，一部分没有过期，怎么处理？**

![An image](/img/dev/kafka/094.jpg)

**compact日志压缩：**

基本思路就是将相同key的数据，只保留最后一个

- `log.cleanup.policy = compact`（所有数据启用压缩策略）

![An image](/img/dev/kafka/095.jpg)

>注意：因为数据会丢失，所以这种策略只适用保存数据最新状态的特殊场景。

## 页缓存

页缓存是操作系统实现的一种主要的**磁盘缓存**，以此用来减少对磁盘I/O的操作。具体来说，就是把磁盘中的数据缓存到内存中，把对磁盘的访问变为对内存的访问。为了弥补性能上的差异 ，现代操作系统越来越多地将内存作为磁盘缓存，甚至会将所有可用的内存用于磁盘缓存，这样当内存回收时也几乎没有性能损失，所有对于磁盘的读写也将经由统一的缓存。

当一个进程准备读取磁盘上的文件内容时，操作系统会先查看待读取的数据所在的页（page）是否在页缓存（page cache）中，如果存在（命中）则直接返回数据，从而避免了对物理磁盘I/O操作；如果没有命中，则操作系统会向磁盘发起读取请示并将读取的数据页写入页缓存，之后再将数据返回进程。同样，如果一个进程需要将数据写入磁盘，那么操作系统也会检测数据对应的页是否在页缓存中，如果不存在，则会先在页缓存中添加相应的页，最后将数据写入对应的页。被修改过后的页也就变成了脏页，操作系统会在合适的时间把脏页中的数据写入磁盘，以操作数据的一致性。

对一个进程页言，它会在进程内部缓存处理所需的数据，然而这些数据有可能还缓存在操作系统的页缓存中，因此同一份数据有可能被缓存了2次。并且，除非使用Direct I/O的方式，否则页缓存很难被禁止。

Kafka中大量使用了页缓存，这是Kafka实现高吞吐的重要因此之一。虽然消息都是先被写入页缓存，然后由操作系统负责具体的刷盘任务，但在Kafka中同样提供了同步刷盘及间断性强制刷盘（fsync）的功能，这些功能可以通过`log.flush.interval.message`、`log.flush.interval.ms`等参数来控制。同步刷盘可以提高消息的可靠性，防止由于机器掉电等异常造成处于页缓存而没有及时写入磁盘的消息丢失。不过一般不建议这么做，刷盘任务就应交由操作系统去调配，消息的可靠性应该由多副本机制来保障，而不是由同步刷盘这种严重影响性能的行为来保障。

## 零拷贝

kafka的高性能是多方面协同的结果，包括宏观架构、分布式partition存储、ISR数据同步、以及“无所不用其极”的高效利用磁盘/操作系统特性。其中零拷贝并不是不需要拷贝，通常是说在IO读写过程中减少不必要的拷贝次数。

这里我们要说明是，内核在执行操作时同一时间点只会做一件事，比如Java写文件这个操作，为了提高效率，这个操作是分为3步：第一步java将数据写入自己的缓冲区，第二步java需要写入数据的磁盘页可能就在当前的页缓存（Page Cache）中，所以java需要将自己的缓冲区的数据写入操作系统的页缓存（Page Cache）中。第三步操作系统会在页缓存数据满了后，将数据实际刷写到磁盘文件中。

![An image](/img/dev/kafka/096.jpg)

在这个过程，Java Application数据的写入和页缓存的数据刷写对于操作系统来讲是不一样的，可以简单理解为，页缓存的数据刷写属于内核的内部操作，而是用于启动的应用程序的数据操作属于内核的外部操作，权限会受到一定的限制。所以内核在执行不同操作时，就需要将不同的操作环境加载到执行空间中，也就是说，当java想要将数据写入页缓存时，就需要调用用户应用程序的操作，这就是用户态操作。当需要将页缓存数据写入文件时，就需要中断用户用用程序操作，而重新加载内部操作的运行环境，这就是内核态操作。可以想象，如果存在大量的用户态和内核态的切换操作，IO性能就会急剧下降。所以就存在零拷贝操作，减少用户态和内核态的切换，提高效率。Kafka消费者消费数据以及Follower副本同步数据就采用的是零拷贝技术。

![An image](/img/dev/kafka/097.jpg)

## 顺写日志

Kafka 中消息是以topic进行分类的，生产者生产消息，消费者消费消息，都是面向 topic的。

在Kafka中，一个topic可以分为多个partition，一个partition分为多个segment，每个 segment对应三个文件：`.index文件`、`.log文件`、`.timeindex文件`。

topic 是逻辑上的概念，而patition是物理上的概念，每个patition对应一个log文件，而log文件中存储的就是producer生产的数据，patition生产的数据会被不断的添加到log文件的末端，且每条数据都有自己的offset。

![An image](/img/dev/kafka/098.jpg)

Kafka底层采用的是`FileChannel.wrtieTo`进行数据的写入，写的时候并不是直接写入文件，而是写入`ByteBuffer`，然后当缓冲区满了，再将数据顺序写入文件，无需定位文件中的某一个位置进行写入，那么就减少了磁盘查询，数据定位的过程。所以性能要比随机写入，效率高得多。

官网有数据表明，同样的磁盘，顺序写能到600M/s，而随机写只有100K/s。这与磁盘的机械结构有关，顺序写之所以快，是因为其省去了大量磁头寻址的时间。

![An image](/img/dev/kafka/099.jpg)
