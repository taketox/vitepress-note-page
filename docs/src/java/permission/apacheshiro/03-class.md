# 重要的类与方法

## AuthorizingRealm

一般在真实的项目中，我们不会直接实现`Realm`接口，也不会直接继承最底层的功能贼复杂的`IniRealm`。我们一般的情况就是直接继承`AuthorizingRealm`，能够继承到认证与授权功能。

`AuthorizingRealm` 将获取 Subject 相关信息分成两步：获取身份验证信息（doGetAuthenticationInfo）及授权信息（doGetAuthorizationInfo）；

**doGetAuthenticationInfo获取身份验证相关信息：**

该方法主要是用于当前登录用户授权

1. 调用SecurityUtils.getSubject().isPermitted(String str)方法时会调用
2. 在@Controller 上@RequiresRoles("admin")在方法上加注解的时候调用（划重点）

**doGetAuthorizationInfo 获取授权信息：**

 该方法是进行用户验证

1. 调用currUser.login(token)方法时会调用doGetAuthenticationInfo方法

## AuthenticationToken

AuthenticationToken 用于收集用户提交的身份（如用户名）及凭据（如密码）。Shiro会调用`CredentialsMatcher`对象的`doCredentialsMatch`方法对`AuthenticationInfo`对象和`AuthenticationToken`进行匹配。匹配成功则表示主体（Subject）认证成功，否则表示认证失败。

```java
public interface AuthenticationToken extends Serializable { 
    Object getPrincipal(); //身份
    Object getCredentials(); //凭据
}
```

**RememberMeAuthenticationToken：**

它继承自AuthenticationToken，可用在跨会话记住用户身份。注意，当为相应的用户创建新会话时，该用户的身份将被记住，但不会被视为已通过身份验证

**UsernamePasswordToken：**

用于实现基于用户名/密码主体（Subject）身份认证。`UsernamePasswordToken`实现了 `RememberMeAuthenticationToken` 和 `HostAuthenticationToken`，可以实现“记住我”及“主机验证”的支持。

一般情况下`UsernamePasswordToken`已经可以满足我们的大多数需求。当我们遇到需要声明自己的Token类时，可以根据需求来实现`AuthenticationToken`。

## AuthenticationInfo

**AuthenticationInfo** 有两个作用：

1. 如果 Realm 是 AuthenticatingRealm 子类，则提供给 AuthenticatingRealm 内部使用的CredentialsMatcher 进行凭据验证；（如果没有继承它需要在自己的 Realm 中自己实现验证）；
2. 提供给 SecurityManager 来创建 Subject（提供身份信息）；
   MergableAuthenticationInfo 用于提供在多 Realm 时合并 AuthenticationInfo 的功能，主要合 并 Principal、如果是其他的如 credentialsSalt，会用后边的信息覆盖前边的。

比 如 HashedCredentialsMatcher ， 在 验 证 时 会 判 断 AuthenticationInfo 是否是SaltedAuthenticationInfo 子类，来获取盐信息。

Account 相当于我们之前的 User，SimpleAccount 是其一个实现；在 IniRealm、PropertiesRealm这种静态创建帐号信息的场景中使用，这些 Realm 直接继承了 SimpleAccountRealm，而 SimpleAccountRealm 提供了相关的 API 来动态维护 SimpleAccount；即可以通过这些 API来动态增删改查 SimpleAccount；动态增删改查角色/权限信息。及如果您的帐号不是特别多，可以使用这种方式。

**其他情况一般返回 SimpleAuthenticationInfo 即可。**

## PrincipalCollection

PrincipalCollection是一个身份集合，因为我们可以在Shiro中同时配置多个Realm，所以呢身份信息可能就有多个；因此其提供了PrincipalCollection用于聚合这些身份信息：

```java
public interface PrincipalCollection extends Iterable, Serializable {  
    Object getPrimaryPrincipal(); //得到主要的身份  
    <T> T oneByType(Class<T> type); //根据身份类型获取第一个  
    <T> Collection<T> byType(Class<T> type); //根据身份类型获取一组  
    List asList(); //转换为List  
    Set asSet(); //转换为Set  
    Collection fromRealm(String realmName); //根据Realm名字获取  
    Set<String> getRealmNames(); //获取所有身份验证通过的Realm名字  
    boolean isEmpty(); //判断是否为空  
}  
```

因为PrincipalCollection聚合了多个，此处最需要注意的是**getPrimaryPrincipal，如果只有一个Principal 那么直接返回即可，如果有多个Principal，则返回第一个（因为内部使用Map存储，所以可以认为是返回任意一个）**；oneByType / byType根据凭据的类型返回相应的Principal；fromRealm 根据Realm 名字（每个Principal 都与一个Realm 关联）获取相应的Principal。

## AuthorizationInfo

**AuthorizationInfo** 用于聚合授权信息的：

```java
public interface AuthorizationInfo extends Serializable { 
    Collection<String> getRoles(); //获取角色字符串信息
    Collection<String> getStringPermissions(); //获取权限字符串信息
    Collection<Permission> getObjectPermissions(); //获取 Permission 对象信息
}
```

**当 我 们 使 用 AuthorizingRealm 时 ， 如果身份验证成功 ，在 进 行 授 权 时 就 通 过doGetAuthorizationInfo 方法获取角色/权限信息用于授权验证。**

Shiro 提供了一个实现 SimpleAuthorizationInfo，大多数时候使用这个即可。

## Subject

Subject 是 Shiro 的核心对象，基本所有身份验证、授权都是通过 Subject 完成。

**身份信息获取：**

```java
Object getPrincipal(); //Primary Principal 
PrincipalCollection getPrincipals(); // PrincipalCollection
```

 **身份验证：**

```java
void login(AuthenticationToken token) throws AuthenticationException; 
boolean isAuthenticated(); 
boolean isRemembered();
```

通过 login 登录，如果登录失败将抛出相应的 AuthenticationException。

如果登录成功调用 isAuthenticated 就会返回 true，即已经通过身份验证；

如果 isRemembered 返回 true，表示是通过记住我功能登录的而不是调用 login 方法登录的。

isAuthenticated/isRemembered 是互斥的，即如果其中一个返回 true，另一个返回 false。

**角色授权验证：**

```java
boolean hasRole(String roleIdentifier); 
boolean[] hasRoles(List<String> roleIdentifiers); 
boolean hasAllRoles(Collection<String> roleIdentifiers); 
void checkRole(String roleIdentifier) throws AuthorizationException; 
void checkRoles(Collection<String> roleIdentifiers) throws AuthorizationException; 
void checkRoles(String... roleIdentifiers) throws AuthorizationException;
```

hasRole进行角色验证，验证后返回 true/false；而 checkRole验证失败时抛出 AuthorizationException 异常。

**权限授权验证：**

```java
boolean isPermitted(String permission); 
boolean isPermitted(Permission permission); 
boolean[] isPermitted(String... permissions); 
boolean[] isPermitted(List<Permission> permissions); 
boolean isPermittedAll(String... permissions); 
boolean isPermittedAll(Collection<Permission> permissions); 
void checkPermission(String permission) throws AuthorizationException; 
void checkPermission(Permission permission) throws AuthorizationException; 
void checkPermissions(String... permissions) throws AuthorizationException; 
void checkPermissions(Collection<Permission> permissions) throws AuthorizationException;
```

isPermitted进行权限验证，验证后返回 true/false；而 checkPermission验证失败时抛出 AuthorizationException。

**会话：**

```java
Session getSession(); //相当于 getSession(true) 
Session getSession(boolean create);
```

类似于 Web 中的会话。如果登录成功就相当于建立了会话，接着可以使用 getSession 获取；如果 create=true 如果没有会话将返回 null，而 create=true 如果没有会话会强制创建一个。

**退出：**

```java
void logout();
```

**RunAs：**

```java
void runAs(PrincipalCollection principals) throws NullPointerException, IllegalStateException; 
boolean isRunAs(); 
PrincipalCollection getPreviousPrincipals(); 
PrincipalCollection releaseRunAs();
```

RunAs 即实现**允许 A 假设为 B 身份进行访问**；通过调用 subject.runAs(b)进行访问；接着调用 subject.getPrincipals 将获取到 B 的身份；此时调用 isRunAs 将返回 true；而 a 的身份需要通过 subject. getPreviousPrincipals 获取；如果不需要 RunAs 了调用 subject。releaseRunAs 即可。

**多线程：**

```java
<V> V execute(Callable<V> callable) throws ExecutionException; 
void execute(Runnable runnable); 
<V> Callable<V> associateWith(Callable<V> callable); 
Runnable associateWith(Runnable runnable);
```

实现线程之间的 Subject 传播，因为 Subject 是线程绑定的；因此在多线程执行中需要传播到相应的线程才能获取到相应的 Subject。最简单的办法就是通过 execute(runnable/callable实例)直接调用；或者通过 associateWith(runnable/callable 实例)得到一个包装后的实例；它们都是通过把当前线程的 Subject 绑定过去；在线程执行结束后自动释放。Subject 自己不会实现相应的身份验证/授权逻辑，而是通过 DelegatingSubject 委托给SecurityManager 实现；可以理解为 Subject 是一个面门。

对于 Subject 的构建一般没必要我们去创建；一般通过 SecurityUtils.getSubject()获取：

```java
public static Subject getSubject() { 
    Subject subject = ThreadContext.getSubject(); 
    if (subject == null) { 
     subject = (new Subject.Builder()).buildSubject(); 
     ThreadContext.bind(subject); 
    } 
    return subject; 
}
```

即首先查看当前线程是否绑定了 Subject，如果没有通过 Subject.Builder 构建一个然后绑定到现场返回。

如果想自定义创建，可以通过：

```java
new Subject.Builder().principals(身份).authenticated(true/false).buildSubject()
```

这种可以创建相应的 Subject 实例了，然后自己绑定到线程即可。在 new Builder()时如果没 有传入 SecurityManager，自动调用 SecurityUtils.getSecurityManager 获取；也可以自己传入一个实例。
