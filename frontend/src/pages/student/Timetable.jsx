/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetable() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user?.ref_id) return;
    api.get(`/students/${user.ref_id}`).then(r => {
      setStudent(r.data);
      const cls = `-${r.data.year}${r.data.section}`;
      api.get("/timetable").then(res => {
        setRows(res.data.filter(t => t.class_id.endsWith(cls)));
      });
    });
  }, [user]);

  const byDay = {};
  rows.forEach(r => { byDay[r.day_of_week] = byDay[r.day_of_week] || []; byDay[r.day_of_week].push(r); });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {days.map(d => (
        <div key={d} className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold mb-2">{d}</h3>
          {(byDay[d] || []).length === 0 ? <p className="text-xs text-slate-400">No classes</p> : (
            <ul className="space-y-2 text-sm">
              {byDay[d].sort((a,b) => a.period_number - b.period_number).map(p => (
                <li key={p._id} className="border-l-4 border-primary pl-3">
                  <div className="font-medium">P{p.period_number} — {p.subject_name}</div>
                  <div className="text-xs text-slate-500">{p.teacher_name} • {p.room_number} • {p.start_time}-{p.end_time}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}