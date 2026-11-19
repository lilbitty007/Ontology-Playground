import type { LearnArticle, LearnCourse } from '../../types/learn';

type Copy = { title: string; description: string };

const courses: Record<string, Copy> = {
  'ontology-fundamentals': { title: '本体基础', description: '从基本概念到动手设计，系统学习 Microsoft Fabric IQ 本体的理解与构建方法。' },
  'cosmic-coffee-path': { title: 'Fourth Coffee 咖啡连锁', description: '从零构建咖啡连锁本体，涵盖顾客、订单、产品、门店、供应商和货运。' },
  'ecommerce-path': { title: '电子商务平台', description: '为在线商城建模：买家、商品、购物车、订单和顾客评价。' },
  'fibo-loans-lab': { title: 'FIBO 贷款实验', description: '逐步构建借鉴 FIBO 的贷款本体，内容依据 EDM Council 金融行业本体（FIBO）并遵循 MIT 许可证。' },
  'fibo-risk-lab': { title: 'FIBO 风险管理实验', description: '逐步构建借鉴 FIBO 的风险管理本体，涵盖行业分类、地理风险、贷款类型和监管合规。' },
  'finance-path': { title: '银行与金融', description: '为金融服务领域建模：顾客、账户、交易、贷款和投资组合。' },
  'healthcare-path': { title: '医疗保健系统', description: '为患者照护系统建模：患者、服务提供者、预约、诊断和处方。' },
  'hr-system-path': { title: '人力资源系统', description: '为人力资源平台建模：员工、部门、职位、任职安排和绩效评估。' },
  'iq-lab-retail-supply-chain': { title: 'IQ 实验：零售供应链', description: '逐步构建完整的零售供应链本体，从核心交易实体到履约、库存和促销。' },
  'manufacturing-path': { title: '智能制造', description: '为物联网工厂建模：机器、传感器、工单、零件和质量检查。' },
  'supply-chain-disruption-path': { title: '供应链中断与风险传播', description: '掌握主动风险管理：建模供应商中断如何沿零部件和产品线扩散，并借助本体驱动的数据代理自动执行缓解措施。' },
  'university-path': { title: '大学系统', description: '为学术机构建模：学生、课程、选课记录、教授和院系。' },
  'zava-grove-to-shelf': { title: 'Zava 从果园到货架：语义冷链', description: '逐步构建 Zava 的果园到货架本体，覆盖种植者、农场、冷链物流、零售订单和可持续发展。' },
};

const articles: Record<string, Copy> = {
  'what-is-an-ontology': { title: '什么是本体？', description: '面向初学者介绍本体：本体是什么、为何重要，以及它如何帮助我们把现实世界建模为相互关联的数据。' },
  'understanding-rdf-and-owl': { title: '理解 RDF 与 OWL', description: '了解如何用 RDF/OWL 表示本体，以及如何用语义网标准描述类、属性和关系。' },
  'fabric-iq-ontology-concepts': { title: 'Microsoft Fabric IQ 本体概念', description: '了解 Microsoft Fabric 如何通过实体类型、标识符属性、关系和基数等概念，支持对结构化数据进行自然语言查询。' },
  'building-your-first-ontology': { title: '构建你的第一个本体', description: '通过分步教程使用可视化设计器从零创建本体：添加实体、定义属性、建立关系并导出 RDF。' },
  'ontology-design-patterns': { title: '本体设计模式', description: '了解实用的命名约定、建模模式，以及数据平台本体设计中应避免的反模式。' },
  'contributing-to-the-catalogue': { title: '向目录贡献内容', description: '了解如何与社区分享本体：派生代码库、添加 RDF 和元数据、提交拉取请求，并将内容发布到目录。' },
  'scenario-overview': { title: '场景概览', description: '认识业务场景、需要解决的数据建模问题，以及本课程将构建的本体。' },
  'core-orders': { title: '核心订单', description: '定义咖啡业务的基础实体顾客、订单和产品，并用关系将它们连接起来。' },
  'adding-stores': { title: '添加门店', description: '将门店位置加入本体，并把订单连接到实际处理它们的门店。' },
  'complete-supply-chain': { title: '完整供应链', description: '添加供应商和货运，补全 Fourth Coffee 本体，并连接采购、物流和零售环节。' },
  'core-marketplace': { title: '核心商城', description: '定义电子商务平台的基础实体买家、商品和订单。' },
  'shopping-carts': { title: '购物车', description: '添加购物车以表示活跃购物会话，并引入一对一关系模式。' },
  'complete-platform': { title: '完整平台', description: '添加评价以补全买家反馈流程，完成电子商务本体。' },
  'core-loan-triad': { title: '贷款核心三元组', description: '为贷款、借款人和贷款机构建立 FIBO 基础模型，并定义其属性和关系。' },
  'collateral-and-schedules': { title: '抵押品与还款计划', description: '使用 FIBO 抵押品和付款计划概念，加入担保协议与还款周期。' },
  'servicing-and-payment-history': { title: '贷款服务与付款历史', description: '加入 FIBO 贷款服务机构和可审计的付款事件，扩展模型。' },
  'risk-and-classifiers': { title: '风险与分类器', description: '加入 FIBO 所有权和留置权分类器，支持授信和抵押品风险分析。' },
  'industry-classification': { title: '第 1 步：行业分类', description: '对经济层级建模：行业部门、子部门和行业组，以及气候与周期性属性。' },
  'geographic-hierarchy': { title: '第 2 步：地理层级', description: '加入地区、国家和司法辖区，并标记灾害区域以分析地理集中风险。' },
  'loan-classification': { title: '第 3 步：贷款分类', description: '加入贷款类型、巴塞尔风险权重、抵押品类别，以及 OCC/FDIC 集中度分类。' },
  'regulatory-context': { title: '第 4 步：监管环境', description: '加入银行监管规则、集中度上限和跨领域关系，完成模型。' },
  'customer-accounts': { title: '顾客与账户', description: '定义银行业务基础实体顾客和账户，并加入所有权关系及金融属性。' },
  'transactions': { title: '交易记录', description: '加入交易记录，跟踪账户上的每笔借记、贷记和转账。' },
  'complete-banking': { title: '完整银行模型', description: '加入贷款和投资，连接信贷产品与投资组合持仓，完成银行本体。' },
  'care-delivery': { title: '医疗服务', description: '定义患者、服务提供者和预约，构建医疗排程与服务交付的核心实体。' },
  'diagnoses': { title: '诊断', description: '加入诊断以记录医疗状况，并连接患者、临床发现与服务提供者的评估。' },
  'complete-care': { title: '完整照护模型', description: '加入处方以补全医疗保健本体，连接诊断与治疗，闭合照护流程。' },
  'organization-core': { title: '组织核心', description: '定义员工、部门和职位，构建组织架构的核心模型。' },
  'assignments': { title: '任职安排', description: '加入任职记录作为关联实体，描述员工在部门和职位间的任职历史。' },
  'complete-model': { title: '完整人力资源模型', description: '加入绩效评估，并将完整的人力资源本体用于实际员工分析问题。' },
  'core-commerce': { title: '核心交易', description: '定义顾客、订单和产品这三个零售本体基础实体，并建立它们之间的关系。' },
  'order-details-and-categories': { title: '订单明细与类别', description: '加入订单行作为订单与产品之间的关联实体，并引入产品类别进行分组。' },
  'geography': { title: '地理结构', description: '对地区和门店建模，补充地理结构：订单在哪里履约，门店位于何处。' },
  'fulfillment-and-logistics': { title: '履约与物流', description: '加入货运、承运商和仓库，描述从仓库到顾客的配送流程。' },
  'inventory-and-demand': { title: '库存与需求', description: '加入库存、预测和需求信号，跟踪库存水平并预测不同仓库和地区的未来需求。' },
  'complete-retail-model': { title: '完整零售模型', description: '加入促销和退货，完成包含 15 个实体的零售供应链本体，并探索完整关系图。' },
  'factory-floor': { title: '工厂现场', description: '定义机器和传感器，建立实时监控工厂设备的物联网基础。' },
  'production': { title: '生产跟踪', description: '加入工单和零件以跟踪生产内容，并连接机器与制造产出。' },
  'complete-factory': { title: '完整工厂模型', description: '加入质量检查以完成制造本体，连接生产与检验环节。' },
  'core-entities': { title: '核心实体与属性', description: '学习用于描述供应链中断的 7 种实体类型和 40 个属性，涵盖供应商、组件、风险评估和缓解措施。' },
  'risk-propagation-model': { title: '风险传播模型', description: '了解中断如何逐层扩散：通过 7 种关系表示供应商影响、组件风险、产品暴露和缓解行动。' },
  'mitigation-execution': { title: '缓解措施执行与自动化', description: '将本体转化为实际行动：了解如何结合 Fabric IQ 代理、实时仪表板和自动化，将中断影响从数天缩短到数分钟。' },
  'academic-core': { title: '学术核心', description: '定义学生、课程和选课记录，建立学籍管理中的关联实体模式。' },
  'faculty': { title: '教职人员', description: '加入教授以跟踪授课关系，连接教职人员、课程和学生。' },
  'complete-university': { title: '完整大学模型', description: '加入院系以完成大学本体，将教职人员、课程和学生组织到各学术项目中。' },
  'orchard-foundation': { title: '果园基础', description: '定义种植者、农场、地块和水果品种，描述 Zava 多产地采购模式的四类实体。' },
  'harvest-and-quality': { title: '采收与质量', description: '加入采收批次和质量检查，记录可追溯的采收事件及 Zava 的四阶段质量流程。' },
  'cold-chain-logistics': { title: '冷链物流', description: '加入货运和冷链传感器，描述易腐商品物流与实时温度数据，并设置关键告警规则。' },
  'retail-fulfillment': { title: '零售履约', description: '加入零售配送中心、门店和订单，将 Zava 供应链连接到零售合作伙伴与营收。' },
  'complete-zava-model': { title: '完整模型', description: '加入可持续发展计划，补全从果园到货架的模型：12 个实体、13 种关系，可直接用于演示。' },
};

export function localizeCourse(course: LearnCourse): LearnCourse {
  const copy = courses[course.slug];
  return copy ? { ...course, ...copy } : course;
}

export function localizeArticle(article: LearnArticle, courseSlug?: string): LearnArticle {
  if (article.slug === 'complete-model') {
    if (courseSlug === 'hr-system-path') {
      return { ...article, title: '完整人力资源模型', description: '加入绩效评估，并将完整的人力资源本体用于实际员工分析问题。' };
    }
    if (courseSlug === 'iq-lab-retail-supply-chain') {
      return { ...article, title: '完整零售模型', description: '加入促销和退货，完成包含 15 个实体的零售供应链本体，并探索完整关系图。' };
    }
    if (courseSlug === 'zava-grove-to-shelf') {
      return { ...article, title: '完整模型', description: '加入可持续发展计划，补全从果园到货架的模型：12 个实体、13 种关系，可直接用于演示。' };
    }
  }
  const copy = articles[article.slug];
  return copy ? { ...article, ...copy } : article;
}

export function localizeCourses(input: LearnCourse[]): LearnCourse[] {
  return input.map((course) => ({
    ...localizeCourse(course),
    articles: course.articles.map((article) => localizeArticle(article, course.slug)),
  }));
}
