---
title: Harvest & Quality
slug: harvest-and-quality
description: Add HarvestLot and QualityCheck to capture every traceable harvest event and Zava's four-stage quality regime.
order: 3
embed: official/zava-grove-to-shelf-step-2
---

## 每个盒子都有很多

当一个地块被选中时，从它身上掉下来的公斤就变成了 **HarvestLot** — 流经供应链其余部分的可追溯性单位。后来的每一个事件（温度违规、零售商退货、客户索赔）最终都指向 HarvestLot。

Zava 还运行**“四次质量控制”** - 同一批产品在四个不同的阶段进行检查：现场、包装厂、目的地配送中心和最后的商店。每次检查都是一个单独的 `QualityCheck` 事件，具有自己的阶段编号。

## 实体

### HarvestLot

|属性 |类型 |标识符？ |
|---|---|---|
| `lotId` |字符串| ✓ |
| `harvestDate` |日期 | |
| `kilograms` |小数（公斤）| |
| `qcGrade` |字符串| |

### 质量检查

|属性 |类型 |标识符？ |
|---|---|---|
| `checkId` |字符串| ✓ |
| `stage` |整数 (1–4) | |
| `passed` |布尔 | |
| `defectRate` |小数 (%) | |
| `checkedAt` |日期时间 | |

`stage` 字段使四阶段制度在语义层中变得明确：像*“哪些种植者始终无法通过第 3 阶段检查？”* 这样的单个业务问题现在是直接属性过滤器。

## 新关系

|来自 |动词|至 |基数 |
|---|---|---|---|
|收获地块 |来自情节|情节|多对一 |
|收获地块 |品种 |水果品种|多对一 |
|质量检查|检查|收获地块 |多对一 |

`ofVariety` 可能看起来多余 `fromPlot → grows → FruitVariety`，但它可以让有关发货中的品种混合的查询跳过一个跃点 - 并且至关重要的是，它捕获*收获时*品种，这可能与重新种植周期后地块的名义品种不同。

## 到目前为止的图表

<ontology-embed id="official/zava-grove-to-shelf-step-2" diff="official/zava-grove-to-shelf-step-1" height="420px"></ontology-embed>

*六个实体。请注意两个新的中心：HarvestLot 是谱系锚点，QualityCheck 从侧面连接到它。*

## 业务问题可解锁

- *“哪些种植者在过去 30 天内对蓝莓进行了 QC 失败？”*
→ `QualityCheck[passed=false] → HarvestLot → Plot → Farm → Grower` 在 `ofVariety.category = "berry"` 上过滤。
- *“按阶段和原产国划分的 QC 通过率是多少？”*
→ 按 `QualityCheck.stage` 和 `HarvestLot → Plot → Farm.country` 分组。

```quiz
Q:为什么 Zava 将 `QualityCheck` 建模为单独的实体，而不是 `HarvestLot` 上的四个布尔列（例如 `qc1Passed`、`qc2Passed`，...）？
- RDF 不支持布尔值
- 将其建模为实体，让每个检查携带自己的 `inspector`、`defectRate`、`checkedAt`，并让我们通过 `stage` 计数或过滤检查 [correct]
- 它提高了图形渲染性能
- Fabric IQ
不支持布尔列 > 布尔列会使检查器、时间戳和缺陷率变平。作为一个实体，QualityCheck 成为我们可以聚合、过滤和加入的一流活动 — 正是回答“哪些种植者最常在第 3 阶段失败？”所需的内容。
```

接下来，我们将把收获地连接到业务的冷链方面。
