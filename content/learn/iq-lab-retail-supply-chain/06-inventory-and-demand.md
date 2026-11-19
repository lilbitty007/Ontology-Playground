---
title: Inventory & Demand
slug: inventory-and-demand
description: Add Inventory, Forecast, and DemandSignal to track stock levels and predict future demand across warehouses and regions.
order: 6
embed: official/iq-lab-retail-step-5
---

## 从交易到计划

步骤 1-4 模拟了**已发生的情况**——订单、发货、交付。现在，我们添加关于**正在发生的事情**（库存水平、需求信号）和**将发生的事情**（预测）的实体。这就是本体真正发挥作用的地方：将历史数据、实时数据和预测数据统一在一个模型下。

＃＃ 存货

各仓库库存水平：

|属性 |类型 |标识符？ |
|---|---|---|
| `库存 ID` |字符串| ✓ |
| `库存水平` |整数 | |
| `重新订购点` |整数 | |

“reorderPoint”表示应订购新库存的阈值，这是供应链管理的一个关键指标。

＃＃ 预报

产品需求预测：

|属性 |类型 |标识符？ |
|---|---|---|
| `forecastId` |字符串| ✓ |
| `预测日期` |日期 | |
| `预测需求` |整数 | |

## 需求信号

客户需求的实时指标——搜索趋势、社交媒体提及、天气模式：

|属性 |类型 |标识符？ |
|---|---|---|
| `signalId` |字符串| ✓ |
| `信号日期` |日期时间 | |
| `信号强度` |小数 | |

## 新关系

五种新关系将库存和需求连接到现有实体：

- **InventoryForProduct** — `库存`→`产品`（多对一）
特定产品的库存水平。

- **InventoryAtWarehouse** — `库存`→`仓库`（多对一）
库存存放的地方。与 InventoryForProduct 相结合，这会创建交集：“仓库 Y 中有多少产品 X？”

- **ForecastForProduct** — `预测`→`产品`（多对一）
对特定产品的预测需求。

- **DemandSignalForProduct** — `DemandSignal` → `Product`（多对一）
产品的实时需求指标。

- **DemandSignalInRegion** — `DemandSignal` → `Region`（多对一）
需求信号源自何处。

## 跨源统一

在真正的 Fabric IQ 部署中，这些实体可能来自非常不同的来源：

|实体|典型来源|
|---|---|
|库存| Eventhouse（实时更新）|
|预测| Lakehouse（批量 ML 预测）|
|需求信号| Eventhouse（流数据）|
|产品 | Lakehouse（目录）和 Eventhouse（折扣）|

本体**将所有这些**统一在一个连接图下。像“对于西南地区需求量大的产品，附近仓库当前库存是多少？”之类的查询无缝遍历所有来源。

## 第 5 步的图表

<ontology-embed id="official/iq-lab-retail-step-5" diff="official/iq-lab-retail-step-4" height="450px"></ontology-embed>

*十三种实体类型。库存将产品链接到仓库。 DemandSignal 将产品连接到区域。该图现在涵盖商业、物流和规划领域。*

## 我们学到了什么

- 本体可以统一**历史、实时和预测**数据
- **库存**是一个经典的交叉实体 - 它位于产品和仓库之间
- **DemandSignal** 连接到产品和区域，实现跨维度分析
- 跨源统一是核心价值主张 - 一个模型，多个数据引擎

```quiz
Q:为什么 Inventory 被称为“交叉实体”？
- 它比其他实体存储更多的数据
- 它位于产品和仓库之间，代表特定位置的特定产品的库存[correct]
- 它在本体中具有最多的关系
- 它是唯一源自 Eventhouse 的实体
> 库存与产品和仓库相交 —每个库存记录都回答“仓库 Y 中有多少产品 X？”，使其成为经典的交叉点（或交汇点）实体。
```

又一步：我们将添加“促销”和“退货”以完成图片。
