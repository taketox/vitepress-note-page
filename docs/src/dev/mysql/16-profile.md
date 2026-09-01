# 性能分析

## 性能分析

### SQL执行频率

MySQL 客户端连接成功后，通过 `show [session|global] status` 命令可以提供服务器状态信息。

通过如下指令，可以查看当前数据库的INSERT、UPDATE、DELETE、SELECT的访问频次

- -- session 是查看当前会话 ;
- -- global 是查询全局数据 ;

```sql
SHOW GLOBAL STATUS LIKE 'Com_______';
```

![An image](/img/dev/mysql/63.png)

- Com_delete: 删除次数
- Com_insert: 插入次数
- Com_select: 查询次数
- Com_update: 更新次数

通过上述指令，我们可以查看到当前数据库到底是以查询为主，还是以增删改为主，从而为数据库优化提供参考依据。

如果是以增删改为主，我们可以考虑不对其进行索引的优化。 如果是以查询为主，那么就要考虑对数据库的索引进行优化了。

### 慢查询日志

慢查询日志记录了所有执行时间超过指定参数（long_query_time，单位：秒，默认10秒）的所有SQL语句的日志。

MySQL的慢查询日志默认没有开启，我们可以查看一下系统变量 **slow_query_log**。

```sql
SHOW VARIABLES LIKE 'slow_query_log';

# Variable_name     Value
# slow_query_log    OFF
```

如果要开启慢查询日志，需要在MySQL的配置文件 `/etc/my.cnf` 中配置如下信息

```sh
# 开启MySQL慢日志查询开关
slow_query_log=1

# 设置慢日志的时间为2秒，SQL语句执行时间超过2秒，就会视为慢查询，记录慢查询日志
long_query_time=2

# 配置完毕之后，通过以下指令重新启动MySQL服务器进行测试，查看慢日志文件中记录的信息
cat /var/lib/mysql/localhost-slow.log
```

### profile详情

show profiles 能够在做SQL优化时帮助我们了解时间都耗费到哪里去了。

通过**have_profiling**参数，能够看到当前MySQL是否支持profile操作：

```sql
SELECT @@have_profiling ;

# @@have_profiling
# YES
```

> 可以看到，当前MySQL是支持 profile操作的，但是开关是关闭的。

可以通过set语句在 `session/global` 级别开启 `profiling`

```sql
SET profiling = 1;
```

开关已经打开了，接下来，我们所执行的SQL语句，都会被MySQL记录，并记录执行时间消耗到哪儿去了

我们直接执行如下的SQL语句

```sql
select * from tb_user;
select * from tb_user where id = 1;
select * from tb_user where name = '白起';
select count(*) from tb_sku;
```

执行一系列的业务SQL的操作，然后通过如下指令查看指令的执行耗时：

```sql
-- 查看每一条SQL的耗时基本情况
show profiles;
-- 查看指定query_id的SQL语句各个阶段的耗时情况
show profile for query query_id;
-- 查看指定query_id的SQL语句CPU的使用情况
show profile cpu for query query_id;
```

### explain

EXPLAIN 或者 DESC命令获取 MySQL 如何执行 SELECT 语句的信息，包括在 SELECT 语句执行过程中表如何连接和连接的顺序。

语法

```sql
# 直接在select语句之前加上关键字 explain / desc
EXPLAIN SELECT 字段列表 FROM 表名 WHERE 条件 ;
```

![An image](/img/dev/mysql/64.png)

Explain 执行计划中各个字段的含义

| **字段**         | **含义**                                                     |
| ---------------- | ------------------------------------------------------------ |
| **id**           | select查询的序列号，表示查询中执行select子句或者是操作表的顺序(id相同，执行顺序从上到下；id不同，值越大，越先执行)。 |
| **select_type**  | 表示 SELECT 的类型，常见的取值有**SIMPLE**（简单表，即不使用表连接或者子查询）、**PRIMARY**（主查询，即外层的查询）、**UNION**（UNION 中的第二个或者后面的查询语句）、**SUBQUERY**（SELECT/WHERE之后包含了子查询）等 |
| **type**         | 表示连接类型，性能由好到差的连接类型为**NULL、system、const、eq_ref、ref、range、 index、all** |
| **possible_key** | 显示可能应用在这张表上的索引，一个或多个。                   |
| **key**          | 实际使用的索引，如果为NULL，则没有使用索引。                 |
| **key_len**      | 表示索引中使用的字节数， 该值为索引字段最大可能长度，并非实际使用长度，在不损失精确性的前提下， 长度越短越好 。 |
| **rows**         | MySQL认为必须要执行查询的行数，在innodb引擎的表中，是一个估计值，可能并不总是准确的。 |
| **filtered**     | 表示返回结果的行数占需读取行数的百分比， filtered 的值越大越好。 |
