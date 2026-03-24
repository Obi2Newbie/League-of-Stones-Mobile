const URL = "http://localhost:3001/";


export const seConnecter = async (email, motDePasse) => {
    try {
        const chargeUtile = await fetch(`${URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "email": email, "password": motDePasse }),
        });
        return await chargeUtile.json();
    } catch (erreur) {
        // console.error("Erreur lors de la connexion:", erreur);
        return erreur;
    }
};

export const creerUnCompte = async (email, pseudo, motDePasse) => {
    try {
        const chargeUtile = await fetch(`${URL}user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'Application/json',
            },
            body: JSON.stringify({
                "email": email,
                "name": pseudo,
                "password": motDePasse
            }),
        });
        return await chargeUtile.json();
    } catch (erreur) {
        console.error("Erreur lors de la création de compte: erreur");
        return erreur;
    }
}