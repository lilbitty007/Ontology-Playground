// Quest system for Ontology Playground demo

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'exploration' | 'traversal' | 'query';
  steps: QuestStep[];
  reward: {
    badge: string;
    badgeIcon: string;
    points: number;
  };
}

export interface QuestStep {
  id: string;
  instruction: string;
  targetType: 'entity' | 'relationship' | 'property' | 'query';
  targetId?: string;
  hint?: string;
}

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "认识实体",
    description: "通过探索实体类型，了解 Fourth Coffee 本体的核心组成。",
    difficulty: "beginner",
    category: "exploration",
    steps: [
      {
        id: "step-1-1",
        instruction: "点击 Customer（客户） 实体，了解顾客信息",
        targetType: "entity",
        targetId: "customer",
        hint: "在图谱中找到 👤 图标",
      },
      {
        id: "step-1-2",
        instruction: "接着探索 Product（商品） 实体",
        targetType: "entity",
        targetId: "product",
        hint: "找到 ☕ 咖啡杯图标",
      },
      {
        id: "step-1-3",
        instruction: "最后查看 Store（门店） 实体",
        targetType: "entity",
        targetId: "store",
        hint: "找到 🏪 门店图标",
      }
    ],
    reward: {
      badge: "实体探索者",
      badgeIcon: "🎖️",
      points: 100
    }
  },
  {
    id: "quest-2",
    title: "咖啡豆之旅",
    description: "沿着关系追踪咖啡豆从供应商到顾客的旅程。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-2-1",
        instruction: "从 Supplier（供应商） 实体开始，这里是咖啡豆的来源",
        targetType: "entity",
        targetId: "supplier",
        hint: "找到 🚚 卡车图标",
      },
      {
        id: "step-2-2",
        instruction: "沿着 sourcedFrom（采购自） 关系前往 Product（商品）",
        targetType: "relationship",
        targetId: "product_sourced_from_supplier",
        hint: "点击连接 Supplier（供应商） 和 Product（商品） 的线",
      },
      {
        id: "step-2-3",
        instruction: "探索 contains（包含） 关系，了解产品如何出现在订单中",
        targetType: "relationship",
        targetId: "order_contains_product",
        hint: "查看 Order（订单） 与 Product（商品） 之间的连接",
      },
      {
        id: "step-2-4",
        instruction: "最后查看 places（下单） 关系，了解是谁下了订单",
        targetType: "relationship",
        targetId: "customer_places_order",
        hint: "找到从 Customer（客户） 指向 Order（订单） 的关系",
      }
    ],
    reward: {
      badge: "咖啡豆侦探",
      badgeIcon: "🔍",
      points: 250
    }
  },
  {
    id: "quest-3",
    title: "供应链导航员",
    description: "了解货运如何连接供应商与门店。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-3-1",
        instruction: "点击 Shipment（货运） 实体",
        targetType: "entity",
        targetId: "shipment",
        hint: "找到 📦 包裹图标",
      },
      {
        id: "step-3-2",
        instruction: "探索指向 Supplier（供应商） 的 sentBy（由其发货） 关系",
        targetType: "relationship",
        targetId: "shipment_from_supplier",
        hint: "查看货运的来源",
      },
      {
        id: "step-3-3",
        instruction: "沿着 deliveredTo（配送至） 关系前往 Store（门店）",
        targetType: "relationship",
        targetId: "shipment_to_store",
        hint: "查看货运的目的地",
      }
    ],
    reward: {
      badge: "供应链达人",
      badgeIcon: "🌐",
      points: 200
    }
  },
  {
    id: "quest-4",
    title: "查询探索者",
    description: "学习使用自然语言提出问题。",
    difficulty: "advanced",
    category: "query",
    steps: [
      {
        id: "step-4-1",
        instruction: "试着提问：“显示所有 Gold 等级的顾客”",
        targetType: "query",
        hint: "在自然语言查询区输入问题",
      },
      {
        id: "step-4-2",
        instruction: "再试着问：“哪些产品来自埃塞俄比亚？”",
        targetType: "query",
        hint: "用自然语言按产地筛选",
      },
      {
        id: "step-4-3",
        instruction: "试试路径查询：“Arif Ramadhan 下了哪些订单？”",
        targetType: "query",
        hint: "查询会沿着 Customer（客户） → Order（订单） 关系查找",
      }
    ],
    reward: {
      badge: "查询向导",
      badgeIcon: "🧙",
      points: 300
    }
  },
  {
    id: "quest-5",
    title: "探索数据绑定",
    description: "了解本体概念如何连接到真实的数据平台来源。",
    difficulty: "advanced",
    category: "exploration",
    steps: [
      {
        id: "step-5-1",
        instruction: "选择 Customer（客户） 实体并查看其数据绑定",
        targetType: "entity",
        targetId: "customer",
        hint: "在检查器中找到“数据绑定”部分",
      },
      {
        id: "step-5-2",
        instruction: "查看 Customer（客户） 属性如何映射到来源列",
        targetType: "property",
        targetId: "name",
        hint: "留意 name（名称） 如何映射到来源中的 full_name",
      },
      {
        id: "step-5-3",
        instruction: "检查 Product（商品） 实体的数据绑定，并记下来源和表名",
        targetType: "entity",
        targetId: "product",
        hint: "查看 Product（商品） 下方的数据绑定卡片",
      }
    ],
    reward: {
      badge: "绑定专家",
      badgeIcon: "🔗",
      points: 350
    }
  }
];

// Pre-defined NL query responses for demo
export interface QueryResponse {
  query: string;
  matches: string[];
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
}

export const nlQueryResponses: QueryResponse[] = [
  {
    query: "show me all gold tier customers",
    matches: ["gold tier", "gold customers", "customers gold", "显示所有 gold 等级顾客", "gold 等级的顾客"],
    result: "找到 1 位 Gold 等级顾客：\n• Arif Ramadhan（CUST-001）— 自 2024 年起为 Gold 等级",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "which products come from ethiopia",
    matches: ["products ethiopia", "ethiopian", "from ethiopia", "哪些产品来自埃塞俄比亚", "来自埃塞俄比亚的产品"],
    result: "找到 1 款来自埃塞俄比亚的产品：\n• Ethiopian Single Origin（☕ 冲煮咖啡）— $4.50\n  来源：Ethiopia Highlands Farm",
    highlightEntities: ["product", "supplier"],
    highlightRelationships: ["product_sourced_from_supplier"]
  },
  {
    query: "what orders did arif ramadhan place",
    matches: ["orders arif", "arif ramadhan orders", "arif placed", "arif ramadhan 下了哪些订单", "arif 的订单"],
    result: "Arif Ramadhan 的订单：\n• ORD-2025-001 — $12.50（已完成）\n  商品：Ethiopian Single Origin ×2、Colombian Latte ×1\n  门店：Downtown Seattle",
    highlightEntities: ["customer", "order", "store"],
    highlightRelationships: ["customer_places_order", "order_processed_at_store"]
  },
  {
    query: "how many stores are in seattle",
    matches: ["stores seattle", "seattle stores", "how many stores", "西雅图有多少家门店", "西雅图的门店"],
    result: "西雅图共有 2 家门店：\n• Fourth Coffee — Downtown Seattle（45 个座位）\n• Fourth Coffee — Capitol Hill（32 个座位）",
    highlightEntities: ["store"],
    highlightRelationships: []
  },
  {
    query: "show supply chain for colombian latte",
    matches: ["supply chain", "colombian latte", "where does colombian latte come from", "colombian latte 的供应链", "哥伦比亚拿铁的供应链"],
    result: "Colombian Latte 的供应链：\n• 咖啡豆产地：Colombia 🇨🇴\n• 供应商：Colombian Mountain Roasters\n• 认证：Rainforest Alliance 🌿\n• 最近一次货运：SHIP-001（1 月 27 日送达）",
    highlightEntities: ["product", "supplier", "shipment"],
    highlightRelationships: ["product_sourced_from_supplier", "shipment_from_supplier"]
  },
  {
    query: "what is an entity type",
    matches: ["what is entity", "entity type", "define entity"],
    result: "An Entity Type is a reusable logical model of a real-world concept (like Customer, Product, or Order). It standardizes the name, description, identifiers, and properties so every team means the same thing when using a term.",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "what is a relationship",
    matches: ["what is relationship", "define relationship", "relationships"],
    result: "A Relationship is a typed, directional link between entity types. For example, 'Customer places Order' defines how customers connect to their orders. Relationships can have attributes like quantity or confidence.",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "show me platinum customers",
    matches: ["platinum", "platinum customers", "customers platinum"],
    result: "Found 1 Platinum tier customer:\n• Jaroslav Cerny (CUST-002) - Platinum tier\n  Total spend: $3,420.00\n  Member since: Jan 2023",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "list all organic products",
    matches: ["organic", "organic products", "is organic"],
    result: "Found 2 organic products:\n• Ethiopian Single Origin (Brewed) - $4.50 🌱\n• Nebula Cold Brew (Cold Brew) - $5.25 🌱",
    highlightEntities: ["product"],
    highlightRelationships: []
  }
];
