import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Address {
    id: string;
    receiverName: string;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function AddressListScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);

    const loadAddresses = async () => {
        try {
            const data = await AsyncStorage.getItem('addresses');
            if (data) {
                setAddresses(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [])
    );

    const handleSetDefault = async (id: string) => {
        try {
            const updated = addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }));
            setAddresses(updated);
            await AsyncStorage.setItem('addresses', JSON.stringify(updated));
            Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc muốn xóa địa chỉ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = addresses.filter(addr => addr.id !== id);

                            // Nếu xóa địa chỉ mặc định và còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
                            if (updated.length > 0 && !updated.some(a => a.isDefault)) {
                                updated[0].isDefault = true;
                            }

                            setAddresses(updated);
                            await AsyncStorage.setItem('addresses', JSON.stringify(updated));
                            Alert.alert('Thành công', 'Đã xóa địa chỉ');
                        } catch (error) {
                            console.error('Error deleting address:', error);
                        }
                    }
                }
            ]
        );
    };

    const renderAddressItem = ({ item }: { item: Address }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{item.receiverName}</Text>
                    {item.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Mặc định</Text>
                        </View>
                    )}
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => router.push(`/address/form?id=${item.id}`)}
                        style={styles.iconButton}
                    >
                        <Ionicons name="create-outline" size={20} color="#2979ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={styles.iconButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ff5252" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.addressDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color="#888" />
                    <Text style={styles.detailText}>{item.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#888" />
                    <Text style={styles.detailText}>{item.address}</Text>
                </View>
            </View>

            {!item.isDefault && (
                <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(item.id)}
                >
                    <Text style={styles.setDefaultText}>Đặt làm mặc định</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={renderAddressItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={80} color="#555" />
                        <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                        <Text style={styles.emptySubtext}>
                            Thêm địa chỉ để đặt hàng nhanh hơn
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/address/form')}
            >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
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
        padding: 15,
        flexGrow: 1
    },
    addressCard: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333'
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    addressInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    addressName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10
    },
    defaultBadge: {
        backgroundColor: '#2979ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4
    },
    defaultText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold'
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(41, 121, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    addressDetails: {
        gap: 8
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8
    },
    detailText: {
        color: '#aaa',
        fontSize: 14,
        flex: 1
    },
    setDefaultButton: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(41, 121, 255, 0.1)',
        borderRadius: 6,
        alignSelf: 'flex-start'
    },
    setDefaultText: {
        color: '#2979ff',
        fontSize: 13,
        fontWeight: '600'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center'
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#2979ff',
        margin: 15,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});