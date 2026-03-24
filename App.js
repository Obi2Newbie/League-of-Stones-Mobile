import "./global.css";
import {createStaticNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SeConnecter from './src/screens/seConnecter';
import CreerUnCompte from './src/screens/creerUnCompte';

const pile = createNativeStackNavigator({
  screens: {
    SeConnecter: {
      screen: SeConnecter,
      options: {header: null},
    },
    CreerUnCompte: {
      screen: CreerUnCompte,
      options: {header: null},
    },
  },
});
const Navigation = createStaticNavigation(pile);
export default function App() {
  return (
    <Navigation/>
  );
}
