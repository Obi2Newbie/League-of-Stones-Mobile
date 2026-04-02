import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, Image, TouchableOpacity,
    ScrollView, ActivityIndicator, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Swords, Heart, Layers, SkipForward, Trophy, Skull } from 'lucide-react-native';
import { useUtilisateur } from '../context/ContexteUtilisateur';
import ToastBanner from '../fragments/toastBanner';
import Chargement from '../fragments/chargement';
import {
    getMatch,
    piocher,
    jouerCarte,
    attaquer,
    attaquerJoueur,
    finirTour,
    finirMatch,
} from '../../api/request';

const splashUrl = (key) =>
    `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;

// ─── Carte champion ───────────────────────────────────────────────────────────

function CarteChampion({ carte, selectionne, desactivee, onPress, petit = false }) {
    return (
        <TouchableOpacity
            onPress={() => !desactivee && onPress?.(carte)}
            activeOpacity={desactivee ? 1 : 0.75}
            className={`${petit ? 'w-16 h-20' : 'w-20 h-28'} rounded-lg overflow-hidden mx-1 bg-[#0d0b1e]
                border ${selectionne ? 'border-yellow-400' : 'border-[#2d2660]'}
                ${desactivee ? 'opacity-50' : 'opacity-100'}`}
        >
            <Image
                source={{ uri: splashUrl(carte.key) }}
                className="absolute w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute bottom-4 left-1 bg-red-600 rounded px-1">
                <Text className="text-white font-bold text-[9px]">{carte.info?.attack ?? '?'}</Text>
            </View>
            <View className="absolute bottom-4 right-1 bg-blue-600 rounded px-1">
                <Text className="text-white font-bold text-[9px]">{carte.info?.defense ?? '?'}</Text>
            </View>
            <View className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 px-1">
                <Text className="text-white text-[8px] font-semibold text-center" numberOfLines={1}>
                    {carte.name}
                </Text>
            </View>
            {selectionne && <View className="absolute inset-0 bg-yellow-400/20 border-2 border-yellow-400 rounded-lg" />}
            {desactivee && <View className="absolute inset-0 bg-black/40" />}
        </TouchableOpacity>
    );
}

// ─── Carte dos ────────────────────────────────────────────────────────────────

function CarteDos() {
    return (
        <View className="w-14 h-20 rounded-lg bg-[#1e1b4b] border border-[#4c1d95] items-center justify-center mx-1">
            <Text className="text-purple-500 font-bold text-xl">?</Text>
        </View>
    );
}

// ─── Barre de vie ─────────────────────────────────────────────────────────────

function BarreVie({ hp, maxHp = 150, nom, monTour }) {
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    const couleur = pct > 0.5 ? 'bg-green-500' : pct > 0.25 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white font-bold text-sm">{nom}</Text>
                {monTour && (
                    <View className="bg-purple-600 rounded-full px-2 py-0.5">
                        <Text className="text-white text-[10px] font-bold">Votre tour</Text>
                    </View>
                )}
            </View>
            <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <View className={`h-full rounded-full ${couleur}`} style={{ width: `${pct * 100}%` }} />
            </View>
            <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
                <Heart color="#ef4444" size={10} />
                <Text className="text-slate-400 text-[10px]">{hp} / {maxHp}</Text>
            </View>
        </View>
    );
}

// ─── Modal fin de match ───────────────────────────────────────────────────────

function ModalFinMatch({ visible, gagne, onFermer }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/85 items-center justify-center px-6">
                <View className="w-full bg-[#1a1535] rounded-2xl p-8 items-center border border-[#2d2660]"
                    style={{ gap: 12 }}>
                    {gagne ? <Trophy color="#facc15" size={52} /> : <Skull color="#ef4444" size={52} />}
                    <Text className={`text-3xl font-bold ${gagne ? 'text-yellow-400' : 'text-red-400'}`}>
                        {gagne ? 'Victoire !' : 'Défaite...'}
                    </Text>
                    <Text className="text-slate-400 text-sm text-center">
                        {gagne ? 'Bien joué !' : 'Meilleure chance la prochaine fois.'}
                    </Text>
                    <TouchableOpacity
                        onPress={onFermer}
                        className="mt-2 bg-purple-600 rounded-xl px-8 py-3"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-sm">Retour au menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── Écran de jeu ─────────────────────────────────────────────────────────────

export default function Jeu() {
    const { donneeUtilisateur } = useUtilisateur();
    const navigation = useNavigation();
    const token = donneeUtilisateur?.token;

    const [match, setMatch] = useState(null);
    const [monRole, setMonRole] = useState(null); // 'player1' | 'player2'
    const [chargement, setChargement] = useState(false);
    const [chargementInitial, setChargementInitial] = useState(true);
    const [carteSelectionnee, setCarteSelectionnee] = useState(null);
    const [finVisible, setFinVisible] = useState(false);
    const [gagne, setGagne] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 5000);
    };

    // Stocker monRole dès que les IDs sont disponibles 

    useEffect(() => {
        if (!monRole && match?.player1?.id) {
            setMonRole(
                donneeUtilisateur?.id === match.player1.id ? 'player1' : 'player2'
            );
        }
    }, [match, monRole, donneeUtilisateur?.id]);

    // Identifier moi vs adversaire 

    const moi = monRole ?? (
        donneeUtilisateur?.id === match?.player1?.id ? 'player1' : 'player2'
    );
    const adversaire = moi === 'player1' ? 'player2' : 'player1';
    const moiData = moi ? match?.[moi] : null;
    const adversaireData = moi ? match?.[adversaire] : null;
    const monTour = moiData?.turn === true;



    const rafraichirMatch = useCallback(async () => {
        const data = await getMatch(token);
        if (!data) return;
        setMatch(data);

        const hp1 = data.player1?.hp ?? 150;
        const hp2 = data.player2?.hp ?? 150;
        const partieTerminee = hp1 <= 0 || hp2 <= 0;

        if (partieTerminee) {
            // monRole peut ne pas encore être défini ici, on le recalcule localement
            setMonRole(prev => {
                const role = prev ?? (
                    donneeUtilisateur?.id === data.player1?.id ? 'player1' : 'player2'
                );
                const moiHp = role === 'player1' ? hp1 : hp2;
                setGagne(moiHp > 0);
                return role;
            });
            setFinVisible(true);
        }
    }, [token, donneeUtilisateur?.id]);

    useEffect(() => {
        const init = async () => {
            await rafraichirMatch();
            setChargementInitial(false);
        };
        init();
        const intervalle = setInterval(rafraichirMatch, 5000);
        return () => clearInterval(intervalle);
    }, [rafraichirMatch]);

    // Fonction d'action avec gestion du chargement et des erreurs
    const action = async (fn, ...args) => {
        if (chargement) return;
        setChargement(true);
        try {
            const res = await fn(...args, token);
            if (res?.ok === false) {
                showToast(res.message || 'Erreur inconnue.', 'error');
            } else {
                await rafraichirMatch();
            }
        } catch {
            showToast('Erreur réseau.', 'error');
        } finally {
            setChargement(false);
        }
    };

    // Handlers des actions du jeu

    const handlePiocher = () => action(piocher);

    const handleJouerCarte = (carte) => {
        if (!monTour) return;
        action(jouerCarte, carte.key);
    };

    const handleSelectionnePlateau = (carte) => {
        if (!monTour) return;
        if (carte.attack === true) {
            showToast(`${carte.name} ne peut pas attaquer ce tour.`, 'error');
            return;
        }
        setCarteSelectionnee(c => c?.key === carte.key ? null : carte);
    };

    const handleAttaquerCarte = (carteAdverse) => {
        if (!carteSelectionnee) {
            showToast("Sélectionnez d'abord une de vos cartes.", 'error');
            return;
        }
        action(attaquer, carteSelectionnee.key, carteAdverse.key);
        setCarteSelectionnee(null);
    };

    const handleAttaquerJoueur = () => {
        if (!carteSelectionnee) {
            showToast("Sélectionnez d'abord une de vos cartes.", 'error');
            return;
        }
        action(attaquerJoueur, carteSelectionnee.key);
        setCarteSelectionnee(null);
    };

    const handleFinirTour = () => {
        setCarteSelectionnee(null);
        action(finirTour);
    };

    const handleFinirMatch = async () => {
        setFinVisible(false);
        setChargement(true);
        try { await finirMatch(token); } finally {
            setChargement(false);
            navigation.navigate('MenuPrincipale');
        }
    };

    // Chargement initial 
    if (chargementInitial) {
        return (
            <View className="flex-1 bg-[#0d0b1e] items-center justify-center" style={{ gap: 12 }}>
                <ActivityIndicator color="#7c3aed" size="large" />
                <Text className="text-slate-400 text-sm">Chargement de la partie...</Text>
            </View>
        );
    }

    // Données pour le rendu (avec sécurisation
    const mainMoi = Array.isArray(moiData?.hand) ? moiData.hand : [];
    const plateauMoi = Array.isArray(moiData?.board) ? moiData.board : [];
    const plateauAdversaire = Array.isArray(adversaireData?.board) ? adversaireData.board : [];
    const mainAdversaireCount = typeof adversaireData?.hand === 'number'
        ? adversaireData.hand : (adversaireData?.hand?.length ?? 0);
    const deckCount = typeof moiData?.deck === 'number'
        ? moiData.deck : (moiData?.deck?.length ?? 0);
    const plateauAdversaireVide = plateauAdversaire.length === 0;

    return (
        <>
            <ToastBanner
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(t => ({ ...t, visible: false }))}
            />

            <View className="flex-1 bg-[#0d0b1e]">

                {/* ── Zone adversaire ── */}
                <View className="bg-[#130f2a] border-b border-[#2d2660] px-3 pt-12 pb-3">
                    <BarreVie
                        hp={adversaireData?.hp ?? 150}
                        nom={adversaireData?.name ?? 'Adversaire'}
                        monTour={!monTour}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', paddingVertical: 4 }}>
                        {Array.from({ length: mainAdversaireCount }).map((_, i) => (
                            <CarteDos key={i} />
                        ))}
                    </ScrollView>
                </View>

                {/* ── Plateau adversaire ── */}
                <View className="flex-1 px-3 py-2">
                    <Text className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest mb-1">
                        Plateau adverse
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                        {plateauAdversaire.length === 0
                            ? <Text className="text-slate-700 text-xs italic">Aucune carte</Text>
                            : plateauAdversaire.map((carte, i) => (
                                <CarteChampion
                                    key={carte.key ?? i}
                                    carte={carte}
                                    onPress={carteSelectionnee ? handleAttaquerCarte : undefined}
                                    desactivee={!carteSelectionnee || !monTour}
                                    petit
                                />
                            ))
                        }
                    </ScrollView>

                    {plateauAdversaireVide && carteSelectionnee && monTour && (
                        <TouchableOpacity
                            onPress={handleAttaquerJoueur}
                            className="self-center flex-row items-center bg-red-600 rounded-lg px-4 py-2 mt-2"
                            style={{ gap: 6 }}
                            activeOpacity={0.8}
                        >
                            <Swords color="white" size={14} />
                            <Text className="text-white font-bold text-xs">
                                Attaquer {adversaireData?.name ?? "l'adversaire"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Séparateur ── */}
                <View className="flex-row items-center px-4 my-1">
                    <View className="flex-1 h-px bg-[#2d2660]" />
                    <View className="w-8 h-8 rounded-full bg-[#1a1535] border border-[#7c3aed] items-center justify-center mx-2">
                        <Swords color="#7c3aed" size={14} />
                    </View>
                    <View className="flex-1 h-px bg-[#2d2660]" />
                </View>

                {/* ── Plateau joueur ── */}
                <View className="flex-1 px-3 py-2">
                    <Text className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest mb-1">
                        Votre plateau
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                        {plateauMoi.length === 0
                            ? <Text className="text-slate-700 text-xs italic">Aucune carte posée</Text>
                            : plateauMoi.map((carte, i) => (
                                <CarteChampion
                                    key={carte.key ?? i}
                                    carte={carte}
                                    selectionne={carteSelectionnee?.key === carte.key}
                                    desactivee={!monTour || carte.attack === true}
                                    onPress={handleSelectionnePlateau}
                                    petit
                                />
                            ))
                        }
                    </ScrollView>
                    {carteSelectionnee && (
                        <Text className="text-yellow-400 text-[10px] italic text-center mt-1">
                            {carteSelectionnee.name} prêt à attaquer — ciblez une carte adverse
                        </Text>
                    )}
                </View>

                {/* ── Zone joueur ── */}
                <View className="bg-[#130f2a] border-t border-[#2d2660] px-3 pt-3 pb-8">
                    <BarreVie
                        hp={moiData?.hp ?? 150}
                        nom={donneeUtilisateur?.name ?? 'Vous'}
                        monTour={monTour}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', paddingVertical: 4 }}>
                        {mainMoi.map((carte, i) => (
                            <CarteChampion
                                key={carte.key ?? i}
                                carte={carte}
                                onPress={monTour ? handleJouerCarte : undefined}
                                desactivee={!monTour}
                            />
                        ))}
                    </ScrollView>

                    {/* Boutons d'action */}
                    <View className="flex-row items-center mt-3" style={{ gap: 8 }}>
                        <View className="flex-row items-center bg-slate-800 rounded-lg px-2 py-2" style={{ gap: 4 }}>
                            <Layers color="#94a3b8" size={14} />
                            <Text className="text-slate-400 font-bold text-xs">{deckCount}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handlePiocher}
                            disabled={!monTour || moiData?.cardPicked === true}
                            className={`bg-slate-800 rounded-lg px-4 py-2 border border-slate-700
                                ${(!monTour || moiData?.cardPicked) ? 'opacity-40' : 'opacity-100'}`}
                            activeOpacity={0.8}
                        >
                            <Text className="text-blue-400 font-semibold text-sm">Piocher</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleFinirTour}
                            disabled={!monTour}
                            className={`flex-1 flex-row items-center justify-center bg-purple-700 rounded-lg py-2
                                ${!monTour ? 'opacity-40' : 'opacity-100'}`}
                            style={{ gap: 6 }}
                            activeOpacity={0.8}
                        >
                            <SkipForward color="white" size={14} />
                            <Text className="text-white font-bold text-sm">Fin du tour</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            <ModalFinMatch visible={finVisible} gagne={gagne} onFermer={handleFinirMatch} />
            {chargement && <Chargement visible={chargement} />}
        </>
    );
}