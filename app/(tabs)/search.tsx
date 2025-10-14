import CartButton from '@/components/CartButton'
import MenuCard from '@/components/MenuCard'
import { getCategories, getMenu } from '@/lib/appwrite'
import useAppWrite from '@/lib/useAppWrite'
import cn from 'clsx'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const Search = () => {
  const {category,query} = useLocalSearchParams<{query:string,category:string}>()
  const {data,loading,error,refetch} = useAppWrite({
    fn:getMenu,
    params:{
      category,
      query,
      limit:10,
    }
  })

  const {data:categories,loading:categoriesLoading,error:categoriesError,refetch:categoriesRefetch} = useAppWrite({
    fn:getCategories,
  })

  useEffect(()=>{
    refetch({category,query,limit:10})
  },[category,query])
  return (
    <SafeAreaView className='bg-white h-full'>
      <FlatList
        data={data}
        renderItem={({item,index})=>{
          const isFirstRightColItem = index % 2 === 0; 

          return(
            <View className={cn('flex-1 max-w-[48%]',isFirstRightColItem ? 'mt-0' : 'mt-10')}>
              <MenuCard 
                item={item}
              />
            </View>
          )
        }}
        keyExtractor={(item)=>item.$id}
        numColumns={2}
        columnWrapperClassName='gap-7'
        contentContainerClassName='px-5 pb-32 gap-7'
        ListHeaderComponent={()=>{
          return(
            <View className='m-2 gap-2'>
              <View className='flex-between flex-row w-full'>
                <View className='flex-start'>
                  <Text className='sm-bold text-primary uppercase'>Search</Text>
                  <View className='flex-start flex-row gapx-1 mt-0.5'>
                    <Text className='paragraph-semibold text-dark-100'>Find your favorite food</Text>
                  </View>
                </View>
                <CartButton />
              </View>
              <Text>Search Input</Text>
              <Text>Filter</Text>
            </View>
          )
        }}
        ListEmptyComponent={()=>!loading && <Text>No Results</Text>}
      />
    </SafeAreaView>
  )
}

export default Search