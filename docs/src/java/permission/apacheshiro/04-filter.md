# 过滤器

## 概念

Shiro 使用了与 Servlet 一样的 Filter 接口进行扩展；

![An image](/img/java/permission/04.png)

**NameableFilter:**

NameableFilter给Filter起个名字，如果没有设置默认就是FilterName；还记得之前的如authc吗？当我们组装拦截器链时会根据这个名字找到相应的拦截器实例；

**OncePerRequestFilter:**

OncePerRequestFilter用于防止多次执行Filter的；也就是说一次请求只会走一次拦截器链；另外提供enabled属性，表示是否开启该拦截器实例，默认enabled=true表示开启，如果不想让某个拦截器工作，可以设置为false即可。

**ShiroFilter:**

ShiroFilter是整个Shiro的入口点，用于拦截需要安全控制的请求进行处理。

**AdviceFilter:**

AdviceFilter提供了AOP风格的支持，类似于SpringMVC中的Interceptor：

```java
boolean preHandle(ServletRequest request, ServletResponse response) throws Exception 
void postHandle(ServletRequest request, ServletResponse response) throws Exception 
void afterCompletion(ServletRequest request, ServletResponse response, Exception exception) throws Exception;
```

**preHandler**：类似于 AOP 中的前置增强；在拦截器链执行之前执行；如果返回 true 则继续拦截器链；否则中断后续的拦截器链的执行直接返回；进行预处理（如基于表单的身份验证、授权）
**postHandle**：类似于 AOP 中的后置返回增强；在拦截器链执行完成后执行；进行后处理（如记录执行时间之类的）；
**afterCompletion**：类似于 AOP 中的后置最终增强；即不管有没有异常都会执行；可以进行清理资源（如接触 Subject 与线程的绑定之类的）；

**PathMatchingFilter**
PathMatchingFilter 提供了基于 Ant 风格的请求路径匹配功能及拦截器参数解析的功能，如 “roles[admin,user]”自动根据“，”分割解析到一个路径参数配置并绑定到相应的路径：

```java
boolean pathsMatch(String path, ServletRequest request) 
boolean onPreHandle(ServletRequest request, ServletResponse response, Object mappedValue) throws Exception
```

**pathsMatch**：该方法用于 path 与请求路径进行匹配的方法；如果匹配返回 true；

**onPreHandle**：在 preHandle 中，当 pathsMatch 匹配一个路径后，会调用 opPreHandler 方法并将路径绑定参数配置传给 mappedValue；然后可以在这个方法中进行一些验证（如角色授权），如果验证失败可以返回 false 中断流程；默认返回 true；也就是说子类可以只实现 onPreHandle 即可，无须实现 preHandle。如果没有 path 与请求路径匹配，默认是通过的（即preHandle 返回 true）。

**AccessControlFilter**
AccessControlFilter 提供了访问控制的基础功能；比如是否允许访问/当访问拒绝时如何处理 等：

```java
abstract boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) throws Exception; 
boolean onAccessDenied(ServletRequest request, ServletResponse response, Object mappedValue) throws Exception; 
abstract boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception;
```

**isAccessAllowed**：表示是否允许访问；mappedValue 就是[urls]配置中拦截器参数部分，如果允许访问返回 true，否则 false；

**onAccessDenied**：表示当访问拒绝时是否已经处理了；如果返回 true 表示需要继续处理；如果返回 false 表示该拦截器实例已经处理了，将直接返回即可。

**onPreHandle**: 会自动调用这两个方法决定是否继续处理：

```java
boolean onPreHandle(ServletRequest request, ServletResponse response, Object mappedValue) throws Exception { 
 return isAccessAllowed(request, response, mappedValue) || onAccessDenied(request, response, mappedValue); 
}
```

另外 AccessControlFilter 还提供了如下方法用于处理如登录成功后/重定向到上一个请求：

```java
void setLoginUrl(String loginUrl) //身份验证时使用，默认/login.jsp 
String getLoginUrl() 
Subject getSubject(ServletRequest request, ServletResponse response) //获取 Subject 实例
boolean isLoginRequest(ServletRequest request, ServletResponse response)//当前请求是否是登录请求 
void saveRequestAndRedirectToLogin(ServletRequest request, ServletResponse response) throws IOException //将当前请求保存起来并重定向到登录页面 
void saveRequest(ServletRequest request) //将请求保存起来，如登录成功后再重定向回该请求
void redirectToLogin(ServletRequest request, ServletResponse response) //重定向到登录页面
```

比如基于表单的身份验证就需要使用这些功能。 到此基本的拦截器就完事了，如果我们想进行访问的控制就可以继承AccessControlFilter；如果我们要添加一些通用数据我们可以直接继承 PathMatchingFilter。

## 拦截器链

Shiro 对 Servlet 容器的 FilterChain 进行了代理，即 ShiroFilter 在Servlet 容器的 Filter链的执行之前，通过 ProxiedFilterChain 对 Servlet 容器的 FilterChain 进行了代理；**即先走Shiro 自己的 Filter 体系，然后才会委托给 Servlet 容器的 FilterChain 进行 Servlet 容器级别 的 Filter 链执行**；

**Shiro 的 ProxiedFilterChain 执行流程**：

1. 先执行 Shiro 自己的 Filter 链；
2. 再执行 Servlet 容器的 Filter 链（即原始的 Filter）。 而 ProxiedFilterChain 是通过 FilterChainResolver 根据配置文件中[urls]部分是否与请求的URL 是否匹配解析得到的。

```java
FilterChain getChain(ServletRequest request, ServletResponse response, FilterChain originalChain);
```

即传入原始的 chain 得到一个代理的 chain。

Shiro 内 部 提 供 了一个 路径匹 配 的 FilterChainResolver 实 现 ：PathMatchingFilterChainResolver，其根据[urls]中配置的 url 模式（默认 Ant 风格）= 拦截器链和请求的 url 是否匹配来解析得到配置的拦截器链的；而 PathMatchingFilterChainResolver内部通过 FilterChainManager 维护着拦截器链，比如 DefaultFilterChainManager 实现维护着 url 模式与拦截器链的关系。因此我们可以通过FilterChainManager 进行动态动态增加 url 模式与拦截器链的关系。

## 默认拦截器

Shiro 内置了很多默认的拦截器，比如身份验证、授权等相关的。

DefaultFilterChainManager 会默认添加 org.apache.shiro.web.filter.mgt.DefaultFilter 中声明的拦截器：

```java
public enum DefaultFilter { 
    anon(AnonymousFilter.class), 
    authc(FormAuthenticationFilter.class), 
    authcBasic(BasicHttpAuthenticationFilter.class), 
    logout(LogoutFilter.class), 
    noSessionCreation(NoSessionCreationFilter.class), 
    perms(PermissionsAuthorizationFilter.class), 
    port(PortFilter.class), 
    rest(HttpMethodPermissionFilter.class), 
    roles(RolesAuthorizationFilter.class), 
    ssl(SslFilter.class), 
    user(UserFilter.class); 
}
```

|   默认拦截器名    | 说明（括号里的表示默认值）                                   |
| :---------------: | :----------------------------------------------------------- |
|       authc       | 基于表单的拦截器；如"/**=authc"，如 果没有登录会跳到相应的登录页面登录； 主要属性：usernameParam：表单提交的用 户 名 参 数 名 （ username ） ；passwordParam：表单提交的密码参数名 （password）； rememberMeParam：表 单提交的密码参数名（rememberMe）；loginUrl：登录页面地址（/login.jsp）；successUrl：登录成功后的默认重定向地 址； failureKeyAttribute：登录失败后错 误信息存储 key（shiroLoginFailure）； |
|    authcBasic     | Basic HTTP 身份验证拦截器，主要属性：applicationName：弹出登录框显示的信息（application）； |
|      logout       | 退出拦截器，主要属性：redirectUrl：退 出 成 功 后 重 定 向 的 地 址 （ / ） ; 示 例"/logout=logout" |
|       user        | 用户拦截器，用户已经身份验证/记住我，登录的都可；示例"/**=user" |
|       anon        | 匿名拦截器，即不需要登录即可访问；一 般 用 于 静 态 资 源 过 滤 ； 示 例"/static/**=anon" |
|       roles       | 角色授权拦截器，验证用户是否拥有所有角色；主要属性： loginUrl：登录页面地址（/login.jsp）；unauthorizedUrl：未授 权 后 重 定 向 的 地 址 ； 示 例"/admin/**=roles[admin]" |
|       perms       | 权限授权拦截器，验证用户是否拥有所有权 限 ； 属 性 和 roles 一 样 ； 示 例"/user/**=perms["user:create"]" |
|       port        | 端口拦截器，主要属性：port（80）：可 以通过的端口；示例"/test= port[80]"，如果用户访问该页面是非 80，将自动将 请求端口改为 80 并重定向到该 80 端口，其他路径/参数等都一样 |
|       rest        | rest 风格拦截器，自动根据请求方法构建权 限 字 符 串 （ GET=read, POST=create,PUT=update,DELETE=delete,HEAD=read,TRACE=read,OPTIONS=read, MKCOL=create）构建权限字符串；示 例 " /users=rest[user] " ， 会 自 动 拼 出 "user:read,user:create,user:update,user:delete"权限字符串进行权限匹配（所有都得 匹配，isPermittedAll）； |
|        ssl        | SSL 拦截器，只有请求协议是 https 才能 通过；否则自动跳转会 https 端口（443）；其他和 port 拦截器一样； |
| noSessionCreation | 不 创 建 会话拦截器， 调 用 subject.getSession(false)不会有什么问题，但是如果 subject.getSession(true)将抛出 DisabledSessionException 异常； |
