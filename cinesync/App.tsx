import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './app/SignIn'
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";

const Stack = createNativeStackNavigator();

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            console.log(user)
            setUser(user)
        });
    }, [])
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='SignInScreen'>
                <Stack.Screen name='SignInScreen' component={SignInScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}