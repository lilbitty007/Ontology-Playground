---
title: "Scenario Overview"
slug: scenario-overview
description: "Meet Fourth Coffee — a modern coffee chain that needs an ontology to unify data across stores, suppliers, and orders."
order: 1
---

## 业务场景

你正在为 **Fourth Coffee** 设计数据模型。这是一家在多个城市设有门店的精品咖啡连锁企业，需要跟踪：

- 到店消费并下单的**顾客**
- 包含咖啡产品和食品的**订单**
- 从全球各地供应商采购的**产品**
- 分布在不同城市、容量各异的**门店**
- 提供咖啡豆和商品的**供应商**
- 将产品从供应商运送到门店的**货运**

这些数据分散在多个系统中：顾客档案存放在湖仓中，订单交易进入实时 Eventhouse，产品分析则使用 Power BI 语义模型。

## 为什么需要本体？

如果没有本体，要回答**“哪些供应商向容量最大的门店供应有机咖啡豆？”**，就必须先弄清楚每个系统中有哪些表、如何连接这些表，以及各列名称分别代表什么。

有了本体，这个问题可以直接映射为图遍历：

`Store → Shipment → Supplier` filtered by `Product.isOrganic = true` and `Store.capacity`.

## 本课程将构建什么

接下来分三个步骤逐步构建完整的 Fourth Coffee 本体：

| 步骤 | 实体 | 学习内容 |
|---|---|---|
| 1 | Customer、Order、Product | 核心实体类型、标识符和基数 |
| 2 | + Store | 地点建模、多对一关系 |
| 3 | + Supplier、Shipment | 供应链连接、枢纽实体 |

完成后，你将拥有一个包含 6 种实体和 7 种关系的本体，可用于图查询、GQL 查询，以及数据代理的自然语言交互。

## 核心概念

- **实体类型**——领域中的名词，例如 Customer、Order、Product
- **属性**——描述实体的特征，例如名称、价格、状态
- **标识符属性**——唯一标识每个实体实例的键
- **关系**——带有基数的有向连接，例如一对多、多对多
- **枢纽实体**——像 Shipment 这样的实体，可连接多个业务领域

现在从任何商业系统中最基础的三种实体开始。
