---
title: Arm架构

draft: true

categories: 
  - 基础知识
---





# 参考链接

[Documentation for binutils 2.40 (sourceware.org)](https://sourceware.org/binutils/docs-2.40/)

[GDB Documentation (sourceware.org)](https://sourceware.org/gdb/documentation/)

[Using as (sourceware.org)](https://sourceware.org/binutils/docs-2.40/as.html)

[Documentation – Arm Developer](https://developer.arm.com/documentation#tab=all&cf-navigationhierarchiesproducts=Architectures,CPU Architecture,M-Profile,Armv6-M&numberOfResults=48)



# 中断向量表

## 向量表内容

1. **初始堆栈指针 (SP)**:
   - **位置**: 向量表的第一个条目（偏移量0）。
   - **内容**: 初始化堆栈指针的地址。系统复位时，处理器会将这个值加载到主堆栈指针（MSP）寄存器中。

2. **复位处理程序地址 (PC)**:
   - **位置**: 向量表的第二个条目（偏移量4）。
   - **内容**: 复位处理程序的入口地址。系统复位时，处理器会跳转到这个地址开始执行。

3. **异常和中断处理程序地址**:
   - **位置**: 从向量表的第三个条目开始（偏移量8），依次存放各个异常和中断的处理程序地址。
   - **内容**: 包括各种异常（如NMI、硬故障）和外部中断的处理程序地址。每个处理程序地址占用4个字节。

## 向量表排列示例

假设向量表的起始地址为 `0x08000000`，以下是一个示例排列：

| 偏移量 | 内容                     | 描述                       |
| ------ | ------------------------ | -------------------------- |
| 0x00   | 初始SP地址               | 初始堆栈指针               |
| 0x04   | 复位处理程序地址         | 复位处理程序（入口点）     |
| 0x08   | NMI处理程序地址          | 非屏蔽中断处理程序         |
| 0x0C   | 硬故障处理程序地址       | 硬故障处理程序             |
| 0x10   | 内存管理故障处理程序地址 | 内存管理故障处理程序       |
| 0x14   | 总线故障处理程序地址     | 总线故障处理程序           |
| 0x18   | 用法故障处理程序地址     | 用法故障处理程序           |
| ...    | ...                      | ...                        |
| 0xXX   | 外部中断处理程序地址     | 外部中断处理程序（如EXTI） |

下面展示一个芯片的中断向量表：

```asm
__vector_table
        DCD     sfe(CSTACK)
		DCD     Reset_Handler             ; Reset Handler
		DCD     NMI_Handler               ; NMI Handler
		DCD     HardFault_Handler         ; Hard Fault Handler
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     SVC_Handler               ; SVCall Handler
		DCD     0                         ; Reserved
		DCD     0                         ; Reserved
		DCD     PendSV_Handler            ; PendSV Handler
		DCD     SysTick_Handler           ; SysTick Handler

		; External Interrupts
		DCD     WDT_IRQHandler            ; 0:  WWDT 
		DCD     SVD_IRQHandler            ; 1:  SVD     
		DCD     RTC_IRQHandler            ; 2:  RTC     
		DCD     FLASH_IRQHandler          ; 3:  FLASH    
		DCD     FDET_IRQHandler           ; 4:  LFDET    
		DCD     ADC_IRQHandler            ; 5:  ADC    
		DCD     DAC_IRQHandler            ; 6:  DAC
		DCD     SPI0_IRQHandler           ; 7:  SPI0     
		DCD     SPI1_IRQHandler           ; 8:  SPI1
		DCD     SPI2_IRQHandler           ; 9:  SPI2    
		DCD     UART0_IRQHandler          ; 10:  UART0    
		DCD     UART1_IRQHandler          ; 11:  UART1        
		DCD     UART3_IRQHandler          ; 12:  UART3    
		DCD     UART4_IRQHandler          ; 13:  UART4    
		DCD     UART5_IRQHandler          ; 14:  UART5        
		DCD     U7816_IRQHandler          ; 15:  U7816    
		DCD     LPUARTx_IRQHandler        ; 16:  LPUART   
		DCD     I2C_IRQHandler            ; 17:  I2C    
		DCD     CCL_IRQHandler            ; 18:  CCL  
		DCD     AES_IRQHandler            ; 19:  AES    
		DCD     LPTIM_IRQHandler          ; 20:  LPTIM    
		DCD     DMA_IRQHandler            ; 21:  DMA    
		DCD     WKUPx_IRQHandler          ; 22:  WKUP    
		DCD     LUT_IRQHandler            ; 23:  LUT   
		DCD     BSTIM_IRQHandler          ; 24:  BSTIM
		DCD     COMPx_IRQHandler          ; 25:  COMPx
		DCD     GPTIM0_1_IRQHandler       ; 26:  GPTIM0_1    
		DCD     GPTIM2_IRQHandler         ; 27:  GPTIM2    
		DCD     ATIM_IRQHandler           ; 28:  ATIM    
		DCD     VREF_IRQHandler           ; 29:  VREF    
		DCD     GPIO_IRQHandler           ; 30:  GPIO
		DCD     CAN_IRQHandler      	  ; 31:  CAN
__Vectors_End
```



## 注意事项

- **对齐要求**: 向量表的起始地址通常需要对齐到特定的边界（如128字节或256字节），具体取决于处理器的实现。
- **可重定位**: 在某些情况下，向量表可以被重定位到RAM中，以支持动态修改中断向量。
- **安全性**: 确保向量表的内容在系统运行期间不会被意外修改，以防止中断处理程序被篡改。

# 寄存器

Arm-M系列的CPU寄存器有

1. 通用寄存器（General Purpose Registers）：**R0 ~ R12**：13个低位通用寄存器（Low Registers）

   - 均可用于数据运算、地址计算。
   - R0~R3 常用于函数参数传递和返回值（ABI规定）。
   - R4~R11 常用于保存局部变量。
   - R12：IP（Intra-Procedure-call scratch register），过程间调用临时寄存器。

2. 特殊功能寄存器（Special Registers）

   1. **R13 (SP)**：栈指针（Stack Pointer）
      - 有两个：Main SP (MSP) 和 Process SP (PSP)，用于操作系统线程切换。
   2. **R14 (LR)**：链接寄存器（Link Register）
      - 保存函数返回地址，调用子函数时自动保存。
   3. **R15 (PC)**：程序计数器（Program Counter）
      - 指向当前执行指令地址，可读可写（用于跳转）。

3. 其他重要系统寄存器（通过MRS/MSR指令访问）

   | 寄存器    | 名称               | 功能说明                                   |
   | --------- | ------------------ | ------------------------------------------ |
   | CONTROL   | 控制寄存器         | 选择栈指针（MSP/PSP）、特权级别、FPU使能等 |
   | PRIMASK   | 中断屏蔽寄存器     | 禁止所有可屏蔽中断（类似关全局中断）       |
   | FAULTMASK | 异常屏蔽寄存器     | 禁止所有异常（除NMI和HardFault）           |
   | BASEPRI   | 基础优先级寄存器   | 设置中断优先级阈值，屏蔽低优先级中断       |
   | IPSR      | 中断程序状态寄存器 | 当前正在执行的异常/中断编号                |
   | EPSR      | 执行程序状态寄存器 | 包含Thumb状态标志（T位）、条件标志等       |
   | APSR      | 应用程序状态寄存器 | 包含NZCVQ标志位（负、零、进位、溢出等）    |
   | xPSR      | 组合程序状态寄存器 | IPSR + EPSR + APSR 的组合（常用）          |

4. FPU寄存器（仅Cortex-M4/M7/M33带FPU时存在）

   - S0 ~ S31：32个单精度浮点寄存器（可配对成16个双精度D0~D15）

# 函数调用过程

ARM Cortex-M系列（Cortex-M0/M3/M4/M7等）芯片使用**Thumb/Thumb-2指令集**（几乎所有嵌入式应用都强制Thumb模式），GCC（arm-none-eabi-gcc）生成的函数调用遵循**AAPCS**（ARM Architecture Procedure Call Standard）调用约定。

## 调用约定（AAPCS）

调用约定（AAPCS）核心规则（Cortex-M）：

1. **参数传递**：
   - 前4个整数参数（int、指针等）用 **R0 ~ R3** 传递。
   - 第5个及以后参数压入栈（push）。
   - 返回值用 **R0**（或R0+R1用于64位）。
2. **寄存器分类**：
   - **Caller-saved**（调用者负责保存）：R0~R3、R12（可被被调用函数破坏）。
   - **Callee-saved**（被调用者负责保存）：R4~R11（如果函数使用，必须保存）。
   - **LR (R14)**：保存返回地址，调用函数时硬件自动保存到LR。
   - **SP (R13)**：栈指针。
3. **栈对齐**：SP必须8字节对齐（AAPCS要求）。

## 调用侧（Caller）

- 把前4个参数放入 R0~R3。

  - 调用函数c语言视角为：

    ```c
    Key_IO_Init(gatIoKeyTable, IO_KEY_NUM);
    ```

  - 调用函数汇编视角为：

    ```asm
    LDR            R3, =gatIoKeyTable            ; [PC, #12] [0x000294D0] =0x2000018C
    MOVS           R1, #6
    MOVS           R0, R3
    ```

    > [!note] 
    >
    > 这里看着是先将gatIoKeyTable参数的地址加载到R3寄存器中，之后又将R3的数据复制到R0中，看到汇编指令可能会有疑问，为什么不直接将gatIoKeyTable的地址存到R3中？
    >
    > ---
    >
    > **寄存器分配器的决定**：GCC 的寄存器分配器（register allocator）在生成代码时，决定使用哪个寄存器来持有这个地址。
    >
    > - 它选择了 **R3** 作为临时寄存器来加载地址（因为 R3 是 caller-saved，低寄存器，适合临时值）。
    > - 但后续代码需要这个地址在 **R0** 中（可能是作为函数参数、指针使用，或优化后 R0 更合适）。
    >
    > 因此，需要额外一条 MOVS R0, R3（或等价的 mov r0, r3）来复制值。这在优化级别下很常见（-O1/-O2/-O3），GCC 会优先使用低寄存器（R0~R3）作为临时，但最终根据使用位置调整。

- 如果有更多参数：`push {寄存器}` 或 `sub sp, #N` + `str` 存储。

  - 调用函数c语言视角为：

    ```c
    (void)AesEncryptUpdate(ECB_Zero, NULL, 16, Zero, 16, dataout, 16);
    ```

  - 调用函数汇编视角为：

    ```asm
    MOVS           R3, #40
    ADDS           R2, R7, R3
    MOVS           R3, #16
    STR            R3, [SP, #8]		；这里的STR指令就是在压栈，从上往下压栈
    MOVS           R4, #24
    ADDS           R3, R7, R4
    STR            R3, [SP, #4]
    MOVS           R3, #16
    STR            R3, [SP, #0]
    MOVS           R3, R2
    MOVS           R2, #16
    MOVS           R1, #0
    MOVS           R0, #2
    BL             AesEncryptUpdate 
    ```

    > [!note] 
    >
    > 这里可能会有疑问，栈的生长方向明明是向下的，为什么压栈的时候是将SP向上偏移压栈？
    >
    > ---
    >
    > 实际上，每个函数都有自己的栈帧，也就是每个函数都有自己的函数栈，在开始的时候，会首先分配栈空间，也就是sub指令，将栈向下生长，如以下函数序言：
    >
    > ```asm
    > ; test函数
    > PUSH           {R4-R5, R7, LR}
    > SUB            SP, SP, #16		；这里的函数分配了16个字节大小的栈空间
    > ADD            R7, SP, #0
    > STR            R0, [R7, #12]
    > STR            R1, [R7, #8]
    > STR            R2, [R7, #4]
    > STR            R3, [R7]
    > ```
    >
    > 如果调用这个函数，那么栈空间的分配为：
    >
    > ```text
    > 高地址
    > +-------------------+  	← 起始地址
    > |        数据        |   ← 外面调用test函数的栈数据
    > +-------------------+  ← 调用test函数前的SP
    > | 将要存放test函数中   |
    > | 产生的数据          |
    > +-------------------+  ← test序言结束之后的SP，分配了16个字节大小的数据
    > 低地址
    > ```
    >
    > 序言结束后，函数内部的一些操作就可以安心的使用栈了，比如将很多参数（如果栈空间足够大）都压入栈中：
    >
    > ```asm
    > STR R5, [SP, #20]   ; 第10个参数（假设）
    > STR R4, [SP, #16]   ; 第9个参数
    > STR R0, [SP, #12]   ; 第8个参数
    > STR R1, [SP, #8]    ; 第7个参数
    > STR R2, [SP, #4]    ; 第6个参数
    > STR R3, [SP, #0]    ; 第5个参数
    > ```
    >
    > 

- 调用指令：**bl  < function >**（Branch with Link）

  - 把返回地址保存到 **LR**。

  - 跳转到被调用函数。

    ```asm
     BL  Key_IO_Init 	; 这里的BL指令会跳转到Key_IO_Init，同时将PC + 4的地址保存到LR中
    ```

- 返回后：返回值在 R0，调用者可继续使用 R0~R3（因为它们可能被破坏）。

  - 在被调用者的结尾可以看到将数据移入R0寄存器的操作：

    - c语言视角为：

      ```c
       	return u8CanShouldBeClose;	//函数体执行完成
      ```

      汇编视角为：

      ```asm
      LDR            R3, =u8CanShouldBeClose       ; [PC, #8] [0x000297A8] =0x2000172E
      LDRB           R3, [R3]		;此时将计算出来的数据存放在R3中
      ```

    - 代码视角：

      ```c
      }	// 函数结束
      ```

      汇编视角：

      ```asm
      MOVS           R0, R3	; 这个时候就会将R3中的数据移至R0中
      MOV            SP, R7
      POP            {R7, PC}
      NOP
      PUSH           {R4, R7, LR}
      ```

## 被调用侧（Callee）

被调用侧除函数体外还有函数序言（prologue）和结尾（epilogue）

从C语言的角度来看：序言就是函数之前要执行的指令，结尾就是函数之后要执行的指令。💯

```c
void test()
//序言
{	

}	
//结尾
```

### 序言（prologue）

函数序言通常需要完成以下几件事（顺序可能略有差异）：

| 步骤 | 目的                                         | 典型指令                            | 说明                                                         |
| ---- | -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| 1    | 保存链接寄存器 LR（返回地址）                | PUSH {..., LR} 或包含在 push 列表中 | 如果函数会调用其他函数（非叶子函数），必须保存 LR，否则子函数的 BL 会覆盖它。 |
| 2    | 保存被调用者需要保存的寄存器（callee-saved） | PUSH {R4-R11, ...}                  | 根据 AAPCS，R4~R11、R13(SP)、R14(LR) 如果函数中使用，必须由当前函数（被调用者）负责保存和恢复。 |
| 3    | 为局部变量分配栈空间                         | SUB SP, SP, #N                      | N 是局部变量总大小（包括对齐，通常 8 字节对齐）。如果没有局部变量，可能省略。 |
| 4    | （可选）建立帧指针（Frame Pointer）          | MOV R7, SP 或 ADD R7, SP, #0        | 方便通过 [R7 + offset] 访问局部变量和参数，常用于带调试信息或中等优化级别。 |
| 5    | （可选）保存传入的参数到栈                   | STR R0, [R7, #offset] 等            | 当函数需要长期使用参数、或准备调用 varargs 函数、或需要调试信息时，会把 R0~R3 的参数备份到栈上。 |

典型序言模式为：

1. 模式1：带 frame pointer 的标准序言（最常见于 -O1/-O2 + 调试信息）

   ```asm
   PUSH    {R4-R7, LR}     ; 保存用到的 callee-saved 寄存器 + 旧 R7 + LR
   SUB     SP, SP, #32     ; 为局部变量分配空间（例如 32 字节）
   ADD     R7, SP, #0      ; 建立 frame pointer R7 = 当前 SP
   ; 可选：STR R0~R3 到 [R7 + offset] 保存参数
   ```

2. 模式2：不带 frame pointer 的优化序言（加 -fomit-frame-pointer，-O2/-O3 常见）

   ```asm
   PUSH    {R4-R7, LR}     ; 只保存实际用到的寄存器 + LR
   SUB     SP, SP, #24     ; 分配局部变量空间（所有访问用 SP + offset）
   ; 不再有 MOV R7, SP
   ```

3. 模式3：叶子函数序言（函数内部不调用其他函数，所以不需要将LR压栈）

   ```asm
   PUSH    {R4-R6}         ; 只保存用到的寄存器，不需要保存 LR（因为不会被覆盖）
   SUB     SP, SP, #16     ; 分配局部变量
   ; 返回时用 BX LR（LR 仍是调用者写入的）
   ```

4. 模式4：极简序言（无局部变量、无需保存寄存器）

   ```asm
   ; 什么都不做，直接进入函数体
   ; 返回用 BX LR
   ```

> [!tip] 
>
> 为什么序言必须做这些事？
>
> 1. **保证正确返回**：保存 LR（返回地址），否则子函数调用会破坏它，导致返回到错误位置。
> 2. **遵守调用约定（AAPCS）**：callee-saved 寄存器（R4~R11）必须由当前函数保存和恢复，不能破坏调用者的值。
> 3. **为局部变量提供空间**：栈向下增长，sub sp 预留空间。
> 4. **便于访问变量**：用 frame pointer（R7）或 SP + offset 统一访问局部变量和参数备份。
> 5. **支持调试和异常栈回溯**：带 frame pointer 的序言能让调试器（gdb）或异常处理程序准确展开调用栈。



### 结尾（Epilogue）

函数结尾（epilogue）的主要任务是**逆序撤销序言（prologue）所做的一切**，恢复调用者的寄存器环境、释放栈空间，并正确返回到调用者。

==**结尾必须严格与序言对应**==，否则会导致栈失衡、寄存器破坏或返回地址错误。

| 步骤 | 目的                          | 典型指令                                   | 说明                                                         |
| ---- | ----------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| 1    | 释放局部变量栈空间            | ADD SP, SP, #N<br>或直接融入 POP           | 把序言中 SUB SP, SP, #N 分配的空间回收，使 SP 回到保存寄存器前的位置。 |
| 2    | 恢复 callee-saved 寄存器和 LR | POP {R4-R11, ... , LR}<br>或 POP {..., PC} | 把序言中 PUSH 保存的寄存器值恢复回来。特别重要的是恢复 LR（返回地址）。 |
| 3    | 返回到调用者                  | POP 到 PC<br>或 BX LR                      | 将 LR 中的返回地址写入 PC，实现跳转回调用者 BL 指令的下一条指令。 |

常见结尾模式（与序言对应）

1. 模式1：带 frame pointer 的标准结尾（最常见，与你序言匹配）

   序言示例：

   ```asm
   PUSH {R4-R5, R7, LR}
   SUB  SP, SP, #16
   ADD  R7, SP, #0
   ```

   对应结尾通常是：

   ```asm
   ADD     SP, SP, #16     ; 释放局部变量空间（恢复到 push 后的 SP）
   POP     {R4-R5, R7, PC} ; 一次性恢复 R4、R5、旧 R7，并把保存的 LR 直接 pop 到 PC 返回
   ```

   或者等价的两步形式（较少见）：

   ```asm
   ADD     SP, SP, #16
   POP     {R4-R5, R7, LR}
   BX      LR
   ```

   **关键点**：Thumb 模式下允许 `POP {..., PC}`，硬件会特殊处理把 LR 值写入 PC 并自动切换到 Thumb 状态。

2. 模式2：不带 frame pointer 的优化结尾

   序言：

   ```asm
   PUSH {R4-R7, LR}
   SUB  SP, SP, #24
   ```

   结尾：

   ```asm
   ADD     SP, SP, #24
   POP     {R4-R7, PC}      ; 直接返回
   ```

3. 模式3：叶子函数结尾（序言没保存 LR）

   序言只 PUSH 了部分寄存器，没动 LR：

   ```asm
   PUSH {R4-R6}
   SUB  SP, SP, #16
   ```

   结尾：

   ```asm
   ADD     SP, SP, #16
   POP     {R4-R6}
   BX      LR               ; LR 仍是调用者 BL 时写入的原始返回地址
   ```


> [!important]
>
> 为什么结尾可以直接 POP 到 PC？
>
> - Thumb/Thumb-2 指令集特意设计了 `POP {..., PC}` 和 `LDMIA SP!, {..., PC}` 支持这种高效返回。
> - 硬件检测到写 PC 时，会自动清除 LR 最低位的 Thumb 状态位（因为它本来就是置 1 的），确保返回后仍在 Thumb 模式执行。

结尾的核心任务

1. **释放局部变量空间**（ADD SP 或融入 POP）。
2. **恢复所有保存的寄存器**（包括旧 R7 如果用了 frame pointer）。
3. **恢复返回地址到 PC**（POP PC 或 BX LR）。

只要结尾严格逆序对应序言，就能保证：
- 栈平衡（不泄漏内存）。
- 寄存器环境不变（调用者看不到变化）。
- 正确返回。

这也是为什么阅读反汇编时，看到结尾基本就是序言的“镜像反操作”。

**总结**：函数序言的核心任务就是**“保存必要寄存器 + 分配栈空间 + 建立访问基址”**，确保函数体能安全执行，并在退出时正确恢复现场并返回。GCC 会根据优化级别、是否需要调试信息、函数是否为叶子函数等自动选择最合适的序言形式。

# CPU错误状态

当CPU出现问题时，我们可以通过CPU的一些寄存器可以看出问题的来源：

1. 首要查看：故障状态寄存器（Fault Status Registers）

   这些寄存器位于 System Control Block (SCB) 中，专门记录当前是否发生了故障以及故障类型。

   | 寄存器名称                                     | 地址（相对于 SCB） | 含义                                                         |
   | ---------------------------------------------- | ------------------ | ------------------------------------------------------------ |
   | SCB->CFSR (Configurable Fault Status Register) | 0xE000ED28         | 最重要！分为三部分：UFSR / BFSR / MMFSR，记录 UsageFault、BusFault、MemManageFault 的具体原因 |
   | SCB->HFSR (HardFault Status Register)          | 0xE000ED2C         | 记录是否发生了 HardFault，以及是否由其他故障升级而来         |
   | SCB->DFSR (Debug Fault Status Register)        | 0xE000ED30         | 调试相关故障（一般不关心）                                   |
   | SCB->MMFAR (MemManage Fault Address Register)  | 0xE000ED34         | MemManage 故障时的无效地址                                   |
   | SCB->BFAR (Bus Fault Address Register)         | 0xE000ED38         | BusFault 时的无效地址                                        |

   **推荐做法**：在 HardFault_Handler 或其他故障处理函数里第一时间读取并保存 SCB->HFSR 和 SCB->CFSR 的值。

2. CFSR 寄存器详解（最有诊断价值）

   CFSR 是 32 位寄存器，分成三个子寄存器（位段）：

   | 位段                           | 位位置  | 常见标志位及含义                                             |
   | ------------------------------ | ------- | ------------------------------------------------------------ |
   | UFSR (Usage Fault Status)      | [31:16] | UNDEFINSTR：执行了未定义指令<br>DIVBYZERO：除以 0（需使能）<br>UNALIGNED：非对齐访问（需使能）<br>NOCP：访问了不存在的协处理器<br>INVPC：无效的 PC 加载（异常返回错误）<br>INVSTATE：无效的 EPSR 状态（通常 Thumb 位错误） |
   | BFSR (Bus Fault Status)        | [15:8]  | IBUSERR：指令预取总线错误<br>PRECISERR：精确数据总线错误（有有效地址在 BFAR）<br>IMPRECISERR：非精确数据总线错误（地址可能不准）<br>UNSTKERR：异常返回时出栈错误<br>STKERR：异常入栈错误 |
   | MMFSR (MemManage Fault Status) | [7:0]   | IACCVIOL：指令访问违反 MPU 或缺页<br>DACCVIOL：数据访问违反 MPU 或缺页<br>MUNSTKERR：异常返回时 MPU 违反<br>MSTKERR：异常入栈时 MPU 违反<br>MLSPERR：浮点懒惰状态保存错误（M7） |

   只要 CFSR 不为 0，就说明发生了可配置故障。

3. 其他有助于诊断的寄存器

   | 寄存器           | 含义                                                         |
   | ---------------- | ------------------------------------------------------------ |
   | SCB->ICSR        | 包含当前正在执行的异常号（VectActive）和挂起的异常           |
   | SCB->SHCSR       | 使能了哪些故障（MemManage、BusFault、UsageFault）            |
   | LR（进入异常时） | 进入异常前的值通常是特殊 EXC_RETURN 值（如 0xFFFFFFF1/9/D/E），可以判断是从线程还是 Handler 模式进入、是否用了 FPU 等 |
   | 栈上保存的上下文 | 异常发生时硬件自动压入栈的 8 个寄存器（R0-R3,R12,LR,PC,xPSR），其中栈上的 PC 就是故障指令地址！ |


> [!tip]
>
> 需要注意的是，有些芯片是没有不支持这些寄存器的，如M0的核就不支持这些寄存器。

在写代码的时候可以在 HardFault_Handler 中加入以下代码（C 语言）：

```c
void HardFault_Handler(void)
{
    volatile uint32_t hfsr = SCB->HFSR;
    volatile uint32_t cfsr = SCB->CFSR;
    volatile uint32_t mmfar = SCB->MMFAR;
    volatile uint32_t bfar  = SCB->BFAR;
    volatile uint32_t stacked_pc;  // 故障指令地址

    // 从栈中提取发生故障时的 PC（需要知道当前栈指针）
   __asm volatile (
        "tst lr, #4 \n"          // 第1步：测试 LR 的 bit2 是否为 1
        "ite eq \n"              // 第2步：如果等于 0（EQ），则执行下一条指令的 E 版本，否则 T 版本
        "mrseq r0, msp \n"       // 第3步：如果 EQ（bit2 == 0），把 MSP（主栈指针）加载到 R0
        "mrsne r0, psp \n"       // 第4步：如果 NE（bit2 == 1），把 PSP（进程栈指针）加载到 R0
        "ldr %0, [r0, #24]"      // 第5步：从 R0（即正确的栈指针） + 24 字节偏移处加载值到输出变量 stacked_pc
        : "=r" (stacked_pc)      // 输出操作数：stacked_pc 接收 ldr 加载的值
	);

    while(1);  // 停在这里，用调试器查看以上变量，不过尽量不要使用死循环，可以在这里打个断点查看stacked_pc数据
}
```

用 J-Link / ST-Link / DAPLink 连接后，程序停在 HardFault 时，直接在调试器里查看 cfsr、hfsr、stacked_pc，就能快速定位：
- 是非法指令？
- 是非法地址访问？
- 是除零？
- 是栈溢出导致入栈失败？
- 还是返回时出栈错误？

# thumb指令集

## 数据处理

| **指令** | **格式**            | **功能**                      | **示例**         |
| -------- | ------------------- | ----------------------------- | ---------------- |
| MOV      | `MOV Rd, Rm`        | 复制 `Rm` 到 `Rd`             | `MOV R1, R2`     |
| MVN      | `MVN Rd, Rm`        | `Rd = ~Rm`（按位取反）        | `MVN R1, R2`     |
| ADD      | `ADD Rd, Rn, Rm`    | `Rd = Rn + Rm`                | `ADD R1, R2, R3` |
|          | `ADD Rd, Rn, #imm3` | `Rd = Rn + 3-bit 立即数`      | `ADD R1, R2, #1` |
| SUB      | `SUB Rd, Rn, Rm`    | `Rd = Rn - Rm`                | `SUB R1, R2, R3` |
|          | `SUB Rd, Rn, #imm3` | `Rd = Rn - 3-bit 立即数`      | `SUB R1, R2, #1` |
| AND      | `AND Rd, Rm`        | `Rd = Rd & Rm`（按位与）      | `AND R1, R2`     |
| ORR      | `ORR Rd, Rm`        | `Rd = Rd | Rm`（按位或）      | `ORR R1, R2`     |
| EOR      | `EOR Rd, Rm`        | `Rd = Rd ^ Rm`（按位异或）    | `EOR R1, R2`     |
| NEG      | `NEG Rd, Rm`        | `Rd = -Rm`（取负）            | `NEG R1, R2`     |
| CMP      | `CMP Rn, Rm`        | 比较 `Rn` 和 `Rm`，设置标志位 | `CMP R1, R2`     |
|          | `CMP Rn, #imm8`     | 比较 `Rn` 和 8-bit 立即数     | `CMP R1, #10`    |
| TST      | `TST Rn, Rm`        | 测试 `Rn & Rm`，设置标志位    | `TST R1, R2`     |

## 移位操作

| **指令** | **格式**            | **功能**                    | **示例**         |
| -------- | ------------------- | --------------------------- | ---------------- |
| LSL      | `LSL Rd, Rm, #imm5` | 逻辑左移 `Rm`（最多 31 位） | `LSL R1, R2, #4` |
| LSR      | `LSR Rd, Rm, #imm5` | 逻辑右移 `Rm`（最多 31 位） | `LSR R1, R2, #4` |
| ASR      | `ASR Rd, Rm, #imm5` | 算术右移 `Rm`（符号位扩展） | `ASR R1, R2, #4` |
| ROR      | `ROR Rd, Rm, #imm5` | 循环右移 `Rm`               | `ROR R1, R2, #4` |

## 分支与控制

| **指令** | **格式**        | **功能**                            | **示例**                 |
| -------- | --------------- | ----------------------------------- | ------------------------ |
| B        | `B label`       | 无条件跳转到 `label`                | `B loop`                 |
| BL       | `BL label`      | 跳转到 `label`，保存返回地址到 `LR` | `BL func`                |
| BX       | `BX Rm`         | 跳转到 `Rm`，可切换 ARM/Thumb 模式  | `BX R1`                  |
| BEQ/BNE  | `B{cond} label` | 条件跳转（基于 `CPSR` 标志位）      | `BEQ loop`（Z=1 时跳转） |

## 加载和存储

| **指令** | **格式**                | **功能**                        | **示例**              |
| -------- | ----------------------- | ------------------------------- | --------------------- |
| LDR      | `LDR Rd, [Rn, #imm5]`   | 从 `[Rn + imm5]` 加载 32 位数据 | `LDR R1, [R2, #4]`    |
| STR      | `STR Rd, [Rn, #imm5]`   | 存储 `Rd` 到 `[Rn + imm5]`      | `STR R1, [R2, #4]`    |
| LDRB     | `LDRB Rd, [Rn, #imm5]`  | 从 `[Rn + imm5]` 加载 8 位数据  | `LDRB R1, [R2, #4]`   |
| STRB     | `STRB Rd, [Rn, #imm5]`  | 存储 `Rd` 的低 8 位             | `STRB R1, [R2, #4]`   |
| LDRH     | `LDRH Rd, [Rn, #imm5]`  | 从 `[Rn + imm5]` 加载 16 位数据 | `LDRH R1, [R2, #4]`   |
| STRH     | `STRH Rd, [Rn, #imm5]`  | 存储 `Rd` 的低 16 位            | `STRH R1, [R2, #4]`   |
| LDMIA    | `LDMIA Rn!, {reg-list}` | 从 `Rn` 加载多个寄存器（递增）  | `LDMIA R1!, {R2, R3}` |
| STMIA    | `STMIA Rn!, {reg-list}` | 存储多个寄存器到 `Rn`（递增）   | `STMIA R1!, {R2, R3}` |

## 栈操作

| **指令** | **格式**          | **功能**                          | **示例**        |
| -------- | ----------------- | --------------------------------- | --------------- |
| PUSH     | `PUSH {reg-list}` | 压入寄存器到栈（`SP` 递减）       | `PUSH {R1, R2}` |
| POP      | `POP {reg-list}`  | 从栈弹出数据到寄存器（`SP` 递增） | `POP {R1, R2}`  |

## 软件中断

| **指令** | **格式**    | **功能**                      | **示例** |
| -------- | ----------- | ----------------------------- | -------- |
| SWI      | `SWI #imm8` | 触发软件中断（`imm8` 为参数） | `SWI #0` |

## 其他

| **指令** | **格式**         | **功能**                        | **示例**         |
| -------- | ---------------- | ------------------------------- | ---------------- |
| ADC      | `ADC Rd, Rm`     | 带进位加法 `Rd = Rd + Rm + C`   | `ADC R1, R2`     |
| SBC      | `SBC Rd, Rm`     | 带借位减法 `Rd = Rd - Rm - !C`  | `SBC R1, R2`     |
| MUL      | `MUL Rd, Rm`     | 乘法 `Rd = Rd * Rm`（低 32 位） | `MUL R1, R2`     |
| RSB      | `RSB Rd, Rn, #0` | 反向减法 `Rd = 0 - Rn`          | `RSB R1, R2, #0` |
| CMN      | `CMN Rn, Rm`     | 比较 `Rn + Rm`，设置标志位      | `CMN R1, R2`     |
| ADR      | `ADR Rd, label`  | 加载 `label` 的地址到 `Rd`      | `ADR R1, data`   |









