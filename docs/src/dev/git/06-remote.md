# 远程版本库操作

## 远程版本库连接

如果在GitHub项目初始化之前，文件已经存在于本地目录中，那可以在本地初始化本地版本库，再将本地版本库跟远程版本库连接起来

### git init

> 在本地目录内部会生成.git文件夹

### git remote

- 不带参数，列出已经存在的远程分支，加上 `-v` 列出详细信息，在每一个名字后面列出其远程`url`

```sh
git remote -v
```

- 添加一个新的远程仓库，指定一个名字，以便引用后面带的URL

```sh
git remote add origin https://github.com/gafish/gafish.github.com.git
```

### git fetch

> 将远程版本库的更新取回到本地版本库

- 默认情况下，`git fetch` 取回所有分支的更新。如果只想取回特定分支的更新，可以指定分支名。

```sh
git fetch origin dev
```
