import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ApiService from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.login({
        email,
        password,
      });

      // Đăng nhập thành công
      Alert.alert(
        'Thành công!',
        'Đăng nhập thành công',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error) {
      // Hiển thị lỗi
      Alert.alert(
        'Đăng nhập thất bại',
        error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="laptop" size={44} color="#2979ff" />
            </View>
            <Text style={styles.title}>NghiaShop</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgotPasswordScreen')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <Ionicons name="logo-google" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <Ionicons name="logo-facebook" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <Ionicons name="logo-apple" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')} disabled={loading}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2979ff',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
  },
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#2b2b3b',
  },
  inputError: {
    borderColor: '#ff5252',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#fff',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2979ff',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2979ff',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2b2b3b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerLink: {
    color: '#2979ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});