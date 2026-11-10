---
title: Davinci Configurator - Diagnostics

categories: 
  - 软件及工具
---



# DCM

```
Dcm
└── DcmConfigSet
    ├── DcmDsd
    ├── DcmDsl
    ├── DcmDsp
    ├── DcmGeneral
    ├── DcmMiscellaneous
    └── DcmPageBufferCfg
```

## DcmDsd

```txt
Dcm
└── DcmConfigSet
    └── DcmDsd
        └── DcmDsdServiceTables
            └── DcmDsdServiceTable
                └── DcmDsdServices
                    ├── ClearDiagnInfo
                    ├── CommunicationControl
                    ├── ControlDtcSetting
                    ├── DiagSessionControl
                    ├── EcuReset
                    ├── ReadDataById
                    ├── ReadDtcInfo
                    ├── RoutineControl
                    ├── SecurityAccess
                    ├── TesterPresent
                    └── WriteDataById
```

`DcmDsd`（Diagnostic Service Dispatcher，诊断服务分发单元）负责**路由和分发**收到的诊断请求。它根据请求报文的第一个字节（SID，Service Identifier）找到对应的处理函数。

其下的 `DcmDsdServiceTable` 中列出了该 ECU 支持的所有 **UDS 服务（SID）**，每个服务节点（如 `ReadDataById`、`EcuReset` 等）代表一个具体的诊断服务，其下还会包含该服务支持的**子服务（SubService）**，例如：

- `DiagSessionControl`（0x10）下包含 `DefaultSession`、`ProgrammingSession`、`ExtendedSession` 等子服务。
- `SecurityAccess`（0x27）下包含 `SeedRequest`、`KeySend` 等子服务。
- `EcuReset`（0x11）下包含 `HardReset`、`KeyOffOnReset`、`SoftReset` 等子服务。

DcmDsdServices 下的 UDS 服务列表（含 SID）

| 服务节点               | UDS SID（十六进制） | 服务名称         | 功能简述                            |
| :--------------------- | :------------------ | :--------------- | :---------------------------------- |
| `DiagSessionControl`   | 0x10                | 诊断会话控制     | 切换诊断会话（默认/编程/扩展）      |
| `EcuReset`             | 0x11                | ECU 复位         | 执行 ECU 复位（硬复位/软复位等）    |
| `SecurityAccess`       | 0x27                | 安全访问         | 种子/密钥验证，解锁受保护的诊断服务 |
| `CommunicationControl` | 0x28                | 通信控制         | 启用/禁用某些通信通道（如应用报文） |
| `TesterPresent`        | 0x3E                | 测试仪在线       | 保持当前诊断会话处于激活状态        |
| `ReadDataById`         | 0x22                | 通过 ID 读取数据 | 读取指定的 DID（数据标识符）数据    |
| `ReadDtcInfo`          | 0x19                | 读取 DTC 信息    | 读取故障码（DTC）状态和相关信息     |
| `WriteDataById`        | 0x2E                | 通过 ID 写入数据 | 写入指定的 DID（数据标识符）数据    |
| `ClearDiagnInfo`       | 0x14                | 清除诊断信息     | 清除故障码（DTC）和相关诊断信息     |
| `ControlDtcSetting`    | 0x85                | 控制 DTC 设置    | 启用/禁用 DTC 的记录和存储          |
| `RoutineControl`       | 0x31                | 例程控制         | 启动/停止/查询指定的例程（RID）     |
| `RoutineControl`       | 0x31                | 例程控制         | 启动/停止/查询指定的例程（RID）     |

> [!note]
>
> 1. `DcmDsd` 是 DCM 模块的**请求分发入口**，所有诊断请求首先由 Dsd 解析 SID，再分发给 `DcmDsl`（会话/安全层）或 `DcmDsp`（服务执行层）。
> 2. 每个服务节点（如 `ReadDataById`）下通常还会包含 `DcmDsdSubServices` 子容器，用于定义该服务支持的**子服务**（如 0x22 服务下的 DID 列表，0x27 服务下的种子/密钥算法等）。
> 3. **列表中的 `RoutineControl` 出现了两次**，这是你截图中的实际情况，笔记中保留原样即可。



### DcmDsdServices实例

以下以0x14的配置作为案例：

`ClearDiagInfo` 对应 UDS 服务 **0x14（清除诊断信息）**，用于清除 DTC（故障码）和相关诊断信息。

| 参数名称                                 | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称             | 该服务配置实例的唯一标识名。                                 | 此处为 `ClearDiagInfo`，对应 UDS SID 0x14。                  |
| **Dsd Sid Tab Fnc**                      | SID 表功能         | 指定该服务的**处理函数**，即当收到 0x14 请求时，DCM 应调用哪个函数来执行清除诊断信息的操作。 | 通常指向 `DcmDsp` 层中实现的具体处理函数。由工具链或手写代码提供。 |
| **Dsd Sid Tab Mode Rule Ref**            | SID 表模式规则引用 | 引用该服务所处的**诊断模式规则**，用于定义该服务在哪些诊断模式下可用。 | 通常指向 `DcmDsp` 中定义的 `DcmModeRule`，一般不常修改。     |
| **Dsd Sid Tab Service Dispatcher**       | SID 表服务分发器   | 指定该服务由 **Dsd 的哪个分发器** 处理。                     | 通常保持默认（不配置），由 Dsd 主分发器统一处理。            |
| **Dsd Sid Tab Service Id**               | SID 表服务 ID      | 该服务对应的 **UDS 服务标识符（SID）**。                     | 工具会根据服务名称自动填充正确的 SID（如 ClearDiagInfo = 0x14），通常不需要手动修改。 |
| **Dsd Sid Tab Subfunc Avail**            | 子功能可用性       | 指定该服务**是否支持子功能（SubFunction）**。                | 0x14 服务支持子功能（如按 DTC 状态掩码清除），因此应勾选或设置为可用。 |
| **Dsd Sid Tab Used**                     | 服务是否启用       | 勾选后表示该服务在当前 ECU 中**启用**。                      | **必须勾选**，否则该服务不生效，收到 0x14 请求会返回 NRC 0x11（服务不支持）。 |
| **Dsd Sid Tab Security Level Ref**       | 安全等级引用       | 引用该服务所需的**安全访问等级（Security Level）**。只有通过了对应安全等级验证的测试仪才能调用此服务。 | - 如果服务需要解锁安全访问才能使用，需在此引用对应的 `DcmSecurityLevel`。<br>- 如果服务无需安全验证（如默认会话下可用），则保持为空。 |
| **Dsd Sid Tab Session Level Ref**        | 会话等级引用       | 引用该服务可用的**诊断会话等级（Session Level）**。只有处于指定会话状态下，测试仪才能调用此服务。 | 截图中引用了两个会话：<br>- `Default`（默认会话）<br>- `Extended`（扩展会话）<br>表示 0x14 服务在默认会话和扩展会话下均可使用。 |
| **Dsd Sid Tab Vehicle System Group Ref** | 车辆系统组引用     | 用于定义该服务属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空，仅在复杂的多 ECU 诊断路由场景中使用。          |
| **Dsd Service Role Ref**                 | 服务角色引用       | 指定该服务在 DCM 中的**角色（Role）**，用于更细粒度的访问控制。 | 通常保持为空，使用默认角色。                                 |

> [!note]
>
> 1. **SID 与服务的对应关系**：`ClearDiagInfo` 对应 UDS SID = **0x14**。工具会根据 `Short Name` 自动识别并填充 SID。
>
> 2. **会话与安全等级的逻辑**：
>    - `Session Level Ref` 决定了服务在**哪些会话状态**下可用。
>    - `Security Level Ref` 决定了服务是否需要**安全解锁**才能使用。
>    - 两者共同构成服务的访问控制策略。
>
> 3. **ClearDiagInfo 的典型配置**：
>
>    | 参数                             | 典型配置                                            | 说明                                     |
>    | :------------------------------- | :-------------------------------------------------- | :--------------------------------------- |
>    | `Dsd Sid Tab Session Level Ref`  | `Default` + `Extended`                              | 默认和扩展会话均可使用                   |
>    | `Dsd Sid Tab Security Level Ref` | 通常引用 `DcmSecurityLevel`（如 `SecurityLevel_1`） | 大多数项目要求先解锁安全访问才能清除 DTC |
>    | `Dsd Sid Tab Subfunc Avail`      | ✅ 启用                                              | 0x14 支持按 DTC 状态掩码清除             |
>    | `Dsd Sid Tab Used`               | ✅ 勾选                                              | 启用该服务                               |
>
> 4. **会话等级的典型配置**：
>    - **`Default`**：默认会话，ECU 上电后的初始状态。
>    - **`Programming`**：编程会话，用于软件刷写。
>    - **`Extended`**：扩展会话，用于特殊诊断功能。
>
> 5. 截图中 `Dsd Sid Tab Security Level Ref` 和 `Dsd Service Role Ref` 未配置（显示 `Use '+' to add parameters`），表示当前服务未设置安全访问等级和服务角色限制。

### DcmDsdSubService 实例

`DcmDsdSubService` 用于配置某个 UDS 服务下**具体子服务（SubService）** 的详细参数。例如，`EcuReset`（0x11）服务下包含 `hardReset`（0x01）、`keyOffOnReset`（0x02）、`softReset`（0x03）等子服务。

| 参数名称                                     | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                               | 短名称               | 该子服务配置实例的唯一标识名。                               | 工具自动生成或手动命名，通常表示该子服务的具体功能，如 `hardReset`。截图中未显示具体名称。 |
| **Dsd Sub Service Fnc**                      | 子服务功能           | 指定该子服务的**处理函数**，即当收到该子服务请求时，DCM 应调用哪个具体函数来执行操作。 | 通常由工具链根据配置自动映射到 `DcmDsp` 层的实现函数。一般不需要手动配置。 |
| **Dsd Sub Service Id**                       | 子服务 ID            | 该子服务的**子功能 ID（SubFunction ID）**，即 UDS 协议中 SID 后面的第二个字节。 | **必须正确配置**，与 UDS 协议定义一致。截图中为 `0x1`。      |
| **Dsd Sub Service Mode Rule Ref**            | 子服务模式规则引用   | 引用该子服务所处的**诊断模式规则**，用于定义该子服务在哪些诊断模式下可用。 | 通常保持默认，不常修改。                                     |
| **Dsd Sub Service Role Ref**                 | 子服务角色引用       | 指定该子服务在 DCM 中的**角色（Role）**，用于更细粒度的访问控制。 | 通常保持为空，使用默认角色。                                 |
| **Dsd Sub Service Security Level Ref**       | 子服务安全等级引用   | 引用该子服务所需的**安全访问等级**。只有通过了对应安全等级验证的测试仪才能调用此子服务。 | - 如果该子服务需要安全解锁才能使用，需在此引用对应的 `DcmSecurityLevel`。<br>- 如果无需安全验证，则保持为空。 |
| **Dsd Sub Service Session Level Ref**        | 子服务会话等级引用   | 引用该子服务可用的**诊断会话等级**。只有处于指定会话状态下，测试仪才能调用此子服务。 | 截图中引用了 `Extended`（扩展会话），表示该子服务仅在扩展会话下可用。 |
| **Dsd Sub Service Vehicle System Group Ref** | 子服务车辆系统组引用 | 用于定义该子服务属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **服务与子服务的关系**：
>    - **服务（Service）**：由 SID 标识，如 `EcuReset` = 0x11。
>    - **子服务（SubService）**：由 SubFunction ID 标识，如 `hardReset` = 0x01。
>    - 一个服务下可以有多个子服务，每个子服务可以独立配置会话/安全等级。
>
> 2. **子服务 ID 的典型值**（以 0x11 EcuReset 为例）：
>
>    | 子服务名称                 | SubFunction ID | 说明                          |
>    | :------------------------- | :------------- | :---------------------------- |
>    | `hardReset`                | 0x01           | 硬件复位（ECU 完全重启）      |
>    | `keyOffOnReset`            | 0x02           | 钥匙关/开复位（模拟点火循环） |
>    | `softReset`                | 0x03           | 软件复位（不重新初始化硬件）  |
>    | `enableRapidPowerShutDown` | 0x04           | 快速断电（用于快速关机）      |
>
> 3. **独立配置的意义**：同一个 UDS 服务下的不同子服务，可能具有不同的访问控制策略。例如：
>    - `hardReset`（0x01）可能需要安全解锁后才能执行。
>    - `enableRapidPowerShutDown`（0x04）可能只在扩展会话下可用。
>    - 通过 `Dsd Sub Service Session Level Ref` 和 `Dsd Sub Service Security Level Ref` 可以实现这种精细控制。
>
> 4. **配置的含义**：
>    
>    - `Dsd Sub Service Id = 0x1`：当前配置的是该服务下的第一个子服务（如 hardReset）。
>    - `Dsd Sub Service Session Level Ref = Extended`：该子服务**仅在扩展会话（Extended Session）下可用**，在默认会话下会被拒绝。
>    - `Dsd Sub Service Security Level Ref` 未配置（为空）：该子服务**无需安全解锁**即可调用。

## DcmDsl

```
Dcm
└── DcmConfigSet
    └── DcmDsl
        ├── DcmDslBuffers
        │   └── DcmDslBuffer
        ├── DcmDslCallbackDCMRequestServices
        ├── DcmDslDiagResp
        ├── DcmDslProtocol
        │   └── DcmDslProtocolRows
        │       └── DcmDslProtocolRow
        └── DcmDslConnections
            ├── DcmDslConnection
            ├── DcmDslMainConnection
            ├── DcmDslProtocolRx
            │   ├── DcmDslProtocolRx_Fun
            │   └── DcmDslProtocolRx_Phy
            └── DcmDslProtocolTx
```

### DcmDslBuffers

`DcmDslBuffers` 下的每个实例用于配置 DCM 模块的**诊断通信缓冲区**，用于存储诊断请求和响应数据。

| 参数名称                   | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**             | 短名称          | 该缓冲区配置实例的唯一标识名。                               | 通常保持默认，如 `DcmDslBuffer`。                            |
| **Dsl Buffer Size [Byte]** | DSL 缓冲区大小  | 指定该诊断缓冲区的**大小**，以字节为单位。该缓冲区用于存放诊断请求报文和响应报文的数据。 | **必须足够大**，能够容纳项目中最大的诊断请求或响应报文。截图中为 `1024` 字节，对于 UDS 诊断来说是比较常见的配置，能够支持较大的诊断数据（如 0x22/0x2E 读取/写入较大的 DID，或 0x31 例程控制的大数据块）。 |

> [!note]
>
> 1. **缓冲区大小的影响**：
>    - 如果 `Dsl Buffer Size` 设置过小，当收到较大的诊断请求（如读取一个 500 字节的 DID）时，会导致缓冲区溢出，诊断通信失败。
>    - 如果设置过大，会浪费 RAM 资源。
>
> 2. **典型配置参考**：
>    - 对于标准 UDS 诊断（主要使用 0x22/0x2E 读写短数据），通常配置为 **1024 字节** 或 **4096 字节**。
>    - 如果项目支持 **刷写（FOTA）** 或 **大数据块传输（如 0x36 TransferData）**，可能需要配置为 **4096 字节** 或更大。
>
> 3. **与其他缓冲区的关系**：
>    - `DcmDslBuffer` 是 DCM 模块的**主通信缓冲区**，所有诊断请求和响应都通过该缓冲区传递。
>    - 如果项目使用了 `DcmPageBufferCfg`（页缓冲区），则页缓冲区专门用于刷写场景，而 `DcmDslBuffer` 用于常规诊断通信。

### DcmDslCallbackDCMRequestService实例

`DcmDslCallbackDCMRequestServices` 用于配置 DCM 模块的**诊断请求服务回调函数**，当上层应用（如 SWC）需要发送诊断请求时，通过此回调与 DCM 模块交互。

| 参数名称                                       | 中文直译 / 作用               | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------------- | :---------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                 | 短名称                        | 该回调配置实例的唯一标识名。                                 | 此处为 `DcmDslCallbackDCMRequestService`。                   |
| **Dsl Callback DCM Request Service Start Fnc** | DSL 回调 DCM 请求服务启动函数 | 指定**启动诊断请求服务**的回调函数名称。当上层需要发起一个诊断请求时，会调用此函数。 | 截图中该参数配置为 `DcmDslCallbackDCMRequestService`，即该回调函数与当前配置同名。该函数由 RTE 或应用层实现，用于处理来自上层的诊断请求。 |
| **Dsl Callback DCM Request Service Use Port**  | DSL 回调 DCM 请求服务使用端口 | 指定该回调函数使用的 **端口（Port）** 引用，用于 RTE 层面的连接。 | 通常保持为空，由工具链自动处理。                             |

> [!note]
>
> 1. **回调函数的触发场景**：
>    - 当应用层（SWC）需要主动发送诊断请求（如 UDS 请求）时，会通过 RTE 调用此回调函数。
>    - DCM 模块通过此回调接收来自上层的诊断请求数据，并将其发送到诊断通信总线上。
>
> 2. **与其他 DCM 回调的关系**：
>    - 此回调是**从应用层到 DCM 的请求通道**。
>    - 与之对应的是 **PduR 层的回调**（如 `PduR_DcmRxIndication`），用于 DCM 接收来自总线的诊断请求。
>
> 3. **典型配置**：
>    - `Dsl Callback DCM Request Service Start Fnc` 指向一个由 RTE 生成的函数（如 `Rte_Call_Dcm_StartService`）或一个自定义的应用层函数。
>    - 如果项目中没有应用层主动发起诊断请求的需求（即诊断请求全部来自外部测试仪），此配置可能保持为空。



### DcmDslServiceRequestManufacturerNotification 实例

| 参数名称                                                     | 中文直译 / 作用              | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------------------- | :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                               | 短名称                       | 该配置实例的唯一标识名。                                     | 此处为 `DcmDslServiceRequestManufacturerNotification`，用于厂商自定义的诊断服务请求通知。 |
| **Dsl Service Request Manufacturer Notification Confirmation Fnc** | 厂商服务请求确认通知回调函数 | 当厂商自定义的诊断服务请求**完成（确认）** 时调用的回调函数，用于通知上层模块请求已处理完成。 | 通常指向 `Dcm` 或 `ComM` 模块中的回调函数，或由厂商自定义实现。 |
| **Dsl Service Request Manufacturer Notification Indication Fnc** | 厂商服务请求指示通知回调函数 | 当收到厂商自定义的诊断服务请求时调用的回调函数，用于指示上层模块有新的诊断请求到达。 | 通常指向 `Dcm` 或 `ComM` 模块中的回调函数，用于处理厂商特定的诊断服务。 |
| **Dsl Service Request Manufacturer Notification Use Port**   | 厂商服务请求通知使用端口     | 指定该通知使用的 **端口（Port）** 引用，用于 RTE 层面的连接。 | 通常保持为空，由工具链自动处理。                             |

> [!note]
>
> 1. **厂商自定义通知的作用**：AUTOSAR DCM 模块允许 OEM 或 Tier 1 添加**厂商自定义（Manufacturer Specific）** 的诊断服务请求通知。当 DCM 收到或处理这些非标准 UDS 服务时，可以通过这些回调通知上层模块执行厂商特定的逻辑。
> 2. **Confirmation vs Indication**：
>    - **Indication（指示）**：通知上层 "收到了一个厂商自定义的诊断请求"。
>    - **Confirmation（确认）**：通知上层 "该诊断请求已处理完毕"。
> 3. 如果项目中没有厂商自定义的诊断服务需求，此配置保持为空即可。



### DcmDslServiceRequestSupplierNotification 实例

| 参数名称                                                     | 中文直译 / 作用                | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------------------- | :----------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                               | 短名称                         | 该配置实例的唯一标识名。                                     | 此处为 `DcmDslServiceRequestSupplierNotification`，用于供应商自定义的诊断服务请求通知。 |
| **Dsl Service Request Supplier Notification Confirmation Fnc** | 供应商服务请求确认通知回调函数 | 当供应商自定义的诊断服务请求**完成（确认）** 时调用的回调函数，用于通知上层模块请求已处理完成。 | 通常指向 `Dcm` 或 `ComM` 模块中的回调函数，或由供应商自定义实现。 |
| **Dsl Service Request Supplier Notification Indication Fnc** | 供应商服务请求指示通知回调函数 | 当收到供应商自定义的诊断服务请求时调用的回调函数，用于指示上层模块有新的诊断请求到达。 | 通常指向 `Dcm` 或 `ComM` 模块中的回调函数，用于处理供应商特定的诊断服务。 |
| **Dsl Service Request Supplier Notification Use Port**       | 供应商服务请求通知使用端口     | 指定该通知使用的 **端口（Port）** 引用，用于 RTE 层面的连接。 | 通常保持为空，由工具链自动处理。                             |

> [!note]
>
> 1. **供应商自定义通知的作用**：AUTOSAR DCM 模块允许供应商（Supplier）添加**供应商自定义（Supplier Specific）** 的诊断服务请求通知。当 DCM 收到或处理这些非标准 UDS 服务时，可以通过这些回调通知上层模块执行供应商特定的逻辑。
>
> 2. **Supplier vs Manufacturer 的区别**：
>
>    | 类型                     | 适用场景               | 说明                                                     |
>    | :----------------------- | :--------------------- | :------------------------------------------------------- |
>    | **Manufacturer（厂商）** | OEM 自定义的诊断服务   | 由车厂定义的专有诊断服务，用于整车级别的特殊功能         |
>    | **Supplier（供应商）**   | 供应商自定义的诊断服务 | 由 ECU 供应商定义的专有诊断服务，用于 ECU 内部的特殊功能 |
>
> 3. **Confirmation vs Indication**：
>    - **Indication（指示）**：通知上层 "收到了一个供应商自定义的诊断请求"。
>    - **Confirmation（确认）**：通知上层 "该诊断请求已处理完毕"。
>
> 4. 如果项目中没有供应商自定义的诊断服务需求，此配置保持为空即可。

### DcmDslDiagResp 实例

| 参数名称                                       | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                 | 短名称                     | 该配置实例的唯一标识名。                                     | 用于在工具中识别该配置实例。                                 |
| **Dsl Diag Resp Max Num Of Declined Requests** | 诊断响应最大拒绝请求次数   | 指定在诊断通信过程中，DCM 允许的最大**请求拒绝次数**。当拒绝次数超过该值时，DCM 可能触发相应的错误处理或降级策略。 | 根据项目需求配置，一般建议配置为 2-5 次，防止因频繁拒绝导致诊断通信异常。 |
| **Dsl Diag Resp Max Num Resp Pend**            | 诊断响应最大挂起响应次数   | 指定 DCM 在发送 **NRC 0x78（响应挂起）** 后，允许的最大**挂起响应次数**。当某个诊断服务需要较长时间处理时，DCM 可发送 NRC 0x78 告知测试仪等待，此参数限制了最多能发多少次。 | 一般建议配置为 2-5 次。若配置过小，测试仪可能因等待时间不足而超时；若配置过大，测试仪可能长时间等待导致通信异常。 |
| **Dsl Diag Resp On Second Declined Request**   | 第二次拒绝请求时的响应行为 | 勾选后，当诊断请求被**第二次拒绝**时，DCM 会执行特定的响应行为（如发送特定的否定响应码或触发错误处理）。 | 建议勾选，以增强诊断通信的健壮性。具体行为取决于 DCM 内部实现。 |
| **Dsl Diag Resp Periodic Msg Padding Pattern** | 诊断响应周期消息填充模式   | 指定诊断响应中周期消息的**填充模式**，用于填充响应数据中的空白字节。 | 通常保持为空，使用默认填充模式（如 0x00）。特殊场景下（如需要特定填充值）可自定义。 |

> [!note]
>
> 1. **NRC 0x78（响应挂起）的作用**：
>    - 当诊断服务需要较长时间执行（如 0x31 例程控制执行耗时操作，或 0x22 读取大量数据）时，DCM 可以发送 NRC 0x78 告知测试仪 "正在处理，请等待"。
>    - `Max Num Resp Pend` 限制了 NRC 0x78 的发送次数，防止测试仪无限等待。
>
> 2. **典型配置建议**：
>    - `Max Num Of Declined Requests`：建议 2-5 次。
>    - `Max Num Resp Pend`：建议 2-5 次。
>    - `On Second Declined Request`：建议勾选。



### DcmDslProtocolRow 实例

| 参数名称                                      | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                | 短名称                     | 该协议行配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Dem Client Ref**                            | DEM 客户端引用             | 引用 **DEM（Diagnostic Event Manager，诊断事件管理器）** 模块的客户端配置，用于 DCM 与 DEM 之间的交互（如 DTC 状态管理、事件上报等）。 | **必须正确引用**，否则 DCM 无法与 DEM 通信，诊断事件和 DTC 功能将无法正常工作。 |
| **Dsl Protocol Endianness Conv Enabled**      | 协议大小端转换启用         | 勾选后，DCM 模块会对诊断数据执行**大小端转换**，确保不同字节序的 ECU 与测试仪之间数据解析一致。 | 根据项目需求配置。如果 ECU 与测试仪的字节序不同，则需要勾选。通常在 CAN 通信中，AUTOSAR 默认使用大端（Motorola）格式。 |
| **Dsl Protocol ID**                           | 协议 ID                    | 指定该诊断通信使用的**协议标识符**，用于识别不同的诊断通信协议。 | 通常由 AUTOSAR 标准或项目约定定义，如 `DCM_UDS_ON_CAN` 表示 UDS 协议运行在 CAN 总线上。 |
| **Dsl Protocol Maximum Response Size [Byte]** | 协议最大响应大小           | 指定该协议下 DCM 能够发送的**最大诊断响应数据大小**，以字节为单位。 | 必须根据底层通信协议（如 CAN、DoIP）的 MTU 限制进行配置。CAN 通常限制在 4095 字节以内（符合 UDS 标准）。 |
| **Dsl Protocol Preempt Timeout [ms]**         | 协议抢占超时               | 指定诊断通信的**抢占超时时间**，以毫秒为单位。当一个诊断请求被更高优先级的请求抢占时，此参数控制等待时间。 | 通常保持默认（0），表示不启用抢占超时机制。仅在需要多优先级诊断通信时配置。 |
| **Dsl Protocol Priority**                     | 协议优先级                 | 指定该诊断通信协议的**优先级**，用于诊断请求的调度。数值越小，优先级越高。 | 通常保持默认（0），除非项目中有多个诊断协议需要区分优先级。  |
| **Dsl Protocol Rx Buffer ID**                 | 协议接收缓冲区 ID          | 引用该协议使用的**接收缓冲区**，即 `DcmDslBuffer` 实例。DCM 通过该缓冲区接收来自总线的诊断请求。 | **必须正确引用**，指向 `DcmDsl/DcmDslBuffers` 下配置的缓冲区实例。 |
| **Dsl Protocol SID Table**                    | 协议 SID 表                | 引用该协议对应的 **SID 表（服务标识符表）**，即 `DcmDsdServiceTable` 实例。该表定义了该协议支持哪些 UDS 服务。 | **必须正确引用**，指向 `DcmDsd/DcmDsdServiceTables` 下配置的服务表实例。 |
| **Dsl Protocol Session Ref**                  | 协议会话引用               | 引用该协议关联的**诊断会话**配置。                           | 通常保持为空，表示该协议使用默认会话配置。                   |
| **Dsl Protocol Trans Type**                   | 协议传输类型               | 指定该协议的**传输类型**，如 CAN、DoIP、FlexRay 等。         | 通常由工具根据 `Dsl Protocol ID` 自动填充，一般不需要手动修改。 |
| **Dsl Protocol Tx Buffer ID**                 | 协议发送缓冲区 ID          | 引用该协议使用的**发送缓冲区**，即 `DcmDslBuffer` 实例。DCM 通过该缓冲区向总线发送诊断响应。 | **必须正确引用**，指向 `DcmDsl/DcmDslBuffers` 下配置的缓冲区实例。通常与 `Dsl Protocol Rx Buffer ID` 指向同一个缓冲区。 |
| **Send Resp Pend On Restart**                 | 重启时发送响应挂起         | 勾选后，当 ECU 执行重启操作时，DCM 会发送 **NRC 0x78（响应挂起）** 告知测试仪等待重启完成。 | 根据项目需求配置。建议在支持诊断重启的 ECU 中勾选。          |
| **Send Resp Pend On Trans To Boot**           | 切换到 Boot 时发送响应挂起 | 勾选后，当 ECU 从应用模式切换到 Boot 模式（如刷写场景）时，DCM 会发送 **NRC 0x78（响应挂起）** 告知测试仪等待模式切换完成。 | 根据项目需求配置。建议在支持诊断刷写的 ECU 中勾选。          |
| **Tim Str P2 Server Adjust [ms]**             | P2 服务器时间调整          | 指定 **P2（服务器响应时间）** 的调整值，以毫秒为单位。P2 是 UDS 协议中从收到请求到开始发送响应的最大允许时间。 | 根据 OEM 诊断规范配置，通常为 10-50ms 之间。该值加上基础 P2 时间构成实际的 P2 超时值。 |
| **Tim Str P2 Star Server Adjust [ms]**        | P2* 服务器时间调整         | 指定 **P2\*（服务器额外响应时间）** 的调整值，以毫秒为单位。P2\* 是 UDS 协议中允许发送 NRC 0x78（响应挂起）后的额外等待时间。 | 根据 OEM 诊断规范配置，通常为 0-50ms 之间。该值加上基础 P2\* 时间构成实际的 P2\* 超时值。 |

> [!note]
>
> 1. **P2 与 P2\* 的区别**：
>
>    | 时间参数 | 定义                                                         | 适用场景                                       |
>    | :------- | :----------------------------------------------------------- | :--------------------------------------------- |
>    | **P2**   | 从测试仪发送请求到 ECU 开始发送响应之间的**最大时间**        | 所有诊断服务                                   |
>    | **P2\*** | ECU 发送 NRC 0x78（响应挂起）后，测试仪允许的**额外等待时间** | 需要长时间处理的服务（如 0x31、0x22 大数据块） |
>
> 2. **`Tim Str P2 Server Adjust` 和 `Tim Str P2 Star Server Adjust` 的关系**：
>    - 这些是**调整值**，用于在基础 P2/P2\* 时间之上增加额外的容差。
>    - 实际 P2 = 基础 P2 + `Tim Str P2 Server Adjust`
>    - 实际 P2\* = 基础 P2\* + `Tim Str P2 Star Server Adjust`
>
> 3. **关键引用的注意事项**：
>    - `Dem Client Ref` 必须正确引用，否则 DTC 相关功能无法工作。
>    - `Dsl Protocol Rx Buffer ID` 和 `Dsl Protocol Tx Buffer ID` 必须指向有效的缓冲区实例。
>    - `Dsl Protocol SID Table` 必须指向有效的 SID 表实例。
>    - 这三个引用是 DCM 协议配置的**核心**，缺失任何一项都会导致诊断通信失败。



### DcmDslMainConnection 实例

| 参数名称                                 | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称               | 该主连接配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Dsl Addressing Type**                  | 诊断寻址类型         | 指定诊断通信使用的**寻址方式**，决定 ECU 如何识别发往自己的诊断请求。 | - **物理寻址（Physical）**：报文发往特定 ECU，仅该 ECU 响应。<br>- **功能寻址（Functional）**：报文发往一组 ECU，所有满足条件的 ECU 同时响应。<br>**必须与整车诊断设计一致**。 |
| **Dsl Channel Ready Indication Enabled** | 通道就绪指示启用     | 勾选后，当诊断通信通道准备就绪时，DCM 会向上层模块发送**通道就绪指示**，通知上层诊断通信已可用。 | 根据项目需求配置。在需要感知诊断通道状态的上层模块（如 ComM）中建议勾选。 |
| **Dsl Periodic Transmission Con Ref**    | 周期传输配置引用     | 引用用于**周期传输**的配置实例，定义诊断通信中周期消息（如周期响应）的传输参数。 | 仅在诊断通信需要周期性发送消息时配置，通常保持为空。         |
| **Dsl Physical Ecu Address**             | 物理 ECU 地址        | 该 ECU 在诊断通信中的**物理地址**，用于物理寻址时识别该 ECU。 | **必须与整车诊断规范中的分配一致**。该地址用于诊断请求报文的寻址字段。 |
| **Dsl Protocol Rx Connection Id**        | 协议接收连接 ID      | 指定该主连接对应的**协议接收连接 ID**，用于将诊断请求路由到正确的协议接收通道。 | 通常由工具自动生成，一般不需要手动修改。                     |
| **Dsl Protocol Rx Tester Source Addr**   | 协议接收测试仪源地址 | 指定诊断请求中**测试仪源地址**的配置，用于标识发送诊断请求的测试仪设备地址。 | 通常保持默认。在多测试仪场景中需要配置。                     |
| **Dsl ROE Connection Ref**               | ROE 连接引用         | 引用 **ROE（Remote OEM ECU，远程 OEM ECU）** 连接配置，用于远程诊断或 OTA 场景。 | 仅在项目支持远程诊断或 OTA 刷写时配置，通常保持为空。        |

> [!note]
>
> 1. **物理寻址 vs 功能寻址**：
>    - **物理寻址（Physical Addressing）**：诊断请求报文中的目标地址是特定 ECU 的物理地址，只有该 ECU 响应。用于一对一诊断通信。
>    - **功能寻址（Functional Addressing）**：诊断请求报文中的目标地址是功能组地址，所有属于该功能组的 ECU 同时响应。用于一对多诊断通信（如整车广播请求）。
>
> 2. **物理 ECU 地址的作用**：
>    - 在 CAN 诊断中，该地址通常对应于 CAN 报文的标识符（ID）或特定的地址字段。
>    - 在 DoIP 诊断中，该地址对应于车辆的逻辑地址。
>    - **必须与 OEM 诊断规范保持一致**。
>
> 3. **配置要点**：
>    - `Dsl Addressing Type` 和 `Dsl Physical Ecu Address` 是**整车诊断设计**的核心参数，配置错误会导致诊断通信完全失败。

### DcmDslProtocolRx_Fun 实例

| 参数名称                               | 中文直译 / 作用         | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------- | :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                         | 短名称                  | 该协议接收配置实例的唯一标识名。                             | 用于在工具中识别该配置实例，`_Fun` 后缀表示该配置用于**功能寻址（Functional）** 的诊断请求接收。 |
| **Dsl Protocol Rx Addr Type**          | 协议接收地址类型        | 指定该接收通道使用的**诊断寻址类型**。                       | - `DCM_PHYSICAL_TYPE`：物理寻址，仅接收发往本 ECU 物理地址的请求。<br>- `DCM_FUNCTIONAL_TYPE`：功能寻址，接收发往功能组地址的请求。<br>**必须与诊断通信设计一致**。 |
| **Dsl Protocol Rx Channel Id**         | 协议接收通道 ID         | 该诊断接收通道在 DCM 模块内部的**数字标识符**，用于模块内部索引和管理。 | 通常由工具自动生成，无需手动修改。                           |
| **Dsl Protocol Rx ComM Channel Ref**   | 协议接收 ComM 通道引用  | 引用 **ComM（通信管理器）** 模块中的**通道配置**，用于将诊断接收通道与 ComM 的通信控制绑定。 | **必须正确引用**，确保诊断通信能够正确控制底层 CAN 通道的开启/关闭。 |
| **Dsl Protocol Rx Global Ecu Address** | 协议接收全局 ECU 地址   | 该 ECU 在诊断通信中的**全局地址**，用于跨网络诊断路由场景。  | 通常在复杂的多网络诊断场景中配置（如 DoIP 网关路由），一般项目保持为空。 |
| **Dsl Protocol Rx Pdu Id**             | 协议接收 PDU ID         | 该诊断接收通道对应的 **PDU ID**，用于与底层通信模块（如 PduR）进行匹配和路由。 | 通常由工具自动生成，无需手动修改。                           |
| **Dsl Protocol Rx Pdu Ref**            | 协议接收 PDU 引用       | **关键引用**。指向上层（通常是 **PduR** 或 **EcuC**）中定义的 **PDU 配置实例**，将 DCM 的诊断接收通道与具体的通信 PDU 绑定。 | **必须正确引用**，否则 DCM 无法从总线上接收诊断请求。该引用决定了诊断请求报文的 CAN ID 和通信参数。 |
| **Dsl Protocol Rx Tp Rx Pdu Id**       | 协议接收 TP 接收 PDU ID | 指定该诊断接收通道对应的**传输协议（TP，Transport Protocol）接收 PDU ID**，用于支持长诊断报文的分包传输。 | 通常由工具自动生成，仅在支持 **ISO-TP（ISO 15765-2）** 分段传输时需要配置。 |

> [!note]
>
> 1. **功能寻址接收通道的特点**：
>    - `_Fun` 后缀表示该配置用于**功能寻址**，即接收发往功能组地址的诊断请求。
>    - 功能寻址通常用于整车广播请求（如 0x19 读取 DTC 信息），所有支持该功能组的 ECU 同时响应。
>    - 一个 ECU 通常同时配置物理寻址接收通道和功能寻址接收通道。
>
> 2. **物理寻址与功能寻址的对比**：
>
>    | 对比项   | 物理寻址（Physical）               | 功能寻址（Functional）     |
>    | :------- | :--------------------------------- | :------------------------- |
>    | 目标地址 | 特定 ECU 的物理地址                | 功能组的组地址             |
>    | 响应方式 | 仅目标 ECU 响应                    | 所有组内 ECU 同时响应      |
>    | 典型用途 | 一对一诊断服务（0x22、0x2E、0x31） | 整车广播服务（0x19、0x14） |
>    | 总线负载 | 低                                 | 高（多个 ECU 同时响应）    |
>
> 3. **关键引用的注意事项**：
>    - `Dsl Protocol Rx ComM Channel Ref` 确保诊断通信与 ComM 的通道管理同步，在低功耗场景中尤为重要。
>    - `Dsl Protocol Rx Pdu Ref` 决定了诊断请求报文的 CAN ID 和通信参数，**必须与整车通信矩阵一致**。



### DcmDslProtocolTx 实例

| 参数名称                       | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------- | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                 | 短名称            | 该协议发送配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsl Protocol Tx Pdu Ref**    | 协议发送 PDU 引用 | **关键引用**。指向上层（通常是 **PduR** 或 **EcuC**）中定义的 **PDU 配置实例**，将 DCM 的诊断发送通道与具体的通信 PDU 绑定。DCM 通过该 PDU 向总线发送诊断响应报文。 | **必须正确引用**，否则 DCM 无法向总线发送诊断响应。该引用决定了诊断响应报文的 CAN ID 和通信参数，**必须与整车通信矩阵一致**。 |
| **Dsl Tx Confirmation Pdu Id** | 发送确认 PDU ID   | 该参数用于配置 **发送确认（Tx Confirmation）** 的 PDU ID，当 DCM 成功发送诊断响应后，通过该 ID 通知上层模块发送已完成。 | 通常由工具自动生成，无需手动修改。                           |

> [!note]
>
> 1. **发送通道的作用**：`DcmDslProtocolTx` 是 DCM 诊断响应的**发送出口**。当 DCM 处理完诊断请求后，通过此通道将响应报文发送到总线上。
>
> 2. **与接收通道的配对关系**：
>    - `DcmDslProtocolRx`（物理/功能寻址接收通道）→ 接收来自总线的诊断请求。
>    - `DcmDslProtocolTx`（发送通道）→ 向总线发送诊断响应。
>    - 两者共同构成 DCM 完整的诊断通信通道。
>
> 3. **关键引用的注意事项**：
>    - `Dsl Protocol Tx Pdu Ref` 决定了诊断响应报文的 CAN ID，**必须与整车通信矩阵一致**。
>    - 诊断请求和响应通常使用不同的 CAN ID（或使用相同的 CAN ID，通过 PDU 方向区分），具体取决于 OEM 的诊断规范。
>    - 该 PDU 引用通常指向一个 **`EcuPduCollection`** 中定义的 PDU 实例，该实例已在 `CanIfTxPduCfgs` 中完成路由配置。



## DcmDsp

```txt
Dcm
└── DcmConfigSet
    └── DcmDsp
        ├── DcmDspDataInfos
        │   └── DataInfo实例
        ├── DcmDspDatas
        │   └── Data实例
        ├── DcmDspDidInfos
        │   └── DidInfo实例
        │       └── DcmDspDidAccess
        │           ├── DcmDspDidControl实例
        │           ├── DcmDspDidRead实例
        │           ├── DcmDspDidWrite实例
        │           └── DcmDspDidDefine实例
        ├── DcmDspDids
        │   └── Did实例
        │       └── DcmDspDidSignals
        │           └── DcmDspDidSignal实例
        ├── DcmDspPids
        │   ├── DcmDspPid实例
        │   │   ├── DcmDspPidData实例
        │   │   │   ├── DcmDspPidDataSupportInfo实例
        │   │   │   ├── DcmDspPidService01实例
        │   │   │   └── DcmDspPidService02实例
        │   │   └── DcmDspPidSupportInfo实例
        │   └── (其他Pid实例)
        ├── DcmDspRequestControls
        │   └── DcmDspRequestControl实例
        ├── DcmDspRoutineInfos
        │   └── RidInfo实例
        │       ├── DcmDspRoutineAuthorization
        │       ├── DcmDspRoutineRequestResIn
        │       │   └── DcmDspRoutineRequestResInSignals
        │       ├── DcmDspRoutineRequestResOut
        │       │   └── DcmDspRoutineRequestResOutSignals
        │       │       └── DcmDspRoutineRequestResOutSignal
        │       ├── DcmDspRoutineStopIn
        │       │   └── DcmDspRoutineStopInSignals
        │       │       └── DcmDspRoutineStopInSignal
        │       ├── DcmDspRoutineStopOut
        │       │   └── DcmDspRoutineStopOutSignals
        │       │       └── DcmDspRoutineStopOutSignal
        │       ├── DcmDspStartRoutineIn
        │       │   └── DcmDspStartRoutineInSignals
        │       │       └── DcmDspStartRoutineInSignal
        │       └── DcmDspStartRoutineOut
        │           └── DcmDspStartRoutineOutSignals
        │               └── DcmDspStartRoutineOutSignal
        ├── DcmDspRoutines
        │   └── Routine实例
        ├── DcmDspVehInfos
        │   └── DcmDspVehInfo实例
        │       └── DcmDspVehInfoData实例
        ├── ComControl
        │   ├── DcmDspComControlSetting
        │   └── DcmDspComControlAllChannels
        │       └── DcmDspComControlAllChannel
        ├── DcmDspSecurity
        │   ├── DcmDspSecurityCallbacks
        │   │   └── DcmDspSecurityCallback
        │   └── DcmDspSecurityRows
        │       └── SecurityLevel实例
        │           └── DcmDspSecurityFixedBytes
        └── DcmDspSession
            ├── DcmDspSessionCallbacks
            │   └── DcmDspSessionCallback
            └── DcmDspSessionRows
                └── Session实例
```

各子容器功能说明

| 子容器                    | 中文直译 / 惯称 | 核心功能职责                                                 | 关键配置内容举例                                             |
| :------------------------ | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **DcmDspDataInfos**       | 数据信息配置    | 定义诊断服务中使用的**数据信息（DataInfo）**，描述数据的基本属性（如数据类型、长度等）。 | 定义每个 DID 数据的元信息，如 `BootSoftwareVersionNumberDataIdentifier`、`CalibrationStatus`、`DID_21AB_Current_Extended_Rack_Travel` 等。 |
| **DcmDspDatas**           | 数据配置        | 定义诊断服务中使用的**具体数据实例**，用于存储读取或写入的数据值。 | 每个 Data 实例对应一个具体的数据对象，如 `Actual_logic_gear_shift` 用于存储实际挡位数据。 |
| **DcmDspDidInfos**        | DID 信息配置    | 配置 **DID（Data Identifier，数据标识符）** 的访问属性，定义每个 DID 的读取/写入权限。 | 包含 `DcmDspDidAccess`（访问控制）和 `DcmDspDidRead`（读取配置）等子容器。 |
| **DcmDspDids**            | DID 配置        | **核心配置**。定义每个 **DID（0x22/0x2E 服务）** 的具体内容，包括关联的 Data 和信号映射。 | 包含 `DcmDspDidSignals`（信号映射），将 DID 数据与具体的信号（如 `Actual_logic_gear_shift`）关联。 |
| **DcmDspPids**            | PID 配置        | 定义 **PID（Parameter ID，参数标识符）** 的配置，通常用于 OBD（车载诊断）服务。 | 配置 OBD 服务（如 0x01、0x02）支持的 PID 及其数据映射。      |
| **DcmDspRequestControls** | 请求控制配置    | 配置诊断请求的**控制参数**，用于控制诊断服务的执行行为。     | 通常包含请求超时、执行策略等控制参数。                       |
| **DcmDspRoutineInfos**    | 例程信息配置    | 配置 **例程（Routine，0x31 服务）** 的元信息和访问属性。     | 包含 `DcmDspRoutineAuthorization`（访问控制）、`DcmDspStartRoutineOutSignals`（启动输出信号）等子容器。 |
| **DcmDspRoutines**        | 例程配置        | **核心配置**。定义每个 **RID（Routine Identifier，例程标识符，0x31 服务）** 的具体内容。 | 列表中的每个 RID 实例（如 `RID_0206_Check_Programming_Preconditions`）对应一个具体的诊断例程。 |
| **DcmDspVehInfos**        | 车辆信息配置    | 定义 **车辆信息（Vehicle Info）** 的配置，如 VIN、软件版本等。 | 通常用于 0x22 服务读取车辆相关 DID。                         |
| **ComControl**            | 通信控制配置    | 配置 **通信控制（0x28 服务）** 的行为，用于启用/禁用特定通信通道。 | 包含 `DcmDspComControlAllChannels`（所有通道控制）等子容器。 |
| **DcmDspSecurity**        | 安全访问配置    | 配置 **安全访问（0x27 服务）** 的安全等级、种子/密钥算法和回调函数。 | - `DcmDspSecurityRows`：定义安全等级（如 level3、level13）。<br>- `DcmDspSecurityCallbacks`：定义种子/密钥计算的回调函数。 |
| **DcmDspSession**         | 会话配置        | 配置 **诊断会话（0x10 服务）** 的会话类型、切换逻辑和回调函数。 | - `DcmDspSessionRows`：定义会话类型（Default、Extended、Programming）。<br>- `DcmDspSessionCallbacks`：定义会话切换的回调函数。 |

各配置之间的关系

```txt
DcmDsd（服务分发）
    │
    ├── DcmDspSession（会话配置）──── 被 Dsd 引用，控制服务在哪些会话下可用
    │
    ├── DcmDspSecurity（安全配置）──── 被 Dsd 引用，控制服务需要哪个安全等级
    │
    ├── DcmDspDids（DID 配置）──────── 被 Dsd 的 ReadDataById/WriteDataById 引用
    │   └── DcmDspDidSignals
    │       └── Signal ────────────── 关联到 Com 模块的信号
    │
    ├── DcmDspRoutines（例程配置）──── 被 Dsd 的 RoutineControl 引用
    │   └── DcmDspRoutineInfos
    │       └── DcmDspStartRoutineOutSignals ─── 关联到 Com 模块的信号
    │
    ├── ComControl（通信控制）──────── 被 Dsd 的 CommunicationControl 引用
    │
    └── DcmDspDataInfos / Datas ────── 被 Dids 和 Routines 引用，定义数据内容
```



### DcmDsp

`DcmDsp` 是 DCM 模块中 **诊断服务处理单元（Diagnostic Service Processing Unit）** 的顶层容器，负责配置与具体诊断服务执行相关的**全局行为参数**，包括 DID/RID 查找策略、分页数据读取、RTE 通信控制等。

| 参数名称                                                     | 中文直译 / 作用                    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                               | 短名称                             | 该配置实例的唯一标识名。                                     | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Look Up Filter Enabled**                           | DID 查找过滤启用                   | 勾选后，DCM 在查找 DID 时会启用**过滤机制**，仅返回满足特定条件的 DID（如当前会话下可用的 DID）。 | 通常勾选，以确保诊断服务在不同会话/安全状态下的行为正确。    |
| **Dsp Dynamically Defined Did Check Condition Read Per Source Did** | 动态定义 DID 按源 DID 检查条件读取 | 勾选后，DCM 在读取**动态定义 DID** 时，会按**源 DID** 逐一检查其读取条件。 | 仅在项目使用了**动态 DID**（运行时动态创建/修改的 DID）时才需要关注，一般项目保持默认。 |
| **Dsp Dynamically Defined Did Check Per Source Did**         | 动态定义 DID 按源 DID 检查         | 勾选后，DCM 在处理动态定义的 DID 时，会按**源 DID** 逐一执行检查逻辑。 | 与上一个参数配合使用，仅在动态 DID 场景中需要关注。          |
| **Dsp Dynamically Defined Did Clear On State Change**        | 状态变化时清除动态定义 DID         | 勾选后，当诊断会话或安全状态发生变化时，DCM 会**清除**所有动态定义的 DID。 | 建议勾选，确保状态切换后动态 DID 数据的一致性，防止旧数据被误用。 |
| **Dsp Max Did To Read**                                      | 最大 DID 读取数量                  | 指定一次 `0x22（通过 ID 读取数据）` 请求中，允许读取的**最大 DID 数量**。 | 根据 OEM 诊断规范配置，UDS 标准建议值为 `0x0A`（10 个），但可酌情调整。 |
| **Dsp Max Periodic Did To Read**                             | 最大周期 DID 读取数量              | 指定**周期读取**场景下，允许读取的**最大 DID 数量**。        | 通常与 `Dsp Max Did To Read` 保持一致或略小，根据项目需求配置。 |
| **Dsp Power Down Time**                                      | 断电时间                           | 指定诊断模块在收到**断电请求**后，等待完成当前诊断操作的**超时时间**，以毫秒为单位。 | 根据项目需求配置，确保诊断操作在断电前能够完整完成。         |
| **Dsp Read DID Reports NODI Byte**                           | 读取 DID 报告 NODI 字节            | 勾选后，DCM 在读取 DID 时，会报告 **NODI（No Data Identifier，无数据标识符）** 字节，用于指示该 DID 不存在或无效。 | 通常保持默认（不勾选），根据 OEM 诊断规范决定。              |
| **Dsp Read Paged Data Page Size [Byte]**                     | 读取分页数据页大小                 | 指定 **分页读取** 场景下，每页数据的**大小**，以字节为单位。用于支持大数据块的 DID 分页读取。 | 仅在 DID 数据量超过单帧 CAN 报文负载能力时需要配置，通常与底层 TP（传输协议）的分页参数匹配。 |
| **Dsp Rid Look Up Filter Enabled**                           | RID 查找过滤启用                   | 勾选后，DCM 在查找 RID（例程标识符）时会启用**过滤机制**，仅返回满足特定条件的 RID（如当前会话下可用的例程）。 | 通常勾选，以确保诊断服务在不同会话/安全状态下的行为正确。    |
| **Dsp Rte Implicit Com Enabled**                             | RTE 隐式通信启用                   | 勾选后，DCM 与 SWC（应用层软件组件）之间的通信使用 **RTE 隐式通信** 方式（即通过 RTE 的隐式 API 访问数据）。 | 根据项目架构决定。如果不勾选，则使用**显式通信**方式。       |

> [!note]
>
> 1. **DID 查找过滤的作用**：在复杂诊断场景中，某些 DID 仅在特定会话（如扩展会话）或特定安全等级下才可访问。启用查找过滤后，DCM 会自动根据当前会话/安全状态过滤掉不可用的 DID。
>
> 2. **分页读取的适用场景**：当 DID 数据长度超过底层通信协议（如 CAN）的单帧最大传输能力时（如读取超过 8 字节的 VIN 码），需要通过分页机制读取。`Dsp Read Paged Data Page Size` 定义了每页的大小，配合 0x22 服务的分页读取子功能使用。
>
> 3. **动态 DID 的典型应用**：动态 DID 用于支持运行时动态创建或修改的 DID，如诊断刷写过程中的临时数据缓冲区。`Dsp Dynamically Defined Did Clear On State Change` 确保状态切换时这些临时数据被正确清理。
>
> 4. **Dsp Max Did To Read 的典型值**：
>    - UDS 标准定义最大值为 `0x0A`（10 个）。
>    - 实际项目中可根据总线负载和响应时间要求调整。
>    - 配置过大会导致诊断响应超出底层通信协议（如 CAN TP）的最大传输能力。

### 数据单元

#### DataInfo实例

`DcmDspDataInfos` 下的每个实例用于定义诊断服务中使用的**数据信息（DataInfo）**，描述数据的基本属性（如数据类型、长度、缩放信息等）。DataInfo 是 DID 和 Routine 数据的基础定义单元。

| 参数名称                              | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------ | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                        | 短名称           | 该 DataInfo 配置实例的唯一标识名。                           | 用于在工具中识别该配置实例，通常表示该数据的具体含义（如 `BootSoftwareVersionNumberDataIdentifier_BootSoftwareVersionNumber_HighByte` 表示 Boot 软件版本号的高字节数据信息）。 |
| **Dsp Data Fixed Length**             | 数据固定长度     | 勾选后，表示该数据使用**固定长度**，即数据长度在配置时已确定，不会在运行时变化。 | 绝大多数诊断数据都是固定长度的，因此通常勾选。如果不勾选，则表示数据长度可变，需配合其他参数动态确定。 |
| **Dsp Data Scaling Info Size [Byte]** | 数据缩放信息大小 | 指定该数据的**缩放信息（Scaling Info）** 所占用的**字节数**。缩放信息用于描述数据的物理值转换规则（如斜率、偏移量等），通常与 Com 模块的信号缩放属性关联。 | 根据项目需求配置。如果数据不需要缩放转换，保持为 0。如果需要在诊断层面进行物理值转换，则根据缩放信息的实际长度配置。 |

> [!note]
>
> 1. **DataInfo 的作用**：DataInfo 是 DCM 模块中数据定义的**最小单元**，它描述了数据的存储格式和属性。`DcmDspDids` 和 `DcmDspRoutines` 中的 DID/RID 会引用 DataInfo 来定义其数据内容。
>
> 2. **DataInfo 与 Data 的关系**：
>    - `DcmDspDataInfos`：定义数据的**元信息**（类型、长度、缩放等），是“模板”。
>    - `DcmDspDatas`：定义数据的**具体实例**，是“实际存储位置”。
>
> 3. **固定长度 vs 可变长度**：
>    - **固定长度（Fixed Length）**：数据长度在编译时已知，如大多数标定参数、状态值等。
>    - **可变长度（Variable Length）**：数据长度在运行时动态变化，如某些诊断缓冲区或字符串数据。

#### DcmDspData实例

`DcmDspDatas` 下的每个实例用于定义诊断服务中使用的**具体数据实例**，它引用了 `DataInfo` 中定义的元信息，并关联到实际的**数据源**（如 ECU 信号、常量值或回调函数），是诊断数据访问的**实际执行单元**。

| 参数名称                                                 | 中文直译 / 作用          | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------- | :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                           | 短名称                   | 该 Data 配置实例的唯一标识名。                               | 用于在工具中识别该配置实例。                                 |
| **Dsp Data Block Id Ref**                                | 数据块 ID 引用           | 引用该数据所属的**数据块（Data Block）** 配置，用于将多个数据组织为一个数据块进行统一管理。 | 通常在复杂诊断数据结构中使用，简单项目中保持为空。           |
| **Dsp Data Condition Check Read Fnc**                    | 条件检查读取函数         | 指定在执行读取操作前，用于**检查读取条件**的回调函数名称。该函数返回是否允许执行读取操作。 | 仅在读取操作需要前置条件检查时配置（如检查当前状态是否允许读取该数据）。一般保持为空。 |
| **Dsp Data Condition Check Read Fnc Used**               | 条件检查读取函数已使用   | 勾选后，表示该 Data 已配置了读取条件检查函数（即 `Dsp Data Condition Check Read Fnc` 已配置且有效）。 | 如果配置了读取条件检查函数，则需勾选此参数以启用该功能。     |
| **Dsp Data Constant Value**                              | 数据常量值               | 指定该数据的**常量值**。当数据来源为常量时，DCM 直接返回此值。 | 仅在数据为固定常量时配置（如固定版本号）。如果数据来自信号或回调函数，则保持为空。 |
| **Dsp Data Constant Value Type**                         | 数据常量值类型           | 指定 `Dsp Data Constant Value` 的**数据类型**。              | 与 `Dsp Data Constant Value` 配合使用，可选类型如 `UINT8`、`UINT16`、`SINT8`、`FLOAT32` 等。 |
| **Dsp Data Ecu Signal**                                  | ECU 信号                 | **关键关联**。关联到 **Com 模块**中定义的**信号（Signal）**，该 Data 的值来源于此信号。 | 这是诊断数据与通信信号之间的**核心绑定**，通过此参数实现诊断读取应用信号值。如果数据来自信号，则必须正确引用。 |
| **Dsp Data Endianness**                                  | 数据大小端               | 指定该数据的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Data Freeze Current State Fnc**                    | 冻结当前状态函数         | 指定用于**冻结当前状态**的回调函数名称。在需要保持当前数据状态时调用。 | 通常用于诊断数据快照功能，一般保持为空。                     |
| **Dsp Data Get Scaling Info Fnc**                        | 获取缩放信息函数         | 指定用于**获取缩放信息**的回调函数名称，用于动态获取数据的物理值转换规则。 | 仅在数据的缩放信息需要在运行时动态确定时配置，一般保持为空。 |
| **Dsp Data Info Ref**                                    | 数据信息引用             | **关键引用**。引用 `DcmDspDataInfos` 中定义的 **DataInfo 实例**，为该 Data 提供元信息（数据类型、长度等）。 | **必须正确引用**，否则该 Data 实例缺少类型和长度定义，会导致生成代码失败。 |
| **Dsp Data Read Data Length Fnc**                        | 读取数据长度函数         | 指定用于**读取数据长度**的回调函数名称。仅在数据长度可变时使用。 | 仅在数据为**可变长度**时才需要配置。如果数据长度固定（`DataInfo` 中已定义），则保持为空。 |
| **Dsp Data Read Ecu Signal**                             | 读取 ECU 信号            | 与 `Dsp Data Ecu Signal` 类似，用于指定读取数据时关联的 ECU 信号。 | 通常与 `Dsp Data Ecu Signal` 配合使用，一般情况只需配置 `Dsp Data Ecu Signal` 即可。 |
| **Dsp Data Read Fnc**                                    | 读取函数                 | 指定用于**读取数据**的回调函数名称。当数据需要自定义读取逻辑时配置。 | 如果数据直接来自信号或常量，则无需配置。仅在需要自定义读取逻辑（如读取硬件寄存器）时使用。 |
| **Dsp Data Reset To Default Fnc**                        | 重置为默认值函数         | 指定用于**重置数据为默认值**的回调函数名称。                 | 仅在需要支持数据重置功能时配置（如清除诊断数据、恢复默认参数等），一般保持为空。 |
| **Dsp Data Return Control To Ecu Fnc**                   | 返回控制权给 ECU 函数    | 指定用于**将控制权返回给 ECU** 的回调函数名称。              | 通常用于诊断例程执行后恢复 ECU 的正常控制流程，一般保持为空。 |
| **Dsp Data Short Term Adjustment Fnc**                   | 短期调整函数             | 指定用于**短期数据调整**的回调函数名称。                     | 通常用于诊断过程中的临时数据修改，一般保持为空。             |
| **Dsp Data Size [Bit]**                                  | 数据大小                 | 指定该数据的**大小**，以**比特（Bit）** 为单位。             | 此值应与 `DataInfo` 中定义的长度一致。                       |
| **Dsp Data System Template Diagnostic Data Element Ref** | 系统模板诊断数据元素引用 | 引用 **系统模板（System Template）** 中定义的诊断数据元素，用于与系统模板集成。 | 通常保持为空，仅在使用了系统模板的标准化项目中配置。         |
| **Dsp Data Type**                                        | 数据类型                 | 指定该数据的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32`、`ARRAY` 等。**必须与实际数据匹配**。 |
| **Dsp Data Typed Data Interface Enabled**                | 类型化数据接口启用       | 勾选后，启用 **类型化数据接口**，使用 RTE 的类型化接口访问数据。 | 根据项目架构决定。使用类型化接口可以提供更好的类型安全性。   |
| **Dsp Data Use Port**                                    | 数据使用端口             | 指定该数据访问时使用的 **RTE 端口类型**。                    | - `USE_DATA_ASYNCH_CLIENT_SERVER`：使用异步客户端/服务器端口。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：使用同步客户端/服务器端口。<br>- `USE_DATA_SENDER_RECEIVER`：使用发送器/接收器端口。<br>根据项目架构选择。 |
| **Dsp Data Write Fnc**                                   | 写入函数                 | 指定用于**写入数据**的回调函数名称。当数据需要自定义写入逻辑时配置。 | 如果数据直接写入信号或常量，则无需配置。仅在需要自定义写入逻辑（如写入硬件寄存器）时使用。 |

> [!note]
>
> 1. **Data 的核心作用**：Data 是 DCM 中**诊断数据访问的实际执行单元**。它通过引用 DataInfo 获得数据类型和长度信息，通过引用 Ecu Signal 或回调函数获取实际数据值。
>
> 2. **数据来源的三种方式**：
>    - **来自 Com 信号**：通过 `Dsp Data Ecu Signal` 关联到 Com 模块中的信号，数据值来自总线通信。
>    - **来自常量值**：通过 `Dsp Data Constant Value` 配置固定值，数据值为编译时常量。
>    - **来自回调函数**：通过 `Dsp Data Read Fnc` / `Dsp Data Write Fnc` 配置自定义函数，数据值由用户代码动态生成或处理。
>
> 3. **Data 与 DataInfo 的关系**：
>    - `DataInfo`：定义“数据长什么样”（类型、长度、缩放等元信息），是模板。
>    - `Data`：定义“数据从哪里来”（信号、常量、回调），是实例。
>    - **两者通过 `Dsp Data Info Ref` 关联。**
>
> 4. **数据大小端的重要性**：AUTOSAR 默认使用大端（Motorola）格式，但如果 ECU 的通信矩阵中使用小端（Intel）格式，则需要将 `Dsp Data Endianness` 配置为 `LITTLE_ENDIAN`，否则数据解析会出错。

### DID

#### DidInfo实例

`DcmDspDidInfos` 下的每个实例用于配置 **DID（Data Identifier，数据标识符）** 的访问属性，定义每个 DID 的读取/写入权限和行为。`DidInfo` 是连接 `DcmDsd`（服务分发）与 `DcmDspDids`（具体 DID 配置）之间的桥梁。

| 参数名称                        | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------ | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                  | 短名称          | 该 DidInfo 配置实例的唯一标识名。                            | 用于在工具中识别该配置实例，通常与对应的 DID 名称一致。      |
| **Dsp Did Dynamically Defined** | DID 动态定义    | 勾选后，表示该 DID 是**动态定义的**，即在运行时可以动态创建、修改或删除该 DID 及其数据内容。 | 仅在项目支持**动态 DID** 功能时勾选（如诊断刷写过程中的临时数据缓存）。绝大多数 DID 是静态定义的，保持不勾选。 |

> [!note]
>
> 1. **DidInfo 的作用**：`DidInfo` 是 DCM 中 DID 配置的**信息层**，用于描述 DID 的属性和访问控制信息。它被 `DcmDsd` 中的 `ReadDataById` / `WriteDataById` 服务引用，以确定该 DID 是否可用以及如何访问。
>
> 2. **DidInfo 与 Dids 的关系**：
>    - `DcmDspDidInfos`：定义 DID 的**访问属性**（如是否动态定义），是“元信息层”。
>    - `DcmDspDids`：定义 DID 的**具体内容**（关联的 Data、信号映射等），是“实现层”。
>    - 两者通过**名称**或**引用**关联。
>
> 3. **动态 DID 的典型应用场景**：
>    - 诊断刷写（FOTA）过程中，临时存储接收到的刷写数据块。
>    - 运行时生成诊断数据（如实时计算的状态值）。
>    - 测试仪临时写入数据以供后续读取。
>
> 4. **动态 DID 与静态 DID 的对比**：
>
>    | 对比项   | 静态 DID                   | 动态 DID                     |
>    | :------- | :------------------------- | :--------------------------- |
>    | 定义时机 | 编译时                     | 运行时                       |
>    | 数据来源 | Com 信号 / 常量 / 固定回调 | 运行时动态绑定               |
>    | 内存分配 | 静态分配                   | 动态分配（需额外内存管理）   |
>    | 典型用途 | 版本号、状态值、标定参数   | 刷写数据缓存、运行时诊断数据 |

#### DcmDspDidControl实例

`DcmDspDidControl` 用于配置 **DID（数据标识符）的访问控制属性**，定义在读取或写入 DID 时的行为控制，包括数据冻结、重置、控制权转移等机制。

| 参数名称                                     | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                               | 短名称                 | 该 DID 控制配置实例的唯一标识名。                            | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Control Mask**                     | DID 控制掩码           | 指定 DID 的**控制掩码**，用于定义对该 DID 执行的操作类型（如读取、写入、内部访问等）。 | - `DCM_CONTROLMASK_INTERNAL`：内部访问，仅供 DCM 内部使用。<br>- `DCM_CONTROLMASK_READ`：允许读取。<br>- `DCM_CONTROLMASK_WRITE`：允许写入。<br>- 可通过组合掩码实现多种操作权限。 |
| **Dsp Did Control Mask Size [Byte]**         | DID 控制掩码大小       | 指定 `Dsp Did Control Mask` 的**数据大小**，以字节为单位。   | 通常保持默认，由工具根据掩码配置自动确定。                   |
| **Dsp Did Control Mode Rule Ref**            | DID 控制模式规则引用   | 引用该 DID 所处的**诊断模式规则**，用于定义该 DID 在哪些诊断模式下可用。 | 通常保持默认，不常修改。                                     |
| **Dsp Did Freeze Current State**             | 冻结当前状态           | 勾选后，表示在读取该 DID 时，会**冻结当前状态**，即读取操作不会修改数据的当前值，而是返回一个“快照”。 | 通常在需要读取一致性数据快照时勾选（如读取一组关联 DID 时）。 |
| **Dsp Did Reset To Default**                 | 重置为默认值           | 勾选后，表示该 DID 支持**重置为默认值**操作，即在特定条件下将数据恢复为默认值。 | 在 DID 数据支持恢复出厂设置或默认值时勾选。                  |
| **Dsp Did Return Control To Ecu**            | 返回控制权给 ECU       | 勾选后，表示在完成该 DID 的读写操作后，**将控制权返回给 ECU**，允许 ECU 恢复正常运行。 | 通常在诊断操作完成后需要恢复 ECU 正常控制流程时勾选。        |
| **Dsp Did Short Term Adjustment**            | 短期调整               | 勾选后，表示该 DID 支持**短期调整**，即允许对数据进行临时修改，且修改不持久化。 | 通常在诊断标定或调试场景中使用，量产版本一般不需要勾选。     |
| **Dsp Did Control Role Ref**                 | DID 控制角色引用       | 指定该 DID 控制配置的**角色（Role）**，用于更细粒度的访问控制。 | 通常保持为空，使用默认角色。                                 |
| **Dsp Did Control Security Level Ref**       | DID 控制安全等级引用   | 引用该 DID 控制操作所需的**安全访问等级**。只有通过了对应安全等级验证的测试仪才能执行对该 DID 的控制操作。 | 如果该 DID 的读写操作需要安全解锁，则在此引用对应的 `DcmSecurityLevel`。如果无需安全验证，则保持为空。 |
| **Dsp Did Control Session Ref**              | DID 控制会话等级引用   | 引用该 DID 控制操作可用的**诊断会话等级**。只有处于指定会话状态下，测试仪才能对该 DID 执行控制操作。 | 如果该 DID 仅在特定会话下可用（如扩展会话），则在此引用对应的会话配置。如果所有会话下均可使用，则保持为空。 |
| **Dsp Did Control Vehicle System Group Ref** | DID 控制车辆系统组引用 | 用于定义该 DID 控制操作属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **DID 控制的作用**：`DcmDspDidControl` 定义了 DID 在诊断访问时的**行为属性**，它补充了 `DidInfo` 中的访问控制信息，提供了更细粒度的操作控制。
>
> 2. **冻结、重置、控制权转移的典型应用场景**：
>    - **Freeze Current State**：在读取一组关联的 DID 时，先冻结所有数据，确保读取的数据来自同一时刻（如读取故障快照时）。
>    - **Reset To Default**：在执行 ECU 重置或恢复出厂设置时，将 DID 数据恢复为默认值。
>    - **Return Control To ECU**：在诊断操作完成后，让 ECU 恢复正常控制流程。
>    - **Short Term Adjustment**：在标定或调试过程中，临时修改数据值以测试 ECU 行为。
>
> 3. **与其他 DID 配置的关系**：
>    - `DidInfo` → 定义 DID 的**基本属性**（是否动态定义）。
>    - `DcmDspDidControl` → 定义 DID 的**行为控制**（冻结、重置、短期调整等）。
>    - `DcmDspDidRead` / `DcmDspDidWrite` → 定义 DID 的**具体读写操作**（数据源、格式等）。
>    - 三者共同构成一个完整的 DID 配置。

#### DcmDspDidRead 实例

`DcmDspDidRead` 用于配置 **DID 的读取操作行为**，定义在读取该 DID 时的访问控制规则。

| 参数名称                                  | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                            | 短名称                 | 该 DID 读取配置实例的唯一标识名。                            | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Read Mode Rule Ref**            | DID 读取模式规则引用   | 引用该 DID 读取操作所处的**诊断模式规则**，用于定义该读取操作在哪些诊断模式下可用。 | 通常保持默认，不常修改。                                     |
| **Dsp Did Read Role Ref**                 | DID 读取角色引用       | 指定该 DID 读取操作的**角色（Role）**，用于更细粒度的访问控制。 | 通常保持为空，使用默认角色。                                 |
| **Dsp Did Read Security Level Ref**       | DID 读取安全等级引用   | 引用执行该 DID 读取操作所需的**安全访问等级**。只有通过了对应安全等级验证的测试仪才能读取该 DID。 | 如果该 DID 的读取操作需要安全解锁，则在此引用对应的 `DcmSecurityLevel`。如果无需安全验证，则保持为空。 |
| **Dsp Did Read Session Ref**              | DID 读取会话等级引用   | 引用该 DID 读取操作可用的**诊断会话等级**。只有处于指定会话状态下，测试仪才能读取该 DID。 | 如果该 DID 仅在特定会话下可读（如仅在扩展会话下可读），则在此引用对应的会话配置。截图中引用 `Default` 和 `Extended`，表示在默认和扩展会话下均可读取。 |
| **Dsp Did Read Vehicle System Group Ref** | DID 读取车辆系统组引用 | 用于定义该 DID 读取操作属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **DcmDspDidRead 与 DcmDspDidControl 的分工**：
>    - `DcmDspDidControl`：定义 DID 的**行为属性**（如冻结、重置、短期调整等）。
>    - `DcmDspDidRead`：定义 DID 的**读取访问控制**（如需要什么会话/安全等级才能读取）。
>    - 两者共同构成 DID 的完整访问控制策略。
>
> 2. **典型配置示例**：
>    - **版本信息 DID**：在 Default 和 Extended 会话下均可读取，无需安全解锁。
>    - **安全敏感 DID**：仅在 Extended 会话下可读，且需要 Security Level 1 解锁。
>    - **刷写相关 DID**：仅在 Programming 会话下可读，需要较高的安全等级。



#### DcmDspDidWrite 实例

`DcmDspDidWrite` 用于配置 **DID 的写入操作行为**，定义在写入该 DID 时的访问控制规则。

| 参数名称                                   | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                             | 短名称                 | 该 DID 写入配置实例的唯一标识名。                            | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Write Mode Rule Ref**            | DID 写入模式规则引用   | 引用该 DID 写入操作所处的**诊断模式规则**，用于定义该写入操作在哪些诊断模式下可用。 | 通常保持默认，不常修改。                                     |
| **Dsp Did Write Role Ref**                 | DID 写入角色引用       | 指定该 DID 写入操作的**角色（Role）**，用于更细粒度的访问控制。 | 通常保持为空，使用默认角色。                                 |
| **Dsp Did Write Security Level Ref**       | DID 写入安全等级引用   | 引用执行该 DID 写入操作所需的**安全访问等级**。只有通过了对应安全等级验证的测试仪才能写入该 DID。 | 如果该 DID 的写入操作需要安全解锁（大多数 0x2E 写入 DID 的场景），则在此引用对应的 `DcmSecurityLevel`。如果无需安全验证，则保持为空。 |
| **Dsp Did Write Session Ref**              | DID 写入会话等级引用   | 引用该 DID 写入操作可用的**诊断会话等级**。只有处于指定会话状态下，测试仪才能写入该 DID。 | 如果该 DID 仅在特定会话下可写（如仅在扩展会话或编程会话下可写），则在此引用对应的会话配置。如果所有会话下均可写入，则保持为空。 |
| **Dsp Did Write Vehicle System Group Ref** | DID 写入车辆系统组引用 | 用于定义该 DID 写入操作属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **读取与写入的访问控制通常是独立的**：
>    - 一个 DID 可能在 Default 会话下可读，但需要 Extended 会话 + Security Level 才能写入（如标定参数）。
>    - 某些 DID 只读不可写（如版本号），此时 `DcmDspDidWrite` 的引用全部保持为空，实际上该 DID 不支持写入。
>
> 2. **典型配置示例**：
>
>    | DID 类型     | 读取会话           | 写入会话       | 读取安全等级    | 写入安全等级    |
>    | :----------- | :----------------- | :------------- | :-------------- | :-------------- |
>    | 版本号 DID   | Default + Extended | （不支持写入） | 无              | 无              |
>    | 标定参数 DID | Default + Extended | Extended       | 无              | SecurityLevel_1 |
>    | 安全敏感 DID | Extended           | Programming    | SecurityLevel_1 | SecurityLevel_3 |
>
> 3. **与 DcmDspDidControl 的关系**：
>    - `DcmDspDidControl`：定义 DID 的**行为属性**（冻结、重置、短期调整等）。
>    - `DcmDspDidRead`：定义 DID 的**读取访问控制**。
>    - `DcmDspDidWrite`：定义 DID 的**写入访问控制**。
>    - 三者共同构成一个 DID 的完整配置。

#### DcmDspDidDefine 实例

`DcmDspDidDefine` 用于配置 **动态 DID（Dynamically Defined DID）** 的定义参数，控制动态 DID 的运行时行为。

| 参数名称                                               | 中文直译 / 作用           | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------------- | :------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                         | 短名称                    | 该动态 DID 定义配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Dynamically Defined Did Max Number of Elements** | 动态定义 DID 最大元素数量 | 指定该动态 DID 能够包含的**最大元素数量**，即该 DID 最多可以存储多少个数据元素。 | 根据项目需求配置，需考虑 RAM 资源的限制。配置过大会浪费内存，配置过小可能导致运行时无法存储所需数据。 |

> [!note]
>
> 1. **动态 DID 的典型应用**：动态 DID 支持在运行时动态创建、修改或删除 DID 及其数据内容，常用于诊断刷写过程中的临时数据缓存、运行时生成的诊断数据等场景。
>
> 2. **元素数量的含义**：一个动态 DID 可以包含多个数据元素（如数组形式），`Max Number of Elements` 限制了该 DID 最多能容纳的元素个数，每个元素对应一个独立的数据值。
>
> 3. **资源考虑**：动态 DID 需要额外的 RAM 来管理动态数据，因此需要在配置时合理规划 `Max Number of Elements` 的值，在满足功能需求的同时避免内存浪费。

#### DcmDspDidRange 实例

`DcmDspDidRange` 用于配置 **DID 范围（DID Range）** 的属性。DID 范围通常用于定义一组连续的 DID（如从 0x2000 到 0x20FF），并统一配置这些 DID 的访问行为，避免逐个 DID 重复配置。

| 参数名称                                 | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称                 | 该 DID 范围配置实例的唯一标识名。                            | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Range Has Gaps**               | DID 范围存在间隙       | 勾选后，表示该 DID 范围内**存在间隙（Gaps）**，即范围内的某些 DID 无效或不支持访问。当测试仪请求这些 DID 时，DCM 会返回 NRC 0x31（请求超出范围）。 | 如果范围内的 DID 不连续，则勾选此参数。如果范围内所有 DID 均有效且连续，则不勾选。 |
| **Dsp Did Range Identifier Lower Limit** | DID 范围标识符下限     | 指定该 DID 范围的**起始 DID 标识符**（下限值）。             | **必须配置**，定义该范围的起始 DID。                         |
| **Dsp Did Range Identifier Upper Limit** | DID 范围标识符上限     | 指定该 DID 范围的**结束 DID 标识符**（上限值）。             | **必须配置**，定义该范围的结束 DID。                         |
| **Dsp Did Range Info Ref**               | DID 范围信息引用       | 引用 `DcmDspDidInfos` 中定义的 **DidInfo 实例**，为该范围内的所有 DID 提供访问属性信息。 | 如果该范围内的所有 DID 共享相同的访问属性，则可以通过此引用统一配置。 |
| **Dsp Did Range Is Did Available Fnc**   | DID 范围可用性检查函数 | 指定用于**检查某个 DID 是否可用**的回调函数名称。当测试仪请求范围内的某个 DID 时，DCM 调用此函数判断该 DID 当前是否可用。 | 仅在 DID 的可用性需要在运行时动态判断时配置。如果所有 DID 固定可用，则保持为空。 |
| **Dsp Did Range Max Data Length [Byte]** | DID 范围最大数据长度   | 指定该 DID 范围内所有 DID 的**最大数据长度**，以字节为单位。 | 用于内存分配和缓冲区管理。**必须正确配置**，确保能够容纳范围内所有 DID 的数据。 |
| **Dsp Did Range Read Did Fnc**           | DID 范围读取函数       | 指定用于**读取该范围内 DID 数据**的回调函数名称。当测试仪请求读取范围内的某个 DID 时，DCM 调用此函数获取数据。 | 如果范围内的 DID 数据读取需要自定义逻辑，则在此配置对应的回调函数。 |
| **Dsp Did Range Use Port**               | DID 范围使用端口       | 指定该 DID 范围访问时使用的 **RTE 端口类型**。               | - `USE_DATA_ASYNCH_CLIENT_SERVER`：使用异步客户端/服务器端口。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：使用同步客户端/服务器端口。<br>- `USE_DATA_SENDER_RECEIVER`：使用发送器/接收器端口。<br>根据项目架构选择。 |
| **Dsp Did Range Write Did Fnc**          | DID 范围写入函数       | 指定用于**写入该范围内 DID 数据**的回调函数名称。当测试仪请求写入范围内的某个 DID 时，DCM 调用此函数执行写入操作。 | 如果范围内的 DID 数据写入需要自定义逻辑，则在此配置对应的回调函数。 |

> [!note]
>
> 1. **DID 范围的典型应用场景**：
>    - 将一组相关的 DID（如所有标定参数 DID）组织为一个范围，统一管理。
>    - 减少重复配置工作量，提高配置效率。
>    - 支持 OEM 定义的 DID 地址空间管理。
>
> 2. **有间隙的 DID 范围**：当 `Dsp Did Range Has Gaps` 勾选时，范围内的某些 DID 可能是无效的（如 0x2000-0x20FF 中 0x20A0-0x20AF 未定义）。DCM 在处理请求时会通过 `Dsp Did Range Is Did Available Fnc` 回调函数动态判断该 DID 是否可用。
>
> 3. **与单个 DID 配置的关系**：
>    - `DcmDspDidRange` 用于**批量配置**一组 DID。
>    - 如果某个 DID 需要独立的特殊配置（如单独的安全等级或会话控制），则可以单独创建 `DcmDspDidControl` / `DcmDspDidRead` / `DcmDspDidWrite` 配置覆盖范围配置。

#### Did实例

`DcmDspDids` 下的每个实例用于定义 **DID（Data Identifier，数据标识符）** 的具体内容，是 DID 配置的**实现层**。它将 DID 标识符与 DataInfo、Data 实例以及访问端口关联起来，完成 DID 的完整定义。

| 参数名称                                                   | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                             | 短名称                     | 该 DID 配置实例的唯一标识名。                                | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Identifier**                                     | DID 标识符                 | 该 DID 的**数字标识符**，即 UDS 协议中 0x22/0x2E 服务使用的 DID 值（16 位）。 | **必须与整车诊断规范中的定义完全一致**。                     |
| **Dsp Did Info Ref**                                       | DID 信息引用               | **关键引用**。引用 `DcmDspDidInfos` 中定义的 **DidInfo 实例**，为该 DID 提供访问属性信息。 | **必须正确引用**，否则该 DID 缺少访问属性定义。              |
| **Dsp Did Ref**                                            | DID 数据引用               | **关键引用**。引用 `DcmDspDatas` 中定义的 **Data 实例**，为该 DID 关联实际的数据来源（信号、常量或回调函数）。 | **必须正确引用**，否则该 DID 没有实际数据可读取/写入。       |
| **Dsp Did Roe Queue Enabled**                              | ROE 队列启用               | 勾选后，表示该 DID 支持 **ROE（Remote OEM ECU，远程 OEM ECU）** 队列机制，用于远程诊断或 OTA 场景中的请求排队。 | 仅在项目支持远程诊断或 OTA 时配置，一般项目保持不勾选。      |
| **Dsp Did System Template Diagnostic Data Identifier Ref** | 系统模板诊断数据标识符引用 | 引用 **系统模板（System Template）** 中定义的诊断数据标识符，用于与系统模板集成。 | 通常保持为空，仅在使用了系统模板的标准化项目中配置。         |
| **Dsp Did Use Port**                                       | DID 使用端口               | 指定该 DID 访问时使用的 **RTE 端口类型**。                   | - `USE_DATA_ASYNCH_CLIENT_SERVER`：异步客户端/服务器。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：同步客户端/服务器。<br>- `USE_DATA_SENDER_RECEIVER`：发送器/接收器。<br>- `USE_DATA_ELEMENT_SPECIFIC_INTERFACES`：使用数据元素特定接口。<br>根据项目架构选择。 |
| **Dsp Did Used**                                           | DID 是否启用               | 勾选后，表示该 DID 在项目中**启用**。                        | **必须勾选**，否则该 DID 不会生效，测试仪请求时会返回 NRC 0x11（服务不支持）或 0x31（请求超出范围）。 |

> [!note]
>
> 1. **DID 的完整配置链路**：
>    - `Dsp Did Identifier` → 定义 DID 的**数值**（如 `0xF105`），对应 UDS 协议中的 DID。
>    - `Dsp Did Info Ref` → 引用 **DidInfo**，定义 DID 的**访问属性**（是否动态定义）。
>    - `Dsp Did Ref` → 引用 **Data**，定义 DID 的**数据来源**（信号/常量/回调）。
>
> 2. **DID 数值的约定**：
>    - UDS 标准中 DID 为 **16 位**（0x0000 - 0xFFFF）。
>    - 部分范围有特殊含义：0xF000 - 0xFFFF 通常保留给 OEM 或供应商自定义。
>
> 3. **USE_DATA_ELEMENT_SPECIFIC_INTERFACES**：截图中使用的端口类型表示该 DID 使用**数据元素特定的 RTE 接口**，即每个数据元素拥有独立的访问接口，而非通过通用的数组或结构体接口访问。

#### Signal 实例

`DcmDspDidSignals` 下的每个实例用于定义 **DID 数据中的信号（Signal）映射**，将 DID 中的特定数据字段与具体的数据源（Data 实例）关联起来。

| 参数名称                   | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**             | 短名称          | 该 DID 信号映射配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Did Data Pos [Bit]** | DID 数据起始位  | 指定该信号在 DID 数据中的**起始位位置**（从 0 开始），以比特为单位。用于在 DID 的完整数据字节中定位该信号。 | **必须正确配置**，确保信号在 DID 数据中的位置与整车通信矩阵一致。 |
| **Dsp Did Data Ref**       | DID 数据引用    | **关键引用**。引用 `DcmDspDatas` 中定义的 **Data 实例**，将该信号位置与实际的数据来源（信号/常量/回调）关联起来。 | **必须正确引用**，否则该信号没有实际数据来源。               |

> [!note]
>
> 1. **DID 信号映射的作用**：一个 DID 可以包含多个信号（如一个 4 字节的 DID 中包含两个 2 字节的信号）。`DcmDspDidSignal` 通过 `Dsp Did Data Pos` 将每个信号定位到 DID 数据中的正确位置，并通过 `Dsp Did Data Ref` 关联到实际数据源。
>
> 2. **DID 数据结构示例**：
>
>    ```
>    DID 数据（4 字节）：
>    Byte 0    Byte 1    Byte 2    Byte 3
>    [Signal A]          [Signal B]
>    ```
>
>    | 信号     | 起始位 | 长度（位） | 数据引用 |
>    | :------- | :----- | :--------- | :------- |
>    | Signal A | 0      | 16         | Data_A   |
>    | Signal B | 16     | 16         | Data_B   |
>
> 3. **与 Data 的关系**：`Dsp Did Data Ref` 引用的 Data 实例中，通过 `Dsp Data Ecu Signal` 关联到 Com 模块的信号，或通过 `Dsp Data Read Fnc` 关联到自定义读取函数，从而获取实际的数据值。



### PID

#### DcmDspPid 实例

`DcmDspPids` 下的每个实例用于配置 **OBD 服务中的 PID（Parameter ID，参数标识符）** 。OBD（车载诊断系统）使用 PID 来标识不同的诊断数据，如发动机转速、车速、冷却液温度等。

| 参数名称                                   | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                             | 短名称                     | 该 PID 配置实例的唯一标识名。                                | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Identifier**                     | PID 标识符                 | 该 PID 的**数字标识符**，即 OBD 协议中使用的 PID 值。        | **必须与 OBD 标准或 OEM 定义一致**。OBD 标准 PID 如 0x0C（发动机转速）、0x0D（车速）等。 |
| **Dsp Pid Service**                        | PID 服务类型               | 指定该 PID 所属的 **OBD 服务**。                             | - `DCM_SERVICE_01`：当前动力总成数据（ReadData）。<br>- `DCM_SERVICE_02`：冻结帧数据。<br>- `DCM_SERVICE_03` / `DCM_SERVICE_04`：DTC 相关服务。<br>- `DCM_SERVICE_06`：测试结果数据。<br>根据 OBD 标准选择。 |
| **Dsp Pid Size [Byte]**                    | PID 数据大小               | 指定该 PID 返回数据的**大小**，以字节为单位。                | 根据 OBD 标准定义配置，如发动机转速（0x0C）为 2 字节。**必须正确配置**，否则测试仪解析数据会出错。 |
| **Dsp Pid Used**                           | PID 是否启用               | 勾选后，表示该 PID 在项目中**启用**，OBD 测试仪可以请求该 PID 的数据。 | **必须勾选**，否则该 PID 不会生效。                          |
| **Dsp Pid Svc01 Vehicle System Group Ref** | PID 服务 01 车辆系统组引用 | 用于定义该 PID（在服务 01 下）属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |
| **Dsp Pid Svc02 Vehicle System Group Ref** | PID 服务 02 车辆系统组引用 | 用于定义该 PID（在服务 02 下）属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **OBD 与 UDS 的关系**：
>    - OBD 是法规要求的诊断协议，主要用于排放相关数据的读取和 DTC 管理。
>    - UDS 是更全面的诊断协议，OBD 服务（0x01-0x09）是 UDS 协议中的一个子集。
>    - 在 AUTOSAR 中，OBD 服务由 DCM 模块统一处理。
>
> 2. **常见 OBD PID 示例**：
>
>    | PID  | 名称         | 数据长度（字节） | 说明             |
>    | :--- | :----------- | :--------------- | :--------------- |
>    | 0x04 | 发动机负荷   | 1                | 计算发动机负荷值 |
>    | 0x0C | 发动机转速   | 2                | 当前发动机转速   |
>    | 0x0D | 车速         | 1                | 当前车辆速度     |
>    | 0x10 | MAF 空气流量 | 2                | 质量空气流量     |
>    | 0x1F | 运行时间     | 2                | 发动机运行时间   |
>    | 0x2F | 燃油液位     | 1                | 燃油液位百分比   |
>
> 3. **OBD 服务分类**：
>    - **Service 01**：实时数据读取，最常用。
>    - **Service 02**：冻结帧数据读取。
>    - **Service 03/04**：DTC 读取/清除。
>    - **Service 06**：测试结果数据（如传感器监测结果）。
>    - **Service 09**：车辆信息读取（如 VIN、CALID 等）。

#### DcmDspPidData 实例

`DcmDspPidData` 用于配置 **PID 数据中的信号映射**，将 PID 数据中的特定数据字段与具体的数据源关联起来，实现 OBD 数据的读取。

| 参数名称                    | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**              | 短名称          | 该 PID 数据映射配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Data Pos [Bit]**  | PID 数据起始位  | 指定该数据在 PID 数据中的**起始位位置**（从 0 开始），以比特为单位。用于在 PID 的完整数据字节中定位该数据字段。 | **必须正确配置**，确保数据在 PID 数据中的位置与 OBD 标准定义一致。 |
| **Dsp Pid Data Size [Bit]** | PID 数据大小    | 指定该 PID 数据字段的**大小**，以比特（Bit）为单位。定义了从起始位开始占用多少位。 | 根据 OBD 标准定义配置，常见值为 8、16、32 等。**必须正确配置**，否则数据解析会出错。 |

> [!note]
>
> 1. **PID 数据映射的作用**：一个 PID 可以包含多个数据字段。`DcmDspPidData` 通过 `Data Pos` 和 `Data Size` 定位每个字段在 PID 数据中的位置和长度。
>
> 2. **与 DcmDspPid 的关系**：
>    - `DcmDspPid`：定义 PID 的**整体属性**（ID、服务类型、数据长度）。
>    - `DcmDspPidData`：定义 PID 数据的**内部结构**（字段位置、字段大小），将数据字段与实际数据源关联。

#### DcmDspPidDataSupportInfo 实例

`DcmDspPidDataSupportInfo` 用于配置 **PID 数据支持信息**，定义某个 PID 数据字段的**可用性指示位**及其对应的支持信息来源。

| 参数名称                                | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                          | 短名称               | 该 PID 数据支持信息配置实例的唯一标识名。                    | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Data Support Info Bit [bit]** | PID 数据支持信息位   | 指定该 PID 数据字段的**支持信息位**位置（以比特为单位）。该位用于指示该数据字段是否受当前 ECU 支持。 | 根据 OBD 标准中的支持位定义配置。OBD 服务通常通过一个支持位掩码来指示哪些 PID 可用，该参数定义该数据字段对应掩码中的具体位位置。 |
| **Dsp Pid Data Support Info Ref**       | PID 数据支持信息引用 | 引用定义了 **PID 支持信息** 的配置实例，用于获取该数据字段的可用性状态。 | **必须正确引用**，否则 DCM 无法判断该 PID 数据字段是否可用。该引用通常指向一个包含支持位掩码的 Data 实例或信号。 |

> [!note]
>
> 1. **OBD 支持信息机制**：OBD 协议中，ECU 通过一个**支持位掩码（Support Bit Mask）** 来告知测试仪哪些 PID 可用。每个 PID 对应掩码中的一个位（Bit），当该位为 1 时表示该 PID 支持，为 0 时表示不支持。
>
> 2. **支持信息的典型使用流程**：
>    - 测试仪发送请求读取某个 PID。
>    - DCM 检查 `Dsp Pid Data Support Info Bit` 指定的位。
>    - 如果该位为 1，则返回该 PID 的数据值。
>    - 如果该位为 0，则返回 NRC 0x31（请求超出范围）或 0x11（服务不支持）。
>
> 3. **典型配置示例**：
>
>    | PID                | 支持位位置 | 支持信息来源          |
>    | :----------------- | :--------- | :-------------------- |
>    | 0x04（发动机负荷） | Bit 0      | `PidSupportInfo_Data` |
>    | 0x0C（发动机转速） | Bit 1      | `PidSupportInfo_Data` |
>    | 0x0D（车速）       | Bit 2      | `PidSupportInfo_Data` |

#### DcmDspPidService01 实例

`DcmDspPidService01` 用于配置 **OBD 服务 01（当前动力总成数据）** 中 PID 数据的读取行为，定义读取函数和 RTE 端口类型。

| 参数名称                  | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------ | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**            | 短名称           | 该 OBD 服务 01 配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Data Read Fnc** | PID 数据读取函数 | 指定用于**读取 OBD 服务 01 数据**的回调函数名称。当测试仪请求服务 01 的某个 PID 时，DCM 调用此函数获取数据。 | 如果数据直接来自信号且通过 RTE 访问，则无需配置。仅在需要自定义读取逻辑（如从硬件寄存器读取）时配置。 |
| **Dsp Pid Data Use Port** | PID 数据使用端口 | 指定该 PID 数据访问时使用的 **RTE 端口类型**。               | - `USE_DATA_SYNCH_CLIENT_SERVER`：使用同步客户端/服务器端口，调用后等待返回结果。<br>- `USE_DATA_ASYNCH_CLIENT_SERVER`：使用异步客户端/服务器端口，调用后立即返回，结果通过回调通知。<br>- `USE_DATA_SENDER_RECEIVER`：使用发送器/接收器端口。<br>根据项目架构选择。 |

> [!note]
>
> 1. **OBD 服务 01 的功能**：服务 01（ReadData）是 OBD 中最常用的服务，用于读取当前动力总成数据，如发动机转速、车速、冷却液温度等实时数据。
>
> 2. **同步 vs 异步端口**：
>    - **同步（Synchronous）**：读取函数会阻塞等待数据返回，适合快速获取数据的场景。
>    - **异步（Asynchronous）**：读取函数立即返回，数据通过回调方式提供，适合数据获取较慢或需要等待硬件响应的场景。
>
> 3. **与其他 PID 配置的关系**：
>    - `DcmDspPid`：定义 PID 的**基本属性**（ID、服务类型、数据长度）。
>    - `DcmDspPidService01`：定义服务 01 的**读取行为**（读取函数、端口类型）。
>    - `DcmDspPidData`：定义 PID 数据的**内部结构**（字段位置、大小）。



#### DcmDspPidService02 实例

`DcmDspPidService02` 用于配置 **OBD 服务 02（冻结帧数据）** 中 PID 数据的读取行为。

| 参数名称                 | 中文直译 / 作用   | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------- | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**           | 短名称            | 该 OBD 服务 02 配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Data Dem Ref** | PID 数据 DEM 引用 | **关键引用**。引用 **DEM（Diagnostic Event Manager，诊断事件管理器）** 模块中的配置实例，用于获取冻结帧数据。冻结帧数据是当 DTC 触发时，DEM 模块记录的环境数据快照。 | **必须正确引用**，否则 DCM 无法从 DEM 获取冻结帧数据，服务 02 将无法正常工作。该引用指向 DEM 中存储冻结帧数据的对应配置。 |

> [!note]
>
> 1. **OBD 服务 02 的功能**：服务 02（ReadFreezeFrameData）用于读取**冻结帧数据**，即在 DTC 触发时 ECU 记录的环境数据快照（如当时的发动机转速、车速、冷却液温度等）。冻结帧数据对于故障分析和复现具有重要意义。
>
> 2. **冻结帧数据的来源**：冻结帧数据由 **DEM（Diagnostic Event Manager）** 模块在 DTC 触发时捕获并存储。DCM 通过 `Dsp Pid Data Dem Ref` 引用 DEM 中的冻结帧数据，实现服务 02 的数据读取。
>
> 3. **与 DcmDspPidService01 的对比**：
>
>    | 对比项     | Service 01（当前数据） | Service 02（冻结帧数据） |
>    | :--------- | :--------------------- | :----------------------- |
>    | 数据来源   | 实时信号（Com 模块）   | DEM 存储的故障快照       |
>    | 数据时效性 | 当前实时值             | DTC 触发时的历史值       |
>    | 主要用途   | 实时监控               | 故障分析                 |

#### DcmDspPidSupportInfo 实例

`DcmDspPidSupportInfo` 用于配置 **OBD PID 支持信息**，定义 OBD 服务中用于指示哪些 PID 可用的**支持位掩码（Support Bit Mask）** 的长度和位置。

| 参数名称                     | 中文直译 / 作用  | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称           | 该 PID 支持信息配置实例的唯一标识名。                        | 用于在工具中识别该配置实例。                                 |
| **Dsp Pid Support Info Len** | PID 支持信息长度 | 指定 PID 支持位掩码的**数据长度**，以字节为单位。定义了该 ECU 通过 OBD 服务上报的支持信息占用多少字节。 | 根据 OBD 标准或项目需求配置，通常为 4 字节（32 位）或更多，以覆盖所有支持的 PID。 |
| **Dsp Pid Support Info Pos** | PID 支持信息位置 | 指定 PID 支持位掩码在响应数据中的**起始位置**（以字节为单位），用于在 OBD 响应报文中定位支持信息字段。 | 根据 OBD 标准定义配置，通常位于响应数据的特定偏移位置。      |

> [!note]
>
> 1. **OBD 支持信息机制**：OBD 协议中，ECU 通过一个**支持位掩码（Support Bit Mask）** 来告知测试仪哪些 PID 可用。每个 PID 对应掩码中的一个位（Bit），当该位为 1 时表示该 PID 支持，为 0 时表示不支持。
>
> 2. **Len 与 Pos 的配合使用**：
>    - `Dsp Pid Support Info Pos` 定义支持信息在响应数据中的**起始偏移**。
>    - `Dsp Pid Support Info Len` 定义支持信息的**总长度**。
>    - 两者共同定位响应报文中的支持信息字段。
>
> 3. **典型配置示例**：
>
>    | 参数                       | 典型值 | 说明                              |
>    | :------------------------- | :----- | :-------------------------------- |
>    | `Dsp Pid Support Info Len` | 4      | 4 字节（32 位）支持掩码           |
>    | `Dsp Pid Support Info Pos` | 0      | 支持信息从响应数据的第 0 字节开始 |
>
> 4. **与 DcmDspPidDataSupportInfo 的关系**：
>    - `DcmDspPidSupportInfo`：定义支持位掩码的**整体属性**（长度、位置）。
>    - `DcmDspPidDataSupportInfo`：定义每个 PID 数据字段对应的**具体支持位位置**。

### Routine Control

#### DcmDspRequestControl 实例

`DcmDspRequestControl` 用于配置 **0x31 服务（RoutineControl，例程控制）** 中**请求控制参数**的具体行为，定义例程执行时输入/输出缓冲区的管理和访问方式。

| 参数名称                                         | 中文直译 / 作用        | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------- | :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                   | 短名称                 | 该请求控制配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsp Request Control Fnc**                      | 请求控制函数           | 指定用于**执行请求控制逻辑**的回调函数名称。当例程控制服务需要执行请求控制操作时，DCM 调用此函数。 | 通常由工具链根据配置自动生成，一般不需要手动配置。           |
| **Dsp Request Control In Buffer Size [Byte]**    | 请求控制输入缓冲区大小 | 指定该例程请求的**输入缓冲区大小**，以字节为单位。用于存放从测试仪接收到的输入数据。 | 根据例程需要的输入数据大小配置。如果例程不需要输入参数，则保持为 0。 |
| **Dsp Request Control Out Buffer Size [Byte]**   | 请求控制输出缓冲区大小 | 指定该例程请求的**输出缓冲区大小**，以字节为单位。用于存放返回给测试仪的输出数据。 | 根据例程需要返回的输出数据大小配置。如果例程不需要输出参数，则保持为 0。 |
| **Dsp Request Control Test Id**                  | 请求控制测试 ID        | 指定该请求控制对应的**测试 ID**，用于功能安全或诊断测试场景中的标识。 | 仅在功能安全（ISO 26262）项目中需要配置，一般项目保持为空。  |
| **Dsp Request Control Use Port**                 | 请求控制使用端口       | 指定该请求控制访问时使用的 **RTE 端口类型**。                | - `USE_DATA_ASYNCH_CLIENT_SERVER`：异步客户端/服务器。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：同步客户端/服务器。<br>- `USE_DATA_SENDER_RECEIVER`：发送器/接收器。<br>根据项目架构选择。 |
| **Dsp Request Control Vehicle System Group Ref** | 请求控制车辆系统组引用 | 用于定义该请求控制属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **0x31 RoutineControl 服务的结构**：UDS 0x31 服务包含三个子功能：
>    - **StartRoutine（0x01）**：启动例程。
>    - **StopRoutine（0x02）**：停止例程。
>    - **RequestRoutineResults（0x03）**：请求例程结果。
>
>    `DcmDspRequestControl` 与 `DcmDspRoutineInfos` 配合，共同定义例程的完整行为。
>
> 2. **缓冲区的作用**：
>    - **输入缓冲区**：存储测试仪发送的例程参数（如执行次数、目标值等）。
>    - **输出缓冲区**：存储例程执行完成后返回给测试仪的结果（如执行状态、计算结果等）。
>
> 3. **与 DcmDspRoutineInfos 的关系**：`DcmDspRequestControl` 定义了例程的**请求控制行为**（缓冲区、端口），而 `DcmDspRoutineInfos` 定义了例程的**具体执行逻辑**（启动/停止/结果回调函数）。



#### DcmDspRoutineAuthorization 实例

`DcmDspRoutineAuthorization` 用于配置 **例程（Routine，0x31 服务）的访问控制属性**，定义执行该例程所需的会话状态、安全等级和角色权限。该配置控制测试仪在什么条件下可以启动、停止或查询该例程。

| 参数名称                                 | 中文直译 / 作用    | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                           | 短名称             | 该例程授权配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Mode Rule Ref**            | 例程模式规则引用   | 引用该例程所处的**诊断模式规则**，用于定义该例程在哪些诊断模式下可用。 | 通常保持默认，不常修改。                                     |
| **Dsp Routine Role Ref**                 | 例程角色引用       | 指定该例程的**角色（Role）**，用于更细粒度的访问控制。       | 通常保持为空，使用默认角色。                                 |
| **Dsp Routine Security Level Ref**       | 例程安全等级引用   | 引用执行该例程所需的**安全访问等级**。只有通过了对应安全等级验证的测试仪才能执行该例程。 | 如果该例程需要安全解锁才能执行，则在此引用对应的 `DcmSecurityLevel`。如果无需安全验证，则保持为空。 |
| **Dsp Routine Session Ref**              | 例程会话等级引用   | 引用该例程可用的**诊断会话等级**。只有处于指定会话状态下，测试仪才能执行该例程。 | 如果该例程仅在特定会话下可用（如仅在扩展会话下可执行），则在此引用对应的会话配置。如果所有会话下均可执行，则保持为空。 |
| **Dsp Routine Vehicle System Group Ref** | 例程车辆系统组引用 | 用于定义该例程属于**哪个车辆系统组**，在多 ECU 系统中用于路由或访问控制。 | 通常保持为空。                                               |

> [!note]
>
> 1. **例程访问控制的作用**：`DcmDspRoutineAuthorization` 定义了例程的**访问控制策略**，确保只有满足特定条件（会话状态、安全等级）的测试仪才能执行该例程。
>
> 2. **典型配置示例**：
>
>    | 例程类型               | 会话要求           | 安全等级要求    | 说明                       |
>    | :--------------------- | :----------------- | :-------------- | :------------------------- |
>    | 编程前提条件检查       | Extended           | 无              | 扩展会话下可执行，无需解锁 |
>    | 方向盘角度标定         | Extended           | SecurityLevel_1 | 扩展会话 + 安全解锁        |
>    | 安全敏感例程（如复位） | Extended           | SecurityLevel_3 | 高安全等级要求             |
>    | 简单查询例程           | Default + Extended | 无              | 默认/扩展会话均可          |
>
> 3. **与 DcmDsd 的关系**：`DcmDsd` 中的服务分发配置（如 `RoutineControl` 服务的 `Dsd Sid Tab Session Level Ref` 和 `Dsd Sid Tab Security Level Ref`）定义了**服务级别**的访问控制，而 `DcmDspRoutineAuthorization` 定义了**具体例程级别**的访问控制。两者共同构成完整的访问控制链路。

#### DcmDspRoutineRequestResInSignal 实例

`DcmDspRoutineRequestResInSignal` 用于配置 **例程请求结果输入信号** 的属性，定义例程在执行请求结果（RequestRoutineResults，0x31 的子功能 0x03）操作时，输入信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程请求结果输入信号配置实例的唯一标识名。                 | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspRoutineRequestResInSignal` 用于配置 0x03 子功能中**从测试仪接收的输入信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **大小端的重要性**：AUTOSAR 默认使用大端（Motorola）格式，但如果通信矩阵中使用小端（Intel）格式，则需要将 `Endianness` 配置为 `LITTLE_ENDIAN`，否则数据解析会出错。

#### DcmDspRoutineRequestResOutSignal 实例

`DcmDspRoutineRequestResOutSignal` 用于配置 **例程请求结果输出信号** 的属性，定义例程在执行请求结果（RequestRoutineResults，0x31 的子功能 0x03）操作时，输出信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程请求结果输出信号配置实例的唯一标识名。                 | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |
| **Dsp Routine Signal Type**         | 例程信号类型    | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32` 等。**必须与实际数据匹配**。 |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspRoutineRequestResOutSignal` 用于配置 0x03 子功能中**返回给测试仪的输出信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **信号类型与长度的关系**：`Dsp Routine Signal Type` 定义了信号的**数据类型**（如 UINT8、UINT16），而 `Dsp Routine Signal Length [Bit]` 定义了信号的**位长度**。两者需要匹配（如 UINT16 对应 16 位）。如果配置不一致，可能导致数据截断或解析错误。



#### DcmDspRoutineStopInSignal 实例

`DcmDspRoutineStopInSignal` 用于配置 **例程停止输入信号** 的属性，定义例程在执行停止（StopRoutine，0x31 的子功能 0x02）操作时，输入信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程停止输入信号配置实例的唯一标识名。                     | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |
| **Dsp Routine Signal Type**         | 例程信号类型    | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32` 等。**必须与实际数据匹配**。 |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspRoutineStopInSignal` 用于配置 0x02 子功能中**从测试仪接收的输入信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **停止例程的典型应用场景**：当例程正在执行过程中，测试仪可以通过 StopRoutine 子功能提前终止例程的执行。输入信号通常包含停止条件或停止参数（如立即停止/完成当前步骤后停止）。

#### DcmDspRoutineStopOutSignal 实例

`DcmDspRoutineStopOutSignal` 用于配置 **例程停止输出信号** 的属性，定义例程在执行停止（StopRoutine，0x31 的子功能 0x02）操作时，输出信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程停止输出信号配置实例的唯一标识名。                     | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |
| **Dsp Routine Signal Type**         | 例程信号类型    | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32` 等。**必须与实际数据匹配**。 |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspRoutineStopOutSignal` 用于配置 0x02 子功能中**返回给测试仪的输出信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **停止例程的输出信号**：输出信号通常用于返回停止操作的结果状态，如停止是否成功、停止时的例程执行进度、停止原因等信息。

#### DcmDspStartRoutineInSignal 实例

`DcmDspStartRoutineInSignal` 用于配置 **例程启动输入信号** 的属性，定义例程在执行启动（StartRoutine，0x31 的子功能 0x01）操作时，输入信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程启动输入信号配置实例的唯一标识名。                     | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |
| **Dsp Routine Signal Type**         | 例程信号类型    | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32` 等。**必须与实际数据匹配**。 |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspStartRoutineInSignal` 用于配置 0x01 子功能中**从测试仪接收的输入信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **启动例程的输入信号**：输入信号通常包含启动例程所需的参数，如执行次数、目标值、模式选择等。具体内容由例程的功能定义。

#### DcmDspStartRoutineOutSignal 实例

`DcmDspStartRoutineOutSignal` 用于配置 **例程启动输出信号** 的属性，定义例程在执行启动（StartRoutine，0x31 的子功能 0x01）操作时，输出信号的数据格式和位置信息。

| 参数名称                            | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                      | 短名称          | 该例程启动输出信号配置实例的唯一标识名。                     | 用于在工具中识别该配置实例。                                 |
| **Dsp Routine Signal Endianness**   | 例程信号大小端  | 指定该信号的**字节序**。                                     | - `LITTLE_ENDIAN`：小端模式（低位在前）。<br>- `BIG_ENDIAN`：大端模式（高位在前，Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Dsp Routine Signal Length [Bit]** | 例程信号长度    | 指定该信号的**长度**，以比特（Bit）为单位。                  | 根据信号的实际位宽配置。**必须正确配置**，否则数据解析会出错。 |
| **Dsp Routine Signal Pos [Bit]**    | 例程信号起始位  | 指定该信号在数据中的**起始位位置**（从 0 开始），以比特为单位。 | **必须正确配置**，确保信号在数据中的位置与通信矩阵一致。     |
| **Dsp Routine Signal Type**         | 例程信号类型    | 指定该信号的**数据类型**。                                   | 可选类型如 `UINT8`、`UINT16`、`UINT32`、`SINT8`、`SINT16`、`FLOAT32` 等。**必须与实际数据匹配**。 |

> [!note]
>
> 1. **Routine 0x31 服务的三个子功能**：
>    - **StartRoutine（0x01）**：启动例程，可带输入参数，返回输出结果。
>    - **StopRoutine（0x02）**：停止例程，可带输入参数，返回输出结果。
>    - **RequestRoutineResults（0x03）**：请求例程结果，可带输入参数，返回输出结果。
>
>    `DcmDspStartRoutineOutSignal` 用于配置 0x01 子功能中**返回给测试仪的输出信号**。
>
> 2. **Routine 信号配置的完整结构**：
>
>    | 子功能                        | 输入信号容器                      | 输出信号容器                       |
>    | :---------------------------- | :-------------------------------- | :--------------------------------- |
>    | StartRoutine（0x01）          | `DcmDspStartRoutineInSignal`      | `DcmDspStartRoutineOutSignal`      |
>    | StopRoutine（0x02）           | `DcmDspRoutineStopInSignal`       | `DcmDspRoutineStopOutSignal`       |
>    | RequestRoutineResults（0x03） | `DcmDspRoutineRequestResInSignal` | `DcmDspRoutineRequestResOutSignal` |
>
> 3. **启动例程的输出信号**：输出信号通常用于返回例程启动后的执行结果，如启动是否成功、例程 ID、执行状态等信息。

#### Routine 实例

`DcmDspRoutines` 下的每个实例用于定义 **RID（Routine Identifier，例程标识符，0x31 服务）** 的具体内容，将 RID 标识符与启动/停止/请求结果的执行函数关联起来，完成例程的完整定义。

| 参数名称                                                     | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                               | 短名称                     | 该例程配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例，通常与 RID 名称一致。            |
| **Dsp Request Results Routine Fnc**                          | 请求结果例程函数           | 指定用于**请求例程结果**（RequestRoutineResults，0x03）的回调函数名称。当测试仪请求该例程的执行结果时，DCM 调用此函数返回结果数据。 | 如果例程支持请求结果子功能，则需配置此函数。                 |
| **Dsp Request Results Routine Interface Argument Integrity** | 请求结果例程接口参数完整性 | 勾选后，DCM 会对请求结果子功能的**接口参数进行完整性检查**，验证传入参数的合法性。 | 建议勾选，增强诊断通信的健壮性。                             |
| **Dsp Request Results Routine Supported**                    | 请求结果例程是否支持       | 勾选后，表示该例程**支持请求结果（0x03）子功能**，测试仪可以请求该例程的执行结果。 | 根据例程的功能需求配置。并非所有例程都需要支持此子功能。     |
| **Dsp Routine Fixed Length**                                 | 例程固定长度               | 勾选后，表示该例程的输入/输出数据使用**固定长度**，数据长度在配置时已确定。 | 绝大多数例程的数据长度是固定的，通常勾选。                   |
| **Dsp Routine Identifier**                                   | 例程标识符                 | 该例程的**数字标识符**，即 UDS 协议中 0x31 服务使用的 RID 值（16 位）。 | **必须与整车诊断规范中的定义完全一致**。                     |
| **Dsp Routine Info Byte**                                    | 例程信息字节               | 指定该例程的**信息字节**，用于向测试仪提供例程的附加信息。   | 根据 OEM 诊断规范配置，通常保持为 0。                        |
| **Dsp Routine Info Ref**                                     | 例程信息引用               | **关键引用**。引用 `DcmDspRoutineInfos` 中定义的 **RidInfo 实例**，为该例程提供执行信息（输入/输出信号定义）。 | **必须正确引用**，否则该例程缺少执行信息定义。               |
| **Dsp Routine System Template Diagnostic Routine Ref**       | 系统模板诊断例程引用       | 引用 **系统模板（System Template）** 中定义的诊断例程，用于与系统模板集成。 | 通常保持为空，仅在使用了系统模板的标准化项目中配置。         |
| **Dsp Routine Use Port**                                     | 例程使用端口               | 指定该例程访问时使用的 **RTE 端口类型**。                    | - `USE_DATA_ASYNCH_CLIENT_SERVER`：异步客户端/服务器。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：同步客户端/服务器。<br>- `USE_DATA_SENDER_RECEIVER`：发送器/接收器。<br>根据项目架构选择。 |
| **Dsp Routine Used**                                         | 例程是否启用               | 勾选后，表示该例程在项目中**启用**。                         | **必须勾选**，否则该例程不会生效。                           |
| **Dsp Start Routine Fnc**                                    | 启动例程函数               | 指定用于**启动例程**（StartRoutine，0x01）的回调函数名称。当测试仪请求启动该例程时，DCM 调用此函数执行例程启动逻辑。 | **必须配置**，否则例程的启动功能将无法工作。                 |
| **Dsp Start Routine Interface Argument Integrity**           | 启动例程接口参数完整性     | 勾选后，DCM 会对启动例程子功能的**接口参数进行完整性检查**，验证传入参数的合法性。 | 建议勾选，增强诊断通信的健壮性。                             |
| **Dsp Stop Routine Fnc**                                     | 停止例程函数               | 指定用于**停止例程**（StopRoutine，0x02）的回调函数名称。当测试仪请求停止该例程时，DCM 调用此函数执行例程停止逻辑。 | **必须配置**，否则例程的停止功能将无法工作。                 |
| **Dsp Stop Routine Interface Argument Integrity**            | 停止例程接口参数完整性     | 勾选后，DCM 会对停止例程子功能的**接口参数进行完整性检查**，验证传入参数的合法性。 | 建议勾选，增强诊断通信的健壮性。                             |
| **Dsp Stop Routine Supported**                               | 停止例程是否支持           | 勾选后，表示该例程**支持停止（0x02）子功能**，测试仪可以请求停止该例程。 | 根据例程的功能需求配置。如果例程为一次性执行且不可中断，则可不勾选。 |

> [!note]
>
> 1. **例程的完整配置链路**：
>    - `Dsp Routine Identifier` → 定义 RID 的**数值**（如 `0x0206`）。
>    - `Dsp Routine Info Ref` → 引用 **RidInfo**，定义例程的**执行信息**（输入/输出信号）。
>    - `Dsp Start Routine Fnc` / `Dsp Stop Routine Fnc` / `Dsp Request Results Routine Fnc` → 定义例程的**执行函数**。
>
> 2. **三个子功能的支持组合**：
>
>    | 例程类型   | Start | Stop | RequestResults | 典型应用                     |
>    | :--------- | :---- | :--- | :------------- | :--------------------------- |
>    | 一次性例程 | ✅     | ❌    | ✅              | 编程前提条件检查、校验和计算 |
>    | 可中断例程 | ✅     | ✅    | ✅              | 数据采集、周期性测试         |
>    | 查询例程   | ❌     | ❌    | ✅              | 状态查询（仅返回结果）       |
>
> 3. **RID 数值的约定**：
>    - UDS 标准中 RID 为 **16 位**（0x0000 - 0xFFFF）。
>    - 部分范围有特殊含义：0xF000 - 0xFFFF 通常保留给 OEM 或供应商自定义。
>    - 具体 RID 的分配需要参考整车诊断规范。

### Vehicle Information

#### DcmDspVehInfoData 实例

`DcmDspVehInfoData` 用于配置 **车辆信息（Vehicle Info）数据** 的读取属性和访问方式，支持通过 0x22 服务读取车辆相关的信息数据（如 VIN、软件版本、硬件版本等）。

| 参数名称                          | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------- | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                    | 短名称               | 该车辆信息数据配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **Dsp Veh Info Data Order**       | 车辆信息数据顺序     | 指定该车辆信息数据在多个车辆信息数据集合中的**排列顺序**，用于确定数据在响应报文中的位置。 | 当存在多个车辆信息数据需要组合返回时，该值决定排列次序。通常从 0 开始编号。 |
| **Dsp Veh Info Data Read Fnc**    | 车辆信息数据读取函数 | 指定用于**读取车辆信息数据**的回调函数名称。当测试仪请求读取该车辆信息时，DCM 调用此函数获取数据。 | 如果数据直接来自信号且通过 RTE 访问，则无需配置。仅在需要自定义读取逻辑时配置。 |
| **Dsp Veh Info Data Size [Byte]** | 车辆信息数据大小     | 指定该车辆信息数据的**长度**，以字节为单位。                 | **必须正确配置**，确保能够容纳实际数据。配置过大浪费内存，配置过小会导致数据截断。 |
| **Dsp Veh Info Data Use Port**    | 车辆信息数据使用端口 | 指定该车辆信息数据访问时使用的 **RTE 端口类型**。            | - `USE_DATA_ASYNCH_CLIENT_SERVER`：异步客户端/服务器。<br>- `USE_DATA_SYNCH_CLIENT_SERVER`：同步客户端/服务器。<br>- `USE_DATA_SENDER_RECEIVER`：发送器/接收器。<br>根据项目架构选择。 |

> [!note]
>
> 1. **车辆信息与 DID 的关系**：
>    - 车辆信息通常通过 0x22 服务（ReadDataById）读取。
>    - `DcmDspVehInfoData` 定义了车辆信息的**数据内容**，而对应的 DID 配置（`DcmDspDids`）通过 `Dsp Did Ref` 引用该数据。
>
> 2. **典型车辆信息示例**：
>
>    | 车辆信息   | 说明           | 典型长度（字节） |
>    | :--------- | :------------- | :--------------- |
>    | VIN        | 车辆识别码     | 17               |
>    | 软件版本号 | ECU 软件版本   | 4-16             |
>    | 硬件版本号 | ECU 硬件版本   | 4-16             |
>    | 供应商代码 | ECU 供应商标识 | 2-4              |
>    | 生产日期   | ECU 生产日期   | 4-8              |
>
> 3. **Data Order 的作用**：当一个车辆信息响应报文中包含多个车辆信息数据时（如通过 0x22 读取多个 DID 时），`Data Order` 决定各数据在响应报文中的排列顺序，确保测试仪能够正确解析。

### Communication Control

#### DcmDspComControlAllChannel 实例

`DcmDspComControlAllChannel` 用于配置 **通信控制（CommunicationControl，0x28 服务）** 中 **“所有通道”** 控制模式下的目标通信通道。当测试仪请求启用或禁用所有通信通道时，DCM 通过此配置控制对应的 ComM 通道。

| 参数名称                     | 中文直译 / 作用              | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称                       | 该通信控制通道配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **Dsp All ComM Channel Ref** | 所有通信通道的 ComM 通道引用 | **关键引用**。引用 **ComM（通信管理器）** 模块中定义的**通信通道配置实例**，指定 0x28 服务的 “所有通道” 控制模式实际作用于哪个 ComM 通道。 | **必须正确引用**，确保通信控制命令能够正确传递给 ComM 模块。该引用决定了执行 0x28 服务时，被控制的是哪个具体的通信通道。 |

> [!note]
>
> 1. **0x28 CommunicationControl 服务的控制类型**：
>    - `enableRxAndTx`（0x00）：启用接收和发送。
>    - `enableRxAndDisableTx`（0x01）：启用接收，禁用发送。
>    - `disableRxAndEnableTx`（0x02）：禁用接收，启用发送。
>    - `disableRxAndTx`（0x03）：禁用接收和发送。
>    - `enableRxAndDisableTxWithEnhancedDtcHandling`（0x04）：启用接收，禁用发送，增强 DTC 处理。
>
> 2. **“所有通道”模式的用途**：当测试仪发送 0x28 服务且控制类型为“所有通道”时，DCM 通过此配置确定需要控制哪些 ComM 通道，从而实现对诊断通信的批量控制。
>
> 3. **与 ComM 的协作**：DCM 通过引用 ComM 通道，将通信控制请求转发给 ComM 模块执行。ComM 负责实际的通信总线管理（如 CAN 控制器的启用/禁用）。
>
> 4. **典型配置场景**：
>    - 在诊断刷写过程中，禁用所有非诊断通信通道，以释放总线带宽。
>    - 在特定诊断会话下，限制部分通信通道，以满足安全或功能需求。



#### DcmDspComControlSetting 实例

`DcmDspComControlSetting` 用于配置 **通信控制（CommunicationControl，0x28 服务）** 的**重新启用模式规则**，定义在通信被禁用后，重新启用通信的条件或方式。

| 参数名称                                                  | 中文直译 / 作用              | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :-------------------------------------------------------- | :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                            | 短名称                       | 该通信控制设置配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                                 |
| **Dsp Com Control Communication Re Enable Mode Rule Ref** | 通信控制重新启用模式规则引用 | 引用定义了**通信重新启用模式规则**的配置实例，该规则控制当通信被 0x28 服务禁用后，在什么条件下可以重新启用通信。 | 通常保持默认，指向一个预定义的模式规则。该规则决定了重新启用通信的触发条件（如会话切换、ECU 复位、特定事件等）。 |

> [!note]
>
> 1. **重新启用模式规则的作用**：当测试仪通过 0x28 服务禁用通信后，需要定义何时重新启用通信。该规则防止通信被永久禁用，确保 ECU 在特定条件下能够恢复正常通信。
>
> 2. **常见的重新启用条件**：
>    - 诊断会话切换（如从扩展会话切换回默认会话）。
>    - ECU 复位（如执行 0x11 复位服务）。
>    - 特定事件触发（如定时器超时）。
>    - 测试仪显式发送重新启用命令。
>
> 3. **与 DcmDspComControlAllChannel 的关系**：
>    - `DcmDspComControlAllChannel`：定义 0x28 服务的“所有通道”模式**作用于哪个 ComM 通道**。
>    - `DcmDspComControlSetting`：定义 0x28 服务禁用通信后**如何重新启用**通信。
>    - 两者共同构成通信控制的完整配置。



### Security

#### DcmDspSecurity 实例

`DcmDspSecurity` 是 DCM 模块中 **安全访问（SecurityAccess，0x27 服务）** 的顶层配置容器，用于配置安全访问的全局行为参数，包括绕过模式、尝试计数器重置策略、单实例监控等。

| 参数名称                                          | 中文直译 / 作用      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------ | :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                    | 短名称               | 该安全访问配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsp Security Bypass Enabled**                   | 安全绕过启用         | 勾选后，**绕过所有安全访问检查**，即所有安全等级的保护均被禁用，测试仪无需通过安全验证即可访问受保护的服务/DID/例程。 | **仅在开发和调试阶段使用**。量产版本**必须取消勾选**，否则安全访问机制将完全失效。 |
| **Dsp Security Reset Attempt Counter On Timeout** | 超时时重置尝试计数器 | 勾选后，当**安全访问超时**时，ECU 自动**重置尝试计数器**，允许测试仪重新开始安全访问尝试。 | 建议勾选，防止因超时导致测试仪无法继续安全访问。             |
| **Dsp Security Single Instance Attempt Monitor**  | 单实例尝试监控       | 勾选后，启用**单实例尝试监控**，每个安全等级独立跟踪其尝试计数器和延迟计时器，不同安全等级之间互不影响。 | 建议勾选，确保各安全等级的访问控制相互独立，避免一个安全等级的失败影响其他等级的访问。 |
| **Dsp Security Single Instance Delay Timer**      | 单实例延迟计时器     | 勾选后，每个安全等级**独立管理其延迟计时器**，不同安全等级的失败延迟互不影响。 | 通常与 `Single Instance Attempt Monitor` 配合使用，建议勾选。 |

> [!note]
>
> 1. **安全绕过的安全风险**：`Dsp Security Bypass Enabled` 是**高敏感参数**，启用后所有安全访问保护均被禁用。**必须确保量产版本中此参数为未勾选状态**，否则 ECU 的安全机制完全失效。
>
> 2. **多安全等级的独立管理**：ECU 可能支持多个安全等级（如 level3、level13），每个等级有独立的种子/密钥、尝试计数器和延迟计时器。`Single Instance Attempt Monitor` 和 `Single Instance Delay Timer` 确保不同等级之间的状态互不干扰。
>
> 3. **尝试计数器的生命周期**：
>    - 当安全访问尝试失败时，尝试计数器递增。
>    - 当达到最大尝试次数后，ECU 增加延迟时间，防止暴力破解。
>    - 当 `Reset Attempt Counter On Timeout` 勾选时，超时后计数器自动重置，测试仪可以重新开始尝试。

#### DcmDspSecurityCallback 实例

`DcmDspSecurityCallback` 用于配置 **安全访问（SecurityAccess，0x27 服务）** 的回调函数，该函数由用户实现，用于处理安全访问的种子生成和密钥验证逻辑。

| 参数名称                      | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :---------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                | 短名称          | 该安全回调配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsp Security Callback Fnc** | 安全回调函数    | 指定用于**安全访问处理**的回调函数名称。该函数由用户实现，负责生成种子（Seed）和验证密钥（Key）。当测试仪请求安全访问时，DCM 调用此函数执行具体的加密算法。 | **必须正确配置**，指向用户实现的安全算法函数。如果未配置，安全访问服务将无法工作。该函数的接口需要符合 AUTOSAR 标准的安全回调函数原型。 |

> [!note]
>
> 1. **安全访问（0x27 服务）的工作流程**：
>    - 测试仪发送 **Seed Request**（0x01）请求种子。
>    - ECU 调用 `Dsp Security Callback Fnc` 生成种子并返回给测试仪。
>    - 测试仪使用种子计算密钥，发送 **Key Send**（0x02）请求。
>    - ECU 再次调用 `Dsp Security Callback Fnc` 验证测试仪发送的密钥是否正确。
>    - 如果密钥验证通过，则解锁对应的安全等级。
>
> 2. **回调函数的典型实现**：
>    - **Seed 生成**：根据当前安全等级、随机数或时间戳生成种子值。
>    - **Key 验证**：使用与测试仪相同的算法计算预期密钥，与测试仪发送的密钥进行比较，返回验证结果。
>
> 3. **与 SecurityLevel 的关系**：不同的安全等级（如 level3、level13）通常会使用不同的回调函数，以实现不同的安全策略。`DcmDspSecurityCallback` 通过 `DcmDspSecurityRows` 中的 SecurityLevel 实例与具体的安全等级关联。

#### SecurityRow实例

`DcmDspSecurityRows` 下的每个实例用于配置一个**安全访问等级（Security Level）**，定义该安全等级的种子/密钥长度、重试策略、延时参数以及相关的回调函数。

| 参数名称                                                | 中文直译 / 作用          | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------ | :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                          | 短名称                   | 该安全等级配置实例的唯一标识名。                             | 用于在工具中识别该配置实例，通常与安全等级名称一致（如 `level3`、`level13`）。 |
| **Dsp Security ADR Size [Byte]**                        | 安全 ADR 大小            | 指定安全访问中 **ADR（Additional Data Record，附加数据记录）** 的大小，以字节为单位。ADR 用于在安全访问过程中传递额外数据。 | 根据项目需求配置，如果不需要额外数据，保持为 0。             |
| **Dsp Security AttemptCounter Enabled**                 | 安全尝试计数器启用       | 勾选后，启用**安全访问尝试计数器**，用于限制安全访问失败的尝试次数，防止暴力破解。 | 建议勾选，增强安全性。                                       |
| **Dsp Security CompareKey Fnc**                         | 安全比较密钥函数         | 指定用于**比较密钥**的回调函数名称。当测试仪发送密钥时，DCM 调用此函数验证密钥是否正确。 | 如果安全验证逻辑需要自定义密钥比较方式，则配置此函数。通常与 `GetSeed Fnc` 配合使用。 |
| **Dsp Security Delay Time [ms]**                        | 安全延迟时间             | 指定安全访问失败后的**延迟时间**，以毫秒为单位。连续失败后，ECU 会在每次失败响应前增加此延迟，用于防止暴力破解攻击。 | 根据项目安全策略配置，通常为 500-5000ms 之间。               |
| **Dsp Security Delay Time On Boot [ms]**                | 启动时安全延迟时间       | 指定 ECU **启动后首次安全访问失败**的延迟时间，以毫秒为单位。 | 通常与 `Delay Time` 保持一致或略小。                         |
| **Dsp Security Delay Time On Failed GetAttemptCounter** | 获取尝试计数器失败时延迟 | 指定当**获取尝试计数器失败**时的延迟时间，以毫秒为单位。     | 通常保持默认值（0），一般不需要修改。                        |
| **Dsp Security GetAttemptCounter Fnc**                  | 获取尝试计数器函数       | 指定用于**获取当前尝试计数器值**的回调函数名称。DCM 调用此函数获取当前安全访问失败的尝试次数。 | 仅在启用 `AttemptCounter Enabled` 时需要配置。               |
| **Dsp Security GetSeed Fnc**                            | 获取种子函数             | 指定用于**生成种子（Seed）** 的回调函数名称。当测试仪请求种子时，DCM 调用此函数生成并返回种子值。 | **必须配置**，否则安全访问的种子请求功能将无法工作。         |
| **Dsp Security Key Size [Byte]**                        | 安全密钥大小             | 指定**密钥（Key）** 的长度，以字节为单位。                   | **必须与种子大小和加密算法匹配**。常见值为 4、8、16 字节。   |
| **Dsp Security Level**                                  | 安全等级                 | 该安全访问等级的**数字标识符**，对应 UDS 协议中安全访问服务（0x27）的 SubFunction 值。 | **必须与 OEM 诊断规范一致**。例如 0x03 表示 level3，0x0D 表示 level13。 |
| **Dsp Security Num Att Delay**                          | 安全尝试次数延迟         | 指定在达到最大尝试次数后，需要等待的**额外延迟时间**，以毫秒为单位。 | 根据项目安全策略配置。                                       |
| **Dsp Security Seed Size [Byte]**                       | 安全种子大小             | 指定**种子（Seed）** 的长度，以字节为单位。                  | **必须与密钥大小和加密算法匹配**。常见值为 4、8、16 字节。   |
| **Dsp Security SetAttemptCounter Fnc**                  | 设置尝试计数器函数       | 指定用于**设置尝试计数器值**的回调函数名称。DCM 调用此函数重置或更新尝试计数器。 | 仅在启用 `AttemptCounter Enabled` 时需要配置。               |
| **Dsp Security Use Port**                               | 安全使用端口             | 指定该安全访问使用的 **RTE 端口类型**。                      | - `USE_ASYNCH_CLIENT_SERVER`：异步客户端/服务器。<br>- `USE_SYNCH_CLIENT_SERVER`：同步客户端/服务器。<br>根据项目架构选择。 |

> [!note]
>
> 1. **安全访问（0x27 服务）的工作流程**：
>    - 测试仪发送 **Seed Request**（SubFunction = 安全等级 + 0x01）请求种子。
>    - ECU 调用 `GetSeed Fnc` 生成种子并返回给测试仪。
>    - 测试仪使用种子计算密钥，发送 **Key Send**（SubFunction = 安全等级 + 0x02）请求。
>    - ECU 调用 `CompareKey Fnc` 验证测试仪发送的密钥是否正确。
>    - 如果密钥验证通过，则解锁对应的安全等级。
>
> 2. **Seed Size 与 Key Size 的关系**：
>    - 通常 Seed Size 和 Key Size 相同（如都是 4 字节）。
>    - 具体长度取决于使用的加密算法（如基于 AES 的算法通常使用 16 字节）。
>
> 3. **尝试计数器的防暴力破解机制**：
>    - ECU 记录每个安全等级的失败尝试次数。
>    - 每次失败后，尝试计数器递增。
>    - 当达到 `Num Att Delay` 指定的次数后，ECU 会增加 `Delay Time` 的延迟。
>    - 成功验证后，尝试计数器重置。
>    - 这一机制有效防止了暴力破解攻击。

#### DcmDspSecurityFixedBytes 实例

`DcmDspSecurityFixedBytes` 用于配置安全访问中**固定字节（Fixed Bytes）** 的值，这些固定字节作为安全访问算法的一部分参与种子或密钥的计算。

| 参数名称                                             | 中文直译 / 作用            | 详细解释                                                     | 配置要点 / 注意事项                             |
| :--------------------------------------------------- | :------------------------- | :----------------------------------------------------------- | :---------------------------------------------- |
| **Short Name**                                       | 短名称                     | 该安全固定字节配置实例的唯一标识名。                         | 用于在工具中识别该配置实例。                    |
| **Dsp Security Fixed Byte Value**                    | 安全固定字节值             | 指定安全访问算法中使用的**固定字节值**，通常作为种子或密钥计算时的常量参与运算。 | 根据安全算法需求配置，通常由 OEM 或供应商定义。 |
| **Dsp Security Fixed Byte Vehicle System Group Ref** | 安全固定字节车辆系统组引用 | 用于定义该固定字节属于**哪个车辆系统组**，在多 ECU 系统中用于区分不同系统组的安全访问常量。 | 通常保持为空。                                  |

> [!note]
>
> 1. **固定字节在安全访问中的作用**：在安全访问（0x27 服务）中，固定字节通常作为**加密算法的常量**，与随机生成的种子一起参与密钥计算。通过预定义固定字节，可以确保 ECU 与测试仪之间使用一致的算法进行密钥生成和验证。
>
> 2. **典型应用场景**：
>    - 将固定字节与种子值进行异或（XOR）运算后，再进行哈希或加密计算。
>    - 作为加密算法的初始向量（IV）的一部分。
>    - 作为密钥派生函数（KDF）的盐值（Salt）。
>
> 3. **与 SecurityLevel 的关系**：`DcmDspSecurityFixedBytes` 通常作为 `SecurityLevel 实例` 的子容器存在，每个安全等级可以有不同的固定字节值，从而实现不同等级的安全策略差异化。



### Session

#### DcmDspSession 实例

`DcmDspSession` 是 DCM 模块中 **诊断会话控制（DiagSessionControl，0x10 服务）** 的顶层配置容器，用于配置诊断会话的全局行为参数。

| 参数名称                     | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称          | 该诊断会话配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Session Timer S3 Enabled** | S3 定时器启用   | 勾选后，启用 **S3 定时器（Session Timeout Timer）** 功能。S3 定时器用于监控当前诊断会话的空闲时间，当在指定时间内未收到任何诊断请求时，ECU 自动从当前会话**回退到默认会话（Default Session）**。 | **建议勾选**，这是 UDS 协议的标准行为，用于确保 ECU 不会长期停留在非默认会话（如扩展会话或编程会话），避免安全风险或资源占用。 |

> [!note]
>
> 1. **S3 定时器的作用**：S3 定时器是 UDS 协议中的重要机制，用于管理诊断会话的生命周期：
>    - 每次收到诊断请求时，S3 定时器重置。
>    - 当 S3 定时器超时（通常为 5 秒）时，ECU 自动切回默认会话。
>    - 这确保了 ECU 不会因测试仪异常断开而长期停留在特定会话状态。
>
> 2. **S3 定时器的典型配置**：
>    - S3 定时器的超时值通常在 `DcmGeneral` 或 `DcmDspSessionRows` 中配置。
>    - 典型的 S3 超时值为 **5000ms**（5 秒），但可根据 OEM 规范调整。
>
> 3. **会话切换的影响**：从非默认会话切换回默认会话时，ECU 会执行相应的清理操作：
>    - 释放扩展会话中分配的资源。
>    - 清除安全访问解锁状态（需重新进行安全访问）。
>    - 恢复默认的通信控制状态。

#### DcmDspSessionCallback 实例

`DcmDspSessionCallback` 用于配置 **诊断会话切换回调函数**，当诊断会话发生切换时（如从默认会话切换到扩展会话，或从扩展会话切换回默认会话），DCM 调用此回调函数通知上层模块执行相应的处理逻辑。

| 参数名称                     | 中文直译 / 作用 | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :--------------------------- | :-------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**               | 短名称          | 该会话回调配置实例的唯一标识名。                             | 用于在工具中识别该配置实例。                                 |
| **Dsp Session Callback Fnc** | 会话回调函数    | 指定用于**诊断会话切换通知**的回调函数名称。当诊断会话发生切换时，DCM 调用此函数，通知上层模块（如应用层 SWC）当前会话状态已变化，以便执行相应的初始化或清理操作。 | 根据项目需求配置。如果上层模块需要感知会话切换事件（如扩展会话下启用某些特殊功能），则需在此配置对应的回调函数。如果不需要特殊处理，则保持为空。 |

> [!note]
>
> 1. **会话回调的典型应用场景**：
>    - **进入扩展会话时**：启用某些仅在扩展会话下可用的诊断功能或标定参数。
>    - **退出扩展会话时**：禁用扩展会话下启用的特殊功能，恢复到默认状态。
>    - **进入编程会话时**：准备 ECU 刷写环境，如禁用通信、初始化刷写缓冲区。
>    - **退出编程会话时**：执行刷写完成后的清理操作。
>
> 2. **会话切换的完整流程**：
>    - 测试仪发送 0x10 服务请求切换会话。
>    - DCM 验证请求合法性（会话是否支持、安全等级是否满足）。
>    - DCM 执行会话切换，调用 `Dsp Session Callback Fnc` 通知上层。
>    - 上层模块执行相应的处理逻辑。
>    - DCM 返回肯定响应给测试仪。
>    - 如果 `Session Timer S3 Enabled` 启用，S3 定时器开始计时。



#### Session 实例

`DcmDspSessionRows` 下的每个实例用于定义一种 **诊断会话（Diagnostic Session）** 的具体参数，包括会话等级、时间参数以及是否为引导模式等。

| 参数名称                             | 中文直译 / 作用          | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :----------------------------------- | :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                       | 短名称                   | 该会话配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例，通常与会话类型名称一致，如 `Default`、`Extended`、`Programming` 等。 |
| **Dsp Session For Boot**             | 会话引导模式             | 指定该会话是否用于 **引导模式（Boot Mode）**，以及引导模式的具体类型。 | - `DCM_NO_BOOT`：非引导模式，正常会话。<br>- `DCM_BOOT`：引导模式会话。<br>通常只有 Programming 会话会配置为引导模式。 |
| **Dsp Session Level**                | 会话等级                 | 该诊断会话的**数字等级标识符**，对应 UDS 协议中 0x10 服务（DiagnosticSessionControl）的 SubFunction 值。 | **必须与 OEM 诊断规范一致**。<br>- `0x01`：默认会话（Default Session）<br>- `0x02`：编程会话（Programming Session）<br>- `0x03`：扩展会话（Extended Session） |
| **Dsp Session P2ServerMax [ms]**     | 会话 P2 服务器最大时间   | 指定该会话下的 **P2（服务器响应时间）** 最大值，以毫秒为单位。P2 是从收到请求到开始发送响应的最大允许时间。 | 根据 OEM 诊断规范配置。不同会话可能有不同的 P2 要求（如编程会话可能允许更长的响应时间）。 |
| **Dsp Session P2StarServerMax [ms]** | 会话 P2\* 服务器最大时间 | 指定该会话下的 **P2\*（服务器额外响应时间）** 最大值，以毫秒为单位。P2\* 是允许发送 NRC 0x78（响应挂起）后的额外等待时间。 | 根据 OEM 诊断规范配置。通常 P2\* 远大于 P2（如 P2=50ms，P2\*=5000ms），以支持需要较长处理时间的服务（如 0x31 例程控制、大数据块传输等）。 |

> [!note]
>
> 1. **三种标准诊断会话**：
>    - **Default Session（0x01）**：ECU 上电后的默认状态，支持基本的诊断服务。
>    - **Programming Session（0x02）**：用于 ECU 软件刷写，支持 Flash 擦除/编程等服务。
>    - **Extended Session（0x03）**：用于扩展诊断功能，支持安全访问、标定等服务。
>
> 2. **P2 与 P2\* 的区别**：
>
>    | 时间参数 | 定义                               | 典型值 |
>    | :------- | :--------------------------------- | :----- |
>    | **P2**   | 从收到请求到开始发送响应的最大时间 | 50ms   |
>    | **P2\*** | 发送 NRC 0x78 后的额外等待时间     | 5000ms |
>
> 3. **不同会话的时间参数差异**：
>    - Default 会话：P2 较短（50ms），P2\* 适中（5000ms）。
>    - Extended 会话：P2 稍长（50-100ms），P2\* 较长（5000ms）。
>    - Programming 会话：P2 较长（100-500ms），P2\* 可能更长（10000ms+），以适应刷写操作的较长处理时间。

## DcmGeneral 

`DcmGeneral` 是 DCM 模块的**顶层通用配置容器**，用于配置 DCM 模块的全局行为参数，包括模块版本、字节序、任务调度、功能开关等基础设置。

| 参数名称                                                 | 中文直译 / 作用                      | 详细解释                                                     | 配置要点 / 注意事项                                          |
| :------------------------------------------------------- | :----------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Short Name**                                           | 短名称                               | 该通用配置实例的唯一标识名。                                 | 用于在工具中识别该配置实例。                                 |
| **Autosar Version**                                      | AUTOSAR 版本                         | 指定 DCM 模块遵循的 **AUTOSAR 标准版本**。                   | 通常由工具或项目预设，**一般不需要手动修改**。               |
| **Calibration Of Obd Ids Enabled**                       | OBD ID 标定启用                      | 勾选后，启用 **OBD ID 的标定功能**，允许通过标定工具修改 OBD PID 的映射关系。 | 仅在需要标定 OBD 参数时启用，量产版本通常关闭。              |
| **Calibration Of Obd Ids Memory Type**                   | OBD ID 标定内存类型                  | 指定 OBD ID 标定数据存储的**内存类型**（如 RAM、EEPROM、Flash）。 | 与 `Calibration Of Obd Ids Enabled` 配合使用，根据项目需求配置。 |
| **DDDID Storage Block Id Ref**                           | DDDID 存储块 ID 引用                 | 引用 **DDDID（Dynamically Defined DID，动态定义 DID）** 的存储块配置，用于管理动态 DID 的数据存储。 | 仅在项目使用动态 DID 功能时需要配置。                        |
| **DTR Data Provision via DEM Enabled**                   | 通过 DEM 提供 DTR 数据启用           | 勾选后，DTR（Diagnostic Trouble Code Related Data，DTC 相关数据）通过 **DEM（Diagnostic Event Manager）** 模块提供。 | 根据项目架构决定。通常 DTC 相关数据由 DEM 管理，建议勾选。   |
| **Defensive Behavior Enabled**                           | 防御行为启用                         | 勾选后，DCM 启用**防御行为**，对诊断请求进行更严格的合法性检查，防止异常请求导致模块异常。 | 建议勾选，增强诊断通信的健壮性。                             |
| **Dem Api Version**                                      | DEM API 版本                         | 指定 DCM 与 DEM 模块之间的 **API 版本**。                    | 由工具自动根据 DEM 版本决定，一般不需要手动修改。            |
| **Dev Error Detect**                                     | 开发错误检测                         | 勾选后，启用 DCM 模块内部的**开发错误检测（Development Error Detection）**，当检测到参数错误、状态错误时，调用 `Det_ReportError` 报告。 | **开发阶段建议勾选**，便于发现集成问题。**量产阶段建议关闭**。 |
| **Dsp Data Default Endianness**                          | DSP 数据默认大小端                   | 指定诊断数据的**默认字节序**。                               | - `LITTLE_ENDIAN`：小端模式。<br>- `BIG_ENDIAN`：大端模式（Motorola 格式，AUTOSAR 默认）。<br>**必须与整车通信矩阵一致**。 |
| **Final Response To Fbl Enabled**                        | 向 FBL 发送最终响应启用              | 勾选后，DCM 在执行完相关操作后会向 **FBL（Flash Bootloader）** 发送最终响应。 | 仅在需要与 FBL 进行诊断通信时启用（如刷写场景）。            |
| **Foreign Diagnostic Request Detection Enabled**         | 外部诊断请求检测启用                 | 勾选后，启用**外部诊断请求检测**，用于识别来自外部（如其他 ECU）的诊断请求。 | 仅在多 ECU 诊断路由场景中需要配置。                          |
| **Keep Alive Time [ms]**                                 | 保持活跃时间                         | 指定 **S3 定时器（会话超时定时器）** 的超时值，以毫秒为单位。当在指定时间内未收到诊断请求时，ECU 自动切回默认会话。 | 根据 OEM 诊断规范配置，典型值为 **5000ms**（5 秒）。         |
| **Keep Alive Time Start On Func 3E 80**                  | 3E 80 时启动保活计时器               | 勾选后，当测试仪发送 **0x3E 0x80（TesterPresent，测试仪在线）** 请求时，重新启动保活计时器。 | 建议勾选，符合 UDS 标准行为。                                |
| **Main Function Worker Task Time [ms]**                  | 主函数工作任务时间                   | 指定 DCM 的**主函数工作任务（Main Function Worker Task）** 的执行周期，以毫秒为单位。 | 根据项目调度周期配置。                                       |
| **Max Number Iterations Per Task**                       | 每任务最大迭代次数                   | 指定 DCM 主函数中**每次任务调用的最大迭代次数**，用于控制单次任务的执行时间。 | 根据项目调度策略配置，防止单次任务执行过久影响系统实时性。   |
| **Max Number Of Threads**                                | 最大线程数                           | 指定 DCM 模块支持的**最大线程数**，用于多线程诊断请求处理。  | 通常保持默认（1），除非项目需要并行处理多个诊断请求。        |
| **Parallel Protocol Processing Enabled**                 | 并行协议处理启用                     | 勾选后，启用**并行协议处理**，允许多个诊断协议同时处理请求。 | 仅在需要并行处理多个诊断通道时启用。                         |
| **Request Manufacturer Notification Enabled**            | 厂商请求通知启用                     | 勾选后，当收到厂商自定义的诊断请求时，DCM 会通知上层模块。   | 如果项目中有厂商自定义的诊断服务，则需要勾选。               |
| **Request Supplier Notification Enabled**                | 供应商请求通知启用                   | 勾选后，当收到供应商自定义的诊断请求时，DCM 会通知上层模块。 | 如果项目中有供应商自定义的诊断服务，则需要勾选。             |
| **Reset To Fbl After Session Final Response Enabled**    | 会话最终响应后复位到 FBL 启用        | 勾选后，当诊断会话完成后，ECU 会**复位并跳转到 FBL（Flash Bootloader）** 模式。 | 仅在刷写场景中需要启用。                                     |
| **Respond All Request**                                  | 响应所有请求                         | 勾选后，DCM 对所有诊断请求都**响应**（即使请求格式不合法也会发送否定响应）。 | 通常不勾选，仅用于调试目的。                                 |
| **Safe Bsw Checks**                                      | 安全 BSW 检查                        | 勾选后，启用**安全 BSW 检查**，对关键参数进行合法性检查，用于功能安全场景。 | 在 ASIL 项目中建议勾选，QM 项目保持关闭以提升性能。          |
| **Security Level Change Notification Enabled**           | 安全等级变化通知启用                 | 勾选后，当安全访问等级发生变化时，DCM 会通知上层模块。       | 如果上层模块需要感知安全等级变化，则勾选。                   |
| **Sender Receiver PR Ports Enabled**                     | 发送器/接收器 PR 端口启用            | 勾选后，启用**发送器/接收器 PR 端口**，允许 DCM 通过 S/R 接口与 SWC 通信。 | 根据项目通信架构决定。                                       |
| **Split Tasks Enabled**                                  | 分割任务启用                         | 勾选后，将 DCM 的长时间任务**分割**为多个短任务执行，防止阻塞系统调度。 | 建议勾选，提高系统实时性。                                   |
| **State Recovery After Reset Enabled**                   | 复位后状态恢复启用                   | 勾选后，ECU 复位后 DCM 会**恢复之前的诊断状态**。            | 根据项目需求配置，通常在需要保持诊断状态的场景中启用。       |
| **Supported ID Calculation Suppression Enabled**         | 支持 ID 计算抑制启用                 | 勾选后，**抑制**支持 ID 的计算，用于优化性能。               | 通常保持默认（不勾选）。                                     |
| **Suppress Response On Can Tp Func Mixed Addr Requests** | 抑制对 CAN TP 功能混合地址请求的响应 | 勾选后，当收到 CAN TP（传输协议）的**混合地址请求**时，DCM **不发送响应**。 | 根据项目需求配置，通常保持默认（不勾选）。                   |
| **Task Time [ms]**                                       | 任务时间                             | 指定 DCM **主函数任务**的周期，以毫秒为单位。                | 根据项目调度周期配置。                                       |
| **Typed Data Interfaces Enabled**                        | 类型化数据接口启用                   | 勾选后，启用 **类型化数据接口**，DCM 通过 RTE 的类型化接口访问数据。 | 根据项目架构决定。                                           |
| **User Config File**                                     | 用户配置文件                         | 指定一个**用户自定义配置文件**的路径，允许用户通过外部文件覆盖部分 DCM 配置。 | 通常保持默认或留空。                                         |
| **Version Info Api**                                     | 版本信息 API                         | 勾选后，生成 **`Dcm_GetVersionInfo`** API，用于获取 DCM 模块的版本信息。 | 建议勾选，便于版本管理和调试。                               |
| **Virtual Request Enabled**                              | 虚拟请求启用                         | 勾选后，启用**虚拟请求**功能，允许在不连接实际总线的条件下测试 DCM 的诊断服务处理逻辑。 | 仅在开发调试阶段使用，量产版本关闭。                         |

> [!note]
>
> 1. **开发 vs 量产配置建议**：
>
>    | 参数                         | 开发阶段 | 量产阶段      |
>    | :--------------------------- | :------- | :------------ |
>    | `Dev Error Detect`           | ✅ 勾选   | ❌ 关闭        |
>    | `Virtual Request Enabled`    | ✅ 勾选   | ❌ 关闭        |
>    | `Defensive Behavior Enabled` | ✅ 勾选   | ✅ 勾选        |
>    | `Safe Bsw Checks`            | ✅ 勾选   | ASIL 项目勾选 |
>    | `Version Info Api`           | ✅ 勾选   | ✅ 勾选        |
>
> 2. **大小端配置的重要性**：`Dsp Data Default Endianness` 是**全局默认值**，如果所有诊断数据都使用同一种字节序，则在此处统一配置，无需在每个 DID/Data 中单独配置。如果某些数据使用不同的字节序，可以在 `Dsp Data Endianness` 中单独覆盖。



























