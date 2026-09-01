# 系统安装

## 概述

Proxmox VE基于Debian。这就是安装磁盘映像（ISO 文件）的原因 Proxmox 提供包括一个完整的 Debian 系统以及所有必要的 Proxmox VE 包。

安装程序将指导您完成设置，允许您对 本地磁盘，应用基本系统配置（例如，时区、 language， network） 并安装所有必需的软件包。此过程不应 需要几分钟以上。使用提供的 ISO 进行安装是 建议新用户和现有用户使用的方法。或者，Proxmox VE 可以安装在现有的 Debian 系统之上。

**Proxmox VE 版本和 Debian 版本之间的关系：**

| Proxmox VE 版本 | Debian 版本          | 首次发布 | Debian EOL | Proxmox 产品终止 |
| :-------------- | :------------------- | :------- | :--------- | :--------------- |
| Proxmox VE 8.x  | Debian 12 (Bokworm)  | 2023-06  | 待定       | 待定             |
| Proxmox VE 7.x  | Debian 11 (Bullseye) | 2021-07  | 2024-07    | 2024-07          |
| Proxmox VE 6.x  | Debian 10 (Buster)   | 2019-07  | 2022-07    | 2022-07          |
| Proxmox VE 5.x  | Debian 9 (Stretch)   | 2017-07  | 2020-07    | 2020-07          |
| Proxmox VE 4.x  | Debian 8 (Jessie)    | 2015-10  | 2018-06    | 2018-06          |
| Proxmox VE 3.x  | Debian 7 (Wheezy)    | 2013-05  | 2016-04    | 2017-02          |
| Proxmox VE 2.x  | Debian 6 (Squeeze)   | 2012-04  | 2014-05    | 2014-05          |
| Proxmox VE 1.x  | Debian 5 (Lenny)     | 2008-10  | 2012-03    | 2013-01          |

## 下载镜像包

下载安装程序 ISO 映像： [https://www.proxmox.com/en/downloads/category/iso-images-pve](https://www.proxmox.com/en/downloads/category/iso-images-pve)

Proxmox VE 安装介质是混合 ISO 映像。它以两种方式工作：

- 准备刻录到 CD 或 DVD 的 ISO 映像文件。
- 准备复制到 USB 闪存驱动器（U 盘）的原始扇区 （IMG） 映像文件。

## 制作安装介质

USB 闪存驱动器需要至少有 2 GB 的可用存储空间。

### GNU/Linux 指令

在类 Unix 操作系统上，使用 dd 命令将 ISO 映像复制到 USB 闪存驱动器。首先找到 U 盘的正确设备名称（请参阅 下文）。然后运行 dd 命令。

```sh
dd bs=1M conv=fdatasync if=./proxmox-ve_*.iso of=/dev/XYZ
```

> 请务必将 /dev/XYZ 替换为正确的设备名称，并调整 输入文件名 （*IF*） 路径

**找到正确的 USB 设备名称**

有两种方法可以找出 USB 闪存驱动器的名称。第一个是 比较 dmesg 命令输出前后的最后一行 插入闪存驱动器。第二种方法是比较 lsblk 命令的输出。

```sh
lsblk
```

### Windows

**使用UltraISO**

使用UltraISO刻录光盘映像。从 [https://cn.ultraiso.net/xiazai.html](https://cn.ultraiso.net/xiazai.html) 下载UltraISO。

**使用 Etcher**

Etcher 开箱即用。从 [https://etcher.io](https://etcher.io/) 下载 Etcher。

**使用 Rufus**

Rufus 是一个更轻量级的替代方案，但你需要使用 **DD 模式**来 让它工作。从 [https://rufus.ie](https://rufus.ie/) 下载 Rufus。

## 开启主机虚拟化

开启虚拟化功能的作用是让CPU 的虚拟化技术能应用在PVE系统上，其实在intel 4代CPU 后基本上都支持该技术，特别老的可能不支持，请根据自己的硬件进行判别。另外一点是硬件直通功能，也是需要硬件支持的。

1. 开机，进入BIOS设置界面，一般就是开机过程中连续按【Delete】按键。

2. 进入BIOS后， 进入【Advanced】选项，找到CPU相关的内容，将虚拟化和硬件直通打开选择【Enabled】
   - Intel Virtuallzation Technology，这个是虚拟化技术，打开了才能通过宿主机运行虚拟机；
   - VT-D， 这个是硬件直通技术，可以用来把PCI E设备直接给虚拟机使用，比如网卡，显卡；

## 使用 Proxmox VE 安装程序

安装程序 ISO 映像包括以下内容：

- 完整的操作系统（Debian Linux，64 位）
- Proxmox VE 安装程序，使用 ext4、XFS、 BTRFS（技术预览）或 ZFS 并安装操作系统。
- Proxmox VE Linux 内核，支持 KVM 和 LXC
- 用于管理虚拟机、容器和主机的完整工具集 系统、集群和所有必要的资源
- 基于 Web 的管理界面

### 安装Proxmox VE 菜单

![An image](/img/linux/vm/02.png)

- Install Proxmox VE：安装 Proxmox VE

> 启动正常安装。

- Install Proxmox VE：安装 Proxmox VE（调试模式）

> 在调试模式下启动安装。控制台将在几个 安装步骤。这有助于在出现问题时调试情况。 若要退出调试控制台，请按 Ctrl-D。此选项可用于启动实时 具有所有可用基本工具的系统。例如，使用它来修复降级的 ZFS rpool，或修复现有 Proxmox VE 设置的引导加载程序。

- Rescue Boot：救援启动

> 使用此选项，您可以引导现有安装。它搜索所有附加的 硬盘。如果它找到现有安装，它会直接引导到该安装 磁盘使用 ISO 中的 Linux 内核。如果有，这可能很有用 引导块 （grub） 的问题或 BIOS 无法读取引导块 从磁盘。

- Test Memory：测试内存

> 运行 memtest86+。这对于检查内存是否正常工作和可用非常有用 的错误。
>
> 安装向导只能与键盘一起使用。按钮 可以通过按 Alt 键并结合带下划线的字符来单击 从相应的按钮。例如，按 Alt + N 相当于 “下一步”按钮。

### 选择安装位置（硬盘）

![An image](/img/linux/vm/03.png)

默认文件系统是 ext4。选择 ext4 或 xfs 时，将使用逻辑卷管理器 （LVM）。可以自定义 LVM 配置选项。

### 基础系统配置

![An image](/img/linux/vm/04.png)

要求提供基本配置选项，例如位置、时间 区域和键盘布局。该位置用于选择下载服务器 附近以加快更新速度。安装程序通常会自动检测这些设置。

### 基础用户配置

![An image](/img/linux/vm/05.png)

超级用户（root）的密码和电子邮件地址需要 指定。密码必须至少包含 5 个字符。

### 基础网络配置

![An image](/img/linux/vm/06.png)

要求提供主机名称、ip地址、子网掩码、网关、DNS服务器地址。

> 在安装过程中 您可以使用 IPv4 或 IPv6 地址，但不能同时使用两者。

### 进入管理界面

完成以上配置后，系统会自动安装Proxmox VE。

重启系统之后，可以通过访问网址进入Proxmox VE的管理界面。

```sh
https://ip:8006/
```

![An image](/img/linux/vm/07.png)
