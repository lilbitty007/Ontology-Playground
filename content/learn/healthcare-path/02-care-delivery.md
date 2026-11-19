---
title: "Care Delivery"
slug: care-delivery
description: "Define Patient, Provider, and Appointment — the core entities that power healthcare scheduling and care delivery."
order: 2
embed: official/healthcare-step-1
---

## 护理服务基础

医疗服务围绕三个概念：

- **患者** — 谁正在接受护理？
- **提供者** — 谁提供护理？
- **预约** — 护理何时何地进行？

这三个实体捕获医疗保健的调度和交付。每次诊断和治疗都源于预约。

## 定义实体

### 患者

|属性 |类型 |标识符？ |
|---|---|---|
| `patientId` |字符串| ✓ |
| `mrn` |字符串| |
| `dateOfBirth` |日期 | |
| `bloodType` |字符串| |
| `allergies` |字符串| |

`mrn`（医疗记录号）是医院的内部标识符。 `patientId` 用作本体标识符，而 `mrn` 是映射到 EHR 系统的特定于域的属性。

### 提供者

|属性 |类型 |标识符？ |
|---|---|---|
| `providerId` |字符串| ✓ |
| `name` |字符串| |
| `specialty` |字符串| |
| `licenseNumber` |字符串| |
| `department` |字符串| |

`specialty` 和 `department` 属性支持按临床领域过滤提供者 — 对于转诊和路由查询至关重要。

### 约会

|属性 |类型 |标识符？ |
|---|---|---|
| `appointmentId` |字符串| ✓ |
| `scheduledTime` |日期时间 | |
| `duration` |整数（分钟）| |
| `type` |字符串| |
| `status` |字符串| |

`duration` 属性使用以分钟为单位的整数 — 启用计划计算和利用率分析。

## 关系

- **has_appointment** — `Patient` → `Appointment`（一对多）
随着时间的推移，患者可以有多个预约。

- **看到** — `Provider` → `Appointment`（一对多）
提供商处理多个预约。

> **共享实体模式：** 预约连接到*患者和提供者。它是两个独立实体交互的交汇点。当两个参与者参与同一事件时，这种模式很常见。

## 到目前为止的图表

<ontology-embed id="official/healthcare-step-1" height="350px"></ontology-embed>

*患者和提供者都连接到预约 — 护理服务的交汇点。*

## 我们学到了什么

- **共享实体**（预约）连接两个独立的参与者（患者、提供者）
- **持续时间属性**使用带单位的整数（分钟、小时、天）
- **域特定标识符** (MRN) 与本体标识符 (patentId) 共存
- 调度三角形（患者 - 预约 - 提供者）是医疗保健基础

```quiz
Q:为什么预约会同时连接到患者和提供者，而不是只连接到一个？
- 为了使图表看起来更完整
- 因为约会是一个共享实体 - 它代表两个参与者之间的交互点[correct]
- 因为每个实体必须至少有两个关系
- 因为患者和提供者具有相同的属性
> 约会本质上是涉及患者和患者的协作事件提供者。对这两种关系进行建模可以捕获完整的日程安排情况，并可以从任一角度进行查询：“患者下次就诊是什么时候？”或“该提供者每天接待多少患者？”
```

接下来，我们将添加诊断来跟踪医疗状况。
