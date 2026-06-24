---
title: E2E
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

E2E在AUTOSAR架构中，它被定义成是一个函数库。E2E 可以保护安全相关的数据交换，避免数据交换过程中通信链路造成的错误。E2E通信保护库实现了这些保护机制算法。E2E 的主要功能：

1. 为将要发送的安全相关的数据提供保护；
2. 对接收到的安全相关的数据进行校验；
3. 对接收到的安全相关的数据错误做出指示。

E2E模块保护数据的算法其实就是CRC，它主要就是定义了怎样使用一些特定的CRC算法来确保数据的准确性和连续性，E2E用在发送数据上叫做Protect，用在接收数据上叫做Check。

> [!tip] 
>
> 官方标准手册请参见[autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf](https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf)

E2E 模块可以被三个地方调用，分别是COM 模块中的COM callout ，E2E Transformer模块 和 E2E Protection Wrapper。当 E2E 库被 Transformer 和 Wrapper 调用时，需要在 Transformer 和 Wrapper 中对数据元素进行序列化。在 E2E 模块内部会调用 Crc 模块提供函数。

# 五种保护机制

E2E提供了一下五种保护机制来保护数据安全，如下：

1. CRC：发送端根据数据计算CRC值，接收端会重新计算并检查。
2. Sequence Counter: 发送端每次传输，该值都会加一，接收端会检查该值。
3. Alive Counter：发送端每次传输，该值都会加一，接收端会检查该值，通常跟Sequence Counter是一个东西（具体我也不知道有什么区别）。
4. Data ID：给每个数据或者I-PDU Group编号。
5. Timeout detection: 接收者接收超时，发送者响应超时。

为了同时满足保护机制的标准化和灵活性要求，E2E 模块提供了很多个 profile，包括P01、P02、P04、P05 和 P06，P07, P11, P22，它们之间的最大区别就在于每一个所采用的保护机制是以上五个保护机制的子集。

| Profile   | 保护机制                                                 | 发送描述                                                     | 最大保护数据长度 |
| --------- | -------------------------------------------------------- | ------------------------------------------------------------ | ---------------- |
| Profile01 | Counter(4bit)、Data ID(16bit)、 CRC8、Timeout monitoring | Data ID由Data ID Mode决定是否发送 ，Counter和CRC需要发送     | 30bytes          |
| Profile02 | Counter(4bit)、Data ID List(8bit)、 CRC8                 | Data ID 不会发送，仅用作 CRC计算，Counter和CRC需要发送       | 256bytes         |
| Profile04 | Counter(16bit)、Data ID(32bit)、CRC32、Length(16bit)     | Counter、Data ID、CRC、Length均会发送                        | 4096bytes        |
| Profile05 | Counter(8bit)、Data ID(16bit) 、CRC16                    | Data ID 不会发送，仅用作 CRC计算，Counter和CRC需要发送       | 4096bytes        |
| Profile06 | Counter(8bit)、Data ID(16bit)、CRC16、Length(16bit)      | Data ID 不会发送，仅用作 CRC 计算，Counter，CRC和Length需要发送 | 4096bytes        |
| Profile07 | Counter(32bit)、Data ID(32bit)、CRC64、Length(32bit)     | Counter、Data ID、CRC、Length均会发送                        | 未知             |
| Profile11 | Counter(4bit)、Data ID(16bit or 12bit)、CRC8             | Counter、Data ID、CRC均会发送                                | 30bytes          |
| Profile12 | Counter(4bit)、Data ID List(16*8bit)、CRC8               | Data ID 不会发送，仅用作 CRC计算，Counter和CRC需要发送       | 未知             |

1. 保护机制中包含Length的Profile支持保护不定长数据，其他则不支持。
2. 保护机制中的Data ID List指的是每一条消息的Data ID由Counter值去确定，所以需要静态定义Data ID和Counter的对应表格，这种机制就叫做Data ID List。
3. 当使用 profile4、profile5 和 profile6 保护数据时，如果需要保护的数据较长时，CRC 计算时间会较长，由于 E2E 模块的保护和检测功能都是同步执行的，可能会影响系统的实时性。
4. 每一种profile检测到错误时所采取的措施也是不一样的，至于每一种profile的工作机制大家可以参考官方规范手册[autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf](https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf)《AUTOS

# E2E的状态机

E2E profile 中对数据的检测只表示在单个周期内数据的正确性，E2E 的状态机则将固定次数内（reception window）的 profile 数据检测结果进行统一管理，并将处理后的状态提供给调用者，调用者可根据状态决定是否使用数据。E2E 各状态转换描述如下：

![E2E状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/2_17_17_19_%E6%9A%82%E5%AD%98.png)



 各个状态具体描述如下：

| 状态           | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| E2E_SM_DEINIT  | 未初始化状态，在此状态如果用户调用 E2E_SMCheck，返回 E2E_E_WRONGSTATE。 |
| E2E_SM_NODATA  | 无数据状态，调用 E2E_SMCheckInit，进入该状态。在该状态如果用户调用 E2E_SMCheck，检测的 profile 状态不 为 E2E_P_ERROR 和 E2E_P_NONEWDATA ， 则 进 入E2E_SM_INIT 状态，否则一直停留在此状态。 |
| E2E_SM_INIT    | 初 始 化 状 态 ， 在 reception window 内 ， 用 户 调 用E2E_SMCheck，更新 ErrorCounter 和OKCounter 的值。如果 ErrorCounter 的值小于等于设置的阈值并且 OKCounter大于等于设置的阈值，则进入 E2E_SM_VALID 状态。如 果 ErrorCounter 的 值 大 于 设 置 的 阈 值 ， 则 进 入E2E_SM_INVALID 状态。否则一直停留在该状态。 |
| E2E_SM_VALID   | 数 据 有 效 状 态 ， 在 reception window 内 ， 用 户 调 E2E_SMCheck，更新 ErrorCounter 和 OKCounter 的值。如果 ErrorCounter 的值小于等于设置的阈值并且 OKCounter大于等于设置的阈值，则停留在该状态。否则进入E2E_SM_INVALID 状态。 |
| E2E_SM_INVALID | 数 据 无 效 状 态 ， 在 reception window 内 ， 用 户 调 用E2E_SMCheck，更新 ErrorCounter 和 OKCounter 的值。如果 ErrorCounter 的值小于等于设置的阈值并且 OKCounter大于等于设置的阈值，则进入 E2E_SM_VALID 状态。否则一直停留在该状态。 |

# E2E Protection Wrapper

前面提到了E2E Protection Wrapper 属于 E2E 三种调用者之一，其位置比较特殊，它不属于BSW层，而是位于 RTE 之上，属于 SWC 层的一部分，其保护的数据需要为信号组的形式。其结构如下：

![E2E protect wrapper结构图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/4_8_21_45_%E6%9A%82%E5%AD%98.png)



E2E Protection Wrapper主要功能如下。

1. 负责将复杂数据元素进行序列化
2. 负责将调用 E2E Lib 时使用的数据结构实例化和初始化
3. 调用 E2E 接口对数据元素进行保护
4. 调用 RTE 接口接收和发送数据

E2E Protection Wrapper 为每组需要保护的数据元素生成一组接口，发送数据接口**E2EPW_Write_**<**p**>**_**<**o**> 和 **E2EPW_WriteInit_**<**p**>**_**<**o**> ，接 收数据接口**E2EPW_Read_**<**p**>**_**<**o**> 和 **E2EPW_ReadInit_**<**p**>**_**<**o**> 。 当 用 户 发 送 数 据 时 调 用**E2EPW_Write_**<**p**>**_**<**o**> ()接口，该接口将数据进行序列化，调用 E2E 的接口保护数据，调用 RTE 的数据发送接口发送数据；当用户接收数据时调用 **E2EPW_Read_**<**p**>**_**<**o**> ()接口，该接口调用 RTE 的数据接收接口接收数据，序列化接收数据，并调用 E2E 接口检查接收数据。

# E2E 错误反馈方式

当用户使用 E2E Protection Wrapper 调用 E2E 时，E2E 中检查的错误通过 E2E Protection Wrapper 中的返回值反馈给用户。该返回值为 32 位的无符号数，各字节代表不同的错误类型。**E2EPW_Write< p>_< o>**和 **E2EPW_Read< p>_< o>**返回值描述如下表。

| 函数类型 | 返回值 Byte3                                                 | 返回值 Byte2                                                 | 返回值 Byte1                             | 返回值 Byte0                                               |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| Write    | –                                                            | E2E_PxxProtect 函数 的 返 回 值 ， 当Byte1 为 E2E_E_OK时，该值才有效 | E2E ProtectionWrapper 实 时 检 查的结果  | Rte_Write 函数的返回值，当 Byte2 为E2E_E_OK 时，该值才有效 |
| Read     | E2E_PxxCheck 函数检查的错误状态，当Byte2 为 E2E_E_OK时，该值才有效 | E2E_PxxCheck 函数的返回值，当 Byte1为 E2E_E_OK 时，该值才有效 | E2E Protection Wrapper 实 时 检 查的结果 | Rte_Read 函数的返回值，当 Byte1 为E2E_E_OK 时，该值才有效  |

  E2E_PxxCheck 函数检查的错误状态描述如下表：

| 错误状态                   | 值   | 描述                                                         |
| -------------------------- | ---- | ------------------------------------------------------------ |
| E2EPW_STATUS_OK            | 0x0  | 数据被正确接收，无 crc、counter 等错误                       |
| E2EPW_STATUS_NONEWDATA     | 0x1  | 检查函数被调用，但是未收到新数据                             |
| E2EPW_STATUS_WRONGCRC      | 0x2  | 接收到新数据，但是存在 crc 或其他数据检查错误                |
| E2EPW_STATUS_SYNC          | 0x3  | 数据被正确接收，但是由于上次产生的检查错误，导致数据连续性检查需要进行数据同步 |
| E2EPW_STATUS_INITIAL       | 0x4  | 已接收数据，crc 正确，但是由于进行了初始化导致无法验证 counter 的正确性 |
| E2EPW_STATUS_REPEATED      | 0x8  | 已接收数据，crc 正确，但是 counter 重复                      |
| E2EPW_STATUS_OKSOMELOST    | 0x20 | 已接收数据，crc 正确，但是 counter 不连续，DeltaCounter 在可接受范围内 |
| E2EPW_STATUS_WRONGSEQUENCE | 0x40 | 已接收数据，crc 正确，但是 counter 不连续，DeltaCounter 超出可接受范围 |