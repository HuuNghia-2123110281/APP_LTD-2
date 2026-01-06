import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, Alert, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function App() {
  const router = useRouter(); 
  
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setLoading] = useState(true);

  // === CẤU HÌNH SERVER ===
  // Theo ảnh bạn gửi thì IP máy bạn là 192.168.100.118
  const BASE_URL = 'http://172.20.10.2:8080'; 
  const API_URL = `${BASE_URL}/api/products`;
  const CART_API_URL = `${BASE_URL}/api/cart/add`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 1. HÀM TẢI SẢN PHẨM (CHẠY NGAY KHI MỞ APP - KHÔNG CẦN ĐĂNG NHẬP)
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data); // Hiện tất cả sản phẩm
      } else {
        console.log("Không tải được dữ liệu, lỗi Server");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      Alert.alert("Lỗi mạng", "Không kết nối được Server 192.168.100.118");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm tìm kiếm (Lọc theo tên 'name')
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = products.filter((item) => {
        // Dữ liệu Java của bạn dùng biến 'name', không phải 'title'
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredProducts(newData);
    } else {
      setFilteredProducts(products);
    }
  };

  // 2. HÀM THÊM VÀO GIỎ (SẼ KIỂM TRA ĐĂNG NHẬP Ở ĐÂY)
  const handleAddToCart = async (item: any) => {
    // Bước 1: Kiểm tra xem trong bộ nhớ máy đã có vé đăng nhập chưa
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {
      // NẾU CHƯA CÓ -> Hiện thông báo bắt đi đăng nhập
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để mua hàng!",
        [
          { text: "Để sau", style: "cancel" },
          { 
            text: "Đăng nhập ngay", 
            onPress: () => router.push('/profile') // Chuyển ngay sang tab Hồ sơ
          }
        ]
      );
      return; // Dừng lại, không cho thêm vào giỏ
    }

    // Bước 2: NẾU ĐÃ CÓ VÉ -> Cho phép gửi đơn hàng lên Server
    try {
      const response = await fetch(CART_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        Alert.alert("Thành công", `Đã thêm "${item.name}" vào giỏ!`);
      } else {
        Alert.alert("Lỗi", "Server không nhận đơn hàng");
      }
    } catch (error) {
      Alert.alert("Lỗi mạng", "Không kết nối được Server");
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage} 
          resizeMode="contain"
        />
        <View style={styles.tagContainer}><Text style={styles.tagText}>Sale</Text></View>
      </View>

      <View style={styles.infoContainer}>
        {/* Chú ý: Dùng item.name (Server Java) thay vì item.title */}
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <Text style={styles.star}>⭐ {item.rating || 5}</Text>
          <Text style={styles.sold}>Đã bán {item.sold || 0}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
          <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
           <View>
              <Text style={styles.headerTitle}>NghiaShop</Text>
              <Text style={styles.headerSubtitle}>Phụ kiện máy tính chính hãng</Text>
           </View>
           <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="white" />
           </TouchableOpacity>
        </View>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm chuột, bàn phím..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
             </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2979ff" />
          <Text style={{color: '#888', marginTop: 10}}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
             <View style={styles.center}>
                <Text style={{color: '#888', marginTop: 50}}>Không tìm thấy sản phẩm nào :(</Text>
             </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { padding: 20, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#aaa', fontSize: 14 },
  iconButton: { width: 40, height: 40, backgroundColor: '#333', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', backgroundColor: '#2b2b3b', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  searchInput: { flex: 1, color: 'white', fontSize: 16 },
  listContent: { padding: 10 },
  card: { flex: 1, backgroundColor: '#1e1e2e', margin: 6, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  imageContainer: { height: 140, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 10 },
  productImage: { width: '100%', height: '100%' },
  tagContainer: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ff5252', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  infoContainer: { padding: 10 },
  productName: { color: 'white', fontSize: 13, fontWeight: 'bold', height: 36, marginBottom: 4 },
  category: { color: '#888', fontSize: 12, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  price: { color: '#00e676', fontWeight: 'bold', fontSize: 15 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  star: { color: '#ffab00', fontSize: 11 },
  sold: { color: '#888', fontSize: 11 },
  addButton: { backgroundColor: '#2979ff', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});