# HashSet

## 简介

`HashSet`是`Set`的一种实现方式，底层主要使用`HashMap`来确保元素不重复，允许存放`null`值，线程不安全。

## 案例

### 案例一

```java
import java.util.HashSet;
import java.util.Set;

public class HashSetTest1 {
    public static void main(String[] args) {
        // set是一个接口，不能实例化，用它的一个子类HashSet创建对象
        Set<String> set = new HashSet<>();

        // 添加元素到集合
        set.add("hello");
        set.add("world");
        set.add("java");
        set.add("bigdata");
        set.add("hadoop");
        set.add("hello");
        set.add("hello");
        set.add("java");
        set.add("spark");
        set.add("flink");
        set.add("world");
        set.add("hadoop");
        // 使用增强for循环遍历
        for(String s : set){
            System.out.println(s);
        }
    }
}
```

执行结果如下：

```text
flink
world
java
bigdata
spark
hello
hadoop
```

`set`集合中添加相同的元素，最终遍历出来的元素是没有相同的。

### 案例二

```java
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 存储自定义对象并遍历
 */
public class HashSetTest2 {
    public static void main(String[] args) {
        // 创建集合对象
        Set<Student> hashSet = new HashSet<>();

        // 创建学生对象
        Student s1 = new Student("xiaowang", 18);
        Student s2 = new Student("xiaowang", 18);
        Student s3 = new Student("xiaoli", 19);
        Student s4 = new Student("xiaoliu", 20);

        hashSet.add(s1);
        hashSet.add(s2);
        hashSet.add(s3);
        hashSet.add(s4);

        for (Student s : hashSet) {
            System.out.println(s);
        }
    }
}

@Data
@AllArgsConstructor
class Student {
    private String name;
    private Integer age;
}
```

执行结果如下：

```text
Student{name='xiaowang', age=18}
Student{name='xiaoli', age=19}
Student{name='xiaoliu', age=20}
```

注意：

在遍历自定义对象的时候，第一步需要先创建一个学生类，如果在遍历的时候，最后的结果没有去重，说明学生类中没有重写`equals()`和`hashCode()`，只需在学生类中，利用快捷键添加`equals()`和`hashCode()`即可。

## 源码分析

### 属性

```java
// 内部使用HashMap
private transient HashMap<E,Object> map;

// 虚拟对象，用来作为value放到map中
private static final Object PRESENT = new Object();
```

### 构造方法

```java
public HashSet() {
    map = new HashMap<>();
}

public HashSet(Collection<? extends E> c) {
    map = new HashMap<>(Math.max((int) (c.size()/.75f) + 1, 16));
    addAll(c);
}

public HashSet(int initialCapacity, float loadFactor) {
    map = new HashMap<>(initialCapacity, loadFactor);
}

public HashSet(int initialCapacity) {
    map = new HashMap<>(initialCapacity);
}

// 非public，主要是给LinkedHashSet使用的
HashSet(int initialCapacity, float loadFactor, boolean dummy) {
    map = new LinkedHashMap<>(initialCapacity, loadFactor);
}
```

构造方法都是调用`HashMap`对应的构造方法。

最后一个构造方法有点特殊，它不是`public`的，意味着它只能被同一个包或者子类调用，这是`LinkedHashSet`专属的方法。

### 添加元素

直接调用`HashMap`的`put()`方法，把元素本身作为`key`，把`PRESENT`作为`value`，也就是这个`map`中所有的`value`都是一样的。

```java
// 返回值：当set中没有包含add的元素时返回真
public boolean add(E e) {
    return map.put(e, PRESENT) == null;
}
```

`HashMap`的`put()`方法直接调用`putVal`方法：

```java
// 返回值：如果插入位置没有元素返回null，否则返回上一个元素
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    //...
}
```

也就是说，实际上无论`HashSet`中是否已经存在了某元素，`HashSet`都会直接插入，只是会在`add()`方法的返回值处告诉我们插入前是否存在相同元素。

### 删除元素

直接调用`HashMap`的`remove()`方法，注意`map`的`remove`返回是删除元素的`value`，而`Set`的`remov`返回的是`boolean`类型。

这里要检查一下，如果是`null`的话说明没有该元素，如果不是`null`肯定等于`PRESENT`。

```java
public boolean remove(Object o) {
    return map.remove(o) == PRESENT;
}
```

### 查询元素

`Set`没有`get()`方法哦，因为`get`似乎没有意义，不像`List`那样可以按`index`获取元素。

这里只要一个检查元素是否存在的方法`contains()`，直接调用`map`的`containsKey()`方法。

```java
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

### 遍历元素

直接调用`map`的`keySet`的迭代器。

```java
public Iterator<E> iterator() {
    return map.keySet().iterator();
}
```

### 全部源码

```java
package java.util;

import java.io.InvalidObjectException;
import sun.misc.SharedSecrets;

public class HashSet<E>
    extends AbstractSet<E>
    implements Set<E>, Cloneable, java.io.Serializable {

    static final long serialVersionUID = -5024744406713321676L;

    // 内部元素存储在HashMap中
    private transient HashMap<E,Object> map;

    // 虚拟元素，用来存到map元素的value中的，没有实际意义
    private static final Object PRESENT = new Object();

    // 空构造方法
    public HashSet() {
        map = new HashMap<>();
    }

    // 把另一个集合的元素全都添加到当前Set中
    // 注意，这里初始化map的时候是计算了它的初始容量的
    public HashSet(Collection<? extends E> c) {
        map = new HashMap<>(Math.max((int) (c.size() / .75f) + 1, 16));
        addAll(c);
    }

    // 指定初始容量和装载因子
    public HashSet(int initialCapacity, float loadFactor) {
        map = new HashMap<>(initialCapacity, loadFactor);
    }

    // 只指定初始容量
    public HashSet(int initialCapacity) {
        map = new HashMap<>(initialCapacity);
    }

    // LinkedHashSet专用的方法
    // dummy是没有实际意义的, 只是为了跟上上面那个操持方法签名不同而已
    HashSet(int initialCapacity, float loadFactor, boolean dummy) {
        map = new LinkedHashMap<>(initialCapacity, loadFactor);
    }
    
    // 迭代器
    public Iterator<E> iterator() {
        return map.keySet().iterator();
    }

    // 元素个数
    public int size() {
        return map.size();
    }

    // 检查是否为空
    public boolean isEmpty() {
        return map.isEmpty();
    }

    // 检查是否包含某个元素
    public boolean contains(Object o) {
        return map.containsKey(o);
    }
    
    // 添加元素
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }

    // 删除元素
    public boolean remove(Object o) {
        return map.remove(o) == PRESENT;
    }
    
    // 清空所有元素
    public void clear() {
        map.clear();
    }

    // 克隆方法
    @SuppressWarnings("unchecked")
    public Object clone() {
        try {
            HashSet<E> newSet = (HashSet<E>) super.clone();
            newSet.map = (HashMap<E, Object>) map.clone();
            return newSet;
        } catch (CloneNotSupportedException e) {
            throw new InternalError(e);
        }
    }

    // 序列化写出方法
    private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException {
        // 写出非static非transient属性
        s.defaultWriteObject();

        // 写出map的容量和装载因子
        s.writeInt(map.capacity());
        s.writeFloat(map.loadFactor());

        // 写出元素个数
        s.writeInt(map.size());

        // 遍历写出所有元素
        for (E e : map.keySet())
            s.writeObject(e);
    }

    // 序列化读入方法
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        // 读入非static非transient属性
        s.defaultReadObject();

        // 读入容量, 并检查不能小于0
        int capacity = s.readInt();
        if (capacity < 0) {
            throw new InvalidObjectException("Illegal capacity: " + capacity);
        }

        // 读入装载因子, 并检查不能小于等于0或者是NaN(Not a Number)
        // java.lang.Float.NaN = 0.0f / 0.0f;
        float loadFactor = s.readFloat();
        if (loadFactor <= 0 || Float.isNaN(loadFactor)) {
            throw new InvalidObjectException("Illegal load factor: " + loadFactor);
        }

        // 读入元素个数并检查不能小于0
        int size = s.readInt();
        if (size < 0) {
            throw new InvalidObjectException("Illegal size: " + size);
        }
        // 根据元素个数重新设置容量
        // 这是为了保证map有足够的容量容纳所有元素, 防止无意义的扩容
        capacity = (int) Math.min(size * Math.min(1 / loadFactor, 4.0f),
                HashMap.MAXIMUM_CAPACITY);

        // 再次检查某些东西, 不重要的代码忽视掉
        SharedSecrets.getJavaOISAccess()
                     .checkArray(s, Map.Entry[].class, HashMap.tableSizeFor(capacity));

        // 创建map, 检查是不是LinkedHashSet类型
        map = (((HashSet<?>)this) instanceof LinkedHashSet 
                ? new LinkedHashMap<E,Object>(capacity, loadFactor) 
                : new HashMap<E,Object>(capacity, loadFactor));

        // 读入所有元素, 并放入map中
        for (int i=0; i<size; i++) {
            @SuppressWarnings("unchecked")
            E e = (E) s.readObject();
            map.put(e, PRESENT);
        }
    }

    // 可分割的迭代器, 主要用于多线程并行迭代处理时使用
    public Spliterator<E> spliterator() {
        return new HashMap.KeySpliterator<E,Object>(map, 0, -1, 0, 0);
    }
}
```

## 总结

1. `HashSet`内部使用`HashMap`的`key`存储元素，以此来保证元素不重复；
2. `HashSet`是无序的，因为`HashMap`的`key`是无序的；
3. `HashSet`中允许有一个`null`元素，因为`HashMap`允许`key`为`null`；
4. `HashSet`是非线程安全的；
5. `HashSet`是没有`get()`方法的；

## 拓展

### 预估初始容量

> 阿里手册上有说，使用`java`中的集合时要自己指定集合的大小，通过这篇源码的分析，你知道初始化`HashMap`的时候初始容量怎么传吗？

我们发现有下面这个构造方法，很清楚明白地告诉了我们怎么指定容量。

假如，我们预估`HashMap`要存储`n`个元素，那么，它的容量就应该指定为`((n/0.75f) + 1)`，如果这个值小于`16`，那就直接使用`16`得了。

初始化时指定容量是为了减少扩容的次数，提高效率。

```java
public HashSet(Collection<? extends E> c) {
    map = new HashMap<>(Math.max((int) (c.size() / .75f) + 1, 16));
    addAll(c);
}
```

### 为什么HashSet里value不是null?

`HashSet`底层的`value`为什么不是一个`null`，效率不是更高，还省得去创建对象了。

`HashSet`的添加元素`add`方法调用的是`HashMap`的`put`方法，代码如下：

```java
public V put(K key, V value) {
    // 调用hash(key)计算出key的hash值
    return putVal(hash(key), key, value, false, true);
}
```

`putVal`成功则返回`null`，失败则返回该`key`的`value`。如果`HashSet`底层`value`是`null`，那么`HashSet`的`add`方法返回都是`null`，无法区分添加是否成功。

> HashSet的remove也是一样原理。
