import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, loginUser } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setBusy(true)
    try {
      await registerUser(username, password)
      const data = await loginUser(username, password)
      login(data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1>Create account</h1>
        <p className="subtitle">Get started with Retail Copilot Admin</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-user">Username</label>
            <input
              id="reg-user"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Pick a username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-pw">Password</label>
            <input
              id="reg-pw"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
