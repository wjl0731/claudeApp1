import { useState, useEffect, useCallback, useRef } from 'react';

const API = 'http://localhost:3001/api';

// ─── Icon helpers ──────────────────────────────────────────────────────────

function Icon({ name, size = 16 }) {
  const icons = {
    wand: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 4-1 1"/><path d="m14.5 7.5-1 1"/><path d="m7 5 1 1"/><path d="m12 2 1 1"/><path d="M3 3l9 9"/><path d="m18 18 3 3"/><path d="M10 10l8 8"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    up: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
    down: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    save: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    left: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    right: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/></svg>,
    type: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    align: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    squares: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  };
  return icons[name] || null;
}

// ─── Node type config ──────────────────────────────────────────────────────

const NODE_TYPES = [
  { id: 'select', label: '单选', icon: 'list', hint: '单选项' },
  { id: 'multi-select', label: '多选', icon: 'squares', hint: '多选项' },
  { id: 'text', label: '文本', icon: 'type', hint: '单行' },
  { id: 'textarea', label: '段落', icon: 'align', hint: '多行' },
];

const ICONS = ['🎯','📸','✈️','✍️','💻','🍳','📢','🏊','📦','🎨','🎵','💡','🔮','⚡','🌟','🎭'];
const CATEGORIES = ['通用','摄影','写作','旅行','开发','生活','营销','设计','教育','商业'];

let _nodeId = Date.now();
const newNodeId = () => 'n_' + (++_nodeId);

function createNode(type = 'select') {
  return {
    id: newNodeId(),
    type,
    label: '',
    description: '',
    placeholder: '',
    options: type === 'select' || type === 'multi-select' ? ['选项一', '选项二'] : [],
    required: false,
  };
}

// ─── Render markdown-like result text ──────────────────────────────────────

function RenderResult({ text }) {
  if (!text) return null;
  // Split into segments: code blocks vs regular text
  const parts = [];
  const codeRegex = /```[\s\S]*?```/g;
  let last = 0;
  let m;
  while ((m = codeRegex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
    parts.push({ type: 'code', content: m[0].replace(/^```[^\n]*\n?/, '').replace(/```$/, '') });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

  return (
    <div className="result-content">
      {parts.map((p, i) =>
        p.type === 'code'
          ? <div key={i} className="result-code-block">{p.content}</div>
          : <span key={i} dangerouslySetInnerHTML={{ __html: p.content
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.+?)`/g, '<code>$1</code>')
            }} />
      )}
    </div>
  );
}

// ─── Individual Node Card (builder) ───────────────────────────────────────

function NodeCard({ node, index, total, onChange, onDelete, onMove }) {
  const [focused, setFocused] = useState(false);

  const update = (field, value) => onChange({ ...node, [field]: value });

  const addOption = () => update('options', [...(node.options || []), '新选项']);
  const deleteOption = (i) => update('options', node.options.filter((_, j) => j !== i));
  const updateOption = (i, val) => {
    const opts = [...(node.options || [])];
    opts[i] = val;
    update('options', opts);
  };

  const hasOptions = node.type === 'select' || node.type === 'multi-select';

  return (
    <div className={`node-card ${focused ? 'focused' : ''}`} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <div className="node-header">
        <div className="node-num">{index + 1}</div>

        {/* Type tabs */}
        <div className="node-type-tabs">
          {NODE_TYPES.map(t => (
            <button key={t.id} className={`node-type-tab ${node.type === t.id ? 'active' : ''}`}
              onClick={() => update('type', t.id)}>
              <Icon name={t.icon} size={12} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="node-actions">
          <button className="node-action-btn" onClick={() => onMove(node.id, -1)} disabled={index === 0} title="上移">
            <Icon name="up" size={14} />
          </button>
          <button className="node-action-btn" onClick={() => onMove(node.id, 1)} disabled={index === total - 1} title="下移">
            <Icon name="down" size={14} />
          </button>
          <button className="node-action-btn del" onClick={() => onDelete(node.id)} title="删除">
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="node-body">
        {/* Label */}
        <div className="node-field">
          <label>问题标签 <span style={{ color: 'var(--accent2)' }}>*</span></label>
          <input className="node-input" value={node.label} onChange={e => update('label', e.target.value)}
            placeholder={`例如：${hasOptions ? '性别选择' : '请描述你的需求'}`} />
        </div>

        {/* Description */}
        <div className="node-field">
          <label>说明提示（可选）</label>
          <input className="node-input" value={node.description} onChange={e => update('description', e.target.value)}
            placeholder="给用户的提示信息..." />
        </div>

        {/* Options */}
        {hasOptions && (
          <div className="node-field">
            <label>选项列表</label>
            <div className="options-list">
              {(node.options || []).map((opt, i) => (
                <div key={i} className="option-row">
                  <input className="node-input" value={opt} onChange={e => updateOption(i, e.target.value)}
                    placeholder={`选项 ${i + 1}`} />
                  <button className="option-del" onClick={() => deleteOption(i)} disabled={(node.options || []).length <= 1}>
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ))}
              <button className="add-option-btn" onClick={addOption}>
                <Icon name="plus" size={12} />
                添加选项
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for text types */}
        {(node.type === 'text' || node.type === 'textarea') && (
          <div className="node-field">
            <label>占位符提示</label>
            <input className="node-input" value={node.placeholder} onChange={e => update('placeholder', e.target.value)}
              placeholder="例如：请输入..." />
          </div>
        )}

        {/* Required toggle */}
        <label className="required-toggle">
          <input type="checkbox" checked={node.required} onChange={e => update('required', e.target.checked)} />
          <span>必填项</span>
        </label>
      </div>
    </div>
  );
}

// ─── Runner Step ───────────────────────────────────────────────────────────

function RunnerStep({ node, answer, onChange }) {
  const hasOptions = node.type === 'select' || node.type === 'multi-select';

  if (node.type === 'select') {
    return (
      <div className="radio-group">
        {(node.options || []).map(opt => (
          <div key={opt} className={`radio-item ${answer === opt ? 'selected' : ''}`} onClick={() => onChange(opt)}>
            <div className="radio-circle">
              {answer === opt && <div className="radio-dot" />}
            </div>
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (node.type === 'multi-select') {
    const selected = Array.isArray(answer) ? answer : [];
    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter(x => x !== opt)
        : [...selected, opt];
      onChange(next);
    };
    return (
      <div className="checkbox-group">
        {(node.options || []).map(opt => (
          <div key={opt} className={`checkbox-item ${selected.includes(opt) ? 'selected' : ''}`} onClick={() => toggle(opt)}>
            <div className="checkbox-box">
              {selected.includes(opt) && <Icon name="check" size={11} />}
            </div>
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (node.type === 'textarea') {
    return (
      <textarea className="runner-input" rows={4}
        value={answer || ''} onChange={e => onChange(e.target.value)}
        placeholder={node.placeholder || '请输入...'} />
    );
  }

  // text
  return (
    <input className="runner-input" type="text"
      value={answer || ''} onChange={e => onChange(e.target.value)}
      placeholder={node.placeholder || '请输入...'} />
  );
}

// ─── Runner Modal ──────────────────────────────────────────────────────────

function RunnerModal({ workflow, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const nodes = workflow.nodes || [];
  const current = nodes[step];
  const progress = nodes.length > 0 ? ((step + 1) / nodes.length) * 100 : 0;
  const isLast = step === nodes.length - 1;

  const canNext = () => {
    if (!current) return false;
    if (!current.required) return true;
    const ans = answers[current.id];
    if (Array.isArray(ans)) return ans.length > 0;
    return ans !== undefined && ans !== null && String(ans).trim() !== '';
  };

  const handleNext = async () => {
    if (isLast) {
      await generate();
    } else {
      setStep(s => s + 1);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: workflow.name, nodes, answers }),
      });
      const data = await res.json();
      setResult(data.result || '生成失败，请重试。');

      // Increment use count if skill has id
      if (workflow.id) {
        fetch(`${API}/skills/${workflow.id}/use`, { method: 'POST' }).catch(() => {});
      }
    } catch {
      setResult('网络错误，请检查服务器连接。');
    } finally {
      setGenerating(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (nodes.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-text"><h2>工作流为空</h2></div>
            <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>请先添加至少一个步骤，再执行工作流。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <h2>{workflow.icon || '🎯'} {workflow.name || '执行工作流'}</h2>
            {!result && !generating && (
              <div className="modal-header-sub">第 {step + 1} 步，共 {nodes.length} 步</div>
            )}
            {result && <div className="modal-header-sub">已完成 · 生成结果</div>}
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div className="modal-body">
          {!generating && !result && (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="step-label">步骤 {step + 1} / {nodes.length}</div>

              <div className="runner-step">
                <div className="runner-step-title">
                  {current.label || '（未命名问题）'}
                  {current.required
                    ? <span className="required-badge">必填</span>
                    : <span className="optional-badge">可选</span>
                  }
                </div>
                {current.description && (
                  <div className="runner-step-desc">{current.description}</div>
                )}
                <RunnerStep
                  node={current}
                  answer={answers[current.id]}
                  onChange={val => setAnswers(a => ({ ...a, [current.id]: val }))}
                />
              </div>
            </>
          )}

          {generating && (
            <div className="generating-overlay">
              <div className="spinner spinner-lg" />
              <h3>AI 正在生成内容...</h3>
              <p>根据你的选择组合最佳提示词，请稍候</p>
            </div>
          )}

          {result && !generating && (
            <div className="result-view">
              <div className="result-view-header">
                <div className="check-icon">
                  <Icon name="check" size={22} />
                </div>
                <h3>生成完成！</h3>
                <p>以下是根据你的配置生成的内容，可直接复制使用</p>
              </div>
              <RenderResult text={result} />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="flex gap-8">
            {!result && step > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>
                <Icon name="left" size={14} /> 上一步
              </button>
            )}
            {result && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>
                <Icon name="refresh" size={14} /> 重新填写
              </button>
            )}
          </div>

          <div className="flex gap-8">
            {result && (
              <button className="btn btn-success btn-sm" onClick={copyResult}>
                {copied ? <><Icon name="check" size={14} /> 已复制</> : <><Icon name="copy" size={14} /> 复制结果</>}
              </button>
            )}
            {!result && !generating && (
              <button className="btn btn-primary" onClick={handleNext} disabled={!canNext()}>
                {isLast ? <><Icon name="sparkles" size={14} /> 生成</> : <>下一步 <Icon name="right" size={14} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Save Modal ────────────────────────────────────────────────────────────

function SaveModal({ workflow, onSave, onClose }) {
  const [name, setName] = useState(workflow.name || '');
  const [desc, setDesc] = useState(workflow.description || '');
  const [icon, setIcon] = useState(workflow.icon || '🎯');
  const [category, setCategory] = useState(workflow.category || '通用');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), description: desc, icon, category });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal save-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <h2>{workflow.id ? '更新技能' : '保存为技能'}</h2>
            <div className="modal-header-sub">保存后可在技能库中随时调用</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>技能名称 <span style={{ color: 'var(--accent2)' }}>*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：泳装写真工作流..." />
          </div>
          <div className="form-group">
            <label>技能描述</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="简单描述这个工作流的用途..." rows={2} />
          </div>
          <div className="form-group">
            <label>分类</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>图标</label>
            <div className="icon-picker">
              {ICONS.map(ic => (
                <div key={ic} className={`icon-opt ${icon === ic ? 'active' : ''}`} onClick={() => setIcon(ic)}>{ic}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? <><div className="spinner" /> 保存中...</> : <><Icon name="save" size={14} /> 保存技能</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [workflow, setWorkflow] = useState({ id: null, name: '', description: '', icon: '🎯', category: '通用', nodes: [] });
  const [activeSkillId, setActiveSkillId] = useState(null);

  const [understanding, setUnderstanding] = useState(false);
  const [understandInput, setUnderstandInput] = useState('');

  const [runnerOpen, setRunnerOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load skills
  const loadSkills = useCallback(async () => {
    try {
      const res = await fetch(`${API}/skills`);
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch {
      showToast('无法加载技能库', 'error');
    }
  }, [showToast]);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  // Select skill
  const selectSkill = (skill) => {
    setWorkflow({ ...skill });
    setActiveSkillId(skill.id);
  };

  // New workflow
  const newWorkflow = () => {
    setWorkflow({ id: null, name: '', description: '', icon: '🎯', category: '通用', nodes: [] });
    setActiveSkillId(null);
    setUnderstandInput('');
  };

  // AI Understand
  const handleUnderstand = async () => {
    if (!understandInput.trim()) return;
    setUnderstanding(true);
    try {
      const res = await fetch(`${API}/ai/understand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: understandInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWorkflow(w => ({
        ...w,
        name: w.name || data.name,
        icon: data.icon || w.icon,
        category: data.category || w.category,
        nodes: data.nodes || [],
      }));
      showToast(`已生成 ${(data.nodes || []).length} 个步骤！`, 'success');
    } catch (e) {
      showToast(e.message || 'AI 理解失败', 'error');
    } finally {
      setUnderstanding(false);
    }
  };

  // Node operations
  const addNode = (type) => {
    setWorkflow(w => ({ ...w, nodes: [...w.nodes, createNode(type)] }));
  };

  const deleteNode = (id) => {
    setWorkflow(w => ({ ...w, nodes: w.nodes.filter(n => n.id !== id) }));
  };

  const updateNode = (updated) => {
    setWorkflow(w => ({ ...w, nodes: w.nodes.map(n => n.id === updated.id ? updated : n) }));
  };

  const moveNode = (id, dir) => {
    setWorkflow(w => {
      const nodes = [...w.nodes];
      const i = nodes.findIndex(n => n.id === id);
      const j = i + dir;
      if (j < 0 || j >= nodes.length) return w;
      [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
      return { ...w, nodes };
    });
  };

  // Save skill
  const handleSave = async ({ name, description, icon, category }) => {
    const payload = { name, description, icon, category, nodes: workflow.nodes };
    try {
      let data;
      if (workflow.id) {
        const res = await fetch(`${API}/skills/${workflow.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json();
      } else {
        const res = await fetch(`${API}/skills`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json();
      }
      if (data.error) throw new Error(data.error);

      setWorkflow({ ...data });
      setActiveSkillId(data.id);
      setSaveModalOpen(false);
      await loadSkills();
      showToast(workflow.id ? '技能已更新！' : '技能已保存！', 'success');
    } catch (e) {
      showToast(e.message || '保存失败', 'error');
    }
  };

  // Delete skill
  const handleDeleteSkill = async (id, e) => {
    e.stopPropagation();
    if (!confirm('确认删除这个技能？')) return;
    try {
      await fetch(`${API}/skills/${id}`, { method: 'DELETE' });
      await loadSkills();
      if (activeSkillId === id) newWorkflow();
      showToast('技能已删除', 'info');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-brand">
          <span className="logo">🤖</span>
          <h1>AI 工作流构建器</h1>
          <span className="version">Beta</span>
        </div>
        <div className="app-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={newWorkflow}>
            <Icon name="refresh" size={13} /> 新建
          </button>
          {workflow.nodes.length > 0 && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setSaveModalOpen(true)}>
                <Icon name="save" size={13} /> {workflow.id ? '更新技能' : '保存技能'}
              </button>
              <button className="btn btn-primary" onClick={() => setRunnerOpen(true)}>
                <Icon name="play" size={14} /> 执行工作流
              </button>
            </>
          )}
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2><Icon name="book" size={11} /> 技能库</h2>
            <div className="sidebar-search">
              <span className="search-icon"><Icon name="search" size={13} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索技能..." />
            </div>
          </div>

          <div className="sidebar-list">
            {filteredSkills.length === 0 ? (
              <div className="sidebar-empty">
                {search ? '没有找到匹配的技能' : '还没有保存任何技能\n创建工作流后点击"保存技能"'}
              </div>
            ) : (
              filteredSkills.map(skill => (
                <div key={skill.id} className={`skill-card ${activeSkillId === skill.id ? 'active' : ''}`}
                  onClick={() => selectSkill(skill)}>
                  <div className="skill-card-icon">{skill.icon || '🎯'}</div>
                  <div className="skill-card-info">
                    <div className="skill-card-name">{skill.name}</div>
                    <div className="skill-card-meta">
                      <span className="skill-card-cat">{skill.category || '通用'}</span>
                      <span className="skill-card-count">{skill.use_count || 0} 次使用</span>
                    </div>
                  </div>
                  <button className="skill-card-del" onClick={e => handleDeleteSkill(skill.id, e)}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={newWorkflow}>
              <Icon name="plus" size={14} /> 新建工作流
            </button>
          </div>
        </aside>

        {/* Editor */}
        <main className="editor">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="editor-toolbar-left">
              <button className="editor-icon-btn" onClick={() => setSaveModalOpen(true)} title="更改图标">
                {workflow.icon || '🎯'}
              </button>
              <input className="workflow-name-input" value={workflow.name}
                onChange={e => setWorkflow(w => ({ ...w, name: e.target.value }))}
                placeholder="输入工作流名称..." />
            </div>
            <div className="editor-toolbar-right">
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                {workflow.nodes.length} 个步骤
              </span>
              {workflow.nodes.length > 0 && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSaveModalOpen(true)}>
                    <Icon name="save" size={13} /> 保存
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setRunnerOpen(true)}>
                    <Icon name="play" size={13} /> 执行
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="editor-body">
            {/* AI Understand Panel */}
            <div className="ai-panel">
              <div className="ai-panel-header">
                <span className="ai-icon"><Icon name="sparkles" size={16} /></span>
                <h3>AI 智能理解</h3>
                <span className="hint">· 描述你的需求，自动生成工作流步骤</span>
              </div>
              <textarea value={understandInput} onChange={e => setUnderstandInput(e.target.value)}
                placeholder="例如：我想要生成一套泳装写真组图，需要选择性别、场景、风格等...&#10;例如：帮我写一篇关于旅行的博客文章..."
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleUnderstand(); }}
              />
              <div className="ai-panel-actions">
                <button className="btn btn-primary btn-sm" onClick={handleUnderstand}
                  disabled={!understandInput.trim() || understanding}>
                  {understanding
                    ? <><div className="spinner" /> 理解中...</>
                    : <><Icon name="wand" size={13} /> AI 理解需求</>
                  }
                </button>
              </div>
            </div>

            {/* Nodes or Empty */}
            {workflow.nodes.length === 0 ? (
              <div className="empty-workflow">
                <div className="ei">🏗️</div>
                <h3>工作流还是空的</h3>
                <p>使用上方的 AI 理解功能，输入需求自动生成步骤；<br />或者手动添加下方的步骤类型</p>
                <AddNodeSection onAdd={addNode} />
              </div>
            ) : (
              <>
                <div className="nodes-list">
                  {workflow.nodes.map((node, i) => (
                    <NodeCard key={node.id} node={node} index={i} total={workflow.nodes.length}
                      onChange={updateNode} onDelete={deleteNode} onMove={moveNode} />
                  ))}
                </div>
                <div className="add-node-section" style={{ marginTop: 16 }}>
                  <div className="add-node-label">添加步骤</div>
                  <AddNodeSection onAdd={addNode} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {runnerOpen && (
        <RunnerModal workflow={workflow} onClose={() => setRunnerOpen(false)} />
      )}
      {saveModalOpen && (
        <SaveModal workflow={workflow} onSave={handleSave} onClose={() => setSaveModalOpen(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' && <Icon name="check" size={15} />}
          {toast.type === 'error' && <Icon name="x" size={15} />}
          {toast.type === 'info' && <Icon name="sparkles" size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Add Node Section (reusable) ───────────────────────────────────────────

function AddNodeSection({ onAdd }) {
  const types = [
    { id: 'select', label: '单选题', icon: '⊙', hint: '从选项中选一个' },
    { id: 'multi-select', label: '多选题', icon: '☑', hint: '可选多个选项' },
    { id: 'text', label: '文本输入', icon: 'T', hint: '单行文字' },
    { id: 'textarea', label: '段落输入', icon: '≡', hint: '多行文字' },
  ];
  return (
    <div className="add-node-grid">
      {types.map(t => (
        <button key={t.id} className="add-node-btn" onClick={() => onAdd(t.id)}>
          <span className="add-node-btn-icon" style={{ fontSize: 20, fontWeight: 700 }}>{t.icon}</span>
          <span style={{ fontWeight: 600 }}>{t.label}</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{t.hint}</span>
        </button>
      ))}
    </div>
  );
}
