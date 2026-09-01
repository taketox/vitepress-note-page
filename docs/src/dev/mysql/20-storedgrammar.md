# 过程语法

## 变量

在MySQL中变量分为三种类型：**系统变量、用户定义变量、局部变量**。

### 系统变量@@

系统变量 是MySQL服务器提供，不是用户定义的，属于服务器层面。分为全局变量（GLOBAL）、会话变量（SESSION）。

查看系统变量

```sql
-- 查看所有系统变量
SHOW [ SESSION | GLOBAL ] VARIABLES ; 
-- 可以通过LIKE模糊匹配方式查找变量
SHOW [ SESSION | GLOBAL ] VARIABLES LIKE '......'; 
-- 查看指定变量的值
SELECT @@[SESSION | GLOBAL] 系统变量名; 
```

设置系统变量

```sql
SET [ SESSION | GLOBAL ] 系统变量名 = 值 ;
SET @@[SESSION | GLOBAL]系统变量名 = 值 ;
```

> 如果没有指定SESSION/GLOBAL，**默认是SESSION，会话变量。**
>
> **全局变量(GLOBAL)**：全局变量针对于所有的会话。
>
> **会话变量(SESSION)**：会话变量针对于单个会话，在另外一个会话窗口就不生效了。

mysql服务重新启动之后，所设置的全局参数会失效，要想不失效，可以在 **/etc/my.cnf** 中配置。

示例

```sql
-- 查看系统变量
show session variables ;
show session variables like 'auto%';
show global variables like 'auto%';
select @@global.autocommit;
select @@session.autocommit;

-- 设置系统变量
set session autocommit = 1;
insert into course(id, name) VALUES (6, 'ES');
set global autocommit = 0;
select @@global.autocommit;
```

### 用户定义变量@

用户定义变量 是用户根据需要自己定义的变量，用户变量不用提前声明，

**在用的时候直接用 "@变量名" 使用就可以**。其作用域为当前连接。

赋值

方式一

```sql
SET @var_name = expr [, @var_name = expr] ... ;
SET @var_name := expr [, @var_name := expr] ... ;
```

> 赋值时，可以使用 `=` ，也可以使用 `:=`

方式二

```sql
SELECT @var_name := expr [, @var_name := expr] ... ;
SELECT 字段名 INTO @var_name FROM 表名;
```

使用

```sql
SELECT @var_name ;
```

> 用户定义的变量无需对其进行声明或初始化，只不过获取到的值为NULL

示例

```sql
-- 赋值
set @myname = 'itcast';
set @myage := 10;
set @mygender := '男',@myhobby := 'java';

select @mycolor := 'red';

select count(*) into @mycount from tb_user;

-- 使用
select @myname,@myage,@mygender,@myhobby;
select @mycolor , @mycount;
select @abc;
```

### 局部变量

局部变量 是根据需要定义的在局部生效的变量，访问之前，需要DECLARE声明。可用作存储过程内的局部变量和输入参数，**局部变量的范围是在其内声明的BEGIN ... END块**。

声明

```sql
DECLARE 变量名 变量类型 [DEFAULT ... ] ;
```

> 变量类型就是数据库字段类型：`INT、BIGINT、CHAR、VARCHAR、DATE、TIME`等。

赋值

```sql
SET 变量名 = 值 ;
SET 变量名 := 值 ;
SELECT 字段名 INTO 变量名 FROM 表名 ... ;
```

示例

```sql
-- 声明局部变量 - declare
-- 赋值
create procedure p2()
begin
  declare stu_count int default 0;
  
  select count(*) into stu_count from student;
  
  select stu_count;
end;

call p2();
```

## 参数

参数的类型，主要分为以下三种：IN、OUT、INOUT。

| **类型**  | **含义**                                     | **备注** |
| --------- | -------------------------------------------- | -------- |
| **IN**    | 该类参数作为输入，也就是需要调用时传入值     | 默认     |
| **OUT**   | 该类参数作为输出，也就是该参数可以作为返回值 |          |
| **INOUT** | 既可以作为输入参数，也可以作为输出参数       |          |

语法

```sql
CREATE PROCEDURE 存储过程名称 ([ IN/OUT/INOUT 参数名 参数类型 ])
BEGIN
-- SQL语句
END ;
```

案例一

根据传入参数score，判定当前分数对应的分数等级，并返回。

- score >= 85分，等级为优秀。
- score >= 60分 且 score < 85分，等级为及格。
- score < 60分，等级为不及格。

```sql
create procedure p4(in score int, out result varchar(10))
begin
    if score >= 85 then
        set result := '优秀';
    elseif score >= 60 then
        set result := '及格';
    else
        set result := '不及格';
    end if;
end;
-- 定义用户变量 @result来接收返回的数据, 用户变量可以不用声明
call p4(18, @result);

select @result;
```

案例二

将传入的200分制的分数，进行换算，换算成百分制，然后返回。

```sql
create procedure p5(inout score double)
begin
    set score := score * 0.5;
end;
set @score = 198;
call p5(@score);
select @score;
```

## 条件判断

### if

if 用于存储过程中的条件判断

语法

```sql
IF 条件1 THEN
.....
    ELSEIF 条件2 THEN -- 可选
.....
    ELSE -- 可选
.....
END IF;
```

> 在if条件判断的结构中，ELSE IF 结构可以有多个，也可以没有。 ELSE结构可以有，也可以没有。

示例

根据定义的分数score变量，判定当前分数对应的分数等级。

- score >= 85分，等级为优秀。
- score >= 60分 且 score < 85分，等级为及格。
- score < 60分，等级为不及格。

```sql
create procedure p3()
    begin
        declare score int default 58;
        declare result varchar(10);
        if score >= 85 then
                set result := '优秀';
        elseif score >= 60 then
                set result := '及格';
        else
                set result := '不及格';
    end if;
    select result;
    end;
call p3();
```

> 上述的需求我们虽然已经实现了，但是也存在一些问题，比如：score 分数我们是在存储过程中定义死的，而且最终计算出来的分数等级，我们也仅仅是最终查询展示出来而已。
>
> 那么我们能不能，把score分数动态的传递进来，计算出来的分数等级是否可以作为返回值返回呢？
>
> 答案是肯定的，我们可以通过接下来所讲解的 参数 来解决上述的问题。

### case

介绍：case结构及作用，和我们在基础篇中所讲解的流程控制函数很类似。

语法1

```sql
-- 含义：
--当case_value的值为 when_value1时，执行statement_list1
--当值为 when_value2时，执行statement_list2， 否则就执行 statement_list
CASE case_value
    WHEN when_value1 THEN statement_list1
    [ WHEN when_value2 THEN statement_list2] ...
    [ ELSE statement_list ]
END CASE;
```

语法2

```sql
-- 含义： 
--当条件search_condition1成立时，执行statement_list1，
--当条件search_condition2成立时，执行statement_list2，否则就执行statement_list
CASE
    WHEN search_condition1 THEN statement_list1
    [WHEN search_condition2 THEN statement_list2] ...
    [ELSE statement_list]
END CASE;
```

案例

根据传入的月份，判定月份所属的季节（要求采用case结构）。

- 1-3月份，为第一季度
- 4-6月份，为第二季度
- 7-9月份，为第三季度
- 10-12月份，为第四季度

```sql
create procedure p6(in month int)
begin
    declare result varchar(10);
    case
            when month >= 1 and month <= 3 then
                set result := '第一季度';
            when month >= 4 and month <= 6 then
                set result := '第二季度';
            when month >= 7 and month <= 9 then
                set result := '第三季度';
            when month >= 10 and month <= 12 then
                set result := '第四季度';
            else
                set result := '非法参数';
        end case ;
        select concat('您输入的月份为: ',month, ', 所属的季度为: ',result);
end;

call p6(16);
```

> 注意：如果判定条件有多个，**多个条件之间，可以使用 and 或 or 进行连接**。

## 循环控制

### while

while 循环是有条件的循环控制语句。满足条件后，再执行循环体中的SQL语句。具体语法为：

```sql
-- 先判定条件，如果条件为true，则执行逻辑，否则，不执行逻辑
WHILE 条件 DO
        SQL逻辑...
END WHILE;
```

案例

计算从1累加到n的值，n为传入的参数值。

1. 定义局部变量, 记录累加之后的值
2. 每循环一次, 就会对n进行减1 ， 如果n减到0， 则退出循环

```sql
create procedure p7(in n int)
begin
        declare total int default 0;
        while n>0 do
        set total := total + n;
        set n := n - 1;
        end while;
        select total;
end;

call p7(100);
```

### repeat

repeat是有条件的循环控制语句, 当满足until声明的条件的时候，则退出循环

```sql
-- 先执行一次逻辑，然后判定UNTIL条件是否满足，
--如果满足，则退出。如果不满足，则继续下一次循环
REPEAT
    SQL逻辑...
    UNTIL 条件
END REPEAT;
```

案例

计算从1累加到n的值，n为传入的参数值。(使用repeat实现)

```sql
-- A. 定义局部变量, 记录累加之后的值;
-- B. 每循环一次, 就会对n进行-1 , 如果n减到0, 则退出循环
create procedure p8(in n int)
begin
        declare total int default 0;
    
        repeat
        set total := total + n;
        set n := n - 1;
    until n <= 0
    end repeat;
    
        select total;
end;

call p8(10);
call p8(100);
```

### loop

LOOP 实现简单的循环，如果不在SQL逻辑中增加退出循环的条件，可以用其来实现简单的死循环。

LOOP可以配合一下两个语句使用：

- LEAVE ：配合循环使用，退出循环。
- ITERATE：必须用在循环中，作用是跳过当前循环剩下的语句，直接进入下一次循环。

```sql
[begin_label:] LOOP
        SQL逻辑...
END LOOP [end_label];
LEAVE label; -- 退出指定标记的循环体
ITERATE label; -- 直接进入下一次循环
```

上述语法中出现的 begin_label，end_label，label 指的都是我们所自定义的标记。

案例一

计算从1累加到n的值，n为传入的参数值。

```sql
-- A. 定义局部变量, 记录累加之后的值;
-- B. 每循环一次, 就会对n进行-1 , 如果n减到0, 则退出循环 ----> leave xx
create procedure p9(in n int)
begin
        declare total int default 0;
    
        sum:loop
            if n<=0 then
                leave sum;
            end if;
      
      set total := total + n;
      set n := n - 1;
        end loop sum;
    
        select total;
end;

call p9(100);
```

案例二

计算从1到n之间的偶数累加的值，n为传入的参数值。

```sql
-- A. 定义局部变量, 记录累加之后的值;
-- B. 每循环一次, 就会对n进行-1 , 如果n减到0, 则退出循环 ----> leave xx
-- C. 如果当次累加的数据是奇数, 则直接进入下一次循环. --------> iterate xx
create procedure p10(in n int)
begin
        declare total int default 0;
    
        sum:loop
        if n<=0 then
        leave sum;
        end if;
        
        if n%2 = 1 then
            set n := n - 1;
            iterate sum;
        end if;
        
        set total := total + n;
        set n := n - 1;
        end loop sum;
        select total;
end;

call p10(100);
```
