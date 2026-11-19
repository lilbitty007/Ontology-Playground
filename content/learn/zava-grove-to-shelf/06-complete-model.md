---
title: Complete Model
slug: complete-model
description: Add SustainabilityProgram to close the grove-to-shelf model — 12 entities, 13 relationships, ready for the demo.
order: 6
embed: official/zava-grove-to-shelf-step-5
---

## 最后一个实体：可持续发展

Zava 运行一项种植者发展计划 - 内部代号为 **梦想** - 合作伙伴农场可以选择加入。它资助水效率、公平薪酬和生物多样性倡议。如今，这些数据存在于营销系统中，与供应链脱节。

一个实体和一种关系将其拉入模型：

### SustainabilityProgram

|属性 |类型 |标识符？ |
|---|---|---|
| `programId` |字符串| ✓ |
| `name` |字符串| |
| `focusArea` |字符串| |
| `startYear` |整数 | |

### 新关系

|来自 |动词|至 |基数 |
|---|---|---|---|
|农场|参加 |可持续发展计划|多对多 |

多对多，因为单个农场可以参与多个计划（例如 *Dreams Water* 和 *Dreams Biodiversity*），并且单个计划注册多个农场。

## 完整图

<ontology-embed id="official/zava-grove-to-shelf-step-5" diff="official/zava-grove-to-shelf-step-4" height="520px"></ontology-embed>

*12 个实体，13 个关系。 Zava 关心的每个业务领域现在都是通过命名边连接的一流概念。*

## 该模型在舞台上解锁的内容

五个问题，每个问题以前都是多系统、多天的工作，现在都可以从一个本体来回答：

|问题 |路径|
|---|---|
| *“显示上个季度柑橘的收入，按零售连锁店和原产国细分。”* | `Order forVariety FruitVariety[category=citrus]`，由 `Store.retailerName` 和 `HarvestLot → Plot → Farm.country` 组成 |
| *“过去 30 天内哪些种植者的蓝莓质量检查不合格？”* | `QualityCheck[passed=false] → HarvestLot[ofVariety.category=berry] → Plot → Farm ← owns ← Grower` |
| *“哪些运输途中的货物温度高于其品种的安全阈值？”* | `Shipment monitoredBy ColdChainSensor[temperatureC > carries.harvestLot.ofVariety.maxStorageTempC]` |
| *“对于 SH-2026-04812 发货违规，哪些零售商订单面临风险以及收入风险是多少？”* | `Shipment[id=SH-2026-04812] → RetailDC supplies Store places Order[forVariety = breached variety, status=open]` 然后求和 `kilograms × unitPriceEur` |
| *“本季我们的浆果产量中有多少百分比来自梦想计划农场？”* | `HarvestLot[ofVariety.category=berry, harvestDate∈season]`，按是否`fromPlot → Farm participatesIn SustainabilityProgram[name~"Dreams"]` | 分组

## 我们构建了什么

|步骤|添加实体 |累计|关键概念|
|---|---|---|---|
| 1 |种植者、农场、地块、水果品种 | 4 |多源采购，可追溯锚点 |
| 2 | HarvestLot，质量检查| 6 |谱系事件，四阶段质量控制制度 |
| 3 |运输，冷链传感器 | 8 |集线器实体、时间序列绑定 |
| 4 | RetailDC、商店、订单 | 11 | 11关闭收入循环|
| 5 |可持续发展计划| 12 | 12多对多 CSR 叠加 |

## 要点

1. **一个词汇跨越五个系统。** 农学 ERP、包装厂 QC 应用程序、物联网事件中心、零售 EDI 源和 CSR 记录都成为同一 12 实体模型上的绑定。
2. **中心实体很重要。** `HarvestLot` 是沿袭中心。 `Shipment` 是 Lakehouse↔eventhouse 中心。 `FruitVariety` 是供应↔需求中心。
3. **时间序列遥测是一流的。** `ColdChainSensor` 看起来就像本体中的任何其他实体一样 - 底层存储选择（Eventhouse）对于提问者来说是不可见的。
4. **可持续性不是辅助电子表格。** 添加 `SustainabilityProgram` 可以让企业社会责任问题与收入问题使用相同的图表。
5. **本体成为契约。** GQL 查询、Fabric Data Agent 提示和 Activator 规则都引用相同的实体和关系名称。

```quiz
Q:在 Zava 的完整模型中，问题“本季我们的浆果产量有多少百分比来自梦想计划农场？”需要哪条路径？
- 订单 → 商店 → RetailDC → 农场
- HarvestLot → 绘图 → 农场 → 可持续发展计划 [correct]
- ColdChainSensor → 装运 → 农场 → 可持续发展计划
- FruitVariety → 可持续发展计划
> 数量记录于收获地段。要了解该批次是否来自梦想计划农场，请走 HarvestLot → fromPlot → Plot → (contained by) Farm → attendsIn → SustainabilityProgram 并筛选计划名称。
```

您已完成 Zava Grove-to-Shelf 实验室。在playground中打开[Step 5本体](#/catalogue/official/zava-grove-to-shelf-step-5)来查询、扩展或导出它。
