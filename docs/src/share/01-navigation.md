---
layout: page
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const mirrors = [
  {
    avatar: '/img/favicon.ico',
    name: '中国科学技术大学开源软件镜像',
    title: '目前是中国大陆高校访问量最大，收录最全的开源软件镜像。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://mirrors.ustc.edu.cn' },
    ]
  },
  {
    avatar: '/img/favicon.ico',
    name: '清华大学开源软件镜像站',
    title: '清华大学信息化技术中心支持创办，由清华大学 TUNA 协会运行维护。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://mirrors.tuna.tsinghua.edu.cn' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: '网易开源镜像站',
    title: '网易公司所维护的开源镜像服务器, 致力于为国内用户提供稳定快速的镜像源。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://mirrors.163.com' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: '阿里巴巴开源镜像站',
    title: '为阿里云和互联网用户提供免费高速的一站式镜像服务。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://developer.aliyun.com/mirror' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: '华为开源镜像站',
    title: '华为云DevCloud团队提供的全类型镜像站服务。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://mirrors.huaweicloud.com' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: '腾讯软件源',
    title: '搭建此开源镜像的目的在于宣传自由软件的价值，腾讯软件源由腾讯云提供支持。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://mirrors.tencent.com' },
    ]
  }
]

const utils = [
  {
    avatar: '/img/favicon.ico',
    name: 'Tampermonkey',
    title: '篡改猴 (Tampermonkey) 是拥有 超过 1000 万用户 的最流行的浏览器扩展之一',
    links: [
      { icon: { svg: '🔗' }, link: 'https://www.tampermonkey.net' },
    ]
  },
  {
    avatar: '/img/favicon.ico',
    name: 'Greasy Fork',
    title: '欢迎来到 Greasy Fork，这里是一个提供用户脚本的网站。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://greasyfork.org/zh-CN' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: '菜鸟工具',
    title: '一个工具集合网站，提供包括JSON解析工具、SHA加密等常用工具。',
    links: [
      { icon: { svg: '🔗' }, link: 'https://c.runoob.com' },
    ]
  }
]

const github = [
  {
    avatar: '/img/favicon.ico',
    name: 'WindTerm',
    title: '一个更快更好的SSH/Telnet/Serial/Shell/Sftp客户端。',
    links: [
      { icon: 'github', link: 'https://github.com/kingToolbox/WindTerm' },
    ]
  },
  {
    avatar: '/img/favicon.ico',
    name: 'Ventoy',
    title: '简单来说，Ventoy是一个制作可启动U盘的开源工具。',
    links: [
      { icon: 'github', link: 'https://github.com/ventoy/Ventoy' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'frp',
    title: 'frp 是一个专注于内网穿透的高性能的反向代理应用。',
    links: [
      { icon: 'github', link: 'https://github.com/fatedier/frp' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'WoX',
    title: 'WoX 是一款简单易用的 Windows 启动器。',
    links: [
      { icon: 'github', link: 'https://github.com/Wox-launcher/Wox' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'rubick',
    title: '基于 electron 的开源工具箱，自由集成丰富插件。',
    links: [
      { icon: 'github', link: 'https://github.com/rubickCenter/rubick' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'flatnotes',
    title: '一款自托管、无数据库的笔记Web应用，利用MD进行文件存储。',
    links: [
      { icon: 'github', link: 'https://github.com/dullage/flatnotes' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'Multipass',
    title: '一个轻量级的VM管理器，适用于Linux，Windows和macOS。',
    links: [
      { icon: 'github', link: 'https://github.com/canonical/multipass' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'Shadowsocks',
    title: 'Shadowsocks是一个快速隧道代理，可帮助您绕过防火墙。',
    links: [
      { icon: 'github', link: 'https://github.com/shadowsocks/shadowsocks' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'v2rayN',
    title: '支持 Xray core 和 v2fly core 等。',
    links: [
      { icon: 'github', link: 'https://github.com/2dust/v2rayN' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'Clash',
    title: '一个跨平台的基于规则的代理工具，支持各种代理和反审查协议的开箱即用。',
    links: [
      { icon: 'github', link: 'https://github.com/Dreamacro/clash' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'QuickRedis',
    title: 'QuickRedis 是一款永久免费的Redis可视化管理工具。',
    links: [
      { icon: 'github', link: 'https://github.com/quick123official/quick_redis_blog' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'Tiny RDM',
    title: '一个现代化轻量级的跨平台Redis桌面客户端，支持Mac、Windows和Linux。',
    links: [
      { icon: 'github', link: 'https://github.com/tiny-craft/tiny-rdm' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'WeChatMsg',
    title: '提取微信聊天记录，将其导出成HTML、Word、CSV文档永久保存。',
    links: [
      { icon: 'github', link: 'https://github.com/LC044/WeChatMsg' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'marktext',
    title: '一个简单优雅的markdown编辑器，可用于Linux、macOS和Windows。',
    links: [
      { icon: 'github', link: 'https://github.com/marktext/marktext' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'CasaOS',
    title: '一个简单、易用、优雅的开源个人云系统。',
    links: [
      { icon: 'github', link: 'https://github.com/IceWhaleTech/CasaOS' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'alist',
    title: '一个支持多存储的文件列表/WebDAV程序，使用 Gin 和 Solidjs。',
    links: [
      { icon: 'github', link: 'https://github.com/alist-org/alist' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'gitea',
    title: '一个由社区管理的轻量级代码托管解决方案。',
    links: [
      { icon: 'github', link: 'https://github.com/go-gitea/gitea' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'hoppscotch',
    title: '开源API开发生态系统。',
    links: [
      { icon: 'github', link: 'https://github.com/hoppscotch/hoppscotch' },
    ]
  }
]

const blockchain = [
  {
    avatar: '/img/favicon.ico',
    name: 'EOSIO',
    title: '官方文档',
    links: [
      { icon: { svg: '🔗' }, link: 'https://developers.eos.io/welcome/latest/getting-started-guide/index' },
    ]
  },
  {
    avatar: '/img/favicon.ico',
    name: 'Hyperledger Fabric',
    title: '官方文档',
    links: [
      { icon: { svg: '🔗' }, link: 'https://readthedocs.org/projects/hyperledger-fabric' },
    ]
  },
    {
    avatar: '/img/favicon.ico',
    name: 'FISCO BCOS',
    title: '官方文档',
    links: [
      { icon: { svg: '🔗' }, link: 'https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest' },
    ]
  }
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      开源镜像站
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="mirrors"
  />
  <VPTeamPageTitle>
    <template #title>
      工具站
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="utils"
  />
  <VPTeamPageTitle>
    <template #title>
      Github
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="github"
  />
  <VPTeamPageTitle>
    <template #title>
      区块链
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="blockchain"
  />

</VPTeamPage>
