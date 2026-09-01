# 服务自启动

## systemctl 实现开机自启服务

### 概述

​**systemctl**是LINUX的服务管理工具中主要的工具，它融合之前service和chkconfig的功能于一体。可以使用它永久性或只在当前会话中启用/禁用服务。

### 后台服务配置文件

一般系统管理员手工创建的单元文件建议存放在/etc/systemd/system/目录下面。

```properties
[Unit]                     
Description=tomcat                      #当前配置文件的描述信息
After=network.target nginx.service    #表示当前服务是在那个服务后面启动，一般定义为网络服务启动后启动
 
[Service]            
Type=oneshot                               #定义启动类型 
ExecStart=/home/tomcat/demo-start.sh            #定义启动进程时执行的命令。
ExecReload=/home/tomcat/demo-restart.sh      #重启服务时执行的命令(没有可以不用)
ExecStop=/home/tomcat/demo-stop.sh           #定义关闭进程时执行的命令。
PrivateTmp=true                               #是否分配独立空间
RemainAfterExit=yes
Restart=always
RestartSec=5
StartLimitInterval=0
StartLimitBurst=5
 
[Install]
WantedBy=multi-user.target    #表示多用户命令行状态
```

#### 参数详解

##### [Unit]

- Description : 服务的简单描述

- Documentation ： 服务文档

- Before：定义启动顺序。Before=xxx.service,代表本服务在xxx.service启动之前启动。

- After：定义启动顺序。After=xxx.service,代表本服务在xxx.service之后启动。

- Requires：这个单元启动了，它需要的单元也会被启动；它需要的单元被停止了，这个单元也停止了。

- Wants：这个单元启动了，它需要的单元也会被启动；它需要的单元被停止了，对本单元没有影响。

##### [Service]

- Type：服务类型，具体有以下值：

  - Type=simple（默认值）：systemd认为该服务将立即启动。服务进程不会fork。如果该服务要启动其他服务，不要使用此类型启动，除非该服务是socket激活型。

  - Type=forking：systemd认为当该服务进程fork，且父进程退出后服务启动成功。对于常规的守护进程（daemon），除非你确定此启动方式无法满足需求，使用此类型启动即可。使用此启动类型应同时指定 PIDFile=，以便systemd能够跟踪服务的主进程。
  - Type=oneshot：这一选项适用于只执行一次任务、随后立即退出的服务。可能需要同时设置 RemainAfterExit=yes,使得 systemd 在服务进程退出之后仍然认为服务处于激活状态。
  - Type=notify：与 Type=simple 相同，但约定服务会在就绪后向 systemd 发送一个信号。这一通知的实现由 libsystemd-daemon.so 提供。
  - Type=dbus：若以此方式启动，当指定的 BusName 出现在DBus系统总线上时，systemd认为服务就绪。
  - Type=idle: systemd会等待所有任务(Jobs)处理完成后，才开始执行idle类型的单元。除此之外，其他行为和Type=simple 类似。
  - PIDFile：pid文件路径

- User：设置服务运行的用户
  Group：设置服务运行的用户组
  PrivateTmp=True 表示给服务分配独立的临时空间

- ExecStart：指定启动单元的命令或者脚本，ExecStartPre和ExecStartPost节指定在ExecStart之前或者之后用户自定义执行的脚本。Type=oneshot允许指定多个希望顺序执行的用户自定义命令。

- ExecReload：指定单元停止时执行的命令或者脚本。

- ExecStop：指定单元停止时执行的命令或者脚本。

- PrivateTmp：True表示给服务分配独立的临时空间

- Restart：这个选项如果被允许，服务重启的时候进程会退出，会通过systemctl命令执行清除并重启的操作。

- RemainAfterExit：如果设置这个选择为真，服务会被认为是在激活状态，即使所以的进程已经退出，默认的值为假，这个选项只有在Type=oneshot时需要被配置。

##### [Install]

- Alias：为单元提供一个空间分离的附加名字。

- RequiredBy：单元被允许运行需要的一系列依赖单元，RequiredBy列表从Require获得依赖信息。

- WantBy：单元被允许运行需要的弱依赖性单元，Wantby从Want列表获得依赖信息。

- Also：指出和单元一起安装或者被协助的单元。

- DefaultInstance：实例单元的限制，这个选项指定如果单元被允许运行默认的实例

### systemctl命令

- 系统重新加载服务

```sh
systemctl daemon-reload
```

- 启动一个服务

```sh
systemctl start xxx.service
```

- 关闭一个服务

```sh
systemctl stop xxx.service
```

- 重启一个服务

```sh
systemctl restart xxx.service
```

- 显示一个服务的状态

```sh
systemctl status xxx.service
```

- 在开机时启用服务

```sh
systemctl enable xxx.service
```

- 在开机时禁用服务

```sh
systemctl disable xxx.service
```

- 查看服务是否开机启动

```sh
systemctl is-enabled xxx.service
```

- 查看已启动的服务列表

```sh
systemctl list-unit-files|grep enabled
```

- 查看启动失败的服务列表

```sh
systemctl --failed
```

- 列出所有的系统服务

```sh
systemctl 
```

- 列出所有启动unit

```sh
systemctl list-units
```

- 列出所有启动文件

```sh
systemctl list-unit-files 
```

- 过滤查看启动项

```sh
systemctl list-unit-files | grep enable 
```

- 过滤查看某服务的状态

```sh
systemctl list-unit-files | grep sshd 
```

### 示例

#### redis

```properties
[Unit]
# Redis服务的描述
Description=Redis Service
# 服务依赖—在什么服务之后启动，一般为在网络服务启动后启动
After=network.target

[Service]
# 服务类型—如果是shell脚本的方式,则Type=forking,否则不指定作何值(也就是去掉该配置项)
Type=forking

# 启动命令
ExecStart=/opt/redis/src/redis-server /opt/redis/redis.conf
# 重启命令
ExecReload=/opt/redis/src/redis-server -s reload
# 停止命令
ExecStop=/opt/redis/src/redis-server -s stop

[Install]
WantedBy=multi-user.target
```

#### zookeeper

```properties
[Unit]
# zookeeper服务的描述
Description=zookeeper.service
After=network.target
 
[Service]
# 服务类型—如果是shell脚本的方式,则Type=forking,否则不指定作何值(也就是去掉该配置项)
Type=forking

# 启动环境参数
Environment=JAVA_HOME=/usr/java/jdk1.8
# 启动命令
ExecStart=/opt/zookeeper/bin/zkServer.sh start
# 重启命令
ExecReload=/opt/zookeeper/bin/zkServer.sh restart
# 停止命令
ExecStop=/opt/zookeeper/bin/zkServer.sh stop
#Restart=always
#RestartSec=5
#StartLimitInterval=0
 
[Install]
WantedBy=multi-user.target
```

#### kafka

```properties
[Unit]
# Kafka服务的描述
Description=Kafka Service
# 服务依赖—在什么服务之后启动，一般为在网络服务启动后启动
# 这里要先启动zookeeper，之后在启动kafka
After=network.target zookeeper.service
 
 
[Service]
# 服务类型—如果是shell脚本的方式,则Type=forking,否则不指定作何值(也就是去掉该配置项)
Type=forking

# 启动环境参数
Environment=JAVA_HOME=/usr/java/jdk1.8 
# 启动命令
ExecStart=/opt/kafka/bin/kafka-server-start.sh -daemon /opt/kafka/config/server.properties
# 停止命令
ExecStop=/opt/kafka/bin/kafka-server-stop.sh
 
[Install]
WantedBy=multi-user.target
```
