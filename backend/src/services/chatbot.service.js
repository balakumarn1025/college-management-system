import ChatbotMessage from "../models/ChatbotMessage.js";
import { studentPercentage, percentageBySubject } from "./attendance.service.js";
import Attendance from "../models/Attendance.js";

export async function handleMessage(message, user) {
  const m = message.toLowerCase();
  let reply = "I'm a mock chatbot.";

  if (user.role === "student") {
    if (m.includes("attendance") && (m.includes("percentage") || m.includes("my"))) {
      const p = await studentPercentage(user.ref_id);
      reply = `Your overall attendance is ${p.percentage}% (${p.attended} out of ${p.total} periods).`;
    } else if (m.includes("below") || m.includes("low")) {
      const rows = await percentageBySubject(user.ref_id);
      const low = rows.filter(r => r.percentage < 75);
      reply = low.length
        ? "Subjects below 75%: " + low.map(r => `${r.subject_name} (${r.percentage}%)`).join(", ")
        : "Great! No subjects below 75%.";
    }
  } else if (user.role === "admin" && m.includes("absent") && m.includes("today")) {
    const today = new Date().toISOString().slice(0, 10);
    const count = await Attendance.countDocuments({ date: today, status: "Absent" });
    reply = `There are ${count} absent records today.`;
  }

  await ChatbotMessage.create({ user_id: user.sub, role: "user", message });
  await ChatbotMessage.create({ user_id: user.sub, role: "assistant", message: reply });

  return { reply };
}

export async function getHistory(userId) {
  const msgs = await ChatbotMessage.find({ user_id: userId }).sort({ createdAt: 1 }).limit(100);
  return msgs.map(d => ({ role: d.role, message: d.message, created_at: d.createdAt }));
}