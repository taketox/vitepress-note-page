# CountDown

## 基本使用

CountDownLatch：计数器，用来进行线程同步协作，**等待所有线程完成**

构造器：

- `public CountDownLatch(int count)`：初始化唤醒需要的 down 几步

常用API：

- `public void await()`：让当前线程等待，必须 down 完初始化的数字才可以被唤醒，否则进入无限等待
- `public void countDown()`：计数器进行减 1（down 1）

应用：同步等待多个 Rest 远程调用结束

```java
// LOL 10人进入游戏倒计时
public static void main(String[] args) throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(10);
    ExecutorService service = Executors.newFixedThreadPool(10);
    String[] all = new String[10];
    Random random = new Random();

    for (int j = 0; j < 10; j++) {
        int finalJ = j;//常量
        service.submit(() -> {
            for (int i = 0; i <= 100; i++) {
                Thread.sleep(random.nextInt(100)); //随机休眠
                all[finalJ] = i + "%";
                System.out.print("\r" + Arrays.toString(all)); // \r代表覆盖
            }
            latch.countDown();
        });
    }
    latch.await();
    System.out.println("\n游戏开始");
    service.shutdown();
}
/*
[100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%]
游戏开始
```

## 实现原理

阻塞等待：

- 线程调用 await() 等待其他线程完成任务：支持打断

  ```java
  public void await() throws InterruptedException {
      sync.acquireSharedInterruptibly(1);
  }
  // AbstractQueuedSynchronizer#acquireSharedInterruptibly
  public final void acquireSharedInterruptibly(int arg) throws InterruptedException {
      // 判断线程是否被打断，抛出打断异常
      if (Thread.interrupted())
          throw new InterruptedException();
      // 尝试获取共享锁，条件成立说明 state > 0，此时线程入队阻塞等待，等待其他线程获取共享资源
      // 条件不成立说明 state = 0，此时不需要阻塞线程，直接结束函数调用
      if (tryAcquireShared(arg) < 0)
          doAcquireSharedInterruptibly(arg);
  }
  // CountDownLatch.Sync#tryAcquireShared
  protected int tryAcquireShared(int acquires) {
      return (getState() == 0) ? 1 : -1;
  }
  ```

- 线程进入 `AbstractQueuedSynchronizer#doAcquireSharedInterruptibly` 函数阻塞挂起，等待 latch 变为 0：

  ```java
  private void doAcquireSharedInterruptibly(int arg) throws InterruptedException {
      // 将调用latch.await()方法的线程 包装成 SHARED 类型的 node 加入到 AQS 的阻塞队列中
      final Node node = addWaiter(Node.SHARED);
      boolean failed = true;
      try {
          for (;;) {
              // 获取当前节点的前驱节点
              final Node p = node.predecessor();
              // 前驱节点时头节点就可以尝试获取锁
              if (p == head) {
                  // 再次尝试获取锁，获取成功返回 1
                  int r = tryAcquireShared(arg);
                  if (r >= 0) {
                      // 获取锁成功，设置当前节点为 head 节点，并且向后传播
                      setHeadAndPropagate(node, r);
                      p.next = null; // help GC
                      failed = false;
                      return;
                  }
              }
              // 阻塞在这里
              if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                  throw new InterruptedException();
          }
      } finally {
          // 阻塞线程被中断后抛出异常，进入取消节点的逻辑
          if (failed)
              cancelAcquire(node);
      }
  }
  ```

- 获取共享锁成功，进入唤醒阻塞队列中与头节点相连的 SHARED 模式的节点：

  ```java
  private void setHeadAndPropagate(Node node, int propagate) {
      Node h = head;
      // 将当前节点设置为新的 head 节点，前驱节点和持有线程置为 null
      setHead(node);
      // propagate = 1，条件一成立
      if (propagate > 0 || h == null || h.waitStatus < 0 || (h = head) == null || h.waitStatus < 0) {
          // 获取当前节点的后继节点
          Node s = node.next;
          // 当前节点是尾节点时 next 为 null，或者后继节点是 SHARED 共享模式
          if (s == null || s.isShared())
              // 唤醒所有的等待共享锁的节点
              doReleaseShared();
      }
  }
  ```

计数减一：

- 线程进入 countDown() 完成计数器减一（释放锁）的操作

  ```java
  public void countDown() {
      sync.releaseShared(1);
  }
  public final boolean releaseShared(int arg) {
      // 尝试释放共享锁
      if (tryReleaseShared(arg)) {
          // 释放锁成功开始唤醒阻塞节点
          doReleaseShared();
          return true;
      }
      return false;
  }
  ```

- 更新 state 值，每调用一次，state 值减一，当 state -1 正好为 0 时，返回 true

  ```java
  protected boolean tryReleaseShared(int releases) {
      for (;;) {
          int c = getState();
          // 条件成立说明前面【已经有线程触发唤醒操作】了，这里返回 false
          if (c == 0)
              return false;
          // 计数器减一
          int nextc = c-1;
          if (compareAndSetState(c, nextc))
              // 计数器为 0 时返回 true
              return nextc == 0;
      }
  }
  ```

- state = 0 时，当前线程需要执行**唤醒阻塞节点的任务**

  ```java
  private void doReleaseShared() {
      for (;;) {
          Node h = head;
          // 判断队列是否是空队列
          if (h != null && h != tail) {
              int ws = h.waitStatus;
              // 头节点的状态为 signal，说明后继节点没有被唤醒过
              if (ws == Node.SIGNAL) {
                  // cas 设置头节点的状态为 0，设置失败继续自旋
                  if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                      continue;
                  // 唤醒后继节点
                  unparkSuccessor(h);
              }
              // 如果有其他线程已经设置了头节点的状态，重新设置为 PROPAGATE 传播属性
              else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                  continue;
          }
          // 条件不成立说明被唤醒的节点非常积极，直接将自己设置为了新的head，
          // 此时唤醒它的节点（前驱）执行 h == head 不成立，所以不会跳出循环，会继续唤醒新的 head 节点的后继节点
          if (h == head)
              break;
      }
  }
  ```
