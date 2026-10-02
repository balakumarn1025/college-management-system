import api from "./axios";

// Structures
export const listStructures = (params) =>
  api.get("/fees/structures", { params }).then((r) => r.data);
export const createStructure = (data) =>
  api.post("/fees/structures", data).then((r) => r.data);
export const updateStructure = (id, data) =>
  api.put(`/fees/structures/${id}`, data).then((r) => r.data);
export const deleteStructure = (id) =>
  api.delete(`/fees/structures/${id}`).then((r) => r.data);
export const assignStructure = (id, data) =>
  api.post(`/fees/structures/${id}/assign`, data).then((r) => r.data);

// Student fees
export const listStudentFees = (params) =>
  api.get("/fees/student-fees", { params }).then((r) => r.data);
export const getMyFees = () => api.get("/fees/my-fees").then((r) => r.data);

// Payments
export const recordPayment = (data) =>
  api.post("/fees/payments", data).then((r) => r.data);
export const listPayments = (params) =>
  api.get("/fees/payments", { params }).then((r) => r.data);
export const getMyPayments = () =>
  api.get("/fees/payments/my").then((r) => r.data);
export const getPayment = (id) =>
  api.get(`/fees/payments/${id}`).then((r) => r.data);

// Reports
export const getSummary = (params) =>
  api.get("/fees/reports/summary", { params }).then((r) => r.data);