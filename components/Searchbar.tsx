import { images } from '@/constants'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Image, TextInput, TouchableOpacity, View } from 'react-native'

const Searchbar = () => { 
  const params = useLocalSearchParams<{query?:string}>()
  const [query,setQuery] = useState<string>(params.query as string || '')
  return (
    <View className='searchbar'>
      <TextInput
        className='flex-1 p-5 '
        placeholder='Search for pizzas, burgers, wraps, etc.'
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={()=>{
          router.setParams({query})
        }}
        placeholderTextColor={"#888"}
        returnKeyType='search'
        returnKeyLabel='search'
        
      />
      <TouchableOpacity 
        className='pr-5' 
        onPress={()=>{
          router.setParams({query})
        }}
      >
        <Image source={images.search} className='size-6'  resizeMode='contain' tintColor={"#5D5F6D"}/>
      </TouchableOpacity>
    </View>
  )
}

export default Searchbar