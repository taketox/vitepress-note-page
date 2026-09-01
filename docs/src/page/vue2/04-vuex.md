# vuex

## 理解Vuex

专门在Vue 中实现**集中式**状态（数据）管理的一个**Vue 插件**，对vue 应用中多个组件的**共享**状态进行集中式的管理（读/写），也是一种组件间通信的方式，且适用于任意组件间通信。

[vuejs/vuex: 🗃️ Centralized State Management for Vue.js.](https://github.com/vuejs/vuex)

![An image](/img/javascript/vue/003.png)

![An image](/img/javascript/vue/004.png)

![An image](/img/javascript/vue/005.png)

## 核心概念

**State（状态）：**

- 存储应用的所有状态。
- 组件通过 `this.$store.state` 来访问。

**Getters（获取器）：**

- 相当于 Vue 的计算属性，用来获取 `state` 中的数据。
- 可以进行数据计算或过滤。
- 示例：`getters: { getterName: state => state.someData }`

**Mutations（突变）：**

- 唯一允许修改 Vuex 中状态的地方。
- 必须是同步的操作。
- 使用 `commit` 方法来调用 mutation。
- 示例：`mutations: { increment(state) { state.count++ } }`

**Actions（动作）：**

- 用于处理异步操作或者复杂的逻辑。
- 可以调用多个 mutations，通常用来处理 API 请求。
- 使用 `dispatch` 方法来触发 actions。
- 示例：`actions: { asyncAction({ commit }) { await apiCall(); commit('increment'); } }`

**Modules（模块）：**

- Vuex 允许将 store 分割成多个模块，每个模块都有自己的 state、mutations、actions 和 getters。
- 适用于大型应用，避免 store 变得过于庞大。

## 基本使用

安装

```bash
npm install vuex@3
```

>在2022年2月7日，vue3成为了默认版本。vuex也更新到了4版本。如果执行 `npm i vuex`，默认安装的是 `vuex4`，只能在 `vue3` 中使用，在 `vue2` 中报错。

创建 Store

在 `src/store/index.js` 中创建 Vuex store

```javascript
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment(state) {
            state.count++;
        }
    },
    actions: {
        incrementAsync({ commit }) {
            setTimeout(() => {
                commit('increment');
            }, 1000);
        }
    },
    getters: {
        getCount(state) {
            return state.count;
        }
    }
});
```

在 Vue 中使用 Store

```javascript
import Vue from 'vue';
import App from './App.vue';
import store from './store';

new Vue({
    render: h => h(App),
    store
}).$mount('#app');
```

在组件中访问状态和调用 `mutations/actions`

```vue
<template>
<div>
    <p>{{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="incrementAsync">Increment Async</button>
    </div>
</template>

<script>
    export default {
        computed: {
            count() {
                return this.$store.getters.getCount;
            }
        },
        methods: {
            increment() {
                this.$store.commit('increment');
            },
            incrementAsync() {
                this.$store.dispatch('incrementAsync');
            }
        }
    };
</script>
```

## 多组件共享数据

多组件共享数据是指在不同组件之间能够方便地访问和更新同一份状态。Vuex 提供了集中式状态管理，可以轻松实现数据共享。

**全局状态管理（使用 Vuex）：**

- 通过在 Vuex 中定义全局状态，任何组件都可以访问和修改它。
- **优点：** 数据统一管理、方便追踪、持久性强。
- **缺点：** 过度使用会导致复杂性增加。

示例

::: code-group

```javascript [store/index.js]
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        user: { name: 'Tom', age: 25 }
    },
    mutations: {
        updateUser(state, payload) {
            state.user = payload;
        }
    },
    getters: {
        userName: state => state.user.name
    }
});
```

```vue [组件 A：get]
<template>
    <div>User Name: {{ userName }}</div>
</template>

<script>
    export default {
        computed: {
            userName() {
                return this.$store.getters.userName;
            }
        }
    }
</script>
```

```vue [组件 B：update]
<template>
    <button @click="changeName">Change Name</button>
</template>

<script>
    export default {
        methods: {
            changeName() {
                this.$store.commit('updateUser', { name: 'Jerry', age: 30 });
            }
        }
    }
</script>
```

:::

## Vuex 模块化管理

当项目变得庞大时，单一的 Vuex store 文件将变得难以维护。模块化是解决这一问题的有效方法。通过将状态、mutations、actions 和 getters 分成模块，可以更好地组织代码。

**模块化结构：**

```bash
src
├── store
│   ├── index.js        # 主入口
│   ├── user.js         # 用户模块
│   └── product.js      # 商品模块
└── components
    ├── User.vue
    └── Product.vue
```

::: code-group

```javascript [index.js]
import Vue from 'vue';
import Vuex from 'vuex';
import user from './user';
import product from './product';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        user,
        product
    }
});
```

```javascript [user.js]
export default {
    namespaced: true, // 开启命名空间
    state: {
        name: 'Alice',
        age: 25
    },
    mutations: {
        setName(state, newName) {
            state.name = newName;
        }
    },
    actions: {
        updateName({ commit }, newName) {
            commit('setName', newName);
        }
    },
    getters: {
        userInfo: state => `Name: ${state.name}, Age: ${state.age}`
    }
};
```

```javascript [product.js]
export default {
    namespaced: true, // 开启命名空间
    state: {
        products: ['Laptop', 'Phone', 'Tablet']
    },
    mutations: {
        addProduct(state, product) {
            state.products.push(product);
        }
    },
    actions: {
        asyncAddProduct({ commit }, product) {
            setTimeout(() => {
                commit('addProduct', product);
            }, 1000);
        }
    },
    getters: {
        productList: state => state.products.join(', ')
    }
};
```

:::

**在组件中使用模块化状态：**

::: code-group

```vue [User 组件]
<template>
<div>
    <p>{{ userInfo }}</p>
    <button @click="updateUserName">Update Name</button>
    </div>
</template>

<script>
    export default {
        computed: {
            userInfo() {
                return this.$store.getters['user/userInfo'];
            }
        },
        methods: {
            updateUserName() {
                this.$store.dispatch('user/updateName', 'Bob');
            }
        }
    }
</script>
```

```vue [Product 组件]
<template>
<div>
    <p>{{ products }}</p>
    <button @click="addNewProduct">Add Product</button>
    </div>
</template>

<script>
    export default {
        computed: {
            products() {
                return this.$store.getters['product/productList'];
            }
        },
        methods: {
            addNewProduct() {
                this.$store.dispatch('product/asyncAddProduct', 'Smartwatch');
            }
        }
    }
</script>
```

:::
