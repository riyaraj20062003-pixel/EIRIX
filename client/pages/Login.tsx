import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BrainCircuit, Mail, Lock, Loader2, ArrowLeft, Hash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "../components/LanguageSwitcher";

const ROLE_COLORS: Record<string, string> = {
  student: "from-indigo-600 to-purple-600",
  parent:  "from-purple-600 to-pink-600",
  mentor:  "from-emerald-600 to-teal-600",
};

// Demo credentials — any of these will work
const DEMO_USERS: Record<string, { email: string; password: string; rollNo?: string; employeeId?: string; name: string; role: string; course?: string; department?: string; designation?: string }[]> = {
  student: [
    { email: "alex@university.edu",  password: "alex123",    rollNo: "CS2021001", name: "Alex Johnson",   role: "student", course: "B.Tech CSE · Year 3" },
    { email: "priya@university.edu", password: "priya123",   rollNo: "CS2021002", name: "Priya Sharma",   role: "student", course: "B.Tech CSE · Year 3" },
  ],
  parent: [
    { email: "robert@gmail.com",     password: "parent123",  name: "Robert Johnson", role: "parent" },
    { email: "sunita@gmail.com",     password: "parent456",  name: "Sunita Sharma",  role: "parent" },
  ],
  mentor: [
    { email: "ramesh@university.edu",password: "mentor123",  employeeId: "EMP001", name: "Dr. Ramesh Kumar",  role: "mentor", designation: "Associate Professor", department: "Computer Science" },
    { email: "preet@university.edu", password: "mentor456",  employeeId: "EMP002", name: "Dr. Preet Kaur",    role: "mentor", designation: "Assistant Professor", department: "Computer Science" },
  ],
};

const DEMO_HINTS: Record<string, { label: string; value: string }[]> = {
  student: [
    { label: "Email",    value: "alex@university.edu" },
    { label: "Roll No",  value: "CS2021001"            },
    { label: "Password", value: "alex123"              },
  ],
  parent: [
    { label: "Email",    value: "robert@gmail.com" },
    { label: "Password", value: "parent123"         },
  ],
  mentor: [
    { label: "Email",       value: "ramesh@university.edu" },
    { label: "Employee ID", value: "EMP001"                 },
    { label: "Password",    value: "mentor123"              },
  ],
};

export default function LoginPage() {
  const { role }    = useParams<{ role: string }>();
  const navigate    = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [name,       setName]       = useState("");
  const [rollNo,     setRollNo]     = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");

  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  const gradient  = ROLE_COLORS[role ?? "student"] ?? ROLE_COLORS.student;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Small delay to simulate auth
    await new Promise(r => setTimeout(r, 600));

    const users = DEMO_USERS[role ?? "student"] ?? [];

    // Match by email + password
    let matched = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    );

    // For student: also check rollNo matches if provided
    if (matched && role === "student" && rollNo.trim()) {
      if (matched.rollNo?.toLowerCase() !== rollNo.toLowerCase().trim()) {
        matched = undefined;
      }
    }

    // For mentor: also check employeeId if provided
    if (matched && role === "mentor" && employeeId.trim()) {
      if (matched.employeeId?.toLowerCase() !== employeeId.toLowerCase().trim()) {
        matched = undefined;
      }
    }

    if (!matched) {
      setError("Invalid credentials. Check the demo credentials below.");
      setLoading(false);
      return;
    }

    // Save user to localStorage (same shape the rest of the app expects)
    const savedUser = {
      ...matched,
      name: name.trim() || matched.name,
      id: Math.random().toString(36).slice(2),
    };
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("token", "demo-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify(savedUser));
    localStorage.setItem("session_start", Date.now().toString());

    setLoading(false);
    window.location.href = `/${role}/dashboard`;
  };

  const hints = DEMO_HINTS[role ?? ""] ?? [];

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 dark:text-slate-100">
      <Link to="/" className="absolute top-8 left-8 flex items-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to role selection
      </Link>
      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className={cn("w-14 h-14 rounded-2xl mx-auto mb-4 overflow-hidden shadow-xl")}>
            <img src="/eirix-logo.png" alt="EIRIX" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {roleTitle} Login
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Access your personalized EIRIX dashboard
          </p>
        </div>

        <Card className="glass border-transparent shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="dark:text-slate-400">Enter your credentials to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Display name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-slate-200">Your Name <span className="text-slate-400 font-normal">(optional)</span></Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input id="name" type="text"
                    placeholder={role === "mentor" ? "e.g. Dr. Ramesh Kumar" : role === "parent" ? "e.g. Robert Johnson" : "e.g. Alex Johnson"}
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Overrides the name shown on your dashboard</p>
              </div>

              {/* Roll No — student only */}
              {role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="rollNo" className="dark:text-slate-200">Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input id="rollNo" type="text" placeholder="e.g. CS2021001"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={rollNo} onChange={e => setRollNo(e.target.value)} required
                    />
                  </div>
                </div>
              )}

              {/* Employee ID — mentor only */}
              {role === "mentor" && (
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="dark:text-slate-200">Employee ID</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input id="employeeId" type="text" placeholder="e.g. EMP001"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={employeeId} onChange={e => setEmployeeId(e.target.value)} required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input id="email" type="email"
                    placeholder={role === "student" ? "name@university.edu" : "parent@gmail.com"}
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={email} onChange={e => setEmail(e.target.value)} required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input id="password" type="password" placeholder="••••••••"
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={password} onChange={e => setPassword(e.target.value)} required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}
                className={cn("w-full h-12 text-white font-bold rounded-xl shadow-lg transition-all duration-300 bg-gradient-to-r", gradient)}>
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Authenticating...</>
                  : "Sign In"
                }
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 mt-2 pt-5">
            {hints.length > 0 && (
              <div className="w-full p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">Demo Credentials</p>
                <div className="space-y-1">
                  {hints.map(h => (
                    <div key={h.label} className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{h.label}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
