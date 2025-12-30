import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar 
} from 'react-native';

export default function App() {
  // Khai báo kiểu dữ liệu là 'any' để tránh lỗi TypeScript
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  // === CẤU HÌNH IP  ===
  const API_URL = 'http://192.168.100.118:8080/api/products'; 

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image.startsWith('http') ? item.image : 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
          resizeMode="contain"
        />
        <View style={styles.tagContainer}>
           <Text style={styles.tagText}>Sale</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <Text style={styles.star}>⭐ {item.rating}</Text>
          <Text style={styles.sold}>Đã bán {item.sold}</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NghiaShop</Text>
        <Text style={styles.headerSubtitle}>Phụ kiện máy tính chính hãng</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2979ff" />
          <Text style={{color: 'white', marginTop: 10}}>Đang tải dữ liệu từ Server...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

// === STYLE (Giữ nguyên) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#1e1e1e', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#aaa', fontSize: 14 },
  listContent: { padding: 10 },
  card: { flex: 1, backgroundColor: '#1e1e2e', margin: 6, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  imageContainer: { height: 120, backgroundColor: '#2b2b3b', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productImage: { width: '80%', height: '80%' },
  tagContainer: { position: 'absolute', top: 8, left: 8, backgroundColor: '#00e676', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#000', fontWeight: 'bold', fontSize: 10 },
  infoContainer: { padding: 10 },
  productName: { color: 'white', fontSize: 14, fontWeight: 'bold', height: 40 },
  category: { color: '#888', fontSize: 12, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  price: { color: '#00e676', fontWeight: 'bold', fontSize: 14, marginRight: 8 },
  originalPrice: { color: '#666', fontSize: 11, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  star: { color: '#ffab00', fontSize: 10 },
  sold: { color: '#888', fontSize: 10 },
  addButton: { backgroundColor: '#2979ff', paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});