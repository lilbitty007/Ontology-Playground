---
title: Contributing to the Catalogue
slug: contributing-to-the-catalogue
description: How to share your ontology with the community — fork, add your RDF and metadata, submit a PR, and see it published in the catalogue.
order: 6
embed: official/university
---

## 社区目录

Ontology Playground 提供了一个[本体目录](#/catalogue)，其中既有项目团队维护的“官方”本体，也有社区贡献的本体。任何人都可以通过提交拉取请求来贡献本体。

## 两种贡献方式

### 方式 A：从设计器一键提交拉取请求

这是最快的贡献方式：

1. 打开[设计器](#/designer)构建本体，或加载已有本体
2. 点击工具栏中的**提交到目录**
3. 填写元数据：名称、说明、类别和标签
4. 使用 GitHub 登录（设备授权流程，不会保存密码）
5. 工具会自动派生代码库、创建分支、提交 RDF 和元数据，并创建拉取请求

完成后，持续集成流程会验证 RDF、检查元数据格式并运行检查。随后由维护者审核并合并。

### 方式 B：手动提交拉取请求

如果你更希望直接使用 Git：

1. 在 GitHub 上**派生**此代码库
2. 在 `catalogue/community/<your-github-username>/<ontology-slug>/` 下创建目录
3. 添加两个文件：
   - `ontology.rdf`——你的 RDF/OWL 文件
   - `metadata.json`——本体的说明信息

## 元数据格式

```json
{
  "name": "Library System",
  "description": "A public library with books, authors, members, and loans.",
  "icon": "📚",
  "category": "education",
  "tags": ["library", "books", "lending"],
  "author": "your-github-username"
}
```

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `name` | 是 | 在目录中显示的名称 |
| `description` | 是 | 一句话概述 |
| `category` | 是 | 选择其一：`retail`、`healthcare`、`finance`、`manufacturing`、`education`、`technology`、`general` |
| `icon` | 否 | 卡片上显示的单个表情符号 |
| `tags` | 否 | 用于搜索的小写关键词数组 |
| `author` | 否 | GitHub 用户名（一键提交时自动填写） |

## 验证规则

系统会自动按以下规则验证你的拉取请求：

- **RDF/OWL 有效**——文件必须能够正常解析
- **往返一致性**——`parse(serialize(ontology))` 必须得到等价结果
- **元数据格式**——包含所有必填字段，且类别有效
- **目录命名**——仅使用小写字母、数字、连字符和下划线
- **不允许符号链接**——出于安全考虑，目录会拒绝符号链接

## 合并后会发生什么？

合并后，构建流程会：

1. 运行 `npm run catalogue:build`，将所有 RDF 文件编译到 `catalogue.json`
2. 部署更新后的网站，你的本体会出现在[目录](#/catalogue)中
3. 随后即可嵌入、通过深层链接访问，或在 Playground 中加载

<ontology-embed id="official/university" height="400px"></ontology-embed>

*大学系统本体是目录中的官方条目之一。社区贡献采用相同格式，因此你的本体也会以类似形式显示在目录中。*

## 让审核更顺利的建议

- **写好说明**——说明本体描述的领域，以及适用对象
- **添加有意义的标签**——帮助用户通过搜索找到本体
- **在本地验证**——推送前运行 `npm run validate -- catalogue/community/<you>/<slug>/ontology.rdf`
- **控制模型范围**——包含 3 至 8 种实体类型、范围清晰的本体，通常比包含 30 多种实体的庞大模型更实用

## 要点回顾

- 任何人都可以通过一键流程或手动拉取请求贡献本体
- 每次提交都需要 RDF 文件和 `metadata.json`
- 持续集成会自动验证 RDF，请在审核前修复错误
- 本体合并并部署后，就会出现在在线目录中

```quiz
Q: 每个目录贡献都必须包含哪两个文件？
- ontology.json 和 README.md
- schema.rdf 和 config.yaml
- ontology.rdf 和 metadata.json [correct]
- index.html 和 style.css
> 每个目录条目都需要 `ontology.rdf`（RDF/OWL 本体）和 `metadata.json`（目录条目的名称、说明、类别和标签）。
```
