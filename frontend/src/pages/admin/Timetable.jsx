/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

const empty = { class_id: "", day_of_week: "Monday", period_number: 1, start_time: "09:00", end_time: "10:00", subject_id: "", teacher_id: "", room_id: "" };
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [cls, setCls] = useState("CSE-1A");

  const load = () => api.get("/timetable", { params: { class_id: cls } }).then(r => setRows(r.data));
  useEffect(() => { load(); }, [cls]);
  useEffect(() => {
    api.get("/subjects").then(r => setSubjects(r.data));
    api.get("/teachers").then(r => setTeachers(r.data));
    api.get("/classrooms").then(r => setRooms(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timetable", { ...form, class_id: cls });
      toast.success("Added"); setShow(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/timetable/${id}`); load(); };

  const byDay = {};
  rows.forEach(r => { byDay[r.day_of_week] = byDay[r.day_of_week] || []; byDay[r.day_of_week].push(r); });
  Object.values(byDay).forEach(arr => arr.sort((a, b) => a.period_number - b.period_number));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input value={cls} onChange={e => setCls(e.target.value)} placeholder="Class ID (e.g., CSE-1A)" className="border rounded-md px-3 py-2 w-56"/>
        <button onClick={() => { setForm(empty); setShow(true); }} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16}/>Add Period</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <div key={day} className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3">{day}</h3>
            {(byDay[day] || []).length === 0 ? (
              <p className="text-xs text-slate-400">No periods</p>
            ) : (
              <ul className="space-y-2">
                {byDay[day].map(p => (
                  <li key={p._id} className="border-l-4 border-primary pl-3 py-1 text-sm flex justify-between">
                    <div>
                      <div className="font-medium">P{p.period_number}: {p.subject_name}</div>
                      <div className="text-xs text-slate-500">{p.teacher_name} • {p.room_number} • {p.start_time}-{p.end_time}</div>
                    </div>
                    <button onClick={() => del(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={submit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">Add Period — {cls}</h3>
            <select value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})} className="w-full border rounded-md px-3 py-2">
              {days.map(d => <option key={d}>{d}</option>)}
            </select>
            <input type="number" min="1" max="12" value={form.period_number} onChange={e => setForm({...form, period_number: parseInt(e.target.value)})} className="w-full border rounded-md px-3 py-2"/>
            <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} className="w-full border rounded-md px-3 py-2">
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
            </select>
            <select value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})} className="w-full border rounded-md px-3 py-2">
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <select value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})} className="w-full border rounded-md px-3 py-2">
              <option value="">Select room</option>
              {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}