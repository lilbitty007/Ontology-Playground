---
title: "Risk Propagation Model"
slug: risk-propagation-model
description: "Understand how disruptions cascade — the 7 relationships that model supplier impact → component risk → product exposure → mitigation action."
order: 3
---

## 级联：7 个关系

本体的力量在于其关系 - 它们编码影响如何流经供应链。数据代理遵循这些路径来回答诸如“有多少产品线面临该供应商故障的影响？”之类的问题。

### 1. **供应商供应组件**（一对多）

```
Supplier "ChipX Corp" 
  supplies→ Component "GPU Module"
         → Component "Memory Board"
         → Component "Power Supply"
```

- **为什么重要**：中断一个供应商会影响其所有依赖组件
- **查询示例**：“显示台湾供应商的所有组件”

### 2. **ProductLine 中使用的组件**（多对多）

```
Component "GPU Module"
  usedIn→ ProductLine "Gaming Laptop 2024"
       → ProductLine "Workstation Pro"
       → ProductLine "Tablet Plus"
```

- **为什么重要**：单个组件故障可能会停止多个产品线
- **查询示例**：“有多少产品线依赖于该组件？”

### 3. **DisruptionEvent 影响供应商**（多对多）

```
DisruptionEvent "Taiwan Power Outage 2024-05-01"
  affects→ Supplier "ChipX Corp"
        → Supplier "Memory Inc"
```

- **为什么重要**：一场灾难可以同时袭击多个供应商
- **查询示例**：“哪些供应商位于洪水区？”

### 4. **DisruptionEvent 触发 RiskAssessment**（一对多）

```
DisruptionEvent "Taiwan Power Outage"
  triggers→ RiskAssessment "Gaming Laptop - Impact Analysis"
         → RiskAssessment "Workstation - Impact Analysis"
```

- **为什么重要**：每次中断都会触发受影响产品线的详细影响分析
- **查询示例**：“这次中断带来的风险总收入是多少？”

### 5. **风险评估建议采取缓解措施**（一对多）

```
RiskAssessment "Gaming Laptop - Impact Analysis"
  recommends→ MitigationAction "Activate Alt Supplier X"
           → MitigationAction "Increase Safety Stock"
           → MitigationAction "Redesign Component"
```

- **为什么重要**：每次影响分析都会生成一个按优先顺序排列的操作列表
- **查询示例**：“最大限度地减少中断影响的最佳操作是什么？”

### 6. **MitigationAction 激活 AlternativeSupplier**（多对多）

```
MitigationAction "Activate Alt Supplier X"
  activates→ AlternativeSupplier "ChipX Europe"
          → AlternativeSupplier "SemiCorp Japan"
```

- **为什么重要**：一项操作可以使多个备份同时在线
- **查询示例**：“哪些通过资格预审的供应商可以接管？”

### 7. **替代供应商可以替换供应商**（多对一）

```
AlternativeSupplier "ChipX Europe"
  canReplace→ Supplier "ChipX Corp"

AlternativeSupplier "SemiCorp Japan"  
  canReplace→ Supplier "ChipX Corp"
```

- **为什么重要**：关键供应商存在多个经批准的备份
- **查询示例**：“该供应商是否有经批准的备份？”

## 完整的级联示例

让我们通过一个真实场景来追踪影响：

```
DISRUPTION
│
├─ Taiwan Power Outage (2024-05-01, Critical severity)
│
├─ AFFECTS
│  └─ Supplier "ChipX Corp" (singleSourced=true)
│     ├─ SUPPLIES
│     │  ├─ Component "GPU Module" (daysOfSupplyOnHand=3)
│     │  │  ├─ USED IN
│     │  │  │  ├─ ProductLine "Gaming Laptop 2024" ($50M annual revenue)
│     │  │  │  ├─ ProductLine "Workstation Pro" ($30M annual revenue)
│     │  │  │
│     │  │  └─ TRIGGERS RiskAssessment
│     │  │     ├─ revenueAtRisk=$80M
│     │  │     ├─ timeToImpactDays=3
│     │  │     │
│     │  │     └─ RECOMMENDS
│     │  │        ├─ MitigationAction "Activate ChipX Europe"
│     │  │        │  ├─ estimatedCost=$2M
│     │  │        │  ├─ leadTimeSavedDays=2
│     │  │        │  │
│     │  │        │  └─ ACTIVATES
│     │  │        │     ├─ AlternativeSupplier "ChipX Europe" 
│     │  │        │     │  ├─ qualificationStatus=Approved
│     │  │        │     │  ├─ capacityAvailable=50,000 units/month
│     │  │        │     │  ├─ pricePremiumPercent=12%
│     │  │        │     │  │
│     │  │        │     │  └─ CAN REPLACE
│     │  │        │     │     └─ Supplier "ChipX Corp"
│     │  │        │     │
│     │  │        │     └─ AlternativeSupplier "SemiCorp Japan"
│     │  │        │        └─ (secondary option)
│     │  │        │
│     │  │        └─ MitigationAction "Increase Safety Stock"
│     │  │           └─ estimatedCost=$500K
│     │  │
│     │  └─ Component "Memory Board"
│     │     └─ (similar cascade...)
```

## 为什么此结构可以实现自动化

您的数据代理现在可以：

1. **检测** —“监控这些供应商和该地区”
2. **追踪** —“当 ChipX Corp 出现问题时，自动追踪到所有 14 个受影响的产品线”
3. **量化** - “计算风险总收入（8000 万美元）和影响时间（3 天）”
4. **推荐** - “激活经过资格预审的替代方案，节省 2 天时间并花费 200 万美元，而损失则为 8000 万美元”
5. **行动** - “发送采购警报，更新生产计划，通知利益相关者”
6. **学习** —“跟踪哪些操作实际有效，以及它们的实际影响与估计影响”

## 基数规则

|关系 |基数 |为什么 |
|---|---|---|
|供应商 → 组件 | 1：N |一个供应商可能提供多种组件|
|组件 → 产品线 |中号：中号 |组件重复使用；产品共享组件|
|颠覆→供应商|中号：中号 |一场灾难袭击了多个供应商；供应商面临多重威胁|
|颠覆→评估| 1：N |每次中断都会对每个受影响的产品线进行评估|
|评估→行动| 1：N |每项评估都建议采取多项行动 |
|行动→替代|中号：中号 |一次操作激活多个备份；备份处理多种情况|
|替代方案 → 供应商 |中号：1 |一个主要供应商存在多个经过资格预审的备份 |

接下来，我们将了解如何在实践中使用此模型来执行缓解工作流程。
