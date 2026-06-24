---
title: EcuM
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

EcuM（ECU State Manager）模块它所管理的ECU状态特指ECU的上下电状态，因为在汽车电子中对ECU的上下电时序要求非常严格，AUTOSAR则特地为此整了一个EcuM模块来系列化这个过程。EcuM 模块位于 AUTOSAR 的系统服务层，透过 RTE 与用户直接交互，在基础软件中与 BswM、ComM 及驱动模块等交互。EcuM 模块主要功能如下：

1. ECU 状态处理
2. 管理系统启动流程
3. 管理系统关闭流程
4. 管理系统休眠、唤醒流程
5. 处理唤醒源确认
6. 设置 Bootloader 启动目标

> [!tip] 
>
> EcuM有两种EcuMFixed和EcuMFlex，其中EcuMFlex是在 AUTOSAR4.x 之后新增的规范文件，相应地原来的 EcuM 改称为 EcuMFixed。EcuMFlex主要是为了适应不同应用场景的各种不同需求，实现更加灵活的处理。所以在AUTOSAR官方文档中，[Specification of ECU State Manager (autosar.org)](https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_ECUStateManager.pdf)则对应的是EcuMFlex，[Specification of ECU State Manager with fixed state machine (autosar.org)](https://www.autosar.org/fileadmin/standards/R4.1.3/CP/AUTOSAR_SWS_ECUStateManagerFixed.pdf)则对应的是EcuMFixed。
>
> 

EcuMFixed和EcuMFlex主要区别在于 EcuMFixed 中的模式和状态是固定的，而 EcuMFlex 中删除了许多模式和状态，这些模式和状态的定义根据不同需求由 BswM 模块加以定义。因此EcuMFlex 也必须与 BswM 配合使用才能实现完整的模式和状态处理。

接下来则是介绍最常被使用的EcuM简单版EcuMFlex，至于EcuMFixed ，感兴趣的小伙伴可自行查阅资料研究。

# EcuM状态机

说到状态管理，那肯定是缺不了一套帅气且稳定的状态机，EcuMFlex的状态机如下图示：

![EcuM状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_8_17_58_%E6%9A%82%E5%AD%98.png)



1. **Startup阶段**: 即上电时序，上电或者Reset后则会进入Startup阶段，Startup又分为StartPreOS与StartPostOS两个阶段，顺利完成Startup后且满足条件后则进入UP阶段。
2. **UP阶段**：此时就是相当于ECU处于正常运行状态，当条件满足时，可以根据CPU是否进入到低功耗状态还是OFF状态或者复位操作，相应进入到Sleep阶段与ShutDown阶段。这里值得一提的是，在UP阶段，ECU状态的控制切换则完全由BswM接手，也就是说EcuM只管上下电以及休眠唤醒的时序。
3. **Sleep阶段**：在sleep阶段存在着两种CPU低功耗模式：Poll与Halt模式，后者比前者更节约电能且无需运行代码，具体采用哪个则可根据当初的系统设计而定。这里值得提一下的是，这里的低功耗模式则是那种最浅显的sleep，这个时候ECU还是有电的，CPU顶多处于打盹模式或者关闭和停止一些特殊功能。当唤醒源发生之后，ECU立马进入UP阶段。
4. **Shutdown阶段**：即下电时序，前后会经历OffPreOS与OffPostOS阶段，前者则是为Shutdown OS之前所做的准备，后者则是关闭OS之后，选择对应的函数执行关闭ECU还是重启ECU的操作。

# RUN和POST_RUN

在上面状态机切换中，多次提到了需要满足一些条件，EcuM才会切换模式，那么这里的条件指的是什么呢？那就是RUN和POST_RUN的请求和释放。

RUN和POST_RUN是用户（SW-C）对EcuM模块的两种模式请求。其中RUN 表示用户希望ECU处于正常运行状态，POST_RUN表示用户需要做休眠或关闭前的清理工作。用户需要通过 EcuM 模块接口来单独请求或释放 RUN 或 POST_RUN，而且请求和释放必须成对调用。EcuM 模块整合所有 SW-C 的请求，向 BswM 模块发起模式请求。基本规则为：

1. 当至少有一个 SW-C请求 RUN 时，EcuM 向 BswM 请求系统进入运行状态；
2. 当所有 SW-C 均释放 RUN，但仍有至少一个 SW-C 请求 POST_RUN 时，EcuM 向 BswM 请求进入POST_RUN 状态；
3. 当所有SW-C 的 RUN 和 POST_RUN 均释放时，EcuM 向 BswM 请求系统进入关闭状态。

一般使用情况为：当用户希望正常运行时，向 EcuM 请求 RUN。当应用停止运行且希望进行一些后处理时，应该先请求 POST_RUN，再释放 RUN。EcuM 和 BswM 会根据系统整体状态在适当时机切换到 POST_RUN 状态，且通知应用可执行清理工作。当执行完清理工作后，应用调用 EcuM 接口释放 POST_RUN，则系统会进入Sleep或者Shutdown过程。

# Startup阶段

上面提到Startup阶段其实就是上电流程，分为 StartPreOS 和 StartPostOS 两部分，以 OS 的启动为分界线。其实就是EcuM_Init()，那么在这个过程中，需要做些什么呢？

## StartPreOS 流程

1. 执行 EcuM_AL_SetProgrammableInterrupts()，主要负责关闭芯片的可编程中断，为初始化其他模块和启动操作系统做准备。如果系统启动代码已将中断关闭，则可通过配置参数将该步骤省略，否则需要在该函数中关闭中断。
2. 执行 EcuM_AL_DriverInitZero()，初始化**Init List 0**容器里面的驱动。
3. 执行 EcuM_DeterminePbConfiguration()，根据相关系统设计读取 Post-build 配置参数数据指针。
4. 检查配置数据一致性，检查在上一步得到得Post-build配置数据的有效性。
5. 执行 EcuM_AL_DriverInitOne()，初始化**Init List 1**容器里面的驱动。
6. 获取上次复位原因，通过读取MCU的特殊复位原因寄存器，获取此次ECU复位的复位源，根据复位源来进行不同处理。例如复位原因是唤醒复位时，则需要执行唤醒源确认等步骤；如果复位原因是电源上电，则需要对 EcuM RAM 的一些关键变量进行初始化。
7. 设置默认 Shutdown target，系统关闭有三种情况，称为三种 ShutdownTarget，分别为 SLEEP、RESET 和 OFF。SLEEP 是指系统进入低功耗状态，RESET 是指复位重新运行，OFF 是完全断电。
8. 执行 EcuM_LoopDetection()，这是一个 Callout 函数。
9. 执行 StartOS()，启动操作系统，入参为在 EcuM 模块配置的 OS 的 AppMode。该函数最终不会返回，因此 EcuM_Init()也不会返回。

## StartPostOS 流程

在 AUTOSAR OS 中 ， 需 要 配 置 一 个 自 启 动 任 务 。 在 该 任 务 中 ， 需 要 调 用EcuM_StartupTwo()，StartPostOs 存在于该函数执行过程中。该函数主要执行两个操作，调用 SchM_Init()和调用 BswM_Init()。当 BswM 模块成功初始化后，后续的初始化任务由 BswM 模块完成。EcuM 的启动流程也就此结束。

#  Init block

在上述上电流程中，提到了Init Block。现在很多MCU对初始化外设的时序都有严格要求，所以EcuM 设计了几个驱动初始化列表以满足不同需求，分别为EcuMDriverInitListZero、EcuMDriverInitListOne 和 EcuMDriverRestartList。

- EcuMDriverInitListZero 由 EcuM_AL_DriverInitZero()实现，在获取 Post-build参数前调用。用于初始化一些公共基础模块，以及获取 PB 参数所需要的硬件模块的驱动。
- EcuMDriverInitListOne 由 EcuM_AL_DriverInitOne()实现，在获取 Post-build参数后调用。用于初始化一些具有多套配置，且不依赖于操作系统的模块。
- EcuMDriverRestartList 由 EcuM_AL_DriverRestart()实现，在唤醒后用于重启一些驱动模块。

我们可以在配置 EcuM 模块时指定每个列表中包含的驱动模块，其中InitListZero和InitListOne中的模块不能重复，而重启列表一般来讲是前两个列表的子集，其中模块的相对顺序必须与前两个列表一致。

# Shutdown阶段

上面提到Shutdown阶段其实就是下电流程，其实就是Startup阶段的逆操作，关闭流程通过调用 EcuM_GoDown()触发。只有指定模块才能触发该流程 ，为此用户需要在配置工具上添 加EcuMGoDownAllowedUsers 并添加一个或多个用户。调用该接口时传入用户 ID。关闭过程分为 OffPreOS 和 OffPostOS 两个阶段，以OS 的关闭为分界线。

## OffPreOS 流程

OffPreOS 流程主要完成以下几个主要动作：

1. 执行 EcuM_OnGoOffOne()，这是一个集成代码，主要负责处理一些关闭前的特殊操作。需要根据芯片特性填充功能。
2. 执行 BswM_Deinit()，反初始化 BswM 模块。
3. 执行 SchM_DeInit()，反初始化 SchM 模块。
4. 检查唤醒事件，如果在关闭过程中发生挂起或确认的唤醒事件，则系统需要响应唤醒。所以若当前 Shutdown Target 为 OFF，EcuM 会将其更改为 RESET，即在执行完后续的关闭动作后将处理器复位，从而再次启动。若没有发生唤醒事件，则正常执行关闭流程。
5. 执行 ShutdownOS()，关闭操作系统。该函数会清理操作系统中的一些资源，最终调用ShutdownHook()。

## OffPostOS 流程

我们需要在函数ShutdownHook()中调用EcuM_Shutdown()，OffPostOS 流程则是在 EcuM_Shutdown()中实现。OffPostOS 流程分为两个步骤：

1. 调用EcuM_OnGoOffTwo()。用户可以在其中调用不依赖于操作系统的模块的反初始化或清理工作。
2. 根据前面设置的 Shutdown Target ， 分别调用EcuM_AL_Reset() 或EcuM_AL_SwitchOff()。用户需要在这两个函数中分别调用驱动来实现系统复位或关闭电源等工作，自此ECU完成Shutdown流程。

# Sleep和WakeUp

为了实现低功耗模式，在UP阶段，当应用软件不再执行操作，且在总线上满足休眠条件时（如CAN 网络的远程休眠条件满足），系统将进入休眠模式。这个休眠发起人BswM模块，而执行者则是EcuM模块，纯纯苦逼打工人。

在休眠前，需要调用 EcuM_SelectShutdownTarget()将休眠模式设置为 SLEEP，且需要设置具体的休眠模式。根据硬件芯片的不同，有些芯片可以处于不执行代码的状态，有些芯片会处于仍然执行代码的低频模式。需要根据这些硬件差异选择调用EcuM_GoHalt()或 EcuM_GoSleep()函数使 MCU 处于低功耗状态。进入休眠状态有三个步骤：

1. 预处理步骤
2. 休眠步骤
3. 唤醒重启步骤。

## 预休眠步骤

在预休眠步骤中，EcuM 首先会调用 BswM 模块接口报告唤醒源状态。然后 EcuM 模块要使能唤醒源以备将来的休眠。这是通过调用 EcuM_EnableWakeupSources()函数实现的。在该集成代码中，用户需要判断入参中每个比特，调用相应驱动的相应函数来将每个唤醒源使能。之后 EcuM 会调用 OS 的接口函数 GetResource()锁定调度功能，以备在将来唤醒中断处理完后仍然能返回当前进入休眠的任务中执行唤醒操作。

## 休眠步骤

上面提到Sleep分为两种模式，分别是Halt模式和Poll模式。

1. Poll 模式休眠步骤
   Poll 模式下 CPU 仍然执行代码，但以较低主频运行。这时 EcuM 将不停执行两个动作：调用 EcuM_SleepActivity()和调用 EcuM_CheckWakeup()。

   其中EcuM_SleepActivity()为集成代码，用户可以在其中执行低功耗状态下运行的工作。EcuM_CheckWakeup()也是集成代码，用户在其中根据入参遍历唤醒源，调用唤醒源驱动接口检查是否发生唤醒事件。如果发生唤醒事件，唤醒源应当调用EcuM_SetWakeupEvent()通知 EcuM。EcuM 会在检查完成后发现唤醒事件，触发唤醒步骤。

2. Halt 模式休眠步骤
   Halt 模式下 CPU 不再执行任何代码。在此模式下，为了防止可能出现的 RAM 内容破坏，EcuM 会调用 EcuM_GenerateRamHash()计算 RAM 的校验值。在EcuM_GenerateRamHash()中用户需要自行对关键内容计算检验并保存。之后 EcuM 会调用 MCU 驱动进入休眠模式，CPU 会停止处于打盹模式，只有唤醒中断会将 CPU 重新置于运行状态。并且触发唤醒重启步骤。

## 唤醒重启步骤

发生唤醒事件后，EcuM 会执行唤醒重启。首先恢复 MCU 为正常模式，然后获取唤醒源，并将已确认和已挂起的唤醒源禁止，保留其他唤醒源以备稍后唤醒。最后调用 EcuM_AL_DriverRestart()执行重启驱动列表，解锁操作系统的调度器。

在驱动重新初始化过程中，驱动应当检测是否自己是触发本次唤醒的唤醒源，如果是，则最终会调用 EcuM_SetWakeupEvent()通知 EcuM。执行完唤醒重启步骤后，系统进入 UP 状态，有些唤醒源仍需要验证有效性。

有些唤醒源会产生虚假唤醒事件，如电平跳变导致 CAN 收发器或 IO 唤醒。有些唤醒源需要在特定情况下才能真正唤醒，如系统只允许 CAN 网络管理报文唤醒节点，不允许应用报文唤醒。这些期望之外的复位源则需要使用 EcuM 模块的唤醒确认功能对唤醒源进行有效性确认和过滤，这也要求用户必须根据ECU的软硬件设计完成唤醒源确认策略设计。

# 进入Bootloader

在 ECU 需要重编程时，诊断仪与 Dcm 模块交互，设置 Bootloader 重编程有效标志后复位。

在AUTOSAR中实现该流程 ，需要由应用层调用 EcuM 模块的EcuM_SelectBootTarget()函数来记录下次启动的引导目标是应用、OEM Bootloader 还是System Bootloader。具体流程为：

1. 诊断仪发送请求切换编程会话；
2. Dcm 模块先通过Rte向应用请求复位 ，应用调用 EcuM 模块EcuM_SelectBootTarget()函数设置复位启动目标；
3. Dcm 向诊断仪发送 0x78 响应；
4. Dcm 调用集成代码的接口，用户在集成代码中设置 Bootloader 的重编程有效标志；
5. Dcm 通知 App 可以执行复位；
6. 当 App 完成复位前的清理工作后，请求 EcuM 复位。在 Shutdown阶段中最后调用 EcuM_AL_Reset() 时 ， 应当调用EcuM_GetBootTarget()来获取当前引导目标。并根据与 Bootloader 的交互协议设置相应标最后触发复位操作。

# Alarm Clock

EcuM 模块可以定义一个系统时间，基于 GPT 从上电复位开始以秒为单位运行。用户可以调用 EcuM_GetCurrentTime()获取系统自上电以来的运行时间。该时钟在休眠状态下仍然能正常运行，因此用户还可以用以作定时唤醒源来唤醒系统。