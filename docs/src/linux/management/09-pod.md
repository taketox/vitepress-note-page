# Pod

## 什么是 Pod?

**Pod** 是包含一个或多个容器的容器组，是 Kubernetes 中创建和管理的最小对象。

Pod 有以下特点：

- Pod是kubernetes中**最小的调度单位**（原子单元），Kubernetes直接管理Pod而不是容器。
- 同一个Pod中的容器总是会被自动安排到集群中的**同一节点**（物理机或虚拟机）上，并且**一起调度**。
- Pod可以理解为运行特定应用的**逻辑主机**，这些容器共享存储、网络和配置声明(如资源限制)。
- 每个 Pod 有唯一的 IP 地址。 **IP地址分配给Pod**，在同一个 Pod 内，所有容器共享一个 IP 地址和端口空间，Pod 内的容器可以使用`localhost`互相通信。

## 基础架构

每个Pod中都可以包含一个或者多个容器，这些容器可以分为两类

![An image](/img/linux/management/08.png)

- 用户程序所在的容器，数量可多可少

- Pause容器，这是每个Pod都会有的一个根容器，它的作用有两个：

  - 可以以它为依据，评估整个Pod的健康状态

  - 可以在根容器上设置 `Ip` 地址，其它容器都此 `Ip`（Pod IP），以实现Pod内部的网路通信

> 这里是Pod内部的通讯，Pod的之间的通讯采用虚拟二层网络技术来实现，我们当前环境用的是Flannel

## 资源清单

`Pod` 的资源清单

```yaml
apiVersion: v1     #必选，版本号，例如v1
kind: Pod       　 #必选，资源类型，例如 Pod
metadata:       　 #必选，元数据
  name: string     #必选，Pod名称
  namespace: string  #Pod所属的命名空间,默认为"default"
  labels:       　　  #自定义标签列表
    - name: string      　          
spec:  #必选，Pod中容器的详细定义
  containers:  #必选，Pod中容器列表
  - name: string   #必选，容器名称
    image: string  #必选，容器的镜像名称
    imagePullPolicy: [ Always|Never|IfNotPresent ]  #获取镜像的策略 
    command: [string]   #容器的启动命令列表，如不指定，使用打包时使用的启动命令
    args: [string]      #容器的启动命令参数列表
    workingDir: string  #容器的工作目录
    volumeMounts:       #挂载到容器内部的存储卷配置
    - name: string      #引用pod定义的共享存储卷的名称，需用volumes[]部分定义的的卷名
      mountPath: string #存储卷在容器内mount的绝对路径，应少于512字符
      readOnly: boolean #是否为只读模式
    ports: #需要暴露的端口库号列表
    - name: string        #端口的名称
      containerPort: int  #容器需要监听的端口号
      hostPort: int       #容器所在主机需要监听的端口号，默认与Container相同
      protocol: string    #端口协议，支持TCP和UDP，默认TCP
    env:   #容器运行前需设置的环境变量列表
    - name: string  #环境变量名称
      value: string #环境变量的值
    resources: #资源限制和请求的设置
      limits:  #资源限制的设置
        cpu: string     #Cpu的限制，单位为core数，将用于docker run --cpu-shares参数
        memory: string  #内存限制，单位可以为Mib/Gib，将用于docker run --memory参数
      requests: #资源请求的设置
        cpu: string    #Cpu请求，容器启动的初始可用数量
        memory: string #内存请求,容器启动的初始可用数量
    lifecycle: #生命周期钩子
        postStart: #容器启动后立即执行此钩子,如果执行失败,会根据重启策略进行重启
        preStop: #容器终止前执行此钩子,无论结果如何,容器都会终止
    livenessProbe:  #对Pod内各容器健康检查的设置，当探测无响应几次后将自动重启该容器
      exec:       　 #对Pod容器内检查方式设置为exec方式
        command: [string]  #exec方式需要制定的命令或脚本
      httpGet:       #对Pod内个容器健康检查方法设置为HttpGet，需要制定Path、port
        path: string
        port: number
        host: string
        scheme: string
        HttpHeaders:
        - name: string
          value: string
      tcpSocket:     #对Pod内个容器健康检查方式设置为tcpSocket方式
         port: number
       initialDelaySeconds: 0       #容器启动完成后首次探测的时间，单位为秒
       timeoutSeconds: 0    　　    #对容器健康检查探测等待响应的超时时间，单位秒，默认1秒
       periodSeconds: 0     　　    #对容器监控检查的定期探测时间设置，单位秒，默认10秒一次
       successThreshold: 0
       failureThreshold: 0
       securityContext:
         privileged: false
  restartPolicy: [Always | Never | OnFailure]  #Pod的重启策略
  nodeName: <string> #设置NodeName表示将该Pod调度到指定到名称的node节点上
  nodeSelector: obeject #设置NodeSelector表示将该Pod调度到包含这个label的node上
  imagePullSecrets: #Pull镜像时使用的secret名称，以key：secretkey格式指定
  - name: string
  hostNetwork: false   #是否使用主机网络模式，默认为false，如果设置为true，表示使用宿主机网络
  volumes:   #在该pod上定义共享存储卷列表
  - name: string    #共享存储卷名称 （volumes类型有很多种）
    emptyDir: {}       #类型为emtyDir的存储卷，与Pod同生命周期的一个临时目录。为空值
    hostPath: string   #类型为hostPath的存储卷，表示挂载Pod所在宿主机的目录
      path: string      　　        #Pod所在宿主机的目录，将被用于同期中mount的目录
    secret:       　　　#类型为secret的存储卷，挂载集群与定义的secret对象到容器内部
      scretname: string  
      items:     
      - key: string
        path: string
    configMap:         #类型为configMap的存储卷，挂载预定义的configMap对象到容器内部
      name: string
      items:
      - key: string
        path: string
```

## 基本配置

创建 `pod-test.yaml` 文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-test
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      resources: # 资源配额
        limits: # 限制资源（上限）
          cpu: "2" # CPU限制，单位是core数
          memory: "10Gi" # 内存限制
        requests: # 请求资源（下限）
          cpu: "1" # CPU限制，单位是core数
          memory: "10Mi" # 内存限制
      imagePullPolicy: Never
      ports: # 设置容器暴露的端口列表
        - name: nginx-port
          containerPort: 80
          protocol: TCP
    - name: busybox
      image: busybox:1.30
      command:
        [
          "/bin/sh",
          "-c",
          "touch /tmp/hello.txt;while true;do /bin/echo $(date +%T) >> /tmp/hello.txt; sleep 3; done;",
        ]
      env: # 设置环境变量列表
        - name: "username"
          value: "admin"
        - name: "password"
          value: "123456"
```

上面定义了一个比较简单Pod的配置，里面有两个容器

- `nginx`：用1.22版本的nginx镜像创建（nginx是一个轻量级web容器）
- `busybox`：用1.30版本的busybox镜像创建（busybox是一个小巧的linux命令集合）

### 镜像拉取策略

`imagePullPolicy`：用于设置镜像拉取策略，kubernetes支持配置三种拉取策略

- `Always`：总是从远程仓库拉取镜像（一直远程下载）
- `IfNotPresent`：本地有则使用本地镜像，本地没有则从远程仓库拉取镜像（本地有就本地 本地没远程下载）
- `Never`：只使用本地镜像，从不去远程仓库拉取，本地没有就报错 （一直使用本地）

>如果镜像tag为具体版本号， 默认策略是：IfNotPresent
>
>如果镜像tag为：latest（最终版本） ，默认策略是always

### 启动命令

因为 `busybox` 并不是一个程序，而是类似于一个工具类的集合，kubernetes集群启动管理后，它会自动关闭。

`command`：用于在pod中的容器初始化完毕之后运行一个命令

```sh
# 进入busybox容器
# kubectl exec  pod名称 -n 命名空间 -it -c 容器名称 /bin/sh  在容器内部执行命令
root@master:~# kubectl exec pod-test -it -c busybox /bin/sh
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
/ # cat /tmp/hello.txt 
08:03:22
08:03:25
08:03:28
08:03:31
08:03:34
08:03:37
08:03:40
08:03:43
08:03:46
08:03:49
08:03:52
08:03:55
08:03:58
```

### 环境变量

`env`：环境变量，用于在pod中的容器设置环境变量

>这种方式不是很推荐，推荐将这些配置单独存储在配置文件中

```sh
/ # echo $username
admin
/ # echo $password
123456
```

### 端口配置

`ports` ：要从容器中公开的端口列表

- `name`：端口名称，如果指定，必须保证name在pod中是唯一的
- `containerPort`：容器要监听的端口(0<x<65536)
- `hostPort`：容器要在主机上公开的端口，如果设置，主机上只能运行容器的一个副本(一般省略)
- `hostIP`：要将外部端口绑定到的主机IP(一般省略)
- `protocol`：端口协议。必须是UDP、TCP或SCTP。默认为“TCP”。

```sh
# 查看PodIP
kubectl describe pod pod-test | grep "IP:"

# 查看PodIP
kubectl get pod pod-test -o json | grep ip
kubectl get pod pod-test -o yaml |grep ip

# 访问
curl 10.244.1.26
```

>访问容器中的应用：`Podip:containerPort`

### 资源配额

容器中的程序要运行，肯定是要占用一定资源的，比如cpu和内存等。如果不对某个容器的资源做限制，那么它就可能吃掉大量资源，导致其它容器无法运行。

`resources`：对内存和cpu的资源进行配额

- `limits`：用于限制运行时容器的最大占用资源，当容器占用资源超过limits时会被终止，并进行重启
- `requests` ：用于设置容器需要的最小资源，如果环境资源不够，容器将无法启动
  - `cpu`：核心数，可以为整数或小数
  - `memory`： 内存大小，可以使用`Gi`、`Mi`、`G`、`M`等形式

```sh
# 修改内存的最小资源为1000Gi, 重新运行
kubectl apply -f pod-test.yaml

# 直接报错
The Pod "pod-test" is invalid: spec.containers[0].resources.requests: Invalid value: "1000Gi": must be less than or equal to memory limit of 10Gi
```

## 生命周期

我们一般将pod对象从创建至终的这段时间范围称为pod的生命周期，它主要包含下面的过程

1. pod创建过程
2. 运行初始化容器（init container）过程
3. 运行主容器（main container）
4. 容器启动后钩子（post start）、容器终止前钩子（pre stop）
5. 容器的存活性探测（liveness probe）、就绪性探测（readiness probe）
6. pod终止过程

![An image](/img/linux/management/09.png)

在整个生命周期中，Pod会出现5种状态，分别如下

- 挂起（Pending）：apiserver已经创建了pod资源对象，但它尚未被调度完成或者仍处于下载镜像的过程中
- 运行中（Running）：pod已经被调度至某节点，并且所有容器都已经被kubelet创建完成
- 成功（Succeeded）：pod中的所有容器都已经成功终止并且不会被重启
- 失败（Failed）：所有容器都已经终止，但至少有一个容器终止失败，即容器返回了非0值的退出状态
- 未知（Unknown）：apiserver无法正常获取到pod对象的状态信息，通常由网络通信失败所导致

### 创建和终止

pod的创建过程

1. 用户通过 `kubectl` 或其他 `api` 客户端提交需要创建的 `pod` 信息给 `apiServer`
2. `apiServer` 开始生成pod对象的信息，并将信息存入 `etcd`，然后返回确认信息至客户端
3. `apiServer` 开始反映 `etcd` 中的 `pod` 对象的变化，其它组件使用watch机制来跟踪检查 `apiServer` 上的变动
4. `scheduler` 发现有新的pod对象要创建，开始为Pod分配主机并将结果信息更新至 `apiServer`
5. `node` 节点上的 `kubelet` 发现有pod调度过来，尝试调用docker启动容器，并将结果回送至 `apiServer`
6. `apiServer` 将接收到的pod状态信息存入 `etcd` 中

![An image](/img/linux/management/10.png)

pod的终止过程

1. 用户向 `apiServer` 发送删除 `pod` 对象的命令
2. `apiServcer` 中的 `pod` 对象信息会随着时间的推移而更新，在宽限期内（默认30s），`pod` 被视为 `dead`
3. 将 `pod` 标记为 `terminating` 状态
4. `kubelet` 在监控到 `pod` 对象转为 `terminating` 状态的同时启动 `pod` 关闭过程
5. 端点控制器监控到 `pod` 对象的关闭行为时将其从所有匹配到此端点的 `service` 资源的端点列表中移除
6. 如果当前 `pod` 对象定义了 `preStop` 钩子处理器，则在其标记为 `terminating` 后即会以同步的方式启动执行
7. `pod` 对象中的容器进程收到停止信号
8. 宽限期结束后，若 `pod` 中还存在仍在运行的进程，那么 `pod` 对象会收到立即终止的信号
9. `kubelet` 请求 `apiServer` 将此 `pod` 资源的宽限期设置为 `0` 从而完成删除操作，此时 `pod` 对于用户已不可见

### 初始化容器

初始化容器是在pod的主容器启动之前要运行的容器，主要是做一些主容器的前置工作，它具有两大特征：

1. 初始化容器必须运行完成直至结束，若某初始化容器运行失败，那么kubernetes需要重启它直到成功完成
2. 初始化容器必须按照定义的顺序执行，当且仅当前一个成功之后，后面的一个才能运行

初始化容器有很多的应用场景，下面列出的是最常见的几个：

1. 提供主容器镜像中不具备的工具程序或自定义代码
2. 初始化容器要先于应用容器串行启动并运行完成，因此可用于延后应用容器的启动直至其依赖的条件得到满足

接下来做一个案例，模拟下面这个需求：

假设要以主容器来运行nginx，但是要求在运行nginx之前先要能够连接上mysql和redis所在服务器

为了简化测试，事先规定好mysql(192.168.90.14)和redis(192.168.90.15)服务器的地址

创建 `pod-initcontainer.yaml` ，内容如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-initcontainer
  namespace: default
spec:
  containers:
    - name: main-container
      image: nginx:1.22
      ports:
        - name: nginx-port
          containerPort: 80
  initContainers:
    - name: test-mysql
      image: busybox:1.30
      command:
        [
          "sh",
          "-c",
          "until ping 192.168.31.10 -c 1 ; do echo waiting for mysql...; sleep 2; done;",
        ]
    - name: test-redis
      image: busybox:1.30
      command:
        [
          "sh",
          "-c",
          "until ping 192.168.31.11 -c 1 ; do echo waiting for reids...; sleep 2; done;",
        ]
```

运行测试

```sh
# 创建Pod
kubectl apply -f pod-initcontainer.yaml

# 查看Pod状态
kubectl describe po pod-initcontainer
# resp
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  27s   default-scheduler  Successfully assigned default/pod-initcontainer to node1
  Normal  Pulled     27s   kubelet            Container image "busybox:1.30" already present on machine
  Normal  Created    27s   kubelet            Created container test-mysql
  Normal  Started    27s   kubelet            Started container test-mysql

# 动态查看pod创建过程
kubectl get po -w
# resp
NAME                READY   STATUS     RESTARTS   AGE
pod-initcontainer   0/1     Init:0/2   0          11s
pod-initcontainer   0/1     Init:1/2   0          27s
pod-initcontainer   0/1     Init:1/2   0          28s
pod-initcontainer   0/1     PodInitializing   0          40s
pod-initcontainer   1/1     Running           0          41s

# 接下来新开一个shell，为当前服务器新增两个ip，观察pod的变化
ifconfig ens18:1 192.168.31.10 netmask 255.255.255.0 up
ifconfig ens18:2 192.168.31.11 netmask 255.255.255.0 up
```

### 钩子函数

钩子函数能够感知自身生命周期中的事件，并在相应的时刻到来时运行用户指定的程序代码。

kubernetes在主容器的启动之后和停止之前提供了两个钩子函数：

1. `post start`：容器创建之后执行，如果失败了会重启容器
2. `pre stop` ：容器终止之前执行，执行完成之后容器将成功终止，在其完成之前会阻塞删除容器的操作

钩子处理器支持使用下面三种方式定义动作：

- Exec命令：在容器内执行一次命令

  ```sh
  ……
    lifecycle:
      postStart: 
        exec:
          command:
          - cat
          - /tmp/healthy
  ……
  ```

- TCPSocket：在当前容器尝试访问指定的 `socket`

  ```sh
  ……      
    lifecycle:
      postStart:
        tcpSocket:
          port: 8080
  ……
  ```

- HTTPGet：在当前容器中向某 `url` 发起 `http` 请求

  ```sh
  ……
    lifecycle:
      postStart:
        httpGet:
          path: / #URI地址
          port: 80 #端口号
          host: 192.168.5.3 #主机地址
          scheme: HTTP #支持的协议，http或者https
  ……
  ```

以exec方式为例，演示下钩子函数的使用，创建 `pod-hook-exec.yaml` 文件。

```sh
apiVersion: v1
kind: Pod
metadata:
  name: pod-hook-exec
  namespace: default
spec:
  containers:
    - name: main-container
      image: nginx:1.17.1
      ports:
        - name: nginx-port
          containerPort: 80
      lifecycle:
        postStart:
          exec: # 在容器启动的时候执行一个命令，修改掉nginx的默认首页内容
            command:
              [
                "/bin/sh",
                "-c",
                "echo postStart... > /usr/share/nginx/html/index.html",
              ]
        preStop:
          exec: # 在容器停止之前停止nginx服务
            command: ["/usr/sbin/nginx", "-s", "quit"]
```

运行测试

```sh
# 创建pod
kubectl create -f pod-hook-exec.yaml

# 查看pod
kubectl get pods  pod-hook-exec -o wide
# resp
NAME            READY   STATUS    RESTARTS   AGE    IP            NODE    NOMINATED NODE   READINESS GATES
pod-hook-exec   1/1     Running   0          119s   10.244.1.28   node2   <none>           <none>

# 访问pod
curl 10.244.1.28
postStart...
```

### 容器探测

容器探测用于检测容器中的应用实例是否正常工作，是保障业务可用性的一种传统机制。如果经过探测，实例的状态不符合预期，那么kubernetes就会把该问题实例" 摘除 "，不承担业务流量。

kubernetes提供了两种探针来实现容器探测，分别是：

- liveness probes：存活性探针，用于检测应用实例当前是否处于正常运行状态，如果不是，k8s会重启容器
- readiness probes：就绪性探针，用于检测应用实例当前是否可以接收请求，如果不能，k8s不会转发流量

> `livenessProbe` 决定是否重启容器，`readinessProbe` 决定是否将请求转发给容器。

上面两种探针目前均支持三种探测方式：

#### Exec

Exec：在容器内执行一次命令，如果命令执行的退出码为0，则认为程序正常，否则不正常

```yaml
……
  livenessProbe:
    exec:
      command:
      - cat
      - /tmp/healthy
……
```

#### TCPSocket

TCPSocket：将会尝试访问一个用户容器的端口，如果能够建立这条连接，则认为程序正常，否则不正常

```yaml
……      
  livenessProbe:
    tcpSocket:
      port: 8080
……

```

#### HTTPGet

HTTPGet：调用容器内Web应用的URL，如果返回的状态码在200和399之间，则认为程序正常，否则不正常

```yaml
……
  livenessProbe:
    httpGet:
      path: / #URI地址
      port: 80 #端口号
      host: 127.0.0.1 #主机地址
      scheme: HTTP #支持的协议，http或者https
……
```

#### 相关配置

`livenessProbe`的子属性

- `initialDelaySeconds`：容器启动后等待多少秒执行第一次探测
- `timeoutSeconds`：探测超时时间。默认1秒，最小1秒
- `periodSeconds`：执行探测的频率。默认是10秒，最小1秒
- `failureThreshold`：连续探测失败多少次才被认定为失败。默认是3。最小值是1
- `successThreshold`：连续探测成功多少次才被认定为成功。默认是1

### 重启策略

一旦容器探测出现了问题，kubernetes就会对容器所在的Pod进行重启，其实这是由pod的重启策略决定的。

pod的重启策略有 3 种，分别如下：

1. `Always` ：容器失效时，自动重启该容器，这也是默认值。
2. `OnFailure` ： 容器终止运行且退出码不为0时重启
3. `Never` ： 不论状态为何，都不重启该容器

重启策略适用于pod对象中的所有容器，首次需要重启的容器，将在其需要时立即进行重启，随后再次需要重启的操作将由kubelet延迟一段时间后进行，且反复的重启操作的延迟时长以此为10s、20s、40s、80s、160s和300s，300s是最大延迟时长。

创建`pod-restartpolicy.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-restartpolicy
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      ports:
        - name: nginx-port
          containerPort: 80
      livenessProbe:
        httpGet:
          scheme: HTTP
          port: 80
          path: /hello
  restartPolicy: Never # 设置重启策略为Never
```

运行测试

```sh
# 创建Pod
kubectl create -f pod-restartpolicy.yaml

# 查看Pod详情，发现nginx容器失败
kubectl  describe pods pod-restartpolicy
# resp
  Warning  Unhealthy  8s (x3 over 28s)  kubelet            Liveness probe failed: HTTP probe failed with statuscode: 404
  Normal   Killing    8s                kubelet            Stopping container nginx
  
# 多等一会，再观察pod的重启次数，发现一直是0，并未重启   
kubectl  get pods pod-restartpolicy
# resp
NAME                READY   STATUS      RESTARTS   AGE
pod-restartpolicy   0/1     Completed   0          91s
```
