---
title: "Transactions"
slug: transactions
description: "Add Transaction records to track every debit, credit, and transfer on an account."
order: 3
embed: official/finance-step-2
---

## 跟踪活动

没有交易历史记录的账户只是静态余额。添加**交易**捕获资金流——每次购买、存款、转账和费用。

这可以提出如下问题：
- “这位顾客上个月在餐馆花了多少钱？”
- “哪些账户有不寻常的交易模式？”
- “每种账户类型的平均交易金额是多少？”

## 交易实体

|属性 |类型 |标识符？ |
|---|---|---|
| `transactionId` |字符串| ✓ |
| `amount` |小数（美元）| |
| `type` |字符串| |
| `timestamp` |日期时间 | |
| `merchant` |字符串| |

`timestamp` 是一个日期时间（不仅仅是日期），因为金融交易需要精确性 — 为了进行欺诈检测，下午 2:30 的购买与下午 2:31 的购买不同。

`merchant` 属性捕获交易发生的位置 - 对于支出类别分析非常有用。

## 新关系

- **has_transaction** — `Account` → `Transaction`（一对多）
每个账户随着时间的推移有很多笔交易，但每笔交易属于一个账户。

这扩展了所有权链：`Customer → Account → Transaction`。

## 增长图

<ontology-embed id="official/finance-step-2" diff="official/finance-step-1" height="400px"></ontology-embed>

*Transaction 添加活动层。所有权链不断增长：客户 → 账户 → 交易。*

## 我们了解到的内容

- **日期时间精度**对于财务和合规场景至关重要
- **所有权链**（客户 → 账户 → 交易）启用深入查询
- `merchant` 属性可在不添加商家实体的情况下进行支出分析
- 每个新实体都会加深您可以回答的问题

```quiz
Q:为什么 Transaction 使用 datetime 类型作为时间戳而不是日期？
- 日期时间是所有基于时间的字段的默认属性类型
- 金融交易需要每日时间精度以进行欺诈检测和审计跟踪 [correct]
- 现代本体中不推荐使用日期类型
- 日期时间使用的存储空间少于日期
> 财务合规性和欺诈检测需要精确的时间戳。同一日期但相隔几分钟的两笔交易可能表明存在欺诈模式。 Datetime 捕获日期和时间，提供所需的精度。
```

接下来，我们将添加贷款和投资以完成银行产品套件。
