/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Camera, Mail, Phone, User as UserIcon, Lock, Save, Loader2,
  GraduationCap, BookOpen, Briefcase, Calendar, MapPin, Building2,
  ShieldCheck, Award, Clock
} from "lucide-react";
import {
  getProfile, updateProfile, uploadProfileImage, changePassword,
} from "../../api/profile.api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("details");
  const fileInputRef = useRef(null);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProfile()
      .then(setProfile)
      .catch((e) => toast.error(e.response?.data?.detail || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success("Profile updated");
      // Refresh auth user name if it changed
      if (profile.name && user?.name !== profile.name) {
        const updated = { ...user, name: profile.name };
        setUser?.(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadProfileImage(fd);
      setProfile((p) => ({ ...p, profile_image: res.profile_image }));
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setPwSaving(false);
    }
  };

  const imgUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
    return `${base}${path}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading profile...
      </div>
    );
  }

  if (!profile) return <div className="text-slate-500">Profile not found.</div>;

  const initials = (profile.name || "U")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ---------- Header Card ---------- */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-wrap items-end gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {profile.profile_image ? (
                  <img
                    src={imgUrl(profile.profile_image)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl font-bold text-primary bg-blue-50 w-full h-full flex items-center justify-center">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 bg-primary hover:bg-blue-700 text-white p-2 rounded-full shadow-lg disabled:opacity-60"
                title="Change picture"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onImageChange}
              />
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-[220px] pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">
                  {profile.name || "Unnamed User"}
                </h1>
                <RoleBadge role={user?.role} />
              </div>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Mail size={14} /> {profile.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "details", label: "Edit Details", icon: UserIcon },
          { id: "password", label: "Change Password", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === t.id ? "bg-white shadow text-slate-900" : "text-slate-600"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ---------- Details Tab ---------- */}
      {tab === "details" && (
        <form
          onSubmit={onSave}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-6"
        >
          {/* Common fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              icon={UserIcon}
              value={profile.name || ""}
              onChange={(v) => set("name", v)}
            />
            <Field
              label="Phone"
              icon={Phone}
              value={profile.phone || ""}
              onChange={(v) => set("phone", v)}
              placeholder="+91 80000 00000"
            />
            <Field
              label="Email (read-only)"
              icon={Mail}
              value={profile.email || ""}
              disabled
            />
          </div>

          {/* Role-specific fields */}
          {user?.role === "student" && (
            <StudentFields profile={profile} set={set} />
          )}
          {user?.role === "teacher" && (
            <TeacherFields profile={profile} set={set} />
          )}
          {user?.role === "admin" && (
            <AdminFields profile={profile} set={set} />
          )}

          {/* Save */}
          <div className="flex justify-end pt-2 border-t">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ---------- Password Tab ---------- */}
      {tab === "password" && (
        <form
          onSubmit={onChangePassword}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-4 max-w-lg"
        >
          <div>
            <label className="text-xs font-medium text-slate-600">Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">New Password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1"
              minLength={6}
              required
            />
            <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1"
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pwSaving}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-md flex items-center gap-2 disabled:opacity-60"
            >
              {pwSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Updating...</>
              ) : (
                <><Lock size={16} /> Update Password</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------- Role-specific field groups ---------- */

function StudentFields({ profile, set }) {
  return (
    <>
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <GraduationCap size={16} /> Academic Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ReadOnlyField label="Student ID" value={profile.student_id} />
          <ReadOnlyField label="Department" value={profile.department?.name || "—"} />
          <ReadOnlyField label="Course" value={profile.course?.name || "—"} />
          <Field
            label="Year"
            icon={Calendar}
            type="number"
            value={profile.year || 1}
            onChange={(v) => set("year", Number(v))}
          />
          <Field
            label="Semester"
            icon={Calendar}
            type="number"
            value={profile.semester || 1}
            onChange={(v) => set("semester", Number(v))}
          />
          <Field
            label="Section"
            icon={BookOpen}
            value={profile.section || "A"}
            onChange={(v) => set("section", v)}
          />
          <Field
            label="Date of Birth"
            icon={Calendar}
            type="date"
            value={profile.dob || ""}
            onChange={(v) => set("dob", v)}
          />
          <Field
            label="Address"
            icon={MapPin}
            value={profile.address || ""}
            onChange={(v) => set("address", v)}
          />
        </div>
      </div>
    </>
  );
}

function TeacherFields({ profile, set }) {
  return (
    <>
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Briefcase size={16} /> Professional Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ReadOnlyField label="Teacher ID" value={profile.teacher_id} />
          <ReadOnlyField label="Department" value={profile.department?.name || "—"} />
          <Field
            label="Qualification"
            icon={Award}
            value={profile.qualification || ""}
            onChange={(v) => set("qualification", v)}
            placeholder="e.g. M.Tech, Ph.D"
          />
          <Field
            label="Experience (years)"
            icon={Clock}
            type="number"
            value={profile.experience_years || 0}
            onChange={(v) => set("experience_years", Number(v))}
          />
        </div>

        {profile.subjects?.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-600 mb-2">Subjects Handled</div>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((s) => (
                <span
                  key={s._id}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  {s.code} — {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Bio / Short Introduction</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            placeholder="Tell students about yourself..."
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>
      </div>
    </>
  );
}

function AdminFields({ profile, set }) {
  return (
    <>
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} /> Administration
        </h3>
        <div>
          <label className="text-xs font-medium text-slate-600">Bio</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>
      </div>
    </>
  );
}

/* ---------- Reusable small components ---------- */

function Field({ label, icon: Icon, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="relative mt-1">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border rounded-md ${Icon ? "pl-9" : "pl-3"} pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-500`}
        />
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="mt-1 px-3 py-2 bg-slate-50 border rounded-md text-sm text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    admin: { label: "Admin", cls: "bg-red-100 text-red-700" },
    teacher: { label: "Teacher", cls: "bg-purple-100 text-purple-700" },
    student: { label: "Student", cls: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[role] || map.student;
  return (
    <span className={`text-[10px] uppercase font-semibold tracking-wide px-2 py-0.5 rounded-full ${info.cls}`}>
      {info.label}
    </span>
  );
}