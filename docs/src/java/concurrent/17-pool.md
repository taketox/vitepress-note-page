# 线程池使用

## 基本概述

线程池：一个容纳多个线程的容器，容器中的线程可以重复使用，省去了频繁创建和销毁线程对象的操作

线程池中的重要角色：

1. 核心线程：线程池维护着多个“活”线程，它能通过while(true)不断检查是否有任务需要执行，从而避免多次调用、销毁产生的时间代价太大问题，这种“活”线程就被称为核心线程。每当有新任务提交时，首先检查核心线程数是否已满，没满就创建核心线程来执行任务。否则，放进等待队列中。
2. 等待队列：等待队列用于存储当核心线程都在忙时，继续新增的任务，核心线程在执行完当前任务后，也会去等待队列拉取任务继续执行，这个队列一般是一个线程安全的阻塞队列，它的容量也可以由开发者根据业务来定制。
3. 救急线程：当等待队列满了，并且当前线程数没有超过最大线程数（maximumPoolSize），则会新建线程执行任务，这种情况下新建的线程我们通常称为非核心线程（救急线程）。

> “核心线程”和“非核心线程”本质上并没有什么区别，创建出来的线程也根本没有标识去区分它们是核心还是非核心的，它们只是一个虚拟的概念。线程池只会去判断已有的线程数（包括核心和非核心）去跟核心线程数和最大线程数比较，来决定下一步的策略。
>
> 当线程池中的线程超过了和核心线程数时，会将多出来的线程销毁，很多人误以为只会把“非核心线程”销毁掉，现在我们知道了，这两者之间并没有本质上的区别，所以，销毁的时候是随机的，可能是“核心线程”也可能是“非核心线程”

线程池作用：

1. 降低资源消耗，减少了创建和销毁线程的次数，每个工作线程都可以被重复利用，可执行多个任务
2. 提高响应速度，当任务到达时，如果有线程可以直接用，不会出现系统僵死
3. 提高线程的可管理性，如果无限制的创建线程，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控

线程池的核心思想：**线程复用**，同一个线程可以被重复使用，来处理多个任务

池化技术 (Pool) ：一种编程技巧，核心思想是资源复用，在请求量大时能优化应用性能，降低系统频繁建连的资源开销

## 创建线程池

### Executor

存放线程的容器：

```java
private final HashSet<Worker> workers = new HashSet<Worker>();
```

构造方法：

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
```

参数介绍：

- **corePoolSize**：核心线程数，定义了最小可以同时运行的线程数量

- **maximumPoolSize**：最大线程数，当队列中存放的任务达到队列容量时，当前可以同时运行的数量变为最大线程数，创建线程并立即执行最新的任务，与核心线程数之间的差值又叫救急线程数

- **keepAliveTime**：救急线程最大存活时间，当线程池中的线程数量大于 `corePoolSize` 的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等到 `keepAliveTime` 时间超过销毁

- **unit**：`keepAliveTime` 参数的时间单位

- **workQueue**：阻塞队列，存放被提交但尚未被执行的任务

- **threadFactory**：线程工厂，创建新线程时用到，可以为线程创建时起名字

- **handler**：拒绝策略，线程到达最大线程数仍有新任务时会执行拒绝策略

  **RejectedExecutionHandler** 下有 4 个实现类：

  - **AbortPolicy**：让调用者抛出 RejectedExecutionException 异常，**默认策略**
  - **CallerRunsPolicy**：让调用者运行的调节机制，将某些任务回退到调用者，从而降低新任务的流量
  - **DiscardPolicy**：直接丢弃任务，不予任何处理也不抛出异常
  - **DiscardOldestPolicy**：放弃队列中最早的任务，把当前任务加入队列中尝试再次提交当前任务

  补充：其他框架拒绝策略

  - **Dubbo**：在抛出 RejectedExecutionException 异常前记录日志，并 dump 线程栈信息，方便定位问题
  - **Netty**：创建一个新线程来执行任务
  - **ActiveMQ**：带超时等待（60s）尝试放入队列
  - **PinPoint**：它使用了一个拒绝策略链，会逐一尝试策略链中每种拒绝策略

工作原理：

![An image](/img/java/concurrent/37.png)

1. 创建线程池，这时没有创建线程（**懒惰**），等待提交过来的任务请求，调用 execute 方法才会创建线程
2. 当调用 execute() 方法添加一个请求任务时，线程池会做如下判断：
   - 如果正在运行的线程数量小于 corePoolSize，那么马上创建线程运行这个任务
   - 如果正在运行的线程数量大于或等于 corePoolSize，那么将这个任务放入队列
   - 如果这时队列满了且正在运行的线程数量还小于 maximumPoolSize，那么会创建非核心线程**立刻运行这个任务**，对于阻塞队列中的任务不公平。这是因为创建每个 Worker（线程）对象会绑定一个初始任务，启动 Worker 时会优先执行
   - 如果队列满了且正在运行的线程数量大于或等于 maximumPoolSize，那么线程池会启动饱和**拒绝策略**来执行
3. 当一个线程完成任务时，会从队列中取下一个任务来执行
4. 当一个线程空闲超过一定的时间（keepAliveTime）时，线程池会判断：如果当前运行的线程数大于 corePoolSize，那么这个线程就被停掉，所以线程池的所有任务完成后最终会收缩到 corePoolSize 大小

### Executors

Executors 提供了四种线程池的创建：newCachedThreadPool、newFixedThreadPool、newSingleThreadExecutor、newScheduledThreadPool

#### newFixedThreadPool

创建一个拥有 n 个线程的线程池

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads, 0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

- 核心线程数 == 最大线程数（没有救急线程被创建），因此也无需超时时间
- LinkedBlockingQueue 是一个单向链表实现的阻塞队列，默认大小为 `Integer.MAX_VALUE`，也就是无界队列，可以放任意数量的任务，在任务比较多的时候会导致 OOM（内存溢出）
- 适用于任务量已知，相对耗时的长期任务

#### newCachedThreadPool

创建一个可扩容的线程池

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

- 核心线程数是 0， 最大线程数是 29 个 1，全部都是救急线程（60s 后可以回收），可能会创建大量线程，从而导致 **OOM**
- SynchronousQueue 作为阻塞队列，没有容量，对于每一个 take 的线程会阻塞直到有一个 put 的线程放入元素为止（类似一手交钱、一手交货）
- 适合任务数比较密集，但每个任务执行时间较短的情况

#### newSingleThreadExecutor

创建一个只有 1 个线程的单线程池

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

- 保证所有任务按照**指定顺序执行**，线程数固定为 1，任务数多于 1 时会放入无界队列排队，任务执行完毕，这唯一的线程也不会被释放

对比：

- 创建一个单线程串行执行任务，如果任务执行失败而终止那么没有任何补救措施，线程池会新建一个线程，保证池的正常工作

- Executors.newSingleThreadExecutor() 线程个数始终为 1，不能修改。FinalizableDelegatedExecutorService 应用的是装饰器模式，只对外暴露了 ExecutorService 接口，因此不能调用 ThreadPoolExecutor 中特有的方法

  原因：父类不能直接调用子类中的方法，需要反射或者创建对象的方式，可以调用子类静态方法

- Executors.newFixedThreadPool(1) 初始时为 1，可以修改。对外暴露的是 ThreadPoolExecutor 对象，可以强转后调用 setCorePoolSize 等方法进行修改

![An image](/img/java/concurrent/38.png)

### 开发要求

阿里巴巴 Java 开发手册要求：

- **线程资源必须通过线程池提供，不允许在应用中自行显式创建线程**

  - 使用线程池的好处是减少在创建和销毁线程上所消耗的时间以及系统资源的开销，解决资源不足的问题
  - 如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者过度切换的问题

- 线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样的处理方式更加明确线程池的运行规则，规避资源耗尽的风险

  Executors 返回的线程池对象弊端如下：

  - `FixedThreadPool` 和 `SingleThreadPool`：请求队列长度为 `Integer.MAX_VALUE`，可能会堆积大量的请求，从而导致 OOM
  - `CacheThreadPool` 和 `ScheduledThreadPool`：允许创建线程数量为 `Integer.MAX_VALUE`，可能会创建大量的线程，导致 OOM

创建多大容量的线程池合适？

- 一般来说池中**总线程数是核心池线程数量两倍**，确保当核心池有线程停止时，核心池外有线程进入核心池

- 过小会导致程序不能充分地利用系统资源、容易导致饥饿

- 过大会导致更多的线程上下文切换，占用更多内存

  上下文切换：当前任务在执行完 CPU 时间片切换到另一个任务之前会先保存自己的状态，以便下次再切换回这个任务时，可以再加载这个任务的状态，任务从保存到再加载的过程就是一次上下文切换

核心线程数常用公式：

- **CPU 密集型任务 (N+1)：** 这种任务消耗的是 CPU 资源，可以将核心线程数设置为 N (CPU 核心数) + 1，比 CPU 核心数多出来的一个线程是为了防止线程发生缺页中断，或者其它原因导致的任务暂停而带来的影响。一旦任务暂停，CPU 某个核心就会处于空闲状态，而在这种情况下多出来的一个线程就可以充分利用 CPU 的空闲时间

  CPU 密集型简单理解就是利用 CPU 计算能力的任务比如在内存中对大量数据进行分析

- **I/O 密集型任务：** 这种系统 CPU 处于阻塞状态，用大部分的时间来处理 I/O 交互，而线程在处理 I/O 的时间段内不会占用 CPU 来处理，这时就可以将 CPU 交出给其它线程使用，因此在 I/O 密集型任务的应用中，我们可以多配置一些线程，具体的计算方法是 2N 或 CPU 核数/ (1-阻塞系数)，阻塞系数在 0.8~0.9 之间

  IO 密集型就是涉及到网络读取，文件读取此类任务 ，特点是 CPU 计算耗费时间相比于等待 IO 操作完成的时间来说很少，大部分时间都花在了等待 IO 操作完成上

## 提交方法

ExecutorService 类 API：

| 方法                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| void execute(Runnable command)                               | 执行任务（Executor 类 API）                                  |
| Future<?> submit(Runnable task)                              | 提交任务 task()                                              |
| Future submit(Callable task)                                 | 提交任务 task，用返回值 Future 获得任务执行结果              |
| List \<Future\> invokeAll(Collection<? extends Callable> tasks) | 提交 tasks 中所有任务                                        |
| List \<Future\> invokeAll(Collection<? extends Callable> tasks, long timeout, TimeUnit unit) | 提交 tasks 中所有任务，超时时间针对所有task，超时会取消没有执行完的任务，并抛出超时异常 |
| T invokeAny(Collection<? extends Callable> tasks)            | 提交 tasks 中所有任务，哪个任务先成功执行完毕，返回此任务执行结果，其它任务取消 |

execute 和 submit 都属于线程池的方法，对比：

- execute 只能执行 Runnable 类型的任务，没有返回值； submit 既能提交 Runnable 类型任务也能提交 Callable 类型任务，底层是**封装成 FutureTask，然后调用 execute 执行**
- execute 会直接抛出任务执行时的异常，submit 会吞掉异常，可通过 Future 的 get 方法将任务执行时的异常重新抛出

## 关闭方法

ExecutorService 类 API：

| 方法                                                  | 说明                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| void shutdown()                                       | 线程池状态变为 SHUTDOWN，等待任务执行完后关闭线程池，不会接收新任务，但已提交任务会执行完，而且也可以添加线程（不绑定任务） |
| List shutdownNow()                                    | 线程池状态变为 STOP，用 interrupt 中断正在执行的任务，直接关闭线程池，不会接收新任务，会将队列中的任务返回 |
| boolean isShutdown()                                  | 不在 RUNNING 状态的线程池，此执行者已被关闭，方法返回 true   |
| boolean isTerminated()                                | 线程池状态是否是 TERMINATED，如果所有任务在关闭后完成，返回 true |
| boolean awaitTermination(long timeout, TimeUnit unit) | 调用 shutdown 后，由于调用线程不会等待所有任务运行结束，如果它想在线程池 TERMINATED 后做些事情，可以利用此方法等待 |

## 异常处理

execute 会直接抛出任务执行时的异常，submit 会吞掉异常，有两种处理方法

方法 1：主动捉异常

```java
ExecutorService executorService = Executors.newFixedThreadPool(1);
pool.submit(() -> {
    try {
        System.out.println("task1");
        int i = 1 / 0;
    } catch (Exception e) {
        e.printStackTrace();
    }
});
```

方法 2：使用 Future 对象

```java
ExecutorService executorService = Executors.newFixedThreadPool(1);
Future<?> future = pool.submit(() -> {
    System.out.println("task1");
    int i = 1 / 0;
    return true;
});
System.out.println(future.get());
```
