---
title: Davinci Configurator - Security

categories: 
  - 软件及工具
---

# FVM

```txt
FvM
├── FvMFreshnessValueRxProcessings
│   ├── FreshnessValueProcessing实例
│   │   └── FvMFreshnessValueUseCase
│   │    	└── FvMJasparAttributes
│	├── FreshnessValueProcessing实例
│   │   └── FvMFreshnessValueUseCase
│   │    	└── FvMSyncMessage
│	└── FreshnessValueProcessing实例
│       └── FvMFreshnessValueUseCase
│       	└── FvMJasparWithoutResetCounterAttributes
├── FvMFreshnessValueTxProcessings
│   └── FreshnessValueProcessing实例
│       └── FvMFreshnessValueUseCase
│       	└── FvMJasparAttributes
├── FvMGeneral
├── FvMGeneration
└── FvMJasparGeneral
```

| 子容器                             | 中文直译 / 惯称        | 核心功能职责                                                 | 关键配置内容举例                                             |
| :--------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **FvMFreshnessValueRxProcessings** | 接收方向新鲜值处理配置 | 配置 **接收方向** 的新鲜值处理策略，用于验证接收到的安全 PDUs 的新鲜度，防止重放攻击。 | 每个 `FreshnessValueProcessing` 实例对应一个安全 PDU 的接收新鲜值验证配置，包含 `FvMFreshnessValueUseCase`（用例配置）和 `FvMJasparAttributes`（Jaspar 属性）等子容器。 |
| **FvMFreshnessValueTxProcessings** | 发送方向新鲜值处理配置 | 配置 **发送方向** 的新鲜值处理策略，用于为待发送的安全 PDUs 生成新鲜值，实现防重放保护。 | 每个 `FreshnessValueProcessing` 实例对应一个安全 PDU 的发送新鲜值生成配置。 |
| **FvMGeneral**                     | 通用配置               | 配置 FvM 模块的**全局行为参数**，如模块开关、错误检测、主函数周期等。 | 包含模块的全局运行参数，如开发错误检测开关、主函数周期等。   |
| **FvMGeneration**                  | 代码生成配置           | 配置 FvM 模块的**代码生成选项**，控制生成代码的优化策略和数据结构。 | 控制生成代码的数据类型、内存优化策略等。                     |
| **FvMJasparGeneral**               | Jaspar 通用配置        | 配置与 **Jaspar 安全机制** 相关的通用参数。Jaspar 是 AUTOSAR 中用于安全通信的算法集合。 | 定义 Jaspar 算法的全局参数，如算法版本、密钥管理策略等。     |

> [!note]
>
> 1. **FvM 模块在 AUTOSAR 安全架构中的位置**：FvM（Freshness Value Manager，新鲜值管理器）是 AUTOSAR **安全通信（SecOC）** 架构中的核心模块，负责管理新鲜值（Freshness Value）的生成和验证。新鲜值是一种随时间变化的计数器或时间戳，用于防止重放攻击（Replay Attack）。
>
> 2. **新鲜值的两种处理方向**：
>    - **Rx Processing（接收处理）**：验证接收到的 PDU 的新鲜值是否有效（在有效窗口内、未被重复使用等）。
>    - **Tx Processing（发送处理）**：为待发送的 PDU 生成新鲜值，确保每条安全报文具有唯一的新鲜值。
>
> 3. **SecOC 通信流程中的 FvM**：
>    - 发送方：FvM 生成新鲜值 → 安全模块（Crypto）计算 MAC → 发送安全 PDU。
>    - 接收方：FvM 验证新鲜值 → 安全模块验证 MAC → 验证通过后处理数据。

## FvMFreshnessValueRxProcessing

### FreshnessValueProcessing 实例（Rx）

`FvMFreshnessValueRxProcessings` 下的每个实例用于配置 **接收方向** 的新鲜值处理参数，定义 FvM 如何验证接收到的安全 PDU 的新鲜值。

| 参数名称           | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**     | 短名称          | 该新鲜值处理配置实例的唯一标识名。                           | 用于在工具中识别该配置实例，通常包含对应的安全 PDU 名称和方向信息（`_Rx` 表示接收方向）。 |
| **Processing Ref** | 处理引用        | **关键引用**。指向 **SecOC 模块** 中定义的**安全 PDU 处理配置实例**，将该新鲜值处理配置与具体的安全 PDU 关联起来。FvM 通过此引用识别该配置属于哪个安全 PDU，并使用对应的新鲜值验证参数。 | **必须正确引用**，否则 FvM 无法确定该配置对应的安全 PDU。该引用指向 SecOC 模块中的 `SecOcSecuredPdu` 配置。 |

> [!note]
>
> 1. **FvM 与 SecOC 的关系**：FvM 与 SecOC（Secure On-Board Communication，安全车载通信）模块紧密协作。SecOC 定义安全 PDU 的安全属性（如加密算法、认证方式），FvM 负责管理新鲜值的生成和验证。
>
> 2. **接收方向新鲜值验证的流程**：
>    - SecOC 接收到安全 PDU 后，提取其中的新鲜值。
>    - SecOC 调用 FvM 接口，请求验证该新鲜值是否有效。
>    - FvM 根据对应的 `FreshnessValueProcessing` 配置检查新鲜值是否在有效窗口内、是否已使用等。
>    - 验证通过后，SecOC 继续处理 PDU 数据。
>
> 3. **Processing Ref 的典型指向**：该引用通常指向 `/ActiveEcuC/SecOC/...` 路径下的安全 PDU 配置实例，该实例已在 SecOC 模块中定义了完整的安全通信参数（如新鲜值长度、同步计数器、MAC 计算方式等）。

### FvMJasparAttributes 

`FvMJasparAttributes` 用于配置 **Jaspar 机制中的新鲜值属性参数**，定义新鲜值中各字段的位宽，包括消息计数器、重置标志和行程标志。

| 参数名称                     | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称          | 该 Jaspar 属性配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **Message Counter Bit Size** | 消息计数器位宽  | 指定新鲜值中**消息计数器（Message Counter）** 字段的位宽，以比特为单位。消息计数器用于标识消息的序列号，防止重放攻击。 | 根据项目安全策略配置，需要在安全性和新鲜值长度之间权衡。位宽越大，防止重放攻击的能力越强，但新鲜值长度也越大。 |
| **Reset Flag Bit Size**      | 重置标志位宽    | 指定新鲜值中**重置标志（Reset Flag）** 字段的位宽，以比特为单位。重置标志用于标识 ECU 复位后新鲜值是否已重置。 | 通常为 1-2 位，用于区分不同的复位状态。                      |
| **Trip Flag Bit Size**       | 行程标志位宽    | 指定新鲜值中**行程标志（Trip Flag）** 字段的位宽，以比特为单位。行程标志用于标识新的驾驶循环，通常与车辆的点火循环相关。 | 通常为 1-2 位，用于区分不同的行程状态。                      |

> [!note]
>
> 1. **Jaspar 机制简介**：Jaspar（Java-based Secure Parameter Manager）是 AUTOSAR 中用于管理安全通信参数（尤其是新鲜值）的机制。它定义了新鲜值中各字段的结构和位宽，确保发送方和接收方对新鲜值的解析一致。
>
> 2. **新鲜值的典型结构**：
>
>    ```text
>    | Reset Flag | Trip Flag | Message Counter |
>    | (1-2 bits) | (1-2 bits) | (N bits)        |
>    ```
>
>    各字段的位宽由 `FvMJasparAttributes` 统一配置，确保所有安全 PDU 使用一致的新鲜值格式。
>
> 3. **各字段的作用**：
>    - **Message Counter**：单调递增的计数器，每条安全 PDU 拥有唯一的计数值。接收方维护一个预期值窗口，只有落在窗口内的计数值才被认为是有效的。
>    - **Reset Flag**：标识 ECU 复位后的状态。复位后计数器重置，接收方需要据此调整其预期值窗口。
>    - **Trip Flag**：标识新的驾驶循环（如点火开关从 OFF 到 ON）。用于区分不同驾驶循环的计数值，防止跨循环的重放攻击。
>
> 4. **位宽配置的权衡**：
>    - **更大的位宽**：提供更好的防重放保护，但增加新鲜值的长度，降低通信效率。
>    - **更小的位宽**：提高通信效率，但计数器可能更快溢出，需要更频繁地重置。
>    - 项目需要根据通信频率、安全等级和带宽限制综合权衡。

### FvMSyncMessage 

`FvMSyncMessage` 用于配置 **新鲜值同步消息（Sync Message）** 的类型，定义 FvM 在新鲜值同步过程中使用的消息类型。

| 参数名称              | 中文直译 / 作用 | 详细解释                                   | 配置要点 / 注意事项                                          |
| :-------------------- | :-------------- | :----------------------------------------- | :----------------------------------------------------------- |
| **Short Name**        | 短名称          | 该同步消息配置实例的唯一标识名。           | 用于在工具中识别该配置实例。                                 |
| **Sync Message Type** | 同步消息类型    | 指定该同步消息的类型，用于新鲜值同步机制。 | - `TRIP_RESET_SYNC_MSG`：行程/重置同步消息，用于同步行程标志或重置标志变化时的新鲜值状态。<br>- 其他类型根据项目具体的安全通信规范定义。 |

> [!note]
>
> 1. **新鲜值同步机制**：在多节点安全通信中，发送方和接收方需要保持新鲜值状态的一致性。当 ECU 复位或新的驾驶循环开始时，需要通过**同步消息**将发送方的当前新鲜值状态通知给接收方，使接收方能够调整其预期值窗口。
>
> 2. **TRIP_RESET_SYNC_MSG 的典型用途**：
>    - 当 ECU 复位后，发送方通过此消息告知接收方计数器已重置。
>    - 当新驾驶循环开始时，发送方通过此消息告知接收方行程标志已更新。
>    - 接收方收到同步消息后，调整其新鲜值验证的预期窗口，确保后续安全 PDU 的新鲜值能够被正确验证。

### FvMJasparWithoutResetCounterAttributes

`FvMJasparWithoutResetCounterAttributes` 用于配置 **Jaspar 机制中无重置计数器的属性参数**，定义新鲜值中消息计数器的位宽。

| 参数名称                     | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称          | 该 Jaspar 无重置计数器属性配置实例的唯一标识名。             | 用于在工具中识别该配置实例。                                 |
| **Message Counter Bit Size** | 消息计数器位宽  | 指定新鲜值中**消息计数器（Message Counter）** 字段的位宽，以比特为单位。 | 根据项目安全策略配置。位宽越大，防止重放攻击的能力越强，但新鲜值长度也越大。 |

> [!note]
>
> 1. **与 FvMJasparAttributes 的区别**：
>
>    | 配置类型                                 | 包含字段                                 | 适用场景                    |
>    | :--------------------------------------- | :--------------------------------------- | :-------------------------- |
>    | `FvMJasparAttributes`                    | Reset Flag + Trip Flag + Message Counter | 完整的新鲜值结构            |
>    | `FvMJasparWithoutResetCounterAttributes` | 仅 Message Counter                       | 不使用复位/行程计数器的场景 |
>
> 2. **无复位计数器的使用场景**：某些 ECU 可能不需要区分复位状态或行程状态，新鲜值中仅包含消息计数器。此时使用 `FvMJasparWithoutResetCounterAttributes` 简化新鲜值结构，减少通信开销。
>
> 3. **安全考虑**：虽然省去了 Reset Flag 和 Trip Flag，但仅靠 Message Counter 仍然可以防止重放攻击。然而，ECU 复位后计数器从零开始，接收方需要能够正确处理计数器重置的情况（通常通过其他机制，如同步消息或初始握手机制）。

## FreshnessValueProcessing 

### FreshnessValueProcessing 实例（Tx）

`FvMFreshnessValueTxProcessings` 下的每个实例用于配置 **发送方向** 的新鲜值处理参数，定义 FvM 如何为待发送的安全 PDU 生成新鲜值。

| 参数名称           | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**     | 短名称          | 该新鲜值处理配置实例的唯一标识名。                           | 用于在工具中识别该配置实例，通常包含对应的安全 PDU 名称和方向信息（`_Tx` 表示发送方向）。 |
| **Processing Ref** | 处理引用        | **关键引用**。指向 **SecOC 模块** 中定义的**安全 PDU 处理配置实例**，将该新鲜值处理配置与具体的安全 PDU 关联起来。FvM 通过此引用识别该配置属于哪个安全 PDU，并使用对应的新鲜值生成参数。 | **必须正确引用**，否则 FvM 无法确定该配置对应的安全 PDU。该引用指向 SecOC 模块中的 `SecOcSecuredPdu` 配置。 |

> [!note]
>
> 1. **发送方向新鲜值生成的流程**：
>    - SecOC 准备发送安全 PDU 时，调用 FvM 接口请求生成新鲜值。
>    - FvM 根据对应的 `FreshnessValueProcessing` 配置，使用消息计数器等参数生成当前新鲜值。
>    - 新鲜值被传递给 SecOC，嵌入到安全 PDU 中一并发送。
>    - 发送完成后，FvM 更新内部状态（如递增消息计数器）。
>
> 2. **Rx 与 Tx 配置的对称性**：
>
>    | 方向       | 容器                             | 职责                          |
>    | :--------- | :------------------------------- | :---------------------------- |
>    | 接收（Rx） | `FvMFreshnessValueRxProcessings` | 验证接收到的安全 PDU 的新鲜值 |
>    | 发送（Tx） | `FvMFreshnessValueTxProcessings` | 为待发送的安全 PDU 生成新鲜值 |
>
>    两者通过 `Processing Ref` 关联到 SecOC 中同一个安全 PDU 配置实例，确保发送方和接收方使用一致的新鲜值参数（如计数器位宽、同步策略等）。

## FvMGeneral

`FvMGeneral` 是 FvM 模块的**顶层通用配置容器**，用于配置 FvM 的全局行为参数，包括错误检测、任务周期、启动接受时间等功能开关。

| 参数名称                          | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                    | 短名称          | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Dev Error Detect**              | 开发错误检测    | 勾选后，启用 FvM 内部的**开发错误检测**，当检测到参数错误、状态错误时，调用 `Det_ReportError` 报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Main Function Period [ms]**     | 主函数周期      | 指定 FvM **主函数（FvM_MainFunction）** 的执行周期，以毫秒为单位。该主函数用于处理新鲜值的周期性更新和超时管理。 | 根据项目调度周期配置，通常与 SecOC 的周期保持一致，典型值为 5-20ms。 |
| **Safe Bsw Checks**               | 安全 BSW 检查   | 勾选后，启用**安全 BSW 检查**，对关键参数进行合法性检查，用于功能安全场景。 | 在 **ASIL/功能安全** 项目中建议勾选，QM 项目保持关闭。       |
| **Start Up Acceptance Time [ms]** | 启动接受时间    | 指定 ECU 启动后，FvM 允许接收安全 PDU 的**初始时间窗口**，以毫秒为单位。在此时间内，接收方对新接收的安全 PDU 新鲜值验证采取更宽松的策略，以应对启动阶段计数器未同步的情况。 | 根据项目安全策略配置。启动接受时间过短可能导致启动阶段的安全 PDU 被丢弃；过长则可能降低安全性。 |
| **Version Info Api**              | 版本信息 API    | 勾选后，生成 **`FvM_GetVersionInfo`** API，用于获取 FvM 模块的版本信息。 | 建议勾选，便于版本管理和调试。                               |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数               | 开发阶段 | 量产阶段      |
>    | :----------------- | :------- | :------------ |
>    | `Dev Error Detect` | ✅ 勾选   | ❌ 关闭        |
>    | `Safe Bsw Checks`  | ✅ 勾选   | ASIL 项目勾选 |
>    | `Version Info Api` | ✅ 勾选   | ✅ 勾选        |
>
> 2. **主函数周期的影响**：
>    - `Main Function Period` 决定了 FvM 更新新鲜值和检查超时的频率。
>    - 如果周期过长，新鲜值更新延迟可能导致安全 PDU 被拒收。
>    - 如果周期过短，增加 CPU 负载，影响系统性能。
>
> 3. **启动接受时间的必要性**：在 ECU 启动阶段，发送方和接收方的新鲜值计数器可能尚未同步。`Start Up Acceptance Time` 提供了一个缓冲窗口，允许接收方在此期间接收安全 PDU 而不会因新鲜值验证失败而丢弃报文，确保启动阶段的通信正常建立。

### FvMGeneration 实例

`FvMGeneration` 用于配置 **FvM 模块代码生成** 时的优化策略，控制生成代码的数据结构、内存占用和调试支持。

| 参数名称                                    | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------ | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                              | 短名称             | 该代码生成配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Interfaces For Deactivated Data**         | 为停用数据生成接口 | 勾选后，为**已停用的数据**也生成 RTE 接口（即使数据未启用）。 | 仅在调试或特殊开发场景中勾选，量产版本保持关闭。             |
| **Out Of Bounds Read Sanitizer**            | 越界读取清理器     | 勾选后，生成**越界读取检查**代码，在读取数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Out Of Bounds Write Protection Strategy** | 越界写入保护策略   | 指定**越界写入保护**的策略，防止写入操作超出数组或缓冲区的边界。 | - `NONE`：不进行保护。<br>- `GUARD`：添加保护字节。<br>- `CHECK`：运行时检查。<br>ASIL 项目中建议配置，QM 项目通常选择 `NONE`。 |
| **Out Of Bounds Write Sanitizer**           | 越界写入清理器     | 勾选后，生成**越界写入检查**代码，在写入数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Referring Keys In Comments**              | 在注释中包含引用键 | 勾选后，在生成的代码注释中包含**引用键（Referring Keys）**，便于追溯配置来源。 | 建议勾选，便于代码与配置的追溯。                             |
| **Short Symbols**                           | 短符号             | 勾选后，生成**短符号名**，减少生成代码中符号的长度以节省内存。 | 仅在内存极度受限的场景中启用，一般保持默认（不勾选）。       |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                              | 开发阶段 | 量产阶段 |
>    | :-------------------------------- | :------- | :------- |
>    | `Out Of Bounds Read Sanitizer`    | ✅ 勾选   | ❌ 关闭   |
>    | `Out Of Bounds Write Sanitizer`   | ✅ 勾选   | ❌ 关闭   |
>    | `Interfaces For Deactivated Data` | ❌ 关闭   | ❌ 关闭   |
>    | `Referring Keys In Comments`      | ✅ 勾选   | ✅ 勾选   |
>    | `Short Symbols`                   | ❌ 关闭   | 按需     |
>
> 2. **与 PduRGeneration 的相似性**：`FvMGeneration` 中的参数与 `PduRGeneration` 中的同名参数功能一致，都是 Vector 工具链中用于控制代码生成的通用选项。

## FvMJasparGeneral

`FvMJasparGeneral` 用于配置 **Jaspar 安全机制的全局参数**，定义新鲜值管理中与计数器、同步消息、超时处理等相关的核心行为。

| 参数名称                                                  | 中文直译 / 作用                  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------------------------------- | :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Clear Acceptance Window**                               | 清除接受窗口                     | 指定在接收到同步消息后，**清除接受窗口（Acceptance Window）** 的值，用于重置接收方的新鲜值验证窗口。 | 根据项目安全策略配置，典型值为 3-5。                         |
| **E SYNC MSG TOUT**                                       | 同步消息超时错误码               | 指定当同步消息**超时**时返回的错误码（Error Code）。         | 通常由工具或项目预设，一般不需要手动修改。                   |
| **Enable Development Mode**                               | 启用开发模式                     | 勾选后，启用 **Jaspar 开发模式**，在开发阶段提供更多的调试信息和宽松的检查。 | 仅在开发调试阶段勾选，量产版本**必须关闭**。                 |
| **Master Reset Counter Cycle Time [ms]**                  | 主复位计数器周期时间             | 指定**主复位计数器（Master Reset Counter）** 的**周期时间**，以毫秒为单位。用于周期性复位计数器。 | 仅在需要周期性复位计数器的场景中配置，通常保持默认或留空。   |
| **Reception Timeout For Transmission [ms]**               | 发送接收超时                     | 指定**发送方向上接收响应**的超时时间，以毫秒为单位。         | 根据项目通信延迟要求配置。                                   |
| **Reset Counter Bit Size**                                | 重置计数器位宽                   | 指定**重置计数器（Reset Counter）** 的**位宽**，以比特为单位。重置计数器用于跟踪 ECU 复位的次数。 | 根据项目安全策略配置，通常为 8-16 位。                       |
| **Reset Counter Reach Max Notification**                  | 重置计数器达到最大值通知         | 勾选后，当**重置计数器达到最大值**时，FvM 会触发通知回调，便于上层模块处理。 | 建议勾选，便于监控计数器状态。                               |
| **Return Value For Same Trip Counter Sync Message**       | 相同行程计数器同步消息返回值     | 指定当收到**相同行程计数器的同步消息**时，FvM 返回的值。     | 通常为 `E_OK`（表示正常处理）或 `E_NOT_OK`（表示错误）。     |
| **Return Value For Same Trip Reset Counter Sync Message** | 相同行程重置计数器同步消息返回值 | 指定当收到**相同行程重置计数器的同步消息**时，FvM 返回的值。 | 通常为 `E_OK`（表示正常处理）或 `E_NOT_OK`（表示错误）。     |
| **Rx Message Counter Reach Max Notification**             | 接收消息计数器达到最大值通知     | 勾选后，当**接收方向的消息计数器达到最大值**时，FvM 会触发通知回调。 | 建议勾选，便于监控接收方向的消息计数器状态。                 |
| **Sync Message Reception Timeout [ms]**                   | 同步消息接收超时                 | 指定**同步消息接收的超时时间**，以毫秒为单位。如果在超时时间内未收到预期的同步消息，FvM 将触发超时处理。 | 根据项目通信延迟和安全策略配置，典型值为 10-50ms。           |
| **Trip Counter Bit Size**                                 | 行程计数器位宽                   | 指定**行程计数器（Trip Counter）** 的**位宽**，以比特为单位。行程计数器用于跟踪驾驶循环的次数。 | 根据项目安全策略配置。                                       |
| **Trip Counter Nv MBlock Descriptor**                     | 行程计数器 NvM 块描述符          | 引用 **NvM（非易失性存储器管理器）** 中的**块描述符**，用于持久化存储行程计数器的值。 | **必须正确引用**，确保行程计数器在 ECU 断电后能够持久保存。  |
| **Trip Counter Reach Max Notification**                   | 行程计数器达到最大值通知         | 勾选后，当**行程计数器达到最大值**时，FvM 会触发通知回调。   | 建议勾选，便于监控行程计数器状态。                           |
| **Tx Message Counter Reach Max Notification**             | 发送消息计数器达到最大值通知     | 勾选后，当**发送方向的消息计数器达到最大值**时，FvM 会触发通知回调。 | 建议勾选，便于监控发送方向的消息计数器状态。                 |
| **Tx Use Default Freshness Value During Start Up**        | 启动时发送使用默认新鲜值         | 勾选后，在 ECU **启动阶段**，发送方向使用**默认新鲜值**，而非从 NvM 中恢复的计数器值。 | 仅在启动阶段需要快速发送安全 PDU 且不需要恢复计数器状态时启用。 |
| **Use Default Values If Out Of Sync After Start Up Time** | 启动超时后不同步时使用默认值     | 勾选后，如果在 `Start Up Acceptance Time` 超时后仍然处于**不同步状态**，FvM 将使用**默认值**继续通信。 | 根据项目安全策略配置，在可用性和安全性之间权衡。             |

> [!note]
>
> 1. **计数器类型及其用途**：
>
>    | 计数器类型          | 作用                  | 典型位宽 | 持久化                 |
>    | :------------------ | :-------------------- | :------- | :--------------------- |
>    | **Reset Counter**   | 跟踪 ECU 复位的次数   | 8-16 位  | 通常持久化             |
>    | **Trip Counter**    | 跟踪驾驶循环的次数    | 8-16 位  | 必须持久化（通过 NvM） |
>    | **Message Counter** | 每条安全 PDU 的序列号 | 14-32 位 | 取决于具体安全策略     |
>
> 2. **同步消息超时处理**：`Sync Message Reception Timeout` 定义了接收方等待同步消息的最长时间。如果超时，接收方无法建立与发送方的新鲜值同步，可能导致安全通信中断。合理配置此值对于安全通信的可靠性至关重要。

# SecOc

```txt
SecOC
├── SecOCRxPduProcessings
│   └── SecOCRxSecuredPdu实例
│		├──	SecOCRxAuthenticPduLayer
│		├──	SecOCRxPduSecuredArea
│       └── SecOCRxSecuredPduLayer
├── SecOCTxPduProcessings
│   └── SecOCTxSecuredPdu实例
│       └── SecOCTxSecuredPduLayer
├── SecOCGeneral
└── SecOCGeneration
```

| 子容器                    | 中文直译 / 惯称           | 核心功能职责                                                 | 关键配置内容举例                                             |
| :------------------------ | :------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **SecOCRxPduProcessings** | 接收方向安全 PDU 处理配置 | 配置 **接收方向** 的安全 PDU 处理参数，定义 SecOC 如何对接收到的安全 PDU 进行认证和新鲜值验证。 | 每个 `SecOCRxSecuredPdu` 实例对应一个接收安全 PDU，包含认证算法、密钥引用、新鲜值验证参数等，其下的 `SecOCRxSecuredPduLayer` 包含具体的安全处理层配置。 |
| **SecOCTxPduProcessings** | 发送方向安全 PDU 处理配置 | 配置 **发送方向** 的安全 PDU 处理参数，定义 SecOC 如何为待发送的安全 PDU 生成认证信息（MAC）和新鲜值。 | 每个 `SecOCTxSecuredPdu` 实例对应一个发送安全 PDU，包含认证算法、密钥引用、新鲜值生成参数等，其下的 `SecOCTxSecuredPduLayer` 包含具体的安全处理层配置。 |
| **SecOCGeneral**          | 通用配置                  | 配置 SecOC 模块的**全局行为参数**，如模块开关、错误检测、主函数周期等。 | 包含模块的全局运行参数，如开发错误检测开关、主函数周期、安全 PDU 处理超时等。 |
| **SecOCGeneration**       | 代码生成配置              | 配置 SecOC 模块的**代码生成选项**，控制生成代码的优化策略和数据结构。 | 控制生成代码的数据类型、内存优化策略、调试支持等。           |

> [!note]
>
> 1. **SecOC 模块在 AUTOSAR 安全架构中的位置**：SecOC（Secure On-Board Communication，安全车载通信）是 AUTOSAR 中实现**安全通信**的核心模块。它在 PDU 层面提供**认证（Authentication）** 和**新鲜度（Freshness）** 保护，防止消息被篡改、伪造或重放。SecOC 位于通信栈的中间层，与 PduR、CanIf 和 FvM 等模块紧密协作。
>
> 2. **SecOC 与 FvM 的协作**：
>    - **FvM**：负责新鲜值（Freshness Value）的生成和验证。
>    - **SecOC**：负责安全 PDU 的加密/认证处理（MAC 计算和验证）。
>    - 协作流程：SecOC 调用 FvM 获取新鲜值 → 计算 MAC → 组装安全 PDU（发送方向）；或提取新鲜值 → 调用 FvM 验证 → 验证 MAC（接收方向）。
>
> 3. **安全 PDU 的处理方向**：
>    - **Rx PDU（接收方向）**：从总线上接收安全 PDU → 提取新鲜值并验证 → 验证 MAC → 验证通过后将数据传递给上层。
>    - **Tx PDU（发送方向）**：从上层接收数据 → 生成新鲜值 → 计算 MAC → 组装安全 PDU → 发送到总线上。

## SecOCRxPduProcessings

### SecOCRxSecuredPdu 实例

`SecOCRxPduProcessings` 下的每个实例用于配置 **接收方向的安全 PDU 处理参数**，定义 SecOC 如何对接收到的安全 PDU 进行认证和新鲜值验证。

| 参数名称                                                  | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                            | 短名称                        | 该接收安全 PDU 配置实例的唯一标识名。                        | 用于在工具中识别该配置实例，通常包含对应的安全 PDU 名称和方向信息（`_Rx` 表示接收方向）。 |
| **Async CSM Job Timeout [ms]**                            | 异步 CSM 作业超时             | 指定 **异步 CSM（Crypto Service Manager，加密服务管理器）** 作业的**超时时间**，以毫秒为单位。若加密作业在超时时间内未完成，SecOC 将触发超时处理。 | 根据系统实时性要求和加密运算耗时配置。配置过短可能导致合法报文被丢弃，配置过长可能影响系统响应。 |
| **Auth Data Freshness Len**                               | 认证数据新鲜值长度            | 指定**认证数据中新鲜值字段的长度**，以字节为单位。           | 根据安全 PDU 的帧格式配置，通常与 `Freshness Value Length` 一致。 |
| **Auth Data Freshness Start Position**                    | 认证数据新鲜值起始位置        | 指定新鲜值在**认证数据（Authenticated Data）** 中的**起始字节位置**。 | 根据安全 PDU 的帧格式配置，确保接收方能够正确提取新鲜值。    |
| **Auth Info Tx Length**                                   | 认证信息发送长度              | 指定**认证信息（Auth Info）** 在发送方向中的**长度**，以字节为单位。 | 与 Tx 方向的安全 PDU 配置保持一致。                          |
| **Authentication Build Attempts**                         | 认证构建尝试次数              | 指定**认证构建（Authentication Build）** 的最大尝试次数，即 SecOC 在构建认证数据时的重试次数。 | 通常保持默认值（如 1-3 次）。                                |
| **Authentication Verify Attempts**                        | 认证验证尝试次数              | 指定**认证验证（Authentication Verify）** 的最大尝试次数，即 SecOC 在验证认证数据时的重试次数。 | 通常保持默认值（如 1-3 次）。                                |
| **Client Server Verification Status Propagation Mode**    | 客户端/服务器验证状态传播模式 | 指定**验证状态**在客户端/服务器通信中的传播方式。            | - `NONE`：不传播验证状态。<br>- `BOTH`：双向传播。<br>根据项目安全通信架构配置。 |
| **Data Id**                                               | 数据 ID                       | 该安全 PDU 的**数据标识符（Data ID）**，用于 CSM 作业中标识该数据。 | **必须与 CSM 作业配置中的数据 ID 一致**。                    |
| **Freshness Value Id**                                    | 新鲜值 ID                     | 该安全 PDU 对应的**新鲜值标识符（Freshness Value ID）**，用于 FvM 中索引对应的新鲜值配置。 | **必须正确配置**，确保 SecOC 能够从 FvM 获取正确的新鲜值。   |
| **Freshness Value Length**                                | 新鲜值长度                    | 指定**新鲜值（Freshness Value）** 的**长度**，以字节为单位。 | 根据安全策略配置，通常为 4-8 字节。                          |
| **Freshness Value Tx Length**                             | 新鲜值发送长度                | 指定在发送方向上**新鲜值的长度**，以字节为单位。             | 与 Tx 方向的安全 PDU 配置保持一致，通常与 `Freshness Value Length` 相同。 |
| **Immediate Processing Of Csm Callback**                  | CSM 回调立即处理              | 勾选后，当 CSM 作业完成时，**立即处理**回调函数，而不将其放入延迟队列。 | 在实时性要求高的场景中勾选，但会增加中断上下文的处理负载。   |
| **Pdu Processing**                                        | PDU 处理模式                  | 指定该安全 PDU 的**处理模式**。                              | - `IMMEDIATE`：立即处理。<br>- `DEFERRED`：延迟处理（在主函数中处理）。<br>根据系统实时性要求选择，通常使用 `DEFERRED` 以减少中断负载。 |
| **Reception Overflow Strategy**                           | 接收溢出策略                  | 指定当接收队列**溢出**时的处理策略。                         | - `REJECT`：拒绝新报文。<br>- `OVERWRITE`：覆盖旧报文。<br>根据项目需求配置。 |
| **Reception Queue Size**                                  | 接收队列大小                  | 指定该安全 PDU 的**接收队列大小**，即最多可缓存的安全 PDU 数量。 | 根据总线负载和系统处理能力配置，典型值为 5-20。配置过小可能导致丢帧，配置过大浪费内存。 |
| **Rx Auth Service Config Ref**                            | 接收认证服务配置引用          | **关键引用**。指向 **CSM（Crypto Service Manager，加密服务管理器）** 中定义的**认证作业配置**，用于验证接收到的安全 PDU 的 MAC（消息认证码）。 | **必须正确引用**，否则 SecOC 无法对接收到的安全 PDU 进行认证验证。 |
| **Same Buffer Pdu Ref**                                   | 相同缓冲区 PDU 引用           | 指定与该安全 PDU **共享同一缓冲区** 的 PDU 配置引用，用于内存优化。 | 通常保持为空，仅在需要内存共享优化时配置。                   |
| **Use Auth Data Freshness**                               | 使用认证数据新鲜值            | 勾选后，**新鲜值**作为**认证数据（Authenticated Data）** 的一部分参与认证计算（即 MAC 计算包含新鲜值字段）。 | 根据安全策略配置。勾选后，新鲜值被纳入认证范围，防止新鲜值被篡改。 |
| **Verification Status Propagation Mode**                  | 验证状态传播模式              | 指定**验证状态**的传播方式。                                 | - `NONE`：不传播。<br>- `BOTH`：双向传播。<br>根据项目安全通信架构配置。 |
| **Verification Status With Secured Pdu Propagation Mode** | 带安全 PDU 的验证状态传播模式 | 指定当验证状态与安全 PDU 一起传播时的模式。                  | 与 `Verification Status Propagation Mode` 配合使用，通常保持相同配置。和`Verification Status Propagation Mode` 的区别就是在传播的时候会带有数据 |

> [!note]
>
> 1. **接收安全 PDU 的处理流程**：
>    - 从总线上接收安全 PDU。
>    - 提取新鲜值，调用 FvM 验证新鲜值是否有效。
>    - 调用 CSM 作业验证 MAC（消息认证码）。
>    - 如果新鲜值和 MAC 均验证通过，将数据传递给上层（PduR）。
>    - 如果验证失败，丢弃报文并触发相应的错误处理。
>
> 2. **CSM 作业配置**：`Rx Auth Service Config Ref` 指向的 CSM 作业配置中，通常包含以下关键参数：
>    - **加密算法**：如 AES-GCM、CMAC 等。
>    - **密钥引用**：指向密钥存储位置的引用。
>    - **数据 ID**：与 `Data Id` 参数一致，用于标识该作业处理的数据。
>    - **作业模式**：同步或异步执行模式。



### SecOCRxAuthenticPduLayer 实例

`SecOCRxAuthenticPduLayer` 是 `SecOCRxSecuredPdu` 的子容器，用于配置 **接收方向安全 PDU 的底层通信参数**，定义该安全 PDU 在 PduR 层面的 PDU 类型和关联的底层 PDU 引用。

| 参数名称                       | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                 | 短名称              | 该安全 PDU 层配置实例的唯一标识名。                          | 用于在工具中识别该配置实例。                                 |
| **Pdu Type**                   | PDU 类型            | 指定该安全 PDU 的 **PDU 类型**，用于标识其在 PduR 路由中的类型。 | - `SECOC_IFPDU`：SecOC 接口 PDU，表示该 PDU 由 SecOC 模块处理。<br>- 其他类型根据项目通信架构定义。 |
| **Rx Authentic Layer Pdu Ref** | 接收认证层 PDU 引用 | **关键引用**。指向 **EcuC（ECU 配置）** 中定义的 **PDU 配置实例**，将该安全 PDU 与底层通信 PDU 关联起来。SecOC 通过此引用从底层接收安全 PDU 数据。 | **必须正确引用**，否则 SecOC 无法从底层接收该安全 PDU 的数据。该引用指向 `EcuC/EcuPduCollection` 中定义的具体 PDU 实例。 |

> [!note]
>
> 1. **SecOC 与 PduR 的协作**：SecOC 模块在通信栈中位于 PduR 之上，安全 PDU 的接收和发送通过 PduR 与底层通信接口（如 CanIf）进行交互。`Rx Authentic Layer Pdu Ref` 建立了 SecOC 与 PduR 之间的 PDU 关联，确保安全 PDU 能够正确路由到 SecOC 模块进行处理。
>
> 2. **Pdu Type 的作用**：`SECOC_IFPDU` 标识该 PDU 是 SecOC 接口类型的 PDU，PduR 在路由时会根据此类型将该 PDU 转发给 SecOC 模块，而非直接传递给 Com 或 Dcm 等其他上层模块。
>
> 3. **典型配置链路**：
>
>    ```txt
>    SecOCRxAuthenticPduLayer.Rx Authentic Layer Pdu Ref
>                    ↓
>    EcuPduCollection/.../xxx_Rx（PDU 实例）
>                    ↓
>    CanIfRxPduCfg（CanIf 接收 PDU 配置）
>    ```
>
>    安全 PDU 的完整接收链路为：Can 总线 → CanIf → PduR → SecOC → 上层模块（Com/Dcm）。

### SecOCRxPduSecuredArea 实例

`SecOCRxPduSecuredArea` 用于配置 **接收方向安全 PDU 的安全区域（Secured Area）** 属性，定义安全 PDU 中受保护数据的长度和起始偏移位置。

| 参数名称                  | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------ | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**            | 短名称            | 该安全区域配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Secured Rx Pdu Length** | 安全接收 PDU 长度 | 指定安全 PDU 中**受安全保护的数据长度**，以字节为单位。该部分数据参与认证（MAC）计算和新鲜值验证。 | 根据安全 PDU 的帧格式配置。该长度不应超过 PDU 的总长度，需确保认证数据（Authenticated Data）的完整性。 |
| **Secured Rx Pdu Offset** | 安全接收 PDU 偏移 | 指定安全 PDU 中**受安全保护数据的起始偏移位置**，以字节为单位，从 PDU 数据的开头计算。 | 根据安全 PDU 的帧格式配置，确保受保护数据的起始位置正确。偏移量之前的字段（如 PDU 头）通常不参与安全保护。 |

> [!note]
>
> 1. **安全区域的作用**：在 SecOC 安全通信中，并非 PDU 的所有字段都需要参与安全保护（如某些 PDU 头部字段可能不参与 MAC 计算）。`SecOCRxPduSecuredArea` 通过 `Offset` 和 `Length` 精确定义了 PDU 中**受安全保护的数据区域**，确保 MAC 计算和新鲜值验证的准确性。
>
> 2. **安全区域的典型示例**：
>
>    ```text
>    PDU 数据布局（假设总长度为 20 字节）：
>    | 头部 (4 字节) | 安全区域 (16 字节) |
>    ↑               ↑
>    Offset = 0      Offset = 4, Length = 16
>    ```
>
>    在该示例中：
>    - `Secured Rx Pdu Offset = 4`：从第 4 字节开始受保护。
>    - `Secured Rx Pdu Length = 16`：受保护区域长度为 16 字节。
>    - 头部 4 字节不参与安全保护（可能包含 PDU ID 或控制信息）。
>
> 3. **发送与接收的一致性**：`SecOCRxPduSecuredArea` 的配置必须与发送方向的 `SecOCTxPduSecuredArea`（如果有）保持一致，确保发送方和接收方对安全区域的界定相同，否则 MAC 验证将失败。

### SecOCRxSecuredPduLayer 实例

`SecOCRxSecuredPduLayer` 是 `SecOCRxSecuredPdu` 的子容器（与 `SecOCRxAuthenticPduLayer` 平级），用于配置 **接收方向安全 PDU 的认证层参数**，定义安全 PDU 的认证头长度、关联的底层 PDU 引用以及验证开关。

| 参数名称                        | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------ | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                  | 短名称              | 该认证层配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Auth Pdu Header Length**      | 认证 PDU 头长度     | 指定安全 PDU 中**认证头（Authentication Header）** 的长度，以字节为单位。认证头通常包含新鲜值、计数器等安全相关信息。 | 根据安全 PDU 的帧格式配置。该长度用于 SecOC 在解析 PDU 时跳过认证头，定位到实际数据部分。 |
| **Rx Secured Layer Pdu Id**     | 接收安全层 PDU ID   | 该安全 PDU 在 SecOC 模块内部的**数字标识符**，用于索引和识别不同的安全 PDU。 | 通常由工具自动生成，无需手动修改。                           |
| **Rx Secured Layer Pdu Ref**    | 接收安全层 PDU 引用 | **关键引用**。指向 **EcuC（ECU 配置）** 中定义的 **PDU 配置实例**，将该安全 PDU 与底层通信 PDU 关联起来。SecOC 通过此引用从底层接收安全 PDU 数据。 | **必须正确引用**，否则 SecOC 无法从底层接收该安全 PDU 的数据。该引用指向 `EcuC/EcuPduCollection` 中定义的具体 PDU 实例。 |
| **Secured Rx Pdu Verification** | 安全接收 PDU 验证   | 勾选后，SecOC 对该安全 PDU 执行**完整的安全验证**，包括新鲜值验证和 MAC 认证。 | **必须勾选**，否则安全 PDU 不会经过任何安全验证，安全通信机制将失效。仅在调试或特殊场景中可暂时关闭。 |

> [!note]
>
> 1. **认证头的作用**：认证头（Authentication Header）是安全 PDU 中用于携带安全相关信息的字段，通常包含：
>    - **新鲜值**：用于防止重放攻击的计数器或时间戳。
>    - **MAC（消息认证码）**：用于验证 PDU 的完整性和真实性。
>    - **安全状态信息**：如安全等级、算法标识等。
>
>    `Auth Pdu Header Length` 定义了这些安全相关字段的总长度。
>
> 2. **安全 PDU 的典型结构**：
>
>    ```text
>    | 认证头 (Auth Header) | 数据 (Data) | MAC (消息认证码) |
>    | <Auth Pdu Header Length> | <实际数据> | <MAC 长度> |
>    ```
>
>    - SecOC 根据 `Auth Pdu Header Length` 解析认证头。
>    - 提取新鲜值后调用 FvM 进行验证。
>    - 提取 MAC 后调用 CSM 进行认证验证。
>    - 验证通过后，将数据部分传递给上层模块。
>
> 3. **RxSecuredLayerPdu 与 RxAuthenticLayerPdu 的区别**：
>
>    | 容器                       | 职责                                    | 引用指向                                             |
>    | :------------------------- | :-------------------------------------- | :--------------------------------------------------- |
>    | `SecOCRxSecuredPduLayer`   | 安全层配置，定义认证头和验证开关        | `Rx Secured Layer Pdu Ref` → 底层安全 PDU 实例       |
>    | `SecOCRxAuthenticPduLayer` | 认证层配置，定义 PDU 类型和底层数据引用 | `Rx Authentic Layer Pdu Ref` → 底层认证数据 PDU 实例 |
>
>    两者通常指向相同的底层 PDU 实例，但在配置逻辑上分别定义了安全层的属性和认证层的属性。

## SecOCTxPduProcessings

### SecOCTxSecuredPdu 实例

`SecOCTxPduProcessings` 下的每个实例用于配置 **发送方向的安全 PDU 处理参数**，定义 SecOC 如何为待发送的 PDU 生成新鲜值和 MAC（消息认证码）。

| 参数名称                                 | 中文直译 / 作用          | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称                   | 该发送安全 PDU 配置实例的唯一标识名。                        | 用于在工具中识别该配置实例，通常包含对应的安全 PDU 名称和方向信息（`_Tx` 表示发送方向）。 |
| **Add CANFD Container Pdu Padding**      | 添加 CANFD 容器 PDU 填充 | 勾选后，SecOC 在构建 CANFD 安全 PDU 时会自动添加填充字节以满足容器长度要求。 | 仅在使用 **CANFD 容器 PDU** 时启用，一般项目保持关闭。       |
| **Async CSM Job Timeout [ms]**           | 异步 CSM 作业超时        | 指定 **异步 CSM（加密服务管理器）作业** 的超时时间，以毫秒为单位。若加密作业在超时时间内未完成，SecOC 将触发超时处理。 | 根据加密运算耗时和系统实时性要求配置。                       |
| **Auth Info Tx Length**                  | 认证信息发送长度         | 指定 **认证信息（Auth Info）** 在发送方向中的长度，以字节为单位。 | 根据安全策略配置，通常与 MAC 长度或新鲜值长度相关。          |
| **Authentication Build Attempts**        | 认证构建尝试次数         | 指定 **认证构建** 的最大尝试次数，即 SecOC 在构建认证数据时的重试次数。 | 通常保持默认值（如 3 次）。                                  |
| **Data Id**                              | 数据 ID                  | 该安全 PDU 的 **数据标识符（Data ID）**，用于 CSM 作业中标识该数据。 | **必须与 CSM 作业配置中的数据 ID 一致**。                    |
| **Freshness Value Id**                   | 新鲜值 ID                | 该安全 PDU 对应的 **新鲜值标识符**，用于 FvM 中索引对应的新鲜值配置。 | **必须正确配置**，确保 SecOC 能够从 FvM 获取正确的新鲜值。   |
| **Freshness Value Length**               | 新鲜值长度               | 指定 **新鲜值** 的 **总长度**，以字节为单位。                | 根据安全策略配置，通常为 4-8 字节。                          |
| **Freshness Value Tx Length**            | 新鲜值发送长度           | 指定在发送方向上实际 **发送的新鲜值长度**，以字节为单位。可以截断新鲜值以节省带宽（`Truncated Freshness Value`）。 | 通常与 `Freshness Value Length` 一致，除非需要使用截断新鲜值优化带宽。 |
| **Immediate Processing Of Csm Callback** | CSM 回调立即处理         | 勾选后，当 CSM 作业完成时，**立即处理** 回调函数，而不将其放入延迟队列。 | 在实时性要求高的场景中勾选，但会增加中断上下文的处理负载。   |
| **Pdu Processing**                       | PDU 处理模式             | 指定该安全 PDU 的 **处理模式**。                             | - `IMMEDIATE`：立即处理。<br>- `DEFERRED`：延迟处理（在主函数中处理）。<br>通常使用 `DEFERRED` 以减少中断负载。 |
| **Provide Tx Truncated Freshness Value** | 提供发送截断新鲜值       | 勾选后，SecOC 在发送 PDU 时提供 **截断后的新鲜值**（`Freshness Value Tx Length` 指定的长度）。 | 仅在带宽受限场景中启用，需与接收方协商一致的截断策略。       |
| **Same Buffer Pdu Ref**                  | 相同缓冲区 PDU 引用      | 指定与该安全 PDU **共享同一缓冲区** 的 PDU 配置引用，用于内存优化。 | 通常保持为空，仅在需要内存共享优化时配置。                   |
| **Tx Auth Service Config Ref**           | 发送认证服务配置引用     | **关键引用**。指向 **CSM** 中定义的 **认证作业配置**，用于为待发送的安全 PDU 生成 MAC。 | **必须正确引用**，否则 SecOC 无法为安全 PDU 生成 MAC。       |
| **Use Tx Confirmation**                  | 使用发送确认             | 勾选后，SecOC 在 PDU **成功发送后** 会收到发送确认通知，可用于触发后续处理（如更新新鲜值状态）。 | 建议勾选，确保发送状态可追踪。                               |

> [!note]
>
> 1. **发送安全 PDU 的处理流程**：
>    - 上层模块（如 Com）将数据传递给 SecOC。
>    - SecOC 调用 FvM 获取当前新鲜值。
>    - SecOC 使用 CSM 作业生成 MAC（消息认证码）。
>    - SecOC 组装安全 PDU（认证头 + 数据 + MAC）。
>    - 安全 PDU 通过 PduR → CanIf 发送到总线上。
>    - 发送完成后，SecOC 更新新鲜值状态（如递增消息计数器）。
>
> 2. **新鲜值截断（Truncated Freshness Value）**：在带宽受限的场景中，完整的新鲜值可能过长（如 8 字节），可以通过截断方式仅发送部分字节（如 4 字节）。接收方通过同步机制恢复完整的新鲜值。`Provide Tx Truncated Freshness Value` 和 `Freshness Value Tx Length` 共同控制截断行为。

### SecOCTxAuthenticPduLayer 实例

`SecOCTxAuthenticPduLayer` 是 `SecOCTxSecuredPdu` 的子容器，用于配置 **发送方向安全 PDU 的认证层参数**，定义该安全 PDU 在 PduR 层面的 PDU 类型和关联的底层 PDU 引用。

| 参数名称                       | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                 | 短名称              | 该认证层配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Pdu Type**                   | PDU 类型            | 指定该安全 PDU 的 **PDU 类型**，用于标识其在 PduR 路由中的类型。 | - `SECOC_IFPDU`：SecOC 接口 PDU，表示该 PDU 由 SecOC 模块处理。<br>- 其他类型根据项目通信架构定义。 |
| **Tx Authentic Layer Pdu Id**  | 发送认证层 PDU ID   | 该认证层 PDU 在 SecOC 模块内部的 **数字标识符**，用于索引和识别不同的认证层 PDU。 | 通常由工具自动生成，无需手动修改。                           |
| **Tx Authentic Layer Pdu Ref** | 发送认证层 PDU 引用 | **关键引用**。指向 **EcuC** 中定义的 **PDU 配置实例**，将该安全 PDU 与底层通信 PDU 关联起来。SecOC 通过此引用将安全 PDU 传递给底层通信模块进行发送。 | **必须正确引用**，否则 SecOC 无法将安全 PDU 发送到底层。该引用指向 `EcuC/EcuPduCollection` 中定义的具体 PDU 实例。 |

> [!note]
>
> 1. **发送方向的完整配置层级**：
>
>    ```txt
>    SecOCTxSecuredPdu（发送安全 PDU 配置）
>        ├── SecOCTxSecuredPduLayer（安全层配置）
>        │   └── Auth Pdu Header Length 等参数
>        └── SecOCTxAuthenticPduLayer（认证层配置）
>            ├── Pdu Type
>            ├── Tx Authentic Layer Pdu Id
>            └── Tx Authentic Layer Pdu Ref  ← 指向底层 PDU
>    ```
>
> 2. **发送安全 PDU 的底层通信链路**：
>
>    ```txt
>    SecOC（安全处理）→ PduR → CanIf → Can 驱动 → 总线
>    ```
>
>    `Tx Authentic Layer Pdu Ref` 指向的 PDU 配置实例，与 `CanIfTxPduCfgs` 中的 PDU 配置关联，确保安全 PDU 能够通过正确的 CAN ID 和通信参数发送到总线上。
>
> 3. **TxSecuredPduLayer 与 TxAuthenticPduLayer 的区别**：
>
>    | 容器                       | 职责                                   | 关键参数                                 |
>    | :------------------------- | :------------------------------------- | :--------------------------------------- |
>    | `SecOCTxSecuredPduLayer`   | 安全层配置，定义认证头长度、验证开关等 | `Auth Pdu Header Length`                 |
>    | `SecOCTxAuthenticPduLayer` | 认证层配置，定义 PDU 类型和底层引用    | `Pdu Type`、`Tx Authentic Layer Pdu Ref` |

### SecOCTxPduSecuredArea 实例

`SecOCTxPduSecuredArea` 用于配置 **发送方向安全 PDU 的安全区域（Secured Area）** 属性，定义安全 PDU 中受保护数据的长度和起始偏移位置。

| 参数名称                  | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                       |
| :------------------------ | :---------------- | :----------------------------------------------------------- | :-------------------------------------------------------- |
| **Short Name**            | 短名称            | 该安全区域配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                              |
| **Secured Tx Pdu Length** | 安全发送 PDU 长度 | 指定安全 PDU 中**受安全保护的数据长度**，以字节为单位。该部分数据参与认证（MAC）计算和新鲜值验证。 | 根据安全 PDU 的帧格式配置。该长度不应超过 PDU 的总长度。  |
| **Secured Tx Pdu Offset** | 安全发送 PDU 偏移 | 指定安全 PDU 中**受安全保护数据的起始偏移位置**，以字节为单位，从 PDU 数据的开头计算。 | 根据安全 PDU 的帧格式配置，确保受保护数据的起始位置正确。 |

> [!note]
>
> 1. **发送与接收安全区域的一致性**：`SecOCTxPduSecuredArea` 的配置必须与接收方向的 `SecOCRxPduSecuredArea` 配置一致，确保发送方和接收方对安全区域的界定相同，否则接收方 MAC 验证将失败。
>
> 2. **Tx 与 Rx 的对称关系**：
>
>    | 方向       | 容器                    | 参数                                             |
>    | :--------- | :---------------------- | :----------------------------------------------- |
>    | 接收（Rx） | `SecOCRxPduSecuredArea` | `Secured Rx Pdu Length`、`Secured Rx Pdu Offset` |
>    | 发送（Tx） | `SecOCTxPduSecuredArea` | `Secured Tx Pdu Length`、`Secured Tx Pdu Offset` |
>
> 3. **安全区域的典型配置示例**：
>
>    ```text
>    PDU 数据布局（总长度 20 字节）：
>    | 头部 (4 字节) | 安全区域 (16 字节) |
>       
>    Offset = 4（跳过头部 4 字节）
>    Length = 16（头部之后的所有数据）
>    ```
>
>    头部 4 字节不参与安全保护，安全区域 16 字节参与 MAC 计算和新鲜值保护。

### SecOCTxSecuredPduLayer 实例

`SecOCTxSecuredPduLayer` 是 `SecOCTxSecuredPdu` 的子容器（与 `SecOCTxAuthenticPduLayer` 平级），用于配置 **发送方向安全 PDU 的安全层参数**，定义安全 PDU 的认证头长度、PDU 类型以及关联的底层 PDU 引用。

| 参数名称                     | 中文直译 / 作用     | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称              | 该安全层配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Auth Pdu Header Length**   | 认证 PDU 头长度     | 指定安全 PDU 中**认证头（Authentication Header）** 的长度，以字节为单位。认证头通常包含新鲜值、计数器等安全相关信息。SecOC 在构建安全 PDU 时会预留该长度的空间用于填充认证头。 | 根据安全 PDU 的帧格式配置。该长度必须与接收方的 `Auth Pdu Header Length` 配置一致，否则接收方无法正确解析安全 PDU。 |
| **Pdu Type**                 | PDU 类型            | 指定该安全 PDU 的 **PDU 类型**，用于标识其在 PduR 路由中的类型。 | `SECOC_IFPDU`：SecOC 接口 PDU，表示该 PDU 由 SecOC 模块处理。 |
| **Tx Secured Layer Pdu Id**  | 发送安全层 PDU ID   | 该安全层 PDU 在 SecOC 模块内部的 **数字标识符**，用于索引和识别不同的安全层 PDU。 | 通常由工具自动生成，无需手动修改。                           |
| **Tx Secured Layer Pdu Ref** | 发送安全层 PDU 引用 | **关键引用**。指向 **EcuC** 中定义的 **PDU 配置实例**，将该安全 PDU 与底层通信 PDU 关联起来。SecOC 通过此引用将安全 PDU 传递给底层通信模块进行发送。 | **必须正确引用**，否则 SecOC 无法将安全 PDU 发送到底层。该引用指向 `EcuC/EcuPduCollection` 中定义的具体 PDU 实例。 |

> [!note]
>
> 1. **发送方向的完整配置层级**：
>
>    ```txt
>    SecOCTxSecuredPdu（发送安全 PDU 配置）
>        ├── SecOCTxSecuredPduLayer（安全层配置）
>        │   ├── Auth Pdu Header Length
>        │   ├── Pdu Type: SECOC_IFPDU
>        │   ├── Tx Secured Layer Pdu Id
>        │   └── Tx Secured Layer Pdu Ref  ← 指向底层 PDU
>        └── SecOCTxAuthenticPduLayer（认证层配置）
>            ├── Pdu Type
>            ├── Tx Authentic Layer Pdu Id
>            └── Tx Authentic Layer Pdu Ref  ← 指向底层 PDU
>    ```
>
> 2. **Auth Pdu Header Length 的重要性**：该参数定义了认证头的长度，SecOC 在构建安全 PDU 时会根据此值预留空间。如果配置过短，安全信息（新鲜值、MAC 等）可能无法完整存放；如果配置过长，则会浪费总线带宽。**必须与接收方的配置保持一致**。
>
> 3. **TxSecuredPduLayer 与 TxAuthenticPduLayer 的协作**：
>    - `TxSecuredPduLayer`：定义安全 PDU 的**安全属性**（认证头长度、安全层 PDU 引用）。
>    - `TxAuthenticPduLayer`：定义安全 PDU 的**认证属性**（认证层 PDU 引用）。
>    - 两者共同确保安全 PDU 能够正确构建并发送到底层通信模块。

## SecOCGeneral 

`SecOCGeneral` 是 SecOC 模块的**顶层通用配置容器**，用于配置 SecOC 的全局行为参数，包括错误检测、主函数周期、新鲜值查询方式、验证状态回调等。

| 参数名称                                             | 中文直译 / 作用                  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------------------- | :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                       | 短名称                           | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Can Fd Padding**                                   | CAN FD 填充                      | 勾选后，启用 **CAN FD 填充**，对 CAN FD 报文进行字节填充以满足长度要求。 | 仅在项目使用 CAN FD 时可能需要启用，根据通信矩阵配置。       |
| **Default Authentication Information Pattern**       | 默认认证信息模式                 | 指定 **默认认证信息模式**，用于 SecOC 在构建安全 PDU 时的默认认证参数。 | 根据项目安全策略配置，通常由 OEM 定义。                      |
| **Dev Error Detect**                                 | 开发错误检测                     | 勾选后，启用 SecOC 内部的**开发错误检测**，当检测到参数错误、状态错误时，调用 `Det_ReportError` 报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Enable Async CSM Job Timeout**                     | 启用异步 CSM 作业超时            | 勾选后，启用 **异步 CSM 作业超时** 监控，当 CSM 加密作业超时时触发超时处理。 | 建议勾选，确保加密作业不会无限阻塞。                         |
| **Enable Custom Authentication API**                 | 启用自定义认证 API               | 勾选后，启用**自定义认证 API**，允许用户提供自定义的认证函数实现。 | 仅在需要自定义认证逻辑时启用，一般保持默认（不勾选）。       |
| **Enable Development Mode**                          | 启用开发模式                     | 勾选后，启用 **SecOC 开发模式**，在开发阶段提供更多的调试信息和宽松的检查。 | 仅在开发调试阶段勾选，量产版本**必须关闭**。                 |
| **Enable Forced Pass Override**                      | 启用强制通过覆盖                 | 勾选后，允许**强制通过**安全验证（即使 MAC 或新鲜值验证失败）。 | 仅在开发调试阶段启用，**量产版本必须关闭**，否则安全机制将失效。 |
| **Ignore Verification Result**                       | 忽略验证结果                     | 勾选后，SecOC 会**忽略**安全验证结果，即使验证失败也继续处理 PDU 数据。 | 仅在开发调试阶段启用，**量产版本必须关闭**。                 |
| **Main Function Period Rx [ms]**                     | 接收主函数周期                   | 指定 **接收方向主函数（SecOC_MainFunction_Rx）** 的执行周期，以毫秒为单位。 | 根据项目调度周期配置，典型值为 5-20ms。                      |
| **Main Function Period Tx [ms]**                     | 发送主函数周期                   | 指定 **发送方向主函数（SecOC_MainFunction_Tx）** 的执行周期，以毫秒为单位。 | 根据项目调度周期配置，典型值为 5-20ms。                      |
| **Max Align Scalar Type**                            | 最大对齐标量类型                 | 指定 SecOC 中使用的**最大对齐标量类型**，用于控制数据结构的对齐方式。 | 通常保持默认，一般不需要手动修改。                           |
| **Max Message Linker Size Of Rx Pdu**                | 接收 PDU 最大消息链接器大小      | 指定接收方向安全 PDU 的**最大消息链接器大小**，用于内存分配。 | 通常保持默认值（0），由工具自动计算。                        |
| **Propagate Only Final Verification Status**         | 仅传播最终验证状态               | 勾选后，SecOC 仅传播**最终验证状态**，而非中间状态。         | 根据项目安全通信架构配置，通常建议勾选以减少状态传递开销。   |
| **Query Freshness Value**                            | 查询新鲜值方式                   | 指定 SecOC 查询 FvM 获取新鲜值的**调用方式**。               | `CFUNC`：使用 C 函数调用。通常保持默认值。                   |
| **Retry Failed Transmit Request**                    | 重试失败的发送请求               | 勾选后，当发送请求失败时，SecOC 会**自动重试**发送。         | 建议勾选，提高发送可靠性。                                   |
| **Safe Bsw Checks**                                  | 安全 BSW 检查                    | 勾选后，启用**安全 BSW 检查**，对关键参数进行合法性检查，用于功能安全场景。 | 在 **ASIL/功能安全** 项目中建议勾选，QM 项目保持关闭。       |
| **Use Get Rx Freshness**                             | 使用获取接收新鲜值 API           | 勾选后，SecOC 使用 `GetRxFreshness` API 获取接收方向的新鲜值。 | 根据项目 FvM 接口配置，通常保持默认（勾选）。                |
| **Use Get Rx Freshness Auth Data**                   | 使用获取接收新鲜值认证数据 API   | 勾选后，SecOC 使用 `GetRxFreshnessAuthData` API 获取接收方向的新鲜值认证数据。 | 根据项目 FvM 接口配置，通常保持默认（勾选）。                |
| **Use Get Tx Freshness**                             | 使用获取发送新鲜值 API           | 勾选后，SecOC 使用 `GetTxFreshness` API 获取发送方向的新鲜值。 | 根据项目 FvM 接口配置，通常保持默认（勾选）。                |
| **Use Get Tx Freshness Trunc Data**                  | 使用获取发送截断新鲜值 API       | 勾选后，SecOC 使用 `GetTxFreshnessTruncData` API 获取发送方向的截断新鲜值。 | 仅在需要截断新鲜值时启用。                                   |
| **Use MSB Aligned Truncated Freshness Value In FvM** | 在 FvM 中使用 MSB 对齐截断新鲜值 | 勾选后，FvM 中截断新鲜值采用 **MSB（最高有效位）对齐** 方式。 | 根据项目安全策略配置，需与 FvM 配置保持一致。                |
| **Use SPdu Tx Confirmation**                         | 使用安全 PDU 发送确认            | 勾选后，启用**安全 PDU 发送确认**，SecOC 在安全 PDU 成功发送后收到确认通知。 | 建议勾选，确保发送状态可追踪。                               |
| **User Config File**                                 | 用户配置文件                     | 指定一个**用户自定义配置文件**的路径，允许用户通过外部文件覆盖部分 SecOC 配置。 | 通常保持为空。                                               |
| **Version Info Api**                                 | 版本信息 API                     | 勾选后，生成 **`SecOC_GetVersionInfo`** API，用于获取 SecOC 模块的版本信息。 | 建议勾选，便于版本管理和调试。                               |
| **Verification Status Callout**                      | 验证状态回调函数                 | 指定安全验证完成后的**回调函数名称**。当 SecOC 完成安全 PDU 的验证后，调用此函数通知上层模块验证结果。 | 截图中配置为 `FvM_VerificationStatusCallout`，表示验证状态通知给 FvM 模块。根据项目架构配置。 |
| **Verification Status Callout With Secured Pdu**     | 带安全 PDU 的验证状态回调        | 指定带安全 PDU 信息的验证状态回调函数。与 `Verification Status Callout` 类似，但回调函数会包含安全 PDU 的详细信息。 | 通常保持为空，使用 `Verification Status Callout` 即可。      |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                            | 开发阶段 | 量产阶段      |
>    | :------------------------------ | :------- | :------------ |
>    | `Dev Error Detect`              | ✅ 勾选   | ❌ 关闭        |
>    | `Enable Development Mode`       | ✅ 勾选   | ❌ 关闭        |
>    | `Enable Forced Pass Override`   | ✅ 勾选   | ❌ 关闭        |
>    | `Ignore Verification Result`    | ✅ 勾选   | ❌ 关闭        |
>    | `Safe Bsw Checks`               | ✅ 勾选   | ASIL 项目勾选 |
>    | `Version Info Api`              | ✅ 勾选   | ✅ 勾选        |
>    | `Enable Async CSM Job Timeout`  | ✅ 勾选   | ✅ 勾选        |
>    | `Retry Failed Transmit Request` | ✅ 勾选   | ✅ 勾选        |
>    | `Use SPdu Tx Confirmation`      | ✅ 勾选   | ✅ 勾选        |
>
> 2. **新鲜值 API 的选择**：SecOC 与 FvM 之间的接口有多种 API 可供选择：
>    - `GetTxFreshness`：获取发送新鲜值（完整长度）。
>    - `GetTxFreshnessTruncData`：获取截断后的发送新鲜值。
>    - `GetRxFreshness`：获取接收新鲜值。
>    - `GetRxFreshnessAuthData`：获取包含认证数据的接收新鲜值。
>
>    根据项目使用的 FvM 接口版本和功能需求选择启用对应的 API。
>
> 3. **主函数周期的分离配置**：SecOC 支持将接收处理（Rx）和发送处理（Tx）的主函数周期分别配置，便于根据接收和发送的不同负载需求独立调优。

## SecOCGeneration 

`SecOCGeneration` 用于配置 **SecOC 模块代码生成** 时的优化策略，控制生成代码的数据结构、内存占用和调试支持。

| 参数名称                                    | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------ | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                              | 短名称             | 该代码生成配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Interfaces For Deactivated Data**         | 为停用数据生成接口 | 勾选后，为**已停用的数据**也生成 RTE 接口（即使数据未启用）。 | 仅在调试或特殊开发场景中勾选，量产版本保持关闭。             |
| **Out Of Bounds Read Sanitizer**            | 越界读取清理器     | 勾选后，生成**越界读取检查**代码，在读取数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Out Of Bounds Write Protection Strategy** | 越界写入保护策略   | 指定**越界写入保护**的策略，防止写入操作超出数组或缓冲区的边界。 | - `NONE`：不进行保护。<br>- `GUARD`：添加保护字节。<br>- `CHECK`：运行时检查。<br>ASIL 项目中建议配置，QM 项目通常选择 `NONE`。 |
| **Out Of Bounds Write Sanitizer**           | 越界写入清理器     | 勾选后，生成**越界写入检查**代码，在写入数组或缓冲区时检测是否越界。 | 仅在开发调试阶段勾选，量产版本关闭以提升性能。               |
| **Referring Keys In Comments**              | 在注释中包含引用键 | 勾选后，在生成的代码注释中包含**引用键（Referring Keys）**，便于追溯配置来源。 | 建议勾选，便于代码与配置的追溯。                             |
| **Short Symbols**                           | 短符号             | 勾选后，生成**短符号名**，减少生成代码中符号的长度以节省内存。 | 仅在内存极度受限的场景中启用，一般保持默认（不勾选）。       |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                              | 开发阶段 | 量产阶段 |
>    | :-------------------------------- | :------- | :------- |
>    | `Out Of Bounds Read Sanitizer`    | ✅ 勾选   | ❌ 关闭   |
>    | `Out Of Bounds Write Sanitizer`   | ✅ 勾选   | ❌ 关闭   |
>    | `Interfaces For Deactivated Data` | ❌ 关闭   | ❌ 关闭   |
>    | `Referring Keys In Comments`      | ✅ 勾选   | ✅ 勾选   |
>    | `Short Symbols`                   | ❌ 关闭   | 按需     |
>
> 2. **与 FvMGeneration / PduRGeneration 的一致性**：`SecOCGeneration` 中的参数与 `FvMGeneration`、`PduRGeneration` 中的同名参数功能一致，都是 Vector 工具链中用于控制代码生成的通用选项。建议在同一项目中保持这些参数配置的一致性。















































