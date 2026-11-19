---
title: Risk and Classifiers
slug: risk-and-classifiers
description: Add FIBO ownership and lien classifiers to support underwriting and collateral risk analysis.
order: 5
embed: official/fibo-loans-step-4
reviewStatus: under-human-review
---

## 分类层

FIBO 严重依赖显式分类器 - 其主要作用是对其他实体进行分类的实体。在最后一步中，我们添加了对抵押贷款和担保贷款风险分析至关重要的两个概念：

- **OwnershipInterest** - 对抵押品的合法所有权类型进行分类（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:OwnershipInterest`，以 `fibo-fnd-oac-own:Ownership` 为基础）
- **LenderLienPosition** — 对贷方债权相对于抵押资产的优先权进行分类（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:LenderLienPosition`）

## 为什么分类器很重要

在 FIBO 抵押贷款模块 ([LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)) 中，留置权位置决定止赎中的恢复优先级。第一留置权抵押贷款的回收预期比次级留置权更强，这直接影响：

- 信用风险建模
- 违约损失估计
- 投资组合风险聚合
- 监管资本计算

> **FIBO 参考**：FIBO 抵押本体使用 `owl:Restriction` 块来约束房地产抵押品和合约语义。在 LOAN 本体中，`SecurityAgreement` 和 `Loan` 进一步受到分类器使用（例如 `LenderLienPosition` 和 `OwnershipInterest`）的限制。请参阅 [LOAN/RealEstateLoans/Mortgages.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/RealEstateLoans/Mortgages.rdf) 和 [LOAN/LoansGeneral/Loans.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/LoansGeneral/Loans.rdf)。

## 新关系

- **对抵押品所有权进行分类**：`OwnershipInterest` → `Collateral` (`one-to-many`)
- **hasLienPosition**: `Collateral` → `LenderLienPosition` (`many-to-one`)

## 步骤 4 图表（与步骤 3 不同）

<本体嵌入id="official/fibo-loans-step-4" diff="official/fibo-loans-step-3" height="460px"></ontology-embed>

*两个分类器实体（OwnershipInterest 和 LenderLienPosition）通过风险和承保语义完成模型。*

## 完整改编模型

您还可以检查从相同 FIBO 源概念构建的完整外部子集：

<ontology-embed id="external/fibo/loans-general" height="420px"></ontology-embed>

## 您构建的内容

您现在拥有一个渐进式、受 FIBO 启发的贷款本体，涵盖：

|层 |实体| FIBO 源码模块 |
|---|---|---|
|合约演员|贷款、借款人、贷款人 | [贷款/一般贷款/贷款](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) |
|安全与日程安排|抵押品、贷款付款时间表 | [FBC/债务和股票/债务](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt) |
|维修业务|服务商、付款历史记录、付款交易 | [贷款/一般贷款/贷款](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FBC/产品和服务/客户和帐户](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts) |
|风险分类器 |所有权利息、贷款人留置权位置 | [贷款/一般贷款/贷款](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FND/所有权和控制/所有权](https://github.com/edmcouncil/fibo/tree/master/FND/OwnershipAndControl) |

这是扩展到特定领域模块（抵押贷款类型、HELOC 产品、汽车贷款或小企业贷款）的坚实基础。

## 进一步阅读

- **FIBO GitHub**：[github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **FIBO 规范**： [spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)
- **EDM 委员会**：[edmcouncil.org](https://edmcouncil.org/)
- **FIBO 贷款模块**：[LOAN/LoansGeneral/贷款来源](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)
- **FIBO 抵押贷款模块**：[贷款/房地产贷款/抵押贷款来源](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)
- **FIBO 债务模块**：[FBC/DebtAndEquities/债务来源](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)
- **FIBO 客户和账户模块**： [FBC/ProductsAndServices/ClientsAndAccounts 源](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)

## 许可

本实验中引用的所有 FIBO 本体内容为：

- **版权** EDM Council, Inc. 和 Object Management Group, Inc.（有关确切年份范围，请参阅模块标题）
- **根据 [MIT 许可证](https://opensource.org/licenses/MIT) 获得许可**

MIT 许可证允许使用、修改和重新分发本体文件，包括用于商业目的，前提是版权声明是保留。本实验室中的本体文件是为教育目的而创建的改编子集。

```quiz
Q:将 LenderLienPosition 添加到抵押品模型中的主要价值是什么？
- 它取代了对借款人信息的需求
- 它捕获贷方索赔的优先级，这是信用风险和损失建模的关键[correct]
- 它存储付款时间戳
- 它自动确定贷款利率
> 留置权位置捕获索赔优先级（例如，第一留置权与从属留置权）留置权），这直接影响止赎的回收预期。这对于承保、投资组合风险模型和监管资本计算至关重要——这是 FIBO 债务和股权模块的关键概念。
```
