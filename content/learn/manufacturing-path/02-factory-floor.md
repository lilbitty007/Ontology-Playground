---
title: "Factory Floor"
slug: factory-floor
description: "Define Machine and Sensor — the IoT foundation that monitors factory equipment in real time."
order: 2
embed: official/manufacturing-step-1
---

## 物联网基础

每个智能工厂都从两个概念开始：

- **机器** - 工厂车间有什么设备？
- **传感器** — 它生成什么数据？

机器和传感器构成遥测骨干。在跟踪生产或质量之前，您需要了解正在运行的内容及其报告的内容。

## 定义实体

### 机器

|属性 |类型 |标识符？ |
|---|---|---|
| `machineId` |字符串| ✓ |
| `name` |字符串| |
| `type` |字符串| |
| `status` |字符串| |
| `installDate` |日期 | |

`status` 属性跟踪操作状态 — `running`、`idle`、`maintenance` 或 `offline`。这使得实时仪表板和维护计划成为可能。

### 传感器

|属性 |类型 |标识符？ |
|---|---|---|
| `sensorId` |字符串| ✓ |
| `type` |字符串| |
| `unit` |字符串| |
| `lastReading` |浮动| |
| `threshold` |浮动| |

`threshold` 属性定义警报边界。当`lastReading`超过`threshold`时，系统触发报警。这种模式是预测性维护的基础。

## 关系

- **监视器** — `Sensor` → `Machine`（多对一）
多个传感器监视同一台机器 - 一个用于温度，另一个用于振动等。

> **所有权层次结构：** 在物联网本体中，传感器属于机器。方向很重要：传感器监控机器，而不是相反。这种父子层次结构是物联网平台组织遥测数据的方式。

## 到目前为止的图表

<ontology-embed id="official/manufacturing-step-1" height="300px"></ontology-embed>

*一个简单但有意义的开始：机器*

## 我们学到了什么

- **物联网层次结构**使用父子关系（传感器→机器）
- **状态属性**启用实时操作跟踪
- **阈值属性**功率预测维护警报
- 即使两个实体也可以形成有用的遥测骨干

```quiz
Q:为什么Sensor实体同时具有lastReading和threshold属性？
- 存储备份值，以防万一出现错误
- 阈值定义警报边界 - 当上次读数超过它时，系统会触发预测性维护警报 [correct]
- 所有物联网标准都需要这两个值
- 阈值用于计算传感器的精度
> 阈值模式是预测的基础维护。通过将当前读数与已知的安全边界进行比较，系统可以自动检测异常情况并在设备故障发生之前向操作员发出警报。
```

接下来，我们将添加工作订单和零件的生产跟踪。
