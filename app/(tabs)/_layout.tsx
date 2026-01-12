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
      {/* 1. TRANG CHỦ */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. YÊU THÍCH  */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          headerShown: false, // Ẩn header mặc định để dùng header của trang favorites
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. NỔI BẬT */}
      <Tabs.Screen
        name="hot"
        options={{
          title: 'Nổi bật',
          headerShown: true,
          headerTitle: 'Sản phẩm bán chạy',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={26} color={color} />
          ),
        }}
      />

      {/* 4. GIỎ HÀNG */}
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

      {/* 5. TÀI KHOẢN */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}