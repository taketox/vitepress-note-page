# 索引失效

## 最左前缀法则

最左前缀法则指的是查询从索引的最左列开始，并且不跳过索引中的列。如果跳跃某一列，索引将会部分失效(后面的字段索引失效)。

如果索引了多列（联合索引），要遵守最左前缀法则。

以 `tb_user` 表为例，我们先来查看一下之前 `tb_user` 表所创建的索引。

![An image](/img/dev/mysql/36.png)

在 `tb_user` 表中，有一个联合索引，这个联合索引涉及到三个字段，

顺序分别为：profession，age，status。

对于最左前缀法则指的是，查询时，最左边的列，也就是profession必须存在，否则索引全部失效。而且中间不能跳过某一列，否则该列后面的字段索引将失效。

```sql
explain 
select * from tb_user where 
profession = '软件工程' 
and age = 31 
and status= '0';
```

![An image](/img/dev/mysql/37.png)

```sql
explain 
select * from tb_user where 
profession = '软件工程' 
and age = 31;
```

![An image](/img/dev/mysql/38.png)

```sql
explain 
select * from tb_user where 
profession = '软件工程';
```

![An image](/img/dev/mysql/39.png)

以上的这三组测试中，我们发现**只要联合索引最左边的字段 profession存在，索引就会生效**，只不过索引的长度不同。

而且由以上三组测试，我们也可以推测出profession字段索引长度为47、age字段索引长度为2、status字段索引长度为5。

```sql
explain 
select * from tb_user where 
age = 31 
and status = '0';
```

![An image](/img/dev/mysql/40.png)

```sql
explain 
select * from tb_user where 
status = '0';
```

![An image](/img/dev/mysql/41.png)

而通过上面的这两组测试，我们也可以看到索引并未生效，原因是因为不满足最左前缀法则，**联合索引最左边的列profession不存在**。

```sql
explain 
select * from tb_user where 
profession = '软件工程' 
and status = '0';
```

![An image](/img/dev/mysql/42.png)

上述的SQL查询时，存在profession字段，最左边的列是存在的，索引**满足最左前缀法则的基本条件**。但是查询时，**跳过了age这个列**，所以**后面的列索引是不会使用的**，也就是**索引部分生效**，所以索引的长度就是47。

> 最左前缀法则中指的最左边的列，是指在查询时，**联合索引的最左边的字段(即是第一个字段)必须存在**，与我们编写SQL时，**条件编写的先后顺序无关**。

## 范围查询

联合索引中，出现范围查询(使用> 或 <)，范围查询右侧的列索引失效。

```sql
explain 
select * from tb_user where 
profession = '软件工程' 
and age > 30 
and status = '0';
```

![An image](/img/dev/mysql/43.png)

当范围查询使用> 或 < 时，走联合索引了，但是索引的长度为49，就说明范围查询右边的status字段是没有走索引的。

```sql
explain 
select * from tb_user where 
profession = '软件工程' 
and age >= 30 
and status = '0';
```

![An image](/img/dev/mysql/44.png)

当范围查询使用>= 或 <= 时，走联合索引了，但是索引的长度为54，就说明所有的字段都是走索引的。

>在业务允许的情况下，尽可能的使用类似于 >= 或 <= 这类的范围查询，而避免使用 > 或 < 。

## 索引失效情况

### 索引列运算

不要在索引列上进行运算操作， 索引将失效。

在 `tb_user` 表中，除了前面介绍的联合索引之外，还有一个索引，是phone字段的单列索引。

![An image](/img/dev/mysql/45.png)

当根据phone字段进行等值匹配查询时, 索引生效。

```sql
explain select * from tb_user where phone = '17799990015';
```

![An image](/img/dev/mysql/46.png)

当根据phone字段进行函数运算操作之后，索引失效。

```sql
explain select * from tb_user where substring(phone,10,2) = '15';
```

![An image](/img/dev/mysql/47.png)

### 字符串不加引号

字符串类型字段使用时，不加引号，索引将失效。

通过两组示例，来看看对于字符串类型的字段，加单引号与不加单引号的区别

![An image](/img/dev/mysql/48.png)

------

![An image](/img/dev/mysql/49.png)

> 上面两组示例，我们会明显的发现，如果字符串不加单引号，对于查询结果，没什么影响，但是数据库存在隐式类型转换，索引将失效。

### 模糊查询

如果仅仅是尾部模糊匹配，索引不会失效。如果是头部模糊匹配，索引失效。

接下来，我们来看一下这三条SQL语句的执行效果，查看一下其执行计划

由于下面查询语句中，**都是根据profession字段查询，符合最左前缀法则，联合索引是可以生效的，**

我们主要看一下，模糊查询时，%加在关键字之前，和加在关键字之后的影响

![An image](/img/dev/mysql/50.png)

> 在like模糊查询中，在关键字后面加%，索引可以生效。而如果在关键字前面加了%，索引将会失效。

### or连接条件

用or分割开的条件，**如果or前的条件中的列有索引，而后面的列中没有索引，那么索引失效**

![An image](/img/dev/mysql/51.png)

由于age没有索引，所以即使id、phone有索引，索引也会失效。所以需要针对于age也要建立索引。

然后，我们可以对age字段建立索引。

```sql
create index idx_user_age on tb_user(age);
```

建立了索引之后，我们再次执行上述的SQL语句，看看前后执行计划的变化

![An image](/img/dev/mysql/52.png)

> 最终，我们发现，当or连接的条件，左右两侧字段都有索引时，索引才会生效

### 数据分布影响

如果MySQL评估使用索引比全表更慢，则不使用索引。

![An image](/img/dev/mysql/53.png)

------

![An image](/img/dev/mysql/54.png)

经过测试我们发现，相同的SQL语句，只是传入的字段值不同，最终的执行计划也完全不一样，这是为什么呢？

因为MySQL在查询时，**会评估使用索引的效率与走全表扫描的效率**，**如果走全表扫描更快，则放弃索引，走全表扫描**。因为索引是用来索引少量数据的，如果通过索引查询返回大批量的数据，则还不如走全表扫描来的快，此时索引就会失效。
