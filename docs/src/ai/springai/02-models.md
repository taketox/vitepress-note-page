# Models 模型

## Chat Models

聊天模型（Chat Model） API 使开发者能将 AI 驱动的对话补全功能集成到应用中。该 API 基于 GPT（生成式预训练变换器）等预训练语言模型，生成类人的自然语言响应。

该 API 通常通过向 AI 模型发送提示词或部分对话内容来工作。模型基于其训练数据和对自然语言模式的理解生成补全或延续对话的响应，最终返回给应用程序呈现给用户或进行后续处理。

Spring AI Chat Model API 设计为简洁可移植的接口，支持与多种 AI 模型 交互，使开发者能以最小代码变更切换不同模型。这一设计符合 Spring 模块化与可互换性的理念。

借助 Prompt（输入封装）和 ChatResponse（输出处理）等配套类，Chat Model API 统一了与 AI 模型的通信。它管理请求准备和响应解析的复杂性，提供直接简化的 API 交互。

## API 概览

本节提供 Spring AI Chat Model API 接口及相关类的使用指南。

### ChatModel

ChatModel 接口的定义如下：

```java
public interface ChatModel extends Model<Prompt, ChatResponse> {

    default String call(String message) {...}

    @Override
    ChatResponse call(Prompt prompt);
}
```

带 `String` 参数的 `call()` 方法简化了初始使用，避免了复杂 `Prompt` 和 `ChatResponse` 类。实际应用中更常用接收 `Prompt` 实例并返回 `ChatResponse` 的 `call()` 方法。

### StreamingChatModel

StreamingChatModel 接口定义如下：

```java
public interface StreamingChatModel extends StreamingModel<Prompt, ChatResponse> {

    default Flux<String> stream(String message) {...}

    @Override
    Flux<ChatResponse> stream(Prompt prompt);
}
```

`stream()` 方法接收 `String` 或 `Prompt` 参数（类似 `ChatModel`），但使用响应式 `Flux` API 流式传输响应。

### Prompt

Prompt 作为 `ModelRequest`，封装了 Message 对象列表及可选的模型请求参数。以下为 `Prompt` 类的简化定义（省略构造函数及其他工具方法）：

```java
public class Prompt implements ModelRequest<List<Message>> {

    private final List<Message> messages;

    private ChatOptions modelOptions;

    @Override
    public ChatOptions getOptions() {...}

    @Override
    public List<Message> getInstructions() {...}

    // 省略构造函数及其他工具方法
}
```

#### Message

`Message` 接口封装 `Prompt`（提示词）文本内容、元数据属性集合及称为 `MessageType` 的分类。

接口定义如下：

```java
public interface Content {

    String getText();

    Map<String, Object> getMetadata();
}

public interface Message extends Content {

    MessageType getMessageType();
}
```

多模态消息类型还实现 `MediaContent` 接口，提供 `Media`（媒体）内容对象列表。

```java
public interface MediaContent extends Content {

    Collection<Media> getMedia();

}
```

`Message` 接口有多种实现，对应 AI 模型可处理的消息类别：
