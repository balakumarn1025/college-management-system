/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { FileText, Download, Search, BookOpen, Calendar } from "lucide-react";
import { getMyClassNotes, trackDownload } from "../../api/notes.api";
import toast from "react-hot-toast";

export default function StudentNotes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyClassNotes()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject_id?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const onDownload = (note) => {
    const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
    window.open(`${base}${note.file_url}`, "_blank");
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Study Notes</h2>
          <p className="text-xs text-slate-500">
            Notes shared by your teachers for your class
          </p>
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-3 py-2 border rounded-md w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
          <div className="text-sm">No notes available yet.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n) => (
            <div key={n._id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{fileIcon(n.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{n.title}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {n.subject_id?.code} — {n.subject_id?.name}
                  </div>
                </div>
              </div>

              {n.description && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{n.description}</p>
              )}

              <div className="flex flex-wrap gap-1 mt-3">
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
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => onDownload(n)}
                  className="bg-primary text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}