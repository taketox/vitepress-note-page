# Ajax

## Vue 中的 ajax

在 Vue.js 开发中，Ajax 请求是非常常见的操作。通过 Ajax，我们可以与服务器进行数据交互，实现动态更新页面。常用的 Ajax 库有两种：**Axios** 和 **vue-resource**。

## axios

Axios 是一个基于 Promise 的 HTTP 库，可以用于浏览器和 Node.js。它具有以下特点：

- **支持 Promise**：支持异步操作，链式调用简单优雅。
- **支持请求和响应拦截**：可以在请求发送前或响应接收后进行处理。
- **自动转换 JSON 数据**：自动将响应数据转换为 JSON。
- **支持跨域请求和携带 Cookie**：便于与后端交互。
- **支持取消请求**：方便中断长时间的请求。
- **防止 XSRF 攻击**：支持客户端跨站请求伪造保护。

### 安装

```bash
npm install axios
# 或
yarn add axios
```

### 基本用法

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';

const app = createApp(App);

// 全局配置 axios
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 10000;

app.config.globalProperties.$axios = axios;
app.mount('#app');
```

### 示例

```javascript
// GET 请求
this.$axios.get('/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// POST 请求
this.$axios.post('/users', { name: 'John', age: 30 })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
```

### Axios 拦截器

拦截器可以在请求或响应被处理前拦截它们

```javascript
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = 'Bearer token';
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  return response.data;
}, error => {
  console.error('请求失败：', error);
  return Promise.reject(error);
});
```

## vue-resource

`vue-resource` 是 Vue 1.x 和 2.x 时代常用的 Ajax 请求库，但由于官方停止维护，逐渐被 Axios 取代。

###  安装

```bash
npm install vue-resource
```

### 基本用法

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import VueResource from 'vue-resource';

const app = createApp(App);
app.use(VueResource);
app.mount('#app');
```

### 示例

```javascript
// GET 请求
this.$http.get('/users').then(response => {
  console.log(response.body);
}, error => {
  console.error(error);
});

// POST 请求
this.$http.post('/users', { name: 'John', age: 30 }).then(response => {
  console.log(response.body);
}, error => {
  console.error(error);
});
```

## slot插槽

插槽（**Slot**）是 Vue 组件中的一种内容分发机制，可以让父组件向子组件传递内容，实现在组件内部自定义布局。插槽的使用方式非常灵活，主要包括**默认插槽**、**具名插槽**和**作用域插槽**。

1. **默认插槽：** 简单内容传递，适用于单一内容区域。
2. **具名插槽：** 多区域内容填充，适用于复杂布局组件。
3. **作用域插槽：** 允许子组件向父组件传递数据，实现灵活渲染。

**注意：**

1. **作用域插槽的数据来源：** 数据必须在子组件中定义并通过 `slot` 传递给父组件。
2. **具名插槽的默认内容：** 如果父组件未传入具名插槽，子组件会显示具名插槽的默认内容。
3. **动态插槽名称：** 使用方括号 `v-slot:[dynamicSlot]` 语法可以动态控制插槽名称。
4. **多个作用域插槽：** 子组件中可以定义多个带有数据的插槽，父组件中需要相应处理。

### 默认插槽

默认插槽是最简单的插槽形式，当子组件中只有一个插槽时，可以直接使用 `<slot>` 标签。

示例

::: code-group

```vue [App.vue]
<template>
  <Card>
    <p>这是一段插槽内容。</p>
  </Card>
</template>

<script setup>
import Card from './components/BaseCard.vue';
</script>
```

```vue [BaseCard.vue]
<template>
  <div class="card">
    <slot>默认内容</slot>
  </div>
</template>

<script setup>
</script>

<style>
.card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

:::

### 具名插槽

具名插槽用于在一个组件中使用多个插槽，使用 `name` 属性进行区分。

示例

::: code-group

```vue [App.vue]
<template>
  <Card>
    <template v-slot:header>
      <h3>标题区域</h3>
    </template>
    <p>主体内容区域</p>
    <template v-slot:footer>
      <button>确认</button>
    </template>
  </Card>
</template>

<script setup>
import Card from './components/BaseCard.vue';
</script>
```

```vue [BaseCard.vue]
<template>
  <div class="card">
    <header>
      <slot name="header">默认标题</slot>
    </header>
    <main>
      <slot>默认主体内容</slot>
    </main>
    <footer>
      <slot name="footer">默认按钮</slot>
    </footer>
  </div>
</template>

<script setup>
</script>

<style>
.card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px;
}
header, main, footer {
  margin-bottom: 10px;
}
</style>
```

:::

### 作用域插槽

作用域插槽用于在子组件中传递数据给父组件，便于父组件自定义内容渲染。

示例

::: code-group

```vue [App.vue]
<template>
  <UserList v-slot:default="slotProps">
    <p>用户名：{{ slotProps.name }}</p>
  </UserList>
</template>

<script setup>
import UserList from './components/UserList.vue';
</script>
```

```vue [UserList.vue]
<template>
  <div class="user-list">
    <slot :name="userName"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const userName = ref('小明');
</script>

<style>
.user-list {
  padding: 10px;
  border: 1px solid #aaa;
}
</style>
```

### 插槽的动态名称

在具名插槽中，还可以使用动态名称：

示例

::: code-group

```vue [App.vue]
<template>
  <Card>
    <template v-slot:[dynamicSlot]>
      <p>动态插槽内容</p>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue';
import Card from './components/BaseCard.vue';

const dynamicSlot = ref('footer');
</script>
```

```vue [BaseCard.vue]
<template>
  <div class="card">
    <slot name="footer">默认底部内容</slot>
  </div>
</template>
```

:::
