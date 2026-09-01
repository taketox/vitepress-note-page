# 函数式编程

在JavaScript中，函数（function）作为一等公民，使用上非常自由，无论调用它，或者作为参数，或者作为返回值均可。

## 高阶函数

在通常的语言中，函数的参数只接受基本的数据类型或是对象引用，返回值也只是基本数据类型和对象引用。

```javascript
function foo(x) { 
    return x; 
}
```

**高阶函数则是可以把函数作为参数，或是将函数作为返回值的函数。**

```javascript
function foo(x) { 
    return function () { 
        return x; 
    }; 
}
```

高阶函数可以将函数作为输入或返回值的变化看起来虽细小，但是对于C/C++语言而言，通过指针也可以达到相同的效果。但对于程序编写，高阶函数则比普通的函数要灵活许多。除了通常意义的函数调用返回外，还形成了一种后续传递风格（Continuation Passing Style）的结果接收方式，而非单一的返回值形式。

```javascript
function foo(x, bar) { 
    return bar(x); 
}
```

**对于相同的foo()函数，传入的bar参数不同，则可以得到不同的结果。**

一个经典的例子便是数组的sort()方法，它是一个货真价实的高阶函数，可以接受一个方法作为参数参与运算排序：

```javascript
var points = [40, 100, 1, 5, 25, 10]; 
points.sort(function(a, b) { 
    return a - b; 
}); 
// 输出
[ 1, 5, 10, 25, 40, 100 ]
```

通过改动sort()方法的参数，可以决定不同的排序方式，从这里可以看出高阶函数的灵活性来。结合Node提供的最基本的事件模块可以看到，事件的处理方式正是基于高阶函数的特性来完成的。在自定义事件实例中，通过为相同事件注册不同的回调函数，可以很灵活地处理业务逻辑。

```javascript
var emitter = new events.EventEmitter(); 
emitter.on('event_foo', function () { 
    // TODO
});
```

高阶函数在JavaScript中比比皆是，其中ECMAScript5中提供的一些数组方法（`forEach()`、`map()`、`reduce()`、`reduceRight()`、`filter()`、`every()`、`some()`）十分典型。

### 偏函数用法

偏函数用法是指**创建一个调用另外一个部分——参数或变量已经预置的函数——的函数的用法**。

```javascript
var toString = Object.prototype.toString; 

var isString = function (obj) { 
    return toString.call(obj) == '[object String]'; 
}; 
var isFunction = function (obj) { 
    return toString.call(obj) == '[object Function]'; 
};
```

在JavaScript中进行类型判断时，我们通常会进行类似上述代码的方法定义。这段代码固然不复杂，只有两个函数的定义，但是里面存在的问题是我们需要重复去定义一些相似的函数，如果有更多的`isXXX()`，就会出现更多的冗余代码。

为了解决重复定义的问题，我们引入一个新函数，这个新函数可以如工厂一样批量创建一些类似的函数。在下面的代码中，我们通过`isType()`函数预先指定type的值，然后返回一个新的函数：

```javascript
var isType = function (type) { 
    return function (obj) { 
        return toString.call(obj) == '[object ' + type + ']'; 
    }; 
}; 
var isString = isType('String'); 
var isFunction = isType('Function');
```

可以看出，引入`isType()`函数后，创建`isString()`、`isFunction()`函数就变得简单多了。这种通过指定部分参数来产生一个新的定制函数的形式就是偏函数。

偏函数应用在异步编程中也十分常见，著名类库Underscore提供的after()方法即是偏函数应用，其定义如下：

```javascript
_.after = function(times, func) { 
    if (times <= 0) return func(); 
    return function() { 
        if (--times < 1) { return func.apply(this, arguments); } 
    }; 
};
```

这个函数可以根据传入的times参数和具体方法，生成一个需要调用多次才真正执行实际函数的函数。
