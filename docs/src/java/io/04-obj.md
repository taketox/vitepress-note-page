# 对象操作

## 序列化

序列化就是将⼀个对象转换成字节序列，方便存储和传输。

序列化不会对静态变量进行序列化，因为序列化只是保存对象的状态，静态变量属于类的状态。

### Serializable

序列化的类需要实现 Serializable 接⼝，它只是⼀个标准，没有任何方法需要实现，但是如果不去实现它的话而进行序列化，会抛出异常。

### transient

transient 关键字可以使⼀些属性不会被序列化。

ArrayList 中存储数据的数组 elementData 是用 transient 修饰的，因为这个数组是动态扩展的，并不是所有的空间都被使用，因此就不需要所有的内容都被序列化。通过重写序列化和反序列化方法，使得可以只序列化数组中有内容的那部分数据。

### serialVersionUID

Serializable接口给需要序列化的类，提供了一个序列版本号。

serialVersionUID该版本号的目的在于验证序列化的对象和对应类是否版本匹配。

```java
private static final long serialVersionUID = 42L;
```

>序列化运行时使用serialVersionUID（版本号）与每个可序列化类相关联，版本号在反序列化过程中用于验证序列化对象的发送者和接收者是否为原对象加载与序列化兼容的类。
>
>如果接收者加载对象的类的serialVersionUID与对应的发送者的类的版本号不同，则反序列化将会导致InvalidClassException。

## 序列化流

### ObjectOutputStream

序列化：把对象以流的方式写入到文件中保存

#### 构造方法

- ObjectOutputStream(Outputstream out)：创建写入指定OutputStream的ObjectOutputStream。

#### 参数

- OutputStream out：字节输出流

#### 特有的成员方法

- void writeObject(object obj)：将指定的对象写入ObjectOutputStream。

#### 使用步骤

1. 创建ObjectOutputStream对象，构造方法中传递字节输出流
2. 使用ObjectOutputStream对象中的方法writeObject，把对象写入到文件中
3. 释放资源

```java
// 创建objectoutputstream.对象，传入字节输出流
Objectoutputstream oos new objectoutputstream(new Fileoutputstream("a.txt"));
// 使用writeobject方法
// Person对象需要实现Serializable标记接口
oos.writeobject(new Person("张三", 18));
// 关闭流·释放资源
oos.close();
```

### ObjectInputStream

反序列化：把文件中保存的对象，以流的方式读取出来使用

#### 构造方法

- ObjectInputStream(Inputstream in)：创建从指定InputStream读取的ObjectInputStream

#### 参数

- Inputstream in：字节输入流

#### 特有的成员方法

object readObject()：从ObjectInputStream读取对象。

>readObject方法声明抛出了ClassNotFoundException(class文件找不到异常)
>
>类必须实现Serializable
>
>必须存在类对应的class文件

#### 使用步骤

1. 创建ObjectInputStream对象，构造方法中传递字节输入流
2. 使用ObjectInputStream对象中的方法 readObject 读取保存对象的文件
3. 释放资源
4. 使用读取出来的对象（打印）

```java
// 创建Objectoutputstream.对象，传入字节输入流
ObjectInputStream ois = new ObjectInputStream(new FileInputstream("a.txt"));
// readobject()方法会抛出ClassNotFoundException
Object obj = ois.readObject();
ois.close();
System.out.println(obj);
```
