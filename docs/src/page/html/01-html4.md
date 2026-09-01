# HTML4

## 简介

**什么是HTML？**

全称：HyperText Markup Language（超文本标记语言）。

>超文本：暂且简单理解为 “超级的文本”，和普通文本比，内容更丰富。
>
>标 记：文本要变成超文本，就需要用到各种标记符号。
>
>语 言：每一个标记的写法、读音、使用规则，组成了一个标记语言。

**相关国际组织：**

- IETF

  全称：Internet Engineering Task Force（国际互联网工程任务组），成立于1985年底，是一个权威的互联网技术标准化组织，主要负责互联网相关技术规范的研发和制定，当前绝大多数国际互联网技术标准均出自IETF。官网：https://www.ietf.org

- W3C

  全称：World Wide Web Consortium（万维网联盟），创建于1994年，是目前Web技术领域，最具影响力的技术标准机构。共计发布了200多项技术标准和实施指南，对互联网技术的发展和应用起到了基础性和根本性的支撑作用，官网：https://www.w3.org

- WHATWF

  全称：Web Hypertext Application Technology Working Group（网页超文本应用技术工作小组）成立于2004年，是一个以推动网络HTML 5 标准为目的而成立的组织。由Opera、Mozilla基金会、苹果，等这些浏览器厂商组成。官网：https://whatwg.org

**基本结构：**

```html
<html>
    <head>
        <title>网页标题</title>
    </head>
    <body>
    ......
    </body>
</html>
```

**注释：**

注释的内容会被浏览器所忽略，不会呈现到页面中，但源代码中依然可见。注释不可以嵌套。

```html
<!-- 单行注释 -->

<!--
多行注释
-->
```

**文档声明：**

告诉浏览器当前网页的版本。

```html
<!-- 推荐使用 -->
<!DOCTYPE html>

<!DOCTYPE HTML>

<!doctype html>
```

**字符编码：**

为了让浏览器在渲染 `html` 文件时，不犯错误，可以通过 `meta` 标签配合 `charset` 属性指定字符编码。

```html
<head>
    <meta charset="UTF-8"/>
</head>
```

**设置语言：**

让浏览器显示对应的翻译提示。有利于搜索引擎优化。

```html
<html lang="zh-CN">
```

>zh-CN ：中文-中国大陆（简体中文）
>
>zh-TW ：中文-中国台湾（繁体中文）
>
>zh ：中文
>
>en-US ：英语-美国
>
>en-GB ：英语-英国

**HTML标准结构：**

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <!-- 主要用于控制网页在移动设备上的显示方式,确保网页在不同设备（如手机、平板、桌面电脑）上能够正确缩放和布局 -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>

    </body>
</html>
```

> VSCode 在 `html` 文件中输入 `!` 即可生成标准结构

## 参考文档

- W3C官网： www.w3c.org
- W3School： [w3school](https://www.w3school.com.cn/)
- MDN： [MDN Web Docs](https://developer.mozilla.org/zh-CN/)

## 排版标签

| 标签名    | 标签含义                   | 单 / 双 标签 |
| --------- | -------------------------- | ------------ |
| `h1 ~ h6` | 标题                       | 双           |
| `p`       | 段落                       | 双           |
| `div`     | 没有任何含义，用于整体布局 | 双           |

> `h1~h6` 不能互相嵌套
>
> `p` 标签里面不能有： `h1~h6` 、 `p` 、 `div` 标签

**语义化标签：**

用特定的标签，去表达特定的含义。

**块级/行内元素：**

- **块级元素**：独占一行（排版标签都是块级元素）。
- **行内元素**：不独占一行

>1. **块级元素** 中能写 **行内元素** 和 **块级元素**（简单记：块级元素中几乎什么都能写）。
>
>2. **行内元素** 中能写 **行内元素**，但不能写 **块级元素**。

## 文本标签

文本标签通常都是排版标签里面且都是行内元素，排版标签更宏观（大段的文字），文本标签更微观（词汇、短语）。

| 标签名   | 标签含义                         | 单 / 双 标签 |
| -------- | -------------------------------- | ------------ |
| `em`     | 要着重阅读的内容                 | 双           |
| `strong` | 十分重要的内容（语气比em要强）   | 双           |
| `span`   | 没有语义，用于包裹短语的通用容器 | 双           |

> div 是大包装袋， span 是小包装袋

| 标签名       | 标签含义                                                     | 单 / 双 标签 |
| ------------ | ------------------------------------------------------------ | ------------ |
| `cite`       | 要着重阅读的内容                                             | 双           |
| `dfn`        | 十分重要的内容（语气比em要强）                               | 双           |
| `del`        | 插入的文本                                                   | 双           |
| `ins`        | 插入的文本                                                   | 双           |
| `sub`        | 下标文字                                                     | 双           |
| `sup`        | 上标文字                                                     | 双           |
| `code`       | 一段代码                                                     | 双           |
| `samp`       | 从正常的上下文中，将某些内容提取出来，例如：标识设备输出     | 双           |
| `kbd`        | 键盘文本，表示文本是通过键盘输入的，经常用在与计算机相关的手册中 | 双           |
| `abbr`       | 缩写，最好配合上 `title` 属性                                | 双           |
| `bdo`        | 更改文本方向，要配合 `dir` 属性，可选值: `ltr` （默认值）、`rtl` | 双           |
| `var`        | 标记变量，可以与 code 标签一起使用                           | 双           |
| `small`      | 附属细则，例如：包括版权、法律文本。                         | 双           |
| `b`          | 摘要中的关键字、评论中的产品名称。                           | 双           |
| `i`          | 本意是：人物的思想活动、所说的话等等。现在多用于：呈现字体图标（后面要讲的内容）。 | 双           |
| `u`          | 与正常内容有反差文本，例如：错的单词、不合适的描述等。       | 双           |
| `q`          | 短引用                                                       | 双           |
| `blockquote` | 长引用                                                       | 双           |
| `address`    | 地址信息                                                     | 双           |

## 图片标签

| 标签名 | 标签含义 | **常用属性**                                                 | 单 / 双 标签 |
| ------ | -------- | ------------------------------------------------------------ | ------------ |
| `img`  | 图片     | `src` ：图片路径（又称：图片地址）—— 图片的具体位置<br/>`alt `：图片描述<br/>`width` ：图片宽度，单位是像素，例如： `200px` 或 200<br/>`height` ：图片高度， 单位是像素，例如： `200px` 或 200 | 双           |

>像素（ px ）是一种单位
>
>搜索引擎通过 alt 属性，得知图片的内容。
>
>当图片无法展示时候，有些浏览器会呈现 alt 属性的值

## 超链接

| 标签名 | 标签含义 | **常用属性**                                                 | 单 / 双 标签 |
| ------ | -------- | ------------------------------------------------------------ | ------------ |
| `a`    | 超链接   | `href` ：指定要跳转到的具体目标<br/>`target `：控制跳转时如何打开页面，**_self** ：在本窗口打开，**_blank** ：在新窗口打开。<br/>`id` ：元素的唯一 标识，可用于设置锚点<br/>`name` ：元素的名字，写在 a 标签中，也能设置锚点 | 双           |

```html
<!--  第一种方式：a标签配合name属性 --> 
<a name="test1"></a>
<!--  第二种方式：其他标签配合id属性 -->
<h2 id="test2">我是一个位置</h2>
<!-- 跳转到test1锚点-->
<a href="#test1">去test1锚点</a>

<!--  跳到本页面顶部 --> 
<a  href="#">回到顶部</a>

<!--  跳转到其他页面锚点 -->
<a href="demo.html#test1">去demo.html页面的test1锚点</a>

<!--  刷新本页面 -->
<a  href="">刷新本页面</a>

<!--  执行一段js,如果还不知道执行什么，可以留空，javascript:;  -->
<a href="javascript:alert(1);">点我弹窗</a>

<!--  唤起设备拨号 -->
<a href="tel:10010">电话联系</a> <!--  唤起设备发送邮件 -->
<a href="mailto:10010@qq.com">邮件联系</a> <!--  唤起设备发送短信 -->
<a href="sms:10086">短信联系</a>
```

## 列表

**有序列表：**

```html
<ol>
    <li>把冰箱门打开</li>
    <li>把大象放进去</li>
    <li>把冰箱门关上</li>
</ol>
```

**无序列表：**

```html
<ul>
    <li>成都</li>
    <li>上海</li>
    <li>西安</li>
    <li>武汉</li>
</ul>
```

**列表嵌套：**

```html
<ul>
    <li>成都</li>
    <li>
        <span>上海</span>
        <ul>
            <li>外滩</li>
            <li>杜莎夫人蜡像馆</li>
            <li>
                <a href="https://www.opg.cn/">东方明珠</a>
            </li>
            <li>迪士尼乐园</li>
        </ul>
    </li>
    <li>西安</li>
    <li>武汉</li>
</ul>
```

**自定义列表：**

用于定义术语及其描述。它使用 `<dl>` 标签来创建，包含 `<dt>`（定义术语）和 `<dd>`（定义描述）两个子标签。

自定义列表通常用于展示词汇表、FAQ 或其他需要术语和解释的内容。

```html
<dl>
    <dt>术语 1</dt>
    <dd>术语 1 的描述</dd>
    <dt>术语 2</dt>
    <dd>术语 2 的描述</dd>
</dl>
```

## 表格

一个完整的表格由：**表格标题**、**表格头部**、**表格主体**、**表格脚注**，四部分组成。

| 标签名    | 标签语义                                    | 常用属性                                                     | 单 / 双 标签 |
| --------- | ------------------------------------------- | ------------------------------------------------------------ | ------------ |
| `table`   | 表格                                        | `width`：设置表格宽度。<br/>`height`：设置表格最小高度, 表格最终高度可能比设置值大。<br/>`border`：设置表格边框宽度。<br/>`cellspacing`：设置单元格之间的距离。 | 双           |
| `caption` | 表格标题                                    |                                                              | 双           |
| `thead`   | 表格头部                                    | `height`：设置表格头部高度。<br/>`align`：设置单元格的水平对齐方式，可选值：left、center、right。<br/>`valign`：设置单元格的垂直对齐方式，可选值：top、middle、bottom。 | 双           |
| `tbody`   | 表格主体                                    | 常用属性与thead相同。                                        | 双           |
| `tfoot`   | 表格注脚                                    | 常用属性与thead相同。                                        | 双           |
| `tr`      | 每一行                                      | 常用属性与thead相同。                                        | 双           |
| `th`      | 每一个单元格（表格头部中用 `th`）           | 常用属性与`td`相同。                                         | 双           |
| `td`      | 每一个单元格（表格主体、表格脚注中用 `td`） | `width`：设置单元格宽度。同列所有单元格全都受影响。<br/>`height`：设置单元格高度。同行所有单元格全都受影响。<br/>`align`：设置单元格的水平对齐方式。<br/>`valign`：设置单元格的垂直对齐方式。<br/>`rowspan`：指定要跨的行数。<br/>`colspan`：指定要跨的列数。 | 双           |

>- `<table>` 元素的 border 属性可以控制表格边框，但 border 值的大小，并不控制单元格边框的宽度，只能控制表格最外侧边框的宽度。
>- 给某个 th 或 td 设置了宽度之后，他们所在的那一列的宽度就确定了。
>- 给某个 th 或 td 设置了高度之后，他们所在的那一行的高度就确定了。

```html
    <table>
        <!-- 表格标题 -->
        <caption>员工工资表</caption>

        <!-- 表格头部 -->
        <thead>
            <tr>
                <th>姓名</th>
                <th>职位</th>
                <th>工资</th>
            </tr>
        </thead>

        <!-- 表格主体 -->
        <tbody>
            <tr>
                <td>张三</td>
                <td>前端开发</td>
                <td>¥15,000</td>
            </tr>
            <tr>
                <td>李四</td>
                <td>后端开发</td>
                <td>¥18,000</td>
            </tr>
            <tr>
                <td>王五</td>
                <td>UI 设计师</td>
                <td>¥12,000</td>
            </tr>
        </tbody>

        <!-- 表格脚注 -->
        <tfoot>
            <tr>
                <td colspan="2">总计</td>
                <td>¥45,000</td>
            </tr>
        </tfoot>
    </table>
```

**代码预览：**

<table>
    <!-- 表格标题 -->
    <caption>员工工资表</caption>
    <thead>
        <tr>
            <th>姓名</th>
            <th>职位</th>
            <th>工资</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>前端开发</td>
            <td>¥15,000</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>后端开发</td>
            <td>¥18,000</td>
        </tr>
        <tr>
            <td>王五</td>
            <td>UI 设计师</td>
            <td>¥12,000</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2">总计</td>
            <td>¥45,000</td>
        </tr>
    </tfoot>
</table>

**常用标签：**

| 标签名 | 标签含义                                   | 单 / 双 标签 |
| ------ | ------------------------------------------ | ------------ |
| `br`   | 换行                                       | 单           |
| `hr`   | 分隔                                       | 单           |
| `pre`  | 按原文显示（一般用于在页面中嵌入大段代码） | 双           |

## 表单

| 标签名   | 标签含义 | 常用属性                                                     | 单 / 双 标签 |
| -------- | -------- | ------------------------------------------------------------ | ------------ |
| `form`   | 表单     | `action`：用户指定表单的提交地址（需要与后端沟通确定）。<br/>`target`: 用于控制表单提交后，如何打开页面，常用值如下：<br/>`_self`: 在本窗口打开.<br/>`_blank`: 在新窗口打开.<br/>`method`：用户控制表单的提交方式。 |              |
| `input`  | 输入框   | `type`：设置输入框的类型，目前用到的值是`text`，表示普通文本。<br/>`name`：用户指定提交数据的名字。 |              |
| `button` | 按钮     |                                                              |              |

## 表单控件

| 标签名     | 标签含义         | 常用属性                                                     | 单 / 双 标签 |
| ---------- | ---------------- | ------------------------------------------------------------ | ------------ |
| `form`     | 表单             | `action`: 表单要提交的地址 `target`: 要跳转的新地址打开位置 (`_self` / `_blank`) `method`: 请求方式 (`get` / `post`) | 双           |
| `input`    | 表单控件         | `type`: 属性：表单控件类型, 可选值：`text`, `password`, `radio`, `checkbox`, `hidden`, `submit`, `reset`, `button`等<br/>`name`: 指定数据名称<br/>`value`: 对于输入框，默认输入的值；对于单选和复选框：实际提交的数据；对于按钮，显示文字<br/>`disabled`: 设置表单控件不可用<br/>`maxlength`: 输入框最大可输入长度<br/>`checked`: 对于单选按钮和复选框，默认选中 | 单           |
| `textarea` | 文本域           | `name`: 数据名称 <br/>`rows`: 默认显示的行数，影响文本域的高度 <br/>`cols`: 默认显示的列数，影响文本域的宽度 <br/>`disabled`: 设置表单控件不可用 | 双           |
| `select`   | 下拉框           | `name`: 指定数据名称 `disabled`: 设置整个下拉框不可用        | 双           |
| `option`   | 下拉框的选项     | `disabled`: 设置选项不可用 <br/>`value`: 选项提交的数据（不指定`value`，会把标签中的内容作为提交数据）<br/> `selected`: 默认选中 | 双           |
| `button`   | 按钮             | `disabled`: 设置按钮不可用 <br/>`type`: 按钮类型 (`submit` （默认）/ `reset` / `button`) | 双           |
| `label`    | 与表单控件做关联 | `for`: 要与关联的表单控件的ID值相同                          | 双           |
| `fieldset` | 表单控件分组     |                                                              | 双           |
| `legend`   | 分组名称         |                                                              | 双           |

**示例：**

```html
<!-- 文本输入框 -->
<input type="text">

<!-- 密码输入框 -->
<input type="password">

<!-- 单选框 -->
<input type="radio" name="sex" value="male" checked>男

<!-- 复选框 -->
<input type="checkbox" name="hobby" value="drink">喝酒

<!-- 隐藏域 -->
<!-- 隐藏域是一个用户不可见的输入区域，作用是在提交表单时携带一些固定的数据。-->
<input type="hidden" name="tag" value="100">

<!-- 提交按钮 -->
<input type="submit" value="点我提交表单">
<button>点我提交表单</button>

<!-- 重置按钮 -->
<input type="reset" value="点我重置">
<button type="reset">点我重置</button>

<!-- 普通按钮 -->
<input type="button" value="普通按钮">

<!-- 文本域 -->
<textarea name="msg" rows="22" cols="3">我是文本域</textarea>

<!-- 下拉框 -->
<select name="from">
    <option value="黑">黑龙江</option>
    <option value="辽">辽宁</option>
    <option value="吉">吉林</option>
</select>
```

## 框架标签

| 标签名   | 功能和语义         | 属性                                                         | 单/双标签 |
| -------- | ------------------ | ------------------------------------------------------------ | --------- |
| `iframe` | 框架（在网页中嵌入 | `name`: 框架名字，可以与 `target` 属性配合。 `width`: 框架的宽。 `height`: 框架的高度。 `frameborder`: 是否显示边框，值：0 或者1。 | 双标签    |

**示例：**

```html
<!-- 利用iframe嵌入一个普通网页 -->
    <iframe src="https://www.taobao.com" width="900" height="300" frameborder="1" ></iframe>

<!-- 利用iframe嵌入一个广告网页 -->
    <iframe width="300" height="300" src="这里输入广告的网址" frameborder="0"></iframe>

<!-- 利用iframe嵌入其他内容 -->
<iframe src="./resource/如何一夜暴富.pdf" frameborder="0"></iframe>

<!-- 与超链接的target属性配合使用 -->
<a href="https://www.taobao.com" target="tt">点我看淘宝</a>
<iframe name="tt" frameborder="0"></iframe>

<!-- 与表单的target属性配合使用 -->
<form action="https://so.toutiao.com/search" target="container">
    <input type="text" name="keyword">
    <input type="submit" value="搜索">
</form>
<iframe name="container" frameborder="0"></iframe>
```

>- `<form>`元素是一个表单，用于创建一个可以接受用户输入的区域，以便提交到指定的URL地址。这里的action属性指定了表单提交的目标URL为 `https://so.toutiao.com/search`，`target` 属性设置为 `container`，意味着表单提交后的结果将在名为 `container` 的 `iframe` 中显示。该属性与 `iframe` 的 `name` 属性相对应，用于指定目标显示位置。
>- `<input>`元素是表单中的一个输入字段，这里有两个：
>  - 第一个输入字段使用 `type="text"`，即文本输入框，`name="keyword"` 为输入字段的名称，用于表示用户输入的关键字。
>  - 第二个输入字段使用 `type="submit"`，即提交按钮，`value="搜索"` 为按钮上显示的文本。
>- `<iframe>` 元素用于在页面中嵌入其他文档或内容，这里的 `name` 属性设置为 `container`，与表单的 `target` 属性相对应。这意味着当表单提交后，搜索结果会在这个名为 `container` 的 `iframe` 中显示。`frameborder="0"` 用于取消 `iframe` 的边框。

## 全局属性

| 属性名  | 含义                                                         |
| ------- | ------------------------------------------------------------ |
| `id`    | 给标签指定唯一标识， 注意：`id`是不能重复的。 作用：可以让`label`标签与表单控件相关联；也可以与`CSS`、`JavaScript`配合使用。 |
| `class` | 给标签指定类名，随后通过CSS就可以给标签设置样式。            |
| `style` | 给标签设置`CSS`样式。                                        |
| `dir`   | 内容的方向，值：`ltr`、`rtl`                                 |
| `title` | 给标签设置一个文字提示，一般超链接和图片用得比较多。         |
| `lang`  | 给标签指定语言                                               |

## meta 元信息

| 值          | 描述                               |
| ----------- | ---------------------------------- |
| `index`     | 允许搜索爬虫索引此页面。           |
| `noindex`   | 要求搜索爬虫不索引此页面。         |
| `follow`    | 允许搜索爬虫跟随此页面上的链接。   |
| `nofollow`  | 要求搜索爬虫不跟随此页面上的链接。 |
| `all`       | 与 `index`, `follow` 等价。        |
| `none`      | 与 `noindex`, `nofollow` 等价。    |
| `noarchive` | 要求搜索引擎不缓存页面内容。       |
| `nocache`   | `noarchive` 的替代名称。           |

示例

```html
<!-- 配置字符编码： -->
<meta charset="utf-8">

<!-- 针对 IE 浏览器的兼容性配置： -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- 针对移动端的配置（移动端课程中会详细讲解）： -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 配置网页关键字： -->
<meta name="keywords" content="8-12个以英文逗号隔开的单词/词语">

<!-- 配置网页描述信息： -->
<meta name="description" content="80字以内的一段话，与网站内容相关">

<!-- 针对搜索引擎爬虫配置： -->
<meta name="robots" content="此处可选值见下表">

<!-- 配置网页作者： -->
<meta name="author" content="作者名">

<!-- 配置网页生成工具： -->
<meta name="generator" content="工具名">

<!-- 配置定义网页版权信息： -->
<meta name="copyright" content="版权信息">

<!-- 配置网页自动刷新： -->
<meta http-equiv="refresh" content="秒数;url=网址">
```
