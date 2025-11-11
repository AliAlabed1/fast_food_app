import CustomHeader from '@/components/CustomHeader';
import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomizationCard from '../components/CustomizationCard';
import Rating from '../components/Rating';
import { getCategory, getMenuCustomizations, getMenuItem } from '../lib/appwrite';
import useAppWrite from '../lib/useAppWrite';
import { useCartStore } from '../store/cart.store';
interface Customization {
  $id: string;
  name: string;
  price: number;
  type: string;
}

const ItemDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedCustomizations, setSelectedCustomizations] = useState<Customization[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [category,setCategory] = useState<string | null>(null);
  const { addItem } = useCartStore();

  // Fetch menu item data from dummy data for now
  const { data: menuItem, loading: itemLoading } = useAppWrite({
    fn: () => getMenuItem(id),
    params: { menuId: id }
  });

  // Fetch customizations
  const { data: customizations, loading: customizationsLoading } = useAppWrite({
    fn: () => getMenuCustomizations(id),
    params: { menuId: id }
  });

  useEffect(()=>{
    if(menuItem){
      (async()=>{
        const category = await getCategory(menuItem.categories);
        if(category){
          setCategory(category.name);
        }
      })()
    }
  },[menuItem]);
  

  
  const toppings = React.useMemo(() => {
    if (!customizations) return [];
    return customizations.filter((customization:any)=>customization.type === 'topping');
  }, [customizations]);
  const sides = React.useMemo(() => {
    if (!customizations) return [];
    return customizations.filter((customization:any)=>customization.type === 'side');
  }, [customizations]);

  const handleCustomizationToggle = (customization: Customization) => {
    setSelectedCustomizations(prev => {
      const isSelected = prev.some(c => c.$id === customization.$id);
      if (isSelected) {
        return prev.filter(c => c.$id !== customization.$id);
      } else {
        return [...prev, customization];
      }
    });
  };

 
  useEffect(() => {
    console.log(customizations,'customizations')
    console.log(toppings,'toppings')
    console.log(sides,'sides')
    console.log(menuItem,'menuItem')
  }, [toppings,sides,customizations,menuItem])
  const handleAddToCart = () => {
    if (!menuItem) return;

    const cartCustomizations = selectedCustomizations.map(c => ({
      id: c.$id,
      name: c.name,
      price: c.price,
      type: c.type
    }));

    addItem({
      id: menuItem.$id,
      image_url: menuItem.image_url,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      customizations: cartCustomizations
    });
    console.log('added to cart',{
      id: menuItem.$id,
      image_url: menuItem.image_url,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      customizations: cartCustomizations
    })
    // Navigate back or show success message
    router.back();
  };


  const calculateTotalPrice = () => {
    if (!menuItem) return 0;
    const basePrice = menuItem.price;
    const customizationsPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
    return (basePrice + customizationsPrice) * quantity;
  };

  if (itemLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg">Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      {/* Header */}
      <CustomHeader title={menuItem.name} />

      <ScrollView>
        <View className='flex flex-row gap-5 items-center justify-between'>
          <View className='flex flex-col gap-3 items-start justify-center'>
            <Text className="text-2xl font-bold text-dark-100">{menuItem.name}</Text>
            <Text className="paragraph-regular text-gray-100">{category}</Text>
            <View className="mb-4">
              <Rating rating={menuItem.rating} size={16} showRating={true} />
            </View>
            <Text className="text-lg font-semibold mb-2"><Text className="text-primary mr-2">$</Text>{menuItem.price}</Text>
            <View className="flex flex-row gap-2 items-center justify-center">
              <View className="flex flex-col gap-2 items-starts justify-center">
                <Text className="text-xs text-gray-200">Calories</Text>
                <Text className="text-sm font-semibold">{menuItem.calories}</Text>
              </View>
              <View className="flex flex-col gap-2 items-start justify-center">
                <Text className="text-xs text-gray-200">Protein</Text>
                <Text className="text-sm font-semibold">{menuItem.protein}g</Text>
              </View>
            </View>
          </View>
          <View className="items-center py-6">
            <Image 
              source={{ uri: menuItem.image_url }} 
              className="w-[200px] h-[200px] rounded-lg mr-5"
              resizeMode="cover"
            />
          </View>
        </View>
        <View className='flex bg-primary/10 rounded-xl p-2  mt-3 flex-row gap-5 items-center justify-center'>
          <View className='flex flex-row gap-2 items-center justify-center'>
            <Text className='text-primary font-bold'><Feather name="dollar-sign" size={24}  /></Text>            
            <Text className="text-sm font-semibold">{menuItem.deliveryFee}</Text>
          </View>
          <View className='flex flex-row gap-2 items-center justify-center'>
            <Text className='text-primary font-bold'><Feather name="clock" size={24}  /></Text>
            <Text className="text-sm font-semibold">{menuItem.preparingTime} mins</Text>
          </View>
          
        </View>
        <View className='flex w-full mt-3'>
          <Text className="text-lg font-semibold mb-4">Description</Text>
          <Text className="text-gray-200 mb-6">{menuItem.description || 'Delicious food item'}</Text>
        </View>
        <View className='flex w-full mt-3'>
          <Text className="text-lg font-semibold mb-4">Toppings</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <View className="flex-row gap-3 px-1">
              {toppings.map((topping: any) => (
                <CustomizationCard
                  key={topping.$id}
                  customization={topping}
                  onAdd={handleCustomizationToggle}
                  isSelected={selectedCustomizations.some(c => c.$id === topping.$id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        
        {sides.length > 0 && (
          <View className='flex w-full mt-3'>
            <Text className="text-lg font-semibold mb-4">Sides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <View className="flex-row gap-3 px-1">
                {sides.map((side: any) => (
                  <CustomizationCard
                    key={side.$id}
                    customization={side}
                    onAdd={handleCustomizationToggle}
                    isSelected={selectedCustomizations.some(c => c.$id === side.$id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Add to Cart Button */}
      <View className="mt-5 bg-white rounded-lg p-5 px-8"  >
        <View className='flex flex-row gap-2 w-full items-center justify-between'>
          <View className='flex flex-row gap-3 items-center justify-center'>
            <TouchableOpacity
              onPress={()=>setQuantity(quantity + 1)}
              className="text-primary bg-primary/10 rounded-lg p-2"
            >
              <Text className="text-primary text-lg font-semibold text-center">
                <Feather name="plus" size={24}  />
              </Text>
            </TouchableOpacity>
            <Text className="text-black text-lg font-semibold text-center">{quantity}</Text>
            <TouchableOpacity
              onPress={()=>setQuantity(quantity - 1)}
              className="text-primary bg-primary/10 rounded-lg p-2"
            >
              <Text className="text-primary text-lg font-semibold text-center">
                <Feather name="minus" size={24}  />
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            className="bg-primary p-4 px-8 rounded-full items-center"
          >
            <View className='flex flex-row gap-1 items-center justify-center'>
              <Feather name="shopping-cart" size={24} color="white" />
              <Text className="text-white text-lg font-semibold">Add to Cart</Text>
              <Text className="text-white text-lg font-semibold">
                <Text className="text-primary mr-2">$</Text>{calculateTotalPrice().toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ItemDetails;
