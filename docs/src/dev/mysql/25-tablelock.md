# 表级锁

## 表级锁

表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用在MyISAM、InnoDB、BDB等存储引擎中。

对于表级锁，主要分为以下三类：

- **表锁**
- **元数据锁（meta data lock，MDL）**
- **意向锁**

## 表锁

对于表锁，分为两类：

- **表共享读锁（read lock）**
- **表独占写锁（write lock）**

### 语法

- **加锁**：lock tables 表名... read/write。
- **释放锁**：unlock tables / 客户端断开连接 。

### 读锁

![An image](/img/dev/mysql/92.png)

左侧为客户端一，**对指定表加了读锁，不会影响右侧客户端二的读，但是会阻塞右侧客户端的写**。

测试

![An image](/img/dev/mysql/93.png)

### 写锁

![An image](/img/dev/mysql/94.png)

左侧为客户端一，对指定表加了写锁，**会阻塞右侧客户端的读和写**。

![An image](/img/dev/mysql/95.png)

> 读锁不会阻塞其他客户端的读，但是会阻塞写。写锁既会阻塞其他客户端的读，又会阻塞其他客户端的写。

## 元数据锁

meta data lock ，元数据锁，简写MDL。

MDL加锁过程是系统自动控制，无需显式使用，在访问一张表的时候会自动加上。**MDL锁主要作用是维护表元数据的数据一致性，在表上有活动事务的时候，不可以对元数据进行写入操作**。为了避免DML与DDL冲突，保证读写的正确性。

**这里的元数据，大家可以简单理解为就是一张表的表结构。 也就是说，某一张表涉及到未提交的事务时，是不能够修改这张表的表结构的。**

在MySQL5.5中引入了MDL，当对一张表进行增删改查的时候，加MDL读锁(共享)；当对表结构进行变更操作的时候，加MDL写锁(排他)。

常见的SQL操作时，所添加的元数据锁

| 对应SQL                                       | 锁类型                                 | 说明                                             |
| --------------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| lock tables xxx read /write                   | SHARED_READ_ONLY /SHARED_NO_READ_WRITE |                                                  |
| select 、select ...lock in share mode         | SHARED_READ                            | 与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥 |
| insert 、update、delete、select ... forupdate | SHARED_WRITE                           | 与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥 |
| alter table ...                               | EXCLUSIVE                              | 与其他的MDL都互斥                                |

演示

当执行SELECT、INSERT、UPDATE、DELETE等语句时，添加的是元数据共享锁（SHARED_READ /SHARED_WRITE），之间是兼容的。

![An image](/img/dev/mysql/96.png)

当执行SELECT语句时，添加的是元数据共享锁（SHARED_READ），会阻塞元数据排他锁（EXCLUSIVE），之间是互斥的。

![An image](/img/dev/mysql/97.png)

我们可以通过下面的SQL，来查看数据库中的元数据锁的情况

```sql
select object_type,object_schema,object_name,lock_type,lock_duration from performance_schema.metadata_locks ;
```

我们在操作过程中，可以通过上述的SQL语句，来查看元数据锁的加锁情况。

![An image](/img/dev/mysql/98.png)

## 意向锁

为了避免DML在执行时，加的行锁与表锁的冲突，**在InnoDB中引入了意向锁，使得表锁不用检查每行数据是否加锁，使用意向锁来减少表锁的检查**。

![An image](/img/dev/mysql/99.png)

在执行DML操作时，**会对涉及的行加行锁，同时也会对该表加上意向锁**

![An image](/img/dev/mysql/100.png)

而其他客户端，在对这张表加表锁的时候，**会根据该表上所加的意向锁来判定是否可以成功加表锁，而不用逐行判断行锁情况了**。

![An image](/img/dev/mysql/101.png)

意向锁又分为意向共享锁、意向排他锁。

- **意向共享锁(IS)**
  - 由语句**select ... lock in share mode**添加 。
  - 与 表锁共享锁(read)兼容，与表锁排他锁(write)互斥。
- **意向排他锁(IX)**
  - 由insert、update、delete、select...for update添加 。
  - 与表锁共享锁(read)及排他锁(write)都互斥，意向锁之间不会互斥

一旦事务提交了，意向共享锁、意向排他锁，都会自动释放

可以通过以下SQL，查看意向锁及行锁的加锁情况：

```sql
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from
performance_schema.data_locks;
```

意向共享锁与表读锁是兼容的

![An image](/img/dev/mysql/102.png)

意向排他锁与表读锁、写锁都是互斥的

![An image](/img/dev/mysql/103.png)
