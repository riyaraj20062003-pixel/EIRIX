import { useEffect, useRef, useState } from "react";

// ── Particle canvas ────────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8", "#c4b5fd", "#38bdf8", "#f472b6"];

function useParticles(count: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - d / 130)})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);
  return canvasRef;
}

// ── Floating icon card ─────────────────────────────────────────────────────────
function FloatCard({
  emoji, label, color, style,
}: { emoji: string; label: string; color: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl select-none"
      style={{ background: color, ...style }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── Neural SVG ─────────────────────────────────────────────────────────────────
function NeuralBrain() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32 md:w-40 md:h-40" fill="none">
      {/* Rotating rings */}
      <circle cx="80" cy="80" r="72" stroke="url(#rg1)" strokeWidth="1.2" strokeDasharray="6 5" opacity="0.35">
        <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="18s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="80" r="56" stroke="url(#rg2)" strokeWidth="0.8" strokeDasharray="3 7" opacity="0.25">
        <animateTransform attributeName="transform" type="rotate" from="360 80 80" to="0 80 80" dur="12s" repeatCount="indefinite" />
      </circle>

      {/* Connections */}
      {([
        [80,80, 42,44],[80,80,118,44],[80,80, 30,88],
        [80,80,130,88],[80,80, 50,126],[80,80,110,126],
        [42,44, 30,88],[118,44,130,88],[50,126, 30,88],[110,126,130,88],
      ] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lg)" strokeWidth="1" opacity="0.45">
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur={`${1.8+i*0.25}s`} repeatCount="indefinite"/>
        </line>
      ))}

      {/* Nodes */}
      {([
        [80,80,12],[42,44,6],[118,44,6],[30,88,6],[130,88,6],[50,126,6],[110,126,6],
      ] as [number,number,number][]).map(([cx,cy,r],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r+5} fill={i===0?"url(#cg)":"url(#ng)"} opacity="0.25">
            <animate attributeName="r" values={`${r+3};${r+9};${r+3}`} dur={`${1.4+i*0.35}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r={r} fill={i===0?"url(#cf)":"url(#nf)"}/>
        </g>
      ))}

      {/* Pulse */}
      <circle cx="80" cy="80" r="12" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0">
        <animate attributeName="r" values="12;38" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="80" cy="80" r="12" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0">
        <animate attributeName="r" values="12;52" dur="2s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </circle>

      <defs>
        <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
        <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#6366f1"/></linearGradient>
        <linearGradient id="lg"  x1="0" y1="0" x2="1" y2="1"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#c4b5fd"/></linearGradient>
        <radialGradient id="cg"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#6366f100"/></radialGradient>
        <radialGradient id="ng"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#a78bfa00"/></radialGradient>
        <radialGradient id="cf"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#6366f1"/></radialGradient>
        <radialGradient id="nf"><stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#8b5cf6"/></radialGradient>
      </defs>
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface Props { onDone: () => void; }

export default function WelcomeScreen({ onDone }: Props) {
  const canvasRef = useParticles(90);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"),  3800);
    const t3 = setTimeout(() => onDone(),          4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const visible = phase !== "out";
  const entered = phase === "hold" || phase === "out";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#0a0818 0%,#130d2e 35%,#0d1b4b 65%,#0a0818 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease-in-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Big radial glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)" }} />

      {/* ── Floating context cards ── */}
      {/* Top-left: books */}
      <FloatCard emoji="📚" label="Study Load" color="rgba(99,102,241,0.35)"
        style={{
          top: "14%", left: "6%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(-6deg)" : "translateY(30px) rotate(-6deg)",
          transition: "opacity 0.7s 0.3s, transform 0.7s 0.3s",
          animation: entered ? "floatY 3.5s ease-in-out 1s infinite alternate" : "none",
        }}
      />
      {/* Top-right: stress */}
      <FloatCard emoji="😰" label="Stress" color="rgba(239,68,68,0.35)"
        style={{
          top: "12%", right: "7%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(5deg)" : "translateY(30px) rotate(5deg)",
          transition: "opacity 0.7s 0.5s, transform 0.7s 0.5s",
          animation: entered ? "floatY 4s ease-in-out 0.5s infinite alternate" : "none",
        }}
      />
      {/* Mid-left: sleep */}
      <FloatCard emoji="😴" label="Sleep" color="rgba(56,189,248,0.3)"
        style={{
          top: "42%", left: "3%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(-4deg)" : "translateY(30px) rotate(-4deg)",
          transition: "opacity 0.7s 0.7s, transform 0.7s 0.7s",
          animation: entered ? "floatY 3.8s ease-in-out 1.5s infinite alternate" : "none",
        }}
      />
      {/* Mid-right: deadline */}
      <FloatCard emoji="⏰" label="Deadline" color="rgba(245,158,11,0.35)"
        style={{
          top: "40%", right: "3%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(4deg)" : "translateY(30px) rotate(4deg)",
          transition: "opacity 0.7s 0.9s, transform 0.7s 0.9s",
          animation: entered ? "floatY 4.2s ease-in-out 0.8s infinite alternate" : "none",
        }}
      />
      {/* Bottom-left: motivation */}
      <FloatCard emoji="🔥" label="Motivation" color="rgba(249,115,22,0.35)"
        style={{
          bottom: "16%", left: "7%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(-5deg)" : "translateY(30px) rotate(-5deg)",
          transition: "opacity 0.7s 1.1s, transform 0.7s 1.1s",
          animation: entered ? "floatY 3.6s ease-in-out 1.2s infinite alternate" : "none",
        }}
      />
      {/* Bottom-right: AI */}
      <FloatCard emoji="🤖" label="AI Analysis" color="rgba(139,92,246,0.35)"
        style={{
          bottom: "14%", right: "6%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(6deg)" : "translateY(30px) rotate(6deg)",
          transition: "opacity 0.7s 1.3s, transform 0.7s 1.3s",
          animation: entered ? "floatY 4.4s ease-in-out 0.3s infinite alternate" : "none",
        }}
      />
      {/* Extra: mood */}
      <FloatCard emoji="🧠" label="Brain Load" color="rgba(168,85,247,0.35)"
        style={{
          top: "22%", left: "22%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(3deg)" : "translateY(30px) rotate(3deg)",
          transition: "opacity 0.7s 0.6s, transform 0.7s 0.6s",
          animation: entered ? "floatY 3.2s ease-in-out 2s infinite alternate" : "none",
        }}
      />
      <FloatCard emoji="📝" label="Assignment" color="rgba(20,184,166,0.3)"
        style={{
          top: "20%", right: "22%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) rotate(-3deg)" : "translateY(30px) rotate(-3deg)",
          transition: "opacity 0.7s 0.8s, transform 0.7s 0.8s",
          animation: entered ? "floatY 3.9s ease-in-out 1.8s infinite alternate" : "none",
        }}
      />

      {/* ── Centre content ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-5 text-center px-6"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) scale(1)" : "translateY(32px) scale(0.94)",
          transition: "opacity 0.9s ease-out, transform 0.9s ease-out",
        }}
      >
        {/* Neural brain */}
        <NeuralBrain />

        {/* EIRIX — super bold */}
        <div className="flex items-center gap-4">
          <img src="/eirix-logo.png" alt="EIRIX"
            className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/50" />
          <span
            className="font-black tracking-[0.18em] leading-none select-none"
            style={{
              fontSize: "clamp(3rem,8vw,5.5rem)",
              background: "linear-gradient(90deg,#818cf8 0%,#c4b5fd 40%,#38bdf8 70%,#f472b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 32px rgba(129,140,248,0.6))",
            }}
          >
            EIRIX
          </span>
        </div>

        {/* Subtitle */}
        <div className="space-y-1">
          <p className="text-white/90 font-semibold text-base md:text-lg tracking-wide">
            AI-Powered Student Burnout Detection
          </p>
          <p className="text-slate-400 text-xs md:text-sm tracking-widest uppercase">
            Secure · Confidential · Intelligent
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,#6366f1,#a78bfa,#38bdf8,#f472b6)",
              width: entered ? "100%" : "0%",
              transition: "width 3.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>

        <p className="text-[11px] text-slate-500 tracking-[0.2em] uppercase animate-pulse">
          Loading your experience...
        </p>
      </div>

      {/* Float keyframe injected via style tag */}
      <style>{`
        @keyframes floatY {
          from { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          to   { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
      `}</style>
    </div>
  );
}
