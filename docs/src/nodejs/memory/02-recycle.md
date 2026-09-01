# V8 垃圾回收机制

## V8主要的垃圾回收算法

V8的垃圾回收策略主要基于**分代式垃圾回收机制**。在自动垃圾回收的演变过程中，人们发现没有一种垃圾回收算法能够胜任所有的场景。因为在实际的应用中，对象的生存周期长短不一，不同的算法只能针对特定情况具有最好的效果。为此，统计学在垃圾回收算法的发展中产生了较大的作用，现代的垃圾回收算法中按对象的存活时间将内存的垃圾回收进行不同的分代，然后分别对不同分代的内存施以更高效的算法。

**V8的内存分代：**

在V8中，主要将内存分为**新生代和老生代**两代。

**新生代中的对象为存活时间较短的对象，老生代中的对象为存活时间较长或常驻内存的对象。**

![An image](/img/nodejs/memory/01.png)

V8堆的整体大小就是新生代所用内存空间加上老生代的内存空间。

`--max-old-space-size`命令行参数可以用于设置老生代内存空间的最大值，

`--max-new-space-size`命令行参数则用于设置新生代内存空间的大小的。

### Scavenge算法

在分代的基础上，新生代中的对象主要通过Scavenge算法进行垃圾回收。主要采用了Cheney算法，该算法由C. J. Cheney于1970年首次发表在ACM论文上。

Cheney算法是一种采用复制的方式实现的垃圾回收算法。它将堆内存一分为二，每一部分空间称为semispace。在这两个semispace空间中，只有一个处于使用中，另一个处于闲置状态。处于使用状态的semispace空间称为From空间，处于闲置状态的空间称为To空间。当我们分配对象时，先是在From空间中进行分配。当开始进行垃圾回收时，会检查From空间中的存活对象，这些存活对象将被复制到To空间中，而非存活对象占用的空间将会被释放。完成复制后，From空间和To空间的角色发生对换。简而言之，在垃圾回收的过程中，就是通过将存活对象在两个semispace空间之间进行复制。

**Scavenge的缺点是只能使用堆内存中的一半，这是由划分空间和复制机制所决定的。但Scavenge由于只复制存活的对象，并且对于生命周期短的场景存活对象只占少部分，所以它在时间效率上有优异的表现。**

由于Scavenge是典型的牺牲空间换取时间的算法，所以无法大规模地应用到所有的垃圾回收中。但可以发现，Scavenge非常适合应用在新生代中，因为新生代中对象的生命周期较短，恰恰适合这个算法。

![An image](/img/nodejs/memory/02.png)

实际使用的堆内存是新生代中的两个semispace空间大小和老生代所用内存大小之和。当一个对象经过多次复制依然存活时，它将会被认为是生命周期较长的对象。这种较长生命周期的对象随后会被移动到老生代中，采用新的算法进行管理。**对象从新生代中移动到老生代中的过程称为晋升。**

在单纯的Scavenge过程中，From空间中的存活对象会被复制到To空间中去，然后对From空间和To空间进行角色对换（又称翻转）。但在分代式垃圾回收的前提下，From空间中的存活对象在复制到To空间之前需要进行检查。在一定条件下，需要将存活周期长的对象移动到老生代中，也就是完成对象晋升。

**对象晋升的条件主要有两个，一个是对象是否经历过Scavenge回收，一个是To空间的内存占用比超过限制。**

在默认情况下，V8的对象分配主要集中在From空间中。对象从From空间中复制到To空间时，会检查它的内存地址来判断这个对象是否已经经历过一次Scavenge回收。如果已经经历过了，会将该对象从From空间复制到老生代空间中，如果没有，则复制到To空间中。

![An image](/img/nodejs/memory/03.png)

另一个判断条件是To空间的内存占用比。当要从From空间复制一个对象到To空间时，如果To空间已经使用了超过25%，则这个对象直接晋升到老生代空间中。

设置25%这个限制值的原因是当这次Scavenge回收完成后，这个To空间将变成From空间，接下来的内存分配将在这个空间中进行。如果占比过高，会影响后续的内存分配。

对象晋升后，将会在老生代空间中作为存活周期较长的对象来对待，接受新的回收算法处理。

### Mark-Sweep & Mark-Compact

对于老生代中的对象，由于存活对象占较大比重，再采用Scavenge的方式会有两个问题：一个是存活对象较多，复制存活对象的效率将会很低；另一个问题依然是浪费一半空间的问题。这两个问题导致应对生命周期较长的对象时Scavenge会显得捉襟见肘。为此，V8在老生代中主要采用了Mark-Sweep和Mark-Compact相结合的方式进行垃圾回收。

Mark-Sweep是标记清除的意思，它分为标记和清除两个阶段。与Scavenge相比，Mark-Sweep并不将内存空间划分为两半，所以不存在浪费一半空间的行为。与Scavenge复制活着的对象不同，Mark-Sweep在标记阶段遍历堆中的所有对象，并标记活着的对象，在随后的清除阶段中，只清除没有被标记的对象。可以看出，Scavenge中只复制活着的对象，而Mark-Sweep只清理死亡对象。活对象在新生代中只占较小部分，死对象在老生代中只占较小部分，这是两种回收方式能高效处理的原因。

图为Mark-Sweep在老生代空间中标记后的示意图，黑色部分标记为死亡的对象。

![An image](/img/nodejs/memory/04.png)

Mark-Sweep最大的问题是在进行一次标记清除回收后，内存空间会出现不连续的状态。这种内存碎片会对后续的内存分配造成问题，因为很可能出现需要分配一个大对象的情况，这时所有的碎片空间都无法完成此次分配，就会提前触发垃圾回收，而这次回收是不必要的。

为了解决Mark-Sweep的内存碎片问题，Mark-Compact被提出来。Mark-Compact是标记整理的意思，是在Mark-Sweep的基础上演变而来的。它们的差别在于对象在标记为死亡后，在整理的过程中，将活着的对象往一端移动，移动完成后，直接清理掉边界外的内存。

图为Mark-Compact完成标记并移动存活对象后的示意图，白色格子为存活对象，深色格子为死亡对象，浅色格子为存活对象移动后留下的空洞。

![An image](/img/nodejs/memory/05.png)

完成移动后，就可以直接清除最右边的存活对象后面的内存区域完成回收。这里将Mark-Sweep和Mark-Compact结合着介绍不仅仅是因为两种策略是递进关系，在V8的回收策略中两者是结合使用的。

| 回收算法     | Mark-Sweep   | Mark-Compact | Scavenge           |
| ------------ | ------------ | ------------ | ------------------ |
| 速度         | 中等         | 最慢         | 最快               |
| 空间开销     | 少（有碎片） | 少（无碎片） | 双倍空间（无碎片） |
| 是否移动对象 | 否           | 是           | 是                 |

在Mark-Sweep和Mark-Compact之间，由于Mark-Compact需要移动对象，所以它的执行速度不可能很快，所以在取舍上，V8主要使用Mark-Sweep，在空间不足以对从新生代中晋升过来的对象进行分配时才使用Mark-Compact。

### Incremental Marking

为了避免出现JavaScript应用逻辑与垃圾回收器看到的不一致的情况，**垃圾回收的3种基本算法都需要将应用逻辑暂停下来，待执行完垃圾回收后再恢复执行应用逻辑，这种行为被称为“全停顿”（stop-the-world）。**

在V8的分代式垃圾回收中，一次小垃圾回收只收集新生代，由于新生代默认配置得较小，且其中存活对象通常较少，所以即便它是全停顿的影响也不大。但V8的老生代通常配置得较大，且存活对象较多，全堆垃圾回收（full 垃圾回收）的标记、清理、整理等动作造成的停顿就会比较可怕，需要设法改善。

为了降低全堆垃圾回收带来的停顿时间，V8先从标记阶段入手，将原本要一口气停顿完成的动作改为**增量标记（incremental marking）**，也就是拆分为许多小“步进”，每做完一“步进”就让JavaScript应用逻辑执行一小会儿，垃圾回收与应用逻辑交替执行直到标记阶段完成。

![An image](/img/nodejs/memory/06.png)

V8在经过增量标记的改进后，垃圾回收的最大停顿时间可以减少到原本的1/6左右。

## 总结

从V8的自动垃圾回收机制的设计角度可以看到，V8对内存使用进行限制的缘由。新生代设计为一个较小的内存空间是合理的，而老生代空间过大对于垃圾回收并无特别意义。

对于Node编写的服务器端来说，内存限制也并不影响正常场景下的使用。但是对于V8的垃圾回收特点和JavaScript在单线程上的执行情况，垃圾回收是影响性能的因素之一。想要高性能的执行效率，需要注意让垃圾回收尽量少地进行，尤其是全堆垃圾回收。

以Web服务器中的会话实现为例，一般通过内存来存储，但在访问量大的时候会导致老生代中的存活对象骤增，不仅造成清理/整理过程费时，还会造成内存紧张，甚至溢出。

## 查看垃圾回收日志

查看垃圾回收日志的方式主要是在启动时添加--trace_gc参数。

```txt
[33336:000002227D311020]       48 ms: Scavenge 5.0 (5.3) -> 4.4 (6.3) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[33336:000002227D311020]       59 ms: Scavenge 5.0 (6.3) -> 4.5 (6.8) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[33336:000002227D311020]       75 ms: Scavenge 5.5 (6.8) -> 4.9 (7.3) MB, 0.5 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[33336:000002227D311020]       91 ms: Scavenge 5.8 (7.3) -> 5.2 (9.8) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[33336:000002227D311020]      118 ms: Scavenge 7.5 (10.0) -> 6.2 (10.3) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[33336:000002227D311020]      147 ms: Scavenge 8.0 (10.5) -> 6.9 (11.5) MB, 0.9 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[33336:000002227D311020]      178 ms: Scavenge 10.0 (12.6) -> 8.8 (17.6) MB, 0.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
```

通过在Node启动时使用--prof参数，可以得到V8执行时的性能分析数据，其中包含了垃圾回收执行时占用的时间。

这将会在目录下得到一个v8.log日志文件。该日志文件基本不具备可读性。

```txt
heap-capacity,1031072
heap-available,2198652736
new,MemoryChunk,0x25cd0400000,262144
new,MemoryChunk,0xff97a40000,262144
new,MemoryChunk,0x34b11b40000,262144
code-creation,Builtin,2,183094,0x7ff70bef6f54,1356,RecordWriteEmitRememberedSetSaveFP
code-creation,Builtin,2,183109,0x7ff70bef74b4,448,RecordWriteOmitRememberedSetSaveFP
```

早期我们需要借助` node-tick-processor `这样的工具解析 v8.log

在 v5.2.0 之后包含了 v8.log 处理器，添加命令行参数 `--prof-process` 即可。

```sh
$ node --prof-process isolate-00000253827E8890-30172-v8.log
Statistical profiling result from isolate-00000253827E8890-30172-v8.log, (1883 ticks, 0 unaccounted, 0 excluded).

 [Shared libraries]:
   ticks  total  nonlib   name
   1647   87.5%          C:\WINDOWS\SYSTEM32\ntdll.dll
    231   12.3%          C:\Program Files\nodejs\node.exe

 [JavaScript]:
   ticks  total  nonlib   name
      4    0.2%   80.0%  LazyCompile: *resolve node:path:158:10
      1    0.1%   20.0%  LazyCompile: *Module._nodeModulePaths node:internal/modules/cjs/loader:623:37

 [C++]:
   ticks  total  nonlib   name

 [Summary]:
   ticks  total  nonlib   name
      5    0.3%  100.0%  JavaScript
      0    0.0%    0.0%  C++
      8    0.4%  160.0%  GC
   1878   99.7%          Shared libraries

 [C++ entry points]:
   ticks    cpp   total   name

 [Bottom up (heavy) profile]:
  Note: percentage shows a share of a particular caller in the total
  amount of its parent calls.
  Callers occupying less than 1.0% are not shown.
```

其中垃圾回收部分如下

```sh
[Summary]:
   ticks  total  nonlib   name
    8    0.4%  160.0%  GC
```
