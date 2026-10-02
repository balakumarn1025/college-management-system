// backend/src/services/chatbot.service.js

import ChatbotMessage from '../models/ChatbotMessage.js';
import { MockProvider } from '../chatbot/providers/mock.js';
import { GeminiProvider } from '../chatbot/providers/gemini.js'; // Import the new provider

export async function handleMessage(message, user) {
  let reply;

  // Use the real AI for students if the API key is available
  if (user.role === 'student' && process.env.GEMINI_API_KEY) {
    try {
      const provider = new GeminiProvider(process.env.GEMINI_API_KEY);
      reply = await provider.reply(message, user);
    } catch (err) {
      console.error('Gemini error:', err.message);
      reply = "Sorry, I'm having trouble right now. Please try again.";
    }
  } else {
    // Fall back to mock for teachers/admins or if the API key is missing
    const mock = new MockProvider();
    reply = mock.reply(message, user);
  }
  
  // Your existing code to save the chat history
  await ChatbotMessage.create({ user_id: user.sub, role: 'user', message });
  await ChatbotMessage.create({ user_id: user.sub, role: 'assistant', message: reply });
  
  return { reply };
}