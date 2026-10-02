import { useEffect, useState } from "react";
import { listNotifications, markRead, markAllRead } from "../../api/misc.api";

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const load = () => listNotifications().then(setRows);
  useEffect(() => { load(); }, []);

  const read = async (id) => { await markRead(id); load(); };
  const readAll = async () => { await markAllRead(); load(); };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={readAll} className="text-sm border px-3 py-1.5 rounded-md">Mark all read</button>
      </div>
      {rows.length === 0 && <div className="bg-white p-6 rounded-xl border text-sm text-slate-500">No notifications.</div>}
      {rows.map(n => (
        <div key={n._id} className={`bg-white p-4 rounded-xl border shadow-sm ${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
          <div className="flex justify-between">
            <div className="font-medium">{n.title}</div>
            {!n.is_read && <button onClick={() => read(n._id)} className="text-xs text-primary">Mark read</button>}
          </div>
          <div className="text-sm text-slate-600 mt-1">{n.message}</div>
        </div>
      ))}
    </div>
  );
}
