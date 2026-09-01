# ShadowDOM

## 概念

Shadow DOM 是一项 Web 标准，用于创建封装的组件并实现样式隔离。它允许将组件的 HTML 结构、样式和行为封装在一个独立的 DOM 树中，从而与主文档的 DOM 树相互隔离。通过这种方式，开发者可以创建具有独立样式和行为的组件，而不用担心与其他组件或主文档的样式冲突。

## API

Shadow DOM 提供了一系列用于操作和管理 Shadow DOM 的 API。

添加 Shadow Root

`attachShadow` 方法用于将 Shadow DOM 附加到指定的元素上。它接收一个 `options` 参数，用于指定 Shadow DOM 的模式。

```javascript
const hostElement = document.getElementById('host-element');
const shadowRoot = hostElement.attachShadow({ mode: 'open' });
```

获取 Shadow Root

`shadowRoot` 属性返回与元素关联的 Shadow Root。

```javascript
const shadowRoot = hostElement.shadowRoot;
```

在 Shadow Root 中查询元素

`querySelector` 方法在 Shadow Root 内部查找匹配指定选择器的第一个元素。

```javascript
const element = shadowRoot.querySelector('.my-element');
```

在 Shadow Root 中查询元素列表

`querySelectorAll` 方法在 Shadow Root 内部查找匹配指定选择器的所有元素。

```javascript
const elements = shadowRoot.querySelectorAll('.my-element');
```

获取 Shadow Root 的宿主元素

`host` 属性返回与 Shadow Root 相关联的宿主元素。

```javascript
const hostElement = shadowRoot.host;
```

## 应用场景

Shadow DOM 在 Web 开发中有许多实际应用场景，下面是几个常见的场景：

### Web 组件开发

Shadow DOM 可以帮助开发者创建封装的 Web 组件，确保组件的样式和行为不会被外部影响。以下是一个示例，演示如何使用 Shadow DOM 创建一个自定义按钮组件：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 组件的样式 */
    .custom-button {
      background-color: #007bff;
     

 color: white;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- 宿主元素 -->
  <div id="custom-button-container"></div>

  <script>
    // 创建 Shadow Root
    const hostElement = document.getElementById('custom-button-container');
    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // 创建自定义按钮
    const button = document.createElement('button');
    button.classList.add('custom-button');
    button.textContent = 'Click me';

    // 将按钮添加到 Shadow Root 中
    shadowRoot.appendChild(button);
  </script>
</body>
</html>
```

在上面的示例中，我们创建了一个 Shadow Root，并将其附加到 `custom-button-container` 宿主元素上。然后，我们在 Shadow Root 中创建了一个自定义按钮，并将其添加到 Shadow Root 中。

### 样式隔离

使用 Shadow DOM，我们可以实现样式隔离，确保组件的样式不会泄漏到外部环境。这样可以避免样式冲突，并提高组件的可维护性。

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .custom-button {
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- 外部环境 -->
  <div>
    <button class="custom-button">Outer Button</button>
  </div>

  <!-- Shadow DOM 组件 -->
  <div id="custom-button-container"></div>

  <script>
    // 创建 Shadow Root
    const hostElement = document.getElementById('custom-button-container');
    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // 创建自定义按钮
    const button = document.createElement('button');
    button.classList.add('custom-button');
    button.textContent = 'Shadow Button';

    // 将按钮添加到 Shadow Root 中
    shadowRoot.appendChild(button);
  </script>
</body>
</html>
```

在上面的示例中，我们创建了一个具有相同类名的按钮，一个在外部环境中，一个在 Shadow DOM 组件中。由于 Shadow DOM 具有样式隔离的特性，这两个按钮将拥有不同的样式，且彼此不会相互影响。

## 自定义API

我们还可以模拟实现一些自定义的 Shadow DOM API，以增强 Shadow DOM 的功能。下面是一个示例，展示如何实现一个自定义的 `insertText` 方法，用于向 Shadow DOM 中的元素插入文本内容：

```javascript
function insertText(element, text) {
  const textNode = document.createTextNode(text);
  element.appendChild(textNode);
}

const shadowRoot = hostElement.attachShadow({ mode: 'open' });
const div = document.createElement('div');
insertText(div, 'Hello, Shadow DOM!');
shadowRoot.appendChild(div);
```

在上面的示例中，我们定义了一个名为 `insertText` 的函数，它接收一个元素和文本内容作为参数，并创建一个文本节点，将

文本内容插入到元素中。然后，我们在 Shadow Root 中创建一个 `div` 元素，并使用 `insertText` 方法插入文本内容。
