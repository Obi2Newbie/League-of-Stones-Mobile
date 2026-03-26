import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useUtilisateur } from '../context/ContexteUtilisateur';
import ToastBanner from '../fragments/toastBanner';

export default function MenuPrincipale() {
    const { donneeUtilisateur } = useUtilisateur();
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        showToast("Connexion réussie ! Heureux de vous revoir.", "success");
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ ...toast, visible: false }), 10000);
    };
    return (
        <>
            <ToastBanner
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, visible: false })}
            />
            <View>
                <Text>Bienvenue, {donneeUtilisateur?.name}</Text>
                <Text>Token: {donneeUtilisateur?.token}</Text>
            </View>
        </>
    );
}