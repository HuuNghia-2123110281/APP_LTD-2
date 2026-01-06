import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ScrollView, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thư viện lưu trữ

export default function ProfileScreen() {
  const router = useRouter();
  
  // === CẤU HÌNH IP ===
  const BASE_URL = 'http://172.20.10.2:8080';
  const AUTH_API_URL = `${BASE_URL}/api/auth/login`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // 1. Tự động kiểm tra đăng nhập khi mở App
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const name = await AsyncStorage.getItem('userName');
        const role = await AsyncStorage.getItem('userRole');

        if (token) {
          setIsLoggedIn(true);
          setUserName(name || 'Người dùng');
          setUserRole(role || 'USER');
        }
      } catch (error) {
        console.error("Lỗi đọc bộ nhớ:", error);
      }
    };
    checkLoginStatus();
  }, []);

  // 2. Hàm xử lý Đăng nhập
  const handleLogin = async () => {
    // Logic đăng nhập cứng để test nhanh (khi chưa có server Auth)
    let role = '';
    let name = '';
    let isSuccess = false;

    if (usernameInput === 'admin' && passwordInput === '123') {
      role = 'ADMIN'; name = 'Admin Cục Bộ'; isSuccess = true;
    } else if (usernameInput === 'user' && passwordInput === '123') {
      role = 'USER'; name = 'Khách Hàng'; isSuccess = true;
    } 
    // Nếu bạn đã làm API Auth ở Backend thì mở đoạn này ra dùng:
    
    try {
      const response = await fetch(AUTH_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await response.json();
      if(data.status === 'success') {
          role = data.role; name = data.name; isSuccess = true;
      }
    } catch(e) {} 
    

    if (isSuccess) {
      // === QUAN TRỌNG: Lưu vé vào bộ nhớ ===
      await AsyncStorage.setItem('userToken', 'logged-in');
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userRole', role);

      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name);
      Alert.alert("Thành công", `Xin chào ${name}!`);
    } else {
      Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu! (Thử: admin/123)");
    }
  };

  // 3. Hàm Đăng xuất
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUserRole('');
    setUsernameInput('');
    setPasswordInput('');
  };

  // === GIAO DIỆN ===
  
  // A. CHƯA ĐĂNG NHẬP
  if (!isLoggedIn) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.logoText}>NghiaShop ID</Text>
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

  // B. ĐÃ ĐĂNG NHẬP (ADMIN)
  if (userRole === 'ADMIN') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
        <View style={styles.headerAdmin}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png' }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>ADMIN DASHBOARD</Text>
            <Text style={{color: '#aaa'}}>{userName}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>QUẢN LÝ CỬA HÀNG</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Admin", "Mở chức năng thêm sản phẩm")}>
            <View style={[styles.iconBox, {backgroundColor: '#e3f2fd'}]}>
               <MaterialCommunityIcons name="cube-outline" size={32} color="#2196f3" />
            </View>
            <Text style={styles.cardText}>QL Sản phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAdmin} onPress={() => Alert.alert("Admin", "Xem doanh thu")}>
             <View style={[styles.iconBox, {backgroundColor: '#fce4ec'}]}>
               <Ionicons name="bar-chart-outline" size={32} color="#e91e63" />
            </View>
            <Text style={styles.cardText}>Thống kê</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.rowButton, {marginTop: 40, borderColor: '#ff5252'}]} onPress={handleLogout}>
          <Text style={{color: '#ff5252', fontWeight: 'bold'}}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // C. ĐÃ ĐĂNG NHẬP (USER THƯỜNG)
  return (
    <View style={styles.container}>
      <View style={styles.headerUser}>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
        <Text style={styles.welcomeText}>{userName}</Text>
        <Text style={{color: '#00e676'}}>Thành viên thân thiết</Text>
      </View>

      <View style={{marginTop: 20}}>
        <TouchableOpacity style={styles.rowButton} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text style={styles.rowText}>Đơn hàng của tôi</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButtonUser} onPress={handleLogout}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  containerCenter: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoText: { fontSize: 30, fontWeight: 'bold', marginBottom: 40, color: '#2979ff' },
  input: { width: '100%', backgroundColor: '#1e1e2e', color: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  loginButton: { width: '100%', backgroundColor: '#2979ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
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
  headerUser: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logoutButtonUser: { marginTop: 40, backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center' }
});