# Logback

## 快速开始

maven中引入Logback包

```xml
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.2.12</version>
        </dependency>
```

Maven会自动导入另外两个依赖：

```tex
ch.qos.logback:logback-classic:1.2.12
ch.qos.logback:logback-core:1.2.12
org.slf4j:slf4j-api:1.7.32
```

`logback-core`是`Logback`的核心，`logback-classic`是`SLF4J`的实现。

## 快速使用

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        logger.debug("姓名：{}，年龄：{}", "taketo", "23");
    }
}
```

`Logger`和`LoggerFactory`都来自`SLF4J`，所以如果项目是从`Log4j+SLF4J`切换到`Logback`的话，此时的代码是零改动的。

在没有配置文件的情况下，一切都是默认的，`Logback`的日志信息会输出到控制台。可以通过`StatusPrinter`来打印`Logback`的内部信息

```java
    public static void main(String[] args) {
        logger.debug("姓名：{}，年龄：{}", "taketo", "23");
        LoggerContext lc = (LoggerContext)LoggerFactory.getILoggerFactory();
        StatusPrinter.print(lc);
    }
// 输出
14:11:12.851 [main] DEBUG cc.taketo.Main - 姓名：taketo，年龄：23
14:11:12,820 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback-test.xml]
14:11:12,821 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback.xml]
14:11:12,823 |-INFO in ch.qos.logback.classic.BasicConfigurator@2e0fa5d3 - Setting up default configuration.
```

也就是说，`Logback`会在`classpath`路径下先寻找`logback-test.xml`文件，没有找到的话，寻找`logback.xml`文件，都找不到的话，就输出到控制台。

一般来说，我们会在本地环境中配置`logback-test.Xml`，在生产环境下配置`logback.xml`.

## 配置文件

在`resource`目录下增加`logback-test.xml`文件，内容如下所示：

```xml
<configuration debug="true">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %relative [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

`Logback`的配置文件非常灵话，最基本的结构为`<configuration>`元素，包含0或多个`<appender>`元素，其后跟0或多个`<logger>`元素，其后再跟最多只能存在一个的`<root>`元素。

### 配置appender

也就是配置日志的输出目的地，通过name属性指定名字，通过class属性指定目的地：

- ch.qos.logback.core.ConsoleAppender：输出到控制台。
- ch.qos.logback.core.FileAppender：输出到文件。
- ch.qos.logback.core.rolling.RollingFileAppender：文件大小超过阈值时产生一个新文件。

除了输出到本地，还可以通过`SocketAppender`和`SSLSocketAppender`输出到远程设备，通过`SMTPAppender`输出到邮件。甚至可以通过`DBAppender`输出到数据库中。

encoder负责把日志信息转换成字节数组，并且把字节数组写到输出流。

pattern用来指定日志的输出格式：

- `%d`：输出的时间格式。
- `%thread`：日志的线程名。
- `%-5level`：日志的输出级别，填充到5个字符。比如说info只有4个字符，就填充一个空格，这样日志信息就对齐了。
- `%logger{length}`：logger的名称，length用来缩短名称。没有指定表示完整输出；0表示只输出logger最右边点号之后的字符串；其他数字表示输出小数点最后边点号之前的字符数量。
- `%msg`：日志的具体信息。
- `%n`：换行符。
- `%relative`：输出从程序启动到创建日志记录的时间，单位为毫秒。

### 配置root

它只支持一个属性一一level，值可以为：TRACE、DEBUG、INFO、WARN、ERROR、ALL、OFF

appender-ref用来指定具体的appender。

### 查看内部状态信息

可以在代码中通过`StatusPrinter`来打印`Logback`内部状态信息，也可以通过在`configuration`上开启`debug`来打印内部状态信息。

### 自动重载配置

之前提到`Logback`很强的一个功能就是支持自动重载配置，那想要启用这个功能也非常简单，只需要在`configuration`元素上添加`scan=true`即可。

```xml
<configuration scan="true">
...
</configuration>
```

默认情况下，扫描的时间间隔是一分钟一次。如果想要调整时间间隔，可以通过`scanPeriod`属性进行调整，单位可以是毫秒(milliseconds)、秒(seconds)、分钟(minutes)或者小时(hours)。

下面这个示例指定的时间间隔是30秒：

```xml
<configuration scan="true" scanperiod="30 seconds">
...
</configuration>
```

注意：如果指定了时间间隔，没有指定时间单位，默认的时间单位为毫秒。

当设置scan=true后，`Logback`会起一个`ReconfigureOnChangeTask`的任务来监视配置文件的变化。

## 优点

- Spring Boot的默认日志框架使用的是Logback。
