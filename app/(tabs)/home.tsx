import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router'; // Thêm useFocusEffect để reload khi quay lại
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ApiService, { Category, Product } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // State lưu danh sách sản phẩm yêu thích
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload danh sách yêu thích mỗi khi màn hình Home được focus (quay lại từ tab khác)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem('favorites');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const categoriesData = await ApiService.getCategories();
      setCategories(categoriesData || []);

      const productsData = await ApiService.getProducts();
      const cleanProducts = cleanCircularReference(productsData);

      setProducts(cleanProducts);
      setFilteredProducts(cleanProducts);

      // Load favorites lần đầu
      await loadFavorites();

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.',
        [
          { text: 'OK' },
          { text: 'Thử lại', onPress: loadInitialData }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const cleanCircularReference = (data: any): Product[] => {
    try {
      if (!data || !Array.isArray(data)) return [];

      return data.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        rating: product.rating,
        sold: product.sold,
        stock: product.stock,
        category: {
          id: product.category?.id,
          name: product.category?.name,
          description: product.category?.description,
          image: product.category?.image
        }
      }));
    } catch (error) {
      console.error('Error cleaning data:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCategoryFilter = async (categoryId: number | null) => {
    try {
      setSelectedCategory(categoryId);
      setSearchQuery('');

      if (categoryId === null) {
        const allProducts = await ApiService.getProducts();
        const cleanProducts = cleanCircularReference(allProducts);
        setProducts(cleanProducts);
        setFilteredProducts(cleanProducts);
      } else {
        const categoryProducts = await ApiService.getProductsByCategory(categoryId);
        const cleanProducts = cleanCircularReference(categoryProducts);
        setProducts(cleanProducts);
        setFilteredProducts(cleanProducts);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
      Alert.alert('Lỗi', 'Không thể lọc sản phẩm');
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (!text.trim()) {
      if (selectedCategory) {
        handleCategoryFilter(selectedCategory);
      } else {
        setFilteredProducts(products);
      }
      return;
    }

    try {
      const searchResults = await ApiService.getProducts(text);
      const cleanResults = cleanCircularReference(searchResults);

      if (selectedCategory) {
        const filtered = cleanResults.filter(
          item => item.category?.id === selectedCategory
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(cleanResults);
      }
    } catch (error) {
      console.error('Error searching:', error);
      const filtered = products.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý khi bấm nút Yêu thích
  const toggleFavorite = async (item: Product) => {
    try {
      let newFavorites = [...favorites];
      const isExist = newFavorites.some(fav => fav.id === item.id);

      if (isExist) {
        // Nếu đã có -> Xóa khỏi danh sách
        newFavorites = newFavorites.filter(fav => fav.id !== item.id);
      } else {
        // Chưa có -> Thêm vào danh sách
        newFavorites.push(item);
      }

      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = async (item: Product) => {
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
      setAddingToCart(item.id);
      const result: any = await ApiService.addToCart({
        productId: item.id,
        quantity: 1
      });

      if (result.cartVerified) {
        Alert.alert(
          "✅ Thành công",
          `Đã thêm "${item.name}" vào giỏ hàng!`,
        );
      } else {
        Alert.alert(
          "⚠️ Đã thêm vào giỏ",
          `Backend đã xác nhận thêm "${item.name}".`,
        );
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert("❌ Lỗi", error.message || "Không thể thêm vào giỏ hàng.");
    } finally {
      setAddingToCart(null);
    }
  };

  const ProductItem = ({ item, onAddToCart }: {
    item: Product;
    onAddToCart: (item: Product) => void
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const isAddingThisProduct = addingToCart === item.id;

    // Kiểm tra xem sản phẩm này có trong danh sách yêu thích không
    const isFav = favorites.some(fav => fav.id === item.id);

    const hasValidImage = item.image && item.image.trim() !== '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/product-detail?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {!imageError && hasValidImage ? (
            <>
              {imageLoading && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="small" color="#2979ff" />
                </View>
              )}
              <Image
                source={{ uri: item.image }}
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
              <Ionicons name="image-outline" size={48} color="#555" />
              <Text style={styles.imagePlaceholderText}>Không có ảnh</Text>
            </View>
          )}

          {/* NÚT YÊU THÍCH */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation(); // Ngăn chặn bấm vào cả thẻ card
              toggleFavorite(item);
            }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "#ff5252" : "#888"}
            />
          </TouchableOpacity>

          {item.stock > 0 ? (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Còn hàng</Text>
            </View>
          ) : (
            <View style={[styles.tagContainer, styles.outOfStockTag]}>
              <Text style={styles.tagText}>Hết hàng</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.category}>{item.category?.name || 'Chưa phân loại'}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.sold}>Đã bán {item.sold || 0}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              (item.stock <= 0 || isAddingThisProduct) && styles.addButtonDisabled
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            disabled={item.stock <= 0 || isAddingThisProduct}
          >
            {isAddingThisProduct ? (
              <View style={styles.addButtonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.addButtonText, { marginLeft: 8 }]}>
                  Đang thêm...
                </Text>
              </View>
            ) : (
              <Text style={styles.addButtonText}>
                {item.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>NghiaShop</Text>
            <Text style={styles.headerSubtitle}>Phụ kiện máy tính chính hãng</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive
              ]}
              onPress={() => handleCategoryFilter(null)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === null && styles.categoryChipTextActive
              ]}>
                Tất cả
              </Text>
            </TouchableOpacity>

            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryFilter(item.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === item.id && styles.categoryChipTextActive
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductItem item={item} onAddToCart={handleAddToCart} />
        )}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2979ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#555" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                handleCategoryFilter(null);
              }}
            >
              <Text style={styles.resetButtonText}>Xem tất cả sản phẩm</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    alignItems: 'center'
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#2b2b3b',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16
  },
  categoriesContainer: {
    marginTop: 5
  },
  categoryChip: {
    backgroundColor: '#2b2b3b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  categoryChipActive: {
    backgroundColor: '#2979ff',
    borderColor: '#2979ff'
  },
  categoryChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600'
  },
  categoryChipTextActive: {
    color: 'white'
  },
  listContent: {
    padding: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  imageContainer: {
    height: 140,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
    marginTop: 8,
    fontSize: 12,
    color: '#888'
  },

  // Style cho nút Yêu thích
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)', // Nền trắng mờ để nổi bật icon
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },

  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00e676',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  outOfStockTag: {
    backgroundColor: '#ff5252'
  },
  tagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10
  },
  infoContainer: {
    padding: 10
  },
  productName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    height: 36,
    marginBottom: 4
  },
  category: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  price: {
    color: '#00e676',
    fontWeight: 'bold',
    fontSize: 15
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  star: {
    color: '#ffab00',
    fontSize: 11
  },
  sold: {
    color: '#888',
    fontSize: 11
  },
  addButton: {
    backgroundColor: '#2979ff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  addButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.6
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center'
  },
  resetButton: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});