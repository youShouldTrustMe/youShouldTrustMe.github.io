---
title: Dbc

categories: 
  - 编程语言
---



# 参考链接



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







