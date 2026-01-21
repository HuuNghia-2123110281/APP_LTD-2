import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService from '../services/api';

const PAYMENT_METHODS = [
    {
        id: 'TCB',
        name: 'Techcombank',
        // Nếu bạn chưa có logo thì để comment lại, dùng icon mặc định
        // logo: require('../../assets/images/logo-tcb.png'), 
        color: '#e60019', 
        getDynamicUrl: (amount: number) => 
            `https://img.vietqr.io/image/TCB-50977451512-compact.png?amount=${amount}&addInfo=Thanh toan don hang`,
        staticImage: require('../../assets/images/QR-TCB.jpg'),
        appLink: 'App Ngân hàng'
    },
    {
        id: 'MOMO',
        name: 'MoMo',
        color: '#a50064', 
        getDynamicUrl: (amount: number) => null, // Momo không có dynamic link public
        staticImage: require('../../assets/images/QR-MOMO.jpg'), // Đảm bảo bạn có ảnh này hoặc đổi thành QR-TCB.jpg để test tạm
        appLink: 'App MoMo'
    }
];

export default function PaymentQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Lấy dữ liệu từ Checkout truyền sang
    const orderId = params.orderId ? Number(params.orderId) : null;
    const amount = params.amount ? Number(params.amount) : 0;
    const methodId = params.methodId ? String(params.methodId) : 'TCB';

    const [timeLeft, setTimeLeft] = useState(600); // 10 phút đếm ngược
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);

    // Tìm phương thức thanh toán tương ứng
    const currentMethod = PAYMENT_METHODS.find(m => m.id === methodId) || PAYMENT_METHODS[0];

    // Đếm ngược thời gian
    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // HÀM XỬ LÝ KHI BẤM NÚT "TÔI ĐÃ CHUYỂN KHOẢN"
    const handleConfirmPayment = async () => {
        if (!orderId) {
            Alert.alert("Lỗi", "Không tìm thấy mã đơn hàng.");
            return;
        }

        try {
            setLoading(true);

            // 1. Gọi API báo cho Backend biết đã thanh toán
            // Backend sẽ update trạng thái đơn hàng này thành PAID
            await ApiService.confirmPayment(orderId);

            // 2. Xóa giỏ hàng (vì đã mua xong)
            await ApiService.clearCart();

            // 3. Thông báo thành công và về trang chủ
            Alert.alert(
                "✅ Thành công", 
                "Hệ thống đã ghi nhận thanh toán của bạn.", 
                [{ text: "Về trang chủ", onPress: () => router.replace('/(tabs)/home') }]
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    
    // Xử lý link ảnh QR
    const dynamicUrl = currentMethod.getDynamicUrl ? currentMethod.getDynamicUrl(amount) : null;
    // Nếu link dynamic lỗi hoặc không có -> Dùng ảnh tĩnh (staticImage)
    const showStatic = !dynamicUrl || imageError;
    const qrSource = showStatic ? currentMethod.staticImage : { uri: dynamicUrl || '' };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Thanh toán QR</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{padding: 20, alignItems: 'center', paddingBottom: 100}}>
                <Text style={styles.bankName}>{currentMethod.name}</Text>
                
                <Text style={styles.label}>Tổng tiền cần thanh toán</Text>
                <Text style={[styles.amount, { color: currentMethod.color }]}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </Text>

                {/* KHUNG QR CODE */}
                <View style={styles.qrFrame}>
                    <Image 
                        source={qrSource} 
                        style={styles.qrImage} 
                        resizeMode="contain"
                        onError={() => setImageError(true)}
                    />
                </View>

                <Text style={styles.timer}>Giao dịch kết thúc sau: <Text style={{fontWeight: 'bold', color: '#ff5252'}}>{formatTime(timeLeft)}</Text></Text>

                <View style={styles.instructBox}>
                    <Text style={styles.instructTitle}>HƯỚNG DẪN:</Text>
                    <Text style={styles.instructText}>1. Mở App {currentMethod.appLink}</Text>
                    <Text style={styles.instructText}>2. Quét mã QR ở trên để chuyển khoản</Text>
                    <Text style={styles.instructText}>3. Sau khi chuyển xong, bấm nút xác nhận bên dưới</Text>
                </View>
            </ScrollView>

            {/* NÚT BẤM XÁC NHẬN THỦ CÔNG */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.confirmBtn, { backgroundColor: currentMethod.color }]} 
                    onPress={handleConfirmPayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.btnText}>TÔI ĐÃ CHUYỂN KHOẢN XONG</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#333' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    bankName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    label: { color: '#aaa', marginTop: 5, fontSize: 14 },
    amount: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, marginTop: 5 },
    qrFrame: { padding: 15, backgroundColor: 'white', borderRadius: 16, elevation: 5 },
    qrImage: { width: 250, height: 250 },
    timer: { color: '#aaa', marginTop: 25, fontSize: 16 },
    instructBox: { marginTop: 30, backgroundColor: '#1e1e2e', padding: 20, borderRadius: 12, width: '100%' },
    instructTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 10 },
    instructText: { color: '#ccc', marginBottom: 6, lineHeight: 22 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#1e1e1e', borderTopWidth: 1, borderColor: '#333' },
    confirmBtn: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});