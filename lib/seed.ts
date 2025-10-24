import { File } from "expo-file-system";
import { ID } from "react-native-appwrite";

import { MenuItem } from "@/types";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}


interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.assetBucket);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.assetBucket, file.$id)
        )
    );
}


  
export async function uploadImageToStorage(imageUrl: string) {
    const filename =
      imageUrl.split("/").pop()?.split("?")[0] || `file-${Date.now()}.jpg`;
  
    // Fetch must be CORS-allowed by the image host
    const res = await fetch(imageUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    if (res.type === "opaque") {
      throw new Error("Remote host blocks CORS; cannot read image in browser.");
    }
  
    const blob = await res.blob();
  
    // ✅ Pass Blob directly (works on web)
    const file = await storage.createFile(
      appwriteConfig.assetBucket,
      ID.unique(),
      blob as unknown as File // TS types sometimes require File; cast is fine in browser
    );
  
    // Return a view URL (or keep the fileId)
    // Construct the file URL manually since getFileView returns ArrayBuffer
    const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.assetBucket}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
    return fileUrl;
  }

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoriesTable);
    await clearAll(appwriteConfig.customizationTable);
    await clearAll(appwriteConfig.menuTable);
    await clearAll(appwriteConfig.menu_customizationTable);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesTable,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTable,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const uploadedImage = await uploadImageToStorage(item.image_url);
        console.log('uploadedImage',uploadedImage)
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuTable,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.categories],
                menuCustomization: item.menuCustomization.map((cus) => customizationMap[cus]),
                bunType: item.bunType,
                deliveryFee: item.deliveryFee,
                preparingTime: item.preparingTime,
            }
        );

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.menuCustomization) {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menu_customizationTable,
                ID.unique(),
                {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                }
            );
        }
    }

    console.log("✅ Seeding complete.");
}

export default seed;