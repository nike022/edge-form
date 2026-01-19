import { useState, useEffect } from 'react'
import './App.css'

interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select'
  label: string
  required: boolean
  options?: string[]
}

interface Submission {
  id: string
  formId: string
  data: Record<string, string>
  timestamp: string
  ip: string
}

function App() {
  const [view, setView] = useState<'builder' | 'dashboard'>('builder')
  const [formId, setFormId] = useState('contact-form')
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: '姓名', required: true },
    { id: '2', type: 'email', label: '邮箱', required: true },
    { id: '3', type: 'textarea', label: '留言', required: false }
  ])
  const [embedCode, setEmbedCode] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)

  const addField = (type: FormField['type']) => {
    const fieldCount = fields.length + 1
    const newField: FormField = {
      id: `field_${fieldCount}`,
      type,
      label: '新字段',
      required: false,
      options: type === 'select' ? ['选项 1', '选项 2', '选项 3'] : undefined
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field) {
      const newOptions = [...(field.options || []), '选项 ' + ((field.options?.length || 0) + 1)]
      updateField(fieldId, { options: newOptions })
    }
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex)
      updateField(fieldId, { options: newOptions })
    }
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/get-submissions?formId=${formId}`)
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (view === 'dashboard') {
      fetchSubmissions()
    }
  }, [view, formId])

  const generateEmbedCode = () => {
    const apiBaseUrl = window.location.origin
    const code = `<!-- EdgeForm 嵌入代码 -->
<div id="edge-form-${formId}"></div>
<script>
  (function() {
    const formConfig = ${JSON.stringify({ formId, fields }, null, 2)};
    const apiBaseUrl = '${apiBaseUrl}';
    const container = document.getElementById('edge-form-${formId}');
    const form = document.createElement('form');
    form.style.maxWidth = '600px';
    form.style.margin = '0 auto';
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const response = await fetch(apiBaseUrl + '/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: '${formId}', submission: data })
      });
      const result = await response.json();
      alert(result.success ? '提交成功！' : '提交失败');
      if (result.success) e.target.reset();
    };
    formConfig.fields.forEach(field => {
      const div = document.createElement('div');
      div.style.marginBottom = '1rem';
      const label = document.createElement('label');
      label.textContent = field.label + (field.required ? ' *' : '');
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      label.style.fontWeight = '500';
      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.style.minHeight = '100px';
      } else if (field.type === 'select') {
        input = document.createElement('select');
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择...';
        input.appendChild(defaultOption);
        if (field.options) {
          field.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
          });
        }
      } else {
        input = document.createElement('input');
        input.type = field.type;
      }
      input.name = field.id;
      input.required = field.required;
      input.style.width = '100%';
      input.style.padding = '0.75rem';
      input.style.border = '1px solid #ddd';
      input.style.borderRadius = '8px';
      input.style.fontSize = '1rem';
      div.appendChild(label);
      div.appendChild(input);
      form.appendChild(div);
    });
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = '提交';
    button.style.padding = '0.75rem 2rem';
    button.style.background = '#6366f1';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.fontSize = '1rem';
    button.style.fontWeight = '500';
    button.style.cursor = 'pointer';
    form.appendChild(button);
    container.appendChild(form);
  })();
</script>`
    setEmbedCode(code)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">EdgeForm - 边缘表单构建器</h1>
          <div className="nav-tabs">
            <button
              onClick={() => setView('builder')}
              className={`nav-tab ${view === 'builder' ? 'active' : ''}`}
            >
              表单构建器
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`nav-tab ${view === 'dashboard' ? 'active' : ''}`}
            >
              数据管理
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'builder' ? (
          <div className="builder-grid">
            <div className="builder-section">
              <h2 className="section-title">表单设置</h2>

              <div className="form-id-group">
                <label>表单 ID</label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="form-id-input"
                />
              </div>

              <h3 className="fields-title">表单字段</h3>

              {fields.map((field) => (
                <div key={field.id} className="field-card">
                  <div className="field-header">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="field-label-input"
                    />
                    <button
                      onClick={() => removeField(field.id)}
                      className="btn-delete"
                    >
                      删除
                    </button>
                  </div>
                  <div className="field-controls">
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newType = e.target.value as FormField['type']
                        updateField(field.id, {
                          type: newType,
                          options: newType === 'select' ? ['选项 1', '选项 2', '选项 3'] : undefined
                        })
                      }}
                      className="field-type-select"
                    >
                      <option value="text">文本</option>
                      <option value="email">邮箱</option>
                      <option value="textarea">多行文本</option>
                      <option value="select">下拉选择</option>
                    </select>
                    <label className="field-required-label">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      />
                      必填
                    </label>
                  </div>

                  {field.type === 'select' && (
                    <div className="field-options">
                      <div className="options-header">下拉选项：</div>
                      {field.options?.map((option, index) => (
                        <div key={index} className="option-item">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(field.id, index, e.target.value)}
                            className="option-input"
                            placeholder={`选项 ${index + 1}`}
                          />
                          <button
                            onClick={() => removeOption(field.id, index)}
                            className="btn-remove-option"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(field.id)}
                        className="btn-add-option"
                      >
                        + 添加选项
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="add-field-buttons">
                <button onClick={() => addField('text')} className="btn-add-field">
                  + 文本字段
                </button>
                <button onClick={() => addField('email')} className="btn-add-field">
                  + 邮箱字段
                </button>
                <button onClick={() => addField('textarea')} className="btn-add-field">
                  + 多行文本
                </button>
              </div>

              <button onClick={generateEmbedCode} className="btn-generate">
                生成嵌入代码
              </button>
            </div>

            <div className="builder-section">
              <h2 className="section-title">表单预览</h2>
              <div className="preview-container">
                {fields.map((field) => (
                  <div key={field.id} className="preview-field">
                    <label className="preview-label">
                      {field.label} {field.required && <span className="required">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea className="preview-textarea" disabled />
                    ) : field.type === 'select' ? (
                      <select className="preview-input" disabled>
                        <option value="">请选择...</option>
                        {field.options?.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input type={field.type} className="preview-input" disabled />
                    )}
                  </div>
                ))}
                <button className="preview-submit" disabled>
                  提交
                </button>
              </div>

              {embedCode && (
                <div className="embed-section">
                  <h2 className="section-title">嵌入代码</h2>
                  <textarea
                    value={embedCode}
                    readOnly
                    className="embed-textarea"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <p className="embed-hint">
                    点击代码区域可全选复制
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h2 className="dashboard-title">提交数据</h2>
            </div>
            {loading ? (
              <p className="loading-text">加载中...</p>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>暂无提交数据</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>提交时间</th>
                      <th>IP地址</th>
                      <th>表单数据</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>{new Date(sub.timestamp).toLocaleString('zh-CN')}</td>
                        <td>{sub.ip}</td>
                        <td>
                          <pre className="submission-data">{JSON.stringify(sub.data, null, 2)}</pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
