# Buffer模块

## Buffer概述

Buffer是一个像Array的对象，但它主要用于操作字节。

`Buffer` 对象是 Node.js 提供的一个全局对象，专门用来**处理二进制数据**。

在二进制数据在开发中，操作和表示都非常不方便，所以 Buffer 对象采用**十六进制来表示二进制数据**。比如二进制数据 `00001111`，转为十六进制就是 `f`。用 buffer 表示就是：

```javascript
let buffer = Buffer.from([0b1111]);
console.log(buffer);
// 输出
<Buffer 0f>
```

## Buffer特点

1. Buffer 的结构与数组类似，操作方法也与数组类似
2. 数组不能存储二进制文件，Buffer 是专门存储二进制数据的
3. Buffer 存储的是二进制数据，显示时以 16 进制的形式显示
4. Buffer 每一个元素范围是 00~ff，即 0~255、00000000~11111111
5. 每一个元素占用一个字节内存
6. Buffer 是对底层内存的直接操作，因此大小一旦确定就不能修改

## Buffer用途

1. 网络数据传输
   在进行网络通信时，数据往往以二进制形式传输。通过Buffer，我们可以方便地读取、写入和转换二进制数据。

2. 文件操作
   Node.js提供了丰富的文件操作API，Buffer在文件读取和写入过程中起着重要作用。我们可以使用Buffer从文件中读取数据，并将数据写入到文件中。

3. 加密和解密
   加密算法通常使用二进制数据作为输入和输出。Buffer可以方便地存储和处理加密算法所需的数据。

## Buffer对象

Buffer对象类似于数组，它的元素为16进制的两位数，即0到255的数值。

创建buffer对象

```javascript
let buffer = new Buffer();
```

> 但是这种方式由于安全性已经废弃了，在实例化时会报错。

文档推荐使用这几种新的方法来创建：

- `Buffer.alloc`：创建指定字节大小的 buffer。
- `Buffer.allocUnsafe`：从名字看就知道是一个不安全的 API 。不推荐使用。
- `Buffer.from`：使用传入的数据创建 buffer，最常用的方法。

## Buffer.alloc

创建 buffer 的时候需要指定 buffer 的大小。

```javascript
// 创建一个 3 字节大小的buffer
let buffer = Buffer.alloc(3);
console.log(buffer);

// buffer 使用十六进制来描述二进制数据，长这样：
// 由于没有往里存东西，所以都为 00
// 输出
<Buffer 00 00 00>
```

## Buffer.allocUnsafe

```javascript
let buffer = Buffer.allocUnsafe(3);
console.log(buffer); // 值不确定
```

>由于 V8 引擎的 GC 机制，会产生内存碎片，一块空间不再使用了，但是还没有被回收。此时就有可能会被这个方法拿来创建一个 buffer ，所以创建出来的 buffer 可能并不是空的。这就是为什么值不确定的原因。同样也是不推荐使用该方法的原因。
>其实该方法也谈不上不安全，只是不干净而已，并不影响最终的使用，因为创建之后总会用新的数据覆盖它。

## Buffer.from

该方法接收两个参数：

- 第一个参数是**用来创建 buffer 的数据，也就是要存到缓冲区的数据**，有三种类型：**字符串，数组和 Buffer 实例**。
- 第二个参数用来**指定编码格式**，默认为 `utf-8`。

### 使用字符串创建 buffer

```javascript
let buffer1 = Buffer.from('abc');
console.log(buffer1);

// 默认使用 utf-8 编码，一个字符占一个字节，所以有三个字节大小
// <Buffer 61 62 63>


let buffer2 = Buffer.from('你好');
console.log(buffer2);

// 默认使用 utf-8 编码，一个汉字占3个字节。所以所以生成的 buffer有6个字节
// <Buffer e4 bd a0 e5 a5 bd>
```

### 使用数组创建 buffer

```javascript
let buffer1 = Buffer.from([1, 2, 3]);
let buffer2 = Buffer.from([0x4, 0x5, 0x6]);
let buffer3 = Buffer.from([0b111, 0b1000, 0b1001]);
console.log(buffer1);
console.log(buffer2);
console.log(buffer3);

/*
<Buffer 01 02 03>
<Buffer 04 05 06>
<Buffer 07 08 09>
*/
```

### 使用 buffer 创建 buffer

```javascript
let buffer1 = Buffer.alloc(3)
let buffer2 = Buffer.from(buffer1)
console.log(buffer1)// <Buffer 00 00 00>
console.log(buffer2)// <Buffer 00 00 00>
```

> 创建出来的两个 buffer 长的一样，但是两块独立的内存空间，互不影响。

## Buffer 的实例方法

我们可以将 buffer 看作是一个**存放二进制数据的数组**，只不过**每一项都是一字节大小的数据**，而非我们熟悉的数字、字符串等。

Buffer 是一个全局对象，打印一下它的原型对象]：

```javascript
console.log(Buffer.prototype);

Uint8Array {
  readBigUInt64LE: [Function: readBigUInt64LE],
  readBigUInt64BE: [Function: readBigUInt64BE],
  readBigUint64LE: [Function: readBigUInt64LE],
  readBigUint64BE: [Function: readBigUInt64BE],
  readBigInt64LE: [Function: readBigInt64LE],
  readBigInt64BE: [Function: readBigInt64BE],
  writeBigUInt64LE: [Function: writeBigUInt64LE],
  writeBigUInt64BE: [Function: writeBigUInt64BE],
  writeBigUint64LE: [Function: writeBigUInt64LE],
  writeBigUint64BE: [Function: writeBigUInt64BE],
  writeBigInt64LE: [Function: writeBigInt64LE],
  writeBigInt64BE: [Function: writeBigInt64BE],
  readUIntLE: [Function: readUIntLE],
  readUInt32LE: [Function: readUInt32LE],
  readUInt16LE: [Function: readUInt16LE],
  readUInt8: [Function: readUInt8],
  readUIntBE: [Function: readUIntBE],
  readUInt32BE: [Function: readUInt32BE],
  readUInt16BE: [Function: readUInt16BE],
  readUintLE: [Function: readUIntLE],
  readUint32LE: [Function: readUInt32LE],
  readUint16LE: [Function: readUInt16LE],
  readUint8: [Function: readUInt8],
  readUintBE: [Function: readUIntBE],
  readUint32BE: [Function: readUInt32BE],
  readUint16BE: [Function: readUInt16BE],
  readIntLE: [Function: readIntLE],
  readInt32LE: [Function: readInt32LE],
  readInt16LE: [Function: readInt16LE],
  readInt8: [Function: readInt8],
  readIntBE: [Function: readIntBE],
  readInt32BE: [Function: readInt32BE],
  readInt16BE: [Function: readInt16BE],
  writeUIntLE: [Function: writeUIntLE],
  writeUInt32LE: [Function: writeUInt32LE],
  writeUInt16LE: [Function: writeUInt16LE],
  writeUInt8: [Function: writeUInt8],
  writeUIntBE: [Function: writeUIntBE],
  writeUInt32BE: [Function: writeUInt32BE],
  writeUInt16BE: [Function: writeUInt16BE],
  writeUintLE: [Function: writeUIntLE],
  writeUint32LE: [Function: writeUInt32LE],
  writeUint16LE: [Function: writeUInt16LE],
  writeUint8: [Function: writeUInt8],
  writeUintBE: [Function: writeUIntBE],
  writeUint32BE: [Function: writeUInt32BE],
  writeUint16BE: [Function: writeUInt16BE],
  writeIntLE: [Function: writeIntLE],
  writeInt32LE: [Function: writeInt32LE],
  writeInt16LE: [Function: writeInt16LE],
  writeInt8: [Function: writeInt8],
  writeIntBE: [Function: writeIntBE],
  writeInt32BE: [Function: writeInt32BE],
  writeInt16BE: [Function: writeInt16BE],
  readFloatLE: [Function: readFloatForwards],
  readFloatBE: [Function: readFloatBackwards],
  readDoubleLE: [Function: readDoubleForwards],
  readDoubleBE: [Function: readDoubleBackwards],
  writeFloatLE: [Function: writeFloatForwards],
  writeFloatBE: [Function: writeFloatBackwards],
  writeDoubleLE: [Function: writeDoubleForwards],
  writeDoubleBE: [Function: writeDoubleBackwards],
  asciiSlice: [Function: asciiSlice],
  base64Slice: [Function: base64Slice],
  base64urlSlice: [Function: base64urlSlice],
  latin1Slice: [Function: latin1Slice],
  hexSlice: [Function: hexSlice],
  ucs2Slice: [Function: ucs2Slice],
  utf8Slice: [Function: utf8Slice],
  asciiWrite: [Function: asciiWrite],
  base64Write: [Function: base64Write],
  base64urlWrite: [Function: base64urlWrite],
  latin1Write: [Function: latin1Write],
  hexWrite: [Function: hexWrite],
  ucs2Write: [Function: ucs2Write],
  utf8Write: [Function: utf8Write],
  parent: [Getter],
  offset: [Getter],
  copy: [Function: copy],
  toString: [Function: toString],
  equals: [Function: equals],
  inspect: [Function: inspect],
  compare: [Function: compare],
  indexOf: [Function: indexOf],
  lastIndexOf: [Function: lastIndexOf],
  includes: [Function: includes],
  fill: [Function: fill],
  write: [Function: write],
  toJSON: [Function: toJSON],
  slice: [Function: slice],
  swap16: [Function: swap16],
  swap32: [Function: swap32],
  swap64: [Function: swap64],
  toLocaleString: [Function: toString],
  [Symbol(nodejs.util.inspect.custom)]: [Function: inspect]
}
```

> 它继承自 `Uint8Array` 对象，并且有非常多的原型方法。我们主要学习一些常用的，包括 `copy`、`toString`、`indexOf`、`includes`、`fill`、`write`、`subarray` 等。

### toString

将从 buffer 中读取出来的数据转为字符串类型。

参数：（编码格式，起始位置，结束位置）

```javascript
let buffer = Buffer.from('你好世界');

console.log(buffer); 
// <Buffer e4 bd a0 e5 a5 bd e4 b8 96 e7 95 8c>
console.log(buffer.toString()); 
// 你好    读取全部数据转为字符串
console.log(buffer.toString('utf8', 6)); 
// 世界   从第7个字节开始读取 
console.log(buffer.toString('utf8', 0, 6)); 
// 你好  读取第1个到第6个字节
```

> buffer 在使用时和数组非常像，也可以通过从0开始的索引来指定位置，0索引表示的就是第一个字节。

### copy

把 buffer 中的数据拷贝到另一个 buffer 中。

参数：（目标buffer，目标buffer开始接收的位置，源buffer的起始位置，源buffer的结束位置）

```javascript
let target = Buffer.alloc(12)

let source = Buffer.from('你好世界')

// 部分拷贝。将 source 中 0-6 个字节也就是“你好” 拷贝至 target 中，target 从 0 位置开始接收
source.copy(target, 2, 0, 6)
console.log(target);
// <Buffer 00 00 e4 bd a0 e5 a5 bd 00 00 00 00>
console.log(target.toString());
// 你好

// 完整拷贝。将 source 中的数据拷贝到 target 中。
source.copy(target);
console.log(target.toString());
// 你好世界
```

### indexOf

类似字符串和数组中的 indexOf 方法，用于查找目标中匹配到的第一个元素的位置。找到返回字节位置，找不到返回-1。

参数：（查找的内容，开始查找的位置）

```javascript
let buffer = Buffer.from('hello, world')

console.log(buffer);
// <Buffer 68 65 6c 6c 6f 2c 20 77 6f 72 6c 64>

console.log(buffer.indexOf('l')); // 返回找到的第一个匹配的字节位置
console.log(buffer.indexOf('l', 3));
// 从 buffer 的第4个字节开始查找。
console.log(buffer.indexOf('a'));
// -1 。 若找不到返回 -1
```

### includes

判断 buffer 中是否包含指定的数据。类似于数组的 includes 方法。包含则返回true，否则返回false。

参数：（查找的内容，开始查找的位置）

```javascript
let buffer = Buffer.from('hello, world');

console.log(buffer.includes('l'));
// true
console.log(buffer.includes('a'));
// false
```

### fill

向 buffer 中填充数据。

参数：（填充的数据、接收数据的起始位置，接收数据的起始位置，编码格式）

```javascript
let buffer = Buffer.alloc(8);

// 将 '123' 填充到 buffer 中，从第三个字节开始填充，直到填满
buffer.fill('123', 2);
console.log(buffer);
// <Buffer 00 00 31 32 33 31 32 33>
console.log(buffer.toString());
// 123123

// 将 '123' 填充到 buffer 中，默认填满
buffer.fill('123');
console.log(buffer);
// <Buffer 31 32 33 31 32 33 31 32>
console.log(buffer.toString());
// 12312312
```

### write

向 buffer 中写入数据。

参数：（填充的数据、接收数据的起始位置，接收数据的起始位置，编码格式）

```javascript
let buffer = Buffer.alloc(6);

// 将 '123' 写入到 buffer 中，数据有多少就写入多少
buffer.write('123');
console.log(buffer);
// <Buffer 31 32 33 00 00 00>
console.log(buffer.toString());
// 123

// 将 '123' 填充到 buffer 中，从第三个字节开始填充，数据有多少写入多少
buffer.write('123', 3);
console.log(buffer);
//<Buffer 31 32 33 31 32 33>
console.log(buffer.toString());
// 123123
```

> write 和 fill的区别：
>
> 前者是数据有多少往 buffer 中写入多少，而 fill 是重复写入，直到填满整个 buffer。

### subarray

从 buffer 中截取数据并返回一个新的 buffer。

在数组和字符串的原型方法中，截取数据的方法叫作 slice。而 Buffer 对象中的 slice 方法已经废弃，改用 subarray。

参数：（填充数据，接收数据的起始位置，接收数据的起始位置，编码格式）

```javascript
let buffer = Buffer.from('123456')

// 截取 buffer 的全部数据
let subBuffer1 = buffer.subarray();

// 截取 buffer 的前三个字节
let subBuffer2 = buffer.subarray(0, 3);

console.log(buffer); 
// <Buffer 31 32 33 34 35 36>
console.log(subBuffer1); 
// <Buffer 31 32 33 34 35 36>
console.log(subBuffer2); 
// <Buffer 31 32 33>
```

## Buffer 的静态方法

### Buffer.concat

将多个 buffer 拼接成一个新的 buffer。就类似数组中的 `concat` 方法。用的非常多。

```javascript
let buffer1 = Buffer.from('你好');
let buffer2 = Buffer.from('世界');

console.log(Buffer.concat([buffer1, buffer2]));

// 第二个参数指定生成新的 buffer 的长度
console.log(Buffer.concat([buffer1, buffer2], 6));

// <Buffer e4 bd a0 e5 a5 bd e4 b8 96 e7 95 8c>
// <Buffer e4 bd a0 e5 a5 bd>
```

### Buffer.isBuffer

判断数据是否是 buffer 类型。

```javascript
let buffer = Buffer.from('1');

console.log(Buffer.isBuffer(1));
// false
console.log(Buffer.isBuffer(buffer));
// true
```

## 总结

创建 buffer 主要使用两个方法：

- `Buffer.alloc`：创建一个固定字节大小的内存空间
- `Buffer.from`：将传入的数据转为二进制放到内存中，用法有很多

操作 buffer 的方法包括 Buffer 原型对象上的实例方法和 Buffer 类的静态方法：

- `toString`：读取 buffer 中的数据，转为字符串
- `copy`：拷贝 buffer 中的数据到另一个 buffer 中
- `indexOf`：查找 buffer 中是否有目标内容
- `includes`：作用和 indexOf 相同，返回结果不同
- `fill`：向 buffer 中填充数据
- `write`：向 buffer 中写入数据
- `subarray`：从 buffer 中截取数据
- `Buffer.concat`：拼接 buffer
- `Buffer.isBufer`：判断 buffer 类型
