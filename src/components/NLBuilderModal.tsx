import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Check, AlertCircle, Edit3, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { validateGeneratedOntology } from '../lib/ontologyValidation';
import type { ValidationError } from '../store/designerStore';
import type { Ontology } from '../data/ontology';
import { buildApiUrl } from '../lib/api';
import {
  GENERATION_TIMEOUT_MS,
  MAX_DESCRIPTION_LENGTH,
  generationRequestError,
  matchesGenerationConnector,
  parseGenerationConnector,
  type GenerationConnector,
} from '../lib/generationConnector';
import {
  parseOntologyValue,
  type OntologySchemaIssue,
} from '../lib/ontologySchema';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface NLBuilderModalProps {
  onClose: () => void;
}

type Step = 'input' | 'loading' | 'preview' | 'error';

const MAX_DISPLAYED_VALIDATION_ERRORS = 5;
const DEFAULT_ENTITY_COLORS = [
  '#0078D4',
  '#107C10',
  '#5C2D91',
  '#FFB900',
  '#D83B01',
  '#00A9E0',
  '#8764B8',
  '#00B294',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatErrors(
  prefix: string,
  errors: readonly (ValidationError | OntologySchemaIssue)[],
): string {
  const shown = errors.slice(0, MAX_DISPLAYED_VALIDATION_ERRORS).map((e) => `• ${e.message}`);
  const remaining = errors.length - shown.length;
  const suffix = remaining > 0 ? `\n…and ${remaining} more` : '';
  return `${prefix}:\n${shown.join('\n')}${suffix}`;
}

function parseBuilderOntology(value: unknown): Ontology {
  const result = parseOntologyValue(value, {
    defaultEntityColors: DEFAULT_ENTITY_COLORS,
  });
  if (!result.ontology) {
    throw new Error(formatErrors(
      'Ontology structure is invalid',
      result.issues,
    ));
  }
  return result.ontology;
}

function formatValidationErrors(errors: ValidationError[]): string {
  return formatErrors('Generated ontology failed validation', errors);
}

export function NLBuilderModal({ onClose }: NLBuilderModalProps) {
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [generatedOntology, setGeneratedOntology] = useState<Ontology | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedJson, setEditedJson] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const [connector, setConnector] = useState<GenerationConnector | null>(null);
  const [connectorError, setConnectorError] = useState<string | null>(null);
  const [connectorReload, setConnectorReload] = useState(0);
  const [consent, setConsent] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);

  const cancelRequest = () => {
    requestVersion.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
  };

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, GENERATION_TIMEOUT_MS);
    void (async () => {
      try {
        const response = await fetch(buildApiUrl('generation-connector'), {
          credentials: 'include',
          headers: { 'X-Ontology-Request': 'generate' },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (requestVersion.current !== version) return;
        if (response.status !== 200) throw new Error(generationRequestError(response.status));
        const metadata = parseGenerationConnector(await response.json());
        if (requestVersion.current === version && !controller.signal.aborted) setConnector(metadata);
      } catch (err) {
        if (requestVersion.current !== version || (controller.signal.aborted && !timedOut)) return;
        setConnectorError(timedOut
          ? 'Loading the generation connector timed out. Reload the connector to try again.'
          : err instanceof Error && err.message.startsWith('Generation')
            ? err.message
            : 'Generation connector could not be loaded. Check your connection or contact your administrator.');
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      requestVersion.current += 1;
      requestRef.current?.abort();
      clearTimeout(timeout);
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
      recognitionRef.current = null;
    };
  }, [connectorReload]);

  const reloadConnector = () => {
    cancelRequest();
    setConnector(null);
    setConsent(false);
    setConnectorError(null);
    setError(null);
    setStep('input');
    setConnectorReload(value => value + 1);
  };
  
  const loadOntology = useAppStore((state) => state.loadOntology);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognitionAPI);
  }, []);

  const startRecording = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setVoiceError('Speech recognition not supported');
      return;
    }

    setVoiceError(null);
    shouldKeepListeningRef.current = true;
    setIsRecording(true);
    
    const createRecognition = () => {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false; // Use non-continuous mode and restart manually
      recognition.interimResults = false; // Only get final results
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!shouldKeepListeningRef.current) return;
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription(prev => prev + transcript + ' ');
        }
      };

      recognition.onerror = (event) => {
        if (!shouldKeepListeningRef.current) return;
        const errorEvent = event as Event & { error?: string };
        
        // Handle specific errors
        if (errorEvent.error === 'network') {
          setVoiceError('Network error - try Chrome or Safari');
          shouldKeepListeningRef.current = false;
          setIsRecording(false);
          return;
        }
        
        if (errorEvent.error === 'service-not-allowed' || errorEvent.error === 'not-allowed') {
          setVoiceError('Microphone access denied');
          shouldKeepListeningRef.current = false;
          setIsRecording(false);
          return;
        }
        
        // Don't stop on no-speech, just restart
        if (errorEvent.error === 'no-speech' && shouldKeepListeningRef.current) {
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              recognitionRef.current = createRecognition();
            }
          }, 100);
          return;
        }
        
        if (errorEvent.error !== 'aborted') {
          setVoiceError('Voice input failed. Please type your description or try again.');
          shouldKeepListeningRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current) {
          // Restart with a fresh instance - use longer delay for Edge
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              recognitionRef.current = createRecognition();
            }
          }, 200);
        } else {
          setIsRecording(false);
        }
      };

      try {
        recognition.start();
      } catch {
        setVoiceError('Failed to start - try Chrome or Safari');
        shouldKeepListeningRef.current = false;
        setIsRecording(false);
      }
      
      return recognition;
    };
    
    recognitionRef.current = createRecognition();
  };

  const stopRecording = () => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleGenerate = async () => {
    if (!description.trim() || description.length > MAX_DESCRIPTION_LENGTH || !connector || !consent) return;
    stopRecording();
    cancelRequest();
    const controller = new AbortController();
    const version = requestVersion.current;
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, GENERATION_TIMEOUT_MS);
    setStep('loading');
    setError(null);
    
    try {
      const response = await fetch(buildApiUrl('generate-ontology'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Ontology-Request': 'generate' },
        signal: controller.signal,
        body: JSON.stringify({
          description: description.trim(),
          connectorId: connector.id,
          revision: connector.revision,
        }),
      });
      if (requestVersion.current !== version || controller.signal.aborted) return;
      if (!response.ok) {
        if (response.status === 409) {
          setConnector(null);
          setConsent(false);
          throw new Error('The generation connector changed. Reload the connector and consent again before generating.');
        }
        if ([401, 403, 404, 503].includes(response.status)) {
          setConnector(null);
          setConsent(false);
        }
        throw new Error(generationRequestError(response.status));
      }
      
      const data: unknown = await response.json();
      if (requestVersion.current !== version || controller.signal.aborted) return;
      if (!isRecord(data) || !matchesGenerationConnector(data.connector, connector)) {
        setConnector(null);
        setConsent(false);
        throw new Error('Generation connector verification failed. Reload the connector and consent again.');
      }
      const ontology = parseBuilderOntology(
        isRecord(data) ? data.ontology : undefined,
      );
      
      const validationErrors = validateGeneratedOntology(ontology);
      if (validationErrors.length > 0) {
        throw new Error(formatValidationErrors(validationErrors));
      }

      setGeneratedOntology(ontology);
      setEditedJson(JSON.stringify(ontology, null, 2));
      setStep('preview');
    } catch (err) {
      if (requestVersion.current !== version || (controller.signal.aborted && !timedOut)) return;
      setError(timedOut
        ? 'Generation timed out. No automatic retry was made.'
        : err instanceof Error && (err.message.startsWith('Generation')
          || err.message.startsWith('The generation')
          || err.message.startsWith('Ontology')
          || err.message.startsWith('Generated ontology'))
          ? err.message
          : 'Failed to generate ontology. Check your connection and try again.');
      setStep('error');
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleApply = () => {
    if (!generatedOntology) return;
    
    try {
      const candidate: unknown = editMode
        ? JSON.parse(editedJson)
        : generatedOntology;
      const ontologyToApply = parseBuilderOntology(candidate);
      const validationErrors = validateGeneratedOntology(ontologyToApply);
      if (validationErrors.length > 0) {
        setError(formatValidationErrors(validationErrors));
        return;
      }
      loadOntology(ontologyToApply);
      handleClose();
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? 'Invalid JSON in editor'
          : err instanceof Error
            ? err.message
            : 'Invalid ontology in editor',
      );
    }
  };

  const handleClose = () => {
    cancelRequest();
    shouldKeepListeningRef.current = false;
    stopRecording();
    setDescription('');
    setStep('input');
    setGeneratedOntology(null);
    setError(null);
    setEditMode(false);
    setConsent(false);
    onClose();
  };

  const examplePrompts = [
    '我经营一家医院，包含医生、患者和科室。患者会预约并就诊。',
    '一个电商平台，包含商品、客户、订单和评价，客户可以退货。',
    '一所大学，包含学生、教授、课程和院系，学生可以选修课程。',
    '一家连锁餐厅，包含门店、员工、菜单项目，以及顾客订单和预约。',
  ];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="modal-content nl-builder-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h2>描述你的本体</h2>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="关闭本体生成器">
            <X size={20} />
          </button>
        </div>

            {step === 'input' && (
              <div className="nl-builder-content">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  用自然语言描述你的业务场景，也可以使用语音输入。AI 会提取实体、关系和属性来创建本体。
                </p>

                {connector ? (
                  <div className="generation-connector-disclosure">
                    <p>当前生成连接器：<strong>{connector.name}</strong></p>
                    <p>服务提供方地址：<code>{connector.destination}</code></p>
                    <label>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={event => setConsent(event.target.checked)}
                      />
                      我同意将描述发送给位于 {connector.destination} 的 {connector.name}。
                    </label>
                    <p>只有点击“生成本体”后，描述才会发送到此连接器。</p>
                  </div>
                ) : connectorError ? (
                  <div role="alert">
                    <p>{connectorError}</p>
                    <button onClick={reloadConnector}>重新加载连接器</button>
                  </div>
                ) : (
                  <p role="status">正在加载生成连接器…</p>
                )}
                {voiceSupported && (
                  <p>语音输入使用浏览器的语音服务，音频可能会由该服务单独进行远程处理，与生成连接器无关。</p>
                )}
                
                <p id="generation-description-warning">请勿输入密码、密钥或敏感个人信息。</p>
                <div className="nl-input-wrapper">
                  <textarea
                    className="nl-input-textarea"
                    aria-describedby="generation-description-warning"
                    placeholder="描述你的业务场景…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                  {voiceSupported && (
                    <button
                      className={`voice-btn ${isRecording ? 'recording' : ''}`}
                      onClick={toggleRecording}
                      title={isRecording ? '停止录音' : '开始语音输入'}
                      type="button"
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}
                </div>
                <p aria-live="polite">
                  {description.length} / {MAX_DESCRIPTION_LENGTH} 个字符
                </p>
                {description.length > MAX_DESCRIPTION_LENGTH && (
                  <p role="alert">描述最多可输入 {MAX_DESCRIPTION_LENGTH} 个字符，语音输入也计入其中。</p>
                )}
                
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot" />
                    正在聆听…请说出本体描述
                  </div>
                )}
                
                {voiceError && (
                  <div className="voice-error" style={{ color: 'var(--accent-red)', fontSize: '13px', marginTop: '8px' }}>
                    ⚠️ {voiceError}
                  </div>
                )}

                <div className="example-prompts">
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>试试这些示例：</span>
                  <div className="example-chips">
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={i}
                        className="example-chip"
                        onClick={() => setDescription(prompt)}
                      >
                        {prompt.slice(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="nl-generate-btn"
                  onClick={handleGenerate}
                  disabled={!description.trim() || description.length > MAX_DESCRIPTION_LENGTH || !connector || !consent}
                >
                  <Sparkles size={16} />
                  生成本体
                  <Send size={16} />
                </button>
              </div>
            )}

            {step === 'loading' && (
              <div className="nl-builder-content nl-loading">
                <Loader2 size={48} className="spin" style={{ color: 'var(--accent)' }} />
                <p>正在分析描述…</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  正在提取实体、关系和属性
                </p>
                <button className="btn-secondary" onClick={() => {
                  cancelRequest();
                  setConsent(false);
                  setStep('input');
                }}>← 返回</button>
              </div>
            )}

            {step === 'preview' && generatedOntology && (
              <div className="nl-builder-content nl-preview">
                <div className="preview-header">
                  <h3>{generatedOntology.name}</h3>
                  <button 
                    className={`edit-toggle ${editMode ? 'active' : ''}`}
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit3 size={14} />
                    {editMode ? '预览' : '编辑 JSON'}
                  </button>
                </div>

                {editMode ? (
                  <textarea
                    className="json-editor"
                    value={editedJson}
                    onChange={(e) => setEditedJson(e.target.value)}
                    spellCheck={false}
                  />
                ) : (
                  <div className="preview-summary">
                    <div className="preview-section">
                      <h4>实体（{generatedOntology.entityTypes.length}）</h4>
                      <div className="preview-items">
                        {generatedOntology.entityTypes.map((entity) => (
                          <div key={entity.id} className="preview-item entity">
                            <span className="entity-icon">{entity.icon}</span>
                            <span className="entity-name">{entity.name}</span>
                            <span className="entity-props">{entity.properties.length} 个属性</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="preview-section">
                      <h4>关系（{generatedOntology.relationships.length}）</h4>
                      <div className="preview-items">
                        {generatedOntology.relationships.map((rel) => (
                          <div key={rel.id} className="preview-item relationship">
                            <span className="rel-from">{rel.from}</span>
                            <span className="rel-name">→ {rel.name} →</span>
                            <span className="rel-to">{rel.to}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="preview-error">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="preview-actions">
                  <button className="btn-secondary" onClick={() => setStep('input')}>
                    ← 返回
                  </button>
                  <button className="btn-primary" onClick={handleApply}>
                    <Check size={16} />
                    应用本体
                  </button>
                </div>
              </div>
            )}

        {step === 'error' && (
          <div className="nl-builder-content nl-error">
            <AlertCircle size={48} style={{ color: '#FF6B6B' }} />
            <p style={{ color: '#FF6B6B' }}>生成失败</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {error || '发生未知错误'}
            </p>
            <button className="btn-secondary" onClick={connector ? () => setStep('input') : reloadConnector}>
              {connector ? '重试' : '重新加载连接器'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
