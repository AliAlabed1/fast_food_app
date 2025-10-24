import React from 'react';
import { Image, Text, View } from 'react-native';
import { images } from '../constants';

interface RatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showRating?: boolean;
}

const Rating: React.FC<RatingProps> = ({ 
  rating, 
  maxStars = 5, 
  size = 16, 
  showRating = false 
}) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < maxStars; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(
          <Image
            key={i}
            source={images.star}
            style={{ width: size, height: size, tintColor: "#FE8C00" }}
            resizeMode="contain"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        // Half star using overlay technique
        stars.push(
          <View key={i} style={{ width: size, height: size, position: 'relative' }}>
            {/* Empty star background */}
            <Image
              source={images.star}
              style={{ 
                width: size, 
                height: size, 
                position: 'absolute',
                tintColor: '#5D5F6D'
              }}
              resizeMode="contain"
            />
            {/* Half-filled star overlay */}
            <View 
              style={{ 
                width: size, 
                height: size, 
                overflow: 'hidden',
                position: 'absolute'
              }}
            >
              <View style={{ width: size / 2, height: size }}>
                <Image
                  source={images.star}
                  style={{ 
                    width: size, 
                    height: size,
                    tintColor: '#FE8C00'
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        );
      } else {
        // Empty star
        stars.push(
          <Image
            key={i}
            source={images.star}
            style={{ width: size, height: size, tintColor: "#5D5F6D" }}
            resizeMode="contain"
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <View className="flex-row items-center gap-1">
      {renderStars()}
      {showRating && (
        <Text className="text-sm text-gray-200 ml-2">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

export default Rating;
