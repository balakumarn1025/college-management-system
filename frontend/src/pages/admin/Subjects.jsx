import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { code: "", name: "", course_id: "", semester: 1, credits: 3 };

export default function Subjects() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/subjects").then(r => setRows(r.data));
  useEffect(() => { load(); api.get("/courses").then(r => setCourses(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/subjects/${editing}`, form);
      else await api.post("/subjects", form);
      toast.success("Saved"); setShow(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/subjects/${id}`); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(empty); setEditing(null); setShow(true); }} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16}/>Add Subject</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Semester</th><th className="p-3">Credits</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-mono">{r.code}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.semester}</td>
                <td className="p-3">{r.credits}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setForm(r); setEditing(r._id); setShow(true); }} className="p-1 hover:bg-slate-200 rounded"><Pencil size={14}/></button>
                  <button onClick={() => del(r._id)} className="p-1 ml-1 hover:bg-red-100 text-red-600 rounded"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={submit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Subject</h3>
            <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <select value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="w-full border rounded-md px-3 py-2">
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
            </select>
            <input type="number" placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} className="w-full border rounded-md px-3 py-2"/>
            <input type="number" placeholder="Credits" value={form.credits} onChange={e => setForm({...form, credits: parseInt(e.target.value)})} className="w-full border rounded-md px-3 py-2"/>
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