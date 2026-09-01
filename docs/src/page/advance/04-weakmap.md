# WeakMap

## 概念

`WeakMap`是一种键值对的集合，类似于`Map`。不过，`WeakMap`与`Map`有几个重要的区别：

- 在`WeakMap`中，只有对象可以作为键。换句话说，我们不能使用基本类型（如数字，字符串，布尔值等）作为`WeakMap`的键。
- `WeakMap`的键是弱引用的。这意味着，如果一个对象只被`WeakMap`引用，那么这个对象可以被垃圾回收（GC）。当这个对象被垃圾回收后，它对应的键值对也会从`WeakMap`中自动移除。
- `WeakMap`不可遍历，也就是说，我们不能使用像`for...of`这样的循环来遍历`WeakMap`。

由于这些特性，`WeakMap`在处理内存泄漏问题和管理对象私有数据等场景中有着显著的优势。

## 创建和使用

我们可以使用`new WeakMap()`来创建一个新的`WeakMap`。在创建了`WeakMap`之后，我们可以使用`set`方法来添加新的键值对，

使用`get`方法来获取某个键对应的值，使用`delete`方法来移除某个键及其对应的值，使用`has`方法来检查`WeakMap`中是否存在某个键。

```javascript
let weakMap = new WeakMap();

let obj1 = {};
let obj2 = {};

// 添加键值对
weakMap.set(obj1, 'Hello');
weakMap.set(obj2, 'World');

// 获取值
console.log(weakMap.get(obj1)); // 输出: 'Hello'
console.log(weakMap.get(obj2)); // 输出: 'World'

// 检查键是否存在
console.log(weakMap.has(obj1)); // 输出: true
console.log(weakMap.has(obj2)); // 输出: true

// 删除键值对
weakMap.delete(obj1);
console.log(weakMap.has(obj1)); // 输出: false
```

## 内存管理

`WeakMap`最重要的特性就是其键对对象的弱引用。这意味着，如果一个对象只被`WeakMap`引用，那么这个对象可以被垃圾回收。这样就可以防止因为长时间持有对象引用导致的内存泄漏。

例如，如果我们在`Map`中保存了一些对象的引用，即使这些对象在其他地方都已经不再使用，但是由于它们仍被`Map`引用，所以它们不能被垃圾回收，这就可能导致内存泄漏。然而，如果我们使用`WeakMap`来保存这些对象的引用，那么当这些对象在其他地方都不再使用时，它们就会被垃圾回收，从而防止了内存泄漏。

## 对象私有数据

`WeakMap`还常常被用来保存对象的私有数据。这是因为`WeakMap`的键不可遍历，所以我们可以利用这个特性来存储一些只有特定代码能够访问的数据。

例如，我们可以创建一个`WeakMap`，然后使用这个`WeakMap`来保存每个对象的私有数据，像这样：

```javascript
let privateData = new WeakMap();

function MyClass() {
  privateData.set(this, {
    secret: 'my secret data',
  });
}

MyClass.prototype.getSecret = function() {
  return privateData.get(this).secret;
};

let obj = new MyClass();
console.log(obj.getSecret()); // 输出: 'my secret data'
```

在这个例子中，我们创建了一个`MyClass`的类，每一个`MyClass`的实例都有一个私有数据`secret`。我们使用`WeakMap`来保存这个私有数据。这样，我们就可以在`MyClass`的方法中访问这个私有数据，但是其他的代码无法访问它。
