export default function ScoreCard({ score, status }) {
  return <section className="score-card"><span>OVERTHINKING LEVEL</span><div className="meter"><i style={{ width: `${score}%` }} /></div><strong>{score}% · {status}</strong></section>
}
