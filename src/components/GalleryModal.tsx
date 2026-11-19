import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, ArrowRight, Search, Code, User, Pencil, Share2, ExternalLink, Scale, FileCheck2, Download } from 'lucide-react';
import { useDesignerStore } from '../store/designerStore';
import { useAppStore } from '../store/appStore';
import { serializeToRDF } from '../lib/rdf/serializer';
import { highlightRdf, RDF_HIGHLIGHT_DARK, RDF_HIGHLIGHT_LIGHT } from '../lib/rdf/highlighter';
import { SourceFidelityNote } from './SourceFidelityNote';
import {
  createCatalogueRdfDocumentReference,
  ensureRdfDocumentReady,
} from '../lib/rdf/document';
import {
  getDesignerScaleError,
  getOntologyDesignerScaleError,
} from '../lib/ontologyScale';
import {
  loadCatalogueEntry,
  loadCatalogueIndex,
  loadCatalogueSource,
  hasCatalogueSourceArtifact,
} from '../lib/catalogue';
import { navigate, parseHash } from '../lib/router';
import { buildOntologyEmbedSnippet } from '../lib/contentSafety';
import type {
  CatalogueEntry,
  LoadedCatalogueEntry,
  LoadedCatalogueSource,
} from '../types/catalogue';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types/catalogue';

interface GalleryModalProps {
  onClose: () => void;
}

type SourceFilter = 'all' | 'official' | 'community' | 'external';
type RdfView = {
  id: string;
  kind: 'original' | 'generated';
};

export function GalleryModal({ onClose }: GalleryModalProps) {
  const { currentOntology, loadOntology } = useAppStore();

  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rdfView, setRdfView] = useState<RdfView | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [copiedEmbedId, setCopiedEmbedId] = useState<string | null>(null);
  const [loadedEntries, setLoadedEntries] = useState<Record<string, LoadedCatalogueEntry>>({});
  const [loadedSources, setLoadedSources] = useState<Record<string, LoadedCatalogueSource>>({});
  const [loadingEntryIds, setLoadingEntryIds] = useState<Set<string>>(new Set());
  const [loadingSourceIds, setLoadingSourceIds] = useState<Set<string>>(new Set());
  const [payloadErrors, setPayloadErrors] = useState<Record<string, string>>({});
  const [sourceErrors, setSourceErrors] = useState<Record<string, string>>({});
  const mountedRef = useRef(false);
  const latestActionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep filters in sync with URL query params (including page refresh + hash navigation)
  useEffect(() => {
    const syncFiltersFromHash = () => {
      const route = parseHash(window.location.hash);
      if (route.page !== 'catalogue' || route.ontologyId) {
        latestActionRef.current++;
        return;
      }
      setCategoryFilter(route.category ?? 'all');
      setSourceFilter((route.source as SourceFilter) ?? 'all');
    };

    syncFiltersFromHash();
    window.addEventListener('hashchange', syncFiltersFromHash);
    return () => window.removeEventListener('hashchange', syncFiltersFromHash);
  }, []);

  // Load only the lightweight catalogue index.
  useEffect(() => {
    let cancelled = false;

    loadCatalogueIndex()
      .then((data) => {
        if (!cancelled) {
          setCatalogue(data.entries);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Derive available categories from loaded data
  const categories = useMemo(() => {
    const cats = new Set(catalogue.map((e) => e.category));
    return Array.from(cats).sort();
  }, [catalogue]);

  // Filter + search
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalogue.filter((entry) => {
      if (sourceFilter !== 'all' && entry.source !== sourceFilter) return false;
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      // Hide school step-by-step entries unless that category is explicitly selected
      if (categoryFilter === 'all' && entry.category === 'school') return false;
      if (q) {
        const haystack = [
          entry.name,
          entry.description,
          entry.author,
          entry.license ?? '',
          entry.version ?? '',
          ...entry.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [catalogue, searchQuery, sourceFilter, categoryFilter]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, sourceFilter, categoryFilter]);

  const visibleEntries = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const handleShowMore = useCallback(() => {
    setVisibleCount((c) => c + 12);
  }, []);

  const getLoadedEntry = useCallback(async (
    entry: CatalogueEntry,
    actionId: number,
  ): Promise<LoadedCatalogueEntry | null> => {
    const cached = loadedEntries[entry.id];
    if (cached) return cached;

    setLoadingEntryIds((current) => new Set(current).add(entry.id));
    setPayloadErrors((current) => {
      const next = { ...current };
      delete next[entry.id];
      return next;
    });

    try {
      const loaded = await loadCatalogueEntry(entry.id);
      if (
        mountedRef.current
        && actionId === latestActionRef.current
      ) {
        setLoadedEntries((current) => ({
          ...current,
          [entry.id]: loaded,
        }));
      }
      return loaded;
    } catch (loadError) {
      if (
        mountedRef.current
        && actionId === latestActionRef.current
      ) {
        setPayloadErrors((current) => ({
          ...current,
          [entry.id]: loadError instanceof Error
            ? loadError.message
            : '加载本体数据失败',
        }));
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoadingEntryIds((current) => {
          const next = new Set(current);
          next.delete(entry.id);
          return next;
        });
      }
    }
  }, [loadedEntries]);

  const handleLoadOntology = async (entry: CatalogueEntry) => {
    const actionId = ++latestActionRef.current;
    if (!await getLoadedEntry(entry, actionId)) return;
    if (!mountedRef.current || actionId !== latestActionRef.current) return;

    // The deep-link effect consumes the cached payload and loads it once.
    navigate({
      page: 'catalogue',
      ontologyId: entry.id,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
    });
  };

  const handleViewGeneratedRdf = async (entry: CatalogueEntry) => {
    if (rdfView?.id === entry.id && rdfView.kind === 'generated') {
      latestActionRef.current++;
      setRdfView(null);
      return;
    }

    const actionId = ++latestActionRef.current;
    const loaded = await getLoadedEntry(entry, actionId);
    if (
      loaded
      && mountedRef.current
      && actionId === latestActionRef.current
    ) {
      setRdfView({ id: entry.id, kind: 'generated' });
    }
  };

  const handleViewOriginalSource = async (entry: CatalogueEntry) => {
    if (rdfView?.id === entry.id && rdfView.kind === 'original') {
      latestActionRef.current++;
      setRdfView(null);
      return;
    }

    const actionId = ++latestActionRef.current;
    const cached = loadedSources[entry.id];
    if (cached) {
      setRdfView({ id: entry.id, kind: 'original' });
      return;
    }

    setLoadingSourceIds((current) => new Set(current).add(entry.id));
    setSourceErrors((current) => {
      const next = { ...current };
      delete next[entry.id];
      return next;
    });
    try {
      const source = await loadCatalogueSource(entry.id);
      if (
        mountedRef.current
        && actionId === latestActionRef.current
      ) {
        setLoadedSources((current) => ({
          ...current,
          [entry.id]: source,
        }));
        setRdfView({ id: entry.id, kind: 'original' });
      }
    } catch (sourceError) {
      if (
        mountedRef.current
        && actionId === latestActionRef.current
      ) {
        setSourceErrors((current) => ({
          ...current,
          [entry.id]: sourceError instanceof Error
            ? sourceError.message
            : '加载原始 RDF 源文件失败',
        }));
      }
    } finally {
      if (mountedRef.current) {
        setLoadingSourceIds((current) => {
          const next = new Set(current);
          next.delete(entry.id);
          return next;
        });
      }
    }
  };

  const handleEditOntology = async (entry: CatalogueEntry) => {
    const actionId = ++latestActionRef.current;
    const loaded = await getLoadedEntry(entry, actionId);
    if (
      !loaded
      || !mountedRef.current
      || actionId !== latestActionRef.current
    ) {
      return;
    }

    const scaleError = getOntologyDesignerScaleError(
      loaded.ontology,
      loaded.name,
    );
    if (scaleError) {
      setPayloadErrors((current) => ({
        ...current,
        [entry.id]: scaleError,
      }));
      return;
    }

    const reference = createCatalogueRdfDocumentReference(loaded);
    if (!reference) {
      loadOntology(loaded.ontology, loaded.bindings, loaded);
      useDesignerStore.getState().loadDraft(loaded.ontology);
      navigate({ page: 'designer' });
      return;
    }

    setLoadingSourceIds((current) => new Set(current).add(entry.id));
    setSourceErrors((current) => {
      const next = { ...current };
      delete next[entry.id];
      return next;
    });
    try {
      const document = await ensureRdfDocumentReady(reference);
      if (
        !mountedRef.current
        || actionId !== latestActionRef.current
      ) {
        return;
      }
      loadOntology(
        loaded.ontology,
        loaded.bindings,
        loaded,
        document,
      );
      useDesignerStore.getState().loadDraft(
        loaded.ontology,
        document,
      );
      navigate({ page: 'designer' });
    } catch (sourceError) {
      if (
        mountedRef.current
        && actionId === latestActionRef.current
      ) {
        setSourceErrors((current) => ({
          ...current,
          [entry.id]: sourceError instanceof Error
            ? sourceError.message
            : '加载完整 RDF 源文件失败',
        }));
      }
    } finally {
      if (mountedRef.current) {
        setLoadingSourceIds((current) => {
          const next = new Set(current);
          next.delete(entry.id);
          return next;
        });
      }
    }
  };

  const handleCopyEmbed = (entry: CatalogueEntry) => {
    const siteUrl = window.location.origin + (import.meta.env.BASE_URL || '/');
    const snippet = buildOntologyEmbedSnippet(entry.id, siteUrl);
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiedEmbedId(entry.id);
      setTimeout(() => setCopiedEmbedId(null), 2000);
    });
  };

  const handleClose = useCallback(() => {
    latestActionRef.current++;
    onClose();
  }, [onClose]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900, maxHeight: '85vh', overflow: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>本体目录</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              浏览并加载目录中的本体
            </p>
          </div>
          <button className="icon-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="按名称、标签、作者或许可证搜索…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => {
              const newSource = e.target.value as SourceFilter;
              setSourceFilter(newSource);
              navigate({
                page: 'catalogue',
                source: newSource !== 'all' ? newSource : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
              });
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          >
            <option value="all">所有来源</option>
            <option value="official">官方</option>
            <option value="external">外部</option>
            <option value="community">社区</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              const newCategory = e.target.value;
              setCategoryFilter(newCategory);
              navigate({
                page: 'catalogue',
                category: newCategory !== 'all' ? newCategory : undefined,
                source: sourceFilter !== 'all' ? sourceFilter : undefined,
              });
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          >
            <option value="all">所有类别</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] ?? cat}
              </option>
            ))}
          </select>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
           正在加载本体目录…
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ms-red, #D13438)' }}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
           没有符合筛选条件的本体。
          </div>
        )}

        {/* Result count */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
           显示 {Math.min(visibleCount, filtered.length)} / {filtered.length} 个本体
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && (
          <>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 16 }}>
            {visibleEntries.map((entry) => {
              const loadedEntry = loadedEntries[entry.id];
              const loadedSource = loadedSources[entry.id];
              const isLoadingEntry = loadingEntryIds.has(entry.id);
              const isLoadingSource = loadingSourceIds.has(entry.id);
              const isActive = currentOntology.name === entry.name;
              const categoryColor = CATEGORY_COLORS[entry.category] ?? '#6B7280';
              const designerScaleError = getDesignerScaleError(
                entry.entityCount + entry.relationshipCount,
                entry.name,
              );
              const showGeneratedRdf =
                rdfView?.id === entry.id
                && rdfView.kind === 'generated'
                && loadedEntry !== undefined;
              const showOriginalSource =
                rdfView?.id === entry.id
                && rdfView.kind === 'original'
                && loadedSource !== undefined;

              return (
                <motion.div
                  key={entry.id}
                  data-catalogue-id={entry.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: 20,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 120, 212, 0.15), rgba(0, 120, 212, 0.05))'
                      : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    border: isActive ? '2px solid var(--ms-blue)' : '2px solid transparent',
                    cursor: isActive || isLoadingEntry || isLoadingSource
                      ? 'default'
                      : 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onClick={() => {
                    if (!isActive && !isLoadingEntry && !isLoadingSource) {
                      void handleLoadOntology(entry);
                    }
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: `${categoryColor}20`,
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                        }}
                      >
                        {entry.icon || '📄'}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{entry.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: categoryColor,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {CATEGORY_LABELS[entry.category] ?? entry.category}
                          </span>
                          {entry.source === 'community' && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                              }}
                            >
                             社区
                            </span>
                          )}
                          {entry.source === 'external' && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                background: 'var(--ms-cyan)',
                                borderRadius: 'var(--radius-sm)',
                                color: '#fff',
                                fontWeight: 500,
                              }}
                            >
                             外部
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          padding: '4px 8px',
                          background: 'var(--ms-blue)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                       当前
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                    {entry.description}
                  </p>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  {entry.author && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: entry.license || entry.sourceUrl || entry.version ? 6 : 12,
                      }}
                    >
                      <User size={12} color="var(--text-tertiary)" />
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{entry.author}</span>
                    </div>
                  )}

                  <CatalogueAttribution entry={entry} />

                  {payloadErrors[entry.id] && (
                    <div
                      role="alert"
                      style={{
                        color: 'var(--error)',
                        fontSize: 12,
                        marginBottom: 10,
                      }}
                    >
                      {payloadErrors[entry.id]}
                    </div>
                  )}

                  {sourceErrors[entry.id] && (
                    <div
                      role="alert"
                      style={{
                        color: 'var(--error)',
                        fontSize: 12,
                        marginBottom: 10,
                      }}
                    >
                      {sourceErrors[entry.id]}
                    </div>
                  )}

                  {entry.source === 'external' && (
                    <SourceFidelityNote className="catalogue-source-fidelity-note">
                      <strong>关于此视图：</strong> 图谱是 RDF 的可视化投影。设计器会保留完整且已验证的 RDF 源码，并仅允许编辑能够精确映射的语句。
                    </SourceFidelityNote>
                  )}

                  {/* Stats + actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0 0',
                      borderTop: '1px solid var(--border-primary)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Layers size={14} color="var(--text-tertiary)" />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {entry.entityCount} 个实体
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowRight size={14} color="var(--text-tertiary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {entry.relationshipCount} 个关系
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {hasCatalogueSourceArtifact(entry) && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: 11 }}
                          title="查看经过哈希校验的原始 RDF 源文件"
                          aria-label={`查看 ${entry.name} 的原始 RDF 源文件`}
                          disabled={isLoadingSource}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleViewOriginalSource(entry);
                          }}
                        >
                          <FileCheck2 size={13} />
                          {isLoadingSource ? '正在加载…' : '完整 RDF'}
                        </button>
                      )}
                      {!hasCatalogueSourceArtifact(entry) && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: 11 }}
                          title={isLoadingEntry
                            ? '正在加载本体数据'
                            : '查看游乐场生成的 RDF'}
                          aria-label={`查看 ${entry.name} 的生成版 RDF`}
                          disabled={isLoadingEntry}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleViewGeneratedRdf(entry);
                          }}
                        >
                          <Code size={13} />
                         生成版 RDF
                        </button>
                      )}
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 8px', fontSize: 11 }}
                        title={copiedEmbedId === entry.id ? '已复制！' : '复制嵌入代码'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyEmbed(entry);
                        }}
                      >
                        <Share2 size={13} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 8px', fontSize: 11 }}
                        title={designerScaleError ?? '在设计器中编辑'}
                        disabled={isLoadingEntry || Boolean(designerScaleError)}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleEditOntology(entry);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      {!isActive && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleLoadOntology(entry);
                          }}
                          disabled={isLoadingEntry}
                        >
                          {isLoadingEntry ? '正在加载…' : '加载'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Original and generated RDF views */}
                  <AnimatePresence>
                    {showOriginalSource && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GalleryOriginalSource
                          entry={entry}
                          source={loadedSource}
                        />
                      </motion.div>
                    )}
                    {showGeneratedRdf && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GalleryRdfSource
                          ontology={loadedEntry.ontology}
                          bindings={loadedEntry.bindings}
                          isSubset={entry.source === 'external'}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 24px', fontSize: 13 }}
                onClick={handleShowMore}
              >
               显示更多（剩余 {filtered.length - visibleCount} 个）
              </button>
            </div>
          )}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            想要参与贡献？请查看{' '}
            <a
              href="https://github.com/microsoft/Ontology-Playground/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--ms-blue, #0078D4)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              <strong>CONTRIBUTING.md</strong>
            </a>
            {' '}——将本体作为 RDF 文件添加，并{' '}
            <a
              href="https://github.com/microsoft/Ontology-Playground/fork"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--ms-blue, #0078D4)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              提交拉取请求
            </a>
            .
          </p>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={handleClose}>
           完成
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CatalogueAttribution({ entry }: { entry: CatalogueEntry }) {
  if (!entry.license && !entry.sourceUrl && !entry.version) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 12,
        fontSize: 11,
        color: 'var(--text-tertiary)',
      }}
    >
      {entry.license && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Scale size={12} aria-hidden="true" />
          许可证：{entry.license}
        </span>
      )}
      {entry.version && <span>版本：{entry.version}</span>}
      {entry.sourceUrl && (
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`查看 ${entry.name} 的上游源项目`}
          onClick={(event) => event.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            color: 'var(--ms-blue, #0078D4)',
            textDecoration: 'underline',
          }}
        >
         上游源项目
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

// ─── Highlighted RDF source (gallery cards) ──────────────────────────────────

function GalleryRdfSource({
  ontology,
  bindings,
  isSubset,
}: {
  ontology: Parameters<typeof serializeToRDF>[0];
  bindings: Parameters<typeof serializeToRDF>[1];
  isSubset: boolean;
}) {
  const darkMode = useAppStore((s) => s.darkMode);
  const hlTheme = darkMode ? RDF_HIGHLIGHT_DARK : RDF_HIGHLIGHT_LIGHT;
  const rdf = useMemo(() => serializeToRDF(ontology, bindings), [ontology, bindings]);
  const highlighted = useMemo(() => highlightRdf(rdf, hlTheme), [rdf, hlTheme]);

  return (
    <div style={{ marginTop: 12 }}>
      <strong style={{ display: 'block', fontSize: 12 }}>
        {isSubset
          ? '游乐场生成的 RDF 子集'
          : '游乐场生成的 RDF'}
      </strong>
      <p style={{ margin: '4px 0 8px', fontSize: 11, color: 'var(--text-secondary)' }}>
        {isSubset
          ? '此内容根据可视化模型生成，并非完整的上游本体。它包含已映射的类、对象属性、子类关系和本体元数据。仅存在于源文件中的 RDF 会保留在已审核源文件中；导入项只记录，不会获取。'
          : '此内容根据游乐场可视化模型和数据绑定生成。'}
      </p>
      <RdfCodeBlock>{highlighted}</RdfCodeBlock>
    </div>
  );
}

const ORIGINAL_SOURCE_PREVIEW_CHARACTERS = 200_000;

function GalleryOriginalSource({
  entry,
  source,
}: {
  entry: CatalogueEntry;
  source: LoadedCatalogueSource;
}) {
  const preview = source.text.slice(0, ORIGINAL_SOURCE_PREVIEW_CHARACTERS);
  const previewIsTruncated = preview.length < source.text.length;

  const handleDownload = () => {
    const bytes = new Uint8Array(source.bytes.byteLength);
    bytes.set(source.bytes);
    const blob = new Blob([bytes.buffer], { type: source.mediaType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${entry.id.replaceAll('/', '-')}-original.rdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong style={{ fontSize: 12 }}>已审核的原始 RDF 源文件</strong>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 8px', fontSize: 11 }}
          type="button"
          onClick={handleDownload}
        >
          <Download size={12} />
         下载已校验的源文件
        </button>
      </div>
      <p style={{ margin: '4px 0', fontSize: 11, color: 'var(--text-secondary)' }}>
        与目录中的原始字节完全一致；显示前已校验 SHA-256 和字节长度。SHACL 规则及不支持的三元组仅作为源数据保留，不会执行；导入项也不会被解析或访问。
      </p>
      {previewIsTruncated && (
        <p style={{ margin: '4px 0', fontSize: 11, color: 'var(--text-secondary)' }}>
         预览仅显示前 {ORIGINAL_SOURCE_PREVIEW_CHARACTERS.toLocaleString()} 个字符。下载已校验的文件以获取完整源内容。
        </p>
      )}
      <code style={{ display: 'block', marginBottom: 8, fontSize: 10, color: 'var(--text-tertiary)' }}>
        {source.sourceArtifactUrl}
        <br />
        {source.hash}
      </code>
      <RdfCodeBlock>{preview}</RdfCodeBlock>
    </div>
  );
}

function RdfCodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      style={{
        padding: 12,
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        fontSize: 11,
        lineHeight: 1.5,
        overflow: 'auto',
        maxHeight: 250,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </pre>
  );
}
