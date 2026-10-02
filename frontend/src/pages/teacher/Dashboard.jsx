import { useEffect, useState } from "react";
import { teacherDashboard } from "../../api/dashboard.api";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { teacherDashboard().then(setData); }, []);
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-xs text-slate-500">Classes Today</div>
          <div className="text-2xl font-bold">{data.classes_today_count}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-xs text-slate-500">Pending Attendance</div>
          <div className="text-2xl font-bold text-amber-600">{data.pending_attendance}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-xs text-slate-500">Teacher</div>
          <div className="text-lg font-semibold">{data.teacher_name}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-3">Today's Classes</h3>
        {data.classes_today.length === 0 ? (
          <p className="text-sm text-slate-500">No classes today.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left"><tr><th className="p-2">Period</th><th className="p-2">Subject</th><th className="p-2">Class</th><th className="p-2">Time</th><th className="p-2">Status</th></tr></thead>
            <tbody>
              {data.classes_today.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{c.period}</td>
                  <td className="p-2">{c.subject}</td>
                  <td className="p-2">{c.class_id}</td>
                  <td className="p-2">{c.start} - {c.end}</td>
                  <td className="p-2">
                    {c.attendance_done ? <span className="text-green-600 text-xs">Done</span> : <span className="text-amber-600 text-xs">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}