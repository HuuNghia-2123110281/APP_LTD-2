import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

export default function PaymentQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const orderId = params.orderId ? Number(params.orderId) : null;
    const orderCode = params.orderCode ? Number(params.orderCode) : null;
    const amount = params.amount ? Number(params.amount) : 0;
    const qrCode = params.qrCode ? String(params.qrCode) : '';
    const methodId = params.methodId ? String(params.methodId) : 'MB';

    const [timeLeft, setTimeLeft] = useState(600); // 10 phút
    const [checking, setChecking] = useState(false);
    const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sử dụng QR code trực tiếp từ PayOS response
    const qrCodeUrl = qrCode || '';

    // Đếm ngược thời gian
    useEffect(() => {
        if (timeLeft === 0) {
            clearCheckInterval();
            Alert.alert(
                'Hết thời gian',
                'Phiên thanh toán đã hết hạn',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, router]);

    // Tự động kiểm tra trạng thái thanh toán mỗi 3 giây
    useEffect(() => {
        if (!orderCode) return;

        checkPaymentStatus();

        checkIntervalRef.current = setInterval(() => {
            checkPaymentStatus();
        }, 6000);

        return () => clearCheckInterval();
    }, [orderCode]);

    const clearCheckInterval = () => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    };

    const checkPaymentStatus = async () => {
        if (!orderCode || checking) return;

        try {
            setChecking(true);
            const result = await ApiService.verifyPayment(orderCode);

            if (result.success && result.isPaid) {
                clearCheckInterval();

                // Xóa giỏ hàng
                await ApiService.clearCart();

                Alert.alert(
                    '✅ Thanh toán thành công',
                    'Đơn hàng của bạn đã được xác nhận!',
                    [
                        {
                            text: 'Xem đơn hàng',
                            onPress: () => router.replace('/orders/OrdersScreen')
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Check payment error:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleManualCheck = async () => {
        if (!orderCode) {
            Alert.alert('Lỗi', 'Không tìm thấy mã thanh toán');
            return;
        }

        try {
            setChecking(true);
            const result = await ApiService.verifyPayment(orderCode);

            if (result.success && result.isPaid) {
                clearCheckInterval();

                await ApiService.clearCart();

                Alert.alert(
                    '✅ Thanh toán thành công',
                    'Đơn hàng của bạn đã được xác nhận!',
                    [
                        {
                            text: 'Xem đơn hàng',
                            onPress: () => router.replace('/orders/OrdersScreen')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Chưa thanh toán',
                    'Hệ thống chưa nhận được thanh toán. Vui lòng thử lại sau vài giây.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán');
        } finally {
            setChecking(false);
        }
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMethodColor = () => {
        switch (methodId) {
            case 'MB': return '#e60019';
            case 'MOMO': return '#a50064';
            default: return '#2979ff';
        }
    };

    const getMethodName = () => {
        switch (methodId) {
            case 'MB': return 'MbBank';
            case 'MOMO': return 'MoMo';
            default: return 'PayOS';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    clearCheckInterval();
                    router.back();
                }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Thanh toán QR</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.bankName}>{getMethodName()}</Text>

                <Text style={styles.label}>Tổng tiền cần thanh toán</Text>
                <Text style={[styles.amount, { color: getMethodColor() }]}>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(amount)}
                </Text>

                {/* QR CODE */}
                <View style={styles.qrFrame}>
                    {qrCodeUrl ? (
                        <Image
                            source={{ uri: qrCodeUrl }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.qrPlaceholder}>
                            <ActivityIndicator size="large" color="#888" />
                            <Text style={styles.qrPlaceholderText}>
                                Đang tải QR code...
                            </Text>
                        </View>
                    )}
                </View>

                {/* Trạng thái checking */}
                {checking && (
                    <View style={styles.checkingStatus}>
                        <ActivityIndicator size="small" color="#2979ff" />
                        <Text style={styles.checkingText}>
                            Đang kiểm tra thanh toán...
                        </Text>
                    </View>
                )}

                {/* Timer */}
                <Text style={styles.timer}>
                    Giao dịch kết thúc sau:
                    <Text style={styles.timerBold}> {formatTime(timeLeft)}</Text>
                </Text>

                {/* Hướng dẫn */}
                <View style={styles.instructBox}>
                    <Text style={styles.instructTitle}>HƯỚNG DẪN:</Text>
                    <Text style={styles.instructText}>
                        1. Mở App Banking hoặc {getMethodName()}
                    </Text>
                    <Text style={styles.instructText}>
                        2. Quét mã QR ở trên để chuyển khoản
                    </Text>
                    <Text style={styles.instructText}>
                        3. Hệ thống sẽ tự động xác nhận thanh toán sau 3 giây
                    </Text>
                    <Text style={styles.instructText}>
                        4. Hoặc bấm Kiểm tra thanh toán để kiểm tra thủ công
                    </Text>
                </View>

                {/* Thông tin order */}
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                        <Text style={styles.infoValue}>#{orderId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã thanh toán:</Text>
                        <Text style={styles.infoValue}>{orderCode}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer với nút kiểm tra */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkBtn, { borderColor: getMethodColor() }]}
                    onPress={handleManualCheck}
                    disabled={checking}
                >
                    {checking ? (
                        <ActivityIndicator color={getMethodColor()} />
                    ) : (
                        <>
                            <Ionicons name="refresh" size={20} color={getMethodColor()} />
                            <Text style={[styles.checkBtnText, { color: getMethodColor() }]}>
                                KIỂM TRA THANH TOÁN
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                    * Hệ thống đang tự động kiểm tra mỗi 3 giây
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#333'
    },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 180
    },
    bankName: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10
    },
    label: { color: '#aaa', marginTop: 5, fontSize: 14 },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 5
    },
    qrFrame: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 5,
        minHeight: 280,
        minWidth: 280,
        justifyContent: 'center',
        alignItems: 'center'
    },
    qrImage: { width: 250, height: 250 },
    qrPlaceholder: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15
    },
    qrPlaceholderText: { color: '#888', fontSize: 14 },
    checkingStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 15,
        padding: 10,
        backgroundColor: '#1e1e2e',
        borderRadius: 8
    },
    checkingText: { color: '#2979ff', fontSize: 14 },
    timer: {
        color: '#aaa',
        marginTop: 25,
        fontSize: 16
    },
    timerBold: {
        fontWeight: 'bold',
        color: '#ff5252'
    },
    instructBox: {
        marginTop: 30,
        backgroundColor: '#1e1e2e',
        padding: 20,
        borderRadius: 12,
        width: '100%'
    },
    instructTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16
    },
    instructText: {
        color: '#ccc',
        marginBottom: 6,
        lineHeight: 22
    },
    infoBox: {
        marginTop: 20,
        backgroundColor: '#2b2b3b',
        padding: 15,
        borderRadius: 12,
        width: '100%'
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    infoLabel: { color: '#aaa', fontSize: 14 },
    infoValue: { color: 'white', fontSize: 14, fontWeight: '500' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderTopWidth: 1,
        borderColor: '#333'
    },
    checkBtn: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
        borderWidth: 2,
        backgroundColor: 'transparent'
    },
    checkBtnText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    footerNote: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10
    }
});