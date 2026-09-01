# Event模块

## 什么是事件？

当今事件驱动的体系结构非常普遍，事件驱动的程序可以产生、检测和响应各种事件。

Node.js 的核心部分是事件驱动的，有许多诸如文件系统（`fs`）和  `stream` 这样的模块本身都是用 `EventEmitter` 编写的。

在事件驱动的编程中，**事件（event）** 是一个或多个动作的结果，这可能是用户的操作或者传感器的定时输出等。

我们可以把事件驱动程序看作是发布-订阅模型，其中发布者触发事件，订阅者侦听事件并采取相应的措施。

例如，假设有一个服务器，用户可以向其上传图片。在事件驱动的编程中，诸如上传图片之类的动作将会发出一个事件，为了利用它，该事件还会有 1 到 n 个订阅者。

在触发上传事件后，订阅者可以通过向网站的管理员发电子邮件，让他们知道用户已上传照片并对此做出反应；另一个订阅者可能会收集有关操作的信息，并将其保存在数据库中。

这些事件通常是彼此独立的，尽管它们也可能是相互依赖的。

## 什么是EventEmitter？

`EventEmitter` 类是 Node.js 的内置类，位于 `events` 模块。根据文档中的描述：

> 大部分的 Node.js 核心 API 都是基于惯用的异步事件驱动的体系结构所实现的，在该体系结构中，某些类型的对象（称为“发射器”）发出已命名事件，这些事件会导致调用 `Function` 对象（“监听器”）”

这个类在某种程度上可以描述为发布-订阅模型的辅助工具的实现，因为它可以用简单的方法帮助事件发送器（发布者）发布事件（消息）给监听器（订阅者）。

## EventEmitters

### 创建 EventEmitter 对象

先从一个简单的例子开始：创建一个 `EventEmitter`，它每秒发出一个含有程序运行时间信息的事件。

首先从 `events` 模块中导入 `EventEmitter` 类：

```javascript
// 导入EventEmitter类
const { EventEmitter } = require('events');
// 创建EventEmitter
const timerEventEmitter = new EventEmitter();
// 发布事件
let currentTime = 0;

// 每秒触发一次 update 事件
setInterval(() => {
    currentTime++;
    // EventEmitter实例用来接受事件名称和参数。
    // 把update作为事件名，currentTime作为自程序启动以来的时间进行传递。
    timerEventEmitter.emit('update', currentTime);
}, 1000);


// 监听事件
// 通过on()方法创建侦听器，并传递事件名称来指定希望将侦听器附加到哪个事件上。
// 在update事件上，运行一个记录时间的方法。
// on()函数的第二个参数是一个回调，可以接受事件发出的附加数据。
timerEventEmitter.on('update', (time) => {
    console.log('从发布者收到的消息：');
    console.log(`程序已经运行了 ${time} 秒`);
});

// 输出
从发布者收到的消息：
程序已经运行了 1 秒
从发布者收到的消息：
程序已经运行了 2 秒
从发布者收到的消息：
程序已经运行了 3 秒
从发布者收到的消息：
程序已经运行了 4 秒
```

如果只在事件首次触发时才需要执行某些操作，也可以用 `once()` 方法进行订阅：

```javascript
timerEventEmitter.once('update', (time) => {
    console.log('从发布者收到的消息：');
    console.log(`程序已经运行了 ${time} 秒`);
});
```

运行这段代码会输出：

```javascript
从发布者收到的消息：
程序已经运行了 1 秒
```

### EventEmitter 与多个监听器

下面创建另一种事件发送器。这是一个计时程序，有三个侦听器。第一个监听器每秒更新一次时间，第二个监听器在计时即将结束时触发，最后一个在计时结束时触发：

- `update`：每秒触发一次
- `end`：在倒数计时结束时触发
- `end-soon`：在计时结束前 2 秒触发

先写一个创建这个事件发射器的函数：

```javascript
const countDown = (countdownTime) => {
    const eventEmitter = new EventEmitter();

    let currentTime = 0;

    // 每秒触发一次 update 事件
    const timer = setInterval(() => {
        currentTime++;
        eventEmitter.emit('update', currentTime);

        // 检查计时是否已经结束
        if (currentTime === countdownTime) {
            clearInterval(timer);
            eventEmitter.emit('end');
        }

        // 检查计时是否会在 2 秒后结束
        if (currentTime === countdownTime - 2) {
            eventEmitter.emit('end-soon');
        }
    }, 1000);
    return eventEmitter;
};
```

这个函数启动了一个每秒钟发出一次 `update` 事件的事件。

第一个 `if` 用来检查计时是否已经结束并停止基于间隔的事件。如果已结束将会发布 `end` 事件。

如果计时没有结束，那么就检查计时是不是离结束还有 2 秒，如果是则发布 `end-soon` 事件。

向该事件发射器添加一些订阅者：

```javascript
const myCountDown = countDown(5);

myCountDown.on('update', (t) => {
    console.log(`程序已经运行了 ${t} 秒`);
});

myCountDown.on('end', () => {
    console.log('计时结束');
});

myCountDown.on('end-soon', () => {
    console.log('计时将在2秒后结束');
});
```

这段代码将会输出：

```javascript
程序已经运行了 1 秒
程序已经运行了 2 秒
程序已经运行了 3 秒
计时将在2秒后结束
程序已经运行了 4 秒
程序已经运行了 5 秒
计时结束
```

### 扩展 EventEmitter

接下来通过扩展 `EventEmitter` 类来实现相同的功能。首先创建一个处理事件的 `CountDown` 类：

```javascript
const { EventEmitter } = require('events');

class CountDown extends EventEmitter {
    constructor(countdownTime) {
        super();
        this.countdownTime = countdownTime;
        this.currentTime = 0;
    }

    startTimer() {
        const timer = setInterval(() => {
            this.currentTime++;
            this.emit('update', this.currentTime);
    
            // 检查计时是否已经结束
            if (this.currentTime === this.countdownTime) {
                clearInterval(timer);
                this.emit('end');
            }
    
            // 检查计时是否会在 2 秒后结束
            if (this.currentTime === this.countdownTime - 2) {
                this.emit('end-soon');
            }
        }, 1000);
    }
}
```

可以在类的内部直接使用 `this.emit()`。另外 `startTimer()` 函数用于控制计时开始的时间。否则它将在创建对象后立即开始计时。

创建一个 `CountDown` 的新对象并订阅它：

```javascript
const myCountDown = new CountDown(5);

myCountDown.on('update', (t) => {
    console.log(`计时开始了 ${t} 秒`);
});

myCountDown.on('end', () => {
    console.log('计时结束');
});

myCountDown.on('end-soon', () => {
    console.log('计时将在2秒后结束');
});

myCountDown.startTimer();
```

运行程序会输出：

```javascript
程序已经运行了 1 秒
程序已经运行了 2 秒
程序已经运行了 3 秒
计时将在2秒后结束
程序已经运行了 4 秒
程序已经运行了 5 秒
计时结束
```

`on()` 函数的别名是 `addListener()`。看一下 `end-soon` 事件监听器：

```javascript
myCountDown.on('end-soon', () => {
    console.log('计时将在2秒后结束');
});
```

也可以用 `addListener()` 来完成相同的操作，例如：

```javascript
myCountDown.addListener('end-soon', () => {
    console.log('计时将在2秒后结束');
});
```

## EventEmitter的主要函数

### eventNames()

此函数将以数组形式返回所有活动的侦听器名称：

```javascript
const myCountDown = new CountDown(5);

myCountDown.on('update', (t) => {
    console.log(`程序已经运行了 ${t} 秒`);
});

myCountDown.on('end', () => {
    console.log('计时结束');
});

myCountDown.on('end-soon', () => {
    console.log('计时将在2秒后结束');
});

console.log(myCountDown.eventNames());
```

运行这段代码会输出：

```javascript
[ 'update', 'end', 'end-soon' ]
```

如果要订阅另一个事件，例如 `myCount.on('some-event', ...)`，则新事件也会添加到数组中。

这个方法不会返回已发布的事件，而是返回订阅的事件的列表。

### removeListener()

这个函数可以从 `EventEmitter` 中删除已订阅的监听器：

```javascript
const { EventEmitter } = require('events');

const emitter = new EventEmitter();

const f1 = () => {
    console.log('f1 被触发');
}

const f2 = () => {
    console.log('f2 被触发');
}

emitter.on('some-event', f1);
emitter.on('some-event', f2);

emitter.emit('some-event');

emitter.removeListener('some-event', f1);

emitter.emit('some-event');
```

在第一个事件触发后，由于 `f1` 和 `f2` 都处于活动状态，这两个函数都将被执行。之后从 `EventEmitter` 中删除了 `f1`。当再次发出事件时，将会只执行 `f2`：

```javascript
f1 被触发
f2 被触发
f2 被触发
```

An **alias** for `removeListener()` is `off()`. For example, we could have written:

`removeListener()` 的别名是 `off()`。例如可以这样写：

```javascript
emitter.off('some-event', f1);
```

### removeAllListeners()

该函数用于从 `EventEmitter` 的所有事件中删除所有侦听器：

```javascript
const { EventEmitter } = require('events');

const emitter = new EventEmitter();

const f1 = () => {
    console.log('f1 被触发');
}

const f2 = () => {
    console.log('f2 被触发');
}

emitter.on('some-event', f1);
emitter.on('some-event', f2);

emitter.emit('some-event');

emitter.removeAllListeners();

emitter.emit('some-event');
```

第一个 `emit()` 会同时触发 `f1` 和 `f2`，因为它们当时正处于活动状态。删除它们后，`emit()` 函数将发出事件，但没有侦听器对此作出响应：

```javascript
f1 被触发
f2 被触发
```

## 错误处理

如果要在 `EventEmitter` 发出错误，必须用 `error` 事件名来完成。这是 Node.js 中所有 `EventEmitter` 对象的标准配置。这个事件必须还要有一个 `Error` 对象。例如可以像这样发出错误事件：

```javascript
myEventEmitter.emit('error', new Error('出现了一些错误'));
```

`error` 事件的侦听器都应该有一个带有一个参数的回调，用来捕获 `Error` 对象并处理。如果 `EventEmitter` 发出了 `error` 事件，但是没有订阅者订阅 `error` 事件，那么 Node.js 程序将会抛出这个 `Error`。这会导致 Node.js 进程停止运行并退出程序，同时在控制台中显示这个错误的跟踪栈。

例如在 `CountDown` 类中，`countdownTime`参数的值不能小于 2，否则会无法触发 `end-soon` 事件。在这种情况下应该发出一个 `error` 事件：

```javascript
class CountDown extends EventEmitter {
    constructor(countdownTime) {
        super();

        if (countdownTimer < 2) {
            this.emit('error', new Error('countdownTimer 的值不能小于2'));
        }

        this.countdownTime = countdownTime;
        this.currentTime = 0;
    }

    // ...........
}
```

处理这个错误的方式与其他事件相同：

```javascript
myCountDown.on('error', (err) => {
    console.error('发生错误:', err);
});
```

始终对 `error` 事件进行监听是一种很专业的做法。

## 使用EventEmitter的原生模块

Node.js 中许多原生模块扩展了`EventEmitter` 类，因此它们本身就是事件发射器。

一个典型的例子是 `Stream` 类。官方文档指出：

> 流可以是可读的、可写的，或两者均可。所有流都是 `EventEmitter` 的实例。

先看一下经典的 Stream 用法：

```javascript
const fs = require('fs');
const writer = fs.createWriteStream('example.txt');

for (let i = 0; i < 100; i++) {
  writer.write(`hello, #${i}!\n`);
}

writer.on('finish', () => {
  console.log('All writes are now complete.');
});

writer.end('This is the end\n');
```

但是，在写操作和 `writer.end()` 调用之间，我们添加了一个侦听器。`Stream` 在完成后会发出一个 `finished` 事件。在发生错误时会发出 `error` 事件，把读取流通过管道传输到写入流时会发出 `pipe` 事件，从写入流中取消管道传输时，会发出 `unpipe` 事件。

另一个类是 `child_process` 类及其 `spawn()` 方法：

```javascript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

当  `child_process` 写入标准输出管道时，将会触发  `stdout` 的 `data` 事件。当输出流遇到错误时，将从 `stderr` 管道发送 `data` 事件。

最后，在进程退出后，将会触发 `close` 事件。

## 总结

事件驱动的体系结构使我们能够创建高内聚低耦合的系统。事件表示某个动作的结果，可以定义 1个或多个侦听器并对其做出反应。
