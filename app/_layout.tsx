import React from 'react';
import { Tabs } from 'expo-router';
// Chỉ cần dùng 1 bộ Ionicons cho đồng bộ và dễ quản lý
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2979ff', 
        tabBarInactiveTintColor: '#888',  
        tabBarStyle: {
          backgroundColor: '#1e1e1e',  
          borderTopColor: '#333',
          height: 80,
          paddingBottom: 8, 
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: '#1e1e1e' }, 
        headerTintColor: 'white', 
        headerShown: false, 
      }}
    >
      {/* 1. TRANG CHỦ */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. SẢN PHẨM HOT  */}
      <Tabs.Screen
        name="hot"
        options={{
          title: 'Hot', 
          headerTitle: 'Sản phẩm Hot',
          headerShown: true, 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={26} color={color} />
          ),
        }}
      />

      {/* 3. GIỎ HÀNG */}
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

      {/* 4. HỒ SƠ */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}