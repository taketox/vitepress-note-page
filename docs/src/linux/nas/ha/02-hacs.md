# Home Assistant Community Store

## 什么是 HACS？

HACS（Home Assistant Community Store）是一个为 Home Assistant 用户提供社区开发的集成、插件、主题等资源的平台。通过 HACS，用户可以轻松地扩展 Home Assistant 的功能，安装和管理各种第三方组件，而无需手动下载和配置。

HACS 的核心优势在于其便捷性和丰富的资源库。它允许用户直接从 Home Assistant 的界面浏览、安装和更新社区开发的组件，极大地简化了扩展 Home Assistant 功能的过程。

## HACS 的核心功能

1. **集成管理**：浏览、安装和管理社区开发的集成。
2. **主题管理**：浏览、安装和管理社区开发的主题。
3. **自动化工具**：提供自动化工具和脚本，简化操作流程。
4. **更新管理**：自动检测和更新已安装的组件。
5. **用户界面**：提供直观的 Web 界面，方便用户操作。

## 安装 HACS

### 前提条件

- **Home Assistant**：确保已安装并运行 Home Assistant。
- **文件编辑器**：如 Visual Studio Code，用于编辑配置文件。

### 安装步骤

1. **下载 HACS**：

   - 打开 Home Assistant 的 Web 界面。
   - 进入“配置” -> “加载项、备份与 Supervisor” -> “加载项商店”。
   - 搜索并安装“File editor”加载项。

2. **安装 HACS**：

   - 打开 File editor，进入 `/config` 目录。

   - 创建一个名为 `custom_components` 的目录（如果不存在）。

   - 下载 HACS 的最新版本：

     ```sh
     wget https://github.com/hacs/integration/releases/latest/download/hacs.zip
     ```

   - 解压 `hacs.zip` 到 `/config/custom_components` 目录。

3. **配置 HACS（可选）**：

   - 编辑 `configuration.yaml`文件，添加以下内容：

     ```yaml
     hacs:
       token: YOUR_GITHUB_TOKEN
     ```

   - 重启 Home Assistant。

4. **完成安装**：

   - 访问 Home Assistant 的 Web 界面，进入“设置” -> “设备与服务”。
   - 点击“添加集成”，搜索并添加 HACS。

![An image](/img/linux/nas/009.png)

## 社区与资源

### 官方文档

[HACS 官方文档](https://hacs.xyz)

### 社区论坛

[Home Assistant 社区论坛](https://community.home-assistant.io/)

### 开源贡献

[GitHub 仓库](https://github.com/hacs/integration)
