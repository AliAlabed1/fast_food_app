import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMenuCustomizations, getMenuItem } from '../lib/appwrite';
import useAppWrite from '../lib/useAppWrite';
import { useCartStore } from '../store/cart.store';
import { CartItemType } from '../types';
import CustomizationCard from './CustomizationCard';

interface Customization {
    $id: string;
    name: string;
    price: number;
    type: string;
    image_url?: string;
}

interface EditCartItemModalProps {
    visible: boolean;
    onClose: () => void;
    cartItem: CartItemType;
}

const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
    visible,
    onClose,
    cartItem,
}) => {

    useEffect(()=>{
        console.log('[0] cartItem',cartItem);
    },[cartItem]);
    const { updateItem } = useCartStore();
    const [selectedCustomizations, setSelectedCustomizations] = useState<Customization[]>([]);
    const [quantity, setQuantity] = useState(cartItem.quantity);

    // Fetch menu item data
    const { data: menuItem, loading: itemLoading } = useAppWrite({
        fn: () => getMenuItem(cartItem.id),
        params: { menuId: cartItem.id },
    });

    // Fetch customizations
    const { data: customizations, loading: customizationsLoading } = useAppWrite({
        fn: () => getMenuCustomizations(cartItem.id),
        params: { menuId: cartItem.id },
    });

    // Initialize selected customizations from cart item when modal opens
    useEffect(() => {
        if (visible && customizations && cartItem.customizations) {
            // Map cart customizations to full customization objects
            const initialSelected = cartItem.customizations
                .map(cartCustom => {
                    const fullCustom = customizations.find(
                        (c: any) => c.$id === cartCustom.id
                    );
                    if (fullCustom) {
                        return {
                            $id: fullCustom.$id,
                            name: fullCustom.name,
                            price: fullCustom.price,
                            type: fullCustom.type || cartCustom.type || '',
                            image_url: fullCustom.image_url,
                        };
                    }
                    return null;
                })
                .filter(Boolean) as Customization[];

            setSelectedCustomizations(initialSelected);
            setQuantity(cartItem.quantity);
        }
    }, [visible, customizations, cartItem]);

    const toppings = useMemo(() => {
        if (!customizations) return [];
        return customizations.filter((customization: any) => customization.type === 'topping');
    }, [customizations]);

    const sides = useMemo(() => {
        if (!customizations) return [];
        return customizations.filter((customization: any) => customization.type === 'side');
    }, [customizations]);

    const handleCustomizationToggle = (customization: Customization) => {
        setSelectedCustomizations(prev => {
            const isSelected = prev.some(c => c.$id === customization.$id);
            if (isSelected) {
                return prev.filter(c => c.$id !== customization.$id);
            } else {
                return [...prev, customization];
            }
        });
    };

    const handleSave = () => {
        if (!menuItem) return;

        const oldCustomizations = cartItem.customizations || [];
        const newCustomizations = selectedCustomizations.map(c => ({
            id: c.$id,
            name: c.name,
            price: c.price,
            type: c.type,
        }));

        updateItem(
            cartItem.id,
            oldCustomizations,
            newCustomizations,
            quantity
        );

        onClose();
    };

    const calculateTotalPrice = () => {
        if (!menuItem) return 0;
        const basePrice = menuItem.price;
        const customizationsPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
        return (basePrice + customizationsPrice) * quantity;
    };

    const isLoading = itemLoading || customizationsLoading;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
                        <Text className="text-xl font-bold text-dark-100">Edit Item</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#FF9C01" />
                            <Text className="mt-4 text-gray-400">Loading...</Text>
                        </View>
                    ) : menuItem ? (
                        <ScrollView className="flex-1 p-5">
                            {/* Item Info */}
                            <View className="mb-4">
                                <Text className="text-lg font-bold text-dark-100 mb-2">
                                    {menuItem.name}
                                </Text>
                                <Text className="text-primary font-semibold">
                                    ${menuItem.price.toFixed(2)}
                                </Text>
                            </View>

                            {/* Quantity Selector */}
                            <View className="mb-6">
                                <Text className="text-base font-semibold text-dark-100 mb-3">
                                    Quantity
                                </Text>
                                <View className="flex-row items-center gap-4">
                                    <TouchableOpacity
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="bg-primary/10 rounded-lg p-3"
                                    >
                                        <Feather name="minus" size={20} color="#FF9C01" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold text-dark-100 min-w-[40px] text-center">
                                        {quantity}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setQuantity(quantity + 1)}
                                        className="bg-primary/10 rounded-lg p-3"
                                    >
                                        <Feather name="plus" size={20} color="#FF9C01" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Toppings */}
                            {toppings.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-base font-semibold text-dark-100 mb-3">
                                        Toppings
                                    </Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        className="flex-row"
                                    >
                                        <View className="flex-row gap-3 px-1">
                                            {toppings.map((topping: any) => (
                                                <CustomizationCard
                                                    key={topping.$id}
                                                    customization={topping}
                                                    onAdd={handleCustomizationToggle}
                                                    isSelected={selectedCustomizations.some(
                                                        c => c.$id === topping.$id
                                                    )}
                                                />
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            {/* Sides */}
                            {sides.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-base font-semibold text-dark-100 mb-3">
                                        Sides
                                    </Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        className="flex-row"
                                    >
                                        <View className="flex-row gap-3 px-1">
                                            {sides.map((side: any) => (
                                                <CustomizationCard
                                                    key={side.$id}
                                                    customization={side}
                                                    onAdd={handleCustomizationToggle}
                                                    isSelected={selectedCustomizations.some(
                                                        c => c.$id === side.$id
                                                    )}
                                                />
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            {/* Total Price */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-base font-semibold text-dark-100">
                                        Total:
                                    </Text>
                                    <Text className="text-lg font-bold text-primary">
                                        ${calculateTotalPrice().toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-400">Item not found</Text>
                        </View>
                    )}

                    {/* Footer Buttons */}
                    {!isLoading && menuItem && (
                        <View className="p-5 border-t border-gray-200 bg-white">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="flex-1 bg-gray-200 p-4 rounded-full items-center"
                                >
                                    <Text className="text-base font-semibold text-dark-100">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="flex-1 bg-primary p-4 rounded-full items-center"
                                >
                                    <Text className="text-base font-semibold text-white">
                                        Save Changes
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default EditCartItemModal;

