import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function IndexScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Sentiment Analyzer</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TextSentiment')}
      >
        <Text style={styles.buttonText}>Text Sentiment Analyzer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ImageSentiment')}
      >
        <Text style={styles.buttonText}>Image Sentiment Analyzer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  title: {
    fontSize: 24,
    marginBottom: 40
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 250,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18
  }
});
