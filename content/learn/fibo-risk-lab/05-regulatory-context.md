---
title: "Step 4: Regulatory Context"
slug: regulatory-context
description: Complete the model with banking regulations, concentration limits, and cross-domain connections.
order: 5
embed: official/fibo-risk-step-4
reviewStatus: under-human-review
---

## 闭环

前三个步骤构建了参考数据：行业、地理和贷款分类。在最后一步中，我们添加了**监管执行层**——限制投资组合集中度的法规和数量限制。

这就是本体在操作上变得强大的地方：您现在可以从特定贷款到其集中度类别再到适用的监管限制，并了解哪些法规强制执行每个限制。

## 新实体类型

### 法规

银行机构发布的监管框架。

|属性 |类型 |笔记|
|---|---|---|
| `regulationCode` |字符串|标识符（例如“OCC_CRE_2006”）|
| `name` |字符串|法规名称 |
| `issuingAuthority` |字符串|由谁签发（OCC、FDIC、巴塞尔委员会）|
| `effectiveDate` |日期 |什么时候生效 |
| `scope` |字符串|它涵盖什么 |
| `description` |字符串|完整描述 |

### RegulatoryLimit

法规中的特定定量阈值。

|属性 |类型 |笔记|
|---|---|---|
| `limitId` |字符串|标识符 |
| `limitName` |字符串|显示名称 |
| `category` |字符串|它限制什么维度？
| `thresholdPct` |小数 (%) |极限值|
| `severity` |字符串|违规后果（例如“警告”、“需要采取行动”、“监督干预”）|
| `description` |字符串|这个限制意味着什么 |

关键示例：

|限制|门槛|监管 |
|---|---|---|
| CRE浓度| 300% 资本 | OCC 指南 2006-46 |
|气候+飓风|投资组合的 15% |内部风险政策|
|地理集中度|投资组合的 20% | OCC 公告 2011 年 12 月 |
|产业集中度|投资组合的 25% | FDIC 风险管理 |

## 新关系

- **强制执行者**：`RegulatoryLimit` → `Regulation` (`many-to-one`) — 每个限制均由特定法规强制执行
- **limitAppliesToCategory**: `RegulatoryLimit` → `ConcentrationCategory` (`many-to-one`) — 将限制链接到它们所约束的集中度类别

## 设计模式：跨域桥

With `limitAppliesToCategory`，监管层通过ConcentrationCategory连接贷款分类层。这样就完成了一个**跨域查询路径**：

```
Jurisdiction (hurricaneZone=true)
  → [geographic dimension]
    → ConcentrationCategory
      → [regulatory dimension]
        → RegulatoryLimit (thresholdPct)
          → Regulation (issuingAuthority)
```

而从行业角度来说：

```
IndustryGroup (climateSensitivity="high")
  → [industry dimension]
    → Subsector → Sector
```

## 完整模型

最终本体具有跨四个域的 **11 种实体类型**和 **10 种关系**：

|领域 |实体|关系 |
|---|---|---|
|工业|部门、分部门、行业组|部分扇区，属于子扇区 |
|地理 |地区、国家、司法管辖区 |在国家/地区、在地区 |
|贷款分类|集中度类别、贷款类型、抵押品类型 |贷款分类为，抵押品分类为，通常为担保人 |
|监管 |监管、监管限制|强制执行者、限制适用于类别 |

## 步骤 4 图表（与步骤 3 不同）

<ontology-embed id="official/fibo-risk-step-4" diff="official/fibo-risk-step-3" height="480px"></ontology-embed>

*两个新实体（Regulation 和 RegulatoryLimit）完善了模型。 limitAppliesToCategory 关系将监管执行与贷款分类联系起来。*

## 完整的外部参考本体

您还可以在外部目录中单独探索每个域：

- [FIBO Industry分类](/#/catalogue/external/fibo/行业分类)
- [FIBO 地理层次结构](/#/catalogue/external/fibo/geographic-hierarchy)
- [FIBO 贷款分类](/#/catalogue/external/fibo/loan-classification)
- [FIBO 监管环境](/#/catalogue/external/fibo/regulatory-context)

## 您构建的内容

您现在拥有一个全面的受 FIBO 启发的风险管理本体，它能够：

- **行业集中度分析** — 按行业、子行业和行业组汇总风险暴露
- **地理风险评估** — 按灾区标志筛选并与投资组合数据交叉引用
- **巴塞尔 III 资本计算** — 对贷款类型应用标准化风险权重
- **监管合规性监控** - 根据强制限制检查投资组合集中度

该模型支持跨域风险查询，这种查询在传统数据仓库中需要复杂的多表 JOIN，但可以在本体驱动系统中表示为简单的图形遍历。

## 许可

本实验中引用的所有 FIBO 本体内容为：

- **版权** (c) 2016-2025 EDM Council, Inc. 和 Object Management Group, Inc.
- **根据 [MIT 许可证](https://opensource.org/licenses/MIT)
获得许可**
```quiz
Q:ConcentrationCategory 在完整模型中扮演什么角色？
- 它存储地理坐标
- 它充当跨域连接贷款分类、抵押品类型和监管限制的枢纽实体 [correct]
- 它定义每笔贷款的巴塞尔风险权重
- 它取代用于合规性跟踪的监管实体
> ConcentrationCategory 是桥接贷款分类的中央枢纽域到监管域。 LoanType和Collat​​erType都属于它，RegulatoryLimit对其进行约束。这使其成为跨域集中风险查询的关键节点。
```
