# 多线程任务拆分

## ForkJoin

Fork/Join：线程池的实现，体现是分治思想，适用于能够进行任务拆分的 CPU 密集型运算，用于**并行计算**

任务拆分：将一个大任务拆分为算法上相同的小任务，直至不能拆分可以直接求解。跟递归相关的一些计算，如归并排序、斐波那契数列都可以用分治思想进行求解

- Fork/Join 在**分治的基础上加入了多线程**，把每个任务的分解和合并交给不同的线程来完成，提升了运算效率
- ForkJoin 使用 ForkJoinPool 来启动，是一个特殊的线程池，默认会创建与 CPU 核心数大小相同的线程池
- 任务有返回值继承 RecursiveTask，没有返回值继承 RecursiveAction

## 使用

提交给 Fork/Join 线程池的任务需要继承 `RecursiveTask`（有返回值）或 `RecursiveAction`（没有返回值），例如下面定义了一个对 1~n 之间的整数求和的任务

```java
// 1~ n 之间整数的和
class MyTask extends RecursiveTask<Integer> {
    private int n;

    public MyTask(int n) {
        this.n = n;
    }

    @Override
    public String toString() {
        return "MyTask{" + "n=" + n + '}';
    }

    @Override
    protected Integer compute() {
        // 如果 n 已经为 1，可以求得结果了
        if (n == 1) {
            return n;
        }
        // 将任务进行拆分(fork)
        MyTask t1 = new MyTask(n - 1);
        t1.fork();
        // 合并(join)结果
        int result = n + t1.join();
        return result;
    }
}
```

然后提交给 `ForkJoinPool` 来执行

```java
public static void main(String[] args) {
    ForkJoinPool pool = new ForkJoinPool(4);
    System.out.println(pool.invoke(new MyTask(5)));
    //拆分  5 + MyTask(4) --> 4 + MyTask(3) -->
}
```

结果

```java
[ForkJoinPool-1-worker-0] - fork() 2 + {1} 
[ForkJoinPool-1-worker-1] - fork() 5 + {4} 
[ForkJoinPool-1-worker-0] - join() 1 
[ForkJoinPool-1-worker-0] - join() 2 + {1} = 3 
[ForkJoinPool-1-worker-2] - fork() 4 + {3} 
[ForkJoinPool-1-worker-3] - fork() 3 + {2} 
[ForkJoinPool-1-worker-3] - join() 3 + {2} = 6 
[ForkJoinPool-1-worker-2] - join() 4 + {3} = 10 
[ForkJoinPool-1-worker-1] - join() 5 + {4} = 15 
15
```

图示

![An image](/img/java/concurrent/40.png)

## 拆分优化

```java
class AddTask extends RecursiveTask<Integer> {
    int begin;
    int end;
    public AddTask(int begin, int end) {
        this.begin = begin;
        this.end = end;
    }
    
    @Override
    public String toString() {
        return "{" + begin + "," + end + '}';
    }
    
    @Override
    protected Integer compute() {
        // 5, 5
        if (begin == end) {
            return begin;
        }
        // 4, 5  防止多余的拆分  提高效率
        if (end - begin == 1) {
            return end + begin;
        }
        // 1 5
        int mid = (end + begin) / 2; // 3
        AddTask t1 = new AddTask(begin, mid); // 1,3
        t1.fork();
        AddTask t2 = new AddTask(mid + 1, end); // 4,5
        t2.fork();
        int result = t1.join() + t2.join();
        return result;
    }
}
```

然后提交给 ForkJoinPool 来执行

```java
public static void main(String[] args) {
    ForkJoinPool pool = new ForkJoinPool(4);
    System.out.println(pool.invoke(new AddTask3(1, 10)));
}
```

结果

```java
[ForkJoinPool-1-worker-0] - join() 1 + 2 = 3 
[ForkJoinPool-1-worker-3] - join() 4 + 5 = 9 
[ForkJoinPool-1-worker-0] - join() 3 
[ForkJoinPool-1-worker-1] - fork() {1,3} + {4,5} = ? 
[ForkJoinPool-1-worker-2] - fork() {1,2} + {3,3} = ? 
[ForkJoinPool-1-worker-2] - join() {1,2} + {3,3} = 6 
[ForkJoinPool-1-worker-1] - join() {1,3} + {4,5} = 15 
15
```

图示

![An image](/img/java/concurrent/41.png)

ForkJoinPool 实现了**工作窃取算法**来提高 CPU 的利用率：

- 每个线程都维护了一个**双端队列**，用来存储需要执行的任务
- 工作窃取算法允许空闲的线程从其它线程的双端队列中窃取一个任务来执行
- 窃取的必须是**最晚的任务**，避免和队列所属线程发生竞争，但是队列中只有一个任务时还是会发生竞争
