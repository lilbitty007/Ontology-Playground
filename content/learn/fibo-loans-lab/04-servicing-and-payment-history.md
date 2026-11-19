---
title: Servicing and Payment History
slug: servicing-and-payment-history
description: Extend the model with FIBO servicing organizations and auditable payment events.
order: 4
embed: official/fibo-loans-step-3
reviewStatus: under-human-review
---

## 运营生命周期

贷款发放后会进入服务运营阶段。FIBO 通过两个模块描述这一过程：

- **Servicer（贷款服务机构）**——负责收取和处理付款的组织（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:Servicer`）
- **PaymentHistory（付款历史）**——汇总付款记录（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:PaymentHistory`，并扩展了 [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts) 中的交易记录模式）
- **PaymentTransaction（付款交易）**——单笔付款事件（改编自 `fibo-loan-ln-ln:IndividualPaymentTransaction`，后者基于 `fibo-fbc-pas-caa:IndividualTransaction`）

这与实际贷款平台的做法一致：将合同约定与执行记录分开保存。

## 新增属性

### Servicer

| 属性 | 类型 | 说明 |
|---|---|---|
| `servicerId` | string | Identifier |
| `organizationName` | string | Name of the servicing organization |

### PaymentHistory

| 属性 | 类型 | 说明 |
|---|---|---|
| `paymentHistoryId` | string | Identifier |

### PaymentTransaction

| 属性 | 类型 | 说明 |
|---|---|---|
| `paymentTransactionId` | string | Identifier |
| `amount` | decimal (USD) | Payment amount |
| `postedAt` | datetime | When the payment was recorded |

## 新增关系

- **servicedBy**：`Loan` → `Servicer`（多对一）——一家机构可以服务多笔贷款
- **hasPaymentHistory**：`LoanPaymentSchedule` → `PaymentHistory`（一对一）——将计划还款与实际记录连接起来
- **hasIndividualPayment**：`PaymentHistory` → `PaymentTransaction`（一对多）——每份付款历史包含多笔交易事件

## 审计轨迹

通过这些关系，可以沿着模型追踪完整路径：

`Loan` → `LoanPaymentSchedule` → `PaymentHistory` → `PaymentTransaction`

这条路径支持审计查询、逾期分析和服务质量指标计算，体现了本体驱动的数据集成通过图遍历带来的价值。

> **FIBO 参考：**在正式 FIBO 中，贷款服务和付款历史模式连接了 LOAN 与 FBC 模块：`Loan` 关联到贷款专用账户，付款历史建模为交易记录，而单笔付款交易记录事件级事实。本实验的简化模型保留了这一核心模式。参见 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 和 [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)。

## 第 3 步关系图（与第 2 步对比）

<ontology-embed id="official/fibo-loans-step-3" diff="official/fibo-loans-step-2" height="420px"></ontology-embed>

*三个新增实体（Servicer、PaymentHistory、PaymentTransaction）构成了用于跟踪贷款生命周期事件的运营层。*

```quiz
Q: amount 和 postedAt 这类单笔付款事件应存放在哪个实体中？
- Loan
- Servicer
- PaymentHistory
- PaymentTransaction [correct]
> PaymentHistory 是汇总容器。单笔事件属于 PaymentTransaction，其中存储用于对账和审计轨迹的事件明细。这种区分遵循 FIBO 的建模模式：将汇总记录与单笔交易分开。
```
