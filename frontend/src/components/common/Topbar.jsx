import { useAuth } from "../../context/useAuth";
import { Bell } from "lucide-react";

export default function Topbar({ title }) {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <div className="flex items-center gap-3">
        <Bell size={18} className="text-slate-500" />
        <div className="text-sm">
          <div className="font-medium">{user?.name || user?.email}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
        </div>
      </div>
    </header>
  );
}