# Helm

## 概述

Helm 是一个 Kubernetes 应用的包管理工具，类似于 Ubuntu 的 APT 和 CentOS 中的 YUM。

Helm使用chart 来封装kubernetes应用的 YAML 文件，我们只需要设置自己的参数，就可以实现自动化的快速部署应用。

官方文档：[Helm | Docs](https://helm.sh/zh/docs/)

应用中心：[Artifact Hub](https://artifacthub.io/)

GitHub：[helm/helm: The Kubernetes Package Manager (github.com)](https://github.com/helm/helm)

## 三大概览

- `Chart`：代表着 Helm 包。

  - 它包含运行应用程序需要的所有资源定义和依赖，相当于模版。
  - 类似于maven中的`pom.xml`、Apt中的`dpkb`或 Yum中的`RPM`。

- `Repository`（仓库）：用来存放和共享 charts。

  - 不用的应用放在不同的仓库中。

- `Release`：是运行 chart 的实例。
  - 一个 chart 通常可以在同一个集群中安装多次。
  - 每一次安装都会创建一个新的 release，`release name`不能重复。

## 安装

### 二进制

下载 [需要的版本](https://github.com/helm/helm/releases)

```sh
# 解压
tar -zxvf helm-v3.0.0-linux-amd64.tar.gz
# 解压目录中找到helm程序，移动到需要的目录中
mv linux-amd64/helm /usr/local/bin/helm
```

### 脚本

```sh
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 包管理器

```sh
# macOS
brew install helm

# Debian/Ubuntu
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm

# dnf/yum
sudo dnf install helm
```

## 初始化

当您已经安装好了Helm之后，您可以添加一个chart 仓库。从 [Artifact Hub](https://artifacthub.io/packages/search?kind=0)中查找有效的Helm chart仓库。

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

当添加完成，您将可以看到可以被您安装的charts列表

```sh
helm search repo bitnami
```

## 常用命令

仓库

```sh
# 新增仓库
helm repo add bitnami https://charts.bitnami.com/bitnami

# 查看仓库
helm repo list

# 更新仓库
helm repo update

# 移除仓库
helm repo remove bitnami
```

> 安装包下载存放位置：`/root/.cache/helm/repository`

应用

```sh
# 列出charts仓库中所有可用的应用
helm search

# 查询指定应用
helm search memcached

# 查询指定应用的具体信息
helm inspect stable/memcached

# 用helm安装软件包,--name:指定release名字
helm install --name memcached1 stable/memcached

# 查看安装的软件包
helm list

# 删除指定引用
helm delete memcached1
```

chart

- `create`：根据给定的name创建一个新chart
- `fetch`：从仓库下载chart，并(可选项)将其解压缩到本地目录中
- `inspect`：chart详情
- `package`：打包chart目录到一个chart归档
- `lint`：语法检测
- `verify`：验证位于给定路径的chart已被签名且有效

release

- `get`：下载一个release
- `delete`：根据给定的release name，从Kubernetes中删除指定的release
- `install`：安装一个chart
- `list`：显示release列表
- `upgrade`：升级release
- `rollback`：回滚release到之前的一个版本
- `status`：显示release状态信息
- `history`：Fetch release历史信息

## 使用

### 单节点Mysql

```sh
# 查看chart
helm show chart bitnami/mysql
# 查看默认值
helm show values bitnami/mysql

# 安装mysql
helm install mysql \
--set-string auth.rootPassword="123456" \
--set primary.persistence.size=2Gi \
bitnami/mysql

# 查看设置
helm get values mysql
# 删除mysql
helm delete mysql
```

> 请提前配置好`StorageClass`，`helm`默认选择默认的`StorageClass`

## 离线使用

### nfs-subdir-external-provisioner

准备安装包

```sh
# 添加仓库
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner

# 下载
helm pull nfs-subdir-external-provisioner/nfs-subdir-external-provisioner --version 4.0.18
```

配置 `values.yaml` 文件

```sh
# 解压
tar -zxvf nfs-subdir-external-provisioner-4.0.18.tgz

# 进入文件夹
cd nfs-subdir-external-provisioner

# 修改配置文件
vi values.yaml
# 修改以下内容
image:
  repository: dyrnq/nfs-subdir-external-provisioner
nfs:
  server: 192.168.31.120
  path: /root/data/nfs-storage
storageClass:
  name: nfs-storage
```

运行

```sh
helm install nfs-subdir-external-provisioner -n kube-system -f values.yaml . 
```
