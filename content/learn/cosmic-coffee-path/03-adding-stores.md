---
title: "Adding Stores"
slug: adding-stores
description: "Introduce Store locations into the ontology and connect orders to their processing stores."
order: 3
embed: official/cosmic-coffee-step-2
---

## 订单在哪里处理

目前我们知道*谁*订购了*什么*，还不知道*在哪里*。Fourth Coffee 在多个城市经营门店，每笔订单都由一家特定门店处理。

添加 **Store（门店）**实体后，就可以回答以下地点相关的问题：
- “哪家门店的订单最多？”
- “各城市的平均订单金额是多少？”
- “根据订单量，哪些门店需要增加人手？”

## Store 实体

| 属性 | 类型 | 标识符？ |
|---|---|---|
| `storeId` | string | ✓ |
| `name` | string | |
| `city` | string | |
| `state` | string | |
| `openDate` | date | |
| `capacity` | integer | |

`capacity` 属性表示座位容量，类型为**整数**，可用于运营规划。`city` 和 `state` 属性提供地理信息，无需建立复杂的地址层级结构。

## 新增关系

- **processedAt**——`Order` → `Store`（多对一）
  每笔订单只在一家门店处理，而一家门店可以处理许多订单。

> **设计说明：**这是多对一关系，许多订单对应一家门店。对于“属于”或“发生在某地”这类关系，这是最常见的基数模式。

## 扩展后的关系图

<ontology-embed id="official/cosmic-coffee-step-2" diff="official/cosmic-coffee-step-1" height="400px"></ontology-embed>

*Store 通过 processedAt 关系加入图中。差异视图会突出显示相较于第 1 步新增的内容。*

## 本节要点

- **多对一关系**适用于“属于”或“位于”这类模式
- **整数属性**适合表示可计数的数量，例如容量、楼层和座位数
- 只需增加一种实体，就能支持一整类地点查询
- `diff` 视图会明确显示变化内容，便于跟踪本体的演进

```quiz
Q: Order 和 Store 之间的 `processedAt` 关系应设置什么基数？
- 一对一——每家门店只有一笔订单
- 一对多——每笔订单由多家门店处理
- 多对一——多笔订单由一家门店处理 [correct]
- 多对多——订单可以同时由多家门店处理
> 每笔订单只由一家门店处理，但一家门店每天会处理许多订单。从 Order 的角度看，这是多对一关系。
```

接下来，我们将添加 Supplier 和 Shipment，补全供应链。
