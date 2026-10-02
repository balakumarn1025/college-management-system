import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { code: "", name: "", department_id: "", duration_years: 4 };

export default function Courses() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/courses").then(r => setRows(r.data));
  useEffect(() => { load(); api.get("/departments").then(r => setDepartments(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/courses/${editing}`, form);
      else await api.post("/courses", form);
      toast.success("Saved"); setShow(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/courses/${id}`); load(); };

  const deptName = (id) => departments.find(d => d._id === id)?.code || "";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(empty); setEditing(null); setShow(true); }} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16}/>Add Course</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Dept</th><th className="p-3">Years</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-mono">{r.code}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{deptName(r.department_id)}</td>
                <td className="p-3">{r.duration_years}</td>
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
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Course</h3>
            <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-md px-3 py-2"/>
            <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})} className="w-full border rounded-md px-3 py-2">
              <option value="">Select department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.code} - {d.name}</option>)}
            </select>
            <input type="number" placeholder="Duration (years)" value={form.duration_years} onChange={e => setForm({...form, duration_years: parseInt(e.target.value)})} className="w-full border rounded-md px-3 py-2"/>
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