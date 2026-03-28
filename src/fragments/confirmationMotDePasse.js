import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';

const ConfirmationMotDePasse = ({ visible, onAnnuler, onConfirmer }) => {
    const [motDePasse, setMotDePasse] = useState('');

    const handleConfirmer = () => {
        onConfirmer(motDePasse);
        setMotDePasse('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onAnnuler}>
            <View className="flex-1 bg-black/60 items-center justify-center px-6">
                <View className="w-full bg-[#1a1535] rounded-2xl p-6 border border-[#2d2660]">
                    <Text className="text-white font-bold text-base mb-2">Supprimer le compte</Text>
                    <Text className="text-slate-400 text-sm mb-4">Confirmez votre mot de passe pour continuer.</Text>

                    <TextInput
                        className="bg-[#0d0b1e] text-white rounded-xl px-4 py-3 mb-4 border border-[#2d2660]"
                        placeholder="Mot de passe"
                        placeholderTextColor="#4b5563"
                        secureTextEntry
                        value={motDePasse}
                        onChangeText={setMotDePasse}
                        autoCapitalize="none"
                    />

                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={onAnnuler} className="flex-1 bg-[#0d0b1e] rounded-xl py-3 items-center border border-[#2d2660]">
                            <Text className="text-slate-400 font-semibold text-sm">Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirmer} className="flex-1 bg-red-600 rounded-xl py-3 items-center">
                            <Text className="text-white font-bold text-sm">Supprimer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationMotDePasse;