import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, message: "API working" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("VAPI TOOL PAYLOAD:", body);

    const { type, role, level, techstack, amount, userid } = body;

    if (!role || !type || !level || !techstack || !amount || !userid) {
      return Response.json({ success: false, message: "Missing parameters" });
    }

    let questions;

    try {
      const { text } = await generateText({
        model: google("gemini-3.1-flash-lite-preview"),
        prompt: `
Generate ${amount} interview questions.

Role: ${role}
Experience Level: ${level}
Tech Stack: ${techstack}
Interview Type: ${type}

Return ONLY a JSON array.

Example:
["Question 1","Question 2","Question 3"]
`
      });

      questions = JSON.parse(text);

    } catch (err) {
      console.log("Gemini error (quota or parsing):", err);

      // fallback questions (MVP safety)
      questions = [
        "Tell me about yourself.",
        "What experience do you have with this tech stack?",
        "Describe a challenging project you worked on.",
        "How do you debug complex issues?",
        "Explain a concept related to this role.",
        "How do you handle tight deadlines?",
        "Where do you see your career in five years?"
      ];
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    await db.collection("interviews").add(interview);

    console.log("Interview saved");

    return Response.json({ success: true });

  } catch (error) {
    console.log("Server error:", error);

    return Response.json({
      success: false,
      message: "Server error"
    });
  }
}