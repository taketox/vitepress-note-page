# 附录A. PostgreSQL的部署与配置

## A.1. PostgreSQL简介

### A.1.1. 什么是PostgreSQL

**`PostgreSQL`**（简称 **`PG`**）是一款开源的**关系型数据库管理系统（`RDBMS`）**，诞生于1996年，至今已有近30年的发展历史。它以**稳定性、可靠性、`ACID`事务支持**和**强大的扩展能力**著称，是目前生产环境中使用最广泛的开源关系型数据库之一。

**`PostgreSQL`** 的主要特点包括：

* **`ACID`事务**：完整支持原子性（`Atomicity`）、一致性（`Consistency`）、隔离性（`Isolation`）、持久性（`Durability`），确保数据操作的可靠性；
* **丰富的数据类型**：不仅支持传统的整数、浮点数、字符串，还原生支持 **`JSON`/`JSONB`**、数组、范围类型等，使其可以同时承担”关系型”和”文档型”数据库的角色；
* **可扩展性**：支持自定义数据类型、函数、索引类型，拥有丰富的扩展生态；
* **跨平台**：支持 **`Windows`**、**`Linux`**、**`macOS`** 等主流操作系统。

在 **`LangGraph`** 的上下文中，**`PostgreSQL`** 主要被用作**检查点（`Checkpoint`）的持久化后端**，同时也支持作为**长期记忆存储**使用。

### A.1.2. 为什么LangGraph需要PostgreSQL

在之前的 **6.2.4节** 中，我们提到”在学习 **`LangChain`** 时，我们已经介绍了 **`PostgreSQL`** 的部署和 **`PostgresSaver`** 的用法”。但如果你没有学习过 **`LangChain`** 课程，或者希望在本课程中获得完整的知识闭环，本附录将从零开始介绍 **`PostgreSQL`** 的部署与使用。

回顾一下第 **6.2.2节** 中检查点后端的对比：

| 后端                    | 适用场景                               |
| ----------------------- | -------------------------------------- |
| **`InMemorySaver`**     | 学习、调试、本地实验；进程结束数据丢失 |
| **`SQLite`**            | 轻量级本地持久化；单进程场景           |
| **`PostgreSQL`**        | 生产环境；跨进程、跨服务共享状态       |
| **`MongoDB`**           | 生产环境；偏好文档模型                 |
| **`Redis`**             | 生产环境；高吞吐、低延迟缓存场景       |

**`InMemorySaver`** 将检查点保存在当前 **`Python`** 进程的内存中。每次重启程序，内存中的数据就会丢失——这对于需要跨多次调用记住对话历史的多轮对话场景显然是不够的。

**`PostgresSaver`** 则将检查点写入 **`PostgreSQL`** 数据库。与程序进程的生命周期解耦：
* 多次运行同一个 **`thread_id`** 的对话，历史消息会持续累积；
* 重启 **`Python`** 程序后，只要数据库中的记录还在，历史检查点就能被恢复；
* 多个 **`Python`** 进程可以共享同一个 **`PostgreSQL`** 实例，实现跨进程的状态共享。

**`PostgresSaver`** 来自 **`langgraph-checkpoint-postgres`** 包，本节附录将完整介绍如何部署和配置它所需的 **`PostgreSQL`** 环境。

### A.1.3. 本文使用的连接信息

为与 **6.2.4节** 的代码保持一致，本附录统一使用以下连接信息：

| 配置项          | 值                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **`Host`**      | **`localhost`**                                                                                                                    |
| **`Port`**      | **`5432`**（**`PostgreSQL`** 默认端口）                                                                                           |
| **`Database`**  | **`langgraph_db`**                                                                                                                 |
| **`User`**      | **`langgraph_user`**                                                                                                               |
| **`Password`**  | **`123456`**                                                                                                                       |
| **`SSL Mode`**  | **`disable`**（本地开发环境关闭 SSL）                                                                                              |
| **连接URL**     | **`postgresql://langgraph_user:123456@localhost:5432/langgraph_db?sslmode=disable`**                                               |

> **注意**：这里的 **`sslmode=disable`** 表示关闭 **`SSL`** 连接，仅适用于本地开发和测试环境。生产环境中建议启用 **`SSL`** 并修改为强密码。


## A.2. PostgreSQL的安装与部署

本节介绍两种安装方式：**`Docker`** 部署（推荐，简单快速）和 **`Windows`** 直接安装（无需额外安装 **`Docker`**）。

### A.2.1. 方式一：使用Docker部署（推荐）

**`Docker`** 部署的优势在于：无需修改系统环境，安装卸载干净，版本切换方便，一条命令即可启动。

> 如果你还没有安装 **`Docker`**，请先访问 **[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)** 下载并安装。安装完成后确保 **`Docker Engine`** 处于运行状态（桌面右下角 **`Docker`** 图标为绿色）。

#### A.2.1.1. 拉取PostgreSQL镜像

打开 **`PowerShell`** 或 **`CMD`** 终端，执行：

```bash
docker pull postgres:16
```

这里选择 **`PostgreSQL 16`** 版本，是当前最新的稳定大版本，与 **`langgraph-checkpoint-postgres==3.0.5`** 兼容。

拉取完成后，可通过以下命令查看本地已有的镜像：

```bash
docker images | findstr postgres
```

#### A.2.1.2. 运行PostgreSQL容器

执行以下命令启动容器：

```bash
docker run -d `
  --name langgraph-postgres `
  -e POSTGRES_DB=langgraph_db `
  -e POSTGRES_USER=langgraph_user `
  -e POSTGRES_PASSWORD=123456 `
  -p 5432:5432 `
  postgres:16
```

> **Windows `CMD` 用户注意**：上述换行使用了 **`PowerShell`** 的反引号 `` ` ``。如果在 **`CMD`** 中执行，需要将 `` ` `` 替换为 `^`，或写成一整行：
> ```bash
> docker run -d --name langgraph-postgres -e POSTGRES_DB=langgraph_db -e POSTGRES_USER=langgraph_user -e POSTGRES_PASSWORD=123456 -p 5432:5432 postgres:16
> ```

各参数含义：

| 参数 | 含义 |
| ---- | ---- |
| **`-d`** | 后台运行（`daemon` 模式），终端关闭后容器不会停止 |
| **`--name langgraph-postgres`** | 容器名称，方便后续管理 |
| **`-e POSTGRES_DB=langgraph_db`** | 创建容器时自动创建名为 **`langgraph_db`** 的数据库 |
| **`-e POSTGRES_USER=langgraph_user`** | 自动创建用户 **`langgraph_user`** |
| **`-e POSTGRES_PASSWORD=123456`** | 设置该用户的密码为 **`123456`** |
| **`-p 5432:5432`** | 将容器的 5432 端口映射到宿主机的 5432 端口 |

> **注意**：通过环境变量自动创建的数据库和用户，其权限已自动配置好，无需再手动授权。如果使用手动安装方式，则需要额外执行授权步骤（见 **A.3.2节**）。

#### A.2.1.3. 验证容器运行状态

```bash
# 查看正在运行的容器
docker ps

# 如果看不到 langgraph-postgres，查看所有容器（包括已停止的）
docker ps -a

# 查看容器日志
docker logs langgraph-postgres
```

如果容器没有运行，可以通过以下命令启动：

```bash
docker start langgraph-postgres
```

> **常用容器管理命令**：
> ```bash
> docker stop langgraph-postgres    # 停止容器
> docker start langgraph-postgres   # 启动容器
> docker restart langgraph-postgres # 重启容器
> docker rm langgraph-postgres      # 删除容器（需要先停止）
> ```

#### A.2.1.4. Docker Compose方式（可选）

如果更习惯使用 **`Docker Compose`** 管理容器，可以创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: langgraph-postgres
    environment:
      POSTGRES_DB: langgraph_db
      POSTGRES_USER: langgraph_user
      POSTGRES_PASSWORD: 123456
    ports:
      - “5432:5432”
    volumes:
      - pgdata:/var/lib/postgresql/data  # 持久化数据，容器删除后数据不丢失

volumes:
  pgdata:
```

然后在 `docker-compose.yml` 所在目录执行：

```bash
docker compose up -d
```

**`volumes`** 配置将数据库文件映射到宿主机，**即使容器被删除，数据也不会丢失**——这对于保存检查点数据非常重要。


### A.2.2. 方式二：Windows直接安装

如果你不想安装 **`Docker`**，也可以直接在 **`Windows`** 上安装 **`PostgreSQL`**。

#### A.2.2.1. 下载安装包

访问 **[PostgreSQL Windows 官方下载页](https://www.postgresql.org/download/windows/)**，或直接访问 **[EDB安装包下载页](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)**，选择 **`PostgreSQL 16.x`** 版本、**`Windows x86-64`** 架构的安装包下载。

> 建议下载带有 **`pgAdmin`**（图形化管理工具）的完整安装包。

#### A.2.2.2. 安装步骤

1. **运行安装程序**：双击下载的 `.exe` 文件，点击 **`Next`**；
2. **选择安装目录**：建议保持默认路径 `C:\Program Files\PostgreSQL\16\`；
3. **选择安装组件**：勾选 **`PostgreSQL Server`**、**`pgAdmin 4`**（可选）、**`Command Line Tools`**（必选，需要 **`psql`** 命令行工具）；
4. **设置超级用户密码**：安装程序会要求为 **`postgres`** 超级用户设置密码（记好这个密码）；
5. **设置端口**：保持默认 **`5432`**；
6. **选择区域设置**：保持默认 **`Default locale`**；
7. **安装**：等待进度条完成。

#### A.2.2.3. 验证安装

安装完成后，打开 **`CMD`** 或 **`PowerShell`**：

```bash
# 检查 psql 是否可用
psql --version

# 使用超级用户连接数据库
psql -h localhost -p 5432 -U postgres
```

输入安装时设置的 **`postgres`** 密码，如果能进入 **`psql`** 交互界面（显示 `postgres=#` 提示符），说明安装成功。

#### A.2.2.4. Windows服务管理

**`PostgreSQL`** 安装后会自动注册为 **`Windows`** 服务（服务名：**`postgresql-x64-16`**），默认开机自启。

常用服务管理操作：

```bash
# 查看服务状态（PowerShell）
Get-Service postgresql-x64-16

# 手动启动服务
net start postgresql-x64-16

# 手动停止服务
net stop postgresql-x64-16
```

也可以通过 **`services.msc`**（服务管理器）图形界面管理。


### A.2.3. 安装Python依赖

无论选择哪一种安装方式，都需要安装 **`Python`** 侧的依赖包：

```bash
pip install langgraph-checkpoint-postgres==3.0.5
pip install psycopg[binary]
```

| 包名 | 作用 |
| ---- | ---- |
| **`langgraph-checkpoint-postgres`** | **`LangGraph`** 的 **`PostgreSQL`** 检查点后端，提供 **`PostgresSaver`** |
| **`psycopg[binary]`** | **`Python`** 的 **`PostgreSQL`** 驱动，负责底层数据库通信 |

> **`langgraph-checkpoint-postgres`** 内部依赖 **`psycopg`**，但建议显式安装以确保版本正确。**`[binary]`** 后缀表示安装包含预编译二进制文件的版本，避免从源码编译的麻烦。


## A.3. PostgreSQL基本操作

本节介绍 **`PostgreSQL`** 的常用操作。掌握这些内容有助于理解 **`PostgresSaver`** 在数据库中做了什么，也方便日常排查问题。

### A.3.1. 连接PostgreSQL

#### A.3.1.1. 使用psql命令行工具

**`psql`** 是 **`PostgreSQL`** 自带的命令行客户端。

连接命令格式：

```bash
psql -h <主机> -p <端口> -U <用户名> -d <数据库名>
```

对应本附录的连接信息：

```bash
psql -h localhost -p 5432 -U langgraph_user -d langgraph_db
# 输入密码: 123456
```

连接成功后，终端提示符变为 `langgraph_db=>`，可以输入 **`SQL`** 命令。

> **Docker 用户**：如果主机上没有安装 **`psql`**，可以直接进入容器内执行：
> ```bash
> docker exec -it langgraph-postgres psql -U langgraph_user -d langgraph_db
> ```

常用 **`psql`** 元命令：

| 命令 | 说明 |
| ---- | ---- |
| **`\l`** | 列出所有数据库 |
| **`\dt`** | 列出当前数据库的所有表 |
| **`\d table_name`** | 查看表结构 |
| **`\q`** | 退出 **`psql`** |

#### A.3.1.2. 使用Python连接

在 **`Python`** 中使用 **`psycopg`** 连接：

```python
import psycopg

DB_URL = “postgresql://langgraph_user:123456@localhost:5432/langgraph_db?sslmode=disable”

conn = psycopg.connect(DB_URL)
cur = conn.cursor()

# 查看 PostgreSQL 版本信息
cur.execute(“SELECT version();”)
result = cur.fetchone()
print(f”PostgreSQL 版本：{result[0]}”)

cur.close()
conn.close()
```

**运行结果如下**

```
PostgreSQL 版本：PostgreSQL 16.x on x86_64-pc-linux-gnu, compiled by gcc ...
```

> **注意**：如果在 `pip install psycopg` 时没有加 `[binary]` 后缀，可能会因为缺少编译环境而报错。遇到这种情况执行 `pip install psycopg[binary]` 即可。


### A.3.2. 创建数据库和用户

> **Docker 用户请注意**：通过 **`docker run`** 的 **`-e`** 环境变量启动容器时，数据库和用户已经自动创建并配置好权限，**可以跳过本节**，直接阅读 **A.3.3节**。

如果你是**手动安装**的，启动时**不会**自动创建 `langgraph_db` 数据库和 `langgraph_user` 用户，需要手动创建。

#### A.3.2.1. 创建数据库

首先用超级用户 **`postgres`** 连接：

```bash
psql -h localhost -p 5432 -U postgres
```

然后创建数据库：

```sql
CREATE DATABASE langgraph_db;
```

查看是否创建成功：

```sql
\l
```

输出中如果能找到 **`langgraph_db`** 条目，则说明创建成功。

#### A.3.2.2. 创建用户并授权

在同一个 **`psql`** 会话中继续执行：

```sql
-- 创建用户
CREATE USER langgraph_user WITH PASSWORD '123456';

-- 赋予该用户对 langgraph_db 的所有权限
GRANT ALL PRIVILEGES ON DATABASE langgraph_db TO langgraph_user;
```

> **`PostgreSQL 15+`** 版本默认收紧了对 **`public`** 模式的权限管理。如果后续 **`PostgresSaver`** 在创建表时报权限错误，需要额外执行：
> ```sql
> \c langgraph_db
> GRANT ALL ON SCHEMA public TO langgraph_user;
> ```

退出 **`psql`**，用新用户测试连接：

```bash
psql -h localhost -p 5432 -U langgraph_user -d langgraph_db
# 输入密码: 123456
```

如果能成功连接，说明用户和数据库配置正确。


### A.3.3. 基本CRUD操作

了解基本的 **`SQL`** 增删改查有助于查看和理解 **`PostgresSaver`** 内部的数据存储。

#### A.3.3.1. 创建表

```sql
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

* **`SERIAL PRIMARY KEY`**：自增主键，**`PostgreSQL`** 会自动为新插入的行分配唯一的 **`id`**；
* **`TEXT`**：变长文本类型，适合存储聊天消息内容；
* **`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`**：时间戳类型，默认为插入时的当前时间。

#### A.3.3.2. 插入数据

```sql
INSERT INTO messages (thread_id, role, content)
VALUES ('chapter_6_6.2.4', 'user', '你好，我是老王');

INSERT INTO messages (thread_id, role, content)
VALUES ('chapter_6_6.2.4', 'assistant', '老王你好！有什么可以帮你的？');
```

#### A.3.3.3. 查询数据

```sql
-- 查询所有记录
SELECT * FROM messages;

-- 按 thread_id 筛选（最常用，对应 LangGraph 中的 thread）
SELECT * FROM messages WHERE thread_id = 'chapter_6_6.2.4';

-- 按时间排序
SELECT * FROM messages WHERE thread_id = 'chapter_6_6.2.4' ORDER BY created_at;
```

#### A.3.3.4. 更新和删除数据

```sql
-- 更新某条记录的内容
UPDATE messages SET content = '你好，我是老王，今年30岁。'
WHERE id = 1;

-- 删除某条记录
DELETE FROM messages WHERE id = 2;

-- 删除整个表（注意：操作不可逆）
DROP TABLE IF EXISTS messages;
```


### A.3.4. 查看PostgresSaver创建的表结构

这是整个附录中最实用的部分——**连接回 6.2.4节**，看看 **`checkpointer.setup()`** 在 **`PostgreSQL`** 中到底创建了什么。

#### A.3.4.1. 运行setup()后查看表

首先运行一次 **6.2.4节** 的代码（确保 **`setup()`** 已执行），然后在 **`psql`** 中查看：

```sql
\c langgraph_db
\dt
```

**运行结果如下**

```
             List of relations
 Schema |        Name           | Type  |     Owner
--------+-----------------------+-------+----------------
 public | checkpoint_blobs      | 数据表 | langgraph_user
 public | checkpoint_migrations | 数据表 | langgraph_user
 public | checkpoint_writes     | 数据表 | langgraph_user
 public | checkpoints           | 数据表 | langgraph_user
```

可以看到 **`setup()`** 在数据库中创建了四张表：

| 表名 | 用途 |
| ---- | ---- |
| **`checkpoints`** | 存储完整的检查点快照（状态、元数据等） |
| **`checkpoint_writes`** | 存储每个检查点对应的通道写入记录 |
| **`checkpoint_blobs`** | 存储大型二进制数据（如图片、文件等，如果状态中包含的话） |
| **`checkpoint_migrations`** | 记录数据库迁移版本，**`LangGraph`** 内部使用，用于管理表结构变更 |

#### A.3.4.2. 检查点表结构说明

使用 **`\d`** 命令查看每张表的实际结构。

**（1）checkpoints 表**

```sql
\d checkpoints
```

```
         栏位         | 类型  |  可空的  |    预设
----------------------+-------+----------+-------------
 thread_id            | text  | not null |
 checkpoint_ns        | text  | not null | ''::text
 checkpoint_id        | text  | not null |
 parent_checkpoint_id | text  |          |
 type                 | text  |          |
 checkpoint           | jsonb | not null |
 metadata             | jsonb | not null | '{}'::jsonb
索引：
    "checkpoints_pkey" PRIMARY KEY, btree (thread_id, checkpoint_ns, checkpoint_id)
    "checkpoints_thread_id_idx" btree (thread_id)
```

**关键字段说明**：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| **`thread_id`** | **`text`** | 线程ID，对应 **`config`** 中的 **`thread_id`**，用于区分不同对话 |
| **`checkpoint_ns`** | **`text`** | 检查点命名空间，默认空字符串，用于子图等场景隔离不同层级的检查点 |
| **`checkpoint_id`** | **`text`** | 检查点唯一ID，由 **`LangGraph`** 内部生成 |
| **`parent_checkpoint_id`** | **`text`** | 父检查点ID，构建检查点链，用于 **`Time Travel`** 回退 |
| **`type`** | **`text`** | 检查点类型 |
| **`checkpoint`** | **`jsonb`** | 检查点核心数据（状态快照），以 **`JSON`** 格式存储 |
| **`metadata`** | **`jsonb`** | 检查点元数据（创建时间、来源、步骤序号等），预设为 `'{}'::jsonb` |

* 主键为 **(thread_id, checkpoint_ns, checkpoint_id)** 联合主键。
* 另有 **`thread_id`** 单列索引，加速按线程筛选查询。

**（2）checkpoint_writes 表**

```sql
\d checkpoint_writes
```

```
     栏位      |  类型   |  可空的  |   预设
---------------+---------+----------+----------
 thread_id     | text    | not null |
 checkpoint_ns | text    | not null | ''::text
 checkpoint_id | text    | not null |
 task_id       | text    | not null |
 idx           | integer | not null |
 channel       | text    | not null |
 type          | text    |          |
 blob          | bytea   | not null |
 task_path     | text    | not null | ''::text
索引：
    "checkpoint_writes_pkey" PRIMARY KEY, btree (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
    "checkpoint_writes_thread_id_idx" btree (thread_id)
```

**关键字段说明**：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| **`thread_id`** | **`text`** | 线程ID |
| **`checkpoint_ns`** | **`text`** | 命名空间，与 **`checkpoints`** 表对应 |
| **`checkpoint_id`** | **`text`** | 所属检查点ID |
| **`task_id`** | **`text`** | 产生写入的节点任务ID |
| **`idx`** | **`integer`** | 写入顺序索引 |
| **`channel`** | **`text`** | 写入的目标通道名（如 **`messages`**、**`__pregel_tasks`**） |
| **`type`** | **`text`** | 写入数据类型 |
| **`blob`** | **`bytea`** | 写入的二进制数据 |
| **`task_path`** | **`text`** | 任务路径，用于追踪节点在子图中的层级关系 |

* 主键为 **(thread_id, checkpoint_ns, checkpoint_id, task_id, idx)** 联合主键，确保同一任务下的写入顺序唯一。

**（3）checkpoint_blobs 表**

```sql
\d checkpoint_blobs
```

```
     栏位      | 类型  |  可空的  |   预设
---------------+-------+----------+----------
 thread_id     | text  | not null |
 checkpoint_ns | text  | not null | ''::text
 channel       | text  | not null |
 version       | text  | not null |
 type          | text  | not null |
 blob          | bytea |          |
索引：
    "checkpoint_blobs_pkey" PRIMARY KEY, btree (thread_id, checkpoint_ns, channel, version)
    "checkpoint_blobs_thread_id_idx" btree (thread_id)
```

**关键字段说明**：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| **`thread_id`** | **`text`** | 线程ID |
| **`checkpoint_ns`** | **`text`** | 命名空间 |
| **`channel`** | **`text`** | 通道名 |
| **`version`** | **`text`** | 数据版本标识，同一通道可以有多个版本 |
| **`type`** | **`text`** | 数据类型 |
| **`blob`** | **`bytea`** | 二进制数据本体 |

* 主键为 **(thread_id, checkpoint_ns, channel, version)** 联合主键。
* 与 **`checkpoint_writes`** 不同，**`checkpoint_blobs`** 以 **(channel, version)** 维度管理数据版本，不直接关联某个具体的 **`checkpoint_id`**，允许多个检查点共享同一通道的大型二进制数据。

**（4）checkpoint_migrations 表**

```sql
\d checkpoint_migrations
```

```
 栏位 |  类型   |  可空的  | 预设
------+---------+----------+------
 v    | integer | not null |
索引：
    "checkpoint_migrations_pkey" PRIMARY KEY, btree (v)
```

**关键字段说明**：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| **`v`** | **`integer`** | 当前数据库迁移版本号 |

* 单列主键，仅一条记录，**`setup()`** 执行时自动检查并更新。
* 该表由 **`LangGraph`** 内部管理，用户无需手动操作。未来 **`LangGraph`** 版本升级时，若表结构有变更，**`setup()`** 会根据此版本号自动执行对应的迁移 **`SQL`**。

> **四张表的关系**：
> * **`checkpoints`** 存储每次 **`graph.invoke()`** 产生的检查点快照；
> * **`checkpoint_writes`** 存储每个检查点下各节点任务的通道写入记录（一条检查点通常对应多条写入）；
> * **`checkpoint_blobs`** 存储通道级别的大型二进制数据，以 **(thread_id, checkpoint_ns, channel, version)** 为维度，可跨检查点复用；
> * **`checkpoint_migrations`** 仅用于数据库表结构版本管理。
>
> **`LangGraph`** 通过 **`thread_id`** + **`checkpoint_ns`** + **`checkpoint_id`** 联合定位和恢复状态。

#### A.3.4.3. 写入检查点数据查询

运行 **6.2.4节** 的示例代码后，可以直接在数据库中查看写入的数据：

```sql
SET client_encoding = 'UTF8';
-- 查看指定线程的检查点数量
SELECT thread_id, count(*)
FROM checkpoints
WHERE thread_id = 'chapter03-02'
GROUP BY thread_id;

-- 查看所有检查点的基本信息（按创建时间排序）
SELECT checkpoint_id, parent_checkpoint_id, checkpoint_ns, metadata
FROM checkpoints
WHERE thread_id = 'chapter03-02'
ORDER BY metadata;

-- 查看最新检查点的消息通道写入数据
SELECT c.checkpoint_id, c.checkpoint_ns, cw.channel, cw.task_id, cw.type
FROM checkpoints c
JOIN checkpoint_writes cw
  ON c.thread_id = cw.thread_id
 AND c.checkpoint_ns = cw.checkpoint_ns
 AND c.checkpoint_id = cw.checkpoint_id
WHERE c.thread_id = 'chapter03-02'
  AND cw.channel = 'messages'
ORDER BY cw.idx;

-- 查看最新检查点的完整状态 JSON
SELECT checkpoint_id, checkpoint
FROM checkpoints
WHERE thread_id = 'chapter03-02'
ORDER BY metadata DESC
LIMIT 1;

```

通过这些查询，可以直观地理解 **`PostgresSaver`** 是如何将 **`LangGraph`** 的检查点数据持久化到 **`PostgreSQL`** 中的。

> **Windows 终端编码问题**：
> 在中文 **`Windows`** 的 **`CMD`** 或 **`PowerShell`** 中使用 **`psql`** 查询 **`checkpoint`**（**`jsonb`**）字段时，如果数据中包含 emoji 等 4 字节 **`UTF-8`** 字符，可能会报错：
>
> ```
> 错误:  编码"UTF8"的字符0x0xf0 0x9f 0xa4 0x94在编码"GBK"没有相对应值
> ```
> 这是因为 **`Windows`** 终端默认编码为 **`GBK`**，无法处理 4 字节 **`UTF-8`** 字符。解决方案：
> ```sql
> -- 查询前先切换客户端编码
> SET client_encoding = 'UTF8';
> ```
> 或在 **`PowerShell`** 中先执行 **`chcp 65001`** 切换到 **`UTF-8`** 编码，再启动 **`psql`**。

#### 补充说明

* **`setup()`** 是幂等的——多次调用不会重复创建表，也不会清空已有数据；
* 实际项目中，建议将 **`setup()`** 作为独立的数据库初始化/迁移步骤执行，而不是每次启动应用时都调用（这也是 **6.2.4节** 代码注释中提到的建议）；
* 如果需要主动清理某个线程的检查点数据，可以使用 **`checkpointer.delete_thread(thread_id)`** 方法，或者从数据库层面删除对应记录；
* 关于连接池：如果需要在生产环境中处理高并发请求，建议使用 **`psycopg_pool`** 提供的连接池功能，而不是每次创建新连接。
