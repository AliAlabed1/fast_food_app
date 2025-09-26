import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { createUser } from '@/lib/appwrite'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'


export interface SignUpForm{
  name:string;
  email:string;
  password:string;
}
const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form, setform] = useState<SignUpForm>({
    name:'',
    email:'',
    password:''
  })

  const submit =async ()=>{
    if(!form.name || !form.email || !form.password){
      Alert.alert("Error","Please enter valid email address & password & name.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createUser(form) 
      router.replace('/')
    } catch (error:any) {
      Alert.alert('Error',error.message)
    } finally{
      setIsSubmitting(false)
    }
    console.log(form)
  }
  return (
    <View className='gap-10 bg-white rounded-lg p-5 mt-5'>
      <CustomInput 
        label='Full Name'
        onChange={(text:string)=>setform({...form,name:text})}
        placeholder='Enter your full name'
        value={form.name}
      />
      <CustomInput 
        keyboardType='email-address'
        label='Email'
        onChange={(text:string)=>setform({...form,email:text})}
        placeholder='Enter your email'
        secureTextEntry={false}
        value={form.email}
        
      />
      <CustomInput 
        label='Password'
        onChange={(text:string)=>setform({...form,password:text})}
        placeholder='Enter your password'
        secureTextEntry={true}
        value={form.password}
        
      />
      <CustomButton 
        title='Sign up'
        onPress={submit}
        isLoading={isSubmitting}
      />
      <View className='flex justify-center flex-row mt-5 gap-2'>
        <Text className='base-regular text-gray-100'>
          Already have an account
        </Text>
        <Link href={'/sign-in'} className='base-bold text-primary '>
          Sign In
        </Link>
      </View>
    </View>
  )
}

export default SignUp