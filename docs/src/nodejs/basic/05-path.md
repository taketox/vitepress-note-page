# Path模块

## node中的路径分类

node中的路径大致分5类，`dirname`,`filename`,`process.cwd()`,`./`,`../`，其中`dirname`,`filename`,`process.cwd()`绝对路径。

### 路径知识总结

- `__dirname`： 获得当前执行文件所在目录的完整目录名
- `__filename`： 获得当前执行文件的带有完整绝对路径的文件名
- `process.cwd()`：获得当前执行node命令时候的文件夹目录名
- `./`： 不使用require时候，`./`与`process.cwd()`一样，使用`require`时候，与`__dirname`一样

只有在 require() 时才使用相对路径(./, ../) 的写法，其他地方一律使用绝对路径，如下：

```javascript
// 当前目录下
 path.dirname(__filename) + '/path.js'; 
// 相邻目录下
 path.resolve(__dirname, '../regx/regx.js');
```

## path

前面讲解了路径的相关比较，接下来单独聊聊path这个模块，这个模块在很多地方比较常用，所以，对于我们来说，掌握他，对我们以后的发展更有利，不用每次看webpack的配置文件还要去查询一下这个api是干什么用的，很影响我们的效率

> api官网地址:https://nodejs.org/api/path.html

### path.normalize

描述：规范化路径，把不规范的路径规范化。

```javascript
const path = require('path');

console.log(path.normalize('/user//test/////src/..'));

// 输出
/user/test
```

### path.join

> path.join([...paths])

描述：路径拼接

```javascript
const path = require('path');
console.log(path.join('src', 'task.js'));

const path = require('path');
console.log(path.join(''));

// 输出
src/task.js
.
```

总结

1. 传入的参数是字符串的路径片段，可以是一个，也可以是多个。
2. 返回的是一个拼接好的路径，但是根据平台的不同，他会对路径进行不同的规范化。
3. 举个例子，`Unix`系统是`/`，`Windows`系统是`\`，那么你在两个系统下看到的返回结果就不一样。如果返回的路径字符串长度为零，那么他会返回一个`.`，代表当前的文件夹。
4. 如果传入的参数中有不是字符串的，那就直接会报错

### path.parse

描述：返回的是路径对象

```javascript
const path = require('path');
console.log(path.parse('/user/test'));

// 输出
{ root: '/',
  dir: '/user',
  base: 'test',
  ext: '',
  name: 'test'
}
```

>root：代表根目录
>
>dir：代表文件所在的文件夹
>
>base：代表整一个文件
>
>name：代表文件名
>
>ext: 代表文件的后缀名

### path.basename

描述：获取文件/文件夹基础名称

`basename`接收两个参数，第一个是`path`，第二个是`ext`(可选参数)，当输入第二个参数的时候，打印结果不出现后缀名。

```javascript
const path = require('path');
console.log(path.basename('/user/test/src'));
console.log(path.basename('/user/test/src/app.js', '.js'));

// 输出
src
app
```

### path.dirname

描述：返回文件的目录完整地址

```javascript
const path = require('path');
console.log(path.dirname('/user/test/src'));

// 输出
/user/test
```

### path.extname

描述：返回的是后缀名，但是最后两种情况返回'',大家注意一下。

```javascript
const path = require('path');
path.extname('index.html');
path.extname('index.coffee.md');
path.extname('index.');
path.extname('index');
path.extname('.index');

// 输出
.html
.md
.
''
''
```

### path.resolve

> path.resolve([...paths])

描述：路径解析

```javascript
const path = require('path');
console.log(path.resolve('/foo/bar', '/bar/faa', '..', 'a/../c'));

// 输出
/bar/c
```

path.resolve就相当于是shell下面的`cd`操作，从左到右运行一遍`cd path`命令，最终获取的绝对路径/文件名。

但是`resolve`操作和`cd`操作还是有区别的，`resolve`的路径可以没有，而且最后进入的可以是文件。

```sh
cd /foo/bar/    #这是第一步, 现在的位置是/foo/bar/
cd /bar/faa     #这是第二步，这里和第一步有区别，他是从/进入的，也就时候根目录，现在的位置是/bar/faa
cd ..           #第三步，从faa退出来，现在的位置是 /bar
cd a/../c       #第四步，进入a，然后在推出，在进入c，最后位置是/bar/c
```

### path.relative

> path.relative(from, to)

描述：从from路径，到to路径的相对路径。

边界：

- 如果from、to指向同个路径，那么，返回空字符串。
- 如果from、to中任一者为空，那么，返回当前工作路径。

```javascript
const path = require('path');

console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb'));

console.log(path.relative('/data/demo', '/data/demo'));

console.log(path.relative('/data/demo', ''));

// 输出
../../impl/bbb
""
../../koala/Desktop/程序员成长指北/代码pra/node核心API
```
