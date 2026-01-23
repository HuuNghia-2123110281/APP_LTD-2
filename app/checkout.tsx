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
    const [paymentMethod, setPaymentMethod] = useState('MB');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Load giỏ hàng
            console.log('📦 Loading cart data...');
            const cartRes = await ApiService.getCart();

            console.log('🛒 Cart Response:', {
                itemCount: cartRes.items?.length || 0,
                totalPrice: cartRes.totalPrice,
                items: cartRes.items?.map(item => ({
                    cartItemId: item.id,
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                }))
            });

            if (cartRes && cartRes.items) {
                setCartItems(cartRes.items);
                setApiTotalPrice(cartRes.totalPrice);
                console.log(`✅ Loaded ${cartRes.items.length} items, total: ${cartRes.totalPrice}`);
            } else {
                console.warn('⚠️ Cart is empty');
                setCartItems([]);
                setApiTotalPrice(0);
            }

            // 2. Load địa chỉ
            console.log('📍 Loading addresses...');
            const addresses = await ApiService.getAddresses();
            console.log(`✅ Loaded ${addresses.length} addresses`);

            if (addresses.length > 0) {
                const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                setSelectedAddress(defaultAddr);
                console.log('✅ Selected address:', {
                    id: defaultAddr.id,
                    name: defaultAddr.receiverName,
                    phone: defaultAddr.phone
                });
            } else {
                console.warn('⚠️ No addresses found');
            }

        } catch (error) {
            console.error('❌ Load data error:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const shippingFee = 3000;
    const finalTotal = apiTotalPrice + shippingFee;

    const handlePlaceOrder = async () => {
        // 1. Validation
        if (!selectedAddress) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
            return;
        }

        // 2. Tạo order data với đầy đủ thông tin
        const orderData = {
            addressId: selectedAddress.id,
            paymentMethod: paymentMethod,
            totalPrice: finalTotal,
            items: cartItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.price // Giá tại thời điểm đặt hàng
            }))
        };

        console.log('📤 Order Data to send:', JSON.stringify(orderData, null, 2));

        try {
            setLoading(true);

            // 3. Tạo đơn hàng
            console.log('🔄 Creating order...');
            const newOrder = await ApiService.createOrder(orderData);
            console.log('✅ Order created successfully:', {
                orderId: newOrder.id,
                status: newOrder.status,
                totalPrice: newOrder.totalPrice,
                itemCount: newOrder.items?.length || 0
            });

            // 4. Xử lý theo phương thức thanh toán
            if (paymentMethod === 'COD') {
                // COD: Xóa giỏ hàng và chuyển trang
                console.log('💵 COD payment - clearing cart...');
                await ApiService.clearCart();

                Alert.alert(
                    '✅ Đặt hàng thành công',
                    'Đơn hàng của bạn đã được tạo. Vui lòng thanh toán khi nhận hàng.',
                    [
                        {
                            text: 'Xem đơn hàng',
                            onPress: () => router.replace('/orders/OrdersScreen')
                        }
                    ]
                );
            } else {
                // ONLINE PAYMENT: Tạo payment QR
                console.log('💳 Creating online payment...');
                const paymentData = {
                    orderId: newOrder.id,
                    amount: finalTotal,
                    returnUrl: 'myapp://payment-success',
                    cancelUrl: 'myapp://payment-cancel'
                };

                const paymentResult = await ApiService.createPayment(paymentData);
                console.log('✅ Payment created:', {
                    success: paymentResult.success,
                    orderCode: paymentResult.orderCode,
                    hasQrCode: !!paymentResult.qrCode
                });

                if (paymentResult.success && paymentResult.qrCode) {
                    // Chuyển sang màn hình QR
                    router.push({
                        pathname: '/payment/payment-qr',
                        params: {
                            orderId: newOrder.id,
                            orderCode: paymentResult.orderCode,
                            amount: finalTotal,
                            qrCode: paymentResult.qrCode,
                            methodId: paymentMethod
                        }
                    });
                } else {
                    throw new Error('Không nhận được QR code từ PayOS');
                }
            }

        } catch (error: any) {
            console.error('❌ Place order error:', error);
            Alert.alert(
                'Lỗi đặt hàng',
                error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2979ff" />
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* ĐỊA CHỈ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                    {selectedAddress ? (
                        <View>
                            <Text style={styles.addressName}>
                                {selectedAddress.receiverName} | {selectedAddress.phone}
                            </Text>
                            <Text style={styles.addressDetail}>{selectedAddress.address}</Text>
                        </View>
                    ) : (
                        <Text style={styles.noAddress}>Vui lòng thêm địa chỉ giao hàng</Text>
                    )}
                </View>

                {/* PHƯƠNG THỨC THANH TOÁN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'MB' && styles.activeOption]}
                        onPress={() => setPaymentMethod('MB')}
                    >
                        <Ionicons
                            name="card-outline"
                            size={24}
                            color={paymentMethod === 'MB' ? '#e60019' : '#888'}
                        />
                        <Text style={styles.paymentText}>MbBank - Chuyển khoản</Text>
                        {paymentMethod === 'MB' && (
                            <Ionicons name="checkmark-circle" size={20} color="#e60019" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'COD' && styles.activeOption]}
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color={paymentMethod === 'COD' ? '#4caf50' : '#888'}
                        />
                        <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
                        {paymentMethod === 'COD' && (
                            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* CHI TIẾT SẢN PHẨM */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm ({cartItems.length})</Text>
                    {cartItems.map((item, index) => (
                        <View key={index} style={styles.productRow}>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {item.product.name}
                                </Text>
                                <Text style={styles.productPrice}>
                                    {formatCurrency(item.price)}
                                </Text>
                            </View>
                            <Text style={styles.productQty}>x{item.quantity}</Text>
                            <Text style={styles.productSubtotal}>
                                {formatCurrency(item.price * item.quantity)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* TỔNG TIỀN */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tạm tính</Text>
                        <Text style={styles.value}>{formatCurrency(apiTotalPrice)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phí vận chuyển</Text>
                        <Text style={styles.value}>{formatCurrency(shippingFee)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={handlePlaceOrder}
                    disabled={loading || cartItems.length === 0}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.checkoutBtnText}>ĐẶT HÀNG NGAY</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    loadingText: {
        color: '#888',
        fontSize: 14
    },
    header: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderColor: '#333'
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    content: {
        padding: 15
    },
    section: {
        backgroundColor: '#1e1e2e',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15
    },
    sectionTitle: {
        color: '#888',
        marginBottom: 12,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    addressName: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 15
    },
    addressDetail: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 20
    },
    noAddress: {
        color: '#ff5252',
        fontSize: 14
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#2b2b3b',
        marginBottom: 10,
        gap: 12,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    activeOption: {
        borderColor: '#2979ff',
        backgroundColor: 'rgba(41, 121, 255, 0.1)'
    },
    paymentText: {
        color: 'white',
        flex: 1,
        fontSize: 14,
        fontWeight: '500'
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    productInfo: {
        flex: 1,
        marginRight: 10
    },
    productName: {
        color: '#ccc',
        fontSize: 13,
        marginBottom: 4
    },
    productPrice: {
        color: '#888',
        fontSize: 12
    },
    productQty: {
        color: '#aaa',
        fontSize: 13,
        marginRight: 10
    },
    productSubtotal: {
        color: '#00e676',
        fontSize: 14,
        fontWeight: 'bold'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    label: {
        color: '#aaa',
        fontSize: 14
    },
    value: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        borderTopWidth: 1,
        borderColor: '#333',
        paddingTop: 10
    },
    totalLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    totalValue: {
        color: '#00e676',
        fontSize: 18,
        fontWeight: 'bold'
    },
    footer: {
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderTopWidth: 1,
        borderColor: '#333'
    },
    checkoutBtn: {
        backgroundColor: '#2979ff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 54
    },
    checkoutBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5
    }
});