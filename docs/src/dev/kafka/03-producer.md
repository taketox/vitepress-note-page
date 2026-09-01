# 生产消息

## 发送消息

### 发送原理

在消息发送的过程中，涉及到了两个线程**main线程** 和 **Sender线程**。

在 main 线程中创建了一个**双端队列** `RecordAccumulator`。 **main线程** 将消息发送给**双端队列** `RecordAccumulator`，**Sender 线程** 不断从 `RecordAccumulator` 中拉取消息发送到 `Kafka Broker`。

> **双端队列**：队列的每一端都能够插入数据项和移除数据项。

![An image](/img/dev/kafka/008.png)

>**数据发送条件：**
>
>- `batch.size`：只有数据积累到 `batch.size` 之后， `sender` 才会发送数据。 默认`16k`。
>- `linger.ms`：如果数据迟迟未达到 `batch.size`， `sender` 等待 `linger.ms` 设置的时间到了之后就会发送数据。 单位 `ms`， 默认值是 `0ms`， 表示没有延迟。`linger.ms` 为 `0ms`，`batch.size` 也就失效了。
>
>**应答机制：**
>
>- `0`：生产者发送过来的数据， 不需要等数据落盘应答。
>- `1`：生产者发送过来的数据， `Leader` 收到数据后应答。
>- `-1（all）` ：生产者发送过来的数据， `Leader` 和 `ISR` 队列里面的所有节点收齐数据后应答。 -1和all等价。
>
>如果**应答成功**则会清理 `Sender` 中对应的请求，也会清理 `RecordAccumulator` 中分区的数据，
>
>如果**应答失败**则会进行重试，重试的次数为 `int` 的最大值。

### 生产者重要参数列表

| 参数名称                                | 描述                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `bootstrap.servers`                     | **生产者连接集群所需的 broker 地址清单**。如：`loclhost:9092,loclhost:9093,loclhost:9094`，可以设置 1 个或者多个，中间用逗号隔开。注意这里并非需要所有的 broker 地址，因为生产者从给定的 broker里查找到其他 broker 信息。 |
| `key.serializer AND value.serializer`   | 指定发送消息的 `key` 和 `value` 的序列化类型。一定要写全类名。 |
| `buffer.memory`                         | `RecordAccumulator` 缓冲区总大小， 默认 `32m`。              |
| `batch.size`                            | **缓冲区一批数据最大值**， 默认 `16k`。适当增加该值，可以提高吞吐量，但是如果该值设置太大，会导致数据传输延迟增加。 |
| `linger.ms`                             | **发送条件**，如果数据迟迟未达到 `batch.size`，`sender` 等待 `linger.time` 之后就会发送数据。单位 `ms`， 默认值是 `0ms`，表示没有延迟。 生产环境建议该值大小为 `5-100ms` 之间。 |
| `acks`                                  | **应答机制**，`0`：生产者发送过来的数据，不需要等数据落盘答。`1`：生产者发送过来的数据， `Leader` 收到数据后答。`-1(all)`：生产者发送过来的数据， `Leader+` 和 `isr` 队列里面的所有节点收齐数据后应答。 默认值是 `-1`，`-1` 和 `all` 是等价的。 |
| `max.in.flight.requests.per.connection` | **允许最多没有返回 ack 的次数**， 默认为 `5`，开启幂等性要保证该值是 `1-5` 的数字。 |
| `retries`                               | 当消息发送出现错误的时候，系统会重发消息。 **retries表示重试次数**。 默认是 int 最大值：`2147483647`。如果设置了重试，还想保证消息的有序性，需要设置 `MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION=1` 否则在重试此失败消息的时候，其他的消息可能发送成功了。 |
| `retry.backoff.ms`                      | **两次重试之间的时间间隔**，默认是 `100ms`。                 |
| `enable.idempotence`                    | 是否开启幂等性， 默认 `true`，开启幂等性。                   |
| `compression.type`                      | **生产者发送的所有数据的压缩方式**。 默认是 `none`，也就是不压缩。支持压缩类型： `none、gzip、snappy、lz4、zstd`。 |

## 消息分区

**为什么要分区？**

**便于合理使用存储资源**， 每个 `Partition` 在一个 `Broker` 上存储， 可以把海量的数据按照分区切割成一块一块数据存储在多台 `Broker`上。 合理控制分区的任务， 可以实现**负载均衡**的效果。

**提高并行度**， 生产者可以**以分区为单位**发送数据；消费者可以**以分区为单位**进行消费数据。

![An image](/img/dev/kafka/009.png)

### DefaultPartitioner

默认分区器

#### 指明分区

部分源码

```java
    public ProducerRecord(String topic, Integer partition, Long timestamp, K key, V value, Iterable<Header> headers) {
        if (topic == null) {
            throw new IllegalArgumentException("Topic cannot be null.");
        } else if (timestamp != null && timestamp < 0L) {
            throw new IllegalArgumentException(String.format("Invalid timestamp: %d. Timestamp should always be non-negative or null.", timestamp));
        } else if (partition != null && partition < 0) {
            throw new IllegalArgumentException(String.format("Invalid partition: %d. Partition number should always be non-negative or null.", partition));
        } else {
            this.topic = topic;
            this.partition = partition;
            this.key = key;
            this.value = value;
            this.timestamp = timestamp;
            this.headers = new RecordHeaders(headers);
        }
    }

    public ProducerRecord(String topic, Integer partition, Long timestamp, K key, V value) {
        this(topic, partition, timestamp, key, value, (Iterable)null);
    }

    public ProducerRecord(String topic, Integer partition, K key, V value, Iterable<Header> headers) {
        this(topic, partition, (Long)null, key, value, headers);
    }

    public ProducerRecord(String topic, Integer partition, K key, V value) {
        this(topic, partition, (Long)null, key, value, (Iterable)null);
    }
```

>指明 `partition` 的情况下，直接将指明的值作为 `partition` 值；
>
>例如：`partition=0`，所有数据写入分区 `0`。

#### 未指明分区，指定Key

部分源码

```java
    public ProducerRecord(String topic, K key, V value) {
        this(topic, (Integer)null, (Long)null, key, value, (Iterable)null);
    }
```

>没有指明 `partition` 值但有 `key` 的情况下， 将 `key` 的 `hash` 值与 `topic` 的 `partition` 数进行取余得到 `partition` 值；
>
>例如： `key1` 的 `hash = 5`， `key2` 的 `hash=6`， `topic` 的 `partition = 2`， 那么 `key1` 对应的 `value1` 写入 `1` 分区， `key2` 对应的 `value2` 写入 `0` 分区。

#### 未指明分区和Key

部分源码

```java
    public ProducerRecord(String topic, V value) {
        this(topic, (Integer)null, (Long)null, (Object)null, value, (Iterable)null);
    }
```

>既没有 `partition` 值又没有 `key` 值的情况下， Kafka采用 `Sticky Partition`（黏性分区器）， 会 **随机选择一个分区**，并尽可能一直使用该分区， 待该分区的 `batch` 已满或者已完成，Kafka再随机一个分区进行使用（和上一次的分区不同）。
>
>例如：第一次随机选择 `0` 分区， 等 `0` 分区当前批次满了（默认`16k`） 或者 `linger.ms` 设置的时间到，Kafka再随机一个分区进行使用（如果还是0会继续随机） 。

### 自定义分区器

如果研发人员可以根据企业需求，自己重新实现分区器。

**以Java语言为例：**

```java
public class CustomPartitioner implements Partitioner {


    /**
     * 返回信息对应的分区
     *
     * @param topic      主题
     * @param key        消息的 key
     * @param keyBytes   消息的 key 序列化后的字节数组
     * @param value      消息的 value
     * @param valueBytes 消息的 value 序列化后的字节数组
     * @param cluster    集群元数据可以查看分区信息
     * @return
     */
    @Override
    public int partition(String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {
        return 1;
    }

    /**
     * 关闭资源
     */
    @Override
    public void close() {

    }

    /**
     * 配置方法
     *
     * @param map
     */
    @Override
    public void configure(Map<String, ?> map) {

    }
}
```

使用自定义分区器

```yaml
spring:
  kafka:
    producer:
      properties:
        # 配置自定义分区器
        partitioner.class: cc.taketo.partitioner.CustomPartitioner
```

### 生产者如何提高吞吐量

```yaml
spring:
  kafka:
    producer:
      # 批次大小，默认 16k，适当增加该值，可以提高吞吐量，但是如果该值设置太大，会导致数据传输延迟增加。
      batch-size: 16384
      # RecordAccumulator 缓冲区总大小，默认 32m
      buffer-memory: 33554432
      # 压缩，默认 none，可配置值 gzip、snappy、lz4和zstd
      compression-type: none
      # 属性配置
      properties:
        # 数据拉取等待时间，生产环境建议该值大小为 5-100ms 之间。
        linger.ms: 0
```

## 数据可靠性

对于生产者发送的数据，我们有的时候是不关心数据是否已经发送成功的，我们只要发送就可以了。在这种场景中，消息可能会因为某些故障或问题导致丢失，我们将这种情况称之为消息不可靠。虽然消息数据可能会丢失，但是在某些需要高吞吐，低可靠的系统场景中，这种方式也是可以接受的，甚至是必须的

而这个确定的过程一般是通过Kafka给我们返回的响应确认结果（Acknowledgement）来决定的，这里的响应确认结果我们也可以简称为ACK应答。根据场景，Kafka提供了3种应答处理，可以通过配置对象进行配置

### 应答级别

- `0`：生产者发送过来的数据，不需要等数据落盘应答
- `1`：生产者发送过来的数据， `Leader` 收到数据后应答。
- `-1(all)`：生产者发送过来的数据，`Leader` 和 `ISR` 队列里面的所有节点收齐数据后应答。

#### ACK = 0

当生产数据时，生产者对象将数据通过网络客户端将数据发送到网络数据流中的时候，Kafka就对当前的数据请求进行了响应（确认应答），如果是同步发送数据，此时就可以发送下一条数据了。如果是异步发送数据，回调方法就会被触发。

![An image](/img/dev/kafka/010.png)

通过图形，明显可以看出，这种应答方式，数据已经走网络给Kafka发送了，但这其实并不能保证Kafka能正确地接收到数据，在传输过程中如果网络出现了问题，那么数据就丢失了。也就是说这种应答确认的方式，数据的可靠性是无法保证的。不过相反，因为无需等待Kafka服务节点的确认，通信效率倒是比较高的，也就是系统吞吐量会非常高。

#### ACK = 1

当生产数据时，Kafka Leader副本将数据接收到并写入到了日志文件后，就会对当前的数据请求进行响应（确认应答），如果是同步发送数据，此时就可以发送下一条数据了。如果是异步发送数据，回调方法就会被触发。

![An image](/img/dev/kafka/011.jpg)

通过图形，可以看出，这种应答方式，数据已经存储到了分区Leader副本中，那么数据相对来讲就比较安全了，也就是可靠性比较高。之所以说相对来讲比较安全，就是因为现在只有一个节点存储了数据，而数据并没有来得及进行备份到follower副本，那么一旦当前存储数据的broker节点出现了故障，数据也依然会丢失。

#### ACK = -1(默认)

当生产数据时，Kafka Leader副本和Follower副本都已经将数据接收到并写入到了日志文件后，再对当前的数据请求进行响应（确认应答），如果是同步发送数据，此时就可以发送下一条数据了。如果是异步发送数据，回调方法就会被触发。

![An image](/img/dev/kafka/012.jpg)

### ISR(in-sync replica set)

`Leader`维护了一个动态的 `in-sync replica set`， 意为和 `Leader` 保持同步的 `Follower+Leader` 集合 `(leader: 0, isr: 0,1,2)`。

如果 `Follower` 长时间未向 `Leader` 发送通信请求或同步数据，则该 `Follower` 将被踢出 `ISR`。 该时间阈值由 `replica.lag.time.max.ms` 参数设定，**默认30s**。

通过图形，可以看出，这种应答方式，数据已经同时存储到了分区Leader副本和follower副本中，那么数据已经非常安全了，可靠性也是最高的。此时，如果Leader副本出现了故障，那么follower副本能够开始起作用，因为数据已经存储了，所以数据不会丢失。

不过这里需要注意，如果假设我们的分区有5个follower副本，编号为1，2，3，4，5

![An image](/img/dev/kafka/013.jpg)

但是此时只有3个副本处于和Leader副本之间处于数据同步状态，那么此时分区就存在一个同步副本列表。此时，Kafka只要保证ISR中所有的4个副本接收到了数据，就可以对数据请求进行响应了。无需5个副本全部收到数据。

![An image](/img/dev/kafka/014.jpg)

**相关配置：**

```yaml
spring:
  kafka:
    producer:
      # 应答级别
      # 0: 生产者发送过来的数据，不需要等数据落盘答。
      # 1: 生产者发送过来的数据， Leader收到数据后答。
      # -1(all): 生产者发送过来的数据，Leader和isr队列里面的所有节点收齐数据后应答。
      acks: -1
      # 重试次数，默认是 int 最大值 2147483647。
      retries: 3
```

**数据完全可靠条件：**

至少一次（At Least Once）= `ACK` 级别设置为 `-1` + 分区副本大于等于 `2` + `ISR` 里应答的最小副本数量大于等于 `2`。

> 数据重复问题：如果 `Leader` 收到数据并同步到 `Follower` 后宕机，还没来得及发送响应 `ack`，则重新选举 `Leader` 后还会发送数据，这时就会出现数据重复的情况。

**可靠性总结：**

- `acks=0`：生产者发送过来数据就不管了，可靠性差， 效率高；
- `acks=1`：生产者发送过来数据 `Leader` 应答，可靠性中等， 效率中等；
- `acks=-1`：生产者发送过来数据 `Leader` 和 `ISR` 队列里面所有 `Follwer` 应答， 可靠性高， 效率低；
- 在生产环境中， `acks=0`，很少使用；`acks=1`，一般用于传输普通日志，允许丢个别数据；`acks=-1`，一般用于传输和钱相关的数据，对可靠性要求比较高的场景。

## 数据去重 & 有序

### 数据重试

由于网络或服务节点的故障，Kafka在传输数据时，可能会导致数据丢失，所以我们才会设置ACK应答机制，尽可能提高数据的可靠性。但其实在某些场景中，数据的丢失并不是真正地丢失，而是“虚假丢失”，比如咱们将ACK应答设置为1，也就是说一旦Leader副本将数据写入文件后，Kafka就可以对请求进行响应了。

![An image](/img/dev/kafka/015.jpg)

此时，如果假设由于网络故障的原因，Kafka并没有成功将ACK应答信息发送给Producer，那么此时对于Producer来讲，以为kafka没有收到数据，所以就会一直等待响应，一旦超过某个时间阈值，就会发生超时错误，也就是说在Kafka Producer眼里，数据已经丢了

![An image](/img/dev/kafka/016.jpg)

所以在这种情况下，kafka Producer会尝试对超时的请求数据进行重试(***\*retry\****)操作。通过重试操作尝试将数据再次发送给Kafka。

![An image](/img/dev/kafka/017.jpg)

如果此时发送成功，那么Kafka就又收到了数据，而这两条数据是一样的，也就是说，导致了数据的重复。

![An image](/img/dev/kafka/018.jpg)

### 数据乱序

数据重试(**retry**)功能除了可能会导致数据重复以外，还可能会导致数据乱序。假设我们需要将编号为1，2，3的三条连续数据发送给Kafka。每条数据会对应于一个连接请求

![An image](/img/dev/kafka/019.jpg)

此时，如果第一个数据的请求出现了故障，而第二个数据和第三个数据的请求正常，那么Broker就收到了第二个数据和第三个数据，并进行了应答。

![An image](/img/dev/kafka/020.jpg)

为了保证数据的可靠性，此时，Kafka Producer会将第一条数据重新放回到缓冲区的第一个。进行重试操作

![An image](/img/dev/kafka/021.jpg)

如果重试成功，Broker收到第一条数据，你会发现。数据的顺序已经被打乱了。

![An image](/img/dev/kafka/022.jpg)

### 数据幂等性

为了解决Kafka传输数据时，所产生的数据重复和乱序问题，Kafka引入了幂等性操作，所谓的幂等性，就是Producer同样的一条数据，无论向Kafka发送多少次，kafka都只会存储一条。注意，这里的同样的一条数据，指的不是内容一致的数据，而是指的不断重试的数据。

默认幂等性是不起作用的，所以如果想要使用幂等性操作，只需要在生产者对象的配置中开启幂等性配置即可

| 配置项                                | 配置值    | 说明                                             |
| ------------------------------------- | --------- | ------------------------------------------------ |
| enable.idempotence                    | true      | 开启幂等性                                       |
| max.in.flight.requests.per.connection | 小于等于5 | 每个连接的在途请求数，不能大于5，取值范围为[1,5] |
| acks                                  | all(-1)   | 确认应答，固定值，不能修改                       |
| retries                               | >0        | 重试次数，推荐使用Int最大值                      |

kafka是如何实现数据的幂等性操作呢，我们这里简单说一下流程：

1. 开启幂等性后，为了保证数据不会重复，那么就需要给每一个请求批次的数据增加唯一性标识，kafka中，这个标识采用的是连续的序列号数字sequencenum，但是不同的生产者Producer可能序列号是一样的，所以仅仅靠seqnum还无法唯一标记数据，所以还需要同时对生产者进行区分，所以Kafka采用申请生产者ID（producerid）的方式对生产者进行区分。这样，在发送数据前，我们就需要提前1申请producerid以及序列号sequencenum

2. Broker中会给每一个分区记录生产者的生产状态：采用队列的方式缓存最近的5个批次数据。队列中的数据按照seqnum进行升序排列。这里的数字5是经过压力测试，均衡空间效率和时间效率所得到的值，所以为固定值，无法配置且不能修改。

   ![An image](/img/dev/kafka/023.jpg)

3. 如果Borker当前新的请求批次数据在缓存的5个旧的批次中存在相同的，如果有相同的，那么说明有重复，当前批次数据不做任何处理。

   ![An image](/img/dev/kafka/024.jpg)

4. 如果Broker当前的请求批次数据在缓存中没有相同的，那么判断当前新的请求批次的序列号是否为缓存的最后一个批次的序列号加1，如果是，说明是连续的，顺序没乱。那么继续，如果不是，那么说明数据已经乱了，发生异常。

   ![An image](/img/dev/kafka/025.jpg)

5. Broker根据异常返回响应，通知Producer进行重试。Producer重试前，需要在缓冲区中将数据重新排序，保证正确的顺序后。再进行重试即可。

6. 如果请求批次不重复，且有序，那么更新缓冲区中的批次数据。将当前的批次放置再队列的结尾，将队列的第一个移除，保证队列中缓冲的数据最多5个。

   ![An image](/img/dev/kafka/026.jpg)

7. 从上面的流程可以看出，Kafka的幂等性是通过消耗时间和性能的方式提升了数据传输的有序和去重，在一些对数据敏感的业务中是十分重要的。但是通过原理，咱们也能明白，这种幂等性还是有缺陷的：

   **幂等性的producer仅做到单分区上的幂等性，即单分区消息有序不重复，多分区无法保证幂等性。**

   只能保持生产者单个会话的幂等性，无法实现跨会话的幂等性，也就是说如果一个producer挂掉再重启，那么重启前和重启后的producer对象会被当成两个独立的生产者，从而获取两个不同的独立的生产者ID，导致broker端无法获取之前的状态信息，所以无法实现跨会话的幂等。要想解决这个问题，可以采用后续的事务功能。

**总结：**

幂等性就是指Producer不论向Broker发送多少次重复数据，Broker端都只会持久化一条， 保证了不重复。

**重复数据的判断标准：**

具有`<PID, Partition, SeqNumber>`相同主键的消息提交时，`Broker` 只会持久化一条。

其中 `PID` 是 `Kafka` 每次重启都会分配一个新的；所以 `kafka` 一旦宕机重启后还会产生重复数据。

其中，`Partition` 表示分区号；`Sequence Number` 是单调自增的。所以幂等性**只能保证的是在单分区单会话内不重复**。

![An image](/img/dev/kafka/027.png)

**开启幂等：**

```yaml
spring:
  kafka:
    producer:
      # 应答级别
      # 0: 生产者发送过来的数据，不需要等数据落盘答。
      # 1: 生产者发送过来的数据， Leader收到数据后答。
      # -1(all): 生产者发送过来的数据，Leader和isr队列里面的所有节点收齐数据后应答。
      acks: -1
      # 重试次数，默认是 int 最大值 2147483647。
      retries: 3
      # 属性配置
      properties:
        # 数据拉取等待时间，生产环境建议该值大小为 5-100ms 之间。
        linger.ms: 0
        # 幂等性，默认为true
        enable.idempotence: true
```

> 开启条件：应答级别设置为 `all`，重试次数大于 `0`。

### 数据事务

对于幂等性的缺陷，kafka可以采用事务的方式解决跨会话的幂等性。基本的原理就是通过事务功能管理生产者ID，保证事务开启后，生产者对象总能获取一致的生产者ID。

为了实现事务，Kafka引入了事务协调器（TransactionCoodinator）负责事务的处理，所有的事务逻辑包括分派PID等都是由TransactionCoodinator负责实施的。TransactionCoodinator 会将事务状态持久化到该主题中。

事务基本的实现思路就是通过配置的事务ID，将生产者ID进行绑定，然后存储在Kafka专门管理事务的内部主题 **__transaction_state** 中，而内部主题的操作是由事务协调器（TransactionCoodinator）对象完成的，这个协调器对象有点类似于咱们数据发送时的那个副本Leader。其实这种设计是很巧妙的，因为kafka将事务ID和生产者ID看成了消息数据，然后将数据发送到一个内部主题中。这样，使用事务处理的流程和咱们自己发送数据的流程是很像的。接下来，我们就把这两个流程简单做一个对比。

**普通数据发送流程：**

![An image](/img/dev/kafka/028.png)

**事务数据发送流程：**

![An image](/img/dev/kafka/029.png)

通过两张图大家可以看到，基本的事务操作和数据操作是很像的，不过要注意，我们这里只是简单对比了数据发送的过程，其实它们的区别还在于数据发送后的提交过程。普通的数据操作，只要数据写入了日志，那么对于消费者来讲。数据就可以读取到了，但是事务操作中，如果数据写入了日志，但是没有提交的话，其实数据默认情况下也是不能被消费者看到的。只有提交后才能看见数据。

**事务提交流程：**

Kafka中的事务是分布式事务，所以采用的也是 **二阶段提交**

第一个阶段提交事务协调器会告诉生产者事务已经提交了，所以也称之预提交操作，事务协调器会修改事务为预提交状态

![An image](/img/dev/kafka/030.jpg)

第二个阶段提交事务协调器会向分区Leader节点中发送数据标记，通知Broker事务已经提交，然后事务协调器会修改事务为完成提交状态

![An image](/img/dev/kafka/031.jpg)

特殊情况下，事务已经提交成功，但还是读取不到数据，那是因为当前提交成功只是一阶段提交成功，事务协调器会继续向各个Partition发送marker信息，此操作会无限重试，直至成功。

但是不同的Broker可能无法全部同时接收到marker信息，此时有的Broker上的数据还是无法访问，这也是正常的，因为kafka的事务不能保证强一致性，只能保证最终数据的一致性，无法保证中间的数据是一致的。不过对于常规的场景这里已经够用了，事务协调器会不遗余力的重试，直至成功。

**事务原理：**

前提条件：开启事务， 必须开启幂等性。

`Producer` 在使用事务功能前，必须先自定义一个唯一的 `transactional.id`。 有了 `transactional.id`，即使客户端挂掉了，它重启后也能继续处理未完成的事务。

![An image](/img/dev/kafka/032.png)

**开启事务：**

```yaml
spring:
  kafka:
    producer:
      # 应答级别
      # 0: 生产者发送过来的数据，不需要等数据落盘答。
      # 1: 生产者发送过来的数据， Leader收到数据后答。
      # -1(all): 生产者发送过来的数据，Leader和isr队列里面的所有节点收齐数据后应答。
      acks: -1
      # 重试次数，默认是 int 最大值 2147483647。
      retries: 3
      # 事务ID
      transaction-id-prefix: tx-
      # 属性配置
      properties:
        # 数据拉取等待时间，生产环境建议该值大小为 5-100ms 之间。
        linger.ms: 0
        # 幂等性，默认为true
        enable.idempotence: true
```

**spring-kafka：**

```java
        kafkaTemplate.executeInTransaction((producer) -> {

            // 发送消息
            producer.send("test", "test-key", "test-message");

            // 抛出异常，触发事务回滚
            throw new RuntimeException("test transaction exception");
        });
```

## 数据传输语义

| 传输语义      | 说明                                                         | 例子                   |
| ------------- | ------------------------------------------------------------ | ---------------------- |
| at most once  | **最多一次**：不管是否能接收到，数据最多只传一次。这样数据可能会丢失， | Socket， ACK = 0       |
| at least once | **最少一次**：消息不会丢失，如果接收不到，那么就继续发，所以会发送多次，直到收到为止，有可能出现数据重复 | ACK = 1                |
| Exactly once  | **精准一次**：消息只会一次，不会丢，也不会重复。             | 幂等 + 事务 + ACK = -1 |
