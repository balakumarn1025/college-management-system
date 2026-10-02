import { useEffect, useState } from "react";
import { listAttendance } from "../../api/attendance.api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState([]);

  useEffect(() => { listAttendance({ date }).then(setRows); }, [date]);

  const summary = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const chart = Object.entries(summary).map(([k, v]) => ({ status: k, count: v }));

  const exportCsv = () => {
    const header = ["Student", "Subject", "Period", "Status", "Reason"];
    const lines = rows.map(r => [r.student_code, r.subject_name, r.period_number, r.status, r.reason || ""].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${date}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-md px-3 py-2"/>
        <button onClick={exportCsv} className="bg-primary text-white px-4 py-2 rounded-md">Export CSV</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4">Status Summary — {date}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="status"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="count" fill="#2563eb" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}