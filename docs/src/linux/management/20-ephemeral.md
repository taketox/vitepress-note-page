# 临时存储

在前面已经提到，容器的生命周期可能很短，会被频繁地创建和销毁。那么容器在销毁时，保存在容器中的数据也会被清除。这种结果对用户来说，在某些情况下是不乐意看到的。为了持久化保存容器的数据，kubernetes引入了Volume的概念。

Volume是Pod中能够被多个容器访问的共享目录，它被定义在Pod上，然后被一个Pod里的多个容器挂载到具体的文件目录下，kubernetes通过Volume实现同一个Pod中不同容器之间的数据共享以及数据的持久化存储。Volume的生命容器不与Pod中单个容器的生命周期相关，当容器终止或者重启时，Volume中的数据也不会丢失。

kubernetes的Volume支持多种类型，比较常见的有下面几个：

- 临时存储：`EmptyDir`、`HostPath`
- 持久存储：`PV`、`PVC`、`StorageClass`、`NFS`
- 配置存储：`ConfigMap`、`Secret`

## EmptyDir

EmptyDir是最基础的Volume类型，一个EmptyDir就是Host上的一个空目录。

EmptyDir是在Pod被分配到Node时创建的，它的初始内容为空，并且无须指定宿主机上对应的目录文件，因为kubernetes会自动分配一个目录，当Pod销毁时， EmptyDir中的数据也会被永久删除。

EmptyDir用途如下：

- 临时空间，例如用于某些应用程序运行时所需的临时目录，且无须永久保留
- 一个容器需要从另一个容器中获取数据的目录（多容器共享目录）
- 接下来，通过一个容器之间文件共享的案例来使用一下EmptyDir。

### 测试运行

在一个Pod中准备两个容器nginx和busybox，然后声明一个Volume分别挂在到两个容器的目录中，然后nginx容器负责向Volume中写日志，busybox中通过命令将日志内容读到控制台。

![An image](/img/linux/management/34.png)

创建 `volume-emptydir.yaml` 文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-emptydir
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      ports:
        - containerPort: 80
      volumeMounts: # 将logs-volume挂在到nginx容器中，对应的目录为 /var/log/nginx
        - name: logs-volume
          mountPath: /var/log/nginx
    - name: busybox
      image: busybox:1.30
      command: ["/bin/sh", "-c", "tail -f /logs/access.log"] # 初始命令，动态读取指定文件中内容
      volumeMounts: # 将logs-volume 挂在到busybox容器中，对应的目录为 /logs
        - name: logs-volume
          mountPath: /logs
  volumes: # 声明volume， name为logs-volume，类型为emptyDir
    - name: logs-volume
      emptyDir: {}
```

测试运行

```sh
# 创建Pod
kubectl create -f volume-emptydir.yaml

# 查看pod
kubectl get pods volume-emptydir -o wide
# resp
NAME              READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
volume-emptydir   2/2     Running   0          75s   10.244.2.65   node1   <none>           <none>

# 通过podIp访问nginx
curl 10.244.2.65

# 通过kubectl logs命令查看指定容器的标准输出
kubectl logs -f volume-emptydir -c busybox
# resp
10.244.0.0 - - [19/Dec/2023:07:38:00 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.88.1" "-"
```

## HostPath

`EmptyDir` 中数据不会被持久化，它会随着Pod的结束而销毁，如果想简单的将数据持久化到主机中，可以选择 `HostPath`。

`HostPath` 就是将Node主机中一个实际目录挂在到Pod中，以供容器使用，这样的设计就可以保证Pod销毁了，但是数据依据可以存在于Node主机上。

![An image](/img/linux/management/35.png)

创建 `volume-hostpath.yaml` 文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-hostpath
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      ports:
        - containerPort: 80
      volumeMounts:
        - name: logs-volume
          mountPath: /var/log/nginx
    - name: busybox
      image: busybox:1.30
      command: ["/bin/sh", "-c", "tail -f /logs/access.log"]
      volumeMounts:
        - name: logs-volume
          mountPath: /logs
  volumes:
    - name: logs-volume
      hostPath:
        path: /root/logs
        type: DirectoryOrCreate # 目录存在就使用，不存在就先创建后使用
```

参数详解：

关于`volumes.hostPath.type`参数说明

- `DirectoryOrCreate`：目录存在就使用，不存在就先创建后使用
- `Directory`：目录必须存在
- `FileOrCreate`：文件存在就使用，不存在就先创建后使用
- `File`：文件必须存在 
- `Socket`：unix套接字必须存在
- `CharDevice`：字符设备必须存在
- `BlockDevice`：块设备必须存在

### 测试运行

```sh
# 创建Pod
kubectl create -f volume-hostpath.yaml

# 查看Pod
kubectl get pods volume-hostpath -o wide
# resp
NAME              READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
volume-hostpath   2/2     Running   0          8s    10.244.2.66   node1   <none>           <none>

# 访问nginx
curl 10.244.2.66
# 查看日志输出
kubectl logs -f volume-hostpath -c busybox

# 接下来就可以去host的/root/logs目录下查看存储的文件了
###  注意: 下面的操作需要到Pod所在的节点运行（案例中是node1）
root@node1:~# ls logs/
access.log  error.log

# 同样的道理，如果在此目录下创建一个文件，到容器中也是可以看到的
```

## NFS

`HostPath` 可以解决数据持久化的问题，但是一旦Node节点故障了，Pod如果转移到了别的节点，又会出现问题了，此时需要准备单独的网络存储系统，比较常用的用`NFS`、`CIFS`。

NFS是一个网络文件存储系统，可以搭建一台NFS服务器，然后将Pod中的存储直接连接到NFS系统上，这样的话，无论Pod在节点上怎么转移，只要Node跟NFS的对接没问题，数据就可以成功访问。

![An image](/img/linux/management/36.png)

### 测试运行

首先要准备NFS的服务器，这里为了简单，直接是 `master` 节点做NFS服务器

```sh
# Debian安装nfs
apt-get install nfs-common nfs-kernel-server

# 创建共享文件夹
mkdir -p /data/nfs && chmod 777 /data/nfs

# 修改配置文件
vi /etc/exports 
# 新增以下内容
/data/nfs 192.168.31.0/24(rw,sync,no_root_squash)

# 重启服务
systemctl restart nfs-kernel-server.service
```

要在的每个`node`节点上都安装下NFS，这样的目的是为了`node`节点可以驱动NFS设备

```sh
# Debian安装nfs
apt-get install nfs-common
```

创建`volume-nfs.yaml`文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-nfs
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      ports:
        - containerPort: 80
      volumeMounts:
        - name: logs-volume
          mountPath: /var/log/nginx
    - name: busybox
      image: busybox:1.30
      command: ["/bin/sh", "-c", "tail -f /logs/access.log"]
      volumeMounts:
        - name: logs-volume
          mountPath: /logs
  volumes:
    - name: logs-volume
      nfs:
        server: 192.168.31.120 #nfs服务器地址
        path: /data/nfs #共享文件路径
```

测试运行

```sh
# 创建pod
[root@k8s-master01 ~]# kubectl create -f volume-nfs.yaml

# 查看pod
kubectl get po -o wide
# resp
NAME         READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
volume-nfs   2/2     Running   0          6s    10.244.2.67   node1   <none>           <none>

# 查看nfs服务器上的共享目录，发现已经有文件了
root@master:~# ls /data/nfs/
access.log  error.log
```
