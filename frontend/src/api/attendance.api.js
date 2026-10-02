import api from "./axios";
export const getRoster = (classId, date, period, subjectId) =>
  api.get(`/attendance/class/${classId}`, { params: { date, period_number: period, subject_id: subjectId } }).then(r => r.data);
export const saveAttendance = (data) => api.post("/attendance", data).then(r => r.data);
export const modifyAttendance = (id, data) => api.put(`/attendance/${id}`, data).then(r => r.data);
export const listAttendance = (params) => api.get("/attendance", { params }).then(r => r.data);
export const studentAttendance = (sid) => api.get(`/attendance/student/${sid}`).then(r => r.data);
export const studentPercentage = (sid) => api.get(`/attendance/percentage/${sid}`).then(r => r.data);
export const studentPercentageBySubject = (sid) => api.get(`/attendance/percentage-by-subject/${sid}`).then(r => r.data);
export const attendanceHistory = (params) => api.get("/attendance/history", { params }).then(r => r.data);
export const studentHistory = (sid) => api.get(`/attendance/history/student/${sid}`).then(r => r.data);
