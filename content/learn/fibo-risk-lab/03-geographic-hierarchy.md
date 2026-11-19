---
title: "Step 2: Geographic Hierarchy"
slug: geographic-hierarchy
description: Add regions, countries, and jurisdictions with disaster-zone flags for geographic concentration analysis.
order: 3
embed: official/fibo-risk-step-2
reviewStatus: under-human-review
---

## 风险所在

行业分类告诉您您的投资组合面临*哪些*行业。地理层次结构告诉您*在哪里*。集中在佛罗里达州的投资组合面临着与集中在加利福尼亚州不同的风险——飓风、地震和野火。

在此步骤中，我们添加三个实体，以不断增加的粒度对地理位置进行建模，并添加自然灾害标志。

## 新实体类型

### 区域

大陆或宏观经济区域 - “北美”、“欧洲”、“亚太”。

|属性 |类型 |笔记|
|---|---|---|
| `regionCode` |字符串|标识符 |
| `regionName` |字符串|显示名称 |
| `description` |字符串|地区描述|
| `disasterProfile` |字符串|该地区的主要灾害类型|

### 国家

具有经济和监管属性的民族国家。

|属性 |类型 |笔记|
|---|---|---|
| `countryCode` |字符串|标识符（ISO 国家代码）|
| `countryName` |字符串|显示名称 |
| `economicZone` |字符串|经济分类（例如“发达”、“新兴”）|
| `currency` |字符串|国家货币代码 |
| `regulatoryFramework` |字符串|主要银行监管机构|

### 管辖区

具有布尔灾区标志的国家以下管辖区（州、省）。

|属性 |类型 |笔记|
|---|---|---|
| `code` |字符串|标识符（例如“FL”、“CA”）|
| `name` |字符串|显示名称 |
| `hurricaneZone` |布尔 |面临飓风风险|
| `floodZone` |布尔 |面临洪水风险|
| `earthquakeZone` |布尔 |面临地震风险|
| `wildfireZone` |布尔 |面临野火风险|
| `coastal` |布尔 |沿海管辖|
| `latitude` |小数 |地理纬度|
| `longitude` |小数 |地理经度 |

## 新关系

- **inCountry**：`Jurisdiction` → `Country` (`many-to-one`) — 每个司法管辖区属于一个国家
- **inRegion**： `Jurisdiction` → `Region` (`many-to-one`) — 每个管辖区映射到一个地理区域

## 设计模式：布尔风险标志

请注意，管辖区使用 **布尔标志** 而不是单个“riskType”枚举。这是经过深思熟虑的——一个管辖区可以同时位于多个灾区。佛罗里达州既是 `hurricaneZone` 又是 `floodZone`。加利福尼亚州既是 `earthquakeZone` 又是 `wildfireZone`。

此模式可实现精确过滤：

- “显示同时属于 `hurricaneZone = true` 和 `coastal = true` 的所有司法管辖区”
- “我们在 `earthquakeZone` 中的总暴露量是多少司法管辖区？”

## 两个独立的层次结构

此时模型有两个独立的子图：

1. **Industry**：Sector ← Subsector ← IndustryGroup
2. **地理**：地区←国家（通过管辖区）和地区←管辖区

当我们添加贷款产品和监管限制时，这些将在后续步骤中连接。

## 步骤 2 图表（与步骤 1 不同）

<ontology-embed id="official/fibo-risk-step-2" diff="official/fibo-risk-step-1" height="400px"></ontology-embed>

*三个新实体（突出显示）添加了地理维度。注意两个独立的子图 - 它们将在步骤 3 中连接。*

```quiz
Q:为什么 Jurisdiction 使用布尔标志而不是单个riskType 属性？
- 布尔标志更容易存储在数据库中
- 一个管辖区可以同时位于多个灾区，单个枚举无法表示[correct]
- 布尔标志在图形可视化中呈现得更好
- FIBO 要求所有分类器都有布尔属性
> 单个管辖区可以面对多个自然灾害风险立即显现。佛罗里达州是飓风和洪水的多发地区。布尔标志允许精确的多维过滤，这对于诸如“飓风区 AND 沿海 AND 洪水区”之类的复合风险查询至关重要。
```
