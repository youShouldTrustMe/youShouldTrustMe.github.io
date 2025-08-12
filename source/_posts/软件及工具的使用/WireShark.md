---
title: WireShark

date: 2025-03-01
lastmod: 2025-03-01
tags:
- 软件及工具
---



# 蓝牙抓包

## 参考链接

[实测对比Wireshark利用nRF52832 Sniffer和Packet Sniffer 利用CC2540 Dongle 抓包使用体验_usb nrf sniffer 指定 mac-CSDN博客](https://blog.csdn.net/RF_star/article/details/106054980)

[蓝牙----wireshark抓包查看蓝牙通信过程_蓝牙抓包-CSDN博客](https://blog.csdn.net/qq_43306777/article/details/139235300)

[低功耗蓝牙协议栈入门（四）空中抓包 （WireShark + nRF Sniffer） | BalanceTWK的博客](https://balancetwk.github.io/2022/04/16/hexo_blog/Bluetooth/蓝牙协议栈入门学习笔记（四）/)

[nRF Sniffer for Bluetooth LE User Guide v4.0.0 (nordicsemi.com)](https://docs.nordicsemi.com/bundle/nrfutil_ble_sniffer_pdf/resource/nRF_Sniffer_BLE_UG_v4.0.0.pdf)

## 安装

使用wireShark抓包，需要使用专用硬件nRF来抓，首先先到[Wireshark · Go Deep](https://www.wireshark.org/)网站下载wireShark，然后再去[nRF Sniffer for Bluetooth LE - nordicsemi.com](https://www.nordicsemi.com/Products/Development-tools/nRF-Sniffer-for-Bluetooth-LE)下载nRF sniffer插件。在[ble-sniffer command overview (nordicsemi.com)](https://docs.nordicsemi.com/bundle/nrfutil/page/nrfutil-ble-sniffer/guides/overview.html)上有软件使用手册。

> [!tip]
>
> nRF sniffer是wireShark的一个插件，相当于是安装了nRF sniffer插件，就可以使用wireshark抓蓝牙包了

安装wireshark的时候，一直下一步就行，下面介绍nRF sniffer的安装：

在安装之前需要确保安装了wireshark v3.41及以上版本和python v3.6及以上版本

> [!note]
>
> 一般来说，商家都会烧录好固件，一些支持二次开发的设备可以自己烧录hex程序以支持nRF connect或Wireshark

打开下载好sniffer插件文件夹，打开`nrf_sniffer_for_bluetooth_le_4.1.1\extcap`文件夹，打开cmd，可以在地址栏中输入cmd用来直接启动

![安装必要包](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_20_36_202502051320275.gif)

在cmd中输入以下命令安装依赖包（注意，这必须在安装了python的前提下）：

```bash
pip3 install -r requirements.txt
```

安装完成之后，打开wireshark，在菜单的tab中依次打开*==帮助>关于wireshark>文件夹>personal Extcap==*,将 `Sniffer_Software/extcap/` 文件夹的内容复制到此文件夹中。之后开始配置wireshark，在菜单的tab中依次打开*==帮助>关于wireshark>文件夹>personal configuration==*，将 profile 文件夹 Sniffer_Software/Profile_nRF_Sniffer_Bluetooth_LE 复制到此文件夹的 profiles 子文件夹中。

最后在 Wireshark 中，选择 Edit > Configuration Profiles，选择 Profile_nRF_Sniffer_Bluetooth_LE 并单击 OK。

## 使用

在使用之前，电脑上需要插上硬件设备：

![nRF sniffer外部接线](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_30_10_202502051330475.png)



打开wireshark，在捕获界面会出现nRF sniffer设备：

![image-20250205133145838](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_31_45_202502051331951.png)



可以点击设备左侧的小齿轮按钮，会弹出相关设置：

![设备设置](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_37_10_202502051337676.png)

上面的选项的含义如下：

1. 仅广播数据包：仅嗅探给定设备的广播数据包。建立新连接后，RF嗅探器会忽略它。
2. 仅传统广播数据包：仅嗅探给定设备的旧式广告数据包。RF嗅探器不会在辅助广播数据包的扩展广播数据包中查找广告商的设备地址。
3. 查找扫描响应数据：在嗅探所有广播设备时跟踪扫描请求和扫描响应。此选项可用于在扫描响应数据中查找广播商的名称。
4. 查找辅助指针数据：在嗅探所有广播设备时，跟随辅助指针获取其他数据。此选项可用于在辅助广播数据中查找广告主的地址和名称。
5. 扫描和跟踪LE Coded PHY上的设备：在嗅探所有广播设备和特定设备时，嗅探LE编码PHY。nRF Sniffer会跟踪它使用的任何PHY上的连接。要同时对LE1MPHY和LE编码PHY进行嗅探，请使用多个嗅探器。

nRF嗅探器有两种工作模式：

1. 监听所有广播频道，从尽可能多的设备中获取尽可能多的数据包。这是默认模式。
2. 跟踪一个特定设备，并尝试捕获发送到该特定设备或从该特定设备发送的所有数据包。此模式捕获所有：
   1. 从设备发送的通告和扫描响应
   2. 扫描请求和连接到设备的请求
   3. 连接中的数据包在连接中的两个设备之间发送
   4. 软件界面提供控制nRF Sniffer操作的命令和选项。

可以使用sniffer的过滤器进行筛选：

![功能区](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_43_29_202502051343689.png)



其中的含义如下：

1. 硬件接口：此列表显示了可用的硬件接口。如果您有多个连接了nRF Sniffer固件的DK或加密狗，您可以使用工具栏选择要控制的一个。要同时使用多个硬件接口。
2. 设备列表：此列表显示附近正在进行广播的设备。当您开始嗅探时，将选中All advertising devices。从列表中选择一个设备以嗅探该特定设备。当您在连接中选择其他设备时，当前连接将丢失。如果未发现要嗅探的设备，您可以手动将其添动加到列表中。
3. 输入键和值：使用此字段可为嗅探器提供无法单独从空中交通捕获的输入信息。为此，请从下拉菜单中选择输入键，然后在输入字段中输入相应的值。以下输入键可用：
   1. 旧版密钥：如果您的设备要求您提供密钥，请在密钥文本字段中键入6位数的密钥，然后按Eter。然后在设备中输入密钥。
   2. 旧版OOB数据：如果您的设备使用带有16字节带外（○0B)密钥的传统配对过程，请以十六进制格式提供（以0x开头，大端)。您必须在设备进入加密状态之前执行此操作。如果输入的键短于16字节，则前面用0填充。
   3. 旧版LTK：如果您的设备具有使用引旧版长期密钥(LTK)的现有绑定，请以十六进制格式提供（以0x开头，大端)。您必须在设备进入加密状态之前执行此操作。如果输入的键短于16字节，则前面用0填充
   4. SC LTK：如果您的设备具有使用LE Secure Connections LTK的现有绑定，请以十六进制格式提供（以0x开头，大端)。您必须在设备进入加密状态之前执行此操作。如果输入的键短于16字节，则前面用0填充。
   5. SC私钥：如果您的设备使用LE安全连接配对，并且两个设备均未处于调试模式（使用Dbug私钥），请以十六进制格式（以Ox开头，大端）提供设备的32字节Diffie-.Hellman私钥。您必须在设备开始配对过程之前执行此操作。如果输入的键短于32字节，则前面用0填充。
   6. LE地址：如果要嗅探的设备当前未发布，因此未被发现，请使用此字段将其LE地址添加到设备列表中。输入完整的6字节LE地址，用冒号分隔每个字节，并附加地址类型(“public”或“random”)。例如57:25:B0:81:eb:E5随机
4. 广播信道：您可以更改nRF Sniffer在跟踪设备时切换广告频道的顺序。使用逗号分隔的通道号定义顺序，例如37,38,39。完成后按Enter。
   使用默认配置，RF嗅探器等待通道37上的数据包。在通道37上收到数据包后，它会转换为在通道38上嗅探。当它在通道38上收到数据包时，它会转换为在通道39上嗅探。当它在通道39上收到数据包时，它开始在通道37上嗅探，并重复该操作。

在捕获完数据之后，会通过不同的区域展示：

![不同区域的划分](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_13_56_34_202502051356462.png)



也可以使用wireshark自带的筛选功能，并且nRF sniffer也提供了相关包：

| 显示筛选器               | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| btle.length ! = 0        | 仅显示低功耗蓝牙数据包的length字段不为零的数据包的过滤器，这意味着它会隐藏空数据包。 |
| btle.advertising_address | 仅显示具有广播地址的数据包（广播数据包）的筛选器。           |
| btle                     | 显示所有低功耗蓝牙数据包的协议筛选器。                       |
| BTATT、BTSMP、BTL2CAP    | 分别用于 ATT、SMP 和 L2CAP 数据包的协议过滤器。              |
| nordic_ble.channel<37    | Fiter仅显示在数据通道上接收的数据包。                        |

![过滤器设置](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_14_0_31_202502051400310.png)



> [!tip]
>
> 注意：这里可以的逻辑符号可以使用`&&` `||` `==` `!=` `!`，并且可以使用`.`来看一个包下面有那些参数，如`btle.`，键入`.`之后就会出现它下面的参数

当然，有时候为了方便对比数据，可以将一个数据放到列上，首先先选中需要查看的列，右键，选择应用为列即可。

![应用为列](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/5_14_6_44_202502051406915.png)



















