import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import { useAuth } from "./context/useAuth";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import Departments from "./pages/admin/Departments";
import Courses from "./pages/admin/Courses";
import Subjects from "./pages/admin/Subjects";
import Timetable from "./pages/admin/Timetable";
import AdminAttendance from "./pages/admin/Attendance";
import AttendanceHistory from "./pages/admin/AttendanceHistory";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import MarkAttendance from "./pages/teacher/MarkAttendance";
import MyTimetable from "./pages/teacher/MyTimetable";
import TeacherStudents from "./pages/teacher/Students";
import TeacherHistory from "./pages/teacher/History";
import SendNotification from "./pages/teacher/SendNotification"; 

// Student
import StudentDashboard from "./pages/student/Dashboard";
import MyAttendance from "./pages/student/MyAttendance";
import StudentTimetable from "./pages/student/Timetable";
import Notifications from "./pages/student/Notifications";

import NotFound from "./pages/NotFound";


//fees
import FeeStructure from "./pages/admin/FeeStructure";
import FeePayments from "./pages/admin/FeePayments";
import MyFees from "./pages/student/MyFees";

//notes
import AdminNotes from "./pages/admin/Notes";
import TeacherNotes from "./pages/teacher/Notes";
import StudentNotes from "./pages/student/Notes";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  return <Navigate to={user ? `/${user.role}` : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="departments" element={<Departments />} />
          <Route path="courses" element={<Courses />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="fees/structure" element={<FeeStructure />} />
          <Route path="fees/payments" element={<FeePayments />} />
          <Route path="notes" element={<AdminNotes />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["teacher"]} />}>
        <Route path="/teacher" element={<DashboardLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="mark" element={<MarkAttendance />} />
          <Route path="timetable" element={<MyTimetable />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="history" element={<TeacherHistory />} />
          <Route path="notify" element={<SendNotification />} />
          <Route path="notes" element={<TeacherNotes />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route path="/student" element={<DashboardLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="fees" element={<MyFees />} />
          <Route path="notes" element={<StudentNotes />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}