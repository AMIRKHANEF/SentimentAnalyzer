import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './tabs/Home';
import TextSentimentScreen from './tabs/TextSentiment';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TextSentiment" component={TextSentimentScreen} />
      <Stack.Screen name="TextSentiment" component={TextSentimentScreen} />
    </Stack.Navigator>
  );
}

// const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <RootStack />;
}
