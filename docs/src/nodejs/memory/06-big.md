# 处理大文件

在Node中，不可避免地还是会存在操作大文件的场景。由于Node的内存限制，操作大文件也需要小心，好在Node提供了stream模块用于处理大文件。

stream模块是Node的原生模块，直接引用即可。stream继承自`EventEmitter`，具备基本的自定义事件功能，同时抽象出标准的事件和方法。它分可读和可写两种。Node中的大多数模块都有stream的应用，比如`fs`的`createReadStream()`和`createWriteStream()`方法可以分别用于创建文件的可读流和可写流，process模块中的`stdin`和`stdout`则分别是可读流和可写流的示例。

由于V8的内存限制，我们无法通过`fs.readFile()`和`fs.writeFile()`直接进行大文件的操作，而改用`fs.createReadStream()`和`fs.createWriteStream()`方法通过流的方式实现对大文件的操作。

```javascript
var reader = fs.createReadStream('in.txt'); 
var writer = fs.createWriteStream('out.txt'); 
reader.pipe(writer);
```

可读流提供了管道方法pipe()，封装了data事件和写入操作。通过流的方式，上述代码不会受到V8内存限制的影响，有效地提高了程序的健壮性。

如果不需要进行字符串层面的操作，则不需要借助V8来处理，可以尝试进行纯粹的Buffer操作，这不会受到V8堆内存的限制。但是这种大片使用内存的情况依然要小心，**即使V8不限制堆内存的大小，物理内存依然有限制**。
