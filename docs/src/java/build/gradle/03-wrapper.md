# GradleWrapper

## Wrapper 包装器

Gradle Wrapper 实际上就是对 Gradle 的一层包装，用于解决实际开发中可能会遇到的不同的项目需要不同版本的 Gradle 问题。

把自己的代码共享给其他人使用，可能出现如下情况：

1. 对方电脑没有安装 gradle
2. 对方电脑安装过 gradle，但是版本太旧了

这时候，我们就可以考虑使用 Gradle Wrapper 了。这也是官方建议使用 Gradle Wrapper 的原因。实际上有了 Gradle Wrapper 之后，我们本地是可以不配置 Gradle 的，下载 Gradle 项目后，使用 gradle 项目自带的 wrapper 操作也是可以的。

## 使用 Gradle Wrapper

项目中的`gradlew`、`gradlew.cmd`脚本用的就是wrapper中规定的gradle版本。

而我们上面提到的gradle指令用的是本地gradle，所以gradle指令和gradlew指令所使用的gradle版本**有可能是不一样的**。

`gradlew`、`gradlew.cmd`的使用方式与`gradle`使用方式完全一致，只不过把`gradle`指令换成了`gradlew`指令。

当然，我们也可在终端执行 gradlew 指令时，指定指定一些参数，来控制 Wrapper 的生成，比如依赖的版本等，如下：

| 参数名称                  | 说明                            |
| ------------------------- | ------------------------------- |
| --gradle-version          | 用于指定使用的Gradle版本        |
| --gradle-distribution-url | 用于指定下载Gradle发行版URL地址 |

**示例：**

```sh
# 升级wrapper版本号，只是修改gradle.properties中wrapper版本，未实际下载
gradle wrapper --gradle-version=4.4

# 关联源码用
gradle wrapper --gradle-version 5.2.1 --distribution-type all
```

## Gradle Wrapper 的执行流程

1. 当我们第一次执行 `./gradlew build` 命令的时候，`gradlew` 会读取 `gradle-wrapper.properties` 文件的配置信息
2. 准确的将指定版本的 gradle 下载并解压到指定的位置：`GRADLE_USER_HOME/wrapper/dists/`
3. 构建本地缓存：`GRADLE_USER_HOME/caches/`，下载再使用相同版本的gradle就不用下载了
4. 之后执行的 `./gradlew` 所有命令都是使用指定的 gradle 版本

![An image](/img/java/build/gradle/04.png)

**gradle-wrapper.properties 文件解读：**

| 字段名           | 说明                                             |
| ---------------- | ------------------------------------------------ |
| distributionBase | 下载的Gradle压缩包解压后存储的主目录             |
| distributionPath | 相对于distributionBase的解压后的Gradle压缩包路径 |
| zipStoreBase     | 同distributionBase，只不过是存放zip压缩包的      |
| zipStorePath     | 同distributionPath，只不过是存放zip压缩包的      |
| distributionUrl  | Gradle发行版压缩包的下载地址                     |

前面提到的 `GRALE_USER_HOME` 环境变量用于这里的 Gradle Wrapper 下载的特定版本的 gradle 存储目录。

如果我们没有配置过 `GRALE_USER_HOME` 环境变量，默认在当前用户家目录下的 `.gradle` 文件夹中。

## 使用场景

什么时候选择使用 `gradle wrapper`，什么时候选择使用本地 `gradle`?

- 下载别人的项目或者使用操作以前自己写的不同版本的gradle项目时：用Gradle wrapper，即 `gradlew`。
- 新建一个项目时：使用gradle指令即可。
