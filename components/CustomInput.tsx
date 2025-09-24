import cn from 'clsx';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
interface CustomInputProps{
    placeholder?:string;
    value:string;
    onChange:(input:string)=>void;
    label:string;
    secureTextEntry?:boolean;
    keyboardType?:"default" | "email-address" | "numeric" | "phone-pad"
}
const CustomInput = ({placeholder="Input Text",value,onChange,label,secureTextEntry=false,keyboardType="default"}:CustomInputProps) => {
  const [isFocused,setIsFocused] = useState<boolean>(false)
  return (
    <View className='w-full'>
      <Text className='label'>{label}</Text>
      <TextInput 
        autoCapitalize='none'
        autoCorrect = {false}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={()=>setIsFocused(true)}
        onBlur={()=>setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={"#888"}
        className={cn('input',isFocused ? 'border-primary':'border-gray-300')}
      />
    </View>
  )
}

export default CustomInput