# 生命周期

Gradle 项目的生命周期分为三大阶段：`Initialization -> Configuration -> Execution`。

![An image](/img/java/build/gradle/06.png)

**Initialization阶段：**

主要目的是初始化构建， 它又分为两个子过程，一个是执行 `Init Script`，另一个是执行 `Setting Script`。

`init.gradle` 文件会在每个项目 build 之前被调用，用于做一些初始化的操作，它主要有如下作用：

- 配置内部的仓库信息（如公司的 maven 仓库信息）；
- 配置一些全局属性；
- 配置用户名及密码信息（如公司仓库的用户名和密码信息）。

`Setting Script` 则更重要， 它初始化了一次构建所参与的所有模块。

**Configuration** **阶段**：

这个阶段开始加载项目中所有模块的 `Build Script`。

所谓 "加载" 就是执行 `build.gradle` 中的语句， 根据脚本代码创建对应的 task， 最终根据所有 task 生成由 **Task组成的有向无环图**(Directed Acyclic Graphs)，如下：

![An image](/img/java/build/gradle/07.png)

从而构成如下**有向无环树**：

![An image](/img/java/build/gradle/08.png)

**Execution阶段：**

这个阶段会根据上个阶段构建好的有向无环图，按着顺序执行 Task【Action 动作】。

## Hook

生命周期中的这些钩子函数都是由 gradle 自动回调完成的，利用这些钩子函数可以帮助我们实现一些我们想要的功能。

![An image](/img/java/build/gradle/09.png)

Gradle 在生命周期各个阶段都提供了用于回调的钩子函数：

**Gradle 初始化阶段：**

1. 在 `settings.gradle` 执行完后，会回调 Gradle 对象的 `settingsEvaluated` 方法
2. 在构建所有工程 `build.gradle` 对应的 Project 对象后，也既初始化阶段完毕，会回调 Gradle 对象的 `projectsLoaded` 方法

**Gradle 配置阶段：**

1. Gradle 会循环执行每个工程的 `build.gradle` 脚本文件
2. 在执行当前工程 `build.gradle` 前，会回调 Gradle 对象的 `beforeProject` 方法和当前 Project 对象的 `beforeEvaluate` 方法，
3. 虽然 `beforeEvalute` 属于 project 的生命周期， 但是此时 `build script` 尚未被加载， 所以 `beforeEvaluate` 的设置依然要在 `init script` 或 `setting script` 中进行，不要在 `build script` 中使用 `project.beforeEvaluate` 方法。
4. 在执行当前工程 `build.gradle` 后，会回调 Gradle 对象的 `afterProject` 方法和当前 Project 对象的 `afterEvaluate` 方法
5. 在所有工程的 `build.gradle` 执行完毕后，会回调 Gradle 对象的 `projectsEvaluated` 方法
6. 在构建 `Task` 依赖有向无环图后，也就是配置阶段完毕，会回调 `TaskExecutionGraph` 对象的 `whenReady` 方法

**Gradle 执行阶段：**

1. Gradle 会循环执行 Task 及其依赖的 Task
2. 在当前 Task 执行之前，会回调 `TaskExecutionGraph` 对象的 `beforeTask` 方法
3. 在当前 Task 执行之后，会回调 `TaskExecutionGraph` 对象的 `afterTask` 方法
4. 当所有的 Task 执行完毕后，会回调 Gradle 对象的 `buildFinish` 方法。

**Gradle 执行脚本文件的时候会生成对应的实例，主要有如下几种对象：**

- Gradle 对象：在项目初始化时构建，全局单例存在，只有这一个对象
- Project 对象：每一个 `build.gradle` 文件都会转换成一个 Project 对象，类似于maven中的 `pom.xml` 文件
- Settings 对象：`settings.gradle` 会转变成一个 `settings` 对象，和整个项目是一对一的关系，一般只用到 `include` 方法
- Task 对象：从前面的有向无环图中，我们也可以看出，gradle最终是基于Task的，一个项目可以有一个或者多个Task

## 钩子函数代码演示

**项目目录结构如下：**

![An image](/img/java/build/gradle/10.png)

在 `root project` 的 `settings.gradle` 文件中添加

```groovy
// 1.settingsEvaluated钩子函数,在初始化阶段完成
gradle.settingsEvaluated {
    println "settingsEvaluated"
}
// 2.projectsLoaded钩子函数,在初始化阶段完成
gradle.projectsLoaded {
    println "projectsLoaded"
}
// 声明一个变量：表示当前项目名,在每次执行某个项目的beforeEvaluate方法时先给projectName变量赋值
// 这样方便在：gradle.beforeProject和afterProject两个钩子函数使用。
def projectName = ""
gradle.addProjectEvaluationListener(new ProjectEvaluationListener() {
    // 3.执行各个project的beforeEvaluate：在配置阶段完成
    @Override
    void beforeEvaluate(Project project) {
        projectName = project.name 
        println "${project.name} Project beforeEvaluate"
    }
    // 5.执行各个project的afterEvaluate：在配置阶段完成
    @Override
    void afterEvaluate(Project project, ProjectState projectState) {
        println "${project.name} Project afterEvaluate"
    }
});
// 4.执行各个project的beforeProject：在配置阶段完成
gradle.beforeProject {
    println "${projectName} beforeProject..."
}
// 6.执行各个project的afterProject：在配置阶段完成
gradle.afterProject {
    println "${projectName} afterProject..."
}
// 7.所有工程的 build.gradle 执行完毕后，回调 Gradle 对象的 projectsEvaluated 方法：在配置阶段完成
def rootProjectName = rootProject.getName()
gradle.projectsEvaluated {
    println "${rootProjectName} projectsEvaluated..."
}
// 8.配置阶段完毕后，回调 TaskExecutionGraph 对象的 whenReady 方法：在配置阶段完成
gradle.taskGraph.whenReady {
    println "${rootProjectName} taskGraph whenReady..."
}
// 9.在当前Task执行之前,会回调 TaskExecutionGraph 对象的 beforeTask方法：在执行阶段完成
gradle.taskGraph.beforeTask { task ->
    println "this is the task ${task.name} of the project ${task.getProject().name} beforeTask.."
}
// 10.在当前Task执行之后,会回调 TaskExecutionGraph 对象的 afterTask方法：在执行阶段完成
gradle.taskGraph.afterTask { task ->
    println "this is the task ${task.name} of the project ${task.getProject().name} afterTask.."
}
// 11.当所有的 Task 执行完毕后，会回调 Gradle 对象的 buildFinish 方法：在执行阶段完成
gradle.buildFinished {
    println "${rootProjectName} buildFinished..."
}
```

在 root 的 `build.gradle` 文件中添加

```groovy
task A {
    println "root taskA" 
    doFirst() {
        println "root taskA doFirst"
    }
    doLast() {
        println "root taskA doLast"
    }
}
```

在 `subject01` 的 `build.gradle` 文件中添加

```groovy
task B {
    println "SubProject01 taskB" 
    doFirst() {
        println "SubProject01 taskB doFirst"
    }
    doLast() {
        println "SubProject01 taskB doLast"
    }
}
```

在 `subject02` 的 `build.gradle` 文件中添加

```groovy
// task C在上面
task C {
// 依赖task D
    dependsOn 'D' println "SubProject02 taskC" 
    doFirst() {
        println "SubProject02 taskC doFirst"
    }
    doLast() {
        println "SubProject02 taskC doLast"
    }
}
// task D在下面
task D {
    println "SubProject02 taskD" 
    doFirst() {
        println "SubProject02 taskD doFirst"
    }
    doLast() {
        println "SubProject02 taskD doLast"
    }
}
```

**测试：**

```bash
./gradlew C -q

# 输出
settingsEvaluated
projectsLoaded
rootproject Project beforeEvaluate
rootproject beforeProject...
root taskA
rootproject Project afterEvaluate
rootproject afterProject...
subproject01 Project beforeEvaluate
subproject01 beforeProject...
SubProject01 taskB
subproject01 Project afterEvaluate
subproject01 afterProject...
subproject03 Project afterEvaluate
subproject03 afterProject...
rootproject projectsEvaluated...
rootproject taskGraph whenReady...
this is the task D of the project subproject02 beforeTask..
SubProject02 taskD doFirst
SubProject02 taskD doLast
this is the task D of the project subproject02 afterTask..
this is the task C of the project subproject02 beforeTask..
SubProject02 taskC doFirst
SubProject02 taskC doLast
this is the task C of the project subproject02 afterTask..
rootproject buildFinished...
```

**查看 task 有向无环图：**

在 `settings.gradle` 中添加监听器

```groovy
gradle.taskGraph.addTaskExecutionGraphListener(new TaskExecutionGraphListener() {
    @Override
    // 生成有向无环图
    void graphPopulated(TaskExecutionGraph taskExecutionGraph) {
        taskExecutionGraph.allTasks.forEach(task -> {
            // 核心逻辑:通过taskExecutionGraph获得所有的task
            taskExecutionGraph.allTasks.forEach(releaseTask -> {
                println "有向无环图:" + releaseTask.getProject().name + ":" + releaseTask.name
            })
        })
    }
})
```

测试：

```bash
./gradlew C -q

# 输出
有向无环图:subproject02:D
有向无环图:subproject02:C
有向无环图:subproject02:D
有向无环图:subproject02:C
```
