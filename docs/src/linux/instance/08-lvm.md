# 逻辑卷管理

LVM是Logical Volume Manager（逻辑卷管理）的简写，它是Linux环境下对磁盘分区进行管理的一种机制。LVM能够对磁盘分区进行动态管理，可以随时改变分区的大小，并且可以将多个分区组成一个逻辑卷组，所有的逻辑卷可以跨越多个物理磁盘。这些特点使得LVM能够方便地管理大型磁盘存储系统，并且提高了磁盘的利用率和灵活性。

下面是一些相关的名词和概念：

- 物理卷（Physical Volume，PV）：
物理卷是硬盘、硬盘分区或RAID设备的抽象，它是逻辑卷管理器的底层存储单元。物理卷可以是硬盘的整个分区，也可以是分区的一部分。

- 卷组（Volume Group，VG）：
卷组是由一个或多个物理卷组成的逻辑存储单元。卷组可以由多个物理卷组成，这些物理卷可以来自不同的硬盘。

- 逻辑卷（Logical Volume，LV）：
逻辑卷是从卷组中创建的逻辑存储单元。逻辑卷可以被看作是分区的替代品。逻辑卷是LVM的核心，它提供了灵活的存储管理，可以在不破坏数据的情况下动态地调整存储空间。

- 物理区（Physical Extent，PE）：
物理区是物理卷和逻辑卷之间的抽象单元。物理区是卷组的最小存储单元，通常是4MB到16MB之间。一个逻辑卷由多个物理区组成，它们的大小可以不同。

- 文件系统：
文件系统是用于在逻辑卷上存储和管理文件的一种结构。文件系统是LVM之上的一层抽象，它通常与逻辑卷一起使用。

通过LVM，我们可以轻松地扩展、缩小和移动逻辑卷。在 LVM 中，逻辑卷是通过物理卷组成的，物理卷是通过硬盘分区或整个硬盘创建的。逻辑卷组织着一个或多个逻辑卷，每个逻辑卷可以被格式化并用作文件系统。因此，如果我们需要进行磁盘扩容，也就是逻辑卷扩容，即只要添加新的物理卷，并将它们添加到逻辑卷组中即可。

## LVM命令

|    功能描述     | 物理卷（Physical Volume） | 卷组（Volume Group） | 逻辑卷（Logical volume） |
| :-------------: | :-----------------------: | :------------------: | :----------------------: |
| 建立（create）  |        `pvcreate`         |      `vgcreate`      |        `lvcreate`        |
| 移除（remove）  |        `pvremove`         |      `vgremove`      |        `lvremove`        |
|  扫描（scan）   |         `pvscan`          |       `vgscan`       |         `lvscan`         |
| 显示（display） |        `pvdisplay`        |     `vgdisplay`      |       `lvdisplay`        |
| 扩展（extend）  |             \             |      `vgextend`      |        `lvextend`        |
| 减少（reduce）  |             \             |      `vgreduce`      |        `lvreduce`        |

## 创建LVM

新增一个30G的硬盘，将硬盘分区为`sdb1`和`sdb2`。

### 新建分区

```sh
taketo@ubuntu:~$ sudo fdisk /dev/sdb

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): p
Disk /dev/sdb: 30 GiB, 32212254720 bytes, 62914560 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x6beb95f2

Device     Boot    Start      End  Sectors Size Id Type
/dev/sdb1           2048 20973567 20971520  10G 83 Linux
/dev/sdb2       20973568 41945087 20971520  10G 83 Linux
```

### 创建PV

```sh
# 使用sdb1创建PV
taketo@ubuntu:~$ sudo pvcreate /dev/sdb1
  Physical volume "/dev/sdb1" successfully created.

# 使用sdb2创建PV
taketo@ubuntu:~$ sudo pvcreate /dev/sdb2
  Physical volume "/dev/sdb2" successfully created.

# 查看pv情况
taketo@ubuntu:~$ sudo pvs
  PV         VG        Fmt  Attr PSize    PFree 
  /dev/sda3  ubuntu-vg lvm2 a--  <130.00g 65.00g
  /dev/sdb1            lvm2 ---    10.00g 10.00g
  /dev/sdb2            lvm2 ---    10.00g 10.00g
```

### 创建VG组

```sh
# 使用刚创建的PV创建VG组，名称为vgtest
taketo@ubuntu:~$ sudo vgcreate vgtest /dev/sdb1 /dev/sdb2
  Volume group "vgtest" successfully created

# 查看VG情况
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize    VFree 
  ubuntu-vg   1   1   0 wz--n- <130.00g 65.00g
  vgtest      2   0   0 wz--n-   19.99g 19.99g
```

### 创建LVM

```sh
# 使用VG组vgtest中的2G创建lvtest1
taketo@ubuntu:~$ sudo lvcreate -n lvtest1 -L 2G vgtest
  Logical volume "lvtest1" created.

# 使用现VG组vgtest中的30%创建lvtest2
taketo@ubuntu:~$ sudo lvcreate -n lvtest2 -L 30%VG vgtest
  Logical volume "lvtest2" created.

# 使用现VG组vgtest中剩余的空间创建lvtest3
taketo@ubuntu:~$ sudo lvcreate -n lvtest3 -l 100%free vgtest
  Logical volume "lvtest3" created.

# 查看lv的情况
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g                                                    
  lvtest1   vgtest    -wi-a-----   2.00g                                                    
  lvtest2   vgtest    -wi-a-----  <6.00g                                                    
  lvtest3   vgtest    -wi-a----- <12.00g     
```

### 创建文件系统并挂载

```sh
# 格式化
taketo@ubuntu:~$ sudo mkfs.ext4 /dev/vgtest/lvtest1 

taketo@ubuntu:~$ sudo mkfs.ext4 /dev/vgtest/lvtest2

taketo@ubuntu:~$ sudo mkfs.ext4 /dev/vgtest/lvtest3

# 创建目录
taketo@ubuntu:~$ sudo mkdir /test1

taketo@ubuntu:~$ sudo mkdir /test2

taketo@ubuntu:~$ sudo mkdir /test3

# 挂载目录
taketo@ubuntu:~$ sudo mount /dev/vgtest/lvtest1 /test1/

taketo@ubuntu:~$ sudo mount /dev/vgtest/lvtest2 /test2/

taketo@ubuntu:~$ sudo mount /dev/vgtest/lvtest3 /test3/

# 查看挂载情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest1         2.0G   24K  1.8G   1% /test1
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3
```

## LVM缩容

::: warning
LVM可以进行在线扩容，所以不需要解挂载。但LVM的缩容必须是离线，需要解挂载。
:::

```sh
# 查看挂载情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest1         2.0G   24K  1.8G   1% /test1
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3

# 对lvtest1进行解挂载
taketo@ubuntu:~$ sudo umount /test1

# resize2fs命令是用来增大或者收缩未加载的“ext2/ext3/ext4”文件系统的大小、刷新文件系统设备的缓冲区。
# 注意：缩容可能会破坏缓冲区的数据，所以需要先resize2fs。
taketo@ubuntu:~$ sudo resize2fs /dev/mapper/vgtest-lvtest1
resize2fs 1.46.5 (30-Dec-2021)
Please run 'e2fsck -f /dev/mapper/vgtest-lvtest1' first.

taketo@ubuntu:~$ sudo e2fsck -f /dev/mapper/vgtest-lvtest1
e2fsck 1.46.5 (30-Dec-2021)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
/dev/mapper/vgtest-lvtest1: 11/131072 files (0.0% non-contiguous), 26156/524288 blocks

taketo@ubuntu:~$ sudo resize2fs /dev/mapper/vgtest-lvtest1
resize2fs 1.46.5 (30-Dec-2021)
The filesystem is already 524288 (4k) blocks long.  Nothing to do!

# 查看lvtest1空间为2G
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g                                                    
  lvtest1   vgtest    -wi-a-----   2.00g                                                    
  lvtest2   vgtest    -wi-ao----  <6.00g                                                    
  lvtest3   vgtest    -wi-ao---- <12.00g    

# 对lvtest1进行缩容，将其缩容到1.5G
taketo@ubuntu:~$ sudo lvreduce -L 1.5G /dev/mapper/vgtest-lvtest1
  WARNING: Reducing active logical volume to 1.50 GiB.
  THIS MAY DESTROY YOUR DATA (filesystem etc.)
Do you really want to reduce vgtest/lvtest1? [y/n]: y
  Size of logical volume vgtest/lvtest1 changed from 2.00 GiB (512 extents) to 1.50 GiB (384 extents).
  Logical volume vgtest/lvtest1 successfully resized.

# 再次查看lvtest1空间为1.5G
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g                                                    
  lvtest1   vgtest    -wi-a-----   1.50g                                                    
  lvtest2   vgtest    -wi-ao----  <6.00g                                                    
  lvtest3   vgtest    -wi-ao---- <12.00g     

# 采用resize2fs命令来收缩未加载的“ext2/ext3/ext4”文件系统的大小。
sudo resize2fs /dev/mapper/vgtest-lvtest1
resize2fs 1.46.5 (30-Dec-2021)
Resizing the filesystem on /dev/mapper/vgtest-lvtest1 to 393216 (4k) blocks.
The filesystem on /dev/mapper/vgtest-lvtest1 is now 393216 (4k) blocks long.

# 重新挂载lvtest1到/test1
taketo@ubuntu:~$ sudo mount /dev/vgtest/lvtest1 /test1/

# 查看挂载情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3
/dev/mapper/vgtest-lvtest1         1.5G   24K  1.4G   1% /test1
```

## LVM扩容

::: warning
LVM可以进行在线扩容，所以不需要解挂载。
:::

```sh
# 对lvtest1进行扩容（lvs可以查看到lvtest1变为2G）
# 扩容0.5G
taketo@ubuntu:~$ sudo lvextend -L +0.5G /dev/mapper/vgtest-lvtest1
  Size of logical volume vgtest/lvtest1 changed from 1.50 GiB (384 extents) to 2.00 GiB (512 extents).
  Logical volume vgtest/lvtest1 successfully resized.
 
# 查看lv情况
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g                                                    
  lvtest1   vgtest    -wi-ao----   2.00g                                                    
  lvtest2   vgtest    -wi-ao----  <6.00g                                                    
  lvtest3   vgtest    -wi-ao---- <12.00g      
  
# 查看挂载情况，仍然是1.5G
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3
/dev/mapper/vgtest-lvtest1         1.5G   24K  1.4G   1% /test1

# 采用resize2fs命令来增大未加载的“ext2/ext3/ext4”文件系统的大小。
taketo@ubuntu:~$ sudo resize2fs /dev/mapper/vgtest-lvtest1
resize2fs 1.46.5 (30-Dec-2021)
Filesystem at /dev/mapper/vgtest-lvtest1 is mounted on /test1; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 1
The filesystem on /dev/mapper/vgtest-lvtest1 is now 524288 (4k) blocks long.

# 再次查看挂载情况，已经是2G
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3
/dev/mapper/vgtest-lvtest1         2.0G   24K  1.8G   1% /test1

```

## LVM的卸载

VM的卸载过程与LVM的创建过程完全相反

### 解挂载LV

```sh
# 查看挂载情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
/dev/mapper/vgtest-lvtest2         5.9G   24K  5.6G   1% /test2
/dev/mapper/vgtest-lvtest3          12G   24K   12G   1% /test3
/dev/mapper/vgtest-lvtest1         2.0G   24K  1.8G   1% /test1

# 解挂/test1
sudo umount /test1

# 解挂/test2
sudo umount /test2

# 解挂/test3
sudo umount /test3

# 再次查看挂载情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
```

### 删除LV

```sh
# 查看lv
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g                                                    
  lvtest1   vgtest    -wi-a-----   2.00g                                                    
  lvtest2   vgtest    -wi-a-----  <6.00g                                                    
  lvtest3   vgtest    -wi-a----- <12.00g                                                    

# 删除lvtest1
taketo@ubuntu:~$ sudo lvremove /dev/mapper/vgtest-lvtest1
Do you really want to remove and DISCARD active logical volume vgtest/lvtest1? [y/n]: y
  Logical volume "lvtest1" successfully removed

# 删除lvtest2
taketo@ubuntu:~$ sudo lvremove /dev/mapper/vgtest-lvtest2
Do you really want to remove and DISCARD active logical volume vgtest/lvtest2? [y/n]: y
  Logical volume "lvtest2" successfully removed

# 删除lvtest3
taketo@ubuntu:~$ sudo lvremove /dev/mapper/vgtest-lvtest3
Do you really want to remove and DISCARD active logical volume vgtest/lvtest3? [y/n]: y
  Logical volume "lvtest3" successfully removed

# 查看lv
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <65.00g    
```

### 删除VG组

```sh
# 查看vg情况
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize    VFree 
  ubuntu-vg   1   1   0 wz--n- <130.00g 65.00g
  vgtest      2   0   0 wz--n-   19.99g 19.99g
  
# 删除vgtest
taketo@ubuntu:~$ sudo vgremove /dev/mapper/vgtest
  Volume group "vgtest" successfully removed
  
# 查看vg情况
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize    VFree 
  ubuntu-vg   1   1   0 wz--n- <130.00g 65.00g
```

### 删除PV

```sh
# 查看pv情况
taketo@ubuntu:~$ sudo pvs
  PV         VG        Fmt  Attr PSize    PFree 
  /dev/sda3  ubuntu-vg lvm2 a--  <130.00g 65.00g
  /dev/sdb1            lvm2 ---    10.00g 10.00g
  /dev/sdb2            lvm2 ---    10.00g 10.00g

# 删除/dev/sdb1
taketo@ubuntu:~$ sudo pvremove /dev/sdb1
  Labels on physical volume "/dev/sdb1" successfully wiped.
  
# 删除/dev/sdb2
taketo@ubuntu:~$ sudo pvremove /dev/sdb2
  Labels on physical volume "/dev/sdb2" successfully wiped.

# 查看pv情况
taketo@ubuntu:~$ sudo pvs
  PV         VG        Fmt  Attr PSize    PFree 
  /dev/sda3  ubuntu-vg lvm2 a--  <130.00g 65.00g
```
