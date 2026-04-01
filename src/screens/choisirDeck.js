import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity,
    ScrollView, ActivityIndicator, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUtilisateur } from '../context/ContexteUtilisateur';
import ToastBanner from '../fragments/toastBanner';
import Chargement from '../fragments/chargement';
import { getCartes, initDeck } from '../../api/request';

const MAX_DECK = 20;
const COLS = 3;

// URL de base pour les splash arts Riot
const splashUrl = (key) =>
    `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;

// Composant pour afficher une tuile de champion dans la grille de sélection

function TuileChampion({ carte, selectionne, onPress, petit = false }) {
    const taille = petit ? 'w-24 h-16' : 'w-28 h-20';

    return (
        <TouchableOpacity
            onPress={() => onPress(carte)}
            activeOpacity={0.75}
            className={`${taille} rounded-lg overflow-hidden m-1 ${selectionne ? 'border-2 border-yellow-400' : 'border border-transparent'}`}
        >
            <Image
                source={{ uri: splashUrl(carte.key) }}
                className="w-full h-full"
                resizeMode="cover"
            />
            {selectionne && (
                <View className="absolute inset-0 bg-yellow-400/20 items-center justify-center">
                    <Text className="text-yellow-300 font-bold text-xs">✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}


export default function ChoisirDeck() {
    const { donneeUtilisateur } = useUtilisateur();
    const navigation = useNavigation();

    const [cartes, setCartes] = useState([]);
    const [deck, setDeck] = useState([]);          // tableau de clés sélectionnées
    const [chargement, setChargement] = useState(false);
    const [chargementCartes, setChargementCartes] = useState(true);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 6000);
    };

    // Charger les cartes disponibles depuis l'API au montage du composant

    useEffect(() => {
        const charger = async () => {
            try {
                const data = await getCartes(donneeUtilisateur?.token);
                setCartes(data);
            } catch (err) {
                showToast("Impossible de charger les cartes.", "error");
            } finally {
                setChargementCartes(false);
            }
        };
        charger();
    }, []);

    // Gerer la sélection/désélection d'une carte dans le deck

    const toggleCarte = (carte) => {
        const dejaDans = deck.includes(carte.key);

        if (dejaDans) {
            setDeck(d => d.filter(k => k !== carte.key));
            return;
        }
        if (deck.length >= MAX_DECK) {
            showToast(`Maximum ${MAX_DECK} cartes dans un deck.`, "error");
            return;
        }
        setDeck(d => [...d, carte.key]);
    };

    // Soumettre le deck sélectionné à l'API pour validation et démarrer la partie
    const soumettreDeck = async () => {
        if (deck.length === 0) {
            showToast("Sélectionnez au moins une carte.", "error");
            return;
        }
        setChargement(true);
        try {
            const payload = deck.map(k => ({ key: k }));
            const res = await initDeck(payload, donneeUtilisateur?.token);
            if (res && !res.message) {
                showToast("Deck validé ! La partie commence.", "success");
                navigation.navigate('Jeu');
            } else {
                showToast(res?.message || "Erreur lors de la validation du deck.", "error");
            }
        } catch {
            showToast("Erreur réseau.", "error");
        } finally {
            setChargement(false);
        }
    };

    const cartesSelectionnees = cartes.filter(c => deck.includes(c.key));
    const deckPlein = deck.length >= MAX_DECK;

    // Découper les cartes en lignes de COLS pour la grille
    const lignes = [];
    for (let i = 0; i < cartes.length; i += COLS) {
        lignes.push(cartes.slice(i, i + COLS));
    }

    return (
        <>
            <ToastBanner
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(t => ({ ...t, visible: false }))}
            />

            <ScrollView
                className="flex-1 bg-[#1a0800]"
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View className="items-center pt-14 pb-4">
                    <Image
                        source={require("../../assets/logo.png")}
                        className="w-24 h-24"
                        resizeMode="contain"
                    />
                </View>

                {/* Titre */}
                <Text className="text-yellow-400 text-2xl font-bold text-center mb-6"
                    style={{ fontFamily: 'serif' }}>
                    Planificateur d'équipe
                </Text>

                {/* Grille des champions disponibles */}
                {chargementCartes ? (
                    <ActivityIndicator color="#facc15" size="large" className="my-10" />
                ) : (
                    <View className="items-center px-2">
                        {lignes.map((ligne, li) => (
                            <View key={li} className="flex-row justify-center">
                                {ligne.map(carte => (
                                    <TuileChampion
                                        key={carte.key}
                                        carte={carte}
                                        selectionne={deck.includes(carte.key)}
                                        onPress={toggleCarte}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Séparateur */}
                <View className="flex-row items-center px-6 my-6">
                    <View className="flex-1 h-px bg-yellow-800" />
                    <Text className="text-yellow-400 font-bold text-base mx-4">Mon équipe</Text>
                    <View className="flex-1 h-px bg-yellow-800" />
                </View>

                {/* Deck sélectionné */}
                <View className="items-center px-2 min-h-20">
                    {cartesSelectionnees.length === 0 ? (
                        <Text className="text-yellow-900 text-sm italic mt-4">
                            Aucune carte sélectionnée
                        </Text>
                    ) : (
                        <View className="flex-row flex-wrap justify-center">
                            {cartesSelectionnees.map(carte => (
                                <TuileChampion
                                    key={carte.key}
                                    carte={carte}
                                    selectionne={true}
                                    onPress={toggleCarte}
                                    petit
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Compteur */}
                <Text className={`text-center font-bold text-sm mt-4 mb-6 ${deckPlein ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Max: {deck.length}/{MAX_DECK} cartes
                </Text>

                <View className="px-8">
                    <TouchableOpacity
                        onPress={soumettreDeck}
                        disabled={deck.length === 0}
                        activeOpacity={0.8}
                        className={`rounded-lg py-4 items-center border ${deck.length === 0
                                ? 'bg-transparent border-slate-700'
                                : 'bg-blue-600 border-blue-500'
                            }`}
                    >
                        <Text className={`font-bold text-sm tracking-wide ${deck.length === 0 ? 'text-slate-600' : 'text-white'
                            }`}>
                            {deck.length === 0 ? 'Deck is pending' : `Valider le deck (${deck.length})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {chargement && <Chargement visible={chargement} />}
        </>
    );
}