import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ApiService from '../services/api';

//PHƯƠNG THỨC THANH TOÁN
const PAYMENT_METHODS = [
    {
        id: 'TCB',
        name: 'Techcombank',
        icon: 'card-outline',
        color: '#e60019',
        getDynamicUrl: (amount: number) => 
            `https://img.vietqr.io/image/TCB-50977451512-compact.png?amount=${amount}&addInfo=Thanh toan don hang`,
        staticImage: require('../../assets/images/QR-TCB.jpg'),
        appLink: 'App Techcombank'
    },
    {
        id: 'MOMO',
        name: 'MoMo',
        icon: 'wallet-outline',
        color: '#a50064',
        getDynamicUrl: (amount: number) => null, 
        staticImage: require('../../assets/images/QR-MOMO.jpg'),
        appLink: 'App MoMo'
    },
    {
        id: 'ZALOPAY',
        name: 'ZaloPay',
        icon: 'chatbubble-ellipses-outline',
        color: '#0068ff',
        getDynamicUrl: (amount: number) => null,
        staticImage: require('../../assets/images/QR-ZaloPay.jpg'),
        appLink: 'App ZaloPay'
    }
];

export default function PaymentQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const amount = params.amount ? Number(params.amount) : 0;

    // State chọn phương thức thanh toán (Mặc định chọn cái đầu tiên - TCB)
    const [selectedMethodId, setSelectedMethodId] = useState(PAYMENT_METHODS[0].id);
    
    // State kiểm soát lỗi tải ảnh động (để fallback sang tĩnh)
    const [imageError, setImageError] = useState(false);

    // Thời gian đếm ngược
    const [timeLeft, setTimeLeft] = useState(120); 

    // Lấy thông tin phương thức đang chọn
    const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethodId) || PAYMENT_METHODS[0];

    // Reset trạng thái lỗi ảnh khi đổi phương thức
    const handleSwitchMethod = (id: string) => {
        setSelectedMethodId(id);
        setImageError(false); // Reset để thử tải dynamic lại (nếu có)
    };

    // Logic đếm ngược
    useEffect(() => {
        if (timeLeft === 0) {
            Alert.alert(
                "Hết thời gian", 
                "Giao dịch đã hết hạn. Vui lòng thực hiện lại.", 
                [{ text: "Về giỏ hàng", onPress: () => router.replace('/(tabs)/cart') }]
            );
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleConfirmPayment = async () => {
        try {
            await ApiService.clearCart();
            Alert.alert(
                "Thành công", 
                "Đơn hàng đã được thanh toán và ghi nhận!", 
                [{ text: "Về trang chủ", onPress: () => router.replace('/(tabs)/home') }]
            );
        } catch (e) {
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý đơn hàng");
        }
    };

    // Xác định nguồn ảnh QR cần hiển thị
    // 1. Lấy link động
    const dynamicUrl = currentMethod.getDynamicUrl(amount);
    // 2. Quyết định: Dùng ảnh tĩnh NẾU (Link động không có HOẶC Link động bị lỗi)
    const showStatic = !dynamicUrl || imageError;
    const qrSource = showStatic ? currentMethod.staticImage : { uri: dynamicUrl };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Thanh toán QR</Text>
                <View style={{width: 24}} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* MENU CHỌN PHƯƠNG THỨC */}
                <View style={styles.methodContainer}>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity 
                            key={method.id}
                            style={[
                                styles.methodButton, 
                                selectedMethodId === method.id && { borderColor: method.color, backgroundColor: method.color + '20' }
                            ]}
                            onPress={() => handleSwitchMethod(method.id)}
                        >
                            <Ionicons 
                                name={method.icon as any} 
                                size={24} 
                                color={selectedMethodId === method.id ? method.color : '#888'} 
                            />
                            <Text style={[
                                styles.methodName,
                                selectedMethodId === method.id && { color: method.color, fontWeight: 'bold' }
                            ]}>
                                {method.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.content}>
                    <Text style={styles.label}>Tổng tiền cần thanh toán:</Text>
                    <Text style={styles.amountText}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                    </Text>
                    
                    {/* KHUNG QR CODE */}
                    <View style={styles.qrContainer}>
                        <Image 
                            source={qrSource}
                            style={styles.qrImage} 
                            resizeMode="contain"
                            onError={() => setImageError(true)} // Nếu link dynamic lỗi -> Tự chuyển static
                        />
                    </View>

                    {/* Ghi chú trạng thái mã */}
                    {showStatic && dynamicUrl && (
                        <Text style={styles.warningText}>* Đang hiển thị mã tĩnh do lỗi kết nối</Text>
                    )}
                    
                    {/* Đồng hồ đếm ngược */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerLabel}>Giao dịch kết thúc sau:</Text>
                        <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
                    </View>
                    
                    <Text style={styles.instruct}>
                        Vui lòng mở {currentMethod.appLink} và quét mã trên
                    </Text>

                    <TouchableOpacity 
                        style={[styles.btnConfirm, { backgroundColor: currentMethod.color }]} 
                        onPress={handleConfirmPayment}
                    >
                        <Text style={styles.btnText}>Tôi đã chuyển khoản</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 20, 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#333' 
    },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 40 },
    
    // Style cho Menu chọn phương thức
    methodContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 10,
        paddingHorizontal: 10
    },
    methodButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#1e1e2e',
        maxWidth: 110
    },
    methodName: {
        color: '#888',
        fontSize: 12,
        marginTop: 5
    },

    content: { alignItems: 'center', paddingHorizontal: 20 },
    label: { color: '#aaa', fontSize: 16, marginBottom: 8 },
    amountText: { color: '#00e676', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
    qrContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        elevation: 5
    },
    qrImage: { width: 220, height: 220 },
    warningText: { color: 'orange', fontSize: 12, marginBottom: 15 },
    timerContainer: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    timerLabel: { color: '#ff5252', fontSize: 14, marginBottom: 4 },
    timerValue: { color: '#ff5252', fontSize: 32, fontWeight: 'bold' },
    instruct: { color: '#aaa', marginBottom: 30, textAlign: 'center' },
    btnConfirm: { 
        paddingVertical: 16, 
        borderRadius: 12, 
        width: '100%', 
        alignItems: 'center' 
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});