// components/RegisterForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    console.log('Register:', { name, email, password });
    Alert.alert('Thành công', 'Đăng ký thành công (demo)');
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.field}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyễn Văn A"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.primaryButtonText}>Đăng ký</Text>
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Đã có tài khoản? </Text>
        <Pressable onPress={onSwitchToLogin}>
          <Text style={styles.switchLink}>Đăng nhập</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { gap: 16 },

  field: { gap: 6 },

  label: { fontSize: 14, color: '#D1D5DB' },

  input: {
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },

  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },

  switchText: { fontSize: 13, color: '#D1D5DB' },

  switchLink: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
});
