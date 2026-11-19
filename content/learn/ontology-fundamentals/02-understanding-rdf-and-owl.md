---
title: Understanding RDF and OWL
slug: understanding-rdf-and-owl
description: Learn how ontologies are represented in RDF/OWL — the standard language for describing classes, properties, and relationships on the semantic web.
order: 2
embed: official/ecommerce
---

## 什么是 RDF？

**RDF**（资源描述框架）是 W3C 制定的标准，用于将信息描述为由资源相互连接而成的图。RDF 中的所有信息都表示为**三元组**：主语 → 谓语 → 宾语。

```
:Customer  rdf:type       owl:Class .
:name      rdf:type       owl:DatatypeProperty .
:name      rdfs:domain    :Customer .
:name      rdfs:range     xsd:string .
```

上面的三元组表示：“存在一个名为 Customer 的类，它有一个名为 name、类型为字符串的属性。”

## OWL 扩展了 RDF

**OWL**（Web 本体语言）在 RDF 的基础上提供更丰富的建模能力，例如基数约束、类层级和逻辑公理。本体设计中常用的 OWL 构造包括：

| OWL 概念 | 对应概念 | 示例 |
|-------------|---------|---------|
| `owl:Class` | 实体类型 | `Customer`、`Product` |
| `owl:DatatypeProperty` | 具有基本值的属性 | `name`（字符串）、`price`（小数） |
| `owl:ObjectProperty` | 实体间的关系 | `placedBy`（Order → Customer） |
| `rdfs:domain` / `rdfs:range` | 属性所属实体 / 属性值类型 | `price` 属于 `Product`，类型为 `xsd:decimal` |

## 命名空间消除歧义

RDF 中的每个资源都有全局唯一的 **URI**。为了避免反复书写很长的 URI，RDF/XML 使用**命名空间前缀**：

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns="https://mycompany.com/ontology/">
```

`xmlns=` 指定了默认命名空间，因此 `<owl:Class rdf:about="Customer">` 实际表示 `https://mycompany.com/ontology/Customer`。

## 阅读 RDF/OWL 文件

下面是一个最简本体示例，其中包含一种实体类型和一个属性：

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
         xmlns="https://example.com/shop/">

  <!-- 实体类型：Product -->
  <owl:Class rdf:about="Product">
    <rdfs:label>Product</rdfs:label>
  </owl:Class>

  <!-- 属性：productName（字符串、标识符） -->
  <owl:DatatypeProperty rdf:about="productName">
    <rdfs:domain rdf:resource="Product"/>
    <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>
    <rdfs:label>productName</rdfs:label>
  </owl:DatatypeProperty>
</rdf:RDF>
```

Ontology Playground 可以直接导入这类文件；你也可以先进行可视化设计，再导出为 RDF。

<ontology-embed id="official/ecommerce" height="400px"></ontology-embed>

*电子商务本体展示了更丰富的示例，其中有多种实体类型，并通过对象属性将它们连接起来。*

## JSON 与 RDF：分别适用于什么场景？

| | JSON | RDF/OWL |
|---|------|---------|
| **可读性** | 易于阅读和编辑 | 内容较长，但表达精确 |
| **工具** | 任意文本编辑器 | 语义网工具、SPARQL 端点 |
| **互操作性** | 通常面向特定应用 | W3C 标准，具有通用语义 |
| **适用场景** | 快速原型、应用配置 | 正式数据模型、跨系统集成 |

Ontology Playground 同时支持这两种格式：你可以在可视化编辑器中设计本体，按需导出为 JSON，或导出 RDF/OWL 用于正式发布。

## 要点回顾

- RDF 使用**主语 → 谓语 → 宾语**三元组表示知识
- OWL 在 RDF 之上增加类、数据属性和对象属性
- 命名空间让 URI 更简短、含义更明确
- Playground 支持导入和导出标准 RDF/OWL，无需手写代码

```quiz
Q: 在 RDF 中，信息以什么形式表示？
- 由行和列组成的表格
- JSON 键值对
- 主语 → 谓语 → 宾语三元组 [correct]
- 二进制数据流
> RDF 使用三元组描述信息：主语通过谓语与宾语相连，从而形成由资源组成的关系图。
```

```quiz
Q: `owl:ObjectProperty` 表示什么？
- 值为字符串等基本类型的属性
- 两种实体类型之间的关系 [correct]
- 本体的命名空间
- 数据类型约束
> 在 OWL 中，ObjectProperty 用于定义两个类（实体类型）之间的关系，例如用 `placedBy` 将 Order 连接到 Customer。DatatypeProperty 则用于表示基本类型的值。
```
