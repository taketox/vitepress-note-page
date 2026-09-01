# 局域网唤醒

## 准备工作

开启bios远程唤醒功能和PCI启动

## 安装ethtool

通过SHELL或者SSH安装 ethtool 工具，安装命令：

```sh
apt-get install ethtool
```

## 查看网卡信息

用ethtool工具查看网卡信息，如果是多网卡的话，需要先搞清楚哪个是链接外网的管理口,举例网卡为enp3s0。

```sh
ethtool enp3s0
```

找到网卡信息中的supports wake-on和wake-on两个参数，如果supports值为pumbg，表示网卡支持远程唤醒,wake-on的值d表示禁用、g表示开启，默认为d。

## 开启网卡唤醒

用ethtool开启网卡远程唤醒，把wake-on值改为g

```sh
ethtool -s enp3s0 wol g
```

::: tip
因为每次重启后会失效，所以我们需要把开启命令写入开机自动执行脚本。
:::

### 方案一 自启动脚本

- 编辑 /etc/rc.local文件，写入开机自动执行开启远程唤醒的脚本。

```sh
vi /etc/rc.local
```

- 插入以下代码后保存重启all done

```sh
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.

/sbin/ethtool -s enp3s0 wol g 

exit 0
```

::: tip
比较新的Linux发行版已经没有rc.local文件了。因为已经将其服务化了。
:::

### 方案二 rc-local.service

- 设置rc-local.service

```sh
sudo vim /etc/systemd/system/rc-local.service


[Unit]
 Description=/etc/rc.local Compatibility
 ConditionPathExists=/etc/rc.local
[Service]
 Type=forking
 ExecStart=/etc/rc.local start
 TimeoutSec=0
 StandardOutput=tty
 RemainAfterExit=yes
 SysVStartPriority=99
[Install]
 WantedBy=multi-user.target
```

- 激活rc-local.service

```sh
sudo systemctl enable rc-local.service
```

- 添加启动服务

手工创建或者拷贝已有的/etc/rc.local，并赋予执行权限

```sh
#!/bin/sh -e
# 
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.
 
# 下面这条是要开机启动的命令
ethtool -s enp3s0 wol g
 
exit 0

#给予脚本执行权限
sudo chmod +x /etc/rc.local
```

## 发送魔术包唤醒

在linux系统中可以使用`wakeonlan`、`etherwake`等工具

```sh
wakeonlan 目标机器的MAC地址

etherwake 目标机器的MAC地址
```

## 一键唤醒脚本

[WOL唤醒脚本](/linux/instance/wolshell)
