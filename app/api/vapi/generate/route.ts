import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  if (!role || !type || !level || !techstack || !amount || !userid) {
    return Response.json(
      { success: false, message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    const questionAmount = Number(amount);

    const { text } = await generateText({
      model: google("gemini-3-flash-preview"),
      maxOutputTokens: 200,
      prompt: `
            Prepare questions for a job interview.

            Role: ${role}
            Experience Level: ${level}
            Tech Stack: ${techstack}
            Interview Type: ${type}
            Number of Questions: ${questionAmount}

            Return ONLY valid JSON.
            Do not include explanations.
            The questions are going to be read by a voice assistant so do not use "/" or "*" or any other characters which might break the voice assistant.
            
            Example format:
            ["Question 1","Question 2","Question 3"]`
    });

    let parsedQuestions;

    try {
      parsedQuestions = JSON.parse(text);
    } catch {
      parsedQuestions = text.replace(/```json|```/g, "").trim();
      parsedQuestions = JSON.parse(parsedQuestions);
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.log("AI generation error:", error);

    return Response.json(
      { success: false, message: "Failed to generate interview" },
      { status: 500 }
    );
  }
}