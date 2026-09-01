# 配置优化

## 配置软件源

### Proxmox7

```sh
# 注释企业源
echo "#deb https://enterprise.proxmox.com/debian/pve bullseye pve-enterprise" > /etc/apt/sources.list.d/pve-enterprise.list

#修改源
vi /etc/apt/sources.list

#注释/删除文件所有内容，改为以下内容
deb http://mirrors.aliyun.com/debian/ buster main non-free contrib

deb-src http://mirrors.aliyun.com/debian/ buster main non-free contrib

deb http://mirrors.aliyun.com/debian-security buster/updates main

deb-src http://mirrors.aliyun.com/debian-security buster/updates main

deb http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib

deb-src http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib

deb http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib

deb-src http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib

#更新源
apt-get update
apt-get dist-upgrade -y
```

### Proxmox8

```sh
# 将此文件的中的所有内容注释掉
nano /etc/apt/sources.list.d/pve-enterprise.list

# 下载中科大的GPG KEY
wget https://mirrors.ustc.edu.cn/proxmox/debian/proxmox-release-bookworm.gpg -O /etc/apt/trusted.gpg.d/proxmox-release-bookworm.gpg

# 使用Proxmox非企业版源
echo "deb https://mirrors.ustc.edu.cn/proxmox/debian bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list

# 将Debian官方源替换为中科大源
sed -i 's|^deb http://ftp.debian.org|deb https://mirrors.ustc.edu.cn|g' /etc/apt/sources.list
sed -i 's|^deb http://security.debian.org|deb https://mirrors.ustc.edu.cn/debian-security|g' /etc/apt/sources.list

# 替换Ceph源
echo "deb https://mirrors.ustc.edu.cn/proxmox/debian/ceph-quincy bookworm no-subscription" > /etc/apt/sources.list.d/ceph.list

# 替换CT镜像下载源
sed -i 's|http://download.proxmox.com|https://mirrors.ustc.edu.cn/proxmox|g' /usr/share/perl5/PVE/APLInfo.pm
```

## 无有效订阅弹窗

每次登录看到无有效订阅弹窗

![An image](/img/linux/vm/08.png)

执行如下命令即可删除：

```sh
# 修改 JS 源码
sed -Ezi.bak "s/(Ext.Msg.show\(\{\s+title: gettext\('No valid sub)/void\(\{ \/\/\1/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js

# 重启 PVE 服务
systemctl restart pveproxy.service
```

执行完成后，浏览器强制刷新缓存（ctrl + F5）就可以了。

## PVE 温度传感器

### lm-sensors

lm-sensors 用于 CPU 以及主板温度检测，安装起来也很简单：

```sh
apt install lm-sensors -y
```

安装完成后就可以在命令下查看 CPU 以及主板温度了

```sh
root@taketo:~# sensors
coretemp-isa-0000
Adapter: ISA adapter
Package id 0:  +36.0°C  (high = +80.0°C, crit = +100.0°C)
Core 0:        +31.0°C  (high = +80.0°C, crit = +100.0°C)
Core 1:        +32.0°C  (high = +80.0°C, crit = +100.0°C)
Core 2:        +32.0°C  (high = +80.0°C, crit = +100.0°C)
Core 3:        +32.0°C  (high = +80.0°C, crit = +100.0°C)

acpitz-acpi-0
Adapter: ACPI interface
temp1:        +27.8°C  (crit = +105.0°C)

nvme-pci-0100
Adapter: PCI adapter
Composite:    +43.9°C  (low  = -273.1°C, high = +89.8°C)
                       (crit = +94.8°C)
Sensor 1:     +43.9°C  (low  = -273.1°C, high = +65261.8°C)
Sensor 2:     +38.9°C  (low  = -273.1°C, high = +65261.8°C)
```

### hddtemp

hddtemp 用于 机械硬盘温度检测，安装起来也很简单

```sh
apt install hddtemp -y
```

> 若无法安装，则需要手动下载软件包安装。[https://packages.debian.org/bullseye/hddtemp)](https://packages.debian.org/bullseye/hddtemp)

```sh
dpkg -i hddtemp_0.3-beta15-54_amd64.deb
```

安装完成查看硬盘温度

```sh
root@taketo:~# hddtemp /dev/sda
/dev/sda: ST4000VX000-2AG166: 38°C
```

因为我们后面需要放到 Web 界面显示，所以需要改这个软件 Web 端的权限

```sh
chmod +s /usr/sbin/hddtemp
```

### Web端显示

先备份源文件

```sh
cp /usr/share/perl5/PVE/API2/Nodes.pm /usr/share/perl5/PVE/API2/Nodes.pm.bak
cp /usr/share/pve-manager/js/pvemanagerlib.js /usr/share/pve-manager/js/pvemanagerlib.js.bak
```

#### Nodes.pm

修改Nodes.pm

```sh
vim /usr/share/perl5/PVE/API2/Nodes.pm
```

搜索 `pveversion` 位置，加入下面 3 行代码:

```sh
	$res->{thermalstate} = `sensors`;  # 检测CPU温度
	$res->{cpusensors} = `lscpu | grep MHz`; # 检测CPU频率
	$res->{hdd_temperatures} = `hddtemp /dev/sda`;  # 添加此行以获取硬盘温度
```

#### pvemanagerlib.js

修改pvemanagerlib.js

```sh
vim /usr/share/pve-manager/js/pvemanagerlib.js
```

搜索 `pveversion` 位置，加入下面以下代码:

```js
{
			itemId: 'thermal',
			colspan: 2,
			printBar: false,
			title: gettext('CPU温度'),
			textField: 'thermalstate',
			renderer: function (value) {
				const p0 = value.match(/Package id 0.*?\+([\d\.]+)Â/)[1];
				const c0 = value.match(/Core 0.*?\+([\d\.]+)Â/)[1];
				const c1 = value.match(/Core 1.*?\+([\d\.]+)Â/)[1];
				const c2 = value.match(/Core 2.*?\+([\d\.]+)Â/)[1];
				const c3 = value.match(/Core 3.*?\+([\d\.]+)Â/)[1];
				return `Package: ${p0} ℃ || 核心1: ${c0} ℃ | 核心2: ${c1} ℃ | 核心3: ${c2} ℃ | 核心4: ${c3} ℃ `
			}
		},
		{
			itemId: 'MHz',
			colspan: 2,
			printBar: false,
			title: gettext('CPU频率'),
			textField: 'cpusensors',
			renderer: function (value) {
				const f0 = value.match(/scaling MHz.*?([\d]+)/)[1];
				const f1 = value.match(/CPU min MHz.*?([\d]+)/)[1];
				const f2 = value.match(/CPU max MHz.*?([\d]+)/)[1];
				return `CPU实时: ${f0} MHz | 最小: ${f1} MHz | 最大: ${f2} MHz `
			}
		},
		{
			itemId: 'hdd-temperatures',
			colspan: 2,
			printBar: false,
			title: gettext('硬盘温度'),
			textField: 'hdd_temperatures',
			renderer: function (value) {
				value = value.replace(/Â/g, '');
				return value.replace(/\n/g, '<br>')
			}
		},
```

修改框架高度，搜索 `widget.pveNodeStatus` 位置，修改`height`值。

> height 的值需按情况修改，每多一行数据增加 20

```js
Ext.define('PVE.node.StatusView', {
	extend: 'Proxmox.panel.StatusView',
	alias: 'widget.pveNodeStatus',

	height: 355, // 默认300，这里可以视情况而定
	bodyPadding: '15 5 15 5',

	layout: {
		type: 'table',
		columns: 2,
		tableAttrs: {
			style: {
				width: '100%',
			},
		},
	},
```

搜索 `title: gettext('Detail'),` ，修改height值 ：

```js
{
    iconCls: 'x-fa fa-info-circle',
        handler: function (grid, rowindex, colindex, item, e, record) {
            var win = Ext.create('Ext.window.Window', {
                title: gettext('Detail'),
                resizable: true,
                modal: true,
                width: 650,
                height: 455, // 默认400，这里可以视情况而定
                layout: {
                    type: 'fit',
                },
                items: [{
                    scrollable: true,
                    padding: 10,
                    xtype: 'box',
                    html: [
                        '<span>' + Ext.htmlEncode(record.data.summary) + '</span>',
                        '<pre>' + Ext.htmlEncode(record.data.detail) + '</pre>',
                    ],
                }],
            });
            win.show();
        },
},
```

### 重启PVE页面服务

```sh
systemctl restart pveproxy
```

### 效果展示

![An image](/img/linux/vm/09.png)
