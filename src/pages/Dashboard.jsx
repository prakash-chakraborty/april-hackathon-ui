import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPages, createPage, deletePage, updatePage } from '../api/client'
import { Pencil, Trash2, FileText } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => { loadPages() }, [])

  async function loadPages() {
    try {
      const data = await getPages()
      setPages(data)
    } catch (err) {
      console.error('failed to load pages:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePage(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createPage(newName.trim())
      setNewName('')
      setShowNew(false)
      loadPages()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Delete this page and all its cards?')) return
    try {
      await deletePage(id)
      loadPages()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleRename(id) {
    if (!editName.trim()) {
      setEditingId(null)
      return
    }
    try {
      await updatePage(id, editName.trim())
      setEditingId(null)
      loadPages()
    } catch (err) {
      alert(err.message)
    }
  }

  function startEdit(e, page) {
    e.stopPropagation()
    setEditingId(page.id)
    setEditName(page.name)
  }

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Pages</h1>
        <p>Manage your dashboard pages and metric cards</p>
      </div>

      <div className="pages-grid">
        {pages.map((pg) => (
          <div
            key={pg.id}
            className="page-card"
            onClick={() => navigate(`/pages/${pg.id}`)}
          >
            {editingId === pg.id ? (
              <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleRename(pg.id) }}
                    onClick={(e) => e.stopPropagation()}>
                <input
                  className="inline-edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(pg.id)}
                  autoFocus
                />
              </form>
            ) : (
              <h3>{pg.name}</h3>
            )}
            <span className="card-count">
              {pg.cards?.length || 0} card{pg.cards?.length !== 1 ? 's' : ''}
            </span>
            <div className="page-card-actions">
              <button className="icon-btn" onClick={(e) => startEdit(e, pg)} title="Rename">
                <Pencil size={14} />
              </button>
              <button className="icon-btn danger" onClick={(e) => handleDelete(e, pg.id)} title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && !showNew && (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={48} /></div>
          <h3>No pages yet</h3>
          <p>Create your first page to start adding metric cards</p>
          <button
            className="btn-primary"
            style={{ maxWidth: 200, margin: '1rem auto 0' }}
            onClick={() => setShowNew(true)}
          >
            + New Page
          </button>
        </div>
      )}

      {/* new page modal */}
      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>New Page</h2>
            <form onSubmit={handleCreatePage}>
              <div className="form-group">
                <label>Page name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sales Overview"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNew(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={!newName.trim()}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
