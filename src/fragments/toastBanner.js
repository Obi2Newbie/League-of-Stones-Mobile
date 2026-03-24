import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, X } from 'lucide-react-native';

const ToastBanner = ({ visible, type = 'success', message, onClose }) => {
  if (!visible) return null;

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-500' : 'bg-emerald-500';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <View className="absolute top-0 left-0 right-0 z-50">
      <SafeAreaView edges={['top']} className={bgColor}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center flex-1">
            <Icon color="white" size={20} />
            <Text className="text-white font-medium ml-3 flex-1">
              {message}
            </Text>
          </View>
          
          <TouchableOpacity onPress={onClose}>
            <X color="white" size={20} opacity={0.7} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ToastBanner;