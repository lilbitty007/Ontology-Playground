---
title: "Step 1: Industry Classification"
slug: industry-classification
description: Model the economic hierarchy — Sector, Subsector, and IndustryGroup with climate and cyclicality attributes.
order: 2
embed: official/fibo-risk-step-1
reviewStatus: under-human-review
---

## 为什么要进行行业分类？

银行需要了解其在各个经济部门的风险敞口。如果投资组合中 40% 的贷款发放给了建筑公司，那么房地产市场低迷可能会造成毁灭性的后果。 **NAICS**（北美行业分类系统）提供了 FIBO 所依据的标准分类法。

在此步骤中，我们对三级层次结构进行建模：部门 → 子部门 → 行业组，并富含风险相关属性。

## 实体类型

### 部门

最广泛的分类 - 想想“制造”、“金融”、“医疗保健”。

|属性 |类型 |笔记|
|---|---|---|
| `sectorCode` |字符串|标识符（例如“31-33”）|
| `sectorName` |字符串|显示名称 |
| `description` |字符串|该部门涵盖哪些内容 |

### 子部门

部门内的细分 — “制造”内的“食品制造”。

|属性 |类型 |笔记|
|---|---|---|
| `subsectorCode` |字符串|标识符（例如“311”）|
| `subsectorName` |字符串|显示名称 |

### IndustryGroup

最精细的级别，具有对投资组合分析至关重要的风险属性。

|属性 |类型 |笔记|
|---|---|---|
| `naicsCode` |字符串|标识符 — 官方 NAICS 代码 |
| `name` |字符串|行业名称 |
| `cyclicality` |字符串|对经济周期有多敏感（例如“高”、“低”、“反周期”）|
| `climateSensitivity` |字符串|暴露于气候事件（例如“高”、“中”、“低”）|
| `essentialServices` |布尔 |该行业是否提供基本服务（更具弹性）|
| `description` |字符串|行业描述|

## 关系

- **partOfSector**: `Subsector` → `Sector` (`many-to-one`) — 每个子扇区都属于一个扇区
- **belongsToSubsector**：`IndustryGroup` → `Subsector` (`many-to-one`) — 每个行业组都属于一个子行业

这将创建一个严格的层次结构： `Sector` ← `Subsector` ← `IndustryGroup`

## 设计模式：分类层次结构

这是最常见的本体模式之一 - **严格的树层次结构**，其中每个子元素只有一个父元素。它支持：

- **汇总汇总**：对子行业内的行业组的所有贷款进行求和以获得子行业风险
- **向下钻取分析**：从行业级别开始，深入到子行业，然后深入到特定的行业组
- **风险属性继承**：如果一个行业是“周期性”，其所有子项都会继承该风险上下文

## 步骤 1 图

<ontology-embed id="official/fibo-risk-step-1" height="340px"></ontology-embed>

*三个实体形成分类树——行业集中度分析的基础模式。*

```quiz
Q:为什么 IndustryGroup 包含气候敏感度属性？
- 跟踪行业的碳排放
- 启用投资组合风险查询，根据飓风或野火等气候事件的风险来筛选行业 [correct]
- 遵守 ESG 报告要求
- 计算贷款的保险费
> 气候敏感度属性可让风险分析师识别哪些部分贷款组合面临气候相关事件的影响。与地理数据（下一步）相结合，这可以实现强大的跨域集中查询。
```
