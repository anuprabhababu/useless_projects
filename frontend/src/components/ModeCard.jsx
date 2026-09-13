export default function ModeCard({ mode, selected, onClick }) {
  return <button className={`mode-card ${selected ? 'selected' : ''}`} onClick={onClick}>
    <span className="mode-icon">{mode.icon}</span><span>{mode.label}</span>
  </button>
}
