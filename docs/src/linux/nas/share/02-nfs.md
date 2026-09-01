# NFS

NFS（Network File System）是一种分布式文件系统协议，最早由 Sun Microsystems 在 1984 年开发。NFS 允许用户通过网络访问远程计算机上的文件系统，就像访问本地存储一样。它是一种轻量级、高效的文件共享解决方案，广泛应用于 Linux 和 UNIX 系统中。

## 安装 NFS 软件包

**在服务器端安装 NFS：**

```bash
# 对于 Debian/Ubuntu 的系统
sudo apt update && apt install nfs-kernel-server -y
# 对于 RHEL/CentOS 的系统
sudo yum install nfs-utils -y
```

**在客户端安装 NFS：**

```bash
# 对于 Debian/Ubuntu 的系统
sudo apt install nfs-common -y
# 对于 RHEL/CentOS 的系统
sudo yum install nfs-utils -y
```

## 配置 NFS 服务

指定一个目录作为共享目录：

```bash
sudo mkdir -p /mnt/nfs_share
sudo chmod 777 /mnt/nfs_share
```

在 `/etc/exports` 文件中添加共享配置：

```bash
sudo nano /etc/exports
```

添加以下内容：

```tex
/mnt/nfs_share    *(rw,sync,no_subtree_check)
```

配置说明：

- `/mnt/nfs_share`：共享目录路径。
- `*`：允许所有客户端访问。可以用特定 `IP` 地址或网段（如 `192.168.1.0/24`）代替。
- `rw`：读写权限。
- `sync`：同步写操作，数据立即写入磁盘。
- `no_subtree_check`：禁用子目录检查，提高性能。

运行以下命令以使配置生效：

```bash
sudo exportfs -rav
```

启动并启用 NFS 服务

```bash
sudo systemctl enable nfs-server
sudo systemctl start nfs-server
```

## 客户端挂载 NFS 共享目录

使用以下命令查看服务器共享的目录：

```bash
showmount -e <服务器IP>
```

示例输出：

```bash
Export list for <服务器IP>:
/mnt/nfs_share *
```

创建挂载点：

```bash
sudo mkdir -p /mnt/nfs_client_share
```

挂载共享目录：

```bash
sudo mount <服务器IP>:/mnt/nfs_share /mnt/nfs_client_share
```

示例：

```bash
sudo mount 192.168.1.100:/mnt/nfs_share /mnt/nfs_client_share
```

验证挂载，进入挂载点查看内容：

```bash
cd /mnt/nfs_client_share
ls
```

配置开机自动挂载，编辑 `/etc/fstab` 文件：

```bash
sudo nano /etc/fstab
```

添加以下行：

```bash
<服务器IP>:/mnt/nfs_share /mnt/nfs_client_share nfs defaults 0 0
```

保存后测试挂载：

```bash
sudo mount -a
```

## 防火墙配置

确保服务器端防火墙允许以下端口：

- NFS：2049
- RPC：111

```bash
# 对于 Debian/Ubuntu 的系统
sudo ufw allow from <客户端IP或网段> to any port 2049
sudo ufw allow from <客户端IP或网段> to any port 111
sudo ufw reload
# 对于 RHEL/CentOS 的系统
sudo firewall-cmd --permanent --add-service=nfs
sudo firewall-cmd --permanent --add-service=rpc-bind
sudo firewall-cmd --reload
```
