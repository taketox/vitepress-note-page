# 操作文件

## 操作文件

### git add

> 添加文件到暂存区

- 通过此命令将打开交互式子命令系统，你将看到如下子命令

```sh
git add -i

***Commands***
  1: status      2: update      3: revert      4: add untracked
  5: patch      6: diff      7: quit      8: help
```

> 通过输入序列号或首字母可以选择相应的功能，具体的功能解释如下：
>
> - `status`：功能上和 `git add -i` 相似，没什么鸟用
> - `update`：详见下方 `git add -u`
> - `revert`：把已经添加到暂存区的文件从暂存区剔除，其操作方式和 `update`类似
> - `add untracked`：可以把新增的文件添加到暂存区，其操作方式和 `update` 类似
> - `patch`：详见下方 `git add -p`
> - `diff`：比较暂存区文件和本地版本库的差异，其操作方式和 `update` 类似
> - `quit`：退出 `git add -i` 命令系统
> - `help`：查看帮助信息

- 直接进入交互命令中最有用的 `patch` 模式

```sh
git add -p
```

> 这是交互命令中最有用的模式，其操作方式和 `update` 类似，选择后 `Git` 会显示这些文件的当前内容与本地版本库中的差异，然后您可以自己决定是否添加这些修改到暂存区，在命令行 `Stage deletion [y,n,q,a,d,/,?]?` 后输入 `y,n,q,a,d,/,?` 其中一项选择操作方式，具体功能解释如下：
>
> - y：接受修改
> - n：忽略修改
> - q：退出当前命令
> - a：添加修改
> - d：放弃修改
> - /：通过正则表达式匹配修改内容
> - ?：查看帮助信息

- 直接进入交互命令中的 `update` 模式

```sh
git add -u
```

> 它会先列出工作区 `修改` 或 `删除` 的文件列表，`新增` 的文件不会被显示，在命令行 `Update>>` 后输入相应的列表序列号表示选中该项，回车继续选择，如果已选好，直接回车回到命令主界面

- 添加工作区 `修改` 或 `新增` 的文件列表， `删除` 的文件不会被添加

```sh
git add --ignore-removal .
```

### git commit

> 把暂存区的文件提交到本地版本库

- 不打开编辑器，直接在命令行中输入多行提交原因

```sh
git commit -m '第一行提交原因'  -m '第二行提交原因'
```

- 将工作区 `修改` 或 `删除` 的文件提交到本地版本库， `新增` 的文件不会被提交

```sh
git commit -am '提交原因'
```

- 修改最新一条提交记录的提交原因

```sh
git commit --amend -m '提交原因'
```

- 将当前文件改动提交到 `HEAD` 或当前分支的历史ID

```sh
git commit -C HEAD
```

### git mv

> 移动或重命名文件、目录

- 将 `a.md` 重命名为 `b.md` ，同时添加变动到暂存区，加 `-f` 参数可以强制重命名，相比用 `mv a.md b.md` 命令省去了 `git add` 操作

```sh
git mv a.md b.md -f
```

### git rm

> 从工作区和暂存区移除文件

- 从工作区和暂存区移除文件 `b.md` ，同时添加变动到暂存区，相比用 `rm b.md` 命令省去了 `git add` 操作

```sh
git rm b.md
```

- 允许从工作区和暂存区移除目录

```sh
git rm src/ -r
```

### git status

- 以简短方式查看工作区和暂存区文件状态，示例如下：

```sh
git status -s
```

- 查看工作区和暂存区文件状态，包括被忽略的文件

```sh
 M demo.html
?? test.html
git status --ignored
```
