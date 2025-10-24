import { router } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'
import { useCartStore } from '../store/cart.store'
import { MenuItem } from '../types'

const MenuCard = ({item:{$id,image_url,name,price}}:{item:MenuItem}) => {

  const imageUrl = `${image_url}`
  const {addItem:addCartItem} = useCartStore()
  
  const handleCardPress = () => {
    router.push(`/item-details?id=${$id}`)
  }

  const handleAddToCart = (e: any) => {
    e.stopPropagation() // Prevent navigation when clicking Add to Cart
    addCartItem({id:$id,image_url,name,price,quantity:1,customizations:[]})
  }

  return (
    <TouchableOpacity className='menu-card' onPress={handleCardPress}>
      <Image source={{uri:imageUrl}} className='size-32 absolute -top-10 ' resizeMode='contain' />
      <Text className='base-bold text-center mb-2 text-dark-100' numberOfLines={1}>{name}</Text>
      <Text className='base-semibold text-center mb-2 text-gray-200'>{price}</Text> 
      <TouchableOpacity onPress={handleAddToCart}>
        <Text className='paragraph-semibold text-primary'>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity> 
  )
}

export default MenuCard