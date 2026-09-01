# CyclicBarrier

## 基本使用

CyclicBarrier：循环屏障，用来进行线程协作，等待线程满足某个计数，才能触发自己执行

常用方法：

- `public CyclicBarrier(int parties, Runnable barrierAction)`：用于在线程到达屏障 parties 时，执行 barrierAction
  - parties：代表多少个线程到达屏障开始触发线程任务
  - barrierAction：线程任务
- `public int await()`：线程调用 await 方法通知 CyclicBarrier 本线程已经到达屏障

与 CountDownLatch 的区别：CyclicBarrier 是可以重用的

应用：可以实现多线程中，某个任务在等待其他线程执行完毕以后触发

```java
public static void main(String[] args) {
    ExecutorService service = Executors.newFixedThreadPool(2);
    CyclicBarrier barrier = new CyclicBarrier(2, () -> {
        System.out.println("task1 task2 finish...");
    });

    for (int i = 0; i < 3; i++) { // 循环重用
        service.submit(() -> {
            System.out.println("task1 begin...");
            try {
                Thread.sleep(1000);
                barrier.await();    // 2 - 1 = 1
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });

        service.submit(() -> {
            System.out.println("task2 begin...");
            try {
                Thread.sleep(2000);
                barrier.await();    // 1 - 1 = 0
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });
    }
    service.shutdown();
}
```

## 实现原理

### 成员属性

- 全局锁：利用可重入锁实现的工具类

  ```java
  // barrier 实现是依赖于Condition条件队列，condition 条件队列必须依赖lock才能使用
  private final ReentrantLock lock = new ReentrantLock();
  // 线程挂起实现使用的 condition 队列，当前代所有线程到位，这个条件队列内的线程才会被唤醒
  private final Condition trip = lock.newCondition();
  ```

- 线程数量：

  ```java
  private final int parties;    // 代表多少个线程到达屏障开始触发线程任务
  private int count;            // 表示当前“代”还有多少个线程未到位，初始值为 parties
  ```

- 当前代中最后一个线程到位后要执行的事件：

  ```java
  private final Runnable barrierCommand;
  ```

- 代：

  ```java
  // 表示 barrier 对象当前 代
  private Generation generation = new Generation();
  private static class Generation {
      // 表示当前“代”是否被打破，如果被打破再来到这一代的线程 就会直接抛出 BrokenException 异常
      // 且在这一代挂起的线程都会被唤醒，然后抛出 BrokerException 异常。
      boolean broken = false;
  }
  ```

- 构造方法：

  ```java
  public CyclicBarrie(int parties, Runnable barrierAction) {
      // 因为小于等于 0 的 barrier 没有任何意义
      if (parties <= 0) throw new IllegalArgumentException();
  
      this.parties = parties;
      this.count = parties;
      // 可以为 null
      this.barrierCommand = barrierAction;
  }
  ```

  ------

 ![An image](/img/java/concurrent/57.png)

### 成员方法

- await()：阻塞等待所有线程到位

  ```java
  public int await() throws InterruptedException, BrokenBarrierException {
      try {
          return dowait(false, 0L);
      } catch (TimeoutException toe) {
          throw new Error(toe); // cannot happen
      }
  }
  ```

  ------

  ```java
  // timed：表示当前调用await方法的线程是否指定了超时时长，如果 true 表示线程是响应超时的
  // nanos：线程等待超时时长，单位是纳秒
  private int dowait(boolean timed, long nanos) {
      final ReentrantLock lock = this.lock;
      // 加锁
      lock.lock();
      try {
          // 获取当前代
          final Generation g = generation;
  
          // 【如果当前代是已经被打破状态，则当前调用await方法的线程，直接抛出Broken异常】
          if (g.broken)
              throw new BrokenBarrierException();
          // 如果当前线程被中断了，则打破当前代，然后当前线程抛出中断异常
          if (Thread.interrupted()) {
              // 设置当前代的状态为 broken 状态，唤醒在 trip 条件队列内的线程
              breakBarrier();
              throw new InterruptedException();
          }
  
          // 逻辑到这说明，当前线程中断状态是 false， 当前代的 broken 为 false（未打破状态）
          
          // 假设 parties 给的是 5，那么index对应的值为 4,3,2,1,0
          int index = --count;
          // 条件成立说明当前线程是最后一个到达 barrier 的线程，【需要开启新代，唤醒阻塞线程】
          if (index == 0) {
              // 栅栏任务启动标记
              boolean ranAction = false;
              try {
                  final Runnable command = barrierCommand;
                  if (command != null)
                      // 启动触发的任务
                      command.run();
                  // run()未抛出异常的话，启动标记设置为 true
                  ranAction = true;
                  // 开启新的一代，这里会【唤醒所有的阻塞队列】
                  nextGeneration();
                  // 返回 0 因为当前线程是此代最后一个到达的线程，index == 0
                  return 0;
              } finally {
                  // 如果 command.run() 执行抛出异常的话，会进入到这里
                  if (!ranAction)
                      breakBarrier();
              }
          }
  
          // 自旋，一直到条件满足、当前代被打破、线程被中断，等待超时
          for (;;) {
              try {
                  // 根据是否需要超时等待选择阻塞方法
                  if (!timed)
                      // 当前线程释放掉 lock，【进入到 trip 条件队列的尾部挂起自己】，等待被唤醒
                      trip.await();
                  else if (nanos > 0L)
                      nanos = trip.awaitNanos(nanos);
              } catch (InterruptedException ie) {
                  // 被中断后来到这里的逻辑
                  
                  // 当前代没有变化并且没有被打破
                  if (g == generation && !g.broken) {
                      // 打破屏障
                      breakBarrier();
                      // node 节点在【条件队列】内收到中断信号时 会抛出中断异常
                      throw ie;
                  } else {
                      // 等待过程中代变化了，完成一次自我打断
                      Thread.currentThread().interrupt();
                  }
              }
            // 唤醒后的线程，【判断当前代已经被打破，线程唤醒后依次抛出 BrokenBarrier 异常】
              if (g.broken)
                  throw new BrokenBarrierException();
  
              // 当前线程挂起期间，最后一个线程到位了，然后触发了开启新的一代的逻辑
              if (g != generation)
                  return index;
            // 当前线程 trip 中等待超时，然后主动转移到阻塞队列
              if (timed && nanos <= 0L) {
                  breakBarrier();
                  // 抛出超时异常
                  throw new TimeoutException();
              }
          }
      } finally {
          // 解锁
          lock.unlock();
      }
  }
  ```

- breakBarrier()：打破 Barrier 屏障

  ```java
  private void breakBarrier() {
      // 将代中的 broken 设置为 true，表示这一代是被打破了，再来到这一代的线程，直接抛出异常
      generation.broken = true;
      // 重置 count 为 parties
      count = parties;
      // 将在trip条件队列内挂起的线程全部唤醒，唤醒后的线程会检查当前是否是打破的，然后抛出异常
      trip.signalAll();
  }
  ```

- nextGeneration()：开启新的下一代

  ```java
  private void nextGeneration() {
      // 将在 trip 条件队列内挂起的线程全部唤醒
      trip.signalAll();
      // 重置 count 为 parties
      count = parties;
  
      // 开启新的一代，使用一个新的generation对象，表示新的一代，新的一代和上一代【没有任何关系】
      generation = new Generation();
  }
  ```
