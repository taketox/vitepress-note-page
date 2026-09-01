# 简介概览

## 概述

Multipass 是一款开源工具，可以在本地运行虚拟机，方便地部署和测试应用。Multipass 是由 Canonical 公司开发的，基于 KVM 虚拟化技术，支持 Linux、macOS 和 Windows 平台。

Multipass 的主要功能包括：

- 部署虚拟机：可以使用 multipass launch 命令在本地快速启动一个虚拟机。可以指定虚拟机的系统镜像、虚拟机的大小等参数。
- 管理虚拟机：可以使用 multipass list 命令查看本地运行的虚拟机列表，使用 multipass delete 命令删除虚拟机，使用 multipass stop 命令关闭虚拟机。
- 连接虚拟机：可以使用 multipass shell 命令连接到虚拟机的命令行界面，使用 multipass exec 命令在虚拟机中执行命令。

Multipass 可以帮助开发人员在本地测试应用，也可以帮助运维工程师在本地部署和管理软件。Multipass 可以与其他工具集成，例如 Ansible、puppet 等，帮助实现自动化运维流程。

总的来说，Multipass 是一款非常实用的工具，可以帮助我们在本地方便地部署和测试应用。它的使用方法简单，可以节省很多时间和精力，提高工作效率。Multipass 支持多个平台，可以满足不同用户的需求。

## 安装部署

### Linux

前提条件

Multipass for Linux 以 [snap](https://snapcraft.io/docs/) 包的形式发布，可在 [Snap Store 上](https://snapcraft.io/multipass)找到。在使用它之前，您需要安装 [snapd](https://docs.snapcraft.io/core/install)。默认情况下，Snap 包含在 Ubuntu 中。

安装 Multipass

```sh
snap install multipass

# 授予 Multipass 写入访问权限
ls -l /var/snap/multipass/common/multipass_socket
```

卸载 Multipass

```sh
snap remove multipass
```

### Windows

前提条件

Hyper-V：目前仅支持 **Windows 10 专业版**或**企业**版版本 **1803** 或更高版本。

VirtualBox：Multipass 还支持使用 VirtualBox 作为虚拟化提供程序。您可以[在此处](https://www.oracle.com/technetwork/server-storage/virtualbox/downloads/index.html)下载最新版本。

安装 Multipass

根据提示操作即可

运行

Multipass 默认使用 Hyper-V 作为其虚拟化提供程序。

```sh
# 设置驱动为hyperv
multipass set local.driver=hyperv

# 设置驱动为virtualbox
multipass set local.driver=virtualbox
```
