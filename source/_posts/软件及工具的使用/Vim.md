---
date: 2025-08-12 08:27:25
title: Vim

categories: 
  - 软件及工具

---



# 启动 &安装

## 包管理工具

我们可以使用`Scoop`来安装软件，使用`gitee`上的`Scoop`就不用担心网络的问题，可以访问https://gitee.com/scoop-installer/scoop来安装scoop。

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

   

## 原生Vim

在终端中输入 `vim` 启动 Vim，或者输入 `vim filename` 打开特定文件。

```sh
vim
vim filename
```

## Neovim

首先可以在[Home - Neovim](https://neovim.io/)页面下载并安装软件或者使用`Scoop`来安装软件：

```shell
scoop install neovim
```

安装完成之后，强烈建议安装`lazyvim`包管理器，用`lazyvim`包管理器可以更快更方便的安装插件。安装步骤可见[🛠️ Installation | LazyVim](https://www.lazyvim.org/installation)。`LazyVim`需要依赖以下几个软件，我们可以提前安装好：

- Neovim >= **0.9.0** (needs to be built with **LuaJIT**)
- Git >= **2.19.0** (for partial clones support)
-  [Nerd Font](https://www.nerdfonts.com/)（v3.0 或更高版，用于图标显示）
- [lazygit](https://github.com/jesseduffield/lazygit) 
- a **C** compiler for `nvim-treesitter`. See [here](https://github.com/nvim-treesitter/nvim-treesitter#requirements)
- **curl** for [blink.cmp](https://github.com/Saghen/blink.cmp) **(completion engine)**
- for fzf-lua  *(optional)*
  - **fzf**: [fzf](https://github.com/junegunn/fzf) **(v0.25.1 or greater)**
  - **live grep**: [ripgrep](https://github.com/BurntSushi/ripgrep)
  - **find files**: [fd](https://github.com/sharkdp/fd)
- a terminal that support true color and undercurl:
  - [kitty](https://github.com/kovidgoyal/kitty) ***(Linux & Macos)\***
  - [wezterm](https://github.com/wez/wezterm) ***(Linux, Macos & Windows)\***
  - [alacritty](https://github.com/alacritty/alacritty) ***(Linux, Macos & Windows)\***
  - [iterm2](https://iterm2.com/) ***(Macos)\***



git完之后，所有的文件在`~\AppData\Local\nvim`文件夹下，该文件夹下有以下重要文件：

- `init.lua`：在顶层文件夹中，定义了依赖文件
- `options.lua`：在`lua/config`文件夹下，用于做vim的配置
- `keymap.lua`：在`lua/config`文件夹下，用于按键映射

> [!note] 
>
> 如果出现下载不了的情况，请设置http和https的代理，代理的地址和端口请参见设置中的代理配置
>
> ```bash
> # 设置 HTTP 代理
> git config --global http.proxy http://127.0.0.1:7890
> # 设置 HTTPS 代理
> git config --global https.proxy http://127.0.0.1:7890
> ```
>
> 

1. 在`init`文件中写入依赖的文件

   ```lua
   -- bootstrap lazy.nvim, LazyVim and your plugins
   require("config.lazy")
   
   require("lazy").setup("plugins")
   ```

   > [!tip] 
   >
   > 这里最后一行会解析`plugins`文件下的所有插件，所以新增一个插件只需要在`plugins`文件夹下增加插件的文件即可

   其中，配置文件的依赖命令行应该在开头，命令为`文件夹名.文件名`

2. `options`文件中写入vim的配置，如缩进有几个空格等等

   ```lua
   -- Options are automatically loaded before lazy.nvim startup
   -- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
   -- Add any additional options here
   local opt = vim.opt
   
   -- 行号
   opt.relativenumber = true
   opt.number = true
   
   -- 缩进
   opt.tabstop = 4        -- 制表符显示为4个空格宽
   opt.shiftwidth = 4     -- 用于自动缩进的宽度
   opt.expandtab = false  -- 使用制表符进行缩进
   opt.autoindent = true
   
   -- 防止包裹
   opt.wrap = false
   
   -- 光标行
   opt.cursorline = false
   
   -- 启用鼠标
   opt.mouse:append("a")
   
   -- 系统剪贴板
   opt.clipboard:append("unnamedplus")
   
   -- 默认新窗口右和下
   opt.splitright = true
   opt.splitbelow = true
   
   -- 搜索
   opt.ignorecase = true
   opt.smartcase = true
   
   -- 拼写检查
   vim.opt.spell = true  -- 启用拼写检查
   vim.opt.spelllang = { "en", "cjk" }  -- 英文+忽略中文检查
   ```

3. `keymap`文件为快捷键映射

   ```lua
   vim.g.mapleader = " "
   
   local keymap = vim.keymap
   
   -- ---------- 插入模式 ---------- ---
   keymap.set("i", "jk", "<ESC>")
   
   -- ---------- 视觉模式 ---------- ---
   -- 单行或多行移动
   keymap.set("v", "J", ":m '>+1<CR>gv=gv")
   keymap.set("v", "K", ":m '<-2<CR>gv=gv")
   
   -- ---------- 正常模式 ---------- ---
   -- 窗口
   keymap.set("n", "<leader>sv", "<C-w>v") -- 水平新增窗口 
   keymap.set("n", "<leader>sh", "<C-w>s") -- 垂直新增窗口
   
   -- 取消高亮
   keymap.set("n", "<leader>nh", ":nohl<CR>")
   
   -- 文件树映射
   keymap.set("n", "<leader>e", ":NvimTreeToggle<CR>")
   ```

   > [!tip] 
   >
   > `keymap.set`命令的参数依次为：
   >
   > 1. 在什么模式下
   > 2. 映射的按键
   > 3. 被映射的命令
   >
   > 其中一些按键为：
   >
   > 1. `vim.g.mapleader`是设置主键，我这里设置的是空格 
   > 2. `<CR>`为回车
   > 3. `<C>`为`ctrl`键

# 插件管理

## Vim

Vim 有丰富的插件生态，可以使用插件管理器来安装和管理插件。常见的插件管理器有：

- **Vundle**：在 `~/.vimrc` 中添加插件配置，然后运行 `:PluginInstall`。

```vim
set nocompatible              " 必须
filetype off                  " 必须

" 设置 runtime path
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
" 在这里添加更多的插件
Plugin 'tpope/vim-sensible'
call vundle#end()            " 必须
filetype plugin indent on    " 必须
```

- **Pathogen**：将插件克隆到 `~/.vim/bundle/` 目录。

```sh
mkdir -p ~/.vim/autoload ~/.vim/bundle && \
curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
```

在 `~/.vimrc` 中添加：

```vim
execute pathogen#infect()
syntax on
filetype plugin indent on
```

通过这些基本操作，你可以高效地使用 Vim 进行文本编辑和代码开发。随着使用经验的增加，你可以进一步探索 Vim 的高级功能和插件生态，提升工作效率。

## Neovim

前面说过插件的配置管理会放到`plugins`文件夹下，新增一个插件就需要新建一个`lua`的配置文件，且配置文件名没有要求。

### nvim-tree

```lua
return {
    {
        "nvim-tree/nvim-tree.lua",
        version = "*",
        dependencies = {"nvim-tree/nvim-web-devicons"},
        config = function()
            require("nvim-tree").setup {}
        end
    }
}

```

添加完依赖之后，打开一个文件之后，在命令行中输入以下命令，如果在侧边出现了文件树，则说明配置成功了

```
:NvimTreeToggle
```

每次输入命令会特别的麻烦，所以需要在`keymap`文件中增加映射：

```lua
-- nvim-tree
keymap.set("n", "<leader>e", ":NvimTreeToggle<CR>")
```

此时刷新配置，使用空格加e即可打开文件树了。

### Lsp-Clangd

在安装完lazy-nvim之后，可以在命令行输入`:LazyExtras`，此时就会显示出来有哪些拓展包，在需要安装的包前面按下<kbd>x</kbd>按键即可选中该支持包，然后重启即可启用。

如果使用`clangd`，实际上是需要一个编译好的json文件，也就是iar生成的文件会在`debug`目录下的`compile_commands.json`，那么如果想要解析正确，就需要在项目的根目录下新建一个`.clangd`文件，其中文件的内容为：

```yaml
CompileFlags:
  CompilationDatabase: ./Project/IAR/Debug
```

> [!tip]
>
> 需要注意的是，路径只需要设置为`compile_commands.json`的路径，不需要指定到文件

### nvim-treesitter

```lua
require'nvim-treesitter.configs'.setup {
  -- 添加不同语言
  ensure_installed = { "vim", "vimdoc", "bash", "c", "cpp", "javascript", "json", "lua", "python", "typescript", "tsx", "css", "rust", "markdown", "markdown_inline" }, -- one of "all" or a list of languages

  highlight = { enable = true },
  indent = { enable = true },

  -- 不同括号颜色区分
  rainbow = {
    enable = true,
    extended_mode = true,
    max_file_lines = nil,
  }
}
```



### lua-line

该插件用于美化状态栏，在`plugin-setup`文件中新建`lualine.lua`

```lua
return {
    {
        'nvim-lualine/lualine.nvim',
        config = function()
            require('lualine').setup()
        end
    }
}
```



### 片段管理

我们可以使用`autocmd`的插件和脚本的方式实现，在`autocmds.lua`文件中填写以下代码：

```lua
-- ~/.config/nvim/lua/autorun/autoheader.lua

-- ============================================================================
--                            配置项 (Configuration)
-- ============================================================================
local config = {
    author_name = "ryf",
    copyright_start_year = "2025",
    place_cursor = true,
}

-- ============================================================================
--                            模板定义 (Templates)
-- ============================================================================

local h_template = {
    "/*==============================================================================",
    " * Author: %s",
    " * Date: %s",
    " * LastEditors: %s",
    " * LastEditTime: %s",
    " * Filename: %s",
    " * Description: Header file for ...",
    " * Copyright (c) %s - %s by %s, All Rights Reserved.",
    "==============================================================================*/",
    "",
    "#ifndef __%s_H__",
    "#define __%s_H__",
    "",
    "#ifdef __cplusplus",
    'extern "C" {',
    "#endif",
    "",
    "/*==============================================================================",
    "=======                             INCLUDES                             =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======               DEFINES & MACROS FOR GENERAL PURPOSE               =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        CONSTANTS & TYPES                         =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                             EXPORTS                              =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                  PROTOTYPES OF PUBLIC FUNCTIONS                  =======",
    "==============================================================================*/",
    "",
    "#ifdef __cplusplus",
    "}",
    "#endif",
    "",
    "#endif"
}
local h_cursor_target_line = 7
local h_cursor_target_col = 19

local c_cpp_template = {
    "/*==============================================================================",
    " * Author: %s",
    " * Date: %s",
    " * LastEditors: %s",
    " * LastEditTime: %s",
    " * Filename: %s",
    " * Description: ",
    " * Copyright (c) %s - %s by %s, All Rights Reserved.",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                             Includes                             =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======               Defines & Macros for General Purpose               =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        Constants & Types                         =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        Global variables                          =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        Local variables                           =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        Global Function                           =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                        Local Function                            =======",
    "==============================================================================*/",
    "",
    "/*==============================================================================",
    "=======                    Function Implement List                       =======",
    "==============================================================================*/",
    ""
}
local c_cpp_cursor_target_line = 7
local c_cpp_cursor_target_col = 17

-- ============================================================================
--                      文件头插入逻辑 (Header Insertion Logic)
-- ============================================================================

function _G.auto_insert_header(buf)
    buf = buf or vim.api.nvim_get_current_buf()

    if not vim.api.nvim_buf_is_valid(buf) or vim.api.nvim_buf_get_option(buf, 'buftype') ~= "" then
        return
    end

    local file_path = vim.api.nvim_buf_get_name(buf)
    if file_path == "" then
        return
    end
    local extension = vim.fn.fnamemodify(file_path, ":e")

    if not (extension == 'c' or extension == 'cpp' or extension == 'h') then
        return
    end

    if vim.api.nvim_buf_line_count(buf) > 1 then
        return
    end
    local first_line = vim.api.nvim_buf_get_lines(buf, 0, 1, false)[1] or ""
    if first_line ~= "" then
        return
    end

    local filename_no_ext_upper = vim.fn.fnamemodify(file_path, ":t:r"):upper()
    local full_filename = vim.fn.fnamemodify(file_path, ":t")
    local current_date = os.date("%Y-%m-%d")
    local current_datetime = os.date("%Y-%m-%d %H:%M:%S")
    local current_year = os.date("%Y")

    local lines_to_insert = {}
    local target_line = 1
    local target_col = 1

    if extension == "c" or extension == "cpp" then
        lines_to_insert = {}
        for i, line in ipairs(c_cpp_template) do
            if line:find("%%s") then
                local formatted_line
                if i == 2 then -- Author: %s
                    formatted_line = string.format(line, config.author_name)
                elseif i == 3 then -- Date: %s
                    formatted_line = string.format(line, current_date)
                elseif i == 4 then -- LastEditors: %s
                    formatted_line = string.format(line, config.author_name)
                elseif i == 5 then -- LastEditTime: %s
                    formatted_line = string.format(line, current_datetime)
                elseif i == 6 then -- Filename: %s
                    formatted_line = string.format(line, full_filename)
                elseif i == 8 then -- Copyright (c) %s - %s by %s
                    local success, result = pcall(string.format, line,
                        config.copyright_start_year,
                        current_year,
                        config.author_name
                    )
                    formatted_line = success and result or line
                else
                    formatted_line = line
                end
                table.insert(lines_to_insert, formatted_line)
            else
                table.insert(lines_to_insert, line)
            end
        end
        target_line = c_cpp_cursor_target_line
        target_col = c_cpp_cursor_target_col
    elseif extension == "h" then
        lines_to_insert = {}
        for i, line in ipairs(h_template) do
            if line:find("%%s") then
                local formatted_line
                if i == 2 then -- Author: %s
                    formatted_line = string.format(line, config.author_name)
                elseif i == 3 then -- Date: %s
                    formatted_line = string.format(line, current_date)
                elseif i == 4 then -- LastEditors: %s
                    formatted_line = string.format(line, config.author_name)
                elseif i == 5 then -- LastEditTime: %s
                    formatted_line = string.format(line, current_datetime)
                elseif i == 6 then -- Filename: %s
                    formatted_line = string.format(line, full_filename)
                elseif i == 8 then -- Copyright (c) %s - %s by %s
                    local success, result = pcall(string.format, line,
                        config.copyright_start_year,
                        current_year,
                        config.author_name
                    )
                    formatted_line = success and result or line
                elseif i == 11 or i == 12 or i == 13 then -- #ifndef, #define, #endif
                    formatted_line = string.format(line, filename_no_ext_upper)
                else
                    formatted_line = line
                end
                table.insert(lines_to_insert, formatted_line)
            else
                table.insert(lines_to_insert, line)
            end
        end
        target_line = h_cursor_target_line
        target_col = h_cursor_target_col
    end

    vim.api.nvim_buf_set_option(buf, 'modifiable', true)
    vim.api.nvim_buf_set_lines(buf, 0, 0, false, lines_to_insert)

    if config.place_cursor and #lines_to_insert > 0 then
        local final_line = math.min(target_line, vim.api.nvim_buf_line_count(buf))
        local final_col = math.max(0, target_col - 1)
        vim.api.nvim_win_set_cursor(0, { final_line, final_col })
    end
end

-- ============================================================================
--                   实时更新 LastEditTime (Update LastEditTime)
-- ============================================================================

function _G.update_last_edit_time(buf)
    buf = buf or vim.api.nvim_get_current_buf()

    if not vim.api.nvim_buf_is_valid(buf) or vim.api.nvim_buf_get_option(buf, 'buftype') ~= "" then
        return
    end

    local file_path = vim.api.nvim_buf_get_name(buf)
    if file_path == "" then
        return
    end
    local extension = vim.fn.fnamemodify(file_path, ":e")

    if not (extension == 'c' or extension == 'cpp' or extension == 'h') then
        return
    end

    -- 获取当前时间
    local current_datetime = os.date("%Y-%m-%d %H:%M:%S")

    -- 获取前几行，检查是否包含 @LastEditTime
    local lines = vim.api.nvim_buf_get_lines(buf, 0, 10, false)
    for i, line in ipairs(lines) do
        if line:find("@LastEditTime:") then
            -- 更新 @LastEditTime 行
            local new_line = string.format(" * @LastEditTime: %s", current_datetime)
            vim.api.nvim_buf_set_lines(buf, i - 1, i, false, {new_line})
            break
        end
    end
end

-- ============================================================================
--                         Autocommand 设置 (Setup)
-- ============================================================================

local autoHeaderGroup = vim.api.nvim_create_augroup("UserAutoHeader", { clear = true })

-- 插入文件头
vim.api.nvim_create_autocmd({ "BufNewFile", "BufEnter" }, {
    group = autoHeaderGroup,
    pattern = {"*.c", "*.cpp", "*.h"},
    desc = "自动为新的或空的 c/c++/h 文件插入文件头",
    callback = function(args)
        local buf = args.buf
        if vim.api.nvim_buf_is_valid(buf) and
           vim.api.nvim_buf_get_option(buf, 'buftype') == "" and
           vim.api.nvim_buf_get_option(buf, 'modifiable') then
            vim.schedule(function()
                _G.auto_insert_header(buf)
            end)
        end
    end,
})

-- 更新 LastEditTime
vim.api.nvim_create_autocmd("BufWritePre", {
    group = autoHeaderGroup,
    pattern = {"*.c", "*.cpp", "*.h"},
    desc = "保存时更新 LastEditTime",
    callback = function(args)
        local buf = args.buf
        if vim.api.nvim_buf_is_valid(buf) and
           vim.api.nvim_buf_get_option(buf, 'buftype') == "" and
           vim.api.nvim_buf_get_option(buf, 'modifiable') then
            vim.schedule(function()
                _G.update_last_edit_time(buf)
            end)
        end
    end,
})
```



### fitten-code

fitten code是ai补全代码工具，配置如下：

```lua
return{
	{
		'luozhiya/fittencode.nvim',
		config = function()
		require('fittencode').setup()
	end
	}
}
```

使用`Fitten login`命令来登录，使用`Fitten logout`来登出

### outline

用于展示函数的大纲



```lua
   -- 在 ~/.config/nvim/lua/plugins/extra.lua 中添加
   return {
     {
       "simrat39/symbols-outline.nvim",
       cmd = "SymbolsOutline",
       keys = {
         { "<leader>o", "<cmd>SymbolsOutline<CR>", desc = "Toggle Outline" },
       },
       config = true,  -- 使用默认配置
     }
   }
```

### Auto-Save

用于自动保存文件，自动保存设置为一旦窗口失焦就自动保存

```lua
return {
  "Pocco81/auto-save.nvim",
  event = "VeryLazy",
  config = function()
    require("auto-save").setup {
      enabled = true,
      trigger_events = { "FocusLost", "WinLeave" },
      debounce_delay = 500,
      -- 将字符串改为数组格式（推荐）
      execution_message = {
        message = function() return "AutoSave: 已保存 " .. vim.fn.expand("%:p") end,
        dim = 0.5,  -- 可选：通知文本透明度
        cleaning_interval = 1250,  -- 可选：消息自动清除延迟（毫秒）
      },
      quiet = false,
    }
  end,
}
```

可以设置的事件有

| 事件名称        | 触发场景                                    | 示例值                               |
| --------------- | ------------------------------------------- | ------------------------------------ |
| `"FocusLost"`   | 窗口失去焦点（如切换到其他应用）            | `trigger_events = { "FocusLost" }`   |
| `"WinLeave"`    | 离开当前 Neovim 窗口                        | `trigger_events = { "WinLeave" }`    |
| `"BufLeave"`    | 离开当前 Buffer（切换文件时）               | `trigger_events = { "BufLeave" }`    |
| `"InsertLeave"` | 退出插入模式（Normal 模式时保存）           | `trigger_events = { "InsertLeave" }` |
| `"TextChanged"` | 文本内容变更后保存                          | `trigger_events = { "TextChanged" }` |
| `"CursorHold"`  | 光标停留一段时间后保存（需设 `updatetime`） | `trigger_events = { "CursorHold" }`  |



#  基本模式

Vim 有三种主要模式：

- **Normal 模式**：默认模式，用于执行命令。
- **Insert 模式**：用于编辑文本。
- **Visual 模式**：用于选择文本。

切换模式

- **Normal 模式**：启动 Vim 后默认进入 Normal 模式。按 `Esc` 可以从其他模式切换到 Normal 模式。
- **Insert 模式**：在 Normal 模式下，按 `i` 进入 Insert 模式，按 `Esc` 退出到 Normal 模式。
- **Visual 模式**：在 Normal 模式下，按 `v` 进入 Visual 模式，按 `Esc` 退出到 Normal 模式。

# 操作指南

> [!tip]
>
> 注意，其中有些功能基于`lazyvim`，并且命令均处于`Normal`模式

## 键位图

![VIM键位图](https://i-blog.csdnimg.cn/blog_migrate/9d1351469929da16936b11c946ecd2c4.jpeg)

## 命令行

| 命令                            | 作用                                          | 备注                   |
| ------------------------------- | --------------------------------------------- | ---------------------- |
| <kbd>ctrl</kbd><kbd>/</kbd>     | 打开/关闭终端                                 |                        |
| <kbd>q</kbd><kbd>a</kbd>        | 关闭vim                                       |                        |
| <kbd>:w</kbd>                   | 保存文件                                      |                        |
| <kbd>:q</kbd>                   | 退出 Vim                                      |                        |
| <kbd>:wq</kbd> 或 <kbd>ZZ</kbd> | 保存并退出                                    |                        |
| <kbd>:q!</kbd>                  | 不保存退出                                    |                        |
| <kbd>Esc</kbd>                  | 返回到 Normal 模式                            |                        |
| <kbd>/</kbd>                    | 向下搜索                                      | 输入想要搜索的内容即可 |
| <kbd>?</kbd>                    | 向上搜索                                      | 输入想要搜索的内容即可 |
| <kbd>n</kbd>                    | 跳转到下一个匹配                              |                        |
| <kbd>N</kbd>                    | 跳转到上一个匹配                              |                        |
| `:%s/old/new/g`                 | 全局替换所有 `old` 为 `new`                   |                        |
| `:s/old/new/g`                  | 替换当前行所有 `old` 为 `new`                 |                        |
| `:s/old/new/gc`                 | 替换当前行所有 `old` 为 `new`，并确认每次替换 |                        |

## 文件

| 命令                                       | 作用                      | 备注                                                     |
| ------------------------------------------ | ------------------------- | -------------------------------------------------------- |
| <kbd>H</kbd>                               | 隐藏/显示文件             |                                                          |
| <kbd>a</kbd>                               | 新增文件                  | 在新增之前需要焦点在文件夹上,在后面加上`/`会增加为文件夹 |
| <kbd>leader</kbd><kbd>b</kbd><kbd>d</kbd>  | 关闭当前buffer            |                                                          |
| <kbd>leader</kbd><kbd>leader</kbd>         | 搜索文件                  | 支持模糊搜索                                             |
| <kbd> leader</kbd><kbd>f</kbd><kbd>f</kbd> | 查找文件（Telescope）     | 模糊搜索文件                                             |
| <kbd>leader</kbd><kbd>f</kbd><kbd>g</kbd>  | 全局文本搜索（Telescope） | 实时 grep 项目文件                                       |
| <kbd>leader</kbd><kbd>f</kbd><kbd>r</kbd>  | 查找最近文件（Telescope） |                                                          |
|                                            |                           |                                                          |

> [!tip]  
>
> 打开的文件被Vim称作是buffer
>
> 

## 焦点

| 命令                                                         | 作用                   | 备注               |
| ------------------------------------------------------------ | ---------------------- | ------------------ |
| <kbd>ctrl</kbd>+<kbd>h</kbd>(<kbd>j</kbd>、<kbd>k</kbd>、<kbd>l</kbd>) | 在不同的窗口间移动焦点 |                    |
| <kbd>H</kbd>或<kbd>L</kbd>                                   | 切换一打开的不同文件   | 需要焦点在代码区域 |
|                                                              |                        |                    |

## 代码

### 搜索

| 命令         | 作用         | 备注                                                         |
| ------------ | ------------ | ------------------------------------------------------------ |
| <kbd>f</kbd> | 进入搜索模式 | 输入你要搜索的内容，此时匹配的字母都会高亮显示，反白的高亮就是光标当前所在的位置。回车之后，按下<kbd>f</kbd>键可以向下搜寻，按下<kbd>F</kbd>向上搜索 |
| <kbd>s</kbd> | 进入搜索模式 | 输入你想要搜索的内容，此时匹配的字母会高亮显示，并且，每个匹配项都会随机分配一个红色标记的字母，只要按下这个字母就可以跳转到相应位置 |

### 缩进

| 命令                                             | 作用                     | 备注                                                   |
| ------------------------------------------------ | ------------------------ | ------------------------------------------------------ |
| <kbd>></kbd><kbd>></kbd>                         | 向右缩进Tab              | 需要在Normal模式下                                     |
| <kbd><</kbd><kbd><</kbd>                         | 向左缩进Tab              | 需要在Normal模式下                                     |
| <kbd>></kbd>                                     | 向右多行缩进Tab          | 需要在Visual模式下（<kbd>V</kbd>），选中需要缩进的文本 |
| <kbd><</kbd>                                     | 向左多行缩进Tab          | 需要在Visual模式下（<kbd>V</kbd>），选中需要缩进的文本 |
| <kbd>></kbd><kbd>a</kbd><kbd>p</kbd>             | 缩进整个段落             | （`a` 表示 `around`，`p` 表示 `paragraph`）            |
| <kbd>></kbd><kbd>i</kbd><kbd>{</kbd>             | 缩进当前 `{}` 块内的内容 |                                                        |
| <kbd>g</kbd><kbd>g</kbd><kbd>=</kbd><kbd>G</kbd> | 对整个文件自动缩进       | 基于 LSP 或缩进规则                                    |
| <kbd>=</kbd><kbd>a</kbd><kbd>p</kbd>             | 自动缩进当前段落         |                                                        |
| <kbd>Tab</kbd>                                   | 插入模式下按 `Tab` 缩进  | 受 `expandtab` 设置影响                                |
| <kbd>Shift</kbd><kbd>Tab</kbd>                   | 反向缩进                 | 部分终端支持                                           |

### 跳转

| 命令                                      | 作用                         | 备注                                                    |
| ----------------------------------------- | ---------------------------- | ------------------------------------------------------- |
| <kbd>[</kbd><kbd>e</kbd>                  | 跳转上一个错误位置           | 需要代码中存在错误                                      |
| <kbd>]</kbd><kbd>e</kbd>                  | 跳转到下一个错误位置         | 需要代码中存在错误                                      |
| <kbd>[</kbd><kbd>a</kbd>                  | 在函数的参数中，向左移动光标 |                                                         |
| <kbd>]</kbd><kbd>a</kbd>                  | 在函数的参数中，向右移动光标 | 光标以参数为单位移动                                    |
| <kbd>[</kbd><kbd>b</kbd> | 向左切换buffer |  |
| <kbd>]</kbd><kbd>b</kbd> | 向右切换buffer |  |
| <kbd>[</kbd><kbd>d</kbd>                  | 跳转到上一个诊断错误         | 需代码中存在错误（依赖 LSP 或 `null-ls`）               |
| <kbd>]</kbd><kbd>d</kbd>                  | 跳转到下一个诊断错误         |                                                         |
| <kbd>g</kbd><kbd>c</kbd><kbd>c</kbd>      | 注释代码                     |                                                         |
| <kbd>g</kbd><kbd>d</kbd>                  | 跳转到定义（LSP）            | 需要语言服务器支持（如 `lspconfig`）                    |
| <kbd>g</kbd><kbd>r</kbd>                  | 查找所有引用（LSP）          | 显示引用列表，支持跨文件                                |
| <kbd>K</kbd>                              | 悬停查看文档（LSP）          | 显示类型定义或文档说明                                  |
| <kbd>Ctrl</kbd><kbd>o</kbd>               | 跳转历史后退                 | 返回上一个位置                                          |
| <kbd>C</kbd><kbd>i</kbd>                  | 跳转历史前进                 |                                                         |
| <kbd>s</kbd>                              | 快速跳转（`leap.nvim`）      | 输入目标字符后自动标记，按对应键跳转                    |
| <kbd>leader</kbd><kbd>s</kbd><kbd>s</kbd> | 在当前文件中搜索符号         |                                                         |
| <kbd>leader</kbd><kbd>s</kbd><kbd>S</kbd> | 在当前工作空间中搜索符号     |                                                         |
| <kbd>:</kbd><kbd>number</kbd>             | 跳转到指定行                 |                                                         |
| <kbd>g</kbd><kbd>g</kbd>                  | 跳转到文件第一行             |                                                         |
| <kbd>G</kbd>                              | 跳转到文件最后一行           |                                                         |
| <kbd>m</kbd><kbd>a</kbd>                  | 设置标记                     | 将当前光标位置标记为 `a`（可用任意字母，如 `mb`、`mc`） |
| <kbd>\`</kbd><kbd>a</kbd>                        |跳转到标记|跳转到标记 `a` 的位置（反引号）|
| <kbd>Crtl</kbd><kbd>o</kbd>               | 返回跳转前位置               | 跳转到上一次光标位置（类似“返回”）                      |





## 命令导航

| 命令              | 作用   | 备注                                                         |
| ----------------- | ------ | ------------------------------------------------------------ |
| <kbd>leader</kbd> | 控制键 | 这里的控制键由用户自己设置，当我们按下单个按键的时候，在右下角会提示你下一步可以按的按键，并且在后面会有注释，如当按下后，在右下角会弹出一个窗口提示，假设你继续按照他的提示按<kbd>b</kbd>键，那么之后按下的按键就是<kbd>leader</kbd><kbd>b</kbd>，该功能是有`lazyvim`自带的插件`WhichKey` |
|                   |        |                                                              |
|                   |        |                                                              |

## 编辑

| 命令                                 | 作用                            | 备注                                                         |
| ------------------------------------ | ------------------------------- | ------------------------------------------------------------ |
| <kbd>h</kbd>                         | 左移                            |                                                              |
| <kbd>j</kbd>                         | 下移                            |                                                              |
| <kbd>k</kbd>                         | 上移                            |                                                              |
| <kbd>l</kbd>                         | 右移                            |                                                              |
| <kbd>w</kbd>                         | 移动到下一个单词的开头          |                                                              |
| <kbd>b</kbd>                         | 移动到前一个单词的开头          |                                                              |
| <kbd>0</kbd>                         | 移动到行首                      |                                                              |
| <kbd>$</kbd>                         | 移动到行尾                      |                                                              |
| <kbd>i</kbd>                         | 在光标前插入                    |                                                              |
| <kbd>a</kbd>                         | 在光标后插入                    |                                                              |
| <kbd>o</kbd>                         | 在当前行下方插入新行            |                                                              |
| <kbd>d</kbd><kbd>d</kbd>             | 删除当前行                      |                                                              |
| <kbd>d</kbd><kbd>$</kbd>             | 删除从光标到行尾的内容          |                                                              |
| <kbd>x</kbd>                         | 删除光标下的字符                |                                                              |
| <kbd>y</kbd><kbd>y</kbd>             | 复制当前行                      |                                                              |
| <kbd>p</kbd>                         | 粘贴                            |                                                              |
| <kbd>u</kbd>                         | 撤销                            |                                                              |
| <kbd>Ctrl</kbd> <kbd>r</kbd>         | 重做                            |                                                              |
| <kbd>v</kbd>                         | 进入 Visual 模式并选择字符      |                                                              |
| <kbd>V</kbd>                         | 进入 Visual 模式并选择行        |                                                              |
| <kbd>Ctrl</kbd> <kbd>v</kbd>         | 进入 Visual 模式并选择块        |                                                              |
| <kbd>y</kbd>                         | 复制选中的内容（Visual 模式下） |                                                              |
| <kbd>d</kbd>                         | 删除选中的内容（Visual 模式下） |                                                              |
| <kbd>p</kbd>                         | 粘贴选中的内容（Visual 模式下） |                                                              |
| <kbd>d</kbd><kbd>w</kbd>             | 删除单词                        | 命令会被当前光标限制，如你的光标在一个单词的中间，那么使用该命令只会删除后半段的单词 |
| <kbd>d</kbd><kbd>i</kbd><kbd>w</kbd> | 删除单词                        | 删除整个单词，无论光标在单词的哪个位置                       |
| <kbd>d</kbd><kbd>i</kbd><kbd>(</kbd> | 删除括号中的内容                |                                                              |
| <kbd>d</kbd><kbd>i</kbd><kbd>“</kbd> | 删除引号中的内容                |                                                              |
| <kbd>c</kbd><kbd>w</kbd>             | 删除单词并且插入                | 使用命令会删除当前单词并且插入，且也会受到光标的限制         |
| <kbd>c</kbd><kbd>i</kbd><kbd>w</kbd> | 删除单词并且插入                | 不受光标限制的删除整个单词并插入                             |
| <kbd>c</kbd><kbd>i</kbd><kbd>(</kbd> | 删除括号中的内容并插入          |                                                              |
| <kbd>c</kbd><kbd>i</kbd><kbd>“</kbd> | 删除引号中的内容并插入          |                                                              |
| <kbd>v</kbd><kbd>w</kbd>             | 选中单词                        | 选中当前单词，且也会受到光标的限制                           |
| <kbd>v</kbd><kbd>i</kbd><kbd>w</kbd> | 选中单词                        | 不受光标限制的选中整个单词                                   |
| <kbd>v</kbd><kbd>i</kbd><kbd>(</kbd> | 选中括号中的内容                |                                                              |
| <kbd>v</kbd><kbd>i</kbd><kbd>“</kbd> | 选中共引号中的内容              |                                                              |
|                                      |                                 |                                                              |
|                                      |                                 |                                                              |
|                                      |                                 |                                                              |
|                                      |                                 |                                                              |
|                                      |                                 |                                                              |
|                                      |                                 |                                                              |



# 问题解决

| 问题                     | 解决方案                                           | 参考网址                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| 出现乱码                 | 下载JetBrains Mono Font                            | [Nerd Fonts - Iconic font aggregator, glyphs/icons collection, & fonts patcher](https://www.nerdfonts.com/font-downloads) |
| 单独为nvim开一个terminal |                                                    | [Windows Terminal - Windows官方下载  微软应用商店  Microsoft Store](https://apps.microsoft.com/detail/9n0dx20hk701?hl=zh-cn&gl=HK) |
| 不能搜索文件             | 下载fd，然后将fd的exe放到环境变量中，需重启lazyvim | [Releases · sharkdp/fd (github.com)](https://github.com/sharkdp/fd/releases |
|                          |                                                    |                                                              |







































































































