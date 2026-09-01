# Deployment

## 概述

为了更好的解决服务编排的问题，kubernetes在 `V1.2` 版本开始，引入了Deployment控制器。值得一提的是，这种控制器并不直接管理pod，而是通过管理ReplicaSet来简介管理Pod，即：Deployment管理ReplicaSet，ReplicaSet管理Pod。所以Deployment比ReplicaSet功能更加强大。

![An image](/img/linux/management/14.png)

主要功能有下面几个：

- 支持ReplicaSet的所有功能
- 支持发布的停止、继续
- 支持滚动升级和回滚版本

## 资源清单

`Deployment` 的资源清单

```sh
apiVersion: apps/v1 # 版本号
kind: Deployment # 类型
metadata: # 元数据
  name: # rs名称
  namespace: # 所属命名空间
  labels: #标签
    controller: deploy
spec: # 详情描述
  replicas: 3 # 副本数量
  revisionHistoryLimit: 3 # 保留历史版本
  paused: false # 暂停部署，默认是false
  progressDeadlineSeconds: 600 # 部署超时时间（s），默认是600
  strategy: # 策略
    type: RollingUpdate # 滚动更新策略
    rollingUpdate: # 滚动更新
      maxSurge: 30% # 最大额外可以存在的副本数，可以为百分比，也可以为整数
      maxUnavailable: 30% # 最大不可用状态的 Pod 的最大值，可以为百分比，也可以为整数
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

创建 `pc-deployment.yaml` 文件

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pc-deployment
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
# 创建deployment
kubectl create -f pc-deployment.yaml

# 查看deployment
# UP-TO-DATE 最新版本的pod的数量
# AVAILABLE  当前可用的pod的数量
kubectl get deploy pc-deployment
# resp
NAME            READY   UP-TO-DATE   AVAILABLE   AGE
pc-deployment   3/3     3            3           18s

# 查看rs
# 发现rs的名称是在原来deployment的名字后面添加了一个10位数的随机串
kubectl get rs
# resp
NAME                       DESIRED   CURRENT   READY   AGE
pc-deployment-65c6788674   3         3         3       33s

# 查看pod
kubectl get pods
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-65c6788674-5c8qt   1/1     Running   0          54s
pc-deployment-65c6788674-ctx4r   1/1     Running   0          54s
pc-deployment-65c6788674-kkq8l   1/1     Running   0          54s
```

### 扩缩容

#### 命令行

```sh
# 变更副本数量为5个
kubectl scale deploy pc-deployment --replicas=5

# 查看deployment
kubectl get deploy pc-deployment
# resp
NAME            READY   UP-TO-DATE   AVAILABLE   AGE
pc-deployment   5/5     5            5           4m23s

# 查看pod
kubectl get pods
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-65c6788674-5c8qt   1/1     Running   0          4m16s
pc-deployment-65c6788674-ctx4r   1/1     Running   0          4m16s
pc-deployment-65c6788674-d5gpc   1/1     Running   0          2s
pc-deployment-65c6788674-kkq8l   1/1     Running   0          4m16s
pc-deployment-65c6788674-mlr72   1/1     Running   0          2s
```

#### 资源文件

```sh
# 编辑deployment的副本数量，修改spec:replicas: 4即可
kubectl edit deploy pc-deployment

# 查看deployment
kubectl get deploy pc-deployment
# resp
NAME            READY   UP-TO-DATE   AVAILABLE   AGE
pc-deployment   4/4     4            4           4m51s

# 查看pod
kubectl get pods
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-65c6788674-5c8qt   1/1     Running   0          4m54s
pc-deployment-65c6788674-ctx4r   1/1     Running   0          4m54s
pc-deployment-65c6788674-kkq8l   1/1     Running   0          4m54s
pc-deployment-65c6788674-mlr72   1/1     Running   0          40s
```

### 镜像更新

deployment支持两种更新策略：重建更新和滚动更新，可以通过strategy指定策略类型，支持两个属性

- strategy：指定新的Pod替换旧的Pod的策略， 支持两个属性
  - type：指定策略类型，支持两种策略
    - Recreate：在创建出新的Pod之前会先杀掉所有已存在的Pod
    - RollingUpdate：滚动更新，就是杀死一部分，就启动一部分，在更新过程中，存在两个版本Pod
  - rollingUpdate：当type为RollingUpdate时生效，用于为RollingUpdate设置参数，支持两个属性：
    - maxUnavailable：用来指定在升级过程中不可用Pod的最大数量，默认为25%。
    - maxSurge: 用来指定在升级过程中可以超过期望的Pod的最大数量，默认为25%。

#### 重建更新

编辑`pc-deployment.yaml`，在spec节点下添加更新策略

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pc-deployment
  namespace: default
spec:
  strategy: # 策略
    type: Recreate # 重建更新
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
# 变更镜像
kubectl set image deployment pc-deployment nginx=nginx:1.23

# 观察升级过程
kubectl get po -w
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-65c6788674-t7q8r   1/1     Terminating   0          27s
pc-deployment-65c6788674-p4hsg   1/1     Terminating   0          27s
pc-deployment-65c6788674-7lqvm   1/1     Terminating   0          27s

pc-deployment-74c97f567f-jhhhl   0/1     Pending       0          0s
pc-deployment-74c97f567f-9wzwr   0/1     Pending       0          0s
pc-deployment-74c97f567f-4grs7   0/1     Pending       0          0s

pc-deployment-74c97f567f-jhhhl   0/1     ContainerCreating   0          0s
pc-deployment-74c97f567f-9wzwr   0/1     ContainerCreating   0          0s
pc-deployment-74c97f567f-4grs7   0/1     ContainerCreating   0          0s

pc-deployment-74c97f567f-9wzwr   1/1     Running             0          1s
pc-deployment-74c97f567f-4grs7   1/1     Running             0          1s
pc-deployment-74c97f567f-jhhhl   1/1     Running             0          1s
```

#### 滚动更新

编辑 `pc-deployment.yaml`，在 `spec` 节点下添加更新策略

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pc-deployment
  namespace: default
spec:
  strategy: # 策略
    type: RollingUpdate # 滚动更新策略
    rollingUpdate: # 滚动更新
      maxSurge: 30% # 最大额外可以存在的副本数，可以为百分比，也可以为整数
      maxUnavailable: 30% # 最大不可用状态的 Pod 的最大值，可以为百分比，也可以为整数
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
# 变更镜像
kubectl set image deployment pc-deployment nginx=nginx:1.23

# 观察升级过程
kubectl get po -w
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-966bf7f44-226rx   0/1     Pending             0          0s
pc-deployment-966bf7f44-226rx   0/1     ContainerCreating   0          0s
pc-deployment-966bf7f44-226rx   1/1     Running             0          1s
pc-deployment-c848d767-h4p68    0/1     Terminating         0          34m

pc-deployment-966bf7f44-cnd44   0/1     Pending             0          0s
pc-deployment-966bf7f44-cnd44   0/1     ContainerCreating   0          0s
pc-deployment-966bf7f44-cnd44   1/1     Running             0          2s
pc-deployment-c848d767-hlmz4    0/1     Terminating         0          34m

pc-deployment-966bf7f44-px48p   0/1     Pending             0          0s
pc-deployment-966bf7f44-px48p   0/1     ContainerCreating   0          0s
pc-deployment-966bf7f44-px48p   1/1     Running             0          0s
pc-deployment-c848d767-8rbzt    0/1     Terminating         0          34m

pc-deployment-966bf7f44-dkmqp   0/1     Pending             0          0s
pc-deployment-966bf7f44-dkmqp   0/1     ContainerCreating   0          0s
pc-deployment-966bf7f44-dkmqp   1/1     Running             0          2s
pc-deployment-c848d767-rrqcn    0/1     Terminating         0          34m
```

滚动更新的过程

![An image](/img/linux/management/19.png)

镜像更新中rs的变化

```sh
# 查看rs,发现原来的rs的依旧存在，只是pod数量变为了0，而后又新产生了一个rs，pod数量为3
# 其实这就是deployment能够进行版本回退的奥妙所在，后面会详细解释
kubectl get rs
# resp
NAME                       DESIRED   CURRENT   READY   AGE
pc-deployment-65c6788674   0         0         0       119s
pc-deployment-74c97f567f   3         3         3       111s
```

#### 版本回退

deployment支持版本升级过程中的暂停、继续功能以及版本回退等诸多功能，下面具体来看。

- `kubectl rollout`： 版本升级相关功能，支持下面的选项：
  - `status`： 显示当前升级状态
  - `history`： 显示 升级历史记录
  - `pause`： 暂停版本升级过程
  - `resume`： 继续已经暂停的版本升级过程
  - `restart`： 重启版本升级过程
  - `undo`： 回滚到上一级版本（可以使用–to-revision回滚到指定版本）

```sh
# 查看当前升级版本的状态
kubectl rollout status deploy pc-deployment
# resp
deployment "pc-deployment" successfully rolled out

# 查看升级历史记录
kubectl rollout history deploy pc-deployment
# 可以发现有3次版本记录，说明完成过2次升级
deployment.apps/pc-deployment 
REVISION  CHANGE-CAUSE
# nginx:1.22
1         <none>
# nginx:1.23
2         <none>
# nginx:1.24
3         <none>

# 查看历史版本信息
kubectl rollout history deploy pc-deployment --revision=1
# resp
deployment.apps/pc-deployment with revision #1
Pod Template:
  Labels:       app=nginx-pod
        pod-template-hash=65c6788674
  Containers:
   nginx:
    Image:      nginx:1.22
    Port:       <none>
    Host Port:  <none>
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>

# 版本回滚
# 这里直接使用--to-revision=1回滚到了1版本， 如果省略这个选项，就是回退到上个版本，就是2版本
kubectl rollout undo deployment pc-deployment --to-revision=1


# 查看发现，通过nginx镜像版本可以发现到了第一版
kubectl get deploy -o wide
# resp
NAME            READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES       SELECTOR
pc-deployment   3/3     3            3           11m   nginx        nginx:1.22   app=nginx-pod

# 查看rs，发现65c6788674的rs中有3个pod运行，其他两个版本的rs中0个pod为运行
# 其实deployment之所以可是实现版本的回滚，就是通过记录下历史rs来实现的，
# 一旦想回滚到哪个版本，只需要将当前版本pod数量降为0，然后将回滚版本的pod提升为目标数量就可以了
kubectl get rs
# resp
NAME                       DESIRED   CURRENT   READY   AGE
pc-deployment-5979c6bddd   0         0         0       4m26s
pc-deployment-65c6788674   3         3         3       11m
pc-deployment-74c97f567f   0         0         0       11m
```

## 金丝雀发布

金丝雀部署（canary deployment）也被称为灰度发布。

早期，工人下矿井之前会放入一只金丝雀检测井下是否存在有毒气体。采用金丝雀部署，你可以在生产环境的基础设施中小范围的部署新的应用代码。一旦应用签署发布，只有少数用户被路由到它，最大限度的降低影响。如果没有错误发生，则将新版本逐渐推广到整个基础设施。

![An image](/img/linux/management/20.png)

### 部署过程

![An image](/img/linux/management/21.png)

### 实现方式

Deployment控制器支持控制更新过程中的控制，如 暂停（pause） 或 继续（resume）更新操作。

比如有一批新的Pod资源创建完成后立即暂停更新过程，此时，仅存在一部分新版本的应用，主体部分还是旧的版本。然后，再筛选一小部分的用户请求路由到新版本的Pod应用，继续观察能否稳定地按期望的方式运行。确定没问题之后再继续完成余下的Pod资源滚动更新，否则立即回滚更新操作。

### 局限性

按照 Kubernetes 默认支持的这种方式进行金丝雀发布，有一定的局限性

- 不能根据用户注册时间、地区等请求中的内容属性进行流量分配
- 同一个用户如果多次调用该 Service，有可能第一次请求到了旧版本的 Pod，第二次请求到了新版本的 Pod

在 Kubernetes 中不能解决上述局限性的原因是：Kubernetes Service 只在 TCP 层面解决负载均衡的问题，并不对请求响应的消息内容做任何解析和识别。如果想要更完善地实现金丝雀发布，可以考虑 `Istio` 灰度发布。

### pause

```sh
# 更新deployment的版本并且配置暂停deployment
kubectl set image deploy pc-deployment nginx=nginx:1.25 && kubectl rollout pause deployment pc-deployment
# resp
deployment.apps/pc-deployment image updated
deployment.apps/pc-deployment paused

#观察更新状态
kubectl rollout status deploy pc-deployment
Waiting for deployment "pc-deployment" rollout to finish: 1 out of 3 new replicas have been updated...

# 监控更新的过程，可以看到已经新增了一个资源，但是并未按照预期的状态去删除一个旧的资源，就是因为使用了pause暂停命令
kubectl get rs -o wide
# resp
NAME                       DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES       SELECTOR
pc-deployment-65c6788674   3         3         3       93s   nginx        nginx:1.22   app=nginx-pod,pod-template-hash=65c6788674
pc-deployment-669b59965c   1         1         1       40s   nginx        nginx:1.25   app=nginx-pod,pod-template-hash=669b59965c

kubectl get po
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-65c6788674-7nvbw   1/1     Running   0          83s
pc-deployment-65c6788674-8sfgf   1/1     Running   0          83s
pc-deployment-65c6788674-n9pjk   1/1     Running   0          83s
pc-deployment-669b59965c-6zn7l   1/1     Running   0          30s
```

### resume

```sh
# 确保更新的pod没问题了，继续更新
kubectl rollout resume deploy pc-deployment
# resp
deployment.apps/pc-deployment resumed

# 查看最后的更新情况
kubectl get rs -o wide
# resp
NAME                       DESIRED   CURRENT   READY   AGE     CONTAINERS   IMAGES       SELECTOR
pc-deployment-65c6788674   0         0         0       2m51s   nginx        nginx:1.22   app=nginx-pod,pod-template-hash=65c6788674
pc-deployment-669b59965c   3         3         3       118s    nginx        nginx:1.25   app=nginx-pod,pod-template-hash=669b59965c

kubectl get pod
# resp
NAME                             READY   STATUS    RESTARTS   AGE
pc-deployment-669b59965c-6zn7l   1/1     Running   0          2m13s
pc-deployment-669b59965c-cb7qx   1/1     Running   0          42s
pc-deployment-669b59965c-zclwg   1/1     Running   0          45s
```
