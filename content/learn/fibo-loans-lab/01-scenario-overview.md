---
title: Scenario Overview
slug: scenario-overview
description: What is FIBO, where does it come from, and what we'll build in this lab.
order: 1
reviewStatus: under-human-review
---

## 什么是 FIBO？

**金融行业业务本体**（Financial Industry Business Ontology，FIBO）是一套行业标准本体，由 [EDM Council](https://edmcouncil.org/) 与 [Object Management Group](https://www.omg.org/)（OMG）共同开发。它为金融工具、参与方、合同和监管概念提供正式且机器可读的词汇。

FIBO is:

- 根据 [MIT License](https://opensource.org/licenses/MIT) 开源
- 托管于 GitHub：[edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- 以 OWL 本体形式发布：[spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)
- 自 2012 年起持续开发，主要金融机构、监管机构和标准组织均参与贡献

> **来源：**本实验中的概念主要改编自 `LOAN/LoansGeneral/Loans`，并参考了 `FBC/DebtAndEquities/Debt`、`FBC/ProductsAndServices/ClientsAndAccounts` 和 `FND/OwnershipAndControl/Ownership`。完整源模块见 [FIBO GitHub 代码库](https://github.com/edmcouncil/fibo)。

## 为什么设计这个实验

FIBO 规模庞大，包含数百个本体模块，涉及证券、衍生品、公司行动、指数等领域。仅 `LOAN` 领域就覆盖多个子模块：

| FIBO 模块 | 覆盖内容 |
|---|---|
| `LOAN/LoansGeneral/Loans` | Loan lifecycle concepts (loan, servicing, payment history, lien and ownership classifiers) |
| `FBC/DebtAndEquities/Debt` | Borrower/lender roles, collateral, security agreements, debt terms |
| `FBC/ProductsAndServices/ClientsAndAccounts` | Transaction records and individual transactions used by payment history |
| `LOAN/RealEstateLoans/Mortgages` | Real-estate-specific constraints (real property collateral and mortgage constructs) |
| `FND/OwnershipAndControl/Ownership` | Ownership semantics reused by loan ownership classifiers |

*(Source: [FIBO ontology structure](https://github.com/edmcouncil/fibo/tree/master/LOAN))*

本实验选取了适合教学的子集，重点介绍贷款合同和付款流程，让你无需遍历完整模块层级，也能学习 FIBO 建模模式。

## 本实验将构建什么

在接下来的四个步骤中，我们将构建一个包含 10 种实体类型和 10 种关系的**贷款本体**：

1. **贷款核心三元组**——`Loan`、`Borrower`、`Lender`
2. **抵押品与还款计划**——`Collateral`、`LoanPaymentSchedule`
3. **贷款服务与付款历史**——`Servicer`、`PaymentHistory`、`PaymentTransaction`
4. **风险分类器**——`OwnershipInterest`、`LenderLienPosition`

## 模型可以回答的实际问题

- 哪些有抵押贷款处于次级留置权位置？
- 哪些借款人的只付利息贷款本金超过指定阈值？
- 不同贷款服务机构的付款交易模式有何差异？
- 哪些所有权结构与还款问题相关？

## 许可证与来源说明

本实验改编自 EDM Council 的 FIBO 本体：

- **Copyright**: EDM Council, Inc. and Object Management Group, Inc. (see module headers for exact year ranges)
- **License**: [MIT License](https://opensource.org/licenses/MIT)
- **Source repository**: [github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **Specification**: [spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)

本实验中的本体文件经过简化，适用于课堂教学。它们在保留 FIBO 核心语义的同时降低了复杂度，便于逐步学习。

```quiz
Q: 哪些组织负责开发和维护 FIBO？
- 世界银行
- EDM Council 与 Object Management Group（OMG） [correct]
- 欧洲中央银行
- W3C Web 本体工作组
> FIBO 由 EDM Council（企业数据管理委员会）与 Object Management Group 合作开发。它根据 MIT License 开源，并托管于 GitHub 的 edmcouncil/fibo 代码库。
```
