# 简介概览

## 概述

### 什么是WSL

适用于 Linux 的 Windows 子系统可让开发人员按原样运行 GNU/Linux 环境 - 包括大多数命令行工具、实用工具和应用程序 - 且不会产生传统虚拟机或双启动设置开销。

- [在 Microsoft Store](https://aka.ms/wslstore) 中选择你偏好的 GNU/Linux 分发版。
- 运行常用的命令行软件工具（例如 `grep`、`sed`、`awk`）或其他 ELF-64 二进制文件。
- 运行 Bash 脚本和 GNU/Linux 命令行应用程序，包括：
  - 工具：vim、emacs、tmux
  - 语言：[NodeJS](https://learn.microsoft.com/zh-cn/windows/nodejs/setup-on-wsl2)JavaScript、[Python](https://learn.microsoft.com/zh-cn/windows/python/web-frameworks)、Ruby、C/C++、C#、F#、Rust、Go 等
  - 服务：SSHD、[MySQL](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-database)、Apache、lighttpd、[MongoDB](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-database)、[PostgreSQL](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-database)。
- 使用自己的 GNU/Linux 分发包管理器安装其他软件。
- 使用类似于 Unix 的命令行 shell 调用 Windows 应用程序。
- 在 Windows 上调用 GNU/Linux 应用程序。
- 运行直接集成到 Windows 桌面的 [GNU/Linux 图形应用程序](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/gui-apps)
- [将 GPU 加速](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/gpu-compute)用于机器学习、数据科学场景等

### 什么是 WSL 2

WSL 2 是适用于 Linux 的 Windows 子系统体系结构的一个新版本，它支持适用于 Linux 的 Windows 子系统在 Windows 上运行 ELF64 Linux 二进制文件。 它的主要目标是**提高文件系统性能**，以及添加**完全的系统调用兼容性**。

这一新的体系结构改变了这些 Linux 二进制文件与Windows 和计算机硬件进行交互的方式，但仍然提供与 WSL 1（当前广泛可用的版本）中相同的用户体验。

单个 Linux 分发版可以在 WSL 1 或 WSL 2 体系结构中运行。 每个分发版可随时升级或降级，并且你可以并行运行 WSL 1 和 WSL 2 分发版。 WSL 2 使用全新的体系结构，该体系结构受益于运行真正的 Linux 内核。

### 比较 WSL 1 和 WSL 2

| 功能                                           | WSL 1 | WSL 2 |
| :--------------------------------------------- | :---- | :---- |
| Windows 和 Linux 之间的集成                    | ✅     | ✅     |
| 启动时间短                                     | ✅     | ✅     |
| 与传统虚拟机相比，占用的资源量少               | ✅     | ✅     |
| 可以与当前版本的 VMware 和 VirtualBox 一起运行 | ✅     | ✅     |
| 托管 VM                                        | ❌     | ✅     |
| 完整的 Linux 内核                              | ❌     | ✅     |
| 完全的系统调用兼容性                           | ❌     | ✅     |
| 跨 OS 文件系统的性能                           | ✅     | ❌     |
