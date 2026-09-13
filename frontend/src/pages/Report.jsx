import Button from "../components/Button";

export default function Report({
  situation,
  mode,
  score,
  status,
  branchesTaken,
  evidence,
  worseClicks,
  onRestart,
}) {
  return (
    <main className="app-page">
      <nav>
        <button className="back" onClick={onRestart}>← Home</button>
        <b>Overthink<sup>™</sup></b>
        <span>Home　 Leaderboard</span>
      </nav>

      <section className="report">
        <h1>🧠 OVERTHINKING REPORT</h1>

        <p>
          <b>Situation:</b>
          <br />
          “{situation}”
        </p>

        <p>
          <b>Mode:</b>　{mode.icon} {mode.label}
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
            Branches taken
            <b>{branchesTaken.length}</b>
          </span>

          <span>
            Evidence collected
            <b>{evidence.length}</b>
          </span>

          <span>
            MAKE IT WORSE
            <b>{worseClicks} times</b>
          </span>
        </div>

        <h3>Final conclusion</h3>

        <p>
          You started with one small situation and ended up investigating an
          imaginary conspiracy.
        </p>

        <p className="verdict">
          <b>Verdict:</b> There is probably nothing wrong. You have
          successfully created a problem where there may not be one.
        </p>

        <Button variant="pink" onClick={onRestart}>
          Overthink Again　↻
        </Button>
      </section>
    </main>
  );
}