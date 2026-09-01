# 配置存储

## ConfigMap

`ConfigMap` 是一种比较特殊的存储卷，它的主要作用是用来存储配置信息的。

- `ConfigMap` 用来在键值对数据库(**etcd**)中保存非加密数据。一般用来保存配置文件。
- `ConfigMap` 可以用作环境变量、命令行参数或者存储卷。
- `ConfigMap` 将环境配置信息与 [容器镜像](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-image) 解耦，便于配置的修改。
- `ConfigMap` 在设计上不是用来保存大量数据的。

> 在`ConfigMap` 中保存的数据不可超过 `1 MiB`，超出此限制，需要考虑挂载存储卷或者访问文件存储服务。

### 资源清单

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: game-demo
data:
  # 类属性键；每一个键都映射到一个简单的值
  player_initial_lives: "3"
  ui_properties_file_name: "user-interface.properties"

  # 类文件键
  game.properties: |
    enemy.types=aliens,monsters
    player.maximum-lives=5
  user-interface.properties: |
    color.good=purple
    color.bad=yellow
    allow.textmode=true
```

### 使用

创建 `configmap.yaml` 文件

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap
  namespace: default
data:
  info: |
    username:admin
    password:123456
```

创建 `configmap` 存储卷

```sh
# 创建configmap
kubectl create -f configmap.yaml

# 查看configmap详情
kubectl describe cm configmap
# resp
Name:         configmap
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
info:
----
username:admin
password:123456


BinaryData
====

Events:  <none>
```

创建一个 `pod-configmap.yaml` ，将上面创建的 `configmap` 挂载进去

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-configmap
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      volumeMounts: # 将configmap挂载到目录
        - name: config
          mountPath: /configmap/config
  volumes: # 引用configmap
    - name: config
      configMap:
        name: configmap
```

测试运行

```sh
# 创建pod
kubectl create -f pod-configmap.yaml

# 查看pod
kubectl get pod pod-configmap
# resp
NAME            READY   STATUS    RESTARTS   AGE
pod-configmap   1/1     Running   0          39s

# 进入容器
kubectl exec -it pod-configmap -- bash
# /# cd configmap/config/
# /configmap/config# ls
info
# /configmap/config# cat info 
username:admin
password:123456

# 可以看到映射已经成功，每个configmap都映射成了一个目录
# key--->文件     value---->文件中的内容
# 此时如果更新configmap的内容, 容器中的值也会动态更新
```

## Secret

在kubernetes中，还存在一种和 `ConfigMap` 非常类似的对象，称为 `Secret` 对象。

它主要用于存储敏感信息，例如密码、秘钥、证书等等。

### 类型

创建 Secret 时，你可以使用 Secret 资源的 `type` 字段，或者与其等价的 `kubectl` 命令行参数（如果有的话）为其设置类型。 Secret 类型有助于对 Secret 数据进行编程处理。

| 内置类型                              | 用法                                     |
| ------------------------------------- | ---------------------------------------- |
| `Opaque`                              | 用户定义的任意数据                       |
| `kubernetes.io/service-account-token` | 服务账号令牌                             |
| `kubernetes.io/dockercfg`             | `~/.dockercfg` 文件的序列化形式          |
| `kubernetes.io/dockerconfigjson`      | `~/.docker/config.json` 文件的序列化形式 |
| `kubernetes.io/basic-auth`            | 用于基本身份认证的凭据                   |
| `kubernetes.io/ssh-auth`              | 用于 SSH 身份认证的凭据                  |
| `kubernetes.io/tls`                   | 用于 TLS 客户端或者服务器端的数据        |
| `bootstrap.kubernetes.io/token`       | 启动引导令牌数据                         |

### 使用

准备数据

```sh
# 使用BASE64对数据编码
echo -n 'admin' | base64
YWRtaW4=

# 使用BASE64对数据编码
echo -n '123456' | base64
MTIzNDU2
```

创建 `secret.yaml` 文件，并创建 `Secret` 对象

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret
  namespace: default
type: Opaque
data:
  username: YWRtaW4=
  password: MTIzNDU2
```

创建 `Secret` 对象

```sh
# 创建secret
kubectl create -f secret.yaml

# 查看secret详情
kubectl describe secret secret
# resp
Name:         secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
password:  6 bytes
username:  5 bytes
```

创建 `pod-secret.yaml` 文件，将上面创建的 `secret` 挂载进去

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-secret
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.22
      volumeMounts: # 将secret挂载到目录
        - name: config
          mountPath: /secret/config
  volumes:
    - name: config
      secret:
        secretName: secret
```

测试运行

```sh
# 创建pod
kubectl create -f pod-secret.yaml

# 查看pod
kubectl get pod pod-secret

# 进入容器，查看secret信息，发现已经自动解码了
kubectl exec -it pod-secret -- bash
# /# ls secret/config/
password  username
# /# more secret/config/password 
123456
# /# more secret/config/username 
admin
```

至此，已经实现了利用 `secret` 实现了信息的编码。
