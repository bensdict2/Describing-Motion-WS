import React, { useState, useEffect, useRef } from 'react';

const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbxCZ_kDmEfGDCUpLXp3LhdCB68rNnHdrcn1l7IsJbiypuTlqNPIGdvECs0qmZcleotHuQ/exec';

// ==========================================
// UTILITIES (Randomization & Validation)
// ==========================================
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const validateReflection = (text) => {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const forbidden = [
    'idk',
    'i dont know',
    'i dunno',
    'dunno',
    'nothing',
    'idontknow',
    'dk',
    'im not sure',
    'not sure',
    'bruh',
  ];

  if (text.trim().length < 25)
    return {
      valid: false,
      msg: 'Your reflection is too short. Please explain in more detail.',
    };

  const words = lower.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 5)
    return {
      valid: false,
      msg: 'Please use a complete sentence with at least 5 meaningful words.',
    };

  for (let bad of forbidden) {
    if (lower.includes(bad))
      return {
        valid: false,
        msg: "Invalid response detected. Please provide a thoughtful scientific explanation instead of 'I don't know'.",
      };
  }

  if (!/[aeiouy]/.test(lower))
    return {
      valid: false,
      msg: 'Please write real words. Keyboard smashing is not allowed.',
    };

  return { valid: true };
};

export default function App() {
  const [studentName, setStudentName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(1);

  useEffect(() => {
    const savedName = localStorage.getItem('motion_student_name');
    const savedLevel = localStorage.getItem('motion_unlocked_level');
    if (savedName) {
      setStudentName(savedName);
      setIsLoggedIn(true);
      setUnlockedLevel(parseInt(savedLevel) || 1);
      setActiveLevel(parseInt(savedLevel) || 1);
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isLoggedIn) {
        alert('Warning: Please stay on this tab to complete your mission!');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (studentName.trim().length > 1) {
      setIsLoggedIn(true);
      localStorage.setItem('motion_student_name', studentName);
      localStorage.setItem('motion_unlocked_level', 1);
      syncProgress(1, 0);
    }
  };

  const syncProgress = (moduleNum, score) => {
    fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({ studentName, module: moduleNum, score }),
    }).catch((err) => console.error('Sync error:', err));
  };

  const advanceLevel = (completedLevel, score = 100) => {
    const next = completedLevel + 1;
    syncProgress(completedLevel, score);
    if (next > unlockedLevel) {
      setUnlockedLevel(next);
      localStorage.setItem('motion_unlocked_level', next);
    }
    setActiveLevel(next);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4 font-body">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800/80 p-6 md:p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-700 w-full max-w-md backdrop-blur-sm"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] tracking-wider">
            MOTION & FORCE
          </h1>
          <p className="text-center font-body text-slate-400 mb-8 text-base md:text-lg font-semibold tracking-wide">
            Physical Science Training Module
          </p>
          <label className="block mb-2 font-semibold text-cyan-300">
            Enter your full name:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none mb-6 text-white font-bold tracking-wide"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 p-3 rounded-lg font-heading font-bold tracking-widest text-lg shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all duration-300 transform hover:scale-[1.02]"
          >
            START MISSION
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white select-none font-body pb-10">
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-800/80 p-4 md:p-5 rounded-xl mb-6 md:mb-8 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0 w-full md:w-auto justify-center md:justify-start">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)] shrink-0"></div>
            <h1 className="text-lg md:text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-widest text-center md:text-left">
              Agent: {studentName}
            </h1>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => level <= unlockedLevel && setActiveLevel(level)}
                className={`px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm rounded-lg font-heading font-bold tracking-wide transition-all duration-300 ${
                  activeLevel === level
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(56,189,248,0.6)] scale-105 text-white'
                    : level <= unlockedLevel
                    ? 'bg-slate-700 hover:bg-slate-600 text-cyan-100 hover:shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
                disabled={level > unlockedLevel}
              >
                Lvl {level} {level > unlockedLevel && '🔒'}
              </button>
            ))}
          </div>
        </header>

        <main
          className="bg-slate-800/90 p-4 md:p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-slate-700"
          onCopy={(e) => e.preventDefault()}
        >
          {activeLevel === 1 && <Level1 onComplete={() => advanceLevel(1)} />}
          {activeLevel === 2 && <Level2 onComplete={() => advanceLevel(2)} />}
          {activeLevel === 3 && <Level3 onComplete={() => advanceLevel(3)} />}
          {activeLevel === 4 && <Level4 onComplete={() => advanceLevel(4)} />}
          {activeLevel === 5 && (
            <Level5
              studentName={studentName}
              onComplete={(score) => advanceLevel(5, score)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// REFLECTION COMPONENT (Anti-Cheat)
// ==========================================
function ReflectionBox({ question, value, onChange }) {
  return (
    <div className="mt-8 bg-slate-900/60 p-4 md:p-6 rounded-xl border border-purple-500/30 shadow-inner">
      <h3 className="font-heading text-purple-400 font-bold mb-2 uppercase tracking-wide flex items-center gap-2">
        <span className="text-xl">📝</span> Mission Reflection
      </h3>
      <p className="text-slate-300 mb-4 text-sm md:text-base font-semibold leading-relaxed">
        {question}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        className="w-full h-28 bg-slate-800 border-2 border-slate-600 focus:border-purple-400 rounded-lg p-3 text-cyan-50 outline-none resize-none font-body text-sm md:text-base transition-colors"
        placeholder="Type your explanation here. (Note: Copy and paste have been disabled by Mr. M.)"
      ></textarea>
    </div>
  );
}

// ==========================================
// LEVEL 1: Distance vs Displacement
// ==========================================
function Level1({ onComplete }) {
  const [dropdownAnswers, setDropdownAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });
  const [reflection, setReflection] = useState('');

  // Shuffled on mount
  const [dragItems, setDragItems] = useState(() =>
    shuffleArray([
      { id: 1, text: 'Distance', category: null },
      { id: 2, text: 'Displacement', category: null },
      { id: 3, text: '70 m', category: null },
      { id: 4, text: '30 m North', category: null },
      { id: 5, text: '10 miles', category: null },
      { id: 6, text: '7.21 miles Northwest', category: null },
    ])
  );

  const [opt1] = useState(() =>
    shuffleArray(['Motion', 'Reference point', 'Velocity', 'Distance'])
  );
  const [opt2] = useState(() =>
    shuffleArray(['Motion', 'Reference point', 'Speed', 'Acceleration'])
  );
  const [opt3] = useState(() =>
    shuffleArray(['400 m', '0 m', '800 m', '200 m'])
  );
  const [opt4] = useState(() =>
    shuffleArray(['Newton', 'Pythagorean', 'Einstein', 'Galileo'])
  );

  const handleDrop = (e, category) => {
    const id = parseInt(e.dataTransfer.getData('id'));
    setDragItems((items) =>
      items.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  const checkAnswers = () => {
    const d1 = dropdownAnswers.q1 === 'Reference point';
    const d2 = dropdownAnswers.q2 === 'Motion';
    const d3 = dropdownAnswers.q3 === '0 m';
    const d4 = dropdownAnswers.q4 === 'Pythagorean';

    const scalarIds = [1, 3, 5];
    const vectorIds = [2, 4, 6];

    const scalarsCorrect = dragItems
      .filter((i) => scalarIds.includes(i.id))
      .every((i) => i.category === 'scalar');
    const vectorsCorrect = dragItems
      .filter((i) => vectorIds.includes(i.id))
      .every((i) => i.category === 'vector');

    if (!d1 || !d2 || !d3 || !d4 || !scalarsCorrect || !vectorsCorrect) {
      alert(
        'Not quite! Remember: Distance is just how far (scalar), Displacement includes direction (vector). Check your dropdowns and categories!'
      );
      return;
    }

    const validCheck = validateReflection(reflection);
    if (!validCheck.valid) {
      alert(validCheck.msg);
      return;
    }

    onComplete();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl md:text-3xl font-heading font-bold text-cyan-300 border-b-2 border-cyan-500/30 pb-2 md:pb-3 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(34,211,238,0.3)]">
        Level 1: Describing Motion
      </h2>
      <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700 shadow-inner space-y-4">
        <h3 className="font-heading font-bold text-blue-400 mb-4 tracking-wide text-base md:text-lg">
          Part A: Data Entry
        </h3>
        <p className="text-sm md:text-lg leading-relaxed">
          An indicator that orients you; the place from where you measure is
          called a
          <select
            className="my-1 md:my-0 mx-0 md:mx-3 block md:inline bg-slate-800 border-2 border-slate-600 focus:border-cyan-400 rounded-lg p-1 text-cyan-100 font-bold outline-none cursor-pointer w-full md:w-auto"
            onChange={(e) =>
              setDropdownAnswers({ ...dropdownAnswers, q1: e.target.value })
            }
          >
            <option value="">Select...</option>
            {opt1.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </p>
        <p className="text-sm md:text-lg leading-relaxed">
          When an object changes its position, it is in
          <select
            className="my-1 md:my-0 mx-0 md:mx-3 block md:inline bg-slate-800 border-2 border-slate-600 focus:border-cyan-400 rounded-lg p-1 text-cyan-100 font-bold outline-none cursor-pointer w-full md:w-auto"
            onChange={(e) =>
              setDropdownAnswers({ ...dropdownAnswers, q2: e.target.value })
            }
          >
            <option value="">Select...</option>
            {opt2.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </p>
        <p className="text-sm md:text-lg leading-relaxed">
          If a runner runs around a 400 m track and ends where they started,
          they traveled a distance of 400 m, but have been displaced
          <select
            className="my-1 md:my-0 mx-0 md:mx-3 block md:inline bg-slate-800 border-2 border-slate-600 focus:border-cyan-400 rounded-lg p-1 text-cyan-100 font-bold outline-none cursor-pointer w-full md:w-auto"
            onChange={(e) =>
              setDropdownAnswers({ ...dropdownAnswers, q3: e.target.value })
            }
          >
            <option value="">Select...</option>
            {opt3.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </p>
        <p className="text-sm md:text-lg leading-relaxed">
          If an object travels at a right angle, the
          <select
            className="my-1 md:my-0 mx-0 md:mx-3 block md:inline bg-slate-800 border-2 border-slate-600 focus:border-cyan-400 rounded-lg p-1 text-cyan-100 font-bold outline-none cursor-pointer w-full md:w-auto"
            onChange={(e) =>
              setDropdownAnswers({ ...dropdownAnswers, q4: e.target.value })
            }
          >
            <option value="">Select...</option>
            {opt4.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          theorem is used to find the displacement.
        </p>
      </div>

      <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700 shadow-inner">
        <h3 className="font-heading font-bold text-blue-400 mb-4 md:mb-6 tracking-wide text-base md:text-lg">
          Part B: Variable Classification
        </h3>
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
          {dragItems
            .filter((i) => i.category === null)
            .map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('id', item.id)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 md:px-5 md:py-3 rounded-lg cursor-grab active:cursor-grabbing font-bold shadow-lg border border-blue-400/30 hover:scale-105 transition-transform text-xs md:text-sm text-center"
              >
                {item.text}
              </div>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div
            className="border-2 border-dashed border-slate-500/50 p-4 md:p-6 min-h-[160px] rounded-xl flex flex-col items-center bg-slate-800/50 transition-colors hover:border-cyan-400/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'scalar')}
          >
            <span className="text-slate-300 font-bold mb-3 text-center text-sm md:text-base">
              Scalar (Distance / Magnitude Only)
            </span>
            <div className="flex flex-wrap gap-2 w-full justify-center">
              {dragItems
                .filter((i) => i.category === 'scalar')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 rounded-lg mt-2 text-center font-bold shadow-md text-xs md:text-sm"
                  >
                    {item.text}
                  </div>
                ))}
            </div>
          </div>
          <div
            className="border-2 border-dashed border-slate-500/50 p-4 md:p-6 min-h-[160px] rounded-xl flex flex-col items-center bg-slate-800/50 transition-colors hover:border-cyan-400/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'vector')}
          >
            <span className="text-slate-300 font-bold mb-3 text-center text-sm md:text-base">
              Vector (Displacement / Direction)
            </span>
            <div className="flex flex-wrap gap-2 w-full justify-center">
              {dragItems
                .filter((i) => i.category === 'vector')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg mt-2 text-center font-bold shadow-md text-xs md:text-sm"
                  >
                    {item.text}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <ReflectionBox
        question="In your own words, explain why a runner completing a 400m race on a circular track has a displacement of 0m even though they ran a distance of 400m."
        value={reflection}
        onChange={setReflection}
      />
      <button
        onClick={checkAnswers}
        className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-3 md:px-8 md:py-3 rounded-lg font-heading font-bold text-base md:text-lg tracking-widest w-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1"
      >
        VERIFY LEVEL 1
      </button>
    </div>
  );
}

// ==========================================
// LEVEL 2: Speed & Velocity Memory
// ==========================================
function Level2({ onComplete }) {
  const [cards] = useState(() =>
    shuffleArray([
      { id: 1, pair: 1, text: 'Speed' },
      { id: 2, pair: 1, text: 's = d/t' },
      { id: 3, pair: 2, text: 'Velocity' },
      { id: 4, pair: 2, text: 'Speed + Direction' },
      { id: 5, pair: 3, text: 'Instantaneous Speed' },
      { id: 6, pair: 3, text: 'Speedometer reading' },
      { id: 7, pair: 4, text: 'Average Speed' },
      { id: 8, pair: 4, text: 'Total Dist / Total Time' },
      { id: 9, pair: 5, text: 'Time (t)' },
      { id: 10, pair: 5, text: 'd / s' },
      { id: 11, pair: 6, text: 'Distance (d)' },
      { id: 12, pair: 6, text: 's * t' },
    ])
  );

  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [reflection, setReflection] = useState('');

  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(cards[index].pair) ||
      gameWon
    )
      return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]].pair === cards[newFlipped[1]].pair) {
        setMatched([...matched, cards[newFlipped[0]].pair]);
        setFlipped([]);
        if (matched.length + 1 === 6) setTimeout(() => setGameWon(true), 1200);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleVerify = () => {
    const validCheck = validateReflection(reflection);
    if (!validCheck.valid) {
      alert(validCheck.msg);
      return;
    }
    onComplete();
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl md:text-3xl font-heading font-bold text-cyan-300 border-b-2 border-cyan-500/30 pb-2 md:pb-3 mb-4 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(34,211,238,0.3)]">
        Level 2: Data Matching
      </h2>
      {!gameWon ? (
        <>
          <p className="mb-6 md:mb-8 text-slate-300 text-sm md:text-lg">
            Match the physical science concept to its definition or formula.
          </p>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
            {cards.map((card, index) => {
              const isFlipped =
                flipped.includes(index) || matched.includes(card.pair);
              const isMatched = matched.includes(card.pair);
              return (
                <div
                  key={card.id}
                  onClick={() => handleFlip(index)}
                  className={`h-24 md:h-32 lg:h-36 flex items-center justify-center text-center p-2 md:p-3 rounded-xl cursor-pointer transition-all duration-500 transform font-bold text-[10px] md:text-sm lg:text-base border ${
                    isMatched
                      ? 'bg-gradient-to-br from-green-500/80 to-emerald-700/80 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                      : isFlipped
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] rotate-y-180'
                      : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-400 shadow-inner'
                  }`}
                >
                  <span className={isFlipped ? 'opacity-100' : 'opacity-0'}>
                    {card.text}
                  </span>
                  {!isFlipped && (
                    <span className="absolute text-xl md:text-3xl text-slate-600 font-heading">
                      ?
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="animate-[fadeIn_1s_ease-out]">
          <div className="bg-green-500/20 border-l-4 border-green-500 p-4 rounded mb-6">
            <h3 className="text-green-400 font-bold font-heading text-lg">
              System Override Complete
            </h3>
            <p className="text-green-100">
              All data nodes matched successfully.
            </p>
          </div>
          <ReflectionBox
            question="Explain the difference between instantaneous speed and average speed. If you were on a road trip, what instruments or measurements would you use to find each one?"
            value={reflection}
            onChange={setReflection}
          />
          <button
            onClick={handleVerify}
            className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-3 rounded-lg font-heading font-bold text-lg w-full tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
          >
            SUBMIT LEVEL 2
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// LEVEL 3: Graphing Sim
// ==========================================
function Level3({ onComplete }) {
  const [speed, setSpeed] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('0.0');
  const [stage, setStage] = useState(0);
  const [reflection, setReflection] = useState('');
  const timerIntervalRef = useRef(null);

  const missions = [
    { targetSpeed: 6, dist: 60, time: 10, desc: '60m in 10s' },
    { targetSpeed: 8, dist: 80, time: 10, desc: '80m in 10s' },
  ];

  const currentMission = missions[stage];
  const endY = 100 - speed * 10;

  const handlePlayAnimation = () => {
    setIsAnimating(false);
    clearInterval(timerIntervalRef.current);
    setTimerDisplay('0.0');
    setTimeout(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      const duration = currentMission.time * 1000;
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(timerIntervalRef.current);
          setTimerDisplay(currentMission.time.toFixed(1));
        } else {
          setTimerDisplay((elapsed / 1000).toFixed(1));
        }
      }, 50);
    }, 50);
  };

  useEffect(() => {
    return () => clearInterval(timerIntervalRef.current);
  }, []);

  const handleCheck = () => {
    if (parseInt(speed) === currentMission.targetSpeed) {
      if (stage < missions.length - 1) {
        alert('Mission 1 Verified! Target coordinates updated for Stage 2.');
        setStage(stage + 1);
        setSpeed(0);
        setIsAnimating(false);
        setTimerDisplay('0.0');
      } else {
        const validCheck = validateReflection(reflection);
        if (!validCheck.valid) {
          alert(validCheck.msg);
          return;
        }
        onComplete();
      }
    } else {
      alert("Analyze the car's motion again! Slope (Speed) = Distance / Time.");
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center border-b-2 border-cyan-500/30 pb-2 md:pb-3 mb-4">
        <h2 className="text-xl md:text-3xl font-heading font-bold text-cyan-300 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(34,211,238,0.3)]">
          Level 3: Graphing Simulator
        </h2>
        <span className="bg-cyan-900 text-cyan-300 px-3 py-1 rounded font-heading font-bold text-sm">
          Stage {stage + 1} / {missions.length}
        </span>
      </div>
      <div className="mb-6 md:mb-8 text-slate-300 text-sm md:text-lg bg-slate-900/50 p-4 rounded-lg border border-slate-700 border-l-4 border-l-cyan-400">
        In a distance vs. time graph, the steepness of the line (slope) equals
        the speed. <br />
        <strong className="text-cyan-300 font-heading tracking-wide mt-2 block">
          MISSION:
        </strong>{' '}
        Play the vehicle animation. Then, adjust your graph's slope to
        accurately represent the car's motion.
      </div>
      <div className="bg-slate-900/80 p-4 md:p-8 rounded-xl border border-slate-700 shadow-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-heading text-blue-400 font-bold uppercase tracking-widest text-sm md:text-base">
                Observation Deck
              </h3>
              <p className="text-slate-400 text-xs">
                Target: {currentMission.desc}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-950 px-4 py-2 rounded border border-red-500/50 font-heading font-bold text-red-500 w-24 text-center text-xl shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                {timerDisplay}s
              </div>
              <button
                onClick={handlePlayAnimation}
                className="bg-slate-700 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm md:text-base flex items-center gap-2 transition-colors border border-slate-500"
              >
                ▶ Play
              </button>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-lg h-20 md:h-24 relative overflow-hidden border border-slate-600">
            <div className="absolute top-0 left-0 h-full w-[2px] bg-slate-500"></div>
            <div className="absolute top-0 left-[20%] h-full w-[1px] bg-slate-600/50"></div>
            <div className="absolute top-0 left-[40%] h-full w-[1px] bg-slate-600/50"></div>
            <div className="absolute top-0 left-[60%] h-full w-[1px] bg-slate-600/50"></div>
            <div className="absolute top-0 left-[80%] h-full w-[1px] bg-slate-600/50"></div>
            <div className="absolute top-0 right-0 h-full w-[2px] bg-slate-500"></div>
            <div
              className={`absolute top-0 h-full w-[2px] bg-red-500/70 border-r border-dashed border-red-400 transition-all`}
              style={{ left: `${currentMission.dist}%` }}
            ></div>
            <span className="absolute bottom-1 left-2 text-xs md:text-sm font-bold text-slate-400">
              0m
            </span>
            <span
              className="absolute top-1 text-xs md:text-sm font-bold text-red-400 -translate-x-1/2 transition-all"
              style={{ left: `${currentMission.dist}%` }}
            >
              {currentMission.dist}m
            </span>
            <span className="absolute bottom-1 right-2 text-xs md:text-sm font-bold text-slate-400">
              100m
            </span>
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-4xl md:text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] z-10 transition-all ease-linear -scale-x-100 ${
                isAnimating ? 'duration-[10000ms]' : 'duration-0'
              }`}
              style={{
                left: isAnimating
                  ? `calc(${currentMission.dist}% - 20px)`
                  : '0%',
              }}
            >
              🏎️
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-700/50 border-y border-slate-900/30 border-dashed"></div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-slate-700"></div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          <div className="relative border-l-2 border-b-2 border-slate-400 w-full max-w-[280px] h-[280px] bg-slate-800/50 rounded-tr-lg shrink-0">
            <span className="absolute -left-10 md:-left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs md:text-sm font-bold text-slate-400 tracking-widest">
              Distance (m)
            </span>
            <span className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-slate-400 tracking-widest">
              Time (s)
            </span>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:10%_10%] opacity-40"></div>
            <svg
              className="w-full h-full relative z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="100"
                x2="100"
                y2={endY}
                stroke="#06b6d4"
                strokeWidth="4"
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-300"
              />
            </svg>
          </div>
          <div className="flex-1 w-full text-center space-y-6">
            <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-600 inline-block min-w-[200px] w-full md:w-auto">
              <span className="block text-slate-400 font-heading text-xs md:text-sm mb-2 uppercase tracking-widest">
                Graph Slope (Speed)
              </span>
              <span className="text-4xl md:text-5xl font-black text-cyan-400 font-heading">
                {speed} <span className="text-xl md:text-2xl">m/s</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full h-3 md:h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>
        {stage === missions.length - 1 && (
          <ReflectionBox
            question="If you were tracking a parked car on a distance vs. time graph, what would the line look like? Why?"
            value={reflection}
            onChange={setReflection}
          />
        )}
        <button
          onClick={handleCheck}
          className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-4 rounded-lg font-heading font-bold text-base md:text-lg w-full tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
        >
          {stage < missions.length - 1
            ? 'VERIFY GRAPH STAGE 1'
            : 'SUBMIT FINAL GRAPH'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// LEVEL 4: Graph Analysis
// ==========================================
function Level4({ onComplete }) {
  const [answers5Graphs, setAnswers5Graphs] = useState({
    g1: '',
    g2: '',
    g3: '',
    g4: '',
    g5: '',
  });
  const [answersStory, setAnswersStory] = useState({
    a: '',
    b: '',
    c: '',
    d: '',
  });
  const [reflection, setReflection] = useState('');

  const [opt5Graphs] = useState(() =>
    shuffleArray([
      'Constant speed, away from reference point',
      'Constant speed, towards reference point',
      'Speeding up',
      'Slowing down',
      'Not moving',
    ])
  );

  const [optStory] = useState(() =>
    shuffleArray([
      'moving at a constant speed, away from the reference point',
      'moving at a constant speed, coming towards the reference point',
      'speeding up',
      'slowing down',
      'not moving',
    ])
  );

  const handleVerify = () => {
    const part1Correct =
      answers5Graphs.g1 === 'Constant speed, away from reference point' &&
      answers5Graphs.g2 === 'Constant speed, towards reference point' &&
      answers5Graphs.g3 === 'Speeding up' &&
      answers5Graphs.g4 === 'Slowing down' &&
      answers5Graphs.g5 === 'Not moving';

    const part2Correct =
      answersStory.a ===
        'moving at a constant speed, away from the reference point' &&
      answersStory.b === 'not moving' &&
      answersStory.c === 'speeding up' &&
      answersStory.d ===
        'moving at a constant speed, coming towards the reference point';

    if (!part1Correct || !part2Correct) {
      alert(
        'Graph mismatch! Analyze the graphs carefully. Remember: Straight lines mean constant speed, curves mean changing speed, and flat lines mean stationary.'
      );
      return;
    }

    const validCheck = validateReflection(reflection);
    if (!validCheck.valid) {
      alert(validCheck.msg);
      return;
    }

    onComplete();
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl md:text-3xl font-heading font-bold text-cyan-300 border-b-2 border-cyan-500/30 pb-2 md:pb-3 mb-4 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(34,211,238,0.3)]">
        Level 4: Graph Identification
      </h2>

      <h3 className="font-heading text-blue-400 font-bold mb-4 uppercase tracking-wide">
        Part A: Motion Signatures
      </h3>
      <p className="mb-6 text-slate-300 text-sm md:text-lg">
        Select the correct description of motion for each Distance vs. Time
        graph below.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
          <div className="w-full h-32 border-l-2 border-b-2 border-slate-400 relative mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="100"
                x2="100"
                y2="0"
                stroke="#06b6d4"
                strokeWidth="4"
              />
            </svg>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-100"
            value={answers5Graphs.g1}
            onChange={(e) =>
              setAnswers5Graphs({ ...answers5Graphs, g1: e.target.value })
            }
          >
            <option value="">Select Motion...</option>
            {opt5Graphs.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
          <div className="w-full h-32 border-l-2 border-b-2 border-slate-400 relative mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke="#a855f7"
                strokeWidth="4"
              />
            </svg>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-100"
            value={answers5Graphs.g2}
            onChange={(e) =>
              setAnswers5Graphs({ ...answers5Graphs, g2: e.target.value })
            }
          >
            <option value="">Select Motion...</option>
            {opt5Graphs.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
          <div className="w-full h-32 border-l-2 border-b-2 border-slate-400 relative mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 100 Q 50 100 100 0"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="4"
              />
            </svg>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-100"
            value={answers5Graphs.g3}
            onChange={(e) =>
              setAnswers5Graphs({ ...answers5Graphs, g3: e.target.value })
            }
          >
            <option value="">Select Motion...</option>
            {opt5Graphs.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
          <div className="w-full h-32 border-l-2 border-b-2 border-slate-400 relative mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 100 Q 50 0 100 0"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="4"
              />
            </svg>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-100"
            value={answers5Graphs.g4}
            onChange={(e) =>
              setAnswers5Graphs({ ...answers5Graphs, g4: e.target.value })
            }
          >
            <option value="">Select Motion...</option>
            {opt5Graphs.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col items-center lg:col-start-2">
          <div className="w-full h-32 border-l-2 border-b-2 border-slate-400 relative mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="#ef4444"
                strokeWidth="4"
              />
            </svg>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-100"
            value={answers5Graphs.g5}
            onChange={(e) =>
              setAnswers5Graphs({ ...answers5Graphs, g5: e.target.value })
            }
          >
            <option value="">Select Motion...</option>
            {opt5Graphs.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[1px] w-full bg-slate-700 mb-10"></div>

      <h3 className="font-heading text-blue-400 font-bold mb-4 uppercase tracking-wide">
        Part B: Mission Log Analysis
      </h3>
      <p className="mb-6 text-slate-300 text-sm md:text-lg">
        Analyze the continuous distance vs. time graph below, then complete the
        mission log story by identifying the correct motion for each segment.
      </p>

      <div className="bg-slate-900/60 p-4 md:p-8 rounded-xl border border-slate-700 flex flex-col items-center mb-8 shadow-inner">
        <div className="w-full max-w-[500px] h-64 border-l-2 border-b-2 border-slate-400 relative">
          <span className="absolute -left-10 md:-left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs md:text-sm font-bold text-slate-400 tracking-widest">
            Distance
          </span>
          <span className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-slate-400 tracking-widest">
            Time
          </span>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:10%_10%] opacity-40"></div>

          <svg
            viewBox="0 0 100 100"
            className="w-full h-full relative z-10 overflow-visible"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="100"
              x2="30"
              y2="60"
              stroke="#06b6d4"
              strokeWidth="3"
            />
            <text
              x="10"
              y="75"
              fill="#cyan-300"
              className="text-xs font-heading font-bold fill-cyan-300 drop-shadow-md"
            >
              A
            </text>
            <line
              x1="30"
              y1="60"
              x2="55"
              y2="60"
              stroke="#f59e0b"
              strokeWidth="3"
            />
            <text
              x="40"
              y="55"
              fill="#f59e0b"
              className="text-xs font-heading font-bold fill-amber-400 drop-shadow-md"
            >
              B
            </text>
            <path
              d="M 55 60 Q 70 60 75 20"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="3"
            />
            <text
              x="58"
              y="40"
              fill="#10b981"
              className="text-xs font-heading font-bold fill-emerald-400 drop-shadow-md"
            >
              C
            </text>
            <line
              x1="75"
              y1="20"
              x2="100"
              y2="100"
              stroke="#a855f7"
              strokeWidth="3"
            />
            <text
              x="88"
              y="65"
              fill="#a855f7"
              className="text-xs font-heading font-bold fill-purple-400 drop-shadow-md"
            >
              D
            </text>
          </svg>
        </div>
      </div>

      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-600 mb-8 leading-loose text-sm md:text-base">
        <h3 className="font-heading text-blue-400 font-bold mb-4 uppercase tracking-wide">
          Mission Log: Suspect Pursuit
        </h3>
        <p className="text-slate-200">
          Agent, we tracked a suspect vehicle this morning. Looking at the
          graph, during <strong>Segment A</strong>, the suspect was
          <select
            className="mx-2 bg-slate-900 border border-cyan-500/50 rounded p-1 text-cyan-100 font-bold outline-none cursor-pointer max-w-[250px] align-middle"
            value={answersStory.a}
            onChange={(e) =>
              setAnswersStory({ ...answersStory, a: e.target.value })
            }
          >
            <option value="">Select motion...</option>
            {optStory.map((opt) => (
              <option key={`a-${opt}`} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          .
          <br />
          <br />
          Suddenly, in <strong>Segment B</strong>, they hit a dead end and were
          completely
          <select
            className="mx-2 bg-slate-900 border border-amber-500/50 rounded p-1 text-amber-100 font-bold outline-none cursor-pointer max-w-[250px] align-middle"
            value={answersStory.b}
            onChange={(e) =>
              setAnswersStory({ ...answersStory, b: e.target.value })
            }
          >
            <option value="">Select motion...</option>
            {optStory.map((opt) => (
              <option key={`b-${opt}`} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          .
          <br />
          <br />
          Once they turned around in <strong>Segment C</strong>, they panicked,
          hitting the gas pedal and
          <select
            className="mx-2 bg-slate-900 border border-emerald-500/50 rounded p-1 text-emerald-100 font-bold outline-none cursor-pointer max-w-[250px] align-middle"
            value={answersStory.c}
            onChange={(e) =>
              setAnswersStory({ ...answersStory, c: e.target.value })
            }
          >
            <option value="">Select motion...</option>
            {optStory.map((opt) => (
              <option key={`c-${opt}`} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          to escape.
          <br />
          <br />
          Finally, in <strong>Segment D</strong>, they realized they were
          driving straight back to the police station and were safely
          apprehended while
          <select
            className="mx-2 bg-slate-900 border border-purple-500/50 rounded p-1 text-purple-100 font-bold outline-none cursor-pointer max-w-[250px] align-middle"
            value={answersStory.d}
            onChange={(e) =>
              setAnswersStory({ ...answersStory, d: e.target.value })
            }
          >
            <option value="">Select motion...</option>
            {optStory.map((opt) => (
              <option key={`d-${opt}`} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          .
        </p>
      </div>

      <ReflectionBox
        question="Look at Segment B (the flat, horizontal line). Using what you learned about Distance vs. Time graphs, explain why a horizontal line indicates zero speed. What happens to the distance as time continues to pass?"
        value={reflection}
        onChange={setReflection}
      />

      <button
        onClick={handleVerify}
        className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-3 rounded-lg font-heading font-bold text-lg w-full tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
      >
        VERIFY LEVEL 4
      </button>
    </div>
  );
}

// ==========================================
// LEVEL 5: Final Boss Battle (Randomized)
// ==========================================
function Level5({ studentName, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [reflection, setReflection] = useState('');

  // Shuffle both the array of questions AND the options within each question on initialization
  const [questions] = useState(() => {
    const qList = [
      {
        q: 'A girl is training to run a 5k (3.1 mile) race. If she runs a trial race in 0.5 hours, what is her average speed? (s = d/t)',
        opts: ['6.2 mi/hr', '1.55 mi/hr', '3.6 mi/hr', '15.5 mi/hr'],
        ans: '6.2 mi/hr',
      },
      {
        q: "An elevator at a museum can travel 210 m upwards in 35 s. What is the elevator's velocity?",
        opts: [
          '6 m/s upwards',
          '6 m/s downwards',
          '7350 m/s upwards',
          '0.16 m/s upwards',
        ],
        ans: '6 m/s upwards',
      },
      {
        q: 'How far does a car travel in .75 hrs if it is moving at a constant speed of 45 mi/hr? (d = s * t)',
        opts: ['60 mi', '33.75 mi', '33.75 km', '45 mi'],
        ans: '33.75 mi',
      },
      {
        q: 'If a motorcycle is moving at a constant speed down the highway of 40 km/hr, how long would it take the motorcycle to travel 10 km? (t = d/s)',
        opts: ['4 hours', '0.25 hours', '400 hours', '2.5 hours'],
        ans: '0.25 hours',
      },
      {
        q: 'Stefan has to drive 8 miles south and 3 miles east to get to work. How would you calculate his displacement from his starting point?',
        opts: [
          'Add the distances: 8 + 3',
          'Subtract the distances: 8 - 3',
          'Use the Pythagorean Theorem: a² + b² = c²',
          'Divide total distance by time',
        ],
        ans: 'Use the Pythagorean Theorem: a² + b² = c²',
      },
      {
        q: 'On a distance vs. time graph, what does the slope of the line represent?',
        opts: ['Acceleration', 'Time', 'Distance', 'Speed'],
        ans: 'Speed',
      },
      {
        q: 'If an object is speeding up, how does the Distance vs Time graph look?',
        opts: [
          'A straight line sloping up',
          'A straight line sloping down',
          'A flat horizontal line',
          'A curved line curving upwards',
        ],
        ans: 'A curved line curving upwards',
      },
      {
        q: 'Sound travels at 343 m/s through dry air. If a lightning bolt strikes the ground 2,000 m away, how long will it take for the sound to reach you? (t = d/s)',
        opts: [
          '5.83 seconds',
          '1,657 seconds',
          '686,000 seconds',
          '0.17 seconds',
        ],
        ans: '5.83 seconds',
      },
    ];
    return shuffleArray(
      qList.map((item) => ({ ...item, opts: shuffleArray(item.opts) }))
    );
  });

  const handleAnswer = (opt) => {
    const isCorrect = opt === questions[currentQ].ans;
    const newScore = isCorrect ? score + 1 : score;

    if (currentQ < questions.length - 1) {
      setScore(newScore);
      setCurrentQ(currentQ + 1);
    } else {
      setScore(newScore);
      setQuizDone(true);
    }
  };

  const handleFinalSubmit = () => {
    const validCheck = validateReflection(reflection);
    if (!validCheck.valid) {
      alert(validCheck.msg);
      return;
    }
    onComplete(score);
  };

  if (quizDone) {
    return (
      <div className="animate-[fadeIn_0.5s_ease-out] flex flex-col items-center justify-center text-center py-6 md:py-10">
        <div className="text-6xl md:text-8xl mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
          🏆
        </div>

        <h2 className="text-4xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] tracking-widest uppercase">
          Mission Accomplished
        </h2>

        <p className="text-lg md:text-xl text-slate-300 mb-8 font-semibold tracking-wide">
          Agent <span className="text-cyan-400">{studentName}</span>, you have
          successfully secured the Physical Science Motion Module.
        </p>

        <div className="bg-slate-900 border-2 border-yellow-500/50 p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.2)] w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
          <p className="text-lg md:text-2xl font-heading font-bold text-slate-400 uppercase tracking-widest mb-2">
            Final Evaluation
          </p>
          <p className="text-6xl md:text-7xl font-black text-yellow-400 drop-shadow-lg font-heading">
            {score}{' '}
            <span className="text-3xl md:text-4xl text-slate-600">
              / {questions.length}
            </span>
          </p>
        </div>

        <div className="w-full text-left max-w-4xl mt-6">
          <ReflectionBox
            question="Reflect on this module: Which concept (distance/displacement, calculating velocity, or graphing motion) was the most challenging for you to understand, and how did you overcome it?"
            value={reflection}
            onChange={setReflection}
          />
        </div>

        <button
          onClick={handleFinalSubmit}
          className="mt-8 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 px-10 py-5 rounded-xl font-heading font-black text-lg md:text-xl w-full max-w-md tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all transform hover:-translate-y-2"
        >
          UPLOAD DATA TO COMMAND
        </button>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-2xl md:text-3xl font-heading font-black text-purple-400 border-b-2 border-purple-500/30 pb-2 md:pb-3 mb-4 md:mb-6 uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
        Level 5: Final Boss Simulation
      </h2>
      <div className="bg-slate-900/80 p-5 md:p-10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="inline-block bg-slate-800 px-4 py-1 rounded-full border border-slate-600 mb-6">
          <p className="text-purple-300 font-heading font-bold tracking-widest text-xs md:text-sm uppercase">
            Threat Level {currentQ + 1} // {questions.length}
          </p>
        </div>
        <h3 className="text-lg md:text-2xl font-bold mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto relative z-10 px-2 md:px-0">
          {questions[currentQ].q}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
          {questions[currentQ].opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="bg-slate-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 border border-slate-600 hover:border-purple-400 p-4 md:p-5 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-left md:text-center text-sm md:text-lg min-h-[80px] flex items-center justify-center"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
