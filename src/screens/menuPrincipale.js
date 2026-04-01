import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Settings, Swords, Shield } from 'lucide-react-native';
import { useUtilisateur } from '../context/ContexteUtilisateur';
import ToastBanner from '../fragments/toastBanner';
import Chargement from '../fragments/chargement';
import Pile from '../fragments/pile';
import ConfirmationMotDePasse from '../fragments/confirmationMotDePasse';
import { seDeconnecter, supprimerCompte, participer, getJoueursEnLigne } from '../../api/request';

// Carte joueur en ligne 
function CarteJoueur({ joueur, onDefier }) {
    return (
        <View className="flex-row items-center bg-[#1a1535] rounded-xl mb-3 overflow-hidden border border-[#2d2660]">
            <View className="w-20 h-16 bg-[#0d0b1e] items-center justify-center">
                <Shield color="#4f46e5" size={28} />
            </View>
            <View className="flex-1 px-3">
                <Text className="text-white font-semibold text-sm">@{joueur.name}</Text>
                <Text className="text-purple-400 text-xs mt-0.5">En ligne</Text>
            </View>
            <TouchableOpacity
                onPress={() => onDefier(joueur)}
                className="bg-blue-600 rounded-lg px-4 py-2 mr-3 active:bg-blue-700"
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold text-xs">Défier</Text>
            </TouchableOpacity>
        </View>
    );
}

// Carte défi reçu
function CarteDefi({ defi, onAccepter }) {
    return (
        <View className="flex-row items-center bg-[#1a1535] rounded-xl mb-3 overflow-hidden border border-purple-800">
            <View className="w-20 h-16 bg-[#0d0b1e] items-center justify-center">
                <Swords color="#a855f7" size={28} />
            </View>
            <View className="flex-1 px-3">
                <Text className="text-white font-semibold text-sm">@{defi.name}</Text>
                <Text className="text-purple-400 text-xs mt-0.5">Veut jouer</Text>
            </View>
            <TouchableOpacity
                onPress={() => onAccepter(defi)}
                className="bg-purple-700 rounded-lg px-4 py-2 mr-3 active:bg-purple-800"
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold text-xs">Accepter</Text>
            </TouchableOpacity>
        </View>
    );
}

// Menu principal 
export default function MenuPrincipale() {
    const { donneeUtilisateur, setDonneeUtilisateur } = useUtilisateur();

    const [joueursEnLigne, setJoueursEnLigne] = useState([]);
    const [defisRecus, setDefisRecus] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [raffraichissement, setRaffraichissement] = useState(true);
    const [pileVisible, setPileVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 6000);
    };

    const rafraichir = async () => {
        try {
            const data = await participer(donneeUtilisateur?.token);
            if (data?.request) setDefisRecus(data.request);

            const liste = await getJoueursEnLigne(donneeUtilisateur?.token);
            if (Array.isArray(liste)) setJoueursEnLigne(liste);
        } catch (erreur) {

        } finally {
            setRaffraichissement(false);
        }
    };

    useEffect(() => {
        showToast("Connexion réussie ! Heureux de vous revoir.", "success");
        rafraichir();
        const intervalle = setInterval(rafraichir, 10000);
        return () => clearInterval(intervalle);
    }, []);

    // Déconnexion
    const deconnecter = async () => {
        setPileVisible(false);
        setChargement(true);
        try {
            await seDeconnecter(donneeUtilisateur?.token);
        } finally {
            setChargement(false);
            setDonneeUtilisateur(null);
        }
    };

    // Suppression de compte — étape 1 : ouvrir la confirmation 
    const supprimerLeCompte = () => {
        setPileVisible(false);
        setConfirmationVisible(true);
    };

    // Suppression de compte — étape 2 : appel API avec le mot de passe
    const confirmerSuppression = async (motDePasse) => {
        setConfirmationVisible(false);
        setChargement(true);
        try {
            const res = await supprimerCompte(
                donneeUtilisateur?.email,
                motDePasse,
                donneeUtilisateur?.token
            );
            if (res?.data === "User deleted") {
                setDonneeUtilisateur(null);
            } else {
                showToast(res?.data || res?.message || "Erreur lors de la suppression.", "error");
            }
        } catch (erreur) {
            showToast("Impossible de supprimer le compte.", "error");
        } finally {
            setChargement(false);
        }
    };

    const defier = (joueur) => {
        showToast(`Défi envoyé à @${joueur.name} !`, "success");
        // TODO: envoyerDefi(joueur.matchmakingId, donneeUtilisateur?.token)
    };

    const accepterDefi = (defi) => {
        showToast(`Vous acceptez le défi de @${defi.name} !`, "success");
        // TODO: accepterDefi(defi.matchmakingId, donneeUtilisateur?.token)
    };

    return (
        <>
            <ToastBanner
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(t => ({ ...t, visible: false }))}
            />

            <View className="flex-1 bg-[#0d0b1e]">

                <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
                    <View className="w-8" />
                    <Image
                        source={require("../../assets/logo.png")}
                        className="w-16 h-16"
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        onPress={() => setPileVisible(true)}
                        className="w-8 h-8 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Settings color="#a78bfa" size={22} />
                    </TouchableOpacity>
                </View>

                <Text className="text-white text-xl font-bold text-center mb-6">
                    Recherche de match
                </Text>

                <ScrollView
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    <Text className="text-white font-bold text-base mb-3">
                        Joueurs en ligne [{joueursEnLigne.length}]
                    </Text>

                    {raffraichissement ? (
                        <ActivityIndicator color="#7c3aed" className="my-6" />
                    ) : joueursEnLigne.length === 0 ? (
                        <View className="bg-[#1a1535] rounded-xl p-6 items-center mb-6 border border-[#2d2660]">
                            <Text className="text-slate-500 text-sm">Aucun joueur en ligne</Text>
                        </View>
                    ) : (
                        joueursEnLigne.map((joueur, i) => (
                            <CarteJoueur key={joueur.matchmakingId ?? i} joueur={joueur} onDefier={defier} />
                        ))
                    )}

                    <Text className="text-white font-bold text-base mb-3 mt-2">
                        Défis reçus [{defisRecus.length}]
                    </Text>

                    {defisRecus.length === 0 ? (
                        <View className="bg-[#1a1535] rounded-xl p-6 items-center border border-[#2d2660]">
                            <Text className="text-slate-500 text-sm">Aucun défi reçu</Text>
                        </View>
                    ) : (
                        defisRecus.map((defi, i) => (
                            <CarteDefi key={defi.matchmakingId ?? i} defi={defi} onAccepter={accepterDefi} />
                        ))
                    )}
                </ScrollView>

                <TouchableOpacity
                    className="w-full bg-blue-500 rounded-xl py-4 items-center active:bg-blue-600"
                    activeOpacity={0.85}
                >
                    <Text className="text-white font-bold text-sm tracking-wide">
                        Trouver une partie
                    </Text>
                </TouchableOpacity>
            </View>

            <Pile
                visible={pileVisible}
                utilisateur={donneeUtilisateur}
                onFermer={() => setPileVisible(false)}
                onDeconnecter={deconnecter}
                onSupprimerCompte={supprimerLeCompte}
            />

            <ConfirmationMotDePasse
                visible={confirmationVisible}
                onAnnuler={() => setConfirmationVisible(false)}
                onConfirmer={confirmerSuppression}
            />

            {chargement && <Chargement visible={chargement} />}
        </>
    );
}