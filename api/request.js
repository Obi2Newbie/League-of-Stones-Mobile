const URL = "http://localhost:3001/";

const APIrequest = () => {
    const seConnecter = async (email, motDePasse) => {
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
            console.error("Erreur lors de la connexion:", erreur);
            return erreur;
        }
    };

    return { seConnecter };
};

export default APIrequest;