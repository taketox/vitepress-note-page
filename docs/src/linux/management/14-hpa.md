# HorizontalPodAutoscaler

## 概述

我们已经可以实现通过手工执行 `kubectl scale` 命令实现Pod扩容或缩容，但是这显然不符合Kubernetes的定位目标–自动化、智能化。 Kubernetes期望可以实现通过监测Pod的使用情况，实现pod数量的自动调整，于是就产生了`Horizontal Pod Autoscaler（HPA）`这种控制器。

HPA可以获取每个Pod利用率，然后和HPA中定义的指标进行对比，同时计算出需要伸缩的具体值，最后实现Pod的数量的调整。其实HPA与之前的Deployment一样，也属于一种Kubernetes资源对象，它通过追踪分析RC控制的所有目标Pod的负载变化情况，来确定是否需要针对性地调整目标Pod的副本数，这是HPA的实现原理。

![An image](/img/linux/management/15.png)

## Metrics Server

Github地址：[kubernetes-sigs/metrics-server: Scalable and efficient source of container resource metrics for Kubernetes built-in autoscaling pipelines. (github.com)](https://github.com/kubernetes-sigs/metrics-server)

Metrics Server 是一种可扩展、高效的容器资源指标来源，适用于 Kubernetes 内置的自动缩放管道。

Metrics Server 从 Kubelets 收集资源指标，并通过Metrics API将它们暴露在 `Kubernetes apiserver` 中，供 `Horizontal Pod Autoscaler`和 `Vertical Pod Autoscaler` 使用。指标 API 也可以通过 访问 `kubectl top`，从而更容易调试自动缩放管道。

### 版本要求

| Metrics Server | Metrics API group/version | Supported Kubernetes version |
| -------------- | ------------------------- | ---------------------------- |
| 0.6.x          | `metrics.k8s.io/v1beta1`  | 1.19+                        |
| 0.5.x          | `metrics.k8s.io/v1beta1`  | *1.8+                        |
| 0.4.x          | `metrics.k8s.io/v1beta1`  | *1.8+                        |
| 0.3.x          | `metrics.k8s.io/v1beta1`  | 1.8-1.21                     |

### 安装

下载

```sh
wget https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

换源

```sh
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
        - --kubelet-preferred-address-types=InternalDNS,InternalIP,ExternalDNS,ExternalIP,Hostname
        image: registry.aliyuncs.com/google_containers/metrics-server:v0.6.4
```

> 修改 `image` 地址：`registry.aliyuncs.com/google_containers/metrics-server`
>
> 新增 `--kubelet-insecure-tls` 和 `--kubelet-preferred-address-types` 参数

安装

```sh
kubectl apply -f ./components.yaml
```

查看是否安装成功

```sh
# metrics-server-5575f7cfcc-zlhxl 状态为 Running 表示安装成功
kubectl get pod -n kube-system
# resp
NAME                              READY   STATUS    RESTARTS   AGE
coredns-66f779496c-7hnbc          1/1     Running   0          4d3h
coredns-66f779496c-pvm95          1/1     Running   0          4d3h
etcd-master                       1/1     Running   4          4d3h
kube-apiserver-master             1/1     Running   3          4d3h
kube-controller-manager-master    1/1     Running   3          4d3h
kube-proxy-gkcnp                  1/1     Running   0          4d3h
kube-proxy-kpb5g                  1/1     Running   0          4d3h
kube-proxy-v42wp                  1/1     Running   0          4d3h
kube-scheduler-master             1/1     Running   4          4d3h
metrics-server-5575f7cfcc-zlhxl   1/1     Running   0          94s

# 查看节点资源使用情况
kubectl top node
# resp
NAME     CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
master   136m         0%     2095Mi          54%       
node1    24m          0%     1089Mi          28%       
node2    31m          0%     1033Mi          27%       

# 查看pod资源使用情况
kubectl top pod -n kube-system
# resp
NAME                              CPU(cores)   MEMORY(bytes)   
coredns-66f779496c-7hnbc          3m           27Mi            
coredns-66f779496c-pvm95          3m           27Mi            
etcd-master                       22m          82Mi            
kube-apiserver-master             50m          292Mi           
kube-controller-manager-master    22m          66Mi            
kube-proxy-gkcnp                  2m           28Mi            
kube-proxy-kpb5g                  1m           28Mi            
kube-proxy-v42wp                  1m           27Mi            
kube-scheduler-master             5m           35Mi            
metrics-server-5575f7cfcc-zlhxl   5m           22Mi 
```

## 测试运行

创建 `pc-hpa-pod.yaml` 文件

```sh
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
spec:
  strategy: # 策略
    type: RollingUpdate # 滚动更新策略
  replicas: 1
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
          resources: # 资源配额
            limits: # 限制资源（上限）
              cpu: "1" # CPU限制，单位是core数
            requests: # 请求资源（下限）
              cpu: "100m" # CPU限制，单位是core数
```

运行测试

```sh
# 创建
kubectl create -f pc-hpa-pod.yaml

# 查看
kubectl get deploy,pod,svc
NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx   1/1     1            1           10s

NAME                         READY   STATUS    RESTARTS   AGE
pod/nginx-7f8ddbf88f-xz5ml   1/1     Running   0          10s

NAME                 TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
service/kubernetes   ClusterIP   10.96.0.1     <none>        443/TCP        4d4h
service/nginx        NodePort    10.111.38.8   <none>        80:31803/TCP   4d3h
```

创建 `pc-hpa.yaml` 文件

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: pc-hpa
  namespace: default
spec:
  minReplicas: 1 #最小pod数量
  maxReplicas: 10 #最大pod数量
  targetCPUUtilizationPercentage: 3 # CPU使用率指标
  scaleTargetRef: # 指定要控制的nginx信息
    apiVersion: /v1
    kind: Deployment
    name: nginx
```

运行测试

```sh
# 创建hpa
kubectl create -f pc-hpa.yaml

# 查看hpa
kubectl get hpa
# resp
NAME     REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
pc-hpa   Deployment/nginx   0%/3%     1         10        1          62s
```

压测

使用压测工具对service地址 `IP:31830` 进行压测，然后通过控制台查看 `hpa` 和 `pod` 的变化

```sh
# hpa变化
kubectl get hpa -w
# resp
NAME   REFERENCE      TARGETS  MINPODS  MAXPODS  REPLICAS  AGE
pc-hpa  Deployment/nginx  0%/3%   1     10     1      4m11s
pc-hpa  Deployment/nginx  0%/3%   1     10     1      5m19s
pc-hpa  Deployment/nginx  22%/3%   1     10     1      6m50s
pc-hpa  Deployment/nginx  22%/3%   1     10     4      7m5s
pc-hpa  Deployment/nginx  22%/3%   1     10     8      7m21s
pc-hpa  Deployment/nginx  6%/3%   1     10     8      7m51s
pc-hpa  Deployment/nginx  0%/3%   1     10     8      9m6s
pc-hpa  Deployment/nginx  0%/3%   1     10     8      13m
pc-hpa  Deployment/nginx  0%/3%   1     10     1      14m

# deployment变化
kubectl get deployment -w
# resp
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   1/1     1            1           11m
nginx   1/4     1            1           13m
nginx   1/4     1            1           13m
nginx   1/4     1            1           13m
nginx   1/4     4            1           13m
nginx   1/8     4            1           14m
nginx   1/8     4            1           14m
nginx   1/8     4            1           14m
nginx   1/8     8            1           14m
nginx   2/8     8            2           14m
nginx   3/8     8            3           14m
nginx   4/8     8            4           14m
nginx   5/8     8            5           14m
nginx   6/8     8            6           14m
nginx   7/8     8            7           14m
nginx   8/8     8            8           15m
nginx   8/1     8            8           20m
nginx   8/1     8            8           20m
nginx   1/1     1            1           20m
```
