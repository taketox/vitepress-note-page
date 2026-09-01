# 资源编排

## 概述

Kubernetes集群中对资源管理和资源对象编排部署都可以通过声明样式（YAML）文件来解决，也就是可以把需要对资源对象操作编辑到YAML 格式文件中，我们把这种文件叫做资源清单文件，通过 `kubectl` 命令直接使用资源清单文件就可以实现对大量的资源对象进行编排部署了。

YAML文件：就是资源清单文件，用于资源编排。

## 编排文件组成

主要分为了两部分：控制器的定义 和 被控制的对象

### 完整文件

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21.5
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
```

### 控制器的定义

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
```

- **apiVersion**：Kubernetes API 的版本，用于指定使用哪个 API 版本。在这里，我们使用 `apps/v1`，表示使用 Apps API 的版本 1。
- **kind**：资源对象的种类。在这里，我们使用 `Deployment`，表示创建一个部署对象。
- **metadata**：元数据，包括资源的名称和标签。在这里，Deployment 的名称是 `nginx-deployment`，并有一个标签 `app: nginx`。
- **spec**：描述资源的规范。在这里，我们指定了 Deployment 的规模、Pod 的模板等。
  - **replicas**：定义了部署的副本数量。在这里，我们定义了 3 个 Pod 的副本。
  - **selector**：用于选择要管理的 Pod 集合。
  - **matchLabels**：这表示 Deployment 管理的 Pod 将具有标签 `app: nginx`。

### 被控制的对象

```yaml
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21.5
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
```

- **template**：定义了要创建的 Pod 的模板。
- **metadata**：定义 Pod 的标签。
- **spec**：定义了 Pod 的规范，包括容器的信息。
  - **containers**：定义了容器的列表。
    - **name**：容器的名称。在这里是 `nginx`。
    - **image**：容器使用的镜像。在这里是 `nginx:1.21.5`。
    - **ports**：定义容器监听的端口。
  - **resources**：定义容器的资源限制和请求，以确保 Kubernetes 可以更好地管理资源。
  - **readinessProbe**：定义用于确定容器是否准备好接收流量的检测机制。
  - **livenessProbe**：定义用于确定容器是否仍然存活的检测机制。

### 属性说明

|  属性名称  |    介绍    |
| :--------: | :--------: |
| apiVersion |  API版本   |
|    kind    |  资源类型  |
|  metadata  | 资源元数据 |
|    spec    |  资源规格  |
|  replicas  |  副本数量  |
|  selector  | 标签选择器 |
|  template  |  Pod模板   |
|  metadata  | Pod元数据  |
|    spec    |  Pod规格   |
| containers |  容器配置  |

## 生成编排文件

### 创建文件

这种方式一般用于资源没有部署的时候，我们可以直接创建一个YAML配置文件

```sh
# 尝试运行,并不会真正的创建镜像
kubectl create deployment web --image=nginx -o yaml --dry-run=client
```

或者我们可以输出到一个文件中

```sh
kubectl create deployment web --image=nginx -o yaml --dry-run=client > hello.yaml
```

然后我们就在文件中直接修改即可

### 导出文件

查看一个目前已经部署的镜像

```sh
kubectl get deploy
```

导出 nginx 的配置

```sh
kubectl get deploy nginx -o yaml > web.yaml
```

排除一些默认的系统字段

```sh
# kubectl get -o custom-columns
kubectl get deploy nginx -o custom-columns=name:.metadata.name,image:.spec.template.spec.containers[0].image --no-headers > web.yaml
```
