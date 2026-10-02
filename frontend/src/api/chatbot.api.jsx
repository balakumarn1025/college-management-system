import api from "./axios";

export const sendMessage = (message) =>
  api.post("/chatbot/message", { message }).then((r) => r.data);

export const getChatHistory = () =>
  api.get("/chatbot/history").then((r) => r.data);