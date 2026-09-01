# 字符操作

## 编码与解码

编码就是把字符转换为字节，而解码是把字节重新组合成字符。

如果编码和解码过程使用不同的编码方式那么就出现了乱码。

- GBK 编码中，中文字符占 2 个字节，英文字符占 1 个字节；
- UTF-8 编码中，中文字符占 3 个字节，英文字符占 1 个字节；
- UTF-16be 编码中，中文字符和英文字符都占 2 个字节。

UTF-16be 中的 be 指的是 Big Endian，也就是⼤端。相应地也有 UTF-16le，le 指的是 Little Endian，也就是小端。

Java 的内存编码使用双字节编码 UTF-16be，这不是指 Java 只⽀持这⼀种编码方式，而是说 char 这种类型使用 UTF-16be 进⾏编码。char 类型占 16 位，也就是两个字节，Java 使用这种双字节编码是为了让⼀个中文或者⼀个英文都能使用⼀个 char 来存储。

## String 的编码方式

String 可以看成⼀个字符序列，可以指定⼀个编码方式将它编码为字节序列，也可以指定⼀个编码方式

将⼀个字节序列解码为 String。

```java
String str1 = "中文";
byte[] bytes = str1.getBytes("UTF-8");
String str2 = new String(bytes, "UTF-8");
System.out.println(str2);
```

在调用无参数 getBytes() 方法时，默认的编码方式不是 UTF-16be。双字节编码的好处是可以使用⼀个char 存储中文和英文，而将 String 转为 bytes[] 字节数组就不再需要这个好处，因此也就不再需要双字节编码。getBytes() 的默认编码方式与平台有关，⼀般为 UTF-8。

```java
byte[] bytes = str1.getBytes();
```

## Reader与Writer

### Reader类

Reader是Java定义的流式字符输入模式的抽象类。类中的方法在出错时引发IOException异常。

- int read()：如果调用的输入流的下一个字符可读则返回一个整型。遇到文件尾时返回-1。
- int read(char buffer[])：从缓冲区中读取字符，返回实际成功读取的字符数。遇到文件尾返回-1
- abstract int read(char buffer[], int offset, int numChars)：试图读取buffer中从buffer[offset]开始的numChars个字符，返回实际成功读取的字符数。遇到文件尾返回-1
- boolean ready()：如果下一个输入请求不等待则返回true,否则返回false
- long skip(long numChars)：跳过numChars个输入字符，返回跳过的字符数
- boolean markSupported()：判断当前流是否支持标记流
- void reset()：重置读取位置为上次mark标记的位置
- void mark(int numChars)：在输入流的当前位置设立一个标志。该输入流在numChars个字符被读取之前有效
- abstract void close()：关闭输入源。进一步的读取将会产生IOException异常

### Writer类

Writer是定义流式字符输出的抽象类。所有该类的方法都返回一个void值并在出错条件下引发IOException异常。

- void write(char buffer[])：向一个输出流写一个完整的字符数组
- abstract void write(char buffer[], int offset, int numChars)：向调用的输出流写入数组buffer以 buffer[offset] 为起点的 numChars 个字符区域的内容
- abstract void close()：关闭输出流。关闭后的写操作会产生IOException异常
- abstract void flush()：刷新缓冲区
- Writer append(CharSequence csq)：追加一个字符序列
- Writer append(CharSequence csq, int start, int end)：追加写入一个字符序列的一部分，从stat位置开始，end位置结束
- Writer append(char c)：追加写入一个16位的字符

### Reader及其子类

`FileReader`文件字符输入流：把文件转换为字符流读入

`CharArrayReader`字符数组输入流：是一个把字符数组作为源的输入流的实现

`BufferedReader`缓冲区输入流：BufferedReader类从字符输入流中读取文本并缓冲字符，以便有效地读取字符，数组和行

`PushbackReader`：PushbackReader类允许一个或多个字符被送回输入流。

`PipedReader`管道输入流：主要用途也是在线程间通讯，不过这个可以用来传输字符

### Writer及其子类

`FileWriter`字符输出流：FileWriter创建一个可以写文件的Writer类。

`CharArrayWriter`字符数组输出流：CharArrayWriter实现了以数组作为标的输出流。

`BufferedWriter`缓冲区输出流：Buffered Writer是一个增加了 `flush()` 方法的Writer。`flush()` 方法可以用来确保数据缓冲器确实被写到实际的输出流。

`PrintWriter`：PrintWriter本质上是PrintStream的字符形式的版本。

`PipedWriter`管道输出流：主要用途也是在线程间通讯，不过这个可以用来传输字符

Java的输入输出的流式接口为复杂而繁重的任务提供了一个简洁的抽象。过滤流类的组合允许你动态建立客户端流式接口来配合数据传输要求。继承高级流类InputStream、InputStreamReader、Reader和Writer类的Java程序在将来（即使创建了新的和改进的具体类）也能得到合理运用。

## 字符缓冲流

### BufferedReader

字符缓冲输入流

#### 构造方法

- BufferedReader(Reader in)：创建一个使用默认大小输入缓冲区的缓冲字符输入流。
- BufferedReader(Reader in, int size)：创建一个使用指定大小输入缓冲区的缓冲字符输入流。

#### 参数

- Reader in：字符输入流，我们可以传递FileReader，缓冲流会给FileReader增加一个缓冲区，提高FileReader的读取效率
- int size：指定缓冲区的大小，不写给定默认大小

#### 特有的成员方法

- String readline()：读取一个文本行，读取一行数据。如果已到达流末尾，则返回NULL

>行的终止符号：通过下列字符之一即可认为某行已终止，windows：\r\n、Linux：/n、mac：/r

#### 使用步骤

1. 创建字符缓冲输入流对象，构造方法中传递字符输入流
2. 使用字符缓冲输入流对象中的方法read/readLine读取文本
3. 释放资源

```java
BufferedReader br = new BufferedReader(new FileReader("a.txt"));
String line;
while ((line = br.readLine()) != null){
    System.out.println(line);
}
br.close();
```

### Bufferedwriter

字符缓冲输出流

#### 构造方法

- Bufferedwriter(Writer out)：创建一个使用默认大小输出缓冲区的缓冲字符输出流。
- Bufferedwriter(Writer out, int size)：创建一个使用给定大小输出缓冲区的新缓冲字符输出流。

#### 参数

- Writer out：字符输出流，我们可以传递Filewriter，缓冲流会给FileWriter增加一个缓冲区，提高Filewriter的写入效率
- int size：指定缓冲区的大小，不写给定默认大小

#### 特有的成员方法

- void newLine()：写入一个行分隔符。会根据不同的操作系统，获取不同的行分隔符。

  > windows：\r\n、Linux：/n、mac：/r

#### 使用步骤

1. 创建字符缓冲输出流对象，构造方法中传递字符输出流
2. 调用字符缓冲输出流中的方法write，把数据写入到内存缓冲区中
3. 调用字符缓冲输出流中的方法flush，把内存缓冲区中的数据，刷新到文件中
4. 释放资源

```java
BufferedWriter bw = new BufferedWriter(new FileWriter("a.txt"));
for (int i=0; i<10; i++){
    bw.write("HelloWorld");
    bw.newLine();
}
bw.flush();
bw.close();
```

## 字符流字节流相互转换

不管是磁盘还是网络传输，最小的存储单元都是字节，而不是字符。但是在程序中操作的通常是字符形式的数据，因此需要提供对字符进⾏操作的方法。

### InputStreamReader

`InputStreamReader` 实现从字节流解码成字符流；

#### 构造方法

- InputStreamReader(InputStream in)：创建一个使用群默认字符集的 InputStreamReader
- InputStreamReader(InputStream in, String charsetName)：创建使用指定字符集的InputStreamReader

#### 参数

- InputStream in：字节输入流，用来读取文件中保存的字节
- String charsetName：指定的编码表名称，不区分大小写，可以是 `utf-8/UTF-8`，`gbk/GBK`，不指定默认使用`UTF-8`

#### 使用步骤

1. 创建InputStreamReader对象，构造方法中传递字节输入流和指定的编码表名称
2. 使用InputStreamReader对象中的方法read读取文件
3. 释放资源

>构造方法中指定的编码表名称要和文件的编码相同，否则会发生乱码

```java
// InputstreamReader,里面传入字节输入流和字符集名称
InputstreamReader isr new InputstreamReader(new FileInputstream("a.txt"), "UTF-8");
int len = 0;
// 使用reader读数据
while ((len = isr.read()) != -1){
    System.out.println((char)len);
    isr.close();
}
```

### OutputStreamWriter

`OutputStreamWriter` 实现字符流编码成为字节流。

#### 构造方法

- OutputStreamWriter(OutputStream out)：创建使用默认字符编码的OutputStreamWriter
- OutputStreamWriter(OutputStream out, String charsetName)：创建使用指定字符集的OutputStreamWriter

#### 参数

- Outputstream out：字节输出流，可以用来写转换之后的字节到文件中
- String charsetName：指定的编码表名称，不区分大小写，可以是 `utf-8/UTF-8`，`gbk/GBK`，不指定默认使用`UTF-8`

#### 使用步骤

1. 创建OutputStreamWriter对象，构造方法中传递字节输出流和指定的编码表名称
2. 使用OutputStreamWriter对象中的方法write，把字符转换为字节存储缓冲区中（编码）
3. 使用OutputStreamWriter对象中的方法flush，把内存缓冲区中的字节刷新到文件中（使用字节流写字节的过程）
4. 释放资源

```java
// 创建OutputstreamWriter，里面传入字节输出流和字符集名称
OutputstreamWriter osw = new OutputstreamWriter(new FileOutputstream("a.txt"), "GBK");
// 把字符转换为字节存储到缓冲区中（编码）
osw.write(str:"你好");
// 把缓冲区中的字节刷新到文件中
// 使用字节流写字节的过程
osw.flush();
osw.close();
```

## 应用

实现逐行输出文本文件的内容

```java
public static void readFileContent(String filePath) throws IOException {
    FileReader fileReader = new FileReader(filePath);
    BufferedReader bufferedReader = new BufferedReader(fileReader);
    String line;
    while ((line = bufferedReader.readLine()) != null) {
       System.out.println(line);
    }
    // 装饰者模式使得 BufferedReader 组合了⼀个 Reader 对象
    // 在调⽤ BufferedReader 的 close() 方法时会去调用 Reader 的 close() 方法
    // 因此只要⼀个 close() 调用即可
    bufferedReader.close();
}
```
