/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Send,
  Users,
  User as UserIcon,
  Bell,
  Loader2,
  History,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";
import { listStudents } from "../../api/students.api";
import { listTimetable } from "../../api/timetable.api";
import { sendNotification, getSentNotifications } from "../../api/misc.api";
import { useAuth } from "../../context/AuthContext";

// ---------- Schema ----------
const schema = z.object({
  target: z.enum(["class", "student"]),
  class_id: z.string().optional(),
  student_id: z.string().optional(),
  title: z.string().min(2, "Title required"),
  message: z.string().min(3, "Message required"),
  type: z.enum(["announcement", "attendance", "warning", "general"]),
});

// ---------- Default classes ----------
const DEFAULT_CLASSES = ["CSE-1A", "CSE-2A", "CSE-3A", "CSE-4A"];

export default function SendNotification() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState("send"); // "send" | "history"

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      target: "class",
      class_id: "",
      student_id: "",
      title: "",
      message: "",
      type: "announcement",
    },
  });

  const target = watch("target");

  // Load teacher's classes and students
  useEffect(() => {
    if (!user?.ref_id) return;

    // Get teacher's assigned classes
    api
      .get(`/teachers/${user.ref_id}`)
      .then((r) => {
        const cls = r.data.class_ids?.length ? r.data.class_ids : DEFAULT_CLASSES;
        setMyClasses(cls);
      })
      .catch(() => setMyClasses(DEFAULT_CLASSES));

    // Load students (teacher can see their students)
    listStudents({})
      .then(setStudents)
      .catch(console.error);

    // Load sent history
    getSentNotifications().then(setSent).catch(console.error);
  }, [user]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        target: data.target,
        title: data.title,
        message: data.message,
        type: data.type,
      };

      if (data.target === "class") {
        if (!data.class_id) throw new Error("Select a class");
        payload.class_id = data.class_id;
      } else {
        if (!data.student_id) throw new Error("Select a student");
        payload.student_id = data.student_id;
      }

      const res = await sendNotification(payload);
      toast.success(res.message || "Notification sent");
      reset({
        target: data.target,
        class_id: "",
        student_id: "",
        title: "",
        message: "",
        type: "announcement",
      });

      // Refresh history
      getSentNotifications().then(setSent).catch(console.error);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message || "Failed to send");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "send", label: "Send", icon: Send },
          { id: "history", label: "Sent History", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === t.id
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ============ SEND TAB ============ */}
      {tab === "send" && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Send Notification</h2>
              <p className="text-xs text-slate-500">
                Students will see this in their notification center
              </p>
            </div>
          </div>

          {/* Target Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600">
              Send to
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                  target === "class"
                    ? "border-primary bg-blue-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="class"
                  className="hidden"
                  {...register("target")}
                />
                <Users
                  size={20}
                  className={target === "class" ? "text-primary" : "text-slate-400"}
                />
                <div>
                  <div className="text-sm font-medium">Entire Class</div>
                  <div className="text-xs text-slate-500">
                    All students in a section
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                  target === "student"
                    ? "border-primary bg-blue-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="student"
                  className="hidden"
                  {...register("target")}
                />
                <UserIcon
                  size={20}
                  className={target === "student" ? "text-primary" : "text-slate-400"}
                />
                <div>
                  <div className="text-sm font-medium">Individual Student</div>
                  <div className="text-xs text-slate-500">Pick one student</div>
                </div>
              </label>
            </div>
          </div>

          {/* Class / Student selector */}
          {target === "class" && (
            <div>
              <label className="text-xs font-medium text-slate-600">
                Class
              </label>
              <select
                {...register("class_id")}
                className="w-full border rounded-md px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a class…</option>
                {myClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.class_id && (
                <p className="text-xs text-red-500 mt-1">{errors.class_id.message}</p>
              )}
            </div>
          )}

          {target === "student" && (
            <div>
              <label className="text-xs font-medium text-slate-600">
                Student
              </label>
              <select
                {...register("student_id")}
                className="w-full border rounded-md px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a student…</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.student_id} — {s.name}
                  </option>
                ))}
              </select>
              {errors.student_id && (
                <p className="text-xs text-red-500 mt-1">{errors.student_id.message}</p>
              )}
            </div>
          )}

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-slate-600">Type</label>
            <select
              {...register("type")}
              className="w-full border rounded-md px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="announcement">📢 Announcement</option>
              <option value="attendance">📋 Attendance</option>
              <option value="warning">⚠️ Warning</option>
              <option value="general">💬 General</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input
              {...register("title")}
              placeholder="e.g., Extra class tomorrow"
              className="w-full border rounded-md px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-slate-600">Message</label>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Type your message..."
              className="w-full border rounded-md px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* Preview */}
          {watch("title") && watch("message") && (
            <div className="border-l-4 border-primary bg-blue-50/50 rounded-r-md p-3">
              <div className="text-xs text-slate-500 mb-1">Preview</div>
              <div className="font-medium text-slate-800 text-sm">
                {watch("title")}
              </div>
              <div className="text-sm text-slate-600 mt-0.5">
                {watch("message")}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ============ HISTORY TAB ============ */}
      {tab === "history" && (
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h3 className="font-semibold text-slate-800">
              Sent Notifications ({sent.length})
            </h3>
          </div>

          {sent.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">You haven't sent any notifications yet.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {sent.map((n, i) => (
                <li key={i} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 text-sm">
                          {n.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {n.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {n.recipient_count} recipient
                          {n.recipient_count !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={12} />
                          {n.read_count} read
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}