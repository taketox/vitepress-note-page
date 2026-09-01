# 基本使用

## 基本命令

### 基础命令

**安装**

```powershell
wsl --install
```

安装 WSL 和 Linux 的默认 Ubuntu 发行版。 还可以使用此命令通过运行 `wsl --install <Distribution Name>` 来安装其他 Linux 发行版。 若要获取发行版名称的有效列表，请运行 `wsl --list --online`。

选项包括：

- `--distribution`：指定要安装的 Linux 发行版。 可以通过运行 `wsl --list --online` 来查找可用的发行版。
- `--no-launch`：安装 Linux 发行版，但不自动启动它。
- `--web-download`：通过联机渠道安装，而不是使用 Microsoft Store 安装。

未安装 WSL 时，选项包括：

- `--inbox`：使用 Windows 组件（而不是 Microsoft Store）安装 WSL。 *（WSL 更新将通过 Windows 更新接收，而不是通过 Microsoft Store 中推送的可用更新来接收）。*
- `--enable-wsl1`：在安装 Microsoft Store 版本的 WSL 的过程中也启用“适用于 Linux 的 Windows 子系统”可选组件，从而启用 WSL 1。
- `--no-distribution`：安装 WSL 时不安装发行版。

> 如果在 Windows 10 或更低版本上运行 WSL，可能需要在 `--install` 命令中包含 `-d` 标志以指定发行版：`wsl --install -d <distribution name>`。

**列出可用的 Linux 发行版**

```powershell
wsl --list --online
```

查看可通过在线商店获得的 Linux 发行版列表。 此命令也可输入为：`wsl -l -o`。

**列出已安装的 Linux 发行版**

```powershell
wsl --list --verbose
```

**将 WSL 版本设置为 1 或 2**

```powershell
wsl --set-version <distribution name> <versionNumber>
```

**设置默认 WSL 版本**

```powershell
wsl --set-version <distribution name> <versionNumber>
```

**设置默认 Linux 发行版**

```powershell
wsl --set-default <Distribution Name>
```

**将目录更改为主页**

```powershell
wsl ~
```

**通过 PowerShell 或 CMD 运行特定的 Linux 发行版**

```powershell
wsl --distribution <Distribution Name> --user <User Name>
```

**更新 WSL**

```powershell
wsl --update
```

**检查 WSL 状态**

```powershell
wsl --status
```

**检查 WSL 版本**

```powershell
wsl --version
```

**检查 WSL 版本和状态**

```powershell
wsl -l -v
```

**关闭**

```powershell
wsl --shutdown
```

**Help 命令**

```powershell
wsl --help
```

### 高级命令

**以特定用户的身份运行**

```powershell
wsl -u <Username>`, `wsl --user <Username>
```

**更改发行版的默认用户**

```powershell
<DistributionName> config --default-user <Username>
```

**Terminate**

```powershell
wsl --terminate <Distribution Name>
```

若要终止指定的发行版或阻止其运行，请将 `<Distribution Name>` 替换为目标发行版的名称。

**标识 IP 地址**

- `wsl hostname -i` 标识通过 WSL 2 安装的 Linux 分发版 IP 地址（WSL 2 VM 地址）
- `cat /etc/resolv.conf` 表示从 WSL 2 看到的 WINDOWS 计算机的 IP 地址 (WSL 2 VM)

**导入和导出发行版**

```powershell
wsl --export <Distribution Name> <FileName>
```

```powershell
wsl --import <Distribution Name> <InstallLocation> <FileName>
```

将指定 tar 文件导入和导出为新的发行版。 在标准输入中，文件名可以是 -。 选项包括：

- `--vhd`：指定导入/导出发行版应为 .vhdx 文件，而不是 tar 文件
- `--version`：（仅导入）指定将发行版导入为 WSL 1 还是 WSL 2 发行版

**就地导入发行版**

```powershell
wsl --import-in-place <Distribution Name> <FileName>
```

将指定的 .vhdx 文件导入为新的发行版。 虚拟硬盘必须采用 ext4 文件系统类型格式。

**注销或卸载 Linux 发行版**

尽管可以通过 Microsoft Store 安装 Linux 发行版，但无法通过 Store 将其卸载。

```powershell
wsl --unregister <DistributionName>
```

如果将 `<DistributionName>` 替换为目标 Linux 发行版的名称，则将从 WSL 取消注册该发行版，以便可以重新安装或清理它。 **警告：**取消注册后，与该分发版关联的所有数据、设置和软件将永久丢失。 从 Store 重新安装会安装分发版的干净副本。

例如：`wsl --unregister Ubuntu` 将从可用于 WSL 的发行版中删除 Ubuntu。 运行 `wsl --list` 将会显示它不再列出。

还可以像卸载任何其他应用商店应用程序一样卸载 Windows 计算机上的 Linux 发行版应用。 若要重新安装，请在 Microsoft Store 中找到该发行版，然后选择“启动”。

**装载磁盘或设备**

```powershell
wsl --mount <DiskPath>
```

通过将 `<DiskPath>` 替换为物理磁盘所在的目录\文件路径，在所有 WSL2 发行版中附加和装载该磁盘。 选项包括：

- `--vhd`：指定 `<Disk>` 引用虚拟硬盘。
- `--name`：使用装入点的自定义名称装载磁盘
- `--bare`：将磁盘附加到 WSL2，但不进行装载。
- `--type <Filesystem>`：装载磁盘时使用的文件系统类型默认为 ext4（如果未指定）。 此命令也可输入为：`wsl --mount -t <Filesystem>`。可以使用 `blkid <BlockDevice>` 命令检测文件系统类型，例如：`blkid <dev/sdb1>`。
- `--partition <Partition Number>`：要装载的分区的索引号默认为整个磁盘（如果未指定）。
- `--options <MountOptions>`：装载磁盘时，可以包括一些特定于文件系统的选项。 例如，`wsl --mount -o "data-ordered"` 或 `wsl --mount -o "data=writeback` 之类的 。 但是，目前仅支持特定于文件系统的选项。 不支持通用选项，例如 `ro`、`rw` 或 `noatime`。

**卸载磁盘**

```powershell
wsl --unmount <DiskPath>
```

卸载磁盘路径中给定的磁盘，如果未提供磁盘路径，则此命令将卸载并分离所有已装载的磁盘。
