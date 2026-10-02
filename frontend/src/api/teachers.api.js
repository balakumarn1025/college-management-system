import api from "./axios";
export const listTeachers = (params) => api.get("/teachers", { params }).then(r => r.data);
export const getTeacher = (id) => api.get(`/teachers/${id}`).then(r => r.data);
export const createTeacher = (data) => api.post("/teachers", data).then(r => r.data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data).then(r => r.data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`).then(r => r.data);