---
title: SecOc

categories:
  - 嵌入式
tags:
  - AUTOSAR
---



# 概述

> [!tip]
>
> 标准文件请参见https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_SecureOnboardCommunication.pdf

> SecOC（Secure Onboard Communication）模块是 AUTOSAR 基础软件中负责安全车载通信的组件，旨在为 PDU 级别的关键数据提供资源高效且实用的认证机制。它无缝集成于 AUTOSAR 通信栈中，与 PduR、CSM 和 RTE 协作，实现消息的认证与新鲜度验证。

1. **模块在 AUTOSAR 通信栈中的位置**

   ![SecOc在协议栈中的位置](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707085250041.png)

   ```mermaid
   flowchart TD
       subgraph Application[应用层]
           SWC[软件组件 SW-C]
       end
   
       subgraph RTE[RTE]
           RTE_Box[RTE]
       end
   
       subgraph COM[COM 层]
           COM_Box[COM]
       end
   
       subgraph PduR[PDU 路由器]
           PduR_Box[PduR]
       end
   
       subgraph SecOC[SecOC 模块]
           SecOC_Box[SecOC<br/>认证/新鲜度处理]
       end
   
       subgraph Crypto[加密服务]
           CSM[Crypto Service Manager]
       end
   
       subgraph Transport[传输层]
           TP[传输协议]
           IF[通信接口]
       end
   
       SWC --> RTE_Box
       RTE_Box --> COM_Box
       COM_Box --> PduR_Box
       PduR_Box --> SecOC_Box
       PduR_Box --> TP
       PduR_Box --> IF
       SecOC_Box --> CSM
       SecOC_Box --> RTE_Box
   ```

2. **PduR 集成与交互**

   - **发送方向**：
     - PduR 将需要保护的 I-PDU 路由给 SecOC
     - SecOC 添加安全相关信息（MAC、FV 等）后生成 Secured I-PDU
     - 返回给 PduR 进行后续路由和发送

   - **接收方向**：
     - PduR 将收到的 Secured I-PDU 路由给 SecOC
     - SecOC 验证 MAC 和新鲜度值
     - 验证通过后，将 Authentic I-PDU 返回给 PduR 继续路由

   ```mermaid
   flowchart LR
       subgraph Send[发送方向]
           PduR1[PduR] -->|I-PDU| SecOC_S[SecOC]
           SecOC_S -->|Secured I-PDU| PduR1
           PduR1 -->|发送| Bus[总线]
       end
   
       subgraph Receive[接收方向]
           Bus2[总线] -->|接收| PduR2[PduR]
           PduR2 -->|Secured I-PDU| SecOC_R[SecOC]
           SecOC_R -->|I-PDU| PduR2
       end
   ```

3. **与其他模块的交互**

   | 交互模块                  | 目的                             |
   | ------------------------- | -------------------------------- |
   | **PduR**                  | 路由安全相关的 I-PDU             |
   | **CSM（加密服务管理器）** | 使用加密服务（MAC 计算、验证等） |
   | **RTE**                   | 密钥管理和计数器管理             |

4. **支持的通信场景**

   - PduR 支持的所有通信范式和原则，SecOC 均支持：
     - **多播通信**（Multicast）
     - **传输协议**（Transport Protocols）
     - **PduR 网关**（PduR Gateway）

5. **规范涵盖内容**

   - SecOC 接口的详细规范
   - 功能描述
   - 配置参数

6. **相关规范**

   | 文档                                         | 内容                   |
   | -------------------------------------------- | ---------------------- |
   | `AUTOSAR_SWS_SecureOnboardCommunication.pdf` | SecOC 软件规范（本文） |
   | `AUTOSAR_SRS_SecureOnboardCommunication.pdf` | SecOC 需求规范         |
   | `AUTOSAR_SWS_CryptoServiceManager.pdf`       | CSM 模块规范           |
   | `AUTOSAR_SWS_PDURouter.pdf`                  | PduR 模块规范          |



> 对敏感数据进行认证和完整性保护对于确保车辆系统的正确和安全功能至关重要——这保证了接收到的数据来自正确的 ECU 且值正确。SecOC 模块旨在 PDU 级别为敏感数据提供资源高效且实用的认证机制。

1. **认证与完整性保护的必要性**

   - 确保接收到的数据**来源正确**（来自合法的 ECU）
   - 确保接收到的数据**值正确**（未被篡改）
   - 保护车辆系统的正确和安全功能

2. **支持的方法**

   | 方法           | 目的               | 认证者术语            |
   | -------------- | ------------------ | --------------------- |
   | **对称方法**   | 真实性与完整性保护 | 消息认证码（MAC）     |
   | **非对称方法** | 真实性与完整性保护 | 数字签名（Signature） |

   - 两种方法在概念上高度相似，目标一致
   - 底层原语的技术特性不同导致存在差异

3. **规范的组织方式**

   - 主要描述：使用**对称机制**的技术方法，使用对称原语的常用术语
   - 异步适配：非对称方法的适配在 **7.1.4** 章节中单独给出

4. **对称方法的核心流程**

   ```mermaid
   flowchart LR
       subgraph Sender[发送方]
           Data[原始数据] --> MAC[MAC 计算]
           Key_S[密钥] --> MAC
           MAC --> Send[发送: 数据 + MAC]
       end

       subgraph Receiver[接收方]
           Recv[接收: 数据 + MAC] --> Verify[MAC 验证]
           Key_R[密钥] --> Verify
           Verify --> Valid[✅ 有效<br/>数据来自正确 ECU<br/>且未被篡改]
           Verify --> Invalid[❌ 无效<br/>拒绝数据]
       end
   ```

5. **非对称方法的核心流程**

   ```mermaid
   flowchart LR
       subgraph Sender_Asym[发送方]
           Data_A[原始数据] --> Sign[数字签名]
           PrivKey[私钥] --> Sign
           Sign --> Send_A[发送: 数据 + 签名]
       end

       subgraph Receiver_Asym[接收方]
           Recv_A[接收: 数据 + 签名] --> Verify_A[签名验证]
           PubKey[公钥] --> Verify_A
           Verify_A --> Valid_A[✅ 有效<br/>数据来自正确 ECU<br/>且未被篡改]
           Verify_A --> Invalid_A[❌ 无效<br/>拒绝数据]
       end
   ```

6. **对称 vs 非对称对比**

   | 对比项       | 对称方法（MAC）    | 非对称方法（数字签名） |
   | ------------ | ------------------ | ---------------------- |
   | **密钥**     | 相同密钥           | 公钥 + 私钥            |
   | **密钥管理** | 需安全分发共享密钥 | 公钥可公开，私钥保密   |
   | **计算开销** | 较低               | 较高                   |
   | **密钥大小** | 较小               | 较大                   |
   | **适用场景** | 资源受限的 ECU     | 需要非否认性的场景     |

7. **相关规范**

   - 7.1.4：非对称方法的适配说明
   - `SWS_SecOC_001` 系列：对称方法的具体实现规范
   - 后续章节：详细的密钥管理、新鲜度值管理等

# 安全解决方案

> SecOC 模块提供验证车内 ECU 之间基于 PDU 通信的真实性和新鲜度所需的功能。发送方和接收方 ECU 均需实现 SecOC 模块，通过 PduR API 集成，并与外部新鲜度管理器交互，在 PDU 级别实现安全保护。

1. **模块部署要求**

   - 发送方 ECU 和接收方 ECU **均需实现** SecOC 模块
   - 两端 SecOC 模块通过 PduR API 与上下层集成
   - 发送方和接收方的 SecOC 模块都与 **PduR 模块**交互

2. **新鲜度管理**

   - 新鲜度由**外部新鲜度管理器**（Freshness Manager）提供
   - 每个可唯一标识的 Secured I-PDU（即每个安全通信链路）拥有独立的新鲜度值
   - 新鲜度值类型：
     - **计数器**（Counter）：使用前应由新鲜度管理器递增
     - **时间戳**（Timestamp）

3. **发送方行为**

   - 创建 Secured I-PDU：在 Authentic I-PDU 中添加认证信息
   - 认证信息组成：
     - **Authenticator**（如 MAC，消息认证码）
     - **Freshness Value**（新鲜度值，可选包含在 PDU 负载中）
   - 无论新鲜度值是否包含在 Secured I-PDU 负载中，**生成 Authenticator 时均需考虑该值**

4. **接收方行为**

   - 验证 Secured I-PDU 的新鲜度和真实性
   - 验证所需条件：
     - 接收到的 Secured I-PDU 应与发送方提供的相同
     - 接收方需知道发送方创建 Authenticator 时使用的**新鲜度值**

5. **完整数据流**

   ![报文视角信息流](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707090634342.png)

   ```mermaid
   flowchart TB
       subgraph Sender[发送方 ECU]
           A1[Authentic I-PDU] --> A2[SecOC 模块]
           FM1[Freshness Manager] -->|提供新鲜度值| A2
           A2 -->|添加认证信息| A3[Secured I-PDU]
           A3 --> A4[PduR → 总线]
       end
   
       subgraph Receiver[接收方 ECU]
           B1[总线 → PduR] --> B2[Secured I-PDU]
           B2 --> B3[SecOC 模块]
           FM2[Freshness Manager] -->|提供新鲜度值| B3
           B3 -->|验证| B4{验证结果}
           B4 -->|通过| B5[Authentic I-PDU → 上层]
           B4 -->|失败| B6[丢弃/安全反应]
       end
   ```

6. **关键设计要求**

   | 要求           | 说明                                            |
   | -------------- | ----------------------------------------------- |
   | **PDU 一致性** | 接收方收到的 Secured I-PDU 应与发送方提供的一致 |
   | **新鲜度同步** | 接收方需知道发送方使用的相同新鲜度值            |
   | **认证器计算** | 新鲜度值始终参与认证器计算                      |

7. **核心安全目的**

   - 验证通信的**真实性**（Authenticity）
   - 验证通信的**新鲜度**（Freshness）
   - 在 PDU 级别实现安全保护

8. **相关规范**

   - 外部 Freshness Manager 接口规范
   - PduR 模块集成规范
   - CSM 加密服务规范
   - SecOC 配置规范

## 基本组成

### Authentic I-PDU 与 Secured I-PDU

> **Authentic I-PDU** 是需要防止未授权篡改和重放攻击的 AUTOSAR I-PDU。**Secured I-PDU** 由 Authentic I-PDU 和认证信息（Authenticator）组成，可选包含新鲜度值。SecOC 模块通过对 Authenticator 进行截断来适配不同长度的 PDU。

1. **Authentic I-PDU（原始安全 PDU）**

   - 需要保护的原始 AUTOSAR I-PDU
   - 保护目标：防止未授权篡改和重放攻击

2. **Secured I-PDU（安全 PDU）**

   - 由以下几部分按顺序组成：
     - **Authentic I-PDU**
     - **Authenticator**（如 MAC）—— 可选截断
     - **Freshness Value**（新鲜度值）—— 可选包含

   **结构示意**：

   ![Secured I-PDU内容](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707091333037.png)
   
3. **组成部分长度**

   | 组成部分                 | 说明                        |
   | ------------------------ | --------------------------- |
   | **Authentic I-PDU** 长度 | 不同 Secured I-PDU 间可不同 |
   | **Freshness Value** 长度 | 不同 Secured I-PDU 间可不同 |
   | **Authenticator** 长度   | 不同 Secured I-PDU 间可不同 |

4. **Authenticator 生成**

   - **输入要素**：
     - 密钥（Key）
     - Secured I-PDU 的数据标识符（Data Identifier）
     - Authentic Payload
     - Freshness Value

   - **作用**：
     - 高度可信地证明数据来自合法源
     - 在预期时间内到达接收方 ECU

5. **Authenticator 截断**

   - **背景**：认证算法生成的 Authenticator 可能较长（如完整 MAC）
   - **目的**：当消息负载长度受限、无法容纳完整 Authenticator 时使用
   - **配置参数**：`SecOCAuthInfoTruncLength`

   | 配置方式                      | 说明                                                         |
   | ----------------------------- | ------------------------------------------------------------ |
   | **按 Secured I-PDU 单独配置** | 每个 Secured I-PDU 可独立配置截断长度                        |
   | **截断方向**                  | 仅保留 Authenticator 的**最高有效位**（Most Significant Bits） |

   ![截断例子](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707091635915.png)
   
6. **头信息（Secured I-PDU Header）** [SWS_SecOC_00261]

   - **作用**：指示 Authentic I-PDU 的长度（字节数）
   - **配置参数**：`SecOCAuthPduHeaderLength`
   - **支持场景**：
     - 安全 PDU 集合（Secured PDU Collection）
     - 动态长度的 Authentic I-PDU

7. **字节序要求** [SWS_SecOC_00011]

   > 所有 SecOC 数据（新鲜度值、Authenticator、数据标识符、SecOC 消息链路数据等）在传输时，应使用 **大端字节序** 编码，确保不同 ECU 的 SecOC 模块按相同方式解析数据。

8. **对称认证方法建议**

   - 推荐使用 MAC（消息认证码）作为认证基础
   - 建议：AES基础上的 CMAC，密钥长度 ≥ 128 bit
   - MAC 截断：可降低安全性，但可节省带宽；需安全专家评估
   - 通用指导：64 bit 及以上 MAC 大小被认为足以防止猜测攻击（NIST）

9. **相关参数速查**

   | 配置参数                         | 说明                   |
   | -------------------------------- | ---------------------- |
   | `SecOCTxAuthServiceConfigRef`    | 发送方认证算法配置     |
   | `SecOCRxAuthServiceConfigRef`    | 接收方认证算法配置     |
   | `SecOCAuthInfoTruncLength`       | Authenticator 截断长度 |
   | `SecOCFreshnessValueTruncLength` | 新鲜度值截断长度       |
   | `SecOCAuthPduHeaderLength`       | Secured I-PDU 头部长度 |

### Authenticator 覆盖的数据

> Authenticator 的计算数据由 **Data Identifier**（数据标识符）、**Authentic I-PDU 数据**和**完整新鲜度值**三部分按顺序拼接而成，作为输入传递给认证算法。

1. **Authenticator 计算的输入数据构成**

   ```
   DataToAuthenticator = Data Identifier | Authentic I-PDU 数据 | 完整新鲜度值
   ```

   > “|” 表示拼接（Concatenation）

2. **组成部分说明**

   | 组成部分                 | 来源                                           | 说明                                          |
   | ------------------------ | ---------------------------------------------- | --------------------------------------------- |
   | **Data Identifier**      | 配置参数 `SecOCDataId`                         | 唯一标识 Secured I-PDU，防止跨 PDU 的重放攻击 |
   | **Authentic I-PDU 数据** | Authentic I-PDU 的**安全部分**（Secured Part） | 实际需要保护的数据负载                        |
   | **完整新鲜度值**         | Freshness Manager                              | 完整的 Freshness Value，非截断版本            |

3. **数据拼接顺序**

   ```mermaid
   flowchart LR
       DID[Data Identifier<br/>SecOCDataId] --> Concat[拼接]
       Payload[Authentic I-PDU 数据<br/>安全部分] --> Concat
       FV[完整新鲜度值<br/>Complete Freshness Value] --> Concat
       Concat --> AuthAlg[认证算法<br/>生成/验证 Authenticator]
   ```

4. **关键安全设计点**

   - **Data Identifier 的作用**：即使两个不同的 Secured I-PDU 具有相同的 Authentic I-PDU 数据和新鲜度值，由于 Data Identifier 不同，生成的 Authenticator 也不同，防止跨 PDU 的消息重放。
   - **完整新鲜度值**：Authenticator 计算时使用**完整**新鲜度值，而非截断版本，确保接收方使用相同完整值进行验证。

5. **接收方验证时的数据对齐**

   | 发送方                  | 接收方                    |
   | ----------------------- | ------------------------- |
   | Data Identifier（配置） | Data Identifier（配置）   |
   | Authentic I-PDU 数据    | 从 Secured I-PDU 中提取   |
   | 完整新鲜度值            | 从 Freshness Manager 获取 |

6. **相关配置参数**

   | 配置参数                      | 说明                       |
   | ----------------------------- | -------------------------- |
   | `SecOCDataId`                 | Secured I-PDU 的数据标识符 |
   | `SecOCTxAuthServiceConfigRef` | 发送方认证算法配置         |
   | `SecOCRxAuthServiceConfigRef` | 接收方认证算法配置         |

### 新鲜度值（Freshness Values）

> 每个 Secured I-PDU 配置至少一个新鲜度值，用于确保消息的新鲜性，防止重放攻击。新鲜度值由外部 Freshness Manager 提供，可以是单调计数器（Freshness Counter）或时间戳（Freshness Timestamp）。SecOC 支持多种获取方式，并具备完整的重试和失败处理机制。

---

1. **新鲜度值的类型与来源**

   - **定义**：单调计数器，用于确保 Secured I-PDU 的新鲜性
   - **实现方式**：
     - 新鲜度计数器（Freshness Counter）：逐条消息递增
     - 新鲜度时间戳（Freshness Timestamp）：基于时间
   - **来源**：由 Freshness Manager 提供

2. **新鲜度值在 Secured I-PDU 中的包含规则** [SWS_SecOC_00094]

   - 若 `SecOCFreshnessValueTruncLength` 配置为**小于**实际新鲜度值的长度 → 仅包含**最低有效位**（LSB）到指定长度
   - 若 `SecOCFreshnessValueTruncLength` 配置为 **0** → 新鲜度值**不包含**在 Secured I-PDU 中

   | 配置值                    | 行为             |
   | ------------------------- | ---------------- |
   | `0 < TruncLen < 实际长度` | 仅包含最低有效位 |
   | `TruncLen = 0`            | 不包含在 PDU 中  |
   | `TruncLen >= 实际长度`    | 包含完整值       |

3. **从 Authentic I-PDU 中提取新鲜度值** [SWS_SecOC_00219]

   > 当 `SecOCUseAuthDataFreshness = TRUE` 时，SecOC 使用 Authentic I-PDU 的一部分作为新鲜度值。

   - `SecOCAuthDataFreshnessStartPosition`：新鲜度在 Authentic I-PDU 中的起始位位置
   - `SecOCAuthDataFreshnessLen`：新鲜度的长度（bit）

   **示例**：`StartPosition = 11`，`Length = 4`，PDU 为 `AB CD`（十六进制）

   ```
   Byte 0:  A (1010) B (1011)  →  bits 7-0: 1010 1011
   Byte 1:  C (1100) D (1101)  →  bits 15-8: 1100 1101
   
   起始位置 bit 11，长度 4 bit → bit 11 到 bit 8 → 1101 (二进制)
   结果：新鲜度 = 1101 (bin)
   ```

4. **新鲜度值的字节数组表示** [SWS_SecOC_00220]

   - Freshness Manager 以**字节数组**形式提供/接收新鲜度信息
   - 新鲜度始终**对齐到数组中第一个字节的 MSB**
   - 未使用的位必须设置为 **0**
   - 长度信息以 **bit** 为单位

   **示例**：10-bit 新鲜度 `001101011`（二进制），位于 2 字节数组中：

   | 二进制              | 十六进制 |
   | ------------------- | -------- |
   | `00110101 10000000` | `35 80`  |
   | 长度值              | 10       |

5. **发送方新鲜度获取方式**

   根据配置组合，SecOC 通过不同方式获取发送方新鲜度：

   | `SecOCQueryFreshnessValue` | `SecOCProvideTxTruncatedFreshnessValue` | 调用的接口                                                   |
   | -------------------------- | --------------------------------------- | ------------------------------------------------------------ |
   | `CFUNC`                    | `TRUE`                                  | `SecOC_GetTxFreshnessTruncData()` [SWS_SecOC_00221]          |
   | `CFUNC`                    | `FALSE`                                 | `SecOC_GetTxFreshness()` [SWS_SecOC_00222]                   |
   | `RTE`                      | `TRUE`                                  | `FreshnessManagement_GetTxFreshnessTruncData` [SWS_SecOC_00223] |
   | `RTE`                      | `FALSE`                                 | `FreshnessManagement_GetTxFreshness` [SWS_SecOC_00224]       |

6. **接收方新鲜度获取方式**

   | `SecOCQueryFreshnessValue` | `SecOCUseAuthDataFreshness` | 调用的接口                                                   |
   | -------------------------- | --------------------------- | ------------------------------------------------------------ |
   | `RTE`                      | `TRUE`                      | `FreshnessManagement_GetRxFreshnessAuthData` [SWS_SecOC_00244] |
   | `RTE`                      | `FALSE`                     | `FreshnessManagement_GetRxFreshness` [SWS_SecOC_00245]       |
   | `CFUNC`                    | `TRUE`                      | `SecOC_GetRxFreshnessAuthData()` [SWS_SecOC_00246]           |
   | `CFUNC`                    | `FALSE`                     | `SecOC_GetRxFreshness()` [SWS_SecOC_00247]                   |

7. **认证构建计数器（发送方）**

   - **维护**：每个入队到 SecOC 的发送请求维护一个认证构建计数器 [SWS_SecOC_00225]
   - **初始值**：首次处理发送请求时设为 **0** [SWS_SecOC_00226]
   - **递增条件** [SWS_SecOC_00227]：
     - 新鲜度查询返回 `E_BUSY`
     - Authenticator 计算返回 `E_BUSY`、`QUEUE_FULL` 或其他可恢复错误
   - **重试机制** [SWS_SecOC_00228]：
     - 若认证构建失败且计数器未达到 `SecOCAuthenticationBuildAttempts` → 下次 Tx Main Function 时重试

8. **认证验证计数器（接收方）**

   - **维护**：每个接收到的 Secured I-PDU 维护认证构建计数器和认证验证尝试计数器 [SWS_SecOC_00234]
   - **初始值**：首次处理接收的 Secured I-PDU 时均设为 **0** [SWS_SecOC_00235]
   - **构建失败递增** [SWS_SecOC_00236][SWS_SecOC_00237]：
     - 新鲜度查询返回 `E_BUSY` → 构建计数器 +1，不执行验证
     - 验证返回可恢复错误 → 构建计数器 +1
   - **验证失败处理** [SWS_SecOC_00239]：
     - 验证执行成功但失败（MAC 不匹配等）→ 验证尝试计数器 +1，构建计数器重置为 0

9. **发送方默认认证信息（降级模式）** [SWS_SecOC_00229]

   当以下情况发生时，SecOC 可使用默认认证信息：
   - 认证构建计数器达到 `SecOCAuthenticationBuildAttempts`
   - 新鲜度查询返回 `E_NOT_OK`
   - Authenticator 计算返回非可恢复错误（`E_NOT_OK`、`KEY_FAILURE`）

   | 条件                       | 行为                                                         |
   | -------------------------- | ------------------------------------------------------------ |
   | 发送默认认证信息**启用**   | 使用 `SecOCDefaultAuthenticationInformationPattern` 填充所有字节，构造认证信息 |
   | 发送默认认证信息**未启用** | 从内部缓冲区移除 Authentic I-PDU，**取消发送请求**           |

   **示例**：
   - `SecOCFreshnessValueTxLength = 4 bits`
   - `SecOCAuthInfoTxLength = 20 bits`
   - `SecOCDefaultAuthenticatorValue = 0xA5`

   结果默认认证信息：
   ```
   0x05 (截断新鲜度值) | 0xA5A5A0 (截断 Authenticator)
   ```

10. **接收方失败处理**

    | 失败类型                                                     | 处理方式                                                     | 相关规范          |
    | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------- |
    | 构建计数器达到 `SecOCAuthenticationBuildAttempts`            | 丢弃消息，设置 `SECOC_AUTHENTICATIONBUILDFAILURE`            | [SWS_SecOC_00240] |
    | 新鲜度查询返回 `E_NOT_OK`                                    | 丢弃消息，设置 `SECOC_FRESHNESSFAILURE`                      | [SWS_SecOC_00256] |
    | 验证计数器达到 `SecOCAuthenticationVerifyAttempts` 或非可恢复错误 | 丢弃消息，设置 `SECOC_VERIFICATIONFAILURE`                   | [SWS_SecOC_00241] |
    | 验证成功                                                     | 设置 `SECOC_VERIFICATIONSUCCESS`                             | [SWS_SecOC_00242] |
    | Rx 新鲜度请求返回 `E_NOT_OK`                                 | 视为失败，递增计数器，达到尝试次数后丢弃，上报 `SECOC_E_FRESHNESS_FAILURE` 到 DET | [SWS_SecOC_00248] |

11. **发送确认通知** [SWS_SecOC_00232][SWS_SecOC_00233]

    - **目的**：通知 Freshness Manager，Secured I-PDU 已成功发起传输
    - **时机**：传输请求成功提交给 PduR 后（非实际出现在总线上）
    - **调用方式**：
      - `CFUNC` → 调用 `SecOC_TxConfirmation` 函数
      - `RTE` → 调用 `FreshnessManagement_SPduTxConfirmation` 服务操作

12. **验证状态回调通知** [SWS_SecOC_00243]

    - Freshness Management 通过 `SWS_SECOC_00119` 回调函数获取验证结果
    - 用途：同步额外的新鲜度尝试、计数器递增等
    - **注意**：若同时使用状态覆盖功能（`SWS_SECOC_00142`），可能导致 Freshness Management 冲突

13. **相关配置参数**

    | 配置参数                                | 说明                                  |
    | --------------------------------------- | ------------------------------------- |
    | `SecOCFreshnessValueTruncLength`        | 新鲜度值截断长度（bit），0 表示不包含 |
    | `SecOCUseAuthDataFreshness`             | 是否从 Authentic I-PDU 中提取新鲜度   |
    | `SecOCAuthDataFreshnessStartPosition`   | 在 Authentic I-PDU 中的起始位         |
    | `SecOCAuthDataFreshnessLen`             | 从 Authentic I-PDU 中提取的新鲜度长度 |
    | `SecOCQueryFreshnessValue`              | 获取方式：`CFUNC` 或 `RTE`            |
    | `SecOCProvideTxTruncatedFreshnessValue` | 是否向发送方提供截断新鲜度            |
    | `SecOCAuthenticationBuildAttempts`      | 认证构建最大尝试次数                  |
    | `SecOCAuthenticationVerifyAttempts`     | 认证验证最大尝试次数                  |
    | `SecOCDefaultAuthenticatorValue`        | 默认认证信息填充值                    |

## I-PDU 的认证

> SecOC 模块通过六个步骤完成 Authentic I-PDU 的认证并生成 Secured I-PDU：准备缓冲区、构造认证数据、生成 Authenticator、截断、组装 Secured I-PDU、递增新鲜度计数器并发送。

1. **认证的六个步骤** [SWS_SecOC_00031]

   | 步骤  | 操作                             | 说明                                |
   | ----- | -------------------------------- | ----------------------------------- |
   | **1** | Prepare Secured I-PDU            | 准备 Secured I-PDU，分配所需缓冲区  |
   | **2** | Construct Data for Authenticator | 构造认证数据（DataToAuthenticator） |
   | **3** | Generate Authenticator           | 调用认证算法生成 Authenticator      |
   | **4** | Construct Secured I-PDU          | 组装 Secured I-PDU                  |
   | **5** | Increment Freshness Counter      | 递增新鲜度计数器                    |
   | **6** | Broadcast Secured I-PDU          | 发送 Secured I-PDU                  |

2. **步骤 1：准备 Secured I-PDU** [SWS_SecOC_00033]

   - 分配必要的缓冲区
   - 用于保存认证过程的中间结果和最终结果

3. **步骤 2：构造认证数据（DataToAuthenticator）** [SWS_SecOC_00034]

   ```
   DataToAuthenticator = Data Id | Authentic I-PDU 的安全部分 | 完整新鲜度值
   ```

   - **Data Id**：完整 16 bit 表示（参数 `SecOCDataId`），大端编码
   - **Authentic I-PDU 的安全部分**：需要保护的数据负载
   - **完整新鲜度值**：对应 `SecOCFreshnessValueID` 的完整新鲜度值，大端编码

4. **步骤 3：生成 Authenticator** [SWS_SecOC_00035]

   - 将 `DataToAuthenticator` 和其长度传入认证算法
   - 认证算法由 `SecOCTxAuthServiceConfigRef` 配置指定

5. **步骤 4：构造 Secured I-PDU** [SWS_SecOC_00036][SWS_SecOC_00037]

   - 先截断 Authenticator：按 `SecOCAuthInfoTruncLength` 截断
   - 然后按以下顺序组装：

   ```
   SecuredPDU = SecuredIPDUHeader (可选) | AuthenticIPDU | FreshnessValue (可选) | Authenticator (截断后)
   ```

   | 组成部分          | 是否可选 | 说明                                                     |
   | ----------------- | -------- | -------------------------------------------------------- |
   | SecuredIPDUHeader | 可选     | 头部信息                                                 |
   | AuthenticIPDU     | 必选     | 原始数据                                                 |
   | FreshnessValue    | 可选     | 由 `SecOCFreshnessValueTruncLength` 控制（0 表示不包含） |
   | Authenticator     | 必选     | 按 `SecOCAuthInfoTruncLength` 截断后                     |

6. **步骤 5：递增新鲜度计数器**

   - 由 Freshness Manager 负责递增
   - 确保下次发送使用新的新鲜度值

7. **步骤 6：发送 Secured I-PDU**

   - 通过 PduR 发送到总线上

8. **完整认证流程图**

   ```mermaid
   flowchart TD
       Step1[步骤 1: 准备缓冲区] --> Step2
       Step2[步骤 2: 构造认证数据<br/>DataId + Authentic数据 + 完整新鲜度] --> Step3
       Step3[步骤 3: 生成 Authenticator<br/>调用认证算法] --> Step4
       Step4[步骤 4: 截断并组装 Secured PDU<br/>头部（可选） + Authentic数据 + 新鲜度（可选） + Authenticator] --> Step5
       Step5[步骤 5: 递增新鲜度计数器] --> Step6
       Step6[步骤 6: 通过 PduR 发送]
   ```

9. **关键设计要点**

   - **新鲜度值可包含在 PDU 中**：通过 `SecOCFreshnessValueTruncLength` 控制，0 表示不包含
   - **Authenticator 可截断**：通过 `SecOCAuthInfoTruncLength` 控制，节省带宽
   - **Data Id 和新鲜度值均使用大端编码**：确保跨 ECU 一致性
   - **新鲜度值可来自 Authentic I-PDU 内部**：参见 [SWS_SecOC_00219]

10. **相关配置参数**

    | 配置参数                         | 说明                                  |
    | -------------------------------- | ------------------------------------- |
    | `SecOCDataId`                    | Data Identifier（16 bit）             |
    | `SecOCTxAuthServiceConfigRef`    | 发送方认证算法配置                    |
    | `SecOCAuthInfoTruncLength`       | Authenticator 截断长度（bit）         |
    | `SecOCFreshnessValueTruncLength` | 新鲜度值截断长度（bit），0 表示不包含 |
    | `SecOCAuthPduHeaderLength`       | Secured I-PDU 头部长度                |

## I-PDU 的验证

> SecOC 模块通过六个步骤完成 Secured I-PDU 的验证：解析提取数据、从 Freshness Manager 获取新鲜度值、构造认证数据、验证 Authenticator、发送确认给 Freshness Manager、将 Authentic I-PDU 传递给上层。对于分片接收的 Secured PDU，需等待完整接收后才进行验证。

1. **验证的六个步骤** [SWS_SecOC_00040]

   | 步骤  | 操作                                                     | 说明                                    |
   | ----- | -------------------------------------------------------- | --------------------------------------- |
   | **1** | Parse Authentic I-PDU, Freshness Value and Authenticator | 从 Secured I-PDU 中解析提取各部分       |
   | **2** | Get Freshness Value from Freshness Manager               | 从 Freshness Manager 获取当前新鲜度值   |
   | **3** | Construct Data to Authentication                         | 构造认证数据（DataToAuthenticator）     |
   | **4** | Verify Authentication Information                        | 验证 Authenticator                      |
   | **5** | Send Confirmation to Freshness Manager                   | 发送确认给 Freshness Manager            |
   | **6** | Pass Authentic I-PDU to upper layer                      | 将验证通过的 Authentic I-PDU 传递给上层 |

2. **分片 Secured PDU 的处理（SecOCRxSecuredPduCollection）** [SWS_SecOC_00203][SWS_SecOC_00211]

   > 当使用 `SecOCRxSecuredPduCollection` 时，SecOC 在收到构成 Secured I-PDU 的 **Authentic I-PDU** 和 **Cryptographic I-PDU** 两者之前，不执行任何验证。只有两者都收到后才尝试验证。

   - 通过 **Message Linker** 值匹配 Authentic I-PDU 和 Cryptographic I-PDU
   - 若 `SecOCUseMessageLink` 多重性为 0 → `SecOCMessageLinkLen = 0`，Message Linker 值始终匹配

   ```mermaid
   flowchart TD
       Recv1[接收 Authentic I-PDU] --> Buffer[缓冲存储]
       Recv2[接收 Cryptographic I-PDU] --> Buffer
       Buffer --> Match{Message Linker<br/>匹配?}
       Match -->|是| Verify[执行验证]
       Match -->|否| Wait[继续等待]
   ```

3. **步骤 1：解析 Secured I-PDU** [SWS_SecOC_00042]

   - 从接收到的 Secured I-PDU 中解析提取：
     - Authentic I-PDU
     - Freshness Value（新鲜度值）
     - Authenticator

4. **步骤 3：构造认证数据（DataToAuthenticator）** [SWS_SecOC_00046]

   ```
   DataToAuthenticator = SecOCDataId | AuthenticIPDU | FreshnessVerifyValue
   ```

   - 接收方使用相同的 Data Id（`SecOCDataId`）
   - 从收到的 Secured I-PDU 中提取 AuthenticIPDU
   - 从 Freshness Manager 获取 FreshnessVerifyValue

5. **步骤 4：验证 Authenticator** [SWS_SecOC_00047]

   - 将以下参数传入认证算法（由 `SecOCRxAuthServiceConfigRef` 配置）：
     - DataToAuthenticator
     - DataToAuthenticator 的长度
     - 从 Secured I-PDU 中解析的 Authenticator
     - `SecOCAuthInfoTruncLength`（截断长度）
   - 验证过程支持重试（参见文档第 9.2 章）

6. **验证结果报告** [SWS_SecOC_00048][SWS_SecOC_00271]

   通过两种方式报告验证状态：

   | 配置参数                                             | 值             | 行为                            |
   | ---------------------------------------------------- | -------------- | ------------------------------- |
   | `SecOCVerificationStatusPropagationMode`             | `BOTH`         | 通过 callout 函数和接口双路报告 |
   | `SecOCVerificationStatusPropagationMode`             | `FAILURE_ONLY` | 仅失败时报告                    |
   | `SecOCVerificationStatusPropagationMode`             | `NONE`         | 不报告                          |
   | `SecOCClientServerVerificationStatusPropagationMode` | `BOTH`         | 通过服务接口双路报告            |
   | `SecOCClientServerVerificationStatusPropagationMode` | `FAILURE_ONLY` | 仅失败时报告                    |
   | `SecOCClientServerVerificationStatusPropagationMode` | `NONE`         | 不报告                          |

7. **最终状态报告控制** [SWS_SecOC_00272]

   | `SecOCPropagateOnlyFinalVerificationStatus` | 报告行为                                            |
   | ------------------------------------------- | --------------------------------------------------- |
   | `TRUE`                                      | **仅报告最终状态**                                  |
   | `FALSE`                                     | 报告**每次**验证状态（最终状态 + 之前所有失败状态） |

   ```mermaid
   flowchart LR
       Attempt1[第1次验证尝试: 失败] --> Log1[报告失败1]
       Attempt2[第2次验证尝试: 失败] --> Log2[报告失败2]
       Attempt3[第3次验证尝试: 成功] --> Log3{传播模式}
       
       Log3 -->|仅最终| Final[仅报告最终成功]
       Log3 -->|全部| All[报告失败1 + 失败2 + 成功]
   ```

8. **验证流程图**

   ```mermaid
   flowchart TD
       Recv[接收 Secured I-PDU] --> Parse[步骤 1: 解析<br/>提取 Authentic PDU + 新鲜度 + Authenticator]
       Parse --> GetFV[步骤 2: 从 Freshness Manager<br/>获取新鲜度值]
       GetFV --> Build[步骤 3: 构造认证数据<br/>DataId + Authentic PDU + 新鲜度值]
       Build --> Verify[步骤 4: 验证 Authenticator<br/>调用认证算法]
       Verify --> Success{验证<br/>成功?}
       Success -->|是| Confirm[步骤 5: 发送确认给 Freshness Manager]
       Success -->|否| ReportFail[报告失败]
       Confirm --> ReportSucc[报告验证状态]
       ReportSucc --> Pass[步骤 6: 传递 Authentic I-PDU<br/>给上层]
       ReportFail --> Drop[丢弃消息]
   ```

9. **发送方 vs 接收方对比**

   | 对比项       | 发送方（认证）                      | 接收方（验证）                      |
   | ------------ | ----------------------------------- | ----------------------------------- |
   | 数据来源     | 应用层数据                          | 总线接收数据                        |
   | 新鲜度值来源 | Freshness Manager                   | Freshness Manager（验证用）         |
   | 认证数据构造 | DataId + Authentic数据 + 完整新鲜度 | DataId + Authentic数据 + 验证新鲜度 |
   | 算法配置     | `SecOCTxAuthServiceConfigRef`       | `SecOCRxAuthServiceConfigRef`       |
   | 结果处理     | 发送 Secured PDU                    | 验证通过 → 上层；失败 → 丢弃        |

10. **相关配置参数**

    | 配置参数                                             | 说明                                           |
    | ---------------------------------------------------- | ---------------------------------------------- |
    | `SecOCRxSecuredPduCollection`                        | 是否启用分片接收                               |
    | `SecOCMessageLinkLen`                                | Message Linker 长度                            |
    | `SecOCRxAuthServiceConfigRef`                        | 接收方认证算法配置                             |
    | `SecOCAuthInfoTruncLength`                           | Authenticator 截断长度                         |
    | `SecOCVerificationStatusPropagationMode`             | 验证状态传播模式（BOTH / FAILURE_ONLY / NONE） |
    | `SecOCClientServerVerificationStatusPropagationMode` | 服务接口验证状态传播模式                       |
    | `SecOCPropagateOnlyFinalVerificationStatus`          | 是否仅报告最终状态                             |
    | `SecOC_VerifyStatusOverride`                         | 验证状态覆盖                                   |

### I-PDU 验证成功

> 当 Secured I-PDU 验证成功或状态覆盖被相应设置时，SecOC 模块应通过 PduR 的下层接口将 Authentic I-PDU 传递给上层通信模块。

---

1. **验证成功的处理** [SWS_SecOC_00050]

   - 验证成功 → 将 Authentic I-PDU 传递给上层
   - 状态覆盖（`SecOC_VerifyStatusOverride`）设置为成功 → 同样传递给上层

2. **数据流向**

   ```mermaid
   flowchart LR
       SecOC[SecOC 模块] -->|验证成功| PduR[PduR 模块]
       PduR -->|路由| COM[COM 模块]
       COM -->|RTE| SWC[应用层 SW-C]
   ```

3. **与验证失败对比**

   | 结果                          | 处理方式                                |
   | ----------------------------- | --------------------------------------- |
   | **验证成功**                  | 通过 PduR 将 Authentic I-PDU 传递给上层 |
   | **验证失败（无覆盖）**        | 丢弃 Authentic I-PDU，不上传            |
   | **验证失败 + 状态覆盖为成功** | 传递给上层（按覆盖值处理）              |

4. **相关配置参数**

   | 配置参数                     | 说明                                         |
   | ---------------------------- | -------------------------------------------- |
   | `SecOC_VerifyStatusOverride` | 验证状态覆盖，可强制指定验证结果为成功或失败 |

## 非对称方法的适配

> 虽然本文档统一使用对称密码学的术语和概念，但 SecOC 模块支持配置为使用对称或非对称加密算法。当使用数字签名替代 MAC 时，需要关注以下几点差异。

---

1. **密钥模型差异**

   | 对比项           | 对称方法（MAC）                    | 非对称方法（数字签名）                     |
   | ---------------- | ---------------------------------- | ------------------------------------------ |
   | **密钥类型**     | 共享密钥（发送方和所有接收方相同） | 密钥对（公钥 + 私钥）                      |
   | **发送方使用**   | 共享密钥生成 MAC                   | **私钥**生成签名                           |
   | **接收方使用**   | 共享密钥验证 MAC                   | **公钥**验证签名                           |
   | **密钥可访问性** | 所有通信方均可访问                 | 私钥不可被接收方获取，且不可从公钥计算得出 |

2. **Authenticator 截断限制**

   > 在非对称方法中，**不支持截断**。接收方需要访问完整的签名输出才能进行验证，因此 `SecOCAuthInfoTruncLength` 必须设置为签名的完整长度。

   ```mermaid
   flowchart LR
       Sym[对称 MAC] -->|可截断| Trunc[截断后传输<br/>节省带宽]
       Asym[非对称签名] -->|不可截断| Full[完整传输<br/>`SecOCAuthInfoTruncLength` = 完整长度]
   ```

3. **验证算法差异**

   | 对比项         | 对称方法（MAC）                  | 非对称方法（数字签名）                                    |
   | -------------- | -------------------------------- | --------------------------------------------------------- |
   | **发送方操作** | 生成 MAC                         | 生成签名                                                  |
   | **接收方操作** | 重新计算 MAC 并与接收值比较      | 运行验证算法，输入 DataToAuthenticator + 签名，输出布尔值 |
   | **验证输入**   | DataToAuthenticator + 收到的 MAC | DataToAuthenticator（含完整计数器）+ 收到的签名           |
   | **验证输出**   | 匹配/不匹配                      | 通过/失败（布尔值）                                       |

4. **非对称验证流程**

   ```mermaid
   flowchart LR
       subgraph Sender[发送方]
           Data[DataToAuthenticator] --> Sign[私钥签名]
           Sign --> Send[发送: 数据 + 签名]
       end

       subgraph Receiver[接收方]
           Recv[接收: 数据 + 签名] --> Verify[验证算法]
           Data2[DataToAuthenticator] --> Verify
           PubKey[公钥] --> Verify
           Verify --> Result{布尔值}
           Result -->|True| Pass[✅ 验证通过]
           Result -->|False| Fail[❌ 验证失败]
       end
   ```

5. **参数配置差异**

   | 配置参数                   | 对称方法           | 非对称方法                 |
   | -------------------------- | ------------------ | -------------------------- |
   | `SecOCAuthInfoTruncLength` | 可截断（按需配置） | **必须设置为签名完整长度** |
   | 密钥配置                   | 共享密钥           | 公钥 + 私钥对              |
   | 认证算法                   | MAC 生成/验证算法  | 签名生成/验证算法          |

6. **相关配置参数**

   - `SecOCAuthInfoTruncLength`：非对称方法中必须设为签名完整长度
   - `SecOCTxAuthServiceConfigRef` / `SecOCRxAuthServiceConfigRef`：指向签名算法配置

# 与 PduR 的关系

> SecOC 模块在 AUTOSAR 分层架构中位于 PDU 路由器（PduR）旁边。SecOC 模块的设计使其不依赖其他模块，且在不使用时可从系统中移除，不影响系统构建。同时，SecOC 确保元数据在 Authentic PDU 与 Secured PDU 之间无损传递。

1. **架构位置**

   ![SecOc与Pdur的关系](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/Images/image-20260707094332237.png)
   
   - SecOC 位于 PduR 旁边，与 PduR 协同工作
   - 发送时：PduR 将需要保护的 I-PDU 路由给 SecOC，SecOC 添加安全信息后返回 PduR
   - 接收时：PduR 将 Secured I-PDU 路由给 SecOC，SecOC 验证后返回 Authentic I-PDU 给 PduR

2. **模块独立性** [SWS_SecOC_00153]

   > SecOC 模块的实现应确保其他模块**不依赖**于它，且如果不需要 SecOC 功能，可以构建一个**不含 SecOC 模块**的系统。

   | 特性                   | 说明                                            |
   | ---------------------- | ----------------------------------------------- |
   | **无强制依赖**         | 其他模块（如 COM、PduR）可在无 SecOC 时正常工作 |
   | **可选构建**           | 系统可不包含 SecOC 模块进行构建                 |
   | **安全保护为附加功能** | 不强制要求所有系统都使用安全通信                |

3. **元数据传递** [SWS_SecOC_00212]

   > SecOC 应确保在 Authentic PDU 中接收的元数据在对应的 Secured PDU 中**保持不变**，反之亦然。

   - 方向：Authentic PDU ↔ Secured PDU 双向传递
   - 要求：元数据内容不变
   - 场景：
     - 发送方向：Authentic PDU 中的元数据 → Secured PDU
     - 接收方向：Secured PDU 中的元数据 → Authentic PDU

4. **数据流与元数据传递**

   ```mermaid
   flowchart LR
       subgraph Send[发送方向]
           COM_S[COM] -->|Authentic I-PDU + MetaData| PduR1[PduR]
           PduR1 -->|Authentic I-PDU + MetaData| SecOC_S[SecOC]
           SecOC_S -->|Secured I-PDU + MetaData| PduR1
           PduR1 -->|发送| IF_S[通信接口]
       end

       subgraph Recv[接收方向]
           IF_R[通信接口] -->|接收| PduR2[PduR]
           PduR2 -->|Secured I-PDU + MetaData| SecOC_R[SecOC]
           SecOC_R -->|Authentic I-PDU + MetaData| PduR2
           PduR2 -->|COM| COM_R[COM]
       end
   ```

5. **与 PduR 的交互总结**

   | 方向     | 输入                       | 输出                       | 操作               |
   | -------- | -------------------------- | -------------------------- | ------------------ |
   | **发送** | Authentic I-PDU + MetaData | Secured I-PDU + MetaData   | 添加认证信息       |
   | **接收** | Secured I-PDU + MetaData   | Authentic I-PDU + MetaData | 验证并移除认证信息 |

6. **相关配置参数**

   | 配置参数      | 说明                          |
   | ------------- | ----------------------------- |
   | `SecOCPduRef` | SecOC 引用的 PDU 配置         |
   | PduR 路由表   | 配置哪些 PDU 需要路由到 SecOC |

# 初始化

> SecOC 模块提供 `SecOC_Init` 函数，用于初始化所有内部全局变量和存储 SecOC I-PDU 及中间结果的缓冲区。环境必须在调用除 `SecOC_GetVersionInfo` 外的任何 SecOC 函数之前调用该函数。未初始化时调用 API 应返回 `SecOC_E_UNINIT`（开发模式）。此外，发送 PDU 中未使用的区域应填充可配置的默认值。

---

1. **初始化函数的作用**

   - 初始化所有内部全局变量
   - 初始化用于存储 SecOC I-PDU 的缓冲区
   - 初始化用于存储中间结果的缓冲区

2. **调用规则**

   - `SecOC_Init` 必须在调用其他 SecOC API 之前调用
   - 例外：`SecOC_GetVersionInfo`（可在初始化前调用）
   - 未初始化时调用 API 应返回 `SecOC_E_UNINIT`（开发模式）

3. **缓冲区初始化的必要性**

   - 数据路径需要内部缓冲区
   - 缓冲区可能在上下层通信模块完全填充数据之前被发送
   - 因此缓冲区必须被正确初始化（防止发送未定义数据）

4. **未使用区域填充** [SWS_SecOC_00269]

   > SecOC 模块应将发送的 Secured PDU 或 Cryptographic PDU 中**未使用的区域**填充为由配置参数 `SecOCTxPduUnusedAreasDefault` 指定的值（例如 `0xFF`）。

   | 配置值                         | 说明                             |
   | ------------------------------ | -------------------------------- |
   | `SecOCTxPduUnusedAreasDefault` | 未使用区域的填充值，如 `0xFF`    |
   | 适用范围                       | Secured PDU 和 Cryptographic PDU |

5. **相关规范**

   | 规范               | 内容                                    |
   | ------------------ | --------------------------------------- |
   | `SWS_SecOC_00106`  | `SecOC_Init` API 定义                   |
   | `SWS_SecOC_00054`  | 初始化内部变量和缓冲区                  |
   | `SWS_SecOC_00269`  | 未使用区域填充                          |
   | `ECUC_SecOC_00101` | `SecOCTxPduUnusedAreasDefault` 配置参数 |

# 传出 PDU 的认证

> 认证是指通过向 Authentic I-PDU 添加认证信息来创建 Secured I-PDU 的过程。SecOC 模块与 PduR 模块的交互遵循特定步骤，以支持不同总线接口和传输协议。发送时，SecOC 将 Authentic I-PDU 复制到内部缓冲区并立即返回，实际认证和发送在后续主函数中完成。

1. **认证过程的六步流程**

   | 步骤  | 操作                                                 | 说明                    |
   | ----- | ---------------------------------------------------- | ----------------------- |
   | **1** | 上层模块调用 `PduR_<Up>Transmit`                     | 上层发起传输请求        |
   | **2** | PduR 路由到 SecOC，调用 `SecOC_[If\|Tp]Transmit`     | 请求转发至 SecOC        |
   | **3** | SecOC 复制 Authentic I-PDU 到内部缓冲区，立即返回    | 不阻塞上层              |
   | **4** | 下次主函数调用时，SecOC 计算认证信息，通过 PduR 下发 | 实际认证在后台执行      |
   | **5** | SecOC 作为上层模块，响应下层所有复制数据的请求       | 提供 Secured I-PDU 数据 |
   | **6** | SecOC 将发送确认转发给上层                           | 确认透传                |

2. **完整数据流（发送方向）**

   ```mermaid
   flowchart TD
       Step1[上层调用 PduR_UpTransmit] --> Step2[PduR 路由到 SecOC]
       Step2 --> Step3[SecOC 复制到内部缓冲区]
       Step3 --> Step4[主函数触发认证计算]
       Step4 --> Step5[构造 Secured I-PDU]
       Step5 --> Step6[通过 PduR 下发到下层]
   ```

3. **内部缓冲区管理** [SWS_SecOC_00057][SWS_SecOC_00146]

   - SecOC 提供足够的缓冲区存储：
     - 传入的 Authentic I-PDU
     - 传出的 Secured I-PDU
     - 认证过程中的所有中间数据
   - **分离缓冲区**：Authentic I-PDU 和 Secured I-PDU 使用**独立缓冲区**

4. **缓冲区覆盖规则** [SWS_SecOC_00110]

   > 上层模块的任何传输请求应**覆盖**包含 Authentic I-PDU 的缓冲区，但**不影响**对应 Secured I-PDU 的缓冲区。

   - 上层更新 Authentic I-PDU 时不影响正在进行的安全 PDU 发送
   - 解耦上下层交互，提高并发效率

5. **分片发送支持（SecOCTxSecuredPduCollection）** [SWS_SecOC_00201]

   > 当使用 `SecOCTxSecuredPduCollection` 时，SecOC 将 Secured I-PDU 作为**两条消息**发送：
   - **Authentic I-PDU**（原始数据）
   - **Cryptographic I-PDU**（包含所有认证信息）

   ```mermaid
   flowchart LR
       Secured[Secured I-PDU] --> Split[拆分]
       Split --> Auth[Authentic I-PDU]
       Split --> Crypto[Cryptographic I-PDU<br/>认证信息 + Message Linker]
   ```

6. **Message Linker 机制** [SWS_SecOC_00209][SWS_SecOC_00210]

   > 当使用 `SecOCTxSecuredPduCollection` 时，SecOC 在 Cryptographic I-PDU 中**重复 Authentic I-PDU 的一部分**作为 Message Linker，用于接收方匹配两条消息。

   ```
   Cryptographic I-PDU = Authentication Data | Message Linker
   ```

   - **Message Linker**：从 Authentic I-PDU 的 `SecOCMessageLinkPos` 位置提取，长度 `SecOCMessageLinkLen` bits
   - **目的**：接收方通过 Message Linker 匹配 Authentic I-PDU 和 Cryptographic I-PDU

7. **发送确认转发** [SWS_SecOC_00270]

   | 条件                                              | 上传确认   |
   | ------------------------------------------------- | ---------- |
   | Authentic I-PDU 和 Cryptographic I-PDU 均确认成功 | `E_OK`     |
   | 任一确认失败                                      | `E_NOT_OK` |

8. **Secured I-PDU 头部（动态长度支持）** [SWS_SecOC_00262]

   > 对于 `SecOCAuthPduHeaderLength > 0` 的 Secured I-PDU，SecOC 在 Secured I-PDU 中添加头部，指示 Authentic I-PDU 的长度，以处理**动态长度的 Authentic I-PDU**。

   - **主要用途**：指示新鲜度值和 Authenticator 在 Secured I-PDU 中的位置
   - **适用场景**：
     - CAN FD / FlexRay：无法选择任意 L-PDU 长度，且下层可能添加总线特定填充
     - 动态长度 Authentic I-PDU：填充位置不确定

   ```mermaid
   flowchart LR
       subgraph PDU[Secured I-PDU]
           Header[Secured I-PDU Header] --> Auth[Authentic I-PDU]
           Auth --> FV[Freshness Value]
           FV --> AuthInfo[Authenticator]
       end
       AuthInfo --> Padding[总线特定填充<br/>由下层添加]
   ```

9. **与 PduR 的交互总结**

   | 方向       | 调用接口                       | 说明               |
   | ---------- | ------------------------------ | ------------------ |
   | 上层→PduR  | `PduR_<Up>Transmit`            | 上层发起传输       |
   | PduR→SecOC | `SecOC_[If\|Tp]Transmit`       | 路由到 SecOC       |
   | SecOC→PduR | `PduR_[If\|Tp]Transmit`        | 下发 Secured I-PDU |
   | PduR→SecOC | `SecOC_[If\|Tp]TxConfirmation` | 发送确认           |
   | SecOC→上层 | 透传确认                       | 转发给上层         |

10. **相关配置参数**

    | 配置参数                      | 说明                                         |
    | ----------------------------- | -------------------------------------------- |
    | `SecOCTxSecuredPduCollection` | 是否启用分片发送                             |
    | `SecOCMessageLinkPos`         | Message Linker 在 Authentic I-PDU 中的起始位 |
    | `SecOCMessageLinkLen`         | Message Linker 长度（bit）                   |
    | `SecOCUseMessageLink`         | 是否启用 Message Linker                      |
    | `SecOCAuthPduHeaderLength`    | Secured I-PDU 头部长度（字节）               |

## 直接传输期间的认证

> 对于使用支持即时传输的总线接口（如 CanIf）发送 Authentic I-PDU 时，PduR 触发 SecOC 的传输操作。SecOC 分配缓冲区并复制 Authentic I-PDU 后立即返回，实际认证和 Secured I-PDU 的创建在后续主函数中完成。发送确认最终透传给上层。

1. **直接传输的流程**

   ```mermaid
   sequenceDiagram
       participant Upper as 上层模块
       participant PduR as PduR
       participant SecOC as SecOC
       participant Lower as 下层模块

       Upper->>PduR: ① PduR_UpTransmit
       PduR->>SecOC: ② SecOC_IfTransmit
       SecOC->>SecOC: ③ 分配缓冲区，复制 Authentic I-PDU
       SecOC-->>PduR: 立即返回

       Note over SecOC: 下次主函数调用时

       SecOC->>SecOC: ④ 计算 Authenticator
       SecOC->>SecOC: ⑤ 构造 Secured I-PDU
       SecOC->>PduR: ⑥ PduR_SecOCTransmit
       PduR->>Lower: 发送

       Lower->>PduR: 发送确认
       PduR->>SecOC: ⑦ SecOC_TxConfirmation
       SecOC->>PduR: ⑧ PduR_SecOC_TxConfirmation
       PduR->>Upper: 透传确认
   ```

2. **步骤 1-3：传输请求与缓冲区分配** [SWS_SecOC_00058]

   - 上层通过 `PduR_<Up>Transmit` 发起传输
   - PduR 路由到 SecOC，调用 `SecOC_[If\|Tp]Transmit`
   - SecOC 在连续内存位置分配缓冲区，存储：
     - Authentic I-PDU
     - 认证信息（后续计算后填充）
   - 复制 Authentic I-PDU 到本地缓冲区后立即返回

3. **步骤 4-6：主函数中的认证与发送** [SWS_SecOC_00060][SWS_SecOC_00061][SWS_SecOC_00062]

   在下次 `SecOC_MainFunction` 调用时：

   - 根据 SWS_SecOC_00031 计算 Authenticator
   - 在 Authentic I-PDU 之后连续添加认证信息：
     - Authenticator（可能截断）
     - Freshness Value（可能截断）
   - 调用 `PduR_SecOCTransmit` 触发发送

4. **步骤 7-8：发送确认透传** [SWS_SecOC_00063]

   - 下层通过 `PduR` 调用 `SecOC_[If\|Tp]TxConfirmation` 通知 SecOC
   - SecOC 通过 `PduR_SecOC[If\|Tp]TxConfirmation` 将结果透传给上层
   - 透传内容：成功或失败状态

5. **缓冲区释放** [SWS_SecOC_00064]

   - 当 `SecOC_TxConfirmation` 被调用时，SecOC 释放包含 Secured I-PDU 的缓冲区
   - 触发条件：Secured I-PDU 发送完成（成功或失败）

6. **关键特性**

   - 认证计算在 **主函数上下文** 中执行，不在传输请求上下文中
   - 上层调用 **不阻塞**，立即返回
   - 支持异步处理，与即时通信总线（如 CAN）配合

7. **相关规范**

   | 规范              | 内容                       |
   | ----------------- | -------------------------- |
   | `SWS_SecOC_00058` | 连续内存缓冲区分配         |
   | `SWS_SecOC_00060` | 主函数中计算 Authenticator |
   | `SWS_SecOC_00061` | 主函数中创建 Secured I-PDU |
   | `SWS_SecOC_00062` | 调用 `PduR_SecOCTransmit`  |
   | `SWS_SecOC_00063` | 发送确认透传               |
   | `SWS_SecOC_00064` | 缓冲区释放                 |

## 触发传输期间的认证

> 对于使用支持触发传输的总线接口（如 FrIf）发送 Authentic I-PDU 时，上层通过调用 `PduR_<Up>Transmit` 发起传输。SecOC 分配缓冲区、复制 Authentic I-PDU 后立即返回，实际认证在后续主函数中完成。之后 SecOC 作为数据提供者，响应下层的 `TriggerTransmit` 请求，并在发送确认后决定是否重新认证。注意：触发传输仅支持上层显式调用 `PduR_<Up>Transmit` 发起的模式，不支持 `AlwaysTransmit` 模式。

1. **触发传输与直接传输的关键差异**

   | 特性             | 直接传输（如 CAN）   | 触发传输（如 FlexRay） |
   | ---------------- | -------------------- | ---------------------- |
   | **数据传输方式** | 上层主动下发         | 下层主动请求数据       |
   | **SecOC 角色**   | 主动发送方           | **数据提供者**         |
   | **主函数认证**   | ✅ 同样在主函数中完成 | ✅ 同样在主函数中完成   |
   | **重新认证支持** | 不适用               | ✅ 支持（可配置）       |

2. **触发传输的完整流程**

   ```mermaid
   sequenceDiagram
       participant Upper as 上层模块
       participant PduR as PduR
       participant SecOC as SecOC
       participant Lower as 下层模块

       Upper->>PduR: ① PduR_UpTransmit
       PduR->>SecOC: ② SecOC_IfTransmit
       SecOC->>SecOC: ③ 分配缓冲区，复制 Authentic I-PDU
       SecOC-->>PduR: 立即返回

       Note over SecOC: 下次主函数调用时

       SecOC->>SecOC: ④ 计算 Authenticator
       SecOC->>SecOC: ⑤ 构造 Secured I-PDU
       SecOC->>PduR: ⑥ PduR_SecOCTransmit
       Note over PduR: 准备就绪，等待下层请求

       Lower->>PduR: ⑦ PduR_LoTriggerTransmit
       PduR->>SecOC: ⑧ SecOC_TriggerTransmit
       SecOC->>Lower: ⑨ 拷贝 Secured I-PDU

       Lower->>PduR: 发送确认
       PduR->>SecOC: ⑩ SecOC_TxConfirmation
       
       alt 重新认证启用
           SecOC->>SecOC: ⑪ 重新认证 Authentic I-PDU
       else 重新认证禁用
           Note over SecOC: 保留 Authentic I-PDU，不重新认证
       end

       SecOC->>PduR: 透传确认
       PduR->>Upper: 透传确认
   ```

3. **步骤 1-3：传输请求与缓冲区分配**

   - 上层通过 `PduR_<Up>Transmit` 发起传输（与直接传输相同）
   - PduR 路由到 SecOC，调用 `SecOC_IfTransmit`
   - 至少需要**一次** `SecOC_IfTransmit` 调用，SecOC 才能通过触发传输接口提供数据
   - 若 `SecOC_TriggerTransmit` 被调用但无数据可提供，返回 `E_NOT_OK`
   - ⚠️ **不支持 `AlwaysTransmit` 模式**

4. **步骤 4-6：主函数中的认证** [SWS_SecOC_00065][SWS_SecOC_00066][SWS_SecOC_00067]

   在下次 `SecOC_MainFunction` 调用时：

   - 根据 SWS_SecOC_00031 计算 Authenticator
   - 构造 Secured I-PDU
   - 调用 `PduR_SecOCTransmit` 向 PduR 指示传输请求

5. **步骤 7-9：触发传输响应** [SWS_SecOC_00068][SWS_SecOC_00150]

   - 下层准备就绪时，通过 `PduR_<Lo>TriggerTransmit` 请求数据
   - PduR 转发给 SecOC，调用 `SecOC_TriggerTransmit`
   - SecOC 将**完整的 Secured I-PDU** 拷贝到下层
   - **重要**：SecOC **不**将触发传输请求转发给上层，而是自己作为上层角色

6. **步骤 10：发送确认与缓冲区管理** [SWS_SecOC_00069]

   - 下层通过 `PduR_<Lo>TxConfirmation` 确认发送
   - PduR 调用 `SecOC_TxConfirmation` 通知 SecOC
   - 缓冲区管理：

   | 操作     | 说明                                              |
   | -------- | ------------------------------------------------- |
   | **释放** | 包含认证信息（Authenticator + Freshness）的缓冲区 |
   | **保留** | 包含 Authentic I-PDU 的缓冲区                     |

   - 重新认证控制：

   | `SecOCReAuthenticateAfterTriggerTransmit` | 行为                                                         |
   | ----------------------------------------- | ------------------------------------------------------------ |
   | `TRUE`                                    | Authentic I-PDU 被视为上层新设置，下次 `SecOC_MainFunctionTx` 时重新认证 |
   | `FALSE`                                   | 不重新认证                                                   |

7. **上下层更新速率差异处理**

   - 下层可能在上层更新之前请求发送新的 Secured I-PDU
   - SecOC 支持**重复发送** Authentic I-PDU（通过更新 Secured I-PDU）
   - 保留 Authentic I-PDU 直到收到 `SecOC_TxConfirmation` 确认

8. **相关配置参数**

   | 配置参数                                  | 说明                       |
   | ----------------------------------------- | -------------------------- |
   | `SecOCReAuthenticateAfterTriggerTransmit` | 触发传输确认后是否重新认证 |
   | `SecOC_TriggerTransmit`                   | SecOC 的触发传输接口       |

## 传输协议传输期间的认证

> 对于使用传输协议（如 CanTP、FrTp）发送 Authentic I-PDU 时，PduR 触发 SecOC 的传输操作。SecOC 分配缓冲区并复制 Authentic I-PDU 后立即返回。与直接传输和触发传输不同，传输协议的认证在后续主函数中完成，但新鲜度值的获取被推迟到消息即将发送到总线时，以确保传输协议长时间传输时仍使用最新值。SecOC 通过 `PduR_SecOCTpStartOfReception` 通知下层，并通过 `SecOC_CopyTxData` 响应下层的分段数据请求。

1. **传输协议传输的完整流程**

   ```mermaid
   sequenceDiagram
       participant Upper as 上层模块
       participant PduR as PduR
       participant SecOC as SecOC
       participant TP as 传输协议层
       participant Lower as 下层模块

       Upper->>PduR: ① PduR_UpTransmit
       PduR->>SecOC: ② SecOC_TpTransmit
       SecOC->>SecOC: ③ 分配缓冲区，复制 Authentic I-PDU
       SecOC-->>PduR: 立即返回

       Note over SecOC: 下次主函数调用时

       SecOC->>SecOC: ④ 计算 Authenticator<br/>（新鲜度值推迟获取）
       SecOC->>SecOC: ⑤ 构造 Secured I-PDU
       SecOC->>PduR: ⑥ PduR_SecOCTpStartOfReception
       Note over PduR: 通知传输层准备接收

       TP->>PduR: ⑦ 请求数据
       PduR->>SecOC: ⑧ SecOC_CopyTxData
       SecOC->>TP: ⑨ 拷贝 NPDU 数据
       
       loop 每个 NPDU
           TP->>PduR: 请求下一段数据
           PduR->>SecOC: SecOC_CopyTxData
           SecOC->>TP: 拷贝 NPDU 数据
       end

       Lower->>PduR: 发送确认
       PduR->>SecOC: ⑩ SecOC_TpTxConfirmation
       SecOC->>PduR: ⑪ 透传确认
       PduR->>Upper: 透传确认
   ```

2. **步骤 1-3：传输请求与缓冲区分配** [SWS_SecOC_00253]

   - 当 `SecOCPduType` 配置为 `SECOC_TPPDU` 时，`SecOC_TpTransmit` 触发传输操作
   - SecOC 分配缓冲区并复制 Authentic I-PDU 后立即返回
   - SecOC 通过调用 `PduR_SecOCTpCopyTxData` 指示上层将 I-PDU 的下一部分拷贝到本地 SecOC 缓冲区 [SWS_SecOC_00254]

3. **步骤 4-6：主函数中的认证** [SWS_SecOC_00070][SWS_SecOC_00071][SWS_SecOC_00072]

   - 在 `SecOC_MainFunction` 中计算 Authenticator 并构造 Secured I-PDU
   - **特殊处理**：新鲜度值**尽可能晚地获取**，即在消息即将发送到总线的下一部分时获取 [SWS_SecOC_00070]
   - 调用 `PduR_SecOCTransmit` 指示完整的 Secured I-PDU 传输请求

4. **步骤 7-9：数据提供者角色** [SWS_SecOC_00073]

   - PduR 通过 `SecOC_CopyTxData` 轮询 SecOC，逐段获取 Secured I-PDU 的 NPDU 数据
   - SecOC 将请求的 NPDU 拷贝到传输协议模块的缓冲区
   - 每次拷贝完成后返回

5. **步骤 10-11：发送确认** [SWS_SecOC_00074]

   - 下层通过 `PduR_<Lo>TxConfirmation` 确认发送
   - PduR 调用 `SecOC_TpTxConfirmation` 通知 SecOC
   - SecOC 根据 `SecOCPduType` 配置，通过对应的确认接口透传结果：
     - `SECOC_IFPDU` → `PduR_SecOCIfTxConfirmation`
     - `SECOC_TPPDU` → `PduR_SecOCTpTxConfirmation`

6. **缓冲区释放** [SWS_SecOC_00075]

   - 仅当 `SecOC_TpTxConfirmation` 被调用时才释放 Secured I-PDU 缓冲区
   - 确保传输协议完全完成发送后才释放资源

7. **直接传输 vs 触发传输 vs 传输协议传输**

   | 对比项           | 直接传输（CAN）  | 触发传输（FlexRay） | 传输协议（CanTP/FrTp） |
   | ---------------- | ---------------- | ------------------- | ---------------------- |
   | **传输触发方式** | 上层下发         | 下层请求            | 上层下发 + 分段请求    |
   | **SecOC 角色**   | 发送方           | 数据提供者          | 数据提供者             |
   | **认证时机**     | 主函数           | 主函数              | 主函数                 |
   | **新鲜度获取**   | 认证时获取       | 认证时获取          | **推迟到发送前**       |
   | **数据传输接口** | 一次性           | 一次性              | 分段（`CopyTxData`）   |
   | **确认接口**     | `TxConfirmation` | `TxConfirmation`    | `TpTxConfirmation`     |

8. **相关配置参数**

   | 配置参数                       | 说明                                      |
   | ------------------------------ | ----------------------------------------- |
   | `SecOCPduType`                 | PDU 类型（`SECOC_IFPDU` / `SECOC_TPPDU`） |
   | `SecOC_TpTransmit`             | 触发传输协议传输的接口                    |
   | `PduR_SecOCTpCopyTxData`       | 指示上层拷贝数据到 SecOC                  |
   | `PduR_SecOCTpStartOfReception` | 通知下层准备接收                          |
   | `SecOC_CopyTxData`             | 响应下层数据请求，拷贝 NPDU               |

## 错误处理与传输取消

> SecOC 模块提供了完整的错误处理和传输取消机制。当上层请求取消传输时，SecOC 立即通知下层取消并释放所有相关缓冲区。对于发送失败、CSM 可恢复错误、CopyTxData 返回繁忙等场景，SecOC 具备重试机制。当重试次数达到配置上限时，向 DET 报告错误。

1. **传输取消（发送方向）** [SWS_SecOC_00076]

   > 当上层通过 `SecOC_[If\|Tp]CancelTransmit` 请求取消正在进行的 Authentic I-PDU 传输时，SecOC 应：
   - 立即通知下层传输协议取消 Secured I-PDU 的传输
   - 停止所有与 Authentic I-PDU 相关的内部操作
   - 释放所有相关缓冲区

2. **传输取消（接收方向）** [SWS_SecOC_00217]

   > 当上层通过 `SecOC_TpCancelReceive` 请求取消正在进行的接收时，SecOC 应：
   - 立即通知下层传输协议取消 Secured I-PDU 的接收
   - 停止所有与 Authentic I-PDU 相关的内部操作
   - 释放所有相关缓冲区

3. **PduR_SecOCTransmit 发送重试** [SWS_SecOC_00277]

   > 当 `PduR_SecOCTransmit` 返回非 `E_OK` 时，SecOC 应在后续主函数中重试失败的传输，最多重试 `SecOCMaxTransmitRetries` 次。

4. **下层传输错误处理** [SWS_SecOC_00077]

   > 当下层传输协议在 Secured I-PDU 传输期间报告错误（返回 `E_NOT_OK`）时，SecOC **不执行任何错误处理**，仅跳过向上层确认对应 Authentic I-PDU 的传输请求。

5. **CSM 可恢复错误处理** [SWS_SecOC_00151]

   > 当 CSM 在认证 Authentic I-PDU 期间报告可恢复错误（如 `E_BUSY`、`QUEUE_FULL`）时：
   - SecOC **不向下层提供** Secured I-PDU
   - 保留该 Authentic I-PDU（除非被同类型新数据覆盖）
   - 在下次主函数调用时重新尝试认证
   - 直到尝试次数达到配置上限

6. **认证尝试次数超限** [SWS_SecOC_00155]

   > 当 Authentic I-PDU 的尝试次数达到 `SecOCAuthenticationBuildAttempts`（Freshness Manager 可提供的新鲜度值最大次数）时，SecOC 向 DET 报告 `SECOC_E_CRYPTO_FAILURE`。

7. **内部错误处理** [SWS_SecOC_00108]

   > 如果 SecOC 因任意内部错误无法服务上层或下层请求，应返回 `E_NOT_OK`。

8. **CopyTxData 错误处理** [SWS_SecOC_00260][SWS_SecOC_00266]

   | 返回码            | 处理方式                                                     |
   | ----------------- | ------------------------------------------------------------ |
   | `BUFREQ_E_BUSY`   | 在下次主函数调用时**重试**                                   |
   | `BUFREQ_E_NOT_OK` | **立即中止**传输，调用 `PduR_SecOCTpTxConfirmation(E_NOT_OK)`，停止内部操作，释放缓冲区 |

9. **错误处理汇总**

   | 错误场景                  | 处理方式                                  |
   | ------------------------- | ----------------------------------------- |
   | 上层请求取消传输          | 立即取消，释放缓冲区                      |
   | `PduR_SecOCTransmit` 失败 | 重试（最多 `SecOCMaxTransmitRetries` 次） |
   | 下层报告 `E_NOT_OK`       | 跳过确认，不进行错误处理                  |
   | CSM 可恢复错误            | 保留数据，下次主函数重试                  |
   | 认证尝试次数超限          | 报告 `SECOC_E_CRYPTO_FAILURE` 到 DET      |
   | 内部错误                  | 返回 `E_NOT_OK`                           |
   | `BUFREQ_E_BUSY`           | 下次主函数重试                            |
   | `BUFREQ_E_NOT_OK`         | 立即中止传输，释放缓冲区                  |

10. **相关配置参数**

    | 配置参数                           | 说明                              |
    | ---------------------------------- | --------------------------------- |
    | `SecOCMaxTransmitRetries`          | `PduR_SecOCTransmit` 最大重试次数 |
    | `SecOCAuthenticationBuildAttempts` | 认证构建最大尝试次数              |
    | `SecOC_[If\|Tp]CancelTransmit`     | 发送取消接口                      |
    | `SecOC_TpCancelReceive`            | 接收取消接口                      |

# 传入 PDU 的验证

> 验证是指将 Secured I-PDU 中包含的认证信息与本地基于 Data Identifier、Freshness Value 和 Authentic I-PDU 计算出的认证信息进行比较的过程。SecOC 模块在接收方向扮演上层模块的角色，完整接收 Secured I-PDU 后，在主函数中进行验证，并根据结果决定是丢弃还是将 Authentic I-PDU 传递给上层。同时提供了接收溢出策略和分片接收的详细处理机制。

1. **验证过程的六步流程**

   | 步骤  | 操作               | 说明                                                         |
   | ----- | ------------------ | ------------------------------------------------------------ |
   | **1** | 接收 Secured I-PDU | SecOC 扮演上层模块，响应下层请求接收完整 PDU                 |
   | **2** | 拷贝到内部缓冲区   | 将 Secured I-PDU 复制到 SecOC 本地内存                       |
   | **3** | 主函数中验证       | 在下一次主函数调用时验证内容                                 |
   | **4** | 验证失败处理       | 若失败且未配置忽略，丢弃 Secured I-PDU                       |
   | **5** | 验证成功处理       | 若成功，调用 `PduR_SecOC[If\|Tp]RxIndication` 传递 Authentic I-PDU |
   | **6** | 报告验证结果       | 根据配置报告验证状态                                         |

2. **接收溢出策略** [SWS_SecOC_00214][SWS_SecOC_00215][SWS_SecOC_00216]

   | 策略        | 行为                                                         |
   | ----------- | ------------------------------------------------------------ |
   | **REPLACE** | 如果已启动接收同一 Pdu Identifier 的 Secured I-PDU，释放所有相关缓冲区，用新数据替换 |
   | **REJECT**  | 如果 SecOC 正忙于处理同一 Secured I-PDU，忽略后续调用，`SecOC_RxIndication` 返回 `BUFREQ_E_NOT_OK` |
   | **QUEUE**   | 如果 SecOC 正忙于处理同一 Secured I-PDU，额外接收并排队，超过 `SecOCReceptionQueueSize` 限制则拒绝后续接收 |

3. **缓冲区分离** [SWS_SecOC_00204]

   > SecOC 为传入的 Secured I-PDU、Cryptographic I-PDU 和生成的 Authentic I-PDU 提供**独立缓冲区**。

   - 下层更新 Secured I-PDU 不影响向上层传递 Authentic I-PDU

4. **分片接收处理（SecOCRxSecuredPduCollection）** [SWS_SecOC_00205][SWS_SecOC_00206]

   > 当配置了 `SecOCRxSecuredPduCollection` 时：
   - SecOC **仅缓冲最后接收**的 Authentic I-PDU 和 Cryptographic I-PDU
   - 新 I-PDU 覆盖旧 I-PDU
   - Authentic I-PDU 和 Cryptographic I-PDU 必须在**直接顺序**中接收，但顺序不限
   - 收到两者后**立即构造** Secured I-PDU 并进行验证

5. **验证成功后的缓冲区清理** [SWS_SecOC_00207]

   > 验证成功后，SecOC 清除 Authentic I-PDU 和 Cryptographic I-PDU 的缓冲区。

6. **动态长度处理** [SWS_SecOC_00257][SWS_SecOC_00258][SWS_SecOC_00259]

   | `SecOCAuthPduHeaderLength` | `SecOCDynamicRuntimeLengthHandling` | 提取 Authentic I-PDU 方式                 |
   | -------------------------- | ----------------------------------- | ----------------------------------------- |
   | `0` 或未配置               | `FALSE`                             | 使用配置的全局 PDU 长度                   |
   | `0` 或未配置               | `TRUE`                              | 使用下层提供的长度                        |
   | `> 0`                      | —                                   | 使用 Secured I-PDU 头部中运行时提供的长度 |

7. **完整接收验证流程图**

   ```mermaid
   flowchart TD
       Recv[接收 Secured I-PDU] --> Strategy{接收溢出策略}
       Strategy -->|REPLACE| Replace[替换现有缓冲区]
       Strategy -->|REJECT| Reject{正忙?}
       Reject -->|是| RejectMsg[返回 BUFREQ_E_NOT_OK]
       Reject -->|否| Copy
       Strategy -->|QUEUE| Queue{正忙?}
       Queue -->|是| QueueBuf[排队<br/>超限则拒绝]
       Queue -->|否| Copy

       Replace --> Copy
       QueueBuf --> Copy
       Copy[拷贝到内部缓冲区] --> Main[主函数中验证]

       Main --> Check{验证<br/>通过?}
       Check -->|是| Pass[传递 Authentic I-PDU<br/>到上层]
       Check -->|否| Ignore{忽略验证结果<br/>配置?}
       Ignore -->|TRUE| Pass
       Ignore -->|FALSE| Drop[丢弃 PDU]
   ```

8. **相关配置参数**

   | 配置参数                            | 说明                                     |
   | ----------------------------------- | ---------------------------------------- |
   | `SecOCReceptionOverflowStrategy`    | 接收溢出策略（REPLACE / REJECT / QUEUE） |
   | `SecOCReceptionQueueSize`           | 接收队列大小（QUEUE 策略时）             |
   | `SecOCRxSecuredPduCollection`       | 是否启用分片接收                         |
   | `SecOCAuthPduHeaderLength`          | Secured I-PDU 头部长度                   |
   | `SecOCDynamicRuntimeLengthHandling` | 是否使用动态长度处理                     |
   | `SecOCIgnoreVerificationResult`     | 是否忽略验证结果（始终传递）             |

## 总线接口接收期间的验证

> 当 Secured I-PDU 通过下层总线接口（如 CanIf、FrIf）接收时，PduR 调用 `SecOC_RxIndication` 通知 SecOC。SecOC 将 I-PDU 拷贝到内部缓冲区，实际验证在后续主函数中执行。验证成功或配置为忽略验证结果时，通过 `PduR_SecOC[If|Tp]RxIndication` 将 Authentic I-PDU 传递给上层；验证失败则丢弃。

1. **接收流程**

   | 步骤  | 操作                           | 说明                                                       |
   | ----- | ------------------------------ | ---------------------------------------------------------- |
   | **1** | PduR 调用 `SecOC_RxIndication` | 通知 SecOC 收到 Secured I-PDU                              |
   | **2** | SecOC 拷贝 I-PDU 到缓冲区      | 根据最小长度拷贝，防止缓冲区溢出                           |
   | **3** | 主函数中验证                   | 下次 `SecOC_MainFunction` 调用时执行                       |
   | **4** | 验证成功或忽略验证结果         | 调用 `PduR_SecOC[If\|Tp]RxIndication` 传递 Authentic I-PDU |
   | **5** | 验证失败（且未配置忽略）       | 丢弃 PDU，不调用 `RxIndication`                            |

2. **静态长度 I-PDU 的长度校验** [SWS_SecOC_00268]

   > 当接收静态长度 I-PDU（`SecOCDynamicRuntimeLengthHandling = FALSE`）且接收长度小于配置长度时，SecOC 应**静默丢弃**该 I-PDU。

   - 原因：静态 PDU 通常以配置长度发送，长度不匹配视为错误场景
   - 静态 PDU 不包含头部长度信息，短长度结合填充字节可能导致错误

3. **数据拷贝规则** [SWS_SecOC_00078]

   > SecOC 根据**接收长度和配置长度的较小值**拷贝 I-PDU，拷贝长度用于后续所有接收处理。

   - 确保缓冲区不会被覆盖
   - 丢弃非预期数据（可能因填充添加）
   - 动态长度 PDU 长度较短时，仅拷贝提供的长度

4. **验证与结果传递** [SWS_SecOC_00079][SWS_SecOC_00080][SWS_SecOC_00081]

   | 场景                                               | 行为                                                       |
   | -------------------------------------------------- | ---------------------------------------------------------- |
   | 验证成功                                           | 调用 `PduR_SecOC[If\|Tp]RxIndication` 传递 Authentic I-PDU |
   | 验证失败 + `SecOCIgnoreVerificationResult = TRUE`  | 调用 `PduR_SecOC[If\|Tp]RxIndication`（忽略验证结果）      |
   | 验证失败 + `SecOCIgnoreVerificationResult = FALSE` | **不调用** `RxIndication`，丢弃 PDU                        |

5. **完整接收验证流程图**

   ```mermaid
   flowchart TD
       Recv[PduR 调用 SecOC_RxIndication] --> CheckLen{PDU 类型}
       CheckLen -->|静态长度| LenCheck{接收长度<br/>< 配置长度?}
       LenCheck -->|是| Drop[静默丢弃]
       LenCheck -->|否| Copy
       CheckLen -->|动态长度| Copy

       Copy[拷贝 I-PDU 到缓冲区<br/>按较小值拷贝] --> Main[主函数中验证]

       Main --> Verify{验证结果}
       Verify -->|成功| Pass[调用 PduR_SecOC_RxIndication<br/>传递 Authentic I-PDU]
       Verify -->|失败| Ignore{忽略验证结果?}
       Ignore -->|TRUE| Pass
       Ignore -->|FALSE| Discard[丢弃 PDU<br/>不调用 RxIndication]
   ```

6. **相关配置参数**

   | 配置参数                            | 说明                                      |
   | ----------------------------------- | ----------------------------------------- |
   | `SecOCDynamicRuntimeLengthHandling` | 是否启用动态长度处理                      |
   | `SecOCIgnoreVerificationResult`     | 是否忽略验证结果（TRUE 时即使失败也传递） |
   | `SecOC_RxIndication`                | PduR 调用通知 SecOC 接收                  |
   | `PduR_SecOC[If\|Tp]RxIndication`    | SecOC 通知 PduR 接收 Authentic I-PDU      |

## 传输协议接收期间的验证

> 当 Secured I-PDU 通过下层传输协议接口（如 CanTp、FrTp）接收时，PduR 通过 `SecOC_StartOfReception`、`SecOC_CopyRxData` 和 `SecOC_TpRxIndication` 分阶段通知 SecOC。SecOC 在接收完成后于主函数中执行验证，并根据结果将 Authentic I-PDU 传递给上层或丢弃。

1. **接收流程的四个阶段**

   | 阶段  | 操作                       | 说明                              |
   | ----- | -------------------------- | --------------------------------- |
   | **1** | `SecOC_StartOfReception`   | 通知接收即将开始，分配缓冲区      |
   | **2** | `SecOC_CopyRxData`（多次） | 逐段拷贝 NPDU 数据到 SecOC 缓冲区 |
   | **3** | `SecOC_TpRxIndication`     | 通知完整接收完成                  |
   | **4** | 主函数中验证               | 下次主函数调用时执行验证          |

2. **阶段 1：StartOfReception** [SWS_SecOC_00082]

   - PduR 调用 `SecOC_StartOfReception` 通知接收即将开始
   - SecOC 分配存储完整 Secured I-PDU 的缓冲区
   - 若 `SecOCPduType = SECOC_TPPDU`，转发调用 `PduR_SecOCTpStartOfReception`
   - 若上层不接受接收，SecOC 也不应接受

3. **阶段 2：CopyRxData** [SWS_SecOC_00083]

   - 下层逐段调用 `SecOC_CopyRxData` 指示 NPDU 数据
   - SecOC 将 NPDU 拷贝到自己的缓冲区
   - 每次拷贝完成后返回

4. **阶段 3：TpRxIndication** [SWS_SecOC_00084]

   - 下层通过 `SecOC_TpRxIndication` 确认完整接收
   - SecOC 立即返回，**不进行任何进一步处理**
   - 实际验证推迟到下次主函数调用

5. **阶段 4：主函数验证** [SWS_SecOC_00085]

   - 在 `SecOC_MainFunction` 中验证 Secured I-PDU 内容

6. **验证成功/失败处理** [SWS_SecOC_00086][SWS_SecOC_00088]

   | 配置                                               | 结果 | 行为                                 |
   | -------------------------------------------------- | ---- | ------------------------------------ |
   | 验证成功                                           | —    | 传递 Authentic I-PDU 给上层          |
   | 验证失败 + `SecOCIgnoreVerificationResult = TRUE`  | —    | 传递 Authentic I-PDU（忽略验证结果） |
   | 验证失败 + `SecOCIgnoreVerificationResult = FALSE` | —    | 丢弃 PDU，取消上层接收               |

   **传递方式**：

   | `SecOCPduType` | 调用方式                                                   |
   | -------------- | ---------------------------------------------------------- |
   | `SECOC_IFPDU`  | `PduR_SecOCIfRxIndication`                                 |
   | `SECOC_TPPDU`  | 先 `PduR_SecOCTpCopyRxData`，后 `PduR_SecOCTpRxIndication` |

7. **缓冲区释放时机** [SWS_SecOC_00087]

   | 释放条件                                                     | 说明     |
   | ------------------------------------------------------------ | -------- |
   | 已通过 `PduR_SecOC[If\|Tp]RxIndication` 传递 Authentic I-PDU | 正常完成 |
   | 验证最终失败                                                 | 丢弃 PDU |
   | 传输被上层或下层取消                                         | 取消操作 |

8. **完整接收验证流程图**

   ```mermaid
   flowchart TD
       Start[下层开始接收] --> Stage1[SecOC_StartOfReception<br/>分配缓冲区]
       Stage1 --> Stage2[SecOC_CopyRxData<br/>逐段拷贝 NPDU]
       Stage2 --> Stage3[SecOC_TpRxIndication<br/>接收完成确认]
       Stage3 --> Main[主函数验证]

       Main --> Verify{验证<br/>通过?}
       Verify -->|是| Pass[传递 Authentic I-PDU<br/>到上层]
       Verify -->|否| Ignore{忽略验证结果?}
       Ignore -->|TRUE| Pass
       Ignore -->|FALSE| Drop[丢弃 PDU<br/>取消上层接收]

       Pass --> Free1[释放缓冲区]
       Drop --> Free2[释放缓冲区]
   ```

9. **传输协议接收 vs 总线接口接收**

   | 对比项       | 总线接口接收                     | 传输协议接收                                         |
   | ------------ | -------------------------------- | ---------------------------------------------------- |
   | **通知方式** | `SecOC_RxIndication`（一次性）   | `StartOfReception` + `CopyRxData` + `TpRxIndication` |
   | **数据拷贝** | 一次性拷贝完整 PDU               | 逐段拷贝 NPDU                                        |
   | **验证时机** | 主函数                           | 主函数                                               |
   | **上层传递** | `PduR_SecOC[If\|Tp]RxIndication` | IF: 直接传递；TP: 先 Copy 后 Indication              |
   | **取消接收** | —                                | `PduR_SecOCTpRxIndication`（负向确认）               |

10. **相关配置参数**

    | 配置参数                                              | 说明                                      |
    | ----------------------------------------------------- | ----------------------------------------- |
    | `SecOCPduType`                                        | PDU 类型（`SECOC_IFPDU` / `SECOC_TPPDU`） |
    | `SecOCIgnoreVerificationResult`                       | 是否忽略验证结果                          |
    | `SecOC_StartOfReception`                              | 接收开始通知接口                          |
    | `SecOC_CopyRxData`                                    | 拷贝 NPDU 数据接口                        |
    | `SecOC_TpRxIndication`                                | 接收完成通知接口                          |
    | `PduR_SecOCIfRxIndication`                            | IF PDU 上层传递接口                       |
    | `PduR_SecOCTpCopyRxData` / `PduR_SecOCTpRxIndication` | TP PDU 上层传递接口                       |

## 在 SecOC 中跳过对 Secured I-PDU 的认证

> 对于配置了 `SecOCSecuredRxPduVerification = false` 的接收 Secured I-PDU，SecOC 模块应**不进行认证**，直接提取 Authentic I-PDU。

1. **功能说明** [SWS_SecOC_00265]

   - 当 `SecOCSecuredRxPduVerification = false` 时，SecOC **跳过**认证流程
   - 直接从 Secured I-PDU 中提取 Authentic I-PDU
   - 不执行任何 MAC 验证或新鲜度检查

2. **适用场景**

   | 场景             | 说明                           |
   | ---------------- | ------------------------------ |
   | **调试/测试**    | 开发阶段跳过认证，便于问题排查 |
   | **性能优化**     | 对非关键信号降低处理开销       |
   | **兼容模式**     | 与不支持 SecOC 的旧节点通信    |
   | **混合安全策略** | 部分 PDU 需要保护，部分不需要  |

3. **配置方式**

   | 配置参数                        | 值             | 行为                   |
   | ------------------------------- | -------------- | ---------------------- |
   | `SecOCSecuredRxPduVerification` | `true`（默认） | 执行完整认证流程       |
   | `SecOCSecuredRxPduVerification` | `false`        | **跳过认证**，直接提取 |

4. **处理流程对比**

   ```mermaid
   flowchart TD
       subgraph WithAuth[认证启用（默认）]
           Recv1[接收 Secured I-PDU] --> Parse1[解析 PDU]
           Parse1 --> Verify[验证 MAC 和新鲜度]
           Verify --> Pass{通过?}
           Pass -->|是| Extract1[提取 Authentic I-PDU]
           Pass -->|否| Drop[丢弃]
       end

       subgraph WithoutAuth[认证跳过]
           Recv2[接收 Secured I-PDU] --> Extract2[直接提取<br/>不验证]
           Extract2 --> Pass2[传递给上层]
       end
   ```

5. **安全注意事项**

   - 仅在**非生产环境**或**明确安全评估**后使用
   - 生产环境中禁用认证会**破坏安全保护**，允许：
     - 消息伪造（无 MAC 验证）
     - 重放攻击（无新鲜度检查）
     - 数据篡改（无完整性校验）

6. **相关配置参数**

   | 配置参数                        | 说明                      |
   | ------------------------------- | ------------------------- |
   | `SecOCSecuredRxPduVerification` | 是否对该 PDU 执行接收认证 |

## 接收的错误处理与丢弃

> SecOC 模块在接收方向提供了完善的错误处理机制。当下层传输协议报告错误、CSM 验证失败、PDU 头部长度异常或内部错误发生时，SecOC 会相应地丢弃 PDU、释放缓冲区、重试验证或中止接收流程。

1. **下层传输协议错误** [SWS_SecOC_00089]

   > 当 `SecOC_TpRxIndication` 返回非 `E_OK` 时，SecOC 应丢弃 Secured I-PDU 并释放所有对应缓冲区。

2. **CSM 验证错误** [SWS_SecOC_00121]

   > 当 CSM 在验证期间报告错误（验证尝试返回 `E_NOT_OK`）时：
   - SecOC **不提供** Authentic I-PDU 给上层
   - 保留 Secured I-PDU（除非被同类型新数据覆盖）
   - 下次主函数调用时重新尝试验证

3. **分片接收验证失败重试** [SWS_SecOC_00208]

   > 对于分片接收（`SecOCRxSecuredPduCollection`），当 Authentic I-PDU 和 Cryptographic PDU 均已收到但验证失败时：
   - Authentic 和 Cryptographic I-PDU **保持缓冲**
   - 每次收到任一 PDU 的新数据时**重新尝试验证**
   - 确保即使某一 PDU 在传输中丢失，收到后续匹配的 PDU 后仍能正常工作

4. **内部错误** [SWS_SecOC_00109]

   > 如果 SecOC 因任意内部错误无法服务上层或下层请求，应返回 `E_NOT_OK`。

5. **头部长度异常处理** [SWS_SecOC_00263]

   > 对于 `SecOCAuthPduHeaderLength > 0` 的接收 Secured I-PDU：
   - 若头部中 Authentic I-PDU 长度**大于**配置长度，SecOC 应**丢弃**该 I-PDU
   - 在 `SecOC_StartOfReception` 中返回 `BUFREQ_E_NOT_OK`

6. **PDU 解析与字节丢弃** [SWS_SecOC_00264]

   > 对于 `SecOCAuthPduHeaderLength > 0` 的接收 Secured I-PDU，SecOC 处理以下部分，其余字节**丢弃**：
   - Secured I-PDU Header
   - Authentic I-PDU（按头部指定长度）
   - Freshness Value
   - Authenticator

   > 静态 PDU（无头部）且来自会添加填充的总线（CAN FD、FlexRay）时，使用配置的 `SduLength` 确定新鲜度/Authenticator 位置。

7. **CopyRxData 错误处理** [SWS_SecOC_00267]

   > 当上层传输协议在 `PduR_SecOCTpCopyRxData` 调用中报告 `BUFREQ_E_NOT_OK` 时，SecOC 应：
   - **立即中止**接收
   - 调用 `PduR_SecOCTpRxIndication(E_NOT_OK)`
   - 停止所有与 Secured I-PDU 相关的内部操作
   - 释放所有相关缓冲区

8. **接收错误处理汇总**

   | 错误场景                                  | 处理方式                         |
   | ----------------------------------------- | -------------------------------- |
   | 下层 `SecOC_TpRxIndication` 返回非 `E_OK` | 丢弃 PDU，释放缓冲区             |
   | CSM 验证返回 `E_NOT_OK`                   | 保留 PDU，下次主函数重试         |
   | 分片接收验证失败                          | 保持缓冲，收到新数据时重试       |
   | 内部错误                                  | 返回 `E_NOT_OK`                  |
   | 头部长度 > 配置长度                       | 丢弃 PDU，返回 `BUFREQ_E_NOT_OK` |
   | `BUFREQ_E_NOT_OK`（CopyRxData）           | 立即中止接收，释放缓冲区         |

9. **相关配置参数**

   | 配置参数                            | 说明                   |
   | ----------------------------------- | ---------------------- |
   | `SecOCAuthPduHeaderLength`          | Secured I-PDU 头部长度 |
   | `SecOCDynamicRuntimeLengthHandling` | 是否启用动态长度处理   |
   | `SecOCRxSecuredPduCollection`       | 是否启用分片接收       |
   | `SecOC_TpRxIndication`              | 传输协议接收确认接口   |

# 网关功能

> SecOC 模块支持对从一个源总线路由到一个或多个目标总线的 I-PDU 进行认证和验证。这允许实现**重认证网关**，用于连接具有不同安全区域或属性的网络。入向验证和出向认证需要分别配置。SecOC **不支持“即时网关”**（Gatewaying-on-the-fly）。

1. **支持的网关功能**

   | 功能                | 说明                                            |
   | ------------------- | ----------------------------------------------- |
   | **出向 I-PDU 认证** | 为路由到目标总线的 I-PDU 添加认证信息           |
   | **入向 I-PDU 验证** | 验证从源总线接收的 I-PDU                        |
   | **重认证网关**      | 入向验证 + 立即重新认证，然后路由到另一下层模块 |

2. **配置方式**

   - 每个 I-PDU 的认证和验证过程需**分别配置**
   - 出向认证：按照 7.4 节配置
   - 入向验证：按照 7.5 节配置
   - 重认证：入向验证与出向认证组合配置

3. **重认证网关的数据流**

   ```mermaid
   flowchart LR
       subgraph Src[源总线]
           SrcBus[源总线<br/>安全区域 A]
       end

       subgraph Gateway[网关节点]
           Rx[入向验证<br/>7.5] --> Tx[出向认证<br/>7.4]
       end

       subgraph Dst[目标总线]
           DstBus[目标总线<br/>安全区域 B]
       end

       SrcBus -->|Secured I-PDU| Rx
       Tx -->|新 Secured I-PDU| DstBus
   ```

4. **重认证网关的处理流程**

   ```mermaid
   flowchart TD
       Recv[从源总线接收 Secured I-PDU] --> Verify[入向验证<br/>检查 MAC + 新鲜度]
       Verify -->|通过| Extract[提取 Authentic I-PDU]
       Verify -->|失败| Drop[丢弃 PDU]
       Extract --> Auth[出向认证<br/>生成新 MAC + 新鲜度]
       Auth --> Send[发送到目标总线]
   ```

5. **重要限制**

   > **“即时网关”不被 SecOC 支持**

   - 不支持边接收边转发的流式处理
   - 必须**完整接收** Secured I-PDU 并完成验证后，才能开始认证和转发

6. **关键设计要点**

   - 源总线和目标总线可使用**不同的安全策略**（如不同的密钥、Profile、新鲜度机制）
   - 重认证网关充当**安全边界**，隔离不同安全区域
   - 每个方向的认证/验证独立配置，提供最大灵活性

7. **相关章节**

   | 章节 | 内容            |
   | ---- | --------------- |
   | 5    | 出向 I-PDU 认证 |
   | 6    | 入向 I-PDU 验证 |

# 多核分布

> 为了实现不同分区之间的负载均衡，加密栈的不同部分可分配到不同分区。SecOC 模块支持按加密实例进行分区分配，即加密驱动实例可放置在不同的独立分区上。主执行线程（MainFunction）可拆分为多个独立的主函数（每个分区至少一个），使加密栈的流转保持在单个分区范围内，无需特殊的多分区通信机制。SecOC 与 PduR 之间的跨分区通信由 PduR 管理。每个主函数实例独立定义其时间基准，以适配不同时序要求。

1. **分区分配原则**

   - 加密栈的不同部分可分配到不同分区
   - 支持按**加密实例**进行分区分配
   - 加密驱动实例可放置在不同的独立分区上

2. **MainFunction 拆分**

   - SecOC 模块的主执行线程可拆分为**多个 MainFunction**
   - 每个分区**至少有一个** MainFunction
   - 这样加密栈的数据流保持在**单个分区范围**内，无需特殊的多分区通信机制

3. **跨分区通信**

   - SecOC 与 PduR 之间的跨分区通信由 **PduR 管理**
   - 每个 MainFunction 实例独立定义其**时间基准**

4. **发送处理分配** [SWS_SecOC_00276]

   > `SecOCTxPduProcessings` 在通过 `SecOCTxPduMainFunctionRef` 引用的 MainFunction 中处理。

   - 配置参数：`SecOCTxPduMainFunctionRef`
   - 引用对应的 MainFunction 实例
   - 允许不同发送 PDU 的处理分配到不同分区

5. **多核分布示意图**

   ```mermaid
   flowchart TD
       subgraph Partition0[分区 0]
           MF0[SecOC_MainFunction_0]
           TX0[SecOCTxPduProcessings<br/>引用 MF0]
           RX0[接收处理]
       end

       subgraph Partition1[分区 1]
           MF1[SecOC_MainFunction_1]
           TX1[SecOCTxPduProcessings<br/>引用 MF1]
           RX1[接收处理]
       end

       subgraph Crypto[加密服务]
           CSM0[CSM 实例 0<br/>分区 0]
           CSM1[CSM 实例 1<br/>分区 1]
       end

       MF0 --> CSM0
       MF1 --> CSM1
   ```

6. **相关配置参数**

   | 配置参数                    | 说明                              |
   | --------------------------- | --------------------------------- |
   | `SecOCTxPduMainFunctionRef` | 引用发送 PDU 处理所在的主函数实例 |
   | `ECUC_SecOC_00111`          | 相关配置参数                      |

# 安全事件

> 当 SecOC 模块启用了安全事件上报（`SecOCEnableSecurityEventReporting = true`）时，相应的安全事件通过 AUTOSAR_BSWGeneral 中定义的接口上报给 IdsM（入侵检测系统管理器）。SecOC 标准化了两类安全事件及其触发条件和上下文数据。

1. **安全事件上报的启用**

   - 配置参数：`SecOCEnableSecurityEventReporting`
   - 值为 `true` 时启用安全事件上报
   - 上报目标：IdsM（入侵检测系统管理器）
   - 上报接口：AUTOSAR_SWS_BSWGeneral 中定义

2. **标准化的安全事件列表** [SWS_SecOC_00115]

   | 事件名称                            | 事件 ID | 描述                                        | 触发条件              |
   | ----------------------------------- | ------- | ------------------------------------------- | --------------------- |
   | `SECOC_SEV_MAC_VERIFICATION_FAILED` | 44      | 接收到的 PDU 的 MAC 验证失败                | 验证过程中 MAC 不匹配 |
   | `SECOC_SEV_FRESHNESS_NOT_AVAILABLE` | 45      | 无法从 FvM（Freshness Manager）获取新鲜度值 | 新鲜度值查询失败      |

3. **安全事件的上下文数据** [SWS_SecOC_00275]

   | 安全事件                            | 上下文数据         | 说明                                           |
   | ----------------------------------- | ------------------ | ---------------------------------------------- |
   | `SECOC_SEV_MAC_VERIFICATION_FAILED` | `DataId`（2 字节） | 发生 MAC 验证失败的 Secured I-PDU 的数据标识符 |
   | `SECOC_SEV_FRESHNESS_NOT_AVAILABLE` | —                  | 无额外上下文数据                               |

4. **安全事件上报的价值**

   - 实时监控安全通信状态，及时发现异常
   - 为入侵检测系统提供关键输入，分析潜在攻击
   - 支持安全事件统计和后续安全响应

5. **相关配置参数**

   | 配置参数                            | 说明                                    |
   | ----------------------------------- | --------------------------------------- |
   | `SecOCEnableSecurityEventReporting` | 是否启用安全事件上报                    |
   | `DataId`                            | 安全事件关联的 Secured I-PDU 数据标识符 |

6. **相关规范**

   | 规范                     | 内容              |
   | ------------------------ | ----------------- |
   | `AUTOSAR_SWS_BSWGeneral` | IdsM 上报接口定义 |
   | `RS_Ids_00810`           | 安全事件上报需求  |

# 安全配置文件

## 配置安全区域

> SecOC 模块支持通过配置安全区域（Secured Area）的偏移量和长度，限制认证计算的范围。这允许安全保护仅应用于 PDU 中的特定部分，而非整个 PDU。

1. **安全区域的偏移量配置** [SWS_SecOC_00311]

   > 如果配置了 `SecOCSecuredTxPduOffset` 或 `SecOCSecuredRxPduOffset`，应用的安全配置文件应**仅从配置的偏移量开始**考虑字节。

   - 发送方向：`SecOCSecuredTxPduOffset`
   - 接收方向：`SecOCSecuredRxPduOffset`
   - 作用：跳过 PDU 开头的指定字节数，从偏移位置开始应用安全保护

2. **安全区域长度配置** [SWS_SecOC_00312]

   > 如果配置了 `SecOCSecuredTxPduLength` 或 `SecOCSecuredRxPduLength`，应用的安全配置文件应**仅考虑配置的长度**。

   - 发送方向：`SecOCSecuredTxPduLength`
   - 接收方向：`SecOCSecuredRxPduLength`
   - 作用：仅从偏移位置开始，保护指定长度的数据

3. **发送方向长度校验** [SWS_SecOC_00313]

   > 如果 **偏移 + 长度 > PduInfoPtr→SduLength**（提供给 `SecOC_IfTransmit` 或 `SecOC_TpTransmit` 的 PDU 长度），该 PDU 应被**丢弃**并返回 `E_NOT_OK`。

4. **接收方向长度校验** [SWS_SecOC_00314]

   > 如果 **偏移 + 长度 > 接收 PDU 长度**，该 PDU 应被**丢弃**。

5. **安全区域配置示意图**

   ```mermaid
   flowchart LR
       subgraph PDU[PDU 结构]
           Start[PDU 起始] --> Offset[偏移量<br/>SecOCSecuredPduOffset]
           Offset --> Secured[安全区域<br/>SecOCSecuredPduLength]
           Secured --> End[PDU 结束]
       end
   ```

6. **配置示例**

   | 场景         | 偏移量 | 安全区域长度 | 效果                                 |
   | ------------ | ------ | ------------ | ------------------------------------ |
   | 跳过头部     | 4 字节 | 8 字节       | 保护第 5~12 字节                     |
   | 保护尾部     | 4 字节 | 24 字节      | 保护第 5~28 字节（假设总长 32 字节） |
   | 保护固定区域 | 2 字节 | 6 字节       | 保护第 3~8 字节                      |

7. **相关配置参数**

   | 配置参数                  | 说明                               |
   | ------------------------- | ---------------------------------- |
   | `SecOCSecuredTxPduOffset` | 发送方向安全区域起始偏移量（字节） |
   | `SecOCSecuredTxPduLength` | 发送方向安全区域长度（字节）       |
   | `SecOCSecuredRxPduOffset` | 接收方向安全区域起始偏移量（字节） |
   | `SecOCSecuredRxPduLength` | 接收方向安全区域长度（字节）       |

8. **配置校验**

   - 发送方向：`偏移 + 长度 > SduLength` → **丢弃 PDU**，返回 `E_NOT_OK`
   - 接收方向：`偏移 + 长度 > 接收长度` → **丢弃 PDU**

## 安全配置文件概述

> SecOC 模块允许灵活配置 MAC 计算所使用的加密算法和模式，以及 MAC 和新鲜度值的截断方式。**安全配置文件**为这些相关配置参数提供了一组**一致的值集合**，简化了安全通信的配置过程。

1. **安全配置文件的作用**

   - 提供一组预定义的、一致的配置参数值
   - 简化 SecOC 的安全配置过程
   - 确保加密算法、密钥长度、截断长度等参数之间的兼容性

2. **配置文件覆盖的配置参数** [SWS_SecOC_00190]

   | 配置项                           | 说明                         |
   | -------------------------------- | ---------------------------- |
   | `algorithmFamily`                | 认证算法系列（如 AES）       |
   | `algorithmMode`                  | 算法模式（如 CMAC、CBC-MAC） |
   | `algorithmSecondaryFamily`       | 辅助算法系列                 |
   | `SecOCFreshnessValueLength`      | 新鲜度值的完整长度（bit）    |
   | `SecOCFreshnessValueTruncLength` | 截断后新鲜度值的长度（bit）  |
   | `SecOCAuthInfoTruncLength`       | 截断后 MAC 的长度（bit）     |
   | `description`                    | 配置文件的描述信息           |

3. **配置文件的必选参数** [SWS_SecOC_00191]

   | 参数                        | 类型              | 说明                    |
   | --------------------------- | ----------------- | ----------------------- |
   | `algorithmFamily`           | `String`          | 加密算法系列            |
   | `algorithmMode`             | `String`          | 算法运行模式            |
   | `algorithmSecondaryFamily`  | `String`          | 辅助算法系列            |
   | `authInfoTxLength`          | `PositiveInteger` | 认证信息截断长度（bit） |
   | `freshnessValueLength`      | `PositiveInteger` | 新鲜度值完整长度（bit） |
   | `freshnessValueTruncLength` | `PositiveInteger` | 新鲜度值截断长度（bit） |

4. **配置文件的使用场景**

   - 发送方向：引用 `SecOCTxAuthServiceConfigRef`
   - 接收方向：引用 `SecOCRxAuthServiceConfigRef`
   - 通过配置文件统一管理加密相关配置，避免单点配置错误

5. **配置文件与 SecOC 模块的关系**

   ```mermaid
   flowchart LR
       Profile[安全配置文件] -->|引用| Tx[发送方配置<br/>SecOCTxAuthServiceConfigRef]
       Profile -->|引用| Rx[接收方配置<br/>SecOCRxAuthServiceConfigRef]

       Tx -->|确定| AlgoTx[加密算法]
       Tx -->|确定| TruncTx[MAC 截断长度]
       Tx -->|确定| FVTx[新鲜度值长度]

       Rx -->|确定| AlgoRx[加密算法]
       Rx -->|确定| TruncRx[MAC 截断长度]
       Rx -->|确定| FVRx[新鲜度值长度]
   ```

6. **相关配置参数**

   | 配置参数                            | 说明                   |
   | ----------------------------------- | ---------------------- |
   | `SecOCTxAuthServiceConfigRef`       | 发送方认证服务配置引用 |
   | `SecOCRxAuthServiceConfigRef`       | 接收方认证服务配置引用 |
   | `algorithmFamily` / `algorithmMode` | CSM 加密服务原语配置   |

## SecOC Profile 1（24Bit-CMAC-8Bit-FV）

> SecOC Profile 1 使用基于 AES-128 的 CMAC 算法（依据 NIST SP 800-38B）计算 MAC。它截取 MAC 的**最高 24 位**作为截断 MAC，并截取新鲜度值的**最低 8 位**作为截断新鲜度值。

1. **算法配置参数** [SWS_SecOC_00192]

   | 参数                       | 配置值                   | 说明              |
   | -------------------------- | ------------------------ | ----------------- |
   | `algorithmFamily`          | `CRYPTO_ALGOFAM_AES`     | 使用 AES 算法系列 |
   | `algorithmMode`            | `CRYPTO_ALGOMODE_CMAC`   | 使用 CMAC 模式    |
   | `algorithmSecondaryFamily` | `CRYPTO_ALGOFAM_NOT_SET` | 本配置文件未使用  |

2. **长度配置参数**

   | 参数                             | 配置值          | 说明                                                    |
   | -------------------------------- | --------------- | ------------------------------------------------------- |
   | `SecOCFreshnessValueLength`      | `Not Specified` | 新鲜度值完整长度未指定（由外部 Freshness Manager 决定） |
   | `SecOCFreshnessValueTruncLength` | `8 bits`        | 截断新鲜度值长度：**8 位**（最低有效位）                |
   | `SecOCAuthInfoTruncLength`       | `24 bits`       | 截断 MAC 长度：**24 位**（最高有效位）                  |

3. **Profile 1 数据布局**

   ```mermaid
   flowchart LR
       subgraph SecuredPDU[Secured I-PDU 结构]
           AuthPDU[Authentic I-PDU] --> FV[截断新鲜度值<br/>8 bits]
           FV --> MAC[截断 MAC<br/>24 bits]
       end
   ```

4. **MAC 截断说明**

   - 完整 MAC：AES-128 CMAC 生成 128 位 MAC
   - 截断方式：取**最高 24 位**（Most Significant Bits）
   - 截断后长度：24 bits = 3 bytes

5. **新鲜度值截断说明**

   - 截断方式：取**最低 8 位**（Least Significant Bits）
   - 截断后长度：8 bits = 1 byte

6. **Profile 1 特点**

   | 特点             | 说明                            |
   | ---------------- | ------------------------------- |
   | **算法**         | AES-128 CMAC（NIST SP 800-38B） |
   | **MAC 长度**     | 24 bits（3 字节）               |
   | **新鲜度值长度** | 8 bits（1 字节）                |
   | **安全等级**     | 较低（短 MAC 适合资源受限场景） |
   | **带宽占用**     | 低（共 4 字节认证信息）         |
   | **适用场景**     | 资源受限、带宽敏感的系统        |

7. **相关规范**

   - NIST SP 800-38B：CMAC 算法规范
   - SWS_SecOC_00192：Profile 1 配置定义
   - 7.10.1：安全区域配置
   - 7.10.2：安全配置文件概述

## SecOC Profile 2（24Bit-CMAC-No-FV）

> SecOC Profile 2 使用基于 AES-128 的 CMAC 算法（依据 NIST SP 800-38B）计算 MAC，**不使用任何新鲜度值**，并取 MAC 的**最高 24 位**作为截断 MAC。

1. **算法配置参数** [SWS_SecOC_00193]

   | 参数                       | 配置值                   | 说明              |
   | -------------------------- | ------------------------ | ----------------- |
   | `algorithmFamily`          | `CRYPTO_ALGOFAM_AES`     | 使用 AES 算法系列 |
   | `algorithmMode`            | `CRYPTO_ALGOMODE_CMAC`   | 使用 CMAC 模式    |
   | `algorithmSecondaryFamily` | `CRYPTO_ALGOFAM_NOT_SET` | 本配置文件未使用  |

2. **长度配置参数**

   | 参数                             | 配置值    | 说明                                   |
   | -------------------------------- | --------- | -------------------------------------- |
   | `SecOCFreshnessValueLength`      | `0`       | 不使用新鲜度值                         |
   | `SecOCFreshnessValueTruncLength` | `0 bits`  | 无新鲜度值截断                         |
   | `SecOCAuthInfoTruncLength`       | `24 bits` | 截断 MAC 长度：**24 位**（最高有效位） |

3. **Profile 2 数据布局**

   ```mermaid
   flowchart LR
       subgraph SecuredPDU[Secured I-PDU 结构]
           AuthPDU[Authentic I-PDU] --> MAC[截断 MAC<br/>24 bits]
       end
   ```

   - **无新鲜度值**字段
   - 仅包含 Authentic I-PDU + 截断 MAC（3 字节）

4. **使用限制**

   > 此配置文件**仅在没有建立同步新鲜度值时使用**。

   - 不提供防重放攻击保护
   - 仅提供数据来源认证和完整性保护
   - 无总线类型限制

5. **Profile 2 特点**

   | 特点           | 说明                                           |
   | -------------- | ---------------------------------------------- |
   | **算法**       | AES-128 CMAC（NIST SP 800-38B）                |
   | **MAC 长度**   | 24 bits（3 字节）                              |
   | **新鲜度值**   | ❌ **不使用**                                   |
   | **防重放攻击** | ❌ 不支持（无新鲜度值）                         |
   | **带宽占用**   | 最低（仅 3 字节 MAC）                          |
   | **适用场景**   | 无同步新鲜度值、仅需来源认证和完整性保护的场景 |

6. **Profile 1 vs Profile 2**

   | 对比项         | Profile 1            | Profile 2          |
   | -------------- | -------------------- | ------------------ |
   | MAC 截断长度   | 24 bits              | 24 bits            |
   | 新鲜度值       | ✅ 8 bits（LSB）      | ❌ 无               |
   | 认证信息总长度 | 4 字节               | 3 字节             |
   | 防重放攻击     | ✅ 支持（基于新鲜度） | ❌ 不支持           |
   | 适用场景       | 需要防重放保护       | 无同步新鲜度值可用 |

7. **相关规范**

   - NIST SP 800-38B：CMAC 算法规范
   - SWS_SecOC_00193：Profile 2 配置定义

## SecOC Profile 3（JASPAR）

> SecOC Profile 3 描述了基于 **JasPar 计数器新鲜度值**与**主从同步方法**的配置和使用方式。它使用基于 AES-128 的 CMAC 算法（依据 NIST SP 800-38B）计算 MAC，取新鲜度值的**最低 4 位**作为截断新鲜度值，取 MAC 的**最高 28 位**作为截断 MAC。此配置文件适用于 **CAN** 总线。

1. **算法配置参数** [SWS_SecOC_00194]

   | 参数                       | 配置值                   | 说明              |
   | -------------------------- | ------------------------ | ----------------- |
   | `algorithmFamily`          | `CRYPTO_ALGOFAM_AES`     | 使用 AES 算法系列 |
   | `algorithmMode`            | `CRYPTO_ALGOMODE_CMAC`   | 使用 CMAC 模式    |
   | `algorithmSecondaryFamily` | `CRYPTO_ALGOFAM_NOT_SET` | 本配置文件未使用  |

2. **长度配置参数**

   | 参数                             | 配置值    | 说明                                     |
   | -------------------------------- | --------- | ---------------------------------------- |
   | `SecOCFreshnessValueLength`      | `64 bits` | 新鲜度值完整长度：**64 位**              |
   | `SecOCFreshnessValueTruncLength` | `4 bits`  | 截断新鲜度值长度：**4 位**（最低有效位） |
   | `SecOCAuthInfoTruncLength`       | `28 bits` | 截断 MAC 长度：**28 位**（最高有效位）   |

3. **Profile 3 数据布局**

   ```mermaid
   flowchart LR
       subgraph SecuredPDU[Secured I-PDU 结构]
           AuthPDU[Authentic I-PDU] --> FV[截断新鲜度值<br/>4 bits]
           FV --> MAC[截断 MAC<br/>28 bits]
       end
   ```

4. **新鲜度值说明**

   - 新鲜度值由 **JasPar 计数器基础 FV** 提供
   - 采用**主从同步方法**
   - 完整长度：64 bits
   - 截断长度：4 bits（最低有效位）
   - 新鲜度值构造方式详见 `[UC_SecOC_00202]`

5. **Profile 3 特点**

   | 特点               | 说明                              |
   | ------------------ | --------------------------------- |
   | **算法**           | AES-128 CMAC（NIST SP 800-38B）   |
   | **MAC 长度**       | 28 bits（3.5 字节）               |
   | **新鲜度值长度**   | 64 bits 完整 / 4 bits 截断        |
   | **认证信息总长度** | 4 字节（4 bits FV + 28 bits MAC） |
   | **新鲜度同步**     | 主从同步方法（JasPar 计数器）     |
   | **适用总线**       | **CAN**                           |
   | **防重放攻击**     | ✅ 支持                            |

6. **三个 Profile 对比**

   | 对比项           | Profile 1 | Profile 2 | Profile 3          |
   | ---------------- | --------- | --------- | ------------------ |
   | MAC 截断长度     | 24 bits   | 24 bits   | 28 bits            |
   | 新鲜度值完整长度 | 未指定    | 0         | 64 bits            |
   | 新鲜度值截断长度 | 8 bits    | 0         | 4 bits             |
   | 认证信息总长度   | 4 字节    | 3 字节    | 4 字节             |
   | 新鲜度同步方式   | 未指定    | 无        | 主从同步（JasPar） |
   | 适用总线         | 无限制    | 无限制    | CAN                |
   | 防重放攻击       | ✅         | ❌         | ✅                  |

7. **相关规范**

   - NIST SP 800-38B：CMAC 算法规范
   - JASPAR：日本汽车软件平台与架构标准
   - `UC_SecOC_00202`：JasPar 新鲜度值构造方式
   - SWS_SecOC_00194：Profile 3 配置定义