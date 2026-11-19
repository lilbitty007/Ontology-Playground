import type { Ontology } from '../data/ontology';

export interface ValidationError {
  message: string;
  entityId?: string;
  relationshipId?: string;
}

const FABRIC_IQ_NAME_RE = /^[A-Za-z0-9]([A-Za-z0-9_-]{0,24}[A-Za-z0-9])?$/;

export function isValidFabricIQName(name: string): boolean {
  return FABRIC_IQ_NAME_RE.test(name);
}

export function fabricIQNameError(kind: string, name: string): string | null {
  if (!name) return null;
  if (name.length > 26) return `${kind}“${name}”超过 26 个字符。`;
  if (!/^[A-Za-z0-9]/.test(name)) return `${kind}“${name}”必须以字母或数字开头。`;
  if (!/[A-Za-z0-9]$/.test(name)) return `${kind}“${name}”必须以字母或数字结尾。`;
  if (!FABRIC_IQ_NAME_RE.test(name)) return `${kind}“${name}”只能包含字母、数字、连字符和下划线。`;
  return null;
}

export function validateOntology(ontology: Ontology): ValidationError[] {
  const errors: ValidationError[] = [];
  if (ontology.entityTypes.length === 0) {
    errors.push({ message: '请至少为本体添加一种实体类型。' });
  }
  const entityIds = new Set<string>();
  const propNameTypeMap = new Map<string, { type: string; entityName: string }>();
  for (const e of ontology.entityTypes) {
    const label = e.name || '未命名实体';
    if (!e.id) {
      errors.push({ message: `“${label}”缺少内部 ID。`, entityId: e.id });
    } else if (entityIds.has(e.id)) {
      errors.push({ message: `两个实体使用了相同的 ID“${e.id}”，请修改其中一个。`, entityId: e.id });
    } else {
      entityIds.add(e.id);
    }
    if (!e.name) {
      errors.push({ message: '有一个实体没有名称，请为其命名。', entityId: e.id });
    }
    const nameErr = fabricIQNameError('Entity type', e.name);
    if (nameErr) errors.push({ message: nameErr, entityId: e.id });
    if (!e.properties.some((p) => p.isIdentifier)) {
      errors.push({
        message: `“${label}”没有标识符属性。点击某个属性旁的钥匙图标（🔑），将其标记为唯一标识符。`,
        entityId: e.id,
      });
    }
    for (const p of e.properties) {
      if (p.isIdentifier && p.type !== 'string' && p.type !== 'integer') {
        errors.push({
          message: `“${label}”上的标识符属性“${p.name}”必须为字符串或整数类型，才能兼容 Fabric IQ。`,
          entityId: e.id,
        });
      }
      if (p.name) {
        const propNameErr = fabricIQNameError('Property', p.name);
        if (propNameErr) errors.push({ message: propNameErr, entityId: e.id });
        const existing = propNameTypeMap.get(p.name);
        if (existing && existing.type !== p.type) {
          errors.push({
            message: `属性“${p.name}”在“${label}”中定义为“${p.type}”，在“${existing.entityName}”中定义为“${existing.type}”。Fabric IQ 要求不同实体类型中同名属性使用相同类型。`,
            entityId: e.id,
          });
        } else if (!existing) {
          propNameTypeMap.set(p.name, { type: p.type, entityName: label });
        }
      }
    }
  }
  const graphElementIds = new Set(entityIds);
  for (const r of ontology.relationships) {
    const label = r.name || '未命名关系';
    if (!r.id) {
      errors.push({ message: `“${label}”缺少内部 ID。`, relationshipId: r.id });
    } else if (graphElementIds.has(r.id)) {
      const message = entityIds.has(r.id)
        ? `实体和关系使用了相同的 ID“${r.id}”。设计器图谱中的 ID 必须唯一。`
        : `两个关系使用了相同的 ID“${r.id}”，请修改其中一个。`;
      errors.push({ message, relationshipId: r.id });
    } else {
      graphElementIds.add(r.id);
    }
    if (!entityIds.has(r.from)) {
      errors.push({
        message: `“${label}”的起点“${r.from || '（无）'}”不存在，请选择有效的源实体。`,
        relationshipId: r.id,
      });
    }
    if (!entityIds.has(r.to)) {
      errors.push({
        message: `“${label}”的终点“${r.to || '（无）'}”不存在，请选择有效的目标实体。`,
        relationshipId: r.id,
      });
    }
  }
  return errors;
}

// Designer drafts allow unnamed properties while editing; generated definitions do not.
export function validateGeneratedOntology(ontology: Ontology): ValidationError[] {
  const errors = validateOntology(ontology);
  for (const entity of ontology.entityTypes) {
    const propertyNames = new Set<string>();
    for (const property of entity.properties) {
      if (!property.name) {
        errors.push({
          message: `“${entity.name}”的属性名称不能为空。`,
          entityId: entity.id,
        });
      } else if (propertyNames.has(property.name)) {
        errors.push({
          message: `属性“${property.name}”在“${entity.name}”中重复。实体内的属性名称必须唯一。`,
          entityId: entity.id,
        });
      }
      propertyNames.add(property.name);
    }
  }
  return errors;
}
