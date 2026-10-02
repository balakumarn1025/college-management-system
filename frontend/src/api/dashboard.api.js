import api from "./axios";
export const adminDashboard = () => api.get("/dashboard/admin").then(r => r.data);
export const teacherDashboard = () => api.get("/dashboard/teacher").then(r => r.data);
export const studentDashboard = () => api.get("/dashboard/student").then(r => r.data);
