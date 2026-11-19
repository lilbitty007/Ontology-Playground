import { useState, type FormEvent } from 'react';
import type { GraphView } from '../lib/graphView';
import { SemanticDepthSlider } from './SemanticDepthSlider';

interface LargeGraphControlsProps {
  graphView: GraphView;
  totalNodeCount: number;
  totalEdgeCount: number;
  searchInput: string;
  appliedSearch: string;
  depth: number;
  maxDepth: number;
  canReset: boolean;
  selectedEntity: {
    name: string;
    hiddenNeighborCount: number;
    isExpanded: boolean;
    canExpand: boolean;
  } | null;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onDepthChange: (depth: number) => void;
  onExpandSelectedEntity: () => void;
  onCollapseSelectedEntity: () => void;
  onShowOverview: () => void;
}

export function LargeGraphControls({
  graphView,
  totalNodeCount,
  totalEdgeCount,
  searchInput,
  appliedSearch,
  depth,
  maxDepth,
  canReset,
  selectedEntity,
  onSearchInputChange,
  onSearch,
  onDepthChange,
  onExpandSelectedEntity,
  onCollapseSelectedEntity,
  onShowOverview,
}: LargeGraphControlsProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <section
      className={`large-graph-panel${collapsed ? ' large-graph-panel--collapsed' : ''}`}
      aria-label="大型本体控件"
    >
      <div className="large-graph-header">
        <div>
          <div className="large-graph-title">语义概览</div>
          <div className="large-graph-tier">聚焦层级视图</div>
        </div>
        <button
          type="button"
          className="large-graph-collapse"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? '展开' : '收起'}
        </button>
      </div>

      {!collapsed && (
        <>
          <p className="large-graph-counts" aria-live="polite">
            正在显示 {graphView.visibleNodeCount.toLocaleString()} /{' '}
            {totalNodeCount.toLocaleString()} 个实体，以及{' '}
            {graphView.visibleEdgeCount.toLocaleString()} /{' '}
            {totalEdgeCount.toLocaleString()} 个关系。
          </p>

          <form className="large-graph-search" onSubmit={handleSubmit}>
            <label htmlFor="large-graph-search">定位实体</label>
            <div>
              <input
                id="large-graph-search"
                type="search"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="名称、ID 或关键词"
              />
              <button type="submit">查找</button>
            </div>
          </form>

          <div className="large-graph-options">
            <div className="large-graph-detail-header">
              <label htmlFor="large-graph-depth">
                详情：<strong>{depth} 跳</strong>
                <span className="large-graph-depth-max">
                  {' '}· 最多 {maxDepth}
                </span>
              </label>
              <button
                type="button"
                disabled={!canReset}
                onClick={onShowOverview}
              >
               重置视图
              </button>
            </div>
            <SemanticDepthSlider
              id="large-graph-depth"
              max={maxDepth}
              value={depth}
              disabled={maxDepth <= 1}
              onDepthChange={onDepthChange}
              aria-label={`详情：${depth} 跳`}
              aria-valuetext={`${depth} 跳`}
            />
          </div>

          <div className="large-graph-selection-action">
            {selectedEntity?.isExpanded ? (
              <button
                type="button"
                aria-label={`隐藏 ${selectedEntity.name} 已显示的邻居`}
                onClick={onCollapseSelectedEntity}
              >
               隐藏已显示的邻居
              </button>
            ) : selectedEntity
              && selectedEntity.hiddenNeighborCount > 0
              ? (
                <button
                  type="button"
                  disabled={!selectedEntity.canExpand}
                  aria-label={`显示 ${selectedEntity.name} 的 ${selectedEntity.hiddenNeighborCount} 个隐藏邻居`}
                  onClick={onExpandSelectedEntity}
                >
                  显示 {selectedEntity.hiddenNeighborCount.toLocaleString()} 个隐藏邻居
                </button>
              ) : (
                <button type="button" disabled>
                  {!selectedEntity
                    ? '选择带 +N 标记的实体以显示邻居'
                    : '此实体没有隐藏邻居'}
                </button>
              )}
          </div>
          <div className="large-graph-status" aria-live="polite">
            {selectedEntity
              && selectedEntity.hiddenNeighborCount > 0
              && !selectedEntity.canExpand ? (
                <p className="large-graph-warning" role="status">
                  {selectedEntity.hiddenNeighborCount.toLocaleString()}{' '}
                  {selectedEntity.hiddenNeighborCount === 1
                    ? '个邻居仍被隐藏'
                    : '个邻居仍被隐藏'}。当前已达到 {graphView.visibleNodeCount.toLocaleString()} 个实体的显示上限。请先收起一个已显示的邻居区域。
                </p>
              ) : appliedSearch && graphView.searchMatchCount > 0 ? (
                <p className="large-graph-result">
                  找到 {graphView.searchMatchCount.toLocaleString()} 个匹配实体。
                </p>
              ) : appliedSearch ? (
                <p className="large-graph-warning" role="alert">
                  未找到匹配实体，当前显示层级根节点。
                </p>
              ) : null}
          </div>
          <p className="large-graph-hint">
            选择带虚线边框的“+N”实体，可在节点旁展开其邻居。你可以在此收起已显示的邻居区域，也可以选择其他“+N”实体继续浏览。选择实体后，其可见关系也会显示名称。
          </p>
        </>
      )}
    </section>
  );
}
