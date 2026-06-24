---
title: BswM
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

上一节介绍了一个非常夸张的EcuM模块，其中多次提到了BswM模块，这两个模块通常狼狈为奸，共同策划且并操作了整个ECU的状态切换。细细研究EcuM模块后就会发现它是比较别动的，都是当一些条件满足或者事件发生时，EcuM才会控制系统进行状态切换，它更像是一个大兵，只会吭哧吭哧干活，而这一节的BswM模块则是真正的指挥。

BswM 模块位于 AUTOSAR 基础软件架构中的服务层，实现对 BSW层和 SW-C的模式管理。BswM的处理流程如下图所示：

![BswM模块](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_8_54_15_%E6%9A%82%E5%AD%98.png)



BswM 模块主要提供两项功能：

1. 模式仲裁：模式仲裁是把各个 BSW 模块和 SW-C 模块的模式请求和模式指示收集起来，按一定的模式规则进行计算，得到仲裁结果。
2. 模式控制。模式控制是指根据仲裁结果，调用不同的动作列表，在动作列表中调用各个模块的函数或接口。

模式仲裁的规则和模式控制的动作列表都是用户可配置的，因此 BswM 的功能极大程度上依赖用户配置。

在上面提到BswM主要就是干两个事情，一个是模式仲裁，一个则是模式控制。

# 模式仲裁

1. `ModeRequestPort`：每个 BSW 模块或 SW-C 都可以通过 API 或服务向 BswM 报告或者申请状态，这里提到的接口或服务称为端口（Port），而状态则被称为模式（Mode）。申请状态则被称为模式请求（Mode Request），报告状态则被称为模式指示（Mode Indication）。模式请求通常来源于SW-C，也有可能来源于BSW模块，比如Dcm模块；模式指示则总是由BSW模块发出，比如<**bus**>Sm模块，EcuM模块等。每个端口需要配置一个默认模式，如果未配置则视为未定义。端口和模式两者拼合起来那就是ModeRequestPort。

2. `ModeCondition`：模式条件（ModeCondition）是模式仲裁时候的最小判断单元，如果模式条件关联了一个ModeRequestPort，则该条件会验证请求的模式或者指示的模式是否EQUAL或者NOT_EQUAL于某个模式，然后每一个ModeCondition判断完成后会返回TRUE或者FALSE。

3. `Logical Expressions`：使用AND、OR、XOR、NOT和NAND这些逻辑符将ModeCondition组合起来就是一则逻辑表达式，即Logical Expressions。

4. `Rules`：Rules就是当一则Logical Expressions计算结果为真后，BswM模块应该要采取什么样的措施，将措施和Logical Expressions对应起来，这就叫一条Rule。当模式发生变化时（这种叫做BSWM_IMMEDIATE）或者在BswM主函数运行时（这种叫做BSWM_DEFERRED）就会对Rules进行评估，评估Rules的这个过程即叫做模式仲裁，模式仲裁满足条件之后，则开始进行模式控制。下图就是一条简单Rule的的仲裁：

   ![模式仲裁](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_9_0_54_%E6%9A%82%E5%AD%98.png)

# 模式控制

1. `Action和Action List`：在前面模式仲裁的Rules中，提到了当一条Rule评估满足条件后BswM模块会执行相应的措施，这里的措施在模式控制中称为Action List。Action List是一组有序的Action，BswM 按顺序依次执行动作列表中的每个元素。元素有三种类型：

   1. 一个特定的动作（函数），BswM 会简单地执行该动作；

   2. 指向其他Action List的链接，BswM 将从被指向的Action List起始处依次执行到最后一条元素，这意味着Action List可以级联；

   3. 指向一条Rule的链接，BswM 对该Rule进行运算，根据结果执行其对应的Action List。

      ![模式控制](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_9_3_18_%E6%9A%82%E5%AD%98.png)

      如果Action List的某一条Action执行失败，则根据其属性 BswMAbortOnFail 决定是否继续执行。若配置为真，则中止整个Action List的执行；若配置为假，则继续依次执行后续的Action项。如果Action List配置了 BswMReportFailToDem，则 BswM 会在动作执行失败时向 Dem 模块报告事件，该事件需要在 BswM 模块中预先配置。
      基于Rule评估，动作列表有两种方式被执行：

      1. BSWM_CONDITION：条件执行，即每次评估规则时被执行。
      2. BSWM_TRIGGER：触发执行，即每次评估结果发生变化时才执行。

      如果为触发执行配置了一个True的动作列表，则BswM仅在相应规则的评估从False变为True时才会执行此动作列表。如果为触发执行配置了一个False的动作列表，则BswM仅在相应规则的评估从True变为False时才会执行此动作列表。如果为条件执行配置了一个True的动作列表，则BswM应在每次将相应规则评估为True时执行此动作列表。如果为条件执行配置了False的动作列表，则BswM应在每次将相应规则评估为False时执行此动作列表。

2. `SwitchPort和RteModeRequestPort`：RteModeRequestPort请求端口是请求更改应用程序模式，而SwitchPort是在BswM执行模式更改时用来接收通知。