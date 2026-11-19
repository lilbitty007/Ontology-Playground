---
title: "Step 3: Loan Classification"
slug: loan-classification
description: Add loan types with Basel risk weights, collateral categories, and OCC/FDIC concentration buckets.
order: 4
embed: official/fibo-risk-step-3
reviewStatus: under-human-review
---

## 产品维度

我们对*何处*风险生活（地理）和*哪些部门*暴露（行业）进行了建模。现在我们添加**贷款产品维度**——按类型、抵押品以及所属监管集中度对贷款进行分类。

这就是巴塞尔协议 III 风险权重发挥作用的地方。

## 新实体类型

### ConcentrationCategory

OCC/FDIC 指南定义的监管范围。银行必须监控每个类别的风险敞口。

|属性 |类型 |笔记|
|---|---|---|
| `categoryId` |字符串|标识符（例如“CRE”、“C&I”、“消费者”）|
| `name` |字符串|显示名称 |
| `description` |字符串|什么属于这一类 |
| `occGuidance` |字符串|相关 OCC/FDIC 指导参考 |

示例类别：**CRE**（商业房地产）、**C&I**（商业和工业）、**消费者**、**农业**。

### LoanType

符合巴塞尔 III 资本要求的特定贷款产品。

|属性 |类型 |笔记|
|---|---|---|
| `loanTypeCode` |字符串|标识符（例如“residential_mortgage”）|
| `name` |字符串|显示名称 |
| `baselRiskWeight` |小数 (%) |巴塞尔协议III标准化风险权重|
| `regulatoryTreatment` |字符串|监管机构如何对该产品进行分类？
| `capitalTier` |字符串|资本待遇等级|
| `description` |字符串|产品描述 |

关键示例：

|贷款类型 |巴塞尔风险权重|
|---|---|
|住宅按揭| 35% |
|汽车贷款| 75% |
| SBA 贷款 | 0%（政府担保）|
|建筑贷款| 150% |
|商业地产抵押贷款 | 100% |

### 抵押品类型

担保贷款并具有回收预期的资产类别。

|属性 |类型 |笔记|
|---|---|---|
| `collateralTypeCode` |字符串|标识符 |
| `name` |字符串|显示名称 |
| `recoveryExpectation` |字符串|预期恢复率（例如“高”、“中”、“低”）|
| `description` |字符串|资产类别说明|

## 新关系

- **loanClassifiedAs**：`LoanType` → `ConcentrationCategory` (`many-to-one`) — 每个贷款类型映射到一个集中存储桶
- **collaborativeClassifiedAs**：`CollateralType` → `ConcentrationCategory` (`many-to-one`) - 抵押品类型也映射到集中存储桶
- **典型的SecuredBy**：`CollateralType` → `LoanType` (`many-to-many`) - 通常链接哪些抵押品类型哪些贷款类型

## 设计模式：中心实体

**ConcentrationCategory** 是一个 *中心实体* — 它将贷款分类子图连接到模型的其余部分。 LoanType 和 Collat​​eralType 都指向它，为监管分析创建共享参考点。

在步骤 4 中，RegulatoryLimit 还将连接到 ConcentrationCategory，使其成为合规性查询的中心节点。

## 巴塞尔协议 III 风险权重：为什么重要

巴塞尔协议 III 分配风险权重，确定银行必须针对每种贷款类型持有多少资本。住宅抵押贷款的风险权重为 35%，意味着银行每贷出一美元所需的资本较少，而建筑贷款的风险权重为 150%，意味着需要更多的资本。

这直接影响：

- **盈利能力**：较低的风险权重 = 较少的资本占用 = 较高的股本回报率
- **投资组合策略**：银行根据风险权重优化其贷款组合
- **监管合规性**：超过风险加权资产限额将触发监管操作

## 步骤 3 图表（与步骤 2 不同）

<ontology-embed id="official/fibo-risk-step-3" diff="official/fibo-risk-step-2" height="440px"></ontology-embed>

*三个新实体构成贷款分类集群。 ConcentrationCategory 是连接贷款类型和抵押品类型的枢纽。*

```quiz
Q:为什么建筑贷款的巴塞尔风险权重为 150%，而 SBA 贷款的风险权重为 0%？
- 建筑贷款需要更长的时间来处理
- SBA 贷款由政府担保，因此银行不承担信用风险，而建筑贷款具有较高的违约和完成风险 [correct]
- 建筑公司利润较低
- SBA 代表安全银行资产
> 巴塞尔 III 风险权重反映了所承担的信用风险由银行。 SBA（小企业管理局）贷款由美国政府支持，因此银行信用风险为零。建设贷款面临完工风险、市场风险和高违约率，要求银行持有150%的风险加权资本。
```
