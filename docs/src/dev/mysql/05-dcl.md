# 数据控制语言

## 定义

Data Control Language(数据控制语言)，用来管理数据库用户、控制数据库的访问权限。

## 管理用户

查询用户

```sql
select * from mysql.user;
```

- 其中 Host代表当前用户访问的主机
- 如果为localhost， 仅代表只能够在当前本机访问，是不可以远程访问的。
- User代表的是访问该数据库的用户名。
- 在MySQL中需要通过Host和User来唯一标识一个用户。

创建用户

```sql
CREATE USER '用户名'@'主机名' IDENTIFIED BY '密码';
```

修改用户密码

```sql
ALTER USER '用户名'@'主机名' IDENTIFIED WITH mysql_native_password BY '新密码' ;
```

删除用户

```sql
DROP USER '用户名'@'主机名' ;
```

注意事项

- 在MySQL中需要通过用户名@主机名的方式，来唯一标识一个用户
- 主机名可以使用 % 通配

## 权限控制

MySQL中定义了很多种权限，但是常用的就以下几种：

| 权限                    | 说明               |
| ----------------------- | ------------------ |
| **ALL, ALL PRIVILEGES** | 所有权限           |
| **SELECT**              | 查询数据           |
| **INSERT**              | 插入数据           |
| **UPDATE**              | 修改数据           |
| **DELETE**              | 删除数据           |
| **ALTER**               | 修改表             |
| **DROP**                | 删除数据库/表/视图 |
| **CREATE**              | 创建数据库/表      |

查询权限

```sql
SHOW GRANTS FOR '用户名'@'主机名' ;
```

授予权限

```sql
GRANT 权限列表 ON 数据库名.表名 TO '用户名'@'主机名';
```

撤销权限

```sql
REVOKE 权限列表 ON 数据库名.表名 FROM '用户名'@'主机名';
```

注意事项

- 多个权限之间，使用逗号分隔
- 授权时， 数据库名和表名可以使用 \* 进行通配，代表所有。
