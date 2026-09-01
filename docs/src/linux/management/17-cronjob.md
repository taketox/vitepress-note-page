# CronJob

## 概述

CronJob控制器以 Job控制器资源为其管控对象，并借助它管理pod资源对象。

Job控制器定义的作业任务在其控制器资源创建之后便会立即执行，但CronJob可以以类似于Linux操作系统的周期性任务作业计划的方式控制其运行时间点及重复运行的方式。也就是说，CronJob可以在特定的时间点(反复的)去运行job任务。

![An image](/img/linux/management/18.png)

## 资源清单

`CronJob`的资源清单

```yaml
apiVersion: batch/v1 # 版本号
kind: CronJob # 类型
metadata: # 元数据
  name: # rs名称
  namespace: # 所属命名空间
  labels: #标签
    controller: cronjob
spec: # 详情描述
  schedule: # cron格式的作业调度运行时间点,用于控制任务在什么时间执行
  concurrencyPolicy: # 并发执行策略，用于定义前一次作业运行尚未完成时是否以及如何运行后一次的作业
  failedJobHistoryLimit: # 为失败的任务执行保留的历史记录数，默认为1
  successfulJobHistoryLimit: # 为成功的任务执行保留的历史记录数，默认为3
  startingDeadlineSeconds: # 启动作业错误的超时时长
  jobTemplate: # job控制器模板，用于为cronjob控制器生成job对象;下面其实就是job的定义
    metadata:
    spec:
      completions: 1
      parallelism: 1
      activeDeadlineSeconds: 30
      backoffLimit: 6
      manualSelector: true
      selector:
        matchLabels:
          app: counter-pod
        matchExpressions: #规则
          - { key: app, operator: In, values: [counter-pod] }
      template:
        metadata:
          labels:
            app: counter-pod
        spec:
          restartPolicy: Never
          containers:
            - name: counter
              image: busybox:1.30
              command:
                [
                  "bin/sh",
                  "-c",
                  "for i in 9 8 7 6 5 4 3 2 1; do echo $i;sleep 20;done",
                ]
```

配置解释：

- `schedule`：`cron` 表达式，用于指定任务的执行时间
- `concurrencyPolicy`
  - `Allow`：允许Jobs并发运行(默认)
  - `Forbid`：禁止并发运行，如果上一次运行尚未完成，则跳过下一次运行
  - `Replace`：替换，取消当前正在运行的作业并用新作业替换它

## 测试运行

创建 `pc-cronjob.yaml` 文件

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: pc-cronjob
  namespace: default
  labels:
    controller: cronjob
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    metadata:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: counter
              image: busybox:1.30
              command:
                [
                  "bin/sh",
                  "-c",
                  "for i in 9 8 7 6 5 4 3 2 1; do echo $i;sleep 3;done",
                ]
```

测试运行

```sh
# 创建cronjob
kubectl create -f pc-cronjob.yaml


# 查看cronjob
kubectl get cronjobs
# resp
NAME         SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
pc-cronjob   */1 * * * *   False     0        <none>          6s

# 查看job
kubectl get jobs
# resp
NAME                    COMPLETIONS   DURATION   AGE
pc-cronjob-1592587800   1/1           28s        3m26s
pc-cronjob-1592587860   1/1           28s        2m26s
pc-cronjob-1592587920   1/1           28s        86s

# 查看pod
kubectl get pods
# resp
pc-cronjob-1592587800-x4tsm   0/1     Completed   0          2m24s
pc-cronjob-1592587860-r5gv4   0/1     Completed   0          84s
pc-cronjob-1592587920-9dxxq   1/1     Running     0          24s

# 删除cronjob
[root@k8s-master01 ~]# kubectl  delete -f pc-cronjob.yaml
```
