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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // State quản lý luồng (Step 1: Nhập Email, Step 2: Nhập OTP & Pass mới)
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- BƯỚC 1: GỬI OTP ---
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    // Validate email đơn giản
    if (!email.includes('@')) {
       Alert.alert('Lỗi', 'Email không hợp lệ');
       return;
    }

    setLoading(true);
    try {
      await ApiService.sendOtp(email);
      Alert.alert('Thành công', 'Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.');
      setStep(2); // Chuyển sang màn hình nhập OTP
    } catch (error) {
      Alert.alert('Thất bại', error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 2: XÁC NHẬN OTP & ĐỔI PASS ---
  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await ApiService.resetPassword({
        email: email,
        otp: otp,
        newPassword: newPassword
      });

      Alert.alert(
        'Thành công',
        'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
        [{ text: 'Về Đăng nhập', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Thất bại', error instanceof Error ? error.message : 'Có lỗi xảy ra');
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
          {/* Nút Back: Nếu đang ở step 2 thì quay về step 1 */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => step === 1 ? router.back() : setStep(1)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={step === 1 ? "mail-outline" : "shield-checkmark-outline"} 
                size={40} 
                color="#2979ff" 
              />
            </View>
            <Text style={styles.title}>
                {step === 1 ? "Quên mật khẩu?" : "Xác thực OTP"}
            </Text>
            <Text style={styles.subtitle}>
                {step === 1 
                    ? "Nhập email đã đăng ký để nhận mã xác thực." 
                    : `Nhập mã OTP 6 số đã gửi tới ${email} và mật khẩu mới.`}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              /* --- FORM BƯỚC 1: NHẬP EMAIL --- */
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email đăng ký</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#555"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : (
              /* --- FORM BƯỚC 2: NHẬP OTP & PASS MỚI --- */
              <>
                {/* OTP Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mã OTP (6 số)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad-outline" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mã OTP"
                      placeholderTextColor="#555"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="#555"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#555"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={step === 1 ? handleSendOtp : handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                    {step === 1 ? "Gửi mã xác thực" : "Đổi mật khẩu"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 20 },
  backButton: { marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(41, 121, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#2979ff'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { color: '#888', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  form: { backgroundColor: '#1e1e2e', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#ccc', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2b2b3b',
    borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333', height: 50
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  button: {
    backgroundColor: '#2979ff', height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});