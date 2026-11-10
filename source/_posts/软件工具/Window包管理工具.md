---
title: Window包管理工具

categories: 
  - 软件及工具
---

# 参考链接

# 概述

主流命令行包管理工具：

*   **WinGet**：微软官方出品，现代 Windows 10/11 已内置。它是最标准的选择，支持从官方源及 Microsoft Store 安装软件，适合作为基础工具。
*   **Chocolatey**：老牌第三方工具，软件库极其丰富，适合需要管理大量软件或进行企业级部署的场景。它支持 MSI、EXE 等多种安装格式，不过部分冷门包的更新可能不够及时。
*   **Scoop**：面向开发者的轻量级选择。它最大的特点是将软件安装在用户目录下，**无需管理员权限**，且尽量不污染系统注册表，非常适合配置受限环境或喜欢便携软件的用户。

> [!note]
>
> 如果你不想敲命令行，可以借助 **UniGetUI**（原名 WingetUI）。它是一个图形界面的“聚合器”，可以把 WinGet、Chocolatey、Scoop、pip、npm 等多种包管理器整合到一个窗口里，让你像逛应用商店一样搜索、安装、更新和卸载软件。
>
> 你平时主要是想方便地安装日常软件，还是为了配置开发环境？这决定了是直接用 WinGet 就够了，还是需要搭配 Scoop 或 Chocolatey。

# WinGet

WinGet 是微软官方推出的 Windows 命令行包管理工具，用于搜索、安装、升级和卸载应用程序。在大多数现代 Windows 10/11 系统上它已预装，如果没有，也可以通过 Microsoft Store 或 GitHub 手动安装。下面从安装检查开始，介绍最常用的核心语法。

## 安装与检查

**先确认是否已安装**：打开 PowerShell 或命令提示符，输入 `winget` 并回车。如果显示版本信息和语法帮助，说明已可用；如果提示“无法识别”，则需要安装。

**安装方法**：
- **从 Microsoft Store 安装（推荐）**：打开 Microsoft Store，搜索“应用安装程序”（App Installer），点击“获取”安装即可。WinGet 就包含在这个包中。
- **从 GitHub 手动安装**：如果 Store 不可用，可以前往 WinGet 的 GitHub Releases 页面，下载最新的 `.msixbundle` 文件，运行后选择“更新”完成安装。

> **系统要求**：Windows 10 版本 1809（内部版本 17763）或更高，Windows Server 2019 不支持。

## 常见语法与实战

WinGet 的核心用法遵循 `winget <命令> [参数]` 的格式。以下是日常最常用的几个命令。

1. 搜索软件

   在安装前，先用 `search` 确认软件是否存在。建议直接搜名称。

   ```cmd
   winget search <软件名>
   ```

   例如 `winget search firefox`。搜索结果会显示软件名称、**ID**（唯一标识符）和版本号。**记住 ID**，后续操作用它最准确。

2. 安装软件

   推荐使用 `--id` 参数指定 ID，避免名称冲突。

   ```cmd
   winget install --id <软件ID>
   ```

   例如 `winget install --id Mozilla.Firefox`。

   > **权限提示**：如果以普通用户身份运行，遇到需要管理员权限的安装程序时，Windows 会弹出 UAC 提示；如果是在管理员终端中运行，则不会弹出提示，需自行确认安装的软件可信。

3. 查看已安装与可更新

   ```cmd
   winget list
   ```

   列出系统中已安装的软件。

   ```cmd
   winget upgrade
   ```

   单独运行此命令，会列出所有有可用更新的软件，方便你查看。

4. 升级软件

   升级单个软件：

   ```cmd
   winget upgrade --id <软件ID>
   ```

   **一键升级全部**（最常用，建议加上自动同意协议参数避免卡住）：

   ```cmd
   winget upgrade --all --accept-package-agreements
   ```

5. 卸载软件

   同样使用 ID 来精确卸载：

   ```cmd
   winget uninstall --id <软件ID>
   ```


> [!note] 
>
> 一个完整流程示例:
>
> 假设你想安装 Firefox 浏览器：
>
> 1.  **搜索**：`winget search firefox` → 在结果中找到 ID `Mozilla.Firefox`。
> 2.  **安装**：`winget install --id Mozilla.Firefox` → 等待下载安装完成。
> 3.  **后续更新**：日后想更新时，运行 `winget upgrade --all` 即可一并处理。

## 安装在指定位置

WinGet 本身没有全局的“默认安装路径”设置，能否安装到指定文件夹，**完全取决于该软件自身的安装程序是否支持自定义路径**。你可以尝试用 `--location` 参数来引导，但并非对所有软件都有效。

1. 核心方法：使用 `--location` 参数

   在安装命令后加上 `-l` 或 `--location`，后面跟上你的目标路径。

   ```cmd
   winget install --id <软件ID> --location "D:\你的文件夹"
   ```

   **关键限制**：微软官方文档明确指出，这**仅在安装程序本身支持自定义路径时才有效**。如果软件安装包不支持，即使加了参数，它依然会装到默认位置（通常是 C 盘）。

2. 备选方案：交互式安装

   如果不确定软件是否支持，可以用 `-i`（交互模式）运行，让安装程序的图形界面弹出来，你手动在界面里选择路径。

   ```cmd
   winget install --id <软件ID> -i
   ```

   这要求安装程序提供图形界面，且本身有路径选择选项。

3. 特殊情况：软件专属参数

   极少数大型软件（如 Visual Studio）不支持通用的 `--location`，必须用它自己的参数。例如 VS 2022 Build Tools 需要用 `--override` 传递 `--installPath`。

   ```cmd
   winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--passive --wait --installPath D:\你的路径"
   ```

   这类情况需要单独查阅该软件的文档。

> [!tip]
>
> 如果你安装的是 WinGet 的**便携版（Portable）** 软件，可以通过修改配置文件来更改默认存放位置。运行 `winget settings` 打开配置文件，在 `installBehavior` 下设置 `portablePackageUserRoot` 或 `portablePackageMachineRoot` 的路径即可。但这只对便携版生效，普通安装包不适用。

# Chocolatey 

Chocolatey 是 Windows 上老牌的第三方命令行包管理工具，可以把它理解成 Windows 版的 `apt` 或 `yum`。它的核心优势是**软件库非常丰富**，社区维护的包数量庞大，适合需要批量装机或管理大量软件的场景。

## 安装 Chocolatey

安装需要通过**管理员权限**的 PowerShell 来完成。

1.  **以管理员身份打开 PowerShell**。
2.  **检查执行策略**：输入 `Get-ExecutionPolicy`。如果返回 `Restricted`，需要先运行 `Set-ExecutionPolicy Bypass -Scope Process` 来临时放宽限制。
3.  **运行安装命令**：复制并粘贴以下官方脚本执行即可：
    ```powershell
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```
4.  安装完成后，输入 `choco` 验证是否成功。

> **注意**：Chocolatey 自身的默认安装路径是 `C:\ProgramData\chocolatey`。

## 常见语法与常用命令

Chocolatey 的命令以 `choco` 开头，日常操作主要围绕以下几个命令：

*   **搜索软件**：`choco search <关键词>`。例如 `choco search vlc`。
*   **安装软件**：`choco install <包名> -y`。`-y` 参数用于自动确认，避免安装过程卡在提示上。例如 `choco install googlechrome -y`。
*   **升级软件**：
    *   升级单个：`choco upgrade <包名> -y`
    *   升级全部：`choco upgrade all -y`
*   **卸载软件**：`choco uninstall <包名> -y`。
*   **查看已安装**：`choco list -l` 或 `choco list --local-only`。

## 安装在指定位置

这一点和 WinGet 类似，**Chocolatey 免费版没有一个“万能”的指定路径参数**。能否自定义路径，取决于具体的软件包和你的版本。

*   **免费版**：官方**没有**提供统一的 `--install-directory` 这类参数。你只能尝试在安装时，把原生安装器（如 MSI 或某些 EXE）自己的静默参数传给 Chocolatey。例如，对于 MSI 包，可以尝试 `choco install <包名> --% -ia INSTALLDIR="D:\你的路径"`，但这要求该包本身支持这个参数，且你需要知道它是什么。
*   **付费版（Pro/Business）**：Chocolatey 官方明确将“通用安装目录覆盖”功能作为**付费版专享**。付费用户可以使用 `--install-directory` 参数，Chocolatey 会自动识别安装器类型并转换成正确的底层参数。

所以，如果你希望在 Chocolatey 中轻松地把软件装到指定文件夹，官方的解决方案是升级到付费版。对于免费版，只能针对特定软件“碰运气”式地传递原生参数。

# Scoop

Scoop 是一个面向开发者的 Windows 命令行包管理工具。它和 Chocolatey 的思路很不一样：**Chocolatey 倾向于全局安装（需要管理员权限），而 Scoop 默认把软件装在你的用户目录下，完全不需要管理员权限**，主打“便携、干净、不污染系统”。

## 为什么有人偏爱 Scoop

Scoop 的设计哲学很明确，就是尽量不打扰系统：

*   **无 UAC 弹窗，无需管理员**：所有软件默认安装在 `~\scoop` 目录下，普通用户权限即可完成，很适合公司受限电脑或不想频繁提权的场景。
*   **不污染 PATH**：不管你装多少软件，Scoop 只把 `~\scoop\shims` 这一个目录加进 PATH，通过“垫片（shim）”来转发命令，环境变量始终清爽。
*   **干净卸载**：软件文件都隔离在各自目录里，卸载时直接删掉对应文件夹即可，基本没有注册表残留。
*   **自动处理依赖**：安装软件时会自动帮你把需要的依赖库（比如某些工具需要的运行库）一并装好。

## 安装 Scoop

在 PowerShell（普通权限即可，**不要**用管理员）中运行以下命令：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

如果你担心中文用户名导致路径问题，或者单纯想把 Scoop 装到 D 盘，可以在执行安装脚本时指定目录。先下载脚本，再带参数执行：
```powershell
# 下载安装脚本
irm get.scoop.sh -outfile 'install.ps1'
# 指定安装路径执行（把 D:\scoop 换成你想要的位置）
.\install.ps1 -ScoopDir 'D:\scoop'
```



## 基础命令与常用操作

Scoop 的语法比较接近 Linux 包管理器：

*   **搜索**：`scoop search <关键词>`。注意，Scoop 默认的 `main` 仓库主要收录命令行工具，很多带图形界面的软件（如浏览器、播放器）需要先添加 `extras` 仓库才能搜到。
*   **安装**：`scoop install <软件名>`。例如 `scoop install python` 或 `scoop install nodejs`。
*   **添加仓库（Bucket）**：`scoop bucket add extras`。`extras` 是最常用的扩展仓库，装 GUI 软件基本都要先加它。
*   **更新**：
    *   更新 Scoop 自身及仓库索引：`scoop update`
    *   更新所有已安装软件：`scoop update *`
*   **卸载**：`scoop uninstall <软件名>`。

## 安装在指定位置

Scoop 的机制和 WinGet/Chocolatey 不同。**它没有提供在 `scoop install` 时临时指定单个软件路径的参数**，因为它的设计就是所有软件统一管理在 Scoop 根目录下。

但是，你可以在**安装 Scoop 本身的时候**，通过 `-ScoopDir` 参数把整个 Scoop 及其后续安装的所有软件，都放到你指定的盘符或文件夹（如上文安装步骤所示）。一旦 Scoop 装好，后续 `scoop install` 的软件都会自动装进那个目录里，不会散落到 C 盘各处。如果你之前习惯了“每个软件单独选路径”，用 Scoop 可能需要适应一下这种“统一仓库”的模式。

> [!tip]
>
> Scoop 的软件库数量**明显少于 Chocolatey**，而且它最擅长的领域是**开发工具、命令行程序、以及便携版软件**。如果你想装一些大型商业软件或冷门工具，Scoop 里可能找不到，这时候还是需要 WinGet 或 Chocolatey 来补充。

## 安装流程

使用`gitee`上的`Scoop`就不用担心网络的问题，可以访问https://gitee.com/scoop-installer/scoop来安装scoop。

1. 给`Scoop`创建环境变量（在`PowerShell`中执行）

   ```shell
   [Environment]::SetEnvironmentVariable('SCOOP','D:\Scoop','USER')
   ```

   设置完环境变量之后需要重启一下`Powershell`

2. 安装到指定位置

   ```shell
   ## 自定义安装目录（注意将目录修改为合适位置)
   irm scoop.201704.xyz -outfile 'install.ps1'
   .\install.ps1 -ScoopDir 'D:\Scoop' -ScoopGlobalDir 'D:\GlobalScoopApps'
   ```

3. 安装

   ```shell
   # 脚本执行策略更改，默认自动同意
   Set-ExecutionPolicy RemoteSigned -scope CurrentUser -Force
   
   # 执行安装命令（默认安装在用户目录下，如需更改请执行“自定义安装目录”命令）
   iwr -useb scoop.201704.xyz | iex
   ```

4. 安装`Git`程序

   ```shell
   #必装git，scoop及bucket更新均依赖此软件
   scoop install git
   ```

5. 添加`Bucket`

   ```shell
   #查询已知bucket
   scoop bucket known
   #添加bucket
   scoop bucket add extras
   ```

   