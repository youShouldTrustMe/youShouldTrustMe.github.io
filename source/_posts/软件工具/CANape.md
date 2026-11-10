---
title: CANape

categories: 
  - 软件及工具
---

# 参考链接

https://gitcode.com/Open-source-documentation-tutorial/6529f/blob/main/CANape%E6%95%99%E7%A8%8B%EF%BC%9A%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A.pdf

# CANape 工具详解

## CANape 工具基本应用

### 标定基础

标定工具通过 CCP/XCP 等通讯方式与 ECU 连接，从而修改ECU内部参数的过程叫标定。读取ECU内部参数值，叫做测量。也可以通过外部设备测量 ECU 的参数。

![基础标定](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110193651128.png)

标定工具要连接ECU需要

1. 通讯方式，如 CAN、Lin等，见下图 MC1；
2. 标定协议（集成在 ECU 内部），如 CCP/XCP 等。另外，在标定过程中还需要一个 A2L 文件来描述 ECU内部的变量情况，见下图 MC2。A2L 文件也叫做标定数据库，存放着参数的地址；
3. 参数的十六进制与十进制（物理）值的转换关系。下图中的 MC3 接口是标定工具与上层自动化工具的接口。

![标定工具连接的必要条件](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110193748230.png)



### 主要功能

CANape 主要功能包括：ECU 内部变量的测量标定、获取 GPS 信息、音视频信息、数字量模拟量测量、数据记录，基于 XCP 的数据旁通。诊断测试，Flash 刷写标定参数。

![CANape的主要功能](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110193918341.png)

下图中间是 CANape 工具，左边是 ECU 及 CANape 支持的外围测量设备，红色为 Vector设备。

![CANape工具接口](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110193923558.png)

CANape 与 ECU 相连的方式有多种，基于 Lin 总线可以采用 XCP 协议；基于CAN总线可以采用 CCP、XCP 协议……。还可以通过 JTAG、以太网、USB、K 线等通讯方式。即CANape 可通过多种方式与ECU相连。

### 界面配置

#### 一般配置

1. 通道配置，通过【Device】→ Device config。或双击设备图标。

   ![device config](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110193942242.png)

2. 符号浏览器 Symbol Explorer，通过点击【Display】→ Symbol Explorer

   ![符号浏览器](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109065.png)

3. Device window，可以新建设备、从数据库新建设备、通过 MCD3 或 OBD 新建设备等。这里的“从数据库新建设备”中的数据库有以下几种：

   1. A2L：标定数据库

   2. CDD：诊断数据库

   3. DBC：通讯数据库

   4. LDF：Lin 通讯数据库

   5. XML：FleaxRay 数据库

      ![Device window](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109066.png)

   > [!tip]
   >
   >
   > Map 文件是制作 A2L 文件的参考。

#### Trace窗口

在 Trace 窗口右击→Configuration 可以进行界面设置。

![Trace窗口设置](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109067.png)

在“Column Configuration”中可以设置 Trace 窗口的各列都显示哪些内容。各列的顺序也可以在此处调整。

![Trace窗口各列的设置](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109068.png)

#### 标定参数设置

在左侧符号浏览器 Symbol Explorer 中，Device 下找到设备 VcuCCP，其中 A2L 下有标定量和测量参数。且 A2L 中的文件夹和 Simulink 模型中的 System 结构是相同的。

![标定参数结构](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109069.png)

> [!tip]
>
> 这里的VcuCCP是导入的a2l名称，导入不同的a2l命名应不同

这里每个文件夹代表一个子系统、参考子系统、模型引用。位于所有文件夹外的变量（下右图）是因为它们是模型中传播出来的 BUS 信号，且在当前层汇总到 BUS 上（下右图）。

![文件夹结构含义](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109070.png)



![模型变量](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109071.png)



可以直接将 Symbol Explorer 中 A2L 下的变量拖动到窗口区域。

![将A2L变量拖到窗口](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109072.png)

标定量可以放入 Parameter 窗口，可以设置一次增减的梯度、相乘的系数。标定量也可以放到 Graphic 窗口观测其当前值。

![设置标定量参数](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109073.png)

#### 测量列表配置

标定的同时往往需要测量，观察标定量和其他测量变量的实时结果。

1. 打开测量配置 Measurement Configration
   点击菜单栏【Start】下的→Measurement Configration，弹出测量配置窗口。可以在左侧“Measurement signals”中选择测量信号。

   ![测量配置](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109074.png)

2. 添加信号 Database selection

   在 Measurement Configration 窗口右侧信号列表空白处右击，或者单击窗口左侧工具栏中的 ![打开database窗口](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109075.png)即可打开信号数据库窗口 Database selection

   ![添加信号Database](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109076.png)

3. 数据库选择 Database selection 窗口

   是按照软件结构展现的。可以找到每个子系统下的变量

   ![数据库软件结构](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109077.png)

4. 一些图标工具含义

   Active：是否测量。测量周期（ms）。

   ![是否开启测量](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109078.png)

   若点击磁盘图标，可以取消所有变量的记录。

   ![取消变量记录](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109079.png)

5. 通过函数测量

   可以在 Measurement Configration 窗口右侧的 Functions 下，右侧窗口的空白处右击→Insert function。

   ![通过函数测量](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109080.png)

   其中对函数进行了分类。可以双击要选择的函数。

   ![函数分类](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109081.png)

   在下面对话窗设置要关联的信号，以及通过函数处理该信号后的新变量的名字。

   ![函数处理后新变量的名称](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109082.png)

   Simulations 激励、Bypass 旁通需要在 XCP 模式下才能使用。

   ![XCP模式下才能使用的功能](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109083.png)

6. Recorder List 数据记录列表

   Recorder记录器：可以通过宏定义方式自动设置记录文件名，比如：

   {RECORDER}_ {YEAR}_ {MONTH}_ DAY}_{HOUR}--{MINUTE}--{SECOND}.MDF

   ![数据记录列表](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109084.png)

   Option 选项：设置开始测量时执行的操作、是否将记录的文件自动切分等。

   ![Option选项](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109086.png)

   Bus logging 还可以同步记录 CAN 数据。
   若需要记录的数据很多，可以右击左侧的 Recorder List，添加新的 Recorder。

7. Event List 触发事件

   共分为 3 类事件：基于信号的、基于键盘的、基于系统的事件。可以在事件发生时

   ![Event类型](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109087.png)

   新建信号事件 SignalEvent 后，在 Recorder List 中的 Trigger 里就可以选择事件触发类型，并在 Events 列表中选择前面定义的事件作为开始或结束 Recorder 记录的条件。

   ![新建信号事件记录条件](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109088.png)

8. Audio Outputs 媒体输出

   在 Audio Outputs 窗口右侧空白处右击插入，可以设置媒体的提示类型，以及触发媒体播放的事件。

   ![Audio Outputs 媒体输出](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures/20261110194109089.png)



### 测量和标定

















































