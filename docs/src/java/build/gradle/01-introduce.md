# 简介概览

## Gradle 简介

Gradle 是一款 Google 推出的基于 JVM、通用灵活的项目构建工具，支持 Maven，JCenter 多种第三方仓库;支持传递性

依赖管理、废弃了繁杂的 xml 文件，转而使用简洁的、支持多种语言（例如：java、groovy 等）的 build 脚本文件。

官网地址： [gradle.org](https://gradle.org/)

![An image](/img/java/build/gradle/01.png)

虽然目前市面上常见的项目构建工具有 Ant、Maven、Gradle，主流还是 Maven，但是未来趋势 Gradle。

## 常见的项目构建工具

### Ant

2000 年 Apache 推出的纯 Java 编写构建工具，通过 xml[build.xml]文件管理项目

- 优点：使用灵活，速度快(快于 gradle 和 maven)
- 缺点：Ant 没有强加任何编码约定的项目目录结构，开发人员需编写繁杂 XML 文件构建指令，对开发人员是一个挑战。

### Maven

2004 年 Apache 组织推出的再次使用 xml 文件[pom.xml]管理项目的构建工具。

- 优点：遵循一套约定大于配置的项目目录结构，使用统一的 GAV 坐标进行依赖管理，侧重于包管理。
- 缺点：项目构建过程僵化，配置文件编写不够灵活、不方便自定义组件，构建速度慢于 gradle。

### Gradle

2012 年 Google 推出的基于 Groovy 语言的全新项目构建工具，集合了 Ant 和 Maven 各自的优势。

- 优点：集 Ant 脚本的灵活性+Maven 约定大于配置的项目目录优势，支持多种远程仓库和插件，侧重于大项目构建。
- 缺点：学习成本高、资料少、脚本灵活、版本兼容性差等。

![An image](/img/java/build/gradle/02.png)

>无论哪种项目构建工具，都有自身的优势和劣势，所以选择一款最适合自己的就是最好的。
