---
title: FlashDB

cover: https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_19_10_202408150919859.png
draft: true
categories: 
  - 嵌入式
tags:
  - RTOS
---



# 入门

## 裸机与RTOS

![裸机和RTOS](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_19_10_202408150919859.png)

![任务调度](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_20_31_202408150920114.png)

![image-20240815092108670](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_21_8_202408150921723.png)

![image-20240815092116112](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_21_16_202408150921159.png)

##  裸机和RTOS的特点

![裸机的特点](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_21_41_202408150921614.png)

![RTOS的特点](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_9_21_55_202408150921924.png)

##  基础知识

### 堆

堆就是一块空闲的内存，我们可以管理内存，我们可以从内存中取出一些数据，用完之后再释放（放回）

```c
char heap_buf[1024];        //空闲的内存，只要在上面实现内存的分配和释放，那么他就是一个堆
int pos = 0;        //定义一个位置指针

void *my_malloc(int size)        //分配内存
{
    int old_pos = pos;
    pos += size;
    return &heap_buf[pos];
}

void my_free(void *buf)
{
    //暂时无法实现
}

int main(void)
{
    char ch = 65;
    int i;
    char *buf = my_malloc(100);
    for(i = 0; i < 26; i++){
        buf[i] = 'A' + i;
    }
}
```

###  栈

栈是一块空闲的内存

==一个c函数的开头将会怎么处理栈？==

- 划分栈（用来保存LR等寄存器以及局部变量）
- LR寄存器等存入栈
- 执行代码

```c
int b_func(void)
{

}

int c_func(void)
{

}


int a_func(int val)
{
	int a = 8;
	a += val;
	b_func();
	c_func();
}

int main(void)
{
	a_func(46);        //当该函数执行完，需要返回一个下一个程序的执行地址，也就是下面的return0语句的地址
	return 0;
}
```

==一个函数执行完之后返回的地址保存在哪？==

main如何调用a_func

1. 首先将函数地址保存在某个寄存器中（LR link register），main函数在执行到a_func之前会将return 0 这个语句的地址保存在LR中，之后调用函数a_func
2. a_func掉用b_func前也需要将下一条语句的地址保存到LR中，之后调用b_func
3. 此时LR中的值就会被覆盖，解决方案是
   1. 在a_func内部，将LR中的值压入栈中
   2. 在b_func内部，将LR中的值压入栈中


函数的运行过程：

1. Main->a_func->b_func->c_func
2. 执行main，此时main函数自动划分出一个N字节的栈，将main的返回地址（即下一条语句地址）保存到LR中，此栈中保存main的LR等寄存器及局部变量，之后执行main函数
3. 调用a_func，此时a_func自动划分出一个M字节的栈，LR中保存a_func的返回地址，局部变量a也存放在此栈中
4. 调用b_func，此时b_func也自动划分出一个P字节的栈，LR中保存b_func的返回地址，此栈中保存b_func的LR寄存器及局部变量
5. 调用c_func，此时b_func也自动划分出一个R字节的栈，LR中保存c_func的返回地址，此栈中保存c_func的LR寄存器及局部变量，当执行完函数c的时候，将会取出自己的栈中的LR数据（返回地址），自动跳转到LR指向的地址运行

### 数据结构

####  数据类型

每个移植的版本都含有自己的portmacro.h头文件，里面定义了2个数据类型：

- TickType_t:
  - FreeRTOS配置了一个周期性的时钟中断：Tick Interrupt
  - 每发生一次中断，中断次数累加，这被称为tick count
  - tick count这个变量的类型就是TickType_t
  - TickType_t可以是16位的，也可以是32位的
  - FreeRTOSConfig.h中定义configUSE_16_BIT_TICKS时，TickType_t就是uint16_t
  - 否则TickType_t就是uint32_t
  - 对于32位架构，建议把TickType_t配置为uint32t
- BaseType_t:
  - 这是该架构最高效的数据类型
  - 32位架构中，它就是uint32t
  - 16位架构中，它就是uint16t
  - 8位架构中，它就是uint8t
  - BaseType_t通常用作简单的返回值的类型，还有逻辑值，比如pdTRUE/pdFALSE

#### 变量名

| 变量名前缀 | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| c          | char                                                         |
| s          | int16_t,short                                                |
| l          | int32_t,long                                                 |
| x          | BaseType_t,其他非标准的类型：结构体、task handle、queue handle等 |
| u          | unsigned                                                     |
| p          | 指针                                                         |
| uc         | uint8_t,unsigned char                                        |
| pc         | char指针                                                     |

#### 函数名

函数名的前缀有两个部分`返回类型 + 文件位置`

| 函数名前缀             | 含义                                |
| ----------------- | --------------------------------- |
| VTaskPrioritySet  | 返回值类型：void，在task.c中定义             |
| xQueueReceive     | 返回值类型：BaseType_t，在queue.c中定义      |
| pvTimerGetTimerID | 返回值类型：pointer to void，在timer.c中定义 |
## 任务调度

调度器就是使用相关的调度算法来决定当前需要执行的哪个任务，FreeRTOS一共支持三种任务调度方式：

1. *抢占式`调度`*：主要是针对优先级不同的任务，每个任务都有一个优先级，优先级高的任务可以抢占优先级低的任务。
2. *时间片`调度`*：主要针对优先级相同的任务，当多个任务的优先级相同时，任务调度器会在每一次系统时钟节拍到的时候切换任务。
3. *协程式`调度`*：当前执行任务将会一直运行，同时高优先级的任务不会抢占低优先级任务FreeRTOS:现在虽然还支持，但是官方已经表示不再更新协办程式调度

### 抢占式调度

运行条件：

1. 创建三个任务：Task1、Task2、Task3
2. Task1、Task2、Task3的优先级分别为1、2、3；在FreeRTOS中任务设置的数值越大，优先级越高，所以TASK3的优先级最高。

![抢占式调度](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_13_29_59_202408151329026.png)

运行过程如下：

1. 首先Task1在运行中，在这个过程中Task2就结了，在抢占式调度器的作用下Task2会抢占Task1的运行
2. Task2运行过程中，Task3就结了，在抢占式调度器的作用下Task3会抢占Task2的运行
3. Task3运行过程中，Task3阻塞了（系统延时或等待信号量等），此时就绪态中，优先级最高的任务Task2执行
4. Task3阻塞解除了（延时到了或者接收到信号量），此时Task3恢复到结态中，抢占TsK2的运行

> [!IMPORTANT]
>
> 高优先级任务，优先执行

### 时间片调度

运行条件：

1. 创建三个任务：Task1、Task2、Task3
2. Task1、Task2、Task3的优先级均为1；即3个任务同等优先级
   1. 同等优先级任务，轮流执行；时间片流转
   2. 一个时间片大小，取决为商答定时器中断周期
   3. 注意没有用完的时间片不会再使用，下次任务Tsk3得到执行还是按照一个时间片的时钟节拍运行

![时间片调度](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/08/15_13_34_20_202408151334963.png)

运行过程如下：

1. 首先Task1运行完一个时间片后，切换至Task2运行
2. Task2运行完一个时间片后，切换至Task3运行
3. Task3运行过程中（还不到一个时间片），Task3阻塞了（系统延时或等待信号量等），此时直接切换到下一个任务Tsk1
4. Task1运行完一个时间片后，切换至Task2运行

## 任务状态

RTOS中有四种运行状态：

1. 运行态：正在执行的任务，该任务就处于运行态，注意在STM32中，同一时间仅一个任务处于运行态
2. 就绪态：如果该任务已经能的够被执行，但当前还未被执行，那么该任务处于就绪态
3. 阻塞态：如果一个任务因延时或等待外部事件发生，那么这个任务就处于阻塞态
4. 挂起态:类似暂停，调用函数VTaskSuspend0进入挂起态，需要调用解挂函数VTask Resume()

任务切换基础：==tick中断==

时钟的滴答是周期性的，所以tick中断就是定时器的定时中断，每1ms（可以配置）产生一次中断，这里间隔的1ms就称为tick，同时将会记录发生中断的次数，这个计数值称为tick count，这是RTOS的==时钟基准==。

我们可以在FREERTOSConfig.h文件中配置定时器的中断时间，单位为ms

![配置文件](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/09/25_14_25_45_202409251425748.png)

四种任务状态之间的转换图:

![任务状态之间的转换图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/09/25_14_24_26_202409251424761.png)

> [!NOTE]
>
> 仅就绪态可转变成运行态
>
> 其他状态的任务想运行，必须先转变成就绪态

FreeRTOS中无非就四种状态，运行态，就绪态、阻塞态、挂起态

这四种状态中，除了运行态，其他三种任务状态的任务都有其对应如的任务状态列表

![任务状态列表](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/09/25_14_27_30_202409251427568.png)

32位的变量，当某个位置一时，代表所对应的优先级就绪列表有任务存在

![列表举例](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/09/25_14_28_29_202409251428020.png)

*==实验==*

```c

void Task1Function( void * param)
{
	TickType_t tickStart = xTaskGetTickCount();        //获得程序运行开始的tick count        
	TickType_t tickNow;        //获得当前的tick count        
	int flag = 0;
	while (1)
	{
		tickNow = xTaskGetTickCount();        //获得当前的tick count
		task1flagrun = 1; 
		task2flagrun = 0; 
		task3flagrun = 0; 
		printf("1");
		if(!flag && (tickNow > tickStart + 10)){
			vTaskSuspend(xHandeTask3);        //将task3变为挂起态，参数为NULL的时候，使自己为挂起态
			flag = 1;
		}
		if(tickNow > tickStart + 20){
			vTaskResume(xHandeTask3);        //将task3从挂起态唤醒，一旦挂起之后，只能通过别的任务进行唤醒
		}
	}
	
}

void Task2Function( void * param)
{
	while (1)
	{
		task1flagrun = 0; 
		task2flagrun = 1; 
		task3flagrun = 0; 
		printf("2");
		vTaskDelay(10);        //进入阻塞状态，这里的单位为tick
	}
	
}

void Task3Function( void * param)
{
	while (1)
	{
		task1flagrun = 0; 
		task2flagrun = 0; 
		task3flagrun = 1; 
		printf("3");
	}
}
```

# 移植系统

首先从[FreeRTOS/FreeRTOS: 'Classic' FreeRTOS distribution. Started as Git clone of FreeRTOS SourceForge SVN repo. Submodules the kernel. (github.com)](https://github.com/FreeRTOS/FreeRTOS)上下载文件。文件树为：

![freeRTOS文件树](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_8_28_26_202412230828226.png)



我们需要使用的源文件位于`FreeRTOS`中。

![FreeRTOS文件树](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_8_30_15_202412230830421.png)

1. Demo文件夹是官方给的例程，看官方给的例程可以看工程配置。

   ![Demo文件夹](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_8_35_10_202412230835029.png)

2. Source文件夹是FreeRTOS的核心源码

   ![source文件夹](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_8_34_12_202412230834860.png)

3. portable文件夹中是和硬件相关的架构代码，一般我们需要保留的是KEIL和MemMang，但是KEIL文件夹中显示和RVDS文件夹一样，所以我们还要保留RVDS文件夹

   ![image-20241223083421261](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_8_34_21_202412230834425.png)

移植步骤：

1. 添加FreeRTOS源码：将FreeRTOS源码添加至基础工程、头文件路径等
2. 添加配置文件：可以在Demo工程中复制一个FreeRTOSConfig.h出来，增加内存管理文件heap.c
3. 修改SYSTEM文件：修改SYSTEM文件中的sys.c、delay.c、usartc
4. 修改中断相关文件：修改Systick中断SVC中断、PendSV中断
5. 添加应用程序：验证移植是否成功



# 任务

## 任务的创建和删除

任务的创建和删除实际上就是调用FreeRTOS的API函数。

| API函数           | 描述             | 细节                                                         |
| ----------------- | ---------------- | ------------------------------------------------------------ |
| xTaskCreate       | 动态方式创建任务 | 任务的任务控制块以及任务的栈空间所需的内存，均由FreeRTOS从FreeRTOS管理的堆中分配 |
| xTaskCreateStatic | 静态方式创建任务 | 任务的任务控制块以及任务的栈空间所需的内存，需用户分配提供   |
| vTaskDelete       | 删除任务         |                                                              |

任务控制块的结构体类型为

```c
typedef struct tskTaskControlBlock
{
    volatile StackType_t 	*pxTopOfStack;							/*任务栈栈顶，必须为TCB的第一个成员*/
    Listltem_t				xStateListItem;							/*任务状态列表项*/
    Listltem_t  			xEventListItem;    						/*任务事件列表项*/
    UBaseType_t 			uxPriority;    							/*任务优先级，数值越大，优先级越大*/
    StackType_t				*pxStack;    							/*任务栈起始地址*/
    char 					pcTaskName[configMAX_TASK_NAME_LEN];	/*任务名字*/
    /*省略很多条件编译的成员*/
}tskTCB;
```

> [!tip]
>
> 任务栈栈顶，在任务切换时的任务上下文保存、任务恢复息息相关。
>
> 注意：每个任务都有属于自己的任务控制块，类似身份证



### 动态创建任务

函数API为:

```c
BaseType_t xTaskCreate
(
    TaskFunction_t					pxTaskCode,		/*指向任务函数的指针*/
    const char *const				pcName,			/*任务名字，最大长度configMAX_TASK_NAME_LEN*/
    const configSTACK_DEPTH_TYPE	usStackDepth,	/*任务堆栈大小，注意字为单位*/
    void* const						pvParameters,	/*传递给任务函数的参数*/
    UBaseType_t 					uxPriority,		/*任务优先级，范围：0~configMAX_PRIORITIES-1*/
    TaskHandle_t* const				pxCreatedTask	/*任务句柄，就是任务的任务控刮块*/
)
```

| 返回值                                | 描述         |
| ------------------------------------- | ------------ |
| pdPASS                                | 任务创建成功 |
| errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY | 任务创建失败 |

创建动态任务流程为：

1. 将宏configSUPPORT_DYNAMIC_ALLOCATION配置为1
2. 定义函数入口参数
3. 编写任务函数

此函数创建的任务会立刻进入就绪态，由任务调度器调度运行，动态创建任务函数内部实现为：

1. 申请堆栈内存&任务控制块内存
2. TCB结构体成员赋值
3. 添加新任务到就绪列表中

```c
void TaskGenericFunction( void * param)
{
    int value = (int)param;

    while (1)
    {
        printf("%d",value);
    }

}

int main(void)
{
    #ifdef DEBUG
    debug();
    #endif

    //初始化硬件
    prvSetupHardware();
    printf("hello word\r\n");

    //创建一个任务,RTOS的核心就是多任务
    xTaskCreate(Task1Function,"Task 1",100,NULL,1,&xHandeTask1);        //参数列表：处理任务的函数名，任务名称，栈深度，参数列表,优先级，句柄
    xTaskCreate(Task2Function,"Task 2",100,NULL,1,NULL);
    xTaskCreateStatic(Task3Function,"Task 3",100,NULL,1,xTask3Stack,&xTask3TCB);
    xTaskCreate(TaskGenericFunction,"Task 4",100,(void *)4,1,NULL);
    xTaskCreate(TaskGenericFunction,"Task 5",100,(void *)5,1,NULL);
    //进行任务调度
    vTaskStartScheduler();

    return 0;
}
```



### 静态创建任务

函数API为：



```c
TaskHandle_t xTaskCreateStatic
(
    TaskFunction_t    			pxTaskCode,		/*指向任务函数的指针*/
    const char 		const  		pcName,			/*任务函数名*/
    const uint32_t    			ulStackDepth,	/*任务堆栈大小注意字为单位*/
    void			*const    	pyParam eters,	/*传递的任务函数参数*/
    UBaseType_t 				uxPriority,		/*任务优先级*/
    StackType_t		*const    	puxStackBuffer,	/*任务堆栈，一般为数组，由用户分配*/
    StaticTask_t	*const    	pxTaskBuffer    /*任务控制块指针，由用户分配*/
)
```

| 返回值 | 描述                                 |
| ------ | ------------------------------------ |
| NUL    | 用户没有提供相应的内存，任务创建失败 |
| 其他值 | 任务句柄，任务创建成功               |

函数的创建流程为：

1. 需将宏configSUPPORT_STATIC_ALLOCATION配置为1

2. 定义空闲任务&定时器任务的任务堆栈及TCB

3. 实现两个接口函数:

   vApplicationGetTimerTaskMemory ()

   vApplicationGetldleTaskMemory()

4. 定义函数入口参数

5. 编写任务函数

此函数创建的任务会立刻进入就绪态，由任务调度器调度运行，内部实现为：

1. TCB结构体成员赋值
2. 添加新任务到惊就绪列表中

```c
//当我们使用静态分配栈和TCB结构时必须要实现该函数
StackType_t xIdleTaskStack[100];
StaticTask_t xIdleTaskTCB;

void vApplicationGetIdleTaskMemory( StaticTask_t ** ppxIdleTaskTCBBuffer,StackType_t** ppxIdleTaskStackBuffer,uint32_t * pulIdleTaskStackSize )
{
    *ppxIdleTaskTCBBuffer = &xIdleTaskTCB;
    *ppxIdleTaskStackBuffer = xIdleTaskStack;
    *pulIdleTaskStackSize = 100;
}

void Task3Function( void * param)
{
    while (1)
    {
        printf("3");
    }

}

int main(void)
{
    StackType_t xTask3Stack[100];
    StaticTask_t xTask3TCB;
    xTaskCreateStatic(Task3Function,"Task 3",100,NULL,1,xTask3Stack,&xTask3TCB);
	return 0;
}
```



### 删除任务

函数API为：

```c
void vTaskDelete (
    TaskHandle_t xTaskToDelete	/*待删除任务的任务句柄*/
);
```

> [!note]
>
> 用于删除已被创建的任务，被删除的任务将从就绪态任务列表、阻塞态任务列表、挂起态任务列表和事件列表中移除
>
> 1. 当传入的参数为NUL,则代表删除任务自身（当前正在运行的任务）
> 2. 空闲任务会负责释放被删除任务中由系统分配的内存，但是由用户在任务删除前申请的内存，则需要由用户在任务被删除前提前释放，否则将导致内存泄露

函数的删除流程为：

1. 使用删除任务函数，需将宏INCLUDE_vTaskDelete配置为1
2. 入口参数输入需要删除的任务句柄(NULL代表删除本身)

内部实现过程为：

1. 获取所要删除任务的控制块：通过传入的任务句柄，判断所需要删除哪个任务，NULL代表删除自身
2. 将被删除任务，移除所在列表：将该任务在所在列表中移除，包括：就绪、阻塞、挂起、事件等列表
3. 判断所需要删除的任务
   1. 删除任务自身，需先添加到等待删除列表，内存释放将在空闲任务执行
   2. 删除其他任务，释放内存，任务数量--
4. 
   更新下个任务的阻塞时间：更新下一个任务的阻塞超时时间，以防被删除的任务就是下一个阻塞超时的任务

```c
TaskHandle_t xHandeTask1;
int task1flagrun  = 0;        //用来表示任务1是否在运行
int task2flagrun  = 0;
int task3flagrun  = 0;

void Task1Function( void * param)
{
    while (1)
    {
        task1flagrun = 1; 
        task2flagrun = 0; 
        task3flagrun = 0; 
        printf("1");
    }

}

void Task2Function( void * param)
{
    int i = 0;
    while (1)
    {
        task1flagrun = 0; 
        task2flagrun = 1; 
        task3flagrun = 0; 
        printf("2");
        if(i++ == 100){
            vTaskDelete(xHandeTask1);        //杀死任务1，只需要操作任务1的handle即可
        }
        if(i == 200){
            vTaskDelete(NULL);        //参数使用NULL即可实现自杀
        }
    }

}

void Task3Function( void * param)
{
    while (1)
    {
        task1flagrun = 0; 
        task2flagrun = 0; 
        task3flagrun = 1; 
        printf("3");
    }

}


StackType_t xIdleTaskStack[100];
StaticTask_t xIdleTaskTCB;
void vApplicationGetIdleTaskMemory( StaticTask_t ** ppxIdleTaskTCBBuffer,StackType_t ** ppxIdleTaskStackBuffer,uint32_t * pulIdleTaskStackSize )
{
    *ppxIdleTaskTCBBuffer = &xIdleTaskTCB;
    *ppxIdleTaskStackBuffer = xIdleTaskStack;
    *pulIdleTaskStackSize = 100;
}

StackType_t xTask3Stack[100];
StaticTask_t xTask3TCB;
int main( void )
{
    #ifdef DEBUG
    debug();
    #endif

    //初始化硬件
    prvSetupHardware();
    printf("hello word\r\n");

    //创建一个任务,RTOS的核心就是多任务
    xTaskCreate(Task1Function,"Task 1",100,NULL,1,&xHandeTask1);        //参数列表：处理任务的函数名，任务名称，栈深度，参数列表,优先级，句柄
    xTaskCreate(Task2Function,"Task 2",100,NULL,1,NULL);

    xTaskCreateStatic(Task3Function,"Task 3",100,NULL,1,xTask3Stack,&xTask3TCB);        

    //进行任务调度
    vTaskStartScheduler();

    return 0;
}
```



## 任务的挂起和恢复

函数API：

| API函数              | 描述                     |
| -------------------- | ------------------------ |
| vTaskSuspend()       | 挂起任务                 |
| vTaskResume()        | 恢复被挂起的任务         |
| xTaskResumeFromISR() | 在中断中恢复被挂起的任务 |

- 挂起:挂起任务类似暂停，可恢复；删除任务，无法恢复，类似“人死两清
- 恢复:恢复被挂起的任务
- “FromlSR":带FromISR后缀是在中断函数中专用的API函数

### 任务的挂起

```c
void vTaskSuspend(
    TaskHandle_t xTaskToSuspend	/*待挂起任务的任务句柄*/
)
```

> [!note]
>
> 此函数用于挂起任务，使用时需将宏INCLUDE_vTaskSuspend配置为1。无论优先级如何，被挂起的任务都将不再被执行，直到任务被恢复。
>
> 当传入的参数为NULL,则代表挂起任务自身（当前正在运行的任务）

### 任务的恢复

#### 任务中恢复

```c
void vTaskSuspend(
    TaskHandle_t xTaskToSuspend	/*待挂起任务的任务句柄*/
)
```

> [!note]
>
> 使用该函数注意宏：INCLUDE_vTaskSuspend必须定义为1
>
> 注意：任务无论被VTaskSuspend()挂起多少次，只需在任务中调用vTaskToResume()恢复一次，就可以继续运行。且被恢复的任务会进入就绪态！

内部实现：

1. 获取所要挂起任务的控制块：通过传入的任务句柄，判断所需要挂起哪个任务，NULL代表挂起自身
2. 移除所在列表：将要挂起的任务从相应的状态列表和事件列表中移除（就绪或阻塞列表）
3. 插入挂起任务列表：将待挂起任务的任务状态列表向插入到挂起态任务列表末尾
4. 判断任务调度器是否运行：在运行，更新下一次阻塞时间，防止被挂起任务为下一次阻塞超时任务
5. 判断待挂起任务是否为当前任务：如果挂起的是任务自身，且调度器正在运行，需要进行一次任务切换，调度器没有运行，判挂起任务数是否等于任务总数，是：当前控利块赋值为NULL，否：寻找下一个最高优先级任务

#### 中断中恢复：

```c
BaseType_t xTaskResumeFromlSR(
    TaskHandle_t xTaskToResume	/*待恢复任务的任务句柄*/
);  
```

返回值为：

| 返回值  | 描述                         |
| ------- | ---------------------------- |
| pdTRUE  | 任务恢复后需要进行任务切换   |
| pdFALSE | 任务恢复后不需要进行任务切换 |



> [!note]
>
> 使用该函数注意宏：INCLUDE_vTaskSuspend和INCLUDE_xTaskResumeFromlSR必须定义为1
>
> 该函数专用于中断服务函数中，用于解挂被挂起任务。中断服务程序中要调用freeRTOS的API函数且中断优先级不能高于FreeRTOS所管理的最高优先级



内部实现：

1. 恢复任务不能是正在运行任务
2. 判断任务是否在挂起列表中是：就会将该任务在挂起列表中移除，将该任务添加到绪列表中
3. 判断恢复任务优先级：判断恢复的任务优先级是否大于当前正在运行的是的话执行任务切换

## 开启任务调度器

`vTaskStartScheduler()`：

作用：用于启动任务调度器，任务调度器启动后，FreeRTOS便会开始进行任务调度

该函数内部实现，如下：

1. 创建空闲任务
2. 如果使能软件定时器，则创建定时器任务
3. 关闭中断，防止调度器开启之前或过程中，受中断干扰，会在运行第一个任务时打开中断
4. 初始化全局变量，并将任务调度器的运行标志设置为已运行
5. 初始化任务运行时间统计功能的时基定时器
6. 调用函数`xPortStartScheduler()`

`xPortStartScheduler()`：

作用：该函数用于完成启动任务调度器中与硬件架构相关的配置部分，以及启动第一个任务

该函数内部实现，如下：

1. 检测用户在FreeRTOSConfig.h文件中对中的相关配置是否有误
2. 配置PendSV和SysTick的中断优先级为最低优先级
3. 调用函数`vPortSetupTimerlnterrupt()`配置SysTick
4. 初始化临界区嵌套计数器为0
5. 调用函数`prvEnableVFP()`使能FPU
6. 调用函数`prvStartFirstTask()`启动第一个任务

想象下应该如何启动第一个任务？

假设我们要启动的第一个任务是任务A,那么就需要将任务A的寄存器值恢复到CPU寄存器，（任务A的寄存器值，在一开始创建任务时就保存在任务堆栈里边！）

> [!note]
> 	
>
> 1. 中断产生时，硬件自动将xPSR,PC(R15),LR(R14),R12,R3-R0出/入栈；而R4~R11需要手动出/入栈
> 2. 进入中断后硬件会强制使用MSP指针，此时LR(R14)的值将会被自动被更新为特殊的EXC_RETURN

`prvStartFirstTask()`:

用于初始化启动第一个任务前的环境，主要是重新设置MSP指针，并使能全局中断

> [!tip] 
>
> 1. 什么是MSP指针？
>    程序在运行过程中需要一定的栈空间来保存局部变量等一些信息。当有信息保存到栈中时，MCU会自动更新SP指针，ARM Cortex-M内核提供了两个栈空间：
>
>    1. 主堆栈指针(MSP):它由OS内核、异常服务例程以及所有需要特权方问的应用程序代码来使用
>
>    2. 进程堆栈指针(PSP):用于常规的应用程序代码（不处于异常服务例程中时）。
>
>       > [!important]
>       >
>       > 在FreeRTOS中，中断使用MSP(主堆栈)，中断以外使用PSP(进程堆栈)
>
> 2. 为什么是0xE000ED08?
>    因为需从0xE000ED08获取向量表的偏移，为啥要获得向量表呢？因为向量表的第一个是MSP指针！
>    取MSP的初始值的思路是先根据向量表的位置寄存器VTOR(0xE000ED08)来获取向量表存储的地址，再根据向量表存储的地址，来访问第一个元素，也就是初始的MSP
>    CM3允许向量表重定位：从其它地址处开始定位各异常向量这个就是向量表偏移量寄存器，向量表的起始地址保存的就是主栈指针MSP的初始值实验

`vPortSVCHandler()`

当使能了全局中断，并且手动确触发SVC中断后，就会进入到SVC的中断服务函数中

1. 通过pxCurrentTCB获取优先级最高的绪态任务的任务栈地址，优先级最高的就绪态任务是系统将要运行的任务。

2. 通过任务的栈顶指针，将任务栈中的内容出栈到CPU寄存器中，任务栈中的内容在调用任务创建函数的时候，已初始化，然后设置PSP指针。

3. 通过往BASEPRI寄存器中写0，允许中断。

4. R14是链接寄存器LR,在ISR中（此刻我们在SVC的ISR中），它记录了异常返回值EXC_RETURN。而EXC RETURN只有6个合法的值(M4、M7)，如下表所示：

   | 描述                                 | 使用浮点单元 | 未使用浮点单元 |
   | ------------------------------------ | ------------ | -------------- |
   | 中断返回后进入Handler模式，并使用MSP | 0xFFFFFFE1   | 0xFFFFFFF1     |
   | 中断返回后进入线程模式，并使用MSP    | 0xFFFFFFE9   | 0xFFFFFFF9     |
   | 中断返回后进入线程模式，并使用 PSP   | 0xFFFFFFED   | 0xFFFFFFFD     |

> [!important]
>
> SVC中断只在启动第一次任务时会调用一次，以后均不调用

出入栈：

1. 出栈（恢复现场），方向：从下往上（低地址往高地址）：假设r0地址为0x04汇编指令示例：

   ```c
   ldmia r0!,{r4-r6}	/*任务栈r0地址由低到高，将r0存储地址里面的内容手动载到CPU寄存器r4、r5、r6*/
   
   r0地址(0x04内容加载到r4,此时地址r0=r0+4=0x08
   r0地址(0x08)内容加载到r5,此时地址r0=r0+4=0x0C
   r0地址(0x0C)内容加载到r6,此时地址r0=r0+4=0x10
   ```

2. 压栈（保存现场），方向：从上往下（高地址往低地址）：假设r0地址为0x10汇偏指令示例：

   ```c
   stmdb r0!,{r4-r6}}	/*r0的存储地址由高到低递咸，将r4、r5、r6里的内容存储到r0的任务栈里面。*/
   
   地址：r0=r0-4=0x0C,将r6的内容（寄存器值）存放到r0所指向地址(0x0C)
   地址：r0=r0-4=0x08,将r5的内容（寄存器值）存放到r0所指向地址(0x08)
   地址：r0=r0-4=0x04,将r4的内容（寄存器值）存放到0所指向地址(0x04)
   ```

现假设申请了堆，对于以下代码所申请的内存

```
头部 	| TCB1  | 头部 	| 100*4的栈大小   	|    头部 	| TCB2 	| 头部 	| 100*4的栈大小 	|   
         	 |----------------------------|            | -----------------------------------| 
		               Task1的栈                       				Task2的栈
          低地址<-----------高地址
|------------------------------------------|  			|-----------------------------------|    
        函数task1的占用堆             							     函数task2的占用堆
```

栈是高地址往下增长的，也就是从高地址往低地址，如果任务的栈中的数据过多将会破坏前面的头部

```c
xTaskCreate(Task1Function,"Task 1",100,NULL,1,&xHandeTask1);
xTaskCreate(Task2Function,"Task 2",100,NULL,1,NULL);

xTaskCreateStatic(Task3Function,"Task 3",100,NULL,1,xTask3Stack,&xTask3TCB);

xTaskCreate(TaskGenericFunction,"Task 4",100,(void *)4,1,NULL);
xTaskCreate(TaskGenericFunction,"Task 5",100,(void *)5,1,NULL);


void Task1Function( void * param)
{
	volatile char buf[500];        //该局部变量保存在栈中，然而我们申请的栈大小为100 * 4，所以栈空间大小将会被破坏

	while (1)
	{
		task1flagrun = 1; 
		task2flagrun = 0; 
		task3flagrun = 0; 
		printf("1");
		for (int i = 0; i < 500; i++)
		{
			buf[i] = 0;
		}
		
	}
	
}
	

```

![栈大小实验](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_10_52_38_202412231052787.png)



```c

void Task1Function( void * param)
{
    while (1)
    {
        printf("1");
    }
    
}

void Task2Function( void * param)
{
    while (1)
    {
        printf("2");
    }
    
}

int main( void )
{
#ifdef DEBUG
  debug();
#endif
    //初始化硬件
    prvSetupHardware();
    //创建一个任务,RTOS的核心就是多任务
    TaskHandle_t xHandeTask1;
    xTaskCreate(Task1Function,"Task 1",100,NULL,1,&xHandeTask1);    //参数列表：处理任务的函数名，任务名称，栈深度，参数列表,优先级，句柄
    xTaskCreate(Task2Function,"Task 1",100,NULL,1,NULL);
    //进行任务调度
    vTaskStartScheduler();
    return 0;
}
```



## 延时函数

接口API函数为：

```c
vTaskDelay(int counter)	/*相对延时，至少要等待指定个数的Tick Interrupt才能变为就绪态*/
vTaskDelayUntil(TickType_t baseTick,int counter)	/*绝对延时，等待到指定的绝对时刻才能变为就绪态*/
```

> [!important]
>
> 相对延时：指每次延时都是从执行函数VTaskDelay()开始，直到延时指定的时间结束
>
> 绝对延时：指将整个任务的运行周期看成一个整体，适用于需要按照一定频率运行的任务

![延时实验](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_13_52_19_202412231352486.png)

```c
static int rands[] = {3,56,23,5,99};
void Task1Function( void * param)
{
    TickType_t tStart = xTaskGetTickCount();
    int j = 0;
    while (1)
    {
        task1flagrun = 1; 
        task2flagrun = 0; 
        task3flagrun = 0; 
        for (int i = 0; i < rands[j]; i++)        //执行任务的时间是不固定的
        {
            printf("1");
        }
        j++;
        if(j == 5)
            j = 0;
        //使用两个不同的延时函数,vTaskDelayUntil是周期性的执行可以理解为绝对延迟，vTaskDelay就是相对性的延迟
        vTaskDelayUntil(&tStart,20);        //这里会延时20个tick，并且延时之后还会将当前的tick count赋值给tStart，这是一个周期性的
        // vTaskDelay(20);        //延时函数，单位为tick，能够保证这一次到下一次启动的时间一样，但休眠时间不一样
    }

}


```



## 空闲任务及钩子函数

- 删除任务后的清理工作，是在空闲任务中完成的，也就是说如果一个任务自杀，他就不能完成清理工作，依旧保持着内存的占用，所以需要在空闲任务中进行杀死
- 空闲任务会在main的任务调度器中自行创建，我们也可以使用fork（钩子）函数进行创建
- 空闲任务只能处于两个状态中的一个：running和ready
- 空闲任务钩子函数
  - 执行一些低优先级、后台的、需要连续执行的函数
  - 测量系统的空闲时间：空闲任务能被执行就意味着所有的高优先级的任务都停止了，所以测量空闲任务占据的时间，就可以算出处理器占用率
  - 让系统进入省电模式：空闲任务能被执行就意味着没有重要的事情要做，当然可以进入省电模式了
  - 据对不能导致任务进入blocked和suspended状态
  - 如果使用xTsakDelete函数来删除任务，那么钩子函数要非常高效地执行，如果空闲任务一直卡在钩子函数里的话，他就无法释放内存，所以钩子函数只能处于运行状态和就绪状态

```c
void Task2Function( void * param);
static int rands[] = {3,56,23,5,99};
void Task1Function( void * param)
{
    TickType_t tStart = xTaskGetTickCount();
    BaseType_t xReturn;        

    while (1)
    {
        //在任务1中创建任务2，这里的优先级为2，一旦task1执行，那么task2就不会再执行，所以如果想要task1也执行，那么就需要在task2中进行操作
        xReturn = xTaskCreate(Task2Function,"Task 2",100,NULL,2,&xHandeTask2);
        if(xReturn != pdPASS){
            printf("taks 2 create error\r\n");
        }
        //在这个循环中不断生成Taks2，且不断清理，这个时候程序是可以正常运行的，但是如果将这句话放到task2中，task2自杀之后，并没有任务清理task2的内存占用，所以如果还继续生成任务2的话，将会打印生成错误
        //所以当删除一个任务之后需要一个空闲任务（idle task）来进行内存的清理，但是实际上，我们并没有创建空闲任务，其实是在main函数的任务调度器中创建了一个空闲任务
        vTaskDelete(xHandeTask2);        
        task1flagrun = 1; 
        task2flagrun = 0; 
        task3flagrun = 0; 
        printf("1");

    }

}

void Task2Function( void * param)
{
    while (1)
    {
        task1flagrun = 0; 
        task2flagrun = 1; 
        task3flagrun = 0; 
        printf("2");
        vTaskDelay(2);        //这里让task2休息一会，这样task1才能继续执行
    }

}
```

当我们想要使用钩子函数创建空闲任务的时候，我们首先需要定义#define configUSE_IDLE_HOOK 1，还需要重写vApplicationIdleHook函数

```c
void vApplicationIdleHook(void)
{
	task1flagrun = 0; 
	task2flagrun = 0; 
	task3flagrun = 0; 
	taskidlerun = 1; 
	printf("0");
}
```

## 任务调度算法

### 任务切换

==任务切换的本质：CPU寄存器的切换。==

假设当由任务A切换到任务B时，主要分为两步：

1. 需暂停任务A的执行，并将此时任务A的寄存器保存到任务堆栈，这个过程叫做保存现场；
2. 将任务B的各个寄存器值（被存于任务堆栈中）恢复到CPU寄存器中，这个过程叫做恢复现场；

> [!tip] 
>
> 对任务A保存现场，对任务B恢复现场，这个整体的过程称之为：上下文切换
>
> ==任务切换的过程再PendSV中断服务函数里边完成的==，那么PendSV中断是如何触发的？
>
> 1. 滴答定时器中断调用
> 2. 执行FreeRTOS提供的相关API函数：portYIELD()
>
> 本质：通过向中断控制和状态寄存器ICSR的bit28写入1，挂起PendSV来启动PendSV中断
>
> | 位段  | 名称           | 类型 | 复位值 | 描述                                                         |
> | ----- | -------------- | ---- | ------ | ------------------------------------------------------------ |
> | 31    | NMIPENDSET     | R/W  | 0      | 写1以悬起NMI。因为NMI的优先级最高且从不掩藏，在置位此位后将立即进入NMI服务例程。 |
> | 28    | PENDSVSET      | R/W  |        | 写1以悬起 PendSV，读取它则返回 PendSV的状 态                 |
> | 27    | PENDSVCLR      | W    | 0      | 写1以清除PendSV悬起状态                                      |
> | 26    | PENDS          | R/W  | 0      | 写1以悬起SysTick。读取它则返回 PendSV的状态                  |
> | 25    | PENDSTCL       | W    | 0      | 写1以清除 SysTick悬起状态                                    |
> | 23    | ISRPREEMP      | R    | 0      | 为1时，则表示一个悬起的中断将在下一步时进 入活动状态（用于单步执行时的调试目的） |
> | 22    | ISRPENDING     | R    | 0      | 1=当前正有外部中断被悬起（不包括NMI）                        |
> | 21:12 | VECTPEND NDING | R    | 0      | 悬起的ISR的编号。如果不止一个中断悬起，则 它的值是这引动中断中，优先级最高的那一个。 |
> | 11    | RETTOBASE      | R    | 0      | 如果异常返回后将回到基级(baselevel),并且没有 其它异常悬起时，此位为1。若是在线程模式下， 在某个服务例程中，有不止一级的异常处于活动 状态，或者在异常没有活动时执行了异常服务例 程（此时执行返回指令将产生aut。此乃高危行 为，大虾也需慎用），则此位为0 |
> | 9:0   | VECTACTIVE     | R    | 0      | 当前活动的ISR编号，该位段指出当前运行中的ISR 是哪个中断的（提供异常序号），包括NMI和硬 fault。如果多个异常共享一个服务例程，该例程可根据 本位段的值来判定是哪一个异常的响应导致它的执行。把 本位段的值减去16,就得到了外中断的编号，并可以用此 编号来操作外中断相关的使能/除能等寄存器。 |

![上下文切换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_14_7_47_202412231407666.png)

> [!important]
>
> 阻塞态的任务等待事件的触发，当事件发生之后，该任务就会变为就绪态
>
> 时间相关的事件:
>
> 1. 所谓事件相关的事件，就是设置超时时间，在指定时间内阻塞，时间到了就进入就绪态
> 2. 使用时间相关的事件，可以实现周期性的功能、可以实现超时功能
>
> 同步事件:同步事件就是某个任务在等待某些信息，别的任务或者中断服务程序会给它发送信息
>
> 发送信息的方法:
>
> 1. 任务通知（task notification）
> 2. 队列（queue）
> 3. 事件组（event group）
> 4. 信号量（semaphone）
> 5. 互斥量（mutex）

### 最高优先级任务

```c
vTaskSwitchContext();	/*查找最高优先级任务*/

taskSELECT_HIGHEST_PRIORITY_TASK();	/*通过这个函数完成*/
#define taskSELECT_HIGHEST_PRIORITY_TASK()
\{
\    UBaseType t uxTopPriority;
\    portGET_HIGHEST_PRIORITY(uxTopPriority,ux TopReady Priority )
\    configASSERT(listCURRENT LIST LENGTH(&(pxReadyTasksLists[uxTopPriority ]))>0);
\    listGET OWNER_OF NEXT_ENTRY(pxCurrentTCB,&pxReady TasksLists[uxTopPriority ]))
\}
```

#### 前导置零指令

```c
#define portGET_HIGHEST_PRIORITY(uxTopPriority,uxReadyPriorities)
uxTopPriority =(31UL-(uint32_t)_clz((uxReadyPriorities)))
```

![前导置零指令](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_14_56_21_202412231456767.png)

所谓的前导置零指令，大家可以简单理解为计算一个32位数，头部0的个数，==通过前导置零指令获得最高优先级==

#### 获取最高优先级任务控制块

通过以下函数可以获取当前最高优先级任务的任务控制块。

```c
#define listGET_OWNER_OF_NEXT_ENTRY(pxTCB,pxList)
\{
\	List_t *const pxConstList = (pxList)
\	(pxConstList)->pxIndex) = (pxConstList)->pxIndex->pxNext;
\	if((void *)pxConstList)->pxIndex == (void *)&(pxConstList )->xListEnd)
\	{
\     	(pxConstList)->pxIndex = (pxConstList)->pxlndex->pxNext;
\	}
\	(pxTCB) = (pxConstList)->pxlndex->pvOwner;
\}
```

![image-20241223150012050](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_15_0_12_202412231500428.png)



### 时间片调度

同等优先级任务轮流地享有相同的CPU时间（可设置)，叫时间片，在FreeRTOS中，一个时间片就等于SysTick中断周期

![时间片调度](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_15_8_15_202412231508320.png)

运行条件：

1. 创建三个任务：Task1、Task2、Task3
2. Task1、Task2、Task3的优先级均为1；即3个任务同等优先级
3. 同等优先级任务，轮流执行：时间片流转
4. 一个时间片大小，取决为滴答定时器中断频率
5. 注意没有用完的时间片不会再使用，下次任务Tsk3得到执行还是按照一个时间片的时钟节拍运行

运行过程如下：

1. 首先Task1运行完一个时间片后，切换至Task2运行
2. Task2运行完一个时间片后，切换至Task3运行
3. Task3运行过程中（还不到一个时间片），Task3阻塞了（系统延时或等待信号量等），此时直接切换到下一个任务Task1
4. Task1运行完一个时间片后，切换至Task2运行

当3个任务的优先级相同时，三个任务轮流执行

![优先级相同时，任务调度状况](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_10_46_24_202412231046650.png)

当3个任务的优先级不同时，只要高优先级的任务没有放弃运行，低优先级的任务就不会运行

![优先级不同时，任务调度情况](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/23_10_47_12_202412231047372.png)

# 同步和互斥通信

> 一句话理解同步与互斥：我等你用完厕所，我再用厕所。
>
> 什么叫同步？就是：哎哎哎，我正在用厕所，你等会。
>
> 什么叫互斥？就是：哎哎哎，我正在用厕所，你不能进来。
>
> 同步与互斥经常放在一起讲，是因为它们之的关系很大，“互斥”操作可以使用“同步”来实现。我“等”你用完厕所，我再用厕所。这不就是用“同步”来实现“互斥”吗？

假设有A、B两人早起抢厕所，A先行一步占用了；B慢了一步，于是就眯一会：当A用完后叫醒B,B也就愉快地上厕所了。

在这个过程中，A、B是互斥地访问“厕所”，“厕所”被称之为临界资源。我们使用了“休眠-唤醒”的同步机制实现了“临界资源”的“互斥访问”。

```c
void 抢厕所(void)
{
    if(有人在用)
    {
        我眯一会； 
    }
    用厕所;
    喂，醒醒，有人要用厕所吗；
}
```

## 自定义实现同步

虽然这样可以实现同步，但是当task1在执行的过程中，task2也在一直消耗cpu的资源，将会降低task1的计算速度。

```c
int sum = 0;
volatile int flagCalEnd = 0;

void Task1Function( void * param)
{
    volatile int i = 0;        //故意使执行时间变长
    while (1)
    {
        for(i = 0; i < 1000000; i++ ){
            sum++;
        }
        flagCalEnd++;        //表示计算完成
        vTaskDelete(NULL);
    }
}

void Task2Function( void * param)
{
    while (1)
    {
        if(flagCalEnd)
            printf("sum = %d\r\n",sum);
    }
}
```



## 自定义实现互斥

这里使用的printf就是互斥变量，当task3打印字符的时候，task4会进行打断，同理task4也会被task3打断，这时候打印的字符串就不连串了

```c
xTaskCreate(TaskGenericFunction,"Task 3",100,"Task3 is running",1,NULL);
xTaskCreate(TaskGenericFunction,"Task 4",100,"Task4 is running",1,NULL);

void TaskGenericFunction( void * param)
{
    while (1)
    {        
        printf("%s\r\n",(char *)param);
    }

}
```

实验输出为：

```text
Task4 is ruTask3 is runnning
Taskining
is runningrunning
Task4 is ruTask3 is runnning
Task4ning
is runningrunning
Task4 is ruTask3 is runnning
Task4ning
is Runningrunn1ng
Task4 is ruTask3 is runnning
```

我们可以设置一个互斥变量，使得串口互斥的运行

```c
int flagUartUsed = 0;

void TaskGenericFunction( void * param)
{
	while (1)
	{        
		if(!flagUartUsed){
			flagUartUsed = 1;
			printf("%s\r\n",(char *)param);
			flagUartUsed = 0;
		}
	}
	
}
```

实验输出为：

```
Task4 is running
Task3 is running
Task4 is running
Task3 is running
Task4 is running
Task3 is running
Task4 is runn1ng
Task3 is running
Task4 is running
Task3 is running
Task4 is running
```

但实际上这样写是有隐患的，当task3执行到printf之前，且task4也执行到pintf之前，这个时候两个任务的都会卡死

## FreeRTOS实现

能实现同步、互斥的内核方法有：任务通知(task notification)、队列(queue)、事件组(event group)、信号量(semaphoe)、互斥量(mutex)。

| 内核对象 | 生产者     | 消费者 | 数据/状态                                                    | 说明                                                         |
| -------- | ---------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 队列     | ALL        | ALL    | 数据：若干个数据 谁都可以往队列里扔数据， 谁都可以从队列里读数据 | 用来传递数据， 发送者、接收者无限制， 一个数据只能唤醒一个接 收者 |
| 事件组   | ALL        | ALL    | 多个位：或、与 谁都可以设置[生产)多个位， 谁都可以等待某个位、若干个 位 | 用来传递事件， 可以是N个事件， 发送者、接受者无限制， 可以唤醒多个接收者：像 广播 |
| 信号量   | ALL        | ALL    | 数量：0~n 谁都可以增加一个数量， 谁都可消耗一个数量          | 用来维持资源的个数， 生产者、消费者无限制， 1 个资源只能唤醒1个接 收者 |
| 任务通知 | ALL        | 只有我 | 数据、状态都可以传输， 使用任务通知时， 必须指定接受者       | N 对1的关系: 发送者无限制， 接收者只能是这个任务             |
| 互斥量   | 只能A 开锁 | A上锁  | 位：0、1 我上锁：1变为0, 只能由我开锁：0变为1                | 就像一个空厕所, 谁使用谁上锁， 也只能由他开锁                |

1. 队列：

   里面可以放任意数据，可以放多个数据

   任务、 ISR 都可以放入数据；任务、 ISR 都可以从中读出数据

2.  事件组：

    一个事件用一 bit 表示， 1 表示事件发生了， 0 表示事件没发生

    可以用来表示事件、事件的组合发生了，不能传递数据

    有广播效果：事件或事件的组合发生了，等待它的多个任务都会被唤醒

3. 信号量：

    核心是"计数值"

    任务、 ISR 释放信号量时让计数值加 1

    任务、 ISR 获得信号量时，让计数值减 1

4.  任务通知：

    核心是任务的 TCB 里的数值

    会被覆盖

    发通知给谁？必须指定接收任务

    只能由接收任务本身获取该通知

5. 互斥量：

    数值只有 0 或 1

    谁获得互斥量，就必须由谁释放同一个互斥量

![FreeRTOS的同步互斥的方法](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/25_16_44_30_202412251644239.png)

# 队列

## 常规操作

==左边可以看作是生产者，右边是消费者，队列可以看作是一个传送带==

队列的简化操如入下图所示，从此图可知：

- 队列可以包含若干个数据：队列中有若干项，这被称为"长度"(length)
- 每个数据大小固定
- 创建队列时就要指定长度、数据大小
- 数据的操作采用先进先出的方法(FIFO，First In First Out)：写数据时放到尾部，读数据时从头部读
- 也可以强制写队列头部：覆盖头部数据

![队列常规操作](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/25_16_50_26_202412251650174.png)

==队列先入先出，从队尾入队，队头出队，使用环形缓冲区实现==，更详细的：

![队列详细过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/25_16_51_28_202412251651103.png)

## 传输数据

使用队列传输数据时有两种方法：

- 拷贝：把数据、把变量的值复制进队列里
- 引用：把数据、把变量的地址复制进队列里

FreeRTOS使用拷贝值的方法，这更简单：

- 局部变量的值可以发送到队列中，后续即使函数退出、局部变量被回收，也不会影响队列中的数据无需分配
- buffer来保存数据，队列中有buffer
- 局部变量可以马上再次使用
- 发送任务、接收任务解耦：接收任务不需要知道这数据是谁的、也不需要发送任务来释放数据如果数据实在太大，你还是可以使用队列传输它的地址
- 队列的空间有FreeRTOS内核分配，无需任务操心
- 对于有内存保护功能的系统，如果队列使用引用方法，也就是使用地址，必须确保双方任务对这个地址都有访问权限。使用拷贝方法时，则无此限制：内核有足够的权限，把数据复制进队列、再把数据复制出队列。

## 队列的阻塞访问

只要知道队列的句柄，谁都可以读、写该队列。任务、ISR都可读、写队列。可以多个任务读写队列。

任务读写队列时，简单地说：如果读写不成功，则阻塞；可以指定超时时间。

> [!tip]
>
> 口语化地说，就是可以定个闹钟：如果能读写了就马上进入就绪态，否则就阻塞直到超时。

某个任务读队列时，如果队列没有数据，则该任务可以进入阻塞状态：还可以指定阻塞的时间。如果队列有数据了，则该阻塞的任务会变为就绪态。如果一直都没有数据，则时间到之后它也会进入就绪态。

既然读取队列的任务个数没有限制，那么当多个任务读取空队列时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的数据。当队列中有数据时，哪个任务会进入就绪态？

- 优先级最高的任务
- 如果大家的优先级相同，那等待时间最久的任务会进入就绪态

跟读队列类似，一个任务要写队列时，如果队列满了，该任务也可以进入阻塞状态：还可以指定阻塞的时间。如果队列有空间了，则该阻塞的任务会变为就绪态。如果一直都没有空间，则时间到之后它也会进入就绪态。

既然写队列的任务个数没有限制，那么当多个任务写"满队列"时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的空间。当队列中有空间时，哪个任务会进入就绪态？

- 优先级最高的任务
- 如果大家的优先级相同，那等待时间最久的任务会进入就绪态

## 队列函数

### 创建

队列的创建有两种方法：

1. 动态分配内存

   动态分配内存：xQueueCreate，队列的内存在函数内部动态分配，函数原型如下：

   ```c
   QueueHandle_t xQueuecreate(UBaseType_t uxQueueLength,UBaseType_t uxItemsize);
   ```

   | 参数          | 说明                                                         |
   | ------------- | ------------------------------------------------------------ |
   | uxQueueLength | 队列长度，最多能存放多少个数据(item)                         |
   | uxltemSize    | 每个数据(item)的大小：以字节为单位                           |
   | 返回值        | 非0：成功，返回句柄，以后使用句柄来操作队列 <br>NULL：失败，因为内存不足 |

2. 静态分配内存  :xQueueCreateStatic，队列的内存要事先分配好,函数原型如下：  

   ```c
   QueueHandle_t xQueuecreatestatic(
       UBaseType_t uxQueueLength,
       UBaseType_t uxItemsize,
       uint8_t *pucQueuestorageBuffer,
       StaticQueue_t *pxQueueBuffer
   );
   ```

   | 参数                  | 说明                                                         |
   | --------------------- | ------------------------------------------------------------ |
   | uxQueueLength         | 队列长度，最多能存放多少个数据(item)                         |
   | uxltemSize            | 每个数据(item)的大小：以字节为单位                           |
   | pucQueueStorageBuffer | 如果uxltemSize非O，pucQueueStorageBuffer必须指向一个 uint8_t数组, 此数组大小至少为"uxQueueLength *uxltemSize" |
   | pxQueueBuffer         | 必须执行一个StaticQueue_t结构体，用来保存队列的数据结构      |
   | 返回值                | 非0：成功，返回句柄，以后使用句柄来操作队列<br>NULL：失败，因为pxQueueBuffer为NULL |

示例：

```c
#define QUEUE_LENGTH 10
#define ITEM_SIZE sizeof(uint32_t）

//xQueueBuffer用来保存队列结构体
StaticQueue_t xQueueBuffer;

//ucQueuestorage用来保存队列的数据
//大小为：队列长度*数据大小
uint8_t ucQueuestorage[QUEUE_LENGTH ITEM_SIZE];
void vATask(void *pvParameters)
{
    QueueHandle_t xQueue1;

    //创建队列：可以容纳QUEUE_LENGTH个数据，每个数据大小是ITEM_SIZE
    xQueue1 =  xQueuecreatestatic(QUEUE_LENGTH,
                                  ITEM_SIZE,
                                  ucQueuestorage,
                                  &xQueueBuffer);
}
```

### 复位

队列刚被创建时，里面没有数据；使用过程中可以调用 xQueueReset() 把队列恢复为初始状态，此函数原型为：  

```c
/*	pxQueue:复位哪个队列；
	返回值：pdPASS(必定成功)
*/
BaseType_t xQueueReset(QueueHandle_t pxQueue);
```

### 删除

删除队列的函数为 vQueueDelete() ，只能删除使用动态方法创建的队列，它会释放内存。原型如下：  

```c
void vQueueDelete(QueueHandle_t xQueue);
```

### 写队列

可以把数据写到队列头部，也可以写到尾部，这些函数有两个版本：在任务中使用、在ISR中使用。函数原型如下：  

```c
/*	等同于xQueueSendToBack
	往队列尾部写入数据，如果没有空间，阻塞时间为xTicksTowait
*/
BaseType_t xQueuesend(
    QueueHandle_t	xQueue,
    const void		*pvItemToQueue,
    TickType_t	    xTicksTowait
);

/*
	往队列尾部写入数据，如果没有空间，阻塞时间为xTicksTowait
*/
BaseType_t xQueuesendToBack(
    QueueHandle_t	xQueue,
    const void	    *pvItemToQueue,
    TickType_t	    xTicksTowait
);

/*
	往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
*/
BaseType_t xQueuesendToBackFromISR(
    QueueHandle_t xQueue,
    const void *pvItemToQueue,
    BaseType_t *pxHigherpriorityTaskwoken
);

/*
    往队列头部写入数据，如果没有空间，阻塞时间为xTicksTowait
*/
BaseType_t xQueuesendToFront(
    QueueHandle_t	xQueue,
    const void	    *pvItemToQueue,
    TickType_t	    xTicksTowait
);

/*
    往队列头部写入数据，此函数可以在中断函数中使用，不可阻塞
*/
BaseType_t xQueuesendToFrontFromISR(
    QueueHandle_t 	xQueue,
    const void 		*pvItemToQueue,
    BaseType_t 		*pxHigherPriorityTaskwoken
)；
```



| 参数          | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| xQueue        | 队列句柄，要写哪个队列                                       |
| pvltemToQueue | 数据指针，这个数据的值会被复制进队列， 复制多大的数据？在创建队列时已经指定了数据大小 |
| xTicksToWait  | 如果队列满则无法写入新数据，可以让任务进入阻塞状态， xTicksToWait表示阻塞的最大时间(Tick Count)。 如果被设为0，无法写入数据时函数会立刻返回; 如果被设为portMAX_DELAY，则会一直阻塞直到有空间可写 |
| 返回值        | pdPASS：数据成功写入了队列<br>errQUEUE_FULL：写入失败，因为队列满了。 |

### 读队列

使用 xQueueReceive() 函数读队列，读到一个数据后，队列中该数据会被移除。这个函数有两个版本：在任务中使用、在ISR中使用。函数原型如下  ：

```c
BaseType_t xQueueReceive(QueueHandle_t xQueue,
                         void* const pvBuffer,
                         TickType_t xTicksTowait
                        );
BaseType_t xQueueReceiveFromISR(
    QueueHandle_t	xQueue,
    void		    *pvBuffer,
    BaseType_t	    *pxTaskwoken);
```



| 参数         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| xQueue       | 队列句柄，要读哪个队列                                       |
| pvBuffer     | bufer指针，队列的数据会被复制到这个buffer 复制多大的数据？在创建队列时已经指定了数据大小 |
| xTicksToWait | 果队列空则无法读出数据，可以让任务进入阻塞状态， xTicksToWait表示阻塞的最大时间(Tick Count)。 如果被设为0，无法读出数据时函数会立刻返回; 如果被设为portMAX_DELAY，则会一直阻塞直到有数据可写 |
| 返回值       | pdPASS：从队列读出数据入 <br>errQUEUE_EMPTY：读取失败，因为队列空了。 |

### 查询

可以查询队列中有多少个数据、有多少空余空间。函数原型如下：  

```c
/*
	返回队列中可用数据的个数
*/
UBaseType_t uxQueueMessageswaiting(const QueueHandle_t xQueue );
/*
	返回队列中可用空间的个数
*/
UBaseType_t uxQueueSpacesAvailable(const QueueHandle_t xQueue );
```



### 覆盖



当队列长度为1时，可以使用 xQueueOverwrite() 或 xQueueOverwriteFromISR() 来覆盖数据。注意，队列长度必须为1。当队列满时，这些函数会覆盖里面的数据，这也意味着这些函数不会被阻塞。函数原型如下：

```c
/*
	覆盖队列
	xQueue:写哪个队列
	pvItemToQueue:数据地址
	返回值：pdTRUE表示成功，pdFALSE表示失败
*/
BaseType_t xQueueoverwrite(
    QueueHandle_t xQueue,
    const void pvItemToQueue
);

BaseType_t xQueueoverwriteFromISR(
    QueueHandle_t xQueue,
    const void pvItemToQueue,
    BaseType_t *pxHigherPriorityTaskwoken
);
```

### 窥视

如果想让队列中的数据供多方读取，也就是说读取时不要移除数据，要留给后来人。那么可以使用"窥视"，也就是 xQueuePeek() 或 xQueuePeekFromISR() 。这些函数会从队列中复制出数据，但是不移除数据。这也意味着，如果队列中没有数据，那么"偷看"时会导致阻塞；一旦队列中有数据，以后每次"偷看"都会成功。函数原型如下：

```c
/*	偷看队列
	xQueue:偷看哪个队列
	pvItemToQueue:数据地址，用来保存复制出来的数据
	xTicksTowait:没有数据的话阻塞一会
	返回值：pdTRUE表示成功，pdFALSE表示失败
*/
BaseType_t xQueuePeek(
    QueueHandle_t xQueue,
    void* const pvBuffer,
    TickType_t xTicksTowait
);
BaseType_t xQueuePeekFromISR(
    QueueHandle_t xQueue,
    void *pvBuffer,
);
```

## 示例

### 基本使用

本程序会创建一个队列，然后创建2个发送任务、1个接收任务：

- 发送任务优先级为1，分别往队列中写入100、200
- 接收任务优先级为2，读队列、打印数值

main函数中创建的队列、创建了发送任务、接收任务，代码如下：

```c
/*队列句柄，创建队列时会设置这个变量*/
QueueHandle_t xQueue;

int main(void)
{
    prvSetupHardware();

    /*创建队列：长度为5，数据大小为4字节（存放一个整数）*/
    xQueue = xQueuecreate(5,sizeof(int32_t ));
    if(xQueue != NULL)
    {
        /*	创建2个任务用于写队列，传入的参数分别是100、200
			任务函数会连续执行，向队列发送数值100、200
			优先级为1
		*/
        xTaskcreate(vSenderTask,"Sender1",1000,void 100,1,NULL);
        xTaskcreate(vSenderTask,"Sender2",1000,void 200,1,NULL);

        /*	创建1个任务用于读队列
			优先级为2，高于上面的两个任务
			这意味着队列一有数据就会被读走
		*/
        xTaskcreate(vReceiverTask,"Receiver",1000,NULL,2,NULL);

        /*启动调度器*/
        vTaskstartScheduler();
    }
    else
    {
        /*无法创建队列*/
    }
    
    /*如果程序运行到了这里就表示出错了，一般是内存不足*/
    return 0;
}
```

发送任务的函数中，不断往队列中写入数值，代码如下：  

```c
static void vSenderTask(void *pvParameters)
{
    int32_t 1valueToSend;
    BaseType_t xstatus;
    /*	我们会使用这个函数创建2个任务
		这些任务的pvParameters不一样
	*/
    lValueToSend = (int32_t)pvParameters;
    /*无限循环*/
    for(;;)
    {
        /*	写队列
            xQueue:写哪个队列
            &1Va1ueToSend:写什么数据？传入数据的地址，会从这个地址把数据复制进队列
            0:不阻塞，如果队列满的话，写入失败，立刻返回
        */
        xStatus = xQueueSendToBack(xQueue,&1valueToSend,0);
        if(xStatus != pdPASS)
        {
            printf("Could not send to the queue.\r\n")
        }
    }
}
```

接收任务的函数中，读取队列、判断返回值、打印，代码如下：  

```c
static void vReceiverTask(void *pvParameters)
{
    /*读取队列时，用这个变量来存放数据*/
    int32_t lReceivedvalue;
    BaseType_t xstatus;
    const TickType_t xTicksTowait = pdMS_TO_TICKS(100UL);
    /*无限循环*/
    for(;;)
    {
        /*	读队列
            xQueue:读哪个队列
            &lReceivedvalue:读到的数据复制到这个地址
            xTicksTowait:如果队列为空，阻塞一会
        */
        xStatus = xQueueReceive(xQueue,&lReceivedvalue,xTicksTowait);
        if(xStatus == pdPASS)
        {
            /*读到了数据*/
            printf("Received %d\r\n",lReceivedvalue);
        }
        else
        {
            /*没读到数据*/
            printf("Could not receive from the queue.\r\n")
        }
    }
}
```

程序运行结果如下：

![程序的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/26_15_29_44_202412261529340.png)

任务的调度情况如下图所示：

![任务调度图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2024/12/26_15_30_17_202412261530492.png)



### 分辨数据源

当有多个发送任务，通过同一个队列发出数据，接收任务如何分辨数据来源？数据本身带有"来源"信息，比如写入队列的数据是一个结构体，结构体中的lDataSouceID用来表示数据来源：  

```c
typedef struct {
    ID_t eDataID;
    int32_t lDataValue;
}Data_t;
```

不同的发送任务，先构造好结构体，填入自己的eDataID ，再写队列；接收任务读出数据后，根据eDataID就可以知道数据来源了，如下图所示：

- CAN任务发送的数据：eDataID = eMotorSpeed
- HMI任务发送的数据：eDataID = eSpeedSetPoint

![不同的任务的不同id](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/01/2_9_0_40_202501020900849.png)

以下例子会创建一个队列，然后创建2个发送任务、1个接收任务：

- 创建的队列，用来发送结构体：数据大小是结构体的大小
- 发送任务优先级为2，分别往队列中写入自己的结构体，结构体中会标明数据来源
- 接收任务优先级为1，读队列、根据数据来源打印信息

main函数中创建了队列、创建了发送任务、接收任务，代码如下：  

```c
/* 定义2种数据来源(ID) */
typedef enum
{
    eMotorSpeed,
    eSpeedSetPoint
} ID_t;

/* 定义在队列中传输的数据的格式 */
typedef struct {
    ID_t eDataID;
    int32_t lDataValue;
}Data_t;

/* 定义2个结构体 */
static const Data_t xStructsToSend[ 2 ] =
{
    { eMotorSpeed, 10 }, /* CAN任务发送的数据 */
    { eSpeedSetPoint, 5 } /* HMI任务发送的数据 */
};

/* vSenderTask被用来创建2个任务，用于写队列
* vReceiverTask被用来创建1个任务，用于读队列
*/
static void vSenderTask( void *pvParameters );
static void vReceiverTask( void *pvParameters );

/*-----------------------------------------------------------*/

/* 队列句柄, 创建队列时会设置这个变量 */
QueueHandle_t xQueue;
int main( void )
{
    prvSetupHardware();
    /* 创建队列: 长度为5，数据大小为4字节(存放一个整数) */
    xQueue = xQueueCreate( 5, sizeof( Data_t ) );
    if( xQueue != NULL )
    {
		/* 创建2个任务用于写队列, 传入的参数是不同的结构体地址
		* 任务函数会连续执行，向队列发送结构体
		* 优先级为2
		*/
        xTaskCreate(vSenderTask, "CAN Task", 1000, (void *) &
                    (xStructsToSend[0]), 2, NULL);
        xTaskCreate(vSenderTask, "HMI Task", 1000, (void *) &(
            xStructsToSend[1]), 2, NULL);
        /* 创建1个任务用于读队列
		* 优先级为1, 低于上面的两个任务
		* 这意味着发送任务优先写队列，队列常常是满的状态
		*/
        xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    } e
        lse
    {
        /* 无法创建队列 */
    } /
        * 如果程序运行到了这里就表示出错了, 一般是内存不足 */
        return 0;
}
```



发送任务的函数中，不断往队列中写入数值，代码如下：  

```c
static void vSenderTask( void *pvParameters )
{
    BaseType_t xStatus;
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );
    /* 无限循环 */
    for( ;; )
    {
        /* 写队列
		* xQueue: 写哪个队列
		* pvParameters: 写什么数据? 传入数据的地址, 会从这个地址把数据复制进队列
		* xTicksToWait: 如果队列满的话, 阻塞一会
		*/
        xStatus = xQueueSendToBack( xQueue, pvParameters, xTicksToWait );
        if( xStatus != pdPASS )
        {
            printf( "Could not send to the queue.\r\n" );
        }
    }
}
```

接收任务的函数中，读取队列、判断返回值、打印，代码如下  ：

```c
static void vReceiverTask( void *pvParameters )
{
    /* 读取队列时, 用这个变量来存放数据 */
    Data_t xReceivedStructure;
    BaseType_t xStatus;
    /* 无限循环 */
    for( ;; )
    {
        /* 读队列
		* xQueue: 读哪个队列
		* &xReceivedStructure: 读到的数据复制到这个地址
		* 0: 没有数据就即刻返回，不阻塞
		*/
        xStatus = xQueueReceive( xQueue, &xReceivedStructure, 0 );
        if( xStatus == pdPASS )
        {
            /* 读到了数据 */
            if( xReceivedStructure.eDataID == eMotorSpeed )
            {
                printf( "From CAN, MotorSpeed = %d\r\n",
                       xReceivedStructure.lDataValue );
            } 
            else if( xReceivedStructure.eDataID == eSpeedSetPoint )
            {
                printf( "From HMI, SpeedSetPoint = %d\r\n", xReceivedStructure.lDataValue );
            }
        } 
        else
        {
            /* 没读到数据 */
            printf( "Could not receive from the queue.\r\n" );
        }
    }
}
```



运行结果如下：

![程序的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/01/16_11_25_54_202501161125437.png)

任务调度情况如下图所示：

![任务调度情况](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/01/16_11_28_59_202501161128670.png)



- t1：HMI是最后创建的最高优先级任务，它先执行，一下子向队列写入5个数据，把队列都写满了
- t2：队列已经满了，HMI任务再发起第6次写操作时，进入阻塞状态。这时CAN任务是最高优先级的就绪态任务，它开始执行
- t3：CAN任务发现队列已经满了，进入阻塞状态；接收任务变为最高优先级的就绪态任务，它开始运行
- t4：现在，HMI任务、CAN任务的优先级都比接收任务高，它们都在等待队列有空闲的空间；一旦接收任务读出1个数据，会马上被抢占。被谁抢占？谁等待最久？HMI任务！所以在t4时刻，切换到HMI任务。
- t5：HMI任务向队列写入第6个数据，然后再次阻塞，这是CAN任务已经阻塞很久了。接收任务变为最高优先级的就绪态任务，开始执行。
- t6：现在，HMI任务、CAN任务的优先级都比接收任务高，它们都在等待队列有空闲的空间；一旦接收任务读出1个数据，会马上被抢占。被谁抢占？谁等待最久？CAN任务！所以在t6时刻，切换到CAN任务。
- t7：CAN任务向队列写入数据，因为仅仅有一个空间供写入，所以它马上再次进入阻塞状态。这时HMI任务、CAN任务都在等待空闲空间，只有接收任务可以继续执行。

### 传输大块数据

FreeRTOS的队列使用拷贝传输，也就是要传输uint32_t时，把4字节的数据拷贝进队列；要传输一个8字节的结构体时，把8字节的数据拷贝进队列。

如果要传输1000字节的结构体呢？写队列时拷贝1000字节，读队列时再拷贝1000字节？不建议这么做，影响效率！



这时候，我们要传输的是这个巨大结构体的地址：把它的地址写入队列，对方从队列得到这个地址，使用地址去访问那1000字节的数据。



使用地址来间接传输数据时，这些数据放在RAM里，对于这块RAM，要保证这几点：



- RAM的所有者、操作者，必须清晰明了，这块内存，就被称为"共享内存"。要确保不能同时修改RAM。比如，在写队列之前只有由发送者修改这块RAM，在读队列之后只能由接收者访问这块RAM
- RAM要保持可用，这块RAM应该是全局变量，或者是动态分配的内存。对于动态分配的内存，要确保它不能提前释放：要等到接收者用完后再释放。另外，不能是局部变量。

> **例子**
>
> 程序会创建一个队列，然后创建1个发送任务、1个接收任务：
>
> - 创建的队列：长度为1，用来传输"char *"指针
> - 发送任务优先级为1，在字符数组中写好数据后，把它的地址写入队列
> - 接收任务优先级为2，读队列得到"char *"值，把它打印出来
>
> 这个程序故意设置接收任务的优先级更高，在它访问数组的过程中，接收任务无法执行、无法写这个数组
>
> main函数中创建了队列、创建了发送任务、接收任务，代码如下：  
>
> ```c
> /* 定义一个字符数组 */
> static char pcBuffer[100];
> 
> /* vSenderTask被用来创建2个任务，用于写队列
> * vReceiverTask被用来创建1个任务，用于读队列
> */
> static void vSenderTask( void *pvParameters );
> static void vReceiverTask( void *pvParameters );
> 
> /* 队列句柄, 创建队列时会设置这个变量 */
> QueueHandle_t xQueue;
> int main( void )
> {
>     prvSetupHardware();
>     /* 创建队列: 长度为1，数据大小为4字节(存放一个char指针) */
>     xQueue = xQueueCreate( 1, sizeof(char *) );
>     if( xQueue != NULL )
>     {
>         /* 创建1个任务用于写队列
> 		* 任务函数会连续执行，构造buffer数据，把buffer地址写入队列
> 		* 优先级为1
> 		*/
>         xTaskCreate( vSenderTask, "Sender", 1000, NULL, 1, NULL );
>         /* 创建1个任务用于读队列
> 		* 优先级为2, 高于上面的两个任务
> 		* 这意味着读队列得到buffer地址后，本任务使用buffer时不会被打断
> 		*/
>         xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 2, NULL );
>         /* 启动调度器 */
>         vTaskStartScheduler();
>     } 
>     else
>     {
>         /* 无法创建队列 */
>     } 
>     /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
>     return 0;
> }
> ```
>
> 发送任务的函数中，现在全局大数组pcBuffer中构造数据，然后把它的地址写入队列，代码如下：  
>
> ```c
> static void vSenderTask( void *pvParameters )
> {
>     BaseType_t xStatus;
>     static int cnt = 0;
>     char *buffer;
>     /* 无限循环 */
>     for( ;; )
>     {
>         sprintf(pcBuffer, "www.100ask.net Msg %d\r\n", cnt++);
>         buffer = pcBuffer; // buffer变量等于数组的地址, 下面要把这个地址写入队列
>         /* 写队列
> 		* xQueue: 写哪个队列
> 		* pvParameters: 写什么数据? 传入数据的地址, 会从这个地址把数据复制进队列
> 		* 0: 如果队列满的话, 即刻返回
> 		*/
>         xStatus = xQueueSendToBack( xQueue, &buffer, 0 ); /* 只需要写入4字节, 无需写入整个buffer */
>         if( xStatus != pdPASS )
>         {
>             printf( "Could not send to the queue.\r\n" );
>         }
>     }
> }
> ```
>
> 接收任务的函数中，读取队列、得到buffer的地址、打印，代码如下：  
>
> ```c
> static void vReceiverTask( void *pvParameters )
> {
>     /* 读取队列时, 用这个变量来存放数据 */
>     char *buffer;
>     const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );
>     BaseType_t xStatus;
>     /* 无限循环 */
>     for( ;; )
>     {
>         /* 读队列
> 		* xQueue: 读哪个队列
> 		* &xReceivedStructure: 读到的数据复制到这个地址
> 		* xTicksToWait: 没有数据就阻塞一会
> 		*/
>         xStatus = xQueueReceive( xQueue, &buffer, xTicksToWait); /* 得到buffer地址，只是4字节 */
>         if( xStatus == pdPASS )
>         {
>             /* 读到了数据 */
>             printf("Get: %s", buffer);
>         } 
>         else
>         {
>             /* 没读到数据 */
>             printf( "Could not receive from the queue.\r\n" );
>         }
>     }
> }
> ```
>
> 运行结果：
>
> ![传输大块数据运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/13_8_32_47_202502130832643.png)

### 邮箱

FreeRTOS的邮箱概念跟别的RTOS不一样，这里的邮箱称为"橱窗"也许更恰当：

- 它是一个队列，队列长度只有1

- 写邮箱：新数据覆盖旧数据，在任务中使用 xQueueOverwrite() ，在中断中使用xQueueOverwriteFromISR() 。

  > [!note]
  >
  > 既然是覆盖，那么无论邮箱中是否有数据，这些函数总能成功写入数据。

- 读邮箱：读数据时，数据不会被移除；在任务中使用 xQueuePeek() ，在中断中使用xQueuePeekFromISR() 。

  > [!note] 
  >
  > 这意味着，第一次调用时会因为无数据而阻塞，一旦曾经写入数据，以后读邮箱时总能成功。

> **例子**
>
> main函数中创建了队列(队列长度为1)、创建了发送任务、接收任务：
>
> - 发送任务的优先级为2，它先执行
> - 接收任务的优先级为1
>
> 代码如下：
>
> ```c
> /* 队列句柄, 创建队列时会设置这个变量 */
> QueueHandle_t xQueue;
> int main( void )
> {
>     prvSetupHardware();
>     /* 创建队列: 长度为1，数据大小为4字节(存放一个char指针) */
>     xQueue = xQueueCreate( 1, sizeof(uint32_t) );
>     if( xQueue != NULL )
>     {
>         /* 创建1个任务用于写队列
> 		* 任务函数会连续执行，构造buffer数据，把buffer地址写入队列
> 		* 优先级为2
> 		*/
>         xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );
>         /* 创建1个任务用于读队列
> 		* 优先级为1
> 		*/
>         xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, NULL );
>         /* 启动调度器 */
>         vTaskStartScheduler();
>     } 
>     else
>     {
>         /* 无法创建队列 */
>     } 
>     /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
>     return 0;
> }
> ```
>
> 发送任务、接收任务的代码和执行流程如下：
>
> - A：发送任务先执行，马上阻塞
> - BC：接收任务执行，这是邮箱无数据，打印"Could not ..."。在发送任务阻塞过程中，接收任务多次执行、多次打印。
> - D：发送任务从阻塞状态退出，立刻执行、写队列
> - E：发送任务再次阻塞
> - FG、HI、……：接收任务不断"偷看"邮箱，得到同一个数据，打印出多个"Get: 0" 
> - J：发送任务从阻塞状态退出，立刻执行、覆盖队列，写入1 
> - K：发送任务再次阻塞
> - LM、……：接收任务不断"偷看"邮箱，得到同一个数据，打印出多个"Get: 1"
>
> ![邮箱案例](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/13_8_43_41_202502130843399.png)
>
> 运行结果：
>
> ![邮箱的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/13_8_44_0_202502130844625.png)

# 信号量

前面介绍的队列(queue)可以用于传输数据：在任务之间、任务和中断之间。有时候我们只需要==传递状态==，并不需要传递具体的信息，比如：

- 我的事做完了，通知一下你
- 卖包子了、卖包子了，做好了1个包子！做好了2个包子！做好了3个包子！
- 这个停车位我占了，你们只能等着

在这种情况下我们可以使用信号量(semaphore)，它更节省内存。



## 概述

### 含义

*信号`量`*这个名字很恰当：

- 信号：起通知作用
- 量：还可以用来表示资源的数量
  - 当"量"没有限制时，它就是"计数型信号量"(Counting Semaphores)
  - 当"量"只有0、1两个取值时，它就是"二进制信号量"(Binary Semaphores)
- 支持的动作："give"给出资源，计数值加1；"take"获得资源，计数值减1

计数型信号量的典型场景是：

- 计数：事件产生时"give"信号量，让计数值加1；处理事件时要先"take"信号量，就是获得信号量，让计数值减1。
- 资源管理：要想访问资源需要先"take"信号量，让计数值减1；用完资源后"give"信号量，让计数值加1。

信号量的"give"、"take"双方并不需要相同，可以用于生产者-消费者场合：

- 生产者为任务A、B，消费者为任务C、D
- 一开始信号量的计数值为0，如果任务C、D想获得信号量，会有两种结果：
  - 阻塞：买不到东西咱就等等吧，可以定个闹钟(超时时间)
  - 即刻返回失败：不等
- 任务A、B可以生产资源，就是让信号量的计数值增加1，并且把等待这个资源的顾客唤醒
- 唤醒谁？谁优先级高就唤醒谁，如果大家优先级一样就唤醒等待时间最长的人

> [!tip] 
>
> 二进制信号量跟计数型的唯一差别，就是计数值的最大值被限定为1。



![信号量](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/02/13_8_55_24_202502130855640.png)

### 对比

==和队列对比==

| 队列                                                         | 信号量                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 可以容纳多个数据<br>创建队列时有2部分内存:队列结构体、存储数据的空间 | 只有计数值，无法容纳其他数据。 <br>创建信号量时，只需要分配信号量结构体 |
| 生产者：没有空间存入数据时可以阻塞                           | 生产者：用于不阻塞，计数值已经达到最大时 返回失败            |
| 消费者：没有数据时可以阻塞                                   | 消费者：没有资源时可以阻塞                                   |



==两种信号量的对比==

信号量的计数值都有限制：限定了最大值。如果最大值被限定为1，那么它就是二进制信号量；如果最大值不是1，它就是计数型信号量。

差别列表如下：



| 二进制信号量      | 技术型信号量           |
| ----------------- | ---------------------- |
| 被创建时初始值为0 | 被创建时初始值可以设定 |
| 其他操作是一样的  | 其他操作是一样的       |

## 信号量函数

使用信号量时，先创建、然后去添加资源、获得资源。使用句柄来表示一个信号量。

### 创建

使用信号量之前，要先创建，得到一个句柄；

使用信号量时，要使用句柄来表明使用哪个信号量。

对于二进制信号量、计数型信号量，它们的创建函数不一样：

|          | 二进制信号量                                   | 计数型信号量                   |
| -------- | ---------------------------------------------- | ------------------------------ |
| 动态创建 | xSemaphoreCreateBinary 计数值初始值为0         | xSemaphoreCreateCounting       |
|          | vSemaphoreCreateBinary(过时了) 计数值初始值为1 |                                |
| 静态创建 | xSemaphoreCreateBinaryStatic                   | xSemaphoreCreateCountingStatic |

创建二进制信号量的函数原型如下：

```c
/*创建一个二进制信号量，返回它的句柄。
*此函数内部会分配信号量结构体
*返回值：返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateBinary(void)
    
/*创建一个二进制信号量，返回它的句柄。
*此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
*返回值：返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphorecreateBinarystatic(StaticSemaphore_t *pxSemaphoreBuffer )
```

创建计数型信号量的函数原型如下：

```c
/* 创建一个计数型信号量，返回它的句柄。
* 此函数内部会分配信号量结构体
* uxMaxCount: 最大计数值
* uxInitialCount: 初始计数值
* 返回值: 返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateCounting(UBaseType_t uxMaxCount, UBaseType_t uxInitialCount);

/* 创建一个计数型信号量，返回它的句柄。
* 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
* uxMaxCount: 最大计数值
* uxInitialCount: 初始计数值
* pxSemaphoreBuffer: StaticSemaphore_t结构体指针
* 返回值: 返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateCountingStatic( UBaseType_t uxMaxCount,UBaseType_t uxInitialCount, StaticSemaphore_t *pxSemaphoreBuffer );
```



### 删除

对于动态创建的信号量，不再需要它们时，可以删除它们以回收内存。

`vSemaphoreDelete`可以用来删除二进制信号量、计数型信号量，函数原型如下：

```c
/*
* xSemaphore: 信号量句柄，你要删除哪个信号量
*/
void vSemaphoreDelete( SemaphoreHandle_t xSemaphore );
```

### give/take

二进制信号量、计数型信号量的give、take操作函数是一样的。这些函数也分为2个版本：

1. 给任务使用
2. 给ISR使用

列表如下：

|      | 在任务中使用   | 在ISR中使用           |
| ---- | -------------- | --------------------- |
| give | xSemaphoreGive | xSemaphoreGiveFromISR |
| take | xSemaphoreTake | xSemaphoreTakeFromISR |

==xSemaphoreGive==

`xSemaphoreGive`的函数原型如下：

```c
BaseType_t xSemaphoreGive( SemaphoreHandle_t xSemaphore );
```

`xSemaphoreGive`函数的参数与返回值列表如下：

| 参数       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| xSemaphore | 信号量句柄，释放哪个信号量                                   |
| 返回值     | pdTRUE表示成功, 如果二进制信号量的计数值已经是1，再次调用此函数则返回失败； 如果计数型信号量的计数值已经是最大值，再次调用此函数则返回失败 |

==xSemaphoreGiveFromISR==

`xSemaphoreGiveFromISR`的函数原型如下：

```c
BaseType_t xSemaphoreGiveFromISR(SemaphoreHandle_t xSemaphore,BaseType_t *pxHigherPriorityTaskWoken);
```

`xSemaphoreGiveFromISR`函数的参数与返回值列表如下：

| 参数                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| xSemaphore                | 信号量句柄，释放哪个信号量                                   |
| pxHigherPriorityTaskWoken | 如果释放信号量导致更高优先级的任务变为了就绪态， 则*pxHigherPriorityTaskWoken = pdTRUE |
| 返回值                    | pdTRUE表示成功, 如果二进制信号量的计数值已经是1，再次调用此函数则返回失 败； 如果计数型信号量的计数值已经是最大值，再次调用此函数则返 回失败 |

==xSemaphoreTake==

`xSemaphoreTake`的函数原型如下：

```c
BaseType_t xSemaphoreTake(SemaphoreHandle_t xSemaphore,TickType_t xTicksToWait);
```

`xSemaphoreTake`函数的参数与返回值列表如下：

| 参数         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| xSemaphore   | 信号量句柄，获取哪个信号量                                   |
| xTicksToWait | 如果无法马上获得信号量，阻塞一会： 0：不阻塞，马上返回 portMAX_DELAY:一直阻塞直到成功 其他值:阻塞的Tick个数，可以使用pdMS_TO_TICKS（）来指定阻塞时间为若干 ms |
| 返回值       | pdTRUE表示成功                                               |

==xSemaphoreTakeFromISR==

`xSemaphoreTakeFromISR`的函数原型如下：

```c
BaseType_t xSemaphoreTakeFromISR( SemaphoreHandle_t xSemaphore, BaseType_t *pxHigherPriorityTaskWoken);
```

`xSemaphoreTakeFromISR`函数的参数与返回值列表如下：

| 参数                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| xSemaphore                | 信号量句柄，获取哪个信号量                                   |
| pxHigherPriorityTaskWoken | 如果获取信号量导致更高优先级的任务变为了就绪态， 则*pxHigherPriorityTaskWoken = pdTRUE |
| 返回值                    | pdTRUE表示成功                                               |



## 示例

### 使用二进制信号量来同步

min函数中创建了一个二进制信号量，然后创建两个任务：

1. 一个用于释放信号量
2. 另一个用于获取信号量

代码如下：

```c
/* 二进制信号量句柄 */
SemaphoreHandle_t xBinarySemaphore;

int main(void)
{
    prvSetupHardware();
    /* 创建二进制信号量 */
    xBinarySemaphore = xSemaphoreCreateBinary( );
    if( xBinarySemaphore != NULL )
    {
        /* 创建1个任务用于释放信号量
		 * 优先级为2
		 */
        xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );
        /* 创建1个任务用于获取信号量
		 * 优先级为1
		 */
        xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建二进制信号量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}

/*-----------------------------------------------------------*/
static void vSenderTask( void *pvParameters )
{
    int i;
    int cnt_ok = 0;
    int cnt_err = 0;
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	

    /* 无限循环 */
    for( ;; )
    {		
        for (i = 0; i < 3; i++)
        {
            if (xSemaphoreGive(xBinarySemaphore) == pdTRUE)
                printf("Give BinarySemaphore %d time: OK\r\n", cnt_ok++);
            else
                printf("Give BinarySemaphore %d time: ERR\r\n", cnt_err++);
        }

        vTaskDelay(xTicksToWait);
    }
}
/*-----------------------------------------------------------*/

static void vReceiverTask( void *pvParameters )
{
    int cnt_ok = 0;
    int cnt_err = 0;
    /* 无限循环 */
    for( ;; )
    {
        if( xSemaphoreTake(xBinarySemaphore, portMAX_DELAY) == pdTRUE )
        {
            /* 得到了二进制信号量 */
            printf("Get BinarySemaphore OK: %d\r\n", cnt_ok++);
        }
        else
        {
            /* 没有得到了二进制信号量 */
            printf("Get BinarySemaphore ERR: %d\r\n", cnt_err++);
        }
    }
}
```



发送任务、接收任务的代码和执行流程如下：

> A：发送任务优先级高，先执行。连续3次释放二进制信号量，只有第1次成功
>
> B：发送任务进入阻塞态
>
> C：接收任务得以执行，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了
>
> D：发送任务再次运行，连续3次释放二进制信号量，只有第1次成功
>
> E：发送任务进入阻塞态
>
> F：接收任务被唤醒，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态



![使用二进制信号来同步](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/7_8_59_50_202505070859374.png)



运行结果如下图所示，即使发送任务连续释放多个信号量，也只能成功1次。释放、获得信号量是一一对应的。

![使用二进制信号来同步结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/7_9_0_34_202505070900988.png)



### 防止数据丢失

在上一个例子中，发送任务发出3次"提醒"，但是接收任务只接收到1次"提醒"，其中2次"提醒"丢失了。

这种情况很常见，比如每接收到一个串口字符，串口中断程序就给任务发一次"提醒"，假设收到多个字符、发出了多次"提醒"。当任务来处理时，它只能得到1次"提醒"。

你需要使用其他方法来防止数据丢失，比如：

- 在串口中断中，把数据放入缓冲区
- 在任务中，一次性把缓冲区中的数据都读出
- 简单地说，就是：你提醒了我多次，我太忙只响应你一次，但是我一次性拿走所有数据

main函数中创建了一个二进制信号量，然后创建2个任务：一个用于释放信号量，另一个用于获取信号量，代码如下：

```c
/* 二进制信号量句柄 */
SemaphoreHandle_t xBinarySemaphore;

int main( void )
{
    prvSetupHardware();
    /* 创建二进制信号量 */
    xBinarySemaphore = xSemaphoreCreateBinary( );
    if( xBinarySemaphore != NULL )
    {
        /* 创建1个任务用于释放信号量
		 * 优先级为2
		 */
        xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );
        /* 创建1个任务用于获取信号量
		 * 优先级为1
		 */
        xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建二进制信号量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}

/*-----------------------------------------------------------*/

static void vSenderTask( void *pvParameters )
{
    int i;
    int cnt_tx = 0;
    int cnt_ok = 0;
    int cnt_err = 0;
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	

    /* 无限循环 */
    for( ;; )
    {		
        for (i = 0; i < 3; i++)
        {
            /* 放入数据 */
            txbuf_put('a'+cnt_tx);
            cnt_tx++;

            /* 提醒对方 */
            if (xSemaphoreGive(xBinarySemaphore) == pdTRUE)
                printf("Give BinarySemaphore %d time: OK\r\n", cnt_ok++);
            else
                printf("Give BinarySemaphore %d time: ERR\r\n", cnt_err++);
        }

        vTaskDelay(xTicksToWait);
    }
}
/*-----------------------------------------------------------*/

static void vReceiverTask( void *pvParameters )
{
    int cnt_ok = 0;
    int cnt_err = 0;
    uint8_t c;

    /* 无限循环 */
    for( ;; )
    {
        if( xSemaphoreTake(xBinarySemaphore, portMAX_DELAY) == pdTRUE )
        {
            /* 得到了二进制信号量 */
            printf("Get BinarySemaphore OK: %d, data: ", cnt_ok++);

            /* 一次性把所有数据取出来 */
            while (txbuf_get(&c) == 0)
            {
                printf("%c", c);
            }
            printf("\r\n");
        }
        else
        {
            /* 没有得到了二进制信号量 */
            printf("Get BinarySemaphore ERR: %d\r\n", cnt_err++);
        }
    }
}
```

发送任务、接收任务的代码和执行流程如下：

A：发送任务优先级高，先执行。连续3次释放二进制信号量，只有第1次成功

B：发送任务进入阻塞态

C：接收任务得以执行，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态，在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了

D：发送任务再次运行，连续3次释放二进制信号量，只有第1次成功

E：发送任务进入阻塞态

F：接收任务被唤醒，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态

![防止数据丢失过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/8_8_55_6_202505080855646.png)

程序运行结果如下，数据未丢失：

![防止数据丢失的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/8_8_57_8_202505080857677.png)



### 使用计数型信号量



使用计数型信号量时，可以多次释放信号量；当信号量的技术值达到最大时，再次释放信号量就会出错。

如果信号量计数值为n，就可以连续n次获取信号量，第(n+1)次获取信号量就会阻塞或失败。

main函数中创建了一个计数型信号量，最大计数值为3，初始值计数值为0；然后创建2个任务：一个用于释放信号量，另一个用于获取信号量，代码如下：

```c
/* 计数型信号量句柄 */
SemaphoreHandle_t xCountingSemaphore;
int main( void )
{
    prvSetupHardware();
    /* 创建计数型信号量 */
    xCountingSemaphore = xSemaphoreCreateCounting(3, 0);
    if( xCountingSemaphore != NULL )
    {
        /* 创建1个任务用于释放信号量
		 * 优先级为2
		 */
        xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );
        
        /* 创建1个任务用于获取信号量
		 * 优先级为1
		 */
        xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建信号量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}

/*-----------------------------------------------------------*/

static void vSenderTask( void *pvParameters )
{
	int i;
	int cnt_ok = 0;
	int cnt_err = 0;
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 20UL );	
	
	/* 无限循环 */
	for( ;; )
	{		
		for (i = 0; i < 4; i++)
		{			
			/* 提醒对方 */
			if (xSemaphoreGive(xCountingSemaphore) == pdTRUE)
				printf("Give CountingSemaphore %d time: OK\r\n", cnt_ok++);
			else
				printf("Give CountingSemaphore %d time: ERR\r\n", cnt_err++);
		}
				
		vTaskDelay(xTicksToWait);
	}
}
/*-----------------------------------------------------------*/

static void vReceiverTask( void *pvParameters )
{
	int cnt_ok = 0;
	int cnt_err = 0;

	/* 无限循环 */
	for( ;; )
	{
		if( xSemaphoreTake(xCountingSemaphore, portMAX_DELAY) == pdTRUE )
		{
			/* 得到了信号量 */
			printf("Get CountingSemaphore OK: %d\r\n", cnt_ok++);
		}
		else
		{
			/* 没有得到了信号量 */
			printf("Get BinarySemaphore ERR: %d\r\n", cnt_err++);
		}
	}
}
```

发送任务、接收任务的代码和执行流程如下：

- A：发送任务优先级高，先执行。连续释放4个信号量：只有前面3次成功，第4次失败
- B：发送任务进入阻塞态
- CDE：接收任务得以执行，得到3个信号量
- F：接收任务试图获得第4个信号量时进入阻塞状态，在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了
- G：发送任务再次运行，连续释放4个信号量：只有前面3次成功，第4次失败
- H：发送任务进入阻塞态
- IJK：接收任务得以执行，得到3个信号量
- L：接收任务再次获取信号量时进入阻塞状态

![使用计数型信号量运行过程](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/12_8_46_27_202505120846306.png)

运行结果如下：

![使用计数型信号量运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/12_8_47_5_202505120847180.png)



# 互斥量

怎么独享厕所？自己开门上锁，完事了自己开锁。

你当然可以进去后，让别人帮你把门：但是，命运就掌握在别人手上了。使用队列、信号量，都可以实现互斥访问，以信号量为例：

- 信号量初始值为1
- 任务A想上厕所，"take"信号量成功，它进入厕所
- 任务B也想上厕所，"take"信号量不成功，等待
- 任务A用完厕所，"give"信号量；轮到任务B使用

这需要有2个前提：

- 任务B很老实，不撬门(一开始不"give"信号量)
- 没有坏人：别的任务不会"give"信号量

可以看到，使用信号量确实也可以实现互斥访问，但是不完美。

使用互斥量可以解决这个问题，互斥量的名字取得很好：

- 量：值为0、1
- 互斥：用来实现互斥访问

它的核心在于：谁上锁，就只能由谁开锁。很奇怪的是，FreeRTOS的互斥锁，并没有在代码上实现这点：

- 即使任务A获得了互斥锁，任务B竟然也可以释放互斥锁。
- 谁上锁、谁释放：只是约定。

## 互斥量的使用场合

在多任务系统中，任务A正在使用某个资源，还没用完的情况下任务B也来使用的话，就可能导致问题。

比如对于串口，任务A正使用它来打印，在打印过程中任务B也来打印，客户看到的结果就是A、B的信息混杂在一起。这种现象很常见：

- 访问外设：刚举的串口例子
- 读、修改、写操作导致的问题

对于同一个变量，比如 int a ，如果有两个任务同时写它就有可能导致问题。对于变量的修改，C代码只有一条语句，比如： a=a+8; ，它的内部实现分为3步：读出原值、修改、写入。

![c代码语句的实质](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/15_8_41_11_202505150841359.png)



我们想让任务A、B都执行add_a函数，a的最终结果是 1+8+8=17 。

假设任务A运行完代码①，在执行代码②之前被任务B抢占了：现在任务A的R0等于1。任务B执行完add_a函数，a等于9。任务A继续运行，在代码②处R0仍然是被抢占前的数值1，执行完②③的代码，a等于9，这跟预期的17不符合。

- 对变量的非原子化访问
  修改变量、设置结构体、在16位的机器上写32位的变量，这些操作都是非原子的。也就是它们的操作过程都可能被打断，如果被打断的过程有其他任务来操作这些变量，就可能导致冲突。
- 函数重入
  "可重入的函数"是指：多个任务同时调用它、任务和中断同时调用它，函数的运行也是安全的。可重入的函数也被称为"线程安全"(thread safe)。
  每个任务都维持自己的栈、自己的CPU寄存器，如果一个函数只使用局部变量，那么它就是线程安全的。
  函数中一旦使用了全局变量、静态变量、其他外设，它就不是"可重入的"，如果改函数正在被调用，就必须阻止其他任务、中断再次调用它。

上述问题的解决方法是：任务A访问这些全局变量、函数代码时，独占它，就是上个锁。这些全局变量、函数代码必须被独占地使用，它们被称为临界资源。

互斥量也被称为互斥锁，使用过程如下：

- 互斥量初始值为1
- 任务A想访问临界资源，先获得并占有互斥量，然后开始访问
- 任务B也想访问临界资源，也要先获得互斥量：被别人占有了，于是阻塞
- 任务A使用完毕，释放互斥量；任务B被唤醒、得到并占有互斥量，然后开始访问临界资源
- 任务B使用完毕，释放互斥量

正常来说：在任务A占有互斥量的过程中，任务B、任务C等等，都无法释放互斥量。但是FreeRTOS未实现这点：任务A占有互斥量的情况下，任务B也可释放互斥量。

## 互斥量函数

### 创建

互斥量是一种特殊的二进制信号量。使用互斥量时，先创建、然后去获得、释放它。使用句柄来表示一个互斥量。创建互斥量的函数有2种：动态分配内存，静态分配内存，函数原型如下：

```c
/* 创建一个互斥量，返回它的句柄。
* 此函数内部会分配互斥量结构体
* 返回值: 返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateMutex( void );

/* 创建一个互斥量，返回它的句柄。
* 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
* 返回值: 返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateMutexStatic( StaticSemaphore_t *pxMutexBuffer
);
```

要想使用互斥量，需要在配置文件FreeRTOSConﬁg.h中定义：

```c
##define configUSE_MUTEXES 1
```

### 其他函数

要注意的是，互斥量不能在ISR中使用。各类操作函数，比如删除、give/take，跟一般是信号量是一样的。

```c
/*
* xSemaphore: 信号量句柄，你要删除哪个信号量, 互斥量也是一种信号量
*/
void vSemaphoreDelete( SemaphoreHandle_t xSemaphore );

/* 释放 */
BaseType_t xSemaphoreGive( SemaphoreHandle_t xSemaphore );
/* 释放(ISR版本) */
BaseType_t xSemaphoreGiveFromISR(SemaphoreHandle_t xSemaphore, BaseType_t *pxHigherPriorityTaskWoken);

/* 获得 */
BaseType_t xSemaphoreTake(SemaphoreHandle_t xSemaphore,TickType_t xTicksToWait);
/* 获得(ISR版本) */
xSemaphoreGiveFromISR(SemaphoreHandle_t xSemaphore,BaseType_t *pxHigherPriorityTaskWoken);
```

## 递归锁

### 概念

日常生活的死锁：我们只招有工作经验的人！我没有工作经验怎么办？那你就去找工作啊！

假设有2个互斥量M1、M2，2个任务A、B：

- A获得了互斥量M1
- B获得了互斥量M2
- A还要获得互斥量M2才能运行，结果A阻塞
- B还要获得互斥量M1才能运行，结果B阻塞
- A、B都阻塞，再无法释放它们持有的互斥量
- 死锁发生！

### 自我死锁

假设这样的场景：

- 任务A获得了互斥锁M
- 它调用一个库函数
- 库函数要去获取同一个互斥锁M，于是它阻塞：任务A休眠，等待任务A来释放互斥锁！
- 死锁发生！

### 函数



怎么解决这类问题？可以使用递归锁(Recursive Mutexes)，它的特性如下：

- 任务A获得递归锁M后，它还可以多次去获得这个锁
- "take"了N次，要"give"N次，这个锁才会被释放

递归锁的函数根一般互斥量的函数名不一样，参数类型一样，列表如下：

|      | 递归锁                         | 一般互斥量            |
| ---- | ------------------------------ | --------------------- |
| 创建 | xSemaphoreCreateRecursiveMutex | xSemaphoreCreateMutex |
| 获得 | xSemaphoreTakeRecursive        | xSemaphoreTake        |
| 释放 | xSemaphoreGiveRecursive        | xSemaphoreGive        |

函数原型如下：

```c
/* 创建一个递归锁，返回它的句柄。
* 此函数内部会分配互斥量结构体
* 返回值: 返回句柄，非NULL表示成功
*/
SemaphoreHandle_t xSemaphoreCreateRecursiveMutex( void );

/* 释放 */
BaseType_t xSemaphoreGiveRecursive( SemaphoreHandle_t xSemaphore );
/* 获得 */
BaseType_t xSemaphoreTakeRecursive(SemaphoreHandle_t xSemaphore, TickType_t xTicksToWait);
```



## 示例

### 互斥量的基本使用



使用互斥量时有如下特点：

- 刚创建的互斥量可以被成功"take"
- "take"互斥量成功的任务，被称为"holder"，只能由它"give"互斥量；别的任务"give"不成功
- 在ISR中不能使用互斥量

本程序创建2个发送任务：故意发送大量的字符。可以做2个实验：

- 使用互斥量：可以看到任务1、任务2打印的字符串没有混杂在一起
- 不使用互斥量：任务1、任务2打印的字符串混杂在一起

main函数代码如下：

```c
/* 互斥量句柄 */
SemaphoreHandle_t xMutex;
int main( void )
{
    prvSetupHardware();
    /* 创建互斥量 */
    xMutex = xSemaphoreCreateMutex( );
    if( xMutex != NULL )
    {
        /* 创建2个任务: 都是打印
		 * 优先级相同
		 */
        xTaskCreate( vSenderTask, "Sender1", 1000, (void *)1, 1, NULL );
        xTaskCreate( vSenderTask, "Sender2", 1000, (void *)2, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建互斥量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

发送任务的函数如下：

```c
static void vSenderTask( void *pvParameters )
{
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );
    int cnt = 0;
    int task = (int)pvParameters;
    int i;
    char c;
    
    /* 无限循环 */
    for( ;; )
    {
        /* 获得互斥量: 上锁 */
        xSemaphoreTake(xMutex, portMAX_DELAY);
        printf("Task %d use UART count: %d, ", task, cnt++);
        c = (task == 1 ) ? 'a' : 'A';
        for (i = 0; i < 26; i++)
            printf("%c", c + i);
        printf("\r\n");
        /* 释放互斥量: 开锁 */
        xSemaphoreGive(xMutex);
        vTaskDelay(xTicksToWait);
    }
}
```

可以做两个实验：vSenderTask函数的for循环中xSemaphoreTake和xSemaphoreGive这2句代码保留、不保留：

- 保留：实验现象如下图左边，任务1、任务2的打印信息没有混在一起
- 不保留：实验现象如下图右边，打印信息混杂在一起

![使用互斥量qian'hou](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/15_9_5_18_202505150905556.png)

### 谁上锁就由谁解锁？

互斥量、互斥锁，本来的概念确实是：谁上锁就得由谁解锁。但是FreeRTOS并没有实现这点，只是要求程序员按照这样的惯例写代码。

main函数创建了2个任务：

- 任务1：高优先级，一开始就获得互斥锁，永远不释放。
- 任务2：任务1阻塞时它开始执行，它先尝试获得互斥量，失败的话就监守自盗(释放互斥量、开锁)，然后再上锁

```c
/* 互斥量句柄 */
SemaphoreHandle_t xMutex;

int main( void )
{
    prvSetupHardware();
    /* 创建互斥量 */
    xMutex = xSemaphoreCreateMutex( );
    if( xMutex != NULL )
    {
        /* 创建2个任务: 一个上锁, 另一个自己监守自盗(开别人的锁自己用)
		 */
        xTaskCreate( vTakeTask, "Task1", 1000, NULL, 2, NULL );
        xTaskCreate( vGiveAndTakeTask, "Task2", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建互斥量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

任务代码如下：



```c
/*-----------------------------------------------------------*/
static void vTakeTask( void *pvParameters )
{
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
    BaseType_t xStatus;

    /* 获得互斥量: 上锁 */
    xStatus = xSemaphoreTake(xMutex, portMAX_DELAY);
    printf("Task1 take the Mutex %s\r\n", (xStatus == pdTRUE)? "Success" : "Failed");

    /* 无限循环 */
    for( ;; )
    {	
        /* 什么都不做 */
        vTaskDelay(xTicksToWait);
    }
}

static void vGiveAndTakeTask( void *pvParameters )
{
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
    BaseType_t xStatus;

    /* 尝试获得互斥量: 上锁 */
    xStatus = xSemaphoreTake(xMutex, 0);
    printf("Task2: at first, take the Mutex %s\r\n", \
           (xStatus == pdTRUE)? "Success" : "Failed");

    /* 如果失败则监守自盗: 开锁 */
    if (xStatus != pdTRUE)
    {
        xStatus = xSemaphoreGive(xMutex);
        printf("Task2: give Mutex %s\r\n", \
               (xStatus == pdTRUE)? "Success" : "Failed");
    }

    /* 最后成功获得互斥量 */
    xStatus = xSemaphoreTake(xMutex, portMAX_DELAY);
    printf("Task2: and then, take the Mutex %s\r\n", \
           (xStatus == pdTRUE)? "Success" : "Failed");

    /* 无限循环 */
    for( ;; )
    {	
        /* 什么都不做 */
        vTaskDelay(xTicksToWait);
    }
}
/*-----------------------------------------------------------*/
```

两个任务的代码和执行流程如下图所示：

- A：任务1的优先级高，先运行，立刻上锁
- B：任务1阻塞
- C：任务2开始执行，尝试获得互斥量(上锁)，超时时间设为0。根据返回值打印出：上锁失败
- D：任务2监守自盗，开锁，成功！
- E：任务2成功获得互斥量
- F：任务2阻塞

可见，任务1上的锁，被任务2解开了。所以，FreeRTOS并没有实现"谁上锁就得由谁开锁"的功能。

![谁上锁就由谁解锁？](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/16_8_27_28_202505160827973.png)

程序运行结果如下：

![谁上锁就由谁解锁的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/16_8_27_58_202505160827830.png)

### 优先级反转

假设任务A、B都想使用串口，A优先级比较低：

- 任务A获得了串口的互斥量
- 任务B也想使用串口，它将会阻塞、等待A释放互斥量
- 高优先级的任务，被低优先级的任务延迟，这被称为"优先级反转"(priority inversion)

如果涉及3个任务，可以让"优先级反转"的后果更加恶劣。

互斥量可以通过"优先级继承"，可以很大程度解决"优先级反转"的问题，这也是FreeRTOS中互斥量和二进制信号量的差别。本节程序使用二级制信号量来演示"优先级反转"的恶劣后果。

main函数创建了3个任务：LPTask/MPTask/HPTask(低/中/高优先级任务)，代码如下：

```c
/* 互斥量/二进制信号量句柄 */
SemaphoreHandle_t xLock;

int main( void )
{
    prvSetupHardware();
    /* 创建互斥量/二进制信号量 */
    xLock = xSemaphoreCreateBinary( );
    if( xLock != NULL )
    {
        /* 创建3个任务: LP,MP,HP(低/中/高优先级任务)*/
        xTaskCreate( vLPTask, "LPTask", 1000, NULL, 1, NULL );
        xTaskCreate( vMPTask, "MPTask", 1000, NULL, 2, NULL );
        xTaskCreate( vHPTask, "HPTask", 1000, NULL, 3, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建互斥量/二进制信号量 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

任务代码为：

```c
/*-----------------------------------------------------------*/
static void vLPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
	uint32_t i;
	char c = 'A';

	printf("LPTask start\r\n");
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 1;
		flagMPTaskRun = 0;
		flagHPTaskRun = 0;

		/* 获得互斥量/二进制信号量 */
		xSemaphoreTake(xLock, portMAX_DELAY);
		
		/* 耗时很久 */
		
		printf("LPTask take the Lock for long time");
		for (i = 0; i < 26; i++) 
		{
			flagLPTaskRun = 1;
			flagMPTaskRun = 0;
			flagHPTaskRun = 0;
			printf("%c", c + i);
		}
		printf("\r\n");
		
		/* 释放互斥量/二进制信号量 */
		xSemaphoreGive(xLock);
		
		vTaskDelay(xTicksToWait);
	}
}

static void vMPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 30UL );	

	flagLPTaskRun = 0;
	flagMPTaskRun = 1;
	flagHPTaskRun = 0;

	printf("MPTask start\r\n");
	
	/* 让LPTask、HPTask先运行 */	
	vTaskDelay(xTicksToWait);
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 0;
		flagMPTaskRun = 1;
		flagHPTaskRun = 0;
	}
}

static void vHPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	

	flagLPTaskRun = 0;
	flagMPTaskRun = 0;
	flagHPTaskRun = 1;

	printf("HPTask start\r\n");
	
	/* 让LPTask先运行 */	
	vTaskDelay(xTicksToWait);
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 0;
		flagMPTaskRun = 0;
		flagHPTaskRun = 1;
		printf("HPTask wait for Lock\r\n");
		
		/* 获得互斥量/二进制信号量 */
		xSemaphoreTake(xLock, portMAX_DELAY);
		
		flagLPTaskRun = 0;
		flagMPTaskRun = 0;
		flagHPTaskRun = 1;
		
		/* 释放互斥量/二进制信号量 */
		xSemaphoreGive(xLock);
	}
}

/*-----------------------------------------------------------*/
```

LPTask/MPTask/HPTask三个任务的代码和运行过程如下图所示：

- A：HPTask优先级最高，它最先运行。在这里故意打印，这样才可以观察到ﬂagHPTaskRun的脉冲。HP Delay：HPTask阻塞
- B：MPTask开始运行。在这里故意打印，这样才可以观察到ﬂagMPTaskRun的脉冲。MP Delay：MPTask阻塞
- C：LPTask开始运行，获得二进制信号量，然后故意打印很多字符
- D：HP Delay时间到，HPTask恢复运行，它无法获得二进制信号量，一直阻塞等待
- E：MP Delay时间到，MPTask恢复运行，它比LPTask优先级高，一直运行。导致LPTask无法运行，自然无法释放二进制信号量，于是HPTask用于无法运行。

总结：

- LPTask先持有二进制信号量，
- 但是MPTask抢占LPTask，是的LPTask一直无法运行也就无法释放信号量，
- 导致HPTask任务无法运行
- 优先级最高的HPTask竟然一直无法运行！

![优先级反转](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/16_9_0_21_202505160900048.png)

程序运行的时序图如下：

![优先级反转运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/16_9_2_6_202505160902699.png)



### 优先级继承

优先级反转的问题在于，LPTask低优先级任务获得了锁，但是它优先级太低而无法运行。

如果能提升LPTask任务的优先级，让它能尽快运行、释放锁，"优先级反转"的问题不就解决了吗？

把LPTask任务的优先级提升到什么水平？

优先级继承：

- 假设持有互斥锁的是任务A，如果更高优先级的任务B也尝试获得这个锁
- 任务B说：你既然持有宝剑，又不给我，那就继承我的愿望吧
- 于是任务A就继承了任务B的优先级
- 这就叫：优先级继承
- 等任务A释放互斥锁时，它就恢复为原来的优先级
- 互斥锁内部就实现了优先级的提升、恢复

代码如下：

```c
int main( void )
{
	prvSetupHardware();
	
    /* 创建互斥量/二进制信号量 */
    //xLock = xSemaphoreCreateBinary( );
	xLock = xSemaphoreCreateMutex( );


	if( xLock != NULL )
	{
		/* 创建3个任务: LP,MP,HP(低/中/高优先级任务)
		 */
		xTaskCreate( vLPTask, "LPTask", 1000, NULL, 1, NULL );
		xTaskCreate( vMPTask, "MPTask", 1000, NULL, 2, NULL );
		xTaskCreate( vHPTask, "HPTask", 1000, NULL, 3, NULL );

		/* 启动调度器 */
		vTaskStartScheduler();
	}
	else
	{
		/* 无法创建互斥量/二进制信号量 */
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```

任务代码如下：

```c
/*-----------------------------------------------------------*/
static void vLPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
	uint32_t i;
	char c = 'A';

	printf("LPTask start\r\n");
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 1;
		flagMPTaskRun = 0;
		flagHPTaskRun = 0;

		/* 获得互斥量/二进制信号量 */
		xSemaphoreTake(xLock, portMAX_DELAY);
		
		/* 耗时很久 */
		
		printf("LPTask take the Lock for long time");
		for (i = 0; i < 26; i++) 
		{
			flagLPTaskRun = 1;
			flagMPTaskRun = 0;
			flagHPTaskRun = 0;
			printf("%c", c + i);
		}
		printf("\r\n");
		
		/* 释放互斥量/二进制信号量 */
		xSemaphoreGive(xLock);
		
		vTaskDelay(xTicksToWait);
	}
}

static void vMPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 30UL );	

	flagLPTaskRun = 0;
	flagMPTaskRun = 1;
	flagHPTaskRun = 0;

	printf("MPTask start\r\n");
	
	/* 让LPTask、HPTask先运行 */	
	vTaskDelay(xTicksToWait);
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 0;
		flagMPTaskRun = 1;
		flagHPTaskRun = 0;
	}
}

static void vHPTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	

	flagLPTaskRun = 0;
	flagMPTaskRun = 0;
	flagHPTaskRun = 1;

	printf("HPTask start\r\n");
	
	/* 让LPTask先运行 */	
	vTaskDelay(xTicksToWait);
	
	/* 无限循环 */
	for( ;; )
	{	
		flagLPTaskRun = 0;
		flagMPTaskRun = 0;
		flagHPTaskRun = 1;
		printf("HPTask wait for Lock\r\n");
		
		/* 获得互斥量/二进制信号量 */
		xSemaphoreTake(xLock, portMAX_DELAY);
		
		flagLPTaskRun = 0;
		flagMPTaskRun = 0;
		flagHPTaskRun = 1;
		
		/* 释放互斥量/二进制信号量 */
		xSemaphoreGive(xLock);
	}
}

/*-----------------------------------------------------------*/

```



运行时序图如下图所示：

- A：HPTask执行 xSemaphoreTake(xLock, portMAX_DELAY); ，它的优先级被LPTask继承
- B：LPTask抢占MPTask，运行
- C：LPTask执行 xSemaphoreGive(xLock); ，它的优先级恢复为原来值
- D：HPTask得到互斥锁，开始运行
- 互斥锁的"优先级继承"，可以减小"优先级反转"的影响

![优先级继承运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/17_8_54_11_202505170854696.png)



### 递归锁

递归锁实现了：谁上锁就由谁解锁。

它的main函数里创建了2个任务

- 任务1：高优先级，一开始就获得递归锁，然后故意等待很长时间，让任务2运行
- 任务2：低优先级，看看能否操作别人持有的锁

main函数代码如下：

```c
/* 递归锁句柄 */
SemaphoreHandle_t xMutex;
int main( void )
{
    prvSetupHardware();
    /* 创建递归锁 */
    xMutex = xSemaphoreCreateRecursiveMutex( );
    if( xMutex != NULL )
    {
        /* 创建2个任务: 一个上锁, 另一个自己监守自盗(看看能否开别人的锁自己用)*/
        xTaskCreate( vTakeTask, "Task1", 1000, NULL, 2, NULL );
        xTaskCreate( vGiveAndTakeTask, "Task2", 1000, NULL, 1, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建递归锁 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

任务代码如下：

```c
/*-----------------------------------------------------------*/
static void vTakeTask( void *pvParameters )
{
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );	
    BaseType_t xStatus;
    int i;


    /* 无限循环 */
    for( ;; )
    {	
        /* 获得递归锁: 上锁 */
        xStatus = xSemaphoreTakeRecursive(xMutex, portMAX_DELAY);
        printf("Task1 take the Mutex in main loop %s\r\n", \
               (xStatus == pdTRUE)? "Success" : "Failed");

        /* 阻塞很长时间, 让另一个任务执行, 
		 * 看看它有无办法再次获得递归锁 
		 */
        vTaskDelay(xTicksToWait);

        for (i = 0; i < 10; i++)
        {
            /* 获得递归锁: 上锁 */
            xStatus = xSemaphoreTakeRecursive(xMutex, portMAX_DELAY);

            printf("Task1 take the Mutex in sub loop %s, for time %d\r\n", \
                   (xStatus == pdTRUE)? "Success" : "Failed", i);

            /* 释放递归锁 */
            xSemaphoreGiveRecursive(xMutex);
        }

        /* 释放递归锁 */
        xSemaphoreGiveRecursive(xMutex);
    }
}

static void vGiveAndTakeTask( void *pvParameters )
{
    const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
    BaseType_t xStatus;

    /* 尝试获得递归锁: 上锁 */
    xStatus = xSemaphoreTakeRecursive(xMutex, 0);
    printf("Task2: at first, take the Mutex %s\r\n", \
           (xStatus == pdTRUE)? "Success" : "Failed");

    /* 如果失败则监守自盗: 开锁 */
    if (xStatus != pdTRUE)
    {
        /* 无法释放别人持有的锁 */
        xStatus = xSemaphoreGiveRecursive(xMutex);
        printf("Task2: give Mutex %s\r\n", \
               (xStatus == pdTRUE)? "Success" : "Failed");
    }

    /* 如果无法获得, 一直等待 */
    xStatus = xSemaphoreTakeRecursive(xMutex, portMAX_DELAY);
    printf("Task2: and then, take the Mutex %s\r\n", \
           (xStatus == pdTRUE)? "Success" : "Failed");

    /* 无限循环 */
    for( ;; )
    {	
        /* 什么都不做 */
        vTaskDelay(xTicksToWait);
    }
}
/*-----------------------------------------------------------*/

```

两个任务经过精细设计，代码和运行流程如下图所示：

- A：任务1优先级最高，先运行，获得递归锁
- B：任务1阻塞，让任务2得以运行
- C：任务2运行，看看能否获得别人持有的递归锁：不能
- D：任务2故意执行"give"操作，看看能否释放别人持有的递归锁：不能
- E：任务2等待递归锁
- F：任务1阻塞时间到后继续运行，使用循环多次获得、释放递归锁
- 递归锁在代码上实现了：谁持有递归锁，必须由谁释放。

![递归锁](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/17_9_5_23_202505170905885.png)

程序运行结果如下图所示：

![递归锁运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/17_9_5_38_202505170905772.png)

# 事件组

学校组织秋游，组长在等待：

- 张三：我到了
- 李四：我到了
- 王五：我到了
- 组长说：好，大家都到齐了，出发！

秋游回来第二天就要提交一篇心得报告，组长在焦急等待：张三、李四、王五谁先写好就交谁的。

在这个日常生活场景中：

- 出发：要等待这3个人都到齐，他们是"与"的关系
- 交报告：只需等待这3人中的任何一个，他们是"或"的关系

在FreeRTOS中，可以使用事件组(event group)来解决这些问题。

## 概念与操作

事件组可以简单地认为就是一个整数：

- 每一位表示一个事件
- 每一位事件的含义由程序员决定，比如：Bit0表示用来串口是否就绪，Bit1表示按键是否被按下
- 这些位，值为1表示事件发生了，值为0表示事件没发生
- 一个或多个任务、ISR都可以去写这些位；一个或多个任务、ISR都可以去读这些位
- 可以等待某一位、某些位中的任意一个，也可以等待多位

![事件组图](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/19_8_41_56_202505190841950.png)

事件组用一个整数来表示，其中的高8位留给内核使用，只能用其他的位来表示事件。那么这个整数是多少位的？

- 如果conﬁgUSE_16_BIT_TICKS是1，那么这个整数就是16位的，低8位用来表示事件
- 如果conﬁgUSE_16_BIT_TICKS是0，那么这个整数就是32位的，低24位用来表示事件
- conﬁgUSE_16_BIT_TICKS是用来表示Tick Count的，怎么会影响事件组？这只是基于效率来考虑
  - 如果conﬁgUSE_16_BIT_TICKS是1，就表示该处理器使用16位更高效，所以事件组也使用16位
  - 如果conﬁgUSE_16_BIT_TICKS是0，就表示该处理器使用32位更高效，所以事件组也使用32位

事件组和队列、信号量等不太一样，主要集中在两个地方：

1. 唤醒谁？
   - 队列、信号量：事件发生时，只会唤醒一个任务
   - 事件组：事件发生时，会唤醒所有符号条件的任务，简单地说它有"广播"的作用
2. 是否清除事件？
   - 队列、信号量：是消耗型的资源，队列的数据被读走就没了；信号量被获取后就减少了
   - 事件组：被唤醒的任务有两个选择，可以让事件保留不动，也可以清除事件

以上图为列，事件组的常规操作如下：

- 先创建事件组
- 任务C、D等待事件：
  - 等待什么事件？可以等待某一位、某些位中的任意一个，也可以等待多位。简单地说就是"或"、"与"的关系。
  - 得到事件时，要不要清除？可选择清除、不清除。
- 任务A、B产生事件：设置事件组里的某一位、某些位

## 函数

### 创建

使用事件组之前，要先创建，得到一个句柄；使用事件组时，要使用句柄来表明使用哪个事件组。

有两种创建方法：动态分配内存、静态分配内存。函数原型如下：

```c
/* 创建一个事件组，返回它的句柄。
* 此函数内部会分配事件组结构体
* 返回值: 返回句柄，非NULL表示成功
*/
EventGroupHandle_t xEventGroupCreate( void );

/* 创建一个事件组，返回它的句柄。
* 此函数无需动态分配内存，所以需要先有一个StaticEventGroup_t结构体，并传入它的指针
* 返回值: 返回句柄，非NULL表示成功
*/
EventGroupHandle_t xEventGroupCreateStatic( StaticEventGroup_t *
pxEventGroupBuffer );
```



### 删除

对于动态创建的事件组，不再需要它们时，可以删除它们以回收内存。vEventGroupDelete可以用来删除事件组，函数原型如下：

```c
/*
* xEventGroup: 事件组句柄，你要删除哪个事件组
*/
void vEventGroupDelete( EventGroupHandle_t xEventGroup )
```

### 设置事件

可以设置事件组的某个位、某些位，使用的函数有2个：

- 在任务中使用 xEventGroupSetBits()
- 在ISR中使用 xEventGroupSetBitsFromISR()

有一个或多个任务在等待事件，如果这些事件符合这些任务的期望，那么任务还会被唤醒。

函数原型如下：

```c
/* 设置事件组中的位
* xEventGroup: 哪个事件组
* uxBitsToSet: 设置哪些位?
*	如果uxBitsToSet的bitX, bitY为1, 那么事件组中的bitX, bitY被设置为1
* 	可以用来设置多个位，比如 0x15 就表示设置bit4, bit2, bit0
* 返回值: 返回原来的事件值(没什么意义, 因为很可能已经被其他任务修改了)
*/
EventBits_t xEventGroupSetBits( EventGroupHandle_t xEventGroup,const EventBits_t uxBitsToSet );

/* 设置事件组中的位
* xEventGroup: 哪个事件组
* uxBitsToSet: 设置哪些位?
* 	如果uxBitsToSet的bitX, bitY为1, 那么事件组中的bitX, bitY被设置为1
*   可以用来设置多个位，比如 0x15 就表示设置bit4, bit2, bit0
* pxHigherPriorityTaskWoken: 有没有导致更高优先级的任务进入就绪态? pdTRUE-有,
pdFALSE-没有
* 返回值: pdPASS-成功, pdFALSE-失败
*/
BaseType_t xEventGroupSetBitsFromISR( EventGroupHandle_t xEventGroup, const EventBits_t uxBitsToSet, BaseType_t * pxHigherPriorityTaskWoken );
```

值得注意的是，ISR中的函数，比如队列函数 xQueueSendToBackFromISR 、信号量函数xSemaphoreGiveFromISR ，它们会唤醒某个任务，最多只会唤醒1个任务。

但是设置事件组时，有可能导致多个任务被唤醒，这会带来很大的不确定性。所以xEventGroupSetBitsFromISR 函数不是直接去设置事件组，而是给一个FreeRTOS后台任务(daemon task)发送队列数据，由这个任务来设置事件组。

如果后台任务的优先级比当前被中断的任务优先级高， xEventGroupSetBitsFromISR 会设置*pxHigherPriorityTaskWoken 为pdTRUE。

如果daemon task成功地把队列数据发送给了后台任务，那么 xEventGroupSetBitsFromISR 的返回值就是pdPASS。

### 等待事件

使用 xEventGroupWaitBits 来等待事件，可以等待某一位、某些位中的任意一个，也可以等待多位；等到期望的事件后，还可以清除某些位。函数原型如下：

```c
EventBits_t xEventGroupWaitBits( EventGroupHandle_t xEventGroup, const EventBits_t uxBitsToWaitFor, const BaseType_t xClearOnExit, const BaseType_t xWaitForAllBits, TickType_t xTicksToWait );
```

先引入一个概念：unblock condition。一个任务在等待事件发生时，它处于阻塞状态；当期望的事件发生时，这个状态就叫"unblock condition"，非阻塞条件，或称为"非阻塞条件成立"；当"非阻塞条件成立"后，该任务就可以变为就绪态。函数参数说明列表如下：



| 参数            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| xEventGroup     | 等待哪个事件组？                                             |
| uxBitsToWaitFor | 等待哪些位？哪些位要被测试？                                 |
| xWaitForAllBits | 怎么测试？是"AND"还是"OR"? pdTRUE:等待的位，全部为1; pdFALSE:等待的位，某一个为1即可 |
| xClearOnExit    | 函数提出前是否要清除事件？ pdTRUE:清除uxBitsToWaitFor指定的位 pdFALSE:不清除 |
| xTicksToWait    | 如果期待的事件未发生，阻塞多久。 可以设置为0：判断后即刻返回； 可设置为portMAX_DELAY：一定等到成功才返回； 可以设置为期望的TickCount，一般用pdMS_To_TICKSC）把ms转换为Tick Count |
| 返回值          | 返回的是事件值， 如果期待的事件发生了，返回的是"非阻塞条件成立"时的事件值； 如果是超时退出，返回的是超时时刻的事件值。 |

举例如下：

| 事件组的 值 | uxBitsToWaitFor | xWaitForAllBits | 说明                                                         |
| ----------- | --------------- | --------------- | ------------------------------------------------------------ |
| 0100        | 0101            | pdTRUE          | 任务期望bit0,bit2都为1， 当前值只有bit2满足，任务进入阻塞 态； 当事件组中bit0,bit2都为1时退出阻塞态 |
| 0100        | 0110            | pdFALSE         | 任务期望bit0,bit2某一个为1， 当前值满足，所以任务成功退出    |
| 0100        | 0110            | pdTRUE          | 任务期望bit1,bit2都为1， 当前值不满足，任务进入阻塞态； 当事件组中bit1,bit2都为1时退出阻 塞态 |

你可以使用 xEventGroupWaitBits() 等待期望的事件，它发生之后再使用 xEventGroupClearBits()来清除。但是这两个函数之间，有可能被其他任务或中断抢占，它们可能会修改事件组。可以使用设置 xClearOnExit 为pdTRUE，使得对事件组的测试、清零都在 xEventGroupWaitBits()函数内部完成，这是一个原子操作。

### 同步点

有一个事情需要多个任务协同，比如：

- 任务A：炒菜
- 任务B：买酒
- 任务C：摆台
- A、B、C做好自己的事后，还要等别人做完；大家一起做完，才可开饭

使用 xEventGroupSync() 函数可以同步多个任务：

- 可以设置某位、某些位，表示自己做了什么事
- 可以等待某位、某些位，表示要等等其他任务
- 期望的时间发生后， xEventGroupSync() 才会成功返回。
- xEventGroupSync 成功返回后，会清除事件

xEventGroupSync 函数原型如下：

```c
EventBits_t xEventGroupSync(EventGroupHandle_t xEventGroup, const EventBits_t uxBitsToSet, const EventBits_t uxBitsToWaitFor,TickType_t xTicksToWait );
```

参数列表如下：

| 参数            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| xEventGroup     | 哪个事件组？                                                 |
| uxBitsToSet     | 要设置哪些事件？我完成了哪些事件？ 比如0x05(二进制为0101)会导致事件组的bit0,bit2被设置为1 |
| uxBitsToWaitFor | 等待那个位、哪些位？ 比如0x15(二级制10101)，表示要等待bit0,bit2,bit4都为1 |
| xTicksToWait    | 如果期待的事件未发生，阻塞多久。 可以设置为0：判断后即刻返回； 可设置为portMAX_DELAY：一定等到成功才返回； 可以设置为期望的Tick Count，一般用 pdMs_To_TICKSC）把ms转换为Tick Count |
| 返回值          | 返回的是事件值， 如果期待的事件发生了，返回的是"非阻塞条件成立"时的事件值； 如果是超时退出，返回的是超时时刻的事件值。 |

## 示例

### 等待多个事件

要使用事件组，代码中要引入如下头文件：

```c
/* 1. 工程中添加event_groups.c */

/* 2. 源码中包含头文件 */
#include "event_groups.h"
```

假设大厨要等手下做完这些事才可以炒菜：洗菜、生火。

本程序创建3个任务：

- 任务1：洗菜
- 任务2：生火
- 任务3：炒菜。

main函数代码如下，它创建了3个任务：

```c
int main( void )
{
    prvSetupHardware();
    /* 创建递归锁 */
    xEventGroup = xEventGroupCreate( );
    if( xEventGroup != NULL )
    {
        /* 创建3个任务: 洗菜/生火/炒菜*/
        xTaskCreate( vWashingTask, "Task1", 1000, NULL, 1, NULL );
        xTaskCreate( vFiringTask,  "Task2", 1000, NULL, 2, NULL );
        xTaskCreate( vCookingTask, "Task3", 1000, NULL, 3, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建事件组 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

任务代码如下：

```c
#define WASHING  (1<<0)
#define FIRING   (1<<1)
#define COOKING  (1<<2)

/*-----------------------------------------------------------*/
static void vWashingTask( void *pvParameters )
{
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		printf("I am washing %d time....\r\n", i++);
		
		/* 发出事件: 我洗完菜了 */
		xEventGroupSetBits(xEventGroup, WASHING);	
		
		/* 等待大厨炒完菜, 再继续洗菜 */
		xEventGroupWaitBits(xEventGroup, COOKING, pdTRUE, pdTRUE, portMAX_DELAY);
	}
}

static void vFiringTask( void *pvParameters )
{
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 等待洗完菜, 才生火 */
		xEventGroupWaitBits(xEventGroup, WASHING, pdFALSE, pdTRUE, portMAX_DELAY);
		
		printf("I am firing %d time....\r\n", i++);

		/* 发出事件: 我生好火了 */
		xEventGroupSetBits(xEventGroup, FIRING);			
	}
}

static void vCookingTask( void *pvParameters )
{
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 等待2件事: 洗菜, 生火 */
		xEventGroupWaitBits(xEventGroup, WASHING|FIRING, pdTRUE, pdTRUE, portMAX_DELAY);
		
		printf("I am cooking %d time....\r\n", i++);
		
		/* 发出事件: 我炒好菜了 */
		xEventGroupSetBits(xEventGroup, COOKING);			
	}
}

/*-----------------------------------------------------------*/
```

这3个任务的代码和执行流程如下：

- A："炒菜任务"优先级最高，先执行。它要等待的2个事件未发生：洗菜、生火，进入阻塞状态
- B："生火任务"接着执行，它要等待的1个事件未发生：洗菜，进入阻塞状态
- C："洗菜任务"接着执行，它洗好菜，发出事件：洗菜，然后调用F等待"炒菜"事件
- D："生火任务"等待的事件满足了，从B处继续执行，开始生火、发出"生火"事件
- E："炒菜任务"等待的事件满足了，从A出继续执行，开始炒菜、发出"炒菜"事件
- F："洗菜任务"等待的事件满足了，退出F、继续执行C

要注意的是，代码B处等待到"洗菜任务"后并不清除该事件，如果清除的话会导致"炒菜任务"无法执行。

![等待多个事件执行顺序](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/20_8_25_20_202505200825567.png)

运行结果如下所示：

![等待多个事件的结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/20_8_28_24_202505200828757.png)

### 任务同步

假设ABC三人要吃饭，各司其职：

- A：炒菜
- B：买酒
- C：摆台

三人都做完后，才可以开饭。

main函数代码如下：

```c
int main( void )
{
    prvSetupHardware();
    /* 创建递归锁 */
    xEventGroup = xEventGroupCreate( );
    if( xEventGroup != NULL )
    {
        /* 创建3个任务: 洗菜/生火/炒菜*/
        xTaskCreate( vCookingTask, "task1", 1000, "A", 1, NULL );
        xTaskCreate( vBuyingTask,  "task2", 1000, "B", 2, NULL );
        xTaskCreate( vTableTask,   "task3", 1000, "C", 3, NULL );
        /* 启动调度器 */
        vTaskStartScheduler();
    }
    else
    {
        /* 无法创建事件组 */
    }
    /* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
    return 0;
}
```

任务代码如下：

```c
/*-----------------------------------------------------------*/
static void vCookingTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );		
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 做自己的事 */
		printf("%s is cooking %d time....\r\n", (char *)pvParameters, i);
		
		/* 表示我做好了, 还要等别人都做好 */
		xEventGroupSync(xEventGroup, COOKING, ALL, portMAX_DELAY);
	
		/* 别人也做好了, 开饭 */
		printf("%s is eating %d time....\r\n", (char *)pvParameters, i++);
		vTaskDelay(xTicksToWait);
	}
}

static void vBuyingTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );		
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 做自己的事 */
		printf("%s is buying %d time....\r\n", (char *)pvParameters, i);
		
		/* 表示我做好了, 还要等别人都做好 */
		xEventGroupSync(xEventGroup, BUYING, ALL, portMAX_DELAY);
	
		/* 别人也做好了, 开饭 */
		printf("%s is eating %d time....\r\n", (char *)pvParameters, i++);
		vTaskDelay(xTicksToWait);
	}
}

static void vTableTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 100UL );		
	int i = 0;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 做自己的事 */
		printf("%s is do the table %d time....\r\n", (char *)pvParameters, i);
		
		/* 表示我做好了, 还要等别人都做好 */
		xEventGroupSync(xEventGroup, TABLE, ALL, portMAX_DELAY);
	
		/* 别人也做好了, 开饭 */
		printf("%s is eating %d time....\r\n", (char *)pvParameters, i++);
		vTaskDelay(xTicksToWait);
	}
}


/*-----------------------------------------------------------*/
```

要点在于 xEventGroupSync 函数，它有3个功能：

- 设置事件：表示自己完成了某个、某些事件
- 等待事件：跟别的任务同步
- 成功返回后，清除"等待的事件"

运行结果如下图所示：

![任务同步结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/20_8_41_34_202505200841656.png)

# 任务通知

所谓"任务通知"，你可以反过来读"通知任务"。

我们使用队列、信号量、事件组等等方法时，并不知道对方是谁。使用任务通知时，可以明确指定：通知哪个任务。使用队列、信号量、事件组时，我们都要事先创建对应的结构体，双方通过中间的结构体通信：

![队列、信号量、事件组的通知方式](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/20_8_49_55_202505200849035.png)

使用任务通知时，任务结构体TCB中就包含了内部对象，可以直接接收别人发过来的"通知"：

![任务通知执行方式](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/05/20_8_50_37_202505200850598.png)





## 任务通知的特性

### 优势和限制

任务通知的优势：

- 效率更高：使用任务通知来发送事件、数据给某个任务时，效率更高。比队列、信号量、事件组都有大的优势。
- 更节省内存：使用其他方法时都要先创建对应的结构体，使用任务通知时无需额外创建结构体。

任务通知的限制：

- 不能发送数据给ISR：ISR并没有任务结构体，所以无法使用任务通知的功能给ISR发送数据。但是ISR可以使用任务通知的功能，发数据给任务。
- 数据只能给该任务独享：使用队列、信号量、事件组时，数据保存在这些结构体中，其他任务、ISR都可以访问这些数据。使用任务通知时，数据存放入目标任务中，只有它可以访问这些数据。在日常工作中，这个限制影响不大。因为很多场合是从多个数据源把数据发给某个任务，而不是把一个数据源的数据发给多个任务。
- 无法缓冲数据：使用队列时，假设队列深度为N，那么它可以保持N个数据。使用任务通知时，任务结构体中只有一个任务通知值，只能保持一个数据。
- 无法广播给多个任务：使用事件组可以同时给多个任务发送事件。使用任务通知，只能发个一个任务。
- 如果发送受阻，发送方无法进入阻塞状态等待，假设队列已经满了，使用 xQueueSendToBack() 给队列发送数据时，任务可以进入阻塞状态等待。
- 发送完成：使用任务通知时，即使对方无法接收数据，发送方也无法阻塞等待，只能即刻返回错误。

### 通知状态和通信值

每个任务都有一个结构体：TCB(Task Control Block)，里面有2个成员：

- 一个是uint8_t类型，用来表示通知状态
- 一个是uint32_t类型，用来表示通知值

```c
typedef struct tskTaskControlBlock
{
  ......
   /* configTASK_NOTIFICATION_ARRAY_ENTRIES = 1 */
   volatile uint32_t ulNotifiedValue[ configTASK_NOTIFICATION_ARRAY_ENTRIES ];
   volatile uint8_t ucNotifyState[ configTASK_NOTIFICATION_ARRAY_ENTRIES ];
  ......
} tskTCB;
```

通知状态有3种取值：

- `taskNOT_WAITING_NOTIFICATION`：任务没有在等待通知
- `taskWAITING_NOTIFICATION`：任务在等待通知
- `taskNOTIFICATION_RECEIVED`：任务接收到了通知，也被称为pending(有数据了，待处理)

```c
##define taskNOT_WAITING_NOTIFICATION             ( ( uint8_t ) 0 )  /* 也是初始状态 */
##define taskWAITING_NOTIFICATION                 ( ( uint8_t ) 1 )
##define taskNOTIFICATION_RECEIVED                 ( ( uint8_t ) 2 )
```

通知值可以有很多种类型：

- 计数值
- 位(类似事件组)
- 任意数值

## 函数

使用任务通知，可以实现轻量级的队列(长度为1)、邮箱(覆盖的队列)、计数型信号量、二进制信号量、事件组。

任务通知有2套函数，简化版、专业版，列表如下：

- 简化版函数的使用比较简单，它实际上也是使用专业版函数实现的
- 专业版函数支持很多参数，可以实现很多功能

|          | 简化版                                 | 专业版                         |
| -------- | -------------------------------------- | ------------------------------ |
| 发出通知 | xTaskNotifyGive vTaskNotifyGiveFromISR | xTaskNotify xTaskNotifyFromlSR |
| 取出通知 | ulTaskNotifyTake                       | xTaskNotifyWait                |

### `xTaskNotifyGive/ulTaskNotifyTake`

在任务中使用xTaskNotifyGive函数，在ISR中使用vTaskNotifyGiveFromISR函数，都是直接给其他任务发送通知：

- 使得通知值加一
- 并使得通知状态变为"pending"，也就是 taskNOTIFICATION_RECEIVED ，表示有数据了、待处理

可以使用ulTaskNotifyTake函数来取出通知值：

- 如果通知值等于0，则阻塞(可以指定超时时间)
- 当通知值大于0时，任务从阻塞态进入就绪态
- 在ulTaskNotifyTake返回之前，还可以做些清理工作：把通知值减一，或者把通知值清零

使用ulTaskNotifyTake函数可以实现轻量级的、高效的二进制信号量、计数型信号量。

这几个函数的原型如下：

```c
BaseType_t xTaskNotifyGive( TaskHandle_t xTaskToNotify );
void vTaskNotifyGiveFromISR( TaskHandle_t xTaskHandle, BaseType_t *pxHigherPriorityTaskWoken );
uint32_t ulTaskNotifyTake( BaseType_t xClearCountOnExit, TickType_t xTicksToWait);
```

xTaskNotifyGive函数的参数说明如下：

| 参数          | 说明                                       |
| ------------- | ------------------------------------------ |
| xTaskToNotify | 任务句柄(创建任务时得到)，给哪个任务发通知 |
| 返回值        | 必定返回pdPASS                             |

vTaskNotifyGiveFromISR函数的参数说明如下：

| 参数                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| xTaskHandle               | 任务句柄(创建任务时得到)，给哪个任务发通知                   |
| pxHigherPriorityTaskWoken | 被通知的任务，可能正处于阻塞状态。 此函数发出通知后，会把它从阻塞状态切换为就绪态。 如果被唤醒的任务的优先级，高于当前任务的优先级， 则"*pxHigherPriorityTaskWoken"被设置为pdTRUE， 这表示在中断返回之前要进行任务切换。 |

ulTaskNotifyTake函数的参数说明如下：

| 参数              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| xClearCountOnExit | 函数返回前是否清零： pdTRUE：把通知值清零 pdFALSE：如果通知值大于O，则把通知值减一 |
| xTicksToWait      | 任务进入阻塞态的超时时间，它在等待通知值大于0。 0：不等待，即刻返回； portMAX_DELAY：一直等待，直到通知值大于O; 其他值：Tick Count，可以用 pdMS_To_TICKSC）把ms转换为Tick Count |
| 返回值            | 函数返回之前，在清零或减一之前的通知值。 如果xTicksToWait非O，则返回值有2种情况： 1.大于0：在超时前，通知值被增加了 2.等于0：一直没有其他任务增加通知值，最后超时返回0 |

### `xTaskNotify/xTaskNotifyWait`

xTaskNotify 函数功能更强大，可以使用不同参数实现各类功能，比如：

- 让接收任务的通知值加一：这时 xTaskNotify() 等同于 xTaskNotifyGive()
- 设置接收任务的通知值的某一位、某些位，这就是一个轻量级的、更高效的事件组
- 把一个新值写入接收任务的通知值：上一次的通知值被读走后，写入才成功。这就是轻量级的、长度为1的队列
- 用一个新值覆盖接收任务的通知值：无论上一次的通知值是否被读走，覆盖都成功。类似xQueueOverwrite() 函数，这就是轻量级的邮箱。

xTaskNotify() 比 xTaskNotifyGive() 更灵活、强大，使用上也就更复杂。xTaskNotifyFromISR() 是它对应的ISR版本。

这两个函数用来发出任务通知，使用哪个函数来取出任务通知呢？

使用 xTaskNotifyWait() 函数！它比 ulTaskNotifyTake() 更复杂：

- 可以让任务等待(可以加上超时时间)，等到任务状态为"pending"(也就是有数据)，还可以在函数进入、退出时，清除通知值的指定位

这几个函数的原型如下：

```c
BaseType_t xTaskNotify( TaskHandle_t xTaskToNotify, uint32_t ulValue,eNotifyAction eAction );
BaseType_t xTaskNotifyFromISR( TaskHandle_t xTaskToNotify, uint32_t ulValue, eNotifyAction eAction, BaseType_t *pxHigherPriorityTaskWoken );
BaseType_t xTaskNotifyWait( uint32_t ulBitsToClearOnEntry, uint32_t ulBitsToClearOnExit,uint32_t *pulNotificationValue,
TickType_t xTicksToWait );
```

xTaskNotify函数的参数说明如下：

| 参数          | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| XTaskToNotify | 任务句柄(创建任务时得到)，给哪个任务发通知                   |
| ulValue       | 怎么使用ulValue，由eAction参数决定                           |
| eAction       | 见下表                                                       |
| 返回值        | pdPASS：成功，大部分调用都会成功 pdFAIL：只有一种情况会失败，当eAction为eSetValueWithoutOverwrite， 并且通知状态为"pending"(表示有新数据未读)，这时就会失败。 |

eNotifyAction参数说明：

| eNotifyAction取值         | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| eNoAction                 | 仅仅是更新通知状态为"pending"，未使用ulValue。 这个选项相当于轻量级的、更高效的二进制信号量。 |
| eSetBits                  | 通知值=原来的通知值丨ulValue，按位或。 相当于轻量级的、更高效的事件组。 |
| elncrement                | 通知值=原来的通知值+1，未使用ulValue。 相当于轻量级的、更高效的二进制信号量、计数型信号量。 相当于xTaskNotifyGive（）函数。 eNotifyAction取值 |
| eSetvalueWithoutOverwrite | 不覆盖。<br/>如果通知状态为"pending"(表示有数据未读)，则此次调用xTaskNotify不做任何事，返回pdFAIL<br>说明：如果通知状态不是“pending”（表示没有新数据），则通知值=uValue |
| eSetValueWithOverwrite    | 覆盖。<br/>无论如何，不管通知状态是否为"pendng"，<br/>通知值 = ulValue。 |

xTaskNotifyFromISR函数跟xTaskNotify很类似，就多了最后一个参数pxHigherPriorityTaskWoken 。在很多ISR函数中，这个参数的作用都是类似的，使用场景如下：

- 被通知的任务，可能正处于阻塞状态
- xTaskNotifyFromISR 函数发出通知后，会把接收任务从阻塞状态切换为就绪态
- 如果被唤醒的任务的优先级，高于当前任务的优先级，则"*pxHigherPriorityTaskWoken"被设置为pdTRUE，这表示在中断返回之前要进行任务切换。

xTaskNotifyWait函数列表如下：

| 参数                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| ulBitsToClearOnEntry | 在xTaskNotifyWait入口处，要清除通知值的哪些位？ 通知状态不是"pending"的情况下，才会清除。 它的本意是：我想等待某些事件发生，所以先把"旧数据"的某些位清 零。 能清零的话：通知值=通知值&~(ulBitsToClearOnEntry)。 比如传入0x01，表示清除通知值的bit0; 传入0xffffl即ULLONG_MAAX，表示清除所有位，即把值设置为0 |
| ulBitsToClearOnExit  | 在xTaskNotifyWait出口处，如果不是因为超时推出，而是因为得到了 数据而退出时： 通知值=通知值&~(ulBitsToClearOnExit)。 在清除某些位之前，通知值先被赋给"*pulNotificationValue"。 比如入0x03，表示清除通知值的bit0、bit1; 传入Oxffffl即ULONG_MAX，表示清除所有位，即把值设置为0 |
| pulNotificationvalue | 用来取出通知值。 在函数退出时，使用ulBitsToClearOnExit清除之前，把通知值赋 给"*pulNotificationValue"。 如果不需要取出通知值，可以设为NULL。 |
| xTicksToWait         | 任务进入阻塞态的超时时间，它在等待通知状态变为"pending"。 0：不等待，即刻返回； portMAX_DELAY：一直等待，直到通知状态变为"pending"; 其他值：Tick Count，可以用 pdMS_To_TICKSO）把ms转换为Tick Count |
| 返回值               | 1.pdPASS:成功 这表示xTaskNotifyWait成功获得了通知： 可能是调用函数之前，通知状态就是"pending"; 也可能是在阻塞期间，通知状态变为了"pending"。 <br>2.pdFAIL：没有得到通知。 |

## 示例

### 传输计数值

本程序创建2个任务：

- 发送任务：把数据写入唤醒缓冲区，使用 xTaskNotifyGive() 让通知值加一
- 接收任务：使用 ulTaskNotifyTake() 取出通知值，这表示字符数。

代码如下：

```c
int main( void )
{
	prvSetupHardware();

	/* 创建1个任务用于发送任务通知
	 * 优先级为2
	 */
	xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );

	/* 创建1个任务用于接收任务通知
	 * 优先级为1
	 */
	 xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, &xRecvTask );

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}

/*-----------------------------------------------------------*/
/* 环形缓冲区 */
#define BUF_LEN  32
#define NEXT_PLACE(i) ((i+1)&0x1F)

uint8_t txbuf[BUF_LEN];
uint32_t tx_r = 0;
uint32_t tx_w = 0;

static int is_txbuf_empty(void)
{
	return tx_r == tx_w;
}

static int is_txbuf_full(void)
{
	return NEXT_PLACE(tx_w) == tx_r;
}

static int txbuf_put(unsigned char val)
{
	if (is_txbuf_full())
		return -1;
	txbuf[tx_w] = val;
	tx_w = NEXT_PLACE(tx_w);
	return 0;
}

static int txbuf_get(unsigned char *pval)
{
	if (is_txbuf_empty())
		return -1;
	*pval = txbuf[tx_r];
	tx_r = NEXT_PLACE(tx_r);
	return 0;
}

/*-----------------------------------------------------------*/

static void vSenderTask( void *pvParameters )
{
	int i;
	int cnt_tx = 0;
	int cnt_ok = 0;
	int cnt_err = 0;
	char c;
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 20UL );	
	
	/* 无限循环 */
	for( ;; )
	{		
		for (i = 0; i < 3; i++)
		{
			/* 放入数据 */
			c = 'a'+cnt_tx;
			txbuf_put(c);
			cnt_tx++;
			
			/* 发出任务通知 */
			if (xTaskNotifyGive(xRecvTask) == pdPASS)
				printf("xTaskNotifyGive %d time: OK, val :%c\r\n", cnt_ok++, c);
			else
				printf("xTaskNotifyGive %d time: ERR\r\n", cnt_err++);
		}
				
		vTaskDelay(xTicksToWait);
	}
}
/*-----------------------------------------------------------*/

static void vReceiverTask( void *pvParameters )
{
	int cnt_ok = 0;
	uint8_t c;
	int notify_val;
	
	/* 无限循环 */
	for( ;; )
	{
		/* 得到了任务通知, 让通知值清零 */
		notify_val = ulTaskNotifyTake(pdTRUE, portMAX_DELAY);

		/* 打印这几个字符 */
		printf("ulTaskNotifyTake OK: %d, data: ", cnt_ok++);
		
		/* 一次性把所有数据取出来 */
		while (notify_val--)
		{
			txbuf_get(&c);
			printf("%c", c);
		}
		printf("\r\n");

	}
}

```



发送任务、接收任务的代码和执行流程如下：

- A：发送任务优先级最高，先执行。连续存入3个字符、发出3次任务通知：通知值累加为3
- B：发送任务阻塞，让接收任务能执行
- C：接收任务读到通知值为3，并把通知值清零
- D：把3个字符依次读出、打印
- E：再次读取任务通知，阻塞

![传输计数值运行代码](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_24_5_202506100824144.png)

运行结果如下：

![传输计数值运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_25_49_202506100825866.png)

本程序使用 xTaskNotifyGive/ulTaskNotifyTake 实现了轻量级的计数型信号量，代码更简单：

- 无需创建信号量
- 消耗内存更少
- 效率更高

信号量是个公开的资源，任何任务、ISR都可以使用它：可以释放、获取信号量。

### 传输任意值

在上述例子中使用任务通知来传输计数值、传输通知。

本节程序使用任务通知来传输任意数据，它创建2个任务：

- 发送任务：把数据通过 xTaskNotify() 发送给其他任务
- 接收任务：使用 xTaskNotifyWait 取出通知值，这表示字符，并打印出来

代码如下：

```c
int main( void )
{
	prvSetupHardware();

	/* 创建1个任务用于发送任务通知
	 * 优先级为2
	 */
	xTaskCreate( vSenderTask, "Sender", 1000, NULL, 2, NULL );

	/* 创建1个任务用于接收任务通知
	 * 优先级为1
	 */
	 xTaskCreate( vReceiverTask, "Receiver", 1000, NULL, 1, &xRecvTask );

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}

/*-----------------------------------------------------------*/

/*-----------------------------------------------------------*/

static void vSenderTask( void *pvParameters )
{
	int i;
	int cnt_tx = 0;
	int cnt_ok = 0;
	int cnt_err = 0;
	char c;
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 20UL );	
	
	/* 无限循环 */
	for( ;; )
	{		
		for (i = 0; i < 3; i++)
		{
			/* 放入数据 */
			c = 'a'+cnt_tx;
			cnt_tx++;
			
			/* 发出任务通知 
			 * 发给谁? xRecvTask
			 * 发什么? c
			 * 能否覆盖? 不能, eSetValueWithoutOverwrite
			 */
			if (xTaskNotify(xRecvTask, 
							(uint32_t)c, /* 发送的数据 */
							eSetValueWithoutOverwrite) == pdPASS)
				printf("xTaskNotify %d time: OK, val :%c\r\n", cnt_ok++, c);
			else
				printf("xTaskNotify %d time: ERR, val :%c\r\n", cnt_err++, c);
		}
				
		vTaskDelay(xTicksToWait);
	}
}
/*-----------------------------------------------------------*/

static void vReceiverTask( void *pvParameters )
{
	int cnt_ok = 0;	
	uint32_t ulValue;
	BaseType_t xResult;	
	
	/* 无限循环 */
	for( ;; )
	{
		/* 等待数据 */
		xResult = xTaskNotifyWait(
					0, /* 发送任务会存入新数据, 无需接收方在进入函数时清零 */
					0, /* 发送任务会存入新数据, 无需接收方在退出函数时清零 */
					&ulValue, /* 用来保存读出的数据 */		
					portMAX_DELAY /* 一直等待数据 */
				);

		/* 打印这个字符 */
		if (xResult == pdPASS)
			printf("xTaskNotifyWait OK: %d, data: %c\r\n",
				cnt_ok++, (char)ulValue);		
	}
}

```

发送任务、接收任务的代码和执行流程如下：

- A：发送任务优先级最高，先执行。连续给对方任务发送3个字符，只成功了1次
- B：发送任务阻塞，让接收任务能执行
- C：接收任务读取通知值
- D：把读到的通知值作为字符打印出来
- E：再次读取任务通知，阻塞

![传输任意值代码](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_33_13_202506100833134.png)

传输任意值的传输结果如下

![传输任意值的运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_34_37_202506100834424.png)

本程序使用 xTaskNotify/xTaskNotifyWait 实现了轻量级的队列(该队列长度只有1)，代码更简单：

- 无需创建队列
- 消耗内存更少
- 效率更高

队列是个公开的资源，任何任务、ISR都可以使用它：可以存入数据、取出数据。

发送任务只能给指定的任务发送通知，目标明确；接收任务只能从自己的通知值中得到数据，来源明确。

# 软件定时器

软件定时器就是"闹钟"，你可以设置闹钟，

- 在30分钟后让你起床工作
- 每隔1小时让你例行检查机器运行情况

软件定时器也可以完成两类事情：

- 在"未来"某个时间点，运行函数
- 周期性地运行函数

日常生活中我们可以定无数个"闹钟"，这无数的"闹钟"要基于一个真实的闹钟。在FreeRTOS里，我们也可以设置无数个"软件定时器"，它们都是基于系统滴答中断(Tick Interrupt)。

## 软件定时器的特性

使用定时器跟使用手机闹钟是类似的：

- 指定时间：启动定时器和运行回调函数，两者的间隔被称为定时器的周期(period)。
- 指定类型，定时器有两种类型：
  - 一次性(One-shot timers)：这类定时器启动后，它的回调函数只会被调用一次；可以手工再次启动它，但是不会自动启动它。
  - 自动加载定时器(Auto-reload timers )：这类定时器启动后，时间到之后它会自动启动它；这使得回调函数被周期性地调用。指定要做什么事，就是指定回调函数

实际的闹钟分为：有效、无效两类。软件定时器也是类似的，它由两种状态：

- 运行(Running、Active)：运行态的定时器，当指定时间到达之后，它的回调函数会被调用
- 冬眠(Dormant)：冬眠态的定时器还可以通过句柄来访问它，但是它不再运行，它的回调函数不会被调用

定时器运行情况示例如下：

![软件定时器的运行状况](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_42_56_202506100842545.png)

Timer1：它是一次性的定时器，在t1启动，周期是6个Tick。经过6个tick后，在t7执行回调函数。它的回调函数只会被执行一次，然后该定时器进入冬眠状态。

Timer2：它是自动加载的定时器，在t1启动，周期是5个Tick。每经过5个tick它的回调函数都被执行，比如在t6、t11、t16都会执行。

## 软件定时器的上下文

### 守护任务

要理解软件定时器API函数的参数，特别是里面的 xTicksToWait ，需要知道定时器执行的过程。

FreeRTOS中有一个Tick中断，软件定时器基于Tick来运行。在哪里执行定时器函数？第一印象就是在Tick中断里执行：

- 在Tick中断中判断定时器是否超时
- 如果超时了，调用它的回调函数

FreeRTOS是RTOS，它不允许在内核、在中断中执行不确定的代码：如果定时器函数很耗时，会影响整个系统。所以，FreeRTOS中，不在Tick中断中执行定时器函数。

在哪里执行？在某个任务里执行，这个任务就是：RTOS Damemon Task，RTOS守护任务。以前被称为"Timer server"，但是这个任务要做并不仅仅是定时器相关，所以改名为：RTOS Damemon Task。

当FreeRTOS的配置项 configUSE_TIMERS 被设置为1时，在启动调度器时，会自动创建RTOSDamemon Task。我们自己编写的任务函数要使用定时器时，是通过"定时器命令队列"(timer command queue)和守护任务交互，如下图所示：

![守护任务](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_47_58_202506100847904.png)

守护任务的优先级为：conﬁgTIMER_TASK_PRIORITY；定时器命令队列的长度为conﬁgTIMER_QUEUE_LENGTH。

### 守护任务调度

守护任务的调度，跟普通的任务并无差别。当守护任务是当前优先级最高的就绪态任务时，它就可以运行。它的工作有两类：

- 处理命令：从命令队列里取出命令、处理
- 执行定时器的回调函数

能否及时处理定时器的命令、能否及时执行定时器的回调函数，严重依赖于守护任务的优先级。下面使用2个例子来演示。

1. 守护任务的优先性级较低

   - t1：Task1处于运行态，守护任务处于阻塞态。守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。至于守护任务能否马上执行，取决于它的优先级。
   - t2：Task1调用 xTimerStart()，要注意的是， xTimerStart() 只是把"start timer"的命令发给"定时器命令队列"，使得守护任务退出阻塞态。在本例中，Task1的优先级高于守护任务，所以守护任务无法抢占Task1。
   - t3：Task1执行完 xTimerStart()，但是定时器的启动工作由守护任务来实现，所以 xTimerStart() 返回并不表示定时器已经被启动了。
   - t4：Task1由于某些原因进入阻塞态，现在轮到守护任务运行。守护任务从队列中取出"start timer"命令，启动定时器。
   - t5：守护任务处理完队列中所有的命令，再次进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。注意：假设定时器在后续某个时刻tX超时了，超时时间是"tX-t2"，而非"tX-t4"，从xTimerStart() 函数被调用时算起。

   ![守护任务优先级较低](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_8_56_31_202506100856017.png)

2. 例子2：守护任务的优先性级较高

   - t1：Task1处于运行态，守护任务处于阻塞态。守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。至于守护任务能否马上执行，取决于它的优先级。
   - t2：Task1调用 xTimerStart()，要注意的是， xTimerStart() 只是把"start timer"的命令发给"定时器命令队列"，使得守护任务退出阻塞态。在本例中，守护任务的优先级高于Task1，所以守护任务抢占Task1，守护任务开始处理命令队列。Task1在执行 xTimerStart() 的过程中被抢占，这时它无法完成此函数。
   - t3：守护任务处理完命令队列中所有的命令，再次进入阻塞态。此时Task1是优先级最高的就绪态任务，它开始执行。
   - t4：Task1之前被守护任务抢占，对 xTimerStart() 的调用尚未返回。现在开始继续运行次函数、返回。
   - t5：Task1由于某些原因进入阻塞态，进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。

   ![守护任务优先级较高](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/10_9_0_48_202506100900411.png)

   注意，定时器的超时时间是基于调用 xTimerStart() 的时刻tX，而不是基于守护任务处理命令的时刻tY。假设超时时间是10个Tick，超时时间是"tX+10"，而非"tY+10"。

### 回调函数

定时器的回调函数的原型如下：

```c
void ATimerCallback( TimerHandle_t xTimer );
```

定时器的回调函数是在守护任务中被调用的，守护任务不是专为某个定时器服务的，它还要处理其他定时器。所以，定时器的回调函数不要影响其他人：

- 回调函数要尽快实行，不能进入阻塞状态
- 不要调用会导致阻塞的API函数，比如 vTaskDelay()
- 可以调用 xQueueReceive() 之类的函数，但是超时时间要设为0：即刻返回，不可阻塞

## 软件定时器的函数

根据定时器的状态转换图，就可以知道所涉及的函数：

![软件定时器状态机转换](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/11_8_41_34_202506110841727.png)

### 创建

要使用定时器，需要先创建它，得到它的句柄。有两种方法创建定时器：动态分配内存、静态分配内存。函数原型如下：

```c
/* 使用动态分配内存的方法创建定时器
* pcTimerName:定时器名字, 用处不大, 尽在调试时用到
* xTimerPeriodInTicks: 周期, 以Tick为单位
* uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
* pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
* pxCallbackFunction: 回调函数
* 返回值: 成功则返回TimerHandle_t, 否则返回NULL
*/
TimerHandle_t xTimerCreate( const char * const pcTimerName,
                           const TickType_t xTimerPeriodInTicks,
                           const UBaseType_t uxAutoReload,
                           void * const pvTimerID,
                           TimerCallbackFunction_t pxCallbackFunction );

/* 使用静态分配内存的方法创建定时器
* pcTimerName:定时器名字, 用处不大, 尽在调试时用到
* xTimerPeriodInTicks: 周期, 以Tick为单位
* uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
* pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
* pxCallbackFunction: 回调函数
* pxTimerBuffer: 传入一个StaticTimer_t结构体, 将在上面构造定时器
* 返回值: 成功则返回TimerHandle_t, 否则返回NULL
*/
TimerHandle_t xTimerCreateStatic(const char * const pcTimerName,
                                 TickType_t xTimerPeriodInTicks,
                                 UBaseType_t uxAutoReload,
                                 void * pvTimerID,
                                 TimerCallbackFunction_t pxCallbackFunction,
                                 StaticTimer_t *pxTimerBuffer );
```

回调函数的类型是：

```c
void ATimerCallback( TimerHandle_t xTimer );
typedef void (* TimerCallbackFunction_t)( TimerHandle_t xTimer );
```

### 删除

动态分配的定时器，不再需要时可以删除掉以回收内存。删除函数原型如下：

```c
/* 删除定时器
* xTimer: 要删除哪个定时器
* xTicksToWait: 超时时间
* 返回值: pdFAIL表示"删除命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerDelete( TimerHandle_t xTimer, TickType_t xTicksToWait );
```

定时器的很多API函数，都是通过发送"命令"到命令队列，由守护任务来实现。如果队列满了，"命令"就无法即刻写入队列。我们可以指定一个超时时间 xTicksToWait ，等待一会。

### 启动/停止

启动定时器就是设置它的状态为运行态(Running、Active)。停止定时器就是设置它的状态为冬眠(Dormant)，让它不能运行。涉及的函数原型如下：

```c
/* 启动定时器
* xTimer: 哪个定时器
* xTicksToWait: 超时时间
* 返回值: pdFAIL表示"启动命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerStart( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 启动定时器(ISR版本)
* xTimer: 哪个定时器
* pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
*                           如果守护任务的优先级比当前任务的高,
*                           则"*pxHigherPriorityTaskWoken = pdTRUE",
*                           表示需要进行任务调度
* 返回值: pdFAIL表示"启动命令"无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerStartFromISR(   TimerHandle_t xTimer, BaseType_t *pxHigherPriorityTaskWoken );

/* 停止定时器
* xTimer: 哪个定时器
* xTicksToWait: 超时时间
* 返回值: pdFAIL表示"停止命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerStop( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 停止定时器(ISR版本)
* xTimer: 哪个定时器
* pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
*                           如果守护任务的优先级比当前任务的高,
*                           则"*pxHigherPriorityTaskWoken = pdTRUE",
*                           表示需要进行任务调度
* 返回值: pdFAIL表示"停止命令"无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerStopFromISR(    TimerHandle_t xTimer, BaseType_t *pxHigherPriorityTaskWoken );
```

注意，这些函数的 xTicksToWait 表示的是，把命令写入命令队列的超时时间。命令队列可能已经满了，无法马上把命令写入队列里，可以等待一会。

xTicksToWait 不是定时器本身的超时时间，不是定时器本身的"周期"。创建定时器时，设置了它的周期(period)。 xTimerStart() 函数是用来启动定时器。假设调用xTimerStart() 的时刻是tX，定时器的周期是n，那么在 tX+n 时刻定时器的回调函数被调用。如果定时器已经被启动，但是它的函数尚未被执行，再次执行 xTimerStart() 函数相当于执行xTimerReset() ，重新设定它的启动时间。

### 复位

从定时器的状态转换图可以知道，使用 xTimerReset() 函数可以让定时器的状态从冬眠态转换为运行态，相当于使用 xTimerStart() 函数。如果定时器已经处于运行态，使用 xTimerReset() 函数就相当于重新确定超时时间。假设调用xTimerReset() 的时刻是tX，定时器的周期是n，那么 tX+n 就是重新确定的超时时间。复位函数的原型如下：

```c
/* 复位定时器
* xTimer: 哪个定时器
* xTicksToWait: 超时时间
* 返回值: pdFAIL表示"复位命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerReset( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 复位定时器(ISR版本)
* xTimer: 哪个定时器
* pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
*                           如果守护任务的优先级比当前任务的高,
*                           则"*pxHigherPriorityTaskWoken = pdTRUE",
*                           表示需要进行任务调度
* 返回值: pdFAIL表示"停止命令"无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerResetFromISR(   TimerHandle_t xTimer, BaseType_t *pxHigherPriorityTaskWoken );
```

### 修改周期

从定时器的状态转换图可以知道，使用 xTimerChangePeriod() 函数，处理能修改它的周期外，还可以让定时器的状态从冬眠态转换为运行态。修改定时器的周期时，会使用新的周期重新计算它的超时时间。假设调用 xTimerChangePeriod() 函数的时间tX，新的周期是n，则 tX+n 就是新的超时时间。相关函数的原型如下：

```c
/* 修改定时器的周期
* xTimer: 哪个定时器
* xNewPeriod: 新周期
* xTicksToWait: 超时时间, 命令写入队列的超时时间
* 返回值: pdFAIL表示"修改周期命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerChangePeriod(   TimerHandle_t xTimer,TickType_t xNewPeriod,TickType_t xTicksToWait );
/* 修改定时器的周期
* xTimer: 哪个定时器
* xNewPeriod: 新周期
* pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
*                           如果守护任务的优先级比当前任务的高,
*                           则"*pxHigherPriorityTaskWoken = pdTRUE",
*                           表示需要进行任务调度
* 返回值: pdFAIL表示"修改周期命令"在xTicksToWait个Tick内无法写入队列
*       pdPASS表示成功
*/
BaseType_t xTimerChangePeriodFromISR( TimerHandle_t xTimer,TickType_t xNewPeriod, BaseType_t *pxHigherPriorityTaskWoken );
```

### 定时器ID

定时器的结构体如下，里面有一项 pvTimerID ，它就是定时器ID：

```c
typedef struct tmrTimercontrol
{
    const char *pcTimerName;
    ListItem_t xTimerListItem;
    TickType_t xTimerPeriodInTicks;
    void *pvTimerID;
    TimerCallbackFunction_t pxCallbackFunction;
    #if configUSE_TRACE_FACILITY =1
    UBaseType_t uxTimerNumber;
    #endif
    uint8_t ucstatus;
}XTIMER;
```

怎么使用定时器ID，完全由程序来决定：

- 可以用来标记定时器，表示自己是什么定时器
- 可以用来保存参数，给回调函数使用

它的初始值在创建定时器时由 xTimerCreate() 这类函数传入，后续可以使用这些函数来操作：

- 更新ID：使用 vTimerSetTimerID() 函数
- 查询ID：查询 pvTimerGetTimerID() 函数

这两个函数不涉及命令队列，它们是直接操作定时器结构体。函数原型如下：

```c
/* 获得定时器的ID
* xTimer: 哪个定时器
* 返回值: 定时器的ID
*/
void *pvTimerGetTimerID( TimerHandle_t xTimer );

/* 设置定时器的ID
* xTimer: 哪个定时器
* pvNewID: 新ID
* 返回值: 无
*/
void vTimerSetTimerID( TimerHandle_t xTimer, void *pvNewID );
```



## 示例

### 一般使用

要使用定时器，需要做些准备工作：

```c
/* 1. 工程中 */
//添加 timer.c
/* 2. 配置文件FreeRTOSConfig.h中 */
##define configUSE_TIMERS				1   /* 使能定时器 */
##define configTIMER_TASK_PRIORITY   	31  /* 守护任务的优先级, 尽可能高一些 */
##define configTIMER_QUEUE_LENGTH     	5   /* 命令队列长度 */
##define configTIMER_TASK_STACK_DEPTH 	32  /* 守护任务的栈大小 */
   
/* 3. 源码中 */
##include "timers.h"
```

main函数中创建、启动了2个定时器：一次性的、周期

```c
/* Standard includes. */
#include <stdio.h>

/* Scheduler includes. */
#include "FreeRTOS.h"
#include "task.h"
#include "timers.h"

/* Library includes. */
#include "stm32f10x_it.h"

extern 	void UART_Init(unsigned long ulWantedBaud);

/* Demo app includes. */
static void prvSetupHardware( void );


/*-----------------------------------------------------------*/

static volatile uint8_t flagONEShotTimerRun = 0;
static volatile uint8_t flagAutoLoadTimerRun = 0;

static void vONEShotTimerFunc( TimerHandle_t xTimer );
static void vAutoLoadTimerFunc( TimerHandle_t xTimer );

/*-----------------------------------------------------------*/

#define mainONE_SHOT_TIMER_PERIOD pdMS_TO_TICKS( 10 )
#define mainAUTO_RELOAD_TIMER_PERIOD pdMS_TO_TICKS( 20 )

int main( void )
{
	TimerHandle_t xOneShotTimer;
	TimerHandle_t xAutoReloadTimer;
	
	prvSetupHardware();

	xOneShotTimer = xTimerCreate(	
		"OneShot",                 /* 名字, 不重要 */
		mainONE_SHOT_TIMER_PERIOD, /* 周期 */
		pdFALSE,                   /* 一次性 */
		0,                         /* ID */
		vONEShotTimerFunc          /* 回调函数 */
	);	

	xAutoReloadTimer = xTimerCreate(	
		"AutoReload",                 /* 名字, 不重要 */
		mainAUTO_RELOAD_TIMER_PERIOD, /* 周期 */
		pdTRUE,                       /* 自动加载 */
		0,                            /* ID */
		vAutoLoadTimerFunc            /* 回调函数 */
	);	
	
	if (xOneShotTimer && xAutoReloadTimer)
	{
		/* 启动定时器 */
		xTimerStart(xOneShotTimer, 0);
		xTimerStart(xAutoReloadTimer, 0);
		
		/* 启动调度器 */
		vTaskStartScheduler();
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}

/*-----------------------------------------------------------*/

static void vONEShotTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	flagONEShotTimerRun = !flagONEShotTimerRun;
	printf("run vONEShotTimerFunc %d\r\n", cnt++);
}

static void vAutoLoadTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	flagAutoLoadTimerRun = !flagAutoLoadTimerRun;
	printf("run vAutoLoadTimerFunc %d\r\n", cnt++);
}


/*-----------------------------------------------------------*/
```

逻辑分析仪如下图所示：

![软件定时器的一般使用](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/12_8_15_35_202506120815031.png)

运行结果如下图所示：

![软件定时器的一般使用的结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/12_8_16_31_202506120816068.png)



### 消除抖动

在嵌入式开发中，我们使用机械开关时经常碰到抖动问题：引脚电平在短时间内反复变化。怎么读到确定的按键状态？

- 连续读很多次，知道数值稳定：浪费CPU资源
- 使用定时器：要结合中断来使用

对于第2种方法，处理方法如下图所示，按下按键后：

- 在t1产生中断，这时不马上确定按键，而是复位定时器，假设周期时20ms，超时时间为"t1+20ms"
- 由于抖动，在t2再次产生中断，再次复位定时器，超时时间变为"t2+20ms"
- 由于抖动，在t3再次产生中断，再次复位定时器，超时时间变为"t3+20ms"
- 在"t3+20ms"处，按键已经稳定，读取按键值

![消除抖动](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/12_8_19_0_202506120819142.png)



代码如下：

```c

/*-----------------------------------------------------------*/

static void vKeyFilteringTimerFunc( TimerHandle_t xTimer );
void vEmulateKeyTask( void *pvParameters );

static TimerHandle_t xKeyFilteringTimer;

/*-----------------------------------------------------------*/

#define KEY_FILTERING_PERIOD pdMS_TO_TICKS( 20 )

int main( void )
{
	
	prvSetupHardware();

	xKeyFilteringTimer = xTimerCreate(	
		"KeyFiltering",            /* 名字, 不重要 */
		KEY_FILTERING_PERIOD,      /* 周期 */
		pdFALSE,                   /* 一次性 */
		0,                         /* ID */
		vKeyFilteringTimerFunc          /* 回调函数 */
	);
	
    /* 在这个任务中多次调用xTimerReset来模拟按键抖动 */
	xTaskCreate( vEmulateKeyTask, "EmulateKey", 1000, NULL, 1, NULL );
			
	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}

/*-----------------------------------------------------------*/

static void vKeyFilteringTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	printf("vKeyFilteringTimerFunc %d\r\n", cnt++);
}

void vEmulateKeyTask( void *pvParameters )
{
	int cnt = 0;
	const TickType_t xDelayTicks = pdMS_TO_TICKS( 200UL );
	
	for( ;; )
	{
		/* 模拟按键抖动, 多次调用xTimerReset */		
		xTimerReset(xKeyFilteringTimer, 0); cnt++;
		xTimerReset(xKeyFilteringTimer, 0); cnt++;
		xTimerReset(xKeyFilteringTimer, 0); cnt++;

		printf("Key jitters %d\r\n", cnt);
		
		vTaskDelay(xDelayTicks);
	}
}
```

在入口函数中多次调用xTimerReset，只触发1次定时器回调函数，运行结果如下图所示：

![消除抖动运行结果](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/06/12_8_22_8_202506120822982.png)



# 中断管理

在RTOS中，需要应对各类事件。这些事件很多时候是通过硬件中断产生，怎么处理中断呢？

假设当前系统正在运行Task1时，用户按下了按键，触发了按键中断。这个中断的处理流程如下：

- CPU跳到固定地址去执行代码，这个固定地址通常被称为中断向量，这个跳转时硬件实现的
- 执行代码做什么？
  - 保存现场：Task1被打断，需要先保存Task1的运行环境，比如各类寄存器的值
  - 分辨中断、调用处理函数(这个函数就被称为ISR，interrupt service routine)
  - 恢复现场：继续运行Task1，或者运行其他优先级更高的任务

你要注意到，ISR是在内核中被调用的，ISR执行过程中，用户的任务无法执行。ISR要尽量快，否则：

- 其他低优先级的中断无法被处理：实时性无法保证
- 用户任务无法被执行：系统显得很卡顿

如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：

- ISR：尽快做些清理、记录工作，然后触发某个任务
- 任务：更复杂的事情放在任务中处理
- 所以：需要ISR和任务之间进行通信

要在FreeRTOS中熟练使用中断，有几个原则要先说明：

- FreeRTOS把任务认为是硬件无关的，任务的优先级由程序员决定，任务何时运行由调度器决定
- ISR虽然也是使用软件实现的，但是它被认为是硬件特性的一部分，因为它跟硬件密切相关
  - 何时执行？由硬件决定
  - 哪个ISR被执行？由硬件决定
- ISR的优先级高于任务：即使是优先级最低的中断，它的优先级也高于任务。任务只有在没有中断的情况下，才能执行。

## 两套API

### 为什么需要两套API

在任务函数中，我们可以调用各类API函数，比如队列操作函数：xQueueSendToBack。但是在ISR中使用这个函数会导致问题，应该使用另一个函数：xQueueSendToBackFromISR，它的函数名含有后缀"FromISR"，表示"从ISR中给队列发送数据"。

FreeRTOS中很多API函数都有两套：一套在任务中使用，另一套在ISR中使用。后者的函数名含有"FromISR"后缀。为什么要引入两套API函数？

- 很多API函数会导致任务计入阻塞状态：
  - 运行这个函数的任务进入阻塞状态
  - 比如写队列时，如果队列已满，可以进入阻塞状态等待一会
- ISR调用API函数时，ISR不是"任务"，ISR不能进入阻塞状态
- 所以，在任务中、在ISR中，这些函数的功能是有差别的

为什么不使用同一套函数，比如在函数里面分辨当前调用者是任务还是ISR呢？示例代码如下：

```c
BaseType_t xQueueSend(...)
{
    if (is_in_isr())
    {

        /* 把数据放入队列 */

        /* 不管是否成功都直接返回 */
    }
    else /* 在任务中 */
    {

        /* 把数据放入队列 */
        /* 不成功就等待一会再重试 */
    }
}
```

FreeRTOS使用两套函数，而不是使用一套函数，是因为有如下好处：

- 使用同一套函数的话，需要增加额外的判断代码、增加额外的分支，使得函数更长、更复杂、难以测试
- 在任务、ISR中调用时，需要的参数不一样，比如：
  - 在任务中调用：需要指定超时时间，表示如果不成功就阻塞一会
  - 在ISR中调用：不需要指定超时时间，无论是否成功都要即刻返回
  - 如果强行把两套函数揉在一起，会导致参数臃肿、无效
- 移植FreeRTOS时，还需要提供监测上下文的函数，比如 is_in_isr()
- 有些处理器架构没有办法轻易分辨当前是处于任务中，还是处于ISR中，就需要额外添加更多、更复杂的代码

使用两套函数可以让程序更高效，但是也有一些缺点，比如你要使用第三方库函数时，即会在任务中调用它，也会在ISR中调用它。这个第三方库函数用到了FreeRTOS的API函数，你无法修改库函数。这个问题可以通过以下方法解决：

- 把中断的处理推迟到任务中进行(Defer interrupt  processing)，在任务中调用库函数
- 尝试在库函数中使用"FromISR"函数：
  - 在任务中、在ISR中都可以调用"FromISR"函数
  - 反过来就不行，非FromISR函数无法在ISR中使用
- 第三方库函数也许会提供OS抽象层，自行判断当前环境是在任务还是在ISR中，分别调用不同的函数

### 函数列表

| 类型                        | 在任务中           | 在ISR中                   |
| --------------------------- | ------------------ | ------------------------- |
| 队列(queue)                 | xQueueSendToBack   | xQueueSendToBackFromISR   |
| ：                          | xQueueSendToFront  | xQueueSendToFrontFromlSR  |
| ：                          | xQueueReceive      | xQueueReceiveFromlSR      |
| ：                          | xQueueOverwrite    | xQueueOverwriteFromISR    |
| ：                          | xQueuePeek         | xQueuePeekFromISR         |
| 信号量(semaphore)           | xSemaphoreGive     | xSemaphoreGiveFromISR     |
| ：                          | xSemaphoreTake     | xSemaphoreTakeFromISR     |
| 事件组(event group)         | xEventGroupSetBits | xEventGroupSetBitsFromISR |
| ：                          | xEventGroupGetBits | xEventGroupGetBitsFromISR |
| 任务通知(task notification) | xTaskNotifyGive    | vTaskNotifyGiveFromISR    |
| ：                          | xTaskNotify        | xTaskNotifyFromISR        |
| 软件定时器(software timer)  | xTimerStart        | xTimerStartFromISR        |
| ：                          | xTimerStop         | xTimerStopFromISR         |
| ：                          | xTimerReset        | xTimerResetFromISR        |
| ：                          | xTimerChangePeriod | xTimerChangePeriodFromISR |

### xHigherPriorityTaskWoken参数

xHigherPriorityTaskWoken的含义是：是否有更高优先级的任务被唤醒了。如果为pdTRUE，则意味着后面要进行任务切换。

还是以写队列为例。任务A调用 xQueueSendToBack() 写队列，有几种情况发生：

- 队列满了，任务A阻塞等待，另一个任务B运行
- 队列没满，任务A成功写入队列，但是它导致另一个任务B被唤醒，任务B的优先级更高：任务B先运行
- 队列没满，任务A成功写入队列，即刻返回

可以看到，在任务中调用API函数可能导致任务阻塞、任务切换，这叫做"context switch"，上下文切换。这个函数可能很长时间才返回，在函数的内部实现了任务切换。

xQueueSendToBackFromISR() 函数也可能导致任务切换，但是不会在函数内部进行切换，而是返回一个参数：表示是否需要切换，函数原型与用法如下：

```c
/*
* 往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
*/
BaseType_t xQueueSendToBackFromISR(
    QueueHandle_t xQueue,
    const void *pvItemToQueue,
    BaseType_t *pxHigherPriorityTaskWoken
);

/* 用法示例 */
BaseType_t xHigherPriorityTaskWoken = pdFALSE;
xQueueSendToBackFromISR(xQueue, pvItemToQueue, &xHigherPriorityTaskWoken);
if (xHigherPriorityTaskWoken == pdTRUE)
{
    /* 任务切换 */ 
}
```

`pxHigherPriorityTaskWoken`参数，就是用来保存函数的结果：

- 是否需要切换`*pxHigherPriorityTaskWoken`等于pdTRUE：函数的操作导致更高优先级的任务就绪了，ISR应该进行任务切换
- `*pxHigherPriorityTaskWoken`等于pdFALSE：没有进行任务切换的必要，为什么不在"FromISR"函数内部进行任务切换，而只是标记一下而已呢？为了效率！示例代码如下：

```c
void XXX_ISR()
{
    int i;
    for (i = 0; i < N; i++)
    {
        xQueueSendToBackFromISR(...); /* 被多次调用 */
    }
}
```

ISR中有可能多次调用"FromISR"函数，如果在"FromISR"内部进行任务切换，会浪费时间。解决方法是：

- 在"FromISR"中标记是否需要切换

- 在ISR返回之前再进行任务切换

- 示例代码如下：

  ```c
  void XXX_ISR()
  {
      int i;
      BaseType_t xHigherPriorityTaskWoken = pdFALSE;
  
      for (i = 0; i < N; i++)
      {
          xQueueSendToBackFromISR(..., &xHigherPriorityTaskWoken); /* 被多次调用 */
      }
      /* 最后再决定是否进行任务切换 */
      if (xHigherPriorityTaskWoken == pdTRUE)
      {
  
          /* 任务切换 */    
      }
  }
  ```

上述的例子很常见，比如UART中断：在UART的ISR中读取多个字符，发现收到回车符时才进行任务切换。

在ISR中调用API时不进行任务切换，而只是在"xHigherPriorityTaskWoken"中标记一下，除了效率，还有多种好处：

- 效率高：避免不必要的任务切换
- 让ISR更可控：中断随机产生，在API中进行任务切换的话，可能导致问题更复杂
- 可移植性
- 在Tick中断中，调用 vApplicationTickHook() ：它运行与ISR，只能使用"FromISR"的函数

使用"FromISR"函数时，如果不想使用xHigherPriorityTaskWoken参数，可以设置为NULL。

### 怎么切换任务

FreeRTOS的ISR函数中，使用两个宏进行任务切换：

```c
portEND_SWITCHING_ISR( xHigherPriorityTaskWoken );
//或
portYIELD_FROM_ISR( xHigherPriorityTaskWoken );
```

这两个宏做的事情是完全一样的，在老版本的FreeRTOS中，

- portEND_SWITCHING_ISR 使用汇编实现
- portYIELD_FROM_ISR 使用C语言实现

新版本都统一使用 portYIELD_FROM_ISR 。使用示例如下：

```c
void XXX_ISR()
{
   int i;
   BaseType_t xHigherPriorityTaskWoken = pdFALSE;
   
   for (i = 0; i < N; i++)
  {
       xQueueSendToBackFromISR(..., &xHigherPriorityTaskWoken); /* 被多次调用 */
  }
   /* 最后再决定是否进行任务切换
    * xHigherPriorityTaskWoken为pdTRUE时才切换
    */
   portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

## 中断的延迟处理

前面讲过，ISR要尽量快，否则：

- 其他低优先级的中断无法被处理：实时性无法保证
- 用户任务无法被执行：系统显得很卡顿
- 如果运行中断嵌套，这会更复杂，ISR越快执行约有助于中断嵌套

如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：

- ISR：尽快做些清理、记录工作，然后触发某个任务
- 任务：更复杂的事情放在任务中处理

这种处理方式叫"中断的延迟处理"(Deferring interrupt processing)，处理流程如下图所示：

- t1：任务1运行，任务2阻塞
- t2：发生中断，
  - 该中断的ISR函数被执行，任务1被打断
  - ISR函数要尽快能快速地运行，它做一些必要的操作(比如清除中断)，然后唤醒任务2
- t3：在创建任务时设置任务2的优先级比任务1高(这取决于设计者)，所以ISR返回后，运行的是任务2，它要完成中断的处理。任务2就被称为"deferred processing task"，中断的延迟处理任务。
- t4：任务2处理完中断后，进入阻塞态以等待下一个中断，任务1重新运行

![中断延迟](https://gitlab.com/18355291538/picture/-/raw/main/pictures/2025/09/5_8_29_25_image-20250905082917954.png)

# 资源管理

在前面讲解互斥量时，引入过临界资源的概念。在前面课程里，已经实现了临界资源的互斥访问。

要独占式地访问临界资源，有2种方法：

1. 公平竞争：比如使用互斥量，谁先获得互斥量谁就访问临界资源，这部分内容前面讲过。
2. 谁要跟我抢，我就灭掉谁：
   1. 中断要跟我抢？我屏蔽中断
   2. 其他任务要跟我抢？我禁止调度器，不运行任务切换

## 屏蔽中断

屏蔽中断有两套宏：任务中使用、ISR中使用：

- 任务中使用： taskENTER_CRITICA()/taskEXIT_CRITICAL()
- ISR中使用： taskENTER_CRITICAL_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR()

### 在任务中屏蔽中断

在任务中屏蔽中断的示例代码如下：

```c
/* 在任务中，当前时刻中断是使能的
* 执行这句代码后，屏蔽中断
*/
taskENTER_CRITICAL();
/* 访问临界资源 */
/* 重新使能中断 */
taskEXIT_CRITICAL();
```

在 taskENTER_CRITICA()/taskEXIT_CRITICAL() 之间：

- 低优先级的中断被屏蔽了：优先级低于、等于 configMAX_SYSCALL_INTERRUPT_PRIORITY
- 高优先级的中断可以产生：优先级高于 configMAX_SYSCALL_INTERRUPT_PRIORITY
  - 但是，这些中断ISR里，不允许使用FreeRTOS的API函数
- 任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生

这套 taskENTER_CRITICA()/taskEXIT_CRITICAL() 宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用 taskEXIT_CRITICAL() 才会重新使能中断。

使用 taskENTER_CRITICA()/taskEXIT_CRITICAL() 来访问临界资源是很粗鲁的方法：

- 中断无法正常运行
- 任务调度无法进行
- 所以，之间的代码要尽可能快速地执行

### 在ISR中屏蔽中断

要使用含有"FROM_ISR"后缀的宏，示例代码如下：

```c
void vAnInterruptServiceRoutine( void )
{
    /* 用来记录当前中断是否使能 */
    UBaseType_t uxSavedInterruptStatus;

    /* 在ISR中，当前时刻中断可能是使能的，也可能是禁止的
    * 所以要记录当前状态, 后面要恢复为原先的状态
    * 执行这句代码后，屏蔽中断
    */
    uxSavedInterruptStatus = taskENTER_CRITICAL_FROM_ISR();

    /* 访问临界资源 */
    /* 恢复中断状态 */
    taskEXIT_CRITICAL_FROM_ISR( uxSavedInterruptStatus );
    /* 现在，当前ISR可以被更高优先级的中断打断了 */
}
```

在 taskENTER_CRITICA_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR() 之间：

- 低优先级的中断被屏蔽了：优先级低于、等于 configMAX_SYSCALL_INTERRUPT_PRIORITY
- 高优先级的中断可以产生：优先级高于 configMAX_SYSCALL_INTERRUPT_PRIORITY
  - 但是，这些中断ISR里，不允许使用FreeRTOS的API函数
- 任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生

## 暂停调度器

如果有别的任务来跟你竞争临界资源，你可以把中断关掉：这当然可以禁止别的任务运行，但是这代价太大了。它会影响到中断的处理。

如果只是禁止别的任务来跟你竞争，不需要关中断，暂停调度器就可以了：在这期间，中断还是可以发生、处理。
	使用这2个函数来暂停、恢复调度器：

```c
/* 暂停调度器 */
void vTaskSuspendAll( void );
/* 恢复调度器
* 返回值: pdTRUE表示在暂定期间有更高优先级的任务就绪了
* 可以不理会这个返回值
*/
BaseType_t xTaskResumeAll( void );
```

示例代码如下：

```c
vTaskSuspendScheduler();
/* 访问临界资源 */
xTaskResumeScheduler();
```

这套 vTaskSuspendScheduler()/xTaskResumeScheduler() 宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用 taskEXIT_CRITICAL() 才会重新使能中断。

