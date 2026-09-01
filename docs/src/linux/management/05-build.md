# 集群搭建

## kubeadm概述

kubeadm是官方社区推出的一个用于快速部署kubernetes集群的工具。

这个工具能通过两条指令完成一个kubernetes集群的部署

```sh
# 创建一个 Master 节点
kubeadm init

# 将一个 Node 节点加入到当前集群中
kubeadm join <Master节点的IP和端口 >
```

## 运行环境

| 节点   | 地址           | 版本   | 操作系统 |
| ------ | -------------- | ------ | -------- |
| master | 192.168.31.120 | 1.28.2 | Debian12 |
| node1  | 192.168.31.121 | 1.28.2 | Debian12 |
| node2  | 192.168.31.122 | 1.28.2 | Debian12 |

## 环境搭建

以下操作每台机器都执行

```sh
# 关闭swap
# 临时
swapoff -a
# 永久关闭
sed -ri 's/.*swap.*/#&/' /etc/fstab

# 根据规划设置主机名【master节点上操作】
hostnamectl set-hostname master
# 根据规划设置主机名【node1节点操作】
hostnamectl set-hostname node1
# 根据规划设置主机名【node2节点操作】
hostnamectl set-hostname node2

# 在master添加hosts
cat >> /etc/hosts << EOF
192.168.31.120 master
192.168.31.121 node1
192.168.31.122 node2
EOF

# 将桥接的IPv4流量传递到iptables的链(可跳过)
cat <<EOF | tee /etc/sysctl.d/k8s.conf
vm.swappiness = 0
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
# 生效
sysctl --system

# 时间同步
apt install ntpdate -y
ntpdate time.windows.com
```

## 安装Containerd

添加进行源

```sh
# 下载证书
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 配置容器镜像源
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新源
apt-get upgrade && apt-get update
```

安装

```sh
apt install containerd
```

`Containerd` 配置

```sh
# 初始化配置
containerd config default > /etc/containerd/config.toml

# 修改配置
vim /etc/containerd/config.toml
# sandbox_image = "registry.k8s.io/pause:3.6" 更新配置如下
sandbox_image = "registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.6"

# SystemdCgroup = false 更新配置如下
SystemdCgroup = true

# 重启服务
systemctl restart containerd.service

# 查看服务状态
systemctl status containerd.service

# 查看组件版本信息
containerd -version
ctr version
```

### Containerd使用

```sh
# 拉取镜像
# 镜像名不能简写，--all-platforms：所有平台，不加的话下载当前平台架构
ctr images pull --platform linux/amd64 docker.io/library/nginx:1.22

# 查看镜像
ctr images ls
# resp
REF                          TYPE                                                      DIGEST                                                                  SIZE     PLATFORMS                                                                                               LABELS 
docker.io/library/nginx:1.22 application/vnd.docker.distribution.manifest.list.v2+json sha256:fc5f5fb7574755c306aaf88456ebfbe0b006420a184d52b923d2f0197108f6b7 54.4 MiB linux/386,linux/amd64,linux/arm/v5,linux/arm/v7,linux/arm64/v8,linux/mips64le,linux/ppc64le,linux/s390x - 

# 导出镜像
ctr images export --platform linux/amd64 nginx.tar docker.io/library/nginx:1.22

# 导入镜像
ctr i import nginx.tar --platform linux/amd64

# 删除镜像
ctr image rm docker.io/library/nginx:1.22

# k8s导出镜像
ctr --namespace k8s.io images export --platform linux/amd64 nginx.tar docker.io/library/nginx:1.22

# k8s导入镜像
ctr -n k8s.io i import nginx.tar --platform linux/amd64
```

> `docker` 镜像和 `containerd` 镜像是一样的，可以相互导入导出
>
> `--platform`：导入导出操作必须要加上平台
>
> `--namespace` ：命名空间，`k8s.io`是kubernetes的命名空间

## 安装kubeadm，kubelet和kubectl

### 添加kubernetes软件源

阿里云

```sh
curl -fsSL https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/kubernetes-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
```

中科大

```sh
curl -fsSL https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/kubernetes-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] http://mirrors.ustc.edu.cn/kubernetes/apt kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
```

### 安装指定版本

```sh
# 更新源
apt-get update

# 安装最新版本
apt install -y kubelet kubeadm kubectl

# 安装kubelet、kubeadm、kubectl，同时指定版本
apt install kubelet=1.28.2-00 kubeadm=1.28.2-00 kubectl=1.28.2-00

# 设置开机启动
systemctl enable kubelet
```

## 部署Master节点

在master节点执行初始化操作

```sh
kubeadm init \
--apiserver-advertise-address=192.168.31.120 \
--image-repository registry.aliyuncs.com/google_containers \
--kubernetes-version v1.28.2 \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16 
```

> 由于默认拉取镜像地址`k8s.gcr.io`国内无法访问，这里指定阿里云镜像仓库地址。

相关命令

```sh
# 重置节点
kubeadm reset

# 删除指定节点
kubectl delete node node1
```

查看服务日志信息

```sh
journalctl -xeu kubelet
journalctl -xe
```

出现下面的情况时，表示kubernetes的镜像已经安装成功

```sh
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.31.120:6443 --token 0z1rjy.im58d7196ffqccpk \
        --discovery-token-ca-cert-hash sha256:9c72f989fffce252a65afd042c3480878b7b603d34eae2eede2cdcbc95b78486 
```

使用kubectl工具

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

执行完成后，查看我们正在运行的节点

```sh
[root@master ~]# kubectl get nodes
NAME     STATUS     ROLES    AGE    VERSION
master   NotReady   master   2m1s   v1.18.0
```

## 加入Kubernetes Node

下面我们需要到 `node1` 和 `node2` 服务器，执行下面的代码向集群添加新节点

执行在`kubeadm init` 输出的 `kubeadm join` 命令

```sh
kubeadm join 192.168.31.120:6443 --token 0z1rjy.im58d7196ffqccpk \
        --discovery-token-ca-cert-hash sha256:9c72f989fffce252a65afd042c3480878b7b603d34eae2eede2cdcbc95b78486 
```

> 默认token有效期为24小时，过期之后，该token就不可用了

Token相关命令

```sh
# 查询token
kubeadm token list

# 重新创建token
kubeadm token create --print-join-command
```

当我们把两个节点都加入进来后，我们就可以去Master节点查看节点状态。

```sh
[root@master ~]# kubectl get node
NAME     STATUS   ROLES           AGE     VERSION
master   NotReady    control-plane   4m54s   v1.28.2
node1    NotReady    <none>          4m15s   v1.28.2
node2    NotReady    <none>          3m55s   v1.28.2
```

## 安装CNI网络插件

上面的状态还是 `NotReady`，下面我们需要网络插件，来进行联网访问

```sh
# 下载网络插件配置
curl -fsSL -O https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
# 备用链接
curl -fsSL -O https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# 部署网络插件
kubectl apply -f kube-flannel.yml

# 删除配置，删除后可以重新部署
kubectl delete -f kube-flannel.yml

# 一键配置
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

## 测试运行

在Kubernetes集群中创建一个pod，验证是否正常运行

```sh
# 创建Nginx容器
root@master:~# kubectl create deployment nginx --image=nginx
deployment.apps/nginx created

# 查看状态
root@master:~# kubectl get pods
NAME                     READY   STATUS              RESTARTS   AGE
nginx-7854ff8877-6tpft   0/1     ContainerCreating   0          8s

# 暴露端口
root@master:~# kubectl expose deployment nginx --port=80 --type=NodePort
service/nginx exposed

# 查看一下对外的端口
root@master:~# kubectl get pod,svc
NAME                         READY   STATUS    RESTARTS   AGE
pod/nginx-7854ff8877-jfnn7   1/1     Running   0          119s

NAME                 TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
service/kubernetes   ClusterIP   10.96.0.1     <none>        443/TCP        6m7s
service/nginx        NodePort    10.111.38.8   <none>        80:31803/TCP   4s

# 外部访问
http://192.168.31.120:31803
```

## 问题汇总

### 普通用户无权限

报错信息

```sh
# 报错信息
WARN[0000] Unable to read /etc/rancher/k3s/k3s.yaml, please start server with --write-kubeconfig-mode or --write-kubeconfig-group to modify kube config permissions 
error: error loading config file "/etc/rancher/k3s/k3s.yaml": open /etc/rancher/k3s/k3s.yaml: permission denied
```

解决方法

```sh
# 声明环境变量
export KUBECONFIG=$HOME/.kube/config

# 创建配置目录
mkdir -p $HOME/.kube

# 将 K3s 的配置文件复制到该目录
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config

# 修改文件权限，确保当前用户可以访问
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 初始化超时

报错信息

```sh
# 报错信息
kubelet-check Initial timeout of 40s passed.
# 报错详情
failed to pull image \"registry.k8s.io/pause:3.6\": failed to pull and unpack image \"registry.k8s.io/pause:3.6\": f>
y.k8s.io/pause:3.6\": failed to pull image \"registry.k8s.io/pause:3.6\": failed to pull and unpack image \"registry.k8s.io/pause:3.6\": failed>
ry.k8s.io/pause:3.6\": failed to pull image \"registry.k8s.io/pause:3.6\": failed to pull and unpack image \"registry.k8s.io/pause:3.6\": faile>
8d5)\" with CreatePodSandboxError: \"Failed to create sandbox for pod \\\"etcd-vm-0-3_kube-system(f3061661aec984b83229f5c3781ef8d5)\\\": rpc er>
/pause/manifests/3.6\": dial tcp 173.194.174.82:443: i/o timeout" host=registry.k8s.io
```

解决方法

```sh
# 初始化配置
containerd config default > /etc/containerd/config.toml

# 修改配置
vim /etc/containerd/config.toml
# sandbox_image = "registry.k8s.io/pause:3.6" 更新配置如下
sandbox_image = "registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.6"

# SystemdCgroup = false 更新配置如下
SystemdCgroup = true

# 重启服务
systemctl restart containerd.service

# 查看服务状态
systemctl status containerd.service

# 查看组件版本信息
containerd -version
ctr version
```

### 没有找到主机

报错信息

```sh
[WARNING Hostname]: hostname "node1" could not be reached
[WARNING Hostname]: hostname "node1": lookup node1 on 192.168.31.1:53: no such host
```

解决方案

```sh
cat >> /etc/hosts << EOF
192.168.31.120 master
192.168.31.121 node1
192.168.31.122 node2
EOF
```

### kubectl连接被拒绝

报错信息

```sh
E1214 09:43:11.283902   19067 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E1214 09:43:11.284740   19067 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E1214 09:43:11.286597   19067 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E1214 09:43:11.288326   19067 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E1214 09:43:11.291358   19067 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

解决方案

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### crictl报错

报错信息

```sh
WARN[0000] image connect using default endpoints: [unix:///var/run/dockershim.sock unix:///run/containerd/containerd.sock unix:///run/crio/crio.sock unix:///var/run/cri-dockerd.sock]. As the default settings are now deprecated, you should set the endpoint instead. 
E1221 10:25:56.883414    4315 remote_image.go:119] "ListImages with filter from image service failed" err="rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing dial unix /var/run/dockershim.sock: connect: no such file or directory\"" filter="&ImageFilter{Image:&ImageSpec{Image:,Annotations:map[string]string{},},}"
FATA[0000] listing images: rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing dial unix /var/run/dockershim.sock: connect: no such file or directory" 
```

解决方案

```sh
cat > /etc/crictl.yaml <<EOF
runtime-endpoint: unix:///var/run/containerd/containerd.sock
image-endpoint: unix:///var/run/containerd/containerd.sock
timeout: 0
debug: false
pull-image-on-create: false
EOF
```

### 容器没有运行

报错信息

```sh
# 报错信息
error execution phase preflight: [preflight] Some fatal errors occurred:
        [ERROR CRI]: container runtime is not running: output: time="2023-12-13T15:59:50+08:00" level=fatal msg="validate service connection: CRI v1 runtime API is not implemented for endpoint \"unix:///var/run/containerd/containerd.sock\": rpc error: code = Unimplemented desc = unknown service runtime.v1.RuntimeService"
```

解决方案

```sh
# 查看 container 服务
systemctl status containerd

# 修改配置
vim /etc/containerd/config.toml
# 修改以下配置
#disabled_plugins = ["cri"]

# 重启 container 服务
systemctl restart containerd
```
