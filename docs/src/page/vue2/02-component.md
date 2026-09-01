# 组件化编程

## 模块和组件

**模块：**

1. 理解：向外提供特定功能的 js 程序，一般就是一个js 文件。
2. 为什么：js 文件很多很复杂。
3. 作用：复用js，简化js 的编写，提高js 运行效率。

**组件：**

1. 理解：用来实现局部（特定）功能效果的代码集合（`html/css/js/image……`）
2. 为什么：一个界面的功能很复杂
3. 作用：复用编码, 简化项目编码，提高运行效率。

**模块化：**

当应用中的js 都以模块来编写的，那这个应用就是一个模块化的应用。

**组件化：**

当应用中的功能都是多组件的方式来编写的，那这个应用就是一个组件化的应用。

## 非单文件组件

**Vue中使用组件的三大步骤：**

1. 定义组件(创建组件)
2. 注册组件
3. 使用组件(写组件标签)

**如何定义一个组件?**

 使用 `Vue.extend(options)` 创建，其中 `options` 和 `new Vue(options)` 时传入的那个 `options` 几乎一样，但也有点区别，区别如下

- 为什么el不要写，因为最终所有的组件都要经过一个vm的管理，由vm中的el决定服务哪个容器。
- 为什么data必须写成函数，因为避免组件被复用时，数据存在引用关系。

>备注：使用 `template` 可以配置组件结构

使用 `Vue.extend()` 方法来创建**组件构造器**，并通过它来创建组件实例

组件构造器创建的组件实例具有与 Vue 实例类似的选项，如 `data`、`methods`、`computed` 等

```vue
const MyComponent = Vue.extend({
  // 组件选项
  data() {
    return {
      message: 'Hello, Vue!'
    };
  },
  template: '<div>{{ message }}</div>'
});
```

**如何注册组件?**

1. 局部注册：靠 `new Vue` 的时候传入 `components` 选项

   在 Vue 实例的 `components` 选项中注册组件。这样注册的组件只能在注册它的 Vue 实例的作用域内使用

   ```vue
   const vm = new Vue({
     el: '#app',
     components: {
       MyComponent
     }
   });
   ```

2. 全局注册：靠 `Vue.component('组件名'组件)`

   通过 `Vue.component()` 方法全局注册组件。这样注册的组件可以在整个 Vue 应用中使用

   ```vue
   Vue.component('MyComponent', MyComponent);
   ```

**编写组件标签：**

在 Vue 模板中，通过标签的形式使用组件

```vue
<div id="app">
  <my-component></my-component>
</div>
```

**注意点：**

1. 组件名

   1. 由一个单词组成

      - 第一种写法：首字母小写，如 `school`

      - 第二种写法：首字母大写，如 `School`

   2. 由多个单词组成

      - 第一种写法：`kebab-case` 命名，如 `my-school`

      - 第二种写法：`camelCase`【大驼峰】命名，如 `MySchool`，此时需要Vue脚手架的支持

   3. 组件名尽可能回避HTML中已有的元素名称，例如:h2、H2都不行

      - h2：`[Vue warn]: Do not use built-in or reserved HTML elements as component id: h2`

      - H2：被转换成 h2，但是效果不呈现，也不报错

   4. 可以使用 `name` 配置项指定组件在开发者工具中呈现的名字，如果创建组件时未指定 `name` 配置项，Vue开发者工具中显示的组件名就是注册组件时用的组件名

2. 组件标签

   1. 第一种写法:`<school></school>`

   2. 第二种写法:`<school/>`【自闭合】（需要Vue脚手架支持，虽然单个的自闭合标签不会报错）

      > 不用使用脚手架时，`<school/>` 会导致后续组件不能渲染

3. 组件的简写形式

   1. `const school= Vue.extend({})`可以简写成`const school= {}`，如下所示，二者是等效的。

      - 使用`Vue.extend({})`定义组件

        ```vue
        const school = Vue.extend({
            template:`
                <div>
                    <h2>公司名称：{{name}}</h2>
                    <h2>公司地址：{{address}}</h2>
                </div>
            `,
            data(){
                return {
                    name:'VUE',
                    address:'广东广州'
                }
            }
        })
        ```

      - 直接将组件写成一个对象

        ```vue
        const school ={
            template:
                <div>
                    <h2>公司名称：{{name}}</h2>
                    <h2>公司地址：{{address}}</h2>
                </div>
            `,
            data(){
                return {
                    name:'VUE',
                    address:'广东广州'
                }
            }
        }
        ```

4. 组件的嵌套

   1. 组件的定义和注册应该按照它们在模板中使用的顺序进行
      - 如果一个组件在另一个组件的模板中作为子组件使用，那么子组件的定义应该在外部组件的定义之前**【子组件，先定义】**
   2. 嵌套组件的使用是在父组件的模板中

通常情况下，为了更有效地管理这些组件，会创建一个 `App` 组件作为项目的**根组件**，然后将其他组件作为子组件包含在其中。

```vue
<div id="root">
        {{msg}}
        <app-component>
            <hello></hello>
            <student-component></student-component>
        </app-component>
    </div>
    <script>
        // 成绩组件
        const GradeComponent = Vue.extend({
            name: 'gradeComponent',
            template: `
                    <div>
                        <h2>科目名称：{{name}}</h2>
                        <h2>考试成绩：{{score}}</h2>
                    </div>
                `,
            data() {
                return {
                    name: '数据结构',
                    score: 88
                }
            }
        })

        // 学生组件
        const StudentComponent = Vue.extend({
            name: 'studentComponent',
            template: `
                    <div>
                        <h2>学生名称：{{name}}</h2>
                        <h2>学生年龄：{{age}}</h2>
                        <grade-component></grade-component>
                    </div>
                `,
            data() {
                return {
                    name: '小黄',
                    age: 18
                }
            },
            components: {
                GradeComponent
            }
        })

        // 学校组件
        const SchoolComponent = Vue.extend({
            name: 'schoolComponent',
            template: `
                    <div>
                        <h2>学校名称：{{name}}</h2>
                        <h2>学校地址：{{address}}</h2>
                        <student-component></student-component>
                    </div>
                `,
            data() {
                return {
                    name: 'VUE',
                    address: '广东广州'
                }
            },
            components: {
                StudentComponent
            }
        })

        // 问候组件
        const HelloComponent = Vue.extend({
            name: 'helloComponent',
            template: `
                    <h1>Hello, Vue!</h1>
                `
        })

        // App 组件
        const AppComponent = Vue.extend({
            name: 'App',
            template:
                `
                    <div>
                        <h1>学校信息</h1>
                        <hello-component></hello-component>
                        <school-component></school-component>
                    </div>
                `,
            components: {
                SchoolComponent,
                HelloComponent
            }
        })

        const vm = new Vue({
            el: '#root',
            data: {
                msg: 'hello~'
            },
            components: {
                AppComponent
            }
        })
    </script>
```

## VueComponent

```vue
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
    <title>Document</title>
</head>
<body>
    <div id="root">
        <!-- {{msg}} -->
        <School></School>
        <hello></hello>
    </div>
    <script>
        // 学校组件
        const School = Vue.extend({
            template: `
                <div>
                    <h2>学校名称：{{name}}</h2>
                    <h2>学校地址：{{address}}</h2>
                    <button @click="show">点我提示学校名称</button>
                </div>
            `,
            data() {
                return {
                    name: 'vue',
                    address: '广东广州'
                }
            },
            methods: {
                show(){
                    console.log(this);
                    // VueComponent:[object Object]
                    alert(this.name)
                }
            },
        })

        // 问候组件
        const hello = Vue.extend({
            template: `
                <div>
                    <h2>{{text}}</h2>
                </div>
            `,
            data() {
                return {
                    text:'你好'
                }
            },
        })

        console.log('@',School);
        console.log('@',hello);
        /* 组件的本质是一个构造函数
            @ ƒ VueComponent(options) {
                this._init(options);
            }
         */
        console.log(School===hello);//false
        
        
        const vm = new Vue({
            el: '#root',
            data: {
                // msg: 'hello~'
            },
            components: {
                School,
                hello
            }
        })
        console.log(vm);
        /*
            $children: Array(2): 
            0: VueComponent {_uid: 1, _isVue: true, __v_skip: true, _scope: EffectScope, $options: {…}, …}
            1: VueComponent {_uid: 2, _isVue: true, __v_skip: true, _scope: EffectScope, $options: {…}, …}
            length: 2
            [[Prototype]]: Array(0) 
         */
    </script>
</body>
</html>
```

1. school组件本质是一个名为`Vuecomponent`的构造函数，且不是程序员定义的，是 `Vue.extend` 生成的。

2. 我们只需要写 `<school/>` 或 `<school></school>`，Vue解析时会帮我们创建 `school` 组件的实例对象，即 `Vue` 帮我们执行的 `:new VueComponent(options)`

   - 通过搜索找到`Vue.extend`的源码：

   - `Vue.extend` 是一个静态方法，用于创建一个新的组件构造器。每次调用 `Vue.extend` 都会返回一个新的 `VueComponent` 函数。

   - 这意味着每次创建组件时，都是基于原始组件构造器的全新实例，它们具有不同的引用。

     ```vue
     Vue.extend = function (extendOptions) {
               ……
               var Sub = function VueComponent(options) {
                   //console.log('VueComponent被调用了')
                   this._init(options);
               };
               ……
               return Sub;
           };
       }
     ```

     >在 `Vue.extend` 函数内部，首先定义了一个名为 `VueComponent` 的函数，该函数是继承自原始组件构造器的。然后，它创建了一个新的原型链，将原始组件构造器的原型链作为基础，并添加了自己的原型链。这样，新的组件构造器就继承了原始组件构造器的属性和方法，并且可以通过 `Sub.prototype = Object.create(Super.prototype);` 访问到这些属性和方法。
     >
     >最后，`Vue.extend` 函数返回了新的组件构造器 `Sub`。每次调用 `Vue.extend` 都会创建一个新的组件构造器实例，因此返回的 `Sub` 函数都是全新的。

3. 每次调用 `Vue.extend`，返回的都是一个全新的`VueComponent`

4. 关于this指向
   1. 组件配置中
      - data函数、methods中的函数、watch中的函数、computed中的函数
      - 它们的this均是【Vuecomponent实例对象】
   2. new Vue()配置中
      - data函数、methods中的函数、watch中的函数、computed中的函数
      - 它们的this均是【vue实例对象vm】

5. `VueComponent`的实例对象，以后简称`vc`(也可称之为:组件实例对象)

   `Vue`的实例对象，以后简称`vm`

## 一个重要的内置关系

原型基础知识

```vue
<script type="text/javascript">
    // 定义一个构造函数Demo
    function Demo(){
        this.a = 1
        this.b = 2
    }
        
    // 创建一个Demo的实例对象
    const d = new Demo()

    // 只要是函数，身上就有一个prototype属性，显式原型属性
    consle.log(Demo.prototype)

    // 构造函数缔造出来的实例对象，身上有一个__proto__属性，隐式原型属性
    console.log(d.__proto__)

    // 显式原型属性和隐式原型属性指向了同一个原型对象
    console.log(Demo.prototype === d.__proto__)

    // 程序员通过显式原型属性操作原型对象，追加了一个x属性，值为99
    Demo.prototype.x = 99

    // 可以通过隐式原型对象拿到刚刚追加的属性
    console.log(d.__proto__.x)

    // 这样也可以拿到，d身上没有x，默认就会从__proto__找x【自身没有，就按照隐式原型链查找】
    console.log(d.x)
</script>
```

- 查看Vue构造函数身上的属性和方法 `console.dir(Vue)`
- Vue原型对象的所有属性和方法，Vue的实例对象都能用
- 只要是函数，身上就有`prototype`属性
- 只要是对象，身上就有`__proto__`属性
- 实例的隐式原型属性永远指向自己缔造者【实例的构造函数】的原型对象

![An image](/img/javascript/vue/002.png)

- 一个重要的内置关系：`VueComponent.prototype.__ proto__ === Vue.prototype`
  Vue让VueComponent原型对象的隐式原型属性指向了Vue的原型对象，也就是说，VueComponent原型对象的原型对象就是Vue的原型对象
- 为什么要有这个关系：让组件实例对象（vc）可以访问到 Vue原型上的属性、方法。

## vue 文件的组成

1. 一个标准组件的构成：html + css + js
2. 相对应的，Vue提供了三个标签，`<template></template>`、`<style></style>`、`<script></script>`，分别负责编写组件的结构、组件的样式、组件交互相关的代码（数据、方法等等）

| 标准组件构成    | Vue 对应标签 | 说明                                                         |
| --------------- | ------------ | ------------------------------------------------------------ |
| HTML 结构       | `<template>` | 用于编写组件的结构，即组件的模板                             |
| CSS 样式        | `<style>`    | 用于编写组件的样式，可以包含 `<style>` 标签内的样式代码或外链的 CSS 文件 |
| JavaScript 逻辑 | `<script>`   | 用于编写组件交互相关的代码，如数据、方法、生命周期钩子等     |

### 模板页面

```vue
<template>
    页面模板
</template>
```

>要求`<template></template>`中必须要有一个根元素

### JS 模块对象

```vue
<script> 
    export default {
        data() {
            return {}
        }, 
        methods: {},
        computed: {}, 
        components: {}
    }
</script>
```

#### ES6模块化暴露方式

**默认暴露：**

默认暴露是 Vue 中最常用的暴露方式，通常用于导出一个模块或组件。一个模块只能有一个默认暴露。

语法：`export`，常用于暴露多个对象

```javascript
// 暴露
// ComponentA.vue
export default {
  name: 'ComponentA',
  data() {
    return {
      message: 'Hello from ComponentA'
    };
  }
};

// 引入
import ComponentA from './ComponentA.vue';
```

**命名暴露：**

命名暴露允许你从一个模块中导出多个变量、函数或组件。每个导出的内容都需要有名称。

```javascript
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// 引入
import { add, subtract } from './utils.js';
```

**统一暴露：**

在 Vue 中，**统一暴露** 是一种将多个模块或组件通过 `export {}` 语法一次性导出的方式。这种方式可以让你在一个文件中定义多个组件或模块，然后通过一个统一的入口文件将它们导出，方便在其他地方使用。

```vue
// 暴露
// ComponentA.vue
<template>
  <div>
    <h1>Component A</h1>
  </div>
</template>

<script>
export default {
  name: 'ComponentA'
}
</script>

// ComponentB.vue
<template>
  <div>
    <h1>Component B</h1>
  </div>
</template>

<script>
export default {
  name: 'ComponentB'
}
</script>

// main.js 统一暴露文件
import ComponentA from './ComponentA.vue';
import ComponentB from './ComponentB.vue';

export {
  ComponentA,
  ComponentB
};

// 引入
import { ComponentA, ComponentB } from './components/main';
```

>- name属性最好与文件名保持一致，如果不写，默认组件名为注册时指定的名字
>- 入口文件 `main.js` 在不同的脚手架中命名可能不同，`main/index/app.js`

### 样式

```css
<style>
    样式定义
</style>
```

### 完整示例

::: code-group

```vue [School.vue]
<template>
    <!-- 组件的结构 -->
    <div class="demo">
        <h2>学校名称：{{name}}</h2>
        <h2>学校地址：{{address}}</h2>
        <button @click="show">点我提示学校名称</button>
    </div>
</template>

<script>
// 组件交互相关的代码（数据，方法等）
    // 1. 分别暴露 
    // export const school=Vue.extend({
    // const school=Vue.extend({
    //     data() {
    //         return {
    //             name: 'vue',
    //             address: '广东广州'
    //         }
    //     },
    //     methods: {
    //         show(){
    //             console.log(this)
    //             alert(this.name)
    //         }
    //     },
    // })
    // 2. 统一暴露
    // export {school}
    // 3. 默认暴露（暴露的只有一个）加在定义前面也行
    // export default school
    
    // 最简写法
    export default {
        name:'School',//与文件名相同
        data() {
            return {
                name: 'vue',
                address: '广东广州'
            }
        },
        methods: {
            show(){
                console.log(this)
                alert(this.name)
            }
        },
    }
</script>

<style>
    /* 组件的样式 */
    .demo {
        background-color: pink;
    }
</style>
```

```vue [Student.vue]
<template>
    <!-- 组件的结构 -->
    <div class="student">
        <h2>学生名称：{{studentName}}</h2>
        <h2>学生年龄：{{studentAge}}</h2>
        <button @click="show">点我提示学生名称</button>
    </div>
</template>

<script>
    export default {
        name: 'Student',
        data() {
            return {
                studentName: '小黄',
                studentAge: 18
            }
        },
        methods: {
            show(){
                console.log(this)
                alert(this.studentName)
            }
        },
    }
</script>
<!-- 没有样式可以直接删除该标签 -->
<!-- <style>
    /* 组件的样式 */
</style> -->
```

```vue [App.vue]
<template>
  <div>
    <School></School>
    <Student></Student>
  </div>
</template>

<script>
import School from './School.vue';
import Student from './Student.vue';
    export default {
        name:'App',
        components:{
            School,
            Student
        }
    }
</script>
```

```javascript [main.js]
import App from "./App.vue"

new Vue({
    el:'#root',
    template:`<App></App>`,
    components:{
        App
    }
})
```

```html [index.html]
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>练习一下单文件组件的语法</title>
</head>
<body>
    <!-- 容器 -->
    <div id="#root"></div>
        <!-- 注意书写顺序 -->
    <script src="./App.vue"></script>
    <script src="./main.js"></script>
</body>
</html>
```

:::

>直接运行是会报错，浏览器不能直接支持ES6的模块化语法

**解决方法：**

1. 使用 Webpack
   - 简介：Webpack 是一个现代 JavaScript 应用程序的静态模块打包器（module bundler）。当 Webpack 处理应用程序时，它会递归地构建一个依赖关系图（dependency graph），其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle 文件
   - 优点：Webpack 非常灵活，允许开发者通过配置 Loader 和 Plugin 来定制打包过程，支持各种构建场景
   - 缺点：Webpack 的配置相对复杂，需要开发者具备一定的 Node.js 和 JavaScript 知识
2. 使用 Vue 官方提供的脚手架
   - 简介：Vue 官方提供了一个名为 vue-cli 的脚手架工具，它使用 Webpack 构建了一个开箱即用的开发环境和工作流
   - 优点：Vue 脚手架提供了丰富的默认配置，可以快速上手，适合初学者。同时，它也支持高级配置，允许开发者根据需要进行定制
   - 缺点：相比手动配置 Webpack，Vue 脚手架的定制能力可能不如直接使用 Webpack 灵活

## Vue 脚手架

Vue 脚手架（Vue CLI）是一个官方提供的用于快速搭建 Vue.js 项目的命令行工具。它可以帮助开发者快速生成一个基于 Vue.js 的项目结构，并集成了现代化的前端开发工具链，如 Webpack、Babel、ESLint 等。Vue CLI 的目标是让开发者能够专注于编写业务代码，而不需要花费大量时间在项目配置上。

官网：[Home | Vue CLI](https://cli.vuejs.org/zh/)

**主要特点：**

1. **快速初始化项目**
    通过简单的命令即可生成一个完整的 Vue.js 项目结构，包括路由、状态管理、单元测试等常用功能。
2. **插件系统**
    Vue CLI 提供了丰富的插件，可以轻松集成 TypeScript、PWA、单元测试、E2E 测试等功能。
3. **图形化界面**
    Vue CLI 提供了一个图形化界面（Vue UI），可以通过可视化方式管理项目、安装插件、运行任务等。
4. **现代化工具链**
    默认集成了 Webpack、Babel、ESLint、PostCSS 等工具，支持最新的 JavaScript 和 CSS 特性。
5. **可配置性**
    虽然 Vue CLI 提供了默认配置，但开发者可以通过配置文件（如 `vue.config.js`）自定义构建和开发环境的行为。
6. **开发服务器**
    内置了开发服务器，支持热重载（Hot Module Replacement, HMR），开发体验非常流畅。

**安装 Vue CLI：**

```bash
npm install -g @vue/cli
# 或者使用 yarn
yarn global add @vue/cli

# 检测是否安装成功
vue --version

# 下载缓慢请设置镜像
npm config set registry http://registry.npmmirror.com

# 创建项目
vue create xxxx

# 启动
npm run serve
```

### 模板项目的结构

```bash
my-project/
├── node_modules/          # 项目依赖的第三方模块
├── public/                # 静态资源文件夹，不会被 Webpack 处理
│   ├── favicon.ico        # 网站图标
│   └── index.html         # 项目入口 HTML 文件
├── src/                   # 项目源代码目录
│   ├── assets/            # 静态资源文件夹（图片、字体等），会被 Webpack 处理
│   ├── components/        # 可复用的 Vue 组件
│   ├── views/             # 页面级组件（通常与路由相关）
│   ├── App.vue            # 根组件
│   ├── main.js            # 项目入口文件
│   └── router/            # 路由配置（如果选择了 Vue Router）
├── .gitignore             # Git 忽略文件配置
├── babel.config.js        # Babel 配置文件
├── package.json           # 项目依赖和脚本配置
├── README.md              # 项目说明文档
└── vue.config.js          # Vue CLI 配置文件（可选）
```

**`index.html`说明：**

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <!-- 针对IE浏览器的一个特殊配置，含义是让IE浏览器以最高的渲染级别渲染页面 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- 开启移动端的理想视口 -->
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <!-- 配置页签图标 -->
    <!-- <%= BASE_URL %>是基于 -->
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <!-- 配置网页标题 -->
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <!-- 当浏览器不支持js时noscript中的元素就会被渲染 -->
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    
    <!-- 容器 -->
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```

**`vue.config.js`说明：**

[配置参考 | Vue CLI](https://cli.vuejs.org/zh/config/#vue-config-js)

```javascript
// Commonjs 的暴露
// node.js 使用的 commonjs的暴露 不能用ES6
module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: 'src/index/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    subpage: 'src/subpage/main.js'
  }
}
```

### ref

被用来给元素或子组件注册引用信息（id的替代者）

应用在html标签上获取的是真实DOM元素，应用在组件标签上是组件实例对象（vc）

使用方式：

1. 打标识：`<h1 ref="xxx">.....</h1>`或 `<School ref="xxx"></School>`
2. 获取：`this.$refs.xxx`

```vue
<template>
<div id="app">
    <h1 v-text="msg" ref="title"></h1>
    <button @click="showDom()">点我输出上面的DOM元素</button>
    <!-- 脚手架可以使用自闭合样式 -->
    <Student></Student>
    <hr>
    <Student ref="stu"/>
    </div>
</template>

<script>
    // 引入组件
    import Student from './components/Student.vue';

    export default {
        name: 'App',
        data(){
            return {
                msg:'欢迎学习vue'
            }
        },
        // 注册组件
        components: {
            Student
        },
        methods:{
            showDom(){
                console.log(this);
                console.log(this.$refs);//title:h1 + Object【真实的DOM元素】
                // 给谁添加ref属性，vc就收集哪个元素
                console.log(this.$refs.title);//<h1>欢迎学习vue</h1>
                alert(this.$refs.title.innerHTML)
                // =========================================================
                // 注意：给组件添加ref属性，得到Vuecomponent实例
                console.log(this.$refs.stu);
                console.log(this.$refs.stu._data);
                console.log(this.$refs.stu._data.studentName);//小黄
                console.log(this.$refs.stu._data.studentAge);//18
                // =========================================================
                console.log(document.querySelector('.student'))
                /* 跑到组件的根节点，找出对应的完整组件结构
        <div class="student" id="stu">
          <h2>学生名称：小黄</h2>
          <h2>学生年龄：18</h2>
          <button>点我提示学生名称</button>
    </div> 
       */
            }
        }
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
```

### props

让组件接收外部传过来的数据

1. 传递数据：`<Demo name="xxx"/>`

2. 接收数据：

   1. 第一种方式（只接收）：`props:['name']`

   2. 第二种方式（限制类型）：`props:{name:String}`

   3. 第三种方式（限制类型、限制必要性、指定默认值）：

      ```vue
      props:{
           name:{
               type:String, //类型
               required:true, //必要性
               default:'小黄' //默认值
           }
      }
      ```

>**props是只读的**，Vue底层会监测你对props的修改，如果进行了修改，就会发出警告，若业务需求确实需要修改，那么请**复制**props的内容到data中一份，然后去**修改**data中的数据。

示例：

::: code-group

```vue [Student.vue]
<template>
<!-- 组件的结构 -->
<div class="student">
    <h1>{{ msg }}</h1>
    <h2>学生名称：{{studentName}}</h2>
    <!-- <h2>学生年龄：{{studentAge}}</h2> -->
    <h2>学生年龄：{{MyAge}}</h2>
    <!-- <h2>学生明年年龄：{{+studentAge+1}}</h2> -->
    <!-- <h2>学生明年年龄：{{studentAge+1}}</h2> -->
    <h2>学生明年年龄：{{MyAge+1}}</h2>
    <button @click="show">点我提示学生名称</button>
    <!-- 无法直接修改studentAge，会报错 -->
    <button @click="updateAge">点我修改学生年龄</button>
    </div>
</template>

<script>
    export default {
        name: 'Student',
        data() {
            return {
                msg:'我是一个正在学vue的学生',
                // studentName: '小黄',
                // studentAge: 18

                // 优先级：props传来的>内部设置
                MyAge:this.studentAge
            }
        },
        // 接受的数据要加上''
        props:['studentName','studentAge'],//1. 简单接收
        // 2. 接收的同时对数据进行类型限制
        // props:{
        //     studentName:String,
        //     studentAge:Number
        // },
        // 3. 完整写法  进行类型限制+默认值的指定+必要性的限制
        // props:{
        //     studentName:{
        //         typeof:String,//类型
        //         required:true //必要
        //     },
        //     studentAge:{
        //         typeof:Number,
        //         default:999//不是必要值，如果没传就给默认
        //     }
        // },
        methods: {
            show(){
                console.log(this)
                alert(this.studentName)
            },
            updateAge(){
                console.log('点击');
                this.MyAge++
            }
        },
    }
</script>
```

```vue [App.vue]
<template>
<div id="app">
    <!-- <Student studentName="废废" studentAge="20"/> -->
    <!-- <Student studentName="小黄" studentAge="18"/> -->
    <!-- 不加引号传递字符串 加上引号变成属性，传递表达式 -->
    <Student studentName="笨笨" :studentAge=17 />
    <!-- <Student studentName="小刘鸭" /> -->
    </div>
</template>

<script>
    // 引入组件
    import Student from './components/Student.vue';

    export default {
        name: 'App',
        data(){
            return {
                msg:'欢迎学习vue'
            }
        },
        // 注册组件
        components: {
            Student
        },
    }
</script>
```

:::

### mixin

1. 功能：可以把多个组件共用的配置提取成一个混入对象

2. 使用方式：

   - 第一步：定义混合

     ```json
     {
         data(){....},
         methods:{....}
     }
     ```

   - 第二步：使用混入

     - 全局混入：`Vue.mixin(xxx)`
     - 局部混入：`mixins:['xxx']`

示例

mixin.js文件 （提取点击事件 展示name属性）

```javascript
//分别暴露
export const mixin={
    methods: {
        show(){
            alert(this.name)
        },
    },
    mounted(){
        console.log('你好');//调用多次
    }
}
export const hunhe={
    data(){
        return {
            x:100,
            y:200
        }
    }
}
// 相当于公共的方法，提高复用

// 在各个组件中（局部）
//导入(可以多个)
import {mixin,hunhe} from '../mixin'
……
//使用(可以多个)，与name,data,methods等同级
mixins:[mixin,hunhe]

// 在main.js中（全局）
import {mixin,hunhe} from '@/mixin'
Vue.mixin(mixin)
Vue.mixin(hunhe)
```

```vue
<template>
<!-- 组件的结构 -->
<div class="student">
    <h1>{{ msg }}</h1>
    <h2>学生名称：{{ name }}</h2>
    <h2>学生年龄：{{ age }}</h2>
    <button @click="show">点我提示学生姓名</button>
    </div>
</template>

<script>
    import {mixin,hunhe} from '@/mixin'
    export default {
        name: "Student",
        data() {
            return {
                msg: "我是一个正在学vue的学生",
                name: "小黄",
                age: 18,
                x:888
                //   1. 与混合冲突，以组件本身为主
            }
        },
        // methods: {
        //     show(){
        //         console.log(this)
        //         alert(this.name)
        //     },
        // },
        mixins:[mixin,hunhe],
        //   // 特：生命周期钩子不存在冲突，两者都要
        mounted(){// 输出在后
            console.log('你好a!');
        }
    };
</script>
```

>1. 混入对象可以包含 `data`、`methods`、`computed`、`watch`、`lifeCycle` 等选项。
>2. 如果有冲突，组件的选项会**覆盖**混入的选项【**以组件优先**】（绝大情况下）。
>3. 特殊：混入中的**生命周期钩子**与组件中的生命周期钩子**不会冲突**，它们**都会被调用**。

### plugin

用于增强Vue，包含install方法的一个对象，install的第一个参数是Vue，第二个以后的参数是插件使用者传递的数据。

```vue
对象.install = function (Vue, options) {
    // 1. 添加全局过滤器
    Vue.filter(....)

    // 2. 添加全局指令
    Vue.directive(....)

    // 3. 配置全局混入(合)
    Vue.mixin(....)

    // 4. 添加实例方法
    Vue.prototype.$myMethod = function () {...}
    Vue.prototype.$myProperty = xxxx
}

// 使用插件
Vue.use()
```

示例

::: code-group

```javascript [plugin.js]
// 插件是个对象，但要包括install函数
export default {
    install(Vue,x,y,z){
        console.log(x,y,z)
        //全局过滤器
        Vue.filter('mySlice',function(value){
            return value.slice(0,4)
        })

        //定义全局指令
        Vue.directive('fbind',{
            //指令与元素成功绑定时（一上来）
            bind(element,binding){
                element.value = binding.value
            },
            //指令所在元素被插入页面时
            inserted(element){
                element.focus()
            },
            //指令所在的模板被重新解析时
            update(element,binding){
                element.value = binding.value
            }
        })

        //定义混入
        Vue.mixin({
            data() {
                return {
                    x:100,
                    y:200
                }
            },
        })

        //给Vue原型上添加一个方法（vm和vc就都能用了）
        Vue.prototype.hello = ()=>{
            alert('你好啊')
        }
    }
}
```

```javascript [mian.js]
// 引入并应用插件
import plugin from './plugin'
Vue.use(plugin,1,2,3)//允许传参
```

:::

### scoped 样式

当多个组件的样式有冲突时，以最后引入的组件的样式为最终样式（**后来者居上，样式覆盖**）

脚手架当中编写样式的技巧：

1. 作用：让样式在局部生效【样式仅对当前组件生效】，防止因App组件中通过import汇总组件时样式冲突【比如不同组件中有相同类名等】
2. 写法：`<style scoped>`
3. 工作原理：
   1. scoped 属性为每个组件生成一个唯一的随机值，并将这个值作为组件的属性添加到每个标签上
   2. 这个随机值通常是一个十六进制字符串，例如 data-v-f3f3eg9
   3. 这个属性的作用是作为 CSS 选择器的限定符，以防止样式冲突，例如，`h1 { color: red; }` 会被替换为 `[data-v-f3f3eg9] h1 { color: red; }`

>如果在App组件中使用scoped，同时在App各个组件的模板中也使用了组件标签（School以及Student），那么随机属性除了会加在App组件的普通标签上之外，还会加在组件的根标签上，组件内部的标签是不会被加上随机属性的（蓝色绿色为组件内部标签），组件内部标签会加上与他们组件根节点相同的属性

### webStorage

`localStorage` 和`sessionStorage`统称为 `webStorage`

#### localStorage

通过浏览器如何查看浏览器本地存储

每个网站都有自己的浏览器本地存储，可以通过`浏览器开发者工具-应用-存储-本地存储空间`查看，不同浏览器查看的位置可能稍有不同，数据是以**键值对的形式**存储的。

`localStorage` 用于在客户端存储持久化的数据

```vue
<body>
    <h2>LocalStorage</h2>
    <button class="btn1">点击保存数据</button>
    <button class="btn2">点击读取数据</button>
    <button class="btn3">点击删除数据</button>
    <button class="btn4">点击删除所有数据</button>
    <script>
        let p={name:'小黄',age:18}
        const btn1=document.querySelector('.btn1')
        btn1.addEventListener('click',function(){
            // 键值对都是字符串（如果不是会被强转）
            window.localStorage.setItem('msg','hello!')
            window.localStorage.setItem('msg',123)//键同名会被覆盖
            window.localStorage.setItem('person',p)//[object Object]无效存储
            window.localStorage.setItem('person2',JSON.stringify(p))//  {"name":"小黄","age":18}有效存储
        })

        const btn2=document.querySelector('.btn2')
        btn2.addEventListener('click',function(){
            const msg=window.localStorage.getItem('msg')//123
            console.log(msg);

            const person2=window.localStorage.getItem('person2')
            console.log(person2);

        })

        const btn3=document.querySelector('.btn3')
        btn3.addEventListener('click',function(){
            window.localStorage.removeItem('person')
            console.log(window.localStorage.getItem('person'));//null
        })

        const btn4=document.querySelector('.btn4')
        btn4.addEventListener('click',function(){
            window.localStorage.clear()
        })
    </script>
</body>
```

#### sessionStorage

- 对于浏览器来说，会话完毕了就表示浏览器关闭了
- API完全同localStorage，浏览器只要关闭，数据就没了

```vue
<body>
    <h2>sessionStorage</h2>
    <button class="btn1">点击保存数据</button>
    <button class="btn2">点击读取数据</button>
    <button class="btn3">点击删除数据</button>
    <button class="btn4">点击删除所有数据</button>
    <script>
        let p = { name: '小黄', age: 18 };
        const btn1 = document.querySelector('.btn1');
        btn1.addEventListener('click', function() {
            window.sessionStorage.setItem('msg','hello!')
            window.sessionStorage.setItem('msg',123)//键同名会被覆盖
            window.sessionStorage.setItem('person',p)//[object Object]无效存储
            window.sessionStorage.setItem('person2',JSON.stringify(p))//    {"name":"小黄","age":18}有效存储
        });

        const btn2 = document.querySelector('.btn2');
        btn2.addEventListener('click', function() {
            const msg = window.sessionStorage.getItem('msg'); // 123
            console.log(msg);

            const person2 = window.sessionStorage.getItem('person2');
            console.log(person2);

        });

        const btn3 = document.querySelector('.btn3');
        btn3.addEventListener('click', function() {
            window.sessionStorage.removeItem('person');
            console.log(window.sessionStorage.getItem('person')); // null
        });

        const btn4 = document.querySelector('.btn4');
        btn4.addEventListener('click', function() {
            window.sessionStorage.clear();
        });
    </script>
</body>
```

#### 总结

1. 存储内容大小一般支持5MB左右（不同浏览器可能还不一样）
2. 浏览器端通过 `Window.sessionStorage` 和 `Window.localStorage` 属性来实现本地存储机制。
3. 相关API：

   - `xxxxxStorage.setItem('key', 'value');`
     该方法接受一个键和值作为参数，会把键值对添加到存储中，如果键名存在，则更新其对应的值。
   - `xxxxxStorage.getItem('person');`
   - 该方法接受一个键名作为参数，返回键名对应的值。
   - `xxxxxStorage.removeItem('key');`
   - 该方法接受一个键名作为参数，并把该键名从存储中删除。
   - `xxxxxStorage.clear()`
   - 该方法会清空存储中的所有数据。
4. `SessionStorage` 存储的内容会随着浏览器窗口关闭而消失。
5. `LocalStorage` 存储的内容，需要手动清除才会消失。
6. `xxxxxStorage.getItem(xxx)` 如果 `xxx` 对应的 `value` 获取不到，那么 `getItem` 的返回值是 `null` 。
7. `JSON.parse(null)` 的结果依然是null。

## 自定义事件

一种组件间通信的方式，适用于：子组件 ===> 父组件

使用场景：A是父组件，B是子组件，B想给A传数据，那么就要在A中给B绑定自定义事件（事件的回调在A中）。

1. 绑定自定义事件：

   1. 第一种方式，在父组件中：`<Demo @tt="test"/>` 或 `<Demo v-on:tt="test"/>`

   2. 第二种方式，在父组件中：

      ```VUE
      <Demo ref="demo"/>
      ......
      mounted(){
         this.$refs.xxx.$on('tt',this.test)
      }
      ```

   3. 若想让自定义事件只能触发一次，可以使用`once`修饰符，或`$once`方法。

2. 触发自定义事件：`this.$emit('test',数据)`

3. 解绑自定义事件：`this.$off('test')`

4. 组件上也可以绑定原生DOM事件，需要使用 `native` 修饰符。

> 通过 `this.$refs.xxx.$on('test',回调)` 绑定自定义事件时，回调要么配置在methods中，要么用箭头函数，否则this指向会出问题！

## 全局事件总线

Vue 原型对象上包含事件处理的方法

1. `$on(eventName, listener)`：绑定自定义事件监听
2. `$emit(eventName, data)`：分发自定义事件
3. `$off(eventName)`：解绑自定义事件监听
4. `$once(eventName, listener)`：绑定事件监听, 但只能处理一次

所有组件实例对象的原型对象的原型对象就是 Vue 的原型对象

1. 所有组件对象都能看到 Vue 原型对象上的属性和方法
2. `Vue.prototype.$bus = new Vue()`，所有的组件对象都能看到 `$bus` 这个属性对象

全局事件总线

1. 包含事件处理相关方法的对象(只有一个)
2. 所有的组件都可以得到

```javascript
// 指定事件总线对象
new Vue({
    beforeCreate () { // 尽量早的执行挂载全局事件总线对象的操作
        Vue.prototype.$globalEventBus = this
    },
}).$mount('#root')

// 绑定事件
this.$globalEventBus.$on('deleteTodo', this.deleteTodo)

// 分发事件
this.$globalEventBus.$emit('deleteTodo', this.index)

// 解绑事件
this.$globalEventBus.$off('deleteTodo')
```

## 消息订阅与发布

**包含以下操作：**

- 订阅消息，对应绑定事件监听
- 发布消息，分发事件
- 取消消息订阅，解绑事件监听

> 需要引入一个消息订阅与发布的第三方实现库: **PubSubJS**

**PubSubJS：**

```javascript
// 安装
npm install -S pubsub-js

// 引入
import PubSub from 'pubsub-js' 

// 订阅
PubSub.subscribe('msgName', functon(msgName, data){ })

// 发布消息, 触发订阅的回调函数调用
PubSub.publish('msgName', data)

// 取消消息的订阅
PubSub.unsubscribe(token)
```

## 过渡与动画

### vue动画的理解

1. 操作 `css` 的 `trasition` 或 `animation`
2. `vue` 会给目标元素 **添加/移除** 特定的class
3. 过渡的相关类名：

   1. `xxx-enter-active`：指定显示的 transition
   2. `xxx-leave-active`：指定隐藏的 transition
   3. `xxx-enter/xxx-leave-to`：指定隐藏时的样式

### 基本过渡动画的编码

1. 在目标元素外包裹 `<transition name="xxx">`
2. 定义class 样式
   1. 指定过渡样式：transition
   2. 指定隐藏时的样式：opacity/其它
