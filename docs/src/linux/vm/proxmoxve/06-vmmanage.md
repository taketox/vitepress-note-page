# 虚机管理

## 硬盘容量调整

### 调整硬盘容量

找到需要调整容量的VM，选择硬盘，调整大小。

![An image](/img/linux/vm/16.png)

本次实例使用的ubuntu系统，将原来32G的硬盘扩容至100G。

```sh
# 查看硬盘容量
taketo@ubuntu:~$ sudo fdisk -l

# 以删除无用显示信息
# 这里提示 GPT PMBR 大小不匹配
GPT PMBR size mismatch (67108863 != 209715199) will be corrected by write.
The backup GPT table is not on the end of the device. This problem will be corrected by write.
Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 2E9B57E5-C9FE-44AB-BF06-A96476C7A3D7

Device       Start      End  Sectors Size Type
/dev/sda1     2048     4095     2048   1M BIOS boot
/dev/sda2     4096  4198399  4194304   2G Linux filesystem
/dev/sda3  4198400 67106815 62908416  30G Linux filesystem


Disk /dev/mapper/ubuntu--vg-ubuntu--lv: 28 GiB, 30064771072 bytes, 58720256 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

### 修复分区表

首先，需要解决`GPT PMBR size mismatch (67108863 != 209715199) will be corrected by write.`报错。

```sh
# 修复分区表
taketo@ubuntu:~$ sudo  parted -l

Warning: Not all of the space available to /dev/sda appears to be used, you can
fix the GPT to use all of the space (an extra 142606336 blocks) or continue with
the current setting? 
# 这里输入 fix
Fix/Ignore? fix
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start   End     Size    File system  Name  Flags
 1      1049kB  2097kB  1049kB                     bios_grub
 2      2097kB  2150MB  2147MB  ext4
 3      2150MB  34.4GB  32.2GB


Model: Linux device-mapper (linear) (dm)
Disk /dev/mapper/ubuntu--vg-ubuntu--lv: 30.1GB
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags: 

Number  Start  End     Size    File system  Flags
 1      0.00B  30.1GB  30.1GB  ext4
```

> 再次输入`sudo fdisk -l`发现报错信息已经消失，修复成功。

使用 `parted` 将新增的容量，追加到原有分区。

```sh
taketo@ubuntu:~$ sudo parted /dev/sda
 GNU Parted 3.3
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.
# 输入 p free 查看详情
(parted) p free
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 209715200s
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start      End         Size        File system  Name  Flags
        34s        2047s       2014s       Free Space
 1      2048s      4095s       2048s                          bios_grub
 2      4096s      4198399s    4194304s    ext4
 3      4198400s   67106815s   62908416s
        67106816s  209715166s  142608351s  Free Space # 这里显示的是空闲空间
# 输入 resizepart 3 追加容量
(parted) resizepart 3
# 输入 End 结束位置：209715166s
End?  [67106815s]? 209715166s
# 输入 p free 查看详情
(parted) p free                                                           
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 209715200s
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags: 

Number  Start     End         Size        File system  Name  Flags
        34s       2047s       2014s       Free Space
 1      2048s     4095s       2048s                          bios_grub
 2      4096s     4198399s    4194304s    ext4
 3      4198400s  209715166s  205516767s # 这里已经追加成功
```

### 更新LVM物理卷

更新LVM中的PV物理卷

```sh
# 查看PV物理卷
taketo@ubuntu:~$ sudo pvdisplay
  --- Physical volume ---
  PV Name               /dev/sda3
  VG Name               ubuntu-vg
  PV Size               <30.00 GiB / not usable 0   
  Allocatable           yes 
  PE Size               4.00 MiB
  Total PE              7679
  Free PE               511
  Allocated PE          7168
  PV UUID               xXCYKl-70um-S6ma-0OPG-CL4C-cUQp-4rsFev

# 刷新容量
taketo@ubuntu:~$ pvresize /dev/sda3
  Physical volume "/dev/sda3" changed
  1 physical volume(s) resized or updated / 0 physical volume(s) not resized

# 再次查看
taketo@ubuntu:~$ sudo pvdisplay
  --- Physical volume ---
  PV Name               /dev/sda3
  VG Name               ubuntu-vg
  PV Size               <98.00 GiB / not usable 16.50 KiB
  Allocatable           yes 
  PE Size               4.00 MiB
  Total PE              25087
  Free PE               17919
  Allocated PE          7168
  PV UUID               xXCYKl-70um-S6ma-0OPG-CL4C-cUQp-4rsFev
```

### 扩容LVM逻辑卷

扩容逻辑卷

```sh
# 查看 LV Path
taketo@ubuntu:~$ sudo lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/ubuntu-lv
  LV Name                ubuntu-lv
  VG Name                ubuntu-vg
  LV UUID                hw3et7-YzUN-AWYm-rl7W-chqH-VRFz-BATF3r
  LV Write Access        read/write
  LV Creation host, time ubuntu-server, 2023-11-07 16:11:31 +0000
  LV Status              available
  # open                 1
  LV Size                28.00 GiB
  Current LE             7168
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0

# 扩容 LV 逻辑卷
taketo@ubuntu:~$ sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
  Size of logical volume ubuntu-vg/ubuntu-lv changed from 28.00 GiB (7168 extents) to <98.00 GiB (25087 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.

# 查看 LV 详情
taketo@ubuntu:~$ sudo lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/ubuntu-lv
  LV Name                ubuntu-lv
  VG Name                ubuntu-vg
  LV UUID                hw3et7-YzUN-AWYm-rl7W-chqH-VRFz-BATF3r
  LV Write Access        read/write
  LV Creation host, time ubuntu-server, 2023-11-07 16:11:31 +0000
  LV Status              available
  # open                 1
  LV Size                <98.00 GiB # 扩容成功
  Current LE             25087
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0
```

## 硬盘容量调整(交换分区)

### 调整硬盘容量

找到需要调整容量的VM，选择硬盘，调整大小。

![An image](/img/linux/vm/16.png)

本次实例使用的debian系统，将原来32G的硬盘扩容至100G。

```sh
# 查看硬盘容量
taketo@debian:~$ sudo fdisk -l
Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xf02ab200

Device     Boot    Start      End  Sectors  Size Id Type
/dev/sda1  *        2048 65107967 65105920   31G 83 Linux
/dev/sda2       65110014 67106815  1996802  975M  5 Extended
/dev/sda5       65110016 67106815  1996800  975M 82 Linux swap / Solaris
```

> 这台机器的硬盘扩容较为复杂，因为它的分区多了一个交换分区。要无损在线扩容需要首先删除交换分区。

### 分区扩容

```sh
taketo@debian:~$ sudo parted
GNU Parted 3.5
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type      File system     Flags
 1      1049kB  33.3GB  33.3GB  primary   ext4            boot
 2      33.3GB  34.4GB  1022MB  extended
 5      33.3GB  34.4GB  1022MB  logical   linux-swap(v1)  swap

(parted) resizepart 1                                                     
Warning: Partition /dev/sda1 is being used. Are you sure you want to continue?
Yes/No? yes                                                               
End?  [33.3GB]? 90GB                                                      
Error: Can't have overlapping partitions.
```

> 因为交换分区占据了磁盘末端，所以直接扩容分区1不成功

### 删除交换分区

思路上是先删除交换分区，然后扩容 `ext4` 分区，然后重新创建swap分区。

```sh
root@debian:/home/taketo# free -m
               total        used        free      shared  buff/cache   available
Mem:            7940         403        7426           0         337        7536
Swap:            974           0         974
# 首先禁用交换分区
root@debian:/home/taketo# swapoff -a
# 可以看到交换分区已经禁用了
root@debian:/home/taketo# free -h
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       405Mi       7.3Gi       480Ki       336Mi       7.4Gi
Swap:             0B          0B          0B
# parted分区
root@debian:/home/taketo# parted
GNU Parted 3.5
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.
# 打印分区信息
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type      File system     Flags
 1      1049kB  33.3GB  33.3GB  primary   ext4            boot
 2      33.3GB  34.4GB  1022MB  extended
 5      33.3GB  34.4GB  1022MB  logical   linux-swap(v1)  swap
# 删除分区5
(parted) rm 5
# 打印分区信息
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type      File system  Flags
 1      1049kB  33.3GB  33.3GB  primary   ext4         boot
 2      33.3GB  34.4GB  1022MB  extended
# 删除分区2
(parted) rm 2
# 打印分区信息
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  33.3GB  33.3GB  primary  ext4         boot
```

### 新建分区

```sh
root@debian:/home/taketo# parted
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  33.3GB  33.3GB  primary  ext4         boot
 
 # 扩容分区至90G
(parted) resizepart 1                                                     
Warning: Partition /dev/sda1 is being used. Are you sure you want to continue?
Yes/No? yes                                                               
End?  [33.3GB]? 90GB 
# 打印分区信息
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  90.0GB  90.0GB  primary  ext4         boot
 
 # 创建扩展分区2
(parted) mkpart
Partition type?  primary/extended? extended                               
Start? 90GB                                                               
End? 100GB
# 创建逻辑分区5 容量和扩展分区2一直
(parted) mkpart
Partition type?  primary/logical? logical                                 
File system type?  [ext2]? ext4                                           
Start? 90GB                                                               
End? 100GB
# 打印分区信息
(parted) print                                                            
Model: ATA QEMU HARDDISK (scsi)
Disk /dev/sda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type      File system  Flags
 1      1049kB  90.0GB  90.0GB  primary   ext4         boot
 2      90.0GB  100GB   9999MB  extended               lba
 5      90.0GB  100GB   9998MB  logical   ext4         lba
```

### 重启交换分区

```sh
# 调整文件系统容量
root@debian:/home/taketo# resize2fs /dev/sda1
resize2fs 1.47.0 (5-Feb-2023)
Filesystem at /dev/sda1 is mounted on /; on-line resizing required
old_desc_blocks = 4, new_desc_blocks = 11
The filesystem on /dev/sda1 is now 21972400 (4k) blocks long.
# 查看容量，已经扩容成功
root@debian:/home/taketo# df -h                                           
Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           795M  480K  794M   1% /run
/dev/sda1        83G   20G   60G  25% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           795M     0  795M   0% /run/user/1000

# 查看硬盘分区情况
root@debian:/home/taketo# fdisk -l
Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xf02ab200

Device     Boot     Start       End   Sectors  Size Id Type
/dev/sda1  *         2048 175781250 175779203 83.8G 83 Linux
/dev/sda2       175781888 195311615  19529728  9.3G  f W95 Ext'd (LBA)
/dev/sda5       175783936 195311615  19527680  9.3G 83 Linux

# 重建交换分区
root@debian:/home/taketo# mkswap /dev/sda5
Setting up swapspace version 1, size = 9.3 GiB (9998168064 bytes)
no label, UUID=f06376b6-2de4-4f8a-b9ce-88468b71dcf0

# 因为交换分区的UUID变了，所以需要编辑/etc/fstab替换之前的交换分区设置。如果不修改，会导致交换分区无法自动挂载。
# 查找硬盘UUID
root@debian:/home/taketo# blkid
/dev/sda5: UUID="064f1dfc-4c91-47ba-9372-1c1c150a0b1a" TYPE="swap" PARTUUID="f02ab200-05"
/dev/sda1: UUID="2d46bfd1-702a-4093-a09b-344d637bac76" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="f02ab200-01"

# 编辑/etc/fstab 修改以下内容
root@debian:/home/taketo# vi /etc/fstab
# swap was on /dev/sda5 during installation
UUID=064f1dfc-4c91-47ba-9372-1c1c150a0b1a none            swap    sw              0       0

# 查看交换分区
root@debian:/home/taketo# free -m
               total        used        free      shared  buff/cache   available
Mem:            7940         397        7419           0         350        7542
Swap:              0           0           0

# 启用交换分区
root@debian:/home/taketo# swapon /dev/sda5

# 查看交换分区，已经成功
root@debian:/home/taketo# free -m
               total        used        free      shared  buff/cache   available
Mem:            7940         405        7411           0         350        7534
Swap:           9534           0        9534
```

### 故障排除

问题描述：

扩容完成之后，重启启动。会卡在加载交换分区的地方。

![An image](/img/linux/vm/17.png)

等待一段时间后会报错，加载交换分区超时，然后进入系统。

![An image](/img/linux/vm/18.png)

问题原因：

因为交换分区重新创建之后UUID不一致，启动时，加载的还是原来交换分区的UUID

解决方法：

修改交换分区UUID

```sh
# 查看原交换分区UUID
root@debian:# cat /etc/initramfs-tools/conf.d/resume 
RESUME=UUID=0200bd42-0a2b-4ed3-b5aa-b577e3a72eb2

# 查看新的交换分区UUID
root@debian:/home/taketo# blkid
/dev/sda5: UUID="064f1dfc-4c91-47ba-9372-1c1c150a0b1a" TYPE="swap" PARTUUID="f02ab200-05"
/dev/sda1: UUID="2d46bfd1-702a-4093-a09b-344d637bac76" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="f02ab200-01"

# 修改UUID
root@debian:# vi /etc/initramfs-tools/conf.d/resume 
# 改为以下内容
RESUME=UUID=064f1dfc-4c91-47ba-9372-1c1c150a0b1a

# 重启
root@debian:# reboot
```
