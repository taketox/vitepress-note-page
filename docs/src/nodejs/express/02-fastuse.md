# 快速开始

## 安装

安装 Express

```sh
npm install express
```

## 使用

### 创建web服务器

```javascript
// 1.导入 express
const express = require('express')
// 2.创建 web 服务器
const app = express()
// 3.调用 app.listen(端口号,启动成功后的回调函数),启动服务器
app.listen(80,()=>{
    console.log('express server running at http://127.0.0.1')
})
```

### 监听GET请求

通过 `app.get()` 方法，监听客户端的 GET 请求

```javascript
// 参数1:客户端请求的URL地址
// 参数2:请求对应的处理函数
//    req:请求对象(包含了与请求相关的属性和方法)
//    res:响应对象(包含了响应相关的属性和方法)
app.get('请求URL',function(req,res){/* 处理函数 */})
```

### 监听POST请求

通过 `app.post()` 方法，监听客户端的 POST 请求

```javascript
// 参数1:客户端请求的URL地址
// 参数2:请求对应的处理函数
//    req:请求对象(包含了与请求相关的属性和方法)
//    res:响应对象(包含了响应相关的属性和方法)
app.post('请求URL',function(req,res){/* 处理函数 */})
```

### 响应内容至客户端

通过 `res.send()` 方法，把处理好的内容，发送给客户端

```javascript
app.get('/user',(req,res)=>{
    // 向客户端发送 JSON 对象
    res.send({name:'fanfan', age:18 ,gender:'女'})
})

app.post('/user',(req,res)=>{
    // 向客户端发送文本内容
    res.send('请求成功')
})
```

### 获取请求中携带的参数

通过 `req.query` 对象，可以访问到客户端通过查询字符串的形式，发送到服务器的参数

```javascript
app.get('/',(req,res)=>{
    // req.query 默认是一个空对象
    // 客户端使用 ?name=zs&age=20 这种查询字符串形式，发送到服务器的参数
    // 可以通过 req.query 对象访问到,例如:
    // req.query.name req.query.age
    console.log(res.query)
})
```

### 获取路径中携带的参数

通过 `req.params` 对象，可以访问到 URL 中，通过:匹配到的动态参数

```javascript
// URL 地址中，可以通过：参数名的形式，匹配动态参数值
app.get('/user/:id',(req,res)=>{
    // req.params 默认是一个空对象
    // 里面存放着通过:动态匹配到的参数值
    console.log(req.params)
})
```

## 测试

使用浏览器访问，获取响应

```sh
http://127.0.0.1
```
