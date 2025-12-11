---
title: Flash

cover: https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/15_19_15_51_202410151915559.png
categories: 
  - 嵌入式
tags:
  - 外设组件
---



# 概述

实际上，嵌入式系统可以类比PC，他们之间的对应关系如下：

| **嵌入式芯片组件 (Embedded Chip)**              | **个人电脑组件 (PC)**                           | **作用/功能描述**                                            |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| **Flash** (e.g., NOR/NAND Flash)                | **硬盘 (HDD) / 固态硬盘 (SSD)**                 | **存储程序代码和长期数据**。它是非易失性的，即使断电，数据也不会丢失。这是芯片的“记忆”。 |
| **CPU / Core**                                  | **中央处理器 (CPU)**                            | 执行指令，进行计算和控制。这是芯片的“大脑”。                 |
| **RAM** (Random Access Memory, e.g., SRAM/DRAM) | **内存条 (RAM)**                                | **存储运行时数据和变量**。它是易失性的，断电即丢失。这是芯片的“工作台面”。 |
| **外设 (Peripherals)**                          | **输入/输出设备 (I/O) / 专用卡** (如显卡、网卡) | 处理特定任务，如通信 (UART, SPI, I2C)、定时、模数转换等。是芯片与外界交互的“手脚”。 |

- 读写FLASH的用途：
  - 利用程序存储器的剩余空间来保存掉电不丢失的用户数据
  - 通过在程序中编程(IAP),实现程序的自我更新
- 在线编程(ln-Circuit Programming-ICP)用于更新程序存储器的全部内容，它通过JTAG、SWD协议或系统加载程序(Bootloader)下载程序
- 在程序中编程(ln-Application Programming-IAP）可以使用微控制器支持的任一种通信接口下载程序

# 构成

从大到小的单元排序如下：

1. **存储单元（Cell）**：本质上是1个浮栅晶体管（Floating Gate Transistor），通过 trapped electrons（被困电子）存储1bit（SLC）或多bit（MLC/TLC）
2. **页（Page）**：由多个Cell串联成行（如512B = 4096个bit）。页是最小写入单位，即使只改1字节，也要整页重写
3. **块/扇区（Block/Sector）**：多个Page组成的物理擦除单元，实际上，扇区是最小擦除单位，擦除时必须整块清空
4. **平面（Plane）**：多个块组成的并行操作单元（多见于大容量NAND）
5. **阵列（Mat/Array）**：是最大单元，所有存储块的集合。

> [!note]
>
> 注意：有些芯片支持的最小擦除单元是页，有的最小擦除单元是扇区。一般来说最小擦除单元是扇区，最小编程单元是页。
>
> 并且需要注意的是，Flash都需要先擦后写的🙉

Flash 页（page）大小为 512 字节，每 4 个页组成一个 2K 字节的扇区（sector）。芯片的存储系统如下：

![存储系统](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251204202541966.png)

由上图可知，Flash的地址从0到0x40000，以上芯片Flash 容量为 64K*32，即 256KB；阵列组织格式包含 page(512B)、sector(2KB)、
mat(256KB)。main array 共包含 512 个页，另有 4 个信息页。Flash 支持页擦、扇区擦和全擦。

除却Flash，还有一些特殊的页：

| 区域   | 说明           | 用途                                                         |
| ------ | -------------- | ------------------------------------------------------------ |
| LDT0页 | 原厂数据区     | 不对外开放，保存原厂的调校信息、模式字、测试数据等；软件只读 |
| LDT1页 | 用户选项数据区 | 用户选项字节（OPTBYTES）                                     |
| RED页  | 冗余信息       | 保存用于失效扇区替换的信息                                   |
| IF页   | Information 区 | 4个page共2KB，供用户使用；软件可以读写                       |

## LDT1页

LDT1为用户配置信息区，主要用于保存用户选项字节和Flash锁定信息。LDT1仅能使用SWD改写，即用户通过编程器改写。LDT1的总线地址是0x1FFF_FC00~0x1FFF_FDFF，执行flash全擦后，才能擦除LDT1。

在出厂时，用户通过 SWD 接口可以任意改写 OPTBYTES；但是一旦 ACLKEN 或 DBRDP被使能，用户必须通过 SWD 全擦 flash 后才能重新改写 OPTBYTES。LOCK 信息用于配制 Flash 内容保护，以 8KB block 为单位进行访问权限保护。

## Information页

### information 3

Flash还包含4个information页，其中information3用于控制Boot Swap功能。Information3总线地址是0x0004_0600~0x0004_07FF；

在LDT1中BOOT SWAPEN=0x55的前提下，可以通过INFO3中最低地址数据内容来进行Boot Swap操作。当数据为0x5454_ABAB时，芯片将Flash最低两个8KB空间的逻辑地址互换（注意，ACLOCK只按照逻辑地址处理，不考虑实际物理地址），从而实现启动代码无风险升级。Boot Swap示意图如下：

![Boot swap](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209193351468.png)

其主要目的是，防止在系统更新启动代码时出现意外中断（停电、异常复位等），如果此时原来的启动代码已经被擦除，将导致芯片重启后无法正常运行。

实现Boot Swap功能后，假设启动代码占据0000~ 1FFF共8KB空间，系统升级时应先将新的启动代码写入2000~ 3FFF地址，然后使能Boot Swap。此时有几种可能性：

- 芯片擦写2000~3FFF地址时掉电，由于原来的启动代码不会被擦除，不会影响重启
- 芯片成功写入boot program1，然后使能boot swap并执行软复位，芯片重启后将执行boot program1
- 芯片擦写boot program0时掉电，由于boot program1已经写入，将不影响后续运行

推荐应用按照如下步骤升级：

1. 更新application program

2. 如需升级boot，先将新的boot程序写入第二个8KB空间

3.  配置INFO3，使能Boot Swap

4. 执行软复位，重启后执行新的boot程序

5. 将第二个8KB空间改写为新的应用程序

   > [!note]
   >
   > 注意：IF3 的Boot Swap 功能实际只用到本页的最低一个word，其余地址空间开放读写（无特定功能），软件或Debugger 都可以任意写入数据。

### Information1~2 页

这2个information页开放给用户使用，仅SWD可以擦写，软件可读。总线地址是0x0004_0200~0x0004_05FF，低地址为IF1，高地址为IF2，总共1KB。

IF2~1这2个页各自的最高地址字节为页锁定标志，如果SWD将最高地址字节改写为0x55，则芯片复位后当前页被禁止编程，SWD进行页擦后，可以重新编程。不论是否有锁定标志，这几个页都是SWD和软件可读的。

### Information0 页

IF0是一个OTP页，这个页用户通过SWD或程序只能编程一次，编程后不能擦除或改写。IF0的总线地址是0x0004_0000~0x0004_01FF，共512字节。对IF0 page的读取没有任何限制。

# Flash编程

对FLASH的核心操作就是==读==和==写==。

> [!IMPORTANT]
>
> FLASH的物理特性：只能写0，不能写1，写1靠擦除。

对Flash有以下的方法可以进行编程：

- 在系统编程（ISP）：通过 FMSH 专用编程器或者 KEIL 等编译器的用户界面实施芯片编程，使用 SWD 接口
- 在应用编程（IAP）：通过 bootloader 代码实现芯片自编程，用户可定义任意串口，可用于实现程序在线升级

编程前必须对 Flash 进行擦除，禁止对未经过擦除的 flash 地址进行重复编程。Flash 支持三种擦除操作：

1. 全擦
2. 扇区擦
3. 页擦

> [!note] 
>
> 注意：如果在flash 编程和擦除期间发生芯片复位、或电源电压跌落至芯片最低工作电压以下，将无法保证flash 中数据的正确性和完整性。



## 擦写方法

Flash 擦写前须进行 Key 校验，写入顺序错误或写入值错误，或者在 Flash Key 验证正确之前就进行擦除或编程 Flash 操作将会进入错误状态，并产生相应中断。Flash Key 认证错误之后将禁止擦写Flash 直到下一次复位。而在正常擦写完成后，向 KEY 寄存器写入任意值都会使状态机返回初始的写保护状态。状态转换如下图：

![擦写Key认证](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209194923766.png)









































