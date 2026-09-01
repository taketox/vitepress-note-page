# 工作负载资源

在kubernetes中，Pod是kubernetes的最小管理单元，按照pod的创建方式可以将其分为两类

- 自主式pod：kubernetes直接创建出来的Pod，这种pod删除后就没有了，也不会重建
- 控制器创建的pod：kubernetes通过控制器创建的pod，这种pod删除了之后还会自动重建

在kubernetes中，有很多类型的工作负载资源，每种都有自己的适合的场景，常见的有下面这些

- `ReplicationController`：比较原始的pod控制器，已经被废弃，由ReplicaSet替代
- `ReplicaSet`：保证副本数量一直维持在期望值，并支持pod数量扩缩容，镜像版本升级
- `Deployment`：通过控制ReplicaSet来控制Pod，并支持滚动升级、回退版本
- `Horizontal Pod Autoscaler`：可以根据集群负载自动水平调整Pod的数量，实现削峰填谷
- `DaemonSet`：在集群中的指定Node上运行且仅运行一个副本，一般用于守护进程类的任务
- `Job`：它创建出来的pod只要完成任务就立即退出，不需要重启或重建，用于执行一次性任务
- `Cronjob`：它创建的Pod负责周期性任务控制，不需要持续后台运行
- `StatefulSet`：管理有状态应用

## [ReplicaSet](/linux/management/replicaset/)

**ReplicaSet**（副本集）是一个Pod的集合。

ReplicaSet的主要作用是保证一定数量的pod正常运行，它会持续监听这些Pod的运行状态，一旦Pod发生故障，就会重启或重建。同时它还支持对pod数量的扩缩容和镜像版本的升降级。

![An image](/img/linux/management/13.png)

## [Deployment](/linux/management/deployment/)

**Deployment**是对ReplicaSet和Pod更高级的抽象。

Deployment并不直接管理pod，而是通过管理ReplicaSet来简介管理Pod，即：Deployment管理ReplicaSet，ReplicaSet管理Pod。所以Deployment比ReplicaSet功能更加强大。

Deployment主要功能

- 支持ReplicaSet的所有功能
- 支持发布的停止、继续
- 支持滚动升级和回滚版本

![An image](/img/linux/management/14.png)

## [Horizontal Pod Autoscaler](/linux/management/hpa/)

Kubernetes期望可以实现通过监测Pod的使用情况，实现pod数量的自动调整，于是就产生了Horizontal Pod Autoscaler（HPA）。

Horizontal Pod Autoscaler可以获取每个Pod利用率，然后和HPA中定义的指标进行对比，同时计算出需要伸缩的具体值，最后实现Pod的数量的调整。其实Horizontal Pod Autoscaler与之前的Deployment一样，也属于一种Kubernetes资源对象，它通过追踪分析RC控制的所有目标Pod的负载变化情况，来确定是否需要针对性地调整目标Pod的副本数，这是HPA的实现原理。

![An image](/img/linux/management/15.png)

## [DaemonSet](/linux/management/daemonset/)

DaemonSet类型的控制器可以保证在集群中的每一台（或指定）节点上都运行一个副本。一般适用于日志收集、节点监控等场景。也就是说，如果一个Pod提供的功能是节点级别的（每个节点都需要且只需要一个），那么这类Pod就适合使用DaemonSet类型的控制器创建。

DaemonSet的特点

- 每当向集群中添加一个节点时，指定的 Pod 副本也将添加到该节点上
- 当节点从集群中移除时，Pod 也就被垃圾回收了

![An image](/img/linux/management/16.png)

## [Job](/linux/management/job/)

Job，主要用于负责批量处理（一次要处理指定数量任务）短暂的一次性（每个任务仅运行一次就结束）任务。

Job的特点

- 当Job创建的pod执行成功结束时，Job将记录成功结束的pod数量
- 当成功结束的pod达到指定的数量时，Job将完成执行

![An image](/img/linux/management/17.png)

## [Cronjob](/linux/management/cronjob/)

CronJob控制器以 Job控制器资源为其管控对象，并借助它管理pod资源对象，Job控制器定义的作业任务在其控制器资源创建之后便会立即执行，但CronJob可以以类似于Linux操作系统的周期性任务作业计划的方式控制其运行时间点及重复运行的方式。也就是说，CronJob可以在特定的时间点(反复的)去运行job任务。

![An image](/img/linux/management/18.png)

## StatefulSet

StatefulSet 是用来管理有状态应用的工作负载 API 对象。

StatefulSet 用来管理某 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 集合的部署和扩缩， 并为这些 Pod 提供持久存储和持久标识符。

和 [Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/) 类似， StatefulSet 管理基于相同容器规约的一组 Pod。但和 Deployment 不同的是， StatefulSet 为它们的每个 Pod 维护了一个有粘性的 ID。这些 Pod 是基于相同的规约来创建的， 但是不能相互替换：无论怎么调度，每个 Pod 都有一个永久不变的 ID。

如果希望使用存储卷为工作负载提供持久存储，可以使用 StatefulSet 作为解决方案的一部分。 尽管 StatefulSet 中的单个 Pod 仍可能出现故障， 但持久的 Pod 标识符使得将现有卷与替换已失败 Pod 的新 Pod 相匹配变得更加容易。
