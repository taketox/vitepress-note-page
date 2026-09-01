# 密钥登录

## 生成密钥

使用 `ssh-keygen`，全部默认即可。

```sh
zhangp@MiWiFi-R3-srv:~$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/zhangp/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/zhangp/.ssh/id_rsa
Your public key has been saved in /home/zhangp/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:bmjCCgIwFcueFQOJxqr9a0nWXgA6GVDWk1DMiqIWYdM zhangp@MiWiFi-R3-srv
The key's randomart image is:
+---[RSA 3072]----+
|o+OX+.           |
|.XoEBo           |
|*.==.o           |
|=+=o  .          |
|=.+. . .S        |
|+...o .o.        |
|+  +ooo.o        |
|.. .+o..         |
|  ....           |
+----[SHA256]-----+
```

生成的密钥保存在 `/home/zhangp/.ssh/`

```sh
zhangp@MiWiFi-R3-srv:~$ ls -al .ssh/
total 24
drwx------  2 zhangp zhangp 4096 Dec 13 09:59 .
drwx------ 13 zhangp zhangp 4096 Dec 12 14:57 ..
-rw-------  1 zhangp zhangp 2610 Dec 13 09:59 id_rsa
-rw-r--r--  1 zhangp zhangp  574 Dec 13 09:59 id_rsa.pub
-rw-------  1 zhangp zhangp  364 Dec 11 20:21 known_hosts
```

> `id_rsa.pub`：公钥
>
> `id_rsa`：私钥

将公钥改名 `authorized_keys`，使用私钥作为登录密钥。

```sh
cp id_rsa.pub authorized_keys
```

## 禁止密码登录

修改 `sshd_config` 文件配置。

```sh
vim /etc/ssh/sshd_config

# 修改以下内容
# 禁用密码验证
PasswordAuthentication no
# 启用密钥验证
PubkeyAuthentication yes
```

## 重启ssh服务

```sh
# systemd
systemctl restart ssh

# centos系统
service sshd restart

# ubuntu系统
service ssh restart

# debian系统
/etc/init.d/ssh restart
```
