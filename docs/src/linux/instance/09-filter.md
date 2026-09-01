# 文本过滤

## 过滤注释行

Linux中的配置文件通常以 `#` 作为注释，例如 `GitLab` 中的配置文件 `gitlab.rb` ，默认值都是以 `#` 号注释。

如果我们只想查看自己配置的参数就会十分费劲

过滤 `#` 号

```sh
cat config/gitlab.rb |grep -v "#"

 puma['worker_timeout'] = 60
 puma['worker_processes'] = 2





 puma['per_worker_max_memory_mb'] = 1024
```

>-v 用来取反，grep -v "#" 就是不是 `#` 开头的行
>
>结果中会出现很多空行

同时过滤 `#` 号和 空行

```sh
grep -v -e "^$" config/gitlab.rb | grep -v "#"
 puma['worker_timeout'] = 60
 puma['worker_processes'] = 2
 puma['per_worker_max_memory_mb'] = 1024
```
