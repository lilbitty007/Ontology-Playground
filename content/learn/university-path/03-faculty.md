---
title: "Faculty"
slug: faculty
description: "Add Professor to track who teaches what — connecting faculty to courses and students through teaching assignments."
order: 3
embed: official/university-step-2
---

## 添加教师

课程由谁教授？ **教授**实体增加了教学维度——将教师与课程连接起来，并间接地与学生连接起来。

添加教授启用：
- “哪位教授教授的 400 级课程最多？”
- “史密斯教授课程的平均 GPA 是多少？”
- “哪些终身教授教授入门课程？”

## 教授实体

|属性 |类型 |标识符？ |
|---|---|---|
| `professorId` |字符串| ✓ |
| `name` |字符串| |
| `rank` |字符串| |
| `tenured` |布尔 | |
| `officeHours` |字符串| |

`rank` 属性（助理、助理、全职）反映了学术层次结构。 `tenured` 布尔值支持有关工作保障和机构投资的查询。

## 新关系

- **教学** — `Professor` → `Course`（一对多）
教授每学期教授一门或多门课程。

- **建议** — `Professor` → `Student`（一对多）
教授为学生的学术课程提供建议。

> **传递查询：** 对于教授 → 课程 ← 注册 ← 学生，您现在可以提出跨越教学关系的问题：“哪些学生正在学习终身教授的课程？”这就需要遍历Professor→Course→Enrollment→Student。

## 增长图

<ontology-embed id="official/university-step-2" diff="official/university-step-1" height="400px"></ontology-embed>

*教授加入教学和建议关系。差异突出显示了新内容。*

## 我们学到了什么

- **布尔属性**（终身）为过滤创建是/否分类
- **传递查询** 遍历多个关系以连接远程实体
- **学术排名**遵循定义的层次结构（助理 → 助理 → 完整）
- 该图现在支持以学生为中心和以教师为中心的查询

```quiz
Q:跨大学本体的传递查询是什么样的？
- 查询单个实体的属性
- 遍历教授 → 课程 → 注册 → 学生等多种关系以连接远程实体[correct]
- 通过 ID 查找教授
- 计算系统中课程的数量
> 传递查询是基于图的最大优势之一本体论。通过遍历教授→课程→招生→学生，可以回答“终身教授班有哪些学生？”之类的问题。 — 连接没有直接关系但通过中间节点链接的实体。
```

接下来，我们将添加部门来组织学术结构。
