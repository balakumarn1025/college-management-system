import { useEffect, useState } from "react";
import { getRoster, saveAttendance } from "../../api/attendance.api";
import { byTeacher } from "../../api/timetable.api";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";

const statuses = ["Present", "Absent", "Late", "Leave"];

const subjectIdOf = (period) =>
  typeof period?.subject_id === "object" ? period.subject_id?._id : period?.subject_id;

const subjectNameOf = (period) =>
  typeof period?.subject_id === "object" ? period.subject_id?.name : period?.subject_name || "";

export default function MarkAttendance() {
  const { user } = useAuth();
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [day] = useState(() => new Date().toLocaleDateString("en-US", { weekday: "long" }));
  const [periods, setPeriods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.ref_id) return;
    byTeacher(user.ref_id, { day })
      .then(setPeriods)
      .catch(() => toast.error("Failed to load your timetable"));
  }, [user, day]);

  const loadRoster = async (period) => {
    setSelected(period);
    setLoading(true);
    setRoster([]);
    try {
      const data = await getRoster(period.class_id, today, period.period_number, subjectIdOf(period));
      setRoster(data);
      if (!data.length) toast.error("No students found for this class");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to load roster");
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setRoster((current) => current.map((student) =>
      student.student_id === studentId ? { ...student, status } : student,
    ));
  };

  const setReason = (studentId, reason) => {
    setRoster((current) => current.map((student) =>
      student.student_id === studentId ? { ...student, reason } : student,
    ));
  };

  const markAll = (status) =>
    setRoster((current) => current.map((student) => ({ ...student, status })));

  const save = async () => {
    if (!selected || !roster.length) {
      toast.error("Nothing to save");
      return;
    }
    try {
      const response = await saveAttendance({
        class_id: selected.class_id,
        date: today,
        period_number: selected.period_number,
        subject_id: subjectIdOf(selected),
        items: roster.map((student) => ({
          student_id: student.student_id,
          status: student.status,
          reason: student.reason || null,
        })),
      });
      toast.success(`Saved. Modified: ${response.modified ?? 0}`);
      loadRoster(selected);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-3">Your Periods - {day}</h3>
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <button
              key={period._id}
              onClick={() => loadRoster(period)}
              className={`px-3 py-2 rounded-md border text-sm ${selected?._id === period._id ? "bg-primary text-white" : "bg-white hover:bg-slate-100"}`}
            >
              P{period.period_number} - {subjectNameOf(period) || "-"} - {period.class_id}
            </button>
          ))}
          {!periods.length && <p className="text-sm text-slate-500">No periods today.</p>}
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex flex-wrap gap-2 items-center justify-between">
            <div>
              <div className="font-semibold">{subjectNameOf(selected) || "Subject"} - Period {selected.period_number}</div>
              <div className="text-xs text-slate-500">{selected.class_id} - {today}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => markAll("Present")} className="px-3 py-1.5 border rounded-md text-xs">All Present</button>
              <button onClick={() => markAll("Absent")} className="px-3 py-1.5 border rounded-md text-xs">All Absent</button>
              <button onClick={save} className="px-4 py-1.5 bg-primary text-white rounded-md text-sm">Save Attendance</button>
            </div>
          </div>

          {loading ? <div className="p-6 text-center text-slate-500">Loading roster...</div> : !roster.length ? (
            <div className="p-6 text-center text-slate-500">No students to display. Check that students exist for class <b>{selected.class_id}</b>.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr><th className="p-3">Student ID</th><th className="p-3">Name</th><th className="p-3">Status</th><th className="p-3">Reason (if modified)</th></tr>
              </thead>
              <tbody>
                {roster.map((student) => (
                  <tr key={student.student_id} className="border-t">
                    <td className="p-3 font-mono">{student.student_code}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3"><select value={student.status} onChange={(event) => setStatus(student.student_id, event.target.value)} className="border rounded-md px-2 py-1">{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                    <td className="p-3"><input placeholder="Only if changing" value={student.reason || ""} onChange={(event) => setReason(student.student_id, event.target.value)} className="border rounded-md px-2 py-1 w-full" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
