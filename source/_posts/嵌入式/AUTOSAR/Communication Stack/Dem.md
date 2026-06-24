---
title: Dem
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

 Dem(Diagnostic Event Manager，诊断事件管理), 用来记录和存储诊断事件的，将这些诊断事件及相关信息(冻结帧及扩展数据)记录到EEPROM。简单说其功能是：

1. 故障事件确认前的故障消抖
2. 故障事件确认时的故障数据存储
3. 故障发生后的故障老化
4. 故障替代（AUTOSAR的故障存储策略）

DEM模块相关的标准主要包括两部分：ISO 14229(UDS，车身域诊断遵循的主要标准)和ISO 15031(OBD，该标准制定较早，主要针对排放相关的诊断)。

主要诊断数据为：

1. DTC
2. 扩展数据
3. 冻结帧

Dem只要牵涉两个服务：

1. 读取DTC（0x19)
2. 清除DTC（0x14）

# 术语介绍

| **术语名称** | **英文名称**                  | **定义/说明**                                                |
| ------------ | ----------------------------- | ------------------------------------------------------------ |
| 操作周期     | Operation Cycle               | 定义要运行的检测的开始和结束条件。开始时启动故障检测，结束时停止检测。车身与底盘由OEM或供应商确定（如下电、休眠唤醒等），动力域存在其他标准规定。 |
| 监控周期     | Monitoring Cycle              | 检测时存在一系列条件，并非操作周期开始即检测错误，可分为周期型（Period）或事件型（Event）。需满足特定条件（如灯负载HSD开路故障需在输出打开时检测电流判断）。 |
| 确认阈值     | Confirmation Threshold        | 确认故障持续存在的**Operation Cycle数**，达到后将其认定为历史DTC，在老化（aging）或手动清除前，confirmed DTC状态位一直存储在EEPROM中。 |
| 老化计数     | Aging Counter                 | 连续报告**无故障**的Operation Cycle数。AgingCounter也就是处于老化中DTC的计数。当一个OpreationCycle没有检测到testFailed,AgingCounter就会自加1，同时DTC Status的BIT就会清0。当AgingCounter计数达到一定的阈值后，此故障已经完成了老化，可以自愈。同时DTC Status的BIT3清0。 |
| 老化阈值     | Aging Threshold               | 当Aging Counter达到此次数后，DTC的Confirmed状态位将被清除。  |
| 错误计数     | Fault Detection Counter (FDC) | 错误检测的计数，可设置步长（向上/向下计数，范围-128~127），用于过滤故障次数；支持jump down（检测通过时跳转至0或其他值并开始递减）。 |
| 扩展数据     | Extended                      | DTC状态Pending置位后保存在EEPROM中的数据，包含一系列DID（由BSW规定），常用数据包括：1. 错误计数（FDC，同上定义）；2. 老化计数（连续无故障的Operation Cycle数，达到老化阈值后清除DTC的Confirmed状态）。 |
| 冻结帧       | Freeze Frame                  | 记录故障发生时的工况（Snapshot，由一系列DID组成），当DTC状态位Confirmed由0置为1时记录Snapshot，用于后续故障分析（如环境温度、ECU供电电压等）。 |
| 消抖         | Debounce                      | 防止故障误报的功能（14229-1规定），通过TripCounter判断故障是否确认：- TripCounter默认0，范围-128~127；- 持续testPassed时计数至-128，BIT4、BIT6由1置0；- 检测到testFailed时从>0开始计数（故障计数比正常快），计数至127时，BIT2与BIT3置位（确认故障）。 |
| 快照         | Snapshot                      | 一群DID数据的集合，每个DTC在Confirm时生成，存储关键数据至NVM，诊断仪可通过19服务读取具体数据。 |

# DTC状态

DTC状态跟在DTC后面，DTC状态为1个字节，其8个bit位含义各不相同，如下表所示：

| bit位 | 名称                               | 中文释义               | 含义                                                         |
| ----- | ---------------------------------- | ---------------------- | ------------------------------------------------------------ |
| 0     | testFailed                         | 测试失败               | 通常来说，ECU内部以循环的方式不断地针对预先定义好的错误路径进行测试，如果在最近的一次测试中，==在某个错误路径中发现了故障，则相应DTC的这一个状态位就 要被置1，表征出错。== <br>虽然此时DTC的testFailed位被置1，但是它不一定被ECU存储到非易失性存储中， 只有当pendingDTC或confirmedDTC被置1时DTC才会被存储。而pendingDTC或 confirmedDTC被置1的条件应该是检测到错误出现的次数或时间满足某个预定义的门限。当错误消失或者诊断仪执行了清除DTC指令时，testFailed会再次被置为0。 |
| 1     | testFailedThisOperationCycle       | 本次操作周期测试失败   | ==该bit用于标识某个DTC在当前的operation cycle中是否出现过testFailed置1的情 况，即是否出现过错误。== <br>operation cycle的起始点是ECU通过网络管理唤醒到ECU通过网络管理进入睡眠， 对于没有网络管理的ECU，这个起始点就是KL15通断。通过bit 0我们无法判断某个DTC 是否出现过，比如，当前testFailed=0，说明当前这个DTC没有出错，如果 testFailedThisOperationCycle=1的话，就说明这个DTC在当前这个operationcycle中 出过错，但是当前错误又消失了。 |
| 2     | pendingDTC                         | 待处理DTC              | 根据规范的解释，==pendingDTC=1表示某个DTC在当前或者上一个operationcycle 中是否出现过。== <br>pendingDTC位其实是位于testFailed和confirmedDTC之间的一个状态，有的DTC被确认的判定条件比较严苛，需要在多个operationcycle中出现才可以被判定为 confirmed的状态，此时就需要借助于pendingDTC位。 pendingDTC=1的时候，DTC就要被存储下来了，如果接下来的两个operation cycle中这个DTC都还存在，那么confirmedDTC就要置1了。如果当前operationcycle 中，故障发生，pendingDTC=1，但是在下一个operationcycle中，故障没有了， pendingDTC仍然为1，再下一个operationcycle中，故障仍然不存在，那么pending DTC就可以置0了。 |
| 3     | confirmedDTC                       | 已确认DTC              | ==当confirmedDTC=1时，则说明某个DTC已经被存储到ECU的非易失性存储中==，说明这个DTC曾经满足了被confirmed的条件。 但是请注意，confirmedDTC=1时，并不意味着当前这个DTC仍然出错，如果confirmedDTC=1，但testFailed=0，则说明这个DTC表示的故障目前已经消失了。 将confirmedDTC重新置0的方法只有删除DTC，对应UDS的[0x14服务](##0x14：清除故障码)服务。 |
| 4     | testNotCompletedSinceLastCear      | 自上次清除后测试未完成 | 该bit用于标识自从上次调用了清理DTC的服务（UDS0x14服务）之后，==是否成功地执行了对某个DTC的测试==（不管测试结果是什么，只关心是否测了）。因为很多DTC的测试也是需要满足某些边界条件的，并不是ECU上电就一定会对DTC进行检测。<br> testNotCompletedSinceLastClear=1：自清理DTC后还没有完成过针对该DTC的测试。<br>testNotCompletedSinceLastClear=0：自清理DTC之后已经完成过针对该DTC的测试。 |
| 5     | testFailedSinceLastClear           | 自上次清除后测试失败   | 这个位与bit1：testFailedThisOperationCycle有些类似，后者标识某个DTC在当前 的operationcycle中是否出现过testFailed置1的情况，而testFailedSinceLastClear标识的是在==上次执行过清理DTC之后某个DTC是否出过错==。 testFailedSinceLastClear=0，自从清理DTC之后该DTC没有出过错。<br>testFailedSinceLastClear=1，自从清理DTC之后该DTC出过至少一次错。 |
| 6     | testNotCompletedThisOperationCycle | 本次操作周期测试未完成 | 这个位与bit4：testNotCompletedSinceLastClear类似，后者标识自从上次调用了 清理DTC的服务之后，是否成功地执行了对某个DTC的测试。而该参数则标识==在当前 operationcycle中是否成功地执行了对某个DTC的测试==。 <br>testNotCompletedThisOperationCycle=1：未成功完成过测试。<br>testNotCompletedThisOperationCycle=0：成功完成过测试。 |
| 7     | warningIndicatorRequested          | 警告指示灯请求         | ==某些比较严重的DTC会与用户可见的警告指示相关联==，比如仪表上的报警灯，或者 是文字，或者是声音。这个warningIndicatorRequested就用于此类DTC。<br>warningIndicatorRequested=1：ECU请求激活警告指示。<br>warningIndicatorRequested=0：ECU不请求激活警告指示。 <br>注意，如果这个DTC不支持警告指示，则这个位永远置0。 |

故障发生前后动作：

1. **故障确认前**：用户模块上报故障的Debounce防抖处理，确保对应故障不为误报故障。
2. **故障确认时**：故障事件确认时的故障数据存储至NVM，保证故障能长期保存。
3. **故障确认后**：故障的老化，替代，实现故障修复后，故障能被清除的功能。例如，仪表上的发动机故障灯，在发动机修好后一段时间后就会熄灭。

# Event

DTC只是展示给诊断仪使用者,Event才是DTC状态实际操控者，同时Event也是诊断NVM数据存储实际控制者。DTC是系统层面对于故障的描述，而Event是软件层面对故障监控的最小单元。

> 例子：某个电机故障会由电压过高造成，但软件是无法直接识别该故障,软件只能监控是否产生了电压过高的时间Event,从而计算出是否产生DTC.

多个event可以mapping 同一个DTC；而同一个event不能mapping 多个DTC；

DTC可以直接可见，但Event需通过进一步手段才能看到，有时仅对ECU供应商可见；

1. DTC代表某类event集中表现，而event则是某个DTC的具体实例；
2. event的优先级决定了DTC的优先级；
3. event之间的依赖关系决定了DTC的依赖关系；

EVENT上报方式为：周期调用Dem_SetEventStatus上报即为周期循环上报；当Event状态变化时，调用Dem_SetEventStatus上报为触发上报。