---
title: "Complete Factory Model"
slug: complete-factory
description: "Add Quality-Check to complete the manufacturing ontology — closing the loop from production to inspection."
order: 4
embed: official/manufacturing-step-3
---

## 关闭质量循环

零件生产出来后，制造并没有结束——必须对其进行检查。 **质量检查** 通过验证零件是否符合规格来结束生产周期。

## 质量检查实体

|属性 |类型 |标识符？ |
|---|---|---|
| `checkId` |字符串| ✓ |
| `inspector` |字符串| |
| `checkDate` |日期 | |
| `passed` |布尔 | |
| `defectCode` |字符串| |

`passed` 布尔值是关键属性 — 它决定零件是否发货或返工。 `defectCode` 属性对故障进行分类以进行根本原因分析。

## 新关系

- **检查** — `Quality-Check` → `Part`（多对一）
每次质量检查都会检查特定零件。一个零件可能会经过多次检查（初次检查、返工后的重新检查）。

> **反馈循环：** 当质量检查失败时，生产链反转：`Quality-Check (passed=false) → Part → Work-Order → Machine`。这种反馈循环是智能工厂识别有问题的机器并随着时间的推移提高生产质量的方式。

## 完整图

<ontology-embed id="official/manufacturing-step-3" diff="official/manufacturing-step-2" height="500px"></ontology-embed>

*完整的智能制造本体：5个实体，5个关系。质量检查关闭了从检验到生产的反馈回路。*

## 完整模型能够实现什么

|问题 |图形路径|
|---|---|
|哪些机器生产的零件未通过检查？ |机器 → 零件 ← 质量检查（通过=假）|
|当生产出有缺陷的零件时，哪些传感器出现异常？ |传感器 → 机器 → 零件 ← 质量检查（通过=假）|
|按工单优先级划分的缺陷率是多少？ |工作订单（优先级）→ 零件 ← 质量检查 |
|哪些部位需要复检？ |部分 ← 质量检查（通过=假，计数 > 1） |

## GQL 查询示例

将传感器异常与质量故障关联起来：

```gql
MATCH (s:Sensor)-[:monitors]->(m:Machine)-[:has_part]->(p:Part)<-[:inspects]-(qc:QualityCheck)
WHERE s.lastReading > s.threshold AND qc.passed = false
RETURN m.name, s.type, s.lastReading, p.name, qc.defectCode
```

## 我们构建了什么

|步骤|添加实体 |累计|关键概念|
|---|---|---|---|
| 1 |机器、传感器| 2 |物联网层次结构、遥测 |
| 2 |工作订单，零件 | 4 |生产链，公差|
| 3 |质量检查 | 5 |反馈回路、检查|

## 要点

1. **物联网层次结构** 在机器下组织传感器以进行遥测聚合
2. **生产链** 通过调度实体将设备连接到输出
3. **质量反馈循环** 支持跨区域的根本原因分析生产链
4. **基于阈值的警报** 增强预测性维护
5. **布尔属性**（已通过）在工作流程中创建清晰的决策点

```quiz
Q:质量检查如何在制造本体中创建反馈循环？
- 它直接连接到机器
- 失败的检查通过零件 → 工作订单 → 机器追溯到，识别缺陷来源 [correct]
- 它循环回传感器实体
- 质量检查不会创建反馈循环
> 当质量检查失败时，路径质量检查 → 零件 →工作订单 → 机器将缺陷追溯到其来源。这种反馈循环是智能制造持续改进的基础——识别哪些机器、工作订单或条件生产有缺陷的零件。
```

您已完成智能制造学习路径！从[目录](#/catalogue) 加载任何步骤以交互方式探索它。
