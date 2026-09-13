import Button from "../components/Button";
import ModeCard from "../components/ModeCard";

const examples = [
  "They left me on seen",
  "My professor said ‘see me after class’",
  "They viewed my story but didn’t like it",
  "My friend replied ‘k’",
];

const modes = [
  { id: "optimist", icon: "🧘", label: "Optimist" },
  { id: "detective", icon: "🕵️", label: "Detective" },
  { id: "delulu", icon: "🤡", label: "Delulu" },
  { id: "drama", icon: "🎬", label: "Drama" },
];

export default function Input({
  situation,
  setSituation,
  mode,
  setMode,
  onStart,
}) {
  return (
    <main className="app-page">
      <nav>
        <button className="back" onClick={() => window.history.back()}>
          ← Back
        </button>
        <b>Overthink<sup>™</sup></b>
        <span>Home　 Leaderboard</span>
      </nav>

      <section className="input-page">
        <h1>What’s bothering you?</h1>

        <textarea
          value={situation}
          maxLength="200"
          placeholder={"Type your situation here...\ne.g. My friend replied ‘k’"}
          onChange={(event) => setSituation(event.target.value)}
        />

        <small>{situation.length}/200</small>

        <p>Or try an example:</p>

        <div className="examples">
          {examples.map((example) => (
            <button key={example} onClick={() => setSituation(example)}>
              {example}
            </button>
          ))}
        </div>

        <h3>Choose your overthinking mode:</h3>

        <div className="modes">
          {modes.map((item) => (
            <ModeCard
              key={item.id}
              mode={item}
              selected={mode === item.id}
              onClick={() => setMode(item.id)}
            />
          ))}
        </div>

        <Button onClick={onStart}>Overthink It　→</Button>
      </section>
    </main>
  );
}