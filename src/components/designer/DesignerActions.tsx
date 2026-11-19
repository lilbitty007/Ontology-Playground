import { useState, useEffect, useRef } from 'react';
import { Download, AlertTriangle, CheckCircle, Upload, Github, FilePlus, Undo2, Redo2 } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import type { ValidationError } from '../../store/designerStore';
import { useAppStore } from '../../store/appStore';
import {
  serializeToRDF,
  type RdfExportProfile,
} from '../../lib/rdf/serializer';
import { navigate } from '../../lib/router';
import { SubmitCatalogueModal } from './SubmitCatalogueModal';
import type { CatalogueEntry } from '../../types/catalogue';
import type { RdfExportResult } from '../../types/rdfDocument';
import {
  exportRdfDocument,
  isRdfDocumentDirty,
  isSameRdfDocumentRevision,
} from '../../lib/rdf/document';

interface DesignerToolbarProps {
  catalogueEntry?: CatalogueEntry | null;
  onNewOntology?: () => void;
}

/**
 * Toolbar buttons — rendered in the designer topbar.
 */
export function DesignerToolbar({
  catalogueEntry,
  onNewOntology,
}: DesignerToolbarProps = {}) {
  const {
    ontology,
    rdfDocument,
    validate,
    resetDraft,
    undo,
    redo,
    _past,
    _future,
  } = useDesignerStore();
  const loadOntology = useAppStore((s) => s.loadOntology);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rdfExportProfile, setRdfExportProfile] = useState<RdfExportProfile>('playground');
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeDerivationMetadata, setIncludeDerivationMetadata] =
    useState(false);
  const [lastRdfExport, setLastRdfExport] =
    useState<RdfExportResult | null>(null);
  const exportRequestId = useRef(0);
  const mounted = useRef(true);
  const canUndo = _past.length > 0;
  const canRedo = _future.length > 0;

  const handleValidate = () => {
    validate();
  };

  const handleExportRDF = async () => {
    const errors = validate();
    const requestId = ++exportRequestId.current;
    const ontologyAtStart = ontology;
    const documentAtStart = rdfDocument;
    const isCurrentRequest = () => {
      const activeState = useDesignerStore.getState();
      return mounted.current
        && requestId === exportRequestId.current
        && activeState.ontology === ontologyAtStart
        && isSameRdfDocumentRevision(
          activeState.rdfDocument,
          documentAtStart,
        );
    };
    setExportError(null);
    setIsExporting(true);
    try {
      const sourceExport = rdfDocument
        ? await exportRdfDocument(rdfDocument, {
            includeDerivationMetadata,
          })
        : null;
      if (!isCurrentRequest()) return;
      const content = sourceExport
        ? sourceExport.bytes
        : serializeToRDF(ontology, [], { profile: rdfExportProfile });
      setLastRdfExport(sourceExport);
      const blobPart = typeof content === 'string'
        ? content
        : content.slice().buffer;
      const blob = new Blob([blobPart], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const draftSuffix = errors.length > 0 ? '-draft' : '';
      const profileSuffix = rdfExportProfile === 'standards' ? '-owl-shacl' : '';
      const sourceSuffix =
        sourceExport?.kind === 'modified' ? '-derived' : '';
      a.download = `${ontology.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'ontology'}${draftSuffix}${profileSuffix}${sourceSuffix}.rdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (!isCurrentRequest()) return;
      setExportError(
        error instanceof Error ? error.message : 'RDF export failed',
      );
    } finally {
      if (isCurrentRequest()) setIsExporting(false);
    }
  };

  useEffect(() => () => {
    mounted.current = false;
    exportRequestId.current += 1;
  }, []);

  useEffect(() => {
    exportRequestId.current += 1;
    setIsExporting(false);
  }, [ontology, rdfDocument?.id, rdfDocument?.revision]);

  const handleLoadInPlayground = () => {
    const errors = validate();
    if (errors.length > 0) return;
    loadOntology(
      ontology,
      [],
      catalogueEntry ?? null,
      rdfDocument,
    );
    navigate({ page: 'home' });
  };

  const handleNewOntology = () => {
    resetDraft();
    onNewOntology?.();
  };

  const handleSubmitToCatalogue = () => {
    if (rdfDocument) {
      setExportError(
        'Source-backed RDF cannot be submitted as a projection-only catalogue entry.',
      );
      return;
    }
    const errors = validate();
    if (errors.length > 0) return;
    setShowSubmitModal(true);
  };

  return (
    <>
      <div className="designer-toolbar">
        <button className="designer-toolbar-btn" onClick={undo} disabled={!canUndo} title="撤销（Ctrl+Z）">
          <Undo2 size={14} />
        </button>
        <button className="designer-toolbar-btn" onClick={redo} disabled={!canRedo} title="重做（Ctrl+Shift+Z）">
          <Redo2 size={14} />
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleNewOntology} title="新建本体">
          <FilePlus size={14} /> 新建
        </button>
        <button className="designer-toolbar-btn" onClick={handleValidate} title="校验本体">
          <CheckCircle size={14} /> 校验
        </button>
        <div className="designer-toolbar-sep" />
        {!rdfDocument && (
          <select
            aria-label="RDF 导出配置"
            className="designer-toolbar-select"
            title="RDF 导出配置"
            value={rdfExportProfile}
            onChange={(event) => {
              const profile = event.target.value;
              if (profile === 'playground' || profile === 'standards') {
                setRdfExportProfile(profile);
              }
            }}
          >
            <option value="playground">游乐场兼容模式</option>
            <option value="standards">标准模式 OWL + SHACL</option>
          </select>
        )}
        {rdfDocument && (
          <label
            title="在导出文件中添加明确的 PROV 派生元数据"
            style={{ alignItems: 'center', display: 'flex', fontSize: 11, gap: 4 }}
          >
            <input
              type="checkbox"
              checked={includeDerivationMetadata}
              onChange={(event) =>
                setIncludeDerivationMetadata(event.target.checked)}
            />
            添加来源信息
          </label>
        )}
        <button
          className="designer-toolbar-btn"
          onClick={() => void handleExportRDF()}
          disabled={isExporting}
          title={rdfDocument
            ? '导出完整 RDF 文档'
            : '导出 RDF'}
        >
          <Download size={14} />
          {isExporting
            ? '正在准备…'
            : rdfDocument
              ? includeDerivationMetadata
                ? '导出派生 RDF'
                : isRdfDocumentDirty(rdfDocument)
                ? '导出修改后的完整 RDF'
                : '导出原始 RDF'
              : '导出 RDF'}
        </button>
        <button className="designer-toolbar-btn" onClick={handleLoadInPlayground} title="在游乐场中加载">
          <Upload size={14} /> 在游乐场中加载
        </button>
        <button
          className="designer-toolbar-btn submit"
          onClick={handleSubmitToCatalogue}
          disabled={Boolean(rdfDocument)}
          title={rdfDocument
            ? '暂不支持提交带源文件的 RDF'
            : '提交到社区目录'}
        >
          <Github size={14} /> 提交到目录
        </button>
      </div>

      {exportError && (
        <div role="alert" className="designer-import-error">
          {exportError}
        </div>
      )}
      {lastRdfExport && (
        <div className="designer-import-error" role="status">
          {lastRdfExport.kind} 导出：源语句 {lastRdfExport.sourceTripleCount.toLocaleString()} 条；
          已导出 {lastRdfExport.exportedTripleCount.toLocaleString()} 条；
          补丁 {lastRdfExport.patchCount.toLocaleString()} 条；
          {lastRdfExport.derivationMetadataIncluded ? '已包含来源信息' : '未包含来源信息'}。
        </div>
      )}

      {showSubmitModal && (
        <SubmitCatalogueModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
}

/**
 * Validation feedback — rendered in the sidebar.
 */
export function DesignerValidation() {
  const validationErrors = useDesignerStore((s) => s.validationErrors);
  const lastValidatedAt = useDesignerStore((s) => s._lastValidatedAt);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success banner for 3 seconds when validation runs with 0 errors
  useEffect(() => {
    if (lastValidatedAt > 0 && validationErrors.length === 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSuccess(false);
  }, [lastValidatedAt, validationErrors.length]);

  if (validationErrors.length === 0) {
    if (!showSuccess) return null;
    return (
      <div className="designer-validation-success">
        <div className="designer-validation-header" style={{ color: 'var(--ms-green, #16c60c)' }}>
          <CheckCircle size={14} /> 未发现问题
        </div>
      </div>
    );
  }

  return (
    <div className="designer-validation-errors">
      <div className="designer-validation-header">
        <AlertTriangle size={14} /> 有 {validationErrors.length} 个问题需要修复
      </div>
      <ul>
        {validationErrors.map((err, i) => (
          <li key={i}>
            <ErrorItem error={err} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorItem({ error }: { error: ValidationError }) {
  const selectEntity = useDesignerStore((s) => s.selectEntity);
  const selectRelationship = useDesignerStore((s) => s.selectRelationship);

  const handleClick = () => {
    if (error.entityId) {
      selectEntity(error.entityId);
    } else if (error.relationshipId) {
      selectRelationship(error.relationshipId);
    }
  };

  const isClickable = error.entityId || error.relationshipId;

  return (
    <span
      className={isClickable ? 'designer-error-link' : ''}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') handleClick(); } : undefined}
    >
      {error.message}
    </span>
  );
}
