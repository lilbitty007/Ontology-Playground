import { describe, expect, it } from 'vitest';
import { describeOntologyGraph } from './graphA11y';
import type { EntityType, Ontology, Relationship } from '../data/ontology';

function entityTypes(count: number): EntityType[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `entity-${index}`,
    name: `Entity ${index}`,
    description: '',
    properties: [],
    icon: '📦',
    color: '#0078D4',
  }));
}

function relationships(count: number): Relationship[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `rel-${index}`,
    name: `relates${index}`,
    from: 'entity-0',
    to: 'entity-0',
    cardinality: 'one-to-many' as const,
  }));
}

function ontology(name: string, entities: number, rels: number): Ontology {
  return {
    name,
    description: '',
    entityTypes: entityTypes(entities),
    relationships: relationships(rels),
  };
}

describe('describeOntologyGraph', () => {
  it('names the ontology and counts its full model', () => {
    expect(describeOntologyGraph(ontology('Fourth Coffee', 6, 7))).toBe(
      'Fourth Coffee 本体图谱：6 种实体类型，7 种关系。 交互式图谱。',
    );
  });

  it('uses singular nouns for a count of one', () => {
    expect(describeOntologyGraph(ontology('Tiny', 1, 1))).toContain('1 种实体类型，1 种关系。');
  });

  it('describes an empty ontology without crashing', () => {
    expect(describeOntologyGraph(ontology('Blank', 0, 0))).toBe(
      'Blank 本体图谱：0 种实体类型，0 种关系。 交互式图谱。',
    );
  });

  it('falls back to a generic subject when the ontology is unnamed', () => {
    expect(describeOntologyGraph(ontology('', 2, 1))).toBe(
      '本体图谱：2 种实体类型，1 种关系。 交互式图谱。',
    );
  });

  it('ignores a whitespace-only ontology name', () => {
    expect(describeOntologyGraph(ontology('   ', 2, 1))).toBe(
      '本体图谱：2 种实体类型，1 种关系。 交互式图谱。',
    );
  });

  it('distinguishes the visible semantic overview from ontology totals', () => {
    expect(describeOntologyGraph(ontology('Taxonomy', 350, 349), {
      mode: 'bounded',
      visibleNodeCount: 4,
      visibleEdgeCount: 3,
    })).toBe(
      'Taxonomy 本体图谱：350 种实体类型，349 种关系。 语义概览显示 4 种实体类型和 3 种关系。 交互式图谱。',
    );
  });

  it('uses singular nouns and zero counts in a bounded view', () => {
    expect(describeOntologyGraph(ontology('Taxonomy', 350, 349), {
      mode: 'bounded',
      visibleNodeCount: 1,
      visibleEdgeCount: 0,
    })).toContain('语义概览显示 1 种实体类型和 0 种关系。');
  });

  it('does not describe dense complete graphs as semantic overviews', () => {
    expect(describeOntologyGraph(ontology('Dense', 90, 89), {
      mode: 'dense',
      visibleNodeCount: 90,
      visibleEdgeCount: 89,
    })).toBe(
      'Dense 本体图谱：90 种实体类型，89 种关系。 交互式图谱。',
    );
  });
});
