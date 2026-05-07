import { useState, useEffect, useCallback } from "react";

const LANGUAGES = [
  { code: "es", name: "Spanish", flag: "🇪🇸", color: "#FF6B35" },
  { code: "fr", name: "French", flag: "🇫🇷", color: "#4361EE" },
  { code: "de", name: "German", flag: "🇩🇪", color: "#F72585" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", color: "#7209B7" },
  { code: "sq", name: "Albanian", flag: "🇦🇱", color: "#E63946" },
  { code: "it", name: "Italian", flag: "🇮🇹", color: "#06D6A0" },
];

const LESSONS = {
  es: [
    { type: "translate", q: "cat", options: ["gato", "perro", "pez", "pájaro"], answer: "gato", hint: "🐱" },
    { type: "translate", q: "hello", options: ["adiós", "hola", "gracias", "por favor"], answer: "hola", hint: "👋" },
    { type: "match", pairs: [["apple", "manzana"], ["water", "agua"], ["house", "casa"], ["dog", "perro"]] },
    { type: "translate", q: "I love you", options: ["Te amo", "Lo siento", "Buenas noches", "Cómo estás"], answer: "Te amo", hint: "❤️" },
    { type: "fill", sentence: "Yo ___ un estudiante.", answer: "soy", options: ["soy", "eres", "es", "somos"], hint: "am/is/are" },
    { type: "translate", q: "beautiful", options: ["hermoso", "feo", "pequeño", "grande"], answer: "hermoso", hint: "✨" },
    { type: "translate", q: "food", options: ["comida", "bebida", "libro", "ciudad"], answer: "comida", hint: "🍽️" },
  ],
};

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#58CC02", "#FF9600", "#FF4B4B", "#1CB0F6", "#CE82FF", "#FFD900"][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: p.color,
            animation: `confettiFall 1.2s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

function MatchQuestion({ pairs, onResult }) {
  const [left] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [right] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);

  useEffect(() => {
    if (selL !== null && selR !== null) {
      const lPair = left[selL];
      const rPair = right[selR];
      if (lPair[0] === rPair[0]) {
        const next = [...matched, lPair[0]];
        setMatched(next);
        setSelL(null);
        setSelR(null);
        if (next.length === pairs.length) setTimeout(() => onResult(true), 500);
      } else {
        setWrong([`${selL}L`, `${selR}R`]);
        setTimeout(() => {
          setSelL(null);
          setSelR(null);
          setWrong([]);
        }, 700);
      }
    }
  }, [selL, selR, left, right, matched, pairs.length, onResult]);

  const btnStyle = (key, type, idx) => {
    const isMatched = matched.includes(key);
    const isWrong = wrong.includes(`${idx}${type}`);
    const isSel = type === "L" ? selL === idx : selR === idx;
    return {
      padding: "14px 20px",
      borderRadius: 16,
      border: "2px solid",
      fontFamily: "inherit",
      fontSize: 15,
      cursor: isMatched ? "default" : "pointer",
      fontWeight: 700,
      transition: "all 0.15s",
      background: isMatched ? "#d7ffb8" : isWrong ? "#ffd4d4" : isSel ? "#ddf4ff" : "#fff",
      borderColor: isMatched ? "#58CC02" : isWrong ? "#FF4B4B" : isSel ? "#1CB0F6" : "#e5e7eb",
      color: isMatched ? "#2d7a00" : isWrong ? "#c0392b" : "#1e293b",
      opacity: isMatched ? 0.6 : 1,
      transform: isSel ? "scale(1.03)" : "scale(1)",
    };
  };

  return (
    <div>
      <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 24, fontSize: 14 }}>Tap matching pairs</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {left.map((p, i) => (
            <button key={i} disabled={matched.includes(p[0])} onClick={() => setSelL(i)} style={btnStyle(p[0], "L", i)}>
              {p[0]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {right.map((p, i) => (
            <button key={i} disabled={matched.includes(p[0])} onClick={() => setSelR(i)} style={btnStyle(p[0], "R", i)}>
              {p[1]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Duolingo() {
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [streak] = useState(7);
  const [selected, setSelected] = useState(null);
  const [fillVal, setFillVal] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [showConf, setShowConf] = useState(false);

  const lessons = lang ? LESSONS[lang.code] : [];
  const question = lessons[qIdx];

  const startLesson = (l) => {
    setLang(l);
    setQIdx(0);
    setHearts(3);
    setSelected(null);
    setFillVal("");
    setAnswered(false);
    setCorrect(null);
    setScreen("lesson");
  };

  const advance = useCallback(() => {
    const next = qIdx + 1;
    if (next >= lessons.length || hearts <= 0) {
      setShowConf(next >= lessons.length);
      setScreen("result");
      return;
    }
    setQIdx(next);
    setSelected(null);
    setFillVal("");
    setAnswered(false);
    setCorrect(null);
  }, [qIdx, lessons.length, hearts]);

  const handleMatchResult = () => {
    setXp((x) => x + 20);
    advance();
  };

  const checkAnswer = () => {
    if (answered) return;
    const ans = question.type === "fill" ? fillVal : selected;
    const ok = ans === question.answer;
    setAnswered(true);
    setCorrect(ok);
    if (ok) setXp((x) => x + 10);
    else setHearts((h) => h - 1);
  };

  if (screen === "home") {
    return (
      <div>
        <h1>Duolingo Clone</h1>
        <p>🔥 {streak} day streak · ⚡ {xp} XP</p>
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => startLesson(l)}>{l.flag} {l.name}</button>
        ))}
      </div>
    );
  }

  if (screen === "result") {
    const won = hearts > 0;
    return (
      <div>
        {showConf && <Confetti />}
        <h2>{won ? "Lesson Complete!" : "Out of Hearts!"}</h2>
        <button onClick={() => setScreen("home")}>Back to Home</button>
      </div>
    );
  }

  const isMatch = question?.type === "match";
  const canCheck = isMatch ? false : question?.type === "fill" ? fillVal.trim().length > 0 : selected !== null;

  return (
    <div>
      <p>{lang?.flag} {lang?.name}</p>
      {isMatch ? (
        <MatchQuestion pairs={question.pairs} onResult={handleMatchResult} />
      ) : (
        <>
          <p>{question?.type === "fill" ? question?.sentence : question?.q}</p>
          {question?.type === "translate" && question.options.map((opt) => (
            <button key={opt} disabled={answered} onClick={() => setSelected(opt)}>{opt}</button>
          ))}
          {question?.type === "fill" && (
            <input value={fillVal} onChange={(e) => setFillVal(e.target.value)} disabled={answered} />
          )}
          <button disabled={!canCheck && !answered} onClick={answered ? advance : checkAnswer}>
            {answered ? "Continue" : "Check"}
          </button>
          {answered && !correct && <p>Correct answer: {question.answer}</p>}
        </>
      )}
    </div>
  );
}
