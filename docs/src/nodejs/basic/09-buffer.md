# Buffer探究

## Buffer的内存分配机制

**buffer对应于 V8 堆内存之外的一块原始内存：**

`Buffer`是一个典型的`javascript`与`C++`结合的模块，与性能有关的用C++来实现，`javascript` 负责衔接和提供接口。`Buffer`所占的内存不是`V8`堆内存，是独立于`V8`堆内存之外的内存，通过`C++`层面实现内存申请（可以说真正的内存是`C++`层面提供的）、`javascript` 分配内存（可以说`JavaScript`层面只是使用它）。`Buffer`在分配内存最终是使用`ArrayBuffer`对象作为载体。简单点而言， 就是`Buffer`模块使用`v8::ArrayBuffer`分配一片内存，通过`TypedArray`中的`v8::Uint8Array`来去写数据。

### 内存分配的8K机制

- 分配小内存

说道Buffer的内存分配就不得不说`Buffer`的`8KB`的问题，对应`buffer.js`源码里面的处理如下：

```JavaScript
Buffer.poolSize = 8 * 1024;

function allocate(size)
{
    if(size <= 0 )
        return new FastBuffer();
    if(size < Buffer.poolSize >>> 1 )
        if(size > poolSize - poolOffset)
            createPool();
        var b = allocPool.slice(poolOffset,poolOffset + size);
        poolOffset += size;
        alignPool();
        return b
    } else {
        return createUnsafeBuffer(size);
    }
}
```

源码直接看来就是以8KB作为界限，如果写入的数据大于8KB一半的话直接则直接去分配内存，如果小于4KB的话则从当前分配池里面判断是否够空间放下当前存储的数据，如果不够则重新去申请8KB的内存空间，把数据存储到新申请的空间里面，如果足够写入则直接写入数据到内存空间里面，下图为其内存分配策略。

![An image](/img/nodejs/base/12.png)

看内存分配策略图，如果当前存储了2KB的数据，后面要存储5KB大小数据的时候分配池判断所需内存空间大于4KB，则会去重新申请内存空间来存储5KB数据并且分配池的当前偏移指针也是指向新申请的内存空间，这时候就之前剩余的6KB(8KB-2KB)内存空间就会被搁置。至于为什么会用`8KB`作为`存储单元`分配，为什么大于`8KB`按照大内存分配策略，在下面`Buffer`内存分配机制优点有说明。

- 分配大内存

还是看上面那张内存分配图，如果需要超过`8KB`的`Buffer`对象，将会直接分配一个`SlowBuffer`对象作为基础单元，这个基础单元将会被这个大`Buffer`对象独占。

```JavaScript
// Big buffer,just alloc one
this.parent = new SlowBuffer(this.length);
this.offset = 0;
```

这里的`SlowBUffer`类实在`C++`中定义的，虽然引用buffer模块可以访问到它，但是不推荐直接操作它，而是用`Buffer`替代。这里内部`parent`属性指向的`SlowBuffer`对象来自`Node`自身`C++`中的定义，是`C++`层面的`Buffer`对象，所用内存不在`V8`的堆中

- 内存分配的限制

此外，`Buffer`单次的内存分配也有限制，而这个限制根据不同操作系统而不同，而这个限制可以看到`node_buffer.h`里面

```C
    static const unsigned int kMaxLength =
    sizeof(int32_t) == sizeof(intptr_t) ? 0x3fffffff : 0x7fffffff;
```

对于32位的操作系统单次可最大分配的内存为1G，对于64位或者更高的为2G。

### buffer内存分配机制优点

`Buffer`真正的内存实在`Node`的`C++`层面提供的，`JavaScript`层面只是使用它。当进行小而频繁的`Buffer`操作时，采用的是`8KB`为一个单元的机制进行预先申请和事后分配，使得`Javascript`到操作系统之间不必有过多的内存申请方面的系统调用。对于大块的`Buffer`而言(大于`8KB`)，则直接使用`C++`层面提供的内存，则无需细腻的分配操作。

## Buffer与stream

### stream的流动为什么要使用二进制Buffer

根据最初代码的打印结果，`stream`中流动的数据就是`Buffer`类型，也就是`二进制`。

**原因一：**

`node`官方使用二进制作为数据流动肯定是考虑过很多，stream主要的设计目的——是为了优化`IO操作`（`文件IO`和`网络IO`），对应后端无论是`文件IO`还是`网络IO`，其中包含的数据格式都是未知的，有可能是字符串，音频，视频，网络包等等，即使就是字符串，它的编码格式也是未知的，可能`ASC编码`，也可能`utf-8`编码，对于这些未知的情况，还不如直接使用最通用的格式`二进制`.

**原因二：**

`Buffer`对于`http`请求也会带来性能提升。

举一个例子：

```JavaScript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    const fileName = path.resolve(__dirname, 'buffer-test.txt');
    fs.readFile(fileName, function (err, data) {
        res.end(data)   // 测试1 ：直接返回二进制数据
        // res.end(data.toString())  // 测试2 ：返回字符串数据
    });
});
server.listen(8000);
```

将代码中的`buffer-test`文件大小增加到`50KB`左右，然后使用`ab`工具测试一下性能，你会发现无论是从`吞吐量`（Requests per second）还是连接时间上，返回二进制格式比返回字符串格式效率提高很多。为何字符串格式效率低？—— 因为网络请求的数据本来就是二进制格式传输，虽然代码中写的是 `response` 返回字符串，最终还得再转换为二进制进行传输，多了一步操作，效率当然低了。

### Buffer在stream数据流转充当的角色

我们可以把整个`流(stream)`和`Buffer`的配合过程看作`公交站`。在一些公交站，`公交车`在没有装满乘客前是不会发车的，或者在特定的时刻才会发车。当然，乘客也可能在不同的时间，人流量大小也会有所不同，有人多的时候，有人少的时候，`乘客`或`公交车站`都无法控制人流量。

不论何时，早到的乘客都必须等待，直到`公交车`接到指令可以发车。当乘客到站，发现`公交车`已经装满，或者已经开走，他就必须等待下一班车次。

总之，这里总会有一个等待的地方，这个`等待的区域`就是`Node.js`中的`Buffer`，`Node.js`不能控制数据什么时候传输过来，传输速度，就好像公交车站无法控制人流量一样。他只能决定什么时候发送数据(公交车发车)。如果时间还不到，那么`Node.js`就会把数据放入`Buffer`等待区域中，一个在RAM中的地址，直到把他们发送出去进行处理。

**注意点：**

`Buffer`虽好也不要瞎用，`Buffer`与`String`两者都可以存储字符串类型的数据，但是，`String`与`Buffer`不同，在内存分配上面，`String`直接使用`v8堆存储`，不用经过`c++`堆外分配内存，并且`Google`也对`String`进行优化，在实际的拼接测速对比中，`String`比`Buffer`快。但是`Buffer`的出现是为了处理二进制以及其他非`Unicode`编码的数据，所以在处理`非utf8`数据的时候需要使用到`Buffer`来处理。
