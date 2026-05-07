import { useState, useEffect, useCallback } from "react";

const LANGUAGES = [
  { code: "en", name: "Anglisht", flag: "🇬🇧", color: "#1D4ED8" },
  { code: "es", name: "Spanjisht", flag: "🇪🇸", color: "#FF6B35" },
  { code: "fr", name: "Frëngjisht", flag: "🇫🇷", color: "#4361EE" },
  { code: "de", name: "Gjermanisht", flag: "🇩🇪", color: "#F72585" },
  { code: "ja", name: "Japonisht", flag: "🇯🇵", color: "#7209B7" },
  { code: "sq", name: "Shqip", flag: "🇦🇱", color: "#E63946" },
  { code: "it", name: "Italisht", flag: "🇮🇹", color: "#06D6A0" },
];

const LESSONS = {
  en: [
    { type: "translate", q: "mace", options: ["cat", "dog", "fish", "bird"], answer: "cat", hint: "🐱" },
    { type: "translate", q: "përshëndetje", options: ["goodbye", "hello", "thanks", "please"], answer: "hello", hint: "👋" },
    { type: "match", pairs: [["apple", "mollë"], ["water", "ujë"], ["house", "shtëpi"], ["dog", "qen"]] },
    { type: "translate", q: "të dua", options: ["I love you", "I am sorry", "good night", "how are you"], answer: "I love you", hint: "❤️" },
    { type: "fill", sentence: "I ___ a student.", answer: "am", options: ["am", "is", "are", "be"], hint: "jam/është" },
  ],
  es: [
    { type: "translate", q: "cat", options: ["gato", "perro", "pez", "pájaro"], answer: "gato", hint: "🐱" },
    { type: "translate", q: "hello", options: ["adiós", "hola", "gracias", "por favor"], answer: "hola", hint: "👋" },
    { type: "match", pairs: [["apple", "manzana"], ["water", "agua"], ["house", "casa"], ["dog", "perro"]] },
    { type: "translate", q: "I love you", options: ["Te amo", "Lo siento", "Buenas noches", "Cómo estás"], answer: "Te amo", hint: "❤️" },
    { type: "fill", sentence: "Yo ___ un estudiante.", answer: "soy", options: ["soy", "eres", "es", "somos"], hint: "am/is/are" },
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

  useEffect(() => {
    if (selL !== null && selR !== null) {
      const lPair = left[selL];
      const rPair = right[selR];
      if (lPair[0] === rPair[0]) {
        const next = [...matched, lPair[0]];
        setMatched(next);
        setSelL(null);
        setSelR(null);
        if (next.length === pairs.length) setTimeout(() => onResult(true), 300);
      } else {
        setTimeout(() => {
          setSelL(null);
          setSelR(null);
        }, 500);
      }
    }
  }, [selL, selR, left, right, matched, pairs.length, onResult]);

  return (
    <div>
      <p>Zgjidh çiftet që përputhen:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {left.map((p, i) => (
            <button key={`${p[0]}-${i}`} disabled={matched.includes(p[0])} onClick={() => setSelL(i)}>
              {p[0]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {right.map((p, i) => (
            <button key={`${p[1]}-${i}`} disabled={matched.includes(p[0])} onClick={() => setSelR(i)}>
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

  const lessons = lang ? LESSONS[lang.code] || [] : [];
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
    if (answered || !question) return;
    const ans = question.type === "fill" ? fillVal.trim() : selected;
    const ok = ans === question.answer;
    setAnswered(true);
    setCorrect(ok);
    if (ok) setXp((x) => x + 10);
    else setHearts((h) => h - 1);
  };

  if (screen === "home") {
    return (
      <div>
        <h1>Mëso gjuhë me Duo</h1>
        <p>🔥 Seria: {streak} ditë · ⚡ XP: {xp}</p>
        <p>Zgjidh gjuhën që dëshiron të mësosh:</p>
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => startLesson(l)}>
            {l.flag} {l.name}
          </button>
        ))}
      </div>
    );
  }

  if (screen === "result") {
    const won = hearts > 0;
    return (
      <div>
        {showConf && <Confetti />}
        <h2>{won ? "Mësimi u përfundua!" : "Nuk ke më zemra!"}</h2>
        <p>{won ? `Fitove ${xp} XP.` : "Provoje edhe një herë."}</p>
        <button onClick={() => setScreen("home")}>Kthehu në fillim</button>
      </div>
    );
  }

  if (!question) {
    return (
      <div>
        <p>Kjo gjuhë nuk ka ende mësime.</p>
        <button onClick={() => setScreen("home")}>Kthehu</button>
      </div>
    );
  }

  const isMatch = question.type === "match";
  const canCheck = isMatch ? false : question.type === "fill" ? fillVal.trim().length > 0 : selected !== null;

  return (
    <div>
      <p>{lang?.flag} {lang?.name}</p>
      {isMatch ? (
        <MatchQuestion pairs={question.pairs} onResult={handleMatchResult} />
      ) : (
        <>
          <p>{question.type === "fill" ? question.sentence : `Përkthe: ${question.q}`}</p>
          {question.type === "translate" &&
            question.options.map((opt) => (
              <button key={opt} disabled={answered} onClick={() => setSelected(opt)}>
                {opt}
              </button>
            ))}
          {question.type === "fill" && (
            <input
              value={fillVal}
              onChange={(e) => setFillVal(e.target.value)}
              disabled={answered}
              placeholder="Shkruaj përgjigjen"
            />
          )}
          <button disabled={!canCheck && !answered} onClick={answered ? advance : checkAnswer}>
            {answered ? "Vazhdo" : "Kontrollo"}
          </button>
          {answered && !correct && <p>Përgjigjja e saktë: {question.answer}</p>}
        </>
      )}
    </div>
  );
}
