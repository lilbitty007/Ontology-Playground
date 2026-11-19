---
title: "Complete Care Model"
slug: complete-care
description: "Add Prescription to complete the healthcare ontology — connecting diagnoses to treatments and closing the care cycle."
order: 4
embed: official/healthcare-step-3
---

## 治疗链

医疗保健难题的最后一块是**处方**——对诊断的治疗反应。这样就结束了护理周期：预约→诊断→治疗。

## 处方实体

|属性 |类型 |标识符？ |
|---|---|---|
| `rxNumber` |字符串| ✓ |
| `medication` |字符串| |
| `dosage` |字符串| |
| `frequency` |字符串| |
| `refillsRemaining` |整数 | |

标识符是 `rxNumber`（处方号）——药房标准标识符。 `refillsRemaining` 整数可实现补充跟踪和药物依从性监控。

## 新关系

- **treatment_by** — `Diagnosis` → `Prescription`（一对多）
一个诊断可能会导致多个处方（例如，针对同一病症的多种药物）。

- **开处方** — `Provider` → `Prescription`（一对多）
提供者为其患者开处方。

> **护理链：** 完整的路径现在是 `Patient → Diagnosis → Prescription`，每个阶段都有 `Provider` 连接（看预约、诊断、开处方）。这反映了真实的临床工作流程。

## 完整图

<ontology-embed id="official/healthcare-step-3" diff="official/healthcare-step-2" height="500px"></ontology-embed>

*完整的医疗保健本体：5 个实体，6 个关系。护理链从患者到诊断再到处方。*

## 完整模型能够实现什么

|问题 |图形路径|
|---|---|
|哪些患者需要处方补充？ |患者→诊断→处方（补充剩余=0）|
|哪些提供者开出的药物最多？ |提供者 → 处方（计数）|
|哪些严重的诊断尚未得到治疗？ |没有 → 处方 | 诊断（严重程度=严重）
|哪些专家诊断他们也开出处方的病症？ |提供者 → 诊断和提供者 → 处方 |

## GQL查询示例

查找处方即将用完的重症患者：

```gql
MATCH (p:Patient)-[:diagnosed_with]->(d:Diagnosis)-[:treated_by]->(rx:Prescription)
WHERE d.severity = 'severe' AND rx.refillsRemaining <= 1
RETURN p.patientId, d.description, rx.medication, rx.refillsRemaining
```

## 我们构建了什么

|步骤|添加实体 |累计|关键概念|
|---|---|---|---|
| 1 |患者、提供者、预约 | 3 |共享实体、调度|
| 2 |诊断 | 4 |标准化代码，双连接|
| 3 |处方| 5 |护理链、治疗追踪|

## 要点

1. **共享实体**（预约、诊断）连接多个参与者
2. **标准化代码**（ICD、Rx）实现跨系统互操作性
3. **护理链**（患者 → 诊断 → 处方）建立临床工作流程模型
4. **提供者在每个阶段进行连接** — 反映医疗保健服务中的核心作用
5. **整数属性**（剩余补充量、持续时间）支持操作查询

```quiz
Q:提供商实体如何跨完整的医疗保健本体进行连接？
- 提供者仅连接到预约
- 提供者连接到预约、诊断和处方 - 反映他们在护理每个阶段的角色 [correct]
- 提供者直接连接到患者
- 提供者仅连接到处方
> 提供者是此本体中连接最紧密的实体 - 他们查看预约、做出诊断和开处方。这反映了现实世界的工作流程，医疗保健提供者参与护理提供链的每个阶段。
```

您已完成医疗保健系统学习路径！从[目录](#/catalogue) 加载任何步骤以交互方式探索它。
