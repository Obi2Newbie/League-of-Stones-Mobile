const URL = "http://localhost:3001/";

const headers = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { 'www-authenticate': token } : {}),
});

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