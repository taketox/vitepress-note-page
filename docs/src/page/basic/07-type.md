# 数据类型

## 基础类型

### Number

数字（Number）：表示数值，可以包含整数和浮点数。

数值最常见的整数类型格式则为十进制，还可以设置八进制（零开头）、十六进制（0x开头）

```javascript
let intNum = 55 // 10进制的55
let num1 = 070 // 8进制的56
let hexNum1 = 0xA //16进制的10
```

浮点类型则在数值汇总必须包含小数点，还可通过科学计数法表示

```javascript
let floatNum1 = 1.1;
let floatNum2 = 0.1;
let floatNum3 = .1; // 有效，但不推荐
let floatNum = 3.125e7; // 等于 31250000
```

在数值类型中，存在一个特殊数值`NaN`，意为“不是数值”，用于表示本来要返回数值的操作失败了（而不是抛出错误）

```javascript
console.log(0/0); // NaN
console.log(-0/+0); // NaN
```

### String

字符串（String）：表示文本数据，由一串字符组成。可以使用单引号或双引号包裹。

```javascript
let firstName = "John";
let lastName = 'Jacob';
let lastName = `Jingleheimerschmidt`
```

字符串是不可变的，意思是一旦创建，它们的值就不能变了

```javascript
let lang = "Java";
lang = lang + "Script";  // 先销毁再重新创建
```

### Boolean

布尔（Boolean）：表示逻辑值，只有两个可能的值：`true`（真）和 `false`（假）。

通过`Boolean`可以将其他类型的数据转化成布尔值

```tex
数据类型                    转换为 true 的值                     转换为 false 的值
 String                      非空字符串                              "" 
 Number                  非零数值（包括无穷值）                     0 、 NaN 
 Object                      任意对象                               null
Undefined                  N/A （不存在）                         undefined
```

### Null

空值（Null）：表示空值或无值。它是一个特殊的关键字 null。

逻辑上讲， null 值表示一个空对象指针，这也是给`typeof`传一个 `null` 会返回 `"object"` 的原因

```javascript
let car = null;
console.log(typeof car); // "object"
```

### Undefined

未定义（Undefined）：表示变量声明但未赋值的值。它是一个特殊的关键字 `undefined`。

```javascript
let message; // 这个变量被声明了，只是值为 undefined

console.log(message); // "undefined"
console.log(age); // 没有声明过这个变量，报错
```

`undefined` 值是由 `null`值派生而来

```javascript
console.log(null == undefined); // true
```

### Symbol

符号（Symbol）：表示唯一且不可变的值，用于创建对象属性的唯一标识符。在 ES6 中引入。

```javascript
let genericSymbol = Symbol();
let otherGenericSymbol = Symbol();
console.log(genericSymbol == otherGenericSymbol); // false

let fooSymbol = Symbol('foo');
let otherFooSymbol = Symbol('foo');
console.log(fooSymbol == otherFooSymbol); // false
```

> 符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险

## 引用类型

### Object

对象（Object）：表示复杂的数据结构，可以包含多个键值对。对象可以通过大括号 `{}` 创建，或者通过构造函数创建。

```javascript
let person = {
    name: "Nicholas",
    "age": 29,
    5: true
};
```

### Array

数组（Array）：表示有序的数据集合，可以包含任意类型的数据。数组可以通过方括号 `[]` 创建。

```javascript
let colors = ["red", 2, {age: 20 }]
colors.push(2)
```

### Function

函数（Function）：是一段可执行的代码块，可以接收参数并返回值。函数可以作为变量、参数传递、存储在对象属性中等。

函数存在三种常见的表达方式：

函数声明

```javascript
function sum (num1, num2) {
    return num1 + num2;
}
```

函数表达式

```javascript
let sum = function(num1, num2) {
    return num1 + num2;
};
```

箭头函数

```javascript
let sum = (num1, num2) => {
    return num1 + num2;
};
```

## 操作符

### typeof

在 JavaScript 中，我们可以使用 `typeof` 操作符来获取一个值的数据类型。

```javascript
console.log(typeof undefined); // 'undefined'
console.log(typeof true); // 'boolean'
console.log(typeof 78); // 'number'
console.log(typeof 'hey'); // 'string'
console.log(typeof Symbol()); // 'symbol'
console.log(typeof BigInt(1)); // 'bigint'
console.log(typeof new String('abc')); // 'object'
console.log(typeof null); // 'object'
console.log(typeof function () { }); // 'function'
console.log(typeof { name: 'Jack' }); // 'object'
```

`typeof` 返回的是值的类型，而不是变量的类型。因为在 JavaScript 中，变量本身并没有类型，它们可以持有任何类型的值。

对大多数对象使用 `typeof` 时，返回的结果是`'object'`，对于函数则返回`'function'`。特别的，对 `null` 使用 `typeof` 返回的也是`'object'`，这是一个历史遗留的 `bug`，我们无法改正。

所以，如果我们需要检查一个值是否为 `null`，我们可以使用以下方式

```javascript
var a = null;
console.log(!a && typeof a === "object"); // true
```

### instanceof

`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上

使用如下：

```javascript
object instanceof constructor
```

`object`为实例对象，`constructor`为构造函数

构造函数通过`new`可以实例对象，`instanceof`能判断这个对象是否是之前那个构造函数生成的对象

```javascript
// 定义构建函数
let Car = function() {}
let benz = new Car()
benz instanceof Car // true
let car = new String('xxx')
car instanceof String // true
let str = 'xxx'
str instanceof String // false
```

关于`instanceof`的实现原理，可以参考下面：

```javascript
function myInstanceof(left, right) {
    // 这里先用typeof来判断基础数据类型，如果是，直接返回false
    if(typeof left !== 'object' || left === null) return false;
    // getProtypeOf是Object对象自带的API，能够拿到参数的原型对象
    let proto = Object.getPrototypeOf(left);
    while(true) {                  
        if(proto === null) return false;
        if(proto === right.prototype) return true;//找到相同原型对象，返回true
        proto = Object.getPrototypeof(proto);
    }
}
```

也就是顺着原型链去找，直到找到相同的原型对象，返回`true`，否则为`false`

### 区别

`typeof`与`instanceof`都是判断数据类型的方法，区别如下：

- `typeof`会返回一个变量的基本类型，`instanceof`返回的是一个布尔值
- `instanceof` 可以准确地判断复杂引用数据类型，但是不能正确判断基础数据类型
- 而`typeof` 也存在弊端，它虽然可以判断基础数据类型（`null` 除外），但是引用数据类型中，除了`function` 类型以外，其他的也无法判断

## 包装类型

在 JavaScript 中，基本数据类型有对应的包装对象，这样我们就可以在基本数据类型上调用方法了。

例如，字符串有对应的 `String` 包装对象，我们就可以在字符串上调用 `String` 对象的方法

```javascript
let s = 'Hello, world!';
console.log(s.length); // 13
```

`length` 是 `String` 对象的一个属性，我们可以在字符串 s 上访问它。

当我们在一个字符串上调用一个方法或者访问一个属性时，JavaScript 会将字符串自动转换为一个临时的 `String` 对象，然后在这个临时对象上调用方法或者访问属性。完成后，临时对象就会被销毁。

## 数据类型转换

### 隐式转换

在 JavaScript 中，隐式类型转换是指在特定的上下文中，JavaScript 自动将一个数据类型转换为另一个数据类型，而无需显式地编写转换代码。

数字转字符串

通过将数字与一个空字符串相加，JavaScript 会将数字隐式转换为字符串。

```javascript
let num = 10;
let str = num + ''; // 将数字转换为字符串
console.log(str); // 输出: "10"
```

字符串转数字

通过使用一元加号操作符（+）对字符串进行操作，JavaScript 会将字符串隐式转换为数字。

```javascript
let str = '20';
let num = +str; // 将字符串转换为数字
console.log(num); // 输出: 20
```

布尔值转数字

通过使用一元加号操作符（+）对布尔值进行操作，JavaScript 会将布尔值隐式转换为数字，`true` 转换为 1，`false` 转换为 0。

```javascript
let bool = true;let num = +bool; // 将布尔值转换为数字
console.log(num); // 输出: 1
```

字符串转布尔值

通过使用两个逻辑非操作符（!!）对字符串进行操作，JavaScript 会将字符串隐式转换为布尔值，非空字符串转换为 `true`，空字符串转换为 `false`

```javascript
let str = 'true';
let bool = !!str; // 将字符串转换为布尔值
console.log(bool); // 输出: true
```

对象的隐式转换

对象转换为字符串

当一个对象需要被隐式转换为字符串时，JavaScript 会尝试调用对象的 `toString()`方法。

```javascript
let obj = { name: "John", age: 25 };
let str = obj.toString();
console.log(str); // 输出: "[object Object]"
```

>对象 `obj` 会被隐式转换为字符串形式，调用了 `toString()`方法并返回了`"[object Object]"`

对象转换为数字

当一个对象需要被隐式转换为数字时，JavaScript 会尝试调用对象的 `valueOf()`方法。`valueOf()`方法是一个内置方法，它返回表示对象的原始数值形式。

```javascript
let obj = { value: 42 };
let num = obj.valueOf();
console.log(num); // 输出: 42
```

### 显式转换

在 JavaScript 中，我们可以使用一些内置函数和操作符来进行显式类型转换，以将一个值转换为特定的数据类型。

String()：用于将一个值转换为字符串类型。

```javascript
let num = 10;
let str = String(num); // 将数字转换为字符串
console.log(str); // 输出: "10"
```

>使用 String()函数进行转换时，对于 null 和 undefined 值会分别得到 "null" 和 "undefined" 字符串。

Number() 函数：用于将一个值转换为数字类型。

```javascript
let str = "20";
let num = Number(str); // 将字符串转换为数字
console.log(num); // 输出: 20
```

>使用 Number()函数进行转换时，如果传入的字符串无法解析为有效的数字，将返回 `NaN`（Not a Number）。

Boolean() 函数：用于将一个值转换为布尔类型。

```javascript
let num = 0;
let bool = Boolean(num); // 将数字转换为布尔值
console.log(bool); // 输出: false
```

>使用 Boolean()函数进行转换时，对于 0、-0、null、undefined、NaN 和空字符串会返回 false，其他值都会返回 true。

parseInt() 和 parseFloat() 函数：用于将字符串转换为整数和浮点数类型。

```javascript
let str = "123";
let num = parseInt(str); // 将字符串转换为整数
console.log(num); // 输出: 123
let floatStr = "3.14";
let floatNum = parseFloat(floatStr); // 将字符串转换为浮点数
console.log(floatNum); // 输出: 3.14
```

>使用 `parseInt()` 和 `parseFloat()` 函数进行转换时，它们会尝试解析字符串的开头部分，直到遇到非数字字符为止。

加号操作符（+）：用于将值转换为数字类型。

```javascript
let str = "20";
let num = +str; // 将字符串转换为数字
console.log(num); // 输出: 20
```

双重取反操作符（!!）：用于将值转换为布尔类型。

```javascript
let num = 0;
let bool = !!num; // 将数字转换为布尔值
console.log(bool); // 输出: false
```

### 转换规则

下面是一些类型转换的规则和需要注意的情况

类型转换的优先级

- 在 JavaScript 中，类型转换有一定的优先级。从高到低的优先级顺序是：`布尔值 -> 数字 -> 字符串`。

字符串拼接优先

- 在涉及字符串和其他数据类型的操作中，字符串拼接的优先级最高。

NaN（Not a Number）

- 当涉及无法进行有效数值计算的情况时，JavaScript 会返回 NaN。
- NaN 是一个特殊的数字值，表示不是一个有效的数字。

null 和 undefined 的类型转换

- null 在进行数字转换时会被转换为 0，而在进行字符串转换时会被转换为"null"。
- undefined 在进行数字转换时会被转换为 NaN，而在进行字符串转换时会被转换为"undefined"。

一元加号操作符的行为

- 一元加号操作符可以用于将值转换为数字类型，但需要注意一些情况。
- 当应用于字符串时，一元加号操作符会尝试将字符串解析为数字。
