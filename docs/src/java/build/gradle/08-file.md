# 文件操作

## 本地文件

使用 `Project.file(java.lang.Object)`方法，通过指定文件的相对路径或绝对路径来对文件的操作。

其实使用 `Project.file(java.lang.Object)`方法创建的 `File` 对象就是 Java 中的 `File` 对象。

**示例：**

```groovy
// 相对路径
File configFile = file('src/conf.xml')
println(configFile.createNewFile())
// 绝对路径
configFile = file('C:\\Users\\Zhang\\Desktop\\gradle-test\\gradle-test\\src\\conf.xml')
println(configFile.createNewFile())
// 使用一个文件对象
configFile = new File('src/conf.xml')
println(configFile.exists())

// 输出
true
false
true
```

## 文件集合

文件集合就是一组文件的列表，在 Gradle 中，文件集合用 `FileCollection` 接口表示。我们可以使用`Project.files(java.lang.Object[])`方法来获得一个文件集合对象。

- 对于文件集合我们可以遍历它；
- 也可以把它转换成 java 类型；
- 同时还能使用 `+` 来添加一个集合，或使用 `-` 来删除集合。

**示例：**

```groovy
def collection = files('src/test1.txt', new File('src/test2.txt'), ['src/test3.txt', 'src/test4.txt'])
collection.forEach() { it1 ->
    //创建该文件
    it1.createNewFile()
    //输出文件名
    println it1.name
}
// 输出
test1.txt
test2.txt
test3.txt
test4.txt

// 把文件集合转换为java中的Set类型
Set set1 = collection.files
Set set2 = collection as Set
// 把文件集合转换为java中的List类型
List list = collection as List
for (item in list) {
    println item.name
}
// 输出
test1.txt
test2.txt
test3.txt
test4.txt

// 添加或者删除一个集合
def union = collection + files('src/test5.txt')
def minus = collection - files('src/test3.txt')
union.forEach() { File it2 ->
    println it2.name
}
// 输出
test1.txt
test2.txt
test3.txt
test4.txt
test5.txt
```

## 文件树

**文件树是有层级结构的文件集合**，一个文件树它可以代表一个目录结构或一 ZIP 压缩包中的内容结构。

文件树是从文件集合继承过来的，**所以文件树具有文件集合所有的功能**。我们可以使用 `Project.fileTree(java.util.Map)` 方法来创建文件树对象，还可以使用过虑条件来包含或排除相关文件。

**示例：**

```groovy
// 第一种方式:使用路径创建文件树对象，同时指定包含的文件
FileTree fileTree1 = fileTree('src/main').include('**/*.java')
//第二种方式:通过闭包创建文件树
FileTree fileTree2 = fileTree('src/main') {
    include '**/*.java'
}
//第三种方式:通过路径和闭包创建文件树：具名参数给map传值
FileTree fileTree3 = fileTree(dir: 'src/main', include: '**/*.java')
FileTree fileTree4 = fileTree(dir: 'src/main', includes: ['**/*.java', '**/*.xml', '**/*.txt'], exclude: '**/*test*/**')
// 遍历文件树的所有文件
fileTree4.each { File file ->
    println file
    println file.name
}
```

## 文件拷贝

我们可以使用 Copy 任务来拷贝文件，通过它可以过虑指定拷贝内容，还能对文件进行重命名操作等。

Copy 任务必须指定一组需要拷贝的文件和拷贝到的目录

这里使用 `CopySpec.from(java.lang.Object[])` 方法指定原文件；使用 `CopySpec.into(java.lang.Object)` 方法指定目标目录。

```groovy
task copyTask(type: Copy) {
    from 'src/main/resources'
    into 'build/config'
}
```

from()方法接受的参数和文件集合时 files()一样，into()方法接受的参数与本地文件时 file()一样

当参数为一个目录时，该目录下所有的文件都会被拷贝到指定目录下（目录自身不会被拷贝）；当参数为一个文件时，该文件会被拷贝到指定目录；如果参数指定的文件不存在，就会被忽略；当参数为一个 Zip 压缩文件，该压缩文件的内容会被拷贝到指定目录。

**示例：**

```groovy
task copyTask(type: Copy) {
    // 拷贝src/main/webapp目录下所有的文件
    from 'src/main/webapp' // 拷贝单独的一个文件
    from 'src/staging/index.html' // 从Zip压缩文件中拷贝内容
    from zipTree('src/main/assets.zip')
    // 拷贝到的目标目录
    into 'build/explodedWar'
}
```

在拷贝文件的时候还可以添加过虑条件来指定包含或排除的文件

**示例：**

```groovy
task copyTaskWithPatterns(type: Copy) {
    from 'src/main/webapp'
    into 'build/explodedWar'
    include '**/*.html'
    include '**/*.jsp'
    exclude { details -> details.file.name.endsWith('.html') }
}
```

在拷贝文件的时候还可以对文件进行重命名操作

**示例：**

```groovy
task rename(type: Copy) {
    from 'src/main/webapp'
    into 'build/explodedWar'
    // 使用一个闭包方式重命名文件
    rename { String fileName ->
        fileName.replace('-staging-', '')
    }
}
```

在上面的例子中我们都是使用 Copy 任务来完成拷贝功能的，那么有没有另外一种方式呢？答案是肯定的，那就是`Project.copy(org.gradle.api.Action)`方法。

**示例：**

```groovy
task copyMethod {
    doLast {
        copy {
            from 'src/main/webapp'
            into 'build/explodedWar'
            include '**/*.html'
            include '**/*.jsp'
        }
    }
}
```

**使用 project 对象的 copy 方法：**

```groovy
copy {
    //相对路径或者绝对路径
    from file('src/main/resources/ddd.txt') //file也可以换成new File()
    into this.buildDir.absolutePath
}
```

## 归档文件

通常一个项目会有很多的 Jar 包，我们希望把项目打包成一个 WAR，ZIP 或 TAR 包进行发布，这时我们就可以使用Zip，Tar，Jar，War 和 Ear 任务来实现，不过它们的用法都一样。

创建一个 Zip 压缩文件，并指定压缩文件名称

```groovy
apply plugin: 'java'
version = 1.0
task myZip(type: Zip) {
    from 'src/main'
    into 'build' //保存到build目录中
    baseName = 'myGame'
}
println myZip.archiveName

// 输出
myGame-1.0.zip
```

可以使用 `Project.zipTree(java.lang.Object)` 和 `Project.tarTree(java.lang.Object)` 方法来创建访问 Zip 压缩包的文件树对象

**示例：**

```groovy
// 使用zipTree FileTree 
zip = zipTree('someFile.zip')
// 使用tarTree FileTree 
tar = tarTree('someFile.tar')
```
