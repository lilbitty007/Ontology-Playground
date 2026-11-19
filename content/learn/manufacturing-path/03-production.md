---
title: "Production Tracking"
slug: production
description: "Add Work-Order and Part to track what's being produced — connecting machines to their manufacturing output."
order: 3
embed: official/manufacturing-step-2
---

## 从监控到生产

传感器告诉我们机器“如何”运行，但我们还需要知道它们正在生产“什么”。 **工作订单**和**零件**实体将生产跟踪添加到工厂模型中。

添加生产跟踪可启用：
- “本班次哪台机器生产的零件最多？”
- “有多少工单落后于计划？”
- “CNC-01 目前正在制造哪些零件？”

## 工作订单实体

|属性 |类型 |标识符？ |
|---|---|---|
| `workOrderId` |字符串| ✓ |
| `priority` |字符串| |
| `status` |字符串| |
| `startDate` |日期 | |
| `dueDate` |日期 | |

工作订单同时具有 `startDate` 和 `dueDate` — 启用计划遵守情况计算。与 `priority` 结合使用，可支持生产计划查询。

## 部分实体

|属性 |类型 |标识符？ |
|---|---|---|
| `partId` |字符串| ✓ |
| `name` |字符串| |
| `material` |字符串| |
| `weight` |浮动| |
| `tolerance` |浮动| |

`tolerance` 属性定义可接受的制造偏差。具有更严格公差的零件需要更高精度的机器——这是一个关键的生产计划限制。

## 新关系

- **分配给** — `Work-Order` → `Machine`（多对一）
工单分配给特定机器进行生产。

- **生产** — `Work-Order` → `Part`（一对多）
工作订单生产一个或多个零件。

- **has_part** — `Machine` → `Part`（一对多）
机器生产零件（输出视角）。

> **生产链：** 链 `Machine ← Work-Order → Part` 通过调度实体将设备连接到输出。这类似于医疗保健中预约连接患者和提供者的方式 - 中间实体代表事件。

## 增长图

<ontology-embed id="official/manufacturing-step-2" diff="official/manufacturing-step-1" height="400px"></ontology-embed>

*工作订单和零件加入图表，为物联网基础添加生产跟踪。差异显示了新内容。*

## 我们学到了什么

- **生产链**通过调度实体（工单）将设备连接到输出
- **双日期属性**（startDate/dueDate）启用计划遵守跟踪
- **公差属性**编码制造精度要求
- 工厂模型现在涵盖监控（传感器）和生产（工单）

```quiz
Q:零件实体上的公差属性代表什么？
- 可能有缺陷的零件的最大数量
- 可接受的制造偏差 - 超出公差的零件需要更高精度的机器[correct]
- 制造零件所允许的时间
- 零件可以承受的温度范围
> 公差定义零件的实际尺寸可以偏离规格的程度。更严格的公差需要更高精度的机器和更仔细的质量控制——这成为生产计划中的关键限制。
```

接下来，我们将添加质量检查来关闭生产循环。
