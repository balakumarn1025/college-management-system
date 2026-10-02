import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
// eslint-disable-next-line no-unused-vars
import { LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays, ClipboardCheck, History, Bell, FileBarChart, LogOut, Building2, School, Send ,IndianRupee, Wallet, Receipt } from "lucide-react";
const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/courses", label: "Courses", icon: School },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/history", label: "History", icon: History },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/fees/structure", label: "Fee Structure", icon: IndianRupee },
  { to: "/admin/fees/payments", label: "Fee Payments", icon: Wallet },
  { to: "/admin/notes", label: "Notes", icon: FileBarChart },
];

const teacherLinks = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teacher/mark", label: "Mark Attendance", icon: ClipboardCheck },
  { to: "/teacher/timetable", label: "My Timetable", icon: CalendarDays },
  { to: "/teacher/students", label: "Students", icon: Users },
  { to: "/teacher/notify", label: "Send Notification", icon: Send },        // ← NEW
  { to: "/teacher/notes", label: "Notes", icon: FileBarChart },
  { to: "/teacher/history", label: "History", icon: History },
];
const studentLinks = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/attendance", label: "My Attendance", icon: ClipboardCheck },
  { to: "/student/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/fees", label: "My Fees", icon: IndianRupee },
  { to: "/student/notes", label: "Notes", icon: FileBarChart },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === "admin" ? adminLinks : user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white">College MS</h1>
        <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                isActive ? "bg-primary text-white" : "hover:bg-slate-800"
              }`
            }
          >
            <l.icon size={18} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <div className="text-xs text-slate-400 mb-2 truncate">{user?.email}</div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}