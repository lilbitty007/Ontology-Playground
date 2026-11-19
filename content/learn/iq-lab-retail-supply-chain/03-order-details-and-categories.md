---
title: Order Details & Categories
slug: order-details-and-categories
description: Add OrderLine as a linking entity between Order and Product, and introduce ProductCategory for grouping.
order: 3
embed: official/iq-lab-retail-step-2
---

## 多对多的问题

在步骤 1 中，我们以多对多关系将 Order 直接连接到 Product。这适用于简单的查询，例如“此订单中有哪些产品？” — 但是**数量**和**行总计**又如何呢？

直接的多对多关系不能携带属性。如果客户 A 订购了 3 件产品 X，而客户 B 订购了 1 件，那么该数量在哪里？不在订单上（它有多个产品），也不在产品上（它出现在多个订单中）。

## 链接实体模式

该解决方案是一个 **链接实体** - 位于两个实体之间并带有每个关联属性的实体类型：

**OrderLine** 将订单连接到产品并保存：

|属性 |类型 |标识符？ |
|---|---|---|
| `orderLineId` |字符串| ✓ |
| `quantity` |整数 | |
| `lineTotal` |小数（美元）| |

### 新关系

- **OrderHasLineItem** — `Order` → `OrderLine`（一对多）
每个订单都有一个或多个行项目。

- **OrderLineReferencesProduct** — `OrderLine` → `Product`（多对一）
每个行项目仅引用一种产品。

现在的遍历是：`Order` → `OrderLine` → `Product`，每个行项目都带有自己的 `quantity` 和 `lineTotal`。

> **设计模式：** 每当多对多关系需要属性（数量、价格、日期）时，引入链接实体。这在本体上相当于关系数据库中的关联表。

## 按类别进行组织

产品很少单独存在 - 它们属于**类别**，例如“冷冻商品”、“家用”或“电子产品”。通过添加 ProductCategory 实体，我们可以对产品进行分组并回答诸如“哪个类别的回报率最高？”之类的问题。

**产品类别**：

|属性 |类型 |标识符？ |
|---|---|---|
| `categoryId` |字符串| ✓ |
| `categoryName` |字符串| |

### 新关系

- **ProductInCategory** — `Product` → `ProductCategory`（多对一）
每个产品都属于一个类别。

## 第 2 步的图表

<ontology-embed id="official/iq-lab-retail-step-2" diff="official/iq-lab-retail-step-1" height="400px"></ontology-embed>

*由五种关系连接的五种实体类型。 OrderLine 充当订单和产品之间的桥梁，承载数量数据。 ProductCategory 对产品进行分组。*

## 我们学到了什么

- **链接实体**解决多对多属性问题
- 当关系需要自己的数据时，将其建模为实体
- **层次结构** （产品 → 产品类别）启用汇总查询
- 图表不断增长 - 每个新实体都连接到现有实体

```quiz
Q:什么时候应该引入链接实体（如 OrderLine）而不是直接关系？
- 当您拥有三个以上的实体类型时
- 当两个实体之间的关系需要自己的属性时 [correct]
- 当两种实体类型都具有标识符属性时
- 当实体位于不同的命名空间中时
> 当多对多关系需要携带自己的数据（如数量或行）时，需要链接实体总计）。直接关系不能包含属性。
```

接下来，我们将添加区域和商店的地理结构。
