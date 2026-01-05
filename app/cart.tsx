import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router'; // Để tự refresh khi quay lại tab

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  // === NHỚ SỬA IP ===
  const API_URL = 'http://172.20.10.2:8080/api/cart'; 

  const fetchCart = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Mỗi khi mở tab này lên là tải lại dữ liệu
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính tổng tiền
  const totalMoney = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
           <Text style={styles.emptyText}>Chưa có sản phẩm nào trong giỏ hàng</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="contain" />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.product.name}</Text>
                  <Text style={styles.price}>{formatCurrency(item.product.price)}</Text>
                  <Text style={styles.quantity}>Số lượng: x{item.quantity}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Tổng cộng: {formatCurrency(totalMoney)}</Text>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 18 },
  item: { flexDirection: 'row', backgroundColor: '#1e1e2e', padding: 10, margin: 10, borderRadius: 10 },
  image: { width: 80, height: 80, backgroundColor: '#333', borderRadius: 8 },
  info: { marginLeft: 15, justifyContent: 'center', flex: 1 },
  name: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  price: { color: '#00e676', fontWeight: 'bold' },
  quantity: { color: '#aaa', marginTop: 5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1e1e1e' },
  totalText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'right' },
  checkoutButton: { backgroundColor: '#ff5252', padding: 15, borderRadius: 10, alignItems: 'center' },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});