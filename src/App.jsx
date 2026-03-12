import { useState, useEffect } from 'react'

const GITHUB_TOKEN = "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"
const REPO_OWNER = "TeflonFalcon"
const REPO_NAME = "lspr-shell"
const WORKFLOW_FILE = import.meta.env.VITE_WORKFLOW_FILE || 'restart.yml'

async function triggerWorkflow() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  )
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
}

const SERVER_ID = '188.225.74.96:22005'

async function fetchServerInfo() {
  const res = await fetch('https://cdn.rage.mp/master/v2/')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const server = data.find(s => s.id === SERVER_ID)
  if (!server) throw new Error('Сервер не найден')
  return server
}

export default function App() {
  const [restartStatus, setRestartStatus] = useState(null) // null | 'loading' | 'ok' | 'error'
  const [restartError, setRestartError] = useState('')
  const [server, setServer] = useState(null)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    fetchServerInfo()
      .then(setServer)
      .catch(e => setServerError(e.message))
  }, [])

  async function handleRestart() {
    setRestartStatus('loading')
    setRestartError('')
    try {
      await triggerWorkflow()
      setRestartStatus('ok')
    } catch (e) {
      setRestartError(e.message)
      setRestartStatus('error')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Los Santos Project</h1>

        {server ? (
          <div style={styles.info}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Онлайн</span>
              <span style={styles.value}>
                {server.players?.amount ?? 0} / {server.players?.max ?? '?'}
              </span>
            </div>
          </div>
        ) : serverError ? (
          <p style={styles.errorText}>{serverError}</p>
        ) : (
          <p style={styles.muted}>Загрузка...</p>
        )}

        <button
          style={{
            ...styles.button,
            ...(restartStatus === 'loading' ? styles.buttonDisabled : {}),
          }}
          onClick={handleRestart}
          disabled={restartStatus === 'loading'}
        >
          {restartStatus === 'loading' ? 'Запуск...' : 'Рестарт'}
        </button>

        {restartStatus === 'ok' && (
          <p style={styles.success}>Workflow запущен</p>
        )}
        {restartStatus === 'error' && (
          <p style={styles.errorText}>Ошибка: {restartError}</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '48px 64px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    minWidth: '320px',
  },
  title: {
    color: '#e6edf3',
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '32px',
  },
  label: {
    color: '#8b949e',
    fontSize: '14px',
  },
  value: {
    color: '#e6edf3',
    fontSize: '14px',
    fontWeight: 500,
  },
  muted: {
    color: '#8b949e',
    margin: 0,
    fontSize: '14px',
  },
  button: {
    background: '#238636',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%',
  },
  buttonDisabled: {
    background: '#388bfd',
    cursor: 'not-allowed',
  },
  success: {
    color: '#3fb950',
    margin: 0,
    fontSize: '14px',
  },
  errorText: {
    color: '#f85149',
    margin: 0,
    fontSize: '14px',
    maxWidth: '300px',
    textAlign: 'center',
  },
}
