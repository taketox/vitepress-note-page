# 常用操作

## 常用操作

**git clone：从git服务器拉取代码**

```sh
git clone https://github.com/hyperledger/fabric.git
```

> 代码下载完成后在当前文件夹中会有一个 `fabric` 的目录

**git config：配置开发者用户名和邮箱**

```sh
git config user.name taketo
git config user.email taketo1015@foxmail.com
```

> 每次代码提交的时候都会生成一条提交记录，其中会包含当前配置的用户名和邮箱。

**git branch：创建、重命名、查看、删除项目分支。**

```sh
# 创建dev分支
git branch dev

# 分支重命名，将dev分支名称改为test
git branch -m dev test

# 查看分支列表
git branch

# 删除分支
git branch -d test
```

> 通过 `Git` 做项目开发时，一般都是在开发分支中进行，开发完成后合并分支到主干。

**git checkout：切换分支**

```sh
# 切换到test分支
git checkout test
```

**git status：查看文件变动状态**

```sh
# 查看文件变动状态
git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   test.sh

no changes added to commit (use "git add" and/or "git commit -a")
```

> 通过 `git status` 命令可以看到文件当前状态 `Changes not staged for commit:`（*改动文件未提交到暂存区*）

**git add：添加文件变动到暂存区**

```sh
# 添加文件到暂存区
git add test.sh

# 状态
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   test.sh
```

> 通过指定文件名 `test.sh` 可以将该文件添加到暂存区，如果想添加所有文件可用 `git add .` 命令，这时候可通过 `git status` 看到文件当前状态 `Changes to be committed:` （*文件已提交到暂存区*）

**git commit：提交文件变动到版本库**

```sh
git commit -m '这里写提交原因'
```

> 通过 `-m` 参数可直接在命令行里输入提交描述文本

**git push：将本地的代码改动推送到服务器**

```sh
git push origin dev
```

`origin` 指代的是当前的git服务器地址，这行命令的意思是把 `dev` 分支推送到服务器，当看到命令行返回如下字符表示推送成功了。

**git pull：将服务器上的最新代码拉取到本地**

```sh
git pull origin dev
```

> 如果线上代码做了变动，而你本地的代码也有变动，拉取的代码就有可能会跟你本地的改动冲突，一般情况下 `Git` 会自动处理这种冲突合并，但如果改动的是同一行，那就需要手动来合并代码，编辑文件，保存最新的改动，再通过 `git add .`和 `git commit -m 'xxx'` 来提交合并。

**git log：查看版本提交记录**

```sh
# git log
Author: Zhang <taketo1015@foxmail.com>
Date:   Wed Aug 9 17:52:28 2023 +0800
# 原因
    update

commit 1da0cca0fc9c97abec5dd4f31814987d5692094a
Author: Zhang <taketo1015@foxmail.com>
Date:   Wed Aug 9 17:44:25 2023 +0800
# 原因
    test

```

> 通过以上命令，我们可以查看整个项目的版本提交记录，它里面包含了`提交人`、`日期`、`提交原因`等信息
>
> 提交记录可能会非常多，按 `J` 键往下翻，按 `K` 键往上翻，按 `Q` 键退出查看

**git tag：为项目标记里程碑**

```sh
# 发行版本
git tag v1.0.0

# 推送到远程git服务器
git push origin v1.0.0
```

> 当我们完成某个功能需求准备发布上线时，应该将此次完整的项目代码做个标记，并将这个标记好的版本发布到线上，这里我们以 `v1.0.0` 为标记名并发布

**.gitignore：设置哪些内容不需要推送到服务器，这是一个配置文件**

```sh
# 新建.gitignore文件
touch .gitignore

# 添加以下内容
build/
dist/
```

> 以上内容的意思是 `Git` 将忽略 `dist/` 文件 和 `build/` 目录，这些内容不会被推送到服务器上
