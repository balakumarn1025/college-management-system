import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { adminDashboard } from "../../api/dashboard.api";
import { Users, GraduationCap, Building2, CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { adminDashboard().then(setData).catch(console.error); }, []);
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Students" value={data.total_students} color="bg-blue-500" />
        <StatCard icon={GraduationCap} label="Teachers" value={data.total_teachers} color="bg-purple-500" />
        <StatCard icon={Building2} label="Departments" value={data.total_departments} color="bg-emerald-500" />
        <StatCard icon={CalendarDays} label="Today's Classes" value={data.todays_classes} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Present" value={data.present} color="bg-green-500" />
        <StatCard icon={XCircle} label="Absent" value={data.absent} color="bg-red-500" />
        <StatCard icon={Clock} label="Late" value={data.late} color="bg-yellow-500" />
        <StatCard icon={CalendarDays} label="Leave" value={data.leave} color="bg-slate-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Students by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.department_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Recent Modifications</h3>
          {data.recent_modifications.length === 0 ? (
            <div className="text-sm text-slate-500">No recent modifications.</div>
          ) : (
            <ul className="space-y-3">
              {data.recent_modifications.map((m, i) => (
                <li key={i} className="border-l-4 border-amber-400 pl-3">
                  <div className="text-sm font-medium">{m.student_name}</div>
                  <div className="text-xs text-slate-500">
                    {m.old_status} → {m.new_status} • {m.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}