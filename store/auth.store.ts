import { getCurrUser } from '../lib/appwrite';
import { User } from '@sentry/react-native';
import { create } from 'zustand';

type AuthState={
    isAuthenticated:boolean;
    user:User | null;
    isLoading:boolean;

    setIsAuthenticated: (input:boolean)=>void;
    setUser:(input:User|null) =>void;
    setIsLoading: (input:boolean)=>void;

    fetchAuthenticatedUser:()=>Promise<void>
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated:false,
  user:null,
  isLoading:true,

  setIsAuthenticated:(input:boolean)=>set({isAuthenticated:input}),
  setUser:(input:User|null)=>set({user:input}),
  setIsLoading:(input:boolean)=>set({isLoading:input}),

  fetchAuthenticatedUser:async()=>{
    set({isLoading:true});
    try {
        const user =await getCurrUser();
        console.log('currentUser',user)
        if(user){
            set({isAuthenticated:true,user:user as User})
        } else{
            set({isAuthenticated:false,user:null})
        }
    } catch (error) {
        console.log(error)
        set({isAuthenticated:false,user:null});
    }finally{
        set({isLoading:false})
    }
  }

}))
