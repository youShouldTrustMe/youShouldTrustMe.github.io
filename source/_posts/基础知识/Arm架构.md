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



## 初始化

### 向量表内容

1. **初始堆栈指针 (SP)**:
   - **位置**: 向量表的第一个条目（偏移量0）。
   - **内容**: 初始化堆栈指针的地址。系统复位时，处理器会将这个值加载到主堆栈指针（MSP）寄存器中。

2. **复位处理程序地址 (PC)**:
   - **位置**: 向量表的第二个条目（偏移量4）。
   - **内容**: 复位处理程序的入口地址。系统复位时，处理器会跳转到这个地址开始执行。

3. **异常和中断处理程序地址**:
   - **位置**: 从向量表的第三个条目开始（偏移量8），依次存放各个异常和中断的处理程序地址。
   - **内容**: 包括各种异常（如NMI、硬故障）和外部中断的处理程序地址。每个处理程序地址占用4个字节。

### 向量表排列示例

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

### 注意事项

- **对齐要求**: 向量表的起始地址通常需要对齐到特定的边界（如128字节或256字节），具体取决于处理器的实现。
- **可重定位**: 在某些情况下，向量表可以被重定位到RAM中，以支持动态修改中断向量。
- **安全性**: 确保向量表的内容在系统运行期间不会被意外修改，以防止中断处理程序被篡改。

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









