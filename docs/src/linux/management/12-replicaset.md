# ReplicaSet

## 概述

**ReplicaSet**（副本集）是一个Pod的集合。

ReplicaSet的主要作用是保证一定数量的pod正常运行，它会持续监听这些Pod的运行状态，一旦Pod发生故障，就会重启或重建。同时它还支持对pod数量的扩缩容和镜像版本的升降级。

![An image](/img/linux/management/13.png)

## 资源清单

`ReplicaSet` 的资源清单

```yaml
apiVersion: apps/v1 # 版本号
kind: ReplicaSet # 类型
metadata: # 元数据
  name: # rs名称
  namespace: # 所属命名空间
  labels: #标签
    controller: rs
spec: # 详情描述
  replicas: 3 # 副本数量
  selector: # 选择器，通过它指定该控制器管理哪些pod
    matchLabels: # Labels匹配规则
      app: nginx-pod
    matchExpressions: # Expressions匹配规则
      - { key: app, operator: In, values: [nginx-pod] }
  template: # 模板，当副本数量不足时，会根据下面的模板创建pod副本
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
        - name: nginx
          image: nginx:1.22
          ports:
            - containerPort: 80
```

需要新了解的配置项就是 `spec` 下面几个选项

- replicas：指定副本数量，其实就是当前rs创建出来的pod的数量，默认为1
- selector：选择器，它的作用是建立pod控制器和pod之间的关联关系，采用的Label Selector机制

在pod模板上定义 `label`，在控制器上定义选择器，就可以表明当前控制器能管理哪些 `pod` 了

- template：模板，就是当前控制器创建pod所使用的模板板，里面其实就是前一章学过的pod的定义

## 测试运行

创建 `pc-replicaset.yaml` 文件

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: pc-replicaset
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-pod
  template:
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
        - name: nginx
          image: nginx:1.22
```

测试运行

```sh
# 创建rs
kubectl create -f pc-replicaset.yaml

# 查看rs
# DESIRED：期望副本数量  
# CURRENT：当前副本数量  
# READY：已经准备好提供服务的副本数量
kubectl get rs pc-replicaset -o wide
# resp
NAME            DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES       SELECTOR
pc-replicaset   3         3         3       25s   nginx        nginx:1.22   app=nginx-pod

# 查看当前控制器创建出来的pod
# 这里发现控制器创建出来的pod的名称是在控制器名称后面拼接了-xxxxx随机码
kubectl get pod
# resp
NAME                  READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pc-replicaset-4vslf   1/1     Running   0          40s   10.244.2.30   node1   <none>           <none>
pc-replicaset-58g44   1/1     Running   0          40s   10.244.1.32   node2   <none>           <none>
pc-replicaset-p8rsv   1/1     Running   0          40s   10.244.2.29   node1   <none>           <none>
```

### 扩缩容

#### 命令行

```sh
# 使用scale命令实现扩缩容， 后面--replicas=n直接指定目标数量即可
kubectl scale rs pc-replicaset --replicas=5

# 命令运行完毕，立即查看，发现已经有5个
kubectl get pods
# resp
NAME                  READY   STATUS    RESTARTS   AGE
pc-replicaset-4vslf   1/1     Running   0          8m17s
pc-replicaset-58g44   1/1     Running   0          8m17s
pc-replicaset-fzfmr   1/1     Running   0          4s
pc-replicaset-mp664   1/1     Running   0          4s
pc-replicaset-p8rsv   1/1     Running   0          8m17s
```

#### 修改资源文件

```sh
# 还有通过资源文件来缩容
# 编辑rs的副本数量，修改spec:replicas: 2即可
kubectl edit rs pc-replicaset

# 查看pod
kubectl get pods
# resp
NAME                  READY   STATUS    RESTARTS   AGE
pc-replicaset-4vslf   1/1     Running   0          9m11s
pc-replicaset-p8rsv   1/1     Running   0          9m11s
```

### 镜像升级

#### 命令行

```sh
# kubectl set image rs rs名称 容器=镜像版本 -n namespace
kubectl set image rs pc-replicaset nginx=nginx:1.23

# 再次查看，发现镜像版本已经变更了
kubectl get rs -o wide
NAME            DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES       SELECTOR
pc-replicaset   2         2         2       11m   nginx        nginx:1.23   app=nginx-pod
```

#### 修改资源文件

```sh
# 同样的道理，也可以修改资源文件完成这个工作
# 编辑rs的容器镜像 - image: nginx:1.24
kubectl edit rs pc-replicaset

# 再次查看，发现镜像版本已经变更了
kubectl get rs -o wide
NAME            DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES       SELECTOR
pc-replicaset   2         2         2       11m   nginx        nginx:1.24   app=nginx-pod
```

### 删除

删除RS对象以及它管理的Pod

```sh
# 使用kubectl delete命令会删除此RS以及它管理的Pod
# 在kubernetes删除RS前，会将RS的replicasclear调整为0，等待所有的Pod被删除后，在执行RS对象的删除
kubectl delete rs pc-replicaset

# 查看pod
kubectl get pod -o wide
# resp
No resources found in default namespace.

# 也可以使用yaml直接删除(推荐)
kubectl delete -f pc-replicaset.yaml
```

仅仅删除RS对象（保留Pod）

```sh
# 如果希望仅仅删除RS对象（保留Pod），可以使用kubectl delete命令时添加--cascade=orphan选项（不推荐）。
kubectl delete rs pc-replicaset --cascade=orphan

# 查看pod
kubectl get pods
# resp
NAME                  READY   STATUS    RESTARTS   AGE
pc-replicaset-4vslf   1/1     Running   0          9m11s
pc-replicaset-p8rsv   1/1     Running   0          9m11s
```

> 删除所有pod
>
> ```sh
> kubectl delete po --all
> ```
