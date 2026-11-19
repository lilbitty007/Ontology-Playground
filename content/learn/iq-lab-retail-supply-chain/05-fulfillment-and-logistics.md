---
title: Fulfillment & Logistics
slug: fulfillment-and-logistics
description: Add Shipment, Carrier, and Warehouse to model the delivery pipeline — how orders move from warehouse to customer.
order: 5
embed: official/iq-lab-retail-step-4
---

## 交付管道

客户下订单，但这些订单如何到达他们手中？履行层将订单与物理物流基础设施连接起来：

- **装运** — 交货记录
- **承运人** — 物流提供商（FedEx、UPS 等）
- **仓库** — 库存和运输产品的履行中心

##货件

每批货件代表一次交货：

|属性 |类型 |标识符？ |
|---|---|---|
| `shipmentId` |字符串| ✓ |
| `shipDate` |日期 | |
| `deliveryDate` |日期 | |
| `status` |字符串| |

## 承运人

负责发货的物流公司：

|属性 |类型 |标识符？ |
|---|---|---|
| `carrierId` |字符串| ✓ |
| `carrierName` |字符串| |
| `serviceType` |字符串| |

## 仓库

运营中心：

|属性 |类型 |标识符？ |
|---|---|---|
| `warehouseId` |字符串| ✓ |
| `warehouseName` |字符串| |
| `capacity` |整数 | |

## 新关系

连接物流实体的三个新关系：

- **ShipmentFulfillsOrder** — `Shipment` → `Order` （多对一）
每批货物完成一个订单。多次发货可以完成同一个订单（拆分发货）。

- **按承运商装运** — `Shipment` → `Carrier`（多对一）
每批货件均由一个承运商处理。

- **货件从仓库出发** — `Shipment` → `Warehouse`（多对一）
每批货件从一个仓库出发。

## 中心模式

请注意，**发货**充当**中心实体** — 它同时连接到订单、承运商和仓库。这是桥接多个概念的事务或事件实体的常见模式：

```
Carrier ← Shipment → Order → Customer
              ↓
          Warehouse
```

从 Carrier 通过发货到订单到客户的单个图遍历回答：“哪些客户收到了 CarrierX 的发货？”

## 第 4 步的图表

<ontology-embed id="official/iq-lab-retail-step-4" diff="official/iq-lab-retail-step-3" height="450px"></ontology-embed>

*十种实体类型形成丰富的连通图。装运将物流层（承运商、仓库）与商务层（订单、客户）联系起来。您可以通过图从任何仓库遍历到任何客户。*

## 我们学到了什么

- **Hub 实体**（如 Shipment）连接多个域
- 物流层扩展了商业层 - 无需修改现有实体
- 图遍历让跨域查询变得自然：“哪些仓库发货到西南地区？”不需要 SQL 连接
- 本体现在是具有 10 个关系的 10 个实体 - 不断增长但仍然可读

```quiz
Q:Shipment 实体在本体中扮演什么角色？
- 它取代了订单实体
- 它充当连接物流层和商业层的枢纽[correct]
- 它存储客户地址
- 它定义仓库和承运商之间的基数
> 装运是连接多个域的枢纽实体：它将订单链接到物流基础设施（承运商、 Warehouse），无需修改现有实体即可实现跨域查询。
```

接下来，我们将添加库存跟踪和需求预测。
