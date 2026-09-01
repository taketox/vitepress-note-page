# Vaultwarden

**Vaultwarden** 是一个用来管理密码的工具，可以看作是流行的密码管理器 **Bitwarden** 的“迷你版”。它是开源的，你可以自己搭建，把所有密码都存放在自己的服务器上，这样数据完全由自己掌控，不用担心被别人泄露。

**相关链接：**

- [GitHub](https://github.com/dani-garcia/vaultwarden)
- [Docker Hub](https://hub.docker.com/r/vaultwarden/server)
- [Download](https://bitwarden.com/download/)
- [Wiki](https://github.com/dani-garcia/vaultwarden)

## Vaultwarden 的特点

1. **轻量化：**
   - Vaultwarden 使用 Rust 编写，性能高效且资源占用极低，适合低性能设备。
   - 对比官方的 Bitwarden 后端，Vaultwarden 更加轻便，适合个人或小型团队使用。
2. **兼容性：**
   - 兼容 Bitwarden 官方客户端，包括桌面应用、浏览器插件、移动端应用和命令行工具。
   - 提供与官方 API 兼容的功能。
3. **自托管：**
   - 支持自托管，无需依赖外部服务，数据完全由用户控制。
   - 适合对隐私有较高要求的用户。
4. **易部署：**
   - 支持 Docker 部署，简单快速。
   - 也可以直接使用二进制文件运行，配置灵活。
5. **扩展功能：**
   - 支持 2FA（双因素认证）。
   - 提供 API 访问。
   - 支持 WebSocket 和实时通知。
6. **社区活跃：**
   - 有活跃的开发者和用户社区，不断修复问题和增加新功能。

## 适用场景

1. 个人密码管理：
   - 对隐私有较高要求，不希望密码数据存储在第三方服务器上。
2. 团队协作：
   - 小型团队需要一个共享密码管理工具，且希望降低托管成本。
3. 低性能设备：
   - 在 Raspberry Pi 或老旧服务器上运行密码管理服务。

## 部署步骤

### 准备环境

- 确保安装了 Docker 和 Docker Compose。

### 创建 Docker Compose 文件

```yaml
version: '3.8'

services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    environment:
      # DOMAIN: "https://vaultwarden.example.com"  # required when using a reverse proxy; your domain; vaultwarden needs to know it's https to work properly with attachments
      # 是否允许注册
      SIGNUPS_ALLOWED: "true"
      # 是否允许邀请
      INVITATIONS_ALLOWED: "false"
      # 密码提示显示
      SHOW_PASSWORD_HINT: "false"
      # SSL证书
      ROCKET_TLS: '{certs="/data/bitwarden.crt",key="/data/bitwarden.key"}'
    volumes:
      # the path before the : can be changed
      - ./vw-data:/data
    ports:
      - 80:80
```

### 启动服务

```bash
docker-compose up -d
```

### 访问服务

- 打开浏览器，访问 `http://<你的服务器 IP>`，即可使用 Vaultwarden。

![An image](/img/linux/nas/005.png)

## 启用 HTTPS

由于 **Vaultwarden** 要求连接到的服务器必须为 **https**，所以首先需要为内网IP申请一个SSL自签名证书，这里使用 **mkcert** 生成证书。

### mkcert

**mkcert** 是一个简单易用的命令行工具，用来生成本地开发环境的 **HTTPS 证书**。它特别适合开发者，在本地调试时可以生成受信任的 SSL 证书，而不需要通过复杂的 CA（证书颁发机构）流程。

### 安装

```sh
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

### 使用

```sh
# 安装
mkcert -install
# 针对ip生成SSL证书
mkcert --cert-file bitwarden.crt --key-file bitwarden.key <IP>
```

访问设备需要安装证书到受信任根证书颁发机构

Windows系统双击 `bitwarden.crt` 安装即可。

![An image](/img/linux/nas/006.png)

打开浏览器，访问 `http://<你的服务器 IP>`，注册用户成功进入首页。

![An image](/img/linux/nas/007.png)

## 反向代理

默认情况下，`Vaultwarden` 监听端口 80，用于处理 Web（REST API）流量和 `WebSocket` 流量。反向代理应配置为终止 SSL/TLS 连接（通常在标准 `HTTPS` 端口 443 上）。反向代理接收来自客户端的请求后，将其转发到 `Vaultwarden` 的端口 80 或您配置的其他监听端口，并在收到 `Vaultwarden` 的响应后将响应返回给客户端。

需要注意的是，当 `Vaultwarden` 部署在反向代理之后时，通常假设反向代理与 `Vaultwarden` 之间的连接通过安全的私有网络传输，因此不需要加密。这种情况下，不应启用 `Vaultwarden` 内置的 `HTTPS` 功能（即不应设置相关环境变量）。如果启用了内置的 `HTTPS` 功能，连接将会失败，因为反向代理通过 `HTTP` 与 `Vaultwarden` 通信，而 `Vaultwarden` 被配置为期望接收 `HTTPS` 通信。

```nginx
# The `upstream` directives ensure that you have a http/1.1 connection
# This enables the keepalive option and better performance
#
# Define the server IP and ports here.
upstream vaultwarden-default {
  zone vaultwarden-default 64k;
  server 127.0.0.1:11001;
  keepalive 2;
}

# Needed to support websocket connections
# See: https://nginx.org/en/docs/http/websocket.html
# Instead of "close" as stated in the above link we send an empty value.
# Else all keepalive connections will not work.
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      "";
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name vaultwarden.example.com;

    if ($host = vaultwarden.example.com) {
        return 301 https://$host$request_uri;
    }
    return 404;

    # If you run into 504 Gateway Timeout problems, tell nginx to wait longer for Vaultwarden by adding longer timeouts to the section
    #proxy_connect_timeout       777;
    #proxy_send_timeout          777;
    #proxy_read_timeout          777;
    #send_timeout                777;
}

server {
    # For older versions of nginx appened http2 to the listen line after ssl and remove `http2 on`
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name vaultwarden.example.com;

    # Specify SSL Config when needed
    #ssl_certificate /path/to/certificate/letsencrypt/live/vaultwarden.example.com/fullchain.pem;
    #ssl_certificate_key /path/to/certificate/letsencrypt/live/vaultwarden.example.com/privkey.pem;
    #ssl_trusted_certificate /path/to/certificate/letsencrypt/live/vaultwarden.example.com/fullchain.pem;

    client_max_body_size 525M;

    location / {
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;

      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_pass http://vaultwarden-default;
    }

    # Optionally add extra authentication besides the ADMIN_TOKEN
    # Remove the comments below `#` and create the htpasswd_file to have it active
    #
    #location /admin {
    #  # See: https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/
    #  auth_basic "Private";
    #  auth_basic_user_file /path/to/htpasswd_file;
    #
    #  proxy_http_version 1.1;
    #  proxy_set_header Upgrade $http_upgrade;
    #  proxy_set_header Connection $connection_upgrade;
    #
    #  proxy_set_header Host $host;
    #  proxy_set_header X-Real-IP $remote_addr;
    #  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #  proxy_set_header X-Forwarded-Proto $scheme;
    #
    #  proxy_pass http://vaultwarden-default;
    #}
}
```
