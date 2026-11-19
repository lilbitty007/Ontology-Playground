import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Download, FileJson, AlertCircle, CheckCircle, RotateCcw, Copy, FileText, Table, Share2, Cloud } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import {
  serializeToRDF,
  type RdfExportProfile,
} from '../lib/rdf/serializer';
import { RDFParseError } from '../lib/rdf/parser';
import type { Ontology, DataBinding } from '../data/ontology';
import type { RdfExportResult } from '../types/rdfDocument';
import { SourceFidelityNote } from './SourceFidelityNote';
import {
  createImportedRdfDocument,
  exportRdfDocument,
  isSameRdfDocumentRevision,
  MAX_RDF_SOURCE_BYTES,
} from '../lib/rdf/document';
import { decodeRdfBytes } from '../lib/rdf/dataset';

const LEGACY_FORMATS_ENABLED = import.meta.env.VITE_ENABLE_LEGACY_FORMATS === 'true';

interface ImportExportModalProps {
  onClose: () => void;
  onFabricPush?: () => void;
}

const sampleSchema = `{
  "ontology": {
    "name": "示例本体",
    "description": "本体说明",
    "entityTypes": [
      {
        "id": "entity1",
        "name": "实体名称",
        "description": "此实体所表示的概念",
        "icon": "📦",
        "color": "#0078D4",
        "properties": [
          { "name": "id", "type": "string", "isIdentifier": true },
          { "name": "name", "type": "string" }
        ]
      }
    ],
    "relationships": [
      {
        "id": "rel1",
        "name": "connects_to",
        "from": "entity1",
        "to": "entity2",
        "cardinality": "1:n"
      }
    ]
  },
  "bindings": []
}`;

export function ImportExportModal({ onClose, onFabricPush }: ImportExportModalProps) {
  const {
    currentOntology,
    dataBindings,
    currentCatalogueEntry,
    rdfDocument,
    loadOntology,
    ensureCurrentRdfDocument,
    resetToDefault,
    exportOntology,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'csv' | 'rdf'>('rdf');
  const [rdfExportProfile, setRdfExportProfile] = useState<RdfExportProfile>('playground');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [includeDerivationMetadata, setIncludeDerivationMetadata] =
    useState(false);
  const [lastRdfExport, setLastRdfExport] =
    useState<RdfExportResult | null>(null);
  const importRequestId = useRef(0);
  const exportRequestId = useRef(0);
  const activeFileReader = useRef<FileReader | null>(null);
  const mounted = useRef(true);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    mounted.current = false;
    importRequestId.current += 1;
    exportRequestId.current += 1;
    abortActiveFileRead();
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    exportRequestId.current += 1;
    setIsExporting(false);
  }, [currentOntology, rdfDocument?.id, rdfDocument?.revision]);

  const clearCloseTimer = () => {
    if (closeTimer.current === null) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  function abortActiveFileRead() {
    const reader = activeFileReader.current;
    if (!reader) return;
    activeFileReader.current = null;
    reader.onload = null;
    reader.onerror = null;
    reader.onabort = null;
    reader.abort();
  }

  const closeModal = () => {
    clearCloseTimer();
    abortActiveFileRead();
    importRequestId.current += 1;
    exportRequestId.current += 1;
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearCloseTimer();
    abortActiveFileRead();
    const requestId = ++importRequestId.current;
    if (file.size === 0 || file.size > MAX_RDF_SOURCE_BYTES) {
      setImportStatus('error');
      setErrorMessage(
        `Ontology source must be between 1 byte and ${
          MAX_RDF_SOURCE_BYTES.toLocaleString()
        } bytes; "${file.name}" is ${file.size.toLocaleString()} bytes.`,
      );
      return;
    }
    const startingState = useAppStore.getState();
    const isCurrentRequest = () => {
      const activeState = useAppStore.getState();
      return requestId === importRequestId.current
        && activeState.currentOntology === startingState.currentOntology
        && activeState.rdfDocument === startingState.rdfDocument;
    };

    const reader = new FileReader();
    activeFileReader.current = reader;
    reader.onload = async (event) => {
      if (activeFileReader.current === reader) {
        activeFileReader.current = null;
      }
      if (!isCurrentRequest()) return;
      try {
        const result = event.target?.result;
        if (!(result instanceof ArrayBuffer)) {
          throw new Error('The selected file could not be read as bytes.');
        }
        const bytes = new Uint8Array(result);
        const content = decodeRdfBytes(bytes);
        const fileName = file.name.toLowerCase();
        const trimmed = content.trimStart();
        const isRdfExt = fileName.endsWith('.rdf') || fileName.endsWith('.owl') || fileName.endsWith('.iq');
        const isXmlContent = trimmed.startsWith('<?xml') || trimmed.startsWith('<rdf:RDF');

        let ontology: Ontology;
        let bindings: DataBinding[] = [];

        if (isRdfExt || isXmlContent) {
          const parsed = await createImportedRdfDocument(bytes, {
            name: file.name,
          });
          if (!isCurrentRequest()) return;
          ontology = parsed.ontology;
          bindings = parsed.bindings;
          loadOntology(ontology, bindings, null, parsed.document);
        } else if (LEGACY_FORMATS_ENABLED && (fileName.endsWith('.json') || trimmed.startsWith('{'))) {
          // Parse as JSON (legacy)
          const parsed = JSON.parse(content);

          if (!parsed.ontology || !parsed.ontology.entityTypes || !parsed.ontology.relationships) {
            throw new Error('Invalid ontology structure. Must have ontology.entityTypes and ontology.relationships.');
          }

          ontology = parsed.ontology;
          bindings = parsed.bindings || [];
          if (!isCurrentRequest()) return;
          loadOntology(ontology, bindings);
        } else {
          const supported = LEGACY_FORMATS_ENABLED
            ? 'an RDF/OWL (.rdf, .owl, .iq) or JSON (.json)'
            : 'an RDF/OWL (.rdf, .owl, .iq)';
          throw new Error(`Unsupported file format: "${file.name}". Please import ${supported} file.`);
        }

        // Fall back to filename (without extension) if no ontology name was parsed
        if (!ontology.name) {
          ontology.name = file.name.replace(/\.[^.]+$/, '');
        }

        setImportStatus('success');
        setErrorMessage('');
        
        // Auto-close after success
        clearCloseTimer();
        closeTimer.current = setTimeout(() => {
          closeTimer.current = null;
          if (requestId === importRequestId.current) closeModal();
        }, 1500);
      } catch (err) {
        if (!isCurrentRequest()) return;
        setImportStatus('error');
        if (err instanceof RDFParseError) {
          setErrorMessage(`RDF 解析错误：${err.message}`);
        } else {
          const message = err instanceof Error
            ? err.message
            : '文件解析失败';
          setErrorMessage(`RDF 解析错误：${message}`);
        }
      }
    };
    reader.onerror = () => {
      if (activeFileReader.current === reader) {
        activeFileReader.current = null;
      }
      if (!isCurrentRequest()) return;
      setImportStatus('error');
      setErrorMessage('The selected file could not be read.');
    };
    reader.onabort = () => {
      if (activeFileReader.current === reader) {
        activeFileReader.current = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = async () => {
    const requestId = ++exportRequestId.current;
    const ontologyAtStart = currentOntology;
    const documentAtStart = rdfDocument;
    const isCurrentRequest = () => {
      const activeState = useAppStore.getState();
      return mounted.current
        && requestId === exportRequestId.current
        && activeState.currentOntology === ontologyAtStart
        && isSameRdfDocumentRevision(
          activeState.rdfDocument,
          documentAtStart,
        );
    };
    setIsExporting(true);
    setExportError(null);
    try {
      let content: string | Uint8Array;
      let mimeType: string;
      let extension: string;
      let suffix: string;

      if (exportFormat === 'yaml') {
        content = exportAsYAML();
        mimeType = 'text/yaml';
        extension = 'yaml';
        suffix = 'ontology';
      } else if (exportFormat === 'csv') {
        content = exportAsCSV();
        mimeType = 'text/csv';
        extension = 'csv';
        suffix = 'ontology';
      } else if (exportFormat === 'rdf' && rdfDocument) {
        const ready = await ensureCurrentRdfDocument();
        if (!ready) {
          throw new Error('The complete RDF source is not available.');
        }
        if (!isCurrentRequest()) return;
        const exported = await exportRdfDocument(ready, {
          includeDerivationMetadata,
        });
        if (!isCurrentRequest()) return;
        setLastRdfExport(exported);
        content = exported.bytes;
        mimeType = exported.mediaType;
        extension = 'rdf';
        suffix = exported.kind === 'original' ? 'original' : 'derived';
      } else if (exportFormat === 'rdf') {
        content = serializeToRDF(
          currentOntology,
          dataBindings,
          { profile: rdfExportProfile },
        );
        mimeType = 'application/rdf+xml';
        extension = 'rdf';
        suffix = rdfExportProfile === 'standards'
          ? 'owl-shacl'
          : 'playground';
      } else {
        content = exportOntology();
        mimeType = 'application/json';
        extension = 'json';
        suffix = 'ontology';
      }

      if (!isCurrentRequest()) return;
      const blobPart = typeof content === 'string'
        ? content
        : content.slice().buffer;
      const blob = new Blob([blobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentOntology.name.toLowerCase().replace(/\s+/g, '-')}-${suffix}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  // Simple YAML exporter (no external dependencies)
  const exportAsYAML = (): string => {
    const indent = (level: number) => '  '.repeat(level);
    let yaml = '';

    yaml += 'ontology:\n';
    yaml += `${indent(1)}name: "${currentOntology.name}"\n`;
    yaml += `${indent(1)}description: "${currentOntology.description || ''}"\n`;
    yaml += `${indent(1)}entityTypes:\n`;

    for (const entity of currentOntology.entityTypes) {
      yaml += `${indent(2)}- id: "${entity.id}"\n`;
      yaml += `${indent(3)}name: "${entity.name}"\n`;
      yaml += `${indent(3)}description: "${entity.description || ''}"\n`;
      yaml += `${indent(3)}icon: "${entity.icon}"\n`;
      yaml += `${indent(3)}color: "${entity.color}"\n`;
      yaml += `${indent(3)}properties:\n`;
      for (const prop of entity.properties) {
        yaml += `${indent(4)}- name: "${prop.name}"\n`;
        yaml += `${indent(5)}type: "${prop.type}"\n`;
        if (prop.isIdentifier) yaml += `${indent(5)}isIdentifier: true\n`;
      }
    }

    yaml += `${indent(1)}relationships:\n`;
    for (const rel of currentOntology.relationships) {
      yaml += `${indent(2)}- id: "${rel.id}"\n`;
      yaml += `${indent(3)}name: "${rel.name}"\n`;
      yaml += `${indent(3)}from: "${rel.from}"\n`;
      yaml += `${indent(3)}to: "${rel.to}"\n`;
      yaml += `${indent(3)}cardinality: "${rel.cardinality}"\n`;
    }

    if (dataBindings.length > 0) {
      yaml += '\nbindings:\n';
      for (const binding of dataBindings) {
        yaml += `${indent(1)}- entityTypeId: "${binding.entityTypeId}"\n`;
        yaml += `${indent(2)}source: "${binding.source}"\n`;
      }
    }

    return yaml;
  };

  // Export entities and relationships as CSV tables
  const exportAsCSV = (): string => {
    let csv = '';

    // Entity Types table
    csv += '# ENTITY TYPES\n';
    csv += 'id,name,description,icon,color,properties\n';
    for (const entity of currentOntology.entityTypes) {
      const props = entity.properties.map(p => p.name).join(';');
      csv += `"${entity.id}","${entity.name}","${entity.description || ''}","${entity.icon}","${entity.color}","${props}"\n`;
    }

    csv += '\n';

    // Relationships table
    csv += '# RELATIONSHIPS\n';
    csv += 'id,name,from,to,cardinality,description\n';
    for (const rel of currentOntology.relationships) {
      csv += `"${rel.id}","${rel.name}","${rel.from}","${rel.to}","${rel.cardinality}","${rel.description || ''}"\n`;
    }

    // Properties detail table
    csv += '\n# PROPERTIES BY ENTITY\n';
    csv += 'entity_id,property_name,property_type,is_identifier\n';
    for (const entity of currentOntology.entityTypes) {
      for (const prop of entity.properties) {
        csv += `"${entity.id}","${prop.name}","${prop.type}","${prop.isIdentifier || false}"\n`;
      }
    }

    return csv;
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sampleSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    clearCloseTimer();
    const resetRequestId = ++importRequestId.current;
    resetToDefault();
    setImportStatus('success');
    setErrorMessage('');
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      if (resetRequestId === importRequestId.current) closeModal();
    }, 1000);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 650, maxHeight: '85vh', overflow: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>导入 / 导出本体</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              加载本体文件，或导出当前本体
            </p>
          </div>
          <button className="icon-btn" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        {/* Current Ontology Info */}
        <div style={{ 
          padding: 16, 
          background: 'var(--bg-tertiary)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>当前已加载</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{currentOntology.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {currentOntology.entityTypes.length} 种实体类型，{currentOntology.relationships.length} 种关系
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} />
           恢复默认
          </button>
        </div>

        {/* Status Messages */}
        {importStatus === 'success' && (
          <div style={{ 
            padding: 12, 
            background: 'rgba(15, 123, 15, 0.15)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--ms-green)'
          }}>
            <CheckCircle size={18} />
            <span>本体加载成功！</span>
          </div>
        )}

        {importStatus === 'error' && (
          <div style={{ 
            padding: 12, 
            background: 'rgba(209, 52, 56, 0.15)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            color: '#D13438'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Import/Export Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div 
            style={{ 
              padding: 24, 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-primary)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept={LEGACY_FORMATS_ENABLED ? '.json,.rdf,.owl,.iq' : '.rdf,.owl,.iq'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div style={{ 
              width: 48, 
              height: 48, 
              background: 'rgba(0, 120, 212, 0.15)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Upload size={24} color="var(--ms-blue)" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>导入本体</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {LEGACY_FORMATS_ENABLED ? '将 JSON 或 RDF/OWL 文件拖放到此处' : '将 RDF/OWL（.rdf、.owl、.iq）文件拖放到此处'}
            </div>
          </div>

          <div 
            style={{ 
              padding: 24, 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-lg)',
              border: '2px solid transparent',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              width: 48, 
              height: 48, 
              background: 'rgba(15, 123, 15, 0.15)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Download size={24} color="var(--ms-green)" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>导出当前本体</div>
            
            {/* Format Selector — only shown when legacy formats are enabled */}
            {LEGACY_FORMATS_ENABLED && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                <button
                  onClick={() => setExportFormat('json')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 11,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: exportFormat === 'json' ? 'var(--ms-blue)' : 'var(--bg-secondary)',
                    color: exportFormat === 'json' ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <FileJson size={12} />
                  JSON
                </button>
                <button
                  onClick={() => setExportFormat('yaml')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 11,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: exportFormat === 'yaml' ? 'var(--ms-purple)' : 'var(--bg-secondary)',
                    color: exportFormat === 'yaml' ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <FileText size={12} />
                  YAML
                </button>
                <button
                  onClick={() => setExportFormat('csv')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 11,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: exportFormat === 'csv' ? 'var(--ms-green)' : 'var(--bg-secondary)',
                    color: exportFormat === 'csv' ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Table size={12} />
                  CSV
                </button>
                <button
                  onClick={() => setExportFormat('rdf')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 11,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: exportFormat === 'rdf' ? '#E74C3C' : 'var(--bg-secondary)',
                    color: exportFormat === 'rdf' ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="导出 RDF/XML"
                >
                  <Share2 size={12} />
                  RDF
                </button>
              </div>
            )}

            {exportFormat === 'rdf' && rdfDocument && (
              <>
                <SourceFidelityNote className="import-export-source-fidelity-note">
                  <strong>完整保留 RDF：</strong>{' '}
                  {currentCatalogueEntry?.name ?? currentOntology.name} 在进行受支持的语义编辑前，会按原始字节下载。修改后的导出文件仍会保留所有无关的 RDF 语句。
                </SourceFidelityNote>
                <label style={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  fontSize: 11,
                  gap: 6,
                  margin: '8px 0 12px',
                  textAlign: 'left',
                }}>
                  <input
                    type="checkbox"
                    checked={includeDerivationMetadata}
                    onChange={(event) =>
                      setIncludeDerivationMetadata(event.target.checked)}
                  />
                  在导出文件中添加明确的 <code>prov:wasDerivedFrom</code> 语句。这会生成修改后的文件。
                </label>
                {lastRdfExport && (
                  <div style={{
                    fontSize: 10,
                    marginBottom: 12,
                    textAlign: 'left',
                  }}>
                    最近一次导出：{lastRdfExport.kind}；来源语句：
                    {lastRdfExport.sourceTripleCount.toLocaleString()}；
                    导出语句：{lastRdfExport.exportedTripleCount.toLocaleString()}；
                    补丁：{lastRdfExport.patchCount.toLocaleString()}；
                    来源记录：{lastRdfExport.derivationMetadataIncluded ? '已包含' : '未包含'}。
                  </div>
                )}
              </>
            )}

            {exportFormat === 'rdf' && !rdfDocument && (
              <fieldset style={{
                border: 0,
                margin: '0 0 12px',
                padding: 0,
                textAlign: 'left',
              }}>
                <legend style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}>
                  RDF 导出配置
                </legend>
                <button
                  type="button"
                  aria-pressed={rdfExportProfile === 'playground'}
                  onClick={() => setRdfExportProfile('playground')}
                  style={{
                    background: rdfExportProfile === 'playground'
                      ? 'rgba(0, 120, 212, 0.15)'
                      : 'var(--bg-secondary)',
                    border: rdfExportProfile === 'playground'
                      ? '1px solid var(--ms-blue)'
                      : '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'block',
                    marginBottom: 6,
                    padding: 8,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
                    游乐场往返格式
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: 10, marginTop: 2 }}>
                    保留图标、颜色、绑定和其他游乐场元数据。
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={rdfExportProfile === 'standards'}
                  onClick={() => setRdfExportProfile('standards')}
                  style={{
                    background: rdfExportProfile === 'standards'
                      ? 'rgba(0, 120, 212, 0.15)'
                      : 'var(--bg-secondary)',
                    border: rdfExportProfile === 'standards'
                      ? '1px solid var(--ms-blue)'
                      : '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'block',
                    padding: 8,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
                    面向标准的 OWL + SHACL
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: 10, marginTop: 2 }}>
                    使用标准词汇表示顺序、枚举、标识符和基数。
                  </span>
                </button>
              </fieldset>
            )}
            
            <button 
              className="btn btn-primary"
              onClick={() => void handleExport()}
              disabled={isExporting}
              style={{ width: '100%' }}
            >
              {isExporting
                ? '正在准备完整 RDF…'
                : rdfDocument && exportFormat === 'rdf'
                  ? '下载完整 RDF'
                  : LEGACY_FORMATS_ENABLED
                    ? `下载 .${exportFormat}`
                    : '下载 RDF/OWL'}
            </button>
            {exportError && (
              <div role="alert" className="import-status error">
                <AlertCircle size={14} /> {exportError}
              </div>
            )}

            {onFabricPush && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={onFabricPush}
                  disabled={Boolean(rdfDocument)}
                  title={rdfDocument
                    ? 'Fabric API 无法完整保留 RDF 源文件，因此当前不可推送。'
                    : undefined}
                  style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Cloud size={14} />
                  推送到 Microsoft Fabric
                </button>
                {rdfDocument && (
                  <SourceFidelityNote className="import-export-source-fidelity-note">
                    Fabric 目前仅接受可视化投影，因此推送此源文件会丢失保留的 RDF 语句。请改为下载完整 RDF。
                  </SourceFidelityNote>
                )}
              </>
            )}
          </div>
        </div>

        {/* Schema Reference — only shown when legacy JSON format is enabled */}
        {LEGACY_FORMATS_ENABLED && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 12 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileJson size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  JSON 架构参考
                </span>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={handleCopySchema}
              >
                <Copy size={12} style={{ marginRight: 4 }} />
                {copied ? '已复制！' : '复制'}
              </button>
            </div>
            <pre style={{ 
              padding: 16, 
              background: 'var(--bg-primary)', 
              borderRadius: 'var(--radius-md)',
              fontSize: 11,
              lineHeight: 1.5,
              overflow: 'auto',
              maxHeight: 200,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)'
            }}>
              {sampleSchema}
            </pre>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={closeModal}>
           完成
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
