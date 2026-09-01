# 拦截器

## 拦截器概念

拦截器和过滤器解决问题

- 生活中

  为了提高乘车效率，在乘客进入站台前统一检票

  ![An image](/img/java/spring/mvc/09.png)

- 程序中

  在程序中，使用拦截器在请求到达具体 handler 方法前，统一执行检测

  ![An image](/img/java/spring/mvc/10.png)

拦截器 Springmvc VS 过滤器 javaWeb：

- 相似点
  - 拦截：必须先把请求拦住，才能执行后续操作
  - 过滤：拦截器或过滤器存在的意义就是对请求进行统一处理
  - 放行：对请求执行了必要操作后，放请求过去，让它访问原本想要访问的资源
- 不同点
  - 工作平台不同
    - 过滤器工作在 Servlet 容器中
    - 拦截器工作在 SpringMVC 的基础上
  - 拦截的范围
    - 过滤器：能够拦截到的最大范围是整个 Web 应用
    - 拦截器：能够拦截到的最大范围是整个 SpringMVC 负责的请求
  - IOC 容器支持
    - 过滤器：想得到 IOC 容器需要调用专门的工具方法，是间接的
    - 拦截器：它自己就在 IOC 容器中，所以可以直接从 IOC 容器中装配组件，也就是可以直接得到 IOC 容器的支持

选择：

功能需要如果用 SpringMVC 的拦截器能够实现，就不使用过滤器。

![An image](/img/java/spring/mvc/11.png)

## 拦截器使用

1. 创建拦截器类

   ```java
   public class Process01Interceptor implements HandlerInterceptor {
   
       // if( ! preHandler()){return;}
       // 在处理请求的目标 handler 方法前执行
       @Override
       public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
           System.out.println("request = " + request + ", response = " + response + ", handler = " + handler);
           System.out.println("Process01Interceptor.preHandle");
            
           // 返回true：放行
           // 返回false：不放行
           return true;
       }
    
       // 在目标 handler 方法之后，handler报错不执行!
       @Override
       public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
           System.out.println("request = " + request + ", response = " + response + ", handler = " + handler + ", modelAndView = " + modelAndView);
           System.out.println("Process01Interceptor.postHandle");
       }
    
       // 渲染视图之后执行(最后),一定执行!
       @Override
       public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
           System.out.println("request = " + request + ", response = " + response + ", handler = " + handler + ", ex = " + ex);
           System.out.println("Process01Interceptor.afterCompletion");
       }
   }
   ```

   拦截器方法拦截位置：

   ![An image](/img/java/spring/mvc/12.png)

2. 修改配置类添加拦截器

   ```java
   @EnableWebMvc  //json数据处理,必须使用此注解,因为他会加入json处理器
   @Configuration
   @ComponentScan(basePackages = {"cc.taketo.controller","cc.taketo.exceptionhandler"}) //TODO: 进行controller扫描
   //WebMvcConfigurer springMvc进行组件配置的规范,配置组件,提供各种方法! 前期可以实现
   public class SpringMvcConfig implements WebMvcConfigurer {
   
       //配置jsp对应的视图解析器
       @Override
       public void configureViewResolvers(ViewResolverRegistry registry) {
           //快速配置jsp模板语言对应的
           registry.jsp("/WEB-INF/views/",".jsp");
       }
   
       //开启静态资源处理 <mvc:default-servlet-handler/>
       @Override
       public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
           configurer.enable();
       }
   
       //添加拦截器
       @Override
       public void addInterceptors(InterceptorRegistry registry) { 
           //将拦截器添加到Springmvc环境,默认拦截所有Springmvc分发的请求
           registry.addInterceptor(new Process01Interceptor());
       }
   }
   ```

3. 配置详解

   1. 默认拦截全部

      ```java
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          //将拦截器添加到Springmvc环境,默认拦截所有Springmvc分发的请求
          registry.addInterceptor(new Process01Interceptor());
      }
      
      ```

   2. 精准配置

      ```java
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          
          //将拦截器添加到Springmvc环境,默认拦截所有Springmvc分发的请求
          registry.addInterceptor(new Process01Interceptor());
          
          //精准匹配,设置拦截器处理指定请求 路径可以设置一个或者多个,为项目下路径即可
          //addPathPatterns("/common/request/one") 添加拦截路径
          //也支持 /* 和 /** 模糊路径。 * 任意一层字符串 ** 任意层 任意字符串
          registry.addInterceptor(new Process01Interceptor()).addPathPatterns("/common/request/one","/common/request/tow");
      }
      
      ```

   3. 排除配置

      ```java
      //添加拦截器
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          
          //将拦截器添加到Springmvc环境,默认拦截所有Springmvc分发的请求
          registry.addInterceptor(new Process01Interceptor());
          
          //精准匹配,设置拦截器处理指定请求 路径可以设置一个或者多个,为项目下路径即可
          //addPathPatterns("/common/request/one") 添加拦截路径
          registry.addInterceptor(new Process01Interceptor()).addPathPatterns("/common/request/one","/common/request/tow");
          
          
          //排除匹配,排除应该在匹配的范围内排除
          //addPathPatterns("/common/request/one") 添加拦截路径
          //excludePathPatterns("/common/request/tow"); 排除路径,排除应该在拦截的范围内
          registry.addInterceptor(new Process01Interceptor())
                  .addPathPatterns("/common/request/one","/common/request/tow")
                  .excludePathPatterns("/common/request/tow");
      }
      ```

4. 多个拦截器执行顺序

   1. preHandle() 方法：

      SpringMVC 会把所有拦截器收集到一起，然后按照配置顺序调用各个 preHandle() 方法。

   2. postHandle() 方法：

      SpringMVC 会把所有拦截器收集到一起，然后按照配置相反的顺序调用各个 postHandle() 方法。

   3. afterCompletion() 方法：

      SpringMVC 会把所有拦截器收集到一起，然后按照配置相反的顺序调用各个 afterCompletion() 方法。
