import { getInterviewById } from '@/lib/general.actions';
import { getRandomInterviewCover } from '@/lib/utils';
import { redirect } from 'next/navigation';
import React from 'react'
import Image from 'next/image';
import DIsplayTechIcons from '@/components/DIsplayTechIcons';
import Agent from '@/components/Agent';
import { getCurrentUser } from '@/lib/actions/auth.action';


const page =async ({params}: RouteParams) => {
  const {id} = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if(!interview)    redirect('/')
  if(!user)    redirect('/sign-in')
  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className='flex flex-row gap-4 items-center'>
            <Image src={getRandomInterviewCover()} alt="cover-img" width={40} height={40} className="rounded-b-full object-cover size-10" />
            <h3 className='capitalize'>{interview.role} Interview</h3>
            

          </div>
          <DIsplayTechIcons techStack={interview.techstack} />

        </div>
        <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>{interview.type}</p>

      </div>
      <Agent
            userName={user.name}
            userId={user.id}
            interviewId={id}
            type="interview"
            questions={interview.questions}
            />
    </>
  )
}

export default page