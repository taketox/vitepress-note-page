# Log4j

## 快速开始

maven中引入log4j包

```xml
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
```

## 配置文件

在 `resources` 目录下创建 `log4j.properties` 文件

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

1. 配置根Logger，语法如下所示：

    ```properties
    log4j.rootLogger = [ level ] , appenderName, appenderName, …
    ```

    level就是日志的优先级，从高到低依次是ERROR、WARN、INFO、DEBUG。如果这里定义的是INFO，那么低级别的DEBUG日志信息将不会打印出来。

    appenderName就是指把日志信息输出到什么地方，可以指定多个地方，当前的配置文件中有3个地方，分别是stdout、D、E。

2. 配置日志输出的目的地，语法如下所示：

    ```properties
    log4j.appender.appenderName = fully.qualified.name.of.appender.class
    log4j.appender.appenderName.option1 = valuel
    log4j.appender.appenderName.option = valueN
    ```

    Log4j提供的目的地有下面5种：

    - `org.apache.log4j.ConsoleAppender`：控制台
    - `org.apache.log4j.FileAppender`：文件
    - `org.apache.log4j.DailyRollingFileAppender`：每天产生一个文件
    - `org.apache.log4j.RollingFileAppender`：文件大小超过阈值时产生一个新文件
    - `org.apache.log4j.WriterAppender`：将日志信息以流格式发送到任意指定的地方

3. 配置日志信息的格式，语法如下所示：

    ```properties
    log4j.appender.appenderName.layout = fully.qualified.name.of.layout.class 
    log4j.appender.appenderName.layout.option1 = value1 
    … 
    log4j.appender.appenderName.layout.option = valueN
    ```

    Log4j提供的格式有下面4种：

    - `org.apache.log4j.HTMLLayout`：HTML表格
    - `org.apache.log4j.PatternLayout`：自定义
    - `org.apache.log4j.SimpleLayout`：包含日志信息的级别和信息字符串
    - `org.apache.log4j.TTCCLayout`：包含日志产生的时间、线程、类别等等信息

    自定义格式的参数如下所示：

    - `%m`：输出代码中指定的消息
    - `%p`：输出优先级
    - `%r`：输出应用启动到输出该日志信息时花费的毫秒数
    - `%c`：输出所在类的全名
    - `%t`：输出该日志所在的线程名
    - `%n`：输出一个回车换行符
    - `%d`：输出日志的时间点
    - `%l`：输出日志的发生位置，包括类名、线程名、方法名、代码行数，比如：method:cc.taketo.Main.main(Main.java:13)

## 快速使用

```java
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

public class Main {

    private static final Logger logger = LogManager.getLogger(Main.class);

    public static void main(String[] args) {
        // 记录debug级别的信息
        logger.debug("debug.");
        // 记录info级别的信息
        logger.info("info.");
        // 记录error级别的信息
        logger.error("error.");
    }
}
```

1. 获取Logger对象

    要使用Log4j的话，需要先获取到Logger对象，它用来负责日志信息的打印。通常的格式如下所示：

    ```java
    // 主要包不要导错，org.apache.log4j.LogManager
    private static final Logger logger = LogManager.getLogger(Main.class);
    ```

2. 打印日志

    有了Logger对象后，就可以按照不同的优先级打印日志了。常见的有以下4种：

    ```java
    logger.debug();
    logger.info();
    logger.warn();
    logger.error();
    ```

    根据上述示例`log4j.properties`配置文件，程序运行后会在目录下生成两个文件，一个名叫`debug.log`，内容如下所示：

    ```tex
    2023-09-25 11:26:49 [ main:0 ]- [ DEBUG ] debug.
    2023-09-25 11:26:49 [ main:3 ]- [ INFO ] info.
    2023-09-25 11:26:49 [ main:3 ]- [ ERROR ] error.
    ```

    另外一个名叫`error.log`，内容如下所示：

    ```tex
    2023-09-25 11:26:49 [ main:3 ]- [ ERROR ] error.
    ```
