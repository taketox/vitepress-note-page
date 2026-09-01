# 存储过程

## 定义

存储过程是事先经过编译并存储在数据库中的一段 SQL 语句的集合，调用存储过程可以简化应用开发人员的很多工作，减少数据在数据库和应用服务器之间的传输，对于提高数据处理的效率是有好处的。存储过程思想上很简单，就是数据库 SQL 语言层面的代码封装与重用。

特点

- **封装，复用**：可以把某一业务SQL封装在存储过程中，需要用到的时候直接调用可。
- **接收参数，返回数据**：在存储过程中，可以传递参数，也可以接收返回值。
- **减少网络交互，效率提升**：如果涉及到多条SQL，每执行一次都是一次网络传输。 而如果封装在存储过程中，我们只需要网络交互一次可能就可以了。

## 基本语法

创建

```sql
CREATE PROCEDURE 存储过程名称 ([ 参数列表 ])
BEGIN
-- SQL语句
END ;
```

调用

```sql
CALL 名称 ([ 参数 ]);
```

查看

```sql
-- 查询指定数据库的存储过程及状态信息
SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = 'xxx'; 
-- 查询某个存储过程的定义
SHOW CREATE PROCEDURE 存储过程名称 ; 
```

删除

```sql
DROP PROCEDURE [ IF EXISTS ] 存储过程名称 ；
```

> 在命令行中，执行创建存储过程的SQL时，需要通过关键字 **delimiter** 指定SQL语句的**结束符**。

示例

```sql
-- 存储过程基本语法
-- 创建
create procedure p1()
begin
select count(*) from student;
end;
-- 调用
call p1();
-- 查看
select * from information_schema.ROUTINES where ROUTINE_SCHEMA = 'itcast';
show create procedure p1;
-- 删除
drop procedure if exists p1;
```
