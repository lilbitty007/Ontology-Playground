---
title: Core Loan Triad
slug: core-loan-triad
description: Model the foundational FIBO loan triangle — Loan, Borrower, and Lender — with properties and relationships.
order: 2
embed: official/fibo-loans-step-1
reviewStatus: under-human-review
---

## 合同核心

每个贷款系统都从 FIBO 贷款与债务模块中的三个核心概念开始：

- **Loan（贷款）**——债务工具及其合同范围（`LOAN/LoansGeneral/Loans`）
- **Borrower（借款人）**——负有还款义务的一方（`FBC/DebtAndEquities/Debt`）
- **Lender（贷款机构）**——提供贷款资金的一方（`FBC/DebtAndEquities/Debt`）

在 FIBO 的 OWL 本体中，它们分别建模为 `fibo-loan-ln-ln:Loan`、`fibo-fbc-dae-dbt:Borrower` 和 `fibo-fbc-dae-dbt:Lender`。
LOAN 模块会导入并约束这些参与方角色概念，以适配贷款领域。本实验简化了类层级，同时保留核心语义。

## 关键属性

### Loan

| 属性 | 类型 | 说明 |
|---|---|---|
| `loanId` | string | Identifier |
| `principalAmount` | decimal (USD) | The originally contracted amount |
| `isInterestOnly` | boolean | Whether the borrower pays only interest during the initial term |

### Borrower

| 属性 | 类型 | 说明 |
|---|---|---|
| `borrowerId` | string | Identifier |
| `name` | string | Party name |
| `creditScore` | integer | Underwriting metric (e.g., FICO score) |

### Lender

| 属性 | 类型 | 说明 |
|---|---|---|
| `lenderId` | string | Identifier |
| `name` | string | Organization name |
| `lenderType` | string | Classification (e.g., "bank", "credit union", "mortgage company") |

## 关系

FIBO 将贷款参与方角色建模为从合同对象指向参与方的关系：

- **owedBy**：`Loan` → `Borrower`（多对一）——一笔贷款只对应一位借款人，但一位借款人可以持有多笔贷款
- **originatedBy**：`Loan` → `Lender`（多对一）——一笔贷款由一家贷款机构发起，而一家贷款机构可以发起多笔贷款

> **FIBO 参考：**在完整的 FIBO 模型中，借款人和贷款机构是通过债务与贷款本体使用的合同参与方角色，其角色语义基于参与方和合同模式。本实验采用简化的直接实体模型以便理解。参见 [FBC Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)、[LOAN LoansGeneral](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 和 [FND Parties](https://github.com/edmcouncil/fibo/tree/master/FND/Parties)。

## 第 1 步关系图

<ontology-embed id="official/fibo-loans-step-1" height="340px"></ontology-embed>

*三种实体和两种关系构成贷款核心三角，这是每个 FIBO 贷款模型的基础。*

```quiz
Q: 哪种关系最能表示贷款的还款责任？
- Borrower → Loan（originatedBy）
- Loan → Borrower（owedBy） [correct]
- Lender → Loan（owedBy）
- Loan → Lender（hasCollateral）
> 在此模型中，Loan 通过 `owedBy` 指向 Borrower，从合同对象的角度明确表达还款义务。这遵循 FIBO 的建模模式：由金融工具指向承担义务的参与方。
```
