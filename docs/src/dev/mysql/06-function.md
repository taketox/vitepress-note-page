# 常用函数

## 定义

函数 是指一段可以直接被另一段程序调用的程序或代码

MySQL中的函数主要分为以下四类：**字符串函数、数值函数、日期函数、流程函数**

## 字符串函数

| 函数                         | 功能                                                      |
| ---------------------------- | --------------------------------------------------------- |
| **CONCAT(S1,S2,...Sn)**      | 字符串拼接，将S1，S2，... Sn拼接成一个字符串              |
| **LOWER(str)**               | 将字符串str全部转为小写                                   |
| **UPPER(str)**               | 将字符串str全部转为大写                                   |
| **LPAD(str,n,pad)**          | 左填充，用字符串pad对str的左边进行填充，达到n个字符串长度 |
| **RPAD(str,n,pad)**          | 右填充，用字符串pad对str的右边进行填充，达到n个字符串长度 |
| **TRIM(str)**                | 去掉字符串头部和尾部的空格                                |
| **SUBSTRING(str,start,len)** | 返回从字符串str从start位置起的len个长度的字符串           |

`concat`：字符串拼接

```sql
select concat('Hello' , ' MySQL');
```

`lower`：全部转小写

```sql
select lower('Hello');
```

`upper`：全部转大写

```sql
select upper('Hello');
```

`lpad`：左填充

```sql
select lpad('01', 5, '-');
```

`rpad`：右填充

```sql
select rpad('01', 5, '-');
```

`trim`：去除空格

```sql
select trim(' Hello MySQL ');
```

`substring`：截取子字符串

```sql
select trim(' Hello MySQL ');
```

`substring`：截取子字符串

```sql
select substring('Hello MySQL',1,5);
```

举例

由于业务需求变更，企业员工的工号，统一为5位数，目前不足5位数的全部在前面补0

```sql
update emp set workno = lpad(workno, 5, '0');
```

## 数值函数

| 函数           | 功能                               |
| -------------- | ---------------------------------- |
| **CEIL(x)**    | 向上取整                           |
| **FLOOR(x)**   | 向下取整                           |
| **MOD(x,y)**   | 返回x/y的模                        |
| **RAND()**     | 返回0~1内的随机数                  |
| **ROUND(x,y)** | 求参数x的四舍五入的值，保留y位小数 |

`ceil`：向上取整

```sql
select ceil(1.1);
```

`floor`：向下取整

```sql
select floor(1.9);
```

`mod`：取模

```sql
select mod(7,4);
```

`rand`：获取随机数

```sql
select rand();
```

`round`：四舍五入

```sql
select round(2.344,2);
```

举例

通过数据库的函数，生成一个六位数的随机验证码

思路

获取随机数可以通过rand()函数，但是获取出来的随机数是在0-1之间的，所以可以在其基础

上乘以1000000，然后舍弃小数部分，如果长度不足6位，补0

```sql
select lpad(round(rand()*1000000 , 0), 6, '0');
```

## 日期函数

| 函数                                  | 功能                                              |
| ------------------------------------- | ------------------------------------------------- |
| **CURDATE()**                         | 返回当前日期                                      |
| **CURTIME()**                         | 返回当前时间                                      |
| **NOW()**                             | 返回当前日期和时间                                |
| **YEAR(date)**                        | 获取指定date的年份                                |
| **MONTH(date)**                       | 获取指定date的月份                                |
| **DAY(date)**                         | 获取指定date的日期                                |
| **DATE_ADD(date, INTERVAL exprtype)** | 返回一个日期/时间值加上一个时间间隔expr后的时间值 |
| **DATEDIFF(date1,date2)**             | 返回起始时间date1 和 结束时间date2之间的天数      |

`curdate`：当前日期

```sql
 select curdate();
```

`curtime`：当前时间

```sql
select curtime();
```

`now`：当前日期和时间

```sql
select now();
```

`YEAR , MONTH , DAY`：当前年、月、日

```sql
select YEAR(now());
select MONTH(now());
select DAY(now());
```

`date_add`：增加指定的时间间隔

```sql
select date_add(now(), INTERVAL 70 YEAR );
```

`datediff`：获取两个日期相差的天数

```sql
select datediff('2021-10-01', '2021-12-01');
```

举例

查询所有员工的入职天数，并根据入职天数倒序排序。

```sql
select 
    name, datediff(curdate(), entrydate) as 'entrydays' 
from 
    emp 
order by
    entrydays desc;
```

## 流程函数

| 函数                                                         | **功能**                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| **IF(value , t , f)**                                        | 如果value为true，则返回t，否则返回f                       |
| **IFNULL(value1 , value2)**                                  | 如果value1不为空，返回value1，否则返回value2              |
| **CASE WHEN [ val1 ] THEN [res1] ...ELSE [ default ] END**   | 如果val1为true，返回res1，... 否****则返回default默认值   |
| **CASE [ expr ] WHEN [ val1 ] THEN[res1] ... ELSE [ default ] END** | 如果expr的值等于val1，返回res1，... 否则返回default默认值 |

`if`

```sql
select if(false, 'Ok', 'Error');
```

`ifnull`

```sql
select ifnull('Ok','Default');

select ifnull('','Default');

select ifnull(null,'Default');
```

`case when then else end`

查询emp表的员工姓名和工作地址 (北京/上海 ----> 一线城市 , 其他 ----> 二线城市)

```sql
select
name,
( case workaddress when '北京' then '一线城市' 
                                        when '上海' then '一线城市' 
                                        else'二线城市' end ) as '工作地址'
from emp;
```
