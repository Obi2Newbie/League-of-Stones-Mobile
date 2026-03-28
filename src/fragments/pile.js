import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { LogOut, UserX, X } from 'lucide-react-native';

const Pile = ({ visible, utilisateur, onFermer, onDeconnecter, onSupprimerCompte }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 300, duration: 220, useNativeDriver: true }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onFermer}>
            <TouchableOpacity style={styles.fond} activeOpacity={1} onPress={onFermer} />

            <Animated.View style={[styles.feuille, { transform: [{ translateY: slideAnim }] }]}>

                <View style={styles.poignee} />

                <View style={styles.row}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarLettre}>
                            {utilisateur?.name?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.nom}>{utilisateur?.name}</Text>
                        <Text style={styles.email}>{utilisateur?.email}</Text>
                    </View>
                    <TouchableOpacity onPress={onFermer} style={styles.btnFermer} activeOpacity={0.7}>
                        <X color="#6b7280" size={18} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={onDeconnecter} style={styles.bouton} activeOpacity={0.8}>
                    <LogOut color="#60a5fa" size={20} />
                    <Text style={styles.boutonTexteBleu}>Se déconnecter</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onSupprimerCompte} style={[styles.bouton, { marginBottom: 0 }]} activeOpacity={0.8}>
                    <UserX color="#f87171" size={20} />
                    <Text style={styles.boutonTexteRouge}>Supprimer mon compte</Text>
                </TouchableOpacity>

            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fond: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    feuille: {
        backgroundColor: '#1a1535',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderColor: '#2d2660',
    },
    poignee: {
        width: 40,
        height: 4,
        backgroundColor: '#475569',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0d0b1e',
        borderWidth: 1,
        borderColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLettre: {
        color: '#a78bfa',
        fontWeight: 'bold',
        fontSize: 18,
    },
    nom: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    email: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    btnFermer: {
        padding: 8,
    },
    bouton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0d0b1e',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2d2660',
    },
    boutonTexteBleu: {
        color: '#60a5fa',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 12,
    },
    boutonTexteRouge: {
        color: '#f87171',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 12,
    },
});

export default Pile;