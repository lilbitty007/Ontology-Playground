---
title: "Shopping Carts"
slug: shopping-carts
description: "Add Shopping-Cart to model active shopping sessions and introduce the one-to-one relationship pattern."
order: 3
embed: official/ecommerce-step-2
---

## 购买之前

并非每次浏览都会促成购买。**Shopping Cart（购物车）**记录买家结账前正在考虑购买的内容。它是一种会话实体，具有临时性，也会持续变化。

添加购物车后，我们可以回答以下问题：
- “本周有多少购物车被放弃？”
- “购物车平均金额与订单平均金额分别是多少？”
- “哪些产品经常被加入购物车，却没有购买？”

## Shopping-Cart 实体

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `cartId` | string | ✓ |
| `createdAt` | datetime | |
| `itemCount` | integer | |
| `subtotal` | decimal (USD) | |

`itemCount` 和 `subtotal` 是反规范化的汇总属性。它们原本可以从购物车内容计算得出，但直接存储可加快查询。

## 新增关系

- **has_cart**——`Buyer` → `Shopping-Cart`（一对一）
  每位买家恰好有一个活跃购物车，每个购物车也只属于一位买家。

- **contains**——`Shopping-Cart` → `Product`（多对多）
  一个购物车可以包含多种产品，一种产品也可以出现在许多购物车中。

> **一对一模式：**`has_cart` 是一对一关系，因为每位买家同时只有一个活跃购物会话。这与订单的一对多关系不同：买家会不断积累订单，但任一时刻只有一个购物车。

## 扩展后的关系图

<ontology-embed id="official/ecommerce-step-2" diff="official/ecommerce-step-1" height="400px"></ontology-embed>

*Shopping-Cart 通过两种新关系将 Buyer 与 Product 连接起来。差异视图会突出显示相较于第 1 步新增的内容。*

## 本节要点

- **会话实体**用于描述临时或进行中的状态，例如购物车、草稿和会话
- **一对一关系**表示严格的一一对应（一个买家 ↔ 一个购物车）
- **反规范化属性**（itemCount、subtotal）以存储空间换取查询速度
- 购物车分析可提供**转化漏斗**洞察，例如购物车到订单的转化率

```quiz
Q: 为什么 Buyer 与 Shopping-Cart 之间的 `has_cart` 关系是一对一，而不是一对多？
- 因为购物车不需要唯一标识符
- 因为每位买家在任一时刻恰好只有一个活跃购物车 [correct]
- 因为一对一更容易实现
- 因为购买后购物车会被删除
> 买家在任一时刻只保留一个活跃购物会话（购物车）。订单会随买家一生中的购买逐渐累积，而购物车代表当前状态，因此是一个买家对应一个活跃购物车。
```

接下来，我们将添加顾客评价，补全平台模型。
