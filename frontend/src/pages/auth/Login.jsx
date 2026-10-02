import { forwardRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Mail, Lock, User, Eye, EyeOff, Loader2, GraduationCap,
  ShieldCheck, BookOpen, Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ---------- Schemas ----------
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["student", "teacher"]),
});

// ---------- Component ----------
export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [showPw, setShowPw] = useState(false);
  const { login, register: registerUser, googleLogin } = useAuth();
  const nav = useNavigate();

  const redirectByRole = (user) => {
    toast.success(`Welcome ${user.name || user.email}`);
    nav(`/${user.role}`);
  };

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const regForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "student" },
  });
  const selectedRole = useWatch({ control: regForm.control, name: "role" });

  const onLogin = async (data) => {
    try {
      redirectByRole(await login(data.email, data.password));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    }
  };

  const onRegister = async (data) => {
    try {
      redirectByRole(await registerUser(data));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Registration failed");
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      redirectByRole(await googleLogin(credentialResponse.credential));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ---------- Left: Branding ---------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 backdrop-blur rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="text-xl font-bold">College MS</div>
            <div className="text-xs text-blue-200">Hourly Attendance System</div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Attendance that works<br />
            <span className="text-blue-300">period by period.</span>
          </h1>
          <p className="text-blue-100 max-w-md">
            A modern college management system that records attendance
            hour-by-hour — so late arrivals never lose a whole day.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6">
            <Feature icon={ShieldCheck} label="Secure" />
            <Feature icon={BookOpen} label="Period-wise" />
            <Feature icon={Users} label="Role-based" />
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200">
          © 2026 College MS. All rights reserved.
        </div>
      </div>

      {/* ---------- Right: Auth Form ---------- */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  tab === t
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === "login"
                ? "Sign in to continue to your dashboard"
                : "Register as a student or teacher"}
            </p>

            {/* ============ LOGIN FORM ============ */}
            {tab === "login" && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-6 space-y-4">
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  placeholder="you@college.edu"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email")}
                />
                <PasswordField
                  label="Password"
                  placeholder="••••••••"
                  show={showPw}
                  toggle={() => setShowPw((v) => !v)}
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register("password")}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toast("Contact admin to reset password")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <SubmitButton
                  loading={loginForm.formState.isSubmitting}
                  label="Sign In"
                />
              </form>
            )}

            {/* ============ REGISTER FORM ============ */}
            {tab === "register" && (
              <form onSubmit={regForm.handleSubmit(onRegister)} className="mt-6 space-y-4">
                <Field
                  icon={User}
                  label="Full Name"
                  placeholder="Padma Sri"
                  error={regForm.formState.errors.name?.message}
                  {...regForm.register("name")}
                />
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  placeholder="you@college.edu"
                  error={regForm.formState.errors.email?.message}
                  {...regForm.register("email")}
                />
                <PasswordField
                  label="Password"
                  placeholder="At least 6 characters"
                  show={showPw}
                  toggle={() => setShowPw((v) => !v)}
                  error={regForm.formState.errors.password?.message}
                  {...regForm.register("password")}
                />

                <div>
                  <label className="text-xs font-medium text-slate-600">I am a</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {["student", "teacher"].map((r) => (
                      <label
                        key={r}
                        className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm capitalize ${
                          selectedRole === r
                            ? "border-primary bg-blue-50 text-primary font-medium"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={r}
                          className="hidden"
                          {...regForm.register("role")}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>

                <SubmitButton
                  loading={regForm.formState.isSubmitting}
                  label="Create Account"
                />
              </form>
            )}

            {/* ============ DIVIDER ============ */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or continue with</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* ============ GOOGLE LOGIN ============ */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => toast.error("Google sign-in failed")}
                theme="outline"
                size="large"
                width="360"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            {/* Demo credentials */}
            {tab === "login" && (
              <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-medium text-slate-700">Demo credentials:</div>
                <div><b>Admin:</b> admin@college.edu / admin123</div>
                <div><b>Teacher:</b> teacherA@college.edu / teacher123</div>
                <div><b>Student:</b> arun@college.edu / student123</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Small helpers ----------
function Feature({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-white/5 backdrop-blur rounded-xl border border-white/10">
      <Icon size={20} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

const Field = forwardRef(function Field({ icon: Icon, label, error, ...props }, ref) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="relative mt-1">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          ref={ref}
          className="w-full border rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

const PasswordField = forwardRef(function PasswordField(
  { label, error, show, toggle, ...props },
  ref
) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="relative mt-1">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={show ? "text" : "password"}
          {...props}
          ref={ref}
          className="w-full border rounded-md pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {loading ? "Please wait..." : label}
    </button>
  );
}