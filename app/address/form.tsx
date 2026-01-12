import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Import ApiService
import ApiService from '../services/api';

export default function AddressFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    // Chuyển id sang number nếu có
    const addressId = params.id ? Number(params.id) : undefined;

    const [receiverName, setReceiverName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (addressId) {
            loadAddress();
        }
    }, [addressId]);

    const loadAddress = async () => {
        try {
            setLoading(true);
            // API hiện tại chưa có getById, ta lấy list rồi tìm (hoặc bạn thêm API getById vào backend)
            // Tạm thời lấy list rồi filter client-side cho nhanh
            const addresses = await ApiService.getAddresses();
            const found = addresses.find(a => a.id === addressId);

            if (found) {
                setReceiverName(found.receiverName);
                setPhone(found.phone);
                setAddress(found.address);
                setIsDefault(found.isDefault);
            }
        } catch (error) {
            console.error('Error loading address:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!receiverName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
            return false;
        }
        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return false;
        }
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
            return false;
        }
        if (!address.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const addressData = {
                receiverName,
                phone,
                address,
                isDefault
            };

            if (addressId) {
                // UPDATE API
                await ApiService.updateAddress(addressId, addressData);
                Alert.alert('Thành công', 'Đã cập nhật địa chỉ');
            } else {
                // CREATE API
                await ApiService.addAddress(addressData);
                Alert.alert('Thành công', 'Đã thêm địa chỉ mới');
            }

            router.back();
        } catch (error: any) {
            console.error('Error saving address:', error);
            Alert.alert('Lỗi', error.message || 'Không thể lưu địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    // ... (Phần render UI giữ nguyên, chỉ thêm loading indicator nếu cần)
    return (
        <SafeAreaView style={styles.container}>
            {/* ... Header cũ ... */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {addressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2979ff" />
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView style={styles.content}>
                        {/* ... Phần Form Input giữ nguyên như code cũ ... */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên người nhận <Text style={styles.required}>*</Text></Text>
                                <TextInput style={styles.input} placeholder="Nhập tên người nhận" placeholderTextColor="#666" value={receiverName} onChangeText={setReceiverName} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                                <TextInput style={styles.input} placeholder="Nhập số điện thoại" placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={11} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Địa chỉ <Text style={styles.required}>*</Text></Text>
                                <TextInput style={[styles.input, styles.textArea]} placeholder="Số nhà, tên đường..." placeholderTextColor="#666" multiline numberOfLines={4} value={address} onChangeText={setAddress} />
                            </View>

                            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsDefault(!isDefault)}>
                                <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                                    {isDefault && <Ionicons name="checkmark" size={18} color="white" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#1e1e1e', borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, padding: 20 },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { color: 'white', fontSize: 15, fontWeight: '600' },
    required: { color: '#ff5252' },
    input: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 15, color: 'white', fontSize: 15, borderWidth: 1, borderColor: '#333' },
    textArea: { height: 100, textAlignVertical: 'top' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#666', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    checkboxActive: { backgroundColor: '#2979ff', borderColor: '#2979ff' },
    checkboxLabel: { color: '#aaa', fontSize: 15 },
    footer: { flexDirection: 'row', padding: 20, gap: 15, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1e1e1e' },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#2b2b3b', borderWidth: 1, borderColor: '#666' },
    cancelButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#2979ff' },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});