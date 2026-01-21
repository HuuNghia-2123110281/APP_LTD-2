import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Stack, useRouter } from 'expo-router'; // Dùng router của Expo
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Định nghĩa kiểu dữ liệu cho Đơn hàng (Tuỳ chọn, giúp code xịn hơn)
interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  userEmail?: string; // Tuỳ field bên backend trả về
}

export default function AdminOrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- HÀM 1: LẤY DANH SÁCH ĐƠN HÀNG ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }


      const response = await axios.get('https://ltd-be-production.up.railway.app/api', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sắp xếp đơn mới nhất lên đầu (nếu backend chưa sắp xếp)
      const sortedOrders = response.data.sort((a: any, b: any) => b.id - a.id);
      setOrders(sortedOrders);

    } catch (error) {
      console.error("Lỗi lấy đơn:", error);
      Alert.alert("Lỗi", "Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM 2: XÁC NHẬN THANH TOÁN (Duyệt đơn) ---
  const handleConfirmPayment = async (orderId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      await axios.put(
        `http://10.0.2.2:8080/api/admin/orders/${orderId}/status?status=PAID`, 
        {}, // Body rỗng
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert("Thành công", `Đã xác nhận đơn #${orderId}`);
      fetchOrders(); // Load lại danh sách ngay

    } catch (error) {
      console.error(error);
      Alert.alert("Thất bại", "Có lỗi khi cập nhật trạng thái");
    }
  };

  // Gọi API khi màn hình hiện lên
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- GIAO DIỆN TỪNG DÒNG (Item) ---
  const renderItem = ({ item }: { item: Order }) => {
    const isPaid = item.status === 'PAID';
    
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: isPaid ? '#2ecc71' : '#f1c40f' }]}>
            <Text style={styles.badgeText}>{isPaid ? 'Đã Thanh Toán' : 'Chờ Xử Lý'}</Text>
          </View>
        </View>

        <Text style={styles.text}>Ngày đặt: {new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.totalPrice}>Tổng tiền: {item.totalPrice.toLocaleString()} đ</Text>

        {/* Nút bấm chỉ hiện khi chưa thanh toán */}
        {!isPaid && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleConfirmPayment(item.id)}
          >
            <Text style={styles.buttonText}>Xác nhận đã nhận tiền</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cấu hình Header cho trang này */}
      <Stack.Screen options={{ title: 'Quản Lý Đơn Hàng', headerBackTitle: 'Back' }} />

      {loading && orders.length === 0 ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có đơn hàng nào!</Text>
          }
        />
      )}
    </View>
  );
}

// --- CSS STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  listContent: { padding: 15 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  text: { color: '#7f8c8d', marginBottom: 4 },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c', marginVertical: 8 },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#95a5a6' }
});