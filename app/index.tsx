import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function Index() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Hiệu ứng xuất hiện
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Chuyển hướng sau 2.5 giây
    const timer = setTimeout(() => {
      // Chuyển vào (tabs) thay vì login, để khách hàng có thể xem sản phẩm ngay
      router.replace('/auth/login'); 
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* Gradient màu Tối / Gaming */}
      <LinearGradient
        colors={['#1e1e1e', '#121212', '#000000']}
        style={styles.gradient}>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          
          <View style={styles.logoWrapper}>
            <Ionicons name="laptop-outline" size={80} color="#2979ff" />

          </View>

          <View style={styles.textContainer}>
            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              NghiaShop
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
              Premium Laptop & Gear
            </Animated.Text>
          </View>

        </Animated.View>

        {/* Loading nhỏ ở dưới */}
        <View style={{ position: 'absolute', bottom: 50 }}>
            <Text style={{ color: '#555', fontSize: 12 }}>Loading data...</Text>
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2b2b3b', // Màu nền tròn logo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2979ff', // Viền xanh Gaming
    shadowColor: "#2979ff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  textContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    fontWeight: '500',
  },
});