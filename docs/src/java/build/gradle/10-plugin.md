# Plugin

## 为什么要使用插件

简单的说,通过应用插件我们可以

1. 促进代码重用、减少功能类似代码编写、提升工作效率
2. 促进项目更高程度的模块化、自动化、便捷化
3. 可插拔式的的扩展项目的功能

## 插件的作用

在项目构建过程中做很多事情，把插件应用到项目中，通常可以完成：

1. 可以添加任务【task】到项目中，从而帮助完成测试、编译、打包等。
2. 可以添加依赖配置到项目中。
3. 可以向项目中拓展新的扩展属性、方法等。
4. 可以对项目进行一些约定，如应用 Java 插件后，约定 `src/main/java` 目录是我们的源代码存在位置，编译时编译这个目录下的 Java 源代码文件。

## 插件的分类和使用

### 脚本插件

脚本插件的本质就是一个脚本文件，使用脚本插件时通过 `apply from:` 将脚本加载进来就可以了，后面的脚本文件可以是本地的也可以是网络上的脚本文件，下面定义一段脚本，我们在 `build.gradle` 文件中使用它，具体如下：

![An image](/img/java/build/gradle/17.png)

创建 `version.gradle` 脚本文件

```groovy
ext {
    company = "take-to"
    cfgs = [
            compileSdkVersion: JavaVersion.VERSION_1_8
    ]
    spring = [
            version: '5.0.0']
}
```

在 `build.gradle` 引入

```groovy
apply from: 'version.gradle'
task taskVersion {
    doLast {
        println "公司名称为：${company},JDK版本是${cfgs.compileSdkVersion},版本号是${spring.version}"
    }
}
```

运行脚本

```bash
gradle -q taskVersion

# 输出
公司名称为：take-to,JDK版本是1.8,版本号是5.0.0
```

脚本文件模块化的基础，可按功能把我们的脚本进行拆分一个个公用、职责分明的文件，然后在主脚本文件引用。

例如可以将很多共有的库版本号一起管理、应用构建版本一起管理等。

### 内部插件

二进制插件[对象插件]就是实现了 `org.gradle.api.Plugin` 接口的插件，每个 Java Gradle 插件都有一个 `plugin id`。

![An image](/img/java/build/gradle/18.png)

可通过如下方式使用一个 Java 插件

```groovy
// map具名参数方式
apply plugin : 'java' 

// 也可以使用闭包作为project.apply方法的一个参数
apply{
    plugin 'java
}
```

通过上述代码就将 Java 插件应用到我们的项目中了，对于 Gradle 自带的核心插件都有唯一的 plugin id，其中 java 是Java 插件的 plugin id，这个 plugin id 必须是唯一的，可使用应用包名来保证 plugin id 的唯一性。

这里的 java 对应的具体类型是 `org.gradle.api.plugins.JavaPlugin`，所以可以使用如下方式使用 Java 插件

```groovy
//使用方式1: Map具名参数,全类名
apply plugin:org.gradle.api.plugins.JavaPlugin

//使用方式2: 默认导入, org.gradle.api.plugins
apply plugin:JavaPlugin

//使用方式3: 插件的id,核心插件, 无需事先引入
apply plugin: 'java' 
```

### 第三方插件

如果是使用第三方发布的二进制插件，一般需要配置对应的仓库和类路径

第三方插件托管网站：[Gradle - Plugins](https://plugins.gradle.org/)

**使用 plugins DSL 方式：**

```groovy
plugins {
    id 'org.springframework.boot' version '2.4.1'
}
```

### 自定义插件

```groovy
class GreetingPlugin implements Plugin<Project> {
    void apply(Project project) {
        project.task('hello') {
            doLast {
                println 'Hello from the GreetingPlugin'
            }
        }
    }
}

// Apply the plugin
apply plugin: GreetingPlugin
```
