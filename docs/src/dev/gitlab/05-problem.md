# 系统迁移升级问题

## 问题复现

最近我的`Gitlab`服务进行了数据迁移并进行了相应的升级操作，但是在之后的使用过程中发现一些旧项目中的部分功能配置会出现异常情况，例如删除某个迁移过来的项目就会出现500报错网页。

## 原因

导致这样的原因的罪魁祸首是`db_key_base`参数出现了问题。

具体来说，`db_key_base`是一个64位随机字符串，它用于为应用程序生成安全的密钥，并在将敏感数据写入数据库之前对其进行加密。这种加密方式使用了先进的AES-256算法，可确保数据在传输或存储过程中不被窃取或篡改。

而Gitlab默认的备份机制在配备数据的过程中并不会对`Gitlab.rb`和`Gitlab-secrets.json`文件进行备份，导致了相关`Gitlab`相关服务出现异常情况。

> `Gitlab.rb`配置了`gitlab`的域名、邮件发送信息、白名单等相关信息。
>
> `Gitlab-secrets.json`文件存储了`Gitlab`的`db secret`信息。

## 解决方案

### 方案一

如果在数据迁移的时候旧数据还在，可以找到`gitlab-secrets.json`并替换到新的`Gitlab`服务器中然后重启服务。

重新加载配置文件

```sh
gitlab-ctl reconfigure
```

重启 `GitLab` 服务

```sh
gitlab-ctl restart
```

### 方案二

重置所有的密钥和token。

进入Rails控制台

```sh
# bash
gitlab-rails console

# resp
--------------------------------------------------------------------------------
 Ruby:         ruby 3.0.6p216 (2023-03-30 revision 23a532679b) [x86_64-linux]
 GitLab:       16.6.0 (6d558d71eba) FOSS
 GitLab Shell: 14.30.0
 PostgreSQL:   13.11
------------------------------------------------------------[ booted in 23.59s ]
Loading production environment (Rails 7.0.8)
irb(main):001:0> 
```

> 这个命令输入后需要等一会，这个取决于你的服务器性能，一般会登上三十多秒才能出现`irb(main):001:0>`，之后就可以进行下一步输入了

将相关加密Token设置为null值

在`irb(main):001:0>`中输入重置命令

```sh
# bash
Ci::Runner.all.update_all(token_encrypted: nil)

# resp
irb(main):001:0> Ci::Runner.all.update_all(token_encrypted: nil)
=> 0
irb(main):002:0> exit
```

输入之后在输入`exit`退出`Rails`控制台。

进入数据库控制台

> 需要注意的是，在使用`gitlab-rails dbconsole`时，请务必非常小心。因为您将直接操作`GitLab`使用的数据库，所以错误的`SQL` 语句有可能导致数据丢失或损坏。

```sh
# bash
gitlab-rails dbconsole

# resp
gitlab-rails dbconsole
psql (13.11)
Type "help" for help.
```

重置SQL数据库中的Token

然后依次输入一下命令

```sql
# 将所有项目的runners_token和runners_token_encrypted字段设置为null。
UPDATE projects SET runners_token = null, runners_token_encrypted = null;

# 将所有命名空间（例如用户或组）的runners_token和runners_token_encrypted字段设置为null。
UPDATE namespaces SET runners_token = null, runners_token_encrypted = null;

# 将GitLab应用程序设置中的runners_registration_token_encrypted字段设置为null。
UPDATE application_settings SET runners_registration_token_encrypted = null;
```

然后输入`\q`或者`exit`退出。

>could not save history to file "/var/opt/gitlab/.psql_history": Permission denied
>
>退出时会出现权限错误，实测不影响，直接重启即可。

重启Gitlab服务

```sh
gitlab-ctl restart
```
