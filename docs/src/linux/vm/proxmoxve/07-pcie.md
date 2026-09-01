# 硬件直通

## 概述

PCI(e)直通可以让虚拟机直接控制物理服务器的PCI硬件设备。与使用虚拟化硬件相比，这种方式的优势有低延迟，高性能以及其他功能特性。

主要缺点是，一旦采用直通方式，对应硬件就不能再被主机或其他虚拟机使用。

## 显卡直通

### 必要条件

硬件设备需要支持IOMMU（I/O Memory Management Unit）中断重映射，这需要CPU和主板的支持。

通常，具备Intel VT-d功能的Intel硬件系统，或具备AMD-Vi功能的AMD硬件系统均可以满足要求。但这不意味着直通功能可以开箱即用，硬件设备缺陷，驱动软件不完备等因素都可能导致硬件直通无法正常工作。

一般来说，大部分硬件都可以支持该功能，但服务器级硬件一般比消费级硬件能更好支持直通功能。

可以联系硬件设备厂商，以确定你的硬件设备是否在Linux下支持直通功能。

- 查看是否开启VT-d功能

```sh
root@taketo:~# lscpu
Virtualization features: 
  Virtualization:        VT-x
```

### Intel 核显直通

#### 准备工作

备份文件

```sh
cp /etc/default/grub /etc/default/grub.bak

cp /etc/modules /etc/modules.bak
```

新建文件

```sh
touch /etc/modprobe.d/pve-blacklist.conf

touch /etc/modprobe.d/vifo.conf
```

#### ROM

GitHub开源地址：[https://github.com/gangqizai/igd.git](https://github.com/gangqizai/igd.git)

- 本ROM为Intel 10-13核显直通PCI optionROM, 搭配OVMF可以实现虚拟机启动,显示器 HDMI/DP 输出画面, HDMI/DP声音正常工作
- 本ROM使用简单,无需修改或定制OVMF,使用PVE自带即可!
- 虚拟机启动无花屏，蓝屏。

| GOP ROM 文件名 | 适用CPU平台        |
| -------------- | ------------------ |
| gen12_gop.rom  | Intel 11-13代 酷睿 |
| 5105_gop.rom   | N5105 / N5095      |
| 8505_gop.rom   | 8505               |

- 使用两个rom文件，conf配置文件中，一个rom文件加在显卡，另一个加在声卡。

  ```sh
  hostpci0: 0000:00:02.0,legacy-igd=1,romfile=gen12_igd.rom
  hostpci1: 0000:00:1f.3,romfile=gen12_gop.rom
  ```

注意事项

- PVE版本8.0.3
- 仅支持UEFI，正常启动。安全启动暂不支持
- 仅支持OVMF模式，seabios不支持
- 机型必须i440fx

- BIOS必须OVMF，Intel核显已不支持传统BIOS启动
- 核显PCI加入legacy-igd=1以支持核显Legacy模式下显示
- 虚拟机内存至少4G

#### 直通配置

由于直通CPU为12代，所以使用的是`gen12_gop.rom`

上传ROM

```sh
# 进入指定文件夹
cd /usr/share/kvm

# 上传ROM
rz gen12_gop.rom gen12_igd.rom

# 确认是否上传成功
root@taketo:~# ls -al /usr/share/kvm/gen12_gop.rom
-rw-rw-rw- 1 root root 142336 Sep 13 01:07 /usr/share/kvm/gen12_gop.rom
root@taketo:~# ls -al /usr/share/kvm/gen12_igd.rom
-rw-rw-rw- 1 root root 17920 Sep 13 01:07 /usr/share/kvm/gen12_igd.rom
```

开启IOMMU

```sh
# 启动内核IOMMU支持
# 编辑 grub，增加 intel_iommu=on
vim /etc/default/grub

# 修改
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"

# 更新
update-grub
```

增加module

```sh
# 编辑 /etc/modules
vim /etc/modules

# 写入以下内容
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
```

屏蔽驱动

```sh
echo "blacklist i915" >> /etc/modprobe.d/pve-blacklist.conf
```

绑定vfio

```sh
# 查询设备ID
lspci -n | grep -E "0300"
00:02.0 0300: 8086:4692 (rev 0c)

# 绑定
echo "options vfio-pci ids=8086:4692" >> /etc/modprobe.d/vifo.conf

# 更新
update-initramfs -u

# 重启生效
reboot
```

> 注意：`/etc/modprobe.d/vifo.conf` 没有 `disable_vga=1`

PVE配置

```properties
# 编辑
vim /etc/pve/qemu-server/id.conf

# 新增以下配置
args: -set device.hostpci0.addr=02.0 -set device.hostpci0.x-igd-gms=0x2 -set device.hostpci0.x-igd-opregion=on -debugcon file:/root/igd_debug.log -global isa-debugcon.iobase=0x402
hostpci0: 0000:00:02.0,legacy-igd=1,romfile=gen12_igd.rom
hostpci1: 0000:00:1f.3,romfile=gen12_gop.rom
vga: none
```

最终配置信息

```properties
args: -set device.hostpci0.addr=02.0 -set device.hostpci0.x-igd-gms=0x2 -set device.hostpci0.x-igd-opregion=on -debugcon file:/root/igd_debug.log -global isa-debugcon.iobase=0x402
bios: ovmf
boot: order=sata0;net0
cores: 4
cpu: host
efidisk0: local-lvm:vm-130-disk-1,efitype=4m,pre-enrolled-keys=1,size=4M
hostpci0: 0000:00:02.0,legacy-igd=1,romfile=gen12_igd.rom
hostpci1: 0000:00:1f.3,romfile=gen12_gop.rom
machine: pc-i440fx-8.0
memory: 16384
meta: creation-qemu=8.0.2,ctime=1698678794
name: windows
net0: e1000=C2:F1:38:63:EC:5E,bridge=vmbr0,firewall=1
numa: 0
ostype: win10
sata0: local-lvm:vm-130-disk-0,size=100G
scsihw: virtio-scsi-single
smbios1: uuid=eb850959-c50f-4996-81d5-dfef9b13b04c
sockets: 1
vga: none
vmgenid: ab0ab3d9-5b84-4d4c-bc9d-6a9c32aaff4d
```

硬件配置信息

![An image](/img/linux/vm/13.png)

#### 最终效果

有网络的情况下，显卡驱动自动更新。

![An image](/img/linux/vm/14.png)

声音正常，显示正常。

![An image](/img/linux/vm/15.png)

### AMD核显直通

#### 准备工作

资源

- BIOS文件（可以与厂商联系或自行提取）
- UBU（VBIOS）
- [edk2-BaseTools-win32](https://github.com/tianocore/edk2-BaseTools-win32)（EFI转ROM）
- Windows10镜像
- [virtIO](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso)（驱动）
- [RadeonResetBugFixService](https://github.com/inga-lovinde/RadeonResetBugFix/releases)（ResetBug修复程序）
- [AMD Ryzen™ 7 5700U Drivers & Support | AMD](https://www.amd.com/zh-hans/support/apu/amd-ryzen-processors/amd-ryzen-7-mobile-processors-radeon-graphics/amd-ryzen-7-5700u)（核显驱动）

备份文件

```sh
cp /etc/default/grub /etc/default/grub.bak

cp /etc/modprobe.d/pve-blacklist.conf /etc/modprobe.d/pve-blacklist.conf.bak
```

#### 直通配置

编辑grub

```sh
vi /etc/default/grub

# 添加以下内容
GRUB_CMDLINE_LINUX_DEFAULT="quiet initcall_blacklist=sysfb_init"

# 更新grub
update-grub
```

添加设备黑名单

```sh
vi /etc/modprobe.d/pve-blacklist.conf

# 添加以下内容
blacklist nvidiafb
blacklist amdgpu
blacklist i915
blacklist snd_hda_intel
options vfio_iommu_type1 allow_unsafe_interrupts=1

# 更新initramfs
update-initramfs -u -k all
```

> 修改完以上配置需要重启才能生效。

获取机器PCI信息

```sh
# 更新pci设备信息
update-pciids

# 查看核显
lspci -D -nn | grep VGA
# 本次使用的CPU为R7 5700U
0000:05:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Lucienne [1002:164c] (rev c1)

# 查看声卡
lspci -D -nn | grep Audio
# 通常AMD的核显和声卡时靠着一起的
0000:05:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Renoir Radeon High Definition Audio Controller [1002:1637]
```

> 由上述结果可知：
>
> `AMD R7 5700U`
>
> - 核显ID：`0000:05:00.0`
> - 声卡ID：`0000:05:00.1`
> - 供应商ID：`164c`

#### 提取GOP和VBIOS

进入UBU文件夹，运行 `UBU.bat` 选择厂商提供的 `BIOS` 文件

![An image](/img/linux/vm/19.png)

选择2

![An image](/img/linux/vm/20.png)

选择S

![An image](/img/linux/vm/21.png)

在Extracted目录中找到 `AMDGopDriver.efi` 和 `vbios`

![An image](/img/linux/vm/22.png)

------

![An image](/img/linux/vm/23.png)

把 `AMDGopDriver.efi` 拷贝到 `edk2-BaseTools-win32-master` 文件夹

![An image](/img/linux/vm/24.png)

使用管理员运行 `CMD` 命令行 进入 `edk2-BaseTools-win32-master` 文件夹

![An image](/img/linux/vm/25.png)

执行

```sh
EfiRom.exe -f 0x1002 -i 0x164c -e AMDGopDriver.efi
```

>上述命令中 `0xXXXX` 中的 `XXXX` 为具体自己的核显设备ID，例如 `5700U` 的为 `0x164c`

成功后会 `edk2-BaseTools-win32-master` 文件夹中生成 `AMDGopDriver.rom`

![An image](/img/linux/vm/26.png)

提取GOP和VBIOS成功之后，需要将 `AMDGopDriver.rom(ROM)`和 `vbios_1002_xxxx.bin(VBIOS)` 这两个文件上传至 `/usr/share/kvm` 目录

#### 虚拟机配置

创建虚拟机

![An image](/img/linux/vm/27.png)

 >添加 `CD/DVD` 设备1个，挂载virtIO驱动ISO镜像
 >
 >添加显卡`0000:e5:00.0`，pcie设备里面勾选：主gpu，rom-bar，pcie-express这三个选项，所有功能：不勾选
 >
 >添加声卡`0000:e5:00.1`

添加ROM和VBIOS文件指向

```sh
vi /etc/pve/qemu-server/虚拟机序号.conf

# 找到以下两处，并添加
hostpci0: 0000:05:00.0,pcie=1,romfile=vbios_1638.dat,x-vga=1
hostpci1: 0000:05:00.1,romfile=AMDGopDriver.rom
```

配置图

![An image](/img/linux/vm/28.png)

#### 系统配置

安装`virtIO`驱动

安装显卡驱动

解决`amd gpu passthrough rest bug`问题，解压放在c盘根目录，使用管理员运行 `CMD` 命令行执行

```sh
RadeonResetBugFixService.exe install
```

#### 最终效果

![An image](/img/linux/vm/29.png)
