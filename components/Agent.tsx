'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.actions';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
    CONNECTING = 'CONNECTING',
}

interface SavedMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}



const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [interviewGenerated, setInterviewGenerated] = useState(false);

    useEffect(() => {
        const onCallStart = () => {
            console.log("Call started");
            setCallStatus(CallStatus.ACTIVE);
        };
        
        const onCallEnd = () => {
            console.log("Call ended");
            setCallStatus(CallStatus.FINISHED);
        };
        
        const onMessage = (message: any) => {
            console.log("Message received:", message);
            
            // Handle transcripts
            if(message.type === 'transcript' && message.transcriptType === 'final'){
                const newMessage = {
                    role: message.role, 
                    content: message.transcript
                };
                setMessages((prev) => [...prev, newMessage]);
            }

            // Handle tool calls (when interview is being generated)
            if(message.type === 'tool-calls') {
                console.log("Interview questions being generated:", message.toolCallList);
                // You can show a loading state here if needed
            }

            // Handle function call completion (interview generated)
            if(message.type === 'function-call' && message.functionCall?.name === 'generate_interview_questions') {
                console.log("Interview questions generated successfully!");
                setInterviewGenerated(true);
                setTimeout(() => {
                    router.push('/interviews'); // Redirect to interviews page
                }, 3000);
            }
        };

        const onSpeechStart = () => {
            console.log("Speech started");
            setIsSpeaking(true);
        };
        
        const onSpeechEnd = () => {
            console.log("Speech ended");
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.error('Vapi Error:', error);
            setCallStatus(CallStatus.INACTIVE);
        };

        // Add event listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('error', onError);

        // Cleanup function
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('error', onError);
        }
    }, [router]);

    const hanleGenerateFeedback = async (messages: SavedMessage[]) =>{
        console.log('Generate feedback here');

        const {success, feedbackId:id} = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages
        })

        if(success && id){
            router.push(`/interview/${interviewId}/feedback`)
        } else {
            console.log('Error saving feedback');
            router.push('/');
            
        }
        
    }

    useEffect(() => {

    if(callStatus === CallStatus.FINISHED){

        if(type === 'generate'){
            setTimeout(() => {
                if (!interviewGenerated) {
                    router.push('/');
                }
            }, 2000);
        }

        if(type === 'interview'){
            hanleGenerateFeedback(messages);
        }

    }

}, [callStatus, callStatus, type, userId]);

    const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if(type === 'generate'){
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else{
        let formattedQuestions = "";

        if(questions){
            formattedQuestions = questions
                                        .map((question)=> `- ${question}`)
                                        .join('\n');
        }
        await vapi.start(interviewer, {
            variableValues:{
                questions: formattedQuestions,
            }
        })
    }
  };

    const handleDisconnect = async () => {
        try {
            await vapi.stop();
            setCallStatus(CallStatus.FINISHED);
        } catch (error) {
            console.error("Failed to stop call:", error);
            setCallStatus(CallStatus.FINISHED);
        }
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className='call-view'>
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interview Coach</h3>
                    {interviewGenerated && (
                        <p className="text-green-600 text-sm mt-2">✅ Interview Generated!</p>
                    )}
                </div>
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user" width={540} height={540} className="object-cover rounded-full size-30" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className='transcript'>
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className='w-full flex justify-center'>
                {callStatus !== 'ACTIVE' ? (
                    <button 
                        className='relative btn-call'
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                    >
                        {callStatus === CallStatus.CONNECTING ? 'Connecting...' : 'Start Call'}
                    </button>
                ) : (
                    <button 
                        className='relative btn-disconnect'
                        onClick={handleDisconnect}
                    >
                        End Call
                    </button>
                )}
            </div>

            {callStatus === CallStatus.CONNECTING && (
                <div className="text-center mt-4">
                    <p className="text-blue-600">Connecting to AI Interview Coach...</p>
                </div>
            )}
            
            {callStatus === CallStatus.ACTIVE && (
                <div className="text-center mt-4">
                    <p className="text-green-600">🎤 Interview progressing...</p>
                </div>
            )}
        </>
    );
};

export default Agent;
