# 游标

**游标（CURSOR）是用来存储查询结果集的数据类型，在存储过程和函数中可以使用游标对结果集进行循环的处理**。游标的使用包括游标的声明、OPEN、FETCH 和 CLOSE，其语法分别如下。

声明游标

```sql
DECLARE 游标名称 CURSOR FOR 查询语句 ;
```

打开游标

```sql
OPEN 游标名称;
```

获取游标记录

```sql
FETCH 游标名称 INTO 变量 [, 变量 ] ;
```

关闭游标

```sql
CLOSE 游标名称 ;
```

案例

根据传入的参数 `uage`，来查询用户表 `tb_user` 中，所有的用户年龄小于等于 `uage` 的用户姓名（name）和专业（profession），并将用户的姓名和专业插入到所创建的一张新表`(id,name,profession)`中。

```sql
-- 逻辑:
-- A. 声明游标, 存储查询结果集
-- B. 准备: 创建表结构
-- C. 开启游标
-- D. 获取游标中的记录
-- E. 插入数据到新表中
-- F. 关闭游标
create procedure p11(in uage int)
begin
    declare uname varchar(100);
    declare upro varchar(100);
        declare u_cursor cursor for 
    select name,profession from tb_user where age <= uage;
    
        drop table if exists tb_user_pro;
    create table if not exists tb_user_pro(
    id int primary key auto_increment,
    name varchar(100),
    profession varchar(100)
    );
    
    open u_cursor;
    while true do
        fetch u_cursor into uname,upro;
        insert into tb_user_pro values (null, uname, upro);
    end while;
        close u_cursor;
    
end;

    call p11(30);
```

上述的存储过程，最终我们在调用的过程中，会报错，之所以报错是因为上面的while循环中，并没有退出条件。当游标的数据集获取完毕之后，再次获取数据，就会报错，从而终止了程序的执行。

![An image](/img/dev/mysql/87.png)

但是此时，`tb_user_pro` 表结构及其数据都已经插入成功了，我们可以直接刷新表结构，检查表结构中的数据。

![An image](/img/dev/mysql/88.png)

上述的功能，虽然我们实现了，但是逻辑并不完善，而且程序执行完毕，获取不到数据，数据库还报错。 接下来，我们就需要来完成这个存储过程，并且解决这个问题。

> 要想解决这个问题，就需要通过MySQL中提供的 条件处理程序 Handler 来解决。

## 条件处理程序

条件处理程序（Handler）可以用来定义在流程控制结构执行过程中遇到问题时相应的处理步骤

```sql
DECLARE handler_action HANDLER FOR condition_value [, condition_value]
... statement ;

handler_action 的取值：
    CONTINUE: 继续执行当前程序
    EXIT: 终止执行当前程序
    
condition_value 的取值：
    SQLSTATE sqlstate_value: 状态码，如 02000
    
    SQLWARNING: 所有以01开头的SQLSTATE代码的简写
    NOT FOUND: 所有以02开头的SQLSTATE代码的简写
    SQLEXCEPTION: 所有没有被SQLWARNING 或 NOT FOUND捕获的SQLSTATE代码的简写
```

案例

我们继续来完成在上一小节提出的这个需求，并解决其中的问题。

根据传入的参数 `uage` 来查询用户表 `tb_user` 中，所有的用户年龄小于等于 `uage` 的用户姓名（name）和专业（profession），并将用户的姓名和专业插入到所创建的一张新表`(id,name,profession)`中。

通过 `SQLSTATE` 指定具体的状态码

```sql
-- 逻辑:
-- A. 声明游标, 存储查询结果集
-- B. 准备: 创建表结构
-- C. 开启游标
-- D. 获取游标中的记录
-- E. 插入数据到新表中
-- F. 关闭游标
create procedure p11(in uage int)
begin
    declare uname varchar(100);
    declare upro varchar(100);
    declare u_cursor cursor for 
    select name,profession from tb_user where age <= uage;
-- 声明条件处理程序 ： 当SQL语句执行抛出的状态码为02000时，将关闭游标u_cursor，并退出
        declare exit handler for SQLSTATE '02000' close u_cursor;
    
        drop table if exists tb_user_pro;
    create table if not exists tb_user_pro(
        id int primary key auto_increment,
        name varchar(100),
        profession varchar(100)
    );
    
        open u_cursor;
        while true do
      fetch u_cursor into uname,upro;
      insert into tb_user_pro values (null, uname, upro);
        end while;
        close u_cursor;
    
end;
call p11(30);
```

通过 `SQLSTATE` 的代码简写方式 NOT FOUND，02 开头的状态码，代码简写为 NOT FOUND

```sql
create procedure p12(in uage int)
begin
    declare uname varchar(100);
    declare upro varchar(100);
    declare u_cursor cursor for 
    select name,profession from tb_user where age <= uage;
-- 声明条件处理程序 ： 当SQL语句执行抛出的状态码为02开头时，将关闭游标u_cursor，并退出
        declare exit handler for not found close u_cursor;
    
        drop table if exists tb_user_pro;
    create table if not exists tb_user_pro(
        id int primary key auto_increment,
        name varchar(100),
        profession varchar(100)
    );
    
    open u_cursor;
    while true do
        fetch u_cursor into uname,upro;
        insert into tb_user_pro values (null, uname, upro);
    end while;
    
        close u_cursor;
end;
call p12(30);
```

具体的错误状态码，可以参考官方文档：

https://dev.mysql.com/doc/refman/8.0/en/declare-handler.html

https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
