# 常用约束

## 定义

约束是作用于表中字段上的规则，用于限制存储在表中的数据。

目的：保证数据库中数据的正确、有效性和完整性

| 约束                         | 描述                                                     | 关键字              |
| ---------------------------- | -------------------------------------------------------- | ------------------- |
| **非空约束**                 | 限制该字段的数据不能为null                               | **NOT NULL**        |
| **唯一约束**                 | 保证该字段的所有数据都是唯一、不重复的                   | **UNIQUE**          |
| **主键约束**                 | 主键是一行数据的唯一标识，要求非空且唯一                 | **PRIMARY** **KEY** |
| **默认约束**                 | 保存数据时，如果未指定该字段的值，则采用默认值           | **DEFAULT**         |
| **检查约束(8.0.16版本之后)** | 保证字段值满足某一个条件                                 | **CHECK**           |
| **外键约束**                 | 用来让两张表的数据之间建立连接，保证数据的一致性和完整性 | **FOREIGN** **KEY** |

> 约束是作用于表中字段上的，可以在创建表/修改表的时候添加约束。

## 外键约束

用来让两张表的数据之间建立连接，从而保证数据的一致性和完整性。

![An image](/img/dev/mysql/02.png)

注意

- 目前上述两张表，只是在逻辑上存在这样一层关系；
- 在数据库层面，并未建立外键关联，所以是无法保证数据的一致性和完整性的。

### 添加外键

```sql
CREATE TABLE 表名(
字段名 数据类型,
...
    [CONSTRAINT] [外键名称] 
  FOREIGN KEY (外键字段名) 
  REFERENCES 主表 (主表列名)
);
ALTER TABLE 
表名 
  ADD CONSTRAINT 外键名称 
  FOREIGN KEY (外键字段名)
  REFERENCES 主表 (主表列名) ;
```

举例

为emp表的dept_id字段添加外键约束,关联dept表的主键id。

```sql
alter table 
emp 
  add constraint fk_emp_dept_id 
  foreign key (dept_id) 
  referencesdept(id);
```

![An image](/img/dev/mysql/03.png)

添加了外键约束之后，我们再到dept表(父表)删除id为1的记录，然后看一下会发生什么现象。

此时将会报错，不能删除或更新父表记录，因为存在外键约束。

### 删除外键

```sql
ALTER TABLE 表名 DROP FOREIGN KEY 外键名称;
```

### 删除/更新行为

添加了外键之后，再删除父表数据时产生的约束行为，我们就称为删除/更新行为。具体的删除/更新行为有以下几种:

| **行为**       | **说明**                                                     |
| -------------- | ------------------------------------------------------------ |
| **NOACTION**   | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。 (与 RESTRICT 一致) 默认行为 |
| **RESTRICT**   | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。 (与 NO ACTION 一致)默认行为 |
| **CASCADE**    | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有，则也删除/更新外键在子表中的记录。 |
| **SET NULL**   | 当在父表中删除对应记录时，首先检查该记录是否有对应外键，如果有则设置子表中该外键值为null（这就要求该外键允许取null）。 |
| **SETDEFAULT** | 父表有变更时，子表将外键列设置成一个默认的值(Innodb不支持)   |

具体语法

```sql
ALTER TABLE 
表名 
    ADD CONSTRAINT 外键名称 
    FOREIGN KEY (外键字段) 
    REFERENCES
    主表名 (主表字段名) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
```

由于NO ACTION 是默认行为，我们前面语法演示的时候，已经测试过了，就不再演示了，这里我们再演示其他的两种行为：CASCADE、SET NULL。

#### CASCADE（级联）

```sql
alter table 
emp 
    add constraint fk_emp_dept_id 
    foreign key (dept_id) 
    references dept(id) 
    on update cascade 
    on delete cascade ;
```

修改父表id为1的记录，将id修改为6

![An image](/img/dev/mysql/04.png)

我们发现，原来在子表中dept_id值为1的记录，现在也变为6了，这就是cascade级联的效果。

删除父表id为6的记录

![An image](/img/dev/mysql/05.png)

我们发现，父表的数据删除成功了，但是子表中关联的记录也被级联删除了

#### SET NULL

```sql
alter table 
emp 
    add constraint fk_emp_dept_id 
    foreign key (dept_id)
    references dept(id) 
    on update set null 
    on delete set null ;
```

接下来，我们删除id为1的数据，看看会发生什么样的现象。

![An image](/img/dev/mysql/06.png)

我们发现父表的记录是可以正常的删除的，父表的数据删除之后，再打开子表 emp，我们发现子表emp的dept_id字段，原来dept_id为1的数据，**现在都被置为NULL了**。

![An image](/img/dev/mysql/07.png)
