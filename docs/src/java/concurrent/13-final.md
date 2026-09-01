# 不可变设计

## 日期转换的问题

由于 `SimpleDateFormat` 不是线程安全的，有很大几率出现 `java.lang.NumberFormatException` 或者出现不正确的日期解析结果。

```java
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                try {
                    log.debug("{}", sdf.parse("1951-04-21"));
                } catch (Exception e) {
                    log.error("{}", e);
                }
            }).start();
        }
```

如果一个对象在不能够修改其内部状态（属性），那么它就是线程安全的，因为不存在并发修改啊！这样的对象在 Java 中有很多，例如在 Java 8 后，提供了一个新的日期格式化类`DateTimeFormatter`：

```java
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                LocalDate date = dtf.parse("2018-10-01", LocalDate::from);
                log.debug("{}", date);
            }).start();
        }
```

## 不可变设计

不可变：如果一个对象不能够修改其内部状态（属性），那么就是不可变对象

不可变对象线程安全的，不存在并发修改和可见性问题，是另一种避免竞争的方式

String 类也是不可变的，该类和类中所有属性都是 final 的

- 类用 final 修饰保证了该类中的方法不能被覆盖，防止子类无意间破坏不可变性

- 无写入方法（set）确保外部不能对内部属性进行修改

- 属性用 final 修饰保证了该属性是只读的，不能修改

  ```java
  public final class String
      implements java.io.Serializable, Comparable<String>, CharSequence {
      /** The value is used for character storage. */
      private final char value[];
      //....
  }
  ```

- 更改 String 类数据时，会构造新字符串对象，生成新的 char[] value，通过**创建副本对象来避免共享的方式称之为保护性拷贝**

## final的原理

```java
public class TestFinal {
    final int a = 20;
}
```

字节码：

```java
0: aload_0
1: invokespecial #1 // Method java/lang/Object."<init>":()V
4: aload_0
5: bipush 20        // 将值直接放入栈中
7: putfield #2      // Field a:I
<-- 写屏障
10: return
```

final 变量的赋值通过 `putfield` 指令来完成，在这条指令之后也会加入写屏障，保证在其它线程读到它的值时不会出现为 0 的情况

其他线程访问 final 修饰的变量

- **复制一份放入栈中**直接访问，效率高
- 大于 short 最大值会将其复制到类的常量池，访问时从常量池获取

## State

无状态：成员变量保存的数据也可以称为状态信息，无状态就是没有成员变量

Servlet 为了保证其线程安全，一般不为 Servlet 设置成员变量，这种没有任何成员变量的类是线程安全的
