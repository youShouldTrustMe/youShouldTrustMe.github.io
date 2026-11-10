---
title: Davinci Developer

categories: 
  - 软件及工具
---

# 核心概念

在开始使用前，需要理解几个核心概念：

- **SWC（Software Component）**：软件组件，AUTOSAR 应用层的基本构建单元
- **Runnable**：SWC 中可执行的函数实体，由 RTE 触发调用
- **Port**：SWC 的对外接口，分为 S/R（发送-接收）和 C/S（客户端-服务器）两种类型
- **Interface**：定义 Port 传输的数据结构或操作签名
- **ARXML**：AUTOSAR 标准的模型描述文件，是工具间交换数据的载体

# 基本操作流程

## 创建 SWC

**步骤**：右键点击 `Application` → `New` → `Application`

**SWC 类型选择**：
- **Application**：普通的应用型 SWC
- **Complex Driver**：复杂驱动型 SWC，用于处理与硬件紧密相关的信号

命名建议遵循公司规范，例如 `CDD_VehicleSignalProcessing` 或 `APP_VehicleStateManager`。

## 创建 Runnable

双击打开 SWC，点击 `New` → `Runnable` 创建可运行实体。

**主要触发方式**：
- **Periodic（周期触发）**：设置固定周期（如 1ms、5ms）
- **Init（初始化触发）**：上电时执行一次
- **DataReceived（数据接收触发）**：当端口收到数据时触发
- **DataSendCompleted（发送完成触发）**

> **建议**：为每个 SWC 都创建一个 Init Runnable，保持设计习惯的一致性。

## 定义数据类型

AUTOSAR 推荐**先定义应用数据类型（ADT）**，再通过映射关联到实现数据类型（IDT）。ADT 承载物理意义，能让代码可读性更好，也便于后续标定和诊断。

**常用数据类型**：
- **Record（结构体）**：组合多个数据成员
- **Array（数组）**：定长同类型数据集合
- **Enum（枚举）**：有限状态值
- **CompuMethod（计算方法）**：定义物理值与代码值之间的转换关系

## 定义端口接口

Port Interface 定义了数据交互的通道。主要分为：
- **Sender-Receiver Interface**：用于数据发送和接收
- **Client-Server Interface**：用于操作调用和返回

## 创建端口与映射

1. 创建 Ports，关联 Interface 和数据类型
2. 将 Port 与 Runnable 进行映射，建立数据访问关系
3. 完成 SWC 间的连接器装配，确立数据流向

## SWC 实例化

在 Software Design 界面完成 SWC 的实例化。

# 与其他工具的协作

与 DaVinci Configurator Pro 的协作流程

```
┌─────────────────────────────────────────────────────────────┐
│                   开发流程概览                               │
├─────────────────────────────────────────────────────────────┤
│  阶段一：系统架构设计（DaVinci Developer）                    │
│  ├── 创建 ARXML 工程，选择 AUTOSAR 版本                       │
│  ├── 定义数据类型和接口                                       │
│  ├── 创建 SWC 并添加端口                                     │
│  └── 连接 SWC 端口，确立数据流向                          │
│                         ↓                                   │
│  阶段二：ECU 配置与集成（DaVinci Configurator Pro）         │
│  ├── 导入 Developer 生成的 ARXML                          │
│  ├── 配置硬件拓扑、CAN 通信栈                             │
│  ├── 导入 DBC 文件，完成信号到端口的映射                   │
│  └── 生成可编译的 BSW 代码                                │
│                         ↓                                   │
│  阶段三：代码生成与验证                                     │
│  ├── 编译集成，生成可执行文件                             │
│  └── 在 CANoe 等环境中验证功能                            │
└─────────────────────────────────────────────────────────────┘
```

# Object Browser

在这个视图下，将会有以下选项：

1. **Application Component Types（应用组件类型）**
2. **Composition Component Types（组合组件类型）**
3. **Data Types（数据类型）**
4. **Application Port Interfaces（应用端口接口）**
5. **Service Port Interfaces（服务端口接口）**
6. **Constants（常数）**
7. **Type Mapping Sets（类型映射集）**
8. **Service Component Types（服务组件类型）**
9. **Blueprints（蓝图）**
10. **Addressing Methods（寻址方法）**

按照功能分类为：

1. 🧱 核心建筑模块 (SWC 类型)
   - **Application Component Types（应用组件类型）**：这是最核心、最常用的一种 。它对应的是承载具体应用逻辑的"原子"软件组件（Atomic SWC），比如一个负责计算电池SOC的算法模块，或是一个控制车窗升降的逻辑单元。**你大部分设计工作都会围绕它展开**。
   - **Composition Component Types（组合组件类型）**：可以把它看作一个"容器"或"文件夹"。它本身不实现功能，而是将多个有紧密联系的 **Application Component** 组合在一起，让整个架构的逻辑分层更清晰，方便管理 。
2. 🧾 接口设计基础 (数据类型与接口)
   - **Data Types（数据类型）**：这是定义所有通信数据的"语法基础"。通常需要先定义**应用数据类型（ADT）**来表达物理意义（如"车速"），再映射到**实现数据类型（IDT）**（如 `uint16`），最终关联到**基础类型（Base Type）**。例如，一个结构体、数组或枚举都在这里定义 。
   - **Application Port Interfaces（应用端口接口）**：定义了 **Application Component** 之间进行"对话"的**语言和协议**。它规定了端口传递的是数据（Sender-Receiver接口）还是可供调用的函数（Client-Server接口）。
   - **Service Port Interfaces（服务端口接口）**：和上面的类似，但它专用于 SWC 与基础软件（BSW）里的"服务"通信，例如诊断服务或NVRAM管理服务 。
3. 📦 辅助与配置元素
   - **Constants（常数）**：存储一些在软件中可复用的常量定义。
   - **Mode Declaration Groups（模式声明组）**：用于声明 ECU 或应用的模式（如 `RUN`, `SLEEP`, `INIT`），这些模式可以触发或抑制 SWC 内部某些可运行实体（Runnable）的执行 。
   - **Type Mapping Sets（类型映射集）**：这是一个"对照表"，专门用来建立**应用数据类型（ADT）**和**实现数据类型（IDT）**之间的映射关系。如果这个关系没维护好，工具的一致性检查就会报错 。
4. 🏷️ 高级与特殊用途
   - **Service Component Types（服务组件类型）**：作为一种特殊的 SWC，它专门用于将 BSW（基础软件）层的服务封装后提供给应用层使用 。
   - **Blueprints（蓝图）**：可以理解为一种"模板"或"设计模式"。如果有一组经常一起使用的 SWC 和连接关系，可以把它保存为蓝图，方便在其他项目中复用，提高设计效率。
   - **Addressing Methods（寻址方法）**：在特定通信场景（比如 Can 通信）下，用来定义如何在消息中寻址或识别信号的元数据。

> [!tip]
>
> 简单来说，你在这里的工作流程，就是**先准备好零件和图纸（定义数据类型、接口），然后进入核心设计区（双击Application Component）去组装和编写功能逻辑**。











