import { useMemo, useState } from 'react'
import Button from './components/Button'
import ModeCard from './components/ModeCard'
import StageCard from './components/StageCard'
import ScoreCard from './components/ScoreCard'

const modes = [
  { id: 'optimist', icon: '🧘', label: 'Optimist' }, { id: 'detective', icon: '🕵️', label: 'Detective' },
  { id: 'delulu', icon: '🤡', label: 'Delulu' }, { id: 'drama', icon: '🎬', label: 'Drama' }
]
const examples = ['They left me on seen', "My professor said ‘see me after class’", 'They viewed my story but didn’t like it', "My friend replied ‘k’"]
const titles = ['Reasonable', 'Hmm...', 'Suspicious', 'Detective Mode', 'Completely Unhinged']
const baseThoughts = [
  'They are probably busy.', 'Maybe they are just tired.', 'Why was that reply so short?',
  'Let’s examine their recent behaviour...', 'This might be connected to the samosa incident from last Tuesday.'
]
const branches = [
  { label: 'Probably nothing', tone: 'calm', points: 5 }, { label: 'Something feels off', tone: 'maybe', points: 12 }, { label: 'Something is definitely wrong', tone: 'danger', points: 22 }
]
function getStatus(score) { return score <= 20 ? '🧘 Completely Chill' : score <= 40 ? '🤔 Slightly Suspicious' : score <= 60 ? '👀 Something’s Up' : score <= 80 ? '🕵️ Detective Mode' : score <= 95 ? '🤡 Delusional' : '💀 COMPLETELY COOKED' }

export default function App() {
  const [page, setPage] = useState('home'), [situation, setSituation] = useState(''), [mode, setMode] = useState('detective')
  const [stages, setStages] = useState([]), [score, setScore] = useState(10), [worse, setWorse] = useState(0), [evidence, setEvidence] = useState([]), [evidenceText, setEvidenceText] = useState(''), [branchesTaken, setBranchesTaken] = useState([])
  const status = getStatus(score)
  const begin = () => { if (!situation.trim()) return; setPage('loading'); setTimeout(() => { setStages([{ level: 1, title: titles[0], thought: baseThoughts[0] }]); setPage('game') }, 1500) }
  const choose = (branch) => {
    const next = Math.min(stages.length + (branch.points === 22 && stages.length < 4 ? 2 : 1), 5)
    setScore(s => Math.min(100, s + branch.points)); setBranchesTaken(b => [...b, branch.label])
    if (next > stages.length) setStages(s => [...s, { level: next, title: titles[next - 1], thought: baseThoughts[next - 1] }])
    if (next === 5) setTimeout(() => setPage('score'), 450)
  }
  const worsen = () => {
    const next = Math.min(stages.length + 1, 5); setWorse(w => w + 1); setScore(s => Math.min(100, s + 15))
    if (next > stages.length) setStages(s => [...s, { level: next, title: titles[next - 1], thought: baseThoughts[next - 1] }])
    if (next === 5) setTimeout(() => setPage('score'), 450)
  }
  const addEvidence = () => { if (evidenceText.trim()) { setEvidence(e => [...e, { text: evidenceText.trim(), type: e.length > 1 ? 'ASSUMPTION' : 'FACT' }]); setEvidenceText(''); setScore(s => Math.min(100, s + 5)) } }
  const selectedMode = modes.find(m => m.id === mode)
  if (page === 'home') return <main className="hero"><nav><b>Overthink<sup>™</sup></b><span>Home　 Leaderboard　 About</span></nav><div className="hero-copy"><p className="eyebrow">THE WORLD'S MOST UNNECESSARY APP</p><h1>Overthink<span>™</span></h1><h2>Turning small problems<br />into big problems since today.</h2><div className="brain">🧠<i>What if?</i><em>Did I say something wrong?</em><small>It’s probably nothing... right?</small></div><Button variant="pink" onClick={() => setPage('input')}>Start Overthinking　→</Button><p className="disclaimer">☺ A completely unnecessary but very important app.</p></div></main>
  if (page === 'input') return <PageShell><div className="input-page"><h1>What’s bothering you?</h1><textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="Type your situation here...&#10;e.g. My friend replied ‘k’" maxLength="200" /><small>{situation.length}/200</small><p>Or try an example:</p><div className="examples">{examples.map(x => <button key={x} onClick={() => setSituation(x)}>{x}</button>)}</div><h3>Choose your overthinking mode:</h3><div className="modes">{modes.map(m => <ModeCard key={m.id} mode={m} selected={mode === m.id} onClick={() => setMode(m.id)} />)}</div><Button onClick={begin}>Overthink It　→</Button></div></PageShell>
  if (page === 'loading') return <main className="loading"><nav><b>Overthink<sup>™</sup></b></nav><div><h2>Analyzing your situation...</h2><div className="sticky-grid"><span>Checking past conversations...</span><span>Analyzing tone...</span><span>Finding hidden meanings...</span></div><div className="loading-brain">🧠</div><div className="meter"><i /></div><strong>73%</strong><p>Please be patient.<br />Good things (or bad things) take time.</p></div></main>
  if (page === 'game') return <PageShell back={() => setPage('input')}><div className="game"><section><div className="situation-box"><small>Your Situation</small><strong>“{situation}”</strong></div><div className="timeline">{stages.map((s, i) => <StageCard key={s.level} stage={s} active={i === stages.length - 1} />)}</div><Button variant="pink" className="worse" onClick={worsen}>🔥 MAKE IT WORSE</Button></section><aside><ScoreCard score={score} status={status} /><h3>What do you think?</h3>{branches.map(b => <button key={b.label} className={`branch ${b.tone}`} onClick={() => choose(b)}>{b.label}<span>→</span></button>)}<Button variant="outline" onClick={() => setPage('evidence')}>Add evidence　＋</Button></aside></div></PageShell>
  if (page === 'evidence') return <PageShell back={() => setPage('game')}><div className="evidence-page"><h1>Add Evidence</h1><p>Give us more details. We’ll make it worse.</p><div className="evidence-input"><input value={evidenceText} onChange={e => setEvidenceText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEvidence()} placeholder="Add a piece of evidence..." /><button onClick={addEvidence}>＋</button></div><div className="evidence-list">{evidence.map((e, i) => <div key={i}><span>{e.type}</span>{e.text}<button onClick={() => setEvidence(x => x.filter((_, n) => n !== i))}>×</button></div>)}</div><div className="evidence-summary">🔎 Evidence collected: {evidence.length}<br /><small>Suspicion level: <b>● HIGH</b></small></div><Button onClick={() => setPage('game')}>Analyze with Evidence　→</Button></div></PageShell>
  if (page === 'score') return <PageShell back={() => setPage('game')}><div className="score-page"><h1>Your Overthinking Score</h1><div className="big-score">{score} <span>/ 100</span></div><ScoreCard score={score} status={status} /><div className="cooked">{status}<small>A perfect balance of creativity and unnecessary worry.</small></div><div className="breakdown"><b>{Math.max(5, 35 - evidence.length * 3)}%<small>Actual evidence</small></b><b>{Math.min(80, 45 + branchesTaken.length * 8)}%<small>Assumptions</small></b><b>{Math.min(60, 15 + worse * 8)}%<small>Imagination</small></b></div><blockquote>“There is probably nothing wrong.<br />But you have successfully created {Math.max(3, stages.length * 3)} possible problems.”</blockquote><Button variant="pink" onClick={() => setPage('report')}>View Final Report　→</Button></div></PageShell>
  return <PageShell><div className="report"><h1>🧠 OVERTHINKING REPORT</h1><p><b>Situation:</b><br />“{situation}”</p><p><b>Mode:</b>　{selectedMode.icon} {selectedMode.label}</p><div className="report-score">{score} <span>/ 100</span></div><p><b>Final status:</b> {status}</p><hr /><div className="stats"><span>Branches taken <b>{branchesTaken.length}</b></span><span>Evidence collected <b>{evidence.length}</b></span><span>MAKE IT WORSE <b>{worse} times</b></span></div><h3>Final conclusion</h3><p>You started with one small situation and ended up investigating an imaginary conspiracy.</p><p className="verdict"><b>Verdict:</b> There is probably nothing wrong. You have successfully created a problem where there may not be one.</p><Button variant="pink" onClick={() => { setSituation(''); setStages([]); setScore(10); setPage('input') }}>Overthink Again　↻</Button></div></PageShell>
}
function PageShell({ children, back }) { return <main className="app-page"><nav><button className="back" onClick={back}>← {back ? 'Back' : ''}</button><b>Overthink<sup>™</sup></b><span>Home　 Leaderboard</span></nav>{children}</main> }
