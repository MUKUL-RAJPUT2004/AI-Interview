import React from 'react'
import { Controller, FieldValues , Path, Control} from 'react-hook-form'
import { Input } from "@/components/ui/input"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './ui/form'

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'file';
}


const FormField = <T extends FieldValues>({control, name, label, placeholder, type="text"}: FormFieldProps<T>) => (
    
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="label">{label}</FormLabel>
                    <FormControl>
                        <Input
                            className='input'
                            placeholder={placeholder} 
                            {...field} />
                    </FormControl>
                    
                    <FormMessage />

                </FormItem>
              )}
            />
           
          
)

export default FormField