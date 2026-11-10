---
title: WdogM
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

在AUTOSAR架构中，看门狗的架构也是非常的简单，如下图：

![全功能的最终分层](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_11_35_58_%E6%9A%82%E5%AD%98.png)



服务层有WdogM（Wdog Manager)模块，主要为软件状态机，通过软件策略来实现一些监测功能，对上可汇报当前错误状态，对下可调用抽象层接口进行一系列不同类型的复位操作。ECU抽象层则有WdogIf模块，主要将各种看门狗模块进行抽象化管理，让上层服务层不用关心看门狗类型，直接闭着眼睛瞎操作就行了。MCAL层则就是各种类型看门狗的WdgDriver了，常用的有MCU内部看门狗，通过SPI通信协议来喂的外部狗，还有用PWM波来喂的外部狗等等。

对于WdogIf模块和MCAL中的各种WdgDriver，在这里就不多说了，接下来重点来看看WdogM模块，它才是AUTOSAR看门狗系统的精髓。

在介绍之前，介绍几个AUTOSAR术语：

| 名称                       | 描述                                                         |
| -------------------------- | ------------------------------------------------------------ |
| SE （Supervised Entities） | 被WdgM 监测的逻辑单元，一般可以为一个TASK，也可以是多个TASK的结合 |
| CP Checkpoints             | WdgM 的监测点，一个SE里面肯定会有一个或很多个CP              |
| Condition Value            | 喂狗条件，该 value 为 WdgDriver 硬件喂狗的条件， WdgDriver 每次正常喂狗，该值将减 1，当其为 0 时， WdgDriver 将停止喂狗。正常情况下， WdgM 将实时刷新该值，保证其不会为 0。 |
| Flow/Graph                 | 指的是一个完整程序流， WdgM 会监控其中的 CP 路径             |

WdgM 是 AUTOSAR 基础软件架构中的一个标准的软件模块，属于服务层（service layer）。它主要用于监控应用程序执行的可靠性，包括监控程序运行的周期和程序运行逻辑的正确性。WdgM 主要提供以下功能：

1. 监控位于 MCU 内的多个独立的应用程序，它们可以拥有独立的时序要求；
2. 对功能安全相关的任务和周期性功能（main function），进行逻辑流监控；
3. 每个 SE 可以具备单独的错误反应机制；
4. 根据 ECU 的状态和硬件的能力，支持看门狗的 Off\Slow\Fast 模式。

# WdogM喂狗机制

WdgDriver 负责操作硬件寄存器，进行实际的喂狗动作。 AUTOSAR 建议在中断中进行喂狗。 WdgDriver 在喂狗之前，需判断Condition Value是否大于 0，大于0时才进行喂狗。成功喂狗后，Condition Value–。

WdgM 负责刷新喂狗条件，在WdgM_MainFunction 会刷新Condition Value。刷新喂狗条件，即将Condition Value置为用户配置的大于 0 的值。 因此，如果 WdgM 运行出现问题，无法刷新Condition Value，则Condition Value会自减至 0，进而引起看门狗复位。

Condition Value的存在，使得 WdgM 可以更灵活的控制看门狗的复位时间，从决定复位到真正复位，可以留给用户更充分的准备时间。

# WdogM监测机制

WdogM提供三种监测机制，分别是：

1. Alive Supervision
2. Deadline Supervision
3. Logical Supervision。

## Alive Supervision

Alive Supervision 主要用来监控某个 SE 运行的周期是否正确。其基本原理是， 在待监控的 SE 中设置 CP，在固定时间内，监测该 CP 到达的次数。基本实现方式就是一开始需要用户配置一个上限值和下限值，在一个统计周期内，WdogM会计算出这个SE的运行次数，如果运行次数超出这个区间，则Alive 检测失败，否则 Alive 检测成功。

使用 Alive Supervision 的注意事项如下：

1. 同一 CP 不能隶属于多个 Alive Supervision；
2. Alive Supervision 监控到错误后，其 SE 的本地状态将首先切换至 FAILED ，并且 错 误 计 数 增 加 ， 如 果 Alive 错 误 计 数 超 过WdgMFailedAliveSupervisionRefCycleTol，则状态切换为 EXPIRED；
3. Alive Supervision 监控正确，其 SE 的本地状态如果为 FAILED ，错误计数减小，当错误计数减小到 0 后，其 SE 的本地状态将切换至 OK。

## Deadline Supervision

某些场景下，应用程序需要关注某段程序运行的时间，过长或过短都说明程序执行异常。在 WdgM 中，称之为 Deadline Supervision，抽象为监控两个 CP 之间运行的时间。Deadline Supervision 具体算法如下：用户将在 WdgM 中配置Deadline Supervision 的起始 CP、结束 CP、最小时间门限和最大时间门限。在运行到起始 CP 时启动 Deadline Supervision，在运行到结束 CP 时，计算运行时间是否配置合理范围内。

使用 DeadlineSupervision 的注意事项如下：

1. DeadlineSupervision 的两个 CP 必须属于相同的 SE；
2. DeadlineSupervision 的两个 CP 不能相同；
3. 同一 CP 可以属于不同的 Deadline Supervision；
4. Deadline Supervision 监控到错误后，其 SE 的本地状态将直接切换至 EXPIRED，进而引起全局状态的切换；
5. Deadline 监控的时间一般是 us 级别的，而 WdgM 的调度周期是 ms 级别的，因此WdgM 需要调用 AUTOSAR OS 提供的标准接口StatusType GetElapsedValue(CounterType CounterID, TickRefType Value,TickRefType ElapsedValue)，来读取时间。如果用户未使用 AUTOSAR OS，则也必须提供兼容的接口，才能使用 DeadlineSupervision。

## Logical Supervision

Logical Supervision主要用于监控应用程序的运行顺序是否正确，包括各个 SE 本地的运行路径的检查，和 SE 之间的全局路径检查。

# WdogM的状态机

WdogM模块里面有两种状态机，一种是针对SE的Local Supervision Status，还有就是针对整个WdogM模块的Global Supervision Status。

# Local Supervision Status

每个 SE都有一个专属独立的状态机，其状态转换关系描述如下：

![SE转换状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/4_8_55_32_%E6%9A%82%E5%AD%98.png)



| 路径编号 | 转换路径            | 转换条件                                                     |
| -------- | ------------------- | ------------------------------------------------------------ |
| 10       | 初始化-OK           | 调用 WdgM_Init，并且在初始化模式中，该 SE 是使能的。         |
| 11       | 初始化-DEACTIVATED  | 调用 WdgM_Init，并且在初始化模式中，该 SE 是禁能的。         |
| 3        | OK-FAILED           | 检测到 Alive 错误，并且错误次数未超过门限值。                |
| 2        | OK-EXPIRED          | 检测到 Alive 错误，并且错误次数超过门限值。 检测到 Deadline 或 Flow 错误。 |
| 7        | OK- DEACTIVATED     | 调用 WdgM_DeInit。 调用 WdgM_SetMode，并且在新的模式中，该 SE 是禁能的。 |
| 9        | DEACTIVATED-OK      | 调用 WdgM_SetMode，并且在新的模式中，该 SE 是使能的。 调用 WdgM_Init |
| 5        | FAILED-OK           | 在新的调度周期， Alive 错误消失，并且计数递减到 0，并且未检测到其他任何错误。 |
| 6        | FAILED- EXPIRED     | 检测到 Alive 错误，并且错误次数超过门限值。 检测到 Deadline 或 Flow 错误。 |
| 12       | FAILED- DEACTIVATED | 调用 WdgM_DeInit。 调用 WdgM_SetMode，并且在新的模式中，该 SE 是禁能的。 |

# Global Supervision Status

Global Supervision Status状态切换如下图所示：

![global supervision status状态转换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/4_9_1_17_%E6%9A%82%E5%AD%98.png)



一般来说，Global Supervision Status是根据各个 SE 的本地状态来变化的，变化规则描述如下：

1. 所有 SE 的状态均为 OK，或 DEACTIVATED 时，全局状态为 OK；

2. 一个或多个 SE 的状态为 FAILED，其他 SE 为 OK 或 DEACTIVATED 时，全局状态为FAILED；

3. 一个或多个 SE 的状态为 EXPIRED，全局状态为 EXPIRED；

4. 全局状态为 EXPIRED 超过 WdgMExpiredSupervisionCycleTol 个调度周期，全局状态切换为 STOPPED。

   下述情况下，也会发生全局状态切换：

5. 未初始化，或调用反初始化，全局状态切换为 DEACTIVATED；

6. 初始化时，全局状态切换为 OK；

7. 调用 WdgIf_SetMode 返回 E_NOT_OK，全局状态切换为 STOPPED；

8. 调用 WdgM_PerformReset，全局状态切换为 DEACTIVATED；

9. 调用 WdgM_SetMode 时，会引起各 SE 的本地状态变化，进而引起全局状态的变化，规则同上文描述。

下面描述了当WdgM模块的Global Supervision Status状态发生切换时，WdgM会进行相关操作：

1. Global Supervision Status为OK时，正常调用 WdgIf_SetTriggerCondition 刷新喂狗条件；
2. Global Supervision Status切换至 FAILED 时，正常调用 WdgIf_SetTriggerCondition 刷新喂狗条件。调用 BswM_WdgM_RequestPartitionReset，可以复位部分的 APP，该功能是可选的；
3. Global Supervision Status切换至 EXPIRED 时，正常调用WdgIf_SetTriggerCondition 刷新喂狗条件；
4. Global Supervision Status切换至 STOP 时，调用 WdgIf_SetTriggerCondition 将喂狗条件设置为 0，调用 Dem 上报错误事件，如果使能了 WdgMImmediateReset，会立即出发 MCU复位；
5. 所有的状态切换均会通知给上层。