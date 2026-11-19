---
title: Building Your First Ontology
slug: building-your-first-ontology
description: A step-by-step tutorial to create an ontology from scratch using the visual designer — add entities, define properties, connect with relationships, and export to RDF.
order: 4
embed: official/cosmic-coffee
---

## 本教程将构建什么

在本教程中，你将创建一个简单的**图书馆**本体，其中包含三种实体类型：`Book`（图书）、`Author`（作者）和 `Member`（会员），并通过关系将它们连接起来。完成后，你将得到一个可用于 Microsoft Fabric IQ 或其他语义工具的有效 RDF 文件。

## 第 1 步：打开设计器

点击顶部导航栏中的**设计器**按钮，或直接前往 [/#/designer](#/designer)。你会看到一个空白画布：左侧是实体表单，右侧是实时关系图预览。

## 第 2 步：创建实体类型

点击**＋添加实体**按钮，创建以下三种实体：

**Book**
- 名称：`Book`
- 图标：`📚`
- 颜色：选择蓝色
- 属性：
  - `isbn`——字符串，**标识符** ✓
  - `title`——字符串
  - `publishedYear`——整数

**Author**
- 名称：`Author`
- 图标：`✍️`
- 颜色：选择绿色
- 属性：
  - `authorId`——字符串，**标识符** ✓
  - `name`——字符串
  - `nationality`——字符串

**Member**
- 名称：`Member`
- 图标：`👤`
- 颜色：选择紫色
- 属性：
  - `memberId`——字符串，**标识符** ✓
  - `name`——字符串
  - `joinDate`——日期

添加每个实体后，都可以看到关系图预览实时更新。

## 第 3 步：添加关系

切换到**关系**标签页，添加以下关系：

| Relationship | From | To | Cardinality |
|-------------|------|-----|-------------|
| `writtenBy` | Book | Author | Many-to-one |
| `borrowedBy` | Book | Member | Many-to-many |

`writtenBy` 是多对一关系，因为多本图书可以由同一位作者创作，而每本图书都有一位主要作者。`borrowedBy` 是多对多关系，因为一本书可以先后被多位会员借阅，一位会员也可以借阅多本书。

## 第 4 步：验证

点击工具栏中的**验证**按钮。如果设置正确，会看到绿色的“未发现问题”提示；如果有问题，请根据提示修正：

- 每个实体都必须至少有一个标识符属性
- 关系必须引用已存在的实体类型
- ID 不能重复

## 第 5 步：预览 RDF

点击预览面板中的 **RDF** 标签页，即可查看带语法高亮的实时 RDF/OWL 输出。Fabric IQ 等工具读取的正是这种格式。

<ontology-embed id="official/cosmic-coffee" height="400px"></ontology-embed>

*Fourth Coffee 本体也采用了同样的流程构建。你的图书馆本体会呈现相似结构：实体显示为彩色节点，关系显示为有向连线。*

## 第 6 步：导出

你可以选择以下三种方式：

1. **下载 RDF**——将 `.rdf` 文件保存到下载文件夹
2. **提交到目录**——通过一键拉取请求流程，将本体贡献给社区目录（需要登录 GitHub）
3. **复制 JSON**——复制 JSON 表示，以便在应用中使用

## 接下来可以做什么？

- 浏览[本体目录](#/catalogue)，了解其他本体的结构
- 阅读[本体设计模式](#/learn/ontology-design-patterns)，了解命名约定和最佳实践
- 在首页试用**查询 Playground**，针对你的本体提出自然语言问题

## 要点回顾

- 设计器提供可视化、无需编写代码的本体构建流程
- 每个实体都需要名称、至少一个属性和一个标识符
- 通过名称和基数定义实体之间的关系
- 关系图与 RDF 预览会在设计过程中即时反馈
- 可导出为 RDF 供 Fabric IQ 使用，也可以直接提交到社区目录

```quiz
Q: 为什么 Book 与 Member 之间的 `borrowedBy` 关系设置为多对多？
- 一本书只能被借阅一次
- 每位会员每次只能借一本书
- 一本书可以先后被多位会员借阅，一位会员也可以借阅多本书 [correct]
- 多对多是所有关系的默认基数
> 一本书可以在不同时段由不同会员借阅，每位会员也可以同时借阅多本书。关系两端都允许多个实例，因此这是多对多关系。
```
