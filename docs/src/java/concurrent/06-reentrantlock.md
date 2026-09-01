# ReentrantLock

## 概览

相对于 synchronized 它具备如下特点

- 可中断
- 可以设置超时时间
- 可以设置为公平锁
- 支持多个条件变量（相当于有多个WaitSet）
- 与 synchronized 一样，都支持可重入

## 基本语法

```java
// 获取锁
reentrantLock.lock();
try {
    // 临界区
} finally {
    // 释放锁
    reentrantLock.unlock();
}
```

## 特性

### 可重入

可重入是指同一个线程如果首次获得了这把锁，那么因为它是这把锁的拥有者，因此有权利再次获取这把锁。

如果是不可重入锁，那么第二次获得锁时，自己也会被锁挡住

- `public void lock()`：获取锁
- `public void unlock()`：释放锁

```java
    static ReentrantLock lock = new ReentrantLock();
    public static void main(String[] args) {
        method1();
    }
    public static void method1() {
        lock.lock();
        try {
            logger.debug("execute method1");
            method2();
        } finally {
            lock.unlock();
        }
    }
    public static void method2() {
        lock.lock();
        try {
            logger.debug("execute method2");
            method3();
        } finally {
            lock.unlock();
        }
    }
    public static void method3() {
        lock.lock();
        try {
            logger.debug("execute method3");
        } finally {
            lock.unlock();
        }
    }

// 输出
2023-09-27 10:15:07.470 [main] DEBUG Main(:) - execute method1
2023-09-27 10:15:07.473 [main] DEBUG Main(:) - execute method2
2023-09-27 10:15:07.473 [main] DEBUG Main(:) - execute method3
```

### 可打断

`lock()`是不可中断模式，如果需要被其他线程打断可以使用`lockInterruptibly()`。

- `public void lockInterruptibly() throws InterruptedException`：获取可打断锁
- `public void interrupt()`：中断线程

```java
public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        Thread t1 = new Thread(() -> {
            logger.debug("启动...");
            try {
                // 如果没有竞争，那么此方法会获得 lock 对象锁
                // 如果有竞争就会进入阻塞状态，可以被其他线程打断
                lock.lockInterruptibly();
            } catch (InterruptedException e) {
                e.printStackTrace();
                logger.debug("等锁的过程中被打断");
                return;
            }
            try {
                logger.debug("获得了锁");
            } finally {
                lock.unlock();
            }
        }, "t1");

        // 主线程加锁
        lock.lock();
        logger.debug("获得了锁");
        t1.start();
        try {
            sleep(1);
            // 打断
            t1.interrupt();
            logger.debug("执行打断");
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            lock.unlock();
        }
    }

// 输出
2023-09-27 10:22:05.984 [main] DEBUG Main(:) - 获得了锁
2023-09-27 10:22:05.987 [t1] DEBUG Main(:) - 启动...
2023-09-27 10:22:05.988 [main] DEBUG Main(:) - 执行打断
2023-09-27 10:22:05.988 [t1] DEBUG Main(:) - 等锁的过程中被打断
java.lang.InterruptedException
    at java.util.concurrent.locks.AbstractQueuedSynchronizer.doAcquireInterruptibly(AbstractQueuedSynchronizer.java:898)
    at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquireInterruptibly(AbstractQueuedSynchronizer.java:1222)
    at java.util.concurrent.locks.ReentrantLock.lockInterruptibly(ReentrantLock.java:335)
    at thread.Main.lambda$main$0(Main.java:22)
    at java.lang.Thread.run(Thread.java:748)
```

### 锁超时

可打断是一种被动的打断方式，`ReentrantLock`提供了一种主动的打断方式：锁超时。

- `public boolean tryLock()`：尝试获取锁，获取不到锁，放弃等待（阻塞）
- `public boolean tryLock(long timeout, TimeUnit unit)`：在特定时间内尝试获取锁，获取不到锁，放弃等待（阻塞）

```java
public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        Thread t1 = new Thread(() -> {
            logger.debug("尝试获取锁...");
            try {
                // 1秒钟内尝试获取锁
                if (!lock.tryLock(1, TimeUnit.SECONDS)) {
                    logger.debug("获取不到锁，返回");
                    return;
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
                logger.debug("获取不到锁，返回");
                throw new RuntimeException(e);
            }
            try {
                logger.debug("获得了锁");
            } finally {
                lock.unlock();
            }
        }, "t1");
        // 主线程 先获取锁
        lock.lock();
        logger.debug("获得了锁");
        t1.start();
        try {
            sleep(500);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            lock.unlock();
        }
    }

// 输出
2023-09-27 10:32:56.614 [main] DEBUG Main(:) - 获得了锁
2023-09-27 10:32:56.618 [t1] DEBUG Main(:) - 尝试获取锁...
2023-09-27 10:32:57.125 [t1] DEBUG Main(:) - 获得了锁
```

### 公平锁

synchronized锁中，在entrylist等待的锁在竞争时不是按照先到先得来获取锁的，所以说synchronized锁时不公平的；

ReentranLock锁默认是不公平的，但是可以通过设置实现公平锁。本意是为了解决之前提到的饥饿问题，但是公平锁一般没有必要，会降低并发度，使用trylock也可以实现。

- `public ReentrantLock(boolean fair)`：默认不公平锁，可以通过配置设置是否使用公平锁

## 条件变量

synchronized 中也有条件变量，就是我们讲原理时那个 waitSet 休息室，当条件不满足时进入 waitSet 等待 ReentrantLock 的条件变量比 synchronized 强大之处在于，它是支持多个条件变量的，这就好比

1. synchronized 是那些不满足条件的线程都在一间休息室等消息
2. 而 ReentrantLock 支持多间休息室，有专门等烟的休息室、专门等早餐的休息室、唤醒时也是按休息室来唤醒

常用API

- `public Condition newCondition()`：Condition类可以实现等待/通知模式
- `void await() throws InterruptedException`：等待
- `boolean await(long time, TimeUnit unit) throws InterruptedException`：等待有限时间
- `void signal()`：唤醒特定等待中的线程
- `void signalAll()`：唤醒所有等待中的线程

```java
    static ReentrantLock lock = new ReentrantLock();
    static Condition waitCigaretteQueue = lock.newCondition();
    static Condition waitbreakfastQueue = lock.newCondition();
    static volatile boolean hasCigrette = false;
    static volatile boolean hasBreakfast = false;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            try {
                lock.lock();
                while (!hasCigrette) {
                    try {
                        waitCigaretteQueue.await();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                logger.debug("等到了它的烟");
            } finally {
                lock.unlock();
            }
        }).start();
        new Thread(() -> {
            try {
                lock.lock();
                while (!hasBreakfast) {
                    try {
                        waitbreakfastQueue.await();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                logger.debug("等到了它的早餐");
            } finally {
                lock.unlock();
            }
        }).start();
        sleep(1000);
        sendBreakfast();
        sleep(1000);
        sendCigarette();
    }

    private static void sendCigarette() {
        lock.lock();
        try {
            logger.debug("送烟来了");
            hasCigrette = true;
            waitCigaretteQueue.signal();
        } finally {
            lock.unlock();
        }
    }
    private static void sendBreakfast() {
        lock.lock();
        try {
            logger.debug("送早餐来了");
            hasBreakfast = true;
            waitbreakfastQueue.signal();
        } finally {
            lock.unlock();
        }
    }

// 输出
2023-09-27 11:36:33.368 [main] DEBUG Main(:) - 送早餐来了
2023-09-27 11:36:33.370 [Thread-2] DEBUG Main(:) - 等到了它的早餐
2023-09-27 11:36:34.372 [main] DEBUG Main(:) - 送烟来了
2023-09-27 11:36:34.372 [Thread-1] DEBUG Main(:) - 等到了它的烟
```

1. await 前需要获得锁
2. await 执行后，会释放锁，进入 conditionObject 等待
3. await 的线程被唤醒（或打断、或超时）取重新竞争 lock 锁，**执行唤醒的线程也必须先获得锁**
4. 竞争 lock 锁成功后，从 await 后继续执行
