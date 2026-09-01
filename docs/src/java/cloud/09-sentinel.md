# Sentinel

## 初识Sentinel

随着微服务的流行，服务和服务之间的稳定性变得越来越重要。Sentinel 是面向分布式、多语言异构化服务架构的流量治理组件，主要以流量为切入点，从流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护等多个维度来帮助开发者保障微服务的稳定性。

Sentinel是阿里巴巴开源的一款微服务流量控制组件。官网地址：<https://sentinelguard.io/zh-cn/index.html>

Sentinel 具有以下特征:

**丰富的应用场景**：Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、集群流量控制、实时熔断下游不可用应用等。

**完备的实时监控**：Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况。

**广泛的开源生态**：Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Dubbo、gRPC 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel。

**完善的** **SPI** **扩展点**：Sentinel 提供简单易用、完善的 SPI 扩展接口。您可以通过实现扩展接口来快速地定制逻辑。例如定制规则管理、适配动态数据源等。

## 安装运行

sentinel官方提供了UI控制台，方便我们对系统做限流设置。

下载

地址：[alibaba/Sentinel](https://github.com/alibaba/Sentinel/releases)

启动

```sh
nohup java -jar sentinel-dashboard-1.8.7.jar 1>start.log 2>&1 &
```

如果要修改Sentinel的默认端口、账户、密码，可以通过下列配置：

| **配置项**                       | **默认值** | **说明**   |
| -------------------------------- | ---------- | ---------- |
| server.port                      | 8080       | 服务端口   |
| sentinel.dashboard.auth.username | sentinel   | 默认用户名 |
| sentinel.dashboard.auth.password | sentinel   | 默认密码   |

访问

```tex
http://ip:8080
```

## Spring Cloud

整合sentinel，并连接sentinel的控制台。

引入sentinel依赖

```xml
<!-- sentinel -->
<dependency>
    <groupId>com.alibaba.cloud</groupId> 
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

配置控制台

```yaml
spring:
  cloud: 
    sentinel:
      transport:
        dashboard: localhost:8080
```

需要访问一次即可才可以触发sentinel

![An image](/img/java/cloud/27.png)

## 流量控制

雪崩问题虽然有四种方案，但是限流是避免服务因突发的流量而发生故障，是对微服务雪崩问题的预防。

### 簇点链路

当请求进入微服务时，首先会访问 `DispatcherServlet`，然后进入`Controller`、`Service`、`Mapper`，这样的一个调用链就叫做**簇点链路**。簇点链路中被监控的每一个接口就是一个**资源**。

默认情况下 `sentinel` 会监控 `SpringMVC` 的每一个端点（Endpoint，也就是controller中的方法），因此`SpringMVC`的每一个端点（Endpoint）就是调用链路中的一个资源。

例如，刚才访问的 `user-service` 中的 `UserController` 中的端点：`/user/get/{id}`

![An image](/img/java/cloud/28.png)

流控、熔断等都是针对簇点链路中的资源来设置的，因此我们可以点击对应资源后面的按钮来设置规则：

- 流控：流量控制
- 降级：降级熔断
- 热点：热点参数限流，是限流的一种
- 授权：请求的权限控制

### 流控模式

在添加限流规则时，点击高级选项，可以选择三种**流控模式**：

- 直接：统计当前资源的请求，触发阈值时对当前资源直接限流，也是默认的模式
- 关联：统计与当前资源相关的另一个资源，触发阈值时，对当前资源限流
- 链路：统计从指定链路访问到本资源的请求，触发阈值时，对指定链路限流

#### 直接模式

统计当前资源的请求，触发阈值时对当前资源直接限流，也是默认的模式

配置规则：

限制 `/order/{orderId}` 这个资源的单机QPS为1，即每秒只允许1次请求，超出的请求会被拦截并报错。

![An image](/img/java/cloud/29.png)

#### 关联模式

统计与当前资源相关的另一个资源，触发阈值时，对当前资源限流。

配置规则：

当 `/write` 资源访问量触发阈值时，就会对 `/read` 资源限流，避免影响 `/write` 资源。

![An image](/img/java/cloud/30.png)

满足以下条件可以使用关联模式：

- 两个有竞争关系的资源。
- 一个优先级较高，一个优先级较低。

#### 链路模式

只针对从指定链路访问到本资源的请求做统计，判断是否超过阈值。

配置示例：

例如有两条请求链路：

- `/test1 --> /common`

- `/test2 --> /common`

如果只希望统计从 `/test2` 进入到 `/common` 的请求，则可以这样配置：

![An image](/img/java/cloud/31.png)

**实战案例：**

需求：有查询订单和创建订单业务，两者都需要查询商品。针对从查询订单进入到查询商品的请求统计，并设置限流。

步骤：

1. 在 `OrderService` 中添加一个 `queryGoods` 方法，不用实现业务

2. 在 `OrderController` 中，改造 `/order/query`  端点，调用 `OrderService` 中的 `queryGoods` 方法

3. 在 `OrderController` 中添加一个 `/order/save` 的端点，调用 `OrderService` 的 `queryGoods` 方法

4. 给 `queryGoods` 设置限流规则，从 `/order/query` 进入 `queryGoods` 的方法限制QPS必须小于2

实现：

添加查询商品方法

在order-service服务中，给OrderService类添加一个queryGoods方法：

```java
public void queryGoods(){
    System.err.println("查询商品");
}
```

查询订单时，查询商品

在order-service的OrderController中，修改/order/query端点的业务逻辑：

```java
@GetMapping("/query")
public String queryOrder() {
    // 查询商品
    orderService.queryGoods();
    // 查询订单
    System.out.println("查询订单");
    return "查询订单成功";
}
```

新增订单，查询商品

在order-service的OrderController中，修改/order/save端点，模拟新增订单：

```java
@GetMapping("/save")
public String saveOrder() {
    // 查询商品
    orderService.queryGoods();
    // 查询订单
    System.err.println("新增订单");
    return "新增订单成功";
}
```

给查询商品添加资源标记

默认情况下，OrderService中的方法是不被Sentinel监控的，需要我们自己通过注解来标记要监控的方法。

给OrderService的queryGoods方法添加@SentinelResource注解：

```java
@SentinelResource("goods")
public void queryGoods(){
    System.err.println("查询商品");
}
```

链路模式中，是对不同来源的两个链路做监控。但是sentinel默认会给进入SpringMVC的所有请求设置同一个root资源，会导致链路模式失效。

我们需要关闭这种对SpringMVC的资源聚合，修改order-service服务的 `application.yml` 文件：

```yaml
spring:
  cloud:
    sentinel:
      web-context-unify: false # 关闭context整合
```

重启服务，访问 `/order/query` 和 `/order/save`，可以查看到sentinel的簇点链路规则中，出现了新的资源：

![An image](/img/java/cloud/32.png)

添加流控规则

点击goods资源后面的流控按钮，在弹出的表单中填写下面信息：

![An image](/img/java/cloud/33.png)

只统计从/order/query进入/goods的资源，QPS阈值为2，超出则被限流。

### 流控效果

在流控的高级选项中，还有一个流控效果选项：

![An image](/img/java/cloud/34.png)

流控效果是指请求达到流控阈值时应该采取的措施，包括三种：

- 快速失败：达到阈值后，新的请求会被立即拒绝并抛出FlowException异常。是默认的处理方式。

- warm up：预热模式，对超出阈值的请求同样是拒绝并抛出异常。但这种模式阈值会动态变化，从一个较小值逐渐增加到最大阈值。

- 排队等待：让所有的请求按照先后次序排队执行，两个请求的间隔不能小于指定时长

#### warm up

阈值一般是一个微服务能承担的最大QPS，但是一个服务刚刚启动时，一切资源尚未初始化（**冷启动**），如果直接将QPS跑到最大值，可能导致服务瞬间宕机。

warm up也叫**预热模式**，是应对服务冷启动的一种方案。请求阈值初始值是 `maxThreshold / coldFactor`，持续指定时长后，逐渐提高到 `maxThreshold` 值。而 `coldFactor` 的默认值是3。

例如，我设置QPS的 `maxThreshold` 为10，预热时间为5秒，那么初始阈值就是 `10 / 3` ，也就是3，然后在5秒后逐渐增长到10。

![An image](/img/java/cloud/35.png)

#### 排队等待

当请求超过QPS阈值时，快速失败和warm up 会拒绝新的请求并抛出异常。

而排队等待则是让所有请求进入一个队列中，然后按照阈值允许的时间间隔依次执行。后来的请求必须等待前面执行完成，如果请求预期的等待时间超出最大时长，则会被拒绝。

工作原理

例如：QPS = 5，意味着每200ms处理一个队列中的请求；timeout = 2000，意味着**预期等待时长**超过2000ms的请求会被拒绝并抛出异常。

那什么叫做预期等待时长呢？

比如现在一下子来了12 个请求，因为每200ms执行一个请求，那么：

- 第6个请求的**预期等待时长** =  200 * （6 - 1） = 1000ms
- 第12个请求的预期等待时长 = 200 * （12-1） = 2200ms

现在，第1秒同时接收到10个请求，但第2秒只有1个请求，此时QPS的曲线这样的：

![An image](/img/java/cloud/36.png)

如果使用队列模式做流控，所有进入的请求都要排队，以固定的200ms的间隔执行，QPS会变的很平滑：

![An image](/img/java/cloud/37.png)

平滑的QPS曲线，对于服务器来说是更友好的。

### 热点参数限流

之前的限流是统计访问某个资源的所有请求，判断是否超过QPS阈值。而热点参数限流是**分别统计参数值相同的请求**，判断是否超过QPS阈值。

#### 全局参数

例如，一个根据id查询商品的接口：

![An image](/img/java/cloud/38.png)

访问 `/goods/{id}` 的请求中，id参数值会有变化，热点参数限流会根据参数值分别统计QPS，统计结果：

![An image](/img/java/cloud/39.png)

当id=1的请求触发阈值被限流时，id值不为1的请求不受影响。

配置示例：

![An image](/img/java/cloud/40.png)

代表的含义是：对 `hot` 这个资源的0号参数（第一个参数）做统计，每1秒**相同参数值**的请求数不能超过5。

#### 热点参数

刚才的配置中，对查询商品这个接口的所有商品一视同仁，QPS都限定为5。

而在实际开发中，可能部分商品是热点商品，例如秒杀商品，我们希望这部分商品的QPS限制与其它商品不一样，高一些。那就需要配置热点参数限流的高级选项了：

![An image](/img/java/cloud/41.png)

结合上一个配置，这里的含义是对0号的long类型参数限流，每1秒相同参数的QPS不能超过5，有两个例外：

- 如果参数值是100，则每1秒允许的QPS为10

- 如果参数值是101，则每1秒允许的QPS为15

#### 案例

案例需求：

给 `/order/{orderId}` 这个资源添加热点参数限流，规则如下：

- 默认的热点参数规则是每1秒请求量不超过2

- 给102这个参数设置例外：每1秒请求量不超过4

- 给103这个参数设置例外：每1秒请求量不超过10

标记资源

注：热点参数限流对默认的SpringMVC资源无效，需要利用@SentinelResource注解标记资源。

给 `order-service` 中的 `OrderController` 中的 `/order/{orderId}` 资源添加注解：

![An image](/img/java/cloud/42.png)

热点参数限流规则

访问该接口，可以看到我们标记的 `hot` 资源出现了：

![An image](/img/java/cloud/43.png)

点击左侧菜单中**热点规则**菜单：

![An image](/img/java/cloud/44.png)

点击新增，填写表单：

![An image](/img/java/cloud/45.png)
