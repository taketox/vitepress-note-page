# 虚机安装

## Centos

### 下载镜像

[CentOS-7-x86_64-Minimal-2009.iso](https://iso.mirrors.ustc.edu.cn/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Minimal-2009.iso)

上传镜像文件

![An image](/img/linux/vm/30.png)

### 创建虚拟机

磁盘总线必须选择 `SCSI` ，否则安装界面卡死，其他默认即可

![An image](/img/linux/vm/31.png)

### 安装系统

跳过测试，直接开始安装

![An image](/img/linux/vm/32.png)

选择系统语言，默认即可

![An image](/img/linux/vm/33.png)

这里需要选择系统安装的硬盘，以及网络连接设置

![An image](/img/linux/vm/34.png)

创建ROOT用户，以及其他用户

![An image](/img/linux/vm/35.png)

## Debian

### 下载镜像

[Debian-12.2.0-amd64-DVD-1.iso](https://mirrors.ustc.edu.cn/debian-cd/current/amd64/iso-dvd/debian-12.2.0-amd64-DVD-1.iso)

上传镜像文件

![An image](/img/linux/vm/36.png)

### 创建虚拟机

默认即可

![An image](/img/linux/vm/37.png)

### 安装系统

选择图形化安装

![An image](/img/linux/vm/38.png)

选择语言，默认即可

![An image](/img/linux/vm/39.png)

选择地区，`other -> Asia -> Chain`选择中国

![An image](/img/linux/vm/40.png)

地区设置，默认即可

![An image](/img/linux/vm/41.png)

选择键盘，默认即可

![An image](/img/linux/vm/42.png)

主机名，自行填写

![An image](/img/linux/vm/43.png)

域名，自行填写

![An image](/img/linux/vm/44.png)

配置Root密码

![An image](/img/linux/vm/45.png)

设置普通用户

![An image](/img/linux/vm/46.png)

用户名，默认即可

![An image](/img/linux/vm/47.png)

设置普通用户密码

![An image](/img/linux/vm/48.png)

配置硬盘，默认即可

![An image](/img/linux/vm/49.png)

选择硬盘

![An image](/img/linux/vm/50.png)

不分区，默认即可

![An image](/img/linux/vm/51.png)

硬盘配置完成

![An image](/img/linux/vm/52.png)

应用配置至硬盘

![An image](/img/linux/vm/53.png)

配置包管理器，不配置

![An image](/img/linux/vm/54.png)

是否配置国内加速源，不配置

![An image](/img/linux/vm/55.png)

是否参与软件包使用调查，不参与

![An image](/img/linux/vm/56.png)

选择软件安装，自行选择（通常选择SSH服务和标准系统工具集）

![An image](/img/linux/vm/57.png)

是否要开机启动

![An image](/img/linux/vm/58.png)

选择开机启动硬盘

![An image](/img/linux/vm/59.png)

重启

![An image](/img/linux/vm/60.png)

## Ubuntu

### 下载镜像

[Ubuntu-20.04.6-live-server-amd64.iso](https://mirrors.ustc.edu.cn/ubuntu-releases/20.04.6/ubuntu-20.04.6-live-server-amd64.iso)

[img](/img/linux/vm/61.png)

### 创建虚拟机

默认即可

![An image](/img/linux/vm/62.png)

### 安装系统

选择语言，默认即可

![An image](/img/linux/vm/63.png)

设置版本更新地址，默认即可

![An image](/img/linux/vm/64.png)

设置键盘，默认即可

![An image](/img/linux/vm/65.png)

配置网络，默认即可

![An image](/img/linux/vm/66.png)

设置代理地址，不设置

![An image](/img/linux/vm/67.png)

设置国内镜像源，自行选择

![An image](/img/linux/vm/68.png)

配置硬盘

![An image](/img/linux/vm/69.png)

默认逻辑卷仅使用一般，修改逻辑卷大小

![An image](/img/linux/vm/70.png)

是否确认配置，确认

![An image](/img/linux/vm/71.png)

配置用户名，密码

![An image](/img/linux/vm/72.png)

安装SSH服务

![An image](/img/linux/vm/73.png)

服务快照，不选择

![An image](/img/linux/vm/74.png)

等待安装完成后重启即可

![An image](/img/linux/vm/75.png)

## UNAS

由于UNAS5.0版本需要激活后才能使用，这里选择还原的方式安装

### 准备工作

将以下3个备份文件上传至 `/var/lib/vz/dump` 文件夹

- `vzdump-qemu-100-2023_06_10-13_06_48.log`
- `vzdump-qemu-100-2023_06_10-13_06_48.vma.zst`
- `vzdump-qemu-100-2023_06_10-13_06_48.vma.zst.notes`

### 还原备份

文件上传后，在 local 存储下，会出现 `vzdump-qemu-100-2023_06_10-13_06_48.vma.zst` 备份

![An image](/img/linux/vm/76.png)

还原`VM`，配置 `VMID` 和存储位置

![An image](/img/linux/vm/77.png)

还原成功

![An image](/img/linux/vm/78.png)

直接运行

![An image](/img/linux/vm/79.png)
