import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './tabs/Home';
import TextSentimentScreen from './tabs/TextSentiment';
import ImageSentimentScreen from './tabs/ImageSentiment';

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TextSentiment" component={TextSentimentScreen} />
      <Stack.Screen name="ImageSentiment" component={ImageSentimentScreen} />
    </Stack.Navigator>
  );
}