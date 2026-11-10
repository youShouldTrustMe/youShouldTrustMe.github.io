---
title: StbM
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

在上一节已经说到StbM（Synchronized Time Base Manager）模块负责抽象基于不同传输介质的AUTOSAR时间同步协议，为整个软件系统来提供时间同步之后的全局时间戳。StbM 模块主要功能如下：

1. 提供同步时间；
2. 管理同步时间的状态；
3. 时间路由。

StbM 模块在AUTOSAR架构中与其他模块的交互情况如下图所示：

![StbM模块](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_39_28_%E6%9A%82%E5%AD%98.png)



可以看到StbM模块透过 RTE 与用户直接交互。在基础软件中与< Bus >TSyn 和 OS 模块交互。对于StbM模块而言，AUTOSAR给其整了三种用户，分别是Active Customer， Notification Customer，Triggered Customer，这三种用户的含义如下：

1. Active Customer：可以主动调用StbM模块函数进行相关操作的用户，该用户只能是SWC。
2. Notification Customer：只能被StbM模块被动发送通知的用户，该用户只能是SWC。
3. Triggered Customer：只能被StbM模块主动调用函数进行相关操作的用户，该用户只能是OS。

图中的序号代表的具体操作为：

1. StbM主动调用TriggerCustomer提供的函数接口来完成时间同步，基本上都是同步OS Schedule Table；
2. Active Customer(SWC)主动调用StbM提供的标准接口来获取当前时间戳或者时间同步状态；
3. Active Customer(SWC)主动调用StbM提供的标准接口来更新StbM维护的时间基准；
4. StbM模块通过通知函数通知Notification Customer(SWC)有事件发生，事件有：Time Base的状态发生改变；Time Base到达一个Notification Customer(SW-C)提前设置好的未来时间值。
5. Notification Customer(SWC)主动调用StbM提供的标准接口来设置过程④中的未来时间值。
6. StbM模块通过 <**bus**>Tsyn模块提供的标准接口来更新StbM的时间基准；
7. StbM模块主动通过Tsyn模块提供的标准接口来将当前的时间信息发送到相应的bus总线上。

# 时间同步

一个时间同步网络包含一个时间主节点和至少一个时间从节点。时间主节点通过时间同步报文将全局同步时间发送给每个时域上连接的时间从节点。时间从节点正确接收和处理时间同步报文后，更新本地时间并继续运行，直到下次收到时间同步报文。时间同步框架如下图所示：

![时间同步的角色](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_17_55_%E6%9A%82%E5%AD%98.png)



1. **Time Master**：当 ECU 作为一个时基的时间主节点时，该 ECU 的 StbM 模块可以为<**Bus**>TSyn 模块提供精确的时间并发起时间同步操作（即往对应总线上发时间同步报文），<**Bus**>TSyn 将从 StbM 获取到的精确时间通过时间同步报文发送给网络中的时间从节点。同时应用也可以通过 Rte 获取该时基的精确时间，但不能修改该时基的时间值，但是如果该 ECU 是Time Domain的全局时间主节点，则应用可通过 Rte 设置该时基的时间值。
2. **Time Slave**：当 ECU 作为一个时基的时间从节点时，<**Bus**>TSyn 基于接收时间同步报文中的时间和自己本地的时间，计算得到精确时间，然后调用 StbM 模块函数调整该时基的时间值, SWC通过 Rte 仅可以读取该时基的时间值。
3. **Time Gateway**：时间网关是一个时基同时由时间主节点和时间从节点引用，该时基的时间值更新过程和使用方法是单独时间主节点和时间从节点的综合。

# Time Base Status

每个时基都有一个状态字节，高 4 位预留，低 4 位分别表示 TimeOut(Bit0)，TimeLeap(Bit1)，SyncToGateway(Bit2)和 GlobalTimeBase(Bit3)。初始化完成后，所有时基状态字节的值为 0x00。

1. GlobalTimeBase(Bit3)
   当 应 用 成 功 调 用 **StbM_SetGlobalTime**() 或 者 <**Bus**>TSyn 成 功 调 用**StbM_BusSetGlobalTime**()后，GlobalTimeBase(Bit3)被置位为 1，直到下次初始化才会被清除为 0。
2. SyncToGateway(Bit2)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，SyncToGateway(Bit2)的值都将根 据 该 函 数 的 入 参 syncToTimeBase 更 新 。 若 syncToTimeBase 为 1 ， 则 设 置SyncToGateway(Bit2)等于 1，若 syncToTimeBase 为 0，则设置 SyncToGateway(Bit2)等于0 。 若 连 续 两 次 调 用 **StbM_BusSetGlobalTime**() 的 时 间 间 隔 大 于 配 置 参 数**StbMSyncLossTimeout** 的值，则设置 SyncToGateway(Bit2)等于 1，该操作是在主函数中进行的。每次应用成功调用 **StbM_SetGlobalTime**()，SyncToGateway(Bit2)都将被设置为 0。
3. TimeLeap(Bit1)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，StbM 都会把将要更新的时间值与本地时间值比较，若两个时间之间的差值大于配置参数 StbMSyncLossThreshold 的值，则设置 TimeLeap(Bit1)为 1，否者设置为 0。
4. TimeOut(Bit0)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，都将设置 TimeOut(Bit0)等于 0。若 连 续 两 次 调 用 **StbM_BusSetGlobalTime**() 的 时 间 间 隔 大 于 配 置 参 数StbMSyncLossTimeout 的值，则设置 TimeOut(Bit0)等于 1，该操作是在主函数中进行的。