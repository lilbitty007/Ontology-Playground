import { motion } from 'framer-motion';
import { X, MousePointer, Target, MessageSquare, Link2, Lightbulb, Command } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>本体游乐场使用指南</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MousePointer size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>探索图谱</span>
            </div>
            <p className="feature-text">
              点击任意<strong>实体类型</strong>（彩色节点），查看其属性、关系和数据绑定。点击<strong>关系连线</strong>，查看实体之间如何关联。使用左下角的控件缩放图谱或重置布局。
              <br /><br />
              超大本体会以限量显示的<strong>语义概览</strong>打开，避免一次绘制所有实体。使用搜索和详情控件浏览层级。标有<strong>+N</strong>的虚线节点表示还有隐藏的邻居；选择该节点，再点击节点旁的<strong>显示邻居</strong>即可展开，且不会移动当前画布上的实体。
              可在语义概览中点击<strong>隐藏已显示的邻居</strong>，收起该节点展开的内容。如果已达到显示上限，概览会说明还有多少邻居未显示；请先收起一个已展开的邻居区域，再展开其他节点。
              更改详情级别会重新显示未聚焦的层级视图、清除当前选择，并收起节点展开内容。点击滑块两侧、拖动滑块或使用方向键，均可调整关系跳数。
              选择实体后，所有可见的相关关系都会显示名称；悬停或选择连线也会显示关系名称。使用“搜索与筛选”仍可定位完整本体中的任意实体。
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Target size={20} color="var(--ms-purple)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>完成任务</span>
            </div>
            <p className="feature-text">
              在左侧面板选择任务，开始引导式探索。按照提示点击指定实体或关系。完成所有步骤即可获得<strong>徽章</strong>和<strong>积分</strong>！
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MessageSquare size={20} color="var(--ms-yellow-fg)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>用自然语言提问</span>
            </div>
            <p className="feature-text">
              在右下方的查询区提问，例如“显示 Gold 等级的顾客”或“哪些产品来自埃塞俄比亚？”。图谱会高亮相关实体和关系。
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Link2 size={20} color="var(--ms-green)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>查看数据绑定</span>
            </div>
            <p className="feature-text">
              选择实体类型后，检查器会显示本体属性如何映射到真实数据源，包括数据湖仓表和语义模型。
            </p>
          </div>

          <div style={{ 
            padding: 16, 
            background: 'rgba(0, 120, 212, 0.1)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Lightbulb size={20} color="var(--ms-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--ms-blue)' }}>关于 Microsoft Fabric IQ 本体</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                本体是可由机器理解、供团队共同使用的业务词汇体系。它定义实体类型（例如 Customer、Product）、属性及其关系。本演示使用虚构的 Fourth Coffee 说明这些概念。
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Command size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>键盘快捷键</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
              <kbd className="help-kbd">⌘K</kbd><span>打开命令面板</span>
              <kbd className="help-kbd">?</kbd><span>打开帮助窗口</span>
              <kbd className="help-kbd">Esc</kbd><span>关闭窗口</span>
              <kbd className="help-kbd">↑ ↓</kbd><span>浏览命令列表</span>
              <kbd className="help-kbd">↵</kbd><span>选择命令</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            知道了
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
