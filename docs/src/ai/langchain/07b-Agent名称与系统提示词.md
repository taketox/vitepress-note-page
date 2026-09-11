# 智能体：名称与系统提示词

## 5、Agent的高级用法1：设置Agent名称

创建Agent时，LangChain允许用户指定其名称

### 5.1 用法

```python
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os
from rich import print as rprint

# 从.env文件中加载环境变量
load_dotenv(override=True)

model = init_chat_model(
    model="gpt-5.4-mini",
    model_provider="openai",
    api_key=os.getenv("CLOSEAI_API_KEY"),
    base_url=os.getenv("CLOSEAI_BASE_URL")
)


agent = create_agent(
    model=model,
    name = "chat_assistant"
)

response = agent.invoke({"messages": ["你好"]})

# rprint(response)

for msg in response["messages"]:
    msg.pretty_print()
```

输出

```yaml
================================ Human Message
=================================

你好
================================== Ai Message
==================================
Name: chat_assistant

你好！有什么我可以帮你的吗？
```

输出的AI Message带有Name信息。

### 5.2 经典使用场景

name 在 Multi-Agent 场景中最常被提及，用于区分不同的 Agent。但它的作用并不局限于多 Agent编排。在实际工程中，出现如下场景，通常都建议为 Agent 设置一个清晰且稳定的 name。

**1. 流式输出归因**

在启用流式输出时，name 可用于标识当前输出内容来自哪个 Agent。

这在多 Agent 协作、Agent 嵌套调用，或前端需要实时展示不同执行主体输出时尤其有用，便于准确区分 token 或事件的来源。

**2. 消息身份标记**

设置 name 后，Agent 产生的 AIMessage 会携带对应的name信息。

这使得系统在保存会话记录、回放执行过程、构建审计日志或前端展示消息角色时，能够明确识别消息的生成者。

**3. 调试与trace可读性**

在调试、日志分析和链路追踪过程中，name 可以作为 Agent 的稳定标识，帮助开发者快速判断当前执行的是哪个 Agent。

当系统中存在多个能力相近的 Agent，或一个 Agent 被嵌套在更复杂的工作流中时，名称能够显著提升trace 的可读性和问题定位效率。

**4. 组件化封装**

在工程实践中，Agent 常被封装为可复用的能力模块，例如检索助手、SQL 助手、报告生成助手等。

为 Agent 设置 name，有助于在模块注册、运行监控、日志归档和能力复用时保持一致的身份标识。

如果后续需要将该 Agent 进一步作为子图节点、工具能力或子模块接入更复杂系统，也能降低维护和迁移成本。

**5. 前端展示与运行态可观测性**

在带有可视化界面的应用中，name 还可以直接作为运行时展示标识使用。

例如，在执行面板中显示“当前活跃 Agent”“本轮输出来源”或“调用链路中的执行节点”时，name 能帮助开发者和用户更直观地理解系统当前的执行状态。

**6. 作为稳定的运行时身份标识**

从更通用的角度看，name 可以理解为 Agent 在系统中的“ 运行时身份 ID ”。

相比临时性的展示名称，一个稳定、规范的 name 更适合用于日志检索、监控统计、链路分析和跨模块协作，因此在生产环境中通常建议显式设置，而不是依赖默认行为。

## 6、Agent的高级用法2：系统提示词

使用 create_agent 创建 Agent 时，需传入模型和工具、可选地传入系统提示词。提示词为Agent

**提供了任务背景、行为准则和操作指南。**

系统指令，即SystemMessage，通过 system_prompt 设置，定义 Agent 行为。这个参数可以是str或者SystemMessage类型。

使用建议：

- 明确说明 Agent 的角色

- 定义输出格式

- 说明何时使用工具

比如：

```python
agent = create_agent(
    model=model,
    tools=[get_weather],
    system_prompt="""你是天气助手。

工作流程：
1. 理解用户的城市查询
2. 使用 get_weather 工具获取数据
3. 简洁清晰地回答

输出格式：
- 天气状况
- 温度
- 注意事项（如有）
"""
)
```

提示词设置有两种方式：静态设置和动态设置。动态设置需要借助中间件，后续讲解。

举例1：

```python
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os
load_dotenv(override=True)


# 1.导入模型
model = init_chat_model(
    model="gpt-5.4-mini",
    model_provider="openai",
    api_key=os.getenv("CLOSEAI_API_KEY"),
    base_url=os.getenv("CLOSEAI_BASE_URL")
)

# 2.导入工具
web_search = TavilySearch(max_results=2)

# 3.创建Agent
agent = create_agent(
    model=model,
    tools=[web_search],
    system_prompt="你是一名多才多艺的智能助手，可以调用工具帮助用户解决问题。"
)

# 4.运行Agent获得结果
result = agent.invoke(
    {"messages": [
        {"role": "user", "content": "请帮我查询2026年足球世界杯是哪个国家举办的？"}
    ]}
)

print(result['messages'][-1].content)
2026年足球世界杯由**三个国家联合举办**：**加拿大、墨西哥和美国**。
```

举例2：

```python
from langchain.agents import create_agent
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from rich import print as rprint

# 工具：实现两数相加
@tool
def add_numbers(a: int, b: int) -> str:
    """计算并返回两个数的和。"""
    return f"和为：{a + b}"


# 创建客服助手Agent
agent = create_agent(
    model=model,
    tools=[add_numbers],  # 工具列表
    # system_prompt="你是一个数学助手，解决日常的算术问题"
    system_prompt=SystemMessage(content="你是一个数学助手，解决日常的算术问题")
)

response = agent.invoke(
    {"messages": [
        {"role": "user", "content": "10加上20再加上30是多少？"}
    ]},
)

rprint(response)
# print(response["messages"][-1].content)
```

结果如下：

```python
{
 'messages': [
     HumanMessage(
         content='10加上20再加上30是多少？',
         additional_kwargs={},
         response_metadata={},
         id='bd84f000-da12-450c-aeef-0719afcfecfd'
     ),
     AIMessage(
         content='',
         additional_kwargs={'refusal': None},
         response_metadata={
             'token_usage': {
                 'completion_tokens': 22,
                 'prompt_tokens': 158,
                 'total_tokens': 180,
                 'completion_tokens_details': {
                     'accepted_prediction_tokens': 0,
                     'audio_tokens': 0,
                     'reasoning_tokens': 0,
                     'rejected_prediction_tokens': 0
                 },
                 'prompt_tokens_details': {'audio_tokens': 0,
'cached_tokens': 0},
                 'latency_checkpoint': {
                     'engine_tbt_ms': 3,
                     'engine_ttft_ms': 31,
                     'engine_ttlt_ms': 106,
                     'pre_inference_ms': 94,
                     'service_tbt_ms': 4,
                     'service_ttft_ms': 282,
                     'service_ttlt_ms': 352,
                     'total_duration_ms': 267,
                     'user_visible_ttft_ms': 188
                 }
             },
             'model_provider': 'openai',
             'model_name': 'gpt-5.4-mini-2026-03-17',
             'system_fingerprint': None,
             'id': 'chatcmpl-DmKgu0QquKeWrXBncvxCak9zkIkEf',
             'service_tier': 'default',
             'finish_reason': 'tool_calls',
             'logprobs': None
         },
         id='lc_run--019e88cd-d248-76b0-836c-71c63856787a-0',
         tool_calls=[
             {
                 'name': 'add_numbers',
                 'args': {'a': 10, 'b': 20},
                 'id': 'call_PWuscHI7NFdVbAV9wsMzOWKy',
                 'type': 'tool_call'
             }
         ],
         invalid_tool_calls=[],
         usage_metadata={
             'input_tokens': 158,
             'output_tokens': 22,
             'total_tokens': 180,
             'input_token_details': {'audio': 0, 'cache_read': 0},
             'output_token_details': {'audio': 0, 'reasoning': 0}
         }
     ),
     ToolMessage(
         content='和为：30',
         name='add_numbers',
         id='12635dff-6bd8-4325-b64b-bf203d4cacbb',
         tool_call_id='call_PWuscHI7NFdVbAV9wsMzOWKy'
     ),
     AIMessage(
         content='',
         additional_kwargs={'refusal': None},
         response_metadata={
             'token_usage': {
                 'completion_tokens': 22,
                 'prompt_tokens': 194,
                 'total_tokens': 216,
                 'completion_tokens_details': {
                     'accepted_prediction_tokens': 0,
                     'audio_tokens': 0,
                     'reasoning_tokens': 0,
                     'rejected_prediction_tokens': 0
                 },
                 'prompt_tokens_details': {'audio_tokens': 0,
'cached_tokens': 0},
                 'latency_checkpoint': {
                     'engine_tbt_ms': 3,
                     'engine_ttft_ms': 31,
                     'engine_ttlt_ms': 105,
                     'pre_inference_ms': 82,
                     'service_tbt_ms': 4,
                     'service_ttft_ms': 257,
                     'service_ttlt_ms': 336,
                     'total_duration_ms': 269,
                     'user_visible_ttft_ms': 176
                 }
             },
             'model_provider': 'openai',
             'model_name': 'gpt-5.4-mini-2026-03-17',
             'system_fingerprint': None,
             'id': 'chatcmpl-DmKgvO5dZRkveTKDtLdPF4BObFmdZ',
             'service_tier': 'default',
             'finish_reason': 'tool_calls',
             'logprobs': None
         },
         id='lc_run--019e88cd-d880-7601-a250-d4ddea91669d-0',
         tool_calls=[
             {
                 'name': 'add_numbers',
                 'args': {'a': 30, 'b': 30},
                 'id': 'call_dZDyMZS1BYRJHdW32uj4z8R8',
                 'type': 'tool_call'
             }
         ],
         invalid_tool_calls=[],
         usage_metadata={
             'input_tokens': 194,
             'output_tokens': 22,
             'total_tokens': 216,
             'input_token_details': {'audio': 0, 'cache_read': 0},
             'output_token_details': {'audio': 0, 'reasoning': 0}
         }
     ),
     ToolMessage(
         content='和为：60',
         name='add_numbers',
         id='ffa8b21a-d3fe-4970-bddf-57d3e121f3bf',
         tool_call_id='call_dZDyMZS1BYRJHdW32uj4z8R8'
     ),
     AIMessage(
         content='10加上20再加上30等于 **60**。',
         additional_kwargs={'refusal': None},
         response_metadata={
             'token_usage': {
                 'completion_tokens': 18,
                 'prompt_tokens': 230,
                 'total_tokens': 248,
                 'completion_tokens_details': {
                     'accepted_prediction_tokens': 0,
                     'audio_tokens': 0,
                     'reasoning_tokens': 0,
                     'rejected_prediction_tokens': 0
                 },
                 'prompt_tokens_details': {'audio_tokens': 0,
'cached_tokens': 0},
                 'latency_checkpoint': {
                     'engine_tbt_ms': 4,
                     'engine_ttft_ms': 41,
                     'engine_ttlt_ms': 115,
                     'pre_inference_ms': 91,
                     'service_tbt_ms': 4,
                     'service_ttft_ms': 294,
                     'service_ttlt_ms': 360,
                     'total_duration_ms': 278,
                     'user_visible_ttft_ms': 203
                 }
             },
             'model_provider': 'openai',
             'model_name': 'gpt-5.4-mini-2026-03-17',
             'system_fingerprint': None,
             'id': 'chatcmpl-DmKgwNFV9EzDelG0YCsReEfggh4Gg',
             'service_tier': 'default',
             'finish_reason': 'stop',
             'logprobs': None
         },
         id='lc_run--019e88cd-dd3b-7271-80ec-76a8b980a858-0',
         tool_calls=[],
         invalid_tool_calls=[],
         usage_metadata={
             'input_tokens': 230,
             'output_tokens': 18,
             'total_tokens': 248,
             'input_token_details': {'audio': 0, 'cache_read': 0},
             'output_token_details': {'audio': 0, 'reasoning': 0}
         }
     )
 ]
}
```

举例3：

```python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain.messages import SystemMessage, HumanMessage

flag = 0

@tool
def get_weather(city: str):
    """
    天气查询工具

    Args:
        city: 城市名称
    """
    global flag
    flag += 1

    if flag < 3:
        # raise Exception("暂时无法访问")
        return "TEMP_UNAVAILABLE: 天气服务暂时不可用，请稍后重试"

    return f"{city}今天天气挺好"


messages = [
    HumanMessage("你好，杭州今天的天气如何？")
]

agent = create_agent(
    model=model,
    tools=[get_weather],
    system_prompt=SystemMessage(
        "你是一个天气助手。"
        "当工具返回以 'TEMP_UNAVAILABLE:' 开头的结果时，"
        "说明是临时故障，不要立即放弃；"
        "你应再次调用同一个工具，最多重试 3 次。"
        "如果 3 次后仍失败，再向用户说明服务暂时不可用。"
    )
)
response = agent.invoke({"messages": messages})
# print(response)
for msg in response["messages"]:
    msg.pretty_print()
```

输出如下

```text
================================ Human Message
=================================

你好，杭州今天的天气如何？
================================== Ai Message
==================================
Tool Calls:
get_weather (call_1NZMHHj1xByT0Zx7WhiK6AO1)
Call ID: call_1NZMHHj1xByT0Zx7WhiK6AO1
Args:
   city: 杭州
================================= Tool Message
=================================
Name: get_weather

TEMP_UNAVAILABLE: 天气服务暂时不可用，请稍后重试
================================== Ai Message
==================================
Tool Calls:
get_weather (call_Lgfn3Ll8WTJqQRVVwLIzRQnX)
Call ID: call_Lgfn3Ll8WTJqQRVVwLIzRQnX
Args:
 city: 杭州
================================= Tool Message
=================================
Name: get_weather

TEMP_UNAVAILABLE: 天气服务暂时不可用，请稍后重试
================================== Ai Message
==================================
Tool Calls:
get_weather (call_PghYww2kjkigDZK8h6P5Lth0)
Call ID: call_PghYww2kjkigDZK8h6P5Lth0
Args:
 city: 杭州
================================= Tool Message
=================================
Name: get_weather

杭州今天天气挺好
================================== Ai Message
==================================

杭州今天天气挺好。
```
