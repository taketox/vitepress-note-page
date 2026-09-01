# SQL优化

## 插入数据

### 普通插入

采用批量插入（一次插入的数据不建议超过1000条）

```sql
insert into tb_test values(1,"tom"),(2,"jack"),(3,"hobb");
```

手动提交事务

```sql
start transaction;
insert into tb_test values(1,"tom"),(2,"jack"),(3,"hobb");
insert into tb_test values(1,"tom"),(2,"jack"),(3,"hobb");
insert into tb_test values(1,"tom"),(2,"jack"),(3,"hobb");
commit;
```

主键顺序插入(按照主键的顺序插入)

### 批量插入

如果一次性需要插入大批量数据，使用insert语句插入性能较低，此时可以使用MySQL数据库提供的load指令插入。

```sql
# 客户端连接服务端时，加上参数 --local-infile（这一行在bash/cmd界面输入）
mysql --local-infile -u root -p

# 设置全局参数local_infile为1，开启从本地加载文件导入数据的开关
set global local_infile = 1;
select @@local_infile;

# 执行load指令将准备好的数据，加载到表结构中
load data local infile '/root/sql1.log' into table 'tb_user' fields terminated by ',' lines terminated by '\n';
```

## 主键优化

### 数据组织方式

在InnoDB存储引擎中，**表数据都是根据主键顺序组织存放的**，这种存储方式的表称为索引组织表（Index organized table, IOT）

### 页分裂

页可以为空，也可以填充一半，也可以填充100%，每个页包含了2-N行数据（如果一行数据过大，会行溢出），根据主键排列。

![An image](/img/dev/mysql/65.png)

------

![An image](/img/dev/mysql/66.png)

------

![An image](/img/dev/mysql/67.png)

### 页合并

**当删除一行记录时，实际上记录并没有被物理删除**，只是记录被标记（flaged）为删除并且它的空间变得允许被其他记录声明使用。**当页中删除的记录到达 MERGE_THRESHOLD（默认为页的50%）**，InnoDB会开始寻找最靠近的页（前后）看看是否可以将这两个页合并以优化空间使用。

![An image](/img/dev/mysql/68.png)

------

![An image](/img/dev/mysql/69.png)

------

![An image](/img/dev/mysql/70.png)

> MERGE THRESHOLD:合并页的阈值，可以自己设置，在创建表或者创建索引时指定。

### 主键的设计原则

- 满足业务需求的情况下，**尽量降低主键的长度**
- 插入数据时，**尽量选择顺序插入**，选择使用 AUTO_INCREMENT 自增主键。避免页分裂
- 尽量不要使用 UUID 做主键或者是其他的自然主键，如身份证号
- 业务操作时，**避免对主键的修改**

## OrderBy优化

Using filesort

通过表的索引或全表扫描，读取满足条件的数据行，然后在排序缓冲区 `sort buffer` 中完成排序操作，所有不是通过索引直接返回排序结果的排序都叫 FileSort 排序

Using index

通过有序索引顺序扫描直接返回有序数据，这种情况即为 `using index`，不需要额外排序，操作效率高。

对于以上的两种排序方式，**Using index的性能高，而Using filesort的性能低**，我们在优化排序操作时，尽量要优化为 `Using index`。

创建索引

```sql
-- 创建索引 
create index idx_user_age_phone_aa on tb_user(age,phone); 
```

创建索引后，根据age, phone进行升序排序

```sql
explain select id,age,phone from tb_user order by age; 
```

![An image](/img/dev/mysql/71.png)

```sql
explain select id,age,phone from tb_user order by age , phone;
```

![An image](/img/dev/mysql/72.png)

建立索引之后，再次进行排序查询，就由原来的Using filesort， 变为了 Using index，性能就是比较高的了。

创建索引后，根据age, phone进行降序排序

```sql
explain select id,age,phone from tb_user order by age desc , phone desc ;
```

![An image](/img/dev/mysql/73.png)

也出现 Using index， 但是此时Extra中出现了 **Backward index scan**，这个代表**反向扫描索引**，因为在MySQL中我们**创建的索引，默认索引的叶子节点是从小到大排序的，而此时我们查询排序时，是从大到小，**所以，在扫描时，就是反向扫描，就会出现 Backward index scan。 在MySQL8版本中，支持降序索引，我们也可以创建降序索引。

根据phone，age进行升序排序，phone在前，age在后。

```sql
explain select id,age,phone from tb_user order by phone , age;
```

![An image](/img/dev/mysql/74.png)

排序时,也**需要满足最左前缀法则**，否则也会出现 `filesort`。因为在创建索引的时候， age是第一个字段，phone是第二个字段，所以排序时，也就该按照这个顺序来，否则就会出现 `Usingfilesort`。

根据age, phone进行降序一个升序，一个降序

```sql
explain select id,age,phone from tb_user order by age asc , phone desc ;
```

![An image](/img/dev/mysql/75.png)

因为**创建索引时，如果未指定顺序，默认都是按照升序排序的，而查询时，一个升序，一个降序，**此时就会出现 `Using filesort`。

![An image](/img/dev/mysql/76.png)

为了解决上述的问题，我们可以创建一个索引，这个联合索引中 age 升序排序，phone 倒序排序。

创建联合索引(age 升序排序，phone 倒序排序)

```sql
create index idx_user_age_phone_ad on tb_user(age asc ,phone desc);
```

![An image](/img/dev/mysql/77.png)

升序/降序联合索引结构图示

![An image](/img/dev/mysql/78.png)

------

![An image](/img/dev/mysql/79.png)

由上述的测试，我们得出order by优化原则

- 根据排序字段建立合适的索引，多字段排序时，也遵循最**左前缀法则**。
- 尽量使用**覆盖索引**。
- 多字段排序, **一个升序一个降序**，此时需要**注意联合索引在创建时的规则（ASC/DESC）**。
- 如果不可避免的出现 `filesort`，**大数据量排序时，可以适当增大排序缓冲区大小sort_buffer_size（默认256k）**。

## group by优化

在没有索引的情况下，执行如下SQL，查询执行计划：

```sql
explain select profession , count(*) from tb_user group by profession ;
```

![An image](/img/dev/mysql/80.png)

然后，我们在针对于 profession ， age， status 创建一个联合索引。

```sql
create index idx_user_pro_age_sta on tb_user(profession , age , status);
```

再执行前面相同的SQL查看执行计划。

```sql
explain select profession , count(*) from tb_user group by profession ;
```

![An image](/img/dev/mysql/81.png)

再执行如下的分组查询SQL，查看执行计划

![An image](/img/dev/mysql/82.png)

------

![An image](/img/dev/mysql/83.png)

> 如果仅仅根据age分组，就会出现 Using temporary ；
>
> 而如果是 根据profession,age两个字段同时分组，则不会出现 Using temporary。
>
> 原因是因为对于分组操作，在联合索引中，也是符合最左前缀法则的。

在分组操作中，我们需要通过以下两点进行优化，以提升性能

- 在分组操作时，可以通过索引来提高效率。
- 分组操作时，索引的使用也是满足最左前缀法则的。

## **limit优化**

分页关键字

- limit 查询的条数
- limit 开始的索引，每页查询条数
- limit 查询的条数，offset 跳过的索引

在数据量比较大时，如果进行limit分页查询，在查询时，越往后，分页查询效率越低。

![An image](/img/dev/mysql/84.png)

当在进行分页查询时，如果执行 `limit 2000000,10`，此时需要MySQL**排序前2000010 记录**，仅仅返回 2000000 - 2000010 的记录，其他记录丢弃，查询排序的代价非常大 。

### 优化思路

 一般分页查询时，通过创建 **覆盖索引** 能够比较好地提高性能，可以通过**覆盖索引加子查询形式**进行优化。

```sql
explain select * from tb_sku t , 
(select id from tb_sku order by idlimit 2000000,10)a 
where t.id = a.id;
```

## **count优化**

MyISAM 引擎**把一个表的总行数存在了磁盘上**，因此执行 `count(*)` 的时候会直接返回这个数，效率很高； 但是如果是带条件的count，MyISAM也慢。

InnoDB 引擎就麻烦了，它执行 `count(*)` 的时候，**需要把数据一行一行地从引擎里面读出来，然后累积计数**。

### 优化思路

自己计数(可以借助于redis这样的数据库进行，但是如果是带条件的count又比较麻烦了)。

### **count用法**

count() 是一个聚合函数，对于返回的结果集，一行行地判断，**如果 count 函数的参数不是NULL，累计值就加 1，否则不加**，最后返回累计值。

| count用法   | 含义                                                         |
| ----------- | ------------------------------------------------------------ |
| count(主键) | InnoDB 引擎会遍历整张表，把每一行的 主键id 值都取出来，返回给服务层。服务层拿到主键后，直接按行进行累加(主键不可能为null) |
| count(字段) | 没有not null 约束 : InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，服务层判断是否为null，不为null，计数累加。有not null 约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加。 |
| count(数字) | InnoDB 引擎遍历整张表，但不取值。服务层对于返回的每一行，放一个数字“1”进去，直接按行进行累加。 |
| count(*)    | **InnoDB引擎并不会把全部字段取出来，而是专门做了优化**，不取值，服务层直接按行进行累加。 |

按照效率排序的话：`count(字段) < count(主键 id) < count(1) ≈ count(*)`

> **尽量使用 count(\*)**

## update优化

我们主要需要注意一下update语句执行时的注意事项

```sql
update course set name = 'javaEE' where id = 1 ;
```

当我们在执行删除的SQL语句时，**会锁定id为1这一行的数据**，然后事务提交之后，**行锁释放**。

但是当我们在执行如下SQL时。

```sql
update course set name = 'SpringBoot' where name = 'PHP';
```

当我们开启多个事务，在执行上述的SQL时，我们发现**行锁升级为了表锁**。 导致该update语句的性能大大降低。

**InnoDB的行锁是针对索引加的锁，不是针对记录加的锁 ,并且该索引不能失效**，否则会从**行锁升级为表锁**。
