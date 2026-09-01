# 对象

在 JavaScript 中，对象是一种非常重要的数据类型，它允许我们以键值对的形式组织和存储数据。

对象提供了丰富的属性和方法，使得我们能够创建、操作和管理复杂的数据结构。

## 属性

JavaScript 对象的属性是以键值对的形式存储的。对象属性可以是任意类型的值，包括基本数据类型（如字符串、数字、布尔值）和其他对象。

### 访问属性

我们可以使用点符号或方括号来访问对象的属性。

```javascript
const person = {
    name: 'John',
    age: 25,
};
console.log(person.name); // 输出: John
console.log(person['age']); // 输出: 25
```

### 修改属性

可以通过赋值运算符来修改对象的属性值。

```javascript
person.age = 30;
console.log(person.age); // 输出: 30
```

### 删除属性

可以使用 `delete` 关键字来删除对象的属性。

```javascript
delete person.age;
console.log(person.age); // 输出: undefined
```

### 动态添加属性

JavaScript 对象是动态的，意味着我们可以在运行时动态添加新的属性。

```javascript
person.address = '123 Main Street';
console.log(person.address); // 输出: 123 Main Street
```

### 属性枚举

JavaScript 对象的属性默认可枚举，即可以通过 `for...in` 循环遍历对象的属性。可以使

用 `Object.defineProperty()` 方法来定义不可枚举的属性。

```javascript
const car = {
    brand: 'Toyota',
    model: 'Camry',
};
Object.defineProperty(car, 'color', {
    value: 'blue',
    enumerable: false, // 不可枚举
});
for (let key in car) {
    console.log(key); // 输出: brand, model
}
```

>使用 `Object.defineProperty()` 定义了一个不可枚举的 `color` 属性，因此在 `for...in` 循环中不会被遍历到。

### 属性描述符

每个属性都有一个与之关联的属性描述符，描述了属性的各种特性。

可以使用 `Object.getOwnPropertyDescriptor()` 方法获取属性的描述符。

```javascript
const descriptor = Object.getOwnPropertyDescriptor(person, 'name');
console.log(descriptor);
// 输出: { value: 'John', writable: true, enumerable: true, configurable: true }
```

> - `value`：对象的值
> - `writable`：是否可以被重新赋值
> - `enumerable`：是否可以被枚举
> - `configurable`：是否可以被新增或删除属性

## API

JavaScript 对象提供了许多常用的 API，用于操作和管理对象的属性和行为。

### keys

返回一个包含对象所有可枚举属性的数组。

```javascript
const person = {
    name: 'John',
    age: 25,
};
const keys = Object.keys(person);
console.log(keys); // 输出: ['name', 'age']
```

### values

返回一个包含对象所有可枚举属性值的数组。

```javascript
const person = {
    name: 'John',
    age: 25,
};
const values = Object.values(person);
console.log(values); // 输出: ['John', 25]
```

### entries

返回一个包含对象所有可枚举属性键值对的数组。

```javascript
const person = {
    name: 'John',
    age: 25,
};
const entries = Object.entries(person);
console.log(entries);// 输出: [['name', 'John'], ['age', 25]]
```

### assign

将一个或多个源对象的属性复制到目标对象中。

```javascript
const target = {
    name: 'John',
};
const source = {
    age: 25,
};
Object.assign(target, source);
console.log(target); // 输出: { name: 'John', age: 25 }
```

### freeze

冻结一个对象，使其属性不可修改。

```javascript
const person = {
    name: 'John',
};
Object.freeze(person);
person.age = 25; // 操作无效，没有修改属性的权限
console.log(person); // 输出: { name: 'John' }
```

### toSting

将对象转换为字符串。

toString()方法的默认实现返回`[object Object]`，这对于大多数对象来说并不是非常有用。

可以通过重写对象的 toString()方法来自定义对象转换为字符串的行为

```javascript
let person = {
    name: "John",
    age: 25,
    toString() {
        return this.name + " - " + this.age;
    }
};
let str = person.toString();
console.log(str); // 输出: "John - 25"
```

### valueOf

返回指定对象的原始值。

大多数对象的默认 valueOf()方法的行为通常并不有用。

可以通过重写对象的 valueOf()方法来自定义对象转换为数字的行为。

```javascript
let counter = {
    value: 0,
    valueOf() {
        return this.value++;
    }
};
let num = counter.valueOf();
console.log(num); // 输出: 0
console.log(counter.value); // 输出: 1
```

>这里重写了 counter 对象的 valueOf()方法，使其每次调用时返回一个递增的值

## 应用场景

JavaScript 对象在前端开发中有广泛的应用场景，包括但不限于以下几个方面：

- 数据存储和操作：对象允许我们以键值对的形式存储和操作数据，非常适合表示复杂的数据结构。
- 面向对象编程：对象是面向对象编程的核心概念，允许我们创建和管理对象的行为和属性。
- DOM 操作：在前端开发中，我们经常需要操作网页的 DOM 元素，使用对象可以更方便地访问和操作 DOM。
- 数据交互和传输：在与后端进行数据交互时，常常使用对象来传输和接收数据，例如通过 AJAX 请求返回的 JSON 数据。
