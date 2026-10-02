import { useEffect, useState } from "react";
import { studentAttendance, studentPercentageBySubject, studentHistory } from "../../api/attendance.api";
import { useAuth } from "../../context/useAuth";

export default function MyAttendance() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [bySubj, setBySubj] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user?.ref_id) return;
    studentAttendance(user.ref_id).then(setRows);
    studentPercentageBySubject(user.ref_id).then(setBySubj);
    studentHistory(user.ref_id).then(setHistory);
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="font-semibold mb-3">Subject-wise</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-2">Subject</th><th className="p-2">%</th></tr></thead>
          <tbody>
            {bySubj.map(s => (
              <tr key={s.subject_id} className="border-t">
                <td className="p-2">{s.subject_name}</td>
                <td className={`p-2 font-medium ${s.percentage < 75 ? "text-red-600" : "text-green-600"}`}>{s.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="font-semibold mb-3">Recent Attendance</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-2">Date</th><th className="p-2">Subject</th><th className="p-2">Period</th><th className="p-2">Status</th></tr></thead>
          <tbody>
            {rows.slice(0, 30).map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.subject_name}</td>
                <td className="p-2">{r.period_number}</td>
                <td className="p-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="font-semibold mb-3">Modification History</h3>
        {history.length === 0 ? <p className="text-sm text-slate-500">No modifications.</p> : (
          <ul className="space-y-2 text-sm">
            {history.map(h => (
              <li key={h._id} className="border-l-4 border-amber-400 pl-3">
                <div>{h.date} P{h.period_number} — {h.subject_name}</div>
                <div className="text-xs text-slate-500">{h.old_status} → {h.new_status} • {h.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}