---
title: Microsoft Fabric IQ Ontology Concepts
slug: fabric-iq-ontology-concepts
description: How Microsoft Fabric uses ontologies to power natural-language queries over structured data — entity types, identifier properties, relationships, and cardinality.
order: 3
embed: official/ecommerce
---

## 什么是 Fabric IQ？

**Microsoft Fabric** 是统一的数据分析平台，整合了数据工程、数据科学、实时分析和商业智能。**IQ** 是 Fabric 的一项能力，用户可以用**自然语言**询问结构化数据并获取答案，无需编写 SQL。

其中的关键是**本体**：对实体类型、实体属性和实体关系的正式描述。IQ 会读取本体、理解数据结构，再把自然语言问题转换成正确的查询。

## IQ 如何使用本体

当用户询问*“上个月各地区的总销售额是多少？”*时，IQ 需要知道：

1. **实体类型**——`Order`、`Store`、`Region`
2. **属性**——`Order.totalAmount`、`Order.date`、`Store.region`
3. **关系**——`Order` → `placedAt` → `Store`，`Store` → `locatedIn` → `Region`
4. **标识符属性**——哪些字段能唯一标识每个实体（例如 `Order.orderId`）

本体会提供这四类信息。没有本体，IQ 就无法区分“门店”和“产品”，也不知道应该如何关联它们。

## 实体类型

实体类型代表一类业务对象。在 Fabric IQ 中，每种实体类型：

- 都有一个**名称**，还可以添加**说明**
- 包含一个或多个**属性**（有类型的列）
- 至少有一个用于唯一标识各个实例的**标识符属性**

你可以把它理解为表的定义：`Customer(customerId, name, email, tier)`。

## 属性与类型

每个属性都有数据类型：

| 类型 | 说明 | 示例 |
|------|-------------|---------|
| `string` | 文本 | 顾客姓名、产品 SKU |
| `integer` | 整数 | 数量、年份 |
| `decimal` | 小数 | 价格、评分 |
| `date` | 日期 | 下单日期、出生日期 |
| `datetime` | 日期和时间 | 创建时间戳 |
| `boolean` | true/false | 是否启用、是否高级会员 |

**标识符属性**会以钥匙图标标记。它至关重要，因为 IQ 需要用它正确地统计、分组和关联实体。

## 关系与基数

关系用于连接实体类型。每个关系都需要说明：

- **源和目标**实体类型
- **名称**（表示动作的动词，例如 `places`、`contains`、`worksAt`）
- **基数**——两端可以关联多少个实例

| 基数 | 含义 | 示例 |
|------------|---------|---------|
| 一对一 | 每个 A 恰好对应一个 B | `Employee` → `Badge` |
| 一对多 | 每个 A 可以对应多个 B | `Customer` → `Order` |
| 多对一 | 多个 A 可以对应一个 B | `Order` → `Store` |
| 多对多 | 多个 A 可以对应多个 B | `Student` → `Course` |

IQ 会依据基数生成正确的汇总结果。`Customer` 与 `Order` 之间的一对多关系意味着“每位顾客的订单数”是有效的统计，而“每笔订单的顾客数”通常为 1。

<ontology-embed id="official/ecommerce" height="400px"></ontology-embed>

*电子商务本体展示了适用于 IQ 的模式：每个实体都设置了标识符属性，各列都有类型，并为每种关系指定了基数。*

## 面向 IQ 设计本体

为 Fabric IQ 构建本体时，请参考以下做法：

1. **清楚地命名实体**——使用用户熟悉的业务术语（例如 `Customer`，而不是 `tbl_cust`）
2. **添加说明**——IQ 会利用说明区分相似概念
3. **标记标识符**——每个实体都必须至少有一个标识符属性
4. **设置基数**——帮助 IQ 生成正确的 `GROUP BY` 和 `JOIN` 逻辑
5. **保持模型聚焦**——只建模用户会查询的概念，不必照搬所有内部数据表

## 要点回顾

- Fabric IQ 使用本体将自然语言问题转换成 SQL
- 实体类型、属性、关系和基数是建模的四个核心要素
- 每个实体都需要标识符属性，才能正确统计和关联
- 清晰的名称和说明能提高 IQ 回答问题的准确度
- 使用[本体设计器](#/designer)可视化创建适用于 IQ 的本体

```quiz
Q: 为什么 Fabric IQ 要求每种实体类型都设置标识符属性？
- 让本体看起来更专业
- 帮助 IQ 正确统计、分组和关联实体 [correct]
- 用作实体的显示名称
- 设置默认排序顺序
> 标识符属性可以唯一地区分某种实体类型的实例。没有它，IQ 就无法在转换后的 SQL 中正确生成 COUNT、GROUP BY 或 JOIN 操作。
```

```quiz
Q: 关系的基数会告诉 Fabric IQ 什么信息？
- 绘制关系时应使用什么颜色
- 关系两端可以关联多少个实例 [correct]
- 关系是可选还是必需
- 实体的显示顺序
> 基数（一对一、一对多、多对一、多对多）会告诉 IQ 如何正确生成汇总和关联。例如，IQ 能据此知道一位顾客可以有多笔订单。
```
