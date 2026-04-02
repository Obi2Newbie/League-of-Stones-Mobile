const URL = "http://localhost:3001/";

// Headers qui incluent le token d'authentification si disponible et qui sont utilisés pour toutes les requêtes nécessitant une authentification
const headers = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { 'www-authenticate': token } : {}),
});

// Fonctions d'API pour l'authentification et la gestion du compte utilisateur
export const seConnecter = async (email, motDePasse) => {
    try {
        const chargeUtile = await fetch(`${URL}login`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ "email": email, "password": motDePasse }),
        });
        return await chargeUtile.json();
    } catch (erreur) {
        return erreur;
    }
};

// Fonction d'API pour la création d'un compte utilisateur
export const creerUnCompte = async (email, pseudo, motDePasse) => {
    try {
        const chargeUtile = await fetch(`${URL}user`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({
                "email": email,
                "name": pseudo,
                "password": motDePasse
            }),
        });
        return await chargeUtile.json();
    } catch (erreur) {
        return erreur;
    }
}

// Fonction d'API pour la déconnexion de l'utilisateur
export const seDeconnecter = async (token) => {
    try {
        const chargeUtile = await fetch(`${URL}logout`, {
            method: 'POST',
            headers: headers(token),
        });
        return await chargeUtile.json();
    } catch (erreur) {
        return erreur;
    }
};

// Fonction d'API pour la suppression du compte utilisateur
export const supprimerCompte = async (email, motDePasse, token) => {
    try {
        const res = await fetch(`${URL}users/unsubscribe?email=${email}&password=${motDePasse}`, {
            method: 'GET',
            headers: headers(token),
        });
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return { data: text };
        }
    } catch (erreur) {
        return erreur;
    }
};

// Fonctions d'API pour le matchmaking et la gestion des défis
export const participer = async (token) => {
    try {
        const res = await fetch(`${URL}matchmaking/participate`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        // Le serveur renvoie { data: { matchmakingId, request } }
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};

// Récupérer la liste des joueurs actuellement en ligne et disponibles pour un défi
export const getJoueursEnLigne = async (token) => {
    try {
        const res = await fetch(`${URL}matchmaking/getAll`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        const liste = json.data ?? json;
        return Array.isArray(liste) ? liste : [];
    } catch (erreur) {
        return erreur;
    }
};

// Envoyer un défi à un adversaire identifié par son matchmakingId
export const envoyerDefi = async (matchmakingIdAdversaire, token) => {
    try {
        const res = await fetch(`${URL}matchmaking/request?matchmakingId=${matchmakingIdAdversaire}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};

// Accepter un défi d'un adversaire identifié par son matchmakingId
export const accepterDefi = async (matchmakingIdAdversaire, token) => {
    try {
        const res = await fetch(`${URL}matchmaking/acceptRequest?matchmakingId=${matchmakingIdAdversaire}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};

// Vérifier si un match est en cours pour cet utilisateur.
export const verifierMatch = async (token) => {
    try {
        const res = await fetch(`${URL}match/getMatch`, {
            method: 'GET',
            headers: headers(token),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? json;
    } catch {
        return null;
    }
};

// Récupérer toutes les cartes disponibles dans le jeu.
export const getCartes = async (token) => {
    try {
        const res = await fetch(`${URL}cards`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        const data = json.data ?? json;
        return Array.isArray(data) ? data : [];
    } catch (erreur) {
        return erreur;
    }
};

// Initialiser le deck pour le match en cours.
export const initDeck = async (deck, token) => {
    try {
        const deckEncode = encodeURIComponent(JSON.stringify(deck));
        const res = await fetch(`${URL}match/initDeck?deck=${deckEncode}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};

// Récupérer l'état complet du match en cours.
export const getMatch = async (token) => {
    try {
        const res = await fetch(`${URL}match/getMatch`, {
            method: 'GET',
            headers: headers(token),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? json;
    } catch {
        return null;
    }
};
 
// Piocher une carte depuis le deck (une fois par tour).
export const piocher = async (token) => {
    try {
        const res = await fetch(`${URL}match/pickCard`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};
 
//Poser une carte de la main sur le plateau.

export const jouerCarte = async (carteKey, token) => {
    try {
        const res = await fetch(`${URL}match/playCard?card=${carteKey}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};
 
// Attaquer une carte adverse sur le plateau.
export const attaquer = async (carteKey, carteEnnemie, token) => {
    try {
        const res = await fetch(`${URL}match/attack?card=${carteKey}&ennemyCard=${carteEnnemie}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};
 
//Attaquer directement les points de vie adverses (plateau adverse vide).
export const attaquerJoueur = async (carteKey, token) => {
    try {
        const res = await fetch(`${URL}match/attackPlayer?card=${carteKey}`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};
 
// Terminer son tour.
export const finirTour = async (token) => {
    try {
        const res = await fetch(`${URL}match/endTurn`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};
 
//Terminer le match (appeler quand les deux turn sont false).
export const finirMatch = async (token) => {
    try {
        const res = await fetch(`${URL}match/finishMatch`, {
            method: 'GET',
            headers: headers(token),
        });
        const json = await res.json();
        return json.data ?? json;
    } catch (erreur) {
        return erreur;
    }
};