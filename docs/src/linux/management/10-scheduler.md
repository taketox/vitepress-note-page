# 资源调度

在默认情况下，一个Pod在哪个Node节点上运行，是由Scheduler组件采用相应的算法计算出来的，这个过程是不受人工控制的。

但是在实际使用中，这并不满足的需求，因为很多情况下，我们想控制某些Pod到达某些节点上，那么应该怎么做呢？这就要求了解kubernetes对Pod的调度规则。

kubernetes提供了四大类调度方式：

- 自动调度：运行在哪个节点上完全由Scheduler经过一系列的算法计算得出
- 定向调度：`NodeName`、`NodeSelector`
- 亲和性调度：`NodeAffinity`、`PodAffinity`、`PodAntiAffinity`
- 污点（容忍）调度：`Taints`、`Toleration`

## 定向调度

定向调度，指的是利用在pod上声明 `nodeName` 或者 `nodeSelector`，以此将Pod调度到期望的node节点上。

> 这里的调度是强制的，这就意味着即使要调度的目标Node不存在，也会向上面进行调度，只不过pod运行失败而已。

### NodeName

`NodeName`用于强制约束将Pod调度到指定的Name的Node节点上。

这种方式，其实是直接跳过Scheduler的调度逻辑，直接将Pod调度到指定名称的节点。

创建 `pod-nodename.yaml` 文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nodename
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  nodeName: node1 # 指定调度到node1节点上
```

测试运行

```sh
# 创建Pod
kubectl create -f pod-nodename.yaml

#查看Pod调度到NODE属性，确实是调度到了node1节点上
kubectl get pods pod-nodename -o wide
# resp
NAME           READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-nodename   1/1     Running   0          20s   10.244.2.24   node1   <none>           <none>

# 接下来，删除pod，修改nodeName的值为node3（并没有node3节点）

# 再次查看，发现已经向Node3节点调度，但是由于不存在node3节点，所以pod无法正常运行
kubectl get pods pod-nodename -n dev -o wide
NAME           READY   STATUS    RESTARTS   AGE   IP       NODE    NOMINATED NODE   READINESS GATES
pod-nodename   0/1     Pending   0          18s   <none>   node3   <none>           <none>  
```

### NodeSelector

`NodeSelector`用于将pod调度到添加了指定 `标签` 的node节点上。

它是通过 `kubernetes` 的 `label-selector` 机制实现的，也就是说，在pod创建之前，会由 `scheduler` 使用 `MatchNodeSelector` 调度策略进行 `label` 匹配，找出目标 `node`，然后将 `pod` 调度到目标节点，该匹配规则是强制约束。

首先分别为node节点添加标签

```sh
# node1 添加标签 nodeenv=pro
kubectl label nodes node1 nodeenv=prod

# node1 添加标签 nodeenv=test
kubectl label nodes node2 nodeenv=test
```

创建一个 `pod-nodeselector.yaml` 文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nodeselector
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  nodeSelector:
    nodeenv: prod # 指定调度到具有nodeenv=pro标签的节点上
```

运行测试

```sh
# 创建Pod
kubectl create -f pod-nodeselector.yaml

# 看Pod调度到NODE属性，确实是调度到了node1节点上
kubectl get pods pod-nodeselector -o wide
NAME               READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-nodeselector   1/1     Running   0          22s   10.244.2.25   node1   <none>           <none>

# 接下来，删除pod，修改nodeSelector的值为nodeenv: xxxx（不存在打有此标签的节点）

# 查看详情，发现node selector匹配失败的提示
kubectl get pods -n dev -o wide
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  83s   default-scheduler  0/3 nodes are available: 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }, 2 node(s) didn't match Pod's node affinity/selector. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling..
```

## 亲和性调度

以上两种定向调度的方式，使用起来非常方便，但是也有一定的问题，那就是如果没有满足条件的Node，那么Pod将不会被运行，即使在集群中还有可用Node列表也不行，这就限制了它的使用场景。

基于上面的问题，`kubernetes` 还提供了一种亲和性调度（Affinity）。它在 `NodeSelector` 的基础之上的进行了扩展，可以通过配置的形式，实现优先选择满足条件的Node进行调度，如果没有，也可以调度到不满足条件的节点上，使调度更加灵活。

Affinity主要分为三类：

- `nodeAffinity`(node亲和性)：以node为目标，解决pod可以调度到哪些node的问题

- `podAffinity`(pod亲和性)：以pod为目标，解决pod可以和哪些已存在的pod部署在同一个拓扑域中的问题
- `podAntiAffinity`(pod反亲和性)：以pod为目标，解决pod不能和哪些已存在pod部署在同一个拓扑域中的问题

关于亲和性(反亲和性)使用场景的说明

- 亲和性：如果两个应用频繁交互，那就有必要利用亲和性让两个应用的尽可能的靠近，这样可以减少因网络通信而带来的性能损耗。

- 反亲和性：当应用的采用多副本部署时，有必要采用反亲和性让各个应用实例打散分布在各个node上，这样可以提高服务的高可用性。

### NodeAffinity

`pod.spec.affinity.nodeAffinity`的可配置项

- `requiredDuringSchedulingIgnoredDuringExecution` ：Node节点必须满足指定的所有规则才可以，相当于硬限制
  - `nodeSelectorTerms`：节点选择列表
    - `matchFields`：按节点字段列出的节点选择器要求列表
    - `matchExpressions`：按节点标签列出的节点选择器要求列表(推荐)
      - `key`：键
      - `values`：值
      - `operator`：关系符 支持Exists, DoesNotExist, In, NotIn, Gt, Lt
- `preferredDuringSchedulingIgnoredDuringExecution`：优先调度到满足指定的规则的Node，相当于软限制 (倾向)
  - `preference`：一个节点选择器项，与相应的权重相关联
    - `matchFields`：按节点字段列出的节点选择器要求列表
    - `matchExpressions`：按节点标签列出的节点选择器要求列表(推荐)
      - `key`：键
      - `values`：值
      - `operator`：关系符 支持In, NotIn, Exists, DoesNotExist, Gt, Lt
  - `weight`：倾向权重，在范围1-100。

关系符的使用说明

```yaml
- matchExpressions:
    - key: nodeenv # 匹配存在标签的key为nodeenv的节点
      operator: Exists
    - key: nodeenv # 匹配标签的key为nodeenv,且value是"xxx"或"yyy"的节点
      operator: In
      values: ["xxx", "yyy"]
    - key: nodeenv # 匹配标签的key为nodeenv,且value大于"xxx"的节点
      operator: Gt
      values: "xxx"
```

#### requiredDuringSchedulingIgnoredDuringExecution

创建`pod-nodeaffinity-required.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nodeaffinity-required
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  affinity: #亲和性设置
    nodeAffinity: #设置node亲和性
      requiredDuringSchedulingIgnoredDuringExecution: # 硬限制
        nodeSelectorTerms:
          - matchExpressions: # 匹配env的值在["xxx","yyy"]中的标签
              - key: nodeenv
                operator: In
                values: ["xxx", "yyy"]
```

测试运行

```sh
# 创建pod
kubectl create -f pod-nodeaffinity-required.yaml

# 查看pod状态 （运行失败）
kubectl get po pod-nodeaffinity-required -o wide
# resp
NAME                        READY   STATUS    RESTARTS   AGE   IP       NODE     NOMINATED NODE   READINESS GATES
pod-nodeaffinity-required   0/1     Pending   0          33s   <none>   <none>   <none>           <none>

# 发现调度失败，提示node选择失败
kubectl describe pod pod-nodeaffinity-required 
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  101s  default-scheduler  0/3 nodes are available: 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }, 2 node(s) didn't match Pod's node affinity/selector. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling..
  
# 停止pod，将["xxx", "yyy"]改为["prod", "test"]，重新创建Pod

# 此时查看，发现调度成功，已经将pod调度到了node1上
kubectl get po pod-nodeaffinity-required -o wide
# resp
NAME                        READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-nodeaffinity-required   1/1     Running   0          26s   10.244.2.26   node1   <none>           <none>
```

#### preferredDuringSchedulingIgnoredDuringExecution

创建`pod-nodeaffinity-preferred.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nodeaffinity-preferred
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  affinity: #亲和性设置
    nodeAffinity: #设置node亲和性
      preferredDuringSchedulingIgnoredDuringExecution: # 软限制
        - weight: 1
          preference:
            matchExpressions: # 匹配env的值在["xxx","yyy"]中的标签(当前环境没有)
              - key: nodeenv
                operator: In
                values: ["xxx", "yyy"]
```

测试运行

```sh
# 创建pod
kubectl create -f pod-nodeaffinity-preferred.yaml

# 查看pod状态 （运行成功）
kubectl get po pod-nodeaffinity-preferred -o wide
# resp
NAME                         READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-nodeaffinity-preferred   1/1     Running   0          23s   10.244.1.30   node2   <none>           <none>
```

#### 注意事项

1. 如果同时定义了 `nodeSelector` 和 `nodeAffinity`，那么必须两个条件都得到满足，Pod才能运行在指定的Node上
2. 如果nodeAffinity指定了多个 `nodeSelectorTerms`，那么只需要其中一个能够匹配成功即可
3. 如果一个 `nodeSelectorTerms` 中有多个 `matchExpressions` ，则一个节点必须满足所有的才能匹配成功
4. 如果一个 `pod` 所在的 `Node` 在 `Pod` 运行期间其标签发生了改变，不再符合该 `Pod` 的节点亲和性需求，则系统将忽略此变化

### PodAffinity

PodAffinity主要实现以运行的Pod为参照，实现让新创建的Pod跟参照pod在一个区域的功能。

`pod.spec.affinity.podAffinity` 可配置项

- `requiredDuringSchedulingIgnoredDuringExecution`：硬限制
  - `namespaces`：指定参照pod的namespace
  - `topologyKey`：指定调度作用域
  - `labelSelector`：标签选择器
    - `matchExpressions`：按节点标签列出的节点选择器要求列表(推荐)
      - `key`：键
      - `values`：值
      - `operator`：关系符 支持In, NotIn, Exists, DoesNotExist.
      - `matchLabels`：指多个matchExpressions映射的内容
- `preferredDuringSchedulingIgnoredDuringExecution`：软限制
  - `podAffinityTerm`：选项
    - `namespaces`
    - `topologyKey`
    - `labelSelector`
      - `matchExpressions`
        - `key`：键
        - `values`：值
        - `operator`
      - `matchLabels`
  - `weight`：倾向权重，在范围1-100

`topologyKey`用于指定调度时作用域

- 如果指定为 `kubernetes.io/hostname`，那就是以Node节点为区分范围
- 如果指定为 `beta.kubernetes.io/os`，则以Node节点的操作系统类型来区分

#### requiredDuringSchedulingIgnoredDuringExecution

首先创建一个参照Pod，`pod-podaffinity-target.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-podaffinity-target
  namespace: default
  labels:
    podenv: prod #设置标签
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  nodeName: node1 # 将目标pod名确指定到node1上
```

测试运行

```sh
# 创建Pod
kubectl delete -f pod-nodeaffinity-preferred.yaml

# 查看pod状况
kubectl get po pod-podaffinity-target -o wide
# resp
NAME                     READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-podaffinity-target   1/1     Running   0          22s   10.244.2.27   node1   <none>           <none>
```

创建`pod-podaffinity-required.yaml`

```sh
apiVersion: v1
kind: Pod
metadata:
  name: pod-podaffinity-required
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  affinity: #亲和性设置
    podAffinity: #设置pod亲和性
      requiredDuringSchedulingIgnoredDuringExecution: # 硬限制
        - labelSelector:
            matchExpressions: # 匹配env的值在["xxx","yyy"]中的标签
              - key: podenv
                operator: In
                values: ["xxx", "yyy"]
          topologyKey: kubernetes.io/hostname
```

> 上面配置表达的意思是：
>
> 新Pod必须要与拥有标签nodeenv=xxx或者nodeenv=yyy的pod在同一Node上，显然现在没有这样pod，接下来，运行测试一下。

测试运行

```sh
# 启动pod
kubectl create -f pod-podaffinity-required.yaml


# 查看pod状态，发现未运行
kubectl get po
# resp
NAME                       READY   STATUS    RESTARTS   AGE
pod-podaffinity-required   0/1     Pending   0          4s
pod-podaffinity-target     1/1     Running   0          2m1s

# 查看详细信息
kubectl describe pods pod-podaffinity-required
#resp
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  59s   default-scheduler  0/3 nodes are available: 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }, 2 node(s) didn't match pod affinity rules. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling..

# 接下来修改  values: ["xxx","yyy"]----->values:["prod","yyy"]
# 意思是：新Pod必须要与拥有标签nodeenv=xxx或者nodeenv=yyy的pod在同一Node上

# 重建pod，发现此时Pod运行正常
kubectl get pod
# resp
NAME                       READY   STATUS    RESTARTS   AGE
pod-podaffinity-required   1/1     Running   0          32s
pod-podaffinity-target     1/1     Running   0          6m13s
```

### PodAntiAffinity

`PodAntiAffinity`主要实现以运行的Pod为参照，让新创建的Pod跟参照pod不在一个区域中的功能。

它的配置方式和选项跟 `PodAffinty` 是一样的，这里不再做详细解释，直接做一个测试案例。

继续使用上个案例中目标pod

创建 `pod-podantiaffinity-required.yaml`

```sh
apiVersion: v1
kind: Pod
metadata:
  name: pod-podantiaffinity-required
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  affinity: #亲和性设置
    podAntiAffinity: #设置pod亲和性
      requiredDuringSchedulingIgnoredDuringExecution: # 硬限制
        - labelSelector:
            matchExpressions: # 匹配podenv的值在["pro"]中的标签
              - key: podenv
                operator: In
                values: ["prod"]
          topologyKey: kubernetes.io/hostname
```

> 上面配置表达的意思是：
>
> 新Pod必须要与拥有标签nodeenv=pro的pod不在同一Node上，运行测试一下。

测试运行

```sh
# 创建pod
kubectl create -f pod-podantiaffinity-required.yaml

# 查看pod，发现调度到了node2上
kubectl get po pod-podantiaffinity-required -o wide
# resp
NAME                           READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod-podantiaffinity-required   1/1     Running   0          86s   10.244.1.31   node2   <none>           <none>
```

## 污点和容忍

### 污点（Taints）

前面的调度方式都是站在Pod的角度上，通过在Pod上添加属性，来确定Pod是否要调度到指定的Node上，其实我们也可以站在Node的角度上，通过在Node上添加污点属性，来决定是否允许Pod调度过来。

Node被设置上污点之后就和Pod之间存在了一种相斥的关系，进而拒绝Pod调度进来，甚至可以将已经存在的Pod驱逐出去。

污点的格式为：`key=value:effect`，`key` 和 `value` 是污点的标签，`effect` 描述污点的作用，支持如下三个选项：

- `PreferNoSchedule`：kubernetes将尽量避免把Pod调度到具有该污点的Node上，除非没有其他节点可调度
- `NoSchedule`：kubernetes将不会把Pod调度到具有该污点的Node上，但不会影响当前Node上已存在的Pod
- `NoExecute`：kubernetes将不会把Pod调度到具有该污点的Node上，同时也会将Node上已存在的Pod驱离

![An image](/img/linux/management/11.png)

使用kubectl设置和去除污点的命令示例：

```sh
# 设置污点
kubectl taint nodes node1 key=value:effect

# 去除污点
kubectl taint nodes node1 key:effect

# 去除所有污点
kubectl taint nodes node1 key
```

接下来，演示下污点的效果：

1. 准备节点node1（为了演示效果更加明显，暂时停止node2节点）
2. 为node1节点设置一个污点: tag=heima:PreferNoSchedule；然后创建pod1( pod1 可以 )
3. 修改为node1节点设置一个污点: tag=heima:NoSchedule；然后创建pod2( pod1 正常 pod2 失败 )
4. 修改为node1节点设置一个污点: tag=heima:NoExecute；然后创建pod3 ( 3个pod都失败 )

```sh
# 为node1设置污点(PreferNoSchedule)
kubectl taint nodes node1 tag=heima:PreferNoSchedule

# 创建pod1
kubectl run taint1 --image=nginx:1.22

# 查看状态
kubectl get pods -o wide
# resp
NAME                      READY   STATUS    RESTARTS   AGE     IP           NODE   
taint1-7665f7fd85-574h4   1/1     Running   0          2m24s   10.244.1.59   node1    

# 为node1设置污点(取消PreferNoSchedule，设置NoSchedule)
# 取消PreferNoSchedule
kubectl taint nodes node1 tag:PreferNoSchedule
# 设置NoSchedule
kubectl taint nodes node1 tag=heima:NoSchedule

# 创建pod2
kubectl run taint2 --image=nginx:1.22

# 查看状态
kubectl get pods taint2 -o wide
# resp
NAME                      READY   STATUS    RESTARTS   AGE     IP            NODE
taint1-7665f7fd85-574h4   1/1     Running   0          2m24s   10.244.1.59   node1 
taint2-544694789-6zmlf    0/1     Pending   0          21s     <none>        <none>   

# 为node1设置污点(取消NoSchedule，设置NoExecute)
# 取消NoSchedule
kubectl taint nodes node1 tag:NoSchedule
# 设置NoExecute
kubectl taint nodes node1 tag=heima:NoExecute

# 创建pod3
kubectl run taint3 --image=nginx:1.22

# 查看状态
kubectl get pods -o wide
# resp
NAME                      READY   STATUS    RESTARTS   AGE   IP       NODE     NOMINATED 
taint1-7665f7fd85-htkmp   0/1     Pending   0          35s   <none>   <none>   <none>    
taint2-544694789-bn7wb    0/1     Pending   0          35s   <none>   <none>   <none>     
taint3-6d78dbd749-tktkq   0/1     Pending   0          6s    <none>   <none>   <none>     
```

>使用kubeadm搭建的集群，默认就会给master节点添加一个污点标记,所以pod就不会调度到master节点上.

### 容忍（Toleration）

上面介绍了污点的作用，我们可以在node上添加污点用于拒绝pod调度上来，但是如果就是想将一个pod调度到一个有污点的node上去，这时候应该怎么做呢？这就要使用到容忍。

![An image](/img/linux/management/12.png)

>污点就是拒绝，容忍就是忽略，Node通过污点拒绝pod调度上去，Pod通过容忍忽略拒绝

1. 上一小节，已经在node1节点上打上了NoExecute的污点，此时pod是调度不上去的
2. 本小节，可以通过给pod添加容忍，然后将其调度上去

创建`pod-toleration.yaml`，内容如下

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-toleration
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
  tolerations: # 添加容忍
    - key: "tag" # 要容忍的污点的key
      operator: "Equal" # 操作符
      value: "heima" # 容忍的污点的value
      effect: "NoExecute" # 添加容忍的规则，这里必须和标记的污点规则相同
```

测试运行

```sh
# 添加容忍之前的pod
kubectl get pods -o wide
# resp
NAME             READY   STATUS    RESTARTS   AGE   IP       NODE     NOMINATED 
pod-toleration   0/1     Pending   0          3s    <none>   <none>   <none>           

# 添加容忍之后的pod
kubectl get pods -o wide
# resp
NAME             READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED
pod-toleration   1/1     Running   0          3s    10.244.1.62   node1   <none>        
```

查看容忍的详细配置

```sh
kubectl explain pod.spec.tolerations

......
FIELDS:
   key       # 对应着要容忍的污点的键，空意味着匹配所有的键
   value     # 对应着要容忍的污点的值
   operator  # key-value的运算符，支持Equal和Exists（默认）
   effect    # 对应污点的effect，空意味着匹配所有影响
   tolerationSeconds   # 容忍时间, 当effect为NoExecute时生效，表示pod在Node上的停留时间
```
