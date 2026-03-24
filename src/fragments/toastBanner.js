import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StatusBar, Platform } from 'react-native';
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
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -200, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const isError = type === 'error';
  const bgColor = isError ? '#dc2626' : '#2563eb';
  const iconColor = isError ? '#fecaca' : '#bfdbfe';
  const Icon = isError ? AlertTriangle : CheckCircle;

  return (
    <View
      className="absolute top-0 left-0 right-0 z-[9999]"
      style={{ backgroundColor: bgColor }}
    >
      {/* Explicit spacer that fills behind the status bar with solid color */}
      <View style={{ height: statusBarHeight, backgroundColor: bgColor }} />

      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <View className="flex-row items-center px-4 py-3" style={{ gap: 12 }}>
          <Icon color={iconColor} size={22} strokeWidth={2.5} />

          <View className="flex-1">
            <Text className="text-white font-bold text-xs uppercase tracking-widest opacity-80 mb-0.5">
              {isError ? 'Alerte Système' : 'Notification'}
            </Text>
            <Text className="text-white text-sm font-medium leading-5" numberOfLines={3}>
              {message}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="bg-white/20 p-2 rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color="white" size={16} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default ToastBanner;