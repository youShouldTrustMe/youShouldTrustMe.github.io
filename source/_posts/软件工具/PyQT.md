---
title: PyQT

categories: 
  - 软件及工具
---



# 参考链接

[Python 小白从零开始 PyQt5 项目实战（8）汇总篇（完整例程）_pyqt项目实战教程-CSDN博客](https://blog.csdn.net/youcans/article/details/120925109)

[免费学习编程 - Python、JavaScript、Java、Git 等 (freecodecamp.org)](https://www.freecodecamp.org/chinese/learn)

[白月黑羽 (byhy.net)](https://www.byhy.net/)

# UI

## fluent-widgets

参考链接：[快速上手 - PyQt-Fluent-Widgets](https://pyqt-fluent-widgets.readthedocs.io/zh-cn/latest/quick-start.html)

## silicon 

参考链接：[ChinaIceF/PyQt-SiliconUI: A powerful and artistic UI library based on PyQt5，基于 PyQt5 的UI框架，灵动、优雅而轻便 (github.com)](https://github.com/ChinaIceF/PyQt-SiliconUI)

# 安装

*`安装`python*

从官网下载：[Welcome to Python.org](https://www.python.org/)

*`IDE`的选择*

- ==VSCODE==（❤❤❤）：[Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/)
- ==Cursor==(AI级选手，面向自然语言编程，amazing❗❗❗)：[Cursor](https://www.cursor.com/)
- ==Pycharm==（python专用工具）：[PyCharm: the Python IDE for data science and web development (jetbrains.com)](https://www.jetbrains.com/pycharm/)

*`python包管理工具`PIP*

`pip` 是 Python 包管理工具，用于安装和管理 Python 库和依赖。通过 `pip`，你可以方便地从 Python Package Index (PyPI) 下载和安装第三方库，并自动解决依赖问题。

常见的 `pip` 使用命令：
1. **安装包**：`pip install 包名`
2. **卸载包**：`pip uninstall 包名`
3. **查看已安装的包**：`pip list`
4. **升级包**：`pip install --upgrade 包名`
5. **查看包信息**：`pip show 包名`

例如，安装 NumPy 库的命令是：
```bash
pip install numpy
```

*`安装`Pyqt5（Pyside6）*

使用PIP来安装pyqt

```bash
pip install pyqt5 -i https://mirrors.aliuyun.com/pypi/simple
```

或者安装`pyside2`

```
pip install pyside6
```

> [!tip]
>
> 建议先不换源下载试试，如果不可以在使用-i参数换源，国内源可以选择
>
> ```bash
> #清华源
> pip install markdown -i https://pypi.tuna.tsinghua.edu.cn/simple
> # 阿里源
> pip install markdown -i https://mirrors.aliyun.com/pypi/simple/
> # 腾讯源
> pip install markdown -i http://mirrors.cloud.tencent.com/pypi/simple
> # 豆瓣源
> pip install markdown -i http://pypi.douban.com/simple/
> ```
>
> 

*`安装`QtTool*

Qt Tools 包含：

- 图形界面设计工具 Qt Designer，用于设计图形界面，生成 .ui文件，以 xml 格式存储界面和控件的属性；
- UI 文件转换工具 PyUic，用于将 .ui 文件解析为 .py 文件的工具。

```bash
pip install pyqt5-tools  -i https://mirrors.aliuyun.com/pypi/simple
```

> [!TIP]
>
> 注意：这里使用的是python版本需要低于3.10，如果高于3.10，那么请分步安装软件：
>
> ```bash
> pip install PyQt5Designer
> ```

# 基础

> 假设我们现在我们要开发一个程序，让用户输入一段文本包含：员工姓名、薪资、年龄。
>
> 格式如下：
>
> ```plaintext
> 薛蟠     4560 25
> 薛蝌     4460 25
> 薛宝钗   35776 23
> 薛宝琴   14346 18
> 王夫人   43360 45
> 王熙凤   24460 25
> 王子腾   55660 45
> 王仁     15034 65
> 尤二姐   5324 24
> 贾芹     5663 25
> 贾兰     13443 35
> 贾芸     4522 25
> 尤三姐   5905 22
> 贾珍     54603 35
> ```
>
> 该程序可以把薪资在 2万 以上、以下的人员名单分别打印出来。当然我们可以像以前一样，开发命令行程序（准确的说应该叫字符终端程序，因为UI是字符终端），让用户在字符终端输入。但是如果我们能开发下面这样的图形界面程序，就更酷了
>
> ![目标](https://www.byhy.net/cdn2/imgs/gh/36257654_69149498-99bef680-0b11-11ea-8c0d-20ed8f08846e.png)

## 最小代码

那么我们可以使用以下代码来实现这个界面：

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton,  QPlainTextEdit

app = QApplication()

window = QMainWindow()
window.resize(500, 400)
window.move(300, 310)
window.setWindowTitle('薪资统计')

textEdit = QPlainTextEdit(window)
textEdit.setPlaceholderText("请输入薪资表")
textEdit.move(10,25)
textEdit.resize(300,350)

button = QPushButton('统计', window)
button.move(380,80)

window.show()

app.exec() # PySide6 是 exec 而不是 exec_
```

接下来会逐步分析每行代码的作用：

1. `QApplication` 提供了整个图形界面程序的底层管理功能，比如：初始化、程序入口参数的处理，用户事件（对界面的点击、输入、拖拽）分发给各个对应的控件，等等...对 QApplication 细节比较感兴趣的话，可以[点击这里参考官方网站](https://doc.qt.io/qt-6/qapplication.html#details)，既然QApplication要做如此重要的初始化操作，所以，我们必须在任何界面控件对象创建前，先创建它。

2. QMainWindow、QPlainTextEdit、QPushButton 是3个控件类，分别对应界面的主窗口、文本框、按钮。他们都是控件基类对象QWidget的子类。要在界面上 `创建一个控件` ，就需要在程序代码中 `创建` 这个 `控件对应类` 的一个 `实例对象`。在 Qt 系统中，控件（widget）是 `层层嵌套` 的，除了最顶层的控件，其他的控件都有父控件。QPlainTextEdit、QPushButton 实例化时，都有一个参数window，如下

   ```python
   QPlainTextEdit(window)
   QPushButton('统计', window)
   ```

   就是指定它的父控件对象 是 window 对应的QMainWindow 主窗口。而实例化 QMainWindow 主窗口时，却没有指定父控件， 因为它就是最上层的控件了。

3. 控件对象的 move 方法决定了这个控件显示的位置，比如：

   `window.move(300, 310)` 就决定了 主窗口的 左上角坐标在 `相对屏幕的左上角` 的X横坐标300像素, Y纵坐标310像素这个位置。

   `textEdit.move(10,25)` 就决定了文本框的 左上角坐标在 `相对父窗口的左上角` 的X横坐标10像素, Y纵坐标25像素这个位置。

   控件对象的 resize 方法决定了这个控件显示的大小，比如：

   `window.resize(500, 400)` 就决定了 主窗口的 宽度为500像素，高度为400像素。

   `textEdit.resize(300,350)` 就决定了文本框的 宽度为300像素，高度为350像素。

4. 放在主窗口的控件，要能全部显示在界面上， 必须加上下面这行代码

   ```
   window.show()
   ```

5. 最后 ，通过下面这行代码

   ```python
   app.exec() # 这是pyside6的代码； pyside2 是 app.exec_()
   ```

   进入QApplication的事件处理循环，接收用户的输入事件（），并且分配给相应的对象去处理。

## 界面动作处理 (signal 和 slot)

> 接下来，我们要实现具体的统计功能：当用户点击 **统计** 按钮时， 从界面控件 QPlainTextEdit 里面获取 用户输入的字符串内容，进行处理。

首先第一个问题： 用户点击了 **统计** 按钮，怎么通知程序？ 因为只有程序被通知了这个点击，才能做出相应的处理。

在 Qt 系统中， 当界面上一个控件被操作时，比如 被点击、被输入文本、被鼠标拖拽等， 就会发出 `信号` ，英文叫 `signal` 。就是表明一个事件（比如被点击、被输入文本）发生了。

我们可以预先在代码中指定 处理这个 signal 的函数，这个处理 signal 的函数 叫做 `slot` 。

比如，我们可以像下面这样定义一个函数

```python
def handleCalc():
    print('统计按钮被点击了')
```

然后， 指定 如果 发生了button 按钮被点击 的事情，需要让 `handleCalc` 来处理，像这样

```python
button.clicked.connect(handleCalc)
```

用QT的术语来解释上面这行代码，就是：把 button 被 点击（clicked） 的信号（signal）， 连接（connect）到了 handleCalc 这样的一个 slot上

大白话就是：让 handleCalc 来 处理 button 被 点击的操作。

但是上面这行代码运行后，只能在字符窗口 打印出 `统计按钮被点击了` ， 还不能处理分析任务。

要处理分析任务，我们还得从 textEdit 对应的 文本框中 获取用户输入的文本，并且分析薪资范围，最终弹出对话框显示统计结果。

我们修改后，代码如下

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton,  QPlainTextEdit,QMessageBox

def handleCalc():
    info = textEdit.toPlainText()

    # 薪资20000 以上 和 以下 的人员名单
    salary_above_20k = ''
    salary_below_20k = ''
    for line in info.splitlines():
        if not line.strip():
            continue
        parts = line.split(' ')
        # 去掉列表中的空字符串内容
        parts = [p for p in parts if p]
        name,salary,age = parts
        if int(salary) >= 20000:
            salary_above_20k += name + '\n'
        else:
            salary_below_20k += name + '\n'

    QMessageBox.about(window,
                '统计结果',
                f'''薪资20000 以上的有：\n{salary_above_20k}
                \n薪资20000 以下的有：\n{salary_below_20k}'''
                )

app = QApplication()

window = QMainWindow()
window.resize(500, 400)
window.move(300, 300)
window.setWindowTitle('薪资统计')

textEdit = QPlainTextEdit(window)
textEdit.setPlaceholderText("请输入薪资表")
textEdit.move(10,25)
textEdit.resize(300,350)

button = QPushButton('统计', window)
button.move(380,80)
button.clicked.connect(handleCalc)

window.show()

app.exec()
```

运行后，你会发现结果如下

![image](https://www.byhy.net/cdn2/imgs/gh/36257654_69224199-1526b380-0bb7-11ea-99a2-c2bf15f9dd83.png)

## 封装到类

上面的代码把控件对应的变量名全部作为全局变量。

如果要设计稍微复杂一些的程序，就会出现太多的控件对应的变量名。

而且这样也不利于 代码的模块化。

所以，我们通常应该把 一个窗口和其包含的控件，对应的代码 全部封装到类中，如下所示

[PySide6 代码](https://www.byhy.net/py/qt/qt_02/#__tabbed_3_1)[PySide2 代码](https://www.byhy.net/py/qt/qt_02/#__tabbed_3_2)

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton,  QPlainTextEdit,QMessageBox

class Stats:
    def __init__(self):
        self.window = QMainWindow()
        self.window.resize(500, 400)
        self.window.move(300, 300)
        self.window.setWindowTitle('薪资统计')

        self.textEdit = QPlainTextEdit(self.window)
        self.textEdit.setPlaceholderText("请输入薪资表")
        self.textEdit.move(10, 25)
        self.textEdit.resize(300, 350)

        self.button = QPushButton('统计', self.window)
        self.button.move(380, 80)

        self.button.clicked.connect(self.handleCalc)


    def handleCalc(self):
        info = self.textEdit.toPlainText()

        # 薪资20000 以上 和 以下 的人员名单
        salary_above_20k = ''
        salary_below_20k = ''
        for line in info.splitlines():
            if not line.strip():
                continue
            parts = line.split(' ')
            # 去掉列表中的空字符串内容
            parts = [p for p in parts if p]
            name,salary,age = parts
            if int(salary) >= 20000:
                salary_above_20k += name + '\n'
            else:
                salary_below_20k += name + '\n'

        QMessageBox.about(self.window,
                    '统计结果',
                    f'''薪资20000 以上的有：\n{salary_above_20k}
                    \n薪资20000 以下的有：\n{salary_below_20k}'''
                    )

app = QApplication()
stats = Stats()
stats.window.show()
app.exec()
```

# 布局



QT程序界面的 一个个窗口、控件，就是像上面那样用相应的代码创建出来的。但是，把你的脑海里的界面，用代码直接写出来，是有些困难的。

很多时候，运行时呈现的样子，不是我们要的。我们经常还要修改代码调整界面上控件的位置，再运行预览。反复多次这样操作。可是这样，真的...太麻烦了。

其实，我们可以用QT界面生成器 `Qt Designer` ，拖拖拽拽就可以直观的创建出程序大体的界面。

Windows下，运行 Python安装目录下 `Scripts\pyside6-designer.exe` 这个可执行文件

如果你安装的是pyqt5， 运行 Python安装目录下 `Scripts\pyqt5designer.exe` 这个可执行文件

> [!tip]
>
> 通过 Qt Designer 设计的界面，最终是保存在一个ui文件中的。可以打开这个ui文件看看，就是一个XML格式的界面定义。



## 动态加载UI文件

有了界面定义文件，我们的Python程序就可以从文件中加载UI定义，并且动态 创建一个相应的窗口对象。

```python
from PySide6.QtWidgets import QApplication, QMessageBox
from PySide6.QtUiTools import QUiLoader

class Stats:
    def __init__(self):
        # 从文件中加载UI定义

        # 从 UI 定义中动态 创建一个相应的窗口对象
        # 注意：里面的控件对象也成为窗口对象的属性了
        # 比如 self.ui.button , self.ui.textEdit
        self.ui = QUiLoader().load("main.ui")

        self.ui.button.clicked.connect(self.handleCalc)

    def handleCalc(self):
        info = self.ui.textEdit.toPlainText()

        salary_above_20k = ''
        salary_below_20k = ''
        for line in info.splitlines():
            if not line.strip():
                continue
            parts = line.split(' ')

            parts = [p for p in parts if p]
            name,salary,age = parts
            if int(salary) >= 20000:
                salary_above_20k += name + '\n'
            else:
                salary_below_20k += name + '\n'

        QMessageBox.about(self.ui,
                    '统计结果',
                    f'''薪资20000 以上的有：\n{salary_above_20k}
                    \n薪资20000 以下的有：\n{salary_below_20k}'''
                    )

app = QApplication()
stats = Stats()
stats.ui.show()
app.exec()
```

如果你使用的是 `PyQt` ， 比如 `PyQt6` ，加载UI文件的代码如下

```python
from PyQt6 import uic

class Stats:
    def __init__(self):
        # 从文件中加载UI定义
        self.ui = uic.loadUi("main.ui")
```

> [!note]
>
> 注意，运行的时候请注意路径，以上代码是基于运行路径来说的，并不是相对于`py`文件

## 转化UI文件

还有一种使用UI文件的方式：先把UI文件直接转化为包含界面定义的Python代码文件，然后在你的程序中使用定义界面的类。

执行如下的命令 把UI文件直接转化为包含界面定义的Python代码文件

```python
# 如果你用的是 PySide2
pyside2-uic main.ui > ui_main.py

# 如果你用的是 PySide6
pyside6-uic main.ui > ui_main.py
```

如果你安装的是 PyQt5 或者 PyQt6，执行如下格式的命令转化

```python
# 如果你用的是 PyQt5
pyuic5 main.ui > ui_main.py

# 如果你用的是 PyQt6
pyuic6 main.ui > ui_main.py
```

然后在你的代码文件中这样使用定义界面的类

```python
from PySide6.QtWidgets import QApplication,QMainWindow
from ui_main import Ui_MainWindow

# 注意 这里选择的父类 要和你UI文件窗体一样的类型
# 主窗口是 QMainWindow， 表单是 QWidget， 对话框是 QDialog
class MainWindow(QMainWindow):

    def __init__(self):
        super().__init__()
        # 使用ui文件导入定义界面类
        self.ui = Ui_MainWindow()
        # 初始化界面
        self.ui.setupUi(self)

        # 使用界面定义的控件，也是从ui里面访问
        self.ui.webview.load('http://www.baidu.com')

app = QApplication([])
mainw = MainWindow()
mainw.show()
app.exec()
```

> [!tip]
>
> 那么我们该使用哪种方式比较好呢？动态加载还是转化为Python代码？
>
> 建议是：通常采用动态加载比较方便，因为改动界面后，不需要转化，直接运行，特别方便。
>
> 但是，如果 你的程序里面有非qt designer提供的控件， 这时候，需要在代码里面加上一些额外的声明，而且 可能还会有奇怪的问题。往往就 要采用 转化Python代码的方法。

## Layout



我们前面写的界面程序有个问题，如果你用鼠标拖拽主窗口边框右下角，进行缩放，就会发现里面的控件一直保持原有大小不变。这样会很难看。

我们通常希望，随着主窗口的缩放， 界面里面的控件、控件之间的距离也相应的进行缩放。Qt是通过界面布局Layout类来实现这种功能的。

我们最常用的 Layout布局 有4种，分别是：

1. QHBoxLayout 水平布局：QHBoxLayout 把控件从左到右 水平横着摆放，如下所示：

   ![水平布局](https://doc.qt.io/qt-5/images/qhboxlayout-with-5-children.png)

2. QVBoxLayout 垂直布局：QHBoxLayout 把控件从上到下竖着摆放，如下所示：

   ![垂直布局](https://doc.qt.io/qt-5/images/qvboxlayout-with-5-children.png)

3. QGridLayout 表格布局：QGridLayout 把多个控件 格子状摆放，有的控件可以 占据多个格子，如下所示：

   ![网格布局](https://doc.qt.io/qt-5/images/qgridlayout-with-5-children.png)

4. QFormLayout 表单布局：QFormLayout 表单就像一个只有两列的表格，非常适合填写注册表单这种类型的界面，如下所示

   ![表单布局](https://doc.qt.io/qt-5/images/qformlayout-with-6-children.png)



### MainWindow 的Layout

如果我们选择的主窗口是MainWindow类型，要给MainWindow整体设定Layout，必须 `先添加一个控件到 centralwidget 下面` ，如下

![main窗口的layout](https://www.byhy.net/cdn2/imgs/api/tut_20200415101630_85.png)

然后才能右键点击 MainWindow，选择布局，如下

![调整main的布局](https://www.byhy.net/cdn2/imgs/api/tut_20200415102007_21.png)

## 调整控件位置和大小

### 调整layout中控件的大小比例

可以通过设定控件的sizePolicy来调整

### 调整控件间距

要调整控件上下间距，可以给控件添加layout，然后通过设定layout的上下的padding 和 margin 来调整间距，具体操作请看视频讲解。

要调整控件的左右间距，可以通过添加 horizontal spacer 进行控制，也可以通过layout的左右margin

## Qt Designer界面布局建议

使用 `Qt Designer` 对界面控件进行布局，请按照如下步骤操作

- 先不使用任何Layout，把所有控件 按位置 摆放在界面上
- 然后先从 最内层开始 进行控件的 Layout 设定
- 逐步拓展到外层 进行控件的 Layout设定
- 最后调整 layout中控件的大小比例， 优先使用 Layout的 layoutStrentch 属性来控制

# 常用控件

## 按钮

`QPushButton` 就是常见的按钮，更加详细的使用请去[官网介绍](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QPushButton.html)查看

### 被点击

当按钮被点击就会发出 `clicked` 信号，可以这样指定处理该信号的函数

```python
button.clicked.connect(handleCalc)
```

### 改变文本

代码中可以使用 `setText` 方法来改变按钮文本，比如

```python
button.setText(text)
```

### 禁用、启用

所有控件（继承自QWidget类）都支持 禁用和启用方法。禁用后，该控件不再处理用户操作

- 禁用

  ```python
  button.setEnabled(False)
  ```

- 启用

  ```python
  button.setEnabled(True)
  ```

### 设置图标

可以通过如下方法给按钮设置图标

```python
from PySide6.QtCore import Qt,QSize
from PySide6.QtGui import QIcon

# 设置图标
button.setIcon(QIcon('logo.png'))

# 设置图标大小
button.setIconSize(QSize(30, 30))
```

## 单行文本框

`QLineEdit` 是只能单行编辑的文本框。更为详细的使用方法请见[官网介绍](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QLineEdit.html)

### 文本被修改

对于文本的监控有以下几种信号

1. [textChanged](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QLineEdit.html#PySide6.QtWidgets.QLineEdit.textChanged) ：当文本框中的内容被键盘编辑，或者程序改变文本框的内容， 就会发出该信号。Qt在调用这个信号处理函数时，传入的参数就是文本框目前的内容字符串。
2. [textEdited](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QLineEdit.html#PySide6.QtWidgets.QLineEdit.textEdited)：这个信号是和 `textChanged` 类似， 但是如果是程序改变了文本框内容， 不会触发。 适用于 手工修改后触发一段代码 的场景。
3. [editingFinished](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QLineEdit.html#PySide6.QtWidgets.QLineEdit.editingFinished)：
4. 这个信号是：当文本内容有改变， 并且 按下回车键 或者 编辑框失去输入焦点 时 触发。适用于当内容被用户手动修改后， 希望执行一段代码的场景。

可以这样指定处理该信号的函数

```python
edit.textChanged.connect(handleTextChange)
```

### 按下回车键

当用户在文本框中任何时候按下回车键，就会发出 `returnPressed` 信号。有时我们需要处理这种情况，比如登录界面，用户输完密码直接按回车键就进行登录处理，比再用鼠标点击登录按钮快捷的多。可以指定处理 returnPressed 信号，如下所示

```python
passwordEdit.returnPressed.connect(onLogin)
```

### 获取文本

通过 `text` 方法获取编辑框内的文本内容，比如

```python
text = edit.text()
```

### 设置提示

通过 `setPlaceholderText` 方法可以设置提示文本内容，比如

```python
edit.setPlaceholderText('请在这里输入URL')
```

### 设置文本

通过 `setText` 方法设置编辑框内的文本内容为参数里面的文本字符串，比如

```python
edit.setText('你好，白月黑羽')
```

> [!note]
>
> 注意：原来的所有内容会被清除

### 清除所有文本

`clear` 方法可以清除编辑框内所有的文本内容，比如

```python
edit.clear()
```

### 只允许输入数字

```python
from PySide6 import QtGui

# 只允许输入数字
edit.setValidator(QtGui.QIntValidator()) 
```

### 拷贝文本到剪贴板

`copy` 方法可以拷贝当前选中文本到剪贴板，比如

```python
edit.copy()
```

### 粘贴剪贴板文本

`paste` 方法可以把剪贴板内容，拷贝到编辑框当前光标所在处，比如

```python
edit.paste()
```

### 添加图标Action

可以在单行输入框内 添加 图标Action，如下所示

```python
from PySide6 import QtGui
from PySide6.QtWidgets import QLineEdit

# TrailingPosition - 图标在行尾 ；LeadingPosition - 图标在行头
action = edit.addAction(QtGui.QIcon('icon.png'), QLineEdit.TrailingPosition) 

# 定义点击图标行为
action.triggered.connect(actionFunc)
```

## 多行纯文本框

`QPlainTextEdit` 是可以 `多行` 的纯文本编辑框。更为详细的使用请见[官网介绍](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QPlainTextEdit.html)

![多行纯文本框](https://www.byhy.net/cdn2/imgs/gh/36257654_69479266-4b259b00-0e36-11ea-9167-29bfbc8b8826.png)

文本浏览框 内置了一个 [QTextDocument](https://doc.qt.io/qtforpython-6/PySide6/QtGui/QTextDocument.html) 类型的对象 ，存放文档。

### 文本被修改

当文本框中的内容被键盘编辑，被点击就会发出 `textChanged` 信号，可以这样指定处理该信号的函数

```python
edit.textChanged.connect(handleTextChange)
```

注意： Qt在调用这个信号处理函数时，**不会传入**文本框目前的内容字符串，作为参数。这个行为和单行文本框不同。

### 光标位置改变

当文本框中的光标位置变动，就会发出 `cursorPositionChanged` 信号，可以这样指定处理该信号的函数

```python
edit.cursorPositionChanged.connect(handleChanged)
```

### 获取文本

通过 `toPlainText` 方法获取编辑框内的文本内容，比如

```python
text = edit.toPlainText()
```

### 获取选中文本

```python
# 获取 QTextCursor 对象
textCursor = edit.textCursor()
selection = textCursor.selectedText()
```

### 设置提示

通过 `setPlaceholderText` 方法可以设置提示文本内容，比如

```python
edit.setPlaceholderText('请在这里输入薪资表')
```

### 设置文本

通过 `setPlainText` 方法设置编辑框内的文本内容 为参数里面的文本字符串，比如

```python
edit.setPlainText('''你好，白月黑羽
hello byhy''')
```

原来的所有内容会被清除

### 在末尾添加文本

通过 `appendPlainText` 方法在编辑框末尾添加文本内容，比如

```python
edit.appendPlainText('你好，白月黑羽')
```

注意：这种方法会在添加文本后 `自动换行`

### 在光标处插入文本

通过 `insertPlainText` 方法在编辑框末尾添加文本内容，比如

```python
edit.insertPlainText('你好，白月黑羽')
```

注意：这种方法 `不会` 在添加文本后自动换行

### 清除所有文本

`clear` 方法可以清除编辑框内所有的文本内容，比如

```python
edit.clear()
```

### 拷贝文本到剪贴板

`copy` 方法可以拷贝当前选中文本到剪贴板，比如

```python
edit.copy()
```

### 粘贴剪贴板文本

`paste` 方法可以把剪贴板内容，拷贝到编辑框当前光标所在处，比如

```python
edit.paste()
```

### 设置最大行数

有时候，代码会不断往文本框添加内容，为了防止占用过多资源，可以设置文本框最大行数。



像这样：

```python
edit.document().setMaximumBlockCount(1000)
```

就设置最大为 1000行

## 文本浏览框

`QTextBrowser` 是 `只能查看文本` 控件。

通常用来显示一些操作日志信息、或者不需要用户编辑的大段文本内容。

[官网介绍](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QTextBrowser.html)

该控件 获取文本、设置文本、清除文本、剪贴板复制粘贴 等等， 都和上面介绍的 多行纯文本框是一样的。

下面我们主要讲解不同点

### 在末尾添加文本

通过 `append` 方法在编辑框末尾添加文本内容，比如

```python
textBrowser.append('你好，白月黑羽')
```



有时，浏览框里面的内容长度超出了可见范围，我们在末尾添加了内容，往往希望控件自动翻滚到当前添加的这行，

可以通过 `ensureCursorVisible` 方法来实现

```python
textBrowser.append('你好，白月黑羽')
textBrowser.ensureCursorVisible()
```

注意：这种方法会在添加文本后 `自动换行`。

如果不想要换行，使用 `insertPlainText` ，如下

```python
textBrowser.insertPlainText('你好，白月黑羽')
textBrowser.ensureCursorVisible()
```



如果你发现还是不能自动显示控件最下面的内容，可以把 `textBrowser.ensureCursorVisible()` 改为如下写法

```python
QtCore.QTimer.singleShot(0, info.ensureCursorVisible)
```

### 在光标处插入文本

通过 `insertPlainText` 方法在编辑框末尾添加文本内容，比如

```python
edit.insertPlainText('你好，白月黑羽')
```

注意：这种方法 `不会` 在添加文本后自动换行

## 标签

`QLabel` 就是常见的标签，可以用来显示文字（包括纯文本和富文本）、图片 甚至动画。更详细的使用请参见[官网介绍](https://doc.qt.io/qtforpython-6/PySide6/QtWidgets/QLabel.html)。

![标签](https://www.byhy.net/cdn2/imgs/gh/36257654_69479746-df463100-0e3b-11ea-96e8-eacee44ae22d.png)



### 创建对象

可以这样用代码创建一个 QLabel对象

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QLabel

class MainWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        label = QLabel('初始内容')

        self.setCentralWidget(label)

app = QApplication()
mw = MainWindow()
mw.show()
app.exec()
```

文本内容可以是HTML富文本，支持的是一种 HTML4 规范的子集， [具体参考这里](https://doc.qt.io/qtforpython-6/overviews/richtext-html-subset.html)，比如

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QLabel

class MainWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        label = QLabel(
'''
<span style='
    font-family: "Microsoft Yahei";
    font-size:18px;
    background: green;
    color: white '>
  白月黑羽
  <b>SMS</b>
</span>
''')

        self.setCentralWidget(label)

app = QApplication()
mw = MainWindow()
mw.show()
app.exec()
```



### 设置文本

代码中可以使用 `setText` 方法来改变 标签文本内容，比如

```python
label.setText(text)
```

当然 setText 设置的内容也可以是HTML富文本

### 获取文本

代码中可以使用 `text` 方法来获取 标签文本内容，比如

```python
label.text()
```

### 显示图片

QLabel可以用来显示图片，有时一个图片可以让界面好看很多：

可以在 Qt Designer上 属性编辑器 QLabel 栏 的 pixmap 属性设置中选择图片文件指定。

### 用代码显示图片

如果要显示的图片是动态变化的，就需要用代码来显示。

我们通过 [QPixmap](https://doc.qt.io/qtforpython-6/PySide6/QtGui/QPixmap.html) 加载图片

支持 bmp、jpg、 png 等常用图片格式

```python
from PySide6 import QtWidgets, QtGui, QtCore

# 初始参数就是图片路径名
pixmap = QtGui.QPixmap('image.png')
# 设定图片缩放大小，这里是50个像素的宽度，高度也会等比例缩放
pixmap = pixmap.scaledToWidth(50, QtCore.Qt.SmoothTransformation)

label = QtWidgets.QLabel()

# 设置label显示的pixmap
label.setPixmap(pixmap)

# 设置label大小和图片一致
label.resize(
  pixmap.width(),
  pixmap.height())
```



如果你要显示的图片数据不是来自磁盘文件， 而是直接从网络、数据库 读取的图片字节数据，

可以使用 QPixmap 的 `loadFromData` 方法

```python
from PySide6 import QtWidgets, QtGui, QtCore

pixmap = QtGui.QPixmap()

# 直接设置Data， 同样支持各种格式的图片数据
pixmap.loadFromData(my_bytes) 

label = QtWidgets.QLabel()
label.setPixmap(pixmap)
```







# 小栗子

## 新建

打开designer，依次点击*==新建窗口>Main window==*创建一个软件页面

![动画](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_19_35_15_202410231935990.gif)

软件页面

![软件页面](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_19_34_58_202410231934330.png)

## 操作步骤

==信号与槽的原理==：

简单地说，将信号与槽函数连接后，当信号被触发时，槽函数将被自动调用。

分析这个过程，涉及到几个基本概念和关系：

- 信号：信号可以是一个动作，也可以是对象的一种状态，用于触发所连接的槽。

- 槽：槽就是一个函数，可以由连接的信号触发。
- 发射信号：信号被发射时，自动调用信号连接的槽函数。通常，在对象的状态改变时发射信号。
- 信号可以带有参数，但必须与槽函数的参数相对应。
- 一个信号可以连接多个槽函数，多个信号也可以连接到一个槽函数。
- 一个信号可以连接到另一个信号上。
- 很多窗口部件（控件）内置了一下信号和槽，可以直接调用。也可以按需求自定义信号和槽。

==信号发送者与槽的接收者==：

- 信号的发送者通常是一个控件对象，在控件对象的状态发生变化时发送信号。常见的发送者是图形窗口中的各种控件对象，但也可以是动作对象。
- 槽的接收者通常也是控件对象。槽函数是一个自定义的槽函数，或控件内置的槽函数。一般地，槽函数也有一个对象作为主体，即对于接受者这个控件对象执行函数定义的操作。例如槽函数执行的功能是关闭，哪么究竟是关闭那个控件呢？关闭对象就是接受者。


> [!NOTE]
>
> 举个例子，在一个十字路口，信号灯变成了绿色，对面的汽车看到后就启动了。
>
> - 信号灯就是发送信号的对象，绿灯亮是它发送的信号 (signal)。
> - 汽车是接收对象，汽车行驶是汽车对信号的响应，也叫槽 (slot)。

### 需求

> 1. 点击一下按钮，输入框中的文字就消失
> 2. 点击一下按钮，输入框中就显示“不要再点啦”

### 实现

需求1：

> 首先解析需求：
>
> > ==按钮是信号的发送者，输入框是接收者。按钮按下是信号，清空输入框中的文字是槽。==
>
> 首先从左侧的Widget Box中拉取一个push button，双击该push button即可修改button的文字。
>
> 之后从左侧的Widget Box中拉取一个Line Edit。
>
> ![拉去控件](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_19_58_30_202410231958540.gif)
>
> 将发送者和接收者连在一起：
>
> > 方法1：
> >
> > 1. 点击菜单栏的*==Edit》编辑信号\槽（F4）==*
> >
> > 2. 首先选中信号发送者，鼠标左键按住拖动会发现出现一个箭头，当拖动箭头到另外一个组件的时候，会将两个组件连接在一起，同时会出现配置连接界面，用于控制信号和槽
> >
> > 3. 此时需要选择信号和槽，左边是信号（按压动作，也就是clicked），右边栏是槽（清空函数，也就是clear）
> >
> > 4. 完成之后点击ok即可
> >
> >    ![连接信号和槽](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_20_9_21_202410232009568.gif)
> >
> > 方法2：
> >
> > 1. 点击右侧的信号槽，点击左上角加号增加一个连接
> >
> > 2. 依次选择发送者、信号、接收者、槽即可
> >
> >    ![选择式](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_20_11_36_202410232011449.png)
>
> 完成UI设计之后保存。将保存的ui文件转换为python文件，使用以下指令：
>
> ```
> python -m PyQt5.uic.pyuic .\mainWindow.ui -o mainWindow.py
> ```
>
> 使用完命令之后就会发现在同级目录下生成了py文件。
>
> 新建一个python文件，用来运行，代码如下：
>
> ```python
> import sys
> from PyQt5 import QtWidgets
> from mainWindow import Ui_MainWindow  # 导入你的UI类
> 
> class MainWindow(QtWidgets.QMainWindow):
>     def __init__(self):
>         super().__init__()	#调用父类的构造函数
>         self.ui = Ui_MainWindow()
>         self.ui.setupUi(self)
> 
> if __name__ == '__main__':
>     app = QtWidgets.QApplication(sys.argv)
>     mainWin = MainWindow()
>     mainWin.show()
>     sys.exit(app.exec_())
> 
> ```
>
> > [!TIP]
> >
> > super用于调用父类的函数，这里的`super().__init__()`就是调用父类的`__init__（）`
> >
> > 当然，也可以调用父类的函数。现考虑以下程序会输出什么？
> >
> > ```python
> > class A:
> >     def greet(self):
> >         print("Hello from A")
> > 
> > class B(A):
> >     def greet(self):
> >         print("Hello from B")
> >         super().greet()  # 调用父类 A 的 greet 方法
> > 
> > class C(A):
> >     def greet(self):
> >         print("Hello from C")
> >         super().greet()  # 调用父类 A 的 greet 方法
> > 
> > class D(B, C):
> >     def greet(self):
> >         print("Hello from D")
> >         super().greet()  # 这样会依照方法解析顺序调用 B 和 C 的 greet 方法
> > 
> > d = D()
> > d.greet()
> > ```
> >
> > ```
> > Hello from D
> > Hello from B
> > Hello from C
> > Hello from A
> > ```
> >
> > 在函数调用时，遵从C3线性算法：
> >
> > 1. **保证优先级**：C3线性化确保了子类在调用方法时，父类的顺序是可信的，子类总是在父类之前得到调用。
> > 2. **无歧义性**：如果一个类有多个父类，C3算法会生成一个唯一的线性顺序，从而消除方法解析过程中的歧义。
> > 3. **遵循先父后子的原则**：在确定顺序时，确保父类在子类之前，且继承树的任何变化都会反映在新的线性化顺序中。
> >
> > C3算法的基本思想是为每个类维护一个序列，这个序列从当前类开始，依次添加类的父名单，并遵循以下原则：
> >
> > 1. 如果类A继承类B和类C，则在确定类A的MRO（Method Resolution Order）时，类B和类C的优先级要遵循它们的MRO，可以使用`D.mro()`来查看类的调用顺序。
> > 2. 类B的所有父类在类A的MRO中必须在类B之后出现。
> > 3. 类C的所有父类在类A的MRO中必须在类C之后出现。
>
> > [!TIP]
> >
> > 构造函数是用于初始化对象的一种特殊方法。在Python中，构造函数是`__init__`方法。当一个对象被创建时，Python会自动调用这个方法，以便为对象的属性赋初始值并进行必要的设置。
> >
> > 构造函数的特点:
> >
> > 1. **名称**：构造函数在Python中总是被命名为`__init__`，这是一个特殊的方法名。
> > 2. **参数**：构造函数可以接受参数，用于传递需要初始化的值。第一个参数通常是`self`，它代表实例本身，后面的参数则可以根据需要自定义。
> > 3. **自动调用**：当创建对象时，例如`obj = ClassName()`, Python会自动调用相应的构造函数。
> >
> > 示例：
> >
> > ```python
> > class Car:
> >     def __init__(self, make, model, year):
> >         self.make = make   # 品牌
> >         self.model = model # 型号
> >         self.year = year   # 年份
> > 
> >     def display_info(self):
> >         print(f"Car: {self.year} {self.make} {self.model}")
> > 
> > # 创建对象时将调用构造函数
> > my_car = Car("Toyota", "Camry", 2020)
> > my_car.display_info()
> > ```
> >
> > 输出
> >
> > ```
> > Car: 2020 Toyota Camry
> > ```



需求2：

> 由于显示特定文字，接收者（Line edit）就是Main window，所以我们的指向应该指向“地”。
>
> 在建立连接之前，需要先申明一个我们自定义的函数，在`对象查看器`中选中QMainWindow，右键，选择`改变信号\槽`，在槽中新建一个自己的函数
>
> ![新建槽函数](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_20_39_8_202410232039010.gif)
>
> 然后从按钮出发接地即可
>
> ![动画](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/10/23_20_41_27_202410232041717.gif)
>
> 和上面一样，先将文件转化为python文件，之后再新建一个python文件，此时我们需要实现刚刚定义的函数：
>
> ```python
> import sys
> from PyQt5 import QtWidgets
> from mainWindow import Ui_MainWindow  # 导入你的UI类
> 
> class MainWindow(QtWidgets.QMainWindow):
>  def __init__(self):
>      super().__init__()
>      self.ui = Ui_MainWindow()
>      self.ui.setupUi(self)
> 
>  def showing(self):
>      print("showing")
>      self.ui.lineEdit.setText("不要再点啦")
> 
> if __name__ == '__main__':
>  app = QtWidgets.QApplication(sys.argv)
>  mainWin = MainWindow()
>  mainWin.show()
>  sys.exit(app.exec_())
> ```
>
> > [!NOTE]
> >
> > ```python
> > import sys
> > from PyQt5 import QtWidgets
> > from mainWindow import Ui_MainWindow  # 导入你的UI类
> > 
> > class MainWindow(Ui_MainWindow,QtWidgets.QMainWindow):
> >      def __init__(self):
> >            super().__init__()
> >            self.setupUi(self)
> >     
> >      def showing(self):
> >            print("showing")
> >            self.lineEdit.setText("不要再点啦")
> > 
> > if __name__ == '__main__':
> >      app = QtWidgets.QApplication(sys.argv)
> >      mainWin = MainWindow()
> >      mainWin.show()
> >      sys.exit(app.exec_())
> >  
> > ```
> >
> > 

最后打包软件：

```bash
pyinstaller -D --noconsole  main.py  
```



#  技巧

将ui文件转换为python文件

```bash
python -m PyQt5.uic.pyuic .\mainWindow.ui -o mainWindow.py
```

打包软件

```bash
pyinstaller -D -i .\resource\windowIcon.ico --noconsole  main.py 


```

> [!tip]
>
> 注意：有时候可能需要打包多个文件，所以可以使用[Enigma Virtual Box(虚拟打包器) v11.30.20250428 汉化去广告版-绿软小站 (gndown.com)](https://www.gndown.com/534.html)来打包

设置字体能跟随分辨率

```python
 QtWidgets.QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)
 QtGui.QGuiApplication.setHighDpiScaleFactorRoundingPolicy(QtCore.Qt.HighDpiScaleFactorRoundingPolicy.PassThrough)   
```

设置下拉框中选项的距离

```python
# m_sectionShape是组件名称
self.m_sectionShape.setStyleSheet("QAbstractItemView::item { height: 20px}")
self.m_sectionShape.setView(QListView())
```































































