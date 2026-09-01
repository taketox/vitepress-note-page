# 环境搭建

## 快速启动

### 单机多节点

这里直接使用 `docker` 快速启动。

```yaml
version: "3.8"

x-kafka: &kafka
  image: bitnami/kafka:3.6
  user: root
  networks:
    - kafka-net

services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - 8080:8080
    environment:
      - KAFKA_CLUSTERS_0_NAME=kafkaCluster
      # 改为本地ip
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=127.0.0.1:9090,127.0.0.1:9091,127.0.0.1:9092
      - DYNAMIC_CONFIG_ENABLED=true
    networks:
      - kafka-net
    depends_on:
      - kafka-0
      - kafka-1
      - kafka-2

  kafka-0:
    <<: *kafka
    container_name: kafka-0
    ports:
      - "9090:9092"
    environment:
      # KRaft settings
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-0:9093,1@kafka-1:9093,2@kafka-2:9093
      - KAFKA_KRAFT_CLUSTER_ID=abcdefghijklmnopqrstuv
      # Listeners
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      # Clustering
      - KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=2
    volumes:
      - ./kafka_0_data:/bitnami/kafka

  kafka-1:
    <<: *kafka
    container_name: kafka-1
    ports:
      - "9091:9092"
    environment:
      # KRaft settings
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-0:9093,1@kafka-1:9093,2@kafka-2:9093
      - KAFKA_KRAFT_CLUSTER_ID=abcdefghijklmnopqrstuv
      # Listeners
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      # Clustering
      - KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=2
    volumes:
      - ./kafka_1_data:/bitnami/kafka

  kafka-2:
    <<: *kafka
    container_name: kafka-2
    ports:
      - "9092:9092"
    environment:
      # KRaft settings
      - KAFKA_CFG_NODE_ID=2
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-0:9093,1@kafka-1:9093,2@kafka-2:9093
      - KAFKA_KRAFT_CLUSTER_ID=abcdefghijklmnopqrstuv
      # Listeners
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      # Clustering
      - KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=3
      - KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=2
    volumes:
      - ./kafka_2_data:/bitnami/kafka

networks:
  kafka-net:
```

### 多机多节点

#### broker

```yaml
version: "3.8"

services:
  kafka:
    image: bitnami/kafka:3.8
    container_name: kafka
    user: root
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
    # KRaft settings
      # 节点id, 每个节点必须不同
      - KAFKA_CFG_NODE_ID=0
      # 节点角色
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      # 集群id
      - KAFKA_KRAFT_CLUSTER_ID=taketo.cc
      # 当一个新的消费者加入到一个空的消费组时，协调者（Coordinator）将延迟多长时间再开始重新平衡（Rebalance）的过程，以等待更多的消费者加入
      - KAFKA_CFG_GROUP_INITIAL_REBALANCE_DELAY_MS=0
      # 添加集群节点
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@${BROKER_IP}:9093,1@${CONTROLLER1_IP}:9093,2@${CONTROLLER2_IP}:9093
    # Listeners
      # 节点监听的 ip 和端口，并且标记为 broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      # 广播地址
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://${SERVER_IP}:9092
      # 定义不同监听器使用的加密协议
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      # 监听器的名称
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      # 集群中 broker 之间通信所使用的监听器名称
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
    volumes:
      - ./kafka_data:/bitnami/kafka
```

#### controller1

```yaml
version: "3.8"

services:
  kafka:
    image: bitnami/kafka:3.8
    container_name: kafka
    user: root
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
    # KRaft settings
      # 节点id, 每个节点必须不同
      - KAFKA_CFG_NODE_ID=1
      # 节点角色
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      # 集群id
      - KAFKA_KRAFT_CLUSTER_ID=taketo.cc
      # 当一个新的消费者加入到一个空的消费组时，协调者（Coordinator）将延迟多长时间再开始重新平衡（Rebalance）的过程，以等待更多的消费者加入
      - KAFKA_CFG_GROUP_INITIAL_REBALANCE_DELAY_MS=0
      # 添加集群节点
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@${BROKER_IP}:9093,1@${CONTROLLER1_IP}:9093,2@${CONTROLLER2_IP}:9093
    # Listeners
      # 节点监听的 ip 和端口，并且标记为 broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      # 广播地址
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://${SERVER_IP}:9092
      # 定义不同监听器使用的加密协议
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      # 控制器（Controller）用于接收来自其他控制器节点和 broker 节点请求的监听器（Listener）的名称
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      # 集群中 broker 之间通信所使用的监听器名称
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
    volumes:
      - ./kafka_data:/bitnami/kafka
```

#### controller2

```yaml
version: "3.8"

services:
  kafka:
    image: bitnami/kafka:3.8
    container_name: kafka
    user: root
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
    # KRaft settings
      # 节点id, 每个节点必须不同
      - KAFKA_CFG_NODE_ID=2
      # 节点角色
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      # 集群id
      - KAFKA_KRAFT_CLUSTER_ID=taketo.cc
      # 当一个新的消费者加入到一个空的消费组时，协调者（Coordinator）将延迟多长时间再开始重新平衡（Rebalance）的过程，以等待更多的消费者加入
      - KAFKA_CFG_GROUP_INITIAL_REBALANCE_DELAY_MS=0
      # 添加集群节点
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@${BROKER_IP}:9093,1@${CONTROLLER1_IP}:9093,2@${CONTROLLER2_IP}:9093
    # Listeners
      # 节点监听的 ip 和端口，并且标记为 broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      # 广播地址
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://${SERVER_IP}:9092
      # 定义不同监听器使用的加密协议
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      # 控制器（Controller）用于接收来自其他控制器节点和 broker 节点请求的监听器（Listener）的名称
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      # 集群中 broker 之间通信所使用的监听器名称
      - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT
    volumes:
      - ./kafka_data:/bitnami/kafka
```

#### env

```tex
BROKER_IP=
CONTROLLER1_IP=
CONTROLLER2_IP=
SERVER_IP=
```

### kafka-ui

```yaml
version: "3.8"

services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - 9090:8080
    environment:
      - KAFKA_CLUSTERS_0_NAME=kafkaCluster
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=ip:9092,ip:9092,ip:9092
      - DYNAMIC_CONFIG_ENABLED=true
```

### 关于LISTENERS和ADVERTISED_LISTENERS配置项

#### 概念理解

要搞清楚这些问题，首先得搞清楚两个逻辑概念：**kafka的侦听ip**，**kafka的broker ip**。

**kafka的侦听ip**：顾名思义，就是 `tcp` 的侦听 `ip`。可以在某个固定的 `ip` 上侦听，也可以是全网段进行侦听（0.0.0.0）。如果是在某个固定 `ip` 上侦听，例如“127.0.0.1”，那么只有与该 `ip` 正确连接的客户端能成功连接到 `kafka`；而如果是全网段侦听，那么可以与 `kafka` 所在机器的任意 `ip` 进行连接并访问 `kafka`。

但与 `kafka` 连接成功后，并不意味着就能成功进行生产和消费。

成功连接 `kafka` 的侦听 `ip`，意味着 `tcp` 的三次握手已经成功了，在这之后会进行 `kafka` 层面的协议交互，例如用户登录认证，元数据信息获取，向topic生产，消费等。**其中最重要的就是元数据信息的获取**。

`kafka` 的元数据信息包括 `topic` 的名称，`topic` 的分区（partition），每个分区的 `leader` 所在的 `broker` 的ID，以及每个 `broker` 的 `ip` 地址等。

由于向 `topic` 的分区进行生产消费，最终都要和分区的 `leader` 进行交互。因此，获取到元数据信息后，客户端（生产者或消费者）会和 `topic` 分区的 `leader` 所在的 `broker` 建立新的 `tcp` 连接以进行后续的生产消费。这就是 `kafka` 的 `broker ip` 的作用，即真正用于生产消费的 `ip` 地址。

#### 配置理解

理解了上述两个概念后，再来看 `listeners` 和 `advertised.listeners` 两个配置项，应该就很容易理解了。

`listeners` 配置的是 **kafka的tcp侦听ip地址**；`advertised.listeners` 配置的是 **kafka的broker ip**。

在没有配置 `advertised.listeners` 的情况下，默认取值为 `kafka` 所在机器的主机名，端口与 `listeners` 中配置的端口一致。也就是`kafka` 的 `broker ip` 是 `kafka` 所在机器的主机名。很多情况下，与 `kafka` 连接成功但无法正确生产消费的原因就是 `kafka` 的主机名无法被正确解析，最常见的就是 `kafka` 的主机名为 `localhost`。

另外，`kafka` 成功注册 `zookeeper` 后，会将 `broker ip` 写入到 `kafka` 中。这样 `kafka` 集群中的每个节点都能知道其他所有节点的`broker ip`。因此，`kafka` 的客户端无论连接到集群的哪个节点上，都能正确获取到整个集群的元数据信息。

#### 使用

通常在单网段的情况下（`kafka`所在机器除回环地址外只有一个访问`ip`），`listeners` 可配置成指定 `ip:port` ；而在多网段的情况下，主要是利用客户端对主机名解析成可访问的网段的 `ip` 来正确访问 `kafka`。

例如，`kafka` 机器有192和172两个网段，`listeners` 配置为 `0.0.0.0`，主机名配置为`node1`，`advertised.listeners`不进行配置。

与192网段能通的客户端将 `node1` 配置为 `kafka` 的192网段的 `ip` 地址，与172网段能通的客户端将 `node1` 配置为 `kafka` 的172网段的 `ip` 地址，这样不同网段的客户端就都能正确访问 `kafka` 了。

当然也可以通过 `advertised.listeners` 指定 `broker ip`。

## 常用操作

### 主题

命令参数

| 参数                                               | 描述                                   |
| -------------------------------------------------- | -------------------------------------- |
| `--bootstrap-server <String: server 主机名:端口>`  | 连接的 Kafka Broker 主机名称和端口号。 |
| `--topic <String: topic>`                          | 操作的 topic 名称。                    |
| `--create`                                         | 创建主题。                             |
| `--delete`                                         | 删除主题。                             |
| `--alter`                                          | 修改主题。                             |
| `--list`                                           | 查看所有主题。                         |
| `--describe`                                       | 查看主题详细描述。                     |
| `--partitions <Integer: # of partitions>`          | 设置分区数。                           |
| `--replication-factor<Integer: replicationfactor>` | 设置分区副本。                         |
| `--config <String: name=value>`                    | 更新系统默认的配置。                   |

>**--bootstrap-server：**
>
>测试环境，只需要连接一个kafka即可，因为搭建了集群，只要连接一个kafka其他kafka中的数据也可以访问到。
>
>生产环境，最好多连接几台kafka，防止连接的那台kafka宕机无法使用。可以增加连接的可靠性。
>
>**格式：**
>
>`--bootstrap-server ip/主机名:端口,ip/主机名:端口,ip/主机名:端口`

查看当前服务器中的所有 topic

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-topics.sh \
--bootstrap-server kafka-0:9092 \
```

创建 test topic

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-topics.sh \
--bootstrap-server kafka-0:9092 \
--create --topic test \
--partitions 3 --replication-factor 2
```

>- `--topic`：定义 topic 名
>- `--partitions`：定义分区数
>- `--replication-factor`：定义副本数

查看 test 主题的详情

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-topics.sh \
--bootstrap-server kafka-0:9092 \
--describe --topic test

# resp
Topic: test     TopicId: sAz8969BQYOgRetKviQkXw PartitionCount: 3       ReplicationFactor: 2    Configs: 
        Topic: test     Partition: 0    Leader: 2       Replicas: 2,0   Isr: 2,0
        Topic: test     Partition: 1    Leader: 0       Replicas: 0,1   Isr: 0,1
        Topic: test     Partition: 2    Leader: 1       Replicas: 1,2   Isr: 1,2
```

修改分区数（分区数只能增加，不能减少）

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-topics.sh \
--bootstrap-server kafka-0:9092 \
--alter --topic test \
--partitions 4
```

删除 topic

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-topics.sh \
--bootstrap-server kafka-0:9092 \
--delete --topic test
```

### 生产者

命令参数

| 参数                                               | 描述                                   |
| -------------------------------------------------- | -------------------------------------- |
| `--bootstrap-server <String: server toconnect to>` | 连接的 Kafka Broker 主机名称和端口号。 |
| `--topic <String: topic>`                          | 操作的 topic 名称                      |

#### 发送消息

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-console-producer.sh \
--bootstrap-server kafka-0:9092 \
--topic test

# input
> hello
```

### 消费者

命令参数

| 参数                                               | 描述                                   |
| -------------------------------------------------- | -------------------------------------- |
| `--bootstrap-server <String: server toconnect to>` | 连接的 Kafka Broker 主机名称和端口号。 |
| `--topic <String: topic>`                          | 操作的 topic 名称。                    |
| `--from-beginning`                                 | 从头开始消费。                         |
| `--group <String: consumer group id>`              | 指定消费者组名称。                     |

#### 消费消息

消费 test 主题中的数据

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-console-consumer.sh \
--bootstrap-server kafka-0:9092 \
--topic test
```

把主题中所有的数据都读取出来（包括历史数据）

```sh
docker exec -it kafka-0 /opt/bitnami/kafka/bin/kafka-console-consumer.sh \
--bootstrap-server kafka-0:9092 \
--topic test \
--from-beginning
```
