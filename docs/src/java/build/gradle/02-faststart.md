# 快速开始

## 安装

官网下载：[Gradle | Releases](https://gradle.org/releases/)

Windows

下载，安装，下一步。

Linux

```sh
sudo apt install gradle
```

## 项目目录结构

Gradle 项目默认目录结构和 Maven 项目的目录结构一致，都是基于约定大于配置【Convention Over Configuration】。

其完整项目目录结构如下所示：

![An image](/img/java/build/gradle/03.png)

>只有war工程才有webapp目录，对于普通的jar工程并没有webapp目录。
>
>gradlew与gradlew.bat执行的指定wrapper版本中的gradle指令，不是本地安装的gradle指令哦。

## 常用指令

| 命令                 | 描述                        |
| -------------------- | --------------------------- |
| gradle clean         | 编译项目，生成target文件    |
| gradle classes       | 打包项目，生成jar或war文件  |
| gradle test          | 清理编译或打包后的项目结构  |
| gradle build         | 打包后上传到maven本地仓库   |
| gradle build -x test | 只打包，上传到maven私服仓库 |

> gradle的指令要在含有 `build.gradle` 的目录执行

## 依赖下载源

Gradle 自带的 Maven 源地址是国外的，该 Maven 源在国内的访问速度是很慢的。

一般情况下，我们建议使用国内的第三方开放的 Maven 源或企业内部自建 Maven 源。

阿里云Maven仓库：[仓库服务 (aliyun.com)](https://developer.aliyun.com/mvn/guide)

### init.d

我们可以在 gradle 的 `init.d` 目录下创建以 `.gradle` 结尾的文件，`.gradle` 文件可以实现在 build 开始之前执行，所以你可以在这个文件配置一些你想预先加载的操作。

在 `init.d` 文件夹创建 `init.gradle` 文件

```groovy
allprojects {
    repositories {
        mavenLocal()
        maven { url "https://maven.aliyun.com/repository/public" }
        mavenCentral()
    }
    buildscript {
        repositories {
            maven { url "https://maven.aliyun.com/repository/public" }
        }
    }
}
```

**使用方法：**

1. 在命令行指定文件，例如：`gradle --init-script yourdir/init.gradle -q taskName`，一次可以指定多个init文件。
2. 把 `init.gradle`文件放到 `USER_HOME/.gradle/` 目录下
3. 把以 `.gradle` 结尾的文件放到 `USER_HOME/.gradle/init.d/` 目录下
4. 把以 `.gradle` 结尾的文件放到 `GRADLE_HOME/init.d/` 目录下

::: tip

如果存在上面的4种方式的2种以上，gradle会按上面的1-4序号依次执行这些文件，如果给定目录下存在多个init脚本，会按拼音a-z顺序执行这些脚本，每个init脚本都存在一个对应的gradle实例，你在这个文件中调用的所有方法和属性，都会委托给这个gradle实例，每个init脚本都实现了Script接口。

:::

### 仓库地址说明

`mavenLocal()`：指定使用maven本地仓库，而本地仓库在配置maven时settings文件指定的仓库位置。

gradle 查找jar包顺序如下：

```tex
USER_HOME/.m2/settings.xml >> M2_HOME/conf/settings.xml >> USER_HOME/.m2/repository
```

`maven { url 地址 }`：指定maven仓库，一般用私有仓库地址或其它的第三方库【比如阿里镜像仓库地址】。

`mavenCentral()`：这是Maven的中央仓库，无需配置，直接声明就可以使用。

`jcenter()`：JCenter中央仓库，实际也是是用的maven搭建的，但相比Maven仓库更友好，通过CDN分发，并且支持https访

问，在新版本中已经废弃了，替换为了`mavenCentral()`

::: tip

总之， gradle可以通过指定仓库地址为本地maven仓库地址和远程仓库地址相结合的方式，避免每次都会去远程仓库下载依赖库。这种方式也有一定的问题，如果本地maven仓库有这个依赖，就会从直接加载本地依赖，如果本地仓库没有该依赖，那么还是会从远程下载。但是下载的jar不是存储在本地maven仓库中，而是放在自己的缓存目录中，默认在 `USER_HOME/.gradle/caches` 目录，当然如果我们配置过`GRADLE_USER_HOME` 环境变量，则会放在`GRADLE_USER_HOME/caches`目录，那么可不可以将 `gradle caches` 指向 `maven repository`。我们说这是不行的，因为caches下载文件不是按照maven仓库中存放的方式。

:::
