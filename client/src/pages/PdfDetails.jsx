import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { BlockMath } from "react-katex";
import ShortNotesWithSpeech from "../components/ShortNotesWithSpeech";
import Header from "../components/Header";


export default function PdfDetails() {
  const { id } = useParams();

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState(null);


  // ===== Content States =====
  const [shortNotes, setShortNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [questions, setQuestions] = useState([]);

  // ===== MCQ States =====
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  // ===== Helper: Reset all content =====
  const resetAllContent = () => {
    setShortNotes([]);
    setFlashcards([]);
    setFormulas([]);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmitted(false);
    setScoreData(null);
    setError("");
  };

  // ===== Fetch PDF =====
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await axios.get(`/pdf/${id}`);
        setPdf(res.data.pdf);
      } catch {
        setError("Failed to load PDF");
      }
    };
    fetchPdf();
  }, [id]);

  // ===== Notes =====
  const generateNotes = async () => {
    resetAllContent();
    setActiveAction("notes");
    setLoading(true);
    try {
      const res = await axios.post(`/pdf/${id}/summary`);
      setShortNotes(res.data.short_notes || []);
    } catch {
      setError("Unable to generate notes right now.");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // ===== Flashcards =====
  const generateFlashcards = async () => {
    resetAllContent();
    setActiveAction("flashcards");
    setLoading(true);
    try {
      const res = await axios.post(`/pdf/${id}/flashcards`);
      setFlashcards(res.data.flashcards || []);
    } catch {
      setError("Unable to generate flashcards right now.");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // ===== Formulas =====
  const generateFormulas = async () => {
    resetAllContent();
    setActiveAction("formulas");
    setLoading(true);
    try {
      const res = await axios.post(`/pdf/${id}/formulas`);
      setFormulas(res.data.formulas || []);
    } catch {
      setError("Unable to generate formulas right now.");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // ===== MCQs =====
  const generateMCQs = async () => {
    resetAllContent();
    setActiveAction("mcqs");
    setLoading(true);
    try {
      const res = await axios.post(`/pdf/${id}/quiz/regenerate`);
      setQuestions(res.data.mcqs || []);
    } catch {
      setError("Please try again after some time.");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleOptionChange = (questionId, option) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const submitQuiz = async () => {
    try {
      const payload = Object.entries(selectedAnswers).map(
        ([question_id, selected_answer]) => ({
          question_id: Number(question_id),
          selected_answer,
        })
      );

      await axios.post(`/pdf/${id}/quiz/submit`, { answers: payload });
      const scoreRes = await axios.get(`/pdf/${id}/quiz/score`);
      setScoreData(scoreRes.data);
      setSubmitted(true);
    } catch {
      setError("Quiz submission failed.");
    }
  };

  return (
    <>
    <Header />

    <div className="min-h-screen px-6 py-8 text-white bg-gradient-to-b from-slate-900 to-slate-950">
      {pdf && (
        <div className="glass max-w-5xl mx-auto p-6 rounded-2xl mb-8">
          <h1 className="text-2xl font-semibold">{pdf.original_name}</h1>
          <p className="text-sm text-gray-300 mt-1">
            File size: {(pdf.file_size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      {/* Action Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <ActionCard title="Generate Notes & Summary" color="blue" onClick={generateNotes} loading={activeAction === "notes"}/>
        <ActionCard title="Generate AI Flashcards" color="purple" onClick={generateFlashcards} loading={activeAction === "flashcards"}/>
        <ActionCard title="Generate Key Formulas" color="pink" onClick={generateFormulas} loading={activeAction === "formulas"}/>
        <ActionCard title="Generate MCQs & Quiz" color="green" onClick={generateMCQs} loading={activeAction === "mcqs"}/>
      </div>

      <div className="max-w-5xl mx-auto">
        {loading && (
          <div className="glass p-6 rounded-xl text-center text-gray-300">
            Generating content…
          </div>
        )}

        {error && (
          <div className="glass p-6 rounded-xl border border-yellow-400 text-yellow-300">
            {error}
          </div>
        )}

        {/* Notes */}
        {shortNotes.length > 0 && (
          <div className="glass p-6 rounded-xl mt-6">
            <h2 className="text-xl font-semibold mb-4">Short Notes</h2>
            <ShortNotesWithSpeech shortNotes={shortNotes} />
          </div>
        )}

        {/* Flashcards */}
        {flashcards.length > 0 && (
          <div className="glass p-6 rounded-xl mt-6">
            <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
            {flashcards.map((c, i) => (
              <div key={i} className="mb-3">
                <strong>Q:</strong> {c.front}<br />
                <strong>A:</strong> {c.back}
              </div>
            ))}
          </div>
        )}

        {/* Formulas */}
        {formulas.length > 0 && (
          <div className="glass p-6 rounded-xl mt-6">
            <h2 className="text-xl font-semibold mb-4">Formulas</h2>
            {formulas.map((f, i) => (
              <div key={i} className="mb-4">
                <BlockMath math={f.formula} />
                <p className="text-gray-300 text-sm">{f.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {/* MCQs */}
        {questions.length > 0 && (
          <div className="glass p-6 rounded-xl mt-6">
            <h2 className="text-xl font-semibold mb-4">MCQs</h2>

            {questions.map((q, idx) => (
              <div key={q.id} className="mb-6">
                <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                {q.options.map((opt, i) => (
                  <label key={i} className="block mb-1">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={submitted}
                      checked={selectedAnswers[q.id] === opt}
                      onChange={() => handleOptionChange(q.id, opt)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}

            {!submitted && (
              <button
                onClick={submitQuiz}
                className="mt-4 px-4 py-2 rounded bg-white/20"
              >
                Submit Quiz
              </button>
            )}

            {scoreData && (
  <div className="mt-6 glass p-5 rounded-xl">
    <h3 className="text-lg font-semibold mb-3">Quiz Result</h3>

    <p className="mb-4 text-green-400 font-semibold">
      Score: {scoreData.score} / {scoreData.total_questions}
    </p>

    <div className="space-y-4">
      {scoreData.details.map((d, i) => (
        <div
          key={i}
          className={`p-4 rounded border ${
            d.is_correct
              ? "border-green-500/40 bg-green-500/10"
              : "border-red-500/40 bg-red-500/10"
          }`}
        >
          <p className="font-medium mb-1">
            Q{i + 1}. {d.question}
          </p>

          <p>
            <span className="font-semibold">Your Answer:</span>{" "}
            <span className={d.is_correct ? "text-green-400" : "text-red-400"}>
              {d.selected_answer || "Not answered"}
            </span>
          </p>

          {!d.is_correct && (
            <p className="text-green-300">
              <span className="font-semibold">Correct Answer:</span>{" "}
              {d.correct_answer}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}

          </div>
        )}
      </div>
    </div>
    </>
  );
}

function ActionCard({ title, color, onClick, loading}) {
  const glow = {
    blue: "shadow-[0_0_25px_rgba(59,130,246,0.6)]",
    purple: "shadow-[0_0_25px_rgba(168,85,247,0.6)]",
    pink: "shadow-[0_0_25px_rgba(236,72,153,0.6)]",
    green: "shadow-[0_0_25px_rgba(34,197,94,0.6)]",
  };

  return (
    <div
      onClick={onClick}
      className={`glass p-6 rounded-xl cursor-pointer transition-transform hover:scale-105 ${glow[color]}`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <button
  className="mt-4 px-4 py-1 rounded bg-white/20 text-sm"
  disabled={loading}
>
  {loading ? "Generating..." : "Generate"}
</button>

    </div>
  );
}
