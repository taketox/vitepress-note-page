# 操作历史

## 操作历史

### git log

> 显示提交历史记录

- 显示带提交差异对比的历史记录

```sh
git log -p
```

- 显示 `demo.html` 文件的历史记录

```sh
git log demo.html
```

- 显示2周前开始到现在的历史记录，其它时间可以类推

```sh
git log --since="2 weeks ago"
```

- 显示截止到2周前的历史记录，其它时间可以类推

```sh
git log --before="2 weeks ago"
```

- 显示最近10条历史记录

```sh
git log -10
```

- 显示从提交ID `f5f630a` 到 `HEAD` 之间的记录，`HEAD` 可以为空或其它提交ID

```sh
git log f5f630a..HEAD
```

- 在一行中输出简短的历史记录

```sh
git log --pretty=oneline
```

- 格式化输出历史记录

```sh
git log --pretty=format:"%h"
```

> `Git` 用各种 `placeholder` 来决定各种显示内容，我挑几个常用的显示如下：
>
> - %H: commit hash
> - %h: 缩短的commit hash
> - %T: tree hash
> - %t: 缩短的 tree hash
> - %P: parent hashes
> - %p: 缩短的 parent hashes
> - %an: 作者名字
> - %aN: mailmap的作者名
> - %ae: 作者邮箱
> - %ad: 日期 (--date= 制定的格式)
> - %ar: 日期, 相对格式(1 day ago)
> - %cn: 提交者名字
> - %ce: 提交者 email
> - %cd: 提交日期 (--date= 制定的格式)
> - %cr: 提交日期, 相对格式(1 day ago)
> - %d: ref名称
> - %s: commit信息标题
> - %b: commit信息内容
> - %n: 换行

### git cherry-pick

> 合并分支的一条或几条提交记录到当前分支末梢

- 合并提交ID `170a305` 到当前分支末梢

```sh
git cherry-pick 170a305
```

### git reset

> 将当前的分支重设（reset）到指定的 `<commit>` 或者 `HEAD`

- `--mixed` 是不带参数时的默认参数，它退回到某个版本，保留文件内容，回退提交历史

```sh
git reset --mixed <commit>
```

- 暂存区和工作区中的内容不作任何改变，仅仅把 `HEAD` 指向 `<commit>`

```sh
git reset --soft <commit>
```

- 自从 `<commit>` 以来在工作区中的任何改变都被丢弃，并把 `HEAD` 指向 `<commit>`

```sh
git reset --hard <commit>
```

### git rebase

> 重新定义分支的版本库状态

- 合并分支，这跟 `merge` 很像，但还是有本质区别，看下图：

```sh
git rebase branch_name
```

![An image](/img/dev/git/03.jpg)

合并过程中可能需要先解决冲突，然后执行 `git rebase --continue`

```sh
git rebase -i HEAD~~
```

打开文本编辑器，将看到从 `HEAD` 到 `HEAD~~` 的提交如下

```sh
pick 9a54fd4 添加commit的说明
pick 0d4a808 添加pull的说明
# Rebase 326fc9f..0d4a808 onto d286baa
#
# Commands:
#  p, pick = use commit
#  r, reword = use commit, but edit the commit message
#  e, edit = use commit, but stop for amending
#  s, squash = use commit, but meld into previous commit
#  f, fixup = like "squash", but discard this commit's log message
#  x, exec = run command (the rest of the line) using shell
#
```

将第一行的 `pick` 改成 `Commands` 中所列出来的命令，然后保存并退出，所对应的修改将会生效。如果移动提交记录的顺序，将改变历史记录中的排序。

### git revert

> 撤销某次操作，此次操作之前和之后的 `commit` 和 `history` 都会保留，并且把这次撤销作为一次最新的提交

- 撤销前一次提交操作

```sh
git revert HEAD
```

- 撤销前一次提交操作，并以默认的 `Revert "xxx"` 为提交原因

```sh
git revert HEAD --no-edit
```

- 需要撤销多次操作的时候加 `-n` 参数，这样不会每次撤销操作都提交，而是等所有撤销都完成后一起提交

```sh
git revert -n HEAD
```

### git diff

> 查看工作区、暂存区、本地版本库之间的文件差异，用一张图来解释

![An image](/img/dev/git/04.png)

- 通过 `--stat` 参数可以查看变更统计数据

```sh
git diff --stat

 test.md | 1 -
 1 file changed, 1 deletion(-)
```

### git reflog

> `reflog` 可以查看所有分支的所有操作记录（包括commit和reset的操作、已经被删除的commit记录，跟 `git log` 的区别在于它不能查看已经删除了的commit记录

```sh
$ git reflog

bcc94c7 (HEAD -> dev, origin/dev) HEAD@{0}: pull: Fast-forward
ecf42f8 HEAD@{1}: commit: update
cdecad3 HEAD@{2}: commit: update
3a7e1dd HEAD@{3}: pull: Fast-forward
4c127f4 HEAD@{4}: commit: update
33dea49 HEAD@{5}: commit: update
7edea7b HEAD@{6}: checkout: moving from master to dev
9356b4b (master) HEAD@{7}: checkout: moving from dev to master
7edea7b HEAD@{8}: checkout: moving from master to dev
9356b4b (master) HEAD@{9}: commit (merge): Merge branch 'dev'
abd63b4 HEAD@{10}: checkout: moving from dev to master
```
