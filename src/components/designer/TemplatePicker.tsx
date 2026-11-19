import { designerTemplates } from '../../data/designerTemplates';
import { useDesignerStore } from '../../store/designerStore';

const templateCopy: Record<string, { label: string; description: string }> = {
  retail: { label: '零售', description: '客户、商品和订单' },
  healthcare: { label: '医疗健康', description: '患者、医护人员和就诊记录' },
  finance: { label: '金融', description: '账户、交易和参与方' },
  iot: { label: '物联网', description: '设备、传感器和读数' },
  education: { label: '教育', description: '学生、课程和选课记录' },
};

interface TemplatePickerProps {
  onTemplateSelected?: () => void;
}

export function TemplatePicker({
  onTemplateSelected,
}: TemplatePickerProps = {}) {
  const loadDraft = useDesignerStore((s) => s.loadDraft);

  return (
    <div className="template-picker">
      <div className="template-picker-header">
        <h3>从模板开始</h3>
        <p>选择一个领域快速开始，也可以手动添加实体。</p>
      </div>
      <div className="template-picker-grid">
        {designerTemplates.map((t) => (
          <button
            key={t.id}
            className="template-card"
            onClick={() => {
              loadDraft(t.ontology);
              onTemplateSelected?.();
            }}
          >
            <span className="template-card-icon">{t.icon}</span>
            <span className="template-card-label">{templateCopy[t.id]?.label ?? t.label}</span>
            <span className="template-card-desc">{templateCopy[t.id]?.description ?? t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
