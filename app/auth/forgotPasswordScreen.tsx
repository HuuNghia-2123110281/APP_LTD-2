import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Vui lòng nhập email');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = () => {
    if (validateEmail()) {
      setIsSubmitted(true);
      
      setTimeout(() => {
        Alert.alert(
          'Đã gửi email!',
          'Vui lòng kiểm tra hộp thư để đặt lại mật khẩu',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      }, 1000);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="mail-open" size={60} color="#00e676" />
          </View>
          <Text style={styles.successTitle}>Email đã được gửi!</Text>
          <Text style={styles.successMessage}>
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
          </Text>
          <Text style={styles.successEmail}>{email}</Text>
          <Text style={styles.successNote}>
            Vui lòng kiểm tra hộp thư (kể cả thư spam)
          </Text>
          
          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            >
              <Ionicons name="chevron-back" size={26} color="#888" />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={44} color="#ffab00" />
            </View>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, error && styles.inputError]}>
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
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2979ff" />
              <Text style={styles.infoText}>
                Bạn sẽ nhận được email với liên kết để tạo mật khẩu mới
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleResetPassword}>
              <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Nhớ lại mật khẩu? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffab00',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1a2332',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2979ff',
  },
  infoText: {
    flex: 1,
    color: '#aaa',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#ffab00',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Success Screen Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#00e676',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  successEmail: {
    fontSize: 16,
    color: '#2979ff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  successNote: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 40,
  },
  backToLoginButton: {
    backgroundColor: '#2979ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});