# 注册中心

## 原理

在微服务远程调用的过程中，包括两个角色：

- 服务提供者：提供接口供其它微服务访问，比如`order-service`
- 服务消费者：调用其它微服务提供的接口，比如`user-service`

在大型微服务项目中，服务提供者的数量会非常多，为了管理这些服务就引入了**注册中心**的概念。注册中心、服务提供者、服务消费者三者间关系如下：

![An image](/img/java/cloud/07.jpg)

流程如下：

- 服务启动时就会注册自己的服务信息（服务名、IP、端口）到注册中心
- 调用者可以从注册中心订阅想要的服务，获取服务对应的实例列表（1个服务可能多实例部署）
- 调用者自己对实例列表负载均衡，挑选一个实例
- 调用者向该实例发起远程调用

当服务提供者的实例宕机或者启动新实例时，调用者如何得知呢？

- 服务提供者会定期向注册中心发送请求，报告自己的健康状态（心跳请求）
- 当注册中心长时间收不到提供者的心跳时，会认为该实例宕机，将其从服务的实例列表中剔除
- 当服务有新实例启动时，会发送注册服务请求，其信息会被记录在注册中心的服务实例列表
- 当注册中心服务列表变更时，会主动通知微服务，更新本地服务列表

### 注册中心框架

目前开源的注册中心框架有很多，国内比较常见的有：

- `Eureka`：Netflix公司出品，目前被集成在SpringCloud当中，一般用于Java应用
- `Nacos`：Alibaba公司出品，目前被集成在SpringCloudAlibaba中，一般用于Java应用
- `Consul`：HashiCorp公司出品，目前集成在SpringCloud中，不限制微服务语言

## Eureka

最广为人知的注册中心就是 Eureka，其结构如下：

![An image](/img/java/cloud/08.png)

`order-service` 如何得知 `user-service` 实例地址？

- `user-service` 服务实例启动后，将自己的信息注册到 `eureka-server` (Eureka服务端)，叫做**服务注册**。
- `eureka-server` 保存服务名称到服务实例地址列表的映射关系
- `order-service` 根据服务名称，拉取实例地址列表，这个叫**服务发现**或**服务拉取**。

`order-service` 如何从多个 `user-service` 实例中选择具体的实例？

- `order-service` 从实例列表中利用**负载均衡算法**选中一个实例地址，向该实例地址发起远程调用

`order-service` 如何得知某个 `user-service` 实例是否依然健康，是不是已经宕机？

- `user-service` 会每隔一段时间(默认30秒)向 `eureka-server` 发起请求，报告自己状态，称为**心跳**。
- 当超过一定时间没有发送心跳时，`eureka-server` 会认为微服务实例故障，将该实例从服务列表中剔除
- `order-service` 拉取服务时，就能将故障实例排除了

### 服务搭建

引入 SpringCloud 为 eureka 提供的 starter 依赖，注意这里是用 `server`

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

开启 eureka 的**注册中心**功能

```java
package cc.taketo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

编写配置文件

```yml
spring:
  application:
    # 声明应用名称
    name: eureka-server

# eureka配置
eureka:
  client:
    # 指定 Eureka 服务端的地址
    service-url:
      defaultZone: http://127.0.0.1:9000/eureka
    # 是否在启动时向 Eureka 注册中心注册服务实例
    register-with-eureka: false
    # 是否在启动时从 Eureka 注册中心获取已注册的服务实例信息
    fetch-registry: false
    # 向服务端发送一次心跳的间隔时间, 默认30
    instance-info-replication-interval-seconds: 30
    # 服务实例租约到期的时间
    # 规定的时间内未收到心跳，Eureka 服务端会认为租约过期，服务实例将被标记为不健康并可能被剔除。
    initial-instance-info-replication-interval-seconds: 40
  # 服务实例的主机名, 用于在 Eureka 注册中心标识该实例
  instance:
    # 解决报错
    # 由 spring.profiles 引起
    # ERROR ReplicationTaskProcessor(:) - Network level connection to peer localhost; retrying after delay
#    hostname: localhost
  server:
    # 保护机制, 默认开启。关闭后, 保注册中心将不可用的实例剔除
    enable-self-preservation: true
  # 是否启用健康检查, 默认为 true
  health-check-enabled: true
  # 定义健康检查的 URL 路径, 默认为 /actuator/health
  health-check-url-path: /actuator/health
```

其中 default-zone 是因为前面配置类开启了注册中心所需要配置的 eureka 的**地址信息**，因为 eureka 本身也是一个微服务，这里也要将自己注册进来，当使用 eureka 集群时，这里就可以填写多个，使用 `,` 隔开。

访问

```tex
http://127.0.0.1:8080/
```

### 服务注册

将 `user-service`、`order-service` 都注册到 `eureka`

引入 SpringCloud 为 eureka 提供的 starter 依赖，注意这里是用 `client`

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

在启动类上添加注解

```java
@EnableEurekaClient
// 也可以使用SpringCloud自带的注解，用于启用服务发现功能
@EnableDiscoveryClient
```

编写配置文件

```yml
spring:
  application:
      #name：orderservice
    name: userservice
# eureka配置
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:9000/eureka
```

### 服务拉取

在 `order-service` 中完成服务拉取，然后通过负载均衡挑选一个服务，实现远程调用

下面我们让 `order-service` 向 `eureka-server` 拉取 `user-service` 的信息，实现服务发现。

首先给 RestTemplate 这个 Bean 添加一个 `@LoadBalanced` 注解，用于开启**负载均衡**。

```java
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(ClientHttpRequestFactory factory) {
        return new RestTemplate(factory);
    }
```

修改访问的 `url` 路径，用**服务名**代替ip和端口

```java
    @Resource
    private RestTemplate restTemplate;

    private Logger logger = LoggerFactory.getLogger(OrderServiceTest.class);

    private String baseUrl = "http://order-service/order";

    @Test
    public void getUser() {
        String order = restTemplate.getForObject(
                baseUrl + "/get/1",
                String.class
        );
        logger.info(order);
    }
```

spring 会自动帮助我们从 eureka-server 中，根据 userservice 这个服务名称，获取实例列表后去完成负载均衡。

## Nacos

官网：[Nacos | Nacos](https://nacos.io/)

Nacos `/nɑ:kəʊs/` 是 Dynamic Naming and Configuration Service的首字母简称，一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。

Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。

Nacos 帮助您更敏捷和容易地构建、交付和管理微服务平台。 Nacos 是构建以“服务”为中心的现代应用架构 (例如微服务范式、云原生范式) 的服务基础设施。

### 服务搭建

官方文档：[Nacos Docker 快速开始 | Nacos](https://nacos.io/docs/latest/quickstart/quick-start-docker/)

Clone 项目

```sh
git clone https://github.com/nacos-group/nacos-docker.git
cd nacos-docker
```

单机模式 Derby

```sh
docker-compose -f example/standalone-derby.yaml up
```

单机模式，MySQL8

```sh
docker-compose -f example/standalone-mysql-8.yaml up
```

集群模式

```sh
docker-compose -f example/cluster-hostname.yaml up
```

服务注册

```sh
curl -X POST 'http://127.0.0.1:8848/nacos/v1/ns/instance?serviceName=nacos.naming.serviceName&ip=20.18.7.10&port=8080'
```

服务发现

```sh
curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=nacos.naming.serviceName'
```

发布配置

```sh
curl -X POST "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test&content=helloWorld"
```

获取配置

```sh
  curl -X GET "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"
```

Nacos 控制台

```sh
http://127.0.0.1:8848/nacos/
```

### 服务注册

引入 SpringCloud 为 nacos 提供的 starter 依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

在启动类添加服务发现注解

```java
@EnableDiscoveryClient
```

编写配置文件

```yml
spring:
  cloud:
    nacos:
      # nacos地址
      server-addr: 192.168.150.101:8848
```

### 服务调用

服务发现需要用到一个工具，DiscoveryClient，SpringCloud已经帮我们自动装配，我们可以直接注入使用。

```java
 @Resource
    private RestTemplate restTemplate;

    @Resource
    private DiscoveryClient discoveryClient;

    private Logger logger = LoggerFactory.getLogger(OrderServiceTest.class);

    private ServiceInstance orderServiceInstance = null;

    @BeforeEach
    public void init() {
        // 获取示例列表
        List<ServiceInstance> instances = discoveryClient.getInstances("order-service");
        // 配置负载均衡
        orderServiceInstance = instances.get(new Random().nextInt(instances.size()));
    }

    @Test
    public void getUser() {
        String order = restTemplate.getForObject(
                orderServiceInstance.getUri() + "/order/get/1",
                String.class
        );
        logger.info(order);
    }
```
