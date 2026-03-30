# Spring AI介绍

## 什么是Spring AI

**Spring AI是面向 Java 和 Spring 生态的原生生成式人工智能框架**。它不是简单地将 Python 中的 LangChain 或 LlamaIndex 移植到 Java，而是依据 Spring 的设计理念——如依赖注入、POJO、模块化和可配置——重构生成式 AI 的全流程。**通过 Spring Boot 的自动装配机制，开发者可以像调用数据库或 Web API 一样轻松地接入聊天、嵌入、图像生成、语音处理等 AI 能力**，并且能够毫不费力地将企业内部数据与 AI 模型关联起来（如同 RAG 检索增强生成中常用的数据注入方式）。

Spring AI 倡导**一套接口，多种实现**，开发者无须为不同 AI 提供商逐一适配，而是可以通过统一抽象实现轻松切换，比如 OpenAI、Anthropic、Bedrock、Hugging Face、Vertex AI、Ollama 等服务。

- [Spring AI 官网地址](https://spring.io/projects/spring-ai)

- [Spring AI 文档地址](https://docs.spring.io/spring-ai/reference/index.html)

## Spring AI 特点

Spring AI 功能模块丰富，涵盖AI应用开发的各个环节，具备如下特点：

1. 多供应商模型支持
支持主流的AI模型提供商，例如：Anthropic、OpenAI、Microsoft、Amazon、Google、Ollama 等模型服务。通过这些模型可以实现聊天、文本嵌入、文生图、音频转录、文本转语音、内容审核等多种能力。
2. 统一抽象API
提供如 ChatClient, EmbeddingModel, ImageModel 等统一接口，无论切换到哪家 AI 平台，调用方式一致，同时支持同步与流式调用，也能够访问模型特定功能。
3. Spring Boot集成
以 Starter 和自动装配方式支持 AI 模型、向量数据库、ETL 工具等，开发者可通过 Initializr 快速上手。
4. 结构化输出与类型安全
模型的响应可解析并映射到 Java POJO，保证后续处理的类型安全与可维护性。
5. 向量存储与RAG
集成了主流向量数据库（PostgreSQL/pgvector、Pinecone、Qdrant、Redis、Weaviate 等）及其元数据过滤，通过内置的 ETL 文档处理流程，结合检索增强生成（RAG）实现文档问答和聊天检索。
6. Tool/Function Calling
支持模型发起函数调用（类似 OpenAI Function Calling），可以注册 Spring Bean 作为可调用工具，从而访问实时业务系统或执行外部操作。
7. 可观测性与评估
内建对于 AI 调用的监控指标与日志、模型评估工具，可用于检测响应准确性、防止“幻觉”。

## 快速开始

### 环境要求

Spring AI构建在Spring Boot 3.x之上，Spring Boot 3.x系列最低Java要求版本是JDK17，不支持Java8/11/16等低于17的版本，推荐使用Maven3.6及以上版本。

### Maven Central

Spring AI 1.0.0 及更高版本可在 Maven Central 中获取。无需额外的仓库配置。只需确保在您的构建文件中启用了 Maven Central。

```xml
<repositories>
    <repository>
        <id>central</id>
        <url>https://repo.maven.apache.org/maven2</url>
    </repository>
</repositories>
```

### 快照 - 添加快照仓库

要使用最新的开发版本（例如 1.1.0-SNAPSHOT ）或 1.0.0 之前的旧里程碑版本，您需要在构建文件中添加以下快照仓库。
将以下仓库定义添加到您的 Maven 或 Gradle 构建文件中：

```xml
<repositories>
  <repository>
    <id>spring-snapshots</id>
    <name>Spring Snapshots</name>
    <url>https://repo.spring.io/snapshot</url>
    <releases>
      <enabled>false</enabled>
    </releases>
  </repository>
  <repository>
    <name>Central Portal Snapshots</name>
    <id>central-portal-snapshots</id>
    <url>https://central.sonatype.com/repository/maven-snapshots/</url>
    <releases>
      <enabled>false</enabled>
    </releases>
    <snapshots>
      <enabled>true</enabled>
    </snapshots>
  </repository>
</repositories>
```

### 依赖管理

Spring AI 物料清单（BOM）声明了给定版本 Spring AI 所使用的所有依赖项的推荐版本。这是一个仅包含物料清单的版本，其中只包含依赖管理，不包含插件声明或对 Spring 或 Spring Boot 的直接引用。您可以使用 Spring Boot 父 POM，或使用 Spring Boot 的 BOM（ spring-boot-dependencies ）来管理 Spring Boot 版本。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```
