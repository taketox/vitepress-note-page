# Volatile

## 同步机制

volatile 是 Java 虚拟机提供的**轻量级**的同步机制（三大特性）

- 保证可见性
- 不保证原子性
- 保证有序性（禁止指令重排）

性能：volatile 修饰的变量进行读操作与普通变量几乎没什么差别，但是写操作相对慢一些，因为需要在本地代码中插入很多内存屏障来保证指令不会发生乱序执行，但是开销比锁要小

synchronized 无法禁止指令重排和处理器优化，为什么可以保证有序性可见性

- 加了锁之后，只能有一个线程获得到了锁，获得不到锁的线程就要阻塞，所以同一时间只有一个线程执行，相当于单线程，由于数据依赖性的存在，单线程的指令重排是没有问题的
- 线程加锁前，将**清空工作内存**中共享变量的值，使用共享变量时需要从主内存中重新读取最新的值；线程解锁前，必须把共享变量的最新值**刷新到主内存**中（JMM 内存交互章节有讲）

## 指令重排

volatile 修饰的变量，可以禁用指令重排

指令重排实例：

- example 1：

  ```java
  public void mySort() {
    int x = 11; //语句1
    int y = 12; //语句2  谁先执行效果一样
    x = x + 5;  //语句3
    y = x * x;  //语句4
  }
  ```

  执行顺序是：1 2 3 4、2 1 3 4、1 3 2 4

  指令重排也有限制不会出现：4321，语句 4 需要依赖于 y 以及 x 的申明，因为存在数据依赖，无法首先执行

- example 2：

  ```java
  int num = 0;
  boolean ready = false;
  // 线程1 执行此方法
  public void actor1(I_Result r) {
      if(ready) {
        r.r1 = num + num;
      } else {
        r.r1 = 1;
      }
  }
  // 线程2 执行此方法
  public void actor2(I_Result r) {
    num = 2;
    ready = true;
  }
  ```

  情况一：线程 1 先执行，ready = false，结果为 r.r1 = 1

  情况二：线程 2 先执行 num = 2，但还没执行 ready = true，线程 1 执行，结果为 r.r1 = 1

  情况三：线程 2 先执行 ready = true，线程 1 执行，进入 if 分支结果为 r.r1 = 4

  情况四：线程 2 执行 ready = true，切换到线程 1，进入 if 分支为 r.r1 = 0，再切回线程 2 执行 num = 2，发生指令重排

## 底层原理

### 缓存一致

使用 volatile 修饰的共享变量，底层通过汇编 lock 前缀指令进行缓存锁定，在线程修改完共享变量后写回主存，其他的 CPU 核心上运行的线程通过 CPU 总线嗅探机制会修改其共享变量为失效状态，读取时会重新从主内存中读取最新的数据

lock 前缀指令就相当于内存屏障，Memory Barrier（Memory Fence）

- 对 volatile 变量的写指令后会加入写屏障
- 对 volatile 变量的读指令前会加入读屏障

内存屏障有三个作用：

- 确保对内存的读-改-写操作原子执行
- 阻止屏障两侧的指令重排序
- 强制把缓存中的脏数据写回主内存，让缓存行中相应的数据失效

### 内存屏障

保证**可见性**：

- 写屏障（sfence，Store Barrier）**保证在该屏障之前的，对共享变量的改动，都同步到主存当中**

  ```java
  public void actor2(I_Result r) {
      num = 2;
      ready = true; // ready 是 volatile 赋值带写屏障
      // 写屏障
  }
  ```

- 读屏障（lfence，Load Barrier）**保证在该屏障之后的，对共享变量的读取，从主存刷新变量值，加载的是主存中最新数据**

  ```java
  public void actor1(I_Result r) {
      // 读屏障
      // ready 是 volatile 读取值带读屏障
      if(ready) {
        r.r1 = num + num;
      } else {
        r.r1 = 1;
      }
  }
  ```

![An image](/img/java/concurrent/16.png)

- 全能屏障：mfence（modify/mix Barrier），兼具 sfence 和 lfence 的功能

保证**有序性**：

- 写屏障会确保指令重排序时，不会将写屏障之前的代码排在写屏障之后
- 读屏障会确保指令重排序时，不会将读屏障之后的代码排在读屏障之前

不能解决指令交错：

- 写屏障仅仅是保证之后的读能够读到最新的结果，但不能保证其他线程的读跑到写屏障之前
- 有序性的保证也只是保证了本线程内相关代码不被重排序

```java
volatile i = 0;
new Thread(() -> {i++});
new Thread(() -> {i--});
```

i++ 反编译后的指令：

```java
0: iconst_1         // 当int取值 -1~5 时，JVM采用iconst指令将常量压入栈中
1: istore_1         // 将操作数栈顶数据弹出，存入局部变量表的 slot 1
2: iinc     1, 1    
```

![An image](/img/java/concurrent/17.png)

### 交互规则

对于 volatile 修饰的变量：

- 线程对变量的 use 与 load、read 操作是相关联的，所以变量使用前必须先从主存加载
- 线程对变量的 assign 与 store、write 操作是相关联的，所以变量使用后必须同步至主存
- 线程 1 和线程 2 谁先对变量执行 read 操作，就会先进行 write 操作，防止指令重排

### 双端检锁

Double-Checked Locking：双端检锁机制

DCL（双端检锁）机制不一定是线程安全的，原因是有指令重排的存在，加入 volatile 可以禁止指令重排

```java
public final class Singleton {
    private Singleton() { }
    private static Singleton INSTANCE = null;
    
    public static Singleton getInstance() {
        if(INSTANCE == null) { // t2，这里的判断不是线程安全的
            // 首次访问会同步，而之后的使用没有 synchronized
            synchronized(Singleton.class) {
                // 这里是线程安全的判断，防止其他线程在当前线程等待锁的期间完成了初始化
                if (INSTANCE == null) { 
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}
```

不锁 INSTANCE 的原因：

- INSTANCE 要重新赋值
- INSTANCE 是 null，线程加锁之前需要获取对象的引用，设置对象头，null 没有引用

实现特点：

- 懒惰初始化
- 首次使用 getInstance() 才使用 synchronized 加锁，后续使用时无需加锁
- 第一个 if 使用了 INSTANCE 变量，是在同步块之外，但在多线程环境下会产生问题

问题分析：

getInstance 方法对应的字节码为：

```java
0:  getstatic       #2      // Field INSTANCE:Ltest/Singleton;
3:  ifnonnull       37
6:  ldc             #3      // class test/Singleton
8:  dup
9:  astore_0
10: monitorenter
11: getstatic       #2      // Field INSTANCE:Ltest/Singleton;
14: ifnonnull 27
17: new             #3      // class test/Singleton
20: dup
21: invokespecial   #4      // Method "<init>":()V
24: putstatic       #2      // Field INSTANCE:Ltest/Singleton;
27: aload_0
28: monitorexit
29: goto 37
32: astore_1
33: aload_0
34: monitorexit
35: aload_1
36: athrow
37: getstatic       #2      // Field INSTANCE:Ltest/Singleton;
40: areturn
```

- 17 表示创建对象，将对象引用入栈
- 20 表示复制一份对象引用，引用地址
- 21 表示利用一个对象引用，调用构造方法初始化对象
- 24 表示利用一个对象引用，赋值给 static INSTANCE

**步骤 21 和 24 之间不存在数据依赖关系**，而且无论重排前后，程序的执行结果在单线程中并没有改变，因此这种重排优化是允许的

- 关键在于 0:getstatic 这行代码在 monitor 控制之外，可以越过 monitor 读取 INSTANCE 变量的值
- 当其他线程访问 INSTANCE 不为 null 时，由于 INSTANCE 实例未必已初始化，那么 t2 拿到的是将是一个未初始化完毕的单例返回，这就造成了线程安全的问题

![An image](/img/java/concurrent/18.png)

解决方法：

指令重排只会保证串行语义的执行一致性（单线程），但并不会关系多线程间的语义一致性

引入 volatile，来保证出现指令重排的问题，从而保证单例模式的线程安全性：

```java
private static volatile SingletonDemo INSTANCE = null;
```

### 先行发生

Java 内存模型具备一些先天的“有序性”，即不需要通过任何同步手段（volatile、synchronized 等）就能够得到保证的安全，这个通常也称为 happens-before 原则，它是可见性与有序性的一套规则总结

不符合 happens-before 规则，JMM 并不能保证一个线程的可见性和有序性

1. 程序次序规则 (Program Order Rule)：一个线程内，逻辑上书写在前面的操作先行发生于书写在后面的操作 ，因为多个操作之间有先后依赖关系，则不允许对这些操作进行重排序

2. 锁定规则 (Monitor Lock Rule)：一个 unlock 操作先行发生于后面（时间的先后）对同一个锁的 lock 操作，所以线程解锁 m 之前对变量的写（解锁前会刷新到主内存中），对于接下来对 m 加锁的其它线程对该变量的读可见

3. **volatile 变量规则** (Volatile Variable Rule)：对 volatile 变量的写操作先行发生于后面对这个变量的读

4. 传递规则 (Transitivity)：具有传递性，如果操作 A 先行发生于操作 B，而操作 B 又先行发生于操作 C，则可以得出操作 A 先行发生于操作 C

5. 线程启动规则 (Thread Start Rule)：Thread 对象的 start()方法先行发生于此线程中的每一个操作

   ```java
   static int x = 10; //线程 start 前对变量的写，对该线程开始后对该变量的读可见
   new Thread(()->{ System.out.println(x); },"t1").start();
   ```

6. 线程中断规则 (Thread Interruption Rule)：对线程 interrupt() 方法的调用先行发生于被中断线程的代码检测到中断事件的发生

7. 线程终止规则 (Thread Termination Rule)：线程中所有的操作都先行发生于线程的终止检测，可以通过 Thread.join() 方法结束、Thread.isAlive() 的返回值手段检测到线程已经终止执行

8. 对象终结规则（Finaizer Rule）：一个对象的初始化完成（构造函数执行结束）先行发生于它的 finalize() 方法的开始
