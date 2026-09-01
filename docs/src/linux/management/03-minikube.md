# Minikube

## 概述

Minikube是官方文档中的入门工具，可以本地运行的单机版kubernetes，方便我们学习kubernetes和调试程序，但是它的功能有限。

- Minikube是一个开源工具，用于在本地开发环境中快速搭建一个单节点的Kubernetes集群。
- 它支持多种虚拟化技术，在不同平台上都可以运行，如VirtualBox、Hyper-V、KVM等。
- 通过Minikube，开发人员可以方便地在本地环境中测试、构建和部署应用程序，并尝试不同的Kubernetes功能和配置。
- Minikube提供了一些命令行工具，如kubectl，用于与Kubernetes集群进行交互，可以在本地开发中提高效率和便捷性。

官方网站：[Minikube](https://minikube.sigs.k8s.io/)

## 系统要求

Minikube需要使用Docker或虚拟机（推荐Docker）

- 至少2核
- 内存不低于2GB
- 硬盘空闲空间不低于20GB
- 联网环境
- Docker（或虚拟机）

## 环境搭建

### Binary

```sh
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Debian

```sh
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
sudo dpkg -i minikube_latest_amd64.deb
```

### RPM

```sh
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-latest.x86_64.rpm
sudo rpm -Uvh minikube-latest.x86_64.rpm
```

### Docker

```sh
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

## 启动集群

Minikube默认安装kubernetes v1.28.3版本，需要将容器运行时设置为`containerd`。

> 运行v1.24 .0及之后版本，都需要此设置。如果不设置会出现错误。

### V1.23.0

```sh
minikube start --image-mirror-country='cn' --kubernetes-version=v1.23.0
```

### V1.28.3

```sh
minikube start --image-mirror-country='cn' --container-runtime=containerd --kubernetes-version=v1.28.3
```

- `--image-mirror-country='cn'`：设置使用国内阿里云镜像源
- `--container-runtime=containerd`：设置容器为`containerd`
- `--kubernetes-version=v1.23.17`：设置kubernetes版本

## 管理集群

```sh
# 启动
minikube start

# 停止
minikube stop

# 状态
minikube status

# 删除
minikube delete --all
```

## 测试运行

查看节点状态

```sh
taketo@debian:~$ minikube kubectl -- get node
NAME       STATUS   ROLES                  AGE     VERSION
minikube   Ready    control-plane,master   3m45s   v1.23.0

taketo@debian:~$ minikube kubectl -- get po -A
NAMESPACE     NAME                               READY   STATUS    RESTARTS        AGE
kube-system   coredns-65c54cc984-tgz2n           1/1     Running   0               3m30s
kube-system   etcd-minikube                      1/1     Running   0               3m53s
kube-system   kube-apiserver-minikube            1/1     Running   0               3m54s
kube-system   kube-controller-manager-minikube   1/1     Running   1 (3m50s ago)   3m50s
kube-system   kube-proxy-8jvgn                   1/1     Running   0               3m31s
kube-system   kube-scheduler-minikube            1/1     Running   0               3m52s
kube-system   storage-provisioner                1/1     Running   1 (2m56s ago)   3m37s
```

## Dashboard

安装Dashboard

```sh
minikube dashboard --url --port=63373
```

> 不设置`--port`端口是随机的，每次启动可能会变化。

查看状态

```sh
taketo@debian:~$ minikube kubectl -- get po -A
NAMESPACE              NAME                                         READY   STATUS    RESTARTS        AGE
kube-system            coredns-65c54cc984-j2nkj                     1/1     Running   0               5m37s
kube-system            etcd-minikube                                1/1     Running   0               5m56s
kube-system            kube-apiserver-minikube                      1/1     Running   0               6m3s
kube-system            kube-controller-manager-minikube             1/1     Running   1 (5m56s ago)   5m59s
kube-system            kube-proxy-hbj88                             1/1     Running   0               5m37s
kube-system            kube-scheduler-minikube                      1/1     Running   0               6m1s
kube-system            storage-provisioner                          1/1     Running   1 (5m3s ago)    5m46s
kubernetes-dashboard   dashboard-metrics-scraper-7db978b848-sxkzj   1/1     Running   0               4m55s
kubernetes-dashboard   kubernetes-dashboard-6f4c897964-ftdt2        1/1     Running   0               4m55s
```

本机访问

```sh
http://127.0.0.1:63373/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/
```

开启远程访问

```sh
minikube kubectl -- proxy --port=8080 --address=0.0.0.0 --accept-hosts=^.*
```

外部访问

```sh
http://ip:8080/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/#/workloads?namespace=default
```

查看Pod

![An image](/img/linux/management/05.png)
