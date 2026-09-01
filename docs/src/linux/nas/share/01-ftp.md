# FTP 服务

FTP（File Transfer Protocol）是一种用于在网络中传输文件的协议。以下是如何在 Linux 系统中安装和配置 FTP 服务的完整指南，以 **vsftpd**（Very Secure FTP Daemon）为例。

## 安装 FTP 服务

安装 vsftpd 软件包：

```bash
# Debian/Ubuntu 系统
sudo apt update && sudo apt install vsftpd -y
# RHEL/CentOS 系统
sudo yum install vsftpd -y
```

## 配置 FTP 服务

**配置共享目录：**

创建一个用于存放文件的共享目录：

```bash
sudo mkdir -p /srv/ftp
sudo chmod 755 /srv/ftp
```

**配置 vsftpd 服务：**

编辑 vsftpd 的配置文件：

```bash
sudo nano /etc/vsftpd.conf
```

确保以下配置项正确：

```bash
# 允许本地用户登录
local_enable=YES

# 允许写操作
write_enable=YES

# 禁止匿名用户登录
anonymous_enable=NO

# 将用户限制在其主目录
chroot_local_user=YES
allow_writeable_chroot=YES

# 启用被动模式（防火墙友好）
pasv_enable=YES
pasv_min_port=30000
pasv_max_port=31000
pasv_address=<服务器公网IP>

# 启用日志记录
xferlog_enable=YES
```

保存文件并重启服务：

```bash
sudo systemctl restart vsftpd
sudo systemctl enable vsftpd
```

## 创建 FTP 用户

**创建新用户：**

创建一个专用用户（例如 `ftpuser`）：

```bash
sudo adduser ftpuser
sudo passwd ftpuser
```

**配置用户权限：**

设置用户主目录：

```bash
sudo mkdir -p /home/ftpuser/ftp/uploads
sudo chmod 750 /home/ftpuser/ftp
sudo chmod 755 /home/ftpuser/ftp/uploads
sudo chown -R ftpuser:ftpuser /home/ftpuser/ftp
```

确保 `chroot_local_user=YES` 已在配置文件中启用。

## 测试 FTP 服务

**使用命令行测试：**

在客户端输入以下命令连接 FTP：

```bash
ftp <服务器IP>
```

登录后测试上传和下载功能。

**使用 FTP 客户端：**

使用 FileZilla 等图形化客户端，输入以下信息：

- **主机**：服务器的 IP 地址。
- **用户名**：`ftpuser`
- **密码**：设置的用户密码。
- **端口**：21

## 防火墙配置

**开放必要端口：**

FTP 需要开放以下端口：

- 控制连接：21
- 被动模式：30000-31000

```bash
# Debian/Ubuntu 系统
sudo ufw allow 21/tcp
sudo ufw allow 30000:31000/tcp
sudo ufw reload
# RHEL/CentOS 系统
sudo firewall-cmd --permanent --add-port=21/tcp
sudo firewall-cmd --permanent --add-port=30000-31000/tcp
sudo firewall-cmd --reload
```

## 配置开机自动挂载（仅对 FTP 客户端）

如果客户端需要长期使用 FTP，可以使用开机自动挂载工具，如 `curlftpfs`。

**安装 curlftpfs：**

```bash
sudo apt install curlftpfs -y  # Debian/Ubuntu
sudo yum install curlftpfs -y # RHEL/CentOS
```

**设置挂载：**

编辑 `/etc/fstab`，添加以下内容：

```bash
curlftpfs#ftpuser:password@<服务器IP> /mnt/ftp fuse rw,uid=1000,gid=1000,umask=0022,allow_other 0 0
```

运行以下命令挂载：

```bash
sudo mount -a
```

## 安全加固（可选）

**启用 TLS 加密：**

FTP 明文传输存在安全隐患，可以启用 TLS 加密（FTPS）。

生成 SSL 证书：

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/vsftpd.pem -out /etc/ssl/private/vsftpd.pem
```

配置 vsftpd 使用 TLS：

```bash
ssl_enable=YES
rsa_cert_file=/etc/ssl/private/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.pem
```

重启服务：

```bash
sudo systemctl restart vsftpd
```
