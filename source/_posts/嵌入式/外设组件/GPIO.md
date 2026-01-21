---
title: GPIO

cover: https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/07/5_8_55_52_202407050855539.png
categories: 
  - 嵌入式
tags:
  - 外设组件
---

# 端口的基本结构



![端口的基本结构](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209195818090.png)

1. 保护二极管：对输入电压进行限幅，当电压比3.3v高，那么上方的保护二极管将会导通，电流就直接流到VDD，不会进入内部电路
2. 施密特触发器：在施密特触发器的箭头前面是数字量，在施密特触发器的后面的是模拟量
3. P-MOS管和N-MOS管

简图为：

![端口基本功能简图](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209200820927.png)

# 输入输出模式

## 概述

输入输出都相对于ST芯片而言的，比如输入就是从io口进如芯片内部，输出就是信号从芯片到IO引脚

| **模式名称** | **性质** | **特征**                                           |
| ------------ | -------- | -------------------------------------------------- |
| 浮空输入     | 数字输入 | 可读取引脚电平，若引脚悬空，则电平不确定           |
| 上拉输入     | 数字输入 | 可读取引脚电平，内部连接上拉电阻，悬空时默认高电平 |
| 下拉输入     | 数字输入 | 可读取引脚电平，内部连接下拉电阻，悬空时默认低电平 |
| 模拟输入     | 模拟输入 | GPIO无效，引脚直接接入内部ADC                      |
| 开漏输出     | 数字输出 | 可输出引脚电平，高电平为高阻态，低电平接VSS        |
| 推挽输出     | 数字输出 | 可输出引脚电平，高电平接VDD，低电平接VSS           |
| 复用开漏输出 | 数字输出 | 由片上外设控制，高电平为高阻态，低电平接VSS        |
| 复用推挽输出 | 数字输出 | 由片上外设控制，高电平接VDD，低电平接VSS           |

## 浮空、上拉、下拉输入

![浮空、上拉、下拉输入](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209200145068.png)

> [!tip]
>
> 对于有些芯片而言，如果将GPIO口设置为输入，那么如果外部使其悬空，输入引脚波动会很大，可能会在-5v~5v之间来回跳动，导致芯片的电流会逐步增加（可能从uA增长到mA级别）。所以需要注意GPIO作为输入时，最好不要使其悬空。

## 模拟输入

![模拟输入](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209200236079.png)

模拟输入可以说是ADC模数转换器的专属配置

## 开漏、推挽输出

![开漏推挽输出](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209200535172.png)

## 开漏、推挽复用输出

![开漏、推挽复用输出](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251209200632547.png)



