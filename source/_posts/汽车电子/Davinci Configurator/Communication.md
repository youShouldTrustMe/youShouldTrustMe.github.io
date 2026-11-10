---
date: 2026-11-10 19:43:42
title: Davinci Configurator - Communication

categories: 
  - 软件及工具
---

# Can

```txt
Can
└── CanConfigSet
    ├── CanControllers
    │   └── CanController实例 
    │       ├── CanControllerBaudrateConfigs
    │       │   └── CanControllerBaudrateConfig
    │       │		└── CanControllerFdBaudrateConfig
    │       └── CanFilterMasks
    │           └── CanFilterMask实例 
    ├── CanHardwareObjects
    │   └── CanHardwareObject实例 
    └── CanGeneral
    	└── CanMainFunctionRWPeriods
```

| 子容器                       | 中文直译 / 惯称    | 核心功能职责                                                 | 关键配置内容举例                                             |
| :--------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **CanControllers**           | CAN 控制器配置     | 配置 **MCU 内部 CAN 控制器** 的硬件参数，包括波特率、采样点、滤波器等。 | 每个 CanController 实例对应一个物理 CAN 控制器（如 CAN0、CAN1），包含波特率配置（标准 CAN 和 CAN FD）和硬件滤波器掩码。 |
| **CanHardwareObjects**       | CAN 硬件对象配置   | **核心配置**。定义 **硬件邮箱/缓冲区对象**，每个实例对应一个硬件收发邮箱，用于管理 CAN 报文的收发。 | 每个 CanHardwareObject 实例对应一个具体的硬件邮箱，定义了邮箱的收发方向、关联的 CAN ID、所属的 CAN 控制器等。该配置被 CanIf 中的 HOH 引用。 |
| **CanGeneral**               | CAN 通用配置       | 配置 CAN 驱动模块的**全局行为参数**，包括模块级开关、错误处理策略、时钟源等。 | 定义 CAN 模块的全局参数，如开发错误检测开关、时钟源选择、模块版本等。 |
| **CanMainFunctionRWPeriods** | CAN 主函数读写周期 | 配置 CAN 驱动模块的**主函数周期**，用于轮询模式的报文收发处理。 | 定义 CAN 驱动主函数的调用周期，通常在轮询模式（非中断模式）下使用。 |

> [!note]
>
> 1. **Can 驱动模块在通信栈中的位置**：Can 驱动是 AUTOSAR 通信栈的**最底层**，直接操作 MCU 的 CAN 硬件寄存器。其上层为 **CanIf（CAN 接口层）**，CanIf 通过引用 Can 驱动中的 `CanHardwareObject` 来实现报文的收发。
>
> 2. **CanHardwareObject 与 CanIf HOH 的关系**：
>    - **CanHardwareObject**：Can 驱动层定义的硬件邮箱对象，直接对应硬件寄存器。
>    - **CanIf HOH（Hardware Object Handle）**：CanIf 层对 CanHardwareObject 的抽象引用。
>    - **关联方式**：CanIf 中的 `CanIfHrhCfg` / `CanIfHthCfg` 通过 `Hrh Id Sym Ref` / `Hth Id Sym Ref` 引用 Can 驱动中的 `CanHardwareObject`。
>
> 3. **CanController 与 CanHardwareObject 的关系**：
>    - **CanController**：定义 CAN 控制器的物理参数（波特率、滤波器等）。
>    - **CanHardwareObject**：定义具体的硬件邮箱/缓冲区，挂载在某个 CanController 下。
>    - 一个 CanController 下可以有多个 CanHardwareObject（多个邮箱）。

## CanConfigSet

### CanController 实例

`CanControllers` 下的每个实例用于配置 **MCU 内部一个具体的 CAN 控制器硬件单元**，包括硬件地址、波特率、处理模式、唤醒等底层驱动参数。该配置是 Can 驱动模块的核心部分，定义了 CAN 控制器的运行时行为。

| 参数名称                        | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------ | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                  | 短名称           | 该 CAN 控制器配置实例的唯一标识名。                          | 用于在工具中识别该配置实例，通常包含 CAN 通道信息（如 `CT_EPS_CHCAN1_Ctrl` 表示 EPS 的 CAN1 控制器）。 |
| **Busoff Processing**           | 总线关闭处理方式 | 指定 CAN 控制器发生 **Bus Off（总线关闭）** 事件时的处理方式。 | - `POLLING`：通过轮询检测 Bus Off 状态。<br>- `INTERRUPT`：通过中断检测 Bus Off 状态。<br>根据项目调度策略选择。 |
| **Controller Activation**       | 控制器激活       | 勾选后，表示该 CAN 控制器在系统中**激活启用**。              | **必须勾选**，否则该 CAN 控制器不会初始化，无法使用。        |
| **Controller Base Address**     | 控制器基地址     | 指定该 CAN 控制器硬件寄存器在 MCU 内存空间中的**基地址（Base Address）**。 | **必须与 MCU 硬件手册一致**，否则 CAN 控制器无法正常工作。该值由 MCAL 供应商提供。 |
| **Controller Default Baudrate** | 控制器默认波特率 | **关键引用**。引用 `CanControllerBaudrateConfig` 实例，指定该 CAN 控制器使用的**默认波特率配置**。 | **必须正确引用**，指向该控制器对应的波特率配置实例。         |
| **Controller Id**               | 控制器 ID        | 该 CAN 控制器在 Can 驱动模块内部的**数字标识符**，用于驱动层索引和管理不同的 CAN 控制器。 | 与硬件 CAN 控制器编号一致（如 CAN0→0、CAN1→1），**必须与硬件设计匹配**。 |
| **Controller System Ref**       | 控制器系统引用   | 引用该 CAN 控制器在系统设计中的**顶层系统配置实例**，用于与系统设计集成。 | 通常由工具自动生成，一般不需要手动修改。                     |
| **Cpu Clock Ref**               | CPU 时钟引用     | 引用 **MCU 时钟配置** 中的时钟源，指定该 CAN 控制器使用的**时钟源**。 | **必须正确引用**，确保 CAN 控制器的时钟源配置与硬件设计一致。通常指向 Mcu 模块中的时钟配置。 |
| **Fd Support**                  | CAN FD 支持      | 指定该 CAN 控制器对 **CAN FD（灵活数据速率）** 的支持程度。  | - `NONE`：不支持 CAN FD。<br>- `FULL`：完全支持 CAN FD。<br>- `MIXED`：混合模式，部分支持。<br>根据硬件能力选择。 |
| **Individual Processing**       | 独立处理         | 勾选后，该 CAN 控制器**独立处理**其收发邮箱，不与其他控制器共享处理逻辑。 | 通常保持默认（勾选），确保各控制器独立运行。                 |
| **Max Rx Data Len**             | 最大接收数据长度 | 指定该 CAN 控制器支持的**最大接收数据长度**，以字节为单位。  | 标准 CAN 为 8 字节，CAN FD 最大为 64 字节。必须与硬件能力和 FD 支持配置一致。 |
| **Max Tx Data Len**             | 最大发送数据长度 | 指定该 CAN 控制器支持的**最大发送数据长度**，以字节为单位。  | 标准 CAN 为 8 字节，CAN FD 最大为 64 字节。必须与硬件能力和 FD 支持配置一致。 |
| **Os Counter Ref**              | OS 计数器引用    | 引用 **OS（操作系统）计数器** 配置，用于 CAN 驱动的时间管理（如超时计时）。 | 根据项目 OS 配置引用对应的系统计数器。                       |
| **Ram Check**                   | RAM 检查类型     | 指定该 CAN 控制器**RAM 检查**的类型，用于功能安全场景中的内存错误检测。 | - `None`：不执行 RAM 检查。<br>- 其他选项：执行不同级别的 ECC/奇偶校验检查。<br>ASIL 项目中需要配置，QM 项目选择 None。 |
| **Rx Processing**               | 接收处理方式     | 指定 CAN 控制器**接收报文**的处理方式。                      | - `POLLING`：轮询方式，在周期任务中读取邮箱。<br>- `INTERRUPT`：中断方式，由硬件中断触发处理。<br>根据系统实时性要求选择。 |
| **Tx Processing**               | 发送处理方式     | 指定 CAN 控制器**发送报文**的处理方式。                      | - `POLLING`：轮询方式，在周期任务中检查发送完成状态。<br>- `INTERRUPT`：中断方式，由硬件中断触发发送完成处理。<br>根据系统实时性要求选择。 |
| **Wakeup Processing**           | 唤醒处理方式     | 指定 CAN 控制器**唤醒事件**的处理方式。                      | - `POLLING`：通过轮询检测唤醒事件。<br>- `INTERRUPT`：通过中断检测唤醒事件。<br>根据低功耗设计需求选择。 |
| **Wakeup Source Id**            | 唤醒源 ID        | 该 CAN 控制器作为唤醒源时的**数字标识符**，用于 ECU 唤醒管理。 | 根据 OEM 唤醒设计配置，多个唤醒源使用唯一 ID。               |
| **Wakeup Source Ref**           | 唤醒源引用       | 引用 **EcuM（ECU 状态管理器）** 中的唤醒源配置，建立 CAN 控制器与 ECU 唤醒管理的关联。 | 如果该 CAN 控制器支持总线唤醒，则**必须正确引用**。          |
| **Wakeup Support**              | 唤醒支持         | 勾选后，表示该 CAN 控制器**支持总线唤醒功能**。              | 如果硬件支持 CAN 总线唤醒且项目需要该功能，则勾选。需与 CanIf 和 EcuM 中的唤醒配置配合。 |
| **vCan Extension Ref**          | vCan 扩展引用    | 引用 **vCan（虚拟 CAN）** 扩展配置，用于虚拟 CAN 通信场景（如软件仿真、测试环境）。 | 通常在虚拟开发或测试环境中使用，量产项目中指向实际的硬件 CAN 控制器。 |

> [!note]
>
> 1. **CAN 控制器配置的完整性**：一个完整的 CAN 控制器配置需要包含以下核心要素：
>    - **硬件信息**：`Controller Base Address`、`Controller Id`、`Cpu Clock Ref`。
>    - **波特率**：`Controller Default Baudrate` 指向波特率配置。
>    - **处理模式**：`Rx Processing`、`Tx Processing`、`Busoff Processing`。
>    - **唤醒支持**：`Wakeup Support`、`Wakeup Source Ref`（如果需要唤醒功能）。
>
> 2. **POLLING vs INTERRUPT 的选择**：
>    - **POLLING（轮询）**：适合低负载场景，实现简单，但实时性较低，占用 CPU 资源。
>    - **INTERRUPT（中断）**：适合高负载或实时性要求高的场景，响应快，但实现复杂。
>    - 通常接收使用中断、发送使用中断或轮询，具体取决于项目需求。
>
> 3. **CAN FD 配置注意事项**：
>    - `Fd Support` 设置为 `FULL` 时，需要同时配置 `CanControllerFdBaudrateConfig`。
>    - `Max Rx Data Len` 和 `Max Tx Data Len` 需要设置为 64 字节（CAN FD 最大数据长度）。

### CanControllerBaudrateConfig 实例

`CanControllerBaudrateConfig` 用于配置 **CAN 控制器的波特率参数**，定义 CAN 通信的比特率、采样点位置和时间段划分。该配置是 CAN 控制器能够正常通信的基础。

| 参数名称                           | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                     | 短名称              | 该波特率配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Baudrate Clock [kHz]**           | 波特率时钟          | 指定 CAN 控制器用于波特率生成的**输入时钟频率**，以 kHz 为单位。 | **必须与 MCU 硬件手册中的 CAN 时钟源频率一致**。该值通常来自 MCU 时钟配置。 |
| **Baudrate Prescaler**             | 波特率预分频器      | 指定 CAN 波特率时钟的**预分频值**。最终的时间量子（Time Quantum）时钟 = 波特率时钟 /（Baudrate Prescaler × 2）。 | 根据目标波特率和时钟频率计算得出。                           |
| **Controller Baud Rate [kbps]**    | 控制器波特率        | 指定 CAN 控制器的**目标波特率**，以 kbps 为单位。            | **必须与整车通信矩阵中的 CAN 波特率一致**。典型值：125、250、500、1000 kbps。 |
| **Controller Baud Rate Config ID** | 控制器波特率配置 ID | 该波特率配置在 Can 驱动模块内部的**数字标识符**，用于索引不同的波特率配置。 | 通常由工具自动生成，无需手动修改。                           |
| **Controller Prop Seg**            | 传播时间段          | 指定 CAN 位时间中的**传播时间段（Propagation Segment）** 长度，以时间量子（TQ）为单位。用于补偿网络中的物理传输延迟。 | 根据总线长度和传输延迟计算。                                 |
| **Controller Seg1**                | 时间段 1            | 指定 CAN 位时间中的**时间段 1（Phase Segment 1）** 长度，以时间量子（TQ）为单位。用于补偿边沿相位误差。 | 根据目标采样点位置计算。                                     |
| **Controller Seg2**                | 时间段 2            | 指定 CAN 位时间中的**时间段 2（Phase Segment 2）** 长度，以时间量子（TQ）为单位。用于补偿边沿相位误差。 | 根据目标采样点位置计算。                                     |
| **Controller Sync Jump Width**     | 同步跳转宽度        | 指定 CAN 控制器的**同步跳转宽度（Synchronization Jump Width，SJW）**，以时间量子（TQ）为单位。用于在重新同步时调整位时间。 | 通常设置为 1-4 TQ，典型值为 1 或 2。                         |

> [!note]
>
> 1. **CAN 位时间结构**：
>
>    ```text
>    位时间 = 1 / 波特率
>    位时间 = (Sync_Seg + Prop_Seg + Seg1 + Seg2) × TQ
>    采样点 = (Sync_Seg + Prop_Seg + Seg1) / 位时间
>    ```
>
>    - **Sync_Seg（同步段）**：固定为 1 TQ。
>    - **Prop_Seg（传播段）**：补偿物理延迟。
>    - **Seg1（相位段 1）** + **Seg2（相位段 2）**：补偿边沿误差。
>    - **SJW（同步跳转宽度）**：重新同步时的最大调整量。
>
> 2. **典型配置示例**（500 kbps，时钟 80 MHz）：
>
>    | 参数       | 值                   | 说明                                          |
>    | :--------- | :------------------- | :-------------------------------------------- |
>    | 波特率时钟 | 80000 kHz（80 MHz）  | MCU CAN 时钟                                  |
>    | 预分频器   | 1                    | 时钟分频                                      |
>    | TQ 时钟    | 40 MHz（80 MHz / 2） | 预分频后                                      |
>    | 位时间     | 40 TQ（500 kbps）    | 1 / 500k = 2µs，TQ = 25ns，2µs / 25ns = 80 TQ |
>    | Prop_Seg   | 64 TQ                | 传播段                                        |
>    | Seg1       | 63 TQ                | 相位段 1                                      |
>    | Seg2       | 32 TQ                | 相位段 2                                      |
>    | SJW        | 32 TQ                | 同步跳转宽度                                  |
>    | 采样点     | ~80%                 | (1+64+63)/(1+64+63+32)                        |
>
> 3. **波特率计算注意事项**：
>    - `Baudrate Prescaler` 的值会影响 TQ 的大小，从而影响位时间的划分。
>    - `Prop_Seg + Seg1 + Seg2 + 1` 必须等于位时间（以 TQ 为单位）。
>    - 采样点通常建议在 **75% - 85%** 之间，以获得良好的抗干扰能力。

### CanControllerFdBaudrateConfig 实例

`CanControllerFdBaudrateConfig` 用于配置 **CAN FD 控制器的数据段波特率参数**。CAN FD 支持在仲裁段和数据段使用不同的波特率，该配置定义了数据段（从 BRS 位之后）的高速波特率参数。

| 参数名称                              | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------ | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                        | 短名称           | 该 CAN FD 波特率配置实例的唯一标识名。                       | 用于在工具中识别该配置实例。                                 |
| **Baudrate Prescaler**                | 波特率预分频器   | 指定 CAN FD 数据段波特率时钟的**预分频值**。最终的时间量子（Time Quantum）时钟 = 波特率时钟 /（Baudrate Prescaler × 2）。 | 根据目标数据段波特率和时钟频率计算得出。                     |
| **Controller Fd Baud Rate [kbps]**    | 控制器 FD 波特率 | 指定 CAN FD 数据段的**目标波特率**，以 kbps 为单位。         | **必须与整车通信矩阵中的 CAN FD 数据段波特率一致**。典型值：1000、2000、5000 kbps。 |
| **Controller Prop Seg**               | 传播时间段       | 指定 CAN FD 数据段位时间中的**传播时间段（Propagation Segment）** 长度，以时间量子（TQ）为单位。 | 与标准 CAN 类似，但 CAN FD 数据段的位时间更短，需根据高速波特率重新计算。 |
| **Controller Secondary Sample Point** | 二次采样点       | 指定 CAN FD 数据段是否启用**二次采样点（Secondary Sample Point，SSP）**。SSP 用于 CAN FD 数据段的接收采样，提高高速通信的采样精度。 | 根据 MCU 硬件能力和项目需求配置。启用后需配置 SSP 的具体位置。 |
| **Controller Seg1**                   | 时间段 1         | 指定 CAN FD 数据段位时间中的**时间段 1（Phase Segment 1）** 长度，以时间量子（TQ）为单位。 | 根据目标采样点位置计算。CAN FD 数据段的采样点通常位于 75% 左右。 |
| **Controller Seg2**                   | 时间段 2         | 指定 CAN FD 数据段位时间中的**时间段 2（Phase Segment 2）** 长度，以时间量子（TQ）为单位。 | 根据目标采样点位置计算。                                     |
| **Controller Sync Jump Width**        | 同步跳转宽度     | 指定 CAN FD 数据段的**同步跳转宽度（Synchronization Jump Width，SJW）**，以时间量子（TQ）为单位。 | 通常设置为 1-8 TQ，具体值根据波特率和时钟计算。              |
| **Controller Tx Bit Rate Switch**     | 发送比特率切换   | 勾选后，该控制器**发送 CAN FD 帧时支持比特率切换（BRS，Bit Rate Switch）**，即仲裁段使用标准波特率，数据段使用 FD 波特率。 | **必须勾选**才能启用 CAN FD 的数据段高速传输。如果不勾选，即使配置了 FD 波特率也不会生效。 |

> [!note]
>
> 1. **CAN FD 的波特率切换机制**：
>
>    ```text
>    仲裁段（Arbitration Phase）  →  数据段（Data Phase）
>    使用标准波特率（如 500 kbps）→  使用 FD 波特率（如 2000 kbps）
>    ```
>
>    - 当 `Controller Tx Bit Rate Switch` 勾选且 CAN FD 帧中的 BRS 位为 1 时，数据段使用 FD 波特率。
>    - 标准 CAN 帧和 CAN FD 帧（BRS=0）始终使用标准波特率。
>
> 2. **CAN FD 典型配置示例**（数据段 2000 kbps）：
>
>    | 参数       | 值                   | 说明                                               |
>    | :--------- | :------------------- | :------------------------------------------------- |
>    | 波特率时钟 | 80000 kHz（80 MHz）  | MCU CAN 时钟                                       |
>    | 预分频器   | 1                    | 时钟分频                                           |
>    | TQ 时钟    | 40 MHz（80 MHz / 2） | 预分频后                                           |
>    | 位时间     | 20 TQ（2000 kbps）   | 1 / 2000k = 500ns，TQ = 25ns，500ns / 25ns = 20 TQ |
>    | Prop_Seg   | 16 TQ                | 传播段                                             |
>    | Seg1       | 15 TQ                | 相位段 1                                           |
>    | Seg2       | 8 TQ                 | 相位段 2                                           |
>    | SJW        | 8 TQ                 | 同步跳转宽度                                       |
>    | 采样点     | ~80%                 | (1+16+15)/(1+16+15+8)                              |
>
> 3. **波特率配置的完整性**：
>    - 如果 `Fd Support` 为 `FULL`，则 **必须配置** `CanControllerFdBaudrateConfig`。
>    - 如果 `Fd Support` 为 `NONE`，则不需要配置 FD 波特率。
>    - 标准 CAN 波特率（`CanControllerBaudrateConfig`）和 FD 波特率（`CanControllerFdBaudrateConfig`）是**独立配置**的，需要分别计算和验证。

### CanFilterMask 实例

`CanFilterMask` 用于配置 **CAN 控制器的硬件报文过滤掩码**，定义哪些 CAN ID 的报文能够通过硬件过滤被接收。该配置与硬件邮箱配合，在硬件层面实现报文的筛选。

| 参数名称              | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**        | 短名称          | 该过滤掩码配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Filter Code Value** | 过滤码值        | 指定硬件过滤的**过滤码（Filter Code）**，与 `Filter Mask Value` 配合使用。只有 `（报文 ID & Filter Mask）==（Filter Code & Filter Mask）` 时，报文才会被接收。 | 根据整车通信矩阵中的 CAN ID 计算配置。                       |
| **Filter Mask Id**    | 过滤掩码 ID     | 该过滤掩码在 Can 驱动模块内部的**数字标识符**，用于索引不同的过滤掩码配置。 | 通常由工具自动生成，无需手动修改。                           |
| **Filter Mask Value** | 过滤掩码值      | 指定硬件过滤的**掩码值（Filter Mask）**，用于定义 CAN ID 的哪些位需要匹配。每个位为 1 表示该位必须匹配，为 0 表示不关心该位。 | 根据过滤需求配置。`0x80000000` 为 29 位扩展帧的标识位，通常用于区分标准帧和扩展帧。 |
| **Is Locked**         | 是否锁定        | 勾选后，该过滤掩码配置**被锁定**，不允许在运行时动态修改。   | 通常保持默认（不勾选）。在需要保护过滤配置不被修改时勾选。   |

> [!note]
>
> 1. **CAN 硬件过滤的匹配规则**：
>
>    ```text
>    (接收到的 CAN ID & Filter Mask) == (Filter Code & Filter Mask)
>    ```
>
>    - 若匹配成功，报文被接收并存放到对应的硬件邮箱。
>    - 若匹配失败，报文被硬件丢弃，不产生中断或 CPU 开销。
>
> 2. **标准帧与扩展帧的过滤配置**：
>
>    | 帧类型                 | Filter Code Value | Filter Mask Value |
>    | :--------------------- | :---------------- | :---------------- |
>    | 标准帧（11 位）        | CAN ID            | `0x7FF`           |
>    | 扩展帧（29 位）        | CAN ID            | `0x1FFFFFFF`      |
>    | 同时接收标准帧和扩展帧 | 根据设计          | 根据设计          |
>
> 3. **多 ID 过滤的实现**：
>    - 如果需要接收多个 CAN ID，可以使用 `Filter Code Value` 和 `Filter Mask Value` 的组合实现范围过滤。
>    - 例如：`Filter Code = 0x100`，`Filter Mask = 0x700`，表示接收 0x100-0x1FF 范围内的所有报文。
>
> 4. **典型应用场景**：
>    - **接收特定 ID 报文**：`Filter Code = 0x108`，`Filter Mask = 0x7FF`。
>    - **接收一组 ID 报文**：`Filter Code = 0x100`，`Filter Mask = 0x700`。
>    - **接收所有报文**：`Filter Code = 0x0`，`Filter Mask = 0x0`。

### CanHardwareObject 实例

`CanHardwareObject` 是 Can 驱动模块中最核心的配置单元之一，每个实例对应 MCU CAN 控制器的一个**硬件邮箱/缓冲区对象**，定义了该邮箱的收发方向、关联的 CAN ID、数据长度、处理方式等。CanIf 层通过引用 `CanHardwareObject` 来实现报文的收发。

| 参数名称                        | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------ | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                  | 短名称             | 该硬件对象配置实例的唯一标识名。                             | 用于在工具中识别该配置实例，通常包含方向信息（如 `_Rx` 后缀表示接收）。 |
| **Controller Ref**              | 控制器引用         | **关键引用**。指向该硬件对象所属的 **CAN 控制器实例**，将该硬件邮箱绑定到具体的 CAN 控制器上。 | **必须正确引用**，否则该硬件对象无法关联到实际的 CAN 控制器硬件。 |
| **Enable Polling Processing**   | 启用轮询处理       | 勾选后，该硬件对象通过**轮询模式**处理报文收发；不勾选则通过**中断模式**处理。 | 需与 Can 控制器配置中的 `Rx Processing` / `Tx Processing` 保持一致。 |
| **Fd Padding Value**            | FD 填充值          | 指定 CAN FD 报文中**填充字节（Padding Byte）** 的值，用于填充数据段的空白部分。 | 通常保持默认值（`0x0`）。                                    |
| **Handle Type**                 | 句柄类型           | 指定该硬件对象在 Can 驱动中的**句柄类型**。                  | - `BASIC`：基本句柄。<br>- `FULL`：完整句柄。<br>- `MIXED`：混合句柄。<br>通常使用 `FULL`，具体取决于 MCU 的邮箱能力。 |
| **Hardware FIFO**               | 硬件 FIFO          | 勾选后，该硬件对象使用 **硬件 FIFO（先进先出）** 缓冲区管理多个报文，而非单个邮箱。 | 仅在 MCU 硬件支持且项目需要使用 FIFO 时勾选。                |
| **Id Type**                     | ID 类型            | 指定该硬件对象接收/发送的 CAN ID 类型。                      | - `STANDARD`：标准帧（11 位 ID）。<br>- `EXTENDED`：扩展帧（29 位 ID）。<br>**必须与整车通信矩阵一致**。 |
| **Id Value**                    | ID 值              | 指定该硬件对象接收/发送的 **CAN ID 数值**。                  | **必须与整车通信矩阵中的 CAN ID 一致**。                     |
| **Main Function RW Period Ref** | 主函数读写周期引用 | 引用 `CanMainFunctionRWPeriods` 中的周期配置，指定该硬件对象的**轮询处理周期**。 | 仅在轮询模式下需要配置。                                     |
| **Max Data Len**                | 最大数据长度       | 指定该硬件对象支持的最大数据长度，以字节为单位。             | 标准 CAN 为 8 字节，CAN FD 最大为 64 字节。                  |
| **Multiplexed Transmission**    | 多路复用传输       | 勾选后，该硬件对象支持**多路复用传输**，即多个不同的 CAN ID 共享同一个硬件邮箱。 | 仅在多路复用场景中需要启用，一般项目保持不勾选。             |
| **Object Hw Handle**            | 对象硬件句柄       | 指定该硬件对象在 Can 驱动中的**硬件句柄编号**，对应 MCU 硬件邮箱的索引。 | 根据 MCU 硬件设计配置，通常由 MCAL 供应商提供。              |
| **Object Hw Size**              | 对象硬件大小       | 指定该硬件对象的**硬件缓冲区大小**，以报文数（帧数）为单位。 | 通常为 1，表示单报文邮箱。FIFO 场景下可能大于 1。            |
| **Object Id**                   | 对象 ID            | 该硬件对象在 Can 驱动模块内部的**数字标识符**。              | 通常由工具自动生成，无需手动修改。                           |
| **Object Type**                 | 对象类型           | 指定该硬件对象的方向类型。                                   | - `RECEIVE`：接收邮箱。<br>- `TRANSMIT`：发送邮箱。<br>**必须与硬件邮箱的实际用途一致**。 |
| **Filter Mask Ref**             | 过滤掩码引用       | 引用 `CanFilterMask` 实例，为该接收硬件对象指定 **硬件过滤掩码**。 | **接收邮箱必须正确引用**，否则无法实现硬件过滤。发送邮箱通常不需要配置。 |

> [!note]
>
> 1. **CanHardwareObject 与 CanIf 的关联**：
>
>    ```text
>    CanIf Hrh/Hth（HOH） → 引用 → CanHardwareObject
>    ```
>
>    - CanIf 中的 `CanIfHrhCfgs`（接收 HOH）通过 `Hrh Id Sym Ref` 引用 `CanHardwareObject`（接收邮箱）。
>    - CanIf 中的 `CanIfHthCfgs`（发送 HOH）通过 `Hth Id Sym Ref` 引用 `CanHardwareObject`（发送邮箱）。
>    - 该引用建立了 CanIf 层与 Can 驱动层的**关键绑定**，确保报文能够在正确的硬件邮箱上收发。
>
> 2. **Object Type 与 Short Name 的对应关系**：
>    - `Object Type = RECEIVE` 的实例，Short Name 通常包含 `_Rx` 后缀。
>    - `Object Type = TRANSMIT` 的实例，Short Name 通常包含 `_Tx` 后缀。
>
> 3. **FIFO 与单邮箱的选择**：
>    - **单邮箱（Hardware FIFO 不勾选）**：每个邮箱只能存储一个报文，适合低负载或高优先级报文。
>    - **FIFO（Hardware FIFO 勾选）**：一个硬件对象可以存储多个报文，适合高负载接收场景。

## CanGeneral 

`CanGeneral` 是 Can 驱动模块的**顶层通用配置容器**，用于配置 CAN 驱动的全局行为参数，包括错误处理、中断管理、任务周期、功能开关等基础设置。

| 参数名称                                             | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Change Baudrate Api**                              | 改变波特率 API         | 勾选后，生成 **`Can_ChangeBaudrate`** API，允许在运行时动态修改 CAN 波特率。 | 仅在需要运行时切换波特率的场景中启用（如 CAN FD 仲裁段与数据段切换），一般项目保持关闭。 |
| **Check Wakeup Can Ret Type**                        | 检查唤醒 CAN 返回类型  | 勾选后，启用**唤醒验证时的 CAN 返回类型检查**，用于在唤醒事件验证过程中检查 CAN 返回值的类型是否正确。 | 与 CanIf 中的同名参数配合使用，一般保持默认（不勾选）。      |
| **Counter Ref**                                      | 计数器引用             | 引用 **OS（操作系统）计数器** 配置，用于 CAN 驱动的超时计时和时间管理。 | 根据项目 OS 配置引用对应的系统计数器。                       |
| **Dev Error Detection**                              | 开发错误检测           | 勾选后，启用 Can 驱动内部的**开发错误检测**，当检测到参数错误、状态错误时，调用 `Det_ReportError` 报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Enable Security Event Reporting**                  | 启用安全事件报告       | 勾选后，启用**安全事件报告**功能，将安全相关事件上报给安全模块。 | 仅在 ASIL/功能安全项目中需要勾选。QM 项目保持关闭。          |
| **Enable optimizations for hardware buffer lengths** | 启用硬件缓冲区长度优化 | 勾选后，启用针对**硬件缓冲区长度的优化**，根据实际硬件能力调整缓冲区配置。 | 通常保持默认（不勾选）。                                     |
| **Generic Confirmation**                             | 通用确认               | 指定 **发送确认** 的通用回调函数配置。                       | - `API1`：使用标准发送确认 API。<br>- 其他选项：根据项目需求选择。<br>通常使用 `API1`。 |
| **Generic Confirmation API2**                        | 通用确认 API2          | 勾选后，启用 **通用确认 API2**，提供额外的发送确认回调接口。 | 仅在需要扩展发送确认功能时启用，一般保持默认（不勾选）。     |
| **Generic Pre Transmit**                             | 通用发送前处理         | 勾选后，启用**发送前通用处理**，在报文实际发送前执行额外的预处理逻辑。 | 仅在需要发送前预处理时启用，一般保持默认（不勾选）。         |
| **Generic Precopy**                                  | 通用预复制             | 勾选后，启用**通用预复制**功能，在发送前将数据预复制到硬件缓冲区。 | 一般保持默认（不勾选）。                                     |
| **Get Status**                                       | 获取状态 API           | 勾选后，生成 **`Can_GetStatus`** API，用于获取 CAN 控制器的当前状态。 | 建议勾选，便于状态监控和调试。                               |
| **Hardware Cancel By Appl**                          | 应用层硬件取消         | 勾选后，允许**应用层取消**硬件发送操作。                     | 仅在应用层需要主动取消发送时启用，一般保持默认（不勾选）。   |
| **Hardware Handle Type**                             | 硬件句柄类型           | 指定 Can 驱动内部使用的**硬件句柄数据类型**。                | - `UINT8`：使用 8 位句柄（最多 255 个硬件对象，最常用）。<br>- `UINT16`：使用 16 位句柄。<br>通常选择 `UINT8`。 |
| **Hardware Loop Check**                              | 硬件循环检查           | 勾选后，启用**硬件循环检查**，用于检测硬件缓冲区是否出现循环覆盖。 | 通常在功能安全场景中启用，一般项目保持默认（不勾选）。       |
| **Hardware Transmit Cancellation**                   | 硬件发送取消           | 勾选后，启用**硬件发送取消**功能，允许取消已放入硬件发送队列的报文。 | 需要硬件支持，与 CanIf 中的 `Controller Driver Tx Cancellation` 配合使用。 |
| **Identical Id Cancellation**                        | 相同 ID 取消           | 勾选后，当发送队列中存在相同 CAN ID 的报文时，**取消旧的报文**，只发送最新的。 | 仅在需要此行为时启用，一般保持默认（不勾选）。               |
| **Index**                                            | 索引                   | Can 驱动模块在 BSW 模块列表中的**索引号**。                  | 通常由工具自动生成，无需手动修改。                           |
| **Interrupt Category**                               | 中断类别               | 指定 Can 驱动使用的中断类别。                                | - `CATEGORY1`：一类中断。<br>- `CATEGORY2`：二类中断。<br>根据 OS 配置和项目需求选择。 |
| **Interrupt Lock**                                   | 中断锁定               | 指定 Can 驱动的**中断锁定机制**。                            | - `DRIVER`：由驱动自身管理中断锁定。<br>- `OS`：由 OS 管理中断锁定。<br>根据项目架构选择。 |
| **LPDu Receive Callout Function**                    | LPDu 接收回调函数      | 勾选后，启用 **LPDu（Low Power Du，低功耗数据单元）** 接收回调函数。 | 仅在低功耗通信场景中需要配置，一般项目保持默认（不勾选）。   |
| **Main Function Busoff Period [ms]**                 | 主函数 Busoff 周期     | 指定 **Bus Off（总线关闭）** 检测主函数的执行周期，以毫秒为单位。 | 根据项目调度周期配置，通常为 5-10ms。                        |
| **Main Function Mode Period [ms]**                   | 主函数模式周期         | 指定 **模式管理** 主函数的执行周期，以毫秒为单位。           | 根据项目调度周期配置，通常为 10ms。                          |
| **Main Function Wakeup Period [ms]**                 | 主函数唤醒周期         | 指定 **唤醒检测** 主函数的执行周期，以毫秒为单位。           | 根据项目调度周期配置，通常为 10ms。                          |
| **Mirror Mode Support**                              | 镜像模式支持           | 勾选后，启用 **镜像模式（Mirror Mode）**，将总线上的报文镜像到另一个接口，用于调试/监控。 | 仅在调试场景中启用，量产版本保持关闭。                       |
| **Multiplexed Transmission**                         | 多路复用传输           | 勾选后，启用 **多路复用传输** 功能，允许多个 CAN ID 共享同一个硬件邮箱进行发送。 | 仅在需要多路复用发送时启用，一般保持默认（不勾选）。         |
| **Overrun Notification**                             | 溢出通知               | 勾选后，当硬件缓冲区发生**溢出**时，Can 驱动会触发溢出通知回调。 | 建议勾选，便于检测和处理接收溢出事件。                       |
| **Ram Check**                                        | RAM 检查               | 指定 Can 驱动模块的 **RAM 检查** 类型，用于功能安全场景中的内存错误检测。 | - `None`：不执行 RAM 检查。<br>- `DET`：使用 DET 错误检测。<br>ASIL 项目中需要配置，QM 项目选择 None。 |
| **Relinitialization While Start Transition**         | 启动转换时重新初始化   | 勾选后，在 **启动转换（Start Transition）** 过程中重新初始化 Can 驱动模块。 | 根据项目需求配置，一般保持默认（不勾选）。                   |
| **Runtime Measurement Support**                      | 运行时测量支持         | 勾选后，启用 **运行时测量** 功能，用于监控 Can 驱动的运行时性能（如执行时间）。 | 仅在性能分析和调试阶段启用，量产版本保持关闭。               |
| **Rx Queue**                                         | 接收队列               | 勾选后，启用 **接收队列（Rx Queue）** 功能，将接收到的报文暂存到队列中，等待主函数处理。 | 建议勾选，提高接收报文的可靠性，防止中断处理时间过长导致丢帧。 |
| **Rx Queue Size**                                    | 接收队列大小           | 指定 **接收队列（Rx Queue）** 的**最大容量**，即最多可暂存的报文数量。 | 根据项目负载配置，典型值为 10-50。配置过小可能导致丢帧，配置过大浪费内存。 |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                          | 开发阶段 | 量产阶段             |
>    | :---------------------------- | :------- | :------------------- |
>    | `Dev Error Detection`         | ✅ 勾选   | ❌ 关闭               |
>    | `Mirror Mode Support`         | ✅ 勾选   | ❌ 关闭               |
>    | `Runtime Measurement Support` | ✅ 勾选   | ❌ 关闭               |
>    | `Overrun Notification`        | ✅ 勾选   | ✅ 勾选               |
>    | `Rx Queue`                    | ✅ 勾选   | ✅ 勾选               |
>    | `Ram Check`                   | DET      | None（或 ASIL 配置） |
>
> 2. **主函数周期的配置原则**：
>    - `Main Function Busoff Period`、`Main Function Mode Period`、`Main Function Wakeup Period` 是轮询模式下的关键周期参数。
>    - 这些周期应根据项目整体调度策略配置，通常在 5-20ms 之间。
>    - 如果使用中断模式，这些周期参数可以适当放宽。

### CanMainFunctionRWPeriods 实例

`CanMainFunctionRWPeriods` 用于配置 **CAN 驱动轮询模式下的读写周期**，定义接收和发送主函数的执行频率。该配置仅在 CAN 控制器或硬件对象使用轮询处理方式时生效。

| 参数名称                       | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                 | 短名称          | 该读写周期配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Main Function Read Period**  | 主函数读取周期  | 指定 **接收处理主函数（Can_MainFunction_Read）** 的执行周期，以毫秒为单位。该函数负责检查硬件接收邮箱，将接收到的报文传递给上层（CanIf）。 | 仅在轮询模式下有效。周期越短，接收延迟越低，但 CPU 负载越高。需根据项目实时性要求和总线负载权衡配置。 |
| **Main Function Write Period** | 主函数写入周期  | 指定 **发送处理主函数（Can_MainFunction_Write）** 的执行周期，以毫秒为单位。该函数负责检查硬件发送邮箱，将待发送报文写入硬件并触发发送。 | 仅在轮询模式下有效。周期越短，发送延迟越低，但 CPU 负载越高。需根据项目实时性要求和总线负载权衡配置。 |

> [!note]
>
> 1. **轮询模式 vs 中断模式**：
>    - **轮询模式**：主函数按固定周期执行，检查硬件状态并处理报文。适用于低负载或实时性要求不高的场景。
>    - **中断模式**：硬件事件触发中断，在中断服务函数中立即处理报文。适用于高负载或实时性要求高的场景。
>
> 2. **读写周期的典型配置**：
>    - `Main Function Read Period`：通常配置为 **1-5ms**，确保接收延迟在可接受范围内。
>    - `Main Function Write Period`：通常配置为 **1-5ms**，确保发送延迟在可接受范围内。
>    - 读写周期可以独立配置，根据系统负载情况调整。
>
> 3. **周期配置的影响**：
>    - **周期过短**：CPU 负载增加，可能影响系统其他任务的执行。
>    - **周期过长**：报文接收/发送延迟增加，可能导致丢帧或通信超时。
>
> 4. **与 CanGeneral 中主函数周期的关系**：
>    - `CanMainFunctionRWPeriods` 配置的是**读写处理**的周期。
>    - `CanGeneral` 中的 `Main Function Busoff Period`、`Main Function Mode Period`、`Main Function Wakeup Period` 配置的是**状态管理**相关主函数的周期。
>    - 两者共同覆盖 CAN 驱动主函数的全部处理内容。

# CanIf

**CanIf** 是 AUTOSAR 通信栈中位于 **CAN 驱动（Can）** 和 **上层通信服务（如 PduR 路由层、Com 模块）** 之间的核心抽象层。它主要负责屏蔽底层 CAN 硬件的差异，为上层提供统一的接口，并处理 CAN 报文的收发路由。

| 容器名称              | 中文惯称 / 别名                   | 核心功能职责                                                 | 关键配置内容举例                                             |
| :-------------------- | :-------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **CanIfCtrlDrvCfgs**  | CAN 控制器驱动配置                | 配置 **MCU 内部 CAN 控制器**（硬件外设）的底层驱动实例。它将上层逻辑接口与具体的硬件 CAN 控制器绑定。 | 关联具体的底层 CAN 驱动模块（Can），配置 CAN 控制器的硬件索引号、时钟源参考、以及基础波特率（通常引用 Can 模块中已定义好的波特率配置）。 |
| **CanIfTrcvDrvCfgs**  | CAN 收发器驱动配置                | 配置 **外部 CAN 物理层收发器芯片** 的驱动。主要负责管理收发器的睡眠/唤醒、总线错误检测等物理层状态。 | 关联收发器驱动模块（CanTrcv），配置收发器的类型（如 TJA1043）、唤醒方式（本地唤醒/总线唤醒）、以及错误反馈机制。 |
| **CanIfDispatchCfgs** | **分发 / 路由配置**（**最核心**） | **这是 CanIf 最重要的配置区域**。它定义了 CAN 报文（基于 CAN ID）在接收到或发送时，应该如何路由到上层模块（如 PduR）。 | 配置 **HOH（硬件对象句柄，Hardware Object Handle）** 与 **PDU（协议数据单元，Protocol Data Unit）** 的映射关系。例如：哪个 CAN ID 对应哪个 PDU ID，触发方式是中断还是轮询，以及关联到哪个控制器。 |
| **CanIfInitCfgs**     | 初始化配置                        | 配置 CanIf 模块在系统上电启动时的**初始化默认参数**和全局状态。 | 配置需要被 CanIf 管理的控制器列表、各控制器的初始工作模式（如正常模式 Normal 或 睡眠模式 Sleep），以及唤醒确认超时时间等。 |
| **CanIfPrivateCfgs**  | 私有配置                          | （**Vector 特有概念**）用于存放当前特定**配置变体（Variant）** 下专属的配置参数。这些参数不与其他变体共享，灵活性最高。 | 通常包含当前变体专用的内部状态标记、特定于该硬件版本的报文缓冲区尺寸微调等参数。 |
| **CanIfPublicCfgs**   | 公共配置                          | （**Vector 特有概念**）用于存放**跨多个配置变体（Variants）** 都可以共享的公共参数，实现复用，减少重复配置。 | 定义公共的 PDU 路由表结构或通用的 HOH 配置模板，供不同的项目变体引用，保证基础路由逻辑的一致性。 |

> [!note]
>
> 在配置 CanIf 时，通常遵循以下逻辑顺序：
>
> 1.  **先底层**：先完成 `CanIfCtrlDrvCfgs`（控制器）和 `CanIfTrcvDrvCfgs`（收发器）的配置，因为它们定义的是物理硬件基础。
> 2.  **后核心**：在硬件基础确定后，重点配置 `CanIfDispatchCfgs`，这是通信能否打通的关键，需要仔细核对 CAN ID 与上层 PDU ID 的映射关系。
> 3.  **再全局**：最后检查 `CanIfInitCfgs` 中的启动参数，确保初始状态符合系统设计。
> 4.  **变体管理**：如果项目有多个硬件版本或配置变体，通过 `PrivateCfgs`（变体专属）和 `PublicCfgs`（变体共享）来有效管理差异部分。

## CanIfCtrlDrvCfgs

```txt
CanIf
└── CanIfCtrlDrvCfgs
    └── CanIfCtrlDrvCfg实例
        └── CanIfCtrlCfgs
            ├── CanIfCtrlCfg实例1
            └── CanIfCtrlCfg实例2
```

### CanIfCtrlDrvCfg实例

可以在**CanIfCtrlDrvCfgs** 容器下进行一个具体配置项，用于将上层 **CanIf** 模块与底层具体的 **CAN 控制器驱动（Can Driver）** 实例绑定起来。

| 参数名称                              | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------ | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                        | 短名称                        | 这个配置实例在工具中的**唯一标识名**。工具自动生成的后缀（如 `_7d254554`）通常是为了保证唯一性。你可以手动改成更有业务含义的名称，例如 `CanIf_Ctrl_CAN0`。 | 建议**重命名**，使其能清晰对应到具体的物理 CAN 控制器（如 CAN0、CAN1），便于后期维护。 |
| **AUTOSAR release version**           | AUTOSAR 发布版本              | 指定这个驱动配置所遵循的 **AUTOSAR 标准版本**。例如 `CAN_DRV_EQC_MSRC` 可能是一个特定于 MCU（如英飞凌 AURIX）或 Vector 自己实现的 CAN 驱动变体。 | 这个值通常由工具或 MCAL 供应商预设好，**一般不需要手动修改**。如果你切换了底层驱动库，这里可能需要同步调整。 |
| **Controller Driver Tx Cancellation** | 控制器驱动发送取消功能        | 勾选后，表示该 CAN 控制器**支持取消已经放入硬件发送队列但尚未发出的报文**。这通常用于上层需要紧急终止某条待发报文的场景。 | 这个功能是否支持，取决于底层 **Can 驱动**是否实现了对应的取消接口。如果硬件不支持或驱动没实现，勾选也无法生效。 |
| **Ctrl Drv Init Hoh Config Ref**      | 控制器驱动初始化 HOH 配置引用 | **引用（Reference）** 到该控制器在**初始化阶段（Init）** 所关联的 **HOH（硬件对象句柄）** 配置。这里的值 `/ActiveEcuC/CanIf/CanIfInitCfg/CanIfInitHohCfg` 表示它引用了初始化容器下的某个 HOH 配置组。 | 这个引用建立了该控制器的 HOH 与初始化参数的**一一对应关系**。它是 CanIf 能够正确初始化每个控制器的关键绑定，**必须确保引用有效**。 |
| **Ctrl Drv Name Ref**                 | 控制器驱动名称引用            | **最关键的一个引用**。它指向底层 **Can 驱动模块（Can）** 中定义的**具体控制器实例**。这里的值 `/ActiveEcuC/Can/CanGeneral` 表示它引用的是 Can 模块的通用配置中的某个控制器。 | 这个引用决定了这个 `CanIfCtrlDrvCfg` 实例**实际控制的是 MCU 上的哪一个 CAN 硬件外设**（如 CAN0， CAN1）。**必须与硬件设计完全一致**，否则通信失败。 |
| **Rx Indication Prototype**           | 接收指示函数原型              | 定义当该控制器收到 CAN 报文时，CanIf 层**调用上层（通常是 PduR）的回调函数名称**。这是一个函数指针的占位符，具体实现由 RTE 或上层模块提供。 | 通常保持默认或留空，由工具链根据后续配置自动生成。如果手动填写，必须保证函数签名和上层模块（如 PduR）的接口定义完全匹配。 |

> [!note]
>
> 1.  **一个 `CanIfCtrlDrvCfg` 实例 = 一个物理 CAN 控制器**。如果你 MCU 上有 2 路 CAN（CAN0 和 CAN1），那么这里通常就会有 2 个类似的配置实例。
> 2.  **最关键的两个引用**：
>     *   `Ctrl Drv Name Ref` → 指向底层 Can 模块，决定是 CAN0 还是 CAN1。
>     *   `Ctrl Drv Init Hoh Config Ref` → 指向初始化配置，决定这个控制器在启动时的 HOH 分配方案。
> 3.  **Tx Cancellation** 是可选高级功能，根据项目需求勾选即可。

### CanIfCtrlCfgs

CanIfCtrlCfgs vs CanIfCtrlDrvCfgs 的区别：

| 容器                 | 职责定位                                                     | 类比                                                         |
| :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **CanIfCtrlDrvCfgs** | 配置 **CanIf 与底层 Can 驱动的绑定关系**，是"驱动层"的视角   | 告诉系统："这个 CanIf 实例用哪个 Can 驱动实例"               |
| **CanIfCtrlCfgs**    | 配置 **CanIf 层面对该 CAN 控制器的行为属性**，是"控制器管理层"的视角 | 告诉系统："这个 CAN 控制器在 CanIf 层面有哪些属性（ID、唤醒、分区等）" |

两者通过引用关联：`CanIfCtrlDrvCfgs` 中的 `Ctrl Drv Name Ref` 指向 Can 驱动，而 `CanIfCtrlCfgs` 中的 `Controller Can Controller Ref` 同样指向 Can 模块的控制器配置——但侧重点不同。

| 参数名称                                     | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                               | 短名称                        | 这个控制器配置实例在 CanIf 模块中的**唯一标识名**。后缀是工具自动生成的唯一哈希值。 | 建议改成更直观的名字，如 `CanIf_Ctrl_CAN1`，方便在引用列表中快速识别。 |
| **Controller Can Controller Ref**            | 控制器 → Can 模块的控制器引用 | 这个引用指向 **Can 驱动模块（Can）** 中定义的具体 CAN 控制器配置实例。它建立了 CanIf 层控制器配置与底层硬件驱动的关联。 | **必须与 `CanIfCtrlDrvCfgs` 中的引用指向同一个 Can 控制器实例**，确保两层配置的一致性。这里是整个配置链路的"汇合点"。 |
| **Controller Id**                            | 控制器 ID                     | 该 CAN 控制器在 **CanIf 模块内部**使用的数字标识符。通常与硬件 CAN 控制器的编号一致（如 CAN0→0，CAN1→1）。 | 这个 ID 会被上层模块（如 PduR）用于标识报文来自哪个 CAN 通道。**必须与硬件编号一一对应**，否则会导致路由混乱。 |
| **Controller J1939 Dynamic Address Support** | J1939 动态地址支持            | 是否启用 **SAE J1939 协议**中的动态地址分配功能。J1939 是商用车/重型车辆常用的 CAN 高层协议。 | - **DISABLED**：不使用 J1939 动态地址（最常见）。<br>- **ENABLED**：启用后，CanIf 需要支持 J1939 地址协商逻辑。通常只有商用车项目才会开启。 |
| **Controller Transceiver Cfg Ref**           | 收发器配置引用                | 引用该 CAN 控制器所对应的**外部收发器（Transceiver）** 配置。这个引用指向 `CanIfTrcvDrvCfgs` 下定义的收发器实例。 | 一个控制器**必须**关联一个收发器配置（除非收发器由其他机制独立管理）。这里的引用 `CanIfTrcvCfg_Vehicle` 表示该控制器使用名为 Vehicle 的收发器配置。 |
| **Controller Wakeup Support**                | 控制器唤醒支持                | 勾选后，表示该 CAN 控制器**支持从睡眠/待机模式下被总线活动唤醒**。 | 依赖硬件支持。如果 MCU 的 CAN 控制器没有唤醒能力，勾选也无法生效。通常用于需要支持 CAN 总线唤醒的低功耗场景。 |
| **Double Hash Random1 / Random2**            | 双哈希随机数 1 / 2            | Vector 工具内部用于**缓存或标识配置变体**的哈希值，用于增量构建时判断配置是否发生变化。 | **一般不需要手动修改**。这两个值是工具自动生成和维护的，用于提升增量编译的效率。 |
| **Ecu Partition Ref**                        | ECU 分区引用                  | 引用该 CAN 控制器所属的 **ECU 分区（Partition）**。在支持 **多核 / 功能安全（ISO 26262）** 的项目中，用于将不同 CAN 控制器分配到不同的 CPU 核心或安全域。 | - 如果项目是**单核**，通常保持默认或留空。<br>- 如果是**多核**或**ASIL 分区**场景，需要正确引用对应的分区配置，确保中断和数据处理在正确的核心上执行。 |

> [!note]
>
> 你现在看到的 `CanIfCtrlCfgs` 是整个 CanIf 配置链路的中间一环，完整链路如下：
>
> ```text
> CanIfCtrlDrvCfgs（驱动绑定）  →  CanIfCtrlCfgs（控制器属性）  →  CanIfDispatchCfgs（路由分发）
>      ↓                              ↓                              ↓
> "用哪个Can驱动"              "控制器的ID/唤醒/分区"           "报文怎么路由到上层"
> ```
>
> - **上层（PduR）** 通过 `Controller Id` 来识别报文来源。
> - **底层（Can 驱动）** 通过 `Controller Can Controller Ref` 来操作硬件。
> - **收发器** 通过 `Controller Transceiver Cfg Ref` 来管理物理层。
>
> 这三个环节的引用必须全部对齐，CAN 通信才能正常工作。

## CanIfTrcvDrvCfgs

```txt
CanIf
└── CanIfTrcvDrvCfgs
    └── CanIfTrcvDrvCfg实例
        └── CanIfTrcvCfgs
            └── CanIfTrcvCfg实例
```

### CanIfTrcvCfg实例

可以在 **CanIfTrcvDrvCfgs** 容器下进行具体配置项，用于将上层 **CanIf** 模块与底层具体的 **CAN 收发器驱动（CanTrcv Driver）** 实例绑定起来。该配置决定了 CanIf 使用哪个收发器芯片，以及该收发器的 ID、唤醒支持等属性。

| 参数名称                           | 中文直译 / 作用             | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------- | :-------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                     | 短名称                      | 这个收发器配置实例在 CanIf 模块中的**唯一标识名**。          | 建议改成有意义的名字，如 `CanIf_Trcv_CAN1`，便于识别该收发器对应的 CAN 通道。 |
| **Transceiver CanTransceiver Ref** | 收发器 → CanTrcv 模块的引用 | **最关键的一个引用**。它指向底层 **CanTrcv 驱动模块**中定义的具体收发器芯片配置实例。 | 这个引用决定了该 CanIf 收发器实例**实际控制的是哪个物理收发器芯片**。**必须与硬件设计完全一致**，否则总线物理层无法正常工作。 |
| **Transceiver Id**                 | 收发器 ID                   | 该收发器在 **CanIf 模块内部**使用的数字标识符。              | 这个 ID 用于 CanIf 内部区分不同的收发器实例。通常与硬件设计对应，多个收发器时 ID 应唯一。 |
| **Transceiver Wakeup Support**     | 收发器唤醒支持              | 勾选后，表示该收发器**支持总线唤醒功能**，即当总线上出现唤醒报文时，收发器可以唤醒 ECU。 | 依赖硬件支持。若收发器芯片支持唤醒功能（如 TJA1043 的 WAKE 引脚），勾选后 CanIf 会启用相关唤醒处理逻辑。需与 `CanIfCtrlCfgs` 中的 `Controller Wakeup Support` 配合使用。 |

> [!note]
>
> 1. **一个 `CanIfTrcvCfg` 实例 = 一个物理 CAN 收发器芯片**。如果硬件上有 2 路 CAN，每路各有一个收发器，则通常需要配置 2 个实例。
> 2. **最关键的一个引用**：
>    - `Transceiver CanTransceiver Ref` → 指向底层 CanTrcv 模块，决定是哪个物理收发器芯片。
> 3. **唤醒功能的两个开关**：
>    - `CanIfTrcvCfg` 中的 `Transceiver Wakeup Support` → 收发器层面的唤醒能力。
>    - `CanIfCtrlCfgs` 中的 `Controller Wakeup Support` → 控制器层面的唤醒能力。
>    - 两者需要**同时启用**，总线唤醒功能才能完整工作。
> 4. `CanIfTrcvDrvCfgs` 和 `CanIfCtrlDrvCfgs` 是平级关系，分别管理收发器和控制器，两者通过 `CanIfCtrlCfgs` 中的 `Controller Transceiver Cfg Ref` 关联起来。

## CanIfDispatchCfgs

**CanIfDispatchCfgs** 是 CanIf 模块的**核心路由配置容器**。它定义了 CAN 报文在接收和发送时的**分发（路由）规则**，即当某个 CAN ID 的报文到达时，CanIf 应该调用上层的哪个回调函数来处理该报文。同时，它也配置了各种**用户回调函数（User Callback）**，用于将 CanIf 检测到的各种事件（如总线关闭、收发器模式变化、唤醒事件等）通知给上层模块（如 CanSM、EcuM）。

以下参数均为**回调函数指针**，用于将 CanIf 层的事件通知到上层模块：

| 参数名称                                                 | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                           | 短名称                     | 该分发配置实例在 CanIf 模块中的**唯一标识名**。              | 通常保持默认，因为通常整个 CanIf 模块只需要一个分发配置。    |
| **Dispatch Data Checksum Rx Error Indication Name / UL** | 数据校验和接收错误指示回调 | 当 CanIf 检测到接收到的 CAN 数据帧的**校验和（Checksum）错误**时，调用此回调函数通知上层。 | 通常用于 **E2E（端到端通信保护）** 场景。如果项目中使用了 E2E 校验，需要在此配置对应的上层处理函数。 |
| **User Check Trcv Wake Flag Indication Name / UL**       | 检查收发器唤醒标志指示回调 | 上层模块（如 CanSM）通过此回调**查询**收发器的唤醒标志状态，以判断当前唤醒源是否为 CAN 总线唤醒。 | 通常指向 **CanSM** 模块的处理函数。需要与 `User Clear Trcv Wuf Flag Indication` 配合使用。 |
| **User Clear Trcv Wuf Flag Indication Name / UL**        | 清除收发器唤醒标志指示回调 | 上层模块通过此回调**清除**收发器的唤醒标志，通常在唤醒事件被处理完成后调用。 | 通常指向 **CanSM** 模块的处理函数。用于完成唤醒事件的"消费"确认。 |
| **User Confirm Pn Availability Name / UL**               | 确认部分网络可用性回调     | 用于 **Partial Networking（部分网络）** 功能。当 CanIf 确认某个 CAN 通道的部分网络可用时，调用此回调通知上层。 | 只有在使用了 **Partial Networking** 功能的项目中才需要配置。通常指向 **CanSM** 模块。 |
| **User Ctrl Bus Off Name / UL**                          | 控制器总线关闭指示回调     | 当 CanIf 检测到某个 CAN 控制器发生 **Bus Off（总线关闭）** 事件时，调用此回调函数通知上层模块（如 CanSM、COM）。 | **必须配置**。通常指向 **CanSM** 模块的 `CanSM_ControllerBusOff` 函数。CanSM 收到后会执行总线关闭恢复策略（如自动重连或进入安全状态）。 |
| **User Ctrl Mode Indication Name / UL**                  | 控制器模式指示回调         | 当 CAN 控制器的模式发生变化时（如从 Normal 切换到 Sleep 或 Stopped），CanIf 通过此回调通知上层。 | 用于上层模块（如 CanSM）感知控制器状态变化，以便执行相应的状态管理逻辑。通常指向 **CanSM** 模块。 |
| **User Ram Check Corrupt Controller Name / UL**          | RAM 校验失败（控制器）回调 | 当 CanIf 检测到与**控制器**相关的 RAM 区域发生数据损坏时，调用此回调通知上层。 | 属于**内存保护/功能安全**相关配置。通常在功能安全（ISO 26262）项目中需要配置。如果项目没有安全要求，通常留空。 |
| **User Ram Check Corrupt Mailbox Name / UL**             | RAM 校验失败（邮箱）回调   | 当 CanIf 检测到与**硬件邮箱（Mailbox）** 相关的 RAM 区域发生数据损坏时，调用此回调通知上层。 | 同上，属于**内存保护/功能安全**相关配置。如果项目没有安全要求，通常留空。 |
| **User Trcv Mode Indication Name / UL**                  | 收发器模式指示回调         | 当 CAN 收发器的模式发生变化时（如从 Normal 切换到 Sleep 或 Standby），CanIf 通过此回调通知上层。 | 用于上层模块（如 CanSM）感知收发器状态变化。通常指向 **CanSM** 模块的 `CanSM_TransceiverModeIndication` 函数。 |
| **User Validate Wakeup Event Name / UL**                 | 验证唤醒事件回调           | 当 CanIf 检测到唤醒事件时，通过此回调**向上层请求验证**该唤醒事件是否有效（例如，确认是否为虚假唤醒）。 | 通常指向 **EcuM（ECU 状态管理器）** 模块的 `EcuM_ValidateWakeupEvent` 函数。EcuM 会根据系统状态决定是否响应该唤醒事件。 |

> [!note]
>
> 1. **最核心的配置区域**：`CanIfDispatchCfgs` 是 CanIf 模块中**最关键**的配置容器之一（另一个是路由表 `CanIfRxPduCfgs`/`CanIfTxPduCfgs`）。它确保了 CanIf 与上层模块（CanSM、EcuM、Com、PduR 等）之间的**事件通知链路**是完整的。
>
> 2. **常见的上层模块缩写**：
>    - **CanSM**：CAN 状态管理器（CAN State Manager），负责 CAN 网络的状态管理和总线关闭恢复。
>    - **EcuM**：ECU 状态管理器（ECU State Manager），负责 ECU 的启动、睡眠和唤醒流程。
>    - **Com**：通信模块，负责应用层信号的路由。
>    - **PduR**：PDU 路由器（PDU Router），负责不同协议栈之间的数据路由。
>
> 3. **必须配置的回调**：
>    - `User Ctrl Bus Off` → 必须指向 CanSM，否则总线关闭后系统无法自动恢复。
>    - `User Validate Wakeup Event` → 必须指向 EcuM，否则唤醒事件无法被正确验证和处理。
>    - `User Ctrl Mode Indication` / `User Trcv Mode Indication` → 建议配置，便于 CanSM 进行状态管理。
>
> 4. **功能安全相关**：`User Ram Check Corrupt Controller` 和 `User Ram Check Corrupt Mailbox` 通常在 ASIL 项目中需要配置，在 QM 项目中可留空。



## CanIfInitCfgs

```txt
CanIf
└── CanIfInitCfgs
    ├── CanIfBufferCfgs
    │   ├── CanIfBufferCfg实例 (App_01_Tx)
    │   ├── CanIfBufferCfg实例 (App_02_Tx)
    │   └── CanIfBufferCfg实例 (App_03_Tx)
    ├── CanIfInitHohCfgs
    │   ├── CanIfHrhCfgs
    │   │   ├── CanIfHrhCfg实例 (App_01_Rx)
    │   │   ├── CanIfHrhCfg实例 (App_02_Rx)
    │   │   ├── CanIfHrhCfg实例 (App_03_Rx)
    │   │   └── CanIfHrhCfg实例 (App_05_Rx)
    │   └── CanIfHthCfgs
    │       ├── CanIfHthCfg实例 (App_01_Tx)
    │       ├── CanIfHthCfg实例 (App_02_Tx)
    │       └── CanIfHthCfg实例 (App_03_Tx)
    ├── CanIfRxPduCfgs
    │   ├── CanIfRxPduCfg实例 (App_01_Rx)
    │   ├── CanIfRxPduCfg实例 (App_02_Rx)
    │   ├── CanIfRxPduCfg实例 (App_03_Rx)
    │   ├── CanIfRxPduCfg实例 (App_05_Rx)
    │   └── CanIfRxPduCfg实例 (App_06_Rx)
    └── CanIfTxPduCfgs
        ├── CanIfTxPduCfg实例 (App_01_Tx)
        ├── CanIfTxPduCfg实例 (App_02_Tx)
        ├── CanIfTxPduCfg实例 (App_03_Tx)
        └── CanIfTxPduCfg实例 (App_04_Tx)
```

`CanIfInitCfgs` 是 CanIf 模块的**初始化配置容器**，用于配置模块上电启动时的**初始状态**，包括缓冲区、硬件对象句柄（HOH）以及收发/接收 PDU 的映射关系。

| 参数名称         | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**   | 短名称          | 该初始化配置实例在 CanIf 模块中的**唯一标识名**。            | 通常保持默认即可。                                           |
| **Init Cfg Set** | 初始化配置集合  | 该参数用于**引用具体的初始化配置集**。在实际使用中，该参数通常**不直接配置**，而是通过 `CanIfCtrlDrvCfgs` 中的 `Ctrl Drv Init Hoh Config Ref` 来间接引用 `CanIfInitHohCfgs` 子容器。 | 除非有特殊的变体管理需求，否则**通常留空或不修改**。工具链会通过 `Ctrl Drv Init Hoh Config Ref` 的引用路径自动关联到 `CanIfInitHohCfgs`。 |

> [!note]
>
> 1. `CanIfInitCfgs` 本身参数很少，**核心配置都在其子容器中**（`CanIfBufferCfgs`、`CanIfInitHohCfgs`、`CanIfRxPduCfgs`、`CanIfTxPduCfgs`）。
> 2. **关联方式**：`CanIfCtrlDrvCfgs` 中的 `Ctrl Drv Init Hoh Config Ref` 指向 `/ActiveEcuC/CanIf/CanIfInitCfgs/CanIfInitHohCfgs`，这是驱动层与初始化层的关键绑定。

### CanIfBufferCfg实例

`CanIfBufferCfgs` 下的每个实例用于配置 **CanIf 内部的一个硬件缓冲区**，每个缓冲区实例通常对应一个硬件邮箱或 FIFO，用于暂存待发送或已接收的 CAN 报文。

| 参数名称                            | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称                        | 该缓冲区配置实例在 CanIf 模块中的**唯一标识名**。            | 工具自动生成，从名称可识别其用途（如 `App_01_Tx_oEPSInner_xxx_Tx` 表示应用 01 的发送缓冲区）。建议保留默认名称以便追溯。 |
| **Buffer Hth Ref**                  | 缓冲区 → 发送 HOH 引用        | **最关键的一个引用**。指向 `CanIfInitHohCfgs/CanIfHthCfgs` 中对应的**发送 HOH（硬件对象句柄）** 实例，建立缓冲区与硬件发送句柄的关联。 | **必须正确引用**，否则该缓冲区无法与底层硬件匹配。引用路径应与 `CanIfHthCfgs` 中的实例名称一致。 |
| **Buffer Size**                     | 缓冲区大小                    | 指定该缓冲区可容纳的**报文数量**（以帧为单位），而非字节数。 | 通常为 **0**，表示使用硬件 FIFO 或邮箱的默认深度。一般不需要手动修改。 |
| **Tx Buffer Handling Type**         | 发送缓冲区处理类型            | 定义该发送缓冲区的**处理模式**，决定何时将数据真正发送到 CAN 总线上。 | - **NONE**：无特殊处理，数据放入缓冲区后立即发送。<br>- **IMMEDIATE**：立即发送（与 NONE 类似）。<br>- **PERIODIC**：周期发送，需配合其他参数。<br>- **TRIGGERED**：触发发送，需配合 `Tx Buffer Trigger Pdu Ref` 等参数。 |
| **Tx Buffer Mapped Tx Pdu**         | 发送缓冲区映射的发送 PDU 索引 | 该参数是一个**数值索引**，用于标识该发送缓冲区对应的发送 PDU 编号。 | 该索引需要与 `CanIfTxPduCfgs` 中的 PDU 配置**一一对应**。通常由工具自动生成，无需手动修改。 |
| **Tx Buffer Max Pdu Length [Byte]** | 发送缓冲区最大 PDU 长度       | 指定该缓冲区所能承载的**最大 PDU 数据长度**，以字节为单位。  | 该值必须与实际 CAN 报文的 DLC（数据长度）**保持一致或更大**。对于标准 CAN 报文，最大为 **8 字节**；对于 CAN FD，最大可达 64 字节。 |

> [!note]
>
> 1. **一个发送缓冲区实例 = 一个硬件发送邮箱/FIFO**。截图中的 `Buffer Hth Ref` 指向了 `CanIfHthCfg` 实例，这是缓冲区与硬件句柄的**关键绑定**。
> 2. **Buffer Hth Ref 是核心**：该引用将 CanIf 层的缓冲区配置与底层 Can 驱动的硬件发送句柄关联起来，确保数据能够正确发送到指定的 CAN 控制器。
> 3. **Tx Buffer Max Pdu Length**：对于标准 CAN 报文固定为 8 字节，对于 CAN FD 则按需配置（最大 64 字节）。
> 4. **Tx Buffer Handling Type**：CAN 通信中 99% 的场景都使用 **NONE** 或 **IMMEDIATE**，表示"放入发送队列后立即尝试发送"。PERIODIC 和 TRIGGERED 是比较特殊的高级用法，仅在需要精确控制发送时序时才使用。

### CanIfHrhCfg实例

`CanIfHrhCfgs` 下的每个实例用于配置 **接收方向的 HOH（Hardware Object Handle，硬件对象句柄）**，即 CanIf 层如何将底层的接收邮箱/缓冲区抽象为一个逻辑句柄，并绑定到对应的 CAN 控制器和硬件对象。

| 参数名称                    | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**              | 短名称                        | 该接收 HOH 配置实例在 CanIf 模块中的**唯一标识名**。         | 工具自动生成，从名称可识别其对应的应用和方向（如 `App_01_Rx_oEPSInner_xxx_Rx` 表示应用 01 的接收 HOH）。建议保留默认名称以便追溯。 |
| **Hrh Can Ctrl Id Ref**     | 接收 HOH → CAN 控制器 ID 引用 | 该引用指向 **`CanIfCtrlCfgs`** 中的某个控制器配置实例，用于指定该接收 HOH 所属的 CAN 控制器（即该 HOH 服务于哪个 CAN 通道）。 | 通过此引用，CanIf 能够将接收报文关联到正确的 CAN 控制器。**必须与硬件设计一致**，否则接收路由会混乱。 |
| **Hrh Can Handle Type Ref** | 接收 HOH → 硬件句柄类型引用   | 该引用指向底层 **Can 驱动** 中定义的硬件对象（如 `CanHardwareObject`），用于绑定具体的硬件接收邮箱/缓冲区。 | 这是连接 CanIf 与底层 Can 驱动的关键引用之一，**必须正确配置**，否则 HOH 无法对应到底层硬件。 |
| **Hrh Id Sym Ref**          | 接收 HOH ID 符号引用          | 该引用同样指向底层 **Can 驱动** 中的硬件对象配置，通常与 `Hrh Can Handle Type Ref` 指向同一个或相关联的配置项，提供硬件对象的符号名称。 | 该引用用于工具链生成代码时的符号解析，**必须确保引用有效**，否则生成代码时会报错。 |
| **Hrh Software Filter**     | 接收软件过滤                  | 勾选后，表示该接收 HOH **启用软件过滤**，即在 CanIf 层对接收到的 CAN ID 进行额外的软件匹配过滤（除了硬件过滤之外）。 | - 不勾选：仅依赖硬件过滤（通常硬件邮箱本身已具备 ID 过滤功能）。<br>- 勾选：CanIf 会在回调上层之前对 CAN ID 再做一次软件匹配，增加灵活性但会消耗 CPU 资源。**通常保持不勾选**，仅在需要动态修改过滤条件时才启用。 |

> [!note]
>
> 1. **一个 `CanIfHrhCfg` 实例 = 一个接收方向的 HOH（硬件对象句柄）**，对应底层 Can 驱动中的一个硬件接收邮箱/缓冲区。
>
> 2. **关键引用链路**：
>    - `Hrh Can Ctrl Id Ref` → 指向 `CanIfCtrlCfgs`，确定该 HOH 属于哪个 CAN 控制器。
>    - `Hrh Can Handle Type Ref` / `Hrh Id Sym Ref` → 指向底层 `Can` 模块的 `CanHardwareObject`，确定该 HOH 对应哪个硬件邮箱。
>    - **最终关联**：该 HOH 实例会被 `CanIfRxPduCfgs` 中的 `CanIfRxPduHohRef` 引用，完成"CAN ID → HOH → 控制器 → 硬件邮箱"的完整链路。
>
> 3. **软件过滤的使用场景**：
>    - 硬件过滤能力有限（如某些 MCU 的 CAN 邮箱只支持有限的 ID 掩码过滤）。
>    - 需要动态修改接收 ID 列表（如 J1939 协议中的动态地址分配）。
>    - 一般项目不建议开启，因为会增加中断处理时间。

### CanIfHthCfg实例

`CanIfHthCfgs` 下的每个实例用于配置 **发送方向的 HOH（Hardware Object Handle，硬件对象句柄）**，即 CanIf 层如何将底层的发送邮箱/缓冲区抽象为一个逻辑句柄，并绑定到对应的 CAN 控制器和硬件对象。

| 参数名称                    | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**              | 短名称                        | 该发送 HOH 配置实例在 CanIf 模块中的**唯一标识名**。         | 工具自动生成，从名称可识别其对应的应用和方向（如 `App_01_Tx_oEPSInner_xxx_Tx` 表示应用 01 的发送 HOH）。建议保留默认名称以便追溯。 |
| **Hth Can Ctrl Id Ref**     | 发送 HOH → CAN 控制器 ID 引用 | 该引用指向 **`CanIfCtrlCfgs`** 中的某个控制器配置实例，用于指定该发送 HOH 所属的 CAN 控制器（即该 HOH 服务于哪个 CAN 通道）。 | 通过此引用，CanIf 能够将待发送报文发送到正确的 CAN 控制器。**必须与硬件设计一致**，否则发送报文会发错通道。 |
| **Hth Can Handle Type Ref** | 发送 HOH → 硬件句柄类型引用   | 该引用指向底层 **Can 驱动** 中定义的硬件对象（如 `CanHardwareObject`），用于绑定具体的硬件发送邮箱/缓冲区。 | 这是连接 CanIf 与底层 Can 驱动的关键引用之一。截图中该参数为空 `[ ]`，需要检查是否配置正确。**若为空，需要根据硬件设计选择正确的 Can 驱动硬件对象引用。** |
| **Hth Id Sym Ref**          | 发送 HOH ID 符号引用          | 该引用同样指向底层 **Can 驱动** 中的硬件对象配置，通常与 `Hth Can Handle Type Ref` 指向同一个或相关联的配置项，提供硬件对象的符号名称。 | 该引用用于工具链生成代码时的符号解析，**必须确保引用有效**，否则生成代码时会报错。 |

> [!note]
>
> 1. **一个 `CanIfHthCfg` 实例 = 一个发送方向的 HOH（硬件对象句柄）**，对应底层 Can 驱动中的一个硬件发送邮箱/缓冲区。
>
> 2. **关键引用链路**：
>
>    - `Hth Can Ctrl Id Ref` → 指向 `CanIfCtrlCfgs`，确定该 HOH 属于哪个 CAN 控制器。
>    - `Hth Can Handle Type Ref` / `Hth Id Sym Ref` → 指向底层 `Can` 模块的 `CanHardwareObject`，确定该 HOH 对应哪个硬件邮箱。
>    - **最终关联**：该 HOH 实例会被 `CanIfTxPduCfgs` 中的 `CanIfTxPduHohRef` 引用，完成"PDU → HOH → 控制器 → 硬件邮箱"的完整链路。
>
> 3. **截图中 `Hth Can Handle Type Ref` 为空**，这通常意味着该参数尚未配置。需要根据实际硬件设计，从下拉列表中选择对应的 Can 驱动硬件对象引用。若不填，发送功能将无法正常工作。
>
> 4. **接收与发送 HOH 的对称性**：
>
>    | 方向       | HOH 配置       | 对应 PDU 配置    | 被引用方     |
>    | :--------- | :------------- | :--------------- | :----------- |
>    | 接收（Rx） | `CanIfHrhCfgs` | `CanIfRxPduCfgs` | 硬件接收邮箱 |
>    | 发送（Tx） | `CanIfHthCfgs` | `CanIfTxPduCfgs` | 硬件发送邮箱 |

### CanIfRxPduCfg实例

`CanIfRxPduCfgs` 用于配置 **接收 PDU（Protocol Data Unit）** 的映射关系，即**哪个 CAN ID 的报文 → 对应哪个上层 PDU → 由哪个回调函数处理**。这是 CanIf 路由功能的核心配置之一。

| 参数名称                            | 中文直译 / 作用                                        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :----------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称                                                 | 该接收 PDU 配置实例的唯一标识名。                            | 工具自动生成，从名称可识别其对应的应用和方向（如 `App_01_Rx_oEPSInner_xxx_Rx`）。 |
| **Rx Pdu Can Id**                   | 接收 PDU 的 CAN ID                                     | 该 PDU 对应的 **CAN 标识符（Identifier）**。当总线上出现该 CAN ID 的报文时，CanIf 会将其路由到本 PDU 配置指定的上层模块。 | **必须与整车通信矩阵（DBC/ARXML）中的定义完全一致**。截图中为 `0x108`。 |
| **Rx Pdu Can Id Mask**              | CAN ID 掩码                                            | 用于 **硬件过滤** 的掩码，配合 `Rx Pdu Can Id` 使用。只有 `(接收到的 CAN ID & Mask) == (Rx Pdu Can Id & Mask)` 时才匹配。 | 通常设置为标准值（如 `0x7FF` 表示 11 位标准帧全部匹配），除非需要将多个 CAN ID 映射到同一个 PDU（如 J1939 的多地址场景）。 |
| **Rx Pdu Can Id Type**              | CAN ID 类型                                            | 指定该 CAN ID 是 **标准帧（11 位）** 还是 **扩展帧（29 位）**。 | 可选值：`STANDARD_CAN`（标准帧，11 位）或 `EXTENDED_CAN`（扩展帧，29 位）。必须与 DBC 定义一致。截图中为 `STANDARD_CAN`。 |
| **Rx Pdu Dlc [Byte]**               | 数据长度码                                             | 该 PDU 的 **数据长度（Data Length Code）**，以字节为单位，对应 CAN 帧的 DLC 字段。 | 必须与实际报文长度一致。标准 CAN 最大 8 字节。截图中为 `8`。 |
| **Rx Pdu Dlc Check**                | DLC 检查                                               | 勾选后，CanIf 会检查接收到的 CAN 帧的 DLC 是否与配置的 `Rx Pdu Dlc` 一致。若不匹配，可选择丢弃报文或触发错误处理。 | 建议 **勾选启用**，增强通信健壮性，防止 DLC 不匹配的报文被错误处理。 |
| **Rx Pdu Hrh Id Ref**               | 接收 PDU → 接收 HOH 引用                               | **关键引用**。指向 `CanIfInitHohCfgs/CanIfHrhCfgs` 中对应的**接收 HOH 实例**，建立 PDU 与硬件接收句柄的关联。 | **必须正确引用**，确保该 PDU 从正确的硬件邮箱接收数据。截图中指向 `CanIfHrhCfg_App_01_Rx_oEPSInner_43f6b9ac_Rx`。 |
| **Rx Pdu Id**                       | PDU ID                                                 | 该 PDU 在 CanIf 模块内部的 **数字标识符**。用于模块内部索引和管理。 | 通常由工具自动生成，无需手动修改。截图中为 `11`。            |
| **Rx Pdu Ref**                      | 接收 PDU → 上层 PDU 引用                               | **关键引用**。指向上层模块（通常是 **PduR** 或 **Com**）中定义的 PDU 配置实例。CanIf 收到报文后，通过此引用将数据传递给上层。 | **必须正确引用**，否则接收到的数据无法传递到应用层。截图中指向 `/ActiveEcuC/EcuC/EcuPduCollection/App_01_Rx_oEPSInner_05153321_Rx`。 |
| **Rx Pdu User Rx Indication Name**  | 接收指示回调函数名                                     | CanIf 收到报文后调用的**上层回调函数名称**。该函数由 RTE 或上层模块（如 PduR）提供。 | 截图中为 `PduR_CanIfRxIndication`，表示报文交给 PduR 模块处理。**这是最常见且推荐的配置**。 |
| **Rx Pdu User Rx Indication UL**    | 接收指示回调函数所在的**上层模块（Upper Layer）** 名称 | 指定 `Rx Pdu User Rx Indication Name` 回调函数所属的**上层模块**，用于工具链定位该回调函数的实现。 | 截图中为 `PDUR`，表示 `PduR_CanIfRxIndication` 函数由 PduR 模块提供。 |
| **Rx Pdu Bsw Sch Excl Area Id Ref** | BSW 调度独占区引用                                     | 用于 **多核 / 功能安全** 场景，指定处理该 PDU 接收中断时所在的 **BSW 调度独占区**，用于保护临界区资源。 | 通常在单核或非安全项目中 **留空**。多核 ASIL 项目需要按设计配置。 |
| **Rx Pdu Can Handle Type Locked**   | CAN 句柄类型锁定                                       | 勾选后，该 PDU 的 HOH 类型会被**锁定**，不允许其他配置修改其类型。 | 一般保持默认（不勾选），仅在需要强制固定 HOH 类型以防止误修改时才启用。 |
| **Rx Pdu Data Checksum Pdu**        | 数据校验和 PDU                                         | 配置该 PDU 是否需要包含或接收时校验 **Checksum（校验和）**，用于 E2E 通信保护或安全相关数据验证。 | 仅在使用了 **E2E 保护** 的项目中需要配置，一般项目保持默认（不配置）。 |
| **Rx Pdu Read Data**                | 读取数据                                               | 勾选后，CanIf 在接收该 PDU 时会额外执行一次**数据读取操作**，用于调试或监控。 | 一般 **不勾选**，仅在需要调试接收数据流时临时启用，量产时应关闭以节省 CPU 开销。 |
| **Rx Pdu Read Notify Status**       | 读取通知状态                                           | 用于配置是否在读取数据时通知上层模块状态变化。               | 一般保持默认。                                               |
| **Rx Pdu Set Reception Mode Pdu**   | 设置接收模式 PDU                                       | 用于配置接收模式（如是否启用接收）的关联参数。               | 一般保持默认。                                               |

> [!note]
>
> 1. **关键引用链路（接收方向）**：
>
>    ```text
>    CanIfRxPduCfg
>         │
>         ├── Rx Pdu Can Id = 0x108          ← 匹配总线上的 CAN ID
>         ├── Rx Pdu Hrh Id Ref → CanIfHrhCfg  ← 关联到接收 HOH（硬件邮箱）
>         └── Rx Pdu Ref → 上层 EcuPduCollection  ← 交给上层 PduR/Com
>    ```
>
> 2. **上层回调函数**：绝大多数 AUTOSAR 项目中，`Rx Pdu User Rx Indication Name` 都指向 **`PduR_CanIfRxIndication`**，由 PduR 模块统一完成报文的路由分发。特殊场景（如诊断直通）可能指向其他模块。
>
> 3. **CAN ID 过滤**：`Rx Pdu Can Id` + `Rx Pdu Can Id Mask` 的匹配规则：
>
>    - 匹配条件：`(接收到报文的 CAN ID & Rx Pdu Can Id Mask) == (Rx Pdu Can Id & Rx Pdu Can Id Mask)`
>    - 标准帧掩码通常为 `0x7FF`（11 位全匹配）。
>    - 扩展帧掩码通常为 `0x1FFFFFFF`（29 位全匹配）。
>
> 4. **DLC 检查**：建议启用 `Rx Pdu Dlc Check`，这可以在硬件层面过滤掉 DLC 不匹配的报文，避免上层模块处理异常数据。

### CanIfTxPduCfg实例

`CanIfTxPduCfgs` 用于配置 **发送 PDU** 的映射关系，即**上层哪个 PDU → 对应哪个 CAN ID → 通过哪个缓冲区发送**。

| 参数名称                             | 中文直译 / 作用                    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------- | :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                       | 短名称                             | 该发送 PDU 配置实例的唯一标识名。                            | 工具自动生成，从名称可识别其对应的应用和方向（如 `App_01_Tx_oEPSInner_xxx_Tx`）。 |
| **Tx Pdu Can Id**                    | 发送 PDU 的 CAN ID                 | 该 PDU 发送时使用的 **CAN 标识符（Identifier）**。           | **必须与整车通信矩阵（DBC/ARXML）中的定义完全一致**。截图中为 `0x117`。 |
| **Tx Pdu Can Id Mask**               | CAN ID 掩码                        | 用于发送时的 ID 匹配，通常与 `Tx Pdu Can Id` 配合使用，但发送场景下该参数通常不参与过滤逻辑，更多是用于工具链的一致性检查。 | 通常保持默认值（如 `0x7FF` 或 `0x1FFFFFFF`），一般不需要修改。 |
| **Tx Pdu Can Id Type**               | CAN ID 类型                        | 指定该 CAN ID 是 **标准帧（11 位）**、**扩展帧（29 位）** 还是 **CAN FD 帧**。 | 可选值：`STANDARD_CAN`、`EXTENDED_CAN`、`STANDARD_FD_CAN`、`EXTENDED_FD_CAN`。必须与 DBC 定义一致。截图中为 `STANDARD_FD_CAN`，表示这是一个 CAN FD 标准帧。 |
| **Tx Pdu Dlc [Byte]**                | 数据长度码                         | 该 PDU 的 **数据长度（Data Length Code）**，以字节为单位，对应 CAN 帧的 DLC 字段。 | 必须与实际报文长度一致。标准 CAN 最大 8 字节，CAN FD 最大 64 字节。截图中为 `8`。 |
| **Tx Pdu Id**                        | PDU ID                             | 该 PDU 在 CanIf 模块内部的 **数字标识符**。                  | 通常由工具自动生成，无需手动修改。截图中为 `5`。             |
| **Tx Pdu Buffer Ref**                | 发送 PDU → 缓冲区引用              | **关键引用**。指向 `CanIfInitCfgs/CanIfBufferCfgs` 中对应的**发送缓冲区实例**，建立 PDU 与硬件发送缓冲区的关联。 | **必须正确引用**，否则该 PDU 无法发送。截图中指向 `CanIfBufferCfg_App_01_Tx_oEPSInner_980874e2_Tx`。 |
| **Tx Pdu Ref**                       | 发送 PDU → 上层 PDU 引用           | **关键引用**。指向上层模块（通常是 **PduR** 或 **Com**）中定义的 PDU 配置实例，用于接收上层传递下来的数据。 | **必须正确引用**，否则上层数据无法传递到 CanIf。截图中指向 `/ActiveEcuC/EcuC/EcuCPduCollection/App_01_Tx_oEPSInner_8c577911_Tx`。 |
| **Tx Pdu Type**                      | 发送 PDU 类型                      | 定义该 PDU 的**发送类型**，决定其发送行为。                  | - **STATIC**（静态）：固定周期或触发发送，最常见。<br>- **TRIGGERED**（触发）：由上层事件触发发送。<br>- **MIXED**（混合）：结合以上两种。<br>截图中为 `STATIC`。 |
| **Tx Pdu User Tx Confirmation Name** | 发送确认回调函数名                 | 当该 PDU 成功发送到 CAN 总线上后，CanIf 调用的**上层回调函数名称**，用于通知上层（如 PduR、Com）发送完成。 | 截图中为 `PduR_CanIfTxConfirmation`，表示发送完成后通知 PduR 模块。**这是最常见且推荐的配置**。 |
| **Tx Pdu User Tx Confirmation UL**   | 发送确认回调函数所在的上层模块名称 | 指定 `Tx Pdu User Tx Confirmation Name` 回调函数所属的**上层模块**。 | 截图中为 `PDUR`，表示 `PduR_CanIfTxConfirmation` 函数由 PduR 模块提供。 |
| **Tx Pdu Bsw Sch Excl Area Id Ref**  | BSW 调度独占区引用                 | 用于 **多核 / 功能安全** 场景，指定处理该 PDU 发送完成中断时所在的 **BSW 调度独占区**。 | 通常在单核或非安全项目中 **留空**。                          |
| **Tx Pdu Data Checksum Pdu**         | 数据校验和 PDU                     | 配置该 PDU 是否需要在发送时计算并填充 **Checksum（校验和）**，用于 E2E 通信保护。 | 仅在使用了 **E2E 保护** 的项目中需要配置，一般项目保持默认（不配置）。 |
| **Tx Pdu Pn Filter Pdu**             | 部分网络过滤 PDU                   | 用于 **Partial Networking（部分网络）** 功能，配置该 PDU 是否参与部分网络过滤。 | 只有在使用了 Partial Networking 的项目中才需要配置。         |
| **Tx Pdu Read Notify Status**        | 读取通知状态                       | 用于配置是否在发送时通知上层模块状态变化。                   | 一般保持默认。                                               |
| **Tx Pdu Truncation**                | 截断                               | 勾选后，当上层传递的数据长度超过 `Tx Pdu Dlc` 时，CanIf 会**截断**超出部分的数据。 | 建议 **不勾选**，以确保上层传递的数据长度与 DLC 一致，避免数据丢失。 |

> [!note]
>
> 1. **关键引用链路（发送方向）**：
>
>    ```text
>    CanIfTxPduCfg
>         │
>         ├── Tx Pdu Ref → 上层 EcuPduCollection  ← 从上层接收数据
>         ├── Tx Pdu Buffer Ref → CanIfBufferCfg   ← 关联到发送缓冲区
>         └── Tx Pdu Can Id = 0x117               ← 发送到总线上的 CAN ID
>    ```
>
> 2. **上层回调函数**：绝大多数 AUTOSAR 项目中，`Tx Pdu User Tx Confirmation Name` 都指向 **`PduR_CanIfTxConfirmation`**，由 PduR 模块统一完成发送确认的转发。
>
> 3. **CAN FD 支持**：截图中 `Tx Pdu Can Id Type` 为 `STANDARD_FD_CAN`，说明该项目使用了 CAN FD。此时 `Tx Pdu Dlc` 最大可达 64 字节，且 BRS（比特率切换）和 ESI（错误状态指示）等参数会在其他地方配置。
>
> 4. **STATIC vs TRIGGERED**：
>
>    - **STATIC**：PDU 一旦被上层写入，即进入发送队列等待发送（配合周期发送或立即发送）。
>    - **TRIGGERED**：PDU 需要上层显式调用发送 API 才会发送，适合事件型报文（如诊断响应）。

## CanIfPrivateCfg

`CanIfPrivateCfgs` 是 Vector 特有的配置容器，用于存放当前特定**配置变体（Variant）** 下专属的配置参数，用于启用或禁用 CanIf 模块的各项**可选功能特性**。这些参数通常都是**开关型（布尔值）** 或**选择型**的全局配置，不与其他变体共享。

| 参数名称                                 | 中文直译 / 作用                | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :----------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Check Wakeup Can Ret Type**            | 检查唤醒 CAN 返回类型          | 勾选后，启用**唤醒验证时的 CAN 返回类型检查**，用于在唤醒事件验证过程中检查 CAN 返回值的类型是否正确。 | 通常保持默认（不勾选），仅在需要严格验证唤醒源类型时启用。   |
| **Data Checksum Rx Support**             | 接收数据校验和支持             | 勾选后，启用 CanIf 层对**接收报文的数据校验和（Checksum）** 检查功能。 | 如果项目中使用了 **E2E 通信保护**（如安全相关信号），则需要勾选启用。 |
| **Data Checksum Tx Support**             | 发送数据校验和支持             | 勾选后，启用 CanIf 层对**发送报文的数据校验和（Checksum）** 计算和填充功能。 | 与 `Data Checksum Rx Support` 对称，E2E 项目中需要勾选。     |
| **Dlc Check**                            | DLC 检查                       | 勾选后，启用 CanIf 层对接收报文的 **DLC（数据长度码）** 检查功能。当接收到的报文 DLC 与配置不一致时，CanIf 会触发错误处理。 | 建议**勾选启用**，增强通信健壮性。与 `CanIfRxPduCfg` 中每个 PDU 独立的 `Rx Pdu Dlc Check` 是配合关系：此开关是模块级总开关，PDU 级开关是细粒度控制。 |
| **Double Hash Additional Memory [Byte]** | 双哈希额外内存                 | 指定用于 **双哈希（Double Hash）** 功能的**额外内存大小**（以字节为单位）。双哈希是 Vector 工具用于增量构建时判断配置是否变化的技术。 | **一般不需要手动修改**，保持默认值即可。                     |
| **Double Hash Adjust Count**             | 双哈希调整计数                 | 用于双哈希功能的**调整计数值**，配合 `Double Hash Additional Memory` 使用。 | **一般不需要手动修改**，由工具自动维护。                     |
| **Rx Search Consider Msg Type**          | 接收搜索考虑消息类型           | 勾选后，CanIf 在**搜索匹配的接收 PDU 时**会将 CAN 帧类型（标准帧/扩展帧）作为匹配条件之一。 | 通常**保持默认（不勾选）**。如果勾选，`CanIfRxPduCfg` 中的 `Rx Pdu Can Id Type` 会被纳入匹配逻辑，增加过滤精度但也增加处理开销。 |
| **Set Pdu Reception Mode Support**       | 设置 PDU 接收模式支持          | 勾选后，启用 **动态设置 PDU 接收模式** 的功能，允许上层模块在运行时动态启用/禁用某个 PDU 的接收。 | 仅在需要动态控制 PDU 接收开关的项目中启用（如部分网络 Partial Networking 场景）。一般项目保持默认（不勾选）。 |
| **Software Filter Type**                 | 软件过滤类型                   | 定义 CanIf 层**软件过滤**的类型。                            | - **NONE**：不启用软件过滤，仅依赖硬件过滤（最常用，性能最优）。<br>- **PASSIVE**：被动过滤，仅记录不过滤。<br>- **ACTIVE**：主动软件过滤，在硬件过滤之外增加一层软件匹配。<br>**绝大多数项目选择 NONE**。 |
| **Static Fd Tx Buffer Support**          | 静态 FD 发送缓冲区支持         | 勾选后，启用 **CAN FD 静态发送缓冲区** 支持，用于 CAN FD 报文的静态发送缓冲区管理。 | 只有在项目使用了 **CAN FD** 且需要静态缓冲区管理时才勾选。   |
| **Support Extended Ids**                 | 支持扩展 ID                    | 勾选后，启用对 **扩展帧（29 位 CAN ID）** 的支持。           | 如果总线上存在 29 位扩展帧报文，则**必须勾选**。如果仅使用 11 位标准帧，可不勾选以节省资源。 |
| **Support Nm Osek**                      | 支持 OSEK NM                   | 勾选后，启用对 **OSEK 网络管理（OSEK NM）** 的支持。         | 只有在项目使用 **OSEK NM** 网络管理协议时才需要勾选。AUTOSAR 项目通常使用 **AUTOSAR NM**，此时不勾选。 |
| **Support TTCAN**                        | 支持 TTCAN                     | 勾选后，启用对 **时间触发 CAN（TTCAN，Time-Triggered CAN）** 的支持。 | TTCAN 是 CAN 的扩展协议，用于时间触发的确定性通信。**绝大多数项目不使用 TTCAN，保持不勾选**。 |
| **Transceiver Handling**                 | 收发器处理                     | 勾选后，CanIf 会**接管收发器的管理**，包括收发器的初始化、模式切换、唤醒管理等。 | 如果项目中存在外部 CAN 收发器芯片且需要 CanIf 管理，则**必须勾选**。绝大多数有外部收发器的项目都需要启用。 |
| **Transceiver Mapping**                  | 收发器映射                     | 勾选后，启用 **收发器与 CAN 控制器的映射关系** 管理，允许 CanIf 将多个收发器映射到不同的 CAN 控制器。 | 如果项目中有多个 CAN 收发器（如 2 路 CAN 各有独立的收发器芯片），则需要勾选。配合 `CanIfTrcvDrvCfgs` 使用。 |
| **Tx Buffer Fifo Support**               | 发送缓冲区 FIFO 支持           | 勾选后，启用**发送 FIFO（先进先出）缓冲区** 支持，允许多个待发送报文在 FIFO 中排队。 | 如果需要发送队列功能，则勾选。某些 MCU 硬件自带 FIFO，需要与此配置匹配。 |
| **Tx Buffer Prio By Can Id Support**     | 发送缓冲区按 CAN ID 优先级支持 | 勾选后，CanIf 会根据 **CAN ID 的数值** 决定发送优先级（CAN ID 越小，优先级越高）。 | 启用后，硬件发送队列会按照 CAN ID 大小排序发送。在某些实时性要求高的场景中可用，但会增加处理开销。一般项目保持默认（不勾选）。 |
| **User Config File**                     | 用户配置文件                   | 指定一个**用户自定义配置文件**的路径，允许用户通过外部文件覆盖部分 CanIf 配置。 | **一般留空**，仅在需要外部配置注入的特殊场景中使用。         |
| **Wakeup Support**                       | 唤醒支持                       | 勾选后，启用 CanIf 层的**唤醒事件处理**功能，允许 CanIf 检测并处理总线唤醒事件。 | 如果项目支持 **CAN 总线唤醒**（如休眠唤醒功能），则**必须勾选**。需与 `CanIfTrcvCfg` 中的 `Transceiver Wakeup Support` 和 `CanIfCtrlCfgs` 中的 `Controller Wakeup Support` 配合使用。 |
| **Wakeup Validate All Rx Msgs**          | 唤醒验证所有接收消息           | 勾选后，CanIf 在唤醒验证阶段会**检查所有接收到的消息**，而不仅仅是唤醒消息，以确认是否为有效唤醒源。 | 通常在需要更严格唤醒验证的 ASIL 项目中使用，一般项目保持默认（不勾选）。 |

> [!note]
>
> 1. **Private vs Public**：`CanIfPrivateCfgs` 存放的是**当前配置变体专属**的参数，不与其他变体共享。如果项目有多个配置变体（如不同硬件版本），每个变体可以有自己的 Private 配置。
>
> 2. **模块级总开关**：大部分参数都是模块级特性开关，一旦勾选启用，需要在子容器中做进一步的细粒度配置（如 `Data Checksum Rx/Tx Support` 需要配合 PDU 级的校验和配置）。
>
> 3. **典型项目的推荐配置**：
>
>    | 参数                   | 推荐设置 | 说明                        |
>    | :--------------------- | :------- | :-------------------------- |
>    | `Dlc Check`            | ✅ 勾选   | 增强健壮性                  |
>    | `Support Extended Ids` | 按需     | 有 29 位 ID 则勾选          |
>    | `Transceiver Handling` | ✅ 勾选   | 有外部收发器则勾选          |
>    | `Transceiver Mapping`  | ✅ 勾选   | 多路 CAN 则勾选             |
>    | `Wakeup Support`       | 按需     | 支持唤醒则勾选              |
>    | `Software Filter Type` | NONE     | 保持默认，由硬件过滤        |
>    | `Support TTCAN`        | ❌ 不勾选 | 通常不使用                  |
>    | `Support Nm Osek`      | ❌ 不勾选 | AUTOSAR 项目使用 AUTOSAR NM |

## CanIfPublicCfg

`CanIfPublicCfgs` 是 Vector 特有的配置容器，用于存放**跨多个配置变体（Variants）** 共享的公共配置参数，实现配置复用。这些参数定义了 CanIf 模块的**全局行为特性**和**编译时功能开关**。

| 参数名称                            | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Bus Mirroring Support**           | 总线镜像支持                  | 勾选后，启用 **总线镜像（Bus Mirroring）** 功能，允许将 CAN 总线上的所有报文（或部分报文）镜像到另一个接口，通常用于诊断/调试工具（如 CANoe 的 Bus Trace）。 | 仅在需要 **总线监控/调试** 时启用，量产版本通常关闭。        |
| **Cancel Transmit Support**         | 取消发送支持                  | 勾选后，允许上层模块**取消正在等待发送的 PDU**（即从发送队列中移除尚未发出的报文）。 | 需要 `CanIfCtrlDrvCfg` 中 `Controller Driver Tx Cancellation` 也勾选，两者配合才能生效。 |
| **Change Baudrate Support**         | 改变波特率支持                | 勾选后，启用**运行时动态修改 CAN 波特率** 的功能，允许上层模块在 ECU 运行过程中切换波特率。 | 通常仅在支持 **CAN FD 的灵活数据速率切换** 或 **特殊诊断场景** 中启用。一般项目保持关闭。 |
| **Dev Error Detect**                | 开发错误检测                  | 勾选后，启用 CanIf 模块内部的**开发错误检测（Development Error Detection）** 功能。当检测到参数错误、状态错误等情况时，会调用 `Det_ReportError` 函数报告错误。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**，以减少代码体积和 CPU 开销。 |
| **Enable Security Event Reporting** | 启用安全事件报告              | 勾选后，启用**安全事件报告**功能，用于将安全相关事件上报给安全模块（如 `SecM` 或功能安全监控模块）。 | 仅在 **ASIL/功能安全** 项目中需要勾选。QM（非安全）项目保持关闭。 |
| **Extended Ram Check Support**      | 扩展 RAM 检查支持             | 勾选后，启用 **扩展 RAM 检查** 功能，对 CanIf 模块使用的 RAM 区域进行更全面的初始化/校验。 | 仅在 **功能安全（ISO 26262）** 项目中可能需要启用，用于满足内存 ECC/奇偶校验的保护要求。 |
| **Handle Type Enum**                | 句柄类型枚举                  | 指定 CanIf 内部使用的 **HOH 数据类型**。                     | - **UINT8**：使用 8 位无符号整数表示 HOH（最多支持 255 个 HOH，最常用）。<br>- **UINT16**：使用 16 位无符号整数表示 HOH（支持更多 HOH）。<br>通常选择 **UINT8**。 |
| **J1939 Dynamic Address Support**   | J1939 动态地址支持            | 是否启用 **SAE J1939 协议** 的动态地址分配功能。             | **DISABLED**：不使用 J1939 动态地址（绝大多数项目）。<br>其他选项：启用 J1939 地址协商逻辑。仅在商用车项目中使用。 |
| **Meta Data Support**               | 元数据支持                    | 勾选后，启用 **元数据（Meta Data）** 支持，允许在 PDU 数据之外传递额外的元信息（如时间戳、数据源标识）。 | 仅在需要 **时间同步** 或 **数据溯源** 等高级功能时启用，一般项目保持关闭。 |
| **Multiple Drv Support**            | 多驱动支持                    | 勾选后，允许 CanIf 同时管理**多个 CAN 驱动实例**（如同时使用多个不同的 CAN 驱动模块）。 | 如果 MCU 有多个 CAN 控制器且使用多个驱动实例，则需要勾选。通常一个驱动管理所有 CAN 控制器，此时不勾选。 |
| **Number Of Can Hw Units**          | CAN 硬件单元数量              | 指定 CanIf 需要管理的 **CAN 控制器硬件单元数量**（即 MCU 上有几路 CAN）。 | **必须与实际硬件 CAN 外设数量一致**。截图中为 `1`，表示 MCU 上只有 1 路 CAN。 |
| **Pn Support**                      | 部分网络支持                  | 勾选后，启用 **Partial Networking（部分网络）** 功能，允许在特定条件下关闭部分 CAN 通道的通信以降低功耗。 | 仅在项目使用了 **Partial Networking** 特性时勾选。需要与 CanSM 配合。 |
| **Pn Transceiver Handling Support** | 部分网络收发器处理支持        | 勾选后，启用 **部分网络场景下的收发器处理** 功能，允许 CanIf 在 Partial Networking 模式下独立控制收发器的状态。 | 仅在使用了 **Partial Networking** 特性的项目中勾选。         |
| **Pn Wakeup Tx Pdu Filter Support** | 部分网络唤醒发送 PDU 过滤支持 | 勾选后，在 Partial Networking 模式下，CanIf 会**过滤掉非唤醒源的 Tx PDU**，避免在部分网络休眠期间错误地唤醒总线。 | 仅在使用了 **Partial Networking** 特性的项目中勾选。         |
| **Read Rx Pdu Data Api**            | 读取接收 PDU 数据 API         | 勾选后，生成 **`CanIf_ReadRxPduData`** API，允许上层模块读取接收到的 PDU 数据。 | 建议**勾选**，为上层提供标准的数据读取接口。                 |
| **Read Rx Pdu Notify Status Api**   | 读取接收 PDU 通知状态 API     | 勾选后，生成 **`CanIf_ReadRxPduNotifyStatus`** API，允许上层模块查询接收 PDU 的通知状态。 | 仅在需要查询接收状态时启用，一般保持默认。                   |
| **Read Tx Pdu Notify Status Api**   | 读取发送 PDU 通知状态 API     | 勾选后，生成 **`CanIf_ReadTxPduNotifyStatus`** API，允许上层模块查询发送 PDU 的通知状态。 | 仅在需要查询发送状态时启用，一般保持默认。                   |
| **Safe Bsw Checks**                 | 安全 BSW 检查                 | 勾选后，启用 **安全 BSW 检查**，在运行时对关键参数进行合法性检查（如指针是否为空、索引是否越界），用于功能安全场景。 | 在 **ASIL/功能安全** 项目中建议勾选。QM 项目保持关闭以提升性能。 |
| **Set Baudrate Api**                | 设置波特率 API                | 勾选后，生成 **`CanIf_SetBaudrate`** API，允许上层模块在运行时动态修改 CAN 波特率。 | 与 `Change Baudrate Support` 配合使用。一般项目保持关闭。    |
| **Set Dynamic Tx Id Api**           | 设置动态发送 ID API           | 勾选后，生成 **`CanIf_SetDynamicTxId`** API，允许上层模块在运行时动态修改某个 Tx PDU 的 CAN ID。 | 通常用于 **J1939 动态地址分配** 或 **诊断 0x2E 写入 DID** 场景。一般项目保持关闭。 |
| **Support Can Drv Asr440**          | 支持 Can 驱动 ASR440          | 勾选后，表示 CanIf 兼容 **AUTOSAR Release 4.4.0** 版本的 Can 驱动接口。 | 由工具自动根据底层 Can 驱动版本决定，**通常不需要手动修改**。 |
| **Support Multipartition**          | 支持多分区                    | 勾选后，启用 **多分区（Multipartition）** 支持，允许 CanIf 在不同 OS 分区中运行。 | 在 **多核** 或 **功能安全分区** 项目中需要勾选。单核项目保持关闭。 |
| **Tx Buffering**                    | 发送缓冲                      | 勾选后，启用 **发送缓冲（Tx Buffering）** 功能，当驱动繁忙时，CanIf 可以将待发送报文暂存到内部缓冲区排队发送。 | 建议**勾选**，提高发送成功率，避免因驱动繁忙而丢帧。         |
| **Tx Confirmation Polling Support** | 发送确认轮询支持              | 勾选后，启用 **发送确认轮询（Tx Confirmation Polling）** 模式，由上层主函数（如 `SchM` 或 `Com` 的周期任务）轮询检查发送完成状态，而不是依赖硬件中断。 | 在 **中断资源受限** 或 **非中断驱动** 的场景中使用。一般项目使用中断模式，保持关闭。 |
| **Version Info Api**                | 版本信息 API                  | 勾选后，生成 **`CanIf_GetVersionInfo`** API，用于获取 CanIf 模块的版本信息。 | 建议**勾选**，便于版本管理和调试。                           |
| **Wakeup Check Validation By NM**   | 唤醒检查验证由 NM 完成        | 勾选后，表示**唤醒事件的验证由网络管理（NM，Network Management）模块完成**，而不是由 CanIf 独立完成。 | 如果项目使用了 **AUTOSAR NM**，通常勾选，由 NM 模块确认唤醒事件是否有效。 |
| **Wakeup Check Validation Support** | 唤醒检查验证支持              | 勾选后，启用 CanIf 层的**唤醒事件验证**功能，在检测到唤醒事件后进行有效性判断。 | 如果项目支持 **CAN 总线唤醒**，则**必须勾选**。需与 `Wakeup Support`（Private）配合使用。 |

Cdd Header Files用于指定**复杂设备驱动（CDD，Complex Device Driver）的头文件**。

| 参数名称             | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Cdd Header Files** | CDD 头文件      | 指定 CanIf 需要引用的**复杂设备驱动（CDD）头文件**名称。当 CanIf 需要调用 CDD 中的函数或使用 CDD 中的数据类型时，需要在此处包含对应的头文件。 | 截图中为 `IPCDiag.h`，表示 CanIf 需要引用 IPCDiag 相关的 CDD 驱动头文件。通常由具体实现决定，**一般不需要手动修改**。 |

> [!note]
>
> 1. **Private vs Public 总结**：
>
>    - `CanIfPrivateCfgs`：**变体专属**参数，每个配置变体可以有不同取值。
>    - `CanIfPublicCfgs`：**变体共享**参数，所有配置变体使用相同取值，实现复用。
>
> 2. **功能安全相关配置**（ASIL 项目重点关注）：
>
>    - `Dev Error Detect`
>    - `Enable Security Event Reporting`
>    - `Extended Ram Check Support`
>    - `Safe Bsw Checks`
>    - `Support Multipartition`
>
> 3. **典型项目的推荐配置**：
>
>    | 参数                              | 推荐设置        | 说明                 |
>    | :-------------------------------- | :-------------- | :------------------- |
>    | `Dev Error Detect`                | 开发 ✅ / 量产 ❌ | 开发阶段开启便于调试 |
>    | `Number Of Can Hw Units`          | 实际硬件数量    | **必须与硬件一致**   |
>    | `Read Rx Pdu Data Api`            | ✅ 勾选          | 提供标准读接口       |
>    | `Tx Buffering`                    | ✅ 勾选          | 提高发送成功率       |
>    | `Version Info Api`                | ✅ 勾选          | 便于版本管理         |
>    | `Wakeup Check Validation Support` | 按需            | 支持唤醒则勾选       |
>    | `Handle Type Enum`                | `UINT8`         | 最常用               |

# PDUR

```txt
PduR
├── PduRBswModules
│   └── PduRBswModule实例
├── PduRGeneral
│   └── PduRGeneration
└── PduRRoutingTables
	├── PduRLocks
	│   └── PduRLock实例
	│       └── PduRExclusiveArea
	├── PduRQueues
	├── PduRRoutingPathGroups
    └─── PduRRoutingTable
         └── PduRRoutingPaths
             └── RoutingPath实例
                 ├── PduRDestPdus
                 │   └── PduRDestPdu实例
                 └── PduRSrcPdu实例
```



| 子容器                | 中文直译 / 惯称 | 核心功能职责                                                 | 关键配置内容举例                                             |
| :-------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **PduRBswModules**    | BSW 模块引用    | 列出所有与 PduR 交互的 **BSW 模块**，PduR 通过这些模块进行 PDU 的收发路由。 | 包含 CanIf、CanTp、Com、Dcm 等模块的引用，PduR 根据这些引用建立与各模块的连接。 |
| **PduRGeneral**       | 通用配置        | 配置 PduR 模块的**全局行为参数**和**代码生成选项**。         | 包含模块版本、开发错误检测开关、代码生成控制等参数。         |
| **PduRRoutingTables** | 路由表配置      | **核心配置区域**。定义 PDU 在 **源模块与目标模块之间** 的路由关系。 | - `PduRRoutingTable`：路由表实例，包含多个 `PduRRoutingPaths`。<br>- `PduRRoutingPaths`：具体路由路径，定义 PDU 从源模块到目标模块的完整路由。<br>- `PduRRoutingPathGroups`：路由路径分组，用于管理多条路由路径。 |
| **PduRLocks**         | 锁配置          | 配置 PduR 模块的**互斥锁（Mutex）**，用于多核或功能安全场景中的临界区保护。 | 每个 `PduRLock` 实例定义一个独占区域（`PduRExclusiveArea`），保护共享资源不被并发访问。 |
| **PduRQueues**        | 队列配置        | 配置 PduR 模块的**消息队列**，用于暂存待路由的 PDU。         | 定义队列大小、队列数量等参数，用于管理 PDU 的缓冲和调度。    |

> [!note]
>
> 1. **PduR 在 AUTOSAR 通信栈中的位置**：PduR（PDU Router，PDU 路由器）是 AUTOSAR 通信栈的**核心路由层**，位于 CanIf/CanTp 等通信接口之上、Com/Dcm 等应用层协议之下，负责在不同模块之间路由 PDU。
>
> 2. **典型的路由场景**：
>    - **从 CanIf 到 Com**：接收的 CAN 报文 → CanIf → PduR → Com → 应用层信号。
>    - **从 Com 到 CanIf**：发送的 CAN 报文 ← CanIf ← PduR ← Com ← 应用层信号。
>    - **从 CanIf 到 Dcm**：诊断请求 → CanIf → PduR → Dcm。
>    - **从 Dcm 到 CanIf**：诊断响应 ← CanIf ← PduR ← Dcm。
>
> 3. **路由路径的结构**：
>    - **PduRSrcPdu**：源 PDU（来自某个模块）。
>    - **PduRDestPdus**：目标 PDU 列表（发送到多个目标模块，如同时发送到 Com 和 Dcm）。
>    - 一个路由路径定义了 PDU 的**完整流转路径**。

## PduRBswModules

### PduRBswModule实例

`PduRBswModules` 下的每个实例用于配置 **与 PduR 交互的一个 BSW 模块**，定义该模块与 PduR 之间的通信能力（如是否支持发送确认、是否支持触发发送等），PduR 根据这些配置建立与该模块的连接。

| 参数名称                         | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------- | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                   | 短名称           | 该 BSW 模块配置实例的唯一标识名。                            | 用于在工具中识别该配置实例，通常与被引用的模块名称一致。     |
| **Bsw Module Ref**               | BSW 模块引用     | **关键引用**。指向被引用的 **BSW 模块配置实例**，建立 PduR 与该模块的连接。 | **必须正确引用**，否则 PduR 无法与该模块通信。               |
| **Cancel Receive**               | 取消接收         | 勾选后，表示该模块支持 **取消接收** 操作。                   | 仅在模块支持取消接收功能时勾选，一般保持默认（不勾选）。     |
| **Cancel Transmit**              | 取消发送         | 勾选后，表示该模块支持 **取消发送** 操作。                   | 仅在模块支持取消发送功能时勾选（如 CanIf 支持则勾选）。      |
| **Change Parameter Request Api** | 改变参数请求 API | 勾选后，表示该模块支持 **改变参数请求 API**，允许在运行时动态修改 PDU 的通信参数。 | 仅在需要运行时修改通信参数的场景中勾选，一般保持默认（不勾选）。 |
| **Communication Interface**      | 通信接口         | 勾选后，表示该模块是 **通信接口（Communication Interface）** 类型的模块（如 CanIf）。 | **必须正确设置**，标识该模块的类型。                         |
| **Lower Module**                 | 下层模块         | 勾选后，表示该模块相对于 PduR 是 **下层模块**（即数据流向为从该模块到 PduR）。 | **必须正确设置**，标识数据流向方向。                         |
| **Retransmission**               | 重传             | 勾选后，表示该模块支持 **重传（Retransmission）** 功能，在发送失败时自动重传。 | 仅在模块支持自动重传功能时勾选。                             |
| **Transport Protocol**           | 传输协议         | 勾选后，表示该模块是 **传输协议（Transport Protocol）** 类型的模块（如 CanTp）。 | 仅对支持 ISO-TP 分段传输的模块（如 CanTp）勾选。             |
| **Triggertransmit**              | 触发发送         | 勾选后，表示该模块支持 **触发发送（Trigger Transmit）** 功能，即 PduR 可以在特定条件下触发该模块发送 PDU。 | 仅在模块支持触发发送功能时勾选。                             |
| **Tx Confirmation**              | 发送确认         | 勾选后，表示该模块支持 **发送确认（Tx Confirmation）**，即在 PDU 成功发送后通知 PduR。 | **必须正确设置**，支持发送确认的模块（如 CanIf）需要勾选。   |
| **Upper Module**                 | 上层模块         | 勾选后，表示该模块相对于 PduR 是 **上层模块**（即数据流向为从 PduR 到该模块）。 | **必须正确设置**，标识数据流向方向。                         |
| **Use Tag**                      | 使用标签         | 勾选后，表示该模块使用 **标签（Tag）** 机制来标识 PDU。      | 仅在模块使用标签机制时勾选，一般保持默认（不勾选）。         |

> [!note]
>
> 1. **模块类型的分类**：
>
>    | 模块类型                                | 数据流向                                   | 典型模块     |
>    | :-------------------------------------- | :----------------------------------------- | :----------- |
>    | **通信接口（Communication Interface）** | Lower → PduR（接收）/ PduR → Lower（发送） | CanIf、LinIf |
>    | **传输协议（Transport Protocol）**      | Lower → PduR → Upper                       | CanTp        |
>    | **上层模块（Upper Module）**            | PduR → Upper（接收）/ Upper → PduR（发送） | Com、Dcm     |
>
> 2. **CanIf 的典型配置**：
>    - `Communication Interface`：✅ 勾选
>    - `Lower Module`：✅ 勾选
>    - `Tx Confirmation`：✅ 勾选
>    - `Transport Protocol`：❌ 不勾选（CanTp 才勾选）
>
> 3. **数据流向的含义**：
>    - **Lower Module**：数据从该模块流向 PduR（如 CanIf 接收报文后传递给 PduR）。
>    - **Upper Module**：数据从 PduR 流向该模块（如 PduR 将报文传递给 Com 或 Dcm）。

## PduRGeneral 

`PduRGeneral` 是 PduR 模块的**顶层通用配置容器**，用于配置 PduR 的全局行为参数，包括错误检测、队列管理、任务周期、多核支持等功能开关。

| 参数名称                           | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------- | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                     | 短名称           | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Deferred Event Cache Size**      | 延迟事件缓存大小 | 指定**延迟事件缓存（Deferred Event Cache）** 的大小，用于暂存延迟处理的事件。 | 仅在启用延迟接收/发送时需要配置，根据项目负载评估。          |
| **Dev Error Detect**               | 开发错误检测     | 勾选后，启用 PduR 内部的**开发错误检测**，当检测到参数错误、状态错误时，调用 `Det_ReportError` 报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Enable Deferred Reception**      | 启用延迟接收     | 勾选后，启用**延迟接收（Deferred Reception）** 机制，将接收到的 PDU 暂存到队列中，在主函数中处理，而不是在中断上下文中立即处理。 | 建议勾选，减少中断处理时间，提高系统实时性。                 |
| **Enable Deferred Transmission**   | 启用延迟发送     | 勾选后，启用**延迟发送（Deferred Transmission）** 机制，将待发送的 PDU 暂存到队列中，在主函数中处理，而不是在调用上下文中立即发送。 | 建议勾选，减少调用方的阻塞时间。                             |
| **Error Notification Module Name** | 错误通知模块名称 | 指定接收**错误通知**的模块名称，当 PduR 检测到错误时通知该模块。 | 通常指向 `DET` 模块，由项目架构决定。                        |
| **Extended Error Checks**          | 扩展错误检查     | 勾选后，启用**扩展错误检查**，对 PDU 进行更严格的合法性检查（如长度、范围等）。 | 建议勾选，增强系统健壮性。                                   |
| **Main Function Period [ms]**      | 主函数周期       | 指定 PduR **主函数（PduR_MainFunction）** 的执行周期，以毫秒为单位。 | 根据项目调度周期配置，通常为 1-10ms。                        |
| **Meta Data Support**              | 元数据支持       | 勾选后，启用**元数据（Meta Data）** 支持，允许在 PDU 数据之外传递额外的元信息（如时间戳）。 | 仅在需要时间同步或数据溯源等高级功能时启用。                 |
| **Pdu Callback**                   | PDU 回调         | 勾选后，启用**PDU 回调**机制，允许在 PDU 接收或发送完成后触发回调函数。 | 通常勾选，支持模块间的异步通知。                             |
| **Queue Overflow Notification**    | 队列溢出通知     | 勾选后，当 PduR 的**队列溢出**时，触发溢出通知，便于上层模块检测和处理丢帧情况。 | 建议勾选，便于监控系统负载和排查丢帧问题。                   |
| **Routing Type Gateway**           | 路由类型网关     | 勾选后，表示 PduR 作为**网关（Gateway）** 使用，在不同通信协议之间路由 PDU（如 CAN 到 LIN）。 | 仅在多协议网关场景中启用。                                   |
| **Safe Bsw Checks**                | 安全 BSW 检查    | 勾选后，启用**安全 BSW 检查**，对关键参数进行合法性检查，用于功能安全场景。 | 在 ASIL 项目中建议勾选，QM 项目保持关闭。                    |
| **Spinlock Retry Counter**         | 自旋锁重试计数器 | 指定**自旋锁（Spinlock）** 的重试次数，用于多核场景中的锁等待超时控制。 | 仅在多核场景中有效，根据系统负载配置。                       |
| **Support Multicore**              | 支持多核         | 勾选后，启用**多核支持**，允许 PduR 在多核环境中运行。       | 在**多核**项目中需要勾选，单核项目保持关闭。                 |
| **User Configuration File**        | 用户配置文件     | 指定一个**用户自定义配置文件**的路径，允许用户通过外部文件覆盖部分 PduR 配置。 | 通常保持为空。                                               |
| **Version Info Api**               | 版本信息 API     | 勾选后，生成 **`PduR_GetVersionInfo`** API，用于获取 PduR 模块的版本信息。 | 建议勾选，便于版本管理和调试。                               |
| **Zero Cost Operation**            | 零成本操作       | 勾选后，启用**零成本操作**优化，减少 PduR 的处理开销（如跳过某些不必要的检查）。 | 仅在性能极度敏感的场景中启用，一般保持默认（不勾选）。       |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                           | 开发阶段 | 量产阶段      |
>    | :----------------------------- | :------- | :------------ |
>    | `Dev Error Detect`             | ✅ 勾选   | ❌ 关闭        |
>    | `Extended Error Checks`        | ✅ 勾选   | ✅ 勾选        |
>    | `Queue Overflow Notification`  | ✅ 勾选   | ✅ 勾选        |
>    | `Safe Bsw Checks`              | ✅ 勾选   | ASIL 项目勾选 |
>    | `Version Info Api`             | ✅ 勾选   | ✅ 勾选        |
>    | `Enable Deferred Reception`    | ✅ 勾选   | ✅ 勾选        |
>    | `Enable Deferred Transmission` | ✅ 勾选   | ✅ 勾选        |
>
> 2. **延迟机制的作用**：
>    - **延迟接收**：将中断上下文中的接收处理推迟到主函数中执行，减少中断服务函数的执行时间。
>    - **延迟发送**：将发送操作推迟到主函数中执行，减少调用方的阻塞时间。
>    - 两者都是典型的**上半部/下半部（Top Half/Bottom Half）** 设计模式，用于提高系统的实时性。

### PduRGeneration 实例

`PduRGeneration` 用于配置 **PduR 模块代码生成** 时的优化策略，控制生成代码的数据结构、内存占用和性能优化。这些参数主要影响生成的 C 代码质量，不直接影响运行时行为。

| 参数名称                                                 | 中文直译 / 作用                  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------- | :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                           | 短名称                           | 该代码生成配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Bool Data In Array Of Struct Strategy**                | 结构体数组中的布尔数据处理策略   | 指定在结构体数组中处理**布尔类型数据**的策略。               | - `BITMASKING`：使用位掩码存储布尔值，节省内存。<br>- `BYTE`：使用字节存储布尔值，访问更快。<br>根据项目对内存和性能的权衡选择。 |
| **Data Deduplication Strategy**                          | 数据去重策略                     | 指定**数据去重**的策略，识别并合并重复的数据配置以减少生成代码的体积。 | - `WITH_CAST`：进行类型转换去重。<br>- `NONE`：不去重。<br>通常使用 `WITH_CAST` 以减小代码体积。 |
| **Deduplicate Indirected Data**                          | 去重间接数据                     | 勾选后，对**间接引用数据**也进行去重处理，进一步减少代码体积。 | 建议勾选，减少生成的代码大小。                               |
| **Interfaces For Deactivated Data**                      | 为停用数据生成接口               | 勾选后，为**已停用的数据**也生成 RTE 接口（即使数据未启用）。 | 仅在调试或特殊开发场景中勾选，量产版本保持关闭。             |
| **Numerical Data Type Minimization Strategy**            | 数值数据类型最小化策略           | 指定**数值数据类型最小化**的策略，使用尽可能小的数据类型存储数值以节省内存。 | - `WITH_CAST`：进行类型转换最小化。<br>- `NONE`：不进行最小化。<br>通常使用 `WITH_CAST` 以节省内存。 |
| **Out Of Bounds Read Sanitizer**                         | 越界读取清理器                   | 勾选后，生成**越界读取检查**代码，在读取数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Out Of Bounds Write Protection Strategy**              | 越界写入保护策略                 | 指定**越界写入保护**的策略，防止写入操作超出数组或缓冲区的边界。 | - `NONE`：不进行保护。<br>- `GUARD`：添加保护字节。<br>- `CHECK`：运行时检查。<br>ASIL 项目中建议配置，QM 项目通常选择 `NONE`。 |
| **Out Of Bounds Write Sanitizer**                        | 越界写入清理器                   | 勾选后，生成**越界写入检查**代码，在写入数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Reduce Bool Data By Negation Threshold**               | 通过取反减少布尔数据的阈值       | 指定通过**取反优化**减少布尔数据的阈值。当检测到多个布尔值可以通过取反共享时，超过该阈值则进行优化。 | 通常保持默认值。                                             |
| **Reduce Bool Data By Numerical Comparison Threshold**   | 通过数值比较减少布尔数据的阈值   | 指定通过**数值比较优化**减少布尔数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Bool Data By Numerical Operand Strategy**       | 通过数值操作数减少布尔数据的策略 | 指定通过**数值操作数优化**减少布尔数据的策略。               | - `WITH_ANY_VALUE`：任意值均可优化。<br>- `WITH_ZERO`：仅对零值优化。<br>通常使用 `WITH_ANY_VALUE`。 |
| **Reduce Bool Data By Numerical Relation Threshold**     | 通过数值关系减少布尔数据的阈值   | 指定通过**数值关系优化**减少布尔数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Constant Data To a Define**                     | 将常量数据简化为宏定义           | 勾选后，将**常量数据**生成为**宏定义（#define）** 而非变量，以节省 RAM。 | 建议勾选，减少 RAM 占用。                                    |
| **Reduce Data By Streaming**                             | 通过流式处理减少数据             | 勾选后，启用**流式处理优化**，减少数据的内存占用。           | 仅在内存极度受限的场景中启用。                               |
| **Reduce Numerical Data By Array Subtraction Threshold** | 通过数组减法减少数值数据的阈值   | 指定通过**数组减法优化**减少数值数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Numerical Data By Offset Threshold**            | 通过偏移量减少数值数据的阈值     | 指定通过**偏移量优化**减少数值数据的阈值。当多个数值可以通过共享偏移量压缩时，超过该阈值则进行优化。 | 通常保持默认值。                                             |
| **Referring Keys In Comments**                           | 在注释中包含引用键               | 勾选后，在生成的代码注释中包含**引用键（Referring Keys）**，便于追溯配置来源。 | 建议勾选，便于代码与配置的追溯。                             |
| **Short Symbols**                                        | 短符号                           | 勾选后，生成**短符号名**，减少生成代码中符号的长度以节省内存。 | 仅在内存极度受限的场景中启用，一般保持默认（不勾选）。       |

> [!note]
>
> 1. **代码生成优化的目标**：`PduRGeneration` 中的各种策略主要围绕 **减少代码体积** 和 **减少 RAM 占用** 两个目标，通过在代码生成阶段进行数据压缩和去重，优化最终生成的 C 代码。
>
> 2. **开发 vs 量产配置建议**：
>
>    | 参数                               | 开发阶段 | 量产阶段 |
>    | :--------------------------------- | :------- | :------- |
>    | `Out Of Bounds Read Sanitizer`     | ✅ 勾选   | ❌ 关闭   |
>    | `Out Of Bounds Write Sanitizer`    | ✅ 勾选   | ❌ 关闭   |
>    | `Interfaces For Deactivated Data`  | ❌ 关闭   | ❌ 关闭   |
>    | `Reduce Constant Data To a Define` | ✅ 勾选   | ✅ 勾选   |
>    | `Short Symbols`                    | ❌ 关闭   | 按需     |
>    | `Referring Keys In Comments`       | ✅ 勾选   | ✅ 勾选   |
>
> 3. **内存优化策略的权衡**：启用更多的数据去重和最小化策略可以减少内存占用，但可能增加代码的复杂性和运行时开销。需要在内存节省和代码可读性/性能之间进行权衡。

## PduRRoutingTables

`PduRRoutingTables` 是 PduR 模块中**路由表配置的顶层容器**，用于组织和管理 PduR 的所有路由路径配置。

| 参数名称             | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                |
| :------------------- | :-------------- | :----------------------------------------------------------- | :--------------------------------- |
| **Short Name**       | 短名称          | 该路由表配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。       |
| **Configuration Id** | 配置 ID         | 该路由表配置在 PduR 模块内部的**数字标识符**，用于索引不同的路由表配置。 | 通常由工具自动生成，无需手动修改。 |

> [!note]
>
> 1. **PduRRoutingTables 的作用**：`PduRRoutingTables` 是 PduR 路由配置的**顶层容器**，其子容器 `PduRRoutingTable` 和 `PduRRoutingPaths` 中定义了具体的路由路径（即 PDU 从源模块到目标模块的完整流转关系）。
>
> 2. **路由配置的层级关系**：
>
>    ```txt
>    PduRRoutingTables
>    └── PduRRoutingTable 实例
>        ├── PduRRoutingPaths
>        │   └── RoutingPath 实例
>        │       ├── PduRSrcPdu（源 PDU）
>        │       └── PduRDestPdus（目标 PDU 列表）
>        └── PduRRoutingPathGroups（路由路径分组）
>    ```
>
> 3. **配置 ID 的典型用途**：`Configuration Id` 通常用于在代码生成时标识不同的路由表配置变体，在大多数项目中保持默认值即可。



### PduRExclusiveArea 实例

`PduRExclusiveArea` 用于配置 **PduR 模块的独占区域（Exclusive Area）**，在多核或功能安全场景中，用于保护共享资源不被并发访问，确保数据一致性。

| 参数名称              | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                |
| :-------------------- | :-------------- | :----------------------------------------------------------- | :--------------------------------- |
| **Short Name**        | 短名称          | 该独占区域配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。       |
| **Exclusive Area Id** | 独占区域 ID     | 该独占区域在 PduR 模块内部的**数字标识符**，用于索引和识别不同的独占区域。 | 通常由工具自动生成，无需手动修改。 |

> [!note]
>
> 1. **独占区域的作用**：`PduRExclusiveArea` 是 PduR 模块中的**临界区（Critical Section）** 配置，用于保护多核或中断上下文中的共享资源（如 PDU 队列、路由表等）。当多个任务或中断同时访问 PduR 的数据结构时，独占区域确保同一时间只有一个上下文能够访问受保护的资源。
>
> 2. **独占区域的典型应用场景**：
>    - **多核系统**：不同 CPU 核心同时访问 PduR 的共享数据结构。
>    - **中断上下文**：中断服务函数与主函数同时访问 PduR 的队列。
>    - **功能安全**：防止数据竞争导致的不确定行为。
>
> 3. **与 PduRLock 的关系**：
>    - `PduRLock`：定义锁的容器实例，通过 `PduRExclusiveArea` 引用具体的独占区域，将锁与具体保护的资源关联。
>    - `PduRExclusiveArea`：定义独占区域的配置，包含 ID 和具体保护的数据结构。

### RoutingPath 实例

`PduRRoutingPaths` 下的每个实例用于定义 **一条完整的 PDU 路由路径**，指定 PDU 从源模块到目标模块的完整流转关系，是 PduR 路由配置的核心单元。

| 参数名称                            | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称           | 该路由路径配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Lock Ref**                        | 锁引用           | 引用 **PduRLock** 中的独占区域配置，用于在多核或中断上下文中保护该路由路径的共享资源。 | 在多核或功能安全项目中需要正确配置，单核项目可保持默认。     |
| **Multicore Routing Path**          | 多核路由路径     | 勾选后，表示该路由路径用于**多核**场景，数据在不同 CPU 核心之间路由。 | 仅在多核项目中勾选，单核项目保持默认（不勾选）。             |
| **Routing Path Communication Type** | 路由路径通信类型 | 指定该路由路径的**通信类型**，标识 PDU 的来源或去向模块类型。 | - `COMMUNICATION_INTERFACE`：通信接口类型（如 CanIf）。<br>- `TRANSPORT_PROTOCOL`：传输协议类型（如 CanTp）。<br>- `UPPER_LAYER`：上层模块类型（如 Com、Dcm）。 |

> [!note]
>
> 1. **路由路径的完整结构**：
>
>    ```txt
>    PduRRoutingPaths
>    └── RoutingPath 实例
>        ├── PduRSrcPdu（源 PDU）
>        └── PduRDestPdus（目标 PDU 列表）
>            └── PduRDestPdu（单个目标 PDU）
>    ```
>
>    - **源 PDU（PduRSrcPdu）**：定义 PDU 来自哪个模块。
>    - **目标 PDU（PduRDestPdus）**：定义 PDU 发送到哪个或哪些模块。
>
> 2. **通信类型的含义**：
>
>    | 通信类型                  | 说明                     | 示例模块     |
>    | :------------------------ | :----------------------- | :----------- |
>    | `COMMUNICATION_INTERFACE` | 底层通信接口模块         | CanIf、LinIf |
>    | `TRANSPORT_PROTOCOL`      | 传输协议模块（支持分段） | CanTp        |
>    | `UPPER_LAYER`             | 上层应用/协议模块        | Com、Dcm     |
>
> 3. **多核场景的注意事项**：在多核项目中，如果路由路径跨越不同的 CPU 核心，需要配置 `Lock Ref` 和勾选 `Multicore Routing Path`，以确保数据访问的原子性和一致性。

### PduRDestPdu 实例

`PduRDestPdus` 下的每个实例用于定义 **路由路径中的一个目标 PDU**，指定 PDU 从源模块路由到目标模块时的目标模块、数据处理方式、队列管理等参数。

| 参数名称                                 | 中文直译 / 作用       | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :-------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称                | 该目标 PDU 配置实例的唯一标识名。                            | 用于在工具中识别该配置实例。                                 |
| **Dest Pdu Cross Partition Destination** | 目标 PDU 跨分区目标   | 指定该目标 PDU 是否跨分区传输。勾选后，目标 PDU 发送到不同的 OS 分区。 | 仅在多分区系统中需要配置，单分区系统保持默认。               |
| **Dest Pdu Data Processing**             | 目标 PDU 数据处理方式 | 指定目标 PDU 的**数据处理方式**，决定数据在路由过程中的处理时机。 | - `IMMEDIATE`：立即处理，在主函数调用中同步处理。<br>- `DEFERRED`：延迟处理，在主函数中异步处理。<br>通常使用 `IMMEDIATE`。 |
| **Dest Pdu Data Provision**              | 目标 PDU 数据提供方式 | 指定目标 PDU 的**数据提供方式**，定义数据如何传递给目标模块。 | - `RECEIVE`：接收方式，数据从源模块传递到目标模块。<br>- `SEND`：发送方式，数据从目标模块传递到源模块。<br>根据数据流向配置。 |
| **Dest Pdu Direction**                   | 目标 PDU 方向         | 指定该目标 PDU 在 PduR 内部的数据流向方向标识符。            | 通常由工具自动生成，无需手动修改。                           |
| **Dest Pdu Handle Id**                   | 目标 PDU 句柄 ID      | 该目标 PDU 在 PduR 内部的**数字句柄标识符**，用于索引和识别。 | 通常由工具自动生成，无需手动修改。                           |
| **Dest Pdu Partition Ref**               | 目标 PDU 分区引用     | 引用该目标 PDU 所属的 **OS 分区** 配置，用于多分区系统。     | 在单分区项目中通常指向 `Com` 或 `Dcm` 等目标模块的分区引用。 |
| **Dest Pdu PduRBswModules Ref**          | 目标 PDU BSW 模块引用 | **关键引用**。指向 **EcuC 中定义的 PDU 配置实例**，将该目标 PDU 与具体的 BSW 模块 PDU 实例关联。 | **必须正确引用**，否则 PduR 无法将数据传递给目标模块。该引用指向 `EcuC/EcuPduCollection` 中的 PDU 实例。 |
| **Dest Pdu Queue Depth**                 | 目标 PDU 队列深度     | 指定该目标 PDU 的**队列深度**，即最多可缓存的 PDU 数量。     | 在 `DEFERRED` 模式下需要配置，`IMMEDIATE` 模式下保持默认。   |
| **Dest Pdu Routing Type**                | 目标 PDU 路由类型     | 指定该目标 PDU 的**路由类型**。                              | - `API_FORWARDING`：通过 API 转发。<br>- `IGNORE`：忽略该目标。<br>通常使用 `API_FORWARDING`。 |
| **Dest Tx Buffer Ref**                   | 目标发送缓冲区引用    | 引用该目标 PDU 使用的**发送缓冲区**配置。                    | 仅在发送方向需要时配置，一般保持为空。                       |
| **Pdu Length Handling Strategy**         | PDU 长度处理策略      | 指定 PDU 长度的**处理策略**，决定如何处理长度不匹配的情况。  | 根据项目需求配置，通常保持默认。                             |
| **Queue Ref**                            | 队列引用              | 引用该目标 PDU 使用的**队列**配置。                          | 在 `DEFERRED` 模式下需要配置。                               |
| **Tp Threshold**                         | TP 阈值               | 指定 **传输协议（TP）** 的阈值，超过该长度的 PDU 将使用分段传输。 | 仅在目标模块为 `CanTp` 等传输协议模块时配置。                |
| **Transmission Confirmation**            | 发送确认              | 指定该目标 PDU 的**发送确认**方式，决定是否以及如何确认 PDU 已成功发送。 | 根据目标模块能力配置，支持发送确认的模块（如 CanIf）通常需要配置。 |

> [!note]
>
> 1. **目标 PDU 在路由路径中的位置**：
>
>    ```txt
>    PduRRoutingPaths
>    └── RoutingPath 实例
>        ├── PduRSrcPdu（源 PDU）
>        └── PduRDestPdus（目标 PDU 列表）
>            └── PduRDestPdu 实例  ← 当前配置
>    ```
>
>    一个路由路径可以包含多个目标 PDU，实现一对多的数据分发。
>
> 2. **IMMEDIATE vs DEFERRED 的选择**：
>
>    | 处理方式    | 特点                               | 适用场景                                                   |
>    | :---------- | :--------------------------------- | :--------------------------------------------------------- |
>    | `IMMEDIATE` | 同步处理，在调用上下文中立即完成   | 实时性要求高、处理逻辑简单的场景                           |
>    | `DEFERRED`  | 异步处理，暂存队列后在主函数中处理 | 处理逻辑复杂、或调用上下文不允许长时间处理的场景（如中断） |
>
> 3. **关键引用的完整性**：`Dest Pdu PduRBswModules Ref` 是目标 PDU 配置中最重要的参数，它建立了 PduR 与目标 BSW 模块之间的连接。**必须正确引用**，否则数据无法传递到目标模块。

### PduRSrcPdu 实例

`PduRSrcPdu` 用于定义 **路由路径中的源 PDU**，指定 PDU 来自哪个 BSW 模块以及对应的 PDU 实例引用。

| 参数名称                       | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                 | 短名称              | 该源 PDU 配置实例的唯一标识名。                              | 用于在工具中识别该配置实例。                                 |
| **Source Pdu Handle Id**       | 源 PDU 句柄 ID      | 该源 PDU 在 PduR 内部的**数字句柄标识符**，用于索引和识别。  | 通常由工具自动生成，无需手动修改。                           |
| **Src Pdu Direction**          | 源 PDU 方向         | 指定该源 PDU 的**数据方向**，标识数据是接收还是发送。        | - `RECEIVE`：接收方向，数据从源模块流向 PduR。<br>- `SEND`：发送方向，数据从 PduR 流向源模块。 |
| **Src Pdu Partition Ref**      | 源 PDU 分区引用     | 引用该源 PDU 所属的 **OS 分区** 配置，用于多分区系统。       | 在单分区项目中通常保持为空。                                 |
| **Src Pdu PduRBswModules Ref** | 源 PDU BSW 模块引用 | **关键引用**。指向 **PduRBswModules** 中定义的 BSW 模块实例，标识该源 PDU 来自哪个 BSW 模块。 | **必须正确引用**，否则 PduR 无法识别该源 PDU 的来源模块。    |
| **Src Pdu Ref**                | 源 PDU 引用         | **关键引用**。指向 **EcuC 中定义的 PDU 配置实例**，将该源 PDU 与具体的底层 PDU 实例关联。 | **必须正确引用**，否则 PduR 无法从该 PDU 接收数据。该引用指向 `EcuC/EcuPduCollection` 中的 PDU 实例。 |

> [!note]
>
> 1. **源 PDU 在路由路径中的位置**：
>
>    ```txt
>    PduRRoutingPaths
>    └── RoutingPath 实例
>        ├── PduRSrcPdu 实例  ← 当前配置
>        └── PduRDestPdus
>            └── PduRDestPdu 实例
>    ```
>
>    - 每个路由路径有且仅有一个源 PDU。
>    - 源 PDU 定义了数据的**来源**，目标 PDU 定义了数据的**去向**。
>
> 2. **方向标识的含义**：
>    - `Src Pdu Direction = RECEIVE`：该源 PDU 的数据流向为 **从 BSW 模块到 PduR**（如 CanIf 接收到报文后传递给 PduR）。
>    - `Src Pdu Direction = SEND`：该源 PDU 的数据流向为 **从 PduR 到 BSW 模块**（如 Com 发送报文时通过 PduR 传递给 CanIf）。
>
> 3. **与目标 PDU 的协作**：
>    - **源 PDU**：定义数据的**来源**（哪个模块、哪个 PDU 实例）。
>    - **目标 PDU**：定义数据的**去向**（哪个模块、哪个 PDU 实例）。
>    - 两者共同构成完整的路由路径，实现 PDU 在 BSW 模块之间的流转。

# Com

```txt
Com
├── ComConfig
│   ├── ComCrossPartitionRoutingQueues
│	│	├── ComCrossPartitionRoutingQueue
│	│	│	└── ComCrossPartitionRoutingQueues 实例
│	│	└── ComCrossPartitionRoutingQueue
│	│		└── ComDescriptionRoutingQueue 实例
│	├── ComGwMappings
│	│	├── ComGwMapping
│	│	│	├── ComGwDestinations
│	│	│	│	└── ComGwDestination
│	│	│	│		└── ComGwSignal实例
│	│	│	└── ComGwSource
│	│	│		└── ComGwSignal实例
│	│	└── ComGwMapping
│	│		├── ComGwDestinations
│	│		│	└── ComGwDestination
│	│		│		└── ComGwDestinationDescription 实例
│	│		└── ComGwSource
│	│			└── ComGwSourceDescription 实例				
│   ├── ComIPduGroups
│   │   ├── ComIPduGroup实例
│	│	│	└── ComTxIPdu
│	│	│		├── ComTxModeFalse
│	│	│		│	└── ComTxMode
│	│	│		└── ComTxModeTrue
│	│	│			└── ComTxMode
│	│	├── ComIPduCounter
│	│	└── ComIPduReplication
│   ├── ComIPdus
│   │   └── ComIPdu实例
│   ├── ComSignalGroups
│   │   └── ComSignalGroup实例
│   │       └── ComGroupSignals
│   │           └── ComSignal实例
│   ├── ComSignals
│   │   └── ComSignal实例
│   ├── ComMainFunctionRouteSignals
│	│	└── ComMainFunctionRouteSignals
│   ├── ComMainFunctionRxs
│   │   └── ComMainFunctionRx实例
│   │       └── ComMainFunctionRx_10ms
│   └── ComMainFunctionTxs
│       └── ComMainFunctionTx实例
│           └── ComMainFunctionTx_1ms
│           └── ComMainFunctionTx_10ms 
├── ComGeneral
├── ComGeneration
└── ComOptimization

```



| 子容器                             | 中文直译 / 惯称             | 核心功能职责                                                 | 关键配置内容举例                                             |
| :--------------------------------- | :-------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **ComIPduGroups**                  | Com IPDU 组配置             | 将多个 **IPDU（交互层 PDU）** 分组管理，便于统一配置信号处理属性。 | 每个 `ComIPduGroup` 实例包含多个 IPDU 引用，用于配置组内 IPDU 的信号处理方式。 |
| **ComIPdus**                       | **核心配置**。Com IPDU 配置 | 定义 **IPDU（交互层协议数据单元）** 的属性，是 Com 模块中最核心的配置单元之一。 | 每个 `ComIPdu` 实例对应一个通信 PDU，包含 PDU ID、传输模式、信号映射、发送/接收属性等。 |
| **ComSignalGroups**                | Com 信号组配置              | 将多个 **信号（Signal）** 组合成一个信号组，便于统一管理和处理。 | 每个 `ComSignalGroup` 实例包含多个 `ComSignal`，用于信号组的管理。 |
| **ComSignals**                     | **核心配置**。Com 信号配置  | 定义 **信号（Signal）** 的属性，是 Com 模块中最基础的配置单元。 | 每个 `ComSignal` 实例对应一个应用信号，包含信号在 IPDU 中的起始位、长度、数据类型、初始值等。 |
| **ComMainFunctionRouteSignals**    | Com 主函数路由信号配置      | 配置 **主函数中信号路由** 的相关参数，定义信号在 Com 主函数中的处理方式。 | 定义信号在主函数周期中的路由和处理方式。                     |
| **ComMainFunctionRxss**            | Com 接收主函数集配置        | 配置 **接收方向的主函数（Rx MainFunction）** 集合，定义接收信号的处理周期。 | 包含多个 `ComMainFunctionRx` 实例（如 `ComMainFunctionRx_10ms`），每个实例定义对应周期的接收处理。 |
| **ComMainFunctionTxss**            | Com 发送主函数集配置        | 配置 **发送方向的主函数（Tx MainFunction）** 集合，定义发送信号的处理周期。 | 包含多个 `ComMainFunctionTx` 实例（如 `ComMainFunctionTx_1ms`、`ComMainFunctionTx_10ms`），每个实例定义对应周期的发送处理。 |
| **ComCrossPartitionRoutingQueues** | Com 跨分区路由队列配置      | 配置 **跨分区路由队列**，用于多分区系统中信号在不同分区间的传递。 | 在支持多分区（如 ASIL 分区）的项目中配置，单分区项目保持默认。 |
| **ComGeneral**                     | Com 通用配置                | 配置 Com 模块的**全局行为参数**，如模块开关、错误检测、主函数周期等。 | 包含模块的全局运行参数，如开发错误检测开关、主函数周期、信号处理策略等。 |
| **ComGeneration**                  | Com 代码生成配置            | 配置 Com 模块的**代码生成选项**，控制生成代码的优化策略和数据结构。 | 控制生成代码的数据类型、内存优化策略、调试支持等。           |
| **ComOptimization**                | Com 优化配置                | 配置 Com 模块的**优化选项**，用于优化信号处理的性能。        | 包含信号访问优化、内存布局优化等参数。                       |
| **ComGwMappings**                  | Com 网关映射配置            | 配置 **网关（Gateway）** 映射关系，用于信号在不同通信协议之间的路由。 | 在需要 CAN→LIN 或 CAN→CAN 网关功能时配置。                   |

> [!note]
>
> 1. **Com 模块在 AUTOSAR 通信栈中的位置**：Com 模块位于 AUTOSAR 通信栈的**上层**，介于 PduR 和应用层（SWC）之间。它负责将通信信号从 IPDU 中提取/填充，实现信号的**打包（Pack）** 和**解包（Unpack）** 功能。
>
> 2. **信号与 IPDU 的关系**：
>    - **IPDU（交互层 PDU）**：包含多个信号，是通信的最小传输单元。
>    - **Signal**：IPDU 中的具体数据字段，对应应用层的物理值。
>    - 一个 IPDU 可以包含多个信号，一个信号只能属于一个 IPDU。
>
> 3. **信号数据的流向**：
>    - **接收方向（Rx）**：CanIf → PduR → Com → ComIPdu → 提取信号 → SWC。
>    - **发送方向（Tx）**：SWC → 填充信号 → ComIPdu → PduR → CanIf → 总线。

## ComConfig

`ComConfig` 是 Com 模块的**顶层配置容器**，用于配置 Com 模块的整体属性和资源分配参数，包括内存大小、IPDU 数量、事件缓存大小等。

| 参数名称                                 | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称               | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Configuration Id**                     | 配置 ID              | 该配置在 Com 模块内部的**数字标识符**，用于索引和识别不同的配置变体。 | 通常由工具自动生成，无需手动修改。                           |
| **Data Mem Size**                        | 数据内存大小         | 指定 Com 模块用于存储信号数据的**内存池大小**，以字节为单位。Com 模块使用此内存池管理所有信号数据。 | 根据项目中信号的总数量和数据量配置，需确保足够容纳所有信号数据。通常由工具自动计算。 |
| **Max IPdu Cnt**                         | 最大 IPDU 数量       | 指定 Com 模块支持的**最大 IPDU 数量**。                      | 根据项目中定义的 IPDU 总数配置，需大于或等于实际 IPDU 数量。通常由工具自动计算。 |
| **Rx Deferred Event Cache Size**         | 接收延迟事件缓存大小 | 指定 **接收延迟事件缓存** 的大小，用于暂存延迟处理的接收事件。 | 在启用延迟接收处理时配置，通常由工具自动计算。               |
| **Rx Deferred Notification Cache Size**  | 接收延迟通知缓存大小 | 指定 **接收延迟通知缓存** 的大小，用于暂存延迟处理的接收通知事件。 | 在启用延迟通知处理时配置，通常由工具自动计算。               |
| **Rx Immediate Notification Cache Size** | 接收立即通知缓存大小 | 指定 **接收立即通知缓存** 的大小，用于暂存立即处理的接收通知事件。 | 在启用立即通知处理时配置，通常由工具自动计算。               |

> [!note]
>
> 1. **延迟处理与立即处理的区别**：
>
>    | 处理方式                  | 特点                             | 适用场景                       |
>    | :------------------------ | :------------------------------- | :----------------------------- |
>    | **立即处理（Immediate）** | 在中断或调用上下文中同步处理     | 实时性要求高、处理逻辑简单     |
>    | **延迟处理（Deferred）**  | 暂存到缓存中，在主函数中异步处理 | 处理逻辑复杂、需要减少中断负载 |
>
> 2. **缓存大小的配置原则**：
>    - `Rx Deferred Event Cache Size`、`Rx Deferred Notification Cache Size`、`Rx Immediate Notification Cache Size` 共同决定了 Com 模块能够同时处理的接收事件数量。
>    - 如果缓存过小，可能导致事件丢失。
>    - 如果缓存过大，浪费内存资源。
>    - 建议在系统集成测试中根据实际负载调整。
>
> 3. **工具自动计算**：`Data Mem Size`、`Max IPdu Cnt` 等资源参数通常由 Vector 工具链根据配置的 IPDU 和信号数量自动计算，一般不需要手动修改。如果手动修改，需要确保值足够容纳所有配置的 IPDU 和信号数据。

### ComCrossPartitionRoutingQueues 实例

`ComCrossPartitionRoutingQueues` 用于配置 **Com 模块跨分区路由队列**，在多分区系统（如功能安全 ASIL 分区）中，实现信号在不同 OS 分区之间的安全传递。

| 参数名称                                     | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                               | 短名称             | 该跨分区路由队列配置实例的唯一标识名。                       | 用于在工具中识别该配置实例。                                 |
| **Cross Partition Queue Size A to B [Byte]** | 跨分区队列大小 A→B | 指定从**分区 A 到分区 B** 的跨分区队列大小，以字节为单位。数据从分区 A 传递到分区 B 时使用此队列。 | 根据跨分区通信的数据量配置，需确保能够容纳所有跨分区传递的数据。 |
| **Cross Partition Queue Size B to A [Byte]** | 跨分区队列大小 B→A | 指定从**分区 B 到分区 A** 的跨分区队列大小，以字节为单位。数据从分区 B 传递到分区 A 时使用此队列。 | 根据跨分区通信的数据量配置，需确保能够容纳所有跨分区传递的数据。 |
| **Ecuc Partition ARef**                      | ECU 分区 A 引用    | **关键引用**。引用 **分区 A** 的 OS 分区配置实例，标识跨分区通信的源/目标分区之一。 | **必须正确引用**，确保跨分区通信能够正确路由到目标分区。     |
| **Ecuc Partition BRef**                      | ECU 分区 B 引用    | **关键引用**。引用 **分区 B** 的 OS 分区配置实例，标识跨分区通信的源/目标分区之一。 | **必须正确引用**，确保跨分区通信能够正确路由到目标分区。     |

> [!note]
>
> 1. **跨分区通信的使用场景**：在 AUTOSAR 多分区系统中，不同功能安全等级（ASIL）的软件组件运行在不同的 OS 分区中，以隔离故障。`ComCrossPartitionRoutingQueues` 提供了分区间的**安全通信通道**，确保信号能够在不同分区之间安全传递。
>
> 2. **双向队列的典型配置**：
>
>    ```txt
>    Partition A → Partition B：使用 Queue A→B
>    Partition B → Partition A：使用 Queue B→A
>    ```
>
>    - 每个方向都需要独立的队列，避免数据竞争和死锁。
>    - 队列大小应根据跨分区通信的数据量配置。
>
> 3. **功能安全注意事项**：跨分区通信是功能安全架构中的关键环节，需要确保：
>    - 队列大小足够防止数据丢失。
>    - 队列访问受 OS 保护的临界区机制保护。
>    - 队列的配置在分区 A 和分区 B 的配置中保持一致。

### ComDescriptionRoutingQueue 实例

`ComDescriptionRoutingQueue` 用于配置 **Com 模块描述路由队列**，定义跨分区通信中用于传递信号数据的队列大小和关联的分区引用。

| 参数名称                                    | 中文直译 / 作用    | 详细解释                                                   | 配置要点 / 注意事项                                          |
| :------------------------------------------ | :----------------- | :--------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                              | 短名称             | 该描述路由队列配置实例的唯一标识名。                       | 用于在工具中识别该配置实例。                                 |
| **Cross Partition Queue Size Ato B [Byte]** | 跨分区队列大小 A→B | 指定从**分区 A 到分区 B** 的跨分区队列大小，以字节为单位。 | 根据跨分区通信的数据量配置，需确保能够容纳所有跨分区传递的数据。 |
| **Cross Partition Queue Size Bto A [Byte]** | 跨分区队列大小 B→A | 指定从**分区 B 到分区 A** 的跨分区队列大小，以字节为单位。 | 根据跨分区通信的数据量配置，需确保能够容纳所有跨分区传递的数据。 |
| **Ecuc Partition ARef**                     | ECU 分区 A 引用    | **关键引用**。引用 **分区 A** 的 OS 分区配置实例。         | **必须正确引用**，确保跨分区通信能够正确路由到目标分区。     |
| **Ecuc Partition BRef**                     | ECU 分区 B 引用    | **关键引用**。引用 **分区 B** 的 OS 分区配置实例。         | **必须正确引用**，确保跨分区通信能够正确路由到目标分区。     |

> [!note]
>
> 1. **描述路由队列的作用**：`ComDescriptionRoutingQueue` 与 `ComCrossPartitionRoutingQueues` 功能类似，均用于配置跨分区通信的队列参数。两者的区别在于配置层面：
>    - `ComCrossPartitionRoutingQueues`：通常用于配置**一组**跨分区路由队列。
>    - `ComDescriptionRoutingQueue`：通常用于配置**单个**描述路由队列，与特定的通信描述关联。
>
> 2. **跨分区通信的典型应用场景**：
>    - ASIL 分区之间的信号传递（如 ASIL-D 分区到 QM 分区的数据传递）。
>    - 不同 OS 应用之间的数据交换。
>
> 3. **配置注意事项**：
>    - 两个方向的队列大小应独立配置，因为 A→B 和 B→A 的数据量可能不同。
>    - `Ecuc Partition ARef` 和 `Ecuc Partition BRef` 必须引用有效的分区配置，否则跨分区通信将失败。

### ComGwSignal 实例

`ComGwSignal` 用于配置 **网关映射中的信号映射关系**，定义源信号与目标信号之间的对应关系，实现信号在不同通信协议或不同 PDU 之间的路由。

| 参数名称          | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**    | 短名称          | 该网关信号映射配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **Gw Signal Ref** | 网关信号引用    | **关键引用**。指向 **ComSignals** 中定义的**信号实例**，将该网关映射与具体的信号关联起来。通过此引用，网关映射能够确定需要路由的源信号或目标信号。 | **必须正确引用**，否则网关映射无法确定对应的信号。该引用指向 `ComSignals` 中定义的具体信号配置实例。 |

> [!note]
>
> 1. **网关映射的作用**：在 AUTOSAR 通信架构中，网关（Gateway）功能允许将信号从一个通信网络路由到另一个通信网络（如 CAN→LIN、CAN→CAN）。`ComGwSignal` 是网关映射的基本单元，定义了信号级别的映射关系。
>
> 2. **网关映射的典型配置链路**：
>
>    ```txt
>    ComGwMappings
>    └── ComGwMapping 实例
>        └── ComGwSignal 实例  ← 当前配置
>            ├── Gw Signal Ref → 源信号
>            └── (目标信号配置在 ComGwMapping 中)
>    ```
>
>    - 一个网关映射包含多个 `ComGwSignal`，每个信号映射定义了一条信号级别的路由规则。
>
> 3. **信号网关的典型应用场景**：
>    - **CAN→LIN 网关**：将 CAN 总线上的信号路由到 LIN 总线。
>    - **CAN→CAN 网关**：在不同 CAN 通道之间路由信号（如 CAN0→CAN1）。
>    - **信号值转换**：在路由过程中对信号值进行缩放或转换。

### ComGwDestinationDescription 实例

`ComGwDestinationDescription` 用于配置 **网关映射中目标信号的描述信息**，定义目标信号在目标 IPDU 中的位置、字节序、初始值等属性。

| 参数名称                | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**          | 短名称          | 该网关目标信号描述配置实例的唯一标识名。                     | 用于在工具中识别该配置实例。                                 |
| **Bit Position**        | 位位置          | 指定该目标信号在目标 IPDU 中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在目标 IPDU 中的位置与通信矩阵一致。 |
| **Gw IPdu Ref**         | 网关 IPDU 引用  | **关键引用**。指向 **ComIPdus** 中定义的 **IPDU 实例**，将该目标信号与目标 IPDU 关联起来。 | **必须正确引用**，否则网关映射无法确定目标 IPDU。            |
| **Signal Endianness**   | 信号大小端      | 指定该目标信号的**字节序**。                                 | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式）。<br>**必须与通信矩阵一致**。 |
| **Signal Init Value**   | 信号初始值      | 指定该目标信号的**初始值**，在信号未被更新时使用。           | 根据项目需求配置，通常保持默认值。                           |
| **Transfer Property**   | 传输属性        | 指定该信号的**传输属性**，定义信号在网关传输时的行为。       | - `PENDING`：挂起传输，等待条件满足时发送。<br>- `TRIGGERED`：触发传输，立即发送。<br>根据项目需求配置。 |
| **Update Bit Position** | 更新位位置      | 指定该目标信号的**更新位位置**，用于指示信号是否已被更新。   | 通常在需要信号更新指示时配置，一般保持默认。                 |

> [!note]
>
> 1. **网关目标信号描述的作用**：`ComGwDestinationDescription` 定义了网关映射中**目标信号的具体属性**，包括在目标 IPDU 中的位置、字节序、初始值等。它确保源信号的值能够正确地映射到目标 IPDU 中。
>
> 2. **网关映射的完整结构**：
>
>    ```txt
>    ComGwMapping 实例
>        ├── ComGwSignal 实例（源信号 → 目标信号映射）
>        │   ├── Gw Signal Ref（源信号引用）
>        │   └── ComGwDestinationDescription（目标信号描述）← 当前配置
>        └── (其他信号映射)
>    ```
>
> 3. **Transfer Property 的选择**：
>    - `PENDING`：信号等待合适的发送时机（如 IPDU 的发送周期到达时）才发送，适合周期性信号。
>    - `TRIGGERED`：信号立即发送，适合事件型信号。

### ComGwSourceDescription 实例

`ComGwSourceDescription` 用于配置 **网关映射中源信号的描述信息**，定义源信号在源 IPDU 中的位置、长度、数据类型等属性。

| 参数名称                | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**          | 短名称          | 该网关源信号描述配置实例的唯一标识名。                       | 用于在工具中识别该配置实例。                                 |
| **Bit Position**        | 位位置          | 指定该源信号在源 IPDU 中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在源 IPDU 中的位置与通信矩阵一致。 |
| **Bit Size**            | 位大小          | 指定该源信号的**位长度**，以比特为单位。                     | 根据信号的实际位宽配置。                                     |
| **Gw IPdu Ref**         | 网关 IPDU 引用  | **关键引用**。指向 **ComIPdus** 中定义的 **IPDU 实例**，将该源信号与源 IPDU 关联起来。 | **必须正确引用**，否则网关映射无法确定源 IPDU。              |
| **Signal Endianness**   | 信号大小端      | 指定该源信号的**字节序**。                                   | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式）。<br>**必须与通信矩阵一致**。 |
| **Signal Length**       | 信号长度        | 指定该源信号的**长度**，以比特为单位。                       | 与 `Bit Size` 类似，通常二者保持一致。                       |
| **Signal Type**         | 信号类型        | 指定该源信号的**数据类型**。                                 | 可选类型如 `BOOLEAN`、`UINT8`、`UINT16`、`UINT32`、`SINT8`、`FLOAT32` 等。**必须与实际数据匹配**。 |
| **Update Bit Position** | 更新位位置      | 指定该源信号的**更新位位置**，用于指示信号是否已被更新。     | 通常在需要信号更新指示时配置，一般保持默认。                 |

> [!note]
>
> 1. **网关源信号描述的作用**：`ComGwSourceDescription` 定义了网关映射中**源信号的具体属性**，包括在源 IPDU 中的位置、长度、数据类型等。它确保能够正确地从源 IPDU 中提取信号值。
>
> 2. **网关映射的完整结构**：
>
>    ```txt
>    ComGwMapping 实例
>        ├── ComGwSignal 实例（源信号 → 目标信号映射）
>        │   ├── ComGwSourceDescription（源信号描述）← 当前配置
>        │   └── ComGwDestinationDescription（目标信号描述）
>        └── (其他信号映射)
>    ```
>
> 3. **Signal Type 的重要性**：`Signal Type` 决定了信号的**数据解析方式**，在信号值从源 IPDU 提取时，Com 模块需要根据此类型进行正确的数据转换。如果类型配置错误，信号值将被错误解析。

### ComIPduGroup 实例

`ComIPduGroups` 下的每个实例用于将多个 **IPDU（交互层 PDU）** 组织为一个逻辑组，便于统一配置和管理组内 IPDU 的信号处理属性。

| 参数名称                 | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**           | 短名称          | 该 IPDU 组配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **IPdu Group Group Ref** | IPDU 组引用     | 引用该 IPDU 组中包含的 **IPDU 实例**，将具体的 IPDU 添加到该组中。 | 一个 IPDU 组可以包含多个 IPDU。该引用指向 `ComIPdus` 中定义的 IPDU 实例。 |
| **IPdu Group Handle Id** | IPDU 组句柄 ID  | 该 IPDU 组在 Com 模块内部的**数字句柄标识符**，用于索引和识别不同的 IPDU 组。 | 通常由工具自动生成，无需手动修改。                           |

> [!note]
>
> 1. **IPDU 组的作用**：`ComIPduGroup` 将多个 IPDU 组织在一起，便于统一配置信号处理属性（如信号更新策略、传输模式等）。在复杂项目中，IPDU 组有助于简化配置管理。
>
> 2. **IPDU 组的典型应用场景**：
>    - 将同一通信周期（如 10ms）的 IPDU 组织在一起。
>    - 将同一信号来源（如同一 CAN 通道）的 IPDU 组织在一起。
>    - 将同一应用功能相关的 IPDU 组织在一起。

### ComIPdu 实例

`ComIPdus` 下的每个实例用于定义 **Com 模块中的一个 IPDU（交互层 PDU）** ，是 Com 模块中最核心的配置单元之一。它定义了 IPDU 的方向、处理方式、主函数引用、关联的信号等属性，是信号通信的承载单元。

| 参数名称                          | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------- | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                    | 短名称            | 该 IPDU 配置实例的唯一标识名。                               | 用于在工具中识别该配置实例，通常包含方向信息（`_Tx` 或 `_Rx`）。 |
| **Ecu Partition Ref**             | ECU 分区引用      | 引用该 IPDU 所属的 **OS 分区** 配置，用于多分区系统。        | 在单分区项目中通常保持为空。                                 |
| **IPDu Callout**                  | IPDU 回调         | 指定该 IPDU 的**回调函数**，用于在 IPDU 接收或发送时触发自定义处理逻辑。 | 仅在需要自定义处理时配置，一般保持为空。                     |
| **IPDu Cancellation Support**     | IPDU 取消支持     | 勾选后，表示该 IPDU 支持**取消发送**操作。                   | 与 CanIf 中的取消发送功能配合使用，一般保持默认（不勾选）。  |
| **IPDu Direction**                | IPDU 方向         | 指定该 IPDU 的**数据方向**。                                 | - `SEND`：发送方向，数据从应用层流向总线。<br>- `RECEIVE`：接收方向，数据从总线流向应用层。<br>**必须正确配置**，决定信号的流向。 |
| **IPDu Handle Id**                | IPDU 句柄 ID      | 该 IPDU 在 Com 模块内部的**数字句柄标识符**，用于索引和识别。 | 通常由工具自动生成，无需手动修改。                           |
| **IPDu Main Function Ref**        | IPDU 主函数引用   | **关键引用**。指向 **ComMainFunctionTxss** 或 **ComMainFunctionRxss** 中的主函数实例，指定该 IPDU 由哪个主函数周期处理。 | **必须正确引用**，否则 IPDU 的信号处理无法执行。             |
| **IPDu Signal Processing**        | IPDU 信号处理方式 | 指定该 IPDU 的**信号处理方式**，决定信号数据在 IPDU 中的处理时机。 | - `IMMEDIATE`：立即处理。<br>- `DEFERRED`：延迟处理，在主函数中处理。<br>通常使用 `DEFERRED`。 |
| **IPDu Trigger Transmit Callout** | IPDU 触发发送回调 | 指定 **触发发送** 的回调函数名称，在 IPDU 被触发发送时调用。 | 仅在需要触发发送功能时配置，一般保持为空。                   |
| **IPDu Type**                     | IPDU 类型         | 指定该 IPDU 的**类型**。                                     | - `NORMAL`：普通 IPDU。<br>- `TRIGGERED`：触发型 IPDU。<br>通常使用 `NORMAL`。 |
| **Pdu Id Ref**                    | PDU ID 引用       | **关键引用**。指向 **EcuC 中定义的 PDU 配置实例**，将该 IPDU 与底层通信 PDU 关联。 | **必须正确引用**，否则 Com 无法与 PduR 进行数据交换。        |
| **IPDu Group Ref**                | IPDU 组引用       | 引用该 IPDU 所属的 **IPDU 组（ComIPduGroup）** 配置。        | 根据项目配置，将 IPDU 组织到对应的组中，便于统一管理。       |
| **IPDu Signal Group Ref**         | IPDU 信号组引用   | 引用该 IPDU 包含的 **信号组（ComSignalGroup）** 配置。       | 如果 IPDU 中的信号通过信号组组织，则需引用对应的信号组。     |
| **IPDu Signal Ref**               | IPDU 信号引用     | **关键引用**。指向 **ComSignals** 中定义的 **信号实例**，将该 IPDU 与具体的信号关联。一个 IPDU 可以包含多个信号，每个信号通过单独的 `IPDu Signal Ref` 引用。 | **必须正确引用**，否则 IPDU 中没有可用的信号数据。           |

> [!note]
>
> 1. **IPDU 与信号的关系**：
>
>    ```txt
>    ComIPdu 实例
>        ├── IPDu Signal Ref → ComSignal（信号1）
>        ├── IPDu Signal Ref → ComSignal（信号2）
>        └── IPDu Signal Ref → ComSignal（信号N）
>    ```
>
>    一个 IPDU 可以包含多个信号，信号在 IPDU 中的位置由 `BitPosition` 定义。Com 模块在发送时将所有信号打包到 IPDU 中，在接收时从 IPDU 中解包出各个信号。
>
> 2. **主函数引用的作用**：`IPDu Main Function Ref` 决定了该 IPDU 由哪个主函数周期处理。例如，发送周期为 10ms 的 IPDU 引用 `ComMainFunctionTx_10ms`，发送周期为 1ms 的 IPDU 引用 `ComMainFunctionTx_1ms`。
>
> 3. **DEFERRED vs IMMEDIATE**：
>    - **DEFERRED**：信号在 IPDU 主函数中处理，适合大多数场景，减少中断负载。
>    - **IMMEDIATE**：信号在调用上下文中立即处理，适合实时性要求高的场景。

### ComTxMode 实例

`ComTxMode` 用于配置 **发送 IPDU 的传输模式（Transmission Mode）** ，定义 IPDU 的发送策略，包括发送方式、重复次数、周期等参数。

| 参数名称                           | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------- | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                     | 短名称           | 该传输模式配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Tx Mode Mode**                   | 传输模式         | 指定该 IPDU 的**发送模式**。                                 | - `DIRECT`：直接模式，IPDU 在数据更新后立即发送。<br>- `PERIODIC`：周期模式，IPDU 按固定周期发送。<br>- `MIXED`：混合模式，结合 DIRECT 和 PERIODIC 的特性。<br>根据信号类型和通信需求选择。 |
| **Tx Mode Number Of Repetitions**  | 传输模式重复次数 | 指定 IPDU 的**重复发送次数**。在 DIRECT 模式下，IPDU 发送后可能重复发送指定次数以提高可靠性。 | 仅在需要重复发送时配置，通常保持为 0（不重复）。             |
| **Tx Mode Repetition Period [ms]** | 传输模式重复周期 | 指定 IPDU **重复发送的周期**，以毫秒为单位。                 | 与 `Number Of Repetitions` 配合使用，定义重复发送的时间间隔。 |
| **Tx Mode Time Offset [ms]**       | 传输模式时间偏移 | 指定 IPDU 发送的**时间偏移**，以毫秒为单位。用于在同一周期内错开多个 IPDU 的发送时间。 | 用于分散总线负载，避免多个 IPDU 同时发送导致总线冲突。       |
| **Tx Mode Time Period [ms]**       | 传输模式时间周期 | 指定 IPDU 的**发送周期**，以毫秒为单位。在 PERIODIC 模式下有效。 | **必须正确配置**，定义 IPDU 的发送周期。典型值如 1ms、5ms、10ms、20ms、100ms 等。 |

> [!note]
>
> 1. **三种传输模式的对比**：
>
>    | 模式       | 触发条件                           | 适用场景                           |
>    | :--------- | :--------------------------------- | :--------------------------------- |
>    | `DIRECT`   | 信号值发生变化时立即发送           | 事件型信号（如开关状态变化）       |
>    | `PERIODIC` | 按固定周期发送                     | 周期性状态信号（如温度、转速）     |
>    | `MIXED`    | 信号变化时发送，同时按周期重复发送 | 既有变化触发又需要周期性确认的信号 |
>
> 2. **时间偏移的作用**：当多个 IPDU 共享同一周期（如多个 10ms IPDU）时，通过配置不同的 `Time Offset`，可以将它们的发送时间分散到周期内的不同时刻，避免总线瞬间拥堵。
>
> 3. **重复发送的典型应用**：在可靠性要求高的场景中（如安全关键信号），可以配置 IPDU 重复发送多次，确保接收方至少收到一次有效数据。`Number Of Repetitions` 和 `Repetition Period` 共同控制重复行为。

### ComIPduCounter 实例

`ComIPduCounter` 用于配置 **IPDU 的计数器（Counter）** 属性，定义 IPDU 中用于安全或诊断目的的计数器的位置、大小和阈值。

| 参数名称                            | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称              | 该 IPDU 计数器配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **IPdu Counter Error Notification** | IPDU 计数器错误通知 | 勾选后，当计数器**发生错误**（如溢出或值不一致）时，Com 模块会触发错误通知回调，通知上层模块。 | 建议勾选，便于监控计数器的状态和检测通信异常。               |
| **IPdu Counter Size**               | IPDU 计数器大小     | 指定计数器在 IPDU 中的**大小（位宽）**，以比特为单位。       | 根据项目需求配置，典型值为 1-8 位。位宽决定了计数器的最大值（2^n - 1）。 |
| **IPdu Counter Start Position**     | IPDU 计数器起始位置 | 指定计数器在 IPDU 数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保接收方能从正确位置提取计数器值。       |
| **IPdu Counter Threshold**          | IPDU 计数器阈值     | 指定计数器的**阈值**，当计数器值达到此阈值时，触发相应的处理（如溢出通知或重置）。 | 根据项目需求配置，通常设置为计数器的最大值或接近最大值的值。 |

> [!note]
>
> 1. **计数器的用途**：IPDU 中的计数器用于多种目的：
>    - **安全通信（SecOC）**：防止重放攻击，确保消息的新鲜度。
>    - **信号验证**：检测信号是否被正确更新（如结合更新位）。
>    - **通信诊断**：检测 IPDU 是否丢失或重复接收。
>
> 2. **计数器的典型配置示例**（4 位计数器，从位 8 开始）：
>
>    | 参数                          | 值   | 说明                   |
>    | :---------------------------- | :--- | :--------------------- |
>    | `IPdu Counter Size`           | 4    | 4 位计数器，范围 0-15  |
>    | `IPdu Counter Start Position` | 8    | 从第 8 位开始          |
>    | `IPdu Counter Threshold`      | 15   | 达到 15 时触发溢出处理 |
>
> 3. **接收方的计数器验证**：接收方通过比较当前接收到的计数器值与预期值，可以检测 IPDU 是否丢失或重复。如果计数器值不连续（跳跃或回退），接收方可以触发错误处理。

### ComIPduReplication 实例

`ComIPduReplication` 用于配置 **IPDU 复制（Replication）** 属性，定义 IPDU 的复制策略和副本数量。

| 参数名称                    | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------- | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**              | 短名称            | 该 IPDU 复制配置实例的唯一标识名。                           | 用于在工具中识别该配置实例。                                 |
| **IPdu Replication Quorum** | IPDU 复制法定人数 | 指定 IPDU 复制所需的**法定人数（Quorum）**，即在多个副本中至少需要成功接收/发送的副本数量，才认为通信成功。 | 根据项目冗余策略配置。典型值为 1（任一副本成功即可）或更高（需要多数副本成功）。 |
| **IPdu Replica Ref**        | IPDU 副本引用     | 引用该 IPDU 的**副本（Replica）** 配置，定义具体的复制策略。如果为空，表示不启用 IPDU 复制功能。 | 仅在需要 IPDU 冗余通信时配置，一般保持为空（不启用复制）。   |

> [!note]
>
> 1. **IPDU 复制的作用**：IPDU 复制用于**冗余通信**场景，通过发送多个相同数据的副本，提高通信的可靠性。即使部分副本丢失或损坏，只要达到法定人数（Quorum）要求的副本数量，通信仍然有效。
>
> 2. **典型应用场景**：
>    - **功能安全（ASIL）通信**：通过冗余传输提高通信的可靠性。
>    - **高噪声环境**：在电磁干扰严重的环境中，通过多副本传输提高数据接收成功率。
>
> 3. **法定人数的含义**：
>    - `Quorum = 1`：只要有一个副本成功即可，最宽松的策略。
>    - `Quorum = N/2 + 1`：需要超过半数的副本成功，多数决策策略。
>    - `Quorum = N`：所有副本都必须成功，最严格的策略。

### ComMainFunctionRouteSignals 实例

`ComMainFunctionRouteSignals` 用于配置 **Com 主函数中信号路由（Route Signals）** 的周期参数，定义信号在主函数中路由处理的时间基准。

| 参数名称                              | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                             |
| :------------------------------------ | :----------------- | :----------------------------------------------------------- | :---------------------------------------------- |
| **Short Name**                        | 短名称             | 该信号路由主函数配置实例的唯一标识名。                       | 用于在工具中识别该配置实例。                    |
| **Main Route Signals Partition Ref**  | 主路由信号分区引用 | 引用该信号路由主函数所属的 **OS 分区** 配置，用于多分区系统。 | 在单分区项目中通常保持为空。                    |
| **Main Route Signals Time Base [ms]** | 主路由信号时间基准 | 指定信号路由主函数的**时间基准（周期）**，以毫秒为单位。该周期决定了信号在主函数中路由处理的频率。 | 根据项目调度周期配置，典型值为 1ms、5ms、10ms。 |

> [!note]
>
> 1. **信号路由主函数的作用**：`ComMainFunctionRouteSignals` 对应的主函数负责处理 **信号的内部路由**，即将信号从 Com 模块路由到应用层（SWC）或从应用层路由到 Com 模块。该主函数按 `Main Route Signals Time Base` 配置的周期执行。
>
> 2. **与 Rx/Tx 主函数的区别**：
>    - `ComMainFunctionRouteSignals`：处理**信号与 RTE 之间的路由**（信号 ↔ SWC）。
>    - `ComMainFunctionRx` / `ComMainFunctionTx`：处理 **IPDU 层面的接收/发送**（信号 ↔ IPDU）。
>
> 3. **周期配置的建议**：
>    - 信号路由主函数的周期通常与 IPDU 的接收/发送周期一致或成倍数关系。
>    - 如果周期过长，信号更新延迟增加；如果周期过短，CPU 负载增加。
>    - 典型配置为 5ms 或 10ms，与系统的基础调度周期保持一致。

### ComMainFunctionRx 实例

`ComMainFunctionRx` 用于配置 **Com 模块接收方向主函数（Rx MainFunction）** 的周期参数，定义接收 IPDU 处理的执行频率。

| 参数名称                   | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                             |
| :------------------------- | :-------------- | :----------------------------------------------------------- | :---------------------------------------------- |
| **Short Name**             | 短名称          | 该接收主函数配置实例的唯一标识名。                           | 用于在工具中识别该配置实例。                    |
| **Main Rx Partition Ref**  | 主接收分区引用  | 引用该接收主函数所属的 **OS 分区** 配置，用于多分区系统。    | 在单分区项目中通常保持为空。                    |
| **Main Rx Time Base [ms]** | 主接收时间基准  | 指定接收主函数的**时间基准（周期）**，以毫秒为单位。该周期决定了 Com 模块检查并处理接收 IPDU 的频率。 | 根据项目调度周期配置，典型值为 1ms、5ms、10ms。 |

> [!note]
>
> 1. **接收主函数的作用**：`ComMainFunctionRx` 是 Com 模块中负责 **接收方向处理** 的主函数，主要任务包括：
>    - 从 PduR 获取接收到的 IPDU 数据。
>    - 从 IPDU 中解包（Unpack）出各个信号。
>    - 将信号值更新到 Com 模块的信号缓存中。
>    - 触发信号更新回调（如需要）。
>
> 2. **与 Tx 主函数的区别**：
>    - `ComMainFunctionRx`：处理 **接收方向** 的 IPDU（总线 → 应用层）。
>    - `ComMainFunctionTx`：处理 **发送方向** 的 IPDU（应用层 → 总线）。
>
> 3. **周期配置的建议**：
>    - 接收主函数的周期通常与 IPDU 的接收周期一致。
>    - 如果周期过长，信号更新延迟增加；如果周期过短，CPU 负载增加。
>    - 典型配置为 10ms，与系统的基础调度周期保持一致。

### ComMainFunctionTx 实例

`ComMainFunctionTx` 用于配置 **Com 模块发送方向主函数（Tx MainFunction）** 的周期参数，定义发送 IPDU 处理的执行频率。

| 参数名称                   | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                             |
| :------------------------- | :-------------- | :----------------------------------------------------------- | :---------------------------------------------- |
| **Short Name**             | 短名称          | 该发送主函数配置实例的唯一标识名。                           | 用于在工具中识别该配置实例。                    |
| **Main Tx Partition Ref**  | 主发送分区引用  | 引用该发送主函数所属的 **OS 分区** 配置，用于多分区系统。    | 在单分区项目中通常保持为空。                    |
| **Main Tx Time Base [ms]** | 主发送时间基准  | 指定发送主函数的**时间基准（周期）**，以毫秒为单位。该周期决定了 Com 模块检查并处理待发送 IPDU 的频率。 | 根据项目调度周期配置，典型值为 1ms、5ms、10ms。 |

> [!note]
>
> 1. **发送主函数的作用**：`ComMainFunctionTx` 是 Com 模块中负责 **发送方向处理** 的主函数，主要任务包括：
>    - 检查信号是否有更新。
>    - 将信号打包（Pack）到 IPDU 中。
>    - 将 IPDU 传递给 PduR 发送到总线上。
>
> 2. **与 Rx 主函数的对称性**：
>    - `ComMainFunctionRx`：处理 **接收方向**，周期通常与接收 IPDU 的周期匹配。
>    - `ComMainFunctionTx`：处理 **发送方向**，周期通常与发送 IPDU 的周期匹配。
>
> 3. **周期配置的建议**：
>    - 发送主函数的周期通常与 IPDU 的发送周期一致（如 `ComMainFunctionTx_1ms` 处理 1ms 周期的发送 IPDU）。
>    - 多个发送主函数实例可以配置不同的周期，以支持不同周期的 IPDU 发送需求。

### ComSignalGroup 实例

`ComSignalGroups` 下的每个实例用于将多个 **信号（Signal）** 组合成一个信号组，便于统一管理和处理。

| 参数名称                             | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                       | 短名称             | 该信号组配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Data Invalid Action**              | 数据无效时的动作   | 指定当信号组中信号数据**无效**时，Com 模块应执行的动作。     | 根据项目需求配置，通常为保持最后有效值或使用默认值。         |
| **Error Notification**               | 错误通知           | 勾选后，当信号组发生**错误**时，Com 模块会触发错误通知回调。 | 建议勾选，便于监控信号组状态。                               |
| **First Timeout [ms]**               | 首次超时时间       | 指定信号组**首次超时**的时间，以毫秒为单位。当信号组在指定时间内未收到更新时触发超时处理。 | 根据项目需求配置，通常与通信周期相关。                       |
| **Handle Id**                        | 句柄 ID            | 该信号组在 Com 模块内部的**数字句柄标识符**，用于索引和识别。 | 通常由工具自动生成，无需手动修改。                           |
| **Invalid Notification**             | 无效通知           | 勾选后，当信号组中信号变为**无效**时，Com 模块会触发通知回调。 | 建议勾选，便于监控信号组状态。                               |
| **Notification**                     | 通知回调           | 指定信号组的**通知回调函数**名称。当信号组中的信号发生更新时调用。 | 通常指向 RTE 生成的回调函数，用于通知应用层（SWC）信号已更新。 |
| **Rx Data Timeout Action**           | 接收数据超时动作   | 指定当接收数据**超时**时的处理动作。                         | 根据项目需求配置。                                           |
| **Signal Group Access**              | 信号组访问方式     | 指定应用层对信号组的**访问方式**。                           | - `ACCESS_UNCLEAR`：不清除访问。<br>- 其他选项根据项目架构定义。 |
| **Signal Group Array Access**        | 信号组数组访问     | 指定信号组是否支持**数组访问**方式。                         | 通常保持默认。                                               |
| **System Template Signal Group Ref** | 系统模板信号组引用 | 引用 **系统模板** 中定义的信号组，用于与系统模板集成。       | 通常保持为空。                                               |
| **Timeout [ms]**                     | 超时时间           | 指定信号组的**超时时间**，以毫秒为单位。当信号组在指定时间内未收到更新时触发超时处理。 | 根据项目需求配置。                                           |
| **Timeout Notification**             | 超时通知           | 勾选后，当信号组发生**超时**时，Com 模块会触发超时通知回调。 | 建议勾选，便于监控信号组状态。                               |
| **Transfer Property**                | 传输属性           | 指定信号组的**传输属性**，定义信号组在通信中的传输行为。     | - `PENDING`：挂起传输。<br>- `TRIGGERED`：触发传输。<br>根据项目需求配置。 |
| **Update Bit Position**              | 更新位位置         | 指定信号组中**更新位（Update Bit）** 的位位置，用于指示信号组中的信号是否已被更新。 | 根据信号组配置，仅在需要更新位时配置。                       |

> [!note]
>
> 1. **信号组的作用**：`ComSignalGroup` 将多个信号组合在一起，便于统一配置超时、通知、传输属性等参数。在信号数量较多的项目中，信号组有助于简化配置管理。
>
> 2. **信号组与 IPDU 的关系**：
>    - 信号组中的信号可以分布在同一个 IPDU 中，也可以分布在多个 IPDU 中。
>    - 通过 `ComIPdu` 中的 `IPDu Signal Group Ref` 引用信号组，将信号组与 IPDU 关联。
>
> 3. **超时机制的工作原理**：当信号组在 `Timeout` 指定的时间内未收到更新，Com 模块会触发超时处理，调用 `Timeout Notification` 回调函数通知上层模块。`First Timeout` 用于信号组的首次超时检测，通常与 `Timeout` 配合使用。

### ComGroupSignal 实例

`ComGroupSignals` 下的每个实例用于配置 **信号组中的单个信号**，定义信号在 IPDU 中的位置、数据类型、字节序等属性。

| 参数名称                               | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                         | 短名称               | 该组信号配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Bit Position**                       | 位位置               | 指定该信号在 IPDU 中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在 IPDU 中的位置与通信矩阵一致。   |
| **Bit Size [Bit]**                     | 位大小               | 指定该信号的**位长度**，以比特为单位。                       | 根据信号的实际位宽配置。                                     |
| **Handle Id**                          | 句柄 ID              | 该信号在 Com 模块内部的**数字句柄标识符**，用于索引和识别。  | 通常由工具自动生成，无需手动修改。                           |
| **Rx Data Timeout Substitution Value** | 接收数据超时代换值   | 指定当接收数据**超时**时，Com 模块用于替代的**代换值**。     | 根据项目需求配置，通常配置为默认值或 0。                     |
| **Signal Access**                      | 信号访问方式         | 指定应用层对该信号的**访问方式**。                           | - `ACCESS_UNCLEAR`：不清除访问。<br>- 其他选项根据项目架构定义。 |
| **Signal Data Invalid Value**          | 信号数据无效值       | 指定当信号数据**无效**时的默认值。                           | 根据项目需求配置。                                           |
| **Signal Endianness**                  | 信号大小端           | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式）。<br>**必须与通信矩阵一致**。 |
| **Signal Init Value**                  | 信号初始值           | 指定该信号的**初始值**，在信号未被更新时使用。               | 根据项目需求配置。                                           |
| **Signal Length [Byte]**               | 信号长度             | 指定该信号的**长度**，以字节为单位。                         | 与 `Bit Size` 配合使用，通常保持一致。                       |
| **Signal Type**                        | 信号类型             | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`FLOAT32` 等。**必须与实际数据匹配**。 |
| **System Template System Signal Ref**  | 系统模板系统信号引用 | 引用 **系统模板** 中定义的系统信号，用于与系统模板集成。     | 通常保持为空。                                               |
| **Transfer Property**                  | 传输属性             | 指定该信号的**传输属性**，定义信号在通信中的传输行为。       | - `PENDING`：挂起传输。<br>- `TRIGGERED`：触发传输。<br>根据项目需求配置。 |

> [!note]
>
> 1. **组信号与普通信号的区别**：`ComGroupSignal` 与 `ComSignal` 功能类似，均定义信号在 IPDU 中的属性。区别在于 `ComGroupSignal` 属于 `ComSignalGroup` 的子容器，信号通过信号组组织；而 `ComSignal` 独立配置，直接属于 `ComSignals` 容器。
>
> 2. **位位置配置示例**：
>
>    | 信号     | 起始位 | 长度（位） | 数据类型 |
>    | :------- | :----- | :--------- | :------- |
>    | Signal A | 0      | 8          | UINT8    |
>    | Signal B | 8      | 16         | UINT16   |
>    | Signal C | 24     | 1          | BOOLEAN  |
>
>    信号在 IPDU 中按位排列，Com 模块根据 `Bit Position` 和 `Bit Size` 进行打包/解包。
>
> 3. **信号类型的重要性**：`Signal Type` 决定了信号值的**数据解析方式**。如果类型配置错误，信号值将被错误解析（如将 UINT16 错误配置为 UINT8 会导致数据截断）。

### ComSignal 实例

`ComSignals` 下的每个实例用于配置 **Com 模块中的一个信号（Signal）**，定义信号在 IPDU 中的位置、数据类型、字节序、初始值、超时处理等属性。信号是 Com 模块中最基本的通信数据单元。

| 参数名称                               | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                         | 短名称               | 该信号配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Bit Position**                       | 位位置               | 指定该信号在 IPDU 中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在 IPDU 中的位置与通信矩阵一致。   |
| **Bit Size [Bit]**                     | 位大小               | 指定该信号的**位长度**，以比特为单位。                       | 根据信号的实际位宽配置。                                     |
| **Data Invalid Action**                | 数据无效时的动作     | 指定当信号数据**无效**时，Com 模块应执行的动作。             | 根据项目需求配置，通常为保持最后有效值或使用默认值。         |
| **Error Notification**                 | 错误通知             | 勾选后，当信号发生**错误**时，Com 模块会触发错误通知回调。   | 建议勾选，便于监控信号状态。                                 |
| **First Timeout [ms]**                 | 首次超时时间         | 指定信号**首次超时**的时间，以毫秒为单位。当信号在指定时间内未收到更新时触发首次超时处理。 | 根据项目需求配置，通常与通信周期相关。                       |
| **Handle Id**                          | 句柄 ID              | 该信号在 Com 模块内部的**数字句柄标识符**，用于索引和识别。  | 通常由工具自动生成，无需手动修改。                           |
| **Invalid Notification**               | 无效通知             | 勾选后，当信号变为**无效**时，Com 模块会触发通知回调。       | 建议勾选，便于监控信号状态。                                 |
| **Notification**                       | 通知回调             | 指定信号的**通知回调函数**名称。当信号发生更新时调用，通常指向 RTE 生成的回调函数，用于通知应用层（SWC）信号已更新。 | 根据项目架构配置，通常指向 RTE 回调函数（以 `Rte_COMCbk_` 为前缀）。 |
| **Rx Data Timeout Action**             | 接收数据超时动作     | 指定当接收数据**超时**时的处理动作。                         | 根据项目需求配置。                                           |
| **Rx Data Timeout Substitution Value** | 接收数据超时代换值   | 指定当接收数据超时后，Com 模块用于替代的**代换值**。         | 根据项目需求配置，通常配置为默认值。                         |
| **Signal Access**                      | 信号访问方式         | 指定应用层对该信号的**访问方式**。                           | - `ACCESS_UNCLEAR`：不清除访问。<br>- 其他选项根据项目架构定义。 |
| **Signal Data Invalid Value**          | 信号数据无效值       | 指定当信号数据**无效**时的默认值。                           | 根据项目需求配置。                                           |
| **Signal Endianness**                  | 信号大小端           | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式）。<br>**必须与通信矩阵一致**。 |
| **Signal Init Value**                  | 信号初始值           | 指定该信号的**初始值**，在信号未被更新时使用。               | 根据项目需求配置，通常为 0 或安全默认值。                    |
| **Signal Length [Byte]**               | 信号长度             | 指定该信号的**长度**，以字节为单位。                         | 与 `Bit Size` 配合使用，通常保持一致。                       |
| **Signal Type**                        | 信号类型             | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32`、`BOOLEAN` 等。**必须与实际数据匹配**。 |
| **System Template System Signal Ref**  | 系统模板系统信号引用 | 引用 **系统模板** 中定义的系统信号，用于与系统模板集成。     | 通常保持为空，仅在使用系统模板的标准化项目中配置。           |
| **Timeout [ms]**                       | 超时时间             | 指定信号的**超时时间**，以毫秒为单位。当信号在指定时间内未收到更新时触发超时处理。 | 根据项目需求配置，通常与通信周期相关。                       |
| **Timeout Notification**               | 超时通知             | 勾选后，当信号发生**超时**时，Com 模块会触发超时通知回调。   | 建议勾选，便于监控信号状态。                                 |
| **Transfer Property**                  | 传输属性             | 指定信号的**传输属性**，定义信号在通信中的传输行为。         | - `PENDING`：挂起传输。<br>- `TRIGGERED`：触发传输。<br>根据项目需求配置。 |

> [!note]
>
> 1. **信号在 IPDU 中的布局**：Com 模块根据 `Bit Position` 和 `Bit Size` 将信号打包到 IPDU 中。多个信号在 IPDU 中按位排列，不能重叠。
>
> 2. **通知回调的作用**：`Notification` 回调函数用于在信号值更新时通知应用层（SWC），实现数据驱动的通信模式。当信号组或信号被更新时，Com 模块通过 RTE 调用此回调函数。
>
> 3. **超时机制的工作原理**：当信号在 `Timeout` 指定的时间内未收到更新，Com 模块会触发超时处理：
>    - 调用 `Timeout Notification` 回调（如果配置）。
>    - 将信号值替换为 `Rx Data Timeout Substitution Value`。
>    - 信号状态变为无效，触发 `Invalid Notification`（如果配置）。
>
> 4. **Signal Type 的重要性**：`Signal Type` 决定了信号值的**数据解析方式**和**物理值范围**。例如，`SINT16` 表示有符号 16 位整数，范围为 -32768 到 32767。如果类型配置错误，信号值将被错误解析。

## ComGeneral

`ComGeneral` 是 Com 模块的**顶层通用配置容器**，用于配置 Com 模块的全局行为参数，包括错误检测、元数据支持、信号网关、多分区支持等功能开关。

| 参数名称                               | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                         | 短名称             | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Configuration Use Det**              | 配置使用 DET       | 勾选后，Com 模块在配置时使用 **DET（开发错误跟踪器）** 进行错误报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Deferred Event Cache Support**       | 延迟事件缓存支持   | 勾选后，启用 **延迟事件缓存** 支持，将事件暂存到缓存中，在主函数中异步处理。 | 建议勾选，减少中断负载，提高系统实时性。                     |
| **Description Gateway**                | 描述网关           | 勾选后，启用 **描述网关** 功能，支持基于描述的信号网关路由。 | 仅在需要信号网关功能时启用。                                 |
| **Enable MDT For Cyclic Transmission** | 启用 MDT 周期传输  | 勾选后，启用 **MDT（最小延迟时间）** 用于周期传输，控制 IPDU 的发送时序。 | 建议勾选，便于控制周期信号的发送时序。                       |
| **Enable Signal Group Array Api**      | 启用信号组数组 API | 勾选后，生成 **信号组数组访问 API**，允许应用层通过数组方式访问信号组。 | 根据项目架构配置，仅在需要数组访问时启用。                   |
| **Meta Data Support**                  | 元数据支持         | 勾选后，启用 **元数据（Meta Data）** 支持，允许在信号数据之外传递额外的元信息（如时间戳、优先级等）。 | 仅在需要时间同步或数据溯源等高级功能时启用。                 |
| **Mixed Mode Periodic Suppression**    | 混合模式周期抑制   | 勾选后，在 **混合传输模式** 下，当信号值未变化时抑制周期性发送。 | 建议勾选，减少不必要的总线负载。                             |
| **Multi Partition**                    | 多分区支持         | 勾选后，启用 **多分区支持**，允许 Com 模块在多 OS 分区环境中运行。 | 在 **多分区系统**（如 ASIL/QM 分区）中需要勾选，单分区项目保持关闭。 |
| **Retry Failed Transmit Requests**     | 重试失败的发送请求 | 勾选后，当发送请求失败时，Com 模块会**自动重试**发送。       | 建议勾选，提高发送可靠性。                                   |
| **Safe Bsw Checks**                    | 安全 BSW 检查      | 勾选后，启用**安全 BSW 检查**，对关键参数进行合法性检查，用于功能安全场景。 | 在 **ASIL/功能安全** 项目中建议勾选，QM 项目保持关闭。       |
| **Signal Gateway**                     | 信号网关           | 勾选后，启用 **信号网关** 功能，允许信号在不同通信网络之间路由。 | 仅在需要网关功能时启用。                                     |
| **Strict Repetition Period**           | 严格重复周期       | 勾选后，IPDU 的**重复发送周期**严格按配置执行，不会因其他因素调整。 | 通常保持默认（不勾选），以允许系统进行必要的时序调整。       |
| **Supported IPdu Groups**              | 支持的 IPDU 组     | 指定 Com 模块支持的 **IPDU 组**，用于组织和管理 IPDU。       | 通常由工具自动生成，无需手动修改。                           |
| **User Config File**                   | 用户配置文件       | 指定一个**用户自定义配置文件**的路径，允许用户通过外部文件覆盖部分 Com 配置。 | 通常保持为空。                                               |
| **Version Info Api**                   | 版本信息 API       | 勾选后，生成 **`Com_GetVersionInfo`** API，用于获取 Com 模块的版本信息。 | 建议勾选，便于版本管理和调试。                               |
| **User Cbk Header File**               | 用户回调头文件     | 指定包含用户自定义回调函数声明的**头文件**名称。Com 模块在生成代码时会包含这些头文件，以确保回调函数的声明可见。 | 截图中包含 `Appl_Cbk.h` 和 `Rte_Cbk.h`，分别用于应用层和 RTE 层的回调函数。根据项目架构配置。 |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                              | 开发阶段 | 量产阶段      |
>    | :-------------------------------- | :------- | :------------ |
>    | `Configuration Use Det`           | ✅ 勾选   | ❌ 关闭        |
>    | `Safe Bsw Checks`                 | ✅ 勾选   | ASIL 项目勾选 |
>    | `Version Info Api`                | ✅ 勾选   | ✅ 勾选        |
>    | `Deferred Event Cache Support`    | ✅ 勾选   | ✅ 勾选        |
>    | `Retry Failed Transmit Requests`  | ✅ 勾选   | ✅ 勾选        |
>    | `Mixed Mode Periodic Suppression` | ✅ 勾选   | ✅ 勾选        |
>
> 2. **用户回调头文件的作用**：`User Cbk Header File` 指定了包含用户自定义回调函数声明的头文件。在生成代码时，Com 模块会在生成的 C 文件中包含这些头文件，确保回调函数的声明在编译时可见。通常至少需要包含 RTE 生成的头文件（如 `Rte_Cbk.h`），以便信号通知回调能够正确连接到应用层 SWC。

## ComGeneration

`ComGeneration` 用于配置 **Com 模块代码生成** 时的优化策略，控制生成代码的数据结构、内存占用和调试支持。

| 参数名称                                                 | 中文直译 / 作用                  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------- | :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                           | 短名称                           | 该代码生成配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Bool Data In Array Of Struct Strategy**                | 结构体数组中的布尔数据处理策略   | 指定在结构体数组中处理**布尔类型数据**的策略。               | - `BOOLEAN`：直接使用布尔类型。<br>- `BITMASKING`：使用位掩码存储布尔值，节省内存。<br>根据项目对内存和性能的权衡选择。 |
| **Data Deduplication Strategy**                          | 数据去重策略                     | 指定**数据去重**的策略，识别并合并重复的数据配置以减少生成代码的体积。 | - `WITH_CAST`：进行类型转换去重。<br>- `NONE`：不去重。<br>通常使用 `WITH_CAST` 以减小代码体积。 |
| **Deduplicate Indirected Data**                          | 去重间接数据                     | 勾选后，对**间接引用数据**也进行去重处理，进一步减少代码体积。 | 建议勾选，减少生成的代码大小。                               |
| **Interfaces For Deactivated Data**                      | 为停用数据生成接口               | 勾选后，为**已停用的数据**也生成 RTE 接口（即使数据未启用）。 | 仅在调试或特殊开发场景中勾选，量产版本保持关闭。             |
| **Number Of Elements Comment Threshold**                 | 元素数量注释阈值                 | 指定在生成代码注释时，**数组元素数量的显示阈值**。当数组元素数量超过此值时，注释中显示元素数量信息。 | 通常保持默认值（如 1000）。                                  |
| **Out Of Bounds Read Sanitizer**                         | 越界读取清理器                   | 勾选后，生成**越界读取检查**代码，在读取数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Out Of Bounds Write Protection Strategy**              | 越界写入保护策略                 | 指定**越界写入保护**的策略，防止写入操作超出数组或缓冲区的边界。 | - `NONE`：不进行保护。<br>- `GUARD`：添加保护字节。<br>- `CHECK`：运行时检查。<br>ASIL 项目中建议配置，QM 项目通常选择 `NONE`。 |
| **Out Of Bounds Write Sanitizer**                        | 越界写入清理器                   | 勾选后，生成**越界写入检查**代码，在写入数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Reduce Bool Data By Negation Threshold**               | 通过取反减少布尔数据的阈值       | 指定通过**取反优化**减少布尔数据的阈值。                     | 通常保持默认值。                                             |
| **Reduce Bool Data By Numerical Comparison Threshold**   | 通过数值比较减少布尔数据的阈值   | 指定通过**数值比较优化**减少布尔数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Bool Data By Numerical Operand Strategy**       | 通过数值操作数减少布尔数据的策略 | 指定通过**数值操作数优化**减少布尔数据的策略。               | - `WITH_ANY_VALUE`：任意值均可优化。<br>- `WITH_ZERO`：仅对零值优化。<br>通常使用 `WITH_ANY_VALUE`。 |
| **Reduce Bool Data By Numerical Relation Threshold**     | 通过数值关系减少布尔数据的阈值   | 指定通过**数值关系优化**减少布尔数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Constant Data To a Define**                     | 将常量数据简化为宏定义           | 勾选后，将**常量数据**生成为**宏定义（#define）** 而非变量，以节省 RAM。 | 建议勾选，减少 RAM 占用。                                    |
| **Reduce Data By Streaming**                             | 通过流式处理减少数据             | 勾选后，启用**流式处理优化**，减少数据的内存占用。           | 仅在内存极度受限的场景中启用。                               |
| **Reduce Numerical Data By Array Subtraction Threshold** | 通过数组减法减少数值数据的阈值   | 指定通过**数组减法优化**减少数值数据的阈值。                 | 通常保持默认值。                                             |
| **Reduce Numerical Data By Offset Threshold**            | 通过偏移量减少数值数据的阈值     | 指定通过**偏移量优化**减少数值数据的阈值。                   | 通常保持默认值。                                             |
| **Referring Keys In Comments**                           | 在注释中包含引用键               | 勾选后，在生成的代码注释中包含**引用键（Referring Keys）**，便于追溯配置来源。 | 建议勾选，便于代码与配置的追溯。                             |
| **Short Symbols**                                        | 短符号                           | 勾选后，生成**短符号名**，减少生成代码中符号的长度以节省内存。 | 仅在内存极度受限的场景中启用，一般保持默认（不勾选）。       |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                               | 开发阶段 | 量产阶段 |
>    | :--------------------------------- | :------- | :------- |
>    | `Out Of Bounds Read Sanitizer`     | ✅ 勾选   | ❌ 关闭   |
>    | `Out Of Bounds Write Sanitizer`    | ✅ 勾选   | ❌ 关闭   |
>    | `Interfaces For Deactivated Data`  | ❌ 关闭   | ❌ 关闭   |
>    | `Referring Keys In Comments`       | ✅ 勾选   | ✅ 勾选   |
>    | `Short Symbols`                    | ❌ 关闭   | 按需     |
>    | `Reduce Constant Data To a Define` | ✅ 勾选   | ✅ 勾选   |
>
> 2. **与其他 Generation 配置的一致性**：`ComGeneration` 中的参数与 `PduRGeneration`、`FvMGeneration`、`SecOCGeneration` 中的同名参数功能一致，都是 Vector 工具链中用于控制代码生成的通用选项。建议在同一项目中保持这些参数配置的一致性。

## ComOptimization

`ComOptimization` 用于配置 **Com 模块的优化选项**，定义各处理路径的中断锁阈值，用于优化信号处理的实时性和中断响应性能。

| 参数名称                                              | 中文直译 / 作用         | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------------------------- | :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                        | 短名称                  | 该优化配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Gateway Description Processing ISR Lock Threshold** | 网关描述处理 ISR 锁阈值 | 指定**网关描述处理**的中断锁阈值。当处理逻辑的复杂度或数据量超过此阈值时，Com 模块会在处理期间锁定中断，防止中断干扰；低于阈值时则允许中断嵌套。 | 根据系统实时性要求配置。阈值越大，中断被锁定的时间越长，可能影响中断响应；阈值越小，中断响应越好，但可能增加数据竞争风险。典型值为 1-10。 |
| **Gateway Processing ISR Lock Threshold**             | 网关处理 ISR 锁阈值     | 指定**网关处理**的中断锁阈值。用于信号网关处理路径的中断管理。 | 与上述参数类似，根据项目需求配置。                           |
| **IPdu Group ISR Lock Threshold**                     | IPDU 组 ISR 锁阈值      | 指定 **IPDU 组处理**的中断锁阈值。用于 IPDU 组相关处理的中断管理。 | 与上述参数类似，根据项目需求配置。                           |
| **Rx Processing ISR Lock Threshold**                  | 接收处理 ISR 锁阈值     | 指定**接收处理**的中断锁阈值。用于接收方向信号处理的中断管理。 | 与上述参数类似，根据项目需求配置。                           |
| **Tx Processing ISR Lock Threshold**                  | 发送处理 ISR 锁阈值     | 指定**发送处理**的中断锁阈值。用于发送方向信号处理的中断管理。 | 与上述参数类似，根据项目需求配置。                           |

> [!note]
>
> 1. **ISR 锁阈值的作用**：在 Com 模块处理信号数据时，为了确保数据一致性，需要禁用中断以防止数据竞争。`ISR Lock Threshold` 控制中断锁定的粒度：
>    - 当处理的数据量**小于或等于**阈值时，Com 模块不锁定中断，允许中断嵌套，提高实时性。
>    - 当处理的数据量**大于**阈值时，Com 模块在处理期间锁定中断，确保数据一致性。
>
> 2. **阈值配置的权衡**：
>    - **较小的阈值**：更频繁地锁定中断，确保数据一致性，但可能影响中断响应延迟。
>    - **较大的阈值**：更少地锁定中断，中断响应更好，但可能增加数据竞争风险。
>    - 建议根据实际系统的中断负载和实时性要求进行调优。
>
> 3. **各处理路径的含义**：
>    - **Gateway Description Processing**：网关描述信息的处理路径。
>    - **Gateway Processing**：信号网关的实际处理路径。
>    - **IPdu Group Processing**：IPDU 组的管理和处理路径。
>    - **Rx Processing**：接收方向信号处理路径。
>    - **Tx Processing**：发送方向信号处理路径。

# 应用

当我们配置通信的时候，最好自上而下的配置，依次按`Com > PDUR `

## 导入Dbc

准备好Dbc文件，然后依次点击`Project > Input Files > Open the Input Files Assistant`

> [!tip]
>
> 需要注意的是，如果需要导入多个dbc，那么多个dbc的节点名称需要一致，否则导入不了































































