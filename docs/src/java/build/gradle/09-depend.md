# Dependencies

## 依赖的方式

**Gradle 中的依赖分为：**

- 直接依赖
- 项目依赖
- 本地 jar 依赖

**示例：**

```groovy
dependencies {
    //依赖当前项目下的某个模块[子工程]
    implementation project(':subproject01')
    //直接依赖本地的某个jar文件
    implementation files('libs/foo.jar', 'libs/bar.jar')
    //配置某文件夹作为依赖项
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    //直接依赖
    implementation 'org.apache.logging.log4j:log4j:2.17.2'
}
```

**直接依赖：**

在项目中直接导入的依赖，就是直接依赖

```groovy
// 简写
implementation 'org.apache.logging.log4j:log4j:2.17.2

// 完整写法
implementation group: 'org.apache.logging.log4j', name: 'log4j', version: '2.17.2'
```

> group/name/version 共同定位一个远程仓库
>
> version 最好写一个固定的版本号，以防构建出问题
>
> implementation 类似 maven 中的依赖的 scope

对比 maven 中的依赖：

```xml
<dependencies>
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.12</version>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

**项目依赖：**

从项目的某个模块依赖另一个模块

```groovy
implementation project(':subject01')
```

> 直接依赖本工程中的 `libary module`，这个 `libary module` 需要在 `setting.gradle` 中配置。

**本地** **jar** **依赖**：

两种方式

```groovy
//直接依赖某文件
implementation files('libs/foo.jar', 'libs/bar.jar')
//配置某文件夹作为依赖项
implementation fileTree(dir: 'libs', include: ['*.jar'])
```

## 依赖的类型

类似于 Maven 的 scope 标签，gradle 也提供了依赖的类型，具体如下所示

| scpoe                  | 解释                                                         |
| ---------------------- | ------------------------------------------------------------ |
| compileOnly            | 由java插件提供，曾短暂的叫provided，后续版本已经改成了compileOnly，适用于编译期需要而不需要打包的情 |
| **runtimeOnly**        | 况由 java 插件提供，只在运行期有效，编译时不需要，比如 mysql 驱动包。取代老版本中被移除的 runtime |
| **implementation**     | 由 java 插件提供，针对源码[`src/main`目录]，在编译、运行时都有效，取代老版本中被移除的 compile |
| testCompileOnly        | 由 java 插件提供，用于编译测试的依赖项，运行时不需要         |
| testRuntimeOnly        | 由 java 插件提供，只在测试运行时需要，而不是在测试编译时需要，取代老版本中被移除的 testRuntime |
| **testImplementation** | 由 java 插件提供，针对测试代码[`src/test`目录] 取代老版本中被移除的 testCompile |
| **providedCompile**    | war 插件提供支持，编译、测试阶段代码需要依赖此类 jar 包，而运行阶段容器已经提供了相应的支持，所 |
| compile                | 以无需将这些文件打入到 war 包中了；例如 servlet-api.jar、jsp-api.jar编译范围依赖在所有的 classpath 中可用，同时它们也会被打包。在 gradle 7.0 已经移除 |
| runtime                | runtime 依赖在运行和测试系统的时候需要，在编译的时候不需要，比如 mysql 驱动包。在 gradle 7.0 已经移除 |
| **api**                | java-library 插件提供支持，这些依赖项可以传递性地导出给使用者，用于编译时和运行时。取代老版本中被 |
| compileOnlyApi         | 移除的 compilejava-library 插件提供支持，在声明模块和使用者在编译时需要的依赖项，但在运行时不需要。 |

## api 与 imp 区别

|          | api                                            | implementation                                       |
| -------- | ---------------------------------------------- | ---------------------------------------------------- |
| 编译时   | 能进行依赖传递，底层变，全部都要变、编译速度慢 | 不能进行依赖传递，底层变，不用全部都要变、编译速度快 |
| 运行时   | 运行时会加载，所有模块的class都要被加载        | 运行时会加载，所有模块的class都要被加载              |
| 应用场景 | 适用于多模块依赖，避免重复依赖模块             | 多数情况下使用implementation                         |

**如下图所示：**

![An image](/img/java/build/gradle/14.png)

**api：**

- 编译时：如果 libC 的内容发生变化，由于使用的是 api 依赖，依赖会传递，所以 libC、libA、projectX 都要发生变化，都需要重新编译，速度慢。
- 运行时：libC、libA、projectX 中的 class 都要被加载。

**implementation：**

- 编译时：如果 libD 的内容发生变化，由于使用的是 implemetation 依赖，依赖不会传递，只有 libD、libB 要变化并重新编译，速度快
- 运行时：libC、libA、projectX 中的 class 都要被加载。

**案例分析：**

**api：**

api 的适用场景是多 module 依赖

`moduleA` 工程依赖了 `module B`，同时 `module B` 又需要依赖了 `module C`，`modelA` 工程也需要去依赖 `module C`。

这个时候避免重复依赖 `module`，可以使用 `module B` api 依赖的方式去依赖 `module C`，`modelA` 工程只需要依赖 `moduleB` 即可。

**implementation：**

有ABCD四个模块

- A implemetation B，B implemetation C，则A不能使用C。
- A implemetation B，B api C，则A可以使用C。
- A implemetation B，B implemetation C，C api D，则B可以使用D，但A不能使用D。
- A implemetation B，B api C，C api D，这样A可以使用D

不管ABCD在何处被添加到类路径都一样，在运行时这些模块中的class都是要被加载的。

总之，除非涉及到多模块依赖，为了避免重复依赖，咱们会使用 `api` 其它情况我们优先选择 `implementation`拥有大量的 `api` 依赖项会显著增加构建时间。

## 依赖冲突及解决方案

依赖冲突是指：在编译过程中，如果存在某个依赖的多个版本，构建系统应该选择哪个进行构建的问题。

![An image](/img/java/build/gradle/15.png)

A、B、C 都是本地子项目 module，log4j 是远程依赖。

编译时：B 用 1.4.2 版本的 log4j，C 用 2.2.4 版本的 log4j，B 和 C 之间没有冲突

打包时：只能有一个版本的代码最终打包进最终的A对应的jar |war包，对于 Gradle 来说这里就有冲突了

**案例演示：**

引入依赖

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
    implementation 'org.hibernate:hibernate-core:3.6.3.Final'
}
```

查看依赖

```groovy
org.slf4j:slf4j-api:1.6.1
```

引入依赖

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
    implementation 'org.hibernate:hibernate-core:3.6.3.Final'
    implementation 'org.slf4j:slf4j-api:1.4.0'
}
```

![An image](/img/java/build/gradle/13.png)

默认情况，Gradle 会使用最新版本的 jar 包【考虑到新版本的 jar 包一般都是向下兼容的】，实际开发中，还是建议使用官方自带的这种解决方案。

当然除此之外，Gradle 也为我们提供了一系列的解决依赖冲突的方法：`exclude` 移除一个依赖**，**不允许依赖传递**，**强制使用某个版本。

### Exclude 排除某个依赖

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
    implementation('org.hibernate:hibernate-core:3.6.3.Final') {
        // 排除某一个库(slf4j)依赖
        // 如下三种写法都行
        exclude group: 'org.slf4j'
        exclude module: 'slf4j-api'
        exclude group: 'org.slf4j', module: 'slf4j-api'
    }
    // 排除之后,使用手动的引入即可
    implementation 'org.slf4j:slf4j-api:1.4.0'
}
```

### 不允许依赖传递

在添加依赖项时，如果设置 `transitive` 为 false，表示关闭依赖传递。即内部的所有依赖将不会添加到编译和运行时的类路径。

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
    implementation('org.hibernate:hibernate-core:3.6.3.Final') {
        // 不允许依赖传递，不推荐
        transitive(false)
    }
    implementation 'org.slf4j:slf4j-api:1.4.0'
}
```

### 强制使用某个版本

```groovy
dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
    implementation('org.hibernate:hibernate-core:3.6.3.Final')
    // 强制使用某个版本!!【官方建议使用这种方式】
    implementation('org.slf4j:slf4j-api:1.4.0!!')
    // 这种效果和上面那种一样,强制指定某个版本
    implementation('org.slf4j:slf4j-api:1.4.0') {
        version {
            strictly("1.4.0")
        }
    }
}
```

### 查看依赖冲突

我们可以先查看当前项目中到底有哪些依赖冲突

```groovy
// 当遇到版本冲突时直接构建失败
configurations.all() {
    Configuration configuration ->
        configuration.resolutionStrategy.failOnVersionConflict()
}
```

输出

```bash
Execution failed for task ':compileJava'.
> Could not resolve all dependencies for configuration ':compileClasspath'.
   > Conflict(s) found for the following module(s):
       - org.slf4j:slf4j-api between versions 1.6.1, 1.4.0 and 1.5.8
     Run with:
         --scan or
         :dependencyInsight --configuration compileClasspath --dependency org.slf4j:slf4j-api
     to get more insight on how to solve the conflict.
```
