# 操作分支

## 操作分支

### git branch

> 查看、创建、删除分支

- 查看本地版本库和远程版本库上的分支列表

```sh
git branch -a
```

- 查看远程版本库上的分支列表，加上 `-d` 参数可以删除远程版本库上的分支

```sh
git branch -r
```

- 分支未提交到本地版本库前强制删除分支

```sh
git branch -D
```

- 查看带有最后提交id、最近提交原因等信息的本地版本库分支列表

```sh
git branch -vv

* dev    bcc94c7 [origin/dev] update
  master 9356b4b [origin/master: gone] Merge branch 'dev'
```

### git merge

> 将其它分支合并到当前分支

- 将待合并分支上的 `commit` 合并成一个新的 `commit` 放入当前分支，适用于待合并分支的提交记录不需要保留的情况

```sh
git merge --squash
```

- 默认情况下，`Git` 执行"`快进式合并`"（fast-farward merge），会直接将 `Master`分支指向 `Develop` 分支，使用 `--no-ff` 参数后，会执行正常合并，在 `Master`分支上生成一个新节点，保证版本演进更清晰。

```sh
git merge --no-ff
```

![An image](/img/dev/git/02.png)

- 在没有冲突的情况下合并，不想手动编辑提交原因，而是用 `Git` 自动生成的类似 `Merge branch 'test'` 的文字直接提交

```sh
git merge --no-edit
```

### git checkout

> 切换分支

- 创建 `dev` 分支，同时切换到这个新创建的分支

```sh
git checkout -b dev
```

- 从本地版本库的 `HEAD`（也可以是提交ID、分支名、Tag名） 历史中检出 `demo.html` 覆盖当前工作区的文件，如果省略 `HEAD` 则是从暂存区检出

```sh
git checkout HEAD demo.html
```

- 这个命令会创建一个全新的，完全没有历史记录的新分支，但当前源分支上所有的最新文件都还在，真是强迫症患者的福音，但这个新分支必须做一次 `git commit`操作后才会真正成为一个新分支。

```sh
git checkout --orphan new_branch
```

- 这个命令主要用来比较两个分支间的差异内容，并提供交互式的界面来选择进一步的操作，这个命令不仅可以比较两个分支间的差异，还可以比较单个文件的差异。

```sh
git checkout -p other_branch
```

### git stash

> 在 `Git` 的栈中保存当前修改或删除的工作进度，当你在一个分支里做某项功能开发时，接到通知把昨天已经测试完没问题的代码发布到线上，但这时你已经在这个分支里加入了其它未提交的代码，这个时候就可以把这些未提交的代码存到栈里。

- 将未提交的文件保存到Git栈中

```sh
git stash
```

- 查看栈中保存的列表

```sh
git stash list
```

- 显示栈中其中一条记录

```sh
git stash show stash@{0}
```

- 移除栈中其中一条记录

```sh
git stash drop stash@{0}
```

- 从Git栈中检出最新保存的一条记录，并将它从栈中移除

```sh
git stash pop
```

- 从Git栈中检出其中一条记录，但不从栈中移除

```sh
git stash apply stash@{0}
```

- 把当前栈中最近一次记录检出并创建一个新分支

```sh
git stash branch new_banch
```

- 清空栈里的所有记录

```sh
git stash clear
```

- 为当前修改或删除的文件创建一个自定义的栈并返回一个ID，此时并未真正存储到栈里

```sh
git stash create
```

- 将 `create` 方法里返回的ID放到 `store` 后面，此时在栈里真正创建了一个记录，但当前修改或删除的文件并未从工作区移除

```sh
git stash store xxxxxx

$ git stash create
09eb9a97ad632d0825be1ece361936d1d0bdb5c7
$ git stash store 09eb9a97ad632d0825be1ece361936d1d0bdb5c7
$ git stash list
stash@{0}: Created via "git stash store".
```
