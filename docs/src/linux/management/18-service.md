# Service

## 概述

在kubernetes中，`pod` 是应用程序的载体，我们可以通过 `pod` 的 `ip` 来访问应用程序，但是 `pod` 的 `ip` 地址不是固定的，这也就意味着不方便直接采用 `pod` 的 `ip` 对服务进行访问。

为了解决这个问题，kubernetes提供了 `Service` 资源，`Service` 会对提供同一个服务的多个 `pod` 进行聚合，并且提供一个统一的入口地址。通过访问Service的入口地址就能访问到后面的pod服务。

![An image](/img/linux/management/22.png)

`Service` 在很多情况下只是一个概念，真正起作用的其实是 `kube-proxy` 服务进程，每个Node节点上都运行着一个 `kube-proxy` 服务进程。当创建 `Service` 的时候会通过 `api-server` 向 `etcd` 写入创建的 `Service` 的信息，而 `kube-proxy` 会基于监听的机制发现这种 `Service` 的变动，然后它会将最新的 `Service` 信息**转换成对应的访问规则**。

![An image](/img/linux/management/23.png)

## 工作模式

`kube-proxy` 目前支持三种工作模式

### userspace模式

`userspace` 模式下，`kube-proxy`会为每一个Service创建一个监听端口，发向 `Cluster IP` 的请求被 `Iptables` 规则重定向到 `kube-proxy` 监听的端口上，`kube-proxy` 根据LB算法选择一个提供服务的Pod并和其建立链接，以将请求转发到Pod上。

该模式下，`kube-proxy` 充当了一个四层负责均衡器的角色。由于 `kube-proxy` 运行在 `userspace` 中，在进行转发处理时会增加内核和用户空间之间的数据拷贝，虽然比较稳定，但是效率比较低。

![An image](/img/linux/management/24.png)

### iptables模式

`iptables` 模式下，`kube-proxy` 为service后端的每个Pod创建对应的 `iptables` 规则，直接将发向 `Cluster IP` 的请求重定向到一个 `Pod IP`。

该模式下 `kube-proxy` 不承担四层负责均衡器的角色，只负责创建 `iptables` 规则。该模式的优点是较 `userspace` 模式效率更高，但不能提供灵活的LB策略，当后端Pod不可用时也无法进行重试。

![An image](/img/linux/management/25.png)

### ipvs模式

`ipvs` 模式和 `iptables` 类似，`kube-proxy` 监控Pod的变化并创建相应的 `ipvs` 规则。`ipvs` 相对 `iptables` 转发效率更高。除此以外，`ipvs` 支持更多的LB算法。

![An image](/img/linux/management/26.png)

## 资源清单

`Service` 的资源清单

```yaml
kind: Service # 资源类型
apiVersion: v1 # 资源版本
metadata: # 元数据
  name: service # 资源名称
  namespace: default # 命名空间
spec: # 描述
  selector: # 标签选择器，用于确定当前service代理哪些pod
    app: nginx
  type: # Service类型，指定service的访问方式
  clusterIP: # 虚拟服务的ip地址
  sessionAffinity: # session亲和性，支持ClientIP、None两个选项
  ports: # 端口信息
    - protocol: TCP
      port: 3017 # service端口
      targetPort: 5003 # pod端口
      nodePort: 31122 # 主机端口
```

参数解释

- `ClusterIP`：默认值，它是 `Kubernetes` 系统自动分配的虚拟 `IP`，只能在集群内部访问
- `NodePort`：将Service通过指定的Node上的端口暴露给外部，通过此方法，就可以在集群外部访问服务
- `LoadBalancer`：使用外接负载均衡器完成到服务的负载分发，注意此模式需要外部云环境支持
- `ExternalName`： 把集群外部的服务引入集群内部，直接使用

## Service使用

创建 `deployment.yaml` 文件

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
          ports:
            - containerPort: 80
```

> 在使用service之前，首先利用Deployment创建出3个pod，注意要为pod设置 `app=nginx-pod` 的标签

测试运行

```sh
# 创建Service
kubectl create -f deployment.yaml

# 查看pod详情
kubectl get pods -o wide --show-labels
NAME                             READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES   LABELS
pc-deployment-7b84c5ff45-cnqlk   1/1     Running   0          13s   10.244.2.61   node1   <none>           <none>            app=nginx-pod,pod-template-hash=7b84c5ff45
pc-deployment-7b84c5ff45-pqtfx   1/1     Running   0          13s   10.244.1.65   node2   <none>           <none>            app=nginx-pod,pod-template-hash=7b84c5ff45
pc-deployment-7b84c5ff45-xsn7q   1/1     Running   0          13s   10.244.2.62   node1   <none>           <none>            app=nginx-pod,pod-template-hash=7b84c5ff45

# 为了方便后面的测试，修改下三台nginx的index.html页面（三台修改的IP地址不一致）
kubectl exec -it pc-deployment-7b84c5ff45-cnqlk -- bash
echo "10.244.2.61" > /usr/share/nginx/html/index.html

#修改完毕之后，访问测试
# bash
curl 10.244.2.61
# resp
10.244.2.61
# bash
curl 10.244.1.65
# resp
10.244.1.65
# bash
curl 10.244.2.62
# resp
10.244.2.62
```

### ClusterIP

创建 `service-clusterip.yaml` 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-clusterip
  namespace: default
spec:
  selector:
    app: nginx-pod
  clusterIP: 10.96.10.10 # service的ip地址，如果不写，默认会生成一个
  type: ClusterIP
  ports:
    - port: 80 # Service端口
      targetPort: 80 # pod端口
```

测试运行

```sh
# 创建service
kubectl create -f service-clusterip.yaml

# 查看service
kubectl get svc -o wide
# resp
NAME                TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE    SELECTOR
kubernetes          ClusterIP   10.96.0.1      <none>        443/TCP        4d7h   <none>
service-clusterip   ClusterIP   10.96.10.10    <none>        80/TCP         5s     app=nginx-pod

# 查看service的详细信息
# 在这里有一个Endpoints列表，里面就是当前service可以负载到的服务入口
kubectl describe svc service-clusterip
# resp
Name:              service-clusterip
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=nginx-pod
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.96.10.10
IPs:               10.96.10.10
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         <none>
Session Affinity:  None
Events:            <none>

# 访问10.97.97.97:80观察效果
curl 10.96.10.10
# reps
10.244.2.61
10.244.1.65
10.244.1.65
10.244.2.62
```

### Endpoint

`Endpoint` 是kubernetes中的一个资源对象，存储在 `etcd` 中，用来记录一个 `service` 对应的所有 `pod` 的访问地址，它是根据 `service` 配置文件中 `selector` 描述产生的。

一个 `Service` 由一组 `Pod` 组成，这些 `Pod` 通过 `Endpoints` 暴露出来，`Endpoints` 是实现实际服务的端点集合。换句话说，`service` 和 `pod` 之间的联系是通过 `endpoints` 实现的。

![An image](/img/linux/management/27.png)

负载分发策略

对Service的访问被分发到了后端的Pod上去，目前kubernetes提供了两种负载分发策略：

- 如果不定义，默认使用 `kube-proxy` 的策略，比如随机、轮询
- 基于客户端地址的会话保持模式，即来自同一个客户端发起的所有请求都会转发到固定的一个Pod上

> 此模式可以使在 `spec` 中添加 `sessionAffinity:ClientIP` 选项

```sh
# 默认策略，随机/轮询
while true;do curl 10.96.10.10:80; sleep 2; done;
# resp
10.244.2.61
10.244.1.65
10.244.1.65
10.244.2.62
10.244.1.65
10.244.2.62

# 修改分发策略----sessionAffinity:ClientIP

# 访问测试
while true;do curl 10.96.10.10:80; sleep 2; done;
# resp
10.244.2.61
10.244.2.61
10.244.2.61
10.244.2.61
10.244.2.61
10.244.2.61
```

### HeadLiness

在某些场景中，开发人员可能不想使用Service提供的负载均衡功能，而希望自己来控制负载均衡策略，针对这种情况，kubernetes提供了 `HeadLiness Service`，这类Service不会分配 `Cluster IP`，如果想要访问service，只能通过service的域名进行查询。

创建 `service-headliness.yaml` 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-headliness
  namespace: default
spec:
  selector:
    app: nginx-pod
  clusterIP: None # 将clusterIP设置为None，即可创建headliness Service
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 80
```

测试运行

```sh
# 创建service
kubectl create -f service-headliness.yaml

# 获取service， 发现CLUSTER-IP未分配
kubectl get svc service-headliness -o wide
# resp
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE   SELECTOR
service-headliness   ClusterIP   None         <none>        80/TCP    1s    app=nginx-po

# 查看service详情
kubectl describe svc service-headliness
# resp
Name:              service-headliness
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=nginx-pod
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                None
IPs:               None
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.66:80,10.244.2.63:80,10.244.2.64:80
Session Affinity:  None
Events:            <none>

# 查看域名的解析情况
kubectl exec -it pc-deployment-7b84c5ff45-45tlk -- bash
# resp
/# cat /etc/resolv.conf
# resp
search default.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.96.0.10
options ndots:5

# 查看域名对应的ip
dig @10.96.0.10 service-headliness.default.svc.cluster.local
# resp
service-headliness.default.svc.cluster.local. 30 IN A 10.244.1.66
service-headliness.default.svc.cluster.local. 30 IN A 10.244.2.64
service-headliness.default.svc.cluster.local. 30 IN A 10.244.2.63
```

### NodePort

在之前的样例中，创建的Service的 `ip`地址只有集群内部才可以访问，如果希望将Service暴露给集群外部使用，那么就要使用到另外一种类型的Service，称为 `NodePort` 类型。`NodePort` 的工作原理其实就是将service的端口映射到Node的一个端口上，然后就可以通过 `NodeIp:NodePort` 来访问service了。

![An image](/img/linux/management/28.png)

创建 `service-nodeport.yaml` 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-nodeport
  namespace: default
spec:
  selector:
    app: nginx-pod
  type: NodePort # service类型
  ports:
    - port: 80
      nodePort: 30002 # 指定绑定的node的端口(默认的取值范围是：30000-32767), 如果不指定，会默认分配
      targetPort: 80
```

测试运行

```sh
# 创建service
kubectl create -f service-nodeport.yaml

# 查看service
kubectl get svc -o wide
# resp
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE     SELECTOR
service-nodeport   NodePort    10.104.86.229   <none>        80:30002/TCP   7s      app=nginx-pod

# 接下来可以通过电脑主机的浏览器去访问集群中任意一个nodeip的30002端口，即可访问到pod
```

### LoadBalancer

`LoadBalancer` 和 `NodePort` 很相似，目的都是向外部暴露一个端口，区别在于 `LoadBalancer` 会在集群的外部再来做一个负载均衡设备，而这个设备需要外部环境支持的，外部服务发送到这个设备上的请求，会被设备负载之后转发到集群中。

![An image](/img/linux/management/29.png)

### ExternalName

`ExternalName` 类型的Service用于引入集群外部的服务，它通过 `externalName` 属性指定外部一个服务的地址，然后在集群内部访问此service就可以访问到外部的服务了。

![An image](/img/linux/management/30.png)

创建 `service-externalname.yaml` 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-externalname
  namespace: default
spec:
  type: ExternalName # service类型
  externalName: www.baidu.com #改成ip地址也可以
```

测试运行

```sh
# 创建service
kubectl  create -f service-externalname.yaml

# 查看svc
kubectl get svc
# resp
NAME                   TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE
service-externalname   ExternalName   <none>          www.baidu.com   <none>         4s

# 域名解析
dig @10.96.0.10 service-externalname.default.svc.cluster.local
# resp
service-externalname.default.svc.cluster.local. 30 IN CNAME www.baidu.com.
www.baidu.com.          30      IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       30      IN      A       180.101.50.188
www.a.shifen.com.       30      IN      A       180.101.50.242
```
