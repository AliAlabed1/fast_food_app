import seed from '@/lib/seed'
import React from 'react'
import { Button, Text, View } from 'react-native'

const Profile = () => {
  return (
    <View>
      <Button title="Seed Database" onPress={() => seed()} />
      <Text>Profile</Text>
    </View>
  )
}

export default Profile