# 工程继承与聚合

## 工程继承

**继承概念：**

Maven 继承是指在 Maven 的项目中，让一个项目从另一个项目中继承配置信息的机制。继承可以让我们在多个项目中共享同一配置信息，简化项目的管理和维护工作。

**继承作用：**

在父工程中统一管理项目中的依赖信息。

它的背景是：

- 对一个比较大型的项目进行了模块拆分。
- 一个 project 下面，创建了很多个 module。
- 每一个 module 都需要配置自己的依赖信息。

它背后的需求是：

- 在每一个 module 中各自维护各自的依赖信息很容易发生出入，不易统一管理。
- 使用同一个框架内的不同 jar 包，它们应该是同一个版本，所以整个项目中使用的框架版本需要统一。
- 使用框架时所需要的 jar 包组合（或者说依赖信息组合）需要经过长期摸索和反复调试，最终确定一个可用组合。这个耗费很大精力总结出来的方案不应该在新的项目中重新摸索。
    通过在父工程中为整个项目维护依赖信息的组合既保证了整个项目使用规范、准确的 jar 包；又能够将以往的经验沉淀下来，节约时间和精力。

**继承语法：**

- 父工程

  ```xml
    <groupId>cc.taketo.maven</groupId>
    <artifactId>pro03-maven-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
    <!-- 当前工程作为父工程，它要去管理子工程，所以打包方式必须是 pom -->
    <packaging>pom</packaging>
  ```

- 子工程

  ```xml
  <!-- 使用parent标签指定当前工程的父工程 -->
  <parent>
    <!-- 父工程的坐标 -->
    <groupId>cc.taketo.maven</groupId>
    <artifactId>spring-maven-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
  </parent>
  
  <!-- 子工程的坐标 -->
  <!-- 如果子工程坐标中的groupId和version与父工程一致，那么可以省略 -->
  <!-- <groupId>cc.taketo.maven</groupId> -->
  <artifactId>spring-maven-module</artifactId>
  <!-- <version>1.0-SNAPSHOT</version> -->
  ```

**父工程依赖统一管理：**

- 父工程声明版本

  ```xml
  <!-- 使用dependencyManagement标签配置对依赖的管理 -->
  <!-- 被管理的依赖并没有真正被引入到工程 -->
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>6.0.10</version>
      </dependency>
      <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-beans</artifactId>
        <version>6.0.10</version>
      </dependency>
      <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.0.10</version>
      </dependency>
      <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-expression</artifactId>
        <version>6.0.10</version>
      </dependency>
      <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aop</artifactId>
        <version>6.0.10</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
  ```

- 子工程引用版本

  ```xml
  <!-- 子工程引用父工程中的依赖信息时，可以把版本号去掉。  -->
  <!-- 把版本号去掉就表示子工程中这个依赖的版本由父工程决定。 -->
  <!-- 具体来说是由父工程的dependencyManagement来决定。 -->
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-core</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-beans</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-expression</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-aop</artifactId>
    </dependency>
  </dependencies>
  ```

## 工程聚合

**聚合概念：**

Maven 聚合是指将多个项目组织到一个父级项目中，以便一起构建和管理的机制。聚合可以帮助我们更好地管理一组相关的子项目，同时简化它们的构建和部署过程。

**聚合作用：**

1. 管理多个子项目：通过聚合，可以将多个子项目组织在一起，方便管理和维护。
2. 构建和发布一组相关的项目：通过聚合，可以在一个命令中构建和发布多个相关的项目，简化了部署和维护工作。
3. 优化构建顺序：通过聚合，可以对多个项目进行顺序控制，避免出现构建依赖混乱导致构建失败的情况。
4. 统一管理依赖项：通过聚合，可以在父项目中管理公共依赖项和插件，避免重复定义。

**聚合语法：**

父项目中包含的子项目列表。

```xml
<project>
  <groupId>com.example</groupId>
  <artifactId>parent-project</artifactId>
  <packaging>pom</packaging>
  <version>1.0.0</version>
  <modules>
    <module>child-project1</module>
    <module>child-project2</module>
  </modules>
</project>
```

聚合演示

通过触发父工程构建命令、引发所有子模块构建！
