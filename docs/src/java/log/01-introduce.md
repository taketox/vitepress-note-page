# 简介概览

## 为什么需要在Java中打印日志

在本地环境下，使用`System.out.println()`打印日志是没问题的，可以在控制台看到信息。但如果是在生产环境下的话，`System.out.println()`就变得毫无用处了。

控制台打印出的信息并没有保存到日志文件中，只能即时查看，在一屏日志的情况下还可以接受。如果日志量非常大，控制台根本就装不下。所以就需要更高级的日志记录API（比如Log4和java.util.logging）。

它们可以把大量的日志信息保存到文件中，并且控制每个文件的大小，如果满了，就存储到下一个，方便查找。

## 选择不同日志级别的重要性

使用Java日志的时候，一定要注意日志的级别，比如常见的DEBUG、INFO、WARN和ERROR。

DEBUG的级别最低，当需要打印调试信息的话，就用这个级别，不建议在生产环境下使用。

INFO的级别高一些，当一些重要的信息需要打印的时候，就用这个。

WARN，用来记录一些警告类的信息，比如说客户端和服务端的连接断开了，数据库连接丢失了。

ERROR比WARN的级别更高，用来记录错误或者异常的信息。

FATAL，当程序出现致命错误的时候使用，这意味着程序可能非正常中止了。

OFF，最高级别，意味着所有消息都不会输出了。

这个级别是基于Log4j的，和java.util.logging有所不同，后者提供了更多的日志级别，比如说SEVERE、FINER、FINEST。

## 错误的日志记录方式是如何影响性能的

为什么说错误的日志记录方式会影响程序的性能呢？因为日志记录的次数越多，意味着执行文件IO操作的次数就越多，这也就意味着会影响到程序的性能。

这也就是为什么要选择日志级别的重要性。对于程序来说，记录日志是必选项，所以能控制的就是日志的级别，以及在这个级别上打印的日志。

对于DEBUG级别的日志来说，一定要使用下面的方式来记录：

```java
if (logger.isDebugEnabled()) {
    logger.debug("DEBUG 是开启的");
}
```

当DEBUG级别是开启的时候再打印日志，这种方式在你看很多源码的时候就可以发现，很常见。

切记，在生产环境下，一定不要开启DEBUG级别的日志，否则程序在大量记录日志的时候会变很慢，还有可能在你不注意的情况下，悄悄地把磁盘空间撑爆。

## 为什么选择 Log4j 而不是 java.util.logging

`java.util.logging`属于原生的日志APl，Log4j属于第三方类库。但我建议使用Log4j，因为Log4更好用。java.util.logging的日志级别比Log4j更多，但用不着，就变成了多余。

Log4j的另外一个好处就是，不需要重新启动java程序就可以调整日志的记录级别，非常灵活。可以通过log4j.properties文件来配置Log4j的日志级别、输出环境、日志文件的记录方式。

LOg4j还是线程安全的，可以在多线程的环境下放心使用。

## 打印日志的技巧

1. 在打印DEBUG级别的日志时，切记要使用`isDebugEnabled()`那小伙伴们肯定非常好奇，为什么要这样做呢？

    先来看一下`isDebugEnabled()`方法的源码：

    ```java
    public boolean isDebugEnabled() {
        if(repository.isDisabled(Level.DEBUG_INT))
            return false;
        return Level.DEBUG.isGreaterorEqual(this.getEffectiveLevel());
    }
    ```

    内部使用了`isDisabled()`方法进行了日志级别的判断，如果DEBUG是禁用的话，就return false了。

    再来看一下`debug()`方法的源码：

    ```java
    public void debug(Object message) {
        if(repository.isDisabled(Level.DEBUG_INT))
            return;
        if(Level.DEBUG.isGreaterOrEqual(this.getEffectiveLevel())) {
            forcedLog(FQCN, Level.DEBUG, message, null);
        }
    }
    ```

    不是也用`isDisabled()`方法判断吗？难道使用`isDebugEnabled()`不是画蛇添足吗？直接用`logger.debug()`不香吗？

    如果我们在打印日志信息的时候需要附带一个方法去获取参数值，就像下面这样：

    ```java
    logger.debug("⽤户名是：" + getName());
    ```

    假如`getName()`方法需要耗费的时间长达6秒，那完了！尽管配置文件里的日志级别定义的是INFO，`getName()`方法仍然会倔强地执行6秒，完事后再`debug()`。

    明明INFO的时候`debug()`是不执行的，意味着`getName()`也不需要执行的，偏偏就执行了6秒是不是很傻？

    ```java
    if(logger.isDebugEnabled()) {
        logger.debug("⽤户名是：" + getName());
    }
    ```

    换成上面这种方式，那确定此时`getName()`是不执行的。

2. 为了程序性能上的考量，`isDebugEnabled()`就变得很有必要了！假如说`debug()`的时候没有传参，确实是不需要判断DEBUG是否启用的。

3. 慎重选择日志信息的打印级别，因为这太重要了！如果只能通过日志查看程序发生了什么问题，那必要的信息是必须要打印的，但打印得太多，又会影响到程序的性能。

4. 使用Log4j而不是`System.out`、`System.err`或者`e.printStackTrace()`来打印日志。

5. 使用log4j.properties文件来配置日志，尽管它不是必须项，使用该文件会让程序变得更灵活。

6. 不要忘记在打印日志的时候带上类的全名和线程名，在多线程环境下，这点尤为重要，否则定位问题的时候就太难了。

7. 打印日志信息的时候尽量要完整，不要太过于缺省，尤其是在遇到异常或者错误的时候（信息要保留两类：案发现场信息和异常堆栈信息，如果不做处理，通过throws关键字往上抛)，免得在找问题的时候都是一些无用的日志信息。

8. 要对日志信息加以区分，把某一类的日志信息在输出的时候加上前缀，比如说所有数据库级别的日志里添加DB_LOG,这样的日志非常大的时候可以通过grep这样的Linux命令快速定位。

9. 不要在日志文件中打印密码、银行账号等敏感信息。
