// app/home.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from 'react-native';

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  rating: number;
  sold: number;
  tag?: 'Hot' | 'New' | 'Sale';
};

const CATEGORIES = [
  'Tất cả',
  'Chuột',
  'Bàn phím',
  'Tai nghe',
  'Màn hình',
  'Ghế gaming',
  'SSD/RAM',
  'Phụ kiện',
];

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Chuột Logitech G102 Lightsync',
    price: 399000,
    oldPrice: 499000,
    category: 'Chuột',
    image: 'https://via.placeholder.com/500x350.png?text=Mouse+G102',
    rating: 4.7,
    sold: 1240,
    tag: 'Sale',
  },
  {
    id: 'p2',
    name: 'Bàn phím cơ AKKO 3068B Plus',
    price: 1899000,
    category: 'Bàn phím',
    image: 'https://via.placeholder.com/500x350.png?text=Keyboard+AKKO',
    rating: 4.8,
    sold: 680,
    tag: 'Hot',
  },
  {
    id: 'p3',
    name: 'Tai nghe HyperX Cloud II',
    price: 1599000,
    oldPrice: 1799000,
    category: 'Tai nghe',
    image: 'https://via.placeholder.com/500x350.png?text=Headset+HyperX',
    rating: 4.6,
    sold: 910,
    tag: 'Sale',
  },
  {
    id: 'p4',
    name: 'Màn hình LG 24” IPS 75Hz',
    price: 2699000,
    category: 'Màn hình',
    image: 'https://via.placeholder.com/500x350.png?text=Monitor+LG+24',
    rating: 4.5,
    sold: 420,
    tag: 'New',
  },
  {
    id: 'p5',
    name: 'SSD NVMe 1TB Gen3',
    price: 1499000,
    oldPrice: 1699000,
    category: 'SSD/RAM',
    image: 'https://via.placeholder.com/500x350.png?text=SSD+1TB',
    rating: 4.6,
    sold: 760,
    tag: 'Sale',
  },
  {
    id: 'p6',
    name: 'Ghế gaming Ergonomic Pro',
    price: 2999000,
    category: 'Ghế gaming',
    image: 'https://via.placeholder.com/500x350.png?text=Gaming+Chair',
    rating: 4.4,
    sold: 210,
    tag: 'Hot',
  },
];

function formatVND(value: number) {
  return value.toLocaleString('vi-VN') + ' đ';
}

function stars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = Math.max(0, 5 - full - half);
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

export default function Home() {
  const [activeCat, setActiveCat] = useState<string>('Tất cả');
  const [q, setQ] = useState<string>('');

  const filtered = useMemo(() => {
    const byCat =
      activeCat === 'Tất cả'
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === activeCat);

    const query = q.trim().toLowerCase();
    if (!query) return byCat;

    return byCat.filter((p) => p.name.toLowerCase().includes(query));
  }, [activeCat, q]);

  const topDeals = useMemo(() => {
    return PRODUCTS.filter((p) => p.tag === 'Sale').slice(0, 4);
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>NghiaShop</Text>
            <Text style={styles.sub}>Phụ kiện máy tính chính hãng</Text>
          </View>

          <View style={styles.topBarRight}>
            <Pressable style={styles.iconBtn}>
              <Text style={styles.iconTxt}>🔔</Text>
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Text style={styles.iconTxt}>🛒</Text>
            </Pressable>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Tìm chuột, bàn phím, tai nghe..."
            placeholderTextColor="#94A3B8"
            style={styles.search}
          />
        </View>

        {/* BANNER */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Flash Sale 12.12</Text>
            <Text style={styles.bannerDesc}>
              Giảm tới 40% cho phụ kiện gaming
            </Text>

            <View style={styles.bannerRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Freeship</Text>
              </View>
              <View style={[styles.badge, styles.badge2]}>
                <Text style={styles.badgeText}>Đổi trả 7 ngày</Text>
              </View>
            </View>

            <Pressable style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Xem ưu đãi</Text>
            </Pressable>
          </View>

          <View style={styles.bannerArt}>
            <Text style={styles.bannerEmoji}>⌨️🖱️</Text>
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <Text style={styles.sectionLink}>Xem tất cả</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((c) => {
            const active = c === activeCat;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCat(c)}
                style={[styles.catChip, active && styles.catChipActive]}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TOP DEALS */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Ưu đãi hot</Text>
          <Text style={styles.sectionLink}>Xem thêm</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealRow}
        >
          {topDeals.map((p) => (
            <Pressable key={p.id} style={styles.dealCard}>
              <Image source={{ uri: p.image }} style={styles.dealImg} />
              <Text style={styles.dealName} numberOfLines={2}>
                {p.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatVND(p.price)}</Text>
                {!!p.oldPrice && (
                  <Text style={styles.oldPrice}>{formatVND(p.oldPrice)}</Text>
                )}
              </View>

              <Text style={styles.meta}>
                {stars(p.rating)} • Đã bán {p.sold}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* PRODUCTS GRID */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
          <Text style={styles.sectionLink}>{filtered.length} sản phẩm</Text>
        </View>

        <View style={styles.grid}>
          {filtered.map((p) => (
            <Pressable key={p.id} style={styles.card}>
              <View style={styles.imgWrap}>
                <Image source={{ uri: p.image }} style={styles.img} />
                {!!p.tag && (
                  <View
                    style={[
                      styles.tag,
                      p.tag === 'Hot' && styles.tagHot,
                      p.tag === 'New' && styles.tagNew,
                      p.tag === 'Sale' && styles.tagSale,
                    ]}
                  >
                    <Text style={styles.tagText}>{p.tag}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.name} numberOfLines={2}>
                {p.name}
              </Text>

              <Text style={styles.category}>{p.category}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatVND(p.price)}</Text>
                {!!p.oldPrice && (
                  <Text style={styles.oldPrice}>{formatVND(p.oldPrice)}</Text>
                )}
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.metaSmall}>{stars(p.rating)}</Text>
                <Text style={styles.metaSmall}>• {p.sold} đã bán</Text>
              </View>

              <Pressable style={styles.addBtn}>
                <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1220' },
  scroll: { paddingHorizontal: 16, paddingTop: 44, paddingBottom: 24 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brand: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  sub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },

  topBarRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: '#1F2A44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 18 },

  searchWrap: { marginTop: 6, marginBottom: 14 },
  search: {
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: '#1F2A44',
    color: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },

  banner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2A44',
    backgroundColor: '#0F1A33',
    marginBottom: 18,
  },
  bannerArt: {
    width: 90,
    borderRadius: 14,
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: '#1F2A44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: { fontSize: 30 },
  bannerTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  bannerDesc: { color: '#94A3B8', fontSize: 12, marginTop: 4, marginBottom: 10 },
  bannerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: '#1F2A44',
  },
  badge2: { backgroundColor: '#0D2A1D', borderColor: '#14532D' },
  badgeText: { color: '#E2E8F0', fontSize: 11, fontWeight: '600' },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerBtnText: { color: '#F8FAFC', fontWeight: '700', fontSize: 12 },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },
  sectionLink: { color: '#64748B', fontSize: 12 },

  catRow: { paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2A44',
    marginRight: 8,
  },
  catChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  catText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#F8FAFC' },

  dealRow: { paddingBottom: 6 },
  dealCard: {
    width: 220,
    marginRight: 12,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2A44',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dealImg: { width: '100%', height: 120, backgroundColor: '#111A2E' },
  dealName: { color: '#E2E8F0', fontWeight: '700', fontSize: 13, padding: 10, paddingBottom: 6 },
  meta: { color: '#94A3B8', fontSize: 11, paddingHorizontal: 10, paddingBottom: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2A44',
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
  },
  imgWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111A2E',
    marginBottom: 8,
  },
  img: { width: '100%', height: 110, resizeMode: 'cover' },

  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: { color: '#0B1220', fontSize: 11, fontWeight: '800' },
  tagHot: { backgroundColor: '#F59E0B' },
  tagNew: { backgroundColor: '#38BDF8' },
  tagSale: { backgroundColor: '#34D399' },

  name: { color: '#E2E8F0', fontSize: 13, fontWeight: '700', minHeight: 34 },
  category: { color: '#94A3B8', fontSize: 11, marginTop: 4 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 6 },
  price: { color: '#22C55E', fontSize: 14, fontWeight: '900' },
  oldPrice: { color: '#64748B', fontSize: 11, textDecorationLine: 'line-through' },

  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  metaSmall: { color: '#94A3B8', fontSize: 11 },

  addBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: { color: '#F8FAFC', fontSize: 12, fontWeight: '800' },
});
