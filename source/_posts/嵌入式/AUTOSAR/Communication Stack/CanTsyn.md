---
title: CanTsyn
draft: true
categories:
  - 嵌入式
tags:
  - AUTOSAR
---

# 时间同步的引入

时间同步有啥用呢？就拿现在爆火的ADAS来说，域控制器需要融合雷达，摄像头等传感器的数据，然后进行算法融合所有传感器的数据后最终才能进行判断和执行，这个时候就存在一个问题，因为传感器数据并不都是来源于同一个ECU，所以就需要一个手段来保证域控融合的所有传感器数据都是产自同一时刻，所以传感器在向域控制器发送传感数据时都需要加上一个时间戳，所以让车上所有的ECU里面的时间戳都保证一模一样就成了必要的事情。

而CanTsyn模块就是基于CAN总线的时间同步方案，所以它的功能也是非常的简单，就是接收一些时间同步报文，然后根据报文中包含的时间信息获取当前时间。

这里多说一句，还有在Ethernet总线上的负责时间同步的模块叫做EthTSyn模块，这个模块其实就是基于PTP (Precision Time Protocol)协议搞出来的，有的朋友可能还知道gPTP，gPTP其实是PTP协议的一个子集，而EthTSyn模块则是针对汽车应用基于PTP还额外做出一点点改变，感兴趣的朋友可自行搜索一下。

# 时间同步的角色

时间同步框架如下图所示：

![时间同步的角色](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_17_55_%E6%9A%82%E5%AD%98.png)



1. Time Domain：表示哪些组件（例如节点，通信系统）链接到某个时基。一个时域可以没有、包含一个或多个子时域。如果时域的时序层次结构中不包含时间网关，即所有节点都连接到同一总线系统，则不存在子时域。
2. Time Subdomain：表示哪些组件（例如节点)链接到某个时基，范围仅限于一条通信总线。
3. Global Time Master： 在整个Time Domain中提供全局时钟基准的主时钟。
4. Time Master：在同一个Time Subdomain中提供全局时间基准的主时钟。
5. Time Gateway：在整个Time Domain中既作为上级时钟源的从时钟，又同时作为下级时钟源的主时钟源。
6. Time Slave：在一个Time Subdomain中作为需要同步的从时钟。

#  时间同步过程

基于CAN总线的时间同步过程从下至上可分为CANDrv、CanIf、CanTsyn、StbM四个模块，如下：

![时间同步过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_21_22_%E6%9A%82%E5%AD%98.png)



其中CanTsync模块负责时间同步实现，而StbM则负责抽象基于不同传输介质的AUTOSAR时间同步协议，为整个软件系统来提供时间同步之后的全局时间戳。其他总线原理和过程一样，下面就以CanTsync模块为例说明一下时间同步过程。

## 四种报文

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

## 时间同步过程

CanTsyn模块的时间同步过程如下图所示：

![can的时间同步过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/07/31_8_29_27_%E6%9A%82%E5%AD%98.png)



1. TM节点在t0r时刻调用接口发送SYNC信号，SYNC信号中包含当前时间戳为s(t0r)，在t1r时刻SYNC信号发送完成，此时的时间为t1r，所以从TM开始发送报文，到发送成功需要时间t4r = t1r - t0r; 此时TM节点再次发送FUP信号，信号中包含的时间信息为t4r = t1r - t0r。
2. TS节点在t2r时刻接收到了SYNC报文；在t3r时间接收到了FUP报文。
3. 根据以上信息，TS节点在接收完SYNC和FUP报文的时候，即可根据下面的式子算出当前时间：real time = t3r-t2r+s(t0r)+t4r。

对于CanTsyn模块的基本原理就说到这里了，其实还有很多小细节没有涉及到，比如Sequence Count的检查， OVS处理， CRC校验等，感兴趣的朋友可以参考文章：[《AUTOSAR基础篇之CanTsyn》](https://blog.csdn.net/wto9109/article/details/126475417)。