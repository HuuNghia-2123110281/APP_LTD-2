// app/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

type AuthMode = 'login' | 'register';

export default function Index() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <View style={styles.screen}>
      <Text style={styles.appTitle}>NghiaShop</Text>
      <Text style={styles.appSubtitle}>
        {mode === 'login'
          ? 'Đăng nhập để tiếp tục'
          : 'Tạo tài khoản mới để bắt đầu mua sắm'}
      </Text>

      {mode === 'login' ? (
        <LoginForm onSwitchToRegister={() => setMode('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#020617', // nền tối
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#D1D5DB',
    marginBottom: 24,
  },
});
