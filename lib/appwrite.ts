import { SignInForm } from '@/app/(auth)/sign-in';
import { SignUpForm } from '@/app/(auth)/sign-up';
import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
export const appwriteConfig ={
    endpoint:process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform:"com.company.foodorder",
    projectId:process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId:'68d177bb002675c010d4',
    usedTableId:"user",
    categoriesTable:"categories",
    menuTable:"menu",
    customizationTable:"customization",
    menu_customizationTable:"menu_customization",
    assetBucket:"68e9214f003818e0b467"
}

export const client = new Client()
client.setEndpoint(appwriteConfig.endpoint!)
      .setProject(appwriteConfig.projectId!)
      .setPlatform(appwriteConfig.platform)
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

const avatars = new Avatars(client)

export const createUser = async({email,password,name}:SignUpForm)=>{
    try {
        const newAccount = await account.create({userId:ID.unique(),email,name,password})
        if(!newAccount) throw Error;
        await signIn({email,password});
        const avatarUrl = avatars.getInitialsURL(name)
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.usedTableId,ID.unique(),
            {
                accountId:newAccount.$id,
                email,
                name,
                avatar:avatarUrl,
            }
        )
        return newUser;
    } catch (error) {
        console.log('error while creating new user', error)
        throw new Error(error as string)
    }
}

export const signIn = async ({email,password}:SignInForm) =>{
    try {
        console.log('account',account)
        const session =await account.createEmailPasswordSession(email,password)
    } catch (error) {
        console.log('error while sign in',error)
        throw new Error(error as string)
    }
}

export const getCurrUser = async()=>{
    try {
        const currAccount = account.get();
        if(!currAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usedTableId,
            [
                Query.equal('accountId',(await currAccount).$id)
            ]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0]
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getMenu = async({category,query}:{category:string,query:string})=>{
    try {
        const queries:string[] = [];
        if(category) queries.push(Query.equal('categories',category));
        if(query) queries.push(Query.search('name',query));
        const menu = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuTable,
            queries
        )
        if(!menu) throw Error;
        return menu.documents
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getCategories = async()=>{
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesTable,
        )
        if(!categories) throw Error;
        return categories.documents
    } catch (error) {
        throw new Error(error as string)
    }
}
