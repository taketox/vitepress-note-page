# 磁盘操作

## File

java.io.File类是文件和目录路径名的抽家表示形式。
java把电脑中的文件和文件夹（目录）封装为了一个File类，我们可以使用File类对文件和文件夹进行操作。

File类是一个与系统无关的类，任何的操作系统都可以使用这个类中的方法。

### 静态变量

- static String pathSeparator：与系统有关的路径分隔符，为了方便，它被表示为一个字符串。
- static char pathSeparatorchar：与系统有关的路径分隔符。
- static String separator：与系统有关的默以名称分隔符，为了方便，它被表示为一个字符串。
- static char separatorChar：与系统有关的默认名称分隔符。

### 构造方法

- File(String pathname)：通过将给定路径名字符串转换为抽象路径名来创建一个新File实例。

  > String pathname：字符串的路径名称
  >
  > 路径可以是以文件结尾，也可以是以文件夹结尾
  >
  > 路径可以是相对路径，也可以是绝对路径
  >
  > 创建File对象，只是把字符再路径封装为File对象，不考虑路径真假问题

- File(String parent, String child)：根据parent路径名字符串和child路径名字符串创建一个新File实例。

  > File parent：父路径
  >
  > String child：子路径
  >
  > 父路径和子路径，可以单独书写，使用起来非常灵活，父路径和子路径都可以变化。

- File(File parent, String child)：根据parent抽象路径名和child路径名字符串创建一个新File实例。

  > File parent：父路径
  >
  > String child：子路径
  >
  > 父路径和子路径，可以单独书写，使用起来非常灵活：父路径和子路径都可以变化。
  >
  > 父路径是File类型，可以使用File的方法对路径进行一些操作，再使用路径创建对象。

### 常用方法

- public String getAbsolutePath()：返回此File的绝对路径名字符串。

- public String getPath()：将此File转换为路径名字符串。

  > 将此File转换为路径名字符串，获取的构造方法中传递的路径。
  >
  > toString方法调用的就是getPath方法

- public String getName()：返回由此File表示的文件或目录的名称。

- public long length()：返回由此File表示的文件的长度。

  > 文件夹是没有大小概念的，不能获取文件夹的大小
  >
  > 如果构造方法中给出的路径不存在，那么length方法返回0

- public boolean exists()：此File表示的文件或目录是否实际存在

- public boolean isDirectory()：此File表示的是否为目录。

- boolean isFile()：此File表示的是否为文件。

- public boolean createNewFile()：当且仅当具有该名称的文件尚不存在时，创建一个新的空文件

  >true：文件不存在，创建文件，返回true
  >false：文件存在，不会创建，返回false

- public boolean delete()：删除由此File表示的文件或目录。

  >true：文件/文件夹删除成功，返回true
  >false：文件夹中有内容，不会删除返回false；构造方法中路径不存在返回false

- public boolean mkdir()：创建单级空文件夹

- public boolean mkdirs()：既可以创建单级空文件夹，也可以创建多级文件夹

  >true：文件夹不存在，创建文件夹，返回true
  >false：文件夹存在，不会创建，返回false；构造方法中给出的路径不存在返回false

- public String[] list()：返回一个String数组，表示该File目录中的所有子文件或目录。

- public File[] listFiles()：返回一个File数组，表示该File目录中的所有的子文件或目录。

## 递归

递归：方法自己调用自己

递归的分类：

递归分为两种：直接递归和间接递归。

- 直接递称为方法自身调用自己。
- 间接递归可以A方法调用B方法，B方法调用c方法，C方法调用A方法。

注意事项：

- 递归一定要有条件限定，保证递归能够停止下来，否则会发生栈内存溢出。
- 在递归中虽然有限定条件，但是递归次数不能太多。否则也会发生栈内存溢出。
- 构造方法，禁止递归。

## 应用

遍历文件夹中的全部文件和文件夹

```java
public static void getAllFile(File dir){
    // 打印被遍历的目录名称
    System.out.println(dir);   
    File[]files = dir.listFiles();
    for (File f files){
        // 对遍历得到的FiLe对象f进行判断，判断是否是文件夹
        if(f.isDirectory()){
            // f是一个文件夹，侧则续遍历这个文件夹
            // 我们发现getAllFile方法就是传递文件夹，遍历文件夹的方法
            // 所以直接调用getAllFile方法即可：递归（自己调用自己）
            getALLFile(f);
        } else{
            // f是一个文件，直接打印即可
            System.out.println(f);
        }
    }
```
