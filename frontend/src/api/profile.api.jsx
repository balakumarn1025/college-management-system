import api from "./axios";

export const getProfile = () =>
  api.get("/profile").then((r) => r.data);

export const updateProfile = (data) =>
  api.put("/profile", data).then((r) => r.data);

export const uploadProfileImage = (formData) =>
  api
    .post("/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const changePassword = (data) =>
  api.post("/profile/change-password", data).then((r) => r.data);