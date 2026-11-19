---
title: Ontology Design Patterns
slug: ontology-design-patterns
description: Practical naming conventions, modelling patterns, and common anti-patterns to avoid when designing ontologies for data platforms.
order: 5
embed: official/healthcare
---

## 使用便于理解的名称

命名是最重要的设计决策。实体类型和属性既要让人读懂，也要让机器使用。名称越清楚，自然语言查询的结果就越准确。

**建议：**
- 实体类型使用单数名词：`Customer`、`Product`、`Order`
- 属性使用小驼峰命名法：`firstName`、`totalAmount`、`createdDate`
- 关系使用动词短语：`placedBy`、`worksAt`、`contains`

**避免：**
- 使用内部表名：`tbl_cust_v2`、`DIM_PRODUCT`
- 使用缩写：请写出完整名称，不要写 `qty`、`amt`、`dt`
- 使用含义模糊的名称：`Item`、`Record`、`Thing`

## 一个实体表达一个概念

每种实体类型都应该表示一个**业务概念**。如果你发现自己不断添加互不相关的属性，就应该考虑拆分实体。

**反面模式：**`Person` 实体同时包含 `salary`、`patientId`、`courseGrade` 和 `accountBalance`。这些属性分别属于员工、患者、学生和顾客四种不同概念，却被硬塞进同一个实体。

**更好的做法：**创建独立的实体类型，并在需要时建立关系。例如，`Person` 可以关联到 `Employee` 记录、`Patient` 记录等。

## 谨慎选择标识符

标识符属性决定了如何统计、分组和关联实例。好的标识符应当：

- **唯一**：在所有实例中都不重复
- **稳定**：不会随时间变化
- **有意义**：优先使用业务主键，而不是内部自增值

例如，图书可以使用 `isbn`，用户可以使用 `email`，订单可以使用 `orderId`。

尽量避免组合标识符（由多个字段共同组成的键），因为大多数本体工具都期望每个实体有一个标识符。

## 使用语义关系，而非外键

在关系型数据库中，通常使用外键连接数据表。在本体中，应该使用**有明确语义的命名关系**。

| 关系型数据库 | 本体 |
|-----------|----------|
| `orders.customer_id → customers.id` | `Order` → `placedBy` → `Customer` |
| `order_items.product_id → products.id` | `OrderItem` → `contains` → `Product` |

关系的**名称**很关键，它会告诉查询引擎（以及阅读者）这条连接的含义。`placedBy` 比名为 `fk_cust_id` 的列直观得多。

## 设置正确的基数

错误的基数会导致汇总结果错误。可以问自己：“对于一个 A 实例，可以关联多少个 B 实例？”

- 一位顾客可以下**多笔**订单 → 一对多
- 一笔订单在**一家**门店处理 → 多对一
- 一位学生可以选修**多门**课程，一门课程也可以有**多位**学生 → 多对多

<ontology-embed id="official/healthcare" height="400px"></ontology-embed>

*医疗保健本体很好地展示了基数：一位患者可以有多次预约，但每次预约对应一位服务提供者。一项诊断属于一位患者，但可能关联多份处方。*

## 避免常见错误

| 错误 | 问题 | 修正方法 |
|---------|---------|-----|
| **万能实体** | 一个实体包含 30 个以上属性 | 拆分为职责明确的实体 |
| **缺少标识符** | 无法统计或分组实例 | 添加唯一标识符属性 |
| **关系名称含糊** | `relatedTo`、`hasLink` | 使用明确动词：`prescribes`、`enrolledIn` |
| **循环的一对一关系** | A → B 和 B → A 都是一对一 | 很可能是同一个实体，应考虑合并 |
| **过度建模** | 把每张内部表都变成实体 | 建模用户会查询的概念，而不是照搬数据表结构 |

## 何时添加说明

实体类型、属性和关系都可以添加可选的**说明**。以下情况尤其适合补充说明：

- 名称本身有歧义（例如 `status` 可能表示多种状态）
- 概念属于特定领域（例如 `formulary`、`SKU`、`yield`）
- 你希望帮助系统正确理解自然语言查询

## 要点回顾

- 为人清晰命名：实体使用单数名词，属性使用小驼峰，关系使用动词短语
- 一个实体表示一个概念，拆分承载过多内容的实体
- 选择稳定、唯一且有意义的标识符
- 用具名关系建模，而不是直接暴露外键列
- 设置正确的基数，确保汇总结果有效
- 名称有歧义时补充说明

```quiz
Q: Person 实体包含 salary、patientId、courseGrade 和 accountBalance 属性。应该采用什么设计方式？
- 添加一个标识符属性
- 将所有属性合并到说明字段中
- 拆分为 Employee、Patient、Student、Customer 等实体类型，并按需建立关系 [correct]
- 只保留一个属性以简化模型
> 当一个实体堆积了互不相关的属性时，它就成了“万能实体”。应将每个概念拆分为独立的实体类型，并在需要时通过关系将它们连接起来。
```
