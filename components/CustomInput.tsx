import cn from 'clsx';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
interface CustomInputProps{
    placeholder?:string;
    value:string;
    onChange:(input:string)=>void;
    label:string;
    secureTextEntry?:boolean;
    keyboardType?:"default" | "email-address" | "numeric" | "phone-pad";
    editable?:boolean;
}
const CustomInput = ({placeholder="Input Text",value,onChange,label,secureTextEntry=false,keyboardType="default",editable=true}:CustomInputProps) => {
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
        editable={editable}
        onFocus={()=>setIsFocused(true)}
        onBlur={()=>setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={"#888"}
        className={cn('input',isFocused ? 'border-primary':'border-gray-300', !editable && 'opacity-60')}
      />
    </View>
  )
}

export default CustomInput