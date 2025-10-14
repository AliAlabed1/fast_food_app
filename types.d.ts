export interface User{
    id:string;
    name:string;
    email:string;
    avatarUrl:string;
}

export interface MenuItem{
    $id:string;
    image_url:string;
    name:string;
    price:number;
    rating:number;
    calories:number;
    protein:number;
    categories:string;
    menuCustomization:string[];
}

export interface MenuCustomization{
    $id:string;
    menu:string;
}