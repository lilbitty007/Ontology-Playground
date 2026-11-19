---
title: "Scenario Overview"
slug: scenario-overview
description: "Meet the Smart Manufacturing system — an IoT-enabled factory that needs an ontology to connect machines, sensors, production, and quality control."
order: 1
---

## 场景

您正在为**智能制造工厂**设计数据模型。工厂管理：

- **工厂车间**机器，包含维护计划和运行状态
- **传感器**收集实时数据 - 温度、振动、压力读数
- **工单**跟踪生产作业的优先级和截止日期
- **零件**代表按照规格和要求制造的组件公差
- **质量检查** 记录检验结果、通过/失败状态和缺陷代码

来自 IoT 传感器、MES（制造执行系统）、ERP 平台和质量管理数据库的数据流。

## 为什么是本体？

像**“哪些传感器读数异常的机器生产上周未通过质量检查的零件？”这样的生产问题涉及物联网遥测、生产计划、零件跟踪和检查记录。

通过本体，这映射到：`Machine → Sensor (reading > threshold)` 和 `Machine → Work-Order → Part → Quality-Check (passed=false)`。

## 我们将构建什么

|步骤|实体|你将学到什么 |
|---|---|---|
| 1 |机器、传感器|物联网关系、遥测层次结构 |
| 2 | + 工作订单，零件 |生产跟踪、制造链|
| 3 | + 质量检查 |检验循环，闭合生产周期|

最后，您将拥有一个包含 5 个实体、5 个关系的本体，涵盖传感器监控和质量保证。

## 关键概念

- **物联网层次结构** — 机器拥有传感器，读数向上流动
- **生产链** — 工作订单生产零件
- **质量循环** — 检查反馈到生产决策
- **运行状态** — 实时状态跟踪（运行、空闲、维护）

让我们从工厂车间开始。
