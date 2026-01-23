import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ApiService, { CartItem } from '../services/api';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log('=== 🛒 FETCHING CART ===');

      const response = await ApiService.getCart();

      console.log('📦 Cart API Response:', {
        hasItems: !!response?.items,
        itemCount: response?.items?.length || 0,
        totalPrice: response?.totalPrice || 0,
        cartId: response?.cartId
      });

      // Log chi tiết từng item
      if (response?.items && response.items.length > 0) {
        console.log('📋 Cart Items Detail:');
        response.items.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.product.name}`, {
            cartItemId: item.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            stock: item.product.stock
          });
        });
      }

      if (response && response.items) {
        setCartItems(response.items);
        setTotalPrice(response.totalPrice);
        console.log(`✅ Cart loaded successfully: ${response.items.length} items, total: ${response.totalPrice.toLocaleString('vi-VN')}₫`);
      } else {
        setCartItems([]);
        setTotalPrice(0);
        console.log('⚠️ Cart is empty');
      }
    } catch (error: any) {
      console.error('❌ Error fetching cart:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      Alert.alert('Lỗi', error.message || 'Không thể tải giỏ hàng');
      setCartItems([]);
      setTotalPrice(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('👁️ Cart screen focused - reloading cart');
      fetchCart();

      // Cleanup function
      return () => {
        console.log('👋 Cart screen unfocused');
      };
    }, [])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const updateQuantity = async (cartItemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;

    console.log(`🔄 Updating quantity:`, {
      cartItemId,
      from: currentQuantity,
      to: newQuantity,
      change
    });

    if (newQuantity < 1) {
      console.log('⚠️ Cannot set quantity below 1');
      return;
    }

    try {
      await ApiService.updateCartItem(cartItemId, newQuantity);
      console.log('✅ Quantity updated successfully, reloading cart...');
      await fetchCart();
    } catch (error: any) {
      console.error('❌ Error updating quantity:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật giỏ hàng');
    }
  };

  const removeItem = async (cartItemId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Removing item: ${cartItemId}`);
              await ApiService.removeFromCart(cartItemId);
              console.log('✅ Item removed successfully, reloading cart...');
              await fetchCart();
              Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
            } catch (error: any) {
              console.error('❌ Error removing item:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    console.log('💳 Proceeding to checkout:', {
      itemCount: cartItems.length,
      totalPrice: totalPrice,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price
      }))
    });

    router.push('/checkout');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2979ff" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#888" />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtext}>
            Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm
          </Text>
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
            onRefresh={handleRefresh}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.price}>
                    {formatCurrency(item.price)}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        item.quantity <= 1 && styles.quantityButtonDisabled
                      ]}
                      onPress={() => updateQuantity(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity, 1)}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Hiển thị stock warning */}
                  {item.product.stock < item.quantity && (
                    <Text style={styles.stockWarning}>
                      ⚠️ Chỉ còn {item.product.stock} sản phẩm
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff5252" />
                </TouchableOpacity>
              </View>
            )}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  Giỏ hàng ({cartItems.length} sản phẩm)
                </Text>
                <TouchableOpacity onPress={handleRefresh}>
                  <Ionicons name="refresh" size={20} color="#2979ff" />
                </TouchableOpacity>
              </View>
            }
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalText}>{formatCurrency(totalPrice)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Thanh toán ngay</Text>
              <Ionicons name="arrow-forward" size={20} color="#121212" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30
  },
  shopButton: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12
  },
  shopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e1e1e',
    marginBottom: 5
  },
  listHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#1e1e2e',
    padding: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  info: {
    marginLeft: 12,
    justifyContent: 'space-between',
    flex: 1
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  price: {
    color: '#00e676',
    fontWeight: 'bold',
    fontSize: 15
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  quantityButton: {
    backgroundColor: '#2979ff',
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.5
  },
  quantity: {
    color: 'white',
    fontWeight: 'bold',
    marginHorizontal: 16,
    fontSize: 16
  },
  stockWarning: {
    color: '#ff9800',
    fontSize: 11,
    marginTop: 4
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 8
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1e1e1e'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  totalLabel: {
    color: '#aaa',
    fontSize: 16
  },
  totalText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold'
  },
  checkoutButton: {
    backgroundColor: '#00e676',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  checkoutText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16
  },
});