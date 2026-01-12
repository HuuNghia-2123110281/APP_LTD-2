import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

// Import ApiService và Interface Product
import ApiService, { Product } from '../services/api';

// 1. Chỉ giữ lại khung sườn thông tin (bỏ total và itemsCount cứng đi)
const MOCK_ORDER_TEMPLATES = [
    { id: 'ORD-8821', date: '12/01/2026', status: 'Đang giao', color: '#2979ff' },
    { id: 'ORD-9923', date: '05/01/2026', status: 'Hoàn thành', color: '#00e676' },
    { id: 'ORD-1102', date: '28/12/2025', status: 'Đã hủy', color: '#ff5252' },
    { id: 'ORD-5541', date: '20/12/2025', status: 'Hoàn thành', color: '#00e676' },
];

interface OrderDetailItem {
    product: Product;
    quantity: number;
}

// Interface cho đơn hàng đã được xử lý (có items và total thật)
interface ProcessedOrder {
    id: string;
    date: string;
    status: string;
    color: string;
    items: OrderDetailItem[];
    totalPrice: number;
}

export default function OrdersScreen() {
    const router = useRouter();

    // State lưu danh sách đơn hàng ĐÃ ĐƯỢC TÍNH TOÁN
    const [orders, setOrders] = useState<ProcessedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ProcessedOrder | null>(null);

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        try {
            setLoading(true);
            // 1. Lấy danh sách sản phẩm thật từ API
            const products = await ApiService.getProducts();

            if (products.length > 0) {
                // 2. Tạo đơn hàng hoàn chỉnh từ Template + Sản phẩm thật
                const processedOrders = MOCK_ORDER_TEMPLATES.map(template => {
                    // Random số lượng loại sản phẩm (1 đến 4 loại)
                    const itemCount = Math.floor(Math.random() * 4) + 1;

                    // Tạo danh sách item ngẫu nhiên cho đơn hàng này
                    const orderItems = generateRandomItems(products, itemCount);

                    // Tính tổng tiền thật
                    const total = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

                    return {
                        ...template,
                        items: orderItems,
                        totalPrice: total
                    };
                });

                setOrders(processedOrders);
            }
        } catch (error) {
            console.log('Lỗi khởi tạo dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm helper: Chọn ngẫu nhiên items từ danh sách gốc
    const generateRandomItems = (sourceProducts: Product[], count: number): OrderDetailItem[] => {
        // Clone và xáo trộn
        const shuffled = [...sourceProducts].sort(() => 0.5 - Math.random());
        // Lấy số lượng cần thiết
        const selected = shuffled.slice(0, Math.min(count, sourceProducts.length));

        return selected.map(p => ({
            product: p,
            quantity: Math.floor(Math.random() * 3) + 1 // Random số lượng 1-3
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleOpenDetail = (order: ProcessedOrder) => {
        setSelectedOrder(order); // Dữ liệu đã có sẵn items và total, không cần tính lại
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: ProcessedOrder }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOpenDetail(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Ionicons name="cube-outline" size={18} color="#aaa" />
                    <Text style={styles.orderId}>{item.id}</Text>
                </View>
                <Text style={styles.orderDate}>{item.date}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View>
                    <Text style={styles.label}>Tổng tiền</Text>
                    {/* Hiển thị giá tiền thật đã tính */}
                    <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Số lượng</Text>
                    <Text style={styles.itemCount}>{item.items.length} sản phẩm</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
                </View>
                <View style={styles.detailsBtn}>
                    <Text style={styles.detailsText}>Xem chi tiết</Text>
                    <Ionicons name="chevron-forward" size={14} color="#aaa" />
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    keyExtractor={(item) => item.id}
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
                            <Text style={styles.modalTitle}>Chi tiết {selectedOrder?.id}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Thông tin đơn hàng */}
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Ngày đặt: <Text style={styles.infoValue}>{selectedOrder?.date}</Text></Text>
                                <Text style={styles.infoLabel}>Trạng thái:
                                    <Text style={[styles.infoValue, { color: selectedOrder?.color }]}> {selectedOrder?.status}</Text>
                                </Text>
                                <Text style={styles.infoLabel}>Địa chỉ nhận: <Text style={styles.infoValue}>123 Nguyễn Văn Linh, Đà Nẵng</Text></Text>
                            </View>

                            <Text style={styles.sectionHeader}>Danh sách sản phẩm</Text>

                            {/* Danh sách items CỐ ĐỊNH của đơn hàng này */}
                            {selectedOrder?.items.map((item, index) => (
                                <View key={index} style={styles.productItem}>
                                    <Image
                                        source={{ uri: item.product.image }}
                                        style={styles.productImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {item.product.name}
                                        </Text>
                                        <View style={styles.productRow}>
                                            <Text style={styles.productPrice}>
                                                {formatCurrency(item.product.price)}
                                            </Text>
                                            <Text style={styles.productQuantity}>x{item.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={styles.divider} />

                            {/* Tổng tiền khớp với bên ngoài */}
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
    // Styles Modal
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