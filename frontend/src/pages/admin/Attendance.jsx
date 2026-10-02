import { useEffect, useState } from "react";
import { listAttendance } from "../../api/attendance.api";

export default function AdminAttendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);

  useEffect(() => { listAttendance({ date }).then(setRows); }, [date]);

  return (
    <div className="space-y-4">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-md px-3 py-2"/>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-3">Student</th><th className="p-3">Subject</th><th className="p-3">Period</th><th className="p-3">Status</th><th className="p-3">Reason</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.student_code} — {r.student_name}</td>
                <td className="p-3">{r.subject_name}</td>
                <td className="p-3">{r.period_number}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    r.status === "Present" ? "bg-green-100 text-green-700" :
                    r.status === "Absent" ? "bg-red-100 text-red-700" :
                    r.status === "Late" ? "bg-yellow-100 text-yellow-700" :
                    "bg-slate-100 text-slate-700"}`}>{r.status}</span>
                </td>
                <td className="p-3 text-xs text-slate-500">{r.reason || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No records.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}