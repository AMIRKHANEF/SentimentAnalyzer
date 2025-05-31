import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock ML sentiment analysis function
// In a real app, you'd integrate with TensorFlow.js or call an API
const analyzeSentiment = async (text: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simple sentiment analysis logic for demo
  const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'excellent', 'wonderful', 'fantastic', 'happy', 'joy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'sad', 'angry', 'disappointed', 'frustrated'];

  const words = text.toLowerCase().split(' ');
  let score = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  if (score > 0) return { sentiment: 'Positive', confidence: Math.min(0.7 + score * 0.1, 0.95), emoji: '😊' };
  if (score < 0) return { sentiment: 'Negative', confidence: Math.min(0.7 + Math.abs(score) * 0.1, 0.95), emoji: '😔' };
  return { sentiment: 'Neutral', confidence: 0.6, emoji: '😐' };
};

interface SentimentCardProps {
  result: SentimentResult;
  fadeAnim: Animated.Value;
} 

const SentimentCard = ({ result, fadeAnim }: SentimentCardProps) => {
  const getSentimentColor = useCallback((sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return ['#4ade80', '#22c55e'];
      case 'Negative': return ['#f87171', '#ef4444'];
      default: return ['#94a3b8', '#64748b'];
    }
  }, []);

  return (
    <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={getSentimentColor(result.sentiment)}
        style={styles.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{result.emoji}</Text>
        <Text style={styles.sentimentText}>{result.sentiment}</Text>
        <Text style={styles.confidenceText}>
          {(result.confidence * 100).toFixed(1)}% confident
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

interface SentimentResult {
  sentiment: string;
  confidence: number;
  emoji: string;
}

export default function App() {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const sentimentResult = await analyzeSentiment(text);
      setResult(sentimentResult);

      // Animate result appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, text]);

  const handleClear = useCallback(() => {
    setText('');
    setResult(null);
    fadeAnim.setValue(0);
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sentiment Analyzer</Text>
            <Text style={styles.subtitle}>Discover the emotion in your text</Text>
          </View>
          {/* Input Section */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message here..."
              placeholderTextColor="#94a3b8"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClear}
                disabled={!text.trim()}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.analyzeButton, !text.trim() && styles.disabledButton]}
                onPress={handleAnalyze}
                disabled={!text.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.analyzeButtonText}>Analyze</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Result Section */}
          {result && (
            <SentimentCard result={result} fadeAnim={fadeAnim} />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  inputSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#3b82f6',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  resultCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientCard: {
    padding: 30,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  sentimentText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});
