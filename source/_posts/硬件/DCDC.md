---
title: DCDC

categories: 
  - 硬件
---



# 参考链接

[伏秒平衡 - 知乎](https://zhuanlan.zhihu.com/p/30094474063)

# 概述

DCDC即直流-直流转换器(DC-to-DC Converter)的英文缩写，开关电源是一种高频电能转换装置，主要**利用开关器件（MOSFET/晶体管），通过周期性控制开关器件的开关，实现对输入电压的脉冲调制，实现电压变换、自动稳压功能。**

DCDC转换器是输入、输出电压类型均为直流的一种开关电源；是一种在直流电路中将一个电压值的电能转换成另一个电压值的电能转换装置。**DCDC转换器类型分为：**

1. Buck降压型
2. Boost升压型
3. Buck-boost降压升压型

# BUCK降压型

## 基本工作原理

降压式（Buck）变换器是一种**输出电压≤输入电压**的非隔离直流变换器，Buck变换器的主电路**核心元件为**：

1. **功率开关S1**：通常使用MOSFET作为功率开关，用于**控制电路的开关状态**。MOSFET可以快速开关和关闭，以实现高效的能量转换。

2. **电感元件L**：电感是实现电压降低的关键，通常采用线圈或者电感器。

   - 当MOSFET导通时，电感充电；

   - 当MOSFET关闭时，电感放电，通过二极管向负载供电。

     这个过程中，**电感能够平滑电流的变化，减少电压波动**。

3. **电容元件C**：电容器用于**进一步平滑输出电压，减小电压波动**。它**能够吸收能量、并在需要时释放能量，帮助维持输出电压的稳定性和连续性**。选择合适的电容值对于保证电路性能至关重要。               

4. **二极管D**：通常是一个肖特基二极管（正向电压降低），用于保护MOSFET免受反向电压的损害。它的主要作用是在**MOSFET关闭期间提供一条电流路径，防止反向电压损坏MOSFET和其他电路元件。**                

5. **控制电路**：控制电路用于**监测和调整BUCK电路的输出电压**。它**根据反馈信号来控制功率开关的开关频率和占空比**，以确保输出电压稳定。    

   ![控制电路控制后的电压](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260329163040113.png) 

当开关进行开关时，表现不同：

1. 当开关管S1闭合时，**电感L被充磁储能，流经电感的电流线性增加，同时给电容C充电，给负载RL提供能量**，此时Vout电压缓慢上升，若S1一直闭合则最终Vout会近似等于Vin电压（S1有耗损压降）；

   ![S1闭合时](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260329161530724.png)

2. 当开关管S1关断时，**储能电感L通过续流二极管D放电，电感电流$I_L$线性减少，输出电压Vout靠输出电容C放电$I_c$以及减小的电感电流$I_L$维持缓慢下降**，若S1一直保持关断，则Vout会最终降至0V；

   ![S1关断时](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260329161649311.png)

按上述描述,通过不停的开关**S1**，Buck输出电压$V_{out}$曲线近似如下图所示：

![Buck输出电压曲线](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260329161731417.png)





## BUCK伏秒平衡法则

伏秒平衡是指==电感==在开关电源稳态工作时，一个周期内正向和反向电压作用时间的积分相等，从而保证电感电流周期性稳定和磁通守恒。

伏秒（V·s）定义为电压与时间的乘积，即**电压对时间的积分**，表示电感中能量的变化量：$V_L \times \Delta t$。电感的电流变化率与两端电压成正比，因此伏秒直接决定电感电流的变化幅度。

在开关电源中，电感经历两个阶段：

- **导通阶段（$T_{ON}$）**：开关导通，电源向电感供能，电流上升，电感储存能量。
- **关断阶段（$T_{OFF}$）**：开关断开，电感释放能量维持负载电流，电流下降。

伏秒平衡要求在**一个完整开关周期内**，导通阶段的伏秒积与关断阶段的伏秒积相等（符号相反），即电感的净磁通变化为零。如果不平衡，电感电流会持续增加或减少，可能导致磁芯饱和甚至损坏电感。

稳态条件下，电感电流周期性重复：
$$
I((n+1) \times T)=I(n \times T)
$$
电感两端电压积分为零：
$$
\int_{0}^{T} V_L(t) dt = 0
$$
或等效表示为：
$$
V_{on} \times T_{on} + V_{off} \times T_{off} = 0
$$
其中 $V_{on}$和$V_{off}$分别为导通和关断阶段电感两端电压，$T_{on}$和 $T_{off}$为对应时间段。 

伏秒平衡体现了电感的**能量守恒和磁通守恒**：

- 电感电流不能突变，因此正向和反向伏秒必须平衡。
- 类比水池：导通阶段注入水（电流上升），关断阶段排水（电流下降），稳态时注入量等于排出量，水位保持稳定。 

伏秒平衡一般应用于：

1. **开关电源设计**：确保BUCK、BOOST、反激等拓扑稳态工作，防止电感饱和。
2. **磁性元件设计**：电感和变压器磁芯参数需满足伏秒积限制，避免磁饱和。
3. **电容类比**：电容有类似的“安秒平衡”，用于输出电压纹波计算和电容选型。
4. **磁学扩展**：变压器励磁电流周期性复位，确保原副边绕组伏秒积相等。

> [!tip]
>
> 伏秒平衡成立的前提条件：
>
> - 电路工作在稳态，电流电压波形周期重复。
> - 电感工作在线性区，未进入饱和。
> - 开关频率足够高以满足小纹波近似。

那么在Buck电路中伏秒法则为：
$$
开通时电感电压 \times 开通时间 = 关断时电感电压 \times 关断时间 \newline
V_i-V_o \times T_{on} = (V_o + V_d) \times T_{off}
$$
通过以上的公式可以推导出：
$$
\left.
\begin{aligned}
V_i-V_o \times T_{on} = (V_o + V_d) \times T_{off} \newline
T = T_{on} + T_{off} = \frac{1}{f}
\end{aligned}
\right\}
\newline
\implies 开通时间:T_{on} = \frac{V_o + V_d}{V_i + V_d} \times \frac{1}{f}
\newline
\implies 关断时间:T_{off} = \frac{V_i - V_o}{V_i + V_d} \times \frac{1}{f}
\newline
\implies 占空比:D = \frac{V_o + V_d}{V_i + V_d} = \frac{T_{on}}{T}
$$


## 占空比调节Vout

通过控制开关管S1开启关断的占空比，可以控制输出电压$V_{out}$的大小；

> [!note] 
>
> $V_{out}$的调整不是只有开关断开的时候，而是作用在工作的全周期，比如由于**$V_{out}$的增大，$V_{in}-V_{out}$会变小**，即开关闭合期间的伏秒积就会减小，实际上充电时能量并没有那么多，放电时能量也不会很多，只是充电持续的时间长。）



### 占空比D突然增加的瞬时冲击

- **动作：** 控制环路突然将占空比 `D` 提高到一个新值（例如，目标输出电压提高了）
- **瞬时响应：**
  - $T_{on}$立即延长： 开关导通时间变长。
  - $V_{out}$尚未升高：输出电压由于电容和负载惯性，还维持在原来的较低值。
  - **瞬时充电伏秒积 $(V_{in} - V_{out})  \times T_{on\_new}$ 显著增大（$V_{in}-V_{out}$与D增大前基本保持一致，$T_{on}$增大，瞬时伏秒积增大，即瞬时注入电感和输出的能量剧增）**
  - **能量去向：**
    - **大部分额外能量被输出电容吸收 → $V_{out}$开始快速上升 ($V_{out}$)**。
    - 部分能量使电感电流峰值升高。

- 过渡到新稳态 ($V_{out\_new}$升高)
  - **`Vout` 升高：由于瞬时注入的巨大能量，`Vout` 被推高**，逐渐接近新的目标值 (`Vout_new`)。
  - **负反馈调节： 误差放大器感知到 `Vout` 接近目标，会略微微调占空比 `D`**（使其稳定在略高于原值、但低于初始冲击值的一个新稳态值 `D_steady`）。核心是 `D_steady > D_old`。


- 在新稳态下的充电伏秒积分析
  - 新稳态条件：`Vout = Vout_new (更高), D = D_steady, TON = TON_steady = D_steady *_T`.
  - **充电伏秒积 = `(Vin - Vout_new) *_TON_steady`**
    **`(Vin - Vout_new)`：** 因为 `Vout_new > Vout_old`，所以 **`(Vin - Vout_new)` < `(Vin - Vout_old)`**。**电压差变小**
    **`TON_steady`：** 因为 `D_steady > D_old`，所以 **`TON_steady > TON_old`**。**充电时间变长**
  - 综合效果：
    1、**伏秒积的变化**：根据理想BUCK公式 `Vout = D*_Vin，稳态时有 (Vin - Vout)_*TON = Vout*_**TOFF。既然 Vout 和 D (即 TON) 都增大了，那么新的稳态导通伏秒积 (Vin - Vout**new)_*_TON_steady 必然等于新的稳态关断伏秒积 Vout_new_*_TOFF_steady，并且：**它大于原来的稳态导通伏秒积 (**Vin - Vout_old)_*_ _TON_old`。
    2、**原因： 虽然 `(Vin - Vout)` 减小了，但 `TON` 增加的幅度超过了 `(Vin - Vout)` 减小的幅度**。
    3、**能量角度：** **更高的输出电压 `Vout_new` 通常意味着输出功率更高**（如果负载电阻不变，`P = Vout² / R`），或者需要应对相同的负载功率但输入效率变化。**系统需要注入更多的总能量来维持这个更高的输出电压**（或功率）。这**更多的能量正是通过这个更大的导通伏秒积注入的**。
  - <u>**逻辑链**</u>：
    **提高占空比 (`D↑`) → 延长导通时间 (`TON↑`) → 初始 `(Vin - Vout)` 较大 → 电感储存的能量 (`(1/2) LI²`) 比提高前更多 → TOFF期电感必须释放的能量也更多 → 释放的能量超过当前负载功率消耗 → 多余能量迫使输出电容 `Cout` 电压升高 (`Vout↑`) → 最终在新的更高电压 `Vout_new` 下达到能量注入（TON）与释放（TOFF）的稳态平衡，且释放的能量（大部分）被更高的负载功率 (`Vout_new² / Rload`) 所消耗。**




### （4）能量如何被“消耗完毕”

![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\1e797bf0861109c1bcbf10531e6e977c.png)

## **4、同步整流Buck和异步整流Buck**

![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\18ae334b80e84c1b8790aa2014deb847.png)
以上是异步整流Buck，**续流回路中采用的是二极管**，具有单向导电性，不需要外加电路控制其通断，因此它只有一个mos管（或者说开关管）需要用电路控制，也就**不用去强调同步控制二极管，即可以理解为非同步**。
因为二极管需要一定导通压降才能导通，如果输出电流比较大，那么就会有比较大的额外消耗，另一方面，如果输出电压是比较低的时候，比如说是1.2V，那么二极管导通压降就占了很大的比例。所以**在大电流，小电压输出时候效率偏低**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\9c41030cd0cf45e2793849f35a10ab14.png)
另外还有一种就是同步整流型Buck。同步Buck在电路中**续流回路中使用的是MOS管（Q2）**，即上下管都是MOS管，因为MOS管本身是需要外部控制的元器件，**整流过程中必须根据电源的开关时序同步控制Q1与Q2，所以该电路理解为同步**。
同步Buck的控制较为复杂，需要额外的驱动电路和控制电路保证电路正常工作，如果死区时间处理不当，有可能上下管直通，造成MOS管损坏(这是指的是电源控制器外接同步整流MOSFET的情况)。对于内部集成了控制器，上下管的电源管理芯片，由于MOSFET的特性已知，控制和MOSFET集成，可以很好的解决上面提到的控制问题，不需要过多担心。
同步和异步的区别从外部来看是同步的没有续流二极管。**BUCK的输出电流是分成两个部分的，一个部分是来自电源，**，同步电路把这个二极管用一个内置的MOSFET给替代了，但是这个MOSFET的开和关需要芯片内部额外的控制电路来保持和开关MOSFET的相位关系。
**。**

# 三、BOOST升压型

## 1、BOOST升压型的基本工作原理

Boost电路是一种DC-DC升压转换器，通过控制开关管的通断，将输入电压升高至更高的输出电压。其**核心原理为电感储能与释放，结合二极管和电容的续流滤波功能**。
详解--电压之所以能在Boost电路中升高，是因为**电感在开关断开期间产生的感应电动势与输入电压叠加**，从而导致输出电压高于输入电压。通过调节开关的占空比，可以控制输出电压的大小。这种电压升高的机制是基于电感的能量存储和释放特性，以及开关器件对电流路径的精确控制。
工作过程：
**电感储能, 电容供电**：当开关导通时，电流从输入电源流经电感到达开关，并最终回到电源负极。此时，电感开始储存能量，而由于二极管反向偏置，电流不会流向负载。同时，输出滤波电容为负载提供所需的电流。
**开关导通的时候，电感L接地，二极管截止，Vi对电感L进行充电，电感两端电压是Vi。**
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\cea1e74043a64d869cf346558f6f73f9.png)
**断开阶段（放电过程）电感释能 + 电源供电, 电容充电**：当开关断开时，电感中的电流不能瞬间停止，根据楞次定律，电感会产生一个与原电流方向相同的感应电动势以抵抗电流的变化。这个感应电动势会使二极管正向偏置，允许电感中的电流继续流动，通过二极管给输出滤波电容充电并为负载供电。
输出电压Vo恒定，二极管导通压降为Vd，所以电感右端电压为Vo+Vd，电感左端电压是电源输入Vi。这是升压BOOST电路， 所以Vo+Vd>Vi，电感此时放电，给负载供电，以及给输出滤波电容充电。
此时电感的两端电压是右边电压Vo+Vd减去左边电压Vi，即：**Vo+Vd-Vi**
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\e751910efd5aae324c64e0cdb5cc9ff7.png)
**核心元件：**
**电感**：储能元件，**开关导通时储存能量，关断时释放能量**。
**开关管（MOSFET）**：控制电流通断，**调节占空比**。
**二极管**：防止反向电流，**开关关断时形成续流回路**。
**输出电容**：滤波，**减小输出电压纹波**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\fc57866e38ceaf80b4b0e4e71dd54817.png)
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\fb06f847716356f82ee29d6fab560266.png)

## 2、BOOST伏秒平衡法则

![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\a67e503967aebe7ed1c04d88a28a5552.png)
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\debd46ae6970bf462e83d73cf391322e.png)

# 四、BUCK-BOOST升降压型

## 1、反极性Buck-Boost升降压电路

这种电路设计广泛应用于电源管理领域，特别是在需要灵活电压调节的应用场景中。Buck-Boost电路的基本结构包含开关（通常为MOSFET或晶体管）、电感、电容以及必要的二极管等元件。它的独特之处在于能够**通过控制开关的通断时间比（占空比），来实现电压的升压（Boost）或降压（Buck）效果，从而达到所需的输出电压**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\0333cf543d245dcc1539f09955a5d2db.png)
开关管导通时，S相当于短路，电感L直接接到电源两端，由于电感电流不能突变（变大），电感会产生反向电动势阻止电流变大，电感电压极性为上正下负，此时，二极管D处于截止状态，相当于断路，如图所示。此时**电感在充电，电感两端电压VL=Vin，电流随着时间不断变大**；**负载由输出电容供电，电容放电，其两端电压即输出电压随着时间不断减小**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\0cd8c3f7969e740f31f78f9712ecc63d.png)
开关管关闭时，相当于断路，电感L两端电流变小，但电感电流不能突变，电感会产生反向电电动势，电感电压极性为上负下正，电感放电，此时二极管导通，**电感为负载供电，给输出电容充电**，**电感两端电压为VL=Vout**。当开关管关闭时，电路示意图见下图。由图可知，**负载两端电压即输出电压极性与输入电压极性相反**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\2a0c14ea1cb2bdf9be2d75c97795a97a.png)
根据伏秒平衡定律：
Vin _Ton = Vout_Toff
Vin Ton = Vout (TS-Ton)
**Vout = D/（1-D）*Vin**

## 2、同极性Buck-Boost升降压电路

与反极性电路相比，这是真正意义上的Buck电路加Boost电路。**通过控制开关管S1、S2来实现电路工作在BUCK模式和BOOST模式从而实现升降压**。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\cd5551e9d6a437121877a4352e2918ee.png)
电路存在两个二极管，对于高效率需求并不友好，因此现在通常选用同步Buck-Boost电路，将两个二极管使用两个开关管来代替，即四开关管Buck-Boost电路。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\58ed3a07c3eb16fb07a416cdbf79f3dd.png)
四开关同步Buck-Boost电源内部电路控制开关管周期性导通或断开，通过调节开关管状态（如占空比等），控制输出电压的大小。其**基本原理是通过严格控制开关电路的导通和截止时间，实现对输出电压的有效调节，从而达到降压和升压的目的**。

### （1）BUCK模式

当**输入电压远大于输出电压时**，电源IC工作在降压模式。即**S4处于常闭、S3处于常开**，通过驱动S1和S2周期性地导通关闭，如下图所示，此时电路为同步Buck电路结构，即和Buck电路工作方式相同。当S1 闭合、S2断开时，电流流向示意图如红色虚线所示，当S1断开、S2闭合时，电流流向示意图如蓝色虚线所示。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\c57288384fb28309e5d378ef2e7618e4.png)

### （2）BOOST模式

当**输入电压远小于输出电压时**，电源IC工作在升压模式。即**S1处于常闭、S2处于常开状态**，通过驱动S3和S4周期性地导通关闭，如下图所示，此时电路为同步Boost电路结构，即和Boost电路工作方式相同。当S4 闭合、S3断开时，电流流向示意图如红色虚线所示，当S4断开、S3闭合时，电流流向示意图如蓝色虚线所示。
![](C:\Users\Administrator\Documents\NeatifyDB\publicUser\assets\ac1fb3a8d23c775858554c224b0cd68d\693189e13b50bb0db12e62352242cd2f.png)

### （3）BUCK-BOOST模式

当**输入电压和输出电压相近时**，电源IC工作在Buck- Boost模式。假设工作在Buck模式时，当Vin下降接近Vout，达到Buck模式最大占空比时，电路会自动将开关管工作状态切换到Buck- Boost 模式。假设工作在Boost模式时，Vin增大接近Vout，达到Boost最小占空比时，电路会自动将开关管工作状态切换到Buck- Boost 模式。在Buck- Boost 模式下，四个开关管会同时进行导通/关闭操作。此模式是一种过度和自适应模式，工作状态切换主要是由占空比决定。











**     **