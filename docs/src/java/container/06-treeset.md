# TreeSet

## 简介

`TreeSet`底层是采用`TreeMap`实现的一种`Set`，所以它是有序的，同样也是非线程安全的。

## 源码分析

```java
// TreeSet实现了NavigableSet接口，所以它是有序的
public class TreeSet<E> 
        extends AbstractSet<E>
        implements NavigableSet<E>, Cloneable, java.io.Serializable {

    // 序列化id
    private static final long serialVersionUID = -2479143000061671589L;
    
    // 元素存储在NavigableMap中
    // 注意它不一定就是TreeMap
    private transient NavigableMap<E,Object> m;

    // 虚拟元素, 用来作为value存储在map中
    private static final Object PRESENT = new Object();

    // 直接使用传进来的NavigableMap存储元素
    // 这里不是深拷贝,如果外面的map有增删元素也会反映到这里
    // 而且, 这个方法不是public的, 说明只能给同包使用
    TreeSet(NavigableMap<E,Object> m) {
        this.m = m;
    }
    
    // 默认 使用TreeMap初始化
    public TreeSet() {
        this(new TreeMap<E,Object>());
    }

    // 使用带comparator的TreeMap初始化
    public TreeSet(Comparator<? super E> comparator) {
        this(new TreeMap<>(comparator));
    }

    // 将集合c中的所有元素添加的TreeSet中
    public TreeSet(Collection<? extends E> c) {
        this();
        addAll(c);
    }

    // 将SortedSet中的所有元素添加到TreeSet中
    public TreeSet(SortedSet<E> s) {
        this(s.comparator());
        addAll(s);
    }

    // 迭代器
    public Iterator<E> iterator() {
        return m.navigableKeySet().iterator();
    }

    // 逆序迭代器
    public Iterator<E> descendingIterator() {
        return m.descendingKeySet().iterator();
    }

    // 以逆序返回一个新的TreeSet
    public NavigableSet<E> descendingSet() {
        return new TreeSet<>(m.descendingMap());
    }

    // 元素个数
    public int size() {
        return m.size();
    }

    // 判断是否为空
    public boolean isEmpty() {
        return m.isEmpty();
    }

    // 判断是否包含某元素
    public boolean contains(Object o) {
        return m.containsKey(o);
    }

    // 添加元素, 调用map的put()方法, value为PRESENT
    public boolean add(E e) {
        return m.put(e, PRESENT)==null;
    }
    
    // 删除元素
    public boolean remove(Object o) {
        return m.remove(o)==PRESENT;
    }

    // 清空所有元素
    public void clear() {
        m.clear();
    }

    // 添加集合c中的所有元素
    public  boolean addAll(Collection<? extends E> c) {
        // 满足一定条件时直接调用TreeMap的addAllForTreeSet()方法添加元素
        if (m.size()==0 && c.size() > 0 &&
            c instanceof SortedSet &&
            m instanceof TreeMap) {
            SortedSet<? extends E> set = (SortedSet<? extends E>) c;
            TreeMap<E,Object> map = (TreeMap<E, Object>) m;
            Comparator<?> cc = set.comparator();
            Comparator<? super E> mc = map.comparator();
            if (cc==mc || (cc != null && cc.equals(mc))) {
                map.addAllForTreeSet(set, PRESENT);
                return true;
            }
        }
        // 不满足上述条件, 调用父类的addAll()通过遍历的方式一个一个地添加元素
        return super.addAll(c);
    }

    // 子set（NavigableSet中的方法）
    public NavigableSet<E> subSet(E fromElement, boolean fromInclusive,
                                  E toElement,   boolean toInclusive) {
        return new TreeSet<>(m.subMap(fromElement, fromInclusive,
                                       toElement,   toInclusive));
    }
    
    // 头set（NavigableSet中的方法）
    public NavigableSet<E> headSet(E toElement, boolean inclusive) {
        return new TreeSet<>(m.headMap(toElement, inclusive));
    }

    // 尾set（NavigableSet中的方法）
    public NavigableSet<E> tailSet(E fromElement, boolean inclusive) {
        return new TreeSet<>(m.tailMap(fromElement, inclusive));
    }

    // 子set（SortedSet接口中的方法）
    public SortedSet<E> subSet(E fromElement, E toElement) {
        return subSet(fromElement, true, toElement, false);
    }

    // 头set（SortedSet接口中的方法）
    public SortedSet<E> headSet(E toElement) {
        return headSet(toElement, false);
    }
    
    // 尾set（SortedSet接口中的方法）
    public SortedSet<E> tailSet(E fromElement) {
        return tailSet(fromElement, true);
    }

    // 比较器
    public Comparator<? super E> comparator() {
        return m.comparator();
    }

    // 返回最小的元素
    public E first() {
        return m.firstKey();
    }
    
    // 返回最大的元素
    public E last() {
        return m.lastKey();
    }

    // 返回小于e的最大的元素
    public E lower(E e) {
        return m.lowerKey(e);
    }

    // 返回小于等于e的最大的元素
    public E floor(E e) {
        return m.floorKey(e);
    }
    
    // 返回大于等于e的最小的元素
    public E ceiling(E e) {
        return m.ceilingKey(e);
    }
    
    // 返回大于e的最小的元素
    public E higher(E e) {
        return m.higherKey(e);
    }
    
    // 弹出最小的元素
    public E pollFirst() {
        Map.Entry<E,?> e = m.pollFirstEntry();
        return (e == null) ? null : e.getKey();
    }

    public E pollLast() {
        Map.Entry<E,?> e = m.pollLastEntry();
        return (e == null) ? null : e.getKey();
    }

    // 克隆方法
    @SuppressWarnings("unchecked")
    public Object clone() {
        TreeSet<E> clone;
        try {
            clone = (TreeSet<E>) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new InternalError(e);
        }

        clone.m = new TreeMap<>(m);
        return clone;
    }

    // 序列化写出方法
    private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException {
        // Write out any hidden stuff
        s.defaultWriteObject();

        // Write out Comparator
        s.writeObject(m.comparator());

        // Write out size
        s.writeInt(m.size());

        // Write out all elements in the proper order.
        for (E e : m.keySet())
            s.writeObject(e);
    }

    // 序列化写入方法
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        // Read in any hidden stuff
        s.defaultReadObject();

        // Read in Comparator
        @SuppressWarnings("unchecked")
            Comparator<? super E> c = (Comparator<? super E>) s.readObject();

        // Create backing TreeMap
        TreeMap<E,Object> tm = new TreeMap<>(c);
        m = tm;

        // Read in size
        int size = s.readInt();

        tm.readTreeSet(size, s, PRESENT);
    }

    // 可分割的迭代器
    public Spliterator<E> spliterator() {
        return TreeMap.keySpliteratorFor(m);
    }
}
```

源码比较简单，基本都是调用`map`相应的方法。

排序方式：

1. 自然排序(使用默认构造函数)
2. 比较器排序

## 案例

```java
public class TreeSetDemo {
    public static void main(String[] args) {
        //指定比较器，倒置元素顺序
        TreeSet<String> treeSet = new TreeSet<>(Comparator.reverseOrder());
        for (int i = 0; i < 5; i++) {
            treeSet.add("item" + i);
        }
        for (int i = 0; i < 5; i++) {
            treeSet.add("item" + i);
        }

        treeSet.forEach(item -> {
            System.err.println(item);
        });
    }
}
```

输出结果

```text
item4
item3
item2
item1
item0
```

## 总结

1. `TreeSet`底层使用`NavigableMap`存储元素；
2. `TreeSet`是有序的；
3. `TreeSet`是非线程安全的；
4. `TreeSet`实现了`NavigableSet`接口，而`NavigableSet`继承自`SortedSet`接口；
5. `TreeSet`实现了`SortedSet`接口；

## 拓展

1. `TreeSet`和`LinkedHashSet`都是有序的，那它们有何不同？

`LinkedHashSet`并没有实现`SortedSet`接口，它的有序性主要依赖于`LinkedHashMap`的有序性，所以它的有序性是指按照插入顺序保证的有序性；而`TreeSet`实现了`SortedSet`接口，它的有序性主要依赖于`NavigableMap`的有序性，而`NavigableMap`又继承自`SortedMap`，这个接口的有序性是指按照`key`的自然排序保证的有序性，而`key`的自然排序又有两种实现方式，一种是`key`实现`Comparable`接口，一种是构造方法传入`Comparator`比较器。

1. `TreeSet`里面真的是使用`TreeMap`来存储元素的吗？

通过源码分析可以知道`TreeSet`里面实际上是使用的`NavigableMap`来存储元素，虽然大部分时候这个`map`确实是`TreeMap`，但不是所有时候都是`TreeMap`。因为有一个构造方法是`TreeSet(NavigableMap<E,Object> m)`，而且这是一个非`public`方法，通过调用关系我们可以发现这个构造方法都是在自己类中使用的，比如下面这个：

```java
public NavigableSet<E> tailSet(E fromElement, boolean inclusive) {
    return new TreeSet<>(m.tailMap(fromElement, inclusive));
}
```

而这个`m`我们姑且认为它是`TreeMap`，也就是调用`TreeMap`的`tailMap()`方法：

```java
public NavigableMap<K,V> tailMap(K fromKey, boolean inclusive) {
    return new AscendingSubMap<>(this,
                                 false, fromKey, inclusive,
                                 true,  null,    true);
}
```

可以看到，返回的是`AscendingSubMap`对象，这个类的继承链是怎么样的呢？

![An image](/img/java/container/08.png)

可以看到，这个类并没有继承`TreeMap`，不过通过源码分析也可以看出来这个类是组合了`TreeMap`，也算和`TreeMap`有点关系，只是不是继承关系。

所以，`TreeSet`的底层不完全是使用`TreeMap`来实现的，更准确地说，应该是`NavigableMap`。
