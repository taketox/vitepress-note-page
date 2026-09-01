# 流程控制

在Java中，流程控制包括`if-else`、`while`、`do-while`、`for`、`return`、`break`以及选择语句`switch`。

## 条件语句

条件语句可根据不同的条件执行不同的语句。包括if条件语句与switch多分支语句。

### if 条件语句

if语句可以单独判断表达式的结果，表示表达的执行结果。

```java
if (条件表达式) {
    ....
}
```

### if...else 条件语句

if语句还可以与else连用，通常表现为如果满足某种条件，就进行某种处理，否则就进行另一种处理。

```java
if (条件表达式) {
    ...
} else {
    ...
}
```

### if...else if 多分支语句

上面中的if...else是单分支和两个分支的判断，如果有多个判断条件，就需要使用if...else if。

```java
if (条件表达式) {
    ...
} else if (条件表达式) {
    ...
} else {
    ...
}
```

### switch 多分支语句

一种比if...else if语句更优雅的方式是使用switch多分支语句。

```java
switch (变量) {
    case 值1:
        ...
        break;
    case 值2:
        ...
        break;
    case 值3:
        ...
        break;
    case 值4:
        ...
        break;
    default:
        ...
}
```

## 循环语句

### while 循环语句

while循环语句的循环方式为利用一个条件来控制是否要继续反复执行这个语句。

```java
while (布尔值) {
    表达式
}
```

当（布尔值）为true的时候，执行下面的表达式，布尔值为false的时候，结束循环，布尔值其实也是一个表达式。

### do...while 循环

while与do...while循环的唯一区别是do...while语句至少执行一次，即使第一次的表达式为false。而在while循环中，如果第一次条件为false，那么其中的语句根本不会执行。在实际应用中，while要比do...while应用的更广。

```java
do {
    ...
} while (布尔值);
```

### for 循环语句

for循环是我们经常使用的循环方式，这种形式会在第一次迭代前进行初始化

```java
for (初始化; 布尔表达式; 步进) {

}
```

每次迭代前会测试布尔表达式。如果获得的结果是false,就会执行for语句后面的代码；每次循环结束，会按照步进的值执行下一次循环。

### 逗号操作符

这里不可忽略的一个就是逗号操作符，Java里唯一用到逗号操作符的就是for循环控制语句。在表达式的初始化部分，可以使用一系列的逗号分隔的语句；通过逗号操作符，可以在for语句内定义多个变量，但它们必须具有相同的类型

```java
for (int i = 1, j = i + 10; i < 5; i++, j = j * 2){
    
}
```

### for-each 语句

在Java JDK1.5中还引入了一种更加简洁的、方便对数组和集合进行遍历的方法，即for-each语句。

```java
int array[] = {1, 2, 3};

for (int arr : array) {
    System.out.println(arr);
}
```

## 跳转语句

Java语言中，有三种跳转语句：`break`、`continue`和`return`。

### break语句

break语句我们在`switch`中已经见到了，它是用于终止循环的操作，实际上break语句在`for`、`while`、`do...while`循环语句中，用于强行退出当前循环。

```java
for(int i = 0;i < 10;i++){
    if(i == 5){
        break;
    }
}
```

### continue语句

continue也可以放在循环语句中，它与break语句具有相反的效果，它的作用是用于执行下一次循环，而不是退出当前循环。

```java
for(int i = 0;i < 10;i++){
    System.out.printl(" i = " + i );
    if(i == 5){
        System.out.printl("continue ... ");
        continue;
    }
}
```

### return语句

return语句可以从一个方法返回，并把控制权交给调用它的语句。

```java
public void getName() {
    return name; 
}
```
