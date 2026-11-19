---
title: "Scenario Overview"
slug: scenario-overview
description: "Meet the E-Commerce Platform — a marketplace that needs an ontology to connect buyers, products, carts, orders, and reviews."
order: 1
---

## 业务场景

你正在为一个**通用电子商务平台**构建数据模型。平台涉及：

- 浏览和购买产品的**买家**
- 需要跟踪库存的**产品**
- 结账前仍在进行的**购物车会话**
- 已完成购买交易的**订单**
- 买家为产品评分和评论的**评价**

数据流经多个系统：订单使用事务数据库，产品发现依靠搜索引擎，买家行为分析则由数据仓库支持。

## 为什么需要本体？

要回答**“哪些已验证的评价者给自己没有购买的产品打了分？”**，需要关联买家、评价、订单和产品，查询多个系统中的数据。

有了本体，这可以表示为图模式：找到存在 `writes → Review → reviews → Product` 路径、但不存在对应产品 `places → Order → includes → Product` 路径的 `Buyer` 节点。

## 本课程将构建什么

| 步骤 | 实体 | 学习内容 |
|---|---|---|
| 1 | Buyer、Product、Order | 商城核心实体和购买流程 |
| 2 | + Shopping-Cart | 购买前会话、一对一关系 |
| 3 | + Review | 买家反馈循环，补全关系链路 |

完成后，你将构建一个包含 5 种实体和 6 种关系的本体，覆盖买家从浏览到评价的完整旅程。

## 核心概念

- **购买流程**——从浏览到下单的全过程
- **一对一关系**——两端各自只对应一个对象（Buyer ↔ Cart）
- **反馈循环**——评价如何将买家重新连接到产品
- **会话实体**——购物车等临时对象

现在从商城的核心实体开始。
