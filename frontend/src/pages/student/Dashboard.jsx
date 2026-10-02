import { useEffect, useState } from "react";
import { studentDashboard } from "../../api/dashboard.api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { studentDashboard().then(setData); }, []);
  if (!data) return <div>Loading...</div>;

  const pie = [
    { name: "Attended", value: data.overall.attended },
    { name: "Absent", value: data.overall.absent },
  ];
  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="space-y-6">
      {data.low_attendance.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
          <b>Low attendance warning:</b> You have {data.low_attendance.length} subject(s) below 75%.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-xs text-slate-500">Overall Attendance</div>
          <div className="text-3xl font-bold">{data.overall.percentage}%</div>
          <div className="text-xs text-slate-500 mt-1">{data.overall.attended}/{data.overall.total} periods</div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm col-span-2">
          <div className="text-sm font-medium mb-2">Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pie} dataKey="value" outerRadius={70} label>
                {pie.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-3">Subject-wise Attendance</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-2">Subject</th><th className="p-2">Attended</th><th className="p-2">Total</th><th className="p-2">%</th></tr></thead>
          <tbody>
            {data.by_subject.map(s => (
              <tr key={s.subject_id} className="border-t">
                <td className="p-2">{s.subject_name}</td>
                <td className="p-2">{s.attended}</td>
                <td className="p-2">{s.total}</td>
                <td className={`p-2 font-medium ${s.percentage < 75 ? "text-red-600" : "text-green-600"}`}>{s.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}