import api from "./axios";

export const listNotes = (params) =>
  api.get("/notes", { params }).then((response) => response.data);

export const getMyClassNotes = () =>
  api.get("/notes/my-class").then((response) => response.data);

export const uploadNote = (formData) =>
  api.post("/notes", formData).then((response) => response.data);

export const deleteNote = (id) =>
  api.delete(`/notes/${id}`).then((response) => response.data);

export const trackDownload = (id) =>
  api.post(`/notes/${id}/download`).then((response) => response.data);
