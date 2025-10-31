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
    image: string;
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
  
    // Convert blob to File object for proper typing
    const fileObj = new File([blob], filename, { type: blob.type || "image/jpeg" });
    
    // ✅ Pass File directly (works on web)
    const file = await storage.createFile(
      appwriteConfig.assetBucket,
      ID.unique(),
      fileObj as any // react-native-appwrite types expect different format, but File works at runtime
    );
  
    // Return a view URL (or keep the fileId)
    // Construct the file URL manually since getFileView returns ArrayBuffer
    const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.assetBucket}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
    return fileUrl;
  }

export async function uploadLocalAssetToStorage(asset: string | any): Promise<string> {
    // Handle local asset imports - in web context these resolve to URL strings
    // If it's already a string URL, use it directly
    // If it's an object with uri property, extract the URI
    let assetUrl: string;
    
    if (typeof asset === "string") {
        assetUrl = asset;
    } else if (asset && typeof asset === "object" && "uri" in asset) {
        assetUrl = asset.uri;
    } else if (asset && typeof asset === "object" && "default" in asset) {
        // Handle default exports from module imports
        assetUrl = typeof asset.default === "string" ? asset.default : asset.default?.uri || String(asset.default);
    } else {
        // Fallback: try to convert to string (works for URL objects)
        assetUrl = String(asset);
    }

    // Fetch the local asset (works for web where assets resolve to URLs)
    const res = await fetch(assetUrl, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Failed to load local asset: ${res.status} - ${assetUrl}`);
    }
    
    const blob = await res.blob();
    
    // Determine file extension from asset URL for proper filename
    const urlExtension = assetUrl.split('.').pop()?.split('?')[0] || 'png';
    const mimeType = urlExtension === 'jpg' || urlExtension === 'jpeg' ? 'image/jpeg' : 
                     urlExtension === 'png' ? 'image/png' : 
                     'image/jpeg';
    const filename = `customization-${Date.now()}.${urlExtension}`;
    
    // Convert blob to File object for proper typing
    const fileObj = new File([blob], filename, { type: blob.type || mimeType });
    
    // Upload to Appwrite storage
    const file = await storage.createFile(
        appwriteConfig.assetBucket,
        ID.unique(),
        fileObj as any // react-native-appwrite types expect different format, but File works at runtime
    );
    
    // Construct and return the file URL
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
    console.log('cleared all')
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
        const uploadedImage = await uploadLocalAssetToStorage(cus.image);
        console.log('uploadedImage in customizations', uploadedImage);
        
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTable,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
                image_url: uploadedImage,
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