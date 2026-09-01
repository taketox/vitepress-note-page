# 简介概览

Apache Shiro 是一个功能强大且易于使用的 Java 安全(权限)框架。Shiro 可以完成：认证、授权、加密、会话管理、与 Web 集成、缓存 等。借助 Shiro 您可以快速轻松 地保护任何应用程序——从最小的移动应用程序到最大的 Web 和企业应用程序。

## 优点

- `易于使用`：使用 Shiro 构建系统安全框架非常简单。就算第一次接触也可以快速掌握。
- `全面`：Shiro 包含系统安全框架需要的功能，满足安全需求的“一站式服务”。
- `灵活`：Shiro 可以在任何应用程序环境中工作。虽然它可以在 Web、EJB 和 IoC 环境中工作，但不需要依赖它们。Shiro 也没有强制要求任何规范，甚至没有很多依赖项。
- `强力支持 Web`：Shiro 具有出色的 Web 应用程序支持，可以基于应用程序 URL 和Web 协议（例如 REST）创建灵活的安全策略，同时还提供一组 JSP 库来控制页面输出。
- `兼容性强`：Shiro 的设计模式使其易于与其他框架和应用程序集成。Shiro 与Spring、Grails、Wicket、Tapestry、Mule、Apache Camel、Vaadin 等框架无缝集成。
- `社区支持`：Shiro 是 Apache 软件基金会的一个开源项目，有完备的社区支持，文档支持。如果需要，像 Katasoft 这样的商业公司也会提供专业的支持和服务。

## 对比

- Spring Security 基于 Spring 开发，项目若使用 Spring 作为基础，配合 Spring
- Security 做权限更加方便，而 Shiro 需要和 Spring 进行整合开发；
- Spring Security 功能比 Shiro 更加丰富些，例如安全维护方面；
- Spring Security 社区资源相对比 Shiro 更加丰富；
- Shiro 的配置和使用比较简单，Spring Security 上手复杂些；
- Shiro 依赖性低，不需要任何框架和容器，可以独立运行.Spring Security 依赖Spring 容器；
- Shiro 不仅仅可以使用在 web 中，它可以工作在任何应用环境中。在集群会话时 Shiro最重要的一个好处或许就是它的会话是独立于容器的。

## 使用

```xml
    <dependencies>
        <dependency>
            <groupId>org.apache.shiro</groupId>
            <artifactId>shiro-core</artifactId>
            <version>1.12.0</version>
        </dependency>

        <dependency>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
            <version>1.2</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
```

## Shiro架构

![An image](/img/java/permission/01.png)

- `Authentication`：身份认证/登录，验证用户是不是拥有相应的身份；
- `Authorization`：授权，即权限验证，验证某个已认证的用户是否拥有某个权限；即判断用 户是否能进行什么操作，如：验证某个用户是否拥有某个角色。或者细粒度的验证某个用户 对某个资源是否具有某个权限；
- `Session Manager`：会话管理，即用户登录后就是一次会话，在没有退出之前，它的所有 信息都在会话中；会话可以是普通 JavaSE 环境，也可以是 Web 环境的；
- `Cryptography`：加密，保护数据的安全性，如密码加密存储到数据库，而不是明文存储；
- `Web Support`：Web 支持，可以非常容易的集成到 Web 环境；
- `Caching`：缓存，比如用户登录后，其用户信息、拥有的角色/权限不必每次去查，这样可以提高效率；
- `Concurrency`：Shiro 支持多线程应用的并发验证，即如在一个线程中开启另一个线程，能把权限自动传播过去；
- `Testing`：提供测试支持；
- `Run As`：允许一个用户假装为另一个用户（如果他们允许）的身份进行访问；
- `Remember Me`：记住我，这个是非常常见的功能，即一次登录后，下次再来的话不用登录了。

::: tip
记住一点，Shiro不会去维护用户、维护权限；这些需要我们自己去设计提供；然后通过相应的接口注入给Shiro 即可。
:::

### Shiro 外部来看

![An image](/img/java/permission/02.png)

- `Subject`：应用代码直接交互的对象是 Subject，也就是说 Shiro 的对外 API 核心就是 Subject。Subject 代表了当前“用户”， 这个用户不一定 是一个具体的人，与当前应用交互的任何东西都是 Subject，如网络爬虫， 机器人等；与 Subject 的所有交互都会委托给 SecurityManager； Subject 其实是一个门面，SecurityManager 才是实际的执行者；
- `SecurityManager`：安全管理器；即所有与安全有关的操作都会与 SecurityManager 交互；且其管理着所有 Subject；可以看出它是 Shiro 的核心，它负责与 Shiro 的其他组件进行交互，它相当于 SpringMVC 中 DispatcherServlet 的角色
- `Realm`：Shiro 从 Realm 获取安全数据（如用户、角色、权限），就是说SecurityManager 要验证用户身份，那么它需要从 Realm 获取相应的用户 进行比较以确定用户身份是否合法；也需要从 Realm 得到用户相应的角色/ 权限进行验证用户是否能进行操作；可以把 Realm 看成 DataSource，即安全数据源。

也就是说对于我们而言，最简单的一个 Shiro 应用：

1. 应用代码通过 Subject 来进行认证和授权，而 Subject 又委托给SecurityManager；
2. 我们需要给 Shiro 的 SecurityManager 注入 Realm，从而让 SecurityManager 能得到合法的用户及其权限进行判断。

::: tip
从以上也可以看出，Shiro 不提供维护用户/权限，而是通过 Realm 让开发人员自己注入。
:::

### Shiro 内部来看

![An image](/img/java/permission/03.png)

- `Subject`：任何可以与应用交互的“用户”；
- `SecurityManager` ：相当于 SpringMVC 中的 DispatcherServlet；是 Shiro 的心脏； 所有具体的交互都通过 SecurityManager 进行控制；它管理着所有 Subject、且负责进 行认证、授权、会话及缓存的管理。
- `Authenticator`：负责 Subject 认证，是一个扩展点，可以自定义实现；可以使用认证 策略（Authentication Strategy），即什么情况下算用户认证通过了；
- `Authorizer`：授权器、即访问控制器，用来决定主体是否有权限进行相应的操作；即控 制着用户能访问应用中的哪些功能；
- `Realm`：可以有 1 个或多个 Realm，可以认为是安全实体数据源，即用于获取安全实体的；可以是 JDBC 实现，也可以是内存实现等等；由用户提供；所以一般在应用中都需要实现自己的 Realm；
- `SessionManager`：管理 Session 生命周期的组件；而 Shiro 并不仅仅可以用在 Web 环境，也可以用在如普通的 JavaSE 环境
- `CacheManager`：缓存控制器，来管理如用户、角色、权限等的缓存的；因为这些数据基本上很少改变，放到缓存中后可以提高访问的性能
- `Cryptography`：密码模块，Shiro 提高了一些常见的加密组件用于如密码加密/解密。
