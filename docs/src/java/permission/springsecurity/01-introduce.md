# 简介概览

Java 企业级开发生态丰富，无论你想做哪方面的功能，都有众多的框架和工具可供选择，以至于 SUN 公司在早些年不得不制定了很多规范，这些规范在今天依然影响着我们的开发，安全领域也是如此。然而，不同于其他领域，在 Java 企业级开发中，安全管理方面的框架非常少，一般来说，主要有三种方案：

- Shiro
- Spring Security
- 开发者自己实现

Shiro 本身是一个老牌的安全管理框架，有着众多的优点，例如轻量、简单、易于集成、可以在 JavaSE 环境中使用等。不过，在微服务时代，Shiro 就显得力不从心了，在微服务面前，它无法充分展示自己的优势。

也有开发者选择自己实现安全管理，据笔者所知，这一部分人不在少数。但是一个系统的安全，不仅仅是登录和权限控制这么简单，我们还要考虑各种各样可能存在的网络攻击以及防御策略，从这个角度来说，开发者自己实现安全管理也并非是一件容易的事情，只有大公司才有足够的人力物力去支持这件事情。

Spring Security 作为 Spring 家族的一员，在和 Spring 家族的其他成员如 Spring Boot、SpringCloud 等进行整合时，具有其他框架无可比拟的优势，同时对 OAuth2 有着良好的支持，再加上 Spring Cloud 对 Spring Security 的不断加持（如推出 Spring Cloud Security），让 Spring Security不知不觉中成为微服务项目的首选安全管理方案。

## 核心功能

对于一个安全管理框架而言，无论是 Shiro 还是 Spring Security，最核心的功能，无非就是如下两方面：

- 认证
- 授权

### 认证

Spring Security 支持多种不同的认证方式，这些认证方式有的是 Spring Security 自己提供的认证功能，有的是第三方标准组织制订的。Spring Security 集成的主流认证机制主要有如下几种：

- 表单认证。
- OAuth2.0 认证。
- SAML2.0 认证。
- CAS 认证。
- RememberMe 自动认证。
- JAAS 认证。
- OpenID 去中心化认证。
- Pre-Authentication Scenarios 认证。
- X509 认证。
- HTTP Basic 认证。
- HTTP Digest 认证。

作为一个开放的平台，Spring Security 提供的认证机制不仅仅包括上面这些，我们还可以通过引入第三方依赖来支持更多的认证方式，同时，如果这些认证方式无法满足我们的需求，我们也可以自定义认证逻辑。

### 授权

无论采用了上面哪种认证方式，都不影响在 Spring Security 中使用授权功能。Spring Security 支持基于 URL 的请求授权、支持方法访问授权、支持 SpEL 访问控制、支持域对象安全（ACL），同时也支持动态权限配置、支持 RBAC 权限模型等，总之，我们常见的权限管理需求，Spring Security 基本上都是支持的。
