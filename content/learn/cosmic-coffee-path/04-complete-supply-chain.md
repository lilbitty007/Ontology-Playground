---
title: "Complete Supply Chain"
slug: complete-supply-chain
description: "Add Supplier and Shipment to complete the Fourth Coffee ontology — connecting sourcing, logistics, and retail."
order: 4
embed: official/cosmic-coffee-step-3
---

## 补全供应链全貌

Fourth Coffee 不只销售咖啡，还从全球供应商采购咖啡豆、在门店接收货运，并跟踪整个供应链。添加 **Supplier（供应商）**和 **Shipment（货运）**即可闭合供应链。

## Supplier 实体

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `supplierId` | string | ✓ |
| `name` | string | |
| `country` | string | |
| `certification` | enum (Fair Trade, Rainforest Alliance, Organic, Direct Trade, None) | |
| `rating` | decimal | |

`certification` 属性使用枚举来记录可持续发展认证。`rating` 为 1–5 的小数，用于质量评分。

## Shipment 实体

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `shipmentId` | string | ✓ |
| `dispatchDate` | date | |
| `arrivalDate` | date | |
| `status` | enum (In Transit, Delivered, Delayed) | |
| `weight` | decimal (kg) | |

Shipment 是一个**枢纽实体**：它通过 Product 将 Supplier 与 Store 连接起来，贯通采购和零售两端。

## 新增关系

以下四种关系用于补全供应链：

- **sourcedFrom**——`Product` → `Supplier`（多对一）
  每种产品的咖啡豆来自一家供应商。

- **sentBy**——`Shipment` → `Supplier`（多对一）
  每批货运都来自一家供应商。

- **deliveredTo**——`Shipment` → `Store`（多对一）
  每批货运都送达一家门店。

- **carries**——`Shipment` → `Product`（多对多）
  一批货运可以运送多种产品，同一种产品也可以出现在多批货运中。

> **枢纽实体模式：**Shipment 连接了 Supplier、Store 和 Product 三种实体。枢纽实体能把原本不相连的图结构连接起来，因此非常实用。

## 完整关系图

<ontology-embed id="official/cosmic-coffee-step-3" diff="official/cosmic-coffee-step-2" height="500px"></ontology-embed>

*完整的 Fourth Coffee 本体包含 6 种实体类型和 7 种关系。Shipment 作为枢纽，连接 Supplier、Store 和 Product。*

## 完整模型支持的查询

| 问题 | 图路径 |
|---|---|
| 哪些供应商提供有机咖啡豆？ | Product（isOrganic=true）→ Supplier |
| 哪些门店收到延误货运？ | Shipment（status=Delayed）→ Store |
| 主要供应商的评分是多少？ | Product → Supplier（按 rating 排序） |
| 哪些已认证供应商向容量最大的门店供货？ | Supplier → Shipment → Store（按 capacity 排序） |

## GQL 查询示例

查找获得公平贸易认证且向加利福尼亚州门店供货的供应商：

```gql
MATCH (sup:Supplier)<-[:sentBy]-(s:Shipment)-[:deliveredTo]->(st:Store)
WHERE sup.certification = 'Fair Trade' AND st.state = 'CA'
RETURN sup.name, st.name, s.status
```

## 本课程构建过程

| 步骤 | 新增实体 | 累计实体数 | 核心概念 |
|---|---|---|---|
| 1 | Customer、Order、Product | 3 | 实体类型、标识符、基数 |
| 2 | Store | 4 | 地点建模、多对一关系 |
| 3 | Supplier、Shipment | 6 | 供应链、枢纽实体 |

## 要点回顾

1. **从小处开始**——三种实体就足以体现价值
2. Shipment 这样的**枢纽实体**可以连接不同业务领域
3. **枚举属性**可以在模型层面约束数据质量
4. **逐步扩展关系图**——每一步都会增加新的查询能力
5. **GQL 查询**可直接映射到本体结构，避免模型与查询之间出现偏差

```quiz
Q: 为什么 Shipment 在这个本体中被称为“枢纽实体”？
- 它拥有所有实体中最多的属性
- 它连接 Supplier、Store 和 Product 三种实体 [correct]
- 它是查询频率最高的实体
- 它是最后加入模型的实体
> Shipment 分别通过 sentBy、deliveredTo 和 carries 关系连接 Supplier、Store 和 Product，将采购、物流和零售领域汇聚到同一个实体。
```

你已完成 Fourth Coffee 学习路径！从[本体目录](#/catalogue)加载任意步骤，即可交互式探索本体。
