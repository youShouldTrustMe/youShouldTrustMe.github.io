---
date: 2026-08-08 08:24:41
title: A2L文件

categories: 
  - 基础知识
---

# 什么是 A2L 文件？

**A2L** 的全称是 **ASAM MCD-2 MC Language**，它是 **ASAM** （国际自动化和测量系统标准化协会）定义的一种 **描述文件**，用于描述 **ECU（电子控制单元）内部数据的接口**。

它本身不包含数据，而是存储了以下信息：

*   **ECU 中有哪些变量**（标定参数、测量信号）。
*   **这些变量在内存中的存储格式**（数据类型、大小、字节序）。
*   **物理值与内存原始值的转换规则**（如公式、映射表）。
*   **变量的访问地址**。
*   **变量的依赖关系**（例如，某个曲线表的 X 轴和 Y 轴分布）。

标定工具（如 INCA、CANape、ECU-Test）会读取 A2L 文件，从而理解如何与 ECU 通信、读取/修改变量的值。

# A2L 文件的基本格式

A2L 文件是纯文本文件，使用 **层次化、结构化的关键字系统**。

## 核心规则
*   **大小写不敏感**：`BEGIN` 和 `begin` 含义相同。
*   **代码块结构**：几乎所有的定义都包裹在成对的 `/begin` 和 `/end` 之间。
*   **注释**：使用 `//` 和 `/* ... */`，与 C 语言相同。
*   **字符串**：用双引号包裹 `"example"`。
*   **数值**：支持十六进制（如 `0x1A2B`）和十进制。

## 核心代码块示例
一个最小的 A2L 文件结构可以这样表示：

```a2l
ASAP2_VERSION 1 61

/begin PROJECT MyProject "My project description"
  
  /begin MODULE MyECU "Engine Control Unit"
    
    /begin MOD_PAR ""
      // 模块参数（如 CPU 类型、字节序）
    /end MOD_PAR

    /begin MEASUREMENT EngineSpeed "Engine Speed"
      // 测量变量定义，工具可读取但不可修改
    /end MEASUREMENT

    /begin CHARACTERISTIC FuelMap "Fuel Injection Map"
      // 标定变量定义，工具可读取并修改
    /end CHARACTERISTIC

    /begin COMPU_METHOD LinearConv "Linear conversion"
      // 转换规则定义
    /end COMPU_METHOD

  /end MODULE

/end PROJECT
```

## A2L 各层级关键字详解

我们将文件内容划分为四个层次：

1. **项目全局 **
2. **模块配置**
3. **对象定义**
4. **细节支撑**。

### 顶层：PROJECT
**关键字**：`/begin PROJECT` ... `/end PROJECT`
**作用**：整个文件的根节点。包含头信息和所有模块。
**关键子元素**：
*   `HEADER`：文件创建者、版本等注释信息。
*   `MODULE`：包含一个 ECU 项目的所有信息。

### 核心层：MODULE（模块）
**关键字**：`/begin MODULE` ... `/end MODULE`
**作用**：对应一个 ECU 软件项目的完整描述。是最重要的组织单元。
**关键子块**：

*   **`MOD_PAR` (Module Parameters)**：
   定义模块的基本属性，如内存对齐方式、CPU 类型、数据字节序（`MSB_LAST` 或 `MSB_FIRST`）、数据大小等。标定工具依据这些信息来正确解析二进制数据。
   ```a2l
   /begin MOD_PAR ""
     ADDR_EPK 0x40000100
     CPU_TYPE "TriCore"
     MEMORY_SEGMENT Flash "0x80000000" "0x80100000" ...
   /end MOD_PAR
   ```

*   **`MOD_COMMON`**：
   定义模块的公共属性，如默认的转换方法、最大刷新率等。

### 测量与标定对象：MEASUREMENT 和 CHARACTERISTIC
这是 A2L 文件中数量最多的部分，直接描述信号和参数。

*   **`/begin MEASUREMENT` ... `/end MEASUREMENT`**
   **含义**：**测量变量**。指工具从 ECU 只读（Read-Only）观测的信号，如发动机转速、水温。标定工具不能修改它，但可以显示和记录。
   **关键子关键字**：
   
   *   `ECU_ADDRESS`：变量在内存中的绝对地址，如 `0x40001200`。
   *   `DATATYPE`：数据类型，如 `UBYTE`（无符号字节）、`UWORD`、`SWORD`、`FLOAT32_IEEE`。
   *   `CONVERSION`：引用的转换方法名称（指向 COMPU_METHOD），用于将原始值转为物理值。
   *   `RESOLUTION`：Deprecated，建议用 CONVERSION 替代。
   *   `LOWER_LIMIT` / `UPPER_LIMIT`：物理值的有效范围。
   *   `DISPLAY_IDENTIFIER`：在工具界面显示的标签。
   
   ```a2l
   /begin MEASUREMENT EngineSpeed "Current engine speed"
     LONG_IDENTIFIER "Crankshaft speed in RPM"
     DATATYPE UWORD
     CONVERSION Speed_Conv
     ECU_ADDRESS 0x80A01002
     LOWER_LIMIT 0
     UPPER_LIMIT 9000
   /end MEASUREMENT
   ```
   
*   **`/begin CHARACTERISTIC` ... `/end CHARACTERISTIC`**
   **含义**：**标定变量**（参数/曲线/图）。是工具可以读写的变量，用于调整 ECU 行为（如点火提前角、喷油量基础值）。
   **关键子关键字**：
   *   `ECU_ADDRESS` / `READ_WRITE`：地址。对于曲线/图，地址可能指向一个数据块起始位置。
   *   `TYPE`：变量类型。
       *   `VALUE`：单值标量。
       *   `CURVE`：一维曲线（查表，需指定 AXIS_DESCR）。
       *   `MAP`：二维图（查表，需指定两个 AXIS_DESCR）。
   *   `MAXDIFF`：标定工具写入时允许的最大差值（用于安全校验，已较少使用）。
   *   `EXTENDED_LIMITS`：扩展的限制范围。
   *   **`AXIS_DESCR`**：当 TYPE 是 CURVE 或 MAP 时，必须定义。它引用一个 `AXIS_PTS` 对象来描述坐标轴。

   ```a2l
   /begin CHARACTERISTIC IgnTiming_Map "Ignition Timing Map"
     TYPE MAP
     ECU_ADDRESS 0x80010000
     CONVERSION Ignition_Conv
     RECORD_LAYOUT MapLayout
     AXIS_DESCR {
       AXIS_PTS_X EngineSpeed_Axis
       AXIS_PTS_Y Load_Axis
     }
   /end CHARACTERISTIC
   ```

*   **`/begin AXIS_PTS` ... `/end AXIS_PTS`**
   **含义**：**轴点分布**。定义曲线或图的 X/Y 轴上的刻度点数组。通常本身也是一个 MEASUREMENT 或 CHARACTERISTIC，指向数组存储地址。
   ```a2l
   /begin AXIS_PTS EngineSpeed_Axis "Speed axis points"
     ECU_ADDRESS 0x80008000
     DATATYPE UWORD
     CONVERSION Speed_Conv
     MAX_AXIS_PTS 16
   /end AXIS_PTS
   ```

### 支撑定义层
*   **`/begin COMPU_METHOD` ... `/end COMPU_METHOD`**
   **含义**：**转换方法**。定义原始值（ECU 内存中存储的整数）与物理值（人类可读的工程单位）之间的转换关系。
   **关键子关键字**：
   *   `FORMAT`：物理值格式字符串，如 `"%5.2f"`。
   *   `UNIT`：物理单位，如 `"rpm"`。
   *   `COMPU_TAB_REF` / `FORMULA` / `RAT_FUNC`：转换具体方式。
     *   `FORMULA`：线性公式 `f(x) = (a * x) / b + c`，如 `0.125 0.0` 表示 `物理值 = 原始值 * 0.125`。
     *   `COMPU_TAB_REF`：引用查找表（需配合 `COMPU_VTAB` 使用），用于非线性映射（如 NTC 温度传感器曲线）。

   ```a2l
   /begin COMPU_METHOD Speed_Conv "Speed conversion"
     UNIT "rpm"
     FORMAT "%6.0f"
     FORMULA "0.5 0.0"  // phys = raw * 0.5 + 0.0
   /end COMPU_METHOD
   ```

*   **`/begin RECORD_LAYOUT` ... `/end RECORD_LAYOUT`**
   **含义**：**记录布局**。定义了结构体、数组或映射在内存中的排列方式。对于复杂数据（如 MAP）至关重要。
   *   `FNC_VALUES`：指定值在连续地址中的存储顺序（通常是逐行存储，方向由 `ROW_DIR` 和 `COLUMN_DIR` 指定）。

*   **`/begin FUNCTION` ... `/end FUNCTION`**
   **含义**：**功能组**。可以将多个测量/标定变量分组，以便工具按功能（如“点火系统”、“燃油系统”）分类显示。
   *   `REF_MEASUREMENT` / `REF_CHARACTERISTIC`：引用已定义的对象。

*   **`/begin GROUP` ... `/end GROUP`**
   **含义**：**对象组**。另一种分组方式，常用于定义一组需要同时刷新的变量。

*   **`/begin IF_DATA` ... `/end IF_DATA`**
   **含义**：**接口数据**。用于存储特定于协议（如 XCP、CCP）或工具的信息，通常由工具自动生成。例如，XCP 的地址扩展位、传输层参数等。

### 完整示例：一个简单的车速信号

```a2l
ASAP2_VERSION 1 61

/begin PROJECT Vehicle "Vehicle Control System"
  
  /begin MODULE EMS "Engine Management System"
    
    /begin MOD_PAR ""
      MEMORY_SEGMENT Flash "0x80000000" "0x80100000" PROTECTED
    /end MOD_PAR

    /begin COMPU_METHOD VehicleSpeed_Conv "Speed conversion"
      UNIT "km/h"
      FORMAT "%3.1f"
      FORMULA "0.1 0.0"
    /end COMPU_METHOD

    /begin MEASUREMENT VehicleSpeed "Vehicle Speed"
      LONG_IDENTIFIER "Current speed from wheel sensors"
      DATATYPE UWORD
      CONVERSION VehicleSpeed_Conv
      ECU_ADDRESS 0x80010010
      LOWER_LIMIT 0
      UPPER_LIMIT 300
    /end MEASUREMENT

  /end MODULE

/end PROJECT
```



# Elf转A2l

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从ELF文件生成A2L文件
解析ELF文件中的符号信息，自动生成符合ASAP2标准的A2L文件
"""

import re
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

try:
    from elftools.elf.elffile import ELFFile
    from elftools.elf.sections import SymbolTableSection
    from elftools.elf.constants import SH_FLAGS
except ImportError:
    print("请安装 pyelftools: pip install pyelftools")
    sys.exit(1)


class ELFToA2LGenerator:
    """从ELF文件生成A2L文件"""
    
    # 常见C语言数据类型到A2L数据类型的映射
    C_TYPE_TO_A2L = {
        # 整数类型
        'int8_t': 'SBYTE',
        'sint8': 'SBYTE',
        'char': 'SBYTE',
        'uint8_t': 'UBYTE',
        'unsigned char': 'UBYTE',
        'int16_t': 'SWORD',
        'short': 'SWORD',
        'uint16_t': 'UWORD',
        'unsigned short': 'UWORD',
        'int32_t': 'SLONG',
        'int': 'SLONG',
        'long': 'SLONG',
        'uint32_t': 'ULONG',
        'unsigned int': 'ULONG',
        'unsigned long': 'ULONG',
        'int64_t': 'A_INT64',
        'long long': 'A_INT64',
        'uint64_t': 'A_UINT64',
        'unsigned long long': 'A_UINT64',
        
        # 浮点类型
        'float': 'FLOAT32_IEEE',
        'double': 'FLOAT64_IEEE',
        
        # 特殊类型
        'bool': 'UBYTE',
        '_Bool': 'UBYTE',
    }
    
    # 常见变量名前缀分类规则
    VARIABLE_CLASSIFICATION = {
        'MEASUREMENT': [
            r'^(rpm|speed|temp|press|volt|current|angle|pos|status|state|flag|err|fault)',
            r'^(adc|sensor|input|feedback|actual|measured)',
            r'_(st|sts|stat|status|state)$',
            r'^(raw|filtered|avg|mean|max|min)',
        ],
        'CHARACTERISTIC': [
            r'^(cal|cfg|config|param|const|tune|threshold|limit|gain|offset)',
            r'^(kp|ki|kd|pid|factor|coeff|ratio)',
            r'^(map|curve|table|array)',
            r'_(cal|cfg|config|param|const|tune)$',
        ],
        'AXIS_PTS': [
            r'_(axis|ax|pts|points|break|bp)$',
            r'^(axis|ax|pts|points|break|bp)_',
            r'_x$|_y$|_z$',
        ]
    }
    
    def __init__(self, elf_file, config=None):
        """
        初始化生成器
        
        Args:
            elf_file: ELF文件路径
            config: 配置字典，可以覆盖默认设置
        """
        self.elf_file = Path(elf_file)
        self.config = config or {}
        self.symbols = {}
        self.symbol_details = {}
        
        # 项目信息
        self.project_name = self.config.get('project_name', 'AutoGenerated')
        self.project_desc = self.config.get('project_desc', 'Auto-generated from ELF')
        self.module_name = self.config.get('module_name', 'ECU')
        self.module_desc = self.config.get('module_desc', 'ECU Module')
        
        # 内存段配置
        self.memory_segments = self.config.get('memory_segments', [
            {
                'name': 'Flash',
                'start': '0x80000000',
                'end': '0x81000000',
                'type': 'PROTECTED'
            }
        ])
        
        # 地址过滤
        self.min_address = int(self.config.get('min_address', '0x100'), 16)
        self.max_address = int(self.config.get('max_address', '0xFFFFFFFF'), 16)
        
        # 变量分类模式
        self.measurement_patterns = self.config.get(
            'measurement_patterns',
            self.VARIABLE_CLASSIFICATION['MEASUREMENT']
        )
        self.characteristic_patterns = self.config.get(
            'characteristic_patterns',
            self.VARIABLE_CLASSIFICATION['CHARACTERISTIC']
        )
        self.axis_patterns = self.config.get(
            'axis_patterns',
            self.VARIABLE_CLASSIFICATION['AXIS_PTS']
        )
        
    def parse_elf(self):
        """解析ELF文件，提取符号信息"""
        print(f"正在解析ELF文件: {self.elf_file}")
        print("-" * 60)
        
        if not self.elf_file.exists():
            raise FileNotFoundError(f"ELF文件不存在: {self.elf_file}")
        
        with open(self.elf_file, 'rb') as f:
            elffile = ELFFile(f)
            
            # 获取架构信息
            arch = elffile.get_machine_arch()
            print(f"ELF架构: {arch}")
            print(f"字节序: {'Little' if elffile.little_endian else 'Big'} Endian")
            
            # 解析符号表
            self._parse_symbol_tables(elffile)
            
            # 解析调试信息（如果有）
            if self.config.get('use_debug_info', True):
                self._parse_debug_info(elffile)
            
            # 获取段信息
            self._parse_sections(elffile)
        
        print(f"\n解析完成:")
        print(f"  - 总符号数: {len(self.symbols)}")
        print(f"  - 包含类型信息: {len([s for s in self.symbol_details.values() if s.get('datatype')])}")
        print(f"  - 变量符号: {len([s for s in self.symbol_details.values() if s.get('category') == 'VARIABLE'])}")
        print(f"  - 函数符号: {len([s for s in self.symbol_details.values() if s.get('category') == 'FUNCTION'])}")
        
        return self.symbols
    
    def _parse_symbol_tables(self, elffile):
        """解析符号表"""
        for section in elffile.iter_sections():
            if not isinstance(section, SymbolTableSection):
                continue
            
            print(f"解析符号表: {section.name}")
            
            for symbol in section.iter_symbols():
                if not self._is_valid_symbol(symbol):
                    continue
                
                name = symbol.name
                addr = symbol['st_value']
                size = symbol['st_size']
                
                # 过滤地址
                if addr < self.min_address or addr > self.max_address:
                    continue
                
                self.symbols[name] = addr
                
                # 保存详细信息
                self.symbol_details[name] = {
                    'address': addr,
                    'size': size,
                    'type': symbol['st_info']['type'],
                    'bind': symbol['st_info']['bind'],
                    'section_index': symbol['st_shndx'],
                }
    
    def _parse_debug_info(self, elffile):
        """解析DWARF调试信息（获取变量类型）"""
        try:
            if not elffile.has_dwarf_info():
                print("ELF文件不包含DWARF调试信息")
                return
            
            dwarfinfo = elffile.get_dwarf_info()
            
            # 解析编译单元
            for CU in dwarfinfo.iter_CUs():
                for DIE in CU.iter_DIEs():
                    # 查找变量定义
                    if DIE.tag in ['DW_TAG_variable', 'DW_TAG_formal_parameter']:
                        try:
                            name = DIE.attributes.get('DW_AT_name')
                            if not name:
                                continue
                            
                            name = name.value.decode('utf-8')
                            
                            # 获取数据类型
                            type_die = DIE.attributes.get('DW_AT_type')
                            if type_die:
                                type_info = self._resolve_type(type_die.value + CU.cu_offset, dwarfinfo)
                                if name in self.symbol_details:
                                    self.symbol_details[name]['datatype'] = type_info['name']
                                    self.symbol_details[name]['type_size'] = type_info['size']
                            
                            # 获取地址（如果符号表中没有）
                            location = DIE.attributes.get('DW_AT_location')
                            if location and name not in self.symbols:
                                addr = self._parse_location(location.value)
                                if addr:
                                    self.symbols[name] = addr
                                    self.symbol_details[name] = {
                                        'address': addr,
                                        'size': type_info.get('size', 0) if type_info else 0,
                                    }
                        except:
                            continue
                            
        except Exception as e:
            print(f"解析调试信息时出错: {e}")
    
    def _resolve_type(self, offset, dwarfinfo):
        """递归解析类型信息"""
        try:
            CU = dwarfinfo.get_CU_at(offset)
            if not CU:
                return None
            
            DIE = CU.get_DIE_from_refaddr(offset)
            
            type_info = {
                'name': None,
                'size': None,
            }
            
            # 获取类型名称
            name_attr = DIE.attributes.get('DW_AT_name')
            if name_attr:
                type_info['name'] = name_attr.value.decode('utf-8')
            
            # 获取类型大小
            size_attr = DIE.attributes.get('DW_AT_byte_size')
            if size_attr:
                type_info['size'] = size_attr.value
            
            # 如果是基类型，直接返回
            if DIE.tag == 'DW_TAG_base_type':
                return type_info
            
            # 如果是typedef，解析引用的类型
            if DIE.tag == 'DW_TAG_typedef':
                type_ref = DIE.attributes.get('DW_AT_type')
                if type_ref:
                    return self._resolve_type(type_ref.value + CU.cu_offset, dwarfinfo)
            
            return type_info
            
        except Exception:
            return None
    
    def _parse_sections(self, elffile):
        """解析段信息"""
        self.sections = {}
        
        for section in elffile.iter_sections():
            if section['sh_addr'] > 0:
                self.sections[section.name] = {
                    'address': section['sh_addr'],
                    'size': section['sh_size'],
                    'flags': section['sh_flags'],
                }
    
    def _is_valid_symbol(self, symbol):
        """判断符号是否有效"""
        name = symbol.name
        
        # 过滤空名称
        if not name:
            return False
        
        # 过滤内部符号
        if name.startswith('$') or name.startswith('.'):
            return False
        
        # 过滤文件/段类型符号
        if symbol['st_info']['type'] in ['STT_FILE', 'STT_SECTION']:
            return False
        
        # 过滤未定义符号
        if symbol['st_shndx'] == 'SHN_UNDEF':
            return False
        
        return True
    
    def classify_variable(self, name, details):
        """
        分类变量：判断是MEASUREMENT、CHARACTERISTIC还是AXIS_PTS
        
        可以根据变量名前缀、后缀、或所在段进行分类
        """
        # 检查axis模式
        for pattern in self.axis_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                return 'AXIS_PTS'
        
        # 检查characteristic模式
        for pattern in self.characteristic_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                return 'CHARACTERISTIC'
        
        # 检查measurement模式
        for pattern in self.measurement_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                return 'MEASUREMENT'
        
        # 默认：根据符号类型判断
        if details.get('type') == 'STT_FUNC':
            return 'FUNCTION'
        
        # 根据大小判断：小变量可能是measurement，大变量可能是characteristic
        size = details.get('size', 0)
        if size > 8:  # 大于8字节，可能是数组或结构体
            return 'CHARACTERISTIC'
        
        return 'MEASUREMENT'
    
    def infer_datatype(self, name, details):
        """
        推断A2L数据类型
        """
        # 如果调试信息中有类型，使用它
        c_type = details.get('datatype', '').lower()
        if c_type in self.C_TYPE_TO_A2L:
            return self.C_TYPE_TO_A2L[c_type]
        
        # 根据变量名后缀推测
        if name.endswith('_f32') or name.endswith('_float'):
            return 'FLOAT32_IEEE'
        
        if name.endswith('_u8') or name.endswith('_uint8'):
            return 'UBYTE'
        
        if name.endswith('_u16') or name.endswith('_uint16'):
            return 'UWORD'
        
        if name.endswith('_u32') or name.endswith('_uint32'):
            return 'ULONG'
        
        if name.endswith('_s16') or name.endswith('_sint16'):
            return 'SWORD'
        
        if name.endswith('_s32') or name.endswith('_sint32'):
            return 'SLONG'
        
        # 根据大小推测
        size = details.get('size', 0)
        if size == 1:
            return 'UBYTE'
        elif size == 2:
            return 'UWORD'
        elif size == 4:
            return 'ULONG'
        elif size == 8:
            return 'A_UINT64'
        
        # 默认
        return 'ULONG'
    
    def generate_a2l(self, output_file=None):
        """
        生成A2L文件
        
        Args:
            output_file: 输出文件路径，如果为None则返回字符串
        """
        print("\n正在生成A2L文件...")
        print("-" * 60)
        
        if not self.symbols:
            raise ValueError("请先调用parse_elf()解析ELF文件")
        
        # 如果没有指定输出文件，自动生成
        if output_file is None:
            output_file = self.elf_file.with_suffix('.a2l')
        
        a2l_content = self._build_a2l_content()
        
        # 写入文件
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(a2l_content)
        
        print(f"\nA2L文件已生成: {output_path}")
        print(f"文件大小: {output_path.stat().st_size:,} 字节")
        
        return output_path
    
    def _build_a2l_content(self):
        """构建A2L文件内容"""
        lines = []
        
        # 文件头
        lines.append(self._build_header())
        
        # PROJECT开始
        lines.append(f'/begin PROJECT {self.project_name} "{self.project_desc}"')
        lines.append('')
        
        # MODULE开始
        lines.append(f'  /begin MODULE {self.module_name} "{self.module_desc}"')
        lines.append('')
        
        # MOD_PAR
        lines.append(self._build_module_parameters())
        
        # MOD_COMMON
        lines.append(self._build_module_common())
        
        # IF_DATA (XCP/CCP)
        lines.append(self._build_if_data())
        
        # COMPU_METHOD定义
        lines.append(self._build_computation_methods())
        
        # RECORD_LAYOUT定义
        lines.append(self._build_record_layouts())
        
        # 分类并生成变量定义
        lines.append(self._build_variable_definitions())
        
        # FUNCTION定义（分组）
        lines.append(self._build_function_groups())
        
        # MODULE结束
        lines.append('  /end MODULE')
        lines.append('')
        
        # PROJECT结束
        lines.append('/end PROJECT')
        
        return '\n'.join(lines)
    
    def _build_header(self):
        """构建A2L文件头"""
        header = []
        header.append('ASAP2_VERSION 1 61')
        header.append('')
        header.append('/begin HEADER "Auto-generated A2L file"')
        header.append(f'  "Generated from: {self.elf_file.name}"')
        header.append(f'  "Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}"')
        header.append(f'  "Generator: ELF to A2L Converter"')
        header.append('/end HEADER')
        header.append('')
        
        return '\n'.join(header)
    
    def _build_module_parameters(self):
        """构建MOD_PAR块"""
        modpar = []
        modpar.append('  /begin MOD_PAR ""')
        
        # CPU类型
        cpu_type = self.config.get('cpu_type', 'USER_DEFINED')
        modpar.append(f'    CPU_TYPE "{cpu_type}"')
        
        # 内存段定义
        for seg in self.memory_segments:
            modpar.append(
                f'    MEMORY_SEGMENT {seg["name"]} '
                f'"{seg["start"]}" "{seg["end"]}" '
                f'{seg.get("type", "")}'
            )
        
        modpar.append('  /end MOD_PAR')
        modpar.append('')
        
        return '\n'.join(modpar)
    
    def _build_module_common(self):
        """构建MOD_COMMON块"""
        common = []
        common.append('  /begin MOD_COMMON "Common parameters"')
        common.append('    BYTE_ORDER MSB_LAST')
        common.append('    ALIGNMENT_FLOAT16_IEEE 2')
        common.append('    ALIGNMENT_FLOAT32_IEEE 4')
        common.append('    ALIGNMENT_FLOAT64_IEEE 8')
        common.append('  /end MOD_COMMON')
        common.append('')
        
        return '\n'.join(common)
    
    def _build_if_data(self):
        """构建IF_DATA块（XCP/CCP配置占位）"""
        ifdata = []
        ifdata.append('  /begin IF_DATA ASAP1B_CCP')
        ifdata.append('    /begin CCP_DTO')
        ifdata.append('      /* CCP parameters to be filled by calibration tool */')
        ifdata.append('    /end CCP_DTO')
        ifdata.append('  /end IF_DATA')
        ifdata.append('')
        
        return '\n'.join(ifdata)
    
    def _build_computation_methods(self):
        """构建COMPU_METHOD定义"""
        compu = []
        
        # 预定义常用的转换方法
        default_methods = [
            {
                'name': 'NoComp',
                'desc': 'No conversion (raw = physical)',
                'format': '%6.2f',
                'unit': 'none',
                'formula': '1.0 0.0'
            },
            {
                'name': 'Percent',
                'desc': 'Percentage 0-100',
                'format': '%5.2f',
                'unit': '%',
                'formula': '1.0 0.0'
            },
            {
                'name': 'Temperature',
                'desc': 'Temperature in Celsius',
                'format': '%6.2f',
                'unit': '°C',
                'formula': '0.1 0.0'
            },
            {
                'name': 'Speed',
                'desc': 'Speed in RPM',
                'format': '%6.0f',
                'unit': 'rpm',
                'formula': '1.0 0.0'
            },
            {
                'name': 'Voltage',
                'desc': 'Voltage in Volts',
                'format': '%5.3f',
                'unit': 'V',
                'formula': '0.001 0.0'
            },
            {
                'name': 'Current',
                'desc': 'Current in Amperes',
                'format': '%5.3f',
                'unit': 'A',
                'formula': '0.001 0.0'
            },
            {
                'name': 'Bool',
                'desc': 'Boolean conversion',
                'format': '%1.0f',
                'unit': 'none',
                'formula': '1.0 0.0'
            },
            {
                'name': 'AngularPosition',
                'desc': 'Angular position in degrees',
                'format': '%6.2f',
                'unit': '°',
                'formula': '0.1 0.0'
            },
        ]
        
        for method in default_methods:
            compu.append(f'  /begin COMPU_METHOD {method["name"]} "{method["desc"]}"')
            compu.append(f'    UNIT "{method["unit"]}"')
            compu.append(f'    FORMAT "{method["format"]}"')
            compu.append(f'    FORMULA "{method["formula"]}"')
            compu.append(f'  /end COMPU_METHOD')
            compu.append('')
        
        return '\n'.join(compu)
    
    def _build_record_layouts(self):
        """构建RECORD_LAYOUT定义"""
        layouts = []
        
        # 标量布局
        layouts.append('  /begin RECORD_LAYOUT Scalar_BOOLEAN')
        layouts.append('    FNC_VALUES 1 UBYTE COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_BYTE')
        layouts.append('    FNC_VALUES 1 SBYTE COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_UBYTE')
        layouts.append('    FNC_VALUES 1 UBYTE COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_WORD')
        layouts.append('    FNC_VALUES 1 SWORD COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_UWORD')
        layouts.append('    FNC_VALUES 1 UWORD COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_LONG')
        layouts.append('    FNC_VALUES 1 SLONG COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_ULONG')
        layouts.append('    FNC_VALUES 1 ULONG COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        layouts.append('  /begin RECORD_LAYOUT Scalar_FLOAT32')
        layouts.append('    FNC_VALUES 1 FLOAT32_IEEE COLUMN_DIR DIRECT')
        layouts.append('  /end RECORD_LAYOUT')
        layouts.append('')
        
        return '\n'.join(layouts)
    
    def _build_variable_definitions(self):
        """构建变量定义（MEASUREMENT和CHARACTERISTIC）"""
        definitions = []
        definitions.append('  /* ============================================ */')
        definitions.append('  /* Variable Definitions                         */')
        definitions.append('  /* ============================================ */')
        definitions.append('')
        
        # 统计信息
        measurement_count = 0
        characteristic_count = 0
        axis_count = 0
        
        # 按地址排序
        sorted_symbols = sorted(self.symbols.items(), key=lambda x: x[1])
        
        for name, addr in sorted_symbols:
            details = self.symbol_details.get(name, {})
            category = self.classify_variable(name, details)
            
            if category == 'AXIS_PTS':
                definition = self._build_axis_pts(name, addr, details)
                axis_count += 1
            elif category == 'CHARACTERISTIC':
                definition = self._build_characteristic(name, addr, details)
                characteristic_count += 1
            else:
                definition = self._build_measurement(name, addr, details)
                measurement_count += 1
            
            if definition:
                definitions.append(definition)
                definitions.append('')
        
        print(f"\n变量统计:")
        print(f"  - MEASUREMENT: {measurement_count}")
        print(f"  - CHARACTERISTIC: {characteristic_count}")
        print(f"  - AXIS_PTS: {axis_count}")
        
        return '\n'.join(definitions)
    
    def _build_measurement(self, name, addr, details):
        """构建MEASUREMENT定义"""
        datatype = self.infer_datatype(name, details)
        conv_method = self._infer_conversion_method(name)
        min_val, max_val = self._infer_limits(name, datatype)
        
        lines = []
        lines.append(f'  /begin MEASUREMENT {name} "{self._make_description(name)}"')
        lines.append(f'    LONG_IDENTIFIER "{self._make_long_identifier(name)}"')
        lines.append(f'    DATATYPE {datatype}')
        lines.append(f'    CONVERSION {conv_method}')
        lines.append(f'    RESOLUTION 1')
        lines.append(f'    ACCURACY 0.1')
        lines.append(f'    LOWER_LIMIT {min_val}')
        lines.append(f'    UPPER_LIMIT {max_val}')
        lines.append(f'    ECU_ADDRESS 0x{addr:08X}')
        lines.append(f'    DISPLAY_IDENTIFIER {name}')
        lines.append(f'  /end MEASUREMENT')
        
        return '\n'.join(lines)
    
    def _build_characteristic(self, name, addr, details):
        """构建CHARACTERISTIC定义"""
        datatype = self.infer_datatype(name, details)
        conv_method = self._infer_conversion_method(name)
        min_val, max_val = self._infer_limits(name, datatype)
        
        lines = []
        lines.append(f'  /begin CHARACTERISTIC {name} "{self._make_description(name)}"')
        lines.append(f'    LONG_IDENTIFIER "{self._make_long_identifier(name)}"')
        lines.append(f'    TYPE VALUE')
        lines.append(f'    ECU_ADDRESS 0x{addr:08X}')
        lines.append(f'    DATATYPE {datatype}')
        lines.append(f'    CONVERSION {conv_method}')
        lines.append(f'    LOWER_LIMIT {min_val}')
        lines.append(f'    UPPER_LIMIT {max_val}')
        lines.append(f'    DISPLAY_IDENTIFIER {name}')
        lines.append(f'  /end CHARACTERISTIC')
        
        return '\n'.join(lines)
    
    def _build_axis_pts(self, name, addr, details):
        """构建AXIS_PTS定义"""
        datatype = self.infer_datatype(name, details)
        conv_method = self._infer_conversion_method(name)
        
        lines = []
        lines.append(f'  /begin AXIS_PTS {name} "{self._make_description(name)}"')
        lines.append(f'    LONG_IDENTIFIER "{self._make_long_identifier(name)}"')
        lines.append(f'    ECU_ADDRESS 0x{addr:08X}')
        lines.append(f'    DATATYPE {datatype}')
        lines.append(f'    CONVERSION {conv_method}')
        lines.append(f'    MAX_AXIS_PTS 16')
        lines.append(f'    LOWER_LIMIT 0')
        lines.append(f'    UPPER_LIMIT 65535')
        lines.append(f'    DISPLAY_IDENTIFIER {name}')
        lines.append(f'  /end AXIS_PTS')
        
        return '\n'.join(lines)
    
    def _build_function_groups(self):
        """构建功能分组"""
        functions = []
        
        # 创建基本功能分组
        functions.append('  /* ============================================ */')
        functions.append('  /* Function Groups                               */')
        functions.append('  /* ============================================ */')
        functions.append('')
        
        # 根据变量前缀分组
        groups = defaultdict(list)
        
        for name in self.symbols.keys():
            # 提取前缀作为组名
            parts = name.split('_')
            if len(parts) > 1:
                group_name = parts[0]
                groups[group_name].append(name)
        
        # 生成FUNCTION定义
        for group_name, var_names in groups.items():
            if len(var_names) < 2:
                continue
                
            functions.append(f'  /begin FUNCTION {group_name} "{group_name} variables"')
            functions.append('')
            
            for var_name in var_names:
                category = self.classify_variable(var_name, self.symbol_details.get(var_name, {}))
                if category == 'MEASUREMENT':
                    functions.append(f'    REF_MEASUREMENT {var_name}')
                elif category == 'CHARACTERISTIC':
                    functions.append(f'    REF_CHARACTERISTIC {var_name}')
            
            functions.append('')
            functions.append('  /end FUNCTION')
            functions.append('')
        
        return '\n'.join(functions)
    
    def _make_description(self, name):
        """生成变量描述"""
        # 移除常见前后缀，美化描述
        desc = name
        desc = re.sub(r'^[ug]?_?', '', desc)  # 移除前缀 u_, g_
        desc = re.sub(r'_[a-z]+$', '', desc)  # 移除后缀
        desc = desc.replace('_', ' ')
        return desc.title()
    
    def _make_long_identifier(self, name):
        """生成长标识符"""
        return f"{name} - Auto-generated from ELF"
    
    def _infer_conversion_method(self, name):
        """推测合适的转换方法"""
        name_lower = name.lower()
        
        if 'temp' in name_lower:
            return 'Temperature'
        elif 'speed' in name_lower or 'rpm' in name_lower:
            return 'Speed'
        elif 'volt' in name_lower:
            return 'Voltage'
        elif 'current' in name_lower or 'amp' in name_lower:
            return 'Current'
        elif 'percent' in name_lower or 'duty' in name_lower:
            return 'Percent'
        elif 'angle' in name_lower or 'pos' in name_lower:
            return 'AngularPosition'
        elif 'bool' in name_lower or 'flag' in name_lower or 'state' in name_lower:
            return 'Bool'
        else:
            return 'NoComp'
    
    def _infer_limits(self, name, datatype):
        """推测变量的上下限"""
        # 根据数据类型确定范围
        type_ranges = {
            'UBYTE': (0, 255),
            'SBYTE': (-128, 127),
            'UWORD': (0, 65535),
            'SWORD': (-32768, 32767),
            'ULONG': (0, 4294967295),
            'SLONG': (-2147483648, 2147483647),
            'FLOAT32_IEEE': (-3.4e38, 3.4e38),
            'FLOAT64_IEEE': (-1.7e308, 1.7e308),
        }
        
        default_range = type_ranges.get(datatype, (0, 65535))
        
        # 根据名称调整
        name_lower = name.lower()
        
        if 'percent' in name_lower or 'duty' in name_lower:
            return (0, 100)
        elif 'temp' in name_lower:
            return (-40, 200)
        elif 'volt' in name_lower and '12' in name_lower:
            return (0, 20)
        elif 'angle' in name_lower:
            return (0, 360)
        
        return default_range


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='从ELF文件生成A2L文件'
    )
    
    parser.add_argument('elf_file', help='ELF文件路径')
    parser.add_argument('-o', '--output', help='输出A2L文件路径')
    parser.add_argument('-p', '--project', default='AutoProject', help='项目名称')
    parser.add_argument('-m', '--module', default='ECU', help='模块名称')
    parser.add_argument('--min-addr', default='0x100', help='最小地址过滤')
    parser.add_argument('--max-addr', default='0xFFFFFFFF', help='最大地址过滤')
    parser.add_argument('--cpu', default='USER_DEFINED', help='CPU类型')
    parser.add_argument('--no-debug', action='store_true', help='不使用调试信息')
    parser.add_argument('--config', help='配置文件路径(JSON格式)')
    parser.add_argument('--print-stats', action='store_true', help='打印符号统计')
    
    args = parser.parse_args()
    
    # 加载配置文件
    config = {}
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    # 命令行参数覆盖配置文件
    config.update({
        'project_name': args.project,
        'module_name': args.module,
        'min_address': args.min_addr,
        'max_address': args.max_addr,
        'cpu_type': args.cpu,
        'use_debug_info': not args.no_debug,
    })
    
    try:
        # 创建生成器
        generator = ELFToA2LGenerator(args.elf_file, config)
        
        # 解析ELF
        generator.parse_elf()
        
        # 生成A2L
        output_file = args.output
        if not output_file:
            output_file = args.elf_file.replace('.elf', '.a2l')
        
        generator.generate_a2l(output_file)
        
        # 打印统计
        if args.print_stats:
            print("\n" + "=" * 60)
            print("符号统计:")
            print("-" * 60)
            
            # 按地址排序
            sorted_symbols = sorted(generator.symbols.items(), key=lambda x: x[1])
            
            print(f"{'Address':<12} {'Name':<40} {'Size':<8} {'Category'}")
            print("-" * 80)
            
            for name, addr in sorted_symbols[:50]:  # 只显示前50个
                details = generator.symbol_details.get(name, {})
                size = details.get('size', 0)
                category = generator.classify_variable(name, details)
                print(f"0x{addr:08X}  {name:<40} {size:<8} {category}")
            
            if len(sorted_symbols) > 50:
                print(f"... 还有 {len(sorted_symbols) - 50} 个符号")
        
        print("\n✅ A2L生成完成!")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
```

配置文件

```
{
    "project_name": "EngineControlUnit",
    "project_desc": "Engine Control Unit A2L",
    "module_name": "ECU_Main",
    "module_desc": "Main ECU Module",
    "cpu_type": "RENESAS_RH850",
    "memory_segments": [
        {
            "name": "Flash",
            "start": "0x80000000",
            "end": "0x81000000",
            "type": "PROTECTED"
        },
        {
            "name": "RAM",
            "start": "0xFEB00000",
            "end": "0xFEBFFFFF",
            "type": ""
        }
    ],
    "measurement_patterns": [
        "^(rpm|speed|temp|press|volt|current|angle|pos|status|state)",
        "_(st|sts|stat|status|state)$",
        "^(adc|sensor|input|feedback|actual|measured|raw)"
    ],
    "characteristic_patterns": [
        "^(cal|cfg|config|param|const|tune|threshold|limit|gain|offset)",
        "^(kp|ki|kd|pid|factor|coeff|ratio)",
        "^(map|curve|table|array)",
        "_(cal|cfg|config|param|const|tune)$"
    ],
    "axis_patterns": [
        "_(axis|ax|pts|points|break|bp|x_axis|y_axis)$",
        "^(axis|ax|pts|points|break|bp)_"
    ]
}
```

