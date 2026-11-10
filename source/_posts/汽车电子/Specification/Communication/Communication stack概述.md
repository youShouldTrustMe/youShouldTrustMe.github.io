---
title: Communication Stack概述
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 概述

**Communication stack**包括以下三个大模块：

1. Communication Service
2. Communication Hardware Abstraction
3. Communication Drivers

Communication Stack主要承载了ECU的通信功能，例举一下汽车电子通信网络中的几大总线，CAN, LIN, FlexRay，以太网。所以不难想象Communication Stack必须要针对这四大总线实现它们的驱动以及相关常见协议栈，比如说CAN的UDS，以太网的TCP/IP等。整个Communication Stack的结构如下图所示：

![Communication stack结构](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251211083119069.png)



仔细观察四大总线的消息传递路径，可以发现在AUTOSAR架构中基本上都大同小异，对于接收消息而言，四大总线上的消息大多都是先由MCAL层中的Driver，然后传输到位于ECU抽象层的Interface，Interface层会根据消息类型进行分配最后再传输到该消息对应的服务层，对于发送则是一个相反的过程。

# 通信过程

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

![AUTOSAR CAN通信过程](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/image-20251211085115455.png)



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