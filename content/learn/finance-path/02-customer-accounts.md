---
title: "Customer & Accounts"
slug: customer-accounts
description: "Define Customer and Account — the banking foundation — with ownership relationships and financial properties."
order: 2
embed: official/finance-step-1
---

## 银行基础

每个金融机构都从两个核心概念开始：

- **客户** - 谁持有账户？
- **帐户** — 资金在哪里存储和管理？

这对构成了任何银行本体的基础。所有其他金融产品都通过它们连接。

## 定义实体

### 客户

|属性 |类型 |标识符？ |
|---|---|---|
| `customerId` |字符串| ✓ |
| `name` |字符串| |
| `ssn` |字符串| |
| `creditScore` |整数 | |
| `riskProfile` |字符串| |

`creditScore` 是用于贷款决策的整数 (300–850)。 `riskProfile` 属性捕获银行对合规性和监控的评估。

> **敏感数据注意：** `ssn` 等属性作为元数据出现在本体中 - 它们描述*存在*的数据，而不是实际值。本体是一个模式，而不是一个数据库。

### 帐户

|属性 |类型 |标识符？ |
|---|---|---|
| `accountNumber` |字符串| ✓ |
| `type` |字符串| |
| `balance` |小数（美元）| |
| `interestRate` |小数 (%) | |
| `openDate` |日期 | |

`type` 属性区分支票帐户、储蓄帐户和经纪帐户。 `interestRate` 使用百分比单位。

## 所有权关系

- **拥有** — `Customer` → `Account`（一对多）
一个客户可以拥有多个账户（支票、储蓄、经纪），但每个账户都属于给一位客户。

## 到目前为止的图表

<ontology-embed id="official/finance-step-1" height="300px"></ontology-embed>

*通过所有权连接的客户和帐户关系。简单但基础。*

## 我们学到了什么

- **整数属性**适用于分数和评级 (creditScore)
- **百分比单位** (%) 表示基于利率的属性
- **拥有**关系创建了基本的所有权链
- 本体描述了数据的“形状”，而不是数据本身 - 像 SSN 这样的敏感字段是元数据

```quiz
Q:为什么 CreditScore 建模为整数而不是字符串？
- 字符串更难存储在数据库中
- 整数类型支持数字比较和范围查询（例如，creditScore > 700）[correct]
- 信用分数始终恰好是三位数字
- 整数占用更少的存储空间
> 通过使用整数类型，本体表示 CreditScore 支持数字运算 - 比较、范围、平均值和阈值。字符串属性不会向查询引擎传达此功能。
```

接下来，我们将添加事务来跟踪帐户活动。
