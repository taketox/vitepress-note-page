# Dashboard

## 概述

Dashboard 是基于网页的 Kubernetes 用户界面。 你可以使用 Dashboard 将容器应用部署到 Kubernetes 集群中，也可以对容器应用排错，还能管理集群资源。 你可以使用 Dashboard 获取运行在集群中的应用的概览信息，也可以创建或者修改 Kubernetes 资源 （如 Deployment，Job，DaemonSet 等等）。

## 部署

下载

```sh
wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# 修改recommended.yaml
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  type: NodePort  # 新增
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30000  # 新增
  selector:
    k8s-app: kubernetes-dashboard
```

部署

```sh
# 安装
kubectl create -f ./recommended.yaml

# 查看namespace下的kubernetes-dashboard下的资源
kubectl get pod,svc -n kubernetes-dashboard
# resp
NAME                                             READY   STATUS    RESTARTS   AGE
pod/dashboard-metrics-scraper-5657497c4c-jcj47   1/1     Running   0          25s
pod/kubernetes-dashboard-78f87ddfc-c6gws         1/1     Running   0          25s

NAME                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
service/dashboard-metrics-scraper   ClusterIP   10.109.244.93    <none>        8000/TCP        25s
service/kubernetes-dashboard        NodePort    10.109.192.124   <none>        443:30000/TCP   26s
```

创建访问账户

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard

---
apiVersion: v1
kind: Secret
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: "admin-user"
type: kubernetes.io/service-account-token
```

获取`Token`

```sh
kubectl -n kubernetes-dashboard create token admin-user

# resp
eyJhbGciOiJSUzI1NiIsImtpZCI6Ikw4WDZBQ2FHY2JTaDlPM1pJeXQ2eFB2WlpiMXZlQ2Vxakh2UDhON0hkOWcifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjoxNzAyOTk2ODU3LCJpYXQiOjE3MDI5OTMyNTcsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiMjYzNmNiNGEtYjZhNS00MTY3LWIxNDQtOGU0OWY3NDE4NzYyIn19LCJuYmYiOjE3MDI5OTMyNTcsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn0.IcLkCycm80fVNIm_vFVpVCZXM1OAKtDCe99sJd016eCQWJWVvW-lK78jyaLHa7HLCX1XVB2mSEqgjDeEEvAvJHpsmGccI9RGK1j2hIBYDOGcynoSxUJ-zWt5SCbytnsM8O_I_yxvC6H4_eSUkdXtXaNf_hbutxkIRnI8ku9d91aSaQtQpvHh_nyJQMN9DhuqoVRhJVyDSRzOIGkVnastvgoy1Muc25xYXbrI7sCMUO1xynQsXVp3abj_WPo8oSZTsaJINXiqC1ZD3PfzjMY4XKivNGi3bwVChHK-A0P3OPgJNPzgHUypF_niNAVW6kJvT8U4BTW9hBla9zTe_oAOVQ

# 获取Secret中的Token
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
```

访问页面，输入

![An image](/img/linux/management/43.png)

删除账户

```sh
# 删除管理员ServiceAccount和ClusterRoleBinding。
kubectl -n kubernetes-dashboard delete serviceaccount admin-user
kubectl -n kubernetes-dashboard delete clusterrolebinding admin-user
```

## 使用

![An image](/img/linux/management/44.png)
