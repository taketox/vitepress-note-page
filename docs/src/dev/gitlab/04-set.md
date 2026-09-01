# 系统优化

## 基础配置

### 设置中文

点击头像选择`偏好设置`，在`本地化语言`中选择`中文`

![An image](/img/dev/gitlab/02.png)

### 关闭注册

在`设置`中选择`通用`，关闭`注册限制`中的`已启用注册功能`

![An image](/img/dev/gitlab/03.png)

### 关闭头像显示

在`设置`中选择`通用`，关闭`账户与限制`中的`启用 Gravatar`

![An image](/img/dev/gitlab/04.png)

## 减少内存占用

官方文档

[Configure the bundled Puma instance of the GitLab package | GitLab](https://docs.gitlab.com/ee/administration/operations/puma.html)

GitLab为内存限制设置默认值。若要覆盖默认值，请设置以兆字节为单位的新RSS限制

1. 编辑：`/etc/gitlab/gitlab.rb`

   ```sh
   puma['per_worker_max_memory_mb'] = 1024 # 1GB
   puma['worker_timeout'] = 60
   puma['worker_processes'] = 2
   ```

2. 重新配置 GitLab：

   ```sh
   sudo gitlab-ctl reconfigure
   ```

最终效果

![An image](/img/dev/gitlab/05.png)
