# 网关路由

## 认识网关

什么是网关？

顾明思议，网关就是**网**络的**关**口。数据在网络间传输，从一个网络传输到另一网络时就需要经过网关来做数据的**路由和转发以及数据安全的校验**。

更通俗的来讲，网关就像是以前园区传达室的大爷。

- 外面的人要想进入园区，必须经过大爷的认可，如果你是不怀好意的人，肯定被直接拦截。
- 外面的人要传话或送信，要找大爷。大爷帮你带给目标人。

现在，微服务网关就起到同样的作用。前端请求不能直接访问微服务，而是要请求网关：

- 网关可以做安全控制，也就是登录身份校验，校验通过才放行
- 通过认证后，网关再根据请求判断应该访问哪个微服务，将请求转发过去

![An image](/img/java/cloud/12.png)

在SpringCloud当中，提供了两种网关实现方案：

- Netflix Zuul：早期实现，目前已经淘汰
- SpringCloudGateway：基于Spring的WebFlux技术，完全支持响应式编程，吞吐能力更强

Gateway官方文档：[Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway/#learn)

### 核心功能

- 请求路由

  一切请求都必须先经过 gateway，但网关不处理业务，而是根据某种规则，把请求转发到某个微服务，这个过程叫做路由。当然路由的目标服务有多个时，还需要做负载均衡。

- 权限控制

  网关作为微服务入口，需要校验用户是是否有请求资格，如果没有则进行拦截。

- 限流

  当请求流量过高时，在网关中按照下流的微服务能够接受的速度来放行请求，避免服务压力过大。

## 快速开始

由于网关本身也是一个独立的微服务，因此也需要创建一个模块开发功能。

**步骤如下：**

- 创建网关微服务
- 引入`SpringCloudGateway`、`NacosDiscovery`依赖
- 编写启动类
- 配置网关路由

### 引入依赖

```xml
        <!-- gateway -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <!-- discovery -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <!-- 负载均衡 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
```

编写启动类

### 配置网关路由

```yml
server:
  port: 8000

spring:
  application:
    # 声明应用名称
    name: gateway
  main:
    # 解决启动报错
    # Please set spring.main.web-application-type=reactive or remove spring-boot-starter-web dependency.
    web-application-type: reactive
  cloud:
    nacos:
      server-addr: 192.168.31.101:8848
    gateway:
      routes:
        # 路由规则id，自定义，唯一
        - id: user
          # 路由的目标地址 http就是固定地址
          # uri: http://127.0.0.1:8081
          # 路由的目标服务，lb代表负载均衡，会从注册中心拉取服务列表，后面跟服务名称
          uri: lb://user-service
          # 路由断言，判断当前请求是否符合当前规则，符合则路由到目标服务
          predicates:
            # 按照路径匹配，只要以/user/开头就符合要求
            - Path=/user/**
        - id: order
          uri: lb://order-service
          predicates:
            - Path=/order/**
```

**路由配置包括：**

- 路由id：路由的唯一标示
- 路由目标（uri）：路由的目标地址，http代表固定地址，lb代表根据服务名负载均衡
- 路由断言（predicates）：判断路由的规则
- 路由过滤器（filters）：对请求或响应做处理

### 测试运行

浏览器访问

```tex
http://localhost:8000/user/list
```

### 运行流程图

![An image](/img/java/cloud/13.png)

## 断言工厂

我们在配置文件中写的断言规则只是字符串，这些字符串会被 Predicate Factory 读取并处理，转变为路由判断的条件。

例如 `Path=/user/**` 是按照路径匹配，这个规则是由 `org.springframework.cloud.gateway.handler.predicate.PathRoutePredicateFactory` 类来处理的，像这样的断言工厂在 Spring Cloud Gateway 还有十几个。

官方文档：[Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gateway-request-predicates-factories)

| **名称**   | **说明**                       | **示例**                                                     |
| ---------- | ------------------------------ | ------------------------------------------------------------ |
| After      | 是某个时间点后的请求           | `- After=2037-01-20T17:42:47.789-07:00[America/Denver]`      |
| Before     | 是某个时间点之前的请求         | `- Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]`      |
| Between    | 是某两个时间点之前的请求       | `- Between=2037-01-20T17:42:47.789-07:00[America/Denver], 2037-01-21T17:42:47.789-07:00[America/Denver]` |
| Cookie     | 请求必须包含某些cookie         | `- Cookie=chocolate, ch.p`                                   |
| Header     | 请求必须包含某些header         | `- Header=X-Request-Id, d+`                                  |
| Host       | 请求必须是访问某个host（域名） | `- Host=**.somehost.org, **.anotherhost.org`                 |
| Method     | 请求方式必须是指定方式         | `- Method=GET,POST`                                          |
| Path       | 请求路径必须符合指定规则       | `- Path=/red/{segment},/blue/**`                             |
| Query      | 请求参数必须包含指定参数       | `- Query=name, Jack或者- Query=name`                         |
| RemoteAddr | 请求者的ip必须是指定范围       | `- RemoteAddr=192.168.1.1/24`                                |
| Weight     | 权重处理                       |                                                              |

**例如：**

```yaml
predicates:
  - Path=/order/**
  - After=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]
```

像这样的规则，现在是 `2031年8月22日01:32:42`，很明显 After 条件不满足，可以不会转发，路由不起作用。

## 路由过滤

网关过滤器链中的过滤器有两种：

- `GatewayFilter`：路由过滤器，作用范围比较灵活，可以是任意指定的路由`Route`。
- `GlobalFilter`：全局过滤器，作用范围是所有路由，不可配置。

### 路由过滤器

`GatewayFilter` 是网关中提供的一种过滤器，可以对进入网关的请求和微服务返回的响应做处理。

![An image](/img/java/cloud/14.png)

Spring提供了38种不同的路由过滤器工厂。

官方文档：<https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories>

| 名称                 | 说明                         |
| -------------------- | ---------------------------- |
| AddRequestHeader     | 给当前请求添加一个请求头     |
| RemoveRequestHeader  | 移除请求中的一个请求头       |
| AddResponseHeader    | 给响应结果中添加一个响应头   |
| RemoveResponseHeader | 从响应结果中移除有一个响应头 |
| RequestRateLimiter   | 限制请求的流量               |

**以 AddRequestHeader 为例：**

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        filters:
        - AddRequestHeader=X-Request-red, blue
```

**全局路由过滤：**

如果要**对所有的路由都生效**，则可以将过滤器工厂写到 `default-filters` 下

```yaml
spring:
  cloud:
    gateway:
      default-filters:
        - AddRequestHeader=X-Request, blue # 添加请求头
```

只需要修改 gateway 服务的 `application.yml` 文件，添加路由过滤即可。

```yml
    gateway:
      routes:
        # 路由规则id，自定义，唯一
        - id: user
          # 路由的目标服务，lb代表负载均衡，会从注册中心拉取服务列表
          uri: lb://user-service
          # 路由断言，判断当前请求是否符合当前规则，符合则路由到目标服务
          predicates:
            # 这里是以请求路径作为判断规则
            - Path=/user/**
          # 给当前请求添加一个请求头X-Request-red
          filters:
            - AddRequestHeader=X-Request, blue
```

日志输出

```java
logger.info("RequestHeader: X-Request = {}", request);

// 输出
2024-01-25 11:45:43.234 [http-nio-9183-exec-1] INFO  UserController(:) - RequestHeader: X-Request = blue
```

### 基本原理

![An image](/img/java/cloud/15.png)

如图所示：

1. 客户端请求进入网关后由`HandlerMapping`对请求做判断，找到与当前请求匹配的路由规则（`Route`），然后将请求交给`WebHandler`去处理。
2. `WebHandler`则会加载当前路由下需要执行的过滤器链（`Filter chain`），然后按照顺序逐一执行过滤器（后面称为`Filter`）。
3. 图中`Filter`被虚线分为左右两部分，是因为`Filter`内部的逻辑分为`pre`和`post`两部分，分别会在请求路由到微服务之前和之后被执行。
4. 只有所有`Filter`的`pre`逻辑都依次顺序执行通过后，请求才会被路由到微服务。
5. 微服务返回结果后，再倒序执行`Filter`的`post`逻辑。
6. 最终把响应结果返回。

### 全局过滤器

全局过滤器的作用也是处理一切进入网关的请求和微服务响应，与 `GatewayFilter` 的作用一样。无论是`GatewayFilter`还是`GlobalFilter`都支持自定义，只不过**编码**方式、**使用**方式略有差别。

定义全局过滤器，拦截请求，判断请求的参数是否满足下面条件

- 参数中是否有 `authorization`
- `authorization` 参数值是否为 `admin`

如果同时满足则放行，否则拦截。

```java
@Component
public class AuthorizeFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 获取第一个 authorization 参数
        String authorization = exchange.getRequest().getHeaders().getFirst("authorization");
        if ("admin".equals(authorization)) {
            // 放行
            return chain.filter(exchange);
        }
        // 设置拦截状态码信息
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        // 设置拦截
        return exchange.getResponse().setComplete();
    }

    /**
     * 设置过滤器优先级，值越低优先级越高
     * 也可以使用 @Order 注解
     *
     * @return
     */
    @Override
    public int getOrder() {
        return 0;
    }
}
```

### 自定义过滤器

自定义`GatewayFilter`不是直接实现`GatewayFilter`，而是实现`AbstractGatewayFilterFactory`。

**最简单的实现方式：**

```java
@Component
public class CustomGatewayFilterFactory extends AbstractGatewayFilterFactory<Object> {

    private Logger logger = LoggerFactory.getLogger(CustomGatewayFilterFactory.class);

    @Override
    public GatewayFilter apply(Object config) {
        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // 获取请求
                ServerHttpRequest request = exchange.getRequest();
                // 编写过滤器逻辑
                logger.info("CustomGatewayFilterFactory执行了");
                // 放行
                return chain.filter(exchange);
            }
        };
    }
}
```

>该类的名称一定要以`GatewayFilterFactory`为后缀

使过滤器生效

```yaml
 gateway:
      default-filters:
        # 自定义过滤器，此处直接以自定义的GatewayFilterFactory类名称前缀类声明过滤器
        - Custom
```

**动态参数配置过滤器实现：**

```java
Component
public class DynamicParamGatewayFilterFactory extends AbstractGatewayFilterFactory<DynamicParamGatewayFilterFactory.Config> {

    private Logger logger = LoggerFactory.getLogger(CustomGatewayFilterFactory.class);

    @Override
    public GatewayFilter apply(Config config) {
        // OrderedGatewayFilter是GatewayFilter的子类，包含两个参数：
        // - GatewayFilter：过滤器
        // - int order值：值越小，过滤器执行优先级越高
        return new OrderedGatewayFilter(new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // 获取config值
                String a = config.getA();
                String b = config.getB();
                String c = config.getC();
                // 编写过滤器逻辑
                logger.info("a = {}", a);
                logger.info("b = {}", b);
                logger.info("c = {}", c);
                // 放行
                return chain.filter(exchange);
            }
        }, 100);
    }

    // 自定义配置属性，成员变量名称很重要，必须是静态的
    static class Config {
        private String a;
        private String b;
        private String c;

        public String getA() {
            return a;
        }

        public void setA(String a) {
            this.a = a;
        }

        public String getB() {
            return b;
        }

        public void setB(String b) {
            this.b = b;
        }

        public String getC() {
            return c;
        }

        public void setC(String c) {
            this.c = c;
        }
    }

    // 将变量名称依次返回，顺序很重要，将来读取参数时需要按顺序获取
    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("a", "b", "c");
    }

    // 返回当前配置类的类型，也就是内部的Config
    @Override
    public Class<Config> getConfigClass() {
        return Config.class;
    }

}
```

使过滤器生效

```java
    gateway:
      default-filters:
        # 自定义过滤器，此处直接以自定义的GatewayFilterFactory类名称前缀类声明过滤器
        - DynamicParam=3,2,1
```

上面这种配置方式参数必须严格按照shortcutFieldOrder()方法的返回参数名顺序来赋值。

还有一种用法，无需按照这个顺序，就是手动指定参数名：

```yaml
    gateway:
      default-filters:
            - name: DynamicParam
              args: # 手动指定参数名，无需按照参数顺序
                a: 1
                b: 2
                c: 3
```

### 过滤器顺序

请求进入网关会碰到三类过滤器：

- `DefaultFilter`
- `路由过滤器`
- `GlobalFilter`

请求路由后，会将三者合并到一个过滤器链（集合）中，排序后依次执行每个过滤器。

![An image](/img/java/cloud/16.png)

**排序的规则：**

- 每一个过滤器都必须指定一个 int 类型的 `order` 值，`order` 值越小，优先级越高，执行顺序越靠前。
- `GlobalFilter` 通过实现 `Ordered` 接口，或者使用 `@Order` 注解来指定 `order` 值，由我们自己指定。
- 路由过滤器 和 `defaultFilter` 的 order 由 Spring 指定，默认是按照声明顺序从1递增。
- 当过滤器的 `order` 值一样时，会按照 `defaultFilter > 路由过滤器 > GlobalFilter` 的顺序执行。

## 跨域问题

Spring Cloud Gateway 中解决跨域问题可以通过以下两种方式实现：

- 通过在配置文件中配置跨域实现。
- 通过在框架中添加 `CorsWebFilter` 来解决跨域问题。

**配置文件中设置跨域：**

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]': # 这里的'/**'表示对所有路由生效，可以根据需要调整为特定路径
            allowedOrigins: "*" # 允许所有的源地址，也可以指定具体的域名
            allowedMethods: # 允许的 HTTP 方法类型
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*" # 允许所有的请求头，也可以指定具体的请求头
            allowCredentials: true # 是否允许携带凭证（cookies）
            maxAge: 3600 # CORS预检请求的有效期（秒）
```

其中：

- `allowedOrigins`：设置允许访问的来源域名列表，"*" 表示允许任何源。
- `allowedMethods`：指定哪些HTTP方法可以被用于跨域请求。
- `allowedHeaders`：客户端发送的请求头列表，"*" 表示允许任何请求头。
- `allowCredentials`：当设为 true 时，允许浏览器在发起跨域请求时携带认证信息（例如 cookies）。
- `maxAge`：预检请求的结果可以在客户端缓存的最大时间。

通过这样的配置，`Spring Cloud Gateway` 网关将自动处理所有经过它的跨域请求，并添加相应的响应头，从而允许前端应用执行跨域请求。

**添加 CorsWebFilter 来解决跨域问题：**

在 Spring-Framework 从 5.3 版本之前，使用以下代码可以让 Spring Cloud Gateway 网关允许跨域

```java
@Configuration
public class GlobalCorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 这里仅为了说明问题，配置为放行所有域名，生产环境请对此进行修改
        config.addAllowedOrigin("*");
        // 放行的请求头
        config.addAllowedHeader("*");
        // 放行的请求类型，有 GET, POST, PUT, DELETE, OPTIONS
        config.addAllowedMethod("*"); 
        // 暴露头部信息
        config.addExposedHeader("*"); 
        // 是否允许发送 Cookie
        config.setAllowCredentials(true); 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
```

而 Spring-Framework 5.3 版本之后，关于 `CORS` 跨域配置类 `CorsConfiguration` 中将 `addAllowedOrigin` 方法名修改为 `addAllowedOriginPattern`，因此配置了变成了以下这样

```java
@Configuration
public class GlobalCorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 这里仅为了说明问题，配置为放行所有域名，生产环境请对此进行修改
        config.addAllowedOriginPattern("*");
        // 放行的请求头
        config.addAllowedHeader("*");
        // 放行的请求类型，有 GET, POST, PUT, DELETE, OPTIONS
        config.addAllowedMethod("*"); 
        // 暴露头部信息
        config.addExposedHeader("*"); 
        // 是否允许发送 Cookie
        config.setAllowCredentials(true); 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
```
