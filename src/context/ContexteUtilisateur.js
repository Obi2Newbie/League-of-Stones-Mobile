import React, { createContext, useState, useContext } from 'react';

const ContexteUtilisateur = createContext();

export const UtilisateurProvider = ({ children }) => {
    const [donneeUtilisateur, setDonneeUtilisateur] = useState(null);

    return (
        <ContexteUtilisateur.Provider value={{ donneeUtilisateur, setDonneeUtilisateur }}>
            {children}
        </ContexteUtilisateur.Provider>
    );
};

export const useUtilisateur = () => useContext(ContexteUtilisateur);