# RestFul

## RESTFul风格

### 简介

![An image](/img/java/spring/mvc/07.png)

RESTful（Representational State Transfer）是一种软件架构风格，用于设计网络应用程序和服务之间的通信。它是一种基于标准 HTTP 方法的简单和轻量级的通信协议，广泛应用于现代的Web服务开发。

通过遵循 RESTful 架构的设计原则，可以构建出易于理解、可扩展、松耦合和可重用的 Web 服务。RESTful API 的特点是简单、清晰，并且易于使用和理解，它们使用标准的 HTTP 方法和状态码进行通信，不需要额外的协议和中间件。

总而言之，RESTful 是一种基于 HTTP 和标准化的设计原则的软件架构风格，用于设计和实现可靠、可扩展和易于集成的 Web 服务和应用程序！

![An image](/img/java/spring/mvc/08.png)

学习RESTful设计原则可以帮助我们更好去设计HTTP协议的API接口！！

### 特点

1. 每一个URI代表1种资源（URI 是名词）；
2. 客户端使用GET、POST、PUT、DELETE 4个表示操作方式的动词对服务端资源进行操作：GET用来获取资源，POST用来新建资源（也可以用于更新资源），PUT用来更新资源，DELETE用来删除资源；
3. 资源的表现形式是XML或者**JSON**；
4. 客户端与服务端之间的交互在请求之间是无状态的，从客户端到服务端的每个请求都必须包含理解请求所必需的信息。

### 设计规范

**HTTP协议请求方式要求：**

REST 风格主张在项目设计、开发过程中，具体的操作符合**HTTP协议定义的请求方式的语义**。

| 操作     | 请求方式 |
| -------- | -------- |
| 查询操作 | GET      |
| 保存操作 | POST     |
| 删除操作 | DELETE   |
| 更新操作 | PUT      |

**URL路径风格要求：**

REST风格下每个资源都应该有一个唯一的标识符，例如一个 URI（统一资源标识符）或者一个 URL（统一资源定位符）。资源的标识符应该能明确地说明该资源的信息，同时也应该是可被理解和解释的！

使用URL+请求方式确定具体的动作，他也是一种标准的HTTP协议请求！

| 操作 | 传统风格                | REST 风格                                  |
| ---- | ----------------------- | ------------------------------------------ |
| 保存 | /CRUD/saveEmp           | URL 地址：/CRUD/emp&#xA;请求方式：POST     |
| 删除 | /CRUD/removeEmp?empId=2 | URL 地址：/CRUD/emp/2&#xA;请求方式：DELETE |
| 更新 | /CRUD/updateEmp         | URL 地址：/CRUD/emp&#xA;请求方式：PUT      |
| 查询 | /CRUD/editEmp?empId=2   | URL 地址：/CRUD/emp/2&#xA;请求方式：GET    |

**总结：**

根据接口的具体动作，选择具体的HTTP协议请求方式

路径设计从原来携带动标识，改成名词，对应资源的唯一标识即可！

### 好处

1. 含蓄，安全

   使用问号键值对的方式给服务器传递数据太明显，容易被人利用来对系统进行破坏。使用 REST 风格携带数据不再需要明显的暴露数据的名称。

2. 风格统一

   URL 地址整体格式统一，从前到后始终都使用斜杠划分各个单词，用简单一致的格式表达语义。

3. 无状态

   在调用一个接口（访问、操作资源）的时候，可以不用考虑上下文，不用考虑当前状态，极大的降低了系统设计的复杂度。

4. 严谨，规范

   严格按照 HTTP1.1 协议中定义的请求方式本身的语义进行操作。

5. 简洁，优雅

   过去做增删改查操作需要设计4个不同的URL，现在一个就够了。

   | 操作 | 传统风格                | REST 风格                                  |
   | ---- | ----------------------- | ------------------------------------------ |
   | 保存 | /CRUD/saveEmp           | URL 地址：/CRUD/emp&#xA;请求方式：POST     |
   | 删除 | /CRUD/removeEmp?empId=2 | URL 地址：/CRUD/emp/2&#xA;请求方式：DELETE |
   | 更新 | /CRUD/updateEmp         | URL 地址：/CRUD/emp&#xA;请求方式：PUT      |
   | 查询 | /CRUD/editEmp?empId=2   | URL 地址：/CRUD/emp/2&#xA;请求方式：GET    |

6. 丰富的语义

   通过 URL 地址就可以知道资源之间的关系。它能够把一句话中的很多单词用斜杠连起来，反过来说就是可以在 URL 地址中用一句话来充分表达语义。

   > [http://localhost:8080/shop](http://localhost:8080/shop "http://localhost:8080/shop") [http://localhost:8080/shop/product](http://localhost:8080/shop/product "http://localhost:8080/shop/product") [http://localhost:8080/shop/product/cellPhone](http://localhost:8080/shop/product/cellPhone "http://localhost:8080/shop/product/cellPhone") [http://localhost:8080/shop/product/cellPhone/iPhone](http://localhost:8080/shop/product/cellPhone/iPhone "http://localhost:8080/shop/product/cellPhone/iPhone")

## RESTFul风格实战

### 需求分析

- 数据结构： User {id 唯一标识,name 用户名,age 用户年龄}
- 功能分析
  - 用户数据分页展示功能（条件：page 页数 默认1，size 每页数量 默认 10）
  - 保存用户功能
  - 根据用户id查询用户详情功能
  - 根据用户id更新用户数据功能
  - 根据用户id删除用户数据功能
  - 多条件模糊查询用户功能（条件：keyword 模糊关键字，page 页数 默认1，size 每页数量 默认 10）

### 接口设计

**接口设计：**

| 功能     | 接口和请求方式   | 请求参数                        | 返回值       |
| -------- | ---------------- | ------------------------------- | ------------ |
| 分页查询 | GET  /user       | page=1\&size=10                 | { 响应数据 } |
| 用户添加 | POST /user       | { user 数据 }                   | {响应数据}   |
| 用户详情 | GET /user/1      | 路径参数                        | {响应数据}   |
| 用户更新 | PUT /user        | { user 更新数据}                | {响应数据}   |
| 用户删除 | DELETE /user/1   | 路径参数                        | {响应数据}   |
| 条件模糊 | GET /user/search | page=1\&size=10\&keywork=关键字 | {响应数据}   |

**问题讨论：**

为什么查询用户详情，就使用路径传递参数，多条件模糊查询，就使用请求参数传递？

误区：restful风格下，不是所有请求参数都是路径传递！可以使用其他方式传递！

在 RESTful API 的设计中，路径和请求参数和请求体都是用来向服务器传递信息的方式。

- 对于查询用户详情，使用路径传递参数是因为这是一个单一资源的查询，即查询一条用户记录。使用路径参数可以明确指定所请求的资源，便于服务器定位并返回对应的资源，也符合 RESTful 风格的要求。
- 而对于多条件模糊查询，使用请求参数传递参数是因为这是一个资源集合的查询，即查询多条用户记录。使用请求参数可以通过组合不同参数来限制查询结果，路径参数的组合和排列可能会很多，不如使用请求参数更加灵活和简洁。
    此外，还有一些通用的原则可以遵循：
- 路径参数应该用于指定资源的唯一标识或者 ID，而请求参数应该用于指定查询条件或者操作参数。
- 请求参数应该限制在 10 个以内，过多的请求参数可能导致接口难以维护和使用。
- 对于敏感信息，最好使用 POST 和请求体来传递参数。
