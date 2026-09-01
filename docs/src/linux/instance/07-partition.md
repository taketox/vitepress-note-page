# 硬盘分区

Linux中硬盘分区主要依靠`fdisk`命令。

`fdisk`是一个常用的Linux分区命令，它用于管理硬盘分区。下面是`fdisk`命令的详细说明和选项含义：

|         选项         |                             描述                             |
| :------------------: | :----------------------------------------------------------: |
| `fdisk [设备文件名]` | 该命令用于打开指定设备的分区表。例如，`fdisk /dev/sda`表示对`/dev/sda`硬盘进行分区操作。 |
|     `p / print`      | 输入p或print可以打印当前硬盘的分区表，显示已经存在的分区信息。 |
|      `n / new`       | 输入n或new可以创建一个新的分区。系统会提示选择分区类型（主分区、扩展分区或逻辑分区）和起始扇区等信息。 |
|     `e / extend`     | 如果选择创建扩展分区，需要输入e或extend。扩展分区可以包含多个逻辑分区。 |
|      `l / list`      |           输入l或list可以列出所有可用的分区类型。            |
|     `s / select`     |          输入s或select可以选择一个已经存在的分区。           |
|     `d / delete`     |          输入d或delete可以删除一个已经存在的分区。           |
|     `w / write`      |        输入w或write可以保存并退出`fdisk`命令行界面。         |
|      `q / quit`      |      输入q或quit可以退出`fdisk`命令行界面，不保存更改。      |
|      `m / help`      | 在`fdisk`命令行界面中，输入m或help可以查看帮助信息，列出所有可用命令和选项。 |

## 新建分区

有一块还没有分区的硬盘`/dev/sdb`空间为30GB。现将该硬盘分为2个分区

- 分区一(sdb1)：空间10GB，分区类型：Linux
- 分区二(sdb2)：空间10GB，分区类型：Linux LVM
- 分区三(sdb3)：空间9GB，分区类型：Extended

::: details

```sh
taketo@ubuntu:~$ sudo fdisk /dev/sdb
[sudo] password for taketo: 

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

# 打印分区信息，没有分区
Command (m for help): p
Disk /dev/sdb: 30 GiB, 32212254720 bytes, 62914560 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x6beb95f2

# 新建分区
Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
# 分区号
Partition number (1-4, default 1): 
# 起始扇区，范围从2048到62914559，默认值为2048。扇区是硬盘上的最小存储单位，每个扇区可以存储512个字节的数据。
First sector (2048-62914559, default 2048): 
# 是指最后一个扇区，可以通过指定扇区数、增加或减少扇区数或者指定容量单位来设置大小。范围从2048到62914559，默认值为62914559。如果选择+10G，则表示创建一个大小为10GB的分区。
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-62914559, default 62914559): +10G

Created a new partition 1 of type 'Linux' and of size 10 GiB.

# 同上
Command (m for help): n
Partition type
   p   primary (1 primary, 0 extended, 3 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (2-4, default 2): 
First sector (20973568-62914559, default 20973568): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (20973568-62914559, default 62914559): +10G

Created a new partition 2 of type 'Linux' and of size 10 GiB.

# 新建分区
Command (m for help): n
Partition type
   p   primary (2 primary, 0 extended, 2 free)
   e   extended (container for logical partitions)
# 扩展分区
Select (default p): e
Partition number (3,4, default 3): 
First sector (41945088-62914559, default 41945088): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (41945088-62914559, default 62914559): +10G
Value out of range.
Last sector, +/-sectors or +/-size{K,M,G,T,P} (41945088-62914559, default 62914559): +9G

Created a new partition 3 of type 'Extended' and of size 9 GiB.

# 查看分区，可以看到现在已经有3个分区，前两个分区类型都是Linux
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
/dev/sdb3       41945088 60819455 18874368   9G  5 Extended

# 转换分区类型
Command (m for help): t
# 选择需要转换的分区
Partition number (1-3, default 3): 2
# 查看所有分区表
Hex code or alias (type L to list all): L

00 Empty            24 NEC DOS          81 Minix / old Lin  bf Solaris        
01 FAT12            27 Hidden NTFS Win  82 Linux swap / So  c1 DRDOS/sec (FAT-
02 XENIX root       39 Plan 9           83 Linux            c4 DRDOS/sec (FAT-
03 XENIX usr        3c PartitionMagic   84 OS/2 hidden or   c6 DRDOS/sec (FAT-
04 FAT16 <32M       40 Venix 80286      85 Linux extended   c7 Syrinx         
05 Extended         41 PPC PReP Boot    86 NTFS volume set  da Non-FS data    
06 FAT16            42 SFS              87 NTFS volume set  db CP/M / CTOS / .
07 HPFS/NTFS/exFAT  4d QNX4.x           88 Linux plaintext  de Dell Utility   
08 AIX              4e QNX4.x 2nd part  8e Linux LVM        df BootIt         
09 AIX bootable     4f QNX4.x 3rd part  93 Amoeba           e1 DOS access     
0a OS/2 Boot Manag  50 OnTrack DM       94 Amoeba BBT       e3 DOS R/O        
0b W95 FAT32        51 OnTrack DM6 Aux  9f BSD/OS           e4 SpeedStor      
0c W95 FAT32 (LBA)  52 CP/M             a0 IBM Thinkpad hi  ea Linux extended 
0e W95 FAT16 (LBA)  53 OnTrack DM6 Aux  a5 FreeBSD          eb BeOS fs        
0f W95 Ext'd (LBA)  54 OnTrackDM6       a6 OpenBSD          ee GPT            
10 OPUS             55 EZ-Drive         a7 NeXTSTEP         ef EFI (FAT-12/16/
11 Hidden FAT12     56 Golden Bow       a8 Darwin UFS       f0 Linux/PA-RISC b
12 Compaq diagnost  5c Priam Edisk      a9 NetBSD           f1 SpeedStor      
14 Hidden FAT16 <3  61 SpeedStor        ab Darwin boot      f4 SpeedStor      
16 Hidden FAT16     63 GNU HURD or Sys  af HFS / HFS+       f2 DOS secondary  
17 Hidden HPFS/NTF  64 Novell Netware   b7 BSDI fs          fb VMware VMFS    
18 AST SmartSleep   65 Novell Netware   b8 BSDI swap        fc VMware VMKCORE 
1b Hidden W95 FAT3  70 DiskSecure Mult  bb Boot Wizard hid  fd Linux raid auto
1c Hidden W95 FAT3  75 PC/IX            bc Acronis FAT32 L  fe LANstep        
1e Hidden W95 FAT1  80 Old Minix        be Solaris boot     ff BBT            

Aliases:
   linux          - 83
   swap           - 82
   extended       - 05
   uefi           - EF
   raid           - FD
   lvm            - 8E
   linuxex        - 85
# 这里选择 Linux LVM
Hex code or alias (type L to list all): 8E

Changed type of partition 'Linux' to 'Linux LVM'.

# 至此，三个分区已经创建成功，输入w保存退出
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
/dev/sdb2       20973568 41945087 20971520  10G 8e Linux LVM
/dev/sdb3       41945088 60819455 18874368   9G  5 Extended
```

:::

::: tip

Linux LVM（Logical Volume Manager）、Linux分区和Extended分区都是Linux操作系统中的分区类型，但它们的功能和使用方法有所不同。

- Linux LVM（Logical Volume Manager）：LVM是一种逻辑卷管理系统，它允许在物理卷（Physical Volume）上创建逻辑卷（Logical Volume），并对逻辑卷进行格式化和挂载。LVM提供了一种灵活的分区管理和数据迁移的方式，使得分区的调整和重新划分变得更加容易。

- Linux分区：Linux分区是用于安装和运行Linux操作系统的。在Linux系统中，硬盘被划分为多个分区，每个分区可以用来存储不同的数据或运行不同的操作系统。Linux分区可以容纳Linux文件系统和其他文件类型，例如系统文件、应用程序和用户数据等。

- Extended分区：Extended Partition是Linux操作系统的一种扩展分区类型，用于存储除普通文件之外的其他数据类型，如日志文件、交换空间等。Extended Partition可以进一步细分为多个逻辑分区（Logical Partition），每个逻辑分区可以格式化为不同的文件系统，以存储不同类型的文件。

总的来说，Linux LVM用于管理逻辑卷，提供了一种灵活的分区管理和数据迁移的方式；Linux分区用于安装和运行Linux操作系统，可以存储系统文件、应用程序和用户数据等；Extended分区用于存储除普通文件之外的其他数据类型，可以进一步细分为多个逻辑分区，以存储不同类型的文件。

:::

## 挂载分区

### 格式化分区

```sh
# 使用`lsblk -f`判断硬盘分区是否格式化。UUID有值则表示格式化。

# 其中 ext4 是分区类型
taketo@ubuntu:~$ sudo mkfs -t ext4 /dev/sdb1

mke2fs 1.46.5 (30-Dec-2021)
Discarding device blocks: done                            
Creating filesystem with 2621440 4k blocks and 655360 inodes
Filesystem UUID: ada1aa7f-16c2-44f1-9738-d3a5688e9c4f
Superblock backups stored on blocks: 
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

Allocating group tables: done                            
Writing inode tables: done                            
Creating journal (16384 blocks): done
Writing superblocks and filesystem accounting information: done 
```

### 临时挂载

```sh
# 挂载: 将一个分区与一个目录联系起来，
# 命令：mount 设备名称 挂载目录

# 首先创建一个目录newdisk (目录位置随便)
taketo@ubuntu:/$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000
# 挂载点有了，挂载成功。
/dev/sdb1                          9.8G   24K  9.3G   1% /newdisk    

 
# 卸载(去除分区与目录的联系)：
# 命令：umount	设备名称 或者	挂载目录
# 例如：umount	/dev/sdb1 或者 umount /newdisk
taketo@ubuntu:/$ sudo umount /dev/sdb1

taketo@ubuntu:/$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              1.6G  1.1M  1.6G   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   64G   13G   48G  21% /
tmpfs                              7.9G     0  7.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  253M  1.6G  14% /boot
tmpfs                              1.6G  4.0K  1.6G   1% /run/user/1000

注意: 用命令行挂载,重启后会失效。
```

### 永久挂载

解决命令行挂载，重启后会失效的问题，通过修改`/etc/fstab`实现。

`/etc/fstab` 是 Linux 系统中一个非常重要的文件，它存储了系统上所有文件系统的挂载信息。该文件的作用是告诉操作系统如何将文件系统挂载到正确的挂载点上，以及提供其他相关的挂载选项。

以下是 `/etc/fstab` 文件的一些说明和作用：

- 文件内容：`/etc/fstab` 文件包含多个行，每行描述一个文件系统。每一行都包含六个字段，分别是：文件系统、挂载点、文件系统类型、挂载选项、dump 标志和自动挂载标志。

- 文件系统：指定要挂载的文件系统的设备名称或 UUID。例如，`/dev/sda1` 或 `UUID=123456`。

- 挂载点：指定文件系统应该挂载到的目录。通常，根文件系统（`/`）会挂载到 `/` 目录，交换分区会挂载到 `/swap` 目录等。

- 文件系统类型：指定文件系统的类型。例如，ext4、NTFS、XFS 等。

- 挂载选项：指定挂载文件系统时使用的选项。例如，`rw` 表示以读写模式挂载，`ro` 表示以只读模式挂载，`noexec` 表示禁止执行程序等。

- dump 标志：指定是否使用 dump 命令备份文件系统。通常设置为 `0` 表示不备份，设置为 `1` 表示备份。

- 自动挂载标志：指定是否在系统启动时自动挂载文件系统。通常设置为 `0` 表示不自动挂载，设置为 `1` 表示自动挂载。

```sh
# 永久挂载: 
# 通过修改/etc/fstab 实现挂载
# 添加完成后 执行 mount –a 即刻生效 或者 重启系统reboot

# 配置
taketo@ubuntu:~$ sudo vi /etc/fstab

# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
# / was on /dev/ubuntu-vg/ubuntu-lv during curtin installation
/dev/disk/by-id/dm-uuid-LVM-jacZM17ddBQqF93LyMAvLNydfSNgiNaWL9eCfLBZGrS3BhP26LMRc06q0afkXgck / ext4 defaults 0 1
# /boot was on /dev/sda2 during curtin installation
/dev/disk/by-uuid/6b5334a8-b554-4fe0-a7ec-640df3e9db99 /boot ext4 defaults 0 1
/swap.img       none    swap    sw      0       0
# 添加以下配置
/dev/sdb1 /newdisk ext4 defaults 0 0

# 立即生效
taketo@ubuntu:~$ sudo mount –a

# 要挂载的设备  	  挂载点  	文件系统类型  挂载选项 转储频率 自动挂载标志
/dev/sdb1  		 /newdisk    ext4    defaults   0 	   0
UUID=sdb1的UUID  /newdisk    ext4    defaults   0 	   0
```

保存并退出。你可以测试是否能正常挂载：

```bash
umount /newdisk
mount -a
```
