# 响应数据

## handler方法分析

**理解handler方法的作用和组成：**

```java
/**
 * TODO: 一个controller的方法是控制层的一个处理器,我们称为handler
 * TODO: handler需要使用@RequestMapping/@GetMapping系列,声明路径,在HandlerMapping中注册,供DS查找!
 * TODO: handler作用总结:
 *       1.接收请求参数(param,json,pathVariable,共享域等) 
 *       2.调用业务逻辑 
 *       3.响应前端数据(页面（不讲解模版页面跳转）,json,转发和重定向等)
 * TODO: handler如何处理呢
 *       1.接收参数: handler(形参列表: 主要的作用就是用来接收参数)
 *       2.调用业务: { 方法体  可以向后调用业务方法 service.xx() }
 *       3.响应数据: return 返回结果,可以快速响应前端数据
 */
@GetMapping
public Object handler(简化请求参数接收){
    调用业务方法
    返回的结果 （页面跳转，返回数据（json））
    return 简化响应前端数据;
}
```

**总结：**

- 请求数据接收，我们都是通过handler的形参列表
- 前端数据响应，我们都是通过handler的return关键字快速处理！
- springmvc简化了参数接收和响应！

## 页面跳转控制

### 快速返回模板视图

1. 开发模式回顾

   在 Web 开发中，有两种主要的开发模式：前后端分离和混合开发。

   前后端分离模式：\[重点]

   指将前端的界面和后端的业务逻辑通过接口分离开发的一种方式。开发人员使用不同的技术栈和框架，前端开发人员主要负责页面的呈现和用户交互，后端开发人员主要负责业务逻辑和数据存储。前后端通信通过 API 接口完成，数据格式一般使用 JSON 或 XML。前后端分离模式可以提高开发效率，同时也有助于代码重用和维护。

   混合开发模式：

   指将前端和后端的代码集成在同一个项目中，共享相同的技术栈和框架。这种模式在小型项目中比较常见，可以减少学习成本和部署难度。但是，在大型项目中，这种模式会导致代码耦合性很高，维护和升级难度较大。

   对于混合开发，我们就需要使用动态页面技术，动态展示Java的共享域数据！！

2. jsp技术了解

   JSP（JavaServer Pages）是一种动态网页开发技术，它是由 Sun 公司提出的一种基于 Java 技术的 Web 页面制作技术，可以在 HTML 文件中嵌入 Java 代码，使得生成动态内容的编写更加简单。

   JSP 最主要的作用是生成动态页面。它允许将 Java 代码嵌入到 HTML 页面中，以便使用 Java 进行数据库查询、处理表单数据和生成 HTML 等动态内容。另外，JSP 还可以与 Servlet 结合使用，实现更加复杂的 Web 应用程序开发。

   JSP 的主要特点包括：

   1. 简单：JSP 通过将 Java 代码嵌入到 HTML 页面中，使得生成动态内容的编写更加简单。
   2. 高效：JSP 首次运行时会被转换为 Servlet，然后编译为字节码，从而可以启用 Just-in-Time（JIT）编译器，实现更高效的运行。
   3. 多样化：JSP 支持多种标准标签库，包括 JSTL（JavaServer Pages 标准标签库）、EL（表达式语言）等，可以帮助开发人员更加方便的处理常见的 Web 开发需求。
       总之，JSP 是一种简单高效、多样化的动态网页开发技术，它可以方便地生成动态页面和与 Servlet 结合使用，是 Java Web 开发中常用的技术之一。

3. 准备jsp页面和依赖

   pom.xml依赖

   ```xml
   <!-- jsp需要依赖! jstl-->
   <dependency>
       <groupId>jakarta.servlet.jsp.jstl</groupId>
       <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
       <version>3.0.0</version>
   </dependency>
   ```

   jsp页面创建

   建议位置：`/WEB-INF/` 下，避免外部直接访问！

   位置：`/WEB-INF/views/home.jsp`

   ```java
   <%@ page contentType="text/html;charset=UTF-8" language="java" %>
   <html>
     <head>
       <title>Title</title>
     </head>
     <body>
           <!-- 可以获取共享域的数据,动态展示! jsp== 后台vue -->
           ${msg}
     </body>
   </html>
   ```

4. 快速响应模版页面

   1. 配置jsp视图解析器

      ```java
      @EnableWebMvc  //json数据处理,必须使用此注解,因为他会加入json处理器
      @Configuration
      @ComponentScan(basePackages = "cc.taketo.controller") //TODO: 进行controller扫描
      
      //WebMvcConfigurer springMvc进行组件配置的规范,配置组件,提供各种方法! 前期可以实现
      public class SpringMvcConfig implements WebMvcConfigurer {
      
          //配置jsp对应的视图解析器
          @Override
          public void configureViewResolvers(ViewResolverRegistry registry) {
              //快速配置jsp模板语言对应的
              registry.jsp("/WEB-INF/views/",".jsp");
          }
      }
      ```

   2. handler返回视图

      ```java
      /**
       *  跳转到提交文件页面  /save/jump
       *  
       *  如果要返回jsp页面!
       *     1.方法返回值改成字符串类型
       *     2.返回逻辑视图名即可    
       *         <property name="prefix" value="/WEB-INF/views/"/>
       *            + 逻辑视图名 +
       *         <property name="suffix" value=".jsp"/>
       */
      @GetMapping("jump")
      public String jumpJsp(Model model){
          System.out.println("FileController.jumpJsp");
          model.addAttribute("msg","request data!!");
          return "home";
      }
      ```

### 转发和重定向

在 Spring MVC 中，Handler 方法返回值来实现快速转发，可以使用 `redirect` 或者 `forward` 关键字来实现重定向。

```java
@RequestMapping("/redirect-demo")
public String redirectDemo() {
    // 重定向到 /demo 路径 
    return "redirect:/demo";
}

@RequestMapping("/forward-demo")
public String forwardDemo() {
    // 转发到 /demo 路径
    return "forward:/demo";
}

// 注意： 转发和重定向到项目下资源路径都是相同，都不需要添加项目根路径！填写项目下路径即可！
```

**总结：**

- 将方法的返回值，设置String类型
- 转发使用forward关键字，重定向使用redirect关键字
- 关键字: /路径
- 注意：如果是项目下的资源，转发和重定向都一样都是项目下路径！都不需要添加项目根路径！

## 返回JSON数据

### 前置准备

导入jackson依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.0</version>
</dependency>
```

添加json数据转化器

@EnableWebMvc

```java
//TODO: SpringMVC对应组件的配置类 [声明SpringMVC需要的组件信息]

//TODO: 导入handlerMapping和handlerAdapter的三种方式
 //1.自动导入handlerMapping和handlerAdapter [推荐]
 //2.可以不添加,springmvc会检查是否配置handlerMapping和handlerAdapter,没有配置默认加载
 //3.使用@Bean方式配置handlerMapper和handlerAdapter
@EnableWebMvc  //json数据处理,必须使用此注解,因为他会加入json处理器
@Configuration
@ComponentScan(basePackages = "cc.taketo.controller") //TODO: 进行controller扫描

//WebMvcConfigurer springMvc进行组件配置的规范,配置组件,提供各种方法! 前期可以实现
public class SpringMvcConfig implements WebMvcConfigurer {


}
```

### @ResponseBody

1. 方法上使用@ResponseBody

   可以在方法上使用 `@ResponseBody`注解，用于将方法返回的对象序列化为 JSON 或 XML 格式的数据，并发送给客户端。在前后端分离的项目中使用！

   ```java
   @GetMapping("/accounts/{id}")
   @ResponseBody
   public Object handle() {
     // ...
     return obj;
   }
   ```

   具体来说，`@ResponseBody` 注解可以用来标识方法或者方法返回值，表示方法的返回值是要直接返回给客户端的数据，而不是由视图解析器来解析并渲染生成响应体（viewResolver没用）。

   测试方法：

   ```java
   @RequestMapping(value = "/user/detail", method = RequestMethod.POST)
   @ResponseBody
   public User getUser(@RequestBody User userParam) {
       System.out.println("userParam = " + userParam);
       User user = new User();
       user.setAge(18);
       user.setName("John");
       //返回的对象,会使用jackson的序列化工具,转成json返回给前端!
       return user;
   }
   ```

2. 类上使用@ResponseBody

   如果类中每个方法上都标记了 `@ResponseBody` 注解，那么这些注解就可以提取到类上。

   ```java
   @ResponseBody  //responseBody可以添加到类上,代表默认类中的所有方法都生效!
   @Controller
   @RequestMapping("param")
   public class ParamController {}
   ```

### @RestController

类上的 @ResponseBody 注解可以和 @Controller 注解合并为 @RestController 注解。所以使用了 @RestController 注解就相当于给类中的每个方法都加了 @ResponseBody 注解。

RestController源码

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestController {
 
  /**
   * The value may indicate a suggestion for a logical component name,
   * to be turned into a Spring bean in case of an autodetected component.
   * @return the suggested component name, if any (or empty String otherwise)
   * @since 4.0.1
   */
  @AliasFor(annotation = Controller.class)
  String value() default "";
 
}
```

## 返回静态资源处理

### 静态资源概念

资源本身已经是可以直接拿到浏览器上使用的程度了，**不需要在服务器端做任何运算、处理**。典型的静态资源包括：

- 纯HTML文件
- 图片
- CSS文件
- JavaScript文件

### 静态资源访问

开启静态资源处理

```java
@EnableWebMvc  //json数据处理,必须使用此注解,因为他会加入json处理器
@Configuration
@ComponentScan(basePackages = "cc.taketo.controller") //TODO: 进行controller扫描
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
}
```

**问题：**

开启静态资源处理，其他原本正常的handler请求访问不了了

**解决：**

```java
@EnableWebMvc  //json数据处理,必须使用此注解,因为他会加入json处理器
```
