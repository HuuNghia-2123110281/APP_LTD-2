import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService, { Address, CartItem } from './services/api';

export default function CheckoutScreen() {
    const router = useRouter();
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [apiTotalPrice, setApiTotalPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('TCB'); // Mặc định chọn Online (TCB)
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const cartRes = await ApiService.getCart();
            if (cartRes && cartRes.items) {
                setCartItems(cartRes.items);
                setApiTotalPrice(cartRes.totalPrice);
            }
            const addresses = await ApiService.getAddresses();
            if (addresses.length > 0) setSelectedAddress(addresses.find(a => a.isDefault) || addresses[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const shippingFee = 30000;
    const finalTotal = apiTotalPrice + shippingFee;

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }
        if (cartItems.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm');
            return;
        }

        // ============================================================
        // LOGIC MỚI: TẠO ĐƠN HÀNG TRÊN SERVER TRƯỚC
        // ============================================================
        
        // 1. Chuẩn bị dữ liệu
        const orderData = {
            addressId: selectedAddress.id,
            paymentMethod: paymentMethod, // 'TCB', 'MOMO', 'COD', v.v.
            totalPrice: finalTotal,
            items: cartItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }))
        };

        try {
            setLoading(true);

            // 2. Nếu là COD (Thanh toán khi nhận hàng)
            if (paymentMethod === 'COD') {
                await ApiService.createOrder(orderData); // Tạo đơn PENDING
                // Với COD thì coi như xong luôn, clear cart và về Home
                await ApiService.clearCart();
                Alert.alert('Thành công', 'Đặt hàng thành công!', [
                    { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
                ]);
                return;
            }

            // 3. Nếu là Online (TCB, MOMO, ZALOPAY...)
            // Gọi API tạo đơn -> Nhận về ID đơn hàng
            const newOrder = await ApiService.createOrder(orderData);
            
            // Chuyển sang màn hình QR, truyền ID đơn hàng đi
            router.push({
                pathname: '/payment/payment-qr',
                params: {
                    orderId: newOrder.id, // Quan trọng: ID để check trạng thái
                    amount: finalTotal,
                    methodId: paymentMethod
                }
            });

        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#2979ff" style={{marginTop: 50}} /></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* ĐỊA CHỈ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                    {selectedAddress ? (
                        <View>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>{selectedAddress.receiverName} - {selectedAddress.phone}</Text>
                            <Text style={{color: '#aaa'}}>{selectedAddress.address}</Text>
                        </View>
                    ) : (
                        <Text style={{color: '#aaa'}}>Chưa chọn địa chỉ</Text>
                    )}
                </View>

                {/* PHƯƠNG THỨC THANH TOÁN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    
                    {/* Nút chọn TCB */}
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'TCB' && styles.activeOption]} 
                        onPress={() => setPaymentMethod('TCB')}
                    >
                        <Ionicons name="card-outline" size={24} color={paymentMethod === 'TCB' ? '#2979ff' : '#888'} />
                        <Text style={styles.paymentText}>Chuyển khoản Ngân hàng (QR)</Text>
                        {paymentMethod === 'TCB' && <Ionicons name="checkmark-circle" size={20} color="#2979ff"/>}
                    </TouchableOpacity>

                    {/* Nút chọn COD */}
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'COD' && styles.activeOption]} 
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Ionicons name="cash-outline" size={24} color={paymentMethod === 'COD' ? '#2979ff' : '#888'} />
                        <Text style={styles.paymentText}>Thanh toán khi nhận hàng</Text>
                        {paymentMethod === 'COD' && <Ionicons name="checkmark-circle" size={20} color="#2979ff"/>}
                    </TouchableOpacity>
                </View>

                {/* TỔNG TIỀN */}
                <View style={styles.section}>
                    <View style={styles.row}><Text style={styles.label}>Tạm tính</Text><Text style={styles.value}>{formatCurrency(apiTotalPrice)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Phí ship</Text><Text style={styles.value}>{formatCurrency(shippingFee)}</Text></View>
                    <View style={[styles.row, {marginTop: 10, borderTopWidth: 1, borderColor: '#333', paddingTop: 10}]}>
                        <Text style={[styles.label, {color: 'white', fontWeight: 'bold'}]}>Tổng cộng</Text>
                        <Text style={{color: '#00e676', fontSize: 18, fontWeight: 'bold'}}>{formatCurrency(finalTotal)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.checkoutBtn} onPress={handlePlaceOrder}>
                    <Text style={styles.checkoutBtnText}>ĐẶT HÀNG</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 15 },
    section: { backgroundColor: '#1e1e2e', padding: 15, borderRadius: 10, marginBottom: 15 },
    sectionTitle: { color: '#aaa', marginBottom: 10, fontSize: 14, textTransform: 'uppercase' },
    paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 8, backgroundColor: '#2b2b3b', marginBottom: 10, gap: 10 },
    activeOption: { borderColor: '#2979ff', borderWidth: 1, backgroundColor: 'rgba(41, 121, 255, 0.1)' },
    paymentText: { color: 'white', flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { color: '#aaa' },
    value: { color: 'white' },
    footer: { padding: 20, backgroundColor: '#1e1e1e' },
    checkoutBtn: { backgroundColor: '#2979ff', padding: 15, borderRadius: 10, alignItems: 'center' },
    checkoutBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});