// app/home.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from 'react-native';

// Kiểu dữ liệu sản phẩm
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  tag?: string;
};

// Danh mục sản phẩm
const CATEGORIES = [
  'Tất cả',
  'Điện thoại',
  'Laptop',
  'Bàn phím',
  'Tai nghe',
  'Phụ kiện',
];

// Sản phẩm nổi bật demo
const FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 32990000,
    category: 'Điện thoại',
    image: 'https://via.placeholder.com/150x150.png?text=Phone',
    tag: 'Hot',
  },
  {
    id: '2',
    name: 'MacBook Air M2 13\"',
    price: 28990000,
    category: 'Laptop',
    image: 'https://via.placeholder.com/150x150.png?text=Laptop',
    tag: 'New',
  },
  {
    id: '3',
    name: 'Bàn phím cơ Gateron RGB',
    price: 1299000,
    category: 'Bàn phím',
    image: 'https://via.placeholder.com/150x150.png?text=Keyboard',
  },
  {
    id: '4',
    name: 'Tai nghe Bluetooth ANC',
    price: 1999000,
    category: 'Tai nghe',
    image: 'https://via.placeholder.com/150x150.png?text=Headphone',
  },
];

// ROUTE /home – PHẢI CÓ default export
export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>Ecome Store</Text>
            <Text style={styles.shopSubtitle}>
              Thiết bị điện tử chính hãng
            </Text>
          </View>

          <Pressable style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
          </Pressable>
        </View>

        {/* Ô tìm kiếm */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Tìm điện thoại, laptop, phụ kiện..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* DANH MỤC */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <Text style={styles.sectionSeeAll}>Xem tất cả</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat, idx) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                idx === 0 && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  idx === 0 && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* SẢN PHẨM NỔI BẬT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
          <Text style={styles.sectionSeeAll}>Tất cả sản phẩm</Text>
        </View>

        <View style={styles.productGrid}>
          {FEATURED_PRODUCTS.map((p) => (
            <Pressable key={p.id} style={styles.productCard}>
              <View style={styles.productImageWrapper}>
                <Image source={{ uri: p.image }} style={styles.productImage} />
                {p.tag && (
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{p.tag}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.productName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.productCategory}>{p.category}</Text>
              <Text style={styles.productPrice}>
                {p.price.toLocaleString('vi-VN')} đ
              </Text>

              <Pressable style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Thêm vào giỏ</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617', // nền đen dịu mắt
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  shopName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  shopSubtitle: {
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 13,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },

  // SEARCH
  searchBox: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F9FAFB',
    fontSize: 14,
  },

  // SECTION HEADER
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSeeAll: {
    color: '#64748B',
    fontSize: 12,
  },

  // CATEGORIES
  categoryRow: {
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#F9FAFB',
    fontWeight: '600',
  },

  // PRODUCTS
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  productImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#0F172A',
  },
  productImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F97316',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  productName: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
    minHeight: 34,
  },
  productCategory: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  productPrice: {
    color: '#22C55E',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 6,
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '600',
  },
});
