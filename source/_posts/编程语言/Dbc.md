---
title: Dbc

categories: 
  - 编程语言
---



# 参考链接

https://gitcode.com/Open-source-documentation-tutorial/04bfb/blob/main/TechnicalReference_DbcRules_Vector.pdf



# 文件结构

DBC（Database CAN）文件是用于描述CAN总线网络中报文（Message）和信号（Signal）的标准格式文件，广泛应用于汽车电子等领域。其语法严格遵循固定格式。DBC文件由一系列关键字（Keyword）和定义块组成，整体结构如下：

```DBC
VERSION ""                  // 版本信息（可选）
NS_ : ...                   // 命名空间定义（可选，通常默认）
BS_: ...                    // 波特率相关配置（可选）
BU_: ...                    // 节点（ECU）定义
BO_ ...                     // 报文（Message）定义（核心）
CM_ ...                     // 注释（Comment）定义
BA_DEF_ ...                 // 属性定义（Attribute Definition）
BA_ ...                     // 属性赋值（Attribute Assignment）
VAL_ ...                    // 信号值描述（Value Descriptions）
...（其他可选块：VAL_TABLE_、SIG_GROUP_等）
```

# 语法要素

## 版本与命名空间

- **`VERSION`**：文件版本描述，通常留空或填写版本号。

  ```DBC
  VERSION "V1.0_CANdb"  // 示例
  ```

- **`NS_`**：命名空间定义，指定DBC支持的对象类型（如`CM_`、`BA_DEF_`等），默认包含所有标准类型，一般无需修改。默认的命名空间如下：

  ```
  NS_ :
  	NS_DESC_
  	CM_
  	BA_DEF_
  	BA_
  	VAL_
  	CAT_DEF_
  	CAT_
  	FILTER
  	BA_DEF_DEF_
  	EV_DATA_
  	ENVVAR_DATA_
  	SGTYPE_
  	SGTYPE_VAL_
  	BA_DEF_SGTYPE_
  	BA_SGTYPE_
  	SIG_TYPE_REF_
  	VAL_TABLE_
  	SIG_GROUP_
  	SIG_VALTYPE_
  	SIGTYPE_VALTYPE_
  	BO_TX_BU_
  	BA_DEF_REL_
  	BA_REL_
  	BA_DEF_DEF_REL_
  	BU_SG_REL_
  	BU_EV_REL_
  	BU_BO_REL_
  	SG_MUL_VAL_
  ```

## 节点定义（`BU_`）

**作用**：定义CAN网络中的节点（ECU名称），语法为：

```DBC
BU_: <节点1> <节点2> ... <节点N>;
```

**示例**：

```DBC
BU_: VCU BMS MCU;  // 定义3个节点：VCU（整车控制器）、BMS（电池管理系统）、MCU（电机控制器）
```

## 报文定义（`BO_`）

**作用**：定义CAN报文中的关键信息（ID、长度、发送节点、信号列表等），是DBC的核心块。 语法为：

```DBC
BO_ <报文ID> <报文名称>: <数据长度（字节）> <发送节点>
  SG_ <信号名称> : <位起始>|<位长度>@<字节顺序><符号> (<因子>,<偏移量>) [<最小值>|<=最大值>] "<单位>" <接收节点列表>;
  ...（更多信号）
```

**参数说明**：

- `<报文ID>`：10进制/16进制（前缀`0x`）整数，如`33`或`0x21`。
- `<数据长度>`：报文数据场长度（1~8字节）。
- `<发送节点>`：该报文的发送方（必须是`BU_`中定义的节点）。
- **信号（`SG_`）参数**：
  - `<位起始>|<位长度>`：信号在报文中的起始位（0 ~ 63）和长度（1 ~ 64位）。
  - `@<字节顺序>`：`@0`（大端模式，Motorola格式）、`@1`（小端模式，Intel格式）。
  - `<符号>`：`+`（无符号）、`-`（有符号）。
  - `(<因子>,<偏移量>)`：物理值计算公式：`物理值 = 原始值 × 因子 + 偏移量`。
  - `[<最小值>|<最大值>]`：信号物理值的范围。
  - `"<单位>"`：信号单位（如`"km/h"`、`"bit"`，可选）。
  - `<接收节点列表>`：信号的接收方（多个节点用逗号分隔）。

**示例**：

```
PlaintextBO_ 33 PMS_BodyControlInfo: 8 VCU  // 报文ID=33，名称=PMS_BodyControlInfo，长度=8字节，发送节点=VCU
  SG_ PMS_VehicleSpd : 15|16@0+ (0.00390625,0) [0|250.996] "km/h" BMS,MCU;  // 车速信号
  SG_ PMS_VehicleSpd_flag : 51|1@0+ (1,0) [0|1] "bit" BMS,MCU;  // 车速有效标志信号
```

## 注释定义（`CM_`）

**作用**：为节点、报文、信号等添加描述性注释，语法根据对象类型不同略有差异：

- **对报文注释**：`CM_ BO_ <报文ID> "<注释内容>";`
- **对信号注释**：`CM_ SG_ <报文ID> <信号名称> "<注释内容>";`
- **对节点注释**：`CM_ BU_ <节点名称> "<注释内容>";`

**示例**：

```
CM_ BO_ 33 "车身控制显示报文，包含车速及状态标志";  // 报文注释
CM_ SG_ 33 PMS_VehicleSpd "当前车辆行驶速度，精度0.00390625 km/h";  // 信号注释
```

## 属性定义与赋值（`BA_DEF_` 和 `BA_`）

**作用**：自定义扩展属性（如周期、发送类型、SPN等），需先定义属性（`BA_DEF_`），再为对象赋值（`BA_`）。

- **`BA_DEF_`（属性定义）**： 语法：`BA_DEF_ [<对象类型>] "<属性名称>" <数据类型> [<参数>]`
  - `<对象类型>`：可选，指定属性作用对象（`BO_`报文、`SG_`信号、`BU_`节点等，省略则为全局属性）。
  - `<数据类型>`：`INT`（整数）、`FLOAT`（浮点数）、`STRING`（字符串）、`ENUM`（枚举）。
  - `<参数>`：对`INT`/`FLOAT`指定范围（如`0 65535`），对`ENUM`指定枚举值（如`"Cyclic","OnChange"`）。

**示例**：

```
BA_DEF_ BO_ "GenMsgCycleTime" INT 0 60000;  // 定义报文属性：周期（0~60000ms）
BA_DEF_ SG_ "SigType" ENUM "Default","Control","DTC";  // 定义信号属性：信号类型（枚举）
```

- **`BA_`（属性赋值）**： 语法：`BA_ "<属性名称>" <对象类型> <对象ID> <值>;`

**示例**：

```
BA_ "GenMsgCycleTime" BO_ 33 100;  // 报文33的周期设为100ms
BA_ "SigType" SG_ 33 PMS_VehicleSpd "Default";  // 信号PMS_VehicleSpd的类型为默认
```

## 信号值描述（`VAL_`）

**作用**：为离散信号（如状态位）定义“值-文本”映射关系（类似枚举），语法：

```
VAL_ <报文ID> <信号名称> <原始值1> "<描述文本1>" <原始值2> "<描述文本2>" ...;
```

**示例**：

```
VAL_ 33 PMS_VehicleSpd_flag 0 "Valid" 1 "Invalid";  // 信号值0=有效，1=无效
VAL_ 246 PEPS_PowerMode 0 "OFF" 1 "ACC" 2 "ON" 4 "START";  // 电源模式状态映射
```

# 语法规则要点

1. **关键字大小写敏感**：所有关键字（`BO_`、`SG_`、`CM_`等）必须大写，且后接下划线（如`BO_`不能写成`bo_`或`BO`）。
2. **分号结尾**：每个定义块（如`BO_`中的信号、`CM_`、`VAL_`等）必须以分号`;`结尾，否则解析报错。
3. **空格分隔**：关键字、参数、值之间需用空格分隔（多个空格视为一个）。
4. **报文ID唯一性**：同一DBC文件中，`BO_`的报文ID（数值）不可重复。
5. **信号位不重叠**：同一报文中的信号（`SG_`）位起始和长度不可重叠（除非明确配置复用，极少用）。
6. **引号包裹字符串**：注释内容、枚举值、字符串类型属性等需用双引号`""`包裹。

# 使用工具

转换网站为[Excel to DBC Tool (shenyanwu.top)](https://dbctool.shenyanwu.top/)，它的开源地址为：[officialsyw/Excel-to-DBC-Conveter: A Simple DBC Converter Tool On WEB (github.com)](https://github.com/officialsyw/Excel-to-DBC-Conveter)



# 与Vector工具链交互

在我们想要和Vector工具链交互的时候，我们可以修改DBC的Attributes，使得Vector工具导入的时候可以自动做好配置，比如将某帧报文设置为诊断报文、SecOC报文等，通过修改这些Attribute自动配置。

## 数据库属性

1. 数据库属性的作用

   数据库属性用于存储**与配置相关的附加信息**，例如 CAN 网络的波特率。这类信息总是有特定上下文的（比如波特率是网络特定的），因此在创建属性时，**必须定义其上下文（对象类型）**。

2. 属性的对象类型（Object Types）

   | 对象类型                                           | 含义                               | 配置要求                                                 |
   | :------------------------------------------------- | :--------------------------------- | :------------------------------------------------------- |
   | **Network（网络）**                                | 属性是网络特定的                   | 在 DBC 中**只需配置一次**（因为一个 DBC 只包含一个网络） |
   | **Node（节点）**                                   | 属性是节点特定的                   | 需要为网络中的**每个节点**分别设置                       |
   | **Message（报文）**                                | 属性是报文特定的                   | 需要为网络中的**每条报文**分别设置                       |
   | **Signal（信号）**                                 | 属性是信号特定的                   | 需要为网络中的**每个信号**分别设置                       |
   | **Node – Mapped Rx Signal（节点–映射的接收信号）** | 属性描述某个节点接收某个信号的属性 | 需要为网络信息中的**每个“节点–接收信号”关系**分别设置    |

3. 默认值的自动设置

   - 数据库属性的**默认值**，会在**属性创建时自动设置到所有相关对象**上。
   - 理解要点：这意味着新建一个属性后，不需要手动给每个对象赋值，它们会自动继承默认值，之后再按需覆盖即可。

4. 属性的值类型（Value Types）

   数据库属性有 **4 种**相关的值类型：

   | 值类型                       | 说明                                            |
   | :--------------------------- | :---------------------------------------------- |
   | **Enumeration (Enum，枚举)** | 属性只能取一组有限的**非数值**值，例如 No / Yes |
   | **Hex（十六进制）**          | 数值属性，以**十六进制**格式表示                |
   | **Integer（整数）**          | 数值属性，以**整数**格式表示                    |
   | **String（字符串）**         | 属性可以是**任意字符串**                        |

   > [!Important]
   >
   > ⚠️ **重要**：属性的**名称和排序顺序必须严格按照本文档中为每个属性所定义的内容**（例如 No = 0，Yes = 1）。不能随意更改枚举项的数值映射。

## 通用属性

### 网络级属性

| 属性名             | 对象类型 | 值类型  | 取值范围       | 默认值 | 说明                                                         |
| :----------------- | :------- | :------ | :------------- | :----- | :----------------------------------------------------------- |
| `Baud rate`        | Network  | Integer | 0 ~ 1000000    | 500000 | CAN 网络的波特率，单位 bits/s                                |
| `SamplePointMin`   | Network  | Integer | 50 ~ 100       | 75     | 采样点最小值。可选参数，详见参考[^6] "Sample Point"          |
| `SamplePointMax`   | Network  | Integer | 50 ~ 100       | 90     | 采样点最大值。可选参数，详见参考[^6] "Sample Point"          |
| `SyncJumpWidthMin` | Network  | Integer | 1 ~ 4          | 1      | 重同步跳转宽度最小值。可选参数，详见参考[^6] "Resynchronization Jump Width" |
| `SyncJumpWidthMax` | Network  | Integer | 1 ~ 4          | 1      | 重同步跳转宽度最大值。可选参数，详见参考[^6] "Resynchronization Jump Width" |
| `NBTMin`           | Network  | Integer | 6 ~ 25         | 8      | 时间量子数量最小值。可选参数，详见参考[^6] "Number of Time Quanta" |
| `NBTMax`           | Network  | Integer | 8 ~ 25         | 21     | 时间量子数量最大值。可选参数，详见参考[^6] "Number of Time Quanta" |
| `Manufacturer`     | Network  | String  | Vector         | Vector | 表示 OEM，值必须为 "Vector"                                  |
| `DBName`           | Network  | String  | CAN            | CAN    | 指定网络名称。同一 ECU 内的 CAN、LIN、FlexRay 网络必须各不相同 |
| `BusType`          | Network  | String  | CAN<br/>CAN FD | CAN    | 定义 CAN-2.0 和 CAN-FD 网络。只要存在至少一条 CAN-FD 报文，就必须设为 "CAN FD" |

####  报文级属性

| 属性名         | 对象类型 | 值类型 | 取值范围                                                     | 默认值       | 说明                                                         |
| :------------- | :------- | :----- | :----------------------------------------------------------- | :----------- | :----------------------------------------------------------- |
| `VFrameFormat` | Message  | Enum   | CAN Standard<br/>CAN Extended<br/>CAN FD Standard<br/>CAN FD Extended | CAN Standard | 指示 CAN 报文类型。⚠️ 无需在属性定义中声明即可用于每条报文，显示文本为 "ID-Format" 或 "Type" |



## AUTOSAR COM 模块属性

### 报文级属性

| 属性名                 | 对象类型 | 值类型  | 取值范围                                         | 默认值           | 说明                                                         |
| :--------------------- | :------- | :------ | :----------------------------------------------- | :--------------- | :----------------------------------------------------------- |
| `GenMsgILSupport`      | Message  | Enum    | No: 0<br/>Yes: 1                                 | Yes: 1           | 指示报文是否由 COM 模块处理。选 "Yes" 则由 COM 处理，否则不由 COM 处理。 |
| `GenMsgSendType`       | Message  | Enum    | Cyclic: 0 <br/>NotUsed ... <br/>NoMsgSendType: 8 | NoMsgSendType: 8 | 指定 I-PDU 的发送行为，可与任意 `GenSigSendType` 组合使用。  |
| `GenMsgCycleTime`      | Message  | Integer | 0 ~ 65535                                        | 0                | 报文每次循环发送之间的时间，单位 ms。                        |
| `GenMsgCycleTimeFast`  | Message  | Integer | 0 ~ 65535                                        | 0                | 当至少一个 IfActive 信号的当前值与其默认值不同时，报文循环发送之间的时间（ms）。也适用于带重复发送的报文（即 `GenMsgNrOfRepetition > 0`）：此时表示每次重复之间的时间。 |
| `GenMsgDelayTime`      | Message  | Integer | 0 ~ 65535                                        | 0                | 相同标识符的不同报文两次发送之间的最小时间，单位 ms。        |
| `GenMsgStartDelayTime` | Message  | Integer | 0 ~ 65535                                        | 0                | 从 `Com_IpduGroupStart` 到该 I-PDU 循环部分首次发送之间的时间，单位 ms。 |
| `GenMsgNrOfRepetition` | Message  | Integer | 0 ~ 255                                          | 0                | 一次初始发送请求之后的发送重复次数。重复之间的时间需通过 DBC 属性 `GenMsgCycleTimeFast` 定义。 |

### 信号级属性

| 属性名                    | 对象类型 | 值类型          | 取值范围                                                     | 默认值           | 说明                                                         |
| :------------------------ | :------- | :-------------- | :----------------------------------------------------------- | :--------------- | :----------------------------------------------------------- |
| `GenSigSendType`          | Signal   | Enum            | Cyclic: 0<br/>OnWrite: 1 <br/> OnWriteWithRepetition: 2 <br/>OnChange: 3 <br/> OnChangeWithRepetition: 4 <br/>NotUsed<br/>NoSigSendType: 7 | NoSigSendType: 7 | 指定信号的发送行为。`OnChange` 仅支持长度 ≤ 4 字节的信号。⚠️ 注意：带重复与不带重复的发送类型组合使用时，报文将始终以带重复的方式发送。 |
| `GenSigStartValue`        | Signal   | Integer / Float | 0 ~ 2147483647                                               | 0                | 信号的默认值。字符串值类型可表示十六进制和整数值。           |
| `GenSigInactiveValue`     | Signal   | Integer         | 0 ~ 2147483647                                               | 0                | 指示信号无效值（invalid value）。                            |
| `GenSigTimeoutTime_<Ecu>` | Signal   | Integer         | 0 ~ 65535                                                    | 0                | 特定节点接收该信号时使用的超时时间，单位 ms。若为某报文配置了不同的 `GenSigTimeoutTime` 且未使用 update bits，则超时监控采用最短的超时时间（最强定义）。每个接收该信号的 ECU 都必须提供对应的属性定义 `GenSigTimeoutTime_<Ecu>`。 |



### 理解与关联要点

1. **`GenMsgSendType` 与 `GenSigSendType` 的关系**：报文级的发送类型可与信号级的发送类型任意组合。信号级 `OnChange` 有 4 字节长度限制，而 `OnChangeWithRepetition` 无此限制。

2. **`GenMsgCycleTimeFast` 的两种用途**：
   - 当存在 IfActive 信号且其值偏离默认值时，作为该报文的快速循环周期；
   - 当 `GenMsgNrOfRepetition > 0` 时，作为重复发送之间的间隔。

3. **`GenSigTimeoutTime_<Ecu>` 的命名规则**：这是**按接收节点定制**的属性，`<Ecu>` 需替换为实际 ECU 名称（如 `GenSigTimeoutTime_PSCM1`）。每个接收该信号的 ECU 都需要独立定义，DBC 中会体现为多个属性定义。

4. **`GenSigStartValue` 的类型**：原文写的是 Integer/Float，但说明中提到"字符串值类型可表示十六进制和整数值"，说明其底层在 DBC 中通常以 HEX 或 DEC 形式存储。

5. **与之前 DBC 的对应**：你之前的文件里出现的 `BA_ "GenMsgCycleTime" BO_ 901 450;`、`BA_ "GenMsgILSupport" BO_ 901 1;`、`BA_ "GenMsgSendType" BO_ 901 0;` 等，正是这些属性在 DBC 中的实际赋值形式。其中 `GenMsgSendType` 值为 `0` 即对应枚举的 `Cyclic`。

## AUTOSAR SecOC 模块属性

### 报文级属性

| 属性名                       | 对象类型 | 值类型  | 取值范围           | 默认值 | 说明                                                         |
| :--------------------------- | :------- | :------ | :----------------- | :----- | :----------------------------------------------------------- |
| `SC_Message`                 | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 若设为 "true"，该报文为认证报文，所有 `SC*` 属性都将生效。对应 AUTOSAR System Description 中的 `ISecuredPdu`。 |
| `SCP_AuthInfoTxLength`       | Message  | Integer | 0 ~ 512            | 28     | 认证报文的截断 MAC 长度。该长度与 `SCP_FreshnessValueTxLength` 之和必须对齐到字节边界。 |
| `SCP_DataId`                 | Message  | Integer | 0 ~ 65535          | 0      | 认证报文的 Data ID。                                         |
| `SCP_FreshnessValueId`       | Message  | Integer | 0 ~ 65535          | 0      | 认证报文的 Freshness Value ID。                              |
| `SCP_FreshnessValueLength`   | Message  | Integer | 0 ~ 512            | 48     | Freshness Value 的完整长度。                                 |
| `SCP_FreshnessValueTxLength` | Message  | Integer | 0 ~ 512            | 4      | 认证报文中截断的 Freshness Value 长度。                      |

### 节点–映射接收信号级属性

| 属性名            | 对象类型                | 值类型 | 取值范围           | 默认值 | 说明                                                         |
| :---------------- | :---------------------- | :----- | :----------------- | :----- | :----------------------------------------------------------- |
| `SC_Verification` | Node – Mapped Rx Signal | Enum   | No = 0<br/>Yes = 1 | No = 0 | 若某认证报文（`SC_Message = "true"`）中任一信号设为 "true"，则接收时验证整条报文。若所有信号均为 "false"，则不验证。对应 AUTOSAR System Description 中 `IPduPort` 的 `RxSecurityVerification` 参数。 |

### 理解与关联要点

1. **`SC_Message` 是总开关**：只有报文级 `SC_Message = Yes` 时，该报文才被视为认证报文，其上的 `SCP_*` 属性以及信号的 `SC_Verification` 才会被考虑。

2. **`SC_Verification` 的"或"逻辑**：它作用于 **Node – Mapped Rx Signal**（接收端某个节点对某个信号的映射关系），是关系型属性。一条认证报文中只要**任意一个**信号的 `SC_Verification = Yes`，整条报文在接收时就会被验证；全为 No 则不验证。这与 AUTOSAR 中 `IPduPort` 的 `RxSecurityVerification` 参数对应。

3. **长度约束**：`SCP_AuthInfoTxLength`（截断 MAC）与 `SCP_FreshnessValueTxLength`（截断 FV）之和**必须对齐到字节边界**，这是 SecOC 组帧的硬性要求。两者的默认值 28 和 4 相加为 32，是 4 字节对齐的常见配置。

4. **`SCP_FreshnessValueLength` 与 `SCP_FreshnessValueTxLength` 的区别**：
   - `SCP_FreshnessValueLength`：Freshness Value 的**完整长度**（默认 48）；
   - `SCP_FreshnessValueTxLength`：实际**传输的截断长度**（默认 4）。
   接收端需根据完整长度重建 FV，而线上只传截断部分以节省带宽。

5. **与之前 DBC 的对应**：你之前的 DBC 文件中有 `VehSpdLgtSecOC`、`AsyPinionAgReqSafe` 等带 SecOC 语义的信号/报文，这些 `SC_*` 属性正是用来配置它们的认证与验证行为的。

## AUTOSAR CANNM 模块属性

### 网络级属性

| 属性名                   | 对象类型 | 值类型  | 取值范围           | 默认值 | 说明                                                         |
| :----------------------- | :------- | :------ | :----------------- | :----- | :----------------------------------------------------------- |
| `NmType`                 | Network  | String  | NmAsr              | NmAsr  | 定义 NM 类型。AUTOSAR NM 网络必须设为 "NmAsr"。              |
| `NmAsrTimeoutTime`       | Network  | Integer | 1 ~ 65535          | 1000   | NM 网络超时时间。                                            |
| `NmAsrWaitBusSleepTime`  | Network  | Integer | 1 ~ 65535          | 750    | Wait Bus Sleep 时间。                                        |
| `NmAsrRepeatMessageTime` | Network  | Integer | 1 ~ 65535          | 400    | Repeat Message 时间。                                        |
| `NmAsrMessageCount`      | Network  | Integer | 1 ~ 256            | 64     | NM 可接收的 AUTOSAR NM 报文最大数量（报文范围）。<br/>取值必须是 **2 的 n 次幂**，且 n 为自然数。 |
| `NmAsrBaseAddress`       | Network  | Hex     | 0 ~ 0x1FFFFFFF     | 0x400  | NM 报文的基础地址。与 `NmAsrMessageCount` 共同确定 NM 报文范围：`<NmAsrBaseAddress> .. <NmAsrBaseAddress + NmAsrMessageCount - 1>`。<br/>取值必须是 `NmAsrMessageCount` 的整数倍。 |
| `NmAsrCanMsgCycleTime`   | Network  | Integer | 1 ~ 65535          | 100    | NM 报文循环时间。                                            |
| `NmAsrMessage`           | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 定义对应报文是否为 AUTOSAR NM 报文。                         |

### 节点级属性

| 属性名                   | 对象类型 | 值类型  | 取值范围           | 默认值 | 说明                                                         |
| :----------------------- | :------- | :------ | :----------------- | :----- | :----------------------------------------------------------- |
| `NmAsrNode`              | Node     | Enum    | No = 0<br/>Yes = 1 | No = 0 | 定义对应节点是否使用 AUTOSAR NM。                            |
| `NmAsrCanMsgReducedTime` | Node     | Integer | 1 ~ 65535          | 50     | 总线负载降低时的报文时间。该属性为节点特定，必须 **≥ ½ × `NmAsrCanMsgCycleTime`** 且 **< `NmAsrCanMsgCycleTime`**。 |
| `NmAsrCanMsgCycleOffset` | Node     | Integer | 0 ~ 65535          | 0      | NM 报文发送偏移量，必须小于 `NmAsrCanMsgCycleTime`。         |
| `NmAsrNodeIdentifier`    | Node     | Hex     | 0 ~ 255            | 0      | 具备任意地址能力（Arbitrary Address Capable）节点的默认地址。即 NM 报文 NID 中使用的 Node ID（如使用）。 |

#### 信号命名约定（字符串型，无默认值）

| 属性名             | 对象类型 | 值类型 | 说明                                                         |
| :----------------- | :------- | :----- | :----------------------------------------------------------- |
| `<SignalName>_CBV` | String   | —      | 在 DBC 中，若每条 NM 报文包含一个后缀为 `_CBV` 的 8 位信号，并映射到字节位置 N（N=0 或 1），则 N 被解释为 Control Bit Vector 的**全网统一位置**。 |
| `<SignalName>_SNI` | String   | —      | 在 DBC 中，若每条 NM 报文包含一个后缀为 `_SNI` 的 8 位信号，并映射到字节位置 N（N=0 或 1），则 N 被解释为 Node Identifier 的**全网统一位置**。 |

### 理解与关联要点

1. **`NmAsrBaseAddress` 与 `NmAsrMessageCount` 的配合**：两者共同定义 NM 报文的 CAN ID 范围。`NmAsrMessageCount` 必须是 2 的幂，`NmAsrBaseAddress` 必须是 `NmAsrMessageCount` 的整数倍——这是为了用地址位掩码快速识别 NM 报文（典型 AUTOSAR NM 实现方式）。你之前的 DBC 中 `BA_ "NmAsrBaseAddress" 1280;`（即 0x500）和 `BA_ "NmAsrMessageCount" 64;` 正是这一对配置。

2. **网络级 vs 节点级的分工**：
   - **网络级**（`NmAsrTimeoutTime`、`NmAsrWaitBusSleepTime`、`NmAsrRepeatMessageTime`、`NmAsrCanMsgCycleTime`）是全网统一的 NM 状态机时间参数；
   - **节点级**（`NmAsrCanMsgReducedTime`、`NmAsrCanMsgCycleOffset`、`NmAsrNodeIdentifier`）是各节点独立的参数。

3. **`NmAsrCanMsgReducedTime` 的约束**：必须满足 `½ × CycleTime ≤ ReducedTime < CycleTime`，用于总线负载降低（Bus Load Reduction）场景，避免所有节点同时发送造成拥塞。

4. **`_CBV` / `_SNI` 命名约定**：这不是普通属性值，而是**基于信号名后缀的约定**。工具通过信号名的 `_CBV` / `_SNI` 后缀来识别 Control Bit Vector 和 Node Identifier 信号的位置，从而保证全网 NM 报文结构一致。

5. **与之前 DBC 的对应**：你之前的文件中有大量 `NM_AW_xxx`、`NM_CS_xxx`、`NM_NodeID_xxx`、`NM_PNI_xxx`、`NM_RMR_xxx`、`PNC23_xxx` 等信号，以及 `BA_ "NmAsrNode" BU_ ADCUB 1;`、`BA_ "NmAsrNodeIdentifier" BU_ ADCUB 4;` 等属性，正是这套 AUTOSAR NM 配置在 DBC 中的落地形式。



## OSEK 直接 NM 模块属性

> 以下属性用于网络使用 OSEK-NM（直接网络管理）的场景。

### 网络级属性

| 属性名           | 对象类型 | 值类型  | 取值范围       | 默认值 | 说明                                                         |
| :--------------- | :------- | :------ | :------------- | :----- | :----------------------------------------------------------- |
| `NmType`         | Network  | String  | Vector         | Vector | 定义 NM 类型。无 OEM 特定功能的 OSEK-NM 网络必须设为 "Vector"。 |
| `NmMessageCount` | Network  | Integer | 16 ~ 256       | 128    | ECU 可接收的 OSEK-NM 报文最大数量（报文范围）。<br/>取值必须是 **2 的 n 次幂**，且 n 为自然数。 |
| `NmBaseAddress`  | Network  | Hex     | 0 ~ 0x1FFFFFFF | 0x400  | NM 报文的基础地址。NM 报文范围由该属性与 `NmMessageCount` 共同计算：`<NmBaseAddress> .. <NmBaseAddress + NmMessageCount - 1>`。<br/>取值必须是 `NmMessageCount` 的整数倍。 |

### 节点级属性

| 属性名             | 对象类型 | 值类型 | 取值范围           | 默认值 | 说明                                |
| :----------------- | :------- | :----- | :----------------- | :----- | :---------------------------------- |
| `NmNode`           | Node     | Enum   | No = 0<br/>Yes = 1 | No = 0 | 定义对应节点是否参与 OSEK-NM 通信。 |
| `NmStationAddress` | Node     | Hex    | 0 ~ 0xFF           | 0      | ECU 自身地址，供 OSEK-NM 使用。     |

### 报文级属性

| 属性名      | 对象类型 | 值类型 | 取值范围           | 默认值 | 说明                              |
| :---------- | :------- | :----- | :----------------- | :----- | :-------------------------------- |
| `NmMessage` | Message  | Enum   | No = 0<br/>Yes = 1 | No = 0 | 定义对应报文是否为 OSEK-NM 报文。 |

### 理解与关联要点

1. **`NmType` 的取值区分 NM 类型**：
   - `"NmAsr"` → AUTOSAR NM（见上一节）
   - `"Vector"` → OSEK-NM（无 OEM 特定功能）
   这是判断一个网络使用哪种 NM 机制的关键属性。

2. **`NmBaseAddress` 与 `NmMessageCount` 的配合**：与 AUTOSAR NM 的 `NmAsrBaseAddress` / `NmAsrMessageCount` 逻辑一致——`NmMessageCount` 必须是 2 的幂，`NmBaseAddress` 必须是 `NmMessageCount` 的整数倍，从而用地址位掩码快速识别 NM 报文范围。默认 `0x400`（1024）与 `128` 的组合是常见配置。

3. **`NmStationAddress` 是节点级属性**：这是 OSEK-NM 中每个 ECU 自己的站地址（0x00 ~ 0xFF），用于直接 NM 报文中的源节点标识。与 AUTOSAR NM 的 `NmAsrNodeIdentifier` 作用类似，但类型是 Hex 且范围更小（单字节）。

4. **网络级 / 节点级 / 报文级的分工**：
   - **网络级**：`NmType`、`NmMessageCount`、`NmBaseAddress` —— 全网统一的 NM 基础配置；
   - **节点级**：`NmNode`、`NmStationAddress` —— 各节点是否参与及自身地址；
   - **报文级**：`NmMessage` —— 标识哪条报文是 NM 报文。

5. **与 AUTOSAR NM 的对比**：

| 对比项        | OSEK-NM (direct)         | AUTOSAR NM                                     |
| :------------ | :----------------------- | :--------------------------------------------- |
| `NmType` 取值 | `Vector`                 | `NmAsr`                                        |
| 节点参与标识  | `NmNode`                 | `NmAsrNode`                                    |
| 报文标识      | `NmMessage`              | `NmAsrMessage`                                 |
| 报文数量      | `NmMessageCount`         | `NmAsrMessageCount`                            |
| 基础地址      | `NmBaseAddress`          | `NmAsrBaseAddress`                             |
| 节点地址      | `NmStationAddress` (Hex) | `NmAsrNodeIdentifier` (Hex)                    |
| 时间参数      | —（由节点内部配置）      | `NmAsrTimeoutTime`、`NmAsrWaitBusSleepTime` 等 |

> [!tip]
>
> **注意**：OSEK-NM 这一节**没有网络级时间参数**（如 Timeout、WaitBusSleep、RepeatMessage），这些在 OSEK-NM 中通常由节点本地配置而非 DBC 描述；而 AUTOSAR NM 的对应时间参数则通过 DBC 属性显式配置。

## 诊断 DCM / CANTP 模块属性

> 以下属性用于配置 DCM 与 CANTP 模块。

### 报文级属性

| 属性名           | 对象类型 | 值类型  | 取值范围           | 默认值 | 说明                                                         |
| :--------------- | :------- | :------ | :----------------- | :----- | :----------------------------------------------------------- |
| `DiagState`      | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 设为 Yes 表示：功能性（UDS）请求，CanTp 使用 Normal addressing。 |
| `DiagRequest`    | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 设为 Yes 表示：物理请求（Physical Request），CanTp 使用 Normal addressing。 |
| `DiagResponse`   | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 设为 Yes 表示：物理响应（Physical Response），CanTp 使用 Normal addressing。 |
| `DiagConnection` | Message  | Integer | 0 ~ 0xFFFF         | 0      | 通过相同取值将 `DiagRequest` 与 `DiagResponse` 归入同一个连接（Connection）。<br/>取值应按如下方式推导：`<TesterAddress><ServerAddr>`。也就是说需要将一组请求响应设置为同一个值，这样就可以让工具知道请求ID对应的哪个响应ID |
| `DiagFdOnly`     | Message  | Enum    | No = 0<br/>Yes = 1 | No = 0 | 指定 ECU 响应哪类诊断请求：<br/>• **No**（或不可用）：ECU 同时响应 CAN 2.0 和 CAN-FD 格式的诊断请求；<br/>• **Yes**：ECU **仅**响应 CAN-FD 格式的诊断请求。<br/>⚠️ 注意：请求报文与响应报文必须赋予相同的属性值。该属性对 CAN-2.0 帧无效。 |





### 理解与关联要点

1. **`DiagState` vs `DiagRequest` 的区别**：
   - `DiagState` 用于**功能性请求**（Functional Request，即 UDS 的功能寻址请求，通常广播到多个 ECU）；
   - `DiagRequest` 用于**物理请求**（Physical Request，即点对点寻址请求）；
   - `DiagResponse` 用于**物理响应**（ECU 对物理请求的回复）。
   三者都是报文级标记，配合 CanTp 的 Normal addressing 使用。

2. **`DiagConnection` 的配对逻辑**：它把一条 `DiagRequest` 和一条 `DiagResponse` 归为同一个诊断连接。取值规则为 `<TesterAddress><ServerAddr>` 拼接——例如 Tester 地址 0x7A0、Server 地址 0x7E0 时，两者共用同一个 `DiagConnection` 值来标识这是一对请求/响应。这是 CANTP 中建立请求-响应映射的关键。

3. **`DiagFdOnly` 的双向一致性**：请求报文和响应报文必须设置**相同的** `DiagFdOnly` 值。若设为 `Yes`，ECU 只处理 CAN-FD 格式的诊断请求，CAN 2.0 格式会被忽略；若为 `No`，两种格式都响应。该属性对 CAN 2.0 帧本身无影响，仅决定 ECU 的响应策略。

4. **与之前 DBC 的对应**：你之前的文件里有 `ZcudToPscmChasCanFD1DiagReqFrame`、`ZcudToAllFuncChasCanFD1DiagReqFrame`、`ZcudToRasmChasCanFD1DiagReqFrame` 等诊断报文，以及 `PscmToZcudChasCanFD1DiagResFrame` 等响应报文——这些正是通过 `DiagState` / `DiagRequest` / `DiagResponse` / `DiagConnection` 来配置的。例如功能请求 `ZcudToAllFunc...` 对应 `DiagState`，物理请求 `ZcudToPscm...` 对应 `DiagRequest`。

5. **Normal addressing 的含义**：CANTP 的 Normal addressing 表示报文 ID 直接决定请求/响应类型，不需要额外的地址信息字段。这三个报文级属性都标注了"CanTp Normal addressing will be used"，说明该配置适用于 Normal 寻址方式。

## XCP 与应用报文的定义

> 若某报文需由非 AUTOSAR 模块处理（如 XCP 或其他 CDD），则该报文不应被分配至以下任何一层。

### 必须设置的属性

| 属性名            | 必须取值           | 说明                 |
| :---------------- | :----------------- | :------------------- |
| `GenMsgILSupport` | No                 | 不由 COM 模块处理    |
| `NmMessage`       | No（或属性不存在） | 不是 OSEK-NM 报文    |
| `NmAsrMessage`    | No（或属性不存在） | 不是 AUTOSAR NM 报文 |
| `DiagState`       | No（或属性不存在） | 不是功能性诊断请求   |
| `DiagRequest`     | No                 | 不是物理诊断请求     |
| `DiagResponse`    | No                 | 不是物理诊断响应     |

### 信号定义要求

- 报文中**必须定义一个信号**，该信号**跨越整条报文**（即起始位为 0、长度等于报文总位长）。
- 该信号必须用于 DBC 中该报文的 **Rx 映射**（即作为接收节点的映射信号）。

### XCP 报文的识别规则

- 若报文名称中包含 **"XCP"** 或 **"CCP"**（**不区分大小写**），则该报文将被视为 **XCP 报文**。



### 理解与关联要点

1. **核心目的——"排除法"**：这一节本质上是用属性把报文从 AUTOSAR 各层（COM、NM、DCM）中"摘出来"。通过将 `GenMsgILSupport`、`NmMessage`、`NmAsrMessage`、`DiagState`、`DiagRequest`、`DiagResponse` 全部设为 `No`，明确告诉工具链：这条报文不归 COM / NM / DCM 管，而是由 XCP 或自定义 CDD 模块处理。

2. **"整帧信号"的作用**：要求定义一个跨越整条报文的信号，是为了让 DBC 在 Rx 映射时能完整"接住"这条报文的所有字节。因为 XCP/CCP 报文的数据内容由上层模块自行解析，DBC 层面只需提供一个能覆盖整帧的占位信号用于接收映射即可。这与你之前 DBC 中 `EtcToPscmChas1XcpFr01`、`PscmToEtcChas1XcpFr01` 等 XCP 帧的处理方式一致。

3. **命名识别规则**：名称含 "XCP" 或 "CCP"（大小写不敏感）即自动视为 XCP 报文，这是工具链的约定。你之前文件中的 `EtcToPscmChas1XcpFr01`、`EtcToTcmXcpFr01`、`PscmToEtcChas1XcpFr01` 等都属于这类。注意 `CCP` 是更早期的标定协议，规则把它和 XCP 归为一类处理。

4. **与之前 DBC 的对应**：你文件里那些 XCP 帧（如 `BO_ 1409 EtcToPscmChas1XcpFr01: 8 ETC`）在 DBC 中往往没有 `SG_` 信号行，或者属性中 `GenMsgILSupport` 等均为 No，正是遵循这条规则。如果它们缺少"整帧信号"，在严格校验时可能会被提示。

5. **"（或属性不存在）"的含义**：`NmMessage`、`NmAsrMessage`、`DiagState` 允许属性根本不存在于该报文的属性列表中，因为默认值本来就是 No，不存在等价于 No。但 `GenMsgILSupport`、`DiagRequest`、`DiagResponse` 明确要求设为 No。



## 更新位定义

> 为了在 DBC 文件中使用更新位（Update Bit），规范定义了一套命名约定。更新位因此被定义为一个具有特定特征的**独立信号**。更新位可用于信号和信号组。

### 命名与结构约定

| 规则           | 说明                                                         |
| :------------- | :----------------------------------------------------------- |
| **命名后缀**   | 信号（或信号组）`<X>` 的更新位，配置为一个名为 **`<X>_UB`** 的独立信号。 |
| **同报文约束** | 更新位信号 `<X>_UB` 必须与信号（或信号组）`<X>` **位于同一条报文**中。 |
| **位长**       | 更新位"信号"的位长必须为 **1 bit**。                         |

### 必须设置的属性

| 属性名            | 对象类型 | 必须取值      | 说明                                             |
| :---------------- | :------- | :------------ | :----------------------------------------------- |
| `GenMsgILSupport` | Message  | Yes           | 报文需由 COM 模块处理（与 XCP 报文的 No 相反）。 |
| `GenSigSendType`  | Signal   | NoSigSendType | 更新位信号的发送类型必须为 `NoSigSendType`。     |

### 系统描述中的处理

- 在系统描述（System Description）中，该更新位信号将被建模为 **AUTOSAR update bit**。
- 具体表现为：**移除该信号的普通信号定义，并添加一个 update bit**。

### 理解与关联要点

1. **更新位的本质**：更新位是一个 1 bit 的"标志位"，用来指示对应信号（或信号组）的值在本次报文中是否被**新更新**过。接收端可通过它判断信号值是新的还是旧的（未刷新），常用于避免重复处理未变化的信号。

2. **命名约定的强制作用**：`<X>_UB` 是硬性约定——工具链（如 Vector 的 DaVinci / CANdb++ 导入系统描述时）正是靠这个后缀识别哪个信号是更新位。你之前 DBC 中大量存在的 `_UB` 信号（如 `AD4CoolReqBkp_UB`、`AsyPinionAgReqSafe_UB`、`VehSpdLgt_UB` 等）正是这套机制的产物。

3. **`GenSigSendType = NoSigSendType` 的原因**：更新位不应作为独立的发送触发信号（它不单独驱动报文发送），其状态随所属信号/报文一起传输，因此发送类型设为 `NoSigSendType`。

4. **"信号" vs "信号组"**：更新位既可关联单个信号 `<X>`，也可关联一个信号组（通过 `SIG_GROUP_` 定义的一组信号）。当用于信号组时，`<X>` 即信号组名，`<X>_UB` 表示整组信号是否更新。

5. **在系统描述中的转换**：DBC 中它是一个普通 1 bit 信号，但在 AUTOSAR 系统描述（ARXML）中会被建模为真正的 update bit 属性（而非信号）。这意味着 DBC→ARXML 的转换过程中，工具会识别 `_UB` 后缀并把该信号"提升"为 update bit 语义，而非保留为普通信号。这是"Legacy Communication Descriptions"向 AUTOSAR 迁移的关键映射规则之一。

6. **与 `GenMsgILSupport = Yes` 的配合**：更新位只对由 COM 模块处理的报文有意义，因此要求所在报文 `GenMsgILSupport = Yes`。若报文是 XCP/CCD 报文（`GenMsgILSupport = No`），则不应使用更新位机制。

## 无效值定义

> 若要对某个信号使用 AUTOSAR 的无效值（invalid value）机制，需在 DBC 的值表（value table）中扩展一个名为 **"SNA"** 的值描述。该描述所定义的值，将作为所有发送或接收该信号的 ECU 使用的无效值。若信号的值表中没有 SNA 描述，则该信号不使用无效值特性。

### 规则要点

| 项目           | 说明                                                       |
| :------------- | :--------------------------------------------------------- |
| **触发条件**   | 需要对该信号启用 AUTOSAR invalid value 机制时              |
| **实现方式**   | 在 DBC 值表（`VAL_` 行）中增加一个值描述，名称为 **`SNA`** |
| **SNA 的取值** | 由该描述所指定的数值，即为该信号的无效值                   |
| **作用范围**   | 所有发送或接收该信号的 ECU 统一使用此值作为无效值          |
| **未定义时**   | 若值表中没有 `SNA` 描述，则该信号**不启用**无效值特性      |

### DBC 中的写法示例

以信号 `ExampleSig` 为例，其值表原本可能是：
```
VAL_ 123 ExampleSig 0 "Off" 1 "On" 2 "Error" ;
```
若要用 `SNA` 表示无效值（假设取值为 `3`），则扩展为：
```
VAL_ 123 ExampleSig 0 "Off" 1 "On" 2 "Error" 3 "SNA" ;
```

### 理解与关联要点

1. **`SNA` 的含义**：SNA 通常指 **Signal Not Available**，即"信号不可用"。在 AUTOSAR 中，当信号值无效或不可用时，发送端会填入这个约定值，接收端据此识别该信号当前无效，而非误当作正常数据使用。

2. **值表扩展而非新增属性**：这个机制**不依赖数据库属性**，而是直接利用 DBC 的 `VAL_`（值表）语法。通过给值表增加一个名为 `SNA` 的枚举描述来标记无效值——这是"Legacy Communication Descriptions"向 AUTOSAR invalid value 映射的轻量做法。

3. **全网一致性**：SNA 定义的数值是**全网统一**的，发送方和接收方都用同一个值判断有效性。这避免了各 ECU 各自约定不同无效值导致的歧义。

4. **"有则启用，无则不启用"**：这是显式的 opt-in 机制。信号值表里没有 `SNA`，工具链就不会为该信号生成无效值处理逻辑。因此，如果你的 DBC 里某个信号需要无效值语义，必须**手动在 `VAL_` 行里加上 `SNA` 描述**。

5. **与 `GenSigInactiveValue` 的区别**：注意不要混淆——
   - `GenSigInactiveValue`（COM 模块属性）：表示信号的**无效值**（invalid value），是属性级的数值配置；
   - `SNA`（本节的无效值定义）：是通过**值表描述**表达的 AUTOSAR invalid value 机制，两者都涉及"无效"语义，但载体不同（属性 vs 值表），具体用哪个取决于工具链和 AUTOSAR 映射规则。



## AUTOSAR 系统信号定义

> AUTOSAR 规定了一种称为 **"Signal Fan-out"（信号扇出）** 的机制，由 RTE 实现。借助该机制，应用可以写入**单个 SWC 数据元素**，而该元素随后通过**多个 COM 信号**发送出去。也就是说，同一个信号可以同时在多个网络的多条报文中传输。

### 命名约定实现方式

为使用 DBC 和 LDF 文件配置该机制，规范采用如下命名约定：

| 条件                                                         | 结果                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| 某节点发送 **n 个信号**，且这些信号具有**相同的信号名**、**相同的信号长度**、以及（若存在）**相同的值表** | 会创建 **n 个 COM 信号**，但只创建 **1 个系统信号（System Signal）** |
| RTE 访问该系统信号时                                         | 生成 **fan-out（扇出）/ fan-in（扇入）**，将信号值写入全部 n 个 COM 信号 |

### 支持范围

| 条件     | 说明                                               |
| :------- | :------------------------------------------------- |
| 文件类型 | **LDF** 和 **DBC** 均支持                          |
| 报文属性 | DBC 信号所在报文需满足 **`GenMsgILSupport = Yes`** |



### 理解与关联要点

1. **Signal Fan-out 的本质**：一个 SWC（软件组件）的数据元素在应用层只有一份，但需要同时在多条报文、多个网络上发送。RTE 通过 fan-out 把这一份数据"复制"到 n 个 COM 信号上，发送端各报文各取所需；接收端则通过 fan-in 把多路信号汇总回单一系统信号。**DBC 中通过"同名同长同值表"的约定来隐式表达"这 n 个 COM 信号属于同一个系统信号"**，无需额外的显式属性。

2. **判定"同一系统信号"的三个条件**：命名约定是核心——信号名相同、信号长度相同、值表相同（若有）。三者一致，工具链（如 Vector 的 DaVinci / System Description 导入）就会把这 n 个 COM 信号识别为同一个 AUTOSAR System Signal 的多路映射，从而生成对应的 RTE fan-out/fan-in 配置。你之前 DBC 里能看到同名信号在不同报文中重复出现（例如某些状态信号在主报文和备份报文中都有），正是这套约定的体现。

3. **"n 个 COM 信号 + 1 个系统信号"的映射关系**：DBC 层面看到的是 n 个独立 COM 信号（各自挂在各自的报文里），而 AUTOSAR 系统描述层面只有 1 个系统信号。这种"多对一"的映射正是 Legacy DBC 向 AUTOSAR 迁移时，工具自动生成 System Signal 与 RTE 连接关系的依据。

4. **`GenMsgILSupport = Yes` 的约束**：只有由 COM 模块处理的报文（`GenMsgILSupport = Yes`）才参与此机制。XCP/CCD 报文（`GenMsgILSupport = No`）不适用，因为它们不经过 COM 和 RTE 的信号处理路径。

5. **与 LDF 的统一**：该约定同时适用于 CAN 的 DBC 和 LIN 的 LDF，说明这是 Vector 工具链在"Legacy 通信描述 → AUTOSAR 系统描述"转换中统一的信号映射规则，而非 CAN 独有。

## 引用文件

[^1]: TechnicalReference_Asr_CanNm.pdf
[^2]: TechnicalReference_Asr_Com.pdf
[^3]: TechnicalReference_Asr_CanTp.pdf
[^4]: LIN Standard, Version 2.1
[^5]: Application Note AN-AND-1-106: Basic CAN Bit Timing, Version 2.0
[^6]: TechnicalReference_GenTool_CsAsrLegacyDb2SystemDesc_r_Vector.pdf, Version 1.5



















































































































