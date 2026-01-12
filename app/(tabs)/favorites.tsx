import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Product } from '../services/api';

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<Product[]>([]);

    // Reload mỗi khi vào màn hình này
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        try {
            const storedFavs = await AsyncStorage.getItem('favorites');
            if (storedFavs) {
                setFavorites(JSON.parse(storedFavs));
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Lỗi load yêu thích:', error);
        }
    };

    const removeFavorite = async (id: number) => {
        Alert.alert(
            'Xóa yêu thích',
            'Bạn có muốn xóa sản phẩm này khỏi danh sách?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        const newFavs = favorites.filter(item => item.id !== id);
                        setFavorites(newFavs);
                        await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
                    }
                }
            ]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/product-detail?id=${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>{formatCurrency(item.price)}</Text>

                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => router.push(`/product-detail?id=${item.id}`)} // Hoặc logic thêm giỏ hàng
                >
                    <Text style={styles.cartBtnText}>Mua ngay</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFavorite(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color="#ff5252" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sản phẩm yêu thích ({favorites.length})</Text>
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-dislike-outline" size={80} color="#333" />
                    <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích nào</Text>
                    <TouchableOpacity
                        style={styles.shopNowBtn}
                        onPress={() => router.push('/(tabs)/home')}
                    >
                        <Text style={styles.shopNowText}>Khám phá ngay</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center'
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    listContent: { padding: 15 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 8,
        backgroundColor: 'white'
    },
    info: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between'
    },
    name: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    price: { color: '#00e676', fontSize: 16, fontWeight: 'bold' },
    cartBtn: {
        backgroundColor: '#2979ff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-start'
    },
    cartBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    removeBtn: {
        justifyContent: 'center',
        paddingLeft: 10
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        marginTop: 15,
        marginBottom: 20
    },
    shopNowBtn: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25
    },
    shopNowText: { color: 'white', fontWeight: 'bold' }
});