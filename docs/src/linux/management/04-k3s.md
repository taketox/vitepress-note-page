# K3s

## 为什么使用K3s

K3s 是一个轻量级的、完全兼容的 Kubernetes 发行版本。非常适合初学者。

K3s将所有 Kubernetes 控制平面组件都封装在单个二进制文件和进程中，文件大小<100M,占用资源更小，且包含了kubernetes运行所需要的部分外部依赖和本地存储提供程序。

K3s提供了离线安装包，安装起来非常方便，可以避免安装过程中遇到各种网络资源访问问题。

K3s特别适用于边缘计算、物联网、嵌入式和ARM移动端场景。

> K3s完全兼容kubernetes，二者的操作是一样的。

官方网站：[K3s](https://k3s.io/)

官方文档：[K3s - 轻量级 Kubernetes | K3s](https://docs.k3s.io/zh/)

GitHub：[k3s-io/k3s：轻量级 Kubernetes (github.com)](https://github.com/k3s-io/k3s)

## 集群搭建

K3s集群分为`k3s Server`(控制平面)和`k3s Agent`(工作节点)。所有的组件都打包在单个二进制文件中。

![An image](/img/linux/management/06.svg)

### 必要条件

- 两个节点不能具有相同的主机名。
- K3s Server 需要 6443 端口才能被所有节点访问。

### 系统要求

| Spec | 最低  | 推荐 |
| ---- | ----- | ---- |
| CPU  | 1 核  | 2 核 |
| RAM  | 512MB | 1 GB |

### 运行环境

| 主机名      | IP地址         | K3S版本      | 操作系统 |
| ----------- | -------------- | ------------ | -------- |
| k8s-master  | 192.168.56.109 | v1.28.4+k3s2 | Debian12 |
| k8s-worker1 | 192.168.56.111 | v1.28.4+k3s2 | Debian12 |
| k8s-worker2 | 192.168.56.112 | v1.28.4+k3s2 | Debian12 |

## 环境搭建

### 脚本安装

K3s 提供了一个安装脚本，可以方便地将其作为服务安装在基于 systemd 或 openrc 的系统上。该脚本可在 [https://get.k3s.io](https://get.k3s.io/) 获得。

```sh
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn sh -
```

运行此安装后：

- K3s 服务将被配置为在节点重启后或进程崩溃或被杀死时自动重启。
- 将安装其他实用程序，包括 `kubectl`、`crictl`、`ctr`、`k3s-killall.sh` 和 `k3s-uninstall.sh`。
- [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 文件将写入到 `/etc/rancher/k3s/k3s.yaml`，由 K3s 安装的 kubectl 将自动使用该文件。

### 离线安装

#### 下载安装包

- 安装脚本`install.sh`：[install.sh](https://get.k3s.io/)
- `k3s`二进制文件：[k3s](https://github.com/k3s-io/k3s/releases/download/v1.28.4%2Bk3s2/k3s)
- 必要的镜像：[Image-amd64](https://github.com/k3s-io/k3s/releases/download/v1.28.4%2Bk3s2/k3s-airgap-images-amd64.tar)

#### 执行安装脚本

将`k3s`二进制文件移动到`/usr/local/bin`目录，并添加执行权限

```sh
mv ./k3s /usr/local/bin
chmod +x /usr/local/bin/k3s
```

将镜像移动到`/var/lib/rancher/k3s/agent/images/`目录（无需解压）

```sh
mkdir -p /var/lib/rancher/k3s/agent/images/
cp ./k3s-airgap-images-amd64.tar /var/lib/rancher/k3s/agent/images/
```

在`k8s-master`节点执行：

```sh
#修改权限
chmod +x install.sh

#离线安装
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh

#安装完成后，查看节点状态
kubectl get node

#查看token
cat /var/lib/rancher/k3s/server/node-token
#K10029d7b64178f74561612bd741e95506371a73a2b55e011c22c92b164aa673a8a::server:9b09060f34e6475cc98f9f96f3d7c0b5
```

在`k8s-worker1`和`k8s-worker2`节点执行

```sh
INSTALL_K3S_SKIP_DOWNLOAD=true \
K3S_URL=https://192.168.31.120:6443 \
K3S_TOKEN=K10029d7b64178f74561612bd741e95506371a73a2b55e011c22c92b164aa673a8a::server:9b09060f34e6475cc98f9f96f3d7c0b5 \
./install.sh
```

## 测试运行

```sh
# 查看节点信息
kubectl get node
# resp
NAME     STATUS   ROLES                  AGE     VERSION
master   Ready    control-plane,master   2m32s   v1.28.4+k3s2
node1    Ready    <none>                 37s     v1.28.4+k3s2
node2    Ready    <none>                 26s     v1.28.4+k3s2
```
