---
title: AUTOASR

draft: true

categories: 
  - 嵌入式

tags:
  - 汽车行业标准
---

# 参考链接

[ 搞一点AutoSar-墨客博客 (xcnm.net)](https://xcnm.net/archives/gao-yi-dian-autosar-yi-zhang-tu-bang-ni-li-jie-cantong-xin-quan-guo-cheng)

[CAN BusOff相关知识点_busoff基础知识-CSDN博客](https://blog.csdn.net/king110108/article/details/73917512)

[CAN Busoff原理/快慢恢复介绍以及利用Vector VH6501 CAN干扰仪经典CAN2.0/CANFD帧触发Busoff_网络_汽车电子助手-GitCode 开源社区](https://gitcode.csdn.net/65ec47911a836825ed796575.html?dp_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Nzk5NDg2MiwiZXhwIjoxNzQ3Mjg5OTcxLCJpYXQiOjE3NDY2ODUxNzEsInVzZXJuYW1lIjoicXFfNDQ4NDQ1MTUifQ.ww7MTvppS6senQKMwVt_SuJQZBunxh2sLSnOHSehLK4)

[CANalyzer及CANOE使用六：VH6501干扰仪的使用（busoff多种干扰/短路/采样点）_基于vh6501的can干扰测试-CSDN博客](https://blog.csdn.net/qq_36407982/article/details/122054927)

[AUTOSAR_TR_BSWModuleList.xls](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_TR_BSWModuleList.pdf)

[AUTOSAR Layered Software Architecture](https://autosar.org/fileadmin/standards/R19-11/CP/AUTOSAR_EXP_LayeredSoftwareArchitecture.pdf)

> 以下文章多基于[墨客博客 (xcnm.net)](https://xcnm.net/)的博客加上我自己的理解写的，感兴趣可以去看原博客。

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

## 架构分层

> [!tip]
>
> 标准文件请参见[AUTOSAR Layered Software Architecture](https://autosar.org/fileadmin/standards/R19-11/CP/AUTOSAR_EXP_LayeredSoftwareArchitecture.pdf)

AutoSAR要求整个软件有着严格得分层。AutoSAR分层软件架构如下：

![AutoSar软件架构分层总览](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251210093147574.png)

显而易见，AutoSAR软件架构自上而下分成了APP， RTE, BSW三层，至于那个Microcontroller指的是芯片MCU硬件，不属于软件。

1.  Application Layer（APP）：这一个层就是大家常说的APP了，属于控制策略层，实现算法。
2. Runtime Environment（RTE）：这一层就是起到承上启下的作用，作为一个接口无缝连接APP和RTE，并且还要为APP层SWC之间提供通信。RTE层的代码都是通过工具链配置生成的。
3. Basic Software（BSW）：这一层叫做基础软件层，它最大的功能就是隔绝APP和控制器的关系，并且为APP提供一系列服务。是整个软件架构中占比最大的一部分，大部分代码都是通过工具链配置生成的，只有一些特殊的一小部分需要自行实现，这一部分被称为Complex Driver。

BSW层和MCU息息相关，并且还包含了大量的一些知名协议栈，比方说什么UDS，XCP，TCP/IP等等。下图显示BSW的组成部分：

![BSW分层概览](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251210093447832.png)

可以看到BSW分成了服务层，ECU 抽象层, 微控制器抽象层和复杂驱动四个部分。

1. **微控制器层**

   MCU抽象层，它位于BSW的最底层，这一层其实就是我们经常说的MCAL层，这一层的作用就是将MCU资源抽象化，让上层程序的开发与MCU无关。举个例子，上层程序想通过CAN发个消息，只需要调用MCAL的消息发送接口Can_Write即可将消息成功发送出去，而不需要考虑它是通过中断还是轮询的方式发送。其实说白了MCAL就是MCU原厂针对AOTUSAR软件架构要求定制的一套底层MCU驱动，可以理解成为是AOTUSAR里面的MCU SDK驱动包。MCAL都是由MCU原厂提供源码，EB提供配置工具。

   早些年，MCAL都是要收费的，因为当时MCU原厂对一款MCU不仅要提供免费版的常规SDK包，还要提供收费版的AOTUSAR MCAL包，但是随着AOTUSAR的普遍应用，现在的MCAL基本上都是免费了。在这里不得不提一下NXP的做法，NXP为了省事，它将MCAL和常规SDK包融合了一起，而融合的方法就是在SDK包的基础上根据AOTUSAR的接口要求又封装了一层，强行AOTUSAR化，NXP将这种特殊的MCAL包称为RTD。

2.  **ECU抽象层**

   ECU抽象层，它位于MCAL的上层，这一层的作用是让ECU的硬件设计抽象化，让上层程序的开发与ECU硬件设计无关。举个例子，上层程序需要通过ADC获取电源输入电压，它根本不需要考虑什么电阻分压转换什么，因为将ADC的寄存器值转化成真实的电源输入电压，这一部分的工作已经由ECU抽象层完成。经过ECU抽象层，让上层程序基本上脱离了硬件。

3. **服务层**

   服务层，它位于ECU抽象层的上面，上面提到了经过了ECU抽象层，已经大致让上层软件大致脱离了硬件，所以服务层更多的则是纯纯的软件，为APP提供相关服务和OS调度，比方说常见的UDS诊断，XCP，网络管理，通信服务等等都属于服务层。

4. **复杂驱动**

   复杂驱动，也就是经常所说的CDD，这一部分比较特殊，它自成一派，毕竟AOTUSAR不是万能的，它定义的那些标准模块不可能满足所有的应用需求，所以就有了复杂驱动，它是为了实现一些特殊的传感器和执行器功能，还有一些对控制时序有特殊要求功能需求场合，比方说喷油控制，胎压监测等。

   在一个ECU中，通常会有几大常见功能，比如存储功能，信息安全，通信功能等待，而AUTOSAR不同的层又根据功能划分了很多功能模块，如下图所示。看名字其实就大概猜到了每一个功能模块负责什么。

当然，还可以通过服务类型划分，如下图所示：

![应用分层细分层级](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251210093636448.png)

由图可以分为以下几类：

1. 输入输出类：标准化访问传感器、执行器和 ECU 车载外设
2. 内存：标准化访问内外部存储器（非易失性存储器）
3. 加密：标准化访问密码学原语，包括内部/外部硬件加速器 ICA 
4. 通信：标准化访问：车辆网络系统、ECU 车载通信系统及 ECU 内部软件
5. 车外通信：标准化访问：车辆至 X 通信、车内无线网络系统、ECU 车外通信系统
6. 系统：提供可标准化的（作系统、定时器、错误内存）及 ECU 专属服务和库功能

将所有的功能展开，最终得到以下框图：

![全功能的最终分层](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251210093940209.png)

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
3. **Timing Monitoring和Logic Supervison**：这个方面主要是为了解决在系统运行过程中出现任务阻塞，任务死锁，活锁，任务执行时间超限等情况。主要安全策略差不多有两种，一个其实就是看门狗，AOTUSAR有个模块叫做Wdog Manger，可以监控某个任务有没有被卡死啊，卡死就报告，还有就是OS提供函数可以计算某段代码执行的时间有没有超限。

# Communication stack

## 简介

### 模块

**Communication stack**包括以下三个大模块：

1. Communication Service
2. Communication Hardware Abstraction
3. Communication Drivers

Communication Stack主要承载了ECU的通信功能，例举一下汽车电子通信网络中的几大总线，CAN, LIN, FlexRay，以太网。所以不难想象Communication Stack必须要针对这四大总线实现它们的驱动以及相关常见协议栈，比如说CAN的UDS，以太网的TCP/IP等。整个Communication Stack的结构如下图所示：

![Communication stack结构](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251211083119069.png)

仔细观察四大总线的消息传递路径，可以发现在AUTOSAR架构中基本上都大同小异，对于接收消息而言，四大总线上的消息大多都是先由MCAL层中的Driver，然后传输到位于ECU抽象层的Interface，Interface层会根据消息类型进行分配最后再传输到该消息对应的服务层，对于发送则是一个相反的过程。

### 通信过程

Communication Stack所提供的服务，主要有两类：

1. 一类主要负责通信数据的传输，主要有Com服务和Dcm服务，这两者主要负责ECU大量系统数据的传输。

   1. Com服务主要负责传递来自APP层的消息，说简单点它就是把系统中的一些系统变量参数根据一定数据组合规则打包（或者解包），然后根据一定的时间/事件规则发送出去（或者接收进来）。Com服务中Can消息传递路径为：

      ```mermaid
      graph TD
          subgraph 顶层模块
              A[ ]:::orange
              B[ ]:::orange
          end
          
          C[Com]:::blue
          D[I-PDU]:::gray
          E[PduR]:::blue
          F[I-PDU]:::gray
          G[CanIf]:::green
          H[L-PDU]:::gray
          I[CanDrv]:::pink
          
          A --> C
          B --> C
          C --> D
          D --> E
          E --> F
          F --> G
          G --> H
          H --> I
          
          classDef orange fill:#FF7F50,stroke:#000,stroke-width:2px,width:40px,height:30px
          classDef blue fill:#87CEFA,stroke:#000,stroke-width:2px
          classDef gray fill:#D3D3D3,stroke:#000,stroke-width:2px
          classDef green fill:#98FB98,stroke:#000,stroke-width:2px
          classDef pink fill:#FFB6C1,stroke:#000,stroke-width:2px
      ```

      对于接收而言，MCAL层中的CanDrv接收到最原始的CAN报文后传输到CanIf模块，CanIf模块相当于是一个报文分类模块，它会根据CAN ID将CAN报文分类，然后传递到服务层的不同模块，比如图中的PduR模块。经过了CanIf模块后，这个时候原始CAN报文变换为服务层PDU。PduR功能为PDU路由，它会对PDU再次进行分类，随后将其传递到更上层的软件模块，比如Com模块。

   2. Dcm服务主要实现了UDS诊断协议，接收来自外部的请求，并作出响应。Dcm服务中Can消息传递路径为：

      ```mermaid
      graph TD
          A[Dcm]:::blue
          B[I-PDU]:::gray
          C[PduR]:::blue
          D[I-PDU]:::gray
          E[CanTp]:::blue
          F[N-PDUs]:::gray
          G[CanIf]:::green
          H[L-PDU]:::gray
          I[CanDrv]:::pink
      
          A --> B
          B --> C
          C --> D
          D --> E
          E --> F
          F --> G
          G --> H
          H --> I
      
          classDef blue fill:#87CEFA,stroke:#000,stroke-width:2px
          classDef gray fill:#D3D3D3,stroke:#000,stroke-width:2px
          classDef green fill:#98FB98,stroke:#000,stroke-width:2px
          classDef pink fill:#FFB6C1,stroke:#000,stroke-width:2px
      ```

      在Dcm服务中，对比Com服务，发现其有两个不同，第一个不同为Dcm服务与APP没有交集，因为Dcm就是UDS。第二个不同为在CanIf模块和PduR模块中多了一层CanTP模块，这个模块其实就是实现了ISO15765-2中描述的UDS on CAN的网络层。

2. 另外一类则负责通信模式的管理，包括有SM模块和NM，这两者主要负责状态管理和网络管理。

   1. SM模块则是负责总线的状态管理，主要负责总线通信开启和关闭，另外还负责总线错误的检测和恢复。
   2. 而NM模块则负责总线的网络管理，基于总线报文协议控制ECU的睡眠和唤醒。

更为详细的通信过程如下：

![AUTOSAR CAN通信过程](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251211085115455.png)

其中不同层的名词解释如下：

1. **交互层**

   - IPDU multiplexer：协议数据单元复用模块
   - COM：COMMUNICATION 通信模块
   - DCM: 诊断通信管理模块（Diagnostic Comminication Manager）
   - PDUR:Protocol Data Unit Router -PDU路由器

2. **网络层：**

   - CAN TP: CAN Transport Layer
   - CAN TP提供的服务包括： 传输方向的数据分割、接收方向的数据重组、 数据流控制、检测分割会话中的错误、传输取消接收取消
   - J1939 TP：基于J1939协议的CAN TP，J1939Tp模块实现了SAEJ1939标准中的两种数据传输方式BAM和CMDT；

3. **数据链路层：**

   - CAN Interface：CAN 接口层（CanIf）是访问CAN总线的标准接口;

4. **物理层：**

   - CAN Driver： CAN 驱动；，可以实现对CAN控制器的初始化、发送/接收CAN报文、对接收报文的指示与对发送报文的确认、唤醒检测、溢出和错误处理等功能。
   - CAN Controller： CAN控制器；
   - CAN Transceiver Driver: CAN收发器驱动程序抽象了CAN收发器硬件。它为较高层提供了一个独立于硬件的接口。它利用MCAL层的api从ECU布局中抽象出来，访问CAN收发硬件。

5. **硬件部分：**

   - CANTransceiver：CAN收发器，是一种硬件设备，可将CAN总线上使用的信号电平调整为微控制器识别的逻辑（数字）信号电平。此外，收发器还能够检测电气故障，例如布线问题，接地偏移或长主导信号的传输。根据与微控制器的接口，它们会标记由单个端口引脚汇总的检测到的错误或由SPI非常详细地标记出来
   - CAN High： CAN总线高电平；
   - CAN Low： CAN总线低电平；
   - CAN network：AUTOSAR CAN网络管理是一个独立于硬件的协议，只能在CAN上使用。其主要目的是协调网络从正常运行到总线休眠模式的过渡。

6. **传输数据类型：**

   - signals：信号；

   - PDU：Protocol Data Unit 协议数据单元，PDU 由 SDU 和 PCI 组成

     - **PCI（Protocol Control Information，协议控制信息）**：控制信息（如CAN帧的标识符、DLC等）。
     - **SDU（Service Data Unit，服务数据单元）**：实际数据（如CAN帧的数据字段）。

     | 字段       | 类型 | 说明                      |
     | ---------- | ---- | ------------------------- |
     | 标识符     | PCI  | 帧的ID和优先级            |
     | 控制字段   | PCI  | 数据长度（DLC）           |
     | 数据字段   | SDU  | 实际传输的数据（1-8字节） |
     | CRC、ACK等 | PCI  | 错误检查和应答            |

   - I-PDU：Interaction Layer PDU，由 data、length、I-PDU ID 组成。

   - N-PDU：Network Layer PDU，或 I-PDU Segment，由传输协议模块使用，对 I-PDU 进行分段

   - L-PDU：Data Link Layer PDU，或 Large PDU，一个或多个 I-PDU 被打包成 L-PDU，L-PDU是基于总线的，例如 CAN 总线的 L-PDU 就是 CAN 帧；

   - Message：报文；

那么数据流的走向为：**应用层–>RTE–>COM–>PDUR–>CANTP–>CAN Interface–>CAN Driver–>CAN controller–>CAN transceiver–>CAN BUS Line**

1. Com模块获取应用层的信号（Signal），经一定处理封装为IPDU（Interaction Layer Protocol Data Unit）发送到PduR模块；
2. PduR根据路由协议中所指定的I-PDU目标接收模块，将接收到的I-PDU经一定处理后发送给CanIf；PduR也可以将部分I-PDU发送给CAN TP模块，处理之后再发送给CANIf；
3. CanIf将信号以L-PDU（Data Link Layer Protocol Data Unit）的形式发送给CAN驱动模块；
4. CAN 驱动模块将Message 报文发送给CAN controller；
5. CAN controller 与外部硬件的CAN transceiver（CAN收发器)进行CAN 报文的收发；
6. 外部硬件CAN收发器–CAN Transceiver Hardware主要工作内容为，接收CAN bus上的网络信息（通常叫做CAN Frame）相关的信号电平并将其转化为逻辑信息电平转发给CAN Controller,接收从CAN Controller传输过来的逻辑电平信息并将其转化为信号电平传从到CAN bus上。CAN Transceiver有两条线，一条连CAN总线的高电平，一条低电平；

## CanIf

> [!tip]
>
> 标准文件参见[AUTOSAR_SWS_CANInterface.pdf](https://www.autosar.org/fileadmin/standards/R20-11/CP/AUTOSAR_SWS_CANInterface.pdf)

CanIf结构图如下：

![CanIf结构图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_12_41_24_%E6%9A%82%E5%AD%98.png)

在MCAL层，看到了不仅仅有CanDriver， 还有SPI和I/O Driver，其中SPI针对的是那些需要外挂CAN controller的应用，除了外部CAN controller芯片需要IO来进行输入输出，有些特殊的CAN Tranceiver也需要IO来进行输入输出，比如经典的TJA1043，就有一个EN引脚和STB引脚，所以就需要IO Driver来控制。

CanIf模块位于MCAL层（CAN Driver）和上层通信服务层（如 CAN Network Management, CAN Transport Protocol 等）的中间，其充当 CAN Driver 和上层通信服务层的接口层。所以它位于BSW层中的ECU抽象层，为了让上层软件与ECU硬件设计无关。

CAN Interface 模块主要功能如下：

1. 初始化
2. 发送请求服务
3. 发送确认服务
4. 接收指示服务
5. Controller 模式控制服务
6. Transceiver 模式控制服务
7. PDU channel mode 控制服务

### 发送缓冲区

首先介绍一个叫做（**HOH**）Hardware Object handles的这个概念，这个其实在MCAL层出现的较多，对MCAL的上层软件来说，HOH其实就是一个CAN报文的消息缓冲区，上层软件想发送报文的时候，就把报文往里面塞就好了，MCAL会负责发送出去，同理，接收报文就是从缓冲区里读取。但是在MCAL层，这个HOH的实现就五花八门了，这里就不多解释了。后文出现的HTH意思就是用来发送的HOH，而HRH意思就是用来接收的HOH。

再来介绍一下BasicCAN 和FullCAN的概念：

1. BasicCAN 就是说一个HOH可以同时接收和发送多个CAN ID报文
2. 而FullCAN则是一个HOH直接接收和发送单个CAN ID报文。

这里不妨衍生一下，这两个的定义其实起源颇深，大家可参考文章：[《Full-CAN vs. Basic-CAN》](https://zhuanlan.zhihu.com/p/484354161)。

当 CANIF_PUBLIC_TX_BUFFERING 配置为 ON 的时候， CanIf 会为 Basic 类型（多个 PDU 共享一个 HTH）的 PDU 分配发送缓冲区。
  当 CanIf 调用 Can_Write 返回 CAN_BUSY 的时候，说明当前的 HTH 正在发送上一帧数据，不能写入新的数据。此时， CanIf 将会把新的数据储存在 CanIf 的缓冲区。在 Can 的发送确认中，针对刚刚发送成功的 HTH（此时已经处于空闲状态，可以写入新的数据）， CanIf 将查询分配给该 HTH 的 PDU，是否有数据在缓冲区中，如果有的话， CanIf 将自动把缓冲区中的数据写入 HTH，并发送出去。CanIf 发送缓冲区具有如下特性：

1. Full 类型的 PDU 不会分配缓冲区；
2. 每个 Basic 类型的 PDU 有且只有一级缓存，因此，新的数据覆盖旧的数据；
3. 当 CANIF_PUBLIC_TX_BUFFERING 配置为 OFF 时，所有的 PDU 都没有发送缓冲区；
4. 如果同一 HTH 的缓冲区中有多个 PDU，将按照 PDU 的优先级（CANID 从小到大的顺序）进行发送。

### Can controller模式控制

CAN controller 在硬件实现上的状态抽象为以下四种基本状态：

1. UNINIT
2. STOPPED
3. STARTED
4. SLEEP

对每个 CAN Controller，在 Can Interface 模块上有一个对应的“软件”状态机，其有以下几种状态：

1.  CANIF_CS_UNINIT
2. CANIF_CS_STOPPED
3. CANIF_CS_STARTED
4. CANIF_CS_SLEEP

上层可以通过调用 CanIf_SetControllerMode()服务来改变 CAN Controller 的状态。下表展示了用户使用CanIf_SetControllerMode()时的状态转换:

| CanIf 当前模式   | 用户请求模式     | 传递给 Can 的模式 |
| ---------------- | ---------------- | ----------------- |
| X                | CANIF_CS_STARTED | CAN_T_START       |
| CANIF_CS_SLEEP   | CANIF_CS_STOPPED | CAN_T_WAKEUP      |
| CANIF_CS_STOPPED | CANIF_CS_STOPPED | CAN_T_STOP        |
| CANIF_CS_STARTED | CANIF_CS_STOPPED | CAN_T_STOP        |
| X                | CANIF_CS_SLEEP   | CAN_T_SLEEP       |

不合法的状态转换请求，例如 SLEEP 到 START， START 到 SLEEP，将在 Can 模块被检测到，并返回 E_NOT_OK。在转换阶段， Can Interface 模块中软件状态机的状态可能会与 CAN controller 中的硬件状态不一致。

调用 CanIf_SetControllerMode 进行模式切换，如果硬件的模式能够在较短的时间内完成，那么模式转换可以是同步的，也就是说，在 CanIf_SetControllerMode 返回之前，模式转换已经完成，并且通过 User_ControllerModeIndication 通知了上层。否则，模式转换是异步完成的，用户需周期调用 Can_MainFunction_Mode 来完成模式转换并通知上层。

### PDU Mode控制

CanIf中，可调用 CanIf_SetPduMode 控制某个 CAN 通道上 PDU 的接收和发送，各 CAN通道可分别控制。CanIf支持的Pdu Mode 模式和特征描述如下所示：

| PDU Mode                | 描述                                                         |
| ----------------------- | ------------------------------------------------------------ |
| CANIF_OFFLINE           | 1. 阻止发送请求，调用 CanIf_Transmit() 时，返回 E_NOT_OK。<br>2. 清除相关通道的发送缓冲区。<br>3. 阻止调用上层的接收指示回调函数。<br>4. 阻止调用上层的发送确认回调函数。 |
| CANIF_TX_OFFLINE_ACTIVE | 1. 调用的 CanIf_Transmit() 时，返回 E_OK，但是不调用 Can 的发送接口发送报文。<br>2. 调用的 CanIf_Transmit() 时，直接调用上层的发送确认函数。<br>3. 阻止调用上层的接收指示回调函数。 |
| CANIF_TX_OFFLINE        | 1. 阻止发送请求，调用 CanIf_Transmit() 时，返回 E_NOT_OK。<br>2. 清除相关通道的发送缓冲区。<br>3. 允许调用上层的接收指示回调函数。<br>4. 阻止调用上层的发送确认回调函数。 |
| CANIF_ONLINE            | 1. 调用 CanIf_Transmit() 时，正常发送报文，返回 E_OK。<br>2. 报文发送成功时，调用上层的发送确认函数。<br>3. 接收到报文时，调用上层的接收指示回调函数。 |

### DLC检查

当 CanIf 从 Can Drviver接收到一帧报文，可以对报文的 DLC 进行检查，如果 DLC 不合法，可以报错，并进行相应的处理。DLC 检查的方法有两种：

1. AUTOSAR 标准算法：当实际接收到的 DLC 小于配置的 DLC 时，认为 DLC 不合法；
2. 用户自定义算法：用户需要完成 CanIf_DlcCheckCallout 函数，自行进行检查。

若 DLC 检查失败，等同于该报文没有接收到，不会调用上层的接收指示回调函数。

### 查询状态

当相关配置参数使能后， CanIf 提供了接口，可通过这些接口查询 CanIf PDU 的的状态和数据，这包括：

1. CanIf_ReadRxNotifStatus 查询某个 PDU 是否接收到；
2. CanIf_ReadTxNotifStatus 查询某个 PDU 是否发送成功；
3. CanIf_ReadRxPduData，读取某个 PDU 的接收数据；
4. CanIf_GetTxConfirmationState，获取是否有报文发送成功，主要用于 Busoff 恢复。

### 控制器模式

在AUTOSAR架构中，**CAN控制器（CAN Controller）的模式**由通信接口层（CAN Interface, CANIf）管理。通过分层控制（控制器模式 + PDU模式），AUTOSAR实现了灵活且低功耗的CAN通信管理。CAN控制器模式如下：

1. 启动模式（ `CANIF_CS_STARTED`）
   - 功能：
     - 控制器**完全激活**，可正常**收发CAN帧**（包括数据帧、远程帧、错误帧等）。
     - 参与总线仲裁、错误检测与恢复（如自动重传）。
   - 触发条件：
     - 网络管理（NM）请求通信，或上层模块（如ComM）授权通信。
2. 停止模式（`CANIF_CS_STOPPED`）
   - 功能：
     - 控制器**停止所有通信活动**，关闭内部时钟以降低功耗。
     - 仍可响应硬件唤醒事件（如总线显性电平）。
   - 触发条件：
     - 网络管理（NM）进入总线睡眠模式（Bus-Sleep），或ComM拒绝通信请求。
3. 睡眠模式 (`CANIF_CS_SLEEP`)
   - 功能：
     - 控制器进入**深度低功耗状态**，仅保留基础唤醒功能。
     - 需软件唤醒（调用`CanIf_ControllerWakeup()`）才能恢复通信。
   - 触发条件：
     - 明确请求低功耗（如整车电源管理指令）。

---

PDU模式与控制器模式协同工作，独立控制发送/接收行为：

| **模式**           | 发送（TX） | 接收（RX） | 说明                       |
| ------------------ | ---------- | ---------- | -------------------------- |
| `CANIF_ONLINE`     | ✅          | ✅          | 完全通信（默认模式）       |
| `CANIF_TX_OFFLINE` | ❌          | ✅          | 静默模式（仅接收）         |
| `CANIF_OFFLINE`    | ❌          | ❌          | 无通信（控制器停止或睡眠） |

---

控制器模式与其他模块的关系为：

1. 与收发器的联动：
   - 控制器进入`CANIF_CS_STOPPED`时，收发器通常切换至`TRCVMODE_STANDBY`（待机）。
   - 控制器唤醒后，收发器需先恢复`TRCVMODE_NORMAL`，再启动控制器。
2. 与网络管理（NM）的协同：
   - NM通过`CanIf_ControllerMode`控制总线参与权（如休眠时强制`CANIF_CS_STOPPED`）。
3. 与ComM的交互：
   - ComM决定通信权限，通过`CanIf_SetControllerMode`配置控制器状态。

---

状态切换示例：

1. 唤醒流程：

   ```mermaid
   graph LR
   A[总线显性电平] --> B[收发器唤醒]
   B --> C[CanIf_ControllerWakeup]
   C --> D[控制器: CANIF_CS_STARTED]
   D --> E[PDU模式: CANIF_ONLINE]
   ```

2. 休眠流程：

   ```mermaid
   graph LR
   A[NM请求休眠] --> B[ComM释放通信]
   B --> C[CanIf_SetControllerMode: CANIF_CS_STOPPED]
   C --> D[收发器待机]
   ```

---

关键差异总结：

| **模式**           | 通信能力 | 功耗 | 唤醒方式      | 适用场景 |
| ------------------ | -------- | ---- | ------------- | -------- |
| `CANIF_CS_STARTED` | 全双工   | 高   | 始终活跃      | 正常运行 |
| `CANIF_CS_STOPPED` | 无       | 中   | 硬件/总线唤醒 | 短时休眠 |
| `CANIF_CS_SLEEP`   | 无       | 极低 | 软件指令唤醒  | 深度休眠 |

### 收发器模式



在AUTOSAR架构中，**CAN收发器（CAN Transceiver）的模式**由收发器驱动（CAN Transceiver Driver, CanTrcv）管理，收发器有以下模式：

1. 正常模式（ `TRCVMODE_NORMAL`）
   - 功能：
     - 收发器**完全激活**，支持差分信号（CAN_H/CAN_L）的发送和接收。
     - 符合ISO 11898-2电气标准（显性/隐性电平）。
   - 功耗：
     - 典型值：5~15mA（取决于型号，如TJA1042）。
   - 触发条件：
     - 控制器需主动通信（`CANIF_CS_STARTED`）。
2. 待机模式（`TRCVMODE_STANDBY`）
   - 功能：
     - 收发器**停止发送**，但仍可监听总线活动（接收功能部分激活）。
     - 支持硬件唤醒（如总线显性电平触发）。
   - 功耗：
     - 典型值：100~500μA（如TJA1145）。
   - 触发条件：
     - 控制器进入`CANIF_CS_STOPPED`，但需保留唤醒能力。
3. 睡眠模式（`TRCVMODE_SLEEP`）
   - 功能：
     - 收发器**完全关闭**，断开与总线的电气连接。
     - 仅支持特定唤醒方式（如LIN唤醒、硬件引脚触发）。
   - 功耗：
     - 典型值：1~10μA（如SIT1145AQ）。
   - 触发条件：
     - 明确请求深度休眠（如整车电源管理指令）。

---

收发器模式与其他模块的关系

1. 与控制器的联动：
   - 控制器模式（`CANIF_CS_STARTED`）要求收发器必须处于`TRCVMODE_NORMAL`。
   - 控制器休眠（`CANIF_CS_STOPPED`）时，收发器可切换至`TRCVMODE_STANDBY`或`TRCVMODE_SLEEP`。
2. 与网络管理（NM）的协同：
   - NM通过`CanTrcv_SetMode`控制收发器状态（如Bus-Sleep时强制`TRCVMODE_SLEEP`）。
3. 与电源管理的交互：
   - 部分收发器通过`INH`引脚控制外部电源（睡眠时关闭MCU供电）。

---

状态切换示例：

唤醒流程（睡眠→正常）：

```mermaid
graph TB
A[总线显性电平或硬件唤醒] --> B[CanTrcv_SetMode: TRCVMODE_NORMAL]
B --> C[收发器激活差分驱动]
C --> D[控制器启动: CANIF_CS_STARTED]
```

休眠流程（正常→睡眠）：

```mermaid
graph TB
A[NM请求Bus-Sleep] --> B[CanTrcv_SetMode: TRCVMODE_SLEEP]
B --> C[收发器断开总线]
C --> D[控制器停止: CANIF_CS_STOPPED]
```

---

关键差异总结：

| **模式**           | 发送能力 | 接收能力  | 功耗        | 唤醒方式              | 适用场景   |
| ------------------ | -------- | --------- | ----------- | --------------------- | ---------- |
| `TRCVMODE_NORMAL`  | ✅        | ✅         | 高（5mA+）  | 始终活跃              | 正常通信   |
| `TRCVMODE_STANDBY` | ❌        | ⚠️（部分） | 中（100μA） | 总线显性电平/硬件唤醒 | 低功耗监听 |
| `TRCVMODE_SLEEP`   | ❌        | ❌         | 极低（μA）  | 特定引脚/LIN/软件指令 | 深度休眠   |

## CanNm

> [!tip] 
>
> 标准文件可参见[Specification of CAN Network Management (autosar.org)](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_SWS_CANNetworkManagement.pdf)
>
> CanNm模块还有一大堆的细节，大家如果想更深入了解CanNm模块，可参加文章[《AUTOSAR CAN NM（CAN网络管理）》](https://zhuanlan.zhihu.com/p/532263163)。再推荐一篇干货满满的文章：[《AUTOSAR架构下关于CanNm的几点思考》](https://mp.weixin.qq.com/s/JkbdlKvCSqMjq9ZRJoqnJg)。

首先来简单说说NM（网络管理）的概念，现在汽车上ECU非常之多令人乍舌，设备越多，这电就要越扣扣嗖嗖的用，那该怎么省电呢？有一种方法就是在某些用车场景用不到的ECU，那么就让你进入休眠不工作，当需要这个ECU时，再去把你唤醒，而NM就是为了去实现这个省电小技巧基于总线报文而创造出来的一个玩意。

在介绍CanNm模块之前，首先需要搞清楚CanNm模块和NM模块的关系。如下图所示，Nm 模块位于 AUTOSAR 的通信服务层，对上与ComM 交互，对下控制各总线网络管理模块，为 ComM 提供统一的网络管理功能，同时当开启网络协同功能时，协调各总线网络管理模块之间的状态关系。

![NM模板框图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_14_27_20_image-20250727142719861.png)

CanNm模块其实只是CAN总线上的NM，而LIN, FlexRay也有其对应的NM，大家都大同小异，都实现着一模一样的目的，所以对于CanNm模块和NM模块的关系，说得再简单点，NM模块是一个经理，CanNm模块是真正打工人，那么站在NM之上的ComM模块则是老板了，ComM模块后面会介绍到，这里不多说。这里推荐一篇文章，里面详细的讲述了NM模块的一些基本理论知识：[《一文搞懂AUTOSAR CanNm模块》](https://mp.weixin.qq.com/s/GyGCdNZu3_0E2ZN6KnD-EQ)。

CanNm 模块主要功能如下：

1. 初始化
2. 网络管理报文发送
3. 网络管理报文接收处理
4. 同步睡眠和唤醒功能
5. 向应用层提供网络上节点信息
6. 降低总线负载机制

### 初始化

如果CanNm模块初始化成功，即：调用函数CanNm_Init成功，则CanNm模块应将网络管理状态设置为总线睡眠模式（Bus-Sleep Mode）。 CanNm模块应该在CanIf初始化之后，并且在任何其他网络管理服务被调用之前，进行初始化。CanNm_Init函数应通过传递的配置指针参数选择活动配置集。如果CanNmGlobalPnSupport设置为TRUE，并且CanNm已被初始化（调用CanNm_Init），则CanNm需停止NM消息传输超时计时器（NM Message Tx Timeout Timer）。在初始化期间，CanNm模块应停用总线，减少总线负载。初始化后，CanNm模块应通过停止消息周期定时器（Message Cycle Timer）来停止网络管理PDU的传输。

### 模式切换

 CanNm 模块的状态切换是被动的，根据自身控制器和网络的当前状态来调用相关接口发起 CanNm 模块状态切换，模块状态切换后会调用上层 NM 模块提供的回调接口以通知应用层。NM有三种模式模式：

1. 网络模式(`Network Mode `,NM)
2. 准备总线睡眠模式(`Prepare Bus-Sleep Mode `,PBSM)
3. 总线睡眠模式(`Bus-Sleep Mode`,BSM)

NM模式切换图如下：

![NM模式切换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_14_54_18_%E6%9A%82%E5%AD%98.png)

#### 网络模式



**网络模式（Network Mode）** 包含三种内部状态：

1. 重复报文状态（Repeat Message State, RMS）
2. 正常操作状态（Normal Operation State, NOS）
3. 准备睡眠状态（Ready Sleep State, RSS)

这些状态的转换由网络管理报文（NM PDU）的收发、定时器超时以及应用层请求触发，具体转换逻辑如下：

---

重复报文状态（RMS）

- 触发进入条件：

  1. 主动唤醒：ECU因本地唤醒（如点火信号）或主动请求通信时，进入RMS并启动`T_Repeat_Message`定时器，快速发送NM报文以唤醒其他节点
  2. 被动唤醒：ECU被总线上的NM报文唤醒后，需短暂进入RMS发送几帧NM报文，通知其他节点自身已唤醒。

- 退出条件：

  - T_Repeat_Message超时后：

    - 若存在**主动请求**（如应用层调用`CanNm_NetworkRequest`），则跳转到**NOS**。

    - 若无请求，则跳转到RSS

  - 强制跳转：若收到NM报文的控制位向量（CBV）中`Repeat Message Request Bit`（Bit 0）置1，则重新进入RMS。

---

正常操作状态（NOS）

- 触发进入条件：
  1. 从RMS跳转：`T_Repeat_Message`超时且存在主动请求。
  2. 从RSS跳转：ECU在RSS状态下收到主动请求（如重新需要通信）。
- 行为：
  - 周期性发送NM报文（周期为`CanNmMsgCycleTime`），保持网络活跃。
  - 重置`T_NM_Timeout`定时器以监听总线活动。
- 退出条件：
  - **释放网络**：应用层调用`CanNm_NetworkRelease`时，跳转到**RSS**。
  - 收到重复请求：若NM报文的`Repeat Message Request Bit`置1，则强制返回RMS。

---

准备睡眠状态（RSS）

- 触发进入条件：
  1. 从RMS跳转：`T_Repeat_Message`超时且无主动请求。
  2. 从NOS跳转：应用层释放网络（`CanNm_NetworkRelease`）。
- 行为：
  - 停止发送NM报文，但继续接收NM报文和应用报文。
  - 启动`T_NM_Timeout`定时器，若超时且未收到NM报文，则跳转到预睡眠模式（PBSM）。
- 退出条件：
  - **重新请求通信**：调用`CanNm_NetworkRequest`跳转到**NOS**。
  - 收到重复请求：NM报文的`Repeat Message Request Bit`置1时，返回RMS。

---

状态转换图与关键参数

1. 定时器作用：
   - `T_Repeat_Message`：控制RMS状态的持续时间（通常较短，如100ms）。
   - `T_NM_Timeout`：检测总线是否空闲（超时后触发休眠流程）。
2. 控制位向量（CBV）：
   - Bit 0（重复请求位）和Bit 4（主动唤醒位）直接影响状态跳转。
3. 应用层接口：
   - `CanNm_NetworkRequest`和`CanNm_NetworkRelease`是触发NOS与RSS切换的核心API。

```mermaid
stateDiagram-v2
    [*] --> BSM: 初始休眠
    BSM --> RMS: 唤醒事件
    RMS --> NOS: 有通信需求
    RMS --> RSS: 无需求
    NOS --> RSS: 释放网络
    RSS --> NOS: 重新请求
    RSS --> BSM: 超时无活动
    NOS --> RMS: 收到重复请求
```

---

示例场景

- 车辆启动时：
  1. ECU被点火信号（本地唤醒）触发，进入**RMS**，快速发送NM报文唤醒其他节点。
  2. `T_Repeat_Message`超时后，因有通信需求，跳转到**NOS**，维持周期性通信。
- 车辆熄火后：
  1. 应用层释放网络，ECU从**NOS**跳转到**RSS**，停止发送NM报文。
  2. `T_NM_Timeout`超时后，进入PBSM，最终休眠。

#### 准备总线睡眠模式

在AUTOSAR CAN网络管理中，**准备总线睡眠模式（Prepare Bus-Sleep Mode, PBSM）**是网络从活跃状态（Network Mode）过渡到完全休眠状态（Bus-Sleep Mode）的中间状态，其核心作用是协调节点间的同步休眠，避免因通信中断导致的数据丢失或系统冲突。

---

 功能定义：

- 目的：确保所有节点在进入低功耗的Bus-Sleep Mode前完成必要的清理操作（如停止应用报文发送、保存临时数据），并同步确认无其他节点需要通信。
- 触发条件：
  - 节点从`Network Mode`的**Ready Sleep State (RSS)**退出后，若`T_NM_Timeout`定时器超时且未收到任何网络管理报文（NM PDU），则进入PBSM。
  - 部分配置下，需满足`CanNmWaitBusSleepTime`参数定义的额外等待时间。

---

行为特性:

- 通信限制：
  - 禁止发送NM报文：节点停止发送网络管理报文，仅监听总线上的NM PDU。
  - 允许完成未发送的应用报文：已缓存的APP报文可继续发送，但新生成的APP报文会被阻塞。
- 定时器机制：
  - 启动`T_WaitBusSleep`定时器（可配置），若超时前未收到其他节点的NM PDU，则跳转到Bus-Sleep Mode；若收到NM PDU，则返回Network Mode的Repeat Message State (RMS)。

---

状态转换逻辑

1. 进入PBSM：
   - 从`Ready Sleep State`超时触发，或由网关节点通过协调算法强制触发（如同步关闭部分网络集群PNC）。
2. 退出PBSM：
   - 成功休眠：`T_WaitBusSleep`超时后，节点关闭收发器，进入Bus-Sleep Mode。
   - 重新唤醒：若在PBSM期间检测到NM PDU或本地唤醒请求（如KL15信号），则立即返回Network Mode。

---

应用场景示例

- 整车熄火流程：
  1. ECU应用层释放通信权限，进入Ready Sleep State。
  2. 总线无活动超时后，ECU转入PBSM，停止NM报文发送。
  3. 若所有节点均进入PBSM且无通信需求，最终同步休眠。
- 异常恢复：若某个节点在PBSM阶段因故障持续发送NM PDU，其他节点会检测到该报文并维持Network Mode，避免误休眠。

---

与相关模式的对比

| **模式**              | 通信行为                     | 功耗水平       | 典型触发条件                   |
| --------------------- | ---------------------------- | -------------- | ------------------------------ |
| **Network Mode**      | NM和APP报文正常收发          | 高             | 唤醒事件或通信请求             |
| **Prepare Bus-Sleep** | 仅接收NM报文，停止发送       | 中（过渡状态） | `T_NM_Timeout`超时             |
| **Bus-Sleep Mode**    | 完全停止通信，仅支持硬件唤醒 | 极低           | `T_WaitBusSleep`超时或协调完成 |

#### 总线睡眠模式

在AUTOSAR CAN网络管理中，**总线睡眠模式（Bus-Sleep Mode, BSM）** 是网络节点在无通信需求时进入的低功耗状态，其核心目的是通过关闭通信功能降低静态电流消耗，同时保留唤醒能力以响应后续请求。

---

 功能定义

- 核心作用：当所有节点无通信需求时，协调全网同步进入低功耗状态，典型静态电流可降至毫安级（如大众车型中舒适CAN总线休眠后整车电流仅6mA）。
- 触发条件：
  - 节点从准备总线睡眠模式（Prepare Bus-Sleep Mode, PBSM）过渡而来，且`T_WaitBusSleep`定时器超时后确认无NM报文活动。
  - 部分配置需满足`CanNmWaitBusSleepTime`参数定义的额外等待时间。

---

行为特性

- 通信限制：
  - 完全停止NM报文和应用报文（APP报文）的收发，仅支持硬件唤醒（如总线显性电平或本地唤醒信号）。
  - 收发器切换至低功耗模式（如TJA1145的Sleep模式，INH引脚悬空以关闭外部电源）。
- 唤醒机制：
  - 远程唤醒：通过总线上的NM报文触发（如特定ID的唤醒帧）。
  - 本地唤醒：KL15信号、硬线电平或传感器事件（如车门解锁）。

---

状态转换逻辑

1. 进入流程：
   - 节点从Network Mode经Ready Sleep State (RSS)进入Prepare Bus-Sleep Mode，超时后最终跳转至BSM。
   - 网关节点可能通过同步关闭部分网络集群（PNC）协调全网休眠。
2. 退出流程：
   - 唤醒事件触发后，节点直接进入Repeat Message State (RMS)，快速同步网络状态。

---

 应用场景与优化

- 整车场景：

  - 车辆熄火后，舒适CAN总线通常在15分钟内进入BSM，2小时后进一步降低至控制单元深度休眠（如关闭MCU供电）。
  - 若休眠失败（如OBD设备持续通信），可能导致蓄电池亏电。

- 功耗对比：

  | **模式**           | 典型电流消耗 | 通信能力       |
  | ------------------ | ------------ | -------------- |
  | **Network Mode**   | 800mA+       | 全双工通信     |
  | **Bus-Sleep Mode** | <10mA        | 仅支持唤醒检测 |

---

 与其他模块的协同

- 与收发器联动：
  - BSM下，收发器（如TJA1145）进入Sleep模式，仅VBAT引脚维持微安级供电。
- 与电源管理：
  - INH引脚拉低后关闭外部稳压器，MCU完全断电（KL30节点）。

### PDU格式

网络管理的报文有特定的格式要求，报文数据段格式如图：



| 字节序列 | 数据描述               |
| -------- | ---------------------- |
| Byte 7   | User data 5            |
| Byte 6   | User data 4            |
| Byte 5   | User data 3            |
| Byte 4   | User data 2            |
| Byte 3   | User data 1            |
| Byte 2   | User data 0            |
| Byte 1   | Control Bit Vector     |
| Byte 0   | Source Node Identifier |

其中 CBV（ControlBitVector）字节对应的 bit 位标识如下：



| Bit7 | Bit6    | Bit5 | Bit4              | Bit3                       | Bit 2                                 | Bit1                                 | Bit0                   |
| ---- | ------- | ---- | ----------------- | -------------------------- | ------------------------------------- | ------------------------------------ | ---------------------- |
| Res  | PNI Bit | Res  | Active Wakeup Bit | NM Coordinator Sleep Ready | Res R3.2 NM Coordinator ID (High Bit) | Res R3.2 NM Coordinator ID (Low Bit) | Repeat Message Request |

对于 CBV 中的 bit 说明如下：

1. Bit 0 ：重复消息请求
   - 0：未请求进入 Repeat Message State
   - 1：请求进入 Repeat Message State
2. Bit 1,2：保留位，当配置项 CanNmCoordinatorEnabled 使能时，该位等于配置的 CanNmCoordinatorId 的值
3. Bit 3 NM 协调器休眠位
   - 0：主协调器不要求启动同步休眠
   - 1：主协调员请求启动同步休眠
4. Bit 4 主动唤醒位
   - 0：节点尚未唤醒网络
   - 1：节点唤醒了网络
5. Bit 6： 局部网络信息位（PNI）
   - 0：NM 消息不包含局部网络请求信息
   - 1：NM 消息包含局部网络请求信息,该位由配置决定，运行阶段不改变
6. Bit5 Bit7 为保留位

NmPdu 中的 UserData 可以通过 CanNm 的配置引用 EcuC 中的 Pdu。未使用的情况下默认全 0xFF，通过 Nm 的接口去抓取当前接收与发送的 UserData。

### 远程睡眠指示

远程睡眠指示功能是指当本地节点一直工作在 Normal Operation State，在一定时间内却一直收不到总线上其他节点的网络管理报文，此时本地节点 CanNm 认为总线上除了自己，其他节点都已经满足睡眠，进而向上层 NM 模块报告远程睡眠指示并在 CanNm 模块内部记录此事件，后续上层 NM 模块还可以调用 CanNm_CheckRemoteSleepIndication()函数接口主动查询远程睡眠是否已经发生。该功能一般在网关节点上使用。

### 同步睡眠策略

AUTOSAR CanNm 算法基于周期传输的网络管理 PDU 实现，接收到 NM PDU 表示发送此 NM PDU 的节点需要网络保持唤醒。如果某节点准备进入 Bus-Sleep Mode，此节点就停止发送 NM PDU，但是只要能收到网络上其他节点发送的网络管理报文，此节点就推迟进入 Bus-Sleep Mode。最终，不再收到其他节点的 NM PDU，并且此状态持续指定的时间后，所有的节点均同时开始进入 Bus-Sleep Mode。

### 降低总线负载机制

NM PDU 的发送周期取决于时间参数 CANNM_MSG_CYCLE_TIME，同一网络中所有节点的此时间参数都相同。当网络中节点数量比较多，并且不采取任何措施时，就容易导致总线负载过高。为解决此问题，提出了降低总线负载机制。实现降低总线负载机制需遵循如下两点：

1. 如果节点成功接收 NM 报文，则此节点发送周期定时器重置为节点特殊参数CANNM_MSG_REDUCED_TIME，此参数取值范围为 1/2(CANNM_MSG_CYCLE_TIME) ~ CANNM_MSG_CYCLE_TIME。
2. 如 果 节 点 成 功 发 送 NM 报 文 ， 则 此 节 点 发 送 周 期 定 时 器 重 置 为CANNM_MSG_CYCLE_TIME。

遵循此两点则产生如下结果：网络中仅拥有最小的 CANNM_MSG_REDUCED_TIME 的两个节点（假定为 1、2 节点）交替发送 NM PDU，如果其中一个节点（节点 1）准备进入休眠而停止发送 NM PDU，则其余需要总线唤醒的节点中 CANNM_MSG_REDUCED_TIME 值最小的节点，比如 3节点，则代替刚停止发送 NM PDU 的节点，开始与 2 节点交替发送 NM PDU。依次类推，直到网络中只有一个节点需要总线唤醒时，则按照CANNM_MSG_CYCLE_TIME 周期发送NM PDU。

这样做的目的就是让NM报文由一开始的所有ECU报文周期性发送变成了总线上同一段实际只有两个ECU交替发送NM报文，前提时是这些ECU开启了这个机制。

### 通信控制

CanNm 模块中有对本模块通信控制的功能，可根据实际情况，在不需要网络管理模块 通 信 时 （ 如 诊 断 中 0x28 诊 断 服 务 ） ， 上 层 接 口 可 调 用 通 信 控 制 接 口 函 数CanNm_DisableCommunication()和CanNm_EnableCommunication()来控制网络管理模块通信。

### CanNm的Timer

CanNm 模块使用的定时参数如下表所示：

| 参数名称                  | 描述                                   |
| ------------------------- | -------------------------------------- |
| CanNmImmediateNmCycleTime | 定义快速发送 NM PDU 的发送周期         |
| CanNmMsgCycleTime         | 定义 NM PDU 的发送周期                 |
| CanNmMsgReducedTime       | 定义在降低总线负载下的 NM PDU 发送周期 |
| CanNmMsgTimeoutTime       | 定义 NM PDU 发送超时时间               |
| CanNmRepeatMessageTime    | 定义 RepeatMessage 状态下的持续时间    |
| CanNmTimeoutTime          | 定义等待 NM PDU 的超时时间             |
| CanNmWaitBusSleepTime     | 定义总线休眠的超时时间                 |

## CanSm

> [!tip] 
>
> 标准文件请参见[Specification of CAN State Manager (autosar.org)](https://www.autosar.org/fileadmin/standards/R20-11/CP/AUTOSAR_SWS_CANStateManager.pdf)

框架图如下：

```plantUML
@startuml

' 设置字体和箭头样式
skinparam defaultFontName "Arial"
skinparam arrowColor #666666
skinparam linetype ortho  ' 强制直角连接（更符合框图布局）

' 定义颜色常量（与原图匹配）
!define COLOR_APP #A9A9A9  ' 灰色（App方块）
!define COLOR_COMM #4DA6FF  ' 蓝色（AUTOSAR ComM）
!define COLOR_STATE #66BB66  ' 绿色（Bus Specific State Manager）
!define COLOR_GEN_NM #D1A8E0  ' 紫色（Generic NM Interface / Bus Specific NM）
!define COLOR_INTERFACE #FFCC80  ' 黄色（Bus Specific Interface）

' 第一行：三个 App 方块（横向排列）
rectangle "App" as App1 #COLOR_APP
rectangle "App" as App2 #COLOR_APP
rectangle "App" as App3 #COLOR_APP

' 第二行：AUTOSAR ComM（长条形蓝色方块，横跨宽度）
rectangle "AUTOSAR ComM" as ComM #COLOR_COMM

' 第三行：左侧绿色方块（Bus Specific State Manager）+ 右侧紫色方块（Generic NM Interface + Bus Specific NM）
' 左侧绿色方块（两个纵向排列）
rectangle "<Bus Specific>\nState Manager" as State1 #COLOR_STATE
rectangle "<Bus Specific>\nState Manager" as State2 #COLOR_STATE

' 右侧紫色方块（分上下两层：上层1个，下层2个）
rectangle "Generic NM Interface\n(Nm)" as GenNM #COLOR_GEN_NM
rectangle "<Bus Specific>\nNM" as Nm1 #COLOR_GEN_NM
rectangle "<Bus Specific>\nNM" as Nm2 #COLOR_GEN_NM

' 第四行：黄色 Bus Specific Interface（长条形，横跨宽度）
rectangle "<Bus Specific>\nInterface" as Interface #COLOR_INTERFACE

' ==============================================
' 布局调整（通过隐藏的箭头控制位置关系）
' ==============================================

' 第一行 App 横向排列（强制间距）
App1 -[hidden]-> App2
App2 -[hidden]-> App3

' 第二行 ComM 位于 App 下方（居中对齐）
App1 -[hidden,dashed]-> ComM
App3 -[hidden,dashed]-> ComM

' 第三行：左侧绿色方块与右侧紫色方块横向排列
State2 -[hidden]-> GenNM  ' 绿色方块整体位于紫色方块左侧

' 第三行右侧紫色方块内部布局（上层 GenNM，下层 Nm1/Nm2 横向排列）
GenNM -[hidden,dashed]-> Nm1
Nm1 -[hidden]-> Nm2

' 第四行 Interface 位于最底部（居中对齐）
State1 -[hidden,dashed]-> Interface
Nm2 -[hidden,dashed]-> Interface

@enduml
```

![CAN SM架构图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/4_16_22_29_image-20251104162221477.png)

可以看到CanSM和上一章介绍的CanNm是两兄弟，都是基于interface层，对上则服务于ComM服务。只不过两兄弟所实现的功能不一样，在具体介绍CanSM模块之前，得先搞清楚状态管理是个什么玩意。首先这里管理的状态其实是对应其**总线的通信状态**，所以CanSM模块管理的就是CAN总线的通信状态，而这里的通信状态则包含能不能发送报文，能不能接收报文，总线上有没有错误等。CanSM提供的主要功能主要有：

1. 总线模式切换
2. Busoff 恢复管理
3. 切换波特率
4. 唤醒确认管理

### 模块交互

CanSM模块针对CAN总线状态而言，由上而下，CanSM接收其他模块的总线状态切换请求并通知CanIf模块去执行，由下而上，CanSM接收CanIf模块的总线状态切换反馈并汇报给其他模块。下图显示了在AUTOSAR的BSW层中其他模块与CanSM的交互情况：

![CAN SM和别的模块的交互图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/4_16_26_14_image-20251104162613610.png)

1. ECuM模块会初始化CanSM模块，并与CanSM模块交互进行CAN总线唤醒的验证。
2. ComM模块使用CanSM模块请求CAN网络的通信模式，CanSM模块会将其CAN网络的当前通信模式通知给ComM模块。
3. CanSM模块使用Canlf模块来控制CAN控制器和CAN收发器工作模式，Canlf模块通知CanSM模块CAN总线相关事件。
4. CanSM模块向Dem模块报告总线特定的故障信息。
5. CanSM将总线特定的模式更新通知到BswM模块。
6. CanSM模块将部分网络可用性通知给CanNm模块，并在部分联网的情况下处理已通知的CanNm超时异常。
7. CanSM模块向Det模块报告开发和运行时错误。

### 通信模式

![CAN SM的通信模式](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/4_16_58_45_image-20251104165844386.png)



在CAN通信（基于AUTOSAR架构）中，有三种通信模式：

1. 完全通信模式（FULL_COMMUNICATION）：节点**正常收发数据**，参与总线通信（如ECU运行时）。
   - 控制器：`CANIF_CS_STARTED`（启动状态，处理协议层）。
   - 收发器：`TRCVMODE_NORMAL`（主动驱动差分信号）。
2. 静默通信模式（SILENT_COMMUNICATION）：节点**仅接收数据，不发送数据**，避免干扰总线（如诊断监听）。
   - 控制器：`CANIF_TX_OFFLINE`（发送关闭，仅接收）。
   - 收发器：仍保持`TRCVMODE_NORMAL`（需接收物理层信号）。
3. 无通信模式（NO_COMMUNICATION）： 节点**完全离线**，进入低功耗状态（如车辆熄火后）。
   - 控制器：`CANIF_CS_STOPPED`（协议层停止运行）。
   - 收发器：`TRCVMODE_STANDBY`（待机模式，仅保留唤醒能力）。

模式切换逻辑为：

1. **唤醒事件**（如总线活动）： `NO_COMMUNICATION` → **唤醒** → `FULL_COMMUNICATION`。
2. **诊断需求**： `FULL_COMMUNICATION` → **静默** → `SILENT_COMMUNICATION`。
3. **休眠指令**： `FULL_COMMUNICATION` → **关闭** → `NO_COMMUNICATION`。

> [!tip]
>
> 在上面的状态机中实际上还有其他的状态，对于通信模式而言只有三种稳定状态，其余都是中间状态。
>
> - NOT_INITIALIZED 状态下，只能调用 CanSM_Init。
> - PRENOCOM/WUVALIDATION/PRE_FULLCOM/CHANGE_BAUDRATE/SILENTCOM_BOR 为中间状态，正常情况下，CanSM不会停留在这些状态中，在这些状态下，调用 CanSM_RequestComMode 会被拒绝。
> - NOCOM\FULLCOM\SILENTCOM 为稳定状态，处于这些状态下，可接受新的CanSM_RequestComMode 请求。

> [!Note]
>
> 在以上状态机图中，不同的前缀条件代表不同的条件：
>
> - T: Trigger
> - G: Guarding condition
> - E: Effect

#### 子状态机

> [!note]
>
> 如果观察下面的所有状态机，就会发现，在设置控制器模式之前都需要将先设置为Stop模式，将收发器设置为Nomal模式。这是因为控制器可能在上电后默认处于未初始化状态，需先复位到“停止模式”作为启动前的统一基准状态。同理，收发器状态也需要做基准。

##### CANSM_BSM_WUVALIDATION

在以下的状态机图中：

- G开头的我们可以认为是已经切换成功，如**`[G_TRCV_NORMAL_E_OK]`**：若收发器成功切换到正常模式（条件成立），则进入 **`S_TRCV_NORMAL_WAIT`** 状态等待确认。
- T开头可以认为是触发，如**`T_TRCV_NORMAL_TIMEOUT`**：若设置超时（未收到成功反馈），则可能跳转回自身或进入错误处理。

其中正常的状态转移概述为：

1. 设置CAN收发器为Normal状态，CanIf_SetTrcvMode(CANTRCV_TRCVMODE_NORMAL)
2. 设置CAN控制器为Stopped状态，CanIf_SetControllerMode(CAN_CC_STOPPED)
3. 设置CAN控制器为Started状态，CanIf_SetControllerMode(CAN_CC_STARTED)

所以最终的收发器状态为`Normal`，控制器状态为`Started`。

![CANSM_BSM_WUVALIDATION子状态机转换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_14_10_34_image-20251108141026940.png)



##### CANSM_BSM_S_PRE_NOCOM

在这个状态机中，对于支持PN功能的程度不同走了两个不同的分支，但是实际上控制器和收发器的最终状态是一致的，改变过程为：

- 设置CAN控制器为Stopped状态，CanIf_SetControllerMode(CAN_CC_STOPPED)
- 设置CAN控制器为Sleep状态，CanIf_SetControllerMode(CAN_CC_SLEEP)
- 设置CAN收发器为Normal状态，CanIf_SetTrcvMode(CANTRCV_TRCVMODE_NORMAL)
- 设置CAN收发器为Standy状态，CanIf_SetTrcvMode(CANTRCV_TRCVMODE_STANDBY)

所以最终的收发器状态为`Standy`，控制器状态为`Sleep`。

![CANSM_BSM_S_PRE_NOCOM子状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_14_37_30_image-20251108143729733.png)

其中CANSM_BSM_DeInitPnSupported状态机为：

![CANSM_BSM_DeInitPnSupported状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_14_52_24_image-20251108145223989.png)

CANSM_BSM_DeInitPnNotSupported的状态机为：

![CANSM_BSM_DeInitPnNotSupported状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_14_56_43_image-20251108145642729.png)

##### CANSM_BSM_S_SILENTCOM_BOR



在该状态机中，BOR表示**Bus-Off Recovery**（总线离线恢复），需要将Can设备重启（控制器为`S_RESTART_CC`状态）。同时应该调用Dem_SetEventStatus报告Bus Off事件。



![CANSM_BSM_S_SILENTCOM_BOR状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_15_5_29_image-20251108150528953.png)

##### CANSM_BSM_S_PRE_FULLCOM

其中正常的状态转移为：

- 设置CAN收发器为Normal状态，CanIf_SetTrcvMode(CANTRCV_TRCVMODE_NORMAL)
- 设置CAN控制器为Stopped状态，CanIf_SetControllerMode(CAN_CS_STOPPED)
- 设置CAN控制器为Started状态，CanIf_SetControllerMode(CAN_CS_STARTED)

所以最终的收发器状态为`Normal`，控制器状态为`Started`。



![CANSM_BSM_S_PRE_FULLCOM状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_15_11_48_image-20251108151147624.png)

##### CANSM_BSM_S_FULLCOM

该状态机的核心功能是在CAN通信正常激活后，**监控总线状态（如总线离线、发送超时）、处理故障恢复（如Bus-Off恢复）以及支持波特率切换**，确保CAN总线持续稳定通信。

- **E_TX_OFF/ON**:总线结果为TX_OFFLINE/TX_ONLINE
- **G_BUS_OFF_PASSIVE**：如果CANSM_BOR_TX_CONFIRMATION_POLLING禁能且E_TX_ON持续时间大于等于CANSM_BOR_TIME_TX_ENSURED；或如果CANSM_BOR_TX_CONFIRMATION_POLLING使能且API：CanIf_GetTxConfirmationState返回CANIF_TX_RX_NOTIFICATION则满足条件G_BUS_OFF_PASSIVE。
- **T_SILENT_COM_MODE_REQUEST**：CanSM_RequestComMode(COMM_SILENT_COMMUNICATION)
- **T_BUS_OFF**：如果回调函数CanSM_ControllerBusOff，则以T_BUS_OFF触发状态切换。
- **T_RESTART_CC_INDICATED**：在重启CAN控制器后，CanSM获得状态指示，则以T_RESTART_CC_INDICATED触发状态切换。
- **G_TX_ON**：如果参数CanSMEnableBusOffDelay是FALSE：当bus-off恢复次数小于CanSMBorCounterL1ToL2时，经过时间CanSMBorTimeL1；或当bus-off恢复次数大于等于CanSMBorCounterL1ToL2时，经过时间CanSMBorTimeL2则满足G_TX_ON。

![CANSM_BSM_S_FULLCOM状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_15_28_25_image-20251108152825086.png)



其中子状态CANSM_BSM_S_TX_TIMEOUT_EXCEPTION为：

![CANSM_BSM_S_TX_TIMEOUT_EXCEPTION状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_15_49_40_image-20251108154940159.png)

最终会将控制器设置为Start状态。

##### CANSM_BSM_S_CHANGE_BAUDRATE

CanIf_SetBaudrate() 如果直接设置波特率失败，执行

- 设置CAN控制器为Stopped状态，CanIf_SetControllerMode(CAN_CS_STOPPED)
- 设置CAN控制器为Started状态，CanIf_SetControllerMode(CAN_CS_STARTED)

![CANSM_BSM_S_CHANGE_BAUDRATE状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/11/8_15_55_25_image-20251108155525164.png)

#### 模式切换

发送`FULL_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request FULL_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(FULL_COMMUNICATION)
    CanSM->>CanIf: SetControllerMode(CANIF_CS_STARTED)
    CanSM->>CanTrcv: SetMode(TRCVMODE_NORMAL)
    CanTrcv-->>CanSM: TRCVMODE_NORMAL_ACK
    CanIf-->>CanSM: CANIF_CS_STARTED_ACK
    CanSM->>ComM: CanSM_CurrentComMode(FULL_COMMUNICATION)
    ComM-->>App: COMM_FULL_COMMUNICATION
    loop 正常通信
        CanIf->>CanTrcv: Transmit(CAN Frame)
        CanTrcv-->>CanIf: TX_ACK
    end
```

---

发送`SILENT_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request SILENT_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(SILENT_COMMUNICATION)
    CanSM->>CanIf: SetPduMode(CANIF_TX_OFFLINE)
    CanSM->>CanTrcv: SetMode(TRCVMODE_NORMAL)
    CanTrcv-->>CanSM: TRCVMODE_NORMAL_ACK
    CanIf-->>CanSM: PDU_MODE_ACK
    CanSM->>ComM: CanSM_CurrentComMode(SILENT_COMMUNICATION)
    ComM-->>App: COMM_SILENT_COMMUNICATION
    loop 仅接收
        CanTrcv->>CanIf: IndicateRxFrame(CAN Frame)
        CanIf->>App: NotifyRxData
    end
```

---

发送`NO_COMMUNICATION`请求：

```mermaid
sequenceDiagram
    participant App
    participant ComM
    participant CanSM
    participant CanIf
    participant CanTrcv

    App->>ComM: Request NO_COMMUNICATION
    ComM->>CanSM: CanSM_RequestComMode(NO_COMMUNICATION)
    CanSM->>CanIf: SetControllerMode(CANIF_CS_STOPPED)
    CanSM->>CanTrcv: SetMode(TRCVMODE_STANDBY)
    CanTrcv-->>CanSM: TRCVMODE_STANDBY_ACK
    CanIf-->>CanSM: CANIF_CS_STOPPED_ACK
    CanSM->>ComM: CanSM_CurrentComMode(NO_COMMUNICATION)
    ComM-->>App: COMM_NO_COMMUNICATION
    Note over CanTrcv: 仅响应硬件唤醒信号
```

```mermaid
stateDiagram-v2
    [*] --> NO_COMMUNICATION: 初始状态
    NO_COMMUNICATION --> FULL_COMMUNICATION: CanSM_RequestComMode(FULL)\n且CanTrcv唤醒成功
    FULL_COMMUNICATION --> SILENT_COMMUNICATION: CanSM_SetPduMode(TX_OFFLINE)\n保留接收功能
    SILENT_COMMUNICATION --> FULL_COMMUNICATION: CanSM_SetPduMode(ONLINE)\n恢复发送
    SILENT_COMMUNICATION --> NO_COMMUNICATION: CanSM_RequestComMode(NONE)\n或总线超时
    FULL_COMMUNICATION --> NO_COMMUNICATION: CanSM_RequestComMode(NONE)\n或强制休眠

    state NO_COMMUNICATION {
        [*] --> CanTrcv_STANDBY: 收发器待机
        CanTrcv_STANDBY --> CanIf_STOPPED: 控制器关闭
    }

    state FULL_COMMUNICATION {
        [*] --> CanTrcv_NORMAL: 收发器激活
        CanTrcv_NORMAL --> CanIf_STARTED: 控制器启动
    }

    state SILENT_COMMUNICATION {
        [*] --> CanTrcv_NORMAL: 收发器激活
        CanTrcv_NORMAL --> CanIf_TX_OFFLINE: 控制器仅接收
    }

    note left of NO_COMMUNICATION: 低功耗模式\n仅支持硬件唤醒
    note right of FULL_COMMUNICATION: 全双工通信\n周期性发送NM报文
    note left of SILENT_COMMUNICATION: 静默监听\n用于诊断或监控
```

### Busoff

除了上面所说的总线状态机，CanSM模块还有另外一个小型状态机，那就是用来实现的Busoff 恢复机制。

当CanSM模块从CanIf模块收到 Busoff 通知时，将会进入 Busoff 恢复的状态，恢复机制如下：

1. 快恢复，产生 Busoff 后，延时 CanSMBorTimeL1 时间尝试恢复；
2. 快恢复次数达到 CanSMBorCounterL1ToL2 后，进行慢恢复；
3. 慢恢复，产生 Busoff 后，延时 CanSMBorTimeL2 时间尝试恢复；
4. 慢恢复次数为无限次。

尝试恢复指的是，重新打开Can的发送能力，并从Busoff Recovery状态切换至CHECK_BUS_OFF状态。在首次进行快恢复和慢恢复时，CanSM模块会分别给出回调函数通知用户。

当 CanSM 尝试恢复 Busoff 后，有两种方法对总线是否恢复进行确认。

1. 若 CanSMBorTxConfirmationPolling 为 false，停留在BUS_OFF_CHECK状态没有超过时间参数CanSMBorTimeTxEnsured，在此时间段内，没有新的 Busoff 事件产生，则认为 Busoff恢复成功。
2. 若 CanSMBorTxConfirmationPolling 为 true，停留在 BUS_OFF_CHECK状态，直到检测到确实有一帧 Can 报文发送成功并给出了发送确认则认为 Busoff 恢复成功。这种情况下，需要调用 CanIf 的CanIf_GetTxConfirmationState 接口。

Busoff 恢复成功后，BUS_OFF_CHECK状态将切换为 NO_BUS_OFF状态，总线通信恢复正常（**注**：BUS_OFF_CHECK和NO_BUS_OFF是FULLCOM状态中的两个小状态）。

如果Busoff 恢复不成功，节点一直在慢恢复期，意味着该节点不会外报文(应用报文和网络管理报文均不会外发)，其他节点会上报对应的节点丢失故障。

#### 概述

> **什么是Can Bus Off**
>
> 车上有一个ECU 1, 一直向总线发送消息，可怎么都发送不出去。
>
> 如果这个累计到一定的次数（255），按照CAN总线协议： ECU 1自己进入 BUSOFF模式，这个时候ECU 1 一时半会是不能发送信息了。
>
> 



> **BusOff 后如何处理**
>
> ECU 1在自己内部检测到BUS OFF后，默默的从逻辑上退出了总线，暂时他没妨碍大家，ECU 1他自己也搞不明白啥回事，于是ECU 1拿着小本子，记下了 x年x月x日x时x分x秒, 汽车电压，里程，xxx 是多少多少，我bus off 了。
>
> 写完备案后，ECU 1 开始数时间，等待 5 秒后，重启自己的CAN模块



> **BusOff时计数的变化规律**
>
> bus off是个非常集体的概念：
>
> - ECU自己发送失败，TX error count + 8，
> - ECU自己发送成功，TX error count - 1，
>
>  这个TX error count 超过255，ECU就必须进入Bus Off 状态，并需要逻辑上断开总线



> **Can Frame的一些常见错误**
>
> 1. 发送ECU检查
>    - 有无ACK
>    - CRC检查，CRC Delimiter, ACK Delimiter，EOF等
>    - BIT监控， 送的那个ECU，自己校对每个BIT，看有没有都送对（ID区域，和ACK区域除外）
> 2. 接收ECU检查
>    - CRC检查，CRC Delimiter, ACK Delimiter，EOF等
>    - 检查有无连续6比特是全0、或全1的



#### 故障界定

为了避免某个设备因为自身原因（例如硬件损坏）导致无法正确收发报文而不断的破坏总线的数据帧，从而影响其它正常节点通信，CAN网络具有严格的错误诊断功能，CAN通用规范中规定每个CAN控制器中有一个发送错误计数器和一个接收错误计数器。根据计数值不同，节点会处于不同的错误状态，并根据计数值的变化进行状态转换，状态转换如下图所示。

![故障界定状态转化图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/9_8_36_8_202505090836596.png)

以上三种错误状态表示发生故障的严重程度，总线关闭是节点最严重的错误状态。并且，节点在不同的状态下具有不同的特性，在总线关闭状态下，节点不能发送报文或应答总线上的报文，也就意味着不能再对总线有任何影响。

状态跳转和错误计数的规则使得节点在发生通信故障时有了较好的自我错误处理和恢复机制，从一种较严重的错误状态跳转到另一种严重性相对较低的状态，本质上就是一种恢复过程。上图所呈现的转换过程是CAN通用规范所要求的，我们从设备供应商买回来的CAN控制器已经把这些功能固化在硅片之中。

在通信过程中，错误主动和错误被动两种状态下节点的恢复过程一般不需要MCU进行额外的编程处理，直接使用CAN控制器固有功能即可。但对于总线关闭状态，往往不直接使用CAN控制器固有的恢复过程，而是对其进行编程控制，以实现“快恢复”和“慢恢复”机制。

#### 快恢复和慢恢复



当节点进入总线关闭状态后，如果MCU仅是开启自动恢复功能，CAN控制器在检测到128次11个连续的隐性位后即可恢复通信，在实际的CAN通信总线中，这一条件是很容易达到的。以125K的波特率为例，12811（1/125000）= 0.011264s。这意味着如果节点所在的CAN总线的帧间隔时间大于0.011264s，节点在总线空闲时间内便可轻易恢复通信。我们已经知道，当进入总线关闭状态时，节点已经发生了严重的错误，处于不可信状态，如果迅速恢复参与总线通信，具有较高的风险，因此，在实际的应用中，往往会通过MCU对CAN控制器总线关闭状态的恢复过程进行编程处理，以控制节点从总线关闭状态恢复到错误主动状态的等待时间，达到既提高灵活性又保证节点在功能上的快速响应性的目的。具体包括“快恢复”和“慢恢复”策略，两种策略一般同时应用。

通过以上的讨论，我们可以知道，节点进入总线关闭状态后，存在以下几种恢复情况：

1. MCU仅开启CAN控制器的自动恢复功能，节点只需检测到128次11个连续的隐性位便可以恢复通信，恢复过程如[上节图](##故障界定)所示。

2. MCU没有开启CAN控制器的自动恢复功能，也不主动干预总线关闭错误，节点将一直无法“自动”恢复总线通信，只能通过重新上电的方式使节点恢复, 恢复过程如下图所示。

   ![重新上电恢复总线](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/9_8_46_17_202505090846016.png)

3. MCU对CAN控制器的恢复过程进行编程处理，这时，节点的恢复行为由具体的编程逻辑决定，各厂家普遍采用了先“快恢复”后“慢恢复”的恢复策略，恢复过程如下图所示。

   ![快慢恢复](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/13_8_14_35_202505130814506.png)

MCU编程实现总线关闭“快恢复”和“慢恢复”的一般过程可用以下流程图描述：

![快慢恢复流程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/13_8_17_28_202505130817900.png)

节点以正常发送模式发送报文的过程中，如果出现了发送错误，发送错误计数会增加，只要发送错误计数没有超过255， CAN控制器便会自动重发报文，如果出现多次发送错误，使发送错误计数累加超过255，则节点跳转为总线关闭状态。MCU能够第一时间知道节点进入了总线关闭状态（例如在错误中断处理逻辑中查询状态寄存器的相应位），这时MCU控制CAN控制器进入“快恢复”过程，即控制CAN控制器停止报文收发，并进行等待，计时达到需要的时间T1（如100ms）后，MCU重新启动恢复CAN控制器参与总线通信，这样便完成了一次“快恢复”过程。

节点每进入一次“快恢复”过程时，MCU会对此进行计数，当节点“快恢复”计数达到设定的值N（如5次），则后续再次进入总线关闭状态时MCU把恢复总线通信的等待时间T2进行延长（如1000ms），这样便实现了“慢恢复”过程。“快恢复”和“慢恢复”过程的主要区别就在于恢复节点参与总线通信的等待时间的不同。

通过MCU对于总线关闭后的恢复行为进行编程控制，实际上是对CAN控制器的错误管理和恢复机制进行了补充，使得总线关闭状态后的恢复过程更加灵活，更能适应实际应用的需要。对于 “快恢复”和“慢恢复”的等待时间，以及“快恢复”计数多少次后进入“慢恢复”过程，不同厂家可根据具体的需求进行编程实现。

> [!note] 
>
> 当我们进行干扰的时候，不用Rx口就可以知道数据帧发送是否正确，以下使用Ack干扰来举例：
>
> CAN总线采用"线与"逻辑，发送节点在ACK槽（ACK Slot）发送隐性位（逻辑1），而正确接收的节点会覆盖为显性位（逻辑0）。发送节点通过**实时回读总线电平**与自身发送的电平对比：
>
> - 成功应答：若回读到显性位（0），说明至少有一个节点正确接收。
> - 应答错误：若回读到隐性位（1），说明无节点应答，触发ACK错误。
>
> 此过程由CAN控制器硬件自动完成，无需软件干预。发送节点在TX发送的同时通过内部回环检测总线实际状态，而非依赖RX口 。
>
> 问题：不走Rx是怎么知道发出去的报文是正确的‼‼‼‼‼‼‼‼
>
> 

### 切换波特率

CanSM模块提供接口CanSM_ChangeBaudrate可以切换CAN总线通信波特率，但是只有在FULLCOM状态且没有Busoff 时才能调用CanSM_ChangeBaudrate，其他状态调用 CanSM_ChangeBaudrate 会被拒绝。

### 唤醒确认功能

当系统进入休眠后，CAN 控制器也进入休眠状态。当发生 CAN 通道唤醒事件时，EcuM 会 调 用 CanSM模块的CanSM_StartWakeupSource() 函 数 ，CanSM状态机会由NOCOM状态进入CANSM_BSM_WUVALIDATION状态，将硬件状态设置为正常工作态。此时硬件可以接收到网络上的报文，CanIf 模块会判断该唤醒帧是否合法。若判断结果为合法， ComM 会 调 用 CanSM 模 块 的CanSM_RequestComMode()接口请求 CanSM 进入 FULLCOM 模式， 若结果为非法，则 EcuM 会调用 CanSM 模块的CanSM_StopWakeupSource()函数，由CanSM将硬件重新设置为休眠状态。

## ComM

 前面分别介绍了ComNm和ComSM两兄弟，这一章则来看看两兄弟的老板，那就是Communication Stack中管理层中最核心的一个模块，那就是ComM模块。

前面已经分别介绍了干活两兄弟NM模块和SM模块，NM模块主要负责的是基于总线报文管理ECU休眠，SM模块则是控制总线通信状态，这两兄弟其实都是实际执行者，ComM模块则是真正的总线管理者，用户只要对ComM模块告知自己想要的通信模式，ComM模块则会直接协调NM和SM两兄弟直接干活以达到用户想要的通信模式。

ComM 模块位于 AUTOSAR 的系统服务层，透过 RTE 与用户（这里的用户指的是可以对ComM模块下达请求的模块，可以是BswM，SWC, Runables等）直接交互。向下控制各总线状态管理器和网络管理器（SM 和 Nm），为用户提供统一的通信管理功能，同时协调SM 和 Nm 之间的状态关系。

![ComM框架图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_14_27_20_image-20250727142719861.png)

ComM 模块主要功能如下：

1. 初始化
2. 用户或 DCM 请求通信模式
3. 通知应用通信模式切换
4. 限制通道或 ECU 的通信功能
5. 与 EcuM 的唤醒功能协同、与 BswM 控制通信协同
6. 控制各通道的总线状态
7. 请求或释放网络管理服务

### PNC状态管理

ComM进行通信模式管理提供有两大状态机，其中一个就是PNC 状态管理，在介绍之前，得搞清楚PNC到底是个啥？PNC是Partial Network Cluster的缩写，一般将这些在某种条件下需要保持同样工作状态，且连接在同一总线（或由网关连接）的ECU称之为一组PNC，对这些ECU统一进行网络管理。在一些特殊应用中，如果网关也使能了PNC，那么则可以通过网关进行网络协调，让不同总线上的ECU组成一个大型PNC组。

ComM 模块对每组 PN 定义了一组状态机，用于描述各 PN 组的状态、状态转移关系和状态转移动作。该状态机共包含 4 种状态，分别为：

1. PNC_NO_COMMUNICATION
2. PNC_PREPARE_SLEEP
3. PNC_READY_SLEEP
4. PNC_REQUESTED

状态切换如下图所示：

![PNC状态转换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_8_7_7_%E6%9A%82%E5%AD%98.png)

观察状态切换图，可以看到上面出现了ERA, EIRA的字眼，无论是开启还是关闭ECU的通信功能，都是需要进行请求的，而这个请求则分为内部请求与外部请求，我们称之为External Internal Request Array，也即EIRA。每一个ECU都需要有EIRA，来根据部分网络活动进而切换IPdu Group的状态。至于ERA，External Requested Array，它主要用于网关，仅收集外部PN请求的场景。网关会将外部PN请求镜像回请求总线，同时将这个请求发送到其他的总线上。IRA，Internal Requested Array，代表ECU内部对于PNC状态的请求，既可以是SWC通过RTE直接请求ComM接口，或者在某种条件满足时，由BswM请求ComM接口。

系统上电后整个PNC的状态在COMM_PNC_NO_COMMUNICATION。

在PNC状态切换过程中如果是主动唤醒节点直接请求FULL通信，或者是网关节点控制的节点在收到网关下的ERA数组的相关状态位，直接从COMM_PNC_NO_COMMUNICATION进入到COMM_PNC_REQUESTED阶段。如果是被动唤醒的节点，则根据接收到唤醒报文中的PNC位状态切换到COMM_PNC_READY_SLEEP或者COMM_PNC_PREPARE_SLEEP。

而COMM_PNC_FULL_COMMUNICATION内部的三个子状态的切换也是根据该节电的是否能被动唤醒功能进行内部的状态切换，主要体现是主动唤醒下需要Request Full相关的操作以及NM报文中对应的UserData中相关的PNC位进行转换的。

总结一下可以让ComM的PNC状态机切换的事件可以来自于：

1. 来自用户的请求 ComM_RequestComMode()函数调用
2. 来自 EcuM 模块的唤醒通知 ComM_EcuM_WakeUpIndication()
3. 来自 Com 模块的 PNC 值变化通知
4. ComM 模块内部定时器超时事件

### Channel状态管理

上面提到ComM进行通信模式管理提供有两大状态机，另外一个就是Channel状态管理。这里的Channel指的是一个通信总线，比方说，一路ECU有两路CAN，一路FlexRay，那么就可以说对于ComM模块就有3个Channel。ComM 模块对每一个Channel都定义了一个状态机，用于描述通道的各种状态、状态转移关系和状态转移动作。该状态机共包含 3 个主状态，分别为：

1. COMM_NO_COMMUNICATION
2. COMM_FULL_COMMUNICATION
3. COMM_SILENT_COMMUNICATION

其中除 COMM_SILENT_COMMUNICATION 外，其余状态还包含有子状态。其状态转移图如下：

![Channel状态转换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/28_9_5_48_%E6%9A%82%E5%AD%98.png)

1. **COMM_NO_COMMUNICATION**：系统上电后进入到COMM_NO_COMMUNICATION，在该状态下具有下面两个子状态
   1. COMM_NO_COM_NO_PENDING_REQUEST
   2. COMM_NO_COM_REQUEST_PENDING。

2. **COMM_NO_COM_NO_PENDING_REQUEST**：在初始化完成ComM后进入该状态，该状态下总线不能进行任何的通信活动，需要等待FULL_COM请求切换状态，请求可来源于：
   1. 用户请求User Request；
   2. DCM Notification需要激活对应的通道；
   3. 来自于EcuM或者NM的Passive WakeUp通知。

3. **COMM_NO_COM_REQUEST_PENDING**：收到FULL_COM请求后，会切换至COMM_NO_COM_REQUEST_PENDING状态，然后等待Communication Allowed的触发信号，只有 “CommunicationAllowed=TRUE时” 才能将通信模式转换为FULL_COM模式下进行数据通信，如果没有Allowed的使能，则对FULL_COM请求将不会被执行。
4. **COMM_FULL_COMMUNICATION**：离开NO_COM状态后，则进入COMM_FULL_COMMUNICATION状态，在该状态下总线可以进行正常的数据通信，其也有两个子状态：COMM_FULL_COM_NETWORK_REQUESTED和COMM_FULL_COM_READY_SLEEP。而这两个模式的切换则是会根据**NmVariant**的变化来变化，后面会对NmVariant进行介绍。
5. **COMM_SILENT_COMMUNICATION**：该状态主要用于支持NM的Sleep流程处理，是NM状态机的Prepare Sleep阶段，只有在NM进入到prepare Sleep模式下该状态才进入。

总结一下可以让ComM的Channel状态机切换的事件可以来自于：

1. **来自 User 的请求 ComM_RequestComMode()函数调用**

2. 来 自 Dcm 模 块 的 ComM_DCM_ActiveDiagnostic() 和ComM_DCM_InactiveDiagnostic()函数调用

   当诊断仪与 Dcm 模块通信时，需要保证通道的正常可用状态，不能进入休眠。这时Dcm 模块通过在适当的时机调用 ComM 模块的 ComM_DCM_ActiveDiagnostic()来请求通道保持在FULL_COM状态 。 完成诊断通信后 ， Dcm模块再调用ComM_DCM_InactiveDiagnostic()接口释放对通道的使用。这时如果没有其他用户再使用该通道，则通道最终将进入 NOCOM 模式，通道关闭，所以在前面介绍Channel状态管理状态切换的时候就提到了Dcm模块是让ComM Channel状态切换的一个重要来源。

3. **来 自 Nm 模 块 的 网 络 状 态 通 知 ComM_Nm_NetworkMode() 与ComM_Nm_PrepareBusSleepMode()和 ComM_Nm_BusSleepMode()函数调用**

4. **来自 Nm 的 ComM_Nm_RestartIndication()和 ComM_Nm_NetworkStartIndication()**

5. **来自 EcuM 模块的唤醒通知 ComM_EcuM_WakeUpIndication()**

   当某个通信通道发生唤醒事件后，EcuM 会调用 ComM_WakeupIndication()函数通知ComM 模块。该通知会作为通道正常工作的一个触发源，将该通道状态切换到 FULLCOM模式。这时 ComM 会调用网络管理模块的 Nm_PassiveStartup()唤醒网络管理模块。

6. **ComM 模块内部定时器等**


### 通信禁止功能

通信禁止包含两种情况：

1. 禁止唤醒总线
2. 限制通信。

在某些唤醒线路故障情况下，某些应用会错误地请求总线，从而错误地唤醒总线上其他 ECU。这时可以通过调用 ComM_PreventWakeUp()接口，忽略用户请求，从而避免系统错误。该功能称为禁止唤醒总线。该功能只在对应通道进入 NO_COM 或 SILENT_COM时有效。

当通道处于 FULL_COM 模式时，应用可以调用 ComM_LimitChannelToNoComMode()或 ComM_LimitECUToNoComMode()来强制某个通道或整个 ECU 所有通道进入 NO_COM模式。这时 ComM 将忽略 User 对通道的占用，调用 Nm_NetworkRelease()释放网络管理。当远程休眠条件满足时，通道将最终进入 NO_COM 模式。该功能称为限制通信。该功能只在对应通道处于 FULL_COM 时有效。

### 不同类型的NM

NM模块有一个参数叫做NmVariant，可以指定每一个通道所对应的NM模块的网络管理能力，分为四种类型：

1. FULL：该通道具备网络管理模块的所有功能，因此本 ECU 具备保持总线唤醒的能力，同时可以由 NM 向 ComM 模块指示何时进入网络同步休眠状态。
2. PASSIVE：该通道的网络管理模块处于 PASSIVE 模式，即本身只接收网络管理报文，但不向外发送网络管理报文。本 ECU 不具备保持总线唤醒的能力，但可以根据其他 ECU的网络管理报文，向 ComM 模块指示进入网络同步休眠状态。
3. LIGHT：该通道不具有网络管理模块，因此不会接收或发送网络管理报文。但可以通过配置定时器，在没有通信需求的一段时间以后自动进入休眠状态。该配置项一般用于需要延迟休眠的场景。
4. NONE：该通道不具有网络管理模块，因此不会接收或发送网络管理报文。一旦进入FULL_COM模式就不会退出，也不会自动进入休眠状态，只有通过 ECU 电源才能控制网络关闭。

在同一个 ECU 上，FULL 和 PASSIVE 不能同时存在，即当某个通道配置了 PASSIVE类型时，本 ECU 上所有通道都只能为 PASSIVE、LIGHT 或 NONE 之一，不能为 FULL。当某个通道配置了 FULL 时，本 ECU 上所有通道都只能为 FULL、LIGHT 或 NONE 之一，不能为 PASSIVE：

1. FULL 是最常见的网络类型，在大部分应用场景中推荐使用该配置，这时需要将 NM的 PASSIVE 模式禁用。在 FULL 类型网络通道上，状态转移图与标准图一致。
2. PASSIVE 节点对网络的休眠唤醒没有决定权，完全听从其他节点的仲裁。例如本节点在仍有发送应用报文的需求时，网络上其他节点决定休眠，则本节点会无条件同步休眠，关闭总线接口的发送功能。
3. LIGHT 节点和 NONE 节点不具备网络管理功能，若接入一个具备网络管理功能的网络中，会影响网络正常休眠唤醒功能。一般应当独立使用或同样类型的节点组网。这两种类型的通道没有 SILENT 状态。NONE 节点一旦进入 FULL_COM 状态就无法切回NO_COM，除非系统复位。LIGHT 节点从 FULL_COM 到 NO_COM 是通过内部的一个定时器实现的，该定时器参数值由配置参数 ComMNmLightTimeout 决定。

### User、PNC与Channel的映射



上面提到了ComM模块的两种状态机，那么怎么样正确使用这两种状态机呢？用户，PNC，Channel三者的映射关系如下图所示：

![ComM状态机映射](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_8_26_36_%E6%9A%82%E5%AD%98.png)



每个 User 向下可以关联多个 PNC，每个 PNC 向上也可以关联多个 User，User 既可以关联 PNC 也可以直接关联 Channel，每个 PNC 向下可以关联多个 Channel，每个 Channel向上也可以关联多个 PNC 或 User。但是同一 Channel 不能既关联 User，又关联该 User下的 PNC。说得简单点就是自上而下，是交叉树状自上而下，用户想要控制一个一个总线接口，可以是User->PNC->Channel， 也可以是User->Channel。

User 可以通过接口请求 FULLCOM 和 NOCOM 模式，此时所有该 User 映射的通道或 PNC 都会收到请求。由于一个通道或 PNC 可以映射多个 User，因此只有当映射的所有 User 都请求了 NOCOM 时，ComM 才会在该通道或 PNC 上释放通信能力，否则只要有一个 User 请求 FULLCOM，ComM 都会为该通道或 PNC 保持通信能力。

在某些特殊情况下，用户可以通过 API 限制某个通道或整个 ECU 的通信能力，这时即使有用户请求FULLCOM，该请求也会被暂时抑制。限制通信的优先级高于 User 对通道的请求。

DCM 模块会使用某些通道作为诊断通道。它通过 API 激活该通道的通信能力。此时不论该通道映射的 User 请求何种模式，也不论该通道是否被限制通信，ComM 都会为该通道保持通信能力，也就是说 DCM 激活通道的优先级最高。

### 状态保存

ComM 的一些配置状态和计数值可以保存到非易失存储器中，在下次上电后恢复。可以保存的内容包含：

1. ECU 所有通道的禁止唤醒总线状态（NoWakeup）
2. ECU 组分类（EcuGroupClassification）
3. 禁止计数器

当使能此功能时，需要在 NvM 模块配置这几个 Block，且需要将其在 NvM 模块中将这几个模块配置在 ReadAll 和 WriteAll 列表中，以便在上电时自动恢复数据，以及下电前自动保存数据。

## PduR、IpduM

首先介绍一个在Communication Stack中出现频率很高的词I-PDU， 全称为Interaction Layer Protocol Data Unit, 意思就是交互PDU，可以理解成是软件协议层面上的一个完整性消息。PduR即为PDU Router。PduR 模块位于 AUTOSAR 的通信服务的核心位置， 作为上层模块与下层接口模块或传输层模块传输 I-PDU 的桥梁。说的简单一点就是个内部消息路由器，当PduR 收到底层传输层或者interface抽象层传输的 I-PDU后，将其传输到对应的服务模块，而上层服务模块需要发送 I-PDU时，PduR模块则会将消息传输到相应的传输层或者interface抽象层。

通信模块根据其在 AUTOSAR 架构中的位置和传输 I-PDU时的角色，可以分为三类：

1. **上层模块**：上层模块位于 PduR 上层，一般包括 Com、 Dcm 和 Cdd。
2. **下层接口模块**：下层接口模块位于 PduR 下层，一般包括 CanIf、 LinIf、 SoAdIf、 FrIf、 CddIf 等。
3. **下层传输层模块**：下层传输层模块同样位于 PduR 下层，一般包括 CanTp、 LinTp、 SoAdTp、 DoIPTp、FrTp 和 CddTp 等。

而PduR模块则是连接这些模块的枢纽，位于上层模块和下层模块之间，充当一个终极消息中转站。

![PdusR框图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_8_37_9_%E6%9A%82%E5%AD%98.png)

PduR模块主要包含两部分，分别是路由表和路由引擎，其中路由表非常好理解，就是它会给上层服务的所有 I-PDU编号，静态确定消息路径，里面会包含各种总线特征，比如CAN ID，这样PduR模块就可以根据路由表来进行消息路由，路由引擎则就是用来传输消息的搬运工，负责把 I-PDU从源方路由到目标方。

PduR 模块主要功能如下：

1. 初始化
2. 接收下层模块（接口模块、传输层模块） I-PDU并传递给上层模块
3. 发送上层模块 I-PDU到低层模块
4. 接收接口层 I-PDU并传递给其他接口层模块
5. 接收传输层 I-PDU并传递给其他传输层模块

### I-PDU的传输

下面举一个最简单的例子，如果PduR的下层模块为接口模块，以CAN为例子，那下层接口模块即为CanIf模块。如果Com模块需要通过CAN总线发送一条消息，那么这条消息的流向应该如下：

![IPDU的传输路径](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_8_41_43_%E6%9A%82%E5%AD%98.png)

Com调用PduR_ComTransmit发起消息发送， PduR模块接收到消息查表后确认消息目的方为CAN，然后调用CanIf_Transmit触发CAN消息的发送，消息发送成功后，最终由CanIf模块传来发送确认。

当PduR的下层模块为传输层模块的时候，则当传输层接收到 FF 或 SF 时，传输层将调用 PduR_StartOfReception 通知 PduR模块接收开始， PduR 模块通过调用_StartOfReception 传递给相应的上层模块，例如_StartOfIReception。传输层通过调用函数 PduR__CopyRxData 将数据传递给 PduR， PduR 模块通过调用_CopyRxData 将数据传递给上层模块。当接收完成时传输层模块将调用 PduR_RxIndication 通知 PduR 模块， PduR 将此指示传递给上层模块通过_TpRxIndication 函数。

### 路由路径

PduR 通过路由路径实现路由。一个路由路径由一个源 Id 和一个（或多个）目的 Id组成。当路由路径只包含一个目的 Id 时，称为单播，当路由路径包含多个目的 Id 时，称为多播。路由路径全部静态配置，不支持动态路由。

某个路由路径的目的可能同时包含多个接口，如 CanIf 接口和 LinIf 接口，为了能够支持整体关闭某种接口， PduR 具有路由路径组的概念。一个路由路径组包含多个目的 Id，它们可以属于同一个路由路径，也可以属于不同路由路径。反过来一个路由路径的不同目的 Id 可以属于不同的路由路径组。

路由路径组也是静态配置的。路由路径组可以单独使能或关闭。每个路由路径组的初始状态由配置决定。 PduR 提供了两个接口函数来动态使能或关闭某个路由路径组，分别为 PduR_EnableRouting()和PduR_DisableRouting()，它们主要由 BswM 模块调用。

### Zero Cost Operation

Zero Cost Operation是指当 PduR 只充当简单的路由功能时，为了优化性能而将各主要函数实现为宏的形式。该功能通过配置项 ZeroCostOperation 使能。要使用该功能，必须同时满足如下条件：

1. 用户配置的 PduRRoutingTable 路径中仅包含 Com-CanIf， CanIf-Com， Dcm-CanTp，CanTp-Dcm ， CanNm-Com ， Com-CanNm时；
2. PduRGeneral 里 PduRVersionInfoApi 为 FALSE 时；
3. 不包含 Routing Group 时。

### IpduM模块

在结构上PduR的旁边有一个IpduM（Interaction PDU multiplexer）模块，该模块看上去比较独立，它在AUTOSAR架构中，只和PduR模块和Com模块有交互。PDU多路复用即PDU的PCI相同而SDU布局不同，简单的来说就是使用相同的 IpduM I-PDU 发送或接收不同的 Com I-PDU，再简单一点说就是使用同一个PDU ID来发送不同的报文内容。对于多路复用的I-PDU来说，它的数据流向则变成了Com->PduR->IpduM->PduR->CanIf。

那么IpduM模块是怎么实现PDU复用的呢？IpduM 提供了两种模式来实现多路复用:

1. I-PDU Multiplexing

    其实现方式则为将一个多路复用的I-PDU分为一个静态部分和一个动态部分，其中静态部分由零个或多个信号或信号组组成，静态部分信号或者信号组的位置大小都是固定的，不会随着PDU多路复用而变化； 动态部分由Selector Field和一个或多个信号或信号组组成，这一部分除了Selector Field的位置不会变动外，信号和信号组的位置是可以随意发生变化的。如下图所示：

   ![I-PDU Multiplexing报文结构](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_9_6_17_image-20250729090617090.png)

   静态部分和动态部分的位置可根据I-PDU进行配置，静态部分和动态部分可以被细分为不同的段。对于每个多路复用的I-PDU，只能定义一个Selector Field，所以IpduM模块就是通过Selector Field的值来进行PD路由，根据其不同的值来解包I-PDU的动态部分的内容。Selector Field大小可以配置为1到16个连续位，其位置也可以通过配置来定义。

2. Multiple PDU to Container Mapping

   这种方式就更好理解了，即创建一个容器，然后将多路复用的每一种PDU layout都分配一个Header，当Com层出发信号发送时，则会根据该信号的I-PDU layout的所对应的Header在容器中来进行查找，然后进行数据组装最好进行发送，接收同理。

   ![Multiple PDU to Container Mapping帧结构](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/29_9_7_22_image-20250729090722184.png)


## Com

首先得了解一下AUTOSAT面向信号的通信理念，什么个意思呢？这里的信号可以理解成是应用层关心的实际值，比方说电压值，电流值，转速等，这些都是信号，应用层接收和发送信号的时候，它只需要调用相关信号的接口函数触发动作即可，至于这些信号值是通过哪种方式传送和哪种协议解析，应用层根本不关心，这就是AUTOSAR面向信号的通信理念。为了在软件中实现这个理念，Com模块在这其中起着至关重要的作用。

Com 模块位于 RTE 和 PDUR 的中间，其充当 RTE 和 PDUR 通信服务层的接口层，如下图所示：

![Communication stack结构](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_11_29_15_%E6%9A%82%E5%AD%98.png)

其主要功能就是负责为上层提供各种信号的接收和传送，说得简单点一点，就是把很多信号打包成PDU（这里的PDU则是软件协议层面上的一条消息，映射到硬件上，可能是一帧或者几帧，这取决于软件协议组包的方式，比如说TCP\IP协议栈的组包)，然后往各种总线上送，或者从各种总线上接收到PDU后解包成信号提供给上层。 但是众所周知，AUTOSAR就是会把简单的东西搞得及其得复杂，所以Com里面又有一大堆新玩意。

> [!note]
>
> 首先在介绍Com功能时，就不得不提一下DBC和LDF文件了， 在基于AUTOSAR架构进行通信协议栈的研发时，大家不可避免都会涉及到这两种文件，那么这两种文件到底有什么用呢？在这个世界还没有AUTOSAR之前，其实这两种文件就已经存在且被广泛应用，这两种文件主要定义了CAN报文（DBC文件定义）或者LIN报文(LDF文件定义)的组包方式，除此之外还有不同报文的发送和接收熟悉。
>
> 在AUTOSAR的方法论中，一切文件皆ARXML，所有输入输出文件都是ARXML文件类型，包括与DBC文件和LDF文件起到相同作用的文件，不过当时这两种文件已经特别通用，所以这两种格式的文件也无缝融入了的AUTOSAR的研发过程中，也有很多软件都能实现DBC文件和LDF文件与ARXML文件之间格式的转换。
>
> 关于DBC文件的介绍大家可以参考文章：《[细说DBC(一)——初识](http://www.360doc.com/content/12/0121/07/50927056_1016678962.shtml)》，关于LDF文件的介绍大家可以参考文章[《LIN数据库文件LDF介绍及使用》](https://zhuanlan.zhihu.com/p/541273938)。

 Com 模块主要功能如下：

1. 提供基于信号的发送机制；
   1. 提供不同的发送方式（例如：周期、事件）；
   2. 对报文发送超时进行监测与处理；
   3. 提供发送状态通知机制；
   4. 提供基于信号的发送接口函数。
2. 提供基于信号的接收机制；
   1. 对报文接收超时进行监测与处理；
   2. 提供接收状态通知机制；
   3. 提供基于信号的接收接口函数。
3. 支持信号路由功能；
4. 支持信号滤波功能；
5. 支持长报文（TP）传输；
6. 支持动态信号收发

### 报文的发送

首先得强调一点就是信号和报文（PDU）的关系是一条报文会包含一个或者多个消息。 报文的发送则是由报文传输特性及信号传输特性共同决定的。首先得了解一下报文和信号各有哪些传输特性。

报文的传输特性包括：

1. **NONE**：该类型的报文不会被发送；
2. **PERIODIC**：该类型报文的发送方式为周期发送，不会随发送信号的传输特性改变而改变；
3. **DIRECT**：该类型报文的发送方式完全由发送信号的传输特性决定；
4. **MIXED**：该类型报文的发送方式由报文的传输特性及发送信号的传输特性综合决定。

信号的传输特性包括：

1. **PENDING**：该类型信号的发送，是依据其所在报文的发送类型；
2. **TRIGGERED_WITHOUT_REPETITION**：每当写该信号时，触发一次发送；
3. **TRIGGERED**：每当写该信号时，触发多次发送；
4. **TRIGGERED_ON_CHANGE_WITHOUT_REPETITION**：每当该信号的值发送变化时，触发一次发送；
5. **TRIGGERED_ON_CHANGE**：每当该信号的值发送变化时，触发多次发送。

> [!tip] 
>
> **注1**：触发多次发送时，发送次数由该信号所在报文的 ComTxModeNumberOfRepetitions属性决定。多次发送的周期，由该信号所在报文的 ComTxModeRepetitionPeriod 属性决定。
>
> **注 2**：触发发送时，并非立即发送，而是需要等到下一个 Com_MainFunctionTx 的调度周期，才开始进行发送。

  所以两者结合后，导致最终一条报文最终传输特性为：

![暂存](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/30_8_40_11_%E6%9A%82%E5%AD%98.png)

> [!tip] 
>
> **注 3**：DBC和LDF对信号和报文属性的定义和AUTOSAR中定义报文属性是有点不同的，当使用AUTOSAR工具导入DBC/LDF文件时，会根据规则转换。

另外在Com模块中，还可以给每一条报文配置额外的发送模式，也就是说一条报文可以拥有两种发送规则，可改变的规则包括：

1. 报文传输特性；报文重复发送周期；
2. 报文重复发送次数；
3. 报文发送首次偏移时间；
4. 报文周期时间。

当上层程序发起信号的发送时，Com模块将信号装进PDU里并发送的过程如下图所示：

![发送信号流程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/30_8_46_0_%E6%9A%82%E5%AD%98.png)

1. 首先上层的SWC通过RTE调用对应的Signal/Signal Group接口（Com_SendSignal/Com_SendSignalGroup）
2. 请求信号发送，COM层内部置位对应信号或者信号组的Update Bits；
3. 信号的长度超过一个Byte时，需要进行字节序的转换（即：大端模式或者小端模式）；
4. 随后添加信号的发送属性以及选择报文的发送模式，最后会调用PduR的接口（PduR_ComTransmit/Com_TriggerTransmit）触发报文的发送；
5. 在整个发送过程中Com会对每一条报文的发送进行定时监控；还可以为每一个PDU配置一个"I-PDU Callout"，可以在PDU发送请求之前，在此Callout中实现一些特殊功能。

### 报文的接收

Com 在接收到报文后，将按照如下流程进行处理，如下图所示：

![接收信号流程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/30_8_57_9_%E6%9A%82%E5%AD%98.png)

1. 首先PduR模块通过Com_RxIndication通知Com接收到PDU后
2. Com模块会复位PDU对应的超时定时器Deadline Monitor Timer，如果如果配置了回调函数，则调用Com_cbkRxTout()，如有配置的I-PDU Callout，调用对应的用户接口；
3. 如果一个Signal或者Signal Group配置了Update Bits。
   1. 只有Update Bits置位（=1)时，此Signal或者Signal Group才会进一步的处理，处理包括：
      1. 过滤
      2. 通知
      3. 信号路由
      4. 字节序转换等
   2. 如果Signal的Update Bits未有置位，当上层再次读取该信号值时，可以使用该信号的上次历史值或者初始值；

### 路由信号

如果用户配置了信号路由，Com 在接收到源信号后，将自动将该信号的值，写入目的发送信号，完成信号路由操作。信号路由只是对信号值的路由，不影响信号的接收和发送方式，这主要包括：

1. 源信号需要通过正常的接收处理流程，如无效值、接收滤波等，才能进行路由；
2. 发送端信号值更新后，需要按照发送报文的发送方式进行发送。

信号的路由过程如下图所示：

![路由信号过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/30_9_12_33_%E6%9A%82%E5%AD%98.png)

其实过程也很简单，收到信号后，会立马把该信号的值更新到发送PDU中去发送出去。

### 滤波

Com模式提供的滤波方式包括：

| 滤波方式                      | 描述                                             |
| ----------------------------- | ------------------------------------------------ |
| ALWAYS                        | 全部通过                                         |
| NEVER                         | 屏蔽所有信号                                     |
| MASKED_NEW_EQUALS_X           | 满足下述条件通过，value&Mask = X                 |
| MASKED_NEW_DIFFERS_X          | 满足下述条件通过，value&Mask != X                |
| MASKED_NEW_DIFFERS_MASKED_OLD | 满足下述条件通过，newvalue&Mask != oldvalue&Mask |
| NEW_IS_WITHIN                 | 通过信号值在某个范围值内的信号                   |
| NEW_IS_OUTSIDE                | 通过信号值超出某个范围值内的信号                 |
| ONE_EVERY_N                   | 信号每 N 次滤波，通过一次                        |

### TP报文

需要使用传输协议进行传输的报文（通常是因为报文长度较大，单帧无法进行传输），需要配置为 TP 报文。对 COM 模块而言，TP 报文与非 TP 报文的区别主要包括：

1. 与 PDUR 交互的接口不同；
2. 由于 TP 报文需要多个周期才能发送成功，为保证数据一致性，TP 报文发送过程中，禁止更新发送信号，直至报文发送成功或超时；
3. 多帧报文在接收过程中，可能出现丢帧、超时或其他错误情况，在接收错误的情况下，COM 将丢弃未成功接收的报文，并且调用 Com_CbkInv 通知用户。

### 功能组

用户可以对不同的 PDU 进行分组，位于同一组内的 PDU，可以同步的进行启动或停止的操作。PDU 组的功能默认是开启的，默认的分组规则是，每个通道单独分组，每个通道分为发送和接收两个功能组。

位于功能组内的报文，在初始化后，处于关闭的状态。用户需要调用相关接口，启动该组后，组内的报文才可以正常的收发。不属于任何功能组的报文，在初始化后，处于开启的状态，可以正常进行收发。

同一报文可以属于多个功能组，称为关联组。开启一个功能组时，只开启属于本功能组的所有报文。关闭一个组时，如果该功能组有关联组，则会关闭本组及所有关联组内的所有报文。不同的功能组也可以组成一个新的功能组，这称为多级的功能组。

### 超时监测

超时属性是属于信号属性，需要通过配置工具进行配置。但实际上，信号是不能单独进行传输的，必须以报文为单位进行传输，因此，COM 的超时监测实际是以报文为单位进行的。同一条报文中，不同信号可以配置不同超时值。报文的超时值等于信号中最小的超时值，报文中各信号的实际超时值等于报文的超时值。

发送超时是指从启动报文发送到发送确认之间的时间。如果信号的传输特性中配置了重发机制（Repetition），那么在发送超时的时间内，必须将全部重发次数发完，否则 COM 会上报发送超时（在这里简单得解释一下Repetition机制，就是有的事件型报文触发之后可以配置它在短时间内发送多次，然后这里得超时时间则指的是在超时时间内必须将多次全部发送完成）。超时后，未完成的发送将被丢弃。COM 监测到发送超时事件后，会调用 Com_CbkTxTOut 通知用户。

接收超时是指在规定时间内没有接收到报文。接收超时有两种超时：1. 首次接收超时（ComFirstTimeout），仅在下列场景使用： 初始化后；报文所在的功能组重新启动； 报文所在的功能组的接收超时重新启动。2. 正常接收超时（ComTimeout），正常情况下的超时监测。首次超时时间一般设置的比较长，因为初始化时，总线上各控制器的初始化时间可能比较长。COM 监测到接收超时事件后，会调用 Com_CbkRxTOut 通知用户，并会根据配置，执行不同的动作：1. REPLACE：使用初始值替换当前的信号值；2. NONE：无特殊动作。

### 最小延迟时间

为防止总线的负载率过高，用户可以为发送的 Pdu 配置最小延迟时间。配置了最小延迟时间后，在该时间内，最多只能有 1 帧报文发送到总线上。如果在该时间内有多于 1 次发送请求，则后续的请求会被退后到最小延迟时间之后发送。该时间仅对相同 PduId 的发送报文起作用，不同 PduId 的报文之间无最小延迟时间的限制。

## Dcm

> [!tip]
>
> 标准文件请参见https://www.autosar.org/fileadmin/standards/R24-11/CP/AUTOSAR_CP_SWS_DiagnosticCommunicationManager.pdf

Dcm 模块为诊断服务提供标准的函数接口，在控制器产品开发、制造和售后服务期间，用户可以通过外部诊断工具访问 Dcm 模块实现对控制器进行刷新、故障诊断等操作。说白就是Dcm是AUTOSAR架构对UDS协议的具体实现，Dcm模块是PduR模块的上层模块，当PduR接收到下层传输模块的UDS PDU后，就会将其路由发送到Dcm模块，同理，PduR模块也会将Dcm模块下发的PDU路由到对应的传输层模块。

为实现 Dcm 功能，AUTOSAR 规范根据诊断服务执行的过程，将 Dcm 模块分为 3个子模块，分别是：

1. DSL(Diagnostic Session Layer)实现诊断数据的接收和发送、管理诊断时间参数、管理诊断会话状态和安全等级；
2. DSD(Diagnostic Service Dispatcher)检查诊断服务是否支持、管理从 DSP 子模块得到的诊断响应；
3. DSP(Diagnostic Service Processing)执行诊断服务处理。

![Dcm子功能](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/30_9_37_13_%E6%9A%82%E5%AD%98.png)



### DSL：诊断服务层



DSL(Diagnostic Service Layer)做了下面几件事：

1. 确定诊断数据请求和响应的数据流；
2. 监控和确保诊断请求和响应的时序
3. 管理诊断状态（特别是诊断会话和安全状态）

#### 请求处理

1. 当DcmDslProtocolRxPduId 开始接收新的诊断请求内容时，PduR模块通过调用Dcm_StartOfReception()指示DCM模块。它通知DCM模块要接收的数据大小，并提供第一帧或单个帧的数据，并允许DCM在数据大小超出其缓冲区大小或请求的服务不可用时拒绝接收。
2. 使用Dcm_CopyRxData函数将数据从提供的缓冲区复制到DCM缓冲区。
3. 如果诊断请求的接收完成(当Dcm_StartOfReception成功时)，PduR模块将调用Dcm_TpRxIndication()给DCM模块一个接收指示。
4. 当地址信息由Dcm_StartofReception()通过DcmRxPdu提供给DCM时，DCM应该能够使用通用连接。这个地址必须要存储并且用于响应和检测来自同tester的请求。
5. DSL子模块在调用Dcm_TpRxIndication函数后，如果返回Result = E_OK，才会将接收到的数据转发给DSD子模块。
6. 一旦收到请求消息(当Dcm_TpRxIndication函数返回E_OK之后，直到调用Dcm_TpTxConfirmation()来获取相关的TxDcmPduld)， DSL子模块将阻塞相应的DcmPduld。在处理此请求期间，不能接收相同DcmDslConnection的其他请求(例如，可以通过OBD会话结束增强会话)，直到发送相应的响应消息并再次释放dcmPduld(并发的testpresent请求除外)。

对于不同的诊断通信应用程序，允许有不同的dcmPduld。例如:

- OBD DcmRxPduld:用于接收OBD请求

  OBD DcmTxPduld:用于传输OBD响应;

- UDS phys DcmRxPduld:用于接收UDS物理地址请求;

  UDS功能DcmRxPduld:用于接收UDS功能寻址请求;

  UDS DcmTxPduld:用于传输UDS响应。

每个DcmRxPduld配置地址类型(物理/功能寻址)。每个DcmRxPduld的配置是可能的，因为对于功能和物理接收，总是有不同的DcmRxPduld值，独立于传输层的寻址格式(扩展寻址，正常寻址)。

> [!tip]
>
> 当ECU接收到会话保持请求（SID： 0x3E Sub： 0x80），不会发到DSP。

#### 响应处理

响应处理实际上接收DSP的数据，调用发送触发PduR的数据发送；

1. 当DcmDslMainConnection的诊断响应准备好时，DSL子模块通过PduR_DcmTransmit函数向PduR发送诊断响应，其中Pduld参数为DcmDsIProtocolTxPduRef。
2. 在周期性传输的情况下，Dcm应提供调用PduR_DcmTransmit()获取完整的有效负载数据（不使用Dcm_CopyTxData函数）
3. 在周期性传输的情况下，使用Dcm_TxConfirmation()调用Dcm进行周期性传输，从而获取传输结果
4. 响应与DcmTxPduld一起发送，它在DCM模块配置中链接到DcmRxPduld，即接收请求的ID(参见配置参数DcmDsIProtocolTx)。
5. 在PduR_DcmTransmit()中，仅给PduR模块提供长度信息和一般连接的寻址信息。在DCM模块成功调用PduR_DcmTransmit()后，PduR模块将调用Dcm_CopyTxData()要求DCM模块提供要传输的数据，并在完整的PDU成功传输或发生错误后调用Dcm_TpTxConfirmation()。
6. 如果DSL子模块在成功发送完整的DCM PDU后收到确认消息，或者调用Dcm_TpTxConfirmation()发生错误，则DSL子模块应将此确认消息转发给DSD子模块。如果传输失败(PduR_DcmTransmit()请求失败)或错误确认(Dcm_TpTxConfirmation()带有错误)时，DSD子模块不得重复诊断响应传输。

> [!note] 
>
> 注意:只有当PduR_DcmTransmit成功时才需要Dcm_TpTxConfirmation。如果DcmDsIProtocolTx的Multiplicity设置为“0”，Dcm将处理接收到的诊断请求而不发送响应。

在DSL中支持多种服务：

1. **支持周期性传输**：对应的服务ReadDataByPeriodicIdentifier (0x2A)，该服务用于向由一个或多个periodicDataIdentifiers标识的ECU请求定期传输数据记录值。

   > DCM模块应使用单独的协议和可配置大小的单独缓冲区发送周期性传输的响应。DcmDslPeriodicTransmissionConRef配置参数允许将用于接收周期性传输请求/发送周期性传输响应的协议链接到用于传输周期性传输消息的协议。注意，可以将多个DcmTxPdulds分配给周期性传输协议。根据通信方式的不同，DCM模块有以下几个限制:
   >
   > 1. 周期传输通信只能在完全通信模式下进行。
   > 2. 在未处于完全通信模式时可能发生周期性传输事件。因此存在以下要求:
   >    1. DCM模块丢弃全通信模式旁边的周期性传输事件，不将其排队传输。
   >    2. 周期传输事件不激活完全通信模式。

2. **支持ResponseOnEvent (ROE) 传输**：对应的UDS服务ResponseOnEvent (0x86), 通过该服务。测试人员可以请求ECU启动或停止传输由指定事件发起的响应。当注册一个事件进行传输时，测试者也指定相应的服务来响应(例如:UDS service ReadDataByIdentifier 0x22)。

3. **支持分段响应**：  在某些情况下，例如在例程执行的情况下，应用程序需要立即请求一个NRC 0x78(响应等待)，该请求应立即发送，而不是仅仅在到达响应时间之前(P2ServerMax分别为P2*ServerMax)。当Dcm模块调用一个操作并得到一个错误状态DCM_E_FORCE_RCRRP时，DSL子模块将触发NRC 0x78(响应等待)的负响应传输。这个响应需要从一个单独的缓冲区发送，以避免覆盖正在进行的请求处理。

   > DcmDslProtocolMaximumResponseSize 仅当 DcmPagedBufferEnabled 设置为 TRUE时才存在
   >
   > - 当DcmPagedBufferEnabled=TRUE时，如果生成的响应长度大于DcmDsIProtocolMaximumResponseSize，则Dcm响应NRC 0x14 (响应长度过长)。
   > - 当DcmPagedBufferEnabled == FALSE时，并且生成的响应大于Dcm_MsgContextType结构元素的resMaxDataLen，则Dcm响应NRC 0x14（）.
   >
   > 使用分页缓冲处理，ECU不会要求提供与最大响应长度一样大的缓冲区。注意:
   >
   > - 分页缓冲区处理仅用于发送-不支持接收。页缓冲区处理不适用于应用程序(仅在dcm内部使用)。
   > - Dcm应提供TP请求的正确数据量，如果请求的数据量不可用，则返回bufreqe_busy。
   >
   > 注意:如果请求的数据量不可用，Dcm应该立即填满分页缓冲区。

4. **支持由应用程序触发的 ResponsePending 响应**：当需要响应诊断请求时，DSL模块通过调用PduR_DcmTransimit()和Dcm_CopyTxData()将数据传递至PDUR模块，其中PduR_DcmTransimit()函数只是传递长度信息、地址信息，数据是通过Dcm_CopyTxData()函数传递至PDUR模块，当数据传输成功后，PDUR模块通过Dcm_TpTxConfirmation()函数告知DCM数据接收成功。PDUR会将数据诊断请求数据从上层的Buffer中Copy到诊断的接收Buffer中，DSD会从此Buffer中取出数据进行处理。

5. **支持等待响应**：上位机发送诊断请求后会要求ECU在一个最大响应时间（一般是50ms）内发出响应报文，但是对于一些请求的处理，ECU内部会耗时比较长（比如0x2E写NVM的请求），来不及在规定时间发出响应。这个时候ECU可以发送0x78（Pending）的否定响应吗来通知上位机ECU内部繁忙（Busy），需要上位机等待（Pending，一版Pending时间可以设置为1秒）。上位机收到0x78（Pending）的否定响应码后就会等待，直到ECU发出积极响应或者Pending时间超时。这个发送Bussy响应来保证诊断时序的功能由DSL模块实现。

   > 如果应用程序(或DSP子模块)能够执行请求的诊断任务，但需要额外的时间来完成任务并准备响应，则DSL子模块应在达到响应时间(DcmDspSessionP2ServerMax -DcmTimStrP2ServerAdjust)时发送NRC 0x78(响应等待)的负响应。DSL子模块应该从一个单独的缓冲区发送负面响应。这是为了避免覆盖正在进行的请求处理，
   >
   > 例如，应用程序已经在诊断缓冲区中准备了响应内容。对于一个诊断请求，带有NRC 0x78(响应挂起)的否定响应的数量受到配置参数的限制DcmDsIDiagRespMaxNumRespPend。这避免了应用程序中的死锁。
   >
   > 如果请求的诊断任务的否定响应数达到配置参数DcmDsIDiagRespMaxNumRespPend中定义的值，Dcm模块将停止处理活动诊断请求，并通过设置活动端口接口的OpStatus参数通知应用程序或BsW(如果此诊断任务意味着调用SW-C接口或BsW接口)。到DCM_CANCEL，并发送带有NRC 0x10(一般拒绝)的否定回复。

#### 安全管理

在安全管理模块中，有以下功能：

- 管理安全级别
- 处理Key和Seed

DSL提供Dcm_GetSecurityLevel()、DslInternal_SetSecurityLevel()两个函数分别用于获取当前的安全等级和设置安全等级。

对于配置层面而言，DSL菜单主要是配置诊断帧，包括物理寻址和功能寻址，单次通信的最大Buffer，以及时间参数，包括回复0x78的时间和为了防止诊断服务异常，允许0x78的最大次数等。



在 Dcm 初始化期间，安全级别设置为值 0x00 （DCM_SEC_LEV_LOCKED）， 在满足下列条件其中之一时，DSL会将安全级别重置为值 0x00：

- 从任意**非默认会话**切换到另一个**非默认会话**（包括当前已激活的会话）。
- 从任意**非默认会话**切换到**默认会话**（当使用UDS 的0x10服务或 S3 Server 超时执行）

> [!note]
>
> 一次只能激活一个安全级别

 每次安全级别更改时，Dcm 应更新 ModeDeclarationGroup 的DcmSecurityAccess

DcmDspSecurityResetAttemptCounterOnTimeout参数应该在仅当 DcmDspSecurityRow 的 DcmDspSecurityAttemptCounterEnabled 设置为 TRUE 时，才应存在。

#### 会话管理

会话（session）一般有三种：

1. 缺省会话（0x00, Default session）
2. 编程会话（0x01, Programming session）
3. 扩展会话（0x02Extended session）

DCM的会话管理有以下几个功能：

- 管理会话状态处理当前激活的Session以及设置新的Sesstion
- 管理权限状态分为权限模式和默认的模式
- 跟踪活动的非默认会话
- 允许修改时间。

DSL子模块保存当前活动会话的状态，为了访问这个变量，DSL子模块提供了以下接口:

- 获取当前活动会话:Dcm_GetSesCtrlType ()
- 设置会话:DslInternal_SetSesCtrlType()

初始化DCM时，会话状态设置为0x01(“DefaultSession”)。调用Dcm_ResetToDefaultSession()允许应用程序将当前会话重置为默认会话，并调用ModeDeclarationGroupPrototype DcmDiagnosticSessionControl的模式切换SchM_Switch__DcmDiagnosticSessionControl（RTE_MODE_DcmDiagnostic）SessionControl_DEFAULT_SESSION)。示例:超出速度限制时自动终止扩展诊断会话。

> [!note]
>
> 每种会话下可以进行的诊断服务不同，根据实际需求由OEM自己定义。一般来说诊断（UDS）刷写功能需要在编程会话下进行，涉及到NVM关键存储数据的写功能需要在扩展会话下进行。根据实际需求可以自己定义会话，比如定义0x60（EOL session）专门用于EOL工厂下线处理。

**会话保持将**在一个单独的DcmRxPduld (UDS功能DcmRxPduld)上接收，该DcmRxPduld与物理请求属于同一个DcmDslConnection。在这种情况下，使用了未显式配置的dcm内部接收缓冲区。由于这个原因，函数testpresent(并且只有没有响应的函数testpresent)以以下方式处理:

> [!tip]
>
> 当PduR模块调用Dcm_TpRxIndication并返回E_OK时，如果请求是“testpresent”命令，且“抑制正响应位”设置为TRUE ，则DSL子模块将重置会话超时定时器(S3Server)，并且不会将此请求转发给DSD。
>
> 由于绕过了DSL子模块中的功能“testpresent”，Dcm模块能够毫无延迟地接收和处理下一个物理请求。

#### 诊断协议处理

- 处理不同的诊断协议
- 处理设置诊断协议服务Table， 根据UDS或者OBD链接到不同的诊断协议
- 设置不同服务协议的优先级
- 支持优先级抢占机制
- 并行处理OBD和UDS协议， 可以忽略优先级和抢占机制

**管理资源**

给服务分配对应的Buffer，

1. 在Dcm模块中只允许使用和分配一个诊断缓冲区，这个缓冲区随后用于处理诊断请求和响应
2. NRC 0x78 (Response pending)响应的输出是通过一个单独的缓冲区完成的
3. 支持分页缓冲处理

#### 通信模式处理

DCM模块和ComM模块的交互由DSL子模块完成。ComM模块把每个通信通道（channel）的当前通信状态（No-com, Full-com, Silent-com）通知给Dcm模块。Dcm模块的诊断功能将会调用ComM模块的接口功能可能会阻止Ecu进入shutdown模式（ActiveDiagnostic ==’DCM_COMM_ACTIVE’时ECU必须保持唤醒状态，也就是不允许 进入shutdown/sleep）。

应用程序可以调用Xxx_SetActiveDiagnostic()接口通知Dcm模块ActiveDiagnostic的当前状态

- 处理通信要求（Full/Silent/No）:ComM会通知DCM当前的通道， DCM会进行模式的请求， 避免通信进入Sleep；在Silent和NO下， DCM禁止通信
  - No Communication：ComM模块调用 Dcm_ComM_NoComModeEntered接口通知Dcm模块通信关闭。Dcm模块收到通知后就会Disable所有的诊断接收/传输。
  - Silent Communication:ComM模块调用 Dcm_ComM_SilentComModeEntered接口通知Dcm模块通信静默。Dcm模块收到通知后就会Disable所有的诊断传输。
  - Full Communication:ComM模块调用 Dcm_ComM_FullComModeEntered接口通知Dcm模块通信静默。Dcm模块收到通知后就会Enable所有的诊断接收/传输。
- 指示活动/非活动诊断
- 启用/禁用所有类型的诊断传输

在DSL里面可以配置多路诊断通道，假设诊断ID有2个以上，通过DcmDslProtocolRows容器实现。

### DSD：诊断调度服务

DSD(Diagnostic Service Dispatche)子模块负责检查传入诊断请求的有效性(诊断会话/安全访问级别/应用程序权限的验证)，并跟踪服务请求执行的进度。

DSD和DSL的交互为：

| 描述      | 解释                         |
| --------- | ---------------------------- |
| 双向      | 诊断消息的交换 (接收/发送)   |
| DSD到DSL  | 获取最新的诊断会话和安全级别 |
| DSL 到DSD | 诊断报文传输确认             |

DSD和DSP的交互为：

| 描述      | 解释                       |
| --------- | -------------------------- |
| DSD 到DSP | 委托诊断处理 ·确认传输消息 |
| DSP 到DSD | 处理结束的信号             |

#### 检查

DSD模块会检查诊断服务标识和适配诊断消息：

- DSD接收来自DSL的数据， 根据具体的配置参数决定接收到的信号是否在DCM中进行处理
- 基于ID进行识别
- 可以选择诊断的ID Table
- 对于不支持的ID进行Negative 响应

1. 当DSL接收到新的诊断请求，DSL通过内部接口通知DSD。DSD调用Dcm_GetSesCtrlType()、Dcm_GetSecurityLevel()获取当前的Session和安全等级，DSD通过检查以上的参数会响应不同的数据：

   1. DSD模块会在当前Session的“Service Identifier Table”检查诊断请求SID是否在其中，如果不在table中，DSD会发送NRC **0x7F**。

      > 如果配置DcmRespondAllRequest=FALSE，那么当DCM模块收到包含0x40到0x7F或0xC0到0xFF范围内的服务ID的诊断请求，DCM将不响应这样的请求。因为此范围的SID在 ISO 14229-1（UDS）标准中定义是**响应 SID 范围**。
      >

   2. 如果诊断服务支持，但当前Session不支持该子服务，DSD会发送NRC **0x7E**。

   3. 然后检查当前安全等级是否满足条件，如果当前安全等级不支持该诊断请求，DSD会发送NRC **0x33**。

   4. 最后检查数据的长度。

2. 当DSP模块完成诊断请求处理后，DSD负责将整理响应数据发送至DSL。

   1. DSD模块将服务标识符(SID)(如果是负反馈，则为0x7F)和响应的数据流添加至“Dcm_MsgContextType”。
   2. 然后DSD将其传送至缓冲区，并在缓冲区的第一个字节添加SID。

> 举个例子：**写VIN号**
>
> 1. DSL子模块接收到一条新的诊断消息。诊断信息WriteDataByldentifier = 0x2E,0xF1,0x90,0x57,0x30,0x4C,0x30,0x30,0x30,0x30,0x34,0x33,0x4D,0x42,0x35,0x34,0x31,0x33,0x32,0x36
> 2. DSL子模块向DSD子模块指示具有“数据指示”功能的新诊断消息。在诊断消息缓冲区中存储诊断消息(buffer = 0x2E,0xF1,0x90，…)。
> 3. DSD子模块使用传入诊断消息上确定的服务标识符(缓冲区0x2E的第一个字节)对受支持的服务执行检查。
> 4. 传入的诊断消息存储在DCM变量中Dcm MsgContextType。
>
> DcmDsdSidTabServiceld中配置的服务标识符的Id在一个DcmDsdServiceTable中必须是唯一的。



#### 验证

DSD子模块只有在通过以下六项验证后才会接受服务:

1. 厂商权限验证(厂商接口inctnptn的调用）
2. SID的验证
3. 诊断会话的验证
4. 服务安全访问级别的验证
5. 供应商权限验证(调用供应商接口指示操作)
6. 验证服务id的Mode规则

> [!note]
>
> **当前**会话下服务不支持响应0x7F（注意区分0x11）,例如10 03下不支持2E一样，当前请求子服务不支持响应0x7E（注意区分0x12）,例如10 03下支持0x2E,但是不支持0x2E F1 89这样的F1 89子服务。一定要注意区分。校验安全等级，一般就是在某些服务下校验0x27是否能正常通过。

并且DSD还会检查格式与子服务：

- 服务权限（0x29服务可以改变权限）
- 诊断的Session（0x10服务实现不同的Session）
- Security Access Level（0x27）
- 服务的关联和依赖

#### 响应

响应主要有以下类型：

- Positive的响应
- Negative的响应
- 抑制响应

详细为：

1. **接收请求消息并发送积极响应消息**：服务端接收诊断请求消息。DSD子模块确保请求消息的有效性，将该请求转发到DSP子模块中相应的服务处理程序中。当服务处理函数完成所有数据处理动作后，触发DSD子模块发送响应消息。

   - 如果DSP作为请求指示函数的一部分，立即处理服务，则DSP可以触发该指示函数内部的传输(“同步”)。
   - 如果处理需要较长的时间(例如等待EEPROM驱动程序)，则数据处理器推迟一些处理(“异步”--使用pending)。响应挂起机制由DSL子模块涵盖。数据处理器显式地触发传输，但是是从数据处理器的上下文中触发的。一旦收到请求消息，相应的DcmPduld就会被DSL子模块阻塞。在处理此请求期间，不能接收其他相同协议类型的请求(例如，可以通过OBD会话结束增强会话)，直到发送相应的响应消息并再次释放DcmPduld。

2. **接收请求消息并抑制积极响应**：这是前一个用例的子用例。在UDS协议中，可以通过在请求消息中设置一个特殊的位来抑制正响应。这种特殊的抑制处理完全在DSD子模块中执行。

3. **接收请求消息并抑制负面响应**：在功能性寻址的情况下，DSD子模块应抑制NRC 0x11, 0x12, 0x31, 0x7E和0x7F的负响应.

4. **接收请求消息并发送否定响应消息**：拒绝请求消息和发送否定响应有许多不同的原因。如果诊断请求无效，或者在当前会话中可能不会执行请求，则DSD子模块将拒绝处理并返回否定响应。但是拒绝执行格式良好的请求消息甚至有很多原因，例如，如果ECU或系统状态不允许执行。在这种情况下，DSP子模块将触发一个否定响应，包括NRC提供该请求被拒绝的额外信息。

   如果请求由多个参数组成(例如，一个有多个标识符要读取的UDS Service ReadDataByldentifier (0x22)请求)，则每个参数被单独处理。每个参数都会返回一个错误。

   如果至少有一个参数被成功处理，这种请求将返回一个积极的响应。

5. **发送一个积极的响应消息，没有相应的请求**：UDS协议中有两种服务，对一个请求发送多个响应。通常，一个服务用于启用(和禁用)由事件或时间触发的另一个服务的传输，该服务再次由ECU发送，而不需要相应的请求.UDS Service readdatabyperiodicentifier (0x2A)。该服务允许客户端请求定期传输由一个或多个periodicDataldentifiers标识的服务器的数据记录值。类型1 = DcmTxPduld上的USDT消息已用于正常诊断响应(仅限单帧);类型2=单独的DcmTxPduld上的udt消息。对于类型1，传出消息必须与具有更高优先级的“正常传出消息”同步。ResponseOnEvent (Ox86)。此服务请求服务器启动或停止对指定事件的响应传输。方式1 = DcmTxPduld上的USDT消息已用于正常诊断响应;方式2 =在单独的DcmTxPduld上发送USDT消息。对于方式1，传出消息必须与具有更高优先级的“正常传出消息”同步。

   这种处理特别由DSL子模块控制。然而，DSD子模块还提供了在没有相应请求的情况下生成响应的可能性。

6. **分段反应**：在诊断协议中，一些服务允许交换大量的数据，例如UDS Service ReadDTCInformation (0x19)和UDS Service传输数据 （0x36）。在传统方法中，ECU内部缓冲区必须足够大，以保存要交换的最长数据消息(最坏情况)，并且在传输开始之前填满整个缓冲区。ECU中的RAM存储器通常是一个关键资源，特别是在较小的微处理器中。在一种更节省内存的方法中，缓冲区只被部分填充，部分传输，然后部分重新填充，以此类推。这种分页机制只需要显著减少的内存量，但需要定义良好的缓冲区重新填充反应时间。用户可以决定是使用“线性缓冲区”还是分页缓冲区进行诊断。

> [!note] 
>
> 可能出现的NRC为：
>
> - 0x11 (Service not supported)
> -  0x12(SubFunction not supported)
> -  0x31(Request out of range)
> - 0x7E (Subfunction not supported in active session)
> - 0x7F (Service not supported in active session)

响应过程为：

1. DSD子模块将诊断(响应)消息(正面或负面响应)转发给DSL子模块。
2. DSL子模块应通过执行DSL传输功能将诊断(响应)消息(正面或负面响应)进一步转发到PduR模块。
3. DSL子模块在转发数据时将收到PduR模块的确认。
4. DSL子模块将从PduR模块接收到的确认信息转发给DSD子模块。
5. DSD子模块应通过内部函数DspInternal_DcmConfirmation()将确认转发给DSP子模块。
   1. 如果不发送诊断(响应)消息(响应抑制)，则DSL子模块不发送任何响应。
   2. 在这种情况下，没有数据确认从DSL子模块发送到DSD子模块，但DSD子模块仍将调用内部函数DspInternal_DcmConfirmation （）。

### DSP：诊断服务处理

Diagnostic Service Processing：处理实际的诊断请求。当接收到来自DSD子模块的函数调用要求DSP子模块处理诊断服务请求时， DSP始终执行以下基本处理步骤：

- 分析收到的请求消息
  - 分析收到的 Service‑ID、子功能码以及报文长度、结构等信息。
  - 检查格式是否符合 UDS/OBD 规范，若不符合则产生负响应 NRC 0x13（“Message length or format incorrect”）
- 检查格式以及是否支持寻址的子功能
  - 判断当前诊断会话、权限、安全等级是否允许该服务；若不允许则返回 NRC 0x10（“General reject”）或其他对应的 NRC

- 在 DEM、 SW-C 或其他 BSW 模块上获取数据或执行所需的函数调用
  - 与 DEM（Diagnostic Event Manager）、其他 BSW 模块或应用层 SW‑C 交互，读取故障码、执行读/写 DID、进行编程、访问安全访问等功能。
  - 若使用分页缓冲区机制，DSP 必须先计算整体响应长度，再把数据分段交给 DSD/DSL 处理。

- 服务响应
  - 将响应 Service‑ID（原 Service‑ID + 0x40）以及相应的数据字段组织成完整的响应帧。
  - 对于负响应，按照 UDS 规范生成 0x7F 前缀 + 原 Service‑ID + NRC 码

> [!note]
>
> 在DSP和bootloader交互的时，如果满足所有先决条件并假设'suppressPosRspMsgIndicationBit标志设置为'false'，则已经确定了跳转到引导加载程序的4个不同用例:
>
> 1. 应用程序立即发送一个最终的积极响应，然后跳转到引导加载程序
> 2. 应用程序首先发送一个NRC 0x78响应，然后是最终的积极响应，然后跳转到引导加载程序
> 3. 应用程序立即跳转到引导加载程序，引导加载程序发送最终的积极响应
> 4. 应用程序首先发送一个NRC 0x78响应，然后跳转到引导加载程序，引导加载程序发送最终的积极响应
>
> 注意:如果'suppressPosRspMsgIndicationBit'标志被设置为'true'，用例'1'并且用例“3”不会发出积极响应。
>
> 
>
> 在接收服务诊断sessioncontrol时，如果提供的会话用于跳转到OEM引导加载程序(参数DcmDspSessionForBoot设置为DCM_OEM_BOOT或DCM_OEM_BOOT_RESPAPP)，Dcm应通过触发ModeDeclarationGroupPrototype DcmEcuReset的模式切换来准备跳转到OEM引导加载程序。
>
> 注意:通过这种模式切换，DCM通知BswM准备跳转到引导加载程序。
>
> 在DCM初始化时，DCM应该调用Dcm_GetProgConditions()来知道初始化是否是从引导加载程序/ ECUReset跳转的结果。注意:当调用Dcm_Init时，确保Dcm_ProgConditionsType中包含的数据有效是软件集成商的责任。例如，如果此数据存储在非易失性存储器中，则在ECU复位后可能需要一些时间才能使其可用。在设计ECU的启动过程时，必须考虑到这一点。

### 关联模块

1. RTE： 接收诊断相关的数据处理诊断相关的通信服务，Dcm模块在完成诊断功能的时候需要通过RTE接口来读写/函数调用其他SWC的数据/服务。
2. 如果Dcm模块无法直接处理诊断数据请求时，Dcm会把通过以下方式来转发请求并获得结果数据：
   - 通过SW-C的port-interface。
   - 通过直接调用BSW模块函数。
3. BswM：接收DCM的状态变化进行模式模式管理，如果Dcm的初始化是从引导加载程序跳转的结果，则Dcm通知BswM应用程序已被更新（UDS的0x11服务）。Dcm还向BswM表示通信模式的改变（UDS的0x28服务）。
4. SchM： 提供调度
5. PduR： 提供收发诊断数据的路由
6. ComM：处理诊断相关的通信请求，ComM模块提供了一些功能，如Dcm模块可以指示“活动”和“非活动”状态，以便进行诊断通信。Dcm模块提供了处理“Full-/ Silent-/ No-Communication”通信需求的功能。此外，如果ComM模块要求，Dcm模块提供启用和禁用诊断通信的功能。（UDS的0x28服务）
7. NvM： 存储诊断数据
8. DEM： 处理诊断事件，DEM模块提供检索与故障内存相关的所有信息的功能，以便Dcm模块能够通过从故障内存中读取数据来响应测试者的请求。通俗的讲就是Dcm能够读取Dem记录的DTC信息
9. EcuM： 诊断相关的唤醒以及模式切换
10. PDUR：PduR模块提供诊断数据的发送和接收功能。PduR模块接收和发送诊断数据。PduR为Dcm模块提供一个与具体通信协议无关的接口。

## Dem

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

### 术语介绍

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

### DTC状态

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
3.  **故障确认后**：故障的老化，替代，实现故障修复后，故障能被清除的功能。例如，仪表上的发动机故障灯，在发动机修好后一段时间后就会熄灭。

### Event

DTC只是展示给诊断仪使用者,Event才是DTC状态实际操控者，同时Event也是诊断NVM数据存储实际控制者。DTC是系统层面对于故障的描述，而Event是软件层面对故障监控的最小单元。

> 例子：某个电机故障会由电压过高造成，但软件是无法直接识别该故障,软件只能监控是否产生了电压过高的时间Event,从而计算出是否产生DTC.

多个event可以mapping 同一个DTC；而同一个event不能mapping 多个DTC；

DTC可以直接可见，但Event需通过进一步手段才能看到，有时仅对ECU供应商可见；

1. DTC代表某类event集中表现，而event则是某个DTC的具体实例；
2. event的优先级决定了DTC的优先级；
3. event之间的依赖关系决定了DTC的依赖关系；

EVENT上报方式为：周期调用Dem_SetEventStatus上报即为周期循环上报；当Event状态变化时，调用Dem_SetEventStatus上报为触发上报。

## Tp

> [!tip]
>
> 可参见http://main.weike-iot.com:2211/ebooks/can/%E8%BD%A6%E8%BD%BD%E8%AF%8A%E6%96%AD%E6%A0%87%E5%87%86ISO_15765-2_cn.pdf

### CanTp

 CanTp位于CanIf与PDUR之间，主要目的是对大于8字节的CAN I-PDU，大于64字节的CANFD I-PDU进行分段与重组。位置如下图。

![CANTp层位置](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/10/11_9_11_49_image-20251011091142154.png)

CAN接口(Canlf)提供了平等的机制来访问CAN总线通道，而不管它的位置(uC内部/外部)。从CAN控制器的位置(片上/板上)提取ECU硬件布局和CAN驱动程序的数量。由于CanTp只处理传输协议帧(即SF, FF, CF和FC pdu)，根据N-PDU ID, CAN接口必须将I-PDU转发给CanTp或PduR。根据AUTOSAR的基本软件架构，CanTp提供以下服务:

1. 传输方向的数据分割;
2. 接收方向的数据重组;
3. 数据流控制;
4. 检测分段会话中的错误
5. 传输取消
6. 接收取消

### 名词缩写

#### 前缀

| 前缀 | 描述                                                         |
| ---- | ------------------------------------------------------------ |
| I-   | 关联AUTOSAR COM交互层                                        |
| L-   | 关联Canlf，相当于逻辑链路层，上层是数据链路层下层为介质访问控制，介质 其实就是硬件抽象 |
| N-   | 关联CanTp，可以认为是网络层，个人理解N代表多个               |

| ISO Layer                          | Layer Prefix | AUTOSAR Modules            | PDUName | CAN/ TTCAN prefix                    | LIN prefix                           | FlexRay prefix                    |
| ---------------------------------- | ------------ | -------------------------- | ------- | ------------------------------------ | ------------------------------------ | --------------------------------- |
| Layer 6 Presentation (Interaction) | I            | COM,DCM                    | I-PDU   | N/A                                  | ==                                   | ==                                |
| :                                  | I            | PDU router,PDU multiplexer | I-PDU   | N/A                                  | ==                                   | ==                                |
| Layer 3 Network Layer              | N            | TP Layer                   | N-PDU   | CAN SF<br>CAN FF<br>CAN CF<br>CAN FC | LIN SF<br>LIN FF<br>LIN CF<br>LIN FC | FR SF <br>FR FF<br>FR CF<br>FR FC |
| Layer 2: Data LinkLayer            | L            | Driver,Interface           | L-PDU   | CAN                                  | LIN                                  | FR                                |

#### 协议数据缩写

关联CanTp的缩写词, PDU是“协议数据单元”的缩写。PDU包含SDU和PCI。在传输端，PDU从上层传递到下层，下层将这个PDU解释为它的SDU。    

| 缩写词                   | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| CAN L-SDU                | 属于CanIf模块，与N-PDU类似                                   |
| CAN LSduId               | CanIf内独一无二的ID，用于引用L-SDU的路由属性，因此为了通过API与CanIf交互，上层可以引用CAN L-SDU的结构体以此进行数据传递 |
| CAN N-PDU                | 这是CANTP的PDU。它包含唯一标识符、数据长度和数据(协议控制信息加上整个N-SDU或其中的一部分)。 |
| CAN N-SDU                | 这是CANTP的SDU。在AUTOSAR体系结构中,它是来自PDU路由器的一组数据。 |
| CAN N-SDU Info Structure | 这是一个CANTP内部常量结构，包含特定的CAN传输层信息，用于处理相关CAN N-SDU的发送、接收、分段和重组。 |
| I-PDU                    | 这是AUTOSAR COM模块的PDU                                     |
| PDU                      | 在分层系统中，它指的是在给定层的协议中指定的数据单元。它包含该层(SDU)的用户数据以及可能的协议控制信息。X层的PDU为其下层X-1层的SDU，即(X)-PDU =(x-1)-SDU)。 |
| PduInfo Type             | 该类型是指用于存储处理PDU(或SDU)收发基本信息的结构，即指向其在RAM中的有效载荷的指针及其长度(以字节为单位)。 |
| SDU                      | 在分层系统中，这是指由给定层的服务用户发送的一组数据，并将其传输给对等服务用户，同时保持语义不变。 |

> [!tip] 
>
> 对于PDU和SDU，PDU 是协议数据单元，表示在 **特定通信层** 中传输的数据单元，包含该层的协议控制信息和有效载荷。SDU 是服务数据单元，表示 **上一层传递给当前层的数据**，不包含当前层的协议信息。可以看作是$PDU = PCI + SDU$ （当前层的协议控制信息 + 上一层的数据单元）

### 帧类别

N-PDU的格式为



| 地址信息 | 协议控制信息 | 数据域 |
| -------- | ------------ | ------ |
| N_AI     | N_PCI        | N_Data |

1. 地址信息(N_AI):N_AI用于标识对等网络实体间的通信。N_AI信息在N_SDU-N_SA,N_TA,N_TAtype,N_AE中接收，应当复制包含在P_PDU中。如果接收到的NSDU中 < MessageData>及< Length>信息很长，需要网络层拆分这些数据以发送完整的信息，N_AI应当被复制并包含在每一个要发送的NPDU中。该域包含地址信息标识交互信息类型，数据交互的接收方和发送方。地址信息包含信息地址。
2. 协议控制信息(N_PCI):该域标识交互的N_PDUs的类型。它也用来交互在网络层对等实体通信的其它控制参数。
3. 数据域(N_Data):NPDU中的N_Data用于发送在< MessageData>参数中从服务使用者使用N_USData.request服务接收的数据。如果必要的话，会在网络发送之前拆分为更小的部分，以适应NPDU数据域。N_Data的大小依赖N_PDU的类型及地址格式的选取。

所有的N_PDU通过N_PCI来标识：

| N_PDU名      | N_PCI字节     | ==    | ==    | ==    |
| ------------ | ------------- | ----- | ----- | ----- |
| ：           | 字节1         | ==    | 字节2 | 字节3 |
| ：           | 7-4位         | 3-0位 | ：    | ：    |
| 单帧（SF）   | N_PCItype=0   | SF_DL | N/A   | N/A   |
| 首帧（FF)    | N_PCItype = 1 | FF_DL | ==    | N/A   |
| 连续帧（CF） | N_PCItype = 2 | SN    | N/A   | N/A   |
| 流控（FC）   | N_PCItype=3   | FS    | BS    | STmin |

其中N_PCItype参数的定义为

| 16进制值 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| 0        | 单帧 (SF)<br>对于未拆分的信息，网络层提供了一个优化的网络协议，即将信息长度值仅放置在PCI字节里。单帧（SF）应当能支持在单个CAN帧中的信息传输。 |
| 1        | 首帧(FF)<br> 首帧只支持一条信息无法在单个CAN帧中发送时使用。例如，拆分的信息。拆分信息的第一帧编码为FF，在接收到FF时，接受网络层实体应重组这些信息。 |
| 2        | 连续帧 (CF)<br>当发送拆分数据时，所有的连续帧跟着FF编码为连续帧（CF）。在接收到一个 连续帧，接受网络层实体应当重组接收到的数据字节直到整个信息被接收到。 接收实体在接收最后一帧信息并无接收错误之后，应传递这些信息到相邻的上 层。 |
| 3        | 流控帧(FC) <br>流控制的目的是调整CF N_PDUs发送的速率。流控协议数据单元的3种类型用 于支持这些功能。这些类型由协议控制信息的流状态（FS）域指示。 |
| 4-F      | 保留<br>该范围的值为该协议保留。                             |

#### SF

N_PDU的格式为:

| byte  | ==   | ==   | ==   | ==    | ==   | ==   | ==   |
| ----- | ---- | ---- | ---- | ----- | ---- | ---- | ---- |
| Byte1 | ==   | ==   | ==   | ==    | ==   | ==   | ==   |
| 7     | 6    | 5    | 4    | 3     | 2    | 1    | 0    |
| 0     | 0    | 0    | 0    | SF_DL | ==   | ==   | ==   |

SF_DL值的定义为

| 16进制值 | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 0        | 保留<br>该范围的值为该协议保留。                             |
| 1-6      | 单帧数据长度值（SF_DL） SF_DL应编码在N_PCI字节低位，并分配服务参数的值。 |
| 7        | 单帧数据长度（SF_DL）中标准地址 SF_DL=7时，只允许标准地址    |
| 8-F      | 无效的<br>该范围值无效                                       |

如果网络层接收到一个SFDL=0的单帧(SF),网络层应当忽略接收SF N_PDU。如果网络层接收到使用标准地址且一个S℉DL大于7的单帧，或大于6且使用扩展或混合地址时，网络层应当忽略该SF N PDU。

#### FF

N_PDU的格式为:

| byte  | ==   | ==   | ==   | ==    | ==   | ==   | ==   | ==    |
| ----- | ---- | ---- | ---- | ----- | ---- | ---- | ---- | ----- |
| Byte1 | ==   | ==   | ==   | ==    | ==   | ==   | ==   | Byte2 |
| 7     | 6    | 5    | 4    | 3     | 2    | 1    | 0    |       |
| 0     | 0    | 0    | 1    | FF_DL | ==   | ==   | ==   | ==    |

FF_DL值的定义为:

| 16进制数 | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 0-6      | 无效的<br>该范围值无效                                       |
| 7        | 首帧数据字节（FF_DL）支持扩展地址及混合地址 <br>FF_DL=7只允许扩展地址及混合地址 |
| 8 -FFF   | 首帧数据字节（FF_DL）<br> 拆分信息在12个位的长度（FF_DL）上编码，并NPCI字节2中最低位置位“0”， NPCI字节1中最高位置为“3”。拆分信息最大数据长度支持4095个用户数据。 该数据当被分配到服务参数< Length>中。 |

如果网络层接收到FF_DL大于接收方缓冲区的首帧时，应当被认为是错误情况。网络层应当放弃该信息的接收，并且发送包含参数FlowStatus=Overflow的FC N_PDU。如果网络层接收到FF_DL小于8并且使用标准地址，或小于7并且使用扩展地址或混合地址时，网络层应当忽略该首帧并且不必发送一个FC N_PDU。

#### CF

N_PDU的格式为:

| byte  | ==   | ==   | ==   | ==   | ==   | ==   | ==   |
| ----- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Byte1 | ==   | ==   | ==   | ==   | ==   | ==   | ==   |
| 7     | 6    | 5    | 4    | 3    | 2    | 1    | 0    |
| 0     | 0    | 1    | 0    | SN   | ==   | ==   | ==   |

SN参数的定义：

| 16进制值 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| 0-F      | 连续号（SN） 连续号应当在N_PCI字节1的低字位编码。SN设置值范围在0到15. |

CF N_PDU中参数SN用以说明连续帧的顺序。

- 对于所有拆分信息，SN开始于0。首帧应当分配值0，它不是明确地包含在NPCI域中，但应当按拆分信息顺序号为0。
- 紧随FF的第一个CF的SN应该被设置为1
- 在同一个拆分信息上，每一个新增的连续帧编号(SN)增1：
- 连续帧编号(SN)的值不受流控帧的影响。
- 当连续帧编号(SN)到达值15时，它在下一个连续帧中重置为0：

顺序编号为

| N_PDU    | FF   | CF   | CF   | CF   | CF   | CF   | CF   |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| SN (hex) | 0    | 1    | ·... | E    | F    | 0    | 1    |

如果接收到一个连续号错误的CF N_PDU信息，网络层则进行出错处理。信息的接收被终止，并且网络层发送一个<N_Result>参数=N_WRONG_SN的N_USData.indication指示服务至相邻上层。

#### FC

N_PDU的格式为:

| byte  | ==   | ==   | ==   | ==   | ==   | ==   | ==   | ==    | ==    |
| ----- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- | ----- |
| Byte1 | ==   | ==   | ==   | ==   | ==   | ==   | ==   | Byte2 | Byte3 |
| 7     | 6    | 5    | 4    | 3    | 2    | 1    | 0    |       |       |
| 0     | 0    | 1    | 1    | FS   | ==   | ==   | ==   | BS    | STmin |

**FS参数定义**：流状态参数(FS)指示发送网络实体是否继续信息的发送，发送网络层实体应当支持所有FS参数规定（不是保留的）的值。

| 16进制值 | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 0        | 继续发送（CTS） <br>流控帧继续发送参数，通过编码N_PCI第1字节为“0”，表示继续发送。它会促使发送方重新发送连续帧，该值意味着接收者准备好接收最大BS个连续帧。 |
| 1        | 等待（WT） <br>流控帧等待参数通过编码N_PCI第1字节为“1”。它会促使发送方继续等待新的流控帧(NPDU)的到来，并重新设置N_BS定时器。 |
| 2        | 溢出（OVFLW） <br>流控帧溢出参数通过编码NPCI第1字节为“2”。它会促使发送方中止拆分信息的发送并且做传递参数=N_BUFFER_OVFLW的N_USData.confirm指 示服务。该NPCI流控参数值仅能在跟在首帧NPDU的流控帧中使用，并且仅能在首帧中FF_DL信息的长度超过了接收实体缓冲区大小时使用。 |
| 3-F      | 保留 <br>该范围的值为该协议保留                              |

如果接收到的FC N_PDU信息参数出错，网络层进行出错处理。信息的发送被中止，并且网络层传递一个参数< N_Result>=N_INVALID_FS的N_USData.confirm指示服务至相邻的上层。

**BS参数定义：** 

| 16进制值 | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 00       | 块大小（BS） <br>BS参数为0用于指示发送者在拆分数据的发送期间,流控制帧不再发送流控制帧了。发送网络层实体应当不停的发送剩下的连续帧以便接收网络层实体另外的流控帧，也就是说可以一直发送连续帧。 |
| 01-FF    | 块大小（BS） 该范围的BS参数值用于指示发送方在没有接收网络实体的流控帧期间能发送 的最大数目的连续帧。 |

**STmin参数定义**：间隔时间(STmin)参数应当编码在FC N_PCI字节3。该时间在拆分数据发送过程中，由接收实体指定，并且由发送网络实体遵守。==STmin参数值指定了连续帧协议数据单元发送的最小时间间隔==。

| 16进制值 | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 00-7F    | 间隔时间（STmin）范围：0ms-127ms <br>该STmin单元的范围00－7F为绝对单位毫秒（ms） |
| 80-F0    | 保留 <br>该范围值为该协议保留                                |
| F1-F9    | 间隔时间（STmin）范围100us－900us <br>该STmin单元的范围F1-F9最小分编为100微秒（us），参数值F1代表100us， 参数值F9代表900us。 |
| FA-FF    | 保留 <br>该范围值为该协议保留                                |

STmin的度量是在一个连续帧发送完开始到请求下一个连续帧时的间隔时长。例如, 如果STmin=10(十进制)，则连续帧网络协议数据单元最小时间间隔=10ms。

在拆分数据发送期间，如果FC N_PDU信息接收到ST参数值为保留值，发送网络实体则使用最长的ST值，即(7F-127ms),而不使用从接收网络实体接收到的值。

**FC.Wait帧传递的最大值(N_WFTmax)**:该变量用于避免在通信发送方出现潜在错误挂起的时候，后者可能会持续等待。该参数用于对等通信并不被传递，因此不包含在FC的协议数据单元里。

- N_WFTmax参数应当指示一组能有多少个FC N_PDU WT能被接收者接收。
- N_WFTmax参数的上限由用户根据系统时钟定义。
- N_WFTmax参数仅由接收网络实体在接收信息的时候使用。
- 如果N_WFTmax参数值设置为0,流控应当继续仅使用FC N_PDU CTS。流控等待(FC N_PDU WT)不应再该网络实体中使用。

### 数据传输

**单帧传输**

```mermaid
sequenceDiagram
    participant Sender
    participant Receiver
    
    Note over Sender,Receiver: SingleFrame (SF) 传输流程
    Sender->>Receiver: SingleFrame (SF)
```

**多帧传输**

```mermaid
sequenceDiagram
    participant Sender
    participant Receiver
    
    Note over Sender,Receiver: 多帧传输流程（ISO-TP/AUTOSAR TP协议）
    
    Sender->>Receiver: FirstFrame (FF)
    Receiver-->>Sender: FlowControl frame (FC)
    
    Sender->>Receiver: ConsecutiveFrame (CF)
    Sender->>Receiver: ConsecutiveFrame (CF)
    Sender->>Receiver: ConsecutiveFrame (CF)
    
    Receiver-->>Sender: FlowControl frame (FC)
    
    Sender->>Receiver: ConsecutiveFrame (CF)
    Sender->>Receiver: ConsecutiveFrame (CF)
    
```

> [!tip]
>
> 多帧传输过程为：
>
> 首帧-->流控(其中需要传入bs参数)-->连续帧发送bs大小-->流控（传入接下来的bs大小）-->连续帧...以此类推
>
> 当bs为0的时候表示中间不需要流控，可以一直发送。 

### 时间参数

不同的层级有不同的时间参数管理：

1. 传输层

   | 参数  | 含义                                                         |
   | ----- | ------------------------------------------------------------ |
   | BS    | BlockSizeECU发送流控帧后，Tester被允许发送 连续帧最大帧数据，为0可以一直发。 |
   | STmin | ECU发送流控帧后，连续帧之间的最大时间间隔                    |

2. 网络层

   | 定时 参数            | 描述                                                         | 数据链路服务                                                 | ==                     | 超时（ms） | 运行需求 (ms)           |
   | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------- | ---------- | ----------------------- |
   | ：                   | ：                                                           | Start                                                        | End                    | ：         | ：                      |
   | N_As                 | 发送方从请求发送到发送完成的时间间隔，超过这个时间发送中断<br />举例上位机发03 22 F1 84接收方CAN 帧发送时间（任何 N_PDU)<br />ECU响应10 01 62 F1 84 这段时间直至下一 个流控帧接收的时间 | L_Data.request                                               | L_Data.confirm         | 70         | N/A                     |
   | N_Ar                 | 传输流控帧到发送方的时间                                     | L_Data.request                                               | L_Data.confirm         | 70         | N/A                     |
   | N_Bs                 | 首帧发送成功的时间节点到流控帧接收成功的时间节点，也就是说从数据确认发送到收到流控帧的最大时间间隔 | L_Data.confirm(FF) <br>L_Data. confirm (FC)<br>L_Data.indicate(FC) | L_Data.indicate(FC)    | 150        | N/A                     |
   | N_Br                 | 接收到首帧到发送流控帧的时间                                 | L_Data.indicate(FF) L_Data.confirm(FC)                       | L_Data.request (FC)    | 50         | (N_Br+ N_Ar)<(0.9*N_Bs) |
   | N_Cs                 | 接收到流控帧到发送连续帧的最大时间间隔，此处注意不是STmin的含义 | L_Data.confirm(FC) L_Data.indication(CF)                     | L_Data.request (CF)    | 50         | (N_Cs+ N_As)<(0.9*N_Cr) |
   | N_Cr                 | 接受方成功发送流控帧到接收到连续帧的时间                     | L_Data.confirm(FC) L_Data.indication(CF)                     | L_Data.indication (CF) | 150        | --                      |
   | S:发送者<br>R:接收者 | ==                                                           | ==                                                           | ==                     | ==         | ==                      |

3. 会话层

   | 参数      | 含义                                                |
   | --------- | --------------------------------------------------- |
   | S3_Tester | 发送方维持非默认会话的最大时间                      |
   | S3_Sever  | 接收方未接受到任何诊断报文维持在非默认会话下 的时间 |

4. 应用层

   | 参数         | 含义                                                         |
   | ------------ | ------------------------------------------------------------ |
   | P2_Client    | 发送方发送完请求消息后等待服务器响应超时的时 间              |
   | P2*_Client   | 发送方收到否定响应码为0x78的否定响应后等待接 受方发送响应的增强型超时时间设置。 |
   | P2_Sever     | 接收方收到请求后发出响应的实际时间                           |
   | P2*_Sever    | 接收方发送0x78否定响应到发出否定响应的实际时 间。 (此处很少用) |
   | P3_ClientPyh | 发送方在收到物理寻址（phy）的肯定响应下允许发 送下一条物理寻址请求的最小时间间隔 |
   | P3_ClientFun | 发送方在收到物理寻址（phy）的肯定响应下允许发 送下一条功能寻址（fun）的最小时间间隔 |

#### 单帧传输

![单帧网络层处理](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/10/11_16_21_29_image-20251011162129122.png)



1. 发送方N_USData.req：会话层向传输网络层发出未分段的消息

   发送方L_Data.req：传输网络层将单帧传输到数据链路层并启动N_As计时器。

2. 接收器L_Data.ind：数据链路层向传输网络层发出CAN帧的接收。

   接收方N_USData.ind：传输网络层向会话层下发未分段的完成信息。

   发送方 L_Data.con：数据链路层向传输网络层确认 CAN 帧已被发送已确认。发送方停止 N_As 计时器。

   发送方N_USData.con：传输网络层向会话层发出未分段的完成信息

#### 多帧传输


![image-20251011164311866](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/10/11_16_43_12_image-20251011164311866.png)

1. 发送方N_USData.req：会话层向传输网络层发出分段消息。

   发送方L_Data.req：传输网络层将首帧传输到数据链路层并启动N_As定时器。

2. 接收方L_Data.ind：数据链路层向传输网络层发出CAN帧的接收。接收器启动 N_Br 定时器。

   接收方N_USDataFF.ind：传输网络层向会话层发出接收第一个帧的消息分段消息。

   发送方L_Data.con：数据链路层向传输网络层确认 CAN 帧已被发送，发送方停止N_As 定时器并启动N_Bs 定时器。

3. 接收方L_Data.req：传输网络层传输流控（ContinueToSend和BlockSize，值为2d)到数据链路层并启动N_Ar定时器。

4. 发送方 L_Data.ind：数据链路层向传输/网络层发出CAN 帧的接收。发送方停止 N_Bs 计时器并启动 N_Cs 计时器。
   接收方 L_Data.con：数据链路层向传输/网络层确认CAN帧已确认。接收器停止 N_Ar 定时器并启动 N_Cr 定时器。

5. 发送方 L_Data.req：传输/网络层将第一个 ConsecutiveFrame 传输到数据链路层并启动 N_As 定时器。

6. 接收方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。接收器重新启动 N_Cr 定时器。
   发送方 L_Data.con：数据链路层向传输/网络层确认 CAN 帧已被确认。发送方停止 N_As 定时器，并根据前一个 FlowControl 的分离时间值 （STmin） 启动 N_Cs 定时器。

7. 发送方 L_Data.req：当 N_Cs 定时器经过时（STmin），传输/网络层将下一个 ConsecutiveFrame 传输到数据链路层，并启动 N_As 定时器。

8. 接收方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。接收器停止 N_Cr 定时器并启动 N_Br 定时器。
   发送方 L_Data.con：数据链路层向传输/网络层确认 CAN 帧已被确认。发送方停止 N_As 计时器并启动 N_Bs 计时器。发送方正在等待下一个 FlowControl。

9. 接收方 L_Data.req：传输/网络层将 FlowControl（等待）传输到数据链路层并启动 N_Ar 定时器。

10. 发送方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。发送方重新启动 N_Bs 计时器。
    接收方 L_Data.con：数据链路层向传输/网络层确认 CAN 帧已确认。接收器停止 N_Ar 定时器并启动 N_Br 定时器。

11. 接收方 L_Data.req：传输/网络层将 FlowControl （ContinueToSend） 传输到数据链路层并启动 N_Ar 计时器。

12. 发送方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。发送方停止 N_Bs 计时器并启动 N_Cs 计时器。
    接收方 L_Data.con：数据链路层向传输/网络层确认 CAN 帧已确认。接收器停止 N_Ar 定时器并启动 N_Cr 定时器。

13. 发送方 L_Data.req：传输/网络层将 ConsecutiveFrame 传输到数据链路层，启动 N_As 定时器。

14. 接收方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。接收器重新启动 N_Cr 定时器。
    发送方 L_Data.con：数据链路层向传输/网络层确认 CAN 帧已被确认。发送方停止 N_As 定时器，并根据前一个 FlowControl 的分离时间值 （STmin） 启动 N_Cs 定时器。

15. 发送方 L_Data.req：当 N_Cs 定时器（STmin）过去时，传输/网络层将最后一个 ConsecutiveFrame 传输到数据链路层，并启动 N_As 定时器。

16. 接收方 L_Data.ind：数据链路层向传输/网络层发出 CAN 帧的接收。接收器停止 N_Cr 计时器。
    接收方 N_USData.ind：传输/网络层向会话层发出分段消息的完成。

更清晰的时间参数图为：

![时间参数图](https://img.rxi.cc/imgs/2024/07/26/3df93506f3fc7970.png)

#### 超时处理

| 超时 | 触发                                                         | 动作                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| N_As | 发送方没有及时发送N_PDU                                      | 放弃信息的接收并传递< N_Result>= N_TIMEOUT_A的N_USData.confirm指示 |
| N_Ar | 接收方没有及时发送N_PDU                                      | 放弃信息的接收并传递< N_Result>= N_TIMEOUT_A 的N_USData.confirm指示 |
| N_Bs | 发送方没有接收到流控帧（丢失， 覆盖）或在首帧前收到，或连续 帧没有被接收方接收到。 | 放弃信息的发送并传递< N_Result>= N_TIMEOUT_Bs的N_USData.confirm指示 |
| N_Cr | 接收方没有收到连续帧或之前流 控帧未被发送方收到。            | 放弃信息的接收并传递< N_Result>= N_TIMEOUT_Cr的N_USData.confirm指示 |

### 地址映射

网络层数据交互有三种地址格式的支持：

1. 标准
2. 扩展
3. 混合

不同的地址格式需要不同数据长度的CAN帧对包含数据的地址信息进行打包。因此，选择单个CAN帧的数据长度依赖于地址格式类型的选取。

> [!note]
>
> 注意：这里的地址和数据格式中的Can ID不同，标准地址并不是标准帧中的CAN id

#### 标准地址



标准地址的组成格式如下：

| N_PDU类型    | CAN标识 | CAN帧数据域 | ==     | ==     | ==    | ==    | ==    | ==    | ==    |
| ------------ | ------- | ----------- | ------ | ------ | ----- | ----- | ----- | ----- | ----- |
|              |         | 字节1       | 字节2  | 字节3  | 字节4 | 字节5 | 字节6 | 字节7 | 字节8 |
| 单帧（SF)    | N_AI    | N_PCI       | N_Data | ==     | ==    | ==    | ==    | ==    | ==    |
| 首帧（FF)    | N_AI    | N_PCI       | ==     | N_Data | ==    | ==    | ==    | ==    | ==    |
| 连续帧（CF） | N_AI    | N_PCI       | N_Data | ==     | ==    | ==    | ==    | ==    | ==    |
| 流控帧（FC)  | N_AI    | N_PCI       | ==     | ==     | ==    | N/A   | ==    | ==    | ==    |

在标准地址中，不同的N_SA、N_TA、N_TAtype的每个组合，都会分配一个唯一的Can标识符，即一个CAN id就已经定义了这些参数，所以可以将N_AI等价为Can ID。

> [!tip]
>
> 注意：以上表格是功能和物理寻址，但是实际上，功能寻址只有单帧数据格式，没有其他的数据格式。

标准混合地址是标准地址的子格式，也就是映射到CAN标识的地址信息更多一层定义。对于标准混合通信只允许有29bit的CAN标识。

标准混合地址物理寻址的数据格式为：

| N_PDU类型    | 29bitCAN标识，位地址 | ==   | ==   | ==       | ==     | ==    | CAN数据域位地址 | ==     | ==     | ==   | ==   | ==   | ==   | ==   |
| ------------ | -------------------- | ---- | ---- | -------- | ------ | ----- | --------------- | ------ | ------ | ---- | ---- | ---- | ---- | ---- |
|              | 28...26              | 25   | 24   | 23..·16  | 15...8 | 7...0 | 1               | 2      | 3      | 4    | 5    | 6    | 7    | 8    |
| 单帧(SF)     | 110 (bin)            | 0    | 0    | 218(dec) | N_TA   | N_SA  | N_PCI           | N_Data | ==     | ==   | ==   | ==   | ==   | ==   |
| 首帧(FF)     | 110 (bin)            | 0    | 0    | 218(dec) | N_TA   | N_SA  | N_PCI           | ==     | N_Data | ==   | ==   | ==   | ==   | ==   |
| 连续帧(CF)   | 110 (bin)            | 0    | 0    | 218(dec) | N_TA   | N_SA  | N_PCI           | N_Data | ==     | ==   | ==   | ==   | ==   | ==   |
| 流控帧（FC） | 110 (bin)            | 0    | 0    | 218(dec) | N_TA   | N_SA  | N_PCI           | ==     | ==     | N/A  | ==   | ==   | ==   | ==   |

> [!tip]
>
> 注意：功能寻址仅有单帧数据格式，且23...16位域位219（dec）

#### 拓展地址

对于N_SA,N_TA,N_TAtype,,一个特定的CAN标识符被分配。N_TA安置在CAN帧数据域第一个字节，N_PCI和N_Data安置在CAN帧数据域剩下的字节。

| N_PDU类型    | CAN标识     | CAN帧数据域 | ==    | ==     | ==     | ==    | ==    | ==    | ==    |
| ------------ | ----------- | ----------- | ----- | ------ | ------ | ----- | ----- | ----- | ----- |
|              |             | 字节1       | 字节2 | 字节3  | 字节4  | 字节5 | 字节6 | 字节7 | 字节8 |
| 单帧（SF)    | N_AI,无N_TA | N_TA        | N_PCI | N_Data | ==     | ==    | ==    | ==    | ==    |
| 首帧（FF)    | N_AI,无N_TA | N_TA        | N_PCI | ==     | N_Data | ==    | ==    | ==    | ==    |
| 连续帧（CF)  | N_AI,无N_TA | N_TA        | N_PCI | N_Data | ==     | ==    | ==    | ==    | ==    |
| 流控帧（FC） | N_AI,无N_TA | N_TA        | N_PCI | ==     | ==     | N/A   | ==    | ==    | ==    |

#### 混合地址

混合地址是将Mtype设置为远程诊断的地址格式。混合地址物理寻址的数据格式为：

| N_PDU类型    | 29bitCAN标识，位地址 | ==   | ==   | ==       | ==     | ==     | CAN数据域位地址 | ==    | ==     | ==     | ==   | ==   | ==   | ==   |
| ------------ | -------------------- | ---- | ---- | -------- | ------ | ------ | --------------- | ----- | ------ | ------ | ---- | ---- | ---- | ---- |
|              | 28...26              | 25   | 24   | 23...16  | 15...8 | 7...01 | 1               | 2     | 3      | 4      | 5    | 6    | 7    | 8    |
| 单帧(SF)     | 110 (bin)            | 0    | 0    | 206(dec) | N_TA   | N_SA   | N_AE            | N_PCI | N_Data | ==     | ==   | ==   | ==   | ==   |
| 首帧(FF)     | 110 (bin)            | 0    | 0    | 206(dec) | N_TA   | N_SA   | N_AE            | N_PCI | ==     | N_Data | ==   | ==   | ==   | ==   |
| 连续帧(CF)   | 110 (bin)            | 0    | 0    | 206(dec) | N_TA   | N_SA   | N_AE            | N_PCI | N_Data | ==     | ==   | ==   | ==   | ==   |
| 流控帧（FC） | 110(bin)             | 0    | 0    | 206(dec) | N_TA   | N_SA   | N_AE            | N_PCI | ==     | ==     | N/A  | ==   | ==   | ==   |

> [!tip]
>
> 注意：功能寻址仅有单帧数据格式，且23...16位域位205（dec）



## CanTsyn

### 时间同步的引入

时间同步有啥用呢？就拿现在爆火的ADAS来说，域控制器需要融合雷达，摄像头等传感器的数据，然后进行算法融合所有传感器的数据后最终才能进行判断和执行，这个时候就存在一个问题，因为传感器数据并不都是来源于同一个ECU，所以就需要一个手段来保证域控融合的所有传感器数据都是产自同一时刻，所以传感器在向域控制器发送传感数据时都需要加上一个时间戳，所以让车上所有的ECU里面的时间戳都保证一模一样就成了必要的事情。

而CanTsyn模块就是基于CAN总线的时间同步方案，所以它的功能也是非常的简单，就是接收一些时间同步报文，然后根据报文中包含的时间信息获取当前时间。

这里多说一句，还有在Ethernet总线上的负责时间同步的模块叫做EthTSyn模块，这个模块其实就是基于PTP (Precision Time Protocol)协议搞出来的，有的朋友可能还知道gPTP，gPTP其实是PTP协议的一个子集，而EthTSyn模块则是针对汽车应用基于PTP还额外做出一点点改变，感兴趣的朋友可自行搜索一下。

### 时间同步的角色

时间同步框架如下图所示：

![时间同步的角色](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_17_55_%E6%9A%82%E5%AD%98.png)

1. Time Domain：表示哪些组件（例如节点，通信系统）链接到某个时基。一个时域可以没有、包含一个或多个子时域。如果时域的时序层次结构中不包含时间网关，即所有节点都连接到同一总线系统，则不存在子时域。
2. Time Subdomain：表示哪些组件（例如节点)链接到某个时基，范围仅限于一条通信总线。
3. Global Time Master： 在整个Time Domain中提供全局时钟基准的主时钟。
4. Time Master：在同一个Time Subdomain中提供全局时间基准的主时钟。
5. Time Gateway：在整个Time Domain中既作为上级时钟源的从时钟，又同时作为下级时钟源的主时钟源。
6. Time Slave：在一个Time Subdomain中作为需要同步的从时钟。

###  时间同步过程

基于CAN总线的时间同步过程从下至上可分为CANDrv、CanIf、CanTsyn、StbM四个模块，如下：

![时间同步过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_21_22_%E6%9A%82%E5%AD%98.png)

其中CanTsync模块负责时间同步实现，而StbM则负责抽象基于不同传输介质的AUTOSAR时间同步协议，为整个软件系统来提供时间同步之后的全局时间戳。其他总线原理和过程一样，下面就以CanTsync模块为例说明一下时间同步过程。

#### 四种报文

在时间同步过程中主要有SYNC、FUP、OFS、OFNS 这四种报文，每一种报文又分为需要校验 CRC 和不需要校验 CRC 两种方式，有无CRC校验由参数CanTSynGlobalTimeTxCrcSecured决定。

在时间同步过程中，SYNC和FUP报文为一组，需要成对发送和接收，其格式如下：

| 报文类型    | (Type)Byte0 | Byte1               | Byte2                                                    | Byte3                                                        | Byte4~Byte7                                |
| ----------- | ----------- | ------------------- | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| SYNC no CRC | 0x10        | User Data, 默认为 0 | bit7 ~ bit4:Time Domain <br>bit3 ~ bit0:Sequence Count   | User Data, 默认为 0                                          | SyncTimeSec：48 位秒的低 32 位的部分时间   |
| SYNC CRC    | 0x20        | CRC                 | Time Domain(bit7 ~ bit4) <br>Sequence Count(bit3 ~ bit0) | User Data, 默认为 0                                          | SyncTimeSec：48 位秒的低 32 位的部分时间   |
| FUP no CRC  | 0x18        | User Data,默认为 0  | Time Domain(bit7 ~ bit4) <br>Sequence Count(bit3 ~ bit0) | bit7 ~ bit3:保留位，默认为0;<br>bit2:SGW, 时间网关同步状态, 当 SGW 值为 0 时，本地时间与 GTM 同步；当 SGW 值为 1 时，本地时间与 GTM 下的 TG 同步。<br>bit1 ~ bit0:OVS,SyncTimeNSec 溢出的部分 | SyncTimeNSec：以纳秒为单位的 32 位的时间戳 |
| FUP CRC     | 0x28        | CRC                 | Time Domain(bit7 ~ bit4) <br>Sequence Count(bit3 ~ bit0) | bit7 ~ bit3:保留位，默认为0; <br>bit2:SGW, 时间网关同步状态, 当 SGW 值为 0 时，本地时间与 GTM 同步；当 SGW 值为 1 时，本地时间与 GTM 下的 TG 同步。<br>bit1 ~ bit0:OVS,SyncTimeNSec 溢出的部分 | SyncTimeNSec：以纳秒为单位的 32 位的时间戳 |

在时间同步过程中，OFS和OFNS 报文为一组，需要成对发送和接收，其格式如下：

| 报文类型    | (Type)Byte0 | Byte1               | Byte2                                                | Byte3                                                    | Byte4~Byte7                                             |
| ----------- | ----------- | ------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| OFS no CRC  | 0x30        | User Data, 默认为 0 | bit7 ~ bit4:Time Domain bit3 ~ bit0:Sequence Count   | OfsTimeSecLsbHi：从 secondsHi 开始的 8 位偏移时间戳(LSB) | OfsTimeSecLsbLo：来自 secondsLo 的 32 位偏移时间戳(LSB) |
| OFS CRC     | 0x40        | CRC                 | Time Domain(bit7 ~ bit4) Sequence Count(bit3 ~ bit0) | OfsTimeSecLsbHi：从 secondsHi 开始的 8 位偏移时间戳(LSB) | OfsTimeSecLsbLo：来自 secondsLo 的 32 位偏移时间戳(LSB) |
| OFNS no CRC | 0x38        | User Data,默认为 0  | Time Domain(bit7 ~ bit4) Sequence Count(bit3 ~ bit0) | OfsTimeSecMsb ：从 secondsHi 开始的 8 位偏移时间戳(MSB)  | OfsTimeNSec ：以纳秒为单位的 32 位的时间戳              |
| OFNS CRC    | 0x48        | CRC                 | Time Domain(bit7 ~ bit4) Sequence Count(bit3 ~ bit0) | OfsTimeSecMsb ：从 secondsHi 开始的 8 位偏移时间戳(MSB)  | OfsTimeNSec ：以纳秒为单位的 32 位的时间戳              |

**注**：当参数CanTSynUseExtendedMsgFormat为TRUE时，OFS和OFNS的报文格式就会发生改变，这里就不多做介绍了，感兴趣的朋友可参考AUTOSAR官方文档。

#### 时间同步过程

CanTsyn模块的时间同步过程如下图所示：

![can的时间同步过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_29_27_%E6%9A%82%E5%AD%98.png)

1. TM节点在t0r时刻调用接口发送SYNC信号，SYNC信号中包含当前时间戳为s(t0r)，在t1r时刻SYNC信号发送完成，此时的时间为t1r，所以从TM开始发送报文，到发送成功需要时间t4r = t1r - t0r; 此时TM节点再次发送FUP信号，信号中包含的时间信息为t4r = t1r - t0r。
2. TS节点在t2r时刻接收到了SYNC报文；在t3r时间接收到了FUP报文。
3. 根据以上信息，TS节点在接收完SYNC和FUP报文的时候，即可根据下面的式子算出当前时间：real time = t3r-t2r+s(t0r)+t4r。

对于CanTsyn模块的基本原理就说到这里了，其实还有很多小细节没有涉及到，比如Sequence Count的检查， OVS处理， CRC校验等，感兴趣的朋友可以参考文章：[《AUTOSAR基础篇之CanTsyn》](https://blog.csdn.net/wto9109/article/details/126475417)。

## StbM

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

### 时间同步

一个时间同步网络包含一个时间主节点和至少一个时间从节点。时间主节点通过时间同步报文将全局同步时间发送给每个时域上连接的时间从节点。时间从节点正确接收和处理时间同步报文后，更新本地时间并继续运行，直到下次收到时间同步报文。时间同步框架如下图所示：

![时间同步的角色](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_17_55_%E6%9A%82%E5%AD%98.png)



1. **Time Master**：当 ECU 作为一个时基的时间主节点时，该 ECU 的 StbM 模块可以为<**Bus**>TSyn 模块提供精确的时间并发起时间同步操作（即往对应总线上发时间同步报文），<**Bus**>TSyn 将从 StbM 获取到的精确时间通过时间同步报文发送给网络中的时间从节点。同时应用也可以通过 Rte 获取该时基的精确时间，但不能修改该时基的时间值，但是如果该 ECU 是Time Domain的全局时间主节点，则应用可通过 Rte 设置该时基的时间值。
2. **Time Slave**：当 ECU 作为一个时基的时间从节点时，<**Bus**>TSyn 基于接收时间同步报文中的时间和自己本地的时间，计算得到精确时间，然后调用 StbM 模块函数调整该时基的时间值, SWC通过 Rte 仅可以读取该时基的时间值。
3. **Time Gateway**：时间网关是一个时基同时由时间主节点和时间从节点引用，该时基的时间值更新过程和使用方法是单独时间主节点和时间从节点的综合。

### Time Base Status

每个时基都有一个状态字节，高 4 位预留，低 4 位分别表示 TimeOut(Bit0)，TimeLeap(Bit1)，SyncToGateway(Bit2)和 GlobalTimeBase(Bit3)。初始化完成后，所有时基状态字节的值为 0x00。

1. GlobalTimeBase(Bit3)
   当 应 用 成 功 调 用 **StbM_SetGlobalTime**() 或 者 <**Bus**>TSyn 成 功 调 用**StbM_BusSetGlobalTime**()后，GlobalTimeBase(Bit3)被置位为 1，直到下次初始化才会被清除为 0。
2. SyncToGateway(Bit2)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，SyncToGateway(Bit2)的值都将根 据 该 函 数 的 入 参 syncToTimeBase 更 新 。 若 syncToTimeBase 为 1 ， 则 设 置SyncToGateway(Bit2)等于 1，若 syncToTimeBase 为 0，则设置 SyncToGateway(Bit2)等于0 。 若 连 续 两 次 调 用 **StbM_BusSetGlobalTime**() 的 时 间 间 隔 大 于 配 置 参 数**StbMSyncLossTimeout** 的值，则设置 SyncToGateway(Bit2)等于 1，该操作是在主函数中进行的。每次应用成功调用 **StbM_SetGlobalTime**()，SyncToGateway(Bit2)都将被设置为 0。
3. TimeLeap(Bit1)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，StbM 都会把将要更新的时间值与本地时间值比较，若两个时间之间的差值大于配置参数 StbMSyncLossThreshold 的值，则设置 TimeLeap(Bit1)为 1，否者设置为 0。
4. TimeOut(Bit0)
   每次<**Bus**>TSyn 成功调用 **StbM_BusSetGlobalTime**()，都将设置 TimeOut(Bit0)等于 0。若 连 续 两 次 调 用 **StbM_BusSetGlobalTime**() 的 时 间 间 隔 大 于 配 置 参 数StbMSyncLossTimeout 的值，则设置 TimeOut(Bit0)等于 1，该操作是在主函数中进行的。

# Functional safety

## E2E

E2E在AUTOSAR架构中，它被定义成是一个函数库。E2E 可以保护安全相关的数据交换，避免数据交换过程中通信链路造成的错误。E2E通信保护库实现了这些保护机制算法。E2E 的主要功能：

1. 为将要发送的安全相关的数据提供保护；
2. 对接收到的安全相关的数据进行校验；
3. 对接收到的安全相关的数据错误做出指示。

E2E模块保护数据的算法其实就是CRC，它主要就是定义了怎样使用一些特定的CRC算法来确保数据的准确性和连续性，E2E用在发送数据上叫做Protect，用在接收数据上叫做Check。

> [!tip]
>
> 官方标准手册请参见[autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf](https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_SWS_E2ELibrary.pdf)

E2E 模块可以被三个地方调用，分别是COM 模块中的COM callout ，E2E Transformer模块 和 E2E Protection Wrapper。当 E2E 库被 Transformer 和 Wrapper 调用时，需要在 Transformer 和 Wrapper 中对数据元素进行序列化。在 E2E 模块内部会调用 Crc 模块提供函数。

### 五种保护机制

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

### E2E的状态机

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

### E2E Protection Wrapper

前面提到了E2E Protection Wrapper 属于 E2E 三种调用者之一，其位置比较特殊，它不属于BSW层，而是位于 RTE 之上，属于 SWC 层的一部分，其保护的数据需要为信号组的形式。其结构如下：

![E2E protect wrapper结构图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/4_8_21_45_%E6%9A%82%E5%AD%98.png)

E2E Protection Wrapper主要功能如下。

1. 负责将复杂数据元素进行序列化
2. 负责将调用 E2E Lib 时使用的数据结构实例化和初始化
3. 调用 E2E 接口对数据元素进行保护
4. 调用 RTE 接口接收和发送数据

E2E Protection Wrapper 为每组需要保护的数据元素生成一组接口，发送数据接口**E2EPW_Write_**<**p**>**_**<**o**> 和 **E2EPW_WriteInit_**<**p**>**_**<**o**> ，接 收数据接口**E2EPW_Read_**<**p**>**_**<**o**> 和 **E2EPW_ReadInit_**<**p**>**_**<**o**> 。 当 用 户 发 送 数 据 时 调 用**E2EPW_Write_**<**p**>**_**<**o**> ()接口，该接口将数据进行序列化，调用 E2E 的接口保护数据，调用 RTE 的数据发送接口发送数据；当用户接收数据时调用 **E2EPW_Read_**<**p**>**_**<**o**> ()接口，该接口调用 RTE 的数据接收接口接收数据，序列化接收数据，并调用 E2E 接口检查接收数据。

### E2E 错误反馈方式

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

## WdogM

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

### WdogM喂狗机制

WdgDriver 负责操作硬件寄存器，进行实际的喂狗动作。 AUTOSAR 建议在中断中进行喂狗。 WdgDriver 在喂狗之前，需判断Condition Value是否大于 0，大于0时才进行喂狗。成功喂狗后，Condition Value–。

WdgM 负责刷新喂狗条件，在WdgM_MainFunction 会刷新Condition Value。刷新喂狗条件，即将Condition Value置为用户配置的大于 0 的值。 因此，如果 WdgM 运行出现问题，无法刷新Condition Value，则Condition Value会自减至 0，进而引起看门狗复位。

Condition Value的存在，使得 WdgM 可以更灵活的控制看门狗的复位时间，从决定复位到真正复位，可以留给用户更充分的准备时间。

### WdogM监测机制

WdogM提供三种监测机制，分别是：

1. Alive Supervision
2. Deadline Supervision
3. Logical Supervision。

#### Alive Supervision

Alive Supervision 主要用来监控某个 SE 运行的周期是否正确。其基本原理是， 在待监控的 SE 中设置 CP，在固定时间内，监测该 CP 到达的次数。基本实现方式就是一开始需要用户配置一个上限值和下限值，在一个统计周期内，WdogM会计算出这个SE的运行次数，如果运行次数超出这个区间，则Alive 检测失败，否则 Alive 检测成功。

使用 Alive Supervision 的注意事项如下：

1. 同一 CP 不能隶属于多个 Alive Supervision；
2. Alive Supervision 监控到错误后，其 SE 的本地状态将首先切换至 FAILED ，并且 错 误 计 数 增 加 ， 如 果 Alive 错 误 计 数 超 过WdgMFailedAliveSupervisionRefCycleTol，则状态切换为 EXPIRED；
3. Alive Supervision 监控正确，其 SE 的本地状态如果为 FAILED ，错误计数减小，当错误计数减小到 0 后，其 SE 的本地状态将切换至 OK。

#### Deadline Supervision

某些场景下，应用程序需要关注某段程序运行的时间，过长或过短都说明程序执行异常。在 WdgM 中，称之为 Deadline Supervision，抽象为监控两个 CP 之间运行的时间。Deadline Supervision 具体算法如下：用户将在 WdgM 中配置Deadline Supervision 的起始 CP、结束 CP、最小时间门限和最大时间门限。在运行到起始 CP 时启动 Deadline Supervision，在运行到结束 CP 时，计算运行时间是否配置合理范围内。

使用 DeadlineSupervision 的注意事项如下：

1. DeadlineSupervision 的两个 CP 必须属于相同的 SE；
2. DeadlineSupervision 的两个 CP 不能相同；
3. 同一 CP 可以属于不同的 Deadline Supervision；
4. Deadline Supervision 监控到错误后，其 SE 的本地状态将直接切换至 EXPIRED，进而引起全局状态的切换；
5. Deadline 监控的时间一般是 us 级别的，而 WdgM 的调度周期是 ms 级别的，因此WdgM 需要调用 AUTOSAR OS 提供的标准接口StatusType GetElapsedValue(CounterType CounterID, TickRefType Value,TickRefType ElapsedValue)，来读取时间。如果用户未使用 AUTOSAR OS，则也必须提供兼容的接口，才能使用 DeadlineSupervision。

#### Logical Supervision

Logical Supervision主要用于监控应用程序的运行顺序是否正确，包括各个 SE 本地的运行路径的检查，和 SE 之间的全局路径检查。

### WdogM的状态机

WdogM模块里面有两种状态机，一种是针对SE的Local Supervision Status，还有就是针对整个WdogM模块的Global Supervision Status。

### Local Supervision Status

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

### Global Supervision Status

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

# System Service

## EcuM

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

### EcuM状态机

说到状态管理，那肯定是缺不了一套帅气且稳定的状态机，EcuMFlex的状态机如下图示：

![EcuM状态机](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_8_17_58_%E6%9A%82%E5%AD%98.png)



1. **Startup阶段**: 即上电时序，上电或者Reset后则会进入Startup阶段，Startup又分为StartPreOS与StartPostOS两个阶段，顺利完成Startup后且满足条件后则进入UP阶段。
2. **UP阶段**：此时就是相当于ECU处于正常运行状态，当条件满足时，可以根据CPU是否进入到低功耗状态还是OFF状态或者复位操作，相应进入到Sleep阶段与ShutDown阶段。这里值得一提的是，在UP阶段，ECU状态的控制切换则完全由BswM接手，也就是说EcuM只管上下电以及休眠唤醒的时序。
3. **Sleep阶段**：在sleep阶段存在着两种CPU低功耗模式：Poll与Halt模式，后者比前者更节约电能且无需运行代码，具体采用哪个则可根据当初的系统设计而定。这里值得提一下的是，这里的低功耗模式则是那种最浅显的sleep，这个时候ECU还是有电的，CPU顶多处于打盹模式或者关闭和停止一些特殊功能。当唤醒源发生之后，ECU立马进入UP阶段。
4. **Shutdown阶段**：即下电时序，前后会经历OffPreOS与OffPostOS阶段，前者则是为Shutdown OS之前所做的准备，后者则是关闭OS之后，选择对应的函数执行关闭ECU还是重启ECU的操作。

### RUN和POST_RUN

在上面状态机切换中，多次提到了需要满足一些条件，EcuM才会切换模式，那么这里的条件指的是什么呢？那就是RUN和POST_RUN的请求和释放。

RUN和POST_RUN是用户（SW-C）对EcuM模块的两种模式请求。其中RUN 表示用户希望ECU处于正常运行状态，POST_RUN表示用户需要做休眠或关闭前的清理工作。用户需要通过 EcuM 模块接口来单独请求或释放 RUN 或 POST_RUN，而且请求和释放必须成对调用。EcuM 模块整合所有 SW-C 的请求，向 BswM 模块发起模式请求。基本规则为：

1. 当至少有一个 SW-C请求 RUN 时，EcuM 向 BswM 请求系统进入运行状态；
2. 当所有 SW-C 均释放 RUN，但仍有至少一个 SW-C 请求 POST_RUN 时，EcuM 向 BswM 请求进入POST_RUN 状态；
3. 当所有SW-C 的 RUN 和 POST_RUN 均释放时，EcuM 向 BswM 请求系统进入关闭状态。

一般使用情况为：当用户希望正常运行时，向 EcuM 请求 RUN。当应用停止运行且希望进行一些后处理时，应该先请求 POST_RUN，再释放 RUN。EcuM 和 BswM 会根据系统整体状态在适当时机切换到 POST_RUN 状态，且通知应用可执行清理工作。当执行完清理工作后，应用调用 EcuM 接口释放 POST_RUN，则系统会进入Sleep或者Shutdown过程。

### Startup阶段

上面提到Startup阶段其实就是上电流程，分为 StartPreOS 和 StartPostOS 两部分，以 OS 的启动为分界线。其实就是EcuM_Init()，那么在这个过程中，需要做些什么呢？

#### StartPreOS 流程

1. 执行 EcuM_AL_SetProgrammableInterrupts()，主要负责关闭芯片的可编程中断，为初始化其他模块和启动操作系统做准备。如果系统启动代码已将中断关闭，则可通过配置参数将该步骤省略，否则需要在该函数中关闭中断。
2. 执行 EcuM_AL_DriverInitZero()，初始化**Init List 0**容器里面的驱动。
3. 执行 EcuM_DeterminePbConfiguration()，根据相关系统设计读取 Post-build 配置参数数据指针。
4. 检查配置数据一致性，检查在上一步得到得Post-build配置数据的有效性。
5. 执行 EcuM_AL_DriverInitOne()，初始化**Init List 1**容器里面的驱动。
6. 获取上次复位原因，通过读取MCU的特殊复位原因寄存器，获取此次ECU复位的复位源，根据复位源来进行不同处理。例如复位原因是唤醒复位时，则需要执行唤醒源确认等步骤；如果复位原因是电源上电，则需要对 EcuM RAM 的一些关键变量进行初始化。
7. 设置默认 Shutdown target，系统关闭有三种情况，称为三种 ShutdownTarget，分别为 SLEEP、RESET 和 OFF。SLEEP 是指系统进入低功耗状态，RESET 是指复位重新运行，OFF 是完全断电。
8. 执行 EcuM_LoopDetection()，这是一个 Callout 函数。
9. 执行 StartOS()，启动操作系统，入参为在 EcuM 模块配置的 OS 的 AppMode。该函数最终不会返回，因此 EcuM_Init()也不会返回。

#### StartPostOS 流程

在 AUTOSAR OS 中 ， 需 要 配 置 一 个 自 启 动 任 务 。 在 该 任 务 中 ， 需 要 调 用EcuM_StartupTwo()，StartPostOs 存在于该函数执行过程中。该函数主要执行两个操作，调用 SchM_Init()和调用 BswM_Init()。当 BswM 模块成功初始化后，后续的初始化任务由 BswM 模块完成。EcuM 的启动流程也就此结束。

###  Init block

在上述上电流程中，提到了Init Block。现在很多MCU对初始化外设的时序都有严格要求，所以EcuM 设计了几个驱动初始化列表以满足不同需求，分别为EcuMDriverInitListZero、EcuMDriverInitListOne 和 EcuMDriverRestartList。

- EcuMDriverInitListZero 由 EcuM_AL_DriverInitZero()实现，在获取 Post-build参数前调用。用于初始化一些公共基础模块，以及获取 PB 参数所需要的硬件模块的驱动。
- EcuMDriverInitListOne 由 EcuM_AL_DriverInitOne()实现，在获取 Post-build参数后调用。用于初始化一些具有多套配置，且不依赖于操作系统的模块。
- EcuMDriverRestartList 由 EcuM_AL_DriverRestart()实现，在唤醒后用于重启一些驱动模块。

我们可以在配置 EcuM 模块时指定每个列表中包含的驱动模块，其中InitListZero和InitListOne中的模块不能重复，而重启列表一般来讲是前两个列表的子集，其中模块的相对顺序必须与前两个列表一致。

### Shutdown阶段

上面提到Shutdown阶段其实就是下电流程，其实就是Startup阶段的逆操作，关闭流程通过调用 EcuM_GoDown()触发。只有指定模块才能触发该流程 ，为此用户需要在配置工具上添 加EcuMGoDownAllowedUsers 并添加一个或多个用户。调用该接口时传入用户 ID。关闭过程分为 OffPreOS 和 OffPostOS 两个阶段，以OS 的关闭为分界线。

#### OffPreOS 流程

OffPreOS 流程主要完成以下几个主要动作：

1. 执行 EcuM_OnGoOffOne()，这是一个集成代码，主要负责处理一些关闭前的特殊操作。需要根据芯片特性填充功能。
2. 执行 BswM_Deinit()，反初始化 BswM 模块。
3. 执行 SchM_DeInit()，反初始化 SchM 模块。
4. 检查唤醒事件，如果在关闭过程中发生挂起或确认的唤醒事件，则系统需要响应唤醒。所以若当前 Shutdown Target 为 OFF，EcuM 会将其更改为 RESET，即在执行完后续的关闭动作后将处理器复位，从而再次启动。若没有发生唤醒事件，则正常执行关闭流程。
5. 执行 ShutdownOS()，关闭操作系统。该函数会清理操作系统中的一些资源，最终调用ShutdownHook()。

#### OffPostOS 流程

我们需要在函数ShutdownHook()中调用EcuM_Shutdown()，OffPostOS 流程则是在 EcuM_Shutdown()中实现。OffPostOS 流程分为两个步骤：

1. 调用EcuM_OnGoOffTwo()。用户可以在其中调用不依赖于操作系统的模块的反初始化或清理工作。
2. 根据前面设置的 Shutdown Target ， 分别调用EcuM_AL_Reset() 或EcuM_AL_SwitchOff()。用户需要在这两个函数中分别调用驱动来实现系统复位或关闭电源等工作，自此ECU完成Shutdown流程。

### Sleep和WakeUp

为了实现低功耗模式，在UP阶段，当应用软件不再执行操作，且在总线上满足休眠条件时（如CAN 网络的远程休眠条件满足），系统将进入休眠模式。这个休眠发起人BswM模块，而执行者则是EcuM模块，纯纯苦逼打工人。

在休眠前，需要调用 EcuM_SelectShutdownTarget()将休眠模式设置为 SLEEP，且需要设置具体的休眠模式。根据硬件芯片的不同，有些芯片可以处于不执行代码的状态，有些芯片会处于仍然执行代码的低频模式。需要根据这些硬件差异选择调用EcuM_GoHalt()或 EcuM_GoSleep()函数使 MCU 处于低功耗状态。进入休眠状态有三个步骤：

1. 预处理步骤
2. 休眠步骤
3. 唤醒重启步骤。

#### 预休眠步骤

在预休眠步骤中，EcuM 首先会调用 BswM 模块接口报告唤醒源状态。然后 EcuM 模块要使能唤醒源以备将来的休眠。这是通过调用 EcuM_EnableWakeupSources()函数实现的。在该集成代码中，用户需要判断入参中每个比特，调用相应驱动的相应函数来将每个唤醒源使能。之后 EcuM 会调用 OS 的接口函数 GetResource()锁定调度功能，以备在将来唤醒中断处理完后仍然能返回当前进入休眠的任务中执行唤醒操作。

#### 休眠步骤

上面提到Sleep分为两种模式，分别是Halt模式和Poll模式。

1. Poll 模式休眠步骤
   Poll 模式下 CPU 仍然执行代码，但以较低主频运行。这时 EcuM 将不停执行两个动作：调用 EcuM_SleepActivity()和调用 EcuM_CheckWakeup()。

   其中EcuM_SleepActivity()为集成代码，用户可以在其中执行低功耗状态下运行的工作。EcuM_CheckWakeup()也是集成代码，用户在其中根据入参遍历唤醒源，调用唤醒源驱动接口检查是否发生唤醒事件。如果发生唤醒事件，唤醒源应当调用EcuM_SetWakeupEvent()通知 EcuM。EcuM 会在检查完成后发现唤醒事件，触发唤醒步骤。

2. Halt 模式休眠步骤
   Halt 模式下 CPU 不再执行任何代码。在此模式下，为了防止可能出现的 RAM 内容破坏，EcuM 会调用 EcuM_GenerateRamHash()计算 RAM 的校验值。在EcuM_GenerateRamHash()中用户需要自行对关键内容计算检验并保存。之后 EcuM 会调用 MCU 驱动进入休眠模式，CPU 会停止处于打盹模式，只有唤醒中断会将 CPU 重新置于运行状态。并且触发唤醒重启步骤。

#### 唤醒重启步骤

发生唤醒事件后，EcuM 会执行唤醒重启。首先恢复 MCU 为正常模式，然后获取唤醒源，并将已确认和已挂起的唤醒源禁止，保留其他唤醒源以备稍后唤醒。最后调用 EcuM_AL_DriverRestart()执行重启驱动列表，解锁操作系统的调度器。

在驱动重新初始化过程中，驱动应当检测是否自己是触发本次唤醒的唤醒源，如果是，则最终会调用 EcuM_SetWakeupEvent()通知 EcuM。执行完唤醒重启步骤后，系统进入 UP 状态，有些唤醒源仍需要验证有效性。

有些唤醒源会产生虚假唤醒事件，如电平跳变导致 CAN 收发器或 IO 唤醒。有些唤醒源需要在特定情况下才能真正唤醒，如系统只允许 CAN 网络管理报文唤醒节点，不允许应用报文唤醒。这些期望之外的复位源则需要使用 EcuM 模块的唤醒确认功能对唤醒源进行有效性确认和过滤，这也要求用户必须根据ECU的软硬件设计完成唤醒源确认策略设计。

### 进入Bootloader

在 ECU 需要重编程时，诊断仪与 Dcm 模块交互，设置 Bootloader 重编程有效标志后复位。

在AUTOSAR中实现该流程 ，需要由应用层调用 EcuM 模块的EcuM_SelectBootTarget()函数来记录下次启动的引导目标是应用、OEM Bootloader 还是System Bootloader。具体流程为：

1. 诊断仪发送请求切换编程会话；
2. Dcm 模块先通过Rte向应用请求复位 ，应用调用 EcuM 模块EcuM_SelectBootTarget()函数设置复位启动目标；
3. Dcm 向诊断仪发送 0x78 响应；
4. Dcm 调用集成代码的接口，用户在集成代码中设置 Bootloader 的重编程有效标志；
5. Dcm 通知 App 可以执行复位；
6. 当 App 完成复位前的清理工作后，请求 EcuM 复位。在 Shutdown阶段中最后调用 EcuM_AL_Reset() 时 ， 应当调用EcuM_GetBootTarget()来获取当前引导目标。并根据与 Bootloader 的交互协议设置相应标最后触发复位操作。

### Alarm Clock

EcuM 模块可以定义一个系统时间，基于 GPT 从上电复位开始以秒为单位运行。用户可以调用 EcuM_GetCurrentTime()获取系统自上电以来的运行时间。该时钟在休眠状态下仍然能正常运行，因此用户还可以用以作定时唤醒源来唤醒系统。

## BswM

上一节介绍了一个非常夸张的EcuM模块，其中多次提到了BswM模块，这两个模块通常狼狈为奸，共同策划且并操作了整个ECU的状态切换。细细研究EcuM模块后就会发现它是比较别动的，都是当一些条件满足或者事件发生时，EcuM才会控制系统进行状态切换，它更像是一个大兵，只会吭哧吭哧干活，而这一节的BswM模块则是真正的指挥。

BswM 模块位于 AUTOSAR 基础软件架构中的服务层，实现对 BSW层和 SW-C的模式管理。BswM的处理流程如下图所示：

![BswM模块](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_8_54_15_%E6%9A%82%E5%AD%98.png)

BswM 模块主要提供两项功能：

1. 模式仲裁：模式仲裁是把各个 BSW 模块和 SW-C 模块的模式请求和模式指示收集起来，按一定的模式规则进行计算，得到仲裁结果。
2. 模式控制。模式控制是指根据仲裁结果，调用不同的动作列表，在动作列表中调用各个模块的函数或接口。

模式仲裁的规则和模式控制的动作列表都是用户可配置的，因此 BswM 的功能极大程度上依赖用户配置。

在上面提到BswM主要就是干两个事情，一个是模式仲裁，一个则是模式控制。

### 模式仲裁

1. `ModeRequestPort`：每个 BSW 模块或 SW-C 都可以通过 API 或服务向 BswM 报告或者申请状态，这里提到的接口或服务称为端口（Port），而状态则被称为模式（Mode）。申请状态则被称为模式请求（Mode Request），报告状态则被称为模式指示（Mode Indication）。模式请求通常来源于SW-C，也有可能来源于BSW模块，比如Dcm模块；模式指示则总是由BSW模块发出，比如<**bus**>Sm模块，EcuM模块等。每个端口需要配置一个默认模式，如果未配置则视为未定义。端口和模式两者拼合起来那就是ModeRequestPort。

2. `ModeCondition`：模式条件（ModeCondition）是模式仲裁时候的最小判断单元，如果模式条件关联了一个ModeRequestPort，则该条件会验证请求的模式或者指示的模式是否EQUAL或者NOT_EQUAL于某个模式，然后每一个ModeCondition判断完成后会返回TRUE或者FALSE。

3. `Logical Expressions`：使用AND、OR、XOR、NOT和NAND这些逻辑符将ModeCondition组合起来就是一则逻辑表达式，即Logical Expressions。

4. `Rules`：Rules就是当一则Logical Expressions计算结果为真后，BswM模块应该要采取什么样的措施，将措施和Logical Expressions对应起来，这就叫一条Rule。当模式发生变化时（这种叫做BSWM_IMMEDIATE）或者在BswM主函数运行时（这种叫做BSWM_DEFERRED）就会对Rules进行评估，评估Rules的这个过程即叫做模式仲裁，模式仲裁满足条件之后，则开始进行模式控制。下图就是一条简单Rule的的仲裁：

   ![模式仲裁](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_9_0_54_%E6%9A%82%E5%AD%98.png)

### 模式控制

1. `Action和Action List`：在前面模式仲裁的Rules中，提到了当一条Rule评估满足条件后BswM模块会执行相应的措施，这里的措施在模式控制中称为Action List。Action List是一组有序的Action，BswM 按顺序依次执行动作列表中的每个元素。元素有三种类型：

   1.  一个特定的动作（函数），BswM 会简单地执行该动作；

   2. 指向其他Action List的链接，BswM 将从被指向的Action List起始处依次执行到最后一条元素，这意味着Action List可以级联；

   3. 指向一条Rule的链接，BswM 对该Rule进行运算，根据结果执行其对应的Action List。

      ![模式控制](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_9_3_18_%E6%9A%82%E5%AD%98.png)

      如果Action List的某一条Action执行失败，则根据其属性 BswMAbortOnFail 决定是否继续执行。若配置为真，则中止整个Action List的执行；若配置为假，则继续依次执行后续的Action项。如果Action List配置了 BswMReportFailToDem，则 BswM 会在动作执行失败时向 Dem 模块报告事件，该事件需要在 BswM 模块中预先配置。
      基于Rule评估，动作列表有两种方式被执行：

      1. BSWM_CONDITION：条件执行，即每次评估规则时被执行。
      2. BSWM_TRIGGER：触发执行，即每次评估结果发生变化时才执行。

      如果为触发执行配置了一个True的动作列表，则BswM仅在相应规则的评估从False变为True时才会执行此动作列表。如果为触发执行配置了一个False的动作列表，则BswM仅在相应规则的评估从True变为False时才会执行此动作列表。如果为条件执行配置了一个True的动作列表，则BswM应在每次将相应规则评估为True时执行此动作列表。如果为条件执行配置了False的动作列表，则BswM应在每次将相应规则评估为False时执行此动作列表。

2. `SwitchPort和RteModeRequestPort`：RteModeRequestPort请求端口是请求更改应用程序模式，而SwitchPort是在BswM执行模式更改时用来接收通知。

## OS

这一节来介绍一下OS的一些小点点，这一章都是文字，估计比较枯燥乏味。对OS基础不太了解的朋友，这里推荐两篇网上好文：《 [AUTOSAR基础篇之OS(上)](https://blog.csdn.net/king110108/article/details/125026534) 》，《 [AUTOSAR基础篇之OS(下)](https://blog.csdn.net/king110108/article/details/125027088) 》。

AUTOSAR OS为了适应各种各种样的芯片，所以它需要良好的可扩展性来做支撑，说得简单点就是OS的功能可被灵活裁剪，AUTOSAR则根据功能扩展分成了四种扩展类型，分别是SC1 ~ SC4，其主要区别为：

![SC区别](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_14_0_54_image-20250805140053612.png)

### OS 基础

#### Startup和Shundown

OS 操作系统的启动是通过调用“StartOS()”函数来实现。在标准的 AUTOSAR 项目中，StartOS 函数由 EcuM_Init 调用。OS系统可以设定不同的应用模式，用户可以在不同的应用模式下运行不同的应用程序，从而在不同的条件下实现不同需求，需要给StartOS指定应用模式参数。 OS系统支持多种应用模式共存，并提供配置选项供用户在系统配置阶段建立和选择所需的应用模式。一旦操作系统启动，应用模式就不能再更换，也就是说在系统运行过程中动态切换应用模式是不允许的。

StartOS()会对OS内部各组件进行初始化，激活自启动任务、报警或调度表。StartOS()的最后，会启动系统定时器，并触发第一次 任务调度 。如果用户使能了相关 Hook，StartOS 会在所有初始化完成之后，启动系统定时器、触发第一次任务调度之前，调用用户的 Hook，调用顺序为：

1. 调用 OsStartupHook，
2. 调用各个 OS-Application 的 OsAppStartupHook。

OS 操作系统的关闭是通过调用“ShutdownOS()”函数实现。“ShutdownOS()”函数会禁能所有中断,停止系统定时器运行，最终进入死循环。如果用户使能了相关 Hook，ShutdownOS 会在进入结尾处，进入死循环之前，调用用户的 Hook，调用顺序为：

1. 调用各个 OS-Application 的 OsAppShutdownHook。
2. 调用 OsShutdownHook。

#### Task

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

#### Counter

OS 中有两类计数器：SystemCounter 和 UserDefinedCounter。

1. SystemCounter 指的是操作系统所使用的系统计数器，
2. UserDefinedCounter 指的是用户自行设定的、通常用于应用软件的计数器。

SystemCounter默认必须存在，该计数器只能通过 SystemTick 进行触发，用户不可修改。Tick 是指 SystemCounter 的计数基值。硬件定时器多久产生一个 Tick 是由 TickTime 确定，TickTime 的单位为μs，默认值为 1000μs。用户可以在配置工具中根据需求对 TickTime 的大小进行配置。为实现 SystemCounter，OS 会占用一个硬件定时器来周期性地产生 System Tick。OS会自动创建该硬件定时器的中断，用户可以更改定时器中断的优先级。

除 SystemCounter 外， OS 支持用户自定义的 counter。用户自定义的 counter 没有固定触发源，用户需要调用 IncrementCounter 触发自定义Counter 增加。例如在周期任务或其他的定时中断中调用，也可使用 Alarm 触发自定义 Counter，Alarm 的动作中可选择IncrementCounter。

#### Alarm

Alarm相当于是一个软件定期器，可以使用Alarm进行定时，定时时间到后，执行相应的动作。Alarm支持的动作有：

1. 激活一个任务；
2. 设置一个事件；
3. 运行一个Alarm Callback函数；
4. 累加一个User Defined Counter。Alarm Callback只在 SC1 中提供。

有两种方法可以启动 Alarm，自启动的 Alarm在OS启动后就自动开启了。对于非自启动的 Alarm，用户需要调用 SetAbsAlarm()或SetRelAlarm()启动报警，设置报警的启动时间和周期。 SetAbsAlarm()和SetRelAlarm()的区别在于是相对延时还是绝对延时。

#### Resource

OS 提供了Resource管理功能，用于解决任务或中断同时访问共享Resource时的协调问题。共享Resource可以是应用程序段、内存空间或者硬件外设等。OS 的Resource管理机制可以防止Resource死锁，任务优先级反转等问题。

GetResource()和ReleaseResource()用来进行锁住和释放Resource。这个时间就会出现优先级反转的情况，这样做是为了避免两个不同优先级任务访问相同Resource而出现互锁的情况，具体做法为：任务或中断调用 GetResource 获取Resource时，OS 会将任务或中断的优先级提升至最高优先级。之后，访问该Resource的其他任务或中断将无法抢占当前任务，直到该Resource被释放，Resource被释放时，OS 将会恢复该任务或中断的原先优先级。

因为任务的优先级为软件优先级，而中断的优先级为硬件优先级，这两种优先级不在一个层次，所以如果当一个Resource是任务和中断共享的，当该Resource被任务获取后，OS 将会锁定调度（所有任务和二类中断都不能抢占当前任务，包括与当前Resource无关的任务和二类中断），这样做是为了防止使用该Resource的中断被锁定的时间过长。

#### Event

Event用于实现系统内不同的实体之间的同步，包括任务与任务进行同步或是任务与中断服务函数进行同步。只有扩展任务可以调用 WaitEvent 等待Event，调用 WaitEvent 后，任务不再运行，进入WAIT 状态。

任务和二类中断中可以调用 SetEvent 设置事件，另外Alarm，Schedule Table 也可以配置设置事件的动作。设置事件后，等待该Event的任务将恢复至 READY 状态。然后 OS 会基于当前系统的抢占策略，任务优先级的情况，确定何时恢复任务的运行。每个扩展任务支持最多 32 个事件。WaitEvent 和 SetEvent 均可以等待或设置多个事件。

#### Interrupt

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

#### Schedule Table

调度表可以帮助用户更方便的实现一系列具有时序要求的动作。首先说一下EP（Expiry Point），它相当于一个时间点执行对象，当时间到了，Schedule Table就会去执行这个EP，EP可触发多个Task或者触发多个Event，而一个Schedule Table 可配置多个 EP（Expiry Point）。 Schedule Table 可以配置为单次触发运行，或者周期运行，OS可支持同时运行多个调度表。 Schedule Table的EP执行规则由两个参数决定，分别是整个Schedule Table的Final Delay参数，还有每一个EP的Initial Offet参数，所以当一个调度表被启动后，它的运行流程如下：

![OS的任务调度表](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_14_57_15_%E6%9A%82%E5%AD%98.png)

首先在Tick 0处Schedule Table被启动，然后根据每一个EP的Initial Offet来决定EP的执行时刻，当最后一个EP执行后，最后等待Final Delay个Tick，整个Schedule Table运行结束如果Schedule Table配置成重复启动，那么此次运行后立即启动下一次Schedule Table的运行。

####  OS Context

OS Context就是当前OS所处的状态，这里的状态其实就是当前程序运行到哪里了，比如说Task内， 一类中断内，二类中断内，还是各种Hook内。不同的状态下，OS所能做的事情也是不一样的，所能做的事也可以简单的理解成能不能调用某些常用OS函数。具体如下图所示：

![OS服务函数1](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_15_0_47_%E6%9A%82%E5%AD%98.png)

![OS服务函数2](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_15_1_21_%E6%9A%82%E5%AD%98.png)

####  普通监测功能

在一般的AUTOSAR OS中，一般需要提供以下几种监测手段：

1. 堆栈检测将进行栈初始化，并且当发生栈溢出的错误现象时，可以及时告知用户并最终执行关闭 OS。当退出二类中断、退出任务时，系统会进行堆栈溢出检测，即检查当前中断或任务是否将预先配置的栈全部使用耗尽。
2. 系统提供 CPU 负载计算功能，调用相关函数，获取最近一次该周期内的系统负载率。
3. 当 OS 内部检测到故障后，OS 会将错误信息记录，比如传参错误，状态错误，总之就是导致函数未正常运行下去的各种错误。还可以定义用户Hook，当检测到错误时，可执行Hook函数。

### OS SC2

SC2类主要在SC1的基础上增加了时间保护功能，其主要保护的对象是OS所能管理的，即Task和二类中断，主要提供了三个保护手段，分别是

1. 任务和二类中断执行时间的保护；
2. 任务和二类中断最小执行时间间隔的保护；
3. 任务和二类中断锁定时间的保护。

#### Execution time protection

执行时间保护简单点来说就是监测Task和二类中断不能运行的太慢，其运行的时间不能超过限值，执行时间保护包括任务预期执行时间的保护和中断预期执行时间的保护。主要有以下两点：

1. 如果任务或中断运行时间超出了其预期时间, OS 将会执行 ProtectionHook()函数，参数为E_OS_PROTECTION_TIME。
2. 当任务或中断被打断时，系统会停止任务或中断的执行时间计时，直到该任务或中断被恢复，系统继续对其执行时间计时。对于扩展任务，其状态由 RUNNING 转换成WAITING 时，系统会停止其执行时间计时，当其等待的事件被成功设置后，重新开始该任务的执行时间计时。

#### Inter -arrival time protection

间隔时间保护说简单点就是监测Task和二类中断的不能运行的太快，其运行的频率不能高于限值，间隔时间保护包括任务间隔时间的保护和中断间隔时间的保护。主要有以下三点：

1. 如果尝试在小于任务时间间隔内再次激活任务，OS 将会调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，那么 OS 将会再次执行激活任务，否则不会执行真正的激活。
2. 如果用户尝试设置一个事件，但是相应的扩展任务运行间隔小于任务间隔时间，那么 OS 会调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，这个事件将会被设置成功，OS 将执行该扩展任务。
3. 如果一个二类中断发生的频次小于中断间隔时间，那么 OS 将不会执行该中断的用户处理函数，同时调用 ProtectionHook()函数，其参数为 E_OS_PROTECTION_ARRIVAL。如果用户在 Hook 函数中返回 PRO_IGNORE，该中断仍可被执行。

#### Locking time protection

锁定时间保护说简单点就是去监测任务和二类中断在运行过程中，执行一个操作的时间不能超时，这里的操作时间包括：

1. 获取Resource的时间，GetResource()。
2. 禁用全局中断的时间，SuspendAllInterrupts()/DisableAllInterrupts()。
3. 禁用二类中断的时间，SuspendOSInterrupts()。

**注：** 当Execution time protection和 不同操作类型的Locking time protection在一个任务或者二类中断中同时使能了的话，以两者的最小值为准。

### OS SC3

SC3在SC1的基础上增加了OS-Application，

#### OS-Application

前面提到的Task, ISR, Counter, Alarm, Schedule Table, Resource等玩意在AUTOSAR OS中称为Object， 然后AUTOSAR OS又提出了一个OS-Application的概念，这个玩意就是一个容器，可以在不同的OS-Application容器放置不同的Object。

OS-Application 分为两种：

1. 可信的，可信的 OS-Application 可以不受限制地访问内存。
2. 不可信的。不可信的 OS-Application则需要配置其可访问的内存范围。

系统中如何划分 OS-Application，取决于功能安全的分析。而对于Object，则需要配置其属于哪个OS-Application以及它可以被哪个OS-Application访问。结合这两点，则就可以实现一种权限访问监测手段。

#### Service Protection

Service Protection其实就是制定了一些OS使用规则，防止OS-Application错误的使用了相关OS函数而造成了OS不稳定。主要包含这几种情况：

1. 参数无效或超出范围，系统 API 的对象无效（比如，该对象未被配置），则返回E_OS_ID，参数超出范围（比如，设置一个 Alarm 但 cycle 参数小于 OsCounterMinCycle）则返回 E_OS_VALUE。
2. 在不合理的上下文调用 API，在OS Context中不合理的调用 API，则 API 返回 E_OS_CALLEVEL。具体规则详见前面的OS Context。
3. 具有未定义行为的服务，这个保护的场景只要是：有些OS函数虽然被调用了，但是其检测到当前情况不合理，那么就会直接跳出，并不会实际执行，又或者是当发生OS Context时，OS应该需要做什么，但是你没做的话，OS会自动做。
4. 不可信应用中的服务限制，OS 会忽略来自不可信应用对 ShutdownOS()的调用。
5. 不同 OS-Applications 之间的 Objects 调用，如果 OS API 的参数是一个系统对象，但是该对象未被配置响应任务或中断的访问权限，那么系统 API 将返回 E_OS_ACCESS。

#### Memory Protection

OS 提供内存保护功能，为每个任务/二类中断/OS-Application 配置指定的内存区域，并在访问越界时触发保护中断，从而确保系统的正常运行。每个任务/二类中断都有一个私有数据和堆栈空间，其他任务/中断无法访问这些数据和堆栈空间。OS-Application 还可以有一个私有数据区域，当前 OS-Application 中的任务/二类中断可以访问该区域，其他 OS-Application 的任务/二类中断无法访问。

#### IOC

由于内存保护的存在，不同的 OS-Application之间的数据访问是受到OS管制的，所以OS 提供了 IOC 通道，实现 OS-Application 间的数据传递。在一些多核处理器上，不同核的OS-Application之间的通讯则需要将核心间通信能力整合到 IOC 中。

#### Trusted Function

不可信 OS-Application 不允许访问其他 OS-Application 的数据，但在某些系统中，有一些不可信的 OS-Application 需要使用其他 OS-Application 服务。操作系统为可信应用提供了一种将其某些服务导出到不可信应用的方法。这称为Trusted Function。

### OS SC4

OS SC4是SC1, SC2, SC3的机会，即包含完整的AUTOSAR OS功能。

### MultiCore

#### MultiCore Startup

内核的启动方式在很大程度上取决于硬件。通常，硬件只启动一个核心，称为主核心，而其他核心（从核）保持在停止状态，直到它们被软件激活。AUTOSAR 多核操作系统规范要求系统具有主从启动行为，可以由硬件直接支持，也可以由软件模拟。在多核中，在核上执行 StartOS 之前，必须激活 AUTOSAR 使用的每个从核。根据硬件的不同，可能只能从主设备激活可用内核的一个子集。从核可能会在调用 StartOS 之前激活其他核心。在 StartOS 的最后，会进行多核启动的同步。所有核都启动后，才会同步触发每个核
的首次的任务调度。

AUTOSAR 支持两种系统关闭概念，同步关闭和单独关闭概念。同步关闭由 API 函数 ShutdownAllCores()触发，而单个关闭由 API 函数 ShutdownOS()调用。如果具有适当权限的任务调用“ShutdownAllCores”，则会向所有其他 Core 发送一个信号，以引导关闭过程。

在多核概念下，Spinlock 机制用来支持不同核心上的任务互斥。Spinlock 是一种繁忙的等待机制，它轮询其状态直到它变为可用。使用GetSpinlock()函数占用一个 Spinlock，如果 Spinlock 已经被占用，GetSpinlock()将继续尝试占用 Spinlock，直到成功为止；使用TryToGetSpinlock()函数占用一个 Spinlock，如果 Spinlock已经被占用，TryToGetSpinlock()将返回；使用 ReleaseSpinlock()函数释放被占用的自旋锁。如果多个 Spinlock 存在嵌套使用的情况，则需要考虑使用顺序，防止死锁。

IPC（核间通信）是多核OS中一个最重要的一个环节，这一般跟芯片外设强相关。

# Memory Stack

## NVM

memory stack结构如下：

![应用分层细分层级](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/27_11_31_0_%E6%9A%82%E5%AD%98.png)

再细致一点如下图：

![memory stack详细图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_11_39_30_image-20250805113929740.png)

Memory Stack也是非常完整的一个AUTOSAR结构，有服务层的NvM模块，有ECU抽象层的Fee模块和Ea模块，还有MCAL层的驱动。其中NVRAM Manager模块是整个Memory Stack的控制器，它更多的关注于数据本身的，对数据进行校验，读写操作的发起，而根据最终存储器类型的不同，则最终负责数据存储和读写操作的则是Fee模块（FLASH）和Ea模块（EEPROM)。而在MCAL层则根据是内部FLASH，外部FLASH，外部EEPROM的各种情况而灵活变化。

> [!tip]
>
> 大家如果想更深入了解NvM模块，请参考AUTOSAR官方文档[Specification of NVRAM Manager (autosar.org)](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_SWS_NVRAMManager.pdf)。
>
>   **补充2**：除了以上简单介绍的几大点，MemIf模块还有一大堆的细节，大家如果想更深入了解MemIf模块，请参考AUTOSAR官方文档[Specification of Memory Abstraction Interface (autosar.org)](https://www.autosar.org/fileadmin/standards/R23-11/CP/AUTOSAR_CP_SWS_MemoryAbstractionInterface.pdf)。
>
> 

NvM 模块位于 Memory Stack 的服务层，实现了对ECU中Non-Volatile数据的统一管理。NvM 模块主要功能如下：

1. 将不同类型的存储器（Flash、EEPROM 等）进行统一管理，提供AUTOSAR 标准服务接口
2. 提供以 Block 为单位的读、写等服务
3. 基于优先级的数据块访问机制，提高用户访问的灵活性和实时性
4. 提供访问任务的队列
5. 工作请求异步处理
6. 提供 CRC 机制，保障数据的一致性
7. 提供数据故障恢复机制
8. 提供任务完成通知机制

### Block

这里的Block可不是FLASH里的那个硬件Block，这里的Block是一种软件层面上的玩意，它是NvM操作的数据基本单元，也就是说，NvM模块里面操作的对象就是Block，所以在AUTOSAR里想要存储数据，那么就要提前给数据分配Block。

NvM 支持三种类型的 Block，分别为：

1. **Native Block**：最常用的 Block，用于一般数据的管理；
2. **Redundant Block**：该 Block 支持数据冗余，可用于对一些安全性要求较高的数据进行管理，其实就是可以对其进行备份的Block。
3. **Dataset Block**：该 Block 支持同一类型的多套数据。用户可以根据当前的运行状态，选择使用多套数据中的一套。

每个 Block，又由以下几个部分组成：

1. **NV Block**：位于掉电不丢失的设备，如 Flash，用于正常的存储数据；
2. **RAM Block**：程序运行时，用户的应用程序直接访问的 Block，有点类似于缓存，当条件满足时会将其更新至NV Block。
   1. 临时 RAM Block：在运行时，用户通过接口将 RAM 的地址传递给 NvM；
   2. 永久 RAM Block：用户配置给该 Block 的固定的 RAM 地址，运行时不可改变。
3. **ROM Block**：存储该 Block 的默认值，位于掉电不丢失的设备，当 NV Block 的数据异常时，可恢复为默认值；
4. **Administrative Block**：管理 Block，一般位于 RAM 中，用于记录和存储程序运行时 Block的状态，如地址、CRC 结果、Block 状态等。Administrative Block 由 NvM 内部实现，不用关心。

不同类型Block的组成情况如下表所示：

| 类型      | NV      | RAM  | Administrative | ROM     |
| --------- | ------- | ---- | -------------- | ------- |
| NATIVE    | 1       | 1    | 1              | 0 ~ 1   |
| REDUNDANT | 2       | 1    | 1              | 0 ~ 1   |
| DATASET   | 1 ~ 256 | 1    | 1              | 0 ~ 256 |

此外NvM 内部还会预留 2 个特殊 Block，Block0 和Block_CfgID。其中Block0 不存储任何实际数据信息，仅用于记录 WriteAll 和 ReadAll 的工作结果，Block_CfgID 则用于存储当前内存的配置信息。用户实际使用的 Block 从第 3 个 Block 开始。

在NvM模块的下层模块Fee和Ea模块中，它们的基本数据存储单元也叫做Block，NvM模块的Block数据来源于Fee和Ea的Block，前面提到了NvM的三种Block由若干个NV Block组成，所以这两种Block是一对多的情况。NvM的Block编号叫做Block Handle，Fee和Ea的Block编号叫做Block ID，也就是说APP通过Block Handle来索引NvM的数据，而NvM则是通过Block ID来索引Fee和Block的Block数据。

Block ID 的计算公式为：
$$
Block ID = (Block Base Num << DataSelectionBits) + DataIndex
$$
其中Block Base Num根据Blocl类型而定（Native，Redundant ，Dataset ），DataSelectionBits和DataIndex根据具体应用情况进行设置。其中当 NvM 调用 MemIf 的接口，访问 Fee 或 Ea 时，传递的 Block 参数为 Block ID。

### 数据结构

Block三种组成成分Block的存储数据格式如下：

![NVM的数据结构](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/08/5_13_30_36_%E6%9A%82%E5%AD%98.png)

其中 RAM 和 NV Block，都有可选的 Header 和 CRC 区域。Header 可用于存储 Block 的Block ID 信息，固定占用两个字节的信息，CRC 区域用于存储 Block 的 CRC，根据 CRC 的类型，占用 1、2 或 4 个字节。ROM Block 仅存储默认数据，不存储 Header 和 CRC 内容。用户在读取和写入数据的时候，不需要关心 Header 和 CRC，NVM 模块将自动对 Header 和 CRC进行填充、计算、校验等工作。

### Redundant Block

前面提到了Redundant Block 有 2 个 NV Block，其主要特点包括：

1. 在 Write、WriteAll 中，将向 2 个 NV Block 写入同样的数据，只要有其中一个 NV Block写入成功，则写数据成功；
2. Erase、Invalidate 工作中，将对 2 个 NV Block 进行操作，只有对 2 个 NV Block 的操作都成功，请求才成功；
3. 在 Read、ReadAll 中，将首先读取第一个 NV Block 的数据，如果读取失败，再读取第二个 NV Block 的数据。只要其中一个 NV Block 读取成功，则读数据成功，用户可以使用 RAM Block 中的数据。如果第一个 NV Block 读取成功，则不会再读取第二个 NVBlock 的数据。

### Dataset Block

Dataset Block 可以具备多个 NV Block 和 ROM Block，具体的数量限制与用户配置的NVM_DATASET_SELECTION_BITS 有关系。

假设 NVM_DATASET_SELECTION_BITS 为 n，n 小于等于 8。则 NV Block 的个数范围为0 ~ 2^n，而 ROM Block 的个数范围为 0 ~（256-2^n），NV Block 的个数与 ROM Block 的个数总和不能超过 2^n。

在访问 Dataset 类型的 Block 之前，必须先调用 NvM_SetDataIndex 设置目标的 DataIndex，DataIndex 的范围必须注意下述条件：

1. DataIndex 不超过 NV 和 ROM Block 的总和；
2. 假设配置了 m 个 NV Blocks，n 个 ROM Blocks，则 0 ~ (m-1)是 NV Block 的 Index 范围，m ~ (m+n-1)是 ROM Block 的 Index 范围。

### Read/Write Retry

在 Write 和 WriteAll 请求执行过程中，若对某个 Block 的写入失败，且该 Block 配置的写重试次数不为 0，则 NVM 会再次尝试对该 Block 进行写入，直到尝试次数超过用户配置的Retry次数阈值。

&emsp在 Read 和 ReadAll 请求执行过程中，若对某个 Block 的读取失败，且该 Block 配置的读重试次数不为 0，则 NVM 会再次尝试对该 Block 进行读取，直到尝试次数超过用户配置的Retry次数阈值。

### NvM_GetErrorStatus

NvM_GetErrorStatus是一个经常被使用到的函数，通过调用这个函数可以获取当去NvM模块的当前状态，具体如下：

| 请求结果                  | 描述                                                         |
| ------------------------- | ------------------------------------------------------------ |
| NVM_REQ_OK                | 默认状态，上一次工作成功完成。                               |
| NVM_REQ_NOT_OK            | 1. 任意请求中，调用下层 MemIf 接口返回 E_NOT_OK，或下层请求结果为 MEMIF_JOB_FAILED。<br>2. 在 WriteAll 和 ReadAll 中，如果有任意一个 Block 的执行结果不是非错误结 果 之 一 ， 则 WriteAll 和 ReadAll 的 结 果 为NVM_REQ_NOT_OK。 <br>3. 对于使能了同步镜像机制的 Block，如果调用同步回调函数返回E_NOT_OK ， 且 错 误 次 数 超 过 限 制 ， 则 也 会 上 报 该NVM_REQ_NOT_OK。 |
| NVM_REQ_PENDING           | 工作处于队列中，或正在执行。                                 |
| NVM_REQ_INTEGRITY_FAILED  | Read 或 ReadAll 中，检测到下述情况，且无隐性恢复默认数据： <br>1. CRC 校验失败; <br>2. 下层请求结果为 MEMIF_BLOCK_INCONSISTENT |
| NVM_REQ_BLOCK_SKIPPED     | 在 ReadAll 或 WriteAll 或 ValidateAll 中，该 Block 被跳过。  |
| NVM_REQ_NV_INVALIDATED    | Read 或 ReadAll 中，下层请求结果为 MEMIF_BLOCK_INVALID。如果读取冗余 Block，该结果表明两个 NV Block 读取的结果均为MEMIF_BLOCK_INVALID。 |
| NVM_REQ_CANCELLED         | 1. 调用 NvM_CancelJobs 被取消的 Block; <br>2. 调用 NvM_CancelWriteAll 被取消的 Block; <br>3. 任意请求执行过程中 ， 下层请求结果为NVM_REQ_CANCELLED. |
| NVM_REQ_REDUNDANCY_FAILED | 未使用。                                                     |
| NVM_REQ_RESTORED_FROM_ROM | Block 恢复了默认数据，包括隐性和显性恢复。                   |
| NVM_REQ_BUSYING           | 未使用。                                                     |
| NVM_REQ_WRONGID           | Read 或 ReadAll 中，BlockID 检查失败，且无隐性恢复默认数据。 |
| NVM_REQ_MIRROR_OP_FAILED  | 未使用。                                                     |
| NVM_REQ_VERIFY_FAILED     | Write 或 WriteAll 中，数据回读校验失败。                     |
| NVM_REQ_CFGID_MISMATCH    | 未使用。                                                     |

### 与BswM模块的交互

在前面介绍BswM模块中提到了，BSW层模块可以给BswM模块发送Mode Request和Mode Indication，而NvM模块则可以在下面情况下去给BswM模块发送Mode Indication：

1. 当 SingleJob 进入队列时，调用 BswM_NvM_CurrentBlockMode（Pending）；
2. 当 SingleJob 工作结束时，调用 BswM_NvM_CurrentBlockMode，状态由本次工作的结果决定；
3. 当 SingleJob 工作被取消时，调用 BswM_NvM_CurrentBlockMode（Cancel）；
4. 当 MultiJob 进入队列时，调用 BswM_NvM_CurrentJobMode（Pending）；
5. 当 MultiJob 工作结束时，调用 BswM_NvM_CurrentJobMode，状态由本次工作的结果决定；
6. 当 WriteAll 工作被取消时，调用 BswM_NvM_CurrentJobMode（Cancel）。

### MemIf模块

上面提到了一个NvM模块Block会对应一个或者多个Fee和Ea模块Block，而MemIf模块就是将这两种位于不同层的Block对应起来，即实现Block Handle和Block ID的对应关系。在这里就不多做介绍了，非常简单。

# 代码部分

代码分成三个部分：

1. Tp
2. Dcm
3. Dem

## TP





 













































































