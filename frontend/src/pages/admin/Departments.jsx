import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { code: "", name: "", hod_name: "" };

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/departments").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/departments/${editing}`, form);
      else await api.post("/departments", form);
      toast.success("Saved"); setShow(false); load();
    } catch { toast.error("Failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/departments/${id}`); toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(empty); setEditing(null); setShow(true); }} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16}/>Add Department</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">HOD</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-mono">{r.code}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.hod_name}</td>
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
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Department</h3>
            {[["code","Code"],["name","Name"],["hod_name","HOD Name"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-medium text-slate-600">{l}</label>
                <input value={form[k]||""} onChange={e => setForm({...form,[k]:e.target.value})} className="w-full border rounded-md px-3 py-2 mt-1"/>
              </div>
            ))}
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