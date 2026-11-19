---
title: Retail Fulfillment
slug: retail-fulfillment
description: Add RetailDC, Store and Order to connect Zava's supply chain to its retail partners and to revenue.
order: 5
embed: official/zava-grove-to-shelf-step-4
---

## 供应链与收银台交汇处

上一步以运输途中的货件结束。这一步给接收者一个面孔：哪个零售连锁店、哪个配送中心、哪个商店、哪个订单。

三个新实体完善了 Zava 的商业部分：

- **RetailDC** — 接收 Zava 发货的零售商配送中心。
- **商店** — 零售商的店面，由一个 DC 提供。
- **订单** — 商店针对特定水果品种下的采购订单。

## 实体

### RetailDC

|属性 |类型 |标识符？ |
|---|---|---|
| `dcId` |字符串| ✓ |
| `name` |字符串| |
| `country` |字符串| |
| `city` |字符串| |
| `retailerCode` |字符串| |

### 商店

|属性 |类型 |标识符？ |
|---|---|---|
| `storeId` |字符串| ✓ |
| `name` |字符串| |
| `retailerName` |字符串| |
| `country` |字符串| |
| `city` |字符串| |

### 订单

|属性 |类型 |标识符？ |
|---|---|---|
| `orderId` |字符串| ✓ |
| `kilograms` |小数（公斤）| |
| `orderDate` |日期 | |
| `deliveryDate` |日期 | |
| `status` |字符串| |
| `unitPriceEur` |小数（欧元）| |

## 新关系

|来自 |动词|至 |基数 |
|---|---|---|---|
|发货 |交付至 |零售DC |多对一 |
|零售DC |用品 |商店 |一对多 |
|商店 |地点 |订单|一对多 |
|订单|为品种|水果品种|多对一 |

## 现在冷链违规查询关闭循环

回想一下步骤 3 中的违规问题。零售到位后，完整的遍历是：

```
ColdChainSensor[breach]
   → Shipment
   → HarvestLot ─ ofVariety → FruitVariety
   → Shipment
   → RetailDC
   → Store
   → Order[forVariety = same variety, status = open]
```

Fabric IQ 数据代理现在可以用商务英语回答客户影响问题：

> *“对于 SH-2026-04812 发货时的冷链违规，哪些零售商订单面临风险以及收入风险是多少（公斤 × 单位价格欧元）？”*

## 到目前为止的图表

<ontology-embed id="official/zava-grove-to-shelf-step-4" diff="official/zava-grove-to-shelf-step-3" height="480px"></ontology-embed>

*十一个实体。零售分支（RetailDC → Store → Order）通过 `Order forVariety FruitVariety` 直接插入 FruitVariety 中心，关闭从果园到货架的路径。*

```quiz
Q:在违规查询中，为什么我们*除了* `Shipment carries HarvestLot ofVariety FruitVariety` 之外还需要 `Order forVariety FruitVariety`？
- Fabric IQ 需要冗余
- 它允许我们将风险批次与*同一品种的未平仓订单*相匹配，因为订单是针对品种而不是特定批次下的[correct]
- 它仅用于可视化
- 没有它，图表将断开连接
> 零售商订购依据品种，而不是批次。为了了解特定批次的违规行为“暴露了哪些订单”，我们将其品种与 `Order.forVariety` 进行交叉引用。如果没有该链接，图表将告诉我们货物存在风险，但不会告诉我们哪些未结订单。
```

最后要添加的一个实体是让模型为 Zava 的企业社会责任故事歌唱的程序。
