---
title: "Complete Banking Model"
slug: complete-banking
description: "Add Loan and Investment to complete the banking ontology — connecting credit products and portfolio holdings."
order: 4
embed: official/finance-step-3
---

## 金融产品

除了基本账户和交易之外，银行还提供两大产品类别：

- **贷款** — 银行放贷的信贷产品
- **投资** — 客户增值的持股

添加这些使图片完整并创建有趣的多路径关系。

## 贷款

|属性 |类型 |标识符？ |
|---|---|---|
| `loanId` |字符串| ✓ |
| `principal` |小数（美元）| |
| `apr` |小数 (%) | |
| `term` |整数（月）| |
| `status` |字符串| |

`term` 是以月为单位的整数，这是持续时间属性的常见模式。 `apr`（年度百分比率）使用百分比单位。

## 投资

|属性 |类型 |标识符？ |
|---|---|---|
| `holdingId` |字符串| ✓ |
| `symbol` |字符串| |
| `shares` |小数 | |
| `purchasePrice` |小数（美元）| |
| `currentValue` |小数（美元）| |

`symbol` 属性（例如 MSFT、AAPL）标识股票。同时拥有 `purchasePrice` 和 `currentValue` 可以进行增益/损耗计算。

## 新关系

连接金融产品的四种关系：

- **has_loan** — `Customer` → `Loan`（一对多）
一个客户可以拥有多笔贷款。

- **资金** — `Account` → `Loan`（一对多）
账户作为贷款还款的支付来源。

- **持有** — `Customer` → `Investment`（一对多）
客户的投资组合。

- **linked_to** — `Account` → `Investment`（一对多）
与投资控股相关的经纪账户。

> **多路径模式：** 投资通过*两条*不同的路径连接到客户：直接通过 `holds` 和间接通过 `Account → linked_to`。这种冗余是有意为之的——它模拟了所有权（谁持有它？）和资金（哪个账户支持它？）。

## 完整图

<ontology-embed id="official/finance-step-3" diff="official/finance-step-2" height="500px"></ontology-embed>

*完整的银行与金融本体：5 个实体，6 个关系。贷款和投资通过客户和账户连接。*

## 完整模型支持什么

|问题 |图形路径|
|---|---|
|哪些高风险客户拥有大额贷款？ |客户 (riskProfile=high) → 贷款 (本金 > 100K) |
|我们的顶级客户的投资组合价值是什么？ |客户 → 投资（当前价值总和）|
|哪些账户同时为贷款和投资提供资金？ |账户 → 贷款 AND 账户 → 投资 |
|哪些客户的投资收益优于其贷款成本？ |客户→投资（当前价值）与客户→贷款（本金×年利率）|

## GQL 查询示例

查找投资组合超过其贷款本金总额的客户：

```gql
MATCH (c:Customer)-[:holds]->(inv:Investment),
      (c)-[:has_loan]->(loan:Loan)
WITH c, SUM(inv.currentValue) AS portfolio, SUM(loan.principal) AS debt
WHERE portfolio > debt
RETURN c.name, portfolio, debt
```

## 我们构建了什么

|步骤|添加实体 |累计|关键概念|
|---|---|---|---|
| 1 |客户、帐户 | 2 |所有权、财务标识符|
| 2 |交易 | 3 |活动跟踪、日期时间精度 |
| 3 |贷款、投资 | 5 |金融产品，多路径关系|

## 要点

1. **所有权链**（客户 → 账户 → 交易）支持合规性查询
2. **日期时间精度**对于财务数据至关重要
3. **多路径关系** 对财务数据的不同方面进行建模相同连接
4. **持续时间属性**（以月为单位）使用带单位的整数
5. 金融本体描述数据形状 — 敏感数据保留在源系统中

```quiz
Q:为什么投资同时连接到客户（通过“持有”）和账户（通过“linked_to”）？
- 这是一个错误 - 只需要一个关系
- 每种关系模拟不同的方面：所有权与资金来源 [correct]
- 投资需要至少两个关系才有效
- 一对多关系总是成对出现
> “持有”关系回答“谁拥有这项投资？”而“linked_to”则回答“哪个帐户为其提供资金？”这些是不同的问题，可能有不同的答案（例如，为一个人的投资提供资金的联名账户）。
```

您已完成银行与金融学习路径！从[目录](#/catalogue) 加载任何步骤以交互方式探索它。
