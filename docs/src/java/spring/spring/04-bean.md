# SpringBean

## 定义

**由 Spring IoC 容器管理的对象称为 Bean，Bean 根据 Spring 配置文件中的信息创建。**

我们可以把 Spring IoC 容器看作是一个大工厂，Bean 相当于工厂的产品。

如果希望这个大工厂生产和管理 Bean，就需要告诉容器需要哪些 Bean，以哪种方式装配。

**以XML配置文件为例：**

XML 配置文件的根元素是 `<beans>`，该元素包含了多个子元素 `<bean>`。

每一个 `<bean>` 元素都定义了一个 Bean，并描述了该 Bean 是如何被装配到 Spring 容器中的。

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
    <bean id="helloworld" class="cc.taketo.bean.HelloWorld">
        <property name="message" value="Hello World!"/>
    </bean>

</beans>
```

**属性详解：**

| 属性名称        | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| id              | Bean 的唯一标识符，Spring IoC 容器对 Bean 的配置和管理都通过该属性完成。id 的值必须以字母开始，可以使用字母、数字、下划线等符号。 |
| class           | 该属性指定了 Bean 的具体实现类，它必须是一个完整的类名，即类的全限定名。 |
| scope           | 表示 Bean 的作用域，属性值可以为 singleton（单例）、prototype（原型）、request、session 和 global Session。默认值是 singleton。 |
| constructor-arg | `<bean>` 元素的子元素，我们可以通过该元素，将构造参数传入，以实现 Bean 的实例化。该元素的 index 属性指定构造参数的序号（从 0 开始），type 属性指定构造参数的类型。 |
| property        | `<bean>`元素的子元素，用于调用 Bean 实例中的 setter 方法对属性进行赋值，从而完成属性的注入。该元素的 name 属性用于指定 Bean 实例中相应的属性名。 |
| ref             | `<property>` 和 `<constructor-arg>` 等元素的子元索，用于指定对某个 Bean 实例的引用，即 `<bean>` 元素中的 id 或 name 属性。 |
| value           | `<property>` 和 `<constractor-arg>` 等元素的子元素，用于直接指定一个常量值。 |
| list            | 用于封装 List 或数组类型的属性注入。                         |
| set             | 用于封装 Set 类型的属性注入。                                |
| map             | 用于封装 Map 类型的属性注入。                                |
| entry           | `<map>` 元素的子元素，用于设置一个键值对。其 key 属性指定字符串类型的键值，ref 或 value 子元素指定其值。 |
| init-method     | 容器加载 Bean 时调用该方法，类似于 Servlet 中的 init() 方法  |
| destroy-method  | 容器删除 Bean 时调用该方法，类似于 Servlet 中的 destroy() 方法。该方法只在 scope=singleton 时有效 |
| lazy-init       | 懒加载，值为 true，容器在首次请求时才会创建 Bean 实例；值为 false，容器在启动时创建 Bean 实例。该方法只在 scope=singleton 时有效 |

## Bean作用域

默认情况下，所有的 Spring Bean 都是单例的，也就是说在整个 Spring 应用中,Bean 的实例只有一个。

| 作用范围    | 描述                                                         |
| ----------- | ------------------------------------------------------------ |
| singleton   | **默认值，单例模式**，表示在 Spring 容器中只有一个 Bean 实例 |
| prototype   | 原型模式，表示**每次通过 Spring 容器获取 Bean 时，容器都会创建一个新的 Bean 实例。** |
| request     | 每次 HTTP 请求，容器都会创建一个 Bean 实例。该作用域只在当前 HTTP Request 内有效。 |
| session     | 同一个 HTTP Session 共享一个 Bean 实例，不同的 Session 使用不同的 Bean 实例。该作用域仅在当前 HTTP Session 内有效。 |
| application | 同一个 Web 应用共享一个 Bean 实例，该作用域在当前 ServletContext 内有效。与 singleton 类似，但 singleton 表示每个 IoC 容器中仅有一个 Bean 实例，而一个 Web 应用中可能会存在多个 IoC 容器，但一个 Web 应用只会有一个 ServletContext，也可以说 application 才是 Web 应用中货真价实的单例模式。 |
| websocket   | websocket 的作用域是 WebSocket ，即在整个 WebSocket 中有效。 |

> 注意：
>
> 在以上 6 种 Bean 作用域中，除了 singleton 和 prototype 可以直接在常规的 Spring IoC 容器，剩下的都只能在基于 Web 的 ApplicationContext 实现，否则会抛出 IllegalStateException 的异常。

### singleton

singleton 是 Spring 容器默认的作用域。**当 Bean 的作用域为 singleton 时，Spring IoC 容器中只会存在一个共享的 Bean 实例**。这个 Bean 实例将存储在高速缓存中，所有对于这个 Bean 的请求和引用，只要 id 与这个 Bean 定义相匹配，都会返回这个缓存中的对象实例。

singleton：**是 Bean 的默认创建方式，可以更好地重用对象，节省重复创建对象的开销**。

### prototype

从某种意义上说，Spring IoC 容器对于 prototype bean 的作用就相当于 Java 的 new 操作符。

它只负责 Bean 的创建，至于后续的生命周期管理则都是由客户端代码完成的，

prototype ：**Spring 容器会在每次请求该 Bean 时，都创建一个新的 Bean 实例**。

**区别：**

singleton单实例，prototype多实例

设置scope值为singleton时，加载spring配置文件时就会创建单实例对象。

设置scope值为prototype时，在调用getBean方法时创建多实例对象。

## Bean生命周期

在传统的 Java 应用中，Bean 的生命周期很简单，使用 Java 关键字 new 进行 Bean 的实例化后，这个 Bean 就可以使用了。一旦这个 Bean 长期不被使用，Java 自动进行垃圾回收。

相比之下，Spring 中 Bean 的生命周期较复杂，大致可以分为以下几个阶段：

1. bean对象创建（调用无参构造器）
2. 给bean对象设置属性

3. bean的后置处理器（初始化之前）

4. bean对象初始化（需在配置bean时指定初始化方法）

5. bean的后置处理器（初始化之后）

6. bean对象就绪可以使用

7. bean对象销毁（需在配置bean时指定销毁方法）

8. IOC容器关闭

创建User类

```java
package cc.taketo.bean;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class User {

    private Integer id;

    private String username;

    private String password;

    private Integer age;

    public User() {
        System.out.println("生命周期：1、创建对象");
    }

    public void setId(Integer id) {
        System.out.println("生命周期：2、依赖注入");
        this.id = id;
    }


    public void initMethod() {
        System.out.println("生命周期：3、初始化");
    }

    public void destroyMethod() {
        System.out.println("生命周期：5、销毁");
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", age=" + age +
                '}';
    }
}
```

> 其中的initMethod()和destroyMethod()，可以通过配置bean指定为初始化和销毁的方法

配置bean

```xml
<!-- 使用init-method属性指定初始化方法 -->
<!-- 使用destroy-method属性指定销毁方法 -->
<bean class="cc.taketo.bean.User" scope="singleton" init-method="initMethod" destroy-method="destroyMethod">
    <property name="id" value="1001"></property>
    <property name="username" value="admin"></property>
    <property name="password" value="123456"></property>
    <property name="age" value="23"></property>
</bean>
```

测试

```java
@Test
public void testLife(){
    ClassPathXmlApplicationContext ac = new ClassPathXmlApplicationContext("spring-lifecycle.xml");
    User bean = ac.getBean(User.class);
    System.out.println("生命周期：4、通过IOC容器获取bean并使用");
    ac.close();
}

// 输出
生命周期：1、创建对象
生命周期：2、依赖注入
生命周期：3、初始化
生命周期：4、通过IOC容器获取bean并使用
生命周期：5、销毁
```

### 生命周期流程

![An image](/img/java/spring/spring/04.png)

Bean 生命周期的整个执行过程描述如下。

1. Spring 启动，查找并加载需要被 Spring 管理的 Bean，对 Bean 进行实例化。
2. 对 Bean 进行属性注入。
3. 如果 Bean 实现了 `BeanNameAware` 接口，则 Spring 调用 Bean 的 `setBeanName()` 方法传入当前 Bean 的 id 值。
4. 如果 Bean 实现了 `BeanFactoryAware` 接口，则 Spring 调用 `setBeanFactory()` 方法传入当前工厂实例的引用。
5. 如果 Bean 实现了 `ApplicationContextAware` 接口，则 Spring 调用 `setApplicationContext()` 方法传入当前 `ApplicationContext` 实例的引用。
6. 如果 Bean 实现了 `BeanPostProcessor` 接口，则 Spring 调用该接口的预初始化方法 `postProcessBeforeInitialzation()` 对 Bean 进行加工操  作，此处非常重要，Spring 的 AOP 就是利用它实现的。
7. 如果 Bean 实现了 `InitializingBean` 接口，则 Spring 将调用 afterPropertiesSet() 方法。
8. 如果在配置文件中通过 `init-method` 属性指定了初始化方法，则调用该初始化方法。
9. 如果 `BeanPostProcessor` 和 Bean 关联，则 Spring 将调用该接口的初始化方法 `postProcessAfterInitialization()`。此时，Bean 已经可以被应用系统使用了。
10. 如果在 `<bean>` 中指定了该 Bean 的作用域为 `singleton`，则将该 Bean 放入 Spring IoC 的缓存池中，触发 Spring 对该 Bean 的生命周期管理；
11. 如果在 `<bean>` 中指定了该 Bean 的作用域为 `prototype`，则将该 Bean 交给调用者，调用者管理  该 Bean 的生命周期，Spring 不再管理该 Bean。
12. 如果 Bean 实现了 `DisposableBean` 接口，则 Spring 会调用 `destory()` 方法销毁 Bean；
13. 如果在配置文件中通过 `destory-method` 属性指定了 Bean 的销毁方法，则 Spring 将调用该方法对 Bean 进行销毁。

### 自定义生命周期

Bean 的生命周期回调方法主要有两种：

- 初始化回调方法：在 Spring Bean 被初始化后调用，执行一些自定义的回调操作。
- 销毁回调方法：在 Spring Bean 被销毁前调用，执行一些自定义的回调操作。

我们可以通过以下 3 种方式自定义 Bean 的生命周期回调方法：

- 通过接口实现
- 通过 XML 配置实现
- 使用注解实现

如果一个 Bean 中有多种生命周期回调方法时，优先级顺序为：`注解 > 接口 > XML 配置`。

**通过接口实现：**

| 回调方式   | 接口             | 方法                 | 说明                                                         |
| ---------- | ---------------- | -------------------- | ------------------------------------------------------------ |
| 初始化回调 | InitializingBean | afterPropertiesSet() | 指定初始化回调方法，这个方法会在 Spring Bean 被初始化后被调用，执行一些自定义的回调操作。 |
| 销毁回调   | DisposableBean   | destroy()            | 指定销毁回调方法，这个方法会在 Spring Bean 被销毁前被调用，执行一些自定义的回调操作。 |

**通过 XML 配置实现：**

| XML 配置属性   | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| init-method    | 指定初始化回调方法，这个方法会在 Spring Bean 被初始化后被调用，执行一些自定义的回调操作。 |
| destory-method | 指定销毁回调方法，这个方法会在 Spring Bean 被销毁前被调用，执行一些自定义的回调操作。 |

**使用注解实现：**

| 注解           | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| @PostConstruct | 指定初始化回调方法，这个方法会在 Spring Bean 被初始化后被调用，执行一些自定义的回调操作。 |
| @PreDestroy    | 指定销毁回调方法，这个方法会在 Spring Bean 被销毁前被调用，执行一些自定义的回调操作。 |

### 后置处理器

BeanPostProcessor 接口也被称为后置处理器，通过该接口可以自定义调用初始化前后执行的操作方法。

BeanPostProcessor 接口源码如下：

```java
public interface BeanPostProcessor {
    Object postProcessBeforeInitialization(Object bean, String beanName)
      throws BeansException;
  
    Object postProcessAfterInitialization(Object bean, String beanName) 
      throws BeansException;
}
```

该接口中包含了两个方法：

- postProcess**Before**Initialization() 方法：在 Bean 实例化、属性注入后，**初始化前调用。**
- postProcess**After**Initialization() 方法：在 Bean 实例化、属性注入、**初始化都完成后调用。**

> 注：**方法返回值不能为 null**，否则会报空指针异常或者通过 getBean() 方法获取不到 Bean 实例对象。

创建bean的后置处理器：

```java
package cc.taketo.process;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

public class MyBeanProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("☆☆☆" + beanName + " = " + bean);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("★★★" + beanName + " = " + bean);
        return bean;
    }
}
```

在IOC容器中配置后置处理器：

```xml
<!-- bean的后置处理器要放入IOC容器才能生效 -->
<bean id="myBeanProcessor" class="cc.taketo.process.MyBeanProcessor"/>
```

**当需要添加多个后置处理器实现类时：**

默认情况下 Spring 容器会根据后置处理器的定义顺序来依次调用。也可以通过实现 Ordered 接口的 getOrder 方法指定后置处理器的执行顺序。

该方法返回值为整数，默认值为 0，取值越大优先级越低。

```java
package cc.taketo.process;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.core.Ordered;

public class MyBeanProcessor implements BeanPostProcessor, Ordered {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("☆☆☆" + beanName + " = " + bean);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("★★★" + beanName + " = " + bean);
        return bean;
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

## FactoryBean

FactoryBean是Spring提供的一种整合第三方框架的常用机制。和普通的bean不同，配置一个FactoryBean类型的bean，在获取bean的时候得到的并不是class属性中配置的这个类的对象，而是getObject()方法的返回值。通过这种机制，Spring可以帮我们把复杂组件创建的详细过程和繁琐细节都屏蔽起来，只把最简洁的使用界面展示给我们。

将来我们整合Mybatis时，Spring就是通过FactoryBean机制来帮我们创建SqlSessionFactory对象的。

```java
/*
 * Copyright 2002-2020 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.beans.factory;

import org.springframework.lang.Nullable;

/**
 * Interface to be implemented by objects used within a {@link BeanFactory} which
 * are themselves factories for individual objects. If a bean implements this
 * interface, it is used as a factory for an object to expose, not directly as a
 * bean instance that will be exposed itself.
 *
 * <p><b>NB: A bean that implements this interface cannot be used as a normal bean.</b>
 * A FactoryBean is defined in a bean style, but the object exposed for bean
 * references ({@link #getObject()}) is always the object that it creates.
 *
 * <p>FactoryBeans can support singletons and prototypes, and can either create
 * objects lazily on demand or eagerly on startup. The {@link SmartFactoryBean}
 * interface allows for exposing more fine-grained behavioral metadata.
 *
 * <p>This interface is heavily used within the framework itself, for example for
 * the AOP {@link org.springframework.aop.framework.ProxyFactoryBean} or the
 * {@link org.springframework.jndi.JndiObjectFactoryBean}. It can be used for
 * custom components as well; however, this is only common for infrastructure code.
 *
 * <p><b>{@code FactoryBean} is a programmatic contract. Implementations are not
 * supposed to rely on annotation-driven injection or other reflective facilities.</b>
 * {@link #getObjectType()} {@link #getObject()} invocations may arrive early in the
 * bootstrap process, even ahead of any post-processor setup. If you need access to
 * other beans, implement {@link BeanFactoryAware} and obtain them programmatically.
 *
 * <p><b>The container is only responsible for managing the lifecycle of the FactoryBean
 * instance, not the lifecycle of the objects created by the FactoryBean.</b> Therefore,
 * a destroy method on an exposed bean object (such as {@link java.io.Closeable#close()}
 * will <i>not</i> be called automatically. Instead, a FactoryBean should implement
 * {@link DisposableBean} and delegate any such close call to the underlying object.
 *
 * <p>Finally, FactoryBean objects participate in the containing BeanFactory's
 * synchronization of bean creation. There is usually no need for internal
 * synchronization other than for purposes of lazy initialization within the
 * FactoryBean itself (or the like).
 *
 * @author Rod Johnson
 * @author Juergen Hoeller
 * @since 08.03.2003
 * @param <T> the bean type
 * @see org.springframework.beans.factory.BeanFactory
 * @see org.springframework.aop.framework.ProxyFactoryBean
 * @see org.springframework.jndi.JndiObjectFactoryBean
 */
public interface FactoryBean<T> {

    /**
     * The name of an attribute that can be
     * {@link org.springframework.core.AttributeAccessor#setAttribute set} on a
     * {@link org.springframework.beans.factory.config.BeanDefinition} so that
     * factory beans can signal their object type when it can't be deduced from
     * the factory bean class.
     * @since 5.2
     */
    String OBJECT_TYPE_ATTRIBUTE = "factoryBeanObjectType";

    /**
     * Return an instance (possibly shared or independent) of the object
     * managed by this factory.
     * <p>As with a {@link BeanFactory}, this allows support for both the
     * Singleton and Prototype design pattern.
     * <p>If this FactoryBean is not fully initialized yet at the time of
     * the call (for example because it is involved in a circular reference),
     * throw a corresponding {@link FactoryBeanNotInitializedException}.
     * <p>As of Spring 2.0, FactoryBeans are allowed to return {@code null}
     * objects. The factory will consider this as normal value to be used; it
     * will not throw a FactoryBeanNotInitializedException in this case anymore.
     * FactoryBean implementations are encouraged to throw
     * FactoryBeanNotInitializedException themselves now, as appropriate.
     * @return an instance of the bean (can be {@code null})
     * @throws Exception in case of creation errors
     * @see FactoryBeanNotInitializedException
     */
    @Nullable
    T getObject() throws Exception;

    /**
     * Return the type of object that this FactoryBean creates,
     * or {@code null} if not known in advance.
     * <p>This allows one to check for specific types of beans without
     * instantiating objects, for example on autowiring.
     * <p>In the case of implementations that are creating a singleton object,
     * this method should try to avoid singleton creation as far as possible;
     * it should rather estimate the type in advance.
     * For prototypes, returning a meaningful type here is advisable too.
     * <p>This method can be called <i>before</i> this FactoryBean has
     * been fully initialized. It must not rely on state created during
     * initialization; of course, it can still use such state if available.
     * <p><b>NOTE:</b> Autowiring will simply ignore FactoryBeans that return
     * {@code null} here. Therefore it is highly recommended to implement
     * this method properly, using the current state of the FactoryBean.
     * @return the type of object that this FactoryBean creates,
     * or {@code null} if not known at the time of the call
     * @see ListableBeanFactory#getBeansOfType
     */
    @Nullable
    Class<?> getObjectType();

    /**
     * Is the object managed by this factory a singleton? That is,
     * will {@link #getObject()} always return the same object
     * (a reference that can be cached)?
     * <p><b>NOTE:</b> If a FactoryBean indicates to hold a singleton object,
     * the object returned from {@code getObject()} might get cached
     * by the owning BeanFactory. Hence, do not return {@code true}
     * unless the FactoryBean always exposes the same reference.
     * <p>The singleton status of the FactoryBean itself will generally
     * be provided by the owning BeanFactory; usually, it has to be
     * defined as singleton there.
     * <p><b>NOTE:</b> This method returning {@code false} does not
     * necessarily indicate that returned objects are independent instances.
     * An implementation of the extended {@link SmartFactoryBean} interface
     * may explicitly indicate independent instances through its
     * {@link SmartFactoryBean#isPrototype()} method. Plain {@link FactoryBean}
     * implementations which do not implement this extended interface are
     * simply assumed to always return independent instances if the
     * {@code isSingleton()} implementation returns {@code false}.
     * <p>The default implementation returns {@code true}, since a
     * {@code FactoryBean} typically manages a singleton instance.
     * @return whether the exposed object is a singleton
     * @see #getObject()
     * @see SmartFactoryBean#isPrototype()
     */
    default boolean isSingleton() {
        return true;
    }
}
```

创建类UserFactoryBean

```java
public class UserFactoryBean implements FactoryBean<User> {
    @Override
    public User getObject() throws Exception {
        return new User();
    }

    @Override
    public Class<?> getObjectType() {
        return User.class;
    }
}
```

配置bean

```xml
<bean id="user" class="cc.taketo.bean.UserFactoryBean"></bean>
```

测试

```java
@Test
public void testUserFactoryBean(){
    //获取IOC容器
    ApplicationContext ac = new ClassPathXmlApplicationContext("spring-factorybean.xml");
    User user = (User) ac.getBean("user");
    System.out.println(user);
}
```
