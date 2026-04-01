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

// Refuser un défi d'un adversaire identifié par son matchmakingId
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