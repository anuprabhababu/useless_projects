export default function StageCard({ stage, active }) {
  return <article className={`stage-card ${active ? 'active' : ''}`}>
    <span className="level-dot">{stage.level}</span><div><strong>{stage.title}</strong><p>{stage.thought}</p></div>
  </article>
}
