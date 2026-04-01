import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StatusBar, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, CheckCircle, X } from 'lucide-react-native';

const ToastBanner = ({ visible, type, message, onClose }) => {
    const slideAnim = useRef(new Animated.Value(-200)).current;
    const insets = useSafeAreaInsets();

    const statusBarHeight = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? 24
        : insets.top;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -200,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const isError = type === 'error';
    const bgColor = isError ? '#dc2626' : '#2563eb';
    const iconColor = isError ? '#fecaca' : '#bfdbfe';
    const Icon = isError ? AlertTriangle : CheckCircle;

    // Always rendered — never return null
    return (
        <Animated.View
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
                styles.wrapper,
                { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] },
            ]}
        >
            <View style={{ height: statusBarHeight, backgroundColor: bgColor }} />
            <View style={styles.row}>
                <Icon color={iconColor} size={22} strokeWidth={2.5} />
                <View style={styles.textBlock}>
                    <Text style={styles.label}>
                        {isError ? 'Alerte Système' : 'Notification'}
                    </Text>
                    <Text style={styles.message} numberOfLines={3}>
                        {message}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X color="white" size={16} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    textBlock: {
        flex: 1,
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        opacity: 0.8,
        marginBottom: 2,
    },
    message: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 999,
    },
});

export default ToastBanner;