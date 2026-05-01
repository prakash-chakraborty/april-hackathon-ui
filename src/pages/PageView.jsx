import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPage, createCard, updateCard, deleteCard } from '../api/client'
import { Pencil, Trash2, BarChart3 } from 'lucide-react'
import DonutChart from '../components/DonutChart'
import { useAuth } from '../context/AuthContext'

export default function PageView() {
  const { pageId } = useParams()
  const { user } = useAuth()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCard, setEditCard] = useState(null)

  useEffect(() => { loadPage() }, [pageId])

  async function loadPage() {
    setLoading(true)
    try {
      const d = await getPage(pageId)
      setPage(d)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditCard(null)
    setShowForm(true)
  }

  function openEdit(card) {
    setEditCard(card)
    setShowForm(true)
  }

  async function handleSave(formData) {
    try {
      if (editCard) {
        await updateCard(editCard.id, formData)
      } else {
        await createCard(pageId, formData)
      }
      setShowForm(false)
      setEditCard(null)
      loadPage()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteCard(cardId) {
    if (!window.confirm('Remove this card?')) return
    try {
      await deleteCard(cardId)
      loadPage()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return <div className="spinner-wrap"><div className="spinner" /></div>
  }

  if (!page) {
    return <div className="empty-state"><h3>Page not found</h3></div>
  }

  const cards = page.cards || []

  return (
    <div>
      <Link to="/" className="back-link">← Back to pages</Link>

      <div className="page-view-header">
        <h1>{page.name}</h1>
        <button className="btn-add-card" onClick={openNew}>
          + Add Card
        </button>
      </div>

      {cards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><BarChart3 size={48} /></div>
          <h3>No cards yet</h3>
          <p>Add a card to start tracking metrics on this page</p>
        </div>
      )}

      <div className="cards-grid">
        {cards.map((c) => (
          <div key={c.id} className={`metric-card ${c.card_type === 'KPI' ? 'metric-card--kpi' : ''}`}>
            <div className="card-header">
              <span className="card-title">{c.title}</span>
            </div>
            {c.card_type === 'Donut' ? (
              <div className="gauge-section">
                <DonutChart value={c.metric_value} />
                <div className="gauge-meta">
                  <div className="metric-label">{c.metric_title || 'Metric'}</div>
                </div>
              </div>
            ) : c.card_type === 'Progress' ? (
              <div className="progress-section">
                {(() => {
                  const pct = Math.min(Math.max(parseFloat(String(c.metric_value).replace(/[^0-9.]/g, '')) || 0, 0), 100)
                  return (
                    <>
                      <div className="progress-bar-row">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="progress-pct">{pct}%</span>
                      </div>
                      <div className="progress-label">{c.metric_title || 'Metric'}</div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="metric-section">
                <div className="metric-label">{c.metric_title || 'Metric'}</div>
                <div className="metric-value">{c.metric_value ?? '\u2014'}</div>
              </div>
            )}
            {c.created_by === user?.id && (
              <div className="card-actions">
                <button className="icon-btn" onClick={() => openEdit(c)} title="Edit">
                  <Pencil size={14} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDeleteCard(c.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <CardFormModal
          initial={editCard}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditCard(null) }}
        />
      )}
    </div>
  )
}

function CardFormModal({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [cardType, setCardType] = useState(initial?.card_type || '')
  const [metricTitle, setMetricTitle] = useState(initial?.metric_title || '')
  const [metricValue, setMetricValue] = useState(initial?.metric_value || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      title: title.trim(),
      card_type: cardType,
      metric_title: metricTitle.trim(),
      metric_value: metricValue.trim(),
    })
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>{initial ? 'Edit Card' : 'New Card'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Card title"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Card type</label>
            <select
              value={cardType}
              onChange={e => setCardType(e.target.value)}
              required
            >
              <option value="">Select a type</option>
              <option value="KPI">KPI</option>
              <option value="Donut">Donut</option>
              <option value="Progress">Progress</option>
            </select>
          </div>
          <div className="form-group">
            <label>KPI Title</label>
            <input
              value={metricTitle}
              onChange={e => setMetricTitle(e.target.value)}
              placeholder="What's being measured"
            />
          </div>
          <div className="form-group">
            <label>KPI Value</label>
            <input
              value={metricValue}
              onChange={e => setMetricValue(e.target.value)}
              placeholder="e.g. $12,340 or 89%"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={!title.trim() || saving}>
              {saving ? 'Saving...' : (initial ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
