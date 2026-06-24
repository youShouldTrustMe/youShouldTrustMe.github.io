---
title: Autosar概述
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# **参考链接**

[ 搞一点AutoSar-墨客博客 (xcnm.net)](https://xcnm.net/archives/gao-yi-dian-autosar-yi-zhang-tu-bang-ni-li-jie-cantong-xin-quan-guo-cheng)

[CAN BusOff相关知识点_busoff基础知识-CSDN博客](https://blog.csdn.net/king110108/article/details/73917512)

[CAN Busoff原理/快慢恢复介绍以及利用Vector VH6501 CAN干扰仪经典CAN2.0/CANFD帧触发Busoff_网络_汽车电子助手-GitCode 开源社区](https://gitcode.csdn.net/65ec47911a836825ed796575.html?dp_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Nzk5NDg2MiwiZXhwIjoxNzQ3Mjg5OTcxLCJpYXQiOjE3NDY2ODUxNzEsInVzZXJuYW1lIjoicXFfNDQ4NDQ1MTUifQ.ww7MTvppS6senQKMwVt_SuJQZBunxh2sLSnOHSehLK4)

[CANalyzer及CANOE使用六：VH6501干扰仪的使用（busoff多种干扰/短路/采样点）_基于vh6501的can干扰测试-CSDN博客](https://blog.csdn.net/qq_36407982/article/details/122054927)

[AUTOSAR Classic Platform](https://www.autosar.org/standards/classic-platform)

[AUTOSAR_TR_BSWModuleList.xls](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_TR_BSWModuleList.pdf)

[AUTOSAR Layered Software Architecture](https://autosar.org/fileadmin/standards/R19-11/CP/AUTOSAR_EXP_LayeredSoftwareArchitecture.pdf)

> 以下内容多基于标准文件及[墨客博客 (xcnm.net)](https://xcnm.net/)的博客加上我自己的理解写的，感兴趣可以去看原博客及标准文件。

# 常见缩写

详细请参见[AUTOSAR_TR_BSWModuleList.xls](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_TR_BSWModuleList.pdf)

## 基础电子与控制单元

| 缩写    | 英文全称                                                    | 中文含义                               |
| ------- | ----------------------------------------------------------- | -------------------------------------- |
| ECU     | Electronic Control Unit                                     | 电子控制单元（如发动机ECU、车身ECU等） |
| MCU     | Microcontroller Unit                                        | 微控制器（ECU的核心芯片）              |
| VCU     | Vehicle Control Unit                                        | 整车控制器（新能源汽车核心）           |
| BCM     | Body Control Module                                         | 车身控制模块（灯光、门窗等）           |
| ECM/PCM | Engine Control Module / Powertrain Control Module           | 发动机控制模块 / 动力总成控制模块      |
| TCM     | Transmission Control Module                                 | 变速箱控制模块                         |
| ABS     | Anti-lock Braking System                                    | 防抱死制动系统                         |
| ESP/ESC | Electronic Stability Program / Electronic Stability Control | 电子稳定程序/控制系统                  |
| EPS     | Electric Power Steering                                     | 电动助力转向系统                       |

## 自动驾驶与辅助驾驶

| 缩写  | 英文全称                           | 中文含义                                     |
| ----- | ---------------------------------- | -------------------------------------------- |
| ADAS  | Advanced Driver Assistance Systems | 高级驾驶辅助系统                             |
| AD    | Autonomous Driving                 | 自动驾驶                                     |
| L0-L5 | Level 0-5 (Automation Levels)      | 自动驾驶等级（0级无自动化到5级完全自动驾驶） |
| ACC   | Adaptive Cruise Control            | 自适应巡航控制                               |
| AEB   | Automatic Emergency Braking        | 自动紧急制动                                 |
| LKA   | Lane Keeping Assist                | 车道保持辅助                                 |
| APA   | Automatic Parking Assist           | 自动泊车辅助                                 |
| FSD   | Full Self-Driving (Tesla)          | 完全自动驾驶（特斯拉术语）                   |
| LiDAR | Light Detection and Ranging        | 激光雷达（环境感知传感器）                   |
| RADAR | Radio Detection and Ranging        | 雷达（毫米波雷达等）                         |
| CV    | Camera Vision System               | 视觉摄像头系统                               |

## 通信与网络

| 缩写     | 英文全称                                        | 中文含义                                         |
| -------- | ----------------------------------------------- | ------------------------------------------------ |
| CAN      | Controller Area Network                         | 控制器局域网（车内低速/中速通信总线）            |
| CAN FD   | Controller Area Network with Flexible Data-Rate | 灵活数据速率CAN（高速高带宽）                    |
| LIN      | Local Interconnect Network                      | 本地互联网络（低成本低速总线）                   |
| FlexRay  | FlexRay Communication System                    | FlexRay通信系统（高可靠性实时总线）              |
| Ethernet | Automotive Ethernet                             | 汽车以太网（高速通信，如100BASE-T1/1000BASE-T1） |
| V2X      | Vehicle-to-Everything                           | 车对外界信息交换（V2V、V2I、V2P等）              |
| DoIP     | Diagnostics over Internet Protocol              | 基于IP的诊断协议                                 |
| SOME/IP  | Scalable service-Oriented Middleware over IP    | 基于IP的面向服务中间件                           |

## 软件与架构

| 缩写      | 英文全称                          | 中文含义                            |
| --------- | --------------------------------- | ----------------------------------- |
| RTE       | Runtime Environment               | 运行时环境（AUTOSAR架构核心）       |
| BSW       | Basic Software                    | 基础软件（AUTOSAR架构中的底层软件） |
| MCAL      | Microcontroller Abstraction Layer | 微控制器抽象层（BSW的底层模块）     |
| ECUAL     | ECU Abstraction Layer             | ECU抽象层（BSW的中间层）            |
| OS        | Operating System                  | 操作系统（如QNX、Linux、VxWorks）   |
| OTA       | Over-the-Air                      | 远程在线升级（软件更新）            |
| HMI       | Human-Machine Interface           | 人机交互界面（如中控屏、仪表盘）    |
| FOTA/SOTA | Firmware/Software Over-the-Air    | 固件/软件远程升级                   |
| API       | Application Programming Interface | 应用程序编程接口                    |

## 新能源汽车相关

| 缩写 | 英文全称                        | 中文含义                     |
| ---- | ------------------------------- | ---------------------------- |
| BMS  | Battery Management System       | 电池管理系统（监控电池状态） |
| MCU  | Motor Control Unit              | 电机控制器（控制驱动电机）   |
| OBC  | On-Board Charger                | 车载充电机（交流充电）       |
| DCDC | DC-DC Converter                 | 直流转换器（高压转低压）     |
| HV   | High Voltage                    | 高压（如高压电池、电机系统） |
| LV   | Low Voltage                     | 低压（如12V/24V车载系统）    |
| EV   | Electric Vehicle                | 电动汽车                     |
| HEV  | Hybrid Electric Vehicle         | 混合动力汽车                 |
| PHEV | Plug-in Hybrid Electric Vehicle | 插电式混合动力汽车           |
| FCEV | Fuel Cell Electric Vehicle      | 燃料电池电动汽车             |

## 诊断与标准

| 缩写    | 英文全称                                                     | 中文含义                                   |
| ------- | ------------------------------------------------------------ | ------------------------------------------ |
| DTC     | Diagnostic Trouble Code                                      | 诊断故障码                                 |
| UDS     | Unified Diagnostic Services                                  | 统一诊断服务（ISO 14229标准）              |
| ISO     | International Organization for Standardization               | 国际标准化组织（如ISO 15031诊断标准）      |
| AUTOSAR | Automotive Open System Architecture                          | 汽车开放系统架构（软件标准化协议）         |
| ASPICE  | Automotive Software Process Improvement and Capability Determination | 汽车软件过程改进与能力测定（软件质量标准） |
| DCM     | Diagnostic Communication Manager                             | 诊断通信管理器                             |

## 其他重要缩写

| 缩写   | 英文全称                                            | 中文含义                        |
| ------ | --------------------------------------------------- | ------------------------------- |
| EEPROM | Electrically Erasable Programmable Read-Only Memory | 电可擦除可编程只读存储器        |
| FLASH  | Flash Memory                                        | 闪存（存储程序和数据）          |
| PWM    | Pulse Width Modulation                              | 脉冲宽度调制（电机/灯光控制等） |
| ADC    | Analog-to-Digital Converter                         | 模数转换器（模拟信号转数字）    |
| DAC    | Digital-to-Analog Converter                         | 数模转换器（数字信号转模拟）    |
| LIN    | Local Interconnect Network                          | 本地互联网络（低成本低速总线）  |

# 概览

标准文档的命名规则

| 缩写     | 全称                               | 核心用途                                                     | 对于开发者的重要性                                           |
| :------- | :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **SWS**  | Software Specification             | **软件开发的核心文档**，定义具体模块（如CAN通信、OS）的API接口、行为逻辑和配置参数。 | **必读**。平时配置模块、写代码时主要参考这个。               |
| **SRS**  | Software Requirement Specification | **软件需求规范**。描述软件模块需要满足的高层次需求，是SWS的上层文件。 | 参考。架构师或需要做需求追溯时查看。                         |
| **TPS**  | Template Specification             | **模板规范**。定义ARXML配置文件的元模型结构（即XML文件里有哪些标签和属性）。 | 工具开发者必读。一般应用开发者很少直接看。                   |
| **EXP**  | Explanatory Document               | **解释性文档**。用于深入浅出地解释AUTOSAR中的复杂概念和最佳实践。 | 初学者友好。当你对某个概念（如VFB、RTE）感到困惑时，优先找EXP文档阅读。 |
| **TR**   | Technical Report                   | **技术报告**。通常包含技术概述、版本变更说明等。             | 推荐阅读。**尤其是ReleaseOverview**，能让你快速了解当前版本的新特性。 |
| **RS**   | Requirements Specification         | **需求规范**。最高层级的需求文档，描述AUTOSAR整体要达成的目标。 | 选读。了解顶层设计理念时参考。                               |
| **MMOD** | Meta Model                         | **元模型**。介绍AUTOSAR元模型。                              | 非常深入的研究者才需要看。                                   |

## 架构分层

> [!tip] 
>
> 标准文件请参见[AUTOSAR Layered Software Architecture](https://autosar.org/fileadmin/standards/R19-11/CP/AUTOSAR_EXP_LayeredSoftwareArchitecture.pdf)

AutoSAR要求整个软件有着严格得分层。AutoSAR分层软件架构如下：

![AutoSar软件架构分层总览](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251210093147574.png)



显而易见，AutoSAR软件架构自上而下分成了APP， RTE, BSW三层，至于那个Microcontroller指的是芯片MCU硬件，不属于软件。

1.  Application Layer（APP）：这一个层就是大家常说的APP了，属于控制策略层，实现算法。
2.  Runtime Environment（RTE）：这一层就是起到承上启下的作用，作为一个接口无缝连接APP和RTE，并且还要为APP层SWC之间提供通信。RTE层的代码都是通过工具链配置生成的。
3.  Basic Software（BSW）：这一层叫做基础软件层，它最大的功能就是隔绝APP和控制器的关系，并且为APP提供一系列服务。是整个软件架构中占比最大的一部分，大部分代码都是通过工具链配置生成的，只有一些特殊的一小部分需要自行实现，这一部分被称为Complex Driver。

BSW层和MCU息息相关，并且还包含了大量的一些知名协议栈，比方说什么UDS，XCP，TCP/IP等等。下图显示BSW的组成部分：

![BSW分层概览](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251210093447832.png)



可以看到BSW分成了服务层，ECU 抽象层, 微控制器抽象层和复杂驱动四个部分。

1. **微控制器层**

   MCU抽象层，它位于BSW的最底层，这一层其实就是我们经常说的MCAL层，这一层的作用就是将MCU资源抽象化，让上层程序的开发与MCU无关。举个例子，上层程序想通过CAN发个消息，只需要调用MCAL的消息发送接口Can_Write即可将消息成功发送出去，而不需要考虑它是通过中断还是轮询的方式发送。其实说白了MCAL就是MCU原厂针对AOTUSAR软件架构要求定制的一套底层MCU驱动，可以理解成为是AOTUSAR里面的MCU SDK驱动包。MCAL都是由MCU原厂提供源码，EB提供配置工具。

   早些年，MCAL都是要收费的，因为当时MCU原厂对一款MCU不仅要提供免费版的常规SDK包，还要提供收费版的AOTUSAR MCAL包，但是随着AOTUSAR的普遍应用，现在的MCAL基本上都是免费了。在这里不得不提一下NXP的做法，NXP为了省事，它将MCAL和常规SDK包融合了一起，而融合的方法就是在SDK包的基础上根据AOTUSAR的接口要求又封装了一层，强行AOTUSAR化，NXP将这种特殊的MCAL包称为RTD。

2. **ECU抽象层**

   ECU抽象层，它位于MCAL的上层，这一层的作用是让ECU的硬件设计抽象化，让上层程序的开发与ECU硬件设计无关。举个例子，上层程序需要通过ADC获取电源输入电压，它根本不需要考虑什么电阻分压转换什么，因为将ADC的寄存器值转化成真实的电源输入电压，这一部分的工作已经由ECU抽象层完成。经过ECU抽象层，让上层程序基本上脱离了硬件。

3. **服务层**

   服务层，它位于ECU抽象层的上面，上面提到了经过了ECU抽象层，已经大致让上层软件大致脱离了硬件，所以服务层更多的则是纯纯的软件，为APP提供相关服务和OS调度，比方说常见的UDS诊断，XCP，网络管理，通信服务等等都属于服务层。

4. **复杂驱动**

   复杂驱动，也就是经常所说的CDD，这一部分比较特殊，它自成一派，毕竟AOTUSAR不是万能的，它定义的那些标准模块不可能满足所有的应用需求，所以就有了复杂驱动，它是为了实现一些特殊的传感器和执行器功能，还有一些对控制时序有特殊要求功能需求场合，比方说喷油控制，胎压监测等。

   在一个ECU中，通常会有几大常见功能，比如存储功能，信息安全，通信功能等待，而AUTOSAR不同的层又根据功能划分了很多功能模块，如下图所示。看名字其实就大概猜到了每一个功能模块负责什么。

当然，还可以通过服务类型划分，如下图所示：

![应用分层细分层级](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251210093636448.png)



由图可以分为以下几类：

1. 输入输出类：标准化访问传感器、执行器和 ECU 车载外设
2. 内存：标准化访问内外部存储器（非易失性存储器）
3. 加密：标准化访问密码学原语，包括内部/外部硬件加速器 ICA 
4. 通信：标准化访问：车辆网络系统、ECU 车载通信系统及 ECU 内部软件
5. 车外通信：标准化访问：车辆至 X 通信、车内无线网络系统、ECU 车外通信系统
6. 系统：提供可标准化的（作系统、定时器、错误内存）及 ECU 专属服务和库功能

将所有的功能展开，最终得到以下框图：

![全功能的最终分层](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251210093940209.png)

## OSI模型

| Applicability                                               | OSI 7 layers             | Vehicle- manufacturer- enhanced diagnostics                  | Legislated OBD (on-board diagnostics)                        | ==          | Legislated WWH-OBD (on-board diagnostics)                    | ==          |
| ----------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------- | ------------------------------------------------------------ | ----------- |
| Seven layers according to ISO/IEC 7498-1) and ISO/IEC 10731 | 应用层<br />(第7层)      | ISO 14229-1,<br /> ISO 14229-3                               | ISO 15031-5                                                  | ==          | ISO 27145-3<br />ISO 14229-1                                 | ==          |
| :                                                           | 表示层<br />(第6层)      | Vehicle manufacturer specific                                | ISO 15031-2<br />ISO 15031-5<br />ISO 15031-6<br />SAEJ1930-DA<br /> SAEJ1979-DA<br />SAE J2012-DA | ==          | ISO 27145-2<br />SAE 1930-DA<br />SAE J1979-DA<br />SAE J2012-DA<br />SAEJ1939:2011,<br />Appendix C (SPN)<br />SAE J1939-73:2010<br />Appendix A (FMI) | ==          |
| :                                                           | 会话层<br />(第5层)      | ISO 14229-2                                                  | ==                                                           | ==          | ==                                                           | ==          |
| :                                                           | 传输协议层<br />(第4层)  | ISO 15765-2                                                  | ISO 15765-2                                                  | ISO 15765-4 | ISO 15765-4<br />ISO 15765-2 <br />                          | ISO 27145-4 |
| :                                                           | 网络层<br />(第3层)      | :                                                            | :                                                            | :           | :                                                            | :           |
| :                                                           | 数据链路层<br /> (第2层) | ISO 11898-1<br /> ISO 11898-2<br />ISO 11898-3 <br />ISO 11898-5 <br />or user defined | ISO 11898-1 <br />ISO 11898-2                                | :           | ISO 15765-4<br />ISO 11898-1<br />ISO 11898-2                | :           |
| :                                                           | 物理层 <br />(第1层)     | :                                                            | :                                                            | :           | :                                                            | :           |

## 功能安全

Autosar也为了功能安全在里面设计了很多机制和库函数，当然了，肯定都是软件层面上面的安全策略。大致可从下面几个方面来看：

1.  **Memory Partitioning：**  这个非常好理解，站在APP层说，就是让不同的SWC有不同运行权限，比方说可以配置SWC1只能进行运算，而SWC2可以访问寄存器资源。站在底层来说其实就是对MCU的Memory进行分区管理，即为MPU的应用。
2.  **E2E Protection：**End-to-End保护，这个也非常好理解，不管是外部不同ECU之间的通信，还是内部不同SWC之间的通信，都需要为保证信息在传输过程中的正确性，而AOTUSAR软件则提供了三种的E2E保护措施：
    1. **CRC校验**
    2. **Sequence Counter**：信息编号，防止漏和多
    3. **Timeout**：设置超时，给信息一个时限，这世界哪有一万年的爱啊。
3.  **Timing Monitoring和Logic Supervison**：这个方面主要是为了解决在系统运行过程中出现任务阻塞，任务死锁，活锁，任务执行时间超限等情况。主要安全策略差不多有两种，一个其实就是看门狗，AOTUSAR有个模块叫做Wdog Manger，可以监控某个任务有没有被卡死啊，卡死就报告，还有就是OS提供函数可以计算某段代码执行的时间有没有超限。