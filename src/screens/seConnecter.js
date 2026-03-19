import React, { useState } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Eye, EyeClosed, Lock, Mail } from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';

export default function SeConnecter() {
    const [emailActif, setEmailActif] = useState(false);
    const [motDePasseActif, setMotDePasseActif] = useState(false);
    const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const navigation = useNavigation();

    return (
        <ScrollView
            className="flex-1 bg-slate-50 dark:bg-slate-950"
            contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
            keyboardShouldPersistTaps="handled"
        >
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
                        <Text className="mr-3 text-base"><Mail /></Text>
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
                        <Text className="mr-3 text-base"><Lock /></Text>
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
                            {afficherMotDePasse ? <Eye /> : <EyeClosed />}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
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
        </ScrollView>
    );
}