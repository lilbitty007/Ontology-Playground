---
title: "Complete HR Model"
slug: complete-model
description: "Add PerformanceReview and apply the full HR ontology to real workforce analytics questions."
order: 4
embed: community/ravi-chandu/hr-system
---

## 完成人员分析层

最终实体是 **PerformanceReview**。它将评估结果与审核周期内的员工联系起来。

关系：

- `Employee` -> `PerformanceReview`（一对多）

### PerformanceReview 属性

|属性 |类型 |标识符？ |
|---|---|---|
| `reviewId` |字符串| ✓ |
| `reviewPeriod` |字符串| |
| `rating` |枚举 | |
| `reviewDate` |日期 | |

现在，本体在一张图中支持运营和战略人力资源问题。

## 完整图

<ontology-embed id="community/ravi-chandu/hr-system" height="460px"></ontology-embed>

*HR 系统本体为 5实体：员工、部门、职位、分配、绩效审核。*

## 图形问题示例

|问题 |图形路径|
|---|---|
|哪些部门拥有最高级别的员工？ |部门 <- 分配 <- 员工 (`jobLevel=senior`) |
|去年有哪些员工更换了角色？ |员工 -> 分配（按日期多个记录） -> 职位 |
|哪些团队有很多优秀的评价？ |部门 <- 作业 <- 员工 -> 绩效审核 (`rating=outstanding`) |
|哪些任务不再有效？ |分配（`endDate` 设置或 `isPrimary=false`）|

## 要点

1. 将**人员**、**组织单位**和**角色**分成不同的实体。
2. 使用**分配**作为时间感知人员配备历史记录的连接实体。
3. 使用 **PerformanceReview** 将可衡量的结果附加到劳动力实体。
4. 保持标识符稳定并通过枚举值控制状态。

```quiz
Q:哪个实体能够对角色和部门随时间变化的历史分析？
- 员工
- 部门
- 分配 [correct]
- 绩效审核
> 分配记录特定员工-部门-职位链接的开始和结束日期。没有它，您就无法清楚地跟踪人员配置历史记录。
```

您已完成 HR 系统路径。在 [catalogue](#/catalogue/community/ravi-chandu/hr-system) 中打开模型，或在 [designer](#/designer/community/ravi-chandu/hr-system) 中继续迭代。
