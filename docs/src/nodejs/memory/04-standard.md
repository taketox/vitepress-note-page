# 内存指标

一般而言，应用中存在一些全局性的对象是正常的，而且在正常的使用中，变量都会自动释放回收。但是也会存在一些我们认为会回收但是却没有被回收的对象，这会导致内存占用无限增长。一旦增长达到V8的内存限制，将会得到内存溢出错误，进而导致进程退出。

## 查看内存使用情况

除此`process.memoryUsage()`可以查看内存使用情况。`os`模块中的`totalmem()`和`freemem()`方法也可以查看内存使用情况。

### 查看进程的内存占用

调用`process.memoryUsage()`可以看到Node进程的内存占用情况

```sh
node
Welcome to Node.js v16.18.1.
Type ".help" for more information.
> process.memoryUsage()
{
  rss: 33239040,
  heapTotal: 7114752,
  heapUsed: 5396904,
  external: 994544,
  arrayBuffers: 27666
}
```

`rss`是resident set size的缩写，即进程的常驻内存部分。

进程的内存总共有几部分，一部分是`rss`，其余部分在交换区（swap）或者文件系统（filesystem）中。

除了`rss`外，`heapTotal`和`heapUsed`对应的是V8的堆内存信息。

`heapTotal`是堆中总共申请的内存量，`heapUsed`表示目前堆中使用中的内存量。

`external`: 外部内存使用量，表示绑定到该进程的共享库或资源的内存使用量。

`arrayBuffers`: 用于存储原始二进制数据的数组缓冲区的数量。用于处理大量数据，例如在处理图像、音频、视频或其他二进制文件时。

```javascript
var showMem = function () {
    var mem = process.memoryUsage();
    var format = function (bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    console.log('Process: heapTotal ' + format(mem.heapTotal) +
        ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
    console.log('-----------------------------------------------------------');
};

// 写一个方法用于不停地分配内存但不释放内存
var useMem = function () {
    var size = 20 * 1024 * 1024;
    var arr = new Array(size);
    for (var i = 0; i < size; i++) {
        arr[i] = 0;
    }
    return arr;
};
var total = [];
for (var j = 0; j < 15; j++) {
    showMem();
    total.push(useMem());
}
showMem();

// 输出
Process: heapTotal 5.04 MB heapUsed 4.28 MB rss 29.79 MB
-----------------------------------------------------------
Process: heapTotal 165.29 MB heapUsed 164.58 MB rss 189.95 MB
-----------------------------------------------------------
Process: heapTotal 326.30 MB heapUsed 324.39 MB rss 350.25 MB
-----------------------------------------------------------
Process: heapTotal 489.06 MB heapUsed 484.38 MB rss 510.61 MB
-----------------------------------------------------------
Process: heapTotal 653.07 MB heapUsed 644.38 MB rss 670.88 MB
-----------------------------------------------------------
Process: heapTotal 821.07 MB heapUsed 804.38 MB rss 831.32 MB
-----------------------------------------------------------
Process: heapTotal 997.08 MB heapUsed 964.38 MB rss 981.86 MB
-----------------------------------------------------------
Process: heapTotal 1156.84 MB heapUsed 1123.53 MB rss 1106.95 MB
-----------------------------------------------------------
Process: heapTotal 1316.85 MB heapUsed 1283.68 MB rss 1266.96 MB
-----------------------------------------------------------
Process: heapTotal 1476.86 MB heapUsed 1443.73 MB rss 1427.09 MB
-----------------------------------------------------------
Process: heapTotal 1636.86 MB heapUsed 1603.70 MB rss 1587.10 MB
-----------------------------------------------------------
Process: heapTotal 1796.87 MB heapUsed 1763.70 MB rss 1747.12 MB
-----------------------------------------------------------
Process: heapTotal 1956.88 MB heapUsed 1923.73 MB rss 1851.53 MB
-----------------------------------------------------------
Process: heapTotal 2116.39 MB heapUsed 2083.54 MB rss 1777.28 MB
-----------------------------------------------------------

<--- Last few GCs --->

[12744:00000174FF156510]     2681 ms: Mark-sweep 1923.6 (1956.9) -> 1923.4 (1956.4) MB, 274.3 / 0.0 ms  (+ 0.2 ms in 2 steps since start of marking, biggest step 0.2 ms, walltime since start of marking 851 ms) (average mu = 0.808, current mu = 0.808) allo[12744:00000174FF156510]     3475 ms: Mark-sweep 2083.4 (2116.4) -> 2083.4 (2116.4) MB, 622.9 / 0.0 ms  (average mu = 0.597, current mu = 0.216) allocation failure scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
 1: 00007FF6EED70B5F v8::internal::CodeObjectRegistry::~CodeObjectRegistry+124015
 2: 00007FF6EECFC916 v8::internal::wasm::WasmCode::safepoint_table_offset+64182
 3: 00007FF6EECFD992 v8::internal::wasm::WasmCode::safepoint_table_offset+68402
 4: 00007FF6EF631D94 v8::Isolate::ReportExternalAllocationLimitReached+116
 5: 00007FF6EF61C35D v8::SharedArrayBuffer::Externalize+781
 6: 00007FF6EF4BF93C v8::internal::Heap::EphemeronKeyWriteBarrierFromCode+1468
 7: 00007FF6EF4BCA54 v8::internal::Heap::CollectGarbage+4244
 8: 00007FF6EF4BA3D0 v8::internal::Heap::AllocateExternalBackingStore+2000
 9: 00007FF6EF4D80E0 v8::internal::FreeListManyCached::Reset+1408
10: 00007FF6EF4D8795 v8::internal::Factory::AllocateRaw+37
11: 00007FF6EF4EA73E v8::internal::FactoryBase<v8::internal::Factory>::AllocateRawArray+46
12: 00007FF6EF4ED37A v8::internal::FactoryBase<v8::internal::Factory>::NewFixedArrayWithFiller+74
13: 00007FF6EF4ED29D v8::internal::FactoryBase<v8::internal::Factory>::NewFixedArray+77
14: 00007FF6EF3964E3 v8::internal::FeedbackNexus::ic_state+61859
15: 00007FF6EF3BDCA7 v8::Context::GetIsolate+83639
16: 00007FF6EF3BCF0F v8::Context::GetIsolate+80159
17: 00007FF6EF310CF0 v8::internal::JSArray::SetLength+240
18: 00007FF6EF38FA19 v8::internal::FeedbackNexus::ic_state+34521
19: 00007FF6EF221545 v8::internal::CompilationCache::IsEnabledScriptAndEval+27765
20: 00007FF6EF6BFA71 v8::internal::SetupIsolateDelegate::SetupHeap+494417
21: 000001748148F3B3
```

### 查看系统的内存占用

与`process.memoryUsage()`不同的是，`os`模块中的`totalmem()`和`freemem()`这两个方法用于查看操作系统的内存使用情况，它们分别返回系统的总内存和闲置内存，以字节为单位。

```sh
> os.totalmem()
16542044160
> os.freemem()
2699427840
```

从输出信息可以看到我的电脑的总内存为16 GB，当前闲置内存大致为2.5 GB。

### 堆外内存

通过`process.momoryUsage()`的结果可以看到，堆中的内存用量总是小于进程的常驻内存用量，这意味着Node中的内存使用并非都是通过V8进行分配的。我们将那些**不是通过V8分配的内存称为堆外内存**。

```javascript
var showMem = function () {
    var mem = process.memoryUsage();
    var format = function (bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    console.log('Process: heapTotal ' + format(mem.heapTotal) +
        ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
    console.log('-----------------------------------------------------------');
};

// 写一个方法用于不停地分配内存但不释放内存
// 将Array变为Buffer，将size变大，每一次构造200 MB的对象
var useMem = function () {
    var size = 200 * 1024 * 1024;
    var arr = new Buffer.alloc(size);
    for (var i = 0; i < size; i++) {
        arr[i] = 0;
    }
    return arr;
};
var total = [];
for (var j = 0; j < 15; j++) {
    showMem();
    total.push(useMem());
}
showMem();

// 输出
Process: heapTotal 5.04 MB heapUsed 4.28 MB rss 23.74 MB
-----------------------------------------------------------
Process: heapTotal 5.29 MB heapUsed 4.58 MB rss 224.32 MB
-----------------------------------------------------------
Process: heapTotal 6.29 MB heapUsed 4.38 MB rss 424.66 MB
-----------------------------------------------------------
Process: heapTotal 6.79 MB heapUsed 3.52 MB rss 624.74 MB
-----------------------------------------------------------
Process: heapTotal 6.79 MB heapUsed 3.52 MB rss 824.77 MB
-----------------------------------------------------------
Process: heapTotal 5.79 MB heapUsed 3.55 MB rss 1024.77 MB
-----------------------------------------------------------
Process: heapTotal 5.79 MB heapUsed 3.52 MB rss 1224.36 MB
-----------------------------------------------------------
Process: heapTotal 5.79 MB heapUsed 3.55 MB rss 1424.38 MB
-----------------------------------------------------------
Process: heapTotal 5.79 MB heapUsed 3.58 MB rss 1624.41 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.78 MB rss 1824.43 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.78 MB rss 2022.04 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.78 MB rss 2222.05 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.46 MB rss 2391.67 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.46 MB rss 2488.01 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.51 MB rss 2688.02 MB
-----------------------------------------------------------
Process: heapTotal 6.04 MB heapUsed 3.46 MB rss 2888.02 MB
-----------------------------------------------------------
```

可以看到`heapTotal`与`heapUsed`的变化极小，唯一变化的是`rss`的值，并且该值已经远远超过V8的限制值。这其中的原因是Buffer对象不同于其他对象，它不经过V8的内存分配机制，所以也不会有堆内存的大小限制。

## 总结

Node的内存构成主要由通过V8进行分配的部分和Node自行分配的部分。受V8的垃圾回收限制的主要是V8的堆内存。
