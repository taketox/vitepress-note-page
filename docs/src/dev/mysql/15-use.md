# 索引使用

## SQL提示

SQL提示是优化数据库的一个重要手段，简单来说，就是在SQL语句中加入一些人为的提示来达到优化操作的目的。

- use index：建议MySQL使用哪一个索引完成此次查询（仅仅是建议，mysql内部还会再次进行评估）
- ignore index：忽略指定的索引。
- force index：强制使用索引。

## 覆盖索引

覆盖索引是指 查询使用了索引，并且需要返回的列，在该索引中已经全部能够找到 。

尽量使用覆盖索引，减少select

| Extra                        | 含义                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **Using where; Using Index** | 查找使用了索引，但是需要的数据都在索引列中能找到，所以不需要回表查询数据 |
| **Using index condition**    | 查找使用了索引，但是需要回表查询数据                         |

表结构及索引示意图

![An image](/img/dev/mysql/55.png) ![An image](/img/dev/mysql/56.png)

id是主键，是一个聚集索引。

 name字段建立了普通索引，是一个二级索引（辅助索引）。

```sql
select * from tb_user where id = 2;
```

根据id查询，直接走**聚集索引**查询，一次索引扫描，直接返回数据，性能高。

```sql
selet id,name from tb_user where name = 'Arm';
```

![An image](/img/dev/mysql/57.png)

虽然是根据name字段查询，查询二级索引，但是由于查询返回在字段为 id，name，在name的二级索引中，这两个值都是可以直接获取到的，因为**覆盖索引**，所以不需要回表查询，性能高。

```sql
selet id,name,gender from tb_user where name = 'Arm';
```

![An image](/img/dev/mysql/58.png)

由于在name的二级索引中，**不包含gender**，所以，**需要两次索引扫描，也就是需要回表查询，性能相对较差一点**。

思考

一张表, 有四个字段 `id, username, password, status` ，由于数据量大, 需要对以下SQL语句进行优化, 该如何进行才是最优方案:

```sql
select id,username,password from tb_user where username ='itcast';
```

针对于 `username, password` 建立联合索引

```sql
create index idx_user_name_pass on tb_user(username,password);
```

> 这样可以避免上述的SQL语句，在查询的过程中，出现回表查询。

## **前缀索引**

当字段类型为字符串（varchar，text，longtext等）时，有时候需要索引很长的字符串，这会让索引变得很大，查询时，浪费大量的磁盘IO， 影响查询效率。

此时可以只将字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率。

语法

```sql
create index idx_xxxx on table_name(column(n));
```

为`tb_user`表的`email`字段，建立长度为5的前缀索引。

```sql
create index idx_email_5 on tb_user(email(5));
```

![An image](/img/dev/mysql/59.png)

前缀长度可以根据索引的选择性来决定，

而选择性是指：不重复的索引值（基数）和数据表的记录总数的比值，**索引选择性越高则查询效率越高**， 唯一索引的选择性是1，这是最好的索引选择性，性能也是最好的。

```sql
select count(distinct email) / count(*) from tb_user ;

select count(distinct substring(email,1,5)) / count(*) from tb_user ;
```

前缀索引的查询流程

![An image](/img/dev/mysql/60.png)

## 单列索引与联合索引

单列索引：即一个索引只包含单个列。

联合索引：即一个索引包含了多个列。

我们先来看看 `tb_user` 表中目前的索引情况

![An image](/img/dev/mysql/61.png)

> 在查询出来的索引中，既有单列索引，又有联合索引。

接下来，我们来执行一条SQL语句，看看其执行计划

![An image](/img/dev/mysql/62.png)

通过上述执行计划我们可以看出来，在and连接的两个字段 phone、name上都是有单列索引的，但是最终mysql只会选择一个索引，也就是说，只能走一个字段的索引，此时是会回表查询的。

注意

- 多条件联合查询时，MySQL优化器会评估哪个字段的索引效率更高，会选择该索引完成本次查询
- 尽量使用联合索引，避免回表查询
- 强行使用某个索引，表名 **use index (索引名称)**

## 索引的设计原则

- 针对于**数据量较大**，且**查询比较频繁的表**建立索引
- 针对于常作为**查询条件（where）、排序（order by）、分组（group by）操作的字段**建立索引
- 尽量**选择区分度高的列作为索引**，**尽量建立唯一索引**，区分度越高，使用索引的效率越高
- 如果是字符串类型的字段，**字段长度较长**，可以针对于字段的特点，**建立前缀索引**
- **尽量使用联合索引，减少单列索引**，查询时，联合索引很多时候可以覆盖索引，节省存储空间，避免回表，提高查询效率
- **要控制索引的数量**，索引并不是多多益善，**索引越多，维护索引结构的代价就越大**，会影响增删改的效率
- **如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它**。当优化器知道每列是否包含NULL值时，它可以更好地确定哪个索引最有效地用于查询
