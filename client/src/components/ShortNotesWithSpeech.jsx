import { normalizeNotes } from "../utils/normalizeNotes";
import { buildWordMap } from "../utils/buildWordMap";
import { useSpeechHighlighter } from "../hooks/useSpeechHighlighter";

export default function ShortNotesWithSpeech({ shortNotes = [] }) {
  // ✅ Always prepare data (even if empty)
  const speechText = normalizeNotes(shortNotes);
  const wordMap = buildWordMap(speechText);

  // ✅ Hook is ALWAYS called
  const { toggleSpeech, isSpeaking, activeIndex } =
    useSpeechHighlighter(speechText, wordMap);

  // ✅ Conditional UI comes AFTER hooks
  if (shortNotes.length === 0) return null;

  return (
    <div className="relative mt-4">
      {/* Speaker Button */}
      <button
        onClick={toggleSpeech}
        className="speech-toggle text-xl"
        title={isSpeaking ? "Stop reading notes" : "Read notes aloud"}
      >
        {isSpeaking ? "⏹️" : "🔊"}
      </button>

      {/* Bullet list stays exactly the same */}
      <ul className="list-disc pl-6 space-y-2">
        {shortNotes.map((note, i) => (
          <li key={i}>
            <HighlightedNote
              note={note}
              speechText={speechText}
              activeIndex={activeIndex}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Highlighting helper */
function HighlightedNote({ note, speechText, activeIndex }) {
  if (activeIndex === null) return <span>{note}</span>;

  return (
    <>
      {note.split("").map((char, idx) => (
        <span
          key={idx}
          className={idx === activeIndex ? "bg-yellow-300" : ""}
        >
          {char}
        </span>
      ))}
    </>
  );
}
