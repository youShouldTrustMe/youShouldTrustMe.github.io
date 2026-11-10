---
title: CMake
categories:
  - 编程语言
---





# 参考链接

[CMake 教程 — CMake 4.2.0 文档 - CMake 构建系统](https://cmake.com.cn/cmake/help/latest/guide/tutorial/index.html)

# 入门

> [!important]
>
> 在使用cmake之前，需要安装[Cmake](https://cmake.com.cn/download/)
>
> 可以使用以下命令验证Cmake是否安装成功，如果显示版本信息，则表示安装成功。
>
> ```shell
> cmake --version
> ```
>
> CMake 是一个配置程序，有时被称为“元”构建系统。与其他配置系统一样，CMake 最终不负责运行生成软件构建的命令。相反，CMake 根据项目、环境和用户提供的配置信息生成一个构建系统。
>
> CMake 支持将多个构建系统作为此配置过程的输出。这些输出后端被称为“生成器”，因为它们生成构建系统。CMake 支持许多生成器，其文档可以在 [`cmake-generators(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-generators.7.html#manual:cmake-generators(7)) 中找到。有关您特定的 CMake 安装支持的生成器信息，可以通过 [`cmake --help`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-h) 在“Generators”标题下找到。
>
> 因此，使用 CMake 需要一个能够解析此生成器输出的构建程序可用。当前有：
>
> - **Make**：最经典的构建工具，通过读取`Makefile`文件来定义编译规则和依赖关系。
> - **Ninja**：一个更快速的轻量级构建工具，专注于性能，通常由高级构建工具（如CMake）生成`build.ninja`文件。
> - **NMake**：微软提供的类似Make的工具，支持Windows平台的`Makefile`（语法与GNU Make略有不同）。
>
>  `Unix Makefiles`、`Ninja` 和 `Visual Studio` 生成器分别需要兼容的 `make`、`ninja` 和 `Visual Studio` 安装。
>
> 可以使用 [`CMAKE_GENERATOR`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_GENERATOR.html#envvar:CMAKE_GENERATOR) 环境变量，或者使用 [`cmake -G`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-G) 选项来控制使用的生成器。如：
>
> ```shell
> cmake -G Ninja -B build
> ```
>
> 可以在[Releases · ninja-build/ninja · GitHub](https://github.com/ninja-build/ninja/releases)上下载`Ninja`

CMake 的典型用法围绕一个或多个名为 `CMakeLists.txt` 的文件。此文件有时被称为“列表文件”或“CML”。在一个给定的软件项目中，`CMakeLists.txt` 将存在于我们希望为 CMake 提供有关如何处理该目录或子目录中的本地文件和操作的说明的任何目录中。每个文件都包含一组命令，这些命令描述了与构建软件项目相关的某些信息或操作。

并非软件项目中的每个目录都需要 CML，但强烈建议项目根目录包含一个。这将作为 CMake 在配置期间进行初始设置的入口点。此*根* CML 应始终在文件顶部或附近包含相同的两个命令（**必须要存在的语句**）。

```cmake
cmake_minimum_required(VERSION 3.23)

project(MyProjectName)
```

命令 [`cmake_minimum_required()`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html#command:cmake_minimum_required) 是 CMake 为项目开发者提供的兼容性保证。调用它时，可以确保 CMake 采用所列版本的行为。如果调用包含上述代码的 CML 的 CMake 版本较晚，其行为将与 CMake 3.23 完全相同。

命令 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 是一个概念上简单的命令，但功能复杂。它通知 CMake，接下来的内容是描述一个具有给定名称的独立软件项目（而不是类 shell 脚本）。当 CMake 看到 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时，它会执行各种检查以确保环境适合构建软件；例如，检查编译器和其他构建工具，并发现主机和目标机器的字节序等属性。

下面将要介绍四个命令的用法。

1. [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable) 和 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令用于描述软件项目希望生成的输出构件
2. [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources) 命令用于将输入文件与相应的输出构件关联
3.  [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 命令用于将输出构件彼此关联

> [!note]
>
> 一些基础指令为：
>
> 1. [`cmake -S `](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-S)
>
>    指定项目根目录，CMake 将在此找到要构建的项目。它包含教程第 1 步将要讨论的根 `CMakeLists.txt` 文件。
>
>    如果未指定，则默认为当前工作目录。
>
> 2. [`cmake -B `](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-B)
>
>    指定构建目录，CMake 将在此输出生成的构建系统的文件，以及在运行构建系统时构建本身的工件。
>
>    如果未指定，则默认为当前工作目录。
>
> 3. [`cmake --build `](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-build)
>
>    在指定的构建目录中运行构建系统。这是所有生成器的通用命令。对于多配置生成器，可以通过以下方式请求所需的配置：
>
>    ```shell
>    cmake --build <dir> --config <cfg>
>    ```

## 构建可执行文件

最基本的 CMake 项目是由单个源文件构建的可执行文件。对于像这样的简单项目，只需要一个仅包含四个命令的 `CMakeLists.txt` 文件。

> [!note]
>
> CMake 支持大写、小写和混合大小写的命令

我们已经介绍了前两个命令：[`cmake_minimum_required()`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html#command:cmake_minimum_required) 和 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project)。在 CMake 的任何用法中，根 CML 中的第一个命令都将是 [`cmake_minimum_required()`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html#command:cmake_minimum_required)。在某些高级用法中，[`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 可能不是 CML 中的第二个命令，但就我们的目的而言，它始终是。

我们需要下一个命令是 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable)。此命令创建一个*目标*。在 CMake 的术语中，目标是开发者为一组属性指定的名称。

目标可能要跟踪的一些属性示例是:

- 构件种类（可执行文件、库、头文件集合等）
- 源文件
- 包含目录
- 可执行文件或库的输出名称
- 依赖项
- 编译器和链接器标志

CMake 的机制通常最好理解为描述和操作目标及其属性。这里列出的属性远不止这些。CMake 命令的文档通常会以它们操作的目标属性来讨论其功能。

目标本身只是名称，是此属性集合的句柄。使用 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable) 命令就像指定我们想为目标使用的名称一样简单。

```cmake
add_executable(MyProgram)
```

现在我们有了目标名称，就可以开始为其关联属性，例如我们想构建和链接的源文件。为此主要命令是 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources)，它接受目标名称后跟一个或多个文件集合作为参数。

```cmake
target_sources(MyProgram
	PRIVATE
	main.cxx
)
```

> [!note]
>
> CMake 中的路径通常是绝对路径，或者相对于 [`CMAKE_CURRENT_SOURCE_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_SOURCE_DIR.html#variable:CMAKE_CURRENT_SOURCE_DIR)。我们还没有讨论这样的变量，所以您可以将其理解为“相对于当前 CML 的位置”。

每个文件集合都以一个[作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope)为前缀。当我们讨论链接目标时，我们将详细讨论这些关键字的完整语义，但快速解释是它们描述了属性应如何被我们的目标的依赖项继承。

通常，没有什么依赖于可执行文件。其他程序和库不需要链接到可执行文件，也不需要继承头文件或其他类似的东西。因此，最适合在此处使用的作用域是 `PRIVATE`，它通知 CMake 此属性仅属于 `MyProgram` 且不可继承。

> [!important]
>
> 这条规则几乎在所有地方都适用。除了高级和晦涩的用法之外，可执行文件的作用域关键字应*始终*为 `PRIVATE`。对于实现文件，无论目标是可执行文件还是库，情况都是如此。唯一需要“看到”`.cxx` 文件的是构建它们的那个目标。

 当写完`Cmakelists.txt`文件之后就可以开始构建了，

```shell
cmake -B build
cmake --build build
```

执行完上面两行命令后，在项目根CML的同级build目录下将会出现可执行文件（这里是exe文件）



## 构建库

要构建库，我们只需要引入一个命令：[`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library)。它的工作方式与 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable) 完全相同，但用于库。

```cmake
add_library(MyLibrary)
```

然而，现在是时候介绍头文件了。头文件不直接作为翻译单元构建，也就是说它们不是*构建*要求。它们是*使用*要求。我们需要了解头文件才能构建给定目标的其他部分。

因此，头文件的描述方式与实现文件（如 `tutorial.cxx`）略有不同。它们还需要与我们到目前为止使用的 `PRIVATE` 关键字不同的 [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope)。

为了描述一组头文件，我们将使用所谓的 `FILE_SET`。

```cmake
target_sources(MyLibrary
  PRIVATE
    library_implementation.cxx

  PUBLIC
    FILE_SET myHeaders
    TYPE HEADERS
    BASE_DIRS
      include
    FILES
      include/library_header.h
)
```

这涉及很多复杂性，但我们将逐点进行。首先，请注意我们将实现文件作为 `PRIVATE` 源，这与之前用于可执行文件的文件相同。但是，我们现在对头文件使用了 `PUBLIC`。这允许库的消费者“看到”库的头文件。

作用域关键字之后是一个 `FILE_SET`，这是一组被描述为一个单元的文件。一个 `FILE_SET` 由以下部分组成：

- `FILE_SET <name>` 是 `FILE_SET` 的名称。这是一个句柄，我们可以在其他上下文中用它来描述这个集合。
- `TYPE <type>` 是我们正在描述的文件类型。最常见的是头文件，但较新版本的 CMake 支持其他类型，如 C++20 模块。
- `BASE_DIRS` 是文件的“基”位置。这可以最容易地理解为通过 `-I` 标志向编译器描述的用于头文件发现的位置。
- `FILES` 是文件列表，与之前的实现源列表相同。

信息量很大，所以有一些有用的快捷方式我们可以采用。特别是，如果 `FILE_SET` 的名称与类型相同，我们就不需要提供 `TYPE` 字段。

```cmake
target_sources(MyLibrary
  PRIVATE
    library_implementation.cxx

  PUBLIC
    FILE_SET HEADERS
    BASE_DIRS
      include
    FILES
      include/library_header.h
)
```

还有其他快捷方式我们可以采用，但我们将在后面的步骤中讨论它们。

## 链接库和可执行文件

我们准备好将我们的库与我们的可执行文件结合起来，为此我们必须引入一个新命令：[`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries)。这个命令的名字可能有点误导，因为它做的远不止调用链接器。它通常描述目标之间的关系。

```cmake
target_link_libraries(MyProgram
  PRIVATE
    MyLibrary
)
```

我们终于可以讨论 [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope) 了。它们有三个：`PRIVATE`、`INTERFACE` 和 `PUBLIC`。它们决定了**当前目标的属性**如何传递给**依赖该目标的其他目标**。



1. `PRIVATE`：仅用于当前目标

   - **属性不会传递给依赖该目标的其他目标**。

   - 适用于**仅当前目标需要，但使用者不需要**的配置。

   - **典型场景**：当前目标的实现细节（如内部头文件、编译选项）。

     ```cmake
     add_library(MyLibrary src.cpp)
     target_include_directories(MyLibrary
       PRIVATE 
         ${CMAKE_CURRENT_SOURCE_DIR}/include/private
     )
     ```

   - 只有 `MyLibrary` 能使用 `include/private` 目录的头文件，其他链接 `MyLibrary` 的目标（如可执行文件）无法访问该路径。

2. `INTERFACE`：仅传递给依赖者

   - **属性不用于当前目标，但会传递给依赖该目标的其他目标**。

   - 适用于**头文件库（Header-only Library）**或抽象接口。

   - **典型场景**：库的使用者需要但库本身不需要的配置（如接口头文件路径）。

     ```cmake
     Cmakeadd_library(MyHeaderOnly INTERFACE)
     target_include_directories(MyHeaderOnly
       INTERFACE 
         ${CMAKE_CURRENT_SOURCE_DIR}/include/public
     )
     ```

   - `MyHeaderOnly` 自身不编译，但其他目标链接它时会自动添加 `include/public` 到头文件搜索路径。

3. `PUBLIC`：当前目标和依赖者都使用

   - **属性既用于当前目标，也传递给依赖者**。

   - 适用于**库的实现和接口都需要**的配置。

   - **典型场景**：库的头文件和实现都需要某些定义或路径。

     ```cmake
     Cmakeadd_library(MyLibrary src.cpp)
     target_include_directories(MyLibrary
       PUBLIC 
         ${CMAKE_CURRENT_SOURCE_DIR}/include
     )
     ```

   - `MyLibrary` 和所有链接它的目标都能访问 `include` 目录。

| 关键字      | 当前目标是否使用？ | 依赖者是否继承？ | 典型场景                               |
| ----------- | ------------------ | ---------------- | -------------------------------------- |
| `PRIVATE`   | ✅ 是               | ❌ 否             | 内部实现细节（如私有头文件、调试选项） |
| `INTERFACE` | ❌ 否               | ✅ 是             | 头文件库、接口定义                     |
| `PUBLIC`    | ✅ 是               | ✅ 是             | 公共头文件、通用编译选项               |

考虑以下具体示例：

```cmake
target_sources(MyLibrary
  PRIVATE
    FILE_SET internalOnlyHeaders
    TYPE HEADERS
    FILES
      InternalOnlyHeader.h

  INTERFACE
    FILE_SET consumerOnlyHeaders
    TYPE HEADERS
    FILES
      ConsumerOnlyHeader.h

  PUBLIC
    FILE_SET publicHeaders
    TYPE HEADERS
    FILES
      PublicHeader.h
)
```

> [!tip]
>
> 我们为每个文件集排除了 `BASE_DIRS`，这是另一种快捷方式。当排除时，`BASE_DIRS` 默认为当前源目录。

调用 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources) 时，`MyLibrary` 目标有几个属性将被修改。到目前为止，我们使用了“属性”这个词，但属性本身是我们可以推理的命名值。这里将被修改的两个特定属性是 [`HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/HEADER_SETS.html#prop_tgt:HEADER_SETS) 和 [`INTERFACE_HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_HEADER_SETS.html#prop_tgt:INTERFACE_HEADER_SETS)，它们都包含通过 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources) 添加的头文件集合列表。

`internalOnlyHeaders` 的值将添加到 [`HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/HEADER_SETS.html#prop_tgt:HEADER_SETS)，`consumerOnlyHeaders` 将添加到 [`INTERFACE_HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_HEADER_SETS.html#prop_tgt:INTERFACE_HEADER_SETS)，而 `publicHeaders` 将添加到两者。

当构建给定目标时，它将使用自己的*非接口*属性（例如，[`HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/HEADER_SETS.html#prop_tgt:HEADER_SETS)），结合它链接的任何目标的*接口*属性（例如，[`INTERFACE_HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_HEADER_SETS.html#prop_tgt:INTERFACE_HEADER_SETS)）。

作用域关键字与它们的考虑有着简单的直观关联，从应用该命令的目标的角度来看：**PRIVATE** 是给我的，**INTERFACE** 是给别人的，**PUBLIC** 是给所有人的。

## 子目录

在 CMake 项目中，使用 `add_subdirectory()` 是一种模块化管理代码的推荐方式，它允许你将不同组件（如可执行文件、库）的构建逻辑隔离到各自的子目录中。

1. 路径解析规则

   **子目录中的相对路径**（如源文件路径、`include_directories()`）**自动相对于子目录的 `CMakeLists.txt`**。

   ```cmake
   # 顶层 CMakeLists.txt
   add_subdirectory(MathFunctions)  # 子目录为 ./MathFunctions/
   
   # ./MathFunctions/CMakeLists.txt
   add_library(MathFunctions mysqrt.cpp)  # 自动解析为 ./MathFunctions/mysqrt.cpp
   ```

2. 作用域隔离

   - **变量作用域**：子目录默认继承父目录的变量，但子目录中定义的变量默认不影响父目录（除非显式使用 `PARENT_SCOPE`）。

   - **目标（Target）全局可见**：子目录中定义的库/可执行文件在父目录中可直接使用：

     ```cmake
     # 顶层 CMakeLists.txt
     add_subdirectory(MathFunctions)
     target_link_libraries(Tutorial PUBLIC MathFunctions)  # 直接链接子目录中的库
     ```

> [!tip]
>
> 需要注意的是：
>
> 1. 路径处理建议
>
>    **显式指定路径基准**（推荐）：
>
>    ```cmake
>    # 子目录 CMakeLists.txt 中显式声明路径基准
>    set(CMAKE_CURRENT_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/MathFunctions)
>    ```
>
> 2. 变量传递控制
>
>    - **向子目录传递变量**：
>
>      ```cmake
>      set(MY_GLOBAL_FLAG ON)
>      add_subdirectory(MathFunctions)  # 子目录自动继承 MY_GLOBAL_FLAG
>      ```
>
>    - **从子目录导出变量**：
>
>      ```cmake
>      # 子目录中
>      set(COMPILED_LIB_NAME "MathFunctions" PARENT_SCOPE)
>      ```
>
> 3. 目标可见性
>
>    - **私有依赖隐藏**：使用 `PRIVATE` 限定符避免泄漏内部依赖：
>
>      ```cmake
>      target_link_libraries(MathFunctions PRIVATE SomeInternalLib)
>      ```

顶层 `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.10)
project(Tutorial)

# 添加子目录（自动调用其 CMakeLists.txt）
add_subdirectory(MathFunctions)

# 主程序
add_executable(Tutorial tutorial.cpp)
target_link_libraries(Tutorial PUBLIC MathFunctions)
```

`MathFunctions/CMakeLists.txt`

```cmake
# 库定义
add_library(MathFunctions mysqrt.cpp)

# 包含路径（相对于当前子目录）
target_include_directories(MathFunctions INTERFACE 
    ${CMAKE_CURRENT_SOURCE_DIR}  # 暴露头文件目录
)

# 可选：传递编译选项
target_compile_definitions(MathFunctions PRIVATE USE_MYMATH)
```



# 语言基础

CMakeLang(Camke的描述语言)中唯一的基础类型是字符串和列表。**CMakeLang 中的每个对象都是字符串，而列表本身也是包含分号作为分隔符的字符串**。任何看起来操作非字符串（如布尔值、数字、JSON 对象等）的命令，实际上都是在解析一个字符串，执行一些内部转换逻辑（使用 CMakeLang以外的语言），然后为任何潜在的输出转换回字符串。

我们可以使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 命令创建一个变量，也就是一个字符串的名称。

```cmake
set(var "World!")
```

可以使用花括号扩展来访问变量的值，例如，如果我们想使用 [`message()`](https://cmake.com.cn/cmake/help/latest/command/message.html#command:message) 命令来打印名为 `var` 的字符串。

```cmake
set(var "World!")
message("Hello ${var}")
```

在shell中使用以下命令将会打印出Hello World!

```shell
cmake -P CMakeLists.txt
```

> [!note]
>
> [`cmake -P`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-P) 被称为“脚本模式”，它告诉 CMake 该文件不包含 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令。我们不构建任何软件，而是仅将 CMake 用作命令解释器。

由于 CMakeLang只有字符串，条件判断完全依赖于约定，即哪些字符串被认为是 true，哪些被认为是 false。这些值“应该”是直观的，“True”、“On”、“Yes”以及（代表）非零数字的字符串是 truthy（真值），而“False”、“Off”、“No”、“0”、“Ignore”、“NotFound”以及空字符串都被认为是 false（假值）。

| **类别** | **值**           | **说明**                        |
| -------- | ---------------- | ------------------------------- |
| **假值** | `OFF`            | 不区分大小写（`OFF`、`off` 等） |
| :        | `FALSE`          | 不区分大小写                    |
| :        | `N`              | 不区分大小写                    |
| :        | `NO`             | 不区分大小写                    |
| :        | `0`              | 仅数字 `0` 是假值               |
| :        | `""`（空字符串） | 空字符串被视为假值              |
| :        | `NOTFOUND`       | 以 `NOTFOUND` 结尾的字符串      |
| :        | `XXX-NOTFOUND`   | 以 `-NOTFOUND` 结尾的字符串     |
| :        | **未定义的变量** | 未定义的变量被视为假值          |
| **真值** | `ON`             | 不区分大小写（`ON`、`on` 等）   |
| :        | `TRUE`           | 不区分大小写                    |
| :        | `Y`              | 不区分大小写                    |
| :        | `YES`            | 不区分大小写                    |
| :        | `1`              | 非 `0` 的数字被视为真值         |
| :        | 其他非空字符串   | 如 `"Hello"`、`"ENABLED"` 等    |

如前所述，列表是包含分号的字符串。 [`list()`](https://cmake.com.cn/cmake/help/latest/command/list.html#command:list) 命令对于操作这些列表很有用，CMake 中的许多结构都期望使用这种约定。例如，我们可以使用 [`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach) 命令来迭代列表。

```cmake
set(stooges "Moe;Larry")
list(APPEND stooges "Curly")

message("Stooges contains: ${stooges}")

foreach(stooge IN LISTS stooges)
  message("Hello, ${stooge}")
endforeach()

```

在shell中使用：

```shell
$ cmake -P CMakeLists.txt
Stooges contains: Moe;Larry;Curly
Hello, Moe
Hello, Larry
Hello, Curly
```



## 宏、函数和列表

CMake 允许我们创建自己的函数和宏。这在构建大量相似的目标（如测试）时非常有用，因为我们希望一遍又一遍地调用相似的命令集。我们可以使用 [`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 和 [`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro) 来实现。

```cmake
macro(MyMacro MacroArgument)
  message("${MacroArgument}\n\t\tFrom Macro")
endmacro()

function(MyFunc FuncArgument)
  MyMacro("${FuncArgument}\n\tFrom Function")
endfunction()

MyFunc("From TopLevel")

```

最终输出结果为：

```shell
$ cmake -P CMakeLists.txt
From TopLevel
      From Function
              From Macro
```

与许多语言一样，函数和宏的区别在于作用域。在 CMakeLang 中，[`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 和 [`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro) 都可以“看到”它们上方所有帧中创建的所有变量。然而，[`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro) 在语义上类似于文本替换，类似于 C/C++ 宏，因此宏产生的任何副作用都会在其调用上下文中可见。如果我们宏中创建或更改了变量，调用者将看到该更改。

| 特性             | `function()`             | `macro()`                          |
| ---------------- | ------------------------ | ---------------------------------- |
| **作用域**       | 创建新的变量作用域       | 直接替换代码，共享调用者的作用域   |
| **变量修改**     | 默认不影响父作用域       | 直接修改调用者的变量               |
| **参数传递**     | 按值传递（类似局部变量） | 类似文本替换，直接引用调用者的变量 |
| **推荐使用场景** | 需要隔离变量作用域时     | 需要直接修改调用者变量时           |

[`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 会创建自己的变量作用域，因此副作用对调用者不可见。为了将更改传播给调用函数的父级，我们必须使用 `set(<var> <value> PARENT_SCOPE)`，这与 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 的工作方式相同，但作用于调用者上下文中的变量。

- function的作用域行为：

  ```cmake
  function(my_function arg1)
      set(arg1 "new_value")           # 修改的是函数内的局部变量
      set(my_var "hello" PARENT_SCOPE)  # 显式传递到父作用域
  endfunction()
  
  set(arg1 "old_value")
  my_function("initial_value")
  message("arg1 = ${arg1}")          # 输出: arg1 = old_value（未被修改）
  message("my_var = ${my_var}")      # 输出: my_var = hello（通过 PARENT_SCOPE 传递）
  ```

  - **`PARENT_SCOPE`**：必须显式使用，否则变量不会影响调用者。

- macro的作用域行为

  ```cmake
  macro(my_macro arg1)
      set(arg1 "new_value")           # 直接修改调用者的变量！
  endmacro()
  
  set(arg1 "old_value")
  my_macro("initial_value")
  message("arg1 = ${arg1}")          # 输出: arg1 = new_value（被宏修改了！）
  ```

  - **宏是文本替换**，相当于直接把代码插入调用位置，因此所有变量修改都会影响调用者。

> [!tip]
>
> 在 CMake 3.25 中，添加了 [`return(PROPAGATE)`](https://cmake.com.cn/cmake/help/latest/command/return.html#command:return) 选项，其工作方式与 [`set(PARENT_SCOPE)`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 相同，但提供了更好的可用性。
>
> CMake 3.25 之前，如果函数要返回多个变量，必须多次使用 `set(... PARENT_SCOPE)`，例如：
>
> ```cmake
> function(get_values)
>     set(var1 "value1" PARENT_SCOPE)
>     set(var2 "value2" PARENT_SCOPE)
> endfunction()
> ```
>
> **CMake 3.25 引入了 `return(PROPAGATE)`，可以一次性传递多个变量：**
>
> ```cmake
> function(get_values)
>     set(var1 "value1")   # 注意：这里没有 PARENT_SCOPE
>     set(var2 "value2")
>     return(PROPAGATE var1 var2)  # 自动提升到父作用域
> endfunction()
> 
> get_values()
> message("var1 = ${var1}, var2 = ${var2}")  # 输出: var1 = value1, var2 = value2
> ```

 CMake 变量是字符串的名称；换句话说，CMake 变量本身就是一个字符串，它可以进行花括号扩展，变成另一个字符串。

这导致了 CMake 代码中的一个常见模式，即**函数和宏不是通过值传递，而是通过包含这些值的变量的名称来传递**。因此，`ListVar` 不包含我们需要追加的列表的*值*，它包含的是列表的*名称*，而这个列表名称包含了我们需要追加的值。

当使用 `${ListVar}` 扩展变量时，我们将得到列表的名称。如果我们使用 `${${ListVar}}` 扩展该名称，我们将得到列表包含的值。所以想要实现在一个list后面增加一个变量可以使用

```cmake
set(${ListVar} "${${ListVar}};${Value}")
```

- 变量是 **字符串**，变量名也是字符串（例如 `"MY_LIST"`）。
- `${VAR}` 是 **解引用**，获取变量 `VAR` 的值。
- `${${VAR}}` 是 **双重解引用**：
  - 先计算 `${VAR}` 得到另一个变量名（例如 `VAR="MY_LIST"`，则 `${VAR}` → `"MY_LIST"`）。
  - 再计算 `${MY_LIST}` 得到最终的值。

## 条件判断和循环

任何结构化编程语言中最常见的两个流程控制元素是条件判断及其紧密相关的兄弟——循环。

### if

CMakeLang 也不例外。如前所述，给定 CMake 字符串的真值是由 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 命令确定的约定。

当 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 接收到一个字符串时，它首先检查它是否是之前讨论过的已知常量值之一。如果字符串不是这些值之一，该命令假定它是一个变量，并检查该变量的花括号展开内容来确定条件的结果。

```cmake
if(True)
  message("Constant Value: True")
else()
  message("Constant Value: False")
endif()

if(ConditionalValue)
  message("Undefined Variable: True")
else()
  message("Undefined Variable: False")
endif()

set(ConditionalValue True)

if(ConditionalValue)
  message("Defined Variable: True")
else()
  message("Defined Variable: False")
endif()

```

此时结果为：

```shell
$ cmake -P ConditionalValue.cmake
Constant Value: True
Undefined Variable: False
Defined Variable: True
```

> [!important]
>
> CMake 中的所有对象都是字符串，因此双引号 `"` 常常是不必要的。CMake 知道对象是字符串，一切都是字符串。
>
> 但是，在某些情况下需要它。包含空格的字符串需要双引号，否则它们会被视为列表；CMake 会用分号将元素连接起来。反之亦然，当花括号扩展列表时，如果我们想*保留*分号，则有必要在引号内进行。否则，CMake 会将列表项展开为空格分隔的字符串。
>
> 一些命令，例如 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if)，能够区分带引号和不带引号的字符串。当字符串未加引号时，[`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 只会检查该字符串是否代表一个变量。
>
> 最后，[`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 提供了几种有用的比较模式，例如用于字符串匹配的 `STREQUAL`，用于检查变量是否存在的 `DEFINED`，以及用于正则表达式检查的 `MATCHES`。它还支持典型的逻辑运算符：`NOT`、`AND` 和 `OR`。
>
> | 模式                          | 用途                  | 示例                            |
> | ----------------------------- | --------------------- | ------------------------------- |
> | `STREQUAL`                    | 字符串相等比较        | `if("${VAR}" STREQUAL "value")` |
> | `DEFINED`                     | 检查变量是否存在      | `if(DEFINED VAR_NAME)`          |
> | `MATCHES`                     | 正则表达式匹配        | `if("Hello" MATCHES "^H")`      |
> | `EXISTS`                      | 检查文件/目录是否存在 | `if(EXISTS "${PATH}")`          |
> | 逻辑运算符 (`NOT`/`AND`/`OR`) | 组合条件              | `if(NOT VAR AND OTHER_VAR)`     |

### foreach

`foreach()` 是 CMake 中最常用的循环结构，主要用于遍历列表或指定的元素序列。

**基本语法**

```cmake
foreach(<loop_var> IN [ITEMS <item1> <item2> ...] | LISTS <list_var> | RANGE <start> <stop> [<step>])
    # 循环体
endforeach()
```

**常见用法**

1. **遍历显式列表 (`IN ITEMS`)**

   ```cmake
   foreach(item IN ITEMS apple banana orange)
   	message("Fruit: ${item}")
   endforeach()
   ```

   **输出**：

   ```
   Fruit: apple
   Fruit: banana
   Fruit: orange
   ```

2. **遍历变量列表 (`IN LISTS`)**

   ```cmake
   set(FRUITS "apple;banana;orange")  # CMake 列表是分号分隔的字符串
   foreach(fruit IN LISTS FRUITS)
       message("${fruit}")
   endforeach()
   ```

   **输出**：

   ```
   apple
   banana
   orange
   ```

3. **数字范围循环 (`IN RANGE`)**

   ```cmake
   foreach(i RANGE 1 3)  # 1 到 3（包含 3）
       message("Number: ${i}")
   endforeach()
   ```

   **输出**：

   ```
   Number: 1
   Number: 2
   Number: 3
   ```

   **带步长的 `RANGE`**：

   ```cmake
   foreach(i RANGE 0 10 2)  # 0 到 10，步长 2
       message("${i}")
   endforeach()
   ```

   **输出**：

   ```
   0
   2
   4
   6
   8
   10
   ```

4. **同时遍历多个列表 (`ZIP_LISTS`)**

   （CMake 3.17+ 支持）

   ```cmake
   set(NAMES "Alice;Bob;Charlie")
   set(AGES "25;30;35")
   
   foreach(name age IN ZIP_LISTS NAMES AGES)
       message("${name} is ${age} years old")
   endforeach()
   ```

   **输出**：

   ```
   Alice is 25 years old
   Bob is 30 years old
   Charlie is 35 years old
   ```

### while

`while()` 循环基于条件判断，只要条件为真就会重复执行循环体。

**基本语法**

```cmake
while(<condition>)
    # 循环体
endwhile()
```

**示例**

1. 计数器循环

   ```cmake
   set(i 3)
   while(i GREATER 0)
       message("Countdown: ${i}")
       math(EXPR i "${i} - 1")  # i--
   endwhile()
   ```

   **输出**：

   ```
   Countdown: 3
   Countdown: 2
   Countdown: 1
   ```

2. 条件控制循环

   ```Cmake
   set(FLAG ON)
   while(FLAG)
       message("Looping...")
       set(FLAG OFF)  # 终止条件
   endwhile()
   ```

   **输出**：

   ```
    Looping...
   ```

### break

立即退出当前循环。

```Cmake
foreach(i RANGE 1 5)
    if(i EQUAL 3)
        break()
    endif()
    message("${i}")
endforeach()
```

**输出**：

```
1
2
```

### continue

跳过当前迭代，进入下一次循环。

```Cmake
foreach(i RANGE 1 5)
    if(i EQUAL 3)
        continue()
    endif()
    message("${i}")
endforeach()
```

**输出**：

```
1
2
4
5
```

## include 

在 CMake 中，`include()` 命令用于将外部 `.cmake` 脚本文件引入当前作用域，类似于其他编程语言中的 `#include` 或 `import`。它的核心行为是**直接将文件内容插入到调用的位置**，并立即执行。

**基本语法**

```Cmake
include(<file|module> [OPTIONAL] [RESULT_VARIABLE <var>])
```

- **`<file|module>`** 可以是：
  - 具体文件路径（如 `helpers.cmake`）。
  - CMake 内置模块名（如 `FindPython`，自动搜索 `CMAKE_MODULE_PATH`）。
- **`OPTIONAL`** 文件不存在时不报错（静默跳过）。
- **`RESULT_VARIABLE <var>`** 存储文件是否被成功加载的结果（`<var>` 为加载文件的完整路径，失败时为 `NOTFOUND`）。

一般的使用场景为：

1. **引入自定义函数/宏**:将可复用的 CMake 代码分离到单独文件中：

   ```Cmake
   # utils.cmake
   function(print_target_properties target)
       get_target_property(props ${target} SOURCES)
       message("Target ${target} sources: ${props}")
   endfunction()
   ```

   主 `CMakeLists.txt` 中调用：

   ```Cmake
   include(cmake/utils.cmake)  # 引入自定义函数
   print_target_properties(MyTarget)  # 直接使用
   ```

2. **加载 Find 模块**:查找第三方依赖（如 `FindPython.cmake`）：

   ```cmake
   list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
   include(FindPython)  # 搜索 CMAKE_MODULE_PATH 中的 FindPython.cmake
   ```

3. **拆分大型项目配置**:将编译选项、平台检测等逻辑分离：

   ```Cmake
   # config/compiler_flags.cmake
   add_compile_options(-Wall -Wextra)
   include(config/compiler_flags.cmake)
   ```

与 `add_subdirectory()` 的区别

| **特性**          | `include()`                  | `add_subdirectory()`                  |
| ----------------- | ---------------------------- | ------------------------------------- |
| **作用域**        | 直接插入当前作用域           | 创建新的子作用域（需显式传递变量）    |
| **变量/函数共享** | 自动共享所有内容             | 需通过 `PARENT_SCOPE` 或 `CACHE` 传递 |
| **目标定义**      | 目标仍在当前作用域           | 目标在子目录作用域，但全局可见        |
| **典型用途**      | 工具函数、配置片段、模块加载 | 组织子项目、独立组件                  |

> [!tip]
>
> 需要注意的是：
>
> 1. 路径解析规则
>
>    - 相对路径（如 `include(dir/file.cmake)`）从 `CMAKE_CURRENT_SOURCE_DIR` 解析。
>
>    - 通过 `CMAKE_MODULE_PATH` 指定搜索路径：
>
>      ```Cmake
>      list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
>      include(MyHelpers)  # 搜索 cmake/MyHelpers.cmake
>      ```
>
> 2.  避免重复包含
>
>    使用 `include_guard()` 防止重复加载：
>
>    ```Cmake 
>    # 在文件开头添加
>    include_guard(GLOBAL)  # 或 DIRECTORY
>    ```
>
> 3. 错误处理
>
>    默认文件不存在会报错，使用 `OPTIONAL` 静默跳过：
>
>    ```cmake
>    include(OptionalFile.cmake OPTIONAL)
>    ```

# 配置和缓存变量

如果我们有一个支持多种压缩算法的压缩软件 CMake 项目，我们可能希望让项目的打包者在构建我们的软件时决定启用哪些算法。我们可以通过使用 [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志设置的变量来实现。

```cmake
if(COMPRESSION_SOFTWARE_USE_ZLIB)
  message("I will use Zlib!")
  # ...
endif()

if(COMPRESSION_SOFTWARE_USE_ZSTD)
  message("I will use Zstd!")
  # ...
endif()

```

通过使用-D命令来进行传递

```shell
$ cmake -B build \
    -DCOMPRESSION_SOFTWARE_USE_ZLIB=ON \
    -DCOMPRESSION_SOFTWARE_USE_ZSTD=OFF
...
I will use Zlib!
```

当然，我们希望为这些配置选择提供合理的默认值，并提供一种沟通给定选项目的的方式。此功能由 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option) 命令提供。

```cmake
option(COMPRESSION_SOFTWARE_USE_ZLIB "Support Zlib compression" ON)
option(COMPRESSION_SOFTWARE_USE_ZSTD "Support Zstd compression" ON)

if(COMPRESSION_SOFTWARE_USE_ZLIB)
  # Same as before
# ...

```

执行结果为

```shell
$ cmake -B build \
    -DCOMPRESSION_SOFTWARE_USE_ZLIB=OFF
...
I will use Zstd!
```

[`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志和 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option) 创建的名称不是普通变量，它们是 **缓存** 变量。缓存变量是全局可见的、*粘性* 的变量，其值在首次设置后很难更改。事实上，它们是如此粘性，以至于在项目模式下，CMake 会在多次配置之间保存和恢复缓存变量。如果一个缓存变量被设置一次，它将保持不变，直到另一个 [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志覆盖了已保存的变量。

> [!note]
>
> CMake 本身有几十个用于配置的普通变量和缓存变量。这些变量在 [`cmake-variables(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-variables.7.html#manual:cmake-variables(7)) 中进行了文档说明，并且与项目提供的配置变量以相同的方式运行。

 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 也可以用来操作缓存变量，但不会更改已创建的变量。

```cmake
set(StickyCacheVariable "I will not change" CACHE STRING "")
set(StickyCacheVariable "Overwrite StickyCache" CACHE STRING "")

message("StickyCacheVariable: ${StickyCacheVariable}")
```

```shell
$ cmake -P StickyCacheVariable.cmake
StickyCacheVariable: I will not change
```

由于 [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志在任何其他命令之前处理，因此它们在设置缓存变量值时具有优先权。

```shell
$ cmake \
  -DStickyCacheVariable="Commandline always wins" \
  -P StickyCacheVariable.cmake
StickyCacheVariable: Commandline always wins
```

虽然缓存变量通常不能更改，但它们可以被普通变量 *覆盖*。我们可以通过设置一个与缓存变量同名的变量，然后使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 来设置一个普通变量，然后使用 [`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 删除普通变量来观察这一点。

```cmake
set(ShadowVariable "In the shadows" CACHE STRING "")
set(ShadowVariable "Hiding the cache variable")
message("ShadowVariable: ${ShadowVariable}")

unset(ShadowVariable)
message("ShadowVariable: ${ShadowVariable}")
```

```shell
$ cmake -P ShadowVariable.cmake
ShadowVariable: Hiding the cache variable
ShadowVariable: In the shadows
```

> [!note]
>
> 需要注意的是，如果我们在命令行已经指定了粘性参数，那么在camkeLists中再修改是不行的了



## `CMAKE` 变量

CMake 提供了几个重要的普通变量和缓存变量，供打包者控制构建。编译器、默认标志、软件包搜索位置等决策都由 CMake 自有的配置变量控制。

其中最重要的是语言标准。语言标准可能对给定软件包提供的 ABI 产生重大影响。例如，库经常使用较新标准中的标准 C++ 模板，并在早期标准中提供填充程序。如果一个库在不同的标准下被使用，标准模板和填充程序之间的 ABI 不兼容可能导致难以理解的错误和运行时崩溃。

确保我们的所有目标都使用相同的语言标准是通过 [`CMAKE__STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_STANDARD.html#variable:CMAKE__STANDARD) 缓存变量实现的。对于 C++，它是 `CMAKE_CXX_STANDARD`。

> [!important]
>
> 由于这些变量如此重要，因此开发者不应在他们的 CML 中覆盖或隐藏它们。在 CML 中隐藏 [`CMAKE__STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_STANDARD.html#variable:CMAKE__STANDARD)，因为库想要 C++20，而打包者已决定使用 C++23 构建其其余的库和应用程序，这可能导致前面提到的可怕的、难以理解的错误。
>
> 除非有非常强烈的理由，否则不要在 `CMAKE_` 全局变量上使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set)。我们将在后续步骤中讨论更好的方法，让目标传达定义和最低标准等要求。

 

## CMakePresets.json

管理这些配置值很快就会变得不堪重负。在 CI 系统中，适合将它们记录为给定 CI 步骤的一部分。例如，在 Github Actions CI 步骤中，我们可能会看到类似以下的示例

```shell
- name: Configure and Build
  run: |
    cmake \
      -B build \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_CXX_STANDARD=20 \
      -DCMAKE_CXX_EXTENSIONS=ON \
      -DTUTORIAL_BUILD_UTILITIES=OFF \
      # Possibly many more options
      # ...

    cmake --build build
```

在本地开发代码时，即使只输入一次所有这些选项也可能容易出错。如果出于任何原因需要重新配置，多次执行此操作可能会令人筋疲力尽。

解决此问题的方法有很多种，您的选择最终取决于您作为开发者的偏好。面向 CLI 的开发者通常使用任务运行器来调用 CMake 并为其项目设置所需的选项。大多数 IDE 也有一个自定义机制来控制 CMake 配置。

在此处不可能完全枚举所有可能的配置工作流程。相反，我们将探讨 CMake 内置的解决方案，称为 [`CMake Presets`](https://cmake.com.cn/cmake/help/latest/manual/cmake-presets.7.html#manual:cmake-presets(7))。Presets 提供了一种格式来命名和表达 CMake 配置选项的集合。

> [!tip]
>
> Presets 能够表达完整的 CMake 工作流程，从配置到构建，再到安装软件软件包。
>
> 它们比我们在这里的空间要灵活得多。我们将仅限于使用它们进行配置。

 CMake Presets 包含在两个标准文件中：`CMakePresets.json`，它旨在成为项目的一部分并纳入源代码控制；以及 `CMakeUserPresets.json`，它旨在用于本地用户配置，不应纳入源代码控制。

对开发人员最有用的最简单的 preset 仅仅是配置变量。

```json
{
  "version": 4,
  "configurePresets": [
    {
      "name": "example-preset",
      "cacheVariables": {
        "EXAMPLE_FOO": "Bar",
        "EXAMPLE_QUX": "Baz"
      }
    }
  ]
}
```

在调用 CMake 时，之前我们会这样做：

```shell
cmake -B build -DEXAMPLE_FOO=Bar -DEXAMPLE_QUX=Baz
```

我们现在可以使用 preset：

```
cmake -B build --preset example-preset
```

CMake 将搜索名为 `CMakePresets.json` 和 `CMakeUserPresets.json` 的文件，并在可用时加载其中的命名配置。

> [!note]
>
> 命令行标志可以与 presets 混合。命令行标志优先于 preset 中的值。
>

 Presets 还支持有限的宏，这些宏可以在 preset 中进行花括号展开。唯一对我们感兴趣的是 `${sourceDir}` 宏，它展开为项目的根目录。我们可以使用它来设置我们的构建目录，从而在配置项目时跳过 `-B` 标志。

```json
{
  "name": "example-preset",
  "binaryDir": "${sourceDir}/build"
}
```

如果json中使用了`binaryDir`，那么在指定路径的时候就可以省略`-B`选项了

# 目标命令

CMake 中有几个目标命令可用于描述需求。作为提醒，目标命令是指修改其应用的目标的属性的命令。这些属性描述了构建软件所需的需求，例如源文件、编译标志和输出名称；或者消耗目标所必需的属性，例如头文件包含、库目录和链接规则。

> [!tip]
>
> 正如之前讨论的，构建目标所需属性应使用 `PRIVATE` [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope) 描述，消耗目标所需属性使用 `INTERFACE` 描述，而两者都需要的属性则使用 `PUBLIC` 描述。
>
> - **`PRIVATE`** 仅影响当前目标的构建（不传递给依赖者）。 示例：实现文件使用的编译定义。
>
>   ```cmake
>   target_compile_definitions(MyLib PRIVATE MYLIB_DEBUG)
>   ```
>
> - **`INTERFACE`** 仅影响依赖当前目标的其他目标（当前目标自身不使用）。 示例：头文件需要的包含路径。
>
>   ```cmake
>   target_include_directories(MyLib INTERFACE include/)
>   ```
>
> - **`PUBLIC`** 同时影响当前目标和依赖者。 示例：头文件和实现文件都需要的定义。
>
>   ```cmake
>   target_compile_definitions(MyLib PUBLIC MYLIB_API_EXPORT)
>   ```

我们将目标命令分为三类：推荐的且普遍有用的命令，高级且需要谨慎的命令，以及“陷阱”命令，除非必要应避免使用。

1. 常用/推荐命令
   - `target_sources()` - 添加源文件
   - `target_link_libraries()` - 指定链接的库
   - `target_compile_definitions()` - 添加编译定义（如 `-DDEBUG`）
   - `target_compile_features()` - 指定语言标准（如 C++20）
2. 高级/谨慎使用命令
   - `target_compile_options()` - 添加编译器选项（如 `-Wall`）
   - `target_link_options()` - 添加链接器选项（如 `-T script.ld`）
   - `set_target_properties()` - 直接设置目标属性（如 `DEPRECATION`）
   - `get_target_property()` - 获取目标属性
3. 晦涩/避免使用的命令
   - `target_include_directories()` - 添加头文件目录（**优先使用 `target_link_libraries()` 传递接口包含路径**）
   - `target_link_directories()` - 添加库搜索路径（**优先使用绝对路径或 `find_library()`**）

[`get_target_property()`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html#command:get_target_property) 和 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html#command:set_target_properties) 命令可以通过名称直接访问目标的属性。它们甚至可以用于将任意属性名称附加到目标。

```cmake
add_library(Example)
set_target_properties(Example
  PROPERTIES
    Key Value
    Hello World
)

get_target_property(KeyVar Example Key)
get_target_property(HelloVar Example Hello)

message("Key: ${KeyVar}")
message("Hello: ${HelloVar}")
```

```shell
$ cmake -B build
...
Key: Value
Hello: World
```

CMake 语义上有意义的目标属性的完整列表已记录在 [`cmake-properties(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-properties.7.html#manual:cmake-properties(7)) 中，但是其中大多数应该使用其专用命令进行修改。例如，直接操作 `LINK_LIBRARIES` 和 `INTERFACE_LINK_LIBRARIES` 是不必要的，因为这些由 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 处理。

相反，一些不太常用的属性只能通过这些命令访问。用于将弃用通知附加到目标的 [`DEPRECATION`](https://cmake.com.cn/cmake/help/latest/prop_tgt/DEPRECATION.html#prop_tgt:DEPRECATION) 属性只能通过 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html#command:set_target_properties) 设置；用于描述 CMake 的 `clean` 目标要移除的附加文件的 [`ADDITIONAL_CLEAN_FILES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/ADDITIONAL_CLEAN_FILES.html#prop_tgt:ADDITIONAL_CLEAN_FILES) 属性也可以；以及其他类似的属性。

[`target_precompile_headers()`](https://cmake.com.cn/cmake/help/latest/command/target_precompile_headers.html#command:target_precompile_headers) 命令接受一个头文件列表，类似于 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources)，并从中创建一个预编译头。然后，此预编译头将被强制包含到目标的所有翻译单元中。这对于构建性能可能很有用。

## 特性和定义

在之前的步骤中，我们曾警告不要全局设置 [`CMAKE__STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_STANDARD.html#variable:CMAKE__STANDARD) 并覆盖打包者关于使用哪种语言标准的选择。另一方面，许多库在构建时需要一组最少的必需特性，对于这些库，使用 [`target_compile_features()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html#command:target_compile_features) 命令来传达这些需求是合适的。

```cmake
target_compile_features(MyApp PRIVATE cxx_std_20)
```

[`target_compile_features()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html#command:target_compile_features) 命令将最低语言标准描述为目标属性。如果 [`CMAKE__STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_STANDARD.html#variable:CMAKE__STANDARD) 高于此版本，或者编译器默认已提供此语言标准，则不执行任何操作。如果需要额外的标志来启用该标准，CMake 将会添加它们。

> [!tip]
>
> [`target_compile_features()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html#command:target_compile_features) 操作的接口和非接口属性与其它目标命令相同。这意味着可以通过 `INTERFACE` 或 `PUBLIC` 作用域关键字指定的语言标准要求进行*继承*。
>
> 如果语言特性仅在实现文件中使用，则相应的编译特性应为 `PRIVATE`。如果目标的头文件使用这些特性，则应使用 `PUBLIC` 或 `INTERFACE`。

 对于 C++，编译特性的形式为 `cxx_std_YY`，其中 `YY` 是标准化年份，例如 `14`、`17`、`20` 等。

[`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions) 命令将编译定义描述为目标属性。它是将构建配置信息传达给源代码本身的机制。与所有属性一样，作用域关键字按照我们所讨论的方式适用。

```cmake
target_compile_definitions(MyLibrary
  PRIVATE
    MYLIBRARY_USE_EXPERIMENTAL_IMPLEMENTATION

  PUBLIC
    MYLIBRARY_EXCLUDE_DEPRECATED_FUNCTIONS
)
```

使用 [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions) 描述的编译定义，既不需要也不希望添加 `-D` 前缀。CMake 将为当前编译器确定正确的标志。

## 编译和链接选项

有时，我们需要精确控制传递给编译和链接行的选项。这些情况由 [`target_compile_options()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html#command:target_compile_options) 和 [`target_link_options()`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html#command:target_link_options) 处理。

```cmake
target_compile_options(MyApp PRIVATE -Wall -Werror)
target_link_options(MyApp PRIVATE -T LinksScript.ld)
```

无条件调用 [`target_compile_options()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html#command:target_compile_options) 或 [`target_link_options()`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html#command:target_link_options) 有几个问题。主要问题是编译器标志特定于正在使用的编译器前端。为了确保我们的项目支持多个编译器前端，我们必须只将兼容的标志传递给编译器。

我们可以通过检查 [`CMAKE__COMPILER_FRONTEND_VARIANT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER_FRONTEND_VARIANT.html#variable:CMAKE__COMPILER_FRONTEND_VARIANT) 变量来实现这一点，该变量告诉我们编译器前端支持的标志样式。

对于错误和警告，请考虑将标志放在 [`CMAKE__FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS.html#variable:CMAKE__FLAGS) 中，用于本地开发构建和 CI 运行期间（通过预设或 [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志）。我们确切地知道在这些上下文中使用了哪个编译器和工具链，因此我们可以精确地自定义行为，而不会冒着在其他平台上构建失败的风险。

## 包含和链接目录

通常不需要直接描述包含和链接目录，因为在 CMake 中生成的 Target 之间进行链接或在稍后将介绍的命令中导入的外部依赖项时，这些需求会自动继承。

如果我们碰巧有一些未由 CMake Target 描述的、我们需要引入构建的库或头文件，例如供应商提供的预编译二进制文件，我们可以使用 [`target_link_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_link_directories.html#command:target_link_directories) 和 [`target_include_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_include_directories.html#command:target_include_directories) 命令来合并它们。

```cmake
target_link_directories(MyApp PRIVATE Vendor/lib)
target_include_directories(MyApp PRIVATE Vendor/include)
```

这些命令使用映射到 `-L` 和 `-I` 编译器标志（或编译器用于链接和包含目录的任何标志）的属性。

当然，传递链接目录并不会告诉编译器将任何内容链接到构建中。为此，我们需要 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries)。当 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 接收到一个不映射到 Target 名称的参数时，它会将该字符串直接添加到链接行，作为要链接到构建中的库（在前面加上任何适当的标志，例如 `-l`）。

# 库

虽然可执行文件大多是千篇一律的，但库却有很多不同的形式。有静态库、共享库、模块库、对象库、仅头文件库，以及描述要由其他目标继承的高级 CMake 属性的库，这仅仅是其中的一小部分。

[`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令接受要创建的库目标的名称作为其第一个参数。第二个参数是一个可选的 `<type>`，其有效值为：

1. **[静态库 (STATIC)](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#static-libraries)**
   - 编译时链接的库，代码直接嵌入到可执行文件中
   - 使用 `.a` (Unix) 或 `.lib` (Windows) 文件扩展名
   - 示例：`add_library(MyLib-static STATIC)`
2. **[共享库 (SHARED)](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#shared-libraries)**
   - 运行时动态加载的库
   - 使用 `.so` (Unix) 或 `.dll` (Windows) 文件扩展名
   - 示例：`add_library(MyLib-shared SHARED)`
   - 可以通过 `BUILD_SHARED_LIBS` 变量控制默认行为
3. **[模块库 (MODULE)](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#module-libraries)**
   - 特殊类型的共享库，主要用于插件系统
   - 不能直接链接，但可通过 `dlopen` 等函数动态加载
4. [**对象库 (OBJECT)**]((https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#object-libraries))
   - 一组未归档或未链接的对象文件
   - 用于高级场景，如合并多个库
   - 示例：`add_library(MyObjects OBJECT)`
5. [**接口库 (INTERFACE)**](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#interface-libraries)
   - 不编译任何代码，仅定义使用要求
   - 常用于仅头文件库
   - 示例：`add_library(MyInterface INTERFACE)`
6. **导入库 (IMPORTED)**
   - 描述从外部项目导入的库
   - 不在当前项目中构建

## 静态库和共享库

虽然 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令支持显式设置 `STATIC` 或 `SHARED`，并且这有时是必要的，但最好将第二个参数留空，以便大多数“普通”库可以作为两者使用。

当未指定类型时，[`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 将创建 `STATIC` 或 `SHARED` 库，具体取决于 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS) 的值。如果 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS) 为 true，将创建一个 `SHARED` 库，否则将创建 `STATIC` 库。

```cmake
add_library(MyLib-static STATIC)
add_library(MyLib-shared SHARED)

# Depends on BUILD_SHARED_LIBS
add_library(MyLib)
```

这是理想的行为，因为它允许打包者确定将生成哪种类型的库，并确保依赖项链接到该版本的库，而无需修改其源代码。在某些情况下，完全静态构建是合适的，而在另一些情况下，共享库是可取的。

通过将 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 的第二个参数留空，项目为其打包者和下游依赖项提供了额外的灵活性。

```cmake
  add_library(MyLib)  # 类型由 BUILD_SHARED_LIBS 决定
```



## 接口库

接口库是指仅为其他目标通信使用要求，自身不构建或生成任何文件的库。因此，接口库的所有属性本身都必须是接口属性，使用 `INTERFACE` [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope) 指定。

```cmake
add_library(MyInterface INTERFACE)
target_compile_definitions(MyInterface INTERFACE MYINTERFACE_COMPILE_DEF)
```

C++ 开发中最常见的接口库类型是仅头文件库。此类库不构建任何内容，只提供发现其头文件所需的标志。

## 对象库

对象库有多种高级用途，但也存在一些棘手的细微差别，在本教程的范围内难以完全枚举。

```
add_library(MyObjects OBJECT)
```

对象库最明显的缺点是对象本身不能被传递链接。如果一个对象库出现在目标的 [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES) 中，那么链接该目标的依赖项将不会“看到”这些对象。在这种情况下，对象库将表现得像一个 `INTERFACE` 库。在一般情况下，对象库仅适用于通过 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 进行 `PRIVATE` 或 `PUBLIC` 消费。

对象库的一个常见用例是将几个库目标合并到一个存档或共享库对象中。即使在单个项目中，由于各种原因（例如属于组织内的不同团队），库也可能被维护为不同的目标。但是，将它们分发为单个面向消费者的二进制文件可能是可取的。对象库使这成为可能。

# 自检

为了发现有关系统环境和工具链的信息，CMake 通常会编译小型测试程序，以验证编译器标志、头文件和内建函数或其他语言构造的可用性。

一种可以追溯到配置和构建系统最早期的一个古老技巧是，通过编译一个使用该功能的简单程序来验证某个功能的可用性。

在许多情况下，CMake 使这变得不必要。正如我们将在后续步骤中讨论的那样，如果 CMake 能够找到一个库依赖项，我们可以依靠它拥有我们期望它拥有的所有设施（头文件、代码生成器、测试实用程序等）。反之，如果 CMake 找不到依赖项，尝试使用该依赖项几乎肯定会失败。

然而，还有其他一些 CMake 不易于沟通的工具链相关信息。对于这些高级情况，我们可以编写自己的测试程序和编译命令来检查可用性。

CMake 提供了模块来简化这些检查。这些模块记录在 [`cmake-modules(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-modules.7.html#manual:cmake-modules(7)) 中。任何以 `Check` 开头的模块都是系统自省模块，我们可以使用它们来查询工具链和系统环境。一些值得注意的模块包括：

- `CheckIncludeFiles`：检查一个或多个 C/C++ 头文件。
- `CheckCompilerFlag`：检查编译器是否支持给定的标志。
- `CheckSourceCompiles`：检查源代码是否可以为给定的语言进行构建。
- `CheckIPOSupported`：检查编译器是否支持过程间优化（IPO/LTO）。

## 检查包含文件

一个快速简便的检查是，某个头文件在特定平台上是否可用，CMake 为此提供了 [`CheckIncludeFiles`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFiles.html#module:CheckIncludeFiles)。这最适用于系统和内建头文件，这些头文件可能不是由特定包提供的，但预计在许多构建环境中都可用。

```cmake
include(CheckIncludeFiles)
check_include_files(sys/socket.h HAVE_SYS_SOCKET_H LANGUAGE CXX)
```

> [!note]
>
> 这些函数并非立即在 CMake 中可用，必须通过 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 来包含其关联的模块（又名 CMakeLang 文件）。许多模块位于 CMake 自带的 `Modules` 文件夹中。这个内置的 `Modules` 文件夹是 CMake 在评估 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 命令时搜索的地点之一。您可以将这些模块视为标准库头文件，它们预计是可用的。

 一旦已知头文件存在，我们就可以使用之前已经涵盖的条件语句和目标命令机制将其传达给我们的代码。

## 检查源文件编译

有时仅仅检查头文件是不够的。当没有可供检查的头文件时，尤其如此，例如编译器内建函数。对于这些场景，我们有 [`CheckSourceCompiles`](https://cmake.com.cn/cmake/help/latest/module/CheckSourceCompiles.html#module:CheckSourceCompiles)。

```cmake
include(CheckSourceCompiles)
check_source_compiles(CXX
  "
    int main() {
      int a, b, c;
      __builtin_add_overflow(a, b, &c);
    }
  "
  HAS_CHECKED_ADDITION
)
```

默认情况下，[`CheckSourceCompiles`](https://cmake.com.cn/cmake/help/latest/module/CheckSourceCompiles.html#module:CheckSourceCompiles) 会构建并链接一个可执行文件。要检查的代码必须提供一个有效的 `int main()` 函数才能成功。

在执行检查后，此系统自省可以以与我们讨论头文件时相同的方式应用。

## 检查过程间优化

过程间优化和链接时优化可以为某些软件提供显著的性能提升。CMake 可以通过 [`CheckIPOSupported`](https://cmake.com.cn/cmake/help/latest/module/CheckIPOSupported.html#module:CheckIPOSupported) 检查 IPO 标志的可用性。

```cmake
include(CheckIPOSupported)
check_ipo_supported() # fatal error if IPO is not supported
set_target_properties(MyApp
  PROPERTIES
    INTERPROCEDURAL_OPTIMIZATION TRUE
)
```

关于项目内 IPO 配置，有几个重要的注意事项：

- CMake 并不了解每种编译器上的所有 IPO/LTO 标志，通过对已知工具链进行单独调整，通常可以获得更好的结果。
- 在目标上设置 [`INTERPROCEDURAL_OPTIMIZATION`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERPROCEDURAL_OPTIMIZATION.html#prop_tgt:INTERPROCEDURAL_OPTIMIZATION) 属性不会改变其链接到的任何目标，或来自其他项目的依赖项。IPO 只能“看到”那些也以适当方式编译的其他目标。

出于这些原因，应认真考虑通过外部机制（预设、[`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志、[`工具链文件`](https://cmake.com.cn/cmake/help/latest/manual/cmake-toolchains.7.html#manual:cmake-toolchains(7)) 等）而不是项目内控制，来手动设置依赖树中所有项目的 IPO/LTO 标志。

但是，特别是对于非常大的项目，在 IPO 可用时拥有一个项目内的机制来使用 IPO 会很有用。

# Vscode

在Vscode中可以安装cmake和Cmake tool来支持Cmake

在`.vscode`文件夹中的`setting.json`文件的配置中可以设置工具查询根CML的路径

```json
{
    "cmake.sourceDirectory": "${workspaceFolder}/products/JK3243A_L/projects/Cmake"
}
```

# 实例

首先看一下目录结构

```
📦Cmake
 ┣ 📂NeedEdit
 ┃ ┣ 📜flags.cmake
 ┃ ┣ 📜post_build.cmake
 ┃ ┗ 📜sources.cmake
 ┣ 📜CmakeLists.txt
 ┣ 📜CmakePresets.json
 ┗ 📜Toolchain.cmake
```

为了便于管理，所以分为几个文件，首先看一下预设文件`CmakePresets.json`，这里生成器使用的是`Ninja`。

```json
{
	"version": 4,
	"configurePresets": [
		{
			"name": "ryf",
			"displayName": "ryf的预设",
			"description": "预设",
			"generator": "Ninja",
			"binaryDir": "${sourceDir}/../build",
			"cacheVariables": {
				"USE_ARMGCC": "ON",
				"CMAKE_BUILD_TYPE": "DEBUG",
				"CMAKE_TOOLCHAIN_FILE": "${sourceDir}/Toolchain.cmake",
				"TOOLCHAIN_BIN_PATH": "D:/ARMGCC/bin"
			},
			"environment": {
				"TOOLCHAIN_BIN_PATH": "D:/ARMGCC/bin"
			}
		}
	]
}
```

接着就开始配置编译链工具，实际上，如果你的终端默认就是嵌入式的gcc，那么也可以不使用这个文件`Toolchain.cmake`

```cmake
set(CMAKE_SYSTEM_NAME Generic)

set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# 优先级：CMake变量 > 环境变量 > 缓存变量
if(NOT TOOLCHAIN_BIN_PATH)
    if(DEFINED ENV{TOOLCHAIN_BIN_PATH})
        set(TOOLCHAIN_BIN_PATH "$ENV{TOOLCHAIN_BIN_PATH}")
    elseif(DEFINED CACHE{TOOLCHAIN_BIN_PATH})
        set(TOOLCHAIN_BIN_PATH "$CACHE{TOOLCHAIN_BIN_PATH}")
    endif()
endif()

# 统一处理路径分隔符（防止 Windows 下的反斜杠问题）
file(TO_CMAKE_PATH "${TOOLCHAIN_BIN_PATH}" TOOLCHAIN_BIN_PATH)

# 强制要求从 Preset 中传入路径
if(NOT TOOLCHAIN_BIN_PATH)
    message(FATAL_ERROR "错误：未定义 TOOLCHAIN_BIN_PATH。请在 CMakePresets 中配置该路径。")
endif()

if(USE_ARMGCC)
    set(CMAKE_C_COMPILER "${TOOLCHAIN_BIN_PATH}/arm-none-eabi-gcc.exe")
    set(CMAKE_ASM_COMPILER "${TOOLCHAIN_BIN_PATH}/arm-none-eabi-gcc.exe")
    set(CMAKE_OBJCOPY "${TOOLCHAIN_BIN_PATH}/arm-none-eabi-objcopy.exe")
    set(CMAKE_SIZE "${TOOLCHAIN_BIN_PATH}/arm-none-eabi-size.exe")
else()
    set(CMAKE_C_COMPILER "${TOOLCHAIN_BIN_PATH}/armclang.exe")
    set(CMAKE_ASM_COMPILER "${TOOLCHAIN_BIN_PATH}/armclang.exe")
    set(CMAKE_OBJCOPY "${TOOLCHAIN_BIN_PATH}/fromelf.exe")
    set(CMAKE_SIZE "${TOOLCHAIN_BIN_PATH}/fromelf.exe")
endif()

```

接下来就要配置根CML文件，该文件由`NeedEdit`文件夹中的文件构成，`Cmakelists.txt`内容为

```cmake
cmake_minimum_required(VERSION 3.20)
cmake_policy(SET CMP0123 NEW)

# 设置工具链 (必须在 project 之前)
set(CMAKE_TOOLCHAIN_FILE ${CMAKE_CURRENT_LIST_DIR}/Toolchain.cmake)

# 基本项目定义
project(TEST C ASM)

# 设置常用路径变量
get_filename_component(CurrentProjectPath "${CMAKE_CURRENT_LIST_DIR}/../" ABSOLUTE)
set(EXECUTABLE_OUTPUT_PATH ${CMAKE_BINARY_DIR}/output)

# 加载模块
include(NeedEdit/sources.cmake)     # 搜集文件
add_executable(${PROJECT_NAME} ${SOURCE_FILE} ${STARTUP_FILE}) # 创建目标
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${EXECUTABLE_OUTPUT_PATH}
)

include(NeedEdit/flags.cmake)       # 配置参数 (GCC/ARMCC)
include(NeedEdit/post_build.cmake)  # 配置生成 Hex/Bin
```

源文件需要在`sources.cmake`中定义，其中需要包含所有需要的源文件。

```cmake
# 确定启动文件路径
if(USE_ARMGCC)
    set(STARTUP_FILE ${CurrentProjectPath}/Drivers/CMSIS/Device/FM/FM33xx/Source/Templates/gcc/startup_fm33lg0xx.S)
else()
    message(FATAL_ERROR "Unsupported compiler")
endif()

# 头文件包含路径
include_directories(
    ${CurrentProjectPath}/inc/
    ${CurrentProjectPath}/Drivers/CMSIS/Device/FM/FM33xx/Include
    ${CurrentProjectPath}/Drivers/FM33LG0xx_FL_Driver/Inc
    ${CurrentProjectPath}/MF-config/Inc
)

# 源文件路径
file(GLOB SOURCE_FILE
    ${CurrentProjectPath}/src/*.c
    ${CurrentProjectPath}/Drivers/CMSIS/Device/FM/FM33xx/Source/Templates/*.c
    ${CurrentProjectPath}/Drivers/CMSIS/Device/FM/FM33xx/Source/*.c
    ${CurrentProjectPath}/Drivers/FM33LG0xx_FL_Driver/Src/*.c
    ${CurrentProjectPath}/MF-config/Src/*.c
)
```

在`flags.csmke`中定义了所有的编译选项

```cmake
set(CPU_CORE cortex-m0plus)
set(MAP_FILE ${EXECUTABLE_OUTPUT_PATH}/${PROJECT_NAME}.map)

set(CMAKE_SYSTEM_PROCESSOR ${CPU_CORE})


if(USE_ARMGCC)
    set(ARCH_FLAGS -mcpu=${CPU_CORE} -mthumb -march=armv6-m -mlittle-endian)
    set(LINKER_SCRIPT ${CurrentProjectPath}/Drivers/CMSIS/Device/FM/FM33xx/Source/Templates/gcc/linker/fm33lg04x_flash.ld)

    # 编译选项
    target_compile_options(${PROJECT_NAME} PRIVATE
        ${ARCH_FLAGS}
        $<$<CONFIG:RELEASE>:-Os>
        $<$<CONFIG:DEBUG>:-O0 -g3>
        -fmessage-length=0 
        -fsigned-char 
        -ffunction-sections 
        -fdata-sections 
        -std=gnu11
    )

    target_link_options(${PROJECT_NAME} PRIVATE
        ${ARCH_FLAGS}
        -Xlinker
        --gc-sections
        -T "${LINKER_SCRIPT}"
        -Wl,-Map=${MAP_FILE}
        -Wl,--print-memory-usage
    )
else()
    
endif()

# 增加宏
target_compile_definitions(${PROJECT_NAME} PUBLIC 
    FM33LG0XX 
    USE_FULL_ASSERT
)

```

在`post_build.cmake`文件中写用于生成bin和hex的文件

```cmake
set(HEX_FILE ${EXECUTABLE_OUTPUT_PATH}/${PROJECT_NAME}.hex)
set(BIN_FILE ${EXECUTABLE_OUTPUT_PATH}/${PROJECT_NAME}.bin)

if(USE_ARMGCC)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:${PROJECT_NAME}> ${HEX_FILE}
        COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${PROJECT_NAME}> ${BIN_FILE}
        COMMAND ${CMAKE_SIZE} $<TARGET_FILE:${PROJECT_NAME}>
    )
else()
  
endif()
```

