# Log4j2

## Log4j2优点

1. 在多线程场景下，Log4j2的吞吐量比Logback高出了10倍，延迟降低了几个数量级。这话听起来像吹牛，反正是Log4j2官方自己吹的。
2. Log4j2的异步Logger使用的是无锁数据结构，而Logback和Log4j的异步Logger使用的是ArrayBlockingQueue。对于阻塞队列，多线程应用程序在尝试使日志事件入队时通常会遇到锁争用。
3. Log4j2可以减少垃圾收集器的压力。
4. 支持Lambda表达式。
5. 支持自动重载配置。

## 快速开始

maven中引入log4j2包

```xml
        <!-- log4j2日志门面 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.18.0</version>
        </dependency>

        <!-- log4j2日志框架 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.18.0</version>
        </dependency>
```

## 配置文件

`Log4j2`会去寻找 4 种类型的配置⽂件，前缀是 `log4j2-test` 或者 `log4j2`。后缀分别是 `properties`、`yaml`、`json` 和 `xml`。

`Log4j2`的配置文件格式和`Logback`有点相似，基本的结构为`<Configuration>`元素，包含0或多个`<Appenders>`元素，其后跟0或多个`<Loggers>`元素，里面再跟最多只能存在一个的`<Root>`元素。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="DEBUG">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

配置appender，也就是配置日志的输出目的地。

有Console，典型的控制台配置信息上面你也看到了，我来简单解释一下里面pattern的格式：

- `%d{HH:mm:ss.SSS}`：表示输出到毫秒的时间
- `%t`：输出当前线程名称
- `%-5level`：输出日志级别，-5表示左对齐并且固定输出5个字符，如果不足在右边补空格
- `%logger`：输出logger名称，最多36个字符
- `%msg`：日志文本
- `%n`：换行

顺带补充一下其他常用的占位符：

- `%F`：输出所在的类文件名，如Main.java
- `%L`：输出行号
- `%M`：输出所在方法名
- `%l`：输出语句所在的行数，包括类名、方法名、文件名、行数
- `%p`：输出日志级别
- `%c`：输出包名，如果后面跟有`{length.}`参数，比如说`c{1.}`，它将输出报名的第一个字符，如`com.itwanger`的实际报名将只输出`c.i`

配置Loggers，指定Root的日志级别，并且指定具体启用哪一个Appenders。

自动重载配置

`Logback`支持自动重载配置，`Log4j2`也支持，那想要启用这个功能也非常简单，只需要在`Configuration`元素上添加`monitorInterval`属性即可。

```xml
<Configuration monitorInterval="30">
...
</Configuration>
```

值要设置成非零，上例中的意思是至少30秒后检查配置文件中的更改。最小间隔为5秒。

## Async示例

除了Console，还有Async，可以配合文件的方式来异步写入，典型的配置信息如下所示：

```xml
<Configuration>
    <Appenders>
        <File name="DebugFile" fileName="debug.log">
            <PatternLayout>
                <Pattern>%d %p %c [%t] %m%n</Pattern>
            </PatternLayout>
        </File>
        <Async name="Async">
            <AppenderRef ref="DebugFile"/>
        </Async>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="Async"/>
        </Root>
    </Loggers>
</Configuration>
```

## RollingFile示例

`RollingFile`会根据`Triggering(触发)`策略和`Rollover(过渡)`策略来进行日志文件滚动。如果没有配置`Rollover`，则使用`DefaultRolloverStrategy`来作为`RollingFile`的默认配置。

触发策略包含有：

- 基于`cron`表达式（源于希腊语，时间的意思，用来配置定期执行任务的时间格式）的`CronTriggeringPolicy`
- 基于文件大小的`SizeBasedTriggeringPolicy`
- 基于时间的`Time BasedTriggeringPolicy`

过渡策略包含有：

- 默认的过渡策略`DefaultRolloverStrategy`
- 直接写入的`DirectWriteRolloverStrategy`

一般情况下，采用默认的过渡策略即可，它已经足够强大。

以下是基于`SizeBasedTriggeringPolicy`和`TimeBasedTriggeringPolicy`策略，以及缺省`DefaultRolloverStrategy`策略的配置示例：

```xml
<Configuration>
    <Appenders>
        <RollingFile name="RollingFile" fileName="rolling.log"
                     filePattern="rolling-%d{yyyy-MM-dd}-%i.log">
            <PatternLayout>
                <Pattern>%d %p %c{1.} [%t] %m%n</Pattern>
            </PatternLayout>
            <Policies>
                <SizeBasedTriggeringPolicy size="1 KB"/>
            </Policies>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="RollingFile"/>
        </Root>
    </Loggers>
</Configuration>
```

RollingFile的配置

- `fileName`：指定文件名。
- `filePattern`：指定文件名的模式，它取决于过渡策略。

由于配置文件中没有显式指定过渡策略，因此`RollingFile`会启用默认的`DefaultRolloverStrategy`。

先来看一下`DefaultRolloverStrategy`的属性：

| 属性值                    | 值类型 | 描述                                                         |
| ------------------------- | ------ | ------------------------------------------------------------ |
| fileIndex                 | String | 默认值为max，索引值较高的比较小的更新；如果是min，则相反。   |
| min                       | int    | 计数器的最小值，默认值为1。                                  |
| max                       | int    | 计数器的最大值，默认值为7；达到这个值后，旧的日志文件被删除。 |
| compressionLevel          | int    | 压缩级别，从0-9，0为无，1为最佳速度，9为最佳压缩。仅针对zip文件。 |
| tempCompressionFilePatten | String | 日志文件压缩时的文件名模式。                                 |

再来看`filePattern`的值`rolling-%d{yyyy-MM-dd}-%i.log`，其中`d{yyyy-MM-dd)`很好理解，就是年月日；其中`%i`是什么意思呢？

第一个日志文件名为`rolling.log`(最近的日志放在这个里面)，第二个文件名除去日期为`rolling-1.1og`，第二个文件名除去日期为`rolling-2.log`。

其实和`DefaultRolloverStrategy`中的`max`属性有关，目前使用的默认值，也就是7，那就当`rolling-8.log`要生成的时候，删除`rolling-1.log`。可以调整Demo中的日志输出量来进行验证。

`SizeBasedTriggeringPolicy`，基于日志文件大小的时间策略，大小以字节为单位，后缀可以是`KB`，`MB`或`GB`，例如`20MB`。

```xml
<RollingFile name="RollingFileGZ" fileName="gz/rolling.log"
             filePattern="gz/%d{yyyy-MM-dd-HH}-%i.rolling.gz">
    <PatternLayout>
        <Pattern>%d %p %c{1.} [%t] %m%n</Pattern>
    </PatternLayout>
    <Policies>
        <SizeBasedTriggeringPolicy size="1 KB"/>
    </Policies>
</RollingFile>
```

- fileName的属性值中包含了一个目录gz，也就是说日志文件都将放在这个目录下。
- filePattern的属性值中增加了一个gz的后缀，这就表明日志文件要进行压缩了，还可以是Zip格式。

## 整合Springboot

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <exclusions>
                <!-- 排除springboot默认的日志框架 -->
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-logging</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!-- log4j2 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-log4j2</artifactId>
        </dependency>
```

## 快速使用

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Main {

    private static final Logger logger = LogManager.getLogger(Main.class);

    public static void main(String[] args) {
        logger.debug("log4j2");
    }
}

// 输出
2023-09-25 14:58:07,073 DEBUG taketo.Main [main] log4j2
```
