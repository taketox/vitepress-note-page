# 持久存储

## 概述

前面已经学习了使用NFS提供存储，此时就要求用户会搭建NFS系统，并且会在 `yaml` 配置 `NFS`。由于kubernetes支持的存储系统有很多，要求客户全都掌握，显然不现实。

为了能够屏蔽底层存储实现的细节，方便用户使用， kubernetes引入 `PV` 和 `PVC` 两种资源对象。

- `PV（Persistent Volume）`：是持久化卷的意思，是对底层的共享存储的一种抽象。一般情况下`PV`由kubernetes管理员进行创建和配置，它与底层具体的共享存储技术有关，并通过插件完成与共享存储的对接。
- `PVC（Persistent Volume Claim）`：是持久卷声明的意思，是用户对于存储需求的一种声明。换句话说，PVC其实就是用户向kubernetes系统发出的一种资源需求申请。

![An image](/img/linux/management/37.png)

使用了 `PV` 和 `PVC` 之后，工作可以得到进一步的细分：

- 存储：存储工程师维护
- PV： kubernetes管理员维护
- PVC：kubernetes用户维护

## PV

`PV` 是存储资源的抽象

### 资源清单

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv2
spec:
  nfs: # 存储类型，与底层真正存储对应
  capacity: # 存储能力，目前只支持存储空间的设置
    storage: 2Gi
  accessModes: # 访问模式
  storageClassName: # 存储类别
  persistentVolumeReclaimPolicy: # 回收策略
```

`PV` 配置参数说明：

- 存储类型

  底层实际存储的类型，kubernetes支持多种存储类型，每种存储类型的配置都有所差异

- 存储能力（capacity）

  目前只支持存储空间的设置 `storage=1Gi`，不过未来可能会加入`IOPS`、吞吐量等指标的配置

- 访问模式（accessModes）

  用于描述用户应用对存储资源的访问权限，访问权限包括下面几种方式：

  - `ReadWriteOnce（RWO）`：读写权限，但是只能被单个节点挂载
  - `ReadOnlyMany（ROX）`： 只读权限，可以被多个节点挂载
  - `ReadWriteMany（RWX）`：读写权限，可以被多个节点挂载

  >需要注意的是，底层不同的存储类型可能支持的访问模式不同

- 回收策略（persistentVolumeReclaimPolicy）

  当 `PV` 不再被使用了之后，对其的处理方式。目前支持三种策略：

  - `Retain` （保留）：保留数据，需要管理员手工清理数据
  - `Recycle`（回收）：清除 `PV` 中的数据，效果相当于执行 `rm -rf /thevolume/*`
  - `Delete` （删除）：与 `PV` 相连的后端存储完成 volume 的删除操作，当然这常见于云服务商的存储服务

  >需要注意的是，底层不同的存储类型可能支持的回收策略不同

- 存储类别

  `PV` 可以通过 `storageClassName` 参数指定一个存储类别

  - 具有特定类别的 `PV` 只能与请求了该类别的 `PVC` 进行绑定
  - 未设定类别的 `PV` 则只能与不请求任何类别的 `PVC` 进行绑定

- 状态（status）

  一个 `PV` 的生命周期中，可能会处于4中不同的阶段：

  - `Available`（可用）： 表示可用状态，还未被任何 `PVC` 绑定
  - `Bound`（已绑定）： 表示 `PV` 已经被 `PVC` 绑定
  - `Released`（已释放）： 表示 `PVC` 被删除，但是资源还未被集群重新声明
  - `Failed`（失败）： 表示该 `PV` 的自动回收失败

### 测试运行

使用NFS作为存储，来演示 `PV` 的使用，创建3个 `PV` ，对应NFS中的3个暴露的路径。

配置 NFS 环境

```sh
# 创建目录
mkdir /root/data/{pv1,pv2,pv3} -pv

# 暴露服务
more /etc/exports
# resp
/root/data/pv1     192.168.31.0/24(rw,no_root_squash)
/root/data/pv2     192.168.31.0/24(rw,no_root_squash)
/root/data/pv3     192.168.31.0/24(rw,no_root_squash)

# 重启服务
systemctl restart nfs-kernel-server.service
```

创建 `pv.yaml` 文件

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv1
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /root/data/pv1
    server: 192.168.31.120

---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv2
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /root/data/pv2
    server: 192.168.31.120

---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv3
spec:
  capacity:
    storage: 3Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /root/data/pv3
    server: 192.168.31.120
```

测试运行

```sh
# 创建 pv
kubectl create -f pv.yaml

# 查看pv
kubectl get pv -o wide
# resp
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv1    1Gi        RWX            Retain           Available                                   4s
pv2    2Gi        RWX            Retain           Available                                   4s
pv3    3Gi        RWX            Retain           Available                                   4s
```

## PVC

PVC是资源的申请，用来声明对存储空间、访问模式、存储类别需求信息。

### 资源清单

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc
  namespace: default
spec:
  accessModes: # 访问模式
  selector: # 采用标签对PV选择
  storageClassName: # 存储类别
  resources: # 请求空间
    requests:
      storage: 5Gi
```

`PVC` 配置参数说明：

- 访问模式（accessModes）

  用于描述用户应用对存储资源的访问权限

- 选择条件（selector）

  通过 `Label Selector` 的设置，可使PVC对于系统中己存在的 `PV` 进行筛选

- 存储类别（storageClassName）

  `PVC` 在定义时可以设定需要的后端存储的类别，只有设置了该 `class` 的 `PV` 才能被系统选出

- 资源请求（Resources ）

  描述对存储资源的请求

### 测试运行

创建`pvc.yaml`，申请 `pv`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc1
  namespace: default
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc2
  namespace: default
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc3
  namespace: default
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

使用 `PVC` 去申请 `PV`

```sh
# 创建pvc
kubectl create -f pvc.yaml

# 查看pvc
kubectl get pvc -o wide
# resp
NAME   STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc1   Bound    pv1      1Gi        RWX                           14s
pvc2   Bound    pv2      2Gi        RWX                           14s
pvc3   Bound    pv3      3Gi        RWX                           14s

# 查看pv
kubectl get pv -o wide
# resp
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM          STORAGECLASS   REASON   AGE
pv1    1Gi        RWX            Retain           Bound    default/pvc1                           5m48s
pv2    2Gi        RWX            Retain           Bound    default/pvc2                           5m48s
pv3    3Gi        RWX            Retain           Bound    default/pvc3                           5m48s
```

创建`pods.yaml`文件，使用`pv`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod1
  namespace: default
spec:
  containers:
    - name: busybox
      image: busybox:1.30
      command:
        [
          "/bin/sh",
          "-c",
          "while true;do echo pod1 >> /root/out.txt; sleep 10; done;",
        ]
      volumeMounts:
        - name: volume
          mountPath: /root/
  volumes:
    - name: volume
      persistentVolumeClaim:
        claimName: pvc1
        readOnly: false
---
apiVersion: v1
kind: Pod
metadata:
  name: pod2
  namespace: default
spec:
  containers:
    - name: busybox
      image: busybox:1.30
      command:
        [
          "/bin/sh",
          "-c",
          "while true;do echo pod2 >> /root/out.txt; sleep 10; done;",
        ]
      volumeMounts:
        - name: volume
          mountPath: /root/
  volumes:
    - name: volume
      persistentVolumeClaim:
        claimName: pvc2
        readOnly: false
```

测试运行

```sh
# 创建pod
kubectl create -f pods.yaml

# 查看pod
kubectl get pods -o wide
# resp
NAME   READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
pod1   1/1     Running   0          56s   10.244.2.68   node1   <none>           <none>
pod2   1/1     Running   0          56s   10.244.2.69   node1   <none>           <none>

# 查看pvc
kubectl get pvc -o wide
# resp
NAME   STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE     VOLUMEMODE
pvc1   Bound    pv1      1Gi        RWX                           4m19s   Filesystem
pvc2   Bound    pv2      2Gi        RWX                           4m19s   Filesystem
pvc3   Bound    pv3      3Gi        RWX                           4m19s   Filesystem

# 查看pv
kubectl get pv -o wide
# resp
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM          STORAGECLASS   REASON   AGE   VOLUMEMODE
pv1    1Gi        RWX            Retain           Bound    default/pvc1                           10m   Filesystem
pv2    2Gi        RWX            Retain           Bound    default/pvc2                           10m   Filesystem
pv3    3Gi        RWX            Retain           Bound    default/pvc3                           10m   Filesystem

# 查看nfs中的文件存储
root@master:~# ls data/pv1/
out.txt
root@master:~# ls data/pv2/
out.txt
```

## StorageClass

K8S有两种存储资源的供应模式：静态模式和动态模式，资源供应的最终目的就是将适合的 `PV` 与 `PVC` 绑定。

- 静态模式：管理员预先创建许多各种各样的 `PV`，等待 `PVC` 申请使用，繁琐且浪费资源。
- 动态模式：管理员无须预先创建 `PV`，而是通过 `StorageClass` 自动完成 `PV` 的创建以及与 `PVC` 的绑定。

`StorageClass` 就是动态模式，根据 `PVC` 的需求动态创建合适的 `PV` 资源，从而实现存储卷的按需创建。

![An image](/img/linux/management/45.png)

一个集群可以存在多个存储类 `StorageClass` 来创建和管理不同类型的存储。

每个 `StorageClass` 都有一个制备器 `Provisioner`，用来决定使用哪个卷插件创建持久卷。 该字段必须指定。

### Provisioner

在创建 PVC 时需要指定 `StorageClass`，PVC 选择到对应的 `StorageClass` 后，与其关联的 `Provisioner` 组件来动态创建 `PV` 资源。

`Provisioner`：其实就一个存储驱动，类似操作系统里的磁盘驱动。

`Provisioner` 的作用就是根据用户的需求，自动地为应用程序创建和管理存储卷。它可以与不同的存储后端进行集成，如云存储服务、网络存储、本地存储等。

### 资源清单

```sh
apiVersion: storage.k8s.io/v1 #资源版本
kind: StorageClass # 资源的类型
metadata: #资源的元数据
  name: nfs-storage # StorageClass 的名称
provisioner: example.com/nfs # 存储驱动
reclaimPolicy: Retain # 回收策略
allowVolumeExpansion: true # 允许扩展 PV 的容量
volumeBindingMode: Immediate # PV 绑定模式
parameters: # 参数根据不同的存储后端而变化
  server: nfs-server.example.com
  path: /exported/path
```

- `apiVersion`: 指定了资源的 API 版本，这里是 `storage.k8s.io/v1`。
- `kind`: 定义了资源的类型，这里是 StorageClass。
- `metadata`: 包含资源的元数据，包括名称。
  - `name`: 定义了 StorageClass 的名称，这里是 `nfs-storage`。
- `provisioner`: 指定了用于创建 PV（Persistent Volume）的存储后端的标识符。在这里，使用了一个示例的 NFS 存储后端，其标识符为 `example.com/nfs`。
- `reclaimPolicy`: 指定了 PV 回收策略，即当 PV 释放后如何处理。这里设置为 `Retain`，表示保留 PV 的数据，需要手动处理。
  - `Delete`：默认为`Delete`，当PVC被删除时，关联的PV 对象也会被自动删除。
  - `Retain`：当 PVC 对象被删除时，PV 卷仍然存在，数据卷状态变为"已释放(`Released`)"，此时卷上仍保留有数据，该卷还不能用于其他PVC，需要手动删除PV。
- `allowVolumeExpansion`: 指定是否允许扩展 PV 的容量。设置为 `true` 表示允许扩展。
- `volumeBindingMode`: 指定了 PV 绑定模式，即 PV 如何与 PVC 进行绑定。在这里，设置为 `Immediate`，表示立即绑定 `PV` 和 `PVC`。
  - `Immediate`：立即创建，创建PVC后，立即创建PV并完成绑定。
  - `WaitForFirstConsumer`：延迟创建，当使用该PVC的 Pod 被创建时，才会自动创建PV并完成绑定。
- `parameters`: 包含了 `StorageClass` 的参数，这些参数根据不同的存储后端而变化。
  - `server`: 指定 NFS 服务器的地址，这里是 `nfs-server.example.com`。
  - `path`: 指定 NFS 服务器上的共享路径，这里是 `/exported/path`。

### 测试运行

#### 安装Provisioner

由于 Kubernetes 不包含内部 NFS 驱动。需要使用外部驱动为 NFS 创建 `StorageClass`。

- `nfs-ganesha`：[kubernetes-sigs/nfs-ganesha-server-and-external-provisioner: NFS Ganesha Server and Volume Provisioner. (github.com)](https://github.com/kubernetes-sigs/nfs-ganesha-server-and-external-provisioner)
- `nfs-subdir`：[kubernetes-sigs/nfs-subdir-external-provisioner: Dynamic sub-dir volume provisioner on a remote NFS server. (github.com)](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner)

```sh
# 配置 nfs 服务
vi /etc/exports
# 新增以下内容
/root/data/nfs-storage     192.168.31.0/24(rw,no_root_squash)
# 重启服务
systemctl restart nfs-kernel-server

# 这里使用helm的方式安装nfs-subdir-external-provisioner
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/

# 安装
helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner -n kube-system \
    --set image.repository=dyrnq/nfs-subdir-external-provisioner \
    --set storageClass.name=nfs-storage \
    --set nfs.server=192.168.31.120 \
    --set nfs.path=/root/data/nfs-storage
    
# 查看是否安装成功
kubectl get po -n kube-system
# resp
NAME                                               READY   STATUS    RESTARTS   AGE
coredns-66f779496c-7hnbc                           1/1     Running   0          6d3h
coredns-66f779496c-pvm95                           1/1     Running   0          6d3h
etcd-master                                        1/1     Running   4          6d3h
kube-apiserver-master                              1/1     Running   3          6d3h
kube-controller-manager-master                     1/1     Running   3          6d3h
kube-proxy-gkcnp                                   1/1     Running   0          6d3h
kube-proxy-kpb5g                                   1/1     Running   0          6d3h
kube-proxy-v42wp                                   1/1     Running   0          6d3h
kube-scheduler-master                              1/1     Running   4          6d3h
metrics-server-5575f7cfcc-zlhxl                    1/1     Running   0          47h
# 成功运行
nfs-subdir-external-provisioner-764df86d4b-zqf6r   1/1     Running   0          11s

# 查看StorageClass
kubectl get sc
# resp
NAME          PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-storage   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   25s

# 删除
helm delete nfs-subdir-external-provisioner --namespace kube-system
```

>`image.repository`：修改了镜像的地址，默认用的国外镜像很有可能拉不下来
>
>`nfs.server`：你的NFS服务器地址
>
>`nfs.path`：存储目录
>
>`storageClass.archiveOnDelete`：是否在删除PVC时自动清理数据，默认true，不删除

#### 设置默认StorageClass

当一个 PVC 没有指定 storageClassName 时，会使用默认的 StorageClass。 集群中只能有一个默认的 StorageClass。如果不小心设置了多个默认的 StorageClass， 在动态制备 PVC 时将使用其中最新的默认设置的 StorageClass。

```sh
# 查看StorageClass
kubectl get sc
# resp
NAME                    PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-storage (default)   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   19m

# 取消默认StorageClass
kubectl patch storageclass nfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'storageclass.storage.k8s.io/nfs-storage patched
# 查看StorageClass
kubectl get sc
# resp
NAME          PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-storage   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   20m

# 设置默认StorageClass
kubectl patch storageclass nfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'storageclass.storage.k8s.io/nfs-storage patched
# 查看StorageClass
kubectl get sc
# resp
NAME                    PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-storage (default)   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   21m
```

#### 使用StorageClass

创建 `mysql.yaml` 文件

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-storage
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: nfs-storage
  resources:
    requests:
      storage: 2Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: mysql-pod
spec:
  containers:
    - name: mysql
      image: mysql:5.7
      env:
        - name: MYSQL_ROOT_PASSWORD
          value: "123456"
      ports:
        - containerPort: 3306
      volumeMounts:
        - mountPath: /var/lib/mysql #容器中的目录
          name: local-mysql-data
  volumes:
    - name: local-mysql-data
      persistentVolumeClaim:
        claimName: mysql-storage
```

测试运行

```sh
# 创建
kubectl create -f mysql.yaml 

# 查看pv, pvc, po
kubectl get pv,pvc,po
# resp
NAME                                                        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS   REASON   AGE
persistentvolume/pvc-32f698f7-c07a-4824-a1ea-fc3fb780ea90   2Gi        RWO            Delete           Bound    default/mysql-storage   nfs-storage             62s

NAME                                  STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/mysql-storage   Bound    pvc-32f698f7-c07a-4824-a1ea-fc3fb780ea90   2Gi        RWO            nfs-storage    62s

NAME            READY   STATUS    RESTARTS   AGE
pod/mysql-pod   1/1     Running   0          62s

# 查看文件
ls /root/data/nfs-storage/
default-mysql-storage-pvc-32f698f7-c07a-4824-a1ea-fc3fb780ea90

# 删除
kubectl delete -f mysql.yaml

# 查看pv, pvc, po
kubectl get pv,pvc,po
# resp
No resources found

# 查看文件,
ls /root/data/nfs-storage/
default-mysql-storage-pvc-32f698f7-c07a-4824-a1ea-fc3fb780ea90
```

## 生命周期

`PVC` 和 `PV` 是一一对应的，`PV` 和 `PVC` 之间的相互作用遵循以下生命周期：

- 资源供应：管理员手动创建底层存储和`PV`

- 资源绑定：用户创建 `PVC`，kubernetes负责根据PVC的声明去寻找 `PV`，并绑定

  在用户定义好 `PVC` 之后，系统将根据 `PVC` 对存储资源的请求在已存在的 `PV` 中选择一个满足条件的

  - 一旦找到，就将该 `PV` 与用户定义的 `PVC` 进行绑定，用户的应用就可以使用这个 `PVC` 了
  - 如果找不到，`PVC` 则会无限期处于 `Pending` 状态，直到等到系统管理员创建了一个符合其要求的`PV`

  >`PV`一旦绑定到某个 `PVC` 上，就会被这个 `PVC` 独占，不能再与其他 `PVC` 进行绑定了

- 资源使用：用户可在 `pod` 中像 `volume` 一样使用 `pvc`

  `Pod` 使用 `Volume` 的定义，将 `PVC` 挂载到容器内的某个路径进行使用。

- 资源释放：用户删除 `pvc` 来释放 `pv`

  当存储资源使用完毕后，用户可以删除 `PVC` ，与该 `PVC` 绑定的 `PV` 将会被标记为“已释放”，但还不能立刻与其他 `PVC` 进行绑定。通过之前 `PVC` 写入的数据可能还被留在存储设备上，只有在清除之后该 `PV` 才能再次使用。

- 资源回收：kubernetes根据 `pv` 设置的回收策略进行资源的回收

  对于 `PV`，管理员可以设定回收策略，用于设置与之绑定的 `PVC` 释放资源之后如何处理遗留数据的问题。只有 `PV` 的存储空间完成回收，才能供新的 `PVC` 绑定和使用

![An image](/img/linux/management/38.png)
