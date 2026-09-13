import { useState } from "react";
import Button from "../components/Button";

export default function Evidence({
  evidence,
  onAddEvidence,
  onDeleteEvidence,
  onAnalyze,
  onBack,
}) {
  const [text, setText] = useState("");

  function addEvidence() {
    if (!text.trim()) return;

    onAddEvidence({
      text: text.trim(),
      type: evidence.length > 1 ? "ASSUMPTION" : "FACT",
    });

    setText("");
  }

  return (
    <main className="app-page">
      <nav>
        <button className="back" onClick={onBack}>← Back</button>
        <b>Overthink<sup>™</sup></b>
        <span>Home　 Leaderboard</span>
      </nav>

      <section className="evidence-page">
        <h1>Add Evidence</h1>
        <p>Give us more details. We’ll make it worse.</p>

        <div className="evidence-input">
          <input
            value={text}
            placeholder="Add a piece of evidence..."
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addEvidence();
            }}
          />

          <button onClick={addEvidence}>＋</button>
        </div>

        <div className="evidence-list">
          {evidence.map((item, index) => (
            <div key={`${item.text}-${index}`}>
              <span>{item.type}</span>
              {item.text}

              <button onClick={() => onDeleteEvidence(index)}>×</button>
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

        <Button onClick={onAnalyze}>Analyze with Evidence　→</Button>
      </section>
    </main>
  );
}