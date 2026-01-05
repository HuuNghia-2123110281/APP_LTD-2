import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ScrollView, Image 
} from 'react-native';
import { useRouter } from 'expo-router'; // Để chuyển trang
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  
  // === CẤU HÌNH IP (NHỚ SỬA LẠI THEO MÁY BẠN) ===
  const API_URL = 'http://192.168.100.118:8080/api/auth/login';

  // State quản lý trạng thái
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'ADMIN' hoặc 'USER'
  const [userName, setUserName] = useState('');
  
  // Form đăng nhập
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Hàm xử lý Đăng nhập
  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setIsLoggedIn(true);
        setUserRole(data.role); // Server trả về 'ADMIN' hoặc 'USER'
        setUserName(data.name);
        Alert.alert("Chào mừng", `Xin chào ${data.name}!`);
      } else {
        Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (error) {
      // Để test nhanh nếu chưa cấu hình xong Backend Auth
      if(usernameInput === 'admin' && passwordInput === '123') {
          setIsLoggedIn(true); setUserRole('ADMIN'); setUserName('Admin Cục Bộ');
      } else if (usernameInput === 'user') {
          setIsLoggedIn(true); setUserRole('USER'); setUserName('Khách Hàng');
      } else {
          Alert.alert("Lỗi mạng", "Không kết nối được Server Authentication");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUsernameInput('');
    setPasswordInput('');
  };

  // === GIAO DIỆN 1: LOGIN FORM (Khi chưa đăng nhập) ===
  if (!isLoggedIn) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.logoText}>NghiaShop</Text>
        <TextInput 
          style={styles.input} placeholder="Tài khoản (admin / user)" 
          placeholderTextColor="#888" value={usernameInput} onChangeText={setUsernameInput}
        />
        <TextInput 
          style={styles.input} placeholder="Mật khẩu (123)" 
          placeholderTextColor="#888" secureTextEntry value={passwordInput} onChangeText={setPasswordInput}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <Text style={{color: '#666', marginTop: 20}}>Gợi ý: admin/123 hoặc user/123</Text>
      </View>
    );
  }

  // === GIAO DIỆN 2: ADMIN DASHBOARD (Nếu là ADMIN) ===
  if (userRole === 'ADMIN') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
        <View style={styles.headerAdmin}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png' }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>ADMINISTRATOR</Text>
            <Text style={{color: '#aaa'}}>{userName}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>QUẢN LÝ CỬA HÀNG</Text>
        
        {/* Lưới các nút chức năng */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Tính năng", "Mở màn hình Thêm/Sửa/Xóa Sản phẩm")}>
            <View style={[styles.iconBox, {backgroundColor: '#e3f2fd'}]}>
               <MaterialCommunityIcons name="cube-outline" size={32} color="#2196f3" />
            </View>
            <Text style={styles.cardText}>QL Sản phẩm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Tính năng", "Mở danh sách người dùng")}>
            <View style={[styles.iconBox, {backgroundColor: '#e8f5e9'}]}>
               <Ionicons name="people-outline" size={32} color="#4caf50" />
            </View>
            <Text style={styles.cardText}>QL Người dùng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Tính năng", "Mở danh sách đánh giá")}>
             <View style={[styles.iconBox, {backgroundColor: '#fff3e0'}]}>
               <Ionicons name="star-outline" size={32} color="#ff9800" />
            </View>
            <Text style={styles.cardText}>Đánh giá & Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Báo cáo", "Xem doanh thu tháng này")}>
             <View style={[styles.iconBox, {backgroundColor: '#fce4ec'}]}>
               <Ionicons name="bar-chart-outline" size={32} color="#e91e63" />
            </View>
            <Text style={styles.cardText}>Thống kê</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>CÔNG CỤ KHÁC</Text>
        
        {/* Nút chuyển đổi xem như người dùng */}
        <TouchableOpacity style={styles.rowButton} onPress={() => router.push('/')}>
          <Ionicons name="eye-outline" size={24} color="white" />
          <Text style={styles.rowText}>Xem giao diện Khách hàng</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.rowButton, {marginTop: 20, borderColor: '#ff5252'}]} onPress={handleLogout}>
          <Text style={{color: '#ff5252', fontWeight: 'bold'}}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // === GIAO DIỆN 3: USER BÌNH THƯỜNG (Nếu là USER) ===
  return (
    <View style={styles.container}>
      <View style={styles.headerUser}>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
        <Text style={styles.welcomeText}>{userName}</Text>
        <Text style={{color: '#00e676'}}>Thành viên Bạc</Text>
      </View>

      <View style={{marginTop: 20}}>
        <TouchableOpacity style={styles.rowButton}>
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text style={styles.rowText}>Đơn hàng của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowButton}>
          <Ionicons name="heart-outline" size={24} color="white" />
          <Text style={styles.rowText}>Sản phẩm yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowButton}>
          <Ionicons name="settings-outline" size={24} color="white" />
          <Text style={styles.rowText}>Cài đặt tài khoản</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButtonUser} onPress={handleLogout}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

// STYLE CHO ĐẸP
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  containerCenter: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoText: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 40 },
  input: { width: '100%', backgroundColor: '#1e1e2e', color: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  loginButton: { width: '100%', backgroundColor: '#2979ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Admin Style
  headerAdmin: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 30 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  welcomeText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: '#888', marginBottom: 15, marginTop: 10, fontSize: 12, fontWeight: 'bold' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardAdmin: { width: '48%', backgroundColor: '#1e1e2e', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardText: { color: 'white', fontWeight: 'bold' },

  rowButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', padding: 15, borderRadius: 10, marginBottom: 10 },
  rowText: { color: 'white', flex: 1, marginLeft: 15 },
  
  // User Style
  headerUser: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logoutButtonUser: { marginTop: 40, backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center' }
});