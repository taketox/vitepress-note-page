# Nacos

## 介绍

Nacos `/nɑ:kəʊs/` 是 Dynamic Naming and Configuration Service的首字母简称，⼀个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。

在这个介绍中，可以看出Nacos⾄少有三个核心功能：

- 动态服务发现
- 配置管理
- 服务管理

## 配置管理

这里的配置是以键值对的形式出现，一个 `KEY` 对应一个 `VALUE`。

并且我们通常会把这些配置写在 `application.properties` 或 `application.yml` 文件中，当时通过这种方式⼀定配置发生了改变就需要重启应用，并且通过这种方式配置的配置项仅限于当前应用，而不能做到多个应用共享。

那么 `Nacos` 的配置管理功能就是来解决这些问题的，我们可以直接通过 `Nacos` 管理台来新增配置，并且这些配置能够被多个应用给使用到。

### 新增配置

#### Data ID

相当于⼀个配置文件，比如相当于 `application.properties`，或者 `applicationdev.properties`，不过要注意的是，我们在某个项⽬中使用 `application.properties` 文件中，那个 `application` 表示的就是当前应用，那我们在 `nacos` 进行配置时，就要尽可能的取⼀些有含义的 `Data ID`，比如 `user.properties`（表示用户应用的配置），`order.properties`（表示订单应用的配置），`common.properties`（表示多个应用共享的配置）。

#### Group

在 `nacos` 中，⼀个 `Data ID`，也就是⼀个或多个配置⽂件可以归类到同⼀个 `Group` 中，`Group` 的作用就是用来区分 `Data ID` 相同的情况，不同的应用或中间件使用了相同的 `Data ID` 时就可以通过 `Group` 来进行区分，默认为 `DEFAULT_GROUP`。

#### 配置内容

写具体的配置项，可以用 `properties` 的格式，也可以用 `yaml` 的格式。

### 拉取配置

在 `nacos` 中新建完配置后，那作为⼀个 `SpringBoot` 应用我们如何来获取配置呢？

#### Spring Cloud

引入依赖

```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
        </dependency>
```

在 `bootstrap.properties` 中配置 Nacos server 的地址和应用名

```properties
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
spring.application.name=user
```

>说明：之所以需要配置 `spring.application.name` ，是因为它是构成 Nacos 配置管理 `dataId`字段的一部分。
>
>在 Nacos Spring Cloud 中，`dataId` 的完整格式如下：
>
>```tex
>${prefix}-${spring.profiles.active}.${file-extension}
>```
>
>- `prefix` 默认为 `spring.application.name` 的值，也可以通过配置项 `spring.cloud.nacos.config.prefix`来配置。
>
>- `spring.profiles.active` 即为当前环境对应的 profile。
>
> **注意：当 `spring.profiles.active` 为空时，对应的连接符 `-` 也将不存在，dataId 的拼接格式变成 `${prefix}.${file-extension}`**
>
>- `file-exetension` 为配置内容的数据格式，可以通过配置项 `spring.cloud.nacos.config.file-extension` 来配置。目前只支持 `properties` 和 `yaml` 类型。

### 按profile拉取配置

在使用 `spring-cloud-starter-alibaba-nacos-config` 时，我们除了可以配置 `spring.cloud.nacos.config.server-addr` 外，还可以配置：

- `spring.cloud.nacos.config.group`：默认为 `DEFAULT_GROUP`
- `spring.cloud.nacos.config.file-extension`：默认为 `properties`
- `spring.cloud.nacos.config.prefix`：默认为 `${spring.application.name}`

所以，默认情况下，会拉取 `DEFAULT_GROUP` 组下 `dataId` 为 `user.properties` 的配置，不过通过看源码可以发现，在拉取配置时会分为三步。

1. 拉取 `dataId` 为 `user` 的配置。

2. 拉取 `dataId` 为 `user.properties` 的配置。

3. 拉取 `dataId` 为 `user-${spring.profiles.active}.properties` 的配置。

并且优先级依次增高。

还值得注意的是，在拉取配置时，还会加上 `namespace` 这个维度取获取配置，可以通过 `spring.cloud.nacos.config.namespace` 进行配置。

我们可以在Nacos管理台：

1. 新建不同的 `namespace`。

2. 在每个 `namespace` 下可以进行 `dataId`名称相同的配置。

3. 每个 `dataId` ⼜可以分配到不同的 `group` 下。

相当于⼀个三层结构。

![An image](/img/java/cloud/09.png)

### 拉取多个配置

⼀个应用可能不止需要⼀个配置，有时可能需要拉取多个配置，此时可以利用

```properties
# extension-configs，shared-configs都表示拉取额外的配置⽂件
# extension-configs表示本应用特有的
spring.cloud.nacos.config.extension-configs[0].data-id=datasource.properties
# shared-configs表示多个应用共享的
spring.cloud.nacos.config.shared-configs[0].data-id=common.properties
```

**注意优先级：**

- `extension-configs[2] > extension-configs[1] > extension-configs[0]`
- `shared-configs[2] > shared-configs[1] > shared-configs[0]`
- `主配置 > extension-configs > shared-configs`

### 配置的自动刷新

默认情况下，主配置会自动刷新，`extension-configs` 和 `shared-configs` 不会自动刷新，可以通过 `spring.cloud.nacos.config.refresh-enabled=false` 来关闭主配置的自动刷新。

自动配置的意思是，⼀旦应用中引入的配置发生了变化，应用端也能及时获取到最新值。

值得注意的是，尽管默认情况下会自动刷新，但是对于通过 `@Value` 的使用方式，还需要在该Bean上加上 `@RefreshScope` 注解，这样才能动态的修改 `@Value` 属性，达到动态更新的最终效果。

## 服务管理

服务管理核心就是：

1. 服务注册

2. 服务发现

通过 `nacos` 的服务注册与发现，可以使得在调用微服务时可以更加简单。

### 服务注册发现

添加依赖

```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
```

#### 服务提供者

在服务提供者的 `application.properties` 中配置

```properties
server.port=8070
spring.application.name=service-provider
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
```

使用 `@EnableDiscoveryClient` 来开启服务注册

```java
@EnableDiscoveryClient
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

#### 服务消费者

在服务消费者的 `application.properties` 中配置

```properties
server.port=8080
spring.application.name=service-consumer
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
```

使用 `@EnableDiscoveryClient` 来开启服务注册

```java
@EnableDiscoveryClient
@SpringBootApplication
public class ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsumerApplication.class, args);
    }
}
```

然后通过定义⼀个 `RestTemplate` 来发送 `http` 请求，并使用 `@LoadBalanced` 负载均衡。

```java
@LoadBalanced
@Bean
public RestTemplate restTemplate() {
 return new RestTemplate();
}
```

然后来使用 `RestTemplate` 调用服务

```java
@RestController
public class ConsumerController {
 @Autowired
     private RestTemplate restTemplate;
     @GetMapping(value = "/test")
     public String echo() {
         return restTemplate.getForObject("http://service-provider/test", String.class);
 }
}
```

## 高级功能

### 临时实例与持久实例

默认情况下，注册给nacos的实例都是临时实例，临时实例表示会通过客户端与服务端之间的心跳来保活，默认情况下，客户端会每隔**5**s发送⼀次心跳。

```java
public static final long DEFAULT_HEART_BEAT_INTERVAL = TimeUnit.SECONDS.toMillis(5);
```

在服务端测，如果超过**15**s没有收到客户端的心跳，那么就会把实例标记为不健康状态。

```java
public static final long DEFAULT_HEART_BEAT_TIMEOUT = TimeUnit.SECONDS.toMillis(15);
```

在服务端测，如果超过**30**s没有收到客户端的心跳，那么就会删除实例。

```java
public static final long DEFAULT_IP_DELETE_TIMEOUT = TimeUnit.SECONDS.toMillis(30);
```

而对于持久实例，就算服务实例下线了，那么也不会被删除，我们可以通过：

```properties
spring.cloud.nacos.discovery.ephemeral=false
```

来配置为持久实例，表示实例信息会持久化到磁盘中去。

那什么时候用持久实例呢？我们可以发现持久实例与临时实例的区别在于，持久实例会永远在线，而临时实例不会，所以**如果消费端在某种情况下想拿到已经下线的实例的实例信息**，那么就可以把实例注册为持久实例。

### 保护阈值

在使用过程中，我们可以设置⼀个0-1的⼀个比例，表示如果服务的所有实例中，健康实例的比重低于这个比重就会触发保护，⼀旦触发保护，在服务消费端侧就会把所有实例拉取下来，不管是否健康，这样就起到了保护的作用，因为正常来说消费端只会拿到健康实例，但是如果健康实例占总实例比例比较⼩了，那么就会导致所有流量都会压到健康实例上，这样仅剩的⼏个健康实例也会被压垮，所以只要触发了保护，消费端就会拉取到所有实例，这样部分消费端仍然会访问到不健康的实例从而请求失败，但是也有⼀部分请求能访问到健康实例，达到保护的作用。

在 `SpringCloud Tencent` 中，这个功能叫“全死全活”。

### 权重

⼀个服务的多个实例，可能对应的机器配置不同，所以我们可以给不同的实例设置不同的权重，比如：给9182这个实例设置了权重为2，这样它的权重就是9181的两倍，那么就应该要承受2倍的流量。

![An image](/img/java/cloud/10.png)

不过我们在消费⼀个服务时，通常是通过ribbon来进行负载均衡的，所以默认情况下nacos配置的权重是

起不到作用的，因为ribbon使用的是⾃⼰的负载均衡策略，而如果想要用到nacos的权重，可以：

```java
@Bean
public IRule ribbonRule() {
 return new NacosRule();
}
```

这样就会利用到nacos中所配置的权重了。

### Cluster

⼀个服务下会有多个实例，在nacos中，可以将这些实例指定到不同的集群中，比如可以通过：

```properties
spring.cloud.nacos.discovery.cluster-name=SH
```

这种方式来指定当前实例属于哪个集群，比如：

![An image](/img/java/cloud/11.png)

此时在服务消费端，也可以配置：

```properties
spring.cloud.nacos.discovery.cluster-name=SH
```

使得服务调用者也在SH集群，那么此时服务消费者就只会调用到SH集群中的实例。

如果消费端没有配置 `cluster-name`，那么则会使用所有集群。
