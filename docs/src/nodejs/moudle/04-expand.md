# 扩展模块

## C/C++扩展模块

JavaScript的一个典型弱点就是位运算。JavaScript的位运算参照Java的位运算实现，但是Java位运算是在int型数字的基础上进行的，而JavaScript中只有double型的数据类型，在进行位运算的过程中，需要将double型转换为int型，然后再进行。所以，在JavaScript层面上做位运算的效率不高。

在应用中，会频繁出现位运算的需求，包括转码、编码等过程，如果通过JavaScript来实现，CPU资源将会耗费很多，这时编写C/C++扩展模块来提升性能的机会来了。

C/C++扩展模块属于文件模块中的一类。前面讲述文件模块的编译部分时提到，C/C++模块通过预先编译为.node文件，然后调用process.dlopen()方法加载执行。在这一节中，我们将分析整个C/C++扩展模块的编写、编译、加载、导出的过程。

在开始编写扩展模块之前，需要强调的一点是，Node的原生模块一定程度上是可以跨平台的，其前提条件是源代码可以支持在nix和Windows上编译，其中nix下通过g++/gcc等编译器编译为动态链接共享对象文件（.so），在Windows下则需要通过Visual C++的编译器编译为动态链接库文件（.dll）。这里有一个让人迷惑的地方，那就是引用加载时却是.node文件。其实.node的扩展名只是为了看起来更自然一点，不会因为平台差异产生不同的感觉。实际上，在Windows下它是一个.dll文件，在*nix下则是一个.so文件。为了实现跨平台，dlopen()方法在内部实现时区分了平台，分别用的是加载.so和.dll的方式。图2-6为扩展模块在不同平台上编译和加载的详细过程。

值得注意的是，一个平台下的.node文件在另一个平台下是无法加载执行的，必须重新用各自平台下的编译器编译为正确的.node文件。

![An image](/img/nodejs/moudle/07.png)

### 前提条件

如果想要编写高质量的C/C++扩展模块，还需要深厚的C/C++编程功底才行。除此之外，以下这些条目都是不能避开的，在了解它们之后，可以让你在编写过程中事半功倍。

### GYP项目生成工具

即“Generate Your Projects”短句的缩写。它的好处在于，可以帮助你生成各个平台下的项目文件，比如Windows下的Visual Studio解决方案文件（.sln）、Mac下的XCode项目配置文件以及Scons工具。在这个基础上，再动用各自平台下的编译器编译项目。这大大减少了跨平台模块在项目组织上的精力投入。

Node源码中一度出现过各种项目文件，后来均统一为GYP工具。这除了可以减少编写跨平台项目文件的工作量外，另一个简单的原因就是Node自身的源码就是通过GYP编译的。为此，Nathan Rajlich基于GYP为Node提供了一个专有的扩展构建工具node-gyp，这个工具通过`npm install -g node-gyp`这个命令即可安装。

V8引擎C++库。V8是Node自身的动力来源之一。它自身由C++写成，可以实现JavaScript与C++的互相调用。

libuv库。它是Node自身的动力来源之二。Node能够实现跨平台的一个诀窍就是它的libuv库，这个库是跨平台的一层封装，通过它去调用一些底层操作，比自己在各个平台下编写实现要高效得多。libuv封装的功能包括事件循环、文件操作等。

Node内部库。写C++模块时，免不了要做一些面向对象的编程工作，而Node自身提供了一些C++代码，比如node::ObjectWrap类可以用来包装你的自定义类，它可以帮助实现对象回收等工作。

其他库。其他存在deps目录下的库在编写扩展模块时也许可以帮助你，比如zlib、openssl、http_parser等。

### C/C++扩展模块的编写

在介绍C/C++内建模块时，其实已经介绍了C/C++模块的编写方式。普通的扩展模块与内建模块的区别在于无须将源代码编译进Node，而是通过`dlopen()`方法动态加载。所以在编写普通的扩展模块时，无须将源代码写进node命名空间，也不需要提供头文件。下面我们将采用同一个例子来介绍C/C++扩展模块的编写。

它的JavaScript原型代码与前面的例子一样：

```javascript
exports.sayHello = function () { 
	return 'Hello world!'; 
};
```

新建hello目录作为自己的项目位置，编写hello.cc并将其存储到src目录下，相关代码如下：

```c
#include <node.h> 
#include <v8.h>

using namespace v8; 
// 实现预定义的方法
Handle<Value> SayHello(const Arguments& args) { 
    HandleScope scope; 
    return scope.Close(String::New("Hello world!")); 
}

// 给传入的目标对象添加sayHello()方法
void Init_Hello(Handle<Object> target) { 
	target->Set(String::NewSymbol("sayHello"), FunctionTemplate::New(SayHello)->GetFunction()); 
} 
// 调用NODE_MODULE()方法将注册方法定义到内存中
NODE_MODULE(hello, Init_Hello)
```

C/C++扩展模块与内建模块的套路一样，将方法挂载在target对象上，然后通过`NODE_MODULE`声明即可。

由于不像编写内建模块那样将对象声明到node_module_list链表中，所以无法被认作是一个原生模块，只能通过`dlopen()`来动态加载，然后导出给JavaScript调用。

### C/C++扩展模块的编译

在GYP工具的帮助下，C/C++扩展模块的编译是一件省心的事情，无须为每个平台编写不同的项目编译文件。写好.gyp项目文件是除编码外的头等大事，然而你也无须担心此事太难，因为.gyp项目文件是足够简单的。node-gyp约定.gyp文件为binding.gyp，其内容如下所示：

```json
{ 
	'targets': [ 
		{ 
            'target_name': 'hello', 
            'sources': [ 
                'src/hello.cc' 
            ], 
			'conditions': [ 
				['OS == "win"', 
				{ 
					'libraries': ['-lnode.lib'] 
				} 
				] 
			] 
		} 
	] 
}
```

执行：

```sh
node-gyp configure

# 输出
gyp info it worked if it ends with ok 
gyp info using node-gyp@0.8.3 
gyp info using node@0.8.14 | darwin | x64 
gyp info spawn python 
gyp info spawn args [ '/usr/local/lib/node_modules/node-gyp/gyp/gyp', 
gyp info spawn args 'binding.gyp', 
gyp info spawn args '-f', 
gyp info spawn args 'make', 
gyp info spawn args '-I', 
gyp info spawn args '/Users/jacksontian/git/diveintonode/examples/02/addon/build/config.gypi', 
gyp info spawn args '-I', 
gyp info spawn args '/usr/local/lib/node_modules/node-gyp/addon.gypi', 
gyp info spawn args '-I', 
gyp info spawn args '/Users/jacksontian/.node-gyp/0.8.14/common.gypi', 
gyp info spawn args '-Dlibrary=shared_library', 
gyp info spawn args '-Dvisibility=default', 
gyp info spawn args '-Dnode_root_dir=/Users/jacksontian/.node-gyp/0.8.14', 
gyp info spawn args '-Dmodule_root_dir=/Users/jacksontian/git/diveintonode/examples/02/addon', 
gyp info spawn args '--depth=.', 
gyp info spawn args '--generator-output', 
gyp info spawn args 'build', 
gyp info spawn args '-Goutput_dir=.' ] 
gyp info ok
```

node-gyp configure这个命令会在当前目录中创建build目录，并生成系统相关的项目文件。 在*nix平台下，build目录中会出现Makefile等文件；在Windows下，则会生成vcxproj等文件。继续执行如下代码：

```sh
node-gyp build

# 输出
gyp info it worked if it ends with ok 
gyp info using node-gyp@0.8.3 
gyp info using node@0.8.14 | darwin | x64 
gyp info spawn make 
gyp info spawn args [ 'BUILDTYPE=Release', '-C', 'build' ] 
 CXX(target) Release/obj.target/hello/hello.o 
 SOLINK_MODULE(target) Release/hello.node 
 SOLINK_MODULE(target) Release/hello.node: Finished 
gyp info ok
```

编译过程会根据平台不同，分别通过make或vcbuild进行编译。编译完成后，`hello.node`文件会生成在`build/Release`目录下。

### C/C++扩展模块的加载

得到`hello.node`结果文件后，如何调用扩展模块其实在前面已经提及。`require()`方法通过解析标识符、路径分析、文件定位，然后加载执行即可。下面的代码引入前面编译得到的`.node`文件，并调用执行其中的方法：

```javascript
var hello = require('./build/Release/hello.node'); 
console.log(hello.sayHello());
```

以上代码存为hello.js，调用node hello.js命令即可得到如下的输出结果：

```txt
Hello world!
```

对于以.node为扩展名的文件，Node将会调用process.dlopen()方法去加载文件：

```javascript
//Native extension for .node 
Module._extensions['.node'] = process.dlopen;
```

对于调用者而言，require()是轻松愉快的。对于扩展模块的编写者来说，`process.dlopen()`中隐含的过程值得了解一番。

`require()`在引入.node文件的过程中，实际上经历了4个层面上的调用。

加载`.node`文件实际上经历了两个步骤，第一个步骤是调用`uv_dlopen()`方法去打开动态链接库，第二个步骤是调用`uv_dlsym()`方法找到动态链接库中通过`NODE_MODULE`宏定义的方法地址。这两个过程都是通过libuv库进行封装的：在*nix平台下实际上调用的是dlfcn.h头文件中定义的`dlopen()`和`dlsym()`两个方法；在Windows平台则是通过`LoadLibraryExW()`和`GetProcAddress()`这两个方法实现的，它们分别加载.so和.dll文件（实际为`.node`文件）。

![An image](/img/nodejs/moudle/08.png)

这里对libuv函数的调用充分表现Node利用libuv实现跨平台的方式，这样的情景在很多地方还会出现。

由于编写模块时通过NODE_MODULE将模块定义为node_module_struct结构，所以在获取函数地址之后，将它映射为node_module_struct结构几乎是无缝对接的。接下来的过程就是将传入的exports对象作为实参运行，将C++中定义的方法挂载在exports对象上，然后调用者就可以轻松调用了。

C/C++扩展模块与JavaScript模块的区别在于加载之后不需要编译，直接执行之后就可以被外部调用了，其加载速度比JavaScript模块略快。

使用C/C++扩展模块的一个好处在于可以更灵活和动态地加载它们，保持Node模块自身简单性的同时，给予Node无限的可扩展性。
