---
title: Core Commerce
slug: core-commerce
description: Define Customer, Order, and Product — the three foundational entities of any retail ontology — and connect them with relationships.
order: 2
embed: official/iq-lab-retail-step-1
---

## 基础

每个零售系统都以三个核心概念开始：

- **客户** - 谁在购买？
- **订单** — 发生了什么交易？
- **产品** — 购买了什么？

这三种实体类型构成了本体的核心。我们在后续步骤中添加的所有其他内容都会连接回它们。

## 定义实体类型

每个实体类型需要：

1. A **名称** — 单数、描述性（例如 `Customer`，而不是 `Customers`或 `tbl_cust`)
2. **标识符属性** — 每个实例的唯一键
3. **属性** — 描述每个实例的属性

### 客户

|属性 |类型 |标识符？ |
|---|---|---|
| `customerId` |字符串| ✓ |
| `name` |字符串| |
| `email` |字符串| |
| `loyaltyTier` |字符串| |
| `lifetimeValue` |小数（美元）| |

`customerId` 唯一标识每个客户。 `loyaltyTier` 和 `lifetimeValue` 等属性是具有业务意义的名称，它们映射到源数据库中潜在的神秘列名称。

### 订单

|属性 |类型 |标识符？ |
|---|---|---|
| `orderId` |字符串| ✓ |
| `orderDate` |日期时间 | |
| `status` |字符串| |
| `totalAmount` |小数（美元）| |

### 产品

|属性 |类型 |标识符？ |
|---|---|---|
| `productId` |字符串| ✓ |
| `name` |字符串| |
| `unitCost` |小数（美元）| |
| `discountPercent` |小数 (%) | |

## 连接关系

单独的实体只是孤立的表。 **关系**将它们变成一个连通图：

- **OrderPlacedByCustomer** — `Order` → `Customer`（多对一）
每个订单都由一位客户下单，但一个客户可以下多个订单。

- **OrderContainsProduct** — `Order` → `Product`（多对多）
一个订单可以包含多个产品，一个产品可以出现在多个订单中。

### 基数很重要

基数告诉系统如何计数和聚合：

|基数 |意义|示例|
|---|---|---|
|一对一|每边正好一个 |员工 → 徽章 |
|一对多 |一位父母，许多孩子|客户→订单|
|多对一 |多个孩子，一位家长|订单 → 客户 |
|多对多 |无限制 |订单 ↔ 产品 |

选择正确的基数可确保诸如“每个客户下了多少订单？”之类的查询。返回正确的计数。

## 到目前为止的图

只需三个实体和两个关系，我们就已经有了一个连接图：

<ontology-embed id="official/iq-lab-retail-step-1" height="350px"></ontology-embed>

*客户、订单和产品由两个关系连接。这是其他一切构建的基础。*

## 我们学到了什么

- 每个实体类型都需要一个标识符属性
- 使用具有业务意义的名称，而不是内部列名称
- 关系具有影响数据计数方式的基数
- 即使三个实体也可以创建有用的连通图

```quiz
Q:一个客户可以下多个订单，但每个订单属于一个客户。这是什么基数？
- 一对一
- 多对多
- 一对多 [correct]
- 多对一
> 从客户的角度来看，这是一对多：一个客户可以有多个订单。从Order的角度来看，它是多对一的。该关系被定义为具有一对多基数的客户→订单。
```

接下来，我们将向订单添加详细信息并将产品组织到类别中。
