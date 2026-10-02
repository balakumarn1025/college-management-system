/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useCallback } from "react";
import toast from "react-hot-toast";
import {
  Upload, FileText, Trash2, Download, Search, Plus, X, Filter,
  BookOpen, Calendar
} from "lucide-react";
import {
  listNotes, uploadNote, deleteNote, trackDownload,
} from "../../api/notes.api";
import { listSubjects } from "../../api/misc.api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  subject_id: "",
  class_id: "",
  semester: 1,
  unit: "",
  academic_year: "2025-2026",
  file: null,
};

export default function NotesManager({ mode = "admin" }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    const params = { search };
    if (mode === "teacher") params.mine = "1";
    listNotes(params).then(setNotes).catch(console.error);
  }, [search, mode]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { listSubjects().then(setSubjects).catch(console.error); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      await uploadNote(fd);
      toast.success("Note uploaded");
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const onDownload = (note) => {
    const url = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000"}${note.file_url}`;
    window.open(url, "_blank");
    trackDownload(note._id).catch(() => {});
  };

  const fileIcon = (ext) => {
    if (ext === "pdf") return "📕";
    if (["doc", "docx"].includes(ext)) return "📘";
    if (["ppt", "pptx"].includes(ext)) return "📙";
    if (["png", "jpg", "jpeg"].includes(ext)) return "🖼️";
    return "📄";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title..."
            className="pl-9 pr-3 py-2 border rounded-md w-full"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} /> Upload Note
        </button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-400">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <div className="text-sm">No notes yet. Click "Upload Note" to add one.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div key={n._id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{fileIcon(n.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{n.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {n.subject_id?.code} — {n.subject_id?.name}
                  </div>
                </div>
              </div>

              {n.description && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{n.description}</p>
              )}

              <div className="flex flex-wrap gap-1 mt-3">
                {n.class_id && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {n.class_id}
                  </span>
                )}
                {n.unit && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {n.unit}
                  </span>
                )}
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">
                  {n.file_type}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="text-xs text-slate-500">
                  <div>By {n.uploaded_by_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={10} />
                    {new Date(n.createdAt).toLocaleDateString()}
                    <span>• {n.download_count} downloads</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onDownload(n)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(n._id)}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">Upload Note</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Chapter 3 — Integrals"
                className="w-full border rounded-md px-3 py-2 mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border rounded-md px-3 py-2 mt-1 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Subject *</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Class</label>
                <input
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  placeholder="CSE-1A (blank = all)"
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Semester</label>
                <input
                  type="number"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Unit 1"
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Year</label>
                <input
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">File *</label>
              <label className="mt-1 flex items-center gap-2 border-2 border-dashed rounded-md px-4 py-6 cursor-pointer hover:bg-slate-50">
                <Upload size={20} className="text-slate-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {form.file ? form.file.name : "Choose file"}
                  </div>
                  <div className="text-xs text-slate-500">
                    PDF, DOCX, PPTX, PNG, JPG — max 20 MB
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}