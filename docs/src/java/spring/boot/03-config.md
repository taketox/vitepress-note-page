# 配置文件

## 统一配置管理

SpringBoot工程下，进行统一的配置管理，你想设置的任何参数（端口号、项目根路径、数据库连接信息等等）都集中到一个固定位置和命名的配置文件（`application.properties`或`application.yml`）中！

配置文件应该放置在Spring Boot工程的`src/main/resources`目录下。这是因为`src/main/resources`目录是Spring Boot默认的类路径（classpath），配置文件会被自动加载并可供应用程序访问。

![An image](/img/java/spring/boot/03.png)

功能配置参数说明：

[Common Application Properties (spring.io)](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties)

细节总结：

- 集中式管理配置。统一在一个文件完成程序功能参数设置和自定义参数声明 。
- 位置：`resources` 文件夹下，必须命名 `application`  后缀 `.properties / .yaml /  .yml`。
- 如果同时存在`application.properties | application.yml(.yaml)` ，`properties`的优先级更高。
- 配置基本都有默认值。`spring-boot-autoconfigure-3.2.1.jar->additional-spring-configuration-metadata.json`

## Properties

配置文件

在 resource 文件夹下面新建 `application.properties` 配置文件

```properties
# application.properties 为统一配置文件
# 内部包含: 固定功能的key,自定义的key
# 此处的配置信息,我们都可以在程序中@Value等注解读取

# 固定的key
# 启动端口号
server.port=80 

# 自定义
spring.jdbc.datasource.driverClassName=com.mysql.cj.jdbc.driver
spring.jdbc.datasource.url=jdbc:mysql:///springboot_01
spring.jdbc.datasource.username=root
spring.jdbc.datasource.password=root
```

读取配置文件

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Data
public class DataSourceProperties {

    @Value("${spring.jdbc.datasource.driverClassName}")
    private String driverClassName;

    @Value("${spring.jdbc.datasource.url}")
    private String url;

    @Value("${spring.jdbc.datasource.username}")
    private String username;

    @Value("${spring.jdbc.datasource.password}")
    private String password;
}
```

测试效果

在controller注入，输出进行测试

```java
@Autowired
private DataSourceProperties dataSourceProperties ;

@RequestMapping(path = "/hello")
public String sayHello() {
  System.out.println(dataSourceProperties);
  return "Hello Spring Boot ! " ;
}
```

## YAML

### 格式介绍

YAML（YAML Ain’t Markup Language）是一种基于层次结构的数据序列化格式，旨在提供一种易读、人类友好的数据表示方式。

**与`.properties`文件相比，YAML格式有以下优势：**

1. 层次结构：

   YAML文件使用缩进和冒号来表示层次结构，使得数据之间的关系更加清晰和直观。这样可以更容易理解和维护复杂的配置，特别适用于深层次嵌套的配置情况。

2. 自我描述性

   YAML文件具有自我描述性，字段和值之间使用冒号分隔，并使用缩进表示层级关系。这使得配置文件更易于阅读和理解，并且可以减少冗余的标点符号和引号。

3. 注释支持

   YAML格式支持注释，可以在配置文件中添加说明性的注释，使配置更具可读性和可维护性。相比之下，`.properties`文件不支持注释，无法提供类似的解释和说明。

4. 多行文本

   YAML格式支持多行文本的表示，可以更方便地表示长文本或数据块。相比之下，`.properties`文件需要使用转义符或将长文本拆分为多行。

5. 类型支持

   YAML格式天然支持复杂的数据类型，如列表、映射等。这使得在配置文件中表示嵌套结构或数据集合更加容易，而不需要进行额外的解析或转换。

6. 更好的可读性

   由于YAML格式的特点，它更容易被人类读懂和解释。它减少了配置文件中需要的特殊字符和语法，让配置更加清晰明了，从而减少了错误和歧义。

综上所述，YAML格式相对于`.properties`文件具有更好的层次结构表示、自我描述性、注释支持、多行文本表示、复杂数据类型支持和更好的可读性。这些特点使YAML成为一种有力的配置文件格式，尤其适用于复杂的配置需求和人类可读的场景。然而，选择使用YAML还是`.properties`取决于实际需求和团队的偏好，简单的配置可以使用`.properties`，而复杂的配置可以选择YAML以获得更多的灵活性和可读性

### 语法说明

1. 数据结构用树形结构呈现，通过缩进来表示层级，
2. 连续的项目（集合）通过减号 ” - ” 来表示
3. 键值结构里面的key/value对用冒号 ” : ” 来分隔。
4. YAML配置文件的扩展名是yaml 或 yml

**示例：**

```yaml
# YAML配置文件示例
app_name: 我的应用程序
version: 1.0.0
author: 张三

database:
  host: localhost
  port: 5432
  username: admin
  password: password123

features:
  - 登录
  - 注册
  - 仪表盘

settings:
  analytics: true
  theme: dark
```

### 使用

配置文件

```yaml
spring:
  jdbc:
    datasource:
      driverClassName: com.mysql.jdbc.Driver
      url: jdbc:mysql:///springboot_02
      username: root
      password: root
      
server:
  port: 80
```

读取配置文件

> 读取方式和properties一致

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Data
public class DataSourceProperties {

    @Value("${spring.jdbc.datasource.driverClassName}")
    private String driverClassName;

    @Value("${spring.jdbc.datasource.url}")
    private String url;

    @Value("${spring.jdbc.datasource.username}")
    private String username;

    @Value("${spring.jdbc.datasource.password}")
    private String password;
}
```

测试效果

在controller注入，输出进行测试

```java
@Autowired
private DataSourceProperties dataSourceProperties ;

@RequestMapping(path = "/hello")
public String sayHello() {
  System.out.println(dataSourceProperties);
  return "Hello Spring Boot ! " ;
}
```

## 配置文件注入

> `@ConfigurationProperties` 是 `SpringBoot` 提供的重要注解, 他可以将一些配置属性批量注入到bean对象。

创建类，添加属性和注解

在类上通过@ConfigurationProperties注解声明该类要读取属性配置

prefix="spring.jdbc.datasource" 读取属性文件中前缀为spring.jdbc.datasource的值。前缀和属性名称和配置文件中的key必须要保持一致才可以注入成功

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Data
@ConfigurationProperties(prefix = "spring.jdbc.datasource")
public class DataSourceConfigurationProperties {

    private String driverClassName;
    private String url;
    private String username;
    private String password;
}
```

测试效果

```java
@RestController
public class HelloController {

    @Autowired
    private DataSourceProperties dataSourceProperties;

    @Autowired
    private DataSourceConfigurationProperties dataSourceConfigurationProperties;

    @GetMapping("/hello")
    public String hello(){
        System.out.println("dataSourceProperties = " + dataSourceProperties);
        System.out.println("dataSourceConfigurationProperties = " + dataSourceConfigurationProperties);
        return "Hello,Spring Boot 3!";
    }
}
```

## 多环境配置

在Spring Boot中，可以使用多环境配置来根据不同的运行环境（如开发、测试、生产）加载不同的配置。SpringBoot支持多环境配置让应用程序在不同的环境中使用不同的配置参数，例如数据库连接信息、日志级别、缓存配置等。

以下是实现Spring Boot多环境配置的常见方法：

1. 属性文件分离：将应用程序的配置参数分离到不同的属性文件中，每个环境对应一个属性文件。例如，可以创建`application-dev.properties`、`application-prod.properties`和`application-test.properties`等文件。在这些文件中，可以定义各自环境的配置参数，如数据库连接信息、端口号等。然后，在`application.properties`中通过`spring.profiles.active`属性指定当前使用的环境。Spring Boot会根据该属性来加载对应环境的属性文件，覆盖默认的配置。
2. YAML配置文件：与属性文件类似，可以将配置参数分离到不同的YAML文件中，每个环境对应一个文件。例如，可以创建`application-dev.yml`、`application-prod.yml`和`application-test.yml`等文件。在这些文件中，可以使用YAML语法定义各自环境的配置参数。同样，通过`spring.profiles.active`属性指定当前的环境，Spring Boot会加载相应的YAML文件。
3. 命令行参数(动态)：可以通过命令行参数来指定当前的环境。例如，可以使用`--spring.profiles.active=dev`来指定使用开发环境的配置。
    通过上述方法，Spring Boot会根据当前指定的环境来加载相应的配置文件或参数，从而实现多环境配置。这样可以简化在不同环境之间的配置切换，并且确保应用程序在不同环境中具有正确的配置。

### 多环境

> 创建开发、测试、生产三个环境的配置文件
> application-dev.yml（开发）

```yaml
spring:
  jdbc:
    datasource:
      driverClassName: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql:///dev
      username: root
      password: root
```

application-test.yml（测试）

```yaml
spring:
  jdbc:
    datasource:
      driverClassName: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql:///test
      username: root
      password: root
```

application-prod.yml（生产）

```yaml
spring:
  jdbc:
    datasource:
      driverClassName: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql:///prod
      username: root
      password: root
```

### 环境激活

```yaml
spring:
  profiles:
    active: dev
```

::: tip
如果设置了spring.profiles.active，并且和application有重叠属性，以active设置优先。

如果设置了spring.profiles.active，和application无重叠属性，application设置依然生效！
:::
