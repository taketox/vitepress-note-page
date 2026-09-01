# 消费消息

数据已经存储到了Kafka的数据文件中，接下来应用程序就可以使用Kafka Consumer API 向Kafka订阅主题，并从订阅的主题上接收消息了。

## 消费消息的步骤

1. 建Map类型的配置对象，根据场景增加相应的配置属性

   | 参数名                          | 参数作用                                                     | 类型 | 默认值           | 推荐值                                        |
   | ------------------------------- | ------------------------------------------------------------ | ---- | ---------------- | --------------------------------------------- |
   | `bootstrap.servers`             | 集群地址，格式为：brokerIP1:端口号,brokerIP2:端口号          | 必须 |                  |                                               |
   | `key.deserializer`              | 对数据Key进行反序列化的类完整名称                            | 必须 |                  | Kafka提供的字符串反序列化类：StringSerializer |
   | `value.deserializer`            | 对数据Value进行反序列化的类完整名称                          | 必须 |                  | Kafka提供的字符串反序列化类：ValueSerializer  |
   | `group.id`                      | 消费者组ID，用于标识完整的消费场景，一个组中可以包含多个不同的消费者对象。 | 必须 |                  |                                               |
   | `auto.offset.reset`             |                                                              |      |                  |                                               |
   | `group.instance.id`             | 消费者实例ID，如果指定，那么在消费者组中使用此ID作为memberId前缀 | 可选 |                  |                                               |
   | `partition.assignment.strategy` | 分区分配策略                                                 | 可选 |                  |                                               |
   | `enable.auto.commit`            | 启用偏移量自动提交                                           | 可选 | true             |                                               |
   | `auto.commit.interval.ms`       | 自动提交周期                                                 | 可选 | 5000ms           |                                               |
   | `fetch.max.bytes`               | 消费者获取服务器端一批消息最大的字节数。如果服务器端一批次的数据大于该值（50m）仍然可以拉取回来这批数据，因此，这不是一个绝对最大值。一批次的大小受message.max.bytes （broker config）or max.message.bytes （topic config）影响 | 可选 | 52428800（50 m） |                                               |
   | `offsets.topic.num.partitions`  | 偏移量消费主题分区数                                         | 可选 | 50               |                                               |

2. 创建消费者对象

   根据配置创建消费者对象KafkaConsumer，向Kafka订阅（subscribe）主题消息，并向Kafka发送请求（poll）获取数据。

3. Kafka会根据消费者发送的参数，返回数据对象ConsumerRecord。返回的数据对象中包括指定的数据。

   | 数据项        | 数据含义   |
   | ------------- | ---------- |
   | **topic**     | 主题名称   |
   | **partition** | 分区号     |
   | **offset**    | 偏移量     |
   | **timestamp** | 数据时间戳 |
   | **key**       | 数据key    |
   | **value**     | 数据value  |

4. 关闭消费者

   消费者消费完数据后，需要将对象关闭用以释放资源。一般情况下，消费者无需关闭。

## 消费消息的原理

从数据处理的角度来讲，消费者和生产者的处理逻辑都相对比较简单。

Producer生产者的基本数据处理逻辑就是向Kafka发送数据，并获取Kafka的数据接收确认响应。

![An image](/img/dev/kafka/058.jpg)

而消费者的基本数据处理逻辑就是向Kafka请求数据，并获取Kafka返回的数据。

![An image](/img/dev/kafka/059.jpg)

逻辑确实很简单，但是Kafka为了能够构建高吞吐，高可靠性，高并发的分布式消息传输系统，所以在很多细节上进行了扩展和改善：比如生产者可以指定分区，可以异步和同步发送数据，可以进行幂等性操作和事务处理。对应的，消费者功能和处理细节也进行了扩展和改善。

## 消费者组

### 消费数据的方式

Kafka的主题如果就一个分区的话，那么在硬件配置相同的情况下，消费者Consumer消费主题数据的方式没有什么太大的差别。

![An image](/img/dev/kafka/060.jpg)

不过，Kafka为了能够构建高吞吐，高可靠性，高并发的分布式消息传输系统，它的主题是**允许多个分区**的，那么就会发现不同的消费数据的方式区别还是很大的。

1. 如果数据由Kafka进行**推送（push）**，那么多个分区的数据同时推送给消费者进行处理，明显一个消费者的消费能力是有限的，那么消费者无法快速处理数据，就会导致数据的积压，从而导致网络，存储等资源造成极大的压力，影响吞吐量和数据传输效率。

   ![An image](/img/dev/kafka/061.jpg)

2. 如果kafka的分区数据在内部可以存储的时间更长一些，再由消费者根据自己的消费能力向kafka**申请（拉取）数据**，那么整个数据处理的通道就会更顺畅一些。Kafka的Consumer就采用的这种拉取数据的方式。

   ![An image](/img/dev/kafka/062.jpg)

### Consumer Group

消费者可以根据自身的消费能力主动拉取Kafka的数据，但是毕竟自身的消费能力有限，如果主题分区的数据过多，那么消费的时间就会很长。对于kafka来讲，数据就需要长时间的进行存储，那么对Kafka集群资源的压力就非常大。

如果希望提高消费者的消费能力，并且减少kafka集群的存储资源压力。所以有必要对消费者进行横向伸缩，从而提高消息消费速率。

![An image](/img/dev/kafka/063.jpg)

不过这么做有一个问题，就是每一个消费者是独立，那么一个消费者就不能消费主题中的全部数据，简单来讲，就是对于某一个消费者个体来讲，主题中的部分数据是没有消费到的，也就会认为数据丢了，这个该如何解决呢？那如果我们将这多个消费者当成一个整体，是不是就可以了呢？这就是所谓的**消费者组 Consumer Group**。在kafka中，每个消费者都对应一个消费组，消费者可以是一个线程，一个进程，一个服务实例，如果kafka想要消费消息，那么需要**指定消费那个topic的消息以及自己的消费组id(groupId)**。

![An image](/img/dev/kafka/064.jpg)

## 调度（协调）器

消费者想要拉取数据，首先必须要加入到一个组中，成为消费组中的一员，同样道理，如果消费者出现了问题，也应该从消费者组中剥离。而这种加入组和退出组的处理，都应该由专门的管理组件进行处理，这个组件在kafka中，我们称之为**消费者组调度器（协调）**（Group Coordinator）

Group Coordinator是Broker上的一个组件，用于**管理和调度消费者组的成员、状态、分区分配、偏移量等**信息。每个Broker都有一个Group Coordinator对象，负责管理多个消费者组，但每个**消费者组只有一个**Group Coordinator。

![An image](/img/dev/kafka/065.jpg)

## 消费者分配策略

消费者想要拉取主题分区的数据，首先**必须要加入到一个组**中。

![An image](/img/dev/kafka/066.jpg)

但是一个组中有多个消费者的话，那么每一个消费者该如何消费呢，是不是像图中一样的消费策略呢？如果是的话，那假设消费者组中只有2个消费者或有4个消费者，和分区的数量不匹配，怎么办？所以这里，我们需要给大家介绍一下，Kafka中基本的消费者组中的消费者和分区之间的分配规则：

- 同一个消费者组的消费者都订阅同一个主题，所以消费者组中的多个消费者可以共同消费一个主题中的所有数据。

- 为了避免数据被重复消费，所以主题一个分区的数据只能被组中的一个消费者消费，也就是说不能两个消费者同时消费一个分区的数据。但是反过来，一个消费者是可以消费多个分区数据的。

  ![An image](/img/dev/kafka/067.jpg)

- 消费者组中的消费者数量最好不要超出主题分区的数据，就会导致多出的消费者是无法消费数据的，造成了资源的浪费。

  ![An image](/img/dev/kafka/068.jpg)

消费者中的每个消费者到底消费哪一个主题分区，这个分配策略其实是由消费者的Leader决定的，这个Leader我们称之为群主。群主是多个消费者中，第一个加入组中的消费者，其他消费者我们称之为Follower，称呼上有点类似与分区的Leader和Follower。

![An image](/img/dev/kafka/069.jpg)

当消费者加入群组的时候，会发送一个`JoinGroup`请求。群主负责给每一个消费者分配分区。

每个消费者只知道自己的分配信息，只有群主知道群组内所有消费者的分配信息。

### 指定分配策略的流程

1. 第一个消费者设定group.id为test，向当前负载最小的节点发送请求查找消费调度器

   ![An image](/img/dev/kafka/070.jpg)

2. 找到消费调度器后，消费者向调度器节点发出JOIN_GROUP请求，加入消费者组。

   ![An image](/img/dev/kafka/071.jpg)

3. 当前消费者当选为群主后，根据消费者配置中分配策略设计分区分配方案，并将分配好的方案告知调度器

   ![An image](/img/dev/kafka/072.jpg)

4. 此时第二个消费者设定group.id为test，申请加入消费者组

   ![An image](/img/dev/kafka/073.jpg)

5. 加入成功后，kafka将消费者组状态切换到准备rebalance，关闭和消费者的所有链接，等待它们重新加入。客户端重新申请加入，kafka从消费者组中挑选一个作为leader，其它的作为follower。（**步骤和之前相同，我们假设还是之前的消费者为Leader**）

   ![An image](/img/dev/kafka/074.jpg)

6. Leader会按照分配策略对分区进行重分配，并将方案发送给调度器，由调度器通知所有的成员新的分配方案。组成员会按照新的方案重新消费数据

   ![An image](/img/dev/kafka/075.jpg)

### 分区分配策略

Kafka提供的分区分配策略常用的有4个：

#### RoundRobinAssignor（轮询分配策略）

每个消费者组中的消费者都会含有一个自动生产的UUID作为memberid。

![An image](/img/dev/kafka/076.jpg)

轮询策略中会将每个消费者按照memberid进行排序，所有member消费的主题分区根据主题名称进行排序。

![An image](/img/dev/kafka/077.jpg)

将主题分区轮询分配给对应的订阅用户，注意未订阅当前轮询主题的消费者会跳过。

![An image](/img/dev/kafka/078.jpg)

![An image](/img/dev/kafka/079.jpg)

从图中可以看出，轮询分配策略是存在缺点的，并不是那么的均衡，如果test1-2分区能够分配给消费者ccc是不是就完美了。

#### RangeAssignor（范围分配策略）

按照每个topic的partition数计算出每个消费者应该分配的分区数量，然后分配，分配的原则就是一个主题的分区尽可能的平均分，如果不能平均分，那就按顺序向前补齐即可。

```sh
# numPartitionsPerConsumer = consumers.isEmpty() ? 0 : partitionInfos.size() / consumers.size();
# remainingConsumersWithExtraPartition = consumers.isEmpty() ? 0 : partitionInfos.size() % consumers.size();
# 所谓按顺序向前补齐就是：
假设【1,2,3,4,5】5个分区分给2个消费者：
5 / 2 = 2, 5 % 2 = 1 => 剩余的一个补在第一个中[2+1][2] => 结果为[1,2,3][4,5]

假设【1,2,3,4,5】5个分区分到3个消费者:
5 / 3 = 1, 5 % 3 = 2 => 剩余的两个补在第一个和第二个中[1+1][1+1][1] => 结果为[1,2][3,4][5] 
```

![An image](/img/dev/kafka/080.jpg)

**缺点**：Range分配策略针对单个Topic的情况下显得比较均衡，但是假如Topic多的话, member排序靠前的可能会比member排序靠后的负载多很多。是不是也不够理想。

![An image](/img/dev/kafka/081.jpg)

还有就是如果新增或移除消费者成员，那么会导致每个消费者都需要去建立新的分区节点的连接，更新本地的分区缓存，效率比较低。

![An image](/img/dev/kafka/082.jpg)

#### StickyAssignor（粘性分区）

在第一次分配后，每个组成员都保留分配给自己的分区信息。如果有消费者加入或退出，那么在进行分区再分配时（一般情况下，消费者退出45s后，才会进行再分配，因为需要考虑可能又恢复的情况），尽可能保证消费者原有的分区不变，重新对加入或退出消费者的分区进行分配。

![An image](/img/dev/kafka/083.jpg)

![An image](/img/dev/kafka/084.jpg)

从图中可以看出，粘性分区分配策略分配的会更加均匀和高效一些。

#### CooperativeStickyAssignor

前面的三种分配策略再进行重分配时使用的是EAGER协议，会让当前的所有消费者放弃当前分区，关闭连接，资源清理，重新加入组和等待分配策略。明显效率是比较低的，所以从 `Kafka2.4` 版本开始，在粘性分配策略的基础上，优化了重分配的过程，使用的是COOPERATIVE协议，特点就是在整个再分配的过程中从图中可以看出，粘性分区分配策略分配的会更加均匀和高效一些，COOPERATIVE协议将一次全局重平衡，改成每次小规模重平衡，直至最终收敛平衡的过程。

Kafka消费者默认的分区分配就是`RangeAssignor`，`CooperativeStickyAssignor`

## 偏移量offset

偏移量offset是消费者消费数据的一个非常重要的属性。默认情况下，消费者如果不指定消费主题数据的偏移量，那么消费者启动消费时，无论当前主题之前存储了多少历史数据，消费者只能从连接成功后当前主题最新的数据偏移位置读取，而无法读取之前的任何数据，如果想要获取之前的数据，就需要设定配置参数或指定数据偏移量。

### 起始偏移量

在消费者的配置中，我们可以增加偏移量相关参数`auto.offset.reset`，用于从最开始获取主题数据，

```yaml
spring:
  kafka:
    # 消费者
    consumer:
      # 若Kafka中没有偏移量，处理策略
      # earliest: 自动重置偏移量为最早的偏移量
      # latest: 自动重置偏移量为最新的偏移量（默认）
      # none: 抛出异常
      auto-offset-reset: earliest
```

**参数取值有3个：**

1. **earliest**：对于同一个消费者组，从头开始消费。就是说如果这个topic有历史消息存在，现在新启动了一个消费者组，且`auto.offset.reset=earliest`，那将会从头开始消费（未提交偏移量的场合）。

   ![An image](/img/dev/kafka/085.jpg)

2. **latest**：对于同一个消费者组，消费者只能消费到连接topic后，新产生的数据（未提交偏移量的场合）。

   ![An image](/img/dev/kafka/086.jpg)

3. **none**：生产环境不使用

### 指定偏移量消费

除了从最开始的偏移量或最后的偏移量读取数据以外，Kafka还支持从指定的偏移量的位置开始消费数据。

```java
@Slf4j
@Service
public class KafkaSpecificConsumerService {

    @Resource
    private ConsumerFactory<String, String> consumerFactory; // 注入 Kafka 消费者工厂

    /**
     * 从指定分区和偏移量开始消费消息
     *
     * @param topic     主题名称
     * @param partition 分区编号
     * @param offset    偏移量
     */
    public void consumeFromSpecificOffset(String topic, int partition, long offset) {
        // 创建 Kafka 消费者实例
        KafkaConsumer<String, String> consumer = (KafkaConsumer<String, String>) consumerFactory.createConsumer();

        // 指定要消费的分区
        TopicPartition topicPartition = new TopicPartition(topic, partition);
        consumer.assign(Collections.singletonList(topicPartition));

        // 将消费者定位到指定的偏移量
        consumer.seek(topicPartition, offset);

        // 持续消费消息
        while (true) {
            consumer.poll(Duration.ofMillis(100)).forEach(record -> {
                log.info("Consumed message: key = {}, value = {}, partition = {}, offset = {}",
                        record.key(), record.value(), record.partition(), record.offset());
            });
        }
    }

    /**
     * 从指定分区和时间戳开始消费消息
     *
     * @param topic     主题名称
     * @param partition 分区编号
     * @param timestamp 时间戳（毫秒）
     */
    public void consumeFromSpecificTimestamp(String topic, int partition, long timestamp) {
        // 创建 Kafka 消费者实例
        KafkaConsumer<String, String> consumer = (KafkaConsumer<String, String>) consumerFactory.createConsumer();

        // 指定要消费的分区
        TopicPartition topicPartition = new TopicPartition(topic, partition);
        consumer.assign(Collections.singletonList(topicPartition));

        // 构建时间戳与分区的映射
        Map<TopicPartition, Long> timestampsToSearch = new HashMap<>();
        timestampsToSearch.put(topicPartition, timestamp);

        // 根据时间戳查找对应的偏移量
        Map<TopicPartition, OffsetAndTimestamp> offsetsForTimes = consumer.offsetsForTimes(timestampsToSearch);
        OffsetAndTimestamp offsetAndTimestamp = offsetsForTimes.get(topicPartition);

        // 如果找到对应的偏移量，则将消费者定位到该偏移量
        if (offsetAndTimestamp != null) {
            consumer.seek(topicPartition, offsetAndTimestamp.offset());
        }

        // 持续消费消息
        while (true) {
            consumer.poll(Duration.ofMillis(100)).forEach(record -> {
                System.out.printf("Consumed message: key = %s, value = %s, partition = %d, offset = %d%n",
                        record.key(), record.value(), record.partition(), record.offset());
            });
        }
    }
}
```

测试类：

```java
@SpringBootTest(classes = MessageKafkaApplication.class)
public class KafkaConsumerTest {

    @Resource
    private KafkaSpecificConsumerService kafkaSpecificConsumerService;

    @Test
    public void fromSpecificOffset() {
        // 从指定偏移量开始消费
        kafkaSpecificConsumerService.consumeFromSpecificOffset("test", 0, 10);
    }

    @Test
    public void fromSpecificTimestamp() {
        // 从指定时间戳开始消费
        long timestamp = Instant.now().minusSeconds(3600).toEpochMilli(); // 1小时前的时间戳
        kafkaSpecificConsumerService.consumeFromSpecificTimestamp("test", 0, timestamp);
    }
}
```

### 偏移量提交

生产环境中，消费者可能因为某些原因或故障重新启动消费，那么如果不知道之前消费数据的位置，重启后再消费，就可能重复消费（earliest）或漏消费（latest）。所以Kafka提供了保存消费者偏移量的功能，而这个功能需要由消费者进行提交操作。这样消费者重启后就可以根据之前提交的偏移量进行消费了。注意，一旦消费者提交了偏移量，那么kafka会优先使用提交的偏移量进行消费。此时，`auto.offset.reset`参数是不起作用的。

#### 自动提交

所谓的自动提交就是消费者消费完数据后，无需告知kafka当前消费数据的偏移量，而是由消费者客户端API周期性地将消费的偏移量提交到Kafka中。这个周期默认为`5000ms`，可以通过配置进行修改。

```yaml
spring:
  kafka:
    # 消费者
    consumer:
      # 是否自动提交偏移量
      enable-auto-commit: true
      # 自动提交的间隔时间，默认5000ms
      auto-commit-interval: 1000
```

#### 手动提交

基于时间周期的偏移量提交，是我们无法控制的，一旦参数设置的不合理，或单位时间内数据量消费的很多，却没有来及的自动提交，那么数据就会重复消费。所以Kafka也支持消费偏移量的手动提交，也就是说当消费者消费完数据后，自行通过API进行提交。不过为了考虑效率和安全，kafka同时提供了异步提交和同步提交两种方式供我们选择。注意：需要禁用自动提交`auto.offset.reset=false`，才能开启手动提交

```yaml
spring:
  kafka:
    # 消费者
    consumer:
      # 是否自动提交偏移量
      enable-auto-commit: false
```

**同步提交**：必须等待Kafka完成offset提交请求的响应后，才可以消费下一批数据，一旦提交失败，会进行重试处理，尽可能保证偏移量提交成功，但是依然可能因为以外情况导致提交请求失败。此种方式消费效率比较低，但是安全性高。

```java
@Component
@Slf4j
public class SimpleConsumer {

    @KafkaListener(topics = {"test"})
    public void onMessage(ConsumerRecord<?, ?> record, Acknowledgment acknowledgment) {
        try {
            // 处理消息
            // 消费的哪个topic、partition的消息,打印出消息内容
            log.info("简单消费，同步提交 => 主题: {}, 分区: {}, 消息: {}, Leader: {}, Offset: {}",
                    record.topic(),
                    record.partition(),
                    record.value(),
                    record.leaderEpoch(),
                    record.offset());

            // 手动同步提交偏移量
            // 此处需要注意，需要在拉取数据完成处理后再提交
            // 否则提前提交了，但数据处理失败，下一次消费数据就拉取不到了
            acknowledgment.acknowledge();
        } catch (Exception e) {
            // 处理异常，可以选择不提交偏移量
            log.error("Error processing message: " + e.getMessage());
        }
    }

}
```

**异步提交**：向Kafka发送偏移量offset提交请求后，就可以直接消费下一批数据，因为无需等待kafka的提交确认，所以无法知道当前的偏移量一定提交成功，所以安全性比较低，但相对，消费性能会提高

```java
// spring-kafka 没有封装好的异步提交位移的方法，手动实现

    // 线程池
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    private void asyncAcknowledge(Acknowledgment ack) {
        // 使用 CompletableFuture 异步提交偏移量
        CompletableFuture.runAsync(() -> {
            try {
                ack.acknowledge(); // 提交偏移量
                log.info("偏移量已异步提交");
            } catch (Exception e) {
                log.error("异步提交偏移量失败: " + e.getMessage());
            }
        }, executorService);
    }
```

## 消费者事务

无论偏移量使用自动提交还是，手动提交，特殊场景中数据都有可能会出现重复消费。

![An image](/img/dev/kafka/087.jpg)

如果提前提交偏移量，再处理业务，又可能出现数据丢失的情况。

![An image](/img/dev/kafka/088.jpg)

对于单独的Consumer来讲，事务保证会比较弱，尤其是无法保证提交的信息被精确消费，主要原因就是消费者可以通过偏移量访问信息，而不同的数据文件生命周期不同，同一事务的信息可能会因为重启导致被删除的情况。所以一般情况下，想要完成kafka消费者端的事务处理，需要将数据消费过程和偏移量提交过程进行原子性绑定，也就是说数据处理完了，必须要保证偏移量正确提交，才可以做下一步的操作，如果偏移量提交失败，那么数据就恢复成处理之前的效果。

对于生产者事务而言，消费者消费的数据也会受到限制。默认情况下，消费者只能消费到生产者提交的数据，也就是未提交完成的数据，消费者是看不到的。如果想要消费到未提交的数据，需要更高消费事务隔离级别

```yaml
spring:
  kafka:
    # 消费者
    consumer:
      # 消费者事务隔离基本
      # READ_UNCOMMITTED：消费者可以读取所有消息，包括未提交的事务消息。（默认）
      # READ_COMMITTED：消费者只能读取提交了的事务消息。
      # 默认的 READ_UNCOMMITTED 模式适用于对数据一致性要求不高的场景。
      isolation-level: read_committed
```

## 偏移量的保存

由于消费者在消费消息的时候可能会由于各种原因而断开消费，当重新启动消费者时我们需要让它接着上次消费的位置offset继续消费，因此消费者需要实时的记录自己以及消费的位置。

0.90版本之前，这个信息是记录在zookeeper内的，在0.90之后的版本，offset保存在`__consumer_offsets`这个topic内。

每个consumer会定期将自己消费分区的offset提交给**kafka内部topic**：`__consumer_offsets`，提交过去的时候，key是`consumerGroupId+topic+分区号`

value就是当前offset的值，kafka会定期清理topic里的消息，最后就保留最新的那条数据。

因为 `__consumer_offsets` 可能会接收高并发的请求，kafka默认给其分配50个分区(可以通过 `offsets.topic.num.partitions` 设置)，均匀分配到Kafka集群的多个Broker中。Kafka采用 `hash(consumerGroupId) % __consumer_offsets主题的分区数` 来计算我们的偏移量提交到哪一个分区。因为偏移量也是保存到主题中的，所以保存的过程和生产者生产数据的过程基本相同。

```properties
# 在 server.properties 文件中添加或修改以下配置：
offsets.topic.num.partitions=100
```

## 消费数据

消费者消费数据时，一般情况下，只是设定了订阅的主题名称，那是如何消费到数据的呢。我们这里说一下服务端拉取数据的基本流程。

![An image](/img/dev/kafka/089.jpg)

1. 服务端获取到用户拉取数据的请求

   Kafka消费客户端会向Broker发送拉取数据的请求`FetchRequest`，服务端Broker获取到请求后根据请求标记FETCH交给应用处理接口`KafkaApis`进行处理。

2. 通过副本管理器拉取数据

   副本管理器需要确定当前拉取数据的分区，然后进行数据的读取操作

3. 判定首选副本

   2.4版本前，数据读写的分区都是Leader分区，从2.4版本后，kafka支持Follower副本进行读取。主要原因就是跨机房或者说跨数据中心的场景，为了节约流量资源，可以从当前机房或数据中心的副本中获取数据。这个副本称之未首选副本。

4. 拉取分区数据

   Kafka的底层读取数据是采用日志段`LogSegment`对象进行操作的。

5. 零拷贝

   为了提高数据读取效率，Kafka的底层采用`nio`提供的`FileChannel`零拷贝技术，直接从操作系统内核中进行数据传输，提高数据拉取的效率。
