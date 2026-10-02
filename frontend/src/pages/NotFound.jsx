import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-amber-100 rounded-full">
            <AlertTriangle size={40} className="text-amber-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">404</h1>
        <p className="text-slate-500 mt-2">Page not found</p>
        <p className="text-sm text-slate-400 mt-1">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}