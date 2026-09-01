# 异常处理

## 全局异常处理机制

### 异常处理两种方式

开发过程中是不可避免地会出现各种异常情况的，例如网络连接异常、数据格式异常、空指针异常等等。异常的出现可能导致程序的运行出现问题，甚至直接导致程序崩溃。因此，在开发过程中，合理处理异常、避免异常产生、以及对异常进行有效的调试是非常重要的。

对于异常的处理，一般分为两种方式：

- 编程式异常处理：

  是指在代码中显式地编写处理异常的逻辑。它通常涉及到对异常类型的检测及其处理，例如使用 try-catch 块来捕获异常，然后在 catch 块中编写特定的处理代码，或者在 finally 块中执行一些清理操作。在编程式异常处理中，开发人员需要显式地进行异常处理，异常处理代码混杂在业务代码中，导致代码可读性较差。

- 声明式异常处理：

  则是将异常处理的逻辑从具体的业务逻辑中分离出来，通过配置等方式进行统一的管理和处理。在声明式异常处理中，开发人员只需要为方法或类标注相应的注解（如 `@Throws` 或 `@ExceptionHandler`），就可以处理特定类型的异常。相较于编程式异常处理，声明式异常处理可以使代码更加简洁、易于维护和扩展。

站在宏观角度来看待声明式事务处理：

整个项目从架构这个层面设计的异常处理的统一机制和规范。

一个项目中会包含很多个模块，各个模块需要分工完成。如果张三负责的模块按照 A 方案处理异常，李四负责的模块按照 B 方案处理异常……各个模块处理异常的思路、代码、命名细节都不一样，那么就会让整个项目非常混乱。

使用声明式异常处理，可以统一项目处理异常思路，项目更加清晰明了！

### 基于注解异常声明异常处理

1. 声明异常处理控制器类

   异常处理控制类，统一定义异常处理handler方法！

   ```java
   /**
    * projectName: cc.taketo.execptionhandler
    * 
    * description: 全局异常处理器,内部可以定义异常处理Handler!
    */
   
   /**
    * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
    * @ControllerAdvice 代表当前类的异常处理controller! 
    */
   @RestControllerAdvice
   public class GlobalExceptionHandler {
   
     
   }
   ```

2. 声明异常处理hander方法

   异常处理handler方法和普通的handler方法参数接收和响应都一致！

   只不过异常处理handler方法要映射异常，发生对应的异常会调用！

   普通的handler方法要使用@RequestMapping注解映射路径，发生对应的路径调用！

   ```java
   /**
    * 异常处理handler 
    * @ExceptionHandler(HttpMessageNotReadableException.class) 
    * 该注解标记异常处理Handler,并且指定发生异常调用该方法!
    * 
    * 
    * @param e 获取异常对象!
    * @return 返回handler处理结果!
    */
   @ExceptionHandler(HttpMessageNotReadableException.class)
   public Object handlerJsonDateException(HttpMessageNotReadableException e){
       
       return null;
   }
   
   /**
    * 当发生空指针异常会触发此方法!
    * @param e
    * @return
    */
   @ExceptionHandler(NullPointerException.class)
   public Object handlerNullException(NullPointerException e){
   
       return null;
   }
   
   /**
    * 所有异常都会触发此方法!但是如果有具体的异常处理Handler! 
    * 具体异常处理Handler优先级更高!
    * 例如: 发生NullPointerException异常!
    *       会触发handlerNullException方法,不会触发handlerException方法!
    * @param e
    * @return
    */
   @ExceptionHandler(Exception.class)
   public Object handlerException(Exception e){
   
       return null;
   }
   ```

3. 配置文件扫描控制器类配置

   确保异常处理控制类被扫描

   ```java
    <!-- 扫描controller对应的包,将handler加入到ioc-->
    @ComponentScan(basePackages = {"cc.taketo.controller", "cc.taketo.exceptionhandler"})
   ```
