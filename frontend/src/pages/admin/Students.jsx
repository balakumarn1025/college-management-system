/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { listStudents, createStudent, updateStudent, deleteStudent } from "../../api/students.api";
import { listDepartments } from "../../api/misc.api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const empty = {
  student_id: "", name: "", email: "", phone: "", year: 1, semester: 1,
  section: "A", dob: "", address: "", password: "student123"
};

export default function Students() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => listStudents({ search }).then(setRows).catch(console.error);
  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm({ ...r, password: "" }); setEditing(r._id); setShowModal(true); };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editing && (!form.student_id.trim() || !form.name.trim() || !form.email.trim())) {
        toast.error("Student ID, name, and email are required");
        return;
      }
      if (editing) {
        const payload = { ...form };
        delete payload.password;
        await updateStudent(editing, payload);
        toast.success("Student updated");
      } else {
        await createStudent(form);
        toast.success("Student created");
      }
      setShowModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try { await deleteStudent(id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="pl-9 pr-3 py-2 border rounded-md w-72"
          />
        </div>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">ID</th><th className="p-3">Name</th>
              <th className="p-3">Email</th><th className="p-3">Year</th>
              <th className="p-3">Section</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono">{r.student_id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.year}</td>
                <td className="p-3">{r.section}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(r)} className="p-1 hover:bg-slate-200 rounded"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(r._id)} className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No students.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Student</h3>
          {[
  ["student_id", "Student ID", "text", !!editing],
  ["name", "Name"],
  ["email", "Email", "email"],
  ["phone", "Phone"],
  ["year", "Year", "number"],
  ["semester", "Semester", "number"],
  ["section", "Section"],
  ["dob", "Date of Birth", "date"],
  ["address", "Address"],
].map(([k, label, type = "text", disabled = false]) => (
  <div key={k}>
    <label className="text-xs font-medium text-slate-600">{label}</label>
    <input
      type={type}
      disabled={disabled}
      required={k === "student_id" || k === "name" || k === "email"}
      value={form[k] ?? ""}
      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
      className="w-full border rounded-md px-3 py-2 mt-1 disabled:bg-slate-100"
      placeholder={k === "student_id" ? "e.g., STU006" : ""}
    />
  </div>
))}
            {!editing && (
              <div>
                <label className="text-xs font-medium text-slate-600">Password</label>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1" />
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