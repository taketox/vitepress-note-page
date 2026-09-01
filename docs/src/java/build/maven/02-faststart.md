# 快速开始

## 安装

官网下载：[maven.apache.org](https://maven.apache.org/docs/history.html)

Windows

下载，安装，下一步。

Linux

```sh
sudo apt install maven
```

## 目录结构

- bin：含有Maven的运行脚本
- boot：含有plexus-classworlds类加载器框架
- conf：含有Maven的核心配置文件
- lib：含有Maven运行时所需要的Java类库
- LICENSE、NOTICE、README.txt：针对Maven版本，第三方软件等简要介绍

## 功能配置

配置本地仓库地址

```xml
  <!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->
 <!-- conf/settings.xml 55行 -->
 <localRepository>D:\maven-repository</localRepository>
```

配置国内阿里镜像

```xml
<!--在mirrors节点(标签)下添加中央仓库镜像 160行附近-->
<mirror>
    <id>alimaven</id>
    <name>aliyun maven</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    <mirrorOf>central</mirrorOf>
</mirror>
```

配置jdk17版本项目构建

```xml
<!--在profiles节点(标签)下添加jdk编译版本 268行附近-->
<profile>
    <id>jdk-17</id>
    <activation>
      <activeByDefault>true</activeByDefault>
      <jdk>17</jdk>
    </activation>
    <properties>
      <maven.compiler.source>17</maven.compiler.source>
      <maven.compiler.target>17</maven.compiler.target>
      <maven.compiler.compilerVersion>17</maven.compiler.compilerVersion>
    </properties>
</profile>
```

## 创建Maven工程

Maven工程相对之前的项目，多出一组gavp属性，gav需要我们在创建项目的时候指定，p有默认值，我们先行了解下这组属性的含义：

Maven 中的 GAVP 是指 GroupId、ArtifactId、Version、Packaging 等四个属性的缩写，其中前三个是必要的，而 Packaging 属性为可选项。这四个属性主要为每个项目在maven仓库中做一个标识，类似人的姓-名！有了具体标识，方便后期项目之间相互引用依赖等！

GAV遵循一下规则：

**GroupID 格式**：com.{公司/BU }.业务线.\[子业务线]，最多 4 级。

- 说明：{公司/BU} 例如：alibaba/taobao/tmall/aliexpress 等 BU 一级；子业务线可选。

  > 正例：com.taobao.tddl 或 com.alibaba.sourcing.multilang

**ArtifactID 格式**：产品线名-模块名。语义不重复不遗漏，先到仓库中心去查证一下。

- 正例：`tc-client / uic-api / tair-tool / bookstore`

**Version版本号格式推荐**：主版本号.次版本号.修订号

- 主版本号：当做了不兼容的 API 修改，或者增加了能改变产品方向的新功能。

- 次版本号：当做了向下兼容的功能性新增（新增类、接口等）。

- 修订号：修复 bug，没有修改方法签名的功能加强，保持 API 兼容性。

  > 例如： 初始→1.0.0  修改bug → 1.0.1  功能调整 → 1.1.1等

**Packaging定义规则：**

- 指示将项目打包为什么类型的文件，idea根据packaging值，识别maven项目类型！
- packaging 属性为 jar（默认值），代表普通的Java工程，打包以后是.jar结尾的文件。
- packaging 属性为 war，代表Java的web工程，打包以后.war结尾的文件。
- packaging 属性为 pom，代表不会打包，用来做继承的父工程。

## Maven工程构建

项目构建是指将源代码、依赖库和资源文件等转换成可执行或可部署的应用程序的过程，在这个过程中包括编译源代码、链接依赖库、打包和部署等多个步骤。

项目构建是软件开发过程中至关重要的一部分，它能够大大提高软件开发效率，使得开发人员能够更加专注于应用程序的开发和维护，而不必关心应用程序的构建细节。

同时，项目构建还能够将多个开发人员的代码汇合到一起，并能够自动化项目的构建和部署，大大降低了项目的出错风险和提高开发效率。常见的构建工具包括 Maven、Gradle、Ant 等。

**命令方式项目构建：**

| 命令                                     | 描述                        |
| ---------------------------------------- | --------------------------- |
| mvn compile                              | 编译项目，生成target文件    |
| mvn package                              | 打包项目，生成jar或war文件  |
| mvn clean                                | 清理编译或打包后的项目结构  |
| mvn install                              | 打包后上传到maven本地仓库   |
| mvn deploy                               | 只打包，上传到maven私服仓库 |
| mvn site                                 | 生成站点                    |
| mvn test                                 | 执行测试源码                |
| mvn clean install -Dmaven.test.skip=true | 执行清理安装跳过测试        |

war包打包插件和jdk版本不匹配：pom.xml 添加以下代码即可

```xml
<build>
    <!-- jdk17 和 war包版本插件不匹配 -->
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-war-plugin</artifactId>
            <version>3.2.2</version>
        </plugin>
    </plugins>
</build>
```

命令触发练习：

```bash
# 清理
mvn clean
# 清理，并重新打包
mvn clean package
# 执行测试代码
mvn test
```

## 构建生命周期

当我们执行package命令也会自动执行compile命令，这种行为就是因为构建生命周期产生的！

构建生命周期可以理解成是一组固定构建命令的有序集合，触发周期后的命令，会自动触发周期前的命令。

**构建周期作用：**

- 会简化构建过程

  > 例如：项目打包   mvn clean package即可

主要两个构建生命周期：

- 清理周期：主要是对项目编译生成文件进行清理

  包含命令：clean

- 默认周期：定义了真正构件时所需要执行的所有步骤，它是生命周期中最核心的部分

  ```tex
  包含命令：compile -  test - package - install - deploy
  ```
