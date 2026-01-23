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
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không đúng định dạng');
      return;
    }

    setLoading(true);
    try {
      await ApiService.sendOtp(email);
      Alert.alert('Đã gửi mã', `Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư.`);
      setStep(2);
    } catch (error) {
      Alert.alert('Gửi thất bại', error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 2: KIỂM TRA OTP ---
  const handleVerifyOtpNext = () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP gồm 6 chữ số');
      return;
    }
    setStep(3);
  };

  // --- BƯỚC 3: GỌI API ĐỔI PASS ---
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
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
      Alert.alert(
        'Thất bại',
        error instanceof Error ? error.message : 'Mã OTP không đúng hoặc đã hết hạn',
        [
          { text: 'Thử lại OTP', onPress: () => setStep(2) },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else router.back();
  };

  // --- FIX LỖI TYPE Ở ĐÂY ---
  const renderHeader = () => {
    // Khai báo rõ kiểu dữ liệu cho iconName là một trong các tên icon hợp lệ
    // Thay vì để TypeScript tự suy luận là string chung chung
    let iconName: "mail-open-outline" | "keypad-outline" | "shield-checkmark-outline" = "mail-open-outline";

    let titleText = "Quên mật khẩu?";
    let subText = "Nhập email liên kết với tài khoản của bạn để nhận mã xác thực.";

    if (step === 2) {
      iconName = "keypad-outline";
      titleText = "Nhập mã OTP";
      subText = `Chúng tôi đã gửi mã 6 số tới ${email}.`;
    } else if (step === 3) {
      iconName = "shield-checkmark-outline";
      titleText = "Đặt lại mật khẩu";
      subText = "Vui lòng nhập mật khẩu mới cho tài khoản của bạn.";
    }

    return (
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={40} color="#2979ff" />
        </View>
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.subtitle}>{subText}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {renderHeader()}

          <View style={styles.form}>
            {/* --- STEP 1 --- */}
            {step === 1 && (
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
            )}

            {/* --- STEP 2 --- */}
            {step === 2 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã OTP (6 số)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="keypad-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 123456"
                    placeholderTextColor="#555"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus={true}
                  />
                </View>
              </View>
            )}

            {/* --- STEP 3 --- */}
            {step === 3 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Tối thiểu 6 ký tự"
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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => {
                if (step === 1) handleSendOtp();
                else if (step === 2) handleVerifyOtpNext();
                else handleResetPassword();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {step === 1 ? "Gửi mã xác thực" : (step === 2 ? "Tiếp tục" : "Đổi mật khẩu")}
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
  backButton: { marginBottom: 20, alignSelf: 'flex-start' },
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
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: "#2979ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  buttonDisabled: { opacity: 0.7, backgroundColor: '#5c6b7f' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});