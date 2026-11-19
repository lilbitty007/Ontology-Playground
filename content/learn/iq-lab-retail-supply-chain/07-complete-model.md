---
title: Complete Model
slug: complete-model
description: Add Promotion and Return to finish the full 15-entity retail supply chain ontology — then explore the complete graph.
order: 7
embed: official/iq-lab-retail-step-6
---

## 最后两个实体

最后两个实体类型闭合零售生命周期的循环：

- **促销** - 推动销售的营销活动
- **退货** - 返回的商品，链接到订单和产品

## 促销

针对特定产品的营销活动：

|属性 |类型 |标识符？ |
|---|---|---|
| `promotionId` |字符串| ✓ |
| `promotionName` |字符串| |
| `isActivePromotion` |布尔 | |

`isActivePromotion` 标志可以过滤当前的活动 - 诸如“哪些活跃促销活动与高退货率产品相关？”之类的问题。遍历促销→产品←退货。

## 退货

链接回订单和产品的退货商品：

|属性 |类型 |标识符？ |
|---|---|---|
| `returnId` |字符串| ✓ |
| `returnDate` |日期 | |
| `reason` |字符串| |

## 新关系

三个最终关系：

- **PromotionForProduct** — `Promotion` → `Product`（多对一）
促销目标是哪个产品。

- **ReturnForOrder** — `Return` → `Order`（多对一）
退货链接到哪个订单。

- **ReturnOfProduct** — `Return` → `Product`（多对一）
哪个产品被退回。

## 完整图

<ontology-embed id="official/iq-lab-retail-step-6" diff="official/iq-lab-retail-step-5" height="500px"></ontology-embed>

*完整的零售供应链本体：15种实体类型，18种关系。每个实体至少相互连接，形成一个丰富的、可遍历的图。*

## 完整的模型能够实现什么

有了完整的本体，以下是自然可以回答的问题示例：

|问题 |图形路径|
|---|---|
|哪些促销活动带来了回报？ |促销 → 产品 ← 返回 |
|退货产品的库存是多少？ |退货 → 产品 ← 库存 → 仓库 |
|哪些运营商为需求高的地区提供服务？ | DemandSignal → 区域 ← 商店；发货 → 承运人 |
|哪些客户订购了促销产品？ |客户 ← 订单 → 订单行 → 产品 ← 促销 |
|产品库存不足的预测是什么？ |库存→产品←预测|

其中每一个都需要复杂的多表 SQL 连接。通过本体，它们被表达为图遍历——在 Fabric IQ 中，自然语言数据代理可以从本体结构中回答它们。

## GQL 查询示例

以下是第一个问题 — “哪些促销活动带来了回报？” — 在 GQL 中查找：

```gql
MATCH (r:Return)-[:ReturnOfProduct]->(p:Product)<-[:PromotionForProduct]-(promo:Promotion)
WHERE promo.isActivePromotion = true
RETURN promo.promotionName, p.name, r.reason
```

GQL 模式直接反映您设计的本体关系。模型和查询之间不存在阻抗不匹配。

## 我们构建了什么

通过六个步骤，我们逐步构建了一个完整的本体：

|步骤| Entities added | Cumulative | Key concept |
|---|---|---|---|
| 1 |客户、订单、产品 | 3 |实体类型、标识符、基数 |
| 2 |订单行、产品类别 | 5 |链接实体、层次结构 |
| 3 | Region, Store | 7 |地理结构、布尔属性 |
| 4 |发货、承运人、仓库 | 10 | 10 Hub实体，跨域连接|
| 5 |库存、预测、需求信号 | 13 |跨源统一，规划数据|
| 6 | Promotion, Return | 15 | 15关闭循环，GQL 查询 |

## 要点

1. **从小规模开始，逐步增长** — 三个实体足以创造价值
2. **链接实体** 解决多对多属性问题
3. **中心实体** （如 Shipment）桥接不同领域
4. **跨源统一**是核心价值 — 一个本体，多个数据引擎
5. **图遍历** 用直观的路径模式取代复杂的 SQL 连接
6. **本体就是 API** — GQL 查询和数据代理问题都遵循相同的结构

```quiz
Q:在完整的零售本体中，您如何表达“哪些促销活动推动了回报？”这一问题？作为图遍历？
- 客户 → 订单 → 产品 → 促销
- 促销 → 产品 ← 退货 [correct]
- 退货 → 订单 → 客户 → 促销
- 促销 → 退货 → 产品
> 路径促销 → 产品 ← 返回遵循 PromotionForProduct 和 ReturnOfProduct 关系，通过其共享的 Product 实体将促销与退货产品连接起来。
```

您已完成 IQ 实验室：零售供应链。从[目录](#/catalogue) 加载任何步骤本体，以便在 Playground 中以交互方式探索它。
