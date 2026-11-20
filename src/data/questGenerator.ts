// Dynamic Quest Generator - Creates quests based on the loaded ontology

import { ontologyLabel } from '../lib/ontologyLabels';
import type { Ontology } from './ontology';
import type { Quest, QuestStep } from './quests';

/**
 * Generates a set of quests dynamically based on the current ontology structure.
 * Quests adapt to entity types, relationships, and properties in the loaded ontology.
 */
export function generateQuestsForOntology(ontology: Ontology): Quest[] {
  const quests: Quest[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  // Quest 1: Meet the Entities (always generated)
  if (entities.length >= 2) {
    const explorationSteps: QuestStep[] = entities.slice(0, Math.min(4, entities.length)).map((entity, index) => ({
      id: `step-1-${index + 1}`,
      instruction: `点击 ${ontologyLabel(entity.name, 'entity')} 实体，查看它的属性`,
      targetType: 'entity' as const,
      targetId: entity.id,
      hint: `在图谱中找到 ${entity.icon} 图标`
    }));

    quests.push({
      id: "quest-1",
      title: "认识实体",
      description: `探索 ${ontology.name} 本体中的核心实体类型。`,
      difficulty: "beginner",
      category: "exploration",
      steps: explorationSteps,
      reward: {
        badge: "Entity Explorer",
        badgeIcon: "🎖️",
        points: 100
      }
    });
  }

  // Quest 2: Relationship Navigator
  if (relationships.length >= 2) {
    const relSteps: QuestStep[] = [];
    const usedEntities = new Set<string>();

    // Try to find a chain of relationships
    for (const rel of relationships.slice(0, 3)) {
      const sourceEntity = entities.find(e => e.id === rel.from);
      const targetEntity = entities.find(e => e.id === rel.to);

      if (sourceEntity && !usedEntities.has(sourceEntity.id)) {
        relSteps.push({
          id: `step-2-${relSteps.length + 1}`,
          instruction: `从 ${ontologyLabel(sourceEntity.name, 'entity')} 实体开始`,
          targetType: 'entity',
          targetId: sourceEntity.id,
        hint: `找到 ${sourceEntity.icon} 图标`
        });
        usedEntities.add(sourceEntity.id);
      }

      relSteps.push({
        id: `step-2-${relSteps.length + 1}`,
        instruction: `沿着“${ontologyLabel(rel.name, 'relationship')}”关系${targetEntity ? `前往 ${ontologyLabel(targetEntity.name, 'entity')}` : ''}`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `点击标注“${ontologyLabel(rel.name, 'relationship')}”的连线`
      });
    }

    if (relSteps.length >= 2) {
      quests.push({
        id: "quest-2",
        title: "关系导航员",
        description: `追踪 ${ontology.name} 中实体之间的连接。`,
        difficulty: "intermediate",
        category: "traversal",
        steps: relSteps,
        reward: {
          badge: "Connection Master",
          badgeIcon: "🔗",
          points: 200
        }
      });
    }
  }

  // Quest 3: Find the Hub - identify the most connected entity
  const connectionCount = new Map<string, number>();
  for (const entity of entities) {
    connectionCount.set(entity.id, 0);
  }
  for (const relationship of relationships) {
    connectionCount.set(
      relationship.from,
      (connectionCount.get(relationship.from) ?? 0) + 1,
    );
    if (relationship.to !== relationship.from) {
      connectionCount.set(
        relationship.to,
        (connectionCount.get(relationship.to) ?? 0) + 1,
      );
    }
  }
  
  const sortedByConnections = entities
    .map(e => ({ entity: e, connections: connectionCount.get(e.id) ?? 0 }))
    .sort((a, b) => b.connections - a.connections);

  if (sortedByConnections.length >= 2 && sortedByConnections[0].connections >= 2) {
    const hub = sortedByConnections[0].entity;
    const connectedRels = relationships.filter(
      r => r.from === hub.id || r.to === hub.id
    ).slice(0, 3);

    const hubSteps: QuestStep[] = [
      {
        id: "step-3-1",
        instruction: `找到 ${ontologyLabel(hub.name, 'entity')} 实体——它是本体中连接最多的实体！`,
        targetType: 'entity',
        targetId: hub.id,
        hint: `${ontologyLabel(hub.name, 'entity')} 有 ${connectionCount.get(hub.id) ?? 0} 个连接`
      }
    ];

    connectedRels.forEach((rel, i) => {
      hubSteps.push({
        id: `step-3-${i + 2}`,
        instruction: `探索“${ontologyLabel(rel.name, 'relationship')}”关系`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `${rel.from === hub.id ? '此关系从' : '此关系连接到'} ${ontologyLabel(hub.name, 'entity')}`
      });
    });

    quests.push({
      id: "quest-3",
      title: "寻找枢纽",
      description: `找出 ${ontology.name} 中连接最多的实体。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: hubSteps,
      reward: {
        badge: "Hub Detective",
        badgeIcon: "🔍",
        points: 200
      }
    });
  }

  // Quest 4: Property Detective - explore entity properties
  const entitiesWithManyProps = entities
    .filter(e => e.properties.length >= 3)
    .slice(0, 2);

  if (entitiesWithManyProps.length >= 1) {
    const propSteps: QuestStep[] = [];
    
    for (const entity of entitiesWithManyProps) {
      propSteps.push({
        id: `step-4-${propSteps.length + 1}`,
        instruction: `选择 ${ontologyLabel(entity.name, 'entity')} 实体并查看它的 ${entity.properties.length} 个属性`,
        targetType: 'entity',
        targetId: entity.id,
        hint: `在检查器中查看属性详情`
      });

      const identifierProp = entity.properties.find(p => p.isIdentifier);
      if (identifierProp) {
        propSteps.push({
          id: `step-4-${propSteps.length + 1}`,
          instruction: `在 ${ontologyLabel(entity.name, 'entity')} 中找到标识符属性“${ontologyLabel(identifierProp.name, 'property')}”`,
          targetType: 'property',
          targetId: identifierProp.name,
          hint: `找到标记该标识符的钥匙图标 🔑`
        });
      }
    }

    quests.push({
      id: "quest-4",
      title: "属性侦探",
      description: `了解定义每种实体类型的属性。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: propSteps,
      reward: {
        badge: "Data Scholar",
        badgeIcon: "📊",
        points: 250
      }
    });
  }

  // Quest 5: Query Explorer (always available)
  const sampleEntities = entities.slice(0, 2);
  const querySteps: QuestStep[] = [
    {
      id: "step-5-1",
      instruction: `试着提问：“${sampleEntities[0] ? ontologyLabel(sampleEntities[0].name, 'entity') : '某个实体'} 是什么？”`,
      targetType: 'query',
      hint: "在自然语言查询区输入问题"
    }
  ];

  if (sampleEntities.length >= 2) {
    querySteps.push({
      id: "step-5-2",
      instruction: `再问：“${ontologyLabel(sampleEntities[0].name, 'entity')} 与 ${ontologyLabel(sampleEntities[1].name, 'entity')} 有什么关系？”`,
      targetType: 'query',
      hint: "探索实体之间的关系"
    });
  }

  if (relationships.length > 0) {
    const rel = relationships[0];
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);
    querySteps.push({
      id: "step-5-3",
      instruction: fromEntity && toEntity
        ? `试试路径查询：“${ontologyLabel(fromEntity.name, 'entity')} 如何连接到 ${ontologyLabel(toEntity.name, 'entity')}？”`
        : `试着查询“${ontologyLabel(rel.name, 'relationship')}”关系的路径`,
      targetType: 'query',
      hint: `查询将沿着“${ontologyLabel(rel.name, 'relationship')}”关系路径进行`
    });
  }

  quests.push({
    id: "quest-5",
    title: "查询探索者",
    description: "学习使用自然语言提出问题。",
    difficulty: "advanced",
    category: "query",
    steps: querySteps,
    reward: {
      badge: "Query Wizard",
      badgeIcon: "🧙",
      points: 300
    }
  });

  // Quest 6: Full Traversal - go through a chain of entities
  if (relationships.length >= 3) {
    // Try to find a chain: A -> B -> C
    let chain: { entities: typeof entities[0][], rels: typeof relationships[0][] } | null = null;

    for (const startRel of relationships) {
      const midEntity = entities.find(e => e.id === startRel.to);
      if (!midEntity) continue;

      const nextRel = relationships.find(r => r.from === midEntity.id && r.id !== startRel.id);
      if (!nextRel) continue;

      const endEntity = entities.find(e => e.id === nextRel.to);
      if (!endEntity) continue;

      const startEntity = entities.find(e => e.id === startRel.from);
      if (!startEntity) continue;

      chain = {
        entities: [startEntity, midEntity, endEntity],
        rels: [startRel, nextRel]
      };
      break;
    }

    if (chain) {
      const chainSteps: QuestStep[] = [
        {
          id: "step-6-1",
        instruction: `从 ${ontologyLabel(chain.entities[0].name, 'entity')} 开始探索`,
          targetType: 'entity',
          targetId: chain.entities[0].id,
          hint: `找到 ${chain.entities[0].icon} 图标`
        },
        {
          id: "step-6-2",
          instruction: `沿着“${ontologyLabel(chain.rels[0].name, 'relationship')}”关系前往 ${ontologyLabel(chain.entities[1].name, 'entity')}`,
          targetType: 'relationship',
          targetId: chain.rels[0].id,
          hint: "点击连接它们的线"
        },
        {
          id: "step-6-3",
          instruction: `探索 ${ontologyLabel(chain.entities[1].name, 'entity')} 实体`,
          targetType: 'entity',
          targetId: chain.entities[1].id,
          hint: "这是探索路径的中间节点"
        },
        {
          id: "step-6-4",
          instruction: `继续沿着“${ontologyLabel(chain.rels[1].name, 'relationship')}”关系前往 ${ontologyLabel(chain.entities[2].name, 'entity')}`,
          targetType: 'relationship',
          targetId: chain.rels[1].id,
          hint: "再探索一条关系就完成了！"
        },
        {
          id: "step-6-5",
          instruction: `到达终点！探索 ${ontologyLabel(chain.entities[2].name, 'entity')}`,
          targetType: 'entity',
          targetId: chain.entities[2].id,
          hint: `路径探索完成！${chain.entities[2].icon}`
        }
      ];

      quests.push({
        id: "quest-6",
        title: "完整旅程",
        description: `沿着关系从 ${ontologyLabel(chain.entities[0].name, 'entity')} 一路探索到 ${ontologyLabel(chain.entities[2].name, 'entity')}。`,
        difficulty: "advanced",
        category: "traversal",
        steps: chainSteps,
        reward: {
          badge: "路径先锋",
          badgeIcon: "🗺️",
          points: 350
        }
      });
    }
  }

  return quests;
}

/**
 * Get a domain-specific badge icon based on ontology category/name
 */
export function getOntologyThemeIcon(ontologyName: string): string {
  const name = ontologyName.toLowerCase();
  if (name.includes('health') || name.includes('medical') || name.includes('patient')) return '🏥';
  if (name.includes('commerce') || name.includes('retail') || name.includes('shop')) return '🛒';
  if (name.includes('bank') || name.includes('financ')) return '🏦';
  if (name.includes('manufactur') || name.includes('factory') || name.includes('production')) return '🏭';
  if (name.includes('university') || name.includes('education') || name.includes('school')) return '🎓';
  if (name.includes('coffee') || name.includes('cosmic')) return '☕';
  return '🔷';
}
