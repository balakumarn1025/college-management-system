import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import Chatbot from "../components/common/Chatbot";

export default function DashboardLayout() {
  const location = useLocation();
  const title = location.pathname.split("/").pop() || "Dashboard";
  const pretty = title.charAt(0).toUpperCase() + title.slice(1);
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={pretty} />
        <main className="flex-1 p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
