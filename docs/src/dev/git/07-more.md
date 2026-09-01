# 更多操作

## 问题排查

### git blame

> 查看文件每行代码块的历史信息

- 截取 `demo.html` 文件1-10行历史信息

```sh
git blame -L 1,10 demo.html
```

### git bisect

> 二分查找历史记录，排查BUG

- 开始二分查找

```sh
git bisect start
```

- 标记当前二分提交ID为有问题的点

```sh
git bisect bad
```

- 标记当前二分提交ID为没问题的点

```sh
git bisect good
```

- 查到有问题的提交ID后回到原分支

```sh
git bisect reset
```

## 更多操作

### git submodule

> 通过 Git 子模块可以跟踪外部版本库，它允许在某一版本库中再存储另一版本库，并且能够保持2个版本库完全独立

- 将 `demo` 仓库添加为子模块

```sh
git submodule add https://github.com/test/demo.git demo
```

- 更新子模块 `demo`

```sh
git submodule update demo
```

### git gc

> 运行Git的垃圾回收功能，清理冗余的历史快照

### git archive

> 将加了tag的某个版本打包提取

- `--format` 表示打包的格式，如 `zip`，`-v` 表示对应的tag名，后面跟的是tag名，如 `v0.1`。

```sh
git archive -v --format=zip v0.1 > v0.1.zip
```
