# 索引语法

## 创建索引

```sql
CREATE [ UNIQUE | FULLTEXT ] 
INDEX 
index_name 
ON 
table_name 
(index_col_name,... ) ;
```

## 查看索引

```sql
SHOW INDEX FROM table_name ;
```

## 删除索引

```sql
DROP INDEX index_name ON table_name ;
```

## 使用示例

name字段为姓名字段，该字段的值可能会重复，为该字段创建索引。

```sql
CREATE INDEX idx_user_name ON tb_user(name);
```

phone手机号字段的值，是非空，且唯一的，为该字段创建唯一索引。

```sql
CREATE UNIQUE INDEX idx_user_phone ON tb_user(phone);
```

为profession、age、status创建联合索引。

```sql
CREATE INDEX idx_user_pro_age_sta ON tb_user(profession,age,status);
```

为email建立合适的索引来提升查询效率。

```sql
CREATE INDEX idx_email ON tb_user(email);
```
