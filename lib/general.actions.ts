import { db, auth } from "@/firebase/admin";



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
    
    const interviews = await db
                            .collection("interviews")
                            .where("finalized", "==", true)
                            .where("userId", "!=", userId)
                            .orderBy("userId")            // required for !=
                            .orderBy("createdAt", "desc")
                            .limit(limit)
                            .get();
    
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
