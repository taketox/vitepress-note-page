# 字节操作

## InputStream

InputStream是一个定义了Java流式字节输入模式的抽象类。该类的所有方法在出错条件下引发一个IOException异常。

### 常用方法

- public int available()：返回可读的字节数量
- public int read(byte b[], int off, int len)：把从第off位置读取Ien长度字节的数据放到byte数组中。
- public abstract int read()：读取数据。
- public long skip(long n)：跳过指定个数的字节。
- public void close()：关闭流，释放资源
- public synchronized void reset()：重置读取位置为上次mark标记的位置
- public boolean markSupported()：如果调用的流支持mark()/reset()就返回true

### InputStream及其子类

- `FilelnputStream`文件输入流：FilelnputStream类创建一个能从文件读取字节的InputStream类
- `ByteArrayInputStream`字节数组输入流：把内存中的一个缓冲区作为InputStream使用
- `PipedInputStream`管道输入流：实现了pipe管道的概念，主要在线程中使用
- `SequencelnputStream`顺序输入流：把多个InputStream合并为一个InputStream
- `FilterOutputStream`过滤输入流：其他输入流的包装。
- `ObjectInputStream`反序列化输入流：将之前使用Object OutputStream序列化的原始数据恢复为对象，以流的方式读取对象
- `DatalnputStream`：数据输入流允许应用程序以与机器无关方式从底层输入流中读取基本Java数据类型。
- `PushbackInputStream`推回输入流：缓冲的一个新颖的用法是实现`推回(pushback)`，用于输入流允许字节被读取然后返回到流。

## OutputStream

OutputStream是定义了流式字节输出模式的抽象类。该类的所有方法返回一个void值并且在出错情况下引发一个IOException异常

### 常用方法

- void write(int b)：向输出流写入单个字节
- void write(byte buffer[])：向一个输出流写入一个完整的字节数组
- void write(byte buffer[], int offset, int numBytes)：写入数组buffer以buffer[offset]为起点的numBytes个字节区域内的内容
- void flush()：刷新缓冲区
- void close()：关闭输出流。关闭后的写操作会产生lOException.异常

### OutputStream及其子类

- `FileOutputStream`文件输出流：该类实现了一个输出流，其数据写入文件。
- `ByteArrayOutputStream`字节数组输出流：该类实现了一个输出流，其数据被写入由byte数组充当的缓冲区，缓冲区会随着数据的不断写入而自动增长。
- `PipedOutputStream`管道输出流：管道的输出流，是管道的发送端。
- `ObjectOutputStream`基本类型输出流：该类将实现了序列化的对象序列化后写入指定地方。
- `FilterOutputStream`过滤输出流：其他输出流的包装。
- `PrintStream`打印流通过PrintStream可以将文字打印到文件或者网络中去。
- `DataOutputStream`：数据输出流允许应用程序以与机器无关方式向底层输出流中写入基本Java数据类型。

## 字节缓冲流

### BufferedOutputstream

字节缓冲输出流

#### 构造方法

- Bufferedoutputstream(Outputstream out)：创建一个新的缓冲输出流，以将数据写入指定的底层输出流。
- BufferedOutputstream(Outputstream out, int size)：创建一个新的缓冲输出流，以将具有指定缓冲区大小的数据写入指定的底层输出流。

#### 参数

- Outputstream out：字节输出流，我们可以传递FileOutputstream，缓冲流会给FileOutputstreamt增加一个缓冲区
- int size：指定缓冲流内缓冲区的大小，不指定默认。提高FileOutputstream的写入效率

#### 使用步骤

1. 创建FileOutputstream对象，构造方法中绑定要输出的目的地
2. 创建BufferedoutputStream对象，构造方法中传递FileOutputstream对象对象，提高FileOutputstream对象效率
3. 使用BufferedoutputStream对象中的方法write，把数据写入到内缓冲区中
4. 使用BufferedoutputStream对象中的方法flush，把内部缓冲区中的数据，刷新到文件中
5. 释放资源（会先调用flush方法刷新数据，第4步可以省略）

```java
FileOutputstream fos = new Fileoutputstream("a.txt");
Bufferedoutputstream bos = new Bufferedoutputstream(fos);
bos.write("使用缓冲输出流写入数据".getBytes());
bos.flush();
//刷新流·将缓冲区的数据写入硬盘
bos.close();
//会先调用flush方法，若调用close可以省略flush
```

### BufferedInputstream

字节缓冲输入流

#### 构造方法

- BufferedInputStream(InputStream in)：创建一个BufferedInputStream并保存其参数，即输入流in，以便将来使用。
- BufferedInputStream(InputStream in, int size)：创建具有指定缓冲区大小的BufferedInputStream并保存其参数，即输入流in，以便将来使用。

#### 参数

- InputStream in：字节输入流，我们可以传递FileInputstream，缓冲流会给FileInputstream增加一个缓冲区
- int size：指定缓冲流内部缓冲区的大小，不指定默认提高FileInputstream的读取效率

#### 使用步骤

1. 创建FileInputStream对象，构造方法中绑定要读取的数据源
2. 创建BufferedInputStream对象，构造方法中传递FileInputStream对象，提高FileInputStream对象的读取效率
3. 使用BufferedInputStream对象中的方法read,读取文件
4. 释放资源

```java
FileInputstream fis = new FileInputstream("a.txt");
BufferedInputstream bis = new BufferedInputstream(fis);
int len 0;
byte[]bytes = new byte[1024];
while ((len = bis.read(bytes)) != -1){
    System.out.println(new String(bytes, 0, len));
    bis.close();
}
```

## 应用

实现文件复制

```java
public static void copyFile(String src, String dist) throws IOException {
    FileInputStream in = new FileInputStream(src);
    FileOutputStream out = new FileOutputStream(dist);
    byte[] buffer = new byte[20 * 1024];
    int cnt;
    // read() 最多读取 buffer.length 个字节
    // 返回的是实际读取的个数
    // 返回 -1 的时候表示读到 eof，即⽂件尾
    while ((cnt = in.read(buffer, 0, buffer.length)) != -1) {
    out.write(buffer, 0, cnt);
    }
    in.close();
    out.close();
}
```
