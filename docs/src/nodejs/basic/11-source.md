# Event源码

## 发布/订阅者模式

`发布/订阅者模式`应该是我在开发过程中遇到的最多的设计模式。`发布/订阅者模式`，也可以称之为消息机制，定义了一种依赖关系，这种依赖关系可以理解为 `1对N` (注意：不一定是1对多，有时候也会1对1哦)，观察者们同时监听某一个对象相应的状态变换，一旦变化则通知到所有观察者，从而触发观察者相应的事件，该设计模式解决了主体对象与观察者之间功能的`耦合`。

![An image](/img/nodejs/base/13.webp)

发布/订阅模式的特点和结构
三要素：

1. 发布者  
2. 订阅者
3. 事件(订阅)

### 发布/订阅者模式的优缺点

- 优点

主体和观察者之间完全透明，所有的消息传递过程都通过消息调度中心完成，也就是说具体的业务逻辑代码将会是在消息调度中心内，而主体和观察者之间实现了完全的**松耦合**。对象直接的解耦，异步编程中，可以更松耦合的代码编写。

- 缺点

程序易读性显著降低。

### EventEmitter 与 发布/订阅模式的关系

 Node.js 中的 EventEmitter
 模块就是用了发布/订阅这种设计模式，发布/订阅 模式在主体与观察者之间引入消息调度中心，主体和观察者之间完全透明，所有的消息传递过程都通过消息调度中心完成，也就是说具体的业务逻辑代码将会是在消息调度中心内完成。

### 事件的基本组成要素

![An image](/img/nodejs/base/14.webp)

## Events 模块

Events 模块只有一个 EventEmitter 类。

Events是 Node.js 中一个使用率很高的模块，其它原生node.js模块都是基于它来完成的，比如流、HTTP等。它的核心思想就是 Events 模块的功能就是一个`事件绑定与触发`，所有继承自它的实例都具备事件处理的能力。

首先定义类的基本结构

```javascript
function EventEmitter() {
    //私有属性，保存订阅方法
    this._events = {};
}

//默认设置最大监听数
EventEmitter.defaultMaxListeners = 10;

module.exports = EventEmitter;
```

#### on 方法

on 方法，该方法用于订阅事件(这里 on 和 addListener 说明下)

```javascript
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;
```

接下来是我们对on方法的具体实践：

```javascript
EventEmitter.prototype.on =
    EventEmitter.prototype.addListener = function (type, listener, flag) {
		//保证存在实例属性
        if (!this._events) this._events = Object.create(null);

        if (this._events[type]) {
            if (flag) {//从头部插入
                this._events[type].unshift(listener);
            } else {
                this._events[type].push(listener);
            }

        } else {
            this._events[type] = [listener];
        }
		//绑定事件，触发newListener
        if (type !== 'newListener') {
            this.emit('newListener', type);
        }
    };
```

因为有其它子类需要继承自EventEmitter，因此要判断子类是否存在_event属性，这样做是为了保证子类必须存在此实例属性。而flag标记是一个订阅方法的插入标识，如果为'true'就视为插入在数组的头部。可以看到，这就是观察者模式的订阅方法实现。

#### emit方法

```javascript
EventEmitter.prototype.emit = function (type, ...args) {
    if (this._events[type]) {
        this._events[type].forEach(fn => fn.call(this, ...args));
    }
};
```

emit方法就是将订阅方法取出执行，使用call方法来修正this的指向，使其指向子类的实例。

#### once方法

```javascript
EventEmitter.prototype.once = function (type, listener) {
    let _this = this;

    //中间函数，在调用完之后立即删除订阅
    function only() {
        listener();
        _this.removeListener(type, only);
    }
    //origin保存原回调的引用，用于remove时的判断
    only.origin = listener;
    this.on(type, only);
};
```

once方法非常有趣，它的功能是将事件订阅“一次”，当这个事件触发过就不会再次触发了。其原理是将订阅的方法再包裹一层函数，在执行后将此函数移除即可。

#### off方法

```javascript
EventEmitter.prototype.off =
    EventEmitter.prototype.removeListener = function (type, listener) {

        if (this._events[type]) {
        //过滤掉退订的方法，从数组中移除
            this._events[type] =
                this._events[type].filter(fn => {
                    return fn !== listener && fn.origin !== listener
                });
        }
    };
```

off方法即为退订，原理同观察者模式一样，将订阅方法从数组中移除即可。

#### prependListener方法

```javascript
EventEmitter.prototype.prependListener = function (type, listener) {
    this.on(type, listener, true);
};
```

此方法不必多说了，调用on方法将标记传为true（插入订阅方法在头部）即可。
以上，就将EventEmitter类的核心方法实现了。

#### 其他一些不太常用api

- `emitter.listenerCount(eventName)`可以获取事件注册的`listener`个数
- `emitter.listeners(eventName)`可以获取事件注册的`listener`数组副本。

#### 手写代码后的说明

手写Events模块代码的时候注意以下几点：

- 使用订阅/发布模式
- 事件的核心组成有哪些
- 写源码时候考虑一些范围和极限判断

注意:我上面的手写代码并不是性能最好和最完善的，目的只是带大家先弄懂记住他。举个例子：
最初的定义EventEmitter类，源码中并不是直接定义 `this._events = {}`，请看：

```javascript
function EventEmitter() {
  EventEmitter.init.call(this);
}

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};
```

同样是实现一个类，但是源码中更注意性能，我们可能认为简单的一个 `this._events = {}`;就可以了，但是通过`jsperf`(一个小彩蛋，有需要的搜以下，查看性能工具) 比较两者的性能，源码中高了很多，我就不具体一一讲解了，附上源码地址，有兴趣的可以去学习

> lib/events源码地址  https://github.com/nodejs/node/blob/master/lib/events.js

## 阅读源码后一些疑问的解释

### 监听函数的执行顺序是同步 or 异步？

看一段代码：

```javascript
const EventEmitter = require('events');
class MyEmitter extends EventEmitter{};
const myEmitter = new MyEmitter();
myEmitter.on('event', function() {
  console.log('listener1');
});
myEmitter.on('event', async function() {
  console.log('listener2');
  setTimeout(() => {
    console.log('我是异步中的输出');
    resolve(1);
  }, 1000);
});
myEmitter.on('event', function() {
  console.log('listener3');
});
myEmitter.emit('event');
console.log('end');
```

输出结果如下:

```javascript
// 输出结果
listener1
listener2
listener3
end
我是异步中的输出
```

EventEmitter触发事件的时候，各`监听函数的调用`是同步的（注意：监听函数的调用是同步的，'end'的输出在最后），但是并不是说监听函数里不能包含异步的代码，代码中listener2那个事件就加了一个异步的函数，它是最后输出的。

### 事件循环中的事件是什么情况下产生的？什么情况下触发的？

以`fs.open`为例子，看一下到底什么时候产生了事件，什么时候触发，和EventEmitter有什么关系呢？

![An image](/img/nodejs/base/15.webp)

说明：本图中详细绘制了从 异步调用开始--->异步调用请求封装--->请求对象传入I/O线程池完成I/O操作--->将完成的I/O结果交给I/O观察者--->从I/O观察者中取出回调函数和结果调用执行。

#### 事件产生

关于事件你看图中第三部分，事件循环那里。Node.js 所有的异步 I/O 操作(net.Server， fs.readStream 等)在`完成后`都会添加一个事件到事件循环的事件队列中。

#### 事件触发

事件的触发，我们只需要关注图中第三部分，事件循环会在事件队列中取出事件处理。`fs.open`产生事件的对象都是 events.EventEmitter 的实例，继承了EventEmitter，从事件循环取出事件的时候，触发这个事件和回调函数。

### 事件类型为error的问题

当我们直接为EventEmitter定义一个error事件，它包含了错误的语义，我们在遇到 异常的时候通常会触发 error 事件。

当 error 被触发时，EventEmitter 规定如果没有响 应的监听器，Node.js 会把它当作异常，退出程序并输出错误信息。

```javascript
var events = require('events'); 
var emitter = new events.EventEmitter(); 
emitter.emit('error'); 
```

运行时会报错

```javascript
node.js:201 
throw e; // process.nextTick error, or 'error' event on first tick 
^ 
Error: Uncaught, unspecified 'error' event. 
at EventEmitter.emit (events.js:50:15) 
at Object.<anonymous> (/home/byvoid/error.js:5:9) 
at Module._compile (module.js:441:26) 
at Object..js (module.js:459:10) 
at Module.load (module.js:348:31) 
at Function._load (module.js:308:12) 
at Array.0 (module.js:479:10) 
at EventEmitter._tickCallback (node.js:192:40) 
```

我们一般要为会触发 error 事件的对象设置监听器，避免遇到错误后整个程序崩溃。

### 如何修改EventEmitter的最大监听数量？

默认情况下针对单一事件的最大listener数量是10，如果超过10个的话listener还是会执行，只是控制台会有警告信息，告警信息里面已经提示了操作建议，可以通过调用emitter.setMaxListeners()来调整最大listener的限制

```javascript
(node:9379) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 event listeners added. Use emitter.setMaxListeners() to increase limit
```

上面的警告信息的粒度不够，并不能告诉我们是哪里的代码出了问题，可以通过process.on('warning')来获得更具体的信息（emitter、event、eventCount）

```javascript
process.on('warning', (e) => {
  console.log(e);
})


{ MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 event listeners added. Use emitter.setMaxListeners() to increase limit
    at _addListener (events.js:289:19)
    at MyEmitter.prependListener (events.js:313:14)
    at Object.<anonymous> (/Users/xiji/workspace/learn/event-emitter/b.js:34:11)
    at Module._compile (module.js:641:30)
    at Object.Module._extensions..js (module.js:652:10)
    at Module.load (module.js:560:32)
    at tryModuleLoad (module.js:503:12)
    at Function.Module._load (module.js:495:3)
    at Function.Module.runMain (module.js:682:10)
    at startup (bootstrap_node.js:191:16)
  name: 'MaxListenersExceededWarning',
  emitter:
   MyEmitter {
     domain: null,
     _events: { event: [Array] },
     _eventsCount: 1,
     _maxListeners: undefined },
  type: 'event',
  count: 11 }

```

## EventEmitter的应用场景

- 不能try/catch的错误异常抛出可以使用它
- 好多常用模块继承自EventEmitter
  比如`fs`模块 `net`模块
- 前端开发中也经常用到发布/订阅模式(思想与Events模块相同)

## 发布/订阅模式与观察者模式的一点说明

观察者模式与发布-订阅者模式，在平时你可以认为他们是一个东西，但是在某些场合(比如面试)可能需要稍加注意，看一下二者的区别对比

![An image](/img/nodejs/base/16.webp)

从图中可以看出，发布-订阅模式中间包含一个Event Channel

1. 观察者模式 中的观察者和被观察者之间还是存在耦合的，两者必须确切的知道对方的存在才能进行消息的传递。
2. 发布-订阅模式 中的发布者和订阅者不需要知道对方的存在，他们通过消息代理来进行通信，解耦更加彻底。
