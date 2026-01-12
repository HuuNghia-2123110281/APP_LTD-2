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

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    } else if (fullName.length < 3) {
      newErrors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ApiService.register({
        fullName,
        email,
        password,
      });

      // Đăng ký thành công
      Alert.alert(
        'Đăng ký thành công!',
        `Chào mừng ${fullName} đến với NghiaShop`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error) {
      // Hiển thị lỗi
      Alert.alert(
        'Đăng ký thất bại',
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Ionicons name="chevron-back" size={26} color="#888" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="laptop" size={44} color="#00e676" />
            </View>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#555"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Email */}
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

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="0123456789"
                  placeholderTextColor="#555"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#121212" />
              ) : (
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')} disabled={loading}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
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
    borderColor: '#00e676',
  },
  title: {
    fontSize: 30,
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
    marginBottom: 18,
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
  registerButton: {
    backgroundColor: '#00e676',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#2979ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});