# Promise

JavaScript Promise（承诺）是一种处理异步操作的对象，引入Promise的目的是为了更优雅地处理回调地狱（Callback Hell）问题，使异步代码更清晰、可读、可维护。

## 结构

Promise 的基本结构如下：

```javascript
let myPromise = new Promise((resolve, reject) => {
    // 异步操作
    // 如果成功，调用 resolve
    // 如果失败，调用 reject
});

myPromise.then((result) => {
    // 处理成功的情况
}).catch((error) => {
    // 处理失败的情况
});
```

## 状态

promise 的状态是 promise实例对象中的一个属性 `[PromiseState]`

- **Pending（进行中）**: 初始状态，表示异步操作尚未完成。
- **Fulfilled（已完成）**: 异步操作成功完成，Promise 返回一个值。
- **Rejected（已失败）**: 异步操作失败，Promise 返回一个原因（错误信息）。

> 状态只能由 `Pending` 变为 `Fulfilled` 或由 `Pending` 变为 `Rejected` ，且状态改变之后不会在发生变化，会一直保持这个状态。

## 特点

Promise对象有以下两个特点：

- 对象的状态不受外界影响。

  Promise对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和rejected（已失败）。

  只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。

  这也是Promise这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

- 一旦状态改变，就不会再变，任何时候都可以得到这个结果。

  Promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected。

  只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。

  如果改变已经发生了，你再对Promise对象添加回调函数，也会立即得到这个结果。

  这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

## 属性

实例对象中的另一个属性 `[PromiseResult]`，保存着异步任务 [成功/失败] 的结果。

**resolve**：是一个函数，用于将Promise的状态从 `Pending`（进行中）变为 `Fulfilled`（已完成）。

在执行异步操作成功后，通过调用 `resolve` 来表示异步操作已经成功完成，并将结果传递给与之关联的 `.then` 方法。

```javascript
let myPromise = new Promise((resolve, reject) => {
    // 异步操作成功
    let result = "Operation completed successfully";
    resolve(result); // 将Promise状态变为Fulfilled，并将result传递给后续的.then方法
});

myPromise.then((result) => {
    console.log(result); // 在操作成功时执行
}).catch((error) => {
    console.error(error); // 在操作失败时执行
});
```

**reject**：是一个函数，用于将Promise的状态从 `Pending`（进行中）变为 `Rejected`（已失败）。

在执行异步操作失败时，通过调用 `reject` 来表示异步操作已经失败，并将错误信息传递给与之关联的 `.catch` 方法。

```javascript
let myPromise = new Promise((resolve, reject) => {
    // 异步操作失败
    let error = new Error("Operation failed");
    reject(error); // 将Promise状态变为Rejected，并将error传递给后续的.catch方法
});

myPromise.then((result) => {
    console.log(result); // 在操作成功时执行
}).catch((error) => {
    console.error(error); // 在操作失败时执行
});
```

`resolve` 和 `reject` 是Promise的执行器函数的两个回调函数，用于控制Promise的最终状态。`resolve` 用于将Promise状态变为已完成，而 `reject` 用于将Promise状态变为已失败。

这两个函数的调用将触发Promise状态的转变，从而触发与之关联的后续 `.then` 或 `.catch` 方法的执行。

## 流程

![An image](/img/javascript/async/02.png)

## Api

### 构造函数

`Promise(executor)`

- **executor 函数**：执行器 `(resolve, reject) => {}`
- **resolve 函数**：内部定义成功时调用的函数 `value => {}`
- **reject 函数**：内部定义失败时调用的函数 `reason => {}`

```javascript
let p = new Promise((resolve, reject) => {
    // 同步调用
    console.log(111);
});
console.log(222);

// 输出
// 111
// 222
```

> executor 会在 Promise 内部立即同步调用，异步操作在执行器中执行

### then

`Promise.prototype.then(onResolved, onRejected) => {}`

- **onResolved 函数**：成功的回调函数 `(value) => {}`
- **onRejected 函数**：失败的回调函数 `(reason) => {}`
- **返回值**：一个新的 promise 对象

```javascript
promise.then(value => {
    console.log(value);
}, reason => {
    console.log(reason);
})
```

> 指定用于得到成功 value 的成功回调和用于得到失败 reason 的失败回调

### catch

`Promise.prototype.catch(reason) => {}`

- **reason**：失败的数据或Promise对象
- **返回值**：一个新的 promise 对象

```javascript
promise
    .catch((error) => {
        // 处理任何一个步骤中的失败情况
    });
```

> 返回一个 失败的 promise 对象

### resolve

`Promise.resolve(value) => {}`

- **value**：成功的数据或 promise 对象
- **返回值**：一个新的 promise 对象

```javascript
// 如果传入的参数为 非 promise类型的对象，则返回的结果为成功的promise对象
let p1 = Promise.resolve(521);
console.log(p1)

// 如果传入的参数为 promise 对象，则参数的结果决定了 resolve 的结果
let p2 = Promise.resolve(new Promise((resolve, reject) => {
    resolve('ok');
}))

console.log(p2);

// 输出
// Promise { 521 }
// Promise { 'ok' }
```

### reject

`Promise.reject(reason) => {}`

- **reason**：失败的原因
- **返回值**：一个新的 promise 对象

```javascript
let p1 = Promise.reject(521)
let p2 = Promise.reject(new Promise((resolve, reject) => {
    resolve('ok')
}))
```

### all

`Promise.all(promises) => {}`

- **promises**：包含 n 个 promise 的数组
- **返回值**：一个新的 promise 对象

```javascript
let promise1 = asyncOperation1();
let promise2 = asyncOperation2();
let promise3 = asyncOperation3();

Promise.all([promise1, promise2, promise3])
    .then((results) => {
        // 处理所有异步操作成功的情况
    })
    .catch((error) => {
        // 处理任何一个异步操作失败的情况
    });
```

> 只有所有的 promise 都成功才成功，只要有一个失败了就直接失败

### race

`Promise.race(promises) => {}`

- **promises**：包含 n 个 promise 的数组
- **返回值**：一个新的 promise 对象

```javascript
let promise1 = asyncOperation1();
let promise2 = asyncOperation2();

Promise.race([promise1, promise2])
    .then((result) => {
        // 处理第一个解决的异步操作
    })
    .catch((error) => {
        // 处理第一个拒绝的异步操作
    });
```

> 一旦其中任何一个 Promise 解决或拒绝，它就会采用那个 Promise 的结果。

## 问题

1. 问题：如何改变 promise 的状态

    回答：

    ```javascript
    let p = new Promise((resolve, reject) => {
        // 1. resolve 函数
        resolve('ok') // pending ---> fulfilled
        // 2. reject 函数
        reject('err') // pending ---> rejected
        // 3. 抛出错误
        throw '出问题了';
    })
    ```

2. 问题：一个 promise 指定多个成功/失败回调函数，都会调用吗？

    回答：

    ```javascript
    let promise = new Promise((resolve, reject) => {
        resolve('Ok');
    })

    // 指定回调函数
    promise.then(res => {
        console.log(res);
    })

    promise.then(res => {
        alert(res);
    })
    ```

    > 当 promise 改变为对应状态时都会调用

3. 问题：改变 promise 状态 和 指定回调函数谁先谁后？

    回答：都有可能，正常情况下是先指定回调再改变状态，但也可以先改变状态再指定回调

    ```javascript
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            // 再改变状态
            resolve('Ok')
        }, 1000)
    })

    // 先指定回调
    promise.then(res => {
        // 但 res 结果的获得，必须要等异步执行结束，状态改变才能获取到
        console.log(res);
    })
    ```

    如何先改状态再指定回调？

    - 在执行器中直接调用 resolve() / reject()
    - 延迟更长时间才调用 then()

    ```javascript
    let promise = new Promise((resolve, reject) => {
        // 同步操作，直接先改变状态
        resolve('Ok');
    })

    // 再指定回调
    promise.then(res => {
        console.log(res);
    })
    ```

4. 问题：promise.then() 返回的新 promise 的结果状态由什么决定

    回答：由 then() 指定的回调函数执行

    ```javascript
    let promise = new Promise((resolve, reject) => {
        resolve('Ok');
    })

    promise.then(res => {
        console.log(res);
        // 1. 抛出错误
        // throw '出了问题'
        // 2. 返回结果非 promise 对象
        return 123;
        // 3. 返回结果是promise 对象
        return new Promise((resolve, reject) => {
            resolve('DDD');
        })
    })
    ```

    >如果抛出异常，新 promise 变为 rejected，reason 为 抛出的异常
    >
    >如果返回的是非 promise 的任意值，新 promise 变为 resolved， value为返回的值
    >
    >如果返回的是另一个新 promise，此 promise 的结果就会成为 新 promise 的结果

5. 问题：promise 如何串连多个操作任务？

    回答：

    - promise 的 then() 内部返回一个新的 promise，可以 .then() 进行链式调用
    - 通过 then 的链式调用串连 多个同步/异步任务

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

6. 问题：promise 异常穿透

    回答：

    - 当使用 promise 的 then 链式调用时，可以在最后指定失败的回调
    - 前面任何操作出了异常，都会传到最后失败的回调中处理

    ```javascript
    let promise = new Promise((resolve, reject) => {
        reject('Err');
    })

    let p = promise.then(res => {
        // console.log(111);    
        throw '失败了';
    }).then(value => {
        console.log(222);
    }).then(value => {
        console.log(333);
    }).catch(reason => {
        console.log(reason);
    })
    ```

7. 问题：中断 promise 链？

    回答：

    - 当使用 promise 的 then 链式调用时，在中间中断，不再调用后面的回调函数
    - 在回调函数中返回一个 pendding 状态的 promise 对象

    ```javascript
    let promise = new Promise((resolve, reject) => {
        resolve('Ok');
    })

    let p = promise.then(res => {
        console.log(111);    
        // 有且只有一个方式
        // 回调函数执行的前提是  在状态改完之后才能执行。
        // 这里返回的promise 状态是 pendding
        return new Promise(() => {});
    }).then(value => {
        console.log(222);
    }).then(value => {
        console.log(333);
    }).catch(reason => {
        console.log(reason);
    })
    ```
