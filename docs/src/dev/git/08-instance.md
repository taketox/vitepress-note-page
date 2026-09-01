# 应用示例

## 保存凭证

在 `Git` 中，默认情况下，每次推送代码时都需要输入用户名和密码。为了方便，可以保存凭证，避免每次都输入。

```sh
# 设置保存凭证
git config --global credential.helper store

# 输入用户名和密码
Username for 'https://github.com': xxx
Password for 'https://xxx@github.com': xxx

# 清除凭证
git config --system --unset credential.helper
```

## 更换远程仓库

更换`Git`远程仓库：比如，将`Github`的仓库迁移到`Gitee`上。

```sh
# 先从Github将项目拉下来
git clone https://github.com/xxx/xxx.git

# 进入项目查看远程仓库地址
cd xxx && git remote -v

# fetch代表拉取代码的地址，push代表推送代码的地址
origin  https://github.com/xxx/xxx.git (fetch)
origin  https://github.com/xxx/xxx.git (push)

# 删除Github远程仓库地址
git remote remove <远程仓库名称>

# 添加Gitee远程仓库地址
git remote add <远程仓库名称> <远程仓库URL>

# 确认已经设置了正确的远程仓库
git remote -v

# 推送代码，--all代表所有分支
git push <远程仓库名称> --all
```

## 修改文件权限

在 `GIT` 仓库中经常会放一些可执行脚本，但是拉取后却发现没有可执行权限，还需要手动添加权限。

```sh
# 查看文件权限信息
git ls-files --stage
# 644代表权限(r=4, w=2, x=1)
100644 6a5da4d737b0e90f6dc96ebca7d889aa0423e061 0       scripts/start.sh
100644 858aba42d858832651433ef2d1767b525add909c 0       scripts/stop.sh

# 增加可执行权限
git update-index --chmod +x scripts/start.sh
# 修改为755
100755 6a5da4d737b0e90f6dc96ebca7d889aa0423e061 0       scripts/start.sh
```

## 清除GIT缓存

如果某个文件已经被纳入版本控制并且已经提交到 `Git` 仓库中，即使将其添加到 `.gitignore` 文件中，`Git` 仍然会跟踪该文件。

```sh
# 清除缓存
git rm -r --cached .

# 添加暂存
git add .
```

## 同时维护两个仓库

在实际开发中，可能会遇到需要同时将代码推送到两个 `Git` 仓库的场景，例如将代码推送到 `GitHub` 和公司内部的私有仓库。

```sh
# 添加第二个远程仓库
# 假设你已经有一个主远程仓库（默认名称是 origin）
# 你可以通过以下命令添加一个新的远程仓库，例如命名为 backup：
git remote add backup <第二个仓库的URL>
# 可以通过以下命令查看远程仓库列表：
git remote -v
# 输出：
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
backup  https://gitlab.com/user/repo.git (fetch)
backup  https://gitlab.com/user/repo.git (push)

# 远程仓库拉取代码到本地
# 有冲突则需要手动合并
git pull origin main
git pull origin main

# 推送代码到两个远程仓库
# 你可以分别推送代码到两个仓库：
git push origin main
git push backup main
# 如果两个远程仓库的分支一致，可以用以下方法一次性推送到所有远程仓库：
git push --all origin
git push --all backup

# 配置多个远程仓库的默认推送
# 如果希望推送时自动更新两个仓库，可以使用 Git 配置文件 实现。
# 编辑 .git/config 文件，在 [remote "origin"] 部分添加 url：
[remote "origin"]
    url = https://github.com/user/repo.git
    url = https://gitlab.com/user/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
# 完成后，运行以下命令即可同时推送到多个仓库：
git push origin main
```
