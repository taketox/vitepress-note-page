# WeakSet

## 概念

`WeakSet`也是一种集合，类似于`Set`。`WeakSet`与`Set`的主要区别包括：

- 在`WeakSet`中，只有对象可以作为值。也就是说，我们不能将基本类型（如数字，字符串，布尔值等）添加到`WeakSet`中。
- `WeakSet`中的对象是弱引用的。如果一个对象只被`WeakSet`引用，那么这个对象可以被垃圾回收。当这个对象被垃圾回收后，它会自动从`WeakSet`中移除。
- `WeakSet`不可遍历，也就是说，我们不能使用像`for...of`这样的循环来遍历`WeakSet`。

`WeakSet`在处理对象的唯一性、内存泄漏等问题上有其独特的应用。

## 创建和使用

我们可以使用`new WeakSet()`来创建一个新的`WeakSet`。在创建了`WeakSet`之后，我们可以使用`add`方法来添加新的对象，使用`delete`方法来移除某个对象，使用`has`方法来检查`WeakSet`中是否存在某个对象。

```javascript
let weakSet = new WeakSet();

let obj1 = {};
let obj2 = {};

// 添加对象
weakSet.add(obj1);
weakSet.add(obj2);

// 检查对象是否存在
console.log(weakSet.has(obj1)); // 输出: true
console.log(weakSet.has(obj2)); // 输出: true

// 删除对象
weakSet.delete(obj1);
console.log(weakSet.has(obj1)); // 输出: false
```

## 对象唯一性

`WeakSet`可以用来检查一个对象是否已经存在。由于`WeakSet`中的每个对象都是唯一的，所以我们可以利用这个特性来确保我们不会添加重复的对象。

例如，我们可以创建一个`WeakSet`，然后使用这个`WeakSet`来保存所有我们已经处理过的对象，像这样：

```javascript
let processedObjects = new WeakSet();

function processObject(obj) {
  if (!processedObjects.has(obj)) {
    // 处理对象
    // ...

    // 将对象添加到WeakSet中，表示我们已经处理过这个对象
    processedObjects.add(obj);
  }
}
```

在这个例子中，我们在每次处理一个对象之前，都会检查这个对象是否已经被处理过。如果这个对象已经被处理过，我们就不会再处理它。这样，我们就可以确保我们不会重复处理同一个对象。

## 内存管理

与`WeakMap`一样，`WeakSet`中的对象也是弱引用的，所以`WeakSet`也有优秀的内存管理特性。如果一个对象只被`WeakSet`引用，那么这个对象可以被垃圾回收。这样就可以防止因为长时间持有对象引用导致的内存泄漏。

例如，如果我们在`Set`中保存了一些对象的引用，即使这些对象在其他地方都已经不再使用，但是由于它们仍被`Set`引用，所以它们不能被垃圾回收，这就可能导致内存泄漏。然而，如果我们使用`WeakSet`来保存这些对象的引用，那么当这些对象在其他地方都不再使用时，它们就会被垃圾回收，从而防止了内存泄漏。
