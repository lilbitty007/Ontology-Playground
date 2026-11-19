---
title: "Core Marketplace"
slug: core-marketplace
description: "Define Buyer, Product, and Order — the foundational entities that power any e-commerce platform."
order: 2
embed: official/ecommerce-step-1
---

## 购买流程

每个商城都围绕三个概念运作：

- **Buyer（买家）**——谁在购买？
- **Product（产品）**——出售的是什么？
- **Order（订单）**——完成了什么交易？

这三种实体概括了基本的购买流程。之后加入的内容都会扩展这一基础。

## 定义实体

### Buyer

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `buyerId` | string | ✓ |
| `email` | string | |
| `memberSince` | date | |
| `loyaltyTier` | string | |
| `totalSpent` | decimal (USD) | |

与实体零售顾客不同，电子商务买家通常使用 `email` 作为主要联系渠道。`totalSpent` 属性可用于客户终身价值分群。

### Product

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `sku` | string | ✓ |
| `name` | string | |
| `category` | string | |
| `price` | decimal (USD) | |
| `stockQty` | integer | |

这里的标识符是 `sku`（库存单位），这是电子商务中通用的产品标识符。`stockQty` 属性用于跟踪实时库存。

### Order

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `orderId` | string | ✓ |
| `orderDate` | datetime | |
| `status` | string | |
| `total` | decimal (USD) | |
| `shippingMethod` | string | |

## 关系

- **places**——`Buyer` → `Order`（一对多）
  一位买家可以在不同时段下多笔订单。

- **includes**——`Order` → `Product`（多对多）
  一笔订单可以包含多种产品，每种产品也可能出现在许多订单中。

## 当前的关系图

<ontology-embed id="official/ecommerce-step-1" height="350px"></ontology-embed>

*Buyer、Product 和 Order 通过购买流程中的关系连接起来。*

## 本节要点

- **SKU** 是电子商务产品通用的标识符
- `stockQty` 整数属性可用于库存查询
- 基本购买流程（Buyer → Order → Product）是商城建模的核心

```quiz
Q: 为什么用 `sku` 而不是 `productId` 作为 Product 的标识符？
- SKU 更短，输入更方便
- SKU（库存单位）是电子商务和零售系统通用的产品标识符 [correct]
- productId 会造成命名冲突
- SKU 一定是数字
> SKU 是 Stock Keeping Unit（库存单位）的缩写，是库存管理、仓储和电子商务系统中用于唯一标识每件商品的行业通用标识符。
```

接下来，我们将添加 Shopping Cart，为购买前的购物体验建模。
