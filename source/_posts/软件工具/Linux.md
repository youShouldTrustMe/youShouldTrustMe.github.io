---
title: Linux

categories: 
  - 软件及工具
---



# 安装

首先从[下载Ubuntu桌面系统 | Ubuntu](https://cn.ubuntu.com/download/desktop)上下载镜像文件，下载完成之后，下载启动盘制作工具的软件，使用[Rufus - 轻松创建 USB 启动盘](https://rufus.ie/zh/)或者[UltraISO软碟通中文官方网站 - 光盘映像文件制作/编辑/转换工具](https://ultraiso.net/)。准备一个8G以上的U盘，==注意，U盘一定要先格式化，文件系统格式为FAT32==。

制作启动盘请参考[UltralSO 软碟通制作U盘启动盘（图解详细 完美避坑）_软碟通怎么制作u盘启动盘-CSDN博客](https://blog.csdn.net/qq_43901693/article/details/95535051)或[Windows10怎么使用Rufus制作USB启动盘？ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/370193387)

制作好启动盘之后，重启电脑的时候，等待出现电脑的Logo的时候，按住进入BISO的按键（华硕是F2），拖动启动顺序（Boot）

https://cn.linux-terminal.com/?p=7582

# 基础工具

## apt

`apt`是包管理工具,常用命令如下：

`apt` 常用的命令有：

- **更新本地包列表：**

  ```bash
  sudo apt update
  ```

- **升级所有已安装的软件包：**

  ```bash
  sudo apt upgrade
  ```

- **安装新的软件包：**

  ```bash
  sudo apt install <package_name>
  ```

- **删除已安装的软件包：**

  ```bash
  sudo apt remove <package_name>
  ```

- **完全删除软件包（包括配置文件）：**

  ```bash
  sudo apt purge <package_name>
  ```

- **清理系统不再需要的包：**

  ```bash
  sudo apt autoremove
  ```

- **显示有关包的信息：**

  ```bash
  apt show <package_name>
  ```
## zsh

参考链接

[Zsh 安装与配置，使用 Oh-My-Zsh 美化终端 | Leehow的小站 (haoyep.com)](https://www.haoyep.com/posts/zsh-config-oh-my-zsh/)

安装及使用zsh

```bash
sudo apt install git
sudo apt install zsh
wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | sh
chsh -s /usr/bin/zsh
```

这里的`chsh`命令是将shell设置为zsh，如果想要换回bash，首先要查看有哪些shell

```bash
cat   /etc/shells
```

换回去只需要再使用`chsh`即可

```bash
chsh  -s  /bin/bash 
```

安装主题

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

安装字体

```bash
sudo apt-get install fonts-powerline
```

更新源

```bash
source ~/.zshrc
```

之后按下<kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>r</kbd>更新

## i3wm

###  参考链接

[桌面应用|i3 窗口管理器终极定制指南 (linux.cn)](https://linux.cn/article-15955-1.html)



### 默认的快捷键

| 按键绑定              | 描述                           |
| --------------------- | ------------------------------ |
| `Mod + Enter`         | 打开终端。                     |
| `Mod + ←`             | 切换到左侧窗口。               |
| `Mod + →`             | 切换到右侧窗口。               |
| `Mod + ↑`             | 切换到上方窗口。               |
| `Mod + ↓`             | 切换到下方窗口。               |
| `Mod + Shift + ←`     | 将窗口移动到左侧。             |
| `Mod + Shift + →`     | 将窗口移动到右侧。             |
| `Mod + Shift + ↑`     | 将窗口移动到上方。             |
| `Mod + Shift + ↓`     | 将窗口移动到下方。             |
| `Mod + f`             | 将焦点窗口切换到全屏模式。     |
| `Mod + v`             | 下一个窗口将垂直放置。         |
| `Mod + h`             | 下一个窗口将水平放置。         |
| `Mod + s`             | 启用堆叠式窗口布局。           |
| `Mod + w`             | 启用选项卡式窗口布局。         |
| `Mod + Shift + Space` | 启用浮动窗口（针对焦点窗口）。 |
| `Mod + 鼠标左键单击`  | 使用鼠标拖动整个窗口。         |
| `Mod + 0-9`           | 切换到另一个工作区。           |
| `Mod + Shift + 0-9`   | 将窗口移动到另一个工作区。     |
| `Mod + d`             | 打开应用程序启动器（D 菜单）。 |
| `Mod + Shift + q`     | 关闭焦点窗口。                 |
| `Mod + Shift + c`     | 重新加载 i3 配置文件。         |
| `Mod + Shift + r`     | 重启 i3 窗口管理器。           |
| `Mod + Shift + e`     | 退出 i3 窗口管理器。           |

### 定制i3wm

安装壁纸插件

```bash
sudo apt install feh
```

打开i3wm配置文件

```bash
vim ~/.config/i3/config
```

在config文件后面添加以下命令设置壁纸

```bash
exec_always feh --bg-fill /path/to/wallpaper
```

##  小工具

| 操作                                   | 工具名称            | 网址                                                         |
| -------------------------------------- | ------------------- | ------------------------------------------------------------ |
| 代替man的工具                          | Npm install -g Tldr | [GitHub   - tldr-pages/tldr: 📚 Collaborative cheatsheets for console commands](https://github.com/tldr-pages/tldr) |
| 安装tldr需要先安装                     | nodejs、npm         | 这里可能需要重启虚拟机才能生效                               |
| 对脚本文件进行错误提示                 | shellcheck          |                                                              |
| 可以最大化利用terminal                 | Tmux                |                                                              |
| 编辑器之神                             | Vim                 |                                                              |
| 代替find                               | fd                  | [GitHub - sharkdp/fd: A simple, fast and   user-friendly alternative to 'find'](https://github.com/sharkdp/fd) |
| 代替grep                               | rg                  | [github.com](https://github.com/BurntSushi/ripgrep)          |
| 文件夹工具，可以对文件夹的切换进行优化 | fasd                | [GitHub - clvv/fasd: Command-line   productivity booster, offers quick access to files and directories, inspired   by autojump, z and v.](https://github.com/clvv/fasd) |
| 模糊文件查找                           | Ctrlp               |                                                              |
| 文件浏览器                             | nerdtree            | [GitHub   - preservim/nerdtree: A tree explorer plugin for vim.](https://github.com/preservim/nerdtree#frequently-asked-questions) |
| 代码联想                               | Youcompleteme       | [YouCompleteMe   安装配置方法 - 简书 (jianshu.com)](https://www.jianshu.com/p/4cbdadab3ad0) |
| 文件层级                               |                     | [Yggdroot/indentLine: A vim   plugin to display the indention levels with thin vertical lines (github.com)](https://github.com/Yggdroot/indentLine) |
| 图床工具                               | PicList             | https://github.com/Kuingsmile/PicList                        |
| onedrive                               |                     | https://blog.csdn.net/qq_15674631/article/details/137602288  |
| 美化                                   |                     | https://blog.csdn.net/qq_15674631/article/details/130512285  |
