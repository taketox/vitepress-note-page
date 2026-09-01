# OpenFeign

## 概述

**OpenFeign是什么？**

Feign是一个声明式的Web服务客户端（Web服务客户端就是Http客户端），让编写Web服务客户端变得非常容易，只需创建一个接口并在接口上添加注解即可。

Cloud官网介绍Feign：[Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)

OpenFeign源码：[OpenFeign](https://github.com/OpenFeign/feign)

**OpenFeign能干什么？**

Java当中常见的HTTP客户端有很多，除了 `Feign`，类似的还有Apache 的 `HttpClient` 以及`OKHttp3`，还有SpringBoot自带的 `RestTemplate` 这些都是Java当中常用的HTTP 请求工具。

>HTTP客户端
>
>当我们自己的后端项目中 需要 调用别的项目的接口的时候，就需要通过HTTP客户端来调用。在实际开发当中经常会遇到这种场景，比如微服务之间调用，除了微服务之外，可能有时候会涉及到对接一些第三方接口也需要使用到 HTTP客户端 来调用 第三方接口。

所有的客户端相比较，Feign更加简单一点，在Feign的实现下，我们只需创建一个接口并使用注解的方式来配置它(以前是Dao接口上面标注Mapper注解，现在是一个微服务接口上面标注一个Feign注解即可)，即可完成对服务提供方的接口绑定。

**OpenFeign和Feign的区别？**

**Feign：**

Feign是Spring Cloud组件中的一个轻量级RESTful的HTTP服务客户端，Feign内置了Ribbon，用来做客户端负载均衡，去调用服务注册中心的服务。Feign的使用方式是：使用Feign的注解定义接口，调用这个接口，就可以调用服务注册中心的服务。

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
</dependency> 
```

**OpenFeign：**

OpenFeign是Spring Cloud 在Feign的基础上支持了SpringMVC的注解，如@RequesMapping等等。OpenFeign的@FeignClient可以解析SpringMVC的@RequestMapping注解下的接口，并通过动态代理的方式产生实现类，实现类中做负载均衡并调用其他服务。

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

>Feign是在2019就已经不再更新了，通过maven网站就可以看出来，随之取代的是OpenFeign，从名字上就可以知道，他是Feign的升级版。

## 抽取思路

在之前利用RestTemplate实现了服务的远程调用，但是这种调用方式，与原本的本地方法调用差异太大，编程时的体验也不统一，一会儿远程调用，一会儿本地调用。

因此，我们必须想办法改变远程调用的开发模式，让**远程调用像本地方法调用一样简单**。而这就要用到OpenFeign组件了。

其实远程调用的关键点就在于四个：

- 请求方式
- 请求路径
- 请求参数
- 返回值类型

所以，OpenFeign就利用SpringMVC的相关注解来声明上述4个参数，然后基于动态代理帮我们生成远程调用的代码，而无需我们手动再编写，非常方便。

相信大家都能想到，避免重复编码的办法就是**抽取**。不过这里有两种抽取思路：

- 思路1：抽取到微服务之外的公共module
- 思路2：每个微服务自己抽取一个module

方案1抽取更加简单，工程结构也比较清晰，但缺点是整个项目耦合度偏高。

方案2抽取相对麻烦，工程结构相对更复杂，但服务之间耦合度降低。

### 定义公共模块

引入依赖

```xml
    <dependencies>
        <!-- openFeign -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <!-- 负载均衡器 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <!-- lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
```

### 定义client

`OrderClient`

```java
@FeignClient("order-service")
public interface OrderClient {

    @GetMapping("/order/get/{id}")
    Result<Order> getOrder(@PathVariable Integer id);

    @GetMapping("/order/list")
    Result<List<Order>> getAllOrder();
}
```

`UserClient`

```java
@FeignClient("user-service")
public interface UserClient {

    @GetMapping("/user/get/{id}")
    Result<User> getUser(@PathVariable Integer id);

    @GetMapping("/user/list")
    Result<List<User>> getAllUser();
}
```

> 还需要定义相关的实体类，这里不展示了

## 快速开始

### 引入依赖

```xml
<!-- api -->
<dependency>
    <groupId>cc.taketo</groupId>
    <artifactId>open-feign-api</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

### 启用OpenFeign

在配置类上定义

```java
// 启用Feign客户端 扫描指定包
@EnableFeignClients(basePackages = "cc.taketo.client")
```

### 测试运行

```java
    private Logger logger = LoggerFactory.getLogger(UserServiceTest.class);

    @Resource
    private UserClient userClient;

    // 创建Gson对象
    private Gson gson = new Gson();

    @Test
    public void getUser() {
        Result<User> user = userClient.getUser(1);
        String json = gson.toJson(user);
        logger.info(json);
    }

    @Test
    public void getAllUser() {
        Result<List<User>> allUser = userClient.getAllUser();
        String json = gson.toJson(allUser);
        logger.info(json);
    }
```

## 日志配置

OpenFeign只会在FeignClient所在包的日志级别为**DEBUG**时，才会输出日志。而且其日志级别有4级：

- **NONE**：不记录任何日志信息，这是默认值。
- **BASIC**：仅记录请求的方法，URL以及响应状态码和执行时间
- **HEADERS**：在BASIC的基础上，额外记录了请求和响应的头信息
- **FULL**：记录所有请求和响应的明细，包括头信息、请求体、元数据。

Feign默认的日志级别就是NONE，所以默认我们看不到请求日志。

### 定义日志级别

在 `open-feign-api` 模块中新建配置类

```java
package cc.taketo.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DefaultFeignConfig {

    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
```

配置日志生效

- 局部生效：在某个`FeignClient`中配置，只对当前`FeignClient`生效

  ```java
  @FeignClient(value = "order-service", configuration = DefaultFeignConfig.class)
  ```

- 全局生效：在`@EnableFeignClients`中配置，针对所有`FeignClient`生效。

  ```java
  @EnableFeignClients(defaultConfiguration = DefaultFeignConfig.class)
  ```

日志格式

```tex
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] <--- HTTP/1.1 200 (414ms)
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] connection: keep-alive
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] content-type: application/json
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] date: Tue, 23 Jan 2024 09:06:59 GMT
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] keep-alive: timeout=60
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] transfer-encoding: chunked
2024-01-23 17:06:59.460 [main] DEBUG OrderClient() - [OrderClient#getOrder] 
2024-01-23 17:06:59.462 [main] DEBUG OrderClient() - [OrderClient#getOrder] {"code":"0","message":"成功","data":{"id":1,"orderCode":"57e2fe6b-72ce-2bea-c10e-10da70fe8282","orderContent":"iMango","userId":25,"createTime":"2024-01-06T21:32:40","updateTime":"2021-01-23T08:03:37","isDelete":0}}
2024-01-23 17:06:59.462 [main] DEBUG OrderClient() - [OrderClient#getOrder] <--- END HTTP (217-byte body)
```
