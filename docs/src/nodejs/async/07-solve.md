# 异步编程解决方案

## 事件发布/订阅模式

事件监听器模式是一种广泛用于异步编程的模式，是回调函数的事件化，又称发布/订阅模式。

Node自身提供的events模块是发布/订阅模式的一个简单实现，它具有 `addListener/on()` 、 `once()` 、 `removeListener()`、`removeAllListeners()`和`emit()`等基本的事件监听模式的方法实现。

```javascript
const EventEmitter = require('events');
let emitter = new EventEmitter();

// 订阅
emitter.on("event1", function (message) {
    console.log(message);
});

// 发布
emitter.emit('event1', "I am message!");
```

订阅事件就是一个高阶函数的应用。事件发布/订阅模式可以实现一个事件与多个回调函数的关联，这些回调函数又称为事件侦听器。

通过`emit()`发布事件后，消息会立即传递给当前事件的所有侦听器执行。侦听器可以很灵活地添加和删除，使得事件和具体处理逻辑之间可以很轻松地关联和解耦。

事件侦听器模式也是一种钩子（hook）机制，利用钩子导出内部数据或状态给外部的调用者。

Node中的很多对象大多具有黑盒的特点，功能点较少，如果不通过事件钩子的形式，我们就无法获取对象在运行期间的中间值或内部状态。这种通过事件钩子的方式，可以使编程者不用关注组件是如何启动和执行的，只需关注在需要的事件点上即可。

```javascript
var options = {
    host: 'www.google.com',
    port: 80,
    path: '/upload',
    method: 'POST'
};
var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
    res.on('end', function () {
        // TODO 
    });
});
req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});
// write data to request body 
req.write('data\n');
req.write('data\n');
req.end();
```

这段HTTP请求的代码中，程序员只需要将视线放在`error`、`data`、`end`这些业务事件点上即可，至于内部的流程如何，无需过于关注。

Node对事件发布/订阅的机制做了一些额外的处理，这大多是基于健壮性而考虑的。

- 如果对一个事件添加了超过10个侦听器，将会得到一条警告。这一处设计与Node自身单线程运行有关，设计者认为侦听器太多可能导致内存泄漏，所以存在这样一条警告。调用`emitter.setMaxListeners(0)；`可以将这个限制去掉。另一方面，由于事件发布会引起一系列侦听器执行，如果事件相关的侦听器过多，可能存在过多占用CPU的情景。

- 为了处理异常，`EventEmitter`对象对error事件进行了特殊对待。如果运行期间的错误触发了error事件，`EventEmitter`会检查是否有对error事件添加过侦听器。如果添加了这个错误将会交由该侦听器处理，否则这个错误将会作为异常抛出。如果外部没有捕获这个异常，将会引起线程退出。一个健壮的`EventEmitter`实例应该对error事件做处理。

### 继承**events**模块

实现一个继承`EventEmitter`的类是十分简单的。

```javascript
const events = require('events');
const util = require('util');

function Stream() {
    events.EventEmitter.call(this);
}
// util.inherits是一个方法，它用于创建一个新函数，该函数继承了父函数的原型属性和方法。
// Stream对象继承了EventEmitter的属性和方法。这使得Stream对象可以像EventEmitter一样使用。
util.inherits(Stream, events.EventEmitter);

let emitter = new Stream();
// 订阅
emitter.on("event1", function (message) {
    console.log(message);
});

// 发布
emitter.emit('event1', "I am message!");
```

Node在`util`模块中封装了继承的方法，所以此处可以很便利地调用。开发者可以通过这样的方式轻松继承`EventEmitter`类，利用事件机制解决业务问题。

### 利用事件队列解决雪崩问题

在事件订阅/发布模式中，通常也有一个`once()`方法，通过它添加的侦听器只能执行一次，在执行之后就会将它与事件的关联移除。这个特性常常可以帮助我们过滤一些重复性的事件响应。

在计算机中，缓存由于存放在内存中，访问速度十分快，常常用于加速数据访问，让绝大多数的请求不必重复去做一些低效的数据读取。

**雪崩问题，就是在高访问量、大并发量的情况下缓存失效的情景，此时大量的请求同时涌入数据库中，数据库无法同时承受如此大的查询请求，进而往前影响到网站整体的响应速度。**

```javascript
var select = function (callback) {
    db.select("SQL", function (results) {
        callback(results);
    });
};
```

这是一条数据库查询语句的调用，如果站点刚好启动，**这时缓存中是不存在数据的**，而如果访问量巨大，同一句SQL会被发送

到数据库中反复查询，会影响服务的整体性能。

一种改进方案是添加一个状态锁。

```javascript
var status = "ready";
var select = function (callback) {
    if (status === "ready") {
        status = "pending";
        db.select("SQL", function (results) {
            status = "ready";
            callback(results);
        });
    }
};
```

在这种情景下，连续地多次调用select()时，只有第一次调用是生效的，后续的select()是没有数据服务的，这个时候可以引入事件队列。

```javascript
var proxy = new events.EventEmitter();
var status = "ready";
var select = function (callback) {
    proxy.once("selected", callback);
    if (status === "ready") {
        status = "pending";
        db.select("SQL", function (results) {
            proxy.emit("selected", results);
            status = "ready";
        });
    }
};
```

利用了once()方法，将所有请求的回调都压入事件队列中，利用其执行一次就会将监视器移除的特点，保证每一个回调只会被执行一次。对于相同的SQL语句，保证在同一个查询开始到结束的过程中永远只有一次。SQL在进行查询时，新到来的相同调用只需在队列中等待数据就绪即可，一旦查询结束，得到的结果可以被这些调用共同使用。这种方式能节省重复的数据库调用产生的开销。由于Node单线程执行的原因，此处无须担心状态同步问题。

这种方式其实也可以应用到其他远程调用的场景中，即使外部没有缓存策略，也能有效节省重复开销。此处可能因为存在侦听器过多引发的警告，需要调用setMaxListeners(0)移除掉警告，或者设更大的警告阈值。
