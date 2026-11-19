---
title: Orchard Foundation
slug: orchard-foundation
description: Define Grower, Farm, Plot and FruitVariety — the four entities that capture Zava's multi-origin sourcing model.
order: 2
embed: official/zava-grove-to-shelf-step-1
---

## Zava 数据的起点

Zava 从合作伙伴生产商网络中采购优质水果。在我们谈论质量、发货或零售订单之前，我们需要一个关于**谁种植什么、在哪里**的词汇。

四个实体捕获此信息：

- **Grower** — 合作伙伴公司（例如 *Finca La Marina S.L.*）。
- **农场** — 种植者拥有或经营的地理位置。
- **地块** — 农场内的一块受管理的地块，种植一种品种。
- **FruitVariety** — 商业品种（例如 *Nadorcott* 柑橘、*Sekoya Pop* 蓝莓）。

## 实体

### 种植者

|属性 |类型 |标识符？ |
|---|---|---|
| `growerId` |字符串| ✓ |
| `name` |字符串| |
| `country` |字符串| |
| `partnerSince` |日期 | |
| `isMasterGrower` |布尔 | |

`isMasterGrower` 标志着 Zava 的战略长期合作伙伴。

### 农场

|属性 |类型 |标识符？ |
|---|---|---|
| `farmId` |字符串| ✓ |
| `name` |字符串| |
| `country` |字符串| |
| `region` |字符串| |
| `hectares` |小数（公顷）| |

### 情节

|属性 |类型 |标识符？ |
|---|---|---|
| `plotId` |字符串| ✓ |
| `hectares` |小数（公顷）| |
| `plantingYear` |整数 | |

### 水果品种

|属性 |类型 |标识符？ |
|---|---|---|
| `varietyId` |字符串| ✓ |
| `commercialName` |字符串| |
| `category` |字符串| |
| `shelfLifeDays` |整数（天）| |

## 关系

|来自 |动词|至 |基数 |
|---|---|---|---|
|种植者|拥有|农场|一对多 |
|农场|包含|情节|一对多 |
|情节|成长|水果品种|多对一 |

链条 `Grower → Farm → Plot → FruitVariety` 使**端到端可追溯性**成为可能：从货架上的一块水果回到它的确切来源。

## 到目前为止的图表

<ontology-embed id="official/zava-grove-to-shelf-step-1" height="380px"></ontology-embed>

*四个实体和三个关系已经足以回答诸如“Zava 从西班牙采购多少公顷 Nadorcott 橘子？”之类的问题*

```quiz
Q:在 Zava 的模型中，为什么 `Plot` 是与 ZX​​QPROTECTED1QXZ 不同的实体，而不仅仅是 `Farm` 的属性？
- 它使图表看起来更密集
- 一个农场可以托管多个地块，每个地块都种植不同的品种，并且可追溯性需要地块级身份[correct]
- 地块与农场有不同的所有者
- RDF 要求
> 地块是一流的，因为单个农场通常会种植多个品种并排，Zava 需要将每个收获批次追溯到特定的地块，而不仅仅是农场。
```

接下来，我们将添加**收获事件**和著名的**四阶段质量检查**。
