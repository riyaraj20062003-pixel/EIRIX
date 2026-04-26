import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { fetchStats, DatasetStats } from "../../services/burnoutLogic";

interface LocalEntry {
  score: number;
  level: string;
  time: string;
}

function getLocalHistory(): { day: string; score: number; level: string }[] {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    const key = user.rollNo ? `burnout_history_${user.rollNo}` : "burnout_history";
    let entries: LocalEntry[] = JSON.parse(localStorage.getItem(key) || "[]");
    if (!entries.length) entries = JSON.parse(localStorage.getItem("burnout_history") || "[]");
    return entries.slice(-10).map((e, i) => ({
      day: e.time
        ? new Date(e.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `#${i + 1}`,
      score: e.score,
      level: e.level,
    }));
  } catch { return []; }
}

const dotColor = (level: string) =>
  level === "high" ? "#ef4444" : level === "moderate" ? "#f59e0b" : "#10b981";

export default function BurnoutGraph() {
  const { darkMode } = useTheme();
  const [history, setHistory] = useState(() => getLocalHistory());
  const [stats, setStats]     = useState<DatasetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Poll localStorage every 2s — updates immediately after a new prediction
  useEffect(() => {
    const id = setInterval(() => setHistory(getLocalHistory()), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  const tickColor = darkMode ? "#94a3b8" : "#64748b";
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";
  const tooltipBg = darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)";
  const tooltipFg = darkMode ? "#f1f5f9" : "#0f172a";

  return (
    <div className="space-y-6">

      {/* Chart or empty state */}
      {history.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
          <span className="text-5xl">📊</span>
          <p className="font-semibold text-sm">No data yet — run your first burnout check!</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="burnoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 14, border: "none", backgroundColor: tooltipBg, color: tooltipFg }}
                formatter={(v: number, _: string, props: any) => [
                  `${v} — ${(props.payload?.level ?? "").toUpperCase()}`,
                  "Burnout Score",
                ]}
              />
              <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="4 4"
                label={{ value: "High Risk", fill: "#ef4444", fontSize: 11 }} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: "Moderate", fill: "#f59e0b", fontSize: 11 }} />
              <Area
                type="monotone" dataKey="score"
                stroke="#6366f1" strokeWidth={3}
                fill="url(#burnoutGrad)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx} cy={cy} r={5}
                      fill={dotColor(payload.level)}
                      stroke="#fff" strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      {history.length > 0 && (
        <div className="flex gap-4 text-xs font-semibold flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Low Risk (&lt;40)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />Moderate (40–65)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />High Risk (&gt;65)</span>
        </div>
      )}

      {/* Dataset benchmarks */}
      {!loadingStats && stats && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Dataset Benchmarks — {stats.total.toLocaleString()} students
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Avg Sleep",      value: `${stats.averages.sleep}h`,      color: "blue"    },
              { label: "Avg Study",      value: `${stats.averages.study}h`,      color: "indigo"  },
              { label: "Avg Screen",     value: `${stats.averages.screen}h`,     color: "slate"   },
              { label: "Avg Anxiety",    value: `${stats.averages.anxiety}/10`,  color: "amber"   },
              { label: "Avg CGPA",       value: stats.averages.cgpa.toString(),  color: "emerald" },
              { label: "Avg Attendance", value: `${stats.averages.attendance}%`, color: "purple"  },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/30 text-center`}>
                <p className={`text-lg font-extrabold text-${color}-600`}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Distribution bar */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Risk Distribution in Dataset
            </p>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-emerald-500" style={{ width: `${(stats.distribution.low / stats.total) * 100}%` }} />
              <div className="bg-amber-500"   style={{ width: `${(stats.distribution.moderate / stats.total) * 100}%` }} />
              <div className="bg-red-500"     style={{ width: `${(stats.distribution.high / stats.total) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>🟢 Low {Math.round((stats.distribution.low / stats.total) * 100)}%</span>
              <span>🟡 Moderate {Math.round((stats.distribution.moderate / stats.total) * 100)}%</span>
              <span>🔴 High {Math.round((stats.distribution.high / stats.total) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
