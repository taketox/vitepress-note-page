# SLF4J

## SLF4J是什么

SLF4J是Simple Logging Facade for Java的缩写(for≈4)，也就是简易的日志门面，以外观模式(Facade pattern，一种设计模式，为子系统中的一组接口提供一个统一的高层接口，使得子系统更容易使用)实现，支持java.util.logging、Log4和Logback。

SLF4J比Log4J强在哪

SLF4J可以帮助我们的应用程序独立于任何特定的日志系统，还有一个非常牛逼的功能，那就是SLF4J在打印日志的时候使用了占位符{}，它有点类似于String类的format()方法(使用s等填充参数)，但更加便捷，这在很大程度上提高了程序的性能。

众所周知，字符串是不可变的，字符串拼接会创建很多不必要的字符串对象，极大的消耗了内存空间。

但Log4J在打印带参数的日志时，只能使用字符串拼接的方式：

```java
String name = "taketo";
int age = 18;
logger.debug("姓名：" + name + "，年龄" + age);
```

非常笨重，但加入了SLF4J后，这个问题迎刃而解。

## 快速开始

在Log4J项目中加入SLF4J的详细的步骤。

把`Log4j`的依赖替换为`slf4j-log4j12`，(Maven会自动引入`slf4j-api.jar`和`Log4j.jar`)

```xml
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.25</version>
        </dependency>
```

在resources目录下创建`Log4j.properties`文件

```properties
### 设置###
log4j.rootLogger = debug,stdout,D,E
### 输出信息到控制台 ###
log4j.appender.stdout = org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target = System.out
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-ddHH:mm:ss,SSS} method:%l%n%m%n
### 输出DEBUG 级别以上的⽇志到 => debug.log ###
log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
log4j.appender.D.File = debug.log
log4j.appender.D.Append = true
log4j.appender.D.Threshold = DEBUG
log4j.appender.D.layout = org.apache.log4j.PatternLayout
log4j.appender.D.layout.ConversionPattern = %d{yyyy-MM-dd HH:mm:ss} [ %t:%r ]- [ %p ] %m%n
### 输出ERROR 级别以上的⽇志到 => error.log ###
log4j.appender.E = org.apache.log4j.DailyRollingFileAppender
log4j.appender.E.File = error.log
log4j.appender.E.Append = true
log4j.appender.E.Threshold = ERROR
log4j.appender.E.layout = org.apache.log4j.PatternLayout
log4j.appender.E.layout.ConversionPattern = %d{yyyy-MM-dd HH:mm:ss} [ %t:%r ]- [ %p ] %m%n
```

测试

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        logger.debug("姓名：{}，年龄：{}", "taketo", "18");
    }
}
```

## SLF4J优点

1. SLF4J可以统一日志系统，作为上层的抽象接口，不需要关注底层的日志实现，可以是Log4J，也可以是Logback，或者JUL、JCL。
2. SLF4J在打印日志的时候可以使用占位符，既提高了程序性能（临时字符串少了，垃圾回收的工作量就小），又让代码变得美观统一。
