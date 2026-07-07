---
title: E2E
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

> [!tip]
>
> 官方标准手册请参见https://www.autosar.org/fileadmin/standards/R25-11/FO/AUTOSAR_FO_PRS_E2EProtocol.pdf

> E2E（End-to-End）通信保护旨在运行时保护**安全相关数据**在通信链路上传输时免受故障影响。它在发送端为数据添加控制信息，在接收端进行验证，从而检测并处理通信过程中可能发生的各种故障。

![通信过程](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260629102038075.png)



1. 背景与动机

   安全相关的数据交换需要在运行时针对通信链路故障进行保护。E2E 保护可以检测到的故障包括：

   | 故障类型           | 来源                         | 示例                              |
   | ------------------ | ---------------------------- | --------------------------------- |
   | **系统性软件故障** | 发送方或接收方的低层通信软件 | RTE、IOC、COM、网络协议栈中的错误 |
   | **随机硬件故障**   | MCU 硬件、通信外设、收发器   | CAN 收发器寄存器损坏              |
   | **干扰**           | 外部环境                     | EMC 电磁干扰                      |
   | **基础设施故障**   | 通信线路                     | 线束损坏、连接器故障              |

   ```mermaid
   flowchart TD
       subgraph Sender[发送端]
           App_S[应用层数据]
           E2E_S[E2E 保护添加控制数据]
           Low_S[低层通信栈]
       end
       
       subgraph CommLink[通信链路]
           Faults[故障]
           HW[随机硬件故障]
           EMI[电磁干扰]
           SW[软件故障]
       end
       
       subgraph Receiver[接收端]
           Low_R[低层通信栈]
           E2E_R[E2E 验证]
           App_R[应用层接收数据]
           Result[检查结果 + 错误处理]
       end
       
       App_S --> E2E_S --> Low_S
       Low_S -->|传输| CommLink
       CommLink -->|受故障影响| Low_R
       Low_R --> E2E_R
       E2E_R -->|有效| App_R
       E2E_R --> Result
   ```

   

2. E2E 保护的三大功能

   1. **保护待发送数据**：在发送端为安全相关数据添加控制数据（CRC、计数器等）
   2. **验证接收数据**：在接收端使用控制数据验证接收到的数据
   3. **提供检查结果**：将验证结果传递给接收方，由接收方进行适当处理

   ```mermaid
   flowchart LR
       subgraph Sender[发送端]
           Data[安全数据] --> Protect[添加控制数据]
           Protect --> Send[发送受保护数据]
       end
       
       subgraph Receiver[接收端]
           Recv[接收数据] --> Check[验证控制数据]
           Check --> Result{检查结果}
           Result -->|有效| Process[处理安全数据]
           Result -->|无效| Error[错误处理]
       end
       
       Send -->|通信链路| Recv
   ```

3. E2E Profile

   AUTOSAR 指定了一组灵活的 E2E Profile，每个 Profile 实现了 E2E 保护机制的组合。

   | Profile        | 特点                   | 典型用途             |
   | -------------- | ---------------------- | -------------------- |
   | **Profile 1**  | 基础保护，CRC + 计数器 | 简单安全通信         |
   | **Profile 4**  | 扩展保护，含 Data ID   | AUTOSAR 经典平台常用 |
   | **Profile 5**  | 轻量级保护             | 资源受限系统         |
   | **Profile 7**  | 多帧保护               | 大消息通信           |
   | **Profile 11** | 基于 CRC-64            | 高可靠性需求         |
   | **Profile 22** | DoIP 专用              | 基于 IP 的诊断通信   |

   ```mermaid
   flowchart LR
       subgraph E2EProfiles [E2E Profiles]
           P1[Profile 1]
           P4[Profile 4]
           P5[Profile 5]
           P7[Profile 7]
           P11[Profile 11]
           P22[Profile 22]
       end
       
       subgraph Mechanisms [保护机制组合]
           CRC[CRC 校验]
           Counter[计数器]
           DataID[Data ID]
           Length[长度检查]
           Timeout[超时检测]
       end
       
       P1 --> Mechanisms
       P4 --> Mechanisms
       P5 --> Mechanisms
       P7 --> Mechanisms
       P11 --> Mechanisms
       P22 --> Mechanisms
   ```

   **每个 Profile 的特点**：

   - **固定的保护机制组合**：哪些机制被使用是固定的
   - **可配置的选项**：协议头布局、接收端状态评估方式可配置

4. E2E Supervision 的调用方式

   E2E Supervision 可以从多种上下文中调用：

   | 调用方式              | 说明                                                        |
   | --------------------- | ----------------------------------------------------------- |
   | **Adaptive Platform** | 通过 `ara::com` 通信中间件                                  |
   | **Classic Platform**  | 通过 RTE（运行时环境）                                      |
   | **非标准化方式**      | 从其他软件调用，如 NVM 管理器、本地 IPC、ECU 内部总线协议栈 |

   ```mermaid
   flowchart TD
       subgraph Callers [调用者]
           RTE_CP[Classic RTE]
           ARA_COM[Adaptive ara::com]
           Other[其他软件<br/>NVM/IPC/内部总线]
       end
       
       subgraph E2E [E2E Supervision]
           Protect[保护 API]
           Check[验证 API]
           CRC[CRC 计算]
       end
       
       RTE_CP --> Protect
       RTE_CP --> Check
       ARA_COM --> Protect
       ARA_COM --> Check
       Other --> Protect
       Other --> Check
   ```

5. 正确使用 E2E 的职责

   E2E Supervision 的调用者负责：

   - **正确使用** E2E Supervision
   - **提供正确的参数**给 E2E Supervision 例程

   > 调用者是使用 E2E 的**责任方**，必须确保参数配置正确以实现预期的保护效果。

6. Profile 选择的考量因素

   选择特定的 E2E Profile 需要证明其提供足够的错误检测能力：

   | 考量因素         | 说明                 |
   | ---------------- | -------------------- |
   | **硬件故障率**   | MCU、收发器的失效率  |
   | **比特错误率**   | 通信链路的 BER       |
   | **网络节点数**   | 总线上的节点数量     |
   | **消息重复率**   | 消息的发送频率       |
   | **网关使用**     | 是否经过网关转发     |
   | **潜在软件故障** | 通信通道上的软件错误 |

   ```mermaid
   flowchart TD
       ProfileSelection[Profile 选择] --> Consider[考量因素]
       
       Consider --> HW[硬件故障率]
       Consider --> BER[比特错误率]
       Consider --> Nodes[网络节点数]
       Consider --> Freq[消息重复率]
       Consider --> Gateway[网关使用]
       Consider --> SW[潜在软件故障]
       
       Consider --> Validate[验证：选定的 Profile<br/>提供足够的错误检测能力]
   ```

7. 检测到故障后的反应

   接收方检测到故障后必须进行适当处理：

   | 反应措施         | 说明                     |
   | ---------------- | ------------------------ |
   | **撤销重复消息** | 忽略重复的无效消息       |
   | **检测通信超时** | 识别通信中断             |
   | **启动安全反应** | 针对损坏消息触发安全机制 |

8. CRC 计算例程

   1. 支持的 CRC 类型

      | CRC 类型    | 说明                    |
      | ----------- | ----------------------- |
      | **CRC8**    | SAE J1850               |
      | **CRC8H2F** | CRC8 0x2F 多项式        |
      | **CRC16**   |                         |
      | **CRC32**   |                         |
      | **CRC32P4** | CRC32 0xF4ACFB13 多项式 |
      | **CRC64**   | CRC-64-ECMA             |

   2. 计算方法

      | 方法             | 优点                    | 缺点                    |
      | ---------------- | ----------------------- | ----------------------- |
      | **查表计算**     | 执行速度快              | 代码体积大（需 ROM 表） |
      | **运行时计算**   | 代码体积小（无 ROM 表） | 执行速度慢              |
      | **硬件支持计算** | 执行速度快、CPU 占用少  | 设备相关                |

      **关键特性**：

      - 所有例程都是**可重入的**
      - 可供多个应用**同时使用**
      - 未来可能支持更多设备的硬件加速 CRC 计算

9. E2E 保护适用的安全等级

   E2E Supervision 提供的保护机制适用于**最高 ASIL D** 的安全相关通信需求。

10. E2E 保护在 AUTOSAR 架构中的位置

    ```mermaid
    flowchart TD
        subgraph Application[应用层]
            SWC[软件组件]
        end
        
        subgraph RTE[RTE]
            E2E_Protect[E2E Protect]
            E2E_Check[E2E Check]
        end
        
        subgraph COM[COM 层]
            Signal[信号/PDU]
        end
        
        SWC -->|发送数据| E2E_Protect
        E2E_Protect -->|受保护数据| Signal
        Signal -->|接收数据| E2E_Check
        E2E_Check -->|验证后数据| SWC
    ```

11. 典型配置参数

    | 参数      | 说明                       |
    | --------- | -------------------------- |
    | `DataID`  | 数据标识符，用于 CRC 计算  |
    | `Counter` | 消息计数器，检测丢失/重复  |
    | `CRC`     | 循环冗余校验，检测数据损坏 |
    | `Timeout` | 通信超时阈值               |
    | `Profile` | 选用的 E2E Profile         |



# E2E Profile



1. 核心理念：标准化 + 灵活性

   E2E 保护的灵活性是通过 **E2E Profile（配置文件）** 来实现的。每个 Profile 实际上是一个“套餐”，它定义了：

   - **组合了哪些保护机制**（比如 CRC 校验 + 计数器 + 数据ID）
   - **消息格式**（控制字段放在哪里，多长）
   - **一组配置参数**（比如 CRC 的初始值、多项式、计数器位宽等）

2. 什么是 E2E Variant（变体）？

   有些 Profile（比如 Profile 1）会定义**标准变体（Variants）** ，比如 `1A`。

   - 变体本质上就是 **一套预设好的配置参数组合**。
   - 举个例子：Profile 1 允许你灵活配置 CRC 和 Counter 的起始位，但 **Variant 1A 规定死了：CRC 必须从 Bit 0 开始，Counter 必须从 Bit 8 开始**。用变体就不用自己调参数了，直接用标准定义。

3. 发送端和接收端各干什么？

   | 角色                   | 动作                                                         |
   | ---------------------- | ------------------------------------------------------------ |
   | **发送端（Sender）**   | 在要发送的**有效数据（Data）** 后面或指定位置，**添加控制字段（Control Fields）** ，比如 **CRC 校验值**和 **Counter 计数器**，组成完整的 E2E Header。 |
   | **接收端（Receiver）** | 从收到的数据中**提取出控制字段**，然后**自行计算 CRC**（基于收到的数据载荷），再把计算出来的 CRC 值与收到的 CRC 值做**比对（比较）**，同时检查 Counter 是否符合预期（比如是否按顺序递增），以此判断通信是否出错。 |

   ![安全控制概念](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260629104922722.png)

4. 每个 Profile 的特性

   每个 Profile 都有：

   - **特定的控制字段集合**（比如有的有 Counter，有的没有；有的 DataID 是显式带在报文里的，有的是隐式配置的）
   - **特定的功能行为**（比如 CRC 覆盖范围不同、Counter 的回卷处理不同）
   - **特定的故障检测能力**（能检测出哪些通信故障：数据损坏、丢失、重复、插入、错序、延迟等）

> [!note]
>
> 1. **选 Profile 就是选“保护套餐”**：你得根据安全等级（ASIL）和通信类型（信号/事件/C/S）来选合适的 Profile（比如 Profile 1/2/4/5/6/7/11/22 等）。
> 2. **变体是“傻瓜式配置”**：如果你不熟悉参数细节，直接用变体（如 1A、1B、1C）可以省去调参的麻烦，也符合标准。
> 3. **Header 布局不是乱定的**：不管是自己配置还是用变体，发送端和接收端的 **CRC 位置、Counter 位置、DataID 位置必须完全一致**，否则接收端会一直报 CRC 错误。

## E2E Profile概述

> E2E Profiles 提供了一套**一致的数据保护机制**，旨在抵御故障模型中考虑的各类故障。每个 Profile 通过不同的算法组合提供替代的保护方案，但所有 Profile 具有**相似的接口和行为**。

1. E2E Profile 的核心特点

   | 特点               | 说明                                    |
   | ------------------ | --------------------------------------- |
   | **一致的机制组合** | 每个 Profile 提供一组固定的数据保护机制 |
   | **替代性**         | 不同 Profile 使用不同算法提供保护       |
   | **统一接口**       | 所有 Profile 具有相似的接口和行为       |
   | **灵活选择**       | 用户根据系统需求选择合适的 Profile      |

2. 数据保护机制清单

   E2E Profile 使用以下保护机制的子集：

   | 编号  | 保护机制                          | 说明                                                         |
   | ----- | --------------------------------- | ------------------------------------------------------------ |
   | **1** | **CRC**                           | 由 CRC Supervision 提供                                      |
   | **2** | **序列计数器 (Sequence Counter)** | 每次发送请求时递增，接收端检查递增是否正确                   |
   | **3** | **活跃计数器 (Alive Counter)**    | 每次发送请求时递增，接收端仅检查是否变化，不检查递增是否正确 |
   | **4** | **端口特定 ID (Data ID)**         | 每个端口数据元素或消息组的特定 ID（全局系统唯一）            |
   | **5** | **源特定 ID (Source ID)**         | 每个数据元素或消息组的源特定 ID                              |
   | **6** | **消息类型 (Message Type)**       | 用于方法的请求/响应区分                                      |
   | **7** | **消息结果 (Message Result)**     | 用于方法的正常/错误响应区分                                  |
   | **8** | **超时检测**                      | (a) 接收端通信超时<br/>(b) 发送端确认超时                    |

   ```mermaid
   flowchart LR
       subgraph Mechanisms [E2E 保护机制]
           direction TB
           CRC[CRC 校验<br/>CRC Supervision]
           SeqCounter[序列计数器<br/>正确递增检查]
           AliveCounter[活跃计数器<br/>变化检查]
           DataID[端口特定 ID<br/>Data ID]
           SourceID[源特定 ID<br/>Source ID]
           MsgType[消息类型<br/>请求/响应]
           MsgResult[消息结果<br/>正常/错误]
           Timeout[超时检测<br/>接收端/发送端]
       end
   ```

3. 序列计数器 vs 活跃计数器

   | 特性           | 序列计数器         | 活跃计数器       |
   | -------------- | ------------------ | ---------------- |
   | **递增方式**   | 每次发送请求递增   | 每次发送请求递增 |
   | **接收端检查** | ✅ 检查递增是否正确 | ❌ 仅检查是否变化 |
   | **可检测故障** | 丢失、重复、乱序   | 数据块丢失       |
   | **典型用途**   | 强保护需求         | 轻量级保护       |

   ```mermaid
   flowchart LR
       subgraph SeqCounter[序列计数器]
           TX_S[发送: 1 → 2 → 3 → 4]
           RX_S[接收检查: +1 递增]
           RX_S --> Valid_S[✅ 正确递增]
           RX_S --> Invalid_S[❌ 跳跃/重复/乱序]
       end
       
       subgraph AliveCounter[活跃计数器]
           TX_A[发送: 1 → 2 → 3 → 4]
           RX_A[接收检查: 值已变化]
           RX_A --> Valid_A[✅ 已变化]
           RX_A --> Invalid_A[❌ 未变化]
       end
   ```

4.  Profile 的适用通信场景

   E2E Profiles 可用于：

   | 通信场景       | 说明                |
   | -------------- | ------------------- |
   | **ECU 间通信** | 不同 ECU 之间的通信 |
   | **ECU 内通信** | 同一 ECU 内的通信   |

   **支持的通信基础设施**：

   | 通信技术 | 支持 |
   | -------- | ---- |
   | CAN      | ✅    |
   | CAN FD   | ✅    |
   | FlexRay  | ✅    |
   | LIN      | ✅    |
   | Ethernet | ✅    |

5. Profile 选择流程

   ```mermaid
   flowchart TD
       System[系统需求] --> Consider[考量因素]
       
       Consider --> Safety[安全等级 ASIL]
       Consider --> Network[通信网络 CAN/FlexRay/Eth]
       Consider --> Data[数据大小/频率]
       Consider --> Resource[资源限制]
       
       Consider --> Select[选择合适的 E2E Profile]
       
       Select --> Profile1[Profile 1]
       Select --> Profile4[Profile 4]
       Select --> Profile5[Profile 5]
       Select --> Profile7[Profile 7]
       Select --> Profile11[Profile 11]
       Select --> Profile22[Profile 22]
   ```

   

6. 保护机制的实现位置

   | 机制       | 实现位置             |
   | ---------- | -------------------- |
   | 序列计数器 | E2E Supervision 内部 |
   | 活跃计数器 | E2E Supervision 内部 |
   | CRC        | CRC Supervision      |
   | Data ID    | E2E Supervision 内部 |
   | 超时检测   | E2E Supervision 内部 |

   **重要说明**：虽然部分机制也可以在 RTE、COM 或通信协议栈中实现，但为了**减少或避免将安全需求分配给这些模块**，E2E Supervision 在内部提供了所有机制（仅 CRC 使用 CRC Supervision）。

7. 典型 E2E Profile 对比

   | Profile        | 计数器     | CRC     | Data ID | 典型用途         |
   | -------------- | ---------- | ------- | ------- | ---------------- |
   | **Profile 1**  | 序列计数器 | CRC8    | 可选    | CAN 消息保护     |
   | **Profile 4**  | 序列计数器 | CRC16   | 必选    | AUTOSAR 标准保护 |
   | **Profile 5**  | 活跃计数器 | CRC8    | 可选    | 轻量级保护       |
   | **Profile 7**  | 序列计数器 | CRC32   | 必选    | 大消息保护       |
   | **Profile 11** | 序列计数器 | CRC64   | 必选    | 高可靠性需求     |
   | **Profile 22** | 序列计数器 | CRC32P4 | 必选    | DoIP 通信        |

## 错误检测

> E2E Supervision 的内部错误检测和报告机制按照本文档中预定义的 E2E Profile 实现。错误处理使用标准化的错误码，涵盖参数校验和功能执行结果。

1. 错误检测机制 [PRS_E2E_00012]

   > 内部 Supervision 机制的**错误检测和报告**应按照本文档中预定义的 E2E Profile 实现。

   ```mermaid
   flowchart TD
       subgraph E2ESupervision [E2E Supervision]
           Protect[保护功能<br/>E2E_PXXProtect]
           Check[验证功能<br/>E2E_PXXCheck]
           CRC[CRC 计算]
       end
       
       subgraph ErrorDetection [错误检测]
           ParamCheck[参数校验]
           CRCVerify[CRC 验证]
           CounterCheck[计数器检查]
           TimeoutCheck[超时检测]
       end
       
       Protect --> ParamCheck
       Protect --> CRCVerify
       Check --> ParamCheck
       Check --> CRCVerify
       Check --> CounterCheck
       Check --> TimeoutCheck
       
       ParamCheck --> Report[错误报告]
       CRCVerify --> Report
       CounterCheck --> Report
       TimeoutCheck --> Report
   ```

2. 错误码定义 [PRS_E2E_00673]

   AUTOSAR E2E 协议应使用 [PRS_E2E_00855] 中定义的错误码。

3. 错误码列表 [PRS_E2E_00855]

   | 错误类型/状态                | 相关错误码             | 说明                  |
   | ---------------------------- | ---------------------- | --------------------- |
   | **至少一个指针参数为空指针** | `E2E_E_INPUTERR_NULL`  | 传入的指针参数为 NULL |
   | **至少一个输入参数错误**     | `E2E_E_INPUTERR_WRONG` | 参数值超出范围或无效  |
   | **函数执行成功**             | `E2E_E_OK`             | 操作完成，无错误      |

   ```mermaid
   flowchart LR
       subgraph ErrorCodes [E2E 错误码]
           NULL[E2E_E_INPUTERR_NULL<br/>空指针]
           WRONG[E2E_E_INPUTERR_WRONG<br/>参数错误]
           OK[E2E_E_OK<br/>执行成功]
       end
       
       subgraph Scenarios [触发场景]
           S1[传入 NULL 指针]
           S2[参数值超出范围]
           S3[操作正常完成]
       end
       
       S1 --> NULL
       S2 --> WRONG
       S3 --> OK
   ```

4. 错误检测流程

   ```mermaid
   flowchart TD
       Entry[E2E API 调用] --> CheckPtr{指针参数<br/>NULL?}
       
       CheckPtr -->|是| ReturnNULL[返回 E2E_E_INPUTERR_NULL]
       CheckPtr -->|否| CheckParam{参数值<br/>有效?}
       
       CheckParam -->|否| ReturnWrong[返回 E2E_E_INPUTERR_WRONG]
       CheckParam -->|是| Execute[执行功能]
       
       Execute --> Result{执行结果}
       
       Result -->|成功| ReturnOK[返回 E2E_E_OK]
       Result -->|失败| ReturnError[返回具体错误码]
   ```

## E2E Profile 公共类型

### Profile Xm 消息公共枚举

> 部分 E2E Profile 使用在不同 Profile 之间**共享的公共数据类型**。这些类型在本文档中单独定义，而非在各个 Profile 章节中重复描述。

1. 设计目的

   | 目的         | 说明                                          |
   | ------------ | --------------------------------------------- |
   | **避免重复** | 公共类型在各 Profile 中复用，无需重复定义     |
   | **保持一致** | 确保所有 Profile 对同一概念使用相同的类型定义 |
   | **便于维护** | 类型定义集中管理，变更影响范围可控            |

   ```mermaid
   flowchart TD
       subgraph CommonTypes[公共类型定义]
           ConfigType[配置结构体类型]
           StatusType[状态结构体类型]
           ReturnType[返回值类型]
       end
       
       subgraph Profiles[各 E2E Profile]
           P1[Profile 1]
           P4[Profile 4]
           P5[Profile 5]
           P7[Profile 7]
           P11[Profile 11]
           P22[Profile 22]
       end
       
       CommonTypes --> P1
       CommonTypes --> P4
       CommonTypes --> P5
       CommonTypes --> P7
       CommonTypes --> P11
       CommonTypes --> P22
   ```

2. 公共类型示例

   根据 E2E 规范的典型结构，公共类型通常包括以下几类：

   ```mermaid
   flowchart LR
       subgraph CommonTypes [公共类型]
           direction TB
           
           subgraph Config [配置类型]
               ProfileConfig[Profile 配置结构体<br/>如 E2E_P01ConfigType]
           end
           
           subgraph Status [状态类型]
               ProfileStatus[Profile 状态结构体<br/>如 E2E_P01StatusType]
           end
           
           subgraph Return [返回类型]
               ReturnType[通用返回值类型<br/>E2E_ReturnType]
           end
           
           subgraph Data [数据类型]
               DataType[受保护数据结构体<br/>如 E2E_P01ProtectDataType]
           end
       end
   ```

3. 配置类型（Config Type）

   用于在初始化和运行时配置 E2E Profile 的行为。

   | 典型字段          | 说明                                 |
   | ----------------- | ------------------------------------ |
   | `DataID`          | 数据标识符                           |
   | `DataIDMode`      | Data ID 包含模式（包含/不包含/交替） |
   | `CounterOffset`   | 计数器在数据中的位偏移               |
   | `CRCOffset`       | CRC 在数据中的位偏移                 |
   | `MinDeltaCounter` | 计数器最小增量值                     |
   | `MaxDeltaCounter` | 计数器最大增量值                     |

   ```c
   <!-- 配置结构体示例（概念性） -->
   typedef struct {
       uint32_t DataID;           /* 数据标识符 */
       uint8_t  CounterOffset;    /* 计数器偏移 */
       uint8_t  CRCOffset;        /* CRC 偏移 */
       uint16_t MinDeltaCounter;  /* 最小增量 */
       uint16_t MaxDeltaCounter;  /* 最大增量 */
       uint8_t  DataIDMode;       /* Data ID 模式 */
   } E2E_PXXConfigType;
   ```

4. 状态类型（Status Type）

   用于存储 E2E 验证的运行状态和结果。

   | 典型字段    | 说明             |
   | ----------- | ---------------- |
   | `Counter`   | 接收到的计数器值 |
   | `Status`    | 检查结果状态     |
   | `ErrorCode` | 最后错误码       |

   ```mermaid
   flowchart LR
       subgraph StatusType [状态类型]
           Counter[计数器值]
           Status[验证状态<br/>有效/无效/重复/丢失]
           LastError[最后错误码]
       end
   ```

5. 返回值类型（Return Type）

   所有 E2E API 函数返回的通用错误码。

   | 返回值                 | 说明       |
   | ---------------------- | ---------- |
   | `E2E_E_OK`             | 操作成功   |
   | `E2E_E_INPUTERR_NULL`  | 空指针参数 |
   | `E2E_E_INPUTERR_WRONG` | 参数错误   |
   | `E2E_E_INTERR`         | 内部错误   |
   | `E2E_E_NOTAVAILABLE`   | 功能不可用 |

6. 受保护数据类型（Protect Data Type）

   用于在发送和接收端传递的受保护数据。

   ```mermaid
   flowchart LR
       subgraph ProtectedData [受保护数据]
           UserData[用户数据<br/>Payload]
           Header[E2E 头部<br/>Counter/Data ID]
           CRC[E2E CRC<br/>校验值]
       end
   ```


### Profile Xm 消息结果枚举

> 在 E2E Profile **Xm** 中，`MessageResult` 参数用于区分响应消息是**正常结果**还是**错误结果**。该枚举值在保护、转发和检查函数中作为参数传入，确保 E2E 能够对正常和错误响应进行区分保护。

1. 消息结果枚举定义 [PRS_E2E_00857]

   | 枚举值                        | 数值 | 描述                                                         |
   | ----------------------------- | ---- | ------------------------------------------------------------ |
   | **`STD_MESSAGERESULT_OK`**    | 0    | 响应消息的结果为**正常结果**（即非错误）。此值也用于**请求消息**，该字段固定为此值 |
   | **`STD_MESSAGERESULT_ERROR`** | 1    | 响应消息的结果为**错误结果**                                 |

2. 使用场景 [PRS_E2E_00743]

   以下函数的 `MessageResult` 参数应设置为上述枚举值之一：

   | 函数                  | 说明               | MessageResult 设置                 |
   | --------------------- | ------------------ | ---------------------------------- |
   | **`E2E_PXXmProtect`** | 发送端保护数据     | 响应：OK 或 ERROR；请求：固定为 OK |
   | **`E2E_PXXmForward`** | 转发时更新保护信息 | 保持原始值                         |
   | **`E2E_PXXmCheck`**   | 接收端验证数据     | 验证时检查该值                     |

   ```mermaid
   sequenceDiagram
       participant Client as 客户端
       participant Server as 服务端
       participant E2E as E2E 保护
   
       Note over Client,Server: 请求（MessageResult 固定为 OK）
       Client->>E2E: E2E_PXXmProtect<br/>MessageResult = OK
       E2E->>Server: 受保护请求
   
       Note over Client,Server: 正常响应
       Server->>E2E: E2E_PXXmProtect<br/>MessageResult = OK
       E2E->>Client: 受保护响应（正常）
   
       Note over Client,Server: 错误响应
       Server->>E2E: E2E_PXXmProtect<br/>MessageResult = ERROR
       E2E->>Client: 受保护响应（错误）
   ```

   

3. 请求消息的特殊规则

   | 消息方向                    | MessageResult 值              | 说明                             |
   | --------------------------- | ----------------------------- | -------------------------------- |
   | **请求（客户端 → 服务端）** | 固定为 `STD_MESSAGERESULT_OK` | 请求消息不区分结果类型，字段固定 |
   | **响应（服务端 → 客户端）** | OK 或 ERROR                   | 根据实际响应结果设置             |

   ```mermaid
   flowchart TD
       subgraph Request[请求消息]
           Req[请求] --> Fixed[MessageResult = OK<br/>固定值]
       end
       
       subgraph Response[响应消息]
           Resp[响应] --> Decision{服务端处理<br/>结果?}
           Decision -->|成功| RespOK[MessageResult = OK]
           Decision -->|失败| RespError[MessageResult = ERROR]
       end
   ```

4. 安全意义

   | 消息结果     | 用途                   | 防止的故障                     |
   | ------------ | ---------------------- | ------------------------------ |
   | **OK**       | 标识正常结果响应       | 确保正常响应未被篡改为错误类型 |
   | **ERROR**    | 标识错误结果响应       | 确保错误响应未被篡改为正常类型 |
   | **请求固定** | 请求消息不携带结果信息 | 简化保护逻辑，减少攻击面       |

   ```mermaid
   flowchart LR
       subgraph Attack[篡改攻击]
           Attacker[攻击者] -->|拦截| Intercept[捕获响应]
           Intercept -->|修改| Modify[将 OK 改为 ERROR]
           Modify --> Client[客户端]
       end
       
       subgraph Protection[保护机制]
           ResponseOK[正常响应<br/>MessageResult=OK]
           ResponseError[错误响应<br/>MessageResult=ERROR]
           
           ResponseOK --> CRC_OK[CRC 计算包含结果值]
           ResponseError --> CRC_Error[CRC 计算包含结果值]
           
           CRC_OK --> VerifyOK[验证时要求匹配]
           CRC_Error --> VerifyError[验证时要求匹配]
       end
       
       Modify -.->|CRC 不匹配| Rejected[❌ 验证失败]
   ```

5. 消息类型 vs 消息结果

   | 维度         | MessageType        | MessageResult                    |
   | ------------ | ------------------ | -------------------------------- |
   | **作用**     | 区分请求/响应方向  | 区分响应中的正常/错误结果        |
   | **适用消息** | 请求 + 响应        | 请求（固定OK）+ 响应（OK/ERROR） |
   | **枚举值**   | REQUEST / RESPONSE | OK / ERROR                       |
   | **安全目的** | 防止消息方向混淆   | 防止结果类型篡改                 |

   ```mermaid
   flowchart LR
       subgraph Request[请求消息]
           RT[MessageType = REQUEST]
           RR[MessageResult = OK<br/>固定值]
       end
       
       subgraph Response[响应消息]
           ResT[MessageType = RESPONSE]
           ResR[MessageResult = OK 或 ERROR]
       end
   ```

6. E2E Profile Xm 完整字段

   | 字段                 | 说明               | 请求       | 响应        |
   | -------------------- | ------------------ | ---------- | ----------- |
   | **Sequence Counter** | 计数器             | ✅ 递增     | ✅ 递增      |
   | **Message Type**     | REQUEST / RESPONSE | REQUEST    | RESPONSE    |
   | **Message Result**   | OK / ERROR         | OK（固定） | OK 或 ERROR |
   | **Data ID**          | 数据标识符         | ✅          | ✅           |
   | **CRC**              | 校验值             | ✅          | ✅           |

## E2E Profile 的通用功能

> 每个 E2E Profile 提供三种核心功能：**Protect**（保护）、**Forward**（转发）和 **Check**（检查）。Protect 用于发送端添加 E2E 头部，Forward 用于信号服务转换时复制 E2E 状态，Check 用于接收端评估头部并检测通信故障。此外，E2E 状态机会对返回的状态进行长期评估。

1. **三种核心功能**

   | 功能        | 说明                                      | 典型场景                                   |
   | ----------- | ----------------------------------------- | ------------------------------------------ |
   | **Protect** | 创建 E2E 头部，保护待发送数据             | 发送端                                     |
   | **Forward** | 类似 Protect，但允许复制接收到的 E2E 状态 | 信号服务转换（Signal-Service-Translation） |
   | **Check**   | 评估接收消息的 E2E 头部，检测通信故障     | 接收端                                     |

2. **Protect 功能**

   - 在发送端执行
   - 根据 Profile 配置生成 E2E 头部
   - 将控制数据（CRC、计数器、Data ID 等）添加到待发送数据中
   - 输出受保护的数据

3. **Forward 功能**

   - 与 Protect 类似，但增加了状态复制能力
   - **主要用例**：信号服务转换（Signal-Service-Translation）
   - 场景示例：接收到一个 E2E 保护的信号，需要将 E2E 状态复制到发送端（如网关转发或协议转换场景）
   - 保证状态信息在转换过程中不丢失

4. **Check 功能**

   - 在接收端执行
   - 评估接收消息的 E2E 头部
   - 检测通信故障：数据损坏、丢失、重复、乱序、超时等
   - 检测到的故障通过返回的 **E2E State** 体现

5. **E2E 状态机**

   - 对单个 Check 返回的 E2E State 进行**长期评估**
   - 综合多次检查结果，输出稳定的状态判断
   - 避免单次偶发错误导致误判

6. **三种功能的关联**

   ```mermaid
   flowchart LR
       subgraph Sender[发送方]
           Data[原始数据] --> Protect[Protect 功能<br/>添加 E2E 头部]
           Protect --> Send[发送]
       end

       subgraph Gateway[网关/转换节点]
           RecvG[接收] --> Forward[Forward 功能<br/>复制 E2E 状态]
           Forward --> SendG[发送]
       end

       subgraph Receiver[接收方]
           Recv[接收] --> Check[Check 功能<br/>检测故障]
           Check --> State[E2E State]
           State --> SM[E2E 状态机<br/>长期评估]
       end

       Send --> RecvG
       SendG --> Recv
   ```

7. **E2E State 典型值**

   | 状态             | 含义                   |
   | ---------------- | ---------------------- |
   | `E2E_OK`         | 数据有效，无故障       |
   | `E2E_E_WRONG`    | 数据错误（CRC 不匹配） |
   | `E2E_E_REPEATED` | 重复消息               |
   | `E2E_E_LOST`     | 消息丢失               |
   | `E2E_E_SEQUENCE` | 消息乱序               |

8. **相关章节**

   | 功能       | 相关章节                            |
   | ---------- | ----------------------------------- |
   | Protect    | 各 Profile 的 Protect 函数描述      |
   | Forward    | 各 Profile 的 Forward 函数描述      |
   | Check      | 各 Profile 的 Check 函数描述        |
   | E2E 状态机 | E2E Protocol Specification 相关章节 |



### Counter 的功能

> 在接收端，E2E Supervision 通过将接收数据的计数器与之前接收数据的计数器进行比较，检测重复、正常（无丢失或少量丢失）以及超量丢失（错误）三种情况。这些检测结果分别对应活跃计数器检查失败（重复）和序列计数器检查失败（超量丢失）。

1. **计数器比较的三种结果**

   | 结果分类               | 检测条件                       | 说明                           | 对应检查失败类型   |
   | ---------------------- | ------------------------------ | ------------------------------ | ------------------ |
   | **重复（Repetition）** | 计数器未变化                   | 无新数据到达，或数据被重复发送 | 活跃计数器检查失败 |
   | **正常（OK）**         | 计数器增量 ≥ 1，且在允许范围内 | 数据连续或少量丢失，仍可接受   | —                  |
   | **错误（Error）**      | 计数器增量超出允许范围         | 数据丢失过多，不可接受         | 序列计数器检查失败 |

2. **重复（Repetition）**

   - 条件：自上次 E2E Supervision 检查函数调用以来，**无新数据到达**
   - 表现：收到的数据是**重复的**
   - 对应：**活跃计数器（Alive Counter）检查失败**
   - 检测目的：识别消息重传攻击或发送端未更新数据

3. **正常（OK）**

   - **情况 a**：计数器增量 = 1
     - 无数据丢失，通信正常
   - **情况 b**：计数器增量 > 1，但 ≤ 允许最大值
     - 有数据丢失，但仍在允许范围内
     - 部分数据丢失可容忍（如非关键数据）

4. **错误（Error）**

   - 条件：计数器增量 > 允许最大值
   - 表现：数据丢失过多
   - 对应：**序列计数器（Sequence Counter）检查失败**
   - 检测目的：识别严重通信故障或攻击

5. **计数器增量与检测结果对应关系**

   | 计数器增量     | 检测结果     | 说明                 |
   | -------------- | ------------ | -------------------- |
   | `0`            | 重复         | 活跃计数器检查失败   |
   | `1`            | OK（无丢失） | 正常递增             |
   | `2 ~ MaxDelta` | OK（有丢失） | 丢失数量在允许范围内 |
   | `> MaxDelta`   | 错误         | 序列计数器检查失败   |

6. **两种计数器检查的区分**

   | 检查类型                           | 检测结果           | 对应情况               |
   | ---------------------------------- | ------------------ | ---------------------- |
   | **活跃计数器（Alive Counter）**    | 重复（Repetition） | 计数器未变化           |
   | **序列计数器（Sequence Counter）** | 错误（Error）      | 计数器增量超出允许范围 |

7. **相关章节**

   - 各 Profile 的 Check 函数 UML 图
   - E2E Protocol Specification 中的计数器检测逻辑

### 超时检测

> 当接收端独立于数据传输运行时（即不阻塞等待数据），通过计数器检测通信丢失和超时。接收端检查是否有新数据可用，结合计数器判断数据是否更新。

1. **超时检测的两种条件**

   | 条件                                      | 含义                                                   | 说明       |
   | ----------------------------------------- | ------------------------------------------------------ | ---------- |
   | `State->NewDataAvailable == FALSE`        | 传输介质（如 RTE）报告**无新数据元素可用**             | 数据未到达 |
   | `State->Status == E2E_PXXSTATUS_REPEATED` | 传输介质提供了新数据，但计数器**与上一个有效数据相同** | 数据重复   |

2. **两种条件的共同含义**

   - 自上次检查以来，**没有更新过的有效数据可用**
   - 代表通信丢失或超时

3. **检测流程**

   ```mermaid
   flowchart TD
       Check[接收端检查数据] --> Available{新数据<br/>可用?}
       Available -->|否| Timeout1[超时检测触发<br/>无新数据]
       Available -->|是| Counter{计数器<br/>已变化?}
       Counter -->|否| Timeout2[超时检测触发<br/>数据重复]
       Counter -->|是| Valid[数据有效<br/>正常处理]
   ```

4. **与 Profile 5 的关联**

   - 此机制在 **Profile 5** 中实现
   - Profile 5 同时使用 CRC、Counter 和 Data ID 检查数据有效性
   - 超时检测是 Profile 5 的重要补充机制

5. **区分重复与超时**

   | 情况     | NewDataAvailable | Counter 变化 | 判定                                 |
   | -------- | ---------------- | ------------ | ------------------------------------ |
   | 无新数据 | `FALSE`          | —            | 通信超时                             |
   | 数据重复 | `TRUE`           | 未变化       | 重复数据（可能为攻击或发送端未更新） |
   | 数据更新 | `TRUE`           | 已变化       | 正常通信                             |

6. **相关机制**

   - 接收端**不阻塞等待**数据
   - 周期性检查当前可用数据
   - 配合计数器检测通信丢失和超时

### 循环冗余校验（CRC）

> CRC 用于检测消息在传输过程中是否发生比特翻转。与计数器错误不同，CRC 错误极不可能产生“误报”（使用良好 CRC 多项式时，检测到的 CRC 错误几乎确定表示数据损坏）。因此，对 CRC 错误应采取更严格的反应机制。接收端容忍的 CRC 错误次数应有限制，因为连续收到多个未被检测到的错误消息的概率不可忽略。

1. **CRC 的作用**

   - 检测消息在传输过程中的**比特翻转**
   - 提供数据完整性保护

2. **CRC 错误与计数器错误的对比**

   | 对比项               | CRC 错误                 | 计数器错误             |
   | -------------------- | ------------------------ | ---------------------- |
   | **误报可能性**       | 极低（使用良好多项式时） | 较高（可能因时序导致） |
   | **检测到错误的意义** | 几乎确定数据损坏发生     | 可能为时序或配置问题   |
   | **反应策略**         | 更严格                   | 相对宽松               |

3. **CRC 错误的严格反应**

   - 检测到 CRC 错误后，后续数据流中可能包含大量**未检测到的损坏数据**
   - 需要限制接收端容忍的 CRC 错误**最大次数**
   - 概率考量：在错误检测和定时间隔内，收到多个未被检测到的错误消息的概率不可忽略

4. **设计影响**

   - 错误的 CRC 指示通信通道的完整性受到影响
   - 接收端设计的容错能力（见 `UC_E2E_00170`）可能因此被超出
   - 需要采取适当的安全措施（如降级、报警、重启通信）

5. **反应策略建议**

   | CRC 错误次数 | 建议反应                         |
   | ------------ | -------------------------------- |
   | 第 1 次      | 记录错误，继续监控               |
   | 达到阈值     | 触发安全反应（如降级模式、报警） |
   | 持续错误     | 认定通信通道受损，采取更严厉措施 |

6. **相关用例**

   - `UC_E2E_00170`：接收端容错设计的相关用例

# E2E Profile 通用部分

> 本章包含多个 E2E Profile 共用的规范内容，使用占位符（如 `XX`）表示 Profile 特定的值。通过 CRC、计数器、Data ID 等安全机制，E2E 能够检测多种通信故障，包括重复、丢失、延迟、插入、伪装、寻址错误、乱序、数据损坏及非对称通信问题。

1. **通用部分的范围**

   - 适用于多个 E2E Profile 共用的规范
   - 使用占位符 `XX` 表示 Profile 特定内容
   - **不适用于** Method Profiles（方法配置文件）
   - 适用于 DataID 和 Length 作为 Profile 头部字段的 Profile

2. **可检测的故障类型与对应的安全机制**

   | 故障/影响                                         | 主要安全机制                    |
   | ------------------------------------------------- | ------------------------------- |
   | 信息重复（Repetition of information）             | 计数器（Counter）               |
   | 信息丢失（Loss of information）                   | 计数器（Counter）               |
   | 信息延迟（Delay of information）                  | 计数器（Counter）               |
   | 信息插入（Insertion of information）              | Data ID                         |
   | 伪装（Masquerading）                              | Data ID, CRC                    |
   | 寻址错误（Incorrect addressing）                  | Data ID                         |
   | 信息顺序错误（Incorrect sequence of information） | 计数器（Counter）               |
   | 信息损坏（Corruption of information）             | CRC                             |
   | 单发多收中的非对称信息                            | CRC（检测任一接收端的数据损坏） |
   | 仅部分接收端收到信息                              | 计数器（特定接收端的丢失检测）  |
   | 通信通道访问阻塞                                  | 计数器（丢失或超时检测）        |

3. **安全机制与故障的对应关系**

   ```mermaid
   flowchart LR
       subgraph Mechanisms[安全机制]
           Counter[计数器]
           DataID[Data ID]
           CRC[CRC]
       end

       subgraph Faults[故障类型]
           Rep[重复]
           Loss[丢失]
           Delay[延迟]
           Insert[插入]
           Mask[伪装]
           Addr[寻址错误]
           Seq[顺序错误]
           Corrupt[数据损坏]
       end

       Counter --> Rep
       Counter --> Loss
       Counter --> Delay
       Counter --> Seq
       DataID --> Insert
       DataID --> Mask
       DataID --> Addr
       CRC --> Mask
       CRC --> Corrupt
   ```

4. **关键故障类型的详细说明**

   | 故障         | 说明                     | 检测机制                   |
   | ------------ | ------------------------ | -------------------------- |
   | **重复**     | 相同消息被多次接收       | 计数器未变化               |
   | **丢失**     | 消息未到达接收端         | 计数器跳跃（超出允许范围） |
   | **延迟**     | 消息到达时间晚于预期     | 计数器与超时结合           |
   | **插入**     | 未授权消息被注入通信     | Data ID 不匹配             |
   | **伪装**     | 消息来源被伪造           | Data ID + CRC 验证         |
   | **寻址错误** | 消息被发送到错误的接收端 | Data ID 不匹配             |
   | **顺序错误** | 消息到达顺序错误         | 计数器非递增               |
   | **数据损坏** | 消息内容被篡改           | CRC 校验失败               |

5. **占位符说明**

   - `XX`：表示 Profile 特定值（如 Profile 编号 `P01`、`P04` 等）
   - 具体值在对应 Profile 的子章节中定义
   - 示例：`E2E_PXXProtect` → `E2E_P01Protect`

## 计数器（Counter）

> 在 E2E Profile 中，计数器的初始化、递增、重置和检查均由 E2E Profile 自身完成，调用方不操纵或使用计数器。发送端首次发送时将计数器初始化为 0，后续每次发送递增 1，达到最大值后回绕到 0 重新开始。最大值取决于计数器位宽。

1. **计数器的管理**

   - E2E Profile 负责计数器的**完整生命周期管理**：
     - 初始化（Initialization）
     - 递增（Increment）
     - 重置（Reset）
     - 检查（Check）
   - 调用方（上层应用）**不操纵**计数器，也**不使用**计数器值

2. **发送端行为** [PRS_E2E_01205]

   - **首次发送请求**：计数器初始化为 **0**
   - **后续每次发送请求**：计数器**递增 1**
   - **达到最大值后**：回绕到 **0** 重新开始

3. **计数器最大值（按位宽）**

   | 计数器位宽 | 最大值                     | 说明          |
   | ---------- | -------------------------- | ------------- |
   | **8 位**   | `0xFF`（255）              | 8-bit 计数器  |
   | **16 位**  | `0xFFFF`（65535）          | 16-bit 计数器 |
   | **32 位**  | `0xFFFFFFFF`（4294967295） | 32-bit 计数器 |

4. **计数器生命周期**

   ```mermaid
   flowchart LR
       Init[首次发送<br/>计数器 = 0] --> Send1[发送]
       Send1 --> Inc1[递增 +1<br/>计数器 = 1]
       Inc1 --> Send2[发送]
       Send2 --> IncN[递增 +1<br/>...]
       IncN --> Max[达到最大值]
       Max --> Wrap[回绕到 0]
       Wrap --> SendN[继续发送]
   ```

5. **计数器回绕示例**

   | 发送次数 | 8-bit 计数器值   | 16-bit 计数器值    |
   | -------- | ---------------- | ------------------ |
   | 1        | 0x00             | 0x0000             |
   | 2        | 0x01             | 0x0001             |
   | ...      | ...              | ...                |
   | 256      | 0xFF             | 0x00FF             |
   | 257      | **0x00**（回绕） | 0x0100             |
   | 65536    | 0xFF             | 0xFFFF             |
   | 65537    | 0x00（回绕）     | **0x0000**（回绕） |

6. **接收端行为（补充说明）**

   - 接收端通过比较当前计数器与上次接收的计数器值进行检测：
     - `增量 = 0` → 重复（Repetition）
     - `增量 = 1` → 正常（无丢失）
     - `1 < 增量 ≤ 允许最大值` → 正常（有丢失）
     - `增量 > 允许最大值` → 错误（丢失过多）

7. **相关规范**

   - `RS_E2E_08539`：计数器相关需求
   - `PRS_E2E_01205`：计数器初始化与递增规则

## Data ID

> Data ID 用于验证每个传输的安全相关数据元素的**身份唯一性**。在 E2E Profiles 中，Data ID 应在通信系统的网络中全局唯一。无论是通过 RTE 保护数据元素（1:1 或 1:N 通信），还是通过 COM 保护消息，接收端均使用 Data ID 来验证收到的数据是否来自预期的发送方。

1. **Data ID 的作用**

   - 验证每个安全相关数据元素的**身份**
   - 防止伪装（Masquerading）、插入（Insertion）和寻址错误（Incorrect addressing）
   - 确保接收端收到的数据来自**预期的发送方**

2. **Data ID 的唯一性要求** [PRS_E2E_01438]

   - Data ID 应在通信系统的网络中**全局唯一**
   - 网络由多个 ECU 组成，每个 ECU 发送不同的数据
   - 唯一性确保不会将不同来源的数据混淆

3. **Data ID 的使用场景**

   | 使用场景         | 调用层 | 验证方式                                  |
   | ---------------- | ------ | ----------------------------------------- |
   | **保护数据元素** | RTE    | 消费者期望特定数据元素，通过 Data ID 验证 |
   | **保护消息**     | COM    | 接收端期望特定消息，通过 Data ID 验证     |

4. **数据元素保护（RTE 调用）**

   - 通信方式：1:1（点对点）或 1:N（一对多）
   - 消费者只期望收到**特定的数据元素**
   - E2E Supervision 通过 Data ID 检查数据元素身份

5. **消息保护（COM 调用）**

   - 接收端在接收时只期望**特定的消息**
   - E2E Supervision 通过 Data ID 检查消息身份

6. **Data ID 与其他安全机制的关系**

   | 安全机制    | 防护目标                   |
   | ----------- | -------------------------- |
   | **Data ID** | 插入、伪装、寻址错误       |
   | **CRC**     | 数据损坏                   |
   | **Counter** | 重复、丢失、延迟、顺序错误 |

7. **Data ID 与 CRC 的联合保护**

   - Data ID 参与 **CRC 计算**（如 Profile 4、Profile 7 等）
   - 确保伪装和损坏同时被检测

8. **全局唯一性的必要性**

   ```mermaid
   flowchart LR
       subgraph Network[网络]
           ECU1[ECU A<br/>Data ID = 1]
           ECU2[ECU B<br/>Data ID = 2]
           ECU3[ECU C<br/>Data ID = 3]
       end
   
       subgraph Receiver[接收端]
           Check[验证 Data ID]
           Check -->|匹配| Accept[接受]
           Check -->|不匹配| Reject[拒绝]
       end
   ```

   - 多个 ECU 发送不同数据，Data ID 必须全局唯一
   - 避免将一个 ECU 的数据误认为另一个 ECU 的数据

9. **相关规范**

   - `RS_E2E_08539`：Data ID 相关需求
   - `PRS_E2E_01438`：Data ID 全局唯一性要求

## Length 字段

> Length 字段用于支持**可变长度**的数据。存储序列化数据的 `Data[]` 数组在每个周期中可能具有不同的长度。Length 字段涵盖了**用户数据 + E2E 头部**（包含 CRC、计数器、Length 和 Data ID）的完整长度信息。

1. **Length 字段的作用**

   - 支持**可变长度**的数据（动态长度）
   - 指示当前数据元素的**完整长度**（用户数据 + E2E 头部）
   - 允许接收端根据 Length 字段动态解析数据

2. **Length 覆盖的范围**

   ```
   Length = 用户数据 + E2E 头部
   ```

   E2E 头部包含：
   - CRC
   - 计数器（Counter）
   - Length
   - Data ID

3. **适用场景**

   - `Data[]` 数组长度在每个周期可能不同
   - 需要接收端知道当前数据的实际长度才能正确解析
   - 常见于动态长度信号或消息

4. **E2E 头部完整结构**

   ```mermaid
   flowchart LR
       subgraph E2EHeader[E2E Header]
           DataID[Data ID]
           Length[Length]
           Counter[Counter]
           CRC[CRC]
       end

       subgraph DataArray[Data 数组]
           UserData[用户数据]
       end

       subgraph Complete[完整 E2E 消息]
           Header[E2E Header]
           Data[用户数据]
       end
   ```

5. **Length 字段的典型布局**

   | 字段       | 典型位宽   | 说明       |
   | ---------- | ---------- | ---------- |
   | Data ID    | 8/16/32 位 | 数据标识符 |
   | **Length** | 8/16 位    | 长度字段   |
   | Counter    | 4/8/16 位  | 计数器     |
   | CRC        | 8/16/32 位 | 校验值     |

6. **使用 Length 的优势**

   - 支持动态长度数据，无需固定长度
   - 节省带宽（短数据时减少传输量）
   - 接收端无需预知数据长度

7. **相关 Profile**

   - 支持 Length 字段的 E2E Profile（如 Profile 7 等）
   - Profile 具体布局参见各 Profile 详细定义

## CRC（循环冗余校验）

> E2E Profiles 根据消息长度使用不同长度的 CRC，以确保高检测率和高汉明距离。CRC 的计算覆盖**整个 E2E 头部（不包括 CRC 字段自身）和用户数据**。使用的 CRC 函数包括 CRC8、CRC8H2F、CRC16、CRC32、CRC32P4 和 CRC64 等。

---

1. **CRC 的作用**

   - 检测数据在传输过程中的**损坏（Corruption）**
   - 确保高**检测率**和**高汉明距离**
   - CRC 长度根据消息长度灵活选择

2. **支持的 CRC 函数** [PRS_E2E_01206]

   | CRC 类型 | 说明                    | 相关章节     |
   | -------- | ----------------------- | ------------ |
   | CRC8     | SAE J1850               | Chapter 6.7  |
   | CRC8H2F  | CRC8 0x2F 多项式        | Chapter 6.10 |
   | CRC16    | 16 位 CRC               | Chapter 6.11 |
   | CRC32    | 32 位 CRC               | Chapter 6.14 |
   | CRC32P4  | CRC32 0xF4ACFB13 多项式 | Chapter 6.14 |
   | CRC64    | CRC-64-ECMA             | —            |

3. **CRC 计算范围** [PRS_E2E_01207]

   ```
   CRC 计算范围 = E2E 头部（不含 CRC 字段）+ 用户数据
   ```

   ```mermaid
   flowchart LR
       subgraph E2EMessage[E2E 消息]
           Header[E2E Header<br/>含 DataID/Length/Counter]
           CRC_Field[CRC 字段]
           UserData[用户数据]
       end

       subgraph CRCRange[CRC 计算范围]
           Header --> Include[✅ 包含]
           UserData --> Include
           CRC_Field --> Exclude[❌ 不包含]
       end
   ```

4. **CRC32P4 的特殊说明**

   - 与 FlexRay、CAN 和 TCP/IP 使用的 32 位 CRC **不同**
   - 由 **CRC Supervision** 提供（而非通信控制器或通信协议栈软件）
   - 来源：不同的软件模块

5. **CRC 选择依据**

   | 消息长度 | 推荐 CRC 类型           | 说明             |
   | -------- | ----------------------- | ---------------- |
   | 短消息   | CRC8 / CRC8H2F          | 低开销           |
   | 中等长度 | CRC16                   | 平衡检测率与开销 |
   | 长消息   | CRC32 / CRC32P4 / CRC64 | 高检测率         |

6. **CRC 在 E2E 头部中的位置**

   ```mermaid
   flowchart LR
       subgraph E2EHeader[E2E Header 结构]
           DataID[Data ID] --> Length[Length] --> Counter[Counter] --> CRC_Field[CRC<br/>不参与自身计算]
       end
       Note[CRC 计算范围: Data ID + Length + Counter + 用户数据]
   ```

7. **相关规范**

   - `RS_E2E_08528`：E2E 基础需求
   - `RS_E2E_08539`：E2E Profile 需求
   - `RS_E2E_08531`：CRC 计算范围需求
   - Chapter 6.7 / 6.10 / 6.11 / 6.14：各 CRC 函数详细定义

## 超时检测

> 通过前述机制（CRC、Counter、Data ID、Length），当接收端独立于数据传输运行时（即非阻塞等待，而是主动检查当前可用数据），借助计数器可检测通信丢失和超时。超时可能源于接收端未获取新数据或数据重复。

---

1. **超时检测的适用条件**

   - 接收端**不阻塞等待**数据
   - 接收端**周期性检查**当前是否有新数据可用
   - 通过计数器检测通信状态

2. **超时检测的两种场景**

   | 场景         | 检测方式                                  | 说明                     |
   | ------------ | ----------------------------------------- | ------------------------ |
   | **无新数据** | `State->NewDataAvailable == FALSE`        | 传输介质报告无新数据元素 |
   | **数据重复** | `State->Status == E2E_PXXSTATUS_REPEATED` | 数据计数器与上次相同     |

3. **检测流程**

   ```mermaid
   flowchart TD
       Rx[接收端执行检查] --> Check{有<br/>新数据?}
       Check -->|否| Timeout[超时/通信丢失]
       Check -->|是| Counter{计数器<br/>已变化?}
       Counter -->|否| Repeat[数据重复<br/>可视为超时]
       Counter -->|是| Valid[通信正常]
   ```

4. **配套机制的作用**

   | 机制        | 在超时检测中的角色           |
   | ----------- | ---------------------------- |
   | **CRC**     | 确保数据完整性（损坏时丢弃） |
   | **Counter** | 检测通信丢失和超时的核心机制 |
   | **Data ID** | 确保数据来源正确             |
   | **Length**  | 确保数据长度正确             |

5. **相关状态**

   - `State->NewDataAvailable`：表示是否有新数据元素可用
   - `State->Status`：数据状态（如 `E2E_PXXSTATUS_REPEATED` 表示重复）

## E2E 头部的创建

### E2E_PXXProtect()

> `E2E_PXXProtect()` 函数按照本节图中的步骤创建 E2E 头部。该函数执行输入验证、偏移计算、Length 写入、Counter 写入、DataID 写入、CRC 计算与写入，以及 Counter 递增等操作。这些步骤的具体行为由对应的图定义。

1. **`E2E_PXXProtect()` 函数整体行为** [PRS_E2E_01209]

   - 总体流程执行如下：

     ![E2E_PXXProtect函数行为](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707132417475.png)

2. **`E2E_PXXProtect()` 的执行步骤**

   1. 验证 Protect 函数的输入：检查输入参数的有效性[PRS_E2E_01210]

      ![验证输入](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707132619443.png)

   2. 计算偏移量：计算 E2E 头部中各字段的位置偏移[PRS_E2E_01211]

      ![计算偏移量](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707132728192.png)

   3. 写入 Length：将长度信息写入 E2E 头部[PRS_E2E_01212]

      ![写入长度](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707132839167.png)

   4. 写入 Counter：将当前计数器值写入 E2E 头部[PRS_E2E_01213]

      ![写入Counter](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133020221.png)

   5. 写入 DataID：将 Data ID 写入 E2E 头部[PRS_E2E_01214]

      ![写DataId](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133114786.png)

   6. 计算 CRC：计算 E2E 头部（不含 CRC）和用户数据的CRC[PRS_E2E_01215]

      ![计算CRC](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133223411.png)

   7. 写入 CRC：将计算出的 CRC 写入 E2E 头部[PRS_E2E_01216]

      ![写入CRC](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133326623.png)

   8. 递增 Counter：为下一次发送递增计数器[PRS_E2E_01217]

      ![递增Counter](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133425914.png)

3. **`E2E_PXXForward()` 共用步骤**

   - **计算偏移量**
   - **写入 Length**
   - **计算 CRC**
   - **写入 CRC**
   - **递增 Counter**

4. **`E2E_PXXCheck()` 共用步骤**

   - **计算偏移量**
   - **计算 CRC**

5. **函数与步骤的对应关系**

   | 步骤         | Protect | Forward | Check |
   | ------------ | :-----: | :-----: | :---: |
   | 验证输入     |    ✅    |    —    |   —   |
   | 计算偏移量   |    ✅    |    ✅    |   ✅   |
   | 写入 Length  |    ✅    |    ✅    |   —   |
   | 写入 Counter |    ✅    |    —    |   —   |
   | 写入 DataID  |    ✅    |    —    |   —   |
   | 计算 CRC     |    ✅    |    ✅    |   ✅   |
   | 写入 CRC     |    ✅    |    ✅    |   —   |
   | 递增 Counter |    ✅    |    ✅    |   —   |

6. **E2E 头部创建流程图**

   ```mermaid
   flowchart TD
       Start[E2E_PXXProtect 调用] --> Validate[验证输入]
       Validate --> Offset[计算偏移量]
       Offset --> WriteLen[写入 Length]
       WriteLen --> WriteCounter[写入 Counter]
       WriteCounter --> WriteDataID[写入 DataID]
       WriteDataID --> CalcCRC[计算 CRC]
       CalcCRC --> WriteCRC[写入 CRC]
       WriteCRC --> IncCounter[递增 Counter]
       IncCounter --> Done[完成]
   ```

7. **相关规范**

   | 规范            | 内容                 |
   | --------------- | -------------------- |
   | `RS_E2E_08539`  | E2E Profile 需求     |
   | `PRS_E2E_01209` | Protect 函数总体行为 |
   | `PRS_E2E_01210` | 输入验证步骤         |
   | `PRS_E2E_01211` | 偏移量计算步骤       |
   | `PRS_E2E_01212` | Length 写入步骤      |
   | `PRS_E2E_01213` | Counter 写入步骤     |
   | `PRS_E2E_01214` | DataID 写入步骤      |
   | `PRS_E2E_01215` | CRC 计算步骤         |
   | `PRS_E2E_01216` | CRC 写入步骤         |
   | `PRS_E2E_01217` | Counter 递增步骤     |

### E2E_PXXForward()

> `E2E_PXXForward()` 函数由 SW-C 调用，用于保护应用数据并转发接收到的 E2E 状态，适用于**基于信号的通信向面向服务的通信转换**（Signal-Service-Translation）等场景。若接收到的 E2E 状态为 `E2E_P_OK`，则其行为与 `E2E_PXXProtect()` 相同。该函数按本节图中指定的步骤执行。

1. **`E2E_PXXForward()` 的核心用途**

   - 保护待发送的应用数据
   - **转发**接收到的 E2E 状态
   - 典型场景：**信号到服务通信的转换**（Signal-Service-Translation）

2. **整体行为** [PRS_E2E_01218]

   - 按下图定义的总体流程执行

     ![E2E_PXXForward函数执行过程](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707133958282.png)

   - 若接收到的 E2E 状态为 `E2E_P_OK`，则行为与 `E2E_PXXProtect()` **相同**

3. **`E2E_PXXForward()` 的执行步骤**

   1. 验证 Forward 函数的输入：检查输入参数的有效性[PRS_E2E_01228]

      ![验证输入](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707134322432.png)

   2. 计算偏移量：计算 E2E 头部中各字段的位置偏移[PRS_E2E_01211]，参见`E2E_PXXProtect`函数流程图

   3. 写入 Length：将长度信息写入 E2E 头部[PRS_E2E_01212]，参见`E2E_PXXProtect`函数流程图

   4. 写入 Counter：将当前计数器值写入 E2E 头部[PRS_E2E_01219]

      ![写入Counter](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707134632452.png)

   5. 写入 DataID：将 Data ID 写入 E2E 头部[PRS_E2E_01220]

      ![写入DataId](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707134724443.png)

   6. 计算 CRC：计算 E2E 头部（不含 CRC）和用户数据的 CRC[PRS_E2E_01215]，参见`E2E_PXXProtect`函数流程图

   7. 写入 CRC：将计算出的 CRC 写入 E2E 头部[PRS_E2E_01216]，参见`E2E_PXXProtect`函数流程图

   8. 递增 Counter：为下一次发送递增计数器[PRS_E2E_01217]，参见`E2E_PXXProtect`函数流程图

4. **与 `E2E_PXXProtect()` 的差异**

   | 步骤         | 说明                                         |
   | ------------ | -------------------------------------------- |
   | 验证输入     | 不同验证逻辑                                 |
   | 写入 Counter | 可能根据转发状态调整                         |
   | 写入 DataID  | 可能根据转发状态调整                         |
   | 其他步骤     | 偏移量、Length、CRC 计算与写入、Counter 递增 |

5. **状态依赖行为**

   ```mermaid
   flowchart LR
       Input[输入 E2E 状态] --> Check{状态 ==<br/>E2E_P_OK?}
       Check -->|是| Protect[与 Protect 相同<br/>正常保护]
       Check -->|否| Forward[按转发逻辑执行]
   ```

6. **相关规范**

   | 规范            | 内容                 |
   | --------------- | -------------------- |
   | `RS_E2E_08539`  | E2E Profile 需求     |
   | `PRS_E2E_01218` | Forward 函数总体行为 |
   | `PRS_E2E_01228` | 输入验证步骤         |
   | `PRS_E2E_01219` | Counter 写入步骤     |
   | `PRS_E2E_01220` | DataID 写入步骤      |
   | `PRS_E2E_01211` | 偏移量计算步骤       |
   | `PRS_E2E_01212` | Length 写入步骤      |
   | `PRS_E2E_01215` | CRC 计算步骤         |
   | `PRS_E2E_01216` | CRC 写入步骤         |
   | `PRS_E2E_01217` | Counter 递增步骤     |

## E2E 头部的评估

### E2E_PXXCheck（）

> `E2E_PXXCheck()` 函数按照指定的步骤执行 E2E 头部的评估。该函数验证输入、读取 Length、Counter、DataID 和 CRC，执行各项检查，并返回 E2E 状态。

1. **`E2E_PXXCheck()` 的整体行为** [PRS_E2E_01221]

   - 按下图定义的总体流程执行

     ![E2E_PXXCheck执行过程](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140239395.png)

2. **`E2E_PXXCheck()` 的执行步骤**

   1. 验证 Check 函数的输入：检查输入参数的有效性[PRS_E2E_01222]

      ![验证函数输入](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140600192.png)

   2. 计算偏移量：计算 E2E 头部中各字段的位置偏移[PRS_E2E_01211]

   3. 读取 Length：从 E2E 头部读取长度信息[PRS_E2E_01223]

      ![读取长度](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140628231.png)

   4. 读取 Counter：从 E2E 头部读取计数器值[PRS_E2E_01224]

      ![读取Counter](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140655827.png)

   5. 读取 DataID：从 E2E 头部读取 Data ID[PRS_E2E_01225]

      ![读取DataId](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140724367.png)

   6. 读取 CRC：从 E2E 头部读取 CRC 值[PRS_E2E_01226]

      ![读取CRC](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707140808921.png)

   7. 计算 CRC：计算 E2E 头部（不含 CRC）和用户数据的 CRC[PRS_E2E_01215]

   8. 执行检查：执行各项故障检测检查[PRS_E2E_01227]

      ![执行检查](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707141133575.png)

3. **`E2E_PXXCheck()` 流程图**

   ```mermaid
   flowchart TD
       Start[E2E_PXXCheck 调用] --> Validate[验证输入]
       Validate --> Offset[计算偏移量]
       Offset --> ReadLen[读取 Length]
       ReadLen --> ReadCounter[读取 Counter]
       ReadCounter --> ReadDataID[读取 DataID]
       ReadDataID --> ReadCRC[读取 CRC]
       ReadCRC --> CalcCRC[计算 CRC]
       CalcCRC --> DoChecks[执行检查]
       DoChecks --> Return[返回 E2E 状态]
   ```

4. **`E2E_PXXCheck()` 与其他函数的共用步骤**

   | 步骤       | Protect | Forward | Check |
   | ---------- | :-----: | :-----: | :---: |
   | 计算偏移量 |    ✅    |    ✅    |   ✅   |
   | 计算 CRC   |    ✅    |    ✅    |   ✅   |

5. **`E2E_PXXCheck()` 的输入验证** [PRS_E2E_01222]

   - 检查输入参数的有效性（如指针非空、配置参数有效等）

6. **`E2E_PXXCheck()` 执行检查** [PRS_E2E_01227]

   - 检测的故障类型：
     - 重复（Repetition）
     - 丢失（Loss）
     - 延迟（Delay）
     - 插入（Insertion）
     - 伪装（Masquerading）
     - 寻址错误（Incorrect addressing）
     - 顺序错误（Incorrect sequence）
     - 数据损坏（Corruption）

7. **返回状态**

   - 返回 E2E 状态（如 `E2E_P_OK`、`E2E_P_WRONG`、`E2E_P_REPEATED` 等）
   - 状态用于 E2E 状态机的长期评估

8. **相关规范**

   | 规范            | 内容               |
   | --------------- | ------------------ |
   | `RS_E2E_08539`  | E2E Profile 需求   |
   | `PRS_E2E_01221` | Check 函数总体行为 |
   | `PRS_E2E_01222` | 输入验证步骤       |
   | `PRS_E2E_01223` | 读取 Length 步骤   |
   | `PRS_E2E_01224` | 读取 Counter 步骤  |
   | `PRS_E2E_01225` | 读取 DataID 步骤   |
   | `PRS_E2E_01226` | 读取 CRC 步骤      |
   | `PRS_E2E_01227` | 执行检查步骤       |
   | `PRS_E2E_01211` | 偏移量计算步骤     |
   | `PRS_E2E_01215` | CRC 计算步骤       |
