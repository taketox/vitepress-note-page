# Semaphore

## 基本使用

synchronized 可以起到锁的作用，但某个时间段内，只能有一个线程允许执行

Semaphore（信号量）用来限制能同时访问共享资源的线程上限，非重入锁

构造方法：

- `public Semaphore(int permits)`：permits 表示许可线程的数量（state）
- `public Semaphore(int permits, boolean fair)`：fair 表示公平性，如果设为 true，下次执行的线程会是等待最久的线程

常用API：

- `public void acquire()`：表示获取许可
- `public void release()`：表示释放许可，acquire() 和 release() 方法之间的代码为同步代码

```java
public static void main(String[] args) {
    // 1.创建Semaphore对象
    Semaphore semaphore = new Semaphore(3);

    // 2. 10个线程同时运行
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            try {
                // 3. 获取许可
                semaphore.acquire();
                sout(Thread.currentThread().getName() + " running...");
                Thread.sleep(1000);
                sout(Thread.currentThread().getName() + " end...");
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                // 4. 释放许可
                semaphore.release();
            }
        }).start();
    }
}
```

## 实现原理

加锁流程：

- Semaphore 的 permits（state）为 3，这时 5 个线程来获取资源

  ```java
  Sync(int permits) {
      setState(permits);
  }
  ```

  假设其中 Thread-1，Thread-2，Thread-4 CAS 竞争成功，permits 变为 0，而 Thread-0 和 Thread-3 竞争失败，进入 AQS 队列park 阻塞

  ```java
  // acquire() -> sync.acquireSharedInterruptibly(1)，可中断
  public final void acquireSharedInterruptibly(int arg) {
      if (Thread.interrupted())
          throw new InterruptedException();
      // 尝试获取通行证，获取成功返回 >= 0的值
      if (tryAcquireShared(arg) < 0)
          // 获取许可证失败，进入阻塞
          doAcquireSharedInterruptibly(arg);
  }
  
  // tryAcquireShared() -> nonfairTryAcquireShared()
  // 非公平，公平锁会在循环内 hasQueuedPredecessors()方法判断阻塞队列是否有临头节点(第二个节点)
  final int nonfairTryAcquireShared(int acquires) {
      for (;;) {
          // 获取 state ，state 这里【表示通行证】
          int available = getState();
          // 计算当前线程获取通行证完成之后，通行证还剩余数量
          int remaining = available - acquires;
          // 如果许可已经用完, 返回负数, 表示获取失败,
          if (remaining < 0 ||
              // 许可证足够分配的，如果 cas 重试成功, 返回正数, 表示获取成功
              compareAndSetState(available, remaining))
              return remaining;
      }
  }
  ```

  ------

  ```java
  private void doAcquireSharedInterruptibly(int arg) {
      // 将调用 Semaphore.aquire 方法的线程，包装成 node 加入到 AQS 的阻塞队列中
      final Node node = addWaiter(Node.SHARED);
      // 获取标记
      boolean failed = true;
      try {
          for (;;) {
              final Node p = node.predecessor();
              // 前驱节点是头节点可以再次获取许可
              if (p == head) {
                  // 再次尝试获取许可，【返回剩余的许可证数量】
                  int r = tryAcquireShared(arg);
                  if (r >= 0) {
                      // 成功后本线程出队（AQS）, 所在 Node设置为 head
                      // r 表示【可用资源数】, 为 0 则不会继续传播
                      setHeadAndPropagate(node, r); 
                      p.next = null; // help GC
                      failed = false;
                      return;
                  }
              }
              // 不成功, 设置上一个节点 waitStatus = Node.SIGNAL, 下轮进入 park 阻塞
              if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                  throw new InterruptedException();
          }
      } finally {
          // 被打断后进入该逻辑
          if (failed)
              cancelAcquire(node);
      }
  }
  ```

  ------

  ```java
  private void setHeadAndPropagate(Node node, int propagate) {    
      Node h = head;
      // 设置自己为 head 节点
      setHead(node);
      // propagate 表示有【共享资源】（例如共享读锁或信号量）
      // head waitStatus == Node.SIGNAL 或 Node.PROPAGATE，doReleaseShared 函数中设置的
      if (propagate > 0 || h == null || h.waitStatus < 0 ||
          (h = head) == null || h.waitStatus < 0) {
          Node s = node.next;
          // 如果是最后一个节点或者是等待共享读锁的节点，做一次唤醒
          if (s == null || s.isShared())
              doReleaseShared();
      }
  }
  ```

  ------

  ![An image](/img/java/concurrent/58.png)

- 这时 Thread-4 释放了 permits，状态如下

  ```java
  // release() -> releaseShared()
  public final boolean releaseShared(int arg) {
      // 尝试释放锁
      if (tryReleaseShared(arg)) {
          doReleaseShared();
          return true;
      }    
      return false;
  }
  protected final boolean tryReleaseShared(int releases) {    
      for (;;) {
          // 获取当前锁资源的可用许可证数量
          int current = getState();
          int next = current + releases;
          // 索引越界判断
          if (next < current)            
              throw new Error("Maximum permit count exceeded");        
          // 释放锁
          if (compareAndSetState(current, next))            
              return true;    
      }
  }
  private void doReleaseShared() {    
      // PROPAGATE 详解    
      // 如果 head.waitStatus == Node.SIGNAL ==> 0 成功, 下一个节点 unpark
      // 如果 head.waitStatus == 0 ==> Node.PROPAGATE
  }
  ```

  ------

  ![An image](/img/java/concurrent/59.png)

- 接下来 Thread-0 竞争成功，permits 再次设置为 0，设置自己为 head 节点，并且 unpark 接下来的共享状态的 Thread-3 节点，但由于 permits 是 0，因此 Thread-3 在尝试不成功后再次进入 park 状态

## PROPAGATE

假设存在某次循环中队列里排队的结点情况为 `head(-1) → t1(-1) → t2(0)`，存在将要释放信号量的 T3 和 T4，释放顺序为先 T3 后 T4

```java
// 老版本代码
private void setHeadAndPropagate(Node node, int propagate) {    
    setHead(node);    
    // 有空闲资源    
    if (propagate > 0 && node.waitStatus != 0) {    
        Node s = node.next;        
        // 下一个        
        if (s == null || s.isShared())            
            unparkSuccessor(node);        
    }
}
```

正常流程：

- T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0
- T1 由于 T3 释放信号量被唤醒，然后 T4 释放，唤醒 T2

BUG 流程：

- T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0
- T1 由于 T3 释放信号量被唤醒，调用 tryAcquireShared，返回值为 0（获取锁成功，但没有剩余资源量）
- T1 还没调用 setHeadAndPropagate 方法，T4 调用 releaseShared(1)，此时 head.waitStatus 为 0（此时读到的 head 和 1 中为同一个 head），不满足条件，因此不调用 unparkSuccessor(head)
- T1 获取信号量成功，调用 setHeadAndPropagate(t1.node, 0) 时，因为不满足 propagate > 0（剩余资源量 == 0），从而不会唤醒后继结点， **T2 线程得不到唤醒**

更新后流程：

- T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0
- T1 由于 T3 释放信号量被唤醒，调用 tryAcquireShared，返回值为 0（获取锁成功，但没有剩余资源量）
- T1 还没调用 setHeadAndPropagate 方法，T4 调用 releaseShared()，此时 head.waitStatus 为 0（此时读到的 head 和 1 中为同一个 head），调用 doReleaseShared() 将等待状态置为 **PROPAGATE（-3）**
- T1 获取信号量成功，调用 setHeadAndPropagate 时，读到 h.waitStatus < 0，从而调用 doReleaseShared() 唤醒 T2

```java
private void setHeadAndPropagate(Node node, int propagate) {    
    Node h = head;
    // 设置自己为 head 节点
    setHead(node);
    // propagate 表示有共享资源（例如共享读锁或信号量）
    // head waitStatus == Node.SIGNAL 或 Node.PROPAGATE
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        // 如果是最后一个节点或者是等待共享读锁的节点，做一次唤醒
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

------

```java
// 唤醒
private void doReleaseShared() {
    // 如果 head.waitStatus == Node.SIGNAL ==> 0 成功, 下一个节点 unpark
    // 如果 head.waitStatus == 0 ==> Node.PROPAGATE    
    for (;;) {
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            if (ws == Node.SIGNAL) {
                // 防止 unparkSuccessor 被多次执行
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 唤醒后继节点
                unparkSuccessor(h);
            }
            // 如果已经是 0 了，改为 -3，用来解决传播性
            else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```
