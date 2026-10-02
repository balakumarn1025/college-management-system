/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { listTeachers, createTeacher, updateTeacher, deleteTeacher } from "../../api/teachers.api";
import { listSubjects } from "../../api/misc.api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const empty = { teacher_id: "", name: "", email: "", phone: "", subject_ids: [], class_ids: [], password: "teacher123" };

export default function Teachers() {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => listTeachers({ search }).then(setRows).catch(console.error);
  useEffect(() => { load(); }, [search]);
  useEffect(() => { listSubjects().then(setSubjects).catch(console.error); }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm({ ...r, password: "" }); setEditing(r._id); setShowModal(true); };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editing) { delete payload.password; await updateTeacher(editing, payload); }
      else { await createTeacher(payload); }
      toast.success("Saved"); setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete?")) return;
    try { await deleteTeacher(id); toast.success("Deleted"); load(); } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="pl-9 pr-3 py-2 border rounded-md w-72" />
        </div>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Classes</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono">{r.teacher_id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{(r.class_ids || []).join(", ") || "-"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(r)} className="p-1 hover:bg-slate-200 rounded"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(r._id)} className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No teachers.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            
{[["teacher_id", "Teacher ID", "text", !!editing], ["name", "Name"], ["email", "Email", "email"], ["phone", "Phone"]].map(([k, label, type, disabled]) => (
  <div key={k}>
    <label className="text-xs font-medium text-slate-600">{label}</label>
    <input
      type={type}
      disabled={disabled}
      value={form[k] ?? ""}
      onChange={e => setForm({ ...form, [k]: e.target.value })}
      className="w-full border rounded-md px-3 py-2 mt-1 disabled:bg-slate-100"
    />
  </div>
))}
// 
            <div>
              <label className="text-xs font-medium text-slate-600">Class IDs (comma separated)</label>
              <input value={(form.class_ids || []).join(",")} onChange={e => setForm({ ...form, class_ids: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full border rounded-md px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Subjects</label>
              <select multiple value={form.subject_ids} onChange={e => setForm({ ...form, subject_ids: Array.from(e.target.selectedOptions).map(o => o.value) })} className="w-full border rounded-md px-3 py-2 mt-1 h-24">
                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            {!editing && (
              <div>
                <label className="text-xs font-medium text-slate-600">Password</label>
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded-md px-3 py-2 mt-1" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}