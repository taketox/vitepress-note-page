# 依赖传递与冲突

## 依赖传递

假如有Maven项目A，项目B依赖A，项目C依赖B。那么我们可以说 C依赖A。也就是说，依赖的关系为：C—>B—>A， 那么我们执行项目C时，会自动把B、A都下载导入到C项目的jar包文件夹中，这就是依赖的传递性。

**作用：**

- 简化依赖导入过程
- 确保依赖版本正确

**传递的原则：**

在 A 依赖 B，B 依赖 C 的前提下，C 是否能够传递到 A，取决于 B 依赖 C 时使用的依赖范围以及配置

- B 依赖 C 时使用 compile 范围：可以传递

- B 依赖 C 时使用 test 或 provided 范围：不能传递，所以需要这样的 jar 包时，就必须在需要的地方明确配置依赖才可以。

- B 依赖 C 时，若配置了以下标签，则不能传递

  ```xml
  <dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>druid</artifactId>
      <version>1.2.15</version>
      <optional>true</optional>
  </dependency>
  ```

**依赖传递终止：**

- 非compile范围进行依赖传递
- 使用optional配置终止传递
- 依赖冲突（传递的依赖已经存在）

## 依赖冲突

当直接引用或者间接引用出现了相同的jar包! 这时呢，一个项目就会出现相同的重复jar包，这就算作冲突！依赖冲突避免出现重复依赖，并且终止依赖传递！

![An image](/img/java/build/maven/04.png)

maven自动解决依赖冲突问题能力，会按照自己的原则，进行重复依赖选择。同时也提供了手动解决的冲突的方式，不过不推荐！

**解决依赖冲突（如何选择重复依赖）方式：**

自动选择原则

- 短路优先原则（第一原则）

  A—>B—>C—>D—>E—>X(version 0.0.1)

  A—>F—>X(version 0.0.2)

  则A依赖于X(version 0.0.2)。

- 依赖路径长度相同情况下，则“先声明优先”（第二原则）

  A—>E—>X(version 0.0.1)

  A—>F—>X(version 0.0.2)

  在\<depencies>\</depencies>中，先声明的，路径相同，会优先选择！

手动排除

```xml
<dependency>
  <groupId>cc.taketo.maven</groupId>
  <artifactId>pro01-maven-java</artifactId>
  <version>1.0-SNAPSHOT</version>
  <scope>compile</scope>
  <!-- 使用excludes标签配置依赖的排除  -->
  <exclusions>
    <!-- 在exclude标签中配置一个具体的排除 -->
    <exclusion>
      <!-- 指定要排除的依赖的坐标（不需要写version） -->
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```
