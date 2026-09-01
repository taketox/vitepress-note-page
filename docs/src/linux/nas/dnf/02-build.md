# 私服搭建

## 环境依赖

### 硬件依赖

| 配置 | 最低配置 | 推荐配置 |
| ---- | -------- | -------- |
| CPU  | 1.5GHz   | 2.4GHz   |
| 内存 | 8GB      | 16GB     |
| 核心 | 4核      | 8核      |
| 带宽 | 2Mb      | 10Mb     |

### 软件依赖

| 名称   | 版本            | 描述     |
| ------ | --------------- | -------- |
| Centos | 6.8/7.3/7.6/7.9 | 操作系统 |

## 环境搭建

上传服务器文件`fullpackage.tar.gz`，`install`上传至根目录

```sh
[root@localhost /]# ll
total 197152
lrwxrwxrwx.   1 root root         7 Sep 17 04:02 bin -> usr/bin
dr-xr-xr-x.   5 root root      4096 Sep 17 04:59 boot
drwxr-xr-x.  20 root root      3120 Sep 17 05:04 dev
drwxr-xr-x.  77 root root      8192 Sep 17 05:17 etc
-rw-rw-rw-.   1 root root 201601272 Jan 17  2022 fullpackage.tar.gz
drwxr-xr-x.   2 root root         6 Apr 11  2018 home
-rwxrwxrwx.   1 root root    260696 Jan 17  2022 install
lrwxrwxrwx.   1 root root         7 Sep 17 04:02 lib -> usr/lib
lrwxrwxrwx.   1 root root         9 Sep 17 04:02 lib64 -> usr/lib64
drwxr-xr-x.   2 root root         6 Apr 11  2018 media
drwxr-xr-x.   2 root root         6 Apr 11  2018 mnt
drwxr-xr-x.   2 root root         6 Apr 11  2018 opt
dr-xr-xr-x. 145 root root         0 Sep 17 05:04 proc
dr-xr-x---.   4 root root       166 Sep 17 05:19 root
drwxr-xr-x.  25 root root       720 Sep 17 05:17 run
lrwxrwxrwx.   1 root root         8 Sep 17 04:02 sbin -> usr/sbin
drwxr-xr-x.   2 root root         6 Apr 11  2018 srv
dr-xr-xr-x.  13 root root         0 Sep 17 05:04 sys
drwxrwxrwt.   8 root root       260 Sep 17 05:17 tmp
drwxr-xr-x.  13 root root       155 Sep 17 04:02 usr
drwxr-xr-x.  19 root root       267 Sep 17 04:11 var
```

给予`install`执行权限

```sh
chmod 777 install
```

执行`install`二进制文件

```sh
./install
```

进入搭建页面

```sh
########################################################
#  台服dnf吧专用版一键架设工具                         #
#                                                      #
#  台服dnf吧                                           #
#  千山轻语一键端                                      #
#  Last Modified:2022                                  #
#                                                      #
#  Copyright(c) 2021,2022 Byzxd                        #
########################################################
1).【搭建】安装 DNF 服务器一键端
2).【工具】各类DNF相关工具
3).【备份】DNF数据库备份与还原
4).【自动】安装自动备份mysql程序
5).【清档】对当前服务端清档
6).【时间】更新服务器时间! 
7).【统一】安装统一登录器补丁[5.5]
8).【补丁】游戏等级补丁
9).【内存】优化当前Swap交换空间大小
————————————————————————————————————————————————————————————————
a).【信息】查看服务器相关信息
0).【退出】退出安装

当前服务器信息:4核 16G CentOS 7 64位系统，本机IP:222.94.77.72
————————————————————————————————————————————————————————————————
请输入相关选项数字:
```

选择`1`，使用一键搭建脚本

```sh
########################################################
#  台服dnf吧专用版一键架设工具                         #
#                                                      #
#  台服dnf吧                                           #
#  千山轻语一键端                                      #
#  Last Modified:2022                                  #
#                                                      #
#  Copyright(c) 2021,2022 Byzxd                        #
########################################################
==================开始安装dnf服务端口===================
[信息] 正在搜索系统可用yum源 Loading... 
[提示] 可用yum源更新成功! Success 
[信息] 开始配置防火墙与dns及TCP相关协议 Loading... 
[提示] 系统优化相关配置完成! Success 
[信息] 安装Centos 7 系运行库,请耐心等待 Loading... 
[提示] Centos 7 运行库安装成功! Success 
[提示] 正在从本地解压安装部署dnf相关组件 Loading... 
[提示] dnf相关组件处理完成! Success 
[信息] 正在安装配置dnf数据库服务 Loading... 
[信息] 初始化dnf数据库环境 Loading... 
[提示] dnf数据库环境配置成功  Success 
[信息] 开始部署dnf服务端 Loading... 

[222.94.77.72] 是否是你的外网IP？)
不是你的外网IP请回n自行输入 y/n : 
```

输入本机IP地址

```sh
########################################################
#  台服dnf吧专用版一键架设工具                         #
#                                                      #
#  台服dnf吧                                           #
#  千山轻语一键端                                      #
#  Last Modified:2022                                  #
#                                                      #
#  Copyright(c) 2021,2022 Byzxd                        #
########################################################
==============================================================================
恭喜,DNF一键端安装成功!

PHP默认端口号:735 和 80[php请在工具中单独安装]
数据库默认帐号:game
数据库默认密码:123456

启动命令为cd;./stop;./run
停止命令为cd;./stop;

当前系统时间为: 2023-09-17 17:24:25  

[注意]:请上传等级补丁与pvf文件后在/home/neople/game 下

本服务端默认安装了dp插件，运行dp插件，请执行  dprun 而不是run

注意:时间如果不正确,请运行脚本中更新服务器时间!
==============================================================================


3秒后自动重新启动系统 Loading... 
2秒后自动重新启动系统 Loading... 
1秒后自动重新启动系统 Loading... 
```

安装成功！重启之后在`/root`文件夹下，会多出几个可执行文件。

```sh
[root@localhost ~]# ll
-rw-------. 1 root root 1218 Sep 17 16:05 anaconda-ks.cfg
-rwxrwxrwx. 1 root root 2675 Jan 17  2022 dprun
-rwxrwxrwx. 1 root root 2641 Nov  8  2021 run
-rwxrwxrwx. 1 root root 1952 Nov  8  2021 stop
```

## 服务器配置

上传客户端PVF

```sh
# 上传客户端对应的 Script.pvf 至 /home/neople/game/
[root@localhost game]# pwd
/home/neople/game
[root@localhost game]# ll
-rw-rw-rw-  1 root root 222237225 Jun  8 09:57 Script.pvf
```

上传等级文件

```sh
# 上传等级文件 df_game_r 至 /home/neople/game/
[root@localhost game]# pwd
/home/neople/game
[root@localhost game]# ll
-rw-rw-rw-  1 root root  36360954 Oct 17  2016 df_game_r
-rw-rw-rw-  1 root root 222237225 Jun  8 09:57 Script.pvf
```

上传登录器公钥文件

```sh
# 上传登录器公钥文件 publickey.pem 至 /home/neople/game/
[root@localhost game]# pwd
/home/neople/game
[root@localhost game]# ll
-rw-rw-rw-  1 root root  36360954 Oct 17  2016 df_game_r
-rw-rw-rw-. 1 root root       450 May 12 19:25 publickey.pem
-rw-rw-rw-  1 root root 222237225 Jun  8 09:57 Script.pvf
```

启动服务端

```sh
[root@localhost ~]# pwd
/root
[root@localhost ~]# ./run 

# 出现以下提示表示启动成功
GeoIP Allow Country Code : CN
GeoIP Allow Country Code : HK
GeoIP Allow Country Code : KR
GeoIP Allow Country Code : MO
GeoIP Allow Country Code : TW
```

## 客户端配置

配置文件修改

```toml
# 修改客户端配置文件 DNF.toml
"服务器地址" = "10.0.0.111"
"角色等级" = 70
"SSS评分开关" = 1
"GM模式开关" = 1
"人物透明开关" = 0
"史诗自动确认开关" = 1
"色彩主题" = 1

["自定义拾取"]
"拾取开关" = 1
"物品代码数组" = [0, 6515]
"脚底拾取" = 1

["闪光"]
"闪光开关" = 1
"闪光代码" = 9413
```

登录器配置

```ini
# 修改配置文件 DLConfig.ini
[数据库信息]
DBHost=10.0.0.111
DBUser=game
DBPassword=123456
DBPort=3306
[登录器信息]
GameHost=10.0.0.111
Inject=False
DLLBlackList=["DumpReport.dll", "fmodex.dll", "ijl15.dll", "msvcp71.dll", "msvcr71.dll", "nmcogame.dll", "TenSLX.dll", "TerSafe.dll", "bdcap32.dll", "bdvid32.dll", "BugTrace.dll", "D3DX9_43.dll", "dbghelp.dll", "D3DX9_39.dll"]
[账号信息]
UserName=
Password=
[服务器信息]
RootUser=root
RootPassword=*****
SSHPort=22
RunPath=/root/run
StopPath=/root/stop
PVFPath=/home/neople/game/
```

## 开始游戏

用户注册

![An image](/img/linux/nas/001.png)

登录游戏

![An image](/img/linux/nas/002.png)

## 问题解决

1. 问题：界面UI错位

   解决：缺少客户端文件，可能被杀毒软件删除。重新解压客户端即可。

2. 问题：频道黑了，无法点击

   解决：重启服务端即可。
