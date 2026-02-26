"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import FormField from "./FormField"
import { useRouter } from "next/navigation"



const authFormSchema = (type: FormType) =>{
  return z.object({
    name: type === 'sign-up'? z.string().min(3): z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  })
}

const AuthForm = ({ type }: { type: FormType }) => {
  const formSchema = authFormSchema(type)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password:"",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if(type === 'sign-up'){
        console.log('SIGN-UP', values);
        toast.success('Account created successfully!')  
        router.push('/sign-in')
      }
      else{
        console.log('SIGN-IN', values);
        toast.success('Signed in successfully!')
        router.push('/')        
      }
    } catch (error) {
      console.log(error);
      toast.error(`There is an error: ${error}`)
    }
  }

  const isSignIn = type === "sign-in"

  return (
    <div className="w-full sm:max-w-md  lg:min-w-[566px] flex flex-col gap-6 card py-14 px-10">
      <CardHeader className="flex flex-col gap-6  py-1 px-10">
        <div className="flex justify-center">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" height={32} width={38} />
            <h2 className="text-primary-100 ">PrepWise</h2>
          </div>
          </div>
        
        <CardDescription className="text-center text-bold text-lg">
          Prepare job interview with AI.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form className="w-full space-y-6 mt-4 form" id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          {!isSignIn && (
            <FormField 
              control={form.control} 
              name="name" 
              label="Name" 
              placeholder="Enter your name"/>
          )}
          <FormField 
              control={form.control} 
              name="email" 
              label="Email" 
              placeholder="Enter your email"/>
          
          <FormField 
              control={form.control} 
              name="password" 
              label="Password" 
              placeholder="Enter your password"
              type="password"/>
          
          
          <Button className="btn w-full space-y-6 mt-4" type="submit" form="form-rhf-demo">
            {isSignIn? 'Sign In' : "Create an Account"}
          </Button>
         </form>
        </Form>
      
        <p className="text-center">
            {isSignIn ? "No Account yet?" : "Have an account already?"}
            <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1" >
              {!isSignIn ? 'Sign In' : 'Sign Up'}
            </Link>
        </p>
    </div>
      
    
  )
}

export default AuthForm