---
title: Can网络管理

date: 2025-03-01
lastmod: 2025-03-01

draft: true
categories: 
- 嵌入式
tags:
- 行业标准
---



# 参考链接

[CAN BusOff相关知识点_busoff基础知识-CSDN博客](https://blog.csdn.net/king110108/article/details/73917512)

[CAN Busoff原理/快慢恢复介绍以及利用Vector VH6501 CAN干扰仪经典CAN2.0/CANFD帧触发Busoff_网络_汽车电子助手-GitCode 开源社区](https://gitcode.csdn.net/65ec47911a836825ed796575.html?dp_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Nzk5NDg2MiwiZXhwIjoxNzQ3Mjg5OTcxLCJpYXQiOjE3NDY2ODUxNzEsInVzZXJuYW1lIjoicXFfNDQ4NDQ1MTUifQ.ww7MTvppS6senQKMwVt_SuJQZBunxh2sLSnOHSehLK4)

[CANalyzer及CANOE使用六：VH6501干扰仪的使用（busoff多种干扰/短路/采样点）_基于vh6501的can干扰测试-CSDN博客](https://blog.csdn.net/qq_36407982/article/details/122054927)

# CanSm

## 通信模式

在CAN通信（尤其是基于AUTOSAR架构）中，有三种通信模式：

1. 完全通信模式（FULL_COMMUNICATION）
   - **功能**： 节点**正常收发数据**，参与总线通信（如ECU运行时）。
   - 组件状态：
     - 控制器（CAN Controller）：
       - `CANIF_CS_STARTED`（启动状态，处理协议层）。
     - 收发器（CAN Transceiver）：
       - `TRCVMODE_NORMAL`（主动驱动差分信号）。
2. 静默通信模式（SILENT_COMMUNICATION）
   - **功能**： 节点**仅接收数据，不发送数据**，避免干扰总线（如诊断监听）。
   - 组件状态：
     - 控制器：
       - `CANIF_TX_OFFLINE`（发送关闭，仅接收）。
     - 收发器：
       - 仍保持`TRCVMODE_NORMAL`（需接收物理层信号）。
3. 无通信模式（NO_COMMUNICATION）
   - **功能**： 节点**完全离线**，进入低功耗状态（如车辆熄火后）。
   - 组件状态：
     - 控制器：
       - `CANIF_CS_STOPPED`（协议层停止运行）。
     - 收发器：
       - `TRCVMODE_STANDBY`（待机模式，仅保留唤醒能力）。

---

模式切换逻辑为：

1. **唤醒事件**（如总线活动）： `NO_COMMUNICATION` → **唤醒** → `FULL_COMMUNICATION`。
2. **诊断需求**： `FULL_COMMUNICATION` → **静默** → `SILENT_COMMUNICATION`。
3. **休眠指令**： `FULL_COMMUNICATION` → **关闭** → `NO_COMMUNICATION`。

## 控制器模式

在AUTOSAR架构中，**CAN控制器（CAN Controller）的模式**由通信接口层（CAN Interface, CANIf）管理。通过分层控制（控制器模式 + PDU模式），AUTOSAR实现了灵活且低功耗的CAN通信管理。CAN控制器模式如下：

1. 启动模式（ `CANIF_CS_STARTED`）
   - 功能：
     - 控制器**完全激活**，可正常**收发CAN帧**（包括数据帧、远程帧、错误帧等）。
     - 参与总线仲裁、错误检测与恢复（如自动重传）。
   - 触发条件：
     - 网络管理（NM）请求通信，或上层模块（如ComM）授权通信。
2. 停止模式（`CANIF_CS_STOPPED`）
   - 功能：
     - 控制器**停止所有通信活动**，关闭内部时钟以降低功耗。
     - 仍可响应硬件唤醒事件（如总线显性电平）。
   - 触发条件：
     - 网络管理（NM）进入总线睡眠模式（Bus-Sleep），或ComM拒绝通信请求。
3. 睡眠模式 (`CANIF_CS_SLEEP`)
   - 功能：
     - 控制器进入**深度低功耗状态**，仅保留基础唤醒功能。
     - 需软件唤醒（调用`CanIf_ControllerWakeup()`）才能恢复通信。
   - 触发条件：
     - 明确请求低功耗（如整车电源管理指令）。

---

PDU模式与控制器模式协同工作，独立控制发送/接收行为：

| **模式**           | 发送（TX） | 接收（RX） | 说明                       |
| ------------------ | ---------- | ---------- | -------------------------- |
| `CANIF_ONLINE`     | ✅          | ✅          | 完全通信（默认模式）       |
| `CANIF_TX_OFFLINE` | ❌          | ✅          | 静默模式（仅接收）         |
| `CANIF_OFFLINE`    | ❌          | ❌          | 无通信（控制器停止或睡眠） |

---

控制器模式与其他模块的关系为：

1. 与收发器的联动：
   - 控制器进入`CANIF_CS_STOPPED`时，收发器通常切换至`TRCVMODE_STANDBY`（待机）。
   - 控制器唤醒后，收发器需先恢复`TRCVMODE_NORMAL`，再启动控制器。
2. 与网络管理（NM）的协同：
   - NM通过`CanIf_ControllerMode`控制总线参与权（如休眠时强制`CANIF_CS_STOPPED`）。
3. 与ComM的交互：
   - ComM决定通信权限，通过`CanIf_SetControllerMode`配置控制器状态。

---

状态切换示例：

1. 唤醒流程：

   ```mermaid
   graph LR
   A[总线显性电平] --> B[收发器唤醒]
   B --> C[CanIf_ControllerWakeup]
   C --> D[控制器: CANIF_CS_STARTED]
   D --> E[PDU模式: CANIF_ONLINE]
   ```

2. 休眠流程：

   ```mermaid
   graph LR
   A[NM请求休眠] --> B[ComM释放通信]
   B --> C[CanIf_SetControllerMode: CANIF_CS_STOPPED]
   C --> D[收发器待机]
   ```

---

关键差异总结：

| **模式**           | 通信能力 | 功耗 | 唤醒方式      | 适用场景 |
| ------------------ | -------- | ---- | ------------- | -------- |
| `CANIF_CS_STARTED` | 全双工   | 高   | 始终活跃      | 正常运行 |
| `CANIF_CS_STOPPED` | 无       | 中   | 硬件/总线唤醒 | 短时休眠 |
| `CANIF_CS_SLEEP`   | 无       | 极低 | 软件指令唤醒  | 深度休眠 |

## 收发器模式



在AUTOSAR架构中，**CAN收发器（CAN Transceiver）的模式**由收发器驱动（CAN Transceiver Driver, CanTrcv）管理，收发器有以下模式：

1. 正常模式（ `TRCVMODE_NORMAL`）
   - 功能：
     - 收发器**完全激活**，支持差分信号（CAN_H/CAN_L）的发送和接收。
     - 符合ISO 11898-2电气标准（显性/隐性电平）。
   - 功耗：
     - 典型值：5~15mA（取决于型号，如TJA1042）。
   - 触发条件：
     - 控制器需主动通信（`CANIF_CS_STARTED`）。
2. 待机模式（`TRCVMODE_STANDBY`）
   - 功能：
     - 收发器**停止发送**，但仍可监听总线活动（接收功能部分激活）。
     - 支持硬件唤醒（如总线显性电平触发）。
   - 功耗：
     - 典型值：100~500μA（如TJA1145）。
   - 触发条件：
     - 控制器进入`CANIF_CS_STOPPED`，但需保留唤醒能力。
3. 睡眠模式（`TRCVMODE_SLEEP`）
   - 功能：
     - 收发器**完全关闭**，断开与总线的电气连接。
     - 仅支持特定唤醒方式（如LIN唤醒、硬件引脚触发）。
   - 功耗：
     - 典型值：1~10μA（如SIT1145AQ）。
   - 触发条件：
     - 明确请求深度休眠（如整车电源管理指令）。

---

收发器模式与其他模块的关系

1. 与控制器的联动：
   - 控制器模式（`CANIF_CS_STARTED`）要求收发器必须处于`TRCVMODE_NORMAL`。
   - 控制器休眠（`CANIF_CS_STOPPED`）时，收发器可切换至`TRCVMODE_STANDBY`或`TRCVMODE_SLEEP`。
2. 与网络管理（NM）的协同：
   - NM通过`CanTrcv_SetMode`控制收发器状态（如Bus-Sleep时强制`TRCVMODE_SLEEP`）。
3. 与电源管理的交互：
   - 部分收发器通过`INH`引脚控制外部电源（睡眠时关闭MCU供电）。

---

状态切换示例：

唤醒流程（睡眠→正常）：

```mermaid
graph TB
A[总线显性电平或硬件唤醒] --> B[CanTrcv_SetMode: TRCVMODE_NORMAL]
B --> C[收发器激活差分驱动]
C --> D[控制器启动: CANIF_CS_STARTED]
```

休眠流程（正常→睡眠）：

```mermaid
graph TB
A[NM请求Bus-Sleep] --> B[CanTrcv_SetMode: TRCVMODE_SLEEP]
B --> C[收发器断开总线]
C --> D[控制器停止: CANIF_CS_STOPPED]
```

---

关键差异总结：

| **模式**           | 发送能力 | 接收能力  | 功耗        | 唤醒方式              | 适用场景   |
| ------------------ | -------- | --------- | ----------- | --------------------- | ---------- |
| `TRCVMODE_NORMAL`  | ✅        | ✅         | 高（5mA+）  | 始终活跃              | 正常通信   |
| `TRCVMODE_STANDBY` | ❌        | ⚠️（部分） | 中（100μA） | 总线显性电平/硬件唤醒 | 低功耗监听 |
| `TRCVMODE_SLEEP`   | ❌        | ❌         | 极低（μA）  | 特定引脚/LIN/软件指令 | 深度休眠   |

## 状态转换的时序图

发送`FULL_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request FULL_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(FULL_COMMUNICATION)
    CanSM->>CanIf: SetControllerMode(CANIF_CS_STARTED)
    CanSM->>CanTrcv: SetMode(TRCVMODE_NORMAL)
    CanTrcv-->>CanSM: TRCVMODE_NORMAL_ACK
    CanIf-->>CanSM: CANIF_CS_STARTED_ACK
    CanSM->>ComM: CanSM_CurrentComMode(FULL_COMMUNICATION)
    ComM-->>App: COMM_FULL_COMMUNICATION
    loop 正常通信
        CanIf->>CanTrcv: Transmit(CAN Frame)
        CanTrcv-->>CanIf: TX_ACK
    end
```

发送`SILENT_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request SILENT_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(SILENT_COMMUNICATION)
    CanSM->>CanIf: SetPduMode(CANIF_TX_OFFLINE)
    CanSM->>CanTrcv: SetMode(TRCVMODE_NORMAL)
    CanTrcv-->>CanSM: TRCVMODE_NORMAL_ACK
    CanIf-->>CanSM: PDU_MODE_ACK
    CanSM->>ComM: CanSM_CurrentComMode(SILENT_COMMUNICATION)
    ComM-->>App: COMM_SILENT_COMMUNICATION
    loop 仅接收
        CanTrcv->>CanIf: IndicateRxFrame(CAN Frame)
        CanIf->>App: NotifyRxData
    end
```

发送`NO_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request NO_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(NO_COMMUNICATION)
    CanSM->>CanIf: SetControllerMode(CANIF_CS_STOPPED)
    CanSM->>CanTrcv: SetMode(TRCVMODE_STANDBY)
    CanTrcv-->>CanSM: TRCVMODE_STANDBY_ACK
    CanIf-->>CanSM: CANIF_CS_STOPPED_ACK
    CanSM->>ComM: CanSM_CurrentComMode(NO_COMMUNICATION)
    ComM-->>App: COMM_NO_COMMUNICATION
    Note over CanTrcv: 仅响应硬件唤醒信号
```

```mermaid
stateDiagram-v2
    [*] --> NO_COMMUNICATION: 初始状态
    NO_COMMUNICATION --> FULL_COMMUNICATION: CanSM_RequestComMode(FULL)\n且CanTrcv唤醒成功
    FULL_COMMUNICATION --> SILENT_COMMUNICATION: CanSM_SetPduMode(TX_OFFLINE)\n保留接收功能
    SILENT_COMMUNICATION --> FULL_COMMUNICATION: CanSM_SetPduMode(ONLINE)\n恢复发送
    SILENT_COMMUNICATION --> NO_COMMUNICATION: CanSM_RequestComMode(NONE)\n或总线超时
    FULL_COMMUNICATION --> NO_COMMUNICATION: CanSM_RequestComMode(NONE)\n或强制休眠

    state NO_COMMUNICATION {
        [*] --> CanTrcv_STANDBY: 收发器待机
        CanTrcv_STANDBY --> CanIf_STOPPED: 控制器关闭
    }

    state FULL_COMMUNICATION {
        [*] --> CanTrcv_NORMAL: 收发器激活
        CanTrcv_NORMAL --> CanIf_STARTED: 控制器启动
    }

    state SILENT_COMMUNICATION {
        [*] --> CanTrcv_NORMAL: 收发器激活
        CanTrcv_NORMAL --> CanIf_TX_OFFLINE: 控制器仅接收
    }

    note left of NO_COMMUNICATION: 低功耗模式\n仅支持硬件唤醒
    note right of FULL_COMMUNICATION: 全双工通信\n周期性发送NM报文
    note left of SILENT_COMMUNICATION: 静默监听\n用于诊断或监控
```



# CanNm

首先介绍 AUTOSAR CanNm 协调算法的三种操作模式：

1. 网络模式(`Network Mode `,NM)
2. 准备总线睡眠模式(`Prepare Bus-Sleep Mode `,PBSM)
3. 总线睡眠模式(`Bus-Sleep Mode`,BSM)

当本节点的操作模式发生变化的时候，需要通知上层 Nm。

## 网络模式

**网络模式（Network Mode）** 包含三种内部状态：

1. 重复报文状态（Repeat Message State, RMS）
2. 正常操作状态（Normal Operation State, NOS）
3. 准备睡眠状态（Ready Sleep State, RSS)

这些状态的转换由网络管理报文（NM PDU）的收发、定时器超时以及应用层请求触发，具体转换逻辑如下：

---

重复报文状态（RMS）

- 触发进入条件：

  1. 主动唤醒：ECU因本地唤醒（如点火信号）或主动请求通信时，进入RMS并启动`T_Repeat_Message`定时器，快速发送NM报文以唤醒其他节点
  2. 被动唤醒：ECU被总线上的NM报文唤醒后，需短暂进入RMS发送几帧NM报文，通知其他节点自身已唤醒。

- 退出条件：

  - T_Repeat_Message超时后：

    - 若存在**主动请求**（如应用层调用`CanNm_NetworkRequest`），则跳转到**NOS**。

    - 若无请求，则跳转到RSS

  - 强制跳转：若收到NM报文的控制位向量（CBV）中`Repeat Message Request Bit`（Bit 0）置1，则重新进入RMS。

---

正常操作状态（NOS）

- 触发进入条件：
  1. 从RMS跳转：`T_Repeat_Message`超时且存在主动请求。
  2. 从RSS跳转：ECU在RSS状态下收到主动请求（如重新需要通信）。
- 行为：
  - 周期性发送NM报文（周期为`CanNmMsgCycleTime`），保持网络活跃。
  - 重置`T_NM_Timeout`定时器以监听总线活动。
- 退出条件：
  - **释放网络**：应用层调用`CanNm_NetworkRelease`时，跳转到**RSS**。
  - 收到重复请求：若NM报文的`Repeat Message Request Bit`置1，则强制返回RMS。

---

准备睡眠状态（RSS）

- 触发进入条件：
  1. 从RMS跳转：`T_Repeat_Message`超时且无主动请求。
  2. 从NOS跳转：应用层释放网络（`CanNm_NetworkRelease`）。
- 行为：
  - 停止发送NM报文，但继续接收NM报文和应用报文。
  - 启动`T_NM_Timeout`定时器，若超时且未收到NM报文，则跳转到预睡眠模式（PBSM）。
- 退出条件：
  - **重新请求通信**：调用`CanNm_NetworkRequest`跳转到**NOS**。
  - 收到重复请求：NM报文的`Repeat Message Request Bit`置1时，返回RMS。

---

状态转换图与关键参数

1. 定时器作用：
   - `T_Repeat_Message`：控制RMS状态的持续时间（通常较短，如100ms）。
   - `T_NM_Timeout`：检测总线是否空闲（超时后触发休眠流程）。
2. 控制位向量（CBV）：
   - Bit 0（重复请求位）和Bit 4（主动唤醒位）直接影响状态跳转。
3. 应用层接口：
   - `CanNm_NetworkRequest`和`CanNm_NetworkRelease`是触发NOS与RSS切换的核心API。

```mermaid
stateDiagram-v2
    [*] --> BSM: 初始休眠
    BSM --> RMS: 唤醒事件
    RMS --> NOS: 有通信需求
    RMS --> RSS: 无需求
    NOS --> RSS: 释放网络
    RSS --> NOS: 重新请求
    RSS --> BSM: 超时无活动
    NOS --> RMS: 收到重复请求
```

---

示例场景

- 车辆启动时：
  1. ECU被点火信号（本地唤醒）触发，进入**RMS**，快速发送NM报文唤醒其他节点。
  2. `T_Repeat_Message`超时后，因有通信需求，跳转到**NOS**，维持周期性通信。
- 车辆熄火后：
  1. 应用层释放网络，ECU从**NOS**跳转到**RSS**，停止发送NM报文。
  2. `T_NM_Timeout`超时后，进入PBSM，最终休眠。

## 准备总线睡眠模式

在AUTOSAR CAN网络管理中，**准备总线睡眠模式（Prepare Bus-Sleep Mode, PBSM）**是网络从活跃状态（Network Mode）过渡到完全休眠状态（Bus-Sleep Mode）的中间状态，其核心作用是协调节点间的同步休眠，避免因通信中断导致的数据丢失或系统冲突。

---

 功能定义：

- 目的：确保所有节点在进入低功耗的Bus-Sleep Mode前完成必要的清理操作（如停止应用报文发送、保存临时数据），并同步确认无其他节点需要通信。
- 触发条件：
  - 节点从`Network Mode`的**Ready Sleep State (RSS)**退出后，若`T_NM_Timeout`定时器超时且未收到任何网络管理报文（NM PDU），则进入PBSM。
  - 部分配置下，需满足`CanNmWaitBusSleepTime`参数定义的额外等待时间。

---

行为特性:

- 通信限制：
  - 禁止发送NM报文：节点停止发送网络管理报文，仅监听总线上的NM PDU。
  - 允许完成未发送的应用报文：已缓存的APP报文可继续发送，但新生成的APP报文会被阻塞。
- 定时器机制：
  - 启动`T_WaitBusSleep`定时器（可配置），若超时前未收到其他节点的NM PDU，则跳转到Bus-Sleep Mode；若收到NM PDU，则返回Network Mode的Repeat Message State (RMS)。

---

状态转换逻辑

1. 进入PBSM：
   - 从`Ready Sleep State`超时触发，或由网关节点通过协调算法强制触发（如同步关闭部分网络集群PNC）。
2. 退出PBSM：
   - 成功休眠：`T_WaitBusSleep`超时后，节点关闭收发器，进入Bus-Sleep Mode。
   - 重新唤醒：若在PBSM期间检测到NM PDU或本地唤醒请求（如KL15信号），则立即返回Network Mode。

---

应用场景示例

- 整车熄火流程：
  1. ECU应用层释放通信权限，进入Ready Sleep State。
  2. 总线无活动超时后，ECU转入PBSM，停止NM报文发送。
  3. 若所有节点均进入PBSM且无通信需求，最终同步休眠。
- 异常恢复：若某个节点在PBSM阶段因故障持续发送NM PDU，其他节点会检测到该报文并维持Network Mode，避免误休眠。

---

与相关模式的对比

| **模式**              | 通信行为                     | 功耗水平       | 典型触发条件                   |
| --------------------- | ---------------------------- | -------------- | ------------------------------ |
| **Network Mode**      | NM和APP报文正常收发          | 高             | 唤醒事件或通信请求             |
| **Prepare Bus-Sleep** | 仅接收NM报文，停止发送       | 中（过渡状态） | `T_NM_Timeout`超时             |
| **Bus-Sleep Mode**    | 完全停止通信，仅支持硬件唤醒 | 极低           | `T_WaitBusSleep`超时或协调完成 |

## 总线睡眠模式

在AUTOSAR CAN网络管理中，**总线睡眠模式（Bus-Sleep Mode, BSM）** 是网络节点在无通信需求时进入的低功耗状态，其核心目的是通过关闭通信功能降低静态电流消耗，同时保留唤醒能力以响应后续请求。

---

 功能定义

- 核心作用：当所有节点无通信需求时，协调全网同步进入低功耗状态，典型静态电流可降至毫安级（如大众车型中舒适CAN总线休眠后整车电流仅6mA）。
- 触发条件：
  - 节点从准备总线睡眠模式（Prepare Bus-Sleep Mode, PBSM）过渡而来，且`T_WaitBusSleep`定时器超时后确认无NM报文活动。
  - 部分配置需满足`CanNmWaitBusSleepTime`参数定义的额外等待时间。

---

行为特性

- 通信限制：
  - 完全停止NM报文和应用报文（APP报文）的收发，仅支持硬件唤醒（如总线显性电平或本地唤醒信号）。
  - 收发器切换至低功耗模式（如TJA1145的Sleep模式，INH引脚悬空以关闭外部电源）。
- 唤醒机制：
  - 远程唤醒：通过总线上的NM报文触发（如特定ID的唤醒帧）。
  - 本地唤醒：KL15信号、硬线电平或传感器事件（如车门解锁）。

---

状态转换逻辑

1. 进入流程：
   - 节点从Network Mode经Ready Sleep State (RSS)进入Prepare Bus-Sleep Mode，超时后最终跳转至BSM。
   - 网关节点可能通过同步关闭部分网络集群（PNC）协调全网休眠。
2. 退出流程：
   - 唤醒事件触发后，节点直接进入Repeat Message State (RMS)，快速同步网络状态。

---

 应用场景与优化

- 整车场景：

  - 车辆熄火后，舒适CAN总线通常在15分钟内进入BSM，2小时后进一步降低至控制单元深度休眠（如关闭MCU供电）。
  - 若休眠失败（如OBD设备持续通信），可能导致蓄电池亏电。

- 功耗对比：

  | **模式**           | 典型电流消耗 | 通信能力       |
  | ------------------ | ------------ | -------------- |
  | **Network Mode**   | 800mA+       | 全双工通信     |
  | **Bus-Sleep Mode** | <10mA        | 仅支持唤醒检测 |

---

 与其他模块的协同

- 与收发器联动：
  - BSM下，收发器（如TJA1145）进入Sleep模式，仅VBAT引脚维持微安级供电。
- 与电源管理：
  - INH引脚拉低后关闭外部稳压器，MCU完全断电（KL30节点）。

## PDU格式

网络管理的报文有特定的格式要求，报文数据段格式如图：



| 字节序列 | 数据描述               |
| -------- | ---------------------- |
| Byte 7   | User data 5            |
| Byte 6   | User data 4            |
| Byte 5   | User data 3            |
| Byte 4   | User data 2            |
| Byte 3   | User data 1            |
| Byte 2   | User data 0            |
| Byte 1   | Control Bit Vector     |
| Byte 0   | Source Node Identifier |

其中 CBV（ControlBitVector）字节对应的 bit 位标识如下：



| Bit7 | Bit6    | Bit5 | Bit4              | Bit3                       | Bit 2                                 | Bit1                                 | Bit0                   |
| ---- | ------- | ---- | ----------------- | -------------------------- | ------------------------------------- | ------------------------------------ | ---------------------- |
| Res  | PNI Bit | Res  | Active Wakeup Bit | NM Coordinator Sleep Ready | Res R3.2 NM Coordinator ID (High Bit) | Res R3.2 NM Coordinator ID (Low Bit) | Repeat Message Request |

对于 CBV 中的 bit 说明如下：

1. Bit 0 ：重复消息请求
   - 0：未请求进入 Repeat Message State
   - 1：请求进入 Repeat Message State
2. Bit 1,2：保留位，当配置项 CanNmCoordinatorEnabled 使能时，该位等于配置的 CanNmCoordinatorId 的值
3. Bit 3 NM 协调器休眠位
   - 0：主协调器不要求启动同步休眠
   - 1：主协调员请求启动同步休眠
4. Bit 4 主动唤醒位
   - 0：节点尚未唤醒网络
   - 1：节点唤醒了网络
5. Bit 6： 局部网络信息位（PNI）
   - 0：NM 消息不包含局部网络请求信息
   - 1：NM 消息包含局部网络请求信息,该位由配置决定，运行阶段不改变
6. Bit5 Bit7 为保留位

NmPdu 中的 UserData 可以通过 CanNm 的配置引用 EcuC 中的 Pdu。未使用的情况下默认全 0xFF，通过 Nm 的接口去抓取当前接收与发送的 UserData。



# NMIf



在AUTOSAR架构中，**通用网络管理接口（NmIf，Network Management Interface）** 是协调通信管理器（ComM）与总线相关网络管理模块（如CanNM、LinNM）的核心适配层。

---

 核心功能

1. 协议适配
   - 作为ComM与具体总线网络管理模块（如CAN NM）之间的桥梁，将ComM的通用通信请求（如唤醒/休眠）转换为特定总线的协议指令。
   - 例如，当ComM请求CAN总线唤醒时，NmIf调用CanNM的接口实现硬件初始化。
2. 多网络同步协调
   - 在ECU连接多个总线（如CAN和FlexRay）时，NmIf确保不同总线的网络状态同步。例如，协调所有总线同时进入睡眠模式，避免部分总线活跃导致功耗浪费。
3. 状态反馈
   - 向ComM反馈总线的实际状态（如当前是否处于网络模式），解决因硬件延迟导致的通信模式不一致问题。

---

关键应用场景

- 整车休眠管理：当车辆熄火时，NmIf接收ComM的休眠指令，协调CAN和LIN总线同步进入睡眠模式，并通过`CanSM/LinSM`关闭物理层通信。
- 唤醒事件处理:本地唤醒（如车门解锁）或远程唤醒（如OBD诊断）时，NmIf触发对应总线的唤醒流程，并通知ComM更新通信权限。

---

与相关模块的交互

- 输入：ComM的通信请求（如`ComM_RequestCommunication`）。
- 输出：调用CanNM/LinNM的接口（如`CanNm_NetworkRequest`）或通知ComM当前状态（通过回调函数）。
- 底层依赖：依赖总线状态管理器（如CanSM）控制硬件状态。

# Busoff

## 概述

> **什么是Can Bus Off**
>
>  车上有一个ECU 1, 一直向总线发送消息，可怎么都发送不出去。
>
> 如果这个累计到一定的次数（255），按照CAN总线协议： ECU 1自己进入 BUSOFF模式，这个时候ECU 1 一时半会是不能发送信息了。
>
> 



> **BusOff 后如何处理**
>
> ECU 1在自己内部检测到BUS OFF后，默默的从逻辑上退出了总线，暂时他没妨碍大家，ECU 1他自己也搞不明白啥回事，于是ECU 1拿着小本子，记下了 x年x月x日x时x分x秒, 汽车电压，里程，xxx 是多少多少，我bus off 了。
>
> 写完备案后，ECU 1 开始数时间，等待 5 秒后，重启自己的CAN模块



> **BusOff时计数的变化规律**
>
> bus off是个非常集体的概念：
>
> - ECU自己发送失败，TX error count + 8，
> -  ECU自己发送成功，TX error count - 1，
>
>  这个TX error count 超过255，ECU就必须进入Bus Off 状态，并需要逻辑上断开总线



> **Can Frame的一些常见错误**
>
> 1. 发送ECU检查
>    - 有无ACK
>    - CRC检查，CRC Delimiter, ACK Delimiter，EOF等
>    -  BIT监控， 送的那个ECU，自己校对每个BIT，看有没有都送对（ID区域，和ACK区域除外）
> 2. 接收ECU检查
>    - CRC检查，CRC Delimiter, ACK Delimiter，EOF等
>    - 检查有无连续6比特是全0、或全1的



## 故障界定

为了避免某个设备因为自身原因（例如硬件损坏）导致无法正确收发报文而不断的破坏总线的数据帧，从而影响其它正常节点通信，CAN网络具有严格的错误诊断功能，CAN通用规范中规定每个CAN控制器中有一个发送错误计数器和一个接收错误计数器。根据计数值不同，节点会处于不同的错误状态，并根据计数值的变化进行状态转换，状态转换如下图所示。

![故障界定状态转化图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/9_8_36_8_202505090836596.png)

以上三种错误状态表示发生故障的严重程度，总线关闭是节点最严重的错误状态。并且，节点在不同的状态下具有不同的特性，在总线关闭状态下，节点不能发送报文或应答总线上的报文，也就意味着不能再对总线有任何影响。

状态跳转和错误计数的规则使得节点在发生通信故障时有了较好的自我错误处理和恢复机制，从一种较严重的错误状态跳转到另一种严重性相对较低的状态，本质上就是一种恢复过程。上图所呈现的转换过程是CAN通用规范所要求的，我们从设备供应商买回来的CAN控制器已经把这些功能固化在硅片之中。

在通信过程中，错误主动和错误被动两种状态下节点的恢复过程一般不需要MCU进行额外的编程处理，直接使用CAN控制器固有功能即可。但对于总线关闭状态，往往不直接使用CAN控制器固有的恢复过程，而是对其进行编程控制，以实现“快恢复”和“慢恢复”机制。

## 快恢复和慢恢复



当节点进入总线关闭状态后，如果MCU仅是开启自动恢复功能，CAN控制器在检测到128次11个连续的隐性位后即可恢复通信，在实际的CAN通信总线中，这一条件是很容易达到的。以125K的波特率为例，12811（1/125000）= 0.011264s。这意味着如果节点所在的CAN总线的帧间隔时间大于0.011264s，节点在总线空闲时间内便可轻易恢复通信。我们已经知道，当进入总线关闭状态时，节点已经发生了严重的错误，处于不可信状态，如果迅速恢复参与总线通信，具有较高的风险，因此，在实际的应用中，往往会通过MCU对CAN控制器总线关闭状态的恢复过程进行编程处理，以控制节点从总线关闭状态恢复到错误主动状态的等待时间，达到既提高灵活性又保证节点在功能上的快速响应性的目的。具体包括“快恢复”和“慢恢复”策略，两种策略一般同时应用。

通过以上的讨论，我们可以知道，节点进入总线关闭状态后，存在以下几种恢复情况：

1. MCU仅开启CAN控制器的自动恢复功能，节点只需检测到128次11个连续的隐性位便可以恢复通信，恢复过程如[上节图](##故障界定)所示。

2. MCU没有开启CAN控制器的自动恢复功能，也不主动干预总线关闭错误，节点将一直无法“自动”恢复总线通信，只能通过重新上电的方式使节点恢复, 恢复过程如下图所示。

   ![重新上电恢复总线](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/9_8_46_17_202505090846016.png)

3. MCU对CAN控制器的恢复过程进行编程处理，这时，节点的恢复行为由具体的编程逻辑决定，各厂家普遍采用了先“快恢复”后“慢恢复”的恢复策略，恢复过程如下图所示。

   ![快慢恢复](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/13_8_14_35_202505130814506.png)

MCU编程实现总线关闭“快恢复”和“慢恢复”的一般过程可用以下流程图描述：

![快慢恢复流程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/13_8_17_28_202505130817900.png)

节点以正常发送模式发送报文的过程中，如果出现了发送错误，发送错误计数会增加，只要发送错误计数没有超过255， CAN控制器便会自动重发报文，如果出现多次发送错误，使发送错误计数累加超过255，则节点跳转为总线关闭状态。MCU能够第一时间知道节点进入了总线关闭状态（例如在错误中断处理逻辑中查询状态寄存器的相应位），这时MCU控制CAN控制器进入“快恢复”过程，即控制CAN控制器停止报文收发，并进行等待，计时达到需要的时间T1（如100ms）后，MCU重新启动恢复CAN控制器参与总线通信，这样便完成了一次“快恢复”过程。

节点每进入一次“快恢复”过程时，MCU会对此进行计数，当节点“快恢复”计数达到设定的值N（如5次），则后续再次进入总线关闭状态时MCU把恢复总线通信的等待时间T2进行延长（如1000ms），这样便实现了“慢恢复”过程。“快恢复”和“慢恢复”过程的主要区别就在于恢复节点参与总线通信的等待时间的不同。

通过MCU对于总线关闭后的恢复行为进行编程控制，实际上是对CAN控制器的错误管理和恢复机制进行了补充，使得总线关闭状态后的恢复过程更加灵活，更能适应实际应用的需要。对于 “快恢复”和“慢恢复”的等待时间，以及“快恢复”计数多少次后进入“慢恢复”过程，不同厂家可根据具体的需求进行编程实现。

> [!note]
>
> 当我们进行干扰的时候，不用Rx口就可以知道数据帧发送是否正确，以下使用Ack干扰来举例：
>
> CAN总线采用"线与"逻辑，发送节点在ACK槽（ACK Slot）发送隐性位（逻辑1），而正确接收的节点会覆盖为显性位（逻辑0）。发送节点通过**实时回读总线电平**与自身发送的电平对比：
>
> - 成功应答：若回读到显性位（0），说明至少有一个节点正确接收。
> - 应答错误：若回读到隐性位（1），说明无节点应答，触发ACK错误。
>
> 此过程由CAN控制器硬件自动完成，无需软件干预。发送节点在TX发送的同时通过内部回环检测总线实际状态，而非依赖RX口 。
>
> 问题：不走Rx是怎么知道发出去的报文是正确的‼‼‼‼‼‼‼‼
>
> 

# 模块层级







```mermaid
%% 模块层级与接口交互图
graph TD
    subgraph 通信管理层
        ComM(("ComM\n(通信管理器)"))
    end

    subgraph 网络管理层
        NmIf(("NmIf\n(通用网络管理接口)"))
        CanNM(("CanNM\n(CAN网络管理)"))
    end

    subgraph 状态与硬件抽象层
        CanSM(("CanSM\n(CAN状态管理器)"))
        CanIf(("CanIf\n(CAN接口层)"))
        CanTrcv(("CanTrcv\n(收发器驱动)"))
    end

    %% 模块间接口连线
    ComM -- "Nm_NetworkRequest()\nNm_NetworkRelease()" --> NmIf
    NmIf -- "CanNm_NetworkRequest()\nCanNm_PassiveStartUp()" --> CanNM
    CanNM -- "CanIf_Transmit()\nCanIf_RxIndication()" --> CanIf
    CanSM -- "CanIf_SetControllerMode()\nCanIf_SetTrcvMode()" --> CanIf
    CanIf -- "Trcv_SetMode()\nTrcv_GetStatus()" --> CanTrcv
    CanSM -- "CanSM_RequestComMode()\nCanSM_CurrentComMode()" --> ComM
    CanNM -- "NmIf_CarWakeUpIndication()" --> NmIf
```















































































