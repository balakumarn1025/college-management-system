/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { attendanceHistory } from "../../api/attendance.api";
import { History as HistoryIcon, Search } from "lucide-react";

export default function TeacherHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    attendanceHistory()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (r.student_name || "").toLowerCase().includes(s) ||
      (r.student_code || "").toLowerCase().includes(s) ||
      (r.subject_name || "").toLowerCase().includes(s) ||
      (r.reason || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header + search */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon size={20} className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            Attendance Modification History
          </h2>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, subject, reason..."
            className="pl-9 pr-3 py-2 border rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {rows.length === 0
              ? "No attendance modifications yet."
              : "No records match your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Student</th>
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 font-medium">Period</th>
                <th className="p-3 font-medium">Old → New</th>
                <th className="p-3 font-medium">Reason</th>
                <th className="p-3 font-medium">Modified By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-t hover:bg-slate-50">
                  <td className="p-3 whitespace-nowrap">{r.date}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.student_name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {r.student_code}
                    </div>
                  </td>
                  <td className="p-3">{r.subject_name}</td>
                  <td className="p-3 text-center">{r.period_number}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.old_status === "Present"
                          ? "bg-green-100 text-green-700"
                          : r.old_status === "Absent"
                          ? "bg-red-100 text-red-700"
                          : r.old_status === "Late"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.old_status}
                    </span>
                    <span className="mx-1 text-slate-400">→</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.new_status === "Present"
                          ? "bg-green-100 text-green-700"
                          : r.new_status === "Absent"
                          ? "bg-red-100 text-red-700"
                          : r.new_status === "Late"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.new_status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-600 max-w-xs">
                    {r.reason || "-"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.modified_by_name || "System"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <div className="text-xs text-slate-500 text-right">
          Showing {filtered.length} of {rows.length} records
        </div>
      )}
    </div>
  );
}