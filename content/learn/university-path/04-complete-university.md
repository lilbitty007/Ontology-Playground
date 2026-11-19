---
title: "Complete University Model"
slug: complete-university
description: "Add Department to complete the university ontology — organizing faculty, courses, and students into academic programs."
order: 4
embed: official/university-step-3
---

## 组织结构

大学分为 **系** — 容纳教员、提供课程和授予学位的行政单位。添加部门会创建将所有内容联系在一起的组织层次结构。

## 部门实体

|属性 |类型 |标识符？ |
|---|---|---|
| `departmentId` |字符串| ✓ |
| `name` |字符串| |
| `building` |字符串| |
| `budget` |浮动| |
| `headOfDept` |字符串| |

`budget` 浮点启用资源分配查询。 `headOfDept` 属性引用了领导该系的教授 - 这是组织层次结构中常见的自我引用模式。

## 新关系

- **属于** — `Professor` → `Department`（多对一）
教授隶属于某个系。

- **提供** — `Department` → `Course`（一对多）
部门提供课程作为其学术课程的一部分。

> **组织层次结构：** 系位于大学本体的顶部。它向下连接到教授（教师）和课程（课程）。这一中心位置使 Department 成为聚合查询的理想选择：“部门级统计”。

## 完整图

<ontology-embed id="official/university-step-3" diff="official/university-step-2" height="500px"></ontology-embed>

*完整的大学本体：5个实体，6个关系。系组织师资和课程。*

## 完整模型能够实现什么

|问题 |图形路径|
|---|---|
|哪些院系的学生平均 GPA 最高？ |部门→课程←入学←学生（平均GPA）|
|哪些教授在本系课程之外教授课程？ |教授→系与教授→课程→系|
|各院系的录取率是多少？ |部门 → 课程 ← 注册人数（数）/Course.maxEnrollment |
|哪些院系拥有最多终身教授？ |系 ← 教授 (tenured=true, count) |

## GQL 查询示例

查找学生成绩不佳的院系（平均成绩低于 B）：

```gql
MATCH (d:Department)-[:offers]->(c:Course)<-[:for_course]-(e:Enrollment)<-[:enrolls_in]-(s:Student)
WHERE e.grade IN ['C', 'D', 'F']
RETURN d.name, c.title, COUNT(e) AS struggling_count
ORDER BY struggling_count DESC
```

## 我们构建了什么

|步骤|添加实体 |累计|关键概念|
|---|---|---|---|
| 1 |学生、课程、入学 | 3 |连接实体，多对多|
| 2 |教授 | 4 |传递查询、布尔属性 |
| 3 |部门| 5 |组织层次结构、中心实体 |

## 要点

1. **连接实体**（注册）解析与属性的多对多关系
2. **传递查询** 通过遍历多跳路径
3. **布尔属性**（tenured）启用分类过滤
4. **组织层次结构**（部门）提供聚合分组
5. **中心实体**（部门）连接本体的多个分支

```quiz
Q:为什么院系被视为大学本体中的“枢纽实体”？
- 因为它具有最多的属性
- 因为它连接到教授和课程，位于组织层次结构的顶部[correct]
- 因为它是最后添加的
- 因为中心实体必须具有预算属性
> 部门向下连接到教授（通过 own_to）和课程（通过优惠）。这种双重连接使其成为组织中心 - 非常适合在部门级别结合教师和课程数据的聚合查询。
```

您已完成大学系统学习路径！从[目录](#/catalogue) 加载任何步骤以交互方式探索它。
