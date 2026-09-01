# 行级锁

行级锁，每次操作锁住对应的行数据。**锁定粒度最小，发生锁冲突的概率最低，并发度最高**。应用在InnoDB存储引擎中。

InnoDB的数据是基于索引组织的，行锁是通过对索引上的索引项加锁来实现的，而不是对记录加的锁。对于行级锁，主要分为以下三类：

- **行锁（Record Lock）**：**锁定单个行记录的锁**，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持。

![An image](/img/dev/mysql/104.png)

- **间隙锁（Gap Lock）**：**锁定索引记录间隙（不含该记录）**，确保索引记录间隙不变，防止其他事务在这个间隙进行insert，产生幻读。在RR隔离级别下都支持。

![An image](/img/dev/mysql/105.png)

- **临键锁（Next-Key Lock）**：**行锁和间隙锁组合**，同时锁住数据，并锁住数据前面的间隙Gap。在RR隔离级别下支持。

![An image](/img/dev/mysql/106.png)

### 行锁

InnoDB实现了以下两种类型的行锁：

- **共享锁(S)**
  - 允许一个事务去读一行，阻止其他事务获得相同数据集的排它锁。
- **排他锁(X)**
  - 允许获取排他锁的事务更新数据，阻止其他事务获得相同数据集的共享锁和排他锁。

![An image](/img/dev/mysql/107.png)

常见的SQL语句，在执行时，所加的行锁如下

| SQL                          | 行锁类型   | 说明                                    |
| ---------------------------- | ---------- | --------------------------------------- |
| INSERT ...                   | 排他锁     | 自动加锁                                |
| UPDATE ...                   | 排他锁     | 自动加锁                                |
| DELETE ...                   | 排他锁     | 自动加锁                                |
| SELECT（正常）               | 不加任何锁 |                                         |
| SELECT ... LOCK IN SHAREMODE | 共享锁     | 需要手动在SELECT之后加LOCK IN SHAREMODE |
| SELECT ... FOR UPDATE        | 排他锁     | 需要手动在SELECT之后加FOR UPDATE        |

演示

默认情况下，InnoDB在 **REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜索和索引扫描，以防止幻读**。

- 针对唯一索引进行检索时，对已存在的记录进行等值匹配时，将会自动优化为行锁。
- InnoDB的行锁是针对于索引加的锁，不通过索引条件检索数据，那么InnoDB将对表中的所有记录加锁，此时 就会升级为表锁。

可以通过以下SQL，查看意向锁及行锁的加锁情况：

```sql
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from performance_schema.data_locks;
```

### 间隙锁&临键锁

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜索和索引扫描，以防止幻读。

- 索引上的等值查询(唯一索引)，给不存在的记录加锁时, 优化为间隙锁 。
- 索引上的等值查询(非唯一普通索引)，向右遍历时最后一个值不满足查询需求时，next-keylock 退化为间隙锁。
- 索引上的范围查询(唯一索引)--会访问到不满足条件的第一个值为止。

> 间隙锁唯一目的是防止其他事务插入间隙。间隙锁可以共存，一个事务采用的间隙锁不会阻止另一个事务在同一间隙上采用间隙锁。
