# EnumSet

## 概述

`EnumSet`是一个抽象类，不能直接使用，该类有两个子类，`RegularEnumSet` 和 `JumboEnumSet`。即枚举值的个数小于等于`64`时使用`RegularEnumSet`，大于`64`时使用`JumboEnumSet`。

这两个子类都是非`public`的，只能包内访问。

当`EnumSet`需要进行一个操作时首先调用`noneOf`这个方法，获得一个`RegularEnumSet`或者`JumboEnumSet`对象，随后在执行一些操作。

## 源码分析

### 属性

```java
/**
 * 枚举的类型
 */
final Class<E> elementType;

/**
 * 枚举类E的所有枚举值
 */
final Enum<?>[] universe;
```

`EnumSet`定义了多个静态的工具类方法，其中核心方法如`add`的实现都留给了子类，下面逐一说明想法方法的实现。

### 创建EnumSet

`noneOf`、`allOf`、`of`、`range`这些方法都是用来创建`EnumSet`的。

#### noneOf方法

`noneOf` 返回一个空的 `EnumSet`

```java
//返回一个空的EnumSet
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
    Enum<?>[] universe = getUniverse(elementType);
    if (universe == null)
        throw new ClassCastException(elementType + " not an enum");

    if (universe.length <= 64)
        return new RegularEnumSet<>(elementType, universe);
    else
        return new JumboEnumSet<>(elementType, universe);
}
 
//返回指定枚举类的所有枚举值
private static <E extends Enum<E>> E[] getUniverse(Class<E> elementType) {
    return SharedSecrets.getJavaLangAccess()
                    .getEnumConstantsShared(elementType);
}
```

#### allOf方法

`allOf` 返回一个包含指定枚举类所有枚举值的 `EnumSet`

```java
//返回一个包含了所有枚举值的EnumSet
public static <E extends Enum<E>> EnumSet<E> allOf(Class<E> elementType) {
    EnumSet<E> result = noneOf(elementType);
    //子类实现
    result.addAll();
    return result;
}
```

#### of方法

`of` 方法返回一个包含一个或者多个的指定枚举值的 `EnumSet`

```java
//创建只包含一个指定枚举值的EnumSet，有多个重载版本，枚举值从1个到5个
public static <E extends Enum<E>> EnumSet<E> of(E e) {
    EnumSet<E> result = noneOf(e.getDeclaringClass());
    //子类实现
    result.add(e);
    return result;
}
 
@SafeVarargs
public static <E extends Enum<E>> EnumSet<E> of(E first, E... rest) {
    EnumSet<E> result = noneOf(first.getDeclaringClass());
    result.add(first);
    //rest是不定数量的数组，将其中的元素都添加到Set中
    for (E e : rest)
        result.add(e);
    return result;
}
```

#### range方法

`range` 返回一个包含指定范围的枚举值的 `EnumSet`

```java
//创建包含指定范围内的枚举值的EnumSet
public static <E extends Enum<E>> EnumSet<E> range(E from, E to) {
    if (from.compareTo(to) > 0)
        throw new IllegalArgumentException(from + " > " + to);
    EnumSet<E> result = noneOf(from.getDeclaringClass());
    //子类实现
    result.addRange(from, to);
    return result;
}
```

### 复制指定的EnumSet

#### copyOf方法

`copyOf` 用于复制指定的 `EnumSet`

```java
public static <E extends Enum<E>> EnumSet<E> copyOf(EnumSet<E> s) {
    return s.clone();
}
 
public static <E extends Enum<E>> EnumSet<E> copyOf(Collection<E> c) {
    if (c instanceof EnumSet) {
        //如果是EnumSet
        return ((EnumSet<E>)c).clone();
    } else {
        if (c.isEmpty())
            throw new IllegalArgumentException("Collection is empty");
        //如果不是EnumSet，则遍历其中的元素，逐一添加到EnumSet中
        Iterator<E> i = c.iterator();
        E first = i.next();
        EnumSet<E> result = EnumSet.of(first);
        while (i.hasNext())
            result.add(i.next());
        return result;
    }
}

public EnumSet<E> clone() {
    try {
        //调用Object的clone方法
        return (EnumSet<E>) super.clone();
    } catch(CloneNotSupportedException e) {
        throw new AssertionError(e);
    }
}
```

#### complementOf方法

`complementOf`返回原`EnumSet`中不包含的枚举值。

```java
//返回的EnumSet中包含了所有的枚举值
public static <E extends Enum<E>> EnumSet<E> complementOf(EnumSet<E> s) {
    EnumSet<E> result = copyOf(s);
    //complement会补齐所有s中不包含的枚举值，由子类实现
    result.complement();
    return result;
}
```

## 案例

### 例1

```java
enum Name{
    SHL,
    ABC,
    DEF,
    AVC,
    DNG
}
 
@Test
public void test() throws Exception {

    //返回一个空的EnumSet
    EnumSet<Name> names = EnumSet.noneOf(Name.class);
    System.out.println(names);
    
    //返回一个包含了所有枚举值的EnumSet
    names = EnumSet.allOf(Name.class);
    System.out.println(names);
    
    //返回一个包含了指定枚举值的EnumSet
    names = EnumSet.of(Name.ABC, Name.DEF);
    System.out.println(names);
    
    //返回一个包含了指定范围的枚举值的EnumSet，起始值都包含
    names = EnumSet.range(Name.ABC, Name.AVC);
    System.out.println(names);
}
```

输出如下：

```text
[]
[SHL, ABC, DEF, AVC, DNG]
[ABC, DEF]
[ABC, DEF, AVC]
```

### 例2

```java
@Test
public void test2() throws Exception {

    EnumSet<Name> names = EnumSet.allOf(Name.class);
    System.out.println(names);
    
    EnumSet<Name> names2=EnumSet.copyOf(names);
    System.out.println(names2);
    
    names.remove(Name.SHL);
    names2.remove(Name.DNG);
    System.out.println(names);
    System.out.println(names2);
    
    EnumSet<Name> names3 = EnumSet.complementOf(names);
    System.out.println(names3);
}
```

其输出如下：

```text
[SHL, ABC, DEF, AVC, DNG]
[SHL, ABC, DEF, AVC, DNG]
[ABC, DEF, AVC, DNG]
[SHL, ABC, DEF, AVC]
[SHL]
```
