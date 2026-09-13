import Button from "../components/Button";

export default function Home({ onStart }) {
  return (
    <main className="hero">
      <nav>
        <b>Overthink<sup>™</sup></b>
        <span>Home　 Leaderboard　 About</span>
      </nav>

      <section className="hero-copy">
        <p className="eyebrow">THE WORLD'S MOST UNNECESSARY APP</p>
        <h1>Overthink<span>™</span></h1>
        <h2>Turning small problems<br />into big problems since today.</h2>

        <div className="brain">
          🧠
          <i>What if?</i>
          <em>Did I say something wrong?</em>
          <small>It’s probably nothing... right?</small>
        </div>

        <Button variant="pink" onClick={onStart}>
          Start Overthinking　→
        </Button>

        <p className="disclaimer">
          ☺ A completely unnecessary but very important app.
        </p>
      </section>
    </main>
  );
}