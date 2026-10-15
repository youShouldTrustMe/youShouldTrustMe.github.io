---
title: PlantUML

categories: 
  - 软件及工具
---

# 参考链接
[新的活动图测试语法和功能 (plantuml.com)](https://plantuml.com/zh/activity-diagram-beta)

# 活动图

## 行为

活动标签以`:` 开始，以`;` 结束。文本格式可以使用[克里奥尔语的维基语法](https://plantuml.com/zh/creole)。它们的定义顺序是隐性链接的。

```plantuml
@startuml 
	:Hello world; 
	:This is defined on several **lines**; 
@enduml
```

![简单的行动](https://plantuml.com/imgw/img-2e9cc60227f7ff7fe6ab524d97ad4962.png)

当然，还可以使用别的符号作为开头：

1.  `-`

   ```plantuml
   @startuml
   - Action 1 
   - Action 2 
   - Action 3 
   @enduml
   ```

   ![使用-号](https://plantuml.com/imgw/img-4171b89a26454259b2cf4c95c2599ec6.png)

2.  `*`

   1. 一级

      ```plantuml
      @startuml
      * Action 1
      * Action 2
      * Action 3
      @enduml
      ```

      ![使用*号作为单级](https://plantuml.com/imgw/img-59e67987a6a842678eb9b17f60c16fb3.png)

   2. 多级

      ```plantuml
      @startuml
      <style>
      element {MinimumWidth 150}
      </style>
      * Action 1
      ** Sub-Action 1.1
      ** Sub-Action 1.2
      *** Sub-Action 1.2.1
      *** Sub-Action 1.2.2
      * Action 2
      @enduml
      ```

      ![使用*号作为多级](https://plantuml.com/imgw/img-bf5a1e82237a4d4c6777d90ff9a79dfc.png)









## 开始/停止/结束

你可以使用`start` 和`stop` 关键字来表示一个图的开始和结束 。

```plantuml
@startuml
start
:Hello world;
:This is defined on
several **lines**;
stop
@enduml
```

![使用stop作为停止](https://plantuml.com/imgw/img-dff8747463fa8e321fb42784b1ec5678.png)

你也可以使用`end` 关键字。

```plantuml
@startuml
start
:Hello world;
:This is defined on
several **lines**;
end
@enduml
```

![使用end作为结束](https://plantuml.com/imgw/img-950291b7d07abe5e0be71563e68ad561.png)

## 分支

### if-else

你可以使用`if`,`then`, `break`和`else` 关键词来在你的图表中放入测试。 标签可以用圆括号提供。

有3种语法可供选择。

1. `if (...) then (...)`

   ```plantuml
   @startuml
   
   start
   
   if (Graphviz installed?) then (yes)
     :process all\ndiagrams;
   else (no)
     :process only
     __sequence__ and __activity__ diagrams;
   endif
   
   stop
   
   @enduml
   ```

   ![第一种选择语法](https://plantuml.com/imgw/img-4d36b80dcdb8af4226928d638a65532e.png)

2. `if (...) is (...) then`

   ```plantum
   @startuml
   if (color?) is (<color:red>red) then
   :print red;
   else 
   :print not red;
   @enduml
   ```

   ![第二种选择语法](https://plantuml.com/imgw/img-fba0be2bea25084bbc794e3886d4ded5.png)

3. `if (...) equals (...) then`

   ```plantum
   @startuml
   if (counter?) equals (5) then
   :print 5;
   else 
   :print not 5;
   @enduml
   ```

   ![第三种选择语法](https://plantuml.com/imgw/img-cb6e62a689e07b9162bd36b3b499e9fd.png)

分支可以使用不同的排布方式：

1. 水平模式（默认水平模式）

   ```plantuml
   @startuml
   start
   if (condition A) then (yes)
     :Text 1;
   elseif (condition B) then (yes)
     :Text 2;
     stop
   (no) elseif (condition C) then (yes)
     :Text 3;
   (no) elseif (condition D) then (yes)
     :Text 4;
   else (nothing)
     :Text else;
   endif
   stop
   @enduml
   ```

   ![水平模式](https://plantuml.com/imgw/img-dd1111c7d095a3d0b1649571800c62e3.png)

2. 垂直模式：你可以使用`!pragma useVerticalIf on` 命令，让图处于垂直模式。

   ```plantuml
   @startuml
   start
   if (condition A) then (yes)
     :Text 1;
   elseif (condition B) then (yes)
     :Text 2;
     stop
   (no) elseif (condition C) then (yes)
     :Text 3;
   (no) elseif (condition D) then (yes)
     :Text 4;
   else (nothing)
     :Text else;
   endif
   stop
   @enduml
   ```

   ![竖直模式](https://plantuml.com/imgw/img-505e7da08a89ce04dcf5974403bb08f7.png)



你可以使用`-P` command-line[命令行]选项来指定pragma。

```
java -jar plantuml.jar -PuseVerticalIf=on
```

### switch

Switch判断可以使用你可以使用 `switch`, `case` 和 `endswitch` 关键词在图表中绘制Switch判断.使用括号表示标注.

```plantuml
@startuml
start
switch (测试?)
case ( 条件 A )
  :Text 1;
case ( 条件 B ) 
  :Text 2;
case ( 条件 C )
  :Text 3;
case ( 条件 D )
  :Text 4;
case ( 条件 E )
  :Text 5;
endswitch
stop
@enduml
```

![switch分支语句](https://plantuml.com/imgw/img-fc6ccd2b9f73883b1c25742ead174066.png)

### 终止

你可以在if判断中终止一个行为.

```plantuml
@startuml
if (条件?) then
  :错误;
  stop
endif
#palegreen:行为;
@enduml
```

![条件语句的终止](https://plantuml.com/imgw/img-5aed77232aeb001d3d82ce68603121f6.png)

但如果你想在特定行为上停止，你可以使用`kill` 或 `detach`关键字:

- `kill`

  ```plantuml
  @startuml
  if (条件?) then
    #pink:错误;
    kill
  endif
  #palegreen:行为;
  @enduml
  ```

  ![kill关键字](https://plantuml.com/imgw/img-9ee3f31da6754c76d5e17bbe071735d5.png)

- `detach`

  ```plantuml
  @startuml
  if (条件?) then
    #pink:错误;
    detach
  endif
  #palegreen:行为;
  @enduml
  ```

  ![detach关键字](https://plantuml.com/imgw/img-47cca20a5742492d7c69908b953d0e33.png)

### GoTo

Goto和标签处理 [label, goto]

⚠ 目前只是实验性的 🚧

你可以使用`label` 和`goto` 关键词来表示Goto处理，其中：

- `label <label_name>`
- `goto <label_name>`

```plantuml
@startuml
title Point two queries to same activity\nwith `goto`
start
if (Test Question?) then (yes)
'space label only for alignment
label sp_lab0
label sp_lab1
'real label
label lab
:shared;
else (no)
if (Second Test Question?) then (yes)
label sp_lab2
goto sp_lab1
else
:nonShared;
endif
endif
:merge;
@enduml
```

![GOTO关键字](https://plantuml.com/imgw/img-d29d3a669e3049eb445cbbb64291fa4f.png)

## 循环

### 基础循环



重复循环：你可以使用关键字`repeat`和`repeatwhile`进行重复循环。

```plantuml
@startuml

start

repeat
  :读取数据;
  :生成图片;
repeat while (更多数据?)

stop

@enduml
```

![repeat关键字](https://plantuml.com/imgw/img-219abd638df01361a1f4e739fb51b842.png)

你同样可以使用一个全局行为作为`repeat`目标， 在返回循环开始时使用`backward`关键字插入一个全局行为。

```plantuml
@startuml

start

repeat :foo作为开始标注;
  :读取数据;
  :生成图片;
backward:这是一个后撤行为;
repeat while (更多数据?)

stop

@enduml
```

![backward关键字](https://plantuml.com/imgw/img-5c7832ecc316a1271834ed1615b4c375.png)

### 跳出

你可以使用 `break` 关键字跟在循环中的某个行为后面打断循环.

```plantuml
@startuml
start
repeat
  :测试某事;
    if (发生错误?) then (没有)
      #palegreen:好的;
      break
    endif
    ->not ok;
    :弹窗 "文本过长错误";
repeat while (某事发生文本过长错误?) is (是的) not (不是)
->//合并步骤//;
:弹窗 "成功！";
stop
@enduml
```

![跳出循环](https://plantuml.com/imgw/img-a0207085f6c01d898e4cf9a3bce68831.png)

### while

可以使用关键字`while`和`end while`进行while循环。

```plantuml
@startuml

start

while (data available?)
  :read data;
  :generate diagrams;
endwhile

stop

@enduml
```

![while关键字](https://plantuml.com/imgw/img-a597b0ccffb05ee2cc898364dcfdaff5.png)

还可以在关键字`endwhile`后添加标注，还有一种方式是使用关键字`is`。

```plantuml
@startuml
while (check filesize ?) is (not empty)
  :read file;
endwhile (empty)
:close file;
@enduml
```

![while中使用is关键字](https://plantuml.com/imgw/img-239fba10b02265a380fabc4b3343ac3c.png)

如果你使用 `+detach+` 来形成一个无限循环, 那么你可能需要使用 `+-[hidden]->+` 来隐藏一些不完整的箭头。

```plantuml
@startuml
:Step 1;
if (condition1) then
  while (loop forever)
   :Step 2;
  endwhile
  -[hidden]->
  detach
else
  :end normally;
  stop
endif
@enduml
```

![无限循环中隐藏不完整箭头](https://plantuml.com/imgw/img-2bfade6ecd87475c16382303d37e4b35.png)

## 并行



你可以使用`fork`，`fork again`和`end fork` 或者 `end merge` 等关键字表示并行处理。

### fork

```plantuml
@startuml
start
fork
  :行为 1;
fork again
  :行为 2;
end fork
stop
@enduml
```

![fork关键字](https://plantuml.com/imgw/img-ac94ce0c0f8ae437916fbca6d8bf2be5.png)



### fork合并

```plantuml
@startuml
start
fork
  :行为 1;
fork again
  :行为 2;
end merge
stop
@enduml
```

![fork的合并](https://plantuml.com/imgw/img-92661817acd274b6db163bed36ce6245.png)



```plantuml
@startuml
start
fork
  :行为 1;
fork again
  :行为 2;
fork again
  :行为 3;
fork again
  :行为 4;
end merge
stop
@enduml
```

![多fork合并](https://plantuml.com/imgw/img-a30bf031d6db7e02d112332757dad3b8.png)

```plantuml
@startuml
start
fork
  :行为 1;
fork again
  :行为 2;
  end
end merge
stop
@enduml
```

![多分支结束](https://plantuml.com/imgw/img-0bc4b66b5b77051c41cf882b2bdbbb79.png)

### end fork标注

```plantuml
@startuml
start
fork
  :行为 A;
fork again
  :行为 B;
end fork {或}
stop
@enduml
```

![结束fork的或操作](https://plantuml.com/imgw/img-f2aa9799e3e7e692665647f862ac7103.png)

```plantuml
@startuml
start
fork
  :行为 A;
fork again
  :行为 B;
end fork {和}
stop
@enduml
```

![结束fork的与操作](https://plantuml.com/imgw/img-97900fb42f7b2de113d6a79b1d166156.png)

```plantuml
@startuml

start

if (多进程处理?) then (是)
  fork
    :进程 1;
  fork again
    :进程 2;
  end fork
else (否)
  :逻辑 1;
  :逻辑 2;
endif

@enduml
```

![frok和串行合并](https://plantuml.com/imgw/img-a0488910818c9b28a35bf0bdccfd0b58.png)

### 分割

你可以使用 `split`, `split again` 和 `end split` 关键字去表达分割处理

```plantuml
@startuml
start
split
   :A;
split again
   :B;
split again
   :C;
split again
   :a;
   :b;
end split
:D;
end
@enduml
```

![split关键字](https://plantuml.com/imgw/img-df280cbd418934fb962933da4c1a2fae.png)

### 输入分割 

你可以使用包含 `hidden` 指令的箭头去制造一个输入分割 (多入口):

```plantuml
@startuml
split
   -[hidden]->
   :A;
split again
   -[hidden]->
   :B;
split again
   -[hidden]->
   :C;
end split
:D;
@enduml
```

![输入分割隐藏输入箭头](https://plantuml.com/imgw/img-9707358e73083aedcfc520421f7259b3.png)

### 输出分割

```plantuml
@startuml
start
split
   :A;
   kill
split again
   :b;
   :c;
   detach
split again
   (Z)
   detach
split again
   end
split again
   stop
end split
@enduml
```

![输出分割](https://plantuml.com/imgw/img-881ebf4229be685fb4fb128f4ed17005.png)

## 注释

文本格式可以使用[克里奥尔维基语法](https://plantuml.com/zh/creole)。可以使用`floating` 关键字浮动注释。

```plantuml
@startuml

start
:foo1;
floating note left: This is a note
:foo2;
note right
  This note is on several
  //lines// and can
  contain <b>HTML</b>
  ====
  * Calling the method ""foo()"" is prohibited
end note
stop

@enduml
```

![浮动注释](https://plantuml.com/imgw/img-a5d53c69421d3375752d7d49ac2f19aa.png)

您可以为后向活动添加注释：

```plantuml
@startuml
start
repeat :Enter data;
:Submit;
backward :Warning;
note right: Note
repeat while (Valid?) is (No) not (Yes)
stop
@enduml
```

![普通注释](https://plantuml.com/imgw/img-e4efb039af7791c87109e70c00b8fbdf.png)

可以添加分区活动注释：

```plantuml
@startuml
start
partition "**process** HelloWorld" {
    note
        This is my note
        ----
        //Creole test//
    end note
    :Ready;
    :HelloWorld(i)>
    :Hello-Sent;
}
@enduml
```

![分区注释](https://plantuml.com/imgw/img-13fb4d0d68cdf9ed2f666333f271700d.png)



## 箭头



无箭头连接线

您可以使用 `skinparam ArrowHeadColor none` 参数来表示仅使用线条连接活动，而不带箭头。

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ArrowHeadColor none start :Hello world; :This is on defined on several **lines**; stop @enduml`<br><br>![](https://plantuml.com/imgw/img-6816f8ee24f5825fd00dd3435ea48b6d.png) |

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ArrowHeadColor none start repeat :Enter data; :Submit; backward :Warning; repeat while (Valid?) is (No) not (Yes) stop @enduml`<br><br>![](https://plantuml.com/imgw/img-2f4c4f550acf16344be8105645adb02a.png) |




箭头

使用`->`标记，你可以给箭头添加文字或者修改箭头[颜色](https://plantuml.com/zh/color)。

同时，你也可以选择点状 (dotted)，条状(dashed)，加粗或者是隐式箭头

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml :foo1; -> You can put text on arrows; if (test) then   -[#blue]->   :foo2;   -[#green,dashed]-> The text can   also be on several lines   and **very** long...;   :foo3; else   -[#black,dotted]->   :foo4; endif -[#gray,bold]-> :foo5; @enduml`<br><br>![](https://plantuml.com/imgw/img-6dbfe26c10d234b18e13996e3c1c33a5.png) |




Multiple colored arrow

You can use multiple colored arrow.

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam colorArrowSeparationSpace 1 start -[#red;#green;#orange;#blue]-> if(a?)then(yes) -[#red]-> :activity; -[#red]-> if(c?)then(yes) -[#maroon,dashed]-> else(no) -[#red]-> if(b?)then(yes) -[#maroon,dashed]-> else(no) -[#blue,dashed;dotted]-> :do a; -[#red]-> :do b; -[#red]-> endif -[#red;#maroon,dashed]-> endif -[#red;#maroon,dashed]-> elseif(e?)then(yes) -[#green]-> if(c?)then(yes) -[#maroon,dashed]-> else(no) -[#green]-> if(d?)then(yes) -[#maroon,dashed]-> else(no) -[#green]-> :do something; <<continuous>> -[#green]-> endif -[#green;#maroon,dashed]-> partition dummy { :some function; } -[#green;#maroon,dashed]-> endif -[#green;#maroon,dashed]->  elseif(f?)then(yes) -[#orange]-> :activity; <<continuous>> -[#orange]-> else(no) -[#blue,dashed;dotted]-> endif stop @enduml`<br><br>![](https://plantuml.com/imgw/img-54f38a90f64422bb8ec0dd16aae849e5.png) |

_[Ref. [QA-4411](https://forum.plantuml.net/4411)]_




连接器(Connector)

你可以使用括号定义连接器。

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start :Some activity; (A) detach (A) :Other activity; @enduml`<br><br>![](https://plantuml.com/imgw/img-65cebaadff8dfe23529329551729a3b4.png) |

WARNING

 **This translation need to be updated.** 

WARNING




连接器颜色

你可以在连接器上增加 [颜色](https://plantuml.com/zh/color)

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start :下面的连接器 应该是蓝色; #blue:(B) :下一个连接器应该 看起来应该是 深绿色; #green:(G) stop @enduml`<br><br>![](https://plantuml.com/imgw/img-e329632e70b50cbfedb7ce70edbf0086.png) |

_[参考. [QA-10077](https://forum.plantuml.net/10077/assigning-color-to-connectors?show=10080#c10080)]_

_[Ref. [QA-19975](https://forum.plantuml.net/19975/please-provide-change-background-connectors-activity-diagrams?show=19976#a19976)]_

WARNING

 **This translation need to be updated.** 

WARNING




组合(grouping)

通过定义分组(group)，你可以把多个活动分组。

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start group 初始化分组      :read config file;     :init internal variable; end group group 运行分组     :wait for user interaction;     :print information; end group  stop @enduml`<br><br>![](https://plantuml.com/imgw/img-4bdd44e0eefa25fd414d120dd3267b03.png) |

### 分区

通过定义分区(partition)，你可以把多个活动组合(group)在一起:

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start partition 初始化分区 {     :read config file;     :init internal variable; } partition 运行分区 {     :wait for user interaction;     :print information; }  stop @enduml`<br><br>![](https://plantuml.com/imgw/img-5a3f0b70b307fc40e35e162b944f2394.png) |

这里同样可以改变分区颜色 [color](https://plantuml.com/zh/color):

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start partition #lightGreen "Input Interface" {     :read config file;     :init internal variable; } partition Running {     :wait for user interaction;     :print information; } stop @enduml`<br><br>![](https://plantuml.com/imgw/img-1b4f30b8105d30e084807caf2b5c662c.png) |

_[参考: [QA-2793](https://forum.plantuml.net/2793/activity-beta-partition-name-more-than-one-word-does-not-work?show=2798#a2798)]_

同样可以添加一个 [链接](https://plantuml.com/zh/link) 到分区:

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start partition "[[http://plantuml.com partition_name]]" {     :read doc. on [[http://plantuml.com plantuml_website]];     :test diagram; } end @enduml`<br><br>![](https://plantuml.com/imgw/img-de5be6e68ff4dd765754c29ed8bc8b51.png) |

_[参考: [QA-542](https://forum.plantuml.net/542/ability-to-define-hyperlink-on-diagram-elements?show=14003#c14003)]_

### 分组, 分区, 包, 矩形 或 卡片式

你可以分组活动通过定义:

- group;
- partition;
- package;
- rectangle;
- card.

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start group 分组   :Activity; end group floating note: 分组备注  partition 分区 {   :Activity; } floating note: 分区备注  package 包 {   :Activity; } floating note: 包备注  rectangle 矩形 {   :Activity; } floating note: 矩形备注  card 卡片式 {   :Activity; } floating note: 卡片式备注 end @enduml`<br><br>![](https://plantuml.com/imgw/img-640030fb3c783456a3ee87d9c3c8ec14.png) |




泳道(Swimlanes)

你可以使用管道符`|`来定义泳道。

还可以改变泳道的[颜色](https://plantuml.com/zh/color)。

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml \|Swimlane1\| start :foo1; \|#AntiqueWhite\|Swimlane2\| :foo2; :foo3; \|Swimlane1\| :foo4; \|Swimlane2\| :foo5; stop @enduml`<br><br>![](https://plantuml.com/imgw/img-50c4acb138d65f5b60373c2df8bed62e.png) |

你可以在泳道中增加 `if` 判断或 `repeat` 或 `while` 循环.

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml \|#pink\|Actor_For_red\| start if (color?) is (red) then #pink:**action red**; :foo1; else (not red) \|#lightgray\|Actor_For_no_red\| #lightgray:**action not red**; :foo2; endif \|Next_Actor\| #lightblue:foo3; :foo4; \|Final_Actor\| #palegreen:foo5; stop @enduml`<br><br>![](https://plantuml.com/imgw/img-b57ba90a0fd4090d36c626adc7cbc63f.png) |

你同样可以在泳道中增加别名，使用 `alias` 语法:

- `|[#<color>|]<swimlane_alias>| <swimlane_title>`

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml \|#palegreen\|f\| fisherman \|c\| cook \|#gold\|e\| eater \|f\| start :go fish; \|c\| :fry fish; \|e\| :eat fish; stop @enduml`<br><br>![](https://plantuml.com/imgw/img-3c110c8ebfe505c505385904094b949c.png) |

_[参考: [QA-2681](https://forum.plantuml.net/2681/possible-define-alias-swimlane-place-alias-everywhere-else?show=2685#a2685)]_




分离(detach)

可以使用关键字`detach` 或 `kill`移除箭头。

- `detach`

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml  :start;  fork    :foo1;    :foo2;  fork again    :foo3;    detach  endfork  if (foo4) then    :foo5;    detach  endif  :foo6;  detach  :foo7;  stop @enduml`<br><br>![](https://plantuml.com/imgw/img-e47e32f7fdd8137aa04da64d6213b154.png) |

- `kill`

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml  :start;  fork    :foo1;    :foo2;  fork again    :foo3;    kill  endfork  if (foo4) then    :foo5;    kill  endif  :foo6;  kill  :foo7;  stop @enduml`<br><br>![](https://plantuml.com/imgw/img-f8d0eeff06a3e20a118cd8e81ebddfe4.png) |




SDL（规范和描述语言）

### SDL 形状名称表

|   |   |   |
|---|---|---|
|**名称**|**旧语法**|**定型语法**|
|输入|`<`|`<<input>>`|
|输出|`>`|`<<output>>`|
|程序|`\|`|`<<procedure>>`|
|加载|`\`|`<<load>>`|
|保存|`/`|`<<save>>`|
|连续|`}`|`<<continuous>>`|
|任务|`]`|`<<task>>`|

_[Ref.[QA-11518](https://forum.plantuml.net/11518/issues-with-final-separator-latex-math-expression-activity?show=17268#a17268),[GH-1270](https://github.com/plantuml/plantuml/discussions/1270)]_

### SDL using final separator (Deprecated form)

通过更改最终`;` separator，可以为活动设置不同的渲染：

- `|`
- `<`
- `>`
- `/`
- `\\`
- `]`
- `}`

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml :Ready; :next(o)\| :Receiving; split  :nak(i)<  :ack(o)> split again  :ack(i)<  :next(o)  on several lines\|  :i := i + 1]  :ack(o)> split again  :err(i)<  :nak(o)> split again  :foo/ split again  :bar\\ split again  :i > 5} stop end split :finish; @enduml`<br><br>![](https://plantuml.com/imgw/img-f1ffafb3502c99a2d25a046905f6707d.png) |

### 使用正态分隔符和立体原型的 SDL（当前正式形式）

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start :SDL Shape; :input; <<input>> :output; <<output>> :procedure; <<procedure>> :load; <<load>> :save; <<save>> :continuous; <<continuous>> :task; <<task>> end @enduml`<br><br>![](https://plantuml.com/imgw/img-955cec44229bd7ee11ed35528c2303cf.png) |

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml :Ready; :next(o); <<procedure>> :Receiving; split  :nak(i); <<input>>  :ack(o); <<output>> split again  :ack(i); <<input>>  :next(o)  on several lines; <<procedure>>  :i := i + 1; <<task>>  :ack(o); <<output>> split again  :err(i); <<input>>  :nak(o); <<output>> split again  :foo; <<save>> split again  :bar; <<load>> split again  :i > 5; <<continuous>> stop end split :finish; @enduml`<br><br>![](https://plantuml.com/imgw/img-6358573390288b3be943ba1214761296.png) |

WARNING

 **This translation need to be updated.** 

WARNING




UML (Unified Modeling Language) Shape

### Table of UML Shape Name

|   |   |
|---|---|
|**Name**|**Stereotype syntax**|
|ObjectNode|`<<object>>`|
|ObjectNode  <br>typed by signal|`<<objectSignal>>` or `<<object-signal>>`|
|AcceptEventAction  <br>without TimeEvent trigger|`<<acceptEvent>>` or `<<accept-event>>`|
|AcceptEventAction  <br>with TimeEvent trigger|`<<timeEvent>>` or `<<time-event>>`|
|SendSignalAction  <br>  <br>SendObjectAction  <br>with signal type|`<<sendSignal>>` or `<<send-signal>>`|
|Trigger|`<<trigger>>`|

_[Ref. [GH-2185](https://github.com/plantuml/plantuml/pull/2185)]_

### UML Shape Example using Stereotype

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml :action; :object; <<object>>  :ObjectNode typed by signal; <<objectSignal>>  :AcceptEventAction without TimeEvent trigger; <<acceptEvent>>  :SendSignalAction; <<sendSignal>>  :SendObjectAction with signal type; <<sendSignal>>  :Trigger; <<trigger>>  :\t\t\t\t\t\tAcceptEventAction \t\t\t\t\t\twith TimeEvent trigger; <<timeEvent>> :an action; @enduml`<br><br>![](https://plantuml.com/imgw/img-37667ad6c98f1ae9ac6fb00c16996cee.png) |

_[Ref. [GH-2185](https://github.com/plantuml/plantuml/pull/2185), [QA-16558](https://forum.plantuml.net/16558), [GH-1659](https://github.com/plantuml/plantuml/issues/1659)]_




一个完整的例子

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml  start :ClickServlet.handleRequest(); :new page; if (Page.onSecurityCheck) then (true)   :Page.onInit();   if (isForward?) then (no)     :Process controls;     if (continue processing?) then (no)       stop     endif      if (isPost?) then (yes)       :Page.onPost();     else (no)       :Page.onGet();     endif     :Page.onRender();   endif else (false) endif  if (do redirect?) then (yes)   :redirect process; else   if (do forward?) then (yes)     :Forward request;   else (no)     :Render page template;   endif endif  stop  @enduml`<br><br>![](https://plantuml.com/imgw/img-927abd61d77e96a154444d21ee37c9d1.png) |




判断的样式

### inside 样式 (默认)

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam conditionStyle inside start repeat   :act1;   :act2; repeatwhile (<b>end) :act3; @enduml`<br><br>![](https://plantuml.com/imgw/img-a7245eaf5126ad101bd320e8d8c8849d.png) |

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start repeat   :act1;   :act2; repeatwhile (<b>end) :act3; @enduml`<br><br>![](https://plantuml.com/imgw/img-cfdb5c7381b468abd75863892624ce6d.png) |

### Diamond 样式

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam conditionStyle diamond start repeat   :act1;   :act2; repeatwhile (<b>end) :act3; @enduml`<br><br>![](https://plantuml.com/imgw/img-0a69081a9833608a4c3b67438bc9bd04.png) |

### InsideDiamond (或 _Foo1_) 样式

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam conditionStyle InsideDiamond start repeat   :act1;   :act2; repeatwhile (<b>end) :act3; @enduml`<br><br>![](https://plantuml.com/imgw/img-053f6e96a78b8c23e18fed082a21d788.png) |

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam conditionStyle foo1 start repeat   :act1;   :act2; repeatwhile (<b>end) :act3; @enduml`<br><br>![](https://plantuml.com/imgw/img-57a9af26cf31f2e56222aa0681d0b533.png) |

_[参考: [QA-1290](https://forum.plantuml.net/1290/plantuml-condition-rendering) and [#400](https://github.com/plantuml/plantuml/issues/400#issuecomment-721287124)]_




判断的结束样式

### Diamond 样式 (默认)

- With one branch

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ConditionEndStyle diamond :A; if (decision) then (yes)     :B1; else (no) endif :C; @enduml`<br><br>![](https://plantuml.com/imgw/img-9dca594e532ed723debbc0c913125f4d.png) |

- 两个分支 (`B1`, `B2`)

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ConditionEndStyle diamond :A; if (decision) then (yes)     :B1; else (no)     :B2; endif :C; @enduml @enduml`<br><br>![](https://plantuml.com/imgw/img-c297f819d0d71038fcdb97207de8982b.png) |

### 水平线 (hline) 样式

- 一个分

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ConditionEndStyle hline :A; if (decision) then (yes)     :B1; else (no) endif :C; @enduml`<br><br>![](https://plantuml.com/imgw/img-cbc29ac0dc7c32a400c6c23a6c6d4b7c.png) |

- 两个分支 (`B1`, `B2`)

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml skinparam ConditionEndStyle hline :A; if (decision) then (yes)     :B1; else (no)     :B2; endif :C; @enduml @enduml`<br><br>![](https://plantuml.com/imgw/img-ca37f7bd9c80aef51e7890dbf68af66c.png) |

_[Ref. [QA-4015](https://forum.plantuml.net/4015/its-possible-to-draw-if-else-endif-without-merge-symbol)]_




使用 sytle 定义 (全局) 样式

### 无样式 _(默认)_

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml start :init; -> test of color; if (color?) is (<color:red>red) then :print red; else  :print not red; note right: no color endif partition End { :end; } -> this is the end; end @enduml`<br><br>![](https://plantuml.com/imgw/img-45d91f53d8274d6855ea3abbbbe7c4a1.png) |

### 有样式

你可以使用 [style](https://plantuml.com/zh/style-evolution) 节点去定义样式然后改变渲染。

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml <style> activityDiagram {   BackgroundColor #33668E   BorderColor #33668E   FontColor #888   FontName arial    diamond {     BackgroundColor #ccf     LineColor #00FF00     FontColor green     FontName arial     FontSize 15   }   arrow {     FontColor gold     FontName arial     FontSize 15   }   partition {     LineColor red     FontColor green     RoundCorner 10     BackgroundColor PeachPuff   }   note {     FontColor Blue     LineColor Navy     BackgroundColor #ccf   } } document {    BackgroundColor transparent } </style> start :init; -> test of color; if (color?) is (<color:red>red) then :print red; else  :print not red; note right: no color endif partition End { :end; } -> this is the end; end @enduml`<br><br>![](https://plantuml.com/imgw/img-b71393d6d49d2c3da72d33eed85268c6.png) |




Emoji as action

You can use [emoji](https://plantuml.com/creole#68305e25f5788db0) as action, with the stereotype `<<icon>>`:

|      |                                                              |
| ---- | ------------------------------------------------------------ |
| <br> | `@startuml while (<:cloud_with_rain:>)   :<:umbrella:>; <<icon>> endwhile -<<icon>><:closed_umbrella:> @enduml`<br><br>![](https://plantuml.com/imgw/img-8fae25ebe50b677023127e714083eb75.png) |

