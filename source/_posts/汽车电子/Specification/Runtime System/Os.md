---
title: Os
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

这一节来介绍一下OS的一些小点点，这一章都是文字，估计比较枯燥乏味。对OS基础不太了解的朋友，这里推荐两篇网上好文：《 [AUTOSAR基础篇之OS(上)](https://blog.csdn.net/king110108/article/details/125026534) 》，《 [AUTOSAR基础篇之OS(下)](https://blog.csdn.net/king110108/article/details/125027088) 》。

AUTOSAR OS为了适应各种各种样的芯片，所以它需要良好的可扩展性来做支撑，说得简单点就是OS的功能可被灵活裁剪，AUTOSAR则根据功能扩展分成了四种扩展类型，分别是SC1 ~ SC4，其主要区别为：

![SC区别](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_14_0_54_image-20250805140053612.png)

# OS 基础

## Startup和Shundown

OS 操作系统的启动是通过调用“StartOS()”函数来实现。在标准的 AUTOSAR 项目中，StartOS 函数由 EcuM_Init 调用。OS系统可以设定不同的应用模式，用户可以在不同的应用模式下运行不同的应用程序，从而在不同的条件下实现不同需求，需要给StartOS指定应用模式参数。 OS系统支持多种应用模式共存，并提供配置选项供用户在系统配置阶段建立和选择所需的应用模式。一旦操作系统启动，应用模式就不能再更换，也就是说在系统运行过程中动态切换应用模式是不允许的。

StartOS()会对OS内部各组件进行初始化，激活自启动任务、报警或调度表。StartOS()的最后，会启动系统定时器，并触发第一次 任务调度 。如果用户使能了相关 Hook，StartOS 会在所有初始化完成之后，启动系统定时器、触发第一次任务调度之前，调用用户的 Hook，调用顺序为：

1. 调用 OsStartupHook，
2. 调用各个 OS-Application 的 OsAppStartupHook。

OS 操作系统的关闭是通过调用“ShutdownOS()”函数实现。“ShutdownOS()”函数会禁能所有中断,停止系统定时器运行，最终进入死循环。如果用户使能了相关 Hook，ShutdownOS 会在进入结尾处，进入死循环之前，调用用户的 Hook，调用顺序为：

1. 调用各个 OS-Application 的 OsAppShutdownHook。
2. 调用 OsShutdownHook。

## Task

OS 中任务的优先级是静态配置的，并且在系统运行过程中不会改变。任务优先级配置时，号码越大所标识的优先级越高，优先级 0 为系统的最低优先级。用户应按照这一原则制定和分配任务优先级。高优先级的任务先执行，相同优先级的任务遵循 FIFO （先进先出）的规则。

当 OS 符合类为 BCC1 或 ECC1 时，不支持任务的多次激活，不支持为不同的任务分配相同的优先级。因此每个优先级上有且只有一个任务。当 OS 符合类为 BCC2 或 ECC2 时，支持任务的多次激活，支持为不同的任务分配相同的优先级。此时 OS 会为每个优先级创建任务队列，队列深度与该优先级上任务的个数和最大激活次数相关。

OS根据任务是否会抢占有三个不同的配置，分别是：

1. 在完全抢占调度策略下，所有 OS 的任务均为可抢占的。高优先级任务会抢占低优先级任务。
2. 在完全非抢占调度策略下，所有 OS 的任务均为不可抢占的。任何任务在运行时，都不会被其他任务抢占。
3. 在混合调度策略下，用户可配置任务是否可抢占。

OS 中所有的任务都是静态配置的，在系统启动时就已经存在了。

可以使用系统服务函数“ActivateTask()”或“ChainTask()”来激活一个任务。

- 系统服务函数“ActivateTask()”将处于挂起状态的任务转换为就绪状态，如果在某任务运行过程中调用了 ActivateTask()，且当前任务为可抢占任务，则ActivateTask()会基于优先级进行任务调度。如果当前任务为不可抢占任务，则ActivateTask()不会触发调度。

- 系统服务函数“ChainTask()”会终止当前正在运行的任务，同时激活一个新任务，然后会触发一次系统调度。

  > [!tip]  
  >
  > 在真实应用，其实这两个函数用的不多，瞎勾吧用的话会对系统任务的运行状态造成不可控的时序因素。一般就是使用ActivateTask()来激活Extended Task，Extended Task只需要激活一次，Extended Task启动后，然后就是处于 WAIT 状态等待event，event发生执行后再次等待下一次event；而Basic Task则需要用Alarm来周期性激活，因为Basic Task每次运行完都需要调用TerminateTask()进入阻塞态。其实简单来说，Extended Task像是一个死循环，而Basic Task更像是一个Callback。

如果操作系统的符合类被配置成 BCC2 或者 ECC2，那么系统将支持任务的多次激活。系统中只有Basic Task能够进行多次激活，Extended Task只能激活一次。所以在配置Basic Task的时候都会配置一个参数叫做Task Activation，意思就是多次激活的次数限制，比方说一个Basic Task1被设置成5ms激活一次，但是此时OS被一个高优先级的任务block住没有时间来运行这个Task，那么这个任务就会出现被激活多次但是没有执行一次的情况，而这里的Task Activation则是限制这个被激活的次数，一旦超出这个次数，则OS会报错。

## Counter

OS 中有两类计数器：SystemCounter 和 UserDefinedCounter。

1. SystemCounter 指的是操作系统所使用的系统计数器，
2. UserDefinedCounter 指的是用户自行设定的、通常用于应用软件的计数器。

SystemCounter默认必须存在，该计数器只能通过 SystemTick 进行触发，用户不可修改。Tick 是指 SystemCounter 的计数基值。硬件定时器多久产生一个 Tick 是由 TickTime 确定，TickTime 的单位为μs，默认值为 1000μs。用户可以在配置工具中根据需求对 TickTime 的大小进行配置。为实现 SystemCounter，OS 会占用一个硬件定时器来周期性地产生 System Tick。OS会自动创建该硬件定时器的中断，用户可以更改定时器中断的优先级。

除 SystemCounter 外， OS 支持用户自定义的 counter。用户自定义的 counter 没有固定触发源，用户需要调用 IncrementCounter 触发自定义Counter 增加。例如在周期任务或其他的定时中断中调用，也可使用 Alarm 触发自定义 Counter，Alarm 的动作中可选择IncrementCounter。

## Alarm

Alarm相当于是一个软件定期器，可以使用Alarm进行定时，定时时间到后，执行相应的动作。Alarm支持的动作有：

1. 激活一个任务；
2. 设置一个事件；
3. 运行一个Alarm Callback函数；
4. 累加一个User Defined Counter。Alarm Callback只在 SC1 中提供。

有两种方法可以启动 Alarm，自启动的 Alarm在OS启动后就自动开启了。对于非自启动的 Alarm，用户需要调用 SetAbsAlarm()或SetRelAlarm()启动报警，设置报警的启动时间和周期。 SetAbsAlarm()和SetRelAlarm()的区别在于是相对延时还是绝对延时。

## Resource

OS 提供了Resource管理功能，用于解决任务或中断同时访问共享Resource时的协调问题。共享Resource可以是应用程序段、内存空间或者硬件外设等。OS 的Resource管理机制可以防止Resource死锁，任务优先级反转等问题。

GetResource()和ReleaseResource()用来进行锁住和释放Resource。这个时间就会出现优先级反转的情况，这样做是为了避免两个不同优先级任务访问相同Resource而出现互锁的情况，具体做法为：任务或中断调用 GetResource 获取Resource时，OS 会将任务或中断的优先级提升至最高优先级。之后，访问该Resource的其他任务或中断将无法抢占当前任务，直到该Resource被释放，Resource被释放时，OS 将会恢复该任务或中断的原先优先级。

因为任务的优先级为软件优先级，而中断的优先级为硬件优先级，这两种优先级不在一个层次，所以如果当一个Resource是任务和中断共享的，当该Resource被任务获取后，OS 将会锁定调度（所有任务和二类中断都不能抢占当前任务，包括与当前Resource无关的任务和二类中断），这样做是为了防止使用该Resource的中断被锁定的时间过长。

## Event

Event用于实现系统内不同的实体之间的同步，包括任务与任务进行同步或是任务与中断服务函数进行同步。只有扩展任务可以调用 WaitEvent 等待Event，调用 WaitEvent 后，任务不再运行，进入WAIT 状态。

任务和二类中断中可以调用 SetEvent 设置事件，另外Alarm，Schedule Table 也可以配置设置事件的动作。设置事件后，等待该Event的任务将恢复至 READY 状态。然后 OS 会基于当前系统的抢占策略，任务优先级的情况，确定何时恢复任务的运行。每个扩展任务支持最多 32 个事件。WaitEvent 和 SetEvent 均可以等待或设置多个事件。

## Interrupt

中断对整个MCU的重要程度不言而喻，连OS的基本架构都是基于三个中断来实现的。光拿对于中断的应用来说非常简单，其实就是配置中断处理函数的名称，在中断触发后，OS 经过预处理之后，会调用该处理函数。中断处理函数由用户实现。但是要是将中断合理的使用，使用的稳定还是需要对中断的机制要有一定的了解，不然就会出现一大堆问题。

AUTOSAR OS 将中断分为一类中断和二类中断。其中一类中断就比较简单粗暴，它跟传统意义上的中断执行是一样的，中断发生后直接打断当前运行任务（支持中断嵌套的话，也可以打断低优先级中断），然后运行中断服务函数，运行完之后直接回到打断处的地方继续运行；而二类中断则在结束后会触发任务调度，让任务调度来决定去哪里执行。

所以根据上面的区别，一类中断和二类中端触发时，两者所干的事情有所区别。对于一类中断来说，运行流程为：

1. 中断发生，打断当前运行状态
2. 保存恢复现场
3. 切换 OS Context
4. 调用用户的处理函数
5. 退出中断，回到原先状态继续执行

一类中断对于整个OS来说，纯纯粹粹就是一个强硬中断。正因为一类中断的简单粗暴，所以在使用它的时候，需要考虑的因素就比较多：

1. 在一类中断中，有很多涉及到OS操作的函数以及特征都不能被调用，比如一类中断不支持Resource；
2. 一类中断运行时，其内存访问权限和 OS 内核是一致的（最高权限）；
3. 一类中断没有独立的栈，其使用的是被其打断的任务或中断的栈。
4. 如果任务或二类中断使能了时间保护，一类中断不会暂停时间保护的计时。

---

对于二类中断来说，运行流程为：

1. 中断发生，打断当前运行状态
2. 保存和恢复程序上下文。
3. 切换 OS Context。
4. 记录中断嵌套的信息。
5. 处理被打断任务或中断，以及当前中断的时间保护。
6. 切换内存访问权限。
7. 切换堆栈。
8. 调用用户服务函数。
9. 退出中断，并触发任务调度， 如果当前有中断嵌套，则恢复程序上下文，恢复至被打断的中断。如果无中断嵌套，且没有更高优先级的任务被激活，则恢复程序上下文，恢复至被打断的任务。如果无中断嵌套，但有更高优先级的任务被激活，则切换至新的任务。

二类中断对于整个OS来说，则就相当于一个特殊Task了，它的开关是受OS控制的，但是也只就局限于开和关，二类中断的触发一般通过硬件来自动触发。一当OS调度被挂起，那么二类中断就会被屏蔽，不会被触发。

## Schedule Table

调度表可以帮助用户更方便的实现一系列具有时序要求的动作。首先说一下EP（Expiry Point），它相当于一个时间点执行对象，当时间到了，Schedule Table就会去执行这个EP，EP可触发多个Task或者触发多个Event，而一个Schedule Table 可配置多个 EP（Expiry Point）。 Schedule Table 可以配置为单次触发运行，或者周期运行，OS可支持同时运行多个调度表。 Schedule Table的EP执行规则由两个参数决定，分别是整个Schedule Table的Final Delay参数，还有每一个EP的Initial Offet参数，所以当一个调度表被启动后，它的运行流程如下：

![OS的任务调度表](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_14_57_15_%E6%9A%82%E5%AD%98.png)



首先在Tick 0处Schedule Table被启动，然后根据每一个EP的Initial Offet来决定EP的执行时刻，当最后一个EP执行后，最后等待Final Delay个Tick，整个Schedule Table运行结束如果Schedule Table配置成重复启动，那么此次运行后立即启动下一次Schedule Table的运行。

##  OS Context

OS Context就是当前OS所处的状态，这里的状态其实就是当前程序运行到哪里了，比如说Task内， 一类中断内，二类中断内，还是各种Hook内。不同的状态下，OS所能做的事情也是不一样的，所能做的事也可以简单的理解成能不能调用某些常用OS函数。具体如下图所示：

![OS服务函数1](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_15_0_47_%E6%9A%82%E5%AD%98.png)



![OS服务函数2](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_15_1_21_%E6%9A%82%E5%AD%98.png)



##  普通监测功能

在一般的AUTOSAR OS中，一般需要提供以下几种监测手段：

1. 堆栈检测将进行栈初始化，并且当发生栈溢出的错误现象时，可以及时告知用户并最终执行关闭 OS。当退出二类中断、退出任务时，系统会进行堆栈溢出检测，即检查当前中断或任务是否将预先配置的栈全部使用耗尽。
2. 系统提供 CPU 负载计算功能，调用相关函数，获取最近一次该周期内的系统负载率。
3. 当 OS 内部检测到故障后，OS 会将错误信息记录，比如传参错误，状态错误，总之就是导致函数未正常运行下去的各种错误。还可以定义用户Hook，当检测到错误时，可执行Hook函数。

# OS SC2

SC2类主要在SC1的基础上增加了时间保护功能，其主要保护的对象是OS所能管理的，即Task和二类中断，主要提供了三个保护手段，分别是

1. 任务和二类中断执行时间的保护；
2. 任务和二类中断最小执行时间间隔的保护；
3. 任务和二类中断锁定时间的保护。

## Execution time protection

执行时间保护简单点来说就是监测Task和二类中断不能运行的太慢，其运行的时间不能超过限值，执行时间保护包括任务预期执行时间的保护和中断预期执行时间的保护。主要有以下两点：

1. 如果任务或中断运行时间超出了其预期时间, OS 将会执行 ProtectionHook()函数，参数为E_OS_PROTECTION_TIME。
2. 当任务或中断被打断时，系统会停止任务或中断的执行时间计时，直到该任务或中断被恢复，系统继续对其执行时间计时。对于扩展任务，其状态由 RUNNING 转换成WAITING 时，系统会停止其执行时间计时，当其等待的事件被成功设置后，重新开始该任务的执行时间计时。

## Inter -arrival time protection

间隔时间保护说简单点就是监测Task和二类中断的不能运行的太快，其运行的频率不能高于限值，间隔时间保护包括任务间隔时间的保护和中断间隔时间的保护。主要有以下三点：

1. 如果尝试在小于任务时间间隔内再次激活任务，OS 将会调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，那么 OS 将会再次执行激活任务，否则不会执行真正的激活。
2. 如果用户尝试设置一个事件，但是相应的扩展任务运行间隔小于任务间隔时间，那么 OS 会调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，这个事件将会被设置成功，OS 将执行该扩展任务。
3. 如果一个二类中断发生的频次小于中断间隔时间，那么 OS 将不会执行该中断的用户处理函数，同时调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，该中断仍可被执行。

## Locking time protection

锁定时间保护说简单点就是去监测任务和二类中断在运行过程中，执行一个操作的时间不能超时，这里的操作时间包括：

1. 获取Resource的时间，GetResource()。
2. 禁用全局中断的时间，SuspendAllInterrupts()/DisableAllInterrupts()。
3. 禁用二类中断的时间，SuspendOSInterrupts()。

**注：** 当Execution time protection和 不同操作类型的Locking time protection在一个任务或者二类中断中同时使能了的话，以两者的最小值为准。

# OS SC3

SC3在SC1的基础上增加了OS-Application，

## OS-Application

前面提到的Task, ISR, Counter, Alarm, Schedule Table, Resource等玩意在AUTOSAR OS中称为Object， 然后AUTOSAR OS又提出了一个OS-Application的概念，这个玩意就是一个容器，可以在不同的OS-Application容器放置不同的Object。

OS-Application 分为两种：

1. 可信的，可信的 OS-Application 可以不受限制地访问内存。
2. 不可信的。不可信的 OS-Application则需要配置其可访问的内存范围。

系统中如何划分 OS-Application，取决于功能安全的分析。而对于Object，则需要配置其属于哪个OS-Application以及它可以被哪个OS-Application访问。结合这两点，则就可以实现一种权限访问监测手段。

## Service Protection

Service Protection其实就是制定了一些OS使用规则，防止OS-Application错误的使用了相关OS函数而造成了OS不稳定。主要包含这几种情况：

1. 参数无效或超出范围，系统 API 的对象无效（比如，该对象未被配置），则返回E_OS_ID，参数超出范围（比如，设置一个 Alarm 但 cycle 参数小于 OsCounterMinCycle）则返回 E_OS_VALUE。
2. 在不合理的上下文调用 API，在OS Context中不合理的调用 API，则 API 返回 E_OS_CALLEVEL。具体规则详见前面的OS Context。
3. 具有未定义行为的服务，这个保护的场景只要是：有些OS函数虽然被调用了，但是其检测到当前情况不合理，那么就会直接跳出，并不会实际执行，又或者是当发生OS Context时，OS应该需要做什么，但是你没做的话，OS会自动做。
4. 不可信应用中的服务限制，OS 会忽略来自不可信应用对 ShutdownOS()的调用。
5. 不同 OS-Applications 之间的 Objects 调用，如果 OS API 的参数是一个系统对象，但是该对象未被配置响应任务或中断的访问权限，那么系统 API 将返回 E_OS_ACCESS。

## Memory Protection

OS 提供内存保护功能，为每个任务/二类中断/OS-Application 配置指定的内存区域，并在访问越界时触发保护中断，从而确保系统的正常运行。每个任务/二类中断都有一个私有数据和堆栈空间，其他任务/中断无法访问这些数据和堆栈空间。OS-Application 还可以有一个私有数据区域，当前 OS-Application 中的任务/二类中断可以访问该区域，其他 OS-Application 的任务/二类中断无法访问。

## IOC

由于内存保护的存在，不同的 OS-Application之间的数据访问是受到OS管制的，所以OS 提供了 IOC 通道，实现 OS-Application 间的数据传递。在一些多核处理器上，不同核的OS-Application之间的通讯则需要将核心间通信能力整合到 IOC 中。

## Trusted Function

不可信 OS-Application 不允许访问其他 OS-Application 的数据，但在某些系统中，有一些不可信的 OS-Application 需要使用其他 OS-Application 服务。操作系统为可信应用提供了一种将其某些服务导出到不可信应用的方法。这称为Trusted Function。

# OS SC4

OS SC4是SC1, SC2, SC3的机会，即包含完整的AUTOSAR OS功能。

# MultiCore

## MultiCore Startup

内核的启动方式在很大程度上取决于硬件。通常，硬件只启动一个核心，称为主核心，而其他核心（从核）保持在停止状态，直到它们被软件激活。AUTOSAR 多核操作系统规范要求系统具有主从启动行为，可以由硬件直接支持，也可以由软件模拟。在多核中，在核上执行 StartOS 之前，必须激活 AUTOSAR 使用的每个从核。根据硬件的不同，可能只能从主设备激活可用内核的一个子集。从核可能会在调用 StartOS 之前激活其他核心。在 StartOS 的最后，会进行多核启动的同步。所有核都启动后，才会同步触发每个核
的首次的任务调度。

AUTOSAR 支持两种系统关闭概念，同步关闭和单独关闭概念。同步关闭由 API 函数 ShutdownAllCores()触发，而单个关闭由 API 函数 ShutdownOS()调用。如果具有适当权限的任务调用“ShutdownAllCores”，则会向所有其他 Core 发送一个信号，以引导关闭过程。

在多核概念下，Spinlock 机制用来支持不同核心上的任务互斥。Spinlock 是一种繁忙的等待机制，它轮询其状态直到它变为可用。使用GetSpinlock()函数占用一个 Spinlock，如果 Spinlock 已经被占用，GetSpinlock()将继续尝试占用 Spinlock，直到成功为止；使用TryToGetSpinlock()函数占用一个 Spinlock，如果 Spinlock已经被占用，TryToGetSpinlock()将返回；使用 ReleaseSpinlock()函数释放被占用的自旋锁。如果多个 Spinlock 存在嵌套使用的情况，则需要考虑使用顺序，防止死锁。

IPC（核间通信）是多核OS中一个最重要的一个环节，这一般跟芯片外设强相关。