import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Import từ file API
import ApiService, { Address, CartItem } from './services/api';

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [apiTotalPrice, setApiTotalPrice] = useState(0);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Sử dụng useFocusEffect để reload khi màn hình được focus (quay lại từ Add Address)
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            // 1. LOAD GIỎ HÀNG
            const cartResponse = await ApiService.getCart();
            if (cartResponse && cartResponse.items) {
                setCartItems(cartResponse.items);
                setApiTotalPrice(cartResponse.totalPrice);
            } else {
                setCartItems([]);
                setApiTotalPrice(0);
            }

            // 2. LOAD ĐỊA CHỈ TỪ API
            console.log('Fetching addresses...');
            const addressList = await ApiService.getAddresses();
            setAddresses(addressList);

            // Logic chọn địa chỉ mặc định
            if (!selectedAddress || !addressList.find(a => a.id === selectedAddress.id)) {
                const defaultAddr = addressList.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr);
                } else if (addressList.length > 0) {
                    setSelectedAddress(addressList[0]);
                } else {
                    setSelectedAddress(null);
                }
            }

        } catch (error: any) {
            console.error('Error loading checkout data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const shippingFee = 30000;
    const totalProductPrice = apiTotalPrice;
    const finalTotal = totalProductPrice + shippingFee;

    const handleSelectAddress = (address: Address) => {
        setSelectedAddress(address);
        setShowAddressModal(false);
    };

    // --- HÀM XỬ LÝ ĐẶT HÀNG ĐÃ SỬA ĐỔI ---
    const handlePlaceOrder = async () => {
        // 1. Kiểm tra địa chỉ
        if (!selectedAddress) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        // 2. Kiểm tra giỏ hàng
        if (cartItems.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Không có sản phẩm để đặt hàng');
            return;
        }

        // 3. Xử lý Chuyển khoản ngân hàng (Bank Transfer)
        if (paymentMethod === 'bank') {
            // Chuyển sang màn hình thanh toán QR kèm theo thông tin số tiền và ID địa chỉ
            router.push({
                pathname: '/payment/payment-qr',
                params: {
                    amount: finalTotal,                 // Tổng tiền cần thanh toán
                    addressId: selectedAddress.id,      // ID địa chỉ giao hàng
                    note: 'Thanh toan don hang'         // Nội dung chuyển khoản
                }
            });
            return; // Dừng hàm tại đây
        }

        // 4. Xử lý Thanh toán khi nhận hàng (COD)
        Alert.alert(
            'Xác nhận đặt hàng',
            `Tổng thanh toán: ${formatCurrency(finalTotal)}\nĐịa chỉ: ${selectedAddress.address}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đặt hàng',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // Gọi API đặt hàng thật ở đây (cần implement thêm trong ApiService)
                            // const orderData = { addressId: selectedAddress.id, ... };
                            // await ApiService.createOrder(orderData);

                            // Tạm thời clear cart
                            await ApiService.clearCart();

                            Alert.alert(
                                'Đặt hàng thành công',
                                'Cảm ơn bạn đã mua hàng!',
                                [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
                            );
                        } catch (error) {
                            Alert.alert('Lỗi', 'Đặt hàng thất bại');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading && cartItems.length === 0 && addresses.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2979ff" />
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
                {/* Phần địa chỉ */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={20} color="#2979ff" />
                        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    </View>

                    {selectedAddress ? (
                        <TouchableOpacity
                            style={styles.addressCard}
                            onPress={() => setShowAddressModal(true)}
                        >
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressName}>
                                    {selectedAddress.receiverName} <Text style={{ fontWeight: 'normal', fontSize: 13 }}>({selectedAddress.phone})</Text>
                                </Text>
                                <Text style={styles.addressText}>{selectedAddress.address}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#888" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.addAddressButton}
                            onPress={() => router.push('/address/form')}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#2979ff" />
                            <Text style={styles.addAddressText}>Thêm địa chỉ giao hàng</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Phần sản phẩm - Hiển thị từ API CartItem */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cart" size={20} color="#2979ff" />
                        <Text style={styles.sectionTitle}>Sản phẩm ({cartItems.length})</Text>
                    </View>
                    {cartItems.map((item) => (
                        <View key={item.id} style={styles.productItem}>
                            <Image
                                source={{ uri: item.product.image }}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {item.product.name}
                                </Text>
                                <View style={styles.productPriceRow}>
                                    <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                                    <Text style={styles.productQuantity}>x{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="card" size={20} color="#2979ff" />
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <View style={styles.paymentContent}>
                            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? '#2979ff' : '#888'} />
                            <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextActive]}>
                                Thanh toán khi nhận hàng
                            </Text>
                        </View>
                        {paymentMethod === 'cod' && (
                            <Ionicons name="checkmark-circle" size={24} color="#2979ff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'bank' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('bank')}
                    >
                        <View style={styles.paymentContent}>
                            <Ionicons name="card-outline" size={24} color={paymentMethod === 'bank' ? '#2979ff' : '#888'} />
                            <Text style={[styles.paymentText, paymentMethod === 'bank' && styles.paymentTextActive]}>
                                Chuyển khoản ngân hàng
                            </Text>
                        </View>
                        {paymentMethod === 'bank' && (
                            <Ionicons name="checkmark-circle" size={24} color="#2979ff" />
                        )}
                    </TouchableOpacity>
                </View>


                <View style={styles.section}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tạm tính:</Text>
                        <Text style={styles.priceValue}>{formatCurrency(totalProductPrice)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.priceValue}>{formatCurrency(shippingFee)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Tổng thanh toán</Text>
                    <Text style={styles.footerTotal}>{formatCurrency(finalTotal)}</Text>
                </View>
                <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
                    <Text style={styles.orderButtonText}>Đặt hàng</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL CHỌN ĐỊA CHỈ */}
            {showAddressModal && (
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
                            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={addresses}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.addressOption,
                                        selectedAddress?.id === item.id && styles.addressOptionActive
                                    ]}
                                    onPress={() => handleSelectAddress(item)}
                                >
                                    <View style={styles.addressOptionInfo}>
                                        <Text style={styles.addressOptionName}>{item.receiverName}</Text>
                                        <Text style={styles.addressOptionPhone}>{item.phone}</Text>
                                        <Text style={styles.addressOptionText}>{item.address}</Text>
                                        {item.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultText}>Mặc định</Text>
                                            </View>
                                        )}
                                    </View>
                                    {selectedAddress?.id === item.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#2979ff" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListFooterComponent={
                                <TouchableOpacity
                                    style={styles.modalAddButton}
                                    onPress={() => {
                                        setShowAddressModal(false);
                                        router.push('/address/form');
                                    }}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color="#2979ff" />
                                    <Text style={styles.modalAddButtonText}>Thêm địa chỉ mới</Text>
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyAddress}>
                                    <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            )}
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
        alignItems: 'center'
    },
    loadingText: {
        color: '#888',
        marginTop: 10,
        fontSize: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    content: {
        flex: 1
    },
    section: {
        backgroundColor: '#1e1e2e',
        marginTop: 10,
        padding: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#333'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b2b3b',
        padding: 12,
        borderRadius: 8,
        gap: 12
    },
    addressInfo: {
        flex: 1
    },
    addressName: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4
    },
    addressPhone: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 6
    },
    addressText: {
        color: '#aaa',
        fontSize: 13,
        lineHeight: 18
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#2b2b3b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2979ff',
        borderStyle: 'dashed',
        gap: 8
    },
    addAddressText: {
        color: '#2979ff',
        fontSize: 15,
        fontWeight: '600'
    },
    productItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    productImage: {
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 8
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between'
    },
    productName: {
        color: 'white',
        fontSize: 14,
        marginBottom: 8
    },
    productPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    productPrice: {
        color: '#00e676',
        fontSize: 15,
        fontWeight: 'bold'
    },
    productQuantity: {
        color: '#888',
        fontSize: 14
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#2b2b3b',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    paymentOptionActive: {
        borderColor: '#2979ff',
        backgroundColor: 'rgba(41, 121, 255, 0.1)'
    },
    paymentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    paymentText: {
        color: '#888',
        fontSize: 15
    },
    paymentTextActive: {
        color: 'white',
        fontWeight: '600'
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    priceLabel: {
        color: '#aaa',
        fontSize: 15
    },
    priceValue: {
        color: 'white',
        fontSize: 15
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    totalLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    totalValue: {
        color: '#00e676',
        fontSize: 18,
        fontWeight: 'bold'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    footerLabel: {
        color: '#aaa',
        fontSize: 14
    },
    footerTotal: {
        color: '#00e676',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4
    },
    orderButton: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 12
    },
    orderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    addressOption: {
        flexDirection: 'row',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 10,
        backgroundColor: '#2b2b3b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333'
    },
    addressOptionActive: {
        borderColor: '#2979ff',
        backgroundColor: 'rgba(41, 121, 255, 0.1)'
    },
    addressOptionInfo: {
        flex: 1
    },
    addressOptionName: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4
    },
    addressOptionPhone: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 6
    },
    addressOptionText: {
        color: '#aaa',
        fontSize: 13,
        lineHeight: 18
    },
    defaultBadge: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 6
    },
    defaultText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold'
    },
    emptyAddress: {
        alignItems: 'center',
        padding: 40
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        marginBottom: 20
    },
    addButton: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold'
    },
    modalAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        margin: 15,
        backgroundColor: '#2b2b3b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2979ff',
        borderStyle: 'dashed',
        gap: 8
    },
    modalAddButtonText: {
        color: '#2979ff',
        fontSize: 15,
        fontWeight: 'bold'
    }
});