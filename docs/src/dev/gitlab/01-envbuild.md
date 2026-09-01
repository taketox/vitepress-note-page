# 环境搭建

## 硬件要求

CPU：建议的最小内核数为 **4** 个，最多支持 **500** 个用户，**8** 核最多支持 **1000** 个用户

内存：建议的最小内存大小为**4 GB RAM** ，最多支持 **500** 个用户，**8 GB RAM** 最多支持 **1000** 个用户

硬盘：取决于你想存储在 GitLab 中的仓库的大小，GitLab软件包大约**2.5G**

## 安装方式

目前官方给出了比较丰富的部署方式来满足不同用户的需求：

- Linux package （通过Linux安装包进行安装）
- Helm chart（Kubernetes的一种安装方式）
- Operator （Kubernetes的另一种安装方式）
- **Docker （个人认为相对简单并且可维护性高的方式）**
- Self-compiled（需要自行编译源代码）

## Docker安装

Docker安装也有3种选项：

- 使用Docker Engine 安装，可以使用shell脚本配合docker命令较好的实现安装
- **使用Docker Compose安装，通过docker-compose.yaml进行配置**
- 使用Docker Swarm安装，适合多节点访问压力较大的场景

## 必要条件

要使用 GitLab Docker 镜像：

- 您必须安装 Docker。
- 您安装 Docker Compose。
- 您必须使用有效的可从外部访问的主机名。请勿使用 .`localhost`

## 环境搭建

创建文件：`docker-compose.yml`

```yaml
version: '3.8'

services:
  gitlab:
    image: 'gitlab/gitlab-ce:latest'
    restart: always
    container_name: gitlab
    hostname: 'www.mygitlab.com'
    environment:
      TZ: 'Asia/Shanghai'
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://127.0.0.1:8888' # web站点访问地址
        # Add any other gitlab.rb configuration here, each on its own line
    ports:
      # 注意宿主机和容器内部的端口要一致，否则external_url无法访问
      - '8888:8888'
      - '8443:443'
      - '8822:22'
    volumes:
      - './config:/etc/gitlab'
      - './logs:/var/log/gitlab'
      - './data:/var/opt/gitlab'
    shm_size: '256m'
```

| 宿主机路径 | 容器路径          | 用法                       |
| :--------- | :---------------- | :------------------------- |
| `./data`   | `/var/opt/gitlab` | 存储GitLab运行过程中的数据 |
| `./logs`   | `/var/log/gitlab` | 存储日志文件               |
| `./config` | `/etc/gitlab`     | 存储GitLab各类配置文件     |

在同一目录，启动docker-compose

```sh
docker compose up -d
```

查询root初始密码

```sh
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```

访问`external_url`中的地址

![An image](/img/dev/gitlab/01.png)
