# Java线程

## 创建和运行线程

### 直接使用Thread

```java
public class ThreadCreateTest {

    public final static Logger logger = LogManager.getLogger(ThreadCreateTest.class);

    public static void main(String[] args) {
        // 创建线程对象
        Thread t = new Thread() {
            public void run() {
                // 要执行的任务
                logger.info("hello world");
            }
        };
        // 启动线程
        t.start();
    }
}

// 输出
2023-09-25 16:02:22.248 [Thread-1] INFO  ThreadCreateTest(:) - hello world
```

### 使用Runnable配合Thread

把【线程】和【任务】（要执行的代码）分开

- Thread 代表线程
- Runnable 可运行的任务（线程要执行的代码）

```java
public class RunnableCreateTest {

    public final static Logger logger = LogManager.getLogger(ThreadCreateTest.class);

    public static void main(String[] args) {
        Runnable runnable = new Runnable() {
            public void run() {
                // 要执行的任务
                logger.info("hello world");
            }
        };
        // 创建线程对象
        Thread t = new Thread(runnable);
        // 启动线程
        t.start();

        // 参数1 是任务对象; 参数2 是线程名字，推荐
        Thread t2 = new Thread(runnable, "线程-2");
        t2.start();

        Runnable task2 = () -> logger.debug("lambda方式创建线程");
        // 参数1 是任务对象; 参数2 是线程名字，推荐
        Thread t3 = new Thread(task2, "线程-3");
        t3.start();
    }
}

// 输出
2023-09-25 16:02:58.391 [线程-3] DEBUG ThreadCreateTest(:) - lambda方式创建线程
2023-09-25 16:02:58.391 [Thread-1] INFO  ThreadCreateTest(:) - hello world
2023-09-25 16:02:58.391 [线程-2] INFO  ThreadCreateTest(:) - hello world
```

> Thread 是把线程和任务合并在了一起，Runnable  是把线程和任务分开了
>
> 用 Runnable 更容易与线程池等高级 API 配合
>
> 用 Runnable 让任务类脱离了 Thread 继承体系，更灵活

### FutureTask配合Thread

FutureTask 能够接收 Callable 类型的参数，用来处理有返回结果的情况

```java
public class FutureTaskCreateTest {

    public final static Logger logger = LogManager.getLogger(ThreadCreateTest.class);

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 创建任务对象
        FutureTask<Integer> task3 = new FutureTask<>(() -> {
            logger.debug("hello");
            return 100;
        });

        // 参数1 是任务对象; 参数2 是线程名字，推荐
        new Thread(task3, "t3").start();

        // 主线程阻塞，同步等待 task 执行完毕的结果
        Integer result = task3.get();
        logger.debug("结果是:{}", result);
    }
}

// 输出
2023-09-25 16:08:53.630 [t3] DEBUG ThreadCreateTest(:) - hello
2023-09-25 16:08:53.635 [main] DEBUG ThreadCreateTest(:) - 结果是:100
```

## 原理之线程运行

### 栈与栈帧

Java Virtual Machine Stacks （Java 虚拟机栈）

我们都知道 JVM 中由堆、栈、方法区所组成，其中栈内存是给谁用的呢？其实就是线程，每个线程启动后，虚拟机就会为其分配一块栈内存。

- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法

### 线程上下文切换

因为以下一些原因导致 cpu 不再执行当前的线程，转而执行另一个线程的代码

- 线程的 cpu 时间片用完
- 垃圾回收
- 有更高优先级的线程需要运行
- 线程自己调用了 sleep、yield、wait、join、park、synchronized、lock 等方法

当 线程上下文切换（Context Switch） 发生时，需要由操作系统保存当前线程的状态，并恢复另一个线程的状态，Java 中对应的概念就是程序计数器（Program Counter Register），它的作用是记住下一条 jvm 指令的执行地址，是线程私有的

- 状态包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等
- Context Switch 频繁发生会影响性能

## 主线程与守护线程

默认情况下，Java 进程需要等待所有线程都运行结束，才会结束。有一种特殊的线程叫做守护线程，只要其它非守护线程运行结束了，即使守护线程的代码没有执行完，也会强制结束。

```java
    public static void main(String[] args) throws Exception {
        logger.debug("开始运行...");
        Thread t1 = new Thread(() -> {
            logger.debug("开始运行...");
            try {
                sleep(2000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            logger.debug("运行结束...");
        }, "daemon");
        // 设置该线程为守护线程
        t1.setDaemon(true);
        t1.start();
        sleep(1000);
        logger.debug("运行结束...");
    }

// 输出 守护进程被强制结束
2023-09-25 17:54:57.720 [main] DEBUG ThreadCreateTest(:) - 开始运行...
2023-09-25 17:54:57.724 [daemon] DEBUG ThreadCreateTest(:) - 开始运行...
2023-09-25 17:54:58.729 [main] DEBUG ThreadCreateTest(:) - 运行结束...
```

> 垃圾回收器线程就是一种守护线程
> Tomcat 中的 Acceptor 和 Poller 线程都是守护线程，所以 Tomcat 接收到 shutdown 命令后，不会等待它们处理完当前请求

## 常见方法

| 方法名           | static | 功能说明                                                     | 注意                                                         |
| :--------------- | ------ | ------------------------------------------------------------ | :----------------------------------------------------------- |
| start()          |        | 启动一个新线程，在新的线程运行 run 方法中的代码              | start 方法只是让线程进入就绪，里面代码不一定立刻运行（CPU 的时间片还没分给它）。每个线程对象的start方法只能调用一次，如果调用了多次会出现IllegalThreadStateException |
| run()            |        | 新线程启动后会调用的方法                                     | 如果在构造 Thread 对象时传递了 Runnable 参数，则线程启动后会调用 Runnable 中的 run 方法，否则默认不执行任何操作。但可以创建 Thread 的子类对象，来覆盖默认行为 |
| join()           |        | 等待线程运行结束                                             |                                                              |
| join(long n)     |        | 等待线程运行结束,最多等待 n 毫秒                             |                                                              |
| getId()          |        | 获取线程长整型的 id                                          | id 唯一                                                      |
| getName()        |        | 获取线程名                                                   |                                                              |
| setName(String)  |        | 修改线程名                                                   |                                                              |
| getPriority()    |        | 获取线程优先级                                               |                                                              |
| setPriority(int) |        | 修改线程优先级                                               | java中规定线程优先级是1~10 的整数，较大的优先级能提高该线程被 CPU 调度的机率 |
| getState()       |        | 获取线程状态                                                 | Java 中线程状态是用 6 个 enum 表示，分别为：NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED |
| isInterrupted()  |        | 判断是否被打断，                                             | 不会清除 打断标记                                            |
| isAlive()        |        | 线程是否存活（还没有运行完毕）                               |                                                              |
| interrupt()      |        | 打断线程                                                     | 如果被打断线程正在 sleep，wait，join 会导致被打断的线程抛出 InterruptedException，并清除 打断标记 ；如果打断的正在运行的线程，则会设置 打断标记 ；park 的线程被打断，也会设置 打断标记 |
| interrupted()    | static | 判断当前线程是否被打断                                       | 会清除 打断标记                                              |
| currentThread()  | static | 获取当前正在执行的线程                                       |                                                              |
| sleep(long n)    | static | 让当前执行的线程休眠n毫秒，休眠时让出 cpu 的时间片给其它线程 |                                                              |
| yield()          | static | 提示线程调度器让出当前线程对CPU的使用                        | 主要是为了测试和调试                                         |

## start与run

- 直接调用 run 是在主线程中执行了 run，没有启动新的线程
- 使用 start 是启动新的线程，通过新的线程间接执行 run 中的代码

## sleep与yield

sleep

1. 调用 sleep 会让当前线程从 *Running* 进入 *Timed Waiting* 状态（阻塞）
2. 其它线程可以使用 interrupt 方法打断正在睡眠的线程，这时 sleep 方法会抛出 InterruptedException
3. 睡眠结束后的线程未必会立刻得到执行
4. 建议用 TimeUnit 的 sleep 代替 Thread 的 sleep 来获得更好的可读性

yield

1. 调用 yield 会让当前线程从 *Running* 进入 *Runnable* 就绪状态，然后调度执行其它线程
2. 具体的实现依赖于操作系统的任务调度器

线程优先级

- 线程优先级会提示（hint）调度器优先调度该线程，但它仅仅是一个提示，调度器可以忽略它
- 如果 cpu 比较忙，那么优先级高的线程会获得更多的时间片，但 cpu 闲时，优先级几乎没作用

## wait与notify

原理

![An image](/img/java/concurrent/03.png)

- Owner中线程发现条件不满足，可以调用wait方法，即可进入WaitSet变为WAITING状态
- BLOCKED和WAITING的线程都处于阻塞状态，不占用CPU时间片
- BLOCKED线程会在Owner线程释放锁时唤醒
- WAITING线程会在Owner线程调用`notify`或`notifyAll`时唤醒，但唤醒后并不意味者立刻获得锁，仍需进入EntryList重新竞争

常用API

- obj.wait() 让进入 object 监视器的线程到 waitSet 等待
- obj.notify() 在 object 上正在 waitSet 等待的线程中挑一个唤醒
- obj.notifyAll() 让 object 上正在 waitSet 等待的线程全部唤醒

> 它们都是线程之间进行协作的手段，都属于 Object 对象的方法。必须获得此对象的锁，才能调用这几个方法

- wait() 方法会释放对象的锁，进入 WaitSet 等待区，从而让其他线程就机会获取对象的锁。无限制等待，直到`notify`为止
- wait(long n) 有时限的等待，到 n 毫秒后结束等待，或是被 notify

sleep和wait的区别

1. sleep 是 Thread 方法，而 wait 是 Object 的方法
2. sleep 不需要强制和 synchronized 配合使用，但 wait 需要和 synchronized 一起用
3. sleep 在睡眠的同时，不会释放对象锁的，但 wait 在等待的时候会释放对象锁
4. 它们状态 TIMED_WAITING

## park与unpark

它们是 LockSupport 类中的方法

```java
// 暂停当前线程
LockSupport.park(); 
// 恢复某个线程的运行
LockSupport.unpark(暂停线程对象)
```

特点

- wait，notify 和 notifyAll 必须配合 Object Monitor 一起使用，而 park，unpark 不必
- park & unpark 是以线程为单位来【阻塞】和【唤醒】线程，而 notify 只能随机唤醒一个等待线程，notifyAll 是唤醒所有等待线程，就不那么【精确】
- park & unpark 可以先 unpark，而 wait & notify 不能先 notify

## join方法

- join是定义在Thread类中的方法，作用是阻塞当前线程的执行，等到被调用join的线程对象执行完毕才执行继续执行当前线程。
- 有时效的join，如果线程执行结束，join会提前结束。
- 当thread.join()被调用时，如果调用的线程中持有了thread对象锁会被释放。

## interrupt方法

sleep、wait、join这几个方法都会让线程进入阻塞状态。

打断 sleep 的线程，会清空打断状态，以 sleep 为例

```java
    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> {
            try {
                sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }, "t1");
        t1.start();
        sleep(500);
        t1.interrupt();
        logger.debug(" 打断状态: {}", t1.isInterrupted());
    }
    
// 输出
Caused by: java.lang.InterruptedException: sleep interrupted
at java.lang.Thread.sleep(Native Method)
at thread.Main.lambda$main$0(Main.java:18)
... 1 more
2023-09-25 17:32:43.854 [main] DEBUG ThreadCreateTest(:) -  打断状态: false
```

打断正常运行的线程，不会清空打断状态

```java
    public static void main(String[] args) throws Exception {
        Thread t2 = new Thread(()->{
            while(true) {
                Thread current = Thread.currentThread();
                boolean interrupted = current.isInterrupted();
                if(interrupted) {
                    logger.debug(" 打断状态: {}", interrupted);
                    break;
                }
            }
        }, "t2");
        t2.start();
        sleep(500);
        t2.interrupt();
    }

// 输出
2023-09-25 17:34:31.711 [t2] DEBUG ThreadCreateTest(:) -  打断状态: true
```

打断 park 线程，不会清空打断状态

park，unpark这两个方法都是LockSupport类名下的方法，park用来暂停线程，unpark用来将暂停的线程恢复。

```java
    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> {
            logger.debug("park...");
            LockSupport.park();
            logger.debug("unpark...");
            logger.debug("打断状态：{}", Thread.currentThread().isInterrupted());
        }, "t1");
        t1.start();
        sleep(500);
        t1.interrupt();
    }
// 输出
2023-09-25 17:38:57.493 [t1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:38:57.999 [t1] DEBUG ThreadCreateTest(:) - unpark...
2023-09-25 17:38:58.001 [t1] DEBUG ThreadCreateTest(:) - 打断状态：true
```

如果打断标记已经是 true，则 park 会失效

```java
    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                logger.debug("park...");
                LockSupport.park();
                logger.debug("打断状态：{}", Thread.currentThread().isInterrupted());
            }
        });
        t1.start();
        sleep(1);
        t1.interrupt();
    }
// 输出
2023-09-25 17:43:33.471 [Thread-1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:43:33.475 [Thread-1] DEBUG ThreadCreateTest(:) - 打断状态：true
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - 打断状态：true
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - 打断状态：true
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - 打断状态：true
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - park...
2023-09-25 17:43:33.476 [Thread-1] DEBUG ThreadCreateTest(:) - 打断状态：true
```

> 可以使用 Thread.interrupted() 清除打断状态

## 不推荐的方法

还有一些不推荐使用的方法，这些方法已过时，容易破坏同步代码块，造成线程死锁

| 方法名    | 功能说明             |
| --------- | -------------------- |
| stop()    | 停止线程运行         |
| suspend() | 挂起（暂停）线程运行 |
| resume()  | 恢复线程运行         |
