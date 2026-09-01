# Vue

## Vue 简介

**官网：**

- 英文官网：[Vue.js - The Progressive JavaScript Framework | Vue.js](https://vuejs.org/)
- 中文官网: [Vue.js - 渐进式 JavaScript 框架 | Vue.js](https://cn.vuejs.org/)

**介绍与描述：**

一套用于**构建用户界面**的**渐进式**Javascript **框架**

>【渐进式的理解】：Vue可以自底向上逐层的应用
>
>- 简单应用：只需一个轻量小巧的核心库
>- 复杂应用：可以引入各式各样的Vue插件

**Vue 的特点：**

1. 采用**组件化**模式，提高代码复用率、且让代码更好维护
2. **声明式**编码，让编码人员无需直接操作DOM，提高开发效率

## 初识 Vue

**安装：**

1. 直接下载并用 `<script>` 标签引入，`Vue` 会被注册为一个全局变量

   1. 开发版本：[v2.cn.vuejs.org/js/vue.js](https://v2.cn.vuejs.org/js/vue.js)（包含完整的警告和调试模式）
   2. 生产版本：[v2.cn.vuejs.org/js/vue.min.js](https://v2.cn.vuejs.org/js/vue.min.js)（生产环境的压缩版 可以减少文件大小并提高加载速度）

2. 使用CDN方法

   ```html
   <!-- 开发环境 -->
   <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
   <!-- 生产环境 -->
   <!-- 特定版本： -->
   <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16"></script>
   <!-- 压缩版本： -->
   <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js"></script>
   
   <!-- ES Modules -->
   <script type="module">
     import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.esm.browser.js'
   </script>
   ```

3. NPM方法

   在用 Vue 构建大型应用时推荐使用 NPM 安装。

   ```bash
   # 最新稳定版
   $ npm install vue@^2
   ```

**Vue Devtools:**

这是一个浏览器扩展，可以帮助你调试Vue.js应用程序，它提供了组件的层次结构、状态追踪、性能分析等功能

可以在**GitHub**上找到并安装或者在**浏览器扩展管理**中找到下载

[GitHub - vuejs/devtools: ⚙️ Browser devtools extension for debugging Vue.js applications.](https://github.com/vuejs/devtools#vue-devtools)

引用**开发版本**的Vue的CDN文件的时候，**控制台**总会**提示**

```tex
You are running Vue in development mode.
Make sure to turn on production mode when deploying for production.
See more tips at https://vuejs.org/guide/deployment.html

翻译为：您正在开发模式下运行Vue。在为生产部署时，请确保启用生产模式。更多提示请访问：https://vuejs.org/guide/deployment.html

添加一行代码控制输出
Vue.config.productionTip =false;
```

**第一个Vue程序：**

```vue
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- 2. 引入Vue -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
    </head>
    <body>
        <!-- 1. 准备一个容器 -->
        <div id="app">
            <!-- 原先写死的固定数据 -->
            <!-- hello Vue! -->
            <!-- 4. 插入数据  -->
            {{message}}
        </div>
        <script>
            // 3. 创建Vue实例
            const app=new Vue({
                el: '#app',//el用于指定当前Vue实例为哪个容器服务，值通常为css选择器字符
                data: {//data中用于存储数据，数据供el所指定的容器去使用，通常写成对象类型
                    message: 'hello Vue!',
                }
            })
        </script>
        </div>
    </body>
</html>
```

> 1. 容器与vue实例保持**一一对应的**关系
> 2. root 容器里面的代码仍然**符合html规范**，只不过多了一些**特殊的vue语法**，里面的代码被称为【**vue模板**】
> 3. `{ { XXX } }` 里面为 **js表达式**（与js代码区分），它可以自动读取到data中的所有属性
> 4. 一旦data中的数据发生改变，那么模板中用到该数据的地方也会自动更新

**el 与 data 的两种写法：**

**对象式**写法

```vue
<script>
    // 创建一个实例
    const vm = new Vue({
        // el的第一种写法
        el: "#root",
        data: {
            name: "XXX"
        }
    })

    // 在控制台中输出vm
    console.log(vm)

    // 1.使用$mount指定实例要服务的容器
    vm.$mount("#root")
    // 2.两秒钟后再对容器进行挂载，更加灵活
    setTimeout(()=>{
        vm.$mount('#root')
    },1000)
</script>
```

**函数式**写法

```vue
<div id="root">
    <h1>Hello, {{ name }}</h1>
    </div>

<script>
    // 创建Vue实例
    new Vue({
        // el的第一种写法
        el: "#root",

        // data的第一种写法：对象式
        //data: {
        //    name :"XXX"
        //}

        // data的第二种写法：函数式
        data() {
            return {
                name: "XXX"
            }
        }
    })
</script>
```

>- 在函数式的写法中，**一定要有 return 返回值**，在 return 中再去定义需要的属性
>- 使用函数式的时候，一定要用**普通函数**定义，**不能使用箭头函数**去定义，否则会**引发 this 指向的问题**

## 模板语法

html 中包含了一些JS 语法代码，语法分为两种，分别为：

1. **插值**语法（双大括号表达式）
2. **指令**语法（以v-开头）

```vue
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Vue 模板语法案例</title>
        <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
    </head>
    <body>
        <div id="app">
            <!-- 绑定文本内容 -->
            <p>{{ message }}</p>
            <!-- 绑定属性 -->
            <a v-bind:href="url">点击我</a>
            <!-- 绑定事件监听器 -->
            <button v-on:click="count += 1">点击次数: {{ count }}</button>
            <!-- 条件渲染 -->
            <p v-if="show">这是一个显示的段落</p>
            <p v-else>这是一个隐藏的段落</p>
            <!-- 列表渲染 -->
            <ul>
                <li v-for="item in items">{{ item }}</li>
            </ul>
            <!-- 循环遍历对象属性 -->
            <ul>
                <li v-for="(value, key, index) in object">{{ index }}. {{ key }}: {{ value }}</li>
            </ul>
        </div>
        <script>
            // 创建 Vue 实例
            const app = new Vue({
                el: '#app',
                data: {
                    message: '你好，Vue.js！',
                    url: 'https://www.baidu.com',
                    count: 0,
                    show: true,
                    items: ['苹果', '香蕉', '橘子'],
                    object: {
                        name: '张三',
                        age: 25,
                        city: '北京'
                    }
                }
            });
        </script>
    </body>
</html>
```

### 插值语法

用于解析标签体内容，语法: `{ { xxx } }` ，xxxx 会作为 **js表达式** 解析。

```vue
<body>
    <div id="root">
        你好-{{name}}
    </div>
    <script>
        new Vue({
            el:'#root',
            data:{
                name:'小黄'
            }
        })
    </script>
</body>
```

### 指令语法

解析标签属性、解析标签体内容、绑定事件，`v-bind:href = 'xxxx'` ，xxxx 会作为js 表达式被解析。

```vue
<body>
    <div id="root">
        <!-- 两种写法 -->
        <a v-bind:href="url">点击跳转</a>
        <a :href="url">点我也可以跳转</a>

        <!-- 解析标签 -->
        <div x="test">我是测试1号</div><!-- <div x="test">我是测试1号</div> -->
        <!-- 标签属性被解析,在data中找不到会报错;若找到了就解析渲染 -->
        <div :x="no_test">我是测试2号</div><!-- Property or method "test" is not defined on the instance but referenced during render. -->
        <div :x="can_test">我是测试3号</div><!-- <div x="test">我是测试3号</div> -->
    </div>
    <script>
        new Vue({
            el:'#root',
            data:{
                url:'https://baidu.com',
                can_test:'test'
            }
        })
    </script>
</body>
```

## 数据绑定

**单向数据绑定：**

- 语法：`v-bind:href ="xxx"` 或简写为 `:href`
- 特点：数据只能**从 data 流向页面**

**双向数据绑定：**

- 语法：`v-mode:value="xxx"` 或简写为 `v-model="xxx"`
- 特点：数据**不仅能从 data 流向页面，还能从页面流向 data**

> v-model指令主要用于表单输入元素，用于实现数据的双向绑定

以下是一些可以与v-model绑定的元素类型：

- 文本框（`<input type="text">`）：用于单行文本输入
- 多行文本框（`<textarea>`）：用于多行文本输入
- 复选框（`<input type="checkbox"`>）：允许用户选择多个选项
- 单选按钮（`<input type="radio">`）：允许用户从一组选项中选择一个
- 选择框（`<select>`）：用于下拉菜单，可以选择一个选项
- 选择框组（`<select multiple>`）：用于下拉菜单，可以选择多个选项

## MVVM 模型

M·V·VM（Model-View-ViewModel）是一种软件设计模式，用于构建用户界面。通过数据绑定和双向数据流，使得视图（View）和模型（Model）之间的交互更加直观和易于管理。

Vue 框架就是一个典型的 `MVVM` 模型的框架

- M：模型(Model) ：对应data 中的数据
- V：视图(View) ：模板
- VM：视图模型(ViewModel) ： Vue 实例对象

>- data中所有的属性，最后都出现在了vm身上。
>- vm身上所有的属性 及 Vue原型上所有属性，在Vue模板中都可以直接使用。

## 数据代理

数据代理是指 Vue 实例将 `data` 对象中的属性代理到 Vue 实例本身。这样，我们可以直接通过 `this.属性名` 访问和修改 `data` 中的数据。

Vue 的数据代理是通过 `Object.defineProperty` 实现的。Vue 在初始化时，会遍历 `data` 对象的所有属性，并将它们代理到 Vue 实例上。

**实现步骤：**

1. **遍历 `data` 对象**：Vue 会遍历 `data` 对象的所有属性。
2. **使用 `Object.defineProperty`**：将每个属性代理到 Vue 实例上。
3. **设置 `getter` 和 `setter`**：在代理过程中，Vue 会为每个属性设置 `getter` 和 `setter`，用于访问和修改数据。

## 事件处理

1. 使用 v-on:xxx 或 @xxx 绑定事件
   - v-on 是 Vue 的事件绑定指令，它可以监听 DOM 事件，例如 v-on:click 监听点击事件
   - @ 是 v-on 的缩写形式，因此 @click 和 v-on:click 是等效的
2. 事件的回调需要配置在 methods 对象中
   - 在 Vue 实例中，你可以通过 `methods` 对象来定义事件处理函数。这些函数作为事件监听器的回调，会在事件触发时执行
3. methods 中配置的函数，不要使用箭头函数，因为那样会导致`this` 的值不会指向 Vue 实例
4. methods 中配置的函数，都是被 Vue 所管理的函数
   - 这意味着你可以在这些方法中访问 `this`，并且 `this` 始终指向 Vue 实例vm或组件实例对象
5. `@click="demo"` 和 `@click="demo($event)"` 效果一致，但后者可以传参
   - 当你在模板中绑定事件时，如果事件处理函数不需要传递参数，你可以直接写 `@click="demo"`
   - 如果你需要在事件处理函数中访问原始的 DOM 事件对象，你需要传递 $event 作为参数。例如，`@click="demo($event)"`
   - 传递 `$event` 参数可以让你的事件处理函数接收事件对象，这样你就可以在函数内部访问事件的相关属性，例如 `event.target` 或 `event.preventDefault()`

```vue
<div id="root">
    <h2>开始{{name}}学习</h2>
    <button v-on:click="showInfo1('你好')">点我提示信息</button>
    <button v-on:click="showInfo2()">点我提示信息</button>
    <button @click="showInfo3()">点我提示信息</button>
</div>
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            name:'VUE',
        },
        methods:{
            showInfo1(text){
                alert(text)
            },
            showInfo2(){
                alert('hello')
            },
            showInfo3(){
                alert('hey~你好')
            }
        }
    })
</script>
```

### 绑定监听

1. `v-on:xxx="fun"`
2. `@xxx="fun"`
3. `@xxx="fun(参数)"`
4. 默认事件形参: `event`
5. 隐含属性对象: `$event`

### 事件修饰符

1. `.prevent`

   - 使用 `.prevent` 修饰符可以阻止事件的默认行为，相当于 `event.preventDefault()`

   - 点击链接时默认会跳转到链接地址，但添加 `.prevent` 后可以阻止这个行为

2. `.stop`

   - 使用 `.stop` 修饰符可以阻止事件冒泡，相当于 `event.stopPropagation()`

   - 例如，点击按钮时，如果按钮在 div 中，默认会触发 div 的点击事件，但添加 .stop 后只会触发按钮的点击事件

3. `.once`

   - 使用 `.once` 修饰符可以使事件只触发一次

   - 例如，按钮点击事件默认会一直触发，但添加 `.once` 后只会触发一次

4. `.capture`

   - 使用 `.capture` 修饰符可以使事件在捕获阶段触发

   - 例如，点击 div1 时，默认会先触发 div2 的点击事件，但添加 `.capture` 后会先触发 div1 的点击事件

5. `.self`

   - 使用 `.self` 修饰符可以使事件只有当事件目标是当前元素时才触发

   - 例如，点击 div 中的按钮时，默认会触发 div 的点击事件，但添加 `.self` 后只会触发按钮的点击事件

6. `.passive`

   - 使用 `.passive` 修饰符可以使事件的默认行为立即执行，无需等待事件回调执行完毕

   - 例如，滚动事件默认会先执行回调函数，再执行默认行为，但添加 `.passive` 后会先执行默认行为，再执行回调函数

```vue
<div id="root">
    <h2>欢迎来到{{name}}学习</h2>
    <!-- 1. 阻止默认事件跳转 -->
    <a href="https://baidu.com" @click.prevent="show($event)">点我提示信息</a>

    <!-- 2. 阻止事件冒泡（常用） -->
    <div class="box" @click="show()">
        <button @click.stop="show($event)">点我提示信息</button>
    </div>

    <!-- 3. 事件只触发一次 -->
    <button @click.once="show()">点我提示信息（只提示一次，多按无效）</button>

    <!-- 4.使用事件的捕获模式  -->
    <div class="box1" @click.capture="showMsg(1)">
        div1
        <div class="box2" @click="showMsg(2)">
            div2
        </div>
    </div>

    <!-- 5.只有event.target是当前操作的元素时才触发事件 -->
    <div class="box" @click.self="show()">
        <button @click="show($event)">点我提示信息</button>
    </div>

    <!-- 6. 事件的默认行为立即执行，无需等待事件回调执行完毕 -->
    <!-- 没有添加passive之前，先执行回调函数，再执行默认行为，业务多就会造成页面卡顿（滚动条不动） -->
    <!-- 添加passive之后，先执行默认行为，再执行回调函数 -->
    <!-- 移动端使用较多，不是所有情况都需要这个修饰符 -->
    <ul class="list" @wheel.passive="demo">
        <!-- 滚动事件1：给滚动条添加scroll，滚动条移动就调用 -->
        <!-- 滚动事件2：给鼠标滚轮添加whell，鼠标滚轮动就调用，哪怕滚动条已经到底 -->
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
        <li>5</li>
    </ul>
</div>

<script>
    new Vue({
        el: '#root',
        data: {
            name:'VUE'
        },
        methods:{
            show(e){
                // 1. 阻止默认事件跳转
                // e.preventDefault()
                alert('你好')
            },
            showMsg(msg){
                alert(msg)
            },
            demo(){
                console.log('滚动');
                for(let i=0;i<10000;i++){
                    console.log(1);
                }
                console.log('累坏了');
            }
        }
    })
</script>
```

### 按键修饰符

1. `keycode` : 操作的是某个keycode 值的键（不推荐使用）

2. `.keyName` : 操作的某个按键名的键(少部分)【keyName 修饰符是 Vue 1.x 版本的写法，现在已经不再推荐使用】
   1. `key`：检查事件对象中的 key 属性【key 修饰符是 Vue.js 2.2.0 版本引入的，用于更准确地绑定键盘事件】

3. 一些常见的 `key` 值和它们对应的按键名：

   - Enter：回车键

   - Tab：制表键（特殊，必须配合keydown使用）

   - Esc：ESC 键

   - Space：空格键

   - Up：上方向键

   - Down：下方向键

   - Left：左方向键

   - Right：右方向键

4. 未提供别名的按键，可以使用按键原始的key值去绑定

5. 如果键名由多个单词组成，你需要使用连字符（-）来分隔这些单词；例如，如果你想监听 CapsLock 键，你需要使用 Caps-Lock 作为键名

6. 系统修饰键(用法特殊)：ctrl、alt、shift、meta（Win）

   - 配合keyup使用：按下修饰键的同时，再按下其他键，随后释放其他键，事件才被触发

   - 配合keydown使用：正常触发事件

7. `Vue.config.keyCodes.自定义键名 = 键码`，可以去定制按键别名

8. 修饰符可以连用

## 计算属性与监视

### 计算属性-computed

1. 要显示的数据不存在，要通过计算得来。
2. 在computed 对象中定义计算属性。
3. 在页面中使用{{方法名}}来显示计算的结果。

示例

```vue
<div id="root">
    姓：<input type="text" v-model="xing">
    名：<input type="text" v-model="ming">
    <!-- 1.  -->
    <!-- 姓名：<span>{{xing}}{{ming}}</span> -->
    <!-- 2.  -->
    <!-- 姓名：<span>{{fullname()}}</span> -->
    <!-- 3.  -->
    姓名：<span>{{name}}</span>
</div>
<!-- 1. 插值语法实现 -->
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            xing:'',
            ming:'',
            name:''
        },
        methods:{
            show(){
                console.log(1);
            }
        }
    })
</script> -->
<!-- 2. methods实现 -->
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            xing:'',
            ming:''
        },
        methods:{
            fullname(){
                return this.xing+this.ming
            }
        }
    })
</script>
<!-- 3.计算属性实现 -->
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            xing:'',
            ming:'',
        },
        methods:{
        },
        computed:{
            // 1. 完整写法
            // name:{
            //     get(){
            //         return this.xing+this.ming
            //     },
            //     // set(value){
            //     //     const [xing, ming] = value.split('');
            //     //     this.xing = xing;
            //     //     this.ming = ming;
            //     // }
            // }
            // 2.简写
            name:function(){
                return this.xing+this.ming
            }
        }
    })
</script>
```

### 监视属性-watch

两种方法

- 通过通过 vm 对象的 `$watch()`
- `watch` 配置来监视指定的属性

使用场景

- `watch` 选项和 `$watch` 方法的主要区别在于它们的用途和灵活性
- `watch` 选项是在组件定义内使用的，它适用于在组件生命周期内始终需要监视的数据
- 而 `$watch` 方法更加灵活，它可以动态地添加或移除监视器，适用于那些需要根据条件或用户操作来决定是否监视数据的情况

当属性变化时, 回调函数自动调用, 在函数内部进行计算

【属性名称】，当你使用 `watch` 选项或 `$watch` 方法时，你需要指定你要监视的数据的属性名称。

- 在对象中，这个属性名称应该是一个字符串，即使它是一个变量，也应该放在引号内
- 例如，'isHot' 而不是 isHot

示例

```vue
<div id="root">
    <h2>今天天气很{{ info }}</h2>
    <!-- <h2>今天天气很不错</h2> -->
    <button @click="change()">点击切换天气</button>
</div>
<script>
    const vm = new Vue({
        el: '#root',
        data: {
            isHot: true
        },
        methods: {
            change() {
                this.isHot = !this.isHot;
            }
        },
        computed: {
            info() {
                return this.isHot ? '炎热' : '凉爽';
            }
        },
        // 1.写法一
        // watch: {
        //     isHot: {
        //         immediate:true,//初始化时，让handler调用一下
        //         handler(newValue, oldValue) {
        //             console.log(`天气从${oldValue?"炎热":"凉爽"}变成了${newValue?"炎热":"凉爽"}`);
        //         }
        //     }
        // }
    })
    // 2.写法二
    const unwatch = vm.$watch('isHot', function(newValue, oldValue) {
        console.log(`天气从${oldValue?"炎热":"凉爽"}变成了${newValue?"炎热":"凉爽"}`);
    });
    // 当想要取消监视时
    unwatch(); // 调用这个函数取消监视
</script>
```

**简写：**

如果你的监视器**只需要一个 `handler` 函数**，你可以使用简写形式，直接传递一个函数作为监视器的值

```vue
vm.$watch('isHot', function(newValue, oldValue) {
    console.log(`天气从${oldValue?"炎热":"凉爽"}变成了${newValue?"炎热":"凉爽"}`);
});
```

### 深度监视–deep

在 Vue 中，watch 选项用于监视数据的变化，并根据变化执行特定的逻辑。对于对象类型的数据，Vue自身可以监测对象内部值的改变，但提供的**watch** 默认情况下只会监视对象本身的变化【一层】，而不会监视对象内部属性的变更【多层】。

想要监视对象内部属性的变更，你需要使用深度监视（deep watch），深度监视通过设置 `deep: true` 配置项来实现，这样 Vue 会递归地监视对象内部值的变动。

```vue
<div id="root">
    <h2>a的值是：{{Number.a}}</h2>
    <button @click="count_a()">点击+1</button>
    <hr>
    <h2>b的值是：{{Number.b}}</h2>
    <button @click="count_b()">点击+1</button>
</div>
<script>
    const vm = new Vue({
        el: '#root',
        data: {
            Number:{
                a:1,
                b:2
            }
        },
        methods: {
            count_a() {
                this.Number.a++
            },
            count_b() {
                this.Number.b++
            },
            count(){

            }
        },
        computed: {
        },
        watch: {
            //监视多级结构中某个属性的变化
            // 不能直接写a，监视不到
            // 不能写Number,b变也监视a
            // 需要加上''
            //监视多个(一一列举✖️)
            'Number.a':{
                handler(oldValue,newValue){
                    console.log('a变了'+(oldValue-newValue));
                }
            },
            'Number.b':{
                handler(oldValue,newValue){
                    console.log('b变了'+(oldValue-newValue));
                }
            },
            //同时监视所有
            'Number':{
                deep:true,//深度监视配置项
                handler(){
                    console.log('Number数据变化');
                }
            }
        }
    })
</script>
```

### 计算属性与监视的选择

计算属性无法开启异步任务，面临异步操作需要选择watch。

`omputed` 和 `watch` 之间的区别：

- computed能完成的功能，watch都可以完成。
- watch能完成的功能，computed不一定能完成，例如：watch可以进行异步操作。
- 在大多数情况下，你应该**优先考虑使用计算属性**，因为它们更加简洁、易于维护，并且与 Vue 的响应式系统更紧密集成。只有在计算属性不适用时，才考虑使用 `watch` 监听器

>- 所有被Vue管理的函数，最好写成普通函数，这样this的指向才是vm 或 组件实例对象
>- 所有不被Vue所管理的函数（定时器的回调函数、ajax的回调函数等、Promise的回调函数），最好写成箭头函数，这样this的指向才是vm或组件实例对象

## class 与 style 绑定

**class 绑定：**

1. `:class='xxx'`
2. 表达式是字符串：`'classA'`
3. 表达式是对象：`{classA:isA, classB: isB}`
4. 表达式是数组：`[‘classA’, ‘classB’]`

**style 绑定：**

1. `:style="{ color: activeColor, fontSize: fontSize + 'px' }"`
2. 其中 `activeColor/fontSize` 是 `data` 属性

示例

```vue
<div id="root">
    <!-- 绑定class样式--字符串写法，适用于：样式的类名不确定，需要动态指定 -->
    <div class="basic" :class="mood" @click="changeMood">{{name}}</div> <br/><br/>

    <!-- 绑定class样式--数组写法，适用于：要绑定的样式个数不确定、名字也不确定 -->
    <div class="basic" :class="classArr">{{name}}</div> <br/><br/>

    <!-- 绑定class样式--对象写法，适用于：要绑定的样式个数确定、名字也确定，但要动态决定用不用 -->
    <div class="basic" :class="classObj">{{name}}</div> <br/><br/>

    <!-- 绑定style样式--对象写法 -->
    <div class="basic" :style="styleObj">{{name}}</div> <br/><br/>

    <!-- 绑定style样式--数组写法 -->
    <div class="basic" :style="styleArr">{{name}}</div>
</div>
<script type="text/javascript">
    Vue.config.productionTip = false
    const vm = new Vue({
        el:'#root',
        data:{
            name:'VUE',
            mood:'normal',
            classArr:['atguigu1','atguigu2','atguigu3'],
            classObj:{
                atguigu1:false,
                atguigu2:false,
            },
            styleObj:{
                fontSize: '40px',
                color:'red',
            },
            styleObj2:{
                backgroundColor:'orange'
            },
            styleArr:[
                {
                    fontSize: '40px',
                    color:'blue',
                },
                {
                    backgroundColor:'gray'
                }
            ]
        },
        methods: {
            changeMood(){
                const arr = ['happy','sad','normal']
                const index = Math.floor(Math.random()*3)
                this.mood = arr[index]
            }
        },
    })
</script>
```

## 条件渲染

### 条件渲染指令

v-if 与v-else-if与v-else

- 不能在指令之间插入其他元素
- 如果表达式为 true，则元素会被渲染；如果表达式为 false，则元素不会被渲染，并且不会占据任何空间。

v-show

- 如果表达式为 true，则元素会被渲染，并且通过 CSS 属性 `display: none;` 隐藏。
- 如果表达式为 false，则元素会被渲染，并且通过 CSS属性 `display: block;` 显示。
- 元素始终会被渲染，只是通过 CSS 控制其显示与隐藏

### 比较v-if 与v-show

1. 性能考虑：

   - 如果需要频繁切换 `v-show` 较好，不经常变化使用 `v-if`
2. 初始渲染：

   - v-if 不会在初始渲染时添加元素，只有当条件满足时才会添加
   - v-show 会在初始渲染时添加元素，并立即通过 CSS 控制其显示与隐藏
3. 过渡效果：

   - v-show 可以与 CSS 过渡效果配合使用，从而实现平滑的显示与隐藏效果
   - v-if 则不会有过渡效果，因为它在条件不成立时会直接移除元素
4. 使用v-if的时，元素可能无法获取到，而使用v-show一定可以获取到

### template

- 组织 HTML 结构：可以将任何 HTML 结构包裹在 template 元素中，Vue 会将这些结构视为模板的一部分
- 嵌套结构：template 元素可以嵌套在其他 template 元素中，形成多层嵌套的模板结构
- 动态内容：通过在 template 元素中使用 Vue 指令（如 v-if、v-for、v-bind 等），你可以实现复杂的动态内容
- 可复用性：template 元素可以作为组件的一部分，并在其他组件中复用

```vue
<template>
<div>
    <p v-if="n===10">你好</p>
    <p v-if="n===10">Hello</p>
    <p v-if="n===10">hi！</p>
    <div v-if="n===15">
        <p>你好</p>
        <p>hello</p>
        <p>hi~</p>
    </div>
    <template v-if="n===5">
        <p>你好</p>
        <p>hello</p>
        <p>hi~</p>
</template>
</div>
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            n:0
        }
    })
</script>
</template>
```

>1. 当需要对多个元素应用相同的条件时，直接在每个元素上使用多个 `v-if` 指令可能会导致性能问题，因为每次条件改变时，Vue 都需要重新计算每个 `v-if` 的结果
>2. 想到当需要对多个元素应用相同的条件时，直接在每个元素上使用多个 `v-if` 指令可能会导致性能问题，因为每次条件改变时，Vue 都需要重新计算每个 `v-if` 的结果；然而，直接使用 `div` 包裹多个元素可能会影响代码的结构
>3. 于是选择使用`template` 元素，它可以用来包裹多个 `v-if` 条件

## 列表渲染

### 列表显示指令

遍历数组

- `v-for="person in personArr"`：用于遍历数组，并渲染数组中的每个元素
- `v-for="(person, index) in personArr"`：用于遍历数组，并使用 person 变量代表当前元素，使用 index 变量代表当前元素的索引

遍历对象

- `v-for="(value, key) in obj"`：用于遍历对象，并渲染每个键值对

## 收集表单数据

收集表单数据：

- 若：`<input type="text"/>`，则v-model收集的是value值，用户输入的内容就是value值
- 若：`<input type="radio"/>`，则v-model收集的是value值，且要给标签配置value属性
- 若：`<input type="checkbox"/>`
  - 没有配置value属性，那么收集的是checked属性（勾选 or 未勾选，是布尔值）
  - 配置了value属性：
    - `v-model` 的初始值是非数组，那么收集的就是checked（勾选 or 未勾选，是布尔值）
    - `v-model` 的初始值是数组，那么收集的就是value组成的数组

v-model的三个修饰符：

1. `lazy`：失去焦点后再收集数据
2. `number`：输入字符串转为有效的数字
3. `trim`：输入首尾空格过滤

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
            <form @submit.prevent="demo">
                账号：<input type="text" v-model.trim="userInfo.account"> <br/><br/>
                密码：<input type="password" v-model="userInfo.password"> <br/><br/>
                年龄：<input type="number" v-model.number="userInfo.age"> <br/><br/>
                性别：
                男<input type="radio" name="sex" v-model="userInfo.sex" value="male">
                女<input type="radio" name="sex" v-model="userInfo.sex" value="female"> <br/><br/>
                爱好：
                学习<input type="checkbox" v-model="userInfo.hobby" value="study">
                打游戏<input type="checkbox" v-model="userInfo.hobby" value="game">
                吃饭<input type="checkbox" v-model="userInfo.hobby" value="eat">
                <br/><br/>
                所属校区：
                <select v-model="userInfo.city">
                    <option value="">请选择校区</option>
                    <option value="beijing">北京</option>
                    <option value="shanghai">上海</option>
                    <option value="shenzhen">深圳</option>
                    <option value="wuhan">武汉</option>
                </select>
                <br/><br/>
                其他信息：
                <textarea v-model.lazy="userInfo.other"></textarea> <br/><br/>
                <input type="checkbox" v-model="userInfo.agree">阅读并接受<a href="http://www.atguigu.com">《用户协议》</a>
                <button>提交</button>
            </form>
        </div>
        <script>
            const vm=new Vue({
                el:'#root',
                data:{
                    userInfo:{
                        account:'',
                        password:'',
                        age:0,
                        sex:'female',
                        hobby:[],
                        city:'beijing',
                        other:'',
                        agree:''
                    }
                },
                methods: {
                    demo(){
                        console.log(JSON.stringify(this.userInfo))
                    }
                }
            })
        </script>
    </body>
</html>
```

## 内置指令与自定义指令

### 常用内置指令

1. `v-text`：更新元素的 textContent
   - 与插值语法的区别：`v-text`会替换掉节点中的内容，`{{xx}}`则不会
2. `v-html`：更新元素的 innerHTML（**有安全性问题**）
3. `v-if`：如果为true, 当前标签才会输出到页面
4. `v-else`：如果为false, 当前标签才会输出到页面
5. `v-show`：通过控制display 样式来控制显示/隐藏
6. `v-for`：遍历数组/对象
7. `v-on`：绑定事件监听, 一般简写为 `@`
8. `v-bind`：绑定解析表达式, 可以省略 `v-bind`
9. `v-model`：双向数据绑定
10. `v-cloak`：防止闪现, 与css 配合: [v-cloak] { display: none }

### v-cloak指令

JavaScript 阻塞通常指的是在网页中，JavaScript 代码的执行可能会阻止其他代码的执行，从而影响页面的加载和渲染。

当 Vue 实例创建后，它会解析模板中的 `v-cloak` 指令，并应用 CSS 样式规则。

由于 `v-cloak` 指令的存在，带有该指令的元素在 Vue 实例创建前是隐藏的。一旦 Vue 实例解析完模板，它会将数据属性 `name` 的值 'VUE' 绑定到 `<h2>` 元素上，并将其显示出来。

```css
<style>
    [v-cloak]{
        display:none;
    }
</style>
```

>`v-cloak`指令（没有值）：
>
>1. 本质是一个特殊属性，Vue实例创建完毕并接管容器后，会删掉`v-cloak`属性
>2. 使用css配合`v-cloak`可以解决网速慢时页面展示出`{ { xxx } }`的问题

### v-once 指令

- `v-once`所在节点在初次动态渲染后，就视为静态内容了。
- 以后数据的改变不会引起`v-once`所在结构的更新，可以用于优化性能。

```vue
<div id="root">
    <h2 v-once>初始的n值是:{{n}}</h2>
    <h2>当前的n值是:{{n}}</h2>
    <button @click="add">点我n+1</button>
</div>
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            n:1
        },
        methods: {
            add(){
                this.n++
            }
        },
    })
</script>
```

### v-pre 指令

- 跳过其所在节点的编译过程。
- 可利用它跳过：没有使用指令语法、没有使用插值语法的节点，会加快编译。

```vue
<div id="root">
    <!-- 不编译 -->
    <h2 v-pre>vue其实很简单</h2>
    <h2 v-pre>当前的n值是:{{n}}</h2>
    <button v-pre @click="add" a="1">点我n+1</button>

    <!-- 正常 -->
    <!-- <h2>vue其实很简单</h2>
<h2>当前的n值是:{{n}}</h2>
<button @click="add">点我n+1</button> -->
</div>
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            n:1
        },
        methods: {
            add(){
                this.n++
            }
        },
    })
</script>
```

### 自定义指令

1. 指令定义时不加v-，但使用时要加v-

2. 自定义指令名称由多个单词组成，多个单词之间要用连字符`-`连接，不使用驼峰命名法，如，`v-big-number`，不用 `v-bigNumber`

3. 自定义指令内部 `this` 指向

   在指令的回调函数（无论是对象式中的 `bind`、`inserted`、`update` 还是函数式）中，`this` 默认指向全局对象，而不是 `Vue` 实例

4. 局部指令变全局指令

   1. 局部指令：在 Vue 实例的 `directives` 选项中定义的自定义指令仅在该实例中可用，其他Vue实例中用不了
   2. 全局指令：通过 `Vue.directive` 方法注册的自定义指令在整个 `Vue` 应用中可用
   3. 优先级：全局指令的优先级高于局部指令。如果全局和局部指令有相同的名称，全局指令会被优先使用。
   4. 注销局部指令：如果您需要将局部指令变成全局指令，可以在全局范围内注销局部指令的定义。

```vue
<!-- 
需求1：定义一个v-big指令，和v-text功能类似，但会把绑定的数值放大10倍。
需求2：定义一个v-fbind指令，和v-bind功能类似，但可以让其所绑定的input元素默认获取焦点。
-->
<div id="root">
    <h2>当前的n值是：<span v-text="n"></span></h2>
    <h2>放大10倍后的n值是：<span v-big="n"></span></h2>
    <button @click="n++">点我n+1</button>
    <hr>
    <!-- 自动获取焦点可以添加属性 autofocus -->
    <input type="text" v-fbind:value="n">
</div>
<script>
    const vm=new Vue({
        el:'#root',
        data:{
            n:1
        },
        directives:{
            // 写法1:对象
            // big:{
            //     // k:v
            // }
            // 写法2:函数
            // big:function(a,b){
            //     console.log(a);//<span></span> 真实的dom元素
            //     console.log(b);
            //     /* 对象
            //     {
            //         "name": "big",
            //         "rawName": "v-big",
            //         "value": 1,         // n的值
            //         "expression": "n",
            //         "modifiers": {},
            //         "def": {}
            //     } 
            //      */
            // }
            big(element,binding){
                // big函数被调用的时候:
                // 1. 指令与元素成功绑定时(一上来) bind
                // 2. 指令所在的模板被重新解析时  update
                console.log(element,binding.value);
                element.innerText=binding.value*10
            },

            // fbind(element,binding){
            //     element.value=binding.value
            //     // element.focus()
            //     // 代码无法奏效,时机不对

            //     // 函数形式已经找不到合适时机了,不得不换成对象写法
            // }
            fbind:{
                // 指令与元素成功绑定时(一上来)
                bind(element,binding){
                    console.log('bind');
                    // 元素已经创建,但是还没有放到页面
                    element.value=binding.value
                },
                // 指令所在元素被插入页面时
                inserted(element,binding){
                    console.log('inserted');
                    element.focus()
                },
                // 指令所在模板被重新解析时
                update(element,binding) {
                    console.log('update');
                    element.value=binding.value
                },
                // 第一个跟第三个的逻辑往往相同,简写方式相当于只写了这两个
            }
        }
    })
</script>
```

注册全局指令

```vue
Vue.directive('my-directive', function(el, binding){ 
    el.innerHTML = binding.value.toupperCase()
})
```

注册局部指令

```vue
directives: {
  'v-my-directive': {
    bind(el, binding) {
      el.innerHTML = binding.value.toUpperCase(); 
    }
  }
}
```

>使用指令 `v-my-directive='xxx'`

配置对象中常用的3个回调

- `bind`：指令与元素成功绑定时调用
- `inserted`：指令所在元素被插入页面时调用
- `update`：指令所在模板结构被重新解析时调用

```vue
<div id="root">
    <h2>当前的n值是：<span v-text="n"></span></h2>
    <!-- 不用bigNumber -->
    <!-- <h2>放大10倍后的n值是：<span v-big-number="n"></span></h2> -->
    <h2>放大10倍后的n值是：<span v-big="n"></span></h2>
    <button @click="n++">点我n+1</button>
    <input type="text" v-fbind:value="n">
</div>
<hr>
<div id="root2">
    <h2>当前的x值是：<span v-text="x"></span></h2>
    <h2>放大10倍后的x值是：<span v-big="x"></span></h2>
    <button @click="x++">点我n+1</button>
    <!-- 第一步:无法使用v-fbind -->
    <input type="text" v-fbind:value="x">
</div>

<script>
    // 第二步:将其变成全局的(全局的必须放前面)
    // 类似过滤器
    // filters ---> filter
    // directives ---> directive
    Vue.directive('fbind',{
        bind(element, binding) {
            element.value = binding.value;
            console.log('fbind-bind',this);//window
        },
        inserted(element, binding) {
            element.focus();
            console.log('fbind-inserted',this);//window
        },
        update(element, binding) {
            element.value = binding.value;
            console.log('fbind-update',this);//window
        },
    })
    // 同理,另一个操作一样
    Vue.directive('big',function(element, binding) {
        console.log(element, binding.value);
        element.innerText = binding.value * 10;
        console.log('big',this);//window
    })

    const vm = new Vue({
        el: '#root',
        data: {
            n: 1
        },
        directives: {
            // 不能直接用big-number
            // big(element, binding) {
            //     console.log(element, binding.value);
            //     element.innerText = binding.value * 10;
            //     console.log('big',this);//window
            // },
            // 'big-number'(element, binding) {
            //     console.log(element, binding.value);
            //     element.innerText = binding.value * 10;
            // },

            // 第三步:注销局部
            // fbind: {
            //     bind(element, binding) {
            //         element.value = binding.value;
            //         console.log('fbind-bind',this);//window
            //     },
            //     inserted(element, binding) {
            //         element.focus();
            //         console.log('fbind-inserted',this);//window
            //     },
            //     update(element, binding) {
            //         element.value = binding.value;
            //         console.log('fbind-update',this);//window
            //     },
            // }
        }
    })

    // 第一步:无法使用v-fbind,局部指令需要变成全局的
    new Vue({
        el:'#root2',
        data:{
            x:10
        }
    })
</script>
```

## 实例生命周期

Vue.js 实例的生命周期可以分为三个阶段：挂载（Mounting）、更新（Updating）和销毁（Destroying），每个阶段都有相应的事件钩子（生命周期钩子）可以被使用，这些钩子允许我们在特定的时刻执行代码

**挂载流程：**

`Init Events & Liftcycle`

- 制定一些规则，比如定义生命周期函数，各生命周期函数的调用时机；
- 又比如遇到事件修饰符后事件的处理方式；
- 这一步，vm身上还没有`vm._data`，数据代理，比如`vm.n`，`n` 是data中的一个配置项，也是没有的

`beforeCreate`【生命周期，指的是创建数据监测和数据代理之前】

- 此时无法通过 `vm` 访问 `data` 中的数据【Vue收到的 `data` 还没有开始解析，vm身上还没有`_data`】和 `methods` 中的方法

`Init injection & reactivity`

- 初始化数据监测相关的操作【给 `data` 中的对象属性增加 `setter` 和 `getter` 、包装操作数组的七个方法】和数据代理相关的操作【vm对象代理 `_data` 对象】

`created`【生命周期，指的是创建数据监测和数据代理之后】

- 可以通过vm访问 `data` 中的数据和 `methods` 中的方法

`Compile el's outerHTML as template`

- 当new Vue时传入的配置对象中不包含 `template` 配置项时会来到该环节，el配置项的值可以是一个选择器，根据选择器能够找到模板中的一段HTML代码片段，这里说的是el的 `outerHTML`，`outerHTML` 和 `innerHTML` 的区别如下

  - outerHTML：包含当前标签

  - innerHTML：当前标签内部的标签

**debugger：**

在代码中加一句 `debugger`，然后到浏览器中刷新页面，这时候浏览器就会在 `debugger` 语句那停止执行

**生命周期分析：**

初始化显示

- `beforeCreate()`

- `created()`

- `beforeMount()`

- `mounted()`

更新状态：this.xxx = value`

- `beforeUpdate()`

- `updated()`

销毁vue 实例：`vm.$destory()`

- `beforeDestory()`

- `destoryed()`

**常用的生命周期方法：**

- `mounted()`：发送ajax 请求，启动定时器等异步任务。
- `beforeDestory()`：做收尾工作，如：清除定时器。

**流程图：**

![An image](/img/javascript/vue/001.png)

示例

```vue
<div id="root" :x="n">
    <p>n的值为：{{n}}</p>
    <button @click="add">点我n+1</button>
</div>
<script>
    const vm=new Vue({
        el:'#root',
        // 完全替换原先<div id="root"></div>,属性无
        // template:`
        // 	<div>
        // 		<h2>当前的n值是：{{n}}</h2>
        // 		<button @click="add">点我n+1</button>
        // 	</div>
        // `,

        // 欺骗无效：Cannot use <template> as component root element because it may contain multiple nodes.
        // template:`
        // 	<template>
        // 		<h2>当前的n值是：{{n}}</h2>
        // 		<button @click="add">点我n+1</button>
        // 	</template>
        // `,

        data:{
            n:1
        },
        methods: {
            add(){
                console.log('add')
                this.n++
            },
            bye(){
                console.log('bye')
                this.$destroy()
            }
        },
        watch:{
            n(){
                console.log('n变了')
            }
        },
        beforeCreate() {
            console.log('beforeCreate')
        },
        created() {
            console.log('created')
        },
        beforeMount() {
            console.log('beforeMount')
        },
        mounted() {
            console.log('mounted')
        },
        beforeUpdate() {
            console.log('beforeUpdate')
        },
        updated() {
            console.log('updated')
        },
        beforeDestroy() {
            console.log('beforeDestroy')
        },
        destroyed() {
            console.log('destroyed')
        },
    })
</script>
```
