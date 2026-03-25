'use server'

import { feedbackSchema } from "@/constants";
import { db, auth } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";  // Updated import





export async function getInterviewByUserId(userId: string): Promise<Interview[] | null>{
    if(!userId) return null;
    const interviews= await db
                                .collection("interviews")
                                .where("userId", "==", userId)
                                .orderBy("createdAt", "desc")
                                .get();
    
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null>{
    if(!params) return null;
    const { userId, limit} = params;
    
    if (!limit || limit <= 0) {
        return null;
    }
    
    if (!userId) {
    return []
  }

    const interviews = await db
        .collection("interviews")
        .where("finalized", "==", true)
        .where("userId", "!=", userId)
        .orderBy("userId")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get()
    
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null>{
    if(!id) return null;
    const interview= await db
                                .collection("interviews")
                                .doc(id)
                                .get();
    
    return interview.data() as Interview | null;
}


export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;
    
    try {
        const formattedTranscript = transcript
                                        .map((sentence: {role: string; content: string;})=>(
                                            `-${sentence.role}: ${sentence.content}\n`
                                        )).join('');
        const result = await generateText({ 
            model: google('gemini-2.5-flash'),
            output: Output.object({  
                schema: feedbackSchema,
            }),
            prompt: `
                    You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
                    Transcript:
                    ${formattedTranscript}

                    Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
                    - **Communication Skills**: Clarity, articulation, structured responses.
                    - **Technical Knowledge**: Understanding of key concepts for the role.
                    - **Problem-Solving**: Ability to analyze problems and propose solutions.
                    - **Cultural & Role Fit**: Alignment with company values and job role.
                    - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
                    `,
            system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",            
            });

            const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = result.output;  // Updated destructuring

            const feedback = await db.collection('feedback').add({
                interviewId: interviewId,
                userId: userId,
                totalScore: totalScore,
                categoryScores: categoryScores,
                strengths: strengths,
                areasForImprovement: areasForImprovement,
                finalAssessment: finalAssessment,
                createdAt: new Date().toISOString()
            })
            
            return {
                success: true,
                feedbackId: feedback.id
            }

    } catch (e) {
        console.error('Error saving feedback', e)
        return {success: false}
        
    }
}