---
title: DAC

cover: https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202085839348.png
categories: 
  - 嵌入式
tags:
  - 外设组件
---



# 参考链接

[【STM32】DAC详解_dac12bit-CSDN博客](https://blog.csdn.net/dengjin20104042056/article/details/108604920)

# 简述

DAC,全称：Digital-to-Analog Converter,指数字/模拟转换器。DAC 模块是 12 位电压输出数模转换器。

- DAC 可以按 8 位或 12 位模式进行配置，并且可与DMA 控制器配合使用。
- 在 12 位模式下，数据可以采用左对齐或右对齐。
- DAC 有两个输出通道，每个通道各有一个转换器。在 DAC 双通道模式下，每个通道可以单独进行转换；当两个通道组合在一起同步执行更新操作时，也可以同时进行转换。可通过一个输入参考电压引脚 V REF+ （与 ADC 共享）来提高分辨率。

> [!IMPORTANT]
>
> ADC和DAC是模拟电路和数字电路之间的桥梁

## 特性参数

1. 分辨率：表示模拟电压的最小增量，常用二进制位数表示，比如：8、12位等
2. 建立时间：表示将一个数字量转换为稳定模拟信号所需的时间
3. 精度：转换器实际特性曲线与理想特性曲线之间的最大偏差
   1. 误差源：比例系统误差、失调误差、非线性误差
   2. 原因：元件参数误差、基准电压不稳定、运算放大器零漂等

# 外设详解

![DAC结构框图](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202085839348.png)



> [!TIP]
>
> DAC输出引脚与普通GPIO复用，使用DAC输出功能前需要将相关引脚配置为模拟功能。
>
> | 引脚    | 类型         | 说明                        |
> | ------- | ------------ | --------------------------- |
> | VREFP   | 输入基准电压 | DAC工作基准，等于或低于VDDA |
> | VDDA    | 模拟电源     | DAC工作电源                 |
> | VSSA    | 模拟地       | DAC的参考地                 |
> | DAC_OUT | 模拟输出     | DAC输出信号                 |



## 工作时钟

DAC转换器使用APB时钟工作，数字码更新频率最高不能超过1MHz，否则无法保证良好的输出动态性能。DAC工作时钟来自于CMU模块，使用DAC之前必须正确配置时钟。

当DAC使能后，DAC有一个启动时间，经过tWAKEUP时间之后，DAC输出电压才会开始建立，软件或DMA将需要输出的数字码写入DHR寄存器。在连续输出模式下，DHR寄存器中的数字码将直接复制到DAC内部缓存中，并驱动DAC输出电平。在触发输出模式下，DHR寄存器中的数字码等待触发事件到来后，再更新到DAC内部缓存中。一旦数字码更新完成，DAC工作不再需要时钟。DAC工作时序示意图如下：

![DAC的工作时钟](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202191201567.png)

## 输出模式

DAC输出可以采用触发方式或连续方式。

- 在TRGEN（Trigger Enable）为1的情况下，当trigger信号到来时，DAC_DHR寄存器中的数据被传输到DAC内部缓存中，DAC才会更新DAC_OUT输出电压。
- 如果 TRGEN=0 ，则 软 件 对 DAC_DHR 寄存 器 的 写 操 作 将 同 时 被 映 射 到 DAC 内部 缓 存 中 ， 即DAC_OUT的输出电平将被实时改变。

下图为DAC连续输出模式。在连续模式下，软件更新DAC_DHR寄存器的频率不能高于1Mhz，否则输出无法保证正确建立。

![连续输出模式](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202191803164.png)

下图为DAC触发输出模式。触发输出模式下，触发事件到来的频率不能超过1Mhz，否则输出无法保证正确建立。

![触发输出模式](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202192640150.png)

## 触发源

DAC触发模式支持硬件触发或者软件触发。

通过TRGSEL寄存器，可以选择DAC使用的触发源，默认使用软件触发，软件可以通过对SWTRG寄存器写1实现DAC触发更新。当选择其他触发信号源时，DAC将检测输入触发信号的上升沿，并将DAC_DHR中的数据更新到DAC内部缓存中。

下表定义了TRGSEL不同配置对应的触发源。

| 触发源       | 类型               | TRGSEL[3:0] |
| ------------ | ------------------ | ----------- |
| SWTRG        | 软件触发           | 0000        |
| ATIM_TRGO    | 内部定时器触发信号 | 0001        |
| GPTIM1_TRGO  | ：                 | 0010        |
| GPTIM2_TRGO  | ：                 | 0011        |
| BSTIM16_TRGO | ：                 | 0100        |
| LPTIM16_TRGO | ：                 | 0101        |
| RFU          | -                  | 0110        |
| ：           | ：                 | 0111        |
| ：           | ：                 | 1000        |
| ：           | ：                 | 1001        |
| ：           | ：                 | 1010        |
| ：           | ：                 | 1011        |
| ：           | ：                 | 1100        |
| EXT[0]       | 引脚中断触发       | 1101        |
| EXTI[4]      | ：                 |             |
| EXTI[8]      | ：                 | 1110        |
| EXTI[12]     | ：                 | 1111        |



## 输出电压

DAC输出电压是在0~VREF+范围内对输入数字码的线性转换。DAC输出电压理论值由下式决定：
$$
DAC\_OUT=VREF\times\frac{DAC\_DHR}{4096}
$$
这里的4096是$2^{12}$









































