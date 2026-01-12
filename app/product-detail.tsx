import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService, { Product } from './services/api';

export default function ProductDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const productId = params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        loadProductDetail();
    }, [productId]);

    const loadProductDetail = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getProductById(Number(productId));
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm', [
                { text: 'OK', onPress: () => router.back() }
            ]);
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

    const increaseQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        } else {
            Alert.alert('Thông báo', `Chỉ còn ${product?.stock} sản phẩm trong kho`);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập để mua hàng!",
                [
                    { text: "Để sau", style: "cancel" },
                    {
                        text: "Đăng nhập ngay",
                        onPress: () => router.push('/auth/login')
                    }
                ]
            );
            return;
        }

        try {
            const existingCart = await AsyncStorage.getItem('cart');
            const cart = existingCart ? JSON.parse(existingCart) : [];

            const existingIndex = cart.findIndex((item: any) => item.id === product.id);

            if (existingIndex >= 0) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({ ...product, quantity });
            }

            await AsyncStorage.setItem('cart', JSON.stringify(cart));

            Alert.alert(
                "Thành công",
                `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`,
                [
                    { text: "Tiếp tục mua", style: "cancel" },
                    { text: "Xem giỏ hàng", onPress: () => router.push('/(tabs)/cart') }
                ]
            );
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        setTimeout(() => {
            router.push('/(tabs)/cart');
        }, 500);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#2979ff" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerLoading}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ff5252" />
                    <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const hasValidImage = product.image && product.image.trim() !== '';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="share-social-outline" size={22} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageSection}>
                    {!imageError && hasValidImage ? (
                        <>
                            {imageLoading && (
                                <View style={styles.imageLoadingContainer}>
                                    <ActivityIndicator size="large" color="#2979ff" />
                                </View>
                            )}
                            <Image
                                source={{ uri: product.image }}
                                style={styles.productImage}
                                resizeMode="contain"
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                                onError={() => {
                                    setImageError(true);
                                    setImageLoading(false);
                                }}
                            />
                        </>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={80} color="#555" />
                            <Text style={styles.imagePlaceholderText}>Không có ảnh</Text>
                        </View>
                    )}

                    {product.stock > 0 ? (
                        <View style={styles.stockBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="white" style={{ marginRight: 4 }} />
                            <Text style={styles.stockBadgeText}>Còn {product.stock} sản phẩm</Text>
                        </View>
                    ) : (
                        <View style={[styles.stockBadge, styles.outOfStockBadge]}>
                            <Ionicons name="close-circle" size={16} color="white" style={{ marginRight: 4 }} />
                            <Text style={styles.stockBadgeText}>Hết hàng</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.productName}>{product.name}</Text>

                    <View style={styles.ratingRow}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#ffab00" />
                            <Text style={styles.ratingText}>{product.rating?.toFixed(1) || 'N/A'}</Text>
                        </View>
                        <View style={styles.soldContainer}>
                            <Ionicons name="cart-outline" size={16} color="#888" />
                            <Text style={styles.soldText}>Đã bán {product.sold || 0}</Text>
                        </View>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category?.name || 'Chưa phân loại'}</Text>
                        </View>
                    </View>

                    <View style={styles.priceSection}>
                        <Text style={styles.priceLabel}>Giá bán</Text>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                    </View>

                    {/* Description */}
                    {product.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}

                    {/* Product Details */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Danh mục:</Text>
                            <Text style={styles.detailValue}>{product.category?.name || 'Chưa phân loại'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tình trạng:</Text>
                            <Text style={[styles.detailValue, product.stock > 0 ? styles.inStock : styles.outStock]}>
                                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Đánh giá:</Text>
                            <Text style={styles.detailValue}>
                                ⭐ {product.rating?.toFixed(1) || 'Chưa có'} / 5.0
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>Số lượng</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                            onPress={decreaseQuantity}
                            disabled={quantity <= 1}
                        >
                            <Ionicons name="remove" size={20} color={quantity <= 1 ? '#555' : 'white'} />
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{quantity}</Text>

                        <TouchableOpacity
                            style={[styles.quantityButton, (!product || quantity >= product.stock) && styles.quantityButtonDisabled]}
                            onPress={increaseQuantity}
                            disabled={!product || quantity >= product.stock}
                        >
                            <Ionicons name="add" size={20} color={(!product || quantity >= product.stock) ? '#555' : 'white'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.addToCartButton, product.stock <= 0 && styles.buttonDisabled]}
                        onPress={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        <Ionicons name="cart-outline" size={20} color="white" />
                        <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buyNowButton, product.stock <= 0 && styles.buttonDisabled]}
                        onPress={handleBuyNow}
                        disabled={product.stock <= 0}
                    >
                        <Text style={styles.buyNowText}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loadingText: {
        color: '#888',
        marginTop: 10,
        fontSize: 16
    },
    errorText: {
        color: '#888',
        fontSize: 16,
        marginTop: 16,
        marginBottom: 20
    },
    backButton: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: '#2b2b3b',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    scrollView: {
        flex: 1
    },
    imageSection: {
        height: 320,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        position: 'relative'
    },
    productImage: {
        width: '100%',
        height: '100%'
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
    },
    imagePlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#888'
    },
    stockBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#00e676',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    outOfStockBadge: {
        backgroundColor: '#ff5252'
    },
    stockBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    infoSection: {
        padding: 20
    },
    productName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        lineHeight: 28
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b2b3b',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    ratingText: {
        color: '#ffab00',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4
    },
    soldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b2b3b',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    soldText: {
        color: '#888',
        fontSize: 13,
        marginLeft: 4
    },
    categoryBadge: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    priceSection: {
        backgroundColor: '#1e1e2e',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    priceLabel: {
        color: '#888',
        fontSize: 13,
        marginBottom: 4
    },
    price: {
        color: '#00e676',
        fontSize: 28,
        fontWeight: 'bold'
    },
    descriptionSection: {
        marginBottom: 20
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12
    },
    description: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 22
    },
    detailsSection: {
        backgroundColor: '#1e1e2e',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2b2b3b'
    },
    detailLabel: {
        color: '#888',
        fontSize: 14
    },
    detailValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500'
    },
    inStock: {
        color: '#00e676'
    },
    outStock: {
        color: '#ff5252'
    },
    bottomBar: {
        backgroundColor: '#1e1e1e',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    quantityLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500'
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b2b3b',
        borderRadius: 8,
        padding: 4
    },
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#2979ff',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    quantityButtonDisabled: {
        backgroundColor: '#333',
        opacity: 0.5
    },
    quantityText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: 'center'
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#2b2b3b',
        paddingVertical: 14,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#2979ff'
    },
    addToCartText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#2979ff',
        paddingVertical: 14,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buyNowText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    buttonDisabled: {
        backgroundColor: '#555',
        opacity: 0.5,
        borderColor: '#555'
    }
});