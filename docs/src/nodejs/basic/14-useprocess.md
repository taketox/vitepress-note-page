# 多进程使用

我们知道`Node`是单线程运行的，这表示潜在的错误有可能导致线程崩溃，然后进程也会随着退出，无法做到企业追求的稳定性；另一方面，单进程也无法充分多核CPU，这是对硬件本身的浪费。`Node`社区本身也意识到了这一问题，于是从0.1版本就提供了`child_process`模块，用来提供多进程的支持。

## child_process 模块

`child_process`模块中包括了很多创建子进程的方法，包括`fork`、`spawn`、`exec`、`execFile`等等。它们的定义如下：

- `child_process.exec(command[, options][, callback])`
- `child_process.spawn(command[, args][, options])`
- `child_process.fork(modulePath[, args][, options])`
- `child_process.execFile(file[, args][, options][, callback])`

在这4个API中以`spawn`最为基础，因为其他三个API或多或少都是借助`spawn`实现的。

### spawn

`spawn`方法的声明格式如下：

```javascript
child_process.spawn(command[, args][, options])
```

`spawn`方法会使用指定的`command`来生成一个新进程，执行完对应的`command`后子进程会自动退出。

该命令返回一个`child_process`对象，这代表开发者可以通过监听事件来获得命令执行的结果。

下面我们使用`spwan`来执行`ls`命令：

```javascript
const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-1h', '/usr']);

ls.stdout.on('data', (data) => {
    console.log('stdout: ', daata.toString());
});

ls.stderr.on('data', (data) => {
    console.log('stderr: ', daata.toString());
});

ls.on('close', (code) => {
    console.log('child process exited with code', code);
});
```

其中`spawn`的第一个参数虽然是`command`，但实际接收的却是一个`file`，可以在Linux或者Mac OSX上运行，这是由于`ls`命令也是以可执行文件形式存在的。

类似的，在Windows系统下我们可以试着使用`dir`命令来实现功能类似的代码：

```javascript
const spawn = require('child_process').spawn;
const ls = spawn('dir');

ls.stdout.on('data', (data) => {
    console.log('stdout: ', daata.toString());
});
```

然而在Windows下执行上面代码会出现形如`Error:spawn dir ENOENT`的错误。

原因就在于`spawn`实际接收的是一个文件名而非命令，正确的代码如下：

```javascript
const spawn = require('child_process').spawn;
const ls = spawn('powershell', ['dir']);

ls.stdout.on('data', (data) => {
    console.log('stdout: ', data.toString());
});
```

这个问题的原因与操作系统本身有关，在Linux中，一般都是文件，命令行的命令也不例外，例如`ls`命令是一个名为`ls`的可执行文件；而在Windows中并没有名为`dir`的可执行文件，需要通过`cmd`或者`powershell`之类的工具提供执行环境。

### fork

在Linux环境下，创建一个新进程的本质是复制一个当前的进程，当用户调用 `fork` 后，操作系统会先为这个新进程分配空间，然后将父进程的数据原样复制一份过去，父进程和子进程只有少数值不同，例如进程标识符（PD）。

对于 Node 来说，父进程和子进程都有独立的内存空间和独立的 V8 实例，它们和父进程唯一的联系是用来进程间通信的 IPC Channel。

此外，Node中`fork`和 POSIX 系统调用的不同之处在于Node中的`fork`并不会复制父进程。

Node中的`fork`是上面提到的`spawn`的一种特例，前面也提到了Node中的`fork`并不会复制当前进程。多数情况下，`fork`接收的第一个参数是一个文件名，使用`fork("xx.js")`相当于在命令行下调用`node xx.js`，并且父进程和子进程之间可以通过`process.send`方法来进行通信。

下面我们来看一个简单的栗子：

```javascript
// 创建主进程 master.js 文件
// 调用 fork 来创建一个子进程
const child_process = require('child_process');
const worker = child_process.fork('worker.js', ['args1']);
// 监听子进程退出
worker.on('exit', () => {
  console.log('child process exit');
});
// 向子进程发送消息
worker.send({ msg: 'hello child' });
// 监听子进程消息
worker.on('message', msg => {
  console.log('from child: ', msg);
});


// 创建工作进程 worker.js 文件
const begin = process.argv[2];
console.log('I am worker ' + begin);
// 监听父进程消息
process.on('message', msg => {
  console.log('from parent ', msg);
  process.exit();
});
// 向父进程发送消息
process.send({ msg: 'hello parent' });
```

`fork`内部会通过`spawn`调用`process.executePath`，即`Node`的可执行文件地址来生成一个`Node`实例，然后再用这个实例来执行`fork`方法的`modulePath`参数。

输出结果为：

```javascript
I am worker args1
from parent  { msg: 'hello child' }
from child:  { msg: 'hello parent' }
child process exit
```

### exec 和 execFile

如果我们开发一种系统，那么对于不同的模块可能会用到不同的技术来实现，例如 Web服务器使用 Node ，然后再使用 Java 的消息队列提供发布订阅服务，这种情况下通常使用进程间通信的方式来实现。

但有时开发者不希望使用这么复杂的方式，或者要调用的干脆是一个黑盒系统，即**无法通过修改源码来进行来实现进程间通信**，这时候往往采用折中的方式，例如通过 shell 来调用目标服务，然后再拿到对应的输出。

`child_process`提供了一个`execFile`方法，它的声明如下：

```javascript
child_process.execFile(file, args, options, callback) 
```

说明：

- `file {String}`要运行的程序的文件名

- `args {Array}`字符串参数列表

- `options {Object}`

  - `cwd {String}`子进程的当前工作目录
  - `env {Object}`环境变量键值对
  - `encoding {String}`编码（默认为 `'utf8'`）
  - `timeout {Number}`超时（默认为 0）
  - `maxBuffer {Number}`缓冲区大小（默认为 200*1024）
  - `killSignal {String}`结束信号（默认为`'SIGTERM'`）

- `callback {Function}`进程结束时回调并带上输出

  - `error {Error}`
  - `stdout {Buffer}`
  - `stderr {Buffer}`
  - 返回：`ChildProcess`对象

可以看出，`execfile`和`spawn`在形式上的主要区别在于`execfile`提供了一个回调函数，通过这个回调函数可以获得子进程的标准输出/错误流。

使用 shell 进行跨进程调用长久以来被认为是不稳定的，这大概源于人们对控制台不友好的交互体验的恐惧（输入命令后，很可能长时间看不到一个输出，尽管后台可能在一直运算，但在用户看来和死机无异)。

在 Linux下执行`exec`命令后，原有进程会被替换成新的进程，进而失去对新进程的控制，这代表着新进程的状态也没办法获取了，此外还有 shell 本身运行出现错误，或者因为各种原因出现长时间卡顿甚至失去响应等情况。

Node.js 提供了比较好的解决方案，`timeout`解决了长时间卡顿的问题，`stdout`和`stderr`则提供了标准输出和错误输出，使得子进程的状态可以被获取。

## 方法对比

### spawn 和 execFile

为了更好地说明，我们先写一段简单的 C 语言代码，并将其命名为 `example.c`:

```javascript
#include<stdio.h>
int main() {
    printf("%s", "Hello World!");
    return 5;
}
```

使用 `gcc` 编译该文件：

```javascript
gcc example.c -o example
```

生成名为`example`的可执行文件，然后将这个可执行文件放到系统环境变量中，然后打开控制台，输入`example`，看到最后输出`"Hello World"`。

确保这个可执行文件在任意路径下都能访问。

我们分别用`spawn`和`execfile`来调用`example`文件。

首先是`spawn`。

```javascript
const spawn = require('child_process').spawn;
const ls = spawn('example');

ls.stdout.on('data', (data) => {
    console.log('stdout: ', daata.toString());
});

ls.stderr.on('data', (data) => {
    console.log('stderr: ', daata.toString());
});

ls.on('close', (code) => {
    console.log('child process exited with code', code);
});
```

程序输出：

```javascript
stdout: Hello World!
child process exited with code 5
```

程序正确打印出了`Hello World`，此外还可以看到`example`最后的`return 5`会被作为子进程结束的`code`被返回。

然后是`execFile`。

```javascript
const exec = require('child_process').exec;
const child = exec('example', (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    console.log(stdout);
});
```

同样打印出`Hello World`，可见除了调用形式不同，二者相差不大。

### execFile 和 spawn

在子进程的信息交互方面，`spawn`使用了流式处理的方式，当子进程产生数据时，主进程可以通过监听事件来获取消息；而`exec`是将所有返回的信息放在`stdout`里面一次性返回的，也就是该方法的`maxBuffer`参数，当子进程的输出超过这个大小时，会产生一个错误。

此外，`spawn`有一个名为`shell`的参数：

其类型为一个**「布尔值」**或者**「字符串」**，如果这个值被设置为`true`,，就会启动一个 shell 来执行命令，这个 shell 在 UNIX上是 bin/sh,，在Windows上则是cmd.exe。

### exec 和 execFile

`exec`在内部也是通过调用`execFile`来实现的，我们可以从源码中验证这一点，在早期的Node源码中，`exec`命令会根据当前环境来初始化一个 shell,，例如 cmd.exe 或者 bin/sh，然后在shell中调用作为参数的命令。

通常`execFile`的效率要高于`exec`，这是因为`execFile`没有启动一个 shell，而是直接调用 `spawn`来实现的。

## 进程间通信

前面介绍的几个用于创建进程的方法，都是属于`child_process`的类方法，此外`childProcess`类继承了`EventEmitter`，在`childProcess`中引入事件给进程间通信带来很大的便利。

`childProcess`中定义了如下事件。

- `Event:'close'`：进程的输入输出流关闭时会触发该事件。

- `Event:'disconnect'`：通常`childProcess.disconnect`调用后会触发这一事件。

- `Event:'exit'`：进程退出时触发。

- `Event:'message'`：调用`child_process.send`会触发这一事件

- `Event:'error'`：该事件的触发分为几种情况：

  - 该进程无法创建子进程。
  - 该进程无法通过`kill`方法关闭。
  - 无法发送消息给子进程。

`Event:'error'`事件无法保证一定会被触发，因为可能会遇到一些极端情况，例如服务器断电等。

上面也提到，`childProcess`模块定义了`send`方法，用于进程间通信，该方法的声明如下：

```javascript
child.send(message[, sendHandle[, options]][, callback])
```

通过`send`方法发送的消息，可以通过监听`message`事件来获取。

```javascript
// 创建主进程 master.js 文件
// 调用 fork 来创建一个子进程
const child_process = require('child_process');
const worker = child_process.fork('worker.js', ['args1']);
// 监听子进程退出
worker.on('exit', () => {
  console.log('child process exit');
});
// 向子进程发送消息
worker.send({ msg: 'hello child' });
// 监听子进程消息
worker.on('message', msg => {
  console.log('from child: ', msg);
});


// 创建工作进程 worker.js 文件
const begin = process.argv[2];
console.log('I am worker ' + begin);
// 监听父进程消息
process.on('message', msg => {
  console.log('from parent ', msg);
  process.exit();
});
// 向父进程发送消息
process.send({ msg: 'hello parent' });
```

`send`方法的第一个参数类型通常为一个`json`对象或者原始类型，第二个参数是一个句柄，该句柄可以是一个`net.Socket`或者`net.Server`对象。下面是一个例子：

```javascript
// master.js 父进程发送一个 Socket 对象
const child = require('child_process').fork('worker.js');
// Open up the server object and send the handle.
const server = require('net').createServer();
server.on('connection', socket => {
  socket.end('handled by parent');
});
server.listen(1337, () => {
  child.send('server', server);
});


// worker.js 子进程接收 Socket 对象
process.on('message', (m, server) => {
  if (m === 'server') {
    server.on('connection', socket => {
      socket.end('handled by child');
    });
  }
});
```

## Cluster

前面已经介绍了`child_process`的使用，`child_process`的一个重要使用场景是创建多进程服务来保证服务稳定运行。

为了统一 Node 创建多进程服务的方式，Node 在之后的版本中增加了`Cluster`模块，`Cluster`可以看作是做了封装的`child_Process`模块。

`Cluster`模块的一个显著优点是可以共享同一个`socket`连接，这代表可以使用`Cluster`模块实现简单的负载均衡。

下面是`Cluster`的简单栗子：

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log('Master process id is', process.pid);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log('worker process died, id ', worker.process.pid);
  });
} else {
  // Worker 可以共享同一个 TCP 连接
  // 这里的例子是一个 http 服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log('Worker started, process id', process.pid);
}
```

上面是使用`Cluster`模块的一个简单的例子，为了充分利用多核CPU，先调用`OS`模块的`cpus()`方法来获得CPU的核心数，假设主机装有两个 CPU，每个CPU有4个核，那么总核数就是8。

在上面的代码中，`Cluster`模块调用`fork`方法来创建子进程，该方法和`child_process`中的`fork`是同一个方法。

`Cluster`模块采用的是经典的主从模型，由`master`进程来管理所有的子进程，可以使用`cluster.isMaster`属性判断当前进程是`master`还是`worker`，其中主进程不负责具体的任务处理，其主要工作是负责调度和管理，上面的代码中，所有的子进程都监听8000端口。

通常情况下，如果多个 Node 进程监听同一个端口时会出现`Error: listen EADDRINUS`的错误，而`Cluster`模块能够让多个子进程监听同一个端口的原因是`master`进程内部启动了一个 TCP 服务器，而真正监听端口的只有这个服务器，当来自前端的请求触发服务器的`connection`事件后，`master`会将对应的`socket`句柄发送给子进程。
