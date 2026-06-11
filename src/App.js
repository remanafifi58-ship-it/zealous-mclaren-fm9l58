import { useState, useEffect, useRef } from "react";

// ── Anthropic helper ──────────────────────────────────────────────────────────
async function callClaude(messages, system = "") {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages,
  };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("\n") || "";
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const PLANTS = [
  {
    id: "mint",
    name: "نعناع",
    emoji: "🌿",
    season: "ربيع/خريف",
    days: 30,
    water: "عالي",
  },
  {
    id: "basil",
    name: "ريحان",
    emoji: "🌱",
    season: "صيف",
    days: 45,
    water: "متوسط",
  },
  {
    id: "tomato",
    name: "طماطم",
    emoji: "🍅",
    season: "ربيع/صيف",
    days: 80,
    water: "عالي",
  },
  {
    id: "pepper",
    name: "فلفل",
    emoji: "🌶️",
    season: "صيف",
    days: 90,
    water: "متوسط",
  },
  {
    id: "strawberry",
    name: "فراولة",
    emoji: "🍓",
    season: "ربيع",
    days: 60,
    water: "عالي",
  },
  {
    id: "cucumber",
    name: "خيار",
    emoji: "🥒",
    season: "صيف",
    days: 55,
    water: "عالي",
  },
  {
    id: "lettuce",
    name: "خس",
    emoji: "🥬",
    season: "ربيع/خريف",
    days: 45,
    water: "متوسط",
  },
  {
    id: "potato",
    name: "بطاطا",
    emoji: "🥔",
    season: "ربيع",
    days: 100,
    water: "متوسط",
  },
  {
    id: "garlic",
    name: "ثوم",
    emoji: "🧄",
    season: "خريف/شتاء",
    days: 180,
    water: "منخفض",
  },
  {
    id: "onion",
    name: "بصل",
    emoji: "🧅",
    season: "خريف",
    days: 120,
    water: "منخفض",
  },
  {
    id: "cactus",
    name: "صبار",
    emoji: "🌵",
    season: "طوال العام",
    days: 365,
    water: "منخفض جداً",
  },
  {
    id: "rose",
    name: "ورد",
    emoji: "🌹",
    season: "ربيع",
    days: 60,
    water: "متوسط",
  },
  {
    id: "sunflower",
    name: "عباد الشمس",
    emoji: "🌻",
    season: "صيف",
    days: 70,
    water: "متوسط",
  },
  {
    id: "mango",
    name: "مانجو",
    emoji: "🥭",
    season: "صيف",
    days: 120,
    water: "متوسط",
  },
  {
    id: "lemon",
    name: "ليمون",
    emoji: "🍋",
    season: "شتاء/ربيع",
    days: 180,
    water: "متوسط",
  },
  {
    id: "custom",
    name: "نبات مخصص",
    emoji: "🌾",
    season: "حسب النوع",
    days: 0,
    water: "متوسط",
  },
];

const GOALS = [
  { id: "home", name: "زراعة منزلية", emoji: "🏡" },
  { id: "commercial", name: "زراعة تجارية", emoji: "💼" },
  { id: "learning", name: "تعلم الزراعة", emoji: "📚" },
  { id: "vegetables", name: "زراعة خضروات", emoji: "🥕" },
  { id: "fruits", name: "زراعة فواكه", emoji: "🍎" },
  { id: "herbs", name: "زراعة أعشاب", emoji: "🌿" },
  { id: "productivity", name: "تحسين الإنتاجية", emoji: "📈" },
];

const WEATHER_MOCK = {
  city: "القاهرة",
  temp: 32,
  condition: "مشمس جزئياً",
  humidity: 45,
  wind: 12,
  icon: "⛅",
  forecast: [
    { day: "اليوم", icon: "⛅", high: 32, low: 22 },
    { day: "غداً", icon: "☀️", high: 35, low: 24 },
    { day: "الأربعاء", icon: "🌤️", high: 33, low: 23 },
    { day: "الخميس", icon: "⛈️", high: 28, low: 20 },
    { day: "الجمعة", icon: "🌧️", high: 26, low: 19 },
    { day: "السبت", icon: "☀️", high: 34, low: 23 },
    { day: "الأحد", icon: "☀️", high: 36, low: 25 },
  ],
};

const DAILY_TASKS = [
  {
    id: 1,
    text: "ري الطماطم في الصباح الباكر",
    plant: "🍅",
    done: false,
    priority: "high",
  },
  {
    id: 2,
    text: "فحص أوراق النعناع للآفات",
    plant: "🌿",
    done: false,
    priority: "medium",
  },
  {
    id: 3,
    text: "إضافة سماد للفراولة",
    plant: "🍓",
    done: true,
    priority: "low",
  },
  { id: 4, text: "تقليم الورد", plant: "🌹", done: false, priority: "medium" },
  {
    id: 5,
    text: "قياس رطوبة التربة للخيار",
    plant: "🥒",
    done: true,
    priority: "low",
  },
];

const LESSONS = [
  {
    id: 1,
    title: "أساسيات الزراعة",
    icon: "🌱",
    duration: "١٥ دقيقة",
    level: "مبتدئ",
    color: "#52B788",
  },
  {
    id: 2,
    title: "أنواع التربة والتسميد",
    icon: "🪱",
    duration: "٢٠ دقيقة",
    level: "مبتدئ",
    color: "#F4A261",
  },
  {
    id: 3,
    title: "أنظمة الري الحديثة",
    icon: "💧",
    duration: "٢٥ دقيقة",
    level: "متوسط",
    color: "#4895EF",
  },
  {
    id: 4,
    title: "مكافحة الآفات",
    icon: "🐛",
    duration: "٣٠ دقيقة",
    level: "متوسط",
    color: "#E63946",
  },
  {
    id: 5,
    title: "الزراعة العضوية",
    icon: "♻️",
    duration: "٣٥ دقيقة",
    level: "متقدم",
    color: "#8B5E3C",
  },
  {
    id: 6,
    title: "تقنيات الحصاد",
    icon: "🌾",
    duration: "٢٠ دقيقة",
    level: "متوسط",
    color: "#F4A261",
  },
];

// ── Style tokens ──────────────────────────────────────────────────────────────
const C = {
  forest: "#1B4332",
  sage: "#52B788",
  sageLight: "#B7E4C7",
  cream: "#F8F4E8",
  amber: "#F4A261",
  earth: "#8B5E3C",
  white: "#FAFAF7",
  gray: "#6C757D",
  lightGray: "#E9ECEF",
  red: "#E63946",
  blue: "#4895EF",
  dark: "#1A1A2E",
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; direction: rtl; background: ${C.cream}; color: ${C.dark}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.sageLight}; border-radius: 4px; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .pulse { animation: pulse 2s infinite; }

  .app-shell {
    max-width: 430px;
    min-height: 100vh;
    margin: 0 auto;
    background: ${C.cream};
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px rgba(0,0,0,0.15);
  }

  .page { flex: 1; overflow-y: auto; padding-bottom: 90px; }

  /* Bottom nav */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: ${C.white};
    border-top: 1.5px solid ${C.sageLight};
    display: flex;
    z-index: 100;
    box-shadow: 0 -4px 20px rgba(27,67,50,0.08);
    border-radius: 20px 20px 0 0;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 4px 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: none;
    gap: 3px;
    position: relative;
  }
  .nav-item .icon { font-size: 22px; transition: transform 0.2s; }
  .nav-item .label { font-size: 10px; font-family: 'Cairo', sans-serif; color: ${C.gray}; font-weight: 500; }
  .nav-item.active .label { color: ${C.forest}; font-weight: 700; }
  .nav-item.active .icon { transform: scale(1.2); }
  .nav-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 3px;
    background: ${C.sage};
    border-radius: 2px 2px 0 0;
  }

  /* Cards */
  .card {
    background: ${C.white};
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 2px 12px rgba(27,67,50,0.07);
    margin: 0 16px 14px;
  }
  .card-title { font-size: 15px; font-weight: 700; color: ${C.forest}; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg, ${C.sage}, ${C.forest});
    color: white;
    border: none;
    border-radius: 14px;
    padding: 14px 24px;
    font-family: 'Cairo', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(82,183,136,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(82,183,136,0.45); }
  .btn-primary:active { transform: translateY(0); }
  .btn-outline {
    background: transparent;
    color: ${C.forest};
    border: 2px solid ${C.sageLight};
    border-radius: 14px;
    padding: 12px 24px;
    font-family: 'Cairo', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
  }
  .btn-outline:hover { background: ${C.sageLight}; }

  /* Tag/chip */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  .chip.selected { background: ${C.forest}; color: white; border-color: ${C.forest}; }
  .chip.unselected { background: ${C.white}; color: ${C.gray}; border-color: ${C.lightGray}; }
  .chip:hover { border-color: ${C.sage}; }

  /* Progress bar */
  .progress-bar {
    height: 8px;
    background: ${C.lightGray};
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, ${C.sage}, ${C.forest});
    border-radius: 4px;
    transition: width 0.8s ease;
  }

  /* Loading */
  .loading-dot {
    display: inline-block;
    width: 8px; height: 8px;
    background: ${C.sage};
    border-radius: 50%;
    margin: 0 3px;
    animation: pulse 1.2s infinite;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }

  /* Disease upload area */
  .upload-zone {
    border: 2.5px dashed ${C.sageLight};
    border-radius: 20px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(82,183,136,0.04);
  }
  .upload-zone:hover { border-color: ${C.sage}; background: rgba(82,183,136,0.08); }

  /* Chat */
  .chat-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  .chat-bubble.user {
    background: linear-gradient(135deg, ${C.sage}, ${C.forest});
    color: white;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
    margin-right: auto;
    margin-left: 0;
  }
  .chat-bubble.ai {
    background: ${C.white};
    color: ${C.dark};
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    align-self: flex-start;
    margin-left: auto;
    margin-right: 0;
  }

  /* Onboarding */
  .onboard-step {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 40px 24px 30px;
    background: ${C.cream};
  }
  .step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 32px; }
  .step-dot {
    width: 8px; height: 8px;
    border-radius: 4px;
    background: ${C.lightGray};
    transition: all 0.3s;
  }
  .step-dot.active { background: ${C.forest}; width: 24px; }
  .step-dot.done { background: ${C.sage}; }

  input[type="text"], textarea {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid ${C.lightGray};
    border-radius: 14px;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    outline: none;
    background: ${C.white};
    transition: border-color 0.2s;
    direction: rtl;
  }
  input[type="text"]:focus, textarea:focus { border-color: ${C.sage}; }
`;

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const togglePlant = (id) =>
    setSelectedPlants((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  const toggleGoal = (id) =>
    setSelectedGoals((g) =>
      g.includes(id) ? g.filter((x) => x !== id) : [...g, id]
    );

  const steps = [
    // 0 — Welcome
    <div className="onboard-step fade-in" key="s0">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 90, marginBottom: 20, textAlign: "center" }}>
          🌱
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: C.forest,
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: 14,
          }}
        >
          مرحباً بك في
          <br />
          مساعد المزارع الذكي
        </h1>
        <p
          style={{
            fontSize: 15,
            color: C.gray,
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: 300,
          }}
        >
          مرافقك الزراعي الشخصي — يساعدك على زراعة نباتاتك بنجاح من خلال الذكاء
          الاصطناعي والتوصيات اليومية
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            "🌤️ طقس ذكي",
            "🤖 كشف أمراض",
            "📋 مهام يومية",
            "📚 تعلم الزراعة",
          ].map((f) => (
            <span
              key={f}
              style={{
                background: C.sageLight,
                color: C.forest,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 30 }}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              color: C.gray,
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            ما اسمك؟
          </label>
          <input
            type="text"
            placeholder="أدخل اسمك..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setStep(1)}>
          ابدأ رحلتك الزراعية 🚀
        </button>
      </div>
    </div>,

    // 1 — Level
    <div className="onboard-step fade-in" key="s1">
      <h2
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: C.forest,
          marginBottom: 8,
        }}
      >
        ما مستواك الزراعي؟
      </h2>
      <p
        style={{
          color: C.gray,
          fontSize: 14,
          marginBottom: 28,
          lineHeight: 1.7,
        }}
      >
        سنقوم بتخصيص المحتوى والتوصيات بناءً على خبرتك
      </p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}
      >
        {[
          {
            id: "beginner",
            label: "مبتدئ",
            desc: "بداية رحلتي في الزراعة",
            icon: "🌱",
            color: "#E8F5E9",
          },
          {
            id: "intermediate",
            label: "متوسط",
            desc: "لدي بعض الخبرة في الزراعة",
            icon: "🌿",
            color: "#C8E6C9",
          },
          {
            id: "advanced",
            label: "متقدم",
            desc: "مزارع محترف أو طالب زراعة",
            icon: "🌳",
            color: "#A5D6A7",
          },
        ].map((l) => (
          <div
            key={l.id}
            onClick={() => setLevel(l.id)}
            style={{
              background: level === l.id ? C.forest : C.white,
              color: level === l.id ? "white" : C.dark,
              borderRadius: 18,
              padding: "18px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 16,
              border: `2px solid ${level === l.id ? C.forest : C.lightGray}`,
              transition: "all 0.2s",
              boxShadow:
                level === l.id ? "0 4px 16px rgba(27,67,50,0.25)" : "none",
            }}
          >
            <span style={{ fontSize: 36 }}>{l.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{l.label}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
                {l.desc}
              </div>
            </div>
            {level === l.id && (
              <span style={{ marginRight: "auto", fontSize: 20 }}>✓</span>
            )}
          </div>
        ))}
      </div>
      <button
        className="btn-primary"
        onClick={() => level && setStep(2)}
        style={{ marginTop: 24, opacity: level ? 1 : 0.5 }}
      >
        التالي ←
      </button>
    </div>,

    // 2 — Plants
    <div
      className="onboard-step fade-in"
      key="s2"
      style={{ paddingBottom: 100 }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: C.forest,
          marginBottom: 8,
        }}
      >
        ماذا تزرع أو تنوي زراعته؟
      </h2>
      <p
        style={{
          color: C.gray,
          fontSize: 14,
          marginBottom: 24,
          lineHeight: 1.7,
        }}
      >
        اختر نباتاً أو أكثر — يمكنك إضافة المزيد لاحقاً
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>
        {PLANTS.map((p) => (
          <div
            key={p.id}
            onClick={() => togglePlant(p.id)}
            className={`chip ${
              selectedPlants.includes(p.id) ? "selected" : "unselected"
            }`}
            style={{ fontSize: 13, padding: "8px 14px" }}
          >
            <span>{p.emoji}</span> {p.name}
          </div>
        ))}
      </div>
      <button
        className="btn-primary"
        onClick={() => selectedPlants.length > 0 && setStep(3)}
        style={{ marginTop: 24, opacity: selectedPlants.length > 0 ? 1 : 0.5 }}
      >
        التالي ← ({selectedPlants.length} نباتات)
      </button>
    </div>,

    // 3 — Goals
    <div className="onboard-step fade-in" key="s3">
      <h2
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: C.forest,
          marginBottom: 8,
        }}
      >
        ما هدفك الزراعي؟
      </h2>
      <p
        style={{
          color: C.gray,
          fontSize: 14,
          marginBottom: 24,
          lineHeight: 1.7,
        }}
      >
        حدد هدفك لنساعدك بشكل أفضل
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>
        {GOALS.map((g) => (
          <div
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`chip ${
              selectedGoals.includes(g.id) ? "selected" : "unselected"
            }`}
            style={{ fontSize: 13, padding: "8px 14px" }}
          >
            <span>{g.emoji}</span> {g.name}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <button
          className="btn-primary"
          onClick={() =>
            selectedGoals.length > 0 &&
            onComplete({
              name,
              level,
              plants: selectedPlants,
              goals: selectedGoals,
            })
          }
          style={{ opacity: selectedGoals.length > 0 ? 1 : 0.5 }}
        >
          ابدأ استخدام التطبيق 🌱
        </button>
      </div>
    </div>,
  ];

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: C.cream,
        fontFamily: "'Cairo',sans-serif",
        direction: "rtl",
      }}
    >
      <style>{globalCSS}</style>
      <div
        style={{
          padding: "20px 24px 0",
          display: "flex",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`step-dot ${
              i === step ? "active" : i < step ? "done" : ""
            }`}
          />
        ))}
      </div>
      {steps[step]}
    </div>
  );
}

// ── Home Tab ──────────────────────────────────────────────────────────────────
function HomeTab({ user }) {
  const [tasks, setTasks] = useState(DAILY_TASKS);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  const toggleTask = (id) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const userPlants = PLANTS.filter((p) => user.plants.includes(p.id));
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="page fade-in">
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(160deg, ${C.forest} 0%, #2D6A4F 100%)`,
          padding: "50px 20px 30px",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <p style={{ color: C.sageLight, fontSize: 13, fontWeight: 500 }}>
              {greeting} 👋
            </p>
            <h1
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: 900,
                marginTop: 2,
              }}
            >
              {user.name || "مزارعنا الجميل"}
            </h1>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "8px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24 }}>🌡️</div>
            <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>
              {WEATHER_MOCK.temp}°
            </div>
          </div>
        </div>

        {/* Weather mini */}
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: 18,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 36 }}>{WEATHER_MOCK.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
              {WEATHER_MOCK.city} — {WEATHER_MOCK.condition}
            </div>
            <div style={{ color: C.sageLight, fontSize: 12, marginTop: 3 }}>
              رطوبة {WEATHER_MOCK.humidity}% • رياح {WEATHER_MOCK.wind} كم/س
            </div>
          </div>
          <div
            style={{
              background: "rgba(244,162,97,0.3)",
              borderRadius: 10,
              padding: "6px 10px",
            }}
          >
            <div style={{ color: C.amber, fontSize: 11, fontWeight: 700 }}>
              ⚠️ حرارة مرتفعة
            </div>
          </div>
        </div>
      </div>

      {/* Task progress */}
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">
          <span>📋</span> مهام اليوم
          <span
            style={{
              marginRight: "auto",
              background: C.sageLight,
              color: C.forest,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
            }}
          >
            {done}/{tasks.length}
          </span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 14 }}>
          <div
            className="progress-fill"
            style={{ width: `${(done / tasks.length) * 100}%` }}
          />
        </div>
        {tasks.slice(0, 4).map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: `1px solid ${C.lightGray}`,
            }}
          >
            <div
              onClick={() => toggleTask(t.id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 8,
                border: `2px solid ${t.done ? C.sage : C.lightGray}`,
                background: t.done ? C.sage : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {t.done && (
                <span style={{ color: "white", fontSize: 13 }}>✓</span>
              )}
            </div>
            <span style={{ fontSize: 14 }}>{t.plant}</span>
            <span
              style={{
                fontSize: 13,
                color: t.done ? C.gray : C.dark,
                textDecoration: t.done ? "line-through" : "none",
                flex: 1,
                textDecorationColor: C.gray,
              }}
            >
              {t.text}
            </span>
            {t.priority === "high" && !t.done && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: C.red,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* My Plants */}
      <div className="card">
        <div className="card-title">
          <span>🪴</span> نباتاتي
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {userPlants.map((p) => {
            const progress = Math.floor(Math.random() * 60 + 20);
            return (
              <div
                key={p.id}
                style={{
                  background: C.cream,
                  borderRadius: 16,
                  padding: "14px 16px",
                  minWidth: 110,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{p.emoji}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 5 }}>
                  {progress}% نمو
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI tip */}
      <div
        className="card"
        style={{ background: `linear-gradient(135deg, ${C.forest}, #2D6A4F)` }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🤖</span>
          <div>
            <div
              style={{
                color: C.sageLight,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              نصيحة اليوم من الذكاء الاصطناعي
            </div>
            <div style={{ color: "white", fontSize: 14, lineHeight: 1.7 }}>
              درجة الحرارة مرتفعة اليوم (٣٢°). يُنصح بري نباتاتك في الصباح
              الباكر أو بعد الغروب لتجنب تبخر الماء وإجهاد النبات.
            </div>
          </div>
        </div>
      </div>

      {/* Weekly forecast strip */}
      <div className="card">
        <div className="card-title">
          <span>🗓️</span> توقعات الأسبوع
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {WEATHER_MOCK.forecast.map((f, i) => (
            <div
              key={i}
              style={{
                background: i === 0 ? C.forest : C.cream,
                borderRadius: 14,
                padding: "12px 10px",
                minWidth: 58,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: i === 0 ? C.sageLight : C.gray,
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                {f.day}
              </div>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: i === 0 ? "white" : C.dark,
                }}
              >
                {f.high}°
              </div>
              <div
                style={{ fontSize: 11, color: i === 0 ? C.sageLight : C.gray }}
              >
                {f.low}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Disease Detection Tab ─────────────────────────────────────────────────────
function DiseaseTab() {
  const [stage, setStage] = useState("upload"); // upload | analyzing | result
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const fakeAnalyze = () => {
    setStage("analyzing");
    setTimeout(() => {
      setResult({
        disease: "عفن الجذور الفطري",
        confidence: 87,
        severity: "متوسط",
        severityColor: C.amber,
        symptoms: "اصفرار الأوراق، ضعف النمو، تعفن في قاعدة الساق",
        treatment:
          "قلل الري فوراً. استخدم مبيد فطري (مثل الكابتان). تحسين تصريف التربة.",
        prevention:
          "تجنب الإفراط في الري. تأكد من وجود ثقوب تصريف كافية في الأصص.",
        plant: "🍅 طماطم",
      });
      setStage("result");
    }, 2800);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target.result);
        fakeAnalyze();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page fade-in">
      <div style={{ padding: "50px 16px 16px" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: C.forest,
            marginBottom: 6,
          }}
        >
          🔬 كشف أمراض النباتات
        </h2>
        <p
          style={{
            color: C.gray,
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.7,
          }}
        >
          صوّر نبتتك وسيقوم الذكاء الاصطناعي بتشخيص المشكلة فوراً
        </p>

        {stage === "upload" && (
          <>
            <div
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
            >
              <div style={{ fontSize: 64, marginBottom: 12 }}>📷</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.forest,
                  marginBottom: 6,
                }}
              >
                التقط صورة لنبتتك
              </div>
              <div style={{ fontSize: 13, color: C.gray }}>
                أو اضغط لاختيار صورة من معرض الصور
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                style={{ display: "none" }}
                onChange={handleFile}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.forest,
                  marginBottom: 12,
                }}
              >
                ماذا يستطيع اكتشافه؟
              </div>
              {[
                { icon: "🍄", label: "إصابات فطرية" },
                { icon: "🐛", label: "هجمات الآفات" },
                { icon: "💛", label: "نقص المغذيات" },
                { icon: "💧", label: "الإفراط في الري" },
                { icon: "☀️", label: "أضرار الحرارة" },
                { icon: "🦠", label: "أمراض بكتيرية" },
              ].map((x) => (
                <div
                  key={x.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: `1px solid ${C.lightGray}`,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{x.icon}</span>
                  <span style={{ fontSize: 14, color: C.dark }}>{x.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {stage === "analyzing" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            {preview && (
              <img
                src={preview}
                alt="Plant"
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 20,
                  marginBottom: 24,
                }}
              />
            )}
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.forest,
                marginBottom: 16,
              }}
            >
              جاري تحليل الصورة...
            </div>
            <div>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
            <div style={{ fontSize: 13, color: C.gray, marginTop: 20 }}>
              يعمل الذكاء الاصطناعي على فحص الأوراق والساق والعلامات المرئية
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <div className="fade-in">
            {preview && (
              <img
                src={preview}
                alt="Plant"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              />
            )}

            <div
              style={{
                background: C.white,
                borderRadius: 20,
                padding: 18,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: C.forest }}>
                  {result.disease}
                </div>
                <div
                  style={{
                    background: result.severityColor,
                    color: "white",
                    borderRadius: 10,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {result.severity}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 13, color: C.gray }}>دقة التشخيص:</div>
                <div
                  style={{
                    flex: 1,
                    background: C.lightGray,
                    borderRadius: 4,
                    height: 8,
                  }}
                >
                  <div
                    style={{
                      width: `${result.confidence}%`,
                      background: C.sage,
                      borderRadius: 4,
                      height: "100%",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.forest }}>
                  {result.confidence}%
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.gray }}>
                <span style={{ fontWeight: 700, color: C.dark }}>النبات: </span>
                {result.plant}
              </div>
            </div>

            {[
              { title: "🔍 الأعراض", content: result.symptoms, color: C.blue },
              {
                title: "💊 العلاج الموصى به",
                content: result.treatment,
                color: C.sage,
              },
              {
                title: "🛡️ الوقاية",
                content: result.prevention,
                color: C.amber,
              },
            ].map((s) => (
              <div
                key={s.title}
                className="card"
                style={{ borderRight: `4px solid ${s.color}` }}
              >
                <div className="card-title" style={{ color: s.color }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.8 }}>
                  {s.content}
                </div>
              </div>
            ))}

            <div style={{ padding: "0 16px 8px", display: "flex", gap: 10 }}>
              <button
                className="btn-outline"
                onClick={() => {
                  setStage("upload");
                  setPreview(null);
                  setResult(null);
                }}
                style={{ flex: 1 }}
              >
                تحليل صورة أخرى
              </button>
              <button className="btn-primary" style={{ flex: 1 }}>
                احفظ التقرير
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Learn Tab ─────────────────────────────────────────────────────────────────
function LearnTab({ user }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState("");
  const [loading, setLoading] = useState(false);

  const openLesson = async (lesson) => {
    setActiveLesson(lesson);
    setLoading(true);
    setLessonContent("");
    const prompt = `أنت مدرس زراعي متخصص. اشرح موضوع "${lesson.title}" بطريقة بسيطة ومفيدة للمزارع المبتدئ باللغة العربية. 
اكتب درساً قصيراً وعملياً يتضمن: مقدمة بسيطة، ٣-٤ نقاط رئيسية مع أمثلة، ونصيحة عملية في النهاية. استخدم الرموز التعبيرية لجعل المحتوى ممتعاً. أجب بـ ٢٠٠-٢٥٠ كلمة.`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }]);
      setLessonContent(text);
    } catch {
      setLessonContent(
        "عذراً، تعذر تحميل الدرس حالياً. يرجى المحاولة مرة أخرى."
      );
    }
    setLoading(false);
  };

  if (activeLesson) {
    return (
      <div className="page fade-in">
        <div style={{ padding: "50px 16px 16px" }}>
          <button
            onClick={() => setActiveLesson(null)}
            style={{
              background: "none",
              border: "none",
              color: C.forest,
              fontSize: 14,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            ← رجوع
          </button>
          <div
            style={{
              background: activeLesson.color,
              borderRadius: 20,
              padding: 24,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 8 }}>
              {activeLesson.icon}
            </div>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 900 }}>
              {activeLesson.title}
            </h2>
            <span
              style={{
                background: "rgba(255,255,255,0.25)",
                color: "white",
                borderRadius: 20,
                padding: "4px 14px",
                fontSize: 12,
              }}
            >
              {activeLesson.level}
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div>
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
              <div style={{ marginTop: 16, color: C.gray, fontSize: 14 }}>
                يقوم الذكاء الاصطناعي بتحضير الدرس...
              </div>
            </div>
          ) : (
            <div className="card">
              <div
                style={{
                  fontSize: 14,
                  color: C.dark,
                  lineHeight: 2,
                  whiteSpace: "pre-wrap",
                }}
              >
                {lessonContent}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div style={{ padding: "50px 16px 16px" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: C.forest,
            marginBottom: 6,
          }}
        >
          📚 مركز التعلم الزراعي
        </h2>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>
          دروس تعليمية مخصصة لمستواك
        </p>

        <div
          style={{
            background: `linear-gradient(135deg, ${C.forest}, #2D6A4F)`,
            borderRadius: 20,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ color: C.sageLight, fontSize: 12, marginBottom: 4 }}>
            تقدمك هذا الشهر
          </div>
          <div
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: 900,
              marginBottom: 10,
            }}
          >
            ٣ / ٦ دروس
          </div>
          <div
            className="progress-bar"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <div
              className="progress-fill"
              style={{ width: "50%", background: C.sageLight }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.forest,
            marginBottom: 14,
          }}
        >
          الدروس المتاحة
        </div>
        {LESSONS.map((l) => (
          <div
            key={l.id}
            onClick={() => openLesson(l)}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              margin: "0 0 12px",
            }}
          >
            <div
              style={{
                background: l.color,
                borderRadius: 14,
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {l.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                {l.title}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.gray }}>
                  ⏱ {l.duration}
                </span>
                <span
                  style={{
                    background: C.sageLight,
                    color: C.forest,
                    borderRadius: 10,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {l.level}
                </span>
              </div>
            </div>
            <span style={{ color: C.sage, fontSize: 18 }}>←</span>
          </div>
        ))}

        {/* Plant guides */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.forest,
            margin: "20px 0 14px",
          }}
        >
          أدلة نباتاتك
        </div>
        {PLANTS.filter((p) => user.plants.includes(p.id)).map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              margin: "0 0 10px",
            }}
          >
            <span style={{ fontSize: 36 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
                موسم {p.season} • {p.days} يوم • ري {p.water}
              </div>
            </div>
            <span style={{ color: C.sage, fontSize: 18 }}>←</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calculator Tab ────────────────────────────────────────────────────────────
function CalcTab() {
  const [area, setArea] = useState("100");
  const [plant, setPlant] = useState("tomato");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    const selectedPlant = PLANTS.find((p) => p.id === plant);
    const prompt = `أنت خبير زراعي مالي. احسب التكاليف والأرباح المتوقعة لزراعة ${selectedPlant?.name} على مساحة ${area} متر مربع في مصر.
أجب فقط بـ JSON بهذا الشكل بدون أي نص إضافي أو backticks:
{"seedCost":رقم,"fertilizerCost":رقم,"waterCost":رقم,"laborCost":رقم,"totalCost":رقم,"expectedYield":"نص","revenue":رقم,"profit":رقم,"roi":رقم,"harvestTime":"نص","tips":"نصيحة مالية مختصرة"}`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }]);
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setResult({
        seedCost: 150,
        fertilizerCost: 200,
        waterCost: 80,
        laborCost: 300,
        totalCost: 730,
        expectedYield: "٢٠٠ كجم",
        revenue: 1400,
        profit: 670,
        roi: 92,
        harvestTime: "٨٠ يوماً",
        tips: "التوقيت الصحيح للزراعة يزيد الربح بنسبة ٣٠٪",
      });
    }
    setLoading(false);
  };

  return (
    <div className="page fade-in">
      <div style={{ padding: "50px 16px 16px" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: C.forest,
            marginBottom: 6,
          }}
        >
          💰 حاسبة الربح الزراعي
        </h2>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>
          احسب التكاليف والأرباح المتوقعة لمحصولك
        </p>

        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.forest,
                display: "block",
                marginBottom: 6,
              }}
            >
              المحصول
            </label>
            <select
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `2px solid ${C.lightGray}`,
                borderRadius: 12,
                fontFamily: "'Cairo',sans-serif",
                fontSize: 14,
                background: C.white,
                direction: "rtl",
              }}
            >
              {PLANTS.filter((p) => p.id !== "custom").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.forest,
                display: "block",
                marginBottom: 6,
              }}
            >
              المساحة (متر مربع)
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="100"
            />
          </div>
          <button
            className="btn-primary"
            onClick={calculate}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "جاري الحساب..." : "احسب الآن 🧮"}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 30 }}>
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        )}

        {result && !loading && (
          <div className="fade-in">
            {/* ROI highlight */}
            <div
              style={{
                background:
                  result.profit > 0
                    ? `linear-gradient(135deg, ${C.forest}, #2D6A4F)`
                    : `linear-gradient(135deg, ${C.red}, #c1121f)`,
                borderRadius: 20,
                padding: 20,
                margin: "0 0 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{ color: C.sageLight, fontSize: 13, marginBottom: 4 }}
              >
                العائد على الاستثمار
              </div>
              <div style={{ color: "white", fontSize: 48, fontWeight: 900 }}>
                {result.roi}%
              </div>
              <div style={{ color: C.sageLight, fontSize: 14 }}>
                وقت الحصاد: {result.harvestTime}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 14,
              }}
            >
              {[
                {
                  label: "إجمالي التكاليف",
                  value: `${result.totalCost} ج`,
                  color: C.red,
                  icon: "📉",
                },
                {
                  label: "الإيرادات المتوقعة",
                  value: `${result.revenue} ج`,
                  color: C.sage,
                  icon: "📈",
                },
                {
                  label: "صافي الربح",
                  value: `${result.profit} ج`,
                  color: C.forest,
                  icon: "💵",
                },
                {
                  label: "الإنتاج المتوقع",
                  value: result.expectedYield,
                  color: C.amber,
                  icon: "🌾",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: C.white,
                    borderRadius: 16,
                    padding: "16px 14px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    borderTop: `4px solid ${item.color}`,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>
                    {item.icon}
                  </div>
                  <div
                    style={{ fontSize: 18, fontWeight: 900, color: item.color }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="card"
              style={{ borderRight: `4px solid ${C.amber}` }}
            >
              <div className="card-title" style={{ color: C.amber }}>
                💡 نصيحة مالية
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>{result.tips}</div>
            </div>

            <div className="card">
              <div className="card-title">📊 تفاصيل التكاليف</div>
              {[
                { label: "بذور/شتلات", value: result.seedCost },
                { label: "أسمدة", value: result.fertilizerCost },
                { label: "مياه", value: result.waterCost },
                { label: "عمالة", value: result.laborCost },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: `1px solid ${C.lightGray}`,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                  <span
                    style={{ fontWeight: 700, color: C.forest, fontSize: 14 }}
                  >
                    {item.value} ج
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ user }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `أهلاً ${
        user.name || "مزارعنا"
      }! 🌱 أنا مساعدك الزراعي الذكي. يمكنك سؤالي عن أي شيء يتعلق بزراعتك — من رعاية النباتات إلى مكافحة الأمراض والتسميد. كيف أستطيع مساعدتك اليوم؟`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  const systemPrompt = `أنت مساعد زراعي ذكي ومتخصص يساعد المزارعين العرب. تتحدث باللغة العربية الفصحى البسيطة. 
المستخدم اسمه ${user.name || "مزارع"} ومستواه ${
    user.level || "مبتدئ"
  } وهو يزرع: ${user.plants
    ?.map((id) => PLANTS.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join("، ")}.
قدم إجابات عملية وبسيطة ومفيدة. استخدم الرموز التعبيرية بشكل معتدل. أجب في ٣-٤ جمل فقط إلا إذا طُلب منك تفصيل أكثر.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(
        newMsgs.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt
      );
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMsgs,
        {
          role: "assistant",
          content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
        },
      ]);
    }
    setLoading(false);
    setTimeout(
      () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const suggestions = [
    "كيف أعتني بالطماطم؟",
    "متى أسقي النباتات؟",
    "ما أسباب اصفرار الأوراق؟",
    "كيف أعالج الآفات طبيعياً؟",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${C.forest}, #2D6A4F)`,
          padding: "50px 16px 16px",
        }}
      >
        <h2 style={{ color: "white", fontSize: 20, fontWeight: 900 }}>
          🤖 المساعد الزراعي الذكي
        </h2>
        <p style={{ color: C.sageLight, fontSize: 12, marginTop: 4 }}>
          اسألني أي سؤال عن زراعتك
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 4,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: C.sage,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div
                  className="chat-bubble ai"
                  style={{ marginLeft: 0, marginRight: 0 }}
                >
                  {m.content}
                </div>
              </div>
            )}
            {m.role === "user" && (
              <div
                className="chat-bubble user"
                style={{ marginLeft: 0, marginRight: 0 }}
              >
                {m.content}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: C.sage,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🤖
            </div>
            <div
              className="chat-bubble ai"
              style={{ marginLeft: 0, marginRight: 0 }}
            >
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, color: C.gray, marginBottom: 10 }}>
              اقتراحات سريعة:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  style={{
                    background: C.sageLight,
                    color: C.forest,
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div
        style={{
          padding: "12px 16px",
          background: C.white,
          borderTop: `1px solid ${C.lightGray}`,
          position: "fixed",
          bottom: 70,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="اسأل سؤالاً عن زراعتك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            onClick={send}
            style={{
              background: C.sage,
              border: "none",
              borderRadius: 12,
              width: 46,
              height: 46,
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");

  const navItems = [
    { id: "home", icon: "🏡", label: "الرئيسية" },
    { id: "disease", icon: "🔬", label: "كشف مرض" },
    { id: "learn", icon: "📚", label: "التعلم" },
    { id: "calc", icon: "💰", label: "الأرباح" },
    { id: "chat", icon: "🤖", label: "المساعد" },
  ];

  if (!user) {
    return <Onboarding onComplete={(data) => setUser(data)} />;
  }

  const renderTab = () => {
    switch (tab) {
      case "home":
        return <HomeTab user={user} />;
      case "disease":
        return <DiseaseTab />;
      case "learn":
        return <LearnTab user={user} />;
      case "calc":
        return <CalcTab />;
      case "chat":
        return <ChatTab user={user} />;
      default:
        return <HomeTab user={user} />;
    }
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div className="app-shell">
        {renderTab()}
        <nav className="bottom-nav">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="icon">{n.icon}</span>
              <span className="label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
