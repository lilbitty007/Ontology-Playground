---
title: "Diagnoses"
slug: diagnoses
description: "Add Diagnosis to track medical conditions — connecting patients to their clinical findings and providers to their assessments."
order: 3
embed: official/healthcare-step-2
---

## 记录临床发现

预约产生临床发现 - 患者有什么病症？ **诊断**实体通过标准化编码捕获这些发现。

添加诊断启用：
-“哪些患者已被诊断患有糖尿病？”
- “上季度哪家提供商发现了最严重的情况？”
- “按科室划分最常见的诊断是什么？”

## 诊断实体

|属性 |类型 |标识符？ |
|---|---|---|
| `diagnosisId` |字符串| ✓ |
| `icdCode` |字符串| |
| `description` |字符串| |
| `severity` |字符串| |
| `diagnosedDate` |日期 | |

`icdCode` 属性拥有标准化 ICD（国际疾病分类）代码 — 一种全球认可的编码系统。这使得本体可以与保险、计费和研究系统互操作。

## 新关系

- **diagnosed_with** — `Patient` → `Diagnosis`（一对多）
患者在其病史中可以有多个诊断。

- **诊断** — `Provider` → `Diagnosis`（一对多）
提供者根据其临床评估记录诊断。

> **双重作者身份：** 诊断连接到患者（患有该病症的人）和提供者（识别该病症的人）。这种双重连接支持以患者为中心的视图（“我的所有情况”）和以提供者为中心的视图（“我确定的所有情况”）。

## 增长图

<ontology-embed id="official/healthcare-step-2" diff="official/healthcare-step-1" height="400px"></ontology-embed>

*诊断将图表与患者和提供者连接起来。差异突出显示了新内容。*

## 我们学到了什么

- **标准化代码** (ICD) 使本体可与外部系统互操作
- **双连接实体**（患者 → 诊断 ← 提供者）捕获两个视角
- **严重性属性**支持风险分层和临床优先级
- 该图现在支持计划查询（通过预约）和临床查询（通过诊断）

```quiz
Q:为什么 ICD 代码属性对于诊断实体很重要？
- 它使诊断标识符更短
- 它提供了一个全球标准化的编码系统，可实现与保险、计费和研究系统的互操作性[correct]
- 所有本体格式都需要 ICD 代码
- 它可以防止记录重复的诊断
> ICD（国际疾病分类）代码是通用的医疗状况分类标准。将它们包含在本体中可以实现互操作性——相同的代码意味着电子病历、保险索赔、临床试验和公共卫生系统中的相同条件。
```

接下来，我们将添加处方来完成治疗链。
