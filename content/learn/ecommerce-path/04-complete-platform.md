---
title: "Complete Platform"
slug: complete-platform
description: "Add Review to close the buyer feedback loop and complete the e-commerce ontology."
order: 4
embed: official/ecommerce-step-3
---

## 补全反馈循环

电子商务模型的最后一块拼图是**顾客评价**。评价把买家重新连接到产品，形成影响未来购买决策的反馈循环。

## Review 实体

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `reviewId` | string | ✓ |
| `rating` | integer | |
| `title` | string | |
| `body` | string | |
| `verified` | boolean | |

`verified` 布尔属性表示评价者是否确实购买过该产品，这是其他买家和数据分析的重要可信度信号。

## 新增关系

- **writes**——`Buyer` → `Review`（一对多）
  一位买家可以撰写多条评价。

- **reviews**——`Review` → `Product`（多对一）
  每条评价只针对一种产品，而一种产品可以有许多评价。

> **反馈循环：**路径 `Buyer → writes → Review → reviews → Product` 会重新回到 Product。买家购买产品后留下评价，进而影响其他买家的选择。

## 完整关系图

<ontology-embed id="official/ecommerce-step-3" diff="official/ecommerce-step-2" height="500px"></ontology-embed>

*完整的电子商务本体包含 5 种实体和 6 种关系。Review 补全了买家反馈循环。*

## 完整模型支持的查询

| 问题 | 图路径 |
|---|---|
| 哪些产品拥有评分最高的已验证评价？ | Review（verified=true）→ Product |
| 哪些买家的购物车中有商品，却没有下订单？ | Buyer → Cart（itemCount > 0），且没有 Buyer → Order 关系 |
| 某类别产品的平均评分是多少？ | Review → Product（按类别分组） |
| 哪些忠诚会员撰写的评价最多？ | Buyer（loyaltyTier=Gold）→ Review（计数） |

## GQL 查询示例

查找目前位于某人购物车中的产品所对应的已验证评价：

```gql
MATCH (b:Buyer)-[:has_cart]->(c:Cart)-[:contains]->(p:Product)<-[:reviews]-(r:Review)
WHERE r.verified = true
RETURN p.name, r.rating, r.title
```

## 本课程构建过程

| 步骤 | 新增实体 | 累计实体数 | 核心概念 |
|---|---|---|---|
| 1 | Buyer、Product、Order | 3 | 购买流程、SKU 标识符 |
| 2 | Shopping-Cart | 4 | 会话实体、一对一关系 |
| 3 | Review | 5 | 反馈循环、评价可信度 |

## 要点回顾

1. **会话实体**（Cart）用于记录进行中的状态
2. **一对一关系**用于建模排他性的归属
3. **布尔属性**（verified）支持按可信度筛选
4. **反馈循环**能够提供比线性链条更丰富的查询路径
5. 完整关系图支持从浏览到评价的**漏斗分析**

```quiz
Q: Review 实体为何会在本体中形成“反馈循环”？
- 它与关系图中的所有其他实体相连
- 它通过购买流程之外的另一条路径，将 Buyer 重新连接到 Product [correct]
- 它拥有所有实体中最多的属性
- 它使用 verified 布尔属性
> 没有 Review 时，Buyer 到 Product 的路径只能经过 Order。Review 提供了第二条路径：Buyer → Review → Product，从而形成循环。这种双路径结构支持对比查询，例如“购买了但未评价”和“评价了但没有购买”。
```

你已完成电子商务平台学习路径！从[本体目录](#/catalogue)加载任意步骤，即可交互式探索本体。
