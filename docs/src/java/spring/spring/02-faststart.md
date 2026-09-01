# 快速开始

## 环境要求

- JDK：Java17+**（Spring6要求JDK最低版本是Java17）**

- Maven：3.6+

- Spring：6.1.2

## 引入依赖

```xml
<dependencies>
    <!--spring context依赖-->
    <!--当你引入Spring Context依赖之后，表示将Spring的基础依赖引入了-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.1.2</version>
    </dependency>

    <!--junit5测试-->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>5.3.1</version>
    </dependency>
</dependencies>
```

## 快速入门

创建java类

```java
package cc.taketo.bean;

public class HelloWorld {
    
    public void sayHello(){
        System.out.println("helloworld");
    }
}
```

创建配置文件

在resources目录创建一个 Spring 配置文件 beans.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--
    配置HelloWorld所对应的bean，即将HelloWorld的对象交给Spring的IOC容器管理
    通过bean标签配置IOC容器所管理的bean
    属性：
        id：设置bean的唯一标识
        class：设置bean所对应类型的全类名
	-->
    <bean id="helloWorld" class="cc.taketo.bean.HelloWorld"></bean>
    
</beans>
```

创建测试类测试

```java
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class HelloWorldTest {

    @Test
    public void testHelloWorld(){
        ApplicationContext ac = new ClassPathXmlApplicationContext("beans.xml");
        HelloWorld helloWorld = (HelloWorld) ac.getBean("helloWorld");
        helloWorld.sayHello();
    }
}

// 输出
HelloWorld
```

## 程序分析

1. 底层是怎么创建对象的，是通过反射机制调用无参数构造方法吗？

    ```java
    package cc.taketo.bean;

    public class HelloWorld {

        public HelloWorld() {
            System.out.println("无参数构造方法执行");
        }

        public void sayHello(){
            System.out.println("HelloWorld");
        }
    }

    // 输出
    无参数构造方法执行
    HelloWorld
    ```

    > 创建对象时确实调用了无参数构造方法。

2. Spring是如何创建对象的呢？原理是什么？

    ```java
    // dom4j解析beans.xml文件，从中获取class属性值，类的全类名
    // 通过反射机制调用无参数构造方法创建对象
    Class clazz = Class.forName("cc.taketo.bean.HelloWorld");
    //Object obj = clazz.newInstance();
    Object object = clazz.getDeclaredConstructor().newInstance();
    ```

3. 把创建好的对象存储到一个什么样的数据结构当中了呢？

    bean对象最终存储在spring容器中，在spring源码底层就是一个map集合，存储bean的map在**DefaultListableBeanFactory**类中：

    ```java
    private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);
    ```

    Spring容器加载到Bean类时，会把这个类的描述信息, 以包名加类名的方式存到 `beanDefinitionMap` 中，
    `Map<String,BeanDefinition>`，其中 String是Key , 默认是类名首字母小写， `BeanDefinition` 存的是类的定义（描述信息），我们通常叫`BeanDefinition`接口为：bean的定义对象。
