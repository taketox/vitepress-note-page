# 备份恢复

## 数据备份

### 手动备份

Docker安装方式备份的话直接执行以下`docker`命令：

```sh
docker exec -t <container name> gitlab-backup create
```

执行的时候需要一点时间，需要耐心等待，会有如下类似的输出：

```sh
2023-11-21 03:05:09 UTC -- Dumping database ... 
Dumping PostgreSQL database gitlabhq_production ... [DONE]
2023-11-21 03:05:12 UTC -- Dumping database ... done
2023-11-21 03:05:12 UTC -- Dumping repositories ... 
2023-11-21 03:05:12 UTC -- Dumping repositories ... done
2023-11-21 03:05:12 UTC -- Dumping uploads ... 
2023-11-21 03:05:12 UTC -- Dumping uploads ... done
2023-11-21 03:05:12 UTC -- Dumping builds ... 
2023-11-21 03:05:12 UTC -- Dumping builds ... done
2023-11-21 03:05:12 UTC -- Dumping artifacts ... 
2023-11-21 03:05:12 UTC -- Dumping artifacts ... done
2023-11-21 03:05:12 UTC -- Dumping pages ... 
2023-11-21 03:05:12 UTC -- Dumping pages ... done
2023-11-21 03:05:12 UTC -- Dumping lfs objects ... 
2023-11-21 03:05:12 UTC -- Dumping lfs objects ... done
2023-11-21 03:05:12 UTC -- Dumping terraform states ... 
2023-11-21 03:05:12 UTC -- Dumping terraform states ... done
2023-11-21 03:05:12 UTC -- Dumping container registry images ... [DISABLED]
2023-11-21 03:05:12 UTC -- Dumping packages ... 
2023-11-21 03:05:12 UTC -- Dumping packages ... done
2023-11-21 03:05:12 UTC -- Dumping ci secure files ... 
2023-11-21 03:05:12 UTC -- Dumping ci secure files ... done
2023-11-21 03:05:13 UTC -- Creating backup archive: 1700535909_2023_11_21_16.6.0_gitlab_backup.tar ... 
2023-11-21 03:05:13 UTC -- Creating backup archive: 1700535909_2023_11_21_16.6.0_gitlab_backup.tar ... done
2023-11-21 03:05:13 UTC -- Uploading backup archive to remote storage  ... [SKIPPED]
2023-11-21 03:05:13 UTC -- Deleting old backups ... [SKIPPED]
2023-11-21 03:05:13 UTC -- Deleting tar staging files ... 
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/backup_information.yml
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/db
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/uploads.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/builds.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/artifacts.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/pages.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/lfs.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/terraform_state.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/packages.tar.gz
2023-11-21 03:05:13 UTC -- Cleaning up /var/opt/gitlab/backups/ci_secure_files.tar.gz
2023-11-21 03:05:13 UTC -- Deleting tar staging files ... done
2023-11-21 03:05:13 UTC -- Deleting backups/tmp ... 
2023-11-21 03:05:13 UTC -- Deleting backups/tmp ... done
2023-11-21 03:05:13 UTC -- Warning: Your gitlab.rb and gitlab-secrets.json files contain sensitive data 
and are not included in this backup. You will need these files to restore a backup.
Please back them up manually.
2023-11-21 03:05:13 UTC -- Backup 1700535909_2023_11_21_16.6.0 is done.
2023-11-21 03:05:13 UTC -- Deleting backup and restore PID file ... done
```

备份的文件是一个`tar`包，位于配置文件中的`backup_path`路径中，默认为`/var/opt/gitlab/backups`，宿主机中为`$GITLAB_HOME/data/backups`，进入目录可以看到`[TIMESTAMP]_gitlab_backup.tar`带有时间戳的压缩包，该压缩包包含了所有`gitlab`运行以来所有的数据。

```sh
taketo@ubuntu:/usr/local/gitlab/data$ sudo ls backups/
1700535909_2023_11_21_16.6.0_gitlab_backup.tar
```

因为`gitlab_backup.tar`备份不包含敏感数据，所以`$GITLAB_HOME/config`文件夹也需要备份一下。

```sh
Warning: Your gitlab.rb and gitlab-secrets.json files contain sensitive data 
and are not included in this backup. You will need these files to restore a backup.
Please back them up manually.
```

`$GITLAB_HOME/config`目录中的配置文件以及相关的key、cert、gitlab.rb、gitlab-secrets.json文件，包含了各类配置以及数据库加密秘钥等。

如果有特殊的设置，docker-compose最好也备份一下。

### 自动备份

查看`gitlab.rb`配置文件

```sh
### Backup Settings
###! Docs: https://docs.gitlab.com/omnibus/settings/backups.html

# gitlab_rails['manage_backup_path'] = true

# docker部署，路径默认data/backups/，无需修改
# gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"
# gitlab_rails['backup_gitaly_backup_path'] = "/opt/gitlab/embedded/bin/gitaly-backup"

###! Docs: https://docs.gitlab.com/ee/administration/backup_restore/backup_gitlab.html#backup-archive-permissions
# gitlab生成的备份文件权限
# gitlab_rails['backup_archive_permissions'] = 0644

# gitlab_rails['backup_pg_schema'] = 'public'

###! The duration in seconds to keep backups before they are allowed to be deleted
# gitlab备份所保留的时长，默认为七天
# gitlab_rails['backup_keep_time'] = 604800
```

配置`crontab`

```sh
# 新增定时任务
crontab -e

# 写入以下内容
# 每天凌晨2点执行备份
0 2 * * * /bin/docker exec -t <name of container> gitlab-backup create > /dev/null 2>&1

# 查看定时任务
crontab -l
```

## 数据恢复

### 环境准备

创建配置文件夹

```sh
mkdir -p gitlab/data/backups
```

将配置文件放入

```sh
mv 1700535909_2023_11_21_16.6.0_gitlab_backup.tar gitlab/data/backups
mv config gitlab/
mv docker-compose.yaml gitlab/
```

### 恢复操作

启动`docker-compose`

```sh
docker compose up -d
```

等docker启动状态由`starting`➜`healthy`后执行下述操作：

```sh
# 停止影响数据恢复的进程
docker exec -it <name of container> gitlab-ctl stop puma
docker exec -it <name of container> gitlab-ctl stop sidekiq

# 验证 GitLab 是否关闭
docker exec -it <name of container> gitlab-ctl status

# 检查备份文件权限
ls -al gitlab/data/backups/1700535909_2023_11_21_16.6.0_gitlab_backup.tar

# 开始恢复数据 注意：名称中省略了 "_gitlab_backup.tar"
docker exec -it <name of container> gitlab-backup restore BACKUP=1700535909_2023_11_21_16.6.0

# 重启 GitLab 容器
docker restart <name of container>

# 检查 GitLab 健康状态
docker exec -it <name of container> gitlab-rake gitlab:check SANITIZE=true
```

### 生产实战

启动docker-compose

```sh
taketo@debian:/usr/local/gitlab$ docker-compose up -d
Creating network "gitlab_default" with the default driver
Pulling gitlab (gitlab/gitlab-ce:latest)...
latest: Pulling from gitlab/gitlab-ce
43f89b94cd7d: Pull complete
9d4c9c3e5a0f: Pull complete
ac9a3d98d769: Pull complete
8e72f8181784: Pull complete
0699e3ccbccc: Pull complete
8979a762e649: Pull complete
874cfd2ca712: Pull complete
a12840f5230e: Pull complete
Digest: sha256:40f5614f6a6ac50602e7d7ae57d3673151c0d7d96833bf44e9fde67dd456c33b
Status: Downloaded newer image for gitlab/gitlab-ce:latest
Creating gitlab ... done
```

docker启动状态由`starting`➜`healthy`

```sh
taketo@debian:/usr/local/gitlab$ docker ps
CONTAINER ID   IMAGE                     COMMAND             CREATED              STATUS                                 PORTS                                                                                                                               NAMES
4f99fcb321e0   gitlab/gitlab-ce:latest   "/assets/wrapper"   About a minute ago   Up About a minute (health: starting)   80/tcp, 0.0.0.0:8888->8888/tcp, :::8888->8888/tcp, 0.0.0.0:8822->22/tcp, :::8822->22/tcp, 0.0.0.0:8443->443/tcp, :::8443->443/tcp   gitlab
taketo@debian:/usr/local/gitlab$ docker ps
CONTAINER ID   IMAGE                     COMMAND             CREATED         STATUS                   PORTS                                                                                                                               NAMES
4f99fcb321e0   gitlab/gitlab-ce:latest   "/assets/wrapper"   6 minutes ago   Up 6 minutes (healthy)   80/tcp, 0.0.0.0:8888->8888/tcp, :::8888->8888/tcp, 0.0.0.0:8822->22/tcp, :::8822->22/tcp, 0.0.0.0:8443->443/tcp, :::8443->443/tcp   gitlab
```

停止影响数据恢复的进程

```sh
taketo@debian:~$ docker exec -it gitlab gitlab-ctl stop puma
ok: down: puma: 0s, normally up
taketo@debian:~$ docker exec -it gitlab gitlab-ctl stop sidekiq
ok: down: sidekiq: 0s, normally up
taketo@debian:~$ docker exec -it gitlab gitlab-ctl status
run: alertmanager: (pid 1193) 6755s; run: log: (pid 1035) 6782s
run: gitaly: (pid 1158) 6757s; run: log: (pid 562) 6974s
run: gitlab-exporter: (pid 1168) 6757s; run: log: (pid 915) 6802s
run: gitlab-kas: (pid 712) 6965s; run: log: (pid 725) 6962s
run: gitlab-workhorse: (pid 1131) 6758s; run: log: (pid 878) 6810s
run: logrotate: (pid 2891) 3389s; run: log: (pid 508) 6986s
run: nginx: (pid 1150) 6757s; run: log: (pid 905) 6806s
run: postgres-exporter: (pid 1203) 6755s; run: log: (pid 1062) 6776s
run: postgresql: (pid 580) 6971s; run: log: (pid 647) 6968s
run: prometheus: (pid 1178) 6756s; run: log: (pid 1010) 6788s
down: puma: 13s, normally up; run: log: (pid 806) 6822s
run: redis: (pid 511) 6983s; run: log: (pid 530) 6980s
run: redis-exporter: (pid 1170) 6757s; run: log: (pid 943) 6794s
down: sidekiq: 5s, normally up; run: log: (pid 826) 6816s
run: sshd: (pid 29) 6999s; run: log: (pid 28) 6999s
```

开始恢复数据

```sh
taketo@debian:~$ docker exec -it gitlab gitlab-backup restore BACKUP=1700535909_2023_11_21_16.6.0
2023-11-21 06:04:59 UTC -- Unpacking backup ... 
2023-11-21 06:04:59 UTC -- Unpacking backup ... done
2023-11-21 06:04:59 UTC -- Restoring database ... 
2023-11-21 06:04:59 UTC -- Be sure to stop Puma, Sidekiq, and any other process that
connects to the database before proceeding. For Omnibus
installs, see the following link for more information:
https://docs.gitlab.com/ee/raketasks/backup_restore.html#restore-for-omnibus-gitlab-installations

Before restoring the database, we will remove all existing
tables to avoid future upgrade problems. Be aware that if you have
custom tables in the GitLab database these tables and all data will be
removed.

Do you want to continue (yes/no)? yes
Removing all tables. Press `Ctrl-C` within 5 seconds to abort
2023-11-21 06:05:22 UTC -- Cleaning the database ... 
2023-11-21 06:06:45 UTC -- done
Restoring PostgreSQL database gitlabhq_production ... ERROR:  must be owner of extension pg_trgm
ERROR:  must be owner of extension btree_gist
ERROR:  must be owner of extension btree_gist
ERROR:  must be owner of extension pg_trgm
SET
...
ALTER TABLE
[DONE]
Source backup for the database ci doesn't exist. Skipping the task
2023-11-21 06:15:21 UTC -- Restoring database ... done
2023-11-21 06:15:21 UTC -- Restoring repositories ... 
2023-11-21 06:15:21 UTC -- Restoring repositories ... done
2023-11-21 06:15:21 UTC -- Restoring uploads ... 
2023-11-21 06:15:21 UTC -- Restoring uploads ... done
2023-11-21 06:15:21 UTC -- Restoring builds ... 
2023-11-21 06:15:21 UTC -- Restoring builds ... done
2023-11-21 06:15:21 UTC -- Restoring artifacts ... 
2023-11-21 06:15:21 UTC -- Restoring artifacts ... done
2023-11-21 06:15:21 UTC -- Restoring pages ... 
2023-11-21 06:15:21 UTC -- Restoring pages ... done
2023-11-21 06:15:21 UTC -- Restoring lfs objects ... 
2023-11-21 06:15:21 UTC -- Restoring lfs objects ... done
2023-11-21 06:15:21 UTC -- Restoring terraform states ... 
2023-11-21 06:15:21 UTC -- Restoring terraform states ... done
2023-11-21 06:15:21 UTC -- Restoring packages ... 
2023-11-21 06:15:21 UTC -- Restoring packages ... done
2023-11-21 06:15:21 UTC -- Restoring ci secure files ... 
2023-11-21 06:15:21 UTC -- Restoring ci secure files ... done
This task will now rebuild the authorized_keys file.
You will lose any data stored in the authorized_keys file.
Do you want to continue (yes/no)? yes

2023-11-21 06:16:10 UTC -- Deleting tar staging files ... 
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/backup_information.yml
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/db
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/uploads.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/builds.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/artifacts.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/pages.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/lfs.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/terraform_state.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/packages.tar.gz
2023-11-21 06:16:10 UTC -- Cleaning up /var/opt/gitlab/backups/ci_secure_files.tar.gz
2023-11-21 06:16:10 UTC -- Deleting tar staging files ... done
2023-11-21 06:16:10 UTC -- Deleting backups/tmp ... 
2023-11-21 06:16:10 UTC -- Deleting backups/tmp ... done
2023-11-21 06:16:10 UTC -- Warning: Your gitlab.rb and gitlab-secrets.json files contain sensitive data 
and are not included in this backup. You will need to restore these files manually.
2023-11-21 06:16:10 UTC -- Restore task is done.
2023-11-21 06:16:10 UTC -- Deleting backup and restore PID file ... done
```

重启docker，docker启动状态由`starting`➜`healthy`

```sh
taketo@debian:~$ docker restart gitlab
gitlab
taketo@debian:~$ docker ps
CONTAINER ID   IMAGE                     COMMAND             CREATED       STATUS                        PORTS                                                                                                                               NAMES
4f99fcb321e0   gitlab/gitlab-ce:latest   "/assets/wrapper"   2 hours ago   Up About a minute (healthy)   80/tcp, 0.0.0.0:8888->8888/tcp, :::8888->8888/tcp, 0.0.0.0:8822->22/tcp, :::8822->22/tcp, 0.0.0.0:8443->443/tcp, :::8443->443/tcp   gitlab
```

检查 GitLab 健康状态

```sh
taketo@debian:~$ docker exec -it gitlab gitlab-rake gitlab:check SANITIZE=true
Checking GitLab subtasks ...

Checking GitLab Shell ...

GitLab Shell: ... GitLab Shell version >= 14.30.0 ? ... OK (14.30.0)
Running /opt/gitlab/embedded/service/gitlab-shell/bin/check
Internal API available: OK
Redis available via internal API: OK
gitlab-shell self-check successful

Checking GitLab Shell ... Finished

Checking Gitaly ...

Gitaly: ... default ... OK

Checking Gitaly ... Finished

Checking Sidekiq ...

Sidekiq: ... Running? ... yes
Number of Sidekiq processes (cluster/worker) ... 1/1

Checking Sidekiq ... Finished

Checking Incoming Email ...

Incoming Email: ... Reply by email is disabled in config/gitlab.yml

Checking Incoming Email ... Finished

Checking LDAP ...

LDAP: ... LDAP is disabled in config/gitlab.yml

Checking LDAP ... Finished

Checking GitLab App ...

Database config exists? ... yes
Tables are truncated? ... skipped
All migrations up? ... 
yes
Database contains orphaned GroupMembers? ... no
GitLab config exists? ... yes
GitLab config up to date? ... yes
Cable config exists? ... yes
Resque config exists? ... yes
Log directory writable? ... yes
Tmp directory writable? ... yes
Uploads directory exists? ... yes
Uploads directory has correct permissions? ... yes
Uploads directory tmp has correct permissions? ... skipped (no tmp uploads folder yet)
Systemd unit files or init script exist? ... skipped (omnibus-gitlab has neither init script nor systemd units)
Systemd unit files or init script up-to-date? ... skipped (omnibus-gitlab has neither init script nor systemd units)
Projects have namespace: ... can't check, you have no projects
Redis version >= 6.0.0? ... yes
Ruby version >= 3.0.6 ? ... yes (3.0.6)
Git user has default SSH configuration? ... yes
Active users: ... 2
Is authorized keys file accessible? ... yes
GitLab configured to store new projects in hashed storage? ... yes
All projects are in hashed storage? ... yes

Checking GitLab App ... Finished


Checking GitLab subtasks ... Finished
```

### 问题解决

问题描述：恢复命令出现 `Cannot open: Permission denied` 错误

```sh
taketo@debian:~$ sudo docker exec -it gitlab gitlab-backup restore BACKUP=1700535909_2023_11_21_16.6.0
2023-11-21 06:02:16 UTC -- Unpacking backup ... 
tar: 1700535909_2023_11_21_16.6.0_gitlab_backup.tar: Cannot open: Permission denied
tar: Error is not recoverable: exiting now
2023-11-21 06:02:16 UTC -- Unpacking backup failed
2023-11-21 06:02:16 UTC -- Deleting backup and restore PID file ... done
```

原因描述：备份文件权限不足，给予权限

解决方法：

```sh
taketo@debian:/usr/local/gitlab/data$ sudo ls -al backups/
total 460
drwx------  2 systemd-network root   4096 Nov 21 12:00 .
drwxr-xr-x 20 root            root   4096 Nov 21 12:07 ..
-rw-------  1 root            root 460800 Nov 21 11:59 1700535909_2023_11_21_16.6.0_gitlab_backup.tar
taketo@debian:/usr/local/gitlab/data/backups#sudo chmod 755 backups/1700535909_2023_11_21_16.6.0_gitlab_backup.tar 
taketo@debian:/usr/local/gitlab/data$ sudo ls -al backups/
total 460
drwx------  2 systemd-network root   4096 Nov 21 12:00 .
drwxr-xr-x 20 root            root   4096 Nov 21 12:07 ..
-rwxr-xr-x  1 root            root 460800 Nov 21 11:59 1700535909_2023_11_21_16.6.0_gitlab_backup.tar
```

问题描述：在恢复过程中出现 `ERROR:  must be owner of extension pg_trgm`

```SH
Restoring PostgreSQL database gitlabhq_production ... ERROR:  must be owner of extension pg_trgm
ERROR:  must be owner of extension btree_gist
ERROR:  must be owner of extension btree_gist
ERROR:  must be owner of extension pg_trgm
```

原因描述：postgre数据库权限不足

解决方法：

```sh
# 进入gitlab容器
docker exec -it gitlab bash

# 修改/var/opt/gitlab/postgresql/data/postgresql.conf，找到属性listen_addresses，修改配置
listen_addresses = '*'

# 修改/var/opt/gitlab/postgresql/data/pg_hba.conf
# 在文件最后添加这两行
local   all         all                               trust
host    all         all                               127.0.0.1/32 trust

# 重启服务
root@www:/# gitlab-ctl restart

# 修改PostgreSQL的gitlab账号权限为超级用户
root@www:/# gitlab-psql 
psql (13.11)
Type "help" for help.

gitlabhq_production=# ALTER USER gitlab WITH SUPERUSER;
ALTER ROLE
gitlabhq_production=# \q
```
