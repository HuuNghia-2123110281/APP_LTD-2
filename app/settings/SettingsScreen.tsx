import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>

                {/* Nhóm: Tài khoản */}
                <Text style={styles.sectionTitle}>Tài khoản</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="person-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Thông tin cá nhân</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Đổi mật khẩu</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>
                </View>

                {/* Nhóm: Ứng dụng */}
                <Text style={styles.sectionTitle}>Ứng dụng</Text>
                <View style={styles.section}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="notifications-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Thông báo</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#2979ff" }}
                            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                            onValueChange={() => setNotificationsEnabled(prev => !prev)}
                            value={notificationsEnabled}
                        />
                    </View>

                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="moon-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Chế độ tối</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#2979ff" }}
                            thumbColor={darkModeEnabled ? "#fff" : "#f4f3f4"}
                            onValueChange={() => setDarkModeEnabled(prev => !prev)}
                            value={darkModeEnabled}
                        />
                    </View>
                </View>

                {/* Nhóm: Thông tin */}
                <Text style={styles.sectionTitle}>Thông tin</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="information-circle-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Về ứng dụng</Text>
                        </View>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="document-text-outline" size={22} color="#888" />
                            <Text style={styles.itemText}>Điều khoản sử dụng</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    content: {
        padding: 20
    },
    sectionTitle: {
        color: '#2979ff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase'
    },
    section: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2b2b3b'
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    itemText: {
        color: 'white',
        fontSize: 16
    },
    versionText: {
        color: '#666',
        fontSize: 14
    }
});