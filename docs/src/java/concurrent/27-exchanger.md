# Exchanger

## 基本使用

Exchanger：交换器，是一个用于线程间协作的工具类，用于进行线程间的数据交换

工作流程：两个线程通过 exchange 方法交换数据，如果第一个线程先执行 exchange() 方法，它会一直等待第二个线程也执行 exchange 方法，当两个线程都到达同步点时，这两个线程就可以交换数据

常用方法：

- `public Exchanger()`：创建一个新的交换器
- `public V exchange(V x)`：等待另一个线程到达此交换点
- `public V exchange(V x, long timeout, TimeUnit unit)`：等待一定的时间

```java
public class ExchangerDemo {
    public static void main(String[] args) {
        // 创建交换对象（信使）
        Exchanger<String> exchanger = new Exchanger<>();
        new ThreadA(exchanger).start();
        new ThreadB(exchanger).start();
    } 
}
class ThreadA extends Thread{
    private Exchanger<String> exchanger();
    
    public ThreadA(Exchanger<String> exchanger){
        this.exchanger = exchanger;
    }
    
    @Override
    public void run() {
        try{
            sout("线程A，做好了礼物A，等待线程B送来的礼物B");
            //如果等待了5s还没有交换就死亡（抛出异常）！
            String s = exchanger.exchange("礼物A",5,TimeUnit.SECONDS);
            sout("线程A收到线程B的礼物：" + s);
        } catch (Exception e) {
            System.out.println("线程A等待了5s，没有收到礼物,最终就执行结束了!");
        }
    }
}
class ThreadB extends Thread{
    private Exchanger<String> exchanger;
    
    public ThreadB(Exchanger<String> exchanger) {
        this.exchanger = exchanger;
    }
    
    @Override
    public void run() {
        try {
            sout("线程B,做好了礼物B,等待线程A送来的礼物A.....");
            // 开始交换礼物。参数是送给其他线程的礼物!
            sout("线程B收到线程A的礼物：" + exchanger.exchange("礼物B"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
