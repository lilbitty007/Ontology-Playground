---
title: "Scenario Overview"
slug: scenario-overview
description: "Understand the real-world challenge of supply chain resilience — when a single supplier disruption cascades into millions in lost revenue."
order: 1
---

## 挑战

您的制造运营取决于复杂的供应商网络。自然灾害、地缘政治事件、质量问题或网络攻击等一种中断不仅仅影响到某一家供应商。它会影响到：

- **依赖于该供应商的组件**
- **使用这些组件的产品线**
- **产品无法发货时的收入**
- **生产时间表**逐周下滑

在无法看到这些级联的情况下，您会在损坏完成后做出反应。有了它，您**可以在客户受到影响之前进行预测并采取行动**。

## 真实示例

台湾一家半导体供应商遭遇持续 48 小时的停电：

```
Disruption: Taiwan Supplier Outage
  ↓
Affects: ChipX component supply
  ↓
Impacts: 3 product lines (laptops, tablets, displays)
  ↓
Cascades: Production halts in 2 weeks (inventory runs out)
  ↓
Result: $12M revenue at risk, customer orders delayed
  ↓
Mitigation: Activate pre-qualified alternative supplier + safety stock
```

**如果没有本体**，此分析需要数天时间和手动电子表格。
**借助本体**，AI 代理可以：
1. 在几分钟内识别所有受影响的组件
2. 追踪所有产品线和生产时间表
3. 推荐替代供应商和安全库存数量
4. 计算每个缓解措施的成本效益
5. 触发自动警报和采购工作流程

## 您将构建什么

通过四个步骤，我们将构建一个支持这种智能的生产级本体：

|步骤|焦点|结果|
|---|---|---|
| 1 |核心实体（供应商、组件、产品线、中断）|您的供应链词汇|
| 2 |实体属性和标识符 |丰富的风险计算属性 |
| 3 |关系和级联建模|影响传播图 |
| 4 |风险评估和缓解行动|决策自动化|

到最后，您将拥有一个包含 7 个实体的本体：
- **40 个属性**，捕获可靠性分数、库存水平、成本、时间表
- **7 个关系** 对中断级联进行建模
- **Fabric IQ 兼容性**，用于数据代理接地和实时警报

## 关键概念

- **中断事件** — 触发器（自然灾害、网络攻击、财务失败）
- **影响传播** — 中断如何通过依赖关系级联
- **风险评估** — 计算风险收入和产生影响的时间
- **缓解措施** — 减少或消除影响的具体步骤
- **替代供应商** — 通过容量和成本权衡进行预审备份

让我们首先了解使弹性决策成为可能的核心实体和关系。
