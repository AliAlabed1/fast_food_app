import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { images } from '../../constants';
import { updateUserProfile, uploadAvatarImage } from '../../lib/appwrite';
import { useAuthStore } from '../../store/auth.store';
import '../globals.css';

const Profile = () => {
  const { user, setUser, fetchAuthenticatedUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user) {
      const userData = user as any;
      setName(userData.name || '');
      setEmail(userData.email || '');
      setAvatar(userData.avatar || '');
    } else {
      fetchAuthenticatedUser();
    }
  }, [user]);

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to change your profile picture!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndUpdateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take a photo!'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndUpdateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadAndUpdateAvatar = async (imageUri: string) => {
    const userData = user as any;
    if (!userData?.$id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsUploading(true);
    try {
      // Upload the image to Appwrite storage
      const avatarUrl = await uploadAvatarImage(imageUri);
      console.log('avatarUrl',avatarUrl)
      // Update user profile with new avatar
      const updatedUser = await updateUserProfile(userData?.$id, { avatar: avatarUrl });
      console.log('updatedUser',updatedUser) 
      // Update local state
      setAvatar(avatarUrl);
      setUser(updatedUser);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', error.message|| 'Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSaveProfile = async () => {
    const userData = user as any;
    if (!userData?.$id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await updateUserProfile(userData.$id, { name: name.trim() });
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      const userData = user as any;
      setName(userData.name || '');
      setEmail(userData.email || '');
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        {/* Header */}
        <View className="flex-between flex-row w-full px-5 pt-5 mb-6">
          <Text className="h1-bold text-dark-100">Profile</Text>
        </View>

        {/* Profile Avatar Section */}
        <View className="flex-center mb-8">
          <View className="relative">
            {isUploading ? (
              <View className="profile-avatar flex-center bg-primary/10">
                <ActivityIndicator size="large" color="#FE8C00" />
              </View>
            ) : (
              <Image
                source={avatar ? { uri: avatar } : images.avatar}
                className="profile-avatar"
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              onPress={showImagePickerOptions}
              className="profile-edit"
              disabled={isUploading}
            >
              <Feather name="camera" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text className="h3-bold text-dark-100 mt-4">{name || 'User'}</Text>
          <Text className="paragraph-regular text-gray-100 mt-1">{email}</Text>
        </View>

        {/* Profile Information Section */}
        <View className="px-5">
          <View className="mb-6">
            <Text className="paragraph-semibold text-dark-100 mb-4">Personal Information</Text>
            
            <View className="gap-4">
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={setName}
                editable={isEditing}
              />
              
              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                keyboardType="email-address"
                editable={false}
              />
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="gap-3 mt-4">
              <CustomButton
                title="Save Changes"
                onPress={handleSaveProfile}
                isLoading={isLoading}
              />
              <TouchableOpacity
                onPress={handleCancelEdit}
                className="bg-gray-200 rounded-full p-3 items-center"
                disabled={isLoading}
              >
                <Text className="paragraph-semibold text-dark-100">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-primary rounded-full p-3 items-center mt-4"
            >
              <View className="flex-row items-center gap-2">
                <Feather name="edit-2" size={18} color="#fff" />
                <Text className="paragraph-semibold text-white">Edit Profile</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Info Section */}
        <View className="px-5 mt-8">
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="profile-field__icon">
                <Feather name="mail" size={20} color="#FE8C00" />
              </View>
              <View className="flex-1">
                <Text className="small-bold text-gray-100 mb-1">Email Address</Text>
                <Text className="paragraph-regular text-dark-100">{email}</Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center">
              <View className="profile-field__icon">
                <Feather name="user" size={20} color="#FE8C00" />
              </View>
              <View className="flex-1">
                <Text className="small-bold text-gray-100 mb-1">Account ID</Text>
                <Text className="paragraph-regular text-dark-100" numberOfLines={1}>
                  {(user as any)?.$id || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
