---
title: Cold-Chain Logistics
slug: cold-chain-logistics
description: Add Shipment and ColdChainSensor to model the perishable logistics layer — and the live temperature telemetry that drives Zava's most important alerting rule.
order: 4
embed: official/zava-grove-to-shelf-step-3
---

## Zava 一天中最昂贵的分钟

一旦 HarvestLot 离开包装厂，时钟就会开始。水果容易腐烂。如果某个品种的温度超过安全温度 15 分钟，整个冷藏集装箱就会被毁掉——很容易造成六位数的收入。冷链层是 Zava 在语义方面的投资回报最丰厚的地方。

两个新实体表达了此域：

- **装运** - 将一个或多个 HarvestLot 运往零售 DC 的冷藏集装箱或卡车。
- **ColdChainSensor** — 连接到货物流温度和湿度遥测数据的传感器。

## 实体

### 发货

|属性 |类型 |标识符？ |
|---|---|---|
| `shipmentId` |字符串| ✓ |
| `departureDate` |日期时间 | |
| `etaDate` |日期时间 | |
| `modality` |字符串| |
| `containerId` |字符串| |

### ColdChainSensor

|属性 |类型 |标识符？ |
|---|---|---|
| `sensorId` |字符串| ✓ |
| `sensorModel` |字符串| |
| `temperatureC` |小数 (°C) | |
| `humidityPct` |小数 (%) | |

在 Microsoft Fabric IQ 中，`ColdChainSensor` 是 **时间序列实体** 的规范示例 - 它的读数绑定到 Eventhouse 而不是 Lakehouse 表。本体隐藏了这种分割：查询在不知道底层引擎的情况下遍历 `Sensor → Shipment`。

## 新关系

|来自 |动词|至 |基数 |
|---|---|---|---|
|发货 |携带|收获地块 |一对多 |
|发货 |监控者 |冷链传感器 |一对多 |

请注意 `Shipment` 如何充当 ** 枢纽 ** — 它将静态 Lakehouse 世界（HarvestLot 谱系）与流式 Eventhouse 世界（传感器遥测）连接起来。

## 冷链违规查询

Zava 旗舰演示问题：

> *“货物 SH-2026-04812 刚刚超过 9°C。哪些零售商订单被暴露？”*

今天这是一个五系统手动追逐。有了本体，就是单次遍历：

```
ColdChainSensor[temperatureC > FruitVariety.maxStorageTempC + 2]
   → Shipment
   → HarvestLot
   → (later) Order → Store → Retailer
```

下一步我们将连接零售端。

## 到目前为止的图表

<ontology-embed id="official/zava-grove-to-shelf-step-3" diff="official/zava-grove-to-shelf-step-2" height="450px"></ontology-embed>

*八个实体。右侧分支（传感器→装运）是实时遥测侧；左侧分支（HarvestLot → Plot → Farm → Grower）是血统侧。本体将它们统一起来。*

```quiz
Q:`Shipment` 被描述为“中心”实体是什么意思？
- 它是图中最大的实体
- 它通过单个共享概念连接两个独立的域 - 谱系（收获地段）和遥测（传感器）[correct]
- 所有其他实体都必须通过它连接
- 需要集线器来实现 RDF 合规性
> 集线器实体链接否则会链接的域生活在不同的系统中。 Shipment 将 HarvestLot（Lakehouse 血统）与 ColdChainSensor（Eventhouse 遥测）连接起来，因此单个图遍历可以跨越两者。
```

接下来，我们将关闭零售循环——配送中心、商店和面临风险的订单。
