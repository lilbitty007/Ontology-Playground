---
title: "Scenario Overview"
slug: scenario-overview
description: "Meet the University System — an academic institution that needs an ontology to connect students, courses, faculty, and departments."
order: 1
---

## 场景

您正在为**大学管理系统**设计数据模型。该机构跟踪：

- **学生**及其注册状况、GPA 和学术地位
- **课程** 包含学分、级别和先决条件
- **注册**记录学生选修哪些课程及其成绩
- **教授**教授课程及其等级、任期状态和办公时间
- **部门** 组织学术课程和为教师提供住宿

数据存在于学生信息系统 (SIS)、学习管理系统 (LMS)、人力资源和学术规划数据库中。

## 为什么是本体？

像**“哪些院系的教授教授的课程超过 50% 的注册学生得分低于 C？”** 的学术问题涉及院系记录、教师作业、课程设置和学生成绩。

通过本体，这映射到：`Department → Professor → Course → Enrollment (grade < C) ← Student`。

## 我们将构建什么

|步骤|实体|你将学到什么 |
|---|---|---|
| 1 |学生、课程、入学 |学术记录，通过联结实体进行多对多|
| 2 | + 教授 |教师作业、教学关系 |
| 3 | + 部门 |组织结构、层级|

到最后，您将拥有一个涵盖完整学术管理模型的 5 个实体、6 个关系本体。

## 关键概念

- **连接实体** — 注册解决学生与课程的多对多关系
- **学术层次结构** — 院系组织教授和课程
- **成绩跟踪** — 字母成绩和 GPA 作为本体属性
- **时间数据** — 学期、入学日期、学年

让我们从学术核心开始。
