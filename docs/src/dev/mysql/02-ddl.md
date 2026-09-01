# 数据定义语言

## 定义

Data Definition Language，数据定义语言，用来定义 数据库对象(数据库，表，字段)

## 数据库操作

查询所有数据库

```sql
show databases;
```

查询当前数据库

```sql
select database();
```

创建数据库

```sql
create database [ if not exists ] 数据库名 
[ default charset 字符集 ] [ collate 排序规则 ];
create database itheima default charset utf8mb4;
```

删除数据库

```sql
drop database [ if exists ] 数据库名;
```

切换数据库

```sql
use 数据库名;
```

## 数据类型

MySQL中的数据类型有很多，主要分为三类：数值类型、字符串类型、日期时间类型。

### 数值类型

| **类型**        | **大小** | **有符号(SIGNED)范围**                              | **无符号(UNSIGNED)范围**                               | **描述**           |
| --------------- | -------- | --------------------------------------------------- | ------------------------------------------------------ | ------------------ |
| **TINYINT**     | 1byte    | (-128，127)                                         | (0，255)                                               | 小整数值           |
| **SMALLINT**    | 2bytes   | (-32768，32767)                                     | (0，65535)                                             | 大整数值           |
| **MEDIUMINT**   | 3bytes   | (-8388608，8388607)                                 | (0，16777215)                                          | 大整数值           |
| **INT/INTEGER** | 4bytes   | (-2147483648，2147483647)                           | (0，4294967295)                                        | 大整数值           |
| **BIGINT**      | 8bytes   | (-2^63，2^63-1)                                     | (0，2^64-1)                                            | 极大整数值         |
| **FLOAT**       | 4bytes   | (-3.402823466 E+38，3.402823466351 E+38)            | 0 和 (1.175494351 E-38，3.402823466 E+38)              | 单精度浮点数值     |
| **DOUBLE**      | 8bytes   | (-1.7976931348623157E+308，1.7976931348623157E+308) | 0 和(2.2250738585072014E-308，1.7976931348623157E+308) | 双精度浮点数值     |
| **DECIMAL**     |          | 依赖于M(精度)和D(标度)的值                          | 依赖于M(精度)和D(标度)的值                             | 小数值(精确定点数) |

举例

- `age tinyint unsigned`：年龄不会出现负数，而且人的年龄不会太大
- `score double(4,1)`：分数总分100分，最多出现一位小数

### 字符串类型

| **类型**       | **大小**              | **描述**                     |
| -------------- | --------------------- | ---------------------------- |
| **CHAR**       | 0-255 bytes           | 定长字符串(需要指定长度)     |
| **VARCHAR**    | 0-65535 bytes         | 变长字符串(需要指定长度)     |
| **TINYBLOB**   | 0-255 bytes           | 不超过255个字符的二进制数据  |
| **TINYTEXT**   | 0-255 bytes           | 短文本字符串                 |
| **BLOB**       | 0-65 535 bytes        | 二进制形式的长文本数据       |
| **TEXT**       | 0-65 535 bytes        | 长文本数据                   |
| **MEDIUMBLOB** | 0-16 777 215 bytes    | 二进制形式的中等长度文本数据 |
| **MEDIUMTEXT** | 0-16 777 215 bytes    | 中等长度文本数据             |
| **LONGBLOB**   | 0-4 294 967 295 bytes | 二进制形式的极大文本数据     |
| **LONGTEXT**   | 0-4 294 967 295 bytes | 极大文本数据                 |

> char 与 varchar 都可以描述字符串，char是定长字符串，指定长度多长，就占用多少个字符，和字段值的长度无关 。
>
> 而varchar是变长字符串，指定的长度为最大占用长度 。
>
> 相对来说，char的性能会更高些。

举例

- `username varchar(50)`：用户名长度不定，最长不会超过50
- `gender char(1)`：性别不是男就是女
- `phone char(11)`：手机号固定长度为11

### 日期时间类型

| **类型**      | **大 小** | **范围**                                  | **格式**           | **描述**                 |
| ------------- | --------- | ----------------------------------------- | ------------------ | ------------------------ |
| **DATE**      | 3         | 1000-01-01 至 9999-12-31                  | YYYY-MM-DD         | 日期值                   |
| **TIME**      | 3         | -838:59:59 至 838:59:59                   | HH:MM:SS           | 时间值或持续时间         |
| **YEAR**      | 1         | 1901 至 2155                              | YYYY               | 年份值                   |
| **DATETIME**  | 8         | 1000-01-01 00:00:00 至9999-12-31 23:59:59 | YYYY-MM-DDHH:MM:SS | 混合日期和时间值         |
| **TIMESTAMP** | 4         | 1970-01-01 00:00:01 至2038-01-19 03:14:07 | YYYY-MM-DDHH:MM:SS | 混合日期和时间值，时间戳 |

举例

- `birthday date`：生日字段 birthday
- `createtime datetime`：创建时间

## 数据表操作

### 查询

查询当前数据库所有表

```sql
show tables;
```

查看指定表结构

```sql
desc 表名;
```

查询指定表的建表语句

```sql
show create table 表名;
```

> 通过这条指令，主要是用来查看建表语句的，而有部分参数我们在创建表的时候，并未指定也会查询到，因为这部分是数据库的默认值，如：存储引擎、字符集等。

### 创建

创建表结构

```sql
CREATE TABLE 表名(
  字段1 字段1类型 [ COMMENT 字段1注释 ],
  字段2 字段2类型 [COMMENT 字段2注释 ],
  字段3 字段3类型 [COMMENT 字段3注释 ],
  ......
  字段n 字段n类型 [COMMENT 字段n注释 ]
) [ COMMENT 表注释 ] ;
```

### 修改

添加字段

```sql
ALTER TABLE 表名 ADD 字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ];
```

举例：为emp表增加一个新的字段”昵称”为nickname，类型为varchar(20)

```sql
ALTER TABLE emp ADD nickname varchar(20) COMMENT '昵称';
```

修改数据类型

```sql
ALTER TABLE 表名 MODIFY 字段名 新数据类型 (长度);
```

修改字段名和字段类型

```sql
ALTER TABLE 表名 CHANGE 旧字段名 新字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ];
```

举例：将emp表的nickname字段修改为username，类型为varchar(30)

```sql
ALTER TABLE emp CHANGE nickname username varchar(30) COMMENT '昵称';
```

删除字段

```sql
ALTER TABLE 表名 DROP 字段名;
```

举例：将emp表的字段username删除

```sql
ALTER TABLE emp DROP username;
```

修改表名

```sql
ALTER TABLE 表名 RENAME TO 新表名;
```

举例：将emp表的表名修改为 employee

```sql
ALTER TABLE emp RENAME TO employee;
```

### 删除

删除表

```sql
DROP TABLE [ IF EXISTS ] 表名;
```

删除指定表，并重新创建表（清空表）

```sql
TRUNCATE TABLE 表名;
```

> 在删除表的时候，表中的全部数据也都会被删除
