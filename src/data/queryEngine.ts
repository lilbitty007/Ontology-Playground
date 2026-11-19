import type { Ontology } from './ontology';
import { nlQueryResponses } from './quests';

export interface QueryResponse {
  query: string;
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
  interpretation?: string;
}

function stripLeadingArticle(text: string): string {
  return text.replace(/^(a|an|the)\s+/, '').trim();
}

function singularize(text: string): string {
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

function matchesDemoQuery(normalizedQuery: string, demoQuery: string, matches: string[]): boolean {
  return normalizedQuery === demoQuery || matches.some(match => normalizedQuery.includes(match));
}

const ENTITY_NAMES_ZH: Record<string, string[]> = {
  customer: ['客户', '顾客'], client: ['客户'], consumer: ['消费者'],
  product: ['商品', '产品'], item: ['商品', '项目'], order: ['订单'],
  store: ['门店', '商店'], location: ['地点', '位置', '门店'],
  supplier: ['供应商'], vendor: ['供应商'], shipment: ['货运', '发货'],
  patient: ['患者', '病人'], provider: ['医护人员', '医疗服务提供者'],
  doctor: ['医生'], encounter: ['就诊记录', '就诊'], diagnosis: ['诊断'],
  account: ['账户', '账号'], transaction: ['交易'], party: ['参与方'],
  loan: ['贷款'], borrower: ['借款人'], lender: ['贷款方'], payment: ['付款'],
  student: ['学生'], course: ['课程'], instructor: ['教师', '讲师'],
  professor: ['教授'], department: ['院系', '部门'], employee: ['员工'],
  organization: ['组织', '机构'], person: ['人员', '个人'], company: ['公司'],
  device: ['设备'], sensor: ['传感器'], reading: ['读数', '测量值'],
  event: ['事件'], ingredient: ['原料', '配料'], recipe: ['配方'],
  coffee: ['咖啡'], review: ['评价', '评论'], category: ['类别', '分类'],
  invoice: ['发票'], contract: ['合同'], asset: ['资产'], risk: ['风险'],
  factory: ['工厂'], machine: ['机器', '设备'], material: ['材料', '物料'],
  productionorder: ['生产订单'], workorder: ['工单'],
};

function entityAliases(entity: Ontology['entityTypes'][number]): string[] {
  const key = entity.id.toLowerCase().replace(/[-_\s]/g, '');
  return [...new Set([
    entity.name.toLowerCase(),
    entity.name.toLowerCase().replace(/s$/, ''),
    ...(ENTITY_NAMES_ZH[key] ?? []),
    ...(ENTITY_NAMES_ZH[entity.name.toLowerCase().replace(/[^a-z]/g, '')] ?? []),
  ])];
}

function entityDisplayName(entity: Ontology['entityTypes'][number]): string {
  const key = entity.id.toLowerCase().replace(/[-_\s]/g, '');
  return ENTITY_NAMES_ZH[key]?.[0]
    ?? ENTITY_NAMES_ZH[entity.name.toLowerCase().replace(/[^a-z]/g, '')]?.[0]
    ?? entity.name;
}

// Generate dynamic query suggestions based on the current ontology
export function generateQuerySuggestions(ontology: Ontology): string[] {
  const suggestions: string[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  // Entity-based queries
  if (entities.length > 0) {
    const firstEntity = entities[0];
    suggestions.push(`显示所有 ${entityDisplayName(firstEntity)}`);
    
    if (entities.length > 1) {
      const secondEntity = entities[1];
      suggestions.push(`列出所有 ${entityDisplayName(secondEntity)}`);
    }
  }

  // Property-based queries
  entities.forEach(entity => {
    entity.properties.forEach(prop => {
      if (prop.type === 'string' && !prop.isIdentifier && prop.name !== 'name') {
      suggestions.push(`查看 ${entityDisplayName(entity)} 的 ${prop.name} 属性`);
      }
    });
  });

  // Relationship-based queries
  if (relationships.length > 0) {
    const rel = relationships[0];
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);
    if (fromEntity && toEntity) {
      suggestions.push(`${entityDisplayName(fromEntity)} 如何连接到 ${entityDisplayName(toEntity)}？`);
    }
  }

  // Conceptual queries always available
  suggestions.push("什么是实体类型？");
  suggestions.push("什么是关系？");
  suggestions.push("本体是如何运作的？");

  // Return unique suggestions (max 6)
  return [...new Set(suggestions)].slice(0, 6);
}

// Process a natural language query against the ontology
export function processQuery(query: string, ontology: Ontology): QueryResponse {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedNoPunctuation = normalizedQuery.replace(/[?!.:,;]+/g, '').trim();
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  if (ontology.name === 'Fourth Coffee') {
    const demoResponse = nlQueryResponses.find(response =>
      matchesDemoQuery(normalizedNoPunctuation, response.query, response.matches)
    );

    if (demoResponse) {
      return {
        query,
        result: demoResponse.result,
        highlightEntities: demoResponse.highlightEntities,
        highlightRelationships: demoResponse.highlightRelationships,
        interpretation: 'Detected: Fourth Coffee sample query'
      };
    }
  }

  // Conceptual queries (work for any ontology)
  if ((normalizedQuery.includes('what is') || normalizedQuery.includes('什么是') || normalizedQuery.includes('是什么'))
    && (normalizedQuery.includes('entity') || normalizedQuery.includes('ontology') || normalizedQuery.includes('实体') || normalizedQuery.includes('本体'))) {
    return {
      query,
      result: "**实体类型**是对现实概念（例如 Customer、Product 或 Order）的可复用逻辑模型。在 Fabric IQ 本体中，实体类型统一定义：\n\n• **名称与说明**：通用术语\n• **属性**：包含数据类型和单位的特征\n• **标识符**：用于唯一识别每个实例的键\n\n实体类型让组织中的每个人都能使用一致的定义。",
      highlightEntities: entities.slice(0, 2).map(e => e.id),
      highlightRelationships: [],
      interpretation: "已识别：关于实体类型的概念问题"
    };
  }

  if ((normalizedQuery.includes('what is') && normalizedQuery.includes('relationship')) || normalizedQuery.includes('什么是关系') || normalizedQuery.includes('关系是什么')) {
    return {
      query,
      result: "**关系**是实体类型之间具有类型和方向的连接。关系定义了：\n\n• **名称**：表示动作的动词（例如 places、contains）\n• **方向**：从一个实体指向另一个实体\n• **基数**：一对一、一对多等\n• **属性**：连接上可选的附加信息\n\n沿着关系遍历本体，可以回答复杂问题。",
      highlightEntities: [],
      highlightRelationships: relationships.slice(0, 2).map(r => r.id),
      interpretation: "已识别：关于关系的概念问题"
    };
  }

  if ((normalizedQuery.includes('how') && (normalizedQuery.includes('ontology') || normalizedQuery.includes('work')))
    || (normalizedQuery.includes('本体') && (normalizedQuery.includes('如何') || normalizedQuery.includes('怎么') || normalizedQuery.includes('结构')))) {
    return {
      query,
      result: `**${ontology.name}**本体包含：\n\n• **${entities.length} 种实体类型**：${entities.map(e => e.name).join('、')}\n• **${relationships.length} 种关系**：用于连接实体\n\n本体作为语义层连接到数据平台，让系统能够理解业务概念并响应自然语言查询。`,
      highlightEntities: entities.map(e => e.id),
      highlightRelationships: [],
      interpretation: "已识别：关于本体结构的问题"
    };
  }

  // Entity definition queries: "What is a Customer?"
  if (normalizedNoPunctuation.startsWith('what is ') || normalizedNoPunctuation.endsWith('是什么')) {
    const subjectRaw = normalizedNoPunctuation.startsWith('what is ')
      ? normalizedNoPunctuation.slice('what is '.length).trim()
      : normalizedNoPunctuation.slice(0, -'是什么'.length).trim();
    const subject = stripLeadingArticle(subjectRaw);

    for (const entity of entities) {
      const aliases = entityAliases(entity);
      const entityNameLower = entity.name.toLowerCase();
      const entityNameSingular = entityNameLower.endsWith('s') ? entityNameLower.slice(0, -1) : entityNameLower;

      if (
        subject === entityNameLower ||
        subject === entityNameSingular ||
        singularize(subject) === entityNameSingular ||
        aliases.includes(subject)
      ) {
        const propList = entity.properties
          .slice(0, 4)
          .map(p => `• **${p.name}** (${p.type})${p.isIdentifier ? ' 🔑' : ''}`)
          .join('\n');

        return {
          query,
          result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**属性：**\n${propList}`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `已识别：关于 ${entity.name} 的定义查询`
        };
      }
    }
  }

  // Entity listing queries
  for (const entity of entities) {
    const entityNameLower = entity.name.toLowerCase();
    const entityNamePlural = entityNameLower + 's';
    const aliases = entityAliases(entity);
    
    if (
      normalizedQuery.includes(`显示所有 ${entityNameLower}`) ||
      normalizedQuery.includes(`列出所有 ${entityNameLower}`) ||
      normalizedQuery.includes(`显示全部 ${entityNameLower}`) ||
      normalizedQuery.includes(`show me all ${entityNameLower}`) ||
      normalizedQuery.includes(`show me all ${entityNamePlural}`) ||
      normalizedQuery.includes(`list all ${entityNameLower}`) ||
      normalizedQuery.includes(`list all ${entityNamePlural}`) ||
      normalizedQuery.includes(`show ${entityNamePlural}`) ||
      normalizedQuery.includes(`list ${entityNamePlural}`) ||
      aliases.some(alias => normalizedQuery.includes(`显示所有 ${alias}`)
        || normalizedQuery.includes(`显示所有${alias}`)
        || normalizedQuery.includes(`列出所有 ${alias}`)
        || normalizedQuery.includes(`列出所有${alias}`)
        || normalizedQuery.includes(`显示全部 ${alias}`)
        || normalizedQuery.includes(`显示全部${alias}`)
        || normalizedQuery.includes(`查看所有 ${alias}`)
        || normalizedQuery.includes(`查看所有${alias}`)
        || normalizedQuery.includes(`列出 ${alias}`)
        || normalizedQuery.includes(`列出${alias}`))
    ) {
      const propList = entity.properties
        .slice(0, 4)
        .map(p => `• **${p.name}** (${p.type})${p.isIdentifier ? ' 🔑' : ''}`)
        .join('\n');
      
      return {
        query,
        result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**属性：**\n${propList}\n\n_在实际部署中，这里会查询数据平台中的 ${entity.name} 记录。_`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: `已识别：查询 ${entity.name} 实体`
      };
    }
  }

  // Relationship/connection queries
  for (const rel of relationships) {
    const relationNameNormalized = rel.name.toLowerCase().trim().replace(/\s+/g, ' ');
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);

    if (
      normalizedNoPunctuation.includes(relationNameNormalized) &&
      (normalizedNoPunctuation.includes('connection') || normalizedNoPunctuation.includes('connections') || normalizedNoPunctuation.includes('relationship') || normalizedNoPunctuation.includes('关系') || normalizedNoPunctuation.includes('连接'))
    ) {
      return {
        query,
        result: `**${rel.name}** connects **${fromEntity?.name ?? rel.from}** to **${toEntity?.name ?? rel.to}** (${rel.cardinality}).${rel.description ? `\n\n${rel.description}` : ''}`,
        highlightEntities: [rel.from, rel.to],
        highlightRelationships: [rel.id],
        interpretation: `已识别：查询关系 ${rel.name}`
      };
    }
  }

  for (const entity of entities) {
    const entityNameLower = entity.name.toLowerCase();
    
    if (normalizedQuery.includes(`${entityNameLower} 如何`) || normalizedQuery.includes(`如何连接到 ${entityNameLower}`) || normalizedQuery.includes(`how does ${entityNameLower}`) ||
        normalizedQuery.includes(`${entityNameLower} connect`) ||
        normalizedQuery.includes(`${entityNameLower} relate`)) {
      
      const relatedRels = relationships.filter(r => r.from === entity.id || r.to === entity.id);
      
      if (relatedRels.length > 0) {
        const relList = relatedRels.map(rel => {
          const isOutgoing = rel.from === entity.id;
          const otherEntityId = isOutgoing ? rel.to : rel.from;
          const otherEntity = entities.find(e => e.id === otherEntityId);
          const direction = isOutgoing ? '→' : '←';
          return `• **${rel.name}** ${direction} ${otherEntity?.icon} ${otherEntity?.name} (${rel.cardinality})`;
        }).join('\n');

        return {
          query,
          result: `**${entity.name}** ${entity.icon} has ${relatedRels.length} connection(s):\n\n${relList}`,
          highlightEntities: [entity.id, ...relatedRels.map(r => r.from === entity.id ? r.to : r.from)],
          highlightRelationships: relatedRels.map(r => r.id),
        interpretation: `已识别：查询 ${entity.name} 的关系`
        };
      }
    }
  }

  // Property-based queries
  for (const entity of entities) {
    for (const prop of entity.properties) {
      if (normalizedQuery.includes(prop.name.toLowerCase())
        && entityAliases(entity).some(alias => normalizedQuery.includes(alias))) {
        return {
          query,
          result: `**${entity.name}.${prop.name}**\n\n• 类型：${prop.type}\n${prop.unit ? `• 单位：${prop.unit}` : ''}\n${prop.isIdentifier ? '• 这是标识符属性 🔑' : ''}\n${prop.description ? `• ${prop.description}` : ''}\n\n_在实际应用中，可以按此属性筛选 ${entity.name}。_`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `已识别：查询 ${entity.name}.${prop.name} 属性`
        };
      }
    }
  }

  // Counting queries
  if (normalizedQuery.includes('how many') || normalizedQuery.includes('有多少') || normalizedQuery.includes('多少')) {
    for (const entity of entities) {
      if (normalizedQuery.includes(entity.name.toLowerCase())) {
        return {
          query,
          result: `本体定义了 **${entity.name}** 实体类型。\n\n_在实际应用中，此查询会统计数据平台中的 ${entity.name} 记录。_\n\n示例："SELECT COUNT(*) FROM ${entity.name.toLowerCase()}s"`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `已识别：统计 ${entity.name} 的数量`
        };
      }
    }
  }

  // Schema overview query
  if (normalizedQuery.includes('entities') || normalizedQuery.includes('schema') || normalizedQuery.includes('overview') || normalizedQuery.includes('实体') || normalizedQuery.includes('概览') || normalizedQuery.includes('模式')) {
    const entityList = entities.map(e => `• ${e.icon} **${e.name}** — ${e.description.slice(0, 50)}…`).join('\n');
    return {
      query,
      result: `**${ontology.name}** 本体概览\n\n${entityList}\n\n**合计：** ${entities.length} 个实体，${relationships.length} 个关系`,
      highlightEntities: entities.map(e => e.id),
      highlightRelationships: [],
      interpretation: "已识别：请求查看本体概览"
    };
  }

  // No match found - provide helpful suggestions
  const suggestions = generateQuerySuggestions(ontology).slice(0, 3);
  return {
    query,
    result: `无法理解有关 **${ontology.name}** 的问题：“${query}”。\n\n可以试试：\n${suggestions.map(s => `• ${s}`).join('\n')}\n\n也可以点击图谱元素，直接探索本体。`,
    highlightEntities: [],
    highlightRelationships: [],
    interpretation: undefined
  };
}
