import Button from "../components/Button";
import ScoreCard from "../components/ScoreCard";
import StageCard from "../components/StageCard";

const branches = [
  { label: "Probably nothing", tone: "calm", points: 5 },
  { label: "Something feels off", tone: "maybe", points: 12 },
  { label: "Something is definitely wrong", tone: "danger", points: 22 },
];

export default function Game({
  situation,
  stages,
  score,
  status,
  onChooseBranch,
  onMakeWorse,
  onOpenEvidence,
  onBack,
}) {
  return (
    <main className="app-page">
      <nav>
        <button className="back" onClick={onBack}>← Back</button>
        <b>Overthink<sup>™</sup></b>
        <span>Home　 Leaderboard</span>
      </nav>

      <section className="game">
        <div>
          <div className="situation-box">
            <small>Your Situation</small>
            <strong>“{situation}”</strong>
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
            onClick={onMakeWorse}
          >
            🔥 MAKE IT WORSE
          </Button>
        </div>

        <aside>
          <ScoreCard score={score} status={status} />

          <h3>What do you think?</h3>

          {branches.map((branch) => (
            <button
              key={branch.label}
              className={`branch ${branch.tone}`}
              onClick={() => onChooseBranch(branch)}
            >
              {branch.label}
              <span>→</span>
            </button>
          ))}

          <Button variant="outline" onClick={onOpenEvidence}>
            Add evidence　＋
          </Button>
        </aside>
      </section>
    </main>
  );
}