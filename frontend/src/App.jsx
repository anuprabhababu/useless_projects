import { useState } from 'react'
import Button from './components/Button'
import ModeCard from './components/ModeCard'
import StageCard from './components/StageCard'
import ScoreCard from './components/ScoreCard'

import {
  startGame,
  advanceGame,
  makeWorse,
  addEvidence as addEvidenceAPI,
} from './services/api'

const modes = [
  { id: 'optimist', icon: '🧘', label: 'Optimist' },
  { id: 'detective', icon: '🕵️', label: 'Detective' },
  { id: 'delulu', icon: '🤡', label: 'Delulu' },
  { id: 'drama', icon: '🎬', label: 'Drama' },
]

const examples = [
  'They left me on seen',
  "My professor said 'see me after class'",
  "They viewed my story but didn't like it",
  "My friend replied 'k'",
]

const branches = [
  {
    label: 'Probably nothing',
    tone: 'calm',
    backendTone: 'chill',
  },
  {
    label: 'Something feels off',
    tone: 'maybe',
    backendTone: 'suspicious',
  },
  {
    label: 'Something is definitely wrong',
    tone: 'danger',
    backendTone: 'worst_case',
  },
]

function getBackendMode(mode) {
  // Backend currently supports:
  // optimist, detective, delulu
  // Drama is temporarily mapped to delulu.
  return mode === 'drama' ? 'delulu' : mode
}

export default function App() {
  const [page, setPage] = useState('home')

  const [situation, setSituation] = useState('')
  const [mode, setMode] = useState('detective')

  const [gameState, setGameState] = useState(null)

  const [evidenceText, setEvidenceText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const score = gameState?.score ?? 0
  const status = gameState?.status ?? '🧘 Completely Chill'
  const stages = gameState?.stages ?? []
  const evidence = gameState?.evidence ?? []
  const branchesTaken = gameState?.selected_branches ?? []
  const worse = gameState?.worse_clicks ?? 0

  const selectedMode = modes.find((m) => m.id === mode)

  // -------------------------
  // START GAME
  // -------------------------

  const begin = async () => {
    if (!situation.trim()) return

    setError('')
    setLoading(true)
    setPage('loading')

    try {
      const result = await startGame(
        situation.trim(),
        getBackendMode(mode)
      )

      setGameState(result.state)
      setPage('game')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to connect to the backend.')
      setPage('input')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // CHOOSE BRANCH
  // -------------------------

  const choose = async (branch) => {
    if (!gameState || loading) return

    setError('')
    setLoading(true)

    try {
      const result = await advanceGame(
        gameState,
        branch.backendTone
      )

      setGameState(result.state)

      if (result.state.finished) {
        setTimeout(() => setPage('score'), 450)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to process your choice.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // MAKE IT WORSE
  // -------------------------

  const worsen = async () => {
    if (!gameState || loading) return

    setError('')
    setLoading(true)

    try {
      const result = await makeWorse(gameState)

      setGameState(result.state)

      if (result.state.finished) {
        setTimeout(() => setPage('score'), 450)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to make things worse.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // ADD EVIDENCE
  // -------------------------

  const addEvidence = async () => {
    if (!evidenceText.trim() || !gameState || loading) return

    setError('')
    setLoading(true)

    try {
      const evidenceItem = {
        text: evidenceText.trim(),
        kind: 'fact',
      }

      const result = await addEvidenceAPI(
        gameState,
        evidenceItem
      )

      setGameState(result.state)
      setEvidenceText('')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to add evidence.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // HOME
  // -------------------------

  if (page === 'home') {
    return (
      <main className="hero">
        <nav>
          <b>
            Overthink<sup>™</sup>
          </b>

          <span>Home　 Leaderboard　 About</span>
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
            <small>It's probably nothing... right?</small>
          </div>

          <Button
            variant="pink"
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

  // -------------------------
  // INPUT
  // -------------------------

  if (page === 'input') {
    return (
      <PageShell>
        <div className="input-page">

          <h1>What's bothering you?</h1>

          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={
              "Type your situation here...\ne.g. My friend replied 'k'"
            }
            maxLength="200"
          />

          <small>
            {situation.length}/200
          </small>

          <p>Or try an example:</p>

          <div className="examples">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setSituation(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <h3>Choose your overthinking mode:</h3>

          <div className="modes">
            {modes.map((m) => (
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
            disabled={loading}
          >
            {loading
              ? 'Analyzing...'
              : 'Overthink It　→'}
          </Button>

        </div>
      </PageShell>
    )
  }

  // -------------------------
  // LOADING
  // -------------------------

  if (page === 'loading') {
    return (
      <main className="loading">
        <nav>
          <b>
            Overthink<sup>™</sup>
          </b>
        </nav>

        <div>
          <h2>
            Analyzing your situation...
          </h2>

          <div className="sticky-grid">
            <span>Checking past conversations...</span>
            <span>Analyzing tone...</span>
            <span>Finding hidden meanings...</span>
          </div>

          <div className="loading-brain">
            🧠
          </div>

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

  // -------------------------
  // GAME
  // -------------------------

  if (page === 'game') {
    return (
      <PageShell back={() => setPage('input')}>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className="game">

          <section>

            <div className="situation-box">
              <small>Your Situation</small>

              <strong>
                “{situation}”
              </strong>
            </div>

            <div className="timeline">
              {stages.map((stage, index) => (
                <StageCard
                  key={stage.level}
                  stage={stage}
                  active={index === stages.length - 1}
                />
              ))}
            </div>

            <Button
              variant="pink"
              className="worse"
              onClick={worsen}
              disabled={loading}
            >
              🔥 MAKE IT WORSE
            </Button>

          </section>

          <aside>

            <ScoreCard
              score={score}
              status={status}
            />

            <h3>
              What do you think?
            </h3>

            {branches.map((branch) => (
              <button
                key={branch.label}
                className={`branch ${branch.tone}`}
                onClick={() => choose(branch)}
                disabled={loading}
              >
                {branch.label}
                <span>→</span>
              </button>
            ))}

            <Button
              variant="outline"
              onClick={() => setPage('evidence')}
            >
              Add evidence　＋
            </Button>

          </aside>

        </div>
      </PageShell>
    )
  }

  // -------------------------
  // EVIDENCE
  // -------------------------

  if (page === 'evidence') {
    return (
      <PageShell back={() => setPage('game')}>

        <div className="evidence-page">

          <h1>Add Evidence</h1>

          <p>
            Give us more details. We'll make it worse.
          </p>

          <div className="evidence-input">

            <input
              value={evidenceText}
              onChange={(e) =>
                setEvidenceText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addEvidence()
                }
              }}
              placeholder="Add a piece of evidence..."
            />

            <button
              onClick={addEvidence}
              disabled={loading}
            >
              ＋
            </button>

          </div>

          <div className="evidence-list">

            {evidence.map((item, index) => (
              <div key={index}>
                <span>
                  {item.kind?.toUpperCase() || 'FACT'}
                </span>

                {item.text}
              </div>
            ))}

          </div>

          <div className="evidence-summary">
            🔎 Evidence collected: {evidence.length}

            <br />

            <small>
              Suspicion level:
              <b> HIGH</b>
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

  // -------------------------
  // SCORE
  // -------------------------

  if (page === 'score') {
    return (
      <PageShell back={() => setPage('game')}>

        <div className="score-page">

          <h1>
            Your Overthinking Score
          </h1>

          <div className="big-score">
            {score}
            <span>/ 100</span>
          </div>

          <ScoreCard
            score={score}
            status={status}
          />

          <div className="cooked">
            {status}

            <small>
              A perfect balance of creativity
              and unnecessary worry.
            </small>
          </div>

          <div className="breakdown">

            <b>
              {Math.max(
                5,
                35 - evidence.length * 3
              )}%
              <small>Actual evidence</small>
            </b>

            <b>
              {Math.min(
                80,
                45 + branchesTaken.length * 8
              )}%
              <small>Assumptions</small>
            </b>

            <b>
              {Math.min(
                60,
                15 + worse * 8
              )}%
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

  // -------------------------
  // REPORT
  // -------------------------

  return (
    <PageShell back={() => setPage('game')}>

      <div className="report">

        <h1>
          🧠 OVERTHINKING REPORT
        </h1>

        <p>
          <b>Situation:</b>
          <br />
          “{situation}”
        </p>

        <p>
          <b>Mode:</b>　
          {selectedMode?.icon}
          {' '}
          {selectedMode?.label}
        </p>

        <div className="report-score">
          {score}
          <span>/ 100</span>
        </div>

        <p>
          <b>Final status:</b> {status}
        </p>

        <hr />

        <div className="stats">

          <span>
            Branches taken
            <b>{branchesTaken.length}</b>
          </span>

          <span>
            Evidence collected
            <b>{evidence.length}</b>
          </span>

          <span>
            MAKE IT WORSE
            <b>{worse} times</b>
          </span>

        </div>

        <h3>
          Final conclusion
        </h3>

        <p>
          You started with one small situation
          and ended up investigating an imaginary
          conspiracy.
        </p>

        <p className="verdict">
          <b>Verdict:</b> There is probably nothing
          wrong. You have successfully created a
          problem where there may not be one.
        </p>

        <Button
          variant="pink"
          onClick={() => {
            setSituation('')
            setGameState(null)
            setEvidenceText('')
            setError('')
            setPage('input')
          }}
        >
          Overthink Again　↻
        </Button>

      </div>

    </PageShell>
  )
}

function PageShell({ children, back }) {
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

        <span>
          Home　 Leaderboard
        </span>

      </nav>

      {children}

    </main>
  )
}