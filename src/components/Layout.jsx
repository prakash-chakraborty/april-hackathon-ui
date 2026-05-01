import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPages, createPage } from '../api/client'
import { Home, FileText } from 'lucide-react'

export default function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [adding, setAdding] = useState(false)
  const [newPageName, setNewPageName] = useState('')

  useEffect(() => { refreshPages() }, [])

  async function refreshPages() {
    try {
      const data = await getPages()
      setPages(data)
    } catch {
    }
  }

  async function quickAddPage(e) {
    e.preventDefault()
    if (!newPageName.trim()) return
    try {
      const created = await createPage(newPageName.trim())
      setNewPageName('')
      setAdding(false)
      await refreshPages()
      navigate(`/pages/${created.id}`)
    } catch (err) {
      alert(err.message)
    }
  }

  function doLogout() {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="spinner-wrap" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Retail Copilot Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={16} /> Dashboard
          </NavLink>

          <div className="nav-section-title" style={{ marginTop: '0.8rem' }}>Pages</div>
          {pages.map(pg => (
            <NavLink
              key={pg.id}
              to={`/pages/${pg.id}`}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <FileText size={16} /> {pg.name}
            </NavLink>
          ))}

          {adding ? (
            <form onSubmit={quickAddPage} style={{ padding: '0.3rem 0.8rem' }}>
              <input
                className="inline-edit-input"
                style={{ width: '100%' }}
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                onBlur={() => { if (!newPageName.trim()) setAdding(false) }}
                placeholder="Page name"
                autoFocus
              />
            </form>
          ) : (
            <button className="add-page-btn" onClick={() => setAdding(true)}>
              + New Page
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <span>{user?.username || 'User'}</span>
          </div>
          <button className="btn-logout" onClick={doLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
