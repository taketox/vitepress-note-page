# vue-router

## 简介

Vue Router 是 Vue.js 官方推荐的路由管理库，专门用于构建**单页面应用程序 (SPA)**。它能够让开发者在不重新加载页面的情况下导航应用，同时支持**嵌套路由**、**动态路由**、**路由守卫**等功能。

## 单页面应用程序

**单页面应用程序 (Single Page Application, SPA)** 是一种**网页应用程序或网站架构**，其特点是整个应用仅在**单个 HTML 页面**中运行，通过**动态更新视图**来实现页面切换，而不需要重新加载整个页面。

1. **单个页面加载：** 应用只在初次访问时加载一次，之后通过异步请求更新内容。
2. **动态更新视图：** 页面切换是通过**前端路由**和**组件渲染**实现的，无需刷新页面。
3. **用户体验流畅：** 页面跳转速度快，类似桌面应用程序。
4. **前后端分离：** 前端通过 API 和后端通信，减少后端模板渲染压力。

## 路由的理解

**什么是路由?**

1. 一个路由就是一组映射关系`key - value`
2. `key` 为路径，`value` 可能是 `function` 或 `component`

**路由的分类：**

后端路由

1. 理解：`value` 是 `function`，用于处理客户端提交的请求
2. 工作过程：服务器接收到一个请求时, 根据**请求路径**找到匹配的**函数**来处理请求，返回响应数据

前端路由

1. 理解：`value` 是 `component`，用于展示页面内容
2. 工作过程：当浏览器的路径改变时，对应的组件就会显示

## 基本使用

**安装 Vue Router：**

```bash
npm install vue-router@3
```

**目录结构：**

创建一个简单的单页面应用，包含两个页面：`Home` 和 `About`。

```bash
src
├── main.js
├── App.vue
├── router
│   └── index.js
└── views
    ├── Home.vue
    └── About.vue
```

::: code-group

```javascript [router/index.js]
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/HomePage.vue';
import About from '../views/AboutPage.vue';

Vue.use(VueRouter);

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: About }
];

const router = new VueRouter({
    mode: 'history',  // 使用 HTML5 history 模式，去掉 # 号
    routes
});

export default router;
```

```vue [views/HomePage.vue]
<template>
<div>
    <h1>Home Page</h1>
    <p>Welcome to the Home Page!</p>
    </div>
</template>

<script>
    export default {
        name: 'HomePage'
    };
</script>
```

```vue [views/AboutPage.vue]
<template>
<div>
    <h1>About Page</h1>
    <p>This is the About Page!</p>
    </div>
</template>

<script>
    export default {
        name: 'AboutPage'
    };
</script>
```

```vue [App.vue]
<template>
<div>
    <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
    </nav>
    <router-view></router-view> <!-- 路由出口 -->
    </div>
</template>

<script>
    export default {
        name: 'App'
    };
</script>
```

```javascript [main.js]
import Vue from 'vue';
import App from './App.vue';
import router from './route/index.js';

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
```

:::

>路由组件通常存放在`pages`文件夹，一般组件通常存放在`components`文件夹
>
>通过切换，“隐藏”了的路由组件，默认是被销毁掉的，需要的时候再去挂载
>
>```javascript
>export default {
>    name:'XXX',
>    mounted() {
>      console.log('XXX挂载完毕',this);
>    },
>    beforeDestroy() {
>      console.log('XXX即将被销毁');
>    },
>    destroyed() {
>      console.log('XXX被销毁了');
>    },
>}
>```
>
>每个组件都有自己的`$route`属性，里面存储着自己的路由信息
>
>整个应用只有一个router，可以通过组件的`$router`属性获取到
>
>每个组件都带了`$router`和 `$route` ，不一样的是 `$route` 是每个组件特有的，`$router` 都是一样的。

## 嵌套（多级）路由

嵌套路由（多级路由）是指在父路由下配置子路由，从而实现**页面嵌套展示**，例如在后台管理系统中，左侧导航点击后在右侧显示对应的内容区域。

**嵌套路由的场景：**

1. **后台管理系统**：左侧导航 + 右侧内容区。
2. **用户中心**：个人信息、订单管理、账户设置等页面嵌套展示。
3. **电商系统**：商品列表和商品详情页面嵌套。

**目录结构：**

```bash
src
├── components
│   └── UserProfile.vue
├── views
│   ├── Dashboard.vue
│   ├── User.vue
│   └── UserSettings.vue
├── router
│   └── index.js
└── App.vue
```

::: code-group

```javascript [router/index.js]
import Vue from 'vue';
import VueRouter from 'vue-router';

import Dashboard from '@/views/Dashboard.vue';
import User from '@/views/User.vue';
import UserProfile from '@/components/UserProfile.vue';
import UserSettings from '@/views/UserSettings.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
    },
    {
        path: '/user',
        name: 'User',
        component: User,
        children: [
            {
                path: 'profile',
                name: 'UserProfile',
                component: UserProfile,
            },
            {
                path: 'settings',
                name: 'UserSettings',
                component: UserSettings,
            },
        ],
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
```

```vue [App.vue]
<template>
    <div id="app">
        <h1>嵌套路由示例</h1>
        <nav>
            <router-link to="/">Dashboard</router-link>
            <router-link to="/user/profile">用户资料</router-link>
            <router-link to="/user/settings">用户设置</router-link>
        </nav>
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'App',
    };
</script>

<style>
    nav a {
        margin: 0 10px;
    }
</style>
```

```vue [父组件 views/UserPage.vue]
<template>
    <div>
        <h2>用户中心</h2>
        <!-- 子路由出口 -->
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'UserPage',
    };
</script>
```

```vue [子1用户资料 components/UserProfile.vue]
<template>
    <div>
        <h3>用户资料</h3>
        <p>这里是用户资料页面。</p>
    </div>
</template>

<script>
    export default {
        name: 'UserProfile',
    };
</script>
```

```vue [子2用户设置 views/UserSettings.vue]
<template>
    <div>
        <h3>用户设置</h3>
        <p>这里是用户设置页面。</p>
    </div>
</template>

<script>
    export default {
        name: 'UserSettings',
    };
</script>
```

```vue [主页面 views/DashboardPage.vue]
<template>
<div>
    <h2>仪表盘</h2>
    <p>欢迎来到仪表盘！</p>
    </div>
</template>

<script>
    export default {
        name: 'DashboardPage',
    };
</script>
```

```javascript [main.js]
import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
```

:::

## 路由传参

在 Vue Router 中，我们通常有以下几种方式进行路由传参：

1. **路径参数 (Path Params)**
2. **查询参数 (Query Params)**
3. **命名视图传参 (Named Views)**
4. **编程式导航传参**
5. **props 传参**

### 路径参数

路径参数是最常见的传参方式，通常用于表示唯一标识，例如用户 ID、文章 ID 等。

**路由配置：**

```javascript
// router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import UserProfile from '@/views/UserProfile.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/user/:id',
        name: 'UserProfile',
        component: UserProfile,
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
```

**跳转方式：**

```javascript
<!-- 使用 router-link -->
<router-link :to="'/user/' + 123">查看用户</router-link>

<!-- 使用编程式导航 -->
<button @click="goToUser(456)">跳转到用户 456</button>

<script>
    export default {
    methods: {
        goToUser(id) {
            this.$router.push(`/user/${id}`);
        },
    },
};
</script>
```

**接收参数：**

```vue
<!-- UserProfile.vue -->
<template>
    <div>
        <h2>用户资料</h2>
        <p>用户ID: {{ $route.params.id }}</p>
    </div>
</template>
```

### 查询参数

查询参数通常用于可选参数或过滤条件，如分页和搜索。

**路由配置：**

无需特殊配置，直接跳转即可。

**跳转方式：**

```javascript
<!-- 使用 router-link -->
<router-link :to="{ path: '/user', query: { name: 'Tom', age: 25 } }">
    用户信息
</router-link>

<!-- 使用编程式导航 -->
<button @click="goToUser">跳转到用户信息</button>

<script>
    export default {
    methods: {
            goToUser() {
            this.$router.push({ path: '/user', query: { name: 'Alice', age: 30 } });
        },
    },
};
</script>
```

**接收参数：**

```vue
<!-- UserProfile.vue -->
<template>
    <div>
        <h2>用户资料</h2>
        <p>姓名: {{ $route.query.name }}</p>
        <p>年龄: {{ $route.query.age }}</p>
    </div>
</template>
```

### 命名视图传参

命名视图允许在同一路由中渲染多个视图，同时可以通过**路径参数或查询参数**传递数据。

**路由配置：**

```javascript
// router/index.js
{
    path: '/profile/:userId',
        components: {
            default: UserProfile,
            sidebar: UserSidebar,
        },
}
```

**使用命名视图：**

```vue
<router-link :to="{ name: 'UserProfile', params: { userId: 123 } }">
  查看用户
</router-link>
```

### 编程式导航传参

使用 `$router.push()`

```javascript
this.$router.push({ name: 'UserProfile', params: { id: 456 } });
```

使用 `$router.replace()`

类似于 `push()`，但不会添加历史记录：

```javascript
this.$router.replace({ name: 'UserProfile', params: { id: 789 } });
```

### 使用 props 传参（推荐）

通过路由配置中的 `props: true`，可以将路由参数作为组件的 `props` 传入。

**路由配置：**

```javascript
{
  path: '/user/:id',
  name: 'UserProfile',
  component: UserProfile,
  props: true,  // 启用 props 传参
}
```

**接收参数：**

```javascript
<!-- UserProfile.vue -->
<template>
    <div>
        <h2>用户ID: {{ id }}</h2>
    </div>
</template>

<script>
   export default {
      props: ['id'],
   };
</script>
```

## 命名路由

命名路由是指给路由配置一个名称，方便在代码中使用名称而不是路径进行导航。相比于硬编码路径，命名路由更具灵活性和可维护性。

**路由配置：**

在路由定义时使用 `name` 属性

```javascript
// router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
```

**使用命名路由进行导航：**

通过 `<router-link>`，在模板中直接使用命名路由

```vue
<template>
  <div>
    <h1>首页</h1>
    <router-link :to="{ name: 'about' }">关于我们</router-link>
  </div>
</template>
```

**通过编程式导航：**

```vue
<script>
export default {
  methods: {
    goToAbout() {
      this.$router.push({ name: 'about' });
    }
  }
}
</script>

<template>
  <button @click="goToAbout">前往关于页</button>
</template>
```

## 编程式路由导航

在 Vue.js 中，除了使用 `<router-link>` 进行导航，还可以通过 **编程式路由导航**，即使用 JavaScript 方法在方法或生命周期钩子中进行页面跳转。

编程式导航使用 `$router` 对象来跳转：

- **`this.$router.push()`**：跳转到指定页面
- **`this.$router.replace()`**：跳转到指定页面（不会保存历史记录）
- **`this.$router.go()`**：在历史记录中前进或后退

### 使用 `push()` 方法

**跳转到指定路径：**

```javascript
this.$router.push('/about');
```

**使用对象进行跳转：**

推荐使用对象方式，避免硬编码路径：

```javascript
this.$router.push({ name: 'about' });
```

**传递参数：**

路径参数 (params)

```javascript
this.$router.push({ name: 'user', params: { id: 123 } });
```

> 💡 注意：**params** 必须和 **name** 一起使用，不能和 **path** 搭配。

查询参数 (query)

```javascript
this.$router.push({ name: 'search', query: { keyword: 'Vue' } });
```

跳转后的 URL：

```bash
/search?keyword=Vue
```

### 使用 `replace()` 方法

与 `push()` 类似，但不会在历史记录中留下跳转记录。适用于**防止用户点击返回按钮回到上一个页面**的场景。

```javascript
this.$router.replace({ name: 'home' });
```

### 使用 `go()` 方法

`go()` 方法允许在浏览历史中前进或后退：

- 正数：前进
- 负数：后退
- 零：刷新当前页面

```javascript
// 后退一步
this.$router.go(-1);

// 前进一步
this.$router.go(1);

// 刷新当前页面
this.$router.go(0);
```

### 使用 `back()` 和 `forward()`

Vue Router 还提供了便捷方法来操作历史记录：

- 返回上一页：

  ```javascript
  this.$router.back();
  ```

- 前进到下一页：

  ```javascript
  this.$router.forward();
  ```

### 完整示例

路由配置

```javascript
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  { path: '/user/:id', name: 'user', component: User },
  { path: '/search', name: 'search', component: Search }
];
```

跳转按钮组件

```vue
<template>
<div>
    <button @click="goHome">首页</button>
    <button @click="goAbout">关于我们</button>
    <button @click="goUser(101)">用户 101</button>
    <button @click="searchKeyword('Vue')">搜索 Vue</button>
    <button @click="goBack">返回</button>
    </div>
</template>

<script>
    export default {
        methods: {
            goHome() {
                this.$router.push({ name: 'home' });
            },
            goAbout() {
                this.$router.push({ name: 'about' });
            },
            goUser(id) {
                this.$router.push({ name: 'user', params: { id } });
            },
            searchKeyword(keyword) {
                this.$router.push({ name: 'search', query: { keyword } });
            },
            goBack() {
                this.$router.back();
            }
        }
    }
</script>
```

### 错误处理

在进行路由跳转时，可能会遇到相同路由跳转的报错

```bash
NavigationDuplicated: Avoided redundant navigation to current location.
```

可以通过在 `push()` 和 `replace()` 方法后链式调用 `catch()` 来避免报错

```javascript
this.$router.push({ name: 'home' }).catch(err => {});
```

### 总结

| 特性             | 编程式导航 (`push/replace`)        | 路由链接 (`<router-link>`) |
| ---------------- | ---------------------------------- | -------------------------- |
| 适用场景         | 事件触发、方法内跳转               | 模板中使用                 |
| 传递参数         | 支持 `params` 和 `query`           | 支持 `params` 和 `query`   |
| 返回和前进       | 使用 `go()`、`back()`、`forward()` | 不支持                     |
| 防止重复导航报错 | 需要手动处理                       | 自动防抖处理               |

## 缓存路由组件

**Vue 缓存路由组件 (keep-alive)：**

在单页面应用程序 (SPA) 中，路由组件默认在切换时会被销毁和重新创建。如果想在切换路由时**缓存组件状态**，可以使用 Vue 提供的 **`<keep-alive>`** 组件。

**使用场景：**

- 需要在**路由切换后保留组件状态**（如输入框内容、滚动位置）。
- 数据较多且重新加载性能较差的页面。
- 表单填写的中途切换页面，避免数据丢失。

**基本使用：**

将路由视图包裹在 `<keep-alive>` 中：

```vue
<template>
  <div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

```

**配置缓存：**

**在路由中设置需要缓存的组件**： 使用组件的 `name` 选项来控制缓存。

组件定义

```javascript
<template>
    <div>
        <h2>用户页面 - ID: {{ id }}</h2>
        <input v-model="username" placeholder="输入用户名">
    </div>
</template>

<script>
    export default {
    name: "UserPage",
    data() {
        return {
            id: this.$route.params.id,
            username: ''
        };
    }
}
    </script>
```

**路由配置：**

确保路由组件的 `name` 属性与缓存规则一致

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import UserPage from '@/views/UserPage.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/user/:id', name: 'user', component: UserPage },
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
```

### 缓存控制

**全局缓存：**

在 `<keep-alive>` 标签上直接包裹所有路由视图

```vue
<template>
  <keep-alive>
    <router-view></router-view>
  </keep-alive>
</template>
```

**指定缓存组件：**

使用 `include` 和 `exclude` 控制要缓存的组件

- **`include`**：只缓存指定名称的组件
- **`exclude`**：排除指定名称的组件

```vue
<template>
  <keep-alive include="UserPage,Home">
    <router-view></router-view>
  </keep-alive>
</template>
```

**动态缓存控制：**

在某些情况下，我们可能希望**动态控制**是否缓存组件。可以使用 **`:include`** 或 **`:exclude`** 配合计算属性。

```vue
<template>
  <keep-alive :include="cachedComponents">
    <router-view></router-view>
  </keep-alive>

  <button @click="toggleCache">切换缓存</button>
</template>

<script>
export default {
  data() {
    return {
      cachedComponents: 'UserPage'
    };
  },
  methods: {
    toggleCache() {
      this.cachedComponents = this.cachedComponents === 'UserPage' ? '' : 'UserPage';
    }
  }
}
</script>
```

**缓存生命周期：**

**`<keep-alive>`** 为被缓存的组件添加了两个特有的生命周期钩子：

- **`activated()`**：组件被激活时调用
- **`deactivated()`**：组件被停用时调用

```vue
<template>
  <div>
    <h2>用户信息</h2>
  </div>
</template>

<script>
export default {
  name: "UserPage",
  activated() {
    console.log("UserPage 已激活");
  },
  deactivated() {
    console.log("UserPage 已停用");
  }
}
</script>
```

### 清除缓存

动态更新 include

```vue
<button @click="clearCache">清除缓存</button>

<script>
export default {
  data() {
    return {
      cachedComponents: 'UserPage'
    };
  },
  methods: {
    clearCache() {
      this.cachedComponents = ''; // 清除缓存
      this.$nextTick(() => {
        this.cachedComponents = 'UserPage'; // 恢复缓存设置
      });
    }
  }
}
</script>
```

使用 key 强制刷新

使用 `:key` 动态更新使组件重新创建

```vue
<router-view :key="$route.fullPath"></router-view>
```

## 路由守卫

路由守卫是 Vue Router 提供的一种机制，用于控制路由的访问权限，进行权限验证、页面跳转前后的处理等操作。Vue Router 提供了不同的路由守卫类型，分为 **全局守卫**、**路由独享守卫** 和 **组件内守卫**。

**全局守卫：**

全局守卫会在每次路由切换时执行，可以在任何位置进行路由控制。

- **beforeEach**：在路由切换之前执行
- **beforeResolve**：在解析异步路由组件后，路由确认之前调用
- **afterEach**：在路由切换之后执行

**路由独享守卫：**

每个路由配置都有独享的守卫方法，可以在路由配置中定义。

- **beforeEnter**：进入路由之前的守卫

**组件内守卫：**

每个组件可以定义自身的路由守卫。

- **beforeRouteEnter**：组件进入前执行
- **beforeRouteUpdate**：当路由变化时（如动态路由），组件已经加载，更新之前执行
- **beforeRouteLeave**：离开组件时执行

### 全局守卫

#### beforeEach

在 Vue Router 配置中使用 `beforeEach` 方法来进行全局路由守卫配置，通常用于权限验证等功能。

设置全局前置守卫

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
];

const router = new VueRouter({
  routes
});

// 设置全局前置守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = false; // 模拟是否已登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果该路由需要身份验证
    if (!isAuthenticated) {
      next('/login'); // 跳转到登录页
    } else {
      next(); // 允许访问路由
    }
  } else {
    next(); // 允许访问路由
  }
});

export default router;
```

#### afterEach

`afterEach` 路由守卫在每次路由切换后执行，通常用于记录页面访问日志、统计等。

```javascript
router.afterEach((to, from) => {
  console.log(`导航到：${to.path}`);
});
```

### 路由独享守卫

#### beforeEnter

可以在路由配置中使用 `beforeEnter` 来为某个路由单独配置守卫。

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      const isAuthenticated = false;
      if (!isAuthenticated) {
        next('/login'); // 跳转到登录页
      } else {
        next(); // 允许访问
      }
    }
  }
];
```

### 组件内守卫

#### beforeRouteEnter

`beforeRouteEnter` 会在组件创建之前调用，通常用于进行异步数据加载等操作。

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    console.log('进入该组件前');
    next();
  }
};
```

#### beforeRouteUpdate

当路由发生变化时（例如动态路由匹配），`beforeRouteUpdate` 会被触发，适合用来处理路由变化时的页面更新。

```javascript
export default {
  beforeRouteUpdate(to, from, next) {
    console.log('路由变化，准备更新组件');
    next();
  }
};
```

#### beforeRouteLeave

`beforeRouteLeave` 会在离开当前路由时调用，适合用于防止用户离开当前页面时丢失数据等情况。

```javascript
export default {
  beforeRouteLeave(to, from, next) {
    const answer = window.confirm('你确定要离开吗？未保存的数据将丢失。');
    if (answer) {
      next(); // 允许离开
    } else {
      next(false); // 阻止导航
    }
  }
};
```

### 守卫中的 `next` 函数

路由守卫的 `next` 函数用于决定路由的去向：

- `next()`：继续执行，允许路由切换
- `next('/path')`：跳转到指定路径
- `next(false)`：取消当前的导航
- `next(error)`：跳转到错误页面（用于异常处理）

### 路由守卫的执行顺序

1. **全局守卫** (`beforeEach`) 会在路由切换时最先执行。
2. 如果定义了 **路由独享守卫**（`beforeEnter`），它会在进入目标路由之前执行。
3. **组件内守卫**（如 `beforeRouteEnter`、`beforeRouteUpdate`）会在组件加载之前执行。
4. 最后，如果没有阻止导航，**全局后置守卫** (`afterEach`) 会在路由切换后执行。

## 两种工作模式

Vue Router 提供了两种主要的路由模式来决定如何在浏览器中处理 URL 路径。它们分别是：

1. **Hash 模式** (`hash`)
2. **History 模式** (`history`)

### Hash 模式

Hash 模式通过浏览器的 URL 中的 hash (`#`) 部分来模拟一个完整的 URL 路径。这种模式不需要服务端支持，可以在任何静态文件服务器上工作。hash 后面的内容不会发送到服务器，而是由浏览器控制，改变 `#` 后面的部分时，浏览器会根据路由规则进行页面渲染。

**URL 示例：**

```bash
http://example.com/#/home
http://example.com/#/about
```

>浏览器地址栏中的 `#` 后面的内容决定了当前的路由路径。
>
>比如 `/home` 或 `/about`，是由 Vue Router 管理的前端路由，而不是由服务器控制的 URL 路径。

**优点：**

- **不依赖服务器配置**，可以直接使用任何静态资源进行开发，不需要进行 URL 重写或服务器配置。
- **兼容性好**，几乎所有的浏览器都支持。
- **简单易用**，无需后端支持即可工作。

**缺点：**

- **URL 中包含 `#`**，这可能影响美观，并且对 SEO 不太友好，因为 hash 部分不会被搜索引擎索引。

**配置方式：**

```javascript
const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ],
  mode: 'hash'  // 默认值是 'hash'，可以省略此项
});
```

### History 模式

History 模式使用浏览器的 **History API**（如 `history.pushState` 和 `history.replaceState`）来实现路径的变化，而不依赖于 URL 中的 `#` 符号。这意味着 URL 看起来就像传统的 URL，没有 `#` 符号，且路由路径是完全由 Vue Router 管理的。

**URL 示例：**

```bash
http://example.com/home
http://example.com/about
```

> 在 History 模式下，URL 中的路径是真实的路径，不含 `#` 符号。

**优点：**

- **美观的 URL**，没有 `#` 符号，更符合传统的网页 URL。
- 更加 **SEO 友好**，搜索引擎可以正确抓取页面内容。

**缺点：**

- **需要服务器支持**，如果用户刷新页面或者直接访问某个 URL，服务器必须能处理该请求并返回相应的页面。如果服务器没有配置相应的重定向规则，可能会导致 404 错误。
- **浏览器兼容性**，较老版本的浏览器可能不完全支持 History API，尽管现在大部分现代浏览器都支持。

**配置方式：**

```javascript
const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ],
  mode: 'history'  // 启用 History 模式
});
```

**服务器配置：**

为了支持 History 模式，服务器需要进行一些配置，确保所有路由都能指向应用的入口文件（通常是 `index.html`）。例如，常见的**Nginx** 服务器需要配置重定向规则。

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
