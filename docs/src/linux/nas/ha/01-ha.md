# Home Assistant

## 什么是 Home Assistant？

Home Assistant 是一个开源的智能家居平台，旨在将各种智能设备集成到一个统一的控制中心。它支持超过 1000 种不同的设备和服务，包括智能灯泡、传感器、摄像头、语音助手等。通过 Home Assistant，用户可以轻松管理和自动化他们的智能家居系统。

Home Assistant 的核心优势在于其灵活性和可扩展性。它不仅支持现成的智能设备，还可以通过自定义插件和脚本实现高度个性化的功能。此外，Home Assistant 强调隐私和安全，所有数据都在本地处理，无需依赖云服务。

## Home Assistant 的核心功能

1. **设备集成**：支持多种智能设备和服务，包括 Zigbee、Z-Wave、Wi-Fi 设备等。
2. **自动化**：通过自动化规则，实现设备之间的联动和场景控制。
3. **脚本**：编写脚本以实现复杂的操作流程。
4. **用户界面**：提供直观的 Web 界面和移动应用，方便用户随时随地控制家居设备。
5. **本地控制**：所有操作都在本地进行，确保数据隐私和安全。
6. **社区支持**：拥有活跃的社区，提供丰富的插件、教程和支持。

## 安装 Home Assistant

### 硬件要求

- **Raspberry Pi**：推荐使用 Raspberry Pi 4，性能较好。
- **其他单板计算机**：如 Odroid、NVIDIA Jetson Nano 等。
- **虚拟机**：可以在 VMware、VirtualBox 等虚拟化平台上运行。
- **Docker**：支持在 Docker 容器中运行。

### 安装方法

**docker-compose:**

```yaml
version: "3.8"

services:
  homeassistant:
    image: "ghcr.io/home-assistant/home-assistant:stable"
    container_name: homeassistant
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /run/dbus:/run/dbus:ro
      - ./ha_config:/config
    restart: unless-stopped
    privileged: true
    network_mode: host
```

## 配置 Home Assistant

### 基本配置

1. **首次启动**：访问 `http://<your-ip>:8123`，完成初始设置。
2. **配置文件**：主要配置文件为 `configuration.yaml`，位于 `/config` 目录下。

![An image](/img/linux/nas/008.png)

### 添加设备

1. **集成页面**：通过 Web 界面的“配置” -> “集成”添加设备。
2. **手动配置**：在 `configuration.yaml` 中手动添加设备配置。

### 自动化与脚本

1. **自动化**：通过 Web 界面或 `automations.yaml` 文件创建自动化规则。

   ```yaml
   automation:
     - trigger:
         platform: state
         entity_id: binary_sensor.motion
         to: 'on'
       action:
         service: light.turn_on
         entity_id: light.living_room
   ```

2. **脚本**：通过 `scripts.yaml` 文件创建脚本。

   ```yaml
   script:
     good_morning:
       sequence:
         - service: light.turn_on
           entity_id: light.bedroom
         - service: media_player.play_media
           entity_id: media_player.living_room
           data:
             media_content_id: 'https://example.com/morning.mp3'
             media_content_type: 'music'
   ```

## 集成与插件

### 常见集成

- **Zigbee/Z-Wave**：通过 USB 适配器连接 Zigbee 或 Z-Wave 设备。
- **Google Assistant/Amazon Alexa**：将 Home Assistant 与语音助手集成。
- **MQTT**：使用 MQTT 协议连接设备。

### 自定义插件

通过 HACS（Home Assistant Community Store）安装社区开发的插件。

## 用户界面与仪表盘

### Lovelace UI

Lovelace 是 Home Assistant 的默认用户界面，支持高度自定义。

### 自定义仪表盘

通过 YAML 配置文件或 Web 界面自定义仪表盘布局。

## 社区与资源

### 官方文档

[Home Assistant 官方文档](https://www.home-assistant.io/docs/)

### 社区论坛

[Home Assistant 社区论坛](https://community.home-assistant.io/)

### 开源贡献

[GitHub 仓库](https://github.com/home-assistant/core)
