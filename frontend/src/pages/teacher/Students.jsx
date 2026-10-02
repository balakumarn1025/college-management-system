import { useEffect, useState } from "react";
import { listStudents } from "../../api/students.api";

export default function TeacherStudents() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => { listStudents({ search }).then(setRows); }, [search]);
  return (
    <div className="space-y-4">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="border rounded-md px-3 py-2 w-72"/>
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Year</th><th className="p-3">Section</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-mono">{r.student_id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.year}</td>
                <td className="p-3">{r.section}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}