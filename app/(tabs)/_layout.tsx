import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2979ff', 
        tabBarInactiveTintColor: '#888',  
        
        tabBarStyle: {
          backgroundColor: '#1e1e1e',     
          borderTopColor: '#333',         
          height: Platform.OS === 'ios' ? 85 : 65, 
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 5,
        },
        
        headerStyle: { backgroundColor: '#1e1e1e' },
        headerTintColor: 'white',
        headerShown: false, 
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="hot"
        options={{
          title: 'Nổi bật',
          headerShown: true, // Trang này hiện header đơn giản
          headerTitle: 'Sản phẩm bán chạy',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={26} color={color} />
          ),
        }}
      />

      {/* 3. GIỎ HÀNG (cart.tsx) */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={26} color={color} />
          ),
        }}
      />

      {/* 4. TÀI KHOẢN (profile.tsx) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          headerShown: false, // Ẩn header để làm giao diện profile đẹp hơn
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}