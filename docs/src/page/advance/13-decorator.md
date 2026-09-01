# 装饰器

## 概念

装饰器是一种用于修改类、方法或属性的语法，它可以在不修改原始代码的情况下增强其功能。装饰器可以实现横切关注点（cross-cutting concerns）的功能，例如日志记录、性能分析、缓存等。通过将这些功能与原始代码分离，我们可以更好地组织和维护代码，并实现更高的可重用性和可扩展性。

## 语法

装饰器使用`@`符号作为前缀，紧跟着装饰器函数或类。装饰器可以接收不同的参数，根据装饰的目标不同，参数也会有所区别。装饰器可以单独使用，也可以通过组合多个装饰器来实现更复杂的功能。

下面是一个基本的装饰器语法示例：

```javascript
@decorator
class MyClass {
  @propertyDecorator
  myProperty = 123;

  @methodDecorator
  myMethod() {
    // 代码逻辑
  }
}
```

## 类装饰器

### 应用场景

类装饰器用于修改类的行为和属性。它可以在类定义之前应用，以修改类的构造函数或原型。

常见的应用场景包括：

- **日志记录**：在类的方法执行前后记录日志信息。
- **验证和授权**：对类的方法进行验证和授权操作。
- **性能分析**：测量类的方法执行时间，进行性能分析。
- **依赖注入**：为类的构造函数注入依赖项。

### 示例代码

下面是一个使用类装饰器实现日志记录的示例：

```javascript
function log(target) {
  const originalConstructor = target;

  function newConstructor(...args) {
    console.log(`Creating instance of ${originalConstructor.name}`);
    return new originalConstructor(...args);
  }

  return newConstructor;
}

@log
class MyClass {
  constructor(name) {
    this.name = name;
  }
}

const myObj = new MyClass("John");
```

在上面的示例中，我们定义了一个名为`log`的装饰器函数。该装饰器函数接收一个参数`target`，表示要装饰的类构造函数。在装饰器函数内部，我们将原始的构造函数保存到`originalConstructor`中，并创建一个新的构造函数`newConstructor`，该构造函数在创建实例前打印日志信息。最后，我们将新的构造函数返回作为装饰后的类构造函数。

## 方法装饰器

### 应用场景

方法装饰器用于修改类的方法行为。它可以在方法定义之前应用，以修改方法的特性和行为。

常见的应用场景包括：

- **日志记录**：在方法执行前后记录日志信息。
- **验证和授权**：对方法进行验证和授权操作。
- **性能分析**：测量方法执行时间，进行性能分析。
- **缓存**：为方法添加缓存功能，提高性能。

### 示例代码

下面是一个使用方法装饰器实现日志记录的示例：

```javascript
function log(target, name, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    console.log(`Executing method ${name}`);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${name} executed`);
    return result;
  };

  return descriptor;
}

class MyClass {
  @log
  myMethod() {
    // 代码逻辑
  }
}

const myObj = new MyClass();
myObj.myMethod();
```

在上面的示例中，我们定义了一个名为`log`的装饰器函数。该装饰器函数接收三个参数，分别是`target`（类的原型或构造函数）、`name`（方法名）和`descriptor`（方法的属性描述符）。在装饰器函数内部，我们获取原始方法并将其保存到`originalMethod`中。然后，我们修改`descriptor.value`，将其替换为一个新的函数，该函数在执行原始方法前后打印日志信息。最后，我们返回修改后的属性描述符。

## 属性装饰器

### 应用场景

属性装饰器用于修改类的属性行为。它可以在属性定义之前应用，以修改属性的特性和行为。

常见的应用场景包括：

- **日志记录**：在属性读取或写入时记录日志信息。
- **验证和授权**：对属性进行验证和授权操作。
- **计算属性**：根据其他属性的值计算属性的值。
- **缓存**：为属性添加缓存功能，提高性能。

### 示例代码

下面是一个使用属性装饰器实现日志记录的示例：

```javascript
function log(target, name) {
  let value;

  const getter = function() {
    console.log(`Getting value of property ${name}`);
    return value;
  };

  const setter = function(newValue) {
    console.log(`Setting value of property ${name}`);
    value = newValue;
  };

  Object.defineProperty(target, name, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class MyClass {
  @log
  myProperty;
}

const myObj = new MyClass();
myObj.myProperty = 123;
const value = myObj.myProperty;
```

在上面的示例中，我们定义了一个名为`log`的装饰器函数。该装饰器函数接收两个参数，分别是`target`（类的原型或构造函数）和`name`（属性名）。在装饰器函数内部，我们定义了一个名为`getter`的函数，用于获取属性值，并在获取属性值时打印日志信息。我们还定义了一个名为`setter`的函数，用于设置属性值，并在设置属性值时打印日志信息。最后，我们使用`Object.defineProperty`方法将装饰后的属性定义到类的原型上。

## 参数装饰器

### 应用场景

参数装饰器用于修改方法的参数行为。它可以在方法参数声明之前应用，以修改参数的特性和行为。

常见的应用场景包括：

- **验证和授权**：对方法的参数进行验证和授权操作。
- **日志记录**：在方法执行前后记录参数信息。
- **参数转换**：对方法的参数进行类型转换或格式化操作。

### 示例代码

下面是一个使用参数装饰器实现参数验证的示例：

```javascript
function validate(target, name, index, validator) {
  const originalMethod = target[name];

  target[name] = function(...args) {
    const value = args[index];
    if (validator(value)) {
      return originalMethod.apply(this, args);
    } else {
      throw new Error(`Invalid value for parameter ${index} of method ${name}`);
    }
  };
}

class MyClass {
  myMethod(@validate isNumber) {
    // 代码逻辑
  }
}

function isNumber(value) {
  return typeof value === "number";
}

const myObj = new MyClass();
myObj.myMethod(123);
```

在上面的示例中，我们定义了一个名为`validate`的装饰器函数。该装饰器函数接收四个参数，分别是`target`（类的原型或构造函数）、`name`（方法名）、`index`（参数索引）和`validator`（验证函数）。在装饰器函数内部，我们获取原始方法并将其保存到`originalMethod`中。然后，我们修改`target[name]`，将其替换为一个新的函数，该函数在执行原始方法之前对指定参数进行验证。如果参数通过验证，就继续执行原始方法；否则，抛出一个错误

。最后，我们使用`@validate`装饰器应用参数验证。

## 装饰器组合和执行顺序

可以通过组合多个装饰器来实现更复杂的功能。装饰器的执行顺序从上到下，从右到左。

```javascript
function log(target, name, descriptor) {
  // 日志记录逻辑
}

function validate(target, name, index, validator) {
  // 参数验证逻辑
}

class MyClass {
  @log
  @validate(isNumber)
  myMethod(@validate(isString) param1, @validate(isBoolean) param2) {
    // 代码逻辑
  }
}
```

在上面的示例中，我们通过使用`@log`装饰器和`@validate`装饰器组合，为类的方法和参数添加日志记录和验证功能。装饰器的执行顺序是从上到下，从右到左。

## 常用装饰器库和工具

除了原生的装饰器语法，还有许多优秀的装饰器库和工具可供使用。一些常见的库和工具包括：

- **core-decorators**：提供了一组常用的装饰器，如`@readonly`、`@debounce`、`@throttle`等。[GitHub](https://github.com/jayphelps/core-decorators)
- **lodash-decorators**：基于Lodash库的装饰器集合，提供了许多实用的装饰器。[GitHub](https://github.com/steelsojka/lodash-decorators)
- **mobx**：流行的状态管理库MobX使用装饰器来实现响应式数据和自动触发更新。[官方文档](https://mobx.js.org/README.html)
- **nestjs**：基于Node.js的框架NestJS使用装饰器来实现依赖注入、路由定义等功能。[官方文档](https://docs.nestjs.com/)
