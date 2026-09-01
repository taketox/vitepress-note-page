# DaemonSet

## 概述

DaemonSet类型的控制器可以保证在集群中的每一台（或指定）节点上都运行一个副本。一般适用于日志收集、节点监控等场景。也就是说，如果一个Pod提供的功能是节点级别的（每个节点都需要且只需要一个），那么这类Pod就适合使用DaemonSet类型的控制器创建。

![An image](/img/linux/management/16.png)

DaemonSet控制器的特点：

- 每当向集群中添加一个节点时，指定的 Pod 副本也将添加到该节点上
- 当节点从集群中移除时，Pod 也就被垃圾回收了

## 资源清单

`DaemonSet`的资源清单

```yaml
apiVersion: apps/v1 # 版本号
kind: DaemonSet # 类型
metadata: # 元数据
  name: # rs名称
  namespace: # 所属命名空间
  labels: #标签
    controller: daemonset
spec: # 详情描述
  revisionHistoryLimit: 3 # 保留历史版本
  updateStrategy: # 更新策略
    type: RollingUpdate # 滚动更新策略
    rollingUpdate: # 滚动更新
      maxUnavailable: 1 # 最大不可用状态的 Pod 的最大值，可以为百分比，也可以为整数
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

## 测试运行

创建`pc-daemonset.yaml` 文件

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: pc-daemonset
  namespace: default
spec:
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

运行测试

```sh
# 创建daemonset
kubectl create -f  pc-daemonset.yaml

# 查看daemonset
kubectl get ds -o wide
# resp
NAME           DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE   CONTAINERS   IMAGES       SELECTOR
pc-daemonset   2         2         2       2            2           <none>          15s   nginx        nginx:1.22   app=nginx-pod

# 查看pod,发现在每个Node上都运行一个pod
kubectl get pods -o wide
# resp
NAME                 READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pc-daemonset-6k4vx   1/1     Running   0          53s   10.244.1.64   node2   <none>           <none>
pc-daemonset-9zph4   1/1     Running   0          53s   10.244.2.56   node1   <none>           <none>   

# 删除daemonset
kubectl delete -f pc-daemonset.yaml
```
