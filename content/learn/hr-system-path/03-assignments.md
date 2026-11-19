---
title: "Assignments"
slug: assignments
description: "Add Assignment as a junction entity to model staffing history across employees, departments, and positions."
order: 3
---

## 人员配置历史记录问题

员工可以随着时间的推移在部门或职位之间流动。一个部门可以容纳许多员工。随着时间的推移，一个职位可以由不同的人填补。

这不是一个简单的一对一结构。

## 作为联结实体的分配

创建用于连接的**分配**：

- `Employee` -> `Assignment`（一对多）
- `Assignment` -> `Department`（多对一）
- `Assignment` -> `Position`（多对一）

赋值保存关系的上下文。

### 赋值属性

|属性 |类型 |标识符？ |
|---|---|---|
| `assignmentId` |字符串| ✓ |
| `startDate` |日期 | |
| `endDate` |日期 | |
| `isPrimary` |布尔 | |

使用 `startDate` 和 `endDate`，您可以回答以下历史问题：

-“第二季度谁在财务部门？”
- “今年哪些员工换了部门？”

## 实际设计模式

这与许多领域中使用的通用模式相同：

- 通过注册的学生课程
- 通过订单行项目的客户产品
- 通过分配的员工部门职位

当关系需要自己的属性时，使用联结实体。

```quiz
Q:Assignment 应该有自己的实体，主要原因是什么？
- 它改进了图表中的图标选择
- 它携带特定于关系的属性，例如 startDate 和 endDate [correct]
- 它消除了对标识符的需要
- 它防止多对一关系
> 分配存储随时间推移的人员配置上下文。这些属性属于关系，而不是仅属于员工、部门或职位。
```

接下来，我们添加绩效评估以完成 HR 分析模型。
