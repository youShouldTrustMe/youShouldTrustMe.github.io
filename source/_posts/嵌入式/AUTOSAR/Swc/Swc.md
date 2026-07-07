# 参考链接

http://www.uml.org.cn/car/202507284.asp?artid=26938





SWC 是什么？

软件组件（SWCs）是AUTOSAR的构建模块，SWCs可以组合起来创建一个完整的系统。

![img](http://www.uml.org.cn/car/images/2025072841.png)

SWC 如何进行通信？

PORTS

SWCs通过端口进行通信。数据由P端口提供，并由R端口请求，P端口连接到R端口。

![img](http://www.uml.org.cn/car/images/2025072842.png)

（S/R）通信：一个SWC向另一个SWC发送数据，当需要将数据“推送”给接收者时使用

![img](http://www.uml.org.cn/car/images/2025072843.png)

（C/S）通信：一个SWC可以触发另一个SWC上的代码执行。 通常，服务器会返回一些结果

![img](http://www.uml.org.cn/car/images/2025072844.png)

软件组件（SWCs）之间的连接映射到虚拟功能总线（VFB）上。VFB 的实现被称为运行时环境（RTE）。RTE                             管理 SWCs 之间通信的所有方面。RTE 生成器通过读取 ECU 描述来生成实现 VFB 的代码。

![img](http://www.uml.org.cn/car/images/2025072845.png)

interface

现在我们已经定义了我们的通信方法，我们可以看看端口是如何定义的：

每个端口的“形状”由其接口定义，包括其通信方法。

接口可以被认为是端口的“类型”。

由兼容接口定义的端口可以互相连接。

S/R interface

S/R接口包含了类型化的数据元素。数据元素彼此独立，即每个数据元素都是单独发送或接收的。

![img](http://www.uml.org.cn/car/images/2025072846.png)

C/S interface

C/S接口包含操作。操作是服务器上运行的可执行代码片段。操作可以接受参数，并返回结果。操作也是独立的。

![img](http://www.uml.org.cn/car/images/2025072847.png)

SWC 的 Runnable 如何被触发

SWC的内部结构：

可执行代码（称为Runnable Entity，或Runnable）由开发人员编写。

Runnables 发起 API 调用以进行通信。

Runnables 由 RTE 事件触发。

![img](http://www.uml.org.cn/car/images/2025072848.png)

RTE-Event

RTE 事件是触发 Runnable 启动的原因，例如：

定时事件

数据接收事件

服务器调用事件

![img](http://www.uml.org.cn/car/images/2025072849.png)

SWC传输的数据

S/R 接口包含数据元素：

每个数据元素都有一个数据类型（这是一个熟悉的概念）。

AUTOSAR 中有不同种类的数据类型：

ApplicationDataType（应用数据类型）：在 SWC 设计阶段（在 VFB 级别），使用                             ApplicationDataType。这是一个抽象类型。

ImplementationDataType（实现数据类型）：ImplementationDataType                             在概念上对应于 (C) 源代码级别。

SwBaseType（基本数据类型）：SwBaseType 提供了 ImplementationDataType                             的平台相关部分。

![img](http://www.uml.org.cn/car/images/20250728410.png)

C/S接口使用操作的参数中的类型。C/S 参数也有一个方向。

![img](http://www.uml.org.cn/car/images/20250728411.png)

例如，“Multiply”操作可能执行以下计算：

![img](http://www.uml.org.cn/car/images/20250728412.png)

SWC的开发过程

开发SWC分为若干个阶段，这些阶段在逻辑上依次进行：

数据类型定义

接口和端口定义

SWC定义

Step1:数据类型定义

ApplicationDataTypes (ADTs) 是抽象的，描述“现实世界”的类型。

单位（SI单位）

物理维度

物理限制

ImplementationDataTypes (IDTs) 是代码级别的类型，用于实现ADTs。

内部限制

软件开发人员必须将每个ADT映射到一个IDT。

数据类型映射（Data Type Mapping）

虽然AUTOSAR允许SWC开发人员定义使用IDTs的接口，也允许使用ADTs，但在定义接口时最好始终使用ADTs，因为：

语义得以保留

来自不同供应商的SWC可能在内部使用不同的类型

例如，供应商#1可能使用‘float’表示速度，而供应商#2可能使用32位整数。只要ADT的单位和物理维度一致，RTE生成器将自动生成代码以在这两种类型之间进行转换。

示例

定义一个 ApplicationDataType：

使用一个名为 SwitchState 的Application Data Type，它有两个值：

On

Off

对于其 ImplementationDataType，将使用 UInt8。

应用程序数据类型（Application Data Types）不会出现在C代码中。

Step2:接口和端口定义

定义一个 S/R 接口

定义一个包含单个数据元素的 S/R 接口。这个接口将用于描述连接 Light Manager SWC（发送端）和                             Light SWC（接收端）的端口。

![img](http://www.uml.org.cn/car/images/20250728413.png)

由于描述了一个开关，接口仅包含一个类型为 SwitchState 的数据元素。

![img](http://www.uml.org.cn/car/images/20250728414.png)

描述这个接口的 XML 看起来如下：

![img](http://www.uml.org.cn/car/images/20250728415.png)

Step3:SWC定义

一个 SWC 需要一些配置数据。这些数据保存在一个 XML 文件中，我们将描述以下内容：

SWC 名称

端口定义

可运行实体（Runnables）

事件

数据类型映射

![img](http://www.uml.org.cn/car/images/20250728416.png)

示例：定义一个简单的SWC

如下所示：

![img](http://www.uml.org.cn/car/images/20250728417.png)

Step1:S/R PORT定义

使用之前定义的接口来定义一个具有 R 端口的 SWC。R 端口引用了之前定义的接口。

![img](http://www.uml.org.cn/car/images/20250728418.png)

![img](http://www.uml.org.cn/car/images/20250728419.png)

Step2:Runnable定义

假设希望在接收到灯光开关信号时执行一些代码。该可运行实体还需要从 R 端口读取数据。

![img](http://www.uml.org.cn/car/images/20250728420.png)

![img](http://www.uml.org.cn/car/images/20250728421.png)

Runnable代码

![img](http://www.uml.org.cn/car/images/20250728422.png)

Step3:Event定义

假设在端口接收到数据时触发可运行实体。事件定义引用了端口和可运行实体：

![img](http://www.uml.org.cn/car/images/20250728423.png)

![img](http://www.uml.org.cn/car/images/20250728424.png)

Step4:数据类型映射

接口中使用的应用数据类型需要一个实现数据类型。（这不是SWC定义的一部分，但SWC包含对它的引用）

![img](http://www.uml.org.cn/car/images/20250728425.png)

示例2：定义一个发送 SWC

如下图所示：

Step1:S/R PORT定义

使用相同的接口定义来定义 SWCLightManager 的 P-Port。

![img](http://www.uml.org.cn/car/images/20250728426.png)

![img](http://www.uml.org.cn/car/images/20250728427.png)

Step2:Runnable定义

假设定期运行一些代码来轮询开关的状态。这个 Runnable 通过 P-Port 发送数据。

![img](http://www.uml.org.cn/car/images/20250728428.png)

![img](http://www.uml.org.cn/car/images/20250728429.png)

Runnable 代码

![img](http://www.uml.org.cn/car/images/20250728430.png)

Step3:Event定义

假设 runnable 每 100 毫秒触发一次。如下所示：事件定义中简单地指定了 runnable                             和事件周期（以秒为单位）。

![img](http://www.uml.org.cn/car/images/20250728431.png)

![img](http://www.uml.org.cn/car/images/20250728432.png)

现在我们定义了两个具有相同 Sender-Receiver 接口的 SWC 类型。

（我们还没有将它们连接在一起 —— Composition将在后面讲解）

到目前为止，发送方的新数据会覆盖先前接收到的数据。

AUTOSAR 还支持排队通信。

![img](http://www.uml.org.cn/car/images/20250728433.png)

S/R 通信

![img](http://www.uml.org.cn/car/images/20250728434.png)

排队的 S/R 通信：

通过将 S/R 接口中的数据元素的 SwImplPolicy 设置为 QUEUED，它将变为排队模式：

![img](http://www.uml.org.cn/car/images/20250728435.png)

队列的长度在 R-Port 定义中的 QueuedReceiverComspec 中进行配置。

![img](http://www.uml.org.cn/car/images/20250728436.png)

更改为排队通信会导致 RTE 生成器构建不同的 API。

![img](http://www.uml.org.cn/car/images/20250728437.png)

隐式 S/R 通信 (1)：

为了使 Runnables 执行，它们必须映射到操作系统任务。用户的配置定义了 Runnables                             到任务的映射。

RTE 生成器构建包含所有映射的 Runnables 调用的任务体。

![img](http://www.uml.org.cn/car/images/20250728438.png)

隐式 S/R 通信 (2)：

如果 Runnables 访问相同的 S/R 数据，使用数据项的本地副本可能更有效。

− 这就是隐式 S/R 通信。

− 数据在开始时从源读取，并在结束时写回。

− 当多个 Runnables 读取相同的数据时，这可以提高效率。

![img](http://www.uml.org.cn/car/images/20250728439.png)

隐式 S/R 通信 (3)：

在配置中使用的是 DataReadAccesses 和 DataWriteAccesses，而不是                             DataSendPoints 和 DataReceivePoints。

![img](http://www.uml.org.cn/car/images/20250728440.png)

C/S 接口定义

如何定义客户端-服务器接口。这个接口将用于描述连接 Light SWC（客户端）和 ECUAbstraction                             SWC（服务器）的端口。

![img](http://www.uml.org.cn/car/images/20250728441.png)

这个客户端-服务器接口仅包含一个操作，用于在抽象层中设置一个值。

![img](http://www.uml.org.cn/car/images/20250728442.png)

描述该接口的XML如下所示：

![img](http://www.uml.org.cn/car/images/20250728443.png)

客户端端口定义如下：

![img](http://www.uml.org.cn/car/images/20250728444.png)

服务器端口定义如下：

![img](http://www.uml.org.cn/car/images/20250728445.png)

客户端 Runnable 如下声明server-call：

![img](http://www.uml.org.cn/car/images/20250728446.png)

生成的函数示例：

![img](http://www.uml.org.cn/car/images/20250728447.png)

C/S---Synchronous VS asynchronous

客户端/服务器通信可以是同步的或异步的：

API 是相同的 (Rte_Call)：

否则会导致 RTE_E_LIMIT 错误。

调用的结果会在之后通过 Rte_Result 检索。

同步调用 仅在服务器响应后才会返回。

异步调用 会立即返回。

客户端对同一服务器发出的异步调用不能超过一个。

![img](http://www.uml.org.cn/car/images/20250728448.png)

运行间变量（INTER-RUNNABLE VARIABLES）

前面的章节讲述了 SWC 之间的发送者/接收者和客户端/服务器通信。如果一个 SWC 内部的运行体（Runnables）需要进行通信，有一种更高效的方法：运行间变量（IRVs）。

![img](http://www.uml.org.cn/car/images/20250728449.png)

显式运行间变量（Explicit IRV）的定义如下：

![img](http://www.uml.org.cn/car/images/20250728450.png)

每个运行体进行访问（运行间变量的访问在 SWC 内部是私有的）：

![img](http://www.uml.org.cn/car/images/20250728451.png)

IRV 通信

![img](http://www.uml.org.cn/car/images/20250728452.png)