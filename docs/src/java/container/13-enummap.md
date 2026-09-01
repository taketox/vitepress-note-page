# EnumMap

## 概述

`EnumMap`是一个用于存储`key`为枚举类型的`map`，底层使用数组实现（`K`，`V`双数组）。下面是其继承结构：

```java
public class EnumMap<K extends Enum<K>, V> extends AbstractMap<K, V>
    implements java.io.Serializable, Cloneable
```

从上面的继承结构上可以看出`EnumMap`的`key`必须是一个枚举类型，而`value`没有限制。

## 源码分析

### 属性

```java
/**
 * K的类型
 */
private final Class<K> keyType;

/**
 * 保存K值的数组，根据枚举类型来初始化，初始完成后不会改变，删除某个key时只删除对应的value，key值对应的数组元素不变
 */
private transient K[] keyUniverse;

/**
 * 保存V值的数组，与保存K值的数组是一一对应的，可以通过枚举值的索引即ordinal属性来访问，该属性从0开始
 */
private transient Object[] vals;

/**
 * Map的元素个数
 */
private transient int size = 0;

/**
 * 表示值为null的value
 */
private static final Object NULL = new Object() {
    public int hashCode() {
        return 0;
    }

    public String toString() {
        return "java.util.EnumMap.NULL";
    }
};
```

要求`K`必须扩展自`Enum`，即必须是枚举类型，参考`EnumMap`的定义。

与其他类型`map`不同的是`EnumMap`底层使用双数组来存储`key`与`value`，`key`数组会在构造函数中根据`keyType`进行初始化，下面我们会看到。当`EnmumMap`的`value`为`null`时会特殊处理为一个`Object`对象。

### 构造方法

```java
public EnumMap(Class<K> keyType) {
    this.keyType = keyType;
    //根据枚举类型获取所有的枚举值
    keyUniverse = getKeyUniverse(keyType);
    //创建一个跟枚举值数组长度一样的value数组
    vals = new Object[keyUniverse.length];
}
 
public EnumMap(EnumMap<K, ? extends V> m) {
    //直接赋值
    keyType = m.keyType;
    keyUniverse = m.keyUniverse;
    vals = m.vals.clone();
    size = m.size;
}
 
public EnumMap(Map<K, ? extends V> m) {
    if (m instanceof EnumMap) {
        //直接赋值
        EnumMap<K, ? extends V> em = (EnumMap<K, ? extends V>) m;
        keyType = em.keyType;
        keyUniverse = em.keyUniverse;
        vals = em.vals.clone();
        size = em.size;
    } else {
        if (m.isEmpty())
            throw new IllegalArgumentException("Specified map is empty");
        //获取key值的类型    
        keyType = m.keySet().iterator().next().getDeclaringClass();
        //根据枚举类型获取所有的枚举值
        keyUniverse = getKeyUniverse(keyType);
        vals = new Object[keyUniverse.length];
        putAll(m);
    }
}
 
//返回某个枚举类的所有枚举值，相当于调用对应枚举类的values方法
private static <K extends Enum<K>> K[] getKeyUniverse(Class<K> keyType) {
    return SharedSecrets.getJavaLangAccess()
                 .getEnumConstantsShared(keyType);
}
```

### put方法

```java
public V put(K key, V value) {
    //检查key的类型是否指定的枚举类型keyType
    typeCheck(key);
    //获取枚举值的索引
    int index = key.ordinal();
    //获取该索引对应的V
    Object oldValue = vals[index];
    //赋值
    vals[index] = maskNull(value);
    if (oldValue == null) //等于null，说明没有这个key值，size加1
        size++;
    return unmaskNull(oldValue); //返回原来的值
}
 
private void typeCheck(K key) {
    Class<?> keyClass = key.getClass();
    if (keyClass != keyType && keyClass.getSuperclass() != keyType)
        throw new ClassCastException(keyClass + " != " + keyType);
}
 
private Object maskNull(Object value) {
    return (value == null ? NULL : value);
}
 
@SuppressWarnings("unchecked")
private V unmaskNull(Object value) {
    return (V)(value == NULL ? null : value);
}
```

`EnumMap`存储键值对时并不会根据`key`获取对应的哈希值，`enum`本身已经提供了一个`ordinal()`方法，该方法会返回具体枚举元素在枚举类中的位置（从`0`开始），因此一个枚举元素从创建就已经有了一个唯一索引与其对应，这样就不存在哈希冲突的问题了。

如果添加的`value`为`null`会通过`maskNull`方法特殊处理，存储一个`Object`对象。

如果值覆盖的话，`put`方法会返回旧的`value`值，并特殊处理`value`为`null`的情况。

`EnmuMap`添加键值对并没有扩容操作，因为一个枚举类型到底有多少元素在代码运行阶段是确定的，在构造函数中已经对`key`数组进行了初始化与赋值，`value`数组的大小也已经被确定。还有一个需要注意的问题，在上面的`put`方法中只对`value`进行了处理，并没有处理`key`，原因就是`key`数组在构造函数中已经被赋值了。

### putAll方法

```java
public void putAll(Map<? extends K, ? extends V> m) {
    if (m instanceof EnumMap) {
        //如果是EnumMap
        EnumMap<?, ?> em = (EnumMap<?, ?>)m;
        if (em.keyType != keyType) {
            if (em.isEmpty())
                return;
            //key类型不一致，抛出异常    
            throw new ClassCastException(em.keyType + " != " + keyType);
        }
        //遍历所有的key值
        for (int i = 0; i < keyUniverse.length; i++) {
            //获取m中对应key的value
            Object emValue = em.vals[i];
            if (emValue != null) {
                if (vals[i] == null) //等于null，说明没有这个key值，size加1
                    size++;
                vals[i] = emValue; //赋值
            }
        }
    } else {
        //m是普通的HashMap，遍历键值对，调用put方法
        super.putAll(m);
    }
}
```

### get方法

```java
public V get(Object key) {
    //如果是有效的key值，则获取对应key值的索引对应的value
    return (isValidKey(key) ?
            unmaskNull(vals[((Enum<?>)key).ordinal()]) : null);
}

//是否有效key值
private boolean isValidKey(Object key) {
    if (key == null) //key不能为null
        return false;
    //判断key值的类型是否是keyType
    Class<?> keyClass = key.getClass();
    return keyClass == keyType || keyClass.getSuperclass() == keyType;
}
```

### remove方法

```java
public V remove(Object key) {
    if (!isValidKey(key)) //不是有效key，返回null
        return null;
    //获取key值索引对应的value    
    int index = ((Enum<?>)key).ordinal();
    Object oldValue = vals[index];
    vals[index] = null; //置为null
    if (oldValue != null) //原来不为null，说明原来有这个key，则将size减1
        size--;
    return unmaskNull(oldValue);
}
```

### clear方法

```java
public void clear() {
    //将vals置为null，注意保存key值的数组keyUniverse没有变更
    Arrays.fill(vals, null);
    size = 0;
}
```

## 案例

```java
public class DataBaseInfo {
    // 1. 定义数据库类型枚举
    public enum DataBaseType {
        MYSQL, ORACLE, DB2, SQLSERVER
    }

    // 2. 某类中定义的获取数据库URL的方法以及EnumMap的声明
    private EnumMap<DataBaseType, String> urls = new EnumMap<>(DataBaseType.class);

    // 某类构造方法
    public DataBaseInfo() {
        urls.put(DataBaseType.DB2, "jdbc:db2://localhost:5000/sample");
        urls.put(DataBaseType.MYSQL, "jdbc:mysql://localhost/mydb");
        urls.put(DataBaseType.ORACLE, "jdbc:oracle:thin:@localhost:1521:sample");
        urls.put(DataBaseType.SQLSERVER, "jdbc:microsoft:sqlserver://sql:1433;Database=mydb");
    }

    /**
     * 根据不同的数据库类型，返回对应的URL
     *
     * @param type DataBaseType 枚举类新实例
     * @return
     */
    public String getURL(DataBaseType type) {
        return this.urls.get(type);
    }

    public static void main(String[] args) {
        DataBaseInfo dataBaseInfo = new DataBaseInfo();
        System.out.println(dataBaseInfo.getURL(DataBaseType.MYSQL));
    }
}
```

在实际使用中，`EnumMap`对象`urls`往往是由外部负责整个应用初始化的代码来填充的。这里为了演示方便，类自己做了内容填充。

从本例中可以看出，使用`EnumMap`可以很方便地为枚举类型在不同的环境中绑定到不同的值上。本例子中`getURL`绑定到`URL`上，在其他的代码中可能又被绑定到数据库驱动上去。
