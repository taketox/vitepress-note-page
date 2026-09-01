# 并发工具类

## 概览

`java.util.concurrent.atomic`并发包提供了一些并发工具类，这里把它分成五类：

1. 使用原子的方式更新基本类型
   - `AtomicInteger`：整型原子类
   - `AtomicLong`：长整型原子类
   - `AtomicBoolean`：布尔型原子类
2. 原子引用
3. 原子数组
4. 字段更新器
5. 原子累加器

## 原子整数

常见原子类：`AtomicInteger`、`AtomicBoolean`、`AtomicLong`

> 上面三个类提供的方法几乎相同，所以我们将以 `AtomicInteger`为例子来介绍。

构造方法：

- `public AtomicInteger()`：初始化一个默认值为 0 的原子型 Integer
- `public AtomicInteger(int initialValue)`：初始化一个指定值的原子型 Integer

常用API：

| 方法                                                         | 作用                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| public final int `get`()                                     | 获取 AtomicInteger 的值                                      |
| public final int `getAndIncrement`()                         | 以原子方式将当前值加 1，返回的是自增前的值                   |
| public final int `incrementAndGet`()                         | 以原子方式将当前值加 1，返回的是自增后的值                   |
| public final int `getAndDecrement`()                         | 以原子方式将当前值减 1，返回的是自减前的值                   |
| public final int `decrementAndGet`()                         | 以原子方式将当前值减1，返回的是自减后的值                    |
| public final boolean `compareAndSet`(int expect, int update) | 如果输入的数值等于预期值，则以原子方式将该值设置为输入的值。 |
| public final int `getAndSet`(int value)                      | 以原子方式设置为 newValue 的值，返回旧值                     |
| public final int `addAndGet`(int data)                       | 以原子方式将输入的数值与实例中的值相加并返回                 |
| public final int `getAndUpdate`(IntUnaryOperator updateFunction) | 以原子方式用给定的方法更新当前值，并返回变更之前的值。       |
| public final int `updateAndGet`(IntUnaryOperator updateFunction) | 以原子方式用给定的方法更新当前值，并返回变更之后的值。       |
| public final int `getAndAccumulate`(int x, IntBinaryOperator accumulatorFunction) | 以原子方式用给定的方法对当前及给定的值进行更新，并返回变更之前的值。 |
| public final int `accumulateAndGet`(int x, IntBinaryOperator accumulatorFunction) | 以原子方式用给定的方法对当前及给定的值进行更新，并返回变更之后的值。 |

```java
    public static void main(String[] args) {
        AtomicInteger i = new AtomicInteger(0);
        // 获取并自增（i = 0, 结果 i = 1, 返回 0），类似于 i++
        System.out.println(i.getAndIncrement());
        // 自增并获取（i = 1, 结果 i = 2, 返回 2），类似于 ++i
        System.out.println(i.incrementAndGet());
        // 自减并获取（i = 2, 结果 i = 1, 返回 1），类似于 --i
        System.out.println(i.decrementAndGet());
        // 获取并自减（i = 1, 结果 i = 0, 返回 1），类似于 i--
        System.out.println(i.getAndDecrement());
        // 获取并加值（i = 0, 结果 i = 5, 返回 0）
        System.out.println(i.getAndAdd(5));
        // 加值并获取（i = 5, 结果 i = 0, 返回 0）
        System.out.println(i.addAndGet(-5));
        // 获取并更新（i = 0, p 为 i 的当前值, 结果 i = -2, 返回 0）
        // 函数式编程接口，其中函数中的操作能保证原子，但函数需要无副作用
        System.out.println(i.getAndUpdate(p -> p - 2));
        // 更新并获取（i = -2, p 为 i 的当前值, 结果 i = 0, 返回 0）
        // 函数式编程接口，其中函数中的操作能保证原子，但函数需要无副作用
        System.out.println(i.updateAndGet(p -> p + 2));
        // 获取并计算（i = 0, p 为 i 的当前值, x 为参数1, 结果 i = 10, 返回 0）
        // 函数式编程接口，其中函数中的操作能保证原子，但函数需要无副作用
        // getAndUpdate 如果在 lambda 中引用了外部的局部变量，要保证该局部变量是 final 的
        // getAndAccumulate 可以通过 参数1 来引用外部的局部变量，但因为其不在 lambda 中因此不必是 final
        System.out.println(i.getAndAccumulate(10, (p, x) -> p + x));
        // 计算并获取（i = 10, p 为 i 的当前值, x 为参数1值, 结果 i = 0, 返回 0）
        // 函数式编程接口，其中函数中的操作能保证原子，但函数需要无副作用
        System.out.println(i.accumulateAndGet(-10, (p, x) -> p + x));
    }
```

### 原理分析

**AtomicInteger 原理**：自旋锁 + CAS 算法

CAS 算法：有 3 个操作数（内存值 V， 旧的预期值 A，要修改的值 B）

- 当旧的预期值 A == 内存值 V 此时可以修改，将 V 改为 B
- 当旧的预期值 A != 内存值 V 此时不能修改，并重新获取现在的最新值，重新获取的动作就是自旋

分析 getAndSet 方法：

- AtomicInteger：

  ```java
  public final int getAndSet(int newValue) {
      /**
      * this:      当前对象
      * valueOffset:     内存偏移量，内存地址
      */
      return unsafe.getAndSetInt(this, valueOffset, newValue);
  }
  ```

  valueOffset：偏移量表示该变量值相对于当前对象地址的偏移，Unsafe 就是根据内存偏移地址获取数据

  ```java
  valueOffset = unsafe.objectFieldOffset
                  (AtomicInteger.class.getDeclaredField("value"));
  //调用本地方法   -->
  public native long objectFieldOffset(Field var1);
  ```

- unsafe 类：

  ```java
  // val1: AtomicInteger对象本身，var2: 该对象值得引用地址，var4: 需要变动的数
  public final int getAndSetInt(Object var1, long var2, int var4) {
      int var5;
      do {
          // var5: 用 var1 和 var2 找到的内存中的真实值
          var5 = this.getIntVolatile(var1, var2);
      } while(!this.compareAndSwapInt(var1, var2, var5, var4));
  
      return var5;
  }
  ```

  var5：从主内存中拷贝到工作内存中的值（每次都要从主内存拿到最新的值到本地内存），然后执行 `compareAndSwapInt()` 再和主内存的值进行比较，假设方法返回 false，那么就一直执行 while 方法，直到期望的值和真实值一样，修改数据

- 变量 value 用 volatile 修饰，保证了多线程之间的内存可见性，避免线程从工作缓存中获取失效的变量

  ```java
  private volatile int value
  ```

  **CAS 必须借助 volatile 才能读取到共享变量的最新值来实现比较并交换的效果**

分析 getAndUpdate 方法：

- getAndUpdate：

  ```java
  public final int getAndUpdate(IntUnaryOperator updateFunction) {
      int prev, next;
      do {
          prev = get(); //当前值，cas的期望值
          next = updateFunction.applyAsInt(prev);//期望值更新到该值
      } while (!compareAndSet(prev, next));//自旋
      return prev;
  }
  ```

  函数式接口：可以自定义操作逻辑

  ```java
  AtomicInteger a = new AtomicInteger();
  a.getAndUpdate(i -> i + 10);
  ```

- compareAndSet：

  ```java
  public final boolean compareAndSet(int expect, int update) {
      /**
      * this:      当前对象
      * valueOffset:     内存偏移量，内存地址
      * expect:     期望的值
      * update:     更新的值
      */
      return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
  }
  ```

## 原子引用

原子引用：对 Object 进行原子操作，提供一种读和写都是原子性的对象引用变量

原子引用类：AtomicReference、AtomicStampedReference、AtomicMarkableReference

### AtomicReference

AtomicReference 类：引用类型原子类

- 构造方法：`AtomicReference<T> atomicReference = new AtomicReference<T>()`
- 常用 API：
  - `public final boolean compareAndSet(V expectedValue, V newValue)`：CAS 操作
  - `public final void set(V newValue)`：将值设置为 newValue
  - `public final V get()`：返回当前值

示例：提供不同的 DecimalAccount 实现，实现安全的取款操作

```java
    public interface DecimalAccount {
        // 获取余额
        BigDecimal getBalance();
        // 取款
        void withdraw(BigDecimal amount);
        /**
         * 方法内会启动 1000 个线程，每个线程做 -10 元 的操作
         * 如果初始余额为 10000 那么正确的结果应当是 0
         */
        static void demo(DecimalAccount account) {
            List<Thread> ts = new ArrayList<>();
            for (int i = 0; i < 1000; i++) {
                ts.add(new Thread(() -> {
                    account.withdraw(BigDecimal.TEN);
                }));
            }
            ts.forEach(Thread::start);
            ts.forEach(t -> {
                try {
                    t.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
            System.out.println(account.getBalance());
        }
    }

// 解决
class DecimalAccountCas implements DecimalAccount{

    //private BigDecimal balance;
    private AtomicReference<BigDecimal> balance;

    public DecimalAccountCas(BigDecimal balance) {
        this.balance = new AtomicReference<>(balance);
    }

    @Override
    public BigDecimal getBalance() {
        return balance.get();
    }

    @Override
    public void withdraw(BigDecimal amount) {
        while(true){
            BigDecimal pre = balance.get();
            // 注意：这里的balance返回的是一个新的对象，即 pre!=next
            BigDecimal next = pre.subtract(amount);
            if (balance.compareAndSet(pre,next)){
                break;
            }
        }
    }
}
```

ABA问题

在多线程环境下，一个共享变量从初始值A经过一系列操作变为值B，然后再回到值A的情况下，CAS操作无法察觉到中间的变化。

```java
    static AtomicReference<String> ref = new AtomicReference<>("A");
    public static void main(String[] args) throws InterruptedException {
        logger.debug("main start...");
        // 获取值 A
        // 这个共享变量被它线程修改
        String prev = ref.get();
        other();
        sleep(1000);
        // 尝试改为 C
        logger.debug("change A->C {}", ref.compareAndSet(prev, "C"));
    }
    private static void other() throws InterruptedException {
        new Thread(() -> {
            logger.debug("change A->B {}", ref.compareAndSet(ref.get(), "B"));
        }, "t1").start();
        sleep(1000);
        new Thread(() -> {
            // 注意：如果这里使用  logger.debug("change B->A {}", ref.compareAndSet(ref.get(), new String("A")));
            // 那么此实验中的 logger.debug("change A->C {}", ref.compareAndSet(prev, "C"));
            // 打印的就是false， 因为new String("A") 返回的对象的引用和"A"返回的对象的引用时不同的！
            logger.debug("change B->A {}", ref.compareAndSet(ref.get(), "A"));
        }, "t2").start();
    }
// 输出
2023-09-28 11:46:27.297 [main] DEBUG Main(:) - main start...
2023-09-28 11:46:27.303 [t1] DEBUG Main(:) - change A->B true
2023-09-28 11:46:28.304 [t2] DEBUG Main(:) - change B->A true
2023-09-28 11:46:29.311 [main] DEBUG Main(:) - change A->C true
```

> 主线程仅能判断出共享变量的值与最初值 A 是否相同，不能感知到这种从 A 改为 B 又改回 A 的情况。
>
> 如果主线程希望，只要有其它线程【动过了】共享变量，那么自己的 cas 就算失败，这时，仅比较值是不够的，需要再加一个版本号。使用AtomicStampedReference来解决。

### AtomicStampedReference

AtomicStampedReference：可以给原子引用加上版本号，追踪原子引用整个的变化过程，**可以知道引用变量中途被更改了几次**。可用于解决原子的更新数据和数据的版本号，可以解决使用 CAS 进行原子更新时可能出现的 ABA 问题。

- 构造方法：`public AtomicStampedReference(V initialRef, int initialStamp)`
- 常用 API：
  - `public boolean compareAndSet(V expectedReference, V newReference, int expectedStamp, int newStamp)`：带版本号的CAS 操作
  - `public void set(V newReference, int newStamp)`：将值设为 newReference，将版本号设为 newStamp
  - `public V getReference()`：返回当前值
  - `public int getStamp()`：获取版本号

ABA问题解决

```java
static AtomicStampedReference<String> ref = new AtomicStampedReference<>("A", 0);

    public static void main(String[] args) throws InterruptedException {
        logger.debug("main start...");
        // 获取值 A
        String prev = ref.getReference();
        // 获取版本号
        int stamp = ref.getStamp();
        logger.debug("版本 {}", stamp);
        // 如果中间有其它线程干扰，发生了 ABA 现象
        other();
        sleep(1);
        // 尝试改为 C
        logger.debug("change A->C {}", ref.compareAndSet(prev, "C", stamp, stamp + 1));
    }

    private static void other() throws InterruptedException {
        new Thread(() -> {
            logger.debug("change A->B {}", ref.compareAndSet(ref.getReference(), "B",
                    ref.getStamp(), ref.getStamp() + 1));
            logger.debug("更新版本为 {}", ref.getStamp());
        }, "t1").start();
        sleep(1000);
        new Thread(() -> {
            logger.debug("change B->A {}", ref.compareAndSet(ref.getReference(), "A",
                    ref.getStamp(), ref.getStamp() + 1));
            logger.debug("更新版本为 {}", ref.getStamp());
        }, "t2").start();
    }

// 输出
2023-09-28 11:50:25.732 [main] DEBUG Main(:) - main start...
2023-09-28 11:50:25.736 [main] DEBUG Main(:) - 版本 0
2023-09-28 11:50:25.737 [t1] DEBUG Main(:) - change A->B true
2023-09-28 11:50:25.738 [t1] DEBUG Main(:) - 更新版本为 1
2023-09-28 11:50:26.748 [t2] DEBUG Main(:) - change B->A true
2023-09-28 11:50:26.748 [t2] DEBUG Main(:) - 更新版本为 2
2023-09-28 11:50:26.749 [main] DEBUG Main(:) - change A->C false
```

### AtomicMarkableReference

AtomicMarkableReference ：原子更新带有标记的引用类型。该类将 boolean 标记与引用关联起来，并不关心引用变量更改了几次，只是单纯的关心**是否更改过**。

- 构造方法：`public AtomicMarkableReference(V initialRef, boolean initialMark)`
- 常用 API：
  - `public boolean compareAndSet(V expectedReference, V newReference, boolean expectedMark, boolean newMark)`：带标记的CAS 操作
  - `public void set(V newReference, boolean newMark)`：将值设为 newReference，将标记设为 newMark
  - `public V getReference()`：返回当前值
  - `public boolean isMarked()`：获取标记

示例

```java
static AtomicMarkableReference<String> ref = new AtomicMarkableReference<String>("A", false);

    public static void main(String[] args) throws InterruptedException {
        logger.debug("main start...");
        // 获取值 A
        String prev = ref.getReference();
        logger.debug("更新标记为 {}", ref.isMarked());
        other();
        sleep(1);
        // 尝试改为 C
        logger.debug("change A->C {}", ref.compareAndSet(prev, "C", false, true));
    }

    private static void other() throws InterruptedException {
        new Thread(() -> {
            logger.debug("change A->B {}", ref.compareAndSet(ref.getReference(), "B",
                    false, true));
            logger.debug("更新标记为 {}", ref.isMarked());
        }, "t1").start();
        sleep(1000);
        new Thread(() -> {
            logger.debug("change B->A {}", ref.compareAndSet(ref.getReference(), "A",
                    false, true));
            logger.debug("更新标记为 {}", ref.isMarked());
        }, "t2").start();
    }

// 输出
2023-09-28 12:04:18.167 [main] DEBUG Main(:) - main start...
2023-09-28 12:04:18.171 [main] DEBUG Main(:) - 更新标记为 false
2023-09-28 12:04:18.172 [t1] DEBUG Main(:) - change A->B true
2023-09-28 12:04:18.172 [t1] DEBUG Main(:) - 更新标记为 true
2023-09-28 12:04:19.182 [t2] DEBUG Main(:) - change B->A false
2023-09-28 12:04:19.182 [t2] DEBUG Main(:) - 更新标记为 true
2023-09-28 12:04:19.184 [main] DEBUG Main(:) - change A->C false
```

## 原子数组

使用原子的方式更新数组里的某个元素

- AtomicIntegerArray：整形数组原子类
- AtomicLongArray：长整形数组原子类
- AtomicReferenceArray ：引用类型数组原子类

构造方法

- `public AtomicIntegerArray(int length)`
- `public AtomicIntegerArray(int[] array)`

常用API

- `public final boolean compareAndSet(int i, int expect, int update)`：数组CAS操作

```java
    /**
     * 参数1，提供数组、可以是线程不安全数组或线程安全数组
     * 参数2，获取数组长度的方法
     * 参数3，自增方法，回传 array, index
     * 参数4，打印数组的方法
     * supplier 提供者 无中生有 ()->结果
     * function 函数 一个参数一个结果 (参数)->结果 , BiFunction (参数1,参数2)->结果
     * consumer 消费者 一个参数没结果 (参数)->void, BiConsumer (参数1,参数2)->
     */
    private static <T> void demo(
            Supplier<T> arraySupplier,
            Function<T, Integer> lengthFun,
            BiConsumer<T, Integer> putConsumer,
            Consumer<T> printConsumer) {
        List<Thread> ts = new ArrayList<>();
        T array = arraySupplier.get();
        int length = lengthFun.apply(array);
        for (int i = 0; i < length; i++) {
            // 每个线程对数组作 10000 次操作
            ts.add(new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    putConsumer.accept(array, j % length);
                }
            }));
        }
        ts.forEach(t -> t.start()); // 启动所有线程
        ts.forEach(t -> {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }); // 等所有线程结束
        printConsumer.accept(array);
    }

// 使用
    public static void main(String[] args) {
        demo(
                ()-> new AtomicIntegerArray(10),
                (array) -> array.length(),
                (array, index) -> array.getAndIncrement(index),
                array -> logger.info(array)
        );
    }
// 输出
2023-09-28 14:21:54.383 [main] INFO  Main(:) - [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000]
```

## 字段更新器

利用字段更新器，可以针对对象的某个域（Field）进行原子操作

- AtomicReferenceFieldUpdater // 域 字段
- AtomicIntegerFieldUpdater
- AtomicLongFieldUpdater

构造方法：`static <U> AtomicIntegerFieldUpdater<U> newUpdater(Class<U> c, String fieldName)`

常用 API：

- `abstract boolean compareAndSet(T obj, int expect, int update)`：CAS

示例：针对某个对象的字段进行原子操作

```java
private volatile int field;

    public static void main(String[] args) {
        AtomicIntegerFieldUpdater fieldUpdater = AtomicIntegerFieldUpdater.newUpdater(Main.class, "field");
        Main main = new Main();

        fieldUpdater.compareAndSet(main, 0, 10);
        // 修改成功 field = 10
        logger.info(main.field);

        fieldUpdater.compareAndSet(main, 10, 20);
        // 修改成功 field = 20
        logger.info(main.field);

        fieldUpdater.compareAndSet(main, 10, 30);
        // 修改失败 field = 20
        logger.info(main.field);
    }
```

注意：只能配合 volatile 修饰的字段使用，否则会出现异常

```java
Exception in thread "main" java.lang.IllegalArgumentException: Must be volatile type
```

## 原子累加器

JDK1.8时，`java.util.concurrent.atomic`包中提供了一个新的原子类：`LongAdder`。

原子类型累加器是**JDK1.8引进的并发新技术**，它可以看做`AtomicLong`和`AtomicDouble`的部分加强类型。相较于`AtomicLong`，`LongAdder`有更加优秀的性能。

原子累加器类：

- LongAdder
- DoubleAdder
- LongAccumulator
- DoubleAccumulator

LongAdder 和 LongAccumulator 区别：

相同点：

- LongAddr 与 LongAccumulator 类都是使用非阻塞算法 CAS 实现的
- LongAddr 类是 LongAccumulator 类的一个特例，只是 LongAccumulator 提供了更强大的功能，可以自定义累加规则，当accumulatorFunction 为 null 时就等价于 LongAddr

不同点：

- 调用 casBase 时，LongAccumulator 使用 function.applyAsLong(b = base, x) 来计算，LongAddr 使用 casBase(b = base, b + x)
- LongAccumulator 类功能更加强大，构造方法参数中
  - accumulatorFunction 是一个双目运算器接口，可以指定累加规则，比如累加或者相乘，其根据输入的两个参数返回一个计算值，LongAdder 内置累加规则
  - identity 则是 LongAccumulator 累加器的初始值，LongAccumulator 可以为累加器提供非0的初始值，而 LongAdder 只能提供默认的 0
