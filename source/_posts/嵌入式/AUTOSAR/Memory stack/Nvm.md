---
title: Nvm
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

> [!tip]
>
> 标准文件请参见[Specification of NVRAM Manager (autosar.org)](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_SWS_NVRAMManager.pdf)

> **NVRAM Manager (NvM)** 是 AUTOSAR 基础软件中的非易失性存储管理模块。它为上层的应用和组件提供了统一的接口，用于管理非易失性数据（如校准参数、配置信息、故障码等），同时屏蔽了底层存储介质（EEPROM、Flash 模拟 EEPROM）的差异。

1. 核心目的与职责

   NVRAM 管理器的主要目标是：根据各个非易失性数据的**个体需求**，在汽车环境中确保数据的存储和维护。

   **核心职责清单**：

   | 职责         | 说明                                      |
   | ------------ | ----------------------------------------- |
   | **数据存储** | 将数据写入非易失性存储介质                |
   | **数据维护** | 确保数据的完整性、一致性和可靠性          |
   | **介质管理** | 同时管理 EEPROM 和 Flash 模拟 EEPROM 设备 |
   | **请求服务** | 提供同步/异步的读写和控制接口             |

2. 支持的服务类型

   NVRAM 管理器为上层提供以下四类服务：

   ```mermaid
   flowchart LR
       subgraph Services [NvM 服务]
           Init[初始化<br/>Init]
           Read[读取<br/>Read]
           Write[写入<br/>Write]
           Control[控制<br/>Control]
       end
       
       subgraph Modes [执行模式]
           Sync[同步<br/>Synchronous]
           Async[异步<br/>Asynchronous]
       end
       
       Init --> Sync
       Read --> Sync
       Read --> Async
       Write --> Sync
       Write --> Async
       Control --> Sync
       Control --> Async
   ```

   | 服务类型   | 说明                                      | 典型场景                       |
   | ---------- | ----------------------------------------- | ------------------------------ |
   | **初始化** | 模块启动时的初始化和配置加载              | 系统启动时                     |
   | **读取**   | 从非易失性存储器读取数据                  | 读取校准参数、配置信息         |
   | **写入**   | 将数据写入非易失性存储器                  | 存储诊断结果、学习值、配置变更 |
   | **控制**   | 控制 NVRAM 的行为（如写立即执行、刷新等） | 强制写入、块管理操作           |

3. 执行模式

   NVRAM 管理器支持两种执行模式：

   | 模式     | 说明                                       | 特点                             |
   | -------- | ------------------------------------------ | -------------------------------- |
   | **同步** | 请求发出后，等待操作完成才返回             | 调用方阻塞，简单但可能影响实时性 |
   | **异步** | 请求发出后立即返回，操作完成后通过回调通知 | 调用方非阻塞，适合长耗时操作     |

   > **设计原则**：同一个接口通常同时提供同步和异步两种版本，让上层根据场景选择。

4. NVRAM 管理器在 BSW 中的位置

   ```mermaid
   flowchart TD
       subgraph APP [应用层 ASW]
           SWC1[软件组件 1]
           SWC2[软件组件 2]
           SWC3[软件组件 3]
       end
       
       subgraph RTE [运行时环境 RTE]
           RTE_Box[RTE]
       end
       
       subgraph BSW [基础软件层 BSW]
           subgraph Services [服务层]
               NvM[NVRAM Manager<br/>NvM]
               MemInt[Memory Interface<br/>MemIf]
           end
           
           subgraph ECU [ECU 抽象层]
               EEP[EEPROM 抽象<br/>EEP]
               Fls[Flash 抽象<br/>Fls]
           end
           
           subgraph MCAL [微控制器抽象层]
               EEP_Drv[EEPROM 驱动]
               Fls_Drv[Flash 驱动]
           end
       end
       
       SWC1 & SWC2 & SWC3 --> RTE
       RTE --> NvM
       NvM --> MemInt
       MemInt --> EEP
       MemInt --> Fls
       EEP --> EEP_Drv
       Fls --> Fls_Drv
   ```

   **层次关系说明**：

   | 层次           | 模块                     | 职责                               |
   | -------------- | ------------------------ | ---------------------------------- |
   | **应用层**     | SWC                      | 通过 RTE 调用 NvM 服务             |
   | **服务层**     | NvM                      | 提供存储服务抽象、块管理、数据保护 |
   | **服务层**     | MemIf                    | 抽象不同存储介质的差异             |
   | **ECU 抽象层** | EEP / Fls                | 具体存储介质的抽象接口             |
   | **MCAL**       | EEPROM 驱动 / Flash 驱动 | 硬件直接访问                       |

5. NvM 在不同 AUTOSAR 分层中的角色定位

   ```mermaid
   flowchart LR
       subgraph Layers [AUTOSAR 分层架构]
           direction TB
           APP[应用层 ASW<br/>业务逻辑、应用数据]
           RTE[运行时环境 RTE<br/>应用与 BSW 的桥梁]
           NvM[NVRAM 管理器 NvM<br/>☑️ 数据存储服务<br/>☑️ 块管理<br/>☑️ 数据完整性保护]
           LL[下层驱动<br/>MemIf / EEP / Fls]
       end
       
       APP <--> RTE
       RTE <--> NvM
       NvM --> LL
   ```

   **NvM 在分层中的定位**：

   - **向上**：通过 RTE 为应用层提供存储服务
   - **向下**：通过 MemIf 调用具体的存储驱动
   - **同级**：与其他服务层模块（如 DCM、COM）协作，提供诊断存储、配置存储等功能

6. NvM 核心功能概览

   ```mermaid
   flowchart TD
       subgraph NvM [NVRAM Manager]
           direction TB
           
           subgraph Management [块管理]
               InitBlock[初始化块]
               ReadBlock[读块]
               WriteBlock[写块]
               EraseBlock[擦除块]
           end
           
           subgraph Protection [数据保护]
               CRC[CRC 校验]
               Redundancy[冗余存储]
               InvalidBlock[无效块处理]
           end
           
           subgraph Policy [存储策略]
               Immediate[立即写入]
               Background[后台写入]
               Polling[轮询模式]
               Priority[优先级管理]
           end
           
           subgraph DatasetMgt [数据集管理]
               DatasetConfig[数据集配置]
               Index[数据集索引]
           end
       end
   ```

7. 典型使用场景

   | 场景         | 数据示例                     | NvM 作用                   |
   | ------------ | ---------------------------- | -------------------------- |
   | **系统启动** | 配置参数、校准值             | 读取初始配置               |
   | **诊断服务** | 故障码存储 ($0x19$/$0x14$)   | 写入/读取/清除 DTC         |
   | **学习功能** | 自适应学习值、传感器漂移补偿 | 运行时写入，下次启动读取   |
   | **标定**     | 校准参数                     | 通过标定工具写入，ECU 读取 |
   | **配置管理** | 车辆配置、功能开关           | 存储用户配置               |

NvM 与相关模块的关系

| 关联模块        | 关系说明                                                     |
| --------------- | ------------------------------------------------------------ |
| **MemIf**       | NvM 通过 MemIf 统一访问不同存储介质                          |
| **EEPROM 驱动** | 直接操作 EEPROM 硬件                                         |
| **Flash 驱动**  | 操作 Flash 硬件，用于模拟 EEPROM                             |
| **DCM**         | NvM 为诊断服务（如 $0x22$ 读取 DID、$0x2E$ 写入 DID）提供数据存储 |
| **COM**         | NvM 可存储通信相关的配置或网关路由信息                       |

# 基础架构

## 内存硬件抽象的寻址方案

> NvM 模块通过**内存抽象接口**（MemIf）与底层存储交互，底层向 NvM 提供一个**虚拟的线性 32 位地址空间**。该地址空间由 **16 位块编号**和 **16 位块内偏移**组成，实现了逻辑块到物理存储的映射。



1. 虚拟地址空间结构 [SWS_NvM_00051]

   底层模块（内存抽象接口、Flash EEPROM 仿真层、EEPROM 抽象层）向 NvM 提供统一的虚拟地址空间：

   | 组成部分                            | 位宽  | 范围      | 说明           |
   | ----------------------------------- | ----- | --------- | -------------- |
   | **块编号** (Block Number)           | 16 位 | 0 - 65535 | 标识一个逻辑块 |
   | **块内偏移** (Block Address Offset) | 16 位 | 0 - 65535 | 块内的字节偏移 |

   **理论最大值**：

   | 资源                   | 最大值   | 计算                  |
   | ---------------------- | -------- | --------------------- |
   | **逻辑块数量**         | 65536 个 | $2^{16}$= 65536       |
   | **单个逻辑块最大尺寸** | 64 KB    | $2^{16}$ = 65536 字节 |

   ```mermaid
   flowchart LR
       subgraph VirtualAddress [32位虚拟地址]
           BlockNum[16位块编号<br/>Block Number]
           Offset[16位偏移<br/>Offset]
       end
       
       BlockNum --> |索引| Block[逻辑块<br/>最大 64KB]
       Offset --> |定位| Byte[块内字节]
   ```

2. 块编号的进一步细分 [SWS_NvM_00122]

   NvM 将 16 位的 `Fee/Ea` 块编号进一步细分为两个部分：

   ```mermaid
   flowchart TD
       subgraph FeeBlockNum [16位 Fee/Ea 块编号]
           BaseBits[高位<br/>NV块基编号<br/>NVM_NV_BLOCK_BASE_NUMBER]
           IndexBits[低位<br/>数据索引<br/>Data Index]
       end
       
       BaseBits --> |位宽 = 16 - N| BaseNum[确定基础块]
       IndexBits --> |位宽 = N| DataSet[选择数据集]
       
       Note[N = NVM_DATASET_SELECTION_BITS]
   ```

   **字段说明**：

   | 字段            | 位宽                              | 配置参数                     | 作用                       |
   | --------------- | --------------------------------- | ---------------------------- | -------------------------- |
   | **NV 块基编号** | 16 - `NVM_DATASET_SELECTION_BITS` | `NVM_NV_BLOCK_BASE_NUMBER`   | 标识一组相关的块           |
   | **数据索引**    | `NVM_DATASET_SELECTION_BITS`      | `NVM_DATASET_SELECTION_BITS` | 在一组块中选择具体的数据集 |

   **示例**：假设 `NVM_DATASET_SELECTION_BITS = 2`

   | 位域     | 位宽  | 取值范围  | 含义                 |
   | -------- | ----- | --------- | -------------------- |
   | 基编号   | 14 位 | 0 - 16383 | 块组标识             |
   | 数据索引 | 2 位  | 0 - 3     | 选择组内第几个数据集 |

3. 基编号的位位置 [SWS_NvM_00123]

   > NV 块基编号位于 `Fee/Ea` 块编号的**最高有效位**（Most Significant Bits）。

   **16 位块编号的位分配**：

   ```mermaid
   flowchart LR
       subgraph BitLayout [16位块编号]
           MSB[高位<br/>MSB] 
           direction LR
           BaseBits[NV块基编号<br/>NVM_NV_BLOCK_BASE_NUMBER<br/>高位]
           IndexBits[数据索引<br/>Data Index<br/>低位]
           LSB[低位<br/>LSB]
       end
       
       MSB --> BaseBits
       BaseBits --> IndexBits
       IndexBits --> LSB
   ```

   | 位位置   | 内容                       | 说明           |
   | -------- | -------------------------- | -------------- |
   | **高位** | `NVM_NV_BLOCK_BASE_NUMBER` | 确定基础块     |
   | **低位** | 数据索引                   | 选择具体数据集 |

4. 数据集和冗余块的处理 [SWS_NvM_00343]

   > 冗余 NVRAM 块的寻址方式与数据集 NVRAM 块**相同**，都通过配置参数 `NvMDatasetSelectionBits` 进行管理。

   **统一寻址模型**：

   ```mermaid
   flowchart TD
       subgraph NvMBlock [NvM 逻辑块]
           BaseNumber[块基编号<br/>Base Number]
       end
       
       BaseNumber --> |+ DataSetIndex| DataSetBlock[数据集块]
       BaseNumber --> |+ RedundancyIndex| RedundantBlock[冗余块]
       
       Note1[数据集块：同一基编号下<br/>不同索引对应不同数据集]
       Note2[冗余块：同一基编号下<br/>不同索引对应冗余副本]
   ```

   | 块类型       | 寻址方式            | 索引含义               |
   | ------------ | ------------------- | ---------------------- |
   | **数据集块** | 基编号 + 数据集索引 | 选择组内的不同数据集   |
   | **冗余块**   | 基编号 + 冗余索引   | 选择同一数据的冗余副本 |

5. 块标识符的配置 [SWS_NvM_00442, SWS_NvM_00443]

   1.  配置工具职责 [SWS_NvM_00442]

      > 配置工具负责配置**块标识符**。

      **典型配置流程**：

      ```mermaid
      flowchart LR
          Tool[配置工具] --> |计算/分配| BlockID[块标识符<br/>Block Identifiers]
          BlockID --> |生成| Config[配置文件<br/>.arxml / .c / .h]
          Config --> |编译时固定| NvM[NvM 模块]
      ```

   2. 运行时不变性 [SWS_NvM_00443]

      > NvM 模块**不得修改**已配置的块标识符。

      | 允许的操作           | 禁止的操作           |
      | -------------------- | -------------------- |
      | 读取配置的块标识符   | ❌ 修改块标识符的值   |
      | 使用块标识符进行寻址 | ❌ 动态重新分配块编号 |
      | 将块标识符传递给下层 | ❌ 覆盖配置的标识符   |

      > **设计原则**：块标识符在配置时确定，编译后即固化。NvM 运行时只读使用，保证存储布局的**确定性**和**可预测性**。

6. 完整寻址层次图

   ```mermaid
   flowchart TD
       subgraph AppLayer [应用层]
           SWC[软件组件<br/>请求读写特定数据]
       end
       
       subgraph NvMLayer [NvM 层]
           LogicalBlock[逻辑块<br/>如：校准数据块]
           BlockID[块标识符<br/>配置时分配]
       end
       
       subgraph AddressTranslation [地址转换]
           BaseNum[提取基编号<br/>NVM_NV_BLOCK_BASE_NUMBER]
           DataIndex[提取数据索引<br/>NVM_DATASET_SELECTION_BITS]
       end
       
       subgraph MemIfLayer [内存抽象层]
           FeeBlockNum[16位 Fee/Ea 块编号<br/>= 基编号 + 索引]
           Offset[16位偏移]
       end
       
       subgraph PhysLayer [物理层]
           EEPROM[EEPROM]
           Flash[Flash 模拟 EEPROM]
       end
       
       SWC --> LogicalBlock
       LogicalBlock --> BlockID
       BlockID --> BaseNum
       BlockID --> DataIndex
       BaseNum --> FeeBlockNum
       DataIndex --> FeeBlockNum
       FeeBlockNum --> MemIfLayer
       Offset --> MemIfLayer
       MemIfLayer --> EEPROM
       MemIfLayer --> Flash
   ```

   

7. 完整寻址转换流程图

   ```mermaid
   flowchart LR
       subgraph Input [输入]
           BlockBase["块基编号<br/>如: 0x100"]
           DatasetIdx["数据集索引<br/>如: 0x2"]
           Offset["块内偏移<br/>如: 0x50"]
       end
       
       subgraph Combine [组合]
           Combined["组合: (BlockBase << DatasetBits) + DatasetIdx"]
       end
       
       subgraph Output [输出到下层]
           FeeBlock["16位 Fee/Ea 块编号<br/>如: 0x402"]
           Final["32位虚拟地址<br/>= (FeeBlock << 16) + Offset"]
       end
       
       BlockBase --> Combined
       DatasetIdx --> Combined
       Combined --> FeeBlock
       FeeBlock --> Final
       Offset --> Final
   ```

   

8.  设计意图

   | 设计点                      | 目的                                   |
   | --------------------------- | -------------------------------------- |
   | **32 位虚拟地址空间**       | 统一 EEPROM 和 Flash 的访问方式        |
   | **16 位块编号 + 16 位偏移** | 支持最多 64K 个块，每块最大 64KB       |
   | **块编号进一步细分**        | 原生支持数据集和冗余块，无需额外配置   |
   | **基编号位于高位**          | 物理相邻的块共享高位，便于存储布局优化 |
   | **配置工具分配标识符**      | 避免运行时计算开销和不确定性           |
   | **块标识符运行时不变**      | 确保存储布局稳定，支持断电恢复         |

> > 例子
>
> 
>
> 核心计算公式：
> $$
> FEE / EA 块编号 = (NvM 块基编号 << NvM 数据集选择位宽) + 数据索引
> $$
>
> | 参数                      | 说明                                         |
> | ------------------------- | -------------------------------------------- |
> | `NvMNvBlockBaseNumber`    | NvM 侧的块基编号                             |
> | `NvMDatasetSelectionBits` | 数据集选择位宽，用于寻址不同数据集或冗余副本 |
> | `数据索引` (DataIndex)    | 0 到 (2^位宽 - 1) 范围内的索引值             |
> | `FEE/EA_BLOCK_NUMBER`     | 传递给下层（Fee/Ea）的实际块编号             |
>
> 
>
> 1. 示例 A：位宽 = 2
>
>    1. 配置参数
>
>       | 参数                      | 值    | 说明                       |
>       | ------------------------- | ----- | -------------------------- |
>       | `NvMDatasetSelectionBits` | 2     | 数据集选择位宽为 2 位      |
>       | 可用于基编号的位数        | 14 位 | 16 位总宽度 - 2 位 = 14 位 |
>
>    2. 取值范围
>
>       | 参数                   | 范围             | 计算                                             |
>       | ---------------------- | ---------------- | ------------------------------------------------ |
>       | `NvMNvBlockBaseNumber` | `0x1` ~ `0x3FFE` | 14 位有效范围（最大值 2^14 - 2）                 |
>       | 数据索引               | `0x0` ~ `0x3`    | 2 位范围：0, 1, 2, 3                             |
>       | `FEE/EA_BLOCK_NUMBER`  | `0x4` ~ `0xFFFB` | 基编号最小值 1 对应 4，最大值 0x3FFE 对应 0xFFFB |
>
>    3. 具体计算示例
>
>       ```mermaid
>       flowchart LR
>           subgraph Formula [计算公式]
>               Step1["(NvMNvBlockBaseNumber << NvMDatasetSelectionBits)"]
>               Step2["+ DataIndex"]
>               Result["= FEE/EA_BLOCK_NUMBER"]
>           end
>       ```
>
>       **示例 1：原生 NVRAM 块**
>
>       | 参数                       | 值                    |
>       | -------------------------- | --------------------- |
>       | `NvMNvBlockBaseNumber`     | 2                     |
>       | `NvMDatasetSelectionBits`  | 2                     |
>       | 左移结果                   | 2 << 2 = 8            |
>       | 数据索引（原生块固定为 0） | 0                     |
>       | **计算结果**               | **FEE/EA 块编号 = 8** |
>
>       **示例 2：冗余 NVRAM 块（基编号 = 3）**
>
>       | 数据索引 | 计算过程              | FEE/EA 块编号 |
>       | -------- | --------------------- | ------------- |
>       | 索引 0   | (3 << 2) + 0 = 12 + 0 | **12**        |
>       | 索引 1   | (3 << 2) + 1 = 12 + 1 | **13**        |
>
>       **示例 3：数据集 NVRAM 块（基编号 = 4，共 3 个数据集）**
>
>       | 数据集编号 | 数据索引 | 计算过程              | FEE/EA 块编号 |
>       | ---------- | -------- | --------------------- | ------------- |
>       | 块 #0      | 0        | (4 << 2) + 0 = 16 + 0 | **16**        |
>       | 块 #1      | 1        | (4 << 2) + 1 = 16 + 1 | **17**        |
>       | 块 #2      | 2        | (4 << 2) + 2 = 16 + 2 | **18**        |
>
> 2. 示例 B：位宽 = 4
>
>    1. 配置参数
>
>       | 参数                      | 值    | 说明                       |
>       | ------------------------- | ----- | -------------------------- |
>       | `NvMDatasetSelectionBits` | 4     | 数据集选择位宽为 4 位      |
>       | 可用于基编号的位数        | 12 位 | 16 位总宽度 - 4 位 = 12 位 |
>
>    2. 取值范围
>
>       | 参数                   | 范围              | 计算                                               |
>       | ---------------------- | ----------------- | -------------------------------------------------- |
>       | `NvMNvBlockBaseNumber` | `0x1` ~ `0xFFE`   | 12 位有效范围                                      |
>       | 数据索引               | `0x0` ~ `0xF`     | 4 位范围：0 ~ 15                                   |
>       | `FEE/EA_BLOCK_NUMBER`  | `0x10` ~ `0xFFEF` | 基编号最小值 1 对应 0x10，最大值 0xFFE 对应 0xFFEF |
>
>       > **计算公式验证**：基编号最小值 1 → (1 << 4) + 0 = 0x10；基编号最大值 0xFFE → (0xFFE << 4) + 15 = 0xFFE0 + 15 = 0xFFEF
>
> 3. 参数关系图
>
>    ```mermaid
>    flowchart TD
>        subgraph NvMConfig [NvM 配置参数]
>            BaseNum[NvMNvBlockBaseNumber<br/>块基编号]
>            SelBits[NvMDatasetSelectionBits<br/>数据集选择位宽]
>        end
>        
>        subgraph Derivation [派生参数]
>            IndexBits[数据索引位宽 = SelBits]
>            BaseBits[基编号位宽 = 16 - SelBits]
>            MaxIndex[最大索引 = 2^SelBits - 1]
>        end
>        
>        subgraph Mapping [映射到下层]
>            FeeBlock[FEE/EA_BLOCK_NUMBER<br/>= BaseNum << SelBits + DataIndex]
>        end
>        
>        subgraph Example [示例 A 取值]
>            ExSel[SelBits = 2]
>            ExBase[BaseNum 范围: 0x1 ~ 0x3FFE]
>            ExFee[Fee 块编号: 0x4 ~ 0xFFFB]
>        end
>        
>        BaseNum --> Mapping
>        SelBits --> Mapping
>        Mapping --> FeeBlock
>        
>    ```
>
> 4. 块类型与索引对应关系
>
>    | 块类型       | 数据索引使用方式 | 说明                             |
>    | ------------ | ---------------- | -------------------------------- |
>    | **原生块**   | 固定为 0         | 单个逻辑块，无需区分数据集或冗余 |
>    | **冗余块**   | 0, 1, 2...       | 每个索引对应一个冗余副本         |
>    | **数据集块** | 0, 1, 2...       | 每个索引对应一个独立的数据集     |
>
>    ```mermaid
>    flowchart LR
>        subgraph Base [块基编号 = X]
>            direction LR
>            N0["索引 0<br/>原生块"]
>        end
>                             
>        subgraph Redundant [块基编号 = Y]
>            direction LR
>            R0["索引 0<br/>冗余副本 0"]
>            R1["索引 1<br/>冗余副本 1"]
>        end
>                             
>        subgraph Dataset [块基编号 = Z]
>            direction LR
>            D0["索引 0<br/>数据集 0"]
>            D1["索引 1<br/>数据集 1"]
>            D2["索引 2<br/>数据集 2"]
>        end
>                             
>        Note["同一基编号下的不同索引<br/>映射到连续的 Fee/Ea 块编号"]
>    ```
>
>    
>
> 5. 数值验证表
>
>    1. 示例A
>
>       | 块类型           | 基编号 | 数据索引 | 左移结果 | +索引 | Fee 块编号 |
>       | ---------------- | ------ | -------- | -------- | ----- | ---------- |
>       | 原生块           | 2      | 0        | 8        | 8     | **8**      |
>       | 冗余块 (第1副本) | 3      | 0        | 12       | 12    | **12**     |
>       | 冗余块 (第2副本) | 3      | 1        | 12       | 13    | **13**     |
>       | 数据集块0        | 4      | 0        | 16       | 16    | **16**     |
>       | 数据集块1        | 4      | 1        | 16       | 17    | **17**     |
>       | 数据集块2        | 4      | 2        | 16       | 18    | **18**     |
>
>    2. 示例 B
>
>       | 参数                      | 示例 A       | 示例 B        |
>       | ------------------------- | ------------ | ------------- |
>       | `NvMDatasetSelectionBits` | 2            | 4             |
>       | 基编号位宽                | 14 位        | 12 位         |
>       | 基编号范围                | 0x1 ~ 0x3FFE | 0x1 ~ 0xFFE   |
>       | 索引范围                  | 0 ~ 3        | 0 ~ 15        |
>       | Fee 块编号范围            | 0x4 ~ 0xFFFB | 0x10 ~ 0xFFEF |
>
> 
>
> 
>
> 



## 基础存储对象

### NV block

> **NV 块**是 NVRAM 管理器中的基本存储对象，代表一个由**用户数据**、**可选 CRC 校验值**和**可选块头**组成的内存区域。它是 NvM 管理数据的最小逻辑单元。



1. 核心定义 [SWS_NvM_00125]

   NV 块是 NvM 模块中的**基本存储对象**，包含以下组成部分：

   | 组成部分        | 是否必选 | 说明                             |
   | --------------- | -------- | -------------------------------- |
   | **NV 用户数据** | ✅ 必选   | 实际存储的应用数据               |
   | **CRC 校验值**  | 可选     | 用于数据完整性校验               |
   | **NV 块头**     | 可选     | 包含块的元信息（如状态、版本等） |

2. NV 块的逻辑结构

   ```mermaid
   flowchart TD
       subgraph NVBlock [NV 块]
           direction TB
           
           subgraph Optional [可选部分]
               Header[NV 块头<br/>可选]
               CRC[CRC 校验值<br/>可选]
           end
           
           UserData[NV 用户数据<br/>必选]
       end
       
       Header --> UserData
       UserData --> CRC
       
       Note1["逻辑顺序示意<br/>实际物理布局可能因配置而异"]
   ```

   

3. 组成部分详解

   | 组件         | 说明                                                         | 典型用途                           |
   | ------------ | ------------------------------------------------------------ | ---------------------------------- |
   | **块头**     | 存储块的元信息，如数据状态（有效/无效/待写入）、版本号、长度等 | 支持数据完整性检查和恢复机制       |
   | **用户数据** | 应用层实际需要存储的数据内容                                 | 校准参数、配置信息、学习值、DTC 等 |
   | **CRC 校验** | 对用户数据（可能包含块头）计算的循环冗余校验值               | 检测数据损坏，支持错误恢复         |

4. 逻辑布局示意图

   ```mermaid
   flowchart LR
       subgraph LogicalView [逻辑视图]
           direction LR
           A[块头<br/>可选] --> B[用户数据<br/>必选] --> C[CRC<br/>可选]
       end
       
       subgraph Examples [配置示例]
           Ex1["配置1: 仅用户数据"]
           Ex2["配置2: 用户数据 + CRC"]
           Ex3["配置3: 块头 + 用户数据"]
           Ex4["配置4: 块头 + 用户数据 + CRC"]
       end
   ```

### RAM block

> **RAM 块**是 NVRAM 管理器中的基本存储对象，代表 RAM 中由**用户数据**、**可选 CRC 校验值**和**可选块头**组成的内存区域。它是 NvM 管理数据在 RAM 中的缓存副本。



1. 核心定义 [SWS_NvM_00126]

   RAM 块是 NvM 模块中的**基本存储对象**，包含以下组成部分：

   | 组成部分       | 是否必选 | 说明                                            |
   | -------------- | -------- | ----------------------------------------------- |
   | **用户数据**   | ✅ 必选   | 应用层访问的数据，与 NV 块中的用户数据对应      |
   | **CRC 校验值** | 可选     | 用于数据完整性校验，与对应 NV 块的 CRC 配置关联 |
   | **块头**       | 可选     | 包含块的元信息，与对应 NV 块的块头配置关联      |

2. RAM 块的逻辑结构

   ```mermaid
   flowchart TD
       subgraph RAMBlock [RAM 块]
           direction TB
           
           subgraph Optional [可选部分]
               Header[块头<br/>可选]
               CRC[CRC 校验值<br/>可选]
           end
           
           UserData[用户数据<br/>必选]
       end
       
       Header --> UserData
       UserData --> CRC
       
       Note1["逻辑结构与 NV 块保持一致<br/>便于数据交换"]
   ```

   

3.  CRC 使用限制 [SWS_NvM_00127]

   RAM 块的 CRC 使用受到以下限制：

   | 限制条件     | 说明                                                |
   | ------------ | --------------------------------------------------- |
   | **前提条件** | 仅当对应的 NV 块也配置了 CRC 时，RAM 块才能使用 CRC |
   | **类型一致** | RAM 块的 CRC 类型必须与对应 NV 块的 CRC 类型相同    |

   ```mermaid
   flowchart LR
       subgraph NVBlock [NV 块]
           NV_Data[用户数据]
           NV_CRC[CRC<br/>可选]
       end
       
       subgraph RAMBlock [RAM 块]
           RAM_Data[用户数据]
           RAM_CRC[CRC<br/>可选]
       end
       
       NV_Data <-.-> RAM_Data
       NV_CRC -.->|类型必须一致| RAM_CRC
       
       Note["如果 NV 块有 CRC<br/>则 RAM 块也必须有 CRC<br/>且类型相同"]
   ```

4. 用户数据区的独立性 [SWS_NvM_00129]

   > RAM 块的**用户数据区**可以与 RAM 块的**状态区**位于不同的 RAM 地址位置（不同的全局数据段）。

   | 区域           | 说明                                  | 位置独立性     |
   | -------------- | ------------------------------------- | -------------- |
   | **用户数据区** | 存储实际的应用数据                    | 可独立配置地址 |
   | **状态区**     | 存储 RAM 块的状态信息（如是否已修改） | 可独立配置地址 |

5. 数据访问的可见性 [SWS_NvM_00130]

   > RAM 块的数据区应**同时可被** NVRAM 管理器和**应用层**访问。

   ```mermaid
   flowchart LR
       subgraph Access [数据访问]
           RAM[RAM 块<br/>数据区]
       end
       
       NvM[NVRAM 管理器] --> RAM
       App[应用层<br/>SWC] --> RAM
   ```

   **双向访问的含义**：

   | 访问方向            | 操作           | 典型场景                 |
   | ------------------- | -------------- | ------------------------ |
   | **应用层 → RAM 块** | 写入/修改数据  | 应用更新校准参数或学习值 |
   | **RAM 块 → 应用层** | 读取数据       | 应用读取配置参数         |
   | **NvM → RAM 块**    | 从 NV 加载数据 | 启动时恢复存储的数据     |
   | **RAM 块 → NvM**    | 写回 NV        | 数据变化后持久化存储     |

6. 用户数据的类型 [SWS_NvM_00373]

   > RAM 块的数据应包含**永久分配**或**临时分配**的用户数据。

   ```mermaid
   flowchart TD
       UserData[RAM 块用户数据] --> Permanent[永久分配<br/>Permanently Assigned]
       UserData --> Temporary[临时分配<br/>Temporarily Assigned]
       
       Permanent --> KnownAddr[配置时地址已知<br/>SWS_NvM_00370]
       Temporary --> UnknownAddr[配置时地址未知<br/>运行时传递<br/>SWS_NvM_00372]
   ```

7. 永久分配 [SWS_NvM_00370]

   > 对于永久分配的用户数据，RAM 块数据的地址在**配置时已知**。

   | 特性             | 说明                           |
   | ---------------- | ------------------------------ |
   | **地址确定时机** | 配置阶段（编译时/链接时）      |
   | **地址传递方式** | 通过配置参数静态指定           |
   | **典型场景**     | 全局变量、静态分配的数据缓冲区 |

8. 临时分配 [SWS_NvM_00372]

   > 对于临时分配的用户数据，RAM 块数据的地址在**配置时未知**，需要在**运行时**传递给 NvM 模块。

   | 特性             | 说明                                   |
   | ---------------- | -------------------------------------- |
   | **地址确定时机** | 运行时动态确定                         |
   | **地址传递方式** | 通过 API 参数传递                      |
   | **典型场景**     | 动态分配的数据块、栈上分配的临时缓冲区 |

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant RAM as RAM 块数据区
   
       App->>App: 运行时分配/获取数据缓冲区地址
       App->>NvM: 调用 NvM_WriteBlock(地址参数)
       NvM->>RAM: 使用传入的地址访问数据
       NvM-->>App: 操作完成
   ```

9. RAM 块地址分配约束 [SWS_NvM_00088]

   > 每个 RAM 块可以在全局 RAM 区域中**无地址约束**地分配。所有配置的 RAM 块**不需要**位于连续的地址空间中。

   | 特性           | 说明                                |
   | -------------- | ----------------------------------- |
   | **地址约束**   | 无约束，可在任意地址分配            |
   | **地址连续性** | 不需要连续，可分散在 RAM 的不同区域 |
   | **灵活性**     | 编译器/链接器可自由优化内存布局     |

   ```mermaid
   flowchart LR
       subgraph RAM [全局 RAM 区域]
           direction TB
           Block1[RAM 块 1<br/>地址 A]
           Block2[RAM 块 2<br/>地址 C]
           Block3[RAM 块 3<br/>地址 X]
           Other[其他数据]
       end
       
       Note["块之间可以不连续<br/>任意顺序排列"]
   ```

10. 对齐说明

    > NvM 模块不支持对齐，可通过**配置管理**实现对齐需求，即通过添加填充（Padding）来扩大块长度以满足对齐要求。

    | 概念             | 说明                   |
    | ---------------- | ---------------------- |
    | **NvM 对齐支持** | 不支持自动对齐         |
    | **解决方案**     | 配置时手动添加填充字节 |
    | **操作方法**     | 将块长度扩大到对齐边界 |

11. RAM 块与 NV 块的对比

    | 特性           | RAM 块                 | NV 块                    |
    | -------------- | ---------------------- | ------------------------ |
    | **存储介质**   | RAM（易失性）          | EEPROM/Flash（非易失性） |
    | **访问速度**   | 快                     | 慢                       |
    | **数据持久性** | 掉电丢失               | 掉电保留                 |
    | **CRC 限制**   | 必须与 NV 块一致       | 独立配置                 |
    | **地址分配**   | 运行时确定或配置时确定 | 由下层模块管理           |
    | **主要用途**   | 运行时数据缓存         | 数据持久化存储           |

12. 逻辑结构图

    ```mermaid
    flowchart TD
        subgraph RAMBlock [RAM 块]
            direction TB
            
            UserData[用户数据<br/>必选<br/>可被 NvM 和应用访问]
            
            subgraph OptionalRAM [可选部分]
                Header[块头<br/>可选<br/>需与 NV 块对应]
                CRC[CRC 校验值<br/>可选<br/>必须与 NV 块类型一致]
            end
        end
        
        subgraph Location [地址特性]
            Perm[永久分配<br/>配置时地址已知]
            Temp[临时分配<br/>运行时地址传递]
            NoConstraint[无地址约束<br/>可不连续]
        end
        
        UserData --> Location
    ```

    

RAM 块的典型生命周期

```mermaid
sequenceDiagram
    participant App as 应用层
    participant NvM as NvM 模块
    participant RAM as RAM 块
    participant NV as NV 块

    Note over App,NV: 启动时：从 NV 加载到 RAM
    NvM->>NV: 读取数据
    NV-->>NvM: 返回数据
    NvM->>RAM: 写入 RAM 块

    Note over App,NV: 运行时：应用读写 RAM
    App->>RAM: 读取/修改数据

    Note over App,NV: 写回：将 RAM 数据写回 NV
    NvM->>RAM: 读取 RAM 数据
    NvM->>NV: 写入 NV 块
```

### ROM Block

> **ROM 块**是 NVRAM 管理器中的基本存储对象，位于 ROM（通常指代码所在的 Flash）中，用于在 NV 块**为空**或**损坏**时提供**默认数据**，作为数据恢复的兜底机制。

1. 核心定义 [SWS_NvM_00020]

   ROM 块是 NvM 模块中的**基本存储对象**，具有以下特征：

   | 特征         | 说明                             |
   | ------------ | -------------------------------- |
   | **存储位置** | ROM（通常为代码 Flash）          |
   | **数据特性** | 只读，运行时不可修改             |
   | **核心用途** | 为空的或损坏的 NV 块提供默认数据 |
   | **角色定位** | 数据恢复的最后一道防线           |

2. ROM 块在数据恢复流程中的位置

   ```mermaid
   flowchart TD
       Start[读取 NV 块] --> Check1{NV 块<br/>有效？}
       
       Check1 -->|有效| ReadNV[使用 NV 块数据]
       Check1 -->|无效/损坏| Check2{ROM 块<br/>存在？}
       
       Check2 -->|存在| UseROM[使用 ROM 块数据<br/>作为默认值]
       Check2 -->|不存在| Error[返回错误/使用零值]
       
       UseROM --> Optional[可选：将默认数据<br/>写入 NV 块进行恢复]
       
       ReadNV --> Done[完成]
       Optional --> Done
       Error --> Done
   ```

   

3. 典型使用场景

   | 场景             | 说明                                            |
   | ---------------- | ----------------------------------------------- |
   | **首次上电**     | NV 块从未被写入过，ROM 块提供出厂默认配置       |
   | **数据损坏**     | NV 块 CRC 校验失败，ROM 块提供备用数据          |
   | **存储介质故障** | EEPROM/Flash 物理损坏，ROM 块确保 ECU 仍可工作  |
   | **版本回退**     | 当 NV 块数据版本不兼容时，使用 ROM 块中的默认值 |

4. ROM 块与 NV 块、RAM 块的关系

   ```mermaid
   flowchart LR
       subgraph Storage [存储层次]
           ROM[ROM 块<br/>默认数据<br/>只读]
           NV[NV 块<br/>运行时数据<br/>可读写]
           RAM[RAM 块<br/>运行时的数据副本<br/>可读写]
       end
       
       ROM -->|提供默认数据<br/>用于恢复| NV
       NV -->|加载到| RAM
       RAM -->|写回| NV
       
       Note1["ROM 块只作为数据来源<br/>不会被 NvM 修改"]
   ```

   | 关系             | 说明                                        |
   | ---------------- | ------------------------------------------- |
   | **ROM → NV**     | 当 NV 块无效时，NvM 将 ROM 数据复制到 NV 块 |
   | **NV → RAM**     | 正常启动时，NV 数据加载到 RAM 供应用使用    |
   | **ROM 不可修改** | NvM 不会向 ROM 块写入任何数据               |

5. 典型配置示例

   ```mermaid
   flowchart LR
       subgraph Config [配置关系]
           ROMBlock[ROM 块<br/>默认数据]
           NVBlock[NV 块<br/>运行时数据]
       end
       
       ROMBlock -->|块 ID 关联| NVBlock
       NVBlock -->|数据长度一致| ROMBlock
       NVBlock -->|数据结构相同| ROMBlock
   ```

### Administrative Block

> **管理块**是位于 RAM 中的一个特殊存储对象，用于管理数据集 NV 块的**块索引**，以及存储对应 NVRAM 块的**属性/错误/状态信息**。它对应用层不可见，专供 NvM 内部使用。

1. 核心定义 [SWS_NvM_00134]

   管理块是 NvM 模块内部使用的 RAM 数据结构，包含以下内容：

   | 组成部分     | 说明                                         |
   | ------------ | -------------------------------------------- |
   | **块索引**   | 与数据集 NV 块关联使用，用于定位具体的数据集 |
   | **属性信息** | 如写保护状态等                               |
   | **错误信息** | 最近一次操作产生的错误码                     |
   | **状态信息** | RAM 块的有效/无效状态                        |

2. 管理块的位置与可见性 [SWS_NvM_00135]

   | 特性               | 说明                            |
   | ------------------ | ------------------------------- |
   | **存储位置**       | RAM                             |
   | **对应用层可见性** | ❌ **不可见**，仅供 NvM 内部使用 |
   | **用途**           | 安全和内部管理目的              |

   > 应用层（SWC）无法直接访问管理块，这是 NvM 模块的**私有数据结构**。

3. 状态信息：RAM 块的有效性 [SWS_NvM_00128]

   NvM 使用**永久 RAM 块**或 **RAM 镜像**的状态信息来确定 RAM 块用户数据的有效性。

   | 状态值             | 含义                                      | [SWS_NvM_00132] |
   | ------------------ | ----------------------------------------- | --------------- |
   | **有效 (Valid)**   | RAM 块的数据区数据有效，可被应用读取/使用 |                 |
   | **无效 (Invalid)** | RAM 块的数据区数据无效，不可使用          |                 |

   **有效值的判断规则 [SWS_NvM_00133]** ：

   | 状态     | 表示方式                   |
   | -------- | -------------------------- |
   | **有效** | 使用一个特定的预定义值表示 |
   | **无效** | 除"有效"值以外的所有其他值 |

   > 这样的设计保证了一个比特位的误翻转不会意外导致状态从"无效"变为"有效"（只有精确匹配特定值才被识别为有效）。

4. 属性信息：写保护管理 [SWS_NvM_00054]

   NvM 使用**属性字段**来管理 NV 块的写保护，用于保护/解除保护 NV 块的数据区。

   ```mermaid
   flowchart LR
       subgraph NVBlock [NV 块]
           Data[数据区]
           Protection[写保护状态]
       end
       
       Protection -->|受保护| ReadOnly[❌ 不可写入]
       Protection -->|未保护| Writable[✅ 可写入]
   ```

   **写保护的应用场景**：

   | 场景             | 说明                           |
   | ---------------- | ------------------------------ |
   | **关键参数保护** | 防止运行时意外修改关键校准数据 |
   | **启动阶段锁定** | 特定阶段完成后锁定配置数据     |
   | **安全策略**     | 与功能安全相关的数据保护       |

5. 错误/状态字段 [SWS_NvM_00136]

   NvM 使用**错误/状态字段**来管理最近一次请求的执行结果。

   | 信息类型   | 用途                                                   |
   | ---------- | ------------------------------------------------------ |
   | **错误码** | 记录最近一次操作失败的原因（如写入失败、CRC 错误等）   |
   | **状态值** | 记录最近一次操作的执行状态（如进行中、已完成、超时等） |

6. 管理块的逻辑结构

   ```mermaid
   flowchart TD
       subgraph AdminBlock [管理块]
           direction TB
           
           subgraph Index [块索引]
               DatasetIndex[数据集索引<br/>用于关联 Dataset NV 块]
           end
           
           subgraph Status [状态信息]
               RamValid[RAM 块有效/无效标志]
           end
           
           subgraph Attribute [属性信息]
               WriteProtect[写保护状态]
           end
           
           subgraph Error [错误/状态]
               LastError[最近错误码]
               LastStatus[最近操作状态]
           end
       end
   ```

7. 管理块与 NVRAM 块的关系

   ```mermaid
   flowchart LR
       subgraph NVRAMBlock [NVRAM 块]
           NV[NV 块]
           RAM[RAM 块]
           Admin[管理块]
       end
       
       subgraph Management [管理关系]
           Admin -->|管理| NV
           Admin -->|管理| RAM
           Admin -->|包含| Index[数据集索引]
           Admin -->|记录| Error[错误状态]
           Admin -->|记录| Status[有效性状态]
       end
   ```

8. 管理块的状态机

   ```mermaid
   stateDiagram-v2
       [*] --> 初始化: 系统启动
       
       初始化 --> 检查RAM状态
       
       检查RAM状态 --> RAM有效: 状态 = 有效
       检查RAM状态 --> RAM无效: 状态 ≠ 有效
       
       RAM有效 --> 正常运行: 应用可访问数据
       
       RAM无效 --> 从NV加载: 触发读取
       
       从NV加载 --> 加载成功: NV 数据有效
       从NV加载 --> 加载失败: NV 数据无效
       
       加载成功 --> RAM有效: 更新状态为有效
       加载失败 --> 使用ROM默认值: 回退机制
       
       使用ROM默认值 --> RAM有效: 加载默认值
       
       正常运行 --> 写入操作: 应用修改数据
       写入操作 --> 写回NV: 触发同步
       写回NV --> 更新状态: 记录错误/状态
   ```

### NV Block Header

> **NV 块头**是 NV 块开头的可选元数据区域。当**静态块标识符**机制启用时，NV 块头必须位于 NV 块的**最前面**。

1. 核心定义 [SWS_NvM_00522]

   当启用静态块标识符机制时，NV 块头必须作为 NV 块的**第一个字段**出现。

   ```mermaid
   flowchart LR
       subgraph NVBlock [NV 块布局]
           direction LR
           Header[NV 块头<br/>必须位于最前面]
           UserData[用户数据]
           CRC[CRC 校验值<br/>可选]
       end
       
       Header --> UserData
       UserData --> CRC
   ```

2. 功能目的

   **静态块标识符**的核心价值在于：

   | 特性           | 说明                                               |
   | -------------- | -------------------------------------------------- |
   | **块 ID 固化** | 将块标识符存储在 NV 块内部（而非仅由上层配置管理） |
   | **健壮性增强** | 即使配置丢失或更新，仍可通过块头中的 ID 识别数据   |
   | **调试友好**   | 直接从存储内容即可识别块身份                       |

   **启用静态块标识符时，块头通常包含**：

   | 字段         | 说明                         |
   | ------------ | ---------------------------- |
   | **块 ID**    | 唯一标识该 NV 块的编号       |
   | **版本号**   | 数据格式版本，用于兼容性检查 |
   | **长度**     | 块数据长度信息               |
   | **状态标记** | 写入状态、有效性标记等       |

3. NV 块的整体布局

   ```mermaid
   flowchart TD
       subgraph NVBlock [NV 块完整布局]
           direction TB
           
           subgraph Optional [可选部分]
               Header["块头<br/>(静态块 ID 启用时必选)"]
               CRC["CRC 校验值<br/>(可选)"]
           end
           
           UserData["用户数据<br/>(必选)"]
       end
       
       Header --> UserData
       UserData --> CRC
       
       Note["注意：图中为逻辑布局，<br/>实际物理布局可能受对齐影响"]
   ```

   

4. 静态块 ID 机制启用时的完整数据流

   ```mermaid
   flowchart LR
       subgraph Write [写入流程]
           W1[应用请求写入] --> W2[NvM 构建 NV 块数据]
           W2 --> W3["包含块头<br/>(含静态块 ID)"]
           W3 --> W4[写入底层存储]
       end
       
       subgraph Read [读取流程]
           R1[应用请求读取] --> R2[NvM 从底层读取 NV 块]
           R2 --> R3[解析块头<br/>验证静态块 ID]
           R3 --> R4{ID 匹配?}
           R4 -->|匹配| R5[返回有效数据]
           R4 -->|不匹配| R6[数据无效/使用默认值]
       end
   ```

## 块管理类型

> NvM 模块支持三种 NVRAM 存储块类型：**原生块**、**冗余块**和**数据集块**。每种类型由不同的基本存储对象组合而成，以满足不同的可靠性、灵活性和存储需求。

1. 支持的块类型总览 [SWS_NvM_00137]

   | 块类型       | 宏定义                | 典型用途                        |
   | ------------ | --------------------- | ------------------------------- |
   | **原生块**   | `NVM_BLOCK_NATIVE`    | 标准数据存储，单份拷贝          |
   | **冗余块**   | `NVM_BLOCK_REDUNDANT` | 高可靠性数据，双份拷贝          |
   | **数据集块** | `NVM_BLOCK_DATASET`   | 多版本/多配置数据，通过索引选择 |

2. 各类型的存储对象组成

   1. 原生块 (Native Block) [SWS_NvM_00557]

      > 最基础的块类型，一份 NV 数据对应一个 RAM 副本。

      | 基本存储对象 | 数量  | 说明                 |
      | ------------ | ----- | -------------------- |
      | **NV 块**    | 1     | 一份非易失性存储副本 |
      | **RAM 块**   | 1     | 一个 RAM 缓存副本    |
      | **ROM 块**   | 0 ~ 1 | 可选默认数据         |
      | **管理块**   | 1     | 内部状态管理         |

      ```mermaid
      flowchart LR
          subgraph Native [原生块 NVM_BLOCK_NATIVE]
              NV1[NV 块<br/>1个]
              RAM1[RAM 块<br/>1个]
              ROM1[ROM 块<br/>0~1个]
              Admin1[管理块<br/>1个]
          end
      ```

   2. 冗余块 (Redundant Block) [SWS_NvM_00558]

      > 为高可靠性场景设计，NV 层保存**两份独立副本**，提供数据冗余保护。

      | 基本存储对象 | 数量  | 说明                     |
      | ------------ | ----- | ------------------------ |
      | **NV 块**    | **2** | **两份**非易失性存储副本 |
      | **RAM 块**   | 1     | 一个 RAM 缓存副本        |
      | **ROM 块**   | 0 ~ 1 | 可选默认数据             |
      | **管理块**   | 1     | 内部状态管理             |

      ```mermaid
      flowchart LR
          subgraph Redundant [冗余块 NVM_BLOCK_REDUNDANT]
              NV2a[NV 块 副本0<br/>1个]
              NV2b[NV 块 副本1<br/>1个]
              RAM2[RAM 块<br/>1个]
              ROM2[ROM 块<br/>0~1个]
              Admin2[管理块<br/>1个]
          end
          
          NV2a <-.->|冗余| NV2b
      ```

      

   3. 数据集块 (Dataset Block) [SWS_NvM_00559]

      > 为多配置/多版本场景设计，一个 RAM 块可以对应**多个 NV 块**，通过索引动态切换。

      | 基本存储对象 | 数量              | 说明                                     |
      | ------------ | ----------------- | ---------------------------------------- |
      | **NV 块**    | **1 ~ (m < 256)** | 多个数据集副本，数量由配置决定           |
      | **RAM 块**   | 1                 | 一个 RAM 缓存副本（当前选中的数据集）    |
      | **ROM 块**   | 0 ~ n             | 可选默认数据                             |
      | **管理块**   | 1                 | 包含数据集索引，用于选择当前活跃的数据集 |

      > **数据集数量上限**：由配置参数 `NvMDatasetSelectionBits` 决定，最多不超过 255 个（m < 256）。

      ```mermaid
      flowchart LR
          subgraph Dataset [数据集块 NVM_BLOCK_DATASET]
              NV3a[NV 块 数据集0]
              NV3b[NV 块 数据集1]
              NV3c[NV 块 数据集2]
              NV3d[...]
              RAM3[RAM 块<br/>1个<br/>当前选中]
              ROM3[ROM 块<br/>0~n个]
              Admin3[管理块<br/>包含数据集索引]
          end
          
          Admin3 -->|索引选择| RAM3
          RAM3 <--> NV3a
          RAM3 <--> NV3b
          RAM3 <--> NV3c
      ```

3. 三种块类型对比总览

   | 特性           | 原生块       | 冗余块           | 数据集块          |
   | -------------- | ------------ | ---------------- | ----------------- |
   | **NV 块数量**  | 1            | 2                | 1 ~ 255           |
   | **RAM 块数量** | 1            | 1                | 1                 |
   | **ROM 块数量** | 0 ~ 1        | 0 ~ 1            | 0 ~ n             |
   | **管理块数量** | 1            | 1                | 1（含数据集索引） |
   | **数据可靠性** | 标准         | **高（双备份）** | 标准              |
   | **存储开销**   | 低           | **高（2倍）**    | 中至高            |
   | **典型场景**   | 常规配置数据 | 安全关键数据     | 多模式/多标定数据 |

4. 块类型选择决策流程图

   ```mermaid
   flowchart TD
       Start[选择 NVRAM 块类型] --> Q1{是否需要<br/>多份数据副本?}
       
       Q1 -->|是，需要冗余备份| Redundant[冗余块]
       Q1 -->|否| Q2{是否需要存储<br/>多套不同数据?}
       
       Q2 -->|是，不同配置/版本| Dataset[数据集块]
       Q2 -->|否，单份数据即可| Native[原生块]
       
       Native --> NativeDesc[基础存储<br/>1 NV + 1 RAM]
       Redundant --> RedundantDesc[高可靠性<br/>2 NV + 1 RAM]
       Dataset --> DatasetDesc[多配置支持<br/>多 NV + 1 RAM]
   ```

   

5. 配置参数速查

   | 参数                      | 适用类型 | 说明                         |
   | ------------------------- | -------- | ---------------------------- |
   | `NvMDatasetSelectionBits` | 数据集块 | 决定数据集数量上限 = 2^N - 1 |
   | `NvMNvBlockNum`           | 所有类型 | NVRAM 块编号                 |
   | `NvMNvBlockBaseNumber`    | 数据集块 | 块基编号                     |
   | `NvMBlockManagementType`  | 所有类型 | 选择块管理类型               |

6. 性能影响

   | 块类型   | 写入性能          | 读取性能       | 存储开销 |
   | -------- | ----------------- | -------------- | -------- |
   | 原生块   | 快                | 快             | 低       |
   | 冗余块   | **慢（2次写入）** | 快（但有校验） | **高**   |
   | 数据集块 | 与原生相同        | 与原生相同     | 中~高    |

7. 三种块类型与存储对象的关系总结

   | 存储对象 | 原生块 | 冗余块 | 数据集块    |
   | -------- | ------ | ------ | ----------- |
   | NV 块    | 1      | 2      | 1~255       |
   | RAM 块   | 1      | 1      | 1           |
   | ROM 块   | 0~1    | 0~1    | 0~n         |
   | 管理块   | 1      | 1      | 1（含索引） |

### NVRAM 块结构

> **NVRAM 块**是 NvM 模块管理的最高层级存储对象，由**必选**的基本存储对象（NV 块、RAM 块、管理块）和**可选**的 ROM 块组合而成。其组成在配置时通过 **NVRAM 块描述符**固定。

1. 核心定义

   1. NVRAM 块的组成 [SWS_NvM_00138]

      NVRAM 块由以下基本存储对象组成：

      | 组成对象   | 必选/可选            | 说明                                 |
      | ---------- | -------------------- | ------------------------------------ |
      | **NV 块**  | ✅ 必选               | 非易失性存储（EEPROM/Flash）         |
      | **RAM 块** | ✅ 必选               | RAM 中的运行时数据副本               |
      | **管理块** | ✅ 必选               | 内部状态管理（索引、状态、错误码等） |
      | **ROM 块** | 可选 [SWS_NvM_00139] | 默认数据（用于恢复空/损坏的 NV 块）  |

      ```mermaid
      flowchart TD
          subgraph NVRAMBlock [NVRAM 块]
              direction TB
              
              subgraph Mandatory [必选部分]
                  NV[NV 块]
                  RAM[RAM 块]
                  Admin[管理块]
              end
              
              subgraph Optional [可选部分]
                  ROM[ROM 块<br/>SWS_NvM_00139]
              end
          end
          
          NV <--> RAM
          Admin -->|管理| NV
          Admin -->|管理| RAM
          ROM -->|提供默认值| NV
      ```

   2. 组成固定性 [SWS_NvM_00140]

      > 任何 NVRAM 块的组合在**配置时**通过对应的 **NVRAM 块描述符**固定，**运行时不可更改**。

      | 特性         | 说明                    |
      | ------------ | ----------------------- |
      | **固定时机** | 配置阶段（编译/生成时） |
      | **定义方式** | NVRAM 块描述符          |
      | **运行时**   | 组合固定，不可动态变更  |

2. 地址偏移规则 [SWS_NvM_00141]

   > 所有地址偏移都是相对于 NVRAM 块描述符中 RAM 或 ROM 的**起始地址**给出的，起始地址被假定为 **0**。

   ```mermaid
   flowchart LR
       subgraph Descriptor [NVRAM 块描述符]
           Start[起始地址 = 0]
           RAM_Offset[RAM 偏移量]
           ROM_Offset[ROM 偏移量]
       end
       
       RAM_Offset --> RAM_Base[RAM 基地址]
       ROM_Offset --> ROM_Base[ROM 基地址]
       
       Note["设备特定的基地址或偏移<br/>由相应的设备驱动程序在需要时添加"]
   ```

   **关键点**：

   | 概念             | 说明                                         |
   | ---------------- | -------------------------------------------- |
   | **相对地址**     | 描述符中的地址是相对于块起始地址的偏移量     |
   | **起始地址假定** | 块起始地址视为 0                             |
   | **物理地址计算** | 设备驱动会根据需要加上设备特定的基地址或偏移 |

3. 完整结构示意图

   ```mermaid
   flowchart TD
       subgraph NVRAM_Block [NVRAM 块]
           direction TB
           
           subgraph Mandatory2 [必选基本存储对象]
               NV2[NV 块<br/>用户数据 + 可选 CRC + 可选块头]
               RAM2[RAM 块<br/>用户数据 + 可选 CRC + 可选块头]
               Admin2[管理块<br/>数据集索引 + 状态/错误/属性]
           end
           
           subgraph Optional2 [可选基本存储对象]
               ROM2[ROM 块<br/>默认数据]
           end
           
           NV2 <-->|数据同步| RAM2
           Admin2 -->|管理| NV2
           Admin2 -->|管理| RAM2
           ROM2 -->|恢复/初始化| NV2
       end
   ```

   

4. 三种块管理类型的实例化对比

   | 块管理类型   | NV 块 | RAM 块 | 管理块            | ROM 块 |
   | ------------ | ----- | ------ | ----------------- | ------ |
   | **原生块**   | 1     | 1      | 1                 | 0~1    |
   | **冗余块**   | 2     | 1      | 1                 | 0~1    |
   | **数据集块** | 1~255 | 1      | 1（含数据集索引） | 0~n    |

   ```mermaid
   flowchart LR
       subgraph Native [原生块]
           NV1[NV]
           RAM1[RAM]
           Admin1[管理]
           ROM1[ROM<br/>可选]
       end
       
       subgraph Redundant [冗余块]
           NV2a[NV 0]
           NV2b[NV 1]
           RAM2[RAM]
           Admin2[管理]
           ROM2[ROM<br/>可选]
       end
       
       subgraph Dataset [数据集块]
           NV3a[NV 数据集0]
           NV3b[NV 数据集1]
           NV3c[NV ...]
           RAM3[RAM]
           Admin3[管理<br/>含索引]
           ROM3[ROM<br/>可选]
       end
   ```

5. 数据流示意

   ```mermaid
   flowchart LR
       subgraph App [应用层]
           SWC[软件组件]
       end
       
       subgraph NvM [NvM 模块]
           NVRAM[NVRAM 块]
           RAM[RAM 块]
           Admin[管理块]
           NV[NV 块]
           ROM[ROM 块]
       end
       
       subgraph HW [硬件层]
           EEPROM[EEPROM/Flash]
       end
       
       SWC -->|读写| RAM
       RAM -->|同步| NV
       NV <--> EEPROM
       Admin -->|管理| RAM
       Admin -->|管理| NV
       ROM -->|初始化/恢复| NV
   ```

6. 与基本存储对象的关系总结

   | 层级       | 对象              | 角色                           |
   | ---------- | ----------------- | ------------------------------ |
   | **最高层** | NVRAM 块          | 完整存储单元，由基本对象组成   |
   | **中间层** | NV/RAM/ROM/管理块 | 基本存储对象，各自承担不同职责 |
   | **底层**   | 物理存储介质      | EEPROM/Flash/RAM               |

### NVRAM 块描述符表

> **NVRAM 块描述符表**是 NvM 模块内部的核心数据结构，在配置阶段生成并存放于 ROM（Flash）中。应用层通过 **块 ID** 在 API 中指定要操作的 NVRAM 块，NvM 通过该表查找对应块的描述符信息。



1. 块 ID 选择机制 [SWS_NvM_00069]

   > 通过 NvM 模块 API 操作单个 NVRAM 块时，通过提供一个**后续分配的块 ID** 来选择目标块。

   **关键点**：

   | 概念         | 说明                                                  |
   | ------------ | ----------------------------------------------------- |
   | **块 ID**    | 每个 NVRAM 块在配置时被分配的唯一标识符               |
   | **传递方式** | 作为 API 参数传入（如 `NvM_ReadBlock(BlockID, ...)`） |
   | **用途**     | 在运行时唯一标识一个 NVRAM 块                         |

   ```c
   // 示例：通过块 ID 调用 NvM API
   NvM_ReadBlock(NVM_BLOCK_ID_CALIBRATION, &data_buffer);
   ```

2. 描述符表的生成 [SWS_NvM_00143]

   > 所有与 NVRAM 块描述符表相关的结构及其在 ROM（Flash）中的地址，都必须在 NvM 模块**配置时生成**。

   | 特性         | 说明                        |
   | ------------ | --------------------------- |
   | **生成时机** | 配置阶段（编译/代码生成时） |
   | **存放位置** | ROM（Flash）                |
   | **内容**     | 所有 NVRAM 块的描述符信息   |
   | **运行时**   | 只读访问，不可修改          |

   ```mermaid
   flowchart LR
       subgraph Config [配置阶段]
           Tool[配置工具] --> |生成| Table[NVRAM 块描述符表]
           Table --> |存放于| ROM[ROM / Flash]
       end
       
       subgraph Runtime [运行时]
           App[应用层] -->|传入 Block ID| API[NvM API]
           API -->|查表| ROM
           ROM -->|返回描述符| API
       end
   ```

3. NVRAM 块描述符的典型内容

   每个 NVRAM 块描述符通常包含以下信息：

   ```mermaid
   flowchart TD
       subgraph Descriptor [NVRAM 块描述符]
           BlockID[块 ID<br/>唯一标识]
           BlockType[块管理类型<br/>原生/冗余/数据集]
           NV_Info[NV 块信息<br/>地址/大小/CRC配置]
           RAM_Info[RAM 块信息<br/>地址/大小]
           ROM_Info[ROM 块信息<br/>地址/大小/是否存在]
           Admin_Info[管理块信息<br/>数据集索引位宽/状态]
           Protection[保护属性<br/>写保护等]
       end
   ```

4. 块 ID 与描述符表的映射关系

   ```mermaid
   flowchart LR
       subgraph API [NvM API 调用]
           Input[块 ID]
       end
       
       subgraph DescriptorTable [NVRAM 块描述符表]
           Entry1[块 ID = 0<br/>描述符 0]
           Entry2[块 ID = 1<br/>描述符 1]
           Entry3[块 ID = 2<br/>描述符 2]
           EntryN[...]
       end
       
       subgraph Result [查找结果]
           Descriptor[对应块的描述符]
           RAM[RAM 地址]
           NV[NV 地址]
           Type[块类型]
           CRC[CRC 配置]
       end
       
       Input -->|索引| Entry2
       Entry2 --> Descriptor
       Descriptor --> RAM
       Descriptor --> NV
       Descriptor --> Type
       Descriptor --> CRC
   ```

   

5. 描述符表的作用

   ```mermaid
   flowchart TD
       subgraph Roles [描述符表的作用]
           Mapping[块 ID → 块属性映射]
           Config[集中管理所有块配置]
           Dispatch[运行时 API 路由]
       end
   ```

### 原生 NVRAM 块

> **原生 NVRAM 块**是最简单的块管理类型。它允许以最小的开销进行 NV 存储的写入和读取。



1. 核心定义 [SWS_NvM_00000]

   原生 NVRAM 块由以下基本存储对象组成：

   | 组成对象   | 数量        | 说明                   |
   | ---------- | ----------- | ---------------------- |
   | **NV 块**  | 1           | 非易失性存储副本       |
   | **RAM 块** | 1           | RAM 中的运行时数据副本 |
   | **管理块** | 1           | 内部状态管理           |
   | **ROM 块** | 0~1（可选） | 默认数据（用于恢复）   |

   ```mermaid
   flowchart LR
       subgraph NativeBlock [原生 NVRAM 块]
           direction LR
           NV[NV 块<br/>1个]
           RAM[RAM 块<br/>1个]
           Admin[管理块<br/>1个]
           ROM[ROM 块<br/>0~1个<br/>可选]
       end
       
       NV <-->|同步| RAM
       Admin -->|管理| NV
       Admin -->|管理| RAM
       ROM -->|初始化/恢复| NV
   ```

2. 结构图

   ```mermaid
   flowchart TD
       subgraph NativeNVRAM [原生 NVRAM 块]
           direction TB
           
           subgraph Mandatory [必选部分]
               NV_Block[NV 块<br/>用户数据 + 可选 CRC]
               RAM_Block[RAM 块<br/>用户数据 + 可选 CRC]
               Admin_Block[管理块<br/>状态/错误/属性]
           end
           
           subgraph Optional [可选部分]
               ROM_Block[ROM 块<br/>默认数据]
           end
       end
       
       ROM_Block -.->|可选| NV_Block
   ```

3. 数据流

   ```mermaid
   flowchart LR
       subgraph App [应用层]
           SWC[软件组件]
       end
       
       subgraph Native [原生 NVRAM 块]
           RAM[RAM 块]
           Admin[管理块]
           NV[NV 块]
           ROM[ROM 块<br/>可选]
       end
       
       subgraph HW [硬件]
           Storage[EEPROM/Flash]
       end
       
       SWC -->|读取/写入| RAM
       RAM -->|同步| NV
       Admin -->|管理| RAM
       Admin -->|管理| NV
       NV <--> Storage
       ROM -->|初始化/恢复| NV
   ```

4. 操作流程

   ```mermaid
   flowchart LR
       subgraph Read [读取流程]
           R1[应用调用 NvM_ReadBlock] --> R2{RAM 块<br/>有效?}
           R2 -->|有效| R3[直接返回 RAM 数据]
           R2 -->|无效| R4[从 NV 块加载数据到 RAM]
           R4 --> R5[标记 RAM 块为有效]
           R5 --> R3
       end
       
       subgraph Write [写入流程]
           W1[应用调用 NvM_WriteBlock] --> W2[更新 RAM 块数据]
           W2 --> W3[标记 RAM 块为已修改]
           W3 --> W4[NvM_MainFunction 中<br/>写回 NV 块]
           W4 --> W5[标记 RAM 块为未修改]
       end
   ```

   

### 冗余 NVRAM 块

> 在原生 NVRAM 块的基础上，**冗余 NVRAM 块**提供了增强的**容错能力**、**可靠性**和**可用性**。它通过维护两份 NV 副本，提高了对数据损坏的抵抗能力。



1. 核心定义 [SWS_NvM_00001]

   冗余 NVRAM 块由以下基本存储对象组成：

   | 组成对象   | 数量        | 说明                       |
   | ---------- | ----------- | -------------------------- |
   | **NV 块**  | **2**       | 两份独立的非易失性存储副本 |
   | **RAM 块** | 1           | RAM 中的运行时数据副本     |
   | **管理块** | 1           | 内部状态管理               |
   | **ROM 块** | 0~1（可选） | 默认数据（用于恢复）       |

   ```mermaid
   flowchart LR
       subgraph RedundantBlock [冗余 NVRAM 块]
           direction LR
           NV0[NV 块<br/>副本 0]
           NV1[NV 块<br/>副本 1]
           RAM[RAM 块<br/>1个]
           Admin[管理块<br/>1个]
           ROM[ROM 块<br/>0~1个<br/>可选]
       end
       
       NV0 <-->|冗余| NV1
       NV0 <--> RAM
       NV1 <--> RAM
       Admin -->|管理| NV0
       Admin -->|管理| NV1
       Admin -->|管理| RAM
       ROM -->|初始化/恢复| NV0
       ROM -->|初始化/恢复| NV1
   ```

   

2. 逻辑结构图

   ```mermaid
   flowchart TD
       subgraph RedundantNVRAM [冗余 NVRAM 块]
           direction TB
           
           subgraph NV_Blocks [两份 NV 块]
               NV0[NV 块 副本 0<br/>用户数据 + 可选 CRC]
               NV1[NV 块 副本 1<br/>用户数据 + 可选 CRC]
           end
           
           subgraph RAM_Block [RAM 块]
               RAM[RAM 块<br/>用户数据 + 可选 CRC]
           end
           
           subgraph Admin_Block [管理块]
               Admin[管理块<br/>状态/错误/属性]
           end
           
           subgraph ROM_Block [可选 ROM 块]
               ROM[ROM 块<br/>默认数据]
           end
       end
       
       NV0 <--> NV1
       NV0 <--> RAM
       NV1 <--> RAM
       Admin -->|管理| NV0
       Admin -->|管理| NV1
       Admin -->|管理| RAM
       ROM -.->|可选| NV0
       ROM -.->|可选| NV1
   ```

   

3. 冗余恢复机制 [SWS_NvM_00531]

   > 当与冗余 NVRAM 块关联的某一个 NV 块被判定为**无效**时（如在读取期间），NvM 应尝试使用**未损坏的 NV 块**中的数据来恢复无效的 NV 块。

   ```mermaid
   flowchart TD
       Read[读取请求] --> Check0{副本 0<br/>有效?}
       
       Check0 -->|有效| Check1{副本 1<br/>有效?}
       Check0 -->|无效| Check1
       
       Check1 -->|有效| BothValid[两份副本均有效<br/>正常使用]
       Check1 -->|无效| OneValid[只有一份副本有效]
       
       OneValid --> Recover[尝试恢复]
       Recover --> Recovery{恢复<br/>成功?}
       
       Recovery -->|成功| Recovered[恢复成功<br/>冗余重新建立]
       Recovery -->|失败| ReportDEM[报告 DEM<br/>NVM_E_LOSS_OF_REDUNDANCY]
       
       BothValid --> Done[完成]
       Recovered --> Done
       ReportDEM --> Done
   ```

   

4. 错误报告 [SWS_NwM_00546]

   > 如果恢复失败，应使用错误码 **`NVM_E_LOSS_OF_REDUNDANCY`** 向 **DEM**（诊断事件管理器）报告。

   **错误码说明**：

   | 错误码                     | 含义     | 触发条件                                     |
   | -------------------------- | -------- | -------------------------------------------- |
   | `NVM_E_LOSS_OF_REDUNDANCY` | 冗余丢失 | 两份 NV 副本中有一份损坏，且无法用另一份恢复 |

   > **注意**："恢复"指的是**重新建立冗余**，通常意味着将恢复后的数据**写回到无效的 NV 块**中。

5. 正常读写场景

   ```mermaid
   flowchart LR
       subgraph Read [读取场景]
           R1[应用请求读取] --> R2[读取 NV 副本 0]
           R2 --> R3[读取 NV 副本 1]
           R3 --> R4{两者一致?}
           R4 -->|是| R5[返回数据到 RAM]
           R4 -->|否| R6[触发恢复机制]
           R6 --> R5
       end
       
       subgraph Write [写入场景]
           W1[应用请求写入] --> W2[更新 RAM 块]
           W2 --> W3[写入 NV 副本 0]
           W3 --> W4[写入 NV 副本 1]
           W4 --> W5[更新完成]
       end
   ```

   

6. 时序图

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant NV0 as NV 块 副本0
       participant NV1 as NV 块 副本1
       participant DEM as DEM
   
       App->>NvM: 读取请求
       
       par 并行读取
           NvM->>NV0: 读取副本 0
           NvM->>NV1: 读取副本 1
       end
       
       NV0-->>NvM: 数据 (有效)
       NV1-->>NvM: ❌ 数据损坏 (无效)
       
       NvM->>NvM: 检测到副本1无效
       NvM->>NvM: 尝试使用副本0恢复副本1
       
       alt 恢复成功
           NvM->>NV1: 写入恢复的数据
           NV1-->>NvM: 写入成功
           NvM->>App: 返回有效数据
           Note over NvM,DEM: 冗余重新建立
       else 恢复失败
           NvM->>DEM: 报告 NVM_E_LOSS_OF_REDUNDANCY
           NvM->>App: 返回有效数据 (仅来自副本0)
           Note over NvM,DEM: 冗余丢失，需要上层处理
       end
   ```

### 数据集 NVRAM 块

> **数据集 NVRAM 块**是由多个等大小的数据块（NV/ROM）组成的**数组**。应用在任意时刻只能访问其中的**一个**元素。



1. 核心定义 [SWS_NvM_00006]

   数据集 NVRAM 块由以下基本存储对象组成：

   | 组成对象                | 数量               | 说明                                 |
   | ----------------------- | ------------------ | ------------------------------------ |
   | **NV 块（含用户数据）** | 多个               | 每个数据集一个 NV 块                 |
   | **CRC 区域**            | 可选（每个 NV 块） | 数据完整性校验                       |
   | **NV 块头**             | 可选（每个 NV 块） | 静态块标识符等元信息                 |
   | **RAM 块**              | 1                  | 当前选中的数据集的运行时副本         |
   | **管理块**              | 1                  | 包含数据集索引，指向当前选中的数据集 |

   ```mermaid
   flowchart LR
       subgraph DatasetBlock [数据集 NVRAM 块]
           direction LR
           subgraph NVBlocks [NV 块数组]
               NV0[NV 块 数据集0]
               NV1[NV 块 数据集1]
               NV2[NV 块 数据集2]
               NVN[NV 块 ...]
           end
           
           RAM[RAM 块<br/>当前选中]
           Admin[管理块<br/>数据集索引]
           ROM[ROM 块<br/>可选默认数据集]
       end
       
       Admin -->|索引选择| RAM
       RAM <--> NV0
       RAM <--> NV1
       RAM <--> NV2
       ROM -.->|只读| RAM
   ```

2. 数据集索引 [SWS_NvM_00144]

   > 数据集的索引位置通过对应的管理块中的**独立字段**来记录。

   ```mermaid
   flowchart LR
       subgraph AdminBlock [管理块]
           Index[数据集索引<br/>当前选中]
           Status[状态/错误/属性]
       end
       
       Index -->|指向| Dataset[选中的数据集]
   ```

   

3. 读写操作限制

   1. 读取 [SWS_NvM_00374]

      NvM 模块应能够**读取所有已分配的 NV 块**。

   2. 写入 [SWS_NvM_00375]

      > NvM 模块**仅当写保护被禁用时**，才能写入所有已分配的 NV 块。

      ```mermaid
      flowchart TD
          Write[写入请求] --> Check{写保护<br/>禁用?}
          Check -->|是| Allow[允许写入所有 NV 块]
          Check -->|否| Deny[❌ 禁止写入]
      ```

      

4. ROM 块作为数据集 [SWS_NvM_00146]

   > 如果 ROM 块被选为可选部分，用于选择数据集的**索引范围会扩展到 ROM**，使得选择 ROM 块而非 NV 块成为可能。索引覆盖所有构成 NVRAM 数据集块的 NV/ROM 块。

   ```mermaid
   flowchart LR
       subgraph IndexSpace [索引空间]
           direction LR
           NV_Index[NV 索引区]
           ROM_Index[ROM 索引区<br/>扩展]
       end
       
       NV_Index --> NV_Blocks[NV 块<br/>可读写]
       ROM_Index --> ROM_Blocks[ROM 块<br/>只读]
   ```

   | 块类型     | 访问权限                 | 说明         |
   | ---------- | ------------------------ | ------------ |
   | **NV 块**  | 可读写                   | 需写保护禁用 |
   | **ROM 块** | **只读** [SWS_NvM_00376] | 默认数据集   |

5. ROM 块的写入行为 [SWS_NvM_00377]

   > NvM 模块对 ROM 块的写入应如同对**受保护的 NV 块**的写入一样处理——即**写入被拒绝**。

   ```mermaid
   flowchart TD
       Write[写入请求] --> Target{目标块类型?}
       Target -->|NV 块| NVWrite[写入 NV 块]
       Target -->|ROM 块| ROMWrite[❌ 视为受保护块<br/>写入被拒绝]
   ```

   

6. 数据集数量限制 [SWS_NvM_00444]

   > 配置的数据集总数（**NV 块 + ROM 块**）应在 **1 ~ 255** 范围内。

   | 约束       | 说明                |
   | ---------- | ------------------- |
   | **最小值** | 1（至少一个数据集） |
   | **最大值** | 255（8 位索引限制） |

7. NV 块与 ROM 块的索引分配 [SWS_NvM_00445]

   > 当配置了可选的 ROM 块时，索引分配如下：

   | 索引范围                                                 | 块类型          | 访问权限 |
   | -------------------------------------------------------- | --------------- | -------- |
   | **0 ~ (NvMNvBlockNum - 1)**                              | NV 块（含 CRC） | 可读写   |
   | **NvMNvBlockNum ~ (NvMNvBlockNum + NvMRomBlockNum - 1)** | ROM 块          | **只读** |

   ```mermaid
   flowchart LR
       subgraph IndexMap [索引映射]
           direction LR
           I0[索引 0]
           I1[索引 1]
           I2[索引 ...]
           IN[NvMNvBlockNum - 1]
           IR0[NvMNvBlockNum]
           IR1[NvMNvBlockNum + 1]
           IRN[NvMNvBlockNum + NvMRomBlockNum - 1]
       end
       
       I0 --> NV0[NV 块 0]
       I1 --> NV1[NV 块 1]
       I2 --> NVN[NV 块 ...]
       IN --> NVLast[NV 块 N-1]
       
       IR0 --> ROM0[ROM 块 0<br/>只读]
       IR1 --> ROM1[ROM 块 1<br/>只读]
       IRN --> ROMLast[ROM 块 N-1<br/>只读]
   ```

8. 逻辑结构图

   ```mermaid
   flowchart TD
       subgraph DatasetNVRAM [数据集 NVRAM 块]
           direction TB
           
           subgraph NVArray [NV 块数组]
               NV0[NV 块 数据集 0<br/>用户数据 + 可选 CRC]
               NV1[NV 块 数据集 1<br/>用户数据 + 可选 CRC]
               NV2[NV 块 数据集 2<br/>用户数据 + 可选 CRC]
           end
           
           subgraph ROMArray [ROM 块数组<br/>可选]
               ROM0[ROM 块 数据集 N<br/>只读默认值]
               ROM1[ROM 块 数据集 N+1<br/>只读默认值]
           end
           
           RAM[RAM 块<br/>当前选中的数据]
           Admin[管理块<br/>数据集索引]
       end
       
       Admin -->|索引选择| RAM
       RAM <--> NV0
       RAM <--> NV1
       RAM <--> NV2
       ROM0 -.->|只读| RAM
       ROM1 -.->|只读| RAM
   ```

9. 数据集切换流程

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant Admin as 管理块
       participant RAM as RAM 块
       participant NV as NV 块
   
       App->>Admin: 设置数据集索引 = 1
       Admin->>RAM: 通知切换
       
       RAM->>NV: 从 NV 块 1 加载数据
       NV-->>RAM: 返回数据
       
       RAM-->>App: 数据就绪
       App->>RAM: 读写数据
       
       Note over RAM: 后续操作针对<br/>当前选中的数据集
   ```

###  API 配置类别

> 为了将 NvM 模块适配到不同硬件资源限制的系统，定义了**三个 API 配置类别**。每个类别提供不同数量的 API 调用，从功能最全到最小集，以适应从高配到低配的各类 MCU 平台。



1. 设计目的 [SWS_NvM_00149]

   | 配置类别   | 设计目标                    | 适用场景               |
   | ---------- | --------------------------- | ---------------------- |
   | **类别 3** | 支持所有 API 调用，功能最全 | 资源充足的系统         |
   | **类别 2** | 提供中等数量的 API 调用     | 资源适中的系统         |
   | **类别 1** | 仅提供最小必需的 API 集     | 硬件资源极度受限的系统 |

   ```mermaid
   flowchart TD
       Class3[类别 3<br/>功能最全] -->|裁剪| Class2[类别 2<br/>功能适中] -->|裁剪| Class1[类别 1<br/>功能最小]
       
       Class3 -->|适用| High[高配 MCU<br/>大 RAM/Flash]
       Class2 -->|适用| Mid[中配 MCU<br/>资源适中]
       Class1 -->|适用| Low[低配 MCU<br/>资源极度受限]
   ```

2. API 分类说明

   规范将 API 分为四种类型（Type 1~4），各类别按需组合：

   | 类型       | 说明                                 |
   | ---------- | ------------------------------------ |
   | **Type 1** | 块管理和控制 API（索引、保护、状态） |
   | **Type 2** | 单块读写操作 API                     |
   | **Type 3** | 批量操作 API（所有块）               |
   | **Type 4** | 模块初始化 API                       |

3. 各类别的 API 列表

   1. 类别 3（功能最全）[SWS_NvM_00560]

      | 类型       | API                              | 功能说明              |
      | ---------- | -------------------------------- | --------------------- |
      | **Type 1** | `NvM_SetDataIndex()`             | 设置数据集索引        |
      |            | `NvM_GetDataIndex()`             | 获取当前数据集索引    |
      |            | `NvM_SetBlockProtection()`       | 设置块写保护          |
      |            | `NvM_GetErrorStatus()`           | 获取错误状态          |
      |            | `NvM_SetRamBlockStatus()`        | 设置 RAM 块有效状态   |
      |            | `NvM_SetBlockLockStatus()`       | 设置块锁定状态        |
      | **Type 2** | `NvM_ReadBlock()`                | 读取单个块            |
      |            | `NvM_WriteBlock()`               | 写入单个块            |
      |            | `NvM_RestoreBlockDefaults()`     | 恢复块默认值          |
      |            | `NvM_EraseNvBlock()`             | 擦除 NV 块            |
      |            | `NvM_InvalidateNvBlock()`        | 将 NV 块标记为无效    |
      |            | `NvM_CancelJobs()`               | 取消所有待处理作业    |
      |            | `NvM_ReadPRAMBlock()`            | 读取永久 RAM 块       |
      |            | `NvM_WritePRAMBlock()`           | 写入永久 RAM 块       |
      |            | `NvM_RestorePRAMBlockDefaults()` | 恢复永久 RAM 块默认值 |
      | **Type 3** | `NvM_ReadAll()`                  | 读取所有块            |
      |            | `NvM_WriteAll()`                 | 写入所有块            |
      |            | `NvM_CancelWriteAll()`           | 取消写所有操作        |
      |            | `NvM_ValidateAll()`              | 验证所有块            |
      |            | `NvM_FirstInitAll()`             | 所有块首次初始化      |
      | **Type 4** | `NvM_Init()`                     | 模块初始化            |

   2. 类别 2（功能适中）[SWS_NvM_00561]

      | 类型       | API                              | 与类别 3 的差异        |
      | ---------- | -------------------------------- | ---------------------- |
      | **Type 1** | `NvM_SetDataIndex()`             | ✅ 保留                 |
      |            | `NvM_GetDataIndex()`             | ✅ 保留                 |
      |            | `NvM_GetErrorStatus()`           | ✅ 保留                 |
      |            | `NvM_SetRamBlockStatus()`        | ✅ 保留                 |
      |            | `NvM_SetBlockLockStatus()`       | ✅ 保留                 |
      |            | ~~`NvM_SetBlockProtection()`~~   | ❌ **移除**             |
      | **Type 2** | `NvM_ReadBlock()`                | ✅ 保留                 |
      |            | `NvM_WriteBlock()`               | ✅ 保留                 |
      |            | `NvM_RestoreBlockDefaults()`     | ✅ 保留                 |
      |            | `NvM_CancelJobs()`               | ✅ 保留                 |
      |            | `NvM_ReadPRAMBlock()`            | ✅ 保留                 |
      |            | `NvM_WritePRAMBlock()`           | ✅ 保留                 |
      |            | `NvM_RestorePRAMBlockDefaults()` | ✅ 保留                 |
      |            | ~~`NvM_EraseNvBlock()`~~         | ❌ **移除**             |
      |            | ~~`NvM_InvalidateNvBlock()`~~    | ❌ **移除**             |
      | **Type 3** | `NvM_ReadAll()`                  | ✅ 保留                 |
      |            | `NvM_WriteAll()`                 | ✅ 保留                 |
      |            | `NvM_CancelWriteAll()`           | ✅ 保留                 |
      |            | `NvM_ValidatedAll()`             | ✅ 保留（拼写略有不同） |
      |            | ~~`NvM_FirstInitAll()`~~         | ❌ **移除**             |
      | **Type 4** | `NvM_Init()`                     | ✅ 保留                 |

   3. 类别 1（功能最小）[SWS_NvM_00562]

      | 类型       | API                        | 说明                                                         |
      | ---------- | -------------------------- | ------------------------------------------------------------ |
      | **Type 1** | `NvM_GetErrorStatus()`     | 获取错误状态                                                 |
      |            | `NvM_SetRamBlockStatus()`  | 设置 RAM 块状态（仅当 `NvMSetRamBlockStatusApi` 启用时可用） |
      |            | `NvM_SetBlockLockStatus()` | 设置块锁定状态                                               |
      |            | ~~`NvM_SetDataIndex()`~~   | ❌ 移除                                                       |
      |            | ~~`NvM_GetDataIndex()`~~   | ❌ 移除                                                       |
      | **Type 2** | —                          | **完全移除**                                                 |
      | **Type 3** | `NvM_ReadAll()`            | 读取所有块                                                   |
      |            | `NvM_WriteAll()`           | 写入所有块                                                   |
      |            | `NvM_CancelWriteAll()`     | 取消写所有操作                                               |
      | **Type 4** | `NvM_Init()`               | 模块初始化                                                   |

      **类别 1 特殊限制**：

      | 限制               | 说明                                             |
      | ------------------ | ------------------------------------------------ |
      | **无队列**         | 不支持作业队列，所有操作必须等待完成             |
      | **无立即写入**     | 不支持立即数据写入                               |
      | **不支持数据集块** | `NVM_BLOCK_DATASET` 类型不被支持 [SWS_NvM_00365] |

4. 三类 API 配置对比总览

   ```mermaid
   flowchart LR
       subgraph Class3 [类别 3 功能最全]
           T1_3[Type 1: 6 个 API]
           T2_3[Type 2: 9 个 API]
           T3_3[Type 3: 5 个 API]
           T4_3[Type 4: 1 个 API]
       end
       
       subgraph Class2 [类别 2 功能适中]
           T1_2[Type 1: 5 个 API]
           T2_2[Type 2: 7 个 API]
           T3_2[Type 3: 4 个 API]
           T4_2[Type 4: 1 个 API]
       end
       
       subgraph Class1 [类别 1 功能最小]
           T1_1[Type 1: 2~3 个 API]
           T2_1[Type 2: 无]
           T3_1[Type 3: 3 个 API]
           T4_1[Type 4: 1 个 API]
       end
   ```

5. 代码裁剪 [SWS_NvM_00150]

   > NvM 模块应**仅包含处理已配置块类型所需的代码**。

   ```mermaid
   flowchart TD
       Config[配置阶段] --> Type{配置的<br/>块类型?}
       
       Type -->|原生块| GenNative[生成原生块代码]
       Type -->|冗余块| GenRedundant[生成冗余块代码]
       Type -->|数据集块| GenDataset[生成数据集块代码]
       
       GenNative --> Build[链接最终可执行文件]
       GenRedundant --> Build
       GenDataset --> Build
       
       Build --> Result[仅包含必要代码<br/>最小化资源占用]
   ```

6. 选择指南

   | 考虑因素                      | 推荐类别    |
   | ----------------------------- | ----------- |
   | **功能完整性要求高**          | 类别 3      |
   | **需要单块读写 + 批量操作**   | 类别 2      |
   | **仅需批量操作 + 最小代码量** | 类别 1      |
   | **RAM/Flash 资源极度受限**    | 类别 1      |
   | **需要使用数据集块**          | 类别 2 或 3 |
   | **需要写保护和擦除功能**      | 类别 3      |

## 扫描顺序/优先级方案

> NvM 模块支持**基于优先级的作业处理**机制。通过配置参数启用后，系统使用两个独立队列分别处理**紧急写入作业**和**其他作业**；禁用时则回退为**先来先服务**顺序。

1. 优先级支持 [SWS_NvM_00032]

   > NvM 模块应支持**基于优先级的作业处理**。

2. 优先级启用/禁用 [SWS_NvM_00564]

   > 通过配置参数 `NvMJobPrioritization` 启用或禁用基于优先级的作业处理。

   ```mermaid
   flowchart TD
       Config{配置参数<br/>NvMJobPrioritization}
       
       Config -->|启用| Priority[优先模式]
       Config -->|禁用| FCFS[先来先服务模式]
       
       Priority --> Queue[双队列机制]
       FCFS --> Single[单队列<br/>无紧急写入支持]
   ```

3. 双队列机制（优先级模式）[SWS_NvM_00378]

   > 启用优先级模式时，NvM 使用**两个队列**：
   >
   > - **队列 1**：紧急写入作业（崩溃数据/即时写入）
   > - **队列 2**：所有其他作业（包括即时读取、擦除等）

   ```mermaid
   flowchart LR
       subgraph PriorityMode [优先级模式 - 双队列]
           direction TB
           Q1[队列 1: 紧急写入作业<br/>Immediate Write Jobs<br/>最高优先级]
           Q2[队列 2: 其他作业<br/>读取/擦除/普通写入]
       end
       
       Q1 -->|优先处理| CPU[作业处理]
       Q2 -->|排队等待| CPU
   ```

   | 队列             | 包含作业类型                   | 优先级 |
   | ---------------- | ------------------------------ | ------ |
   | **紧急写入队列** | 崩溃数据、强制立即持久化的数据 | **高** |
   | **普通队列**     | 常规读取、写入、擦除作业       | 低     |

4. 先来先服务模式（优先级禁用）[SWS_NvM_00379]

   > 如果通过配置禁用基于优先级的作业处理：
   >
   > - NvM **不支持紧急写入作业**
   > - 所有作业按 **先来先服务** 顺序处理

   ```mermaid
   flowchart LR
       Job1[作业 A<br/>先到达] --> Process1[先处理]
       Job2[作业 B<br/>后到达] --> Process2[后处理]
       Job3[作业 C<br/>最后到达] --> Process3[最后处理]
   ```

5. 批量操作的队列长度 [SWS_NvM_00380]

   > 来自 `NvM_ReadAll`、`NvM_ValidateAll`、`NvM_FirstInitAll` 和 `NvM_WriteAll` 的**多块请求**，其队列长度固定为 **1**（即同一时刻只有一个多块作业在队列中）。

   | 批量 API             | 队列长度 |
   | -------------------- | -------- |
   | `NvM_ReadAll()`      | 1        |
   | `NvM_ValidateAll()`  | 1        |
   | `NvM_FirstInitAll()` | 1        |
   | `NvM_WriteAll()`     | 1        |

6. 批量操作的不可中断性

   1. ReadAll 不可中断 [SWS_NvM_00381]

      > NvM 模块**不应被其他请求中断**来自 `NvM_ReadAll` 的作业。

   2. WriteAll 不可中断 [SWS_NvM_00567]

      > NvM 模块**不应被其他请求中断**来自 `NvM_WriteAll` 的作业。

      ```mermaid
      flowchart LR
          ReadAll[ReadAll 作业执行中] --> Other[其他请求到来]
          Other --> Queue[排队等待]
          ReadAll --> Complete[完成后执行队列中的请求]
      ```

7. 唯一例外：紧急写入可抢占 [SWS_NvM_00381 注释]

   > **唯一例外**：具有**紧急优先级**的写入作业可以抢占正在运行的读/写作业。被抢占的作业随后会被 NvM 恢复/重新启动 [SWS_NvM_00182]。

   ```mermaid
   flowchart TD
       Running[正在执行的作业<br/>ReadAll/WriteAll/单块] --> Emerg[紧急写入请求到达]
       Emerg --> Preempt[抢占当前作业]
       Preempt --> Execute[执行紧急写入]
       Execute --> Resume[恢复/重新启动<br/>被抢占的作业]
   ```

8. 排队行为（非抢占）

   1. ReadAll 期间的其他请求

      | 请求类型     | 行为                     | 规范            |
      | ------------ | ------------------------ | --------------- |
      | **读取请求** | 排队，ReadAll 完成后执行 | [SWS_NvM_00568] |
      | **写入请求** | 排队，ReadAll 完成后执行 | [SWS_NvM_00725] |

   2. WriteAll 期间的其他请求

      | 请求类型     | 行为                      | 规范            |
      | ------------ | ------------------------- | --------------- |
      | **写入请求** | 排队，WriteAll 完成后执行 | [SWS_NvM_00569] |
      | **读取请求** | 排队，WriteAll 完成后执行 | [SWS_NvM_00726] |

      ```mermaid
      flowchart LR
          subgraph ReadAll [ReadAll 执行中]
              R1[读取请求到达] --> Queue1[排队]
              W1[写入请求到达] --> Queue1
          end
          
          subgraph After [ReadAll 完成后]
              Queue1 --> Process[依次执行队列中的请求]
          end
      ```

9. WriteAll 取消 [SWS_NvM_00238]

   > `NvM_WriteAll` 请求可通过调用 `NvM_CancelWriteAll` 中止。此时，**当前块会被完整处理**，但不再写入后续块。

   ```mermaid
   flowchart LR
       WriteAll[WriteAll 执行中] --> Cancel[调用 CancelWriteAll]
       Cancel --> Current[当前块继续处理完毕]
       Current --> Stop[停止后续块写入]
   ```

10. 请求出队 [SWS_NvM_00378 注释]

    > 如果请求因对应的 NVRAM 块操作完成而变得**过时**，允许将其**从队列中移除**。

11. 抢占后恢复 [SWS_NvM_00570]

    > 被抢占的作业应由 NvM 模块随后**恢复或重新启动**。此行为适用于**单块请求**和**多块请求**。

    ```mermaid
    flowchart TD
        Running[正在执行作业 A] --> Preempted[被紧急写入抢占]
        Preempted --> Store[保存作业 A 的上下文]
        Store --> Emerg[执行紧急写入]
        Emerg --> Resume[恢复/重新启动作业 A]
    ```

12. 优先级模式 vs 非优先级模式

    | 特性             | 优先级模式（启用）   | 非优先级模式（禁用） |
    | ---------------- | -------------------- | -------------------- |
    | **队列数量**     | 2（紧急写入 + 其他） | 1                    |
    | **紧急写入支持** | ✅ 支持               | ❌ 不支持             |
    | **调度方式**     | 紧急写入优先         | 先来先服务           |
    | **抢占**         | ✅ 支持               | ❌ 不支持             |

# 一般行为

## 功能需求

1. 异步通知 [SWS_NvM_00383]

   > 对于每个异步请求，是否在作业完成后调用通知回调应是**可配置**的选项。

   | 配置选项     | 行为                                   |
   | ------------ | -------------------------------------- |
   | **启用通知** | 作业完成后回调调用者                   |
   | **禁用通知** | 作业完成后无回调，调用者需主动查询状态 |

2. 回调接口 [SWS_NvM_00384]

   > NvM 模块应提供**回调接口** [SWS_NvM_00113]。

3. 环境访问限制

   > NvM 模块的环境应**仅通过 NvM 模块访问非易失性存储器**。除 NvM 模块外，**不允许任何模块**直接访问非易失性存储器。

   ```mermaid
   flowchart LR
       subgraph Allowed [✅ 允许]
           App[应用层] --> NvM[NvM 模块]
           NvM --> HW[非易失性存储器]
       end
       
       subgraph Forbidden [❌ 禁止]
           App2[应用层] -.->|直接访问| HW2[非易失性存储器]
           Other[其他模块] -.->|直接访问| HW2
       end
   ```

4. 隐式访问方式 [SWS_NvM_00038]

   > NvM 模块仅提供一种**隐式**访问 NVRAM 和共享内存（RAM）中块的方式。即 NvM 模块在 NVRAM 和 RAM 之间进行**整块拷贝**（一个或多个块）。

   ```mermaid
   flowchart LR
       subgraph ImplicitAccess [隐式访问]
           NVRAM[NVRAM] -->|拷贝| RAM[RAM]
           RAM -->|拷贝| NVRAM
       end
   ```

5. 应用直接访问 [SWS_NvM_00692]

   > 应用在遵守给定限制（如同步机制）的前提下，**直接访问 RAM 数据**。

   ```mermaid
   flowchart LR
       App[应用层] -->|直接读写| RAM[RAM 块数据]
       RAM -.->|后台同步| NVRAM[NVRAM]
   ```

6. 队列管理

   1. 去重排队 [SWS_NvM_00385]

      > 如果具有特定 ID 的块尚未在队列中或正在处理中，NvM 模块应将所有异步的"单块"读取/写入/控制请求**加入队列**（考虑多任务限制）。

      ```mermaid
      flowchart TD
          Request[单块请求到达] --> Check{该块ID<br/>已在队列中?}
          Check -->|是| Reject[拒绝/忽略]
          Check -->|否| Check2{该块ID<br/>正在处理中?}
          Check2 -->|是| Reject
          Check2 -->|否| Queue[加入队列]
      ```

   2. 多请求接受 [SWS_NvM_00386]

      > 只要不发生**队列溢出**，NvM 模块应接受多个异步"单块"请求。

   3. 串行化处理 [SWS_NvM_00155]

      > 最高优先级的请求由 NvM 模块从队列中取出，并按**串行顺序**处理。

      ```mermaid
      flowchart LR
          subgraph Queue [队列]
              Q1[请求 A<br/>高优先级]
              Q2[请求 B]
              Q3[请求 C]
          end
          
          Q1 -->|取出| Process[串行处理]
          Process -->|完成| Q2
          Process -->|完成| Q3
      ```

7. 一致性/完整性检查 [SWS_NvM_00040]

   > NvM 模块应实现用于检查 NV 内存中保存数据的**一致性/完整性**的隐式机制 [SWS_NvM_00165]。

8. 中断上下文

   > 根据内存堆栈的实现，NvM 模块提供和/或调用的回调例程可能在**中断上下文**中被调用。因此，NvM 模块必须确保其运行时间**合理短暂**。

   ```mermaid
   flowchart LR
       ISR[中断服务例程] --> Callback[NvM 回调]
       Callback --> Requirement[要求: 执行时间尽可能短]
   ```

9. 默认数据与首次初始化 [SWS_NvM_00085]

   > 如果配置时**没有可用的默认 ROM 数据**或**未定义 NvMInitBlockCallback 回调**，则应由**应用层负责提供默认初始化数据**。此时，应用必须使用 `NvM_GetErrorStatus()` 来区分**首次初始化**和**数据损坏**两种场景。

   ```mermaid
   flowchart TD
       Init[初始化请求] --> Check{ROM 默认数据<br/>或回调可用?}
       
       Check -->|是| Auto[由 NvM 自动加载默认数据]
       Check -->|否| AppResponsible[应用层负责提供默认值]
       
       AppResponsible --> GetStatus[使用 NvM_GetErrorStatus（）]
       GetStatus --> FirstInit[首次初始化: 提供默认值]
       GetStatus --> Corrupted[数据损坏: 使用默认值并记录错误]
   ```

10. ReadAll 中的检测机制

    1. 校验和检测 [SWS_NvM_00387]

       > 在处理 `NvM_ReadAll` 期间，NvM 模块应能够通过执行**校验和计算**来检测损坏的 RAM 数据 [ECUC_NvM_00476]。

    2. 无效数据检测 [SWS_NvM_00226]

       > 在处理 `NvM_ReadAll` 期间，NvM 模块应能够通过测试管理块中数据的有效性来检测无效的 RAM 数据 [ECUC_NvM_00476]。

11. ReadAll 中的错误恢复 [SWS_NvM_00388]

    > 在启动阶段和 `NvM_ReadAll` 正常运行期间，如果 NvM 模块检测到 NV 块中存在**不可恢复错误**，NvM 模块应将**默认数据**（如果已配置）复制到对应的 RAM 块中。

    ```mermaid
    flowchart TD
        ReadAll[NvM_ReadAll 处理] --> Check{检测到<br/>不可恢复错误?}
        Check -->|否| Normal[正常完成]
        Check -->|是| HasDefault{配置了<br/>ROM 默认数据?}
        
        HasDefault -->|是| Copy[将默认数据复制到 RAM 块]
        Copy --> Continue[继续处理]
        HasDefault -->|否| Error[返回错误状态]
    ```

12. OS 服务使用 [SWS_NvM_00332]

    > 为了使用 OS 服务，NvM 模块应**仅使用 BSW 调度器**，而不直接使用 OS 对象和/或相关 OS 服务。

    ```mermaid
    flowchart LR
        NvM[NvM 模块] -->|✅ 使用| Scheduler[BSW 调度器]
        Scheduler -->|访问| OS[操作系统]
        
        NvM -.->|❌ 禁止| Direct[直接调用 OS API/对象]
        Direct -.-> OS
    ```

13. 未对齐处理 [SWS_NvM_00985]

    > NvM 模块应将**内部镜像**作为缓冲区，用于所有读取和写入已配置**永久 RAM**（或通过 API 参数传入的 RAM）的 NVRAM 块的 RAM 块的操作，且这些 RAM（起始地址）**未对齐到 `NvMBufferAlignmentValue`**。

    ```mermaid
    flowchart TD
        Op[NvM 读写操作] --> Check{RAM 起始地址<br/>对齐到 NvMBufferAlignmentValue?}
        
        Check -->|对齐| Direct[直接操作 RAM 块]
        Check -->|未对齐| Mirror[使用内部镜像作为缓冲区]
        
        Mirror --> Copy[在镜像和实际 RAM 之间拷贝数据]
    ```

    



## NVRAM 管理器启动

> NvM 模块的启动分为两个阶段：**初始化**（`NvM_Init`）和 **数据加载**（`NvM_ReadAll`）。`NvM_Init` 仅完成模块内部数据结构初始化，不涉及具体 NVRAM 块的数据加载；数据加载由后续的 `NvM_ReadAll` 请求触发。**所有启动相关请求均由 BSW 模式管理器专用**。

1. NvM_Init 调用者 [SWS_NvM_00693]

   > `NvM_Init` 应**专由 BSW 模式管理器**调用。

   ```mermaid
   flowchart LR
       BswM[BSW 模式管理器] -->|专有调用| NvM_Init[NvM_Init]
       Other[其他模块] -.->|❌ 禁止调用| NvM_Init
   ```

2. 初始化与数据加载分离 [SWS_NvM_00091] [SWS_NvM_00158]

   > 由于 ECU 启动时间存在严格限制，`NvM_Init` 请求**不应包含**已配置 NVRAM 块的初始化。RAM 数据块的初始化由另一请求 `NvM_ReadAll` 完成。

   ```mermaid
   flowchart LR
       subgraph Startup [NvM 启动流程]
           Phase1[NvM_Init<br/>初始化内部数据结构<br/>不加载块数据]
           Phase2[NvM_ReadAll<br/>加载所有 RAM 数据块]
       end
   ```

3. 底层驱动初始化 [SWS_NvM_00157]

   > `NvM_Init` 请求**不负责**触发底层驱动和内存硬件抽象的初始化。这也由 **BSW 模式管理器**处理。

   ```mermaid
   flowchart LR
       BswM[BSW 模式管理器] -->|触发| Driver[底层驱动初始化]
       BswM -->|触发| NvM_Init[NvM_Init]
       NvM_Init -.->|不负责| Driver
   ```

   

4. NvM_ReadAll 调用者 [SWS_NvM_00158]

   `NvM_ReadAll` 应**专由 BSW 模式管理器**调用。

5. 启动状态监控 [SWS_NvM_00694]

   > 使用 NvM 模块的软件组件负责检查 NvM 模块启动产生的全局错误/状态信息。BSW 模式管理器通过以下方式获取启动结果：

   | 方式         | 说明                                      |
   | ------------ | ----------------------------------------- |
   | **轮询**     | 使用 `NvM_GetErrorStatus(块 ID = 0)` 查询 |
   | **回调通知** | 配置 `NvM_MultiBlockCallback`             |

   **启动状态值**：

   | 状态值            | 含义       |
   | ----------------- | ---------- |
   | `NVM_REQ_PENDING` | 启动进行中 |
   | `NVM_REQ_OK`      | 启动成功   |
   | `NVM_REQ_NOT_OK`  | 启动失败   |

   ```mermaid
   flowchart TD
       Start[NvM_ReadAll 执行中] --> Poll{轮询状态}
       
       Poll --> Pending[状态: NVM_REQ_PENDING<br/>继续等待]
       Poll --> OK[状态: NVM_REQ_OK<br/>启动成功]
       Poll --> NotOK[状态: NVM_REQ_NOT_OK<br/>启动失败]
       
       Pending -->|周期性查询| Poll
   ```

6. 提前启动 SWC（通过回调）

   > 如果为 `NvM_ReadAll` 中处理的每个 NVRAM 块配置了回调，RTE 可利用这些回调**提前启动**软件组件（如 SWC）。

   ```mermaid
   flowchart LR
       NvM_ReadAll -->|处理块 A| CallbackA[块 A 回调] --> StartSWC_A[启动 SWC A]
       NvM_ReadAll -->|处理块 B| CallbackB[块 B 回调] --> StartSWC_B[启动 SWC B]
       NvM_ReadAll -->|处理块 C| CallbackC[块 C 回调] --> StartSWC_C[启动 SWC C]
   ```

7. DEM 早期就绪（通过块 ID 顺序）

   > 为确保 DEM 在早期完全就绪（即其 NV 数据恢复到 RAM），**与 DEM 相关的 NVRAM 块应配置为低 ID**，以便在 `NvM_ReadAll` 中被优先处理。

   ```mermaid
   flowchart LR
       subgraph PriorityOrder [块处理顺序]
           LowID["低 ID 块<br/>(DEM 相关)"]
           MidID["中 ID 块"]
           HighID["高 ID 块"]
       end
       
       LowID -->|优先| Early[早期完成]
       MidID -->|其次| Normal
       HighID -->|最后| Late
   ```

8. 数据集索引的持久化 [SWS_NvM_00160]

   > NvM 模块**不会自动以持久化方式**存储当前使用的数据集索引。

   | 责任方       | 职责                                             |
   | ------------ | ------------------------------------------------ |
   | **软件组件** | 负责使用 `NvM_SetDataIndex()` 设置正确的索引位置 |
   | **软件组件** | 负责使用 `NvM_GetDataIndex()` 获取当前索引位置   |
   | **软件组件** | 可将当前索引位置存储在一个独立的 NVRAM 块中      |

   ```mermaid
   flowchart TD
       SWC[软件组件] -->|启动时| GetIndex[NvM_GetDataIndex<br/>获取当前索引]
       SWC -->|切换数据集| SetIndex[NvM_SetDataIndex<br/>设置新索引]
       SWC -->|持久化| Store[将索引存储到<br/>独立的 NVRAM 块]
   ```

9. 块有效性检查 [SWS_NvM_00160]

   > 软件组件应使用 `NvM_GetErrorStatus(特定块 ID)` 检查其负责的所有块的特定错误/状态，以确定对应 RAM 块的有效性。

   ```mermaid
   flowchart LR
       SWC[软件组件] -->|检查块 ID = X| NvM_GetErrorStatus
       NvM_GetErrorStatus -->|返回状态| SWC
       SWC --> Valid{状态判断}
       Valid -->|有效| Use[使用 RAM 数据]
       Valid -->|无效| Recover[执行恢复/默认值处理]
   ```

10. 数据集块的索引管理 [SWS_NvM_00695]

    > 对于 `NVM_BLOCK_DATASET` 类型的块，软件组件负责管理数据集索引：

    | API                  | 用途               | 调用方   |
    | -------------------- | ------------------ | -------- |
    | `NvM_SetDataIndex()` | 设置当前数据集索引 | 软件组件 |
    | `NvM_GetDataIndex()` | 获取当前数据集索引 | 软件组件 |

    > 例如：当前索引位置可由软件组件存储在**一个独立的 NVRAM 块**中以便持久化。

    ```mermaid
    flowchart LR
        subgraph DatasetBlock [数据集块]
            DS0[数据集 0]
            DS1[数据集 1]
            DS2[数据集 2]
        end
        
        SWC[软件组件] -->|NvM_SetDataIndex（1）| Index[索引 = 1]
        Index -->|选择| DS1
        
        SWC -->|持久化| Storage[独立 NVRAM 块<br/>存储当前索引]
        Storage -->|启动时读取| SWC
    ```

    

11. 启动阶段控制流程

    ```mermaid
    sequenceDiagram
        participant BswM as BSW 模式管理器
        participant Driver as 底层驱动
        participant NvM as NvM 模块
        participant DEM as DEM
        participant App as 应用层 SWC
    
        Note over BswM,App: 阶段 1：驱动初始化
        BswM->>Driver: 初始化底层驱动和硬件抽象
        
        Note over BswM,App: 阶段 2：NvM 内部初始化
        BswM->>NvM: NvM_Init()
        Note over NvM: 仅初始化内部数据结构<br/>不加载任何块数据
    
        Note over BswM,App: 阶段 3：数据加载启动
        BswM->>NvM: NvM_ReadAll() 启动
        Note over NvM: 按 ID 顺序处理所有块<br/>（低 ID 优先，支持 DEM 早期就绪）
    
        loop 每个块
            NvM->>NvM: 加载块数据到 RAM
            alt 配置了回调
                NvM->>App: 调用块回调
                App->>App: 提前启动（如适用）
            end
        end
    
        loop 轮询模式
            BswM->>NvM: NvM_GetErrorStatus(块ID=0)
            NvM-->>BswM: NVM_REQ_OK / NOT_OK / PENDING
        end
    
        alt 启动完成
            BswM->>App: 通知应用层可以访问数据
        end
    ```


## NVRAM 管理器关闭

> NvM 模块的关闭过程通过 `NvM_WriteAll` 请求执行，该请求将**所有已修改的 RAM 块数据写回非易失性存储器**，确保数据持久化。`NvM_WriteAll` 由 **BSW 模式管理器**调用。

1. 关闭流程 [SWS_NvM_00092]

   > 基本的关闭流程通过请求 `NvM_WriteAll` 完成。

   ```mermaid
   flowchart LR
       BswM[BSW 模式管理器] -->|调用| WriteAll[NvM_WriteAll]
       WriteAll -->|写回所有脏块| NVM[非易失性存储器]
   ```

   **`NvM_WriteAll` 的行为**：

   | 操作                  | 说明                                          |
   | --------------------- | --------------------------------------------- |
   | **遍历所有 NVRAM 块** | 检查每个块的 RAM 数据是否已被修改（"脏"状态） |
   | **写回脏块**          | 将所有已修改的数据写回 NV 存储                |
   | **完成通知**          | 所有块写入完成后，通过回调或轮询通知完成      |

2. 调用者 [SWS_NvM_00092 注释]

   > `NvM_WriteAll` 由 **BSW 模式管理器**调用。

   ```mermaid
   flowchart LR
       BswM[BSW 模式管理器] -->|专有调用| NvM_WriteAll
       Other[其他模块] -.->|❌ 禁止调用| NvM_WriteAll
   ```

3. 关闭时序图

   ```mermaid
   sequenceDiagram
       participant BswM as BSW 模式管理器
       participant NvM as NvM 模块
       participant RAM as RAM 块
       participant NV as 非易失性存储器
   
       Note over BswM,NV: 关闭阶段开始
   
       BswM->>NvM: NvM_WriteAll()
   
       loop 遍历所有 NVRAM 块
           NvM->>RAM: 检查块是否已修改（脏）
           alt 块已修改（脏）
               NvM->>RAM: 读取 RAM 数据
               NvM->>NV: 写入 NV 存储
               NV-->>NvM: 写入完成确认
           else 块未修改（干净）
               NvM->>NvM: 跳过该块
           end
       end
   
       NvM-->>BswM: 所有块写入完成（回调或轮询）
   
       Note over BswM,NV: 数据已持久化，可安全断电
   ```

## （准）并行写入访问

> NvM 模块通过**异步接口**接收请求，并使用**队列机制**管理这些请求。所有请求根据其**优先级**以**串行方式**依次处理，从而实现“准并行”的多请求并发提交能力。

1. 核心定义 [SWS_NvM_00162]

   > NvM 模块通过使用队列机制的**异步接口**接收请求。NvM 模块根据请求的优先级**串行处理**所有请求。

   ```mermaid
   flowchart LR
       subgraph Clients [调用方]
           App1[应用层 1]
           App2[应用层 2]
           App3[应用层 3]
       end
       
       subgraph NvM [NvM 模块]
           Queue[请求队列]
           Scheduler[串行调度器]
       end
       
       App1 -->|异步提交| Queue
       App2 -->|异步提交| Queue
       App3 -->|异步提交| Queue
       
       Queue -->|按优先级取出| Scheduler
       Scheduler -->|串行处理| Exec[执行作业]
   ```

2. 关键特性

   | 特性           | 说明                                              |
   | -------------- | ------------------------------------------------- |
   | **异步接口**   | 调用方提交请求后立即返回，不阻塞等待完成          |
   | **队列机制**   | 多个请求在队列中暂存，防止丢失                    |
   | **优先级调度** | 高优先级请求优先被处理（参见扫描顺序/优先级方案） |
   | **串行处理**   | 同一时刻只有一个作业在执行，保证数据一致性        |

3. 请求生命周期

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant Queue as 请求队列
       participant Exec as 执行引擎
   
       App->>NvM: 提交请求 (异步)
       NvM->>Queue: 加入队列
       NvM-->>App: 立即返回 (请求已接受)
   
       Note over Queue,Exec: 队列调度循环
   
       Queue->>Exec: 取出最高优先级请求
       Exec->>Exec: 串行处理作业
       Exec-->>App: (可选) 完成回调通知
   ```

## NVRAM 块一致性检查

> NvM 模块通过**隐式技术**检查 NVRAM 块的数据一致性，主要方式是**重新计算对应 NV 块的 CRC 值**。CRC 的使用按块独立配置，NvM 会为所用 CRC 中最大的类型分配内存，且 CRC 内存对用户透明。



1. 隐式检查 [SWS_NvM_00164]

   > NvM 模块应提供用于检查 NVRAM 块数据一致性的**隐式技术**。

   | 特性         | 说明                             |
   | ------------ | -------------------------------- |
   | **检查方式** | 隐式（自动执行，无需应用层干预） |
   | **触发时机** | 读取 NV 块时自动进行             |
   | **校验方法** | 通过 CRC 重新计算（详见下文）    |

2. CRC 校验方式 [SWS_NvM_00571]

   > NVRAM 块的数据一致性检查通过对其对应的 NV 块进行 **CRC 重新计算**来完成。

   ```mermaid
   flowchart LR
       subgraph ReadProcess [读取流程]
           Start[读取 NV 块] --> GetData[获取用户数据]
           GetData --> Calc[重新计算 CRC]
           GetData --> StoredCRC[读取存储的 CRC]
           Calc --> Compare{比较}
           StoredCRC --> Compare
           Compare -->|匹配| Valid[✅ 数据有效]
           Compare -->|不匹配| Invalid[❌ 数据损坏]
       end
   ```

3. CRC 配置 [SWS_NvM_00165]

   > 隐式数据一致性检查通过内部函数的**可配置选项**提供。一致性检查可按每个 NVRAM 块独立配置，取决于以下参数：

   | 配置参数             | 说明                    |
   | -------------------- | ----------------------- |
   | `NvMBlockUseCrc`     | 是否对该块使用 CRC 校验 |
   | `NvMCalcRamBlockCrc` | 是否对 RAM 块计算 CRC   |

   ```mermaid
   flowchart TD
       Config{配置参数}
       
       Config --> UseCrc[NvMBlockUseCrc<br/>启用 CRC]
       Config --> CalcCrc[NvMCalcRamBlockCrc<br/>RAM CRC 计算]
       
       UseCrc -->|启用| Check[读取时校验 NV 块 CRC]
       UseCrc -->|禁用| NoCheck[不进行 CRC 校验]
       
       CalcCrc -->|启用| RAMCRC[RAM 块也计算 CRC]
       CalcCrc -->|禁用| RAMNoCRC[RAM 块无 CRC]
   ```

4. 一次性写入块的 CRC 建议 [SWS_NvM_00724]

   > 对于 `NvMWriteBlockOnce = TRUE` 的 NVRAM 块，**应启用** `NvMBlockUseCrc`。同时，**应禁用** `NvMBlockWriteProt`，以便在 CRC 校验失败时用户仍能写入数据到该块。

   | 参数                | 一次性写入块推荐配置 | 原因                       |
   | ------------------- | -------------------- | -------------------------- |
   | `NvMBlockUseCrc`    | **启用**             | 确保写入后数据完整性可验证 |
   | `NvMBlockWriteProt` | **禁用**             | CRC 失败时允许重新写入恢复 |

   ```mermaid
   flowchart TD
       OneShot[一次性写入块<br/>NvMWriteBlockOnce = TRUE] --> UseCrc[NvMBlockUseCrc = 启用]
       OneShot --> DisableProt[NvMBlockWriteProt = 禁用]
       
       DisableProt --> Reason[原因: CRC 失败时<br/>允许用户重新写入]
   ```

5. CRC 内存分配 [SWS_NvM_00544]

   > 根据 `NvMBlockUseCrc` 和 `NvMCalcRamBlockCrc` 的配置，NvM 模块应为**所用 CRC 中最大的类型**分配内存。

   | 配置场景               | 内存分配                    |
   | ---------------------- | --------------------------- |
   | 多个块使用不同大小 CRC | 分配**最大** CRC 所需的内存 |
   | 所有块 CRC 大小相同    | 分配该大小所需的内存        |
   | 未启用 CRC             | 不分配 CRC 内存             |

6. CRC 内存对用户透明

   > NvM 用户不应知道其 RAM 块中数据的 CRC 内存的任何信息（如大小、位置）。

   ```mermaid
   flowchart LR
       subgraph NvM [NvM 模块]
           RAM[RAM 块<br/>用户数据]
           CRC_MEM[CRC 内存<br/>对用户不可见]
       end
       
       User[应用层] -->|可见| RAM
       User -.->|不可见| CRC_MEM
   ```

7. 一致性检查流程

   ```mermaid
   flowchart LR
       subgraph Write [写入流程]
           W1[应用写入数据] --> W2[NvM 更新 RAM 块]
           W2 --> W3{CalcRamBlockCrc<br/>启用?}
           W3 -->|是| W4[重新计算并存储 RAM CRC]
           W3 -->|否| W5[不存储 RAM CRC]
       end
       
       subgraph Read [读取/同步流程]
           R1[从 NV 加载数据到 RAM] --> R2{UseCrc<br/>启用?}
           R2 -->|是| R3[重新计算 NV 数据 CRC]
           R3 --> R4{CRC 匹配?}
           R4 -->|是| R5[✅ 数据有效]
           R4 -->|否| R6[❌ 数据损坏<br/>触发恢复机制]
           R2 -->|否| R5
       end
   ```

## 错误恢复

> NvM 模块为不同类型的 NVRAM 块提供了分层错误恢复机制。读取错误时通过加载默认值恢复，写入错误时通过重试恢复，启动时检测到 RAM 块无效则重新从 NV 加载或使用默认值。

1. 错误恢复概述 [SWS_NvM_00047]

   > NvM 模块应提供错误恢复技术。错误恢复方式取决于 NVRAM 块管理类型。

   ```mermaid
   flowchart TD
       subgraph ErrorRecovery [错误恢复机制]
           direction TB
           ReadErr[读取错误恢复]
           WriteErr[写入错误恢复]
           StartupErr[启动时错误恢复]
       end
       
       subgraph BlockTypes [块管理类型]
           Native[原生块]
           Redundant[冗余块]
           Dataset[数据集块]
       end
       
       BlockTypes --> ReadErr
       BlockTypes --> WriteErr
       BlockTypes --> StartupErr
   ```

2. 读取错误恢复 [SWS_NvM_00389]

   > NvM 模块应为**所有类型**的 NVRAM 块管理提供读取错误恢复，方式为**加载默认值**。

   | 块类型       | 读取错误恢复方式                         |
   | ------------ | ---------------------------------------- |
   | **原生块**   | 加载默认值（ROM 块或应用层提供）         |
   | **冗余块**   | 尝试使用另一个副本恢复；失败则加载默认值 |
   | **数据集块** | 加载默认值                               |

   ```mermaid
   flowchart LR
       Read[读取请求] --> Check{数据<br/>有效?}
       Check -->|有效| Return[返回数据]
       Check -->|损坏/无效| LoadDefault[加载默认值]
       LoadDefault --> ReturnDefault[返回默认值]
       LoadDefault --> LogError[记录错误状态]
   ```

3. 冗余块读取恢复 [SWS_NvM_00390]

   > 对于 `NVM_BLOCK_REDUNDANT` 类型的 NVRAM 块，NvM 模块应通过**加载默认值**到 RAM 块来提供读取错误恢复。

   ```mermaid
   flowchart TD
       ReadRedundant[读取冗余块] --> Read0[读取副本 0]
       ReadRedundant --> Read1[读取副本 1]
       
       Read0 --> Check0{副本 0<br/>有效?}
       Read1 --> Check1{副本 1<br/>有效?}
       
       Check0 -->|有效| Use0[使用副本 0]
       Check1 -->|有效| Use1[使用副本 1]
       
       Check0 -->|无效| Check1
       Check1 -->|无效| BothInvalid[两份副本均无效]
       
       BothInvalid --> LoadDefault[加载默认值到 RAM 块]
       LoadDefault --> LogError[记录错误状态<br/>上报 DEM]
       
       Use0 --> Return[返回数据]
       Use1 --> Return
       LoadDefault --> ReturnDefault[返回默认值]
   ```

4. 写入错误恢复 [SWS_NvM_00168]

   > NvM 模块应通过**执行写入重试**来提供写入错误恢复，不受 NVRAM 块管理类型限制。

   ```mermaid
   flowchart TD
       Write[写入请求] --> RetryCount[重试计数 = 0]
       RetryCount --> Attempt[执行写入]
       Attempt --> Check{写入<br/>成功?}
       
       Check -->|成功| Done[完成]
       Check -->|失败| Count{重试次数<br/>< 最大值?}
       
       Count -->|是| Increment[重试计数 + 1]
       Increment --> Attempt
       
       Count -->|否| Fail[写入失败]
       Fail --> LogError[记录错误状态]
   ```

   **写入重试特性**：

   | 特性         | 说明                             |
   | ------------ | -------------------------------- |
   | **适用类型** | 所有块类型（原生、冗余、数据集） |
   | **重试次数** | 由配置参数决定                   |
   | **重试行为** | 自动执行，对调用方透明           |
   | **失败处理** | 记录错误状态，返回错误码         |

5. 启动时读取错误恢复 [SWS_NvM_00169]

   > 在启动时，对于所有配置了 RAM 块 CRC 的 NVRAM 块，在 RAM 块重新验证失败的情况下，NvM 模块应提供读取错误恢复。

   ```mermaid
   flowchart TD
       Startup[系统启动] --> ReadAll[NvM_ReadAll]
       ReadAll --> LoadBlock[加载块到 RAM]
       LoadBlock --> CheckCRC{RAM CRC<br/>验证?}
       
       CheckCRC -->|通过| Valid[✅ RAM 块有效]
       CheckCRC -->|失败| Recovery[触发错误恢复]
       
       Recovery --> LoadDefault[加载默认值到 RAM 块]
       LoadDefault --> LogError[记录错误状态]
       
       Valid --> Ready[数据就绪]
       LoadDefault --> Ready
   ```

   **启动恢复的关键点**：

   | 条件             | 行为                                            |
   | ---------------- | ----------------------------------------------- |
   | **RAM CRC 配置** | 只有 `NvMCalcRamBlockCrc = TRUE` 的块才进行验证 |
   | **重新验证失败** | 触发错误恢复，加载默认值                        |
   | **默认值来源**   | ROM 块（如果配置）或应用层提供的默认值          |

6. 错误恢复策略总结

   ```mermaid
   flowchart TD
       subgraph Strategies [错误恢复策略]
           direction TB
           
           subgraph ReadRecovery [读取错误恢复]
               R1[所有块类型: 加载默认值]
               R2[冗余块: 先尝试另一副本<br/>失败后加载默认值]
           end
           
           subgraph WriteRecovery [写入错误恢复]
               W1[所有块类型: 写入重试]
           end
           
           subgraph StartupRecovery [启动时恢复]
               S1[RAM CRC 验证失败: 加载默认值]
           end
       end
   ```

   

### 使用 ROM 数据恢复 RAM 块

> 当 NV 块发生不可恢复的数据不一致时，NvM 模块应提供**隐式**和**显式**恢复技术，将 ROM 数据恢复到对应的 RAM 块中。

1. 核心定义 [SWS_NvM_00171]

   > NvM 模块应提供隐式和显式恢复技术，在 NV 块发生不可恢复的数据不一致时，将 ROM 数据恢复到对应的 RAM 块。

   ```mermaid
   flowchart TD
       subgraph Triggers [触发条件]
           T1["NV 块 CRC 校验失败<br/>[SWS_NvM_00387]"]
           T2["RAM 块无效数据检测<br/>[SWS_NvM_00226]"]
           T3["ReadAll 中检测到<br/>不可恢复错误<br/>[SWS_NvM_00388]"]
       end
       
       subgraph Recovery [恢复机制]
           Implicit[隐式恢复<br/>NvM 自动执行]
           Explicit[显式恢复<br/>应用层触发]
       end
       
       subgraph DataSource [数据来源]
           ROM[ROM 块<br/>默认数据]
       end
       
       T1 --> Recovery
       T2 --> Recovery
       T3 --> Recovery
       
       Implicit --> ROM
       Explicit --> ROM
       
       ROM --> RAM[RAM 块<br/>已恢复]
   ```

2. 隐式恢复 vs 显式恢复

   | 恢复方式     | 触发者           | 说明                                       |
   | ------------ | ---------------- | ------------------------------------------ |
   | **隐式恢复** | NvM 模块自动执行 | 在检测到数据不一致时自动恢复，对应用层透明 |
   | **显式恢复** | 应用层主动调用   | 通过 API 触发恢复，应用层控制恢复时机      |

   ```mermaid
   flowchart LR
       subgraph Implicit[隐式恢复]
           Auto[数据不一致检测] --> AutoRecovery[NvM 自动恢复]
           AutoRecovery --> RAM1[RAM 块更新]
           RAM1 --> App1[应用层无感知]
       end
       
       subgraph Explicit[显式恢复]
           App2[应用层检测到错误] --> API[调用恢复 API]
           API --> ManualRecovery[NvM 执行恢复]
           ManualRecovery --> RAM2[RAM 块更新]
           RAM2 --> App2
       end
   ```

3. 触发条件

   以下三种情况会触发 ROM 数据恢复：

   | 规范                | 触发条件               | 说明                               |
   | ------------------- | ---------------------- | ---------------------------------- |
   | **[SWS_NvM_00387]** | NV 块 CRC 校验失败     | 读取时重新计算 CRC，与存储值不匹配 |
   | **[SWS_NvM_00226]** | RAM 块无效数据检测     | 管理块中 RAM 数据被标记为无效      |
   | **[SWS_NvM_00388]** | ReadAll 中不可恢复错误 | 启动加载时 NV 块存在不可恢复错误   |

   ```mermaid
   flowchart TD
       subgraph Triggers [触发条件]
           CRC[NV 块 CRC 校验失败<br/>SWS_NvM_00387]
           Invalid[RAM 块标记为无效<br/>SWS_NvM_00226]
           Unrecoverable[ReadAll 中<br/>不可恢复错误<br/>SWS_NvM_00388]
       end
       
       Triggers --> Decision{数据一致性检查}
       Decision -->|失败| ROM[使用 ROM 数据恢复]
   ```

4. ROM 数据恢复流程

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant RAM as RAM 块
       participant NV as NV 块
       participant ROM as ROM 块
   
       App->>NvM: 读取数据请求 / 启动 ReadAll
       
       par 数据一致性检查
           NvM->>NV: 读取 NV 块数据
           NvM->>NV: CRC 校验
       end
       
       alt CRC 校验失败
           NvM->>NvM: 标记数据不一致
           
           alt 隐式恢复
               NvM->>ROM: 读取 ROM 默认数据
               NvM->>RAM: 将 ROM 数据写入 RAM
               NvM->>RAM: 标记为有效
               NvM-->>App: 返回默认数据（隐式）
           else 显式恢复
               NvM-->>App: 返回错误状态
               App->>NvM: 调用恢复 API
               NvM->>ROM: 读取 ROM 默认数据
               NvM->>RAM: 将 ROM 数据写入 RAM
               NvM-->>App: 恢复完成
           end
       else CRC 校验通过
           NvM->>RAM: 使用 NV 块数据
           NvM-->>App: 返回数据
       end
   ```

   

### 隐式恢复

> 隐式恢复是 NvM 模块在检测到数据不一致时自动执行的恢复机制。恢复过程中 NV 块数据保持不变，且恢复行为因配置和场景而异。

1. NV 块数据保持不变 [SWS_NvM_00172]

   > 在隐式恢复期间，对应 NV 块的数据内容应**保持不变**。

   | 特性           | 说明                 |
   | -------------- | -------------------- |
   | **NV 块状态**  | 仅读取，不修改       |
   | **RAM 块状态** | 被 ROM 默认数据覆盖  |
   | **后续写入**   | 应用写入后更新 NV 块 |

2. 无默认数据时的行为 [SWS_NvM_00572]

   > 当未配置默认数据时，**启动期间**、`NvM_ReadBlock` 和 `NvM_ReadPRAMBlock` **不提供隐式恢复**。

   条件：`NvMRomBlockDataAddress` 和 `NvMInitBlockCallback` 均未配置。

   ```mermaid
   flowchart TD
       Read[读取请求] --> CheckDefault{配置了<br/>ROM 默认数据<br/>或回调?}
       CheckDefault -->|否| NoRecovery[❌ 无隐式恢复]
       NoRecovery --> ReturnErr[返回错误状态]
   ```

3. 有默认数据但 RAM 有效时 [SWS_NvM_00573]

   > 配置了默认数据，且 RAM 块有效且 CRC 一致时，**不触发隐式恢复**。

   | 条件           | 状态         |
   | -------------- | ------------ |
   | 默认数据已配置 | ✅            |
   | RAM 块状态     | **有效**     |
   | CRC 一致性     | **一致**     |
   | 隐式恢复       | ❌ **不触发** |

4. 有默认数据但 RAM 无效且 NV 读取成功 [SWS_NvM_00574]

   > 配置了默认数据，RAM 无效/CRC 不一致，但 NV 读取成功时，**不触发隐式恢复**（因为 NV 数据有效，可直接使用）。

   | 条件           | 状态                         |
   | -------------- | ---------------------------- |
   | 默认数据已配置 | ✅                            |
   | RAM 块状态     | **无效**                     |
   | CRC 一致性     | **不一致**                   |
   | NV 读取        | **成功**                     |
   | 隐式恢复       | ❌ **不触发**（使用 NV 数据） |

   ```mermaid
   flowchart TD
       Read[读取请求] --> CheckDefault{配置了<br/>默认数据?}
       CheckDefault -->|否| NoRecovery1[❌ 无隐式恢复]
       CheckDefault -->|是| CheckRAM{RAM 有效<br/>且 CRC 一致?}
       CheckRAM -->|是| NoRecovery2[❌ 不触发恢复<br/>使用 RAM 数据]
       CheckRAM -->|否| CheckNV{NV 读取<br/>成功?}
       CheckNV -->|是| NoRecovery3[❌ 不触发恢复<br/>使用 NV 数据]
   ```

   

5. 触发隐式恢复的条件 [SWS_NvM_00575]

   > 配置了默认数据，RAM 无效/CRC 不一致，且 NV 读取失败时，**触发隐式恢复**——将 ROM 默认数据加载到 RAM。

   | 条件           | 状态                            |
   | -------------- | ------------------------------- |
   | 默认数据已配置 | ✅                               |
   | RAM 块状态     | **无效**                        |
   | CRC 一致性     | **不一致**                      |
   | NV 读取        | **失败**                        |
   | 隐式恢复       | ✅ **触发**（使用 ROM 默认数据） |

   ```mermaid
   flowchart TD
       Read[读取请求] --> CheckDefault{配置了<br/>默认数据?}
       CheckDefault -->|否| NoRecovery[❌ 无隐式恢复]
       CheckDefault -->|是| CheckRAM{RAM 有效<br/>且 CRC 一致?}
       CheckRAM -->|是| Skip[❌ 不触发恢复<br/>使用 RAM 数据]
       CheckRAM -->|否| CheckNV{NV 读取<br/>成功?}
       CheckNV -->|是| UseNV[❌ 不触发恢复<br/>使用 NV 数据]
       CheckNV -->|否| Trigger[✅ 触发隐式恢复<br/>ROM → RAM]
   ```

6. 隐式恢复决策总览

   ```mermaid
   flowchart TD
       Start[读取请求] --> Default{默认数据<br/>已配置?}
       Default -->|否| No[❌ 无隐式恢复]
       Default -->|是| RAMOk{RAM 有效<br/>且 CRC 一致?}
       RAMOk -->|是| No
       RAMOk -->|否| NVOk{NV 读取<br/>成功?}
       NVOk -->|是| No
       NVOk -->|否| Yes[✅ 隐式恢复<br/>ROM → RAM]
   ```

   

### 显式恢复

> 显式恢复通过 `NvM_RestoreBlockDefaults` 和 `NvM_RestorePRAMBlockDefaults` 两个 API 实现，由应用层按需触发，将 ROM 数据恢复到对应的 RAM 块，但不修改 NV 块内容。

1. 提供的 API [SWS_NvM_00391]

   | API                            | 适用对象    | 说明                         |
   | ------------------------------ | ----------- | ---------------------------- |
   | `NvM_RestoreBlockDefaults`     | 普通 RAM 块 | 恢复常规 NVRAM 块的 RAM 数据 |
   | `NvM_RestorePRAMBlockDefaults` | 永久 RAM 块 | 恢复永久 RAM 块的数据        |

2. NV 块保持不变 [SWS_NvM_00392]

   > 这两个函数**不修改**对应 NV 块的数据内容。

   - 仅更新 RAM 块
   - NV 块保持原样
   - 后续写入操作会覆盖 NV 块

   ```mermaid
   flowchart LR
       App[应用层调用<br/>RestoreBlockDefaults] --> Restore
       Restore --> ROM[读取 ROM 块]
       ROM --> RAM[写入 RAM 块]
       RAM --> NV[(NV 块<br/>保持不变)]
   ```

3. 隐式恢复 vs 显式恢复

   | 对比项           | 隐式恢复              | 显式恢复               |
   | ---------------- | --------------------- | ---------------------- |
   | **触发者**       | NvM 自动              | 应用主动调用 API       |
   | **对应用透明度** | 透明                  | 显式                   |
   | **时机**         | 读取时自动触发        | 应用按需调用           |
   | **适用场景**     | 启动/读取时的自动纠错 | 应用需要主动重置数据时 |
   | **NV 块修改**    | 不修改                | 不修改                 |

4. 典型使用场景

   | 场景               | 说明                                |
   | ------------------ | ----------------------------------- |
   | 应用检测到数据异常 | 主动调用恢复，重置 RAM 数据为默认值 |
   | 恢复出厂设置       | 将配置参数重置为默认值              |
   | 调试/测试          | 快速恢复已知状态                    |

## 不完整写入操作的检测

> 对 NV 块的不完整写入操作的检测**不属于 NvM 模块的职责范围**，由**内存硬件抽象层**（Memory Hardware Abstraction）负责检测。NvM 模块仅从下层获取块的有效性信息，并提供了 `NvM_InvalidateNvBlock` API 供应用层主动标记块无效。



1. **检测职责归属** [SWS_NvM_00174]

   > 对 NV 块的不完整写入操作的检测**不属于 NvM 模块的职责范围**，由**内存硬件抽象层**（Memory Hardware Abstraction）负责处理和检测。

   - **NvM 模块**：不承担检测职责，依赖下层反馈
   - **内存硬件抽象层**：负责检测不完整写入，并向 NvM 报告块状态

   | 层级               | 职责                                  |
   | ------------------ | ------------------------------------- |
   | **NvM 模块**       | 不检测，仅消费下层反馈的状态信息      |
   | **内存硬件抽象层** | 检测不完整写入，上报块无效/不一致状态 |

   ```mermaid
   flowchart TD
       subgraph SWC[应用层]
           App[软件组件 SW-C]
       end

       subgraph NvM[NvM 模块]
           NvM_Read[读取请求]
           NvM_Invalidate[NvM_InvalidateNvBlock]
       end

       subgraph HWAbstraction[内存硬件抽象层]
           Detect[检测不完整写入]
           Report[上报块状态]
       end

       subgraph Storage[存储介质]
           NV[NV 块]
       end

       App -->|读取| NvM_Read
       App -->|主动失效| NvM_Invalidate
       NvM_Read -->|获取块状态| HWAbstraction
       NvM_Invalidate -->|标记无效| HWAbstraction
       HWAbstraction -->|写入/读取| NV
       Detect -->|检测到不完整| Report
       Report -->|返回状态| NvM
   ```

2. **NvM 模块的预期行为** [SWS_NvM_00174]

   > NvM 模块期望在以下情况时从内存硬件抽象层获取信息：
   > - 引用的 NV 块无效（invalid）
   > - 引用的 NV 块不一致（inconsistent）
   > - 请求读取时无法访问该 NV 块

   ```mermaid
   flowchart LR
       NvM[NvM 模块请求读取] --> HW[内存硬件抽象层]
       HW --> Check{块状态检查}
       Check -->|有效| OK[返回数据]
       Check -->|无效/不一致/无法访问| Error[返回错误状态]
       Error --> NvM
   ```

3. **应用层的主动失效机制** [SWS_NvM_00174]

   > 软件组件（SW-C）可使用 `NvM_InvalidateNvBlock` API，主动将 NV 块标记为无效，**防止底层传递旧数据**给上层。

   - **适用场景**：
     - 应用检测到逻辑数据错误，希望强制重新加载
     - 需要丢弃当前 NV 块中的旧数据
     - 配合显式恢复，强制下次读取时触发 ROM → RAM 恢复

   ```mermaid
   flowchart LR
       App[应用层] -->|NvM_InvalidateNvBlock| NvM[NvM 模块]
       NvM -->|标记块无效| HW[内存硬件抽象层]
       HW -->|后续读取| NV[NV 块]
       NV -->|被标记无效| Reject[❌ 返回错误/触发恢复]
   ```

4. **流程图：完整交互示意**

   ```mermaid
   sequenceDiagram
       participant App as 应用层 SW-C
       participant NvM as NvM 模块
       participant HW as 内存硬件抽象层
       participant Storage as NV 存储介质
   
       Note over HW,Storage: 场景1：硬件检测到不完整写入
       HW->>Storage: 执行写入操作
       Storage-->>HW: 写入中断/失败
       HW->>HW: 检测到不完整写入
       HW->>HW: 标记对应块为无效/不一致
   
       Note over App,NvM: 场景2：应用层发起读取
       App->>NvM: 读取块请求
       NvM->>HW: 请求读取块
       HW->>HW: 检查块状态
       HW-->>NvM: 返回无效/不一致状态
       NvM-->>App: 返回错误/触发恢复
   
       Note over App,NvM: 场景3：应用主动失效
       App->>NvM: NvM_InvalidateNvBlock()
       NvM->>HW: 标记块无效
       HW->>Storage: 标记无效
   ```

## 单块请求的终止

> NvM 模块的所有异步单块请求在终止时，其结果会记录在对应管理块的错误/状态字段中。同时支持通过配置回调函数的方式，在请求终止时主动通知调用方。

1. **结果状态记录** [SWS_NvM_00175]

   > 所有由 NvM 模块提供的异步请求（除 `NvM_CancelWriteAll` 外）都应在对应管理块的指定错误/状态字段中指示其结果。

   - 适用范围：所有异步单块请求（如 `NvM_ReadBlock`、`NvM_WriteBlock` 等）
   - 例外：`NvM_CancelWriteAll` 不适用此机制
   - 记录位置：对应管理块（Administrative Block）的错误/状态字段
   - 查询方式：应用层可通过 `NvM_GetErrorStatus(BlockID)` 读取

   | 请求类型                   | 是否记录结果 | 记录位置 |
   | -------------------------- | :----------: | -------- |
   | `NvM_ReadBlock`            |      ✅       | 管理块   |
   | `NvM_WriteBlock`           |      ✅       | 管理块   |
   | `NvM_RestoreBlockDefaults` |      ✅       | 管理块   |
   | `NvM_EraseNvBlock`         |      ✅       | 管理块   |
   | `NvM_InvalidateNvBlock`    |      ✅       | 管理块   |
   | `NvM_CancelWriteAll`       |    ❌ 例外    | —        |

   ```mermaid
   flowchart LR
       App[应用层发起异步请求] --> NvM[NvM 模块]
       NvM --> Queue[加入队列]
       Queue --> Process[串行处理]
       Process --> Terminate[请求终止]
       Terminate --> Admin[记录结果到管理块]
       Admin --> Query[应用层通过 NvM_GetErrorStatus 查询]
   ```

2. **回调通知机制** [SWS_NvM_00176]

   > 可选的配置参数 `NvMSingleBlockCallback` 用于在异步块请求（以及 `NvM_ReadAll`）终止时通过回调进行通知。

   - 配置方式：通过 `NvMSingleBlockCallback` 参数启用
   - 触发时机：异步请求终止时
   - 适用请求：异步单块请求 + `NvM_ReadAll`

   | 配置方式     | 行为                                  |
   | ------------ | ------------------------------------- |
   | **启用回调** | 请求终止时自动调用回调函数            |
   | **禁用回调** | 应用层需主动轮询 `NvM_GetErrorStatus` |

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant Admin as 管理块
   
       App->>NvM: 异步读取请求 (NvM_ReadBlock)
       NvM-->>App: 立即返回 (请求已接受)
   
       Note over NvM: 请求处理中...
   
       NvM->>Admin: 请求终止，记录结果
   
       alt 配置了回调
           NvM->>App: 调用回调函数 (NvMSingleBlockCallback)
           App->>App: 处理结果
       else 未配置回调
           App->>NvM: NvM_GetErrorStatus(BlockID)
           NvM-->>App: 返回状态
       end
   ```

3. **RTE 集成说明** [SWS_NvM_00176 注释]

   > 在与应用层 SW-C 通信时，`NvMSingleBlockCallback` 应配置为对应的 `Rte_call_<p>_<o>` API。

   - `NvMSingleBlockCallback` → `Rte_call_<p>_<o>` 映射

   - 典型场景：应用层 SW-C 通过 RTE 接收 NvM 操作完成通知

     > [!tip]
     >
     > `<p>`(port)：代表软件组件中的端口名（Port Name）
     >
     > **`<o>` (operation)**：代表端口所使用接口中的**操作名（Operation Name）**，通常指 Client-Server 接口中被调用的具体函数（operation）

   ```mermaid
   flowchart LR
       subgraph BSW[BSW 层]
           NvM[NvM 模块]
           Callback[NvMSingleBlockCallback]
       end
   
       subgraph RTE[RTE 层]
           RteCall[Rte_call_<p>_<o>]
       end
   
       subgraph SWC[应用层]
           App[软件组件 SW-C]
       end
   
       NvM --> Callback
       Callback -->|配置映射| RteCall
       RteCall -->|通知| App
   ```

4. **结果获取方式对比**

   | 对比项   | 轮询方式                          | 回调方式                        |
   | -------- | --------------------------------- | ------------------------------- |
   | 配置参数 | `NvMSingleBlockCallback = FALSE`  | `NvMSingleBlockCallback = TRUE` |
   | 获取方式 | 应用主动调用 `NvM_GetErrorStatus` | NvM 自动调用回调函数            |
   | CPU 开销 | 需周期性轮询                      | 仅请求终止时触发                |
   | 实时性   | 取决于轮询周期                    | 立即通知                        |
   | 典型场景 | 非实时性需求                      | 实时响应需求                    |

5. **相关规范**
   - `SWS_NvM_00000`：管理块定义
   - `ECUC_NvM_00506`：单块回调配置参数
   - 文档 10.2.3：NvM 配置参数详解
   - 文档 10.2.2：回调配置说明

## 多块请求的终止

> NvM 模块使用独立变量存储异步多块请求（`NvM_ReadAll`、`NvM_WriteAll`、`NvM_ValidateAll`）的结果。通过保留块 ID `0` 调用 `NvM_GetErrorStatus` 可获取整体状态，同时每个受影响块的管理块中记录详细错误信息。支持通过 `NvMMultiBlockCallback` 配置终止回调。



1. **独立结果存储** [SWS_NvM_00393]

   > NvM 模块应使用独立的变量存储异步多块请求的结果。

   - 适用的多块请求：
     - `NvM_ReadAll`
     - `NvM_WriteAll`（含 `NvM_CancelWriteAll`）
     - `NvM_ValidateAll`
   - 存储方式：独立变量（区别于单块请求的管理块存储方式）
   - 作用范围：多块请求的**整体**执行结果

   | 请求类型             | 是否适用 | 结果存储方式 |
   | -------------------- | :------: | ------------ |
   | `NvM_ReadAll`        |    ✅     | 独立变量     |
   | `NvM_WriteAll`       |    ✅     | 独立变量     |
   | `NvM_CancelWriteAll` |    ✅     | 独立变量     |
   | `NvM_ValidateAll`    |    ✅     | 独立变量     |
   | 单块请求             |    ❌     | 管理块字段   |

2. **整体状态查询** [SWS_NvM_00394]

   > `NvM_GetErrorStatus` 与保留块 ID `0` 配合使用，返回异步多块请求的最新错误/状态信息。

   - 调用方式：`NvM_GetErrorStatus(BlockID = 0)`
   - 返回值：多块请求的整体状态（如 `NVM_REQ_PENDING`、`NVM_REQ_OK`、`NVM_REQ_NOT_OK`）
   - 用途：快速了解多块请求是否全部完成，无需逐个查询块状态

   ```mermaid
   flowchart LR
       App[应用层] --> NvM_GetErrorStatus(0)
       NvM_GetErrorStatus(0) --> Var[(多块结果<br/>独立变量)]
       Var --> Return[返回整体状态]
   ```

3. **整体状态的含义** [SWS_NvM_00395]

   > 多块请求的结果仅代表**通用的错误/状态信息**，而非详细的每个块的状态。

   - 整体状态：`NVM_REQ_OK`（全部成功）或 `NVM_REQ_NOT_OK`（存在失败）
   - 详细状态：需通过每个块的管理块获取

   ```mermaid
   flowchart TD
       Multi[多块请求执行完毕] --> Global[整体状态<br/>NVM_REQ_OK / NOT_OK]
       Global --> OK[全部成功 → OK]
       Global --> NotOK[至少一个块失败 → NOT_OK]
       NotOK --> Detail[查询每个块的<br/>管理块获取详细错误]
   ```

4. **详细状态记录** [SWS_NvM_00396]

   > 多块请求的详细错误/状态信息记录在**每个受影响的管理块**的错误/状态字段中。

   - 查询方式：`NvM_GetErrorStatus(特定 BlockID)`
   - 与单块请求共用同一错误/状态字段
   - 每个块独立记录其处理结果

   ```mermaid
   flowchart LR
       subgraph NVRAM[NVRAM 块]
           BlockA[块 A 管理块<br/>状态: OK]
           BlockB[块 B 管理块<br/>状态: 错误 X]
           BlockC[块 C 管理块<br/>状态: OK]
       end

       App[应用层] --> QueryA[NvM_GetErrorStatus（A）] --> OK
       App --> QueryB[NvM_GetErrorStatus（B）] --> ErrorX
   ```

5. **回调通知机制** [SWS_NvM_00179]

   > 可选的配置参数 `NvMMultiBlockCallback` 用于在异步多块请求终止时通过回调进行通知。

   - 配置方式：`NvMMultiBlockCallback`（参见文档 10.2.2）
   - 触发时机：多块请求全部处理完毕后
   - 回调函数：`NvM_MultiBlockCallback`

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块
       participant Var as 多块结果变量

       App->>NvM: NvM_ReadAll() / NvM_WriteAll()
       NvM-->>App: 立即返回

       loop 处理每个块
           NvM->>NvM: 处理块
           NvM->>Var: 更新整体状态
       end

       alt 配置了回调
           NvM->>App: NvMMultiBlockCallback()
           App->>App: 处理整体结果
           App->>NvM: 按需查询每个块的详细状态
       else 未配置回调
           App->>NvM: NvM_GetErrorStatus(0)
           NvM-->>App: 返回整体状态
       end
   ```

6. **单块 vs 多块请求状态查询对比**

   | 对比项           | 单块请求                      | 多块请求                      |
   | ---------------- | ----------------------------- | ----------------------------- |
   | **结果存储位置** | 对应块的管理块                | 独立变量 + 每个块的管理块     |
   | **整体状态查询** | 不适用                        | `NvM_GetErrorStatus(0)`       |
   | **详细状态查询** | `NvM_GetErrorStatus(BlockID)` | `NvM_GetErrorStatus(BlockID)` |
   | **回调配置**     | `NvMSingleBlockCallback`      | `NvMMultiBlockCallback`       |

7. **相关规范**
   - `SWS_NvM_00015`：`NvM_GetErrorStatus` API 定义
   - `SWS_NvM_00393-00396`：多块请求终止规范
   - 文档 10.2.2：多块回调配置说明



## 异步请求/作业处理的通用机制

> NvM 模块通过队列机制管理异步请求，支持多请求排队、CRC 分步计算、紧急作业抢占，并在队列溢出时返回错误。每个请求入队时状态设为 `NVM_REQ_PENDING`，完成后更新为 `NVM_REQ_OK` 或错误码。

1. **CRC 分步计算** [SWS_NvM_00180]

   > 当请求中需要进行 CRC 计算，且所引用的 NVRAM 块长度超过配置参数 `NvMCrcNumOfBytes` 指定的字节数时，NvM 模块应**分多步**完成 CRC 计算。

   - 配置参数：`NvMCrcNumOfBytes` 指定单次 CRC 计算处理的字节数
   - 触发条件：块长度 > `NvMCrcNumOfBytes`
   - 行为：将 CRC 计算拆分为多次调用，避免长时间占用 CPU

   ```mermaid
   flowchart LR
       Start[CRC 计算请求] --> Check{块长度 ><br/>NvMCrcNumOfBytes?}
       Check -->|否| Once[一次性计算完成]
       Check -->|是| Multi[分步计算]
       Multi --> Step1[步骤 1: 前 N 字节]
       Step1 --> Step2[步骤 2: 下 N 字节]
       Step2 --> StepN[... 直到全部完成]
       StepN --> Done[计算完成]
   ```

2. **CRC 初始值来源** [SWS_NvM_00351]

   > CRC 计算使用的初始值应来自 CRC 模块发布的初始值。

   - 统一来源：由 CRC 模块发布（避免各模块自行定义导致不一致）
   - 保证不同模块、不同 Profile 使用相同的 CRC 初始值

   ```mermaid
   flowchart LR
       CRCM[CRC 模块] -->|发布初始值| NvM[NvM 模块]
       NvM -->|CRC 计算| CRCRoutine[CRC 计算例程]
   ```

3. **多请求排队支持** [SWS_NvM_00181]

   > 多个并发的单块请求应可排队。

   - 多个单块请求可同时存在于队列中
   - 队列管理由 NvM 模块内部处理（参见"（准）并行写入访问"）
   - 处理顺序：按优先级串行处理

   ```mermaid
   flowchart LR
       R1[请求 A] --> Queue[(作业队列)]
       R2[请求 B] --> Queue
       R3[请求 C] --> Queue
       Queue --> Process[串行处理<br/>按优先级]
   ```

4. **紧急作业抢占** [SWS_NvM_00182]

   > NvM 模块应中断当前异步请求/作业处理，优先处理**紧急优先级**的作业（崩溃数据）。

   - 抢占者：紧急优先级作业（`immediate priority`）
   - 被抢占者：当前正在执行的非紧急作业
   - 抢占后：紧急作业完成后，被抢占作业恢复或重新启动

   ```mermaid
   flowchart LR
       Current[正在执行<br/>普通作业] --> Preempt[❗ 紧急作业到达]
       Preempt --> Save[保存当前作业状态]
       Save --> Immediate[执行紧急作业]
       Immediate --> Resume[恢复/重新启动<br/>被抢占作业]
   ```

5. **队列溢出处理** [SWS_NvM_00184]

   > 如果调用 NvM 异步函数导致作业队列溢出，函数应返回 `E_NOT_OK`。

   - 返回码：`E_NOT_OK`
   - 含义：请求未被接受，调用方需要重试或处理错误

   ```mermaid
   flowchart TD
       Call[调用异步函数] --> Check{队列<br/>已满?}
       Check -->|是| ReturnError[返回 E_NOT_OK]
       Check -->|否| Enqueue[入队成功]
   ```

6. **入队状态设置** [SWS_NvM_00185]

   > 当请求成功入队后，NvM 模块应将对应 NVRAM 块的请求结果设为 `NVM_REQ_PENDING`。

   - 状态值：`NVM_REQ_PENDING`
   - 含义：请求已接受，正在等待处理
   - 查询方式：`NvM_GetErrorStatus(BlockID)`

   | 状态值            | 含义               |
   | ----------------- | ------------------ |
   | `NVM_REQ_PENDING` | 请求已入队，处理中 |
   | `NVM_REQ_OK`      | 请求处理成功       |
   | `NVM_REQ_NOT_OK`  | 请求处理失败       |

7. **作业成功处理** [SWS_NvM_00270]

   > 当 NvM 模块成功处理一个作业后，应将请求结果设为 `NVM_REQ_OK`。

   - 状态值：`NVM_REQ_OK`
   - 含义：作业处理成功
   - 适用对象：单块请求和多块请求均适用

8. **完整请求生命周期**

   ```mermaid
   flowchart LR
       Enqueue[请求入队] --> Pending[状态: NVM_REQ_PENDING]
       Pending --> Process[串行处理]
       Process --> Success[处理成功] --> OK[状态: NVM_REQ_OK]
       Process --> Fail[处理失败] --> NotOK[状态: NVM_REQ_NOT_OK]
       Process --> QueueFull[队列溢出] --> ReturnError[返回 E_NOT_OK]
   ```

9. **相关规范**

   - `SWS_NvM_00180`：CRC 分步计算
   - `SWS_NvM_00351`：CRC 初始值来源
   - `SWS_NvM_00181`：多请求排队
   - `SWS_NvM_00182`：紧急作业抢占
   - `SWS_NvM_00184`：队列溢出处理
   - `SWS_NvM_00185`：入队状态设置
   - `SWS_NvM_00270`：作业成功处理

## NVRAM 块写保护

> NvM 模块提供可配置的写保护机制，所有写保护仅针对 NV 块（非易失性部分），不影响 RAM 块数据的修改。根据 `NvMWriteBlockOnce` 和 `NvMBlockWriteProt` 两个配置参数，写保护的启用/禁用行为有所不同。

1. **写保护的范围**

   > 所有写保护仅针对 NVRAM 块的 NV 部分，即 RAM 块数据可以被修改，但无法写入 NV 存储器。

   - 保护对象：NV 块（非易失性存储）
   - 不受影响：RAM 块数据仍可正常修改
   - 效果：写入请求不会实际更新 NV 存储

   ```mermaid
   flowchart LR
       App[应用层] -->|修改数据| RAM[RAM 块]
       RAM -->|写入 NV| NV[NV 块]
       NV --> Check{写保护<br/>启用?}
       Check -->|是| Blocked[❌ 阻止写入]
       Check -->|否| Written[✅ 写入成功]
   ```

2. **`NvMWriteBlockOnce = FALSE` 时的行为** [SWS_NvM_00325]

   > 当 `NvMWriteBlockOnce` 为 `FALSE` 时，无论 `NvMBlockWriteProt` 配置为何值，都允许通过 `NvM_SetBlockProtection` 函数启用/禁用写保护。

   - 条件：`NvMWriteBlockOnce = FALSE`
   - 行为：`NvM_SetBlockProtection` 可随时启用或禁用写保护
   - 不受影响：`NvMBlockWriteProt` 的配置值（仅作为初始状态）

   ```mermaid
   flowchart TD
       Start[写保护操作] --> CheckOnce{NvMWriteBlockOnce == FALSE?}
       CheckOnce -->|是| Allow[✅ 允许 NvM_SetBlockProtection<br/>启用/禁用写保护]
       Allow --> Enable[可随时启用保护]
       Allow --> Disable[可随时禁用保护]
   ```

3. **`NvMWriteBlockOnce = TRUE` 时的行为** [SWS_NvM_00577] [SWS_NvM_00398]

   > 当 `NvMWriteBlockOnce` 为 `TRUE` 时，无论 `NvMBlockWriteProt` 配置为何值，都**不允许**通过 `NvM_SetBlockProtection` 启用/禁用写保护。

   - 条件：`NvMWriteBlockOnce = TRUE`
   - 行为：`NvM_SetBlockProtection` 调用被禁止（返回错误或忽略）
   - 原因：一次性写入块的保护状态应保持固定，防止意外修改

4. **默认写保护** [SWS_NvM_00326]

   > 所有配置了 `NvMBlockWriteProt = TRUE` 的 NVRAM 块，NvM 模块应启用默认写保护。

   - 条件：配置 `NvMBlockWriteProt = TRUE`
   - 行为：启动时自动启用写保护
   - 默认状态：写保护处于启用状态

   ```mermaid
   flowchart LR
       Config[配置 NvMBlockWriteProt = TRUE] --> Start[系统启动]
       Start --> Enable[✅ 自动启用默认写保护]
   ```

5. **显式禁用保护** [SWS_NvM_00578]

   > NvM 模块的环境可通过 `NvM_SetBlockProtection` 函数显式禁用写保护。

   - 适用条件：`NvMWriteBlockOnce = FALSE`（见第 2 条）
   - 调用方式：`NvM_SetBlockProtection(BlockID, FALSE)`
   - 效果：临时解除写保护，允许写入操作

6. **一次性写入块的行为** [SWS_NvM_00397] [SWS_NvM_00952]

   > 对于配置了 `NvMWriteBlockOnce = TRUE` 的块，NvM 模块仅在 NV 设备为空白状态时写入一次。在首次读取请求之前，任何写入/擦除/失效请求都将被拒绝。

   - 写入限制：仅在 NV 设备为空白时写入一次
   - 请求拒绝：首次读取请求之前，写入/擦除/失效请求均被拒绝
   - 保护恢复：复位后保护标志被清除，需通过首次读取重新激活保护

   ```mermaid
   flowchart TD
       Start[启动/复位] --> Clear[管理块保护标志清除]
       Clear --> Read{首次读取<br/>是否完成?}
       Read -->|否| Reject[❌ 拒绝 Write/Erase/Invalidate]
       Read -->|是| Check{块有效<br/>且一致?}
       Check -->|是| Protect[✅ 写保护生效]
       Check -->|否| NoProtect[❌ 写保护未生效<br/>需修复数据]
   ```

7. **复位后的保护恢复** [SWS_NvM_00952 注释]

   > 复位后，`NVM_WRITE_BLOCK_ONCE` 块的写保护标志从管理块中清除。要重新激活保护，必须在首次写入/擦除/失效请求处理之前读取该块，以确保保护仅对有效且一致的块生效。

   - 清除时机：复位时管理块写保护标志被清除
   - 恢复条件：需先执行一次读取请求（单块读取或 `NvM_ReadAll`）
   - 恢复前提：块数据有效且一致

   ```mermaid
   sequenceDiagram
       participant System as 系统/复位
       participant NvM as NvM 模块
       participant Admin as 管理块
   
       System->>NvM: 系统启动/复位
       NvM->>Admin: 清除写保护标志
       NvM->>NvM: 等待块读取
       
       alt 读取请求到达（单块或 NvM_ReadAll）
           NvM->>NvM: 检查块有效且一致
           alt 有效且一致
               NvM->>Admin: 设置写保护标志
           else 无效或不一致
               NvM->>NvM: 不设置保护<br/>（仅有效块才保护）
           end
       end
   ```

8. **配置参数速查**

   | 配置参数                 | 说明                | 相互影响                                |
   | ------------------------ | ------------------- | --------------------------------------- |
   | `NvMBlockWriteProt`      | 启用/禁用默认写保护 | 仅作为初始状态，`TRUE` 时启动自动保护   |
   | `NvMWriteBlockOnce`      | 是否允许多次写入    | `TRUE` 时禁止通过 API 修改保护状态      |
   | `NvM_SetBlockProtection` | 运行时动态控制保护  | 仅在 `NvMWriteBlockOnce = FALSE` 时可用 |

   ```mermaid
   flowchart TD
       subgraph Config[配置参数]
           A[NvMBlockWriteProt]
           B[NvMWriteBlockOnce]
       end
   
       subgraph Behavior[运行时行为]
           C[NvM_SetBlockProtection<br/>可用性]
           D[首次读取前的<br/>请求处理]
       end
   
       A -->|TRUE| E[启动时自动启用保护]
       B -->|FALSE| C
       C -->|允许启用/禁用| F[可动态控制]
       B -->|TRUE| C
       C -->|禁止API调用| G[保护状态固定]
       B -->|TRUE| D
       D -->|拒绝请求| H[Write/Erase/Invalidate<br/>被阻塞]
   ```

9. **相关规范**
   - `SWS_NvM_00325`：非一次性写入块的保护控制
   - `SWS_NvM_00577` / `SWS_NvM_00398`：一次性写入块的保护限制
   - `SWS_NvM_00326`：默认写保护
   - `SWS_NvM_00397`：一次性写入块的写入限制
   - `SWS_NvM_00952`：首次读取前拒绝写入/擦除/失效请求
   - `ECUC_NvM_00072`：一次性写入块配置参数
   - `SRS_Mem_08009` / `SRS_Mem_08015`：相关需求

## RAM 块数据的验证与修改

> NvM 模块通过状态机管理 RAM 块的有效性和修改状态。API 调用会影响这些状态，同时提供配置选项控制状态修改权限。CRC 错误会触发状态回退，并通过错误恢复机制恢复。

1. **RAM 块状态机概述**

   RAM 块的状态由两个维度组合：**有效性**（VALID / INVALID）和 **修改性**（CHANGED / UNCHANGED）。

   ![Ram 块状态](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260703150253019.png)

   ```mermaid
   stateDiagram-v2
       [*] --> INVALID_UNCHANGED: 初始化后
   
       INVALID_UNCHANGED --> VALID_UNCHANGED: NvM_ReadAll 更新
   
       VALID_UNCHANGED --> VALID_CHANGED: 数据修改
   
       VALID_CHANGED --> VALID_UNCHANGED: NvM_WriteAll 写回成功
   
       VALID_UNCHANGED --> INVALID_UNCHANGED: CRC 错误
   
       INVALID_UNCHANGED --> VALID_CHANGED: 错误恢复（隐式/显式）
   
       note right of INVALID_UNCHANGED: INVALID/CHANGED<br/>状态不可达
   ```

   | 状态                    | 含义                                 |
   | ----------------------- | ------------------------------------ |
   | **INVALID / UNCHANGED** | RAM 数据无效，未修改                 |
   | **VALID / UNCHANGED**   | RAM 数据有效，与 NV 一致             |
   | **VALID / CHANGED**     | RAM 数据有效，已修改（与 NV 不一致） |
   | **INVALID / CHANGED**   | ❌ 不可达状态                         |

2. **状态转换说明**

   - 初始化后：RAM 块处于 `INVALID / UNCHANGED`
   - `NvM_ReadAll` 更新后：转为 `VALID / UNCHANGED`（此状态下 `WriteAll` 不被允许）
   - `NvM_SetRamBlockStatus` 调用：可离开当前状态
   - CRC 错误发生时：退回到 `INVALID / UNCHANGED`
   - 错误恢复（隐式或显式）后：转为 `VALID / CHANGED`（RAM 数据与 NV 不一致）

3. **禁用状态修改 API 时的写入行为** [SWS_NvM_00344]

   > 如果配置中禁用了修改 RAM 块状态的 API（通过 `NvMSetRamBlockStatusApi` 或 `NvMBlockUseSetRamBlockStatus`），当向 NV 块写入数据时（即 `NvM_WriteAll` 期间），NvM 模块应将 RAM 块视为 **有效且已修改**，并将每个永久 RAM 块写入 NV 存储器。

   - 配置条件：禁用状态修改 API
   - 行为：`NvM_WriteAll` 时强制将每个永久 RAM 块写入 NV
   - 简化逻辑：不依赖状态判断，直接写入

4. **禁用状态修改 API 时的读取行为** [SWS_NvM_00345]

   > 如果配置中禁用了修改 RAM 块状态的 API，当从 NV 块读取数据时（即 `NvM_ReadAll` 期间），NvM 模块应将 RAM 块视为 **无效**，并根据配置将每个 NVRAM 块复制到 RAM。

   - 配置条件：禁用状态修改 API
   - 行为：`NvM_ReadAll` 时视为无效，重新加载所有块
   - 简化逻辑：不依赖状态判断，强制加载

   ```mermaid
   flowchart TB
       subgraph API_ENABLED[API 启用时]
           E1[读取] --> E2{检查状态}
           E2 -->|有效| E3[使用 RAM 数据]
           E2 -->|无效| E4[从 NV 加载]
       end

       subgraph API_DISABLED[API 禁用时]
           D1[读取] --> D2[视为无效]
           D2 --> D3[强制从 NV 加载]

           D4[写入] --> D5[视为有效且已修改]
           D5 --> D6[强制写入 NV]
       end
   ```

5. **读取失败时的应用层职责** [SWS_NvM_00696]

   > 如果块读取尝试失败，应用层负责在下一次写入尝试前提供有效数据。

   - 触发条件：块读取失败
   - 责任方：应用层
   - 要求：应用层必须确保数据有效后再发起写入

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant NvM as NvM 模块

       App->>NvM: 读取请求
       NvM-->>App: ❌ 读取失败
       App->>App: 准备有效数据
       App->>NvM: 写入请求（数据已有效）
   ```

6. **写入成功后的状态更新** [SWS_NvM_00472]

   > 当 RAM 块成功复制到 NV 存储器后，RAM 块状态应设为 **"有效/未修改"**。

   - 触发条件：`NvM_WriteAll` 或单块写入成功
   - 状态更新：`VALID / UNCHANGED`
   - 含义：RAM 与 NV 数据一致

   ```mermaid
   flowchart LR
       Write[写入 NV 成功] --> Update[状态更新]
       Update --> ValidUnchanged[VALID / UNCHANGED]
       ValidUnchanged --> RAM_NV[RAM 与 NV 一致]
   ```

7. **状态转换图（完整）**

   ```mermaid
   flowchart TD
       Init[初始化] --> InvalidUnchanged[INVALID / UNCHANGED]

       InvalidUnchanged -->|NvM_ReadAll| ValidUnchanged[VALID / UNCHANGED]
       InvalidUnchanged -->|错误恢复（隐式/显式）| ValidChanged[VALID / CHANGED]

       ValidUnchanged -->|CRC 错误| InvalidUnchanged
       ValidUnchanged -->|NvM_SetRamBlockStatus| Any[其他状态]

       ValidChanged -->|写入 NV 成功| ValidUnchanged

       Note[INVALID / CHANGED 不可达]
   ```

8. **相关规范**

   | 规范                              | 内容                 |
   | --------------------------------- | -------------------- |
   | `SWS_NvM_00344`                   | API 禁用时的写入行为 |
   | `SWS_NvM_00345`                   | API 禁用时的读取行为 |
   | `SWS_NvM_00696`                   | 读取失败后应用层职责 |
   | `SWS_NvM_00472`                   | 写入成功后的状态更新 |
   | `SRS_Mem_08550` / `SRS_Mem_08541` | 相关需求             |

### VALID / UNCHANGED 状态

> 此状态表示 RAM 块内容与对应 NV 块内容相同，或应用访问后未指示潜在变更。对于数据集块，此条件适用于最后处理的实例。进入此状态需满足特定条件，保持此状态则需满足持续条件。

1. **状态含义**

   | 条件                 | 说明                           |
   | -------------------- | ------------------------------ |
   | RAM 与 NV 一致       | RAM 块内容与对应 NV 块内容相同 |
   | 应用访问后未指示变更 | 应用修改数据后未通知 NvM 模块  |
   | 数据集块特例         | 适用于最后处理的实例           |
   | 最近操作成功         | 最后一次块操作成功完成         |
   | 未被主动失效         | 块未被请求标记为无效           |

2. **进入条件**

   满足以下任意一项即可进入 VALID / UNCHANGED 状态：

   | #    | 触发事件                      | 说明               |
   | ---- | ----------------------------- | ------------------ |
   | 1    | `NvM_ReadAll()` 成功读取该块  | 启动时全部加载完成 |
   | 2    | `NvM_ReadBlock` 成功完成      | 单块读取完成       |
   | 3    | `NvM_WriteBlock` 成功完成     | 单块写入完成       |
   | 4    | `NvM_WriteAll()` 成功写入该块 | 全部写回完成       |

   ```mermaid
   flowchart TD
       Start[进入 VALID/UNCHANGED] --> Cond1[NvM_ReadAll 成功]
       Start --> Cond2[NvM_ReadBlock 成功]
       Start --> Cond3[NvM_WriteBlock 成功]
       Start --> Cond4[NvM_WriteAll 成功]
   
       Cond1 --> Valid[VALID / UNCHANGED]
       Cond2 --> Valid
       Cond3 --> Valid
       Cond4 --> Valid
   ```

3. **保持条件**

   以下条件必须**同时满足**，状态才能保持：

   | #    | 条件                            | 说明                              |
   | ---- | ------------------------------- | --------------------------------- |
   | 1    | 最近对 BlockID 的读取或写入成功 | 无错误，且未使用默认数据          |
   | 2    | 应用未指示 RAM 块潜在变更       | 上次读取/写入后，未被标记为已修改 |

   ```mermaid
   flowchart TD
       Valid[VALID / UNCHANGED] --> Check1{最近操作成功?<br/>（无错误/未用默认数据）}
       Check1 -->|是| Check2{应用未指示变更?}
       Check2 -->|是| Preserve[保持 VALID / UNCHANGED]
       Check1 -->|否| Leave[离开该状态]
       Check2 -->|否| Leave
   ```

4. **状态转换示例**

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant RAM as RAM 块
       participant NV as NV 块
   
       Note over RAM,NV: 初始: 其他状态 → 进入 VALID/UNCHANGED
   
       App->>NvM: NvM_ReadBlock(BlockID)
       NvM->>NV: 读取成功
       NV-->>RAM: 加载数据
       RAM-->>App: 返回数据
       Note over RAM: ✅ 进入 VALID/UNCHANGED<br/>（条件 2 满足）
   
       App->>RAM: 修改数据
       Note over RAM: 应用已修改<br/>状态可能变更
   
       App->>NvM: NvM_WriteBlock(BlockID)
       NvM->>NV: 写入成功
       RAM-->>App: 写入完成
       Note over RAM: ✅ 回到 VALID/UNCHANGED<br/>（条件 3 满足）
   ```

5. **相关规范**

   | 规范            | 内容                          |
   | --------------- | ----------------------------- |
   | `SWS_NvM_00015` | `NvM_GetErrorStatus` API      |
   | `SWS_NvM_00472` | 写入成功后的状态更新          |
   | `SWS_NvM_00344` | 禁用状态修改 API 时的写入行为 |
   | `SWS_NvM_00345` | 禁用状态修改 API 时的读取行为 |

6. **补充说明**

   - 此状态是 NvM 模块的**稳定状态**，表示 RAM 与 NV 数据一致
   - 应用读取数据后不修改，状态保持不变
   - 应用修改数据后，需通过状态修改 API（如 `NvM_SetRamBlockStatus`）或写入操作来更新状态
   - 写入成功（单块或全部）是回到此状态的主要方式

### VALID / CHANGED 状态

> 此状态表示 RAM 块内容可能与对应 NV 块内容不同。对于数据集块，此条件适用于最后处理的实例。块所有者可通过 API 信号指示 RAM 内容已变更，使块进入此状态。

1. **状态含义**

   | 条件               | 说明                                   |
   | ------------------ | -------------------------------------- |
   | RAM 与 NV 可能不同 | RAM 块内容可能与 NV 块内容不一致       |
   | 数据集块特例       | 适用于最后处理的实例                   |
   | 最近操作成功       | 最后一次块操作成功完成                 |
   | 未被主动失效       | 块未被请求标记为无效                   |
   | 变更信号           | 块所有者可通知 NvM 模块 RAM 内容已变更 |

2. **进入条件**

   满足以下任意一项即可进入 VALID / CHANGED 状态：

   | #    | 触发事件                                      | 说明                             |
   | ---- | --------------------------------------------- | -------------------------------- |
   | 1    | `NvM_SetRamBlockStatus(BlockID, TRUE)` 被调用 | 应用主动标记 RAM 已修改          |
   | 2    | `NvM_WriteBlock` 被调用                       | 写入请求表明数据将变更           |
   | 3    | `NvM_WriteAll` 处理该块                       | 批量写入时块被包含               |
   | 4    | `NvM_ReadBlock` 返回默认数据                  | 读取时使用了默认数据（隐式恢复） |
   | 5    | `NvM_RestoreBlockDefaults` 成功完成           | 显式恢复完成                     |
   | 6    | `NvM_ReadAll` 处理该块时返回默认数据          | 启动加载时使用了默认数据         |
   | 7    | `NvM_ValidateAll` 成功处理该块                | 验证全部完成                     |

   ```mermaid
   flowchart TD
       Start[进入 VALID/CHANGED] --> Cond1[NvM_SetRamBlockStatus TRUE]
       Start --> Cond2[NvM_WriteBlock 被调用]
       Start --> Cond3[NvM_WriteAll 处理该块]
       Start --> Cond4[读取返回默认数据]
       Start --> Cond5[NvM_RestoreBlockDefaults 成功]
       Start --> Cond6[NvM_ReadAll 返回默认数据]
       Start --> Cond7[NvM_ValidateAll 成功]
   
       Cond1 --> Valid[VALID / CHANGED]
       Cond2 --> Valid
       Cond3 --> Valid
       Cond4 --> Valid
       Cond5 --> Valid
       Cond6 --> Valid
       Cond7 --> Valid
   ```

3. **保持条件**

   以下条件**任意一项**满足，状态即保持：

   | #    | 条件                                   | 说明                          |
   | ---- | -------------------------------------- | ----------------------------- |
   | 1    | 块所有者已指示 RAM 块潜在变更          | 应用主动标记修改              |
   | 2    | 上次读取时返回了默认数据（隐式或显式） | 恢复操作导致 RAM 与 NV 不一致 |

   ```mermaid
   flowchart TD
       Valid[VALID / CHANGED] --> Check1{块所有者<br/>指示变更?}
       Check1 -->|是| Preserve[保持 VALID / CHANGED]
       Check1 -->|否| Check2{上次读取<br/>返回默认数据?}
       Check2 -->|是| Preserve
       Check2 -->|否| Leave[离开该状态]
   ```

4. **状态转换示例**

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant RAM as RAM 块
       participant NV as NV 块
   
       Note over RAM,NV: 场景 1：应用主动标记修改
   
       App->>NvM: NvM_SetRamBlockStatus(BlockID, TRUE)
       Note over RAM: ✅ 进入 VALID/CHANGED<br/>（条件 1 满足）
   
       App->>NvM: NvM_WriteBlock(BlockID)
       NvM->>NV: 写入成功
       Note over RAM: 写入完成后回到<br/>VALID/UNCHANGED
   
       Note over RAM,NV: 场景 2：读取返回默认数据
   
       App->>NvM: NvM_ReadBlock(BlockID)
       NvM->>RAM: 加载默认数据（NV 损坏）
       RAM-->>App: 返回默认数据
       Note over RAM: ✅ 进入 VALID/CHANGED<br/>（条件 4 满足）
   ```

5. **VALID / UNCHANGED 与 VALID / CHANGED 对比**

   | 对比项           | VALID / UNCHANGED | VALID / CHANGED                  |
   | ---------------- | ----------------- | -------------------------------- |
   | RAM 与 NV 一致性 | 一致              | 可能不一致                       |
   | 变更信号         | 应用未指示变更    | 应用已指示变更 或 使用了默认数据 |
   | 典型触发         | 读取/写入成功     | 标记修改、写入请求、默认数据恢复 |
   | 写入行为         | 正常写入          | 需先写入 NV 以同步               |

6. **相关规范**

   | 规范                  | 内容                          |
   | --------------------- | ----------------------------- |
   | `SWS_NvM_00472`       | 写入成功后的状态更新          |
   | `SWS_NvM_00344`       | 禁用状态修改 API 时的写入行为 |
   | `SWS_NvM_00345`       | 禁用状态修改 API 时的读取行为 |
   | `SWS_NvM_00389-00390` | 隐式恢复机制                  |
   | `SWS_NvM_00391-00392` | 显式恢复机制                  |

7. **补充说明**

   - 此状态表示 RAM 与 NV 数据**可能不一致**
   - `NvM_WriteAll` 会处理此状态的块，将 RAM 数据写入 NV
   - 写入成功后将回到 `VALID / UNCHANGED` 状态
   - 默认数据恢复（隐式或显式）会进入此状态，因为 RAM 与 NV 内容不同

### INVALID / UNCHANGED 状态

> 此状态表示 NV 块无效。对于数据集块，意味着最后处理的实例的 NV 块内容无效。此状态通常表示数据不可用，需要通过加载或恢复机制来离开该状态。

1. **状态含义**

   | 条件         | 说明                           |
   | ------------ | ------------------------------ |
   | NV 块无效    | 非易失性存储中的数据不可信     |
   | 数据集块特例 | 最后处理的实例的 NV 块内容无效 |
   | 数据不可用   | 需通过加载或恢复来离开此状态   |

2. **进入条件**

   满足以下任意一项即可进入 INVALID / UNCHANGED 状态：

   | #    | 触发事件                                        | 说明                  |
   | ---- | ----------------------------------------------- | --------------------- |
   | 1    | `NvM_SetRamBlockStatus(BlockID, FALSE)` 被调用  | 应用主动标记 RAM 无效 |
   | 2    | `NvM_ReadBlock` 指示用户请求失效                | 块被主动失效          |
   | 3    | `NvM_ReadBlock` 检测到数据损坏（CRC 配置时）    | CRC 校验失败          |
   | 4    | `NvM_ReadBlock` 检测到错误的 StaticID（配置时） | 静态块 ID 不匹配      |
   | 5    | `NvM_WriteBlock` 未成功完成                     | 写入失败              |
   | 6    | `NvM_WriteAll` 写入该块未成功                   | 批量写入失败          |
   | 7    | `NvM_InvalidateNvBlock` 成功完成                | 主动失效成功          |
   | 8    | `NvM_EraseNvBlock` 成功完成                     | 擦除成功              |

   ```mermaid
   flowchart TD
       Start[进入 INVALID/UNCHANGED] --> Cond1[NvM_SetRamBlockStatus FALSE]
       Start --> Cond2[用户请求失效]
       Start --> Cond3[CRC 校验失败]
       Start --> Cond4[StaticID 错误]
       Start --> Cond5[写入失败]
       Start --> Cond6[批量写入失败]
       Start --> Cond7[主动失效成功]
       Start --> Cond8[擦除成功]

       Cond1 --> Invalid[INVALID / UNCHANGED]
       Cond2 --> Invalid
       Cond3 --> Invalid
       Cond4 --> Invalid
       Cond5 --> Invalid
       Cond6 --> Invalid
       Cond7 --> Invalid
       Cond8 --> Invalid
   ```

3. **保持条件**

   以下条件**任意一项**满足，状态即保持：

   | #    | 条件                           | 说明                             |
   | ---- | ------------------------------ | -------------------------------- |
   | 1    | 块状态在早期初始化时未知       | 等待 ReadAll 或首次操作          |
   | 2    | 块被检测为损坏或 StaticID 错误 | CRC 或 ID 校验失败               |
   | 3    | 最近成功的操作是失效           | `NvM_InvalidateNvBlock` 执行成功 |
   | 4    | 当前读取失败且无默认数据       | 无法恢复                         |
   | 5    | 最近成功的操作是擦除           | `NvM_EraseNvBlock` 执行成功      |

   ```mermaid
   flowchart TD
       Invalid[INVALID / UNCHANGED] --> Check1{状态在<br/>早期初始化?}
       Check1 -->|是| Preserve[保持 INVALID / UNCHANGED]
       Check1 -->|否| Check2{损坏或<br/>StaticID 错误?}
       Check2 -->|是| Preserve
       Check2 -->|否| Check3{最近操作<br/>是失效?}
       Check3 -->|是| Preserve
       Check3 -->|否| Check4{读取失败且<br/>无默认数据?}
       Check4 -->|是| Preserve
       Check4 -->|否| Check5{最近操作<br/>是擦除?}
       Check5 -->|是| Preserve
       Check5 -->|否| Leave[离开该状态]
   ```

4. **离开 INVALID / UNCHANGED 状态的路径**

   ```mermaid
   flowchart LR
       Invalid[INVALID / UNCHANGED] --> Path1[错误恢复成功<br/>→ VALID/CHANGED]
       Invalid --> Path2[读取成功且 CRC 通过<br/>→ VALID/UNCHANGED]
       Invalid --> Path3[成功写入<br/>→ VALID/UNCHANGED]
   ```

5. **三种有效状态对比**

   | 对比项         | VALID / UNCHANGED | VALID / CHANGED | INVALID / UNCHANGED    |
   | -------------- | ----------------- | --------------- | ---------------------- |
   | RAM 数据有效   | ✅ 有效            | ✅ 有效          | ❌ 无效                 |
   | RAM 与 NV 一致 | ✅ 一致            | ❌ 可能不一致    | —                      |
   | 数据可用性     | 可用              | 可用            | 不可用                 |
   | 典型触发       | 读取/写入成功     | 修改/恢复       | 失效/CRC 错误/写入失败 |
   | 下一动作       | 保持或修改        | 写入 NV         | 恢复或加载             |

6. **补充说明**

   - 此状态表示 NV 块数据**不可用**，通常由硬件错误、CRC 校验失败、主动失效或擦除引起
   - `INVALID / CHANGED` 状态**不可达**（NvM 规范中明确说明）
   - 离开此状态需要通过错误恢复（加载默认值）或成功读取/写入来重新建立有效数据
   - 应用层可通过 `NvM_SetRamBlockStatus(FALSE)` 主动将块置为此状态，强制下次读取时重新加载

7. **相关规范**

   | 规范            | 内容                       |
   | --------------- | -------------------------- |
   | `SWS_NvM_00389` | 读取错误恢复（加载默认值） |
   | `SWS_NvM_00391` | 显式恢复 API               |
   | `SWS_NvM_00575` | 隐式恢复触发条件           |
   | `SWS_NvM_00174` | 不完整写入检测             |
   | `SWS_NvM_00168` | 写入重试机制               |

## 应用与 NVRAM 管理器之间的通信与隐式同步

> 为减少锁定/解锁开销或其他同步方法的使用，应用与 NvM 模块之间的通信需遵循严格的步骤序列，以确保可靠通信、避免 RAM 块数据损坏，并保证正确的同步。当多个应用共享同一 RAM 块时，数据完整性由应用层自行保证。

---

1. **访问模型的基本假设**

   通信模型涉及两方：

   | 参与方       | 角色                      |
   | ------------ | ------------------------- |
   | **应用层**   | 读写 RAM 块数据           |
   | **NvM 模块** | 管理 RAM 与 NV 之间的同步 |

2. **多应用共享 RAM 块的规则** [SWS_NvM_00697]

   > 如果多个应用使用同一 RAM 块，**确保 RAM 块数据完整性不是 NvM 模块的职责**。应用必须自行同步对 RAM 块的访问，并保证在 NVRAM 操作期间不发生不适当的访问。

   - NvM 模块不负责多应用间的数据一致性
   - 应用需自行实现同步机制
   - 多个应用通过不同临时 RAM 块共享 NVRAM 块时，同步更复杂

   ```mermaid
   flowchart TD
       subgraph App1[应用 A]
           A1[RAM 块访问]
       end

       subgraph App2[应用 B]
           B1[RAM 块访问]
       end

       subgraph NvM[NvM 模块]
           N1[NV 同步]
       end

       A1 --> RAM[共享 RAM 块]
       B1 --> RAM
       RAM --> N1

       Note[同步由应用层自行保证<br/>NvM 不负责多应用数据一致性]
   ```

3. **回调通知的注意事项** [SWS_NvM_00697]

   > 使用回调作为通知方式时，可能发生应用收到并非由其发起的请求的通知。

   - 场景：应用 A 发起请求，应用 B 收到回调通知
   - 原因：多个应用共享同一块
   - 应对：应用需检查请求是否由自己发起

   ```mermaid
   sequenceDiagram
       participant AppA as 应用 A
       participant AppB as 应用 B
       participant NvM as NvM 模块

       AppA->>NvM: 发起请求
       NvM->>AppA: 回调通知（正确）
       NvM->>AppB: 回调通知（也可能收到）

       Note over AppB: 应用 B 需检查<br/>请求是否由自己发起
   ```

4. **同步通信的步骤序列**

   ```mermaid
   flowchart TD
       subgraph Step1[步骤 1]
           S1[应用读取 RAM 块<br/>（无需 NvM 参与）]
       end

       subgraph Step2[步骤 2]
           S2[应用修改 RAM 块数据<br/>（无需 NvM 参与）]
       end

       subgraph Step3[步骤 3]
           S3[应用指示变更<br/>NvM_SetRamBlockStatus TRUE]
       end

       subgraph Step4[步骤 4]
           S4[NvM 将 RAM 数据写入 NV<br/>（NvM_WriteBlock / NvM_WriteAll）]
       end

       Step1 --> Step2 --> Step3 --> Step4
   ```

5. **同步机制总结**

   | 同步方式       | 说明                                      | 适用场景           |
   | -------------- | ----------------------------------------- | ------------------ |
   | **隐式同步**   | NvM 自动检测 RAM 变更并同步到 NV          | 标准场景           |
   | **显式同步**   | 应用调用 `NvM_SetRamBlockStatus` 指示变更 | 需要精确控制时     |
   | **回调通知**   | NvM 完成操作后通知应用                    | 异步操作完成确认   |
   | **多应用同步** | 应用层自行实现                            | 多个应用共享同一块 |

6. **相关规范**

   | 规范            | 内容                          |
   | --------------- | ----------------------------- |
   | `SWS_NvM_00697` | 多应用共享块的数据完整性责任  |
   | `SWS_NvM_00344` | 禁用状态修改 API 时的写入行为 |
   | `SWS_NvM_00345` | 禁用状态修改 API 时的读取行为 |
   | `SWS_NvM_00472` | 写入成功后的状态更新          |

7. **补充说明**

   - 单应用访问时：应用可自由读写 RAM，NvM 负责同步到 NV
   - 多应用共享时：应用需自行协调访问顺序和时机
   - 回调通知：应用收到通知后需验证请求来源
   - 同步目的：避免数据损坏，保证 RAM 与 NV 的一致性

### 写请求的隐式同步规则

> 应用在发起 `NvM_WriteBlock` 或 `NvM_WritePRAMBlock` 写请求时，需遵循特定的步骤序列，以确保应用与 NvM 模块之间的隐式同步正确进行，避免数据损坏。

---

1. **写请求的完整步骤** [SWS_NvM_00698]

   | 步骤  | 操作                | 说明                                                         |
   | ----- | ------------------- | ------------------------------------------------------------ |
   | **1** | 应用填充 RAM 块数据 | 将待写入的数据填入 RAM 块                                    |
   | **2** | 应用发起写请求      | 调用 `NvM_WriteBlock` 或 `NvM_WritePRAMBlock`，控制权转移至 NvM 模块 |
   | **3** | 应用等待完成        | 不应修改 RAM 块，但可读取其内容                              |
   | **4** | 应用获取结果        | 通过轮询 `NvM_GetErrorStatus` 或回调函数获知完成状态         |
   | **5** | 应用复用 RAM 块     | NvM 操作完成后，RAM 块可重新用于修改                         |

2. **步骤流程图**

   ```mermaid
   flowchart TD
       Step1[步骤 1: 应用填充 RAM 块数据] --> Step2
       Step2[步骤 2: 发起写请求<br/>NvM_WriteBlock / NvM_WritePRAMBlock] --> Step3
       Step3[步骤 3: 等待完成<br/>可读不可修改] --> Step4
       Step4[步骤 4: 获取结果<br/>轮询或回调] --> Step5
       Step5[步骤 5: RAM 块可复用]
   ```

3. **各步骤的详细说明**

   - **步骤 1 和 2**：应用层准备数据并触发 NvM 写入操作，将控制权交给 NvM。

   - **步骤 3 的核心约束**：从请求发出到完成通知期间，应用**不应修改** RAM 块数据，但可以读取。这是为了保证 NvM 写入的数据与请求时一致。

   - **步骤 4 的获取方式**：应用可以选择**轮询**或配置**回调函数**来获知请求结果。

   - **步骤 5 的恢复**：NvM 操作完成后，RAM 块才可重新用于修改。

4. **时序图**

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant RAM as RAM 块
       participant NvM as NvM 模块
       participant NV as NV 块

       App->>RAM: ① 填充数据
       App->>NvM: ② NvM_WriteBlock(BlockID)
       NvM-->>App: 立即返回

       Note over App,NV: ③ 应用不可修改 RAM 块<br/>（仅可读取）

       NvM->>RAM: 读取数据
       NvM->>NV: 写入 NV

       alt 轮询方式
           loop 轮询
               App->>NvM: NvM_GetErrorStatus(BlockID)
               NvM-->>App: NVM_REQ_PENDING
           end
           NvM-->>App: NVM_REQ_OK / NOT_OK
       else 回调方式
           NvM->>App: 回调函数通知
       end

       Note over App,RAM: ⑤ RAM 块可重新修改
   ```

5. **写请求期间的应用行为**

   | 允许的操作        | 禁止的操作                 |
   | ----------------- | -------------------------- |
   | ✅ 读取 RAM 块内容 | ❌ 修改 RAM 块内容          |
   | ✅ 轮询请求状态    | ❌ 发起新的写请求（同一块） |
   | ✅ 接收回调通知    | ❌ 假设操作已完成而不确认   |

6. **相关规范**

   | 规范            | 内容                           |
   | --------------- | ------------------------------ |
   | `SWS_NvM_00698` | 写请求隐式同步规则             |
   | `SWS_NvM_00185` | 请求入队状态 `NVM_REQ_PENDING` |
   | `SWS_NvM_00270` | 作业成功状态 `NVM_REQ_OK`      |
   | `SWS_NvM_00175` | 单块请求终止结果记录           |
   | `SWS_NvM_00176` | 单块回调配置                   |
   | `SRS_Mem_00013` | 相关需求                       |

### 读请求的隐式同步规则

> 应用在发起 `NvM_ReadBlock` 或 `NvM_ReadPRAMBlock` 读请求时，需遵循特定的步骤序列，以确保应用与 NvM 模块之间的隐式同步正确进行。读取期间应用不得访问 RAM 块，直到操作完成。

---

1. **读请求的完整步骤** [SWS_NvM_00699]

   | 步骤  | 操作            | 说明                                                         |
   | ----- | --------------- | ------------------------------------------------------------ |
   | **1** | 应用提供 RAM 块 | 准备一个 RAM 块，供 NvM 填充 NV 数据                         |
   | **2** | 应用发起读请求  | 调用 `NvM_ReadBlock` 或 `NvM_ReadPRAMBlock`，控制权转移至 NvM 模块 |
   | **3** | 应用等待完成    | **不得读取或写入** RAM 块                                    |
   | **4** | 应用获取结果    | 通过轮询 `NvM_GetErrorStatus` 或回调函数获知完成状态         |
   | **5** | 应用使用数据    | NvM 操作完成后，RAM 块包含新数据，可供应用使用               |

2. **步骤流程图**

   ```mermaid
   flowchart TD
       Step1[步骤 1: 应用提供 RAM 块] --> Step2
       Step2[步骤 2: 发起读请求<br/>NvM_ReadBlock / NvM_ReadPRAMBlock] --> Step3
       Step3[步骤 3: 等待完成<br/>不可读也不可写] --> Step4
       Step4[步骤 4: 获取结果<br/>轮询或回调] --> Step5
       Step5[步骤 5: RAM 块包含新数据<br/>可供应用使用]
   ```

3. **各步骤的详细说明**

   - **步骤 1 和 2**：应用准备好 RAM 块（可为空或已存在数据），然后触发 NvM 读取操作，将控制权交给 NvM。

   - **步骤 3 的核心约束**：从请求发出到完成通知期间，应用**不得读取或写入** RAM 块。这是为了防止应用读取到未完成的数据或被 NvM 覆盖的数据，造成数据不一致。

   - **步骤 4 的获取方式**：应用可以选择**轮询**或配置**回调函数**来获知请求结果。

   - **步骤 5 的恢复**：NvM 操作完成后，RAM 块数据已更新，应用可正常访问。

4. **时序图**

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant RAM as RAM 块
       participant NvM as NvM 模块
       participant NV as NV 块

       App->>RAM: ① 提供 RAM 块<br/>（可为空）
       App->>NvM: ② NvM_ReadBlock(BlockID)
       NvM-->>App: 立即返回

       Note over App,RAM: ③ 应用不可访问 RAM 块<br/>（不可读也不可写）

       NvM->>NV: 读取 NV 数据
       NV-->>NvM: 返回数据
       NvM->>RAM: ④ 写入 RAM 块

       alt 轮询方式
           loop 轮询
               App->>NvM: NvM_GetErrorStatus(BlockID)
               NvM-->>App: NVM_REQ_PENDING
           end
           NvM-->>App: NVM_REQ_OK / NOT_OK
       else 回调方式
           NvM->>App: 回调函数通知
       end

       Note over App,RAM: ⑤ RAM 块包含新数据<br/>可供应用使用
   ```

5. **读请求期间的应用行为**

   | 允许的操作     | 禁止的操作               |
   | -------------- | ------------------------ |
   | ✅ 轮询请求状态 | ❌ 读取 RAM 块内容        |
   | ✅ 接收回调通知 | ❌ 写入 RAM 块内容        |
   | ✅ 等待操作完成 | ❌ 假设操作已完成而不确认 |

6. **写请求 vs 读请求对比**

   | 对比项          | 写请求              | 读请求             |
   | --------------- | ------------------- | ------------------ |
   | **步骤 1**      | 应用填充 RAM 块数据 | 应用提供 RAM 块    |
   | **步骤 3 约束** | 可读不可写          | **不可读也不可写** |
   | **步骤 5 结果** | RAM 块可复用        | RAM 块包含新数据   |
   | **数据方向**    | RAM → NV            | NV → RAM           |

7. **相关规范**

   | 规范            | 内容                           |
   | --------------- | ------------------------------ |
   | `SWS_NvM_00699` | 读请求隐式同步规则             |
   | `SWS_NvM_00185` | 请求入队状态 `NVM_REQ_PENDING` |
   | `SWS_NvM_00270` | 作业成功状态 `NVM_REQ_OK`      |
   | `SWS_NvM_00175` | 单块请求终止结果记录           |
   | `SWS_NvM_00176` | 单块回调配置                   |
   | `SRS_Mem_00013` | 相关需求                       |

### 恢复默认值请求的隐式同步规则

> 应用在发起 `NvM_RestoreBlockDefaults` 或 `NvM_RestorePRAMBlockDefaults` 恢复默认值请求时，需遵循特定的步骤序列，以确保应用与 NvM 模块之间的隐式同步正确进行。恢复期间应用不得访问 RAM 块，直到操作完成。

---

1. **恢复默认值请求的完整步骤** [SWS_NvM_00700]

   | 步骤  | 操作             | 说明                                                         |
   | ----- | ---------------- | ------------------------------------------------------------ |
   | **1** | 应用提供 RAM 块  | 准备一个 RAM 块，供 NvM 填充 ROM 默认数据                    |
   | **2** | 应用发起恢复请求 | 调用 `NvM_RestoreBlockDefaults` 或 `NvM_RestorePRAMBlockDefaults`，控制权转移至 NvM 模块 |
   | **3** | 应用等待完成     | **不得读取或写入** RAM 块                                    |
   | **4** | 应用获取结果     | 通过轮询 `NvM_GetErrorStatus` 或回调函数获知完成状态         |
   | **5** | 应用使用数据     | NvM 操作完成后，RAM 块包含 ROM 默认数据，可供应用使用        |

2. **步骤流程图**

   ```mermaid
   flowchart TD
       Step1[步骤 1: 应用提供 RAM 块] --> Step2
       Step2[步骤 2: 发起恢复请求<br/>NvM_RestoreBlockDefaults<br/>NvM_RestorePRAMBlockDefaults] --> Step3
       Step3[步骤 3: 等待完成<br/>不可读也不可写] --> Step4
       Step4[步骤 4: 获取结果<br/>轮询或回调] --> Step5
       Step5[步骤 5: RAM 块包含 ROM 默认数据<br/>可供应用使用]
   ```

3. **各步骤的详细说明**

   - **步骤 1 和 2**：应用准备好 RAM 块，然后触发 NvM 恢复默认值操作，将控制权交给 NvM。

   - **步骤 3 的核心约束**：从请求发出到完成通知期间，应用**不得读取或写入** RAM 块。这是为了防止应用读取到未完成的数据或被覆盖的数据，造成数据不一致。

   - **步骤 4 的获取方式**：应用可以选择**轮询**或配置**回调函数**来获知请求结果。

   - **步骤 5 的恢复**：NvM 操作完成后，RAM 块数据已更新为 ROM 默认数据，应用可正常访问。

4. **时序图**

   ```mermaid
   sequenceDiagram
       participant App as 应用层
       participant RAM as RAM 块
       participant NvM as NvM 模块
       participant ROM as ROM 块
       participant NV as NV 块

       App->>RAM: ① 提供 RAM 块<br/>（可为空）
       App->>NvM: ② NvM_RestoreBlockDefaults(BlockID)
       NvM-->>App: 立即返回

       Note over App,RAM: ③ 应用不可访问 RAM 块<br/>（不可读也不可写）

       NvM->>ROM: 读取 ROM 默认数据
       ROM-->>NvM: 返回默认数据
       NvM->>RAM: ④ 写入 RAM 块

       Note over NV: NV 块保持不变<br/>[SWS_NvM_00392]

       alt 轮询方式
           loop 轮询
               App->>NvM: NvM_GetErrorStatus(BlockID)
               NvM-->>App: NVM_REQ_PENDING
           end
           NvM-->>App: NVM_REQ_OK / NOT_OK
       else 回调方式
           NvM->>App: 回调函数通知
       end

       Note over App,RAM: ⑤ RAM 块包含 ROM 默认数据<br/>可供应用使用
   ```

5. **恢复请求期间的应用行为**

   | 允许的操作     | 禁止的操作               |
   | -------------- | ------------------------ |
   | ✅ 轮询请求状态 | ❌ 读取 RAM 块内容        |
   | ✅ 接收回调通知 | ❌ 写入 RAM 块内容        |
   | ✅ 等待操作完成 | ❌ 假设操作已完成而不确认 |

6. **恢复默认值请求的核心特点** [SWS_NvM_00392]

   - 数据来源：**ROM 块**（只读默认数据）
   - NV 块状态：**保持不变**（仅 RAM 块被更新）
   - 适用 API：
     - `NvM_RestoreBlockDefaults`：普通块
     - `NvM_RestorePRAMBlockDefaults`：永久 RAM 块

7. **三种请求对比**

   | 对比项          | 写请求              | 读请求             | 恢复默认值请求     |
   | --------------- | ------------------- | ------------------ | ------------------ |
   | **步骤 1**      | 应用填充 RAM 块数据 | 应用提供 RAM 块    | 应用提供 RAM 块    |
   | **数据方向**    | RAM → NV            | NV → RAM           | ROM → RAM          |
   | **步骤 3 约束** | 可读不可写          | **不可读也不可写** | **不可读也不可写** |
   | **NV 块变化**   | 被更新              | 不变               | **不变**           |
   | **数据来源**    | 应用数据            | NV 存储            | ROM 默认数据       |

8. **相关规范**

   | 规范            | 内容                           |
   | --------------- | ------------------------------ |
   | `SWS_NvM_00700` | 恢复默认值请求隐式同步规则     |
   | `SWS_NvM_00392` | 恢复操作不修改 NV 块           |
   | `SWS_NvM_00391` | 显式恢复 API 定义              |
   | `SWS_NvM_00185` | 请求入队状态 `NVM_REQ_PENDING` |
   | `SWS_NvM_00270` | 作业成功状态 `NVM_REQ_OK`      |
   | `SRS_Mem_08548` | 相关需求                       |



### 多块读请求的隐式同步规则

> `NvM_ReadAll` 请求仅在系统启动时由 BSW 模式管理器触发，用于将所有配置的永久 RAM 块填充启动所需数据。如果请求部分或完全失败，NvM 向 DEM 报告并向 BSW 模式管理器返回错误，由 DEM 和 BSW 模式管理器决定后续措施。

---

1. **请求触发与范围**

   - 触发者：**BSW 模式管理器**（唯一触发方）
   - 触发时机：**系统启动时**
   - 目的：将所有配置的永久 RAM 块填充启动所需数据

2. **错误处理与上报**

   | 结果     | 处理                                   |
   | -------- | -------------------------------------- |
   | 全部成功 | 正常启动                               |
   | 部分成功 | 向 DEM 报告，向 BSW 模式管理器返回错误 |
   | 完全失败 | 向 DEM 报告，向 BSW 模式管理器返回错误 |

   - DEM 和 BSW 模式管理器决定后续措施
   - NvM 模块本身不处理这些决策

3. **多块读请求的完整步骤** [SWS_NvM_00701]

   | 步骤  | 操作                   | 说明                                                         |
   | ----- | ---------------------- | ------------------------------------------------------------ |
   | **1** | BSW 模式管理器发起请求 | 调用 `NvM_ReadAll`，控制权转移至 NvM 模块                    |
   | **2** | BSW 模式管理器获取结果 | 通过轮询 `NvM_GetErrorStatus(0)` 或回调函数获知完成状态      |
   | **3** | 单块回调通知           | 每处理完一个 NVRAM 块时，调用单块回调（如配置了 `NvMSingleBlockCallback`） |

4. **时序图**

   ```mermaid
   sequenceDiagram
       participant BswM as BSW 模式管理器
       participant NvM as NvM 模块
       participant NV as NV 块
       participant RTE as RTE
       participant SWC1 as SW-C 1
       participant SWC2 as SW-C 2

       Note over BswM,SWC2: 系统启动阶段

       BswM->>NvM: ① NvM_ReadAll()
       NvM-->>BswM: 立即返回

       loop 处理每个块
           NvM->>NV: 读取块数据
           NV-->>NvM: 返回数据
           NvM->>NvM: 更新 RAM 块

           alt 配置了单块回调
               NvM->>RTE: ③ 单块回调
               RTE->>SWC1: 启动 SW-C 1
           end
       end

       alt 轮询方式
           loop 轮询
               BswM->>NvM: NvM_GetErrorStatus(0)
               NvM-->>BswM: NVM_REQ_PENDING
           end
           NvM-->>BswM: NVM_REQ_OK / NOT_OK
       else 回调方式
           NvM->>BswM: 多块回调通知
       end

       alt 部分/完全失败
           NvM->>DEM: 报告错误
       end
   ```

5. **单块回调的作用**

   - **触发条件**：每处理完一个 NVRAM 块后
   - **配置方式**：`NvMSingleBlockCallback = TRUE`
   - **核心价值**：RTE 利用这些回调**逐个启动 SW-C**，而无需等待所有块加载完成

6. **状态查询方式**

   | 方式         | 说明                                             |
   | ------------ | ------------------------------------------------ |
   | **轮询**     | BSW 模式管理器周期性调用 `NvM_GetErrorStatus(0)` |
   | **多块回调** | 配置 `NvMMultiBlockCallback`，完成后通知         |
   | **单块回调** | 配置 `NvMSingleBlockCallback`，每块完成后通知    |

7. **相关规范**

   | 规范            | 内容                             |
   | --------------- | -------------------------------- |
   | `SWS_NvM_00701` | 多块读请求隐式同步规则           |
   | `SWS_NvM_00158` | `NvM_ReadAll` 调用者             |
   | `SWS_NvM_00694` | 启动状态监控                     |
   | `SWS_NvM_00394` | `NvM_GetErrorStatus(0)` 多块状态 |
   | `SWS_NvM_00179` | 多块回调配置                     |
