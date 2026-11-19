---
title: Scenario Overview
slug: scenario-overview
description: Meet Zava — a premium fresh-fruit producer that needs one semantic layer across farms, cold-chain logistics, retail and sustainability.
order: 1
---

## Zava 故事

**Zava** 是全球优质新鲜水果和蔬菜生产商和分销商。他们的业务涵盖：

- **多来源采购** - 西班牙、厄瓜多尔、南非、突尼斯、德国等地的合作农场。
- **四阶段质量控制** - 每次收获都会在田间、包装厂、目的地配送中心和最后的商店进行检查。
- **冷链物流** — 装载易腐烂货物的冷藏集装箱，由温度传感器持续监控。
- **零售合作伙伴** — 连锁超市（配送中心和商店）针对特定品种下订单。
- **可持续发展** - 农场可以加入的种植者发展计划（Zava Dreams）。

## 数据问题

如今，这些领域中的每一个都存在于不同的系统中：农学 ERP、包装厂 QC 应用程序、物联网事件室、零售 EDI 源、CSR 电子表格。一个问题，如：

> *“今天早上，一个装有 18 吨 Nadorcott 柑橘的冷藏集装箱在运往零售商配送中心的途中温度超过了 9°C。哪些零售商订单面临风险，收入风险是多少？”*

…需要手动遍历五个不同的系统。分析师需要知道哪个表保存发货，哪个 Lakehouse 保存订单，哪个 eventhouse 保存传感器遥测数据 - 以及如何加入它们。

## 为什么本体

本体定义了**业务概念** — `Grower`、`Farm`、`HarvestLot`、`Shipment`、`ColdChainSensor`、 `RetailDC`、`Order`、`SustainabilityProgram` — 以及它们之间的**关系**，*一次*。然后，基础表和事件流将被**绑定**到这些概念。

|没有本体|与本体|
|---|---|
|分析师必须知道`dim_grow.gr_lt_id = fact_harv.gr_id` |商业用户询问“本周哪些种植者将批次置于危险之中？” |
|冷链遥测存在于一个系统中，订单存在于另一个系统中 |一遍历`Sensor → Shipment → HarvestLot → Order → Store` |
|新零售商？重写五个查询 |新零售商？添加绑定，模型保持不变 |
|可持续性跟踪是一个辅助电子表格 | `Farm participatesIn SustainabilityProgram`一流|

## 我们将构建什么

通过五个渐进步骤，我们将构建完整的 Zava grove-to-shelf 本体 — **12 种实体类型**和 **13 种关系**，覆盖业务的每一层：

1. **果园基金会** — `Grower`、`Farm`、`Plot`、`FruitVariety`
2. **收获和质量** — `HarvestLot`、`QualityCheck`
3. **冷链物流** — `Shipment`、`ColdChainSensor`
4. **零售配送** — `RetailDC`、`Store`、`Order`
5. **完整模型** — `SustainabilityProgram`

在每一步中，您都会看到图表不断增长，我们将预览新实体解锁的业务问题。

```quiz
Q:与传统数据仓库相比，Zava 从本体中获益的“主要原因”是哪一个？
- 本体在运行时比 SQL 更快
- 它完全消除了存储数据的需要
- 它一次表达了跨域业务概念，因此业务用户可以提出简单语言问题[correct]
- 它取代了对冷链传感器的需求
> 价值不是速度或存储 - 而是这个*一个*语义词汇涵盖农学、物流、零售和企业社会责任数据，因此跨领域问题变得自然。
```

让我们从果园开始吧。
