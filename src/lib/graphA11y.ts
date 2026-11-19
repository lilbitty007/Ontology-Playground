import type { Ontology } from '../data/ontology';
import type { GraphView } from './graphView';

/**
 * Accessible name for the graph canvas.
 *
 * Cytoscape paints the ontology into `<canvas>` elements, which expose nothing
 * to assistive technology — without this the graph is an unlabelled region and
 * a screen reader announces nothing at all for the app's central feature. The
 * container carries `role="img"` and this summary as its label. Controls and
 * the legend remain siblings so they are not hidden by the image role.
 */
export function describeOntologyGraph(
  ontology: Ontology,
  view?: Pick<GraphView, 'mode' | 'visibleNodeCount' | 'visibleEdgeCount'>,
): string {
  const name = ontology.name?.trim();
  const subject = name ? `${name} 本体图谱` : '本体图谱';
  const entityTypes = `${ontology.entityTypes.length} 种实体类型`;
  const relationships = `${ontology.relationships.length} 种关系`;
  const overview = view?.mode === 'bounded'
    ? ` 语义概览显示 ${view.visibleNodeCount} 种实体类型和 ${view.visibleEdgeCount} 种关系。`
    : '';
  return `${subject}：${entityTypes}，${relationships}。${overview} 交互式图谱。`;
}
