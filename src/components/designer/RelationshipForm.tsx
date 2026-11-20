import { ontologyLabel } from '../../lib/ontologyLabels';
import { Plus, Trash2 } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import type { Relationship } from '../../data/ontology';
import { canEditLiteral } from '../../lib/rdf/document';

const CARDINALITY_OPTIONS: Relationship['cardinality'][] = [
  'one-to-one', 'one-to-many', 'many-to-one', 'many-to-many',
];

const CARDINALITY_LABELS: Record<Relationship['cardinality'], string> = {
  'one-to-one': '1 : 1',
  'one-to-many': '1 : N',
  'many-to-one': 'N : 1',
  'many-to-many': 'N : N',
};

export function RelationshipForm() {
  const {
    ontology,
    rdfDocument,
    selectedRelationshipId,
    addRelationship,
    updateRelationship,
    removeRelationship,
    selectRelationship,
    addRelationshipAttribute,
    updateRelationshipAttribute,
    removeRelationshipAttribute,
  } = useDesignerStore();

  const entities = ontology.entityTypes;
  const sourceBacked = Boolean(rdfDocument);

  const handleAdd = () => {
    if (entities.length < 1) return;
    // Default the target to a second entity when one exists; otherwise create a
    // self-referencing relationship on the only entity (Fabric supports these).
    const from = entities[0].id;
    const to = entities[1]?.id ?? entities[0].id;
    addRelationship(from, to);
  };

  return (
    <div className="designer-relationship-list">
      <div className="designer-section-header">
        <h3>关系（{ontology.relationships.length}）</h3>
        <button
          className="designer-add-btn"
          onClick={handleAdd}
          disabled={entities.length < 1 || sourceBacked}
          title={sourceBacked
            ? '带源文件的 RDF 暂不支持添加关系'
            : entities.length < 1
              ? '请先创建至少一个实体，再添加关系'
              : '添加关系'}
        >
          <Plus size={14} /> 添加
        </button>
      </div>

      {ontology.relationships.length === 0 && (
        <div className="designer-empty">
          {entities.length < 1
            ? '请先创建至少一个实体。'
            : '还没有关系。点击“添加”来创建。'}
        </div>
      )}

      {ontology.relationships.map((rel) => {
        const isSelected = selectedRelationshipId === rel.id;
        const isSubclass = rel.kind === 'subclass';
        const fromEntity = entities.find((e) => e.id === rel.from);
        const toEntity = entities.find((e) => e.id === rel.to);
        const mapping = rdfDocument?.projection.relationships[rel.id];
        const literalTarget = mapping?.term
          ? {
              term: mapping.term,
              literals: mapping.literals,
            }
          : undefined;
        const canEditName = !rdfDocument || !isSelected || canEditLiteral(
          rdfDocument,
          literalTarget,
          'http://www.w3.org/2000/01/rdf-schema#label',
          rel.name,
        );
        const canEditDescription = !rdfDocument || !isSelected || (
          !isSubclass
          && canEditLiteral(
            rdfDocument,
            literalTarget,
            'http://www.w3.org/2000/01/rdf-schema#comment',
            rel.description ?? '',
          )
        );
        const canEditSubclass = !rdfDocument || (
          mapping?.kind === 'subclass'
          && Boolean(rdfDocument.projection.entities[rel.from])
          && Boolean(rdfDocument.projection.entities[rel.to])
        );

        return (
          <div
            key={rel.id}
            className={`designer-rel-card ${isSelected ? 'selected' : ''}`}
            onClick={() => selectRelationship(rel.id)}
          >
            <div className="designer-rel-header">
              <span className="designer-rel-flow" title={ontologyLabel(rel.name, 'relationship')}>
                {fromEntity?.icon ?? '?'} {fromEntity ? ontologyLabel(fromEntity.name, 'entity') : '???'}
                <span className="designer-rel-arrow"> → </span>
                {toEntity?.icon ?? '?'} {toEntity ? ontologyLabel(toEntity.name, 'entity') : '???'}
              </span>
              <button
                className="designer-delete-btn"
                onClick={(e) => { e.stopPropagation(); removeRelationship(rel.id); }}
                disabled={sourceBacked && (!isSubclass || !canEditSubclass)}
                title={sourceBacked && (!isSubclass || !canEditSubclass)
                  ? '只能删除 RDF 中可精确映射的直接子类关系'
                  : '删除关系'}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {isSelected && (
              <div className="designer-rel-body">
                {/* Name */}
                {isSubclass ? (
                  <div className="designer-import-error">
                    类层级关系（`rdfs:subClassOf`）。导出 RDF 时仍会保留为子类语句。
                  </div>
                ) : (
                  <label className="designer-field">
                    <span>名称</span>
                    <input
                      type="text"
                      value={rel.name}
                      onChange={(e) => updateRelationship(rel.id, { name: e.target.value })}
                      placeholder="关系名称"
                      disabled={!canEditName}
                      title={!canEditName
                        ? 'This value has no unambiguous RDF label mapping'
                        : undefined}
                    />
                  </label>
                )}

                {/* Source / Target */}
                <div className="designer-field-row">
                  <label className="designer-field">
                    <span>{isSubclass ? '子类' : '起点'}</span>
                    <select
                      value={rel.from}
                      onChange={(e) => updateRelationship(rel.id, { from: e.target.value })}
                      disabled={sourceBacked && (!isSubclass || !canEditSubclass)}
                    >
                      {entities.map((e) => (
                        <option
                          key={e.id}
                          value={e.id}
                          disabled={sourceBacked
                            && !rdfDocument?.projection.entities[e.id]}
                        >
                          {e.icon} {ontologyLabel(e.name, 'entity')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="designer-field">
                    <span>{isSubclass ? '父类' : '终点'}</span>
                    <select
                      value={rel.to}
                      onChange={(e) => updateRelationship(rel.id, { to: e.target.value })}
                      disabled={sourceBacked && (!isSubclass || !canEditSubclass)}
                    >
                      {entities.map((e) => (
                        <option
                          key={e.id}
                          value={e.id}
                          disabled={sourceBacked
                            && !rdfDocument?.projection.entities[e.id]}
                        >
                          {e.icon} {ontologyLabel(e.name, 'entity')}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Cardinality */}
                {!isSubclass && (
                  <label className="designer-field">
                    <span>基数</span>
                    <select
                      value={rel.cardinality}
                      disabled={sourceBacked}
                      onChange={(e) =>
                        updateRelationship(rel.id, { cardinality: e.target.value as Relationship['cardinality'] })
                      }
                    >
                      {CARDINALITY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{CARDINALITY_LABELS[c]}</option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Description */}
                <label className="designer-field">
                  <span>描述</span>
                  <textarea
                    rows={2}
                    value={rel.description ?? ''}
                    onChange={(e) => updateRelationship(rel.id, { description: e.target.value })}
                    placeholder="描述此关系"
                    disabled={!canEditDescription}
                    title={!canEditDescription
                      ? 'This value has no unambiguous RDF comment mapping'
                      : undefined}
                  />
                </label>

                {/* Attributes */}
                {!isSubclass && (
                  <div className="designer-field">
                    <div className="designer-section-header">
                      <span>属性（{rel.attributes?.length ?? 0}）</span>
                      <button
                        className="designer-add-btn small"
                        onClick={() => addRelationshipAttribute(rel.id)}
                        disabled={sourceBacked}
                        title={sourceBacked
                          ? '关系属性为只读'
                          : undefined}
                      >
                        <Plus size={12} /> 添加
                      </button>
                    </div>
                    {(rel.attributes ?? []).map((attr, idx) => (
                      <div key={idx} className="designer-property-row">
                        <input
                          className="designer-prop-name"
                          type="text"
                          value={attr.name}
                          onChange={(e) =>
                            updateRelationshipAttribute(rel.id, idx, { name: e.target.value })
                          }
                          placeholder="属性名称"
                          disabled={sourceBacked}
                        />
                        <input
                          className="designer-prop-type"
                          type="text"
                          value={attr.type}
                          onChange={(e) =>
                            updateRelationshipAttribute(rel.id, idx, { type: e.target.value })
                          }
                          placeholder="类型"
                          disabled={sourceBacked}
                        />
                        <button
                          className="designer-delete-btn small"
                          onClick={() => removeRelationshipAttribute(rel.id, idx)}
                          disabled={sourceBacked}
                          title={sourceBacked ? '关系属性为只读' : '删除属性'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
