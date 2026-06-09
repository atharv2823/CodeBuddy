import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Initialize Gemini Client if apiKey is provided
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI Service will run in mock/simulated mode.");
}

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "ai-service", hasApiKey: !!apiKey });
});

app.post("/ai/chat", async (req: Request, res: Response) => {
  const { message, code, language, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Construct context-rich prompt
  const systemPrompt = `You are CodeBuddy, a brilliant real-time collaborative coding assistant.
The user is currently writing code in the editor.
Current Language: ${language || "unknown"}
Current Code in Editor:
\`\`\`${language || ""}
${code || ""}
\`\`\`

Give concise, premium quality coding help, advice, and logic fixes.
If you suggest changes or new code, ALWAYS wrap the code snippets in standard markdown code blocks, specifying the language.
Example:
\`\`\`javascript
// Your code here
\`\`\`
Provide a brief explanation of the logic. Do not repeat the entire unchanged code file if only small adjustments are needed.`;

  try {
    if (ai) {
      // Structure contents with history + prompt
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text || "" }]
          });
        }
      }
      
      const userMessageText = `Context: ${systemPrompt}\n\nUser Question: ${message}`;
      contents.push({
        role: "user",
        parts: [{ text: userMessageText }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      const reply = response.text || "Sorry, I couldn't generate a response.";
      return res.json({ response: reply });
    } else {
      // Mock mode fallback response
      console.log("Mock Mode response generated for:", message);
      
      // Provide a responsive mock reply based on the message content
      let suggestedCode = `// CodeBuddy Mock Assistant
function helloCodeBuddy() {
  console.log("Welcome to CodeBuddy collaborative environment!");
}`;
      
      if (message.toLowerCase().includes("sorting") || message.toLowerCase().includes("sort")) {
        suggestedCode = `// Example Bubble Sort in JavaScript
function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;
      } else if (message.toLowerCase().includes("reverse") || message.toLowerCase().includes("string")) {
        suggestedCode = `// Reverse a string logic
function reverseString(str) {
  return str.split("").reverse().join("");
}`;
      }

      let mockReply = `### CodeBuddy AI Assistant (Mock Mode)

It looks like the \`GEMINI_API_KEY\` environment variable is not configured on the AI service. To enable real AI responses, set \`GEMINI_API_KEY\` in your environment variables.

Here is a simulated assistant response for your prompt: **"${message}"**

\`\`\`javascript
${suggestedCode}
\`\`\`

You can click **Apply Code** on the block above to load it directly into your active workspace editor!`;
      
      return res.json({ response: mockReply });
    }
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
