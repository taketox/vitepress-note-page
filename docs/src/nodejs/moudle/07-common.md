# 前后端共用模块

JavaScript在Node出现之后，比别的编程语言多了一项优势，那就是一些模块可以在前后端实现共用，这是因为很多API在各个宿主环境下都提供。但是在实际情况中，前后端的环境是略有差别的。

## 模块的侧重点

前后端JavaScript分别搁置在HTTP的两端，它们扮演的角色并不同。浏览器端的JavaScript需要经历从同一个服务器端分发到多个客户端执行，而服务器端JavaScript则是相同的代码需要多次执行。前者的瓶颈在于带宽，后者的瓶颈则在于CPU和内存等资源。前者需要通过网络加载代码，后者从磁盘中加载，两者的加载速度不在一个数量级上。

纵观Node的模块引入过程，几乎全都是同步的。尽管与Node强调异步的行为有些相反，但它是合理的。但是如果前端模块也采用同步的方式来引入，那将会在用户体验上造成很大的问题。UI在初始化过程中需要花费很多时间来等待脚本加载完成。

鉴于网络的原因，`CommonJS`为后端JavaScript制定的规范并不完全适合前端的应用场景。经过一段争执之后，AMD规范最终在前端应用场景中胜出。它的全称是Asynchronous Module Definition，即是“异步模块定义”。除此之外，还有玉伯定义的CMD规范。

## AMD规范

AMD规范是`CommonJS`模块规范的一个延伸，它的模块定义如下：

```javascript
define(id?, dependencies?, factory);
```

它的模块id和依赖是可选的，与Node模块相似的地方在于factory的内容就是实际代码的内容。下面的代码定义了一个简单的模块：

```javascript
define(function() { 
    var exports = {}; 
    exports.sayHello = function() { 
    	alert('Hello from module: ' + module.id); 
	}; 
	return exports; 
});
```

不同之处在于AMD模块需要用define来明确定义一个模块，而在Node实现中是隐式包装的，它们的目的是进行作用域隔离，仅在需要的时候被引入，避免掉过去那种通过全局变量或者全局命名空间的方式，以免变量污染和不小心被修改。另一个区别则是内容需要通过返回的方式实现导出。

## CMD规范

CMD规范由国内的玉伯提出，与AMD规范的主要区别在于定义模块和依赖引入的部分。AMD需要在声明模块的时候指定所有的依赖，通过形参传递依赖到模块内容中：

```javascript
define(['dep1', 'dep2'], function (dep1, dep2) { 
	return function () {}; 
});
```

与AMD模块规范相比，CMD模块更接近于Node对`CommonJS`规范的定义：

```javascript
define(factory);
```

在依赖部分，CMD支持动态引入，示例如下：

```javascript
define(function(require, exports, module) { 
	// The module code goes here 
});
```

require、exports和module通过形参传递给模块，在需要依赖模块时，随时调用require()引入即可。

## 兼容多种模块规范

为了让同一个模块可以运行在前后端，在写作过程中需要考虑兼容前端也实现了模块规范的环境。为了保持前后端的一致性，类库开发者需要将类库代码包装在一个闭包内。以下代码演示如何将hello()方法定义到不同的运行环境中，它能够兼容Node、AMD、CMD以及常见的浏览器环境中：

```javascript
(function (name, definition) { 
    // 检测上下文环境是否为AMD或CMD
    var hasDefine = typeof define === 'function', 
    // 检查上下文环境是否为Node
    hasExports = typeof module !== 'undefined' && module.exports; 
    if (hasDefine) { 
        // AMD环境或CMD环境
        define(definition); 
    } else if (hasExports) { 
        // 定义为普通Node模块
        module.exports = definition(); 
    } else { 
        // 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
        this[name] = definition(); 
    } 
})('hello', function () { 
    var hello = function () {}; 
    return hello; 
});
```
