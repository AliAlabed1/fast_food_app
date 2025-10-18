import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import CustomButton from '../../components/CustomButton'
import CustomInput from '../../components/CustomInput'
import { signIn } from '../../lib/appwrite'


export interface SignInForm{
  email:string;
  password:string;
}
const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form, setform] = useState<SignInForm>({
    email:'',
    password:''
  })

  const submit =async ()=>{
    if(!form.email || !form.password){
      Alert.alert("Error","Please enter valid email address & password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(form)
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
        title='Sign in'
        onPress={submit}
        isLoading={isSubmitting}
      />
      <View className='flex justify-center flex-row mt-5 gap-2'>
        <Text className='base-regular text-gray-100'>
          Don't have an account
        </Text>
        <Link href={'/sign-up'} className='base-bold text-primary '>
          Sign Up
        </Link>
      </View>
    </View>
  )
}

export default SignIn