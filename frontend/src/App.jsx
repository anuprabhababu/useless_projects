import { useState } from 'react'
import Button from './components/Button'
import ModeCard from './components/ModeCard'
import StageCard from './components/StageCard'
import ScoreCard from './components/ScoreCard'

const API = 'http://127.0.0.1:8000/api'

const modes = [
  { id: 'optimist', icon: '🧘', label: 'Optimist' },
  { id: 'detective', icon: '🕵️', label: 'Detective' },
  { id: 'delulu', icon: '🤡', label: 'Delulu' },
  { id: 'drama', icon: '🎬', label: 'Drama' }
]

const examples = [
  'They left me on seen',
  "My professor said ‘see me after class’",
  'They viewed my story but didn’t like it',
  "My friend replied ‘k’"
]

const titles = [
  'Reasonable',
  'Hmm...',
  'Suspicious',
  'Detective Mode',
  'Completely Unhinged'
]

const branches = [
  {
    label: 'Probably nothing',
    tone: 'calm',
    apiValue: 'chill'
  },
  {
    label: 'Something feels off',
    tone: 'maybe',
    apiValue: 'suspicious'
  },
  {
    label: 'Something is definitely wrong',
    tone: 'danger',
    apiValue: 'worst_case'
  }
]

function getStatus(score) {
  return score <= 20
    ? '🧘 Completely Chill'
    : score <= 40
    ? '🤔 Slightly Suspicious'
    : score <= 60
    ? '👀 Something’s Up'
    : score <= 80
    ? '🕵️ Detective Mode'
    : score <= 95
    ? '🤡 Delusional'
    : '💀 COMPLETELY COOKED'
}

function getVerdict(score) {
  if (score <= 20) {
    return 'Verdict: You actually handled this like a normal person. Suspiciously healthy behaviour.'
  }

  if (score <= 40) {
    return 'Verdict: You thought about it a little too much. But honestly, we have seen worse.'
  }

  if (score <= 60) {
    return 'Verdict: There is probably nothing wrong. Unfortunately, your brain has opened a small investigation anyway.'
  }

  if (score <= 80) {
    return 'Verdict: You have officially turned a minor inconvenience into a developing situation. Evidence remains questionable.'
  }

  if (score <= 95) {
    return 'Verdict: You are no longer overthinking. You are writing fan fiction about a situation that may not even exist.'
  }

  return 'Verdict: COMPLETELY COOKED. The original problem has disappeared. You are now investigating problems you personally invented.'
}

export default function App() {
  const [page, setPage] = useState('home')

  const [situation, setSituation] = useState('')
  const [mode, setMode] = useState('detective')

  // This is now the REAL state coming from FastAPI.
  const [gameState, setGameState] = useState(null)

  const [evidenceText, setEvidenceText] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState('')

  const score = gameState?.score ?? 10
  const status = gameState?.status ?? getStatus(score)

  const stages = gameState?.stages ?? []
  const evidence = gameState?.evidence ?? []
  const branchesTaken = gameState?.selected_branches ?? []
  const worse = gameState?.worse_clicks ?? 0

  const selectedMode =
    modes.find(m => m.id === mode) || modes[1]

  // =========================
  // API HELPER
  // =========================

  async function callAPI(endpoint, body) {
    setError('')

    try {
      setLoadingAction(true)

      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Request failed: ${response.status}`)
      }

      const data = await response.json()

      setGameState(data.state)

      return data
    } catch (err) {
      console.error(err)
      setError(
        'Could not connect to the Overthink backend. Make sure FastAPI is running.'
      )
      return null
    } finally {
      setLoadingAction(false)
    }
  }

  // =========================
  // START GAME
  // =========================

  const begin = async () => {
    if (!situation.trim()) return

    setPage('loading')
    setError('')

    const data = await callAPI('/game/start', {
      situation: situation.trim(),
      mode
    })

    if (data) {
      setPage('game')
    } else {
      setPage('input')
    }
  }

  // =========================
  // CHOOSE INTERPRETATION
  // =========================

  const choose = async branch => {
    if (!gameState || loadingAction) return

    const data = await callAPI('/game/advance', {
      state: gameState,
      branch: branch.apiValue
    })

    if (!data) return

    /*
      If the backend says the game is finished,
      show the Level 5 result briefly and then
      move to the score page.
    */

    const choose = async branch => {
  if (!gameState || loadingAction) return

  await callAPI('/game/advance', {
    state: gameState,
    branch: branch.apiValue
  })
}
  }

  // =========================
  // MAKE IT WORSE
  // =========================

const worsen = async () => {
  if (!gameState || loadingAction) return

  // If we are already at Level 5,
  // clicking MAKE IT WORSE goes to the score page.
  if (gameState.current_level === 5) {
    setPage('score')
    return
  }

  // Otherwise, clicking MAKE IT WORSE
  // generates the next level and stays on the game page.
  await callAPI('/game/worse', {
    state: gameState
  })
}
  // =========================
  // ADD EVIDENCE
  // =========================

  const addEvidence = async () => {
    if (!evidenceText.trim() || !gameState || loadingAction) {
      return
    }

    const data = await callAPI('/game/evidence', {
      state: gameState,
      evidence: {
        text: evidenceText.trim(),
        kind: 'fact'
      }
    })

    if (data) {
      setEvidenceText('')
    }
  }

  // =========================
  // RESET
  // =========================

  const goHome = () => {
    setSituation('')
    setGameState(null)
    setEvidenceText('')
    setError('')
    setPage('home')
  }

  const restart = () => {
    setGameState(null)
    setEvidenceText('')
    setError('')
    setPage('input')
  }

  // =========================
  // HOME
  // =========================

  if (page === 'home') {
    return (
      <main className="hero">
        <nav>
          <b>
            Overthink<sup>™</sup>
          </b>

          <span>Home　Leaderboard　About</span>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">
            THE WORLD'S MOST UNNECESSARY APP
          </p>

          <h1>
            Overthink<span>™</span>
          </h1>

          <h2>
            Turning small problems
            <br />
            into big problems since today.
          </h2>

          <div className="brain">
            🧠
            <i>What if?</i>
            <em>Did I say something wrong?</em>
            <small>It’s probably nothing... right?</small>
          </div>

          <Button
            variant="pink"
            onHome={goHome}
            onClick={() => setPage('input')}
          >
            Start Overthinking　→
          </Button>

          <p className="disclaimer">
            ☺ A completely unnecessary but very important app.
          </p>
        </div>
      </main>
    )
  }

  // =========================
  // INPUT
  // =========================

  if (page === 'input') {
    return (
      <PageShell onHome={goHome}>
        <div className="input-page">
          <h1>What’s bothering you?</h1>

          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder={
              "Type your situation here...\ne.g. My friend replied ‘k’"
            }
            maxLength="500"
          />

          <small>{situation.length}/500</small>

          <p>Or try an example:</p>

          <div className="examples">
            {examples.map(x => (
              <button
                key={x}
                onClick={() => setSituation(x)}
              >
                {x}
              </button>
            ))}
          </div>

          <h3>Choose your overthinking mode:</h3>

          <div className="modes">
            {modes.map(m => (
              <ModeCard
                key={m.id}
                mode={m}
                selected={mode === m.id}
                onClick={() => setMode(m.id)}
              />
            ))}
          </div>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <Button
            onClick={begin}
            disabled={!situation.trim() || loadingAction}
          >
            Overthink It　→
          </Button>
        </div>
      </PageShell>
    )
  }

  // =========================
  // LOADING
  // =========================

  if (page === 'loading') {
    return (
      <main className="loading">
        <nav>
          <b>
            Overthink<sup>™</sup>
          </b>
        </nav>

        <div>
          <h2>Analyzing your situation...</h2>

          <div className="sticky-grid">
            <span>Checking past conversations...</span>
            <span>Analyzing tone...</span>
            <span>Finding hidden meanings...</span>
          </div>

          <div className="loading-brain">🧠</div>

          <div className="meter">
            <i />
          </div>

          <strong>73%</strong>

          <p>
            Please be patient.
            <br />
            Good things (or bad things) take time.
          </p>
        </div>
      </main>
    )
  }

  // =========================
  // GAME
  // =========================

  if (page === 'game') {
    const currentLevel =
      stages[stages.length - 1]?.level || 1

    return (
      <PageShell
        back={() => setPage('input')}
        onHome={goHome}
      >
        <div className="game">
          <section>
            <div className="situation-box">
              <small>Your Situation</small>

              <strong>
                “{situation}”
              </strong>
            </div>

            <div className="timeline">
              {stages.map((s, i) => (
                <StageCard
                  key={`${s.level}-${i}`}
                  stage={s}
                  active={i === stages.length - 1}
                />
              ))}
            </div>

           

            {error && (
              <p className="error">
                {error}
              </p>
            )}

            <Button
              variant="pink"
              className="worse"
              onClick={worsen}
              disabled={loadingAction}
            >
              🔥 MAKE IT WORSE
            </Button>

            
          </section>

          <aside>
            <ScoreCard
              score={score}
              status={status}
            />

            <h3>What do you think?</h3>

            {branches.map(b => (
              <button
                key={b.label}
                className={`branch ${b.tone}`}
                onClick={() => choose(b)}
                disabled={loadingAction}
              >
                {b.label}
                <span>→</span>
              </button>
            ))}

            <Button
              variant="outline"
              onClick={() => setPage('evidence')}
              disabled={loadingAction}
            >
              Add evidence　＋
            </Button>
          </aside>
        </div>
      </PageShell>
    )
  }

  // =========================
  // EVIDENCE
  // =========================

  if (page === 'evidence') {
    return (
      <PageShell
        back={() => setPage('game')}
        onHome={goHome}
      >
        <div className="evidence-page">
          <h1>Add Evidence</h1>

          <p>
            Give us more details. We’ll make it worse.
          </p>

          <div className="evidence-input">
            <input
              value={evidenceText}
              onChange={e => setEvidenceText(e.target.value)}
              onKeyDown={e =>
                e.key === 'Enter' && addEvidence()
              }
              placeholder="Add a piece of evidence..."
            />

            <button
              onClick={addEvidence}
              disabled={loadingAction}
            >
              ＋
            </button>
          </div>

          <div className="evidence-list">
            {evidence.map((e, i) => (
              <div key={i}>
                <span>
                  {e.kind?.toUpperCase() || 'FACT'}
                </span>

                {e.text}
              </div>
            ))}
          </div>

          <div className="evidence-summary">
            🔎 Evidence collected: {evidence.length}
            <br />

            <small>
              Suspicion level: <b>● HIGH</b>
            </small>
          </div>

          <Button
            onClick={() => setPage('game')}
          >
            Analyze with Evidence　→
          </Button>
        </div>
      </PageShell>
    )
  }

  // =========================
  // SCORE
  // =========================

  if (page === 'score') {
    return (
      <PageShell
        back={() => setPage('game')}
        onHome={goHome}
      >
        <div className="score-page">
          <h1>Your Overthinking Score</h1>

          <div className="big-score">
            {score} <span>/ 100</span>
          </div>

          <ScoreCard
            score={score}
            status={status}
          />

          <div className="cooked">
            {status}

            <small>
              A perfect balance of creativity and unnecessary worry.
            </small>
          </div>

          <div className="breakdown">
            <b>
              {Math.max(5, 35 - evidence.length * 3)}%
              <small>Actual evidence</small>
            </b>

            <b>
              {Math.min(80, 45 + branchesTaken.length * 8)}%
              <small>Assumptions</small>
            </b>

            <b>
              {Math.min(60, 15 + worse * 8)}%
              <small>Imagination</small>
            </b>
          </div>

          <blockquote>
            “There is probably nothing wrong.
            <br />
            But you have successfully created{' '}
            {Math.max(3, stages.length * 3)}
            {' '}possible problems.”
          </blockquote>

          <Button
            variant="pink"
            onClick={() => setPage('report')}
          >
            View Final Report　→
          </Button>
        </div>
      </PageShell>
    )
  }

  // =========================
  // REPORT
  // =========================

  return (
    <PageShell onHome={goHome}>
      <div className="report">
        <h1>🧠 OVERTHINKING REPORT</h1>

        <p>
          <b>Situation:</b>
          <br />
          “{situation}”
        </p>

        <p>
          <b>Mode:</b>　{selectedMode.icon}{' '}
          {selectedMode.label}
        </p>

        <div className="report-score">
          {score} <span>/ 100</span>
        </div>

        <p>
          <b>Final status:</b> {status}
        </p>

        <hr />

        <div className="stats">
          <span>
            Branches taken <b>{branchesTaken.length}</b>
          </span>

          <span>
            Evidence collected <b>{evidence.length}</b>
          </span>

          <span>
            MAKE IT WORSE <b>{worse} times</b>
          </span>
        </div>

        <h3>Final conclusion</h3>

        <p>
          You started with one small situation and ended up
          investigating an imaginary conspiracy.
        </p>

        <p className="verdict">
          {getVerdict(score)}
        </p>

        <Button
          variant="pink"
          onClick={restart}
        >
          Overthink Again　↻
        </Button>
      </div>
    </PageShell>
  )
}

// =========================
// PAGE SHELL
// =========================

function PageShell({ children, back, onHome }) {
  return (
    <main className="app-page">
      <nav>
        <button
          className="back"
          onClick={back}
        >
          ← {back ? 'Back' : ''}
        </button>

        <b>
          Overthink<sup>™</sup>
        </b>

        <div className="nav-links">
          <button
            className="nav-home"
            onClick={onHome}
          >
            Home
          </button>

          <span>Leaderboard</span>
        </div>
      </nav>

      {children}
    </main>
  )
}