import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { connectDB } from "./src/config/db.js";
import { errorHandler } from "./src/middleware/error.js";
import noteRoutes from "./src/routes/note.routes.js";

import authRoutes from "./src/routes/auth.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import teacherRoutes from "./src/routes/teacher.routes.js";
import departmentRoutes from "./src/routes/department.routes.js";
import courseRoutes from "./src/routes/course.routes.js";
import subjectRoutes from "./src/routes/subject.routes.js";
import classroomRoutes from "./src/routes/classroom.routes.js";
import timetableRoutes from "./src/routes/timetable.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import chatbotRoutes from "./src/routes/chatbot.routes.js";
import feeRoutes from "./src/routes/fee.routes.js";
dotenv.config({ path: fileURLToPath(new URL("./src/.env", import.meta.url)) });

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigin = process.env.CORS_ORIGIN;
      const isLocalDevelopment = !origin || /^http:\/\/localhost:\d+$/.test(origin);
      const isConfiguredOrigin = configuredOrigin && origin === configuredOrigin;

      if (isLocalDevelopment || isConfiguredOrigin) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/fees", feeRoutes);

app.get("/", (req, res) =>
  res.json({ message: "College Management System API", status: "running" })
);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notes", noteRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[OK] Server running on http://localhost:${PORT}`);
  });
})();