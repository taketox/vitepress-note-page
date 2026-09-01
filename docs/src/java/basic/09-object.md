# Object

## 概述

Object全名java.lang.Object，java.lang包在使用的时候无需显示导入，编译时由编译器自动导入。Object类是类层次结构的根，Java中所有的类从根本上都继承自这个类。

Object类是Java中唯一没有父类的类。其他所有的类，都继承了Object类中的方法（所有的类都隐式的继承自Object，如果你没有显式地给类指定父类时,编译器会给类加一个父类Object,如果你给它指定了父类,编译器就不会多此一举了）。

```java
public native int hashCode()
public boolean equals(Object obj)
protected native Object clone() throws CloneNotSupportedException
public String toString()
public final native Class<?> getClass()
protected void finalize() throws Throwable {}
public final native void notify()
public final native void notifyAll()
public final native void wait(long timeout) throws InterruptedException
public final void wait(long timeout, int nanos) throws InterruptedException
public final void wait() throws InterruptedException
```

## equals()

对于基本类型，== 判断两个值是否相等，基本类型没有 equals() 方法。

对于引用类型，== 判断两个变量是否引用同⼀个对象，⽽ equals() 判断引用的对象是否等价。

```java
Integer x = new Integer(1);
Integer y = new Integer(1);
System.out.println(x.equals(y)); // true
System.out.println(x == y); // false
```

- 检查是否为同⼀个对象的引用，如果是直接返回 true；
- 检查是否是同⼀个类型，如果不是，直接返回 false；
- 将 Object 对象进行转型；
- 判断每个关键域是否相等。

## hashCode()

`hashCode()` 返回哈希值，⽽ `equals()` 是用来判断两个对象是否等价。

等价的两个对象散列值⼀定相同，但是散列值相同的两个对象不⼀定等价，这是因为计算哈希值具有随机性，两个值不同的对象可能计算出相同的哈希值。

**在覆盖 `equals()` 方法时应当总是覆盖 `hashCode()` 方法，保证等价的两个对象哈希值也相等。**

`HashSet` 和 `HashMap` 等集合类使用了 `hashCode()` 方法来计算对象应该存储的位置，因此要将对象添加到这些集合类中，需要让对应的类实现 `hashCode()` 方法。

下⾯的代码中，新建了两个等价的对象，并将它们添加到 `HashSet` 中。我们希望将这两个对象当成⼀样的，只在集合中添加⼀个对象。但是 `EqualExample` 没有实现 `hashCode()` 方法，因此这两个对象的哈希值是不同的，最终导致集合添加了两个**等价**的对象。

```java
EqualExample e1 = new EqualExample(1, 1, 1);
EqualExample e2 = new EqualExample(1, 1, 1);
System.out.println(e1.equals(e2)); // true
HashSet<EqualExample> set = new HashSet<>();
set.add(e1);
set.add(e2);
System.out.println(set.size()); // 2
```

理想的哈希函数应当具有均匀性，即不相等的对象应当均匀分布到所有可能的哈希值上。这就要求了哈希函数要把所有域的值都考虑进来。可以将每个域都当成 R 进制的某⼀位，然后组成⼀个 R 进制的整数。

R ⼀般取 31，因为它是⼀个奇素数，如果是偶数的话，当出现乘法溢出，信息就会丢失，因为与 2 相乘相当于向左移⼀位，最左边的位丢失。并且⼀个数与 31 相乘可以转换成移位和减法： `31*x ==(x<<5)-x` ，编译器会自动进行这个优化。

## toString()

默认返回 @4554617c 这种形式，其中 @ 后⾯的数值为散列码的无符号⼗六进制表示。

## clone()

clone() 是 Object 的 protected 方法，它不是 public，⼀个类不显式去重写 clone()，其它类就不能直接去调用该类实例的 clone() 方法。

```java
public class CloneExample {
    private int a;
    private int b; 
}

CloneExample e1 = new CloneExample();
// 不能直接调用clone(),因为他不是public,需要重写clone()
// CloneExample e2 = e1.clone(); 
```

重写 clone()

```java
public class CloneExample {
    private int a;
    private int b;
    
    @Override
    public CloneExample clone() throws CloneNotSupportedException {
        return (CloneExample)super.clone();
    }
}

CloneExample e1 = new CloneExample();
try {
    CloneExample e2 = e1.clone();
} catch (CloneNotSupportedException e) {
    e.printStackTrace();
}

// 输出
java.lang.CloneNotSupportedException: CloneExample
```

以上抛出了 `CloneNotSupportedException`，这是因为 `CloneExample` 没有实现 `Cloneable` 接⼝。

应该注意的是，clone() 方法并不是 `Cloneable` 接⼝的方法，⽽是 Object 的⼀个 protected 方法。

**Cloneable 接口只是规定，如果⼀个类没有实现 Cloneable 接⼝⼜调用了 clone() 方法**，就会抛出`CloneNotSupportedException`。

```java
public class CloneExample implements Cloneable {
    private int a;
    private int b;
    
    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

**clone()的替代方案：**

使用 clone() 方法来拷贝⼀个对象即复杂⼜有风险，它会抛出异常，并且还需要类型转换。最好不要去使用 clone()，可以使用拷贝构造函数或者拷贝⼯⼚来拷贝⼀个对象。

```java
public class CloneConstructorExample {
    private int[] arr;
    public CloneConstructorExample() {
        arr = new int[10];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = i;
        }
    }
    public CloneConstructorExample(CloneConstructorExample original) {
        arr = new int[original.arr.length];
        for (int i = 0; i < original.arr.length; i++) {
            arr[i] = original.arr[i];
        }
    }
    public void set(int index, int value) {
        arr[index] = value;
    }
    public int get(int index) {
        return arr[index];
    }
}

CloneConstructorExample e1 = new CloneConstructorExample();
CloneConstructorExample e2 = new CloneConstructorExample(e1);
e1.set(2, 222);
System.out.println(e2.get(2)); // 2
```

## 浅拷贝

拷贝对象和原始对象的引用类型引用同⼀个对象。

拷贝后，修改拷贝后的对象，会影响拷贝前的对象

```java
public class ShallowCloneExample implements Cloneable {
    private int[] arr;
        
    public ShallowCloneExample() {
        arr = new int[10];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = i;
        }
    }
        
    public void set(int index, int value) {
    arr[index] = value;
    }
    
    public int get(int index) {
        return arr[index];
    }
        
    @Override
    protected ShallowCloneExample clone() throws CloneNotSupportedException{
        return (ShallowCloneExample) super.clone();
    }
}

ShallowCloneExample e1 = new ShallowCloneExample();
ShallowCloneExample e2 = null;
try {
    e2 = e1.clone();
} catch (CloneNotSupportedException e) {
    e.printStackTrace();
}
e1.set(2, 222);
System.out.println(e2.get(2)); // 222
```

## 深拷贝

拷贝对象和原始对象的引用类型引用不同对象。

拷贝后，修改拷贝后的对象，不影响之前的对象

```java
public class DeepCloneExample implements Cloneable {
    private int[] arr;
    
    public DeepCloneExample() {
        arr = new int[10];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = i;
        }
    }
    
    public void set(int index, int value) {
        arr[index] = value;
    }
    
    public int get(int index) {
        return arr[index];
    }
    
    @Override
    protected DeepCloneExample clone() throws CloneNotSupportedException {
        DeepCloneExample result = (DeepCloneExample) super.clone();
        result.arr = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            result.arr[i] = arr[i];
        }
        return result;
    }
}

DeepCloneExample e1 = new DeepCloneExample();
DeepCloneExample e2 = null;
try {
    e2 = e1.clone();
} catch (CloneNotSupportedException e) {
    e.printStackTrace();
}
e1.set(2, 222);
System.out.println(e2.get(2)); // 2
```
