import { PredictResult, PredictInput } from "../services/burnoutLogic";
import { CheckCircle2, AlertTriangle, TrendingDown, TrendingUp, Minus, Brain, Moon, Monitor, BookOpen, Heart, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  result: PredictResult;
  input?: PredictInput;
  onNewCheck: () => void;
}

// ── Risk config ────────────────────────────────────────────────────────────────
const RISK_CFG = {
  low:      { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300", icon: TrendingDown, label: "Low Risk" },
  moderate: { bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     text: "text-amber-700 dark:text-amber-300",     badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",     icon: Minus,        label: "Moderate Risk" },
  high:     { bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800",         text: "text-red-700 dark:text-red-300",         badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",         icon: TrendingUp,   label: "High Risk" },
};

// ── Generate specific insight cards based on actual values ────────────────────
interface InsightCard {
  icon: React.ElementType;
  title: string;
  body: string;
  priority: "critical" | "warning" | "good";
}

function buildInsightCards(result: PredictResult, input?: PredictInput): InsightCard[] {
  const cards: InsightCard[] = [];
  const score = result.burnout_score;
  const level = result.risk_level;
  const i = input;

  // Sleep
  if (i?.sleep_hours !== undefined) {
    if (i.sleep_hours < 5)
      cards.push({ icon: Moon, title: "Critical Sleep Deficit", body: `You're sleeping only ${i.sleep_hours}h — well below the 7–8h minimum. Sleep deprivation at this level reduces memory retention by up to 40% and is your #1 burnout driver right now.`, priority: "critical" });
    else if (i.sleep_hours < 7)
      cards.push({ icon: Moon, title: "Insufficient Sleep", body: `${i.sleep_hours}h of sleep is below the recommended 7–8h. Even 1 extra hour can lower your burnout score by 8–12 points. Try sleeping 30 min earlier each night this week.`, priority: "warning" });
    else
      cards.push({ icon: Moon, title: "Good Sleep Habit", body: `${i.sleep_hours}h of sleep is healthy. Keep this consistent — irregular sleep schedules can spike burnout even when total hours are adequate.`, priority: "good" });
  }

  // Study vs Assignment imbalance
  if (i?.study_hours !== undefined && i?.assignment_load !== undefined) {
    const gap = i.assignment_load - i.study_hours;
    if (gap > 4)
      cards.push({ icon: BookOpen, title: "Severe Study-Load Imbalance", body: `Your assignment load (${i.assignment_load}/10) is far higher than your study hours (${i.study_hours}h). This gap of ${gap} is a major burnout trigger — you're accumulating academic debt faster than you can clear it.`, priority: "critical" });
    else if (gap > 2)
      cards.push({ icon: BookOpen, title: "Study-Load Gap Detected", body: `Assignment load (${i.assignment_load}/10) exceeds study time (${i.study_hours}h). Use time-blocking: dedicate specific hours to specific subjects to close this gap.`, priority: "warning" });
    else if (i.study_hours > 9)
      cards.push({ icon: BookOpen, title: "Over-Studying Risk", body: `${i.study_hours}h of study daily leads to diminishing returns after 6–7h. Schedule mandatory breaks using the Pomodoro technique (25 min on, 5 min off).`, priority: "warning" });
    else
      cards.push({ icon: BookOpen, title: "Balanced Study Load", body: `Your study hours (${i.study_hours}h) are well-matched to your assignment load (${i.assignment_load}/10). Maintain this balance and review your schedule weekly.`, priority: "good" });
  }

  // Stress
  if (i?.stress_level !== undefined) {
    if (i.stress_level >= 8)
      cards.push({ icon: Zap, title: "Extreme Stress Level", body: `Stress at ${i.stress_level}/10 activates cortisol responses that impair focus and memory. At this level, 10 minutes of box breathing (4s in, 4s hold, 4s out) twice daily can reduce cortisol by 20%.`, priority: "critical" });
    else if (i.stress_level >= 6)
      cards.push({ icon: Zap, title: "Elevated Stress", body: `Stress at ${i.stress_level}/10 is in the warning zone. Identify your top 2 stressors this week and write down one actionable step to reduce each.`, priority: "warning" });
    else
      cards.push({ icon: Zap, title: "Stress Under Control", body: `Stress at ${i.stress_level}/10 is manageable. Keep using whatever coping strategies are working — journaling, exercise, or social connection.`, priority: "good" });
  }

  // Screen time
  if (i?.screen_time !== undefined) {
    if (i.screen_time >= 8)
      cards.push({ icon: Monitor, title: "Excessive Screen Time", body: `${i.screen_time}h of screen time is significantly impacting your sleep quality and focus. Set a hard screen cutoff 1 hour before bed and use app timers to cap recreational use at 2h/day.`, priority: "critical" });
    else if (i.screen_time >= 5)
      cards.push({ icon: Monitor, title: "High Screen Exposure", body: `${i.screen_time}h of screen time is above average. Blue light exposure after 9pm disrupts melatonin production. Enable night mode and take a 5-min screen break every hour.`, priority: "warning" });
  }

  // Motivation
  if (i?.motivation_level !== undefined) {
    if (i.motivation_level <= 3)
      cards.push({ icon: Heart, title: "Very Low Motivation", body: `Motivation at ${i.motivation_level}/10 is a strong early warning sign. Break your goals into micro-tasks (15 min each) — completing small wins rebuilds momentum. Consider talking to your mentor this week.`, priority: "critical" });
    else if (i.motivation_level <= 5)
      cards.push({ icon: Heart, title: "Declining Motivation", body: `Motivation at ${i.motivation_level}/10 suggests academic fatigue. Reconnect with your "why" — write down 3 reasons you started your course. Reward yourself after completing each study block.`, priority: "warning" });
    else
      cards.push({ icon: Heart, title: "Healthy Motivation", body: `Motivation at ${i.motivation_level}/10 is a strong protective factor against burnout. Channel this into helping peers — teaching others reinforces your own learning.`, priority: "good" });
  }

  // Social activity
  if (i?.social_activity !== undefined && i.social_activity <= 3)
    cards.push({ icon: Heart, title: "Social Isolation Risk", body: `Social activity at ${i.social_activity}/10 doubles burnout risk. Even 30 minutes of genuine social interaction daily — a walk with a friend, a study group — significantly reduces stress hormones.`, priority: "warning" });

  // Score-based overall
  if (score >= 80)
    cards.push({ icon: AlertTriangle, title: "Academic Crisis Risk", body: `Your score of ${score} places you in the top risk tier. This pattern precedes academic withdrawal in 1 in 3 students. Please reach out to your campus counselor or mentor today — not tomorrow.`, priority: "critical" });
  else if (score >= 65)
    cards.push({ icon: AlertTriangle, title: "Intervention Needed", body: `Score of ${score} indicates burnout is actively affecting your performance. Prioritize the critical items above and schedule a check-in with your mentor within 48 hours.`, priority: "critical" });
  else if (score >= 40)
    cards.push({ icon: Minus, title: "Monitor Closely", body: `Score of ${score} puts you in the moderate zone. Address the warning items above consistently for 1 week — most students in this range recover to low risk within 7–10 days with targeted changes.`, priority: "warning" });
  else
    cards.push({ icon: CheckCircle2, title: "Well-Balanced", body: `Score of ${score} reflects excellent academic balance. Keep your current routine and do a weekly check-in to catch any early drift before it compounds.`, priority: "good" });

  return cards.slice(0, 6);
}

const PRIORITY_STYLE = {
  critical: "border-l-4 border-red-500 bg-red-50/70 dark:bg-red-950/30",
  warning:  "border-l-4 border-amber-500 bg-amber-50/70 dark:bg-amber-950/30",
  good:     "border-l-4 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30",
};
const PRIORITY_ICON_COLOR = {
  critical: "text-red-500",
  warning:  "text-amber-500",
  good:     "text-emerald-500",
};

export default function Insights({ result, input, onNewCheck }: Props) {
  const cfg   = RISK_CFG[result.risk_level];
  const RiskIcon = cfg.icon;
  const cards = buildInsightCards(result, input);

  return (
    <div className="space-y-5">

      {/* Score banner */}
      <div className={cn("p-5 rounded-2xl border flex items-center gap-4", cfg.bg, cfg.border)}>
        <div className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0", cfg.badge)}>
          <span className="text-2xl font-black">{result.burnout_score}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">/ 100</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RiskIcon className={cn("w-4 h-4", cfg.text)} />
            <span className={cn("font-extrabold text-sm uppercase tracking-wide", cfg.text)}>{cfg.label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">· {result.confidence}% confidence</span>
          </div>
          <p className={cn("text-sm leading-relaxed italic", cfg.text)}>"{result.insights}"</p>
        </div>
      </div>

      {/* Insight cards */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" /> Personalised Analysis
        </p>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={cn("p-4 rounded-2xl", PRIORITY_STYLE[card.priority])}>
              <div className="flex items-start gap-3">
                <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", PRIORITY_ICON_COLOR[card.priority])} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{card.title}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{card.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations from server */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" /> Action Steps
        </p>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">{i + 1}</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* High risk urgent alert */}
      {result.risk_level === "high" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Your burnout score is critically high. Please reach out to a counselor or mentor immediately — early intervention prevents long-term academic impact.
          </p>
        </div>
      )}

      <button onClick={onNewCheck}
        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
        <Clock className="w-4 h-4" /> Run another assessment
      </button>
    </div>
  );
}
