# 访问控制

## 身份验证

**身份验证**：即在应用中谁能证明他就是他本人。一般提供如他们的身份 ID 一些标识信息来 表明他就是他本人，如提供身份证，用户名/密码来证明。

在Shiro中，用户需要提供principals（身份）和credentials（证明）给Shiro，从而应用能验证用户身份：

**principals**：身份，即主体的标识属性，可以是任何属性，如用户名、邮箱等，唯一即可。一个主体可以有多个principals，但只有一个Primary principals，一般是用户名/邮箱/手机号。

**credentials**：证明/凭证，即只有主体知道的安全值，如密码/数字证书等。

最常见的principals和credentials组合就是用户名/密码

### 认证流程

**登陆认证流程：**

1. 收集用户身份/凭证，即如用户名/密码
2. 调用 `Subject.login` 进行登录，如果失败将得到相应 的 `AuthenticationException` 异常，根据异常提示用户 错误信息；否则登录成功
3. 创建自定义的 Realm 类，继承 `org.apache.shiro.realm.AuthenticatingRealm`类，实现 `doGetAuthenticationInfo()` 方法

**代码示例：**

```java
public class Main {
    public static void main(String[] args) {
        // 从ini文件中加载用户信息(已弃用)
        IniSecurityManagerFactory factory = new IniSecurityManagerFactory("classpath:shiro.ini");
        // 初始化获取 SecurityManager
        SecurityManager securityManager = factory.getInstance();
        SecurityUtils.setSecurityManager(securityManager);
        // 获取Subject对象
        Subject subject = SecurityUtils.getSubject();
        // 创建token对象, web应用中用户名和密码来自网页传入
        UsernamePasswordToken token = new UsernamePasswordToken("zhangsan", "123");
        // 用户登陆
        try {
            subject.login(token);
            System.out.println("登陆成功");
        } catch (UnknownAccountException e) {
            System.out.println("用户不存在");
        } catch (IncorrectCredentialsException e) {
            System.out.println("密码不正确");
        } catch (AuthenticationException e) {
            System.out.println("认证异常");
        }
    }
}
```

**配置文件：**

```ini
[users]
zhangsan=123
lisi=321
```

如上测试的几个问题：

1. 用户名/密码硬编码在 ini 配置文件，以后需要改成如数据库存储，且密码需要加密存储；
2. 用户身份 Token 可能不仅仅是用户名/密码，也可能还有其他的，如登录时允许用户名/邮箱/手机号同时登录。

**身份认证流程：**

1. 首先调用 `Subject.login(token)` 进行登录，其会自动委托给 `SecurityManager`
2. `SecurityManager` 负责真正的身份验证逻辑；它会委托给 Authenticator 进行身份验证；
3. Authenticator 才是真正的身份验证者，Shiro API 中核心的身份 认证入口点，此处可以自定义插入自己的实现；
4. Authenticator 可能会委托给相应的 `AuthenticationStrategy` 进 行多 Realm 身份验证，默认 `ModularRealmAuthenticator` 会调用 `AuthenticationStrategy` 进行多 Realm 身份验证；
5. Authenticator 会把相应的 token 传入 Realm，从 Realm 获取 身份验证信息，如果没有返回/抛出异常表示身份验证失败了。此处 可以配置多个Realm，将按照相应的顺序及策略进行访问

## 访问控制

- **授权**，也叫访问控制，即在应用中控制谁访问哪些资源（如访问页面/编辑数据/页面操作 等）。在授权中需了解的几个关键对象：主体（Subject）、资源（Resource）、权限 （Permission）、角色（Role）。
- **主体(Subject)**：访问应用的用户，在 Shiro 中使用 Subject 代表该用户。用户只有授权 后才允许访问相应的资源。
- **资源(Resource)**：在应用中用户可以访问的 URL，比如访问 JSP 页面、查看/编辑某些 数据、访问某个业务方法、打印文本等等都是资源。用户只要授权后才能访问。
- **权限(Permission)**：安全策略中的原子授权单位，通过权限我们可以表示在应用中用户 有没有操作某个资源的权力。即权限表示在应中用户能不能访问某个资源，如：访问用 户列表页面查看/新增/修改/删除用户数据（即很多时候都是CRUD（增查改删）式权限控 制）等。权限代表了用户有没有操作某个资源的权利，即反映在某个资源上的操作允不允 许。
- Shiro 支持粗粒度权限（如用户模块的所有权限）和细粒度权限（操作某个用户的权限， 即实例级别的）
- **角色(Role)**：权限的集合，一般情况下会赋予用户角色而不是权限，即这样用户可以拥有 一组权限，赋予权限时比较方便。典型的如：项目经理、技术总监、CTO、开发工程师等 都是角色，不同的角色拥有一组不同的权限

### 授权方式

**编程式**：通过写if/else 授权代码块完成

```java
if (subject.hasRole("admin")) {
    // 有权限
} else {
    // 无权限
}
```

**注解式**：通过在执行的Java方法上放置相应的注解完成，没有权限将抛出相应的异常

```java
@RequiresRoles("admin")
```

**标签式**：在JSP/GSP 页面通过相应的标签完成

```xml
<shiro:hasRole name="admin">
    // 有权限
</shiro:hasRole>
```

### 授权流程

1. 首先调用`Subject.isPermitted/hasRole`接口，其会委托给`SecurityManager`，而`SecurityManager`接着会委托给 Authorizer；
2. Authorizer是真正的授权者，如果调用如`isPermitted(“user:view”)`，其首先会通过`PermissionResolver`把字符串转换成相应的Permission实例；
3. 在进行授权之前，其会调用相应的Realm获取Subject相应的角色/权限用于匹配传入的角色/权限；
4. Authorizer会判断Realm的角色/权限是否和传入的匹配，如果有多个Realm，会委托给`ModularRealmAuthorizer`进行循环判断，如果匹配如`isPermitted/hasRole`会返回true，否则返回false表示授权失败

**代码示例：**

```java
subject.login(token);
System.out.println("登陆成功");
// 判断是否拥有指定角色
boolean flag = subject.hasRole("admin");
System.out.println("是否拥有admin权限: " + flag); //true
// 判断是否拥有指定权限
boolean[] flags = subject.isPermitted("user:insert", "user:delete");
System.out.println("是否拥有user:insert权限:" + flags[0]); //true
System.out.println("是否拥有user:delete权限:" + flags[1]); //true
```

**配置文件：**

```ini
[users]
zhangsan=123,admin
lisi=321,user
[roles]
admin=user:insert,user:delete
user=user:query
```

### Shiro 加密

实际系统开发中，一些敏感信息需要进行加密，比如说用户的密码。Shiro 内嵌很多常用的加密算法，比如 MD5 加密。Shiro 可以很简单的使用信息加密。

```java
    public void encryption() {
        //密码明文
        String password = "123";
        //使用 md5 加密
        Md5Hash md5Hash = new Md5Hash(password);
        System.out.println("md5 加密：" + md5Hash.toHex());
        //带盐的 md5 加密，盐就是在密码明文后拼接新字符串，然后再进行加密
        Md5Hash md5Hash2 = new Md5Hash(password, "salt");
        System.out.println("md5 带盐加密：" + md5Hash2.toHex());
        //为了保证安全，避免被破解还可以多次迭代加密，保证数据安全
        Md5Hash md5Hash3 = new Md5Hash(password, "salt", 3);
        System.out.println("md5 带盐三次加密：" + md5Hash3.toHex());
        //使用父类实现加密
        SimpleHash simpleHash = new SimpleHash("MD5", password, "salt", 3);
        System.out.println("父类带盐三次加密：" + simpleHash.toHex());
    }
    
// md5 加密：202cb962ac59075b964b07152d234b70
// md5 带盐加密：8c4fb7bf681156b52fea93442c7dffc9
// md5 带盐三次加密：07ca00e10899418f0ea4ab92a9d69065
// 父类带盐三次加密：07ca00e10899418f0ea4ab92a9d69065
```

### 自定义登录认证

Shiro 默认的登录认证是不带加密的，如果想要实现加密认证需要自定义登录认证，自定义 Realm。

**代码示例：**

```java
public class ShiroRealm extends AuthenticatingRealm {

    //自定义的登录认证方法，Shiro 的 login 方法底层会调用该类的认证方法完成登录认证
    //需要配置自定义的 realm 生效，在 ini 文件中配置，或 Springboot 中配置
    //该方法只是获取进行对比的信息，认证逻辑还是按照 Shiro 的底层认证逻辑完成认证
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        // 获取身份信息
        String principal = authenticationToken.getPrincipal().toString();
        // 获取凭证信息
        String password = new String((char[]) authenticationToken.getCredentials());
        System.out.println("认证用户信息：" + principal + "---" + password);
        // 获取数据库中存储的用户信息
        if (principal.equals("zhangsan")) {
            // 数据库存储的加盐迭代 3 次密码
            String pwdInfo = "07ca00e10899418f0ea4ab92a9d69065";
            // 创建封装了校验逻辑的对象，将要比较的数据给该对象
            AuthenticationInfo info = new SimpleAuthenticationInfo(
                    authenticationToken.getPrincipal(),
                    pwdInfo,
                    ByteSource.Util.bytes("salt"),
                    authenticationToken.getPrincipal().toString());
            return info;
        }
        return null;
    }
}
```

**配置文件：**

```ini
[users]
zhangsan=123,admin
lisi=321,user
[roles]
admin=user:insert,user:delete
user=user:query
[main]
md5CredentialsMatcher=org.apache.shiro.authc.credential.Md5CredentialsMatcher
md5CredentialsMatcher.hashIterations=3
ShiroRealm=cc.taketo.config.ShiroRealm
ShiroRealm.credentialsMatcher=$md5CredentialsMatcher
securityManager.realms=$ShiroRealm
```
