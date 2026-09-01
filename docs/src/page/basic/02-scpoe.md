# 作用域

在 JavaScript 中，作用域是指变量在代码中可访问的范围。

## 词法作用域

### 概念

词法作用域是 JavaScript 中最常见的作用域类型。它是在代码编写阶段确定的，而不是在代码执行阶段确定的。

在词法作用域中，变量的访问权限是由它们在代码中的位置决定的。

### 示例

```javascript
function outer() {
    var outerVariable = "Hello";
    function inner() {
        var innerVariable = "World";
        console.log(outerVariable + " " + innerVariable);
    }
    inner();
}
outer(); // 输出: Hello World
```

>函数 `inner` 内部可以访问外部函数 `outer` 中定义的变量 `outerVariable`，这是因为它们处于词法作用域中。

### 应用场景

词法作用域在 JavaScript 中有广泛的应用场景，包括：

- 变量访问控制：词法作用域使得我们可以控制变量的可见性和访问权限，避免命名冲突和变量污染。
- 模块化开发：通过使用函数和闭包，可以实现模块化的代码组织，将变量和函数封装在私有作用域中，提供了良好的封装性和代码组织性。
- 函数嵌套：函数嵌套是 JavaScript 中常见的编程模式，词法作用域确保了内部函数可以访问外部函数的变量，实现了信息的隐藏和封装。

## 作用域链

### 概念

作用域链是 JavaScript 中用于查找变量的一种机制。它由当前作用域和所有父级作用域的变量对象组成。

当访问一个变量时，JavaScript 引擎会首先在当前作用域的变量对象中查找，如果找不到，则沿着作用域链向上查找，直到找到变量或者到达全局作用域。

### 示例

```javascript
var globalVariable = "Global";
function outer() {
    var outerVariable = "Hello";
    function inner() {
        var innerVariable = "World";
        console.log(globalVariable + " " + outerVariable + " " + innerVariable);
    }
    inner();
}
outer(); // 输出: Global Hello World
```

>函数 `inner` 内部可以访问全局作用域中定义的变量 `globalVariable`，以及外部函数 `outer` 中定义的变量 `outerVariable`，这是因为 JavaScript 引擎按照作用域链的顺序查找变量。

### 应用场景

作用域链在 JavaScript 中有多种应用场景，包括：

- 变量查找：作用域链决定了变量的查找顺序，使得 JavaScript 可以正确地找到并访问变量。
- 闭包：通过创建闭包，内部函数可以访问外部函数的变量，实现了信息的保留和共享。
- 模块化开发：作用域链的特性使得我们可以实现模块化的代码组织，将变量和函数封装在私有作用域中，提供了良好的封装性和代码组织性。

## 闭包

### 概念

闭包是指函数和其词法环境的组合。它可以访问其词法作用域中定义的变量，即使在函数外部也可以访问这些变量。

闭包在 JavaScript 中常用于创建私有变量和实现模块化开发。

### 示例

```javascript
function createCounter() {
    var count = 0;
    return function () {
        count++;
        console.log(count);
    };
}
var counter = createCounter(); 
counter(); // 输出: 1
counter(); // 输出: 2
```

>函数 `createCounter` 返回一个内部函数，该内部函数引用了外部函数 `createCounter` 的变量 `count`。即使在外部函数执行完毕后，内部函数依然可以访问并修改变量 `count`，这就是闭包的特性。

### 应用场景

闭包在 JavaScript 中有多种应用场景，包括：

- 私有变量：闭包提供了一种实现私有变量的机制，可以隐藏变量并提供访问控制。
- 模块化开发：通过创建闭包，可以实现模块化的代码组织，将变量和函数封装在私有作用域中，提供了良好的封装性和代码组织性。
- 延迟执行：通过使用闭包，可以延迟执行函数，实现异步操作和事件处理。
