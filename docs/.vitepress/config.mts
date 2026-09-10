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
                        text: '核心概念',
                        items: [
                            { text: '模型基础', link: '/ai/basic/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '框架生态',
                        items: [
                            { text: 'LangChain', link: '/ai/langchain/index' },
                            { text: 'LangGraph', link: '/ai/langgraph/index' },
                            { text: 'SpringAI', link: '/ai/springai/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '工程实践',
                        items: [
                            { text: 'Vibecoding', link: '/ai/vibecoding/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Java',
                items: [
                    {
                        // 该部分的标题
                        text: '语言核心',
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
                        text: '框架生态',
                        items: [
                            { text: 'Spring', link: '/java/spring/index' },
                            // { text: 'MyBatis', link: '/java/batis/index' },
                            { text: 'Cloud', link: '/java/cloud/index' },
                            { text: '日志框架', link: '/java/log/index' },
                            { text: '认证授权', link: '/java/permission/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '工程实践',
                        items: [
                            { text: '分库分表', link: '/java/sharding/index' },
                            { text: '程序构建', link: '/java/build/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Python',
                items: [
                    {
                        // 该部分的标题
                        text: '语言核心',
                        items: [
                            { text: '基础语法', link: '/python/basic/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Go',
                items: [
                    {
                        // 该部分的标题
                        text: '语言核心',
                        items: [
                            { text: '基础语法', link: '/go/basic/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Nodejs',
                items: [
                    {
                        // 该部分的标题
                        text: '语言核心',
                        items: [
                            { text: '基础语法', link: '/nodejs/basic/index' },
                            { text: '模块机制', link: '/nodejs/moudle/index' },
                            { text: '异步编程', link: '/nodejs/async/index' },
                            { text: '内存控制', link: '/nodejs/memory/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '框架生态',
                        items: [
                            { text: 'Express', link: '/nodejs/express/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Page',
                items: [
                    {
                        // 该部分的标题
                        text: '语言核心',
                        items: [
                            { text: 'HTML', link: '/page/html/index' },
                            { text: 'CSS', link: '/page/css/index' },
                            { text: '基础语法', link: '/page/basic/index' },
                            { text: '深入理解', link: '/page/advance/index' },
                            { text: '异步编程', link: '/page/async/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '框架生态',
                        items: [
                            { text: 'Vue2', link: '/page/vue2/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '工程实践',
                        items: [
                            { text: '性能调优', link: '/page/perf/index' }
                        ]
                    }
                ]
            },
            {
                text: 'Linux',
                items: [
                    {
                        // 该部分的标题
                        text: '命令基础',
                        items: [
                            { text: 'Bash命令', link: '/linux/bash/index' },
                            { text: 'Shell脚本', link: '/linux/shell/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '平台生态',
                        items: [
                            { text: '虚机平台', link: '/linux/vm/index' },
                            { text: '容器技术', link: '/linux/container/index' },
                            { text: '容器编排', link: '/linux/management/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '运维实践',
                        items: [
                            { text: '应用实例', link: '/linux/instance/index' },
                            { text: '异地组网', link: '/linux/nat/index' },
                            { text: '智能家居', link: '/linux/nas/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '排错速查',
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
                        text: '原理基础',
                        items: [
                            { text: '区块链基础', link: '/chain/basic/index' },
                            { text: '共识算法', link: '/chain/consensus/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '平台生态',
                        items: [
                            { text: 'Ethereum', link: '/chain/eth/index' },
                            { text: 'Eosio', link: '/chain/eosio/index' },
                            { text: 'Fabric', link: '/chain/fabric/index' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '工具链',
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
                    { text: '网页导航', link: '/share/01-navigation' },
                ]
            }
        ],
        // 侧边栏配置
        sidebar: {
            '/ai/': [
                {
                    text: 'Vibecoding',
                    collapsed: true,

                    items: [
                        { text: '课程介绍与环境准备', link: '/ai/vibecoding/00-课程介绍与环境准备' },
                        { text: 'AI编程基础理论', link: '/ai/vibecoding/01-AI编程基础理论' },
                        { text: 'AI编程工具生态', link: '/ai/vibecoding/02-AI编程工具生态' },
                        { text: 'ClaudeCode深度使用与进阶技巧', link: '/ai/vibecoding/03-ClaudeCode深度使用与进阶技巧' },
                        { text: 'AI技能系统Skills', link: '/ai/vibecoding/04-AI技能系统Skills' },
                        { text: '完整项目案例实操', link: '/ai/vibecoding/05-完整项目案例实操' },
                        { text: '项目实战独立完成', link: '/ai/vibecoding/06-项目实战独立完成' },
                        { text: 'CodexDesktop', link: '/ai/vibecoding/07-CodexDesktop' },
                        { text: '附录', link: '/ai/vibecoding/08-附录' }
                    ]
                },
                {
                    text: 'LangChain',
                    collapsed: true,

                    items: [
                        { text: 'LangChain概述', link: '/ai/langchain/01-LangChain概述' },
                        { text: '模型的创建与调用', link: '/ai/langchain/02-模型的创建与调用' },
                        { text: 'LangSmith的使用', link: '/ai/langchain/03-LangSmith的使用' },
                        { text: 'Message与提示词模板', link: '/ai/langchain/04-Message与提示词模板' },
                        { text: 'Tools', link: '/ai/langchain/05-Tools' },
                        { text: '结构化输出', link: '/ai/langchain/06-结构化输出' },
                        { text: '智能体', link: '/ai/langchain/07-智能体' },
                        { text: '中间件', link: '/ai/langchain/08-中间件' },
                        { text: '上下文与记忆', link: '/ai/langchain/09-上下文与记忆' },
                        { text: 'RAG', link: '/ai/langchain/10-RAG' }
                    ]
                },
                {
                    text: 'LangGraph',
                    collapsed: true,

                    items: [
                        { text: '环境配置', link: '/ai/langgraph/00-环境配置' },
                        { text: 'LangGraph基础入门', link: '/ai/langgraph/01-LangGraph基础入门' },
                        { text: 'LangGraph控制流与节点执行', link: '/ai/langgraph/02-LangGraph控制流与节点执行' },
                        { text: 'LangGraph持久化与记忆管理', link: '/ai/langgraph/03-LangGraph持久化与记忆管理' },
                        { text: 'LangGraph中断与工具与部署', link: '/ai/langgraph/04-LangGraph中断与工具与部署' },
                        { text: 'LangGraph高级特性', link: '/ai/langgraph/05-LangGraph高级特性' }
                    ]
                },
                {
                    text: 'SpringAI',
                    collapsed: true,

                    items: [
                        { text: 'Spring AI介绍', link: '/ai/springai/01-introduce' },
                        { text: 'Models 模型', link: '/ai/springai/02-models' }
                    ]
                },
                {
                    text: '概念',
                    collapsed: true,

                    items: [
                        { text: 'AI 概念', link: '/ai/basic/01-concepts' }
                    ]
                }
            ],
            // 当用户位于 `java` 目录时，会显示此侧边栏
            '/java/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/basic/01-introduce' },
                        { text: '数据类型', link: '/java/basic/02-data' },
                        { text: 'String', link: '/java/basic/03-string' },
                        { text: '运算符', link: '/java/basic/04-operator' },
                        { text: '流程控制', link: '/java/basic/05-controller' },
                        { text: '面向对象', link: '/java/basic/06-objectoriented' },
                        { text: '面向对象特性', link: '/java/basic/07-objectfeature' },
                        { text: '关键字', link: '/java/basic/08-keys' },
                        { text: 'Object', link: '/java/basic/09-object' },
                        { text: '枚举', link: '/java/basic/10-enumerate' },
                        { text: '接口', link: '/java/basic/11-interface' },
                        { text: '内部类', link: '/java/basic/12-innerclass' },
                        { text: '泛型', link: '/java/basic/13-generics' },
                        { text: '异常', link: '/java/basic/14-error' },
                        { text: '反射', link: '/java/basic/15-reflection' },
                        { text: '注解', link: '/java/basic/16-annotation' }
                    ]
                },
                {
                    text: '集合框架',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/container/01-introduce' },
                        { text: 'ArrayList', link: '/java/container/02-arrayList' },
                        { text: 'LinkedList', link: '/java/container/03-linkedlist' },
                        { text: 'HashSet', link: '/java/container/04-hashset' },
                        { text: 'LinkedHashSet', link: '/java/container/05-linkedhashset' },
                        { text: 'TreeSet', link: '/java/container/06-treeset' },
                        { text: 'EnumSet', link: '/java/container/07-enumset' },
                        { text: 'HashMap', link: '/java/container/08-hashmap' },
                        { text: 'TreeMap', link: '/java/container/09-treemap' },
                        { text: 'WeakHashMap', link: '/java/container/10-weakhashmap' },
                        { text: 'LinkedHashMap', link: '/java/container/11-linkedhashmap' },
                        { text: 'IdentityHashMap', link: '/java/container/12-identityhashmap' },
                        { text: 'EnumMap', link: '/java/container/13-enummap' },
                        { text: 'PriorityQueue', link: '/java/container/14-priorityqueue' },
                        { text: 'ArrayDeque', link: '/java/container/15-arraydeque' },
                        { text: 'Vector', link: '/java/container/16-vector' },
                        { text: 'Stack', link: '/java/container/17-stack' },
                        { text: 'Hashtable', link: '/java/container/18-hashtable' },
                        { text: 'CopyOnWriteArrayList', link: '/java/container/19-copyonwritearraylist' },
                        { text: 'ConcurrentSkipListMap', link: '/java/container/20-concurrentskiplistmap' },
                        { text: 'ConcurrentSkipListSet', link: '/java/container/21-concurrentskiplistset' },
                        { text: 'CopyOnWriteArraySet', link: '/java/container/22-copyonwritearrayset' },
                        { text: 'LinkedBlockingDeque', link: '/java/container/23-linkedblockingdeque' },
                        { text: 'ArrayBlockingQueue', link: '/java/container/24-arrayblockingqueue' },
                        { text: 'LinkedBlockingQueue', link: '/java/container/25-linkedblockingqueue' },
                        { text: 'SynchronousQueue', link: '/java/container/26-synchronousqueue' },
                        { text: 'LinkedTransferQueue', link: '/java/container/27-linkedtransferqueue' },
                        { text: 'PriorityBlockingQueue', link: '/java/container/28-priorityblockingqueue' },
                        { text: 'DelayQueue', link: '/java/container/29-delayqueue' },
                        { text: 'ConcurrentLinkedQueue', link: '/java/container/30-concurrentlinkedqueue' },
                        { text: 'Iterator', link: '/java/container/31-iterator' },
                        { text: 'Enumeration', link: '/java/container/32-enumeration' },
                        { text: 'Fail-fast', link: '/java/container/33-failfast' },
                        { text: 'Sort', link: '/java/container/34-sort' }
                    ]
                },
                {
                    text: '并发编程',
                    collapsed: true,

                    items: [
                        { text: '基础概念', link: '/java/concurrent/01-basic' },
                        { text: 'Java线程', link: '/java/concurrent/02-thread' },
                        { text: '线程安全', link: '/java/concurrent/03-secure' },
                        { text: '线程状态', link: '/java/concurrent/04-status' },
                        { text: 'Synchronized', link: '/java/concurrent/05-synchronized' },
                        { text: 'ReentrantLock', link: '/java/concurrent/06-reentrantlock' },
                        { text: '内存模型', link: '/java/concurrent/07-memorymodel' },
                        { text: 'Volatile', link: '/java/concurrent/08-volatile' },
                        { text: 'CompareAndSwap', link: '/java/concurrent/09-cas' },
                        { text: '并发工具类', link: '/java/concurrent/10-util' },
                        { text: 'LongAdder源码', link: '/java/concurrent/11-longadder' },
                        { text: 'Unsafe', link: '/java/concurrent/12-unsafe' },
                        { text: '不可变设计', link: '/java/concurrent/13-final' },
                        { text: 'ThreadLocal', link: '/java/concurrent/14-threadlocal' },
                        { text: '阻塞队列', link: '/java/concurrent/15-queue' },
                        { text: '非阻塞队列', link: '/java/concurrent/16-noblocking' },
                        { text: '线程池使用', link: '/java/concurrent/17-pool' },
                        { text: '线程池原理', link: '/java/concurrent/18-principle' },
                        { text: '线程池调度', link: '/java/concurrent/19-scheduled' },
                        { text: '多线程任务拆分', link: '/java/concurrent/20-forkjoin' },
                        { text: 'AQS', link: '/java/concurrent/21-aqs' },
                        { text: 'ReentrantLock原理', link: '/java/concurrent/22-relock' },
                        { text: 'ReadWrite', link: '/java/concurrent/23-readwrite' },
                        { text: 'CountDown', link: '/java/concurrent/24-countdown' },
                        { text: 'CyclicBarrier', link: '/java/concurrent/25-cyclicbarrier' },
                        { text: 'Semaphore', link: '/java/concurrent/26-semaphore' },
                        { text: 'Exchanger', link: '/java/concurrent/27-exchanger' }
                    ]
                },
                {
                    text: '读写操作',
                    collapsed: true,

                    items: [
                        { text: '磁盘操作', link: '/java/io/01-file' },
                        { text: '字节操作', link: '/java/io/02-byte' },
                        { text: '字符操作', link: '/java/io/03-char' },
                        { text: '对象操作', link: '/java/io/04-obj' }
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
                                { text: '简介概览', link: '/java/spring/spring/01-introduce' },
                                { text: '快速开始', link: '/java/spring/spring/02-faststart' },
                                { text: '控制反转', link: '/java/spring/spring/03-ioc' },
                                { text: 'SpringBean', link: '/java/spring/spring/04-bean' },
                                { text: '基于XML管理Bean', link: '/java/spring/spring/05-xml' },
                                { text: '基于注解管理Bean', link: '/java/spring/spring/06-anno' },
                                { text: 'SpringJDBC', link: '/java/spring/spring/07-jdbc' },
                                { text: 'Spring事务', link: '/java/spring/spring/08-transaction' },
                                { text: 'SpringResources', link: '/java/spring/spring/09-resources' },
                                { text: 'SpringI18n', link: '/java/spring/spring/10-i18n' },
                                { text: '参数校验', link: '/java/spring/spring/11-validator' },
                                { text: '提前编译', link: '/java/spring/spring/12-aot' }
                            ]
                        },
                        {
                            text: 'SpringMVC',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/spring/mvc/01-introduce' },
                                { text: '快速开始', link: '/java/spring/mvc/02-faststart' },
                                { text: '请求参数', link: '/java/spring/mvc/03-request' },
                                { text: '响应数据', link: '/java/spring/mvc/04-response' },
                                { text: 'RestFul', link: '/java/spring/mvc/05-restful' },
                                { text: '异常处理', link: '/java/spring/mvc/06-exception' },
                                { text: '拦截器', link: '/java/spring/mvc/07-interceptor' },
                                { text: '参数校验', link: '/java/spring/mvc/08-validator' }
                            ]
                        },
                        {
                            text: 'SpringBoot',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/spring/boot/01-introduce' },
                                { text: '快速开始', link: '/java/spring/boot/02-faststart' },
                                { text: '配置文件', link: '/java/spring/boot/03-config' },
                                { text: '项目构建', link: '/java/spring/boot/04-build' },
                                { text: '整合MVC', link: '/java/spring/boot/05-mvc' }
                            ]
                        }
                    ]
                },
                {
                    text: 'Spring Cloud',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/cloud/01-introduce' },
                        { text: '服务拆分', link: '/java/cloud/02-split' },
                        { text: '服务调用', link: '/java/cloud/03-call' },
                        { text: '注册中心', link: '/java/cloud/04-center' },
                        { text: 'Nacos', link: '/java/cloud/05-nacos' },
                        { text: 'OpenFeign', link: '/java/cloud/06-feign' },
                        { text: '网关路由', link: '/java/cloud/07-gateway' },
                        { text: '服务保护', link: '/java/cloud/08-security' },
                        { text: 'Sentinel', link: '/java/cloud/09-sentinel' }
                    ]
                },
                {
                    text: '日志框架',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/java/log/01-introduce' },
                        { text: 'Log4j', link: '/java/log/02-log4j' },
                        { text: 'SLF4J', link: '/java/log/03-slf4j' },
                        { text: 'Logback', link: '/java/log/04-logback' },
                        { text: 'Log4j2', link: '/java/log/05-log4j2' },
                        { text: '应用实例', link: '/java/log/06-demo' }
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
                                { text: '简介概览', link: '/java/permission/apacheshiro/01-introduce' },
                                { text: '访问控制', link: '/java/permission/apacheshiro/02-access' },
                                { text: '重要的类与方法', link: '/java/permission/apacheshiro/03-class' },
                                { text: '过滤器', link: '/java/permission/apacheshiro/04-filter' },
                                { text: 'Shiro整合JWT', link: '/java/permission/apacheshiro/05-jwt' }
                            ]
                        },
                        {
                            text: 'SpringSecurity',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/permission/springsecurity/01-introduce' },
                                { text: '整体架构', link: '/java/permission/springsecurity/02-architecture' }
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
                                { text: '简介概览', link: '/java/build/maven/01-introduce' },
                                { text: '快速开始', link: '/java/build/maven/02-faststart' },
                                { text: '依赖管理', link: '/java/build/maven/03-manage' },
                                { text: '依赖传递与冲突', link: '/java/build/maven/04-conflict' },
                                { text: '工程继承与聚合', link: '/java/build/maven/05-extend' }
                            ]
                        },
                        {
                            text: 'Gradle',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/java/build/gradle/01-introduce' },
                                { text: '快速开始', link: '/java/build/gradle/02-faststart' },
                                { text: 'GradleWrapper', link: '/java/build/gradle/03-wrapper' },
                                { text: 'Groovy', link: '/java/build/gradle/04-groovy' },
                                { text: '生命周期', link: '/java/build/gradle/05-cycle' },
                                { text: 'Task', link: '/java/build/gradle/06-task' },
                                { text: '配置解析', link: '/java/build/gradle/07-config' },
                                { text: '文件操作', link: '/java/build/gradle/08-file' },
                                { text: 'Dependencies', link: '/java/build/gradle/09-depend' },
                                { text: 'Plugin', link: '/java/build/gradle/10-plugin' }
                            ]
                        },
                    ]
                }
            ],
            '/python/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '必备基础知识', link: '/python/basic/01-必备基础知识' },
                        { text: '初识Python', link: '/python/basic/02-初识Python' },
                        { text: 'Python核心基础', link: '/python/basic/03-Python核心基础' },
                        { text: '流程控制语句', link: '/python/basic/04-流程控制语句' },
                        { text: '函数入门', link: '/python/basic/05-函数入门' },
                        { text: '数据容器', link: '/python/basic/06-数据容器' },
                        { text: '面向对象', link: '/python/basic/07-面向对象' },
                        { text: '函数进阶', link: '/python/basic/08-函数进阶' },
                        { text: '错误与异常', link: '/python/basic/09-错误与异常' },
                        { text: '模块与包', link: '/python/basic/10-模块与包' },
                        { text: '迭代器vs生成器', link: '/python/basic/11-迭代器vs生成器' },
                        { text: '文件操作', link: '/python/basic/12-文件操作' },
                        { text: '进程与线程', link: '/python/basic/13-进程与线程' },
                        { text: '协程', link: '/python/basic/14-协程' }
                    ]
                }
            ],
            '/go/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/go/basic/01-introduce' },
                        { text: '语言特性', link: '/go/basic/02-feature' },
                        { text: '关键字及标识符', link: '/go/basic/03-package' },
                        { text: '包管理工具', link: '/go/basic/08-operator' },
                        { text: '基本结构', link: '/go/basic/05-structure' },
                        { text: '常量和变量', link: '/go/basic/06-constandvar' },
                        { text: '数据类型', link: '/go/basic/07-type' },
                        { text: '运算符', link: '/go/basic/08-operator' },
                        { text: '控制结构', link: '/go/basic/09-control' },
                        { text: '函数', link: '/go/basic/10-function' },
                        { text: '闭包', link: '/go/basic/11-closure' },
                        { text: '数组', link: '/go/basic/12-array' }
                    ]
                }
            ],
            '/nodejs/': [
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: 'Node简介', link: '/nodejs/basic/01-introduce' },
                        { text: 'Node特点', link: '/nodejs/basic/02-features' },
                        { text: 'Node模块', link: '/nodejs/basic/03-moudle' },
                        { text: 'NPM使用', link: '/nodejs/basic/04-usenpm' },
                        { text: 'Path模块', link: '/nodejs/basic/05-path' },
                        { text: 'Fs模块', link: '/nodejs/basic/06-fs' },
                        { text: 'Stream模块', link: '/nodejs/basic/07-stream' },
                        { text: 'Buffer模块', link: '/nodejs/basic/08-buf' },
                        { text: 'Buffer探究', link: '/nodejs/basic/09-buffer' },
                        { text: 'Event模块', link: '/nodejs/basic/10-event' },
                        { text: 'Event源码', link: '/nodejs/basic/11-source' },
                        { text: '事件循环', link: '/nodejs/basic/12-eventloop' },
                        { text: '进程与线程', link: '/nodejs/basic/13-process' },
                        { text: '多进程使用', link: '/nodejs/basic/14-useprocess' }
                    ]
                },
                {
                    text: '模块机制',
                    collapsed: true,

                    items: [
                        { text: 'CommonJS规范', link: '/nodejs/moudle/01-commonjs' },
                        { text: 'Node的模块实现', link: '/nodejs/moudle/02-nodemoudle' },
                        { text: '核心模块', link: '/nodejs/moudle/03-core' },
                        { text: '扩展模块', link: '/nodejs/moudle/04-expand' },
                        { text: '调用模块栈', link: '/nodejs/moudle/05-stack' },
                        { text: '包与NPM', link: '/nodejs/moudle/06-npm' },
                        { text: '前后端共用模块', link: '/nodejs/moudle/07-common' }
                    ]
                },
                {
                    text: '异步编程',
                    collapsed: true,

                    items: [
                        { text: '异步IO与非阻塞IO', link: '/nodejs/async/01-io' },
                        { text: 'Node异步IO', link: '/nodejs/async/02-nodeio' },
                        { text: '非IO的异步API', link: '/nodejs/async/03-api' },
                        { text: '事件驱动与高性能服务器', link: '/nodejs/async/04-event' },
                        { text: '函数式编程', link: '/nodejs/async/05-functional' },
                        { text: '异步编程的优势与难点', link: '/nodejs/async/06-advantage' },
                        { text: '异步编程解决方案', link: '/nodejs/async/07-solve' }
                    ]
                },
                {
                    text: '内存控制',
                    collapsed: true,

                    items: [
                        { text: 'V8内存限制', link: '/nodejs/memory/01-v8' },
                        { text: 'V8垃圾回收机制', link: '/nodejs/memory/02-recycle' },
                        { text: '高效使用内存', link: '/nodejs/memory/03-use' },
                        { text: '内存指标', link: '/nodejs/memory/04-standard' },
                        { text: '内存泄漏', link: '/nodejs/memory/05-error' },
                        { text: '处理大文件', link: '/nodejs/memory/06-big' }
                    ]
                },
                {
                    text: 'Express',
                    collapsed: true,

                    items: [
                        { text: 'Express简介', link: '/nodejs/express/01-introduce' },
                        { text: '快速开始', link: '/nodejs/express/02-fastuse' }
                    ]
                }
            ],
                        '/page/': [
                {
                    text: 'HTML',
                    collapsed: true,

                    items: [
                        { text: 'HTML4', link: '/page/html/01-html4' },
                        { text: 'HTML5', link: '/page/html/02-html5' },
                    ]
                },
                {
                    text: 'CSS',
                    collapsed: true,

                    items: [
                        { text: 'CSS2', link: '/page/css/01-css2' },
                        { text: 'CSS3', link: '/page/css/02-css3' }
                    ]
                },
                {
                    text: '基础语法',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/page/basic/01-introduce' },
                        { text: '作用域', link: '/page/basic/02-scpoe' },
                        { text: '闭包', link: '/page/basic/03-closure' },
                        { text: '函数上下文', link: '/page/basic/04-context' },
                        { text: '数组', link: '/page/basic/05-array' },
                        { text: '对象', link: '/page/basic/06-object' },
                        { text: '数据类型', link: '/page/basic/07-type' },
                        { text: '原型', link: '/page/basic/08-prototype' },
                        { text: 'DOM', link: '/page/basic/09-dom' },
                        { text: 'BOM', link: '/page/basic/10-bom' },
                        { text: '事件模型', link: '/page/basic/11-eventmoudle' },
                        { text: '事件循环', link: '/page/basic/12-eventloop' }
                    ]
                },
                {
                    text: '深入理解',
                    collapsed: true,

                    items: [
                        { text: '模块化', link: '/page/advance/01-moudle' },
                        { text: '代码解析与执行', link: '/page/advance/02-engine' },
                        { text: '垃圾回收机制', link: '/page/advance/03-gc' },
                        { text: 'WeakMap', link: '/page/advance/04-weakmap' },
                        { text: 'WeakSet', link: '/page/advance/05-weakset' },
                        { text: 'Class', link: '/page/advance/06-class' },
                        { text: '函数式编程', link: '/page/advance/07-functioncode' },
                        { text: '迭代器', link: '/page/advance/08-iterator' },
                        { text: 'Proxy', link: '/page/advance/09-proxy' },
                        { text: '深拷贝与浅拷贝', link: '/page/advance/10-copy' },
                        { text: 'Stringify', link: '/page/advance/11-stringify' },
                        { text: '网页存储', link: '/page/advance/12-webstorage' },
                        { text: '装饰器', link: '/page/advance/13-decorator' },
                        { text: '跨页面通信', link: '/page/advance/14-crosspage' },
                        { text: 'ShadowDOM', link: '/page/advance/15-shadow' },
                        { text: 'Date', link: '/page/advance/16-data' },
                        { text: '正则表达式', link: '/page/advance/17-regexp' },
                        { text: '异常处理', link: '/page/advance/18-error' }
                    ]
                },
                {
                    text: '异步编程',
                    collapsed: true,

                    items: [
                        { text: '异步编程', link: '/page/async/01-code' },
                        { text: '异步与回调', link: '/page/async/02-async' },
                        { text: 'Promise', link: '/page/async/03-promise' },
                        { text: '实现PromiseA+规范', link: '/page/async/04-promisea' },
                        { text: 'Generator', link: '/page/async/05-generator' },
                        { text: 'async与await', link: '/page/async/06-asyncandawait' }
                    ]
                },
                {
                    text: '性能调优',
                    collapsed: true,

                    items: [
                        { text: 'MutationObserver', link: '/page/perf/01-mutation' },
                        { text: 'requestAnimationFrame', link: '/page/perf/02-request' },
                        { text: 'Performance API', link: '/page/perf/03-performance' },
                        { text: '页面生命周期', link: '/page/perf/04-load' }
                    ]
                },
                {
                    text: 'Vue2',
                    collapsed: true,

                    items: [
                        { text: 'Vue核心', link: '/page/vue2/01-vue2' },
                        { text: '组件化编程', link: '/page/vue2/02-component' },
                        { text: 'Ajax', link: '/page/vue2/03-ajax' },
                        { text: 'Vuex', link: '/page/vue2/04-vuex' },
                        { text: 'Vue-Router', link: '/page/vue2/05-router' }
                    ]
                }
            ],
            '/linux/': [
                {
                    text: 'Bash命令',
                    collapsed: true,

                    items: [
                        { text: '基础命令', link: '/linux/bash/01-basic' },
                        { text: '常用命令', link: '/linux/bash/02-advanced' },
                        { text: '环境变量', link: '/linux/bash/03-env' },
                        { text: '文件权限', link: '/linux/bash/04-permissions' },
                        { text: '文件系统', link: '/linux/bash/05-filesys' },
                        { text: '路由配置', link: '/linux/bash/06-route' }
                    ]
                },
                {
                    text: 'Shell脚本',
                    collapsed: true,

                    items: [
                        { text: '基础语法', link: '/linux/shell/01-basic' },
                        { text: '结构化语法(上)', link: '/linux/shell/02-structure1' },
                        { text: '结构化语法(下)', link: '/linux/shell/03-structure2' },
                        { text: '输入处理', link: '/linux/shell/04-input' },
                        { text: '数据呈现', link: '/linux/shell/05-data' },
                        { text: '脚本控制', link: '/linux/shell/06-control' },
                        { text: '函数创建', link: '/linux/shell/07-function' },
                        { text: '文本处理', link: '/linux/shell/08-text' },
                        { text: '正则表达式', link: '/linux/shell/09-reg' },
                        { text: 'Sed高级用法', link: '/linux/shell/10-sed' },
                        { text: 'Gawk高级用法', link: '/linux/shell/11-gawk' },
                        { text: '应用示例', link: '/linux/shell/12-sample' }
                    ]
                },
                {
                    text: '应用实例',
                    collapsed: true,

                    items: [
                        { text: 'CentOS', link: '/linux/instance/01-centos' },
                        { text: 'Ubuntu', link: '/linux/instance/02-ubuntu' },
                        { text: 'Debian', link: '/linux/instance/03-debian' },
                        { text: '局域网唤醒', link: '/linux/instance/04-wol' },
                        { text: 'WOL唤醒脚本', link: '/linux/instance/05-wolshell' },
                        { text: '服务自启动', link: '/linux/instance/06-systemctl' },
                        { text: '硬盘分区', link: '/linux/instance/07-partition' },
                        { text: '逻辑卷管理', link: '/linux/instance/08-lvm' },
                        { text: '文本过滤', link: '/linux/instance/09-filter' },
                        { text: '密钥登录', link: '/linux/instance/10-keylogin' }
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
                                { text: '简介概览', link: '/linux/vm/multipass/01-multipass' },
                                { text: '快速开始', link: '/linux/vm/multipass/02-multipassuse' }
                            ]
                        },
                        {
                            text: 'WSL',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/linux/vm/wsl/01-wsl' },
                                { text: '环境安装', link: '/linux/vm/wsl/02-wslinstall' },
                                { text: '基本使用', link: '/linux/vm/wsl/03-wsluse' }
                            ]
                        },
                        {
                            text: 'Proxmox VE',
                            collapsed: true,

                            items: [
                                { text: '简介概览', link: '/linux/vm/proxmoxve/01-proxmoxve' },
                                { text: '系统安装', link: '/linux/vm/proxmoxve/02-veinstall' },
                                { text: '配置优化', link: '/linux/vm/proxmoxve/03-veoptimize' },
                                { text: '系统管理', link: '/linux/vm/proxmoxve/04-vemanage' },
                                { text: '虚机安装', link: '/linux/vm/proxmoxve/05-vminstall' },
                                { text: '虚机管理', link: '/linux/vm/proxmoxve/06-vmmanage' },
                                { text: '硬件直通', link: '/linux/vm/proxmoxve/07-pcie' }
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
                        { text: '简介概览', link: '/linux/management/01-kubernetes' },
                        { text: '系统架构', link: '/linux/management/02-arch' },
                        { text: 'Minikube', link: '/linux/management/03-minikube' },
                        { text: 'K3s', link: '/linux/management/04-k3s' },
                        { text: '集群搭建', link: '/linux/management/05-build' },
                        { text: '管理工具', link: '/linux/management/06-kubectl' },
                        { text: '资源编排', link: '/linux/management/07-layout' },
                        { text: '命名空间', link: '/linux/management/08-namespace' },
                        { text: 'Pod', link: '/linux/management/09-pod' },
                        { text: '资源调度', link: '/linux/management/10-scheduler' },
                        { text: '工作负载资源', link: '/linux/management/11-resource' },
                        { text: 'ReplicaSet', link: '/linux/management/12-replicaset' },
                        { text: 'Deployment', link: '/linux/management/13-deployment' },
                        { text: 'HorizontalPodAutoscaler', link: '/linux/management/14-hpa' },
                        { text: 'DaemonSet', link: '/linux/management/15-daemonset' },
                        { text: 'Job', link: '/linux/management/16-job' },
                        { text: 'CronJob', link: '/linux/management/17-cronjob' },
                        { text: 'Service', link: '/linux/management/18-service' },
                        { text: 'Ingress', link: '/linux/management/19-ingress' },
                        { text: '临时存储', link: '/linux/management/20-ephemeral' },
                        { text: '持久存储', link: '/linux/management/21-persistent' },
                        { text: '配置存储', link: '/linux/management/22-configstorage' },
                        { text: '安全认证', link: '/linux/management/23-security' },
                        { text: 'Dashboard', link: '/linux/management/24-dashboard' },
                        { text: 'Helm', link: '/linux/management/25-helm' }
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
                                { text: 'VPN', link: '/linux/nat/tools/01-vpn' },
                                { text: 'Shadowsocks', link: '/linux/nat/tools/02-ss' },
                                { text: 'Frp', link: '/linux/nat/tools/03-frp' },
                                { text: 'SoftEtherVPN', link: '/linux/nat/tools/04-softether' },
                                { text: 'Tailscale', link: '/linux/nat/tools/05-tailscale' },
                                { text: 'Headscale', link: '/linux/nat/tools/06-headscale' },
                                { text: 'Derper', link: '/linux/nat/tools/07-derper' }
                            ]
                        },
                        {
                            text: 'NAT穿透',
                            collapsed: true,

                            items: [
                                { text: 'NAT - 网络地址转换', link: '/linux/nat/nat-traversal/01-nat' },
                                { text: 'NAT 穿透是如何工作的：技术原理及企业级实践（Tailscale）', link: '/linux/nat/nat-traversal/02-nat-traversal' },
                                { text: '基于角色的访问控制（RBAC）：演进历史、设计理念及简洁实现（Tailscale）', link: '/linux/nat/nat-traversal/03-tailscale-rbac' },
                                { text: '家庭网络NAT优化', link: '/linux/nat/nat-traversal/04-nat-optimize' }
                            ]
                        },
                        {
                            text: '组网方案',
                            collapsed: true,

                            items: [
                                { text: 'SoftEther + Frp', link: '/linux/nat/solutions/01-softfrp' }
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
                                { text: 'HomeAssistant', link: '/linux/nas/ha/01-ha' },
                                { text: 'HACS', link: '/linux/nas/ha/02-hacs' }
                            ]
                        },
                        {
                            text: '密码管理',
                            collapsed: true,

                            items: [
                                { text: 'Vaultwarden', link: '/linux/nas/pwd/01-vaultwarden' },
                                { text: 'VaultwardenBackup', link: '/linux/nas/pwd/02-vaultwarden-backup' }
                            ]
                        },
                        {
                            text: '文件共享',
                            collapsed: true,

                            items: [
                                { text: 'FTP', link: '/linux/nas/share/01-ftp' },
                                { text: 'NFS', link: '/linux/nas/share/02-nfs' }
                            ]
                        },
                        {
                            text: '私服搭建',
                            collapsed: true,

                            items: [
                                { text: '基本概述', link: '/linux/nas/dnf/01-overview' },
                                { text: '私服搭建', link: '/linux/nas/dnf/02-build' },
                                { text: '网页GM搭建', link: '/linux/nas/dnf/03-gm' }
                            ]
                        }
                    ]
                },
                {
                    text: '问题总结',
                    collapsed: true,

                    items: [
                        { text: 'Docker权限异常(Permission denied)', link: '/linux/issues/01-001' },
                        { text: 'Centos启动网络服务异常', link: '/linux/issues/02-002' },
                        { text: 'Ubuntu配置禁止密码登录无效', link: '/linux/issues/03-003' },
                        { text: 'Linux Too many open files 报错', link: '/linux/issues/04-004' }
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
                                { text: '什么是以太坊', link: '/chain/eth/basic/01-introduce' },
                                { text: '以太坊架构', link: '/chain/eth/basic/02-architecture' },
                                { text: '什么是DApp', link: '/chain/eth/basic/03-dapp' },
                                { text: '区块的定义', link: '/chain/eth/basic/04-block' },
                                { text: '以太坊地址', link: '/chain/eth/basic/05-address' },
                                { text: 'Nonce的作用', link: '/chain/eth/basic/06-nonce' },
                                { text: 'Gas燃料费', link: '/chain/eth/basic/07-gas' },
                                { text: '叔块', link: '/chain/eth/basic/08-uncle' },
                                { text: '挖矿奖励', link: '/chain/eth/basic/09-award' },
                                { text: '数据结构', link: '/chain/eth/basic/10-data' },
                                { text: 'MPT树', link: '/chain/eth/basic/11-mpt' },
                                { text: '账户模型', link: '/chain/eth/basic/12-accountmodle' },
                                { text: 'Ghost协议', link: '/chain/eth/basic/13-ghost' },
                                { text: 'Casper共识机制', link: '/chain/eth/basic/14-casper' },
                                { text: '智能合约', link: '/chain/eth/basic/15-contract' },
                                { text: '合约标准', link: '/chain/eth/basic/16-standard' },
                                { text: '以太坊交易', link: '/chain/eth/basic/17-transction' },
                                { text: '代币', link: '/chain/eth/basic/18-token' },
                                { text: '以太坊零地址', link: '/chain/eth/basic/19-zero' }
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
                                { text: '基本介绍', link: '/chain/eosio/basic/01-introduce' },
                                { text: '共识机制(BFT-DPoS)', link: '/chain/eosio/basic/02-bftdpos' },
                                { text: '账户体系', link: '/chain/eosio/basic/03-account' },
                                { text: '网络资源', link: '/chain/eosio/basic/04-netresource' },
                                { text: '节点治理', link: '/chain/eosio/basic/05-governance' },
                                { text: '脚本与虚拟机', link: '/chain/eosio/basic/06-vm' }
                            ]
                        },
                        {
                            text: 'Operate',
                            collapsed: true,

                            items: [
                                { text: '快速开始', link: '/chain/eosio/operate/01-start' },
                                { text: '源码编译', link: '/chain/eosio/operate/02-source' },
                                { text: '多节点环境部署', link: '/chain/eosio/operate/03-multi' },
                                { text: 'RPC接口上链', link: '/chain/eosio/operate/04-rpc' },
                                { text: '账户体系', link: '/chain/eosio/operate/05-access' },
                                { text: 'History-Tools', link: '/chain/eosio/operate/06-history' }
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
                                { text: '架构概览', link: '/chain/fabric/basic/01-architecture' },
                                { text: '核心概念与组件', link: '/chain/fabric/basic/02-component' },
                                { text: 'Raft共识算法', link: '/chain/fabric/basic/03-raft' },
                                { text: '消息协议', link: '/chain/fabric/basic/04-message' },
                                { text: '数据传播协议', link: '/chain/fabric/basic/05-gossip' },
                                { text: '访问控制', link: '/chain/fabric/basic/06-access' },
                                { text: '隐私保护', link: '/chain/fabric/basic/07-privacy' },
                                { text: '读写集语义', link: '/chain/fabric/basic/08-semantics' },
                                { text: '网络发现', link: '/chain/fabric/basic/09-discover' },
                                { text: '管理链码', link: '/chain/fabric/basic/10-lifecycle' },
                                { text: '读写集语义', link: '/chain/fabric/basic/08-semantics' },
                                { text: '配置解析—组织身份文件', link: '/chain/fabric/basic/11-config1' },
                                { text: '配置解析—通道配置文件', link: '/chain/fabric/basic/12-config2' },
                                { text: '配置解析—Order配置文件', link: '/chain/fabric/basic/13-config3' },
                                { text: '配置解析—Peer配置文件', link: '/chain/fabric/basic/14-config4' },
                                { text: '链码开发', link: '/chain/fabric/basic/15-dev' }
                            ]
                        },
                        {
                            text: 'Operate',
                            collapsed: true,

                            items: [
                                { text: 'Fabric 1.4.6 环境搭建', link: '/chain/fabric/operate/01-build1' },
                                { text: 'Fabric 1.4.6 多机部署', link: '/chain/fabric/operate/02-multi1' },
                                { text: 'Fabric 2.2.5 环境搭建', link: '/chain/fabric/operate/03-build2' },
                                { text: 'Fabric 2.2.5 多机部署', link: '/chain/fabric/operate/04-multi2' },
                                { text: 'Fabric 1.4.6 链码操作', link: '/chain/fabric/operate/05-chaincode1' },
                                { text: 'Fabric 2.4.7 链码操作', link: '/chain/fabric/operate/06-chaincode2' },
                                { text: '生产网络—生成身份文件', link: '/chain/fabric/operate/07-production1' },
                                { text: '生产网络—部署 Orderer 节点', link: '/chain/fabric/operate/08-production2' },
                                { text: '生产网络—部署 Peer 节点', link: '/chain/fabric/operate/09-production3' },
                                { text: '生产网络—部署合约并调用', link: '/chain/fabric/operate/10-production4' }
                            ]
                        }
                    ]
                },
                {
                    text: '工具链',
                    collapsed: true,

                    items: [
                        { text: 'Hyperledger-Caliper', link: '/chain/other/01-caliper' }
                    ]
                }
            ],
            '/dev/': [
                {
                    text: 'Git',
                    collapsed: true,

                    items: [
                        { text: '基础概念', link: '/dev/git/01-basic' },
                        { text: '常用操作', link: '/dev/git/02-opt' },
                        { text: '操作文件', link: '/dev/git/03-file' },
                        { text: '操作分支', link: '/dev/git/04-branch' },
                        { text: '操作历史', link: '/dev/git/05-history' },
                        { text: '远程版本库操作', link: '/dev/git/06-remote' },
                        { text: '更多操作', link: '/dev/git/07-more' },
                        { text: '应用示例', link: '/dev/git/08-instance' }
                    ]
                },
                {
                    text: 'GitLab',
                    collapsed: true,

                    items: [
                        { text: '环境搭建', link: '/dev/gitlab/01-envbuild' },
                        { text: '备份恢复', link: '/dev/gitlab/02-backup' },
                        { text: '版本升级', link: '/dev/gitlab/03-upgrade' },
                        { text: '系统优化', link: '/dev/gitlab/04-set' },
                        { text: '系统迁移升级问题', link: '/dev/gitlab/05-problem' }
                    ]
                },
                {
                    text: 'MySQL',
                    collapsed: true,

                    items: [
                        { text: '基础概述', link: '/dev/mysql/01-basic' },
                        { text: '数据定义语言', link: '/dev/mysql/02-ddl' },
                        { text: '数据操作语言', link: '/dev/mysql/03-dml' },
                        { text: '数据查询语言', link: '/dev/mysql/04-dql' },
                        { text: '数据控制语言', link: '/dev/mysql/05-dcl' },
                        { text: '常用函数', link: '/dev/mysql/06-function' },
                        { text: '常用约束', link: '/dev/mysql/07-constraint' },
                        { text: '多表查询', link: '/dev/mysql/08-multi' },
                        { text: '事务操作', link: '/dev/mysql/09-transaction' },
                        { text: '存储引擎', link: '/dev/mysql/10-engine' },
                        { text: '索引概述', link: '/dev/mysql/11-indexes' },
                        { text: '索引结构', link: '/dev/mysql/12-structure' },
                        { text: '索引语法', link: '/dev/mysql/13-grammar' },
                        { text: '索引失效', link: '/dev/mysql/14-invalid' },
                        { text: '索引使用', link: '/dev/mysql/15-use' },
                        { text: '性能分析', link: '/dev/mysql/16-profile' },
                        { text: 'SQL优化', link: '/dev/mysql/17-sqloptimization' },
                        { text: '视图', link: '/dev/mysql/18-view' },
                        { text: '存储过程', link: '/dev/mysql/19-stored' },
                        { text: '过程语法', link: '/dev/mysql/20-storedgrammar' },
                        { text: '游标', link: '/dev/mysql/21-cursor' },
                        { text: '存储函数', link: '/dev/mysql/22-storedfunction' },
                        { text: '触发器', link: '/dev/mysql/23-trigger' },
                        { text: '全局锁', link: '/dev/mysql/24-globallock' },
                        { text: '表级锁', link: '/dev/mysql/25-tablelock' },
                        { text: '行级锁', link: '/dev/mysql/26-linelock' }
                    ]
                },
                {
                    text: 'Kafka',
                    collapsed: true,

                    items: [
                        { text: '简介概览', link: '/dev/kafka/01-basic' },
                        { text: '环境搭建', link: '/dev/kafka/02-operate' },
                        { text: '生产消息', link: '/dev/kafka/03-producer' },
                        { text: '消息存储', link: '/dev/kafka/04-storage' },
                        { text: '消息同步', link: '/dev/kafka/05-sync' },
                        { text: '消费消息', link: '/dev/kafka/06-consumer' },
                        { text: '核心机制', link: '/dev/kafka/07-core' },
                        { text: '性能优化', link: '/dev/kafka/08-optimize' }
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
