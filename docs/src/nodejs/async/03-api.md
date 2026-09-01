# 非IO的异步API

## 介绍

尽管我们在介绍Node的时候，多数情况下都会提到异步I/O，但是Node中其实还存在一些与I/O无关的异步API，这一部分也值得略微关注一下，它们分别是`setTimeout()`、`setInterval()`、`setImmediate()`和`process.nextTick()`。

## 定时器

`setTimeout()`和`setInterval()`与浏览器中的API是一致的，**分别用于单次和多次定时执行任务**。它们的实现原理与异步I/O比较类似，只是不需要I/O线程池的参与。

调用`setTimeout()`或者`setInterval()`创建的定时器会被插入到定时器观察者内部的一个红黑树中。每次`Tick`执行时，会从该红黑树中迭代取出定时器对象，检查是否超过定时时间，如果超过，就形成一个事件，它的回调函数将立即执行。

![An image](/img/nodejs/async/10.png)

定时器的问题在于，它并非精确的（在容忍范围内）。尽管事件循环十分快，但是如果某一次循环占用的时间较多，那么下次循环时，它也许已经超时很久了。譬如通过`setTimeout()`设定一个任务在10毫秒后执行，但是在9毫秒后，有一个任务占用了5毫秒的CPU时间片，再次轮到定时器执行时，时间就已经过期4毫秒。

## process.nextTick()

在未了解`process.nextTick()`之前，很多人也许为了立即异步执行一个任务，会这样调用`setTimeout()`来达到所需的效果：

```javascript
setTimeout(function () { 
    // TODO
}, 0);
```

由于事件循环自身的特点，定时器的精确度不够。而事实上，采用定时器需要动用红黑树，创建定时器对象和迭代等操作，而`setTimeout(fn, 0)`的方式较为浪费性能。实际上，`process.nextTick()`方法的操作相对较为轻量，具体代码如下：

```javascript
process.nextTick = function(callback) { 
    // on the way out, don't bother. 
    // it won't get fired anyway 
    if (process._exiting) return; 
    if (tickDepth >= process.maxTickDepth) 
        maxTickWarn(); 
    var tock = { callback: callback }; 
    if (process.domain) tock.domain = process.domain; 
    nextTickQueue.push(tock); 
    if (nextTickQueue.length) { 
        process._needTickCallback(); 
    } 
};
```

每次调用`process.nextTick()`方法，只会将回调函数放入队列中，在下一轮Tick时取出执行。定时器中采用红黑树的操作时间复杂度为`O(lg(n))`，`nextTick()`的时间复杂度为`O(1)`。相较之下，`process.nextTick()`更高效。

## setImmediate()

`setImmediate()`方法与`process.nextTick()`方法十分类似，都是将回调函数延迟执行。

```javascript
process.nextTick(function () { 
    console.log('延迟执行'); 
}); 
console.log('正常执行');
// 输出
正常执行
延迟执行

setImmediate(function () { 
    console.log('延迟执行'); 
}); 
console.log('正常执行');
// 输出
正常执行
延迟执行
```

其结果完全一样，但是两者之间其实是有细微差别的。

```javascript
process.nextTick(function () { 
    console.log('nextTick延迟执行'); 
}); 
setImmediate(function () { 
    console.log('setImmediate延迟执行'); 
}); 
console.log('正常执行');
// 输出
正常执行
nextTick延迟执行
setImmediate延迟执行
```

从结果里可以看到，**`process.nextTick()`中的回调函数执行的优先级要高于`setImmediate()`。**这里的原因在于事件循环对观察者的检查是有先后顺序的，`process.nextTick()`属于idle观察者，`setImmediate()`属于check观察者。**在每一个轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者。**

在具体实现上，`process.nextTick()`的回调函数保存在一个数组中，`setImmediate()`的结果则是保存在链表中。

在行为上，`process.nextTick()`在每轮循环中会将数组中的回调函数全部执行完，而`setImmediate()`在每轮循环中执行链表中的一个回调函数。

```javascript
// 加入两个nextTick()的回调函数
process.nextTick(function () {
    console.log('nextTick延迟执行1');
});
process.nextTick(function () {
    console.log('nextTick延迟执行2');
});
// 加入两个setImmediate()的回调函数
setImmediate(function () {
    console.log('setImmediate延迟执行1');
    // 进入下次循环
    process.nextTick(function () {
        console.log('强势插入');
    });
});
setImmediate(function () {
    console.log('setImmediate延迟执行2');
});
console.log('正常执行');
// 输出
正常执行
nextTick延迟执行1
nextTick延迟执行2
setImmediate延迟执行1
强势插入
setImmediate延迟执行2
```

从执行结果上可以看出，当第一个`setImmediate()`的回调函数执行后，并没有立即执行第二个，而是进入了下一轮循环，再次按`process.nextTick()`优先、`setImmediate()`次后的顺序执行。之所以这样设计，是为了保证每轮循环能够较快地执行结束，防止CPU占用过多而阻塞后续I/O调用的情况。
