# Shiro整合JWT流程

在Springboot中使用Shiro，导入maven坐标。

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-spring-boot-starter</artifactId>
    <version>1.12.0</version>
</dependency>
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>3.19.2</version>
</dependency>
```

## 创建 JWTToken 替换 Shiro 原生 Token

1. Shiro 原生的 Token 中存在用户名和密码以及其他信息 [验证码，记住我]
2. 在 JWT 的 Token 中因为**已将用户名和密码通过加密处理整合到一个加密串中**，所以只需要一个 token 字段即可

```java
public class ShiroToken implements AuthenticationToken {

    /**
     * 用于确保在对象序列化过程中，版本号一致。
     * 当一个对象被序列化后，它的字节流可以被存储在文件系统中或通过网络传输到另一个计算机。
     * 当接收方收到字节流并反序列化它时，它需要确保序列化和反序列化的版本号一致，否则就会抛出版本不一致的异常。
     * 因此，在序列化类中，需要为每个类提供一个唯一的 serialVersionUID，确保在版本升级时，反序列化仍然可以正确地工作。
     */
    private static final long serialVersionUID = 1L;

    private String token;

    public ShiroToken(String token) {
        this.token = token;
    }

    @Override
    public Object getPrincipal() {
        return token;
    }

    @Override
    public Object getCredentials() {
        return token;
    }
}
```

## 创建 ShiroFilter 实现前端请求统一拦截及处理

1. `isAccessAllowed()` 方法中的 `SecurityUtils.getSubject().login(token)` 就是触发 **Shiro Realm** 自身的登录控制，具体内容需要手动实现
2. `isAccessAllowed()` 判断是否可以登录到系统
3. `onAccessDenied()` 当`isAccessAllowed()`返回false时，登录被拒绝，进入此接口进行异常处理

```java
public class LoginFilter extends BasicHttpAuthenticationFilter {

    private String errorCode;
    private String errorMsg;

    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        // 判断请求头是否带上Token
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String token = httpServletRequest.getHeader("Authorization");
        if (StringUtils.isEmpty(token)) {
            this.errorCode = ResultCode.NO_ACCESS_ERROR.code;
            this.errorMsg = ResultCode.NO_ACCESS_ERROR.msg;
            return false;
        }
        try {
            // 交给 ShiroRealm
            SecurityUtils.getSubject().login(new ShiroToken(token));
            return true;
        } catch (Exception e) {
            // 处理异常
            Throwable cause = e.getCause();
            if (cause instanceof CustomException) {
                errorCode = ((CustomException) cause).getCode();
                errorMsg = ((CustomException) cause).getMsg();
            } else {
                this.errorCode = ResultCode.NO_ACCESS_ERROR.code;
                this.errorMsg = ResultCode.NO_ACCESS_ERROR.msg;
            }

            return false;
        }
    }

    /**
     * 当 isAccessAllowed() 返回 false 时，登录被拒绝，进入此接口进行异常处理
     */
    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws IOException {
        Result error = Result.error(errorCode, errorMsg);
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
        httpResponse.setContentType("application/json;charset=utf-8");
        httpResponse.getWriter().write(JSON.toJSONString(error));
        return false;
    }

    /**
     * 对跨域访问提供支持
     */
    @Override
    protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        httpServletResponse.setHeader("Access-control-Allow-Origin", httpServletRequest.getHeader("Origin"));
        httpServletResponse.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
        httpServletResponse.setHeader("Access-Control-Allow-Headers", httpServletRequest.getHeader("Access-Control-Request-Headers"));
        // 跨域发送一个option请求
        if (httpServletRequest.getMethod().equals(RequestMethod.OPTIONS.name())) {
            httpServletResponse.setStatus(HttpStatus.OK.value());
            return false;
        }
        return super.preHandle(request, response);
    }

}
```

## 自定义 ShiroRealm 实现 Shiro Realm 的登录控制

1. 重写 **Realm** 的 `supports()` 方法是通过 JWT 进行登录判断的关键

2. 因为前文中创建了 **JWTToken** 用于替换 Shiro 原生 token

3. 所以必须在此方法中显式的进行替换，否则在进行判断时会一直失败

4. Realm是shiro的核心组件，主要处理两大功能：

   - 认证：我们接收filter传过来的token，并认证login操作的token
   - 授权：获取到登录用户信息，并取得用户的权限存入roles，以便后期对接口进行操作权限验证

```java
public class ShiroRealm extends AuthorizingRealm {
    
    @Resource
    private RedisTemplate redisTemplate;

    /**
     * 限定这个realm只能处理ShiroToken
     */
    @Override
    public boolean supports(AuthenticationToken token) {
        return token instanceof ShiroToken;
    }

    /**
     * 授权
     * 在@Controller上使用授权相关注解的时候调用
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        UserDTO user = (UserDTO) principalCollection.getPrimaryPrincipal();

        SimpleAuthorizationInfo simpleAuthorizationInfo = new SimpleAuthorizationInfo();

        String cacheId = RedisConstant.LOGIN_USER_KEY.concat(String.valueOf(user.getId()));

        String userCacheStr = (String) redisTemplate.opsForValue().get(cacheId);

        UserDTO userCache = JSON.parseObject(userCacheStr, UserDTO.class);

        // 根据用户名查询角色
        simpleAuthorizationInfo.addRoles(userCache.getRoles());
        // 根据用户名查询权限
        simpleAuthorizationInfo.addStringPermissions(userCache.getMenus());
        return simpleAuthorizationInfo;
    }

    /**
     * 认证
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        // 这里的AuthenticationToken是用 JwtToken重写的实现方法getPrincipal()/getCredentials()都返回token
        String token = authenticationToken.getCredentials().toString();

        // 验证token
        UserDTO userDTO = JwtUtil.parseToken(token);
        String cacheId = RedisConstant.LOGIN_USER_KEY.concat(String.valueOf(userDTO.getId()));

        String userCacheStr = (String) redisTemplate.opsForValue().get(cacheId);

        UserDTO userCache = JSON.parseObject(userCacheStr, UserDTO.class);

        // 1.判断请求是否有效
        if (ObjectUtils.isEmpty(userCache) || !token.equals(userCache.getToken())) {
            throw new CustomException(ResultCode.INVALID_TOKEN_ERROR);
        }

        // 2.判断是否需要续期
        if (redisTemplate.getExpire(cacheId) < (RedisConstant.LOGIN_USER_TTL / 3)) {
            redisTemplate.opsForValue().set(cacheId, userCacheStr, RedisConstant.LOGIN_USER_TTL, TimeUnit.SECONDS);
        }

        //交给AuthenticatingRealm使用CredentialsMatcher进行密码匹配，不设置则使用默认的SimpleCredentialsMatcher
        return new SimpleAuthenticationInfo(userDTO, token, getName());
    }

}
```

## 在 ShiroConfiguration 中将所有的请求指向 JWT

1. 指定自定义实现的 **ShiroRealm** 用于传入 **DefaultWebSecurityManager**

2. 在 **securityManager** 中关闭默认的 Session 控制

3. 因为在前后分离项目中前端是无法获取到后端 Session 的，即无法实现用户登录状态的同步

4. 在 `shiroFilterFactoryBean()` 中传入自定义的 **LoginFilte**

5. 并将所有的请求指向该过滤器 `filterRuleMap.put("/**", "token")`

6. 过滤器安装顺序过滤，注意Map类型，最好使用`LinkedHashMap`

```java
@Configuration
public class ShiroConfig {

    /**
     * 过滤器：责拦截所有请求
     *
     * @param defaultWebSecurityManager
     * @return
     */
    @Bean("shiroFilterFactoryBean")
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(DefaultWebSecurityManager defaultWebSecurityManager) {

        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        // 给filter设置安全管理器
        shiroFilterFactoryBean.setSecurityManager(defaultWebSecurityManager);

        // 添加自定义过滤器，取名为token
        Map<String, Filter> filterMap = new LinkedHashMap<>();
        filterMap.put("token", new LoginFilter());
        shiroFilterFactoryBean.setFilters(filterMap);
        
        /*
         * 配置系统受限资源
         * 自定义url规则
         * http://shiro.apache.org/web.html#urls-
         */
        Map<String, String> map = new LinkedHashMap<>();
        map.put("/user/login", "anon");
        // 所有请求通过我们自己的过滤器
        map.put("/**", "token");
        shiroFilterFactoryBean.setFilterChainDefinitionMap(map);

        return shiroFilterFactoryBean;
    }

    /**
     * 创建安全管理器
     */
    @Bean
    public DefaultWebSecurityManager getDefaultWebSecurityManager(ShiroRealm shiroRealm) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        // 给安全管理器设置自定义Realm
        securityManager.setRealm(shiroRealm);
        /*
         * 关闭shiro自带的session，详情见文档
         * http://shiro.apache.org/session-management.html#SessionManagement-StatelessApplications%28Sessionless%29
         */
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        securityManager.setSubjectDAO(subjectDAO);

        return securityManager;
    }

    @Bean
    public DefaultAdvisorAutoProxyCreator getDefaultAdvisorAutoProxyCreator(){
        DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator=new DefaultAdvisorAutoProxyCreator();
        /**
         * setUsePrefix(false)用于解决一个奇怪的bug。在引入spring aop的情况下。
         * 在@Controller注解的类的方法中加入@RequiresRole等shiro注解，会导致该方法无法映射请求，导致返回404。
         * 加入这项配置能解决这个bug
         */
        defaultAdvisorAutoProxyCreator.setUsePrefix(true);
        return defaultAdvisorAutoProxyCreator;
    }

}
```

## 统一异常处理

```java
@ControllerAdvice
@Order(value = 1)
public class ShiroExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler({AuthenticationException.class, UnknownAccountException.class,
            UnauthenticatedException.class, IncorrectCredentialsException.class})
    @ResponseBody
    public Result authenticationError(Exception exception) {
        logger.error("异常信息：", exception.getMessage(), exception);
        return Result.error();
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(UnauthorizedException.class)
    @ResponseBody
    public Result unauthorizedError(UnauthorizedException exception) {
        logger.error("异常信息：", exception.getMessage(), exception);
        return Result.error(ResultCode.NO_ACCESS_ERROR.code, ResultCode.NO_ACCESS_ERROR.msg);
    }
}
```

## 完整代码示例

[SpringBoot+Shiro+Redis+JWT](https://gitee.com/take_to/springboot-shiro-demo.git)
