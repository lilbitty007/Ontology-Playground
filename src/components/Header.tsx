import { useState, useRef, useEffect } from 'react';
import { useAppStore, THEME_OPTIONS } from '../store/appStore';
import { useRoute } from '../hooks/useRoute';
import { currentRoute, routeToHash } from '../lib/router';
import { encodeSharePayload } from '../lib/shareCodec';
import { serializeToRDF } from '../lib/rdf/serializer';
import {
  exportRdfDocument,
  isSameRdfDocumentRevision,
} from '../lib/rdf/document';
import { Palette, Check, Database, Trophy, HelpCircle, FileJson, LayoutGrid, Sparkles, FileText, Share2, PenTool, BookOpen, Menu, X, Download, Info } from 'lucide-react';

interface HeaderProps {
  onAboutClick: () => void;
  onHelpClick: () => void;
  onDataSourcesClick: () => void;
  onImportExportClick: () => void;
  onGalleryClick: () => void;
  onDesignerClick: () => void;
  onLearnClick: () => void;
  onNLBuilderClick?: () => void;
  onSummaryClick: () => void;
}

export function Header({ onAboutClick, onHelpClick, onDataSourcesClick, onImportExportClick, onGalleryClick, onDesignerClick, onLearnClick, onNLBuilderClick, onSummaryClick }: HeaderProps) {
  const {
    theme,
    setTheme,
    totalPoints,
    earnedBadges,
    currentOntology,
    currentCatalogueEntry,
    dataBindings,
    rdfDocument,
  } = useAppStore();
  const route = useRoute();
  const routeIdentity = routeToHash(route);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'downloaded'>('idle');
  const [shareError, setShareError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const shareRequestId = useRef(0);
  const mounted = useRef(true);

  const ontologyDisplayName = currentOntology.name || '未命名本体';

  const shareableId = (
    route.page === 'catalogue'
    && route.ontologyId
    && currentCatalogueEntry?.id === route.ontologyId
    && (
      !rdfDocument
      || (
        rdfDocument.source.origin === 'catalogue'
        && rdfDocument.source.catalogueId === route.ontologyId
      )
    )
  )
    ? route.ontologyId
    : null;

  const handleShare = async () => {
    if (shareStatus === 'copying') return;
    const requestId = ++shareRequestId.current;
    const ontologyAtStart = currentOntology;
    const documentAtStart = rdfDocument;
    let acceptedRoute = routeToHash(currentRoute());
    const isCurrentRequest = () => {
      const activeState = useAppStore.getState();
      return mounted.current
        && requestId === shareRequestId.current
        && routeToHash(currentRoute()) === acceptedRoute
        && activeState.currentOntology === ontologyAtStart
        && isSameRdfDocumentRevision(
          activeState.rdfDocument,
          documentAtStart,
        );
    };
    setShareError(null);
    try {

      if (shareableId) {
        // Catalogue ontology — use the short deep link
        const url = `${window.location.origin}${window.location.pathname}#/catalogue/${shareableId}`;
        if (!isCurrentRequest()) return;
        await navigator.clipboard.writeText(url);
        if (!isCurrentRequest()) return;
        setShareStatus('copied');
        setTimeout(() => {
          if (isCurrentRequest()) setShareStatus('idle');
        }, 2000);
        return;
      }

      if (rdfDocument) {
        setShareStatus('copying');
        const result = await exportRdfDocument(rdfDocument);
        if (!isCurrentRequest()) return;
        const blob = new Blob(
          [result.bytes.slice().buffer],
          { type: result.mediaType },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentOntology.name.toLowerCase().replace(/\s+/g, '-')}-${result.kind === 'original' ? 'original' : 'derived'}.rdf`;
        document.body.appendChild(link);
        if (!isCurrentRequest()) {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShareStatus('downloaded');
        setTimeout(() => {
          if (isCurrentRequest()) setShareStatus('idle');
        }, 3000);
        return;
      }

      // Custom ontology — compress and encode into a share URL
      setShareStatus('copying');
      const encoded = await encodeSharePayload(currentOntology, dataBindings);
      if (!isCurrentRequest()) return;
      if (encoded) {
        const url = `${window.location.origin}${window.location.pathname}#/share/${encoded}`;
        if (!isCurrentRequest()) return;
        await navigator.clipboard.writeText(url);
        if (!isCurrentRequest()) return;
        const shareRoute = routeToHash({ page: 'share', data: encoded });
        history.replaceState(null, '', shareRoute);
        acceptedRoute = shareRoute;
        setShareStatus('copied');
        setTimeout(() => {
          if (isCurrentRequest()) setShareStatus('idle');
        }, 2000);
      } else {
        // Too large for URL — download the RDF file instead
        const content = serializeToRDF(currentOntology, dataBindings);
        const blob = new Blob([content], { type: 'application/rdf+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentOntology.name.toLowerCase().replace(/\s+/g, '-')}-ontology.rdf`;
        document.body.appendChild(link);
        if (!isCurrentRequest()) {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShareStatus('downloaded');
        setTimeout(() => {
          if (isCurrentRequest()) setShareStatus('idle');
        }, 3000);
      }
    } catch (error) {
      if (!isCurrentRequest()) return;
      setShareStatus('idle');
      setShareError(
        error instanceof Error ? error.message : '无法分享 RDF',
      );
    }
  };

  useEffect(() => () => {
    mounted.current = false;
    shareRequestId.current += 1;
  }, []);

  useEffect(() => {
    shareRequestId.current += 1;
    setShareStatus('idle');
    setShareError(null);
  }, [
    currentOntology,
    rdfDocument?.id,
    rdfDocument?.revision,
    routeIdentity,
  ]);

  const shareLabel = shareStatus === 'copied' ? '已复制！' : shareStatus === 'downloaded' ? 'RDF 已下载' : shareStatus === 'copying' ? '正在编码…' : '分享';

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close theme menu when clicking outside
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [themeMenuOpen]);

  const menuAction = (fn: () => void) => () => { setMenuOpen(false); fn(); };

  return (
    <header className="header">
      <div className="header-logo">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="4" fill="#0078D4"/>
          <path d="M8 8H15V15H8V8Z" fill="white"/>
          <path d="M17 8H24V15H17V8Z" fill="white" opacity="0.7"/>
          <path d="M8 17H15V24H8V17Z" fill="white" opacity="0.7"/>
          <path d="M17 17H24V24H17V17Z" fill="white" opacity="0.5"/>
        </svg>
        <div>
          <span className="header-title">
            本体游乐场 <span className="header-title-preview">（预览）</span>
          </span>
          <span className="header-context">{ontologyDisplayName}</span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-item">
          <Trophy size={18} />
          <span className="stat-value">{totalPoints}</span>
          <span>积分</span>
        </div>
        <div className="stat-item">
          <span style={{ fontSize: 18 }}>🏆</span>
          <span className="stat-value">{earnedBadges.length}</span>
          <span>枚徽章</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-text-btn"
          onClick={handleShare}
          title={shareableId ? '复制此本体的分享链接' : '通过链接分享此本体'}
          style={shareStatus === 'copied' ? { color: 'var(--ms-green, #107C10)' } : shareStatus === 'downloaded' ? { color: 'var(--ms-blue, #0078D4)' } : undefined}
        >
          {shareStatus === 'downloaded' ? <Download size={16} /> : <Share2 size={16} />}
          <span>{shareLabel}</span>
        </button>
        {shareError && <span role="alert">{shareError}</span>}
        <button className="header-text-btn" onClick={onSummaryClick} title="查看本体摘要">
          <FileText size={16} />
          <span>摘要</span>
        </button>
        {onNLBuilderClick && (
          <button className="icon-btn" onClick={onNLBuilderClick} data-tooltip="AI 本体生成器" aria-label="AI 本体生成器">
            <Sparkles size={20} />
          </button>
        )}
        <button className="icon-btn" onClick={onGalleryClick} data-tooltip="本体目录" aria-label="本体目录">
          <LayoutGrid size={20} />
        </button>
        <button className="icon-btn" onClick={onDesignerClick} data-tooltip="本体设计器" aria-label="本体设计器">
          <PenTool size={20} />
        </button>
        <button className="icon-btn" onClick={onLearnClick} data-tooltip="本体学堂" aria-label="本体学堂">
          <BookOpen size={20} />
        </button>
        <button className="icon-btn" onClick={onImportExportClick} data-tooltip="导入 / 导出" aria-label="导入 / 导出">
          <FileJson size={20} />
        </button>
        <button className="icon-btn" onClick={onHelpClick} data-tooltip="帮助" aria-label="帮助">
          <HelpCircle size={20} />
        </button>
        <button className="icon-btn" onClick={onAboutClick} data-tooltip="关于" aria-label="关于">
          <Info size={20} />
        </button>
        <button className="icon-btn" onClick={onDataSourcesClick} data-tooltip="数据源" aria-label="数据源">
          <Database size={20} />
        </button>
        <div className="theme-picker" ref={themeMenuRef}>
          <button
            className="icon-btn"
            onClick={() => setThemeMenuOpen((o) => !o)}
            data-tooltip="主题"
            aria-label="主题"
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
          >
            <Palette size={20} />
          </button>
          {themeMenuOpen && (
            <div className="theme-menu" role="menu">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`theme-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={() => { setTheme(opt.id); setThemeMenuOpen(false); }}
                  role="menuitemradio"
                  aria-checked={theme === opt.id}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {opt.label}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger menu */}
      <div className="header-mobile-menu" ref={menuRef}>
        <button className="icon-btn header-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <div className="mobile-menu-dropdown">
            <div className="mobile-menu-stats">
              <Trophy size={16} />
              <span className="stat-value">{totalPoints}</span>
              <span>积分</span>
              <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>·</span>
              <span>🏆</span>
              <span className="stat-value">{earnedBadges.length}</span>
              <span>枚徽章</span>
            </div>
            <button
              className="mobile-menu-item"
              onClick={() => {
                setMenuOpen(false);
                void handleShare();
              }}
            >
              <Share2 size={18} /> {shareLabel}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onSummaryClick)}>
              <FileText size={18} /> 摘要
            </button>
            {onNLBuilderClick && (
              <button className="mobile-menu-item" onClick={menuAction(onNLBuilderClick)}>
                <Sparkles size={18} /> AI 本体生成器
              </button>
            )}
            <button className="mobile-menu-item" onClick={menuAction(onGalleryClick)}>
              <LayoutGrid size={18} /> 本体目录
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDesignerClick)}>
              <PenTool size={18} /> 本体设计器
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onLearnClick)}>
              <BookOpen size={18} /> 本体学堂
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onImportExportClick)}>
              <FileJson size={18} /> 导入 / 导出
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onHelpClick)}>
              <HelpCircle size={18} /> 帮助
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onAboutClick)}>
              <Info size={18} /> 关于
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDataSourcesClick)}>
              <Database size={18} /> 数据源
            </button>
            <div className="mobile-menu-themes">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`mobile-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={menuAction(() => setTheme(opt.id))}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {opt.label}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
