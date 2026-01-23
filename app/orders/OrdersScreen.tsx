import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import ApiService, { OrderDetail } from '../services/api';

export default function OrdersScreen() {
    const router = useRouter();

    const [orders, setOrders] = useState<OrderDetail[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

    useFocusEffect(
        useCallback(() => {
            initData();
        }, [])
    );

    const initData = async () => {
        try {
            setLoading(true);
            const ordersFromApi = await ApiService.getOrders();

            const sortedOrders = ordersFromApi.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setOrders(sortedOrders);
        } catch (error) {
            console.log('Lỗi tải đơn hàng:', error);

            if (error instanceof Error) {
                if (error.message.includes('Access denied')) {
                    // Có thể hiển thị alert hoặc toast
                    Alert.alert(
                        'Không thể tải đơn hàng',
                        'Bạn chưa có quyền xem đơn hàng. Vui lòng liên hệ hỗ trợ.',
                        [{ text: 'OK' }]
                    );
                }
            }

            // Giữ orders là mảng rỗng
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleOpenDetail = async (order: OrderDetail) => {
        try {
            setModalVisible(true);
            setSelectedOrder(order); // Hiển thị dữ liệu tạm thời

            // Gọi API lấy chi tiết đầy đủ
            const fullOrderDetail = await ApiService.getOrderDetail(order.id);
            setSelectedOrder(fullOrderDetail);

            console.log('📦 Loaded order detail:', {
                orderId: fullOrderDetail.id,
                itemCount: fullOrderDetail.items?.length,
                items: fullOrderDetail.items?.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        } catch (error) {
            console.error('Error loading order detail:', error);
            Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
        }
    };

    const getStatusColor = (status: string | null | undefined) => {
        if (!status) return '#888';

        switch (status.toUpperCase()) {
            case 'PENDING': return '#ff9800';
            case 'PAID': return '#00e676';
            case 'COMPLETED': return '#4caf50';
            case 'CANCELLED': return '#ff5252';
            default: return '#2979ff';
        }
    };

    const getStatusText = (status: string | null | undefined) => {
        if (!status) return 'Không rõ';

        switch (status.toUpperCase()) {
            case 'PENDING': return 'Chờ thanh toán';
            case 'PAID': return 'Đã thanh toán';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: OrderDetail }) => {
        const itemCount = item.items?.length || 0;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => handleOpenDetail(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Ionicons name="cube-outline" size={18} color="#aaa" />
                        <Text style={styles.orderId}>ORD-{item.id}</Text>
                    </View>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <View>
                        <Text style={styles.label}>Tổng tiền</Text>
                        <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.label}>Số lượng</Text>
                        <Text style={styles.itemCount}>{itemCount} sản phẩm</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                    <View style={styles.detailsBtn}>
                        <Text style={styles.detailsText}>Xem chi tiết</Text>
                        <Ionicons name="chevron-forward" size={14} color="#aaa" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#2979ff" />
                    <Text style={{ color: '#888', marginTop: 10 }}>Đang tải đơn hàng...</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={60} color="#555" />
                            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                        </View>
                    }
                />
            )}

            {/* MODAL CHI TIẾT */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chi tiết ORD-{selectedOrder?.id}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Thông tin đơn hàng */}
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>
                                    Ngày đặt:
                                    <Text style={styles.infoValue}>
                                        {' '}{selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </Text>
                                </Text>

                                <Text style={styles.infoLabel}>
                                    Trạng thái:
                                    <Text style={[styles.infoValue, {
                                        color: selectedOrder ? getStatusColor(selectedOrder.status) : '#fff'
                                    }]}>
                                        {' '}{selectedOrder ? getStatusText(selectedOrder.status) : ''}
                                    </Text>
                                </Text>

                                <Text style={styles.infoLabel}>
                                    Phương thức:
                                    <Text style={styles.infoValue}> {selectedOrder?.paymentMethod || 'COD'}</Text>
                                </Text>
                            </View>

                            <Text style={styles.sectionHeader}>Danh sách sản phẩm</Text>

                            {/* Hiển thị items với thông tin đầy đủ từ API */}
                            {selectedOrder?.items.map((item, index) => (
                                <View key={index} style={styles.productItem}>
                                    <Image
                                        source={{ uri: item.productImage || 'https://via.placeholder.com/60' }}
                                        style={styles.productImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {item.productName}
                                        </Text>
                                        <View style={styles.productRow}>
                                            <Text style={styles.productPrice}>
                                                {formatCurrency(item.price)}
                                            </Text>
                                            <Text style={styles.productQuantity}>x{item.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={styles.divider} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Tổng cộng</Text>
                                <Text style={styles.totalValue}>
                                    {selectedOrder ? formatCurrency(selectedOrder.totalPrice) : 0}
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// STYLES GIỮ NGUYÊN NHƯ CŨ
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
    listContent: {
        padding: 15
    },
    orderCard: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
        padding: 15
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    orderId: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    orderDate: {
        color: '#888',
        fontSize: 13
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginBottom: 12,
        marginTop: 12
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4
    },
    totalPrice: {
        color: '#2979ff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    itemCount: {
        color: 'white',
        fontSize: 14
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2
    },
    detailsText: {
        color: '#aaa',
        fontSize: 13
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 50
    },
    emptyText: {
        color: '#888',
        marginTop: 10,
        fontSize: 16
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
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
    modalBody: {
        padding: 20
    },
    infoSection: {
        backgroundColor: '#2b2b3b',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20
    },
    infoLabel: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 8
    },
    infoValue: {
        color: 'white',
        fontWeight: '500'
    },
    sectionHeader: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15
    },
    productItem: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#2b2b3b',
        padding: 10,
        borderRadius: 8
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: 'white'
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between'
    },
    productName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500'
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    productPrice: {
        color: '#00e676',
        fontWeight: 'bold'
    },
    productQuantity: {
        color: '#aaa'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 40
    },
    totalLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    totalValue: {
        color: '#2979ff',
        fontSize: 22,
        fontWeight: 'bold'
    }
});