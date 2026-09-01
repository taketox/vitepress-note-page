# Ubuntu

## 配置静态ip

1.在开始之前先弄清楚networking服务和network-manager服务的区别。

- networking是控制系统网络设置的，如果你修改了相关的网络配置需要重启此服务。
- network-manager是管理networking服务的一个图形化管理工具的后台服务程序。

2.Ubuntu推荐使用netplan命令设置静态IP地址。netplan使用yaml格式的配置文件来配置网络地址。

```sh
vim /etc/netplan/01-network-manager-all.yaml
```

3.在01-network-manager-all.yaml文件中renderer那一行后面添加以下内容。

```yaml
network:
  ethernets:
    # 配置的网卡的名称
    ens33:
      # 配置的静态ip地址和掩码
      addresses: [192.168.100.10/24]
      # 关闭DHCP，如果需要打开DHCP则写yes 
      dhcp4: no
      optional: true
      # 网关地址
      gateway4: 192.168.100.1
      nameservers:
         # DNS服务器地址，多个DNS服务器地址需要用英文逗号分隔开
         addresses: [192.168.100.1,114.114.114.114]
  version: 2
  # 指定后端采用systemd-networkd或者Network Manager，可不填写则默认使用systemd-workd
  renderer: networkd
```

::: tip
yaml文件是通过缩进来控制上下层级关系的，你的缩进可以是一个空格也可以是N个空格，但要在整个配置文件中要保持一致，并要注意在冒号的后面加一个空格。
:::

4.通过netplan apply命令，地址可以立即生效。

```sh
netplan apply
```

::: danger
ifdown: unknown interface ens33 报错的解决方法，使用命令

```sh
sudo ip link set ens33 down
# 或者使用命令
sudo ifconfig ens33 down
# 关闭网卡 ifdown <网卡名称>
sudo ifdown ens33 
# 开启网卡 ifup <网卡名称>
sudo ifup ens33
```

An error occurred: 'NetplanApply' object has no attribute 'state'报错的解决方法。使用命令

```sh
netplan try --state /etc/netplan
```

:::

## 使用root用户

**问题：**

一般的ubuntu会创建一个管理员用户。在使用 su 指令从管理员切换到root用户后，设在/etc/profile的环境变量丢失。

如何才能保证环境变量不变呢？

**整个root用户的使用过程如下：**

1.root 用户创建密码：

```sh
 sudo passwd root
```

输入两次密码。成功后可以使用root用户啦。

2.统一环境变量。

将当前管理员用户设置在 “/etc/profile"和”.bashrc" 里的用户自定义环境变量，复制到 root用户的.bashrc里。

- 当前用户的".bashrc"文件在：/home/用户/.bashrc
- root用户的".bashrc"文件在：/root/.bashrc

3.使用su切换用户吧。

```sh
su
```

::: tip
环境变量的设置不要写在/etc/profile里，尽量写在用户的.bashrc中。
:::

## /dev/ubuntu-vg/ubuntu-lv 扩容

### 新增硬盘扩容

**准备工作**

```sh
# 查看分区情况
taketo@ubuntu:~$ df -h
Filesystem                         Size  Used Avail Use% Mounted on
udev                               1.9G     0  1.9G   0% /dev
tmpfs                              389M  1.5M  388M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   29G   17G   11G  61% /

# 目前/dev/mapper/ubuntu--vg-ubuntu--lv 大小29G
# 新增一块10G硬盘，查看sdb已经成功识别到。
taketo@ubuntu:~$ lsblk
NAME                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda                         8:0    0   60G  0 disk 
├─sda1                      8:1    0    1M  0 part 
├─sda2                      8:2    0  1.5G  0 part /boot
└─sda3                      8:3    0 58.5G  0 part 
  └─ubuntu--vg-ubuntu--lv 253:0    0 29.3G  0 lvm  /
sdb                         8:16   0   10G  0 disk 

# 硬盘分区
taketo@ubuntu:~$ sudo fdisk /dev/sdb
Device     Boot Start      End  Sectors Size Id Type
/dev/sdb1        2048 20971519 20969472  10G 8e Linux LVM

# 硬盘格式化
taketo@ubuntu:~$ sudo mkfs.ext4 /dev/sdb1

# 查看格式化情况
taketo@ubuntu:~$ lsblk -f
NAME                      FSTYPE      LABEL UUID                                   FSAVAIL FSUSE% MOUNTPOINT
sdb                                                                                               
└─sdb1                    ext4              8adca9e7-3d8d-4066-9b29-c308ffdfc4ee      
```

**创建物理卷**

```sh
# 创建物理卷
taketo@ubuntu:~$ sudo pvcreate /dev/sdb1 
  Physical volume "/dev/sdb1" successfully created.
  
# 查看物理卷
taketo@ubuntu:~$ sudo pvscan
  PV /dev/sda3   VG ubuntu-vg       lvm2 [<58.50 GiB / 29.25 GiB free]
  PV /dev/sdb1                      lvm2 [<10.00 GiB]
  Total: 2 [<68.50 GiB] / in use: 1 [<58.50 GiB] / in no VG: 1 [<10.00 GiB]
```

**扩容卷组**

```sh
# 查看ubuntu-vg容量为29.25G
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize   VFree 
  ubuntu-vg   1   1   0 wz--n- <58.50g 29.25g

# 卷组扩容
taketo@ubuntu:~$ sudo vgextend ubuntu-vg /dev/sdb1
  Volume group "ubuntu-vg" successfully extended

# 再次查看ubuntu-vg容量为39.25G
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize  VFree  
  ubuntu-vg   2   1   0 wz--n- 68.49g <39.25g
```

**扩容逻辑卷**

```sh
# 查看lv空间情况
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <29.25g     
# 调整LVM逻辑卷空间大小
taketo@ubuntu:~$ sudo lvresize -L +10G /dev/mapper/ubuntu--vg-ubuntu--lv
  Size of logical volume ubuntu-vg/ubuntu-lv changed from <29.25 GiB (7487 extents) to <39.25 GiB (10047 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.

# 再次查看lv空间情况
taketo@ubuntu:~$ sudo lvs
  LV        VG        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ubuntu-lv ubuntu-vg -wi-ao---- <39.25g         

# 同步文件系统容量到内核，扩容成功！
taketo@ubuntu:~$ sudo resize2fs /dev/ubuntu-vg/ubuntu-lv 
resize2fs 1.45.5 (07-Jan-2020)
Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required
old_desc_blocks = 4, new_desc_blocks = 5
The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 10288128 (4k) blocks long.  
```

### 扩容空闲空间

**查看卷组空闲空间**

```sh
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize  VFree  
  ubuntu-vg   2   1   0 wz--n- 68.49g <29.25g
```

**查看逻辑卷名称**

```sh
taketo@ubuntu:~$ sudo lvscan
  ACTIVE            '/dev/ubuntu-vg/ubuntu-lv' [<39.25 GiB] inherit
```

**逻辑卷扩容**

```sh
# 按照大小扩容
taketo@ubuntu:~$ sudo lvextend -L +10G /dev/ubuntu-vg/ubuntu-lv
  Size of logical volume ubuntu-vg/ubuntu-lv changed from <39.25 GiB (10047 extents) to <49.25 GiB (12607 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.

# 查看逻辑卷大小
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize  VFree  
  ubuntu-vg   2   1   0 wz--n- 68.49g <19.25g

# 按照百分比扩容
taketo@ubuntu:~$ sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
  Size of logical volume ubuntu-vg/ubuntu-lv changed from <49.25 GiB (12607 extents) to 68.49 GiB (17534 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.

# 查看逻辑卷大小
taketo@ubuntu:~$ sudo vgs
  VG        #PV #LV #SN Attr   VSize  VFree
  ubuntu-vg   2   1   0 wz--n- 68.49g    0 
  
# 同步文件系统容量到内核，扩容成功
taketo@ubuntu:~$ sudo resize2fs /dev/ubuntu-vg/ubuntu-lv 
resize2fs 1.45.5 (07-Jan-2020)
Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required
old_desc_blocks = 5, new_desc_blocks = 9
The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 17954816 (4k) blocks long.
```

## 禁止自动休眠

**命令行配置**

```sh
# sleep状态是loaded，也就是处于开启状态
taketo@taketo-Inspiron-7447:~$ systemctl status sleep.target
● sleep.target - Sleep
     Loaded: loaded (/lib/systemd/system/sleep.target; static; vendor preset: enabled)
     Active: inactive (dead) since Sat 2023-09-16 21:04:09 CST; 2min 34s ago
       Docs: man:systemd.special(7)

9月 16 21:00:20 taketo-Inspiron-7447 systemd[1]: Reached target Sleep.
9月 16 21:04:09 taketo-Inspiron-7447 systemd[1]: Stopped target Sleep.

# 关闭系统的自动休眠开关
taketo@taketo-Inspiron-7447:~$ sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
[sudo] taketo 的密码： 
Created symlink /etc/systemd/system/sleep.target → /dev/null.
Created symlink /etc/systemd/system/suspend.target → /dev/null.
Created symlink /etc/systemd/system/hibernate.target → /dev/null.
Created symlink /etc/systemd/system/hybrid-sleep.target → /dev/null.

# sleep的状态已经变成了masked，也就是关闭了
taketo@taketo-Inspiron-7447:~$ systemctl status sleep.target
● sleep.target
     Loaded: masked (Reason: Unit sleep.target is masked.)
     Active: inactive (dead) since Sat 2023-09-16 21:04:09 CST; 5min ago

9月 16 21:00:20 taketo-Inspiron-7447 systemd[1]: Reached target Sleep.
9月 16 21:04:09 taketo-Inspiron-7447 systemd[1]: Stopped target Sleep.
```

**gnome-tweak管理**

```sh
# 使用gnome-tweak工具
sudo apt install gnome-tweak-tool

# 运行gnome-tweak工具
gnome-tweaks

# 运行后，会弹出一个窗口。
# “笔记本电脑盖子关闭时挂起” 选项取消选择
```