import { images } from '@/constants';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CustomizationCardProps {
  customization: {
    $id: string;
    name: string;
    price: number;
    type: string;
    image_url?: string;
  };
  onAdd: (customization: any) => void;
  isSelected?: boolean;
}

const CustomizationCard: React.FC<CustomizationCardProps> = ({
  customization,
  onAdd,
  isSelected = false
}) => {
  const handlePress = () => {
    onAdd(customization);
  };

  return (
    <TouchableOpacity 
      className="w-32 h-40 rounded-3xl border border-gray-200 overflow-hidden bg-white"
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image Container - White Background */}
      <View className="flex-1  justify-center items-center p-3 rounded-3xl">
        <Image
          source={images.cucumber}
          className="w-20 h-20 "
          resizeMode="cover"
        />
      </View>

      {/* Info Container - Dark Background */}
      <View className="bg-gray-800 px-3 py-2 relative">
        <Text className="text-white text-sm font-semibold" numberOfLines={1}>
          {customization.name}
        </Text>
        <Text className="text-gray-300 text-xs mt-1">
          ${customization.price}
        </Text>

        {/* Add Button - Red Circle */}
        <TouchableOpacity
          className={`absolute -top-3 left-[90%] w-8 h-8 rounded-full items-center justify-center ${
            isSelected ? 'bg-green-500' : 'bg-red-500'
          }`}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Feather 
            name={isSelected ? "check" : "plus"} 
            size={16} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CustomizationCard;
