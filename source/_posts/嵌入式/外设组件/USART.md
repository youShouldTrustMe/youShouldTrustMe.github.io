---
title: USART

cover: https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/07/9_11_51_52_202407091151823.png
categories: 
  - 嵌入式
tags:
  - 外设组件
---



# 参考链接

[串口通信](https://www.tup.com.cn/upload/books/yz/094844-01.pdf)

# 通信基础

通用异步收发/传输器(Universal Asynchronous Receiver/Transmitter,UART)是一 种常用的对异步比特流进行编码和解码的设备。UART是将外围设备提供的数据字节转换成一组单独的比特信息。反过来,又将这组比特信息转换成数据字节传递给外围设备。 UART也是一种计算机与计算机或与仪器仪表间相互交互数据的通信协议。

在实际应用中,不仅计算机与外部设备之间常常要进行信息交换,而且计算机之间也需要交换信息, 所有这些信息的交换均称为“通信”。按发送数据位数不同,可将通信过程细化为并行通信和串行通信。

UART是一种设备间非常常用的串行通信方式,因为它简单便捷,大部 分电子设备都支持该通信方式,电子工程师在调试设备时也经常使用该通信方式输出调 试信息。 在计算机科学里,大部分复杂的问题都可以通过分层来简化。如芯片被分为内核层和片上外设;STM32标准库则是在寄存器与用户代码之间的软件层。对于通信协议也以分 层的方式来理解,最基本的是把它分为物理层和协议层。物理层规定通信系统中具有机械、 电子功能部分的特性,确保原始数据在物理媒体的传输。协议层主要规定通信逻辑,统一收 发双方的数据打包、解包标准。

## 并行通信和串行通信

1. 并行通信是指将一个数据块各位的数据同一时刻传送出去。例如构成一个8位或16 位的数据块并行传送。其特点是传输速度快,但当距离较远、位数又多时导 致了通信线路复杂且成本高。 

   ![并行通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402091401997.png)

2. 串行通信是一个数据块的每一个数据按位串行传送,如图所示。其特点是通信线 路简单,只要一对传输线就可以实现通信(如电话线),从而大大降低了成本,特别适用于远 距离通信。其缺点是传送速度慢。

   - 异步串行通信的最基本形式是通过连接两个设备的对称导线来实现的。
   - 通常计算机与另一台计算机间相互通信时,计算机A通过Tx数据线将数 据发送到计算机B,接收数据的计算机B则通过Rx线接收来自发送计算机A的比特流; 
   - 如果当接收计算机B通过Tx线发送数据到发送计算机A的比特流时,则计算机A需要通 过Rx线接收这些数据,整个数据收发过程如图所示。这种通信模式也称为“异步”,因 为主机和目标没有共享同一个时钟。

   ![串行通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402091416223.png)

为进一步说明并行通信和串行通信的传输原理及其优缺点,下表比较了并行通信和 串行通信两种方式的区别：

| 比较项   | 并行通信           | 串行通信         |
| -------- | ------------------ | ---------------- |
| 传输原理 | 数据各个位同时传输 | 数据按位顺序传输 |
| 优点     | 速度快             | 占用引脚资源少   |
| 缺点     | 占用引脚资源多     | 速度相对较慢     |

## 数据传输模式

由于在串行通信中数据是在两机之间进行传送的,按照数据通信方向,可将发送数据过 程分为单工、半双工和全双工三种方式。

1. 单工方式

   单工(Simplex)方式:数据传输是由发送机向接收机的单一固定方向上传输数据,数据传输只支持数据在一个方向上传输,通信双方设备中发送机与接收机分工明确,一方固定为发送端,另一方固定为接收端。

   采用单工方式通信的典型发送设备如早期计算机的读卡器, 典型的接收设备如打印机。计算机与打印机之间的串行通信就是单工方式,因为只能由计算 机向打印机传递数据,而不可能有相反方向的数据传递。单工方式通信的示意图如图所示

   ![单工通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402091837029.png)

2. 半双工方式

   半双工(Half Duplex)方式:通信双方设备之间只有一个通信回路,接收和发送不能同时进行,只能分时接收和发送,允许数据在两个方向上传输,设备既是发送机,也是接收机, 两台设备可以相互传送数据。在某一时刻,只允许数据在一个方向上传输,它实际上是一种切换方向的单工通信;它不需要独立的接收端和发送端,两者可以合并一起使用一个端口。 某一时刻则只能向一个方向传送数据。例如,步话机是半双工设备,因为在一个时刻只能有 一方说话。半双工通信的示意图如图所示。

   ![半双工通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402092013100.png)

3. 全双工方式

   全双工(Full Duplex)方式:通信双方设备之间的数据发送和接收可以同时进行,既是发送机,也是接收机,允许数据同时在两个方向上传输。全双工通信是两个单工通信方式的结合,需要独立的接收端和发送端。两台设备可以在两个方向上同时传送数据。例如,电话 是全双工设备,因为双方可同时说话。全双工通信的示意图如图所示。

   ![全双工通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402092115325.png)



## 波特率

波特率既是指在串行通信中每秒传输数据的速度,也是指数据信号对载波的调制速率。 它用单位时间内载波调制状态改变次数来表示,单位为波特。比特率指单位时间内传输的比特数,单位为bit/s(bps)。对于USART波特率与比特率相等,不区分这两个概念。

由于数据是按位进行传送的,传送速率往往用每秒传送的字节数来表示。在波特率选定之后,对 于设计者来说,就是如何得到能满足波特率要求的发送时钟脉冲和接收时钟脉冲。

收发双方对发送或接收的数据速率(即波特率)要有一定的约定。由于收发双方的信号中没有直接编码时钟信息,发送端和接收端各自独立地保持时钟,并以一个一致的频率(倍数)运行。而且发送端时钟和接收端时钟不同步,也不能保证完全相同的频率,但它们必须在频率上足够接近(优于2%)才能正常恢复传输的数据。因此,异步通信中由于没有时钟信号,所以两个 通信设备之间需要约定好波特率,即每个码元的长度,以便对信号进行解码,下图中用虚线分开的每一格就是代表一个码元。常见的波特率为4800bps、9600bps、115200bps等。 波特率越大,传输速率越快。

![UART信号编码](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402092643701.png)

为了理解接收机如何提取编码数据,假设它有 一个从空闲状态开始以波特率倍数(例如16倍)运 行的时钟。接收机“采样”它的Rx 信号,直到它检测到一个高低转换。然后等待1.5 个周期(24个时钟周期),以在它估计为0位数据中心的位置采样Rx信号。然后接收机以位周期间隔 (16个时钟周期)采样Rx,直到它读取了剩余的7个数据位和停止位。从那一点开始,这个 过程不断重复,直到成功地从帧中提取数据需要超过10.5个周期。为了正确地检测到停止位,目标时钟相对于主机时钟的漂移要小于0.5个周期。

## 通信模式

同步通信与异步通信的区别: 

1. 同步通信要求接收端时钟频率和发送端时钟频率一致,发送端发送连续的比特流; 异步通信时不要求接收端时钟和发送端时钟同步,发送端发送完一个字节后,可经过任意长 的时间间隔再发送下一个字节。 
2. 同步通信效率高;异步通信效率较低。 
3. 同步通信较复杂,双方时钟的允许误差较小;异步通信简单,双方时钟可允许一定误差。 
4. 同步通信可用于点对多点;异步通信只适用于点对点。 
5. 在同步通信中,数据信号所传输的内容绝大部分是有效数据,而异步通信中则会包 含数据帧的各种标识符,所以同步通信效率高;但是同步通信双方的时钟允许误差小,时钟 稍稍出错就可能导致数据错乱,异步通信双方的时钟允许误差较大。

### 同步通信

同步通信是一种连续串行传送数据的通信方式,每一次通信仅传送一帧信息。同步通信需要带时钟信号传输。比如SPI,I2C通信接口。这里的信息帧与异步通信中的字符帧不 同,通常含有若干数据字符。 

采用同步通信时,将许多字符组成一个信息组,这样字符可以一个接一个地传输,但是在每组信息(通常称为帧)的开始要加上同步字符。在没有信息传输时,要填上空字符,因为同步传输不允许有间隙。换言之,一个信息帧中包含许多字符,每个信息帧用同步字符作为开始,一般将同步字符和空字符用同一个代码。在同步传输过程中,一个字符可以对应 5~8位。当然,对同一个传输过程,所有字符对应同样的数位,比如n位。这样传输时,按 每n位划分为一个时间片,发送端在一个时间片中发送一个字符,接收端则在一个时间片中接收一个字符。在整个系统中,由一个统一的时钟控制发送端的发送和空字符用同一个 代码。接收端是能识别同步字符的,当检测到有一串数位和同步字符相匹配时,就认为开始 一个信息帧。于是,把此后的数位作为实际传输信息来处理。同步通信中,在数据开始传送 前用同步字符来指示,同步字符通常为1~2个,数据传送由时钟系统实现发送端和接收端 同步,即检测到规定的同步字符后,连续按顺序传送数据,直到通信结束。同步传送时,字符 与字符之间没有间隙,不用起始位和停止位,仅在数据块开始时用同步字符SYNC(即同步 字符8位)来指示,同步传送格式如图所示。

![同步通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402093448556.png)

同步通信中数据块传送时去掉了字符开始和结束的标志,因而其速度高于异步传送,但这种通信方式对硬件的结构要求比较高。在同步通信中,收发设备上方会使用一根信号线传输信号,在时钟信号的驱动下双方进行协调,同步数据,如下图所示。例如,通信中通常 双方会统一规定在时钟信号的上升沿或者下降沿对数据线进行采样。

![同步串行通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402093550836.png)

### 异步通信

异步通信是一种不带时钟同步信号的通信方式,比如UART、单总线等。异步通信在发送字符时,所发送的字符之间的时间间隔可以是任意的。当然,接收端必须时刻做好接收的准备。发送端可以在任意时刻发送字符,因此必须在每一个字符的开始和结束的地方加 上标志,即加上开始位和停止位,以便使接收端能够正确地将每一个字符接收下来。异步通信的优点是通信设备简单、便宜,但传输效率较低(因为开始位和停止位的开销所占比例较 大),如下图所示。

![异步串行通信](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402093856429.png)

在异步通信中不使用时钟信号进行数据同步,它们直接在数据信号中穿插一些用于同步的信号位,或者将主机数据进行打包,以数据帧的格式传输数据。通信中还需要双 方规约好数据的传输速率(也就是波特率)等,以便更好地同步。常用的波特率有 9600bps或115200bps等。 在异步通信中,数据或字符是一帧一帧地传送的。帧定义为一个字符的完整的通信格 式,一般也称为帧格式。在帧格式中,一个字符由4部分组成:起始位、数据位、奇偶校验位 和停止位。首先是一个起始位“0”表示字符的开始;然后是5~8位数据,规定低位在前,高 位在后;接下来是奇偶校验位(该位可省略);最后是一个停止位“1”,用以表示字符的结 束,停止位可以是1位、1.5位、2位,不同的计算机规定有所不同。异步串行通信格式如图所示：

![不带空闲位的格式](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402093941729.png)

![带空闲位的格式](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402094002126.png)

由于异步通信每传送一帧有固定格式,通信双方只需按约定的帧格式发送和接收数据, 所以硬件结构比较简单。此外,它还能利用奇偶校验位检测错误,因此,这种通信方式应用比较广泛。

## 引脚连接

对于两个芯片串口之间的连接,两个芯片GND共地,同时TxD和RxD交叉连接,如图所示。

![硬件电路](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402085450581.png)

这里的交叉连接的意思是,芯片1的RxD连接芯片2的TxD,芯片2的RxD 连接芯片1的TxD。这样,两个芯片之间就可以进行TTL电平通信了。 

- RxD:数据输入引脚表示接收数据; 
- TxD:数据发送引脚表示发送数据。 

如果下位机与计算机(或上位机)通过串口相连,那么上位机和下位机需要共地,但不能直接交叉连接。尽管计 算机和下位机都有TxD和RxD引脚,但是计算机(或上位机)使用的都是RS-232接口(通常为DB9封装)。RS-232接口是9针(或引脚),通常是 TxD和RxD经过电平转换得到的,因此不能直接交叉连接。故要想使得下位机与计算机使用RS-232标准传输数据信号,需要将下位机的芯片的输入/输出端口电平转换成RS-232 类型,再交叉连接。这是因为RS-232电平标准的信号不能直接被微控制器芯片直接识别, 所以这些信号会经过一个“电平转换芯片”转换成控制器能识别的“TTL校准”的电平信号, 才能实现通信。

常见的电子电路中常使用TTL的电平标准,理想状态下,使用5V表示二 进制逻辑1,使用0V表示逻辑0;而为了增加串口通信的远距离传输及抗干扰能力,RS-232 的电平标准是+15/+13V表示0,-15/-13V表示1。一般都是两个通信设备的DB9接 口之间通过串口信号线建立起连接。 在上面的串口信号线通信方式中,由于微控制器芯片的串口和RS-232的电平标准是 不一样的,需要经过电平转换后才可实现它们之间通信。根据通信使用的电平标准不同,串 口通信可分为TTL标准及RS-232标准,见下表：

| 通信标准 | 电平标准                                 |
| -------- | ---------------------------------------- |
| RS-232   | 逻辑0：十3～+15V <br />逻辑1：－15～－3V |
| 5V TTL   | 逻辑0：0～0.5V <br />逻辑1：2.4～5V      |

## 常见通信接口

| **名称** | **引脚**             | **双工** | **时钟** | **电平** | **设备** |
| -------- | -------------------- | -------- | -------- | -------- | -------- |
| USART    | TX、RX               | 全双工   | 异步     | 单端     | 点对点   |
| I2C      | SCL、SDA             | 半双工   | 同步     | 单端     | 多设备   |
| SPI      | SCLK、MOSI、MISO、CS | 全双工   | 同步     | 单端     | 多设备   |
| CAN      | CAN_H、CAN_L         | 半双工   | 异步     | 差分     | 多设备   |
| USB      | DP、DM               | 半双工   | 异步     | 差分     | 点对点   |

# USART

## 框图

串口数据低位先行，简图为：

![Usart框图](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402094454684.png)

内部实现原理如下图：

![Usart内部框图](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402094754981.png)



## 数据帧

这里的字长就是数据位长度，空闲帧和断开帧是局域网协议用的，我们的串口用不到

![字长设置](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402094918809.png)

停止位分别为1、1.5、2、0.5，意思就是0.5个时长

![配置停止位](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402094950666.png)

要保证在采样的时候，数据在时钟边沿的中间，这样可以保证数据的可靠性

- 当输入电路侦测到一个数据帧的起始位后，就会以波特率的频率，连续采样一帧数据，同时，从起始位置开始，采样位置就要对齐到位的正中间

- 首先数据的部分电路对采样的时钟进行了细分，他会以波特率的16倍进行采样，也就是说，在一位的时间内，可以进行16次采样，采样策略为
  - 最开始，空闲状态高电平，采样一直为1，在某个位置突然采样采到一个0，就说明出现了下降沿，这个时候在理想情况下应该就要开始采样了，在起始位，会进行16次连续采样，没有噪声的话，那么这16次采样应该都为0，因为串口协议的起始就是检测到下降沿，实际电路还是会出现一点噪声的，所以即使出现下降沿，后续也要再采样几次，以防万一，

![起始位检测](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095024897.png)

## 设置波特率

波特率的产生实际上就是一个预分频的过程，这里的16就是上面的内部还有一个16倍的采样时钟

![数据采样](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095102202.png)

## 数据模式

![数据模式](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095211609.png)



- HEX模式/十六进制模式/二进制模式：以原始数据的形式显示

  - 固定包长，含包头包尾

    ![固定包长](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095256706.png)

  - 可变包长，含包头包尾

    ![可变包长](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095322645.png)

- 文本模式/字符模式：以原始数据编码后的形式显示

  - 固定包长，含包头包尾

    ![固定包长](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095412403.png)

  - 可变包长，含包头包尾

    ![可变包长](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095422462.png)

Hex数据包接收为：

![Hex数据包接收](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095501688.png)

文本数据包接收为：

![文本数据包接收](https://cdn.jsdelivr.net/gh/youShouldTrustMe/MyPictures@main/Images/20260402095516891.png)

# 实验

## 简单的发送数据

```c

void serial_init()
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA,ENABLE);
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART2,ENABLE);
	
	GPIO_InitTypeDef GPIO_InitStruct;
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
	GPIO_InitStruct.GPIO_Pin = SERIAL_TX_PIN;
	GPIO_InitStruct.GPIO_Speed =GPIO_Speed_50MHz;
	GPIO_Init(SERIAL_PORT,&GPIO_InitStruct);
	
	USART_InitTypeDef USART_InitStruct;
	USART_InitStruct.USART_BaudRate = 115200;
	USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
	USART_InitStruct.USART_Mode = USART_Mode_Tx;
	USART_InitStruct.USART_Parity = USART_Parity_No;
	USART_InitStruct.USART_StopBits = USART_StopBits_1;
	USART_InitStruct.USART_WordLength = USART_WordLength_8b;
	USART_Init(USART2,&USART_InitStruct);
	
	USART_Cmd(USART2,ENABLE);
}

void serial_sendByte(u8 byte)
{
	USART_SendData(USART2,byte);
	while(USART_GetFlagStatus(USART2,USART_FLAG_TXE) == RESET);
}

void serial_sendArray(u8 *array,u16 length)
{
	for(u16 i = 0; i < length; i++){
		serial_sendByte(array[i]);
	}
}

void serial_sendString(char *str)
{
	
	for(u8 i = 0;str[i] != '\0';i++){
		serial_sendByte(str[i]);
	}
}

u32 serial_pow(u32 x, u32 y)
{
	u32 result = 1;
	while(y--){
		result *= x;
	}
	return result;
}

//将数字以字符的样式发送
void serial_sendNum(u32 number, u8 length)
{
	for(u8 i = 0; i < length; i++){
		serial_sendByte(number / serial_pow(10,length - i -1) % 10 + '0');
	}
}

int main(void){
	
	char str[50];
	u8 test[] = {0x42,0x43,0x44,0x45};

	serial_init(); 
	serial_sendArray(test,4);
	serial_sendNum(12345,5);

	while(1){
//                sprintf(str,"%x: %hu %hu\n",(u32)adValue,adValue[0],adValue[1]);
//                send_string(str);
	}
}
	

```

## printf重定向

如果想要使用printf函数，需要先使用microlib库

![image-20240709132746805](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/07/9_13_27_46_202407091327860.png)

注意需要引入stdio头文件，还需要重写fputc

```c

//重写这个函数用于重定向printf函数，这个函数是printf的底层函数，printf在打印的时候就是不断调用这个函数来一个一个打印的
int fputc(int ch, FILE *file)
{
	serial_sendByte(ch);
	return ch;
}

```

重写完这个函数就可以正常使用printf函数了

如果想要让printf使用多个串口，那么就需要sprintf函数

```c

sprintf(str,"%x: %hu %hu\n",(u32)adValue,adValue[0],adValue[1]);
serial_sendString(str);

```

为了方便，我们也可以封装sprintf函数，在封装sprintf的时候需要引入头文件stdarg.h头文件。

```c

void serial_printf(char *format, ...)
{
	char string[100];
	va_list arg;
	va_start(arg,format);
	vsprintf(string,format,arg);
	va_end(arg);
	serial_sendString(string);
}

```

解决汉字乱码的情况，如果使用的编码格式为utf-8，则需要先设置编译参数--no-multibyte-chars

## 接收数据

需要修改初始化函数，分为查询式和中断式

```c
//查询式
void serial_init()
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA,ENABLE);
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART2,ENABLE);
	
	GPIO_InitTypeDef GPIO_InitStruct;
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
	GPIO_InitStruct.GPIO_Pin = SERIAL_TX_PIN;
	GPIO_InitStruct.GPIO_Speed =GPIO_Speed_50MHz;
	GPIO_Init(SERIAL_PORT,&GPIO_InitStruct);
	
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU;
	GPIO_InitStruct.GPIO_Pin = SERIAL_RX_PIN;
	GPIO_InitStruct.GPIO_Speed =GPIO_Speed_50MHz;
	GPIO_Init(SERIAL_PORT,&GPIO_InitStruct);
	
	USART_InitTypeDef USART_InitStruct;
	USART_InitStruct.USART_BaudRate = 115200;
	USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
	USART_InitStruct.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
	USART_InitStruct.USART_Parity = USART_Parity_No;
	USART_InitStruct.USART_StopBits = USART_StopBits_1;
	USART_InitStruct.USART_WordLength = USART_WordLength_8b;
	USART_Init(USART2,&USART_InitStruct);
	
	USART_Cmd(USART2,ENABLE);
}


int main(void){
	u8 rxData;

	serial_init(); 

	while(1){
		if(USART_GetFlagStatus(USART2,USART_FLAG_RXNE) == SET){
			rxData = USART_ReceiveData(USART2);
			serial_printf("receive: %x\n",rxData);
		}
	}
}


//中断式

void serial_init()
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA,ENABLE);
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART2,ENABLE);
	
	GPIO_InitTypeDef GPIO_InitStruct;
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
	GPIO_InitStruct.GPIO_Pin = SERIAL_TX_PIN;
	GPIO_InitStruct.GPIO_Speed =GPIO_Speed_50MHz;
	GPIO_Init(SERIAL_PORT,&GPIO_InitStruct);
	
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU;
	GPIO_InitStruct.GPIO_Pin = SERIAL_RX_PIN;
	GPIO_InitStruct.GPIO_Speed =GPIO_Speed_50MHz;
	GPIO_Init(SERIAL_PORT,&GPIO_InitStruct);
	
	USART_InitTypeDef USART_InitStruct;
	USART_InitStruct.USART_BaudRate = 115200;
	USART_InitStruct.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
	USART_InitStruct.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
	USART_InitStruct.USART_Parity = USART_Parity_No;
	USART_InitStruct.USART_StopBits = USART_StopBits_1;
	USART_InitStruct.USART_WordLength = USART_WordLength_8b;
	USART_Init(USART2,&USART_InitStruct);
	
	USART_ITConfig(USART2,USART_IT_RXNE,ENABLE);
	NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
	
	NVIC_InitTypeDef NVIC_InitStruct;
	NVIC_InitStruct.NVIC_IRQChannel = USART2_IRQn;
	NVIC_InitStruct.NVIC_IRQChannelCmd = ENABLE;
	NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority = 1;
	NVIC_InitStruct.NVIC_IRQChannelSubPriority = 1;
	NVIC_Init(&NVIC_InitStruct);
	
	USART_Cmd(USART2,ENABLE);
}


u8 serial_rxData,serial_rxFlag;
void USART2_IRQHandler(void)
{
	if(USART_GetFlagStatus(USART2,USART_IT_RXNE) == SET){
		serial_rxData = USART_ReceiveData(USART2);
		serial_rxFlag = 1;
		USART_ClearITPendingBit(USART2,USART_IT_RXNE);
		}
}

u8 serial_getRxFlag(void)
{
	if(serial_rxFlag == 1){
		serial_rxFlag = 0;
		return 1;
	}
	return 0;
}

u8 serial_getRxData(void)
{
	return serial_rxData;
}

int main(void){
	u8 rxData;

	serial_init(); 

	while(1){
		if(serial_getRxFlag() == 1){
			rxData = serial_getRxData();
			serial_printf("receive %x\n",rxData);
		}
	}
}

```



```c

void serial_sendPacket(void)
{
	serial_sendByte(0xFF);
	serial_sendArray(serial_txPacket,4);
		serial_sendByte(0xFE);

}

u8 serial_rxData,serial_rxFlag;
u8 serial_txPacket[4],serial_rxPacket[4];
void USART2_IRQHandler(void)
{
	static u8 rxState = 0;
	static u8 counter = 0;
	if(USART_GetFlagStatus(USART2,USART_IT_RXNE) == SET){
		u8 rxData = USART_ReceiveData(USART2);
		if(rxState == 0){
			if(rxData == 0xff){
				rxState = 1;
				counter = 0;
			}
		}else if(rxState == 1){
			serial_rxPacket[counter++] = rxData;
			if(counter >= 4){
				rxState  = 2;
			}
		}else if(rxState == 2){
			if(rxData == 0xfe){
				rxState = 0;
				serial_rxFlag = 1; 
			}
		}
	}
}

```

