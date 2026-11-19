---
title: "Scenario Overview"
slug: scenario-overview
description: "Meet the Healthcare System — a patient care platform that needs an ontology to connect patients, providers, diagnoses, and treatments."
order: 1
---

## 场景

您正在为 **医疗保健管理系统** 设计数据模型。医院网络跟踪：

- **患者**，提供医疗记录、血型和过敏信息
- **提供者**（医生、专家），拥有执照和部门关系
- **预约** 安排患者就诊与特定提供者
- **诊断**记录医疗情况具有 ICD 代码和严重级别的疾病
- **处方** 跟踪药物订单、剂量和补充

数据分布在电子健康记录 (EHR)、调度系统、药房数据库和计费平台中。

## 为什么是本体？

像**“哪些被心脏病学提供者诊断为严重疾病的患者仍然拥有零续配的处方？”这样的临床问题会涉及患者记录、诊断历史、提供者专业和药房数据。

通过本体，这映射到：`Patient → Diagnosis (severity=severe) ← Provider (specialty=Cardiology)` 和 `Diagnosis → Prescription (refillsRemaining=0)`。

## 我们将构建什么

|步骤|实体|你将学到什么 |
|---|---|---|
| 1 |患者、提供者、预约 |核心临床实体、调度关系|
| 2 | + 诊断 |医疗状况、多源关系 |
| 3 | + 处方 |治疗链，完成护理周期|

到最后，您将拥有一个包含 5 个实体、6 个关系的本体，涵盖从预约到治疗的完整患者护理旅程。

## 关键概念

- **临床工作流程** — 预约安排、诊断、治疗
- **共享关系** — 患者和提供者都连接到预约
- **护理链** — 患者 → 诊断 →处方
- **标准化标识符** — MRN（医疗记录号）、ICD 代码、Rx 号

让我们从护理服务基础开始。
