# Synchronized

## synchronized

synchronized，即【对象锁】。它采用互斥的方式让同一时刻至多只有一个线程能持有【对象锁】，其它线程再想获取这个【对象锁】时就会阻塞住。这样就能保证拥有锁的线程可以安全的执行临界区内的代码，不用担心线程上下文切换。

语法

```java
synchronized(对象){
    // 临界区
}
```

synchronized 实际是用**对象锁**保证了**临界区内代码的原子性**，临界区内的代码对外是不可分割的，不会被线程切换所打断。

synchronized在方法上

```java
public synchronized void test() {}
// 等价于
public void test() {
    synchronized(this) {}
}

public synchronized static void test() {}
// 等价于
public static void test() {
    synchronized(Test.class) {}
}
```

> synchronized加在成员方法上锁的是this对象
>
> synchronized加在静态方法上锁的是类对象

## Java对象头

以 32 位虚拟机为例

```java
// 普通对象
|--------------------------------------------------------------|
|                    Object Header (64 bits)                   |
|------------------------------------|-------------------------|
|     Mark Word (32 bits)            |   Klass Word (32 bits)  |
|------------------------------------|-------------------------|

// 数组对象
|---------------------------------------------------------------------------------|
|                                 Object Header (96 bits)                         |
|--------------------------------|-----------------------|------------------------|
|        Mark Word(32bits)       |   Klass Word(32bits)  | array length(32bits)   |
|--------------------------------|-----------------------|------------------------|

// 32 位虚拟机 Mark Word ，最后两位是锁标志位
|-------------------------------------------------------|--------------------|
|                    Mark Word (32 bits)                |       State        |
|-------------------------------------------------------|--------------------|
|     hashcode:25     | age:4 | biased_lock:0 |   01    |       Normal       |
|-------------------------------------------------------|--------------------|
| thread:23 | epoch:2 | age:4 | biased_lock:1 |   01    |       Biased       |
|-------------------------------------------------------|--------------------|
|             ptr_to_lock_record:30           |   00    | Lightweight Locked |
|-------------------------------------------------------|--------------------|
|             ptr_to_heavyweight_monitor:30   |   10    | Heavyweight Locked |
|-------------------------------------------------------|--------------------|
|                                             |   11    |    Marked for GC   |
|-------------------------------------------------------|--------------------|

// 64 位虚拟机 Mark Word
|--------------------------------------------------------------------|--------------------|
|                        Mark Word (64 bits)                         |       State        |
|--------------------------------------------------------------------|--------------------|
| unused:25 | hashcode:31 | unused:1 | age:4 | biased_lock:0 | 01    |       Normal       |
|--------------------------------------------------------------------|--------------------|
| thread:54 |   epoch:2   | unused:1 | age:4 | biased_lock:1 | 01    |       Biased       |
|--------------------------------------------------------------------|--------------------|
|                   ptr_to_lock_record:62                    | 00    | Lightweight Locked |
|--------------------------------------------------------------------|--------------------|
|                 ptr_to_heavyweight_monitor:62              | 10    | Heavyweight Locked |
|--------------------------------------------------------------------|--------------------|
|                                                            | 11    |    Marked for GC   |
|--------------------------------------------------------------------|--------------------|
```

## Monitor

Monitor 被翻译为监视器或管程

每个 Java 对象都可以关联一个 Monitor 对象，Monitor 也是 class，其**实例存储在堆中**，如果使用 synchronized 给对象上锁（重量级）之后，该对象头的 Mark Word 中就被设置指向 Monitor 对象的指针，这就是重量级锁。

![An image](/img/java/concurrent/03.png)

工作流程：

- 开始时 Monitor 中 Owner 为 null
- 当 Thread-2 执行 synchronized(obj) 就会将 Monitor 的所有者 Owner 置为 Thread-2，Monitor 中只能有一个 Owner，**obj 对象的 Mark Word 指向 Monitor**，把**对象原有的 MarkWord 存入线程栈中的锁记录**中
- 在 Thread-2 上锁的过程，Thread-3、Thread-4、Thread-5 也执行 synchronized(obj)，就会进入 EntryList BLOCKED（双向链表）
- Thread-2 执行完同步代码块的内容，根据 obj 对象头中 Monitor 地址寻找，设置 Owner 为空，把线程栈的锁记录中的对象头的值设置回 MarkWord
- 唤醒 EntryList 中等待的线程来竞争锁，竞争是**非公平的**，如果这时有新的线程想要获取锁，可能直接就抢占到了，阻塞队列的线程就会继续阻塞
- WaitSet 中的 Thread-0，是以前获得过锁，但条件不满足进入 WAITING 状态的线程（wait-notify 机制）

> synchronized 必须是进入同一个对象的 monitor 才有上述的效果
>
> 不加 synchronized 的对象不会关联监视器，不遵从以上规则

## 字节码

```java
public static void main(String[] args) {
    Object lock = new Object();
    synchronized (lock) {
        System.out.println("ok");
    }
}
```

```java
0:  new             #2     // new Object
3:  dup
4:  invokespecial   #1      // invokespecial <init>:()V，非虚方法
7:  astore_1                // lock引用 -> lock
8:  aload_1                 // lock （synchronized开始）
9:  dup                     // 一份用来初始化，一份用来引用
10: astore_2                // lock引用 -> slot 2
11: monitorenter            // 【将 lock对象 MarkWord 置为 Monitor 指针】
12: getstatic       #3      // System.out
15: ldc             #4      // "ok"
17: invokevirtual   #5      // invokevirtual println:(Ljava/lang/String;)V
20: aload_2                 // slot 2(lock引用)
21: monitorexit             // 【将 lock对象 MarkWord 重置, 唤醒 EntryList】
22: goto 30
25: astore_3                // any -> slot 3
26: aload_2                 // slot 2(lock引用)
27: monitorexit             // 【将 lock对象 MarkWord 重置, 唤醒 EntryList】
28: aload_3
29: athrow
30: return
Exception table:
    from to target type
      12 22 25      any
      25 28 25      any
LineNumberTable: ...
LocalVariableTable:
    Start Length Slot Name Signature
        0   31      0 args [Ljava/lang/String;
        8   23      1 lock Ljava/lang/Object;
```

>通过异常 try-catch 机制，确保一定会被解锁
>
>方法级别的 synchronized 不会在字节码指令中有所体现

## 锁升级

synchronized 是可重入、不公平的重量级锁，所以可以对其进行优化

```tex
无锁 -> 偏向锁 -> 轻量级锁 -> 重量级锁  // 随着竞争的增加，只能锁升级，不能降级
```

![An image](/img/java/concurrent/09.png)

## 轻量级锁

轻量级锁的使用场景是：如果一个对象虽然有多个线程要对它进行加锁，但是加锁的时间是错开的（也就是没有人可以竞争的），那么可以使用轻量级锁来进行优化。

轻量级锁对使用者是透明的，即语法仍然是`synchronized`，假设有两个方法同步块，利用同一个对象加锁。

```java
static final Object obj = new Object();
public static void method1() {
     synchronized( obj ) {
         // 同步块 A
         method2();
     }
}
public static void method2() {
     synchronized( obj ) {
         // 同步块 B
     }
}
```

创建锁记录（Lock Record）对象，**每个线程的栈帧都会包含一个锁记录的结构**，存储锁定对象的 Mark Word

![An image](/img/java/concurrent/04.png)

让锁记录中 Object reference 指向锁住的对象，并尝试用 CAS 替换 Object 的 Mark Word，将 Mark Word 的值存入锁记录

如果 CAS 替换成功，对象头中存储了锁记录地址和状态 00（轻量级锁） ，表示由该线程给对象加锁

![An image](/img/java/concurrent/05.png)

如果 CAS 失败，有两种情况：

- 如果是其它线程已经持有了该 Object 的轻量级锁，这时表明有竞争，进入锁膨胀过程
- 如果是线程自己执行了 synchronized 锁重入，就添加一条 Lock Record 作为重入的计数

![An image](/img/java/concurrent/06.png)

- 当退出 synchronized 代码块（解锁时）
  - 如果有取值为 null 的锁记录，表示有重入，这时重置锁记录，表示重入计数减 1
  - 如果锁记录的值不为 null，这时使用 CAS 将 Mark Word 的值恢复给对象头
    - 成功，则解锁成功
    - 失败，说明轻量级锁进行了锁膨胀或已经升级为重量级锁，进入重量级锁解锁流程

## 锁膨胀

在尝试加轻量级锁的过程中，CAS 操作无法成功，可能是其它线程为此对象加上了轻量级锁（有竞争），这时需要进行锁膨胀，将**轻量级锁变为重量级锁**

当 Thread-1 进行轻量级加锁时，Thread-0 已经对该对象加了轻量级锁

![An image](/img/java/concurrent/07.png)

Thread-1 加轻量级锁失败，进入锁膨胀流程：为 Object 对象申请 Monitor 锁，**通过 Object 对象头获取到持锁线程**，将 Monitor 的 Owner 置为 Thread-0，将 Object 的对象头指向重量级锁地址，然后自己进入 Monitor 的 EntryList BLOCKED

![An image](/img/java/concurrent/08.png)

当 Thread-0 退出同步块解锁时，使用 CAS 将 Mark Word 的值恢复给对象头失败，这时进入重量级解锁流程，即按照 Monitor 地址找到 Monitor 对象，设置 Owner 为 null，唤醒 EntryList 中 BLOCKED 线程

## 自旋优化

重量级锁竞争时，尝试获取锁的线程不会立即阻塞，可以使用**自旋**（默认 10 次）来进行优化，采用循环的方式去尝试获取锁

注意：

- 自旋占用 CPU 时间，单核 CPU 自旋就是浪费时间，因为同一时刻只能运行一个线程，多核 CPU 自旋才能发挥优势
- 自旋失败的线程会进入阻塞状态

优点：不会进入阻塞状态，**减少线程上下文切换的消耗**

缺点：当自旋的线程越来越多时，会不断的消耗 CPU 资源

自旋成功的情况：

| 线程1（croe1上）        | 对象Mark                 | 线程2（croe2上）        |
| :---------------------- | ------------------------ | ----------------------- |
| -                       | 10（重量级锁）           | -                       |
| 访问同步块，获取monitor | 10（重量级锁）重置锁指针 | -                       |
| 成功（加锁）            | 10（重量级锁）重置锁指针 | -                       |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | -                       |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 访问同步块，获取monitor |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 自旋重试                |
| 执行完成                | 10（重量级锁）重置锁指针 | 自旋重试                |
| 成功（解锁）            | 01（无锁）               | 自旋重试                |
| -                       | 10（重量级锁）重置锁指针 | 成功（加锁）            |
| -                       | 10（重量级锁）重置锁指针 | 执行同步代码块          |
| -                       | ...                      | ...                     |

自旋失败的情况：

| 线程1（croe1上）        | 对象Mark                 | 线程2（croe2上）        |
| :---------------------- | ------------------------ | ----------------------- |
| -                       | 10（重量级锁）           | -                       |
| 访问同步块，获取monitor | 10（重量级锁）重置锁指针 | -                       |
| 成功（加锁）            | 10（重量级锁）重置锁指针 | -                       |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | -                       |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 访问同步块，获取monitor |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 自旋重试                |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 自旋重试                |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 自旋重试                |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 自旋重试                |
| 执行同步代码块          | 10（重量级锁）重置锁指针 | 阻塞                    |
| ...                     | ...                      | ...                     |

自旋锁说明：

- 在 Java 6 之后自旋锁是自适应的，比如对象刚刚的一次自旋操作成功过，那么认为这次自旋成功的可能性会高，就多自旋几次；反之，就少自旋甚至不自旋，比较智能
- Java 7 之后不能控制是否开启自旋功能，由 JVM 控制

```java
//手写自旋锁
public class SpinLock {
    // 泛型装的是Thread，原子引用线程
    AtomicReference<Thread> atomicReference = new AtomicReference<>();

    public void lock() {
        Thread thread = Thread.currentThread();
        System.out.println(thread.getName() + " come in");

        //开始自旋，期望值为null，更新值是当前线程
        while (!atomicReference.compareAndSet(null, thread)) {
            Thread.sleep(1000);
            System.out.println(thread.getName() + " 正在自旋");
        }
        System.out.println(thread.getName() + " 自旋成功");
    }

    public void unlock() {
        Thread thread = Thread.currentThread();

        //线程使用完锁把引用变为null
        atomicReference.compareAndSet(thread, null);
        System.out.println(thread.getName() + " invoke unlock");
    }

    public static void main(String[] args) throws InterruptedException {
        SpinLock lock = new SpinLock();
        new Thread(() -> {
            //占有锁
            lock.lock();
            Thread.sleep(10000); 

            //释放锁
            lock.unlock();
        },"t1").start();

        // 让main线程暂停1秒，使得t1线程，先执行
        Thread.sleep(1000);

        new Thread(() -> {
            lock.lock();
            lock.unlock();
        },"t2").start();
    }
}
```

## 偏向锁

轻量级锁在没有竞争时（就自己这个线程），每次重入仍然需要执行 CAS 操作。

Java6中引入了偏向锁来做进一步优化：**只有第一次使用 CAS 将线程 ID 设置到对象的 Mark Word 头，之后发现这个线程 ID 是自己的就表示没有竞争，不用重新 CAS** 。

![An image](/img/java/concurrent/19.png)

### 偏向状态

```java
// 64 位虚拟机 Mark Word
|--------------------------------------------------------------------|--------------------|
|                        Mark Word (64 bits)                         |       State        |
|--------------------------------------------------------------------|--------------------|
| unused:25 | hashcode:31 | unused:1 | age:4 | biased_lock:0 | 01    |       Normal       |
|--------------------------------------------------------------------|--------------------|
| thread:54 |   epoch:2   | unused:1 | age:4 | biased_lock:1 | 01    |       Biased       |
|--------------------------------------------------------------------|--------------------|
|                   ptr_to_lock_record:62                    | 00    | Lightweight Locked |
|--------------------------------------------------------------------|--------------------|
|                 ptr_to_heavyweight_monitor:62              | 10    | Heavyweight Locked |
|--------------------------------------------------------------------|--------------------|
|                                                            | 11    |    Marked for GC   |
|--------------------------------------------------------------------|--------------------|
```

一个对象创建时

- 如果开启了偏向锁（默认是开启的），那么对象刚创建之后，Mark Word 最后三位的值101，并且这是它的Thread，epoch，age都是0，在加锁的时候进行设置这些的值
- 偏向锁默认是延迟的，不会在程序启动的时候立刻生效，如果想避免延迟，可以添加虚拟机参数来禁用延迟：-`XX:BiasedLockingStartupDelay=0`来禁用延迟
- 处于偏向锁的对象解锁后，线程 id 仍存储于对象头中

### 禁用偏向锁

- 添加 VM 参数`-XX:-UseBiasedLocking`禁用偏向锁（禁用偏向锁则优先使用轻量级锁）
- 如果没有开启偏向锁，那么对象创建后最后三位的值为001，这时候它的hashcode，age都为0，hashcode是第一次用到`hashcode`时才赋值的。

### 撤销偏向锁

hashcode方法：调用对象的hashcode方法的时候就会撤销这个对象的偏向锁，因为使用偏向锁时没有位置存`hashcode`的值了。

其它线程使用对象：当有其它线程使用偏向锁对象时，会将偏向锁升级为轻量级锁。

调用 wait/notify：会使对象的锁变成重量级锁，因为wait/notify方法只有重量级锁才支持。

### 批量重偏向

如果对象虽然被多个线程访问，但没有竞争，这时偏向了线程1的对象仍有机会重新偏向线程2，重偏向会重置对象的Thread ID。

当撤销偏向锁阈值超过20次后，JVM会这样觉得，我是不是偏向错了呢，于是会在给这些对象加锁时重新偏向至加锁线程，而不是撤销偏向锁。

当撤销偏向锁阈值超过40次后，JVM会这样觉得，自己确实偏向错了，根本就不该偏向。于是整个类的所有对象都会变为不可偏向的，新建的对象也是不可偏向的。

## 锁消除

锁消除是指对于被检测出不可能存在竞争的共享数据的锁进行消除，这是 JVM **即时编译器的优化**（JIT 即时编译器）

锁消除主要是通过**逃逸分析**来支持，如果堆上的共享数据不可能逃逸出去被其它线程访问到，那么就可以把它们当成私有数据对待，也就可以将它们的锁进行消除（同步消除：JVM 逃逸分析）

## 锁粗化

对相同对象多次加锁，导致线程发生多次重入，频繁的加锁操作就会导致性能损耗，可以使用锁粗化方式优化

如果虚拟机探测到一串的操作都对同一个对象加锁，将会把加锁的范围扩展（粗化）到整个操作序列的外部

- 一些看起来没有加锁的代码，其实隐式的加了很多锁：

  ```java
  public static String concatString(String s1, String s2, String s3) {
      return s1 + s2 + s3;
  }
  ```

- String 是一个不可变的类，编译器会对 String 的拼接自动优化。在 JDK 1.5 之前，转化为 StringBuffer 对象的连续 append() 操作，每个 append() 方法中都有一个同步块

  ```java
  public static String concatString(String s1, String s2, String s3) {
      StringBuffer sb = new StringBuffer();
      sb.append(s1);
      sb.append(s2);
      sb.append(s3);
      return sb.toString();
  }
  ```

  扩展到第一个 append() 操作之前直至最后一个 append() 操作之后，只需要加锁一次就可以

## 多把锁

多把不相干的锁：一间大屋子有两个功能睡觉、学习，互不相干。现在一人要学习，一人要睡觉，如果只用一间屋子（一个对象锁）的话，那么并发度很低

将锁的粒度细分：

- 好处，是可以增强并发度
- 坏处，如果一个线程需要同时获得多把锁，就容易发生死锁

解决方法：准备多个对象锁

```java
public static void main(String[] args) {
    BigRoom bigRoom = new BigRoom();
    new Thread(() -> { bigRoom.study(); }).start();
    new Thread(() -> { bigRoom.sleep(); }).start();
}
class BigRoom {
    private final Object studyRoom = new Object();
    private final Object sleepRoom = new Object();

    public void sleep() throws InterruptedException {
        synchronized (sleepRoom) {
            logger.info("sleeping 2 小时");
            Thread.sleep(2000);
        }
    }

    public void study() throws InterruptedException {
        synchronized (studyRoom) {
            logger.info("study 1 小时");
            Thread.sleep(1000);
        }
    }
}
// 输出
2023-09-26 17:37:04.104 [Thread-1] INFO  ThreadCreateTest(:) - study 1 小时
2023-09-26 17:37:04.104 [Thread-2] INFO  ThreadCreateTest(:) - sleeping 2 小时
```

## 死锁

多个线程同时被阻塞，它们中的一个或者全部都在等待某个资源被释放，由于线程被无限期地阻塞，因此程序不可能正常终止

Java 死锁产生的四个必要条件：

1. 互斥条件，即当资源被一个线程使用（占有）时，别的线程不能使用
2. 不可剥夺条件，资源请求者不能强制从资源占有者手中夺取资源，资源只能由资源占有者主动释放
3. 请求和保持条件，即当资源请求者在请求其他的资源的同时保持对原有资源的占有
4. 循环等待条件，即存在一个等待循环队列：p1 要 p2 的资源，p2 要 p1 的资源，形成了一个等待环路

四个条件都成立的时候，便形成死锁。死锁情况下打破上述任何一个条件，便可让死锁消失

```java
public class Dead {
    public static Object resources1 = new Object();
    public static Object resources2 = new Object();
    public static void main(String[] args) {
        new Thread(() -> {
            // 线程1：占用资源1 ，请求资源2
            synchronized(resources1){
                System.out.println("线程1已经占用了资源1，开始请求资源2");
                Thread.sleep(2000);//休息两秒，防止线程1直接运行完成。
                //2秒内线程2肯定可以锁住资源2
                synchronized (resources2){
                    System.out.println("线程1已经占用了资源2");
                }
        }}).start();
        new Thread(() -> {
                // 线程2：占用资源2 ，请求资源1
                synchronized(resources2){
                    System.out.println("线程2已经占用了资源2，开始请求资源1");
                    Thread.sleep(2000);
                    synchronized (resources1){
                        System.out.println("线程2已经占用了资源1");
                    }
                }
        }).start();
    }
}
```

定位死锁的方法：

- 使用 jps 定位进程 id，再用 `jstack id` 定位死锁，找到死锁的线程去查看源码，解决优化

  ```java
  "Thread-1" #12 prio=5 os_prio=0 tid=0x000000001eb69000 nid=0xd40 waiting formonitor entry [0x000000001f54f000]
    java.lang.Thread.State: BLOCKED (on object monitor)
  #省略    
  "Thread-1" #12 prio=5 os_prio=0 tid=0x000000001eb69000 nid=0xd40 waiting for monitor entry [0x000000001f54f000]
   java.lang.Thread.State: BLOCKED (on object monitor)
  #省略
  
  Found one Java-level deadlock:
  ===================================================
  "Thread-1":
      waiting to lock monitor 0x000000000361d378 (object 0x000000076b5bf1c0, a java.lang.Object),
      which is held by "Thread-0"
  "Thread-0":
      waiting to lock monitor 0x000000000361e768 (object 0x000000076b5bf1d0, a java.lang.Object),
      which is held by "Thread-1"
      
  Java stack information for the threads listed above:
  ===================================================
  "Thread-1":
      at thread.TestDeadLock.lambda$main$1(TestDeadLock.java:28)
      - waiting to lock <0x000000076b5bf1c0> (a java.lang.Object)
      - locked <0x000000076b5bf1d0> (a java.lang.Object)
      at thread.TestDeadLock$$Lambda$2/883049899.run(Unknown Source)
      at java.lang.Thread.run(Thread.java:745)
  "Thread-0":
      at thread.TestDeadLock.lambda$main$0(TestDeadLock.java:15)
      - waiting to lock <0x000000076b5bf1d0> (a java.lang.Object)
      - locked <0x000000076b5bf1c0> (a java.lang.Object)
      at thread.TestDeadLock$$Lambda$1/495053715
  ```

- Linux 下可以通过 top 先定位到 CPU 占用高的 Java 进程，再利用 `top -Hp 进程id` 来定位是哪个线程，最后再用 jstack 的输出来看各个线程栈

- 避免死锁：避免死锁要注意加锁顺序

- 可以使用 jconsole 工具，在 `jdk\bin` 目录下

## 活锁

指的是任务或者执行者没有被阻塞，由于某些条件没有满足，导致一直重复尝试—失败—尝试—失败的过程

两个线程互相改变对方的结束条件，最后谁也无法结束：

```java
class TestLiveLock {
    static volatile int count = 10;
    static final Object lock = new Object();
    public static void main(String[] args) {
        new Thread(() -> {
            // 期望减到 0 退出循环
            while (count > 0) {
                Thread.sleep(200);
                count--;
                System.out.println("线程一count:" + count);
            }
        }, "t1").start();
        new Thread(() -> {
            // 期望超过 20 退出循环
            while (count < 20) {
                Thread.sleep(200);
                count++;
                System.out.println("线程二count:"+ count);
            }
        }, "t2").start();
    }
}
```

## 饥饿

一个线程由于优先级太低，始终得不到 CPU 调度执行，也不能够结束
