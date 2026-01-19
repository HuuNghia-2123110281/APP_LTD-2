import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ApiService from '../services/api';

const PAYMENT_METHODS = [
    {
        id: 'TCB',
        name: 'Techcombank',
        // logo: require('../../assets/images/logo-tcb.png'), // Mở comment nếu đã có ảnh
        color: '#e60019', 
        getDynamicUrl: (amount: number) => 
            `https://img.vietqr.io/image/TCB-50977451512-compact.png?amount=${amount}&addInfo=Thanh toan don hang`,
        staticImage: require('../../assets/images/QR-TCB.jpg'), // Đảm bảo có ảnh này
        appLink: 'App Ngân hàng'
    },
    // Thêm các phương thức khác nếu cần...
];

export default function PaymentQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Lấy dữ liệu truyền từ Checkout
    const orderId = params.orderId ? Number(params.orderId) : null;
    const amount = params.amount ? Number(params.amount) : 0;
    const initialMethod = params.methodId ? String(params.methodId) : 'TCB';

    const [timeLeft, setTimeLeft] = useState(300); // 5 phút
    const [imageError, setImageError] = useState(false);
    
    // Ref để quản lý vòng lặp kiểm tra
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentMethod = PAYMENT_METHODS.find(m => m.id === initialMethod) || PAYMENT_METHODS[0];

    // 1. Đếm ngược thời gian
    useEffect(() => {
        if (timeLeft === 0) {
            stopPolling();
            Alert.alert("Hết giờ", "Giao dịch đã hết hạn.", [{ text: "Về Home", onPress: () => router.replace('/(tabs)/home') }]);
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // 2. POLLING: Tự động kiểm tra trạng thái mỗi 3 giây
    useEffect(() => {
        if (!orderId) return;

        const checkStatus = async () => {
            try {
                // Gọi API lấy chi tiết đơn hàng
                const order = await ApiService.getOrderDetail(orderId);
                console.log(`Checking Order #${orderId}: Status = ${order.status}`);

                if (order.status === 'PAID') {
                    stopPolling();
                    handleSuccess();
                }
            } catch (error) {
                // Lỗi mạng thì bỏ qua, đợi lần check sau
            }
        };

        // Bắt đầu vòng lặp
        intervalRef.current = setInterval(checkStatus, 3000);

        // Dọn dẹp khi thoát màn hình
        return () => stopPolling();
    }, [orderId]);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleSuccess = async () => {
        // Xóa giỏ hàng (vì đã thanh toán xong)
        await ApiService.clearCart();
        
        Alert.alert(
            "✅ THANH TOÁN THÀNH CÔNG!", 
            "Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý.", 
            [{ text: "OK", onPress: () => router.replace('/(tabs)/home') }]
        );
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    
    // Xử lý hiển thị QR
    const dynamicUrl = currentMethod.getDynamicUrl ? currentMethod.getDynamicUrl(amount) : null;
    const showStatic = !dynamicUrl || imageError;
    const qrSource = showStatic ? currentMethod.staticImage : { uri: dynamicUrl };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
                <Text style={styles.title}>Thanh toán QR</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{padding: 20, alignItems: 'center'}}>
                <Text style={styles.bankName}>{currentMethod.name}</Text>
                <Text style={[styles.amount, { color: currentMethod.color }]}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </Text>

                <View style={styles.qrFrame}>
                    <Image 
                        source={qrSource} 
                        style={styles.qrImage} 
                        resizeMode="contain"
                        onError={() => setImageError(true)}
                    />
                </View>

                {/* VÒNG XOAY ĐANG CHỜ */}
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#2979ff" />
                    <Text style={{color: 'white', marginLeft: 10}}>Đang chờ xác nhận từ ngân hàng...</Text>
                </View>

                <Text style={styles.timer}>Hết hạn trong: <Text style={{fontWeight: 'bold', color: '#ff5252'}}>{formatTime(timeLeft)}</Text></Text>

                <Text style={styles.instruct}>
                    1. Mở App {currentMethod.appLink}{"\n"}
                    2. Quét mã QR ở trên{"\n"}
                    3. Hệ thống sẽ <Text style={{fontWeight: 'bold', color: '#00e676'}}>tự động xác nhận</Text> ngay khi nhận được tiền.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#333' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    bankName: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    amount: { fontSize: 32, fontWeight: 'bold', marginVertical: 15 },
    qrFrame: { padding: 15, backgroundColor: 'white', borderRadius: 15, elevation: 5 },
    qrImage: { width: 250, height: 250 },
    loadingBox: { flexDirection: 'row', backgroundColor: '#2b2b3b', padding: 12, borderRadius: 20, marginTop: 30, alignItems: 'center', paddingHorizontal: 20 },
    timer: { color: '#aaa', marginTop: 20, fontSize: 16 },
    instruct: { color: '#888', textAlign: 'center', marginTop: 30, lineHeight: 24 }
});