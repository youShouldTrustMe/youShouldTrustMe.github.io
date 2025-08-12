---
title: Arm架构

date: 2025-03-01
lastmod: 2025-03-01
draft: true
tags:
- 基础知识
---





在ARM Cortex-M架构中，向量表是一个关键的数据结构，用于存储中断和异常处理程序的入口地址。向量表通常位于Flash存储的起始位置，并且其内容和排列位置是固定的。以下是向量表中存放的内容及其排列位置：

# 参考链接

[Documentation for binutils 2.40 (sourceware.org)](https://sourceware.org/binutils/docs-2.40/)

[GDB Documentation (sourceware.org)](https://sourceware.org/gdb/documentation/)

[Using as (sourceware.org)](https://sourceware.org/binutils/docs-2.40/as.html)

[Documentation – Arm Developer](https://developer.arm.com/documentation#tab=all&cf-navigationhierarchiesproducts=Architectures,CPU Architecture,M-Profile,Armv6-M&numberOfResults=48)



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