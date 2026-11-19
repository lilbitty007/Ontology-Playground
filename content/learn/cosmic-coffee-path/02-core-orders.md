---
title: "Core Orders"
slug: core-orders
description: "Define Customer, Order, and Product — the foundational entities of the coffee business — and connect them with relationships."
order: 2
embed: official/cosmic-coffee-step-1
---

## 基础实体

每个商业系统都从三个核心概念开始：

- **Customer（顾客）**——谁在购买？
- **Order（订单）**——发生了什么交易？
- **Product（产品）**——购买了什么？

这三种实体类型构成了 Fourth Coffee 本体的核心。后续添加的内容都会与它们相连。

## 定义实体

### Customer

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `email` | string | |
| `loyaltyTier` | enum (Bronze, Silver, Gold, Platinum) | |
| `joinDate` | date | |
| `totalSpend` | decimal (USD) | |

`customerId` 用于唯一标识每位顾客。`loyaltyTier` 使用枚举，将值限制在有效会员等级内，避免后续分析出现数据质量问题。

### Order

| Property | Type | Identifier? |
|---|---|---|
| `orderId` | string | ✓ |
| `timestamp` | datetime | |
| `total` | decimal (USD) | |
| `status` | enum (Pending, Preparing, Ready, Completed, Cancelled) | |
| `paymentMethod` | enum (Card, Cash, Mobile, Gift Card) | |

### Product

| Property | Type | Identifier? |
|---|---|---|
| `productId` | string | ✓ |
| `name` | string | |
| `category` | enum (Espresso, Brewed, Cold Brew, Tea, Food, Merchandise) | |
| `price` | decimal (USD) | |
| `origin` | string | |
| `isOrganic` | boolean | |

`isOrganic` 是布尔值，可用于后续筛选和合规性查询。

## 使用关系连接实体

单独的实体只是彼此孤立的表。**关系**可以把它们连接成图：

- **places**——`Customer` → `Order`（一对多）
  每位顾客可以下多笔订单，但每笔订单只属于一位顾客。

- **contains**——`Order` → `Product`（多对多）
  一笔订单可以包含多种产品，同一种产品也可以出现在许多订单中。

## 当前的关系图

<ontology-embed id="official/cosmic-coffee-step-1" height="350px"></ontology-embed>

*目前包含三种实体和两种关系，这是后续建模的基础。*

## 本节要点

- 每个实体都需要一个**标识符属性**作为唯一键
- **枚举属性**可将取值限制在有效选项中
- **布尔属性**便于筛选
- **基数**（一对多或多对多）决定实体之间的关联方式

```quiz
Q: 为什么 Order 和 Product 之间的 `contains` 关系是多对多，而不是一对多？
- 每笔订单只能包含一种产品
- 一种产品同一时间只能出现在一笔订单中
- 一笔订单可以包含多种产品，而且一种产品可以出现在多笔订单中 [correct]
- 所有关系默认都是多对多
> 一笔订单通常包含多种产品（例如拿铁、松饼和一袋咖啡豆），每种产品也会出现在许多不同订单中。这种双向的多重关系需要使用多对多基数。
```

接下来，我们将添加 Store，记录订单在哪家门店处理。
