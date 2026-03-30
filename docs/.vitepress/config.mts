import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/',
    title: "Take To",
    description: "Online knowledge base",
    head: [['link', { rel: 'icon', href: '/img/favicon.ico' }]],
    srcDir: 'src',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        // 站点图标
        logo: '/img/logo_nav.png',
        // 自定义导航栏标题
        outlineTitle: '页面导航',
        // 侧边栏展开级别
        outline: [2, 3],
        // 导航栏配置
        nav: [
            //   { text: 'Home', link: '/' },
            {
                text: 'AI',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: '概念', link: '/ai/basic/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                            { text: '基础语法', link: '/ai/springai/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Java',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: '基础语法', link: '/java/basic/index' },
                            { text: '集合框架', link: '/java/container/index' },
                            { text: '并发编程', link: '/java/concurrent/index' },
                            { text: '读写操作', link: '/java/io/index' }
                            //   { text: 'JVM', link: '...' },
                            //   { text: '新特性', link: '...' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                            { text: 'Spring', link: '/java/spring/index' },
                            // { text: 'MyBatis', link: '/java/batis/index' },
                            { text: 'Cloud', link: '/java/cloud/index' },
                            { text: '日志框架', link: '/java/log/index' },
                            { text: '认证授权', link: '/java/permission/index' },
                            { text: '分库分表', link: '/java/sharding/index' },
                            { text: '程序构建', link: '/java/build/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Go',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: '基础语法', link: '/go/basic/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                        ]
                    }
                ]
            },
            {
                text: 'Page',
                items: [
                    {
                        // 该部分的标题
                        text: 'HTML/CSS',
                        items: [
                            { text: 'HTML', link: '/page/html/index' },
                            { text: 'CSS', link: '/page/css/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: 'Javascript',
                        items: [
                            { text: '基础语法', link: '/page/basic/index' },
                            { text: '深入理解', link: '/page/advance/index' },
                            { text: '异步编程', link: '/page/async/index' },
                            { text: '性能调优', link: '/page/perf/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: 'Vue',
                        items: [
                            { text: 'Vue2', link: '/page/vue2/index' }
                        ]
                    },
                    {
                        text: 'Nodejs',
                        items: [
                            { text: '基础语法', link: '/nodejs/basic/index' },
                            { text: '模块机制', link: '/nodejs/moudle/index' },
                            { text: '异步编程', link: '/nodejs/async/index' },
                            { text: '内存控制', link: '/nodejs/memory/index' },
                            { text: 'Express', link: '/nodejs/express/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Linux',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: 'Bash命令', link: '/linux/bash/index' },
                            { text: 'Shell脚本', link: '/linux/shell/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                            { text: '应用实例', link: '/linux/instance/index' },
                            { text: '虚机平台', link: '/linux/vm/index' },
                            { text: '容器技术', link: '/linux/container/index' },
                            { text: '容器编排', link: '/linux/management/index' },
                            { text: '异地组网', link: '/linux/nat/index' },
                            { text: '智能家居', link: '/linux/nas/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '其他',
                        items: [
                            { text: '问题总结', link: '/linux/issues/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Chain',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: '区块链基础', link: '/chain/basic/index' },
                            { text: '共识算法', link: '/chain/consensus/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                            { text: 'Ethereum', link: '/chain/eth/index' },
                            { text: 'Eosio', link: '/chain/eosio/index' },
                            { text: 'Fabric', link: '/chain/fabric/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '其他',
                        items: [
                            { text: 'Caliper', link: '/chain/other/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Dev',
                items: [
                    {
                        // 该部分的标题
                        text: '开发工具',
                        items: [
                            { text: 'Git', link: '/dev/git/index' },
                            { text: 'GitLab', link: '/dev/gitlab/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '数据存储',
                        items: [
                            { text: 'MySQL', link: '/dev/mysql/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '消息队列',
                        items: [
                            { text: 'Kafka', link: '/dev/kafka/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Share',
                items: [
                    { text: '网页导航', link: '/share/navigation' },
                ]
            }
        ],
        // 侧边栏配置
        sidebar: {
            // 当用户位于 `java` 目录时，会显示此侧边栏
            '/java/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/basic/introduce' },
                        { text: '数据类型', link: '/java/basic/data' },
                        { text: 'String', link: '/java/basic/string' },
                        { text: '运算符', link: '/java/basic/operator' },
                        { text: '流程控制', link: '/java/basic/controller' },
                        { text: '面向对象', link: '/java/basic/objectoriented' },
                        { text: '面向对象特性', link: '/java/basic/objectfeature' },
                        { text: '关键字', link: '/java/basic/keys' },
                        { text: 'Object', link: '/java/basic/object' },
                        { text: '枚举', link: '/java/basic/enumerate' },
                        { text: '接口', link: '/java/basic/interface' },
                        { text: '内部类', link: '/java/basic/innerclass' },
                        { text: '泛型', link: '/java/basic/generics' },
                        { text: '异常', link: '/java/basic/error' },
                        { text: '反射', link: '/java/basic/reflection' },
                        { text: '注解', link: '/java/basic/annotation' }
                    ]
                },
                {
                    text: '集合框架',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/container/introduce' },
                        { text: 'ArrayList', link: '/java/container/arrayList' },
                        { text: 'LinkedList', link: '/java/container/linkedlist' },
                        { text: 'HashSet', link: '/java/container/hashset' },
                        { text: 'LinkedHashSet', link: '/java/container/linkedhashset' },
                        { text: 'TreeSet', link: '/java/container/treeset' },
                        { text: 'EnumSet', link: '/java/container/enumset' },
                        { text: 'HashMap', link: '/java/container/hashmap' },
                        { text: 'TreeMap', link: '/java/container/treemap' },
                        { text: 'WeakHashMap', link: '/java/container/weakhashmap' },
                        { text: 'LinkedHashMap', link: '/java/container/linkedhashmap' },
                        { text: 'IdentityHashMap', link: '/java/container/identityhashmap' },
                        { text: 'EnumMap', link: '/java/container/enummap' },
                        { text: 'PriorityQueue', link: '/java/container/priorityqueue' },
                        { text: 'ArrayDeque', link: '/java/container/arraydeque' },
                        { text: 'Vector', link: '/java/container/vector' },
                        { text: 'Stack', link: '/java/container/stack' },
                        { text: 'Hashtable', link: '/java/container/hashtable' },
                        { text: 'CopyOnWriteArrayList', link: '/java/container/copyonwritearraylist' },
                        { text: 'ConcurrentSkipListMap', link: '/java/container/concurrentskiplistmap' },
                        { text: 'ConcurrentSkipListSet', link: '/java/container/concurrentskiplistset' },
                        { text: 'CopyOnWriteArraySet', link: '/java/container/copyonwritearrayset' },
                        { text: 'LinkedBlockingDeque', link: '/java/container/linkedblockingdeque' },
                        { text: 'ArrayBlockingQueue', link: '/java/container/arrayblockingqueue' },
                        { text: 'LinkedBlockingQueue', link: '/java/container/linkedblockingqueue' },
                        { text: 'SynchronousQueue', link: '/java/container/synchronousqueue' },
                        { text: 'LinkedTransferQueue', link: '/java/container/linkedtransferqueue' },
                        { text: 'PriorityBlockingQueue', link: '/java/container/priorityblockingqueue' },
                        { text: 'DelayQueue', link: '/java/container/delayqueue' },
                        { text: 'ConcurrentLinkedQueue', link: '/java/container/concurrentlinkedqueue' },
                        { text: 'Iterator', link: '/java/container/iterator' },
                        { text: 'Enumeration', link: '/java/container/enumeration' },
                        { text: 'Fail-fast', link: '/java/container/failfast' },
                        { text: 'Sort', link: '/java/container/sort' }
                    ]
                },
                {
                    text: '并发编程',
                    collapsed: true,

                    items: [
                        { text: '基础概念', link: '/java/concurrent/basic' },
                        { text: 'Java线程', link: '/java/concurrent/thread' },
                        { text: '线程安全', link: '/java/concurrent/secure' },
                        { text: '线程状态', link: '/java/concurrent/status' },
                        { text: 'Synchronized', link: '/java/concurrent/synchronized' },
                        { text: 'ReentrantLock', link: '/java/concurrent/reentrantlock' },
                        { text: '内存模型', link: '/java/concurrent/memorymodel' },
                        { text: 'Volatile', link: '/java/concurrent/volatile' },
                        { text: 'CompareAndSwap', link: '/java/concurrent/cas' },
                        { text: '并发工具类', link: '/java/concurrent/util' },
                        { text: 'LongAdder源码', link: '/java/concurrent/longadder' },
                        { text: 'Unsafe', link: '/java/concurrent/unsafe' },
                        { text: '不可变设计', link: '/java/concurrent/final' },
                        { text: 'ThreadLocal', link: '/java/concurrent/threadlocal' },
                        { text: '阻塞队列', link: '/java/concurrent/queue' },
                        { text: '非阻塞队列', link: '/java/concurrent/noblocking' },
                        { text: '线程池使用', link: '/java/concurrent/pool' },
                        { text: '线程池原理', link: '/java/concurrent/principle' },
                        { text: '线程池调度', link: '/java/concurrent/scheduled' },
                        { text: '多线程任务拆分', link: '/java/concurrent/forkjoin' },
                        { text: 'AQS', link: '/java/concurrent/aqs' },
                        { text: 'ReentrantLock原理', link: '/java/concurrent/relock' },
                        { text: 'ReadWrite', link: '/java/concurrent/readwrite' },
                        { text: 'CountDown', link: '/java/concurrent/countdown' },
                        { text: 'CyclicBarrier', link: '/java/concurrent/cyclicbarrier' },
                        { text: 'Semaphore', link: '/java/concurrent/semaphore' },
                        { text: 'Exchanger', link: '/java/concurrent/exchanger' }
                    ]
                },
                {
                    text: '读写操作',
                    collapsed: true,

                    items: [
                        { text: '磁盘操作', link: '/java/io/file' },
                        { text: '字节操作', link: '/java/io/byte' },
                        { text: '字符操作', link: '/java/io/char' },
                        { text: '对象操作', link: '/java/io/obj' }
                    ]
                },
                {
                    text: 'Spring',
                    collapsed: true,

                    items: [
                        {
                            text: 'Spring',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/spring/spring/introduce' },
                                { text: '快速开始', link: '/java/spring/spring/faststart' },
                                { text: '控制反转', link: '/java/spring/spring/ioc' },
                                { text: 'SpringBean', link: '/java/spring/spring/bean' },
                                { text: '基于XML管理Bean', link: '/java/spring/spring/xml' },
                                { text: '基于注解管理Bean', link: '/java/spring/spring/anno' },
                                { text: 'SpringJDBC', link: '/java/spring/spring/jdbc' },
                                { text: 'Spring事务', link: '/java/spring/spring/transaction' },
                                { text: 'SpringResources', link: '/java/spring/spring/resources' },
                                { text: 'SpringI18n', link: '/java/spring/spring/i18n' },
                                { text: '参数校验', link: '/java/spring/spring/validator' },
                                { text: '提前编译', link: '/java/spring/spring/aot' }
                            ]
                        },
                        {
                            text: 'SpringMVC',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/spring/mvc/introduce' },
                                { text: '快速开始', link: '/java/spring/mvc/faststart' },
                                { text: '请求参数', link: '/java/spring/mvc/request' },
                                { text: '响应数据', link: '/java/spring/mvc/response' },
                                { text: 'RestFul', link: '/java/spring/mvc/restful' },
                                { text: '异常处理', link: '/java/spring/mvc/exception' },
                                { text: '拦截器', link: '/java/spring/mvc/interceptor' },
                                { text: '参数校验', link: '/java/spring/mvc/validator' }
                            ]
                        },
                        {
                            text: 'SpringBoot',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/spring/boot/introduce' },
                                { text: '快速开始', link: '/java/spring/boot/faststart' },
                                { text: '配置文件', link: '/java/spring/boot/config' },
                                { text: '项目构建', link: '/java/spring/boot/build' },
                                { text: '整合MVC', link: '/java/spring/boot/mvc' }
                            ]
                        }
                    ]
                },
                {
                    text: 'Spring Cloud',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/cloud/introduce' },
                        { text: '服务拆分', link: '/java/cloud/split' },
                        { text: '服务调用', link: '/java/cloud/call' },
                        { text: '注册中心', link: '/java/cloud/center' },
                        { text: 'Nacos', link: '/java/cloud/nacos' },
                        { text: 'OpenFeign', link: '/java/cloud/feign' },
                        { text: '网关路由', link: '/java/cloud/gateway' },
                        { text: '服务保护', link: '/java/cloud/security' },
                        { text: 'Sentinel', link: '/java/cloud/sentinel' }
                    ]
                },
                {
                    text: '日志框架',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/log/introduce' },
                        { text: 'Log4j', link: '/java/log/log4j' },
                        { text: 'SLF4J', link: '/java/log/slf4j' },
                        { text: 'Logback', link: '/java/log/logback' },
                        { text: 'Log4j2', link: '/java/log/log4j2' },
                        { text: '应用实例', link: '/java/log/demo' }
                    ]
                },
                {
                    text: '认证授权',
                    collapsed: true,

                    items: [
                        {
                            text: 'ApacheShiro',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/permission/apacheshiro/introduce' },
                                { text: '访问控制', link: '/java/permission/apacheshiro/access' },
                                { text: '重要的类与方法', link: '/java/permission/apacheshiro/class' },
                                { text: '过滤器', link: '/java/permission/apacheshiro/filter' },
                                { text: 'Shiro整合JWT', link: '/java/permission/apacheshiro/jwt' }
                            ]
                        },
                        {
                            text: 'SpringSecurity',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/permission/springsecurity/introduce' },
                                { text: '整体架构', link: '/java/permission/springsecurity/architecture' }
                            ]
                        }
                    ]
                },
                {
                    text: '程序构建',
                    collapsed: true,

                    items: [
                        {
                            text: 'Maven',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/build/maven/introduce' },
                                { text: '快速开始', link: '/java/build/maven/faststart' },
                                { text: '依赖管理', link: '/java/build/maven/manage' },
                                { text: '依赖传递与冲突', link: '/java/build/maven/conflict' },
                                { text: '工程继承与聚合', link: '/java/build/maven/extend' }
                            ]
                        },
                        {
                            text: 'Gradle',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/build/gradle/introduce' },
                                { text: '快速开始', link: '/java/build/gradle/faststart' },
                                { text: 'GradleWrapper', link: '/java/build/gradle/wrapper' },
                                { text: 'Groovy', link: '/java/build/gradle/groovy' },
                                { text: '生命周期', link: '/java/build/gradle/cycle' },
                                { text: 'Task', link: '/java/build/gradle/task' },
                                { text: '配置解析', link: '/java/build/gradle/config' },
                                { text: '文件操作', link: '/java/build/gradle/file' },
                                { text: 'Dependencies', link: '/java/build/gradle/depend' },
                                { text: 'Plugin', link: '/java/build/gradle/plugin' }
                            ]
                        },
                    ]
                }
            ],
            '/go/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/go/basic/introduce' },
                        { text: '语言特性', link: '/go/basic/feature' },
                        { text: '关键字及标识符', link: '/go/basic/package' },
                        { text: '包管理工具', link: '/go/basic/operator' },
                        { text: '基本结构', link: '/go/basic/structure' },
                        { text: '常量和变量', link: '/go/basic/constandvar' },
                        { text: '数据类型', link: '/go/basic/type' },
                        { text: '运算符', link: '/go/basic/operator' },
                        { text: '控制结构', link: '/go/basic/control' },
                        { text: '函数', link: '/go/basic/function' },
                        { text: '闭包', link: '/go/basic/closure' },
                        { text: '数组', link: '/go/basic/array' }
                    ]
                }
            ],
            '/page/': [
                {
                    text: 'HTML',
                    collapsed: true,

                    items: [
                        { text: 'HTML4', link: '/page/html/html4' },
                        { text: 'HTML5', link: '/page/html/html5' },
                    ]
                },
                {
                    text: 'CSS',
                    collapsed: true,

                    items: [
                        { text: 'CSS2', link: '/page/css/css2' },
                        { text: 'CSS3', link: '/page/css/css3' }
                    ]
                },
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/page/basic/introduce' },
                        { text: '作用域', link: '/page/basic/scpoe' },
                        { text: '闭包', link: '/page/basic/closure' },
                        { text: '函数上下文', link: '/page/basic/context' },
                        { text: '数组', link: '/page/basic/array' },
                        { text: '对象', link: '/page/basic/object' },
                        { text: '数据类型', link: '/page/basic/type' },
                        { text: '原型', link: '/page/basic/prototype' },
                        { text: 'DOM', link: '/page/basic/dom' },
                        { text: 'BOM', link: '/page/basic/bom' },
                        { text: '事件模型', link: '/page/basic/eventmoudle' },
                        { text: '事件循环', link: '/page/basic/eventloop' }
                    ]
                },
                {
                    text: '深入理解',
                    collapsed: true,

                    items: [
                        { text: '模块化', link: '/page/advance/moudle' },
                        { text: '代码解析与执行', link: '/page/advance/engine' },
                        { text: '垃圾回收机制', link: '/page/advance/gc' },
                        { text: 'WeakMap', link: '/page/advance/weakmap' },
                        { text: 'WeakSet', link: '/page/advance/weakset' },
                        { text: 'Class', link: '/page/advance/class' },
                        { text: '函数式编程', link: '/page/advance/functioncode' },
                        { text: '迭代器', link: '/page/advance/iterator' },
                        { text: 'Proxy', link: '/page/advance/proxy' },
                        { text: '深拷贝与浅拷贝', link: '/page/advance/copy' },
                        { text: 'Stringify', link: '/page/advance/stringify' },
                        { text: '网页存储', link: '/page/advance/webstorage' },
                        { text: '装饰器', link: '/page/advance/decorator' },
                        { text: '跨页面通信', link: '/page/advance/crosspage' },
                        { text: 'ShadowDOM', link: '/page/advance/shadow' },
                        { text: 'Date', link: '/page/advance/data' },
                        { text: '正则表达式', link: '/page/advance/regexp' },
                        { text: '异常处理', link: '/page/advance/error' }
                    ]
                },
                {
                    text: '异步编程',
                    collapsed: true,

                    items: [
                        { text: '异步编程', link: '/page/async/code' },
                        { text: '异步与回调', link: '/page/async/async' },
                        { text: 'Promise', link: '/page/async/promise' },
                        { text: '实现PromiseA+规范', link: '/page/async/promisea' },
                        { text: 'Generator', link: '/page/async/generator' },
                        { text: 'async与await', link: '/page/async/asyncandawait' }
                    ]
                },
                {
                    text: '性能调优',
                    collapsed: true,

                    items: [
                        { text: 'MutationObserver', link: '/page/perf/mutation' },
                        { text: 'requestAnimationFrame', link: '/page/perf/request' },
                        { text: 'Performance API', link: '/page/perf/performance' },
                        { text: '页面生命周期', link: '/page/perf/load' }
                    ]
                },
                {
                    text: 'Vue2',
                    collapsed: true,

                    items: [
                        { text: 'Vue核心', link: '/page/vue2/vue2' },
                        { text: '组件化编程', link: '/page/vue2/component' },
                        { text: 'Ajax', link: '/page/vue2/ajax' },
                        { text: 'Vuex', link: '/page/vue2/vuex' },
                        { text: 'Vue-Router', link: '/page/vue2/router' }
                    ]
                }
            ],
            '/nodejs/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: 'Node简介', link: '/nodejs/basic/introduce' },
                        { text: 'Node特点', link: '/nodejs/basic/features' },
                        { text: 'Node模块', link: '/nodejs/basic/moudle' },
                        { text: 'NPM使用', link: '/nodejs/basic/usenpm' },
                        { text: 'Path模块', link: '/nodejs/basic/path' },
                        { text: 'Fs模块', link: '/nodejs/basic/fs' },
                        { text: 'Stream模块', link: '/nodejs/basic/stream' },
                        { text: 'Buffer模块', link: '/nodejs/basic/buf' },
                        { text: 'Buffer探究', link: '/nodejs/basic/buffer' },
                        { text: 'Event模块', link: '/nodejs/basic/event' },
                        { text: 'Event源码', link: '/nodejs/basic/source' },
                        { text: '事件循环', link: '/nodejs/basic/eventloop' },
                        { text: '进程与线程', link: '/nodejs/basic/process' },
                        { text: '多进程使用', link: '/nodejs/basic/useprocess' }
                    ]
                },
                {
                    text: '模块机制',
                    collapsed: true,

                    items: [
                        { text: 'CommonJS规范', link: '/nodejs/moudle/commonjs' },
                        { text: 'Node的模块实现', link: '/nodejs/moudle/nodemoudle' },
                        { text: '核心模块', link: '/nodejs/moudle/core' },
                        { text: '扩展模块', link: '/nodejs/moudle/expand' },
                        { text: '调用模块栈', link: '/nodejs/moudle/stack' },
                        { text: '包与NPM', link: '/nodejs/moudle/npm' },
                        { text: '前后端共用模块', link: '/nodejs/moudle/common' }
                    ]
                },
                {
                    text: '异步编程',
                    collapsed: true,

                    items: [
                        { text: '异步IO与非阻塞IO', link: '/nodejs/async/io' },
                        { text: 'Node异步IO', link: '/nodejs/async/nodeio' },
                        { text: '非IO的异步API', link: '/nodejs/async/api' },
                        { text: '事件驱动与高性能服务器', link: '/nodejs/async/event' },
                        { text: '函数式编程', link: '/nodejs/async/functional' },
                        { text: '异步编程的优势与难点', link: '/nodejs/async/advantage' },
                        { text: '异步编程解决方案', link: '/nodejs/async/solve' }
                    ]
                },
                {
                    text: '内存控制',
                    collapsed: true,

                    items: [
                        { text: 'V8内存限制', link: '/nodejs/memory/v8' },
                        { text: 'V8垃圾回收机制', link: '/nodejs/memory/recycle' },
                        { text: '高效使用内存', link: '/nodejs/memory/use' },
                        { text: '内存指标', link: '/nodejs/memory/standard' },
                        { text: '内存泄漏', link: '/nodejs/memory/error' },
                        { text: '处理大文件', link: '/nodejs/memory/big' }
                    ]
                },
                {
                    text: 'Express',
                    collapsed: true,

                    items: [
                        { text: 'Express简介', link: '/nodejs/express/introduce' },
                        { text: '快速开始', link: '/nodejs/express/fastuse' }
                    ]
                }
            ],
            '/linux/': [
                {
                    text: 'Bash命令',
                    collapsed: true,

                    items: [
                        { text: '基础命令', link: '/linux/bash/basic' },
                        { text: '常用命令', link: '/linux/bash/advanced' },
                        { text: '环境变量', link: '/linux/bash/env' },
                        { text: '文件权限', link: '/linux/bash/permissions' },
                        { text: '文件系统', link: '/linux/bash/filesys' },
                        { text: '路由配置', link: '/linux/bash/route' }
                    ]
                },
                {
                    text: 'Shell脚本',
                    collapsed: true,

                    items: [
                        { text: '基础语法', link: '/linux/shell/basic' },
                        { text: '结构化语法(上)', link: '/linux/shell/structure1' },
                        { text: '结构化语法(下)', link: '/linux/shell/structure2' },
                        { text: '输入处理', link: '/linux/shell/input' },
                        { text: '数据呈现', link: '/linux/shell/data' },
                        { text: '脚本控制', link: '/linux/shell/control' },
                        { text: '函数创建', link: '/linux/shell/function' },
                        { text: '文本处理', link: '/linux/shell/text' },
                        { text: '正则表达式', link: '/linux/shell/reg' },
                        { text: 'Sed高级用法', link: '/linux/shell/sed' },
                        { text: 'Gawk高级用法', link: '/linux/shell/gawk' },
                        { text: '应用示例', link: '/linux/shell/sample' }
                    ]
                },
                {
                    text: '应用实例',
                    collapsed: true,

                    items: [
                        { text: 'CentOS', link: '/linux/instance/centos' },
                        { text: 'Ubuntu', link: '/linux/instance/ubuntu' },
                        { text: 'Debian', link: '/linux/instance/debian' },
                        { text: '局域网唤醒', link: '/linux/instance/wol' },
                        { text: 'WOL唤醒脚本', link: '/linux/instance/wolshell' },
                        { text: '服务自启动', link: '/linux/instance/systemctl' },
                        { text: '硬盘分区', link: '/linux/instance/partition' },
                        { text: '逻辑卷管理', link: '/linux/instance/lvm' },
                        { text: '文本过滤', link: '/linux/instance/filter' },
                        { text: '密钥登录', link: '/linux/instance/keylogin' }
                    ]
                },
                {
                    text: '虚机平台',
                    collapsed: true,

                    items: [
                        {
                            text: 'Multipass',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/linux/vm/multipass/multipass' },
                                { text: '快速开始', link: '/linux/vm/multipass/multipassuse' }
                            ]
                        },
                        {
                            text: 'WSL',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/linux/vm/wsl/wsl' },
                                { text: '环境安装', link: '/linux/vm/wsl/wslinstall' },
                                { text: '基本使用', link: '/linux/vm/wsl/wsluse' }
                            ]
                        },
                        {
                            text: 'Proxmox VE',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/linux/vm/proxmoxve/proxmoxve' },
                                { text: '系统安装', link: '/linux/vm/proxmoxve/veinstall' },
                                { text: '配置优化', link: '/linux/vm/proxmoxve/veoptimize' },
                                { text: '系统管理', link: '/linux/vm/proxmoxve/vemanage' },
                                { text: '虚机安装', link: '/linux/vm/proxmoxve/vminstall' },
                                { text: '虚机管理', link: '/linux/vm/proxmoxve/vmmanage' },
                                { text: '硬件直通', link: '/linux/vm/proxmoxve/pcie' }
                            ]
                        }
                    ]
                },
                {
                    text: '容器技术',
                    collapsed: true,

                    items: [
                    ]
                },
                {
                    text: '容器编排',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/linux/management/kubernetes' },
                        { text: '系统架构', link: '/linux/management/arch' },
                        { text: 'Minikube', link: '/linux/management/minikube' },
                        { text: 'K3s', link: '/linux/management/k3s' },
                        { text: '集群搭建', link: '/linux/management/build' },
                        { text: '管理工具', link: '/linux/management/kubectl' },
                        { text: '资源编排', link: '/linux/management/layout' },
                        { text: '命名空间', link: '/linux/management/namespace' },
                        { text: 'Pod', link: '/linux/management/pod' },
                        { text: '资源调度', link: '/linux/management/scheduler' },
                        { text: '工作负载资源', link: '/linux/management/resource' },
                        { text: 'ReplicaSet', link: '/linux/management/replicaset' },
                        { text: 'Deployment', link: '/linux/management/deployment' },
                        { text: 'HorizontalPodAutoscaler', link: '/linux/management/hpa' },
                        { text: 'DaemonSet', link: '/linux/management/daemonset' },
                        { text: 'Job', link: '/linux/management/job' },
                        { text: 'CronJob', link: '/linux/management/cronjob' },
                        { text: 'Service', link: '/linux/management/service' },
                        { text: 'Ingress', link: '/linux/management/ingress' },
                        { text: '临时存储', link: '/linux/management/ephemeral' },
                        { text: '持久存储', link: '/linux/management/persistent' },
                        { text: '配置存储', link: '/linux/management/configstorage' },
                        { text: '安全认证', link: '/linux/management/security' },
                        { text: 'Dashboard', link: '/linux/management/dashboard' },
                        { text: 'Helm', link: '/linux/management/helm' }
                    ]
                },
                {
                    text: '异地组网',
                    collapsed: true,

                    items: [
                        {
                            text: '组网工具',
                            collapsed: true,

                            items: [
                                { text: 'VPN', link: '/linux/nat/vpn' },
                                { text: 'Shadowsocks', link: '/linux/nat/ss' },
                                { text: 'Frp', link: '/linux/nat/frp' },
                                { text: 'SoftEtherVPN', link: '/linux/nat/softether' },
                                { text: 'Tailscale', link: '/linux/nat/tailscale' },
                                { text: 'Headscale', link: '/linux/nat/headscale' },
                                { text: 'Derper', link: '/linux/nat/derper' }
                            ]
                        },
                        {
                            text: 'NAT穿透',
                            collapsed: true,

                            items: [
                                { text: 'NAT - 网络地址转换', link: '/linux/nat/nat' },
                                { text: 'NAT 穿透是如何工作的：技术原理及企业级实践（Tailscale）', link: '/linux/nat/nat-traversal' },
                                { text: '基于角色的访问控制（RBAC）：演进历史、设计理念及简洁实现（Tailscale）', link: '/linux/nat/tailscale-rbac' },
                                { text: '家庭网络NAT优化', link: '/linux/nat/nat-optimize' }
                            ]
                        },
                        {
                            text: '组网方案',
                            collapsed: true,

                            items: [
                                { text: 'SoftEther + Frp', link: '/linux/nat/softfrp' }
                            ]
                        }
                    ]
                },
                {
                    text: '智能家居',
                    collapsed: true,

                    items: [
                        {
                            text: '家庭自动化',
                            collapsed: true,

                            items: [
                                { text: 'HomeAssistant', link: '/linux/nas/ha/ha' },
                                { text: 'HACS', link: '/linux/nas/ha/hacs' }
                            ]
                        },
                        {
                            text: '密码管理',
                            collapsed: true,

                            items: [
                                { text: 'Vaultwarden', link: '/linux/nas/pwd/vaultwarden' },
                                { text: 'VaultwardenBackup', link: '/linux/nas/pwd/vaultwarden-backup' }
                            ]
                        },
                        {
                            text: '文件共享',
                            collapsed: true,

                            items: [
                                { text: 'FTP', link: '/linux/nas/share/ftp' },
                                { text: 'NFS', link: '/linux/nas/share/nfs' }
                            ]
                        },
                        {
                            text: '私服搭建',
                            collapsed: true,

                            items: [
                                { text: '基本概述', link: '/linux/nas/dnf/overview' },
                                { text: '私服搭建', link: '/linux/nas/dnf/build' },
                                { text: '网页GM搭建', link: '/linux/nas/dnf/gm' }
                            ]
                        }
                    ]
                },
                {
                    text: '问题总结',
                    collapsed: true,

                    items: [
                        { text: 'Docker权限异常(Permission denied)', link: '/linux/issues/001' },
                        { text: 'Centos启动网络服务异常', link: '/linux/issues/002' },
                        { text: 'Ubuntu配置禁止密码登录无效', link: '/linux/issues/003' },
                        { text: 'Linux Too many open files 报错', link: '/linux/issues/004' }
                    ]
                }
            ],
            '/chain/': [
                {
                    text: '区块链基础',
                    collapsed: true,

                    items: [
                    ]
                },
                {
                    text: '共识算法',
                    collapsed: true,

                    items: [
                    ]
                },
                {
                    text: 'Ethereum',
                    collapsed: true,

                    items: [
                        {
                            text: 'Basic',
                            collapsed: true,

                            items: [
                                { text: '什么是以太坊', link: '/chain/eth/basic/introduce' },
                                { text: '以太坊架构', link: '/chain/eth/basic/architecture' },
                                { text: '什么是DApp', link: '/chain/eth/basic/dapp' },
                                { text: '区块的定义', link: '/chain/eth/basic/block' },
                                { text: '以太坊地址', link: '/chain/eth/basic/address' },
                                { text: 'Nonce的作用', link: '/chain/eth/basic/nonce' },
                                { text: 'Gas燃料费', link: '/chain/eth/basic/gas' },
                                { text: '叔块', link: '/chain/eth/basic/uncle' },
                                { text: '挖矿奖励', link: '/chain/eth/basic/award' },
                                { text: '数据结构', link: '/chain/eth/basic/data' },
                                { text: 'MPT树', link: '/chain/eth/basic/mpt' },
                                { text: '账户模型', link: '/chain/eth/basic/accountmodle' },
                                { text: 'Ghost协议', link: '/chain/eth/basic/ghost' },
                                { text: 'Casper共识机制', link: '/chain/eth/basic/casper' },
                                { text: '智能合约', link: '/chain/eth/basic/contract' },
                                { text: '合约标准', link: '/chain/eth/basic/standard' },
                                { text: '以太坊交易', link: '/chain/eth/basic/transction' },
                                { text: '代币', link: '/chain/eth/basic/token' },
                                { text: '以太坊零地址', link: '/chain/eth/basic/zero' }
                            ]
                        },
                        {
                            text: 'Operate',
                            collapsed: true,

                            items: [
                            ]
                        }
                    ]
                },
                {
                    text: 'Eosio',
                    collapsed: true,

                    items: [
                        {
                            text: 'Basic',
                            collapsed: true,

                            items: [
                                { text: '基本介绍', link: '/chain/eosio/basic/introduce' },
                                { text: '共识机制(BFT-DPoS)', link: '/chain/eosio/basic/bftdpos' },
                                { text: '账户体系', link: '/chain/eosio/basic/account' },
                                { text: '网络资源', link: '/chain/eosio/basic/netresource' },
                                { text: '节点治理', link: '/chain/eosio/basic/governance' },
                                { text: '脚本与虚拟机', link: '/chain/eosio/basic/vm' }
                            ]
                        },
                        {
                            text: 'Operate',
                            collapsed: true,

                            items: [
                                { text: '快速开始', link: '/chain/eosio/operate/start' },
                                { text: '源码编译', link: '/chain/eosio/operate/source' },
                                { text: '多节点环境部署', link: '/chain/eosio/operate/multi' },
                                { text: 'RPC接口上链', link: '/chain/eosio/operate/rpc' },
                                { text: '账户体系', link: '/chain/eosio/operate/access' },
                                { text: 'History-Tools', link: '/chain/eosio/operate/history' }
                            ]
                        }
                    ]
                },
                {
                    text: 'Fabric',
                    collapsed: true,

                    items: [
                        {
                            text: 'Basic',
                            collapsed: true,

                            items: [
                                { text: '架构概览', link: '/chain/fabric/basic/architecture' },
                                { text: '核心概念与组件', link: '/chain/fabric/basic/component' },
                                { text: 'Raft共识算法', link: '/chain/fabric/basic/raft' },
                                { text: '消息协议', link: '/chain/fabric/basic/message' },
                                { text: '数据传播协议', link: '/chain/fabric/basic/gossip' },
                                { text: '访问控制', link: '/chain/fabric/basic/access' },
                                { text: '隐私保护', link: '/chain/fabric/basic/privacy' },
                                { text: '读写集语义', link: '/chain/fabric/basic/semantics' },
                                { text: '网络发现', link: '/chain/fabric/basic/discover' },
                                { text: '管理链码', link: '/chain/fabric/basic/lifecycle' },
                                { text: '读写集语义', link: '/chain/fabric/basic/semantics' },
                                { text: '配置解析—组织身份文件', link: '/chain/fabric/basic/config1' },
                                { text: '配置解析—通道配置文件', link: '/chain/fabric/basic/config2' },
                                { text: '配置解析—Order配置文件', link: '/chain/fabric/basic/config3' },
                                { text: '配置解析—Peer配置文件', link: '/chain/fabric/basic/config4' },
                                { text: '链码开发', link: '/chain/fabric/basic/dev' }
                            ]
                        },
                        {
                            text: 'Operate',
                            collapsed: true,

                            items: [
                                { text: 'Fabric 1.4.6 环境搭建', link: '/chain/fabric/operate/build1' },
                                { text: 'Fabric 1.4.6 多机部署', link: '/chain/fabric/operate/multi1' },
                                { text: 'Fabric 2.2.5 环境搭建', link: '/chain/fabric/operate/build2' },
                                { text: 'Fabric 2.2.5 多机部署', link: '/chain/fabric/operate/multi2' },
                                { text: 'Fabric 1.4.6 链码操作', link: '/chain/fabric/operate/chaincode1' },
                                { text: 'Fabric 2.4.7 链码操作', link: '/chain/fabric/operate/chaincode2' },
                                { text: '生产网络—生成身份文件', link: '/chain/fabric/operate/production1' },
                                { text: '生产网络—部署 Orderer 节点', link: '/chain/fabric/operate/production2' },
                                { text: '生产网络—部署 Peer 节点', link: '/chain/fabric/operate/production3' },
                                { text: '生产网络—部署合约并调用', link: '/chain/fabric/operate/production4' }
                            ]
                        }
                    ]
                },
                {
                    text: '其他',
                    collapsed: true,

                    items: [
                        { text: 'Hyperledger-Caliper', link: '/chain/other/caliper' }
                    ]
                }
            ],
            '/dev/': [
                {
                    text: 'Git',
                    collapsed: true,

                    items: [
                        { text: '基础概念', link: '/dev/git/basic' },
                        { text: '常用操作', link: '/dev/git/opt' },
                        { text: '操作文件', link: '/dev/git/file' },
                        { text: '操作分支', link: '/dev/git/branch' },
                        { text: '操作历史', link: '/dev/git/history' },
                        { text: '远程版本库操作', link: '/dev/git/remote' },
                        { text: '更多操作', link: '/dev/git/more' },
                        { text: '应用示例', link: '/dev/git/instance' }
                    ]
                },
                {
                    text: 'GitLab',
                    collapsed: true,

                    items: [
                        { text: '环境搭建', link: '/dev/gitlab/envbuild' },
                        { text: '备份恢复', link: '/dev/gitlab/backup' },
                        { text: '版本升级', link: '/dev/gitlab/upgrade' },
                        { text: '系统优化', link: '/dev/gitlab/set' },
                        { text: '系统迁移升级问题', link: '/dev/gitlab/problem' }
                    ]
                },
                {
                    text: 'MySQL',
                    collapsed: true,

                    items: [
                        { text: '基础概述', link: '/dev/mysql/basic' },
                        { text: '数据定义语言', link: '/dev/mysql/ddl' },
                        { text: '数据操作语言', link: '/dev/mysql/dml' },
                        { text: '数据查询语言', link: '/dev/mysql/dql' },
                        { text: '数据控制语言', link: '/dev/mysql/dcl' },
                        { text: '常用函数', link: '/dev/mysql/function' },
                        { text: '常用约束', link: '/dev/mysql/constraint' },
                        { text: '多表查询', link: '/dev/mysql/multi' },
                        { text: '事务操作', link: '/dev/mysql/transaction' },
                        { text: '存储引擎', link: '/dev/mysql/engine' },
                        { text: '索引概述', link: '/dev/mysql/indexes' },
                        { text: '索引结构', link: '/dev/mysql/structure' },
                        { text: '索引语法', link: '/dev/mysql/grammar' },
                        { text: '索引失效', link: '/dev/mysql/invalid' },
                        { text: '索引使用', link: '/dev/mysql/use' },
                        { text: '性能分析', link: '/dev/mysql/profile' },
                        { text: 'SQL优化', link: '/dev/mysql/sqloptimization' },
                        { text: '视图', link: '/dev/mysql/view' },
                        { text: '存储过程', link: '/dev/mysql/stored' },
                        { text: '过程语法', link: '/dev/mysql/storedgrammar' },
                        { text: '游标', link: '/dev/mysql/cursor' },
                        { text: '存储函数', link: '/dev/mysql/storedfunction' },
                        { text: '触发器', link: '/dev/mysql/trigger' },
                        { text: '全局锁', link: '/dev/mysql/globallock' },
                        { text: '表级锁', link: '/dev/mysql/tablelock' },
                        { text: '行级锁', link: '/dev/mysql/linelock' }
                    ]
                },
                {
                    text: 'Kafka',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/dev/kafka/basic' },
                        { text: '环境搭建', link: '/dev/kafka/operate' },
                        { text: '生产消息', link: '/dev/kafka/producer' },
                        { text: '消息存储', link: '/dev/kafka/storage' },
                        { text: '消息同步', link: '/dev/kafka/sync' },
                        { text: '消费消息', link: '/dev/kafka/consumer' },
                        { text: '核心机制', link: '/dev/kafka/core' },
                        { text: '性能优化', link: '/dev/kafka/optimize' }
                    ]
                }
            ]
        },
        // 在导航栏中展示带有图标的社交帐户链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/taketo4513' }
        ],
        // 本地搜索
        search: {
            provider: 'local'
        },
        // 页脚配置
        footer: {
            message: 'TakeTo | <a href="https://beian.miit.gov.cn/" target="_blank">ICP备2022037467号</a> | <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32081202000334">公网安备 32081202000334号</a>',
        }
    },
    // 图片懒加载
    markdown: {
        image: {
          // 默认禁用图片懒加载
          lazyLoading: true
        }
    },
    // 链接检查
    ignoreDeadLinks: true
})
