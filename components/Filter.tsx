import cn from 'clsx'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { FlatList, Text, TouchableOpacity } from 'react-native'
import { Category } from '../types'
const Filter = ({categories}:{categories:Category[]}) => {
  const searchParams = useLocalSearchParams();
  const [active,setActive] = useState<string>(searchParams.category as string || 'all');

  const handleFilter = (id:string) => {
    setActive(id);
    if(id === 'all'){
      router.setParams({category:undefined});
      return;
    }
    router.setParams({category:id});
  }

  const filterData:(Category | {$id:string; name:string; })[] = categories ? [{$id:'all',name:'All'},...categories] : [{$id:'all',name:'All'}];
  return (
    <FlatList
      data={filterData}
      renderItem={({item})=>{
        return(
          <TouchableOpacity 
            key={item.$id} className={cn('filter',active === item.$id ? 'bg-primary' : 'bg-white')} 
            onPress={()=>handleFilter(item.$id)}
          >
            <Text className={cn('text-base font-quicksand-medium',active === item.$id ? 'text-white' : 'text-gray-200')}>{item.name}</Text>
          </TouchableOpacity>
        )
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName='gap-x-2 pb-3'
      keyExtractor={(item)=>item.$id}
      
    />
  )
}

export default Filter