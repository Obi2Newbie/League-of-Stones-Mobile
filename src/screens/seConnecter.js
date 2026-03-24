import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Eye, EyeClosed, Lock, Mail } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { seConnecter } from '../../api/request';
import Chargement from '../fragments/chargement';
import ToastBanner from '../fragments/toastBanner';


export default function SeConnecter() {
    const [emailActif, setEmailActif] = useState(false);
    const [motDePasseActif, setMotDePasseActif] = useState(false);
    const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const navigation = useNavigation();
    const { colorScheme } = useColorScheme();
    const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
    const [donnee, setDonnee] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const route = useRoute();

    useEffect(() => {
        const { toastMessage, toastType } = route.params ?? {};
        if (toastMessage) {
            showToast(toastMessage, toastType ?? 'success');
            navigation.setParams({ toastMessage: undefined, toastType: undefined });
        }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ ...toast, visible: false }), 10000);
    };

    const triggerShake = () => {
        setErreur(true);

        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const connecter = async () => {
        setErreur(false);

        if (!email || !motDePasse) {
            showToast("Veuillez remplir tous les champs.", "error");
            triggerShake();
            return;
        }
        setChargement(true);
        try {
            const response = await seConnecter(email, motDePasse);
            if (response && response.token) {
                setDonnee(response);
                showToast("Connexion réussie!", "success");
            } else {
                let messageErr = `Erreur de connexion: ${response.message}` || "Réponse inattendue";
                showToast(messageErr, "error");
                triggerShake();
            }
        } catch (error) {
            let messageErr = `Erreur de connexion:", ${error.message}` || "Réponse inattendue";
            showToast(messageErr, "error");
            triggerShake();
        } finally {
            setChargement(false);
        }
    };

    return (
        <>
            <ToastBanner
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, visible: false })}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
            >
                <ScrollView
                    className="flex-1 bg-slate-50 dark:bg-slate-950"
                    contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 flex-grow items-center justify-center w-full">
                        <TouchableOpacity className="mb-10 items-center">
                            <Image
                                className="w-48 h-48"
                                source={require("../../assets/logo.png")}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        <View className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-lg px-6 pt-8 pb-10">

                            <Text className="text-sm text-slate-400 dark:text-slate-500 mb-8">
                                Connectez-vous pour continuer
                            </Text>

                            <View className="mb-5">
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                    Adresse e-mail
                                </Text>
                                <View className={`flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 border-2 ${emailActif ? 'border-blue-500' : 'border-transparent'}`}>
                                    <Text className="mr-3 text-base"><Mail color={iconColor} /></Text>
                                    <TextInput
                                        className="flex-1 text-sm text-slate-800 dark:text-white"
                                        placeholder="john@doe.com"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setEmailActif(true)}
                                        onBlur={() => setEmailActif(false)}
                                    />
                                </View>
                            </View>

                            <View className="mb-2">
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                    Mot de passe
                                </Text>
                                <View className={`flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 border-2 ${motDePasseActif ? 'border-blue-500' : 'border-transparent'}`}>
                                    <Text className="mr-3 text-base"><Lock color={iconColor} /></Text>
                                    <TextInput
                                        className="flex-1 text-sm text-slate-800 dark:text-white"
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        secureTextEntry={!afficherMotDePasse}
                                        value={motDePasse}
                                        onChangeText={setMotDePasse}
                                        onFocus={() => setMotDePasseActif(true)}
                                        onBlur={() => setMotDePasseActif(false)}
                                    />
                                    <TouchableOpacity onPress={() => setAfficherMotDePasse(!afficherMotDePasse)} activeOpacity={0.7}>
                                        {afficherMotDePasse ? <Eye color={iconColor} /> : <EyeClosed color={iconColor} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={connecter}
                                className="w-full bg-blue-500 rounded-xl py-4 items-center mb-6 active:bg-blue-600"
                                activeOpacity={0.85}
                            >
                                <Text className="text-white font-bold text-sm tracking-wide">
                                    Se connecter
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center mb-6">
                                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <Text className="mx-3 text-xs text-slate-400">ou</Text>
                                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            </View>

                            <View className="flex-row justify-center items-center">
                                <Text className="text-sm text-slate-400 dark:text-slate-500">
                                    Pas encore de compte ?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('CreerUnCompte')} activeOpacity={0.7}>
                                    <Text className="text-sm font-bold text-blue-500">
                                        Créez-en un
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </Animated.View>
                </ScrollView>
                {chargement && <Chargement visible={chargement} />}
            </KeyboardAvoidingView>
        </>
    );
}