import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
        <div className="home-particles">
  {Array.from({ length: 25 }).map((_, i) => (
    <span
      key={i}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
      }}
    />
  ))}
</div>

      <div className="home-glow" />

      <div className="home-content">
        <h1 className="home-title">
          Welcome to <span>Learning Hub</span>
        </h1>

        <p className="home-subtitle">
          Upload PDFs and instantly generate smart study notes, flashcards,
          formulas, and quizzes — powered by AI.
        </p>

        <div className="home-buttons">
          <button
            className="home-btn primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="home-btn secondary"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
