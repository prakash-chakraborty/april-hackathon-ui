const BASE = import.meta.env.VITE_API_URL ||
  'https://capp-retail-copilot-be.purpledune-1338ed2f.uksouth.azurecontainerapps.io'

async function request(path, opts = {}) {
  const token = localStorage.getItem('rc_token')
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const resp = await fetch(`${BASE}${path}`, { ...opts, headers })

  if (resp.status === 204) return null

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    const msg = body.detail || body.message || `Request failed (${resp.status})`
    throw new Error(msg)
  }

  return resp.json()
}

export function loginUser(username, password) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function registerUser(username, password) {
  return request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export const fetchMe = () => request('/api/users/me')

export const getPages = () => request('/api/pages/')
export const getPage = (id) => request(`/api/pages/${id}`)

export function createPage(name) {
  return request('/api/pages/', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function updatePage(id, name) {
  return request(`/api/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export function deletePage(id) {
  return request(`/api/pages/${id}`, { method: 'DELETE' })
}

export function createCard(pageId, data) {
  return request(`/api/cards/?page_id=${pageId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCard(id, data) {
  return request(`/api/cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteCard(id) {
  return request(`/api/cards/${id}`, { method: 'DELETE' })
}
