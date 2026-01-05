// app/components/LoginForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Demo: chỉ cần có email & password là “đăng nhập thành công”
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    Alert.alert('Thành công', 'Đăng nhập thành công (demo)', [
      {
        text: 'OK',
        onPress: () => {
          // điều hướng sang trang /home
          router.replace('/home');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Đăng nhập</Text>
      </Pressable>

      <Pressable onPress={onSwitchToRegister}>
        <Text style={styles.switchText}>Tạo tài khoản mới</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    color: '#FFFFFF',
  },
  loginBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    color: '#38BDF8',
    fontSize: 14,
  },
});
