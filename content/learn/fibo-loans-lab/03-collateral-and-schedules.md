---
title: Collateral and Schedules
slug: collateral-and-schedules
description: Add security agreements and repayment cadence using FIBO's collateral and payment schedule concepts.
order: 3
embed: official/fibo-loans-step-2
reviewStatus: under-human-review
---

## 从合同到结构

加入 FIBO 中的两个概念后，贷款模型才能表达实际业务安排：

- **Collateral（抵押品）**——用于保障还款的资产（改编自 [FBC/DebtAndEquities/Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt) 中的 `fibo-fbc-dae-dbt:Collateral`）
- **LoanPaymentSchedule（贷款还款计划）**——描述预期还款的时间安排（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:LoanPaymentSchedule`）

这两项补充了 FIBO 的两个核心关注点：**担保协议**和**时间性义务**。

## 新增属性

### Collateral

| 属性 | 类型 | 说明 |
|---|---|---|
| `assetType` | string | Identifier — the kind of asset (e.g., "real property", "vehicle", "securities") |
| `appraisedValue` | decimal (USD) | Market value at time of appraisal |

> **FIBO 参考：**在完整本体中，债务抵押品建模为 `fibo-fbc-dae-dbt:Collateral`，可表示有形和无形的质押资产。在 FIBO 抵押贷款模块（[LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)）中，`LoanSecuredByRealEstate` 会将抵押品限制为 `fibo-fnd-plc-rp:RealProperty`，并通过 `owl:Restriction` 关联到 `SecurityAgreement`。

### LoanPaymentSchedule

| 属性 | 类型 | 说明 |
|---|---|---|
| `scheduleId` | string | Identifier |
| `expectedPayments` | integer | Anticipated number of payment periods |

## 新增关系

- **securedBy**：`Loan` → `Collateral`（一对多）——一笔贷款可以由多项资产提供担保
- **repaidBySchedule**：`Loan` → `LoanPaymentSchedule`（一对一）——每笔贷款都有一份主要还款计划

## 第 2 步关系图（与第 1 步对比）

<ontology-embed id="official/fibo-loans-step-2" diff="official/fibo-loans-step-1" height="380px"></ontology-embed>

*高亮显示新增实体：Collateral 和 LoanPaymentSchedule 为贷款模型补充了担保与时间安排结构。*

```quiz
Q: 在 FIBO 中，Collateral 概念来自哪个模块？
- LOAN/LoansGeneral/Loans
- FBC/DebtAndEquities/Debt [correct]
- FND/Agreements/Contracts
- FND/Places/RealProperty
> Collateral 定义在 FIBO 的 FBC（金融商业与商务）领域下的 DebtAndEquities/Debt 模块中。它表示为保障还款义务而质押的资产，适用于各种有担保贷款，而不仅是抵押贷款。
```
