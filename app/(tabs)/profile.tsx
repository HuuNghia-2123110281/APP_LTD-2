import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- IMPORT
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ApiService from '../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState(''); // <--- State lưu role

  const checkLoginStatus = async () => {
    try {
      const isAuth = await ApiService.isAuthenticated();
      if (isAuth) {
        const email = await ApiService.getUserEmail();
        const role = await AsyncStorage.getItem('userRole'); // <--- Lấy Role

        setIsLoggedIn(true);
        setUserEmail(email || 'Khách hàng');
        setUserRole(role || '');
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        setUserRole('');
      }
    } catch (error) {
      console.error('Lỗi kiểm tra đăng nhập:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      // Xóa thêm các key thủ công nếu ApiService.logout chưa xóa hết
      await AsyncStorage.removeItem('userRole');
      
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');

      router.replace('/auth/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="person-circle-outline" size={120} color="#555" />
          <Text style={styles.title}>Chưa đăng nhập</Text>
          <Text style={styles.subtitle}>Đăng nhập để xem đơn hàng và ưu đãi</Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="white" style={styles.btnIcon} />
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="white" />
          </View>
          <Text style={styles.title}>Xin chào!</Text>
          <Text style={styles.email}>{userEmail}</Text>
          
          {/* Hiển thị Badge Admin nếu là Admin */}
          {userRole === 'ROLE_ADMIN' && (
             <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
             </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          
          {/* --- NÚT ADMIN: CHỈ HIỆN KHI LÀ ROLE_ADMIN --- */}
          {userRole === 'ROLE_ADMIN' && (
            <TouchableOpacity
              style={[styles.menuItem, styles.adminMenuItem]} // Thêm style đặc biệt
              onPress={() => router.push('/admin/orders')}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#8e44ad' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color="white" />
              </View>
              <Text style={[styles.menuText, { color: '#a29bfe', fontWeight: 'bold' }]}>
                QUẢN LÝ ĐƠN HÀNG (ADMIN)
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#a29bfe" />
            </TouchableOpacity>
          )}
          {/* --------------------------------------------- */}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/orders/OrdersScreen')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="receipt-outline" size={22} color="#2979ff" />
            </View>
            <Text style={styles.menuText}>Đơn hàng của tôi</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/address/list')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="location-outline" size={22} color="#2979ff" />
            </View>
            <Text style={styles.menuText}>Địa chỉ giao hàng</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/SettingsScreen')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="settings-outline" size={22} color="#2979ff" />
            </View>
            <Text style={styles.menuText}>Cài đặt tài khoản</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ff5252" style={styles.btnIcon} />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContent: { padding: 20, alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#2b2b3b',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 2, borderColor: '#2979ff'
  },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#888', fontSize: 14, marginTop: 5, marginBottom: 30, textAlign: 'center' },
  email: { color: '#2979ff', fontSize: 16, fontWeight: '500' },
  
  // Badge Admin
  adminBadge: {
    marginTop: 8, backgroundColor: '#8e44ad', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 8
  },
  adminBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  loginButton: {
    flexDirection: 'row', backgroundColor: '#2979ff', width: '100%',
    paddingVertical: 15, borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginBottom: 15
  },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  registerButton: {
    width: '100%', paddingVertical: 15, borderRadius: 12, borderWidth: 1,
    borderColor: '#2979ff', alignItems: 'center', justifyContent: 'center'
  },
  registerButtonText: { color: '#2979ff', fontSize: 16, fontWeight: 'bold' },
  btnIcon: { marginRight: 8 },
  
  menuContainer: {
    width: '100%', backgroundColor: '#1e1e2e', borderRadius: 16,
    paddingHorizontal: 15, paddingVertical: 5, marginBottom: 30,
    borderWidth: 1, borderColor: '#333'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#2b2b3b'
  },
  // Style đặc biệt cho dòng Admin
  adminMenuItem: {
    backgroundColor: 'rgba(142, 68, 173, 0.1)', // Màu nền tím nhạt
    marginHorizontal: -15, paddingHorizontal: 15, // Kéo rộng ra lề
    borderTopLeftRadius: 16, borderTopRightRadius: 16, // Bo góc trên
    marginBottom: 5, borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(41, 121, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  menuText: { flex: 1, color: 'white', fontSize: 15, fontWeight: '500' },
  
  logoutButton: {
    flexDirection: 'row', backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', width: '100%', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.3)'
  },
  logoutButtonText: { color: '#ff5252', fontSize: 16, fontWeight: 'bold' },
});