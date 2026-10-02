// backend/src/chatbot/providers/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';
// Important: Import your existing attendance service
import { studentPercentage, percentageBySubject } from '../../services/attendance.service.js'; 

export class GeminiProvider {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        // Give the AI a clear role
        systemInstruction: 'You are a helpful college assistant for students. You can answer questions about attendance, timetable, and more. Always be concise and helpful. If a student is below 75% attendance, warn them clearly.',
    });
  }

  // This is the loop that lets the AI "think" by using tools
  async reply(message, user) {
    const chat = this.model.startChat({
      // Tell the AI what functions it can call
      tools: [
        {
          functionDeclarations: [
            {
              name: 'get_attendance_percentage',
              description: 'Get the overall attendance percentage for the current student',
            },
            {
              name: 'get_subject_wise_attendance',
              description: 'Get attendance broken down by subject for the current student, including a list of subjects below 75%',
            },
          ],
        },
      ],
    });

    let result = await chat.sendMessage(message);
    let response = result.response;
    let iterations = 0;

    // This loop keeps going as long as the AI requests more tool calls
    while (iterations < 5) {
      iterations++;
      const calls = response.functionCalls();

      if (!calls || calls.length === 0) {
        break; // The AI has the info it needs, so we can stop
      }

      const toolResults = [];
      for (const call of calls) {
        let toolOutput;
        // Execute the correct function based on the AI's request
        if (call.name === 'get_attendance_percentage') {
          toolOutput = await studentPercentage(user.ref_id);
        } else if (call.name === 'get_subject_wise_attendance') {
          toolOutput = await percentageBySubject(user.ref_id);
        }

        toolResults.push({
          functionResponse: { 
            name: call.name, 
            response: toolOutput 
          },
        });
      }
      
      // Send the real data back to the AI so it can form an answer
      result = await chat.sendMessage(toolResults);
      response = result.response;
    }

    return response.text();
  }
}