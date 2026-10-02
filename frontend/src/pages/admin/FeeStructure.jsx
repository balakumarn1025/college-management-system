/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Users, IndianRupee, Calendar, X } from "lucide-react";
import {
  listStructures,
  createStructure,
  updateStructure,
  deleteStructure,
  assignStructure,
} from "../../api/fees.api";
import { listDepartments, listCourses } from "../../api/misc.api";

const empty = {
  name: "",
  description: "",
  amount: 0,
  academic_year: "2025-2026",
  semester: 1,
  course_id: "",
  department_id: "",
  due_date: "",
  is_mandatory: true,
  is_active: true,
};

export default function FeeStructure() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignMode, setAssignMode] = useState("class");
  const [assignClass, setAssignClass] = useState("CSE-1A");

  const load = () => listStructures().then(setRows).catch(console.error);

  useEffect(() => {
    load();
    listDepartments().then(setDepartments);
    listCourses().then(setCourses);
  }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm(r); setEditing(r._id); setShowModal(true); };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      payload.amount = Number(payload.amount);
      payload.semester = Number(payload.semester);
      if (!payload.course_id) delete payload.course_id;
      if (!payload.department_id) delete payload.department_id;

      if (editing) {
        await updateStructure(editing, payload);
        toast.success("Updated");
      } else {
        await createStructure(payload);
        toast.success("Created");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this fee structure?")) return;
    try {
      await deleteStructure(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const onAssign = async () => {
    try {
      const payload =
        assignMode === "class"
          ? { class_id: assignClass }
          : { student_ids: [] };
      const res = await assignStructure(assignTarget._id, payload);
      toast.success(`Assigned to ${res.assigned} student(s)`);
      setShowAssign(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Fee Structures</h2>
          <p className="text-xs text-slate-500">
            Define fees once, assign to students in bulk
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} /> New Fee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Academic Year</th>
              <th className="p-3">Sem</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Mandatory</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.description}</div>
                </td>
                <td className="p-3 font-medium">₹{r.amount.toLocaleString()}</td>
                <td className="p-3">{r.academic_year}</td>
                <td className="p-3">{r.semester}</td>
                <td className="p-3">{r.due_date}</td>
                <td className="p-3">
                  {r.is_mandatory ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Mandatory
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  )}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => { setAssignTarget(r); setShowAssign(true); }}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="Assign to students"
                  >
                    <Users size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    className="p-1 hover:bg-slate-200 rounded ml-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(r._id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No fee structures yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">
                {editing ? "Edit" : "New"} Fee Structure
              </h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Tuition Fee"
                className="w-full border rounded-md px-3 py-2 mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Amount (₹) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Semester</label>
                <input
                  type="number"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Academic Year</label>
                <input
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Department</label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">All</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">All</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_mandatory}
                onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })}
              />
              <span className="text-sm">Mandatory fee</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && assignTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">Assign "{assignTarget.name}"</h3>
              <button onClick={() => setShowAssign(false)}><X size={18} /></button>
            </div>

            <div className="text-sm text-slate-600">
              Amount: <b>₹{assignTarget.amount.toLocaleString()}</b> • Due: {assignTarget.due_date}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Assign to</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setAssignMode("class")}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    assignMode === "class" ? "border-primary bg-blue-50 text-primary" : ""
                  }`}
                >
                  Class
                </button>
                <button
                  onClick={() => setAssignMode("all")}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    assignMode === "all" ? "border-primary bg-blue-50 text-primary" : ""
                  }`}
                >
                  All Students
                </button>
              </div>
            </div>

            {assignMode === "class" && (
              <div>
                <label className="text-xs font-medium text-slate-600">Class ID</label>
                <input
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  placeholder="CSE-1A"
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button onClick={onAssign} className="px-4 py-2 bg-primary text-white rounded-md">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}