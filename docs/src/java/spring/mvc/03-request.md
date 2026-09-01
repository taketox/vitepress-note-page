# 请求参数

## 访问路径

`@RequestMapping` 注解的作用就是将请求的 URL 地址和处理请求的方式（handler方法）关联起来，建立映射关系。

`SpringMVC` 接收到指定的请求，就会来找到在映射关系中对应的方法来处理这个请求。

### 精准路径匹配

在 `@RequestMapping` 注解指定 URL 地址时，不使用任何通配符，按照请求地址进行精确匹配。

```java
@Controller
public class UserController {

    /**
     * 精准设置访问地址 /user/login
     */
    @RequestMapping(value = {"/user/login"})
    @ResponseBody
    public String login(){
        System.out.println("UserController.login");
        return "login success!!";
    }

    /**
     * 精准设置访问地址 /user/register
     */
    @RequestMapping(value = {"/user/register"})
    @ResponseBody
    public String register(){
        System.out.println("UserController.register");
        return "register success!!";
    }
    
}
```

### 模糊路径匹配

在 `@RequestMapping` 注解指定 URL 地址时，通过使用通配符，匹配多个类似的地址。

```java
@Controller
public class ProductController {

    /**
     *  路径设置为 /product/*  
     *    /* 为单层任意字符串  /product/a  /product/aaa 可以访问此handler  
     *    /product/a/a 不可以
     *  路径设置为 /product/** 
     *   /** 为任意层任意字符串  /product/a  /product/aaa 可以访问此handler  
     *   /product/a/a 也可以访问
     */
    @RequestMapping("/product/*")
    @ResponseBody
    public String show(){
        System.out.println("ProductController.show");
        return "product show!";
    }
}
```

>单层匹配和多层匹配：
>`/*`：只能匹配URL地址中的一层，如果想准确匹配两层，那么就写 `/*/*` 以此类推。
>`/**`：可以匹配URL地址中的多层。
>其中所谓的一层或多层是指一个URL地址字符串被 `/` 划分出来的各个层次
>这个知识点虽然对于 `@RequestMapping` 注解来说实用性不大，但是将来配置拦截器的时候也遵循这个规则。

### 类和方法级别区别

`@RequestMapping` 注解可以用于类级别和方法级别，它们之间的区别如下：

1. 设置到类级别：`@RequestMapping` 注解可以设置在控制器类上，用于映射整个控制器的通用请求路径。这样，如果控制器中的多个方法都需要映射同一请求路径，就不需要在每个方法上都添加映射路径。
2. 设置到方法级别：`@RequestMapping` 注解也可以单独设置在控制器方法上，用于更细粒度地映射请求路径和处理方法。当多个方法处理同一个路径的不同操作时，可以使用方法级别的 `@RequestMapping` 注解进行更精细的映射。

```java
// 1.标记到handler方法
@RequestMapping("/user/login")
@RequestMapping("/user/register")
@RequestMapping("/user/logout")

// 2.优化标记类+handler方法
//类上
@RequestMapping("/user")
// handler方法上
@RequestMapping("/login")
@RequestMapping("/register")
@RequestMapping("/logout")
```

### 附带请求方式限制

HTTP 协议定义了八种请求方式，在 SpringMVC 中封装到了下面这个枚举类：

```java
public enum RequestMethod {
  GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE
}
```

默认情况下：`@RequestMapping("/logout")` 任何请求方式都可以访问！

如果需要特定指定：

```java
@Controller
public class UserController {

    /**
     * 精准设置访问地址 /user/login
     * method = RequestMethod.POST 可以指定单个或者多个请求方式!
     * 注意:违背请求方式会出现405异常!
     */
    @RequestMapping(value = {"/user/login"} , method = RequestMethod.POST)
    @ResponseBody
    public String login(){
        System.out.println("UserController.login");
        return "login success!!";
    }

    /**
     * 精准设置访问地址 /user/register
     */
    @RequestMapping(value = {"/user/register"},method = {RequestMethod.POST,RequestMethod.GET})
    @ResponseBody
    public String register(){
        System.out.println("UserController.register");
        return "register success!!";
    }
}
```

> 违背请求方式，会出现405异常！！！

### 进阶注解

还有 `@RequestMapping` 的 HTTP 方法特定快捷方式变体：

- `@GetMapping`
- `@PostMapping`
- `@PutMapping`
- `@DeleteMapping`
- `@PatchMapping`

```java
@RequestMapping(value="/login",method=RequestMethod.GET)
||
@GetMapping(value="/login")
```

注意：进阶注解只能添加到handler方法上，无法添加到类上！

**常见配置问题：**

出现原因：多个 handler 方法映射了同一个地址，导致 SpringMVC 在接收到这个地址的请求时该找哪个 handler 方法处理。

> There is already 'demo03MappingMethodHandler' bean method cc.taketo.mvc.handler.Demo03MappingMethodHandler#empGet() **mapped**.

## 接收参数

### param和json参数比较

在 HTTP 请求中，我们可以选择不同的参数类型，如 param 类型和 JSON 类型。下面对这两种参数类型进行区别和对比：

1. 参数编码

   param 类型的参数会被编码为 ASCII 码。例如，假设 `name=john doe`，则会被编码为 `name=john%20doe`。而 JSON 类型的参数会被编码为 UTF-8。

2. 参数顺序

   param 类型的参数没有顺序限制。但是，JSON 类型的参数是有序的。JSON 采用键值对的形式进行传递，其中键值对是有序排列的。

3. 数据类型

   param 类型的参数仅支持字符串类型、数值类型和布尔类型等简单数据类型。而 JSON 类型的参数则支持更复杂的数据类型，如数组、对象等。

4. 嵌套性

   param 类型的参数不支持嵌套。但是，JSON 类型的参数支持嵌套，可以传递更为复杂的数据结构。

5. 可读性

   param 类型的参数格式比 JSON 类型的参数更加简单、易读。但是，JSON 格式在传递嵌套数据结构时更加清晰易懂。

总的来说，param 类型的参数适用于单一的数据传递，而 JSON 类型的参数则更适用于更复杂的数据结构传递。根据具体的业务需求，需要选择合适的参数类型。

在实际开发中，常见的做法是：在 GET 请求中采用 param 类型的参数，而在 POST 请求中采用 JSON 类型的参数传递。

### param参数接收

**直接接值：**

客户端请求

```bash
http://localhost:8080/param/value?name=xx&age=18
```

handler接收参数

```java
@Controller
@RequestMapping("param")
public class ParamController {

    /**
     * 前端请求: http://localhost:8080/param/value?name=xx&age=18
     *
     * 可以利用形参列表,直接接收前端传递的param参数!
     *    要求: 参数名 = 形参名
     *          类型相同
     * 出现乱码正常，json接收具体解决！！
     * @return 返回前端数据
     */
    @GetMapping(value="/value")
    @ResponseBody
    public String setupForm(String name,int age){
        System.out.println("name = " + name + ", age = " + age);
        return name + age;
    }
}
```

只要形参数名和类型与传递参数相同，即可自动接收!

**@RequestParam注解：**

可以使用 `@RequestParam` 注释将 Servlet 请求参数（即查询参数或表单数据）绑定到控制器中的方法参数。

`@RequestParam`使用场景：

- 指定绑定的请求参数名
- 要求请求参数必须传递
- 为请求参数提供默认值

```java
 /**
 * 前端请求: http://localhost:8080/param/data?name=xx&stuAge=18
 * 
 *  使用@RequestParam注解标记handler方法的形参
 *  指定形参对应的请求参数@RequestParam(请求参数名称)
 */
@GetMapping(value="/data")
@ResponseBody
public Object paramForm(@RequestParam("name") String name, 
                        @RequestParam("stuAge") int age){
    System.out.println("name = " + name + ", age = " + age);
    return name+age;
}
```

默认情况下，使用此批注的方法参数是必需的，但您可以通过将 `@RequestParam` 批注的 `required` 标志设置为 `false`！

如果没有没有设置非必须，也没有传递参数会出现 `400`。

```java
@GetMapping(value="/data")
@ResponseBody
public Object paramForm(@RequestParam("name") String name, 
                        @RequestParam(value = "stuAge", required = false, defaultValue = "18") int age){
    System.out.println("name = " + name + ", age = " + age);
    return name+age;
}
```

**特殊场景接值：**

1. 一名多值

   多选框，提交的数据的时候一个key对应多个值，我们可以使用集合进行接收！

   ```java
     /**
      * 前端请求: http://localhost:8080/param/mul?hbs=吃&hbs=喝
      *
      *  一名多值,可以使用集合接收即可!但是需要使用@RequestParam注解指定
      */
     @GetMapping(value="/mul")
     @ResponseBody
     public Object mulForm(@RequestParam List<String> hbs){
         System.out.println("hbs = " + hbs);
         return hbs;
     }
   ```

2. 实体接收

   Spring MVC 是 Spring 框架提供的 Web 框架，它允许开发者使用实体对象来接收 HTTP 请求中的参数。通过这种方式，可以在方法内部直接使用对象的属性来访问请求参数，而不需要每个参数都写一遍。下面是一个使用实体对象接收参数的示例：

   定义一个用于接收参数的实体类：

   ```java
   public class User {
   
     private String name;
   
     private int age = 18;
   
     // getter 和 setter 略
   }
   ```

   在控制器中，使用实体对象接收，示例代码如下：

   ```java
   @Controller
   @RequestMapping("param")
   public class ParamController {
   
       @RequestMapping(value = "/user", method = RequestMethod.POST)
       @ResponseBody
       public String addUser(User user) {
           // 在这里可以使用 user 对象的属性来接收请求参数
           System.out.println("user = " + user);
           return "success";
       }
   }
   ```

   ::: warning

   在上述代码中，将请求参数name和age映射到实体类属性上！要求属性名必须等于参数名！否则无法映射！

   发起请求类型必须为：`x-www-form-urlencoded`

   :::

### 路径参数接收

路径传递参数是一种在 URL 路径中传递参数的方式。在 `RESTful` 的 Web 应用程序中，经常使用路径传递参数来表示资源的唯一标识符或更复杂的表示方式。而 Spring MVC 框架提供了 `@PathVariable` 注解来处理路径传递参数。

`@PathVariable` 注解允许将 URL 中的占位符映射到控制器方法中的参数。

例如，如果我们想将 `/user/{id}` 路径下的 `{id}` 映射到控制器方法的一个参数中，则可以使用 `@PathVariable` 注解来实现。

下面是一个使用 `@PathVariable` 注解处理路径传递参数的示例：

```java
 /**
 * 动态路径设计: /user/{动态部分}/{动态部分}   动态部分使用{}包含即可! {}内部动态标识!
 * 形参列表取值: @PathVariable Long id  如果形参名 = {动态标识} 自动赋值!
 *              @PathVariable("动态标识") Long id  如果形参名 != {动态标识} 可以通过指定动态标识赋值!
 *
 * 访问测试:  /param/user/1/root  -> id = 1  uname = root
 */
@GetMapping("/user/{id}/{name}")
@ResponseBody
public String getUser(@PathVariable Long id, 
                      @PathVariable("name") String uname) {
    System.out.println("id = " + id + ", uname = " + uname);
    return "user_detail";
}
```

### json参数接收

前端传递 JSON 数据时，Spring MVC 框架可以使用 `@RequestBody` 注解来将 JSON 数据转换为 Java 对象。`@RequestBody` 注解表示当前方法参数的值应该从请求体中获取，并且需要指定 value 属性来指示请求体应该映射到哪个参数上。

其使用方式和示例代码如下：

1. 前端发送 JSON 数据的示例

   ```json
   {
     "name": "张三",
     "age": 18,
     "gender": "男"
   }
   ```

2. 定义一个用于接收 JSON 数据的 Java 类

   ```java
   public class Person {
     private String name;
     private int age;
     private String gender;
     // getter 和 setter 略
   }
   ```

3. 在控制器中，使用 `@RequestBody` 注解来接收 JSON 数据，并将其转换为 Java 对象

   ```java
   @PostMapping("/person")
   @ResponseBody
   public String addPerson(@RequestBody Person person) {
   
     // 在这里可以使用 person 对象来操作 JSON 数据中包含的属性
     return "success";
   }
   ```

   在上述代码中，`@RequestBody` 注解将请求体中的 JSON 数据映射到 `Person` 类型的 `person` 参数上，并将其作为一个对象来传递给 `addPerson()` 方法进行处理。

### 接收Cookie数据

可以使用 `@CookieValue` 注释将 HTTP Cookie 的值绑定到控制器中的方法参数。

考虑使用以下 cookie 的请求：

```java
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```

下面的示例演示如何获取 cookie 值：

```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) { 
  //...
}
```

### 接收请求头数据

可以使用 `@RequestHeader` 批注将请求标头绑定到控制器中的方法参数。

请考虑以下带有标头的请求：

```java
Host                    localhost:8080
Accept                  text/html,application/xhtml+xml,application/xml;q=0.9
Accept-Language         fr,en-gb;q=0.7,en;q=0.3
Accept-Encoding         gzip,deflate
Accept-Charset          ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive              300
```

下面的示例获取 `Accept-Encoding` 和 `Keep-Alive` 标头的值：

```java
@GetMapping("/demo")
public void handle(
    @RequestHeader("Accept-Encoding") String encoding, 
    @RequestHeader("Keep-Alive") long keepAlive) { 
  //...
}
```

### 原生Api对象操作

[Method Arguments :: Spring Framework](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html)

下表描述了支持的控制器方法参数

| Controller method argument 控制器方法参数                    | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `jakarta.servlet.ServletRequest`, `jakarta.servlet.ServletResponse` | 请求/响应对象                                                |
| `jakarta.servlet.http.HttpSession`                           | 强制存在会话。因此，这样的参数永远不会为 `null` 。           |
| `java.io.InputStream`, `java.io.Reader`                      | 用于访问由 Servlet API 公开的原始请求正文。                  |
| `java.io.OutputStream`, `java.io.Writer`                     | 用于访问由 Servlet API 公开的原始响应正文。                  |
| `@PathVariable`                                              | 接收路径参数注解                                             |
| `@RequestParam`                                              | 用于访问 Servlet 请求参数，包括多部分文件。参数值将转换为声明的方法参数类型。 |
| `@RequestHeader`                                             | 用于访问请求标头。标头值将转换为声明的方法参数类型。         |
| `@CookieValue`                                               | 用于访问Cookie。Cookie 值将转换为声明的方法参数类型。        |
| `@RequestBody`                                               | 用于访问 HTTP 请求正文。正文内容通过使用 `HttpMessageConverter` 实现转换为声明的方法参数类型。 |
| `java.util.Map`, `org.springframework.ui.Model`, `org.springframework.ui.ModelMap` | 共享域对象，并在视图呈现过程中向模板公开。                   |
| `Errors`, `BindingResult`                                    | 验证和数据绑定中的错误信息获取对象！                         |

获取原生对象示例：

```java
/**
 * 如果想要获取请求或者响应对象,或者会话等,可以直接在形参列表传入,并且不分先后顺序!
 * 注意: 接收原生对象,并不影响参数接收!
 */
@GetMapping("api")
@ResponseBody
public String api(HttpSession session , HttpServletRequest request,
                  HttpServletResponse response){
    String method = request.getMethod();
    System.out.println("method = " + method);
    return "api";
}
```

## 共享域对象操作

### 属性（共享）域作用回顾

在 JavaWeb 中，共享域指的是在 Servlet 中存储数据，以便在同一 Web 应用程序的多个组件中进行共享和访问。常见的共享域有四种：`ServletContext`、`HttpSession`、`HttpServletRequest`、`PageContext`。

1. `ServletContext` 共享域：`ServletContext` 对象可以在整个 Web 应用程序中共享数据，是最大的共享域。一般可以用于保存整个 Web 应用程序的全局配置信息，以及所有用户都共享的数据。在 `ServletContext` 中保存的数据是线程安全的。
2. `HttpSession` 共享域：`HttpSession` 对象可以在同一用户发出的多个请求之间共享数据，但只能在同一个会话中使用。比如，可以将用户登录状态保存在 `HttpSession` 中，让用户在多个页面间保持登录状态。
3. `HttpServletRequest` 共享域：`HttpServletRequest` 对象可以在同一个请求的多个处理器方法之间共享数据。比如，可以将请求的参数和属性存储在 `HttpServletRequest` 中，让处理器方法之间可以访问这些数据。
4. `PageContext` 共享域：`PageContext` 对象是在 JSP 页面Servlet 创建时自动创建的。它可以在 JSP 的各个作用域中共享数据，包括`pageScope`、`requestScope`、`sessionScope`、`applicationScope` 等作用域。

共享域的作用是提供了方便实用的方式在同一 Web 应用程序的多个组件之间传递数据，并且可以将数据保存在不同的共享域中，根据需要进行选择和使用。

![An image](/img/java/spring/mvc/06.png)

### Request级别属性（共享）域

1. 使用 Model 类型的形参

   ```java
   @RequestMapping("/attr/request/model")
   @ResponseBody
   // 在形参位置声明Model类型变量，用于存储模型数据
   public String testAttrRequestModel(Model model) {
       
       // 我们将数据存入模型，SpringMVC 会帮我们把模型数据存入请求域
       // 存入请求域这个动作也被称为暴露到请求域
       model.addAttribute("requestScopeMessageModel","i am very happy[model]");
       
       return "target";
   }
   ```

2. 使用 ModelMap 类型的形参

   ```java
   @RequestMapping("/attr/request/model/map")
   @ResponseBody
   // 在形参位置声明ModelMap类型变量，用于存储模型数据
   public String testAttrRequestModelMap(ModelMap modelMap) {
       
       // 我们将数据存入模型，SpringMVC 会帮我们把模型数据存入请求域
       // 存入请求域这个动作也被称为暴露到请求域
       modelMap.addAttribute("requestScopeMessageModelMap","i am very happy[model map]");
       
       return "target";
   }
   ```

3. 使用 Map 类型的形参

   ```java
   @RequestMapping("/attr/request/map")
   @ResponseBody
   // 在形参位置声明Map类型变量，用于存储模型数据
   public String testAttrRequestMap(Map<String, Object> map) {
       
       // 我们将数据存入模型，SpringMVC 会帮我们把模型数据存入请求域
       // 存入请求域这个动作也被称为暴露到请求域
       map.put("requestScopeMessageMap", "i am very happy[map]");
       
       return "target";
   }
   ```

4. 使用原生 request 对象

   ```java
   @RequestMapping("/attr/request/original")
   @ResponseBody
   // 拿到原生对象，就可以调用原生方法执行各种操作
   public String testAttrOriginalRequest(HttpServletRequest request) {
       
       request.setAttribute("requestScopeMessageOriginal", "i am very happy[original]");
       
       return "target";
   }
   ```

5. 使用 ModelAndView 对象

   ```java
   @RequestMapping("/attr/request/mav")
   public ModelAndView testAttrByModelAndView() {
       
       // 1.创建ModelAndView对象
       ModelAndView modelAndView = new ModelAndView();
       // 2.存入模型数据
       modelAndView.addObject("requestScopeMessageMAV", "i am very happy[mav]");
       // 3.设置视图名称
       modelAndView.setViewName("target");
       
       return modelAndView;
   }
   ```

### Session级别属性（共享）域

```java
@RequestMapping("/attr/session")
@ResponseBody
public String testAttrSession(HttpSession session) {
    //直接对session对象操作,即对会话范围操作!
    return "target";
}
```

### Application级别属性（共享）域

解释：springmvc会在初始化容器的时候，讲servletContext对象存储到ioc容器中！

```java
@Autowired
private ServletContext servletContext;

@RequestMapping("/attr/application")
@ResponseBody
public String attrApplication() {
    
    servletContext.setAttribute("appScopeMsg", "i am hungry...");
    
    return "target";
}
```
