import "./global.css";
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SeConnecter from './src/screens/seConnecter';
import CreerUnCompte from './src/screens/creerUnCompte';
import MenuPrincipale from "./src/screens/menuPrincipale";
import { UtilisateurProvider, useUtilisateur } from "./src/context/ContexteUtilisateur";
import ChoisirDeck from "./src/screens/choisirDeck";
import Jeu from "./src/screens/jeu";

const ecransAuth = {
  SeConnecter: {
    screen: SeConnecter,
    options: { headerShown: false },
  },
  CreerUnCompte: {
    screen: CreerUnCompte,
    options: { headerShown: false },
  },
};

const ecransApp = {
  MenuPrincipale: {
    screen: MenuPrincipale,
    options: { headerShown: false }
  },
  ChoisirDeck: {
    screen: ChoisirDeck,
    options: { headerShown: false },
  },
  Jeu: {
    screen: Jeu,
    options: { headerShown: false },
  },
};

function ContenuNavigation() {
  const { donneeUtilisateur } = useUtilisateur();
  const pileDynamique = createNativeStackNavigator({
    screens: donneeUtilisateur ? ecransApp : ecransAuth,
  });

  const Navigation = createStaticNavigation(pileDynamique);

  return <Navigation />;
}

export default function App() {
  return (
    <UtilisateurProvider>
      <ContenuNavigation />
    </UtilisateurProvider>
  );
}
