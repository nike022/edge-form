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
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: '新字段',
      required: false
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
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
    const code = `<!-- EdgeForm 嵌入代码 -->
<div id="edge-form-${formId}"></div>
<script>
  (function() {
    const formConfig = ${JSON.stringify({ formId, fields }, null, 2)};
    // 表单渲染逻辑
    const container = document.getElementById('edge-form-${formId}');
    const form = document.createElement('form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: '${formId}', submission: data })
      });
      const result = await response.json();
      alert(result.success ? '提交成功！' : '提交失败');
    };
    formConfig.fields.forEach(field => {
      const div = document.createElement('div');
      div.style.marginBottom = '1rem';
      const label = document.createElement('label');
      label.textContent = field.label + (field.required ? ' *' : '');
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      const input = field.type === 'textarea'
        ? document.createElement('textarea')
        : document.createElement('input');
      input.name = field.id;
      input.required = field.required;
      if (field.type !== 'textarea') input.type = field.type;
      input.style.width = '100%';
      input.style.padding = '0.5rem';
      div.appendChild(label);
      div.appendChild(input);
      form.appendChild(div);
    });
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = '提交';
    button.style.padding = '0.5rem 1rem';
    button.style.cursor = 'pointer';
    form.appendChild(button);
    container.appendChild(form);
  })();
</script>`
    setEmbedCode(code)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          EdgeForm - 边缘表单构建器
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setView('builder')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'builder' ? '#3b82f6' : '#e5e7eb',
              color: view === 'builder' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            表单构建器
          </button>
          <button
            onClick={() => setView('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'dashboard' ? '#3b82f6' : '#e5e7eb',
              color: view === 'dashboard' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            数据管理
          </button>
        </div>
      </div>

      {view === 'builder' ? (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 左侧：表单构建器 */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>表单设置</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>表单 ID</label>
            <input
              type="text"
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginTop: '2rem', marginBottom: '1rem' }}>表单字段</h3>

          {fields.map((field) => (
            <div key={field.id} style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginBottom: '1rem',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button
                  onClick={() => removeField(field.id)}
                  style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  删除
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                  style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="text">文本</option>
                  <option value="email">邮箱</option>
                  <option value="textarea">多行文本</option>
                  <option value="select">下拉选择</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  />
                  必填
                </label>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={() => addField('text')} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + 文本字段
            </button>
            <button onClick={() => addField('email')} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + 邮箱字段
            </button>
            <button onClick={() => addField('textarea')} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + 多行文本
            </button>
          </div>

          <button
            onClick={generateEmbedCode}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            生成嵌入代码
          </button>
        </div>

        {/* 右侧：预览和嵌入代码 */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>表单预览</h2>
          <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
            {fields.map((field) => (
              <div key={field.id} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '100px' }}
                    disabled
                  />
                ) : (
                  <input
                    type={field.type}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    disabled
                  />
                )}
              </div>
            ))}
            <button
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              disabled
            >
              提交
            </button>
          </div>

          {embedCode && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>嵌入代码</h2>
              <textarea
                value={embedCode}
                readOnly
                style={{
                  width: '100%',
                  height: '300px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
                onClick={(e) => e.currentTarget.select()}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                点击代码区域可全选复制
              </p>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>提交数据</h2>
          {loading ? (
            <p>加载中...</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>暂无提交数据</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>提交时间</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>IP地址</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>表单数据</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(sub.timestamp).toLocaleString('zh-CN')}</td>
                      <td style={{ padding: '0.75rem' }}>{sub.ip}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem' }}>{JSON.stringify(sub.data, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
