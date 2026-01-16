import { useRef, useState } from "react";

export function useSpeechHighlighter(text) {
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

 const toggleSpeech = () => {
  if (!("speechSynthesis" in window)) {
    return;
  }

  if (isSpeaking) {
    synth.cancel();
    setIsSpeaking(false);
    return;
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  // 🔑 MOBILE FIX: wait for voices
  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      speak();
      synth.onvoiceschanged = null;
    };
  } else {
    speak();
  }
};

  return { toggleSpeech, isSpeaking };
}
