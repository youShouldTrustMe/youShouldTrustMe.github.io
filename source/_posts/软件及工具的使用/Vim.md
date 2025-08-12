---
title: Vim

date: 2025-03-01
lastmod: 2025-03-01
tags:
- 软件及工具
---



# 启动 Vim

在终端中输入 `vim` 启动 Vim，或者输入 `vim filename` 打开特定文件。

```sh
vim
vim filename
```

#  基本模式

Vim 有三种主要模式：

- **Normal 模式**：默认模式，用于执行命令。
- **Insert 模式**：用于编辑文本。
- **Visual 模式**：用于选择文本。

切换模式

- **Normal 模式**：启动 Vim 后默认进入 Normal 模式。按 `Esc` 可以从其他模式切换到 Normal 模式。
- **Insert 模式**：在 Normal 模式下，按 `i` 进入 Insert 模式，按 `Esc` 退出到 Normal 模式。
- **Visual 模式**：在 Normal 模式下，按 `v` 进入 Visual 模式，按 `Esc` 退出到 Normal 模式。

# 常用命令

## Normal 模式命令

- **移动光标**：
  - `h`：左移
  - `j`：下移
  - `k`：上移
  - `l`：右移
  - `w`：移动到下一个单词的开头
  - `b`：移动到前一个单词的开头
  - `0`：移动到行首
  - `$`：移动到行尾

- **编辑文本**：
  - `i`：在光标前插入
  - `a`：在光标后插入
  - `o`：在当前行下方插入新行
  - `dd`：删除当前行
  - `d$`：删除从光标到行尾的内容
  - `x`：删除光标下的字符
  - `yy`：复制当前行
  - `p`：粘贴
  - `u`：撤销
  - `Ctrl + r`：重做

- **保存和退出**：
  - `:w`：保存文件
  - `:q`：退出 Vim
  - `:wq` 或 `ZZ`：保存并退出
  - `:q!`：不保存退出

## Insert 模式命令

- 在 Insert 模式下，你可以像普通文本编辑器一样输入文本。
- 使用 `Esc` 返回到 Normal 模式。

## Visual 模式命令

- `v`：进入 Visual 模式并选择字符
- `V`：进入 Visual 模式并选择行
- `Ctrl + v`：进入 Visual 模式并选择块
- 在 Visual 模式下，你可以使用 `y` 复制，`d` 删除，`p` 粘贴选中的内容。

## 键位图

![VIM键位图](https://i-blog.csdnimg.cn/blog_migrate/9d1351469929da16936b11c946ecd2c4.jpeg)

# 搜索和替换

- **搜索**：
  - `/pattern`：向下搜索 `pattern`
  - `?pattern`：向上搜索 `pattern`
  - `n`：跳到下一个匹配
  - `N`：跳到上一个匹配

- **替换**：
  - `:%s/old/new/g`：全局替换所有 `old` 为 `new`
  - `:s/old/new/g`：替换当前行所有 `old` 为 `new`
  - `:s/old/new/gc`：替换当前行所有 `old` 为 `new`，并确认每次替换

# 配置 Vim

你可以通过编辑 `~/.vimrc` 文件来配置 Vim。例如：

```vim
syntax on              " 启用语法高亮
set number             " 显示行号
set tabstop=4          " 设置 Tab 长度为 4
set shiftwidth=4       " 设置自动缩进为 4
set expandtab          " 将 Tab 转换为空格
```

# 插件管理

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

# NeoVim

## 安装基础插件

首先在[Home - Neovim](https://neovim.io/)页面下载NeoVim软件，安装完成之后，强烈建议安装`lazyvim`包管理器，用`lazyvim`包管理器可以更快更方便的安装插件。

安装步骤可见[🛠️ Installation | LazyVim](https://www.lazyvim.org/installation)。git完之后，所有的文件在`~\AppData\Local\nvim`文件夹下，该文件夹下有以下重要文件：

- `init.lua`：在顶层文件夹中，定义了依赖文件
- `options.lua`：在`lua/config`文件夹下，用于做vim的配置
- `keymap.lua`：在`lua/config`文件夹下，用于按键映射

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

## 插件管理

​	前面说过插件的配置管理会放到`plugins`文件夹下，新增一个插件就需要新建一个`lua`的配置文件，且配置文件名没有要求。

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

## 使用技巧

在`Lazyvim`中自带了很多的插件，如`lua-line`就是`layzvim`自带的插件，这些自带的插件及自己安装的插件提供了很多实用的技巧：

---

开关终端：

1. 使用<kbd>ctrl</kbd><kbd>/</kbd>打开（关闭）终端运行界面

---

文件相关（在文件视图下）：

1. 使用<kbd>H</kbd>来隐藏或显示隐藏文件

2. 焦点在文件夹上，按下<kbd>a</kbd>可以新增文件，在后面加上`/`会增加为文件夹

3. 关闭当前文件可以使用<kbd>leader</kbd><kbd>b</kbd><kbd>d</kbd>

   > [!tip]
   >
   > 打开的文件被Vim称作是buffer

---

焦点移动：

1. 使用<kbd>ctrl</kbd>+<kbd>h</kbd>(<kbd>j</kbd>、<kbd>k</kbd>、<kbd>l</kbd>)在不同的视图中移动
2. 在代码视图，可以按下<kbd>H</kbd>或<kbd>L</kbd>来切换已打开的不同文件

---

代码跳转：

1. 先按下<kbd>f</kbd>键，然后输入你要搜索的内容，此时匹配的字母都会高亮显示，反白的高亮就是光标当前所在的位置。回车之后，按下<kbd>f</kbd>键可以向下搜寻，按下<kbd>F</kbd>向上搜索
2. 先按下<kbd>s</kbd>键，然后输入你想要搜索的内容，此时匹配的字母会高亮显示，并且，每个匹配项都会随机分配一个红色标记的字母，只要按下这个字母就可以跳转到相应位置
3. 如果在代码中存在报错，那么可以按下<kbd>[</kbd><kbd>e</kbd>跳转上一个错误位置，按下<kbd>]</kbd><kbd>e</kbd>跳转到下一个错误位置
4. 使用<kbd>[</kbd>或<kbd>]</kbd>+<kbd>a</kbd>可以在函数的参数上左右跳转

---

命令导航：

1. 当我们按下单个按键的时候，在右下角会提示你下一步可以按的按键，并且在后面会有注释，如当按下<kbd>leader</kbd>后，在右下角会弹出一个窗口提示，假设你继续按照他的提示按<kbd>b</kbd>键，那么之后按下的按键就是<kbd>leader</kbd><kbd>b</kbd>
2. 该功能是有`lazyvim`自带的插件`WhichKey`

---

编辑文件：

1. <kbd>d</kbd><kbd>w</kbd>命令会被当前光标限制，如你的光标在一个单词的中间，那么<kbd>d</kbd><kbd>w</kbd>只会删除后半段的单词，使用<kbd>d</kbd><kbd>i</kbd><kbd>w</kbd>会删除整个单词
2. 使用<kbd>c</kbd><kbd>w</kbd>命令会删除当前单词并且插入，且也会受到光标的限制，所以可以使用使用<kbd>c</kbd><kbd>i</kbd><kbd>w</kbd>不受光标限制的删除整个单词并插入
3. 使用<kbd>v</kbd><kbd>w</kbd>命令会选中当前单词，且也会受到光标的限制，所以可以使用使用<kbd>v</kbd><kbd>i</kbd><kbd>w</kbd>不受光标限制的选中整个单词
4. 类比的，使用<kbd>c</kbd><kbd>i</kbd>、<kbd>d</kbd><kbd>i</kbd>、<kbd>v</kbd><kbd>i</kbd>，我们可以将<kbd>w</kbd>切换为<kbd>(</kbd>、<kbd>“</kbd>来修改、删除、选中括号中或引号中的内容，只要是成对出现的符号都可以使用这种命令

---

注释代码：

1. 使用<kbd>g</kbd><kbd>c</kbd><kbd>c</kbd>注释单行代码

---

退出vim：

1. 使用<kbd>q</kbd><kbd>a</kbd>来退出整个`nvim`







































































































