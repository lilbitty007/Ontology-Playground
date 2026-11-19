---
title: "Core Entities & Properties"
slug: core-entities
description: "Learn the 7 entity types and 40 properties that model supply chain disruptions, from suppliers and components to risk assessments and mitigation actions."
order: 2
---

## 7 种实体类型

您的本体捕获供应链中断的整个生命周期，从触发事件到检测、评估和响应。

### 第 1 层：网络

**供应商**
- 代表提供原材料或组件的外部公司
- 主要属性：`supplierId`（唯一）、`name`、 `country`、`tier`（第 1/2/3 层）、`reliabilityScore` (0-100)、`singleSourced`（布尔值）
- 使用案例：识别作为风险放大器的关键单一来源供应商

**组件**
- 来自一个或多个供应商的零件、材料或子组件
- 主要属性：`componentId`、`name`、`category`（电子/机械/化学/包装/原材料）、`daysOfSupplyOnHand`、`criticalityLevel` （严重/高/中/低）
- 使用案例：根据安全库存跟踪哪些组件可以在供应商中断后幸存下来

**产品线**
- 一组共享通用组件的成品
- 关键属性：`productLineId`、 `name`、`annualRevenue`、`marketSegment`、`productionStatus`（活动/有风险/暂停/停产）
- 使用案例：计算收入风险和生产时间表影响

### 第 2 层：中断

**中断事件**
- 中断或威胁一个或多个供应商正常供应的事件
- 关键属性：`eventId`、`type`（自然灾害/地缘政治/财务/物流/质量）召回/流行病/网络攻击）、`severity`（严重/高/中/低）、`startDate`、`estimatedDurationDays`、`region`
- 使用案例：分类和严重性确定升级级别和响应时间表

### 第 3 层：分析

**风险评估**
- 中断影响供应链时的业务影响分析
- 关键属性：`assessmentId`、`assessedDate`（日期时间）、 `revenueAtRisk`（美元）、`timeToImpactDays`、`confidenceLevel`（高/中/低）、`recommendedAction`
- 用例：量化业务方面的影响（金钱和时间）以优先响应

**缓解行动**
- 减少或消除中断影响的具体步骤
- 关键属性：`actionId`、`type`（激活替代供应商/增加安全库存/重新设计组件/减少生产/加快发货/客户沟通）、`status` （已提议/已批准/进行中/已完成/已取消）、`estimatedCost`（美元）、`leadTimeSavedDays`
- 用例：跟踪已采取的操作及其实际效果与估计效果

### 第 4 层：备份

**替代供应商**
- 能够替代主要供应商的合格备用供应商
- 主要属性：`altSupplierId`、`name`、`country`、`qualificationStatus` （预审/批准/待审核/不合格）、`capacityAvailable`（单位/月）、`pricePremiumPercent` (%))
- 使用案例：快速激活具有已知容量和成本影响的备份

## 属性类型和验证

每个属性都有一个类型，该类型决定 AI 代理和仪表板如何使用它：

|类型 |示例|在代理中的使用 |
|------|---------|----------------|
| `string` |供应商名称，组件类别|搜索、过滤、报告 |
| `integer` |供应天数、产能、单位 |基于阈值的警报 |
| `decimal` |收入、溢价、可靠性评分 |成本效益计算|
| `date` |中断开始日期 |时间线比较 |
| `datetime` |风险评估时间戳|审计追踪、趋势 |
| `enum` |供应商等级、中断类型、严重程度 |分类、决策树 |
| `boolean` |单一来源标志 |风险标记|

## 标识符属性

每个实体都有一个唯一的标识符：

```
Supplier → supplierId (e.g., "SUPP-00456")
Component → componentId (e.g., "COMP-SEM-0821")
ProductLine → productLineId (e.g., "PL-LAP-2024")
DisruptionEvent → eventId (e.g., "DISR-202405-TAIWAN-001")
RiskAssessment → assessmentId (e.g., "RA-20240501-SEM-001")
MitigationAction → actionId (e.g., "MA-20240501-ALT-SUPP")
AlternativeSupplier → altSupplierId (e.g., "ALTSUPP-00789")
```

这些 ID 是您和您的代理在查询和报告中引用特定实例的方式。

## 基数和关系

实体通过具有定义基数的关系进行连接：

- **一对多**：供应商提供许多组件；中断影响许多供应商
- **多对多**：组件用于许多产品线；缓解措施激活许多替代供应商
- **多对一**：替代供应商可以取代一个主要供应商

接下来我们将探讨完整的关系图。
