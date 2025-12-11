---
title: ADC

cover: https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/07/9_9_7_4_202407090907138.png
categories: 
  - 嵌入式
tags:
  - 外设组件
---



# ADC简介

Analog-to-Digital Converter的缩写。指模/数转换器或者模拟/数字转换器。是指将**连续变量的模拟信号转换为离散的数字信号的器件。**典型的模拟数字转换器将模拟信号转换为表示一定比例电压值的数字信号。

> [!tip]
>
> 各个芯片的外设属性均不一样，以下仅代表其中一个芯片型号的ADC功能，但各家的功能都大差不差。

# 原理

## 常见ADC类型

| **ADC电路类型** | **优点**         | **缺点**                 |
| --------------- | ---------------- | ------------------------ |
| **并联比较型**  | 转换速度最快     | 成本高、功耗高，分辨率低 |
| **逐次逼近型**  | 结构简单，功耗低 | 转换速度较慢             |

## 并联比较型

将输入的参考电压和模拟电压输入进行比较，比较器会输出0或1从而获得二进制的数字量

![并联比较型](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251128155931854.png)

## 逐次逼近型

![逐次逼近型](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251128160110838.png)



# 外设详解

## 结构框图

![ADC原理框图](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201085552094.png)

![结构框图](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251128162249955.png)

## 输入通道

ADC的信号输入通过通道来实现的，信号通过通道输入到单片机中，单片机经过转换后，将模拟信号转换为数字信号。以上框图中的输入通道为：

| 通道        | 10   | 说明                                                         |
| ----------- | ---- | ------------------------------------------------------------ |
| ADC_IN0     | PD11 | 外部快速通道，单端或差分输入 其中差分对组合关系如下：<br>ADC_IN0-ADC_IN7<br>ADC_IN1-ADC_IN8 <br>ADC_IN2-ADC_IN9<br>ADC_IN3-ADC_IN10<br>ADC_IN4-ADC_IN11<br>ADC_IN5-ADC_IN12<br>ADC_IN6-ADC_IN13 |
| ADC_IN1     | PD1  | :                                                            |
| ADC_IN2     | PD3  | :                                                            |
| ADC IN3     | PD5  | :                                                            |
| ADC IN4     | PA13 | :                                                            |
| ADC IN5     | PA0  | :                                                            |
| ADC IN6     | PC7  | :                                                            |
| ADC IN7     | PD0  | :                                                            |
| ADC IN8     | PD2  | :                                                            |
| ADC _IN9    | PD4  | :                                                            |
| ADC_IN10    | PD6  | :                                                            |
| ADC C_IN11  | PA14 | :                                                            |
| ADC_ C_IN12 | PA1  | :                                                            |
| ADC_ C_IN13 | PC8  | :                                                            |
| ADC_IN14    | PC9  | 外部慢速通道，单端输入                                       |
| ADC_IN15    | PC10 | :                                                            |
| ADC_IN16    | PC11 | :                                                            |
| ADC_IN17    | PC12 | :                                                            |
| ADC_IN18    | PD10 | :                                                            |
| ADC_IN19    | PE9  |                                                              |
| VBAT/3      | N/A  | VBAT采样通道                                                 |
| VDD/3       | :    | VDD采样通道                                                  |
| VREF1P2     | :    | 内部1.2V基准源采样通道                                       |
| TS          | :    | 温度传感器采样通道                                           |
| AVREF       | :    | 内部1.0V基准源采样通道                                       |
| DAC         | :    | DAC输出采样通道                                              |
| OPA         | :    | 运放输出采样通道                                             |

有些芯片是支持两种不同的输入的：

1. 单端输入
2. 差分输入

### 单端输入

单端模式下 ADC 转换的是单个输入引脚对地的电压值，输入幅度范围是 0~+VREF+。为了避免可能的波形削顶风险导致输入失真，一般建议输入信号最大幅值不超过 0.95*VREF+。

![ADC单端输入](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201091756528.png)

### 差分输入

差分输入模式下，ADC 转换的是差分输入引脚对 VIN+和 VIN-之间的差值，输入信号为(VIN+) –(VIN-)，输入范围是-VREF~+VREF。使用差分输入方式，可以获得更好的共模噪声抑制效果，因此当被采样信号源远离 ADC 输入引脚时，推荐使用差分对方式提高信噪比。

![ADC差分输入](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201092054502.png)

其中差分模式码字与输入信号电平的对应关系：
$$
（ADC 转换值-2048）*LSB*2 = (VIN+)–(VIN-)
$$
转换之后差分输入信号与码字的关系为：

![差分输入信号与码字的关系](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201092500644.png)

## 参考电压

ADC可以使用VDDA或VREFP作为参考电压。

### 使用VDDA

ADC 一般使用电源电压作为基准电压，在电源电压发生变化时，特定输入信号电平对应的转换值也会发生变化。为了能够得到准确的绝对电压，可以由两种解决方案。

1. 使用高精度内部基准作为参考信号

   1. 首先芯片 Flash 中保存了 30℃ 环境温度下 VDDA=3.0V 条件下测量 VREF1P2 电压得到的转换值

   2. 芯片实际应用中，由于不知道当前VDDA 电压，ADC 先测量VREF1P2 得到转换值VREFINT_DATA；通过以下公式可以得到当前实际的 VDDA：
      $$
      VDDA=\frac{VREFINT\_CAL}{VREFINT\_DATA}\times3V
      $$

   3. 假设 ADC 对某个输入通道的采样值为 ADC_DATA，通过以下公式可以得到当前某个输入通道的实际电压（12bit 输出）:
      $$
      V_{CHANNEL}=\frac{VREFINT\_CAL\times ADC_{-}DATA}{VREFINT_{-}DATA\times4095}\times3V
      $$

   4. 采用这个方式，不需要知道每颗芯片 VREF 的实际电压值，仅需计算当前 VREF1P2 采样值和出厂测试值的比例；但是需要保证测试时 VDDA 的电压精度和温度精度，以尽可能减小误差

   5. 注意到 VREFIN_CAL 是 3V 参考电压下 1.22V 的转换值，那么这个值应该在 1665 附近，即 11bit无符号有效值，ADC_DATA 是 12bit 无符号数，VREFINT_CAL*ADC_DATA*3 最大为 25bit；VREFINT_DATA 最大转换值为 1.8V 下的 1.22V 即 2775 左右，相当于 12bit 无符号数，所以VREFINT_DATA*4095 最大为 24bit，通过 32bit 除法可以实现计算。

2. 使用快速内部基准作为参考信号
   芯片内部还有一个快速建立的内部基准源，其输出电压是 1.0V，并且每颗芯片出厂时都经过校准，常温下精度为 1.0V+/-0.5%。相对 VREF1P2，快速基准源的启动速度很快，典型条件下可以在 5us内完成启动和输出电压建立，而 VREF1P2 需要 1ms 以上。但是快速基准源的精度受温度影响相对较大，全温区变化可以达到+/-4%，因此适用于对绝对精度要求不高的场合。

   1. ADC 采样并转换快速基准输出，并通过以下公式换算 VDDA 电压（假设 ADC 采样快速基准源的 12 位转换结果是 BGQS_DATA）：
      $$
      VDDA=\frac{4095}{BGQS\_DATA}\times1.0V
      $$

   2. 假设 ADC 对某个输入通道的采样值为 ADC_DATA，通过以下公式可以得到当前某个输入通道的实际电压（12bit 输出）
      $$
      V_{CHANNEL}=\frac{ADC_{-}DATA}{BGQS_{-}DATA}\times1.0V
      $$

### 使用VREFP

要知道，转换后的数据是一个12位的二进制数，我们需要把这个二进制数代表的模拟量（电压）用数字表示出来。比如测量的电压范围是0~VREFP ，转换后的二进制数是`ADC_DATA`，因为12位ADC在转换时将电压的范围大小（也就是VREFP ）分为4096（$2^{12}$）份，所以转换后的二进制数和真实电压之间的关系就是：
$$
V_{CHANNEL}=\frac{ADC\_DATA}{4095}\times VREFP
$$

## 工作时序

ADC 有 offset 校准和正常工作两种时序。

### 校准时序

上电后建议先进行一次校准，以获得更好的性能。校准后无需重新校准，除非芯片发生全局复位，或者电源电压、温度发生较大变化。

- Offset 校准通过软件置位 CALEN 启动。
- 校准过程包含多个采样转换周期，周期数由 OSCAL_CYCLE 寄存器配置，一般推荐使用默认配置，即完成校准需要 64个 ADCCLK 周期。
- 校准完成后置位 EOCAL 标志寄存器。

![ADC校准时序](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201093022033.png)

### 采样转换时序

- 采样转换时，通过 SOC 信号启动 ADC 采样。
- SOC 高电平宽度控制了 ADC 采样时间，SOC 变低后启动转换，转换周期为 14 个 ADC_CLK 周期，采样时间可配置，最短 2 个 ADC_CLK，最长 512个 ADC_CLK。
- ADC 采样转换完成后产生 EOC（End of Conversion）信号，ADC 控制器在采样 EOC后置位 EOC 标志寄存器，并且可以根据配置产生中断事件或 DMA 请求。

![ADC转换时序](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201093619441.png)

### 采样时序

多通道转换序列的时序如下。

- ADC 对所有使能的输入通道依次完成一轮采样转换，成为一个转换序列。
- 当所有使能的输入通道都被依次采样转换过后，ADC 控制器置位 EOS（End of Sequence）标志寄存器，并可以根据配置产生中断事件。

![ADC采样时序](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251201093432296.png)





## 转换模式

ADC 支持以下转换模式：

1. 单次转换
   1. 半自动触发（SEMI-AUTOMATIC）
   2. 全自动触发（AUTOMATIC）
2. 连续转换

转换启动可以由软件或事件触发，通过寄存器选择多个事件触发源。

### 单次转换

单次转换是指 ADC 完成一个转换序列后自动停止采样（但是 ADC 仍然是保持使能的），等待新的触发事件到来。单次转换支持半自动触发和全自动触发两种方式。

1. 全自动触发模式：软件或硬件触发事件启动 ADC 转换后，ADC 会顺序采样所有被使能的通道，单个通道采样完成后，EOC（End of Conversion）标志置位，所有通道采样完成后，EOS（End ofSequence）标志置位，本次转换结束。

   1. 假设通道 0、3、5 被使能

   2.  触发事件：通道 0、3、5 被顺序采样，过程中产生三次 EOC，最终产生 EOS

   3. 触发事件：重复上述过程

      ![ADC单次转换全自动触发模式](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202083710278.png)

2. 半自动触发模式：软件或硬件触发事件只会让 ADC 启动一次，转换一个使能通道。比如通道 0、3、5 被使能

   1. 触发事件：通道 0 被采样，产生 EOC

   2. 触发事件：通道 3 被采样，产生 EOC

   3. 触发事件：通道 5 被采样，产生 EOC 和 EOS

   4. 触发事件：通道 0 被采样，产生 EOC

   5. 触发事件：通道 3 被采样，产生 EOC

      ![ADC单次转换的半自动触发模式](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202083945396.png)

### 连续转换

触发事件到来后，所有使能通道被采样，并且 ADC 不会自动停止，而是循环采样，直到软件停止ADC。

![连续转换](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202084137636.png)

每个通道被采样后，数据保存在 ADC_DATA 寄存器中，软件要在下次转换前及时读走数据，或者通过 DMA 进行数据搬移。如果不能及时取走数据，将引起 Overrun，置位 overrun 标志，并可以发出中断。

## 触发源

ADC转换的输入、通道、转换顺序都已经说明了，但ADC转换是怎么触发的呢？就像通信协议一样，都要规定一个起始信号才能传输信息，ADC也需要一个触发信号来实行模/数转换。

1. 软件触发，可以通过设置特定的寄存器来触发转换，具体配置请参考芯片的数据手册

2. 硬件触发

   ![ADC转换硬件触发源](https://gitee.com/you-trust-me/pictures/raw/master/Images/image-20251202084853070.png)

   > [!note]
   >
   > 注意：硬件触发源输入后经过APBCLK 同步采样，因此使用硬件触发功能时必须使能ADC总线时钟（置位CMU 模块中的ADC_PCE 寄存器）。如果 ADC正处于转换过程中，此时到来的触发信号会被忽略。
   >
   > | 触发源       | 时钟域 | 当ADC工作时钟选择为 APBCLK时的触发延迟 (TAPBCLK) | 说明                      |
   > | ------------ | ------ | ------------------------------------------------ | ------------------------- |
   > | 软件触发     | APBCLK | 3.5                                              | 可实现同步触发， 确定延迟 |
   > | LUTX_TRGO    | :      | 4.5                                              | :                         |
   > | GPTIMX_TRGO  | :      | 4.5                                              | :                         |
   > | COMPX_TRGO   | :      | 4.5                                              | :                         |
   > | ATIM TRGO    | 其他   | 2~3                                              | 异步时钟触发              |
   > | BSTIM16_TRGO | :      | :                                                | :                         |
   > | LPTIM16_TRGO | :      | :                                                | :                         |
   > | RTCA TRGO    | :      | :                                                | :                         |



## 数据寄存器

当使用ADC独立模式（也就是只使用一个ADC，可以使用多个通道）时，数据存放在低16位中，当使用ADC多模式时高16位存放ADC2的数据。需要注意的是ADC转换的精度是12位，而寄存器中有16个位来存放数据，所以要规定数据存放是左对齐还是右对齐。

当使用多个通道转换数据时，会产生多个转换数据，然鹅数据寄存器只有一个，多个数据存放在一个寄存器中会覆盖数据导致ADC转换错误，所以我们经常在一个通道转换完成之后就立刻将数据取出来，方便下一个数据存放。一般开启DMA模式将转换的数据，传输在一个数组中，程序对数组读操作就可以得到转换的结果。

# 实验

使用ADC的步骤

电位器作为ADC输入

1. 确定ADC挂载在哪个总线上，并开启ADC的时钟
2. 配置与ADC通道相对应的GPIO引脚为模拟输入模式
3. 配置规则组通道，包括通道号、顺序和采样时间
4. 设置ADC的工作模式、数据对齐方式 、外部触发源、通道数量等参数
5. 使能ADC
6. 校准ADC

```c
void adc_init(void)
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC3,ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOF,ENABLE);
	RCC_ADCCLKConfig(RCC_PCLK2_Div6);
	
	GPIO_InitTypeDef GPIO_InitStruct;
	GPIO_InitStruct.GPIO_Pin = ADC_PIN;
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AIN;
	GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
	
	GPIO_Init(ADC_PORT,&GPIO_InitStruct);

	ADC_RegularChannelConfig(ADC3,ADC_Channel_4,1,ADC_SampleTime_55Cycles5);	//配置规则通道组，填充菜单列表
	
	ADC_InitTypeDef ADC_InitStruct;
	ADC_InitStruct.ADC_ContinuousConvMode = DISABLE;
	ADC_InitStruct.ADC_DataAlign = ADC_DataAlign_Right;
	ADC_InitStruct.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None;	//软件触发
	ADC_InitStruct.ADC_Mode = ADC_Mode_Independent;
	ADC_InitStruct.ADC_NbrOfChannel = 1;
	ADC_InitStruct.ADC_ScanConvMode = DISABLE;
	ADC_Init(ADC3,&ADC_InitStruct);
	
	ADC_Cmd(ADC3,ENABLE);
	
	//开始校准
	ADC_ResetCalibration(ADC3);	//复位校准
	while(ADC_GetResetCalibrationStatus(ADC3) != RESET);	//等待复位校准完成
	ADC_StartCalibration(ADC3);	//开始校准
	while(ADC_GetCalibrationStatus(ADC3) == SET);//等待校准完成

}

u16 ad_getValue(void)
{
	ADC_SoftwareStartConvCmd(ADC3,ENABLE);
	while(ADC_GetFlagStatus(ADC3,ADC_FLAG_EOC) == RESET);	//等待转换完成，也就是EOC信号
	return ADC_GetConversionValue(ADC3);	//读取完数据将会自动清除数据位
}


int main(void){
	
	char str[50];
    
	serial_init(); 
	adc_init();	
	
	while(1){
		sprintf(str,"read: %u\n ",ad_getValue());
		send_string(str);
		Delay_ms(1000);
	}
}

```

