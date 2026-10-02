
import { useEffect, useState } from "react";
import { attendanceHistory } from "../../api/attendance.api";

export default function History() {
  const [rows, setRows] = useState([]);
  useEffect(() => { attendanceHistory().then(setRows); }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr><th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Subject</th><th className="p-3">Period</th><th className="p-3">Old → New</th><th className="p-3">Reason</th><th className="p-3">By</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id} className="border-t">
              <td className="p-3">{r.date}</td>
              <td className="p-3">{r.student_code} — {r.student_name}</td>
              <td className="p-3">{r.subject_name}</td>
              <td className="p-3">{r.period_number}</td>
              <td className="p-3">
                <span className="text-red-600">{r.old_status}</span> → <span className="text-green-600">{r.new_status}</span>
              </td>
              <td className="p-3 text-xs">{r.reason}</td>
              <td className="p-3">{r.modified_by_name}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No history.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}