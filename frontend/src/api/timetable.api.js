import api from "./axios";
export const listTimetable = (params) => api.get("/timetable", { params }).then(r => r.data);
export const byClass = (classId, params) => api.get(`/timetable/class/${classId}`, { params }).then(r => r.data);
export const byTeacher = (tid, params) => api.get(`/timetable/teacher/${tid}`, { params }).then(r => r.data);
export const createTimetable = (data) => api.post("/timetable", data).then(r => r.data);
export const updateTimetable = (id, data) => api.put(`/timetable/${id}`, data).then(r => r.data);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`).then(r => r.data);