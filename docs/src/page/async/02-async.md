# 异步与回调

## 异步的概念

异步（Asynchronous, async）是与同步（Synchronous, sync）相对的概念。

在我们学习的传统单线程编程中，程序的运行是同步的（同步不意味着所有步骤同时运行，而是指步骤在一个控制流序列中按顺序执行）。而异步的概念则是不保证同步的概念，也就是说，一个异步过程的执行将不再与原有的序列有顺序关系。

简单来理解就是：同步按你的代码顺序执行，异步不按照代码顺序执行，异步的执行效率更高。

以上是关于异步的概念的解释，接下来我们通俗地解释一下异步：异步就是从主线程发射一个子线程来完成任务。

![An image](/img/javascript/async/01.png)

## 回调函数

在JavaScript中，回调函数（Callback Function）是一种特殊的函数，它作为参数传递给另一个函数，并且在某个特定的事件发生或者异步操作完成时被调用。回调函数是一种常见的处理异步代码的方式，用于在异步操作完成后执行特定的逻辑。

回调函数就是一个函数，它是在我们启动一个异步任务的时候就告诉它：等你完成了这个任务之后要干什么。

这样一来主线程几乎不用关心异步任务的状态了，他自己会善始善终。

```javascript
function getMsg(callback) {
    setTimeout(() => {
        let a = '异步函数结果'
        callback(a)
    }, 2000)
}

getMsg((result) => {
    console.log(result); // 异步函数结果
})
```

> 自己定义函数让别人去调用，使用回调函数可以获取异步执行结果

回调函数在处理事件、处理异步操作、实现非阻塞操作等场景中非常常见。它们允许程序在等待某些操作完成的同时执行其他任务，以提高程序的效率和响应性。在JavaScript中，回调函数通常作为函数参数传递，也可以被定义为匿名函数。

## 异步执行顺序

异步代码执行区的异步函数执行完成，将要执行专属的回调函数时，就会将回调函数放入回调函数队列，等同步代码执行区的代码执行完成后，就把回调函数队列的回调函数加入同步代码执行区。

```javascript
console.log('代码开始执行');

setTimeout(() => {
    console.log('2秒后执行的代码');
}, 2000);

setTimeout(() => {
    console.log('0秒后执行的代码');
}, 0)

console.log('代码结束执行')
```

执行结果

```tex
代码开始执行
代码结束执行
0秒后执行的代码
2秒后执行的代码
```

## 回调地狱

回调地狱（Callback Hell）是指在JavaScript中，特别是在处理异步操作时，嵌套过多的回调函数导致代码变得难以阅读和维护的情况。

这通常发生在多个异步操作需要按照一定的顺序执行时，每个操作都需要在前一个操作完成后进行处理。

由于JavaScript是单线程执行的，因此采用异步回调函数是一种常见的处理方式，但如果不小心处理，就容易形成回调地狱。

例如：读取文件操作，使用 `fs` 的读取文件操作是异步的，要按照顺序读取的话就不能写成同步代码的形式

```javascript
const fs = require('fs')

fs.readFile('a.txt', (err, data) => {
    console.log('第一个执行', data);
    fs.readFile('b.txt', (err, data) => {
        console.log('第二个执行', data);
        fs.readFile('c.txt', (err, data) => {
            console.log(data);
        })
    })
})
```

> 只能这么嵌套着写，连续嵌套着的回调函数可读性非常差。

为了解决回调地狱的问题，出现了一些解决方案，其中最常见的是使用 `Promise` 和 `async/await`。这两者都是为了更清晰地处理异步代码而引入的特性，可以避免深层次的回调嵌套。

## Promise

在JavaScript中，Promise是一种用于处理异步操作的对象。它代表一个尚未完成但预计将在未来完成的操作，或者一个异步操作的最终结果。

```javascript
let myPromise = new Promise((resolve, reject) => {
    // 异步操作，例如网络请求
    let success = true;

    if (success) {
        resolve("操作成功");
    } else {
        reject("操作失败");
    }
});

// 使用Promise
myPromise
    .then((result) => {
        console.log(result); // 在操作成功时执行
    })
    .catch((error) => {
        console.error(error); // 在操作失败时执行
    });
```

在这个例子中，`myPromise`是一个Promise对象，通过传递一个带有`resolve`和`reject`参数的函数，来表示异步操作的开始。`.then`方法用于处理操作成功的情况，而`.catch`方法用于处理操作失败的情况。

这种结构使得代码更清晰，易于理解，并且能够有效地处理异步操作。

### 解决回调地狱问题

使用 Promise 按顺序读取文件

```javascript
const fs = require('fs')

let p1 = new Promise((resolve, reject) => {
    fs.readFile('a.txt', 'utf-8', (err, data) => {
        resolve(data)
    })
})

let p2 = new Promise((resolve, reject) => {
    fs.readFile('b.txt', 'utf-8', (err, data) => {
        resolve(data)
    })
})

let p3 = new Promise((resolve, reject) => {
    fs.readFile('c.txt', 'utf-8', (err, data) => {
        resolve(data)
    })
})

p1.then(r1 => {
    console.log(r1);
    return p2;
}).then(r2 => {
    console.log(r2);
    return p3;
}).then(r3 => {
    console.log(r3);
})
```

## Promise示例

### 读取文件

```javascript
// 不使用 promise
const fs = require('fs');

fs.readFile('./test.txt', (err, data) => {
    // 出错，抛出错误
    if (err) throw err;
    console.log(data.toString());
})

// 使用 Promise 包裹
let promise = new Promise((resolve, reject) => {
    fs.readFile('./test.txt', (err, data) => {
        if (err) reject(err);
        resolve(data.toString());
    })
})

// 调用 promise 封装的异步函数
promise.then(result => {
    console.log(result);
})
```

### AJAX请求

```javascript
// 原生
const btn = document.querySelector('#btn');
btn.addEventListener("click", () => {
    // 创建对象
    const xhr = new XMLHttpRequest();
    // 初始化
    xhr.open('GET', 'https://api.apiopen.top/getJoke');
    // 发送
    xhr.send();
    // 处理响应结果
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // 判断响应状态码
            if (xhr.status >= 200 && xhr.status < 300) {
                // 控制台输出响应体
                console.log(xhr.response);
            } else {
                // 控制台输出状态码
                console.log(xhr.status);
            }
        }
    }
})

// promise 封装
btn.addEventListener("click", () => {
    // 创建 Promise
    const promise = new Promise((resolve, reject) => {
        // 创建对象
        const xhr = new XMLHttpRequest();
        // 初始化
        xhr.open('GET', 'https://api.apiopen.top/getJoke');
        // 发送
        xhr.send();
        // 处理响应结果
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // 判断响应状态码
                if (xhr.status >= 200 && xhr.status < 300) {
                    // 控制台输出响应体
                    resolve(xhr.response);
                } else {
                    // 控制台输出状态码
                    reject(xhr.status);
                }
            }
        }
    })

    promise.then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    })
})
```

### 封装AJAX

```javascript
/** 
 * 封装一个函数 sendAJAX 发送 GET AJAX 请求
 * 参数 URL
 * 返回结果 Promise 对象
 **/

function sendAJAX(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        // 处理结果
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.status)
                }
            }
        }
    })
}

sendAJAX('https://api.apiopen.top/getJoke').then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
})
```

### 风格转化

在NodeJS环境下

```javascript
const util = require('util');

const fs = require('fs');
// 返回一个新的函数
// 这个函数的返回结果是promise 对象
let mineReadFile = util.promisify(fs.readFile);

mineReadFile('./test.txt').then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
})
```
