import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { images } from "../constants";
import { useCartStore } from "../store/cart.store";
import { CartItemType } from "../types";
import EditCartItemModal from "./EditCartItemModal";

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const customizations = item.customizations || [];
    const toppings = customizations.filter(c => c.type === 'topping');
    const sides = customizations.filter(c => c.type === 'side');
    const otherCustomizations = customizations.filter(c => !c.type || (c.type !== 'topping' && c.type !== 'side'));

    const totalCustomizationPrice = customizations.reduce((sum, c) => sum + c.price, 0);

    return (
        <>
            <View className="cart-item">
                <View className="flex flex-row items-center gap-x-3 flex-1">
                    <View className="cart-item__image">
                        <Image
                            source={{ uri: item.image_url }}
                            className="size-4/5 rounded-lg"
                            resizeMode="cover"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="base-bold text-dark-100">{item.name}</Text>
                        <Text className="paragraph-bold text-primary mt-1">
                            ${item.price.toFixed(2)}
                            {totalCustomizationPrice > 0 && (
                                <Text className="text-xs text-gray-200"> + ${totalCustomizationPrice.toFixed(2)} extras</Text>
                            )}
                        </Text>

                        {/* Display Customizations */}
                        {customizations.length > 0 && (
                            <View className="mt-2">
                                {toppings.length > 0 && (
                                    <View className="mb-1">
                                        <Text className="text-xs text-gray-400 mb-1">Toppings:</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {toppings.map((customization) => (
                                                <View key={customization.id} className="bg-primary/10 px-2 py-1 rounded-full">
                                                    <Text className="text-xs text-primary">{customization.name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                                {sides.length > 0 && (
                                    <View className="mb-1">
                                        <Text className="text-xs text-gray-400 mb-1">Sides:</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {sides.map((customization) => (
                                                <View key={customization.id} className="bg-primary/10 px-2 py-1 rounded-full">
                                                    <Text className="text-xs text-primary">{customization.name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                                {otherCustomizations.length > 0 && (
                                    <View className="mb-1">
                                        <Text className="text-xs text-gray-400 mb-1">Extras:</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {otherCustomizations.map((customization) => (
                                                <View key={customization.id} className="bg-primary/10 px-2 py-1 rounded-full">
                                                    <Text className="text-xs text-primary">{customization.name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        <View className="flex flex-row items-center gap-x-4 mt-2">
                            <TouchableOpacity
                                onPress={() => decreaseQty(item.id, item.customizations!)}
                                className="cart-item__actions"
                            >
                                <Image
                                    source={images.minus}
                                    className="size-1/2"
                                    resizeMode="contain"
                                    tintColor={"#FF9C01"}
                                />
                            </TouchableOpacity>

                            <Text className="base-bold text-dark-100">{item.quantity}</Text>

                            <TouchableOpacity
                                onPress={() => increaseQty(item.id, item.customizations!)}
                                className="cart-item__actions"
                            >
                                <Image
                                    source={images.plus}
                                    className="size-1/2"
                                    resizeMode="contain"
                                    tintColor={"#FF9C01"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex flex-col gap-2">
                    <TouchableOpacity
                        onPress={() => setIsEditModalVisible(true)}
                        className="flex-center"
                    >
                        <Image source={images.pencil} className="size-5" resizeMode="contain" tintColor={"#FF9C01"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => removeItem(item.id, item.customizations!)}
                        className="flex-center"
                    >
                        <Image source={images.trash} className="size-5" resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>

            <EditCartItemModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                cartItem={item}
            />
        </>
    );
};

export default CartItem;