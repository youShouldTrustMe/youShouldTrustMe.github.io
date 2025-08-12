---
title: Matlab

date: 2025-03-01
lastmod: 2025-03-01
tags:
- 编程语言
---



# 参考链接

[MATLAB 快速入门 - MathWorks 中国](https://ww2.mathworks.cn/help/matlab/getting-started-with-matlab_zh_CN.html)

# 语言基础知识

## 输入命令

在 MATLAB 中工作时，您可发出创建变量和调用函数的命令。有关介绍，请参阅[在命令行窗口中输入语句](https://ww2.mathworks.cn/help/matlab/matlab_env/enter-statements-in-command-window.html)。

### 函数

| 操作                                                                               | 注释                 |
| -------------------------------------------------------------------------------- | ------------------ |
| [`ans`](https://ww2.mathworks.cn/help/matlab/ref/ans.html)                       | 最近计算的答案            |
| [`clc`](https://ww2.mathworks.cn/help/matlab/ref/clc.html)                       | 清空命令行窗口            |
| [`diary`](https://ww2.mathworks.cn/help/matlab/ref/diary.html)                   | 将命令行窗口文本记录到日志文件中   |
| [`format`](https://ww2.mathworks.cn/help/matlab/ref/format.html)                 | 设置输出显示格式           |
| [`home`](https://ww2.mathworks.cn/help/matlab/ref/home.html)                     | 发送光标复位             |
| [`iskeyword`](https://ww2.mathworks.cn/help/matlab/ref/iskeyword.html)           | 确定输入是否为 MATLAB 关键字 |
| [`more`](https://ww2.mathworks.cn/help/matlab/ref/more.html)                     | 控制命令行窗口中的分页输出      |
| [`commandwindow`](https://ww2.mathworks.cn/help/matlab/ref/commandwindow.html)   | 选择命令行窗口            |
| [`commandhistory`](https://ww2.mathworks.cn/help/matlab/ref/commandhistory.html) | 打开命令历史记录窗口         |

### 对象

| 操作                                                                                                          | 注释                           |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [`DisplayFormatOptions`](https://ww2.mathworks.cn/help/matlab/ref/matlab.display.displayformatoptions.html) | 命令行窗口中的输出显示格式 *(自 R2021a 起)* |



## 数组和矩阵

### 创建和合并数组

要创建每行包含四个元素的数组，请使用逗号 (`,`) 或空格分隔各元素。

```matlab
a = [1 2 3 4]
```

这种数组为==行向量==。要创建包含多行的矩阵，请使用分号分隔各行。

```matlab
a = [1 3 5; 2 4 6; 7 8 10]
```



| 函数                                                                           | 备注                         |
| ---------------------------------------------------------------------------- | -------------------------- |
| [`zeros`](https://ww2.mathworks.cn/help/matlab/ref/zeros.html)               | 创建全零数组                     |
| [`ones`](https://ww2.mathworks.cn/help/matlab/ref/ones.html)                 | 创建全部为 1 的数组                |
| [`rand`](https://ww2.mathworks.cn/help/matlab/ref/rand.html)                 | 均匀分布的随机数                   |
| [`true`](https://ww2.mathworks.cn/help/matlab/ref/true.html)                 | 逻辑值 1（真）                   |
| [`false`](https://ww2.mathworks.cn/help/matlab/ref/false.html)               | 逻辑 0（假）                    |
| [`eye`](https://ww2.mathworks.cn/help/matlab/ref/eye.html)                   | 单位矩阵                       |
| [`diag`](https://ww2.mathworks.cn/help/matlab/ref/diag.html)                 | 创建对角矩阵或获取矩阵的对角元素           |
| [`blkdiag`](https://ww2.mathworks.cn/help/matlab/ref/blkdiag.html)           | 分块对角矩阵                     |
| [`cat`](https://ww2.mathworks.cn/help/matlab/ref/double.cat.html)            | 串联数组。                      |
| [`horzcat`](https://ww2.mathworks.cn/help/matlab/ref/double.horzcat.html)    | 水平串联数组                     |
| [`vertcat`](https://ww2.mathworks.cn/help/matlab/ref/double.vertcat.html)    | 垂直串联数组                     |
| [`repelem`](https://ww2.mathworks.cn/help/matlab/ref/repelem.html)           | 重复数组元素副本                   |
| [`repmat`](https://ww2.mathworks.cn/help/matlab/ref/repmat.html)             | 重复数组副本                     |
| [`combinations`](https://ww2.mathworks.cn/help/matlab/ref/combinations.html) | 生成数组的所有元素组合 *(自 R2023a 起)* |

### 创建网格

| 函数、参数                                                                  | 备注          |
| ---------------------------------------------------------------------- | ----------- |
| [`linspace`](https://ww2.mathworks.cn/help/matlab/ref/linspace.html)   | 生成线性间距向量    |
| [`logspace`](https://ww2.mathworks.cn/help/matlab/ref/logspace.html)   | 生成对数间距向量    |
| [`freqspace`](https://ww2.mathworks.cn/help/matlab/ref/freqspace.html) | 频率响应的频率间距   |
| [`meshgrid`](https://ww2.mathworks.cn/help/matlab/ref/meshgrid.html)   | 二维和三维网格     |
| [`ndgrid`](https://ww2.mathworks.cn/help/matlab/ref/ndgrid.html)       | N 维空间中的矩形网格 |

### 确定大小和排序

| 函数、参数                                                                        | 备注                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`length`](https://ww2.mathworks.cn/help/matlab/ref/length.html)             | 最大数组维度的长度                                              |
| [`size`](https://ww2.mathworks.cn/help/matlab/ref/size.html)                 | 数组大小                                                   |
| [`ndims`](https://ww2.mathworks.cn/help/matlab/ref/double.ndims.html)        | 数组维度数目                                                 |
| [`numel`](https://ww2.mathworks.cn/help/matlab/ref/double.numel.html)        | 数组元素的数目                                                |
| [`isscalar`](https://ww2.mathworks.cn/help/matlab/ref/isscalar.html)         | 确定输入是否为标量                                              |
| [`isvector`](https://ww2.mathworks.cn/help/matlab/ref/isvector.html)         | 确定输入是否为向量                                              |
| [`ismatrix`](https://ww2.mathworks.cn/help/matlab/ref/ismatrix.html)         | 确定输入是否为矩阵                                              |
| [`isrow`](https://ww2.mathworks.cn/help/matlab/ref/isrow.html)               | 确定输入是否为行向量                                             |
| [`iscolumn`](https://ww2.mathworks.cn/help/matlab/ref/iscolumn.html)         | 确定输入是否为列向量                                             |
| [`isempty`](https://ww2.mathworks.cn/help/matlab/ref/double.isempty.html)    | 确定数组是否为空                                               |
| [`issorted`](https://ww2.mathworks.cn/help/matlab/ref/issorted.html)         | 确定数组是否已排序                                              |
| [`issortedrows`](https://ww2.mathworks.cn/help/matlab/ref/issortedrows.html) | 确定矩阵或表的行是否已排序                                          |
| [`isuniform`](https://ww2.mathworks.cn/help/matlab/ref/isuniform.html)       | Determine if vector is uniformly spaced *(自 R2022b 起)* |



### 调整大小

| 函数、参数                                                                | 备注                                                        |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| [`head`](https://ww2.mathworks.cn/help/matlab/ref/double.head.html)  | 获取数组或表的顶行                                                 |
| [`tail`](https://ww2.mathworks.cn/help/matlab/ref/double.tail.html)  | 获取数组或表的底行                                                 |
| [`resize`](https://ww2.mathworks.cn/help/matlab/ref/resize.html)     | Resize data by adding or removing elements *(自 R2023b 起)* |
| [`paddata`](https://ww2.mathworks.cn/help/matlab/ref/paddata.html)   | Pad data by adding elements *(自 R2023b 起)*                |
| [`trimdata`](https://ww2.mathworks.cn/help/matlab/ref/trimdata.html) | Trim data by removing elements *(自 R2023b 起)*             |

### 重构

| 函数、参数                                                   | 备注                           |
| ------------------------------------------------------------ | ------------------------------ |
| [`permute`](https://ww2.mathworks.cn/help/matlab/ref/permute.html) | 置换数组维度                   |
| [`ipermute`](https://ww2.mathworks.cn/help/matlab/ref/ipermute.html) | 逆置换数组维度。               |
| [`shiftdim`](https://ww2.mathworks.cn/help/matlab/ref/shiftdim.html) | 移动数组维度                   |
| [`reshape`](https://ww2.mathworks.cn/help/matlab/ref/reshape.html) | 通过重新排列现有元素来重构数组 |
| [`squeeze`](https://ww2.mathworks.cn/help/matlab/ref/squeeze.html) | 删除长度为 1 的维度            |

### 重新排序

| 函数、参数                                                   | 备注                   |
| ------------------------------------------------------------ | ---------------------- |
| [`sort`](https://ww2.mathworks.cn/help/matlab/ref/sort.html) | 对数组元素排序         |
| [`sortrows`](https://ww2.mathworks.cn/help/matlab/ref/double.sortrows.html) | 对矩阵行或表行进行排序 |
| [`flip`](https://ww2.mathworks.cn/help/matlab/ref/flip.html) | 翻转元素顺序           |
| [`fliplr`](https://ww2.mathworks.cn/help/matlab/ref/fliplr.html) | 将数组从左向右翻转     |
| [`flipud`](https://ww2.mathworks.cn/help/matlab/ref/flipud.html) | 将数组从上向下翻转     |
| [`rot90`](https://ww2.mathworks.cn/help/matlab/ref/rot90.html) | 将数组旋转 90 度       |
| [`transpose`](https://ww2.mathworks.cn/help/matlab/ref/transpose.html) | 转置向量或矩阵         |
| [`ctranspose`](https://ww2.mathworks.cn/help/matlab/ref/ctranspose.html) | 复共轭转置             |
| [`circshift`](https://ww2.mathworks.cn/help/matlab/ref/circshift.html) | 循环平移数组           |

### 索引

| 函数、参数                                                   | 备注                                |
| ------------------------------------------------------------ | ----------------------------------- |
| [`colon`](https://ww2.mathworks.cn/help/matlab/ref/colon.html) | 向量创建、数组下标和 `for` 循环迭代 |
| [`end`](https://ww2.mathworks.cn/help/matlab/ref/end.html)   | 终止代码块或指示最大数组索引        |
| [`ind2sub`](https://ww2.mathworks.cn/help/matlab/ref/ind2sub.html) | 将线性索引转换为下标                |
| [`sub2ind`](https://ww2.mathworks.cn/help/matlab/ref/sub2ind.html) | 将下标转换为线性索引                |























