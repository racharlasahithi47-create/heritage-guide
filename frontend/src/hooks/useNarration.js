import { useEffect, useRef, useState } from 'react';

// Real (non-mocked) narration using the browser's built-in SpeechSynthesis
// API. The backend /api/narration stub exists so a real TTS provider can be
// swapped in later without changing this hook's interface much.
const LANG_CODES = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

export function useNarration() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text, language = 'en') {
    if (!('speechSynthesis' in window)) {
      alert('Narration is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language] || 'en-IN';
    utterance.rate = 0.96;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return { speak, stop, speaking };
}
