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

export interface Category{
    $id:string;
    name:string;
    description:string;
}

export interface CartCustomization{
    id:string;
    name:string;
    price:number;
}

export interface CartItemType{
    id:string;
    image_url:string;
    name:string;
    quantity:number;
    price:number;
    customizations?:CartCustomization[];
}

export interface CartStore{
    items:CartItemType[];
    addItem:(item:CartItemType)=>void;
    removeItem:(id:string,customizations?:CartCustomization[])=>void;
    increaseQty:(id:string,customizations?:CartCustomization[])=>void;
    decreaseQty:(id:string,customizations?:CartCustomization[])=>void;
    clearCart:()=>void;
    getTotalItems:()=>number;
    getTotalPrice:()=>number;
}

export interface CustomHeaderProps{
    title?:string;
}

export interface CustomButtonProps{
    onPress:()=>void;
    title:string;
    style?:string;
    textStyle?:string;
    leftIcon?:string;
    isLoading?:boolean;
}

export interface CartItemProps{
    item:CartItemType;
}

export interface PaymentInfoStripeProps{
    label:string;
    value:string;
    labelStyle?:string;
    valueStyle?:string;
}