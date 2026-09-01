# 快速开始

## 环境要求

- JDK：Java17+**（Spring6要求JDK最低版本是Java17）**

- Maven：3.6+

- Spring：6.1.2

- Tomcat：10.1.18

## 配置分析

1. DispatcherServlet，设置处理所有请求！
2. HandlerMapping，HandlerAdapter，Handler需要加入到IoC容器，供DS调用！
3. Handler自己声明（Controller）需要配置到HandlerMapping中供DS查找！

## 项目搭建

### 引入依赖

```xml
<properties>
    <spring.version>6.1.2</spring.version>
    <servlet.api>9.1.0</servlet.api>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <!-- springioc相关依赖  -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>

    <!-- web相关依赖  -->
    <!-- 在 pom.xml 中引入 Jakarta EE Web API 的依赖 -->
    <!--
        在 Spring Web MVC 6 中，Servlet API 迁移到了 Jakarta EE API，因此在配置 DispatcherServlet 时需要使用
         Jakarta EE 提供的相应类库和命名空间。错误信息 “‘org.springframework.web.servlet.DispatcherServlet’
         is not assignable to ‘javax.servlet.Servlet,jakarta.servlet.Servlet’” 表明你使用了旧版本的
         Servlet API，没有更新到 Jakarta EE 规范。
    -->
    <dependency>
        <groupId>jakarta.platform</groupId>
        <artifactId>jakarta.jakartaee-web-api</artifactId>
        <version>${servlet.api}</version>
        <scope>provided</scope>
    </dependency>

    <!-- springwebmvc相关依赖  -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>${spring.version}</version>
    </dependency>

</dependencies>
```

### Controller声明

```java
@Controller
public class HelloController {

    //handlers

    /**
     * handler就是controller内部的具体方法
     * @RequestMapping("/springmvc/hello") 就是用来向handlerMapping中注册的方法注解!
     * @ResponseBody 代表向浏览器直接返回数据!
     */
    @RequestMapping("/springmvc/hello")
    @ResponseBody
    public String hello(){
        System.out.println("HelloController.hello");
        return "hello springmvc!!";
    }
}
```

### 核心组件配置类

容器扫描

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerAdapter;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

//TODO: SpringMVC对应组件的配置类 [声明SpringMVC需要的组件信息]

//TODO: 导入handlerMapping和handlerAdapter的三种方式
 //1.自动导入handlerMapping和handlerAdapter [推荐]
 //2.可以不添加,springmvc会检查是否配置handlerMapping和handlerAdapter,没有配置默认加载
 //3.使用@Bean方式配置handlerMapper和handlerAdapter
@EnableWebMvc     
@Configuration
@ComponentScan(basePackages = "cc.taketo.controller") //TODO: 进行controller扫
//WebMvcConfigurer springMvc进行组件配置的规范,配置组件,提供各种方法! 前期可以实现
public class SpringMvcConfig implements WebMvcConfigurer {

    @Bean
    public HandlerMapping handlerMapping(){
        return new RequestMappingHandlerMapping();
    }

    @Bean
    public HandlerAdapter handlerAdapter(){
        return new RequestMappingHandlerAdapter();
    }
    
}
```

初始化类

```java
//TODO: SpringMVC提供的接口,是替代web.xml的方案,更方便实现完全注解方式ssm处理!
//TODO: Springmvc框架会自动检查当前类的实现类,会自动加载 getRootConfigClasses / getServletConfigClasses 提供的配置类
//TODO: getServletMappings 返回的地址 设置DispatherServlet对应处理的地址
public class MyWebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

  /**
   * 指定service / mapper层的配置类
   */
  @Override
  protected Class<?>[] getRootConfigClasses() {
    return null;
  }

  /**
   * 指定springmvc的配置类
   * @return
   */
  @Override
  protected Class<?>[] getServletConfigClasses() {
    return new Class<?>[] { SpringMvcConfig.class };
  }

  /**
   * 设置dispatcherServlet的处理路径!
   * 一般情况下为 / 代表处理所有请求!
   */
  @Override
  protected String[] getServletMappings() {
    return new String[] { "/" };
  }
}
```

启动类

```java
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import org.springframework.web.WebApplicationInitializer;

public class Main implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        System.out.println("Server started");
    }
}
```

### 项目配置

转为web项目

![An image](/img/java/spring/mvc/03.png)

tomcat配置

![An image](/img/java/spring/mvc/04.png)

![An image](/img/java/spring/mvc/05.png)

### 启动测试

浏览器访问

```bash
http://localhost:8081/springmvc/hello
```
