# Vaultwarden-backup

**Vaultwarden Backup** 是一个用于备份 Vaultwarden 数据的过程或工具，确保密码和其他敏感数据的安全性和可恢复性。由于 Vaultwarden 是一个自托管的服务，备份数据是用户的责任，以防止意外数据丢失或服务中断。

**相关链接：**

- [GitHub](https://github.com/ttionya/vaultwarden-backup)
- [Docker Hub](https://hub.docker.com/r/ttionya/vaultwarden-backup)

## 功能

**Vaultwarden Backup** 工具会备份以下文件或目录。

- `db.sqlite3` (SQLite 数据库)
- `db.dump` (PostgreSQL 数据库)
- `db.sql` (MySQL / MariaDB 数据库)
- `config.json`
- `rsa_key*` (多个文件)
- `attachments` (目录)
- `sends` (目录)

并且支持以下通知备份结果的方式。

- Ping (完成，开始，成功或失败时发送)
- Mail (基于 SMTP，成功时和失败时都会发送)

## 使用方法

### 配置Rclone

> **对于备份，你需要先配置 Rclone，否则备份工具不会工作。**
>
> **对于还原，它不是必要的。**

我们通过 [Rclone](https://rclone.org/) 同步备份文件到远程存储系统。

访问 [GitHub](https://github.com/rclone/rclone) 了解更多存储系统使用教程，不同的系统获得 Token 的方式不同。

#### 配置和检查

你可以通过下面的命令获得 Token。

```bash
docker run --rm -it \
  --mount type=bind,source=$(pwd),target=/config/ \
  ttionya/vaultwarden-backup:latest \
  rclone config
```

**我们建议将远程名称设置为 `BitwardenBackup`，否则你需要指定环境变量 `RCLONE_REMOTE_NAME` 为你设置的远程名称。**

完成设置后，可以通过以下命令检查配置情况。

```bash
docker run --rm -it \
  --mount type=bind,source=$(pwd),target=/config/ \
  ttionya/vaultwarden-backup:latest \
  rclone config show

# Microsoft Onedrive Example
# [BitwardenBackup]
# type = onedrive
# token = {"access_token":"access token","token_type":"token type","refresh_token":"refresh token","expiry":"expiry time"}
# drive_id = driveid
# drive_type = personal
```

### 备份

#### 自动备份

如果你有一个正在运行的 `vaultwarden`。

确保你的 vaultwarden 容器被命名为 `vaultwarden`，否则你需要自行替换 docker run 的 `--volumes-from` 部分。

默认情况下 vaultwarden 的数据文件夹是 `/data`，你需要显式使用环境变量 `DATA_DIR` 指定数据文件夹。

使用docker-compose运行

```yaml
version: '3.8'

services:
  vaultwarden_backup:
    image: ttionya/vaultwarden-backup:latest
    # 解决time64 兼容性问题
    security_opt:
      - seccomp=unconfined
    container_name: vaultwarden_backup
    restart: always
    volumes:
      # vaultwarden 数据目录
      - ./vaultwarden-data:/bitwarden/data/
      # vaultwarden_backup rclone 配置目录
      - ./rclone:/config/rclone/
      # 环境变量
      - ./.env:/.env
```

#### 环境变量

```properties
# 1. Please put the value in double quotes to avoid problems.
# 2. To use the file, you need to map the file to `/.env` in the container.

# Rclone 远程名称，它需要和 rclone config 中的远程名称保持一致。
# RCLONE_REMOTE_NAME="BitwardenBackup"
# 远程存储系统中存放备份文件的文件夹路径。
# RCLONE_REMOTE_DIR="/BitwardenBackup/"
# Rclone 全局参数
# RCLONE_GLOBAL_FLAG=""
# 备份定时任务CRON表达式，默认为每天凌晨5点执行
# CRON="5 * * * *"
# 将所有备份文件打包为压缩文件。当设置为 'FALSE' 时，会单独上传每个备份文件。
# ZIP_ENABLE="TRUE"
# 压缩文件的密码。请注意，打包备份文件时始终会使用密码。
# ZIP_PASSWORD="WHEREISMYPASSWORD?"
# 因为 zip 格式安全性较低，我们为追求安全的人提供 7z 格式的存档。
# ZIP_TYPE="zip"
# 备份文件后缀名称
# BACKUP_FILE_SUFFIX="%Y%m%d"
# 在远程存储系统中保留最近 X 天的备份文件。设置为 0 会保留所有备份文件。
# BACKUP_KEEP_DAYS="0"
# 设置你的时区名称。
# TIMEZONE="UTC"
# 邮箱配置
# MAIL_SMTP_ENABLE="FALSE"
# MAIL_SMTP_VARIABLES=""
# MAIL_TO=""
# MAIL_WHEN_SUCCESS="TRUE"
# MAIL_WHEN_FAILURE="TRUE"
# PING测试
# PING_URL=""
# PING_URL_CURL_OPTIONS=""
# PING_URL_WHEN_START=""
# PING_URL_WHEN_START_CURL_OPTIONS=""
# PING_URL_WHEN_SUCCESS=""
# PING_URL_WHEN_SUCCESS_CURL_OPTIONS=""
# PING_URL_WHEN_FAILURE=""
# PING_URL_WHEN_FAILURE_CURL_OPTIONS=""
```

### 还原备份

> **重要：** 还原备份会覆盖已存在的文件。

你需要在还原备份前停止 Docker 容器。

你也需要下载备份文件到本地计算机。

因为主机的文件无法在 Docker 容器中直接访问，所以要将需要还原的备份文件所在目录映射到 Docker 容器中。

**首先进入待还原的备份文件所在目录。**

```bash
docker run --rm -it \
  \ # 如果你将本地目录映射到 Docker 容器中，就像 `vw-data` 一样
  --mount type=bind,source="本地目录的绝对路径",target=/data/ \
  \ # 如果你使用 Docker 卷
  --mount type=volume,source="Docker 卷名称",target=/data/ \
  --mount type=bind,source=$(pwd),target=/bitwarden/restore/ \
  -e DATA_DIR="/data" \
  ttionya/vaultwarden-backup:latest restore \
  [OPTIONS]
```

#### 选项

```bash
-f / --force-restore
#强制还原，没有交互式确认。请谨慎使用！！

#你有一个名为 backup 的压缩文件
--zip-file <file>
#你需要使用这个选项来指定 backup 压缩文件。
#请确保压缩文件中的文件名没有被更改。

-p / --password
#这是不安全的！！
#如果 backup 压缩文件设置了密码，你可以用这个选项指定备份文件的密码。
#不建议使用该选项，因为在没有使用该选项且存在密码时，程序会交互式地询问密码。

# 你有多个独立的备份文件
--db-file <file> #你需要用这个选项来指定 db.* 文件。
--config-file <file> #你需要用这个选项来指定 config.json 文件。
--rsakey-file <file> #你需要用这个选项来指定 rsakey.tar 文件。
--attachments-file <file> #你需要用这个选项来指定 attachments.tar 文件。
--sends-file <file> #你需要用这个选项来指定 sends.tar 文件。
```

## 使用示例

本次测试使用 `Rclone` 备份至本地存储。

### 自动备份

#### 配置Rclone

运行docker命令生成配置文件示例

```bash
docker run --rm -it \
  --mount type=bind,source=$(pwd),target=/config/ \
  ttionya/vaultwarden-backup:latest \
  rclone config
```

选择 `30 / Local Disk` 本地磁盘

```bash
2024/12/06 06:56:01 NOTICE: Config file "/config/rclone/rclone.conf" not found - using defaults
No remotes found, make a new one?
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n

# 注：该名称需要与配置文件中RCLONE_REMOTE_NAME一致
Enter name for new remote.
name> test

Option Storage.
Type of storage to configure.
Choose a number from below, or type in your own value.
30 / Local Disk
   \ (local)
Storage> 30

Edit advanced config?
y) Yes
n) No (default)
y/n> n

Configuration complete.
Options:
- type: local
Keep this "test" remote?
y) Yes this is OK (default)
e) Edit this remote
d) Delete this remote
y/e/d> y
```

#### 查看Rclone配置

```bash
docker run --rm -it \
  --mount type=bind,source=$(pwd),target=/config/ \
  ttionya/vaultwarden-backup:latest \
  rclone config show
[test]
type = local
```

#### 配置环境变量

```properties
# 1. Please put the value in double quotes to avoid problems.
# 2. To use the file, you need to map the file to `/.env` in the container.

# Rclone 远程名称，它需要和 rclone config 中的远程名称保持一致。
RCLONE_REMOTE_NAME="test"
# 远程存储系统中存放备份文件的文件夹路径。
RCLONE_REMOTE_DIR="/back_up_data/"
# Rclone 全局参数
# RCLONE_GLOBAL_FLAG=""
# 备份定时任务CRON表达式，默认为每天凌晨5点执行
# 修改为每分钟备份一次，测试看效果
CRON="*/1 * * * *"
# 将所有备份文件打包为压缩文件。当设置为 'FALSE' 时，会单独上传每个备份文件。
# ZIP_ENABLE="TRUE"
# 压缩文件的密码。请注意，打包备份文件时始终会使用密码。
ZIP_PASSWORD="test"
# 因为 zip 格式安全性较低，我们为追求安全的人提供 7z 格式的存档。
ZIP_TYPE="7z"
# 备份文件后缀名称
# 由于每分钟备份一次，需要加上后缀分钟，否则会覆盖之前的备份文件
BACKUP_FILE_SUFFIX="%Y%m%d-%M"
# 在远程存储系统中保留最近 X 天的备份文件。设置为 0 会保留所有备份文件。
# BACKUP_KEEP_DAYS="0"
# 设置你的时区名称。
# TIMEZONE="UTC"
# 邮箱配置
# MAIL_SMTP_ENABLE="FALSE"
# MAIL_SMTP_VARIABLES=""
# MAIL_TO=""
# MAIL_WHEN_SUCCESS="TRUE"
# MAIL_WHEN_FAILURE="TRUE"
# PING测试
# PING_URL=""
# PING_URL_CURL_OPTIONS=""
# PING_URL_WHEN_START=""
# PING_URL_WHEN_START_CURL_OPTIONS=""
# PING_URL_WHEN_SUCCESS=""
# PING_URL_WHEN_SUCCESS_CURL_OPTIONS=""
# PING_URL_WHEN_FAILURE=""
# PING_URL_WHEN_FAILURE_CURL_OPTIONS=""
```

#### 创建 Docker Compose 文件

```bash
version: '3.8'

services:
  vaultwarden_backup:
    image: ttionya/vaultwarden-backup:latest
    # 解决time64 兼容性问题
    security_opt:
      - seccomp=unconfined
    container_name: vaultwarden_backup
    restart: always
    volumes:
      # 修改为 vaultwarden 数据目录（vw-data）位置
      - ./vaultwarden-data:/bitwarden/data/
      # vaultwarden_backup rclone 配置目录
      - ./rclone:/config/rclone/
      # 环境变量
      - ./.env:/.env
```

#### 启动服务

```bash
docker-compose up -d
```

#### 日志输出

```tex
find "/.env" file and export variables
========================================
DATA_DIR: /bitwarden/data
DATA_CONFIG: /bitwarden/data/config.json
DATA_RSAKEY: /bitwarden/data/rsa_key
DATA_ATTACHMENTS: /bitwarden/data/attachments
DATA_SENDS: /bitwarden/data/sends
========================================
DB_TYPE: SQLITE
DATA_DB: /bitwarden/data/db.sqlite3
========================================
CRON: */1 * * * *
RCLONE_REMOTE: test:/back_up_data
RCLONE_GLOBAL_FLAG: 
ZIP_ENABLE: TRUE
ZIP_PASSWORD: 4 Chars
ZIP_TYPE: 7z
BACKUP_FILE_DATE_FORMAT: %Y%m%d-%M (example "[filename].20241206-10.[ext]")
BACKUP_KEEP_DAYS: 0
MAIL_SMTP_ENABLE: FALSE
TIMEZONE: UTC
========================================
running the backup program at 2024-12-06 07:11:00 UTC
find "/.env" file and export variables
========================================
DATA_DIR: /bitwarden/data
DATA_CONFIG: /bitwarden/data/config.json
DATA_RSAKEY: /bitwarden/data/rsa_key
DATA_ATTACHMENTS: /bitwarden/data/attachments
DATA_SENDS: /bitwarden/data/sends
========================================
DB_TYPE: SQLITE
DATA_DB: /bitwarden/data/db.sqlite3
========================================
CRON: */1 * * * *
RCLONE_REMOTE: test:/back_up_data
RCLONE_GLOBAL_FLAG: 
ZIP_ENABLE: TRUE
ZIP_PASSWORD: 4 Chars
ZIP_TYPE: 7z
BACKUP_FILE_DATE_FORMAT: %Y%m%d-%M (example "[filename].20241206-11.[ext]")
BACKUP_KEEP_DAYS: 0
MAIL_SMTP_ENABLE: FALSE
TIMEZONE: UTC
========================================
backup vaultwarden sqlite database
backup vaultwarden config
not found vaultwarden config, skipping
backup vaultwarden rsakey
display rsakey tar file list
rsa_key.pem
backup vaultwarden attachments
display attachments tar file list
attachments/
backup vaultwarden sends
display sends tar file list
sends/
total 256K   
drwxr-xr-x    2 root     root         130 Dec  6 07:11 .
drwxrwxrwx    1 root     root          32 Dec  6 07:11 ..
-rw-r--r--    1 root     root        1.5K Dec  6 07:11 attachments.20241206-11.tar
-rw-r--r--    1 root     root      244.0K Dec  6 07:11 db.20241206-11.sqlite3
-rw-r--r--    1 root     root        3.5K Dec  6 07:11 rsakey.20241206-11.tar
-rw-r--r--    1 root     root        1.5K Dec  6 07:11 sends.20241206-11.tar
package backup file

7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=C.UTF-8 Threads:2 OPEN_MAX:1048576

Scanning the drive:
4 files, 256512 bytes (251 KiB)

Creating archive: /bitwarden/backup/backup.20241206-11.7z

Add new data to archive: 4 files, 256512 bytes (251 KiB)


Files read from disk: 4
Archive size: 8383 bytes (9 KiB)
Everything is Ok
total 268K   
drwxr-xr-x    2 root     root         159 Dec  6 07:11 .
drwxrwxrwx    1 root     root          32 Dec  6 07:11 ..
-rw-r--r--    1 root     root        1.5K Dec  6 07:11 attachments.20241206-11.tar
-rw-r--r--    1 root     root        8.2K Dec  6 07:11 backup.20241206-11.7z
-rw-r--r--    1 root     root      244.0K Dec  6 07:11 db.20241206-11.sqlite3
-rw-r--r--    1 root     root        3.5K Dec  6 07:11 rsakey.20241206-11.tar
-rw-r--r--    1 root     root        1.5K Dec  6 07:11 sends.20241206-11.tar
display backup 7z file list

7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=C.UTF-8 Threads:2 OPEN_MAX:1048576

Scanning the drive for archives:
1 file, 8383 bytes (9 KiB)

Listing archive: /bitwarden/backup/backup.20241206-11.7z

--
Path = /bitwarden/backup/backup.20241206-11.7z
Type = 7z
Physical Size = 8383
Headers Size = 303
Method = LZMA2:18 7zAES
Solid = +
Blocks = 1

   Date      Time    Attr         Size   Compressed  Name
------------------- ----- ------------ ------------  ------------------------
2024-12-06 07:11:00 ....A         1536         8080  attachments.20241206-11.tar
2024-12-06 07:11:00 ....A       249856               db.20241206-11.sqlite3
2024-12-06 07:11:00 ....A         3584               rsakey.20241206-11.tar
2024-12-06 07:11:00 ....A         1536               sends.20241206-11.tar
------------------- ----- ------------ ------------  ------------------------
2024-12-06 07:11:00             256512         8080  4 files
upload backup file to storage system [test:/back_up_data]
```

### 还原备份

**前提条件：**

- 先停止 `vaultwarden` 服务
- 准备需要还原的备份文件 `*.7z`

#### 获取备份文件

```bash
docker ps

# 输出
CONTAINER ID   IMAGE                               COMMAND                  CREATED         STATUS                 PORTS                                                                                  NAMES
cf209299b8c6   ttionya/vaultwarden-backup:latest   "/app/entrypoint.sh"     7 minutes ago   Up 7 minutes                                                                                                  vaultwarden_backup
```

将docker中的文件夹拷贝到物理机

```bash
docker cp vaultwarden_backup:/back_up_data/ ./backup/
```

#### 还原命令

```bash
docker run --rm -it \
  --mount type=bind,source="/home/zhangp/vaultwarden/vw-data",target=/data/ \
  --mount type=bind,source=$(pwd),target=/bitwarden/restore/ \
  -e DATA_DIR="/data" \
  ttionya/vaultwarden-backup:latest restore --zip-file backup.20241206-11.7z
```

#### 日志输出

```bash
Restore will overwrite the existing files, continue? (y/N)
(Default: n): y
restore vaultwarden backup zip file

7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=C.UTF-8 Threads:2 OPEN_MAX:1048576

Scanning the drive for archives:
1 file, 8383 bytes (9 KiB)   

Extracting archive: /bitwarden/restore/backup.20241206-11.7z

Enter password:test

--
Path = /bitwarden/restore/backup.20241206-11.7z
Type = 7z
Physical Size = 8383
Headers Size = 303
Method = LZMA2:18 7zAES
Solid = +
Blocks = 1

Everything is Ok

Files: 4
Size:       256512
Compressed: 8383
extract vaultwarden backup zip file successful
restore vaultwarden sqlite database
restore vaultwarden sqlite database successful
restore vaultwarden rsakey
restore vaultwarden rsakey successful
restore vaultwarden attachments
restore vaultwarden attachments successful
restore vaultwarden sends
restore vaultwarden sends successful
```
