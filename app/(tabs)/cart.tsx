import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchCart = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      if (cart) {
        setCartItems(JSON.parse(cart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const updateQuantity = async (itemId: number, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);

    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = async (itemId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedCart);
            await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
          }
        }
      ]
    );
  };

  const totalMoney = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để thanh toán',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    // Chuyển sang màn hình checkout
    router.push('/checkout');
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#888" />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.price}>{formatCurrency(item.price)}</Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff5252" />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalText}>{formatCurrency(totalMoney)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:
    { flex: 1, backgroundColor: '#121212' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 18, marginTop: 20, marginBottom: 30 },
  shopButton: { backgroundColor: '#2979ff', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  shopButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  item: { flexDirection: 'row', backgroundColor: '#1e1e2e', padding: 12, marginHorizontal: 10, marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  image: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 8 },
  info: { marginLeft: 12, justifyContent: 'space-between', flex: 1 },
  name: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  price: { color: '#00e676', fontWeight: 'bold', fontSize: 15 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityButton: { backgroundColor: '#2979ff', width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  quantity: { color: 'white', fontWeight: 'bold', marginHorizontal: 16, fontSize: 16 },
  deleteButton: { justifyContent: 'center', paddingLeft: 8 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1e1e1e' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { color: '#aaa', fontSize: 16 },
  totalText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#00e676', padding: 16, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
});