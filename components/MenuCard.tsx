import React from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'

const MenuCard = ({item:{image_url,name,price}}:{item:any}) => {

  const imageUrl = `${image_url}`
  console.log(imageUrl)
  return (
    <TouchableOpacity className='menu-card'>
      <Image source={{uri:imageUrl}} className='size-32 absolute -top-10 ' resizeMode='contain' />
      <Text className='base-bold text-center mb-2 text-dark-100' numberOfLines={1}>{name}</Text>
      <Text className='base-semibold text-center mb-2 text-gray-200'>{price}</Text> 
      <TouchableOpacity onPress={()=>{}}>
        <Text className='paragraph-semibold text-primary'>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default MenuCard